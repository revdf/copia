#!/bin/bash

# Script para executar a população do banco com níveis N1, N3, N5, N7
# Autor: Sistema de População Automática
# Data: $(date)

echo "🚀 Iniciando população do banco de dados com níveis N1, N3, N5, N7..."
echo "📊 Especificações:"
echo "   - N1 (Premium VIP): 29 anúncios por categoria"
echo "   - N3 (Destaque): 15 anúncios por categoria"
echo "   - N5 (Intermediário): 0 anúncios (conforme especificação)"
echo "   - N7 (Padrão): 199 anúncios por categoria"
echo "   - Categorias: mulheres, massagistas, trans, homens, webcam"
echo "   - Total por categoria: 243 anúncios"
echo "   - Total geral: 1.215 anúncios"
echo ""

# Verificar se o arquivo de configuração existe
if [ ! -f "config.env" ]; then
    echo "❌ Arquivo config.env não encontrado!"
    echo "📝 Crie o arquivo config.env com as configurações do Firebase"
    exit 1
fi

# Verificar se as fotos existem
FOTOS_PATH="/Users/troll/Desktop/copia do job/fotinha/fotos"
if [ ! -d "$FOTOS_PATH" ]; then
    echo "❌ Pasta de fotos não encontrada: $FOTOS_PATH"
    exit 1
fi

FOTO_COUNT=$(find "$FOTOS_PATH" -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" | wc -l)
echo "📸 Fotos disponíveis: $FOTO_COUNT"

if [ $FOTO_COUNT -lt 50 ]; then
    echo "⚠️ Poucas fotos disponíveis ($FOTO_COUNT). Recomendado: pelo menos 50 fotos"
fi

echo ""
echo "🔄 Executando script de população..."
echo ""

# Executar o script
node populate-with-levels.js

echo ""
echo "✅ Script de população concluído!"
echo "🌐 Para verificar os resultados, acesse: http://localhost:5001/api/anuncios"












