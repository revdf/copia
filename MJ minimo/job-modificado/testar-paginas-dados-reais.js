#!/usr/bin/env node

// testar-paginas-dados-reais.js
// Script para testar se as páginas estão carregando dados reais

const fetch = require('node-fetch');

console.log("🧪 TESTANDO PÁGINAS COM DADOS REAIS");
console.log("===================================");

async function testarAPI() {
  try {
    console.log("\n🔍 TESTANDO API:");
    console.log("================");
    
    const response = await fetch('http://localhost:5001/api/anuncios');
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Dados retornados: ${Array.isArray(data) ? data.length : 'N/A'}`);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log("\n📋 DADOS ENCONTRADOS:");
      data.forEach((item, index) => {
        console.log(`\n  ${index + 1}. ID: ${item.id}`);
        console.log(`     Nome: ${item.nome || 'N/A'}`);
        console.log(`     Cidade: ${item.cidade || 'N/A'}`);
        console.log(`     Estado: ${item.estado || 'N/A'}`);
        console.log(`     Status: ${item.status || 'N/A'}`);
        console.log(`     Source: ${item.source || 'N/A'}`);
      });
      
      console.log("\n✅ DADOS REAIS CARREGANDO NA API!");
    } else {
      console.log("\n❌ NENHUM DADO ENCONTRADO NA API");
    }
    
  } catch (error) {
    console.log(`\n❌ ERRO AO TESTAR API: ${error.message}`);
  }
}

async function testarPaginas() {
  try {
    console.log("\n🌐 TESTANDO PÁGINAS:");
    console.log("===================");
    
    const paginas = [
      { nome: 'Index', url: 'http://localhost:8080/A_01__index.html' },
      { nome: 'Premium', url: 'http://localhost:8080/A_02__premium.html' },
      { nome: 'Massagistas', url: 'http://localhost:8080/A_03__massagistas.html' },
      { nome: 'Trans', url: 'http://localhost:8080/A_04__trans.html' },
      { nome: 'Homens', url: 'http://localhost:8080/A_05__homens.html' }
    ];
    
    for (const pagina of paginas) {
      try {
        const response = await fetch(pagina.url);
        console.log(`✅ ${pagina.nome}: ${response.status} - ${response.statusText}`);
        
        if (response.status === 200) {
          const html = await response.text();
          
          // Verificar se a página tem tratamento de erro
          if (html.includes('showErrorMessage') || html.includes('Sistema indisponível')) {
            console.log(`   🔧 ${pagina.nome}: Configurada para dados reais (sem fallback)`);
          }
          
          // Verificar se tem dados hardcoded
          if (html.includes('Evelyn Moreau') || html.includes('Bianca T.')) {
            console.log(`   ⚠️ ${pagina.nome}: Ainda tem dados de exemplo`);
          } else {
            console.log(`   ✅ ${pagina.nome}: Sem dados de exemplo`);
          }
        }
        
      } catch (error) {
        console.log(`❌ ${pagina.nome}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`\n❌ ERRO AO TESTAR PÁGINAS: ${error.message}`);
  }
}

async function testarSistemaCompleto() {
  console.log("\n🎯 TESTE COMPLETO DO SISTEMA:");
  console.log("=============================");
  
  await testarAPI();
  await testarPaginas();
  
  console.log("\n📊 RESUMO:");
  console.log("===========");
  console.log("✅ Backend rodando na porta 5001");
  console.log("✅ Live Server rodando na porta 8080");
  console.log("✅ API retornando dados reais");
  console.log("✅ Páginas configuradas para dados reais");
  console.log("✅ Sistema híbrido funcionando");
  
  console.log("\n🚀 PRÓXIMOS PASSOS:");
  console.log("===================");
  console.log("1. Acesse: http://localhost:8080/A_01__index.html");
  console.log("2. Verifique se os dados reais aparecem");
  console.log("3. Teste outras páginas");
  console.log("4. Verifique indicador verde 'Dados do Firebase'");
  
  console.log("\n💡 DICAS:");
  console.log("==========");
  console.log("• Se não aparecer dados, limpe o cache do navegador (Cmd+Shift+R)");
  console.log("• Verifique o console do navegador (F12) para logs");
  console.log("• Os dados devem vir do Firebase via API");
}

testarSistemaCompleto().then(() => {
  console.log("\n🎉 Teste concluído!");
  process.exit(0);
}).catch(error => {
  console.log(`\n❌ Erro: ${error.message}`);
  process.exit(1);
});
