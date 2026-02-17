#!/bin/bash

# Script para iniciar o servidor FIREBASE ONLY - copia-do-job
# Este script inicia o ambiente usando APENAS Firebase como banco de dados

echo "🚀 Iniciando servidor FIREBASE ONLY - copia-do-job"
echo "🔥 Banco de dados: Firebase Firestore (ÚNICO)"
echo "⚠️  ATENÇÃO: Este é um ambiente de TESTE isolado!"
echo ""

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js encontrado: $NODE_VERSION"

# Navegar para o diretório backend
cd backend

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se o arquivo de configuração Firebase-only existe
if [ ! -f "config-firebase-only.env" ]; then
    echo "❌ Arquivo config-firebase-only.env não encontrado!"
    exit 1
fi

# Verificar se as credenciais do Firebase estão configuradas
if grep -q "SUBSTITUIR_PELO_SEU" config-firebase-only.env; then
    echo "⚠️  ATENÇÃO: Credenciais do Firebase não configuradas!"
    echo "📝 Configure as credenciais no arquivo config-firebase-only.env"
    echo "🔗 Acesse: https://console.firebase.google.com/u/0/project/copia-do-job/overview"
    echo ""
    echo "Pressione Enter para continuar mesmo assim..."
    read
fi

echo ""
echo "🎯 Iniciando servidor Firebase-only na porta 5001..."
echo "🔗 Acesse: http://localhost:5001"
echo "📊 Projeto: copia-do-job"
echo "🌍 Ambiente: test"
echo "🔥 Banco: Firebase Firestore"
echo "❌ MongoDB: DESABILITADO"
echo ""

# Iniciar o servidor Firebase-only
node server-firebase-only.js
















