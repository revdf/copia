#!/usr/bin/env node

/**
 * Investigação de Discrepância: Storage vs Firestore
 * Analisa por que há mais pastas no Storage do que clientes no Firestore
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
const storage = admin.storage();

class InvestigacaoDiscrepancia {
  constructor() {
    this.pastasStorage = [];
    this.clientesFirestore = [];
    this.arquivosOrfaos = [];
  }

  /**
   * Lista todas as pastas no Firebase Storage
   */
  async listarPastasStorage() {
    console.log("\n📁 INVESTIGANDO PASTAS NO FIREBASE STORAGE:");
    console.log("=============================================");
    
    try {
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({ prefix: 'anuncios/' });
      
      // Extrair IDs únicos das pastas
      const pastasUnicas = new Set();
      
      files.forEach(file => {
        const pathParts = file.name.split('/');
        if (pathParts.length >= 2) {
          const pastaId = pathParts[1]; // anuncios/PASTA_ID/arquivo
          pastasUnicas.add(pastaId);
        }
      });
      
      this.pastasStorage = Array.from(pastasUnicas);
      
      console.log(`📊 Total de pastas encontradas: ${this.pastasStorage.length}`);
      console.log("📋 Lista de pastas:");
      this.pastasStorage.forEach((pasta, index) => {
        console.log(`   ${index + 1}. ${pasta}`);
      });
      
      return this.pastasStorage;
      
    } catch (error) {
      console.error("❌ Erro ao listar pastas do Storage:", error.message);
      return [];
    }
  }

  /**
   * Lista todos os clientes no Firestore
   */
  async listarClientesFirestore() {
    console.log("\n👥 INVESTIGANDO CLIENTES NO FIRESTORE:");
    console.log("======================================");
    
    try {
      // Verificar coleção 'anuncios'
      const anunciosSnapshot = await db.collection('anuncios').get();
      const anuncios = [];
      
      anunciosSnapshot.forEach(doc => {
        anuncios.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Verificar coleção 'advertisers' (se existir)
      let advertisers = [];
      try {
        const advertisersSnapshot = await db.collection('advertisers').get();
        advertisersSnapshot.forEach(doc => {
          advertisers.push({
            id: doc.id,
            ...doc.data()
          });
        });
      } catch (error) {
        console.log("ℹ️ Coleção 'advertisers' não encontrada");
      }
      
      // Verificar coleção 'clients' (se existir)
      let clients = [];
      try {
        const clientsSnapshot = await db.collection('clients').get();
        clientsSnapshot.forEach(doc => {
          clients.push({
            id: doc.id,
            ...doc.data()
          });
        });
      } catch (error) {
        console.log("ℹ️ Coleção 'clients' não encontrada");
      }
      
      this.clientesFirestore = {
        anuncios: anuncios,
        advertisers: advertisers,
        clients: clients
      };
      
      console.log(`📊 Anúncios encontrados: ${anuncios.length}`);
      console.log(`📊 Advertisers encontrados: ${advertisers.length}`);
      console.log(`📊 Clients encontrados: ${clients.length}`);
      
      console.log("\n📋 Lista de anúncios:");
      anuncios.forEach((anuncio, index) => {
        console.log(`   ${index + 1}. ID: ${anuncio.id}`);
        console.log(`      Nome: ${anuncio.nome || 'N/A'}`);
        console.log(`      Email: ${anuncio.email || 'N/A'}`);
        console.log(`      Categoria: ${anuncio.categoria || 'N/A'}`);
        console.log(`      Criado em: ${anuncio.createdAt || 'N/A'}`);
        console.log("");
      });
      
      return this.clientesFirestore;
      
    } catch (error) {
      console.error("❌ Erro ao listar clientes do Firestore:", error.message);
      return { anuncios: [], advertisers: [], clients: [] };
    }
  }

  /**
   * Identifica arquivos órfãos no Storage
   */
  async identificarArquivosOrfaos() {
    console.log("\n🔍 IDENTIFICANDO ARQUIVOS ÓRFÃOS:");
    console.log("==================================");
    
    try {
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({ prefix: 'anuncios/' });
      
      // Coletar IDs válidos do Firestore
      const idsValidos = new Set();
      
      // IDs dos anúncios
      this.clientesFirestore.anuncios.forEach(anuncio => {
        idsValidos.add(anuncio.id);
      });
      
      // IDs dos advertisers
      this.clientesFirestore.advertisers.forEach(advertiser => {
        idsValidos.add(advertiser.id);
      });
      
      // IDs dos clients
      this.clientesFirestore.clients.forEach(client => {
        idsValidos.add(client.id);
      });
      
      console.log(`📊 IDs válidos encontrados: ${idsValidos.size}`);
      
      // Verificar cada pasta no Storage
      const pastasOrfaos = [];
      const arquivosOrfaos = [];
      
      this.pastasStorage.forEach(pastaId => {
        if (!idsValidos.has(pastaId)) {
          pastasOrfaos.push(pastaId);
          
          // Listar arquivos nesta pasta órfã
          const arquivosPasta = files.filter(file => 
            file.name.startsWith(`anuncios/${pastaId}/`)
          );
          
          arquivosPasta.forEach(arquivo => {
            arquivosOrfaos.push({
              nome: arquivo.name,
              tamanho: arquivo.metadata?.size || 0,
              pasta: pastaId
            });
          });
        }
      });
      
      this.arquivosOrfaos = arquivosOrfaos;
      
      console.log(`🚨 Pastas órfãs encontradas: ${pastasOrfaos.length}`);
      console.log(`🚨 Arquivos órfãos encontrados: ${arquivosOrfaos.length}`);
      
      if (pastasOrfaos.length > 0) {
        console.log("\n📋 Pastas órfãs:");
        pastasOrfaos.forEach((pasta, index) => {
          console.log(`   ${index + 1}. ${pasta}`);
        });
        
        console.log("\n📋 Arquivos órfãos:");
        arquivosOrfaos.forEach((arquivo, index) => {
          const tamanhoMB = (arquivo.tamanho / (1024 * 1024)).toFixed(2);
          console.log(`   ${index + 1}. ${arquivo.nome}`);
          console.log(`      Tamanho: ${tamanhoMB} MB`);
          console.log(`      Pasta: ${arquivo.pasta}`);
        });
      }
      
      return {
        pastasOrfaos,
        arquivosOrfaos,
        totalTamanhoOrfaos: arquivosOrfaos.reduce((total, arquivo) => total + arquivo.tamanho, 0)
      };
      
    } catch (error) {
      console.error("❌ Erro ao identificar arquivos órfãos:", error.message);
      return { pastasOrfaos: [], arquivosOrfaos: [], totalTamanhoOrfaos: 0 };
    }
  }

  /**
   * Analisa possíveis causas da discrepância
   */
  analisarCausasDiscrepancia() {
    console.log("\n🔍 ANÁLISE DAS POSSÍVEIS CAUSAS:");
    console.log("=================================");
    
    const totalPastas = this.pastasStorage.length;
    const totalAnuncios = this.clientesFirestore.anuncios.length;
    const totalAdvertisers = this.clientesFirestore.advertisers.length;
    const totalClients = this.clientesFirestore.clients.length;
    const totalClientes = totalAnuncios + totalAdvertisers + totalClients;
    
    console.log(`📊 Resumo:`);
    console.log(`   - Pastas no Storage: ${totalPastas}`);
    console.log(`   - Anúncios no Firestore: ${totalAnuncios}`);
    console.log(`   - Advertisers no Firestore: ${totalAdvertisers}`);
    console.log(`   - Clients no Firestore: ${totalClients}`);
    console.log(`   - Total de clientes: ${totalClientes}`);
    console.log(`   - Discrepância: ${totalPastas - totalClientes}`);
    
    console.log("\n🔍 Possíveis causas:");
    
    if (totalPastas > totalClientes) {
      console.log("1. 🗑️ ARQUIVOS ÓRFÃOS:");
      console.log("   - Arquivos foram enviados mas o registro foi deletado");
      console.log("   - Falha no processo de limpeza");
      console.log("   - Testes que criaram arquivos mas não registros");
      
      console.log("\n2. 🔄 PROCESSO INCOMPLETO:");
      console.log("   - Upload de arquivos foi feito mas salvamento no Firestore falhou");
      console.log("   - Interrupção durante o processo de cadastro");
      console.log("   - Erro de validação que impediu salvamento");
      
      console.log("\n3. 🧪 DADOS DE TESTE:");
      console.log("   - Arquivos criados durante testes");
      console.log("   - Cadastros de teste que foram removidos");
      console.log("   - Desenvolvimento e testes");
    } else if (totalPastas < totalClientes) {
      console.log("1. 📁 ARQUIVOS FALTANDO:");
      console.log("   - Registros criados mas arquivos não enviados");
      console.log("   - Falha no upload de mídia");
      console.log("   - Cadastros sem fotos/vídeos");
    } else {
      console.log("✅ Números coincidem perfeitamente!");
    }
  }

  /**
   * Sugere ações de limpeza
   */
  sugerirAcoesLimpeza() {
    console.log("\n🧹 SUGESTÕES DE LIMPEZA:");
    console.log("========================");
    
    if (this.arquivosOrfaos.length > 0) {
      const totalTamanhoMB = (this.arquivosOrfaos.reduce((total, arquivo) => total + arquivo.tamanho, 0) / (1024 * 1024)).toFixed(2);
      
      console.log("1. 🗑️ LIMPAR ARQUIVOS ÓRFÃOS:");
      console.log(`   - ${this.arquivosOrfaos.length} arquivos órfãos`);
      console.log(`   - ${totalTamanhoMB} MB de espaço ocupado`);
      console.log("   - Recomendado: Remover para liberar espaço");
      
      console.log("\n2. 📊 VERIFICAR REGISTROS:");
      console.log("   - Verificar se há registros sem arquivos");
      console.log("   - Validar integridade dos dados");
      console.log("   - Corrigir inconsistências");
      
      console.log("\n3. 🛡️ IMPLEMENTAR LIMPEZA AUTOMÁTICA:");
      console.log("   - Script para remover arquivos órfãos");
      console.log("   - Validação antes de criar novos arquivos");
      console.log("   - Monitoramento de integridade");
    } else {
      console.log("✅ Nenhuma ação de limpeza necessária!");
    }
  }

  /**
   * Executa investigação completa
   */
  async executarInvestigacao() {
    console.log("🔍 INICIANDO INVESTIGAÇÃO DE DISCREPÂNCIA");
    console.log("=========================================");
    
    try {
      // 1. Listar pastas no Storage
      await this.listarPastasStorage();
      
      // 2. Listar clientes no Firestore
      await this.listarClientesFirestore();
      
      // 3. Identificar arquivos órfãos
      const orfaos = await this.identificarArquivosOrfaos();
      
      // 4. Analisar causas
      this.analisarCausasDiscrepancia();
      
      // 5. Sugerir ações
      this.sugerirAcoesLimpeza();
      
      // Resumo final
      console.log("\n📊 RESUMO FINAL:");
      console.log("================");
      console.log(`📁 Pastas no Storage: ${this.pastasStorage.length}`);
      console.log(`👥 Total de clientes: ${this.clientesFirestore.anuncios.length + this.clientesFirestore.advertisers.length + this.clientesFirestore.clients.length}`);
      console.log(`🚨 Arquivos órfãos: ${orfaos.arquivosOrfaos.length}`);
      console.log(`💾 Espaço ocupado por órfãos: ${(orfaos.totalTamanhoOrfaos / (1024 * 1024)).toFixed(2)} MB`);
      
    } catch (error) {
      console.error("❌ Erro na investigação:", error.message);
    }
  }
}

// Executar investigação
async function executarInvestigacao() {
  const investigacao = new InvestigacaoDiscrepancia();
  await investigacao.executarInvestigacao();
}

executarInvestigacao();
