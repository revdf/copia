#!/usr/bin/env node

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: './config-firebase-mongodb.env' });

async function analisarLocationData() {
  let client;
  
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('mansao_do_job');
    
    console.log('📍 ANALISANDO DADOS DE LOCATION:');
    console.log('=================================');
    
    // Analisar a coleção advertisementnews
    const collection = db.collection('advertisementnews');
    
    // Buscar documentos com location como objeto
    const docsComLocation = await collection.find({ 
      location: { $type: 'object' } 
    }).limit(10).toArray();
    
    console.log(`📊 Documentos com location como objeto: ${docsComLocation.length}`);
    
    if (docsComLocation.length > 0) {
      console.log('\n📄 Exemplos de documentos com location:');
      
      docsComLocation.forEach((doc, index) => {
        console.log(`\n  📝 Documento ${index + 1}:`);
        console.log(`     _id: ${doc._id}`);
        
        if (doc.location) {
          console.log(`     location: ${JSON.stringify(doc.location, null, 6)}`);
        }
        
        // Mostrar campos principais
        if (doc.title) console.log(`     title: ${doc.title}`);
        if (doc.category) console.log(`     category: ${doc.category}`);
        if (doc.status) console.log(`     status: ${doc.status}`);
        if (doc.price) console.log(`     price: ${doc.price}`);
      });
    }
    
    // Buscar documentos com theaterId
    const docsComTheaterId = await collection.find({ 
      theaterId: { $exists: true } 
    }).limit(5).toArray();
    
    console.log(`\n🎭 Documentos com theaterId: ${docsComTheaterId.length}`);
    
    if (docsComTheaterId.length > 0) {
      console.log('\n📄 Exemplos de documentos com theaterId:');
      
      docsComTheaterId.forEach((doc, index) => {
        console.log(`\n  📝 Documento ${index + 1}:`);
        console.log(`     _id: ${doc._id}`);
        console.log(`     theaterId: ${doc.theaterId}`);
        
        if (doc.location) {
          console.log(`     location: ${JSON.stringify(doc.location, null, 6)}`);
        }
        
        if (doc.title) console.log(`     title: ${doc.title}`);
        if (doc.category) console.log(`     category: ${doc.category}`);
      });
    }
    
    // Analisar estrutura geral dos documentos
    console.log('\n🔍 ANÁLISE DA ESTRUTURA:');
    console.log('========================');
    
    const sampleDoc = await collection.findOne({});
    if (sampleDoc) {
      console.log('\n📋 Campos disponíveis em um documento de exemplo:');
      const campos = Object.keys(sampleDoc);
      campos.forEach(campo => {
        const tipo = typeof sampleDoc[campo];
        console.log(`   - ${campo}: ${tipo}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

analisarLocationData();









