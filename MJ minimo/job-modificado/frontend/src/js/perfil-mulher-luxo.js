// ===== PERFIL MULHER DE LUXO - JAVASCRIPT ESPECÍFICO =====

// Variáveis específicas para mulher de luxo
let galeriaImagens = [];
let imagemAtual = 0;
let favorito = false;

// Inicialização específica
document.addEventListener('DOMContentLoaded', function() {
    inicializarMulherLuxo();
    configurarEfeitosLuxo();
    configurarInteracoesEspeciais();
});

// ===== INICIALIZAÇÃO ESPECÍFICA =====
function inicializarMulherLuxo() {
    // Aplicar tema específico
    const container = document.querySelector('.perfil-container');
    container.classList.add('mulher-luxo');
    
    // Coletar imagens da galeria
    coletarImagensGaleria();
    
    // Configurar animações de entrada
    configurarAnimacoesEntrada();
    
    // Configurar efeitos de hover
    configurarEfeitosHover();
    
    // Configurar sistema de favoritos
    configurarSistemaFavoritos();
}

// ===== COLETA DE IMAGENS =====
function coletarImagensGaleria() {
    const imagens = document.querySelectorAll('.gallery-item img');
    galeriaImagens = Array.from(imagens).map(img => img.src);
}

// ===== EFEITOS DE LUXO =====
function configurarEfeitosLuxo() {
    // Efeito de parallax no header
    configurarParallaxHeader();
    
    // Efeito de brilho dourado
    configurarEfeitoBrilhoDourado();
    
    // Animações luxuosas
    configurarAnimacoesLuxuosas();
    
    // Efeito de partículas douradas
    criarParticulasDouradas();
}

function configurarParallaxHeader() {
    const header = document.querySelector('.luxo-header');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        if (header) {
            header.style.transform = `translateY(${rate}px)`;
        }
    });
}

function configurarEfeitoBrilhoDourado() {
    const elementosDourados = document.querySelectorAll('.verified-badge, .info-item strong, .highlight-item i, .preco-item.luxo, .section-title');
    
    elementosDourados.forEach(elemento => {
        elemento.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 20px rgba(212, 175, 55, 0.8)';
            this.style.transition = 'text-shadow 0.3s ease';
        });
        
        elemento.addEventListener('mouseleave', function() {
            this.style.textShadow = '';
        });
    });
}

function configurarAnimacoesLuxuosas() {
    // Animação de entrada para elementos
    const elementos = document.querySelectorAll('.info-item, .preco-item, .gallery-item, .adicional-item');
    
    elementos.forEach((elemento, index) => {
        elemento.style.opacity = '0';
        elemento.style.transform = 'translateY(30px)';
        elemento.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`;
    });
    
    // Animar quando visível
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    elementos.forEach(elemento => {
        observer.observe(elemento);
    });
}

function criarParticulasDouradas() {
    const header = document.querySelector('.luxo-header');
    const particulasContainer = document.createElement('div');
    particulasContainer.className = 'particulas-douradas';
    particulasContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    
    header.appendChild(particulasContainer);
    
    // Criar partículas douradas
    for (let i = 0; i < 12; i++) {
        criarParticulaDourada(particulasContainer);
    }
}

function criarParticulaDourada(container) {
    const particula = document.createElement('div');
    particula.className = 'particula-dourada';
    particula.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: #d4af37;
        border-radius: 50%;
        animation: flutuarDourado ${4 + Math.random() * 3}s infinite ease-in-out;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 2}s;
        box-shadow: 0 0 10px #d4af37;
    `;
    
    container.appendChild(particula);
}

// ===== ANIMAÇÕES DE ENTRADA =====
function configurarAnimacoesEntrada() {
    const elementos = document.querySelectorAll('.info-item, .preco-item, .gallery-item, .adicional-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animado-luxo');
            }
        });
    }, { threshold: 0.1 });
    
    elementos.forEach(elemento => {
        observer.observe(elemento);
    });
}

// ===== EFEITOS DE HOVER =====
function configurarEfeitosHover() {
    // Efeito de hover para botões flutuantes
    const botoesFlutuantes = document.querySelectorAll('.btn-floating');
    
    botoesFlutuantes.forEach(botao => {
        botao.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.15) translateY(-5px)';
            this.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.6)';
        });
        
        botao.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
            this.style.boxShadow = '0 0 10px rgba(0,0,0,0.4)';
        });
    });
    
    // Efeito de hover para itens da galeria
    const itensGaleria = document.querySelectorAll('.gallery-item');
    
    itensGaleria.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.08)';
            this.style.boxShadow = '0 20px 50px rgba(212, 175, 55, 0.4)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        });
    });
    
    // Efeito de hover para preços
    const precos = document.querySelectorAll('.preco-item.luxo');
    
    precos.forEach(preco => {
        preco.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px) scale(1.02)';
            this.style.boxShadow = '0 20px 50px rgba(212, 175, 55, 0.5)';
        });
        
        preco.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.3)';
        });
    });
}

// ===== SISTEMA DE FAVORITOS =====
function configurarSistemaFavoritos() {
    const btnFavorito = document.querySelector('.btn-favorite');
    
    // Verificar se já é favorito
    const perfilId = document.querySelector('.adicional-value')?.textContent;
    if (perfilId) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
        if (favoritos.includes(perfilId)) {
            favorito = true;
            const icone = btnFavorito.querySelector('i');
            icone.className = 'fas fa-heart';
            icone.style.color = '#ff1493';
        }
    }
    
    // Efeito especial ao favoritar
    btnFavorito.addEventListener('click', function(e) {
        e.preventDefault();
        toggleFavorito();
    });
}

function toggleFavorito() {
    const btnFavorito = document.querySelector('.btn-favorite i');
    
    favorito = !favorito;
    
    if (favorito) {
        btnFavorito.className = 'fas fa-heart';
        btnFavorito.style.color = '#ff1493';
        mostrarNotificacao('Adicionado aos favoritos VIP!', 'success');
        
        // Efeito de coração dourado
        criarEfeitoCoracaoDourado();
    } else {
        btnFavorito.className = 'far fa-heart';
        btnFavorito.style.color = '';
        mostrarNotificacao('Removido dos favoritos', 'info');
    }
    
    // Salvar no localStorage
    const perfilId = document.querySelector('.adicional-value')?.textContent;
    if (perfilId) {
        let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
        
        if (favorito) {
            if (!favoritos.includes(perfilId)) {
                favoritos.push(perfilId);
            }
        } else {
            favoritos = favoritos.filter(id => id !== perfilId);
        }
        
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
    }
}

function criarEfeitoCoracaoDourado() {
    const coracao = document.createElement('div');
    coracao.innerHTML = '💎';
    coracao.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        z-index: 10000;
        pointer-events: none;
        animation: coracaoDouradoExplosao 1.5s ease-out forwards;
    `;
    
    document.body.appendChild(coracao);
    
    setTimeout(() => {
        if (document.body.contains(coracao)) {
            document.body.removeChild(coracao);
        }
    }, 1500);
}

// ===== MODAL DA GALERIA =====
function abrirModal(src) {
    const modal = document.getElementById('gallery-modal');
    const imagem = document.getElementById('modal-image');
    
    imagem.src = src;
    modal.style.display = 'block';
    
    // Encontrar índice da imagem atual
    imagemAtual = galeriaImagens.indexOf(src);
    
    // Adicionar efeito de fade-in
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function fecharModal() {
    const modal = document.getElementById('gallery-modal');
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function anteriorImagem() {
    imagemAtual = (imagemAtual - 1 + galeriaImagens.length) % galeriaImagens.length;
    document.getElementById('modal-image').src = galeriaImagens[imagemAtual];
}

function proximaImagem() {
    imagemAtual = (imagemAtual + 1) % galeriaImagens.length;
    document.getElementById('modal-image').src = galeriaImagens[imagemAtual];
}

// ===== INTERAÇÕES ESPECIAIS =====
function configurarInteracoesEspeciais() {
    // Fechar modal ao clicar fora
    document.getElementById('gallery-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModal();
        }
    });
    
    // Navegação por teclado na galeria
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('gallery-modal');
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') {
                fecharModal();
            } else if (e.key === 'ArrowLeft') {
                anteriorImagem();
            } else if (e.key === 'ArrowRight') {
                proximaImagem();
            }
        }
    });
    
    // Efeito de digitação no nome
    const nome = document.querySelector('.perfil-nome');
    if (nome) {
        efeitoDigitacaoLuxo(nome, nome.textContent);
    }
    
    // Efeito de contagem nos preços
    const precos = document.querySelectorAll('.preco-valor');
    precos.forEach(preco => {
        efeitoContagemLuxo(preco);
    });
}

function efeitoDigitacaoLuxo(elemento, texto) {
    elemento.textContent = '';
    let i = 0;
    
    const timer = setInterval(() => {
        elemento.textContent += texto.charAt(i);
        i++;
        
        if (i > texto.length) {
            clearInterval(timer);
        }
    }, 120);
}

function efeitoContagemLuxo(elemento) {
    const valorTexto = elemento.textContent;
    const valor = parseInt(valorTexto.replace(/\D/g, ''));
    
    if (valor) {
        elemento.textContent = 'R$ 0';
        let contador = 0;
        const incremento = valor / 60;
        
        const timer = setInterval(() => {
            contador += incremento;
            if (contador >= valor) {
                elemento.textContent = valorTexto;
                clearInterval(timer);
            } else {
                elemento.textContent = `R$ ${Math.floor(contador)}`;
            }
        }, 25);
    }
}

// ===== FUNÇÕES DE RELATÓRIO =====
function reportarPerfil() {
    const motivo = prompt('Motivo do relatório:');
    if (motivo) {
        mostrarNotificacao('Relatório enviado com sucesso!', 'success');
        
        // Aqui você pode enviar o relatório para o backend
        console.log('Relatório:', motivo);
    }
}

// ===== NOTIFICAÇÕES =====
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensagem}</span>
    `;
    
    // Estilos da notificação
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${tipo === 'success' ? 'linear-gradient(45deg, #28a745, #20c997)' : tipo === 'error' ? 'linear-gradient(45deg, #dc3545, #e74c3c)' : 'linear-gradient(45deg, #d4af37, #ffd700)'};
        color: ${tipo === 'success' || tipo === 'error' ? 'white' : '#000'};
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        transform: translateX(-50%) translateY(-100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notificacao);
    
    // Animar entrada
    setTimeout(() => {
        notificacao.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.transform = 'translateX(-50%) translateY(-100%)';
        setTimeout(() => {
            if (document.body.contains(notificacao)) {
                document.body.removeChild(notificacao);
            }
        }, 300);
    }, 3000);
}

// ===== CSS DINÂMICO =====
function adicionarEstilosDinamicos() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes flutuarDourado {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
            50% { transform: translateY(-30px) rotate(180deg); opacity: 1; }
        }
        
        @keyframes coracaoDouradoExplosao {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        
        .animado-luxo {
            animation: entradaLuxuosa 0.8s ease forwards;
        }
        
        @keyframes entradaLuxuosa {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ===== INICIALIZAÇÃO FINAL =====
window.addEventListener('load', function() {
    adicionarEstilosDinamicos();
    
    // Configurar efeitos especiais após carregamento
    setTimeout(() => {
        configurarEfeitosLuxo();
    }, 1000);
});
