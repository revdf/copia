#!/usr/bin/env node

// verificar-status-anuncio.js
// Script para verificar status e autorização do anúncio em ambos os bancos

import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { MongoClient } from 'mongodb';

dotenv.config({ path: './config-firebase-mongodb.env' });

console.log("🔍 VERIFICANDO STATUS E AUTORIZAÇÃO DO ANÚNCIO");
console.log("===============================================");

// Inicializar Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });

  console.log("✅ Firebase Admin inicializado com sucesso");
  
  const db = admin.firestore();
  
  async function verificarStatusAnuncio() {
    console.log("\n🔥 VERIFICANDO FIREBASE:");
    console.log("========================");
    
    try {
      // Buscar anúncio no Firebase
      const snapshot = await db.collection('advertisements').get();
      
      if (snapshot.empty) {
        console.log("❌ Nenhum anúncio encontrado no Firebase");
        return;
      }
      
      console.log(`📊 Total de anúncios no Firebase: ${snapshot.docs.length}`);
      
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n📋 Anúncio ${index + 1}:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Nome: ${data.nome || 'N/A'}`);
        console.log(`   Status: ${data.status || 'N/A'}`);
        console.log(`   Categoria: ${data.categoria || 'N/A'}`);
        console.log(`   Cidade: ${data.cidade || 'N/A'}`);
        console.log(`   Estado: ${data.estado || 'N/A'}`);
        console.log(`   Verificação: ${data.verificacao || 'N/A'}`);
        console.log(`   Privacidade: ${data.privacidade || 'N/A'}`);
        console.log(`   Criado: ${data.createdAt ? data.createdAt.toDate() : 'N/A'}`);
        console.log(`   Atualizado: ${data.updatedAt ? data.updatedAt.toDate() : 'N/A'}`);
        
        // Verificar campos de autorização/ativação
        console.log(`\n🔐 CAMPOS DE AUTORIZAÇÃO/ATIVAÇÃO:`);
        console.log(`   Status: ${data.status}`);
        console.log(`   Ativo: ${data.ativo !== undefined ? data.ativo : 'N/A'}`);
        console.log(`   Aprovado: ${data.aprovado !== undefined ? data.aprovado : 'N/A'}`);
        console.log(`   Publicado: ${data.publicado !== undefined ? data.publicado : 'N/A'}`);
        console.log(`   Visível: ${data.visivel !== undefined ? data.visivel : 'N/A'}`);
        console.log(`   Habilitado: ${data.habilitado !== undefined ? data.habilitado : 'N/A'}`);
      });
      
    } catch (error) {
      console.log(`❌ Erro ao verificar Firebase: ${error.message}`);
    }
    
    console.log("\n🍃 VERIFICANDO MONGODB ATLAS:");
    console.log("=============================");
    
    let client;
    try {
      // Conectar ao MongoDB Atlas
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      console.log("✅ MongoDB Atlas conectado com sucesso");
      
      const mongoDb = client.db(process.env.MONGODB_DATABASE);
      const collection = mongoDb.collection('advertisements');
      
      // Buscar anúncios no MongoDB
      const mongoDocs = await collection.find({}).toArray();
      
      if (mongoDocs.length === 0) {
        console.log("❌ Nenhum anúncio encontrado no MongoDB Atlas");
      } else {
        console.log(`📊 Total de anúncios no MongoDB: ${mongoDocs.length}`);
        
        mongoDocs.forEach((doc, index) => {
          console.log(`\n📋 Anúncio ${index + 1}:`);
          console.log(`   ID: ${doc._id}`);
          console.log(`   Firebase ID: ${doc.firebaseId || 'N/A'}`);
          console.log(`   Status: ${doc.status || 'N/A'}`);
          console.log(`   Nome: ${doc.publicInfo?.nome || 'N/A'}`);
          console.log(`   Cidade: ${doc.publicInfo?.cidade || 'N/A'}`);
          console.log(`   Estado: ${doc.publicInfo?.estado || 'N/A'}`);
          console.log(`   Criado: ${doc.createdAt || 'N/A'}`);
          console.log(`   Atualizado: ${doc.updatedAt || 'N/A'}`);
          
          // Verificar campos de autorização/ativação
          console.log(`\n🔐 CAMPOS DE AUTORIZAÇÃO/ATIVAÇÃO:`);
          console.log(`   Status: ${doc.status}`);
          console.log(`   Ativo: ${doc.ativo !== undefined ? doc.ativo : 'N/A'}`);
          console.log(`   Aprovado: ${doc.aprovado !== undefined ? doc.aprovado : 'N/A'}`);
          console.log(`   Publicado: ${doc.publicado !== undefined ? doc.publicado : 'N/A'}`);
          console.log(`   Visível: ${doc.visivel !== undefined ? doc.visivel : 'N/A'}`);
          console.log(`   Habilitado: ${doc.habilitado !== undefined ? doc.habilitado : 'N/A'}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Erro ao verificar MongoDB: ${error.message}`);
    } finally {
      if (client) {
        await client.close();
      }
    }
    
    console.log("\n🎯 ANÁLISE DE PROBLEMAS POSSÍVEIS:");
    console.log("===================================");
    console.log("1. ✅ Verificar se status = 'active' em ambos os bancos");
    console.log("2. ✅ Verificar se não há campos de bloqueio (ativo: false)");
    console.log("3. ✅ Verificar se categoria está correta");
    console.log("4. ✅ Verificar se dados estão sendo filtrados na API");
    console.log("5. ✅ Verificar se frontend está fazendo requisição correta");
    
    console.log("\n🔧 POSSÍVEIS SOLUÇÕES:");
    console.log("======================");
    console.log("• Se status não for 'active', atualizar para 'active'");
    console.log("• Se houver campos de bloqueio, remover ou definir como true");
    console.log("• Verificar filtros na API (categoria, status, etc.)");
    console.log("• Verificar se frontend está acessando endpoint correto");
  }
  
  verificarStatusAnuncio().then(() => {
    console.log("\n🎉 Verificação concluída!");
    process.exit(0);
  }).catch(error => {
    console.log(`❌ Erro: ${error.message}`);
    process.exit(1);
  });
  
} catch (error) {
  console.log(`❌ Erro ao inicializar Firebase: ${error.message}`);
  process.exit(1);
}









