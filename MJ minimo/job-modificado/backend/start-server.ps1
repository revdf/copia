# Script para iniciar o servidor backend
Write-Host "Iniciando servidor backend..." -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "Erro: package.json não encontrado. Execute este script no diretório backend." -ForegroundColor Red
    exit 1
}

# Verificar se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Verificar se o arquivo de configuração existe
if (-not (Test-Path "config.env")) {
    Write-Host "Erro: config.env não encontrado." -ForegroundColor Red
    exit 1
}

# Iniciar o servidor
Write-Host "Iniciando servidor na porta 5000..." -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

node src/server.js


















