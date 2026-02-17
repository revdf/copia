/**
 * Serviço de Autenticação - Frontend
 * Consome a API /api/auth para login e registro
 */

const AuthService = {
  /**
   * Realiza login
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} { success, user, token }
   */
  async login(email, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success && data.token) {
        // Salvar token no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return {
        success: false,
        error: 'Erro ao conectar com o servidor'
      };
    }
  },

  /**
   * Realiza registro de novo usuário
   * @param {Object} payload - Dados do usuário { email, password, name, ... }
   * @returns {Promise<Object>} { success, user }
   */
  async register(payload) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.user) {
        // Opcional: fazer login automático após registro
        // await this.login(payload.email, payload.password);
      }

      return data;
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      return {
        success: false,
        error: 'Erro ao conectar com o servidor'
      };
    }
  },

  /**
   * Obtém token do localStorage
   * @returns {string|null} Token ou null
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Obtém usuário do localStorage
   * @returns {Object|null} Usuário ou null
   */
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Verifica se usuário está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Realiza logout
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.AuthService = AuthService;
}

export default AuthService;









