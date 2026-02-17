// Script para testar se as fotos dos stories estão carregando

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para testar stories
async function testStories() {
  try {
    console.log('📸 Testando fotos dos stories...');
    
    // 1. Buscar anúncios com stories
    const response = await makeRequest('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    
    const anunciosComStories = anuncios.filter(ad => ad.foto_stories);
    console.log(`📊 Anúncios com stories: ${anunciosComStories.length}`);
    
    // 2. Testar algumas URLs
    console.log('\n🔗 Testando URLs das fotos:');
    const testUrls = anunciosComStories.slice(0, 5);
    
    for (const anuncio of testUrls) {
      const url = `https://firebasestorage.googleapis.com/v0/b/copia-do-job.firebasestorage.app/o/${encodeURIComponent(anuncio.foto_stories)}?alt=media`;
      
      try {
        const response = await makeRequest(url, { method: 'HEAD' });
        if (response.ok) {
          console.log(`✅ ${anuncio.nome}: ${anuncio.foto_stories} - OK`);
        } else {
          console.log(`❌ ${anuncio.nome}: ${anuncio.foto_stories} - ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${anuncio.nome}: ${anuncio.foto_stories} - ${error.message}`);
      }
    }
    
    // 3. Verificar se há problemas de encoding
    console.log('\n🔤 Verificando encoding das URLs:');
    testUrls.forEach(anuncio => {
      const url = `https://firebasestorage.googleapis.com/v0/b/copia-do-job.firebasestorage.app/o/${encodeURIComponent(anuncio.foto_stories)}?alt=media`;
      console.log(`Nome: ${anuncio.foto_stories}`);
      console.log(`URL: ${url}`);
      console.log('---');
    });
    
    // 4. Verificar se há fotos com caracteres especiais
    console.log('\n🔍 Verificando fotos com caracteres especiais:');
    const fotosEspeciais = anunciosComStories.filter(ad => 
      ad.foto_stories.includes(' ') || 
      ad.foto_stories.includes('(') || 
      ad.foto_stories.includes(')')
    );
    
    console.log(`Fotos com caracteres especiais: ${fotosEspeciais.length}`);
    fotosEspeciais.slice(0, 3).forEach(anuncio => {
      console.log(`- ${anuncio.foto_stories}`);
    });
    
    // 5. Gerar HTML de teste
    console.log('\n📄 Gerando HTML de teste para stories...');
    const htmlTest = `
<!DOCTYPE html>
<html>
<head>
    <title>Teste Stories</title>
    <style>
        .story-item {
            display: inline-block;
            margin: 10px;
            text-align: center;
        }
        .story-thumb {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
        }
        .story-ring {
            border: 2px solid #dc3545;
            border-radius: 50%;
            padding: 2px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <h1>Teste de Stories</h1>
    <div id="stories-wrapper"></div>
    
    <script>
        const anuncios = ${JSON.stringify(anunciosComStories.slice(0, 10), null, 2)};
        
        function initStories() {
            const storiesWrapper = document.getElementById('stories-wrapper');
            
            anuncios.forEach(ad => {
                const storyItem = document.createElement('div');
                storyItem.className = 'text-center story-item';
                
                const storyImage = ad.foto_stories ? 
                    \`https://firebasestorage.googleapis.com/v0/b/copia-do-job.firebasestorage.app/o/\${encodeURIComponent(ad.foto_stories)}?alt=media\` : 
                    ad.image;
                
                storyItem.innerHTML = \`
                    <div class="rounded-circle overflow-hidden story-ring border border-danger mx-auto">
                        <img src="\${storyImage}" class="story-thumb img-fluid" alt="\${ad.nome}" 
                             onerror="this.src='\${ad.image}'">
                    </div>
                    <div class="story-name mt-2">\${ad.nome.split(' ')[0]}</div>
                \`;
                storiesWrapper.appendChild(storyItem);
            });
        }
        
        initStories();
    </script>
</body>
</html>`;
    
    fs.writeFileSync('/Users/troll/Desktop/copia do job/backend/test-stories.html', htmlTest);
    console.log('✅ HTML de teste criado: test-stories.html');
    console.log('🌐 Abra: file:///Users/troll/Desktop/copia%20do%20job/backend/test-stories.html');
    
    // 6. Status final
    console.log('\n🎯 Status dos stories:');
    console.log(`Total de anúncios: ${anuncios.length}`);
    console.log(`Com stories: ${anunciosComStories.length}`);
    console.log(`Percentual: ${((anunciosComStories.length / anuncios.length) * 100).toFixed(1)}%`);
    
    if (anunciosComStories.length === anuncios.length) {
      console.log('✅ Todos os anúncios têm fotos para stories!');
    } else {
      console.log('⚠️ Alguns anúncios não têm fotos para stories');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testStories();
}

export { testStories };












