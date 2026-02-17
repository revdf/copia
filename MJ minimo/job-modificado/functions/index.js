/**
 * ============================================
 * CLOUD FUNCTIONS - STRIPE INTEGRATION
 * ============================================
 * 
 * Integração completa Stripe + Firebase para assinaturas de anúncios
 * 
 * Funcionalidades:
 * - Criar sessão de checkout Stripe
 * - Processar webhooks do Stripe
 * - Ativar/desativar anúncios automaticamente
 * - Gerenciar assinaturas mensais
 * - Aplicar cupom PROMO9
 * 
 * @author Sistema Mansão do Job
 * @version 1.0.0
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret);
const cors = require('cors')({ origin: true });

// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// ============================================
// CONFIGURAÇÃO DE PLANOS
// ============================================

const PLANS = {
    'basico': {
        name: 'Anúncio Básico',
        priceId: functions.config().stripe.price_basico || 'price_xxxxx', // Substituir com price_id real
        amount: 3990, // R$ 39,90 em centavos
        duration: 30 // dias
    },
    'plus': {
        name: 'Anúncio Plus',
        priceId: functions.config().stripe.price_plus || 'price_xxxxx', // Substituir com price_id real
        amount: 6990, // R$ 69,90 em centavos
        duration: 30
    },
    'especial': {
        name: 'Anúncio Especial',
        priceId: functions.config().stripe.price_especial || 'price_xxxxx', // Substituir com price_id real
        amount: 9990, // R$ 99,90 em centavos
        duration: 30
    }
};

// ============================================
// CRIAR SESSÃO DE CHECKOUT
// ============================================

/**
 * Cria uma sessão de checkout Stripe para assinatura mensal
 * 
 * POST /createCheckoutSession
 * Body: { adId, planType, userId, couponCode? }
 */
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            // Verificar método HTTP
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Método não permitido' });
            }

            const { adId, planType, userId, couponCode } = req.body;

            // Validações
            if (!adId || !planType || !userId) {
                return res.status(400).json({ 
                    error: 'Parâmetros obrigatórios: adId, planType, userId' 
                });
            }

            if (!PLANS[planType]) {
                return res.status(400).json({ 
                    error: `Plano inválido. Use: ${Object.keys(PLANS).join(', ')}` 
                });
            }

            const plan = PLANS[planType];

            // Verificar se o anúncio existe
            let adDoc = null;
            let adData = null;

            // Tentar buscar em 'advertisements'
            const adRef = db.collection('advertisements').doc(adId);
            adDoc = await adRef.get();

            if (!adDoc.exists) {
                // Tentar buscar em 'anuncios'
                const anuncioRef = db.collection('anuncios').doc(adId);
                adDoc = await anuncioRef.get();
                if (adDoc.exists) {
                    adData = adDoc.data();
                }
            } else {
                adData = adDoc.data();
            }

            if (!adDoc || !adDoc.exists) {
                return res.status(404).json({ error: 'Anúncio não encontrado' });
            }

            // Preparar dados da sessão
            const sessionData = {
                payment_method_types: ['card'],
                mode: 'subscription',
                line_items: [
                    {
                        price: plan.priceId,
                        quantity: 1,
                    },
                ],
                subscription_data: {
                    metadata: {
                        adId: adId,
                        userId: userId,
                        planType: planType,
                    },
                },
                metadata: {
                    adId: adId,
                    userId: userId,
                    planType: planType,
                },
                success_url: `${req.headers.origin || 'http://localhost:5500'}/pagamento-sucesso.html?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin || 'http://localhost:5500'}/pagamento.html?canceled=true`,
                customer_email: adData.userEmail || adData.email || null,
            };

            // Aplicar cupom PROMO9 se fornecido
            if (couponCode && couponCode.toUpperCase() === 'PROMO9') {
                sessionData.discounts = [{
                    coupon: 'PROMO9', // ID do cupom no Stripe
                }];
            }

            // Criar sessão no Stripe
            const session = await stripe.checkout.sessions.create(sessionData);

            // Salvar sessão no Firestore
            await db.collection('payments').doc(session.id).set({
                adId: adId,
                userId: userId,
                planType: planType,
                sessionId: session.id,
                status: 'pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: new Date(session.expires_at * 1000),
            });

            console.log(`✅ Sessão de checkout criada: ${session.id} para anúncio ${adId}`);

            return res.status(200).json({
                sessionId: session.id,
                url: session.url,
            });

        } catch (error) {
            console.error('❌ Erro ao criar sessão de checkout:', error);
            return res.status(500).json({ 
                error: 'Erro ao criar sessão de checkout',
                message: error.message 
            });
        }
    });
});

// ============================================
// WEBHOOK DO STRIPE
// ============================================

/**
 * Processa webhooks do Stripe
 * 
 * Eventos processados:
 * - checkout.session.completed: Pagamento aprovado
 * - invoice.payment_succeeded: Renovação bem-sucedida
 * - invoice.payment_failed: Pagamento falhou
 * - customer.subscription.deleted: Assinatura cancelada
 */
exports.webhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = functions.config().stripe.webhook_secret;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
        console.error('❌ Erro ao verificar webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`📥 Webhook recebido: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object);
                break;

            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;

            default:
                console.log(`⚠️ Evento não tratado: ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('❌ Erro ao processar webhook:', error);
        return res.status(500).json({ error: error.message });
    }
});

// ============================================
// HANDLERS DE EVENTOS
// ============================================

/**
 * Processa checkout.session.completed
 * Ativa o anúncio quando o pagamento é aprovado
 */
async function handleCheckoutCompleted(session) {
    try {
        const metadata = session.metadata || session.subscription_data?.metadata || {};
        const { adId, userId, planType } = metadata;

        if (!adId) {
            console.error('❌ adId não encontrado no metadata da sessão');
            return;
        }

        console.log(`✅ Checkout completado para anúncio ${adId}`);

        // Buscar assinatura para obter subscription_id
        const subscriptionId = session.subscription;
        const customerId = session.customer;

        // Calcular data de expiração (30 dias a partir de agora)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Atualizar anúncio para status 'active'
        await updateAdStatus(adId, {
            status: 'active',
            plan: planType,
            subscriptionId: subscriptionId,
            customerId: customerId,
            activeSince: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: expiresAt,
            lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Atualizar sessão de pagamento
        await db.collection('payments').doc(session.id).update({
            status: 'completed',
            subscriptionId: subscriptionId,
            customerId: customerId,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Criar registro de invoice
        if (session.invoice) {
            await saveInvoice(session.invoice, adId, userId);
        }

        console.log(`✅ Anúncio ${adId} ativado com sucesso`);

    } catch (error) {
        console.error('❌ Erro ao processar checkout completado:', error);
        throw error;
    }
}

/**
 * Processa invoice.payment_succeeded
 * Renovação mensal bem-sucedida
 */
async function handlePaymentSucceeded(invoice) {
    try {
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) {
            console.warn('⚠️ Invoice sem subscription_id');
            return;
        }

        // Buscar anúncio pela subscription_id
        const adSnapshot = await db.collection('advertisements')
            .where('subscriptionId', '==', subscriptionId)
            .limit(1)
            .get();

        let adId = null;
        let userId = null;

        if (!adSnapshot.empty) {
            const adDoc = adSnapshot.docs[0];
            adId = adDoc.id;
            userId = adDoc.data().userId || adDoc.data().advertiserId;
        } else {
            // Tentar em 'anuncios'
            const anuncioSnapshot = await db.collection('anuncios')
                .where('subscriptionId', '==', subscriptionId)
                .limit(1)
                .get();

            if (!anuncioSnapshot.empty) {
                const anuncioDoc = anuncioSnapshot.docs[0];
                adId = anuncioDoc.id;
                userId = anuncioDoc.data().userId || anuncioDoc.data().advertiserId;
            }
        }

        if (!adId) {
            console.warn(`⚠️ Anúncio não encontrado para subscription ${subscriptionId}`);
            return;
        }

        console.log(`✅ Pagamento renovado para anúncio ${adId}`);

        // Calcular nova data de expiração
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Atualizar anúncio
        await updateAdStatus(adId, {
            status: 'active',
            expiresAt: expiresAt,
            lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Salvar invoice
        await saveInvoice(invoice, adId, userId);

        console.log(`✅ Renovação processada para anúncio ${adId}`);

    } catch (error) {
        console.error('❌ Erro ao processar pagamento bem-sucedido:', error);
        throw error;
    }
}

/**
 * Processa invoice.payment_failed
 * Desativa anúncio quando pagamento falha
 */
async function handlePaymentFailed(invoice) {
    try {
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) {
            console.warn('⚠️ Invoice sem subscription_id');
            return;
        }

        // Buscar anúncio pela subscription_id
        const adSnapshot = await db.collection('advertisements')
            .where('subscriptionId', '==', subscriptionId)
            .limit(1)
            .get();

        let adId = null;

        if (!adSnapshot.empty) {
            adId = adSnapshot.docs[0].id;
        } else {
            // Tentar em 'anuncios'
            const anuncioSnapshot = await db.collection('anuncios')
                .where('subscriptionId', '==', subscriptionId)
                .limit(1)
                .get();

            if (!anuncioSnapshot.empty) {
                adId = anuncioSnapshot.docs[0].id;
            }
        }

        if (!adId) {
            console.warn(`⚠️ Anúncio não encontrado para subscription ${subscriptionId}`);
            return;
        }

        console.log(`❌ Pagamento falhou para anúncio ${adId}`);

        // Desativar anúncio
        await updateAdStatus(adId, {
            status: 'inactive',
            paymentFailedAt: admin.firestore.FieldValue.serverTimestamp(),
            paymentFailureReason: invoice.last_payment_error?.message || 'Pagamento falhou',
        });

        console.log(`✅ Anúncio ${adId} desativado devido a falha no pagamento`);

    } catch (error) {
        console.error('❌ Erro ao processar pagamento falhado:', error);
        throw error;
    }
}

/**
 * Processa customer.subscription.deleted
 * Desativa anúncio quando assinatura é cancelada
 */
async function handleSubscriptionDeleted(subscription) {
    try {
        const subscriptionId = subscription.id;

        // Buscar anúncio pela subscription_id
        const adSnapshot = await db.collection('advertisements')
            .where('subscriptionId', '==', subscriptionId)
            .limit(1)
            .get();

        let adId = null;

        if (!adSnapshot.empty) {
            adId = adSnapshot.docs[0].id;
        } else {
            // Tentar em 'anuncios'
            const anuncioSnapshot = await db.collection('anuncios')
                .where('subscriptionId', '==', subscriptionId)
                .limit(1)
                .get();

            if (!anuncioSnapshot.empty) {
                adId = anuncioSnapshot.docs[0].id;
            }
        }

        if (!adId) {
            console.warn(`⚠️ Anúncio não encontrado para subscription ${subscriptionId}`);
            return;
        }

        console.log(`⚠️ Assinatura cancelada para anúncio ${adId}`);

        // Desativar anúncio
        await updateAdStatus(adId, {
            status: 'inactive',
            subscriptionCanceledAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Anúncio ${adId} desativado devido a cancelamento`);

    } catch (error) {
        console.error('❌ Erro ao processar cancelamento:', error);
        throw error;
    }
}

/**
 * Processa customer.subscription.updated
 * Atualiza status do anúncio quando assinatura muda
 */
async function handleSubscriptionUpdated(subscription) {
    try {
        const subscriptionId = subscription.id;
        const status = subscription.status;

        // Buscar anúncio pela subscription_id
        const adSnapshot = await db.collection('advertisements')
            .where('subscriptionId', '==', subscriptionId)
            .limit(1)
            .get();

        let adId = null;

        if (!adSnapshot.empty) {
            adId = adSnapshot.docs[0].id;
        } else {
            // Tentar em 'anuncios'
            const anuncioSnapshot = await db.collection('anuncios')
                .where('subscriptionId', '==', subscriptionId)
                .limit(1)
                .get();

            if (!anuncioSnapshot.empty) {
                adId = anuncioSnapshot.docs[0].id;
            }
        }

        if (!adId) {
            console.warn(`⚠️ Anúncio não encontrado para subscription ${subscriptionId}`);
            return;
        }

        // Mapear status do Stripe para status do anúncio
        const adStatus = status === 'active' ? 'active' : 'inactive';

        await updateAdStatus(adId, {
            status: adStatus,
            subscriptionStatus: status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Status do anúncio ${adId} atualizado para ${adStatus}`);

    } catch (error) {
        console.error('❌ Erro ao processar atualização de assinatura:', error);
        throw error;
    }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Atualiza status do anúncio no Firestore
 */
async function updateAdStatus(adId, updates) {
    // Tentar atualizar em 'advertisements'
    const adRef = db.collection('advertisements').doc(adId);
    const adDoc = await adRef.get();

    if (adDoc.exists) {
        await adRef.update(updates);
        console.log(`✅ Anúncio ${adId} atualizado na coleção 'advertisements'`);
        return;
    }

    // Tentar atualizar em 'anuncios'
    const anuncioRef = db.collection('anuncios').doc(adId);
    const anuncioDoc = await anuncioRef.get();

    if (anuncioDoc.exists) {
        await anuncioRef.update(updates);
        console.log(`✅ Anúncio ${adId} atualizado na coleção 'anuncios'`);
        return;
    }

    throw new Error(`Anúncio ${adId} não encontrado em nenhuma coleção`);
}

/**
 * Salva invoice no Firestore
 */
async function saveInvoice(invoice, adId, userId) {
    try {
        const invoiceData = {
            adId: adId,
            userId: userId,
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            customerId: invoice.customer,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: invoice.status,
            paidAt: invoice.status === 'paid' ? admin.firestore.Timestamp.fromDate(new Date(invoice.status_transitions.paid_at * 1000)) : null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            invoiceData: invoice, // Salvar dados completos
        };

        await db.collection('invoices').doc(invoice.id).set(invoiceData);
        console.log(`✅ Invoice ${invoice.id} salvo no Firestore`);

    } catch (error) {
        console.error('❌ Erro ao salvar invoice:', error);
        throw error;
    }
}

// ============================================
// FUNÇÃO DE ENVIO DE EMAIL PARA REPROVAÇÃO
// ============================================

/**
 * Cloud Function para enviar email de reprovação de anúncio
 * 
 * @param {Object} data - Dados do email
 * @param {string} data.email - Email do destinatário
 * @param {string} data.anuncioId - ID do anúncio
 * @param {string} data.motivo - Motivo da reprovação
 * @param {string} data.nomeAnuncio - Nome do anúncio
 */
exports.sendRejectionEmail = functions.https.onCall(async (data, context) => {
    // Verificar autenticação (apenas moderadores)
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    // Verificar se é moderador
    const moderatorDoc = await db.collection('moderators').doc(context.auth.uid).get();
    if (!moderatorDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'Acesso negado');
    }

    const { email, anuncioId, motivo, nomeAnuncio } = data;

    if (!email || !motivo) {
        throw new functions.https.HttpsError('invalid-argument', 'Email e motivo são obrigatórios');
    }

    try {
        // Por enquanto, apenas logar o email (será implementado com serviço de email depois)
        console.log('📧 Email de reprovação:', {
            to: email,
            anuncioId: anuncioId,
            motivo: motivo,
            nomeAnuncio: nomeAnuncio || 'N/A'
        });

        // TODO: Implementar envio real de email usando Nodemailer ou SendGrid
        // Exemplo com Nodemailer:
        // const nodemailer = require('nodemailer');
        // const transporter = nodemailer.createTransport({...});
        // await transporter.sendMail({
        //     from: 'noreply@mansao-do-job.com',
        //     to: email,
        //     subject: 'Seu anúncio foi reprovado',
        //     html: `...`
        // });

        return { success: true, message: 'Email de reprovação registrado' };
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        throw new functions.https.HttpsError('internal', 'Erro ao enviar email');
    }
});





