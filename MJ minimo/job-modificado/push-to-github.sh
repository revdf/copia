#!/bin/bash

# 🚀 Script para fazer push do projeto Mansão do Job para o GitHub
# ================================================================

echo "🔥 Mansão do Job - Push para GitHub"
echo "=================================="

# Verificar se estamos no diretório correto
if [ ! -f "FLUXO-NAVEGACAO-COMPLETO.txt" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar status do Git
echo "📊 Verificando status do Git..."
git status --porcelain

# Verificar se há commits para fazer push
if git diff --quiet HEAD origin/main 2>/dev/null; then
    echo "✅ Nenhuma alteração para fazer push"
    exit 0
fi

echo ""
echo "🔐 Configuração de Autenticação:"
echo "1. Token de Acesso Pessoal (mais fácil)"
echo "2. SSH Key (mais seguro)"
echo "3. Sair"
echo ""

read -p "Escolha uma opção (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📝 Para usar Token de Acesso:"
        echo "1. Acesse: https://github.com/settings/tokens"
        echo "2. Gere um novo token com permissão 'repo'"
        echo "3. Cole o token abaixo:"
        echo ""
        read -s -p "Token: " token
        echo ""
        
        if [ -n "$token" ]; then
            echo "🔗 Configurando repositório com token..."
            git remote set-url origin https://$token@github.com/revdf/copia-do-JOB.git
            echo "🚀 Fazendo push..."
            git push -u origin main
        else
            echo "❌ Token não fornecido"
            exit 1
        fi
        ;;
    2)
        echo ""
        echo "🔑 Para usar SSH:"
        echo "1. Gere uma chave SSH: ssh-keygen -t ed25519 -C 'seu-email@exemplo.com'"
        echo "2. Adicione ao GitHub: https://github.com/settings/ssh/new"
        echo "3. Teste a conexão: ssh -T git@github.com"
        echo ""
        read -p "Pressione Enter quando estiver pronto..."
        
        echo "🔗 Configurando repositório SSH..."
        git remote set-url origin git@github.com:revdf/copia-do-JOB.git
        echo "🚀 Fazendo push..."
        git push -u origin main
        ;;
    3)
        echo "👋 Saindo..."
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Push concluído!"
echo "🌐 Verifique no GitHub: https://github.com/revdf/copia-do-JOB"
