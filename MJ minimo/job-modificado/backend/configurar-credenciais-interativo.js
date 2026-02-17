#!/usr/bin/env node

// configurar-credenciais-interativo.js
// Script interativo para configurar credenciais do Firebase

import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log("🔑 CONFIGURADOR INTERATIVO DE CREDENCIAIS");
console.log("==========================================");

console.log("\n📋 INSTRUÇÕES:");
console.log("==============");
console.log("1. Acesse: https://console.firebase.google.com/u/0/project/copia-do-job/settings/serviceaccounts/adminsdk");
console.log("2. Clique em 'Gerar nova chave privada'");
console.log("3. Baixe o arquivo JSON");
console.log("4. Abra o arquivo JSON e copie os valores abaixo");

console.log("\n🔧 VAMOS CONFIGURAR AS CREDENCIAIS:");
console.log("===================================");

async function configurarCredenciais() {
  try {
    // Ler valores do usuário
    const projectId = await question("\n📝 Project ID (ex: copia-do-job): ");
    const privateKeyId = await question("📝 Private Key ID: ");
    const privateKey = await question("📝 Private Key (cole a chave completa): ");
    const clientEmail = await question("📝 Client Email: ");
    const clientId = await question("📝 Client ID: ");

    // Validar se todos os campos foram preenchidos
    if (!projectId || !privateKeyId || !privateKey || !clientEmail || !clientId) {
      console.log("\n❌ ERRO: Todos os campos são obrigatórios!");
      return;
    }

    // Formatar chave privada
    const formattedPrivateKey = privateKey
      .replace(/\\n/g, '\n')
      .replace(/"/g, '\\"');

    // Criar configuração
    const config = `# ===== CONFIGURAÇÃO FIREBASE - CREDENCIAIS REAIS =====
# Configurado em: ${new Date().toISOString()}

# ===== MONGODB ATLAS CONFIGURATION =====
MONGODB_URI=mongodb+srv://revdfucb_db_user:Maluko%21%401290RIKIprime@cluster0.mqcx7gb.mongodb.net/mansao_do_job?retryWrites=true&w=majority&appName=Cluster0&ssl=true&authSource=admin
MONGODB_DATABASE=mansao_do_job

# ===== SERVER CONFIGURATION =====
PORT=5001
NODE_ENV=development
PROJECT_NAME=${projectId}

# ===== JWT SECRET =====
JWT_SECRET=${projectId}_secret_key_2024

# ===== FIREBASE CONFIGURATION - CREDENCIAIS REAIS =====
FIREBASE_PROJECT_ID=${projectId}
FIREBASE_PRIVATE_KEY_ID=${privateKeyId}
FIREBASE_PRIVATE_KEY="${formattedPrivateKey}"
FIREBASE_CLIENT_EMAIL=${clientEmail}
FIREBASE_CLIENT_ID=${clientId}

# ===== FIREBASE WEB CONFIG =====
FIREBASE_API_KEY=AIzaSyCCU3l-J-7JrlWXKVlQJAit9VypIi7hn38
FIREBASE_AUTH_DOMAIN=${projectId}.firebaseapp.com
FIREBASE_STORAGE_BUCKET=${projectId}.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=606628146135
FIREBASE_APP_ID=1:606628146135:web:b374ed2678d20991577992

# ===== SYNC CONFIGURATION =====
SYNC_ENABLED=true
SYNC_INTERVAL=30000
SYNC_BATCH_SIZE=100
SYNC_REAL_TIME=true

# ===== CACHE CONFIGURATION =====
CACHE_ENABLED=true
CACHE_TTL=300000
CACHE_MAX_SIZE=1000

# ===== LOGGING CONFIGURATION =====
LOG_LEVEL=debug
LOG_TO_FILE=true
LOG_FILE_PATH=./logs/server.log

# ===== SECURITY CONFIGURATION =====
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:5500,http://127.0.0.1:5500
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# ===== BACKUP CONFIGURATION =====
BACKUP_ENABLED=true
BACKUP_INTERVAL=86400000
BACKUP_RETENTION_DAYS=7
BACKUP_PATH=./backups

# ===== MONITORING CONFIGURATION =====
MONITORING_ENABLED=true
HEALTH_CHECK_INTERVAL=30000
METRICS_ENABLED=true`;

    // Fazer backup do arquivo atual
    const configPath = './config-firebase-mongodb.env';
    if (fs.existsSync(configPath)) {
      const backupPath = `./config-firebase-mongodb.env.backup.${Date.now()}`;
      fs.copyFileSync(configPath, backupPath);
      console.log(`\n📁 Backup criado: ${backupPath}`);
    }

    // Salvar nova configuração
    fs.writeFileSync(configPath, config);
    console.log(`\n✅ Configuração salva em: ${configPath}`);

    console.log("\n🧪 TESTANDO CONFIGURAÇÃO:");
    console.log("=========================");
    console.log("Execute: node test-connection.js");

    console.log("\n🚀 INICIANDO BACKEND:");
    console.log("=====================");
    console.log("Execute: node server-hybrid.js");

    console.log("\n🎯 RESULTADO ESPERADO:");
    console.log("======================");
    console.log("✅ Firebase Admin inicializado com sucesso");
    console.log("✅ Firestore conectado");
    console.log("✅ MongoDB conectado");
    console.log("✅ Backend rodando na porta 5001");

  } catch (error) {
    console.log("\n❌ ERRO:", error.message);
  } finally {
    rl.close();
  }
}

configurarCredenciais();









