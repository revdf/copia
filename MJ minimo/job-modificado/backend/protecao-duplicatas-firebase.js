#!/usr/bin/env node

/**
 * Script para implementar proteção contra duplicatas no Firebase
 * - Sobrescrita por email
 * - Rate limiting
 * - Validação de integridade
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

// Cache para rate limiting (em produção, usar Redis)
const rateLimitCache = new Map();

/**
 * Verifica se o usuário pode criar um novo anúncio
 * @param {string} email - Email do usuário
 * @param {string} userId - ID do usuário
 * @returns {Object} - Resultado da verificação
 */
async function verificarPermissaoCadastro(email, userId) {
  try {
    console.log(`🔍 Verificando permissão para: ${email}`);
    
    // 1. Rate Limiting - Máximo 3 tentativas por hora
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000); // 1 hora atrás
    
    const userKey = `${email}-${userId}`;
    const userAttempts = rateLimitCache.get(userKey) || [];
    
    // Remove tentativas antigas
    const recentAttempts = userAttempts.filter(time => time > hourAgo);
    
    if (recentAttempts.length >= 3) {
      return {
        permitido: false,
        motivo: 'RATE_LIMIT',
        mensagem: 'Muitas tentativas. Aguarde 1 hora antes de tentar novamente.',
        tentativasRestantes: 0
      };
    }
    
    // 2. Verificar se já existe anúncio com este email
    const anunciosSnapshot = await db.collection('anuncios')
      .where('email', '==', email)
      .get();
    
    if (!anunciosSnapshot.empty) {
      // Encontrou anúncio existente - permitir sobrescrita
      const anuncioExistente = anunciosSnapshot.docs[0];
      return {
        permitido: true,
        sobrescrever: true,
        documentoId: anuncioExistente.id,
        mensagem: 'Anúncio existente será atualizado.',
        tentativasRestantes: 3 - recentAttempts.length
      };
    }
    
    // 3. Verificar se já existe anúncio com este userId
    const userIdSnapshot = await db.collection('anuncios')
      .where('userId', '==', userId)
      .get();
    
    if (!userIdSnapshot.empty) {
      const anuncioExistente = userIdSnapshot.docs[0];
      return {
        permitido: true,
        sobrescrever: true,
        documentoId: anuncioExistente.id,
        mensagem: 'Anúncio existente será atualizado.',
        tentativasRestantes: 3 - recentAttempts.length
      };
    }
    
    // 4. Novo anúncio permitido
    return {
      permitido: true,
      sobrescrever: false,
      mensagem: 'Novo anúncio será criado.',
      tentativasRestantes: 3 - recentAttempts.length
    };
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
    return {
      permitido: false,
      motivo: 'ERROR',
      mensagem: 'Erro interno. Tente novamente.',
      tentativasRestantes: 0
    };
  }
}

/**
 * Registra tentativa de cadastro para rate limiting
 * @param {string} email - Email do usuário
 * @param {string} userId - ID do usuário
 */
function registrarTentativa(email, userId) {
  const userKey = `${email}-${userId}`;
  const now = Date.now();
  
  const userAttempts = rateLimitCache.get(userKey) || [];
  userAttempts.push(now);
  
  rateLimitCache.set(userKey, userAttempts);
  
  console.log(`📝 Tentativa registrada para: ${email}`);
}

/**
 * Salva ou atualiza anúncio com proteção contra duplicatas
 * @param {Object} dadosAnuncio - Dados do anúncio
 * @returns {Object} - Resultado da operação
 */
async function salvarAnuncioComProtecao(dadosAnuncio) {
  try {
    const { email, userId } = dadosAnuncio;
    
    // Verificar permissão
    const verificacao = await verificarPermissaoCadastro(email, userId);
    
    if (!verificacao.permitido) {
      return {
        sucesso: false,
        erro: verificacao.motivo,
        mensagem: verificacao.mensagem,
        tentativasRestantes: verificacao.tentativasRestantes
      };
    }
    
    // Registrar tentativa
    registrarTentativa(email, userId);
    
    // Preparar dados com timestamp
    const dadosCompletos = {
      ...dadosAnuncio,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      versao: 1
    };
    
    let resultado;
    
    if (verificacao.sobrescrever) {
      // Atualizar anúncio existente
      console.log(`🔄 Atualizando anúncio existente: ${verificacao.documentoId}`);
      
      await db.collection('anuncios').doc(verificacao.documentoId).update({
        ...dadosCompletos,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        versao: admin.firestore.FieldValue.increment(1)
      });
      
      resultado = {
        sucesso: true,
        acao: 'ATUALIZADO',
        documentoId: verificacao.documentoId,
        mensagem: 'Anúncio atualizado com sucesso!'
      };
      
    } else {
      // Criar novo anúncio
      console.log(`✨ Criando novo anúncio`);
      
      const docRef = await db.collection('anuncios').add(dadosCompletos);
      
      resultado = {
        sucesso: true,
        acao: 'CRIADO',
        documentoId: docRef.id,
        mensagem: 'Anúncio criado com sucesso!'
      };
    }
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Erro ao salvar anúncio:', error.message);
    return {
      sucesso: false,
      erro: 'SAVE_ERROR',
      mensagem: 'Erro ao salvar. Tente novamente.',
      tentativasRestantes: 0
    };
  }
}

/**
 * Função para testar a proteção
 */
async function testarProtecao() {
  console.log("\n🧪 TESTANDO PROTEÇÃO CONTRA DUPLICATAS:");
  console.log("========================================");
  
  // Teste 1: Novo usuário
  console.log("\n1️⃣ Teste: Novo usuário");
  const resultado1 = await salvarAnuncioComProtecao({
    nome: "João Teste",
    email: "joao@teste.com",
    userId: "user123",
    categoria: "acompanhantes"
  });
  console.log("Resultado:", resultado1);
  
  // Teste 2: Mesmo usuário (deve sobrescrever)
  console.log("\n2️⃣ Teste: Mesmo usuário (sobrescrita)");
  const resultado2 = await salvarAnuncioComProtecao({
    nome: "João Teste Atualizado",
    email: "joao@teste.com",
    userId: "user123",
    categoria: "acompanhantes"
  });
  console.log("Resultado:", resultado2);
  
  // Teste 3: Rate limiting
  console.log("\n3️⃣ Teste: Rate limiting");
  for (let i = 0; i < 5; i++) {
    const resultado = await salvarAnuncioComProtecao({
      nome: "Spam Test",
      email: "spam@teste.com",
      userId: "spam123",
      categoria: "acompanhantes"
    });
    console.log(`Tentativa ${i + 1}:`, resultado.mensagem);
  }
}

// Executar teste
testarProtecao();
