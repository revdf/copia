// JavaScript para a página de anúncios
class AnunciosManager {
  constructor() {
    this.anuncios = [];
    this.filteredAnuncios = [];
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.currentView = "grid";
    this.filters = {
      categoria: "",
      cidade: "",
      precoMax: 1000,
      idade: "",
      servico: "",
    };

    this.init();
  }

  async init() {
    console.log("🚀 Inicializando AnunciosManager...");

    // Configurar Firebase
    this.db = firebase.firestore();
    this.auth = firebase.auth();

    // Configurar event listeners
    this.setupEventListeners();

    // Carregar anúncios
    await this.loadAnuncios();

    // Aplicar filtros iniciais
    this.applyFilters();

    console.log("✅ AnunciosManager inicializado com sucesso!");
  }

  setupEventListeners() {
    // Filtros
    document
      .getElementById("categoria-filter")
      .addEventListener("change", (e) => {
        this.filters.categoria = e.target.value;
        this.applyFilters();
      });

    document.getElementById("cidade-filter").addEventListener("change", (e) => {
      this.filters.cidade = e.target.value;
      this.applyFilters();
    });

    document.getElementById("preco-filter").addEventListener("input", (e) => {
      this.filters.precoMax = parseInt(e.target.value);
      document.getElementById(
        "preco-value"
      ).textContent = `R$ ${e.target.value}`;
      this.applyFilters();
    });

    document.getElementById("idade-filter").addEventListener("change", (e) => {
      this.filters.idade = e.target.value;
      this.applyFilters();
    });

    document
      .getElementById("servico-filter")
      .addEventListener("change", (e) => {
        this.filters.servico = e.target.value;
        this.applyFilters();
      });

    // Botões de filtro
    document.getElementById("clear-filters").addEventListener("click", () => {
      this.clearFilters();
    });

    document.getElementById("apply-filters").addEventListener("click", () => {
      this.applyFilters();
    });

    // Visualização
    document.getElementById("grid-view").addEventListener("click", () => {
      this.setView("grid");
    });

    document.getElementById("list-view").addEventListener("click", () => {
      this.setView("list");
    });

    // Paginação
    document.getElementById("prev-page").addEventListener("click", () => {
      this.previousPage();
    });

    document.getElementById("next-page").addEventListener("click", () => {
      this.nextPage();
    });

    // Modal de contato
    this.setupContactModal();
  }

  async loadAnuncios() {
    try {
      this.showLoading(true);

      console.log("📡 Carregando anúncios do Firebase...");

      // Buscar anúncios aprovados e publicados
      const snapshot = await this.db
        .collection("advertisements")
        .where("status", "==", "published")
        .orderBy("publishedAt", "desc")
        .get();

      this.anuncios = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        this.anuncios.push({
          id: doc.id,
          ...data,
          // Adicionar dados do usuário se disponível
          userData: data.userId ? { id: data.userId } : null,
        });
      });

      console.log(`✅ ${this.anuncios.length} anúncios carregados`);

      // Atualizar estatísticas
      this.updateStats();
    } catch (error) {
      console.error("❌ Erro ao carregar anúncios:", error);
      this.showError("Erro ao carregar anúncios. Tente novamente.");
    } finally {
      this.showLoading(false);
    }
  }

  applyFilters() {
    console.log("🔍 Aplicando filtros...", this.filters);

    this.filteredAnuncios = this.anuncios.filter((anuncio) => {
      // Filtro por categoria
      if (
        this.filters.categoria &&
        anuncio.categoria !== this.filters.categoria
      ) {
        return false;
      }

      // Filtro por cidade
      if (this.filters.cidade && anuncio.cidade !== this.filters.cidade) {
        return false;
      }

      // Filtro por preço
      if (this.filters.precoMax) {
        const precos = Object.values(anuncio.precos || {}).filter(
          (p) => p && parseFloat(p) > 0
        );
        if (precos.length > 0) {
          const precoMin = Math.min(...precos.map((p) => parseFloat(p)));
          if (precoMin > this.filters.precoMax) {
            return false;
          }
        }
      }

      // Filtro por idade
      if (this.filters.idade && anuncio.publicData?.idade) {
        const idade = anuncio.publicData.idade;
        switch (this.filters.idade) {
          case "18-25":
            if (idade < 18 || idade > 25) return false;
            break;
          case "26-35":
            if (idade < 26 || idade > 35) return false;
            break;
          case "36-45":
            if (idade < 36 || idade > 45) return false;
            break;
          case "46+":
            if (idade < 46) return false;
            break;
        }
      }

      // Filtro por serviço
      if (this.filters.servico) {
        const servicos = [
          ...(anuncio.servicos || []),
          ...(anuncio.servicosDiferenciados || []),
          ...(anuncio.euFaco || []),
        ];

        const servicoEncontrado = servicos.some((servico) =>
          servico.toLowerCase().includes(this.filters.servico.toLowerCase())
        );

        if (!servicoEncontrado) {
          return false;
        }
      }

      return true;
    });

    console.log(`✅ ${this.filteredAnuncios.length} anúncios após filtros`);

    // Resetar página
    this.currentPage = 1;

    // Renderizar resultados
    this.renderAnuncios();
    this.updateStats();
  }

  clearFilters() {
    console.log("🧹 Limpando filtros...");

    // Resetar filtros
    this.filters = {
      categoria: "",
      cidade: "",
      precoMax: 1000,
      idade: "",
      servico: "",
    };

    // Resetar campos do formulário
    document.getElementById("categoria-filter").value = "";
    document.getElementById("cidade-filter").value = "";
    document.getElementById("preco-filter").value = "500";
    document.getElementById("preco-value").textContent = "R$ 500";
    document.getElementById("idade-filter").value = "";
    document.getElementById("servico-filter").value = "";

    // Aplicar filtros (que agora estão vazios)
    this.applyFilters();
  }

  setView(view) {
    this.currentView = view;

    // Atualizar botões
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    if (view === "grid") {
      document.getElementById("grid-view").classList.add("active");
      document.getElementById("anuncios-grid").classList.remove("list-view");
    } else {
      document.getElementById("list-view").classList.add("active");
      document.getElementById("anuncios-grid").classList.add("list-view");
    }

    // Re-renderizar
    this.renderAnuncios();
  }

  renderAnuncios() {
    const grid = document.getElementById("anuncios-grid");
    const noResults = document.getElementById("no-results");

    if (this.filteredAnuncios.length === 0) {
      grid.innerHTML = "";
      noResults.style.display = "block";
      this.updatePagination();
      return;
    }

    noResults.style.display = "none";

    // Calcular anúncios da página atual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageAnuncios = this.filteredAnuncios.slice(startIndex, endIndex);

    // Renderizar cards
    grid.innerHTML = pageAnuncios
      .map((anuncio) => this.createAnuncioCard(anuncio))
      .join("");

    // Atualizar paginação
    this.updatePagination();
  }

  createAnuncioCard(anuncio) {
    const precoMin = this.getPrecoMinimo(anuncio.precos);
    const idade = anuncio.publicData?.idade || "N/A";
    const cidade = anuncio.cidade || "N/A";
    const descricao = anuncio.publicData?.texto || "";
    const nome = anuncio.publicData?.nome || "Nome não informado";

    return `
            <div class="anuncio-card ${
              this.currentView === "list" ? "list-view" : ""
            }" 
                 onclick="anunciosManager.openAnuncioDetails('${anuncio.id}')">
                <div class="card-photo">
                    <img src="${
                      anuncio.photos?.capa ||
                      "https://via.placeholder.com/300x250?text=Sem+Foto"
                    }" 
                         alt="${nome}" 
                         onerror="this.src='https://via.placeholder.com/300x250?text=Erro+ao+Carregar'">
                    <div class="card-overlay">
                        <span class="card-preco">R$ ${precoMin}</span>
                    </div>
                </div>
                <div class="card-info">
                    <h3>${nome}</h3>
                    <div class="card-meta">
                        <span><i class="fas fa-birthday-cake"></i> ${idade} anos</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${cidade}</span>
                        <span><i class="fas fa-tag"></i> ${
                          anuncio.categoria || "N/A"
                        }</span>
                    </div>
                    <p class="card-descricao">${descricao.substring(0, 100)}${
      descricao.length > 100 ? "..." : ""
    }</p>
                    <button class="ver-detalhes-btn" onclick="event.stopPropagation(); anunciosManager.openAnuncioDetails('${
                      anuncio.id
                    }')">
                        <i class="fas fa-eye"></i> Ver Detalhes
                    </button>
                </div>
            </div>
        `;
  }

  getPrecoMinimo(precos) {
    if (!precos) return "N/A";

    const valores = Object.values(precos)
      .filter((p) => p && parseFloat(p) > 0)
      .map((p) => parseFloat(p));

    return valores.length > 0 ? Math.min(...valores) : "N/A";
  }

  updateStats() {
    document.getElementById("total-anuncios").textContent =
      this.anuncios.length;
    document.getElementById("anuncios-visiveis").textContent =
      this.filteredAnuncios.length;

    // Simular anúncios online (usuários ativos nas últimas 24h)
    const onlineCount = Math.floor(this.filteredAnuncios.length * 0.3);
    document.getElementById("anuncios-online").textContent = onlineCount;
  }

  updatePagination() {
    const totalPages = Math.ceil(
      this.filteredAnuncios.length / this.itemsPerPage
    );
    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredAnuncios.length
    );

    // Atualizar informações da página
    document.getElementById(
      "page-info"
    ).textContent = `Página ${this.currentPage} de ${totalPages}`;
    document.getElementById(
      "results-info"
    ).textContent = `${this.filteredAnuncios.length} resultados`;

    // Atualizar botões
    document.getElementById("prev-page").disabled = this.currentPage === 1;
    document.getElementById("next-page").disabled =
      this.currentPage === totalPages || totalPages === 0;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderAnuncios();
    }
  }

  nextPage() {
    const totalPages = Math.ceil(
      this.filteredAnuncios.length / this.itemsPerPage
    );
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.renderAnuncios();
    }
  }

  openAnuncioDetails(anuncioId) {
    console.log("🔍 Abrindo detalhes do anúncio:", anuncioId);
    // Redirecionar para página de detalhes
    window.location.href = `anuncio-detalhes.html?id=${anuncioId}`;
  }

  setupContactModal() {
    const modal = document.getElementById("contact-modal");
    const closeBtn = document.querySelector(".close");

    // Fechar modal
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    // Fechar ao clicar fora do modal
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    // Botões de contato
    document.getElementById("call-button").addEventListener("click", () => {
      const phone = document.getElementById("contact-phone").textContent;
      if (phone && phone !== "-") {
        window.location.href = `tel:${phone}`;
      }
    });

    document.getElementById("whatsapp-button").addEventListener("click", () => {
      const whatsapp = document.getElementById("contact-whatsapp").textContent;
      if (whatsapp && whatsapp !== "-") {
        window.location.href = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
      }
    });
  }

  showContactModal(anuncio) {
    const modal = document.getElementById("contact-modal");
    const phone = anuncio.privateData?.telefone || "-";
    const whatsapp = anuncio.privateData?.whatsapp || "-";

    document.getElementById("contact-phone").textContent = phone;
    document.getElementById("contact-whatsapp").textContent = whatsapp;

    modal.style.display = "block";
  }

  showLoading(show) {
    const loading = document.getElementById("loading");
    const grid = document.getElementById("anuncios-grid");

    if (show) {
      loading.style.display = "block";
      grid.style.display = "none";
    } else {
      loading.style.display = "none";
      grid.style.display = "grid";
    }
  }

  showError(message) {
    const grid = document.getElementById("anuncios-grid");
    grid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Erro</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-refresh"></i> Tentar Novamente
                </button>
            </div>
        `;
  }
}

// Inicializar quando a página carregar
let anunciosManager;

document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 Página de anúncios carregada");
  anunciosManager = new AnunciosManager();
});

// Funções globais para uso nos templates
window.anunciosManager = anunciosManager;
