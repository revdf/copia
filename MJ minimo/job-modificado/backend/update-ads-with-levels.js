// Script para atualizar anúncios existentes com níveis N1, N3, N7
// Atualiza diretamente no banco de dados via API

import fs from 'fs';

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
async function updateAdsWithLevels() {
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
    
    // Criar arquivo de atualizações
    const updates = [];
    let totalUpdated = 0;
    
    for (const categoria of CATEGORIES) {
      const anunciosCategoria = anunciosPorCategoria[categoria];
      if (anunciosCategoria.length === 0) continue;
      
      console.log(`\n📂 Processando categoria: ${categoria.toUpperCase()}`);
      
      // Distribuir níveis
      let index = 0;
      
      // N1 - Primeiros 29 anúncios
      for (let i = 0; i < Math.min(LEVELS_CONFIG.N1.count, anunciosCategoria.length) && index < anunciosCategoria.length; i++) {
        const anuncio = anunciosCategoria[index];
        const update = createUpdateData(anuncio, 'N1', LEVELS_CONFIG.N1);
        updates.push(update);
        index++;
        totalUpdated++;
      }
      
      // N3 - Próximos 15 anúncios
      for (let i = 0; i < Math.min(LEVELS_CONFIG.N3.count, anunciosCategoria.length - index) && index < anunciosCategoria.length; i++) {
        const anuncio = anunciosCategoria[index];
        const update = createUpdateData(anuncio, 'N3', LEVELS_CONFIG.N3);
        updates.push(update);
        index++;
        totalUpdated++;
      }
      
      // N7 - Resto dos anúncios
      while (index < anunciosCategoria.length) {
        const anuncio = anunciosCategoria[index];
        const update = createUpdateData(anuncio, 'N7', LEVELS_CONFIG.N7);
        updates.push(update);
        index++;
        totalUpdated++;
      }
      
      console.log(`  ✅ ${anunciosCategoria.length} anúncios processados para ${categoria}`);
    }
    
    // Salvar arquivo de atualizações
    const updatesFile = 'anuncios-updates.json';
    fs.writeFileSync(updatesFile, JSON.stringify(updates, null, 2));
    console.log(`\n💾 Arquivo de atualizações salvo: ${updatesFile}`);
    
    console.log(`\n🎉 Processamento concluído!`);
    console.log(`📊 Total de anúncios processados: ${totalUpdated}`);
    
    // Estatísticas
    const niveisCount = { N1: 0, N3: 0, N7: 0 };
    updates.forEach(update => {
      niveisCount[update.nivel]++;
    });
    
    console.log('\n📊 Distribuição por nível:');
    Object.entries(niveisCount).forEach(([nivel, count]) => {
      console.log(`  ${nivel}: ${count} anúncios`);
    });
    
    // Verificar stories
    const storiesCount = updates.filter(update => update.foto_stories).length;
    console.log(`\n📸 Anúncios com fotos para stories: ${storiesCount}/${updates.length}`);
    
    if (storiesCount === updates.length) {
      console.log('✅ Todos os anúncios têm fotos para stories!');
    } else {
      console.log('⚠️ Alguns anúncios não têm fotos para stories');
    }
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Verifique o arquivo anuncios-updates.json');
    console.log('2. Use um script de banco de dados para aplicar as atualizações');
    console.log('3. Ou implemente um endpoint PUT/PATCH na API para atualizar os anúncios');
    
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
  }
}

// Função para criar dados de atualização
function createUpdateData(anuncio, nivel, config) {
  // Calcular novo preço baseado no nível
  const precoAtual = parseInt(anuncio.preco || anuncio.price || '300');
  const novoPreco = Math.floor(precoAtual * config.priceMultiplier);
  
  return {
    id: anuncio.id || anuncio._id,
    nome: anuncio.nome,
    categoria: anuncio.categoria,
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
    foto_stories: anuncio.foto_stories || anuncio.profileImage,
    updatedAt: new Date().toISOString()
  };
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  updateAdsWithLevels();
}

export { updateAdsWithLevels };












