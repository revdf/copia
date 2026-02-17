/**
 * Proteção Contra Upload Múltiplo - Frontend
 * Implementa proteções para evitar uploads duplicados por cliques rápidos
 */

class ProtecaoUploadMultiple {
  constructor() {
    this.uploadsEmAndamento = new Set();
    this.cacheUploads = new Map();
    this.limites = {
      maxUploadsSimultaneos: 5,
      tempoEntreUploads: 2000, // 2 segundos
      maxTentativasPorArquivo: 3
    };
  }

  /**
   * Verifica se um upload já está em andamento
   * @param {string} arquivoId - ID único do arquivo
   * @returns {boolean} - True se já está sendo enviado
   */
  verificarUploadEmAndamento(arquivoId) {
    return this.uploadsEmAndamento.has(arquivoId);
  }

  /**
   * Marca um upload como em andamento
   * @param {string} arquivoId - ID único do arquivo
   */
  marcarUploadEmAndamento(arquivoId) {
    this.uploadsEmAndamento.add(arquivoId);
  }

  /**
   * Remove um upload da lista de em andamento
   * @param {string} arquivoId - ID único do arquivo
   */
  removerUploadEmAndamento(arquivoId) {
    this.uploadsEmAndamento.delete(arquivoId);
  }

  /**
   * Verifica se arquivo já foi enviado recentemente
   * @param {File} arquivo - Arquivo a ser verificado
   * @param {string} userId - ID do usuário
   * @returns {boolean} - True se já foi enviado
   */
  verificarArquivoDuplicado(arquivo, userId) {
    const chave = `${userId}_${arquivo.name}_${arquivo.size}_${arquivo.lastModified}`;
    return this.cacheUploads.has(chave);
  }

  /**
   * Adiciona arquivo ao cache de uploads
   * @param {File} arquivo - Arquivo enviado
   * @param {string} userId - ID do usuário
   */
  adicionarAoCache(arquivo, userId) {
    const chave = `${userId}_${arquivo.name}_${arquivo.size}_${arquivo.lastModified}`;
    this.cacheUploads.set(chave, Date.now());
  }

  /**
   * Verifica limite de uploads simultâneos
   * @returns {boolean} - True se pode fazer upload
   */
  verificarLimiteSimultaneos() {
    return this.uploadsEmAndamento.size < this.limites.maxUploadsSimultaneos;
  }

  /**
   * Função de upload protegida contra duplicatas
   * @param {File} arquivo - Arquivo a ser enviado
   * @param {string} anuncioId - ID do anúncio
   * @param {string} fieldName - Nome do campo
   * @param {string} userId - ID do usuário
   * @returns {Promise} - Promise do upload
   */
  async uploadProtegido(arquivo, anuncioId, fieldName, userId) {
    const arquivoId = `${anuncioId}_${fieldName}_${arquivo.name}`;
    
    // 1. Verificar se já está sendo enviado
    if (this.verificarUploadEmAndamento(arquivoId)) {
      throw new Error(`Arquivo ${arquivo.name} já está sendo enviado`);
    }
    
    // 2. Verificar se já foi enviado recentemente
    if (this.verificarArquivoDuplicado(arquivo, userId)) {
      throw new Error(`Arquivo ${arquivo.name} já foi enviado recentemente`);
    }
    
    // 3. Verificar limite de uploads simultâneos
    if (!this.verificarLimiteSimultaneos()) {
      throw new Error(`Limite de uploads simultâneos excedido (${this.limites.maxUploadsSimultaneos})`);
    }
    
    // 4. Marcar como em andamento
    this.marcarUploadEmAndamento(arquivoId);
    
    try {
      // 5. Fazer upload
      const resultado = await this.fazerUpload(arquivo, anuncioId, fieldName);
      
      // 6. Adicionar ao cache
      this.adicionarAoCache(arquivo, userId);
      
      return resultado;
      
    } finally {
      // 7. Remover da lista de em andamento
      this.removerUploadEmAndamento(arquivoId);
    }
  }

  /**
   * Função de upload real (substitui a original)
   * @param {File} arquivo - Arquivo a ser enviado
   * @param {string} anuncioId - ID do anúncio
   * @param {string} fieldName - Nome do campo
   * @returns {Promise} - Promise do upload
   */
  async fazerUpload(arquivo, anuncioId, fieldName) {
    try {
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`advertisements/${anuncioId}/${fieldName}_${Date.now()}_${arquivo.name}`);
      
      console.log(`📁 Fazendo upload protegido: ${fieldName} -> ${arquivo.name}`);
      
      const snapshot = await fileRef.put(arquivo);
      const downloadURL = await snapshot.ref.getDownloadURL();
      
      console.log(`✅ Upload protegido concluído: ${fieldName} -> ${downloadURL}`);
      
      // Atualizar o documento no Firestore com a URL do arquivo
      await db.collection("anuncios").doc(anuncioId).update({
        [`${fieldName}_url`]: downloadURL,
        [`${fieldName}_name`]: arquivo.name,
        [`${fieldName}_size`]: arquivo.size
      });
      
      return downloadURL;
      
    } catch (error) {
      console.error(`❌ Erro no upload protegido de ${fieldName}:`, error);
      throw error;
    }
  }

  /**
   * Limpa cache antigo
   */
  limparCacheAntigo() {
    const agora = Date.now();
    const umaHoraAtras = agora - (60 * 60 * 1000);
    
    let removidos = 0;
    for (const [chave, timestamp] of this.cacheUploads.entries()) {
      if (timestamp < umaHoraAtras) {
        this.cacheUploads.delete(chave);
        removidos++;
      }
    }
    
    if (removidos > 0) {
      console.log(`🧹 Cache de uploads limpo: ${removidos} entradas removidas`);
    }
  }

  /**
   * Obtém estatísticas de uploads
   * @returns {Object} - Estatísticas
   */
  obterEstatisticas() {
    return {
      uploadsEmAndamento: this.uploadsEmAndamento.size,
      cacheSize: this.cacheUploads.size,
      limiteSimultaneos: this.limites.maxUploadsSimultaneos,
      tempoEntreUploads: this.limites.tempoEntreUploads
    };
  }
}

// Instância global
const protecaoUpload = new ProtecaoUploadMultiple();

// Limpar cache a cada hora
setInterval(() => {
  protecaoUpload.limparCacheAntigo();
}, 60 * 60 * 1000);

// Função para substituir a função original de upload
function uploadFileToStorageProtegido(file, anuncioId, fieldName) {
  const userId = currentUser?.uid || 'anonymous';
  return protecaoUpload.uploadProtegido(file, anuncioId, fieldName, userId);
}

// Exportar para uso global
window.ProtecaoUploadMultiple = protecaoUpload;
window.uploadFileToStorageProtegido = uploadFileToStorageProtegido;

// Log de inicialização
console.log("🛡️ Proteção contra upload múltiplo inicializada");
console.log("📊 Estatísticas:", protecaoUpload.obterEstatisticas());
