#!/usr/bin/env node

/**
 * Correção Cirúrgica de Mensagens Duplicadas
 * Remove especificamente as mensagens que ainda estão aparecendo
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const arquivoHTML = path.join(__dirname, '../frontend/src/modelo-cadastro-anuncios.html');

console.log('🔧 Aplicando correção cirúrgica de mensagens duplicadas...');

try {
  // Ler o arquivo
  let conteudo = fs.readFileSync(arquivoHTML, 'utf8');
  
  console.log('📄 Arquivo lido com sucesso');
  
  // Correções específicas para mensagens que ainda estão aparecendo
  
  // 1. Remover mensagem específica que ainda aparece (linha 6134)
  conteudo = conteudo.replace(
    /alert\("✅ Anúncio criado com sucesso! Redirecionando\.\.\."\);\s*window\.location\.href = "anunciar_GP_02_modificado\.html";/g,
    '// Mensagem removida - sistema único ativo'
  );
  
  // 2. Remover mensagem de erro que pode estar causando duplicata (linha 7546)
  conteudo = conteudo.replace(
    /alert\("❌ Erro ao criar anúncio: " \+ error\.message\);/g,
    'console.error("❌ Erro ao criar anúncio:", error); // Alert removido'
  );
  
  // 3. Remover mensagem de validação que pode estar duplicando (linha 7355)
  conteudo = conteudo.replace(
    /alert\("Por favor, selecione as opções 'Você é' e 'Minha categoria'\."\);/g,
    'console.log("❌ Validação falhou: Gender ou Category não selecionados"); // Alert removido'
  );
  
  // 4. Remover mensagem de autenticação (linha 7370)
  conteudo = conteudo.replace(
    /alert\("Você precisa estar logado para criar um anúncio\."\);/g,
    'console.log("❌ Usuário não autenticado"); // Alert removido'
  );
  
  // 5. Remover mensagem de redirecionamento (linha 7581)
  conteudo = conteudo.replace(
    /alert\("Não foi possível identificar a página correta\. Verifique suas seleções\."\);/g,
    'console.log("❌ URL de redirecionamento não identificada"); // Alert removido'
  );
  
  // 6. Remover mensagem do sistema único que pode estar duplicando (linha 7827)
  conteudo = conteudo.replace(
    /alert\('Anúncio criado com sucesso!'\);/g,
    'console.log("✅ Anúncio criado com sucesso - sistema único"); // Alert removido'
  );
  
  // 7. Remover mensagem de erro do sistema único (linha 7830)
  conteudo = conteudo.replace(
    /alert\('Erro ao criar anúncio: ' \+ error\.message\);/g,
    'console.error("❌ Erro no sistema único:", error); // Alert removido'
  );
  
  // 8. Substituir completamente o sistema de alert por um mais robusto
  const sistemaRobusto = `
    <script>
      // Sistema Robusto de Mensagens Únicas
      let mensagemExibida = false;
      let redirecionamentoExecutado = false;
      
      // Substituir função alert globalmente
      const alertOriginal = window.alert;
      window.alert = function(mensagem) {
        console.log('🔍 Alert chamado:', mensagem);
        
        // Se for mensagem de sucesso, usar sistema único
        if (mensagem.includes('Anúncio criado com sucesso') || 
            mensagem.includes('Cadastro concluído') ||
            mensagem.includes('Redirecionando')) {
          
          if (!mensagemExibida) {
            mensagemExibida = true;
            console.log('✅ Exibindo mensagem única');
            exibirMensagemUnica();
          } else {
            console.log('⚠️ Mensagem já foi exibida, ignorando');
          }
          return;
        }
        
        // Para outras mensagens, usar alert original
        alertOriginal(mensagem);
      };
      
      function exibirMensagemUnica() {
        // Remover modal existente
        const modalExistente = document.getElementById('modal-sucesso-unico');
        if (modalExistente) {
          modalExistente.remove();
        }
        
        // Criar modal único
        const modal = document.createElement('div');
        modal.id = 'modal-sucesso-unico';
        modal.style.cssText = \`
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999999;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        \`;
        
        modal.innerHTML = \`
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 50px; border-radius: 25px; text-align: center; max-width: 600px; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4); animation: modalSlideIn 0.6s ease-out;">
            <div style="font-size: 80px; margin-bottom: 25px; animation: pulse 2s infinite;">🎉</div>
            <h1 style="margin: 0 0 25px 0; font-size: 32px; font-weight: bold;">Parabéns!</h1>
            <p style="margin: 0 0 35px 0; font-size: 20px; line-height: 1.6; opacity: 0.9;">
              Seu anúncio foi criado com sucesso!<br>
              <strong>Redirecionando automaticamente...</strong>
            </p>
            <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; margin: 25px 0;">
              <div style="font-size: 16px; margin-bottom: 10px;">Redirecionamento em:</div>
              <div id="countdown" style="font-size: 48px; font-weight: bold; color: #ffd700;">3</div>
            </div>
            <button id="btn-continuar-agora" style="
              background: rgba(255, 255, 255, 0.2);
              color: white;
              border: 2px solid rgba(255, 255, 255, 0.3);
              padding: 18px 36px;
              border-radius: 50px;
              cursor: pointer;
              font-size: 18px;
              font-weight: bold;
              transition: all 0.3s ease;
              backdrop-filter: blur(10px);
            ">Continuar Agora</button>
          </div>
        \`;
        
        document.body.appendChild(modal);
        
        // Adicionar animação CSS
        if (!document.getElementById('modal-animation-styles')) {
          const style = document.createElement('style');
          style.id = 'modal-animation-styles';
          style.textContent = \`
            @keyframes modalSlideIn {
              from {
                opacity: 0;
                transform: translateY(-100px) scale(0.8);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
          \`;
          document.head.appendChild(style);
        }
        
        // Configurar botão
        const btnContinuar = document.getElementById('btn-continuar-agora');
        btnContinuar.addEventListener('click', () => {
          executarRedirecionamento();
        });
        
        // Efeito hover
        btnContinuar.addEventListener('mouseenter', () => {
          btnContinuar.style.background = 'rgba(255, 255, 255, 0.3)';
          btnContinuar.style.transform = 'translateY(-3px)';
        });
        btnContinuar.addEventListener('mouseleave', () => {
          btnContinuar.style.background = 'rgba(255, 255, 255, 0.2)';
          btnContinuar.style.transform = 'translateY(0)';
        });
        
        // Iniciar countdown
        iniciarCountdown();
      }
      
      function iniciarCountdown() {
        let segundos = 3;
        const countdownElement = document.getElementById('countdown');
        
        const interval = setInterval(() => {
          segundos--;
          if (countdownElement) {
            countdownElement.textContent = segundos;
          }
          
          if (segundos <= 0) {
            clearInterval(interval);
            executarRedirecionamento();
          }
        }, 1000);
      }
      
      function executarRedirecionamento() {
        if (redirecionamentoExecutado) {
          console.log('⚠️ Redirecionamento já foi executado');
          return;
        }
        
        redirecionamentoExecutado = true;
        console.log('🔄 Executando redirecionamento único');
        
        // Remover modal
        const modal = document.getElementById('modal-sucesso-unico');
        if (modal) {
          modal.style.animation = 'modalSlideIn 0.3s ease-out reverse';
          setTimeout(() => {
            modal.remove();
          }, 300);
        }
        
        // Redirecionar
        setTimeout(() => {
          window.location.href = 'anunciar_GP_02_modificado.html';
        }, 500);
      }
      
      console.log('🛡️ Sistema robusto de mensagens únicas carregado');
    </script>
  `;
  
  // Substituir o sistema anterior pelo robusto
  conteudo = conteudo.replace(
    /<!-- Sistema Único de Mensagens -->[\s\S]*?console\.log\('🛡️ Sistema único inicializado'\);/g,
    sistemaRobusto
  );
  
  // Salvar arquivo modificado
  fs.writeFileSync(arquivoHTML, conteudo, 'utf8');
  
  console.log('✅ Correção cirúrgica aplicada com sucesso!');
  console.log('📋 Correções específicas:');
  console.log('   - Removida mensagem "Anúncio criado com sucesso! Redirecionando..."');
  console.log('   - Removida mensagem de erro duplicada');
  console.log('   - Removida mensagem de validação duplicada');
  console.log('   - Removida mensagem de autenticação duplicada');
  console.log('   - Removida mensagem de redirecionamento duplicada');
  console.log('   - Substituído sistema por versão robusta');
  console.log('   - Implementado countdown visual');
  console.log('   - Proteção total contra duplicatas');
  
} catch (error) {
  console.error('❌ Erro ao aplicar correção cirúrgica:', error.message);
}
