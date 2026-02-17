document.addEventListener("DOMContentLoaded", () => {
  // Add smooth scrolling to all links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  // Add animation to choice cards on hover
  const choiceCards = document.querySelectorAll(".choice-card");
  choiceCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-10px)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
    });
  });

  // Add loading animation for images
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    img.addEventListener("load", () => {
      img.classList.add("loaded");
    });
  });
});

// Age verification and cookie consent functions
function acceptTerms() {
  // Set cookie to remember user's choice
  document.cookie = "ageVerified=true; path=/; max-age=31536000"; // 1 year
  document.cookie = "cookiesAccepted=true; path=/; max-age=31536000"; // 1 year
  
  // Hide popup immediately
  const popup = document.getElementById("ageVerificationPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

function rejectTerms() {
  // Redirect to a safe page or close the window
  window.location.href = "https://www.google.com";
}

function configureCookies() {
  // For now, redirect to construction page
  window.location.href = "/construcao.html";
}

function hidePopup() {
  const popup = document.getElementById("ageVerificationPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

// Check if user has already accepted terms
function checkTerms() {
  // Sempre aceitar os termos temporariamente
  document.cookie = "ageVerified=true; path=/; max-age=31536000"; // 1 year
  document.cookie = "cookiesAccepted=true; path=/; max-age=31536000"; // 1 year
  hidePopup();
}

// Run check when page loads
document.addEventListener("DOMContentLoaded", checkTerms);

// Menu functionality
document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector('[data-toggle="dropdown"]');
  const dropdownMenu = document.querySelector(".dropdown-menu");
  const dropdownItems = document.querySelectorAll('[data-toggle="dropdown"]');

  // Toggle main menu
  if (menuButton && dropdownMenu) {
    menuButton.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });
  }

  // Close menu when clicking outside
  if (dropdownMenu && menuButton) {
    document.addEventListener("click", function (e) {
      if (!dropdownMenu.contains(e.target) && !menuButton.contains(e.target)) {
        dropdownMenu.classList.remove("show");
      }
    });
  }

  // Handle dropdown items
  dropdownItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.stopPropagation();
      const nextDropdown = this.nextElementSibling;
      if (nextDropdown && nextDropdown.classList.contains("dropdown-level")) {
        nextDropdown.classList.toggle("show");
      }
    });
  });

  // Theme selector functionality
  const themeSelector = document.getElementById("themeSelector");
  const themeOptions = document.querySelectorAll(".ui-segment .option");

  themeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const value = this.getAttribute("value");
      themeSelector.value = value;

      // Update active state
      themeOptions.forEach((opt) => opt.classList.remove("active"));
      this.classList.add("active");

      // Apply theme
      document.body.className = "";
      if (value !== "auto") {
        document.body.classList.add(value + "-theme");
      }
    });
  });
});

// Configuração da API do Google Maps
const GOOGLE_MAPS_API_KEY = "SUA_CHAVE_API_AQUI"; // Substitua pela sua chave da API do Google Maps

// Armazenamento local para histórico e favoritos
let searchHistory =
  JSON.parse(localStorage.getItem("locationSearchHistory")) || [];
let favoriteCities = JSON.parse(localStorage.getItem("favoriteCities")) || [];

// Função para obter a localização do usuário
const locationBtn = document.getElementById("locationBtn");
if (locationBtn) {
  locationBtn.addEventListener("click", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          // Converter coordenadas em endereço usando Google Maps Geocoding API
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`
          );
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            locationSearch.value = address;
            addToHistory(address);
          }
        } catch (error) {
          console.error("Erro ao obter endereço:", error);
        }
      },
      function (error) {
        console.error("Erro ao obter localização:", error);
        alert(
          "Não foi possível obter sua localização. Por favor, permita o acesso à localização."
        );
      }
    );
  } else {
    alert("Seu navegador não suporta geolocalização.");
  }
  });
}

// Função para buscar cidades usando Google Places API
async function searchCities(query) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&types=(cities)&components=country:br&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`
    );
    const data = await response.json();

    if (data.predictions) {
      return data.predictions.map((prediction) => ({
        description: prediction.description,
        placeId: prediction.place_id,
      }));
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar cidades:", error);
    return [];
  }
}

// Função para adicionar ao histórico
function addToHistory(location) {
  searchHistory = [
    location,
    ...searchHistory.filter((item) => item !== location),
  ].slice(0, 10);
  localStorage.setItem("locationSearchHistory", JSON.stringify(searchHistory));
  updateHistoryUI();
}

// Função para adicionar aos favoritos
function toggleFavorite(location) {
  const index = favoriteCities.indexOf(location);
  if (index === -1) {
    favoriteCities.push(location);
  } else {
    favoriteCities.splice(index, 1);
  }
  localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
  updateFavoritesUI();
}

// Função para atualizar a UI do histórico
function updateHistoryUI() {
  const historyContainer = document.getElementById("searchHistory");
  if (historyContainer) {
    historyContainer.innerHTML = searchHistory
      .map(
        (location) => `
            <div class="history-item">
                <span>${location}</span>
                <button onclick="selectFromHistory('${location}')">Selecionar</button>
            </div>
        `
      )
      .join("");
  }
}

// Função para atualizar a UI dos favoritos
function updateFavoritesUI() {
  const favoritesContainer = document.getElementById("favoriteCities");
  if (favoritesContainer) {
    favoritesContainer.innerHTML = favoriteCities
      .map(
        (location) => `
            <div class="favorite-item">
                <span>${location}</span>
                <button onclick="toggleFavorite('${location}')">Remover</button>
            </div>
        `
      )
      .join("");
  }
}

// Obter elementos de busca de localização (se existirem)
const locationSearch = document.getElementById("locationSearch") || document.querySelector('[name="location"]') || document.querySelector('#location-search');
const locationResults = document.getElementById("locationResults") || document.querySelector('.location-results');

// Função para selecionar do histórico
function selectFromHistory(location) {
  if (locationSearch && locationResults) {
    locationSearch.value = location;
    locationResults.classList.remove("active");
  }
}

// Atualização do evento de input para usar a API
if (locationSearch && locationResults) {
  locationSearch.addEventListener("input", async function (e) {
    const searchTerm = e.target.value;
    if (searchTerm.length < 3) {
      locationResults.classList.remove("active");
      return;
    }

    const results = await searchCities(searchTerm);

    locationResults.innerHTML = "";

    // Adicionar favoritos no topo
  if (favoriteCities.length > 0) {
    const favoritesHeader = document.createElement("div");
    favoritesHeader.className = "results-header";
    favoritesHeader.textContent = "Favoritos";
    locationResults.appendChild(favoritesHeader);

    favoriteCities.forEach((city) => {
      if (city.toLowerCase().includes(searchTerm.toLowerCase())) {
        const div = document.createElement("div");
        div.className = "location-result-item favorite";
        div.innerHTML = `
                    <span>${city}</span>
                    <button onclick="toggleFavorite('${city}')">★</button>
                `;
        div.addEventListener("click", () => {
          locationSearch.value = city;
          locationResults.classList.remove("active");
        });
        locationResults.appendChild(div);
      }
    });
  }

  // Adicionar resultados da busca
  if (results.length > 0) {
    const resultsHeader = document.createElement("div");
    resultsHeader.className = "results-header";
    resultsHeader.textContent = "Resultados da busca";
    locationResults.appendChild(resultsHeader);

    results.forEach((result) => {
      const div = document.createElement("div");
      div.className = "location-result-item";
      div.innerHTML = `
                <span>${result.description}</span>
                <button onclick="toggleFavorite('${result.description}')">☆</button>
            `;
      div.addEventListener("click", () => {
        locationSearch.value = result.description;
        locationResults.classList.remove("active");
        addToHistory(result.description);
      });
      locationResults.appendChild(div);
    });
  }

  locationResults.classList.toggle(
    "active",
    results.length > 0 || favoriteCities.length > 0
  );
});

// Inicializar UI
document.addEventListener("DOMContentLoaded", () => {port
  updateHistoryUI();
  updateFavoritesUI();
});

// Função de validação de email
function validateEmail(input) {
  const email = input.value;
  const validationMessage = input.parentElement.querySelector('.email-validation-message');
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Limpar mensagens anteriores
  validationMessage.textContent = '';
  input.classList.remove('is-invalid', 'is-valid');
  
  if (!email) {
    validationMessage.textContent = 'O email é obrigatório';
    input.classList.add('is-invalid');
    return false;
  }
  
  if (!emailRegex.test(email)) {
    validationMessage.textContent = 'Por favor, insira um endereço de email válido';
    input.classList.add('is-invalid');
    return false;
  }
  
  // Verificar domínios de email temporários
  const disposableDomains = ['tempmail.com', 'mailinator.com', 'guerrillamail.com', 'yopmail.com'];
  const domain = email.split('@')[1];
  if (disposableDomains.includes(domain)) {
    validationMessage.textContent = 'Não são permitidos emails temporários';
    input.classList.add('is-invalid');
    return false;
  }
  
  input.classList.add('is-valid');
  return true;
}

// Function to handle email verification for advertisement registration
async function sendVerificationEmail(email) {
  try {
    const response = await fetch("/api/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        type: "advertisement",
      }),
    });

    if (!response.ok) {
      throw new Error("Falha ao enviar email de verificação");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao enviar email de verificação:", error);
    throw error;
  }
}

// Function to verify email token
async function verifyEmailToken(token) {
  try {
    const response = await fetch("/api/verify-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        type: "advertisement",
      }),
    });

    if (!response.ok) {
      throw new Error("Falha ao verificar token");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    throw error;
  }
}

// Adicionar evento de submit ao formulário
const modalForm = document.querySelector('.modal-dialog form');
if (modalForm) {
  modalForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const emailInput = document.getElementById('user_email');
  const privacyCheckbox = document.getElementById('privacy_policy');
  const termsCheckbox = document.getElementById('terms');
  
  if (!validateEmail(emailInput)) {
    return;
  }
  
  if (!privacyCheckbox.checked) {
    alert('Você deve aceitar a Política de Privacidade');
    return;
  }
  
  if (!termsCheckbox.checked) {
    alert('Você deve aceitar os Termos e Condições');
    return;
  }
  
    try {
      // Send verification email
      await sendVerificationEmail(emailInput.value);

      // Show verification modal
      showVerificationModal(emailInput.value);
    } catch (error) {
      alert("Erro ao enviar email de verificação. Por favor, tente novamente.");
    }
  });
}

// Function to show verification modal
function showVerificationModal(email) {
  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = "verificationModal";
  modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Verificação de Email</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Enviamos um código de verificação para ${email}</p>
                    <div class="form-group">
                        <input type="text" class="form-control" id="verificationCode" 
                               placeholder="Digite o código de verificação">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="verifyCode()">Verificar</button>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  $(modal).modal("show");
}

// Function to verify the code
async function verifyCode() {
  const code = document.getElementById("verificationCode").value;
  if (!code) {
    alert("Por favor, insira o código de verificação");
    return;
  }

  try {
    const result = await verifyEmailToken(code);
    if (result.success) {
      alert("Email verificado com sucesso!");
      $("#verificationModal").modal("hide");
      // Continue with registration
      completeAdvertisementRegistration();
    } else {
      alert("Código inválido. Por favor, tente novamente.");
    }
  } catch (error) {
    alert("Erro ao verificar código. Por favor, tente novamente.");
  }
}

// Function to complete advertisement registration after email verification
async function completeAdvertisementRegistration() {
  const form = document.querySelector(".modal-dialog form");
  const formData = new FormData(form);

  try {
    const response = await fetch("/api/register-advertisement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    if (!response.ok) {
      throw new Error("Falha no registro");
    }

    const result = await response.json();
    alert("Registro concluído com sucesso!");
    window.location.href = "/dashboard";
  } catch (error) {
    alert("Erro ao completar registro. Por favor, tente novamente.");
  }
}

// Login functions
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('user_email').value;
  const password = document.getElementById('user_password').value;
  
  // Validação básica
  if (!email || !password) {
    alert('Por favor, preencha todos os campos');
    return;
  }

  try {
    console.log('Tentando fazer login com:', email);
    
    // Chamada real à API
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Armazenar token de autenticação
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userRole', data.user.role);
      
      // Fechar o modal
      document.getElementById('loginModal').classList.remove('show');
      
      // Mostrar mensagem de sucesso
      alert('Login realizado com sucesso!');
      
      // Atualizar o botão de login no cabeçalho
      updateLoginButton();
    } else {
      alert('Erro no login: ' + data.error);
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
  }
}

function updateLoginButton() {
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  const loginButton = document.querySelector('.btn-login');
  
  if (userEmail) {
    const displayName = userName || userEmail;
    const roleText = userRole === 'admin' ? ' (Admin)' : userRole === 'advertiser' ? ' (Anunciante)' : '';
    
    loginButton.innerHTML = `
      <i class="fas fa-user"></i>
      ${displayName}${roleText}
    `;
    loginButton.onclick = function() {
      // Mostrar menu do usuário ou fazer logout
      if (confirm('Deseja fazer logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        updateLoginButton();
        window.location.reload();
      }
    };
  } else {
    loginButton.innerHTML = `
      <i class="fas fa-user"></i>
      Login
    `;
    loginButton.onclick = function() {
      document.getElementById('loginModal').classList.add('show');
    };
  }
}

async function handleForgotPassword() {
  const email = document.getElementById('user_email').value;
  
  if (!email) {
    alert('Por favor, insira seu email no campo de email primeiro');
    return;
  }

  try {
    // Simulação de envio de email de recuperação
    console.log('Enviando email de recuperação para:', email);
    
    // Aqui você deve substituir pela chamada real à sua API
    // const response = await fetch('/api/forgot-password', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ email }),
    // });

    // Simulando resposta da API
    setTimeout(() => {
      alert('Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
    }, 1000);
  } catch (error) {
    alert('Erro ao enviar email de recuperação: ' + error.message);
  }
}

// Adicionar event listeners quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  // Atualizar o botão de login baseado no estado atual
  updateLoginButton();
  
  // Adicionar evento de submit ao formulário de login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});
