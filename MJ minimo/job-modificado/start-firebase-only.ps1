# Script para iniciar o servidor FIREBASE ONLY - copia-do-job
# Este script inicia o ambiente usando APENAS Firebase como banco de dados

Write-Host "🚀 Iniciando servidor FIREBASE ONLY - copia-do-job" -ForegroundColor Green
Write-Host "🔥 Banco de dados: Firebase Firestore (ÚNICO)" -ForegroundColor Cyan
Write-Host "⚠️  ATENÇÃO: Este é um ambiente de TESTE isolado!" -ForegroundColor Yellow
Write-Host ""

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Navegar para o diretório backend
Set-Location "backend"

# Verificar se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Verificar se o arquivo de configuração Firebase-only existe
if (-not (Test-Path "config-firebase-only.env")) {
    Write-Host "❌ Arquivo config-firebase-only.env não encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar se as credenciais do Firebase estão configuradas
$configContent = Get-Content "config-firebase-only.env" -Raw
if ($configContent -match "SUBSTITUIR_PELO_SEU") {
    Write-Host "⚠️  ATENÇÃO: Credenciais do Firebase não configuradas!" -ForegroundColor Yellow
    Write-Host "📝 Configure as credenciais no arquivo config-firebase-only.env" -ForegroundColor Yellow
    Write-Host "🔗 Acesse: https://console.firebase.google.com/u/0/project/copia-do-job/overview" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pressione qualquer tecla para continuar mesmo assim..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host ""
Write-Host "🎯 Iniciando servidor Firebase-only na porta 5001..." -ForegroundColor Green
Write-Host "🔗 Acesse: http://localhost:5001" -ForegroundColor Cyan
Write-Host "📊 Projeto: copia-do-job" -ForegroundColor Cyan
Write-Host "🌍 Ambiente: test" -ForegroundColor Cyan
Write-Host "🔥 Banco: Firebase Firestore" -ForegroundColor Cyan
Write-Host "❌ MongoDB: DESABILITADO" -ForegroundColor Red
Write-Host ""

# Iniciar o servidor Firebase-only
node server-firebase-only.js