#!/bin/bash

# 🔄 Script para SUBSTITUIR o GitHub (versão automática)
# =====================================================

echo "🔥 SUBSTITUINDO GITHUB - Mansão do Job"
echo "====================================="
echo ""
echo "⚠️  ATENÇÃO: Isso vai REMOVER o projeto Java do GitHub"
echo "⚠️  e SUBSTITUIR pelo projeto Mansão do Job"
echo ""

# Verificar se o token foi fornecido como parâmetro
if [ -n "$1" ]; then
    token="$1"
    echo "✅ Token fornecido via parâmetro"
else
    echo "📝 Cole o token que você criou no GitHub:"
    echo "   (Token de acesso pessoal)"
    echo ""
    read -s -p "Token: " token
    echo ""
fi

if [ -z "$token" ]; then
    echo "❌ Token não fornecido"
    echo ""
    echo "💡 Para usar: ./executar-substituicao.sh SEU_TOKEN_AQUI"
    exit 1
fi

echo ""
echo "🔗 Configurando repositório com token..."
git remote set-url origin https://$token@github.com/revdf/copia-do-JOB.git

echo "🚀 Substituindo COMPLETAMENTE o GitHub..."
echo "   (Removendo projeto Java e adicionando Mansão do Job)"
echo ""

git push origin main --force

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCESSO! GitHub substituído completamente!"
    echo "🌐 Verifique: https://github.com/revdf/copia-do-JOB"
    echo ""
    echo "📋 O que foi feito:"
    echo "   ❌ Removido: Projeto Java Spring Boot"
    echo "   ✅ Adicionado: Projeto Mansão do Job (Node.js/Frontend)"
    echo "   🔄 Repositórios agora separados"
else
    echo ""
    echo "❌ Erro no push. Verifique:"
    echo "   - Token está correto?"
    echo "   - Tem permissões no repositório?"
    echo "   - Conexão com internet?"
fi
