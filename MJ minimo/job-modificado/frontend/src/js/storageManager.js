/**
 * ============================================
 * STORAGE MANAGER - Firebase Storage
 * ============================================
 * 
 * Módulo centralizado para gerenciar todos os uploads e downloads
 * de arquivos no Firebase Storage seguindo padrão unificado.
 * 
 * Estrutura de Pastas Padrão:
 * 
 * PUBLIC (Fotos, vídeos, áudios do anúncio):
 *   public/users/{userId}/profile/{fotoPerfil}
 *   public/users/{userId}/ads/{adId}/cover/{arquivo}
 *   public/users/{userId}/ads/{adId}/gallery/{arquivo}
 *   public/users/{userId}/ads/{adId}/videos/{arquivo}
 *   public/users/{userId}/ads/{adId}/audios/{arquivo}
 * 
 * PRIVATE (Documentos sensíveis):
 *   private/users/{userId}/documents/{arquivo}
 * 
 * @requires firebase-storage
 * @author Sistema Padronizado
 * @version 1.0.0
 */

// ============================================
// CONFIGURAÇÃO E INICIALIZAÇÃO
// ============================================

/**
 * Inicializa o Storage Manager
 * @param {Object} firebaseStorage - Instância do Firebase Storage
 * @returns {Object} Instância configurada do Storage Manager
 */
function initStorageManager(firebaseStorage) {
  if (!firebaseStorage) {
    throw new Error('Firebase Storage não foi inicializado');
  }
  
  const storage = firebaseStorage;
  
  // ============================================
  // CONSTANTES DE PATHS
  // ============================================
  
  const PATHS = {
    PUBLIC: {
      PROFILE: (userId) => `public/users/${userId}/profile`,
      AD_COVER: (userId, adId) => `public/users/${userId}/ads/${adId}/cover`,
      AD_GALLERY: (userId, adId) => `public/users/${userId}/ads/${adId}/gallery`,
      AD_VIDEOS: (userId, adId) => `public/users/${userId}/ads/${adId}/videos`,
      AD_AUDIOS: (userId, adId) => `public/users/${userId}/ads/${adId}/audios`
    },
    PRIVATE: {
      DOCUMENTS: (userId) => `private/users/${userId}/documents`
    }
  };
  
  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================
  
  /**
   * Gera nome único para arquivo
   * @param {File} file - Arquivo original
   * @param {string} prefix - Prefixo opcional
   * @returns {string} Nome único do arquivo
   */
  function generateUniqueFileName(file, prefix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    const prefixStr = prefix ? `${prefix}_` : '';
    return `${prefixStr}${baseName}_${timestamp}_${random}.${extension}`;
  }
  
  /**
   * Valida tipo de arquivo
   * @param {File} file - Arquivo a validar
   * @param {Array<string>} allowedTypes - Tipos MIME permitidos
   * @param {number} maxSizeMB - Tamanho máximo em MB
   * @returns {Object} {valid: boolean, error: string|null}
   */
  function validateFile(file, allowedTypes = [], maxSizeMB = 10) {
    if (!file) {
      return { valid: false, error: 'Arquivo não fornecido' };
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}` 
      };
    }
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { 
        valid: false, 
        error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB` 
      };
    }
    
    return { valid: true, error: null };
  }
  
  // ============================================
  // FUNÇÕES DE UPLOAD
  // ============================================
  
  /**
   * Faz upload de um arquivo para Firebase Storage
   * @param {string} userId - ID do usuário
   * @param {string|null} adId - ID do anúncio (opcional)
   * @param {File} file - Arquivo a fazer upload
   * @param {string} tipo - Tipo do arquivo: 'profile' | 'cover' | 'gallery' | 'videos' | 'audios' | 'documents'
   * @param {Function} onProgress - Callback de progresso (opcional)
   * @returns {Promise<string>} URL de download do arquivo
   */
  async function uploadFile(userId, adId, file, tipo, onProgress = null) {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }
    if (!file) {
      throw new Error('Arquivo é obrigatório');
    }
    
    // Validações por tipo
    const validations = {
      profile: { types: ['image/jpeg', 'image/png', 'image/webp'], maxSize: 5 },
      cover: { types: ['image/jpeg', 'image/png', 'image/webp'], maxSize: 10 },
      gallery: { types: ['image/jpeg', 'image/png', 'image/webp'], maxSize: 10 },
      videos: { types: ['video/mp4', 'video/webm', 'video/quicktime'], maxSize: 100 },
      audios: { types: ['audio/mpeg', 'audio/wav', 'audio/ogg'], maxSize: 20 },
      documents: { types: ['application/pdf', 'image/jpeg', 'image/png'], maxSize: 10 }
    };
    
    const validation = validations[tipo];
    if (!validation) {
      throw new Error(`Tipo inválido: ${tipo}. Tipos permitidos: ${Object.keys(validations).join(', ')}`);
    }
    
    // Validar arquivo
    const fileValidation = validateFile(file, validation.types, validation.maxSize);
    if (!fileValidation.valid) {
      throw new Error(fileValidation.error);
    }
    
    // Determinar path baseado no tipo
    let storagePath;
    const fileName = generateUniqueFileName(file, tipo);
    
    switch (tipo) {
      case 'profile':
        storagePath = `${PATHS.PUBLIC.PROFILE(userId)}/${fileName}`;
        break;
      case 'cover':
        if (!adId) throw new Error('adId é obrigatório para tipo "cover"');
        storagePath = `${PATHS.PUBLIC.AD_COVER(userId, adId)}/${fileName}`;
        break;
      case 'gallery':
        if (!adId) throw new Error('adId é obrigatório para tipo "gallery"');
        storagePath = `${PATHS.PUBLIC.AD_GALLERY(userId, adId)}/${fileName}`;
        break;
      case 'videos':
        if (!adId) throw new Error('adId é obrigatório para tipo "videos"');
        storagePath = `${PATHS.PUBLIC.AD_VIDEOS(userId, adId)}/${fileName}`;
        break;
      case 'audios':
        if (!adId) throw new Error('adId é obrigatório para tipo "audios"');
        storagePath = `${PATHS.PUBLIC.AD_AUDIOS(userId, adId)}/${fileName}`;
        break;
      case 'documents':
        storagePath = `${PATHS.PRIVATE.DOCUMENTS(userId)}/${fileName}`;
        break;
      default:
        throw new Error(`Tipo não implementado: ${tipo}`);
    }
    
    try {
      // Criar referência no Storage
      const storageRef = storage.ref();
      const fileRef = storageRef.child(storagePath);
      
      // Upload com metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
          fileType: tipo
        }
      };
      
      // Fazer upload
      const uploadTask = fileRef.put(file, metadata);
      
      // Retornar Promise com progresso
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progresso do upload
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload ${tipo}: ${progress.toFixed(2)}%`);
            
            // Chamar callback de progresso se fornecido
            if (onProgress && typeof onProgress === 'function') {
              onProgress({
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress: progress
              });
            }
          },
          (error) => {
            console.error(`Erro no upload de ${tipo}:`, error);
            reject(error);
          },
          async () => {
            try {
              // Obter URL de download
              const downloadURL = await fileRef.getDownloadURL();
              console.log(`✅ Upload concluído: ${tipo} - ${downloadURL}`);
              
              // Log para MongoDB futuro
              await logUploadToMongo({
                userId,
                adId: adId || null,
                fileType: tipo,
                fileName: fileName,
                fileSize: file.size,
                storagePath: storagePath,
                downloadURL: downloadURL,
                uploadedAt: new Date().toISOString()
              });
              
              resolve(downloadURL);
            } catch (error) {
              console.error('Erro ao obter URL de download:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error(`Erro ao fazer upload de ${tipo}:`, error);
      throw error;
    }
  }
  
  /**
   * Faz upload de múltiplos arquivos
   * @param {string} userId - ID do usuário
   * @param {string|null} adId - ID do anúncio (opcional)
   * @param {Array<File>} files - Array de arquivos
   * @param {string} tipo - Tipo dos arquivos
   * @param {Function} onProgress - Callback de progresso total (opcional)
   * @returns {Promise<Array<string>>} Array de URLs de download
   */
  async function uploadMultipleFiles(userId, adId, files, tipo, onProgress = null) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('Array de arquivos vazio ou inválido');
    }
    
    const uploadPromises = files.map((file, index) => {
      return uploadFile(userId, adId, file, tipo, (progress) => {
        if (onProgress) {
          // Calcular progresso total
          const totalProgress = ((index * 100) + progress.progress) / files.length;
          onProgress({
            fileIndex: index,
            totalFiles: files.length,
            fileProgress: progress.progress,
            totalProgress: totalProgress
          });
        }
      });
    });
    
    try {
      const urls = await Promise.all(uploadPromises);
      console.log(`✅ ${files.length} arquivos enviados com sucesso`);
      return urls;
    } catch (error) {
      console.error('Erro ao fazer upload de múltiplos arquivos:', error);
      throw error;
    }
  }
  
  // ============================================
  // FUNÇÕES DE DOWNLOAD E URL
  // ============================================
  
  /**
   * Obtém URL de download de um arquivo
   * @param {string} storagePath - Caminho completo no Storage
   * @returns {Promise<string>} URL de download
   */
  async function getDownloadURL(storagePath) {
    try {
      const storageRef = storage.ref();
      const fileRef = storageRef.child(storagePath);
      const url = await fileRef.getDownloadURL();
      return url;
    } catch (error) {
      console.error(`Erro ao obter URL de download para ${storagePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtém URLs de todos os arquivos em uma pasta
   * @param {string} folderPath - Caminho da pasta no Storage
   * @returns {Promise<Array<{name: string, url: string}>>} Array de objetos com nome e URL
   */
  async function getFolderURLs(folderPath) {
    try {
      const storageRef = storage.ref();
      const folderRef = storageRef.child(folderPath);
      const result = await folderRef.listAll();
      
      const urlPromises = result.items.map(async (itemRef) => {
        const url = await itemRef.getDownloadURL();
        return {
          name: itemRef.name,
          url: url
        };
      });
      
      const urls = await Promise.all(urlPromises);
      return urls;
    } catch (error) {
      console.error(`Erro ao obter URLs da pasta ${folderPath}:`, error);
      throw error;
    }
  }
  
  // ============================================
  // FUNÇÕES DE EXCLUSÃO
  // ============================================
  
  /**
   * Deleta um arquivo do Storage
   * @param {string} storagePath - Caminho completo do arquivo no Storage
   * @returns {Promise<void>}
   */
  async function deleteFile(storagePath) {
    try {
      const storageRef = storage.ref();
      const fileRef = storageRef.child(storagePath);
      await fileRef.delete();
      console.log(`✅ Arquivo deletado: ${storagePath}`);
      
      // Log para MongoDB futuro
      await logDeleteToMongo({
        storagePath: storagePath,
        deletedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Erro ao deletar arquivo ${storagePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Deleta todos os arquivos de uma pasta
   * @param {string} folderPath - Caminho da pasta no Storage
   * @returns {Promise<void>}
   */
  async function deleteFolder(folderPath) {
    try {
      const storageRef = storage.ref();
      const folderRef = storageRef.child(folderPath);
      const result = await folderRef.listAll();
      
      const deletePromises = result.items.map(itemRef => itemRef.delete());
      await Promise.all(deletePromises);
      
      console.log(`✅ Pasta deletada: ${folderPath}`);
    } catch (error) {
      console.error(`Erro ao deletar pasta ${folderPath}:`, error);
      throw error;
    }
  }
  
  // ============================================
  // FUNÇÕES STUB PARA MONGODB (FUTURO)
  // ============================================
  
  /**
   * Log de upload para MongoDB (stub - implementar no futuro)
   * @param {Object} data - Dados do upload
   * @returns {Promise<void>}
   */
  async function logUploadToMongo(data) {
    // TODO: Implementar integração com MongoDB
    // await saveUserEventToMongo('file_upload', data);
    console.log('📊 [MongoDB Stub] Log de upload:', data);
  }
  
  /**
   * Log de exclusão para MongoDB (stub - implementar no futuro)
   * @param {Object} data - Dados da exclusão
   * @returns {Promise<void>}
   */
  async function logDeleteToMongo(data) {
    // TODO: Implementar integração com MongoDB
    // await saveUserEventToMongo('file_delete', data);
    console.log('📊 [MongoDB Stub] Log de exclusão:', data);
  }
  
  // ============================================
  // API PÚBLICA
  // ============================================
  
  return {
    // Upload
    uploadFile,
    uploadMultipleFiles,
    
    // Download e URLs
    getDownloadURL,
    getFolderURLs,
    
    // Exclusão
    deleteFile,
    deleteFolder,
    
    // Paths (para referência)
    PATHS
  };
}

// Exportar para uso global ou módulo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = initStorageManager;
} else {
  window.StorageManager = initStorageManager;
}





