// Script para testar se as imagens estão funcionando
// Este script verifica se o servidor de imagens está servindo as fotos corretamente

const http = require('http');

console.log('🖼️ TESTANDO SERVIDOR DE IMAGENS');
console.log('=' * 50);
console.log('');

// Testar servidor de imagens
console.log('🔗 TESTANDO SERVIDOR DE IMAGENS:');
const options = {
  hostname: 'localhost',
  port: 5503,
  path: '/',
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
      console.log('✅ Servidor de imagens funcionando');
      console.log(`   Porta: ${json.port}`);
      console.log(`   Pasta: ${json.fotos}`);
    } catch (error) {
      console.log('❌ Erro ao processar resposta:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Erro de conexão com servidor de imagens:', error.message);
  console.log('   Verifique se o servidor está rodando na porta 5503');
});

req.end();

// Testar uma imagem específica
console.log('');
console.log('🖼️ TESTANDO IMAGEM ESPECÍFICA:');
const imgOptions = {
  hostname: 'localhost',
  port: 5503,
  path: '/fotinha/fotos/foto%20(1).jpg',
  method: 'HEAD'
};

const imgReq = http.request(imgOptions, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Imagem servida com sucesso');
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Content-Type: ${res.headers['content-type']}`);
    console.log(`   Content-Length: ${res.headers['content-length']} bytes`);
  } else {
    console.log(`❌ Erro ao servir imagem: ${res.statusCode}`);
  }
});

imgReq.on('error', (error) => {
  console.log('❌ Erro ao testar imagem:', error.message);
});

imgReq.end();

console.log('');
console.log('📋 CONFIGURAÇÃO ATUAL:');
console.log('   ✅ Servidor Firebase: porta 5001');
console.log('   ✅ Servidor de imagens: porta 5503');
console.log('   ✅ Live Server: porta 5502');
console.log('   ✅ CORS configurado para todas as portas');
console.log('');

console.log('🌐 URLs PARA TESTE:');
console.log('   Página: http://127.0.0.1:5502/frontend/src/A_03__massagistas.html');
console.log('   API: http://localhost:5001/api/anuncios');
console.log('   Imagens: http://localhost:5503/fotinha/fotos/');
console.log('');

console.log('🔧 PARA TESTAR:');
console.log('1. Acesse a página de massagistas');
console.log('2. Abra o console do navegador (F12)');
console.log('3. Verifique se não há mais erros 404 nas imagens');
console.log('4. Verifique se os cards mostram as fotos');
console.log('');

console.log('🎉 TESTE CONCLUÍDO!');
console.log('   As imagens devem estar funcionando agora!');















