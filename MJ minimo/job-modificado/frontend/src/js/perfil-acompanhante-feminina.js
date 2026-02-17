// ===== PERFIL ACOMPANHANTE FEMININA - JAVASCRIPT ESPECÍFICO =====

// Variáveis específicas para acompanhante feminina
let efeitosSensuais = {
    particulas: false,
    brilho: false,
    animacoes: true
};

// Inicialização específica
document.addEventListener('DOMContentLoaded', function() {
    inicializarAcompanhanteFeminina();
    configurarEfeitosSensuais();
    configurarInteracoesEspeciais();
});

// ===== INICIALIZAÇÃO ESPECÍFICA =====
function inicializarAcompanhanteFeminina() {
    // Aplicar tema específico
    const container = document.querySelector('.perfil-container');
    container.classList.add('acompanhante-feminina');
    
    // Configurar animações de entrada
    configurarAnimacoesEntrada();
    
    // Configurar efeitos de hover especiais
    configurarEfeitosHover();
    
    // Configurar contador de visualizações
    configurarContadorVisualizacoes();
    
    // Configurar sistema de favoritos avançado
    configurarSistemaFavoritos();
}

// ===== EFEITOS SENSUAIS =====
function configurarEfeitosSensuais() {
    // Efeito de partículas no header
    if (efeitosSensuais.particulas) {
        criarParticulasHeader();
    }
    
    // Efeito de brilho nas imagens
    if (efeitosSensuais.brilho) {
        configurarEfeitoBrilho();
    }
    
    // Animações suaves
    if (efeitosSensuais.animacoes) {
        configurarAnimacoesSuaves();
    }
}

function criarParticulasHeader() {
    const header = document.querySelector('.sensual-header');
    const particulasContainer = document.createElement('div');
    particulasContainer.className = 'particulas-container';
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
    
    // Criar partículas
    for (let i = 0; i < 20; i++) {
        criarParticula(particulasContainer);
    }
}

function criarParticula(container) {
    const particula = document.createElement('div');
    particula.className = 'particula';
    particula.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        animation: flutuar ${3 + Math.random() * 4}s infinite ease-in-out;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 2}s;
    `;
    
    container.appendChild(particula);
}

function configurarEfeitoBrilho() {
    const imagens = document.querySelectorAll('.foto-principal img, .miniatura img');
    
    imagens.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.filter = 'brightness(1.2) saturate(1.3)';
            this.style.transition = 'filter 0.3s ease';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.filter = 'brightness(1) saturate(1)';
        });
    });
}

function configurarAnimacoesSuaves() {
    // Animação de pulsação para elementos importantes
    const elementosPulsantes = document.querySelectorAll('.categoria-badge, .preco-item.destaque');
    
    elementosPulsantes.forEach(elemento => {
        elemento.style.animation = 'pulsacao 3s infinite ease-in-out';
    });
    
    // Animação de flutuação para cards
    const cards = document.querySelectorAll('.info-item, .servico-item, .preco-item');
    
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animacao-entrada');
    });
}

// ===== ANIMAÇÕES DE ENTRADA =====
function configurarAnimacoesEntrada() {
    const elementos = document.querySelectorAll('.info-item, .preco-item, .servico-item, .localizacao-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                entry.target.classList.add('animado');
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

// ===== EFEITOS DE HOVER =====
function configurarEfeitosHover() {
    // Efeito de hover para botões de contato
    const botoesContato = document.querySelectorAll('.btn-contato');
    
    botoesContato.forEach(botao => {
        botao.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
            this.style.boxShadow = '0 15px 40px rgba(255, 20, 147, 0.4)';
        });
        
        botao.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
        });
    });
    
    // Efeito de hover para cards de informação
    const cardsInfo = document.querySelectorAll('.info-item, .servico-item');
    
    cardsInfo.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(255, 20, 147, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
        });
    });
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
    contador.className = 'contador-visualizacoes';
    contador.innerHTML = `
        <i class="fas fa-eye"></i>
        <span>${count} visualizações</span>
    `;
    contador.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: linear-gradient(45deg, #FF1493, #FF69B4);
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
            document.body.removeChild(contador);
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
            icone.style.color = '#FF1493';
            btnFavorito.classList.add('favoritado');
        }
    }
    
    // Efeito especial ao favoritar
    btnFavorito.addEventListener('click', function() {
        if (!favorito) {
            // Efeito de coração
            criarEfeitoCoracao();
            
            // Animação do botão
            this.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        }
    });
}

function criarEfeitoCoracao() {
    const coracao = document.createElement('div');
    coracao.innerHTML = '❤️';
    coracao.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        z-index: 10000;
        pointer-events: none;
        animation: coracaoExplosao 1s ease-out forwards;
    `;
    
    document.body.appendChild(coracao);
    
    setTimeout(() => {
        document.body.removeChild(coracao);
    }, 1000);
}

// ===== INTERAÇÕES ESPECIAIS =====
function configurarInteracoesEspeciais() {
    // Efeito de digitação no nome
    const nome = document.querySelector('.perfil-nome');
    if (nome) {
        efeitoDigitacao(nome, nome.textContent);
    }
    
    // Efeito de contagem nos preços
    const precos = document.querySelectorAll('.preco-valor');
    precos.forEach(preco => {
        efeitoContagem(preco);
    });
    
    // Efeito de revelação progressiva
    configurarRevelacaoProgressiva();
}

function efeitoDigitacao(elemento, texto) {
    elemento.textContent = '';
    let i = 0;
    
    const timer = setInterval(() => {
        elemento.textContent += texto.charAt(i);
        i++;
        
        if (i > texto.length) {
            clearInterval(timer);
        }
    }, 100);
}

function efeitoContagem(elemento) {
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

function configurarRevelacaoProgressiva() {
    const secoes = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revelado');
            }
        });
    }, { threshold: 0.2 });
    
    secoes.forEach(secao => {
        secao.classList.add('nao-revelado');
        observer.observe(secao);
    });
}

// ===== FUNÇÕES ESPECÍFICAS PARA ACOMPANHANTE FEMININA =====
function iniciarConversaIntima() {
    const whatsapp = document.querySelector('.contato-info p:last-child').textContent.replace('WhatsApp: ', '');
    const mensagem = `Olá! Vi seu anúncio e gostaria de agendar um encontro. Podemos conversar? 😘`;
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
    
    window.open(url, '_blank');
    
    // Registrar interesse
    registrarInteresse('whatsapp');
}

function fazerLigacaoDireta() {
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
function alternarTemaSensual() {
    const container = document.querySelector('.perfil-container');
    const temas = ['acompanhante-sensual', 'acompanhante-sensual-v2', 'acompanhante-sensual-v3'];
    const temaAtual = container.dataset.tema || 'acompanhante-sensual';
    const proximoIndex = (temas.indexOf(temaAtual) + 1) % temas.length;
    
    container.dataset.tema = temas[proximoIndex];
    mostrarNotificacao(`Tema alterado para: ${temas[proximoIndex]}`, 'info');
}

// ===== CSS DINÂMICO =====
function adicionarEstilosDinamicos() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes flutuar {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes pulsacao {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes coracaoExplosao {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        
        @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
        }
        
        @keyframes slideOutLeft {
            from { transform: translateX(0); }
            to { transform: translateX(-100%); }
        }
        
        .nao-revelado {
            opacity: 0;
            transform: translateY(50px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .revelado {
            opacity: 1;
            transform: translateY(0);
        }
        
        .animacao-entrada {
            animation: entradaSuave 0.8s ease forwards;
        }
        
        @keyframes entradaSuave {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        .favoritado {
            animation: favoritoPulse 0.6s ease;
        }
        
        @keyframes favoritoPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
    `;
    
    document.head.appendChild(style);
}

// ===== INICIALIZAÇÃO FINAL =====
window.addEventListener('load', function() {
    adicionarEstilosDinamicos();
    
    // Adicionar botões especiais em desenvolvimento
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const btnTema = document.createElement('button');
        btnTema.innerHTML = '<i class="fas fa-heart"></i>';
        btnTema.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: linear-gradient(45deg, #FF1493, #FF69B4);
            color: white;
            border: none;
            padding: 15px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            box-shadow: 0 4px 15px rgba(255, 20, 147, 0.4);
            z-index: 1000;
        `;
        btnTema.onclick = alternarTemaSensual;
        document.body.appendChild(btnTema);
    }
    
    // Configurar efeitos especiais após carregamento
    setTimeout(() => {
        configurarEfeitosSensuais();
    }, 1000);
});
