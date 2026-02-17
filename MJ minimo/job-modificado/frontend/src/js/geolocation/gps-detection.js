/**
 * Detecção de Localização por GPS (Geolocalização do Navegador)
 * Usa API de Geolocalização HTML5 para alta precisão
 */

/**
 * Detecta localização usando GPS do navegador
 * @returns {Promise<Object>} Objeto com dados de localização
 */
async function detectarPorGPS() {
    return new Promise((resolve, reject) => {
        // Verificar se o navegador suporta geolocalização
        if (!navigator.geolocation) {
            const erro = {
                cidade: null,
                estado: null,
                estadoNome: null,
                pais: null,
                paisNome: null,
                latitude: null,
                longitude: null,
                metodo: 'gps',
                erro: 'Geolocalização não suportada pelo navegador',
                timestamp: new Date().toISOString()
            };
            reject(erro);
            return;
        }
        
        // Opções de geolocalização
        const opcoes = {
            enableHighAccuracy: true,  // Alta precisão (GPS)
            timeout: 10000,            // Timeout de 10 segundos
            maximumAge: 0              // Não usar cache
        };
        
        // Solicitar localização
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                console.log('📍 Coordenadas GPS obtidas:', { latitude, longitude });
                
                // Converter coordenadas para endereço (reverse geocoding)
                try {
                    const endereco = await converterCoordenadasParaEndereco(latitude, longitude);
                    
                    const localizacao = {
                        cidade: endereco.cidade || null,
                        estado: endereco.estado || null,
                        estadoNome: endereco.estadoNome || null,
                        pais: endereco.pais || 'BR',
                        paisNome: endereco.paisNome || 'Brasil',
                        latitude: latitude,
                        longitude: longitude,
                        precisao: position.coords.accuracy,
                        metodo: 'gps',
                        timestamp: new Date().toISOString()
                    };
                    
                    console.log('📍 Localização GPS processada:', localizacao);
                    resolve(localizacao);
                    
                } catch (error) {
                    // Se falhar a conversão, retornar apenas coordenadas
                    const localizacao = {
                        cidade: null,
                        estado: null,
                        estadoNome: null,
                        pais: 'BR',
                        paisNome: 'Brasil',
                        latitude: latitude,
                        longitude: longitude,
                        precisao: position.coords.accuracy,
                        metodo: 'gps',
                        erro: 'Falha ao converter coordenadas para endereço',
                        timestamp: new Date().toISOString()
                    };
                    resolve(localizacao);
                }
            },
            (error) => {
                // Erro ao obter localização
                let mensagemErro = 'Erro desconhecido';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensagemErro = 'Permissão de localização negada pelo usuário';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensagemErro = 'Informação de localização indisponível';
                        break;
                    case error.TIMEOUT:
                        mensagemErro = 'Tempo de espera excedido';
                        break;
                }
                
                const erro = {
                    cidade: null,
                    estado: null,
                    estadoNome: null,
                    pais: null,
                    paisNome: null,
                    latitude: null,
                    longitude: null,
                    metodo: 'gps',
                    erro: mensagemErro,
                    codigoErro: error.code,
                    timestamp: new Date().toISOString()
                };
                
                console.error('❌ Erro ao detectar localização por GPS:', erro);
                reject(erro);
            },
            opcoes
        );
    });
}

/**
 * Converte coordenadas GPS para endereço (Reverse Geocoding)
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<Object>} Objeto com dados do endereço
 */
async function converterCoordenadasParaEndereco(latitude, longitude) {
    try {
        // Usar API Nominatim (OpenStreetMap) - gratuita, sem chave
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=pt-BR`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'MansaoDoJob/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extrair informações do endereço
        const address = data.address || {};
        
        // Mapear campos do Nominatim para nosso formato
        const endereco = {
            cidade: address.city || address.town || address.village || address.municipality || null,
            estado: address.state_code || null,
            estadoNome: address.state || null,
            pais: address.country_code ? address.country_code.toUpperCase() : 'BR',
            paisNome: address.country || 'Brasil',
            bairro: address.suburb || address.neighbourhood || null,
            rua: address.road || null,
            cep: address.postcode || null
        };
        
        console.log('📍 Endereço convertido:', endereco);
        return endereco;
        
    } catch (error) {
        console.error('❌ Erro ao converter coordenadas para endereço:', error);
        throw error;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.detectarPorGPS = detectarPorGPS;
    window.converterCoordenadasParaEndereco = converterCoordenadasParaEndereco;
}









