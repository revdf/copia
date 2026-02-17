// Script para testar se as mudanças estão funcionando no frontend
// Verifica se os dados estão sendo carregados corretamente

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para testar frontend
async function testFrontendFinal() {
  try {
    console.log('🧪 Testando se as mudanças estão funcionando no frontend...');
    
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
    
    // 3. Verificar stories
    console.log('\n📸 3. Verificando fotos para stories...');
    const storiesCount = anuncios.filter(ad => ad.foto_stories).length;
    console.log(`Anúncios com fotos para stories: ${storiesCount}/${anuncios.length}`);
    
    // 4. Verificar destaque
    console.log('\n⭐ 4. Verificando anúncios em destaque...');
    const destaqueCount = anuncios.filter(ad => ad.destaque).length;
    console.log(`Anúncios em destaque: ${destaqueCount}`);
    
    // 5. Verificar premium
    console.log('\n💎 5. Verificando anúncios premium...');
    const premiumCount = anuncios.filter(ad => ad.premium).length;
    console.log(`Anúncios premium: ${premiumCount}`);
    
    // 6. Testar filtro do frontend
    console.log('\n🔍 6. Testando filtro do frontend...');
    const anunciosFiltrados = anuncios.filter(ad => 
      ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7' || 
      ad.destaque === true || ad.premium === true
    );
    console.log(`Anúncios que aparecerão no frontend: ${anunciosFiltrados.length}`);
    
    // 7. Verificar stories para frontend
    console.log('\n📱 7. Verificando stories para frontend...');
    const anunciosComStories = anunciosFiltrados.filter(ad => ad.foto_stories);
    console.log(`Stories que aparecerão no frontend: ${anunciosComStories.length}`);
    
    // 8. Mostrar exemplos
    console.log('\n📋 8. Exemplos de anúncios que aparecerão:');
    const exemplos = anunciosFiltrados.slice(0, 5);
    exemplos.forEach(anuncio => {
      console.log(`  ${anuncio.nome} (${anuncio.categoria}) - Nível: ${anuncio.nivel || 'N/A'} - Destaque: ${anuncio.destaque} - Premium: ${anuncio.premium} - Stories: ${anuncio.foto_stories ? 'Sim' : 'Não'}`);
    });
    
    // 9. Status final
    console.log('\n🎯 9. Status final:');
    const temNiveis = niveisCount.N1 > 0 || niveisCount.N3 > 0 || niveisCount.N7 > 0;
    const temStories = storiesCount === anuncios.length;
    const temDestaque = destaqueCount > 0;
    const temPremium = premiumCount > 0;
    const temFiltro = anunciosFiltrados.length > 0;
    const temStoriesFrontend = anunciosComStories.length > 0;
    
    console.log(`Níveis implementados: ${temNiveis ? '✅' : '❌'}`);
    console.log(`Fotos para stories: ${temStories ? '✅' : '❌'}`);
    console.log(`Anúncios em destaque: ${temDestaque ? '✅' : '❌'}`);
    console.log(`Anúncios premium: ${temPremium ? '✅' : '❌'}`);
    console.log(`Filtro do frontend: ${temFiltro ? '✅' : '❌'}`);
    console.log(`Stories no frontend: ${temStoriesFrontend ? '✅' : '❌'}`);
    
    if (temNiveis && temStories && temDestaque && temPremium && temFiltro && temStoriesFrontend) {
      console.log('\n🎉 SUCESSO! O frontend deve estar funcionando perfeitamente!');
      console.log('🌐 Acesse http://127.0.0.1:8080/A_02__premium.html para ver os resultados');
      console.log(`📱 Você verá ${anunciosFiltrados.length} anúncios e ${anunciosComStories.length} stories!`);
    } else {
      console.log('\n⚠️ Ainda há problemas - verifique os logs acima');
    }
    
    // 10. Instruções finais
    console.log('\n📋 10. Instruções finais:');
    console.log('1. Acesse: http://127.0.0.1:8080/A_02__premium.html');
    console.log('2. Recarregue a página (F5) para limpar o cache');
    console.log('3. Verifique se aparecem muitos anúncios e stories');
    console.log('4. Verifique se os níveis N1, N3, N7 estão funcionando');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testFrontendFinal();
}

export { testFrontendFinal };












