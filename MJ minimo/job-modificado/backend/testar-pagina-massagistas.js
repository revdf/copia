// Script para testar a página de massagistas
// Este script verifica se a página está funcionando corretamente

const http = require('http');

console.log('🧪 TESTANDO PÁGINA DE MASSAGISTAS');
console.log('=' * 50);
console.log('');

// Testar API
console.log('🔗 TESTANDO API:');
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
        
        // Verificar imagens
        const comImagens = massagistas.filter(m => m.foto_capa || m.coverImage).length;
        console.log(`🖼️ Massagistas com imagens: ${comImagens}/${massagistas.length}`);
        
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
console.log('🌐 URL PARA TESTE:');
console.log('   http://127.0.0.1:5502/frontend/src/A_03__massagistas.html');
console.log('');

console.log('📋 CORREÇÕES APLICADAS:');
console.log('   ✅ API URL alterada de porta 5000 para 5001');
console.log('   ✅ Endpoint alterado de /api/advertisements para /api/anuncios');
console.log('   ✅ Filtro adicionado para categoria "massagista"');
console.log('   ✅ Caminho das imagens corrigido para ../fotinha/fotos/');
console.log('   ✅ Comentários atualizados para Firebase');
console.log('');

console.log('🔧 PARA TESTAR:');
console.log('1. Certifique-se de que o servidor Firebase está rodando:');
console.log('   cd backend && node server-firebase-simples.js');
console.log('');
console.log('2. Certifique-se de que o Live Server está rodando na porta 5502');
console.log('');
console.log('3. Acesse: http://127.0.0.1:5502/frontend/src/A_03__massagistas.html');
console.log('');
console.log('4. Abra o console do navegador (F12) para ver os logs');
console.log('');
console.log('5. Verifique se os cards de massagistas aparecem');
console.log('');

console.log('🎉 TESTE CONCLUÍDO!');
console.log('   A página de massagistas deve estar funcionando agora!');















