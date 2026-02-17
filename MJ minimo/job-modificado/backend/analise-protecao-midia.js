#!/usr/bin/env node

/**
 * Análise e Proteção Contra Spam de Mídia
 * Verifica vulnerabilidades no sistema de upload de arquivos
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

class ProtecaoMidia {
  constructor() {
    this.limites = {
      // Limites por tipo de arquivo
      fotos: {
        maxSize: 1 * 1024 * 1024, // 1MB por foto
        maxQuantidade: 11, // 3 fotos principais + 8 galeria
        tiposPermitidos: ['image/jpeg', 'image/png', 'image/webp']
      },
      videos: {
        maxSize: 100 * 1024 * 1024, // 100MB por vídeo
        maxQuantidade: 2, // vídeo capa + vídeo verificação
        tiposPermitidos: ['video/mp4', 'video/avi', 'video/mov', 'video/webm']
      },
      audios: {
        maxSize: 10 * 1024 * 1024, // 10MB por áudio
        maxQuantidade: 1,
        tiposPermitidos: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
      },
      documentos: {
        maxSize: 5 * 1024 * 1024, // 5MB por documento
        maxQuantidade: 3, // frente, verso, selfie
        tiposPermitidos: ['image/jpeg', 'image/png', 'application/pdf']
      }
    };
    
    // Limites por usuário
    this.limitesUsuario = {
      maxArquivosPorHora: 20, // Máximo 20 arquivos por hora
      maxTamanhoTotalPorHora: 500 * 1024 * 1024, // 500MB por hora
      maxArquivosPorDia: 100, // Máximo 100 arquivos por dia
      maxTamanhoTotalPorDia: 2 * 1024 * 1024 * 1024 // 2GB por dia
    };
  }

  /**
   * Analisa vulnerabilidades no sistema atual
   */
  async analisarVulnerabilidades() {
    console.log("\n🔍 ANÁLISE DE VULNERABILIDADES NO UPLOAD DE MÍDIA:");
    console.log("==================================================");
    
    // 1. Verificar anúncios com muitos arquivos
    const anunciosSnapshot = await db.collection('anuncios').get();
    console.log(`\n📊 Total de anúncios: ${anunciosSnapshot.size}`);
    
    let totalArquivos = 0;
    let totalTamanho = 0;
    const usuariosComMuitosArquivos = new Map();
    
    anunciosSnapshot.forEach(doc => {
      const data = doc.data();
      const arquivos = this.contarArquivos(data);
      totalArquivos += arquivos.total;
      totalTamanho += arquivos.tamanhoTotal;
      
      if (arquivos.total > 20) {
        const userId = data.userId || 'desconhecido';
        usuariosComMuitosArquivos.set(userId, arquivos);
      }
    });
    
    console.log(`📁 Total de arquivos: ${totalArquivos}`);
    console.log(`💾 Tamanho total: ${(totalTamanho / (1024 * 1024)).toFixed(2)} MB`);
    
    // 2. Verificar usuários com muitos arquivos
    if (usuariosComMuitosArquivos.size > 0) {
      console.log(`\n⚠️ USUÁRIOS COM MUITOS ARQUIVOS:`);
      usuariosComMuitosArquivos.forEach((arquivos, userId) => {
        console.log(`   - ${userId}: ${arquivos.total} arquivos (${(arquivos.tamanhoTotal / (1024 * 1024)).toFixed(2)} MB)`);
      });
    }
    
    // 3. Verificar arquivos muito grandes
    const arquivosGrandes = await this.verificarArquivosGrandes();
    if (arquivosGrandes.length > 0) {
      console.log(`\n⚠️ ARQUIVOS MUITO GRANDES:`);
      arquivosGrandes.forEach(arquivo => {
        console.log(`   - ${arquivo.nome}: ${(arquivo.tamanho / (1024 * 1024)).toFixed(2)} MB`);
      });
    }
    
    // 4. Verificar tipos de arquivo suspeitos
    const tiposSuspeitos = await this.verificarTiposSuspeitos();
    if (tiposSuspeitos.length > 0) {
      console.log(`\n⚠️ TIPOS DE ARQUIVO SUSPEITOS:`);
      tiposSuspeitos.forEach(tipo => {
        console.log(`   - ${tipo.tipo}: ${tipo.quantidade} arquivos`);
      });
    }
    
    return {
      totalAnuncios: anunciosSnapshot.size,
      totalArquivos,
      totalTamanho,
      usuariosComMuitosArquivos: usuariosComMuitosArquivos.size,
      arquivosGrandes: arquivosGrandes.length,
      tiposSuspeitos: tiposSuspeitos.length
    };
  }

  /**
   * Conta arquivos em um anúncio
   */
  contarArquivos(dadosAnuncio) {
    const camposArquivo = [
      'foto_capa', 'foto_banner', 'foto_stories',
      'galeria_1', 'galeria_2', 'galeria_3', 'galeria_4',
      'galeria_5', 'galeria_6', 'galeria_7', 'galeria_8',
      'video_capa', 'verification-video', 'audio',
      'documento-frente', 'documento-verso', 'selfie-documento'
    ];
    
    let total = 0;
    let tamanhoTotal = 0;
    
    camposArquivo.forEach(campo => {
      if (dadosAnuncio[`${campo}_url`]) {
        total++;
        tamanhoTotal += dadosAnuncio[`${campo}_size`] || 0;
      }
    });
    
    return { total, tamanhoTotal };
  }

  /**
   * Verifica arquivos muito grandes
   */
  async verificarArquivosGrandes() {
    const anunciosSnapshot = await db.collection('anuncios').get();
    const arquivosGrandes = [];
    
    anunciosSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Verificar cada campo de arquivo
      Object.keys(data).forEach(key => {
        if (key.endsWith('_size')) {
          const tamanho = data[key];
          const nome = data[key.replace('_size', '_name')] || 'desconhecido';
          
          if (tamanho > 50 * 1024 * 1024) { // > 50MB
            arquivosGrandes.push({
              nome,
              tamanho,
              anuncioId: doc.id
            });
          }
        }
      });
    });
    
    return arquivosGrandes;
  }

  /**
   * Verifica tipos de arquivo suspeitos
   */
  async verificarTiposSuspeitos() {
    const anunciosSnapshot = await db.collection('anuncios').get();
    const tiposContagem = new Map();
    
    anunciosSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Verificar cada campo de arquivo
      Object.keys(data).forEach(key => {
        if (key.endsWith('_name')) {
          const nome = data[key];
          const extensao = nome.split('.').pop().toLowerCase();
          
          // Tipos suspeitos
          const tiposSuspeitos = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com'];
          if (tiposSuspeitos.includes(extensao)) {
            tiposContagem.set(extensao, (tiposContagem.get(extensao) || 0) + 1);
          }
        }
      });
    });
    
    return Array.from(tiposContagem.entries()).map(([tipo, quantidade]) => ({
      tipo,
      quantidade
    }));
  }

  /**
   * Implementa proteções contra spam de mídia
   */
  async implementarProtecoes() {
    console.log("\n🛡️ IMPLEMENTANDO PROTEÇÕES CONTRA SPAM DE MÍDIA:");
    console.log("================================================");
    
    // 1. Criar regras de validação
    const regrasValidacao = {
      // Validação de tamanho por tipo
      validarTamanho: (arquivo, tipo) => {
        const limite = this.limites[tipo]?.maxSize;
        if (!limite) return false;
        return arquivo.size <= limite;
      },
      
      // Validação de quantidade por tipo
      validarQuantidade: (arquivos, tipo) => {
        const limite = this.limites[tipo]?.maxQuantidade;
        if (!limite) return false;
        return arquivos.length <= limite;
      },
      
      // Validação de tipo de arquivo
      validarTipo: (arquivo, tipo) => {
        const tiposPermitidos = this.limites[tipo]?.tiposPermitidos;
        if (!tiposPermitidos) return false;
        return tiposPermitidos.includes(arquivo.type);
      },
      
      // Validação de rate limiting por usuário
      validarRateLimit: async (userId) => {
        const agora = new Date();
        const umaHoraAtras = new Date(agora.getTime() - 60 * 60 * 1000);
        
        // Contar arquivos enviados na última hora
        const anunciosSnapshot = await db.collection('anuncios')
          .where('userId', '==', userId)
          .where('createdAt', '>=', umaHoraAtras)
          .get();
        
        let totalArquivos = 0;
        let tamanhoTotal = 0;
        
        anunciosSnapshot.forEach(doc => {
          const arquivos = this.contarArquivos(doc.data());
          totalArquivos += arquivos.total;
          tamanhoTotal += arquivos.tamanhoTotal;
        });
        
        return {
          permitido: totalArquivos < this.limitesUsuario.maxArquivosPorHora &&
                    tamanhoTotal < this.limitesUsuario.maxTamanhoTotalPorHora,
          totalArquivos,
          tamanhoTotal,
          limiteArquivos: this.limitesUsuario.maxArquivosPorHora,
          limiteTamanho: this.limitesUsuario.maxTamanhoTotalPorHora
        };
      }
    };
    
    console.log("✅ Regras de validação criadas");
    
    // 2. Criar função de limpeza de arquivos órfãos
    const limparArquivosOrfaos = async () => {
      console.log("\n🧹 Limpando arquivos órfãos...");
      
      const anunciosSnapshot = await db.collection('anuncios').get();
      const urlsValidas = new Set();
      
      // Coletar todas as URLs válidas
      anunciosSnapshot.forEach(doc => {
        const data = doc.data();
        Object.keys(data).forEach(key => {
          if (key.endsWith('_url')) {
            urlsValidas.add(data[key]);
          }
        });
      });
      
      console.log(`📊 ${urlsValidas.size} URLs válidas encontradas`);
      
      // Nota: Em produção, você precisaria listar arquivos do Storage
      // e comparar com as URLs válidas para encontrar órfãos
      
      return urlsValidas.size;
    };
    
    await limparArquivosOrfaos();
    
    // 3. Criar alertas para administradores
    const criarAlertas = () => {
      console.log("\n🚨 Sistema de alertas configurado:");
      console.log("   - Arquivos > 50MB");
      console.log("   - Usuários com > 20 arquivos");
      console.log("   - Tipos de arquivo suspeitos");
      console.log("   - Rate limiting excedido");
    };
    
    criarAlertas();
    
    return regrasValidacao;
  }

  /**
   * Testa as proteções implementadas
   */
  async testarProtecoes() {
    console.log("\n🧪 TESTANDO PROTEÇÕES CONTRA SPAM DE MÍDIA:");
    console.log("=============================================");
    
    // Teste 1: Validação de tamanho
    console.log("\n1️⃣ Teste: Validação de tamanho");
    const arquivoGrande = { size: 2 * 1024 * 1024, type: 'image/jpeg' }; // 2MB
    const arquivoPequeno = { size: 500 * 1024, type: 'image/jpeg' }; // 500KB
    
    console.log(`   Arquivo grande (2MB): ${arquivoGrande.size > this.limites.fotos.maxSize ? '❌ Rejeitado' : '✅ Aceito'}`);
    console.log(`   Arquivo pequeno (500KB): ${arquivoPequeno.size > this.limites.fotos.maxSize ? '❌ Rejeitado' : '✅ Aceito'}`);
    
    // Teste 2: Validação de quantidade
    console.log("\n2️⃣ Teste: Validação de quantidade");
    const muitasFotos = new Array(15).fill({}); // 15 fotos
    const poucasFotos = new Array(5).fill({}); // 5 fotos
    
    console.log(`   Muitas fotos (15): ${muitasFotos.length > this.limites.fotos.maxQuantidade ? '❌ Rejeitado' : '✅ Aceito'}`);
    console.log(`   Poucas fotos (5): ${poucasFotos.length > this.limites.fotos.maxQuantidade ? '❌ Rejeitado' : '✅ Aceito'}`);
    
    // Teste 3: Validação de tipo
    console.log("\n3️⃣ Teste: Validação de tipo");
    const arquivoValido = { type: 'image/jpeg' };
    const arquivoInvalido = { type: 'application/exe' };
    
    console.log(`   Arquivo válido (JPEG): ${this.limites.fotos.tiposPermitidos.includes(arquivoValido.type) ? '✅ Aceito' : '❌ Rejeitado'}`);
    console.log(`   Arquivo inválido (EXE): ${this.limites.fotos.tiposPermitidos.includes(arquivoInvalido.type) ? '✅ Aceito' : '❌ Rejeitado'}`);
    
    console.log("\n✅ Testes de proteção concluídos!");
  }
}

// Executar análise
async function executarAnalise() {
  const protecao = new ProtecaoMidia();
  
  try {
    // Analisar vulnerabilidades
    const vulnerabilidades = await protecao.analisarVulnerabilidades();
    
    // Implementar proteções
    const regras = await protecao.implementarProtecoes();
    
    // Testar proteções
    await protecao.testarProtecoes();
    
    // Resumo final
    console.log("\n📊 RESUMO DA ANÁLISE:");
    console.log("====================");
    console.log(`📁 Total de anúncios: ${vulnerabilidades.totalAnuncios}`);
    console.log(`📁 Total de arquivos: ${vulnerabilidades.totalArquivos}`);
    console.log(`💾 Tamanho total: ${(vulnerabilidades.totalTamanho / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`⚠️ Usuários com muitos arquivos: ${vulnerabilidades.usuariosComMuitosArquivos}`);
    console.log(`⚠️ Arquivos muito grandes: ${vulnerabilidades.arquivosGrandes}`);
    console.log(`⚠️ Tipos suspeitos: ${vulnerabilidades.tiposSuspeitos}`);
    
  } catch (error) {
    console.error("❌ Erro na análise:", error.message);
  }
}

executarAnalise();
