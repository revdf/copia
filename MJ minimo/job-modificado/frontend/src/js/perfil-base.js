// ===== PERFIL BASE - JAVASCRIPT =====

// Variáveis globais
let fotosGaleria = [];
let fotoAtual = 0;
let favorito = false;

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    inicializarPerfil();
    carregarDadosPerfil();
    aplicarTema();
    aplicarLayout();
});

// ===== INICIALIZAÇÃO =====
function inicializarPerfil() {
    // Coletar todas as fotos da galeria
    const miniaturas = document.querySelectorAll('.miniatura img');
    fotosGaleria = Array.from(miniaturas).map(img => img.src);
    
    // Configurar eventos
    configurarEventos();
    
    // Aplicar animações
    aplicarAnimacoes();
}

// ===== CARREGAMENTO DE DADOS =====
function carregarDadosPerfil() {
    // Simular carregamento de dados do backend
    // Em produção, isso viria de uma API
    const dadosPerfil = {
        id: getUrlParameter('id') || '12345',
        nome: getUrlParameter('nome') || 'Nome do Anunciante',
        categoria: getUrlParameter('categoria') || 'acompanhantes',
        cidade: getUrlParameter('cidade') || 'São Paulo',
        estado: getUrlParameter('estado') || 'SP',
        tema: getUrlParameter('tema') || 'acompanhante-sensual',
        layout: getUrlParameter('layout') || 'padrao'
    };
    
    // Aplicar dados ao DOM
    aplicarDadosAoDOM(dadosPerfil);
}

// ===== APLICAÇÃO DE TEMA =====
function aplicarTema() {
    const container = document.querySelector('.perfil-container');
    const categoria = container.dataset.categoria;
    const tipo = container.dataset.tipo;
    
    let tema = 'acompanhante-sensual'; // padrão
    
    // Determinar tema baseado na categoria e tipo
    if (categoria === 'acompanhantes') {
        if (tipo === 'mulher-luxo') {
            tema = 'luxo-sofisticado';
        } else {
            tema = 'acompanhante-sensual';
        }
    } else if (categoria === 'massagistas') {
        if (tipo === 'mulher-luxo') {
            tema = 'luxo-sofisticado';
        } else {
            tema = 'massagista-zen';
        }
    } else if (categoria === 'sexo-virtual') {
        tema = 'virtual-tecnologico';
    }
    
    container.dataset.tema = tema;
}

// ===== APLICAÇÃO DE LAYOUT =====
function aplicarLayout() {
    const container = document.querySelector('.perfil-container');
    const layouts = ['padrao', 'centralizado', 'lateral', 'compacto'];
    const layoutAleatorio = layouts[Math.floor(Math.random() * layouts.length)];
    
    container.dataset.layout = layoutAleatorio;
}

// ===== GALERIA DE FOTOS =====
function trocarFotoPrincipal(src) {
    const fotoPrincipal = document.getElementById('foto-principal');
    const miniaturas = document.querySelectorAll('.miniatura');
    
    // Atualizar foto principal
    fotoPrincipal.src = src;
    
    // Atualizar miniatura ativa
    miniaturas.forEach(miniatura => {
        miniatura.classList.remove('ativa');
        if (miniatura.querySelector('img').src === src) {
            miniatura.classList.add('ativa');
        }
    });
    
    // Atualizar índice atual
    fotoAtual = fotosGaleria.indexOf(src);
}

function abrirGaleria() {
    const modal = document.getElementById('galeria-modal');
    const imagem = document.getElementById('galeria-imagem');
    
    imagem.src = fotosGaleria[fotoAtual];
    modal.style.display = 'block';
    
    // Adicionar efeito de fade-in
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function fecharGaleria() {
    const modal = document.getElementById('galeria-modal');
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function anteriorFoto() {
    fotoAtual = (fotoAtual - 1 + fotosGaleria.length) % fotosGaleria.length;
    document.getElementById('galeria-imagem').src = fotosGaleria[fotoAtual];
}

function proximaFoto() {
    fotoAtual = (fotoAtual + 1) % fotosGaleria.length;
    document.getElementById('galeria-imagem').src = fotosGaleria[fotoAtual];
}

// ===== FAVORITOS =====
function toggleFavorito() {
    const btnFavorito = document.querySelector('.btn-favorito i');
    
    favorito = !favorito;
    
    if (favorito) {
        btnFavorito.className = 'fas fa-heart';
        btnFavorito.style.color = '#ff1493';
        mostrarNotificacao('Adicionado aos favoritos!', 'success');
    } else {
        btnFavorito.className = 'far fa-heart';
        btnFavorito.style.color = '';
        mostrarNotificacao('Removido dos favoritos!', 'info');
    }
    
    // Salvar no localStorage
    const perfilId = document.querySelector('.adicional-item .adicional-value').textContent;
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

// ===== COMPARTILHAR =====
function compartilharPerfil() {
    const url = window.location.href;
    const titulo = document.querySelector('.perfil-nome').textContent;
    
    if (navigator.share) {
        navigator.share({
            title: titulo,
            text: `Confira o perfil de ${titulo}`,
            url: url
        });
    } else {
        // Fallback para navegadores que não suportam Web Share API
        navigator.clipboard.writeText(url).then(() => {
            mostrarNotificacao('Link copiado para a área de transferência!', 'success');
        }).catch(() => {
            // Fallback adicional
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            mostrarNotificacao('Link copiado para a área de transferência!', 'success');
        });
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
        right: 20px;
        background: ${tipo === 'success' ? '#28a745' : tipo === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notificacao);
    
    // Animar entrada
    setTimeout(() => {
        notificacao.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notificacao);
        }, 300);
    }, 3000);
}

// ===== CONFIGURAÇÃO DE EVENTOS =====
function configurarEventos() {
    // Fechar modal ao clicar fora
    document.getElementById('galeria-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharGaleria();
        }
    });
    
    // Navegação por teclado na galeria
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('galeria-modal');
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') {
                fecharGaleria();
            } else if (e.key === 'ArrowLeft') {
                anteriorFoto();
            } else if (e.key === 'ArrowRight') {
                proximaFoto();
            }
        }
    });
    
    // Lazy loading para imagens
    const imagens = document.querySelectorAll('img');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    imagens.forEach(img => {
        if (img.dataset.src) {
            img.classList.add('lazy');
            observer.observe(img);
        }
    });
}

// ===== ANIMAÇÕES =====
function aplicarAnimacoes() {
    // Animação de entrada para elementos
    const elementos = document.querySelectorAll('.info-item, .preco-item, .servico-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    elementos.forEach((elemento, index) => {
        elemento.style.opacity = '0';
        elemento.style.transform = 'translateY(20px)';
        elemento.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(elemento);
    });
}

// ===== UTILITÁRIOS =====
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function aplicarDadosAoDOM(dados) {
    // Aplicar dados básicos
    document.querySelector('.perfil-nome').textContent = dados.nome;
    document.querySelector('.perfil-localizacao span').textContent = `${dados.cidade}, ${dados.estado}`;
    document.querySelector('.categoria-badge').textContent = dados.categoria;
    
    // Aplicar tema e layout
    const container = document.querySelector('.perfil-container');
    container.dataset.tema = dados.tema;
    container.dataset.layout = dados.layout;
}

// ===== INTEGRAÇÃO COM BACKEND =====
async function carregarDadosDoBackend(id) {
    try {
        const response = await fetch(`/api/anuncio/${id}`);
        const dados = await response.json();
        
        if (response.ok) {
            return dados;
        } else {
            throw new Error(dados.message || 'Erro ao carregar dados');
        }
    } catch (error) {
        console.error('Erro ao carregar dados do backend:', error);
        mostrarNotificacao('Erro ao carregar dados do perfil', 'error');
        return null;
    }
}

// ===== FUNÇÕES DE INTERAÇÃO =====
function iniciarConversaWhatsApp() {
    const whatsapp = document.querySelector('.contato-info p:last-child').textContent.replace('WhatsApp: ', '');
    const mensagem = `Olá! Vi seu anúncio e gostaria de saber mais informações.`;
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
    
    window.open(url, '_blank');
}

function fazerLigacao() {
    const telefone = document.querySelector('.contato-info p:first-child').textContent.replace('Telefone: ', '');
    window.location.href = `tel:${telefone}`;
}

// ===== FUNÇÕES DE LAYOUT DINÂMICO =====
function alternarLayout() {
    const container = document.querySelector('.perfil-container');
    const layouts = ['padrao', 'centralizado', 'lateral', 'compacto'];
    const layoutAtual = container.dataset.layout || 'padrao';
    const proximoIndex = (layouts.indexOf(layoutAtual) + 1) % layouts.length;
    
    container.dataset.layout = layouts[proximoIndex];
    mostrarNotificacao(`Layout alterado para: ${layouts[proximoIndex]}`, 'info');
}

// ===== INICIALIZAÇÃO FINAL =====
window.addEventListener('load', function() {
    // Verificar se é favorito
    const perfilId = document.querySelector('.adicional-item .adicional-value')?.textContent;
    if (perfilId) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
        if (favoritos.includes(perfilId)) {
            favorito = true;
            const btnFavorito = document.querySelector('.btn-favorito i');
            btnFavorito.className = 'fas fa-heart';
            btnFavorito.style.color = '#ff1493';
        }
    }
    
    // Adicionar botão de alternar layout (apenas em desenvolvimento)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const btnLayout = document.createElement('button');
        btnLayout.innerHTML = '<i class="fas fa-palette"></i>';
        btnLayout.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            border: none;
            padding: 15px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
        `;
        btnLayout.onclick = alternarLayout;
        document.body.appendChild(btnLayout);
    }
});
