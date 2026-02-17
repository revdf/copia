#!/usr/bin/env node

/**
 * Sistema de Proteção Contra Duplicatas para MongoDB Atlas
 * Implementa as mesmas proteções do Firebase
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './config-firebase-mongodb.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'mansao_do_job';

// Cache para rate limiting (em produção, usar Redis)
const rateLimitCache = new Map();

class ProtecaoMongoDB {
  constructor() {
    this.client = null;
    this.db = null;
    this.maxTentativas = 3;
    this.tempoLimite = 60 * 60 * 1000; // 1 hora
  }

  /**
   * Conecta ao MongoDB Atlas
   */
  async conectar() {
    try {
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db(DATABASE_NAME);
      console.log("✅ MongoDB Atlas conectado");
    } catch (error) {
      console.error("❌ Erro ao conectar MongoDB:", error.message);
      throw error;
    }
  }

  /**
   * Desconecta do MongoDB Atlas
   */
  async desconectar() {
    if (this.client) {
      await this.client.close();
      console.log("🔌 MongoDB Atlas desconectado");
    }
  }

  /**
   * Verifica se o usuário pode criar um novo anúncio
   * @param {string} email - Email do usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} - Resultado da verificação
   */
  async verificarPermissaoCadastro(email, userId) {
    try {
      console.log(`🔍 Verificando permissão para: ${email}`);
      
      // 1. Rate Limiting - Máximo 3 tentativas por hora
      const now = Date.now();
      const hourAgo = now - this.tempoLimite;
      
      const userKey = `${email}-${userId}`;
      const userAttempts = rateLimitCache.get(userKey) || [];
      
      // Remove tentativas antigas
      const recentAttempts = userAttempts.filter(time => time > hourAgo);
      
      if (recentAttempts.length >= this.maxTentativas) {
        return {
          permitido: false,
          motivo: 'RATE_LIMIT',
          mensagem: 'Muitas tentativas. Aguarde 1 hora antes de tentar novamente.',
          tentativasRestantes: 0
        };
      }
      
      // 2. Verificar se já existe anúncio com este email
      const anuncioPorEmail = await this.db.collection('advertisements')
        .findOne({ email: email });
      
      if (anuncioPorEmail) {
        return {
          permitido: true,
          sobrescrever: true,
          documentoId: anuncioPorEmail._id,
          mensagem: 'Anúncio existente será atualizado.',
          tentativasRestantes: this.maxTentativas - recentAttempts.length
        };
      }
      
      // 3. Verificar se já existe anúncio com este userId
      const anuncioPorUserId = await this.db.collection('advertisements')
        .findOne({ userId: userId });
      
      if (anuncioPorUserId) {
        return {
          permitido: true,
          sobrescrever: true,
          documentoId: anuncioPorUserId._id,
          mensagem: 'Anúncio existente será atualizado.',
          tentativasRestantes: this.maxTentativas - recentAttempts.length
        };
      }
      
      // 4. Novo anúncio permitido
      return {
        permitido: true,
        sobrescrever: false,
        mensagem: 'Novo anúncio será criado.',
        tentativasRestantes: this.maxTentativas - recentAttempts.length
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
  registrarTentativa(email, userId) {
    const userKey = `${email}-${userId}`;
    const now = Date.now();
    
    const userAttempts = rateLimitCache.get(userKey) || [];
    userAttempts.push(now);
    
    rateLimitCache.set(userKey, userAttempts);
    
    console.log(`📝 Tentativa registrada para: ${email}`);
  }

  /**
   * Valida dados antes do envio
   * @param {Object} dados - Dados do formulário
   * @returns {Object} - Resultado da validação
   */
  validarDados(dados) {
    const erros = [];
    
    // Campos obrigatórios
    if (!dados.nome) erros.push('Nome é obrigatório');
    if (!dados.email) erros.push('Email é obrigatório');
    if (!dados.categoria) erros.push('Categoria é obrigatória');
    if (!dados.genero) erros.push('Gênero é obrigatório');
    
    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (dados.email && !emailRegex.test(dados.email)) {
      erros.push('Email inválido');
    }
    
    // Validação de telefone
    if (dados.telefone && dados.telefone.length < 10) {
      erros.push('Telefone deve ter pelo menos 10 dígitos');
    }
    
    return {
      valido: erros.length === 0,
      erros: erros
    };
  }

  /**
   * Salva ou atualiza anúncio com proteção contra duplicatas
   * @param {Object} dadosAnuncio - Dados do anúncio
   * @returns {Object} - Resultado da operação
   */
  async salvarAnuncioComProtecao(dadosAnuncio) {
    try {
      const { email, userId } = dadosAnuncio;
      
      // Verificar permissão
      const verificacao = await this.verificarPermissaoCadastro(email, userId);
      
      if (!verificacao.permitido) {
        return {
          sucesso: false,
          erro: verificacao.motivo,
          mensagem: verificacao.mensagem,
          tentativasRestantes: verificacao.tentativasRestantes
        };
      }
      
      // Registrar tentativa
      this.registrarTentativa(email, userId);
      
      // Preparar dados com timestamp
      const dadosCompletos = {
        ...dadosAnuncio,
        createdAt: new Date(),
        updatedAt: new Date(),
        versao: 1
      };
      
      let resultado;
      
      if (verificacao.sobrescrever) {
        // Atualizar anúncio existente
        console.log(`🔄 Atualizando anúncio existente: ${verificacao.documentoId}`);
        
        const updateResult = await this.db.collection('advertisements').updateOne(
          { _id: verificacao.documentoId },
          {
            $set: {
              ...dadosCompletos,
              updatedAt: new Date()
            },
            $inc: { versao: 1 }
          }
        );
        
        resultado = {
          sucesso: true,
          acao: 'ATUALIZADO',
          documentoId: verificacao.documentoId,
          mensagem: 'Anúncio atualizado com sucesso!'
        };
        
      } else {
        // Criar novo anúncio
        console.log(`✨ Criando novo anúncio`);
        
        const insertResult = await this.db.collection('advertisements').insertOne(dadosCompletos);
        
        resultado = {
          sucesso: true,
          acao: 'CRIADO',
          documentoId: insertResult.insertedId,
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
   * Cria índices únicos para prevenir duplicatas
   */
  async criarIndicesUnicos() {
    try {
      console.log("🔧 Criando índices únicos...");
      
      // Índice único para email
      await this.db.collection('advertisements').createIndex(
        { email: 1 },
        { unique: true, sparse: true }
      );
      
      // Índice único para userId
      await this.db.collection('advertisements').createIndex(
        { userId: 1 },
        { unique: true, sparse: true }
      );
      
      // Índice composto para rate limiting
      await this.db.collection('advertisements').createIndex(
        { email: 1, userId: 1 },
        { unique: true }
      );
      
      console.log("✅ Índices únicos criados com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro ao criar índices:", error.message);
    }
  }

  /**
   * Função para testar a proteção
   */
  async testarProtecao() {
    console.log("\n🧪 TESTANDO PROTEÇÃO CONTRA DUPLICATAS NO MONGODB:");
    console.log("==================================================");
    
    // Criar índices únicos
    await this.criarIndicesUnicos();
    
    // Teste 1: Novo usuário
    console.log("\n1️⃣ Teste: Novo usuário");
    const resultado1 = await this.salvarAnuncioComProtecao({
      nome: "Maria Teste",
      email: "maria@teste.com",
      userId: "user456",
      categoria: "acompanhantes",
      genero: "mulher"
    });
    console.log("Resultado:", resultado1);
    
    // Teste 2: Mesmo usuário (deve sobrescrever)
    console.log("\n2️⃣ Teste: Mesmo usuário (sobrescrita)");
    const resultado2 = await this.salvarAnuncioComProtecao({
      nome: "Maria Teste Atualizada",
      email: "maria@teste.com",
      userId: "user456",
      categoria: "acompanhantes",
      genero: "mulher"
    });
    console.log("Resultado:", resultado2);
    
    // Teste 3: Rate limiting
    console.log("\n3️⃣ Teste: Rate limiting");
    for (let i = 0; i < 5; i++) {
      const resultado = await this.salvarAnuncioComProtecao({
        nome: "Spam Test MongoDB",
        email: "spam@mongodb.com",
        userId: "spam456",
        categoria: "acompanhantes",
        genero: "homem"
      });
      console.log(`Tentativa ${i + 1}:`, resultado.mensagem);
    }
    
    // Verificar dados finais
    console.log("\n📊 VERIFICAÇÃO FINAL:");
    const totalAnuncios = await this.db.collection('advertisements').countDocuments();
    console.log(`Total de anúncios: ${totalAnuncios}`);
    
    const anuncios = await this.db.collection('advertisements').find({}).toArray();
    anuncios.forEach(anuncio => {
      console.log(`- ${anuncio.nome} (${anuncio.email}) - Versão: ${anuncio.versao}`);
    });
  }
}

// Executar teste
async function executarTeste() {
  const protecao = new ProtecaoMongoDB();
  
  try {
    await protecao.conectar();
    await protecao.testarProtecao();
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  } finally {
    await protecao.desconectar();
  }
}

executarTeste();
