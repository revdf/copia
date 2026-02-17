/**
 * Gerenciador Inteligente de Localização
 * Coordena detecção por IP e GPS, aplica regras de negócio
 */

// Estado global de localização
let localizacaoAtual = null;
let metodoDetecao = null;

/**
 * Processa regras de negócio para localização
 * @param {Object} localizacao - Objeto de localização
 * @returns {Object} Localização processada com regras aplicadas
 */
function processarRegrasNegocio(localizacao) {
    if (!localizacao) {
        return {
            cidade: null,
            estado: null,
            estadoNome: null,
            pais: 'BR',
            paisNome: 'Brasil',
            textoExibicao: 'Brasil',
            usarCapital: false
        };
    }
    
    const { cidade, estado, estadoNome, pais, paisNome } = localizacao;
    
    // REGRA 1: IP fora do Brasil → mostrar "Brasil"
    if (pais && pais.toUpperCase() !== 'BR') {
        return {
            ...localizacao,
            cidade: null,
            estado: null,
            estadoNome: null,
            textoExibicao: 'Brasil',
            usarCapital: false,
            motivo: 'IP internacional'
        };
    }
    
    // REGRA 2: Cidade não detectada mas estado sim → usar capital do estado
    if (!cidade && estado) {
        const capital = obterCapital(estado);
        if (capital) {
            return {
                ...localizacao,
                cidade: capital,
                textoExibicao: `${capital} - ${estado}`,
                usarCapital: true,
                motivo: 'Cidade não detectada, usando capital'
            };
        }
    }
    
    // REGRA 3: Nenhuma informação → mostrar "Brasil"
    if (!cidade && !estado) {
        return {
            ...localizacao,
            textoExibicao: 'Brasil',
            usarCapital: false,
            motivo: 'Localização não detectada'
        };
    }
    
    // REGRA 4: Tudo OK → mostrar "Cidade - Estado"
    const estadoSigla = estado || estadoNome || '';
    return {
        ...localizacao,
        textoExibicao: `${cidade} - ${estadoSigla}`,
        usarCapital: false,
        motivo: 'Localização completa'
    };
}

/**
 * Gerenciador principal de localização
 * Tenta IP primeiro, depois GPS se solicitado
 * @param {boolean} usarGPS - Se true, tenta GPS primeiro
 * @returns {Promise<Object>} Localização processada
 */
async function gerenciadorLocalizacao(usarGPS = false) {
    let localizacao = null;
    
    try {
        if (usarGPS) {
            // Tentar GPS primeiro (alta precisão)
            try {
                localizacao = await detectarPorGPS();
                metodoDetecao = 'gps';
            } catch (error) {
                console.warn('⚠️ GPS falhou, tentando IP...', error);
                // Se GPS falhar, tentar IP
                localizacao = await detectarPorIP();
                if (localizacao.erro) {
                    // Tentar API alternativa
                    localizacao = await detectarPorIPAlternativo();
                }
                metodoDetecao = 'ip_fallback';
            }
        } else {
            // Usar IP (padrão)
            localizacao = await detectarPorIP();
            
            // Se falhar, tentar API alternativa
            if (localizacao.erro || !localizacao.cidade) {
                console.warn('⚠️ API principal falhou, tentando alternativa...');
                const alternativa = await detectarPorIPAlternativo();
                if (!alternativa.erro) {
                    localizacao = alternativa;
                }
            }
            
            metodoDetecao = 'ip';
        }
        
        // Processar regras de negócio
        const localizacaoProcessada = processarRegrasNegocio(localizacao);
        localizacaoAtual = localizacaoProcessada;
        
        console.log('✅ Localização final:', localizacaoProcessada);
        return localizacaoProcessada;
        
    } catch (error) {
        console.error('❌ Erro no gerenciador de localização:', error);
        
        // Fallback final: Brasil
        const fallback = {
            cidade: null,
            estado: null,
            estadoNome: null,
            pais: 'BR',
            paisNome: 'Brasil',
            textoExibicao: 'Brasil',
            usarCapital: false,
            metodo: 'fallback',
            erro: error.message,
            timestamp: new Date().toISOString()
        };
        
        localizacaoAtual = fallback;
        return fallback;
    }
}

/**
 * Obtém localização atual (cache)
 * @returns {Object|null} Localização atual ou null
 */
function obterLocalizacaoAtual() {
    return localizacaoAtual;
}

/**
 * Limpa cache de localização
 */
function limparLocalizacao() {
    localizacaoAtual = null;
    metodoDetecao = null;
}

/**
 * Atualiza indicador visual de localização na página
 * @param {Object} localizacao - Objeto de localização processada
 */
/**
 * Formata o nome da cidade para exibição (converte slug para formato legível)
 * @param {string} cidade - Nome da cidade (pode ser slug ou formato normal)
 * @returns {string} Nome da cidade formatado
 */
function formatarNomeCidade(cidade) {
    if (!cidade) return '';
    
    // Se já estiver formatado (tem espaços e primeira letra maiúscula), retornar como está
    if (cidade.includes(' ') && cidade[0] === cidade[0].toUpperCase()) {
        return cidade;
    }
    
    // Converter slug para formato legível
    return cidade
        .split('-')
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
        .join(' ');
}

function atualizarIndicadorLocalizacao(localizacao) {
    // Atualizar o dropdown "Brasil" em vez do location-indicator
    const dropdownLink = document.querySelector('#brasil-dropdown > a');
    
    if (dropdownLink) {
        if (localizacao && localizacao.cidade) {
            // Se tiver cidade, mostrar cidade formatada
            const cidadeFormatada = formatarNomeCidade(localizacao.cidade);
            dropdownLink.innerHTML = `${cidadeFormatada} <i class="fa-solid fa-caret-down"></i>`;
        } else if (localizacao && localizacao.estadoNome) {
            // Se tiver apenas estado, mostrar estado
            dropdownLink.innerHTML = `${localizacao.estadoNome} <i class="fa-solid fa-caret-down"></i>`;
        } else {
            // Se não tiver localização, mostrar "Brasil"
            dropdownLink.innerHTML = `Brasil <i class="fa-solid fa-caret-down"></i>`;
        }
    }
    
    // Manter o location-indicator oculto (não usado mais)
    const indicador = document.getElementById('location-indicator');
    if (indicador) {
        indicador.style.display = 'none';
    }
}

/**
 * Mostra estado de carregamento
 */
function mostrarCarregandoLocalizacao() {
    // Atualizar dropdown "Brasil" com estado de carregamento
    const dropdownLink = document.querySelector('#brasil-dropdown > a');
    if (dropdownLink) {
        dropdownLink.innerHTML = `Detectando... <i class="fa-solid fa-caret-down"></i>`;
    }
    
    // Manter o location-indicator oculto
    const indicador = document.getElementById('location-indicator');
    if (indicador) {
        indicador.style.display = 'none';
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.processarRegrasNegocio = processarRegrasNegocio;
    window.gerenciadorLocalizacao = gerenciadorLocalizacao;
    window.obterLocalizacaoAtual = obterLocalizacaoAtual;
    window.limparLocalizacao = limparLocalizacao;
    window.atualizarIndicadorLocalizacao = atualizarIndicadorLocalizacao;
    window.mostrarCarregandoLocalizacao = mostrarCarregandoLocalizacao;
}


