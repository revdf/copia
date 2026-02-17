/**
 * Serviço de Usuário - Frontend
 * Consome a API /api/users para dados do usuário autenticado
 */

const UserService = {
  /**
   * Obtém dados do usuário autenticado
   * @returns {Promise<Object>} { success, user }
   */
  async getMe() {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        return {
          success: false,
          error: 'Token não encontrado'
        };
      }

      const res = await fetch('/api/users/me', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success && data.user) {
        // Atualizar usuário no localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      return {
        success: false,
        error: 'Erro ao conectar com o servidor'
      };
    }
  }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.UserService = UserService;
}

export default UserService;









