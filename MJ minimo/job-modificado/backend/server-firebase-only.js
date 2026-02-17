// Servidor FIREBASE ONLY - Projeto copia-do-job
// Este servidor usa APENAS Firebase como banco de dados

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require('dotenv').config({ path: './config-firebase-only.env' });

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5001",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de inicialização
console.log("🚀 Iniciando servidor FIREBASE ONLY...");
console.log(`📊 Projeto: ${process.env.PROJECT_NAME}`);
console.log(`🌍 Ambiente: ${process.env.ENVIRONMENT}`);
console.log(`🔗 Porta: ${process.env.PORT}`);
console.log(`🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID}`);
console.log(`🗄️  Banco: Firebase Firestore (ÚNICO)`);

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
    projectId: process.env.FIREBASE_PROJECT_ID
  });
  
  console.log("✅ Firebase Admin SDK inicializado com sucesso");
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

// Obter referência do Firestore
const db = admin.firestore();

// Rotas principais
app.get("/", (req, res) => {
  res.json({
    message: "Servidor FIREBASE ONLY - copia-do-job",
    environment: process.env.ENVIRONMENT,
    project: process.env.PROJECT_NAME,
    port: process.env.PORT,
    database: "Firebase Firestore",
    firebase: process.env.FIREBASE_PROJECT_ID,
    timestamp: new Date().toISOString()
  });
});

// Rota para listar anúncios do Firebase
app.get("/api/anuncios", async (req, res) => {
  try {
    const anunciosRef = db.collection('anuncios');
    const snapshot = await anunciosRef.where('environment', '==', process.env.ENVIRONMENT).get();
    
    const anuncios = [];
    snapshot.forEach(doc => {
      anuncios.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: anuncios.length,
      environment: process.env.ENVIRONMENT,
      database: "Firebase Firestore",
      data: anuncios
    });
  } catch (error) {
    console.error("Erro ao buscar anúncios:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT
    });
  }
});

// Rota para criar anúncio no Firebase
app.post("/api/anuncios", async (req, res) => {
  try {
    const anuncioData = {
      ...req.body,
      environment: process.env.ENVIRONMENT,
      project: process.env.PROJECT_NAME,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('anuncios').add(anuncioData);
    
    res.status(201).json({
      success: true,
      message: "Anúncio criado com sucesso no Firebase",
      environment: process.env.ENVIRONMENT,
      database: "Firebase Firestore",
      id: docRef.id,
      data: anuncioData
    });
  } catch (error) {
    console.error("Erro ao criar anúncio:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT
    });
  }
});

// Rota para buscar anúncio específico
app.get("/api/anuncios/:id", async (req, res) => {
  try {
    const doc = await db.collection('anuncios').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Anúncio não encontrado",
        environment: process.env.ENVIRONMENT
      });
    }
    
    res.json({
      success: true,
      environment: process.env.ENVIRONMENT,
      database: "Firebase Firestore",
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error("Erro ao buscar anúncio:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT
    });
  }
});

// Rota para atualizar anúncio
app.put("/api/anuncios/:id", async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('anuncios').doc(req.params.id).update(updateData);
    
    res.json({
      success: true,
      message: "Anúncio atualizado com sucesso",
      environment: process.env.ENVIRONMENT,
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("Erro ao atualizar anúncio:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT
    });
  }
});

// Rota para deletar anúncio
app.delete("/api/anuncios/:id", async (req, res) => {
  try {
    await db.collection('anuncios').doc(req.params.id).delete();
    
    res.json({
      success: true,
      message: "Anúncio deletado com sucesso",
      environment: process.env.ENVIRONMENT,
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("Erro ao deletar anúncio:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT
    });
  }
});

// Rota para limpar dados de teste
app.delete("/api/anuncios/teste", async (req, res) => {
  try {
    const anunciosRef = db.collection('anuncios');
    const snapshot = await anunciosRef.where('environment', '==', process.env.ENVIRONMENT).get();
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    res.json({
      success: true,
      message: `Removidos ${snapshot.size} anúncios de teste`,
      environment: process.env.ENVIRONMENT,
      database: "Firebase Firestore"
    });
  } catch (error) {
    console.error("Erro ao limpar dados de teste:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT
    });
  }
});

// Rota para estatísticas do Firebase
app.get("/api/stats", async (req, res) => {
  try {
    const anunciosRef = db.collection('anuncios');
    const snapshot = await anunciosRef.where('environment', '==', process.env.ENVIRONMENT).get();
    
    res.json({
      success: true,
      environment: process.env.ENVIRONMENT,
      database: "Firebase Firestore",
      stats: {
        totalAnuncios: snapshot.size,
        project: process.env.PROJECT_NAME,
        firebase: process.env.FIREBASE_PROJECT_ID
      }
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT
    });
  }
});

// Middleware de erro
app.use((error, req, res, next) => {
  console.error("❌ Erro no servidor Firebase:", error);
  res.status(500).json({
    success: false,
    error: error.message,
    environment: process.env.ENVIRONMENT,
    database: "Firebase Firestore"
  });
});

// Iniciar servidor
app.listen(process.env.PORT || 5001, () => {
  console.log(`🎯 Servidor FIREBASE ONLY rodando na porta ${process.env.PORT || 5001}`);
  console.log(`🔗 Acesse: http://localhost:${process.env.PORT || 5001}`);
  console.log(`📊 Ambiente: ${process.env.ENVIRONMENT}`);
  console.log(`🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`🗄️  Banco: Firebase Firestore (ÚNICO)`);
  console.log("⚠️  ATENÇÃO: Este é um ambiente de TESTE isolado!");
  console.log("✅ SEM dependência do MongoDB - Apenas Firebase!");
});