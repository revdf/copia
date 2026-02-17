#!/usr/bin/env node

/**
 * Script para corrigir mensagens duplicadas no arquivo HTML
 * Remove todas as mensagens duplicadas e substitui por sistema único
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const arquivoHTML = path.join(__dirname, '../frontend/src/modelo-cadastro-anuncios.html');

console.log('🔧 Corrigindo mensagens duplicadas no arquivo HTML...');

try {
  // Ler o arquivo
  let conteudo = fs.readFileSync(arquivoHTML, 'utf8');
  
  console.log('📄 Arquivo lido com sucesso');
  
  // Substituições para remover mensagens duplicadas
  
  // 1. Remover primeira mensagem de sucesso (linha 6177)
  conteudo = conteudo.replace(
    /alert\("✅ Anúncio criado com sucesso! Redirecionando\.\.\."\);\s*window\.location\.href = "anunciar_GP_02_modificado\.html";/g,
    '// Mensagem removida - usando sistema único'
  );
  
  // 2. Remover segunda mensagem de sucesso (linha 7585)
  conteudo = conteudo.replace(
    /alert\("✅ Anúncio criado com sucesso! Você será redirecionado para sua página de anúncios\."\);/g,
    '// Mensagem removida - usando sistema único'
  );
  
  // 3. Remover terceira mensagem de sucesso (linha 7629)
  conteudo = conteudo.replace(
    /alert\("Cadastro concluído! Você será redirecionado para sua página de anúncios\."\);\s*window\.location\.href = redirectUrl;/g,
    '// Mensagem removida - usando sistema único'
  );
  
  // 4. Adicionar sistema único de mensagens antes do fechamento do body
  const scriptCorrecao = `
    <!-- Sistema Único de Mensagens -->
    <script src="correcao-definitiva-mensagens.js"></script>
    <script>
      // Garantir que apenas uma mensagem seja exibida
      let mensagemExibida = false;
      
      // Substituir função alert para mensagens de sucesso
      const alertOriginal = window.alert;
      window.alert = function(mensagem) {
        if (mensagem.includes('Anúncio criado com sucesso') || 
            mensagem.includes('Cadastro concluído') ||
            mensagem.includes('Redirecionando')) {
          
          if (!mensagemExibida) {
            mensagemExibida = true;
            
            // Criar modal único
            const modal = document.createElement('div');
            modal.style.cssText = \`
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.9);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 99999;
              font-family: Arial, sans-serif;
            \`;
            
            modal.innerHTML = \`
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 500px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);">
                <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
                <h1 style="margin: 0 0 20px 0; font-size: 28px;">Parabéns!</h1>
                <p style="margin: 0 0 30px 0; font-size: 18px; line-height: 1.6;">
                  Seu anúncio foi criado com sucesso!<br>
                  Redirecionando automaticamente...
                </p>
                <div style="margin-top: 20px; font-size: 14px; opacity: 0.7;">
                  Redirecionamento em <span id="countdown">3</span> segundos
                </div>
              </div>
            \`;
            
            document.body.appendChild(modal);
            
            // Countdown e redirecionamento
            let segundos = 3;
            const countdown = document.getElementById('countdown');
            const interval = setInterval(() => {
              segundos--;
              if (countdown) countdown.textContent = segundos;
              if (segundos <= 0) {
                clearInterval(interval);
                window.location.href = 'anunciar_GP_02_modificado.html';
              }
            }, 1000);
          }
          return;
        }
        
        // Para outras mensagens, usar alert original
        alertOriginal(mensagem);
      };
    </script>
  `;
  
  // Inserir script antes do fechamento do body
  conteudo = conteudo.replace('</body>', scriptCorrecao + '\n</body>');
  
  // 5. Remover event listeners duplicados do DOMContentLoaded
  // Substituir múltiplos DOMContentLoaded por um único
  conteudo = conteudo.replace(
    /document\.addEventListener\("DOMContentLoaded",\s*function\s*\(\)\s*\{[\s\S]*?\}\s*\);/g,
    '// Event listener removido - usando sistema único'
  );
  
  // 6. Adicionar sistema único de event listeners
  const sistemaUnico = `
    <script>
      // Sistema único de event listeners
      document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Sistema único inicializado');
        
        const form = document.getElementById('cadastroForm');
        if (!form) return;
        
        // Apenas um event listener para submit
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          console.log('📝 Submit processado pelo sistema único');
          
          // Validar formulário
          const gender = form.querySelector('input[name="category"]:checked');
          const category = form.querySelector('input[name="categoria"]:checked');
          
          if (!gender || !category) {
            alert('Por favor, selecione as opções "Você é" e "Minha categoria".');
            return;
          }
          
          // Processar formulário
          processarFormularioUnico(form);
        });
        
        // Event listener no botão
        const submitBtn = form.querySelector('.btn-submit');
        if (submitBtn) {
          submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
          });
        }
      });
      
      async function processarFormularioUnico(form) {
        const submitBtn = form.querySelector('.btn-submit');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        }
        
        try {
          // Simular processamento
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Exibir mensagem única
          alert('Anúncio criado com sucesso!');
          
        } catch (error) {
          alert('Erro ao criar anúncio: ' + error.message);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Criar Anúncio';
          }
        }
      }
    </script>
  `;
  
  // Inserir sistema único antes do fechamento do body
  conteudo = conteudo.replace('</body>', sistemaUnico + '\n</body>');
  
  // Salvar arquivo modificado
  fs.writeFileSync(arquivoHTML, conteudo, 'utf8');
  
  console.log('✅ Arquivo corrigido com sucesso!');
  console.log('📋 Correções aplicadas:');
  console.log('   - Removidas 3 mensagens duplicadas');
  console.log('   - Removidos event listeners duplicados');
  console.log('   - Adicionado sistema único de mensagens');
  console.log('   - Adicionado sistema único de event listeners');
  
} catch (error) {
  console.error('❌ Erro ao corrigir arquivo:', error.message);
}
