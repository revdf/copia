#!/usr/bin/env node

// iniciar-live-server-vscode.js
// Script otimizado para iniciar Live Server no VS Code

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log("🚀 INICIANDO LIVE SERVER OTIMIZADO PARA VS CODE");
console.log("================================================");

// Verificar se o arquivo de configuração existe
const configPath = path.join(__dirname, 'live-server-otimizado.json');
if (!fs.existsSync(configPath)) {
  console.log("❌ Arquivo de configuração não encontrado:", configPath);
  process.exit(1);
}

console.log("✅ Configuração encontrada:", configPath);

// Verificar se live-server está instalado
const liveServerPath = path.join(__dirname, 'node_modules', '.bin', 'live-server');
if (!fs.existsSync(liveServerPath)) {
  console.log("⚠️ Live Server não encontrado. Instalando...");
  
  const installProcess = spawn('npm', ['install', 'live-server', '--save-dev'], {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  installProcess.on('close', (code) => {
    if (code === 0) {
      console.log("✅ Live Server instalado com sucesso!");
      iniciarLiveServer();
    } else {
      console.log("❌ Erro ao instalar Live Server");
      process.exit(1);
    }
  });
} else {
  iniciarLiveServer();
}

function iniciarLiveServer() {
  console.log("\n🌐 Iniciando Live Server...");
  console.log("📁 Diretório raiz: frontend/src");
  console.log("🌍 URL: http://localhost:8080");
  console.log("📄 Página inicial: A_01__index.html");
  console.log("🔄 Proxy API: /api -> http://localhost:5001");
  
  // Iniciar Live Server com configuração otimizada
  const liveServer = spawn('live-server', [
    '--config=live-server-otimizado.json'
  ], {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  liveServer.on('error', (error) => {
    console.error("❌ Erro ao iniciar Live Server:", error.message);
    console.log("\n💡 Soluções:");
    console.log("1. Instalar Live Server: npm install -g live-server");
    console.log("2. Verificar se a porta 8080 está livre");
    console.log("3. Executar como administrador se necessário");
  });
  
  liveServer.on('close', (code) => {
    console.log(`\n🔚 Live Server encerrado com código: ${code}`);
  });
  
  // Tratar interrupção (Ctrl+C)
  process.on('SIGINT', () => {
    console.log("\n\n🛑 Encerrando Live Server...");
    liveServer.kill('SIGINT');
    process.exit(0);
  });
  
  console.log("\n✅ Live Server iniciado com sucesso!");
  console.log("🌐 Acesse: http://localhost:8080");
  console.log("🔄 Para parar: Ctrl+C");
}









