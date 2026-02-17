/**
 * Sistema de Filtro por Estado
 * Filtra anúncios por estado brasileiro
 * Por padrão mostra todos os anúncios de forma aleatória
 */

// Estado atual do filtro
let filtroEstadoAtual = {
    estado: null, // null = Brasil (todos), ou sigla do estado
    aplicado: false
};

// Fila de filtros pendentes (para aplicar quando dados estiverem carregados)
let filtroPendente = null;

// Flag para prevenir múltiplas chamadas simultâneas
let aplicandoFiltro = false;

/**
 * Embaralha array aleatoriamente (Fisher-Yates)
 * @param {Array} array - Array a ser embaralhado
 * @returns {Array} Array embaralhado
 */
function embaralharArray(array) {
    const novoArray = [...array];
    for (let i = novoArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [novoArray[i], novoArray[j]] = [novoArray[j], novoArray[i]];
    }
    return novoArray;
}

/**
 * Normaliza estado para sigla (aceita tanto sigla quanto nome completo)
 * @param {string} estado - Estado (sigla ou nome completo)
 * @returns {string} Sigla do estado normalizada
 */
function normalizarEstadoParaSigla(estado) {
    if (!estado) return '';
    
    const estadoUpper = estado.toUpperCase().trim();
    
    // Mapa de nomes completos para siglas
    const mapaEstados = {
        'DISTRITO FEDERAL': 'DF',
        'GOIÁS': 'GO',
        'GOIAS': 'GO',
        'SÃO PAULO': 'SP',
        'SAO PAULO': 'SP',
        'RIO DE JANEIRO': 'RJ',
        'MINAS GERAIS': 'MG',
        'ESPÍRITO SANTO': 'ES',
        'ESPIRITO SANTO': 'ES',
        'PARANÁ': 'PR',
        'PARANA': 'PR',
        'SANTA CATARINA': 'SC',
        'RIO GRANDE DO SUL': 'RS',
        'MATO GROSSO': 'MT',
        'MATO GROSSO DO SUL': 'MS',
        'BAHIA': 'BA',
        'CEARÁ': 'CE',
        'CEARA': 'CE',
        'PERNAMBUCO': 'PE',
        'PARÁ': 'PA',
        'PARA': 'PA',
        'MARANHÃO': 'MA',
        'MARANHAO': 'MA',
        'AMAZONAS': 'AM',
        'ACRE': 'AC',
        'RONDÔNIA': 'RO',
        'RONDONIA': 'RO',
        'RORAIMA': 'RR',
        'AMAPÁ': 'AP',
        'AMAPA': 'AP',
        'TOCANTINS': 'TO',
        'PIAUÍ': 'PI',
        'PIAUI': 'PI',
        'SERGIPE': 'SE',
        'ALAGOAS': 'AL',
        'RIO GRANDE DO NORTE': 'RN',
        'PARAÍBA': 'PB',
        'PARAIBA': 'PB'
    };
    
    // Se já for sigla (2 letras), retornar
    if (estadoUpper.length === 2 && /^[A-Z]{2}$/.test(estadoUpper)) {
        return estadoUpper;
    }
    
    // Tentar encontrar no mapa
    if (mapaEstados[estadoUpper]) {
        return mapaEstados[estadoUpper];
    }
    
    // Se não encontrou, retornar o estado original (pode ser sigla ou nome)
    return estadoUpper;
}

/**
 * Filtra PROFILES_DATA por estado
 * @param {string|null} estadoSigla - Sigla do estado ou null para todos
 * @returns {Array} Array de anúncios filtrados
 */
function filtrarAnunciosPorEstado(estadoSigla) {
    // SEMPRE usar PROFILES_DATA_ORIGINAL como fonte para filtrar
    // Se não existir backup, usar window.PROFILES_DATA como fallback
    const dadosOriginais = (PROFILES_DATA_ORIGINAL && PROFILES_DATA_ORIGINAL.length > 0) 
        ? PROFILES_DATA_ORIGINAL 
        : (window.PROFILES_DATA && window.PROFILES_DATA.length > 0 ? window.PROFILES_DATA : []);
    
    if (!dadosOriginais || dadosOriginais.length === 0) {
        console.warn('⚠️ PROFILES_DATA não está disponível');
        return [];
    }
    
    let anunciosFiltrados = dadosOriginais;
    
    // Se estadoSigla for null ou 'BR' ou 'Brasil', mostrar todos (restaurar original)
    if (!estadoSigla || estadoSigla === 'BR' || estadoSigla === 'Brasil') {
        // Restaurar todos os anúncios do backup original
        anunciosFiltrados = [...dadosOriginais];
        console.log(`🌎 Mostrando todos os anúncios do Brasil: ${anunciosFiltrados.length} anúncios`);
    } else {
        console.log(`🔍 Filtrando por estado: ${estadoSigla}`);
        console.log(`📊 Total de anúncios antes do filtro: ${dadosOriginais.length}`);
        
        // Normalizar estado do filtro para sigla
        const estadoFiltroNormalizado = normalizarEstadoParaSigla(estadoSigla);
        console.log(`🔍 Estado do filtro normalizado: ${estadoFiltroNormalizado}`);
        
        // Debug: mostrar todos os estados disponíveis nos anúncios
        const estadosEncontrados = dadosOriginais.map(a => {
            const estadoRaw = a.estado || a.state || a.originalData?.estado || a.originalData?.state || 'N/A';
            const estadoNormalizado = normalizarEstadoParaSigla(estadoRaw);
            return {
                raw: estadoRaw,
                normalizado: estadoNormalizado,
                nome: a.nome || a.name
            };
        });
        
        console.log(`📋 Estados encontrados nos anúncios:`, estadosEncontrados);
        console.log(`📋 Detalhes dos estados:`, estadosEncontrados.map(e => `${e.nome}: "${e.raw}" → "${e.normalizado}"`));
        
        anunciosFiltrados = dadosOriginais.filter(anuncio => {
            // Normalizar estado do anúncio - tentar múltiplas fontes
            const estadoAnuncioRaw = (
                anuncio.estado || 
                anuncio.state || 
                anuncio.originalData?.estado || 
                anuncio.originalData?.state || 
                ''
            );
            
            // Normalizar para sigla
            const estadoAnuncioNormalizado = normalizarEstadoParaSigla(estadoAnuncioRaw);
            
            // Comparar siglas normalizadas
            const match = estadoAnuncioNormalizado === estadoFiltroNormalizado;
            
            if (match) {
                console.log(`✅ Match encontrado: ${anuncio.nome || anuncio.name} - Estado Raw: "${estadoAnuncioRaw}" → Normalizado: "${estadoAnuncioNormalizado}"`);
            }
            
            return match;
        });
        
        console.log(`🔍 Filtrado por estado ${estadoSigla} (${estadoFiltroNormalizado}): ${anunciosFiltrados.length} de ${dadosOriginais.length} anúncios`);
        
        if (anunciosFiltrados.length === 0) {
            console.warn(`⚠️ Nenhum anúncio encontrado para o estado ${estadoSigla} (${estadoFiltroNormalizado})`);
            const estadosUnicos = [...new Set(estadosEncontrados.map(e => `${e.normalizado} (${e.raw})`))];
            console.warn(`⚠️ Estados disponíveis nos anúncios:`, estadosUnicos);
        }
    }
    
    // Embaralhar aleatoriamente
    anunciosFiltrados = embaralharArray(anunciosFiltrados);
    
    return anunciosFiltrados;
}

// Backup do PROFILES_DATA original
let PROFILES_DATA_ORIGINAL = null;

/**
 * Aplica filtro de estado e atualiza a exibição
 * @param {string|null} estadoSigla - Sigla do estado ou null para todos
 * @param {string} estadoNome - Nome do estado (opcional)
 */
function aplicarFiltroEstado(estadoSigla, estadoNome = null) {
    console.log(`📍 Aplicando filtro de estado: ${estadoSigla || 'Brasil (todos)'}`);
    
    // Prevenir múltiplas chamadas simultâneas
    if (aplicandoFiltro) {
        console.warn('⚠️ Filtro já está sendo aplicado, ignorando chamada duplicada');
        return;
    }
    
    // Se for página home, não aplicar filtro - sempre mostrar todos
    if (isHomePage()) {
        console.log('🏠 Página home - filtro ignorado, mostrando todos os anúncios');
        // Garantir que está mostrando todos
        if (PROFILES_DATA_ORIGINAL && PROFILES_DATA_ORIGINAL.length > 0) {
            window.PROFILES_DATA = [...PROFILES_DATA_ORIGINAL];
        }
        return;
    }
    
    // Verificar se PROFILES_DATA existe (usar original ou window)
    const dadosDisponiveis = (PROFILES_DATA_ORIGINAL && PROFILES_DATA_ORIGINAL.length > 0) 
        ? PROFILES_DATA_ORIGINAL 
        : (window.PROFILES_DATA && window.PROFILES_DATA.length > 0 ? window.PROFILES_DATA : null);
    
    if (!dadosDisponiveis || dadosDisponiveis.length === 0) {
        console.warn('⚠️ PROFILES_DATA não está disponível ainda. Filtro será aplicado quando os dados forem carregados.');
        // Salvar filtro pendente para aplicar quando dados estiverem prontos
        filtroPendente = { estadoSigla, estadoNome };
        return;
    }
    
    // Marcar que está aplicando filtro
    aplicandoFiltro = true;
    
    // Fazer backup do original se ainda não foi feito
    // IMPORTANTE: Usar window.PROFILES_DATA apenas se não houver backup ainda
    // Se já houver backup, significa que já filtramos antes, então não devemos sobrescrever
    if (!PROFILES_DATA_ORIGINAL) {
        // Usar window.PROFILES_DATA como fonte inicial
        if (window.PROFILES_DATA && window.PROFILES_DATA.length > 0) {
            PROFILES_DATA_ORIGINAL = [...window.PROFILES_DATA];
            console.log(`💾 Backup do PROFILES_DATA original salvo: ${PROFILES_DATA_ORIGINAL.length} anúncios`);
        } else {
            console.warn('⚠️ Não foi possível fazer backup: window.PROFILES_DATA está vazio');
        }
    } else {
        console.log(`💾 Usando backup existente: ${PROFILES_DATA_ORIGINAL.length} anúncios`);
    }
    
    // Atualizar estado global
    filtroEstadoAtual = {
        estado: estadoSigla,
        aplicado: true
    };
    
    // Salvar no localStorage
    localStorage.setItem('filtroEstado', JSON.stringify(filtroEstadoAtual));
    
    // Filtrar anúncios
    const anunciosFiltrados = filtrarAnunciosPorEstado(estadoSigla);
    
    console.log(`📊 Anúncios filtrados:`, {
        totalOriginal: PROFILES_DATA_ORIGINAL.length,
        filtrados: anunciosFiltrados.length,
        estado: estadoSigla || 'Brasil (todos)',
        detalhes: anunciosFiltrados.map(a => ({
            nome: a.nome || a.name,
            estado: a.estado || a.state || a.originalData?.estado || a.originalData?.state
        }))
    });
    
    // SUBSTITUIR PROFILES_DATA temporariamente com os dados filtrados
    // Isso faz com que as funções de renderização existentes funcionem automaticamente
    window.PROFILES_DATA = anunciosFiltrados;
    window.PROFILES_DATA_FILTRADO = anunciosFiltrados;
    
    // IMPORTANTE: Também atualizar a variável local PROFILES_DATA se existir
    // Isso garante que generateTieredGrid() use os dados filtrados
    if (typeof PROFILES_DATA !== 'undefined') {
        // Criar uma referência que aponta para window.PROFILES_DATA
        // Mas como não podemos reatribuir let, vamos garantir que a função use window.PROFILES_DATA
        console.log('🔄 window.PROFILES_DATA atualizado com dados filtrados');
    }
    
    // Disparar evento para re-renderização
    window.dispatchEvent(new CustomEvent('anunciosFiltradosPorEstado', {
        detail: {
            anuncios: anunciosFiltrados,
            estado: estadoSigla,
            estadoNome: estadoNome,
            total: anunciosFiltrados.length
        }
    }));
    
    // Forçar atualização imediata da variável local PROFILES_DATA se possível
    // Tentar atualizar via eval (último recurso) ou criar getter
    try {
        // Se PROFILES_DATA for uma variável no escopo global, tentar atualizar
        if (typeof PROFILES_DATA !== 'undefined') {
            // Não podemos reatribuir let diretamente, mas podemos criar um proxy
            console.log('⚠️ PROFILES_DATA é variável local, usando window.PROFILES_DATA para filtro');
        }
    } catch (e) {
        console.warn('Não foi possível atualizar PROFILES_DATA local:', e);
    }
    
    // Se não houver resultados e não for "Brasil (todos)", avisar mas não resetar automaticamente
    // (o usuário pode querer ver que não há anúncios para aquele estado)
    if (anunciosFiltrados.length === 0 && estadoSigla && estadoSigla !== 'BR' && estadoSigla !== 'Brasil') {
        console.warn(`⚠️ Nenhum anúncio encontrado para ${estadoNome || estadoSigla}. Mantendo filtro ativo.`);
    }
    
    // Tentar atualizar a UI automaticamente
    atualizarUIComFiltro(anunciosFiltrados, estadoSigla, estadoNome);
    
    console.log(`✅ Filtro aplicado: ${anunciosFiltrados.length} anúncios exibidos`);
    console.log(`📊 window.PROFILES_DATA.length: ${window.PROFILES_DATA.length}`);
    
    // Liberar flag
    aplicandoFiltro = false;
    
    // Limpar filtro pendente se existir
    filtroPendente = null;
}

/**
 * Atualiza a UI com os anúncios filtrados
 * @param {Array} anuncios - Array de anúncios filtrados
 * @param {string|null} estadoSigla - Sigla do estado
 * @param {string} estadoNome - Nome do estado
 */
function atualizarUIComFiltro(anuncios, estadoSigla, estadoNome) {
    console.log(`🎨 Atualizando UI com ${anuncios.length} anúncios`);
    
    // Procurar funções de renderização existentes (em ordem de prioridade)
    const funcoesRenderizacao = [
        'generateTieredGrid',      // Função principal de renderização desktop
        'handleManualLayoutSwitch', // Função de renderização mobile
        'renderizarAnuncios',
        'atualizarGridAnuncios',
        'renderProfiles',
        'updateGallery'
    ];
    
    let renderizado = false;
    
    for (const funcaoNome of funcoesRenderizacao) {
        if (typeof window[funcaoNome] === 'function') {
            try {
                console.log(`🎨 Chamando função de renderização: ${funcaoNome}`);
                
                // Se for handleManualLayoutSwitch, precisa do parâmetro level
                if (funcaoNome === 'handleManualLayoutSwitch') {
                    // Tentar obter o level atual ou usar padrão
                    const currentLevel = window.currentLayoutLevel || 'n7';
                    window[funcaoNome](currentLevel);
                } else {
                    window[funcaoNome]();
                }
                
                renderizado = true;
                console.log(`✅ Renderização concluída via ${funcaoNome}`);
                break;
            } catch (error) {
                console.warn(`⚠️ Erro ao chamar ${funcaoNome}:`, error);
            }
        }
    }
    
    // Se não encontrou função específica, tentar atualizar containers diretamente
    if (!renderizado) {
        console.warn('⚠️ Nenhuma função de renderização encontrada, usando fallback');
        atualizarContainersDiretamente(anuncios);
    }
    
    // Atualizar contador se existir
    atualizarContadorAnuncios(anuncios.length, estadoNome || 'Brasil');
}

/**
 * Atualiza containers diretamente (fallback)
 * @param {Array} anuncios - Array de anúncios
 */
function atualizarContainersDiretamente(anuncios) {
    const containers = [
        document.querySelector('#gallery-grid'),
        document.querySelector('.ads-grid'),
        document.querySelector('.anuncios-grid'),
        document.querySelector('#anuncios-container'),
        document.querySelector('.grid-anuncios'),
        document.querySelector('#profiles-container'),
        document.querySelector('.profiles-grid')
    ];
    
    const container = containers.find(el => el !== null);
    
    if (!container) {
        console.warn('⚠️ Nenhum container de anúncios encontrado para atualizar');
        return;
    }
    
    console.log(`📦 Atualizando container: ${container.id || container.className}`);
    
    // Disparar evento para que a página atualize
    window.dispatchEvent(new CustomEvent('forceUpdateAnuncios'));
}

/**
 * Atualiza contador de anúncios na UI
 * @param {number} total - Total de anúncios
 * @param {string} localizacao - Nome da localização
 */
function atualizarContadorAnuncios(total, localizacao) {
    console.log(`📊 Atualizando contador: ${total} anúncios em ${localizacao}`);
    
    // Procurar ou criar elemento de contador
    let contadorEl = document.getElementById('anuncios-count-estado');
    if (!contadorEl) {
        contadorEl = document.createElement('div');
        contadorEl.id = 'anuncios-count-estado';
        contadorEl.style.cssText = 'text-align: center; padding: 15px; background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); margin: 20px 0; border-radius: 8px; font-weight: 600; color: #333; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);';
        
        const container = document.querySelector('#gallery-grid, .ads-grid, .anuncios-grid, #anuncios-container');
        if (container && container.parentNode) {
            container.parentNode.insertBefore(contadorEl, container);
        }
    }
    
    contadorEl.textContent = `${total} anúncio${total !== 1 ? 's' : ''} em ${localizacao}`;
    console.log(`✅ Contador atualizado: "${contadorEl.textContent}"`);
}

/**
 * Limpa filtro e mostra todos os anúncios
 */
function limparFiltroEstado() {
    console.log('🗑️ Limpando filtro de estado, mostrando todos os anúncios');
    
    // Restaurar PROFILES_DATA original
    if (PROFILES_DATA_ORIGINAL && PROFILES_DATA_ORIGINAL.length > 0) {
        window.PROFILES_DATA = [...PROFILES_DATA_ORIGINAL];
        console.log(`🔄 PROFILES_DATA restaurado: ${window.PROFILES_DATA.length} anúncios`);
    }
    
    aplicarFiltroEstado(null, 'Brasil');
}

/**
 * Carrega filtro salvo do localStorage
 */
function carregarFiltroSalvo() {
    try {
        const filtroSalvo = localStorage.getItem('filtroEstado');
        if (filtroSalvo) {
            const filtro = JSON.parse(filtroSalvo);
            if (filtro.estado && filtro.aplicado) {
                // Buscar nome do estado
                let estadoNome = 'Brasil';
                if (typeof obterEstados === 'function') {
                    const estados = obterEstados();
                    const estadoObj = estados.find(e => e.sigla === filtro.estado);
                    if (estadoObj) {
                        estadoNome = estadoObj.nome;
                    }
                }
                
                console.log(`📂 Carregando filtro salvo: ${estadoNome} (${filtro.estado})`);
                aplicarFiltroEstado(filtro.estado, estadoNome);
                return true;
            }
        }
    } catch (error) {
        console.warn('⚠️ Erro ao carregar filtro salvo:', error);
    }
    
    // Por padrão, mostrar todos os anúncios aleatoriamente
    return false;
}

// Escutar eventos de anúncios filtrados
window.addEventListener('anunciosFiltradosPorEstado', function(event) {
    console.log('📢 Evento de anúncios filtrados recebido:', event.detail);
});

// Escutar quando PROFILES_DATA for carregado (evento customizado)
window.addEventListener('profilesDataLoaded', function(event) {
    console.log('📢 Evento profilesDataLoaded recebido');
    verificarProfilesData();
});

// Escutar quando PROFILES_DATA for carregado
let checkProfilesDataInterval = null;

/**
 * Verifica se estamos em uma página home/index (não deve aplicar filtro automático)
 * @returns {boolean} true se for página home
 */
function isHomePage() {
    const path = window.location.pathname.toLowerCase();
    const filename = path.split('/').pop() || '';
    
    // Lista de páginas home que devem mostrar todos os anúncios
    const homePages = [
        'index.html',
        'a_01__index.html',
        '0_aaa.html',
        'home.html'
    ];
    
    return homePages.includes(filename) || path.includes('/index') || path === '/' || path.endsWith('/');
}

function verificarProfilesData() {
    if (typeof window.PROFILES_DATA !== 'undefined' && window.PROFILES_DATA && window.PROFILES_DATA.length > 0) {
        console.log(`✅ PROFILES_DATA carregado: ${window.PROFILES_DATA.length} anúncios`);
        
        // Fazer backup do original APENAS se ainda não foi feito
        // Isso garante que sempre teremos os dados completos para filtrar
        if (!PROFILES_DATA_ORIGINAL || PROFILES_DATA_ORIGINAL.length === 0) {
            PROFILES_DATA_ORIGINAL = [...window.PROFILES_DATA];
            console.log(`💾 Backup do PROFILES_DATA original salvo: ${PROFILES_DATA_ORIGINAL.length} anúncios`);
            console.log(`📋 Primeiros 3 anúncios do backup:`, PROFILES_DATA_ORIGINAL.slice(0, 3).map(a => ({
                nome: a.nome || a.name,
                estado: a.estado || a.state || a.originalData?.estado || a.originalData?.state
            })));
        } else {
            console.log(`💾 Backup já existe: ${PROFILES_DATA_ORIGINAL.length} anúncios`);
        }
        
        // Se for página home, NÃO aplicar filtro automático - mostrar todos
        if (isHomePage()) {
            console.log('🏠 Página home detectada - mostrando todos os anúncios (sem filtro)');
            // Garantir que PROFILES_DATA está completo
            if (PROFILES_DATA_ORIGINAL && PROFILES_DATA_ORIGINAL.length > 0) {
                window.PROFILES_DATA = [...PROFILES_DATA_ORIGINAL];
            }
            // Limpar qualquer filtro salvo para páginas home
            localStorage.removeItem('filtroEstado');
            
            // Limpar intervalo
            if (checkProfilesDataInterval) {
                clearInterval(checkProfilesDataInterval);
                checkProfilesDataInterval = null;
            }
            return;
        }
        
        // Aplicar filtro pendente se existir
        if (filtroPendente) {
            console.log(`🔄 Aplicando filtro pendente: ${filtroPendente.estadoSigla || 'Brasil (todos)'}`);
            aplicarFiltroEstado(filtroPendente.estadoSigla, filtroPendente.estadoNome);
            filtroPendente = null;
        } else {
            // Para páginas premium, carregar filtro salvo ou aplicar padrão
            if (!carregarFiltroSalvo()) {
                // Se não havia filtro salvo, mostrar todos aleatoriamente
                console.log('🌎 Aplicando filtro padrão: Brasil (todos os anúncios)');
                aplicarFiltroEstado(null, 'Brasil');
            }
        }
        
        // Limpar intervalo
        if (checkProfilesDataInterval) {
            clearInterval(checkProfilesDataInterval);
            checkProfilesDataInterval = null;
        }
    }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Verificar PROFILES_DATA a cada 500ms até encontrar
        checkProfilesDataInterval = setInterval(verificarProfilesData, 500);
        
        // Timeout de segurança (10 segundos)
        setTimeout(() => {
            if (checkProfilesDataInterval) {
                clearInterval(checkProfilesDataInterval);
                checkProfilesDataInterval = null;
            }
        }, 10000);
    });
} else {
    // DOM já carregado
    checkProfilesDataInterval = setInterval(verificarProfilesData, 500);
    setTimeout(() => {
        if (checkProfilesDataInterval) {
            clearInterval(checkProfilesDataInterval);
            checkProfilesDataInterval = null;
        }
    }, 10000);
}

// Exportar funções globais
if (typeof window !== 'undefined') {
    window.aplicarFiltroEstado = aplicarFiltroEstado;
    window.filtrarAnunciosPorEstado = filtrarAnunciosPorEstado;
    window.limparFiltroEstado = limparFiltroEstado;
    window.embaralharArray = embaralharArray;
    window.normalizarEstadoParaSigla = normalizarEstadoParaSigla;
    window.obterFiltroEstadoAtual = () => filtroEstadoAtual;
}

console.log('✅ Sistema de filtro por estado carregado');

