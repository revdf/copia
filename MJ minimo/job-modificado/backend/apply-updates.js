// Script para aplicar as atualizações de níveis aos anúncios
// Simula a atualização e mostra o resultado

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para aplicar atualizações
async function applyUpdates() {
  try {
    console.log('🚀 Aplicando atualizações de níveis aos anúncios...');
    
    // Carregar atualizações
    if (!fs.existsSync('anuncios-updates.json')) {
      console.error('❌ Arquivo anuncios-updates.json não encontrado!');
      return;
    }
    
    const updates = JSON.parse(fs.readFileSync('anuncios-updates.json', 'utf8'));
    console.log(`📊 ${updates.length} atualizações carregadas`);
    
    // Buscar anúncios existentes
    console.log('📡 Buscando anúncios existentes...');
    const response = await makeRequest('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    
    console.log(`📊 ${anuncios.length} anúncios encontrados no banco`);
    
    // Aplicar atualizações (simulação)
    const updatedAnuncios = anuncios.map(anuncio => {
      const update = updates.find(u => u.nome === anuncio.nome && u.categoria === anuncio.categoria);
      if (update) {
        return {
          ...anuncio,
          nivel: update.nivel,
          level: update.level,
          nivel_nome: update.nivel_nome,
          level_name: update.level_name,
          destaque: update.destaque,
          premium: update.premium,
          preco: update.preco,
          price: update.price,
          preco_hora: update.preco_hora,
          price_per_hour: update.price_per_hour,
          preco_30min: update.preco_30min,
          preco_45min: update.preco_45min,
          preco_1h: update.preco_1h
        };
      }
      return anuncio;
    });
    
    // Salvar resultado
    fs.writeFileSync('anuncios-updated.json', JSON.stringify(updatedAnuncios, null, 2));
    console.log('💾 Resultado salvo em anuncios-updated.json');
    
    // Estatísticas
    const niveisCount = { N1: 0, N3: 0, N7: 0, 'sem nivel': 0 };
    updatedAnuncios.forEach(anuncio => {
      if (anuncio.nivel) {
        niveisCount[anuncio.nivel] = (niveisCount[anuncio.nivel] || 0) + 1;
      } else {
        niveisCount['sem nivel']++;
      }
    });
    
    console.log('\n📊 Distribuição por nível após atualização:');
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
    
    // Mostrar alguns exemplos
    console.log('\n📋 Exemplos de anúncios atualizados:');
    const exemplos = updatedAnuncios.filter(ad => ad.nivel).slice(0, 5);
    exemplos.forEach(anuncio => {
      console.log(`  ${anuncio.nome} (${anuncio.categoria}) - ${anuncio.nivel} - R$ ${anuncio.preco} - Destaque: ${anuncio.destaque}`);
    });
    
    console.log('\n🎉 Atualizações aplicadas com sucesso!');
    console.log('📋 Para aplicar no banco real, você precisa:');
    console.log('1. Implementar endpoint PUT/PATCH na API');
    console.log('2. Ou usar um script de banco de dados direto');
    console.log('3. Ou atualizar manualmente via interface administrativa');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar atualizações:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  applyUpdates();
}

export { applyUpdates };












