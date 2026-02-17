#!/usr/bin/env node

import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config({ path: './config-firebase-mongodb.env' });

console.log("🔥 VERIFICANDO DADOS COM THEATERID NO FIREBASE");
console.log("==============================================");

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

const db = admin.firestore();

async function verificarTheaterIdFirebase() {
  try {
    console.log("\n🔍 BUSCANDO DADOS COM THEATERID NO FIREBASE:");
    console.log("=============================================");
    
    // Listar todas as coleções
    const collections = await db.listCollections();
    
    for (const collection of collections) {
      console.log(`\n📁 Verificando coleção: ${collection.id}`);
      
      try {
        // Buscar documentos com theaterId
        const snapshot = await collection.where('theaterId', '!=', null).get();
        
        if (!snapshot.empty) {
          console.log(`   📊 Encontrados ${snapshot.size} documentos com theaterId`);
          
          snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`\n   📄 Documento ${index + 1}:`);
            console.log(`      ID: ${doc.id}`);
            console.log(`      theaterId: ${data.theaterId}`);
            
            if (data.location) {
              console.log(`      location: ${JSON.stringify(data.location, null, 6)}`);
            }
            
            // Mostrar outros campos relevantes
            if (data.nome) console.log(`      nome: ${data.nome}`);
            if (data.title) console.log(`      title: ${data.title}`);
            if (data.categoria) console.log(`      categoria: ${data.categoria}`);
            if (data.category) console.log(`      category: ${data.category}`);
            if (data.status) console.log(`      status: ${data.status}`);
          });
        } else {
          console.log(`   ⚠️ Nenhum documento com theaterId encontrado`);
        }
        
        // Buscar documentos com location como objeto
        const locationSnapshot = await collection.where('location', '!=', null).get();
        
        if (!locationSnapshot.empty) {
          console.log(`   📍 Documentos com location: ${locationSnapshot.size}`);
          
          // Verificar se algum tem estrutura similar
          let temEstruturaSimilar = false;
          locationSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.location && typeof data.location === 'object') {
              const locationKeys = Object.keys(data.location);
              if (locationKeys.length > 0) {
                console.log(`      Exemplo de location: ${JSON.stringify(data.location, null, 6)}`);
                temEstruturaSimilar = true;
              }
            }
          });
          
          if (!temEstruturaSimilar) {
            console.log(`      (Nenhuma estrutura de location complexa encontrada)`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Erro ao verificar coleção ${collection.id}: ${error.message}`);
      }
    }
    
    // Buscar especificamente pelos IDs que você mencionou
    console.log("\n🔎 BUSCANDO IDs ESPECÍFICOS NO FIREBASE:");
    console.log("=========================================");
    
    const idsEspecificos = ['59a47286cfa9a3a73e51e74e', '59a47286cfa9a3a73e51e748'];
    
    for (const id of idsEspecificos) {
      console.log(`\n🔍 Buscando ID: ${id}`);
      
      for (const collection of collections) {
        try {
          const doc = await collection.doc(id).get();
          
          if (doc.exists) {
            const data = doc.data();
            console.log(`   ✅ Encontrado na coleção: ${collection.id}`);
            console.log(`   theaterId: ${data.theaterId}`);
            if (data.location) {
              console.log(`   location: ${JSON.stringify(data.location, null, 6)}`);
            }
            break;
          }
        } catch (error) {
          // Ignorar erros de permissão
        }
      }
    }
    
    console.log("\n🎉 Verificação do Firebase concluída!");
    
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  } finally {
    process.exit(0);
  }
}

verificarTheaterIdFirebase();









