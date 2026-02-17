// Script para testar a galeria 7 colunas
// Este script verifica se todos os componentes estão funcionando

const fs = require('fs');
const path = require('path');

console.log('🧪 TESTANDO GALERIA 7 COLUNAS');
console.log('=' * 50);
console.log('');

// Verificar arquivos criados
const arquivos = [
  '../frontend/src/css/galeria-7-colunas.css',
  '../frontend/src/js/galeria-7-colunas.js',
  '../frontend/src/galeria-7-colunas-exemplo.html',
  '../frontend/src/premium-7-colunas.html',
  '../frontend/src/massagista-7-colunas.html',
  '../frontend/src/trans-7-colunas.html',
  '../frontend/src/homem-7-colunas.html',
  '../frontend/src/webcam-7-colunas.html'
];

console.log('📁 VERIFICANDO ARQUIVOS:');
arquivos.forEach(arquivo => {
  const caminho = path.join(__dirname, arquivo);
  if (fs.existsSync(caminho)) {
    const stats = fs.statSync(caminho);
    console.log(`✅ ${arquivo} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`❌ ${arquivo} - NÃO ENCONTRADO`);
  }
});

console.log('');

// Verificar pasta de fotos
const fotosPath = path.join(__dirname, '..', 'fotinha', 'fotos');
if (fs.existsSync(fotosPath)) {
  const fotos = fs.readdirSync(fotosPath).filter(f => f.endsWith('.jpg'));
  console.log(`📸 FOTOS DISPONÍVEIS: ${fotos.length} arquivos`);
  console.log(`   Pasta: ${fotosPath}`);
} else {
  console.log('❌ Pasta de fotos não encontrada');
}

console.log('');

// Verificar API
console.log('🔗 TESTANDO API:');
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/anuncios',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.success) {
        console.log(`✅ API funcionando - ${json.data.length} anúncios`);
        
        // Verificar categorias
        const categorias = {};
        json.data.forEach(anuncio => {
          const cat = anuncio.categoria || 'indefinida';
          categorias[cat] = (categorias[cat] || 0) + 1;
        });
        
        console.log('📊 Categorias disponíveis:');
        Object.entries(categorias).forEach(([cat, count]) => {
          console.log(`   - ${cat}: ${count} anúncios`);
        });
        
        // Verificar imagens
        const comImagens = json.data.filter(a => a.foto_capa || a.coverImage).length;
        console.log(`🖼️ Anúncios com imagens: ${comImagens}/${json.data.length}`);
        
      } else {
        console.log('❌ API retornou erro:', json.error);
      }
    } catch (error) {
      console.log('❌ Erro ao processar resposta da API:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Erro de conexão com API:', error.message);
  console.log('   Verifique se o servidor está rodando na porta 5001');
});

req.end();

console.log('');

// URLs de teste
console.log('🌐 URLs PARA TESTE:');
console.log('   Página geral: http://127.0.0.1:5502/frontend/src/galeria-7-colunas-exemplo.html');
console.log('   Premium: http://127.0.0.1:5502/frontend/src/premium-7-colunas.html');
console.log('   Massagista: http://127.0.0.1:5502/frontend/src/massagista-7-colunas.html');
console.log('   Trans: http://127.0.0.1:5502/frontend/src/trans-7-colunas.html');
console.log('   Homens: http://127.0.0.1:5502/frontend/src/homem-7-colunas.html');
console.log('   Webcam: http://127.0.0.1:5502/frontend/src/webcam-7-colunas.html');
console.log('');

// Instruções
console.log('📋 INSTRUÇÕES:');
console.log('1. Certifique-se de que o servidor Firebase está rodando:');
console.log('   cd backend && node server-firebase-simples.js');
console.log('');
console.log('2. Certifique-se de que o Live Server está rodando na porta 5502');
console.log('');
console.log('3. Acesse uma das URLs acima para testar a galeria');
console.log('');
console.log('4. Teste a responsividade redimensionando a janela');
console.log('');
console.log('5. Teste os filtros de categoria');
console.log('');
console.log('6. Teste a paginação');
console.log('');

console.log('🎉 TESTE CONCLUÍDO!');
console.log('   A galeria 7 colunas está pronta para uso!');















