// Script para verificar se estamos usando o projeto Firebase correto
// Este script testa a conexão e mostra informações do projeto

const admin = require("firebase-admin");
require('dotenv').config({ path: './config-firebase-only.env' });

console.log("🔍 Verificando projeto Firebase...");
console.log(`📊 Projeto configurado: ${process.env.FIREBASE_PROJECT_ID}`);
console.log(`📧 Email configurado: ${process.env.FIREBASE_CLIENT_EMAIL}`);
console.log("");

// Verificar se o email corresponde ao projeto correto
const expectedEmail = `firebase-adminsdk-fbsvc@${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`;
const actualEmail = process.env.FIREBASE_CLIENT_EMAIL;

console.log("📋 Verificação de correspondência:");
console.log(`✅ Email esperado: ${expectedEmail}`);
console.log(`📧 Email atual: ${actualEmail}`);

if (actualEmail === expectedEmail) {
  console.log("✅ Email corresponde ao projeto!");
} else {
  console.log("❌ Email NÃO corresponde ao projeto!");
  console.log("\n🔧 SOLUÇÃO:");
  console.log("1. Acesse: https://console.firebase.google.com/u/0/project/copia-do-job/overview");
  console.log("2. Vá em 'Configurações do projeto' (ícone de engrenagem)");
  console.log("3. Na aba 'Contas de serviço'");
  console.log("4. Clique em 'Gerar nova chave privada'");
  console.log("5. Baixe o arquivo JSON");
  console.log("6. Atualize o arquivo config-firebase-only.env com as novas credenciais");
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
        environment: 'test',
        location: 'southamerica-east1'
      });
    })
    .then(() => {
      console.log("✅ Documento de teste criado com sucesso!");
      console.log("🔥 Firestore está funcionando perfeitamente!");
      console.log("📍 Localização: southamerica-east1 (São Paulo)");
      
      // Limpar documento de teste
      return db.collection('test').doc('test-doc').delete();
    })
    .then(() => {
      console.log("🧹 Documento de teste removido");
      console.log("\n🎯 PRÓXIMOS PASSOS:");
      console.log("1. ✅ Firebase configurado");
      console.log("2. ✅ Firestore funcionando");
      console.log("3. 🚀 Pode iniciar o servidor: node server-firebase-only.js");
      process.exit(0);
    })
    .catch((error) => {
      console.log("❌ ERRO ao testar Firestore:");
      console.log(`   Código: ${error.code}`);
      console.log(`   Mensagem: ${error.message}`);
      
      if (error.code === 16) {
        console.log("\n🔧 SOLUÇÃO:");
        console.log("1. Verifique se o Firestore está habilitado no projeto 'copia-do-job'");
        console.log("2. Acesse: https://console.firebase.google.com/u/0/project/copia-do-job/overview");
        console.log("3. Vá em 'Firestore Database' e confirme que está ativo");
        console.log("4. Se necessário, gere novas credenciais para o projeto 'copia-do-job'");
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
















