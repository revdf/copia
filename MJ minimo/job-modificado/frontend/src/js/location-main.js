/**
 * Integração Principal do Sistema de Localização
 * Conecta todos os módulos e integra com a interface
 */

// Aguardar carregamento dos scripts
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema de Localização iniciado');
    
    // PRIMEIRO: Carregar localização escolhida pelo usuário (se houver)
    if (typeof carregarLocalizacaoEscolhida === 'function') {
        carregarLocalizacaoEscolhida();
    }
    
    // Inicializar localização por IP ao carregar a página (apenas se não houver escolha do usuário)
    if (!localStorage.getItem('localizacaoEscolhida')) {
        inicializarLocalizacao();
    }
    
    // Configurar botão de localização
    configurarBotaoLocalizacao();
});

/**
 * Inicializa detecção de localização por IP (automático)
 */
async function inicializarLocalizacao() {
    // PRIMEIRO: Verificar se há localização escolhida pelo usuário
    if (typeof carregarLocalizacaoEscolhida === 'function') {
        const localizacaoEscolhida = carregarLocalizacaoEscolhida();
        if (localizacaoEscolhida) {
            console.log('✅ Usando localização escolhida pelo usuário');
            return; // Não detectar automaticamente se o usuário já escolheu
        }
    }
    
    mostrarCarregandoLocalizacao();
    
    // Tentar carregar do cache primeiro
    const localizacaoCache = carregarLocalizacaoCache();
    if (localizacaoCache) {
        atualizarTextoLocalizacao(localizacaoCache);
    }
    
    try {
        const localizacao = await gerenciadorLocalizacao(false); // false = usar IP
        atualizarIndicadorLocalizacao(localizacao);
        atualizarTextoLocalizacao(localizacao);
        
        // Salvar no localStorage para uso posterior (apenas se não houver escolha do usuário)
        if (localizacao && !localStorage.getItem('localizacaoEscolhida')) {
            localStorage.setItem('localizacaoAtual', JSON.stringify(localizacao));
        }
        
    } catch (error) {
        console.error('❌ Erro ao inicializar localização:', error);
        atualizarIndicadorLocalizacao({
            textoExibicao: 'Brasil'
        });
        atualizarTextoLocalizacao(null);
    }
}

/**
 * Configura evento do botão de localização
 */
function configurarBotaoLocalizacao() {
    const locationBtn = document.getElementById('locationBtn');
    
    if (!locationBtn) {
        console.warn('⚠️ Botão de localização não encontrado');
        return;
    }
    
    locationBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('📍 Botão de localização clicado');
        
        // Mostrar estado de carregamento
        mostrarCarregandoLocalizacao();
        
        // Adicionar animação de loading no botão
        const icon = locationBtn.querySelector('i');
        if (icon) {
            icon.classList.add('fa-spin');
        }
        
        try {
            // Tentar GPS (alta precisão)
            const localizacao = await gerenciadorLocalizacao(true); // true = usar GPS
            
            // Salvar como localização escolhida (sobrescreve escolha manual anterior)
            const localizacaoEscolhida = {
                ...localizacao,
                metodo: 'gps',
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('localizacaoEscolhida', JSON.stringify(localizacaoEscolhida));
            
            // Atualizar indicador
            atualizarIndicadorLocalizacao(localizacao);
            
            // Atualizar texto ao lado do botão
            atualizarTextoLocalizacao(localizacao);
            
            // Salvar no localStorage
            if (localizacao) {
                localStorage.setItem('localizacaoAtual', JSON.stringify(localizacao));
                localStorage.setItem('metodoLocalizacao', 'gps');
            }
            
            // Mostrar feedback visual
            mostrarFeedbackLocalizacao('success', 'Localização detectada com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao detectar localização por GPS:', error);
            
            // Se GPS falhar, tentar IP como fallback
            try {
                const localizacaoIP = await gerenciadorLocalizacao(false);
                
                // Salvar como localização escolhida
                const localizacaoEscolhida = {
                    ...localizacaoIP,
                    metodo: 'ip',
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('localizacaoEscolhida', JSON.stringify(localizacaoEscolhida));
                
                atualizarIndicadorLocalizacao(localizacaoIP);
                
                // Atualizar texto ao lado do botão
                atualizarTextoLocalizacao(localizacaoIP);
                
                if (localizacaoIP) {
                    localStorage.setItem('localizacaoAtual', JSON.stringify(localizacaoIP));
                    localStorage.setItem('metodoLocalizacao', 'ip');
                }
                
                mostrarFeedbackLocalizacao('warning', 'Usando localização aproximada por IP');
                
            } catch (errorIP) {
                console.error('❌ Erro ao detectar por IP:', errorIP);
                mostrarFeedbackLocalizacao('error', 'Não foi possível detectar localização');
                atualizarTextoLocalizacao(null);
            }
        } finally {
            // Remover animação de loading
            if (icon) {
                icon.classList.remove('fa-spin');
            }
        }
    });
}

/**
 * Atualiza o texto de localização ao lado do botão
 * @param {Object} localizacao - Objeto de localização
 * NOTA: O texto não é mais exibido ao lado do botão, apenas no dropdown "Brasil"
 */
function atualizarTextoLocalizacao(localizacao) {
    const locationText = document.getElementById('locationText');
    if (!locationText) return;
    
    // Sempre ocultar o texto ao lado do botão
    // A localização será exibida apenas no dropdown "Brasil"
    locationText.style.display = 'none';
}

/**
 * Mostra feedback visual ao usuário
 * @param {string} tipo - 'success', 'warning', 'error'
 * @param {string} mensagem - Mensagem a exibir
 */
function mostrarFeedbackLocalizacao(tipo, mensagem) {
    // Criar ou atualizar elemento de feedback
    let feedback = document.getElementById('location-feedback');
    
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'location-feedback';
        feedback.className = 'location-feedback';
        document.body.appendChild(feedback);
    }
    
    // Configurar classe e mensagem
    feedback.className = `location-feedback location-feedback-${tipo}`;
    feedback.textContent = mensagem;
    feedback.style.display = 'block';
    
    // Ocultar após 3 segundos
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 3000);
}

/**
 * Carrega localização do localStorage se disponível
 */
function carregarLocalizacaoCache() {
    try {
        const localizacaoSalva = localStorage.getItem('localizacaoAtual');
        if (localizacaoSalva) {
            const localizacao = JSON.parse(localizacaoSalva);
            atualizarIndicadorLocalizacao(localizacao);
            return localizacao;
        }
    } catch (error) {
        console.warn('⚠️ Erro ao carregar localização do cache:', error);
    }
    return null;
}

// Exportar funções globais
if (typeof window !== 'undefined') {
    window.inicializarLocalizacao = inicializarLocalizacao;
    window.configurarBotaoLocalizacao = configurarBotaoLocalizacao;
    window.mostrarFeedbackLocalizacao = mostrarFeedbackLocalizacao;
    window.carregarLocalizacaoCache = carregarLocalizacaoCache;
    window.atualizarTextoLocalizacao = atualizarTextoLocalizacao;
}

