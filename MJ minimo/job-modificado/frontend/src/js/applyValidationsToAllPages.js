/**
 * ============================================
 * APPLY VALIDATIONS TO ALL PAGES
 * ============================================
 * 
 * Script para aplicar validações de altura e valor
 * automaticamente em todas as páginas de cadastro.
 * 
 * Basta incluir este script após formValidations.js
 * e ele aplicará as validações automaticamente.
 * 
 * @author Sistema Padronizado
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // Aguardar DOM estar pronto
    function initValidations() {
        // Aplicar validações em todos os campos de altura
        const alturaInputs = document.querySelectorAll(
            'input[name="altura"], input[id*="altura"], input[id*="height"], ' +
            'input[id="info-altura"]'
        );
        
        alturaInputs.forEach(input => {
            // Criar elemento de erro se não existir
            let errorDiv = document.getElementById('altura-error') || 
                          input.parentElement.querySelector('.error-message') ||
                          input.parentElement.querySelector('[id*="error"]');
            
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.id = 'altura-error';
                errorDiv.className = 'error-message';
                errorDiv.style.cssText = 'display: none; color: #dc3545; font-size: 12px; margin-top: 5px;';
                input.parentElement.appendChild(errorDiv);
            }
            
            // Adicionar texto de ajuda se não existir
            if (!input.parentElement.querySelector('small[data-help="altura"]')) {
                const helpText = document.createElement('small');
                helpText.setAttribute('data-help', 'altura');
                helpText.style.cssText = 'color: #666; font-size: 11px; display: block; margin-top: 4px;';
                helpText.textContent = 'Mínimo: 45cm | Máximo: 2m45cm (245cm)';
                input.parentElement.insertBefore(helpText, errorDiv);
            }
            
            // Aplicar validação
            if (typeof applyHeightValidation === 'function') {
                applyHeightValidation(input, errorDiv);
            }
        });
        
        // Aplicar validações em todos os campos de valor/preço
        const valorInputs = document.querySelectorAll(
            'input[name="valor"], input[name="preco"], input[name="price"], ' +
            'input[id*="valor"], input[id*="preco"], input[id*="price"], ' +
            'input[id="info-valor"], ' +
            'input[name*="preco_30min"], input[name*="preco_45min"], input[name*="preco_1h"]'
        );
        
        valorInputs.forEach(input => {
            // Remover elemento de ajuda se existir
            const helpText = input.parentElement.querySelector('small[data-help="valor"]');
            if (helpText) {
                helpText.remove();
            }
            
            // Criar elemento de erro se não existir
            let errorDiv = document.getElementById('valor-error') || 
                          input.parentElement.querySelector('.error-message') ||
                          input.parentElement.querySelector('[id*="error"]');
            
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.id = 'valor-error';
                errorDiv.className = 'error-message';
                errorDiv.style.cssText = 'display: none; color: #dc3545; font-size: 12px; margin-top: 5px;';
                input.parentElement.appendChild(errorDiv);
            }
            
            // Aplicar validação
            if (typeof applyPriceValidation === 'function') {
                applyPriceValidation(input, errorDiv);
            }
        });
        
        // Interceptar submit de formulários para validar antes
        const forms = document.querySelectorAll('form[id*="cadastro"], form[id*="form"]');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                let isValid = true;
                const errors = [];
                
                // Validar altura
                const alturaInput = form.querySelector('input[name="altura"], input[id*="altura"]');
                if (alturaInput && alturaInput.value) {
                    const alturaError = form.querySelector('#altura-error, .error-message');
                    if (typeof validateHeight === 'function') {
                        const validation = validateHeight(alturaInput.value, alturaInput, alturaError);
                        if (!validation.valid) {
                            isValid = false;
                            errors.push(`Altura: ${validation.message}`);
                        }
                    }
                }
                
                // Validar valor
                const valorInput = form.querySelector('input[name="valor"], input[name="preco"], input[id*="valor"]');
                if (valorInput && valorInput.value) {
                    const valorError = form.querySelector('#valor-error, .error-message');
                    if (typeof validatePrice === 'function') {
                        const validation = validatePrice(valorInput.value, valorInput, valorError);
                        if (!validation.valid) {
                            isValid = false;
                            errors.push(`Valor: ${validation.message}`);
                        }
                    }
                }
                
                if (!isValid) {
                    e.preventDefault();
                    alert('Por favor, corrija os seguintes erros:\n\n' + errors.join('\n'));
                    return false;
                }
            });
        });
    }
    
    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initValidations, 500);
        });
    } else {
        setTimeout(initValidations, 500);
    }
    
    // Também tentar após um tempo maior (para páginas que carregam conteúdo dinamicamente)
    setTimeout(initValidations, 2000);
})();





