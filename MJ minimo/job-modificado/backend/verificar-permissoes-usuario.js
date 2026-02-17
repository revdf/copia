#!/usr/bin/env node

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: './config-firebase-mongodb.env' });

async function verificarPermissoes() {
  let client;
  
  try {
    console.log("🔐 VERIFICANDO PERMISSÕES DO USUÁRIO");
    console.log("=====================================");
    
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('mansao_do_job');
    const adminDb = client.db('admin');
    
    console.log("✅ Conectado ao MongoDB Atlas");
    
    // Verificar permissões no database atual
    console.log("\n📊 Verificando permissões no database 'mansao_do_job':");
    
    try {
      const collections = await db.listCollections().toArray();
      console.log(`✅ Pode listar coleções: ${collections.length} encontradas`);
      
      // Tentar operações básicas
      const testCollection = db.collection('test_permissions');
      await testCollection.insertOne({ test: 'permission_check', timestamp: new Date() });
      console.log("✅ Pode inserir documentos");
      
      await testCollection.deleteOne({ test: 'permission_check' });
      console.log("✅ Pode deletar documentos");
      
    } catch (error) {
      console.log(`❌ Erro nas permissões do database: ${error.message}`);
    }
    
    // Verificar se pode acessar database 'local'
    console.log("\n🔍 Verificando acesso ao database 'local':");
    
    try {
      const localDb = client.db('local');
      const localCollections = await localDb.listCollections().toArray();
      console.log(`⚠️ Pode listar coleções do 'local': ${localCollections.length} encontradas`);
      
      // Tentar operação no oplog
      const oplogCollection = localDb.collection('oplog.rs');
      const oplogCount = await oplogCollection.countDocuments();
      console.log(`⚠️ Pode ler oplog: ${oplogCount} documentos`);
      
    } catch (error) {
      console.log(`❌ Não pode acessar database 'local': ${error.message}`);
    }
    
    // Verificar roles do usuário
    console.log("\n👤 Verificando roles do usuário:");
    
    try {
      const users = await adminDb.collection('system.users').find({}).toArray();
      console.log(`📊 Usuários encontrados: ${users.length}`);
      
      users.forEach(user => {
        if (user.user === 'revdfucb_db_user') {
          console.log(`\n👤 Usuário: ${user.user}`);
          console.log(`🔐 Roles: ${JSON.stringify(user.roles, null, 2)}`);
        }
      });
      
    } catch (error) {
      console.log(`❌ Não pode verificar roles: ${error.message}`);
    }
    
    console.log("\n💡 RECOMENDAÇÕES:");
    console.log("==================");
    console.log("1. ❌ NÃO tente deletar do oplog.rs (coleção sistema)");
    console.log("2. ✅ Deletar apenas de coleções do seu database");
    console.log("3. 🔧 Se precisar limpar dados, use as coleções corretas");
    console.log("4. 🛡️ O oplog é protegido por segurança do MongoDB");
    
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  } finally {
    if (client) {
      await client.close();
      console.log("\n🔌 Conexão fechada");
    }
  }
}

verificarPermissoes();









