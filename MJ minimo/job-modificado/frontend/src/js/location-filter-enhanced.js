/**
 * Sistema de Filtro por Localização Otimizado
 * Suporta até 2000 anúncios com filtros server-side eficientes
 * Inspirado no sistema do socinquenta.com
 */

// Estado global de filtros
let filtroAtual = {
    estado: null,
    cidade: null,
    aplicado: false,
    totalAnuncios: 0
};

// Cache de contadores por localização
const contadoresCache = new Map();

// URL base da API
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api'
    : '/api';

/**
 * Obtém contador de anúncios por localização (com cache)
 * @param {string} estado - Sigla do estado
 * @param {string} cidade - Nome da cidade (opcional)
 * @returns {Promise<number>} Número de anúncios
 */
async function obterContadorAnuncios(estado, cidade = null) {
    const cacheKey = `${estado}-${cidade || 'null'}`;
    
    // Verificar cache (válido por 5 minutos)
    if (contadoresCache.has(cacheKey)) {
        const cached = contadoresCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 300000) { // 5 minutos
            return cached.count;
        }
    }
    
    try {
        const params = new URLSearchParams();
        if (estado) params.append('estado', estado);
        if (cidade) params.append('cidade', cidade);
        params.append('count', 'true'); // Flag para retornar apenas contagem
        
        const response = await fetch(`${API_BASE_URL}/anuncios/count?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const count = data.count || data.total || 0;
        
        // Salvar no cache
        contadoresCache.set(cacheKey, {
            count,
            timestamp: Date.now()
        });
        
        return count;
    } catch (error) {
        console.error('❌ Erro ao obter contador:', error);
        return 0;
    }
}

/**
 * Atualiza indicadores visuais no dropdown com contadores
 * @param {string} estadoSigla - Sigla do estado
 * @param {string} estadoNome - Nome do estado
 */
async function atualizarIndicadoresDropdown(estadoSigla, estadoNome) {
    const estadosSubmenu = document.getElementById('estados-submenu');
    if (!estadosSubmenu) return;
    
    // Atualizar contador do estado
    const estadoItem = estadosSubmenu.querySelector(`[data-estado="${estadoSigla}"]`);
    if (estadoItem) {
        const count = await obterContadorAnuncios(estadoSigla);
        const link = estadoItem.querySelector('a');
        if (link && !link.querySelector('.anuncio-count')) {
            const countBadge = document.createElement('span');
            countBadge.className = 'anuncio-count';
            countBadge.textContent = `(${count})`;
            countBadge.style.cssText = 'margin-left: 8px; font-size: 0.85em; color: #999; font-weight: normal;';
            link.appendChild(countBadge);
        } else if (link && link.querySelector('.anuncio-count')) {
            link.querySelector('.anuncio-count').textContent = `(${count})`;
        }
    }
    
    // Se houver cidades visíveis, atualizar contadores delas também
    const cidadeItems = estadosSubmenu.querySelectorAll('.cidade-item');
    if (cidadeItems.length > 0 && typeof obterCidadesEstado === 'function') {
        const cidades = obterCidadesEstado(estadoSigla);
        if (cidades) {
            for (const cidade of cidades) {
                const cidadeSlug = cidade.toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');
                
                const cidadeItem = estadosSubmenu.querySelector(`[data-cidade="${cidadeSlug}"]`);
                if (cidadeItem) {
                    const count = await obterContadorAnuncios(estadoSigla, cidadeSlug);
                    const link = cidadeItem.querySelector('a');
                    if (link && !link.querySelector('.anuncio-count')) {
                        const countBadge = document.createElement('span');
                        countBadge.className = 'anuncio-count';
                        countBadge.textContent = `(${count})`;
                        countBadge.style.cssText = 'margin-left: 8px; font-size: 0.85em; color: #999; font-weight: normal;';
                        link.appendChild(countBadge);
                    } else if (link && link.querySelector('.anuncio-count')) {
                        link.querySelector('.anuncio-count').textContent = `(${count})`;
                    }
                }
            }
        }
    }
}

/**
 * Aplica filtro de localização nos anúncios (otimizado para até 2000 anúncios)
 * @param {string} estado - Sigla do estado (ex: 'DF', 'SP')
 * @param {string} cidade - Nome da cidade (opcional)
 * @param {boolean} forcarAtualizacao - Se true, força atualização mesmo se já aplicado
 */
async function aplicarFiltroLocalizacaoEnhanced(estado, cidade = null, forcarAtualizacao = false) {
    // Se já aplicado e não forçar, não fazer nada
    if (filtroAtual.aplicado && !forcarAtualizacao && 
        filtroAtual.estado === estado && filtroAtual.cidade === cidade) {
        console.log('📍 Filtro já aplicado, pulando...');
        return;
    }
    
    console.log(`🔍 Aplicando filtro: estado=${estado}, cidade=${cidade || 'nenhuma'}`);
    
    // Mostrar loading
    mostrarLoadingFiltro(true);
    
    try {
        // Atualizar estado global
        filtroAtual = {
            estado: estado,
            cidade: cidade,
            aplicado: true,
            totalAnuncios: 0
        };
        
        // Salvar no localStorage para persistência
        localStorage.setItem('filtroLocalizacao', JSON.stringify(filtroAtual));
        
        // Obter contador antes de filtrar
        const total = await obterContadorAnuncios(estado, cidade);
        filtroAtual.totalAnuncios = total;
        
        // Atualizar indicador visual no dropdown
        atualizarIndicadorFiltroAtivo(estado, cidade);
        
        // Recarregar anúncios com filtro (server-side para performance)
        await recarregarAnunciosComFiltroEnhanced(estado, cidade);
        
        // Atualizar contador na UI
        atualizarContadorAnuncios(total);
        
    } catch (error) {
        console.error('❌ Erro ao aplicar filtro:', error);
        mostrarMensagemErro('Erro ao aplicar filtro. Tente novamente.');
    } finally {
        mostrarLoadingFiltro(false);
    }
}

/**
 * Recarrega anúncios aplicando filtros de localização (otimizado)
 * @param {string} estado - Sigla do estado
 * @param {string} cidade - Nome da cidade (opcional)
 */
async function recarregarAnunciosComFiltroEnhanced(estado, cidade = null) {
    try {
        // Construir URL com filtros
        const params = new URLSearchParams();
        if (estado) params.append('estado', estado);
        if (cidade) {
            params.append('cidade', cidade);
        }
        
        // Obter categoria atual da página (se houver)
        const categoriaAtual = obterCategoriaAtual();
        if (categoriaAtual) {
            params.append('categoria', categoriaAtual);
        }
        
        // Adicionar paginação para performance (carregar em lotes de 50)
        params.append('limit', '50');
        params.append('offset', '0');
        
        const url = `${API_BASE_URL}/anuncios?${params.toString()}`;
        console.log(`📡 Buscando anúncios: ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const anuncios = Array.isArray(data) ? data : (data.anuncios || []);
        const total = data.total || anuncios.length;
        
        console.log(`✅ ${anuncios.length} anúncios encontrados (de ${total} total)`);
        
        // Se a página usa Firebase, atualizar via Firebase
        if (typeof firebase !== 'undefined' && typeof db !== 'undefined') {
            await atualizarAnunciosViaFirebaseRealtime(estado, cidade, anuncios);
        } else {
            // Caso contrário, atualizar listagem diretamente
            atualizarListagemAnuncios(anuncios);
        }
        
        // Disparar evento customizado
        window.dispatchEvent(new CustomEvent('anunciosFiltrados', {
            detail: { 
                anuncios: anuncios,
                estado: estado,
                cidade: cidade,
                total: total
            }
        }));
        
    } catch (error) {
        console.error('❌ Erro ao recarregar anúncios:', error);
        throw error;
    }
}

/**
 * Atualiza indicador visual de filtro ativo no dropdown
 * @param {string} estado - Sigla do estado
 * @param {string} cidade - Nome da cidade (opcional)
 */
function atualizarIndicadorFiltroAtivo(estado, cidade) {
    const dropdownLink = document.querySelector('#brasil-dropdown > a');
    if (!dropdownLink) return;
    
    let texto = 'Brasil';
    if (cidade) {
        // Formatar nome da cidade
        const cidadeFormatada = cidade
            .split('-')
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
            .join(' ');
        
        if (typeof obterEstados === 'function') {
            const estados = obterEstados();
            const estadoObj = estados.find(e => e.sigla === estado);
            texto = `${cidadeFormatada} - ${estadoObj?.nome || estado}`;
        } else {
            texto = `${cidadeFormatada} - ${estado}`;
        }
    } else if (estado) {
        if (typeof obterEstados === 'function') {
            const estados = obterEstados();
            const estadoObj = estados.find(e => e.sigla === estado);
            texto = estadoObj?.nome || estado;
        } else {
            texto = estado;
        }
    }
    
    // Adicionar badge de filtro ativo
    dropdownLink.innerHTML = `${texto} <span class="filter-badge" style="background: #e25352; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em; margin-left: 5px;">Filtro Ativo</span> <i class="fa-solid fa-caret-down"></i>`;
    
    // Adicionar classe para estilização
    const dropdownItem = document.getElementById('brasil-dropdown');
    if (dropdownItem) {
        dropdownItem.classList.add('filter-active');
    }
}

/**
 * Mostra/esconde loading durante filtro
 * @param {boolean} mostrar - Se true, mostra loading
 */
function mostrarLoadingFiltro(mostrar) {
    const container = document.querySelector('.ads-grid, .anuncios-grid, #anuncios-container, .grid-anuncios, #profiles-container, .profiles-grid');
    if (!container) return;
    
    if (mostrar) {
        const loading = document.createElement('div');
        loading.id = 'filter-loading';
        loading.style.cssText = 'text-align: center; padding: 40px; color: #666;';
        loading.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 2em; margin-bottom: 10px;"></i><p>Aplicando filtro...</p>';
        container.appendChild(loading);
    } else {
        const loading = document.getElementById('filter-loading');
        if (loading) {
            loading.remove();
        }
    }
}

/**
 * Atualiza contador de anúncios na UI
 * @param {number} total - Total de anúncios
 */
function atualizarContadorAnuncios(total) {
    // Procurar elemento de contador ou criar
    let contadorEl = document.getElementById('anuncios-count');
    if (!contadorEl) {
        contadorEl = document.createElement('div');
        contadorEl.id = 'anuncios-count';
        contadorEl.style.cssText = 'text-align: center; padding: 15px; background: #f5f5f5; margin: 20px 0; border-radius: 8px; font-weight: 600; color: #333;';
        
        const container = document.querySelector('.ads-grid, .anuncios-grid, #anuncios-container, .grid-anuncios, #profiles-container, .profiles-grid');
        if (container && container.parentNode) {
            container.parentNode.insertBefore(contadorEl, container);
        }
    }
    
    contadorEl.textContent = `${total} anúncio${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`;
}

/**
 * Mostra mensagem de erro
 * @param {string} mensagem - Mensagem de erro
 */
function mostrarMensagemErro(mensagem) {
    const container = document.querySelector('.ads-grid, .anuncios-grid, #anuncios-container, .grid-anuncios, #profiles-container, .profiles-grid');
    if (!container) return;
    
    const erroEl = document.createElement('div');
    erroEl.style.cssText = 'text-align: center; padding: 20px; background: #fee; color: #c33; border-radius: 8px; margin: 20px 0;';
    erroEl.textContent = mensagem;
    
    container.appendChild(erroEl);
    
    setTimeout(() => erroEl.remove(), 5000);
}

/**
 * Obtém categoria atual da página
 * @returns {string|null} Nome da categoria ou null
 */
function obterCategoriaAtual() {
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
 * Atualiza listagem de anúncios na página
 * @param {Array} anuncios - Array de anúncios
 */
function atualizarListagemAnuncios(anuncios) {
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
        console.warn('⚠️ Container de anúncios não encontrado na página.');
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    // Renderizar anúncios
    if (anuncios.length === 0) {
        container.innerHTML = `
            <div class="no-ads-message" style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-map-marker-alt" style="font-size: 3em; margin-bottom: 20px; color: #ccc;"></i>
                <p style="font-size: 1.2em; margin-bottom: 10px;">Nenhum anúncio encontrado para esta localização.</p>
                <p style="color: #999;">Tente selecionar outra cidade ou estado.</p>
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
 * Cria elemento HTML para um anúncio
 * @param {Object} anuncio - Dados do anúncio
 * @returns {HTMLElement} Elemento HTML do anúncio
 */
function criarElementoAnuncio(anuncio) {
    const div = document.createElement('div');
    div.className = 'anuncio-item';
    div.setAttribute('data-anuncio-id', anuncio.id || anuncio._id);
    
    const fotoCapa = anuncio.foto_capa || anuncio.coverImage || 'https://via.placeholder.com/300x400';
    const nome = anuncio.nome || anuncio.titulo || 'Sem nome';
    const cidade = anuncio.cidade || '';
    const estado = anuncio.estado || '';
    
    div.innerHTML = `
        <a href="A_02__premium_Anuncio_modelo_01.html?id=${anuncio.id || anuncio._id}">
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
 * Atualiza anúncios via Firebase em tempo real
 * @param {string} estado - Sigla do estado
 * @param {string} cidade - Nome da cidade
 * @param {Array} anunciosFiltrados - Anúncios já filtrados pela API
 */
async function atualizarAnunciosViaFirebaseRealtime(estado, cidade, anunciosFiltrados) {
    try {
        if (typeof window.PROFILES_DATA !== 'undefined') {
            const idsFiltrados = new Set(anunciosFiltrados.map(a => a.id || a._id));
            window.PROFILES_DATA_FILTRADO = window.PROFILES_DATA.filter(p => {
                const id = p.id || p._id || p.originalData?.id || p.originalData?._id;
                return idsFiltrados.has(id);
            });
            
            window.dispatchEvent(new CustomEvent('anunciosFiltrados', {
                detail: { 
                    anuncios: window.PROFILES_DATA_FILTRADO,
                    estado: estado,
                    cidade: cidade
                }
            }));
            
            console.log(`✅ ${window.PROFILES_DATA_FILTRADO.length} anúncios filtrados via Firebase`);
        } else {
            atualizarListagemAnuncios(anunciosFiltrados);
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar via Firebase:', error);
        atualizarListagemAnuncios(anunciosFiltrados);
    }
}

/**
 * Limpa filtro de localização
 */
async function limparFiltroLocalizacaoEnhanced() {
    console.log('🗑️ Limpando filtro de localização...');
    
    filtroAtual = {
        estado: null,
        cidade: null,
        aplicado: false,
        totalAnuncios: 0
    };
    
    localStorage.removeItem('filtroLocalizacao');
    
    // Remover indicador visual
    const dropdownItem = document.getElementById('brasil-dropdown');
    if (dropdownItem) {
        dropdownItem.classList.remove('filter-active');
    }
    
    const dropdownLink = document.querySelector('#brasil-dropdown > a');
    if (dropdownLink) {
        dropdownLink.innerHTML = 'Brasil <i class="fa-solid fa-caret-down"></i>';
    }
    
    // Remover contador
    const contadorEl = document.getElementById('anuncios-count');
    if (contadorEl) {
        contadorEl.remove();
    }
    
    // Recarregar anúncios sem filtro
    await recarregarAnunciosComFiltroEnhanced(null, null);
}

// Exportar funções globais
if (typeof window !== 'undefined') {
    window.aplicarFiltroLocalizacaoEnhanced = aplicarFiltroLocalizacaoEnhanced;
    window.obterContadorAnuncios = obterContadorAnuncios;
    window.atualizarIndicadoresDropdown = atualizarIndicadoresDropdown;
    window.limparFiltroLocalizacaoEnhanced = limparFiltroLocalizacaoEnhanced;
    window.obterFiltroAtualEnhanced = () => filtroAtual;
}

// Integrar com brasil-dropdown.js se disponível
if (typeof window.abrirAnunciosEstado === 'function') {
    const originalAbrirAnunciosEstado = window.abrirAnunciosEstado;
    window.abrirAnunciosEstado = async function(siglaEstado, nomeEstado) {
        await aplicarFiltroLocalizacaoEnhanced(siglaEstado, null, true);
        return originalAbrirAnunciosEstado.call(this, siglaEstado, nomeEstado);
    };
}

if (typeof window.abrirAnunciosCidade === 'function') {
    const originalAbrirAnunciosCidade = window.abrirAnunciosCidade;
    window.abrirAnunciosCidade = async function(siglaEstado, nomeEstado, cidade) {
        await aplicarFiltroLocalizacaoEnhanced(siglaEstado, cidade, true);
        return originalAbrirAnunciosCidade.call(this, siglaEstado, nomeEstado, cidade);
    };
}

console.log('✅ Sistema de filtro por localização otimizado carregado');



