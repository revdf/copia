#!/usr/bin/env node

// configurar-credenciais-automatico.js
// Script para configurar credenciais do mansao-do-job automaticamente

import fs from 'fs';

console.log("🔑 CONFIGURANDO CREDENCIAIS DO MANSAO-DO-JOB AUTOMATICAMENTE");
console.log("=============================================================");

// Configuração para mansao-do-job
const config = `# ===== CONFIGURAÇÃO MANSAO-DO-JOB - SISTEMA HÍBRIDO =====
# Configurado em: ${new Date().toISOString()}
# Projeto: mansao-do-job (Sistema híbrido Firebase + MongoDB)

# ===== MONGODB ATLAS CONFIGURATION =====
MONGODB_URI=mongodb+srv://revdfucb_db_user:Maluko%21%401290RIKIprime@cluster0.mqcx7gb.mongodb.net/mansao_do_job?retryWrites=true&w=majority&appName=Cluster0&ssl=true&authSource=admin
MONGODB_DATABASE=mansao_do_job

# ===== SERVER CONFIGURATION =====
PORT=5001
NODE_ENV=production
PROJECT_NAME=mansao-do-job

# ===== JWT SECRET =====
JWT_SECRET=mansao_do_job_production_secret_key_2024

# ===== FIREBASE CONFIGURATION - MANSAO-DO-JOB =====
# ⚠️ IMPORTANTE: Você precisa gerar credenciais reais do mansao-do-job
# 1. Acesse: https://console.firebase.google.com/u/0/project/mansao-do-job/settings/serviceaccounts/adminsdk
# 2. Clique em 'Gerar nova chave privada'
# 3. Baixe o arquivo JSON
# 4. Substitua os valores abaixo pelos valores reais do JSON

FIREBASE_PROJECT_ID=mansao-do-job
FIREBASE_PRIVATE_KEY_ID=SUBSTITUIR_PELO_PRIVATE_KEY_ID_REAL_DO_MANSAO_DO_JOB
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nSUBSTITUIR_PELA_PRIVATE_KEY_REAL_DO_MANSAO_DO_JOB\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@mansao-do-job.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=SUBSTITUIR_PELO_CLIENT_ID_REAL_DO_MANSAO_DO_JOB

# ===== FIREBASE WEB CONFIG =====
FIREBASE_API_KEY=AIzaSyCCU3l-J-7JrlWXKVlQJAit9VypIi7hn38
FIREBASE_AUTH_DOMAIN=mansao-do-job.firebaseapp.com
FIREBASE_STORAGE_BUCKET=mansao-do-job.firebasestorage.app
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

try {
  // Fazer backup do arquivo atual
  const configPath = './config-firebase-mongodb.env';
  if (fs.existsSync(configPath)) {
    const backupPath = `./config-firebase-mongodb.env.backup.${Date.now()}`;
    fs.copyFileSync(configPath, backupPath);
    console.log(`📁 Backup criado: ${backupPath}`);
  }

  // Salvar nova configuração
  fs.writeFileSync(configPath, config);
  console.log(`✅ Configuração salva em: ${configPath}`);

  console.log("\n🔧 PRÓXIMOS PASSOS:");
  console.log("===================");
  console.log("1. Acesse: https://console.firebase.google.com/u/0/project/mansao-do-job/settings/serviceaccounts/adminsdk");
  console.log("2. Clique em 'Gerar nova chave privada'");
  console.log("3. Baixe o arquivo JSON");
  console.log("4. Edite o arquivo: backend/config-firebase-mongodb.env");
  console.log("5. Substitua os valores SUBSTITUIR_... pelas credenciais reais");

  console.log("\n📋 VALORES PARA SUBSTITUIR:");
  console.log("===========================");
  console.log("• SUBSTITUIR_PELO_PRIVATE_KEY_ID_REAL_DO_MANSAO_DO_JOB");
  console.log("• SUBSTITUIR_PELA_PRIVATE_KEY_REAL_DO_MANSAO_DO_JOB");
  console.log("• SUBSTITUIR_PELO_CLIENT_ID_REAL_DO_MANSAO_DO_JOB");

  console.log("\n🧪 APÓS CONFIGURAR AS CREDENCIAIS:");
  console.log("===================================");
  console.log("1. node test-connection.js");
  console.log("2. node server-hybrid.js");

  console.log("\n🎯 RESULTADO ESPERADO:");
  console.log("======================");
  console.log("✅ Firebase Admin inicializado com sucesso");
  console.log("✅ Firestore conectado");
  console.log("✅ MongoDB conectado");
  console.log("✅ Backend rodando na porta 5001");
  console.log("✅ Sistema híbrido mansao-do-job funcionando");

} catch (error) {
  console.log("\n❌ ERRO:", error.message);
}









