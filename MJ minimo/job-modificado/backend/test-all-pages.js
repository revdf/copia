// Script para testar todas as páginas e verificar se as mudanças estão funcionando

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para testar todas as páginas
async function testAllPages() {
  try {
    console.log('🧪 Testando todas as páginas...');
    
    // 1. Verificar API atual
    console.log('\n📡 1. Verificando API atual...');
    const response = await makeRequest('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    
    console.log(`📊 Total de anúncios na API: ${anuncios.length}`);
    
    // 2. Verificar níveis
    console.log('\n📊 2. Verificando níveis...');
    const niveisCount = { N1: 0, N3: 0, N7: 0, 'sem nivel': 0 };
    anuncios.forEach(anuncio => {
      if (anuncio.nivel) {
        niveisCount[anuncio.nivel] = (niveisCount[anuncio.nivel] || 0) + 1;
      } else {
        niveisCount['sem nivel']++;
      }
    });
    
    console.log('Distribuição por nível:');
    Object.entries(niveisCount).forEach(([nivel, count]) => {
      console.log(`  ${nivel}: ${count} anúncios`);
    });
    
    // 3. Verificar por categoria
    console.log('\n📂 3. Verificando por categoria...');
    const categorias = ['massagista', 'trans', 'homem'];
    
    categorias.forEach(categoria => {
      const anunciosCategoria = anuncios.filter(ad => 
        ad.categoria === categoria || ad.category === categoria
      );
      
      const anunciosComNiveis = anunciosCategoria.filter(ad => 
        ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7' || 
        ad.destaque === true || ad.premium === true
      );
      
      console.log(`  ${categoria}: ${anunciosCategoria.length} total, ${anunciosComNiveis.length} com níveis`);
    });
    
    // 4. Verificar stories
    console.log('\n📸 4. Verificando fotos para stories...');
    const storiesCount = anuncios.filter(ad => ad.foto_stories).length;
    console.log(`Anúncios com fotos para stories: ${storiesCount}/${anuncios.length}`);
    
    // 5. Verificar destaque e premium
    console.log('\n⭐ 5. Verificando destaque e premium...');
    const destaqueCount = anuncios.filter(ad => ad.destaque).length;
    const premiumCount = anuncios.filter(ad => ad.premium).length;
    console.log(`Anúncios em destaque: ${destaqueCount}`);
    console.log(`Anúncios premium: ${premiumCount}`);
    
    // 6. Testar filtros de cada página
    console.log('\n🔍 6. Testando filtros de cada página...');
    
    const paginas = [
      { nome: 'Premium', filtro: ad => ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7' || ad.destaque === true || ad.premium === true },
      { nome: 'Massagistas', filtro: ad => (ad.categoria === 'massagista' || ad.category === 'massagista') && (ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7' || ad.destaque === true || ad.premium === true) },
      { nome: 'Trans', filtro: ad => (ad.categoria === 'trans' || ad.category === 'trans') && (ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7' || ad.destaque === true || ad.premium === true) },
      { nome: 'Homens', filtro: ad => (ad.categoria === 'homem' || ad.category === 'homem') && (ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7' || ad.destaque === true || ad.premium === true) },
    ];
    
    paginas.forEach(pagina => {
      const anunciosFiltrados = anuncios.filter(pagina.filtro);
      const anunciosComStories = anunciosFiltrados.filter(ad => ad.foto_stories);
      console.log(`  ${pagina.nome}: ${anunciosFiltrados.length} anúncios, ${anunciosComStories.length} com stories`);
    });
    
    // 7. Status final
    console.log('\n🎯 7. Status final:');
    const temNiveis = niveisCount.N1 > 0 || niveisCount.N3 > 0 || niveisCount.N7 > 0;
    const temStories = storiesCount === anuncios.length;
    const temDestaque = destaqueCount > 0;
    const temPremium = premiumCount > 0;
    
    console.log(`Níveis implementados: ${temNiveis ? '✅' : '❌'}`);
    console.log(`Fotos para stories: ${temStories ? '✅' : '❌'}`);
    console.log(`Anúncios em destaque: ${temDestaque ? '✅' : '❌'}`);
    console.log(`Anúncios premium: ${temPremium ? '✅' : '❌'}`);
    
    // 8. URLs para testar
    console.log('\n🌐 8. URLs para testar:');
    console.log('Premium: http://127.0.0.1:8080/A_02__premium.html');
    console.log('Massagistas: http://127.0.0.1:8080/A_03__massagistas.html');
    console.log('Trans: http://127.0.0.1:8080/A_04__trans.html');
    console.log('Homens: http://127.0.0.1:8080/A_05__homens.html');
    
    if (temNiveis && temStories && temDestaque && temPremium) {
      console.log('\n🎉 SUCESSO! Todas as páginas devem estar funcionando!');
      console.log('📱 Recarregue cada página (F5) para ver as mudanças');
    } else {
      console.log('\n⚠️ Ainda há problemas - verifique os logs acima');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testAllPages();
}

export { testAllPages };












