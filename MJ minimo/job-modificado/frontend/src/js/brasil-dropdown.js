/**
 * Gerenciador do Dropdown Brasil -> Estados -> Cidades
 */

// Estado atual do dropdown
let estadoSelecionado = null;

/**
 * Inicializa o dropdown de Brasil
 */
function inicializarDropdownBrasil() {
    console.log('🔍 Inicializando dropdown Brasil...');
    const dropdownItem = document.getElementById('brasil-dropdown');
    const estadosSubmenu = document.getElementById('estados-submenu');
    
    if (!dropdownItem) {
        console.error('❌ Elemento #brasil-dropdown não encontrado');
        return;
    }
    
    if (!estadosSubmenu) {
        console.error('❌ Elemento #estados-submenu não encontrado');
        return;
    }
    
    console.log('✅ Elementos encontrados, carregando estados...');
    
    // Carregar localização escolhida se houver
    carregarLocalizacaoEscolhida();
    
    // Carregar estados no submenu
    carregarEstados();
    
    // Configurar evento de clique no link "Brasil"
    const dropdownLink = dropdownItem.querySelector('a');
    dropdownLink.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Fechar outros dropdowns se houver
        document.querySelectorAll('.dropdown-menu-item.active').forEach(openMenu => {
            if (openMenu !== dropdownItem) {
                openMenu.classList.remove('active');
            }
        });
        
        // Toggle do menu atual
        dropdownItem.classList.toggle('active');
        
        // Se abrindo, sempre mostrar estados (não mostrar cidades)
        if (dropdownItem.classList.contains('active')) {
            // Sempre mostrar estados, não cidades
            mostrarEstados();
        }
    });
    
    // Fechar ao clicar fora
    document.addEventListener('click', function(e) {
        if (!dropdownItem.contains(e.target)) {
            dropdownItem.classList.remove('active');
            estadoSelecionado = null;
        }
    });
}

/**
 * Carrega a lista de estados no submenu
 */
function carregarEstados() {
    const estadosSubmenu = document.getElementById('estados-submenu');
    if (!estadosSubmenu) {
        console.error('❌ estadosSubmenu não encontrado em carregarEstados');
        return;
    }
    
    // Limpar conteúdo atual
    estadosSubmenu.innerHTML = '';
    
    // Verificar se estadosBrasileiros está disponível
    if (typeof obterEstados === 'undefined') {
        console.warn('⚠️ Função obterEstados não disponível. Tentando novamente em 500ms...');
        // Aguardar um pouco e tentar novamente
        setTimeout(carregarEstados, 500);
        return;
    }
    
    console.log('✅ obterEstados disponível, obtendo lista de estados...');
    const estados = obterEstados();
    console.log(`✅ ${estados.length} estados encontrados`);
    
    // Adicionar opção "Brasil" (todos os anúncios) no início
    const liBrasil = document.createElement('li');
    liBrasil.className = 'submenu estado-item brasil-item';
    liBrasil.setAttribute('data-estado', 'BR');
    
    const aBrasil = document.createElement('a');
    aBrasil.href = '#';
    aBrasil.textContent = 'Brasil (Todos)';
    aBrasil.setAttribute('data-estado-sigla', 'BR');
    aBrasil.setAttribute('data-estado-nome', 'Brasil');
    aBrasil.style.fontWeight = '600';
    aBrasil.style.color = '#e25352';
    
    // Contador para Brasil (todos)
    // Usar PROFILES_DATA_ORIGINAL se disponível para contar todos os anúncios
    if (typeof window.PROFILES_DATA !== 'undefined' && window.PROFILES_DATA) {
        const dadosParaContarBrasil = (typeof window.PROFILES_DATA_ORIGINAL !== 'undefined' && window.PROFILES_DATA_ORIGINAL && window.PROFILES_DATA_ORIGINAL.length > 0) 
            ? window.PROFILES_DATA_ORIGINAL 
            : window.PROFILES_DATA;
        const countBrasil = dadosParaContarBrasil.length;
        const countBadgeBrasil = document.createElement('span');
        countBadgeBrasil.className = 'anuncio-count';
        countBadgeBrasil.textContent = `(${countBrasil})`;
        countBadgeBrasil.style.cssText = 'margin-left: 8px; font-size: 0.85em; color: #999; font-weight: normal;';
        aBrasil.appendChild(countBadgeBrasil);
    }
    
    aBrasil.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('📍 Selecionado: Brasil (todos os anúncios)');
        abrirAnunciosEstado(null, 'Brasil');
    });
    
    liBrasil.appendChild(aBrasil);
    estadosSubmenu.appendChild(liBrasil);
    
    // Adicionar separador visual
    const liSeparador = document.createElement('li');
    liSeparador.className = 'submenu separator';
    liSeparador.style.cssText = 'height: 1px; background: #ddd; margin: 8px 0;';
    estadosSubmenu.appendChild(liSeparador);
    
    // Adicionar estados
    estados.forEach(estado => {
        const li = document.createElement('li');
        li.className = 'submenu estado-item';
        li.setAttribute('data-estado', estado.sigla);
        
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = estado.nome;
        a.setAttribute('data-estado-sigla', estado.sigla);
        a.setAttribute('data-estado-nome', estado.nome);
        
        // Contador de anúncios por estado (usando PROFILES_DATA se disponível)
        if (typeof window.PROFILES_DATA !== 'undefined' && window.PROFILES_DATA) {
            // Usar PROFILES_DATA_ORIGINAL se disponível para contar todos os anúncios
            const dadosParaContar = (typeof window.PROFILES_DATA_ORIGINAL !== 'undefined' && window.PROFILES_DATA_ORIGINAL && window.PROFILES_DATA_ORIGINAL.length > 0) 
                ? window.PROFILES_DATA_ORIGINAL 
                : window.PROFILES_DATA;
            
            const countEstado = dadosParaContar.filter(anuncio => {
                const estadoAnuncioRaw = anuncio.estado || anuncio.state || anuncio.originalData?.estado || anuncio.originalData?.state || '';
                
                // Usar função de normalização se disponível
                if (typeof normalizarEstadoParaSigla === 'function') {
                    const estadoAnuncioNormalizado = normalizarEstadoParaSigla(estadoAnuncioRaw);
                    return estadoAnuncioNormalizado === estado.sigla.toUpperCase();
                } else {
                    // Fallback: comparação simples
                    const estadoAnuncio = estadoAnuncioRaw.toUpperCase().trim();
                    return estadoAnuncio === estado.sigla.toUpperCase();
                }
            }).length;
            
            if (countEstado > 0) {
                const countBadge = document.createElement('span');
                countBadge.className = 'anuncio-count';
                countBadge.textContent = `(${countEstado})`;
                countBadge.style.cssText = 'margin-left: 8px; font-size: 0.85em; color: #999; font-weight: normal;';
                a.appendChild(countBadge);
            }
        } else if (typeof obterContadorAnuncios === 'function') {
            // Fallback: usar API se disponível
            obterContadorAnuncios(estado.sigla).then(count => {
                const countBadge = document.createElement('span');
                countBadge.className = 'anuncio-count';
                countBadge.textContent = `(${count})`;
                countBadge.style.cssText = 'margin-left: 8px; font-size: 0.85em; color: #999; font-weight: normal;';
                a.appendChild(countBadge);
            }).catch(err => {
                console.warn('Erro ao obter contador para', estado.sigla, err);
            });
        }
        
        // Evento de clique no estado
        a.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`📍 Estado selecionado: ${estado.nome} (${estado.sigla})`);
            selecionarEstado(estado.sigla, estado.nome);
        });
        
        li.appendChild(a);
        estadosSubmenu.appendChild(li);
    });
    
    console.log(`✅ ${estados.length} estados adicionados ao dropdown`);
}

/**
 * Mostra a lista de estados
 */
function mostrarEstados() {
    const estadosSubmenu = document.getElementById('estados-submenu');
    if (!estadosSubmenu) return;
    
    // Remover classe de cidades se houver
    estadosSubmenu.classList.remove('mostrando-cidades');
    estadosSubmenu.classList.add('mostrando-estados');
    
    // Atualizar título se houver
    const dropdownLink = document.querySelector('#brasil-dropdown > a');
    if (dropdownLink) {
        dropdownLink.innerHTML = 'Brasil <i class="fa-solid fa-caret-down"></i>';
    }
    
    estadoSelecionado = null;
}

/**
 * Seleciona um estado e abre anúncios diretamente (sem mostrar cidades)
 * @param {string} siglaEstado - Sigla do estado (ex: 'SP', 'RJ', 'DF')
 * @param {string} nomeEstado - Nome do estado
 */
function selecionarEstado(siglaEstado, nomeEstado) {
    console.log(`📍 selecionarEstado chamado: ${nomeEstado} (${siglaEstado})`);
    estadoSelecionado = { sigla: siglaEstado, nome: nomeEstado };
    
    // Fechar dropdown primeiro
    const dropdownItem = document.getElementById('brasil-dropdown');
    if (dropdownItem) {
        dropdownItem.classList.remove('active');
    }
    
    // Abrir anúncios do estado diretamente (sem mostrar cidades)
    abrirAnunciosEstado(siglaEstado, nomeEstado);
}

/**
 * Mostra as cidades de um estado no dropdown
 * @param {string} siglaEstado - Sigla do estado
 * @param {string} nomeEstado - Nome do estado
 * @param {Array} cidades - Array de cidades
 */
function mostrarCidadesEstado(siglaEstado, nomeEstado, cidades) {
    const estadosSubmenu = document.getElementById('estados-submenu');
    if (!estadosSubmenu) return;
    
    // Limpar conteúdo
    estadosSubmenu.innerHTML = '';
    
    // Adicionar botão "Voltar"
    const liVoltar = document.createElement('li');
    liVoltar.className = 'submenu voltar-item';
    const aVoltar = document.createElement('a');
    aVoltar.href = '#';
    aVoltar.innerHTML = '<i class="fas fa-arrow-left"></i> Voltar para Estados';
    aVoltar.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        mostrarEstados();
        carregarEstados();
    });
    liVoltar.appendChild(aVoltar);
    estadosSubmenu.appendChild(liVoltar);
    
    // Adicionar título do estado
    const liTitulo = document.createElement('li');
    liTitulo.className = 'submenu estado-titulo';
    liTitulo.textContent = nomeEstado;
    estadosSubmenu.appendChild(liTitulo);
    
    // NOTA: Esta função não deve ser chamada mais, pois não mostramos cidades
    // Mas mantemos para compatibilidade caso seja chamada de algum lugar
    // Adicionar opção "Ver todos os anúncios do estado"
    const liTodos = document.createElement('li');
    liTodos.className = 'submenu ver-todos-item';
    const aTodos = document.createElement('a');
    aTodos.href = '#';
    aTodos.textContent = `Ver todos os anúncios de ${nomeEstado}`;
    aTodos.style.fontWeight = 'bold';
    aTodos.style.color = 'var(--primary-color)';
    aTodos.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log(`📍 Clicou em "Ver todos" para ${nomeEstado} (${siglaEstado})`);
        abrirAnunciosEstado(siglaEstado, nomeEstado);
    });
    liTodos.appendChild(aTodos);
    estadosSubmenu.appendChild(liTodos);
    
    // Adicionar cidades
    cidades.forEach(cidade => {
        const li = document.createElement('li');
        li.className = 'submenu cidade-item';
        
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = cidade;
        a.setAttribute('data-estado', siglaEstado);
        // Normalizar nome da cidade para slug (remover acentos, espaços, etc)
        const cidadeSlug = cidade.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/\s+/g, '-') // Substitui espaços por hífen
            .replace(/[^a-z0-9-]/g, ''); // Remove caracteres especiais
        a.setAttribute('data-cidade', cidadeSlug);
        
        // Carregar contador de anúncios assincronamente
        if (typeof obterContadorAnuncios === 'function') {
            obterContadorAnuncios(siglaEstado, cidadeSlug).then(count => {
                const countBadge = document.createElement('span');
                countBadge.className = 'anuncio-count';
                countBadge.textContent = `(${count})`;
                countBadge.style.cssText = 'margin-left: 8px; font-size: 0.85em; color: #999; font-weight: normal;';
                a.appendChild(countBadge);
            }).catch(err => {
                console.warn('Erro ao obter contador para', cidadeSlug, err);
            });
        }
        
        // Evento de clique na cidade
        a.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Passar o slug da cidade para a função (API espera slug)
            abrirAnunciosCidade(siglaEstado, nomeEstado, cidadeSlug);
        });
        
        li.appendChild(a);
        estadosSubmenu.appendChild(li);
    });
    
    // Atualizar classe
    estadosSubmenu.classList.remove('mostrando-estados');
    estadosSubmenu.classList.add('mostrando-cidades');
    
    // Atualizar título do dropdown
    const dropdownLink = document.querySelector('#brasil-dropdown > a');
    if (dropdownLink) {
        dropdownLink.innerHTML = `${nomeEstado} <i class="fa-solid fa-caret-down"></i>`;
    }
}

/**
 * Verifica se estamos em uma página home/index
 * @returns {boolean} true se for página home
 */
function isHomePage() {
    const path = window.location.pathname.toLowerCase();
    const filename = path.split('/').pop() || '';
    
    const homePages = [
        'index.html',
        'a_01__index.html',
        '0_aaa.html',
        'home.html'
    ];
    
    return homePages.includes(filename) || path.includes('/index') || path === '/' || path.endsWith('/');
}

/**
 * Abre anúncios de um estado
 * @param {string} siglaEstado - Sigla do estado ou null para Brasil (todos)
 * @param {string} nomeEstado - Nome do estado ou "Brasil" para todos
 */
function abrirAnunciosEstado(siglaEstado, nomeEstado) {
    console.log(`📍 abrirAnunciosEstado chamado: ${nomeEstado || 'Brasil'} (${siglaEstado || 'todos'})`);
    
    // Se for página home, não aplicar filtro - apenas atualizar texto do dropdown
    if (isHomePage()) {
        console.log('🏠 Página home - filtro não aplicado, apenas atualizando dropdown');
        const dropdownLink = document.querySelector('#brasil-dropdown > a');
        if (dropdownLink) {
            if (siglaEstado) {
                dropdownLink.innerHTML = `${nomeEstado} <i class="fa-solid fa-caret-down"></i>`;
            } else {
                dropdownLink.innerHTML = `Brasil <i class="fa-solid fa-caret-down"></i>`;
            }
        }
        
        // Fechar dropdown
        const dropdownItem = document.getElementById('brasil-dropdown');
        if (dropdownItem) {
            dropdownItem.classList.remove('active');
        }
        return;
    }
    
    // Fechar dropdown
    const dropdownItem = document.getElementById('brasil-dropdown');
    if (dropdownItem) {
        dropdownItem.classList.remove('active');
    }
    
    // Garantir que está mostrando estados, não cidades
    const estadosSubmenu = document.getElementById('estados-submenu');
    if (estadosSubmenu) {
        estadosSubmenu.classList.remove('mostrando-cidades');
        estadosSubmenu.classList.add('mostrando-estados');
    }
    
    // Salvar seleção no localStorage (persistente entre páginas)
    const localizacaoEscolhida = {
        cidade: null,
        estado: siglaEstado,
        estadoNome: nomeEstado || 'Brasil',
        textoExibicao: nomeEstado || 'Brasil',
        metodo: 'escolha_usuario',
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('localizacaoEscolhida', JSON.stringify(localizacaoEscolhida));
    if (siglaEstado) {
        localStorage.setItem('estadoSelecionado', JSON.stringify({ sigla: siglaEstado, nome: nomeEstado }));
    } else {
        localStorage.removeItem('estadoSelecionado');
    }
    localStorage.removeItem('cidadeSelecionada');
    
    // Atualizar texto de localização ao lado do botão
    if (typeof atualizarTextoLocalizacao === 'function') {
        atualizarTextoLocalizacao(localizacaoEscolhida);
    }
    
    // Atualizar indicador de localização
    if (typeof atualizarIndicadorLocalizacao === 'function') {
        atualizarIndicadorLocalizacao(localizacaoEscolhida);
    }
    
    // Aplicar filtro de estado usando o novo sistema
    if (typeof aplicarFiltroEstado === 'function') {
        aplicarFiltroEstado(siglaEstado, nomeEstado);
    } else if (typeof aplicarFiltroLocalizacaoEnhanced === 'function') {
        aplicarFiltroLocalizacaoEnhanced(siglaEstado, null, true);
    } else if (typeof aplicarFiltroLocalizacao === 'function') {
        aplicarFiltroLocalizacao(siglaEstado, null, true);
    } else {
        // Fallback: usar função local
        filtrarAnunciosPorEstado(siglaEstado, nomeEstado);
    }
    
    // Atualizar título do dropdown
    const dropdownLink = document.querySelector('#brasil-dropdown > a');
    if (dropdownLink) {
        if (siglaEstado) {
            dropdownLink.innerHTML = `${nomeEstado} <i class="fa-solid fa-caret-down"></i>`;
        } else {
            dropdownLink.innerHTML = `Brasil <i class="fa-solid fa-caret-down"></i>`;
        }
    }
}

/**
 * Abre anúncios de uma cidade
 * @param {string} siglaEstado - Sigla do estado
 * @param {string} nomeEstado - Nome do estado
 * @param {string} cidade - Nome da cidade
 */
function abrirAnunciosCidade(siglaEstado, nomeEstado, cidade) {
    console.log(`📍 Abrindo anúncios da cidade: ${cidade}, ${nomeEstado} (${siglaEstado})`);
    
    // Fechar dropdown
    const dropdownItem = document.getElementById('brasil-dropdown');
    if (dropdownItem) {
        dropdownItem.classList.remove('active');
    }
    
    // Formatar nome da cidade para exibição (converter slug para formato legível)
    const cidadeFormatada = cidade
        .split('-')
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
        .join(' ');
    
    // Salvar seleção no localStorage (persistente entre páginas)
    const localizacaoEscolhida = {
        cidade: cidade, // Manter slug para filtros
        estado: siglaEstado,
        estadoNome: nomeEstado,
        textoExibicao: `${cidadeFormatada} - ${siglaEstado}`,
        metodo: 'escolha_usuario',
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('localizacaoEscolhida', JSON.stringify(localizacaoEscolhida));
    localStorage.setItem('estadoSelecionado', JSON.stringify({ sigla: siglaEstado, nome: nomeEstado }));
    localStorage.setItem('cidadeSelecionada', cidade);
    
    // Atualizar texto de localização ao lado do botão (sempre oculto)
    if (typeof atualizarTextoLocalizacao === 'function') {
        atualizarTextoLocalizacao(localizacaoEscolhida);
    }
    
    // Atualizar dropdown "Brasil" com a cidade formatada
    if (typeof atualizarIndicadorLocalizacao === 'function') {
        atualizarIndicadorLocalizacao(localizacaoEscolhida);
    }
    
    // Filtrar anúncios na página atual (sem redirecionar)
    // Se quiser redirecionar, descomente a linha abaixo e comente o filtro
    // window.location.href = `premium.html?estado=${siglaEstado}&cidade=${encodeURIComponent(cidade)}&nome=${encodeURIComponent(nomeEstado)}`;
    
    // Aplicar filtro de localização usando o módulo de filtros (priorizar enhanced)
    if (typeof aplicarFiltroLocalizacaoEnhanced === 'function') {
        aplicarFiltroLocalizacaoEnhanced(siglaEstado, cidade, true);
    } else if (typeof aplicarFiltroLocalizacao === 'function') {
        aplicarFiltroLocalizacao(siglaEstado, cidade, true);
    } else {
        // Fallback: usar função local
        filtrarAnunciosPorCidade(siglaEstado, cidade);
    }
    
    // Atualizar indicadores no dropdown após um pequeno delay
    if (typeof atualizarIndicadoresDropdown === 'function') {
        setTimeout(() => {
            atualizarIndicadoresDropdown(siglaEstado, nomeEstado);
        }, 500);
    }
}

// Inicializar quando o DOM estiver pronto e estados-brasil.js estiver carregado
function tentarInicializar() {
    // Verificar se estados-brasil.js foi carregado
    if (typeof obterEstados === 'undefined') {
        console.warn('⚠️ Aguardando estados-brasil.js...');
        setTimeout(tentarInicializar, 100);
        return;
    }
    
    console.log('🚀 Inicializando dropdown Brasil...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarDropdownBrasil);
    } else {
        inicializarDropdownBrasil();
    }
}

// Tentar inicializar imediatamente
tentarInicializar();

/**
 * Carrega localização escolhida do localStorage e atualiza a UI
 */
function carregarLocalizacaoEscolhida() {
    try {
        const localizacaoSalva = localStorage.getItem('localizacaoEscolhida');
        if (localizacaoSalva) {
            const localizacao = JSON.parse(localizacaoSalva);
            console.log('📍 Localização escolhida carregada:', localizacao);
            
            // Atualizar texto de localização ao lado do botão
            if (typeof atualizarTextoLocalizacao === 'function') {
                atualizarTextoLocalizacao(localizacao);
            }
            
            // Atualizar indicador de localização
            if (typeof atualizarIndicadorLocalizacao === 'function') {
                atualizarIndicadorLocalizacao(localizacao);
            }
            
            // Atualizar título do dropdown se houver cidade ou estado
            const dropdownLink = document.querySelector('#brasil-dropdown > a');
            if (dropdownLink) {
                if (localizacao.cidade) {
                    // Formatar nome da cidade (converter slug para formato legível)
                    const cidadeFormatada = localizacao.cidade
                        .split('-')
                        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
                        .join(' ');
                    dropdownLink.innerHTML = `${cidadeFormatada} <i class="fa-solid fa-caret-down"></i>`;
                } else if (localizacao.estadoNome) {
                    dropdownLink.innerHTML = `${localizacao.estadoNome} <i class="fa-solid fa-caret-down"></i>`;
                }
            }
            
            return localizacao;
        }
    } catch (error) {
        console.warn('⚠️ Erro ao carregar localização escolhida:', error);
    }
    return null;
}

/**
 * Filtra anúncios por estado (placeholder - implementar conforme necessário)
 */
function filtrarAnunciosPorEstado(siglaEstado, nomeEstado) {
    console.log(`🔍 Filtrando anúncios por estado: ${nomeEstado} (${siglaEstado})`);
    // TODO: Implementar filtro de anúncios por estado
    // Por enquanto, apenas salva a escolha
}

/**
 * Filtra anúncios por cidade (placeholder - implementar conforme necessário)
 */
function filtrarAnunciosPorCidade(siglaEstado, cidade) {
    console.log(`🔍 Filtrando anúncios por cidade: ${cidade}, ${siglaEstado}`);
    // TODO: Implementar filtro de anúncios por cidade
    // Por enquanto, apenas salva a escolha
}

// Exportar funções globais
if (typeof window !== 'undefined') {
    window.inicializarDropdownBrasil = inicializarDropdownBrasil;
    window.selecionarEstado = selecionarEstado;
    window.abrirAnunciosEstado = abrirAnunciosEstado;
    window.abrirAnunciosCidade = abrirAnunciosCidade;
    window.carregarLocalizacaoEscolhida = carregarLocalizacaoEscolhida;
    window.filtrarAnunciosPorEstado = filtrarAnunciosPorEstado;
    window.filtrarAnunciosPorCidade = filtrarAnunciosPorCidade;
}

