// JavaScript para a página de detalhes do anúncio
class AnuncioDetalhesManager {
  constructor() {
    this.anuncio = null;
    this.currentPhotoIndex = 0;
    this.photos = [];
    this.relatedAnuncios = [];

    this.init();
  }

  async init() {
    console.log("🚀 Inicializando AnuncioDetalhesManager...");

    // Configurar Firebase
    this.db = firebase.firestore();
    this.auth = firebase.auth();

    // Obter ID do anúncio da URL
    const urlParams = new URLSearchParams(window.location.search);
    this.anuncioId = urlParams.get("id");

    if (!this.anuncioId) {
      this.showError("ID do anúncio não fornecido");
      return;
    }

    // Configurar event listeners
    this.setupEventListeners();

    // Carregar dados do anúncio
    await this.loadAnuncio();

    console.log("✅ AnuncioDetalhesManager inicializado com sucesso!");
  }

  setupEventListeners() {
    // Botão voltar
    document.getElementById("back-button").addEventListener("click", () => {
      window.history.back();
    });

    // Navegação de fotos
    document.getElementById("prev-photo").addEventListener("click", () => {
      this.previousPhoto();
    });

    document.getElementById("next-photo").addEventListener("click", () => {
      this.nextPhoto();
    });

    // Botões de contato
    document.getElementById("call-button").addEventListener("click", () => {
      this.makeCall();
    });

    document.getElementById("whatsapp-button").addEventListener("click", () => {
      this.openWhatsApp();
    });

    document.getElementById("favorite-button").addEventListener("click", () => {
      this.toggleFavorite();
    });

    // Modal de foto
    this.setupPhotoModal();
  }

  async loadAnuncio() {
    try {
      this.showLoading(true);

      console.log("📡 Carregando anúncio:", this.anuncioId);

      // Buscar anúncio
      const doc = await this.db
        .collection("advertisements")
        .doc(this.anuncioId)
        .get();

      if (!doc.exists) {
        throw new Error("Anúncio não encontrado");
      }

      this.anuncio = { id: doc.id, ...doc.data() };

      console.log("✅ Anúncio carregado:", this.anuncio);

      // Preparar fotos
      this.preparePhotos();

      // Renderizar conteúdo
      this.renderAnuncio();

      // Carregar anúncios relacionados
      await this.loadRelatedAnuncios();
    } catch (error) {
      console.error("❌ Erro ao carregar anúncio:", error);
      this.showError(error.message);
    } finally {
      this.showLoading(false);
    }
  }

  preparePhotos() {
    this.photos = [];

    // Adicionar foto da capa
    if (this.anuncio.photos?.capa) {
      this.photos.push({
        url: this.anuncio.photos.capa,
        type: "capa",
      });
    }

    // Adicionar foto do perfil
    if (this.anuncio.photos?.perfil) {
      this.photos.push({
        url: this.anuncio.photos.perfil,
        type: "perfil",
      });
    }

    // Adicionar fotos da galeria
    if (
      this.anuncio.photos?.galeria &&
      Array.isArray(this.anuncio.photos.galeria)
    ) {
      this.anuncio.photos.galeria.forEach((url, index) => {
        this.photos.push({
          url: url,
          type: "galeria",
          index: index,
        });
      });
    }

    console.log("📸 Fotos preparadas:", this.photos.length);
  }

  renderAnuncio() {
    // Atualizar título e meta
    document.getElementById("anuncio-titulo").textContent =
      this.anuncio.publicData?.nome || "Nome não informado";

    this.renderMeta();

    // Renderizar galeria
    this.renderPhotoGallery();

    // Renderizar informações
    this.renderDescricao();
    this.renderCaracteristicas();
    this.renderServicos();
    this.renderPrecos();
    this.renderHorarios();
    this.renderLocalizacao();
    this.renderFormasPagamento();
    this.renderContactInfo();

    // Mostrar conteúdo
    document.getElementById("anuncio-content").style.display = "block";
  }

  renderMeta() {
    const meta = document.getElementById("anuncio-meta");
    const idade = this.anuncio.publicData?.idade || "N/A";
    const cidade = this.anuncio.cidade || "N/A";
    const categoria = this.anuncio.categoria || "N/A";

    meta.innerHTML = `
            <span><i class="fas fa-birthday-cake"></i> ${idade} anos</span>
            <span><i class="fas fa-map-marker-alt"></i> ${cidade}</span>
            <span><i class="fas fa-tag"></i> ${categoria}</span>
        `;
  }

  renderPhotoGallery() {
    if (this.photos.length === 0) {
      document.getElementById("main-photo").src =
        "https://via.placeholder.com/500x500?text=Sem+Foto";
      return;
    }

    // Foto principal
    document.getElementById("main-photo").src = this.photos[0].url;

    // Miniaturas
    const thumbnails = document.getElementById("photo-thumbnails");
    thumbnails.innerHTML = this.photos
      .map(
        (photo, index) => `
            <div class="photo-thumbnail ${index === 0 ? "active" : ""}" 
                 onclick="anuncioDetalhesManager.setCurrentPhoto(${index})">
                <img src="${photo.url}" alt="Foto ${index + 1}">
            </div>
        `
      )
      .join("");

    // Atualizar navegação
    this.updatePhotoNavigation();
  }

  renderDescricao() {
    const descricao =
      this.anuncio.publicData?.texto || "Descrição não disponível";
    document.getElementById("anuncio-descricao").textContent = descricao;
  }

  renderCaracteristicas() {
    const container = document.getElementById("caracteristicas-fisicas");
    const data = this.anuncio.publicData || {};

    const caracteristicas = [
      { label: "Idade", value: data.idade ? `${data.idade} anos` : "N/A" },
      { label: "Peso", value: data.peso ? `${data.peso} kg` : "N/A" },
      { label: "Altura", value: data.altura ? `${data.altura} cm` : "N/A" },
      { label: "Etnia", value: this.anuncio.etnia || "N/A" },
      { label: "Cor dos Olhos", value: this.anuncio.corOlhos || "N/A" },
      { label: "Estilo do Cabelo", value: this.anuncio.estiloCabelo || "N/A" },
      { label: "Cor do Cabelo", value: this.anuncio.corCabelo || "N/A" },
      {
        label: "Tamanho do Cabelo",
        value: this.anuncio.tamanhoCabelo || "N/A",
      },
      { label: "Tatuagem", value: this.anuncio.tatuagem || "N/A" },
      { label: "Piercings", value: this.anuncio.piercings || "N/A" },
      { label: "Fumante", value: this.anuncio.fumante || "N/A" },
    ];

    container.innerHTML = caracteristicas
      .map(
        (char) => `
            <div class="characteristic-item">
                <strong>${char.label}</strong>
                <span>${char.value}</span>
            </div>
        `
      )
      .join("");
  }

  renderServicos() {
    const container = document.getElementById("servicos-oferecidos");
    const servicos = [
      ...(this.anuncio.servicos || []),
      ...(this.anuncio.servicosDiferenciados || []),
      ...(this.anuncio.euFaco || []),
    ];

    if (servicos.length === 0) {
      container.innerHTML = "<p>Nenhum serviço informado.</p>";
      return;
    }

    container.innerHTML = servicos
      .map(
        (servico) => `
            <div class="service-item">
                <span>${servico}</span>
            </div>
        `
      )
      .join("");
  }

  renderPrecos() {
    const container = document.getElementById("precos-grid");
    const precos = this.anuncio.precos || {};

    const precoItems = [
      { label: "1 Hora", value: precos.umaHora },
      { label: "Rapidinha", value: precos.rapidinha },
      { label: "30 Minutos", value: precos.trintaMinutos },
      { label: "2 Horas", value: precos.duasHoras },
      { label: "4 Horas", value: precos.quatroHoras },
      { label: "Diária", value: precos.diaria },
      { label: "Pernoite", value: precos.pernoite },
      { label: "Diária Viagem", value: precos.diariaViagem },
    ];

    const precosValidos = precoItems.filter(
      (item) => item.value && parseFloat(item.value) > 0
    );

    if (precosValidos.length === 0) {
      container.innerHTML = "<p>Preços não informados.</p>";
      return;
    }

    container.innerHTML = precosValidos
      .map(
        (item) => `
            <div class="preco-item">
                <strong>${item.label}</strong>
                <div class="preco-valor">R$ ${item.value}</div>
            </div>
        `
      )
      .join("");
  }

  renderHorarios() {
    const container = document.getElementById("horarios-atendimento");
    const horarios = this.anuncio.horarios || {};

    if (horarios.opcao24h === "sim") {
      container.innerHTML = `
                <div class="horario-item 24h">
                    <i class="fas fa-clock"></i>
                    <strong>Atendimento 24 horas</strong>
                </div>
            `;
      return;
    }

    if (horarios.mesmoHorario === "sim" && horarios.horarioUnico) {
      const horario = horarios.horarioUnico;
      container.innerHTML = `
                <div class="horario-item">
                    <strong>Horário Único</strong>
                    <span>${horario.horaInicio} às ${horario.horaFim}</span>
                </div>
            `;
      return;
    }

    // Horários individuais por dia
    const dias = [
      "segunda",
      "terca",
      "quarta",
      "quinta",
      "sexta",
      "sabado",
      "domingo",
    ];
    const diasNomes = [
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
      "Domingo",
    ];

    const horariosHTML = dias
      .map((dia, index) => {
        const horarioDia = horarios.horariosIndividuais?.[dia];
        if (!horarioDia) return "";

        if (horarioDia.is24h) {
          return `
                    <div class="horario-item dia-semana">${diasNomes[index]}</div>
                    <div class="horario-item 24h">24 horas</div>
                `;
        }

        if (horarioDia.horaInicio && horarioDia.horaFim) {
          return `
                    <div class="horario-item dia-semana">${diasNomes[index]}</div>
                    <div class="horario-item horario">${horarioDia.horaInicio} às ${horarioDia.horaFim}</div>
                `;
        }

        return `
                <div class="horario-item dia-semana">${diasNomes[index]}</div>
                <div class="horario-item horario">Fechado</div>
            `;
      })
      .filter((html) => html)
      .join("");

    if (horariosHTML) {
      container.innerHTML = `<div class="horarios-grid">${horariosHTML}</div>`;
    } else {
      container.innerHTML = "<p>Horários não informados.</p>";
    }
  }

  renderLocalizacao() {
    const container = document.getElementById("localizacao-info");
    const cep = this.anuncio.cep || "";
    const estado = this.anuncio.estado || "";
    const cidade = this.anuncio.cidade || "";
    const bairro = this.anuncio.bairro || "";

    let localizacaoHTML = "";

    if (cidade) {
      localizacaoHTML += `
                <div class="localizacao-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span><strong>Cidade:</strong> ${cidade}</span>
                </div>
            `;
    }

    if (estado) {
      localizacaoHTML += `
                <div class="localizacao-item">
                    <i class="fas fa-flag"></i>
                    <span><strong>Estado:</strong> ${estado}</span>
                </div>
            `;
    }

    if (bairro) {
      localizacaoHTML += `
                <div class="localizacao-item">
                    <i class="fas fa-building"></i>
                    <span><strong>Bairro:</strong> ${bairro}</span>
                </div>
            `;
    }

    if (cep) {
      localizacaoHTML += `
                <div class="localizacao-item">
                    <i class="fas fa-mail-bulk"></i>
                    <span><strong>CEP:</strong> ${cep}</span>
                </div>
            `;
    }

    container.innerHTML =
      localizacaoHTML || "<p>Localização não informada.</p>";
  }

  renderFormasPagamento() {
    const container = document.getElementById("formas-pagamento");
    const formas = this.anuncio.formasPagamento || [];

    if (formas.length === 0) {
      container.innerHTML = "<p>Formas de pagamento não informadas.</p>";
      return;
    }

    const icones = {
      dinheiro: "fas fa-money-bill-wave",
      cartao: "fas fa-credit-card",
      pix: "fas fa-qrcode",
      transferencia: "fas fa-university",
    };

    container.innerHTML = `
            <div class="pagamento-grid">
                ${formas
                  .map(
                    (forma) => `
                    <div class="pagamento-item">
                        <i class="${icones[forma] || "fas fa-money-bill"}"></i>
                        <span>${
                          forma.charAt(0).toUpperCase() + forma.slice(1)
                        }</span>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  renderContactInfo() {
    const container = document.getElementById("contact-info");
    const telefone = this.anuncio.privateData?.telefone || "";
    const whatsapp = this.anuncio.privateData?.whatsapp || "";

    let contactHTML = "";

    if (telefone) {
      contactHTML += `
                <div class="contact-info-item">
                    <i class="fas fa-phone"></i>
                    <span>${telefone}</span>
                </div>
            `;
    }

    if (whatsapp) {
      contactHTML += `
                <div class="contact-info-item">
                    <i class="fab fa-whatsapp"></i>
                    <span>${whatsapp}</span>
                </div>
            `;
    }

    container.innerHTML =
      contactHTML || "<p>Informações de contato não disponíveis.</p>";
  }

  async loadRelatedAnuncios() {
    try {
      console.log("📡 Carregando anúncios relacionados...");

      // Buscar anúncios da mesma categoria
      const snapshot = await this.db
        .collection("advertisements")
        .where("categoria", "==", this.anuncio.categoria)
        .where("status", "==", "published")
        .limit(4)
        .get();

      this.relatedAnuncios = [];
      snapshot.forEach((doc) => {
        if (doc.id !== this.anuncioId) {
          this.relatedAnuncios.push({ id: doc.id, ...doc.data() });
        }
      });

      if (this.relatedAnuncios.length > 0) {
        this.renderRelatedAnuncios();
        document.getElementById("related-anuncios").style.display = "block";
      }

      console.log(
        `✅ ${this.relatedAnuncios.length} anúncios relacionados carregados`
      );
    } catch (error) {
      console.error("❌ Erro ao carregar anúncios relacionados:", error);
    }
  }

  renderRelatedAnuncios() {
    const container = document.getElementById("related-grid");

    container.innerHTML = this.relatedAnuncios
      .map((anuncio) => {
        const nome = anuncio.publicData?.nome || "Nome não informado";
        const idade = anuncio.publicData?.idade || "N/A";
        const cidade = anuncio.cidade || "N/A";
        const precoMin = this.getPrecoMinimo(anuncio.precos);
        const foto =
          anuncio.photos?.capa ||
          "https://via.placeholder.com/250x200?text=Sem+Foto";

        return `
                <div class="related-card" onclick="window.location.href='anuncio-detalhes.html?id=${anuncio.id}'">
                    <img src="${foto}" alt="${nome}">
                    <div class="related-card-info">
                        <h4>${nome}</h4>
                        <p>${idade} anos • ${cidade}</p>
                        <div class="preco">R$ ${precoMin}</div>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  getPrecoMinimo(precos) {
    if (!precos) return "N/A";

    const valores = Object.values(precos)
      .filter((p) => p && parseFloat(p) > 0)
      .map((p) => parseFloat(p));

    return valores.length > 0 ? Math.min(...valores) : "N/A";
  }

  // Navegação de fotos
  setCurrentPhoto(index) {
    if (index < 0 || index >= this.photos.length) return;

    this.currentPhotoIndex = index;

    // Atualizar foto principal
    document.getElementById("main-photo").src = this.photos[index].url;

    // Atualizar miniaturas ativas
    document.querySelectorAll(".photo-thumbnail").forEach((thumb, i) => {
      thumb.classList.toggle("active", i === index);
    });

    this.updatePhotoNavigation();
  }

  previousPhoto() {
    const newIndex =
      this.currentPhotoIndex > 0
        ? this.currentPhotoIndex - 1
        : this.photos.length - 1;
    this.setCurrentPhoto(newIndex);
  }

  nextPhoto() {
    const newIndex =
      this.currentPhotoIndex < this.photos.length - 1
        ? this.currentPhotoIndex + 1
        : 0;
    this.setCurrentPhoto(newIndex);
  }

  updatePhotoNavigation() {
    const prevBtn = document.getElementById("prev-photo");
    const nextBtn = document.getElementById("next-photo");

    if (this.photos.length <= 1) {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    } else {
      prevBtn.style.display = "block";
      nextBtn.style.display = "block";
    }
  }

  setupPhotoModal() {
    const modal = document.getElementById("photo-modal");
    const closeBtn = document.querySelector(".close");

    // Abrir modal ao clicar na foto principal
    document.getElementById("main-photo").addEventListener("click", () => {
      this.openPhotoModal();
    });

    // Fechar modal
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    // Fechar ao clicar fora
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    // Navegação no modal
    document.getElementById("modal-prev").addEventListener("click", () => {
      this.previousPhoto();
      document.getElementById("modal-photo").src =
        this.photos[this.currentPhotoIndex].url;
    });

    document.getElementById("modal-next").addEventListener("click", () => {
      this.nextPhoto();
      document.getElementById("modal-photo").src =
        this.photos[this.currentPhotoIndex].url;
    });
  }

  openPhotoModal() {
    const modal = document.getElementById("photo-modal");
    document.getElementById("modal-photo").src =
      this.photos[this.currentPhotoIndex].url;
    modal.style.display = "block";
  }

  // Ações de contato
  makeCall() {
    const telefone = this.anuncio.privateData?.telefone;
    if (telefone) {
      window.location.href = `tel:${telefone}`;
    } else {
      alert("Telefone não disponível");
    }
  }

  openWhatsApp() {
    const whatsapp = this.anuncio.privateData?.whatsapp;
    if (whatsapp) {
      const numero = whatsapp.replace(/\D/g, "");
      const mensagem = `Olá! Vi seu anúncio e gostaria de saber mais informações.`;
      window.open(
        `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`,
        "_blank"
      );
    } else {
      alert("WhatsApp não disponível");
    }
  }

  toggleFavorite() {
    // Implementar sistema de favoritos
    const btn = document.getElementById("favorite-button");
    const isFavorited = btn.classList.contains("favorited");

    if (isFavorited) {
      btn.classList.remove("favorited");
      btn.innerHTML = '<i class="fas fa-heart"></i> Favoritar';
      alert("Removido dos favoritos");
    } else {
      btn.classList.add("favorited");
      btn.innerHTML = '<i class="fas fa-heart"></i> Favoritado';
      alert("Adicionado aos favoritos");
    }
  }

  showLoading(show) {
    const loading = document.getElementById("loading");
    const content = document.getElementById("anuncio-content");
    const error = document.getElementById("error");

    if (show) {
      loading.style.display = "block";
      content.style.display = "none";
      error.style.display = "none";
    } else {
      loading.style.display = "none";
    }
  }

  showError(message) {
    const error = document.getElementById("error");
    const errorText = document.getElementById("error-text");

    errorText.textContent = message;
    error.style.display = "block";

    this.showLoading(false);
  }
}

// Inicializar quando a página carregar
let anuncioDetalhesManager;

document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 Página de detalhes carregada");
  anuncioDetalhesManager = new AnuncioDetalhesManager();
});

// Funções globais para uso nos templates
window.anuncioDetalhesManager = anuncioDetalhesManager;
