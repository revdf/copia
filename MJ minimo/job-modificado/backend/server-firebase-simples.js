// Servidor Firebase SIMPLES - Projeto copia-do-job
// Este servidor usa Firebase com configuração mínima para teste

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require('dotenv').config({ path: './config-firebase-only.env' });

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5001",
    "http://127.0.0.1:5001", 
    "http://localhost:5502",
    "http://127.0.0.1:5502",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de inicialização
console.log("🚀 Iniciando servidor Firebase SIMPLES...");
console.log(`📊 Projeto: ${process.env.PROJECT_NAME || 'copia-do-job'}`);
console.log(`🌍 Ambiente: ${process.env.ENVIRONMENT || 'test'}`);
console.log(`🔗 Porta: ${process.env.PORT || 5001}`);
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
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
  });
  
  console.log("✅ Firebase Admin SDK inicializado com sucesso");
  console.log(`📦 Storage Bucket: ${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`);
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

// Obter referência do Firestore
const db = admin.firestore();

// Rotas principais
app.get("/", (req, res) => {
  res.json({
    message: "Servidor Firebase SIMPLES - copia-do-job",
    environment: process.env.ENVIRONMENT || "test",
    project: process.env.PROJECT_NAME || "copia-do-job",
    port: process.env.PORT || 5001,
    database: "Firebase Firestore",
    firebase: process.env.FIREBASE_PROJECT_ID,
    timestamp: new Date().toISOString(),
    status: "Funcionando"
  });
});

// Rota para testar conexão básica
app.get("/api/test", async (req, res) => {
  try {
    // Teste simples de conexão
    const testRef = db.collection('test').doc('connection');
    await testRef.set({
      message: 'Teste de conexão',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      environment: process.env.ENVIRONMENT || 'test'
    });
    
    const doc = await testRef.get();
    
    res.json({
      success: true,
      message: "Conexão com Firebase funcionando!",
      environment: process.env.ENVIRONMENT || "test",
      data: doc.data()
    });
  } catch (error) {
    console.error("Erro no teste:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      environment: process.env.ENVIRONMENT || "test"
    });
  }
});

// Função para converter nome de arquivo em URL (Firebase Storage ou local)
async function getImageUrl(filename) {
  try {
    if (!filename) return null;
    
    // Se já é uma URL completa, retorna como está
    if (filename.startsWith('http')) {
      return filename;
    }
    
    // Usar Firebase Storage (agora que as fotos foram enviadas)
    try {
      const bucket = admin.storage().bucket(`${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`);
      const file = bucket.file(filename);
      
      const [exists] = await file.exists();
      if (exists) {
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
        });
        console.log(`🔥 Usando Firebase Storage: ${filename}`);
        return url;
      } else {
        console.log(`⚠️ Arquivo não encontrado no Firebase Storage: ${filename}`);
      }
    } catch (storageError) {
      console.log(`❌ Erro no Firebase Storage para ${filename}:`, storageError.message);
    }
    
    // Fallback: usar imagem padrão do Firebase Storage
    try {
      const bucket = admin.storage().bucket(`${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`);
      const defaultFile = bucket.file('avatar.jpg');
      const [exists] = await defaultFile.exists();
      if (exists) {
        const [url] = await defaultFile.getSignedUrl({
          action: 'read',
          expires: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
        });
        console.log(`🔄 Usando avatar padrão do Firebase Storage para: ${filename}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar avatar padrão:`, error.message);
    }
    
    // Último fallback: placeholder
    console.log(`⚠️ Usando placeholder para: ${filename}`);
    return 'https://via.placeholder.com/300x400/FFB6C1/FFFFFF?text=Sem+Imagem';
    
  } catch (error) {
    console.error(`❌ Erro ao gerar URL para ${filename}:`, error.message);
    return 'https://via.placeholder.com/300x400/FFB6C1/FFFFFF?text=Erro+Carregamento'; // Fallback
  }
}

// Rota para listar anúncios (OTIMIZADA)
app.get("/api/anuncios", async (req, res) => {
  try {
    const anunciosRef = db.collection('anuncios');
    const snapshot = await anunciosRef.get();
    
    const anuncios = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // OTIMIZAÇÃO: Converter apenas a imagem principal (foto_capa) para performance
      const anuncio = {
        id: doc.id,
        ...data,
        foto_capa: await getImageUrl(data.foto_capa), // Apenas a foto principal
        // Deixar as outras como nomes de arquivo para carregar sob demanda
        coverImage: data.coverImage,
        foto_stories: data.foto_stories,
        profileImage: data.profileImage,
        galeria_1: data.galeria_1,
        galeria_2: data.galeria_2,
        galeria_3: data.galeria_3,
        galeria_4: data.galeria_4,
        galeria_5: data.galeria_5,
        galeria_6: data.galeria_6,
        images: data.images || [] // Manter como array de nomes
      };
      
      anuncios.push(anuncio);
    }
    
    console.log(`✅ ${anuncios.length} anúncios encontrados (otimizado - apenas foto_capa)`);
    
    res.json(anuncios); // Retorna array direto para compatibilidade com frontend
  } catch (error) {
    console.error("Erro ao buscar anúncios:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      environment: process.env.ENVIRONMENT || "test"
    });
  }
});

// Rota para converter imagem específica (para carregamento sob demanda)
app.get("/api/image/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const url = await getImageUrl(filename);
    res.json({ url });
  } catch (error) {
    console.error(`Erro ao converter imagem ${req.params.filename}:`, error);
    res.status(500).json({ error: 'Erro ao processar imagem' });
  }
});

// Rota para criar anúncio
app.post("/api/anuncios", async (req, res) => {
  try {
    const anuncioData = {
      ...req.body,
      environment: process.env.ENVIRONMENT || "test",
      project: process.env.PROJECT_NAME || "copia-do-job",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('anuncios').add(anuncioData);
    
    res.status(201).json({
      success: true,
      message: "Anúncio criado com sucesso no Firebase",
      environment: process.env.ENVIRONMENT || "test",
      database: "Firebase Firestore",
      id: docRef.id,
      data: anuncioData
    });
  } catch (error) {
    console.error("Erro ao criar anúncio:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      environment: process.env.ENVIRONMENT || "test"
    });
  }
});

// Rota para limpar dados de teste
app.delete("/api/test", async (req, res) => {
  try {
    const testRef = db.collection('test');
    const snapshot = await testRef.get();
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    res.json({
      success: true,
      message: `Removidos ${snapshot.size} documentos de teste`,
      environment: process.env.ENVIRONMENT || "test"
    });
  } catch (error) {
    console.error("Erro ao limpar dados de teste:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      environment: process.env.ENVIRONMENT || "test"
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
    environment: process.env.ENVIRONMENT || "test"
  });
});

// Iniciar servidor
app.listen(process.env.PORT || 5001, () => {
  console.log(`🎯 Servidor Firebase SIMPLES rodando na porta ${process.env.PORT || 5001}`);
  console.log(`🔗 Acesse: http://localhost:${process.env.PORT || 5001}`);
  console.log(`📊 Ambiente: ${process.env.ENVIRONMENT || 'test'}`);
  console.log(`🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`🗄️  Banco: Firebase Firestore`);
  console.log("⚠️  ATENÇÃO: Este é um ambiente de TESTE isolado!");
  console.log("✅ SEM dependência do MongoDB - Apenas Firebase!");
  console.log("🧪 Modo SIMPLES para testes básicos");
});

