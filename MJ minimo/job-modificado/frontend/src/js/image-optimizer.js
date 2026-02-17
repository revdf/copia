/**
 * Sistema de Otimização de Imagens - Mansão do Job
 * Evita duplicação de imagens reutilizando a mesma foto para capa e banner
 */

class ImageOptimizer {
  constructor() {
    this.mainImage = null;
    this.imageUsage = {
      capa: false,
      banner: false,
      stories: false
    };
  }

  /**
   * Inicializa o sistema de otimização
   */
  init() {
    this.setupImageReuseInterface();
    this.setupEventListeners();
  }

  /**
   * Cria interface para reutilização de imagens
   */
  setupImageReuseInterface() {
    // Encontrar ou criar container para o sistema otimizado
    let container = document.getElementById('imageOptimizerContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'imageOptimizerContainer';
      container.className = 'image-optimizer-container';
      
      // Inserir antes da seção de fotos existente
      const fotoGallery = document.querySelector('.foto-gallery');
      if (fotoGallery) {
        fotoGallery.parentNode.insertBefore(container, fotoGallery);
      }
    }

    container.innerHTML = `
      <div class="optimized-image-section">
        <h3>📸 Imagem Principal do Anúncio</h3>
        <p class="optimization-info">
          <i class="fas fa-info-circle"></i>
          <strong>Otimização:</strong> A mesma imagem será usada para capa, banner e stories, 
          evitando duplicação desnecessária de arquivos.
        </p>
        
        <div class="main-image-upload">
          <div class="upload-zone" id="mainImageUploadZone">
            <div class="upload-content">
              <i class="fas fa-image"></i>
              <h4>Imagem Principal</h4>
              <p>Esta imagem será usada para:</p>
              <ul class="usage-list">
                <li><i class="fas fa-check"></i> Foto da capa (listas)</li>
                <li><i class="fas fa-check"></i> Banner do anúncio</li>
                <li><i class="fas fa-check"></i> Foto do stories</li>
              </ul>
              <input type="file" id="mainImageInput" accept="image/*" style="display: none;">
              <button type="button" class="btn-select-image" onclick="document.getElementById('mainImageInput').click()">
                <i class="fas fa-upload"></i> Selecionar Imagem
              </button>
            </div>
          </div>
          
          <div class="image-preview" id="mainImagePreview" style="display: none;">
            <div class="preview-header">
              <h4>Imagem Selecionada</h4>
              <button type="button" class="btn-remove-image" onclick="imageOptimizer.removeMainImage()">
                <i class="fas fa-times"></i> Remover
              </button>
            </div>
            <div class="preview-content">
              <img id="previewImage" alt="Preview da imagem principal">
              <div class="image-info">
                <div class="info-item">
                  <span class="label">Tamanho:</span>
                  <span class="value" id="imageSize">-</span>
                </div>
                <div class="info-item">
                  <span class="label">Dimensões:</span>
                  <span class="value" id="imageDimensions">-</span>
                </div>
                <div class="info-item">
                  <span class="label">Uso:</span>
                  <span class="value">Capa + Banner + Stories</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="optimization-benefits">
          <h4>✅ Benefícios da Otimização:</h4>
          <ul>
            <li><strong>Economia de espaço:</strong> 1 arquivo em vez de 3</li>
            <li><strong>Upload mais rápido:</strong> Menos dados para transferir</li>
            <li><strong>Consistência visual:</strong> Mesma imagem em todos os locais</li>
            <li><strong>Facilidade de uso:</strong> Selecionar apenas 1 imagem</li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    const mainImageInput = document.getElementById('mainImageInput');
    if (mainImageInput) {
      mainImageInput.addEventListener('change', (e) => this.handleMainImageUpload(e));
    }
  }

  /**
   * Processa upload da imagem principal
   */
  async handleMainImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validar arquivo
      await this.validateImage(file);
      
      // Definir como imagem principal
      this.mainImage = file;
      
      // Mostrar preview
      this.showImagePreview(file);
      
      // Atualizar campos do formulário
      this.updateFormFields(file);
      
      // Mostrar mensagem de sucesso
      this.showMessage('Imagem principal selecionada! Será usada para capa, banner e stories.', 'success');
      
    } catch (error) {
      this.showMessage(error.message, 'error');
      event.target.value = ''; // Limpar input
    }
  }

  /**
   * Valida a imagem
   */
  async validateImage(file) {
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      throw new Error('Por favor, selecione apenas arquivos de imagem.');
    }

    // Validar tamanho (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`Imagem muito grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Validar dimensões
    const dimensions = await this.getImageDimensions(file);
    if (dimensions.width < 400 || dimensions.height < 300) {
      throw new Error('Imagem muito pequena. Mínimo: 400x300 pixels para boa qualidade.');
    }

    return true;
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
   * Mostra preview da imagem
   */
  showImagePreview(file) {
    const preview = document.getElementById('mainImagePreview');
    const previewImage = document.getElementById('previewImage');
    const imageSize = document.getElementById('imageSize');
    const imageDimensions = document.getElementById('imageDimensions');
    
    if (!preview || !previewImage) return;

    // Mostrar preview
    preview.style.display = 'block';
    
    // Carregar imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Atualizar informações
    imageSize.textContent = this.formatFileSize(file.size);
    
    // Obter dimensões
    this.getImageDimensions(file).then(dimensions => {
      imageDimensions.textContent = `${dimensions.width}x${dimensions.height}`;
    });
  }

  /**
   * Atualiza campos do formulário com a mesma imagem
   */
  updateFormFields(file) {
    // Atualizar campo de capa
    const capaInput = document.getElementById('capa-photo');
    if (capaInput) {
      this.setFileToInput(capaInput, file);
    }

    // Atualizar campo de stories
    const storiesInput = document.getElementById('perfil-photo');
    if (storiesInput) {
      this.setFileToInput(storiesInput, file);
    }

    // Atualizar campo de banner (se existir)
    const bannerInput = document.getElementById('banner_capa') || document.getElementById('foto-capa-input');
    if (bannerInput) {
      this.setFileToInput(bannerInput, file);
    }

    // Atualizar previews existentes
    this.updateExistingPreviews(file);
  }

  /**
   * Define arquivo em um input
   */
  setFileToInput(input, file) {
    // Criar novo FileList
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;
    
    // Disparar evento de mudança
    const event = new Event('change', { bubbles: true });
    input.dispatchEvent(event);
  }

  /**
   * Atualiza previews existentes
   */
  updateExistingPreviews(file) {
    // Atualizar preview da capa
    const capaPreview = document.getElementById('capa-preview');
    if (capaPreview) {
      this.updatePreviewElement(capaPreview, file);
    }

    // Atualizar preview do stories
    const storiesPreview = document.getElementById('perfil-preview');
    if (storiesPreview) {
      this.updatePreviewElement(storiesPreview, file);
    }
  }

  /**
   * Atualiza elemento de preview
   */
  updatePreviewElement(previewElement, file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Limpar preview anterior
      previewElement.innerHTML = '';
      
      // Criar novo preview
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.cssText = `
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      `;
      
      previewElement.appendChild(img);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Remove imagem principal
   */
  removeMainImage() {
    this.mainImage = null;
    
    // Esconder preview
    const preview = document.getElementById('mainImagePreview');
    if (preview) {
      preview.style.display = 'none';
    }

    // Limpar inputs
    const inputs = [
      document.getElementById('capa-photo'),
      document.getElementById('perfil-photo'),
      document.getElementById('banner_capa'),
      document.getElementById('foto-capa-input')
    ];

    inputs.forEach(input => {
      if (input) {
        input.value = '';
        // Disparar evento de mudança
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      }
    });

    // Limpar previews
    const previews = [
      document.getElementById('capa-preview'),
      document.getElementById('perfil-preview')
    ];

    previews.forEach(preview => {
      if (preview) {
        preview.innerHTML = '';
      }
    });

    this.showMessage('Imagem removida. Você pode selecionar uma nova imagem.', 'info');
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
   * Mostra mensagem
   */
  showMessage(message, type) {
    // Criar ou encontrar container de mensagens
    let messageContainer = document.getElementById('imageOptimizerMessages');
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.id = 'imageOptimizerMessages';
      messageContainer.className = 'image-optimizer-messages';
      
      const container = document.getElementById('imageOptimizerContainer');
      if (container) {
        container.appendChild(messageContainer);
      }
    }

    // Criar mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
      <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    messageContainer.appendChild(messageDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 5000);
  }

  /**
   * Obtém dados da imagem principal para envio
   */
  getImageData() {
    if (!this.mainImage) {
      return null;
    }

    return {
      file: this.mainImage,
      usage: ['capa', 'banner', 'stories'],
      size: this.mainImage.size,
      type: this.mainImage.type
    };
  }
}

// Instância global
let imageOptimizer;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  imageOptimizer = new ImageOptimizer();
  imageOptimizer.init();
});
