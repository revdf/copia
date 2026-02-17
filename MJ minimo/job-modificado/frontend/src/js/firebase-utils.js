// Firebase Utils - Funções para carregar anúncios
export async function carregarAnunciosPorCategoria(categoria) {
    try {
        const response = await fetch(`http://localhost:5001/api/anuncios`);
        const todosAnuncios = await response.json();
        
        // Filtrar por categoria se especificada
        if (categoria && categoria !== 'all') {
            return todosAnuncios.filter(anuncio => anuncio.categoria === categoria);
        }
        
        return todosAnuncios;
    } catch (error) {
        console.error("Erro ao carregar anúncios:", error);
        throw error;
    }
}

export function renderizarAnuncios(anuncios, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container ${containerSelector} não encontrado`);
        return;
    }

    if (!anuncios || anuncios.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>Nenhum anúncio encontrado</h3>
                <p>Tente ajustar os filtros ou verifique a conexão.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = anuncios.map(anuncio => `
        <div class="anuncio-card">
            <div class="anuncio-imagem">
                <img src="${anuncio.foto_capa_url || 'https://via.placeholder.com/300x300'}" 
                     alt="${anuncio.nome || 'Sem nome'}"
                     onerror="this.src='https://via.placeholder.com/300x300'">
                ${anuncio.destaque ? '<div class="destaque-badge">DESTAQUE</div>' : ''}
                ${anuncio.verificado ? '<div class="verificado-badge">✓</div>' : ''}
            </div>
            <div class="anuncio-info">
                <h3>${anuncio.nome || 'Sem nome'}</h3>
                <p class="localizacao">${anuncio.bairro || 'Local não informado'}</p>
                <p class="preco">R$ ${anuncio.preco || 'Sob consulta'}</p>
                <p class="categoria">${anuncio.categoria || 'Não informado'}</p>
            </div>
        </div>
    `).join('');
}

export function mostrarErro(containerSelector, mensagem) {
    const container = document.querySelector(containerSelector);
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <h3>❌ Erro</h3>
                <p>${mensagem}</p>
            </div>
        `;
    }
}
