#!/bin/bash

# Array com os dados dos usuários
declare -a users=(
  "lolipop@gmail.com:zNtUUsRMW4N0bOMI1yAZw17KtNK2:Lolipop"
  "kika@gmail.com:mqPjghnCCRcw6MUDFsyO5iJ7qkC3:Kika"
  "fafa@gmail.com:ZjVn4bbh6RTmRUsCXM4tFSgDVtv1:Fafa"
  "kekel@gmail.com:aRRYDQr7JNhBlcUHEdGWROGMT6M2:Kekel"
  "bobboy@gmail.com:KNPE1OLDIWOq5uzx3QYgzgHPeml2:Bobboy"
  "dill@gmail.com:u7mzDvO1TcVcPC2Gf7Y0qG36yJJ3:Dill"
  "nina@gmail.com:MZK9xuoj2pZrKH3VOVrSCN2mRS83:Nina"
  "kaka@gmail.com:5sQjxwjmNHcKAAYXln1URpz0nWh2:Kaka"
  "lili@gmail.com:90wwDEi6BaVQUtVH0VPDKP1uVlN2:Lili"
  "dada@gmail.com:V5Ocnho53yUAgERie3fLGeEnIa22:Dada"
  "pepeu@gmail.com:x3la07rXlrcf8GsERSHRMe0lFG93:Pepeu"
)

# Criar anúncios para cada usuário
for user in "${users[@]}"; do
  IFS=':' read -r email uid nome <<< "$user"
  
  echo "Criando anúncio para $nome ($email)..."
  
  curl -X POST http://localhost:5001/api/anuncios \
    -H "Content-Type: application/json" \
    -d "{
      \"nome\": \"$nome\",
      \"email\": \"$email\",
      \"uid\": \"$uid\",
      \"cidade\": \"São Paulo\",
      \"estado\": \"SP\",
      \"nivel\": \"N1 - Premium VIP\",
      \"foto_capa\": \"https://via.placeholder.com/300x400/FFB6C1/FFFFFF?text=$nome\",
      \"preco_1h\": \"R$ 800\",
      \"status\": \"Ativo\",
      \"categoria\": \"mulher\",
      \"premium\": true,
      \"destaque\": true,
      \"visibilidade\": \"pagina_premium\"
    }" > /dev/null 2>&1
  
  echo "✅ $nome criado"
  sleep 1
done

echo "🎉 Todos os anúncios foram criados!"
