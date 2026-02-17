# 🏗️ Nova Arquitetura - Mansão do Job

## 📋 Visão Geral

Esta é a nova arquitetura do projeto **Mansão do Job**, implementando a estratégia **Firebase + MongoDB** conforme discutido:

- **Firebase**: Repositório principal (dados sensíveis + mídia)
- **MongoDB**: Banco público para o site (dados otimizados)
- **Sincronização**: Cloud Functions mantêm os dois sistemas em sync

## 🎯 Objetivos da Nova Arquitetura

### ✅ Vantagens
- **Segurança**: Dados sensíveis isolados no Firebase
- **Performance**: MongoDB otimizado para consultas públicas
- **Escalabilidade**: Suporte a 5.000+ anunciantes
- **Custo**: Otimização de custos de storage e egress
- **Manutenção**: Separação clara de responsabilidades

### 📊 Estimativas do Cenário
- **5.000 anunciantes** até dezembro
- **~9 fotos** por anunciante (6-12)
- **10% com vídeos** (até 3 vídeos de 30s)
- **10% com áudios** (1-2 áudios de 30s)
- **Total**: ~33GB de mídia

## 🏛️ Estrutura da Arquitetura

### 🔐 Firebase (Repositório Principal)
```
Firebase Auth
├── Autenticação de usuários
├── Verificação de email
└── Gerenciamento de sessões

Firestore
├── advertisers/ (dados sensíveis)
├── advertiser_content/ (conteúdo dos anúncios)
├── clients/ (dados dos clientes)
├── admin_users/ (administradores)
└── payments/ (histórico de pagamentos)

Firebase Storage
├── documents/ (CPF, RG, selfies)
├── media/ (fotos, vídeos, áudios)
└── thumbnails/ (miniaturas otimizadas)
```

### 🗄️ MongoDB (Banco Público)
```
Collections
├── advertisers (dados públicos dos anunciantes)
├── clients (dados públicos dos clientes)
├── categories (categorias de anunciantes)
├── favorites (favoritos dos clientes)
├── views (visualizações para analytics)
├── contacts (contatos realizados)
├── ratings (avaliações)
├── search_logs (logs de busca)
└── site_stats (estatísticas gerais)
```

## 🚀 Como Implementar

### 1. Configuração do Firebase

```bash
# Instalar Firebase Admin SDK
npm install firebase-admin

# Configurar variáveis de ambiente
cp config.env.example config.env
# Editar config.env com suas credenciais do Firebase
```

### 2. Configuração do MongoDB

```bash
# Instalar dependências
npm install mongoose

# Configurar conexão
# MONGODB_URI=mongodb://localhost:27017/mansao_do_job
```

### 3. Executar Migração

```bash
# Migrar dados existentes
npm run migrate

# Ou executar manualmente
node scripts/migrate-to-firebase-mongodb.js
```

### 4. Sincronização

```bash
# Sincronização completa
npm run sync

# Ou via API
POST /api/sync/full
```

## 📁 Estrutura de Arquivos

```
backend/
├── src/
│   ├── models/           # Novos modelos MongoDB
│   │   ├── AdvertiserPublic.js
│   │   ├── ClientPublic.js
│   │   ├── Favorite.js
│   │   ├── View.js
│   │   ├── Contact.js
│   │   ├── Category.js
│   │   └── SiteStats.js
│   ├── services/         # Serviços de sincronização
│   │   ├── firebaseService.js
│   │   └── firebaseSyncService.js
│   ├── controllers/      # Controllers
│   │   └── syncController.js
│   └── routes/          # Rotas
│       └── sync.js
├── scripts/             # Scripts de migração
│   └── migrate-to-firebase-mongodb.js
├── schemas/             # Documentação dos esquemas
│   ├── firebase-schema.md
│   └── mongodb-schema.md
└── config.env.example   # Exemplo de configuração
```

## 🔄 Fluxo de Sincronização

### 1. Cadastro de Anunciante
```
Usuário se cadastra → Firebase Auth
↓
Dados pessoais → Firestore (advertisers)
↓
Upload de mídia → Firebase Storage
↓
Metadados → Firestore (advertiser_content)
↓
Aprovação → Cloud Function
↓
Sincronização → MongoDB (dados públicos)
```

### 2. Atualização de Conteúdo
```
Anunciante atualiza → Firestore
↓
Cloud Function detecta mudança
↓
Sincronização automática → MongoDB
↓
Site público atualizado
```

### 3. Pagamento
```
Pagamento confirmado → Webhook
↓
Atualização do plano → Firestore
↓
Sincronização → MongoDB
↓
Visibilidade atualizada no site
```

## 🛠️ APIs Disponíveis

### Sincronização
```javascript
// Sincronização completa
POST /api/sync/full

// Sincronizar anunciantes
POST /api/sync/advertisers
POST /api/sync/advertiser/:uid

// Sincronizar clientes
POST /api/sync/clients
POST /api/sync/client/:uid

// Webhook de pagamento
POST /api/sync/payment-webhook

// Status da sincronização
GET /api/sync/status
```

### Dados Públicos (MongoDB)
```javascript
// Buscar anunciantes
GET /api/advertisers?category=WOMEN&location=São Paulo

// Buscar por texto
GET /api/advertisers/search?q=massagem

// Anunciantes em destaque
GET /api/advertisers/featured

// Estatísticas
GET /api/stats/daily
GET /api/stats/categories
```

## 📊 Monitoramento

### Métricas Importantes
- **Sincronização**: Tempo entre Firebase e MongoDB
- **Performance**: Queries no MongoDB
- **Storage**: Uso do Firebase Storage
- **Custos**: Egress do Firebase, operações MongoDB

### Logs
```javascript
// Logs de sincronização
console.log('Sincronizando anunciante:', uid);
console.log('Sincronização concluída:', stats);

// Logs de erro
console.error('Erro na sincronização:', error);
```

## 🔧 Manutenção

### Tarefas Diárias
```bash
# Gerar estatísticas diárias
POST /api/sync/generate-stats

# Verificar status da sincronização
GET /api/sync/status
```

### Tarefas Semanais
```bash
# Sincronização completa
POST /api/sync/full

# Atualizar estatísticas das categorias
POST /api/sync/init-categories
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Sincronização falhando**
   - Verificar credenciais do Firebase
   - Verificar conexão com MongoDB
   - Verificar logs de erro

2. **Dados não aparecem no site**
   - Verificar se está sincronizado
   - Verificar se `isPublic: true`
   - Verificar se `isActive: true`

3. **Performance lenta**
   - Verificar índices do MongoDB
   - Verificar queries otimizadas
   - Verificar cache

### Comandos de Debug
```bash
# Verificar conexão MongoDB
node test_mongodb_connection.js

# Verificar status da sincronização
curl http://localhost:5000/api/sync/status

# Forçar sincronização
curl -X POST http://localhost:5000/api/sync/full
```

## 📈 Próximos Passos

1. **Implementar Cloud Functions** para sincronização automática
2. **Configurar CDN** para otimizar entrega de mídia
3. **Implementar cache** Redis para queries frequentes
4. **Configurar monitoramento** com métricas detalhadas
5. **Implementar backup** automático dos dados

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verificar logs de erro
2. Consultar documentação dos esquemas
3. Testar sincronização manual
4. Verificar configurações do Firebase e MongoDB

---

**Versão**: 2.0.0  
**Data**: Janeiro 2024  
**Arquitetura**: Firebase + MongoDB  
**Status**: ✅ Implementado
