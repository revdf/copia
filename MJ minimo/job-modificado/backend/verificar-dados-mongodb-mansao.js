#!/usr/bin/env node

// verificar-dados-mongodb-mansao.js
// Script para verificar dados reais no MongoDB Atlas mansao_do_job

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: './config-firebase-mongodb.env' });

console.log("🔍 VERIFICANDO DADOS REAIS NO MONGODB ATLAS MANSAO_DO_JOB");
console.log("========================================================");

async function verificarDadosMongoDB() {
  let client;
  
  try {
    // Conectar ao MongoDB Atlas
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log("✅ MongoDB Atlas conectado com sucesso");
    
    const db = client.db(process.env.MONGODB_DATABASE);
    console.log(`📊 Database: ${process.env.MONGODB_DATABASE}`);
    
    // Listar todas as coleções
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Total de coleções: ${collections.length}`);
    
    if (collections.length === 0) {
      console.log("❌ Nenhuma coleção encontrada no MongoDB Atlas");
      return;
    }
    
    console.log("\n🔍 LISTANDO TODAS AS COLEÇÕES:");
    console.log("===============================");
    
    let totalDocs = 0;
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      
      // Pular coleções do sistema
      if (collectionName.startsWith('system.')) {
        continue;
      }
      
      console.log(`\n📁 Coleção: ${collectionName}`);
      console.log("=" + "=".repeat(collectionName.length + 10));
      
      try {
        const collection = db.collection(collectionName);
        
        // Contar documentos
        const count = await collection.countDocuments();
        console.log(`📄 Total de documentos: ${count}`);
        
        if (count > 0) {
          console.log("\n📋 Documentos encontrados:");
          
          // Buscar alguns documentos
          const docs = await collection.find({}).limit(3).toArray();
          
          docs.forEach((doc, index) => {
            console.log(`\n  ${index + 1}. ID: ${doc._id}`);
            
            // Mostrar campos principais
            const campos = Object.keys(doc);
            console.log(`     Campos: ${campos.join(', ')}`);
            
            // Mostrar alguns valores importantes
            if (doc.nome) console.log(`     Nome: ${doc.nome}`);
            if (doc.title) console.log(`     Title: ${doc.title}`);
            if (doc.cidade) console.log(`     Cidade: ${doc.cidade}`);
            if (doc.estado) console.log(`     Estado: ${doc.estado}`);
            if (doc.nivel) console.log(`     Nível: ${doc.nivel}`);
            if (doc.status) console.log(`     Status: ${doc.status}`);
            if (doc.createdAt) console.log(`     Criado: ${doc.createdAt}`);
            if (doc.updatedAt) console.log(`     Atualizado: ${doc.updatedAt}`);
            
            // Mostrar se tem fotos
            if (doc.foto_capa || doc.coverImage || doc.mediaFiles) {
              console.log(`     📸 Tem fotos: Sim`);
            }
          });
          
          if (count > 3) {
            console.log(`     ... e mais ${count - 3} documentos`);
          }
          
          totalDocs += count;
        } else {
          console.log("   📭 Coleção vazia");
        }
        
      } catch (error) {
        console.log(`   ❌ Erro ao acessar coleção: ${error.message}`);
      }
    }
    
    console.log("\n🎯 RESUMO:");
    console.log("==========");
    console.log(`✅ MongoDB Atlas conectado: ${process.env.MONGODB_DATABASE}`);
    console.log(`📊 Total de coleções: ${collections.length}`);
    console.log(`📄 Total de documentos: ${totalDocs}`);
    
    if (totalDocs > 0) {
      console.log("✅ DADOS REAIS ENCONTRADOS NO MONGODB ATLAS!");
    } else {
      console.log("❌ NENHUM DADO REAL ENCONTRADO NO MONGODB ATLAS");
    }
    
    // Verificar especificamente a coleção 'advertisements'
    console.log("\n🔍 VERIFICAÇÃO ESPECÍFICA - COLEÇÃO 'advertisements':");
    console.log("===================================================");
    
    const advertisementsCollection = db.collection('advertisements');
    const adsCount = await advertisementsCollection.countDocuments();
    console.log(`📄 Documentos na coleção 'advertisements': ${adsCount}`);
    
    if (adsCount > 0) {
      const ads = await advertisementsCollection.find({}).toArray();
      console.log("\n📋 Anúncios encontrados:");
      
      ads.forEach((ad, index) => {
        console.log(`\n  ${index + 1}. ID: ${ad._id}`);
        console.log(`     Nome: ${ad.nome || 'N/A'}`);
        console.log(`     Cidade: ${ad.cidade || 'N/A'}`);
        console.log(`     Estado: ${ad.estado || 'N/A'}`);
        console.log(`     Status: ${ad.status || 'N/A'}`);
        console.log(`     Criado: ${ad.createdAt || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  } finally {
    if (client) {
      await client.close();
      console.log("\n🔌 Conexão MongoDB fechada");
    }
  }
}

verificarDadosMongoDB().then(() => {
  console.log("\n🎉 Verificação concluída!");
  process.exit(0);
}).catch(error => {
  console.log(`❌ Erro: ${error.message}`);
  process.exit(1);
});









