/**
 * Middleware de Proteção Contra Duplicatas
 * Para ser integrado no formulário de cadastro
 */

class ProtecaoDuplicatas {
  constructor() {
    this.tentativas = new Map();
    this.maxTentativas = 3;
    this.tempoLimite = 60 * 60 * 1000; // 1 hora
  }

  /**
   * Verifica se o usuário pode fazer uma nova tentativa
   * @param {string} email - Email do usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} - Resultado da verificação
   */
  verificarPermissao(email, userId) {
    const chave = `${email}-${userId}`;
    const agora = Date.now();
    const umaHoraAtras = agora - this.tempoLimite;

    // Obter tentativas do usuário
    const tentativasUsuario = this.tentativas.get(chave) || [];
    
    // Filtrar tentativas recentes (última hora)
    const tentativasRecentes = tentativasUsuario.filter(
      tempo => tempo > umaHoraAtras
    );

    // Verificar limite
    if (tentativasRecentes.length >= this.maxTentativas) {
      return {
        permitido: false,
        motivo: 'RATE_LIMIT',
        mensagem: `Muitas tentativas. Aguarde ${this.calcularTempoRestante(tentativasRecentes[0])} antes de tentar novamente.`,
        tentativasRestantes: 0
      };
    }

    return {
      permitido: true,
      tentativasRestantes: this.maxTentativas - tentativasRecentes.length,
      mensagem: 'Tentativa permitida.'
    };
  }

  /**
   * Registra uma tentativa de cadastro
   * @param {string} email - Email do usuário
   * @param {string} userId - ID do usuário
   */
  registrarTentativa(email, userId) {
    const chave = `${email}-${userId}`;
    const agora = Date.now();
    
    const tentativasUsuario = this.tentativas.get(chave) || [];
    tentativasUsuario.push(agora);
    
    this.tentativas.set(chave, tentativasUsuario);
    
    console.log(`📝 Tentativa registrada para: ${email}`);
  }

  /**
   * Calcula tempo restante até próxima tentativa
   * @param {number} primeiraTentativa - Timestamp da primeira tentativa
   * @returns {string} - Tempo restante formatado
   */
  calcularTempoRestante(primeiraTentativa) {
    const agora = Date.now();
    const proximaTentativa = primeiraTentativa + this.tempoLimite;
    const tempoRestante = proximaTentativa - agora;
    
    if (tempoRestante <= 0) return 'agora';
    
    const minutos = Math.ceil(tempoRestante / (60 * 1000));
    return `${minutos} minuto(s)`;
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
   * Processa cadastro com todas as proteções
   * @param {Object} dados - Dados do formulário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} - Resultado do cadastro
   */
  async processarCadastro(dados, userId) {
    try {
      console.log('🛡️ Iniciando cadastro com proteções...');
      
      // 1. Validar dados
      const validacao = this.validarDados(dados);
      if (!validacao.valido) {
        return {
          sucesso: false,
          erro: 'VALIDATION_ERROR',
          mensagem: 'Dados inválidos: ' + validacao.erros.join(', '),
          detalhes: validacao.erros
        };
      }
      
      // 2. Verificar rate limiting
      const permissao = this.verificarPermissao(dados.email, userId);
      if (!permissao.permitido) {
        return {
          sucesso: false,
          erro: 'RATE_LIMIT',
          mensagem: permissao.mensagem,
          tentativasRestantes: permissao.tentativasRestantes
        };
      }
      
      // 3. Registrar tentativa
      this.registrarTentativa(dados.email, userId);
      
      // 4. Verificar se já existe anúncio com este email
      const anuncioExistente = await this.verificarAnuncioExistente(dados.email, userId);
      
      if (anuncioExistente) {
        // Atualizar anúncio existente
        console.log('🔄 Atualizando anúncio existente...');
        const resultado = await this.atualizarAnuncio(anuncioExistente.id, dados);
        
        return {
          sucesso: true,
          acao: 'ATUALIZADO',
          mensagem: 'Anúncio atualizado com sucesso!',
          documentoId: anuncioExistente.id
        };
      } else {
        // Criar novo anúncio
        console.log('✨ Criando novo anúncio...');
        const resultado = await this.criarAnuncio(dados);
        
        return {
          sucesso: true,
          acao: 'CRIADO',
          mensagem: 'Anúncio criado com sucesso!',
          documentoId: resultado.id
        };
      }
      
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      return {
        sucesso: false,
        erro: 'PROCESSING_ERROR',
        mensagem: 'Erro interno. Tente novamente.',
        detalhes: error.message
      };
    }
  }

  /**
   * Verifica se já existe anúncio com este email/userId
   * @param {string} email - Email do usuário
   * @param {string} userId - ID do usuário
   * @returns {Object|null} - Anúncio existente ou null
   */
  async verificarAnuncioExistente(email, userId) {
    try {
      // Buscar por email
      const emailQuery = await db.collection('anuncios')
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (!emailQuery.empty) {
        const doc = emailQuery.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      
      // Buscar por userId
      const userIdQuery = await db.collection('anuncios')
        .where('userId', '==', userId)
        .limit(1)
        .get();
      
      if (!userIdQuery.empty) {
        const doc = userIdQuery.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao verificar anúncio existente:', error);
      return null;
    }
  }

  /**
   * Atualiza anúncio existente
   * @param {string} documentoId - ID do documento
   * @param {Object} dados - Novos dados
   * @returns {Promise<Object>} - Resultado da atualização
   */
  async atualizarAnuncio(documentoId, dados) {
    try {
      const dadosAtualizados = {
        ...dados,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        versao: firebase.firestore.FieldValue.increment(1)
      };
      
      await db.collection('anuncios').doc(documentoId).update(dadosAtualizados);
      
      return { sucesso: true };
      
    } catch (error) {
      console.error('❌ Erro ao atualizar anúncio:', error);
      throw error;
    }
  }

  /**
   * Cria novo anúncio
   * @param {Object} dados - Dados do anúncio
   * @returns {Promise<Object>} - Resultado da criação
   */
  async criarAnuncio(dados) {
    try {
      const dadosCompletos = {
        ...dados,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        versao: 1
      };
      
      const docRef = await db.collection('anuncios').add(dadosCompletos);
      
      return { id: docRef.id, sucesso: true };
      
    } catch (error) {
      console.error('❌ Erro ao criar anúncio:', error);
      throw error;
    }
  }
}

// Instância global
const protecaoDuplicatas = new ProtecaoDuplicatas();

// Exportar para uso no formulário
window.ProtecaoDuplicatas = protecaoDuplicatas;
