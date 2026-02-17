// ================================== */
// ======== GALERIA 7 COLUNAS ======== */
// ================================== */

class Galeria7Colunas {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      apiUrl: 'http://localhost:5001/api/anuncios',
      itensPorPagina: 28, // 4 linhas x 7 colunas
      categoria: null,
      ...options
    };
    
    this.dados = [];
    this.paginaAtual = 1;
    this.totalPaginas = 1;
    this.carregando = false;
    
    this.init();
  }
  
  async init() {
    this.renderEstrutura();
    this.bindEvents();
    await this.carregarDados();
  }
  
  renderEstrutura() {
    this.container.innerHTML = `
      <div class="galeria-container">
        <h2 class="galeria-titulo" id="galeria-titulo">Acompanhantes em Destaque</h2>
        
        <div class="galeria-controles">
          <button class="controle-botao ativo" data-categoria="todos">
            <i class="fas fa-th"></i> Todos
          </button>
          <button class="controle-botao" data-categoria="premium">
            <i class="fas fa-crown"></i> Premium
          </button>
          <button class="controle-botao" data-categoria="massagista">
            <i class="fas fa-spa"></i> Massagista
          </button>
          <button class="controle-botao" data-categoria="trans">
            <i class="fas fa-transgender"></i> Trans
          </button>
          <button class="controle-botao" data-categoria="homem">
            <i class="fas fa-male"></i> Homens
          </button>
          <div class="anuncios-contador" id="anuncios-contador">
            Carregando...
          </div>
        </div>
        
        <div class="galeria-loading" id="galeria-loading">
          <i class="fas fa-spinner"></i> Carregando anúncios...
        </div>
        
        <div class="galeria-grid" id="galeria-grid">
          <!-- Anúncios serão inseridos aqui -->
        </div>
        
        <div class="galeria-paginacao" id="galeria-paginacao">
          <!-- Paginação será inserida aqui -->
        </div>
      </div>
    `;
  }
  
  bindEvents() {
    // Eventos dos botões de categoria
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.controle-botao[data-categoria]')) {
        const botao = e.target.closest('.controle-botao[data-categoria]');
        const categoria = botao.dataset.categoria;
        this.filtrarPorCategoria(categoria);
      }
      
      // Eventos de paginação
      if (e.target.closest('.pagina-botao')) {
        const botao = e.target.closest('.pagina-botao');
        const pagina = parseInt(botao.dataset.pagina);
        if (pagina && !botao.disabled) {
          this.irParaPagina(pagina);
        }
      }
      
      // Eventos dos cards
      if (e.target.closest('.anuncio-card')) {
        const card = e.target.closest('.anuncio-card');
        const id = card.dataset.id;
        this.abrirDetalhes(id);
      }
    });
  }
  
  async carregarDados() {
    if (this.carregando) return;
    
    this.carregando = true;
    this.mostrarLoading(true);
    
    try {
      const response = await fetch(this.options.apiUrl);
      const data = await response.json();
      
      if (data.success) {
        this.dados = data.data || [];
        this.processarDados();
        this.renderizarGaleria();
        this.atualizarContador();
        this.renderizarPaginacao();
      } else {
        throw new Error(data.error || 'Erro ao carregar dados');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.mostrarErro('Erro ao carregar anúncios. Verifique a conexão.');
    } finally {
      this.carregando = false;
      this.mostrarLoading(false);
    }
  }
  
  processarDados() {
    // Processar e enriquecer os dados
    this.dados = this.dados.map(anuncio => ({
      ...anuncio,
      // Garantir que temos uma imagem
      imagem: this.obterImagem(anuncio),
      // Formatar preço
      precoFormatado: this.formatarPreco(anuncio.preco || anuncio.price),
      // Formatar descrição
      descricaoResumida: this.resumirTexto(anuncio.descricao || anuncio.description || '', 80),
      // Dados de engajamento
      views: anuncio.views || Math.floor(Math.random() * 1000),
      likes: anuncio.likes || Math.floor(Math.random() * 100)
    }));
  }
  
  obterImagem(anuncio) {
    // Prioridade das imagens
    const imagens = [
      anuncio.foto_capa,
      anuncio.coverImage,
      anuncio.foto_stories,
      anuncio.profileImage,
      anuncio.galeria_1,
      anuncio.galeria_2,
      anuncio.galeria_3
    ].filter(img => img);
    
    if (imagens.length > 0) {
      // Se a imagem não tem protocolo, adicionar caminho local
      const img = imagens[0];
      if (img.startsWith('http')) {
        return img;
      } else {
        return `../fotinha/fotos/${img}`;
      }
    }
    
    // Fallback para imagem padrão
    return 'https://via.placeholder.com/300x400/FFB6C1/FFFFFF?text=Sem+Imagem';
  }
  
  formatarPreco(preco) {
    if (!preco) return 'R$ 0';
    return `R$ ${preco.toLocaleString('pt-BR')}`;
  }
  
  resumirTexto(texto, limite) {
    if (!texto) return 'Descrição não disponível';
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
  }
  
  filtrarPorCategoria(categoria) {
    // Atualizar botões ativos
    this.container.querySelectorAll('.controle-botao').forEach(btn => {
      btn.classList.remove('ativo');
    });
    this.container.querySelector(`[data-categoria="${categoria}"]`).classList.add('ativo');
    
    // Atualizar título
    const titulo = this.container.querySelector('#galeria-titulo');
    if (categoria === 'todos') {
      titulo.textContent = 'Acompanhantes em Destaque';
    } else {
      const categoriaNome = categoria.charAt(0).toUpperCase() + categoria.slice(1);
      titulo.textContent = `${categoriaNome} - Acompanhantes`;
    }
    
    // Filtrar dados
    this.options.categoria = categoria === 'todos' ? null : categoria;
    this.paginaAtual = 1;
    this.renderizarGaleria();
    this.atualizarContador();
    this.renderizarPaginacao();
  }
  
  renderizarGaleria() {
    const grid = this.container.querySelector('#galeria-grid');
    
    // Filtrar dados por categoria
    let dadosFiltrados = this.dados;
    if (this.options.categoria) {
      dadosFiltrados = this.dados.filter(anuncio => 
        anuncio.categoria === this.options.categoria
      );
    }
    
    // Calcular paginação
    const inicio = (this.paginaAtual - 1) * this.options.itensPorPagina;
    const fim = inicio + this.options.itensPorPagina;
    const dadosPagina = dadosFiltrados.slice(inicio, fim);
    
    this.totalPaginas = Math.ceil(dadosFiltrados.length / this.options.itensPorPagina);
    
    if (dadosPagina.length === 0) {
      grid.innerHTML = `
        <div class="galeria-vazia">
          <i class="fas fa-search"></i>
          <h3>Nenhum anúncio encontrado</h3>
          <p>Tente alterar os filtros ou verifique novamente mais tarde.</p>
        </div>
      `;
      return;
    }
    
    // Renderizar cards
    grid.innerHTML = dadosPagina.map(anuncio => this.criarCard(anuncio)).join('');
  }
  
  criarCard(anuncio) {
    const destaque = anuncio.destaque ? '<div class="destaque-badge">Destaque</div>' : '';
    
    return `
      <div class="anuncio-card" data-id="${anuncio.id}">
        <div class="anuncio-imagem-container">
          <img src="${anuncio.imagem}" alt="${anuncio.nome}" class="anuncio-imagem" loading="lazy">
          <div class="categoria-badge">${anuncio.categoria}</div>
          <div class="preco-badge">${anuncio.precoFormatado}</div>
          ${destaque}
        </div>
        <div class="anuncio-info">
          <h3 class="anuncio-nome">${anuncio.nome}</h3>
          <p class="anuncio-descricao">${anuncio.descricaoResumida}</p>
          <div class="anuncio-meta">
            <div class="anuncio-views">
              <i class="fas fa-eye"></i>
              <span>${anuncio.views}</span>
            </div>
            <div class="anuncio-likes">
              <i class="fas fa-heart"></i>
              <span>${anuncio.likes}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  renderizarPaginacao() {
    const paginacao = this.container.querySelector('#galeria-paginacao');
    
    if (this.totalPaginas <= 1) {
      paginacao.innerHTML = '';
      return;
    }
    
    let html = '';
    
    // Botão anterior
    html += `
      <button class="pagina-botao" data-pagina="${this.paginaAtual - 1}" 
              ${this.paginaAtual === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
      </button>
    `;
    
    // Páginas
    const inicio = Math.max(1, this.paginaAtual - 2);
    const fim = Math.min(this.totalPaginas, this.paginaAtual + 2);
    
    for (let i = inicio; i <= fim; i++) {
      html += `
        <button class="pagina-botao ${i === this.paginaAtual ? 'ativo' : ''}" 
                data-pagina="${i}">
          ${i}
        </button>
      `;
    }
    
    // Botão próximo
    html += `
      <button class="pagina-botao" data-pagina="${this.paginaAtual + 1}" 
              ${this.paginaAtual === this.totalPaginas ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
      </button>
    `;
    
    paginacao.innerHTML = html;
  }
  
  irParaPagina(pagina) {
    if (pagina < 1 || pagina > this.totalPaginas || pagina === this.paginaAtual) {
      return;
    }
    
    this.paginaAtual = pagina;
    this.renderizarGaleria();
    this.renderizarPaginacao();
    
    // Scroll para o topo da galeria
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  atualizarContador() {
    const contador = this.container.querySelector('#anuncios-contador');
    let dadosFiltrados = this.dados;
    
    if (this.options.categoria) {
      dadosFiltrados = this.dados.filter(anuncio => 
        anuncio.categoria === this.options.categoria
      );
    }
    
    const total = dadosFiltrados.length;
    const inicio = (this.paginaAtual - 1) * this.options.itensPorPagina + 1;
    const fim = Math.min(this.paginaAtual * this.options.itensPorPagina, total);
    
    contador.textContent = `${inicio}-${fim} de ${total} anúncios`;
  }
  
  mostrarLoading(mostrar) {
    const loading = this.container.querySelector('#galeria-loading');
    const grid = this.container.querySelector('#galeria-grid');
    
    if (mostrar) {
      loading.style.display = 'flex';
      grid.style.display = 'none';
    } else {
      loading.style.display = 'none';
      grid.style.display = 'grid';
    }
  }
  
  mostrarErro(mensagem) {
    const grid = this.container.querySelector('#galeria-grid');
    grid.innerHTML = `
      <div class="galeria-vazia">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Erro ao carregar</h3>
        <p>${mensagem}</p>
        <button class="controle-botao" onclick="location.reload()">
          <i class="fas fa-refresh"></i> Tentar novamente
        </button>
      </div>
    `;
  }
  
  abrirDetalhes(id) {
    // Encontrar o anúncio
    const anuncio = this.dados.find(a => a.id === id);
    if (!anuncio) return;
    
    // Criar modal de detalhes (implementar conforme necessário)
    console.log('Abrir detalhes do anúncio:', anuncio);
    
    // Por enquanto, apenas um alert
    alert(`Detalhes de ${anuncio.nome}\n\nCategoria: ${anuncio.categoria}\nPreço: ${anuncio.precoFormatado}\n\nDescrição: ${anuncio.descricao || anuncio.description || 'Não disponível'}`);
  }
  
  // Método público para atualizar dados
  async atualizarDados() {
    await this.carregarDados();
  }
  
  // Método público para filtrar por categoria específica
  filtrarCategoria(categoria) {
    this.filtrarPorCategoria(categoria);
  }
}

// Inicializar galeria quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Verificar se existe o container da galeria
  if (document.getElementById('galeria-7-colunas')) {
    window.galeria = new Galeria7Colunas('galeria-7-colunas');
  }
});















