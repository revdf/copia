async function carregarAnuncios() {
  try {
    const response = await fetch("http://localhost:5001/api/anuncios");
    const anuncios = await response.json();
    const container = document.querySelector("#anuncios-container");
    container.innerHTML = anuncios.map(a => `
      <div class="featured-card">
        <img src="${a.foto_capa_url || 'https://via.placeholder.com/300x300'}" alt="${a.nome || 'Sem nome'}">
        <div class="featured-info">
          <h3>${a.nome || 'Sem nome'}</h3>
          <p>${a.bairro || 'Local não informado'}</p>
          <p><strong>${a.preco || 'Sob consulta'}</strong></p>
        </div>
      </div>
    `).join("");
  } catch (error) {
    console.error("Erro ao carregar anúncios:", error);
  }
}

carregarAnuncios();
