#!/bin/bash

clear
echo "═══════════════════════════════════════════════════════════"
echo "  🔧 CONFIGURAÇÃO AUTOMÁTICA DO FIRESTORE"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Verificar login
echo "🔐 Verificando autenticação..."
if ! firebase projects:list &>/dev/null; then
    echo ""
    echo "⚠️  Você precisa fazer login no Firebase."
    echo "📱 Um navegador será aberto para você fazer login."
    echo "   (Use a mesma conta Google do Firebase Console)"
    echo ""
    read -p "Pressione ENTER para continuar com o login..."
    firebase login
    echo ""
fi

# Verificar se está logado agora
if ! firebase projects:list &>/dev/null; then
    echo "❌ Login falhou. Tente novamente."
    exit 1
fi

echo "✅ Autenticado com sucesso!"
echo ""

# Configurar projeto
echo "📦 Configurando projeto: mansao-do-job"
firebase use mansao-do-job 2>/dev/null || firebase use --add mansao-do-job
echo ""

# Verificar arquivos
if [ ! -f "firestore.rules" ]; then
    echo "❌ Arquivo firestore.rules não encontrado!"
    exit 1
fi

if [ ! -f "firebase.json" ]; then
    echo "📝 Criando firebase.json..."
    cat > firebase.json << 'JSONEOF'
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
JSONEOF
fi

# Publicar regras
echo "🚀 Publicando regras do Firestore..."
echo "   (Isso pode levar alguns segundos...)"
echo ""

firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  ✅ ✅ ✅ SUCESSO! ✅ ✅ ✅"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "As regras do Firestore foram publicadas com sucesso!"
    echo ""
    echo "📱 Próximos passos:"
    echo "   1. Abra a página: A_02__premium_copy.html"
    echo "   2. Recarregue a página (F5 ou Cmd+R)"
    echo "   3. Os dados do Firebase devem aparecer agora!"
    echo ""
else
    echo ""
    echo "❌ Erro ao publicar as regras."
    echo "Verifique se você tem permissões no projeto Firebase."
    exit 1
fi


