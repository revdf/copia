// 🔄 Função para sincronizar com MongoDB Atlas via webhook
async function syncToAtlas(firebaseData, action = "create") {
  try {
    console.log(`🔄 Enviando dados para Atlas - Ação: ${action}`);
    console.log("📊 Dados:", firebaseData);

    // URL do servidor Atlas
    const ATLAS_WEBHOOK_URL = "http://localhost:5000/api/sync-from-firebase";

    const payload = {
      firebaseData: {
        id: firebaseData.id,
        nome: firebaseData.nome,
        category: firebaseData.category || "mulher", // Usar categoria do formulário ou padrão
        categoria: firebaseData.categoria || "acompanhantes", // Usar categoria do formulário ou padrão
        status: firebaseData.status || "active",
        cidade: firebaseData.cidade,
        estado: firebaseData.estado,
        preco_1h: firebaseData.preco_1h,
        descricao: firebaseData.descricao,
        idade: firebaseData.idade,
        aparencia: firebaseData.aparencia,
        etnia: firebaseData.etnia,
        idiomas: firebaseData.idiomas,
        servicos: firebaseData.servicos,
        advertiserId: firebaseData.advertiserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      action: action,
    };

    const response = await fetch(ATLAS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Dados sincronizados com Atlas:", result);
      return result;
    } else {
      console.error("❌ Erro ao sincronizar com Atlas:", response.status);
      return null;
    }
  } catch (error) {
    console.error("❌ Erro na sincronização com Atlas:", error);
    return null;
  }
}

// Função de teste global
function testButton() {
  console.log("🧪 Botão de teste clicado!");
  alert("JavaScript está funcionando! ✅");
}

// Função de teste para upload de fotos
function testPhotoUpload() {
  console.log("📸 Teste de upload de fotos iniciado!");

  // Verificar se os elementos existem
  const capaUpload = document.getElementById("capa-upload-box");
  const capaInput = document.getElementById("capa-photo");
  const capaPreview = document.getElementById("capa-preview");

  console.log("📋 Elementos encontrados:", {
    capaUpload: !!capaUpload,
    capaInput: !!capaInput,
    capaPreview: !!capaPreview,
  });

  // Verificar se a função setupPhotoUploads foi chamada
  if (typeof setupPhotoUploads === "function") {
    console.log("✅ Função setupPhotoUploads existe");
  } else {
    console.error("❌ Função setupPhotoUploads não encontrada");
  }

  alert(
    `Teste de fotos concluído!\n\nVerifique o console (F12) para mais detalhes.\n\nElementos encontrados:\n- Upload Box: ${!!capaUpload}\n- Input: ${!!capaInput}\n- Preview: ${!!capaPreview}`
  );
}

// Função global para submissão confirmada
function submitFormConfirmed() {
  console.log("✅ Submissão confirmada pelo usuário");

  // Criar um evento de submissão
  const form = document.getElementById("cadastroForm");
  if (form) {
    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    handleFormSubmission(submitEvent);
  }
}

// Função para processar altura em diferentes formatos
function processHeightInput(value) {
  if (!value) return null;

  // Remove espaços e converte para minúsculo
  let cleanValue = value.toString().trim().toLowerCase();

  // Remove unidades (m, cm, metros, centimetros)
  cleanValue = cleanValue.replace(/[mc]m|metros?|centimetros?/g, "");

  // Se contém vírgula, substitui por ponto
  cleanValue = cleanValue.replace(",", ".");

  // Converte para número
  const numValue = parseFloat(cleanValue);

  if (isNaN(numValue)) return null;

  // Se o valor é menor que 10, assume que está em metros
  if (numValue < 10) {
    return Math.round(numValue * 100); // Converte metros para cm
  }

  // Se o valor é maior ou igual a 10, assume que está em cm
  return Math.round(numValue);
}

// Função para validar altura
function validateHeight(value) {
  const heightInCm = processHeightInput(value);

  if (!heightInCm) {
    return {
      valid: false,
      message: "Formato inválido. Use: 1,65m ou 165cm ou 1.65m",
    };
  }

  if (heightInCm < 68) {
    return {
      valid: false,
      message: "Altura muito baixa. Mínimo: 68cm",
    };
  }

  if (heightInCm > 215) {
    return {
      valid: false,
      message: "Altura muito alta. Máximo: 2,15m (215cm)",
    };
  }

  return {
    valid: true,
    heightInCm: heightInCm,
    message: `Altura válida: ${(heightInCm / 100).toFixed(2)}m`,
  };
}

// Modelo Cadastro de Anúncios - JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Variáveis globais
  let currentStep = 1;
  const totalSteps = 2;
  const form = document.getElementById("cadastroForm");
  const progressFill = document.getElementById("progressFill");
  const currentStepText = document.getElementById("currentStep");

  // Inicializar funcionalidades
  initFormValidation();
  initCharacterCounter();
  initFileUploads();
  initServiceValidation();
  initStepNavigation();
  initFormSubmission();
  initHeightValidation();

  // Validação do formulário
  function initFormValidation() {
    const requiredFields = form.querySelectorAll("[required]");

    requiredFields.forEach((field) => {
      field.addEventListener("blur", validateField);
      field.addEventListener("input", clearFieldError);
    });
  }

  function validateField(event) {
    const field = event.target;
    const value = field.value.trim();

    // Remover classes de erro anteriores
    field.classList.remove("error");

    // Validações específicas
    if (field.hasAttribute("required") && !value) {
      showFieldError(field, "Este campo é obrigatório");
      return false;
    }

    if (field.type === "email" && value && !isValidEmail(value)) {
      showFieldError(field, "Email inválido");
      return false;
    }

    if (field.type === "number" && value) {
      const min = field.getAttribute("min");
      const max = field.getAttribute("max");

      if (min && parseInt(value) < parseInt(min)) {
        showFieldError(field, `Valor mínimo: ${min}`);
        return false;
      }

      if (max && parseInt(value) > parseInt(max)) {
        showFieldError(field, `Valor máximo: ${max}`);
        return false;
      }
    }

    // Validação específica para campo de altura
    if (field.id === "altura" && value) {
      const validation = validateHeight(value);
      if (!validation.valid) {
        showFieldError(field, validation.message);
        return false;
      }
    }

    if (field.id === "descricao" && value.length < 15) {
      showFieldError(field, "Descrição deve ter pelo menos 15 caracteres");
      return false;
    }

    // Se chegou até aqui, o campo é válido
    field.classList.add("success");
    return true;
  }

  function showFieldError(field, message) {
    field.classList.add("error");

    // Remover mensagem de erro anterior
    const existingError = field.parentNode.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // Adicionar nova mensagem de erro
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.color = "#dc3545";
    errorDiv.style.fontSize = "0.8rem";
    errorDiv.style.marginTop = "0.25rem";

    field.parentNode.appendChild(errorDiv);
  }

  function clearFieldError(event) {
    const field = event.target;
    field.classList.remove("error");

    const errorMessage = field.parentNode.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Contador de caracteres
  function initCharacterCounter() {
    const descricaoField = document.getElementById("descricao");
    const charCount = document.getElementById("charCount");
    const charWarning = document.getElementById("charWarning");

    if (descricaoField && charCount && charWarning) {
      descricaoField.addEventListener("input", function () {
        const length = this.value.length;
        charCount.textContent = length;

        // Mostrar/esconder aviso
        if (length < 15) {
          charWarning.style.display = "block";
          charWarning.style.color = "#dc3545";
        } else {
          charWarning.style.display = "none";
        }

        // Mudar cor do contador
        if (length > 450) {
          charCount.style.color = "#dc3545";
        } else if (length > 400) {
          charCount.style.color = "#ffc107";
        } else {
          charCount.style.color = "#28a745";
        }
      });
    }
  }

  // Configurar upload de fotos
  function setupPhotoUploads() {
    console.log("📸 Iniciando configuração de upload de fotos...");

    // Configurar foto da capa
    console.log("📸 Configurando foto da capa...");
    setupSinglePhotoUpload("capa-upload-box", "capa-photo", "capa-preview");

    // Configurar foto do banner
    console.log("📸 Configurando foto do banner...");
    setupSinglePhotoUpload(
      "banner-upload-box",
      "banner-photo",
      "banner-preview"
    );

    // Configurar foto do stories
    console.log("📸 Configurando foto do stories...");
    setupSinglePhotoUpload(
      "stories-upload-box",
      "stories-photo",
      "stories-preview"
    );

    // Configurar fotos da galeria (8 fotos)
    console.log("📸 Configurando fotos da galeria...");
    for (let i = 1; i <= 8; i++) {
      setupSinglePhotoUpload(
        `galeria-upload-box-${i}`,
        `galeria-photo-${i}`,
        `galeria-preview-${i}`
      );
    }

    console.log("✅ Configuração de upload de fotos concluída!");
  }

  // Função para configurar upload de uma foto individual
  function setupSinglePhotoUpload(uploadBoxId, inputId, previewId) {
    console.log(
      `🔧 Configurando upload: ${uploadBoxId}, ${inputId}, ${previewId}`
    );

    const uploadArea = document.getElementById(uploadBoxId);
    const photoInput = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    console.log("📋 Elementos encontrados:", {
      uploadArea: !!uploadArea,
      photoInput: !!photoInput,
      preview: !!preview,
    });

    if (uploadArea && photoInput) {
      uploadArea.addEventListener("click", () => {
        console.log(`🖱️ Clique em ${uploadBoxId}`);
        photoInput.value = ""; // Limpar input
        setTimeout(() => photoInput.click(), 10);
      });

      uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.classList.add("dragover");
      });

      uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("dragover");
      });

      uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.classList.remove("dragover");
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          console.log(`📁 Arquivos dropados em ${uploadBoxId}:`, files.length);
          handleFileUpload(files, photoInput, preview);
        }
      });

      photoInput.addEventListener("change", (e) => {
        console.log(
          `📁 Arquivo selecionado em ${inputId}:`,
          e.target.files.length
        );
        handleFileUpload(e.target.files, photoInput, preview);
      });

      console.log(`✅ Event listeners adicionados para ${uploadBoxId}`);
    } else {
      console.error(`❌ Elementos não encontrados para ${uploadBoxId}`);
    }
  }

  // Upload de arquivos
  function initFileUploads() {
    // Configurar upload de fotos
    setupPhotoUploads();

    // Upload de vídeo com lógica melhorada
    const videoUpload = document.querySelector(".video-upload .upload-area");
    const videoCapa = document.getElementById("videoCapa");
    const videoPreview = document.getElementById("video-preview");

    if (videoUpload && videoCapa && videoPreview) {
      // Função para processar o arquivo selecionado
      function processVideoFile(file) {
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith("video/")) {
          alert("Por favor, selecione apenas arquivos de vídeo.");
          videoCapa.value = ""; // Limpar o input
          return;
        }

        // Validar tamanho do arquivo (100MB máximo)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
          alert(
            "O vídeo é muito grande. Por favor, selecione um vídeo menor que 100MB."
          );
          videoCapa.value = ""; // Limpar o input
          return;
        }

        // Verificar duração do vídeo (máximo 20 segundos)
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = function () {
          const duration = video.duration;

          if (duration > 30) {
            alert(
              `O vídeo deve ter no máximo 30 segundos. Duração atual: ${Math.round(
                duration
              )}s`
            );
            videoCapa.value = ""; // Limpar o input
            return;
          }

          // Criar URL do vídeo para preview
          const videoURL = URL.createObjectURL(file);

          // Adicionar o vídeo ao preview
          videoPreview.innerHTML = `<video src="${videoURL}" controls style="width: 100%; height: 100%; object-fit: cover;"></video>`;
          videoPreview.classList.add("show");
          videoPreview.style.display = "block";

          // Atualizar texto do upload
          const fileSize = (file.size / (1024 * 1024)).toFixed(1);
          const uploadText = videoUpload.querySelector("p");
          if (uploadText) {
            uploadText.innerHTML = `
              ${file.name}<br>
              <small style="color: #666;">${Math.round(
                duration
              )}s • ${fileSize}MB</small>
            `;
            uploadText.style.color = "#28a745";
          }

          // Adicionar classe para indicar que tem vídeo
          videoUpload.classList.add("has-video");
        };

        video.src = URL.createObjectURL(file);
      }

      // Event listener para clique na caixa de upload
      videoUpload.addEventListener("click", function (e) {
        // Não processar se o clique foi no próprio input
        if (e.target === videoCapa) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        // Limpar o input antes de abrir o seletor
        videoCapa.value = "";

        // Usar setTimeout para garantir que o input seja limpo antes de abrir
        setTimeout(() => {
          videoCapa.click();
        }, 10);
      });

      // Event listener para mudança no input
      videoCapa.addEventListener("change", (e) => {
        const file = e.target.files[0];
        processVideoFile(file);
      });
    }

    // Upload de áudio com lógica melhorada
    const audioUpload = document.querySelector(".audio-upload .upload-area");
    const audioFile = document.getElementById("audio");
    const audioPreview = document.getElementById("audio-preview");

    if (audioUpload && audioFile && audioPreview) {
      // Função para processar o arquivo selecionado
      function processAudioFile(file) {
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith("audio/")) {
          alert("Por favor, selecione apenas arquivos de áudio.");
          audioFile.value = ""; // Limpar o input
          return;
        }

        // Validar tamanho do arquivo (10MB máximo)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert(
            "O áudio é muito grande. Por favor, selecione um áudio menor que 10MB."
          );
          audioFile.value = ""; // Limpar o input
          return;
        }

        // Verificar duração do áudio (10-30 segundos)
        const audio = document.createElement("audio");
        audio.preload = "metadata";

        audio.onloadedmetadata = function () {
          const duration = audio.duration;

          if (duration < 10) {
            alert(
              `O áudio deve ter pelo menos 10 segundos. Duração atual: ${Math.round(
                duration
              )}s`
            );
            audioFile.value = ""; // Limpar o input
            return;
          }

          if (duration > 30) {
            alert(
              `O áudio deve ter no máximo 30 segundos. Duração atual: ${Math.round(
                duration
              )}s`
            );
            audioFile.value = ""; // Limpar o input
            return;
          }

          // Criar URL do áudio para preview
          const audioURL = URL.createObjectURL(file);

          // Adicionar o áudio ao preview
          audioPreview.innerHTML = `<audio src="${audioURL}" controls style="width: 80%; height: auto;"></audio>`;
          audioPreview.classList.add("show");
          audioPreview.style.display = "flex";

          // Atualizar texto do upload
          const fileSize = (file.size / (1024 * 1024)).toFixed(1);
          const uploadText = audioUpload.querySelector("p");
          if (uploadText) {
            uploadText.innerHTML = `
              ${file.name}<br>
              <small style="color: #666;">${Math.round(
                duration
              )}s • ${fileSize}MB</small>
            `;
            uploadText.style.color = "#28a745";
          }

          // Adicionar classe para indicar que tem áudio
          audioUpload.classList.add("has-audio");
        };

        audio.src = URL.createObjectURL(file);
      }

      // Event listener para clique na caixa de upload
      audioUpload.addEventListener("click", function (e) {
        // Não processar se o clique foi no próprio input
        if (e.target === audioFile) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        // Limpar o input antes de abrir o seletor
        audioFile.value = "";

        // Usar setTimeout para garantir que o input seja limpo antes de abrir
        setTimeout(() => {
          audioFile.click();
        }, 10);
      });

      // Event listener para mudança no input
      audioFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        processAudioFile(file);
      });
    }
  }

  function handleFileUpload(files, input, preview = null) {
    const maxFiles = 12;
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (files.length > maxFiles) {
      showNotification(`Máximo de ${maxFiles} fotos permitidas`, "error");
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        showNotification(`Arquivo ${file.name} excede 20MB`, "error");
        return;
      }

      if (!file.type.startsWith("image/")) {
        showNotification(
          `Arquivo ${file.name} não é uma imagem válida`,
          "error"
        );
        return;
      }

      // Mostrar preview da foto
      if (preview) {
        showPhotoPreview(file, preview);
      }
    });

    // Atualizar contador
    const photoCount = document.getElementById("photoCount");
    if (photoCount) {
      photoCount.textContent = `(${files.length}/12)`;
    }

    showNotification(
      `${files.length} foto(s) carregada(s) com sucesso!`,
      "success"
    );
  }

  // Função para mostrar preview da foto
  function showPhotoPreview(file, previewElement) {
    console.log("🖼️ showPhotoPreview chamada:", file, previewElement);

    if (!previewElement) {
      console.error("❌ previewElement não encontrado");
      return;
    }

    if (!file) {
      console.error("❌ arquivo não encontrado");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      console.log("📸 Preview carregado, atualizando DOM");

      previewElement.innerHTML = `
        <img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
      `;
      previewElement.style.display = "block";

      // Adicionar classe para indicar que tem foto
      const uploadBox = previewElement.closest(".foto-upload-box");
      if (uploadBox) {
        uploadBox.classList.add("has-photo");
        console.log("✅ Classe has-photo adicionada");
      } else {
        console.error("❌ uploadBox não encontrado");
      }
    };

    reader.onerror = function () {
      console.error("❌ Erro ao ler arquivo");
    };

    reader.readAsDataURL(file);
  }

  function handleVideoUpload(file) {
    // Esta função agora é apenas para compatibilidade
    // A validação real está na função processVideoFile
    showNotification("Vídeo carregado com sucesso!", "success");
  }

  function handleAudioUpload(file) {
    // Esta função agora é apenas para compatibilidade
    // A validação real está na função processAudioFile
    showNotification("Áudio carregado com sucesso!", "success");
  }

  // Validação de serviços
  function initServiceValidation() {
    const serviceCheckboxes = document.querySelectorAll(
      'input[name="servicos"]'
    );

    serviceCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", validateServices);
    });
  }

  function validateServices() {
    const checkedServices = document.querySelectorAll(
      'input[name="servicos"]:checked'
    );
    const minServices = 2;

    if (checkedServices.length < minServices) {
      showNotification(
        `Selecione pelo menos ${minServices} serviços`,
        "warning"
      );
    }
  }

  // Navegação entre etapas
  function initStepNavigation() {
    // Funções globais para os botões
    window.nextStep = nextStep;
    window.prevStep = prevStep;
  }

  function nextStep() {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        updateProgress();
      }
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
      updateProgress();
    }
  }

  function showStep(stepNumber) {
    // Esconder todas as etapas
    const steps = document.querySelectorAll(".form-step");
    steps.forEach((step) => step.classList.remove("active"));

    // Mostrar etapa atual
    const currentStepElement = document.getElementById(`step${stepNumber}`);
    if (currentStepElement) {
      currentStepElement.classList.add("active");
    }
  }

  function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;
    currentStepText.textContent = `Etapa ${currentStep} de ${totalSteps}`;
  }

  function validateCurrentStep() {
    console.log("🔍 Validando etapa atual:", currentStep);
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    console.log("📋 Elemento da etapa:", currentStepElement);

    if (!currentStepElement) {
      console.error("❌ Elemento da etapa não encontrado!");
      return false;
    }

    const requiredFields = currentStepElement.querySelectorAll("[required]");
    console.log("📝 Campos obrigatórios encontrados:", requiredFields.length);
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!validateField({ target: field })) {
        console.log("❌ Campo inválido:", field.name || field.id);
        isValid = false;
      }
    });

    // Validações específicas da etapa
    if (currentStep === 2) {
      // Validar serviços
      const checkedServices = document.querySelectorAll(
        'input[name="servicos"]:checked'
      );
      if (checkedServices.length < 2) {
        showNotification("Selecione pelo menos 2 serviços", "error");
        isValid = false;
      }

      // Validar descrição
      const descricao = document.getElementById("descricao");
      if (descricao && descricao.value.trim().length < 15) {
        showNotification(
          "Descrição deve ter pelo menos 15 caracteres",
          "error"
        );
        isValid = false;
      }
    }

    return isValid;
  }

  // Submissão do formulário
  function initFormSubmission() {
    console.log("🔧 Inicializando submissão do formulário...");
    console.log("📋 Formulário encontrado:", form);

    if (form) {
      form.addEventListener("submit", handleFormSubmission);
      console.log("✅ Event listener de submit adicionado com sucesso!");
    } else {
      console.error("❌ Erro: Formulário não encontrado!");
    }

    // Backup: adicionar event listener direto no botão
    const submitButton = document.querySelector(".btn-submit");
    if (submitButton) {
      console.log(
        "🔘 Botão de submit encontrado, adicionando event listener..."
      );
      submitButton.addEventListener("click", function (e) {
        console.log("🖱️ Botão clicado!");
        e.preventDefault();
        handleFormSubmission(e);
      });
    } else {
      console.error("❌ Botão de submit não encontrado!");
    }
  }

  function handleFormSubmission(event) {
    console.log("🚀 Função handleFormSubmission chamada!");
    console.log("📋 Evento recebido:", event);

    // Prevenir submissão se não for intencional
    if (event && event.type === "submit") {
      event.preventDefault();
    }

    console.log("🔍 Verificando validação...");
    if (!validateCurrentStep()) {
      console.log("❌ Validação falhou - parando execução");
      showNotification(
        "Por favor, corrija os erros antes de continuar",
        "error"
      );
      return;
    }
    console.log("✅ Validação passou!");

    console.log("✅ Validação passou, prosseguindo com o envio...");

    // Mostrar loading
    const submitButton = form.querySelector(".btn-submit");
    submitButton.classList.add("loading");
    submitButton.disabled = true;

    // Preparar dados do formulário
    const formData = new FormData();

    // Adicionar dados básicos
    const basicFields = [
      "nome",
      "descricao",
      "estado",
      "cidade",
      "bairro",
      "endereco",
      "idade",
      "nacionalidade",
      "servicos",
      "instagram",
      "facebook",
      "twitter",
      "privacidade",
      "preco_30min",
      "preco_45min",
      "preco_1h",
      "aparencia",
      "etnia",
      "idiomas",
      "aceita",
      "verificacao",
    ];

    basicFields.forEach((field) => {
      if (field === "servicos") {
        // Tratar checkboxes de serviços
        const checkboxes = form.querySelectorAll(`[name="${field}"]:checked`);
        checkboxes.forEach((checkbox) => {
          formData.append(field, checkbox.value);
        });
      } else {
        const element = form.querySelector(`[name="${field}"]`);
        if (element && element.value) {
          formData.append(field, element.value);
        }
      }
    });

    // Verificar se há imagem otimizada
    const imageData = window.imageOptimizer ? imageOptimizer.getImageData() : null;
    
    if (imageData) {
      // Usar imagem otimizada (mesma imagem para todos os usos)
      console.log("🚀 Usando imagem otimizada para capa, banner e stories");
      formData.append("banner", imageData.file);
      formData.append("foto_capa", imageData.file);
      formData.append("foto_stories", imageData.file);
      formData.append("image_optimized", "true");
      formData.append("optimization_usage", JSON.stringify(imageData.usage));
    } else {
      // Usar sistema tradicional (separado)
      const capaPhoto = document.getElementById("capa-photo");
      if (capaPhoto && capaPhoto.files.length > 0) {
        formData.append("banner", capaPhoto.files[0]);
        formData.append("foto_capa", capaPhoto.files[0]);
      }

      // Adicionar foto do banner
      const bannerPhoto = document.getElementById("banner-photo");
      if (bannerPhoto && bannerPhoto.files.length > 0) {
        formData.append("foto_banner", bannerPhoto.files[0]);
      }

      // Adicionar foto do stories
      const storiesPhoto = document.getElementById("stories-photo");
      if (storiesPhoto && storiesPhoto.files.length > 0) {
        formData.append("foto_stories", storiesPhoto.files[0]);
      }
    }

    // Adicionar fotos da galeria
    for (let i = 1; i <= 8; i++) {
      const galeriaPhoto = document.getElementById(`galeria-photo-${i}`);
      if (galeriaPhoto && galeriaPhoto.files.length > 0) {
        formData.append(`galeria_${i}`, galeriaPhoto.files[0]);
        formData.append("gallery", galeriaPhoto.files[0]);
      }
    }

    // Adicionar vídeo se existir
    const videoCapa = document.getElementById("videoCapa");
    if (videoCapa && videoCapa.files.length > 0) {
      formData.append("videos", videoCapa.files[0]);
    }

    // Adicionar áudio se existir
    const audioFile = document.getElementById("audio");
    if (audioFile && audioFile.files.length > 0) {
      formData.append("audio", audioFile.files[0]);
    }

    // Verificar se o usuário está autenticado
    console.log("👤 Verificando autenticação do usuário...");
    console.log("👤 currentUser:", currentUser);
    console.log("👤 typeof currentUser:", typeof currentUser);
    console.log("👤 currentUser?.uid:", currentUser?.uid);
    console.log("👤 currentUser?.email:", currentUser?.email);

    if (!currentUser) {
      console.log("❌ Usuário não autenticado!");
      console.log("❌ Redirecionando para página de login...");
      alert("Usuário não autenticado. Faça login novamente.");
      window.location.href = "criar-conta-Anuncio.html";
      return false;
    }

    console.log("✅ Usuário autenticado:", currentUser.email);

    // TESTE: Mostrar dados do formulário
    console.log("📋 Dados do formulário:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Salvar dados no Firebase
    saveAdvertisementToFirebase(formData);
  }

  // Função para salvar anúncio no Firebase
  async function saveAdvertisementToFirebase(formData) {
    try {
      console.log("🔥 Iniciando salvamento no Firebase...");
      console.log("📋 FormData recebido:", formData);
      
      showNotification("Salvando anúncio...", "info");

      // Mapeamento de slugs (valores dos checkboxes) para nomes completos em português
      const servicoSlugToNome = {
        // Serviços Básicos
        'beijos-boca': 'Beijos na boca',
        'oral-com-camisinha': 'Oral com camisinha',
        'oral-sem-camisinha': 'Oral sem camisinha',
        'oral-ate-final': 'Oral até o final',
        'sexo-anal': 'Sexo anal',
        'garganta-profunda': 'Garganta profunda',
        'massagem-erotica': 'Massagem erótica',
        'namoradinha': 'Namoradinha',
        // Serviços Especiais
        'beijo-negro': 'Beijo negro',
        'beijo-branco': 'Beijo branco',
        'ejaculacao-facial': 'Ejaculação facial',
        'ejaculacao-corpo': 'Ejaculação corpo',
        'chuva-dourada': 'Chuva dourada',
        'cubana': 'Cubana',
        'pse': 'PSE',
        'face-fucking': 'Face fucking',
        // Fetichismo e BDSM
        'fetichismo': 'Fetichismo',
        'sado-submissa': 'Sado submissa',
        'sado-dominadora': 'Sado dominadora',
        'sado-suave': 'Sado suave',
        'sado-duro': 'Sado duro',
        'fisting-anal': 'Fisting Anal',
        'brinquedos-sexuais': 'Brinquedos sexuais',
        'lingerie': 'Lingerie',
        // Atendimento em Grupo
        'atencao-casais': 'Atenção à casais',
        'duplas': 'Duplas',
        'trios': 'Trios',
        'orgia': 'Orgia',
        'festas-eventos': 'Festas e eventos',
        'despedida-solteiro': 'Despedida de solteiro',
        // Perfil e Estilo
        'ativa': 'Ativo',
        'passiva': 'Passivo',
        'versatil': 'Versátil',
        'inversao-papeis': 'Inversão de papéis',
        'lesbica': 'Lésbica',
        'atencao-mulheres': 'Atenção à mulheres',
        'experta-principiantes': 'Experto principiantes',
        'atencao-deficientes': 'Atenção à deficientes físicos',
        // Serviços Extras
        'fantasias-figurinos': 'Fantasias e figurinos',
        'sem-limite': 'Sem limite',
        'sexcam': 'Sexcam',
        'atendimento-domicilio': 'Atendimento em domicílio',
        'pacotes-promocionais': 'Pacotes promocionais',
        'acompanhante-eventos': 'Acompanhante para eventos'
      };

      // Preparar dados para o Firestore
      const servicosSlugs = formData.getAll("servicos") || [];
      // Converter slugs para nomes completos em português
      const servicosNomes = servicosSlugs.map(slug => servicoSlugToNome[slug] || slug);
      
      const advertisementData = {
        // Dados básicos
        nome: formData.get("nome") || "",
        descricao: formData.get("descricao") || "",
        estado: formData.get("estado") || "",
        cidade: formData.get("cidade") || "",
        bairro: formData.get("bairro") || "",
        endereco: formData.get("endereco") || "",
        idade: formData.get("idade") || "",
        nacionalidade: formData.get("nacionalidade") || "",

        // Converter altura para metros (processa diferentes formatos)
        altura: formData.get("altura")
          ? (processHeightInput(formData.get("altura")) / 100).toFixed(2)
          : "",
        instagram: formData.get("instagram") || "",
        facebook: formData.get("facebook") || "",
        twitter: formData.get("twitter") || "",
        privacidade: formData.get("privacidade") || "",
        preco_30min: formData.get("preco_30min") || "",
        preco_45min: formData.get("preco_45min") || "",
        preco_1h: formData.get("preco_1h") || "",
        aparencia: formData.get("aparencia") || "",
        etnia: formData.get("etnia") || "",
        idiomas: formData.get("idiomas") || "",
        aceita: formData.get("aceita") || "",
        verificacao: formData.get("verificacao") || "",

        // Serviços (convertidos para nomes completos em português)
        servicos: servicosNomes,

        // Categoria
        categoria: formData.get("categoria") || "acompanhantes",
        category: formData.get("categoria") || "acompanhantes",

        // Metadados
        advertiserId: currentUser.uid,
        status: "active", // Anúncios publicados diretamente
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      // Salvar dados básicos no Firestore
      const docRef = await db
        .collection("advertisements")
        .add(advertisementData);
      console.log("Anúncio salvo com ID:", docRef.id);

      // Upload de arquivos
      await uploadFilesToFirebase(formData, docRef.id);

      // 🔄 SINCRONIZAR COM MONGODB ATLAS VIA WEBHOOK
      console.log("🔄 Sincronizando com MongoDB Atlas...");
      await syncToAtlas({
        id: docRef.id,
        ...advertisementData
      }, "create");

      showNotification("Anúncio criado com sucesso!", "success");

      // Resetar formulário
      form.reset();

      // 🚪 FAZER LOGOUT AUTOMÁTICO APÓS CRIAR ANÚNCIO
      console.log("🚪 Iniciando logout automático após criação do anúncio...");
      
      // Função para fazer logout completo
      async function fazerLogoutCompleto() {
        try {
          // 1. Fazer logout do Firebase Auth
          if (typeof firebase !== 'undefined' && firebase.auth) {
            const auth = firebase.auth();
            if (auth && auth.currentUser) {
              await auth.signOut();
              console.log("✅ Logout do Firebase Auth realizado com sucesso");
            }
          }

          // 2. Limpar dados do localStorage relacionados à sessão
          const keysToRemove = [
            'adminToken',
            'authToken',
            'userUid',
            'userEmail',
            'userGender',
            'userCategory',
            'anuncioId',
            'cadastroData',
            'formData',
            'tempFormData',
            'formCache',
            'uploadCache',
            'draft_post_id',
            'wizard_step',
            'wizard_data',
            'tela_voltar_depois_processar',
            'aceitou_termos'
          ];

          keysToRemove.forEach(key => {
            try {
              localStorage.removeItem(key);
              console.log(`🧹 Removido do localStorage: ${key}`);
            } catch (e) {
              console.warn(`⚠️ Erro ao remover ${key} do localStorage:`, e);
            }
          });

          // 3. Limpar sessionStorage completamente
          try {
            sessionStorage.clear();
            console.log("✅ sessionStorage limpo completamente");
          } catch (e) {
            console.warn("⚠️ Erro ao limpar sessionStorage:", e);
          }

          // 4. Limpar dados do Firebase Auth no localStorage (chaves específicas do Firebase)
          try {
            // Firebase Auth armazena dados em chaves que começam com 'firebase:authUser:'
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('firebase:authUser:') || key.startsWith('firebase:host:')) {
                localStorage.removeItem(key);
                console.log(`🧹 Removido do localStorage: ${key}`);
              }
            });
          } catch (e) {
            console.warn("⚠️ Erro ao limpar dados do Firebase do localStorage:", e);
          }

          console.log("✅ Logout completo realizado com sucesso!");
        } catch (error) {
          console.error("❌ Erro ao fazer logout:", error);
          // Continuar mesmo se houver erro no logout
        }
      }

      // Executar logout e redirecionar
      setTimeout(async () => {
        // Fazer logout completo
        await fazerLogoutCompleto();

        // Redirecionar para página inicial
        console.log("🏠 Redirecionando para página inicial...");
        window.location.href = "A_01__index.html";
      }, 2000);
    } catch (error) {
      console.error("❌ ERRO AO SALVAR ANÚNCIO:", error);
      console.error("❌ Tipo do erro:", typeof error);
      console.error("❌ Mensagem do erro:", error.message);
      console.error("❌ Stack trace:", error.stack);
      
      // Mostrar erro detalhado para debug
      alert(`❌ ERRO AO SALVAR ANÚNCIO:\n\n${error.message}\n\nVerifique o console (F12) para mais detalhes.`);
      
      showNotification("Erro ao criar anúncio: " + error.message, "error");
    } finally {
      console.log("🔄 Finalizando processo de salvamento...");
      const submitButton = form.querySelector(".btn-submit");
      if (submitButton) {
        submitButton.classList.remove("loading");
        submitButton.disabled = false;
        console.log("✅ Botão de submit reabilitado");
      }
    }
  }

  // Função para fazer upload de arquivos para Firebase Storage
  async function uploadFilesToFirebase(formData, advertisementId) {
    const uploadPromises = [];

    // Upload banner
    const bannerFile = formData.get("banner");
    if (bannerFile && bannerFile.size > 0) {
      uploadPromises.push(
        uploadFileToStorage(
          bannerFile,
          `advertisements/${advertisementId}/banner`
        )
      );
    }

    // Upload vídeos
    const videoFile = formData.get("videos");
    if (videoFile && videoFile.size > 0) {
      uploadPromises.push(
        uploadFileToStorage(
          videoFile,
          `advertisements/${advertisementId}/video`
        )
      );
    }

    // Upload áudio
    const audioFile = formData.get("audio");
    if (audioFile && audioFile.size > 0) {
      uploadPromises.push(
        uploadFileToStorage(
          audioFile,
          `advertisements/${advertisementId}/audio`
        )
      );
    }

    // Upload foto da capa
    const capaFile = formData.get("foto_capa");
    if (capaFile && capaFile.size > 0) {
      uploadPromises.push(
        uploadFileToStorage(capaFile, `advertisements/${advertisementId}/capa`)
      );
    }

    // Upload foto do stories
    const storiesFile = formData.get("foto_stories");
    if (storiesFile && storiesFile.size > 0) {
      uploadPromises.push(
        uploadFileToStorage(
          storiesFile,
          `advertisements/${advertisementId}/stories`
        )
      );
    }

    // Upload fotos da galeria
    for (let i = 1; i <= 8; i++) {
      const galeriaFile = formData.get(`galeria_${i}`);
      if (galeriaFile && galeriaFile.size > 0) {
        uploadPromises.push(
          uploadFileToStorage(
            galeriaFile,
            `advertisements/${advertisementId}/galeria/${i}`
          )
        );
      }
    }

    // Aguardar todos os uploads
    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
      console.log("Todos os arquivos foram enviados com sucesso");
    }
  }

  // Função auxiliar para upload de arquivo
  async function uploadFileToStorage(file, path) {
    try {
      const storageRef = storage.ref();
      const fileRef = storageRef.child(path);

      const uploadTask = fileRef.put(file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload ${file.name}: ${progress}%`);
          },
          (error) => {
            console.error(`Erro no upload de ${file.name}:`, error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL =
                await uploadTask.snapshot.ref.getDownloadURL();
              console.log(`Upload concluído: ${file.name} - ${downloadURL}`);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error(`Erro ao fazer upload de ${file.name}:`, error);
      throw error;
    }
  }

  // Sistema de notificações
  function showNotification(message, type = "info") {
    // Remover notificação existente
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Criar nova notificação
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;

    // Estilos da notificação
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${getNotificationColor(type)};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remover após 4 segundos
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 4000);
  }

  function getNotificationIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    };
    return icons[type] || "info-circle";
  }

  function getNotificationColor(type) {
    const colors = {
      success: "#28a745",
      error: "#dc3545",
      warning: "#ffc107",
      info: "#17a2b8",
    };
    return colors[type] || "#17a2b8";
  }

  // Funcionalidades adicionais
  function initAdditionalFeatures() {
    // Auto-save do formulário
    const formFields = form.querySelectorAll("input, select, textarea");
    formFields.forEach((field) => {
      field.addEventListener("input", () => {
        saveFormData();
      });
    });

    // 🧹 SEMPRE LIMPAR DADOS - Página inicia limpa
    loadFormData();
  }

  function saveFormData() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    localStorage.setItem("cadastroAnuncio", JSON.stringify(data));
  }

  function loadFormData() {
    // 🧹 LIMPAR DADOS AUTOMATICAMENTE - Página sempre inicia limpa
    console.log("🧹 Limpando dados salvos para iniciar página limpa");
    localStorage.removeItem("cadastroAnuncio");
    
    // Limpar todos os campos do formulário
    clearAllFormFields();
  }

  // 🧹 Função para limpar todos os campos do formulário
  function clearAllFormFields() {
    console.log("🧹 Limpando todos os campos do formulário");
    
    // Limpar campos de texto, email, número, etc.
    const textFields = form.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], input[type="tel"], textarea, select');
    textFields.forEach(field => {
      field.value = '';
      field.classList.remove('error', 'success');
    });
    
    // Limpar checkboxes e radio buttons
    const checkboxes = form.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    checkboxes.forEach(field => {
      field.checked = false;
      // Remover classe active dos wrappers
      const wrapper = field.closest('.checkbox-wrapper-19, .btn');
      if (wrapper) {
        wrapper.classList.remove('active');
      }
    });
    
    // Limpar campos de arquivo
    const fileFields = form.querySelectorAll('input[type="file"]');
    fileFields.forEach(field => {
      field.value = '';
    });
    
    // Limpar previews de imagens
    const previews = form.querySelectorAll('.photo-preview, .video-preview, .audio-preview');
    previews.forEach(preview => {
      preview.innerHTML = '';
      preview.style.display = 'none';
    });
    
    // Limpar upload boxes
    const uploadBoxes = form.querySelectorAll('.upload-box');
    uploadBoxes.forEach(box => {
      const placeholder = box.querySelector('.upload-placeholder');
      if (placeholder) {
        placeholder.style.display = 'block';
      }
    });
    
    console.log("✅ Todos os campos foram limpos");
  }

  // 🧹 LIMPAR PÁGINA AO CARREGAR - Garantir que sempre inicie limpa
  document.addEventListener('DOMContentLoaded', function() {
    console.log("🧹 DOM carregado - limpando página automaticamente");
    setTimeout(() => {
      if (typeof clearAllFormFields === 'function') {
        clearAllFormFields();
      }
    }, 100); // Pequeno delay para garantir que o DOM esteja pronto
  });

  // Inicializar funcionalidades adicionais
  initAdditionalFeatures();

  // Função para inicializar validação de altura
  function initHeightValidation() {
    const alturaField = document.getElementById("altura");
    if (!alturaField) return;

    // Adicionar event listener para validação em tempo real
    alturaField.addEventListener("input", function () {
      const value = this.value;
      const validation = validateHeight(value);

      // Remover classes anteriores
      this.classList.remove("success", "error");

      if (value.length > 0) {
        if (validation.valid) {
          this.classList.add("success");
          this.setCustomValidity("");
        } else {
          this.classList.add("error");
          this.setCustomValidity(validation.message);
        }
      }
    });

    // Adicionar event listener para validação ao sair do campo
    alturaField.addEventListener("blur", function () {
      const value = this.value;
      const validation = validateHeight(value);

      if (value.length > 0 && !validation.valid) {
        alert(validation.message);
      }
    });

    console.log("📏 Validação de altura configurada com sucesso!");
  }

  // Inicializar validação de altura
  initHeightValidation();

  console.log("Modelo de Cadastro carregado com sucesso!");
});
