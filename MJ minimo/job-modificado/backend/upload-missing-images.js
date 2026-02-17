// Script para fazer upload das imagens faltantes para Firebase Storage
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config();

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
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
  });
  console.log("✅ Firebase Admin SDK inicializado com sucesso");
  console.log(`📦 Storage Bucket: ${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`);
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

const bucket = getStorage().bucket();
const imageDir = '/Users/troll/Desktop/copia do job/fotinha/fotos';

// Imagens específicas que precisamos fazer upload
const missingImages = [
  'foto (5).jpg',
  'foto (8).jpg', 
  'foto (13).jpg',
  'foto (22).jpg'
];

async function uploadMissingImages() {
  console.log("🚀 Iniciando upload das imagens faltantes para Firebase Storage...");
  
  try {
    for (const fileName of missingImages) {
      const filePath = join(imageDir, fileName);
      
      try {
        // Verificar se o arquivo existe
        const fileBuffer = readFileSync(filePath);
        console.log(`📁 Processando: ${fileName} (${fileBuffer.length} bytes)`);
        
        // Fazer upload para Firebase Storage
        const file = bucket.file(fileName);
        
        await file.save(fileBuffer, {
          metadata: {
            contentType: 'image/jpeg',
            cacheControl: 'public, max-age=31536000'
          }
        });
        
        console.log(`✅ Upload concluído: ${fileName}`);
        
        // Tornar o arquivo público
        await file.makePublic();
        console.log(`🌐 Arquivo público: ${fileName}`);
        
      } catch (fileError) {
        console.error(`❌ Erro ao processar ${fileName}:`, fileError.message);
      }
    }
    
    console.log("🎉 Upload de todas as imagens faltantes concluído!");
    
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  }
}

// Executar o upload
uploadMissingImages();

