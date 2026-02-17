/**
 * ============================================
 * FIRESTORE MANAGER - Firebase Firestore
 * ============================================
 * 
 * Módulo centralizado para gerenciar todos os dados no Firestore
 * seguindo estrutura padronizada e unificada.
 * 
 * Estrutura Padrão no Firestore:
 * 
 * users/
 *   {userId}/
 *     nome: string
 *     cpf: string
 *     whatsapp: string
 *     tipoPerfil: string
 *     dataCadastro: timestamp
 *     documentosVerificados: boolean
 *     fotoPerfilUrl: string
 *     email: string
 *     role: string
 *     status: string
 *     created_at: timestamp
 *     updated_at: timestamp
 * 
 * ads/
 *   {adId}/
 *     userId: string
 *     tipoAnuncio: string
 *     categoria: string
 *     titulo: string
 *     descricao: string
 *     preco: number
 *     cidade: string
 *     estado: string
 *     coverUrl: string
 *     galleryUrls: array<string>
 *     videoUrls: array<string>
 *     audioUrls: array<string>
 *     dataCriacao: timestamp
 *     status: string
 *     created_at: timestamp
 *     updated_at: timestamp
 * 
 * @requires firebase-firestore
 * @author Sistema Padronizado
 * @version 1.0.0
 */

// ============================================
// CONFIGURAÇÃO E INICIALIZAÇÃO
// ============================================

/**
 * Inicializa o Firestore Manager
 * @param {Object} firestoreDb - Instância do Firestore
 * @returns {Object} Instância configurada do Firestore Manager
 */
function initFirestoreManager(firestoreDb) {
  if (!firestoreDb) {
    throw new Error('Firestore não foi inicializado');
  }
  
  const db = firestoreDb;
  
  // ============================================
  // CONSTANTES DE COLECÇÕES
  // ============================================
  
  const COLLECTIONS = {
    USERS: 'users',
    ADS: 'ads',
    ADVERTISERS: 'advertisers' // Mantido para compatibilidade
  };
  
  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================
  
  /**
   * Adiciona timestamps padrão a um objeto
   * @param {Object} data - Dados a processar
   * @param {boolean} isUpdate - Se é atualização (não adiciona created_at)
   * @returns {Object} Dados com timestamps
   */
  function addTimestamps(data, isUpdate = false) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    
    return {
      ...data,
      updated_at: timestamp,
      ...(isUpdate ? {} : { created_at: timestamp })
    };
  }
  
  /**
   * Valida dados de usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} {valid: boolean, errors: Array<string>}
   */
  function validateUserData(userData) {
    const errors = [];
    
    if (!userData.nome && !userData.name) {
      errors.push('Nome é obrigatório');
    }
    if (!userData.email) {
      errors.push('Email é obrigatório');
    }
    if (!userData.cpf) {
      errors.push('CPF é obrigatório');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * Valida dados de anúncio
   * @param {Object} adData - Dados do anúncio
   * @returns {Object} {valid: boolean, errors: Array<string>}
   */
  function validateAdData(adData) {
    const errors = [];
    
    if (!adData.userId) {
      errors.push('userId é obrigatório');
    }
    if (!adData.titulo && !adData.title) {
      errors.push('Título é obrigatório');
    }
    if (!adData.categoria && !adData.category) {
      errors.push('Categoria é obrigatória');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
  
  // ============================================
  // FUNÇÕES DE USUÁRIOS
  // ============================================
  
  /**
   * Salva ou atualiza dados de usuário
   * @param {string} userId - ID do usuário
   * @param {Object} userData - Dados do usuário
   * @param {boolean} isUpdate - Se é atualização
   * @returns {Promise<string>} ID do documento
   */
  async function saveUser(userId, userData, isUpdate = false) {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }
    
    // Validar dados
    const validation = validateUserData(userData);
    if (!validation.valid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }
    
    try {
      // Preparar dados com timestamps
      const dataToSave = addTimestamps({
        nome: userData.nome || userData.name,
        email: userData.email,
        cpf: userData.cpf,
        whatsapp: userData.whatsapp || '',
        tipoPerfil: userData.tipoPerfil || userData.tipo_perfil || 'padrao',
        documentosVerificados: userData.documentosVerificados || false,
        fotoPerfilUrl: userData.fotoPerfilUrl || userData.foto_perfil_url || '',
        role: userData.role || 'advertiser',
        status: userData.status || 'active',
        dataCadastro: userData.dataCadastro || firebase.firestore.FieldValue.serverTimestamp(),
        // Campos adicionais
        ...(userData.countryCode && { countryCode: userData.countryCode }),
        ...(userData.displayName && { displayName: userData.displayName }),
        ...(userData.photoURL && { photoURL: userData.photoURL })
      }, isUpdate);
      
      // Salvar no Firestore
      const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
      
      if (isUpdate) {
        await userRef.update(dataToSave);
        console.log(`✅ Usuário atualizado: ${userId}`);
      } else {
        await userRef.set(dataToSave);
        console.log(`✅ Usuário criado: ${userId}`);
      }
      
      // Log para MongoDB futuro
      await logUserEventToMongo({
        userId,
        action: isUpdate ? 'user_update' : 'user_create',
        data: dataToSave,
        timestamp: new Date().toISOString()
      });
      
      return userId;
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      throw error;
    }
  }
  
  /**
   * Busca dados de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object|null>} Dados do usuário ou null
   */
  async function getUser(userId) {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }
    
    try {
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }
  
  /**
   * Verifica se um CPF já está cadastrado
   * @param {string} cpf - CPF a verificar
   * @param {string} excludeUserId - ID de usuário a excluir da busca (opcional)
   * @returns {Promise<boolean>} true se CPF já existe
   */
  async function checkCPFExists(cpf, excludeUserId = null) {
    if (!cpf) {
      throw new Error('CPF é obrigatório');
    }
    
    try {
      let query = db.collection(COLLECTIONS.USERS).where('cpf', '==', cpf);
      
      // Se houver userId para excluir, adicionar filtro
      if (excludeUserId) {
        query = query.where(firebase.firestore.FieldPath.documentId(), '!=', excludeUserId);
      }
      
      const snapshot = await query.limit(1).get();
      return !snapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza foto de perfil do usuário
   * @param {string} userId - ID do usuário
   * @param {string} fotoPerfilUrl - URL da foto de perfil
   * @returns {Promise<void>}
   */
  async function updateUserProfilePhoto(userId, fotoPerfilUrl) {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }
    if (!fotoPerfilUrl) {
      throw new Error('fotoPerfilUrl é obrigatório');
    }
    
    try {
      await db.collection(COLLECTIONS.USERS).doc(userId).update({
        fotoPerfilUrl: fotoPerfilUrl,
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Foto de perfil atualizada para usuário: ${userId}`);
    } catch (error) {
      console.error('Erro ao atualizar foto de perfil:', error);
      throw error;
    }
  }
  
  // ============================================
  // FUNÇÕES DE ANÚNCIOS
  // ============================================
  
  /**
   * Cria um novo anúncio
   * @param {string} userId - ID do usuário
   * @param {Object} adData - Dados do anúncio
   * @returns {Promise<string>} ID do anúncio criado
   */
  async function createAd(userId, adData) {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }
    
    // Validar dados
    const validation = validateAdData({ ...adData, userId });
    if (!validation.valid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }
    
    try {
      // Preparar dados com estrutura padronizada
      const dataToSave = addTimestamps({
        userId: userId,
        tipoAnuncio: adData.tipoAnuncio || adData.tipo_anuncio || 'padrao',
        categoria: adData.categoria || adData.category || 'acompanhantes',
        titulo: adData.titulo || adData.title || '',
        descricao: adData.descricao || adData.description || '',
        preco: adData.preco || adData.price || 0,
        cidade: adData.cidade || adData.city || '',
        estado: adData.estado || adData.state || '',
        bairro: adData.bairro || adData.neighborhood || '',
        coverUrl: adData.coverUrl || adData.cover_url || '',
        galleryUrls: adData.galleryUrls || adData.gallery_urls || [],
        videoUrls: adData.videoUrls || adData.video_urls || [],
        audioUrls: adData.audioUrls || adData.audio_urls || [],
        status: adData.status || 'active',
        dataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
        // Campos adicionais para compatibilidade
        ...(adData.servicos && { servicos: adData.servicos }),
        ...(adData.aceita && { aceita: adData.aceita }),
        ...(adData.verificacao && { verificacao: adData.verificacao }),
        ...(adData.advertiserId && { advertiserId: adData.advertiserId }),
        ...(adData.userEmail && { userEmail: adData.userEmail })
      });
      
      // Salvar no Firestore
      const adRef = await db.collection(COLLECTIONS.ADS).add(dataToSave);
      console.log(`✅ Anúncio criado: ${adRef.id}`);
      
      // Log para MongoDB futuro
      await logAdEventToMongo({
        adId: adRef.id,
        userId,
        action: 'ad_create',
        data: dataToSave,
        timestamp: new Date().toISOString()
      });
      
      return adRef.id;
    } catch (error) {
      console.error('Erro ao criar anúncio:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza um anúncio existente
   * @param {string} adId - ID do anúncio
   * @param {Object} adData - Dados a atualizar
   * @returns {Promise<void>}
   */
  async function updateAd(adId, adData) {
    if (!adId) {
      throw new Error('adId é obrigatório');
    }
    
    try {
      const dataToUpdate = addTimestamps(adData, true);
      
      await db.collection(COLLECTIONS.ADS).doc(adId).update(dataToUpdate);
      console.log(`✅ Anúncio atualizado: ${adId}`);
      
      // Log para MongoDB futuro
      await logAdEventToMongo({
        adId,
        action: 'ad_update',
        data: dataToUpdate,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao atualizar anúncio:', error);
      throw error;
    }
  }
  
  /**
   * Busca um anúncio por ID
   * @param {string} adId - ID do anúncio
   * @returns {Promise<Object|null>} Dados do anúncio ou null
   */
  async function getAd(adId) {
    if (!adId) {
      throw new Error('adId é obrigatório');
    }
    
    try {
      const adDoc = await db.collection(COLLECTIONS.ADS).doc(adId).get();
      
      if (!adDoc.exists) {
        return null;
      }
      
      return {
        id: adDoc.id,
        ...adDoc.data()
      };
    } catch (error) {
      console.error('Erro ao buscar anúncio:', error);
      throw error;
    }
  }
  
  /**
   * Busca anúncios de um usuário
   * @param {string} userId - ID do usuário
   * @param {string} status - Status dos anúncios (opcional)
   * @returns {Promise<Array<Object>>} Array de anúncios
   */
  async function getUserAds(userId, status = null) {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }
    
    try {
      let query = db.collection(COLLECTIONS.ADS).where('userId', '==', userId);
      
      if (status) {
        query = query.where('status', '==', status);
      }
      
      const snapshot = await query.orderBy('created_at', 'desc').get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar anúncios do usuário:', error);
      throw error;
    }
  }
  
  /**
   * Busca anúncios por categoria
   * @param {string} categoria - Categoria dos anúncios
   * @param {number} limit - Limite de resultados (padrão: 20)
   * @returns {Promise<Array<Object>>} Array de anúncios
   */
  async function getAdsByCategory(categoria, limit = 20) {
    if (!categoria) {
      throw new Error('categoria é obrigatória');
    }
    
    try {
      const snapshot = await db.collection(COLLECTIONS.ADS)
        .where('categoria', '==', categoria)
        .where('status', '==', 'active')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar anúncios por categoria:', error);
      throw error;
    }
  }
  
  /**
   * Busca anúncios por localização
   * @param {string} estado - Estado
   * @param {string} cidade - Cidade (opcional)
   * @param {number} limit - Limite de resultados (padrão: 20)
   * @returns {Promise<Array<Object>>} Array de anúncios
   */
  async function getAdsByLocation(estado, cidade = null, limit = 20) {
    if (!estado) {
      throw new Error('estado é obrigatório');
    }
    
    try {
      let query = db.collection(COLLECTIONS.ADS)
        .where('estado', '==', estado)
        .where('status', '==', 'active');
      
      if (cidade) {
        query = query.where('cidade', '==', cidade);
      }
      
      const snapshot = await query
        .orderBy('created_at', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar anúncios por localização:', error);
      throw error;
    }
  }
  
  /**
   * Deleta um anúncio (soft delete - marca como deletado)
   * @param {string} adId - ID do anúncio
   * @returns {Promise<void>}
   */
  async function deleteAd(adId) {
    if (!adId) {
      throw new Error('adId é obrigatório');
    }
    
    try {
      await db.collection(COLLECTIONS.ADS).doc(adId).update({
        status: 'deleted',
        deleted_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Anúncio deletado (soft delete): ${adId}`);
      
      // Log para MongoDB futuro
      await logAdEventToMongo({
        adId,
        action: 'ad_delete',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao deletar anúncio:', error);
      throw error;
    }
  }
  
  // ============================================
  // FUNÇÕES STUB PARA MONGODB (FUTURO)
  // ============================================
  
  /**
   * Log de evento de usuário para MongoDB (stub - implementar no futuro)
   * @param {Object} data - Dados do evento
   * @returns {Promise<void>}
   */
  async function logUserEventToMongo(data) {
    // TODO: Implementar integração com MongoDB
    // await saveUserEventToMongo(data.action, data);
    console.log('📊 [MongoDB Stub] Log de evento de usuário:', data);
  }
  
  /**
   * Log de evento de anúncio para MongoDB (stub - implementar no futuro)
   * @param {Object} data - Dados do evento
   * @returns {Promise<void>}
   */
  async function logAdEventToMongo(data) {
    // TODO: Implementar integração com MongoDB
    // await saveAdEventToMongo(data.action, data);
    console.log('📊 [MongoDB Stub] Log de evento de anúncio:', data);
  }
  
  // ============================================
  // API PÚBLICA
  // ============================================
  
  return {
    // Usuários
    saveUser,
    getUser,
    checkCPFExists,
    updateUserProfilePhoto,
    
    // Anúncios
    createAd,
    updateAd,
    getAd,
    getUserAds,
    getAdsByCategory,
    getAdsByLocation,
    deleteAd,
    
    // Coleções (para referência)
    COLLECTIONS
  };
}

// Exportar para uso global ou módulo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = initFirestoreManager;
} else {
  window.FirestoreManager = initFirestoreManager;
}





