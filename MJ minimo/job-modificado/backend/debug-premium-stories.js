// Script para debugar especificamente os stories da página premium

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para debugar stories da página premium
async function debugPremiumStories() {
  try {
    console.log('🔍 Debugando stories da página premium...');
    
    // 1. Buscar anúncios da API
    const response = await makeRequest('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    
    console.log(`📊 Total de anúncios na API: ${anuncios.length}`);
    
    // 2. Aplicar o mesmo filtro da página premium
    const advertisements = anuncios.filter(ad => 
      ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7' || 
      ad.destaque === true || ad.premium === true
    );
    
    console.log(`📊 Anúncios filtrados para premium: ${advertisements.length}`);
    
    // 3. Verificar anúncios com stories
    const anunciosComStories = advertisements.filter(ad => ad.foto_stories);
    console.log(`📸 Anúncios com foto_stories: ${anunciosComStories.length}`);
    
    // 4. Verificar alguns exemplos
    console.log('\n🔍 Exemplos de anúncios com stories:');
    anunciosComStories.slice(0, 5).forEach((ad, index) => {
      console.log(`\n${index + 1}. ${ad.nome}:`);
      console.log(`   Nível: ${ad.nivel}`);
      console.log(`   Destaque: ${ad.destaque}`);
      console.log(`   Premium: ${ad.premium}`);
      console.log(`   Foto stories: ${ad.foto_stories}`);
      console.log(`   URL: https://firebasestorage.googleapis.com/v0/b/copia-do-job.firebasestorage.app/o/${encodeURIComponent(ad.foto_stories)}?alt=media`);
    });
    
    // 5. Verificar se há problemas com o campo foto_stories
    console.log('\n🔍 Verificando campo foto_stories:');
    const semFotoStories = advertisements.filter(ad => !ad.foto_stories);
    console.log(`Anúncios sem foto_stories: ${semFotoStories.length}`);
    
    if (semFotoStories.length > 0) {
      console.log('Exemplos de anúncios sem foto_stories:');
      semFotoStories.slice(0, 3).forEach(ad => {
        console.log(`- ${ad.nome}: ${ad.foto_stories}`);
      });
    }
    
    // 6. Verificar se há problemas com o campo image
    console.log('\n🔍 Verificando campo image:');
    const semImage = advertisements.filter(ad => !ad.image);
    console.log(`Anúncios sem image: ${semImage.length}`);
    
    // 7. Gerar HTML de teste específico para premium
    console.log('\n📄 Gerando HTML de teste para premium...');
    const htmlTest = `
<!DOCTYPE html>
<html>
<head>
    <title>Teste Stories Premium</title>
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
        .story-name {
            font-size: 12px;
            margin-top: 5px;
        }
        .debug-info {
            background: #f8f9fa;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <h1>Teste de Stories Premium</h1>
    
    <div class="debug-info">
        <strong>Debug Info:</strong><br>
        Total de anúncios: ${anuncios.length}<br>
        Anúncios filtrados: ${advertisements.length}<br>
        Com foto_stories: ${anunciosComStories.length}<br>
        Sem foto_stories: ${semFotoStories.length}
    </div>
    
    <div id="stories-wrapper"></div>
    
    <script>
        // Simular PROFILES_DATA como na página premium
        const PROFILES_DATA = ${JSON.stringify(advertisements, null, 2)};
        
        function initStories() {
            const storiesWrapper = document.getElementById('stories-wrapper');
            
            console.log('PROFILES_DATA:', PROFILES_DATA);
            console.log('PROFILES_DATA length:', PROFILES_DATA.length);
            
            // Filtrar anúncios que têm foto_stories
            const anunciosComStories = PROFILES_DATA.filter(ad => ad.foto_stories);
            console.log('Anúncios com stories:', anunciosComStories.length);
            
            // Mostrar mais stories (até 20)
            anunciosComStories.slice(0, 20).forEach((ad, index) => {
                console.log(\`Story \${index + 1}: \${ad.nome} - \${ad.foto_stories}\`);
                
                const storyItem = document.createElement('div');
                storyItem.className = 'text-center story-item';
                
                // Usar foto_stories se disponível, senão usar foto principal
                const storyImage = ad.foto_stories ? 
                    \`https://firebasestorage.googleapis.com/v0/b/copia-do-job.firebasestorage.app/o/\${encodeURIComponent(ad.foto_stories)}?alt=media\` : 
                    ad.image;
                
                console.log(\`URL da imagem: \${storyImage}\`);
                
                storyItem.innerHTML = \`
                    <div class="rounded-circle overflow-hidden story-ring border border-danger mx-auto">
                        <img src="\${storyImage}" class="story-thumb img-fluid" alt="\${ad.nome}" 
                             onerror="console.error('Erro ao carregar imagem:', this.src); this.src='\${ad.image}'">
                    </div>
                    <div class="story-name mt-2">\${ad.nome.split(' ')[0]}</div>
                \`;
                storiesWrapper.appendChild(storyItem);
            });
        }
        
        // Executar quando a página carregar
        document.addEventListener('DOMContentLoaded', initStories);
    </script>
</body>
</html>`;
    
    fs.writeFileSync('/Users/troll/Desktop/copia do job/backend/debug-premium-stories.html', htmlTest);
    console.log('✅ HTML de debug criado: debug-premium-stories.html');
    console.log('🌐 Abra: file:///Users/troll/Desktop/copia%20do%20job/backend/debug-premium-stories.html');
    
    // 8. Verificar se há problemas com o JavaScript da página premium
    console.log('\n🔍 Verificando JavaScript da página premium...');
    const premiumHtml = fs.readFileSync('/Users/troll/Desktop/copia do job/frontend/src/A_02__premium.html', 'utf8');
    
    // Verificar se initStories é chamada
    const initStoriesCalled = premiumHtml.includes('initStories()');
    console.log(`initStories() é chamada: ${initStoriesCalled ? '✅' : '❌'}`);
    
    // Verificar se PROFILES_DATA é definida
    const profilesDataDefined = premiumHtml.includes('PROFILES_DATA');
    console.log(`PROFILES_DATA é definida: ${profilesDataDefined ? '✅' : '❌'}`);
    
    // Verificar se há erros de sintaxe
    const hasSyntaxErrors = premiumHtml.includes('undefined') || premiumHtml.includes('null');
    console.log(`Possíveis erros de sintaxe: ${hasSyntaxErrors ? '⚠️' : '✅'}`);
    
    // 9. Status final
    console.log('\n🎯 Status dos stories premium:');
    console.log(`Total de anúncios: ${anuncios.length}`);
    console.log(`Anúncios filtrados: ${advertisements.length}`);
    console.log(`Com foto_stories: ${anunciosComStories.length}`);
    console.log(`Percentual: ${((anunciosComStories.length / advertisements.length) * 100).toFixed(1)}%`);
    
    if (anunciosComStories.length > 0) {
      console.log('✅ Stories devem aparecer na página premium!');
      console.log('📱 Verifique o console do navegador para erros JavaScript');
    } else {
      console.log('❌ Nenhum anúncio tem foto_stories - problema no banco de dados');
    }
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  debugPremiumStories();
}

export { debugPremiumStories };












