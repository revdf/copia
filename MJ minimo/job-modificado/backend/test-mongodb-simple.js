// Teste simples MongoDB Atlas
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: './config-firebase-mongodb.env' });

console.log("🧪 Testando MongoDB Atlas...");
console.log(`🗄️ URI: ${process.env.MONGODB_URI ? 'Configurado' : 'Não configurado'}`);

async function testMongoDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("❌ MONGODB_URI não configurado");
      return;
    }

    console.log("🔗 Conectando...");
    const client = new MongoClient(process.env.MONGODB_URI);
    
    await client.connect();
    console.log("✅ Conectado com sucesso!");
    
    const db = client.db('mansao_do_job');
    
    // Teste de escrita
    const testCollection = db.collection('test');
    await testCollection.insertOne({
      message: 'Teste de conexão MongoDB Atlas',
      timestamp: new Date(),
      status: 'success'
    });
    
    console.log("✅ Dados salvos com sucesso!");
    
    // Teste de leitura
    const result = await testCollection.findOne({ status: 'success' });
    console.log("✅ Dados lidos com sucesso!");
    console.log(`📄 Mensagem: ${result.message}`);
    
    await client.close();
    console.log("🎉 MongoDB Atlas funcionando perfeitamente!");
    
  } catch (error) {
    console.error("❌ Erro na conexão MongoDB Atlas:");
    console.error(`   Erro: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log("\n💡 Dicas para resolver:");
      console.log("1. Verifique se o cluster está ativo no MongoDB Atlas");
      console.log("2. Confirme se o usuário e senha estão corretos");
      console.log("3. Verifique se o IP está liberado (0.0.0.0/0)");
    }
  }
}

testMongoDB();