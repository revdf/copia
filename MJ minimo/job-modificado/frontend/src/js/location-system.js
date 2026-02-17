/**
 * Sistema de Geolocalização por Camadas
 * Implementa múltiplos serviços com fallbacks inteligentes
 * 
 * Serviços utilizados:
 * - ipapi.co (950 req/dia)
 * - ipgeolocation.io (30 req/dia) 
 * - ip-api.com (44 req/min)
 * - geojs.io (ilimitado)
 */

class LocationSystem {
  constructor() {
    this.services = {
      ipapi: {
        url: 'https://ipapi.co/json/',
        dailyLimit: 950,
        used: this.getUsage('ipapi'),
        priority: 1
      },
      ipgeolocation: {
        url: 'https://api.ipgeolocation.io/ipgeo?apiKey=free',
        dailyLimit: 30,
        used: this.getUsage('ipgeolocation'),
        priority: 2
      },
      ipapi_com: {
        url: 'http://ip-api.com/json/',
        minuteLimit: 44,
        used: this.getUsage('ipapi_com'),
        priority: 3
      },
      geojs: {
        url: 'https://get.geojs.io/v1/ip/geo.json',
        unlimited: true,
        priority: 4
      }
    };
    
    this.currentLocation = null;
    this.filters = {
      state: null,
      city: null,
      active: false
    };
    
    this.callbacks = {
      onLocationDetected: null,
      onFilterApplied: null,
      onError: null
    };

    // Sistema de carregamento infinito
    this.infiniteScroll = {
      enabled: false,
      loading: false,
      currentPage: 1,
      itemsPerPage: 20,
      allCards: [],
      visibleCards: [],
      proximitySorted: false
    };
    
    this.init();
  }

  init() {
    // Verifica se há parâmetros na URL
    this.checkURLParams();
    
    // Tenta detectar localização automaticamente
    this.detectLocation();
    
    // Inicializa interface de filtros
    this.initFilterInterface();
  }

  checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('estado') || urlParams.get('state');
    const city = urlParams.get('cidade') || urlParams.get('city');
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');

    if (state || city) {
      this.filters.state = state;
      this.filters.city = city;
      this.filters.active = true;
      this.applyFilters();
    } else if (lat && lng) {
      this.reverseGeocode(lat, lng);
    }
  }

  async detectLocation() {
    // Camada 1: IP Geolocation (mais rápido)
    try {
      const location = await this.getLocationByIP();
      if (location) {
        this.currentLocation = location;
        this.autoFilter(location);
        return;
      }
    } catch (error) {
      console.log('IP Geolocation falhou, tentando geolocalização do navegador...');
    }

    // Camada 2: Geolocalização do navegador (mais preciso)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const location = await this.reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            if (location) {
              this.currentLocation = location;
              this.autoFilter(location);
            }
          } catch (error) {
            console.error('Reverse geocoding falhou:', error);
            this.handleError('Não foi possível determinar sua localização');
          }
        },
        (error) => {
          console.log('Geolocalização do navegador negada, usando IP fallback');
          this.useIPFallback();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    } else {
      this.useIPFallback();
    }
  }

  async getLocationByIP() {
    const availableServices = this.getAvailableServices();
    
    for (const service of availableServices) {
      try {
        console.log(`Tentando serviço: ${service.name}`);
        const response = await fetch(service.url, {
          method: 'GET',
          timeout: 5000
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const location = this.parseLocationData(data, service.name);
        
        if (location) {
          this.updateUsage(service.name);
          return location;
        }
      } catch (error) {
        console.log(`Serviço ${service.name} falhou:`, error.message);
        continue;
      }
    }
    
    throw new Error('Todos os serviços de IP falharam');
  }

  getAvailableServices() {
    const now = new Date();
    const services = [];

    // ipapi.co
    if (this.services.ipapi.used < this.services.ipapi.dailyLimit) {
      services.push({
        name: 'ipapi',
        url: this.services.ipapi.url,
        priority: this.services.ipapi.priority
      });
    }

    // ipgeolocation.io
    if (this.services.ipgeolocation.used < this.services.ipgeolocation.dailyLimit) {
      services.push({
        name: 'ipgeolocation',
        url: this.services.ipgeolocation.url,
        priority: this.services.ipgeolocation.priority
      });
    }

    // ip-api.com (verifica limite por minuto)
    const lastMinuteUsage = this.getMinuteUsage('ipapi_com');
    if (lastMinuteUsage < this.services.ipapi_com.minuteLimit) {
      services.push({
        name: 'ipapi_com',
        url: this.services.ipapi_com.url,
        priority: this.services.ipapi_com.priority
      });
    }

    // geojs.io (sempre disponível)
    services.push({
      name: 'geojs',
      url: this.services.geojs.url,
      priority: this.services.geojs.priority
    });

    return services.sort((a, b) => a.priority - b.priority);
  }

  parseLocationData(data, serviceName) {
    try {
      switch (serviceName) {
        case 'ipapi':
          return {
            city: data.city,
            state: data.region,
            country: data.country_code,
            lat: data.latitude,
            lng: data.longitude,
            source: 'ipapi.co'
          };

        case 'ipgeolocation':
          return {
            city: data.city,
            state: data.state_prov,
            country: data.country_code2,
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
            source: 'ipgeolocation.io'
          };

        case 'ipapi_com':
          return {
            city: data.city,
            state: data.regionName,
            country: data.countryCode,
            lat: data.lat,
            lng: data.lon,
            source: 'ip-api.com'
          };

        case 'geojs':
          return {
            city: data.city,
            state: data.region,
            country: data.country_code,
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
            source: 'geojs.io'
          };

        default:
          return null;
      }
    } catch (error) {
      console.error(`Erro ao processar dados do ${serviceName}:`, error);
      return null;
    }
  }

  async reverseGeocode(lat, lng) {
    try {
      // Usa serviço de geocoding reverso
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`
      );
      
      const data = await response.json();
      
      return {
        city: data.city,
        state: data.principalSubdivision,
        country: data.countryCode,
        lat: lat,
        lng: lng,
        source: 'reverse_geocoding'
      };
    } catch (error) {
      console.error('Reverse geocoding falhou:', error);
      return null;
    }
  }

  autoFilter(location) {
    if (!location) return;

    // Não aplica filtros restritivos, apenas ordena por proximidade
    // A localização será usada apenas para ordenação, não para filtrar
    this.filters.state = null;
    this.filters.city = null;
    this.filters.active = false;

    // Aguarda um pouco para garantir que os cards estão renderizados
    setTimeout(() => {
      const cards = document.querySelectorAll('.acompanhante-card');
      if (cards.length > 0) {
        this.applyProximityFilter(cards);
        this.updateLocationIndicator(location);
        console.log(`📍 Localização detectada: ${location.city}, ${location.state}`);
        console.log(`✅ Página ordenada por proximidade geográfica`);
        console.log(`ℹ️ Mostrando todos os anúncios disponíveis ordenados por proximidade`);
      }
    }, 500);
    
    if (this.callbacks.onLocationDetected) {
      this.callbacks.onLocationDetected(location);
    }
  }

  normalizeState(state) {
    const stateMap = {
      'São Paulo': 'SP',
      'Rio de Janeiro': 'RJ',
      'Minas Gerais': 'MG',
      'Bahia': 'BA',
      'Paraná': 'PR',
      'Rio Grande do Sul': 'RS',
      'Pernambuco': 'PE',
      'Ceará': 'CE',
      'Pará': 'PA',
      'Santa Catarina': 'SC',
      'Goiás': 'GO',
      'Maranhão': 'MA',
      'Paraíba': 'PB',
      'Espírito Santo': 'ES',
      'Piauí': 'PI',
      'Alagoas': 'AL',
      'Tocantins': 'TO',
      'Rio Grande do Norte': 'RN',
      'Acre': 'AC',
      'Amapá': 'AP',
      'Amazonas': 'AM',
      'Mato Grosso': 'MT',
      'Mato Grosso do Sul': 'MS',
      'Rondônia': 'RO',
      'Roraima': 'RR',
      'Sergipe': 'SE',
      'Distrito Federal': 'DF'
    };

    return stateMap[state] || state;
  }

  initFilterInterface() {
    // Integra com elementos existentes da página
    this.integrateWithExistingElements();
    
    // Adiciona event listeners
    this.attachEventListeners();
  }

  integrateWithExistingElements() {
    // Remove interface duplicada se existir
    const existingFilters = document.getElementById('location-filters');
    if (existingFilters) {
      existingFilters.remove();
    }

    // Cria indicador de filtro integrado
    this.createIntegratedIndicator();
  }

  createIntegratedIndicator() {
    // Cria indicador de filtro que se integra com o layout existente
    const indicatorHTML = `
      <div id="location-indicator" class="location-indicator" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0.5rem 1rem;
        margin: 1rem 0;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        display: none;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      ">
        <span id="activeFilter">📍 Mostrando: Todos os Estados</span>
        <span id="resultCount" style="
          background: rgba(255, 255, 255, 0.2);
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.8rem;
        ">(0 anunciantes)</span>
      </div>
    `;

    // Insere após o header ou no início do conteúdo principal
    const header = document.querySelector('.main-header') || document.querySelector('header');
    const contentSection = document.querySelector('.content-section') || document.querySelector('main');
    
    if (contentSection) {
      contentSection.insertAdjacentHTML('afterbegin', indicatorHTML);
    }
  }

  createFilterInterface() {
    const filterHTML = `
      <div id="location-filters" class="location-filters">
        <div class="filter-group">
          <button id="useMyLocation" class="btn-location">
            <i class="fas fa-map-marker-alt"></i>
            Minha Localização
          </button>
          <select id="stateFilter" class="filter-select">
            <option value="">Todos os Estados</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
          <input type="text" id="citySearch" class="filter-input" placeholder="Buscar cidade...">
          <button id="clearFilters" class="btn-clear">
            <i class="fas fa-times"></i>
            Limpar
          </button>
        </div>
        <div id="filter-indicator" class="filter-indicator">
          <span id="activeFilter">📍 Mostrando: Todos os Estados</span>
          <span id="resultCount"></span>
        </div>
      </div>
    `;

    // Insere no início do conteúdo principal
    const mainContent = document.querySelector('main') || document.querySelector('.container') || document.body;
    mainContent.insertAdjacentHTML('afterbegin', filterHTML);

    // Adiciona estilos CSS
    this.addFilterStyles();
  }

  addFilterStyles() {
    const styles = `
      <style>
        .location-filters {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1rem;
          margin-bottom: 2rem;
          border-radius: 15px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .filter-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 1rem;
        }

        .btn-location {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-location:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .filter-select, .filter-input {
          padding: 0.5rem 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          font-weight: 500;
          min-width: 150px;
        }

        .filter-select:focus, .filter-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
        }

        .btn-clear {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-clear:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .filter-indicator {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          font-weight: 600;
        }

        #activeFilter {
          font-size: 1.1rem;
        }

        #resultCount {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.3rem 0.8rem;
          border-radius: 15px;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .filter-group {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-select, .filter-input {
            min-width: auto;
            width: 100%;
          }

          .btn-location, .btn-clear {
            width: 100%;
            justify-content: center;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  attachEventListeners() {
    // Botão "Minha Localização" existente
    const locationBtn = document.getElementById('locationBtn');
    if (locationBtn) {
      locationBtn.addEventListener('click', () => {
        this.detectLocation();
      });
    }

    // Input de busca de localização existente
    const locationSearch = document.getElementById('locationSearch');
    if (locationSearch) {
      locationSearch.addEventListener('input', (e) => {
        this.handleLocationSearch(e.target.value);
      });
      
      // Adiciona funcionalidade de dropdown de resultados
      this.setupLocationSearchDropdown(locationSearch);
    }
  }

  handleLocationSearch(query) {
    if (!query || query.length < 2) {
      this.hideLocationResults();
      return;
    }

    // Busca estados e cidades que correspondem à query
    const results = this.searchLocations(query);
    this.showLocationResults(results);
  }

  searchLocations(query) {
    const states = {
      'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
      'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal',
      'ES': 'Espírito Santo', 'GO': 'Goiás', 'MA': 'Maranhão',
      'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
      'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco',
      'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
      'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima',
      'SC': 'Santa Catarina', 'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
    };

    const results = [];
    const queryLower = query.toLowerCase();

    // Busca por estados
    Object.entries(states).forEach(([code, name]) => {
      if (name.toLowerCase().includes(queryLower) || code.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'state',
          code: code,
          name: name,
          display: `${name} (${code})`
        });
      }
    });

    // Busca por cidades (exemplos comuns)
    const commonCities = [
      'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília',
      'Fortaleza', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
      'Goiânia', 'Belém', 'Guarulhos', 'Campinas', 'São Luís',
      'Maceió', 'Duque de Caxias', 'Natal', 'Teresina', 'Campo Grande'
    ];

    commonCities.forEach(city => {
      if (city.toLowerCase().includes(queryLower)) {
        // Tenta determinar o estado da cidade
        const stateCode = this.getStateForCity(city);
        results.push({
          type: 'city',
          city: city,
          state: stateCode,
          display: `${city}, ${stateCode}`
        });
      }
    });

    return results.slice(0, 8); // Limita a 8 resultados
  }

  getStateForCity(city) {
    const cityStates = {
      'São Paulo': 'SP', 'Rio de Janeiro': 'RJ', 'Belo Horizonte': 'MG',
      'Salvador': 'BA', 'Brasília': 'DF', 'Fortaleza': 'CE',
      'Manaus': 'AM', 'Curitiba': 'PR', 'Recife': 'PE',
      'Porto Alegre': 'RS', 'Goiânia': 'GO', 'Belém': 'PA',
      'Guarulhos': 'SP', 'Campinas': 'SP', 'São Luís': 'MA',
      'Maceió': 'AL', 'Duque de Caxias': 'RJ', 'Natal': 'RN',
      'Teresina': 'PI', 'Campo Grande': 'MS'
    };
    return cityStates[city] || 'SP';
  }

  setupLocationSearchDropdown(input) {
    // Cria container de resultados
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'locationResults';
    resultsContainer.className = 'location-results';
    resultsContainer.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
    `;

    // Posiciona o container
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(resultsContainer);

    // Event listeners para mostrar/esconder
    input.addEventListener('focus', () => {
      if (resultsContainer.children.length > 0) {
        resultsContainer.style.display = 'block';
      }
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
        resultsContainer.style.display = 'none';
      }
    });
  }

  showLocationResults(results) {
    const resultsContainer = document.getElementById('locationResults');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    if (results.length === 0) {
      resultsContainer.innerHTML = '<div style="padding: 10px; color: #666;">Nenhum resultado encontrado</div>';
    } else {
      results.forEach(result => {
        const item = document.createElement('div');
        item.style.cssText = `
          padding: 10px 15px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s;
        `;
        item.textContent = result.display;
        
        item.addEventListener('mouseenter', () => {
          item.style.backgroundColor = '#f5f5f5';
        });
        
        item.addEventListener('mouseleave', () => {
          item.style.backgroundColor = 'white';
        });

        item.addEventListener('click', () => {
          this.selectLocation(result);
          resultsContainer.style.display = 'none';
        });

        resultsContainer.appendChild(item);
      });
    }

    resultsContainer.style.display = 'block';
  }

  hideLocationResults() {
    const resultsContainer = document.getElementById('locationResults');
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
    }
  }

  selectLocation(location) {
    if (location.type === 'state') {
      this.filters.state = location.code;
      this.filters.city = null;
    } else if (location.type === 'city') {
      this.filters.state = location.state;
      this.filters.city = location.city;
    }

    this.filters.active = true;
    this.applyFilters();
    this.updateLocationIndicator();

    // Atualiza o input
    const locationSearch = document.getElementById('locationSearch');
    if (locationSearch) {
      locationSearch.value = location.display;
    }
  }

  applyFilters() {
    // Aplica filtros aos cards existentes
    const cards = document.querySelectorAll('.acompanhante-card');
    
    // Se há localização detectada, ordena por proximidade
    if (this.currentLocation) {
      this.applyProximityFilter(cards);
    } else {
      // Filtro normal sem ordenação por proximidade
      let visibleCount = 0;
      cards.forEach(card => {
        const shouldShow = this.shouldShowCard(card);
        card.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) visibleCount++;
      });
      this.updateResultCount(visibleCount);
    }

    this.updateLocationIndicator();

    if (this.callbacks.onFilterApplied) {
      this.callbacks.onFilterApplied(this.filters);
    }
  }

  applyProximityFilter(cards) {
    const cardsArray = Array.from(cards);

    // Ordena todos os cards por proximidade
    const sortedCards = this.sortCardsByProximity(cardsArray);

    // Aplica filtros se houver
    const filteredCards = sortedCards.filter(card => this.shouldShowCard(card));

    // Se o carregamento infinito está ativado, não mostra todos os cards de uma vez
    if (this.infiniteScroll.enabled) {
      // Apenas atualiza a lista de cards disponíveis
      this.infiniteScroll.allCards = filteredCards;
      this.infiniteScroll.proximitySorted = true;
      this.resetInfiniteScroll();
      this.initInfiniteScroll();
    } else {
      // Mostra todos os cards ordenados por proximidade (modo normal)
      cardsArray.forEach(card => {
        card.style.display = 'none';
      });

      filteredCards.forEach(card => {
        card.style.display = 'block';
      });

      // Reordena no DOM para refletir a ordem de proximidade
      const container = cards[0]?.parentElement;
      if (container) {
        filteredCards.forEach(card => {
          container.appendChild(card);
        });
      }

      this.updateResultCount(filteredCards.length);
    }
    
    console.log(`✅ ${filteredCards.length} anunciantes ordenados por proximidade`);
    console.log(`📍 Ordenação por proximidade: ${this.currentLocation.city}, ${this.currentLocation.state}`);
  }

  shouldShowCard(card) {
    if (!this.filters.active) return true;

    const cardState = card.dataset.state;
    const cardCity = card.dataset.city;

    // Filtro por estado
    if (this.filters.state && cardState !== this.filters.state) {
      return false;
    }

    // Filtro por cidade
    if (this.filters.city && !cardCity.toLowerCase().includes(this.filters.city.toLowerCase())) {
      return false;
    }

    return true;
  }

  // Ordena cards por proximidade quando há localização detectada
  sortCardsByProximity(cards) {
    if (!this.currentLocation) return cards;

    const cardsArray = Array.from(cards);
    const currentCity = this.currentLocation.city?.toLowerCase() || '';
    const currentState = this.currentLocation.state || '';
    
    // Se há localização detectada, ordena por proximidade
    if (currentCity && currentState) {
      cardsArray.sort((a, b) => {
        const aState = a.dataset.state || '';
        const bState = b.dataset.state || '';
        const aCity = (a.dataset.city || '').toLowerCase();
        const bCity = (b.dataset.city || '').toLowerCase();

        // Prioridade 1: Mesma cidade (match exato ou parcial)
        const aCityMatch = aCity.includes(currentCity) || currentCity.includes(aCity);
        const bCityMatch = bCity.includes(currentCity) || currentCity.includes(bCity);
        
        if (aCityMatch && aState === currentState && (!bCityMatch || bState !== currentState)) {
          return -1;
        }
        if (bCityMatch && bState === currentState && (!aCityMatch || aState !== currentState)) {
          return 1;
        }

        // Prioridade 2: Mesmo estado (mesma cidade já foi tratada acima)
        if (aState === currentState && bState !== currentState) {
          return -1;
        }
        if (bState === currentState && aState !== currentState) {
          return 1;
        }

        // Prioridade 3: Mesma região geográfica
        const currentRegion = this.getRegion(currentState);
        const aRegion = this.getRegion(aState);
        const bRegion = this.getRegion(bState);

        if (aRegion === currentRegion && bRegion !== currentRegion) {
          return -1;
        }
        if (bRegion === currentRegion && aRegion !== currentRegion) {
          return 1;
        }

        // Prioridade 4: Regiões próximas (Sudeste/Centro-Oeste > Sul > Nordeste > Norte)
        const regionPriority = {
          'Sudeste': 1,
          'Centro-Oeste': 2,
          'Sul': 3,
          'Nordeste': 4,
          'Norte': 5
        };
        
        const currentPriority = regionPriority[currentRegion] || 99;
        const aPriority = regionPriority[aRegion] || 99;
        const bPriority = regionPriority[bRegion] || 99;
        
        const aDistance = Math.abs(aPriority - currentPriority);
        const bDistance = Math.abs(bPriority - currentPriority);
        
        if (aDistance < bDistance) return -1;
        if (bDistance < aDistance) return 1;

        return 0;
      });
    }

    return cardsArray;
  }

  getRegion(state) {
    const regions = {
      'Norte': ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'],
      'Nordeste': ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
      'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
      'Sudeste': ['ES', 'MG', 'RJ', 'SP'],
      'Sul': ['PR', 'RS', 'SC']
    };

    for (const [region, states] of Object.entries(regions)) {
      if (states.includes(state)) {
        return region;
      }
    }
    return 'Outro';
  }

  clearFilters() {
    this.filters.state = null;
    this.filters.city = null;
    this.filters.active = false;

    // Limpa inputs
    const stateFilter = document.getElementById('stateFilter');
    const citySearch = document.getElementById('citySearch');
    
    if (stateFilter) stateFilter.value = '';
    if (citySearch) citySearch.value = '';

    this.applyFilters();
  }

  updateLocationIndicator(location = null) {
    const indicator = document.getElementById('location-indicator');
    const activeFilter = document.getElementById('activeFilter');
    if (!indicator || !activeFilter) return;

    if (location) {
      activeFilter.textContent = `📍 Detectado: ${location.city}, ${location.state}`;
      indicator.style.display = 'flex';
    } else if (this.filters.active) {
      let text = '📍 Filtro ativo: ';
      if (this.filters.state) text += this.filters.state;
      if (this.filters.city) text += ` - ${this.filters.city}`;
      activeFilter.textContent = text;
      indicator.style.display = 'flex';
    } else {
      indicator.style.display = 'none';
    }
  }

  updateResultCount(count) {
    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
      resultCount.textContent = `(${count} anunciantes)`;
    }
  }

  useIPFallback() {
    // Usa geojs.io como fallback final
    this.getLocationByIP().then(location => {
      if (location) {
        this.currentLocation = location;
        this.autoFilter(location);
      }
    }).catch(error => {
      this.handleError('Não foi possível detectar sua localização');
    });
  }

  handleError(message) {
    console.error('Location System Error:', message);
    
    if (this.callbacks.onError) {
      this.callbacks.onError(message);
    }

    // Mostra notificação para o usuário
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ff4757' : '#2ed573'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-weight: 600;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  // Métodos de persistência
  getUsage(service) {
    const key = `location_usage_${service}`;
    const data = localStorage.getItem(key);
    if (!data) return 0;

    const usage = JSON.parse(data);
    const now = new Date();
    const lastReset = new Date(usage.lastReset);

    // Reset diário
    if (now.getDate() !== lastReset.getDate()) {
      localStorage.removeItem(key);
      return 0;
    }

    return usage.count || 0;
  }

  updateUsage(service) {
    const key = `location_usage_${service}`;
    const currentUsage = this.getUsage(service);
    const usage = {
      count: currentUsage + 1,
      lastReset: new Date().toISOString()
    };

    localStorage.setItem(key, JSON.stringify(usage));
  }

  getMinuteUsage(service) {
    const key = `location_minute_usage_${service}`;
    const data = localStorage.getItem(key);
    if (!data) return 0;

    const usage = JSON.parse(data);
    const now = new Date();
    const lastMinute = new Date(usage.lastMinute);

    // Reset por minuto
    if (now.getTime() - lastMinute.getTime() > 60000) {
      localStorage.removeItem(key);
      return 0;
    }

    return usage.count || 0;
  }

  updateMinuteUsage(service) {
    const key = `location_minute_usage_${service}`;
    const currentUsage = this.getMinuteUsage(service);
    const usage = {
      count: currentUsage + 1,
      lastMinute: new Date().toISOString()
    };

    localStorage.setItem(key, JSON.stringify(usage));
  }

  // Métodos públicos
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  getCurrentLocation() {
    return this.currentLocation;
  }

  getActiveFilters() {
    return { ...this.filters };
  }

  setFilter(state, city) {
    this.filters.state = state;
    this.filters.city = city;
    this.filters.active = !!(state || city);
    this.applyFilters();
  }

  // Aplica ordenação por proximidade após cards serem renderizados
  applyProximityAfterRender() {
    if (this.currentLocation) {
      const cards = document.querySelectorAll('.acompanhante-card');
      if (cards.length > 0) {
        this.applyProximityFilter(cards);
        this.initInfiniteScroll();
        console.log(`🔄 Ordenação por proximidade aplicada após renderização`);
      }
    }
  }

  // Inicializa o sistema de carregamento infinito
  initInfiniteScroll() {
    if (this.infiniteScroll.enabled) return;

    this.infiniteScroll.enabled = true;
    this.infiniteScroll.allCards = Array.from(document.querySelectorAll('.acompanhante-card'));
    this.infiniteScroll.currentPage = 1;
    this.infiniteScroll.visibleCards = [];

    // Ordena todos os cards por proximidade se há localização
    if (this.currentLocation) {
      this.infiniteScroll.allCards = this.sortCardsByProximity(this.infiniteScroll.allCards);
      this.infiniteScroll.proximitySorted = true;
    }

    // Carrega primeira página
    this.loadNextPage();

    // Adiciona listener de scroll
    this.addScrollListener();

    console.log(`♾️ Carregamento infinito ativado (${this.infiniteScroll.allCards.length} cards disponíveis)`);
  }

  // Adiciona listener de scroll para detectar quando chegar ao final
  addScrollListener() {
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        if (this.isNearBottom() && !this.infiniteScroll.loading) {
          this.loadNextPage();
        }
      }, 100);
    });
  }

  // Verifica se está próximo do final da página
  isNearBottom() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Carrega quando estiver a 200px do final
    return scrollTop + windowHeight >= documentHeight - 200;
  }

  // Carrega próxima página de cards
  loadNextPage() {
    if (this.infiniteScroll.loading) return;

    this.infiniteScroll.loading = true;
    const startIndex = (this.infiniteScroll.currentPage - 1) * this.infiniteScroll.itemsPerPage;
    const endIndex = startIndex + this.infiniteScroll.itemsPerPage;
    
    const cardsToShow = this.infiniteScroll.allCards.slice(startIndex, endIndex);
    
    if (cardsToShow.length === 0) {
      this.infiniteScroll.loading = false;
      return;
    }

    // Mostra os cards da próxima página
    cardsToShow.forEach(card => {
      card.style.display = 'block';
      this.infiniteScroll.visibleCards.push(card);
    });

    // Reordena no DOM se necessário
    if (this.infiniteScroll.proximitySorted) {
      this.reorderCardsInDOM();
    }

    this.infiniteScroll.currentPage++;
    this.infiniteScroll.loading = false;

    this.updateResultCount(this.infiniteScroll.visibleCards.length);
    
    console.log(`📄 Página ${this.infiniteScroll.currentPage - 1} carregada: ${cardsToShow.length} cards`);
  }

  // Reordena cards no DOM mantendo a ordem de proximidade
  reorderCardsInDOM() {
    const container = this.infiniteScroll.visibleCards[0]?.parentElement;
    if (!container) return;

    this.infiniteScroll.visibleCards.forEach(card => {
      container.appendChild(card);
    });
  }

  // Reseta o carregamento infinito
  resetInfiniteScroll() {
    this.infiniteScroll.enabled = false;
    this.infiniteScroll.loading = false;
    this.infiniteScroll.currentPage = 1;
    this.infiniteScroll.allCards = [];
    this.infiniteScroll.visibleCards = [];
    this.infiniteScroll.proximitySorted = false;
  }
}

// Inicializa o sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  window.locationSystem = new LocationSystem();
});

// Exporta para uso global
window.LocationSystem = LocationSystem;
