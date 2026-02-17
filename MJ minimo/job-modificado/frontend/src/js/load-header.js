/**
 * Script para carregar header reutilizável em todas as páginas
 */

async function loadHeader() {
    try {
        const response = await fetch('templates/header.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const headerHTML = await response.text();
        
        // Procurar header existente para substituir
        const headerPlaceholder = document.getElementById('header-placeholder');
        const existingHeader = document.querySelector('header.main-header, header.header');
        
        if (headerPlaceholder) {
            // Se houver placeholder, substituir
            headerPlaceholder.outerHTML = headerHTML;
            console.log('✅ Header carregado no placeholder');
        } else if (existingHeader) {
            // Substituir header existente
            existingHeader.outerHTML = headerHTML;
            console.log('✅ Header existente substituído');
        } else {
            // Inserir no início do body
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
            console.log('✅ Header inserido no início do body');
        }
        
        // Aguardar um pouco para garantir que o DOM foi atualizado
        setTimeout(() => {
            // Inicializar funcionalidades do header após carregar
            inicializarHeaderFuncionalidades();
        }, 100);
        
    } catch (error) {
        console.error('❌ Erro ao carregar header:', error);
        // Fallback: mostrar header básico se falhar
        const existingHeader = document.querySelector('header.main-header, header.header');
        if (!existingHeader) {
            document.body.insertAdjacentHTML('afterbegin', `
                <header class="main-header">
                    <div class="header-container">
                        <div class="header-left">
                            <h1 class="logo-text">Mansão do Job</h1>
                        </div>
                        <div class="header-right">
                            <a href="premium.html">Anúncios</a>
                        </div>
                    </div>
                </header>
            `);
        }
    }
}

/**
 * Inicializa todas as funcionalidades do header após carregar
 */
function inicializarHeaderFuncionalidades() {
    console.log('🔧 Inicializando funcionalidades do header...');
    
    // PRIMEIRO: Carregar localização escolhida se houver
    if (typeof carregarLocalizacaoEscolhida === 'function') {
        try {
            carregarLocalizacaoEscolhida();
            console.log('✅ Localização escolhida carregada');
        } catch (error) {
            console.warn('⚠️ Erro ao carregar localização escolhida:', error);
        }
    }
    
    // Função para tentar inicializar o dropdown Brasil
    function tryInitializeDropdown() {
        if (typeof inicializarDropdownBrasil === 'function') {
            try {
                inicializarDropdownBrasil();
                console.log('✅ Dropdown Brasil inicializado');
            } catch (error) {
                console.error('❌ Erro ao inicializar dropdown Brasil:', error);
            }
        } else {
            // Tentar novamente após um delay se a função ainda não estiver disponível
            setTimeout(tryInitializeDropdown, 500);
        }
    }
    
    // Função para tentar inicializar a localização
    function tryInitializeLocation() {
        if (typeof inicializarLocalizacao === 'function') {
            try {
                // Só inicializar se não houver localização escolhida
                if (!localStorage.getItem('localizacaoEscolhida')) {
                    inicializarLocalizacao();
                    console.log('✅ Sistema de localização inicializado');
                } else {
                    console.log('✅ Localização escolhida encontrada, pulando detecção automática');
                }
            } catch (error) {
                console.error('❌ Erro ao inicializar localização:', error);
            }
        } else {
            // Tentar novamente após um delay se a função ainda não estiver disponível
            setTimeout(tryInitializeLocation, 500);
        }
    }
    
    // Função para tentar configurar o botão de localização
    function tryConfigureLocationButton() {
        const locationBtn = document.getElementById('locationBtn');
        if (locationBtn && typeof configurarBotaoLocalizacao === 'function') {
            try {
                configurarBotaoLocalizacao();
                console.log('✅ Botão de localização configurado');
            } catch (error) {
                console.error('❌ Erro ao configurar botão de localização:', error);
            }
        } else if (locationBtn) {
            // Tentar novamente após um delay se a função ainda não estiver disponível
            setTimeout(tryConfigureLocationButton, 500);
        }
    }
    
    // Tentar inicializar imediatamente
    tryInitializeDropdown();
    tryInitializeLocation();
    tryConfigureLocationButton();
    
    console.log('✅ Funcionalidades do header inicializadas (ou aguardando scripts)');
}

// Carregar header quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}

