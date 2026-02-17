/**
 * Integration Script for Index Page
 * Loads advertisements dynamically from the backend
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 Index Integration: Iniciando...');

    // Verificar se a API está disponível
    if (!window.api) {
        console.warn('⚠️ API Client não está disponível. Verifique se api-client.js foi carregado.');
        return;
    }

    try {
        // Test connection
        const ads = await window.api.getAnuncios({ limit: 10 });
        console.log(`✅ Conexão bem sucedida via api-client.js! Encontrados ${ads.length} anúncios.`);

        // Example: Render ads dynamically (Simple version)
        // Find the container (assuming 'choice-container' exists based on CSS)
        const container = document.querySelector('.choice-container');

        if (container && ads.length > 0) {
            // Optional: Clear existing static content or append
            // container.innerHTML = ''; 

            // Create a specific section for dynamic ads if you want to keep static ones
            const dynamicSection = document.createElement('div');
            dynamicSection.className = 'width-100';
            dynamicSection.innerHTML = '<h2 class="section-title" style="margin-top: 2rem;">Anúncios Recentes (Do Banco de Dados)</h2><div class="choice-container" id="dynamic-ads-container"></div>';

            // Insert after the existing container
            container.parentNode.insertBefore(dynamicSection, container.nextSibling);
            const targetContainer = document.getElementById('dynamic-ads-container');

            // Filtrar categorias bloqueadas (Em Breve)
            const blockedCategories = ['trans', 'homem', 'mulher-luxo'];
            const filteredAds = ads.filter(ad => !blockedCategories.includes(ad.category));

            filteredAds.forEach(ad => {
                const card = createAdCard(ad);
                targetContainer.appendChild(card);
            });
        }

    } catch (error) {
        // Silenciar erros de conexão (API pode não estar rodando)
        if (error.message && error.message.includes('Failed to fetch')) {
            console.log('ℹ️ Backend não está disponível. Continuando sem integração de anúncios dinâmicos.');
        } else {
            console.error('❌ Erro na integração:', error);
        }
        // Show offline warning or fallback
    }
});

function createAdCard(ad) {
    // Determine class based on category
    // Apenas categorias ativas: mulher (premium) e massagistas
    let cardClass = 'premium'; // default para mulher
    if (ad.category === 'mulher') cardClass = 'premium';
    if (ad.categoria === 'massagistas') cardClass = 'massagistas';

    const a = document.createElement('a');
    a.href = `A_02__premium_Anuncio.html?id=${ad.id}`; // We will need to create/adapt this page
    a.className = `choice-card ${cardClass}`;

    // Use fallback image if none provided
    const image = ad.foto_capa || 'images/avatar_placeholder.jpg';

    a.innerHTML = `
        <div style="width: 60px; height: 60px; border-radius: 50%; overflow: hidden; margin-bottom: 0.5rem; border: 2px solid white;">
            <img src="${image}" alt="${ad.nome}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <h2>${ad.nome}</h2>
        <p>${ad.cidade || 'DF'}</p>
        <i class="fas fa-arrow-right"></i>
    `;

    return a;
}
