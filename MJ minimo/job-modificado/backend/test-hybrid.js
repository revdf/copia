// Teste da configuração HÍBRIDA Firebase + MongoDB Atlas
import admin from "firebase-admin";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: './config-firebase-mongodb.env' });

console.log("🧪 Testando configuração HÍBRIDA Firebase + MongoDB Atlas...");
console.log(`📊 Projeto: ${process.env.PROJECT_NAME || 'copia-do-job'}`);
console.log(`🌍 Ambiente: ${process.env.ENVIRONMENT || 'development'}`);
console.log(`🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID}`);
console.log(`🗄️ MongoDB: ${process.env.MONGODB_URI ? 'Configurado' : 'Não configurado'}`);

async function testFirebase() {
  try {
    console.log("\n🔥 Testando Firebase...");
    
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

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    const db = admin.firestore();
    
    // Teste de escrita
    const testRef = db.collection('test').doc('hybrid-test');
    await testRef.set({
      message: 'Teste de conexão HÍBRIDO',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      environment: process.env.ENVIRONMENT || 'development'
    });
    
    // Teste de leitura
    const doc = await testRef.get();
    console.log("✅ Firebase: Conectado e funcionando");
    console.log(`📄 Dados salvos: ${doc.data().message}`);
    
    return true;
  } catch (error) {
    console.error("❌ Firebase: Erro na conexão");
    console.error(`   Erro: ${error.message}`);
    return false;
  }
}

async function testMongoDB() {
  try {
    console.log("\n🗄️ Testando MongoDB Atlas...");
    
    if (!process.env.MONGODB_URI) {
      console.log("⚠️ MongoDB: URI não configurado");
      return false;
    }

    const client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    const db = client.db('mansao_do_job');
    
    // Teste de escrita
    const testCollection = db.collection('test');
    await testCollection.insertOne({
      message: 'Teste de conexão HÍBRIDO MongoDB',
      timestamp: new Date(),
      environment: process.env.ENVIRONMENT || 'development'
    });
    
    // Teste de leitura
    const result = await testCollection.findOne({ message: 'Teste de conexão HÍBRIDO MongoDB' });
    console.log("✅ MongoDB: Conectado e funcionando");
    console.log(`📄 Dados salvos: ${result.message}`);
    
    await client.close();
    return true;
  } catch (error) {
    console.error("❌ MongoDB: Erro na conexão");
    console.error(`   Erro: ${error.message}`);
    return false;
  }
}

async function testHybrid() {
  console.log("\n🚀 Iniciando testes HÍBRIDOS...");
  
  const firebaseOk = await testFirebase();
  const mongodbOk = await testMongoDB();
  
  console.log("\n📊 RESULTADO DOS TESTES:");
  console.log(`🔥 Firebase: ${firebaseOk ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🗄️ MongoDB: ${mongodbOk ? '✅ OK' : '❌ FALHOU'}`);
  
  if (firebaseOk && mongodbOk) {
    console.log("\n🎉 CONFIGURAÇÃO HÍBRIDA FUNCIONANDO PERFEITAMENTE!");
    console.log("✅ Você pode guardar dados nos dois bancos!");
  } else if (firebaseOk) {
    console.log("\n⚠️ Firebase funcionando, MongoDB com problemas");
    console.log("✅ Você pode usar apenas Firebase por enquanto");
  } else {
    console.log("\n❌ Problemas na configuração");
    console.log("🔧 Verifique as credenciais nos arquivos de configuração");
  }
  
  process.exit(0);
}

testHybrid();
