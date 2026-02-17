/**
 * Sistema de Upload Melhorado - Mansão do Job
 * Gerencia uploads com preview, validação e controle de quantidade
 */

class UploadManager {
  constructor(config) {
    this.config = {
      maxPhotos: 3,
      maxVideos: 1,
      maxTotalFiles: 4,
      maxPhotoSize: 3 * 1024 * 1024, // 3MB
      maxVideoSize: 20 * 1024 * 1024, // 20MB
      maxVideoDuration: 30, // 30 segundos
      minPhotoSize: 5 * 1024, // 5KB
      allowedPhotoTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      allowedVideoTypes: ["video/mp4", "video/avi", "video/mov", "video/wmv"],
      ...config
    };
    
    this.uploadedFiles = {
      photos: [],
      videos: [],
      total: 0
    };
    
    this.previewContainer = null;
    this.statusContainer = null;
  }

  /**
   * Inicializa o sistema de upload
   */
  init(containerId, statusId) {
    this.previewContainer = document.getElementById(containerId);
    this.statusContainer = document.getElementById(statusId);
    
    if (!this.previewContainer) {
      console.error('Container de preview não encontrado:', containerId);
      return;
    }
    
    this.renderUploadInterface();
    this.updateStatus();
  }

  /**
   * Renderiza a interface de upload
   */
  renderUploadInterface() {
    this.previewContainer.innerHTML = `
      <div class="upload-interface">
        <div class="upload-zones">
          <div class="upload-zone photos" id="photoUploadZone">
            <div class="upload-content">
              <i class="fas fa-camera"></i>
              <h3>Fotos de Documentos</h3>
              <p>Máximo 3 fotos (RG frente, verso + selfie)</p>
              <input type="file" id="photoInput" multiple accept="image/*" style="display: none;">
              <button type="button" class="btn-upload" onclick="document.getElementById('photoInput').click()">
                Selecionar Fotos
              </button>
            </div>
          </div>
          
          <div class="upload-zone videos" id="videoUploadZone">
            <div class="upload-content">
              <i class="fas fa-video"></i>
              <h3>Vídeo de Verificação</h3>
              <p>Máximo 1 vídeo (até 30 segundos)</p>
              <input type="file" id="videoInput" accept="video/*" style="display: none;">
              <button type="button" class="btn-upload" onclick="document.getElementById('videoInput').click()">
                Selecionar Vídeo
              </button>
            </div>
          </div>
        </div>
        
        <div class="preview-section" id="filePreviewSection">
          <h3>Preview dos Arquivos</h3>
          <div class="preview-container" id="previewContainer"></div>
        </div>
        
        <div class="upload-actions" id="uploadActions" style="display: none;">
          <button type="button" class="btn-confirm" id="confirmUploadBtn">
            <i class="fas fa-check"></i> Confirmar Upload
          </button>
          <button type="button" class="btn-cancel" id="cancelUploadBtn">
            <i class="fas fa-times"></i> Cancelar
          </button>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
  }

  /**
   * Configura os event listeners
   */
  setupEventListeners() {
    const photoInput = document.getElementById('photoInput');
    const videoInput = document.getElementById('videoInput');
    const confirmBtn = document.getElementById('confirmUploadBtn');
    const cancelBtn = document.getElementById('cancelUploadBtn');
    
    if (photoInput) {
      photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
    }
    
    if (videoInput) {
      videoInput.addEventListener('change', (e) => this.handleVideoUpload(e));
    }
    
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.confirmUpload());
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.cancelUpload());
    }
  }

  /**
   * Processa upload de fotos
   */
  async handlePhotoUpload(event) {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    // Verificar limite de fotos
    if (this.uploadedFiles.photos.length + files.length > this.config.maxPhotos) {
      this.showError(`Máximo ${this.config.maxPhotos} fotos permitidas. Você já tem ${this.uploadedFiles.photos.length} fotos.`);
      return;
    }
    
    // Verificar limite total
    if (this.uploadedFiles.total + files.length > this.config.maxTotalFiles) {
      this.showError(`Limite total de ${this.config.maxTotalFiles} arquivos atingido.`);
      return;
    }
    
    // Processar cada arquivo
    for (const file of files) {
      try {
        await this.validateAndAddPhoto(file);
      } catch (error) {
        this.showError(error.message);
        return;
      }
    }
    
    this.updatePreview();
    this.updateStatus();
    event.target.value = ''; // Limpar input
  }

  /**
   * Processa upload de vídeo
   */
  async handleVideoUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Verificar se já tem vídeo
    if (this.uploadedFiles.videos.length >= this.config.maxVideos) {
      this.showError('Máximo 1 vídeo permitido.');
      return;
    }
    
    // Verificar limite total
    if (this.uploadedFiles.total >= this.config.maxTotalFiles) {
      this.showError(`Limite total de ${this.config.maxTotalFiles} arquivos atingido.`);
      return;
    }
    
    try {
      await this.validateAndAddVideo(file);
      this.updatePreview();
      this.updateStatus();
    } catch (error) {
      this.showError(error.message);
    }
    
    event.target.value = ''; // Limpar input
  }

  /**
   * Valida e adiciona foto
   */
  async validateAndAddPhoto(file) {
    // Validar tipo
    if (!this.config.allowedPhotoTypes.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido. Use: ${this.config.allowedPhotoTypes.join(', ')}`);
    }
    
    // Validar tamanho
    if (file.size > this.config.maxPhotoSize) {
      const sizeMB = Math.round(this.config.maxPhotoSize / 1024 / 1024);
      throw new Error(`Foto muito grande. Máximo: ${sizeMB}MB`);
    }
    
    if (file.size < this.config.minPhotoSize) {
      const sizeKB = Math.round(this.config.minPhotoSize / 1024);
      throw new Error(`Foto muito pequena. Mínimo: ${sizeKB}KB`);
    }
    
    // Validar dimensões
    const dimensions = await this.getImageDimensions(file);
    if (dimensions.width < 200 || dimensions.height < 150) {
      throw new Error('Foto muito pequena. Mínimo: 200x150 pixels');
    }
    
    // Adicionar à lista
    this.uploadedFiles.photos.push({
      file: file,
      id: Date.now() + Math.random(),
      type: 'photo',
      dimensions: dimensions,
      size: file.size
    });
    
    this.uploadedFiles.total++;
  }

  /**
   * Valida e adiciona vídeo
   */
  async validateAndAddVideo(file) {
    // Validar tipo
    if (!this.config.allowedVideoTypes.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido. Use: ${this.config.allowedVideoTypes.join(', ')}`);
    }
    
    // Validar tamanho
    if (file.size > this.config.maxVideoSize) {
      const sizeMB = Math.round(this.config.maxVideoSize / 1024 / 1024);
      throw new Error(`Vídeo muito grande. Máximo: ${sizeMB}MB`);
    }
    
    // Validar duração
    const duration = await this.getVideoDuration(file);
    if (duration > this.config.maxVideoDuration) {
      throw new Error(`Vídeo muito longo. Máximo: ${this.config.maxVideoDuration} segundos`);
    }
    
    // Adicionar à lista
    this.uploadedFiles.videos.push({
      file: file,
      id: Date.now() + Math.random(),
      type: 'video',
      duration: duration,
      size: file.size
    });
    
    this.uploadedFiles.total++;
  }

  /**
   * Obtém dimensões da imagem
   */
  getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Obtém duração do vídeo
   */
  getVideoDuration(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => reject(new Error('Erro ao carregar vídeo'));
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Atualiza o preview dos arquivos
   */
  updatePreview() {
    const container = document.getElementById('previewContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Mostrar fotos
    this.uploadedFiles.photos.forEach((item, index) => {
      const preview = this.createPhotoPreview(item, index);
      container.appendChild(preview);
    });
    
    // Mostrar vídeos
    this.uploadedFiles.videos.forEach((item, index) => {
      const preview = this.createVideoPreview(item, index);
      container.appendChild(preview);
    });
    
    // Mostrar ações se há arquivos
    const actions = document.getElementById('uploadActions');
    if (actions) {
      actions.style.display = this.uploadedFiles.total > 0 ? 'block' : 'none';
    }
  }

  /**
   * Cria preview de foto
   */
  createPhotoPreview(item, index) {
    const div = document.createElement('div');
    div.className = 'file-preview photo-preview';
    div.innerHTML = `
      <div class="preview-content">
        <img src="${URL.createObjectURL(item.file)}" alt="Preview">
        <div class="preview-info">
          <span class="file-type">📷 Foto ${index + 1}</span>
          <span class="file-size">${this.formatFileSize(item.size)}</span>
          <span class="file-dimensions">${item.dimensions.width}x${item.dimensions.height}</span>
        </div>
        <button type="button" class="btn-remove" onclick="uploadManager.removeFile('${item.id}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    return div;
  }

  /**
   * Cria preview de vídeo
   */
  createVideoPreview(item, index) {
    const div = document.createElement('div');
    div.className = 'file-preview video-preview';
    div.innerHTML = `
      <div class="preview-content">
        <video src="${URL.createObjectURL(item.file)}" controls></video>
        <div class="preview-info">
          <span class="file-type">🎥 Vídeo ${index + 1}</span>
          <span class="file-size">${this.formatFileSize(item.size)}</span>
          <span class="file-duration">${Math.round(item.duration)}s</span>
        </div>
        <button type="button" class="btn-remove" onclick="uploadManager.removeFile('${item.id}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    return div;
  }

  /**
   * Remove arquivo da lista
   */
  removeFile(id) {
    // Remover foto
    const photoIndex = this.uploadedFiles.photos.findIndex(item => item.id === id);
    if (photoIndex !== -1) {
      this.uploadedFiles.photos.splice(photoIndex, 1);
      this.uploadedFiles.total--;
    }
    
    // Remover vídeo
    const videoIndex = this.uploadedFiles.videos.findIndex(item => item.id === id);
    if (videoIndex !== -1) {
      this.uploadedFiles.videos.splice(videoIndex, 1);
      this.uploadedFiles.total--;
    }
    
    this.updatePreview();
    this.updateStatus();
  }

  /**
   * Atualiza status do upload
   */
  updateStatus() {
    if (!this.statusContainer) return;
    
    const status = `
      <div class="upload-status">
        <div class="status-item">
          <span class="label">Fotos:</span>
          <span class="value">${this.uploadedFiles.photos.length}/${this.config.maxPhotos}</span>
        </div>
        <div class="status-item">
          <span class="label">Vídeos:</span>
          <span class="value">${this.uploadedFiles.videos.length}/${this.config.maxVideos}</span>
        </div>
        <div class="status-item">
          <span class="label">Total:</span>
          <span class="value">${this.uploadedFiles.total}/${this.config.maxTotalFiles}</span>
        </div>
      </div>
    `;
    
    this.statusContainer.innerHTML = status;
  }

  /**
   * Confirma upload
   */
  confirmUpload() {
    if (this.uploadedFiles.total === 0) {
      this.showError('Nenhum arquivo selecionado.');
      return;
    }
    
    // Validar se tem pelo menos 3 fotos
    if (this.uploadedFiles.photos.length < 3) {
      this.showError('É necessário pelo menos 3 fotos (RG frente, verso + selfie).');
      return;
    }
    
    // Disparar evento de confirmação
    const event = new CustomEvent('uploadConfirmed', {
      detail: {
        photos: this.uploadedFiles.photos,
        videos: this.uploadedFiles.videos,
        total: this.uploadedFiles.total
      }
    });
    
    document.dispatchEvent(event);
    
    this.showSuccess('Upload confirmado! Processando arquivos...');
  }

  /**
   * Cancela upload
   */
  cancelUpload() {
    this.uploadedFiles = {
      photos: [],
      videos: [],
      total: 0
    };
    
    this.updatePreview();
    this.updateStatus();
    
    this.showInfo('Upload cancelado. Todos os arquivos foram removidos.');
  }

  /**
   * Formata tamanho do arquivo
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Mostra mensagem de erro
   */
  showError(message) {
    this.showMessage(message, 'error');
  }

  /**
   * Mostra mensagem de sucesso
   */
  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  /**
   * Mostra mensagem de informação
   */
  showInfo(message) {
    this.showMessage(message, 'info');
  }

  /**
   * Mostra mensagem
   */
  showMessage(message, type) {
    if (!this.statusContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
      <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    this.statusContainer.appendChild(messageDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 5000);
  }
}

// Instância global
let uploadManager;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  uploadManager = new UploadManager();
});
