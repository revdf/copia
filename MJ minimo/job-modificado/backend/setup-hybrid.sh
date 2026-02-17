#!/bin/bash

# ===== SETUP HÍBRIDO: Firebase + MongoDB Atlas =====
# Script para configurar o servidor híbrido

echo "🚀 Configurando servidor HÍBRIDO Firebase + MongoDB Atlas..."

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 2. Verificar se o arquivo de configuração existe
if [ ! -f "config-firebase-mongodb.env" ]; then
    echo "❌ Arquivo config-firebase-mongodb.env não encontrado!"
    echo "📝 Criando arquivo de configuração..."
    
    # Copiar do exemplo
    cp config.env.example config-firebase-mongodb.env
    echo "✅ Arquivo config-firebase-mongodb.env criado"
    echo "⚠️  IMPORTANTE: Configure suas credenciais no arquivo config-firebase-mongodb.env"
fi

# 3. Verificar configurações
echo "🔍 Verificando configurações..."

# Verificar Firebase
if grep -q "FIREBASE_PROJECT_ID=copia-do-job" config-firebase-mongodb.env; then
    echo "✅ Firebase configurado"
else
    echo "⚠️  Firebase precisa ser configurado"
fi

# Verificar MongoDB
if grep -q "MONGODB_URI=mongodb+srv://" config-firebase-mongodb.env; then
    echo "✅ MongoDB URI configurado"
else
    echo "⚠️  MongoDB URI precisa ser configurado"
fi

echo ""
echo "🎯 CONFIGURAÇÃO CONCLUÍDA!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Configure suas credenciais no arquivo config-firebase-mongodb.env"
echo "2. Execute: npm run hybrid"
echo "3. Teste: curl http://localhost:5001/api/test"
echo ""
echo "🔧 COMANDOS DISPONÍVEIS:"
echo "  npm run hybrid     - Iniciar servidor híbrido"
echo "  npm run firebase-only - Iniciar apenas Firebase"
echo "  npm run dev        - Desenvolvimento com nodemon"
echo ""
echo "✅ Setup concluído com sucesso!"
