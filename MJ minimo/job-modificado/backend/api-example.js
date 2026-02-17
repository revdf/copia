// API para conectar com Firebase
// Este arquivo mostra como criar endpoints para buscar anúncios

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Dados mock para demonstração (substituir por chamadas ao Firebase)
const mockAdvertisements = [
  {
    id: "1",
    firebaseId: "firebase_1",
    nome: "Maria Silva",
    name: "Maria Silva",
    category: "massagem",
    categoria: "massagem",
    status: "active",
    foto_capa: "http://localhost:8080/../fotinha/fotos/avatar.jpg",
    coverImage: "http://localhost:8080/../fotinha/fotos/avatar.jpg",
    foto_stories: "http://localhost:8080/../fotinha/fotos/avatar.jpg",
    profileImage: "http://localhost:8080/../fotinha/fotos/avatar.jpg",
    galeria_1: "http://localhost:8080/../fotinha/fotos/foto (1).jpg",
    galeria_2: "http://localhost:8080/../fotinha/fotos/foto (2).jpg",
    galeria_3: "http://localhost:8080/../fotinha/fotos/foto (3).jpg",
    images: [
      "http://localhost:8080/../fotinha/fotos/foto (1).jpg",
      "http://localhost:8080/../fotinha/fotos/foto (2).jpg",
      "http://localhost:8080/../fotinha/fotos/foto (3).jpg"
    ],
    cidade: "São Paulo",
    estado: "SP",
    preco_30min: "R$ 100",
    preco_45min: "R$ 150",
    preco_1h: "R$ 200",
    audioUrl: "",
    descricao: "Massagem relaxante profissional",
    idade: "25",
    peso: "60kg",
    altura: "1.65m",
    aparencia: "Morena",
    etnia: "Brasileira",
    idiomas: "Português",
    aceita: "Cartão, PIX",
    verificacao: "Verificada",
    servicos: "Massagem, Relaxamento",
    advertiserId: "adv_1",
    tipo: "massagem",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    firebaseId: "firebase_2",
    nome: "Ana Costa",
    name: "Ana Costa",
    category: "massagem",
    categoria: "massagem",
    status: "active",
    foto_capa: "http://localhost:8080/../fotinha/fotos/avatar (2).jpg",
    coverImage: "http://localhost:8080/../fotinha/fotos/avatar (2).jpg",
    foto_stories: "http://localhost:8080/../fotinha/fotos/avatar (2).jpg",
    profileImage: "http://localhost:8080/../fotinha/fotos/avatar (2).jpg",
    galeria_1: "http://localhost:8080/../fotinha/fotos/foto (4).jpg",
    galeria_2: "http://localhost:8080/../fotinha/fotos/foto (5).jpg",
    images: [
      "http://localhost:8080/../fotinha/fotos/foto (4).jpg",
      "http://localhost:8080/../fotinha/fotos/foto (5).jpg"
    ],
    cidade: "Rio de Janeiro",
    estado: "RJ",
    preco_30min: "R$ 120",
    preco_45min: "R$ 170",
    preco_1h: "R$ 220",
    audioUrl: "",
    descricao: "Massagem terapêutica especializada",
    idade: "28",
    peso: "55kg",
    altura: "1.60m",
    aparencia: "Loira",
    etnia: "Brasileira",
    idiomas: "Português, Inglês",
    aceita: "Cartão, PIX, Dinheiro",
    verificacao: "Verificada",
    servicos: "Massagem, Terapia",
    advertiserId: "adv_2",
    tipo: "massagem",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Endpoint para buscar anúncios em destaque
app.get("/api/advertisements/featured", async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    // Retornar dados mock (substituir por chamadas ao Firebase)
    const advertisements = mockAdvertisements.slice(0, parseInt(limit));
    
    console.log(`✅ ${advertisements.length} anúncios em destaque encontrados`);
    
    res.json({
      success: true,
      data: advertisements,
      total: advertisements.length
    });
  } catch (error) {
    console.error("❌ Erro ao buscar anúncios em destaque:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Endpoint para buscar anúncios com filtros
app.get("/api/advertisements", async (req, res) => {
  try {
    const { category, categoria, status, tipo } = req.query;

    // Filtrar dados mock (substituir por chamadas ao Firebase)
    let advertisements = [...mockAdvertisements];
    
    // Aplicar filtros
    if (category || categoria) {
      const categoryValue = category || categoria;
      advertisements = advertisements.filter(ad => 
        ad.category === categoryValue || ad.categoria === categoryValue
      );
    }
    
    if (status) {
      advertisements = advertisements.filter(ad => ad.status === status);
    }
    
    if (tipo) {
      advertisements = advertisements.filter(ad => ad.tipo === tipo);
    }

    console.log(`✅ ${advertisements.length} anúncios encontrados`);

    res.json(advertisements);
  } catch (error) {
    console.error("❌ Erro ao buscar anúncios:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Endpoint para buscar um anúncio específico
app.get("/api/advertisements/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = mockAdvertisements.find(ad => ad.id === id || ad.firebaseId === id);

    if (!advertisement) {
      return res.status(404).json({ error: "Anúncio não encontrado" });
    }

    res.json(advertisement);
  } catch (error) {
    console.error("❌ Erro ao buscar anúncio:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Endpoint para criar um novo anúncio (mock - substituir por Firebase)
app.post("/api/advertisements", async (req, res) => {
  try {
    const newAd = {
      id: (mockAdvertisements.length + 1).toString(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockAdvertisements.push(newAd);

    console.log("✅ Anúncio criado:", newAd.id);

    res.status(201).json(newAd);
  } catch (error) {
    console.error("❌ Erro ao criar anúncio:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Endpoint para atualizar um anúncio (mock - substituir por Firebase)
app.put("/api/advertisements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const index = mockAdvertisements.findIndex(ad => ad.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Anúncio não encontrado" });
    }

    mockAdvertisements[index] = {
      ...mockAdvertisements[index],
      ...req.body,
      updatedAt: new Date()
    };

    console.log("✅ Anúncio atualizado:", id);

    res.json(mockAdvertisements[index]);
  } catch (error) {
    console.error("❌ Erro ao atualizar anúncio:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Endpoint para deletar um anúncio (mock - substituir por Firebase)
app.delete("/api/advertisements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const index = mockAdvertisements.findIndex(ad => ad.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Anúncio não encontrado" });
    }

    mockAdvertisements.splice(index, 1);

    console.log("✅ Anúncio deletado:", id);

    res.json({ message: "Anúncio deletado com sucesso" });
  } catch (error) {
    console.error("❌ Erro ao deletar anúncio:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Endpoint para sincronização com Firebase (Webhook)
app.post("/api/sync-from-firebase", async (req, res) => {
  try {
    const { firebaseData, action } = req.body;

    console.log(`🔄 Recebendo dados do Firebase - Ação: ${action}`);
    console.log("📊 Dados recebidos:", firebaseData);

    // Simular sincronização (substituir por lógica real do Firebase)
    res.json({
      success: true,
      action: action,
      message: "Dados recebidos do Firebase (mock)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro na sincronização Firebase:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Endpoint para sincronização manual (teste)
app.post("/api/sync-all-from-firebase", async (req, res) => {
  try {
    console.log("🔄 Iniciando sincronização manual de todos os dados...");

    // Simular sincronização (substituir por lógica real do Firebase)
    res.json({
      success: true,
      message: "Sincronização com Firebase realizada (mock)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro na sincronização manual:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para servir arquivos (mock - substituir por Firebase Storage)
app.get('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log(`📁 Servindo arquivo: ${fileId}`);
    
    // Simular arquivo (substituir por Firebase Storage)
    res.json({
      success: true,
      message: "Arquivo servido via Firebase Storage (mock)",
      fileId: fileId,
      url: `https://firebase-storage-url/${fileId}`
    });
    
  } catch (error) {
    console.error(`❌ Erro no endpoint /api/files/${req.params.fileId}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint de teste
app.get("/api/test", (req, res) => {
  res.json({
    message: "API funcionando!",
    timestamp: new Date().toISOString(),
    database: "Firebase (mock)",
    webhook: "Configurado para receber dados do Firebase",
  });
});

// Rota temporária para dados pessoais (simplificada)
app.get("/api/sensitive/personal-info/:uid", (req, res) => {
  res.json({
    success: true,
    data: {
      personalInfo: {
        nome: "",
        telefone: "",
        whatsapp: "",
        email: ""
      },
      email: "",
      status: "active",
      created_at: new Date().toISOString()
    }
  });
});

// Rota temporária para atualizar dados pessoais (simplificada)
app.put("/api/sensitive/personal-info/:uid", (req, res) => {
  console.log("Dados recebidos (PUT):", req.body);
  res.json({
    success: true,
    message: "Dados salvos com sucesso!",
    data: req.body
  });
});

// Rota temporária para criar dados pessoais (POST)
app.post("/api/sensitive/personal-info/:uid", (req, res) => {
  console.log("Dados recebidos (POST):", req.body);
  res.json({
    success: true,
    message: "Dados salvos com sucesso!",
    data: req.body
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Conectado ao Firebase (mock)`);
  console.log(`🔗 Endpoints disponíveis:`);
  console.log(`   GET /api/advertisements - Listar anúncios`);
  console.log(`   GET /api/advertisements/featured - Anúncios em destaque`);
  console.log(`   GET /api/advertisements/:id - Buscar anúncio específico`);
  console.log(`   POST /api/advertisements - Criar anúncio`);
  console.log(`   PUT /api/advertisements/:id - Atualizar anúncio`);
  console.log(`   DELETE /api/advertisements/:id - Deletar anúncio`);
  console.log(`   GET /api/test - Testar API`);
});

module.exports = app;
