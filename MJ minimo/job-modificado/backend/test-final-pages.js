// Script para testar o estado final de todas as páginas

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para testar todas as páginas
async function testFinalPages() {
  try {
    console.log('🧪 Testando estado final de todas as páginas...');
    
    // 1. Verificar API atual
    const response = await makeRequest('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    
    console.log(`📊 Total de anúncios na API: ${anuncios.length}`);
    
    // 2. Verificar níveis por categoria
    const categorias = ['massagista', 'trans', 'homem'];
    
    console.log('\n📊 2. Verificando níveis por categoria:');
    categorias.forEach(categoria => {
      const anunciosCategoria = anuncios.filter(ad => 
        ad.categoria === categoria || ad.category === categoria
      );
      
      const n1Count = anunciosCategoria.filter(ad => ad.nivel === 'N1').length;
      const n3Count = anunciosCategoria.filter(ad => ad.nivel === 'N3').length;
      const n7Count = anunciosCategoria.filter(ad => ad.nivel === 'N7').length;
      const semNivel = anunciosCategoria.filter(ad => !ad.nivel).length;
      
      console.log(`\n📂 ${categoria}:`);
      console.log(`  Total: ${anunciosCategoria.length}`);
      console.log(`  N1: ${n1Count}`);
      console.log(`  N3: ${n3Count}`);
      console.log(`  N7: ${n7Count}`);
      console.log(`  Sem nível: ${semNivel}`);
    });
    
    // 3. Verificar stories
    console.log('\n📸 3. Verificando fotos para stories:');
    const storiesCount = anuncios.filter(ad => ad.foto_stories).length;
    console.log(`Anúncios com fotos para stories: ${storiesCount}/${anuncios.length}`);
    
    // 4. Testar filtros de cada página
    console.log('\n🔍 4. Testando filtros de cada página:');
    
    const paginas = [
      { 
        nome: 'Premium', 
        filtro: ad => ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7' || ad.destaque === true || ad.premium === true 
      },
      { 
        nome: 'Massagistas', 
        filtro: ad => (ad.categoria === 'massagista' || ad.category === 'massagista') && (ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7' || ad.destaque === true || ad.premium === true) 
      },
      { 
        nome: 'Trans', 
        filtro: ad => (ad.categoria === 'trans' || ad.category === 'trans') && (ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7' || ad.destaque === true || ad.premium === true) 
      },
      { 
        nome: 'Homens', 
        filtro: ad => (ad.categoria === 'homem' || ad.category === 'homem') && (ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7' || ad.destaque === true || ad.premium === true) 
      },
    ];
    
    paginas.forEach(pagina => {
      const anunciosFiltrados = anuncios.filter(pagina.filtro);
      const anunciosComStories = anunciosFiltrados.filter(ad => ad.foto_stories);
      
      const n1Count = anunciosFiltrados.filter(ad => ad.nivel === 'N1').length;
      const n3Count = anunciosFiltrados.filter(ad => ad.nivel === 'N3').length;
      const n7Count = anunciosFiltrados.filter(ad => ad.nivel === 'N7').length;
      
      console.log(`\n📄 ${pagina.nome}:`);
      console.log(`  Total filtrados: ${anunciosFiltrados.length}`);
      console.log(`  N1: ${n1Count}`);
      console.log(`  N3: ${n3Count}`);
      console.log(`  N7: ${n7Count}`);
      console.log(`  Com stories: ${anunciosComStories.length}`);
    });
    
    // 5. Verificar URLs das fotos
    console.log('\n🔗 5. Verificando URLs das fotos:');
    const anunciosComStories = anuncios.filter(ad => ad.foto_stories);
    if (anunciosComStories.length > 0) {
      const exemplo = anunciosComStories[0];
      const urlExemplo = `https://firebasestorage.googleapis.com/v0/b/copia-do-job.firebasestorage.app/o/${encodeURIComponent(exemplo.foto_stories)}?alt=media`;
      console.log(`Exemplo de URL: ${urlExemplo}`);
      console.log(`Nome da foto: ${exemplo.foto_stories}`);
    }
    
    // 6. Status final
    console.log('\n🎯 6. Status final:');
    const temNiveis = anuncios.some(ad => ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7');
    const temStories = storiesCount === anuncios.length;
    const temDestaque = anuncios.some(ad => ad.destaque === true);
    const temPremium = anuncios.some(ad => ad.premium === true);
    
    console.log(`Níveis implementados: ${temNiveis ? '✅' : '❌'}`);
    console.log(`Fotos para stories: ${temStories ? '✅' : '❌'}`);
    console.log(`Anúncios em destaque: ${temDestaque ? '✅' : '❌'}`);
    console.log(`Anúncios premium: ${temPremium ? '✅' : '❌'}`);
    
    // 7. URLs para testar
    console.log('\n🌐 7. URLs para testar:');
    console.log('Premium: http://127.0.0.1:8080/A_02__premium.html');
    console.log('Massagistas: http://127.0.0.1:8080/A_03__massagistas.html');
    console.log('Trans: http://127.0.0.1:8080/A_04__trans.html');
    console.log('Homens: http://127.0.0.1:8080/A_05__homens.html');
    
    // 8. Instruções
    console.log('\n📋 8. Instruções:');
    console.log('1. Acesse cada URL acima');
    console.log('2. Recarregue cada página (F5) para limpar o cache');
    console.log('3. Verifique se aparecem:');
    console.log('   - Anúncios com níveis N1, N3, N7');
    console.log('   - Stories com fotos reais');
    console.log('   - Anúncios em destaque e premium');
    
    if (temNiveis && temStories && temDestaque && temPremium) {
      console.log('\n🎉 SUCESSO! Todas as páginas devem estar funcionando!');
    } else {
      console.log('\n⚠️ Ainda há problemas - verifique os logs acima');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testFinalPages();
}

export { testFinalPages };












