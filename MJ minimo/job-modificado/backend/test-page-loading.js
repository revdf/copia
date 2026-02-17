// Script para testar se a página está carregando

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para testar o carregamento da página
async function testPageLoading() {
  try {
    console.log('🔍 Testando carregamento da página...');
    
    // 1. Verificar se a API está funcionando
    console.log('\n📡 1. Verificando API...');
    const response = await makeRequest('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    console.log(`✅ API funcionando: ${anuncios.length} anúncios`);
    
    // 2. Verificar se há anúncios com stories
    const anunciosComStories = anuncios.filter(ad => ad.foto_stories);
    console.log(`✅ Anúncios com stories: ${anunciosComStories.length}`);
    
    // 3. Verificar se há anúncios com níveis
    const anunciosComNiveis = anuncios.filter(ad => ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7');
    console.log(`✅ Anúncios com níveis: ${anunciosComNiveis.length}`);
    
    // 4. Verificar se há anúncios premium
    const anunciosPremium = anuncios.filter(ad => 
      ad.nivel === 'N1' || ad.nivel === 'N3' || ad.nivel === 'N7' || 
      ad.destaque === true || ad.premium === true
    );
    console.log(`✅ Anúncios premium: ${anunciosPremium.length}`);
    
    // 5. Gerar HTML de teste simples
    console.log('\n📄 2. Gerando HTML de teste simples...');
    const htmlTest = `
<!DOCTYPE html>
<html>
<head>
    <title>Teste Simples - Página Premium</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        
        .info-box {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .success {
            border-left: 4px solid #28a745;
        }
        
        .error {
            border-left: 4px solid #dc3545;
        }
        
        .btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn:hover {
            background: #c82333;
        }
        
        .stories-simple {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding: 10px 0;
        }
        
        .story-simple {
            flex: 0 0 80px;
            text-align: center;
        }
        
        .story-ring {
            width: 60px;
            height: 60px;
            border: 3px solid #dc3545;
            border-radius: 50%;
            overflow: hidden;
            margin: 0 auto;
        }
        
        .story-thumb {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .story-name {
            font-size: 12px;
            margin-top: 5px;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Teste Simples - Página Premium</h1>
        
        <div class="info-box success">
            <h3>✅ API Funcionando</h3>
            <p>Total de anúncios: <strong>${anuncios.length}</strong></p>
            <p>Anúncios com stories: <strong>${anunciosComStories.length}</strong></p>
            <p>Anúncios com níveis: <strong>${anunciosComNiveis.length}</strong></p>
            <p>Anúncios premium: <strong>${anunciosPremium.length}</strong></p>
        </div>
        
        <div class="info-box">
            <h3>📊 Distribuição por Nível</h3>
            <p>N1 (Premium VIP): <strong>${anuncios.filter(ad => ad.nivel === 'N1').length}</strong></p>
            <p>N3 (Destaque): <strong>${anuncios.filter(ad => ad.nivel === 'N3').length}</strong></p>
            <p>N7 (Padrão): <strong>${anuncios.filter(ad => ad.nivel === 'N7').length}</strong></p>
        </div>
        
        <div class="info-box">
            <h3>📸 Stories Simples</h3>
            <div class="stories-simple">
                ${anunciosComStories.slice(0, 10).map(ad => `
                    <div class="story-simple">
                        <div class="story-ring">
                            <img src="https://firebasestorage.googleapis.com/v0/b/copia-do-job.firebasestorage.app/o/${encodeURIComponent(ad.foto_stories)}?alt=media" 
                                 class="story-thumb" alt="${ad.nome}" 
                                 onerror="this.src='https://via.placeholder.com/60x60/FFB6C1/FFFFFF?text=Erro'">
                        </div>
                        <div class="story-name">${ad.nome.split(' ')[0]}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="info-box">
            <h3>🔗 Links para Testar</h3>
            <a href="http://127.0.0.1:8080/A_02__premium.html" class="btn">Página Premium Real</a>
            <a href="file:///Users/troll/Desktop/copia%20do%20job/backend/test-stories-carousel.html" class="btn">Teste Carrossel</a>
        </div>
        
        <div class="info-box">
            <h3>🛠️ Instruções de Debug</h3>
            <p>1. <strong>Se a página está branca:</strong> Abra o Console do navegador (F12) e verifique erros JavaScript</p>
            <p>2. <strong>Se não carrega:</strong> Verifique se o servidor está rodando na porta 5001</p>
            <p>3. <strong>Se não aparecem stories:</strong> Verifique se há anúncios com foto_stories</p>
            <p>4. <strong>Se não aparecem níveis:</strong> Verifique se há anúncios com níveis N1, N3, N7</p>
        </div>
    </div>
    
    <script>
        console.log('🔍 Teste simples carregado');
        console.log('📊 Dados da API:', ${JSON.stringify(anuncios.slice(0, 3), null, 2)});
        
        // Testar se a API está acessível
        fetch('http://localhost:5001/api/anuncios')
            .then(response => response.json())
            .then(data => {
                console.log('✅ API acessível:', data.length, 'anúncios');
            })
            .catch(error => {
                console.error('❌ Erro na API:', error);
            });
    </script>
</body>
</html>`;
    
    fs.writeFileSync('/Users/troll/Desktop/copia do job/backend/test-page-simple.html', htmlTest);
    console.log('✅ HTML de teste simples criado: test-page-simple.html');
    console.log('🌐 Abra: file:///Users/troll/Desktop/copia%20do%20job/backend/test-page-simple.html');
    
    // 6. Status final
    console.log('\n🎯 3. Status da página:');
    console.log(`API funcionando: ${anuncios.length > 0 ? '✅' : '❌'}`);
    console.log(`Stories disponíveis: ${anunciosComStories.length > 0 ? '✅' : '❌'}`);
    console.log(`Níveis aplicados: ${anunciosComNiveis.length > 0 ? '✅' : '❌'}`);
    console.log(`Anúncios premium: ${anunciosPremium.length > 0 ? '✅' : '❌'}`);
    
    if (anuncios.length > 0 && anunciosComStories.length > 0 && anunciosPremium.length > 0) {
      console.log('\n✅ Dados estão corretos! O problema pode ser JavaScript na página.');
      console.log('📱 Abra o Console do navegador (F12) para ver erros JavaScript');
    } else {
      console.log('\n❌ Há problemas com os dados da API');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testPageLoading();
}

export { testPageLoading };












