// EXEMPLO DE COMO INTEGRAR O OVERLAY NA PÁGINA PREMIUM
// Este arquivo mostra como modificar a página premium.html para abrir o perfil como overlay

// Função para abrir perfil como overlay
function abrirPerfilOverlay(adId) {
  // Criar um iframe para carregar a página de perfil
  const overlay = document.createElement('div');
  overlay.id = 'profile-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  // Criar container do perfil
  const profileContainer = document.createElement('div');
  profileContainer.style.cssText = `
    width: 90%;
    max-width: 1000px;
    height: 90%;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
    transform: scale(0.9);
    transition: transform 0.3s ease;
  `;

  // Criar iframe para carregar o perfil
  const iframe = document.createElement('iframe');
  iframe.src = `perfil-anuncio.html?id=${adId}`;
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 20px;
  `;

  // Botão de fechar
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '<i class="fas fa-times"></i>';
  closeBtn.style.cssText = `
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    z-index: 10;
    transition: all 0.3s ease;
  `;

  closeBtn.onclick = fecharPerfilOverlay;

  // Montar a estrutura
  profileContainer.appendChild(iframe);
  profileContainer.appendChild(closeBtn);
  overlay.appendChild(profileContainer);
  document.body.appendChild(overlay);

  // Animar entrada
  setTimeout(() => {
    overlay.style.opacity = '1';
    profileContainer.style.transform = 'scale(1)';
  }, 10);

  // Fechar ao clicar fora
  overlay.onclick = function(e) {
    if (e.target === overlay) {
      fecharPerfilOverlay();
    }
  };

  // Prevenir scroll do body
  document.body.style.overflow = 'hidden';
}

// Função para fechar o overlay
function fecharPerfilOverlay() {
  const overlay = document.getElementById('profile-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    const profileContainer = overlay.querySelector('div');
    profileContainer.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      document.body.removeChild(overlay);
      document.body.style.overflow = 'auto';
    }, 300);
  }
}

// Função para modificar os links de anúncios na página premium
function modificarLinksAnuncios() {
  // Encontrar todos os links de anúncios
  const anuncioLinks = document.querySelectorAll('a[href*="perfil-anuncio.html"]');
  
  anuncioLinks.forEach(link => {
    link.onclick = function(e) {
      e.preventDefault();
      
      // Extrair ID do anúncio da URL
      const url = new URL(this.href);
      const adId = url.searchParams.get('id');
      
      if (adId) {
        abrirPerfilOverlay(adId);
      }
    };
  });
}

// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  modificarLinksAnuncios();
});

// Navegação com teclado
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    fecharPerfilOverlay();
  }
});

// EXEMPLO DE USO NA PÁGINA PREMIUM:
/*
1. Adicione este script na página premium.html:
   <script src="exemplo-integracao-overlay.js"></script>

2. Modifique os links dos anúncios para apontar para perfil-anuncio.html?id=ID_DO_ANUNCIO

3. O script automaticamente interceptará os cliques e abrirá como overlay

4. O usuário pode fechar com:
   - Botão X no canto superior direito
   - Clicando fora do container
   - Pressionando ESC
*/
