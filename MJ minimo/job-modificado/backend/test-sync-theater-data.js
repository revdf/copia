#!/usr/bin/env node

import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { MongoClient } from 'mongodb';

dotenv.config({ path: './config-firebase-mongodb.env' });

console.log("🔄 TESTANDO SINCRONIZAÇÃO FIREBASE ↔ MONGODB");
console.log("=============================================");

// Configurar Firebase Admin SDK
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
    projectId: process.env.FIREBASE_PROJECT_ID
  });
  console.log("✅ Firebase Admin SDK inicializado");
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

const firebaseDb = admin.firestore();

async function testSyncTheaterData() {
  let mongoClient;
  
  try {
    // Conectar ao MongoDB
    console.log("\n🔗 Conectando ao MongoDB Atlas...");
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    const mongoDb = mongoClient.db('mansao_do_job');
    console.log("✅ MongoDB Atlas conectado");
    
    console.log("\n🔍 VERIFICANDO DADOS COM THEATERID NO MONGODB:");
    console.log("==============================================");
    
    // Buscar documentos com theaterId no MongoDB
    const mongoCollection = mongoDb.collection('advertisementnews');
    const mongoDocs = await mongoCollection.find({ 
      theaterId: { $exists: true } 
    }).limit(5).toArray();
    
    console.log(`📊 Documentos com theaterId no MongoDB: ${mongoDocs.length}`);
    
    if (mongoDocs.length > 0) {
      console.log("\n📄 Exemplos de documentos com theaterId no MongoDB:");
      
      mongoDocs.forEach((doc, index) => {
        console.log(`\n  📝 Documento ${index + 1}:`);
        console.log(`     _id: ${doc._id}`);
        console.log(`     theaterId: ${doc.theaterId}`);
        
        if (doc.location) {
          console.log(`     location: ${JSON.stringify(doc.location, null, 6)}`);
        }
        
        if (doc.title) console.log(`     title: ${doc.title}`);
        if (doc.category) console.log(`     category: ${doc.category}`);
        if (doc.status) console.log(`     status: ${doc.status}`);
      });
    }
    
    console.log("\n🔍 VERIFICANDO DADOS NO FIREBASE:");
    console.log("==================================");
    
    // Verificar se há dados similares no Firebase
    const firebaseSnapshot = await firebaseDb.collection('anuncios').get();
    console.log(`📊 Total de anúncios no Firebase: ${firebaseSnapshot.size}`);
    
    // Verificar se algum anúncio tem dados de localização complexos
    let temLocationComplexa = false;
    firebaseSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.location && typeof data.location === 'object') {
        const locationKeys = Object.keys(data.location);
        if (locationKeys.length > 0) {
          console.log(`\n📄 Anúncio com location complexa:`);
          console.log(`   ID: ${doc.id}`);
          console.log(`   location: ${JSON.stringify(data.location, null, 6)}`);
          temLocationComplexa = true;
        }
      }
    });
    
    if (!temLocationComplexa) {
      console.log("⚠️ Nenhuma estrutura de location complexa encontrada no Firebase");
    }
    
    console.log("\n🔄 TESTANDO SINCRONIZAÇÃO:");
    console.log("===========================");
    
    // Simular sincronização de um anúncio do Firebase para MongoDB
    if (firebaseSnapshot.size > 0) {
      const primeiroAnuncio = firebaseSnapshot.docs[0];
      const anuncioData = primeiroAnuncio.data();
      
      console.log(`\n📤 Sincronizando anúncio: ${primeiroAnuncio.id}`);
      
      const publicData = {
        firebaseId: primeiroAnuncio.id,
        nome: anuncioData.nome,
        categoria: anuncioData.categoria,
        cidade: anuncioData.cidade,
        estado: anuncioData.estado,
        status: anuncioData.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        syncedFromFirebase: true,
        syncDate: new Date()
      };
      
      // Inserir/atualizar no MongoDB
      await mongoDb.collection('advertisements').replaceOne(
        { firebaseId: primeiroAnuncio.id },
        publicData,
        { upsert: true }
      );
      
      console.log("✅ Anúncio sincronizado com sucesso!");
    }
    
    console.log("\n🎉 Teste de sincronização concluído!");
    
  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log("\n🔌 Conexão MongoDB fechada");
    }
    process.exit(0);
  }
}

testSyncTheaterData();









