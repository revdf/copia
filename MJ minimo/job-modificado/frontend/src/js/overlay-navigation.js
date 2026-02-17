// Sistema de Navegação com Overlay
// Este arquivo deve ser incluído na página anterior (A_02__premium_trans_copy.html)

// Função para capturar screenshot da página atual
function capturePageScreenshot() {
    try {
        console.log("📸 Capturando screenshot da página atual...");
        
        // Usar html2canvas para capturar a página
        if (typeof html2canvas !== 'undefined') {
            html2canvas(document.body, {
                allowTaint: true,
                useCORS: true,
                scale: 0.5, // Reduzir qualidade para economizar espaço
                logging: false
            }).then(function(canvas) {
                // Converter para base64
                const screenshot = canvas.toDataURL('image/jpeg', 0.7);
                
                // Salvar no localStorage
                localStorage.setItem('previousPageScreenshot', screenshot);
                localStorage.setItem('returnUrl', window.location.href);
                localStorage.setItem('returnScroll', window.pageYOffset.toString());
                
                console.log("✅ Screenshot capturado e salvo!");
                console.log("📍 URL de retorno:", window.location.href);
                console.log("📍 Posição do scroll:", window.pageYOffset);
            }).catch(function(error) {
                console.error("❌ Erro ao capturar screenshot:", error);
                // Fallback: salvar apenas URL e scroll
                localStorage.setItem('returnUrl', window.location.href);
                localStorage.setItem('returnScroll', window.pageYOffset.toString());
            });
        } else {
            console.warn("⚠️ html2canvas não disponível, salvando apenas URL e scroll");
            // Fallback: salvar apenas URL e scroll
            localStorage.setItem('returnUrl', window.location.href);
            localStorage.setItem('returnScroll', window.pageYOffset.toString());
        }
    } catch (error) {
        console.error("❌ Erro ao capturar screenshot:", error);
    }
}

// Função para navegar para o overlay
function navigateToOverlay(overlayUrl) {
    try {
        console.log("🚀 Navegando para overlay:", overlayUrl);
        
        // Capturar screenshot antes de navegar
        capturePageScreenshot();
        
        // Pequeno delay para garantir que o screenshot foi salvo
        setTimeout(function() {
            window.location.href = overlayUrl;
        }, 100);
        
    } catch (error) {
        console.error("❌ Erro ao navegar para overlay:", error);
        // Fallback: navegação normal
        window.location.href = overlayUrl;
    }
}

// Função para restaurar posição do scroll ao retornar
function restoreScrollPosition() {
    try {
        const savedScroll = localStorage.getItem('returnScroll');
        if (savedScroll) {
            console.log("📍 Restaurando posição do scroll:", savedScroll);
            window.scrollTo(0, parseInt(savedScroll));
        }
    } catch (error) {
        console.error("❌ Erro ao restaurar posição do scroll:", error);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔥 Sistema de overlay carregado");
    
    // Restaurar posição do scroll se retornou de um overlay
    if (localStorage.getItem('returnScroll')) {
        restoreScrollPosition();
        // Limpar dados após restaurar
        localStorage.removeItem('returnScroll');
    }
    
    // Adicionar evento de clique em links de anúncios
    const anuncioLinks = document.querySelectorAll('a[href*="A_02__premium_Anuncio_modelo_02.html"]');
    anuncioLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const overlayUrl = this.href;
            navigateToOverlay(overlayUrl);
        });
    });
    
    console.log("✅ Eventos de navegação configurados para", anuncioLinks.length, "links");
});

// Função para adicionar link de anúncio dinamicamente
function addAnuncioLink(element, overlayUrl) {
    if (element && overlayUrl) {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToOverlay(overlayUrl);
        });
        console.log("✅ Link de anúncio adicionado:", overlayUrl);
    }
}



