#!/usr/bin/env node

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: './config-firebase-mongodb.env' });

async function limparDadosTeste() {
  let client;
  
  try {
    console.log("🧹 LIMPANDO DADOS DE TESTE");
    console.log("==========================");
    
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('mansao_do_job');
    
    console.log("✅ Conectado ao MongoDB Atlas");
    
    // Listar coleções que podem conter dados de teste
    const collections = await db.listCollections().toArray();
    
    console.log("\n📋 Coleções encontradas:");
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Limpar coleções de teste
    const colecoesTeste = ['test', 'test_hybrid', 'test_connection', 'test_mongodb'];
    
    for (const nomeColecao of colecoesTeste) {
      try {
        const collection = db.collection(nomeColecao);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          console.log(`\n🧹 Limpando coleção '${nomeColecao}': ${count} documentos`);
          
          // Mostrar alguns documentos antes de deletar
          const docs = await collection.find({}).limit(3).toArray();
          docs.forEach((doc, index) => {
            console.log(`   📄 Documento ${index + 1}: ${doc._id}`);
            if (doc.message) console.log(`      Mensagem: ${doc.message}`);
            if (doc.timestamp) console.log(`      Timestamp: ${doc.timestamp}`);
          });
          
          // Deletar todos os documentos
          const result = await collection.deleteMany({});
          console.log(`   ✅ Deletados: ${result.deletedCount} documentos`);
        } else {
          console.log(`\n✅ Coleção '${nomeColecao}': já está vazia`);
        }
        
      } catch (error) {
        console.log(`\n❌ Erro ao limpar '${nomeColecao}': ${error.message}`);
      }
    }
    
    console.log("\n🎉 Limpeza concluída!");
    console.log("\n💡 DICAS:");
    console.log("==========");
    console.log("1. ✅ Dados de teste foram limpos");
    console.log("2. ❌ NÃO tente limpar o oplog.rs (coleção sistema)");
    console.log("3. 🔧 Use apenas coleções do seu database");
    console.log("4. 🛡️ O oplog é protegido por segurança do MongoDB");
    
  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    if (client) {
      await client.close();
      console.log("\n🔌 Conexão fechada");
    }
  }
}

limparDadosTeste();









