// Servidor HÍBRIDO - Firebase + MongoDB Atlas
// Projeto: copia-do-job
// Arquitetura: Firebase (dados sensíveis) + MongoDB Atlas (dados públicos)

import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config({ path: './config-firebase-mongodb.env' });

const app = express();

// Middleware CORS
app.use(cors({
  origin: [
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
console.log("🚀 Iniciando servidor HÍBRIDO Firebase + MongoDB Atlas...");
console.log(`📊 Projeto: ${process.env.PROJECT_NAME || 'copia-do-job'}`);
console.log(`🌍 Ambiente: ${process.env.ENVIRONMENT || 'development'}`);
console.log(`🔗 Porta: ${process.env.PORT || 5001}`);
console.log(`🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID}`);
console.log(`🗄️ MongoDB: ${process.env.MONGODB_URI ? 'Configurado' : 'Não configurado'}`);

// ===== INICIALIZAR FIREBASE ADMIN SDK =====
const firebaseServiceAccount = {
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
    credential: admin.credential.cert(firebaseServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
  });
  
  console.log("✅ Firebase Admin SDK inicializado com sucesso");
  console.log(`📦 Storage Bucket: ${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`);
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

// ===== INICIALIZAR MONGODB ATLAS =====
let mongoClient;
let mongoDb;

async function connectToMongoDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("⚠️ MongoDB URI não configurado - usando apenas Firebase");
      return;
    }

    mongoClient = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await mongoClient.connect();
    mongoDb = mongoClient.db('mansao_do_job');
    
    console.log("✅ MongoDB Atlas conectado com sucesso");
    console.log(`🗄️ Database: mansao_do_job`);
  } catch (error) {
    console.error("❌ Erro ao conectar MongoDB Atlas:", error.message);
    console.log("⚠️ Continuando apenas com Firebase...");
  }
}

// Conectar ao MongoDB
connectToMongoDB();

// ===== REFERÊNCIAS DOS BANCOS =====
const firebaseDb = admin.firestore();
const firebaseBucket = admin.storage().bucket();

// ===== FUNÇÕES AUXILIARES =====

// Função para converter nome de arquivo em URL (Firebase Storage)
async function getImageUrl(filename) {
  try {
    if (!filename) return null;
    
    if (filename.startsWith('http')) {
      return filename;
    }
    
    try {
      const file = firebaseBucket.file(filename);
      const [exists] = await file.exists();
      if (exists) {
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
        });
        return url;
      }
    } catch (storageError) {
      console.log(`❌ Erro no Firebase Storage para ${filename}:`, storageError.message);
    }
    
    // Fallback: placeholder
    return 'https://via.placeholder.com/300x400/FFB6C1/FFFFFF?text=Sem+Imagem';
    
  } catch (error) {
    console.error(`❌ Erro ao gerar URL para ${filename}:`, error.message);
    return 'https://via.placeholder.com/300x400/FFB6C1/FFFFFF?text=Erro+Carregamento';
  }
}

// Função para sincronizar dados Firebase → MongoDB
async function syncFirebaseToMongoDB(advertisementData) {
  try {
    if (!mongoDb) {
      console.log("⚠️ MongoDB não disponível - pulando sincronização");
      return;
    }

    const publicData = {
      firebaseId: advertisementData.id,
      publicInfo: {
        nome: advertisementData.nome,
        categoria: advertisementData.categoria,
        cidade: advertisementData.cidade,
        estado: advertisementData.estado,
        preco: advertisementData.preco,
        descricao: advertisementData.descricao,
        idade: advertisementData.idade
      },
      media: {
        foto_capa: await getImageUrl(advertisementData.foto_capa),
        galeria: [
          await getImageUrl(advertisementData.galeria_1),
          await getImageUrl(advertisementData.galeria_2),
          await getImageUrl(advertisementData.galeria_3)
        ].filter(url => url)
      },
      // Campos de nível e plano
      nivel: advertisementData.nivel || null,
      plano: advertisementData.plano || null,
      premium: advertisementData.premium || false,
      destaque: advertisementData.destaque || false,
      visibilidade: advertisementData.visibilidade || null,
      preco_plano: advertisementData.preco_plano || 0,
      descricao_plano: advertisementData.descricao_plano || null,
      status: advertisementData.status || 'active',
      autorizado: advertisementData.autorizado || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await mongoDb.collection('advertisements').replaceOne(
      { firebaseId: advertisementData.id },
      publicData,
      { upsert: true }
    );

    console.log(`✅ Dados sincronizados para MongoDB: ${advertisementData.id}`);
  } catch (error) {
    console.error("❌ Erro na sincronização Firebase → MongoDB:", error.message);
  }
}

// ===== ROTAS PRINCIPAIS =====

// Rota principal
app.get("/", (req, res) => {
  res.json({
    message: "Servidor HÍBRIDO - Firebase + MongoDB Atlas",
    environment: process.env.ENVIRONMENT || "development",
    project: process.env.PROJECT_NAME || "copia-do-job",
    port: process.env.PORT || 5001,
    databases: {
      firebase: {
        status: "Conectado",
        project: process.env.FIREBASE_PROJECT_ID,
        collections: ["anuncios", "users", "payments"]
      },
      mongodb: {
        status: mongoDb ? "Conectado" : "Não configurado",
        database: "mansao_do_job",
        collections: ["advertisements", "users", "analytics"]
      }
    },
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /api/anuncios - Listar anúncios (Firebase + MongoDB)",
      "GET /api/anuncios/:id - Buscar anúncio específico",
      "POST /api/anuncios - Criar anúncio (Firebase + sync MongoDB)",
      "PUT /api/anuncios/:id - Atualizar anúncio",
      "DELETE /api/anuncios/:id - Deletar anúncio",
      "GET /api/sync/status - Status da sincronização",
      "POST /api/sync/firebase-to-mongodb - Sincronizar manualmente"
    ]
  });
});

// Rota para testar conexões
app.get("/api/test", async (req, res) => {
  try {
    const results = {
      firebase: { status: "OK", message: "Firebase conectado" },
      mongodb: { status: "N/A", message: "MongoDB não configurado" }
    };

    // Teste Firebase
    try {
      const testRef = firebaseDb.collection('test').doc('connection');
      await testRef.set({
        message: 'Teste de conexão HÍBRIDO',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        environment: process.env.ENVIRONMENT || 'development'
      });
      results.firebase = { status: "OK", message: "Firebase funcionando" };
    } catch (error) {
      results.firebase = { status: "ERROR", message: error.message };
    }

    // Teste MongoDB
    if (mongoDb) {
      try {
        await mongoDb.collection('test').insertOne({
          message: 'Teste de conexão MongoDB',
          timestamp: new Date(),
          environment: process.env.ENVIRONMENT || 'development'
        });
        results.mongodb = { status: "OK", message: "MongoDB funcionando" };
      } catch (error) {
        results.mongodb = { status: "ERROR", message: error.message };
      }
    }

    res.json({
      success: true,
      message: "Teste de conexões HÍBRIDO",
      environment: process.env.ENVIRONMENT || "development",
      databases: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Erro no teste:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT || "development"
    });
  }
});

// Rota para listar anúncios (Firebase + MongoDB)
app.get("/api/anuncios", async (req, res) => {
  try {
    const { categoria, status, limit } = req.query;
    let anuncios = [];

    // TEMPORÁRIO: Sempre usar Firebase para garantir campos de nível
    console.log("🔄 Usando Firebase para garantir campos de nível");

    // Sempre usar Firebase
    {
      let query = firebaseDb.collection('advertisements');
      
      if (categoria) {
        query = query.where('categoria', '==', categoria);
      }
      
      if (status) {
        query = query.where('status', '==', status);
      }
      
      if (limit) {
        query = query.limit(parseInt(limit));
      }
      
      const snapshot = await query.get();
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const anuncio = {
          id: doc.id,
          ...data,
          foto_capa: data.foto_capa || null, // Temporário: sem getImageUrl
          source: 'firebase'
        };
        anuncios.push(anuncio);
      }

      console.log(`✅ ${anuncios.length} anúncios carregados do Firebase`);
    }

    res.json(anuncios);
  } catch (error) {
    console.error("❌ Erro ao buscar anúncios:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT || "development"
    });
  }
});

// Rota para buscar anúncio específico
app.get("/api/anuncios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar no Firebase (dados completos)
    const doc = await firebaseDb.collection('advertisements').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        error: "Anúncio não encontrado" 
      });
    }
    
    const data = doc.data();
    
    // Converter todas as imagens para URLs
    const anuncio = {
      id: doc.id,
      ...data,
      foto_capa: await getImageUrl(data.foto_capa),
      coverImage: await getImageUrl(data.coverImage),
      foto_stories: await getImageUrl(data.foto_stories),
      profileImage: await getImageUrl(data.profileImage),
      galeria_1: await getImageUrl(data.galeria_1),
      galeria_2: await getImageUrl(data.galeria_2),
      galeria_3: await getImageUrl(data.galeria_3),
      galeria_4: await getImageUrl(data.galeria_4),
      galeria_5: await getImageUrl(data.galeria_5),
      galeria_6: await getImageUrl(data.galeria_6),
      images: data.images || [],
      source: 'firebase'
    };
    
    res.json({
      success: true,
      data: anuncio,
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

// Rota para criar anúncio (Firebase + sync MongoDB)
app.post("/api/anuncios", async (req, res) => {
  try {
    // Processar dados do formulário (multipart/form-data)
    let anuncioData = { ...req.body };
    
    // Aplicar lógica de níveis automaticamente
    const nivel = anuncioData.nivel || anuncioData.plano;
    console.log("🔍 Debug - Nível recebido:", nivel);
    console.log("🔍 Debug - Dados recebidos:", anuncioData);
    
    if (nivel) {
      anuncioData.nivel = nivel;
      
      // Definir características baseadas no nível
      if (nivel.includes('N1')) {
        anuncioData.premium = true;
        anuncioData.destaque = true;
        anuncioData.visibilidade = 'pagina_premium';
        anuncioData.preco_plano = 0;
        anuncioData.descricao_plano = 'VIP - Aparece na página premium';
      } else if (nivel.includes('N3')) {
        anuncioData.premium = true;
        anuncioData.destaque = true;
        anuncioData.visibilidade = 'pagina_premium';
        anuncioData.preco_plano = 0;
        anuncioData.descricao_plano = 'Destaque - Aparece na página premium';
      } else if (nivel.includes('N7')) {
        anuncioData.premium = false;
        anuncioData.destaque = false;
        anuncioData.visibilidade = 'pagina_basica';
        anuncioData.preco_plano = 0;
        anuncioData.descricao_plano = 'Padrão - Aparece na página básica';
      } else {
        // Manter o nível original se não for reconhecido
        console.log(`⚠️ Nível não reconhecido: ${anuncioData.nivel}, mantendo original`);
      }
    } else {
      // Se não especificado, manter o nível original
      console.log(`⚠️ Nível não especificado, mantendo original: ${anuncioData.nivel}`);
    }
    
    console.log("🔍 Debug - Dados após processamento:", anuncioData);
    
    // Adicionar metadados
    anuncioData = {
      ...anuncioData,
      environment: process.env.ENVIRONMENT || "development",
      project: process.env.PROJECT_NAME || "mansao-do-job",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'ativo', // Ativo por padrão
      autorizado: true // Autorizado por padrão para teste
    };
    
    // Salvar no Firebase
    const docRef = await firebaseDb.collection('advertisements').add(anuncioData);
    
    // Sincronizar com MongoDB
    await syncFirebaseToMongoDB({
      id: docRef.id,
      ...anuncioData
    });
    
    res.status(201).json({
      success: true,
      message: `Anúncio criado com sucesso no Firebase e sincronizado com MongoDB - Plano: ${anuncioData.nivel}`,
      environment: process.env.ENVIRONMENT || "development",
      database: "Firebase Firestore + MongoDB Atlas",
      id: docRef.id,
      nivel: anuncioData.nivel,
      premium: anuncioData.premium,
      destaque: anuncioData.destaque,
      visibilidade: anuncioData.visibilidade,
      preco_plano: anuncioData.preco_plano,
      descricao_plano: anuncioData.descricao_plano,
      data: anuncioData
    });
  } catch (error) {
    console.error("❌ Erro ao criar anúncio:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT || "development"
    });
  }
});

// Rota para atualizar anúncio
app.put("/api/anuncios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Atualizar no Firebase
    await firebaseDb.collection('advertisements').doc(id).update(updateData);
    
    // Sincronizar com MongoDB
    const updatedDoc = await firebaseDb.collection('advertisements').doc(id).get();
    if (updatedDoc.exists) {
      await syncFirebaseToMongoDB({
        id: updatedDoc.id,
        ...updatedDoc.data()
      });
    }
    
    console.log("✅ Anúncio atualizado:", id);
    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      },
      database: "Firebase Firestore + MongoDB Atlas"
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

// Rota para deletar anúncio
app.delete("/api/anuncios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deletar do Firebase
    await firebaseDb.collection('advertisements').doc(id).delete();
    
    // Deletar do MongoDB
    if (mongoDb) {
      await mongoDb.collection('advertisements').deleteOne({ firebaseId: id });
    }
    
    console.log("✅ Anúncio deletado:", id);
    res.json({ 
      success: true,
      message: "Anúncio deletado com sucesso",
      database: "Firebase Firestore + MongoDB Atlas"
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

// Rota para status da sincronização
app.get("/api/sync/status", async (req, res) => {
  try {
    const status = {
      firebase: { status: "OK", collections: [] },
      mongodb: { status: "N/A", collections: [] }
    };

    // Status Firebase
    try {
      const firebaseCollections = await firebaseDb.listCollections();
      status.firebase.collections = firebaseCollections.map(col => col.id);
    } catch (error) {
      status.firebase = { status: "ERROR", message: error.message };
    }

    // Status MongoDB
    if (mongoDb) {
      try {
        const mongoCollections = await mongoDb.listCollections().toArray();
        status.mongodb = {
          status: "OK",
          collections: mongoCollections.map(col => col.name)
        };
      } catch (error) {
        status.mongodb = { status: "ERROR", message: error.message };
      }
    }

    res.json({
      success: true,
      message: "Status da sincronização HÍBRIDO",
      environment: process.env.ENVIRONMENT || "development",
      databases: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Erro ao verificar status:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para sincronização manual
app.post("/api/sync/firebase-to-mongodb", async (req, res) => {
  try {
    if (!mongoDb) {
      return res.status(400).json({
        success: false,
        error: "MongoDB não configurado"
      });
    }

    console.log("🔄 Iniciando sincronização manual Firebase → MongoDB...");
    
    const snapshot = await firebaseDb.collection('advertisements').get();
    let synced = 0;
    
    for (const doc of snapshot.docs) {
      await syncFirebaseToMongoDB({
        id: doc.id,
        ...doc.data()
      });
      synced++;
    }
    
    res.json({
      success: true,
      message: `Sincronização manual concluída`,
      synced: synced,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Erro na sincronização manual:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Middleware de erro
app.use((error, req, res, next) => {
  console.error("❌ Erro no servidor HÍBRIDO:", error);
  res.status(500).json({
    success: false,
    error: error.message,
    code: error.code,
    environment: process.env.ENVIRONMENT || "development"
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🎯 Servidor HÍBRIDO rodando na porta ${PORT}`);
  console.log(`🔗 Acesse: http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.ENVIRONMENT || 'development'}`);
  console.log(`🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`🗄️ MongoDB: ${mongoDb ? 'Conectado' : 'Não configurado'}`);
  console.log(`🔗 Endpoints disponíveis:`);
  console.log(`   GET /api/anuncios - Listar anúncios (Firebase + MongoDB)`);
  console.log(`   GET /api/anuncios/:id - Buscar anúncio específico`);
  console.log(`   POST /api/anuncios - Criar anúncio (Firebase + sync MongoDB)`);
  console.log(`   PUT /api/anuncios/:id - Atualizar anúncio`);
  console.log(`   DELETE /api/anuncios/:id - Deletar anúncio`);
  console.log(`   GET /api/sync/status - Status da sincronização`);
  console.log(`   POST /api/sync/firebase-to-mongodb - Sincronizar manualmente`);
  console.log(`✅ Arquitetura HÍBRIDA: Firebase + MongoDB Atlas!`);
  console.log(`🚀 Servidor HÍBRIDO pronto para uso!`);
});

export default app;
