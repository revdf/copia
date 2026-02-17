// ===== SERVIDOR FIREBASE TEMPORÁRIO - SEM MONGODB =====
// Usando apenas Firebase para testes, sem dependência do MongoDB Atlas

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend/src')));

// ===== CONFIGURAÇÃO FIREBASE =====
let db;
let storage;

async function initializeFirebase() {
    try {
        console.log('🔥 Inicializando Firebase (Modo Temporário)...');
        
        // Usar as credenciais do config.env
        const serviceAccount = {
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
        };

        // Inicializar Firebase
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
        });

        db = admin.firestore();
        storage = admin.storage();

        console.log('✅ Firebase inicializado com sucesso!');
        console.log(`🏷️  Projeto: ${process.env.FIREBASE_PROJECT_ID}`);
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        return false;
    }
}

// ===== ROTAS DE TESTE =====
app.get('/api/test', async (req, res) => {
    try {
        console.log('🧪 Testando conexão com Firebase...');
        
        // Teste básico de escrita e leitura
        const testDoc = {
            message: 'Teste de conexão Firebase',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            testId: Date.now()
        };
        
        const docRef = await db.collection('test').add(testDoc);
        const doc = await docRef.get();
        
        // Limpar documento de teste
        await docRef.delete();
        
        res.json({
            success: true,
            message: 'Conexão com Firebase funcionando perfeitamente!',
            database: 'Firebase (Modo Temporário)',
            testId: testDoc.testId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro no teste de conexão:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Falha na conexão com Firebase'
        });
    }
});

// ===== ROTAS DE ANÚNCIOS (COMPATÍVEIS COM FRONTEND) =====
app.get('/api/advertisements', async (req, res) => {
    try {
        const { category, categoria, status = 'active', page = 1, limit = 20 } = req.query;
        
        console.log('📋 Buscando anúncios no Firebase...');
        
        let query = db.collection('advertisements');
        
        // Aplicar filtros
        if (category || categoria) {
            const categoryValue = category || categoria;
            query = query.where('category', '==', categoryValue);
        }
        
        if (status) {
            query = query.where('status', '==', status);
        }
        
        const snapshot = await query
            .orderBy('createdAt', 'desc')
            .limit(parseInt(limit))
            .offset((parseInt(page) - 1) * parseInt(limit))
            .get();
        
        const advertisements = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            advertisements.push({
                _id: doc.id,
                id: doc.id,
                ...data,
                // Adicionar URLs de mídia se existirem
                foto_capa_url: data.foto_capa || data.coverImage,
                foto_stories_url: data.foto_stories || data.profileImage,
                galeria_urls: data.galeria || data.images || []
            });
        });
        
        console.log(`✅ Encontrados ${advertisements.length} anúncios`);
        res.json({
            success: true,
            data: advertisements,
            pagination: {
                total: advertisements.length,
                totalPages: Math.ceil(advertisements.length / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('❌ Erro ao buscar anúncios:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar anúncios',
            error: error.message
        });
    }
});

// Rota para anúncios em destaque
app.get('/api/advertisements/featured', async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        
        console.log('⭐ Buscando anúncios em destaque...');
        
        const snapshot = await db.collection('advertisements')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(parseInt(limit))
            .get();
        
        const advertisements = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            advertisements.push({
                id: doc.id,
                name: data.nome || data.name || 'Nome não informado',
                age: data.idade || data.age,
                location: data.cidade && data.estado ? `${data.cidade}, ${data.estado}` : (data.localizacao || data.location || 'Localização não informada'),
                price: data.preco || data.price || 'Preço não informado',
                description: data.descricao || data.description || '',
                category: data.categoria || data.category || 'Geral',
                mediaFiles: [],
                audioUrl: data.audioUrl || null
            });
        });
        
        console.log(`✅ Encontrados ${advertisements.length} anúncios em destaque`);
        res.json({
            success: true,
            data: advertisements,
            total: advertisements.length
        });
    } catch (error) {
        console.error('❌ Erro ao buscar anúncios em destaque:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar anúncios em destaque',
            error: error.message
        });
    }
});

// ===== ROTAS DE AUTENTICAÇÃO =====
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, displayName, phoneNumber } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }
        
        console.log('📝 Tentativa de cadastro:', { email, displayName });
        
        // Simular criação de usuário no Firebase
        const userData = {
            email,
            displayName,
            phoneNumber,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        };
        
        const docRef = await db.collection('users').add(userData);
        
        res.json({
            success: true,
            message: 'Usuário cadastrado com sucesso!',
            data: {
                uid: docRef.id,
                email,
                displayName,
                phoneNumber,
                createdAt: new Date()
            }
        });
        
    } catch (error) {
        console.error('❌ Erro no cadastro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }
        
        console.log('🔐 Tentativa de login:', { email });
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            data: {
                email,
                token: 'firebase-jwt-token-' + Date.now(),
                expiresIn: '24h'
            }
        });
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// ===== ROTAS DE DADOS PESSOAIS =====
app.get('/api/sensitive/personal-info/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        
        console.log('📋 Buscando dados pessoais para UID:', uid);
        
        // Buscar dados do usuário no Firebase
        const userDoc = await db.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        const userData = userDoc.data();
        
        res.json({
            success: true,
            data: {
                uid: uid,
                nome: userData.displayName || 'Nome não informado',
                email: userData.email || '',
                telefone: userData.phoneNumber || '',
                endereco: userData.endereco || '',
                cidade: userData.cidade || '',
                estado: userData.estado || '',
                cep: userData.cep || '',
                dataNascimento: userData.dataNascimento || '',
                cpf: userData.cpf || '',
                rg: userData.rg || '',
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar dados pessoais:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar dados pessoais',
            error: error.message
        });
    }
});

app.post('/api/sensitive/personal-info/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const userData = req.body;
        
        console.log('💾 Salvando dados pessoais para UID:', uid);
        
        // Atualizar dados do usuário no Firebase
        await db.collection('users').doc(uid).set({
            ...userData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        res.json({
            success: true,
            message: 'Dados pessoais salvos com sucesso!',
            data: {
                uid: uid,
                ...userData,
                updatedAt: new Date()
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao salvar dados pessoais:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao salvar dados pessoais',
            error: error.message
        });
    }
});

// ===== ROTAS PARA SERVIR FRONTEND =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/src/index.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/src/register.html'));
});

app.get('/premium.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/src/premium.html'));
});

app.get('/anunciar_GP_01.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/src/anunciar_GP_01.html'));
});

// ===== INICIALIZAÇÃO DO SERVIDOR =====
async function startServer() {
    console.log('🚀 Iniciando servidor Firebase Temporário...');
    
    const firebaseInitialized = await initializeFirebase();
    
    if (!firebaseInitialized) {
        console.error('❌ Falha ao inicializar Firebase. Encerrando servidor.');
        process.exit(1);
    }
    
    app.listen(PORT, () => {
        console.log('='.repeat(60));
        console.log('🎉 SERVIDOR FIREBASE TEMPORÁRIO INICIADO!');
        console.log('='.repeat(60));
        console.log(`🌐 Frontend: http://localhost:${PORT}`);
        console.log(`🔗 API: http://localhost:${PORT}/api/test`);
        console.log(`🔥 Database: Firebase (${process.env.FIREBASE_PROJECT_ID})`);
        console.log(`⚡ Status: Online (Modo Temporário)`);
        console.log(`🕐 Iniciado em: ${new Date().toLocaleString()}`);
        console.log('='.repeat(60));
        console.log('📋 Rotas disponíveis:');
        console.log(`   GET  /api/test - Teste de conexão`);
        console.log(`   GET  /api/advertisements - Listar anúncios`);
        console.log(`   GET  /api/advertisements/featured - Anúncios em destaque`);
        console.log(`   POST /api/auth/register - Cadastro de usuário`);
        console.log(`   POST /api/auth/login - Login de usuário`);
        console.log(`   GET  /api/sensitive/personal-info/:uid - Dados pessoais`);
        console.log(`   POST /api/sensitive/personal-info/:uid - Salvar dados pessoais`);
        console.log('='.repeat(60));
        console.log('⚠️  MODO TEMPORÁRIO: Usando apenas Firebase');
        console.log('💡 MongoDB Atlas será configurado posteriormente');
        console.log('='.repeat(60));
    });
}

// Iniciar servidor
startServer().catch(console.error);
