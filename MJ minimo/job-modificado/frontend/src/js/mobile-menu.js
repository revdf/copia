// Mobile Menu Controller
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    // Verificar se os elementos existem antes de adicionar listeners
    if (!mobileMenuToggle || !mobileMenu) {
        // Elementos não existem nesta página, sair silenciosamente
        return;
    }
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('show');
            
            // Toggle icon between hamburger and X
            const icon = mobileMenuToggle.querySelector('i');
            if (mobileMenu.classList.contains('show')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.remove('show');
                const icon = mobileMenuToggle.querySelector('i');
                icon.className = 'fas fa-bars';
            }
        });
        
        // Close menu when window is resized to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                mobileMenu.classList.remove('show');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
            }
        });
    }
});

