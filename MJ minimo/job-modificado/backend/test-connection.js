#!/usr/bin/env node

// test-connection.js
// Script para testar conexões Firebase e MongoDB

import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { MongoClient } from 'mongodb';

dotenv.config({ path: './config-firebase-mongodb.env' });

console.log("🔍 TESTANDO CONEXÕES");
console.log("===================");

// Testar Firebase
console.log("\n🔥 TESTANDO FIREBASE:");
console.log(`Project ID: ${process.env.FIREBASE_PROJECT_ID}`);

try {
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

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });

  console.log("✅ Firebase Admin inicializado com sucesso");
  
  // Testar conexão com Firestore
  const db = admin.firestore();
  console.log("✅ Firestore conectado");
  
} catch (error) {
  console.log("❌ Erro Firebase:", error.message);
}

// Testar MongoDB
console.log("\n🍃 TESTANDO MONGODB:");
console.log(`URI: ${process.env.MONGODB_URI ? 'Configurada' : 'Não configurada'}`);

try {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  console.log("✅ MongoDB conectado");
  
  // Testar database
  const db = client.db(process.env.MONGODB_DATABASE);
  const collections = await db.listCollections().toArray();
  console.log(`✅ Database '${process.env.MONGODB_DATABASE}' acessível`);
  console.log(`📊 Collections encontradas: ${collections.length}`);
  
  await client.close();
  
} catch (error) {
  console.log("❌ Erro MongoDB:", error.message);
}

console.log("\n🎯 TESTE CONCLUÍDO");