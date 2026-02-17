// Script para testar a velocidade dos stories

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para testar a velocidade dos stories
async function testStoriesSpeed() {
  try {
    console.log('🎠 Testando velocidade dos stories...');
    
    // 1. Verificar se a API está funcionando
    console.log('\n📡 1. Verificando API...');
    const response = await makeRequest('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    console.log(`✅ API funcionando: ${anuncios.length} anúncios`);
    
    // 2. Verificar anúncios com stories
    const anunciosComStories = anuncios.filter(ad => ad.foto_stories);
    console.log(`✅ Anúncios com stories: ${anunciosComStories.length}`);
    
    // 3. Gerar HTML de teste com carrossel otimizado
    console.log('\n📄 2. Gerando HTML de teste otimizado...');
    const htmlTest = `
<!DOCTYPE html>
<html>
<head>
    <title>Teste Stories - Velocidade Otimizada</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
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
        
        .stories-container {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .stories-carousel-container {
            display: flex;
            overflow: hidden;
            width: 100%;
            position: relative;
            cursor: grab;
            user-select: none;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 10px;
        }
        
        .stories-track {
            display: flex;
            transition: transform 0.8s ease-in-out;
            will-change: transform;
        }
        
        .story-item {
            flex: 0 0 80px;
            margin: 0 8px;
            cursor: pointer;
            transition: transform 0.2s ease;
            text-align: center;
        }
        
        .story-item:hover {
            transform: scale(1.1);
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
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .controls {
            text-align: center;
            margin-top: 20px;
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
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .status {
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            border-radius: 5px;
            background: #e9ecef;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎠 Teste Stories - Velocidade Otimizada</h1>
        
        <div class="info-box success">
            <h3>✅ Configurações Otimizadas</h3>
            <p><strong>Velocidade:</strong> 3 segundos por item (mais lenta)</p>
            <p><strong>Transição:</strong> 0.8s ease-in-out (mais suave)</p>
            <p><strong>Movimento:</strong> Item por item (não em blocos)</p>
            <p><strong>Pausa no hover:</strong> Ativada</p>
            <p><strong>Arraste:</strong> Funcional</p>
        </div>
        
        <div class="stories-container">
            <h3>📸 Carrossel de Stories Otimizado</h3>
            <div class="stories-carousel-container" id="stories-wrapper">
                <!-- Stories serão carregados aqui -->
            </div>
            
            <div class="controls">
                <button class="btn" onclick="pauseCarousel()">⏸️ Pausar</button>
                <button class="btn btn-secondary" onclick="resumeCarousel()">▶️ Retomar</button>
                <button class="btn btn-secondary" onclick="resetCarousel()">🔄 Resetar</button>
            </div>
            
            <div class="status" id="status">
                Status: Carregando...
            </div>
        </div>
        
        <div class="info-box">
            <h3>🔧 Instruções de Teste</h3>
            <p>1. <strong>Velocidade:</strong> Observe se o carrossel move um item por vez a cada 3 segundos</p>
            <p>2. <strong>Suavidade:</strong> Verifique se a transição é suave (0.8s)</p>
            <p>3. <strong>Pausa:</strong> Passe o mouse sobre o carrossel para pausar</p>
            <p>4. <strong>Arraste:</strong> Clique e arraste para navegar manualmente</p>
            <p>5. <strong>Loop:</strong> Verifique se volta ao início após o último item</p>
        </div>
    </div>
    
    <script>
        let storiesCarousel = null;
        let currentIndex = 0;
        const itemWidth = 96; // 80px + 16px margin
        let animationId = null;
        let isPaused = false;
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;
        
        // Dados dos anúncios
        const anuncios = ${JSON.stringify(anunciosComStories.slice(0, 20), null, 2)};
        
        // Função para criar um story item
        function createStoryItem(ad, index) {
            const storyItem = document.createElement('div');
            storyItem.className = 'story-item';
            
            const storyImage = ad.foto_stories ? 
                \`https://firebasestorage.googleapis.com/v0/b/copia-do-job.firebasestorage.app/o/\${encodeURIComponent(ad.foto_stories)}?alt=media\` : 
                'https://via.placeholder.com/60x60/FFB6C1/FFFFFF?text=Erro';
            
            storyItem.innerHTML = \`
                <div class="story-ring">
                    <img src="\${storyImage}" class="story-thumb" alt="\${ad.nome}" 
                         onerror="this.src='https://via.placeholder.com/60x60/FFB6C1/FFFFFF?text=Erro'">
                </div>
                <div class="story-name">\${ad.nome.split(' ')[0]}</div>
            \`;
            
            return storyItem;
        }
        
        // Função para mover o carrossel (otimizada)
        function moveCarousel() {
            if (!isPaused && !isDragging) {
                currentIndex++;
                
                const track = document.querySelector('.stories-track');
                
                // Se chegou ao final, voltar ao início
                if (currentIndex >= anuncios.length) {
                    currentIndex = 0;
                    // Resetar posição sem transição
                    track.style.transition = 'none';
                    track.style.transform = 'translateX(0px)';
                    
                    // Forçar reflow
                    track.offsetHeight;
                    
                    // Restaurar transição
                    track.style.transition = 'transform 0.8s ease-in-out';
                } else {
                    // Mover para o próximo item com transição suave
                    track.style.transition = 'transform 0.8s ease-in-out';
                    const translateX = -currentIndex * itemWidth;
                    track.style.transform = \`translateX(\${translateX}px)\`;
                }
                
                // Atualizar status
                document.getElementById('status').textContent = \`Status: Item \${currentIndex + 1} de \${anuncios.length}\`;
            }
            
            // Agendar próxima movimentação (3 segundos)
            animationId = setTimeout(moveCarousel, 3000);
        }
        
        // Funções de controle
        function pauseCarousel() {
            isPaused = true;
            if (animationId) {
                clearTimeout(animationId);
            }
            document.getElementById('status').textContent = 'Status: Pausado';
        }
        
        function resumeCarousel() {
            isPaused = false;
            moveCarousel();
            document.getElementById('status').textContent = 'Status: Executando';
        }
        
        function resetCarousel() {
            currentIndex = 0;
            const track = document.querySelector('.stories-track');
            track.style.transition = 'none';
            track.style.transform = 'translateX(0px)';
            track.offsetHeight;
            track.style.transition = 'transform 0.8s ease-in-out';
            document.getElementById('status').textContent = 'Status: Resetado';
        }
        
        // Inicializar carrossel
        function initCarousel() {
            const storiesWrapper = document.getElementById('stories-wrapper');
            const track = document.createElement('div');
            track.className = 'stories-track';
            
            // Adicionar stories
            anuncios.forEach((ad, index) => {
                track.appendChild(createStoryItem(ad, index));
            });
            
            storiesWrapper.appendChild(track);
            
            // Eventos de mouse
            storiesWrapper.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.pageX - storiesWrapper.offsetLeft;
                scrollLeft = currentIndex * itemWidth;
                pauseCarousel();
                storiesWrapper.style.cursor = 'grabbing';
            });
            
            storiesWrapper.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    storiesWrapper.style.cursor = 'grab';
                    setTimeout(() => {
                        if (!isPaused) {
                            resumeCarousel();
                        }
                    }, 1000);
                }
            });
            
            storiesWrapper.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                
                const x = e.pageX - storiesWrapper.offsetLeft;
                const walk = (x - startX) * 2;
                const newScrollLeft = scrollLeft - walk;
                
                const newIndex = Math.round(newScrollLeft / itemWidth);
                if (newIndex >= 0 && newIndex < anuncios.length) {
                    currentIndex = newIndex;
                    track.style.transition = 'none';
                    track.style.transform = \`translateX(\${-currentIndex * itemWidth}px)\`;
                }
            });
            
            // Pausar quando hover
            storiesWrapper.addEventListener('mouseenter', pauseCarousel);
            storiesWrapper.addEventListener('mouseleave', () => {
                if (!isDragging) {
                    resumeCarousel();
                }
            });
            
            // Iniciar animação
            moveCarousel();
            
            document.getElementById('status').textContent = \`Status: Executando - \${anuncios.length} stories carregados\`;
        }
        
        // Inicializar quando a página carregar
        document.addEventListener('DOMContentLoaded', initCarousel);
        
        // Limpar animação quando a página for fechada
        window.addEventListener('beforeunload', () => {
            if (animationId) {
                clearTimeout(animationId);
            }
        });
    </script>
</body>
</html>`;
    
    fs.writeFileSync('/Users/troll/Desktop/copia do job/backend/test-stories-speed.html', htmlTest);
    console.log('✅ HTML de teste de velocidade criado: test-stories-speed.html');
    console.log('🌐 Abra: file:///Users/troll/Desktop/copia%20do%20job/backend/test-stories-speed.html');
    
    // Status final
    console.log('\n🎯 3. Configurações aplicadas:');
    console.log('✅ Velocidade: 3 segundos por item (mais lenta)');
    console.log('✅ Transição: 0.8s ease-in-out (mais suave)');
    console.log('✅ Movimento: Item por item (não em blocos)');
    console.log('✅ Pausa no hover: Ativada');
    console.log('✅ Arraste: Funcional');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testStoriesSpeed();
}

export { testStoriesSpeed };












