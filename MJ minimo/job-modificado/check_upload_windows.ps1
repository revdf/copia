# Script para verificar e corrigir problemas de upload no Windows
Write-Host "🔍 Verificando configurações de upload..." -ForegroundColor Green

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o diretório backend existe
$backendDir = "backend"
if (Test-Path $backendDir) {
    Write-Host "✅ Diretório backend encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Diretório backend não encontrado" -ForegroundColor Red
    exit 1
}

# Verificar se o diretório uploads existe
$uploadsDir = "backend/uploads"
if (Test-Path $uploadsDir) {
    Write-Host "✅ Diretório uploads encontrado" -ForegroundColor Green
} else {
    Write-Host "📁 Criando diretório uploads..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $uploadsDir -Force
    Write-Host "✅ Diretório uploads criado" -ForegroundColor Green
}

# Verificar permissões do diretório uploads
try {
    $acl = Get-Acl $uploadsDir
    Write-Host "✅ Permissões do diretório uploads verificadas" -ForegroundColor Green
    Write-Host "   Proprietário: $($acl.Owner)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro ao verificar permissões: $($_.Exception.Message)" -ForegroundColor Red
}

# Verificar se as dependências estão instaladas
$packageJson = "backend/package.json"
if (Test-Path $packageJson) {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
    
    # Verificar se node_modules existe
    $nodeModules = "backend/node_modules"
    if (Test-Path $nodeModules) {
        Write-Host "✅ node_modules encontrado" -ForegroundColor Green
    } else {
        Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
        Set-Location $backendDir
        npm install
        Set-Location ..
        Write-Host "✅ Dependências instaladas" -ForegroundColor Green
    }
} else {
    Write-Host "❌ package.json não encontrado" -ForegroundColor Red
}

# Verificar se o MongoDB está rodando (opcional)
Write-Host "🔍 Verificando conexão com MongoDB..." -ForegroundColor Yellow
try {
    $mongoTest = node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/test').then(() => { console.log('MongoDB OK'); process.exit(0); }).catch(err => { console.log('MongoDB Error:', err.message); process.exit(1); });"
    Write-Host "✅ MongoDB está acessível" -ForegroundColor Green
} catch {
    Write-Host "⚠️ MongoDB não está acessível. Certifique-se de que está rodando." -ForegroundColor Yellow
}

# Executar verificação de permissões
Write-Host "🔍 Executando verificação de permissões..." -ForegroundColor Yellow
Set-Location $backendDir
node check_upload_permissions.js
Set-Location ..

Write-Host "✅ Verificação concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Para testar o upload:" -ForegroundColor Cyan
Write-Host "   1. Inicie o servidor: cd backend && npm start" -ForegroundColor White
Write-Host "   2. Abra: http://localhost:3000/frontend/src/test_upload.html" -ForegroundColor White
Write-Host "   3. Tente fazer upload de uma imagem pequena primeiro" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Se houver problemas:" -ForegroundColor Cyan
Write-Host "   - Verifique os logs do servidor" -ForegroundColor White
Write-Host "   - Teste com imagens menores que 5MB" -ForegroundColor White
Write-Host "   - Verifique se o Content-Type é multipart/form-data" -ForegroundColor White 