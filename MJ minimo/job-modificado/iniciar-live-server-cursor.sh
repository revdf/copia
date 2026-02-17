#!/bin/bash

# iniciar-live-server-cursor.sh
# Script para iniciar Live Server no Cursor

echo "🚀 INICIANDO LIVE SERVER PARA CURSOR"
echo "====================================="

# Verificar se já está rodando
if lsof -i :8080 > /dev/null 2>&1; then
    echo "✅ Live Server já está rodando na porta 8080"
    echo "🌐 Acesse: http://localhost:8080"
    echo "📄 Página inicial: http://localhost:8080/A_01__index.html"
    exit 0
fi

# Verificar se live-server está instalado globalmente
if command -v live-server &> /dev/null; then
    echo "✅ Live Server encontrado globalmente"
    echo "🌐 Iniciando Live Server..."
    
    cd frontend/src
    live-server --port=8080 --open=A_01__index.html --cors=true --wait=1000
    
elif command -v python3 &> /dev/null; then
    echo "⚠️ Live Server não encontrado, usando Python"
    echo "🌐 Iniciando servidor Python..."
    
    cd frontend/src
    echo "✅ Servidor Python iniciado na porta 8080"
    echo "🌐 Acesse: http://localhost:8080"
    echo "📄 Página inicial: http://localhost:8080/A_01__index.html"
    echo "🔄 Para parar: Ctrl+C"
    
    python3 -m http.server 8080
    
else
    echo "❌ Nem Live Server nem Python encontrados"
    echo "💡 Soluções:"
    echo "1. Instalar Live Server: npm install -g live-server"
    echo "2. Instalar Python: brew install python3"
    echo "3. Usar o Live Server que já está rodando: http://localhost:8080"
fi









