# 🚀 Sistema de População com Níveis N1, N3, N5, N7

Este sistema popula o banco de dados Firebase com anúncios organizados por níveis conforme especificação.

## 📊 Especificações

### Níveis de Anúncios
- **N1 (Premium VIP)**: 29 anúncios por categoria
  - Destaque premium com fotos nos stories
  - Preços 2x mais altos
  - Disponibilidade 24h
  - Prioridade máxima

- **N3 (Destaque)**: 15 anúncios por categoria
  - Rodízio em página com destaque
  - Preços 1.5x mais altos
  - Disponibilidade 14h às 00h
  - Prioridade alta

- **N5 (Intermediário)**: 0 anúncios
  - Nível não utilizado conforme especificação

- **N7 (Padrão)**: 199 anúncios por categoria
  - Anúncios padrão para todas as páginas
  - Preços base
  - Disponibilidade 15h às 01h
  - Visibilidade padrão

### Categorias
- **mulheres** (A_02__premium.html)
- **massagistas** (A_03__massagistas.html)
- **trans** (A_04__trans.html)
- **homens** (A_05__homens.html)
- **webcam** (A_06__webcam.html)

### Totais
- **Por categoria**: 243 anúncios (29 + 15 + 0 + 199)
- **Total geral**: 1.215 anúncios (243 × 5 categorias)

## 🎯 Características Especiais

### Fotos para Stories
- ✅ **TODOS** os anunciantes têm fotos para stories
- Campo `foto_stories` obrigatório
- Fotos selecionadas aleatoriamente da pasta `/fotinha/fotos`

### Destaques Premium
- ✅ N1 e N3 são automaticamente marcados como `destaque: true`
- ✅ N1 é marcado como `premium: true`
- ✅ Fotos aparecem nos destaques premium

### Preços Diferenciados
- N1: Preços 2x mais altos
- N3: Preços 1.5x mais altos
- N7: Preços base

## 🚀 Como Usar

### 1. Executar População
```bash
cd backend
./run-population.sh
```

### 2. Verificar Resultados
```bash
node verify-population.js
```

### 3. Verificar via API
```bash
curl http://localhost:5001/api/anuncios
```

## 📁 Arquivos

- `populate-with-levels.js` - Script principal de população
- `verify-population.js` - Script de verificação
- `run-population.sh` - Script de execução
- `README-POPULACAO.md` - Esta documentação

## 🔧 Configuração

### Pré-requisitos
1. Arquivo `config.env` configurado
2. Pasta `/fotinha/fotos` com pelo menos 50 fotos
3. Firebase configurado e funcionando

### Estrutura de Dados

Cada anúncio contém:
```javascript
{
  // Dados básicos
  nome: "Nome do Anunciante",
  categoria: "mulheres|massagistas|trans|homens|webcam",
  nivel: "N1|N3|N5|N7",
  
  // Nível e destaque
  nivel_nome: "Premium VIP|Destaque|Intermediário|Padrão",
  destaque: true|false,
  premium: true|false,
  
  // Fotos (OBRIGATÓRIO para stories)
  foto_capa: "caminho/para/foto.jpg",
  foto_stories: "caminho/para/story.jpg", // OBRIGATÓRIO
  galeria_1: "caminho/para/galeria1.jpg",
  // ... galeria_2 até galeria_6
  
  // Preços
  preco_30min: "150",
  preco_45min: "200",
  preco_1h: "250",
  
  // Localização
  cidade: "Brasília",
  estado: "DF",
  bairro: "Asa Norte|Asa Sul|...",
  
  // Status
  ativo: true,
  verificado: true,
  
  // Metadados
  environment: "test",
  project: "copia-do-job",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## ✅ Verificações Automáticas

O script de verificação confirma:
- ✅ Quantidade correta por categoria e nível
- ✅ Todos os anúncios têm fotos para stories
- ✅ N1 e N3 estão marcados como destaque
- ✅ Preços diferenciados por nível
- ✅ Status ativo e verificado
- ✅ Distribuição correta entre categorias

## 🎨 Integração com Frontend

### Páginas que Usam os Dados
- `A_02__premium.html` - Anúncios N1 em destaque
- `A_03__massagistas.html` - Massagistas com rodízio N3
- `A_04__trans.html` - Trans com todos os níveis
- `A_05__homens.html` - Homens com todos os níveis
- `A_06__webcam.html` - Webcam com todos os níveis

### Stories
- Campo `foto_stories` usado para exibir stories
- Todos os anunciantes têm fotos para stories
- Stories aparecem em todas as páginas

## 🔄 Manutenção

### Adicionar Mais Anúncios
1. Editar `LEVELS_CONFIG` em `populate-with-levels.js`
2. Executar `./run-population.sh`
3. Verificar com `node verify-population.js`

### Alterar Distribuição
1. Modificar `EXPECTED_LEVELS` em `verify-population.js`
2. Ajustar `LEVELS_CONFIG` em `populate-with-levels.js`
3. Re-executar população

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do script
2. Executar verificação
3. Consultar esta documentação
4. Verificar configurações do Firebase












