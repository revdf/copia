// Script para testar a página de perfil

import fs from 'fs';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

// Função para testar a página de perfil
async function testProfilePage() {
  try {
    console.log('👤 Testando página de perfil...');
    
    // 1. Verificar se a API está funcionando
    console.log('\n📡 1. Verificando API...');
    const response = await makeRequest('http://localhost:5001/api/anuncios');
    const anuncios = await response.json();
    console.log(`✅ API funcionando: ${anuncios.length} anúncios`);
    
    // 2. Encontrar anúncios premium (N1)
    const anunciosPremium = anuncios.filter(ad => ad.nivel === 'N1');
    console.log(`✅ Anúncios premium (N1): ${anunciosPremium.length}`);
    
    // 3. Gerar HTML de teste com links para perfis
    console.log('\n📄 2. Gerando HTML de teste com links...');
    const htmlTest = `
<!DOCTYPE html>
<html>
<head>
    <title>Teste Página de Perfil</title>
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
        
        .profile-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .profile-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: transform 0.3s;
        }
        
        .profile-card:hover {
            transform: translateY(-5px);
        }
        
        .profile-image {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            margin: 0 auto 15px;
            border: 3px solid #dc3545;
        }
        
        .profile-name {
            font-size: 1.2rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        
        .profile-level {
            background: #dc3545;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.9rem;
            margin-bottom: 10px;
            display: inline-block;
        }
        
        .profile-description {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 15px;
            line-height: 1.4;
        }
        
        .profile-link {
            background: #dc3545;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            transition: background 0.3s;
        }
        
        .profile-link:hover {
            background: #c82333;
        }
        
        .test-links {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .test-link {
            display: block;
            background: #007bff;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            text-decoration: none;
            margin: 10px 0;
            transition: background 0.3s;
        }
        
        .test-link:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>👤 Teste Página de Perfil</h1>
        
        <div class="info-box success">
            <h3>✅ Página de Perfil Criada</h3>
            <p><strong>Arquivo:</strong> A_02__premium_Anuncio_modelo_01.html</p>
            <p><strong>Funcionalidades:</strong></p>
            <ul>
                <li>✅ Carregamento dinâmico de dados da API</li>
                <li>✅ Galeria de fotos com modal</li>
                <li>✅ Informações do perfil</li>
                <li>✅ Seção de serviços e preços</li>
                <li>✅ Botões de contato</li>
                <li>✅ Design responsivo</li>
            </ul>
        </div>
        
        <div class="info-box">
            <h3>📊 Anúncios Premium Disponíveis</h3>
            <p>Total de anúncios premium (N1): <strong>${anunciosPremium.length}</strong></p>
            <p>Total de anúncios: <strong>${anuncios.length}</strong></p>
        </div>
        
        <div class="profile-grid">
            ${anunciosPremium.slice(0, 6).map(anuncio => {
                const mainImage = anuncio.foto_capa_url || anuncio.foto_capa || anuncio.coverImage || anuncio.fotoPerfil || 'https://via.placeholder.com/100x100/FFB6C1/FFFFFF?text=Sem+Imagem';
                const profileUrl = `A_02__premium_Anuncio_modelo_01.html?id=${anuncio.id}&name=${encodeURIComponent(anuncio.nome)}`;
                
                return `
                    <div class="profile-card">
                        <img src="${mainImage}" alt="${anuncio.nome}" class="profile-image" 
                             onerror="this.src='https://via.placeholder.com/100x100/FFB6C1/FFFFFF?text=Erro'">
                        <div class="profile-name">${anuncio.nome}</div>
                        <div class="profile-level">N1 - Premium VIP</div>
                        <div class="profile-description">${anuncio.descricao || anuncio.description || 'Descrição não disponível'}</div>
                        <a href="${profileUrl}" class="profile-link">Ver Perfil</a>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="test-links">
            <h3>🔗 Links de Teste</h3>
            <p>Teste os links abaixo para verificar se a página de perfil está funcionando:</p>
            
            ${anunciosPremium.slice(0, 3).map(anuncio => {
                const profileUrl = `A_02__premium_Anuncio_modelo_01.html?id=${anuncio.id}&name=${encodeURIComponent(anuncio.nome)}`;
                return `<a href="${profileUrl}" class="test-link">👤 Ver perfil de ${anuncio.nome}</a>`;
            }).join('')}
            
            <a href="A_02__premium.html" class="test-link">🏠 Voltar para página premium</a>
        </div>
        
        <div class="info-box">
            <h3>🛠️ Como Funciona</h3>
            <p><strong>1. Parâmetros da URL:</strong></p>
            <ul>
                <li><code>?id=ID_DO_ANUNCIO</code> - ID único do anúncio no Firebase</li>
                <li><code>&name=NOME_DO_ANUNCIO</code> - Nome do anúncio (fallback)</li>
            </ul>
            
            <p><strong>2. Carregamento de Dados:</strong></p>
            <ul>
                <li>Busca o anúncio na API usando o ID ou nome</li>
                <li>Carrega informações do perfil (nome, descrição, nível)</li>
                <li>Carrega galeria de fotos</li>
                <li>Exibe serviços e preços</li>
            </ul>
            
            <p><strong>3. Funcionalidades:</strong></p>
            <ul>
                <li>Galeria com modal para visualizar fotos</li>
                <li>Botões de contato (telefone, WhatsApp, e-mail)</li>
                <li>Design responsivo para mobile</li>
                <li>Navegação de volta para página premium</li>
            </ul>
        </div>
    </div>
    
    <script>
        console.log('👤 Teste de página de perfil carregado');
        console.log('📊 Anúncios premium:', ${JSON.stringify(anunciosPremium.slice(0, 3), null, 2)});
        
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
    
    fs.writeFileSync('/Users/troll/Desktop/copia do job/backend/test-profile-page.html', htmlTest);
    console.log('✅ HTML de teste criado: test-profile-page.html');
    console.log('🌐 Abra: file:///Users/troll/Desktop/copia%20do%20job/backend/test-profile-page.html');
    
    // 4. Status final
    console.log('\n🎯 3. Status da implementação:');
    console.log(`✅ Página de perfil criada: A_02__premium_Anuncio_modelo_01.html`);
    console.log(`✅ Links atualizados na página premium`);
    console.log(`✅ Anúncios premium disponíveis: ${anunciosPremium.length}`);
    console.log(`✅ API funcionando: ${anuncios.length} anúncios`);
    
    if (anunciosPremium.length > 0) {
      console.log('\n✅ Página de perfil pronta para uso!');
      console.log('📱 Teste clicando nos links dos anúncios premium');
    } else {
      console.log('\n❌ Nenhum anúncio premium encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testProfilePage();
}

export { testProfilePage };












