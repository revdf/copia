#!/usr/bin/env node

import dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';

dotenv.config({ path: './config-firebase-mongodb.env' });

console.log("💾 FAZENDO BACKUP DOS DADOS DO COPIA-DO-JOB");
console.log("=============================================");

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

async function fazerBackupDados() {
  try {
    console.log(`\n🔍 Conectando ao projeto: ${process.env.FIREBASE_PROJECT_ID}`);
    
    // Inicializar Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(firebaseServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    const db = admin.firestore();
    console.log("✅ Firebase Admin SDK inicializado");
    
    // Criar diretório de backup
    const backupDir = './backup-copia-do-job';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
      console.log(`📁 Diretório de backup criado: ${backupDir}`);
    }
    
    // Listar todas as coleções
    const collections = await db.listCollections();
    console.log(`\n📋 Encontradas ${collections.length} coleções para backup`);
    
    const backupData = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      backupDate: new Date().toISOString(),
      collections: {}
    };
    
    // Fazer backup de cada coleção
    for (const collection of collections) {
      try {
        console.log(`\n📦 Fazendo backup da coleção: ${collection.id}`);
        
        const snapshot = await collection.get();
        const documents = [];
        
        snapshot.docs.forEach(doc => {
          documents.push({
            id: doc.id,
            data: doc.data()
          });
        });
        
        backupData.collections[collection.id] = {
          count: documents.length,
          documents: documents
        };
        
        console.log(`   ✅ ${documents.length} documentos salvos`);
        
      } catch (error) {
        console.log(`   ❌ Erro ao fazer backup de ${collection.id}: ${error.message}`);
      }
    }
    
    // Salvar backup em arquivo JSON
    const backupFile = `${backupDir}/backup-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`\n💾 Backup salvo em: ${backupFile}`);
    
    // Estatísticas do backup
    let totalDocumentos = 0;
    Object.values(backupData.collections).forEach(col => {
      totalDocumentos += col.count;
    });
    
    console.log("\n📊 ESTATÍSTICAS DO BACKUP:");
    console.log("===========================");
    console.log(`📁 Coleções: ${Object.keys(backupData.collections).length}`);
    console.log(`📄 Documentos: ${totalDocumentos}`);
    console.log(`📅 Data: ${backupData.backupDate}`);
    
    // Mostrar resumo por coleção
    console.log("\n📋 RESUMO POR COLEÇÃO:");
    console.log("======================");
    Object.entries(backupData.collections).forEach(([nome, dados]) => {
      console.log(`   ${nome}: ${dados.count} documentos`);
    });
    
    console.log("\n✅ BACKUP CONCLUÍDO COM SUCESSO!");
    console.log("=================================");
    console.log("💡 Próximos passos:");
    console.log("1. ✅ Backup dos dados do copia-do-job salvo");
    console.log("2. 🔧 Configurar credenciais do mansao-do-job");
    console.log("3. 📤 Migrar dados para mansao-do-job");
    console.log("4. 🔄 Atualizar configurações do sistema");
    
  } catch (error) {
    console.error("❌ Erro durante o backup:", error.message);
  } finally {
    process.exit(0);
  }
}

fazerBackupDados();









