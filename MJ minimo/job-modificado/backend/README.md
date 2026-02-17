# Backend API - Mansão do Job

API backend para conectar com MongoDB Atlas e fornecer dados para o frontend.

## 🚀 Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar MongoDB Atlas

1. Copie `config.example.js` para `config.js`
2. Ajuste a URI do MongoDB Atlas no arquivo `config.js`
3. Certifique-se de que o cluster está acessível

### 3. Executar o servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📊 Estrutura dos Dados

### Schema do Anúncio

```javascript
{
  nome: String,           // Nome da pessoa
  category: String,       // "mulher", "homem", etc.
  categoria: String,      // "acompanhantes", "massagem", etc.
  status: String,         // "active", "inactive", etc.
  foto_capa: String,      // URL da foto de capa
  foto_stories: String,   // URL da foto do stories
  galeria_1: String,      // URL da primeira foto da galeria
  galeria_2: String,      // URL da segunda foto da galeria
  // ... até galeria_8
  images: [String],       // Array de URLs de imagens
  cidade: String,         // Cidade
  estado: String,         // Estado
  preco_30min: String,    // Preço para 30 minutos
  preco_45min: String,    // Preço para 45 minutos
  preco_1h: String,       // Preço para 1 hora
  audioUrl: String,       // URL do arquivo de áudio
  descricao: String,      // Descrição do anúncio
  idade: String,          // Idade
  peso: String,           // Peso
  altura: String,         // Altura
  // Adicione outros campos conforme necessário
}
```

## 🔗 Endpoints

### GET /api/advertisements

Lista todos os anúncios ou filtra por parâmetros.

**Parâmetros de query:**

- `category` - Filtrar por categoria
- `categoria` - Filtrar por subcategoria
- `status` - Filtrar por status

**Exemplo:**

```
GET /api/advertisements?category=mulher&categoria=acompanhantes&status=active
```

### GET /api/advertisements/:id

Busca um anúncio específico por ID.

### POST /api/advertisements

Cria um novo anúncio.

### PUT /api/advertisements/:id

Atualiza um anúncio existente.

### DELETE /api/advertisements/:id

Deleta um anúncio.

### GET /api/test

Testa se a API está funcionando.

## 🧪 Testando a API

### 1. Testar se está funcionando

```bash
curl http://localhost:3000/api/test
```

### 2. Listar todos os anúncios

```bash
curl http://localhost:3000/api/advertisements
```

### 3. Filtrar anúncios

```bash
curl "http://localhost:3000/api/advertisements?category=mulher&categoria=acompanhantes&status=active"
```

## 🔧 Ajustes Necessários

1. **URI do MongoDB Atlas**: Ajuste no arquivo `config.js`
2. **Schema**: Modifique conforme a estrutura dos seus dados no Atlas
3. **Filtros**: Ajuste os filtros conforme suas necessidades
4. **CORS**: Configure se necessário para produção

## 📝 Logs

A API gera logs detalhados no console:

- ✅ Sucessos
- ❌ Erros
- 🔍 Filtros aplicados
- 📊 Quantidade de resultados

## 🚨 Troubleshooting

### Erro de conexão com MongoDB

- Verifique se a URI está correta
- Confirme se o cluster está acessível
- Verifique as credenciais

### CORS Error

- Configure o CORS_ORIGIN no config.js
- Certifique-se de que o frontend está na URL correta

### Dados não aparecem

- Verifique se os dados existem no Atlas
- Confirme se os nomes dos campos estão corretos
- Use o endpoint `/api/test` para verificar a conexão
