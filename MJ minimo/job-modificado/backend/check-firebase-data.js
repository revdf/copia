#!/usr/bin/env node

// check-firebase-data.js
// Script para verificar dados no Firebase Firestore

import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config({ path: './config-firebase-mongodb.env' });

console.log("🔥 VERIFICANDO DADOS NO FIREBASE FIRESTORE");
console.log("==========================================");

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

async function listarColecoes() {
  try {
    console.log("\n📋 LISTANDO COLEÇÕES NO FIREBASE:");
    console.log("=================================");
    
    // Listar todas as coleções
    const collections = await db.listCollections();
    
    if (collections.length === 0) {
      console.log("⚠️ Nenhuma coleção encontrada no Firebase");
      return;
    }
    
    for (const collection of collections) {
      console.log(`\n📁 Coleção: ${collection.id}`);
      console.log("─".repeat(50));
      
      try {
        // Contar documentos na coleção
        const snapshot = await collection.get();
        const count = snapshot.size;
        console.log(`📊 Total de documentos: ${count}`);
        
        if (count > 0) {
          console.log("\n📄 Primeiros 5 documentos:");
          let i = 0;
          for (const doc of snapshot.docs) {
            if (i >= 5) break;
            
            const data = doc.data();
            console.log(`\n  📝 Documento ID: ${doc.id}`);
            
            // Mostrar campos principais (limitado para não poluir)
            const campos = Object.keys(data);
            console.log(`     Campos: ${campos.join(', ')}`);
            
            // Mostrar alguns valores de exemplo
            if (data.nome) console.log(`     Nome: ${data.nome}`);
            if (data.email) console.log(`     Email: ${data.email}`);
            if (data.categoria) console.log(`     Categoria: ${data.categoria}`);
            if (data.status) console.log(`     Status: ${data.status}`);
            if (data.created_at) console.log(`     Criado em: ${data.created_at}`);
            
            i++;
          }
          
          if (count > 5) {
            console.log(`\n  ... e mais ${count - 5} documentos`);
          }
        }
      } catch (error) {
        console.log(`❌ Erro ao listar documentos da coleção ${collection.id}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error("❌ Erro ao listar coleções:", error.message);
  }
}

async function verificarDadosEspecificos() {
  try {
    console.log("\n🔍 VERIFICANDO DADOS ESPECÍFICOS:");
    console.log("=================================");
    
    // Verificar anúncios
    const anunciosRef = db.collection('anuncios');
    const anunciosSnapshot = await anunciosRef.get();
    console.log(`\n📢 Anúncios: ${anunciosSnapshot.size} documentos`);
    
    if (anunciosSnapshot.size > 0) {
      console.log("   Exemplos de anúncios:");
      anunciosSnapshot.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log(`   - ${doc.id}: ${data.nome || 'Sem nome'} (${data.categoria || 'Sem categoria'})`);
      });
    }
    
    // Verificar usuários
    const usuariosRef = db.collection('users');
    const usuariosSnapshot = await usuariosRef.get();
    console.log(`\n👥 Usuários: ${usuariosSnapshot.size} documentos`);
    
    if (usuariosSnapshot.size > 0) {
      console.log("   Exemplos de usuários:");
      usuariosSnapshot.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log(`   - ${doc.id}: ${data.email || 'Sem email'} (${data.status || 'Sem status'})`);
      });
    }
    
    // Verificar dados de teste
    const testRef = db.collection('test');
    const testSnapshot = await testRef.get();
    console.log(`\n🧪 Dados de teste: ${testSnapshot.size} documentos`);
    
    if (testSnapshot.size > 0) {
      console.log("   Documentos de teste encontrados:");
      testSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${doc.id}: ${data.message || 'Sem mensagem'}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Erro ao verificar dados específicos:", error.message);
  }
}

async function main() {
  try {
    await listarColecoes();
    await verificarDadosEspecificos();
    
    console.log("\n🎉 Verificação do Firebase concluída!");
    console.log("📊 Resumo: Dados encontrados no Firebase Firestore");
    
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  } finally {
    process.exit(0);
  }
}

main();
