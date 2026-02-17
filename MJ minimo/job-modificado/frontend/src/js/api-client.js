/**
 * API Client for Mansão do Job
 * Centralizes all communication with the backend
 */

const API_CONFIG = {
    // Detects if running on localhost or production
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5001/api'
        : '/api', // In production, use relative path (proxy)
    TIMEOUT: 10000
};

class ApiClient {
    constructor() {
        console.log('🚀 API Client initialized', API_CONFIG.BASE_URL);
    }

    /**
     * Generic fetch wrapper with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`❌ Request failed: ${endpoint}`, error);
            throw error;
        }
    }

    /**
     * Fetch all advertisements with optional filters
     * @param {Object} filters - { category, status, city, state }
     */
    async getAnuncios(filters = {}) {
        const queryParams = new URLSearchParams();

        if (filters.category) queryParams.append('categoria', filters.category);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.state) queryParams.append('estado', filters.state);
        if (filters.city) queryParams.append('cidade', filters.city);
        if (filters.limit) queryParams.append('limit', filters.limit);

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return this.request(`/anuncios${queryString}`);
    }

    /**
     * Fetch a single advertisement by ID
     */
    async getAnuncioById(id) {
        return this.request(`/anuncios/${id}`);
    }

    /**
     * Create a new advertisement
     */
    async createAnuncio(data) {
        return this.request('/anuncios', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Upload an image
     * @param {File} file 
     */
    async uploadImage(file) {
        // Convert to base64 for simplicity with the current backend
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const base64Data = reader.result.split(',')[1];
                    const response = await this.request('/upload', {
                        method: 'POST',
                        body: JSON.stringify({
                            fileName: `${Date.now()}_${file.name}`,
                            fileData: base64Data,
                            contentType: file.type
                        })
                    });
                    resolve(response);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = error => reject(error);
        });
    }
}

// Export a singleton instance
const api = new ApiClient();
window.api = api; // Make it available globally for the HTML pages
