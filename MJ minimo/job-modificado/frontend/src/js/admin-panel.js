// JavaScript para o painel de administração
class AdminPanelManager {
  constructor() {
    this.currentUser = null;
    this.currentSection = "dashboard";
    this.anuncios = {
      pending: [],
      approved: [],
      rejected: [],
    };
    this.users = [];
    this.stats = {};

    this.init();
  }

  async init() {
    console.log("🚀 Inicializando AdminPanelManager...");

    // Configurar Firebase
    this.db = firebase.firestore();
    this.auth = firebase.auth();

    // Verificar autenticação
    await this.checkAuth();

    // Configurar event listeners
    this.setupEventListeners();

    // Carregar dados iniciais
    await this.loadDashboardData();

    console.log("✅ AdminPanelManager inicializado com sucesso!");
  }

  async checkAuth() {
    return new Promise((resolve, reject) => {
      this.auth.onAuthStateChanged(async (user) => {
        if (!user) {
          window.location.href = "index.html";
          return;
        }

        // Verificar se o usuário é admin
        const userDoc = await this.db
          .collection("advertisers")
          .doc(user.uid)
          .get();
        const userData = userDoc.data();

        if (!userData || userData.role !== "admin") {
          alert(
            "Acesso negado. Apenas administradores podem acessar este painel."
          );
          window.location.href = "index.html";
          return;
        }

        this.currentUser = user;
        document.getElementById("admin-name").textContent =
          userData.nomeCompleto || user.email;

        resolve(user);
      });
    });
  }

  setupEventListeners() {
    // Menu lateral
    document.querySelectorAll(".menu-item").forEach((item) => {
      item.addEventListener("click", () => {
        const section = item.dataset.section;
        this.switchSection(section);
      });
    });

    // Botão de logout
    document.getElementById("logout-btn").addEventListener("click", () => {
      this.logout();
    });

    // Botões de atualização
    document.getElementById("refresh-pending").addEventListener("click", () => {
      this.loadPendingAnuncios();
    });

    document
      .getElementById("refresh-approved")
      .addEventListener("click", () => {
        this.loadApprovedAnuncios();
      });

    document
      .getElementById("refresh-rejected")
      .addEventListener("click", () => {
        this.loadRejectedAnuncios();
      });

    document.getElementById("refresh-users").addEventListener("click", () => {
      this.loadUsers();
    });

    // Busca
    document
      .getElementById("search-approved")
      .addEventListener("input", (e) => {
        this.searchAnuncios("approved", e.target.value);
      });

    document
      .getElementById("search-rejected")
      .addEventListener("input", (e) => {
        this.searchAnuncios("rejected", e.target.value);
      });

    document.getElementById("search-users").addEventListener("input", (e) => {
      this.searchUsers(e.target.value);
    });

    // Modais
    this.setupModals();
  }

  switchSection(section) {
    // Atualizar menu ativo
    document.querySelectorAll(".menu-item").forEach((item) => {
      item.classList.remove("active");
    });
    document
      .querySelector(`[data-section="${section}"]`)
      .classList.add("active");

    // Atualizar seções
    document.querySelectorAll(".admin-section").forEach((sec) => {
      sec.classList.remove("active");
    });
    document.getElementById(section).classList.add("active");

    // Atualizar título
    const titles = {
      dashboard: "Dashboard",
      "anuncios-pendentes": "Anúncios Pendentes",
      "anuncios-aprovados": "Anúncios Aprovados",
      "anuncios-rejeitados": "Anúncios Rejeitados",
      usuarios: "Usuários",
      relatorios: "Relatórios",
      configuracoes: "Configurações",
    };

    const subtitles = {
      dashboard: "Visão geral do sistema",
      "anuncios-pendentes": "Anúncios aguardando aprovação",
      "anuncios-aprovados": "Anúncios aprovados e ativos",
      "anuncios-rejeitados": "Anúncios rejeitados",
      usuarios: "Gerenciar usuários do sistema",
      relatorios: "Relatórios e estatísticas",
      configuracoes: "Configurações do sistema",
    };

    document.getElementById("page-title").textContent = titles[section];
    document.getElementById("page-subtitle").textContent = subtitles[section];

    this.currentSection = section;

    // Carregar dados específicos da seção
    this.loadSectionData(section);
  }

  async loadSectionData(section) {
    switch (section) {
      case "dashboard":
        await this.loadDashboardData();
        break;
      case "anuncios-pendentes":
        await this.loadPendingAnuncios();
        break;
      case "anuncios-aprovados":
        await this.loadApprovedAnuncios();
        break;
      case "anuncios-rejeitados":
        await this.loadRejectedAnuncios();
        break;
      case "usuarios":
        await this.loadUsers();
        break;
      case "relatorios":
        await this.loadReports();
        break;
    }
  }

  async loadDashboardData() {
    try {
      console.log("📊 Carregando dados do dashboard...");

      // Carregar estatísticas
      await this.loadStats();

      // Carregar atividades recentes
      await this.loadRecentActivity();

      // Carregar alertas
      await this.loadAlerts();
    } catch (error) {
      console.error("❌ Erro ao carregar dashboard:", error);
    }
  }

  async loadStats() {
    try {
      // Contar usuários
      const usersSnapshot = await this.db.collection("advertisers").get();
      const totalUsers = usersSnapshot.size;

      // Contar anúncios
      const anunciosSnapshot = await this.db.collection("advertisements").get();
      const totalAnuncios = anunciosSnapshot.size;

      // Contar anúncios pendentes
      const pendingSnapshot = await this.db
        .collection("advertisements")
        .where("status", "==", "pending_approval")
        .get();
      const pendingAnuncios = pendingSnapshot.size;

      // Contar anúncios aprovados
      const approvedSnapshot = await this.db
        .collection("advertisements")
        .where("status", "==", "approved")
        .get();
      const approvedAnuncios = approvedSnapshot.size;

      // Atualizar interface
      document.getElementById("total-users").textContent = totalUsers;
      document.getElementById("total-anuncios").textContent = totalAnuncios;
      document.getElementById("pending-anuncios").textContent = pendingAnuncios;
      document.getElementById("approved-anuncios").textContent =
        approvedAnuncios;

      // Atualizar badges
      document.getElementById("pending-count").textContent = pendingAnuncios;
      document.getElementById("approved-count").textContent = approvedAnuncios;

      this.stats = {
        totalUsers,
        totalAnuncios,
        pendingAnuncios,
        approvedAnuncios,
      };
    } catch (error) {
      console.error("❌ Erro ao carregar estatísticas:", error);
    }
  }

  async loadRecentActivity() {
    try {
      const container = document.getElementById("recent-activity");

      // Buscar anúncios recentes
      const recentSnapshot = await this.db
        .collection("advertisements")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();

      const activities = [];
      recentSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          type: "anuncio",
          title: `Novo anúncio: ${data.publicData?.nome || "Sem nome"}`,
          description: `Status: ${data.status}`,
          time: data.createdAt?.toDate() || new Date(),
          icon: "fas fa-ad",
        });
      });

      // Renderizar atividades
      container.innerHTML = activities
        .map(
          (activity) => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <h4>${activity.title}</h4>
                        <p>${activity.description}</p>
                    </div>
                    <div class="activity-time">
                        ${this.formatTime(activity.time)}
                    </div>
                </div>
            `
        )
        .join("");
    } catch (error) {
      console.error("❌ Erro ao carregar atividades:", error);
    }
  }

  async loadAlerts() {
    try {
      const container = document.getElementById("alerts-list");

      const alerts = [];

      // Verificar anúncios pendentes há muito tempo
      const pendingSnapshot = await this.db
        .collection("advertisements")
        .where("status", "==", "pending_approval")
        .get();

      pendingSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate();
        if (createdAt) {
          const hoursAgo = (new Date() - createdAt) / (1000 * 60 * 60);
          if (hoursAgo > 24) {
            alerts.push({
              type: "warning",
              title: "Anúncio pendente há muito tempo",
              description: `${
                data.publicData?.nome || "Anúncio"
              } está aguardando aprovação há ${Math.floor(hoursAgo)} horas`,
              icon: "fas fa-clock",
            });
          }
        }
      });

      // Verificar usuários sem verificação
      const usersSnapshot = await this.db
        .collection("advertisers")
        .where("status", "==", "pending")
        .get();

      if (usersSnapshot.size > 0) {
        alerts.push({
          type: "info",
          title: "Usuários pendentes",
          description: `${usersSnapshot.size} usuários aguardando verificação`,
          icon: "fas fa-user-clock",
        });
      }

      // Renderizar alertas
      if (alerts.length === 0) {
        container.innerHTML =
          '<p style="text-align: center; color: #666;">Nenhum alerta no momento.</p>';
      } else {
        container.innerHTML = alerts
          .map(
            (alert) => `
                    <div class="alert-item ${alert.type}">
                        <div class="alert-icon">
                            <i class="${alert.icon}"></i>
                        </div>
                        <div class="alert-content">
                            <h4>${alert.title}</h4>
                            <p>${alert.description}</p>
                        </div>
                    </div>
                `
          )
          .join("");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar alertas:", error);
    }
  }

  async loadPendingAnuncios() {
    try {
      console.log("📋 Carregando anúncios pendentes...");

      const snapshot = await this.db
        .collection("advertisements")
        .where("status", "==", "pending_approval")
        .orderBy("createdAt", "desc")
        .get();

      this.anuncios.pending = [];
      snapshot.forEach((doc) => {
        this.anuncios.pending.push({ id: doc.id, ...doc.data() });
      });

      this.renderAnuncios("pending", this.anuncios.pending);
    } catch (error) {
      console.error("❌ Erro ao carregar anúncios pendentes:", error);
    }
  }

  async loadApprovedAnuncios() {
    try {
      console.log("✅ Carregando anúncios aprovados...");

      const snapshot = await this.db
        .collection("advertisements")
        .where("status", "==", "approved")
        .orderBy("approvedAt", "desc")
        .get();

      this.anuncios.approved = [];
      snapshot.forEach((doc) => {
        this.anuncios.approved.push({ id: doc.id, ...doc.data() });
      });

      this.renderAnuncios("approved", this.anuncios.approved);
    } catch (error) {
      console.error("❌ Erro ao carregar anúncios aprovados:", error);
    }
  }

  async loadRejectedAnuncios() {
    try {
      console.log("❌ Carregando anúncios rejeitados...");

      const snapshot = await this.db
        .collection("advertisements")
        .where("status", "==", "rejected")
        .orderBy("rejectedAt", "desc")
        .get();

      this.anuncios.rejected = [];
      snapshot.forEach((doc) => {
        this.anuncios.rejected.push({ id: doc.id, ...doc.data() });
      });

      this.renderAnuncios("rejected", this.anuncios.rejected);
    } catch (error) {
      console.error("❌ Erro ao carregar anúncios rejeitados:", error);
    }
  }

  renderAnuncios(type, anuncios) {
    const container = document.getElementById(`${type}-anuncios-list`);

    if (anuncios.length === 0) {
      container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Nenhum anúncio encontrado.</p>
                </div>
            `;
      return;
    }

    container.innerHTML = anuncios
      .map((anuncio) => this.createAnuncioCard(anuncio, type))
      .join("");
  }

  createAnuncioCard(anuncio, type) {
    const nome = anuncio.publicData?.nome || "Nome não informado";
    const idade = anuncio.publicData?.idade || "N/A";
    const cidade = anuncio.cidade || "N/A";
    const categoria = anuncio.categoria || "N/A";
    const foto =
      anuncio.photos?.capa ||
      "https://via.placeholder.com/120x120?text=Sem+Foto";
    const createdAt = anuncio.createdAt?.toDate();
    const timeAgo = createdAt ? this.formatTime(createdAt) : "N/A";

    let statusBadge = "";
    let actions = "";

    switch (type) {
      case "pending":
        statusBadge =
          '<span class="badge" style="background: #f39c12;">Pendente</span>';
        actions = `
                    <button class="btn btn-success btn-sm" onclick="adminPanel.approveAnuncio('${anuncio.id}')">
                        <i class="fas fa-check"></i> Aprovar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="adminPanel.rejectAnuncio('${anuncio.id}')">
                        <i class="fas fa-times"></i> Rejeitar
                    </button>
                `;
        break;
      case "approved":
        statusBadge =
          '<span class="badge" style="background: #28a745;">Aprovado</span>';
        actions = `
                    <button class="btn btn-danger btn-sm" onclick="adminPanel.rejectAnuncio('${anuncio.id}')">
                        <i class="fas fa-times"></i> Rejeitar
                    </button>
                `;
        break;
      case "rejected":
        statusBadge =
          '<span class="badge" style="background: #dc3545;">Rejeitado</span>';
        actions = `
                    <button class="btn btn-success btn-sm" onclick="adminPanel.approveAnuncio('${anuncio.id}')">
                        <i class="fas fa-check"></i> Aprovar
                    </button>
                `;
        break;
    }

    return `
            <div class="anuncio-item">
                <div class="anuncio-photo">
                    <img src="${foto}" alt="${nome}" onerror="this.src='https://via.placeholder.com/120x120?text=Erro'">
                </div>
                <div class="anuncio-info">
                    <h3>${nome}</h3>
                    <div class="anuncio-meta">
                        <span><i class="fas fa-birthday-cake"></i> ${idade} anos</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${cidade}</span>
                        <span><i class="fas fa-tag"></i> ${categoria}</span>
                        <span><i class="fas fa-clock"></i> ${timeAgo}</span>
                    </div>
                    <div class="anuncio-actions">
                        ${actions}
                        <button class="btn btn-primary btn-sm" onclick="adminPanel.viewAnuncioDetails('${anuncio.id}')">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  async loadUsers() {
    try {
      console.log("👥 Carregando usuários...");

      const snapshot = await this.db
        .collection("advertisers")
        .orderBy("created_at", "desc")
        .get();

      this.users = [];
      snapshot.forEach((doc) => {
        this.users.push({ id: doc.id, ...doc.data() });
      });

      this.renderUsers(this.users);
    } catch (error) {
      console.error("❌ Erro ao carregar usuários:", error);
    }
  }

  renderUsers(users) {
    const container = document.getElementById("users-list");

    if (users.length === 0) {
      container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Nenhum usuário encontrado.</p>
                </div>
            `;
      return;
    }

    container.innerHTML = users
      .map((user) => this.createUserCard(user))
      .join("");
  }

  createUserCard(user) {
    const nome = user.nomeCompleto || user.email || "Nome não informado";
    const email = user.email || "N/A";
    const status = user.status || "pending";
    const role = user.role || "advertiser";
    const createdAt = user.created_at?.toDate();
    const timeAgo = createdAt ? this.formatTime(createdAt) : "N/A";

    const statusColors = {
      active: "#28a745",
      pending: "#f39c12",
      suspended: "#dc3545",
    };

    const roleColors = {
      admin: "#667eea",
      advertiser: "#6c757d",
    };

    return `
            <div class="user-card">
                <div class="user-header">
                    <div class="user-avatar">
                        ${nome.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-info">
                        <h4>${nome}</h4>
                        <p>${email}</p>
                    </div>
                </div>
                <div class="user-stats">
                    <div class="user-stat">
                        <strong>${status}</strong>
                        <span>Status</span>
                    </div>
                    <div class="user-stat">
                        <strong>${role}</strong>
                        <span>Função</span>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn btn-primary btn-sm" onclick="adminPanel.viewUserDetails('${
                      user.id
                    }')">
                        <i class="fas fa-eye"></i> Ver Detalhes
                    </button>
                    ${
                      status === "pending"
                        ? `
                        <button class="btn btn-success btn-sm" onclick="adminPanel.approveUser('${user.id}')">
                            <i class="fas fa-check"></i> Aprovar
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  }

  async loadReports() {
    try {
      console.log("📊 Carregando relatórios...");

      // Implementar gráficos aqui
      document.getElementById("category-chart").innerHTML =
        "<p>Gráfico de categorias em desenvolvimento...</p>";
      document.getElementById("monthly-chart").innerHTML =
        "<p>Gráfico mensal em desenvolvimento...</p>";
    } catch (error) {
      console.error("❌ Erro ao carregar relatórios:", error);
    }
  }

  // Ações de anúncios
  async approveAnuncio(anuncioId) {
    try {
      if (!confirm("Tem certeza que deseja aprovar este anúncio?")) return;

      await this.db.collection("advertisements").doc(anuncioId).update({
        status: "approved",
        approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
        approvedBy: this.currentUser.uid,
      });

      alert("Anúncio aprovado com sucesso!");
      this.loadSectionData(this.currentSection);
      this.loadStats();
    } catch (error) {
      console.error("❌ Erro ao aprovar anúncio:", error);
      alert("Erro ao aprovar anúncio: " + error.message);
    }
  }

  async rejectAnuncio(anuncioId) {
    try {
      const motivo = prompt("Motivo da rejeição:");
      if (!motivo) return;

      await this.db.collection("advertisements").doc(anuncioId).update({
        status: "rejected",
        rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
        rejectedBy: this.currentUser.uid,
        rejectionReason: motivo,
      });

      alert("Anúncio rejeitado com sucesso!");
      this.loadSectionData(this.currentSection);
      this.loadStats();
    } catch (error) {
      console.error("❌ Erro ao rejeitar anúncio:", error);
      alert("Erro ao rejeitar anúncio: " + error.message);
    }
  }

  viewAnuncioDetails(anuncioId) {
    window.open(`anuncio-detalhes.html?id=${anuncioId}`, "_blank");
  }

  // Ações de usuários
  async approveUser(userId) {
    try {
      if (!confirm("Tem certeza que deseja aprovar este usuário?")) return;

      await this.db.collection("advertisers").doc(userId).update({
        status: "active",
        approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
        approvedBy: this.currentUser.uid,
      });

      alert("Usuário aprovado com sucesso!");
      this.loadUsers();
      this.loadStats();
    } catch (error) {
      console.error("❌ Erro ao aprovar usuário:", error);
      alert("Erro ao aprovar usuário: " + error.message);
    }
  }

  viewUserDetails(userId) {
    // Implementar modal de detalhes do usuário
    alert("Modal de detalhes do usuário em desenvolvimento...");
  }

  // Busca
  searchAnuncios(type, query) {
    const anuncios = this.anuncios[type];
    if (!query.trim()) {
      this.renderAnuncios(type, anuncios);
      return;
    }

    const filtered = anuncios.filter((anuncio) => {
      const nome = anuncio.publicData?.nome || "";
      const cidade = anuncio.cidade || "";
      const categoria = anuncio.categoria || "";

      return (
        nome.toLowerCase().includes(query.toLowerCase()) ||
        cidade.toLowerCase().includes(query.toLowerCase()) ||
        categoria.toLowerCase().includes(query.toLowerCase())
      );
    });

    this.renderAnuncios(type, filtered);
  }

  searchUsers(query) {
    if (!query.trim()) {
      this.renderUsers(this.users);
      return;
    }

    const filtered = this.users.filter((user) => {
      const nome = user.nomeCompleto || "";
      const email = user.email || "";

      return (
        nome.toLowerCase().includes(query.toLowerCase()) ||
        email.toLowerCase().includes(query.toLowerCase())
      );
    });

    this.renderUsers(filtered);
  }

  // Modais
  setupModals() {
    // Modal de aprovação
    const approvalModal = document.getElementById("approval-modal");
    const closeBtn = approvalModal.querySelector(".close");

    closeBtn.addEventListener("click", () => {
      approvalModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === approvalModal) {
        approvalModal.style.display = "none";
      }
    });

    // Modal de usuário
    const userModal = document.getElementById("user-modal");
    const userCloseBtn = userModal.querySelector(".close");

    userCloseBtn.addEventListener("click", () => {
      userModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === userModal) {
        userModal.style.display = "none";
      }
    });
  }

  // Utilitários
  formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} min atrás`;
    } else if (hours < 24) {
      return `${hours}h atrás`;
    } else {
      return `${days} dias atrás`;
    }
  }

  async logout() {
    try {
      await this.auth.signOut();
      window.location.href = "index.html";
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error);
    }
  }
}

// Inicializar quando a página carregar
let adminPanel;

document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 Painel de administração carregado");
  adminPanel = new AdminPanelManager();
});

// Funções globais para uso nos templates
window.adminPanel = adminPanel;
