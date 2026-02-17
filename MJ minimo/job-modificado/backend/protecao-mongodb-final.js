#!/usr/bin/env node

/**
 * Sistema de Proteção Contra Duplicatas para MongoDB Atlas - Versão Final
 * Resolve conflitos com índices existentes
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

// Cache para rate limiting
const rateLimitCache = new Map();

class ProtecaoMongoDBFinal {
  constructor() {
    this.client = null;
    this.db = null;
    this.maxTentativas = 3;
    this.tempoLimite = 60 * 60 * 1000; // 1 hora
  }

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

  async desconectar() {
    if (this.client) {
      await this.client.close();
      console.log("🔌 MongoDB Atlas desconectado");
    }
  }

  /**
   * Gera um ID único para firebaseId
   */
  gerarFirebaseId() {
    return `mongodb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica se o usuário pode criar um novo anúncio
   */
  async verificarPermissaoCadastro(email, userId) {
    try {
      console.log(`🔍 Verificando permissão para: ${email}`);
      
      // Rate Limiting
      const now = Date.now();
      const hourAgo = now - this.tempoLimite;
      
      const userKey = `${email}-${userId}`;
      const userAttempts = rateLimitCache.get(userKey) || [];
      const recentAttempts = userAttempts.filter(time => time > hourAgo);
      
      if (recentAttempts.length >= this.maxTentativas) {
        return {
          permitido: false,
          motivo: 'RATE_LIMIT',
          mensagem: 'Muitas tentativas. Aguarde 1 hora antes de tentar novamente.',
          tentativasRestantes: 0
        };
      }
      
      // Verificar anúncio existente por email
      const anuncioExistente = await this.db.collection('advertisements')
        .findOne({ 
          $or: [
            { email: email },
            { userId: userId }
          ]
        });
      
      if (anuncioExistente) {
        return {
          permitido: true,
          sobrescrever: true,
          documentoId: anuncioExistente._id,
          mensagem: 'Anúncio existente será atualizado.',
          tentativasRestantes: this.maxTentativas - recentAttempts.length
        };
      }
      
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

  registrarTentativa(email, userId) {
    const userKey = `${email}-${userId}`;
    const now = Date.now();
    
    const userAttempts = rateLimitCache.get(userKey) || [];
    userAttempts.push(now);
    
    rateLimitCache.set(userKey, userAttempts);
    
    console.log(`📝 Tentativa registrada para: ${email}`);
  }

  validarDados(dados) {
    const erros = [];
    
    if (!dados.nome) erros.push('Nome é obrigatório');
    if (!dados.email) erros.push('Email é obrigatório');
    if (!dados.categoria) erros.push('Categoria é obrigatória');
    if (!dados.genero) erros.push('Gênero é obrigatório');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (dados.email && !emailRegex.test(dados.email)) {
      erros.push('Email inválido');
    }
    
    return {
      valido: erros.length === 0,
      erros: erros
    };
  }

  /**
   * Salva ou atualiza anúncio com proteção contra duplicatas
   */
  async salvarAnuncioComProtecao(dadosAnuncio) {
    try {
      const { email, userId } = dadosAnuncio;
      
      // Validar dados
      const validacao = this.validarDados(dadosAnuncio);
      if (!validacao.valido) {
        return {
          sucesso: false,
          erro: 'VALIDATION_ERROR',
          mensagem: 'Dados inválidos: ' + validacao.erros.join(', '),
          detalhes: validacao.erros
        };
      }
      
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
      
      // Preparar dados com firebaseId único
      const dadosCompletos = {
        ...dadosAnuncio,
        createdAt: new Date(),
        updatedAt: new Date(),
        versao: 1,
        firebaseId: this.gerarFirebaseId() // ID único para evitar conflitos
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
        
        if (updateResult.modifiedCount > 0) {
          resultado = {
            sucesso: true,
            acao: 'ATUALIZADO',
            documentoId: verificacao.documentoId,
            mensagem: 'Anúncio atualizado com sucesso!'
          };
        } else {
          resultado = {
            sucesso: false,
            erro: 'UPDATE_ERROR',
            mensagem: 'Erro ao atualizar anúncio.',
            tentativasRestantes: 0
          };
        }
        
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
   * Função para testar a proteção
   */
  async testarProtecao() {
    console.log("\n🧪 TESTANDO PROTEÇÃO CONTRA DUPLICATAS NO MONGODB:");
    console.log("==================================================");
    
    // Teste 1: Novo usuário
    console.log("\n1️⃣ Teste: Novo usuário");
    const resultado1 = await this.salvarAnuncioComProtecao({
      nome: "Ana MongoDB",
      email: "ana@mongodb.com",
      userId: "user999",
      categoria: "acompanhantes",
      genero: "mulher"
    });
    console.log("Resultado:", resultado1);
    
    // Teste 2: Mesmo usuário (deve sobrescrever)
    console.log("\n2️⃣ Teste: Mesmo usuário (sobrescrita)");
    const resultado2 = await this.salvarAnuncioComProtecao({
      nome: "Ana MongoDB Atualizada",
      email: "ana@mongodb.com",
      userId: "user999",
      categoria: "acompanhantes",
      genero: "mulher"
    });
    console.log("Resultado:", resultado2);
    
    // Teste 3: Rate limiting
    console.log("\n3️⃣ Teste: Rate limiting");
    for (let i = 0; i < 5; i++) {
      const resultado = await this.salvarAnuncioComProtecao({
        nome: "Spam Test MongoDB Final",
        email: "spam@mongodb-final.com",
        userId: "spam999",
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
  const protecao = new ProtecaoMongoDBFinal();
  
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
