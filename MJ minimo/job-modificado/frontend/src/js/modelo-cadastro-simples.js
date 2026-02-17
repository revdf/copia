// 🔄 Versão simplificada - apenas upload e preview de fotos
// Sem lógica de banco de dados ou autenticação

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

  alert(
    `Teste de fotos concluído!\n\nVerifique o console (F12) para mais detalhes.\n\nElementos encontrados:\n- Upload Box: ${!!capaUpload}\n- Input: ${!!capaInput}\n- Preview: ${!!capaPreview}`
  );
}

// Modelo Cadastro de Anúncios - JavaScript Simplificado
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Página de cadastro simplificada carregada!");

  // Inicializar funcionalidades
  initFileUploads();
  initFormValidation();
  initCharacterCounter();
  initServiceValidation();
  initStepNavigation();
  initHeightValidation();

  console.log("✅ Todas as funcionalidades inicializadas!");
});

// Validação de formulário
function initFormValidation() {
  console.log("📋 Inicializando validação de formulário...");
  
  const form = document.getElementById("cadastroForm");
  if (!form) {
    console.log("⚠️ Formulário não encontrado");
    return;
  }

  // Validação em tempo real
  const inputs = form.querySelectorAll("input, textarea, select");
  inputs.forEach((input) => {
    input.addEventListener("blur", validateField);
    input.addEventListener("input", clearFieldError);
  });

  console.log("✅ Validação de formulário configurada");
}

function validateField(event) {
  const field = event.target;
  const value = field.value.trim();

  // Limpar erro anterior
  clearFieldError(event);

  // Validações básicas
  if (field.hasAttribute("required") && !value) {
    showFieldError(field, "Este campo é obrigatório");
    return false;
  }

  // Validação de email
  if (field.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFieldError(field, "Email inválido");
      return false;
    }
  }

  // Validação de telefone
  if (field.name === "telefone" && value) {
    const phoneRegex = /^[\d\s\(\)\-\+]+$/;
    if (!phoneRegex.test(value) || value.length < 10) {
      showFieldError(field, "Telefone inválido");
      return false;
    }
  }

  return true;
}

function showFieldError(field, message) {
  field.classList.add("error");
  
  let errorDiv = field.parentNode.querySelector(".field-error");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.style.color = "#dc3545";
    errorDiv.style.fontSize = "0.875rem";
    errorDiv.style.marginTop = "0.25rem";
    field.parentNode.appendChild(errorDiv);
  }
  
  errorDiv.textContent = message;
}

function clearFieldError(event) {
  const field = event.target;
  field.classList.remove("error");
  
  const errorDiv = field.parentNode.querySelector(".field-error");
  if (errorDiv) {
    errorDiv.remove();
  }
}

// Contador de caracteres
function initCharacterCounter() {
  console.log("📊 Inicializando contador de caracteres...");
  
  const textareas = document.querySelectorAll("textarea[data-max-length]");
  textareas.forEach((textarea) => {
    const maxLength = parseInt(textarea.getAttribute("data-max-length"));
    if (maxLength) {
      setupCharacterCounter(textarea, maxLength);
    }
  });

  console.log("✅ Contador de caracteres configurado");
}

function setupCharacterCounter(textarea, maxLength) {
  const counter = document.createElement("div");
  counter.className = "character-counter";
  counter.style.fontSize = "0.875rem";
  counter.style.color = "#6c757d";
  counter.style.textAlign = "right";
  counter.style.marginTop = "0.25rem";
  
  textarea.parentNode.appendChild(counter);
  
  function updateCounter() {
    const currentLength = textarea.value.length;
    counter.textContent = `${currentLength}/${maxLength}`;
    
    if (currentLength > maxLength * 0.9) {
      counter.style.color = "#dc3545";
    } else if (currentLength > maxLength * 0.7) {
      counter.style.color = "#ffc107";
    } else {
      counter.style.color = "#6c757d";
    }
  }
  
  textarea.addEventListener("input", updateCounter);
  updateCounter();
}

// Validação de serviços
function initServiceValidation() {
  console.log("🔧 Inicializando validação de serviços...");
  
  const serviceCheckboxes = document.querySelectorAll('input[name="servicos[]"]');
  const serviceContainer = document.querySelector(".servicos-container");
  
  if (!serviceContainer) {
    console.log("⚠️ Container de serviços não encontrado");
    return;
  }

  serviceCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", validateServices);
  });

  console.log("✅ Validação de serviços configurada");
}

function validateServices() {
  const selectedServices = document.querySelectorAll('input[name="servicos[]"]:checked');
  const serviceError = document.querySelector(".service-error");
  
  if (selectedServices.length === 0) {
    if (!serviceError) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "service-error";
      errorDiv.style.color = "#dc3545";
      errorDiv.style.fontSize = "0.875rem";
      errorDiv.style.marginTop = "0.5rem";
      errorDiv.textContent = "Selecione pelo menos um serviço";
      document.querySelector(".servicos-container").appendChild(errorDiv);
    }
    return false;
  } else {
    if (serviceError) {
      serviceError.remove();
    }
    return true;
  }
}

// Navegação entre etapas
function initStepNavigation() {
  console.log("📋 Inicializando navegação entre etapas...");
  
  const nextButton = document.getElementById("nextStep");
  const prevButton = document.getElementById("prevStep");
  
  if (nextButton) {
    nextButton.addEventListener("click", nextStep);
  }
  
  if (prevButton) {
    prevButton.addEventListener("click", prevStep);
  }

  console.log("✅ Navegação entre etapas configurada");
}

let currentStep = 1;
const totalSteps = 2;

function nextStep() {
  if (validateCurrentStep()) {
    if (currentStep < totalSteps) {
      currentStep++;
      updateStepDisplay();
      updateStepVisibility();
    }
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateStepDisplay();
    updateStepVisibility();
  }
}

function validateCurrentStep() {
  const currentSection = document.querySelector(`.form-section[data-step="${currentStep}"]`);
  if (!currentSection) return true;

  const requiredFields = currentSection.querySelectorAll("[required]");
  let isValid = true;

  requiredFields.forEach((field) => {
    if (!validateField({ target: field })) {
      isValid = false;
    }
  });

  // Validação específica de serviços na etapa 1
  if (currentStep === 1) {
    isValid = validateServices() && isValid;
  }

  return isValid;
}

function updateStepDisplay() {
  const progressFill = document.getElementById("progressFill");
  const currentStepText = document.getElementById("currentStep");
  
  if (progressFill) {
    progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
  }
  
  if (currentStepText) {
    currentStepText.textContent = `Etapa ${currentStep} de ${totalSteps}`;
  }
}

function updateStepVisibility() {
  const sections = document.querySelectorAll(".form-section");
  sections.forEach((section, index) => {
    if (index + 1 === currentStep) {
      section.style.display = "block";
      section.style.opacity = "1";
    } else {
      section.style.display = "none";
      section.style.opacity = "0.5";
    }
  });
}

// Validação de altura
function initHeightValidation() {
  console.log("📏 Inicializando validação de altura...");
  
  const alturaField = document.getElementById("altura");
  if (alturaField) {
    alturaField.addEventListener("input", validateHeight);
  }

  console.log("✅ Validação de altura configurada");
}

function validateHeight(event) {
  const field = event.target;
  const value = field.value.trim();
  
  clearFieldError(event);
  
  if (value) {
    const heightInCm = parseFloat(value);
    if (isNaN(heightInCm) || heightInCm < 100 || heightInCm > 250) {
      showFieldError(field, "Altura deve estar entre 100cm e 250cm");
      return false;
    }
  }
  
  return true;
}

// Upload de arquivos - FUNCIONALIDADE PRINCIPAL
function initFileUploads() {
  console.log("📸 Inicializando upload de arquivos...");
  
  // Configurar upload de fotos
  setupPhotoUploads();

  console.log("✅ Upload de arquivos configurado");
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
    const currentCount = document.querySelectorAll(".photo-preview img").length;
    photoCount.textContent = `${currentCount} foto(s) selecionada(s)`;
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
    }
  };

  reader.onerror = function () {
    console.error("❌ Erro ao ler arquivo");
    showNotification("Erro ao carregar imagem", "error");
  };

  reader.readAsDataURL(file);
}

// Sistema de notificações
function showNotification(message, type = "info") {
  console.log(`📢 Notificação [${type}]: ${message}`);
  
  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;

  // Cores baseadas no tipo
  const colors = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8"
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;

  // Adicionar ao DOM
  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Remover após 5 segundos
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// Função para limpar todos os campos do formulário
function clearAllFormFields() {
  console.log("🧹 Limpando todos os campos do formulário...");
  
  const form = document.getElementById("cadastroForm");
  if (!form) {
    console.log("⚠️ Formulário não encontrado");
    return;
  }

  // Limpar inputs de texto
  const textInputs = form.querySelectorAll("input[type='text'], input[type='email'], input[type='tel'], input[type='number'], textarea");
  textInputs.forEach(input => {
    input.value = "";
    input.classList.remove("error");
  });

  // Limpar radio buttons
  const radioButtons = form.querySelectorAll("input[type='radio']");
  radioButtons.forEach(radio => {
    radio.checked = false;
  });

  // Limpar checkboxes
  const checkboxes = form.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });

  // Limpar selects
  const selects = form.querySelectorAll("select");
  selects.forEach(select => {
    select.selectedIndex = 0;
  });

  // Limpar previews de fotos
  const photoPreviews = form.querySelectorAll(".photo-preview");
  photoPreviews.forEach(preview => {
    preview.innerHTML = "";
    preview.style.display = "none";
  });

  // Limpar inputs de arquivo
  const fileInputs = form.querySelectorAll("input[type='file']");
  fileInputs.forEach(input => {
    input.value = "";
  });

  // Limpar erros de campo
  const errorMessages = form.querySelectorAll(".field-error, .service-error");
  errorMessages.forEach(error => {
    error.remove();
  });

  // Resetar para primeira etapa
  currentStep = 1;
  updateStepDisplay();
  updateStepVisibility();
  
  console.log("✅ Todos os campos foram limpos");
}

// 🧹 LIMPAR PÁGINA AO CARREGAR - Garantir que sempre inicie limpa
document.addEventListener('DOMContentLoaded', function() {
  console.log("🧹 DOM carregado - limpando página automaticamente");
  setTimeout(() => {
    if (typeof clearAllFormFields === 'function') {
      clearAllFormFields();
    }
  }, 100);
});

console.log("📄 Script de cadastro simplificado carregado!");