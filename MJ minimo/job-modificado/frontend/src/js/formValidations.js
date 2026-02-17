/**
 * ============================================
 * FORM VALIDATIONS - Validações de Formulário
 * ============================================
 * 
 * Módulo centralizado para validações de campos de formulário
 * em todas as páginas de cadastro de anúncios.
 * 
 * Validações implementadas:
 * - Altura: mínimo 45cm, máximo 245cm (2m45cm)
 * - Valor/Preço: mínimo 1, máximo 20000, sem decimais
 * 
 * @author Sistema Padronizado
 * @version 1.0.0
 */

// ============================================
// VALIDAÇÃO DE ALTURA
// ============================================

/**
 * Valida campo de altura
 * @param {string} value - Valor do campo altura
 * @param {HTMLElement} inputElement - Elemento input (opcional)
 * @param {HTMLElement} errorElement - Elemento para exibir erro (opcional)
 * @returns {Object} {valid: boolean, alturaCm: number|null, message: string}
 */
function validateHeight(value, inputElement = null, errorElement = null) {
  // Limpar espaços
  if (!value || !value.trim()) {
    if (errorElement) {
      errorElement.textContent = 'Altura é obrigatória';
      errorElement.style.display = 'block';
    }
    if (inputElement) {
      inputElement.style.borderColor = '#dc3545';
    }
    return { valid: false, alturaCm: null, message: 'Altura é obrigatória' };
  }
  
  const minCm = 45; // Mínimo: 45cm
  const maxCm = 245; // Máximo: 2m45cm (245cm)
  
  // Remover espaços e converter para minúsculas
  let alturaStr = value.trim().toLowerCase().replace(/\s/g, '');
  
  // Converter diferentes formatos para centímetros
  let alturaCm = null;
  
  // Padrão: 165cm, 165 cm
  if (alturaStr.match(/^(\d+(?:[.,]\d+)?)\s*cm$/)) {
    alturaCm = parseFloat(alturaStr.replace(/cm$/, '').replace(',', '.'));
  }
  // Padrão: 1.65m, 1,65m, 1.65 m, 1,65 m
  else if (alturaStr.match(/^(\d+(?:[.,]\d+)?)\s*m$/)) {
    alturaCm = parseFloat(alturaStr.replace(/m$/, '').replace(',', '.')) * 100;
  }
  // Padrão: apenas número (assume centímetros se >= 45, senão metros)
  else if (alturaStr.match(/^\d+(?:[.,]\d+)?$/)) {
    alturaCm = parseFloat(alturaStr.replace(',', '.'));
    // Se número pequeno (< 3), assume que é em metros
    if (alturaCm < 3) {
      alturaCm = alturaCm * 100;
    }
  }
  
  // Validar se conseguiu converter
  if (alturaCm === null || isNaN(alturaCm)) {
    const errorMsg = 'Formato inválido. Use: 1.65m, 165cm ou 1,65m';
    if (errorElement) {
      errorElement.textContent = errorMsg;
      errorElement.style.display = 'block';
    }
    if (inputElement) {
      inputElement.style.borderColor = '#dc3545';
    }
    return { valid: false, alturaCm: null, message: errorMsg };
  }
  
  // Validar limites
  if (alturaCm < minCm) {
    const errorMsg = `Altura muito baixa. Mínimo: ${minCm}cm (${(minCm/100).toFixed(2)}m)`;
    if (errorElement) {
      errorElement.textContent = errorMsg;
      errorElement.style.display = 'block';
    }
    if (inputElement) {
      inputElement.style.borderColor = '#dc3545';
    }
    return { valid: false, alturaCm: alturaCm, message: errorMsg };
  }
  
  if (alturaCm > maxCm) {
    const errorMsg = `Altura muito alta. Máximo: ${maxCm}cm (${(maxCm/100).toFixed(2)}m ou 2m45cm)`;
    if (errorElement) {
      errorElement.textContent = errorMsg;
      errorElement.style.display = 'block';
    }
    if (inputElement) {
      inputElement.style.borderColor = '#dc3545';
    }
    return { valid: false, alturaCm: alturaCm, message: errorMsg };
  }
  
  // Altura válida
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  if (inputElement) {
    inputElement.style.borderColor = '#28a745';
  }
  return { valid: true, alturaCm: Math.round(alturaCm), message: 'Altura válida' };
}

// ============================================
// VALIDAÇÃO DE VALOR/PREÇO
// ============================================

/**
 * Valida campo de valor/preço
 * @param {string} value - Valor do campo
 * @param {HTMLElement} inputElement - Elemento input (opcional)
 * @param {HTMLElement} errorElement - Elemento para exibir erro (opcional)
 * @returns {Object} {valid: boolean, valor: number|null, message: string}
 */
function validatePrice(value, inputElement = null, errorElement = null) {
  // Limpar espaços
  if (!value || !value.trim()) {
    if (errorElement) {
      errorElement.textContent = 'Valor é obrigatório';
      errorElement.style.display = 'block';
    }
    if (inputElement) {
      inputElement.style.borderColor = '#dc3545';
    }
    return { valid: false, valor: null, message: 'Valor é obrigatório' };
  }
  
  const minValor = 1;
  const maxValor = 20000;
  
  // Remover caracteres não numéricos (exceto vírgula e ponto)
  let valorStr = value.trim().replace(/[^\d.,]/g, '');
  
  // Remover símbolos de moeda e espaços
  valorStr = valorStr.replace(/R\$/g, '').replace(/\s/g, '');
  
  // Converter vírgula para ponto
  valorStr = valorStr.replace(',', '.');
  
  // Verificar se tem mais de um ponto (inválido)
  if ((valorStr.match(/\./g) || []).length > 1) {
    const errorMsg = 'Formato inválido. Digite apenas números inteiros (sem decimais)';
    if (errorElement) {
      errorElement.textContent = errorMsg;
      errorElement.style.display = 'block';
    }
    if (inputElement) {
      inputElement.style.borderColor = '#dc3545';
    }
    return { valid: false, valor: null, message: errorMsg };
  }
  
  // Converter para número
  const valor = parseFloat(valorStr);
  
  // Validar se é número válido
  if (isNaN(valor)) {
    const errorMsg = 'Digite um número válido';
    if (errorElement) {
      errorElement.textContent = errorMsg;
      errorElement.style.display = 'block';
    }
    if (inputElement) {
      inputElement.style.borderColor = '#dc3545';
    }
    return { valid: false, valor: null, message: errorMsg };
  }
  
  // Verificar se tem decimais (não permitido)
  if (valor % 1 !== 0) {
    const errorMsg = 'Não são permitidos valores fracionados. Digite apenas números inteiros';
    if (errorElement) {
      errorElement.textContent = errorMsg;
      errorElement.style.display = 'block';
    }
    if (inputElement) {
      inputElement.style.borderColor = '#dc3545';
    }
    return { valid: false, valor: valor, message: errorMsg };
  }
  
  // Validar limites
  if (valor < minValor) {
    const errorMsg = `Valor muito baixo. Mínimo: R$ ${minValor}`;
    if (errorElement) {
      errorElement.textContent = errorMsg;
      errorElement.style.display = 'block';
    }
    if (inputElement) {
      inputElement.style.borderColor = '#dc3545';
    }
    return { valid: false, valor: valor, message: errorMsg };
  }
  
  if (valor > maxValor) {
    const errorMsg = `Valor muito alto. Máximo permitido: R$ ${maxValor.toLocaleString('pt-BR')}`;
    if (errorElement) {
      errorElement.textContent = errorMsg;
      errorElement.style.display = 'block';
    }
    if (inputElement) {
      inputElement.style.borderColor = '#dc3545';
    }
    return { valid: false, valor: valor, message: errorMsg };
  }
  
  // Valor válido
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  if (inputElement) {
    inputElement.style.borderColor = '#28a745';
  }
  return { valid: true, valor: Math.round(valor), message: 'Valor válido' };
}

// ============================================
// APLICAR VALIDAÇÃO EM TEMPO REAL
// ============================================

/**
 * Aplica validação de altura em um campo input
 * @param {string|HTMLElement} inputSelector - Seletor ou elemento do input
 * @param {string|HTMLElement} errorSelector - Seletor ou elemento para erro (opcional)
 */
function applyHeightValidation(inputSelector, errorSelector = null) {
  const input = typeof inputSelector === 'string' 
    ? document.querySelector(inputSelector) 
    : inputSelector;
  
  if (!input) {
    console.warn('Input de altura não encontrado:', inputSelector);
    return;
  }
  
  const errorElement = errorSelector 
    ? (typeof errorSelector === 'string' ? document.querySelector(errorSelector) : errorSelector)
    : input.parentElement.querySelector('.error-message') || 
      input.parentElement.querySelector('[id*="error"]') ||
      null;
  
  // Criar elemento de erro se não existir
  let errorDiv = errorElement;
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'display: none; color: #dc3545; font-size: 12px; margin-top: 5px;';
    input.parentElement.appendChild(errorDiv);
  }
  
  // Aplicar validação em tempo real
  input.addEventListener('input', function() {
    validateHeight(this.value, this, errorDiv);
  });
  
  // Aplicar validação ao perder foco
  input.addEventListener('blur', function() {
    validateHeight(this.value, this, errorDiv);
  });
  
  // Prevenir valores inválidos durante digitação
  input.addEventListener('keypress', function(e) {
    // Permitir apenas números, vírgula, ponto, m, M, c, C
    const allowedChars = /[0-9.,mcMC\s]/;
    if (!allowedChars.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  });
}

/**
 * Aplica validação de valor/preço em um campo input
 * @param {string|HTMLElement} inputSelector - Seletor ou elemento do input
 * @param {string|HTMLElement} errorSelector - Seletor ou elemento para erro (opcional)
 */
function applyPriceValidation(inputSelector, errorSelector = null) {
  const input = typeof inputSelector === 'string' 
    ? document.querySelector(inputSelector) 
    : inputSelector;
  
  if (!input) {
    console.warn('Input de valor não encontrado:', inputSelector);
    return;
  }
  
  const errorElement = errorSelector 
    ? (typeof errorSelector === 'string' ? document.querySelector(errorSelector) : errorSelector)
    : input.parentElement.querySelector('.error-message') || 
      input.parentElement.querySelector('[id*="error"]') ||
      null;
  
  // Criar elemento de erro se não existir
  let errorDiv = errorElement;
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'display: none; color: #dc3545; font-size: 12px; margin-top: 5px;';
    input.parentElement.appendChild(errorDiv);
  }
  
  // Aplicar validação em tempo real
  input.addEventListener('input', function() {
    validatePrice(this.value, this, errorDiv);
  });
  
  // Aplicar validação ao perder foco
  input.addEventListener('blur', function() {
    validatePrice(this.value, this, errorDiv);
  });
  
  // Prevenir valores inválidos durante digitação
  input.addEventListener('keypress', function(e) {
    // Permitir apenas números
    const allowedChars = /[0-9]/;
    if (!allowedChars.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  });
  
  // Limitar valor máximo durante digitação
  input.addEventListener('input', function() {
    let valor = this.value.replace(/[^\d]/g, '');
    if (valor && parseInt(valor) > 20000) {
      this.value = '20000';
      validatePrice(this.value, this, errorDiv);
    }
  });
}

// ============================================
// APLICAR VALIDAÇÕES AUTOMATICAMENTE
// ============================================

/**
 * Aplica validações automaticamente em todos os campos de altura e valor da página
 */
function applyAllValidations() {
  // Aplicar validação em todos os campos de altura
  const alturaInputs = document.querySelectorAll('input[name="altura"], input[id*="altura"], input[id*="height"]');
  alturaInputs.forEach(input => {
    applyHeightValidation(input);
  });
  
  // Aplicar validação em todos os campos de valor/preço
  const valorInputs = document.querySelectorAll(
    'input[name="valor"], input[name="preco"], input[name="price"], ' +
    'input[id*="valor"], input[id*="preco"], input[id*="price"], ' +
    'input[name*="preco_30min"], input[name*="preco_45min"], input[name*="preco_1h"]'
  );
  valorInputs.forEach(input => {
    applyPriceValidation(input);
  });
}

// ============================================
// VALIDAÇÃO NO SUBMIT DO FORMULÁRIO
// ============================================

/**
 * Valida todos os campos antes de submeter formulário
 * @param {HTMLFormElement} form - Formulário a validar
 * @returns {boolean} true se válido, false se inválido
 */
function validateFormBeforeSubmit(form) {
  let isValid = true;
  const errors = [];
  
  // Validar todos os campos de altura
  const alturaInputs = form.querySelectorAll('input[name="altura"], input[id*="altura"], input[id*="height"]');
  alturaInputs.forEach(input => {
    if (input.value && input.required) {
      const validation = validateHeight(input.value, input);
      if (!validation.valid) {
        isValid = false;
        errors.push(`Altura: ${validation.message}`);
      }
    }
  });
  
  // Validar todos os campos de valor/preço
  const valorInputs = form.querySelectorAll(
    'input[name="valor"], input[name="preco"], input[name="price"], ' +
    'input[id*="valor"], input[id*="preco"], input[id*="price"], ' +
    'input[name*="preco_30min"], input[name*="preco_45min"], input[name*="preco_1h"]'
  );
  valorInputs.forEach(input => {
    if (input.value && input.required) {
      const validation = validatePrice(input.value, input);
      if (!validation.valid) {
        isValid = false;
        errors.push(`Valor: ${validation.message}`);
      }
    }
  });
  
  // Exibir erros se houver
  if (!isValid && errors.length > 0) {
    alert('Por favor, corrija os seguintes erros:\n\n' + errors.join('\n'));
  }
  
  return isValid;
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.validateHeight = validateHeight;
  window.validatePrice = validatePrice;
  window.applyHeightValidation = applyHeightValidation;
  window.applyPriceValidation = applyPriceValidation;
  window.applyAllValidations = applyAllValidations;
  window.validateFormBeforeSubmit = validateFormBeforeSubmit;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateHeight,
    validatePrice,
    applyHeightValidation,
    applyPriceValidation,
    applyAllValidations,
    validateFormBeforeSubmit
  };
}

// Aplicar automaticamente quando DOM estiver pronto
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAllValidations);
  } else {
    applyAllValidations();
  }
}





