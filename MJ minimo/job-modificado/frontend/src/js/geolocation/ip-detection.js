/**
 * Detecção de Localização por IP
 * Usa API ipapi.co para detectar localização sem necessidade de permissão
 */

/**
 * Detecta localização usando API por IP
 * @returns {Promise<Object>} Objeto com dados de localização
 */
async function detectarPorIP() {
    try {
        // Usar API ipapi.co (gratuita, sem necessidade de chave)
        const response = await fetch('https://ipapi.co/json/');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Estruturar dados de localização
        const localizacao = {
            cidade: data.city || null,
            estado: data.region_code || data.region || null,
            estadoNome: data.region || null,
            pais: data.country_code || data.country || null,
            paisNome: data.country_name || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            ip: data.ip || null,
            metodo: 'ip',
            timestamp: new Date().toISOString()
        };
        
        console.log('📍 Localização detectada por IP:', localizacao);
        return localizacao;
        
    } catch (error) {
        console.error('❌ Erro ao detectar localização por IP:', error);
        
        // Retornar objeto de fallback
        return {
            cidade: null,
            estado: null,
            estadoNome: null,
            pais: null,
            paisNome: null,
            latitude: null,
            longitude: null,
            ip: null,
            metodo: 'ip',
            erro: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Detecta localização usando API alternativa (fallback)
 * @returns {Promise<Object>} Objeto com dados de localização
 */
async function detectarPorIPAlternativo() {
    try {
        // API alternativa: ip-api.com (sem chave, rate limit: 45 req/min)
        const response = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,lat,lon,query');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'fail') {
            throw new Error(data.message || 'Falha na API');
        }
        
        const localizacao = {
            cidade: data.city || null,
            estado: data.region || null,
            estadoNome: data.regionName || null,
            pais: data.countryCode || null,
            paisNome: data.country || null,
            latitude: data.lat || null,
            longitude: data.lon || null,
            ip: data.query || null,
            metodo: 'ip_alternativo',
            timestamp: new Date().toISOString()
        };
        
        console.log('📍 Localização detectada por IP (alternativo):', localizacao);
        return localizacao;
        
    } catch (error) {
        console.error('❌ Erro ao detectar localização por IP alternativo:', error);
        return {
            cidade: null,
            estado: null,
            estadoNome: null,
            pais: null,
            paisNome: null,
            latitude: null,
            longitude: null,
            ip: null,
            metodo: 'ip_alternativo',
            erro: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.detectarPorIP = detectarPorIP;
    window.detectarPorIPAlternativo = detectarPorIPAlternativo;
}









