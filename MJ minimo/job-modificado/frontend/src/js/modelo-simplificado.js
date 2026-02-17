// Modelo Simplificado - JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Inicializar funcionalidades
  initMasonryLayout();
  initDropdowns();
  initFavoriteButtons();
  initSmoothScrolling();
  initLazyLoading();

  // Layout Masonry
  function initMasonryLayout() {
    const grid = document.getElementById("results");
    if (!grid) return;

    // Simular layout masonry com CSS Grid
    const cards = grid.querySelectorAll(".profile-card");
    cards.forEach((card, index) => {
      // Adicionar delay de animação baseado na posição
      card.style.animationDelay = `${index * 0.1}s`;
    });
  }

  // Dropdowns
  function initDropdowns() {
    const dropdowns = document.querySelectorAll(".dropdown");

    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(".dropdown-toggle");
      const menu = dropdown.querySelector(".dropdown-menu");

      if (toggle && menu) {
        // Fechar dropdown ao clicar fora
        document.addEventListener("click", (e) => {
          if (!dropdown.contains(e.target)) {
            menu.style.opacity = "0";
            menu.style.visibility = "hidden";
            menu.style.transform = "translateY(-10px)";
          }
        });

        // Toggle dropdown
        toggle.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const isOpen = menu.style.opacity === "1";

          if (isOpen) {
            closeDropdown(menu);
          } else {
            openDropdown(menu);
          }
        });
      }
    });
  }

  function openDropdown(menu) {
    menu.style.opacity = "1";
    menu.style.visibility = "visible";
    menu.style.transform = "translateY(0)";
  }

  function closeDropdown(menu) {
    menu.style.opacity = "0";
    menu.style.visibility = "hidden";
    menu.style.transform = "translateY(-10px)";
  }

  // Botões de Favorito
  function initFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll(".btn-favorite");

    favoriteButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const icon = button.querySelector("i");
        const isFavorited = icon.classList.contains("fas");

        if (isFavorited) {
          icon.classList.remove("fas");
          icon.classList.add("far");
          button.style.color = "#333";
          showNotification("Removido dos favoritos", "info");
        } else {
          icon.classList.remove("far");
          icon.classList.add("fas");
          button.style.color = "#e74c3c";
          showNotification("Adicionado aos favoritos", "success");
        }

        // Animação de pulso
        button.style.transform = "scale(1.2)";
        setTimeout(() => {
          button.style.transform = "scale(1)";
        }, 200);
      });
    });
  }

  // Smooth Scrolling
  function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const targetId = link.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  // Lazy Loading para imagens
  function initLazyLoading() {
    const images = document.querySelectorAll(".profile-img");

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.style.opacity = "0";
          img.style.transition = "opacity 0.3s ease";

          img.onload = () => {
            img.style.opacity = "1";
          };

          observer.unobserve(img);
        }
      });
    });

    images.forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // Sistema de Notificações
  function showNotification(message, type = "info") {
    // Remover notificação existente
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Criar nova notificação
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

    // Estilos da notificação
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remover após 3 segundos
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  function getNotificationIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    };
    return icons[type] || "info-circle";
  }

  function getNotificationColor(type) {
    const colors = {
      success: "#28a745",
      error: "#dc3545",
      warning: "#ffc107",
      info: "#17a2b8",
    };
    return colors[type] || "#17a2b8";
  }

  // Filtros e Busca (funcionalidade futura)
  function initFilters() {
    // Implementar filtros por localização, preço, idade, etc.
    console.log("Filtros inicializados");
  }

  // Modal de Detalhes (funcionalidade futura)
  function initModals() {
    const profileCards = document.querySelectorAll(".profile-card");

    profileCards.forEach((card) => {
      const viewButton = card.querySelector(".btn-primary");

      if (viewButton) {
        viewButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const profileName = card.querySelector(".profile-name").textContent;
          showProfileModal(profileName);
        });
      }
    });
  }

  function showProfileModal(profileName) {
    // Implementar modal de detalhes do perfil
    showNotification(`Abrindo perfil de ${profileName}`, "info");
  }

  // Contador de Visualizações
  function trackView(profileName) {
    // Implementar tracking de visualizações
    console.log(`Visualização do perfil: ${profileName}`);
  }

  // Inicializar modais
  initModals();

  // Performance: Debounce para scroll
  let scrollTimeout;
  window.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Implementar lazy loading adicional se necessário
    }, 100);
  });

  // Adicionar efeitos de hover nos cards
  const profileCards = document.querySelectorAll(".profile-card");
  profileCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-5px) scale(1.02)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) scale(1)";
    });
  });

  // Botões de ação dos cards
  const contactButtons = document.querySelectorAll(".btn-secondary");
  contactButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const card = button.closest(".profile-card");
      const profileName = card.querySelector(".profile-name").textContent;

      showNotification(`Contatando ${profileName}...`, "info");

      // Simular envio de mensagem
      setTimeout(() => {
        showNotification(`Mensagem enviada para ${profileName}!`, "success");
      }, 1500);
    });
  });

  // Botões de telefone
  const phoneButtons = document.querySelectorAll(".btn-phone");
  phoneButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const card = button.closest(".profile-card");
      const profileName = card.querySelector(".profile-name").textContent;

      showNotification(`Ligando para ${profileName}...`, "info");
    });
  });

  console.log("Modelo Simplificado carregado com sucesso!");
});
