// ===== SERVIDOR SIMPLES TEMPORÁRIO - SEM BANCO DE DADOS =====
// Servidor básico para testes, sem Firebase nem MongoDB

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Remover Content Security Policy para evitar problemas
app.use((req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Content-Security-Policy');
  res.removeHeader('X-WebKit-CSP');
  next();
});

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend/src')));

// Servir fotos da pasta fotinha
app.use('/fotos', express.static(path.join(__dirname, '../fotinha/fotos')));

// ===== DADOS MOCK PARA TESTES =====
const mockAdvertisements = [
    {
        _id: '1',
        id: '1',
        nome: 'Maria Silva',
        name: 'Maria Silva',
        idade: '25',
        age: '25',
        cidade: 'São Paulo',
        estado: 'SP',
        preco: 'R$ 200/hora',
        price: 'R$ 200/hora',
        descricao: 'Garota de programa profissional, muito experiente.',
        description: 'Garota de programa profissional, muito experiente.',
        categoria: 'acompanhantes',
        category: 'acompanhantes',
        status: 'active',
        foto_capa: 'https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Maria',
        coverImage: 'https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Maria',
        foto_stories: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=MS',
        profileImage: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=MS',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '2',
        id: '2',
        nome: 'Ana Costa',
        name: 'Ana Costa',
        idade: '28',
        age: '28',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        preco: 'R$ 250/hora',
        price: 'R$ 250/hora',
        descricao: 'Acompanhante de luxo, muito discreta.',
        description: 'Acompanhante de luxo, muito discreta.',
        categoria: 'acompanhantes',
        category: 'acompanhantes',
        status: 'active',
        foto_capa: 'https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=Ana',
        coverImage: 'https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=Ana',
        foto_stories: 'https://via.placeholder.com/200x200/96CEB4/FFFFFF?text=AC',
        profileImage: 'https://via.placeholder.com/200x200/96CEB4/FFFFFF?text=AC',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '3',
        id: '3',
        nome: 'Julia Santos',
        name: 'Julia Santos',
        idade: '22',
        age: '22',
        cidade: 'Belo Horizonte',
        estado: 'MG',
        preco: 'R$ 180/hora',
        price: 'R$ 180/hora',
        descricao: 'Garota nova e animada, adora conversar.',
        description: 'Garota nova e animada, adora conversar.',
        categoria: 'acompanhantes',
        category: 'acompanhantes',
        status: 'active',
        foto_capa: 'https://via.placeholder.com/300x400/FFEAA7/333333?text=Julia',
        coverImage: 'https://via.placeholder.com/300x400/FFEAA7/333333?text=Julia',
        foto_stories: 'https://via.placeholder.com/200x200/DDA0DD/FFFFFF?text=JS',
        profileImage: 'https://via.placeholder.com/200x200/DDA0DD/FFFFFF?text=JS',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

const mockUsers = [
    {
        uid: 'user1',
        email: 'usuario1@teste.com',
        displayName: 'Usuário Teste 1',
        phoneNumber: '(11) 99999-9999',
        createdAt: new Date(),
        status: 'active'
    },
    {
        uid: 'user2',
        email: 'usuario2@teste.com',
        displayName: 'Usuário Teste 2',
        phoneNumber: '(11) 88888-8888',
        createdAt: new Date(),
        status: 'active'
    }
];

// ===== ROTAS DE TESTE =====
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor temporário funcionando perfeitamente!',
        database: 'Mock Data (Modo Temporário)',
        timestamp: new Date().toISOString(),
        status: 'online'
    });
});

// ===== ROTA PARA LISTAR FOTOS =====
app.get('/api/fotos', (req, res) => {
    try {
        const fs = require('fs');
        const fotosPath = path.join(__dirname, '../fotinha/fotos');
        
        // Ler arquivos da pasta fotos
        const files = fs.readdirSync(fotosPath);
        const fotos = files
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .map(file => ({
                nome: file,
                url: `/fotos/${file}`,
                path: path.join(fotosPath, file)
            }));
        
        console.log(`📸 Encontradas ${fotos.length} fotos`);
        res.json({
            success: true,
            data: fotos,
            total: fotos.length
        });
    } catch (error) {
        console.error('❌ Erro ao listar fotos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar fotos',
            error: error.message
        });
    }
});

// ===== ROTAS DE ANÚNCIOS =====
app.get('/api/advertisements', (req, res) => {
    try {
        const { category, categoria, status = 'active', page = 1, limit = 20 } = req.query;
        
        console.log('📋 Buscando anúncios (dados mock)...');
        
        let filteredAds = [...mockAdvertisements];
        
        // Aplicar filtros
        if (category || categoria) {
            const categoryValue = category || categoria;
            filteredAds = filteredAds.filter(ad => 
                ad.category === categoryValue || ad.categoria === categoryValue
            );
        }
        
        if (status) {
            filteredAds = filteredAds.filter(ad => ad.status === status);
        }
        
        // Paginação
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedAds = filteredAds.slice(startIndex, endIndex);
        
        console.log(`✅ Encontrados ${paginatedAds.length} anúncios`);
        res.json({
            success: true,
            data: paginatedAds,
            pagination: {
                total: filteredAds.length,
                totalPages: Math.ceil(filteredAds.length / limit),
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
app.get('/api/advertisements/featured', (req, res) => {
    try {
        const { limit = 6 } = req.query;
        
        console.log('⭐ Buscando anúncios em destaque (dados mock)...');
        
        const featuredAds = mockAdvertisements
            .filter(ad => ad.status === 'active')
            .slice(0, parseInt(limit))
            .map(ad => ({
                id: ad.id,
                name: ad.nome || ad.name || 'Nome não informado',
                age: ad.idade || ad.age,
                location: ad.cidade && ad.estado ? `${ad.cidade}, ${ad.estado}` : 'Localização não informada',
                price: ad.preco || ad.price || 'Preço não informado',
                description: ad.descricao || ad.description || '',
                category: ad.categoria || ad.category || 'Geral',
                mediaFiles: [
                    {
                        type: 'image',
                        src: ad.foto_capa || ad.coverImage,
                        alt: ad.nome || ad.name
                    }
                ],
                audioUrl: null
            }));
        
        console.log(`✅ Encontrados ${featuredAds.length} anúncios em destaque`);
        res.json({
            success: true,
            data: featuredAds,
            total: featuredAds.length
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
app.post('/api/auth/register', (req, res) => {
    try {
        const { email, password, displayName, phoneNumber } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }
        
        console.log('📝 Tentativa de cadastro:', { email, displayName });
        
        // Simular criação de usuário
        const newUser = {
            uid: 'user' + Date.now(),
            email,
            displayName,
            phoneNumber,
            createdAt: new Date(),
            status: 'active'
        };
        
        mockUsers.push(newUser);
        
        res.json({
            success: true,
            message: 'Usuário cadastrado com sucesso!',
            data: {
                uid: newUser.uid,
                email,
                displayName,
                phoneNumber,
                createdAt: newUser.createdAt
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

app.post('/api/auth/login', (req, res) => {
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
                token: 'mock-jwt-token-' + Date.now(),
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
app.get('/api/sensitive/personal-info/:uid', (req, res) => {
    try {
        const { uid } = req.params;
        
        console.log('📋 Buscando dados pessoais para UID:', uid);
        
        // Buscar usuário nos dados mock
        const user = mockUsers.find(u => u.uid === uid);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        res.json({
            success: true,
            data: {
                uid: uid,
                nome: user.displayName || 'Nome não informado',
                email: user.email || '',
                telefone: user.phoneNumber || '',
                endereco: 'Endereço não informado',
                cidade: 'Cidade não informada',
                estado: 'Estado não informado',
                cep: 'CEP não informado',
                dataNascimento: 'Data não informada',
                cpf: 'CPF não informado',
                rg: 'RG não informado',
                createdAt: user.createdAt,
                updatedAt: new Date()
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

app.post('/api/sensitive/personal-info/:uid', (req, res) => {
    try {
        const { uid } = req.params;
        const userData = req.body;
        
        console.log('💾 Salvando dados pessoais para UID:', uid);
        
        // Simular salvamento
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
    res.sendFile(path.join(__dirname, '../frontend/src/A_01__index.html'));
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
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🎉 SERVIDOR TEMPORÁRIO INICIADO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/test`);
    console.log(`📊 Database: Mock Data (Dados de Teste)`);
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
    console.log('⚠️  MODO TEMPORÁRIO: Usando dados mock');
    console.log('💡 Firebase e MongoDB serão configurados posteriormente');
    console.log('🎯 Sistema funcionando para testes do frontend');
    console.log('='.repeat(60));
});
