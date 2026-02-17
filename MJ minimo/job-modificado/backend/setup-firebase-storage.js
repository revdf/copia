// Script para configurar e testar Firebase Storage
// Este script verifica se o Storage está funcionando e lista os arquivos

const admin = require("firebase-admin");
require('dotenv').config({ path: './config-firebase-only.env' });

console.log("🔧 Configurando Firebase Storage...");

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

// Função para listar arquivos no Storage
async function listStorageFiles() {
  try {
    console.log("\n🔍 Listando arquivos no Firebase Storage...");
    
    const bucket = admin.storage().bucket(`${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`);
    
    // Listar arquivos
    const [files] = await bucket.getFiles();
    
    console.log(`📁 Total de arquivos encontrados: ${files.length}`);
    
    if (files.length > 0) {
      console.log("\n📋 Primeiros 10 arquivos:");
      files.slice(0, 10).forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`);
      });
      
      if (files.length > 10) {
        console.log(`... e mais ${files.length - 10} arquivos`);
      }
    } else {
      console.log("⚠️ Nenhum arquivo encontrado no Storage");
      console.log("💡 Você precisa fazer upload das imagens primeiro");
    }
    
    return files;
  } catch (error) {
    console.error("❌ Erro ao listar arquivos:", error.message);
    return [];
  }
}

// Função para testar upload de um arquivo de teste
async function testUpload() {
  try {
    console.log("\n🧪 Testando upload de arquivo...");
    
    const bucket = admin.storage().bucket(`${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`);
    
    // Criar um arquivo de teste
    const testContent = "Este é um arquivo de teste para verificar o Firebase Storage";
    const fileName = `test-${Date.now()}.txt`;
    
    const file = bucket.file(fileName);
    await file.save(testContent);
    
    console.log(`✅ Arquivo de teste criado: ${fileName}`);
    
    // Gerar URL assinada
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
    });
    
    console.log(`🔗 URL assinada: ${url}`);
    
    // Deletar arquivo de teste
    await file.delete();
    console.log("🗑️ Arquivo de teste removido");
    
    return true;
  } catch (error) {
    console.error("❌ Erro no teste de upload:", error.message);
    return false;
  }
}

// Função para verificar se as imagens dos anúncios existem
async function checkAdvertisementImages() {
  try {
    console.log("\n🖼️ Verificando imagens dos anúncios...");
    
    const db = admin.firestore();
    const bucket = admin.storage().bucket(`${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`);
    
    // Buscar um anúncio
    const snapshot = await db.collection('anuncios').limit(1).get();
    
    if (snapshot.empty) {
      console.log("⚠️ Nenhum anúncio encontrado no Firestore");
      return;
    }
    
    const anuncio = snapshot.docs[0].data();
    console.log(`📄 Anúncio encontrado: ${anuncio.nome || 'Sem nome'}`);
    
    // Verificar imagens
    const imageFields = ['foto_capa', 'galeria_1', 'galeria_2', 'galeria_3'];
    let foundImages = 0;
    let missingImages = 0;
    
    for (const field of imageFields) {
      if (anuncio[field]) {
        const file = bucket.file(anuncio[field]);
        const [exists] = await file.exists();
        
        if (exists) {
          console.log(`✅ ${field}: ${anuncio[field]}`);
          foundImages++;
        } else {
          console.log(`❌ ${field}: ${anuncio[field]} (não encontrado)`);
          missingImages++;
        }
      }
    }
    
    console.log(`\n📊 Resumo: ${foundImages} imagens encontradas, ${missingImages} não encontradas`);
    
  } catch (error) {
    console.error("❌ Erro ao verificar imagens:", error.message);
  }
}

// Executar todas as verificações
async function main() {
  console.log("🚀 Iniciando configuração do Firebase Storage...\n");
  
  // 1. Listar arquivos existentes
  await listStorageFiles();
  
  // 2. Testar upload
  const uploadTest = await testUpload();
  
  // 3. Verificar imagens dos anúncios
  await checkAdvertisementImages();
  
  console.log("\n🎯 Configuração concluída!");
  
  if (uploadTest) {
    console.log("✅ Firebase Storage está funcionando corretamente");
  } else {
    console.log("❌ Firebase Storage precisa de configuração adicional");
  }
  
  process.exit(0);
}

main().catch(console.error);
