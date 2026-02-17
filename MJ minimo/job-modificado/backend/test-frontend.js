// Script para testar se as mudanças estão funcionando no frontend
// Verifica se os níveis N1, N3, N7 estão aparecendo corretamente

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para testar frontend
async function testFrontend() {
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
    
    // 6. Mostrar exemplos
    console.log('\n📋 6. Exemplos de anúncios:');
    const exemplos = anuncios.slice(0, 5);
    exemplos.forEach(anuncio => {
      console.log(`  ${anuncio.nome} (${anuncio.categoria}) - Nível: ${anuncio.nivel || 'N/A'} - Destaque: ${anuncio.destaque} - Premium: ${anuncio.premium}`);
    });
    
    // 7. Verificar se frontend vai funcionar
    console.log('\n🌐 7. Verificando compatibilidade com frontend...');
    
    // Verificar se tem anúncios para stories
    const anunciosComStories = anuncios.filter(ad => ad.foto_stories);
    if (anunciosComStories.length > 0) {
      console.log('✅ Frontend terá fotos para stories');
    } else {
      console.log('❌ Frontend não terá fotos para stories');
    }
    
    // Verificar se tem anúncios em destaque
    if (destaqueCount > 0) {
      console.log('✅ Frontend terá anúncios em destaque');
    } else {
      console.log('❌ Frontend não terá anúncios em destaque');
    }
    
    // Verificar se tem anúncios premium
    if (premiumCount > 0) {
      console.log('✅ Frontend terá anúncios premium');
    } else {
      console.log('❌ Frontend não terá anúncios premium');
    }
    
    // 8. Recomendações
    console.log('\n💡 8. Recomendações:');
    
    if (niveisCount['sem nivel'] > 0) {
      console.log('⚠️ Ainda há anúncios sem nível - execute o script de atualização');
    }
    
    if (destaqueCount === 0) {
      console.log('⚠️ Nenhum anúncio em destaque - verifique se os níveis N1/N3 foram aplicados');
    }
    
    if (premiumCount === 0) {
      console.log('⚠️ Nenhum anúncio premium - verifique se o nível N1 foi aplicado');
    }
    
    // 9. Status final
    console.log('\n🎯 9. Status final:');
    
    const temNiveis = niveisCount.N1 > 0 || niveisCount.N3 > 0 || niveisCount.N7 > 0;
    const temStories = storiesCount === anuncios.length;
    const temDestaque = destaqueCount > 0;
    const temPremium = premiumCount > 0;
    
    console.log(`Níveis implementados: ${temNiveis ? '✅' : '❌'}`);
    console.log(`Fotos para stories: ${temStories ? '✅' : '❌'}`);
    console.log(`Anúncios em destaque: ${temDestaque ? '✅' : '❌'}`);
    console.log(`Anúncios premium: ${temPremium ? '✅' : '❌'}`);
    
    if (temNiveis && temStories && temDestaque && temPremium) {
      console.log('\n🎉 SUCESSO! O frontend deve estar funcionando corretamente!');
      console.log('🌐 Acesse http://127.0.0.1:8080/A_02__premium.html para ver os resultados');
    } else {
      console.log('\n⚠️ Ainda há problemas - verifique as recomendações acima');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testFrontend();
}

export { testFrontend };












