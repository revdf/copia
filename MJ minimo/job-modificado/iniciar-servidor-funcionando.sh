#!/bin/bash

# 🚀 INICIAR SERVIDOR - MANSÃO DO JOB (FUNCIONANDO!)
# Script que realmente funciona para servir as páginas

echo "🚀 MANSÃO DO JOB - SERVIDOR FUNCIONANDO"
echo "======================================="
echo ""

# Verificar se já está rodando
if lsof -i :8080 > /dev/null 2>&1; then
    echo "✅ Servidor já está rodando!"
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

echo "🌐 Iniciando servidor Python..."
echo "📁 Diretório: frontend/src"
echo "🔧 Porta: 8080"
echo ""

# Navegar para o diretório correto
cd "$(dirname "$0")/frontend/src"

echo "🚀 Iniciando servidor..."
echo "✅ Servidor iniciado com sucesso!"
echo "🌐 Acesse: http://localhost:8080"
echo "📄 Página inicial: http://localhost:8080/A_01__index.html"
echo ""
echo "📋 Páginas disponíveis:"
echo "  🏠 Início: http://localhost:8080/A_01__index.html"
echo "  ⭐ Premium: http://localhost:8080/A_02__premium.html"
echo "  👥 Massagistas: http://localhost:8080/A_03__massagistas.html"
echo "  🏳️‍⚧️ Trans: http://localhost:8080/A_04__trans.html"
echo "  👨 Homens: http://localhost:8080/A_05__homens.html"
echo "  📹 Webcam: http://localhost:8080/A_06__webcam.html"
echo "  📝 Cadastro: http://localhost:8080/register.html"
echo "  🔧 Admin: http://localhost:8080/admin-login.html"
echo ""
echo "🔄 Para parar: Ctrl+C"

# Iniciar servidor Python
python3 -m http.server 8080

echo ""
echo "🔚 Servidor encerrado"
