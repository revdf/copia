#!/usr/bin/env node

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: './config-firebase-mongodb.env' });

async function limparTodosDadosMongoDB() {
  let client;
  
  try {
    console.log("🧹 LIMPANDO TODOS OS DADOS DO MONGODB ATLAS");
    console.log("=============================================");
    console.log("⚠️  ATENÇÃO: Esta operação irá DELETAR TODOS os dados!");
    console.log("⚠️  Database: mansao_do_job");
    console.log("⚠️  Esta ação NÃO pode ser desfeita!");
    
    // Aguardar confirmação
    console.log("\n⏳ Aguardando 5 segundos para você cancelar se necessário...");
    console.log("   (Pressione Ctrl+C para cancelar)");
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('mansao_do_job');
    
    console.log("\n✅ Conectado ao MongoDB Atlas");
    
    // Listar todas as coleções
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📋 Encontradas ${collections.length} coleções:`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Estatísticas antes da limpeza
    console.log("\n📊 ESTATÍSTICAS ANTES DA LIMPEZA:");
    console.log("==================================");
    
    let totalDocumentos = 0;
    for (const collectionInfo of collections) {
      try {
        const collection = db.collection(collectionInfo.name);
        const count = await collection.countDocuments();
        totalDocumentos += count;
        console.log(`   ${collectionInfo.name}: ${count} documentos`);
      } catch (error) {
        console.log(`   ${collectionInfo.name}: erro ao contar - ${error.message}`);
      }
    }
    
    console.log(`\n📊 TOTAL: ${totalDocumentos} documentos em ${collections.length} coleções`);
    
    // Confirmar limpeza
    console.log("\n🚨 CONFIRMAÇÃO FINAL:");
    console.log("=====================");
    console.log("⚠️  Você está prestes a DELETAR TODOS os dados!");
    console.log("⚠️  Esta operação é IRREVERSÍVEL!");
    console.log("⚠️  Aguardando mais 3 segundos...");
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Iniciar limpeza
    console.log("\n🧹 INICIANDO LIMPEZA...");
    console.log("=======================");
    
    let colecoesLimpas = 0;
    let documentosDeletados = 0;
    
    for (const collectionInfo of collections) {
      try {
        const collection = db.collection(collectionInfo.name);
        const countAntes = await collection.countDocuments();
        
        if (countAntes > 0) {
          console.log(`\n🧹 Limpando coleção: ${collectionInfo.name} (${countAntes} documentos)`);
          
          // Deletar todos os documentos
          const result = await collection.deleteMany({});
          
          console.log(`   ✅ Deletados: ${result.deletedCount} documentos`);
          documentosDeletados += result.deletedCount;
        } else {
          console.log(`\n✅ Coleção ${collectionInfo.name}: já estava vazia`);
        }
        
        colecoesLimpas++;
        
      } catch (error) {
        console.log(`\n❌ Erro ao limpar ${collectionInfo.name}: ${error.message}`);
      }
    }
    
    // Verificar se realmente foi limpo
    console.log("\n🔍 VERIFICANDO LIMPEZA:");
    console.log("=======================");
    
    let documentosRestantes = 0;
    for (const collectionInfo of collections) {
      try {
        const collection = db.collection(collectionInfo.name);
        const count = await collection.countDocuments();
        documentosRestantes += count;
        
        if (count > 0) {
          console.log(`   ⚠️  ${collectionInfo.name}: ainda tem ${count} documentos`);
        } else {
          console.log(`   ✅ ${collectionInfo.name}: vazia`);
        }
      } catch (error) {
        console.log(`   ❌ ${collectionInfo.name}: erro ao verificar - ${error.message}`);
      }
    }
    
    // Resultado final
    console.log("\n🎉 LIMPEZA CONCLUÍDA!");
    console.log("=====================");
    console.log(`📊 Coleções processadas: ${colecoesLimpas}`);
    console.log(`📊 Documentos deletados: ${documentosDeletados}`);
    console.log(`📊 Documentos restantes: ${documentosRestantes}`);
    
    if (documentosRestantes === 0) {
      console.log("\n✅ SUCESSO: Todos os dados foram removidos!");
      console.log("✅ O database 'mansao_do_job' está completamente limpo!");
    } else {
      console.log("\n⚠️  ATENÇÃO: Alguns documentos ainda restam!");
      console.log("⚠️  Pode ser necessário verificar permissões ou tipos de dados");
    }
    
    console.log("\n💡 PRÓXIMOS PASSOS:");
    console.log("===================");
    console.log("1. ✅ Database limpo com sucesso");
    console.log("2. 🔄 Você pode agora sincronizar dados do Firebase");
    console.log("3. 🚀 Ou começar com dados novos");
    console.log("4. 📊 O sistema híbrido continuará funcionando");
    
  } catch (error) {
    console.error("\n❌ ERRO durante a limpeza:", error.message);
    console.error("❌ A operação foi interrompida!");
  } finally {
    if (client) {
      await client.close();
      console.log("\n🔌 Conexão MongoDB fechada");
    }
  }
}

// Função para cancelar com Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n❌ Operação cancelada pelo usuário!');
  console.log('❌ Nenhum dado foi deletado.');
  process.exit(0);
});

limparTodosDadosMongoDB();









