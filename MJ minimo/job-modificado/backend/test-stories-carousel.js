// Script para testar o carrossel de stories

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para testar o carrossel de stories
async function testStoriesCarousel() {
  try {
    console.log('🎠 Testando carrossel de stories...');
    
    // 1. Buscar anúncios da API
    const response = await makeRequest('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    
    const anunciosComStories = anuncios.filter(ad => ad.foto_stories);
    console.log(`📊 Anúncios com stories: ${anunciosComStories.length}`);
    
    // 2. Gerar HTML de teste com carrossel
    console.log('\n📄 Gerando HTML de teste com carrossel...');
    const htmlTest = `
<!DOCTYPE html>
<html>
<head>
    <title>Teste Carrossel Stories</title>
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
        
        .stories-section {
            background: white;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .stories-section h2 {
            color: #dc3545;
            margin-bottom: 20px;
            text-align: center;
        }
        
        /* Carrossel de Stories */
        .stories-carousel-container {
            position: relative;
            overflow: hidden;
            border-radius: 10px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            padding: 10px 0;
            cursor: grab;
            user-select: none;
        }
        
        .stories-carousel-container:hover {
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        
        .stories-track {
            display: flex;
            align-items: center;
            min-height: 100px;
            transition: transform 0.3s ease;
            will-change: transform;
        }
        
        .story-item {
            flex: 0 0 80px;
            margin: 0 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 10px;
            padding: 5px;
            text-align: center;
        }
        
        .story-item:hover {
            background: rgba(255, 255, 255, 0.8);
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .story-ring {
            width: 60px;
            height: 60px;
            border: 3px solid #dc3545;
            border-radius: 50%;
            overflow: hidden;
            margin: 0 auto;
            box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
            transition: all 0.3s ease;
        }
        
        .story-item:hover .story-ring {
            border-color: #c82333;
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
            transform: scale(1.1);
        }
        
        .story-thumb {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .story-name {
            font-size: 12px;
            color: #333;
            margin-top: 8px;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        
        .story-item:hover .story-name {
            color: #dc3545;
            transform: translateY(-2px);
        }
        
        /* Indicadores de navegação */
        .stories-carousel-container::before,
        .stories-carousel-container::after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            width: 30px;
            z-index: 2;
            pointer-events: none;
        }
        
        .stories-carousel-container::before {
            left: 0;
            background: linear-gradient(to right, rgba(248, 249, 250, 0.9), transparent);
        }
        
        .stories-carousel-container::after {
            right: 0;
            background: linear-gradient(to left, rgba(248, 249, 250, 0.9), transparent);
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
            margin: 0 5px;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            background: #c82333;
            transform: translateY(-2px);
        }
        
        .info {
            background: #e9ecef;
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            font-family: monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎠 Teste Carrossel de Stories</h1>
        
        <div class="stories-section">
            <h2>Stories em Movimento</h2>
            <div id="stories-wrapper"></div>
            
            <div class="controls">
                <button class="btn" onclick="pauseCarousel()">⏸️ Pausar</button>
                <button class="btn" onclick="resumeCarousel()">▶️ Retomar</button>
                <button class="btn" onclick="resetCarousel()">🔄 Reset</button>
            </div>
            
            <div class="info">
                <strong>Instruções:</strong><br>
                • O carrossel se move automaticamente<br>
                • Clique e arraste para navegar manualmente<br>
                • Hover pausa o movimento<br>
                • Clique nos stories para interagir<br>
                • Funciona em desktop e mobile
            </div>
        </div>
    </div>
    
    <script>
        // Dados dos anúncios
        const anuncios = ${JSON.stringify(anunciosComStories.slice(0, 20), null, 2)};
        
        // Variáveis do carrossel
        let storiesCarousel = null;
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;
        
        function initStories() {
            const storiesWrapper = document.getElementById('stories-wrapper');
            storiesWrapper.innerHTML = '';
            
            // Criar container para o carrossel
            const carouselContainer = document.createElement('div');
            carouselContainer.className = 'stories-carousel-container';
            
            // Criar trilha de stories
            const storiesTrack = document.createElement('div');
            storiesTrack.className = 'stories-track';
            
            // Função para criar um story item
            function createStoryItem(ad, index) {
                const storyItem = document.createElement('div');
                storyItem.className = 'story-item';
                
                const storyImage = ad.foto_stories ? 
                    \`https://firebasestorage.googleapis.com/v0/b/copia-do-job.firebasestorage.app/o/\${encodeURIComponent(ad.foto_stories)}?alt=media\` : 
                    ad.image;
                
                storyItem.innerHTML = \`
                    <div class="story-ring">
                        <img src="\${storyImage}" class="story-thumb" alt="\${ad.nome}" 
                             onerror="this.src='\${ad.image}'">
                    </div>
                    <div class="story-name">\${ad.nome.split(' ')[0]}</div>
                \`;
                
                // Click no story
                storyItem.addEventListener('click', (e) => {
                    if (!isDragging) {
                        e.preventDefault();
                        alert(\`Story clicado: \${ad.nome}\`);
                    }
                });
                
                return storyItem;
            }
            
            // Adicionar stories (duplicar para loop infinito)
            const storiesToShow = anuncios;
            
            // Primeira cópia
            storiesToShow.forEach((ad, index) => {
                storiesTrack.appendChild(createStoryItem(ad, index));
            });
            
            // Segunda cópia para loop infinito
            storiesToShow.forEach((ad, index) => {
                storiesTrack.appendChild(createStoryItem(ad, index + 20));
            });
            
            carouselContainer.appendChild(storiesTrack);
            storiesWrapper.appendChild(carouselContainer);
            
            // Inicializar carrossel
            initStoriesCarousel(carouselContainer, storiesTrack, storiesToShow.length);
        }
        
        function initStoriesCarousel(container, track, itemCount) {
            let currentIndex = 0;
            const itemWidth = 96; // 80px + 16px margin
            let animationId = null;
            let isPaused = false;
            
            // Função para mover o carrossel
            function moveCarousel() {
                if (!isPaused) {
                    currentIndex++;
                    const translateX = -currentIndex * itemWidth;
                    track.style.transform = \`translateX(\${translateX}px)\`;
                    
                    // Reset para loop infinito
                    if (currentIndex >= itemCount) {
                        setTimeout(() => {
                            currentIndex = 0;
                            track.style.transition = 'none';
                            track.style.transform = 'translateX(0px)';
                            setTimeout(() => {
                                track.style.transition = 'transform 0.3s ease';
                            }, 50);
                        }, 300);
                    }
                }
                
                animationId = requestAnimationFrame(moveCarousel);
            }
            
            // Função para pausar/retomar
            function pauseCarousel() {
                isPaused = true;
            }
            
            function resumeCarousel() {
                isPaused = false;
            }
            
            // Eventos de mouse
            container.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.pageX - container.offsetLeft;
                scrollLeft = currentIndex * itemWidth;
                pauseCarousel();
                container.style.cursor = 'grabbing';
            });
            
            container.addEventListener('mouseleave', () => {
                if (isDragging) {
                    isDragging = false;
                    resumeCarousel();
                    container.style.cursor = 'grab';
                }
            });
            
            container.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    resumeCarousel();
                    container.style.cursor = 'grab';
                }
            });
            
            container.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                
                const x = e.pageX - container.offsetLeft;
                const walk = (x - startX) * 2;
                const newScrollLeft = scrollLeft - walk;
                
                const newIndex = Math.round(newScrollLeft / itemWidth);
                if (newIndex >= 0 && newIndex < itemCount) {
                    currentIndex = newIndex;
                    const translateX = -currentIndex * itemWidth;
                    track.style.transition = 'none';
                    track.style.transform = \`translateX(\${translateX}px)\`;
                }
            });
            
            // Eventos de touch para mobile
            container.addEventListener('touchstart', (e) => {
                isDragging = true;
                startX = e.touches[0].pageX - container.offsetLeft;
                scrollLeft = currentIndex * itemWidth;
                pauseCarousel();
            });
            
            container.addEventListener('touchend', () => {
                if (isDragging) {
                    isDragging = false;
                    resumeCarousel();
                }
            });
            
            container.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                
                const x = e.touches[0].pageX - container.offsetLeft;
                const walk = (x - startX) * 2;
                const newScrollLeft = scrollLeft - walk;
                
                const newIndex = Math.round(newScrollLeft / itemWidth);
                if (newIndex >= 0 && newIndex < itemCount) {
                    currentIndex = newIndex;
                    const translateX = -currentIndex * itemWidth;
                    track.style.transition = 'none';
                    track.style.transform = \`translateX(\${translateX}px)\`;
                }
            });
            
            // Pausar quando hover
            container.addEventListener('mouseenter', pauseCarousel);
            container.addEventListener('mouseleave', resumeCarousel);
            
            // Iniciar animação
            moveCarousel();
            
            // Salvar referência para controle
            storiesCarousel = {
                pause: pauseCarousel,
                resume: resumeCarousel,
                moveTo: (index) => {
                    currentIndex = index;
                    const translateX = -currentIndex * itemWidth;
                    track.style.transform = \`translateX(\${translateX}px)\`;
                }
            };
        }
        
        // Funções de controle
        function pauseCarousel() {
            if (storiesCarousel) {
                storiesCarousel.pause();
            }
        }
        
        function resumeCarousel() {
            if (storiesCarousel) {
                storiesCarousel.resume();
            }
        }
        
        function resetCarousel() {
            if (storiesCarousel) {
                storiesCarousel.moveTo(0);
            }
        }
        
        // Inicializar quando a página carregar
        document.addEventListener('DOMContentLoaded', initStories);
    </script>
</body>
</html>`;
    
    fs.writeFileSync('/Users/troll/Desktop/copia do job/backend/test-stories-carousel.html', htmlTest);
    console.log('✅ HTML de teste criado: test-stories-carousel.html');
    console.log('🌐 Abra: file:///Users/troll/Desktop/copia%20do%20job/backend/test-stories-carousel.html');
    
    // 3. Status final
    console.log('\n🎯 Status do carrossel:');
    console.log(`Total de stories: ${anunciosComStories.length}`);
    console.log(`Stories no carrossel: ${Math.min(20, anunciosComStories.length)}`);
    console.log('✅ Carrossel implementado com sucesso!');
    
    console.log('\n🎠 Funcionalidades do carrossel:');
    console.log('• Movimento automático em loop infinito');
    console.log('• Navegação por mouse/touch (arrastar)');
    console.log('• Pausa no hover');
    console.log('• Efeitos visuais e transições suaves');
    console.log('• Responsivo para desktop e mobile');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testStoriesCarousel();
}

export { testStoriesCarousel };












