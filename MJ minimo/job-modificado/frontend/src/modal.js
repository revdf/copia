// Get the modal
const modal = document.getElementById('loginModal');

if (modal) {
    // Get the button that closes the modal
    const closeBtn = document.querySelector('.close');

    // When the user clicks on the close button, close the modal
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.classList.remove('show');
        }
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.classList.remove('show');
        }
    }

    // Handle form submission
    const loginForm = document.querySelector('#loginModal form');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            // Add your login logic here
            console.log('Form submitted');
        }
    }

    // Handle social login buttons
    const webauthnBtn = document.querySelector('[role="webauthn_signin"]');
    if (webauthnBtn) {
        webauthnBtn.onclick = function() {
            // Add WebAuthn login logic
            console.log('WebAuthn login clicked');
        }
    }

    const facebookBtn = document.querySelector('[role="facebook_signin"]');
    if (facebookBtn) {
        facebookBtn.onclick = function() {
            // Add Facebook login logic
            console.log('Facebook login clicked');
        }
    }

    const whatsappBtn = document.querySelector('[role="whatsapp_signin"]');
    if (whatsappBtn) {
        whatsappBtn.onclick = function() {
            // Add WhatsApp login logic
            console.log('WhatsApp login clicked');
        }
    }

    const telegramBtn = document.querySelector('[role="telegram_signin"]');
    if (telegramBtn) {
        telegramBtn.onclick = function() {
            // Add Telegram login logic
            console.log('Telegram login clicked');
        }
    }

    const googleSigninLink = document.getElementById('google_signin_link');
    if (googleSigninLink) {
        googleSigninLink.onclick = function(e) {
            e.preventDefault();
            // Add Google login logic
            console.log('Google login clicked');
        }
    }
} 