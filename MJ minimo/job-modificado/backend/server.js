// Servidor UNIFICADO - Projeto Mansão do Job
// Combina funcionalidades do server-firebase-simples.js e api-firebase-completo.js
// Porta: 5001 | Endpoints: /api/anuncios | Coleção: anuncios

import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import locationRoutes from './routes/location.js';
import imagesRoutes from './routes/images.js';

dotenv.config({ path: './config-firebase-only.env' });

const app = express();

// Middleware CORS UNIFICADO
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/images', imagesRoutes);

// Log de inicialização
console.log("🚀 Iniciando servidor UNIFICADO...");
console.log(`📊 Projeto: ${process.env.PROJECT_NAME || 'mansao-do-job'}`);
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

// Obter referências do Firebase
const db = admin.firestore();
const bucket = admin.storage().bucket();

// Função para converter nome de arquivo em URL (Firebase Storage)
async function getImageUrl(filename) {
  try {
    if (!filename) return null;
    
    // Se já é uma URL completa, retorna como está
    if (filename.startsWith('http')) {
      return filename;
    }
    
    // Usar Firebase Storage
    try {
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
    return 'https://via.placeholder.com/300x400/FFB6C1/FFFFFF?text=Erro+Carregamento';
  }
}

// Rota principal
app.get("/", (req, res) => {
  res.json({
    message: "Servidor UNIFICADO - Mansão do Job",
      environment: process.env.ENVIRONMENT || "test",
      project: process.env.PROJECT_NAME || "mansao-do-job",
      port: process.env.PORT || 5001,
    database: "Firebase Firestore",
    firebase: process.env.FIREBASE_PROJECT_ID,
    timestamp: new Date().toISOString(),
    status: "Funcionando",
    endpoints: [
      "POST /api/auth/login - Login (retorna JSON)",
      "POST /api/auth/register - Registro (retorna JSON)",
      "GET /api/users/me - Dados do usuário autenticado (protegido)",
      "GET /api/anuncios - Listar anúncios",
      "GET /api/anuncios/:id - Buscar anúncio específico",
      "POST /api/anuncios - Criar anúncio",
      "PUT /api/anuncios/:id - Atualizar anúncio",
      "DELETE /api/anuncios/:id - Deletar anúncio",
      "GET /api/image/:filename - Converter imagem para URL",
      "GET /api/test - Testar API"
    ]
  });
});

// Rota para testar conexão
app.get("/api/test", async (req, res) => {
  try {
    const testRef = db.collection('test').doc('connection');
    await testRef.set({
      message: 'Teste de conexão UNIFICADO',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      environment: process.env.ENVIRONMENT || 'test'
    });
    
    const doc = await testRef.get();
    
    res.json({
      success: true,
      message: "API UNIFICADA funcionando!",
      environment: process.env.ENVIRONMENT || "test",
      data: doc.data(),
      timestamp: new Date().toISOString()
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

// Rota para listar anúncios (OTIMIZADA com filtros de localização)
app.get("/api/anuncios", async (req, res) => {
    try {
        const { categoria, status, limit, estado, cidade } = req.query;
        let query = db.collection('anuncios');
        
        // Aplicar filtros se fornecidos
        if (categoria) {
            query = query.where('categoria', '==', categoria);
        }
        
        if (status) {
            query = query.where('status', '==', status);
        }
        
        // REGRA ESPECIAL: Se estado for DF, ignorar cidade e filtrar apenas por estado
        if (estado) {
            if (estado.toUpperCase() === 'DF') {
                // Para DF, filtrar apenas por estado (ignorar cidade)
                query = query.where('estado', '==', 'DF');
                console.log('📍 Aplicando regra especial DF: filtrando todos os anúncios do Distrito Federal');
            } else {
                // Para outros estados, filtrar por estado
                query = query.where('estado', '==', estado.toUpperCase());
                
                // Se tiver cidade, filtrar também por cidade
                if (cidade) {
                    query = query.where('cidade', '==', cidade);
                    console.log(`📍 Filtrando por estado: ${estado}, cidade: ${cidade}`);
                } else {
                    console.log(`📍 Filtrando por estado: ${estado}`);
                }
            }
        } else if (cidade) {
            // Se só tiver cidade (sem estado), filtrar por cidade
            query = query.where('cidade', '==', cidade);
            console.log(`📍 Filtrando por cidade: ${cidade}`);
        }
        
        if (limit) {
            query = query.limit(parseInt(limit));
        }
        
        const snapshot = await query.get();
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
                images: data.images || []
            };
            
            anuncios.push(anuncio);
        }
        
        console.log(`✅ ${anuncios.length} anúncios encontrados (filtros: estado=${estado || 'nenhum'}, cidade=${cidade || 'nenhuma'})`);
        
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

// Rota para buscar anúncio específico
app.get("/api/anuncios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('anuncios').doc(id).get();
    
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
      images: data.images || []
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
      project: process.env.PROJECT_NAME || "mansao-do-job",
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

// Rota para atualizar anúncio
app.put("/api/anuncios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('anuncios').doc(id).update(updateData);
    
    const updatedDoc = await db.collection('anuncios').doc(id).get();
    
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

// Rota para deletar anúncio
app.delete("/api/anuncios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('anuncios').doc(id).delete();
    
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
    
    // Gerar URL assinada (mais seguro que makePublic)
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
    });
    
    console.log(`✅ Imagem enviada: ${fileName}`);
    
    res.json({
      success: true,
      message: "Imagem enviada com sucesso",
      fileName: fileName,
      url: url,
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

// Middleware de erro
app.use((error, req, res, next) => {
  console.error("❌ Erro no servidor UNIFICADO:", error);
  res.status(500).json({
    success: false,
    error: error.message,
    code: error.code,
    environment: process.env.ENVIRONMENT || "test"
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🎯 Servidor UNIFICADO rodando na porta ${PORT}`);
  console.log(`🔗 Acesse: http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.ENVIRONMENT || 'test'}`);
  console.log(`🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`🗄️  Banco: Firebase Firestore`);
  console.log(`📦 Storage: ${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`);
  console.log(`🔗 Endpoints disponíveis:`);
  console.log(`   GET /api/anuncios - Listar anúncios`);
  console.log(`   GET /api/anuncios/:id - Buscar anúncio específico`);
  console.log(`   POST /api/anuncios - Criar anúncio`);
  console.log(`   PUT /api/anuncios/:id - Atualizar anúncio`);
  console.log(`   DELETE /api/anuncios/:id - Deletar anúncio`);
  console.log(`   GET /api/image/:filename - Converter imagem para URL`);
  console.log(`   GET /api/test - Testar API`);
  console.log(`✅ 100% Firebase - SEM MongoDB!`);
  console.log(`🚀 Servidor UNIFICADO pronto para uso!`);
});

export default app;

