/**
 * Proteção de páginas que requerem autenticação
 * Verifica token e redireciona para login se necessário
 */

// Aguardar carregamento do DOM
document.addEventListener('DOMContentLoaded', async function() {
  // Carregar UserService se ainda não estiver disponível
  if (typeof UserService === 'undefined') {
    const script = document.createElement('script');
    script.src = 'js/services/user.service.js';
    document.head.appendChild(script);
    
    script.onload = function() {
      checkAuthentication();
    };
  } else {
    checkAuthentication();
  }
});

async function checkAuthentication() {
  const token = localStorage.getItem('token');

  if (!token) {
    // Sem token, redirecionar para login
    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    return;
  }

  try {
    // Verificar se token é válido
    const result = await UserService.getMe();

    if (result.success && result.user) {
      // Usuário autenticado, mostrar dados
      displayUserInfo(result.user);
    } else {
      // Token inválido, limpar e redirecionar
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    // Em caso de erro, redirecionar para login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  }
}

function displayUserInfo(user) {
  // Atualizar elementos da página com dados do usuário
  const usernameElement = document.getElementById('username');
  if (usernameElement) {
    usernameElement.textContent = user.name || user.email;
  }

  const userEmailElement = document.getElementById('user-email');
  if (userEmailElement) {
    userEmailElement.textContent = user.email;
  }

  // Exemplo: mostrar botão de logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (typeof AuthService !== 'undefined') {
        AuthService.logout();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
      }
    });
  }
}









