# Scripts de Banco de Dados - Mansão do Job

Este diretório contém todos os scripts SQL necessários para criar e configurar o banco de dados do sistema Mansão do Job.

## 📁 Estrutura dos Arquivos

```
database/
├── 01_create_database.sql      # Criação de tabelas, ENUMs, índices e triggers
├── 02_insert_initial_data.sql  # Dados iniciais (planos, configurações)
├── 03_validation_functions.sql # Funções de validação e helpers
├── 04_views_and_queries.sql   # Views e queries úteis
└── README.md                   # Este arquivo
```

## 🚀 Como Usar

### 1. Criar o Banco de Dados

```bash
# PostgreSQL
psql -U postgres -c "CREATE DATABASE mansao_do_job;"
psql -U postgres -d mansao_do_job -f 01_create_database.sql
```

### 2. Inserir Dados Iniciais

```bash
psql -U postgres -d mansao_do_job -f 02_insert_initial_data.sql
```

### 3. Criar Funções de Validação

```bash
psql -U postgres -d mansao_do_job -f 03_validation_functions.sql
```

### 4. Criar Views e Queries

```bash
psql -U postgres -d mansao_do_job -f 04_views_and_queries.sql
```

## 📋 Ordem de Execução

Execute os scripts na seguinte ordem:

1. ✅ `01_create_database.sql` - Primeiro (cria estrutura)
2. ✅ `02_insert_initial_data.sql` - Segundo (dados iniciais)
3. ✅ `03_validation_functions.sql` - Terceiro (funções)
4. ✅ `04_views_and_queries.sql` - Quarto (views)

## 🔧 Requisitos

- PostgreSQL 12 ou superior
- Extensão `uuid-ossp` (geralmente já incluída)
- Permissões para criar banco de dados, tabelas, funções e triggers

## 📊 Estrutura Criada

### Tabelas Principais
- `users` - Usuários (anunciantes, clientes, admins)
- `anuncios` - Anúncios
- `anuncio_massagista` - Dados específicos de massagistas
- `anuncio_acompanhante` - Dados específicos de acompanhantes
- `anuncio_fotos` - Fotos dos anúncios
- `anuncio_videos` - Vídeos dos anúncios
- `anuncio_audios` - Áudios dos anúncios
- `planos` - Planos de anúncio
- `pagamentos` - Pagamentos
- `anuncio_visualizacoes` - Estatísticas de visualização
- `anuncio_curtidas` - Curtidas e favoritos
- `anuncio_contatos` - Contatos realizados
- `mensagens_contato` - Mensagens de contato
- `configuracoes_sistema` - Configurações do sistema
- `user_preferencias` - Preferências dos usuários

### Tabelas de Junção (Many-to-Many)
- `anuncio_perfis`
- `anuncio_atende_em`
- `anuncio_periodos`
- `anuncio_formas_pagamento`
- `anuncio_especialidades`
- `anuncio_categorias`

## 🔐 Segurança

⚠️ **IMPORTANTE**: Antes de usar em produção:

1. Altere todas as senhas padrão
2. Configure backups automáticos
3. Revise permissões de usuários do banco
4. Configure SSL/TLS para conexões
5. Implemente rate limiting
6. Configure firewall

## 📝 Notas

- Todos os timestamps usam `NOW()` como default
- Triggers automáticos atualizam `updated_at` em todas as tabelas
- UUIDs são gerados automaticamente
- Índices foram criados para otimizar consultas frequentes

## 🐛 Troubleshooting

### Erro: "extension uuid-ossp does not exist"
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Erro: "permission denied"
Certifique-se de que o usuário tem permissões adequadas:
```sql
GRANT ALL PRIVILEGES ON DATABASE mansao_do_job TO seu_usuario;
```

### Erro: "relation already exists"
Se as tabelas já existem, você pode:
1. Dropar tudo e recriar (CUIDADO: apaga dados!)
2. Usar `IF NOT EXISTS` (não disponível em todas as versões)
3. Criar scripts de migração

## 📚 Documentação Adicional

Consulte:
- `PROMPT_CRIACAO_BANCO_DADOS.md` - Documentação completa
- `COMPARACAO_MODELOS_BANCO_DADOS.md` - Comparação de modelos
- `RECOMENDACAO_FINAL.md` - Recomendações de implementação

## ✅ Checklist Pós-Instalação

- [ ] Banco de dados criado
- [ ] Todas as tabelas criadas
- [ ] Dados iniciais inseridos (planos)
- [ ] Funções de validação criadas
- [ ] Views criadas
- [ ] Testar conexão da aplicação
- [ ] Configurar backups
- [ ] Revisar permissões

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs do PostgreSQL
2. Confirme que todos os scripts foram executados na ordem correta
3. Verifique permissões do usuário do banco
4. Consulte a documentação do PostgreSQL

---

**Boa sorte com a implementação! 🚀**



