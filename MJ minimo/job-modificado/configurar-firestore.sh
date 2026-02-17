#!/bin/bash

echo "🔧 Configurando Firestore Rules Automaticamente..."
echo ""

# Verificar se está logado
if ! firebase projects:list &>/dev/null; then
    echo "⚠️  Você precisa fazer login no Firebase primeiro."
    echo "📱 Abrindo navegador para login..."
    firebase login --no-localhost
    echo ""
    echo "✅ Login concluído! Continuando..."
    echo ""
fi

# Verificar se o projeto está configurado
if [ ! -f ".firebaserc" ]; then
    echo "📦 Configurando projeto Firebase..."
    firebase use mansao-do-job --add
    echo ""
fi

# Verificar se firebase.json existe
if [ ! -f "firebase.json" ]; then
    echo "📝 Criando firebase.json..."
    cat > firebase.json << EOF
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
EOF
    echo "✅ firebase.json criado!"
    echo ""
fi

# Verificar se firestore.rules existe
if [ ! -f "firestore.rules" ]; then
    echo "❌ Arquivo firestore.rules não encontrado!"
    exit 1
fi

echo "🚀 Publicando regras do Firestore..."
echo ""

# Publicar as regras
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ✅ ✅ SUCESSO! ✅ ✅ ✅"
    echo ""
    echo "As regras do Firestore foram publicadas com sucesso!"
    echo "Agora os dados devem aparecer na página A_02__premium_copy.html"
    echo ""
else
    echo ""
    echo "❌ Erro ao publicar as regras."
    echo "Verifique se você tem permissões no projeto Firebase."
    exit 1
fi


