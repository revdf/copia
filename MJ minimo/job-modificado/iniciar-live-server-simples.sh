#!/bin/bash

# 🚀 INICIAR LIVE SERVER - MANSÃO DO JOB
# Script super simples para usar o Live Server de maneira plena

echo "🚀 MANSÃO DO JOB - LIVE SERVER"
echo "=============================="
echo ""

# Verificar se já está rodando
if lsof -i :8080 > /dev/null 2>&1; then
    echo "✅ Live Server já está rodando!"
    echo "🌐 Acesse: http://localhost:8080"
    echo "📄 Página inicial: http://localhost:8080/A_01__index.html"
    echo ""
    echo "📋 Páginas disponíveis:"
    echo "  🏠 Início: http://localhost:8080/A_01__index.html"
    echo "  ⭐ Premium: http://localhost:8080/A_02__premium.html"
    echo "  👥 Massagistas: http://localhost:8080/A_03__massagistas.html"
    echo "  🏳️‍⚧️ Trans: http://localhost:8080/A_04__trans.html"
    echo "  👨 Homens: http://localhost:8080/A_05__homens.html"
    echo "  📝 Cadastro: http://localhost:8080/register.html"
    echo "  🔧 Admin: http://localhost:8080/admin-login.html"
    echo ""
    echo "🔄 Para parar: Ctrl+C no terminal onde está rodando"
    exit 0
fi

# Verificar se backend está rodando
if ! lsof -i :5001 > /dev/null 2>&1; then
    echo "⚠️  Backend não está rodando na porta 5001"
    echo "💡 Inicie o backend primeiro:"
    echo "   cd backend && node simple-server.js"
    echo ""
    echo "🔄 Ou continue sem backend (funcionalidades limitadas)"
    echo ""
    read -p "Continuar mesmo assim? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

echo "🌐 Iniciando Live Server..."
echo "📁 Diretório: frontend/src"
echo "🔧 Configuração: live-server-otimizado.json"
echo ""

# Navegar para o diretório correto
cd "$(dirname "$0")/frontend/src"

# Iniciar Live Server com configuração otimizada
echo "🚀 Iniciando..."
live-server --config=../live-server-otimizado.json

echo ""
echo "🔚 Live Server encerrado"

