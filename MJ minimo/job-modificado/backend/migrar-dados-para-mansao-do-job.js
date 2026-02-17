#!/usr/bin/env node

import dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';

// Carregar configuração do mansao-do-job
dotenv.config({ path: './config-mansao-do-job.env' });

console.log("🚀 MIGRANDO DADOS PARA MANSÃO DO JOB");
console.log("=====================================");

async function migrarDadosParaMansaoDoJob() {
  try {
    // Verificar se as credenciais do mansao-do-job estão configuradas
    if (process.env.FIREBASE_PRIVATE_KEY_ID === 'SUBSTITUIR_PELO_PRIVATE_KEY_ID_DO_MANSAO_DO_JOB') {
      console.log("❌ ERRO: Credenciais do mansao-do-job não configuradas!");
      console.log("\n🔧 CONFIGURAÇÃO NECESSÁRIA:");
      console.log("============================");
      console.log("1. Acesse: https://console.firebase.google.com/u/0/project/mansao-do-job/overview");
      console.log("2. Vá em 'Configurações do projeto' (ícone de engrenagem)");
      console.log("3. Na aba 'Contas de serviço'");
      console.log("4. Clique em 'Gerar nova chave privada'");
      console.log("5. Baixe o arquivo JSON");
      console.log("6. Edite o arquivo 'config-mansao-do-job.env' e substitua:");
      console.log("   - FIREBASE_PRIVATE_KEY_ID");
      console.log("   - FIREBASE_PRIVATE_KEY");
      console.log("   - FIREBASE_CLIENT_EMAIL");
      console.log("   - FIREBASE_CLIENT_ID");
      console.log("\n⚠️ Execute este script novamente após configurar as credenciais!");
      return;
    }
    
    console.log(`\n🔍 Conectando ao projeto: ${process.env.FIREBASE_PROJECT_ID}`);
    
    // Configurar Firebase Admin SDK para mansao-do-job
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
    
    // Inicializar Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(firebaseServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    const db = admin.firestore();
    console.log("✅ Firebase Admin SDK inicializado para mansao-do-job");
    
    // Carregar backup
    const backupDir = './backup-copia-do-job';
    const backupFiles = fs.readdirSync(backupDir).filter(file => file.endsWith('.json'));
    
    if (backupFiles.length === 0) {
      console.log("❌ Nenhum arquivo de backup encontrado!");
      console.log("Execute primeiro o script de backup: node backup-dados-copia-do-job.js");
      return;
    }
    
    const latestBackup = backupFiles.sort().pop();
    const backupPath = `${backupDir}/${latestBackup}`;
    
    console.log(`\n📦 Carregando backup: ${latestBackup}`);
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log(`📅 Data do backup: ${backupData.backupDate}`);
    console.log(`📁 Coleções no backup: ${Object.keys(backupData.collections).length}`);
    
    // Migrar cada coleção
    console.log("\n🚀 INICIANDO MIGRAÇÃO:");
    console.log("======================");
    
    let totalMigrados = 0;
    let totalErros = 0;
    
    for (const [collectionName, collectionData] of Object.entries(backupData.collections)) {
      try {
        console.log(`\n📤 Migrando coleção: ${collectionName} (${collectionData.count} documentos)`);
        
        const collection = db.collection(collectionName);
        let migrados = 0;
        let erros = 0;
        
        // Migrar cada documento
        for (const doc of collectionData.documents) {
          try {
            await collection.doc(doc.id).set(doc.data);
            migrados++;
          } catch (error) {
            console.log(`   ⚠️ Erro ao migrar documento ${doc.id}: ${error.message}`);
            erros++;
          }
        }
        
        console.log(`   ✅ Migrados: ${migrados}`);
        if (erros > 0) {
          console.log(`   ❌ Erros: ${erros}`);
        }
        
        totalMigrados += migrados;
        totalErros += erros;
        
      } catch (error) {
        console.log(`\n❌ Erro ao migrar coleção ${collectionName}: ${error.message}`);
        totalErros += collectionData.count;
      }
    }
    
    // Verificar migração
    console.log("\n🔍 VERIFICANDO MIGRAÇÃO:");
    console.log("========================");
    
    const collections = await db.listCollections();
    let totalVerificados = 0;
    
    for (const collection of collections) {
      try {
        const snapshot = await collection.get();
        const count = snapshot.size;
        totalVerificados += count;
        console.log(`   ${collection.id}: ${count} documentos`);
      } catch (error) {
        console.log(`   ${collection.id}: erro ao verificar - ${error.message}`);
      }
    }
    
    // Resultado final
    console.log("\n🎉 MIGRAÇÃO CONCLUÍDA!");
    console.log("======================");
    console.log(`📊 Documentos migrados: ${totalMigrados}`);
    console.log(`📊 Documentos verificados: ${totalVerificados}`);
    console.log(`❌ Erros: ${totalErros}`);
    
    if (totalErros === 0) {
      console.log("\n✅ SUCESSO: Todos os dados foram migrados!");
      console.log("✅ O projeto mansao-do-job agora tem todos os dados!");
    } else {
      console.log("\n⚠️ ATENÇÃO: Alguns documentos tiveram erro na migração");
      console.log("⚠️ Verifique os logs acima para detalhes");
    }
    
    console.log("\n💡 PRÓXIMOS PASSOS:");
    console.log("===================");
    console.log("1. ✅ Dados migrados para mansao-do-job");
    console.log("2. 🔄 Atualizar configurações do sistema");
    console.log("3. 🧪 Testar sistema com mansao-do-job");
    console.log("4. 🚀 Ativar mansao-do-job como projeto principal");
    
  } catch (error) {
    console.error("\n❌ ERRO durante a migração:", error.message);
    console.error("❌ A migração foi interrompida!");
  } finally {
    process.exit(0);
  }
}

migrarDadosParaMansaoDoJob();









