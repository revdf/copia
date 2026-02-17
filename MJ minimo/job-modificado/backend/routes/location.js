/**
 * Rotas para Localização
 * Detecta localização do usuário por IP e retorna cidade/estado
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * GET /api/location
 * Detecta localização do usuário via IP
 * Retorna: { cidade, estado, estadoNome, pais, sucesso }
 */
router.get('/', async (req, res) => {
    try {
        // Obter IP do cliente
        const clientIP = req.ip || 
                        req.headers['x-forwarded-for']?.split(',')[0] || 
                        req.headers['x-real-ip'] || 
                        req.connection.remoteAddress ||
                        '8.8.8.8'; // Fallback para IP público
        
        console.log(`📍 Detectando localização para IP: ${clientIP}`);
        
        // Tentar API ipapi.co primeiro
        let localizacao = null;
        try {
            const response = await axios.get(`https://ipapi.co/${clientIP}/json/`, {
                timeout: 5000
            });
            
            if (response.data && !response.data.error) {
                localizacao = {
                    cidade: response.data.city || null,
                    estado: response.data.region_code || null,
                    estadoNome: response.data.region || null,
                    pais: response.data.country_code || null,
                    paisNome: response.data.country_name || null,
                    metodo: 'ipapi.co',
                    ip: clientIP
                };
                console.log('✅ Localização detectada via ipapi.co:', localizacao);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao usar ipapi.co:', error.message);
        }
        
        // Se falhar, tentar API alternativa (ip-api.com)
        if (!localizacao || !localizacao.cidade) {
            try {
                const response = await axios.get(`http://ip-api.com/json/${clientIP}`, {
                    timeout: 5000
                });
                
                if (response.data && response.data.status === 'success') {
                    localizacao = {
                        cidade: response.data.city || null,
                        estado: response.data.region || null,
                        estadoNome: response.data.regionName || null,
                        pais: response.data.countryCode || null,
                        paisNome: response.data.country || null,
                        metodo: 'ip-api.com',
                        ip: clientIP
                    };
                    console.log('✅ Localização detectada via ip-api.com:', localizacao);
                }
            } catch (error) {
                console.warn('⚠️ Erro ao usar ip-api.com:', error.message);
            }
        }
        
        // Se ainda não tiver localização, retornar erro
        if (!localizacao || (!localizacao.cidade && !localizacao.estado)) {
            return res.json({
                sucesso: false,
                mensagem: 'Não foi possível detectar localização',
                ip: clientIP
            });
        }
        
        // Normalizar estado para sigla brasileira (se necessário)
        if (localizacao.estado && localizacao.estado.length > 2) {
            localizacao.estado = normalizarEstado(localizacao.estadoNome || localizacao.estado);
        }
        
        // Verificar se é DF (Distrito Federal)
        if (localizacao.estado === 'DF' || 
            localizacao.estadoNome?.toLowerCase().includes('distrito federal') ||
            localizacao.cidade?.toLowerCase().includes('brasília') ||
            localizacao.cidade?.toLowerCase().includes('brasilia')) {
            localizacao.estado = 'DF';
            localizacao.estadoNome = 'Distrito Federal';
            // Para DF, ignorar cidade específica (regra especial)
            localizacao.cidade = null;
            localizacao.isDF = true;
        }
        
        res.json({
            sucesso: true,
            ...localizacao
        });
        
    } catch (error) {
        console.error('❌ Erro ao detectar localização:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao detectar localização',
            erro: error.message
        });
    }
});

/**
 * Normaliza nome de estado para sigla brasileira
 */
function normalizarEstado(nomeEstado) {
    if (!nomeEstado) return null;
    
    const estados = {
        'acre': 'AC',
        'alagoas': 'AL',
        'amapá': 'AP',
        'amapa': 'AP',
        'amazonas': 'AM',
        'bahia': 'BA',
        'ceará': 'CE',
        'ceara': 'CE',
        'distrito federal': 'DF',
        'espírito santo': 'ES',
        'espirito santo': 'ES',
        'goiás': 'GO',
        'goias': 'GO',
        'maranhão': 'MA',
        'maranhao': 'MA',
        'mato grosso': 'MT',
        'mato grosso do sul': 'MS',
        'minas gerais': 'MG',
        'pará': 'PA',
        'para': 'PA',
        'paraíba': 'PB',
        'paraiba': 'PB',
        'paraná': 'PR',
        'parana': 'PR',
        'pernambuco': 'PE',
        'piauí': 'PI',
        'piaui': 'PI',
        'rio de janeiro': 'RJ',
        'rio grande do norte': 'RN',
        'rio grande do sul': 'RS',
        'rondônia': 'RO',
        'rondonia': 'RO',
        'roraima': 'RR',
        'santa catarina': 'SC',
        'são paulo': 'SP',
        'sao paulo': 'SP',
        'sergipe': 'SE',
        'tocantins': 'TO'
    };
    
    const nomeNormalizado = nomeEstado.toLowerCase().trim();
    return estados[nomeNormalizado] || null;
}

export default router;









