/**
 * Correção Definitiva de Mensagens Duplicadas
 * Remove TODAS as mensagens duplicadas e substitui por sistema único
 */

class CorrecaoDefinitivaMensagens {
  constructor() {
    this.mensagemExibida = false;
    this.redirecionamentoExecutado = false;
    this.timeoutRedirecionamento = null;
    this.eventListenersRemovidos = false;
  }

  /**
   * Substitui TODAS as funções alert por sistema único
   */
  substituirTodasAsMensagens() {
    // Substituir função alert globalmente
    const alertOriginal = window.alert;
    
    window.alert = (mensagem) => {
      // Se for mensagem de sucesso, usar sistema único
      if (mensagem.includes('Anúncio criado com sucesso') || 
          mensagem.includes('Cadastro concluído') ||
          mensagem.includes('Redirecionando')) {
        
        if (!this.mensagemExibida) {
          this.exibirMensagemUnica(mensagem);
        }
        return;
      }
      
      // Para outras mensagens, usar alert original
      alertOriginal(mensagem);
    };
    
    console.log('🛡️ Sistema de mensagens únicas ativado');
  }

  /**
   * Exibe mensagem única com modal personalizado
   * @param {string} mensagem - Mensagem a ser exibida
   */
  exibirMensagemUnica(mensagem) {
    if (this.mensagemExibida) {
      console.log('⚠️ Mensagem já foi exibida, ignorando duplicata');
      return;
    }

    this.mensagemExibida = true;

    // Remover modal existente se houver
    const modalExistente = document.getElementById('modal-sucesso-unico');
    if (modalExistente) {
      modalExistente.remove();
    }

    // Criar modal único
    const modal = document.createElement('div');
    modal.id = 'modal-sucesso-unico';
    modal.style.cssText = `
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
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    const conteudo = document.createElement('div');
    conteudo.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      animation: modalSlideIn 0.5s ease-out;
    `;

    // Adicionar animação CSS
    if (!document.getElementById('modal-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-animation-styles';
      style.textContent = `
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
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }

    conteudo.innerHTML = `
      <div style="font-size: 60px; margin-bottom: 20px; animation: pulse 2s infinite;">🎉</div>
      <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">Parabéns!</h1>
      <p style="margin: 0 0 30px 0; font-size: 18px; line-height: 1.6; opacity: 0.9;">
        Seu anúncio foi criado com sucesso!<br>
        Você será redirecionado automaticamente.
      </p>
      <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
        <button id="btn-continuar-agora" style="
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 15px 30px;
          border-radius: 50px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        ">Continuar Agora</button>
        <button id="btn-aguardar" style="
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.2);
          padding: 15px 30px;
          border-radius: 50px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        ">Aguardar (5s)</button>
      </div>
      <div style="margin-top: 20px; font-size: 14px; opacity: 0.7;">
        Redirecionamento automático em <span id="countdown">5</span> segundos
      </div>
    `;

    modal.appendChild(conteudo);
    document.body.appendChild(modal);

    // Configurar botões
    this.configurarBotoesModal(modal);
    
    // Iniciar countdown
    this.iniciarCountdown();
  }

  /**
   * Configura os botões do modal
   * @param {HTMLElement} modal - Modal element
   */
  configurarBotoesModal(modal) {
    const btnContinuar = document.getElementById('btn-continuar-agora');
    const btnAguardar = document.getElementById('btn-aguardar');

    // Efeitos hover
    btnContinuar.addEventListener('mouseenter', () => {
      btnContinuar.style.background = 'rgba(255, 255, 255, 0.3)';
      btnContinuar.style.transform = 'translateY(-2px)';
    });
    btnContinuar.addEventListener('mouseleave', () => {
      btnContinuar.style.background = 'rgba(255, 255, 255, 0.2)';
      btnContinuar.style.transform = 'translateY(0)';
    });

    btnAguardar.addEventListener('mouseenter', () => {
      btnAguardar.style.background = 'rgba(255, 255, 255, 0.2)';
      btnAguardar.style.transform = 'translateY(-2px)';
    });
    btnAguardar.addEventListener('mouseleave', () => {
      btnAguardar.style.background = 'rgba(255, 255, 255, 0.1)';
      btnAguardar.style.transform = 'translateY(0)';
    });

    // Event listeners
    btnContinuar.addEventListener('click', () => {
      this.executarRedirecionamento();
    });

    btnAguardar.addEventListener('click', () => {
      // Não fazer nada, deixar o countdown continuar
    });
  }

  /**
   * Inicia countdown para redirecionamento automático
   */
  iniciarCountdown() {
    let segundos = 5;
    const countdownElement = document.getElementById('countdown');
    
    const interval = setInterval(() => {
      segundos--;
      if (countdownElement) {
        countdownElement.textContent = segundos;
      }
      
      if (segundos <= 0) {
        clearInterval(interval);
        this.executarRedirecionamento();
      }
    }, 1000);

    // Armazenar interval para poder cancelar se necessário
    this.countdownInterval = interval;
  }

  /**
   * Executa redirecionamento único
   */
  executarRedirecionamento() {
    if (this.redirecionamentoExecutado) {
      console.log('⚠️ Redirecionamento já foi executado, ignorando');
      return;
    }

    this.redirecionamentoExecutado = true;

    // Limpar countdown
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // Remover modal
    const modal = document.getElementById('modal-sucesso-unico');
    if (modal) {
      modal.style.animation = 'modalSlideIn 0.3s ease-out reverse';
      setTimeout(() => {
        modal.remove();
      }, 300);
    }

    // Determinar URL de redirecionamento
    const gender = localStorage.getItem('userGender');
    const category = localStorage.getItem('userCategory');
    
    let redirectUrl = 'anunciar_GP_02_modificado.html'; // URL padrão
    
    if (gender && category) {
      // Lógica de redirecionamento baseada nas seleções
      if (category === 'acompanhantes') {
        if (gender === 'mulher') redirectUrl = 'A_02__premium.html';
        else if (gender === 'trans') redirectUrl = 'A_04__trans.html';
        else if (gender === 'homem') redirectUrl = 'A_05__homens.html';
        else if (gender === 'mulher-luxo') redirectUrl = 'luxo.html';
      } else if (category === 'massagistas') {
        redirectUrl = 'massagistas.html';
      } else if (category === 'sexo-virtual') {
        redirectUrl = 'sexo-virtual.html';
      }
    }

    console.log('🔄 Redirecionando para:', redirectUrl);
    
    // Executar redirecionamento
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 500);
  }

  /**
   * Remove todos os event listeners duplicados
   */
  removerEventListenersDuplicados() {
    if (this.eventListenersRemovidos) return;

    // Remover todos os event listeners do formulário
    const form = document.getElementById('cadastroForm');
    if (form) {
      // Clonar formulário para remover todos os event listeners
      const novoForm = form.cloneNode(true);
      form.parentNode.replaceChild(novoForm, form);
      
      // Reconfigurar apenas os event listeners necessários
      this.configurarEventListenersUnicos(novoForm);
    }

    this.eventListenersRemovidos = true;
    console.log('🧹 Event listeners duplicados removidos');
  }

  /**
   * Configura apenas os event listeners necessários
   * @param {HTMLElement} form - Formulário limpo
   */
  configurarEventListenersUnicos(form) {
    // Apenas um event listener para submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.processarSubmit(form);
    });

    // Event listener no botão de submit
    const submitBtn = form.querySelector('.btn-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
    }
  }

  /**
   * Processa o submit do formulário
   * @param {HTMLElement} form - Formulário
   */
  async processarSubmit(form) {
    console.log('🚀 Processando submit único...');

    // Validar formulário
    if (!this.validarFormulario(form)) {
      return;
    }

    // Desabilitar botão
    const submitBtn = form.querySelector('.btn-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    }

    try {
      // Processar dados do formulário
      await this.processarDadosFormulario(form);
      
      // Exibir mensagem de sucesso única
      this.exibirMensagemUnica('Anúncio criado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      alert('❌ Erro ao criar anúncio: ' + error.message);
    } finally {
      // Restaurar botão
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Criar Anúncio';
      }
    }
  }

  /**
   * Valida o formulário
   * @param {HTMLElement} form - Formulário
   * @returns {boolean} - True se válido
   */
  validarFormulario(form) {
    const gender = form.querySelector('input[name="category"]:checked');
    const category = form.querySelector('input[name="categoria"]:checked');

    if (!gender || !category) {
      alert('Por favor, selecione as opções "Você é" e "Minha categoria".');
      return false;
    }

    return true;
  }

  /**
   * Processa os dados do formulário
   * @param {HTMLElement} form - Formulário
   */
  async processarDadosFormulario(form) {
    // Aqui você pode adicionar a lógica de processamento
    // Por enquanto, apenas simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Dados do formulário processados');
  }

  /**
   * Inicializa todas as correções
   */
  inicializar() {
    console.log('🛡️ Inicializando correção definitiva de mensagens...');

    // Substituir todas as mensagens
    this.substituirTodasAsMensagens();

    // Remover event listeners duplicados
    this.removerEventListenersDuplicados();

    console.log('✅ Correção definitiva inicializada');
  }
}

// Instância global
const correcaoDefinitiva = new CorrecaoDefinitivaMensagens();

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  correcaoDefinitiva.inicializar();
});

// Exportar para uso global
window.CorrecaoDefinitivaMensagens = correcaoDefinitiva;

console.log('🛡️ Sistema de correção definitiva carregado');
