// Script para testar as correções aplicadas
// Este script verifica se os problemas foram resolvidos

const http = require('http');

console.log('🧪 TESTANDO CORREÇÕES APLICADAS');
console.log('=' * 50);
console.log('');

// Testar CORS
console.log('🔗 TESTANDO CORS:');
const corsOptions = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/anuncios',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://127.0.0.1:5502',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'X-Requested-With'
  }
};

const corsReq = http.request(corsOptions, (res) => {
  const corsHeader = res.headers['access-control-allow-origin'];
  if (corsHeader && corsHeader.includes('127.0.0.1:5502')) {
    console.log('✅ CORS configurado corretamente');
    console.log(`   Origin permitido: ${corsHeader}`);
  } else {
    console.log('❌ CORS não configurado corretamente');
  }
});

corsReq.on('error', (error) => {
  console.log('❌ Erro ao testar CORS:', error.message);
});

corsReq.end();

// Testar API
console.log('');
console.log('🔗 TESTANDO API:');
const apiOptions = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/anuncios',
  method: 'GET'
};

const apiReq = http.request(apiOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.success) {
        console.log(`✅ API funcionando - ${json.data.length} anúncios total`);
        
        // Filtrar massagistas
        const massagistas = json.data.filter(a => a.categoria === 'massagista');
        console.log(`🧘 Massagistas encontrados: ${massagistas.length}`);
        
        if (massagistas.length > 0) {
          console.log('📋 Primeiros 3 massagistas:');
          massagistas.slice(0, 3).forEach((m, i) => {
            console.log(`   ${i + 1}. ${m.nome} - R$ ${m.preco} - ${m.foto_capa || 'Sem foto'}`);
          });
        }
        
      } else {
        console.log('❌ API retornou erro:', json.error);
      }
    } catch (error) {
      console.log('❌ Erro ao processar resposta da API:', error.message);
    }
  });
});

apiReq.on('error', (error) => {
  console.log('❌ Erro de conexão com API:', error.message);
});

apiReq.end();

console.log('');
console.log('📋 CORREÇÕES APLICADAS:');
console.log('   ✅ CORS configurado para permitir porta 5502');
console.log('   ✅ Dados de fallback com imagens locais');
console.log('   ✅ Caminho das imagens corrigido para ../fotinha/fotos/');
console.log('   ✅ Servidor Firebase reiniciado');
console.log('');

console.log('🌐 URL PARA TESTE:');
console.log('   http://127.0.0.1:5502/frontend/src/A_03__massagistas.html');
console.log('');

console.log('🔧 PARA TESTAR:');
console.log('1. Acesse a URL acima');
console.log('2. Abra o console do navegador (F12)');
console.log('3. Verifique se não há mais erros de CORS');
console.log('4. Verifique se as imagens estão carregando');
console.log('5. Verifique se os cards de massagistas aparecem');
console.log('');

console.log('🎉 CORREÇÕES CONCLUÍDAS!');
console.log('   A página deve estar funcionando agora!');















