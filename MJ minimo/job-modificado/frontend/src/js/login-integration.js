/**
 * Exemplo de integração do formulário de login com AuthService
 * Use este código como referência para integrar em suas páginas HTML
 */

// Aguardar carregamento do DOM e do AuthService
document.addEventListener('DOMContentLoaded', function() {
  // Carregar AuthService se ainda não estiver disponível
  if (typeof AuthService === 'undefined') {
    const script = document.createElement('script');
    script.src = 'js/services/auth.service.js';
    document.head.appendChild(script);
    
    script.onload = function() {
      initializeLogin();
    };
  } else {
    initializeLogin();
  }
});

function initializeLogin() {
  const loginForm = document.getElementById('loginForm');
  
  if (!loginForm) {
    console.warn('⚠️ Formulário de login não encontrado');
    return;
  }

  // Interceptar submit do formulário
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevenir submit tradicional

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');
    const loadingDiv = document.getElementById('loading');

    // Mostrar loading
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (errorDiv) errorDiv.style.display = 'none';

    try {
      // Usar AuthService para fazer login
      const result = await AuthService.login(email, password);

      if (result.success) {
        // Login bem-sucedido
        console.log('✅ Login realizado com sucesso:', result.user);
        
        // Redirecionar para home ou dashboard
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/home.html';
        window.location.href = redirectUrl;
      } else {
        // Mostrar erro
        if (errorDiv) {
          errorDiv.textContent = result.error || 'Falha ao fazer login';
          errorDiv.style.display = 'block';
        } else {
          alert(result.error || 'Falha ao fazer login');
        }
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      if (errorDiv) {
        errorDiv.textContent = 'Erro ao conectar com o servidor';
        errorDiv.style.display = 'block';
      } else {
        alert('Erro ao conectar com o servidor');
      }
    } finally {
      if (loadingDiv) loadingDiv.style.display = 'none';
    }
  });
}









