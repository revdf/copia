/**
 * Sistema de Controle de Progresso de Cadastro
 * Previne spam e ataques maliciosos
 */

class CadastroProgressManager {
  constructor() {
    this.steps = {
      'anunciar_GP_01': 1,      // Dados pessoais
      'anunciar_GP_02': 2,      // Documentos
      'modelo-cadastro-anuncios': 3, // Anúncio completo
      'anuncio-finalizado': 4   // Cadastro completo
    };
    
    this.currentStep = 1;
    this.userData = null;
  }

  /**
   * Verifica o progresso do cadastro do usuário
   */
  async checkCadastroProgress(uid) {
    try {
      const response = await fetch(`/api/advertisers/progress/${uid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.currentStep = data.currentStep || 1;
        this.userData = data.userData;
        
        console.log(`📊 Progresso do cadastro: Etapa ${this.currentStep}/4`);
        return this.currentStep;
      } else {
        console.log('❌ Erro ao verificar progresso');
        return 1; // Começar do início
      }
    } catch (error) {
      console.error('Erro ao verificar progresso:', error);
      return 1;
    }
  }

  /**
   * Redireciona para a página correta baseada no progresso
   */
  redirectToCorrectPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Se já está na página correta, não redirecionar
    if (this.isCorrectPage(currentPage)) {
      return;
    }

    // Redirecionar para a página correta
    const targetPage = this.getTargetPage();
    console.log(`🔄 Redirecionando para: ${targetPage}`);
    window.location.href = targetPage;
  }

  /**
   * Verifica se a página atual é a correta
   */
  isCorrectPage(currentPage) {
    const pageStep = this.steps[currentPage] || 0;
    return pageStep === this.currentStep;
  }

  /**
   * Retorna a página alvo baseada no progresso
   */
  getTargetPage() {
    switch (this.currentStep) {
      case 1:
        return 'anunciar_GP_01.html';
      case 2:
        return 'anunciar_GP_02.html';
      case 3:
        return 'modelo-cadastro-anuncios.html';
      case 4:
        return 'dashboard.html'; // Página de sucesso
      default:
        return 'anunciar_GP_01.html';
    }
  }

  /**
   * Atualiza o progresso após completar uma etapa
   */
  async updateProgress(step, data = {}) {
    try {
      const response = await fetch('/api/advertisers/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          step: step,
          data: data,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        this.currentStep = step;
        console.log(`✅ Progresso atualizado para etapa ${step}`);
        return true;
      } else {
        console.error('❌ Erro ao atualizar progresso');
        return false;
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      return false;
    }
  }

  /**
   * Verifica se o usuário pode acessar uma página específica
   */
  canAccessPage(pageName) {
    const pageStep = this.steps[pageName] || 0;
    return pageStep <= this.currentStep + 1; // Pode acessar a próxima etapa
  }

  /**
   * Bloqueia acesso se não autorizado
   */
  blockUnauthorizedAccess(pageName) {
    if (!this.canAccessPage(pageName)) {
      alert('Você precisa completar as etapas anteriores primeiro.');
      this.redirectToCorrectPage();
      return false;
    }
    return true;
  }
}

// Instância global
window.cadastroProgress = new CadastroProgressManager();

// Função para inicializar o sistema de progresso
async function initCadastroProgress() {
  const uid = localStorage.getItem('userUid');
  if (!uid) {
    console.log('❌ Usuário não autenticado');
    window.location.href = 'criar-conta-Anuncio.html';
    return;
  }

  const currentStep = await window.cadastroProgress.checkCadastroProgress(uid);
  window.cadastroProgress.redirectToCorrectPage();
}

// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', initCadastroProgress);

