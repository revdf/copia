#!/usr/bin/env node

// obter-credenciais-copia-do-job.js
// Script para obter credenciais válidas do copia-do-job

import fs from 'fs';

console.log("🔑 OBTENDO CREDENCIAIS DO COPIA-DO-JOB");
console.log("======================================");

console.log("\n📋 INSTRUÇÕES:");
console.log("==============");
console.log("1. Acesse: https://console.firebase.google.com/u/0/project/copia-do-job/overview");
console.log("2. Clique no ícone de engrenagem (Configurações do projeto)");
console.log("3. Vá na aba 'Contas de serviço'");
console.log("4. Clique em 'Gerar nova chave privada'");
console.log("5. Baixe o arquivo JSON");
console.log("6. Copie os valores abaixo:");

console.log("\n🔧 VALORES NECESSÁRIOS:");
console.log("=======================");
console.log("Do arquivo JSON baixado, você precisa:");
console.log("- project_id");
console.log("- private_key_id");
console.log("- private_key");
console.log("- client_email");
console.log("- client_id");

console.log("\n📝 EXEMPLO DE CONFIGURAÇÃO:");
console.log("===========================");
console.log(`
FIREBASE_PROJECT_ID=copia-do-job
FIREBASE_PRIVATE_KEY_ID=abc123def456...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@copia-do-job.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
`);

console.log("\n🚀 APÓS OBTER AS CREDENCIAIS:");
console.log("=============================");
console.log("1. Edite o arquivo: config-temporario-copia-do-job.env");
console.log("2. Substitua os valores YOUR_... pelas credenciais reais");
console.log("3. Execute: node test-connection.js");
console.log("4. Se OK, execute: node server-hybrid.js");

console.log("\n💡 ALTERNATIVA RÁPIDA:");
console.log("======================");
console.log("Se você já tem credenciais do copia-do-job:");
console.log("1. Copie o arquivo de credenciais existente");
console.log("2. Renomeie para: config-firebase-mongodb.env");
console.log("3. Teste a conexão");

console.log("\n⚠️ IMPORTANTE:");
console.log("==============");
console.log("• Use credenciais do copia-do-job apenas temporariamente");
console.log("• Depois migre para mansao-do-job");
console.log("• Mantenha as credenciais seguras");
console.log("• Não commite credenciais no Git");









