#!/usr/bin/env node

// check-mongodb-data.js
// Script para verificar dados no MongoDB Atlas

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: './config-firebase-mongodb.env' });

console.log("🗄️ VERIFICANDO DADOS NO MONGODB ATLAS");
console.log("=====================================");

async function verificarMongoDB() {
  let client;
  
  try {
    if (!process.env.MONGODB_URI) {
      console.log("❌ MongoDB URI não configurado");
      return;
    }

    console.log("🔗 Conectando ao MongoDB Atlas...");
    client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log("✅ Conectado com sucesso!");
    
    const db = client.db('mansao_do_job');
    
    // Listar todas as coleções
    console.log("\n📋 LISTANDO COLEÇÕES NO MONGODB:");
    console.log("=================================");
    
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log("⚠️ Nenhuma coleção encontrada no MongoDB");
      return;
    }
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`\n📁 Coleção: ${collectionName}`);
      console.log("─".repeat(50));
      
      try {
        const collection = db.collection(collectionName);
        
        // Contar documentos
        const count = await collection.countDocuments();
        console.log(`📊 Total de documentos: ${count}`);
        
        if (count > 0) {
          console.log("\n📄 Primeiros 5 documentos:");
          
          // Buscar primeiros 5 documentos
          const documents = await collection.find({}).limit(5).toArray();
          
          documents.forEach((doc, index) => {
            console.log(`\n  📝 Documento ${index + 1}:`);
            
            // Mostrar campos principais
            const campos = Object.keys(doc);
            console.log(`     Campos: ${campos.join(', ')}`);
            
            // Mostrar alguns valores de exemplo
            if (doc.nome) console.log(`     Nome: ${doc.nome}`);
            if (doc.email) console.log(`     Email: ${doc.email}`);
            if (doc.categoria) console.log(`     Categoria: ${doc.categoria}`);
            if (doc.status) console.log(`     Status: ${doc.status}`);
            if (doc.created_at) console.log(`     Criado em: ${doc.created_at}`);
            if (doc.timestamp) console.log(`     Timestamp: ${doc.timestamp}`);
            if (doc.message) console.log(`     Mensagem: ${doc.message}`);
            
            // Mostrar _id
            if (doc._id) console.log(`     ID: ${doc._id}`);
          });
          
          if (count > 5) {
            console.log(`\n  ... e mais ${count - 5} documentos`);
          }
        }
        
        // Estatísticas da coleção
        try {
          const stats = await db.stats();
          console.log(`\n📈 Estatísticas do banco:`);
          console.log(`     Tamanho total: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
          console.log(`     Número de coleções: ${stats.collections}`);
          console.log(`     Número de documentos: ${stats.objects}`);
        } catch (statsError) {
          // Ignorar erro de estatísticas se não tiver permissão
        }
        
      } catch (error) {
        console.log(`❌ Erro ao listar documentos da coleção ${collectionName}: ${error.message}`);
      }
    }
    
    // Verificar dados específicos
    console.log("\n🔍 VERIFICANDO DADOS ESPECÍFICOS:");
    console.log("=================================");
    
    // Verificar anúncios
    try {
      const anunciosCollection = db.collection('anuncios');
      const anunciosCount = await anunciosCollection.countDocuments();
      console.log(`\n📢 Anúncios: ${anunciosCount} documentos`);
      
      if (anunciosCount > 0) {
        const anuncios = await anunciosCollection.find({}).limit(3).toArray();
        console.log("   Exemplos de anúncios:");
        anuncios.forEach(anuncio => {
          console.log(`   - ${anuncio._id}: ${anuncio.nome || 'Sem nome'} (${anuncio.categoria || 'Sem categoria'})`);
        });
      }
    } catch (error) {
      console.log(`   ⚠️ Erro ao verificar anúncios: ${error.message}`);
    }
    
    // Verificar usuários
    try {
      const usuariosCollection = db.collection('users');
      const usuariosCount = await usuariosCollection.countDocuments();
      console.log(`\n👥 Usuários: ${usuariosCount} documentos`);
      
      if (usuariosCount > 0) {
        const usuarios = await usuariosCollection.find({}).limit(3).toArray();
        console.log("   Exemplos de usuários:");
        usuarios.forEach(usuario => {
          console.log(`   - ${usuario._id}: ${usuario.email || 'Sem email'} (${usuario.status || 'Sem status'})`);
        });
      }
    } catch (error) {
      console.log(`   ⚠️ Erro ao verificar usuários: ${error.message}`);
    }
    
    // Verificar dados de teste
    try {
      const testCollection = db.collection('test');
      const testCount = await testCollection.countDocuments();
      console.log(`\n🧪 Dados de teste: ${testCount} documentos`);
      
      if (testCount > 0) {
        const testDocs = await testCollection.find({}).toArray();
        console.log("   Documentos de teste encontrados:");
        testDocs.forEach(doc => {
          console.log(`   - ${doc._id}: ${doc.message || 'Sem mensagem'}`);
        });
      }
    } catch (error) {
      console.log(`   ⚠️ Erro ao verificar dados de teste: ${error.message}`);
    }
    
    console.log("\n🎉 Verificação do MongoDB concluída!");
    console.log("📊 Resumo: Dados encontrados no MongoDB Atlas");
    
  } catch (error) {
    console.error("❌ Erro na conexão MongoDB Atlas:");
    console.error(`   Erro: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log("\n💡 Dicas para resolver:");
      console.log("1. Verifique se o cluster está ativo no MongoDB Atlas");
      console.log("2. Confirme se o usuário e senha estão corretos");
      console.log("3. Verifique se o IP está liberado (0.0.0.0/0)");
    }
  } finally {
    if (client) {
      await client.close();
      console.log("\n🔌 Conexão MongoDB fechada");
    }
  }
}

verificarMongoDB();
