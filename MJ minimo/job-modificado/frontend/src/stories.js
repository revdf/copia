// Stories Component JavaScript

// Função para carregar stories
async function loadStories(
  category = "mulheres",
  subcategory = "acompanhantes"
) {
  const storiesWrapper = document.getElementById("storiesWrapper");

  if (!storiesWrapper) {
    console.warn("Stories wrapper não encontrado");
    return;
  }

  try {
    // Buscar anúncios com fotos de perfil
    const response = await fetch(
      `http://localhost:5000/api/advertisements?status=active&categoria=${category}&subcategory=${subcategory}`
    );
    const data = await response.json();

    if (data.advertisements && data.advertisements.length > 0) {
      // Filtrar apenas anúncios que têm foto de perfil
      const storiesWithPhotos = data.advertisements.filter(
        (ad) => ad.fotoPerfil && ad.fotoPerfil.trim() !== ""
      );

      // Limpar wrapper
      storiesWrapper.innerHTML = "";

      // Adicionar stories
      storiesWithPhotos.forEach((ad) => {
        const storySlide = document.createElement("div");
        storySlide.className = "swiper-slide stories-slide";

        const storyName = ad.advertiserName || ad.title || "Anônimo";

        storySlide.innerHTML = `
          <a href="perfil-anuncio.html?id=${ad._id}" class="story-item">
            <img src="${ad.fotoPerfil}" alt="${storyName}" class="story-avatar">
            <div class="story-name">${storyName}</div>
          </a>
        `;

        storiesWrapper.appendChild(storySlide);
      });

      // Inicializar Swiper se houver stories
      if (storiesWithPhotos.length > 0) {
        initializeStoriesSwiper();
      } else {
        // Mostrar mensagem se não houver stories
        storiesWrapper.innerHTML = `
          <div style="color: #666; text-align: center; padding: 20px; grid-column: 1 / -1;">
            Nenhum story disponível no momento
          </div>
        `;
      }
    }
  } catch (error) {
    console.error("Erro ao carregar stories:", error);

    // Mostrar mensagem de erro
    storiesWrapper.innerHTML = `
      <div style="color: #e74c3c; text-align: center; padding: 20px; grid-column: 1 / -1;">
        Erro ao carregar stories
      </div>
    `;
  }
}

// Função para inicializar o Swiper dos stories
function initializeStoriesSwiper() {
  // Destruir instância anterior se existir
  if (window.storiesSwiper) {
    window.storiesSwiper.destroy(true, true);
  }

  window.storiesSwiper = new Swiper("#storiesSwiper", {
    slidesPerView: "auto",
    spaceBetween: 3,
    freeMode: true,
    grabCursor: true,
    breakpoints: {
      320: {
        slidesPerView: 4,
        spaceBetween: 3,
      },
      480: {
        slidesPerView: 6,
        spaceBetween: 3,
      },
      768: {
        slidesPerView: 8,
        spaceBetween: 3,
      },
      1024: {
        slidesPerView: 10,
        spaceBetween: 3,
      },
      1200: {
        slidesPerView: 12,
        spaceBetween: 3,
      },
    },
  });
}

// Função para carregar stories específicos por categoria
function loadStoriesByCategory(category) {
  let subcategory = "";

  switch (category) {
    case "mulheres":
      subcategory = "acompanhantes";
      break;
    case "massagistas":
      subcategory = "massagistas";
      break;
    case "trans":
      subcategory = "trans";
      break;
    case "homens":
      subcategory = "acompanhantes";
      break;
    default:
      subcategory = "acompanhantes";
  }

  loadStories(category, subcategory);
}














