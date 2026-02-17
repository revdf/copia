#!/usr/bin/env node

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: './config-firebase-mongodb.env' });

async function investigarDados() {
  let client;
  
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('mansao_do_job');
    
    console.log('🎭 INVESTIGANDO DADOS COM THEATERID:');
    console.log('====================================');
    
    // Buscar em todas as coleções por theaterId
    const collections = await db.listCollections().toArray();
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      
      // Verificar se há documentos com theaterId
      const count = await collection.countDocuments({ theaterId: { $exists: true } });
      
      if (count > 0) {
        console.log(`\n📁 Coleção: ${collectionName}`);
        console.log(`📊 Documentos com theaterId: ${count}`);
        
        // Buscar alguns exemplos
        const docs = await collection.find({ theaterId: { $exists: true } }).limit(3).toArray();
        
        docs.forEach((doc, index) => {
          console.log(`\n  📄 Documento ${index + 1}:`);
          console.log(`     _id: ${doc._id}`);
          console.log(`     theaterId: ${doc.theaterId}`);
          
          if (doc.location) {
            console.log(`     location: ${JSON.stringify(doc.location, null, 6)}`);
          }
          
          // Mostrar outros campos relevantes
          const campos = Object.keys(doc);
          const camposRelevantes = campos.filter(campo => 
            !['_id', 'theaterId', 'location'].includes(campo) && 
            typeof doc[campo] !== 'object'
          );
          
          if (camposRelevantes.length > 0) {
            console.log(`     Outros campos: ${camposRelevantes.join(', ')}`);
          }
        });
      }
    }
    
    // Buscar especificamente pelos IDs que você mencionou
    console.log('\n🔍 BUSCANDO IDs ESPECÍFICOS:');
    console.log('=============================');
    
    const idsEspecificos = ['59a47286cfa9a3a73e51e74e', '59a47286cfa9a3a73e51e748'];
    
    for (const id of idsEspecificos) {
      console.log(`\n🔎 Buscando ID: ${id}`);
      
      for (const collectionInfo of collections) {
        const collection = db.collection(collectionInfo.name);
        const doc = await collection.findOne({ _id: id });
        
        if (doc) {
          console.log(`   ✅ Encontrado na coleção: ${collectionInfo.name}`);
          console.log(`   theaterId: ${doc.theaterId}`);
          if (doc.location) {
            console.log(`   location: ${JSON.stringify(doc.location, null, 6)}`);
          }
          break;
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

investigarDados();









