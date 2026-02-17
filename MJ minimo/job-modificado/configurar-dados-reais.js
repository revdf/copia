#!/usr/bin/env node

// configurar-dados-reais.js
// Script para configurar todas as páginas para usar apenas dados reais

const fs = require('fs');
const path = require('path');

console.log("🔧 CONFIGURANDO PÁGINAS PARA USAR APENAS DADOS REAIS");
console.log("=====================================================");

// Lista de páginas para configurar
const pages = [
  'frontend/src/A_02__premium.html',
  'frontend/src/A_03__massagistas.html',
  'frontend/src/A_04__trans.html',
  'frontend/src/A_05__homens.html',
  'frontend/src/modelo-cadastro-anuncios.html'
];

// Função para remover fallbacks de dados de exemplo
function removeDataFallbacks(content) {
  let modified = content;
  
  // Padrões comuns de fallback para remover
  const fallbackPatterns = [
    // Arrays de dados de exemplo
    /PROFILES_DATA\s*=\s*\[[\s\S]*?\];/g,
    /const\s+exemploData\s*=\s*\[[\s\S]*?\];/g,
    /const\s+sampleData\s*=\s*\[[\s\S]*?\];/g,
    
    // Comentários sobre fallback
    /\/\/\s*Fallback.*?dados.*?exemplo[\s\S]*?(?=\n\s*[^\/\s]|\n\s*$)/g,
    /\/\/\s*Usando.*?dados.*?exemplo[\s\S]*?(?=\n\s*[^\/\s]|\n\s*$)/g,
    
    // Blocos de dados estáticos
    /\/\/\s*Dados.*?estáticos[\s\S]*?(?=\n\s*[^\/\s]|\n\s*$)/g
  ];
  
  // Remover padrões de fallback
  fallbackPatterns.forEach(pattern => {
    modified = modified.replace(pattern, '');
  });
  
  // Substituir mensagens de fallback
  modified = modified.replace(
    /"Usando dados de exemplo"/g,
    '"Apenas dados reais - sem fallback"'
  );
  
  modified = modified.replace(
    /"dados de exemplo"/g,
    '"dados reais"'
  );
  
  return modified;
}

// Função para adicionar função de erro se não existir
function addErrorMessageFunction(content) {
  if (content.includes('function showErrorMessage')) {
    return content; // Já existe
  }
  
  const errorFunction = `
// Função para mostrar mensagem de erro na interface
function showErrorMessage(message) {
  const container = document.getElementById('gallery-grid') || 
                   document.getElementById('anuncios-container') ||
                   document.querySelector('.content-section') ||
                   document.body;
  
  if (container) {
    container.innerHTML = \`
      <div class="error-message-container" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
        padding: 2rem;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        margin: 2rem 0;
      ">
        <div style="
          font-size: 4rem;
          color: #e25352;
          margin-bottom: 1rem;
        ">⚠️</div>
        <h3 style="
          color: #e25352;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        ">Sistema Indisponível</h3>
        <p style="
          color: #666;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          max-width: 500px;
          line-height: 1.6;
        ">\${message}</p>
        <div style="
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #e25352;
          max-width: 600px;
        ">
          <h4 style="color: #333; margin-bottom: 0.5rem;">Para resolver:</h4>
          <ol style="
            text-align: left;
            color: #666;
            margin: 0;
            padding-left: 1.5rem;
          ">
            <li>Inicie o backend: <code>node backend/server-hybrid.js</code></li>
            <li>Verifique se a porta 5001 está livre</li>
            <li>Configure as credenciais do Firebase</li>
            <li>Recarregue a página</li>
          </ol>
        </div>
        <button onclick="location.reload()" style="
          background: #e25352;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 5px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1rem;
          transition: background 0.3s;
        " onmouseover="this.style.background='#d44443'" onmouseout="this.style.background='#e25352'">
          🔄 Recarregar Página
        </button>
      </div>
    \`;
  }
}
`;
  
  // Adicionar antes do fechamento do script
  const scriptEnd = content.lastIndexOf('</script>');
  if (scriptEnd !== -1) {
    return content.slice(0, scriptEnd) + errorFunction + '\n' + content.slice(scriptEnd);
  }
  
  return content + errorFunction;
}

// Função para modificar tratamento de erro
function modifyErrorHandling(content) {
  let modified = content;
  
  // Substituir padrões de fallback em catch blocks
  modified = modified.replace(
    /catch\s*\([^)]*\)\s*\{[\s\S]*?PROFILES_DATA\s*=\s*\[[\s\S]*?\];[\s\S]*?return\s+PROFILES_DATA;[\s\S]*?\}/g,
    `catch (error) {
    console.error("❌ Erro ao carregar dados:", error);
    
    // Mostrar indicador de erro - SEM FALLBACK
    showDataSourceIndicator("❌ Erro ao carregar dados. Verifique se o backend está rodando.", "error");
    
    // NÃO usar dados de exemplo - apenas dados reais
    console.log("🚫 Modo dados reais ativo - sem fallback para dados de exemplo");
    PROFILES_DATA = [];
    
    // Mostrar mensagem de erro na interface
    showErrorMessage("Sistema indisponível. Verifique se o backend está rodando na porta 5001.");
    
    return PROFILES_DATA;
  }`
  );
  
  return modified;
}

// Processar cada página
let processedPages = 0;
let errorPages = 0;

pages.forEach(pagePath => {
  try {
    if (fs.existsSync(pagePath)) {
      console.log(`\n📄 Processando: ${pagePath}`);
      
      // Fazer backup
      const backupPath = `${pagePath}.backup`;
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(pagePath, backupPath);
        console.log(`   📁 Backup criado: ${backupPath}`);
      }
      
      // Ler conteúdo
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Aplicar modificações
      content = removeDataFallbacks(content);
      content = addErrorMessageFunction(content);
      content = modifyErrorHandling(content);
      
      // Salvar modificações
      fs.writeFileSync(pagePath, content);
      
      console.log(`   ✅ Configurado para dados reais`);
      processedPages++;
      
    } else {
      console.log(`\n⚠️ Arquivo não encontrado: ${pagePath}`);
    }
  } catch (error) {
    console.log(`\n❌ Erro ao processar ${pagePath}: ${error.message}`);
    errorPages++;
  }
});

// Resultado final
console.log("\n🎉 CONFIGURAÇÃO CONCLUÍDA!");
console.log("===========================");
console.log(`📊 Páginas processadas: ${processedPages}`);
console.log(`❌ Erros: ${errorPages}`);
console.log(`📁 Backups criados: ${processedPages}`);

console.log("\n💡 RESULTADO:");
console.log("=============");
console.log("✅ Todas as páginas configuradas para usar APENAS dados reais");
console.log("✅ Fallbacks de dados de exemplo removidos");
console.log("✅ Mensagens de erro melhoradas");
console.log("✅ Função de erro adicionada");

console.log("\n🚀 PRÓXIMOS PASSOS:");
console.log("===================");
console.log("1. ✅ Páginas configuradas para dados reais");
console.log("2. 🔧 Iniciar backend: node backend/server-hybrid.js");
console.log("3. 🔑 Configurar credenciais do mansao-do-job");
console.log("4. 📤 Migrar dados se necessário");
console.log("5. 🧪 Testar páginas com dados reais");

console.log("\n⚠️ IMPORTANTE:");
console.log("==============");
console.log("• Sem backend rodando, as páginas mostrarão erro");
console.log("• Não haverá mais dados de exemplo");
console.log("• Sistema funcionará apenas com dados reais");
console.log("• Backups foram criados para reverter se necessário");









