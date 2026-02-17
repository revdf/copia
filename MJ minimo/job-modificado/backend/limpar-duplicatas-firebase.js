#!/usr/bin/env node

/**
 * Script para limpar dados duplicados no Firebase
 */

import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './config-firebase-mongodb.env' });

// Configuração do Firebase
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
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
  });
  
  console.log("✅ Firebase Admin SDK inicializado");
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

const db = admin.firestore();

async function limparDuplicatas() {
  try {
    console.log("\n🧹 LIMPANDO DADOS DUPLICADOS NO FIREBASE:");
    console.log("==========================================");
    
    // IDs dos documentos duplicados identificados
    const duplicatasParaRemover = [
      'Um7fWTGiseIFTPjCGJVP', // Teste duplicado
      'cKqhEmB98F4aQzqG1tFw', // Teste duplicado
      '8C6xno4e4NBDcUHpXHiv'  // Pepeu duplicado (manter o mais recente)
    ];
    
    console.log(`\n📋 Documentos para remover: ${duplicatasParaRemover.length}`);
    
    // Remover documentos duplicados
    for (const docId of duplicatasParaRemover) {
      try {
        console.log(`\n🗑️ Removendo documento: ${docId}`);
        
        // Verificar se o documento existe antes de remover
        const doc = await db.collection('anuncios').doc(docId).get();
        
        if (doc.exists) {
          const data = doc.data();
          console.log(`   📄 Nome: ${data.nome}`);
          console.log(`   📧 Email: ${data.email}`);
          console.log(`   🏷️ Categoria: ${data.categoria}`);
          
          // Remover o documento
          await db.collection('anuncios').doc(docId).delete();
          console.log(`   ✅ Documento removido com sucesso!`);
        } else {
          console.log(`   ⚠️ Documento não encontrado`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erro ao remover ${docId}: ${error.message}`);
      }
    }
    
    // Limpar dados de teste
    console.log(`\n🧪 Limpando dados de teste...`);
    const testSnapshot = await db.collection('test').get();
    
    if (testSnapshot.size > 0) {
      console.log(`   📊 Encontrados ${testSnapshot.size} documentos de teste`);
      
      for (const doc of testSnapshot.docs) {
        try {
          await doc.ref.delete();
          console.log(`   ✅ Teste removido: ${doc.id}`);
        } catch (error) {
          console.log(`   ❌ Erro ao remover teste ${doc.id}: ${error.message}`);
        }
      }
    } else {
      console.log(`   ℹ️ Nenhum documento de teste encontrado`);
    }
    
    // Verificar resultado final
    console.log(`\n🔍 VERIFICAÇÃO FINAL:`);
    console.log("====================");
    
    const anunciosSnapshot = await db.collection('anuncios').get();
    console.log(`📊 Anúncios restantes: ${anunciosSnapshot.size}`);
    
    anunciosSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${doc.id}: ${data.nome} (${data.categoria})`);
    });
    
    const testSnapshotFinal = await db.collection('test').get();
    console.log(`🧪 Dados de teste restantes: ${testSnapshotFinal.size}`);
    
    console.log(`\n🎉 Limpeza concluída com sucesso!`);
    
  } catch (error) {
    console.error("❌ Erro ao limpar duplicatas:", error.message);
  }
}

limparDuplicatas();
