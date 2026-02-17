/**
 * Módulo de Filtro Automático de Localização
 * Detecta localização do usuário e aplica filtros automaticamente nos anúncios
 */

// Estado global de filtros
let filtroAtual = {
    estado: null,
    cidade: null,
    aplicado: false
};

// URL base da API
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Detecta localização do usuário via API do backend
 * @returns {Promise<Object>} Objeto com cidade, estado, etc.
 */
async function detectarLocalizacao() {
    try {
        console.log('📍 Detectando localização do usuário...');
        
        const response = await fetch(`${API_BASE_URL}/location`);
        const data = await response.json();
        
        if (data.sucesso) {
            console.log('✅ Localização detectada:', data);
            return data;
        } else {
            console.warn('⚠️ Não foi possível detectar localização:', data.mensagem);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro ao detectar localização:', error);
        return null;
    }
}

/**
 * Aplica regra especial para Distrito Federal
 * Se a localização for do DF, ignora a cidade e filtra apenas por estado
 * @param {Object} localizacao - Objeto de localização
 * @returns {Object} Localização processada com regra DF aplicada
 */
function aplicarRegraDF(localizacao) {
    if (!localizacao) return null;
    
    // Verificar se é DF
    if (localizacao.estado === 'DF' || 
        localizacao.estadoNome?.toLowerCase().includes('distrito federal') ||
        localizacao.cidade?.toLowerCase().includes('brasília') ||
        localizacao.cidade?.toLowerCase().includes('brasilia') ||
        localizacao.isDF) {
        
        console.log('🔷 Aplicando regra especial para DF: ignorando cidade, filtrando todo o DF');
        
        return {
            ...localizacao,
            estado: 'DF',
            estadoNome: 'Distrito Federal',
            cidade: null, // Ignorar cidade para DF
            isDF: true
        };
    }
    
    return localizacao;
}

/**
 * Aplica filtro de localização nos anúncios
 * @param {string} estado - Sigla do estado (ex: 'DF', 'SP')
 * @param {string} cidade - Nome da cidade (opcional, ignorado se estado for DF)
 * @param {boolean} forcarAtualizacao - Se true, força atualização mesmo se já aplicado
 */
async function aplicarFiltroLocalizacao(estado, cidade = null, forcarAtualizacao = false) {
    // Se já aplicado e não forçar, não fazer nada
    if (filtroAtual.aplicado && !forcarAtualizacao && 
        filtroAtual.estado === estado && filtroAtual.cidade === cidade) {
        console.log('📍 Filtro já aplicado, pulando...');
        return;
    }
    
    console.log(`🔍 Aplicando filtro: estado=${estado}, cidade=${cidade || 'nenhuma'}`);
    
    // Atualizar estado global
    filtroAtual = {
        estado: estado,
        cidade: cidade,
        aplicado: true
    };
    
    // Salvar no localStorage para persistência
    localStorage.setItem('filtroLocalizacao', JSON.stringify(filtroAtual));
    
    // Recarregar anúncios com filtro
    await recarregarAnunciosComFiltro(estado, cidade);
}

/**
 * Recarrega anúncios aplicando filtros de localização
 * @param {string} estado - Sigla do estado
 * @param {string} cidade - Nome da cidade (opcional)
 */
async function recarregarAnunciosComFiltro(estado, cidade = null) {
    try {
        // Construir URL com filtros
        const params = new URLSearchParams();
        if (estado) params.append('estado', estado);
        if (cidade) { // Permitir filtrar por cidade mesmo para DF
            params.append('cidade', cidade);
        }
        
        // Obter categoria atual da página (se houver)
        const categoriaAtual = obterCategoriaAtual();
        if (categoriaAtual) {
            params.append('categoria', categoriaAtual);
        }
        
        const url = `${API_BASE_URL}/anuncios?${params.toString()}`;
        console.log(`📡 Buscando anúncios: ${url}`);
        console.log(`🔍 Filtros aplicados: estado=${estado}, cidade=${cidade || 'nenhuma'}, categoria=${categoriaAtual || 'nenhuma'}`);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const anuncios = await response.json();
        
        console.log(`✅ ${anuncios.length} anúncios encontrados com filtro`);
        console.log(`📋 IDs dos anúncios:`, anuncios.map(a => a.id || a._id));
        
        // Se a página usa Firebase, atualizar via Firebase
        if (typeof firebase !== 'undefined' && typeof db !== 'undefined') {
            await atualizarAnunciosViaFirebaseRealtime(estado, cidade, anuncios);
        } else {
            // Caso contrário, atualizar listagem diretamente
            atualizarListagemAnuncios(anuncios);
        }
        
        // Disparar evento customizado para outras partes do código que possam estar escutando
        window.dispatchEvent(new CustomEvent('anunciosFiltrados', {
            detail: { 
                anuncios: anuncios,
                estado: estado,
                cidade: cidade
            }
        }));
        
    } catch (error) {
        console.error('❌ Erro ao recarregar anúncios:', error);
    }
}

/**
 * Obtém categoria atual da página
 * @returns {string|null} Nome da categoria ou null
 */
function obterCategoriaAtual() {
    // Verificar URL atual
    const path = window.location.pathname;
    
    if (path.includes('premium_copy.html') || path.includes('A_02__premium_copy.html')) {
        return 'mulheres';
    } else if (path.includes('massagistas')) {
        return 'massagistas';
    } else if (path.includes('trans')) {
        return 'trans';
    } else if (path.includes('homens')) {
        return 'homens';
    } else if (path.includes('sexo-virtual')) {
        return 'sexo-virtual';
    }
    
    return null;
}

/**
 * Atualiza a listagem de anúncios na página
 * @param {Array} anuncios - Array de anúncios
 */
function atualizarListagemAnuncios(anuncios) {
    // Procurar container de anúncios na página
    const containers = [
        document.querySelector('.ads-grid'),
        document.querySelector('.anuncios-grid'),
        document.querySelector('#anuncios-container'),
        document.querySelector('.grid-anuncios'),
        document.querySelector('[data-anuncios]'),
        document.querySelector('#profiles-container'),
        document.querySelector('.profiles-grid'),
        document.querySelector('#layout_anuncios'),
        document.querySelector('.content-section'),
        document.querySelector('main'),
        document.querySelector('.main-content')
    ];
    
    const container = containers.find(el => el !== null);
    
    if (!container) {
        console.warn('⚠️ Container de anúncios não encontrado na página. Tentando atualizar via Firebase...');
        // Se não encontrar container, tentar atualizar via Firebase diretamente
        if (typeof atualizarAnunciosViaFirebase === 'function') {
            atualizarAnunciosViaFirebase(anuncios);
        }
        return;
    }
    
    console.log(`📦 Container encontrado:`, container.className || container.id);
    
    // Limpar container
    container.innerHTML = '';
    
    // Renderizar anúncios
    if (anuncios.length === 0) {
        container.innerHTML = `
            <div class="no-ads-message" style="text-align: center; padding: 40px; color: #666;">
                <p>Nenhum anúncio encontrado para esta localização.</p>
            </div>
        `;
        return;
    }
    
    anuncios.forEach(anuncio => {
        const anuncioElement = criarElementoAnuncio(anuncio);
        container.appendChild(anuncioElement);
    });
    
    console.log(`✅ ${anuncios.length} anúncios renderizados`);
}

/**
 * Atualiza anúncios via Firebase em tempo real
 * @param {string} estado - Sigla do estado
 * @param {string} cidade - Nome da cidade
 * @param {Array} anunciosFiltrados - Anúncios já filtrados pela API
 */
async function atualizarAnunciosViaFirebaseRealtime(estado, cidade, anunciosFiltrados) {
    try {
        // Se houver PROFILES_DATA global, filtrar baseado nos IDs
        if (typeof window.PROFILES_DATA !== 'undefined') {
            const idsFiltrados = new Set(anunciosFiltrados.map(a => a.id || a._id));
            window.PROFILES_DATA_FILTRADO = window.PROFILES_DATA.filter(p => {
                const id = p.id || p._id || p.originalData?.id || p.originalData?._id;
                return idsFiltrados.has(id);
            });
            
            // Disparar evento para re-renderização
            window.dispatchEvent(new CustomEvent('anunciosFiltrados', {
                detail: { 
                    anuncios: window.PROFILES_DATA_FILTRADO,
                    estado: estado,
                    cidade: cidade
                }
            }));
            
            console.log(`✅ ${window.PROFILES_DATA_FILTRADO.length} anúncios filtrados via Firebase`);
        } else {
            // Se não houver, usar atualização direta
            atualizarListagemAnuncios(anunciosFiltrados);
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar via Firebase:', error);
        // Fallback: atualização direta
        atualizarListagemAnuncios(anunciosFiltrados);
    }
}

/**
 * Cria elemento HTML para um anúncio
 * @param {Object} anuncio - Dados do anúncio
 * @returns {HTMLElement} Elemento HTML do anúncio
 */
function criarElementoAnuncio(anuncio) {
    const div = document.createElement('div');
    div.className = 'anuncio-item';
    div.setAttribute('data-anuncio-id', anuncio.id);
    
    const fotoCapa = anuncio.foto_capa || anuncio.coverImage || 'https://via.placeholder.com/300x400';
    const nome = anuncio.nome || anuncio.titulo || 'Sem nome';
    const cidade = anuncio.cidade || '';
    const estado = anuncio.estado || '';
    
    div.innerHTML = `
        <a href="A_02__premium_Anuncio_modelo_01.html?id=${anuncio.id}">
            <div class="anuncio-image">
                <img src="${fotoCapa}" alt="${nome}" loading="lazy">
            </div>
            <div class="anuncio-info">
                <h3>${nome}</h3>
                ${cidade ? `<p class="anuncio-location">${cidade} - ${estado}</p>` : ''}
            </div>
        </a>
    `;
    
    return div;
}

/**
 * Inicializa sistema de filtro automático de localização
 */
async function inicializarFiltroAutomatico() {
    console.log('🚀 Inicializando filtro automático de localização...');
    
    // Verificar se há filtro salvo no localStorage
    const filtroSalvo = localStorage.getItem('filtroLocalizacao');
    if (filtroSalvo) {
        try {
            const filtro = JSON.parse(filtroSalvo);
            if (filtro.estado) {
                console.log('📍 Usando filtro salvo:', filtro);
                await aplicarFiltroLocalizacao(filtro.estado, filtro.cidade, false);
                return;
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar filtro salvo:', error);
        }
    }
    
    // Se não houver filtro salvo, detectar localização automaticamente
    const localizacao = await detectarLocalizacao();
    
    if (localizacao) {
        // Aplicar regra especial para DF
        const localizacaoProcessada = aplicarRegraDF(localizacao);
        
        if (localizacaoProcessada.estado) {
            await aplicarFiltroLocalizacao(
                localizacaoProcessada.estado,
                localizacaoProcessada.cidade
            );
        }
    } else {
        console.log('⚠️ Não foi possível detectar localização, mostrando todos os anúncios');
    }
}

/**
 * Limpa filtro de localização e mostra todos os anúncios
 */
async function limparFiltroLocalizacao() {
    console.log('🗑️ Limpando filtro de localização...');
    
    filtroAtual = {
        estado: null,
        cidade: null,
        aplicado: false
    };
    
    localStorage.removeItem('filtroLocalizacao');
    
    // Recarregar anúncios sem filtro
    await recarregarAnunciosComFiltro(null, null);
}

// Exportar funções globais
if (typeof window !== 'undefined') {
    window.detectarLocalizacao = detectarLocalizacao;
    window.aplicarRegraDF = aplicarRegraDF;
    window.aplicarFiltroLocalizacao = aplicarFiltroLocalizacao;
    window.recarregarAnunciosComFiltro = recarregarAnunciosComFiltro;
    window.inicializarFiltroAutomatico = inicializarFiltroAutomatico;
    window.limparFiltroLocalizacao = limparFiltroLocalizacao;
    window.obterFiltroAtual = () => filtroAtual;
}

// Auto-inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarFiltroAutomatico);
} else {
    // DOM já carregado, inicializar imediatamente
    setTimeout(inicializarFiltroAutomatico, 1000); // Aguardar 1s para garantir que outros scripts carregaram
}

