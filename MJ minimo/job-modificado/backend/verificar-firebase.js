// Script para verificar a configuração do Firebase
// Este script testa a conexão e configuração do Firebase

const admin = require("firebase-admin");
require('dotenv').config({ path: './config-firebase-only.env' });

console.log("🔍 Verificando configuração do Firebase...");
console.log(`📊 Projeto: ${process.env.FIREBASE_PROJECT_ID}`);
console.log("");

// Verificar se as variáveis de ambiente estão definidas
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID', 
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID'
];

console.log("📋 Verificando variáveis de ambiente:");
let allVarsPresent = true;

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Configurado`);
  } else {
    console.log(`❌ ${varName}: NÃO CONFIGURADO`);
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log("\n❌ ERRO: Nem todas as variáveis de ambiente estão configuradas!");
  console.log("📝 Verifique o arquivo backend/config-firebase-only.env");
  process.exit(1);
}

console.log("\n🔧 Tentando inicializar Firebase Admin SDK...");

try {
  // Configurar service account
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

  // Inicializar Firebase
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });

  console.log("✅ Firebase Admin SDK inicializado com sucesso!");

  // Testar conexão com Firestore
  console.log("\n🗄️  Testando conexão com Firestore...");
  const db = admin.firestore();

  // Tentar uma operação simples
  db.collection('test').doc('connection-test').get()
    .then(() => {
      console.log("✅ Conexão com Firestore funcionando!");
      console.log("🎉 Seu projeto Firebase está configurado corretamente!");
      
      // Testar criação de documento
      console.log("\n📝 Testando criação de documento...");
      return db.collection('test').doc('test-doc').set({
        message: 'Teste de conexão',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        environment: 'test'
      });
    })
    .then(() => {
      console.log("✅ Documento de teste criado com sucesso!");
      console.log("🔥 Firestore está funcionando perfeitamente!");
      
      // Limpar documento de teste
      return db.collection('test').doc('test-doc').delete();
    })
    .then(() => {
      console.log("🧹 Documento de teste removido");
      console.log("\n🎯 PRÓXIMOS PASSOS:");
      console.log("1. ✅ Firebase configurado");
      console.log("2. ✅ Firestore funcionando");
      console.log("3. 🚀 Pode iniciar o servidor: node backend/server-firebase-only.js");
      process.exit(0);
    })
    .catch((error) => {
      console.log("❌ ERRO ao testar Firestore:");
      console.log(`   Código: ${error.code}`);
      console.log(`   Mensagem: ${error.message}`);
      
      if (error.code === 16) {
        console.log("\n🔧 SOLUÇÃO:");
        console.log("1. Acesse: https://console.firebase.google.com/u/0/project/copia-do-job/overview");
        console.log("2. Vá em 'Firestore Database' no menu lateral");
        console.log("3. Clique em 'Criar banco de dados'");
        console.log("4. Escolha 'Modo de teste' (para desenvolvimento)");
        console.log("5. Selecione uma localização (ex: us-central1)");
        console.log("6. Execute este script novamente");
      } else if (error.code === 7) {
        console.log("\n🔧 SOLUÇÃO:");
        console.log("1. Verifique se o projeto 'copia-do-job' existe");
        console.log("2. Verifique se as credenciais estão corretas");
        console.log("3. Regenerar chave privada no Firebase Console");
      }
      
      process.exit(1);
    });

} catch (error) {
  console.log("❌ ERRO ao inicializar Firebase:");
  console.log(`   ${error.message}`);
  
  if (error.message.includes('private_key')) {
    console.log("\n🔧 SOLUÇÃO:");
    console.log("1. Verifique se a FIREBASE_PRIVATE_KEY está correta");
    console.log("2. Certifique-se de que as quebras de linha (\\n) estão preservadas");
    console.log("3. Regenerar chave privada no Firebase Console");
  }
  
  process.exit(1);
}
