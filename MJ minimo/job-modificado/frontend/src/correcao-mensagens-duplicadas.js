/**
 * Correção de Múltiplas Mensagens e Redirecionamentos
 * Remove mensagens duplicadas e corrige vulnerabilidade de página aberta
 */

class CorrecaoMensagensDuplicadas {
  constructor() {
    this.mensagemExibida = false;
    this.redirecionamentoExecutado = false;
    this.timeoutRedirecionamento = null;
  }

  /**
   * Exibe mensagem de sucesso única
   * @param {string} mensagem - Mensagem a ser exibida
   * @param {string} tipo - Tipo da mensagem (success, error, warning)
   */
  exibirMensagemUnica(mensagem, tipo = 'success') {
    if (this.mensagemExibida) {
      console.log('⚠️ Mensagem já foi exibida, ignorando duplicata');
      return;
    }

    this.mensagemExibida = true;

    // Criar modal personalizado em vez de alert
    this.criarModalMensagem(mensagem, tipo);
  }

  /**
   * Cria modal personalizado para mensagem
   * @param {string} mensagem - Mensagem a ser exibida
   * @param {string} tipo - Tipo da mensagem
   */
  criarModalMensagem(mensagem, tipo) {
    // Remover modal existente se houver
    const modalExistente = document.getElementById('modal-mensagem-sucesso');
    if (modalExistente) {
      modalExistente.remove();
    }

    // Criar modal
    const modal = document.createElement('div');
    modal.id = 'modal-mensagem-sucesso';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;

    const conteudo = document.createElement('div');
    conteudo.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    `;

    // Adicionar animação CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    // Ícone baseado no tipo
    let icone = '✅';
    let corTitulo = '#28a745';
    
    if (tipo === 'error') {
      icone = '❌';
      corTitulo = '#dc3545';
    } else if (tipo === 'warning') {
      icone = '⚠️';
      corTitulo = '#ffc107';
    }

    conteudo.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">${icone}</div>
      <h2 style="color: ${corTitulo}; margin: 0 0 15px 0; font-size: 24px;">Sucesso!</h2>
      <p style="color: #333; margin: 0 0 25px 0; line-height: 1.5;">${mensagem}</p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="btn-confirmar-redirecionamento" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background 0.3s;
        ">Continuar</button>
        <button id="btn-cancelar-redirecionamento" style="
          background: #6c757d;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.3s;
        ">Cancelar</button>
      </div>
    `;

    modal.appendChild(conteudo);
    document.body.appendChild(modal);

    // Event listeners para os botões
    const btnConfirmar = document.getElementById('btn-confirmar-redirecionamento');
    const btnCancelar = document.getElementById('btn-cancelar-redirecionamento');

    btnConfirmar.addEventListener('click', () => {
      this.executarRedirecionamento();
    });

    btnCancelar.addEventListener('click', () => {
      this.cancelarRedirecionamento();
    });

    // Auto-redirecionamento após 10 segundos
    this.timeoutRedirecionamento = setTimeout(() => {
      this.executarRedirecionamento();
    }, 10000);

    // Adicionar efeito hover aos botões
    btnConfirmar.addEventListener('mouseenter', () => {
      btnConfirmar.style.background = '#0056b3';
    });
    btnConfirmar.addEventListener('mouseleave', () => {
      btnConfirmar.style.background = '#007bff';
    });

    btnCancelar.addEventListener('mouseenter', () => {
      btnCancelar.style.background = '#545b62';
    });
    btnCancelar.addEventListener('mouseleave', () => {
      btnCancelar.style.background = '#6c757d';
    });
  }

  /**
   * Executa redirecionamento único
   * @param {string} url - URL para redirecionamento
   */
  executarRedirecionamento(url = null) {
    if (this.redirecionamentoExecutado) {
      console.log('⚠️ Redirecionamento já foi executado, ignorando');
      return;
    }

    this.redirecionamentoExecutado = true;

    // Limpar timeout se existir
    if (this.timeoutRedirecionamento) {
      clearTimeout(this.timeoutRedirecionamento);
    }

    // Remover modal
    const modal = document.getElementById('modal-mensagem-sucesso');
    if (modal) {
      modal.remove();
    }

    // Executar redirecionamento
    if (url) {
      console.log('🔄 Redirecionando para:', url);
      window.location.href = url;
    } else {
      console.log('🔄 Redirecionamento padrão executado');
      // Aqui você pode definir a URL padrão
      window.location.href = 'anunciar_GP_02_modificado.html';
    }
  }

  /**
   * Cancela redirecionamento
   */
  cancelarRedirecionamento() {
    // Limpar timeout se existir
    if (this.timeoutRedirecionamento) {
      clearTimeout(this.timeoutRedirecionamento);
    }

    // Remover modal
    const modal = document.getElementById('modal-mensagem-sucesso');
    if (modal) {
      modal.remove();
    }

    // Resetar flags
    this.mensagemExibida = false;
    this.redirecionamentoExecutado = false;

    console.log('❌ Redirecionamento cancelado pelo usuário');
  }

  /**
   * Bloqueia múltiplos cliques no botão de submit
   * @param {HTMLElement} botao - Botão a ser protegido
   */
  protegerBotaoSubmit(botao) {
    if (!botao) return;

    let cliques = 0;
    const maxCliques = 1;

    botao.addEventListener('click', (e) => {
      cliques++;
      
      if (cliques > maxCliques) {
        e.preventDefault();
        e.stopPropagation();
        console.log('⚠️ Múltiplos cliques bloqueados');
        return false;
      }

      // Resetar contador após 3 segundos
      setTimeout(() => {
        cliques = 0;
      }, 3000);
    });
  }

  /**
   * Remove event listeners duplicados do formulário
   * @param {HTMLElement} formulario - Formulário a ser limpo
   */
  removerEventListenersDuplicados(formulario) {
    if (!formulario) return;

    // Clonar o formulário para remover todos os event listeners
    const novoFormulario = formulario.cloneNode(true);
    formulario.parentNode.replaceChild(novoFormulario, formulario);

    console.log('🧹 Event listeners duplicados removidos');
  }

  /**
   * Inicializa proteções
   */
  inicializar() {
    console.log('🛡️ Inicializando proteções contra mensagens duplicadas...');

    // Proteger botão de submit
    const botaoSubmit = document.querySelector('.btn-submit');
    this.protegerBotaoSubmit(botaoSubmit);

    // Remover event listeners duplicados
    const formulario = document.getElementById('cadastroForm');
    this.removerEventListenersDuplicados(formulario);

    console.log('✅ Proteções inicializadas com sucesso');
  }
}

// Instância global
const correcaoMensagens = new CorrecaoMensagensDuplicadas();

// Função para substituir alert por mensagem única
function exibirMensagemSucessoUnica(mensagem, url = null) {
  correcaoMensagens.exibirMensagemUnica(mensagem, 'success');
  
  if (url) {
    setTimeout(() => {
      correcaoMensagens.executarRedirecionamento(url);
    }, 2000);
  }
}

// Função para substituir alert de erro
function exibirMensagemErroUnica(mensagem) {
  correcaoMensagens.exibirMensagemUnica(mensagem, 'error');
}

// Exportar para uso global
window.CorrecaoMensagensDuplicadas = correcaoMensagens;
window.exibirMensagemSucessoUnica = exibirMensagemSucessoUnica;
window.exibirMensagemErroUnica = exibirMensagemErroUnica;

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  correcaoMensagens.inicializar();
});

console.log('🛡️ Sistema de correção de mensagens duplicadas carregado');
