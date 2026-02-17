# Script de Teste de Páginas de Cadastro

Este script testa automaticamente todas as páginas de cadastro, preenche todos os campos e captura os dados que serão salvos.

## Instalação

1. Instale o Puppeteer:
```bash
cd backend
npm install puppeteer
```

## Como usar

1. Certifique-se de que o Live Server está rodando na porta 5500
2. Execute o script usando npm:
```bash
npm run test-cadastros
```

Ou diretamente:
```bash
node test-cadastro-pages.js
```

## O que o script faz

- ✅ Navega por todas as páginas de cadastro listadas
- ✅ Preenche todos os campos de texto, email, telefone, etc.
- ✅ Seleciona todas as opções de dropdowns
- ✅ Marca todos os checkboxes disponíveis
- ✅ Marca os primeiros radio buttons de cada grupo
- ✅ Preenche textareas com texto completo
- ✅ Abre todos os accordions para acessar campos internos
- ✅ Captura todos os dados do formulário antes do envio
- ✅ Intercepta requisições HTTP para capturar dados enviados
- ✅ Salva tudo em um arquivo `dados-cadastros-testados.txt`

## Observações

- O script NÃO envia os formulários de fato (não clica no botão submit)
- Fotos, áudios e vídeos são ignorados (não são preenchidos)
- O navegador será aberto em modo visível para você acompanhar o processo
- Os resultados são salvos em `backend/dados-cadastros-testados.txt`

## Páginas testadas

1. Seleção de Categoria
2. Mulher + Acompanhantes
3. Mulher + Massagistas
4. Mulher + Sexo Virtual
5. Trans + Acompanhantes
6. Trans + Massagistas
7. Homem + Acompanhantes
8. Homem + Massagistas
9. Mulher de Luxo + Acompanhantes
10. Mulher de Luxo + Massagistas

