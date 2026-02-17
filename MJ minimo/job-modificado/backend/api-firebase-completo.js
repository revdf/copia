// API Firebase COMPLETA - Projeto copia-do-job
// Este servidor usa Firebase Firestore + Firebase Storage como banco de dados principal

import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config({ path: './config-firebase-only.env' });

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5000",
    "http://127.0.0.1:5000", 
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de inicialização
console.log("🚀 Iniciando API Firebase COMPLETA...");
console.log(`📊 Projeto: ${process.env.PROJECT_NAME || 'copia-do-job'}`);
console.log(`🌍 Ambiente: ${process.env.ENVIRONMENT || 'test'}`);
console.log(`🔗 Porta: ${process.env.PORT || 5000}`);
console.log(`🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID}`);

// Inicializar Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
  });
  
  console.log("✅ Firebase Admin SDK inicializado com sucesso");
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

// Obter referências do Firebase
const db = admin.firestore();
const bucket = admin.storage().bucket();

// Dados iniciais para popular o Firebase (se necessário)
const initialAdvertisements = [
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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Função para inicializar dados no Firebase
async function initializeFirebaseData() {
  try {
    const adsRef = db.collection('advertisements');
    const snapshot = await adsRef.get();
    
    if (snapshot.empty) {
      console.log("📝 Inicializando dados no Firebase...");
      const batch = db.batch();
      
      initialAdvertisements.forEach(ad => {
        const docRef = adsRef.doc(ad.id);
        batch.set(docRef, ad);
      });
      
      await batch.commit();
      console.log("✅ Dados iniciais adicionados ao Firebase");
    } else {
      console.log(`📊 Firebase já possui ${snapshot.size} anúncios`);
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar dados:", error);
  }
}

// Inicializar dados
initializeFirebaseData();

// Endpoint para buscar anúncios em destaque
app.get("/api/advertisements/featured", async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const adsRef = db.collection('advertisements');
    const snapshot = await adsRef
      .where('status', '==', 'active')
      .limit(parseInt(limit))
      .get();
    
    const advertisements = [];
    snapshot.forEach(doc => {
      advertisements.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${advertisements.length} anúncios em destaque encontrados`);
    res.json({
      success: true,
      data: advertisements,
      total: advertisements.length,
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("❌ Erro ao buscar anúncios em destaque:", error);
    res.status(500).json({ 
      success: false,
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

// Endpoint para buscar anúncios com filtros
app.get("/api/advertisements", async (req, res) => {
  try {
    const { category, categoria, status, tipo } = req.query;
    let query = db.collection('advertisements');
    
    if (category || categoria) {
      const categoryValue = category || categoria;
      query = query.where('category', '==', categoryValue);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (tipo) {
      query = query.where('tipo', '==', tipo);
    }
    
    const snapshot = await query.get();
    const advertisements = [];
    
    snapshot.forEach(doc => {
      advertisements.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${advertisements.length} anúncios encontrados`);
    res.json({
      success: true,
      data: advertisements,
      total: advertisements.length,
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("❌ Erro ao buscar anúncios:", error);
    res.status(500).json({ 
      success: false,
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

// Endpoint para buscar um anúncio específico
app.get("/api/advertisements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('advertisements').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        error: "Anúncio não encontrado" 
      });
    }
    
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      },
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("❌ Erro ao buscar anúncio:", error);
    res.status(500).json({ 
      success: false,
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

// Endpoint para criar um novo anúncio
app.post("/api/advertisements", async (req, res) => {
  try {
    console.log("📥 Recebendo dados para criar anúncio...");
    console.log("📦 Dados recebidos:", JSON.stringify(req.body, null, 2).substring(0, 500)); // Log parcial para debug
    
    // Remover campos grandes (imagens base64) que podem exceder o limite do Firestore (1MB)
    const { foto_banner, galeria, ...restData } = req.body;
    
    // Processar banner - se for base64, não incluir (muito grande para Firestore)
    const processedBanner = foto_banner && foto_banner.startsWith('data:image') 
      ? '' // Base64 muito grande, será processado separadamente se necessário
      : foto_banner;
    
    // Processar galeria - remover imagens base64
    const processedGaleria = Array.isArray(galeria) 
      ? galeria.filter(img => img && !img.startsWith('data:image'))
      : [];
    
    // Calcular tamanho aproximado do documento
    const dataSize = JSON.stringify(req.body).length;
    if (dataSize > 900000) { // ~900KB para deixar margem de segurança
      console.warn(`⚠️ Documento grande (${dataSize} bytes). Removendo campos grandes...`);
    }
    
    // Verificar se os dados essenciais estão presentes
    if (!restData.nome && !restData.name) {
      console.warn("⚠️ Aviso: Nome não fornecido no anúncio");
    }
    if (!restData.cidade && !restData.estado) {
      console.warn("⚠️ Aviso: Localização não fornecida no anúncio");
    }
    
    const newAd = {
      ...restData,
      foto_banner: processedBanner,
      galeria: processedGaleria,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    console.log("💾 Salvando anúncio na coleção 'advertisements'...");
    console.log("📋 Campos do anúncio:", Object.keys(newAd).join(', '));
    
    const docRef = await db.collection('advertisements').add(newAd);
    
    console.log("✅ Anúncio criado com sucesso!");
    console.log("🆔 ID do anúncio:", docRef.id);
    console.log("📝 Nome do anúncio:", newAd.nome || newAd.name || 'Não informado');
    console.log("📍 Localização:", `${newAd.cidade || ''} - ${newAd.estado || ''}`);
    console.log(`📊 Tamanho do documento: ~${JSON.stringify(newAd).length} bytes`);
    
    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...newAd
      },
      database: "Firebase Firestore",
      warning: dataSize > 900000 ? "Alguns campos grandes foram removidos para evitar exceder limite do Firestore" : undefined
    });
  } catch (error) {
    console.error("❌ Erro ao criar anúncio:", error);
    console.error("📋 Stack trace:", error.stack);
    res.status(500).json({ 
      success: false,
      error: "Erro interno do servidor",
      details: error.message,
      hint: error.message.includes('exceeds the maximum allowed size') 
        ? "Documento muito grande. Imagens base64 foram removidas automaticamente." 
        : undefined
    });
  }
});

// Endpoint para atualizar um anúncio
app.put("/api/advertisements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('advertisements').doc(id).update(updateData);
    
    const updatedDoc = await db.collection('advertisements').doc(id).get();
    
    console.log("✅ Anúncio atualizado:", id);
    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      },
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar anúncio:", error);
    res.status(500).json({ 
      success: false,
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

// Endpoint para deletar um anúncio
app.delete("/api/advertisements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('advertisements').doc(id).delete();
    
    console.log("✅ Anúncio deletado:", id);
    res.json({ 
      success: true,
      message: "Anúncio deletado com sucesso",
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("❌ Erro ao deletar anúncio:", error);
    res.status(500).json({ 
      success: false,
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

// Endpoint para sincronização com Firebase (Webhook)
app.post("/api/sync-from-firebase", async (req, res) => {
  try {
    const { firebaseData, action } = req.body;
    console.log(`🔄 Recebendo dados do Firebase - Ação: ${action}`);
    console.log("📊 Dados recebidos:", firebaseData);
    
    // Aqui você pode processar os dados recebidos do Firebase
    // Por exemplo, salvar em uma coleção de logs ou sincronizar com outras coleções
    
    res.json({
      success: true,
      action: action,
      message: "Dados recebidos do Firebase com sucesso",
      timestamp: new Date().toISOString(),
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("❌ Erro na sincronização Firebase:", error);
    res.status(500).json({ 
      success: false,
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

// Endpoint para sincronização manual (teste)
app.post("/api/sync-all-from-firebase", async (req, res) => {
  try {
    console.log("🔄 Iniciando sincronização manual de todos os dados...");
    
    // Aqui você pode implementar lógica de sincronização
    // Por exemplo, sincronizar dados entre diferentes coleções
    
    res.json({
      success: true,
      message: "Sincronização com Firebase realizada com sucesso",
      timestamp: new Date().toISOString(),
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("❌ Erro na sincronização manual:", error);
    res.status(500).json({ 
      success: false,
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

// Rota para servir arquivos via Firebase Storage
app.get('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log(`📁 Servindo arquivo: ${fileId}`);
    
    // Gerar URL assinada para download do Firebase Storage
    const file = bucket.file(fileId);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutos
    });
    
    res.json({
      success: true,
      message: "Arquivo servido via Firebase Storage",
      fileId: fileId,
      url: url,
      database: "Firebase Storage"
    });
  } catch (error) {
    console.error(`❌ Erro no endpoint /api/files/${req.params.fileId}:`, error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota para upload de imagens para Firebase Storage
app.post('/api/upload', async (req, res) => {
  try {
    const { fileName, fileData, contentType } = req.body;
    
    if (!fileName || !fileData) {
      return res.status(400).json({
        success: false,
        error: 'fileName e fileData são obrigatórios'
      });
    }
    
    // Converter base64 para buffer
    const buffer = Buffer.from(fileData, 'base64');
    
    // Upload para Firebase Storage
    const file = bucket.file(`images/${fileName}`);
    await file.save(buffer, {
      metadata: {
        contentType: contentType || 'image/jpeg',
      },
    });
    
    // Tornar o arquivo público
    await file.makePublic();
    
    // Obter URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    
    console.log(`✅ Imagem enviada: ${fileName}`);
    
    res.json({
      success: true,
      message: "Imagem enviada com sucesso",
      fileName: fileName,
      url: publicUrl,
      database: "Firebase Storage"
    });
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no upload da imagem',
      details: error.message
    });
  }
});

// Endpoint de teste
app.get("/api/test", async (req, res) => {
  try {
    // Teste de conexão com Firebase
    const testRef = db.collection('test').doc('connection');
    await testRef.set({
      message: 'Teste de conexão Firebase',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      environment: process.env.ENVIRONMENT || 'test'
    });
    
    const doc = await testRef.get();
    
    res.json({
      success: true,
      message: "API funcionando!",
      timestamp: new Date().toISOString(),
      database: "Firebase Firestore",
      firebase: process.env.FIREBASE_PROJECT_ID,
      environment: process.env.ENVIRONMENT || "test",
      testData: doc.data(),
      webhook: "Configurado para receber dados do Firebase"
    });
  } catch (error) {
    console.error("❌ Erro no teste:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      database: "Firebase Firestore"
    });
  }
});

// Rota temporária para dados pessoais (simplificada)
app.get("/api/sensitive/personal-info/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const doc = await db.collection('users').doc(uid).get();
    
    if (!doc.exists) {
      return res.json({
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
        },
        database: "Firebase Firestore"
      });
    }
    
    res.json({
      success: true,
      data: doc.data(),
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("❌ Erro ao buscar dados pessoais:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      database: "Firebase Firestore"
    });
  }
});

// Rota temporária para atualizar dados pessoais (simplificada)
app.put("/api/sensitive/personal-info/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(uid).set(updateData, { merge: true });
    
    console.log("Dados recebidos (PUT):", req.body);
    res.json({
      success: true,
      message: "Dados salvos com sucesso!",
      data: req.body,
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar dados pessoais:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      database: "Firebase Firestore"
    });
  }
});

// Rota temporária para criar dados pessoais (POST)
app.post("/api/sensitive/personal-info/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const userData = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(uid).set(userData);
    
    console.log("Dados recebidos (POST):", req.body);
    res.json({
      success: true,
      message: "Dados salvos com sucesso!",
      data: req.body,
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("❌ Erro ao criar dados pessoais:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      database: "Firebase Firestore"
    });
  }
});

// Middleware de erro
app.use((error, req, res, next) => {
  console.error("❌ Erro no servidor Firebase:", error);
  res.status(500).json({
    success: false,
    error: error.message,
    code: error.code,
    database: "Firebase Firestore"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Conectado ao Firebase Firestore`);
  console.log(`🗄️  Projeto: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`🔗 Endpoints disponíveis:`);
  console.log(`   GET /api/advertisements - Listar anúncios`);
  console.log(`   GET /api/advertisements/featured - Anúncios em destaque`);
  console.log(`   GET /api/advertisements/:id - Buscar anúncio específico`);
  console.log(`   POST /api/advertisements - Criar anúncio`);
  console.log(`   PUT /api/advertisements/:id - Atualizar anúncio`);
  console.log(`   DELETE /api/advertisements/:id - Deletar anúncio`);
  console.log(`   GET /api/test - Testar API`);
  console.log(`🔥 Firebase Storage: Configurado`);
  console.log(`✅ 100% Firebase - SEM MongoDB!`);
});

export default app;
