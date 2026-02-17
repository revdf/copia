// Script para criar páginas de categoria com galeria 7 colunas
// Este script gera todas as páginas de categoria automaticamente

const fs = require('fs');
const path = require('path');

// Configurações das categorias
const categorias = [
  {
    id: 'massagista',
    nome: 'Massagista',
    icone: 'fas fa-spa',
    cor: '#4CAF50',
    descricao: 'Profissionais especializadas em massagens relaxantes e terapêuticas',
    features: [
      { icone: 'fas fa-hands', titulo: 'Técnicas Profissionais', desc: 'Massagens com técnicas avançadas' },
      { icone: 'fas fa-leaf', titulo: 'Relaxamento Total', desc: 'Alívio do stress e tensões' },
      { icone: 'fas fa-heart', titulo: 'Bem-estar', desc: 'Cuidado com sua saúde mental' },
      { icone: 'fas fa-clock', titulo: 'Horários Flexíveis', desc: 'Atendimento conforme sua agenda' }
    ]
  },
  {
    id: 'trans',
    nome: 'Trans',
    icone: 'fas fa-transgender',
    cor: '#E91E63',
    descricao: 'Acompanhantes trans lindas e sensuais com atendimento especial',
    features: [
      { icone: 'fas fa-heart', titulo: 'Respeito e Carinho', desc: 'Atendimento com total respeito' },
      { icone: 'fas fa-star', titulo: 'Beleza Natural', desc: 'Acompanhantes lindas e elegantes' },
      { icone: 'fas fa-shield-alt', titulo: 'Discrição', desc: 'Privacidade e confidencialidade' },
      { icone: 'fas fa-smile', titulo: 'Experiência Única', desc: 'Momentos especiais e marcantes' }
    ]
  },
  {
    id: 'homem',
    nome: 'Homens',
    icone: 'fas fa-male',
    cor: '#2196F3',
    descricao: 'Acompanhantes masculinos elegantes e sofisticados',
    features: [
      { icone: 'fas fa-user-tie', titulo: 'Elegância', desc: 'Acompanhantes masculinos elegantes' },
      { icone: 'fas fa-gem', titulo: 'Sofisticação', desc: 'Atendimento de alto padrão' },
      { icone: 'fas fa-clock', titulo: 'Disponibilidade', desc: 'Horários flexíveis para você' },
      { icone: 'fas fa-shield-alt', titulo: 'Discrição', desc: 'Total privacidade garantida' }
    ]
  },
  {
    id: 'webcam',
    nome: 'Webcam',
    icone: 'fas fa-video',
    cor: '#FF9800',
    descricao: 'Modelos webcam para shows ao vivo e entretenimento online',
    features: [
      { icone: 'fas fa-video', titulo: 'Shows Ao Vivo', desc: 'Entretenimento em tempo real' },
      { icone: 'fas fa-comments', titulo: 'Interação', desc: 'Chat e interação personalizada' },
      { icone: 'fas fa-clock', titulo: '24h Online', desc: 'Disponível a qualquer hora' },
      { icone: 'fas fa-home', titulo: 'Conforto', desc: 'Diversão no conforto de casa' }
    ]
  }
];

// Template base da página
const templatePagina = (categoria) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${categoria.nome} - Galeria 7 Colunas - Mansão do Job</title>
    
    <!-- Fontes do Google -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- CSS da Galeria -->
    <link rel="stylesheet" href="css/galeria-7-colunas.css">
    
    <style>
        /* Estilos globais */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: "Roboto", Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem 0;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            color: white;
        }
        
        .header h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
        }
        
        .header .categoria-icon {
            color: ${categoria.cor};
            font-size: 2.5rem;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .teste-banner {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff6b6b;
            color: white;
            text-align: center;
            padding: 10px;
            font-weight: bold;
            z-index: 1001;
        }
        
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: white;
            text-decoration: none;
            background: rgba(255, 255, 255, 0.1);
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            transition: all 0.3s ease;
            margin-bottom: 2rem;
        }
        
        .back-link:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        
        .categoria-info {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
            color: white;
            border: 2px solid ${categoria.cor}40;
        }
        
        .categoria-info h3 {
            margin-bottom: 1rem;
            font-size: 1.5rem;
            color: ${categoria.cor};
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .categoria-info p {
            margin-bottom: 1rem;
            line-height: 1.6;
        }
        
        .categoria-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .feature {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 10px;
            border-left: 4px solid ${categoria.cor};
        }
        
        .feature h4 {
            color: ${categoria.cor};
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }
        
        .feature p {
            font-size: 0.9rem;
            margin: 0;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="teste-banner">
        🧪 ${categoria.nome.toUpperCase()} - GALERIA 7 COLUNAS | Firebase isolado | Responsiva
    </div>
    
    <div class="container">
        <a href="../A_01__index.html" class="back-link">
            <i class="fas fa-arrow-left"></i>
            Voltar ao Início
        </a>
        
        <div class="header">
            <h1>
                <i class="${categoria.icone} categoria-icon"></i>
                ${categoria.nome}
            </h1>
            <p>${categoria.descricao}</p>
        </div>
        
        <div class="categoria-info">
            <h3>
                <i class="${categoria.icone}"></i>
                Acompanhantes ${categoria.nome}
            </h3>
            <p>
                ${categoria.descricao}. Nossa seleção oferece qualidade, 
                discrição e satisfação garantida. Cada perfil é cuidadosamente 
                selecionado para atender suas necessidades.
            </p>
            
            <div class="categoria-features">
                ${categoria.features.map(feature => `
                <div class="feature">
                    <h4><i class="${feature.icone}"></i> ${feature.titulo}</h4>
                    <p>${feature.desc}</p>
                </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Container da Galeria -->
        <div id="galeria-7-colunas">
            <!-- A galeria será renderizada aqui pelo JavaScript -->
        </div>
    </div>
    
    <!-- JavaScript da Galeria -->
    <script src="js/galeria-7-colunas.js"></script>
    
    <script>
        // Configurações específicas para ${categoria.nome}
        document.addEventListener('DOMContentLoaded', () => {
            console.log('${categoria.icone} Página ${categoria.nome} carregada!');
            
            // Aguardar a galeria ser inicializada
            setTimeout(() => {
                if (window.galeria) {
                    // Filtrar automaticamente para categoria ${categoria.nome}
                    window.galeria.filtrarCategoria('${categoria.id}');
                    console.log('✅ Filtro ${categoria.nome} aplicado automaticamente');
                }
            }, 1000);
        });
    </script>
</body>
</html>`;

// Função para criar as páginas
function criarPaginas() {
  console.log('🚀 Criando páginas de categoria com galeria 7 colunas...');
  
  const frontendPath = path.join(__dirname, '..', 'frontend', 'src');
  
  categorias.forEach(categoria => {
    const nomeArquivo = `${categoria.id}-7-colunas.html`;
    const caminhoArquivo = path.join(frontendPath, nomeArquivo);
    
    try {
      const conteudo = templatePagina(categoria);
      fs.writeFileSync(caminhoArquivo, conteudo, 'utf8');
      console.log(`✅ Página criada: ${nomeArquivo}`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${nomeArquivo}:`, error.message);
    }
  });
  
  console.log('');
  console.log('🎉 Páginas criadas com sucesso!');
  console.log('');
  console.log('📋 Páginas disponíveis:');
  categorias.forEach(categoria => {
    console.log(`   - ${categoria.id}-7-colunas.html (${categoria.nome})`);
  });
  console.log('');
  console.log('🔗 Para testar:');
  console.log('   http://127.0.0.1:5502/frontend/src/massagista-7-colunas.html');
  console.log('   http://127.0.0.1:5502/frontend/src/trans-7-colunas.html');
  console.log('   http://127.0.0.1:5502/frontend/src/homem-7-colunas.html');
  console.log('   http://127.0.0.1:5502/frontend/src/webcam-7-colunas.html');
}

// Executar
criarPaginas();















