// ============================================
// Admin Login - Firebase Auth Direto (Fase 1)
// Sem dependência de backend localhost:3000
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    let loginAttempts = 0;
    const MAX_ATTEMPTS = 5;

    // Inicializar Firebase
    let auth = null;
    let db = null;

    try {
        if (typeof firebase !== 'undefined') {
            // Verificar se já foi inicializado
            try {
                auth = firebase.auth();
                db = firebase.firestore();
            } catch (e) {
                if (window.firebaseConfig) {
                    firebase.initializeApp(window.firebaseConfig);
                }
                auth = firebase.auth();
                db = firebase.firestore();
            }
            console.log('✅ Firebase inicializado para admin-login');
        } else {
            console.error('❌ Firebase SDK não encontrado');
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
    }

    // Verificar se já está logado como admin
    if (auth) {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Verificar se é admin
                const isAdmin = await checkIfAdmin(user.uid);
                if (isAdmin) {
                    console.log('✅ Usuário já logado como admin, redirecionando...');
                    window.location.href = 'admin-panel.html';
                }
            }
        });
    }

    // Event listener do formulário
    loginForm.addEventListener('submit', handleLogin);

    async function handleLogin(e) {
        e.preventDefault();

        // Verificar bloqueio por tentativas
        if (loginAttempts >= MAX_ATTEMPTS) {
            showMessage('Muitas tentativas falhas. Tente novamente em 15 minutos.', 'error');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }

        if (!auth || !db) {
            showMessage('Erro: Firebase não inicializado. Recarregue a página.', 'error');
            return;
        }

        // Desabilitar botão durante o login
        const submitBtn = loginForm.querySelector('.login-button');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
        submitBtn.disabled = true;

        try {
            console.log('🔐 Tentando login com Firebase Auth para:', email);

            // 1. Autenticar com Firebase Auth
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            console.log('✅ Login Firebase bem-sucedido:', user.email);

            // 2. Verificar se o usuário é admin na collection 'advertisers'
            const isAdmin = await checkIfAdmin(user.uid);

            if (!isAdmin) {
                // Não é admin - fazer logout e bloquear
                await auth.signOut();
                loginAttempts++;
                showMessage('Acesso negado. Apenas administradores podem acessar este painel.', 'error');
                console.warn('🚫 Usuário não é admin:', email);

                if (loginAttempts >= MAX_ATTEMPTS) {
                    disableLoginForm();
                }
                return;
            }

            // 3. É admin! Redirecionar para o painel
            console.log('✅ Usuário verificado como admin. Redirecionando...');
            showMessage('Login bem-sucedido! Redirecionando...', 'success');

            setTimeout(() => {
                window.location.href = 'admin-panel.html';
            }, 1000);

        } catch (error) {
            console.error('❌ Erro no login:', error.code, error.message);
            loginAttempts++;

            let errorMessage = 'Erro ao fazer login.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Email ou senha inválidos.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Formato de email inválido.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Esta conta foi desativada.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
                    disableLoginForm();
                    break;
                default:
                    errorMessage = 'Erro ao fazer login: ' + error.message;
            }

            showMessage(errorMessage, 'error');

            if (loginAttempts >= MAX_ATTEMPTS) {
                disableLoginForm();
            }
        } finally {
            // Restaurar botão
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    }

    // Verificar se o usuário tem role "admin" na collection 'advertisers'
    async function checkIfAdmin(uid) {
        try {
            const userDoc = await db.collection('advertisers').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                return userData.role === 'admin';
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao verificar permissão de admin:', error);
            return false;
        }
    }

    function showMessage(message, type = 'info') {
        // Remover mensagens anteriores
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Estilo inline para garantir visibilidade
        messageDiv.style.padding = '12px 16px';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.marginBottom = '16px';
        messageDiv.style.fontWeight = '500';
        messageDiv.style.textAlign = 'center';

        if (type === 'error') {
            messageDiv.style.background = '#ffe0e0';
            messageDiv.style.color = '#c62828';
            messageDiv.style.border = '1px solid #ef9a9a';
        } else if (type === 'success') {
            messageDiv.style.background = '#e0f7e0';
            messageDiv.style.color = '#2e7d32';
            messageDiv.style.border = '1px solid #a5d6a7';
        } else {
            messageDiv.style.background = '#e3f2fd';
            messageDiv.style.color = '#1565c0';
            messageDiv.style.border = '1px solid #90caf9';
        }

        loginForm.insertBefore(messageDiv, loginForm.firstChild);

        // Remover mensagem após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
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
            showMessage('Formulário reativado. Tente novamente.', 'info');
        }, 15 * 60 * 1000);
    }
});
