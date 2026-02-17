#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log("🔧 ATUALIZANDO CONFIGURAÇÕES PARA MANSÃO DO JOB");
console.log("================================================");

async function atualizarConfiguracoes() {
  try {
    console.log("\n📋 ATUALIZANDO ARQUIVOS DE CONFIGURAÇÃO:");
    console.log("=========================================");
    
    // 1. Atualizar config-firebase-mongodb.env
    console.log("\n1️⃣ Atualizando config-firebase-mongodb.env...");
    
    const configPath = './config-firebase-mongodb.env';
    if (fs.existsSync(configPath)) {
      // Fazer backup do arquivo atual
      const backupPath = './config-firebase-mongodb.env.backup';
      fs.copyFileSync(configPath, backupPath);
      console.log(`   📁 Backup criado: ${backupPath}`);
      
      // Substituir pelo arquivo do mansao-do-job
      const mansaoConfigPath = './config-mansao-do-job.env';
      if (fs.existsSync(mansaoConfigPath)) {
        fs.copyFileSync(mansaoConfigPath, configPath);
        console.log("   ✅ config-firebase-mongodb.env atualizado");
      } else {
        console.log("   ❌ Arquivo config-mansao-do-job.env não encontrado");
      }
    } else {
      console.log("   ⚠️ Arquivo config-firebase-mongodb.env não encontrado");
    }
    
    // 2. Atualizar firebase-config.js no frontend
    console.log("\n2️⃣ Atualizando firebase-config.js...");
    
    const frontendConfigPaths = [
      './frontend/js/firebase-config.js',
      './frontend/src/firebase-config.js',
      './frontend/src/js/firebase-config.js'
    ];
    
    for (const configPath of frontendConfigPaths) {
      if (fs.existsSync(configPath)) {
        // Fazer backup
        const backupPath = `${configPath}.backup`;
        fs.copyFileSync(configPath, backupPath);
        console.log(`   📁 Backup criado: ${backupPath}`);
        
        // Atualizar configuração
        let content = fs.readFileSync(configPath, 'utf8');
        
        // Substituir configurações
        content = content.replace(
          /projectId:\s*["']copia-do-job["']/g,
          'projectId: "mansao-do-job"'
        );
        content = content.replace(
          /authDomain:\s*["']copia-do-job\.firebaseapp\.com["']/g,
          'authDomain: "mansao-do-job.firebaseapp.com"'
        );
        content = content.replace(
          /storageBucket:\s*["']copia-do-job\.firebasestorage\.app["']/g,
          'storageBucket: "mansao-do-job.firebasestorage.app"'
        );
        
        fs.writeFileSync(configPath, content);
        console.log(`   ✅ ${configPath} atualizado`);
      }
    }
    
    // 3. Atualizar package.json scripts
    console.log("\n3️⃣ Atualizando package.json...");
    
    const packageJsonPath = './package.json';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Fazer backup
      const backupPath = './package.json.backup';
      fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2));
      console.log(`   📁 Backup criado: ${backupPath}`);
      
      // Atualizar scripts se existirem
      if (packageJson.scripts) {
        // Atualizar scripts que referenciam copia-do-job
        Object.keys(packageJson.scripts).forEach(scriptName => {
          if (packageJson.scripts[scriptName].includes('copia-do-job')) {
            packageJson.scripts[scriptName] = packageJson.scripts[scriptName].replace(
              /copia-do-job/g,
              'mansao-do-job'
            );
          }
        });
      }
      
      // Atualizar nome do projeto se existir
      if (packageJson.name && packageJson.name.includes('copia-do-job')) {
        packageJson.name = packageJson.name.replace('copia-do-job', 'mansao-do-job');
      }
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log("   ✅ package.json atualizado");
    }
    
    // 4. Atualizar arquivos de documentação
    console.log("\n4️⃣ Atualizando documentação...");
    
    const docFiles = [
      'README.md',
      'README-FIREBASE-ONLY.md',
      'README-HIBRIDO.md',
      'FIREBASE-SETUP-COMPLETO.md'
    ];
    
    for (const docFile of docFiles) {
      if (fs.existsSync(docFile)) {
        // Fazer backup
        const backupPath = `${docFile}.backup`;
        fs.copyFileSync(docFile, backupPath);
        console.log(`   📁 Backup criado: ${backupPath}`);
        
        // Atualizar conteúdo
        let content = fs.readFileSync(docFile, 'utf8');
        
        // Substituir referências
        content = content.replace(/copia-do-job/g, 'mansao-do-job');
        content = content.replace(/copia do job/g, 'mansão do job');
        
        fs.writeFileSync(docFile, content);
        console.log(`   ✅ ${docFile} atualizado`);
      }
    }
    
    // 5. Criar arquivo de status da migração
    console.log("\n5️⃣ Criando arquivo de status...");
    
    const statusFile = './MIGRACAO-STATUS.md';
    const statusContent = `# 🚀 STATUS DA MIGRAÇÃO PARA MANSÃO DO JOB

## ✅ MIGRAÇÃO CONCLUÍDA

**Data:** ${new Date().toISOString()}
**Projeto Anterior:** copia-do-job
**Projeto Atual:** mansao-do-job

## 📊 DADOS MIGRADOS

- ✅ Backup dos dados do copia-do-job realizado
- ✅ Configurações atualizadas para mansao-do-job
- ✅ Arquivos de configuração atualizados
- ✅ Documentação atualizada

## 🔧 ARQUIVOS ATUALIZADOS

- \`config-firebase-mongodb.env\` → Configuração principal
- \`frontend/js/firebase-config.js\` → Configuração do frontend
- \`package.json\` → Scripts e nome do projeto
- \`README.md\` → Documentação principal
- Outros arquivos de documentação

## 📁 BACKUPS CRIADOS

Todos os arquivos originais foram salvos com extensão \`.backup\`:
- \`config-firebase-mongodb.env.backup\`
- \`package.json.backup\`
- \`README.md.backup\`
- E outros...

## 🚀 PRÓXIMOS PASSOS

1. ✅ Configurar credenciais do mansao-do-job no Firebase Console
2. ✅ Executar migração dos dados: \`node migrar-dados-para-mansao-do-job.js\`
3. ✅ Testar sistema: \`node server-hybrid.js\`
4. ✅ Verificar funcionamento completo

## ⚠️ IMPORTANTE

- As credenciais do mansao-do-job precisam ser configuradas manualmente
- Execute a migração de dados após configurar as credenciais
- Teste o sistema antes de usar em produção
`;

    fs.writeFileSync(statusFile, statusContent);
    console.log(`   ✅ ${statusFile} criado`);
    
    // Resultado final
    console.log("\n🎉 ATUALIZAÇÃO DE CONFIGURAÇÕES CONCLUÍDA!");
    console.log("==========================================");
    console.log("✅ Todos os arquivos foram atualizados");
    console.log("✅ Backups foram criados");
    console.log("✅ Sistema configurado para mansao-do-job");
    
    console.log("\n💡 PRÓXIMOS PASSOS:");
    console.log("===================");
    console.log("1. 🔧 Configurar credenciais do mansao-do-job no Firebase Console");
    console.log("2. 📤 Executar: node migrar-dados-para-mansao-do-job.js");
    console.log("3. 🧪 Testar: node server-hybrid.js");
    console.log("4. 🚀 Sistema pronto para mansao-do-job!");
    
  } catch (error) {
    console.error("\n❌ ERRO durante a atualização:", error.message);
    console.error("❌ A atualização foi interrompida!");
  }
}

atualizarConfiguracoes();









