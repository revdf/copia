/**
 * ============================================
 * STRIPE CHECKOUT - FRONTEND
 * ============================================
 * 
 * Integração frontend para criar sessões de checkout Stripe
 * 
 * @author Sistema Mansão do Job
 * @version 1.0.0
 */

// ============================================
// CONFIGURAÇÃO
// ============================================

// URL da Cloud Function (será configurada automaticamente)
const CHECKOUT_FUNCTION_URL = getCheckoutFunctionUrl();

// Planos disponíveis
const PLANS = {
    'basico': {
        name: 'Anúncio Básico',
        price: 'R$ 39,90',
        priceId: 'price_basico' // Será substituído pelo price_id real do Stripe
    },
    'plus': {
        name: 'Anúncio Plus',
        price: 'R$ 69,90',
        priceId: 'price_plus'
    },
    'especial': {
        name: 'Anúncio Especial',
        price: 'R$ 99,90',
        priceId: 'price_especial'
    }
};

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

/**
 * Inicia o processo de checkout Stripe
 * 
 * @param {string} adId - ID do anúncio
 * @param {string} planType - Tipo de plano: 'basico', 'plus', 'especial'
 * @param {string} userId - ID do usuário (opcional, será obtido do Firebase Auth)
 * @param {string} couponCode - Código do cupom (opcional, ex: 'PROMO9')
 * @returns {Promise<void>}
 */
async function startCheckout(adId, planType, userId = null, couponCode = null) {
    try {
        // Validar parâmetros
        if (!adId) {
            throw new Error('ID do anúncio é obrigatório');
        }

        if (!planType || !PLANS[planType]) {
            throw new Error(`Plano inválido. Use: ${Object.keys(PLANS).join(', ')}`);
        }

        // Obter userId do Firebase Auth se não fornecido
        if (!userId) {
            const auth = firebase.auth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Usuário não autenticado. Faça login primeiro.');
            }
            userId = user.uid;
        }

        // Mostrar loading
        showCheckoutLoading(true);

        // Preparar dados da requisição
        const requestData = {
            adId: adId,
            planType: planType,
            userId: userId,
        };

        // Adicionar cupom se fornecido
        if (couponCode) {
            requestData.couponCode = couponCode.toUpperCase();
        }

        console.log('🚀 Iniciando checkout:', requestData);

        // Chamar Cloud Function
        const response = await fetch(CHECKOUT_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar sessão de checkout');
        }

        const data = await response.json();
        console.log('✅ Sessão criada:', data);

        // Redirecionar para Stripe Checkout
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error('URL de checkout não retornada');
        }

    } catch (error) {
        console.error('❌ Erro no checkout:', error);
        showCheckoutLoading(false);
        showCheckoutError(error.message);
        throw error;
    }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Obtém a URL da Cloud Function automaticamente
 */
function getCheckoutFunctionUrl() {
    // Em desenvolvimento local
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5001/mansao-do-job/us-central1/createCheckoutSession';
    }

    // Em produção (substituir com seu projeto Firebase)
    const projectId = 'mansao-do-job'; // Substituir com seu project ID
    return `https://us-central1-${projectId}.cloudfunctions.net/createCheckoutSession`;
}

/**
 * Mostra/esconde loading durante checkout
 */
function showCheckoutLoading(show) {
    const loadingElement = document.getElementById('checkout-loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }

    // Desabilitar botões durante loading
    const buttons = document.querySelectorAll('.btn-checkout, .checkout-btn');
    buttons.forEach(btn => {
        btn.disabled = show;
        if (show) {
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });
}

/**
 * Mostra mensagem de erro
 */
function showCheckoutError(message) {
    // Criar ou atualizar elemento de erro
    let errorElement = document.getElementById('checkout-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'checkout-error';
        errorElement.className = 'checkout-error';
        errorElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(errorElement);
    }

    errorElement.textContent = `❌ Erro: ${message}`;
    errorElement.style.display = 'block';

    // Remover após 5 segundos
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

/**
 * Valida código de cupom
 */
function validateCoupon(couponCode) {
    const validCoupons = ['PROMO9'];
    return validCoupons.includes(couponCode.toUpperCase());
}

// ============================================
// FUNÇÃO DE INICIALIZAÇÃO
// ============================================

/**
 * Inicializa botões de checkout na página
 */
function initCheckoutButtons() {
    // Encontrar todos os botões com classe 'btn-checkout' ou 'checkout-btn'
    const buttons = document.querySelectorAll('.btn-checkout, .checkout-btn, [data-checkout]');

    buttons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();

            // Obter dados do botão
            const adId = this.getAttribute('data-ad-id') || 
                        this.getAttribute('data-anuncio-id') ||
                        getAnuncioIdFromUrl();
            
            const planType = this.getAttribute('data-plan') || 
                           this.getAttribute('data-plan-type') ||
                           'basico';
            
            const couponCode = this.getAttribute('data-coupon') || null;

            if (!adId) {
                showCheckoutError('ID do anúncio não encontrado');
                return;
            }

            try {
                await startCheckout(adId, planType, null, couponCode);
            } catch (error) {
                console.error('Erro ao iniciar checkout:', error);
            }
        });
    });
}

/**
 * Obtém ID do anúncio da URL
 */
function getAnuncioIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('adId') || urlParams.get('anuncioId');
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.startCheckout = startCheckout;
    window.initCheckoutButtons = initCheckoutButtons;
    window.validateCoupon = validateCoupon;
}

// Inicializar quando DOM estiver pronto
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCheckoutButtons);
    } else {
        initCheckoutButtons();
    }
}





