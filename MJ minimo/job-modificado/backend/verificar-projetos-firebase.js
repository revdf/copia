#!/usr/bin/env node

import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config({ path: './config-firebase-mongodb.env' });

console.log("🔥 VERIFICANDO PROJETOS FIREBASE");
console.log("=================================");

// Configurar Firebase Admin SDK para copia-do-job
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

async function verificarProjetosFirebase() {
  try {
    console.log(`\n🔍 Verificando projeto: ${process.env.FIREBASE_PROJECT_ID}`);
    console.log(`📧 Email: ${process.env.FIREBASE_CLIENT_EMAIL}`);
    
    // Inicializar Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(firebaseServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    const db = admin.firestore();
    console.log("✅ Firebase Admin SDK inicializado");
    
    // Verificar coleções e contagem de documentos
    console.log("\n📋 LISTANDO COLEÇÕES E DOCUMENTOS:");
    console.log("===================================");
    
    const collections = await db.listCollections();
    
    for (const collection of collections) {
      try {
        const snapshot = await collection.get();
        const count = snapshot.size;
        
        console.log(`\n📁 Coleção: ${collection.id}`);
        console.log(`   📊 Total de documentos: ${count}`);
        
        if (count > 0) {
          // Mostrar alguns exemplos
          const docs = snapshot.docs.slice(0, 3);
          docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`\n   📄 Documento ${index + 1}:`);
            console.log(`      ID: ${doc.id}`);
            if (data.nome) console.log(`      Nome: ${data.nome}`);
            if (data.title) console.log(`      Title: ${data.title}`);
            if (data.categoria) console.log(`      Categoria: ${data.categoria}`);
            if (data.category) console.log(`      Category: ${data.category}`);
            if (data.status) console.log(`      Status: ${data.status}`);
          });
          
          if (count > 3) {
            console.log(`\n   ... e mais ${count - 3} documentos`);
          }
        }
        
      } catch (error) {
        console.log(`\n❌ Erro ao verificar coleção ${collection.id}: ${error.message}`);
      }
    }
    
    // Verificar especificamente a coleção 'anuncios'
    console.log("\n🔍 VERIFICAÇÃO ESPECÍFICA - COLEÇÃO 'ANUNCIOS':");
    console.log("===============================================");
    
    try {
      const anunciosRef = db.collection('anuncios');
      const anunciosSnapshot = await anunciosRef.get();
      const anunciosCount = anunciosSnapshot.size;
      
      console.log(`📊 Total de anúncios: ${anunciosCount}`);
      
      if (anunciosCount > 0) {
        console.log("\n📄 Primeiros 5 anúncios:");
        anunciosSnapshot.docs.slice(0, 5).forEach((doc, index) => {
          const data = doc.data();
          console.log(`\n   ${index + 1}. ID: ${doc.id}`);
          console.log(`      Nome: ${data.nome || 'Sem nome'}`);
          console.log(`      Categoria: ${data.categoria || 'Sem categoria'}`);
          console.log(`      Status: ${data.status || 'Sem status'}`);
          console.log(`      Cidade: ${data.cidade || 'Sem cidade'}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Erro ao verificar anúncios: ${error.message}`);
    }
    
    // Verificar coleção 'advertisements'
    console.log("\n🔍 VERIFICAÇÃO ESPECÍFICA - COLEÇÃO 'ADVERTISEMENTS':");
    console.log("===================================================");
    
    try {
      const advertisementsRef = db.collection('advertisements');
      const advertisementsSnapshot = await advertisementsRef.get();
      const advertisementsCount = advertisementsSnapshot.size;
      
      console.log(`📊 Total de advertisements: ${advertisementsCount}`);
      
      if (advertisementsCount > 0) {
        console.log("\n📄 Primeiros 3 advertisements:");
        advertisementsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
          const data = doc.data();
          console.log(`\n   ${index + 1}. ID: ${doc.id}`);
          console.log(`      Nome: ${data.nome || 'Sem nome'}`);
          console.log(`      Categoria: ${data.categoria || 'Sem categoria'}`);
          console.log(`      Status: ${data.status || 'Sem status'}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Erro ao verificar advertisements: ${error.message}`);
    }
    
    // Resumo final
    console.log("\n🎯 RESUMO FINAL:");
    console.log("================");
    console.log(`🔥 Projeto Firebase: ${process.env.FIREBASE_PROJECT_ID}`);
    console.log(`📧 Service Account: ${process.env.FIREBASE_CLIENT_EMAIL}`);
    console.log(`📊 Total de coleções: ${collections.length}`);
    
    // Contar total de documentos
    let totalDocumentos = 0;
    for (const collection of collections) {
      try {
        const snapshot = await collection.get();
        totalDocumentos += snapshot.size;
      } catch (error) {
        // Ignorar erros de contagem
      }
    }
    
    console.log(`📊 Total de documentos: ${totalDocumentos}`);
    
    if (totalDocumentos >= 125) {
      console.log("\n✅ ESTE É O PROJETO COM OS 125+ ANÚNCIOS!");
    } else {
      console.log("\n⚠️ Este projeto tem menos de 125 anúncios");
    }
    
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  } finally {
    process.exit(0);
  }
}

verificarProjetosFirebase();









