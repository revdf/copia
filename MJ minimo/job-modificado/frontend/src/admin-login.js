document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const securityCodeGroup = document.querySelector('.security-code');
    const authenticatorCodeGroup = document.querySelector('.authenticator-code');
    const securityCodeInput = document.getElementById('securityCode');
    const authenticatorCodeInput = document.getElementById('authenticatorCode');
    const rememberCheckbox = document.getElementById('remember');
    let requiresSecurityCode = false;
    let requiresAuthenticatorCode = false;
    let loginAttempts = 0;
    const MAX_ATTEMPTS = 5;
    const BACKEND_URL = 'http://localhost:3000';

    // Verificar se já está logado
    function checkToken() {
        const token = localStorage.getItem('adminToken');
        if (token) {
            // Verificar se o token é válido
            fetch(`${BACKEND_URL}/api/admin/verify-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = 'admin-panel.html';
                } else {
                    localStorage.removeItem('adminToken');
                }
            })
            .catch(error => {
                console.error('Erro ao verificar token:', error);
                localStorage.removeItem('adminToken');
            });
        }
    }

    checkToken();

    loginForm.addEventListener('submit', handleLogin);

    async function handleLogin(e) {
        e.preventDefault();
        console.log('Tentando fazer login...');

        const email = emailInput.value;
        const password = passwordInput.value;
        const securityCode = securityCodeInput.value;
        const authenticatorCode = authenticatorCodeInput.value;

        try {
            console.log('Enviando requisição para:', `${BACKEND_URL}/api/admin/login`);
            const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    securityCode,
                    authenticatorCode
                })
            });

            console.log('Status da resposta:', response.status);
            const data = await response.json();
            console.log('Resposta do servidor:', data);

            if (response.ok) {
                // Login bem-sucedido
                const token = data.token;
                localStorage.setItem('adminToken', token);
                window.location.href = 'admin-panel.html';
            } else {
                // Tratar diferentes tipos de erro
                if (response.status === 401) {
                    showMessage('Credenciais inválidas', 'error');
                    loginAttempts++;
                    if (loginAttempts >= MAX_ATTEMPTS) {
                        disableLoginForm();
                    }
                } else if (response.status === 403) {
                    showMessage('Acesso negado. IP não autorizado.', 'error');
                } else if (response.status === 429) {
                    showMessage('Muitas tentativas. Tente novamente mais tarde.', 'error');
                    disableLoginForm();
                } else {
                    showMessage(data.message || 'Erro ao fazer login', 'error');
                }
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            showMessage('Erro ao conectar com o servidor. Verifique se o servidor está rodando.', 'error');
        }
    }

    function showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Remover mensagens anteriores
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Adicionar nova mensagem
        loginForm.insertBefore(messageDiv, loginForm.firstChild);
        
        // Remover mensagem após 5 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    function disableLoginForm() {
        loginForm.querySelectorAll('input, button').forEach(element => {
            element.disabled = true;
        });
        showMessage('Muitas tentativas falhas. Tente novamente em 15 minutos.', 'error');
        
        // Reativar o formulário após 15 minutos
        setTimeout(() => {
            loginForm.querySelectorAll('input, button').forEach(element => {
                element.disabled = false;
            });
            loginAttempts = 0;
        }, 15 * 60 * 1000);
    }
}); 