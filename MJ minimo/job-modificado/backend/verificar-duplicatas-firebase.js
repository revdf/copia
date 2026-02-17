#!/usr/bin/env node

/**
 * Script para verificar dados duplicados no Firebase
 */

import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './config-firebase-mongodb.env' });

// Configuração do Firebase
const firebaseServiceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
  });
  
  console.log("✅ Firebase Admin SDK inicializado");
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

const db = admin.firestore();

async function verificarDuplicatas() {
  try {
    console.log("\n🔍 VERIFICANDO DADOS DUPLICADOS NO FIREBASE:");
    console.log("=============================================");
    
    // Verificar anúncios duplicados
    const anunciosSnapshot = await db.collection('anuncios').get();
    const anuncios = [];
    
    anunciosSnapshot.forEach(doc => {
      const data = doc.data();
      anuncios.push({
        id: doc.id,
        nome: data.nome,
        email: data.email,
        userId: data.userId,
        categoria: data.categoria,
        createdAt: data.createdAt
      });
    });
    
    console.log(`\n📊 Total de anúncios: ${anuncios.length}`);
    
    // Verificar duplicatas por nome e email
    const duplicatas = [];
    const nomesEmails = new Map();
    
    anuncios.forEach(anuncio => {
      const chave = `${anuncio.nome}-${anuncio.email}`;
      
      if (nomesEmails.has(chave)) {
        duplicatas.push({
          tipo: 'nome-email',
          chave: chave,
          anuncios: [nomesEmails.get(chave), anuncio]
        });
      } else {
        nomesEmails.set(chave, anuncio);
      }
    });
    
    // Verificar duplicatas por userId
    const userIds = new Map();
    anuncios.forEach(anuncio => {
      if (anuncio.userId) {
        if (userIds.has(anuncio.userId)) {
          duplicatas.push({
            tipo: 'userId',
            chave: anuncio.userId,
            anuncios: [userIds.get(anuncio.userId), anuncio]
          });
        } else {
          userIds.set(anuncio.userId, anuncio);
        }
      }
    });
    
    // Mostrar resultados
    if (duplicatas.length > 0) {
      console.log(`\n⚠️ DUPLICATAS ENCONTRADAS: ${duplicatas.length}`);
      console.log("=====================================");
      
      duplicatas.forEach((dup, index) => {
        console.log(`\n${index + 1}. Tipo: ${dup.tipo}`);
        console.log(`   Chave: ${dup.chave}`);
        console.log(`   Anúncios duplicados:`);
        
        dup.anuncios.forEach(anuncio => {
          console.log(`     - ID: ${anuncio.id}`);
          console.log(`       Nome: ${anuncio.nome}`);
          console.log(`       Email: ${anuncio.email}`);
          console.log(`       Categoria: ${anuncio.categoria}`);
          console.log(`       Criado em: ${anuncio.createdAt}`);
        });
      });
      
      // Sugestões de limpeza
      console.log(`\n🧹 SUGESTÕES DE LIMPEZA:`);
      console.log("========================");
      
      duplicatas.forEach((dup, index) => {
        console.log(`\n${index + 1}. Para ${dup.tipo}:`);
        if (dup.tipo === 'nome-email') {
          console.log(`   - Manter apenas o anúncio mais recente`);
          console.log(`   - Deletar: ${dup.anuncios[0].id}`);
        } else if (dup.tipo === 'userId') {
          console.log(`   - Verificar se são realmente duplicatas`);
          console.log(`   - Considerar mesclar dados se necessário`);
        }
      });
      
    } else {
      console.log(`\n✅ NENHUMA DUPLICATA ENCONTRADA!`);
    }
    
    // Verificar dados de teste
    const testSnapshot = await db.collection('test').get();
    console.log(`\n🧪 Dados de teste: ${testSnapshot.size} documentos`);
    
    if (testSnapshot.size > 0) {
      console.log("   (Estes podem ser removidos se não forem necessários)");
    }
    
  } catch (error) {
    console.error("❌ Erro ao verificar duplicatas:", error.message);
  }
}

verificarDuplicatas();
