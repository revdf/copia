// ===== PERFIL TRANS ACOMPANHANTE - JAVASCRIPT ESPECÍFICO =====

// Variáveis específicas para trans acompanhante
let efeitosTrans = {
    rainbow: true,
    sparkles: true,
    animacoes: true,
    respeito: true
};

// Inicialização específica
document.addEventListener('DOMContentLoaded', function() {
    inicializarTransAcompanhante();
    configurarEfeitosTrans();
    configurarInteracoesEspeciais();
    configurarSistemaRespeito();
});

// ===== INICIALIZAÇÃO ESPECÍFICA =====
function inicializarTransAcompanhante() {
    // Aplicar tema específico
    const container = document.querySelector('.perfil-container');
    container.classList.add('trans-acompanhante');
    
    // Configurar animações de entrada especiais
    configurarAnimacoesEntradaTrans();
    
    // Configurar efeitos de hover especiais
    configurarEfeitosHoverTrans();
    
    // Configurar sistema de respeito e inclusão
    configurarSistemaRespeito();
    
    // Configurar contador de visualizações
    configurarContadorVisualizacoes();
    
    // Configurar sistema de favoritos avançado
    configurarSistemaFavoritos();
}

// ===== EFEITOS TRANS ESPECÍFICOS =====
function configurarEfeitosTrans() {
    // Efeito de arco-íris no header
    if (efeitosTrans.rainbow) {
        criarEfeitoRainbow();
    }
    
    // Efeito de sparkles
    if (efeitosTrans.sparkles) {
        configurarEfeitoSparkles();
    }
    
    // Animações suaves específicas
    if (efeitosTrans.animacoes) {
        configurarAnimacoesSuavesTrans();
    }
}

function criarEfeitoRainbow() {
    const header = document.querySelector('.trans-header');
    const rainbowContainer = document.createElement('div');
    rainbowContainer.className = 'rainbow-container';
    rainbowContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    
    header.appendChild(rainbowContainer);
    
    // Criar partículas arco-íris
    for (let i = 0; i < 15; i++) {
        criarParticulaRainbow(rainbowContainer);
    }
}

function criarParticulaRainbow(container) {
    const particula = document.createElement('div');
    const cores = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff', '#ff00ff'];
    const corAleatoria = cores[Math.floor(Math.random() * cores.length)];
    
    particula.className = 'particula-rainbow';
    particula.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background: ${corAleatoria};
        border-radius: 50%;
        animation: flutuarRainbow ${4 + Math.random() * 3}s infinite ease-in-out;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 2}s;
        box-shadow: 0 0 10px ${corAleatoria};
    `;
    
    container.appendChild(particula);
}

function configurarEfeitoSparkles() {
    const elementos = document.querySelectorAll('.trans-badge, .badge-trans, .preco-item.destaque');
    
    elementos.forEach(elemento => {
        elemento.addEventListener('mouseenter', function() {
            criarSparkles(this);
        });
    });
}

function criarSparkles(elemento) {
    const rect = elemento.getBoundingClientRect();
    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'sparkle-container';
    sparkleContainer.style.cssText = `
        position: fixed;
        top: ${rect.top}px;
        left: ${rect.left}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        pointer-events: none;
        z-index: 1000;
    `;
    
    document.body.appendChild(sparkleContainer);
    
    // Criar sparkles
    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.style.cssText = `
            position: absolute;
            font-size: 1.2rem;
            animation: sparkleAnimation 1s ease-out forwards;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 0.5}s;
        `;
        sparkleContainer.appendChild(sparkle);
    }
    
    // Remover após animação
    setTimeout(() => {
        document.body.removeChild(sparkleContainer);
    }, 1500);
}

function configurarAnimacoesSuavesTrans() {
    // Animação de pulsação para elementos importantes
    const elementosPulsantes = document.querySelectorAll('.trans-badge, .badge-trans, .preco-item.destaque');
    
    elementosPulsantes.forEach(elemento => {
        elemento.style.animation = 'transPulsacao 3s infinite ease-in-out';
    });
    
    // Animação de flutuação para cards
    const cards = document.querySelectorAll('.info-item, .servico-item, .preco-item, .especifico-item');
    
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animacao-entrada-trans');
    });
}

// ===== ANIMAÇÕES DE ENTRADA TRANS =====
function configurarAnimacoesEntradaTrans() {
    const elementos = document.querySelectorAll('.info-item, .preco-item, .servico-item, .especifico-item, .localizacao-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                entry.target.classList.add('animado-trans');
            }
        });
    }, { threshold: 0.1 });
    
    elementos.forEach((elemento, index) => {
        elemento.style.opacity = '0';
        elemento.style.transform = 'translateY(30px) scale(0.95)';
        elemento.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`;
        observer.observe(elemento);
    });
}

// ===== EFEITOS DE HOVER TRANS =====
function configurarEfeitosHoverTrans() {
    // Efeito de hover para botões de contato
    const botoesContato = document.querySelectorAll('.btn-contato');
    
    botoesContato.forEach(botao => {
        botao.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
            this.style.boxShadow = '0 15px 40px rgba(218, 112, 214, 0.4)';
        });
        
        botao.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
        });
    });
    
    // Efeito de hover para cards de informação
    const cardsInfo = document.querySelectorAll('.info-item, .servico-item, .especifico-item');
    
    cardsInfo.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(218, 112, 214, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
        });
    });
}

// ===== SISTEMA DE RESPEITO E INCLUSÃO =====
function configurarSistemaRespeito() {
    // Adicionar mensagem de respeito
    const mensagemRespeito = document.createElement('div');
    mensagemRespeito.className = 'mensagem-respeito';
    mensagemRespeito.innerHTML = `
        <div class="respeito-content">
            <i class="fas fa-heart"></i>
            <span>Respeitamos e valorizamos a identidade trans. Ambiente seguro e inclusivo.</span>
        </div>
    `;
    mensagemRespeito.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: linear-gradient(45deg, #FF1493, #DA70D6);
        color: white;
        padding: 15px 20px;
        border-radius: 25px;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 15px rgba(255, 20, 147, 0.3);
        animation: slideInLeft 0.5s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(mensagemRespeito);
    
    // Remover após 8 segundos
    setTimeout(() => {
        mensagemRespeito.style.animation = 'slideOutLeft 0.5s ease';
        setTimeout(() => {
            if (document.body.contains(mensagemRespeito)) {
                document.body.removeChild(mensagemRespeito);
            }
        }, 500);
    }, 8000);
}

// ===== CONTADOR DE VISUALIZAÇÕES =====
function configurarContadorVisualizacoes() {
    const perfilId = document.querySelector('.adicional-item .adicional-value')?.textContent;
    
    if (perfilId) {
        // Incrementar visualizações no localStorage
        let visualizacoes = JSON.parse(localStorage.getItem('visualizacoes') || '{}');
        visualizacoes[perfilId] = (visualizacoes[perfilId] || 0) + 1;
        localStorage.setItem('visualizacoes', JSON.stringify(visualizacoes));
        
        // Mostrar contador se for alta
        if (visualizacoes[perfilId] > 10) {
            mostrarContadorVisualizacoes(visualizacoes[perfilId]);
        }
    }
}

function mostrarContadorVisualizacoes(count) {
    const contador = document.createElement('div');
    contador.className = 'contador-visualizacoes-trans';
    contador.innerHTML = `
        <i class="fas fa-eye"></i>
        <span>${count} visualizações</span>
    `;
    contador.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: linear-gradient(45deg, #FF1493, #DA70D6);
        color: white;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 15px rgba(255, 20, 147, 0.3);
        animation: slideInLeft 0.5s ease;
    `;
    
    document.body.appendChild(contador);
    
    // Remover após 5 segundos
    setTimeout(() => {
        contador.style.animation = 'slideOutLeft 0.5s ease';
        setTimeout(() => {
            if (document.body.contains(contador)) {
                document.body.removeChild(contador);
            }
        }, 500);
    }, 5000);
}

// ===== SISTEMA DE FAVORITOS AVANÇADO =====
function configurarSistemaFavoritos() {
    const btnFavorito = document.querySelector('.btn-favorito');
    
    // Verificar se já é favorito
    const perfilId = document.querySelector('.adicional-item .adicional-value')?.textContent;
    if (perfilId) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
        if (favoritos.includes(perfilId)) {
            favorito = true;
            const icone = btnFavorito.querySelector('i');
            icone.className = 'fas fa-heart';
            icone.style.color = '#DA70D6';
            btnFavorito.classList.add('favoritado-trans');
        }
    }
    
    // Efeito especial ao favoritar
    btnFavorito.addEventListener('click', function() {
        if (!favorito) {
            // Efeito de coração trans
            criarEfeitoCoracaoTrans();
            
            // Animação do botão
            this.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        }
    });
}

function criarEfeitoCoracaoTrans() {
    const coracao = document.createElement('div');
    coracao.innerHTML = '💜';
    coracao.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        z-index: 10000;
        pointer-events: none;
        animation: coracaoTransExplosao 1s ease-out forwards;
    `;
    
    document.body.appendChild(coracao);
    
    setTimeout(() => {
        if (document.body.contains(coracao)) {
            document.body.removeChild(coracao);
        }
    }, 1000);
}

// ===== INTERAÇÕES ESPECIAIS TRANS =====
function configurarInteracoesEspeciais() {
    // Efeito de digitação no nome
    const nome = document.querySelector('.perfil-nome');
    if (nome) {
        efeitoDigitacaoTrans(nome, nome.textContent);
    }
    
    // Efeito de contagem nos preços
    const precos = document.querySelectorAll('.preco-valor');
    precos.forEach(preco => {
        efeitoContagemTrans(preco);
    });
    
    // Efeito de revelação progressiva
    configurarRevelacaoProgressivaTrans();
}

function efeitoDigitacaoTrans(elemento, texto) {
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

function efeitoContagemTrans(elemento) {
    const valorTexto = elemento.textContent;
    const valor = parseInt(valorTexto.replace(/\D/g, ''));
    
    if (valor) {
        elemento.textContent = 'R$ 0';
        let contador = 0;
        const incremento = valor / 50;
        
        const timer = setInterval(() => {
            contador += incremento;
            if (contador >= valor) {
                elemento.textContent = valorTexto;
                clearInterval(timer);
            } else {
                elemento.textContent = `R$ ${Math.floor(contador)}`;
            }
        }, 30);
    }
}

function configurarRevelacaoProgressivaTrans() {
    const secoes = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revelado-trans');
            }
        });
    }, { threshold: 0.2 });
    
    secoes.forEach(secao => {
        secao.classList.add('nao-revelado-trans');
        observer.observe(secao);
    });
}

// ===== FUNÇÕES ESPECÍFICAS PARA TRANS ACOMPANHANTE =====
function iniciarConversaRespeitosa() {
    const whatsapp = document.querySelector('.contato-info p:last-child').textContent.replace('WhatsApp: ', '');
    const mensagem = `Olá! Vi seu anúncio e gostaria de agendar um encontro. Respeito sua identidade e gostaria de conversar sobre seus serviços. 😊`;
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
    
    window.open(url, '_blank');
    
    // Registrar interesse
    registrarInteresse('whatsapp');
}

function fazerLigacaoRespeitosa() {
    const telefone = document.querySelector('.contato-info p:first-child').textContent.replace('Telefone: ', '');
    window.location.href = `tel:${telefone}`;
    
    // Registrar interesse
    registrarInteresse('telefone');
}

function registrarInteresse(tipo) {
    const perfilId = document.querySelector('.adicional-item .adicional-value')?.textContent;
    
    if (perfilId) {
        let interesses = JSON.parse(localStorage.getItem('interesses') || '{}');
        if (!interesses[perfilId]) {
            interesses[perfilId] = { whatsapp: 0, telefone: 0 };
        }
        interesses[perfilId][tipo]++;
        localStorage.setItem('interesses', JSON.stringify(interesses));
    }
}

// ===== FUNÇÕES DE LAYOUT DINÂMICO ESPECÍFICAS =====
function alternarTemaTrans() {
    const container = document.querySelector('.perfil-container');
    const temas = ['acompanhante-sensual', 'acompanhante-sensual-v2', 'acompanhante-sensual-v3'];
    const temaAtual = container.dataset.tema || 'acompanhante-sensual';
    const proximoIndex = (temas.indexOf(temaAtual) + 1) % temas.length;
    
    container.dataset.tema = temas[proximoIndex];
    mostrarNotificacao(`Tema alterado para: ${temas[proximoIndex]}`, 'info');
}

// ===== CSS DINÂMICO TRANS =====
function adicionarEstilosDinamicosTrans() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes flutuarRainbow {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
            50% { transform: translateY(-25px) rotate(180deg); opacity: 1; }
        }
        
        @keyframes transPulsacao {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes coracaoTransExplosao {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        
        @keyframes sparkleAnimation {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
            100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        
        @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
        }
        
        @keyframes slideOutLeft {
            from { transform: translateX(0); }
            to { transform: translateX(-100%); }
        }
        
        .nao-revelado-trans {
            opacity: 0;
            transform: translateY(50px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .revelado-trans {
            opacity: 1;
            transform: translateY(0);
        }
        
        .animacao-entrada-trans {
            animation: entradaTransSuave 0.8s ease forwards;
        }
        
        @keyframes entradaTransSuave {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        .favoritado-trans {
            animation: favoritoTransPulse 0.6s ease;
        }
        
        @keyframes favoritoTransPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
    `;
    
    document.head.appendChild(style);
}

// ===== INICIALIZAÇÃO FINAL =====
window.addEventListener('load', function() {
    adicionarEstilosDinamicosTrans();
    
    // Adicionar botões especiais em desenvolvimento
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const btnTema = document.createElement('button');
        btnTema.innerHTML = '<i class="fas fa-transgender"></i>';
        btnTema.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: linear-gradient(45deg, #FF1493, #DA70D6);
            color: white;
            border: none;
            padding: 15px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            box-shadow: 0 4px 15px rgba(255, 20, 147, 0.4);
            z-index: 1000;
        `;
        btnTema.onclick = alternarTemaTrans;
        document.body.appendChild(btnTema);
    }
    
    // Configurar efeitos especiais após carregamento
    setTimeout(() => {
        configurarEfeitosTrans();
    }, 1000);
});
