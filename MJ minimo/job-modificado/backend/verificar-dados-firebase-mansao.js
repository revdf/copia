#!/usr/bin/env node

// verificar-dados-firebase-mansao.js
// Script para verificar dados reais no Firebase mansao-do-job

import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config({ path: './config-firebase-mongodb.env' });

console.log("🔍 VERIFICANDO DADOS REAIS NO FIREBASE MANSAO-DO-JOB");
console.log("===================================================");

// Inicializar Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
    projectId: process.env.FIREBASE_PROJECT_ID
  });

  console.log("✅ Firebase Admin inicializado com sucesso");
  console.log(`📊 Projeto: ${process.env.FIREBASE_PROJECT_ID}`);
  
  const db = admin.firestore();
  
  async function verificarDadosFirebase() {
    console.log("\n🔍 LISTANDO TODAS AS COLEÇÕES:");
    console.log("===============================");
    
    try {
      // Listar todas as coleções
      const collections = await db.listCollections();
      
      if (collections.length === 0) {
        console.log("❌ Nenhuma coleção encontrada no Firebase");
        return;
      }
      
      console.log(`📊 Total de coleções: ${collections.length}`);
      
      for (const collection of collections) {
        console.log(`\n📁 Coleção: ${collection.id}`);
        console.log("=" + "=".repeat(collection.id.length + 10));
        
        try {
          // Contar documentos na coleção
          const snapshot = await collection.get();
          const docs = snapshot.docs;
          
          console.log(`📄 Total de documentos: ${docs.length}`);
          
          if (docs.length > 0) {
            console.log("\n📋 Documentos encontrados:");
            
            docs.forEach((doc, index) => {
              const data = doc.data();
              console.log(`\n  ${index + 1}. ID: ${doc.id}`);
              
              // Mostrar campos principais
              const campos = Object.keys(data);
              console.log(`     Campos: ${campos.join(', ')}`);
              
              // Mostrar alguns valores importantes
              if (data.nome) console.log(`     Nome: ${data.nome}`);
              if (data.title) console.log(`     Title: ${data.title}`);
              if (data.cidade) console.log(`     Cidade: ${data.cidade}`);
              if (data.estado) console.log(`     Estado: ${data.estado}`);
              if (data.nivel) console.log(`     Nível: ${data.nivel}`);
              if (data.status) console.log(`     Status: ${data.status}`);
              if (data.createdAt) console.log(`     Criado: ${data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt}`);
              if (data.updatedAt) console.log(`     Atualizado: ${data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt}`);
              
              // Mostrar se tem fotos
              if (data.foto_capa || data.coverImage || data.mediaFiles) {
                console.log(`     📸 Tem fotos: Sim`);
              }
              
              // Limitar a 3 documentos por coleção para não sobrecarregar
              if (index >= 2) {
                console.log(`     ... e mais ${docs.length - 3} documentos`);
                return;
              }
            });
          } else {
            console.log("   📭 Coleção vazia");
          }
          
        } catch (error) {
          console.log(`   ❌ Erro ao acessar coleção: ${error.message}`);
        }
      }
      
      console.log("\n🎯 RESUMO:");
      console.log("==========");
      console.log(`✅ Firebase conectado: ${process.env.FIREBASE_PROJECT_ID}`);
      console.log(`📊 Total de coleções: ${collections.length}`);
      
      // Contar total de documentos
      let totalDocs = 0;
      for (const collection of collections) {
        const snapshot = await collection.get();
        totalDocs += snapshot.docs.length;
      }
      console.log(`📄 Total de documentos: ${totalDocs}`);
      
      if (totalDocs > 0) {
        console.log("✅ DADOS REAIS ENCONTRADOS NO FIREBASE!");
      } else {
        console.log("❌ NENHUM DADO REAL ENCONTRADO NO FIREBASE");
      }
      
    } catch (error) {
      console.log(`❌ Erro ao listar coleções: ${error.message}`);
    }
  }
  
  verificarDadosFirebase().then(() => {
    console.log("\n🎉 Verificação concluída!");
    process.exit(0);
  }).catch(error => {
    console.log(`❌ Erro: ${error.message}`);
    process.exit(1);
  });
  
} catch (error) {
  console.log(`❌ Erro ao inicializar Firebase: ${error.message}`);
  process.exit(1);
}









