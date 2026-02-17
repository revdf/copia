// Script para fazer upload de todas as fotos para Firebase Storage
// Este script vai transferir as fotos da pasta local para o Firebase Storage

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
require('dotenv').config({ path: './config-firebase-only.env' });

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

const bucket = admin.storage().bucket();
const imageDir = '/Users/troll/Desktop/copia do job/fotinha/fotos';

async function uploadAllPhotos() {
  console.log("🚀 Iniciando upload de todas as fotos para Firebase Storage...");
  
  try {
    // Listar todos os arquivos de imagem
    const files = fs.readdirSync(imageDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });
    
    console.log(`📁 Encontrados ${files.length} arquivos de imagem`);
    
    let uploadedCount = 0;
    let errorCount = 0;
    
    for (const filename of files) {
      try {
        const filePath = path.join(imageDir, filename);
        const file = bucket.file(filename);
        
        // Verificar se o arquivo já existe no Storage
        const [exists] = await file.exists();
        if (exists) {
          console.log(`⏭️  ${filename} - já existe, pulando`);
          continue;
        }
        
        // Fazer upload do arquivo
        await bucket.upload(filePath, {
          destination: filename,
          metadata: {
            contentType: getContentType(filename),
            cacheControl: 'public, max-age=31536000', // Cache por 1 ano
          },
        });
        
        console.log(`✅ ${filename} - upload concluído`);
        uploadedCount++;
        
        // Pequena pausa para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ ${filename} - erro:`, error.message);
        errorCount++;
      }
    }
    
    console.log("\n🎉 Upload concluído!");
    console.log(`✅ Arquivos enviados: ${uploadedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total processado: ${files.length}`);
    
    // Verificar arquivos no Storage
    console.log("\n🔍 Verificando arquivos no Firebase Storage...");
    const [filesInStorage] = await bucket.getFiles();
    console.log(`📦 Total de arquivos no Storage: ${filesInStorage.length}`);
    
    // Testar uma URL assinada
    if (filesInStorage.length > 0) {
      const testFile = filesInStorage[0];
      const [url] = await testFile.getSignedUrl({
        action: 'read',
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
      });
      console.log(`🔗 Exemplo de URL assinada: ${url}`);
    }
    
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  }
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return types[ext] || 'image/jpeg';
}

// Executar upload
uploadAllPhotos();
