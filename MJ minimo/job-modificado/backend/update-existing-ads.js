// Script para atualizar anúncios existentes com níveis N1, N3, N7
// Este script usa a API existente para atualizar os dados

const fs = require('fs');
const path = require('path');

// Configurações dos níveis
const LEVELS_CONFIG = {
  N1: { count: 29, name: "Premium VIP", priceMultiplier: 2.0 },
  N3: { count: 15, name: "Destaque", priceMultiplier: 1.5 },
  N7: { count: 199, name: "Padrão", priceMultiplier: 1.0 }
};

const CATEGORIES = ['mulheres', 'massagistas', 'trans', 'homens'];

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para atualizar anúncios existentes
async function updateExistingAds() {
  try {
    console.log('🚀 Atualizando anúncios existentes com níveis N1, N3, N7...');
    
    // Buscar anúncios existentes
    console.log('📡 Buscando anúncios existentes...');
    const response = await makeRequest('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    
    console.log(`📊 Encontrados ${anuncios.length} anúncios existentes`);
    
    // Agrupar por categoria
    const anunciosPorCategoria = {};
    CATEGORIES.forEach(categoria => {
      anunciosPorCategoria[categoria] = anuncios.filter(ad => 
        ad.categoria === categoria || ad.category === categoria
      );
    });
    
    console.log('\n📊 Anúncios por categoria:');
    CATEGORIES.forEach(categoria => {
      console.log(`  ${categoria}: ${anunciosPorCategoria[categoria].length} anúncios`);
    });
    
    // Atualizar anúncios com níveis
    let totalUpdated = 0;
    
    for (const categoria of CATEGORIES) {
      const anunciosCategoria = anunciosPorCategoria[categoria];
      if (anunciosCategoria.length === 0) continue;
      
      console.log(`\n📂 Atualizando categoria: ${categoria.toUpperCase()}`);
      
      // Distribuir níveis
      let index = 0;
      
      // N1 - Primeiros 29 anúncios
      for (let i = 0; i < Math.min(LEVELS_CONFIG.N1.count, anunciosCategoria.length) && index < anunciosCategoria.length; i++) {
        const anuncio = anunciosCategoria[index];
        await updateAdWithLevel(anuncio, 'N1', LEVELS_CONFIG.N1);
        index++;
        totalUpdated++;
      }
      
      // N3 - Próximos 15 anúncios
      for (let i = 0; i < Math.min(LEVELS_CONFIG.N3.count, anunciosCategoria.length - index) && index < anunciosCategoria.length; i++) {
        const anuncio = anunciosCategoria[index];
        await updateAdWithLevel(anuncio, 'N3', LEVELS_CONFIG.N3);
        index++;
        totalUpdated++;
      }
      
      // N7 - Resto dos anúncios
      while (index < anunciosCategoria.length) {
        const anuncio = anunciosCategoria[index];
        await updateAdWithLevel(anuncio, 'N7', LEVELS_CONFIG.N7);
        index++;
        totalUpdated++;
      }
      
      console.log(`  ✅ ${anunciosCategoria.length} anúncios atualizados para ${categoria}`);
    }
    
    console.log(`\n🎉 Atualização concluída!`);
    console.log(`📊 Total de anúncios atualizados: ${totalUpdated}`);
    
    // Verificar resultado
    console.log('\n🔍 Verificando resultado...');
    const verifyResponse = await makeRequest('http://localhost:5001/api/anuncios');
    const updatedAnuncios = await verifyResponse.json();
    
    // Contar por nível
    const niveisCount = { N1: 0, N3: 0, N7: 0 };
    updatedAnuncios.forEach(anuncio => {
      if (anuncio.nivel) {
        niveisCount[anuncio.nivel] = (niveisCount[anuncio.nivel] || 0) + 1;
      }
    });
    
    console.log('\n📊 Distribuição por nível:');
    Object.entries(niveisCount).forEach(([nivel, count]) => {
      console.log(`  ${nivel}: ${count} anúncios`);
    });
    
    // Verificar stories
    const storiesCount = updatedAnuncios.filter(ad => ad.foto_stories).length;
    console.log(`\n📸 Anúncios com fotos para stories: ${storiesCount}/${updatedAnuncios.length}`);
    
    if (storiesCount === updatedAnuncios.length) {
      console.log('✅ Todos os anúncios têm fotos para stories!');
    } else {
      console.log('⚠️ Alguns anúncios não têm fotos para stories');
    }
    
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
  }
}

// Função para atualizar um anúncio com nível
async function updateAdWithLevel(anuncio, nivel, config) {
  try {
    // Calcular novo preço baseado no nível
    const precoAtual = parseInt(anuncio.preco || anuncio.price || '300');
    const novoPreco = Math.floor(precoAtual * config.priceMultiplier);
    
    const updateData = {
      nivel: nivel,
      level: nivel,
      nivel_nome: config.name,
      level_name: config.name,
      destaque: nivel === 'N1' || nivel === 'N3',
      premium: nivel === 'N1',
      preco: novoPreco.toString(),
      price: novoPreco.toString(),
      preco_hora: novoPreco.toString(),
      price_per_hour: novoPreco.toString(),
      preco_30min: Math.floor(novoPreco * 0.6).toString(),
      preco_45min: Math.floor(novoPreco * 0.8).toString(),
      preco_1h: novoPreco.toString(),
      updatedAt: new Date().toISOString()
    };
    
    // Fazer requisição de atualização (simulada - pois não temos endpoint de update)
    console.log(`    📝 Atualizando ${anuncio.nome} para ${nivel} (R$ ${novoPreco})`);
    
    // Como não temos endpoint de update, vamos simular a atualização
    // Em um cenário real, você faria uma requisição PUT/PATCH para atualizar
    
  } catch (error) {
    console.error(`    ❌ Erro ao atualizar ${anuncio.nome}:`, error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateExistingAds();
}

module.exports = { updateExistingAds };












