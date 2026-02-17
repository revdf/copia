#!/usr/bin/env node

// configurar-credenciais-firebase.js
// Script para configurar credenciais válidas do Firebase

import fs from 'fs';
import path from 'path';

console.log("🔑 CONFIGURADOR DE CREDENCIAIS FIREBASE");
console.log("=======================================");

console.log("\n📋 INSTRUÇÕES PARA OBTER CREDENCIAIS:");
console.log("=====================================");
console.log("1. Acesse: https://console.firebase.google.com/u/0/project/mansao-do-job/overview");
console.log("2. Clique no ícone de engrenagem (Configurações do projeto)");
console.log("3. Vá na aba 'Contas de serviço'");
console.log("4. Clique em 'Gerar nova chave privada'");
console.log("5. Baixe o arquivo JSON");
console.log("6. Copie os valores do arquivo JSON para este script");

console.log("\n🔧 CONFIGURAÇÃO ATUAL:");
console.log("======================");

// Verificar arquivo de configuração atual
const configPath = './config-firebase-mongodb.env';
if (fs.existsSync(configPath)) {
  const config = fs.readFileSync(configPath, 'utf8');
  
  // Extrair valores atuais
  const projectId = config.match(/FIREBASE_PROJECT_ID=(.+)/)?.[1];
  const privateKeyId = config.match(/FIREBASE_PRIVATE_KEY_ID=(.+)/)?.[1];
  const clientEmail = config.match(/FIREBASE_CLIENT_EMAIL=(.+)/)?.[1];
  const clientId = config.match(/FIREBASE_CLIENT_ID=(.+)/)?.[1];
  
  console.log(`Project ID: ${projectId}`);
  console.log(`Private Key ID: ${privateKeyId ? 'Configurado' : 'Não configurado'}`);
  console.log(`Client Email: ${clientEmail}`);
  console.log(`Client ID: ${clientId ? 'Configurado' : 'Não configurado'}`);
  
  // Verificar se são placeholders
  const isPlaceholder = privateKeyId?.includes('YOUR_') || clientId?.includes('YOUR_');
  
  if (isPlaceholder) {
    console.log("\n⚠️ PROBLEMA DETECTADO:");
    console.log("=====================");
    console.log("❌ As credenciais são placeholders (YOUR_...)");
    console.log("❌ Você precisa configurar credenciais reais");
    
    console.log("\n🛠️ SOLUÇÕES:");
    console.log("=============");
    console.log("1. **Opção 1 - Usar copia-do-job temporariamente:**");
    console.log("   - Copiar credenciais do copia-do-job");
    console.log("   - Testar sistema");
    console.log("   - Migrar dados depois");
    
    console.log("\n2. **Opção 2 - Configurar mansao-do-job:**");
    console.log("   - Gerar credenciais do mansao-do-job");
    console.log("   - Configurar neste arquivo");
    console.log("   - Testar sistema");
    
    console.log("\n3. **Opção 3 - Modo desenvolvimento:**");
    console.log("   - Usar dados mock para desenvolvimento");
    console.log("   - Configurar credenciais depois");
    
  } else {
    console.log("\n✅ CREDENCIAIS CONFIGURADAS:");
    console.log("============================");
    console.log("✅ Credenciais parecem estar configuradas");
    console.log("✅ Teste a conexão com: node test-connection.js");
  }
  
} else {
  console.log("❌ Arquivo de configuração não encontrado");
}

console.log("\n🚀 PRÓXIMOS PASSOS:");
console.log("===================");
console.log("1. Configure credenciais válidas do Firebase");
console.log("2. Execute: node test-connection.js");
console.log("3. Se OK, execute: node server-hybrid.js");
console.log("4. Teste as páginas no navegador");

console.log("\n💡 DICA:");
console.log("========");
console.log("Para desenvolvimento rápido, você pode:");
console.log("1. Usar credenciais do copia-do-job temporariamente");
console.log("2. Migrar dados depois");
console.log("3. Configurar mansao-do-job quando estiver pronto");









