# 🎯 Guia de Uso - Sistema de População com Níveis

## ✅ Sistema Implementado com Sucesso!

O sistema foi criado e testado com sucesso, gerando **1.215 anúncios** distribuídos conforme suas especificações:

### 📊 Distribuição Implementada

| Nível | Quantidade por Categoria | Total Geral | Características |
|-------|-------------------------|-------------|-----------------|
| **N1** | 29 anúncios | 145 anúncios | Premium VIP, fotos em destaque, preços 2x |
| **N3** | 15 anúncios | 75 anúncios | Destaque rotativo, preços 1.5x |
| **N5** | 0 anúncios | 0 anúncios | Não utilizado conforme especificação |
| **N7** | 199 anúncios | 995 anúncios | Padrão, preços base |

### 🎨 Categorias Implementadas

- ✅ **Mulheres** (A_02__premium.html) - 243 anúncios
- ✅ **Massagistas** (A_03__massagistas.html) - 243 anúncios  
- ✅ **Trans** (A_04__trans.html) - 243 anúncios
- ✅ **Homens** (A_05__homens.html) - 243 anúncios
- ✅ **Webcam** (A_06__webcam.html) - 243 anúncios

### 📸 Stories Implementados

- ✅ **TODOS** os 1.215 anunciantes têm fotos para stories
- ✅ Campo `foto_stories` obrigatório em todos os anúncios
- ✅ 86 fotos disponíveis na pasta `/fotinha/fotos`

## 🚀 Como Usar o Sistema

### 1. Demonstração (Sem Firebase)
```bash
cd backend
node demo-population.js
```
**Resultado**: Gera arquivo `demo-anuncios.json` com 1.215 anúncios

### 2. População Real (Com Firebase)
```bash
cd backend
./run-population.sh
```
**Pré-requisito**: Arquivo `config.env` configurado com credenciais Firebase

### 3. Verificação
```bash
cd backend
node verify-population.js
```
**Resultado**: Relatório detalhado da população

## 📁 Arquivos Criados

| Arquivo | Função |
|---------|--------|
| `populate-with-levels.js` | Script principal de população |
| `verify-population.js` | Script de verificação |
| `demo-population.js` | Demonstração sem Firebase |
| `run-population.sh` | Script de execução |
| `README-POPULACAO.md` | Documentação técnica |
| `GUIA-USO-POPULACAO.md` | Este guia |

## 🎯 Características Especiais Implementadas

### 💎 Níveis Premium
- **N1**: Preços 2x mais altos, disponibilidade 24h, prioridade máxima
- **N3**: Preços 1.5x mais altos, disponibilidade 14h-00h, prioridade alta
- **N7**: Preços base, disponibilidade 15h-01h, visibilidade padrão

### 📸 Sistema de Stories
- Todos os anúncios têm campo `foto_stories` preenchido
- Fotos selecionadas aleatoriamente da pasta `/fotinha/fotos`
- Compatível com sistema de stories do frontend

### 🏷️ Sistema de Destaques
- N1 e N3 automaticamente marcados como `destaque: true`
- N1 marcado como `premium: true`
- Compatível com sistema de destaques premium

## 📊 Resultados da Demonstração

```
🎉 Demonstração concluída!
📊 Total de anúncios criados: 1215
📁 Dados salvos em: demo-anuncios.json

📸 Anúncios com fotos para stories: 1215/1215
✅ Todos os anúncios têm fotos para stories!

💎 Verificação de destaques:
N1 com destaque: 145/145
N3 com destaque: 75/75
✅ Todos os N1 e N3 estão marcados como destaque!
```

## 🔧 Configuração para Produção

### 1. Configurar Firebase
Edite o arquivo `config.env`:
```env
FIREBASE_PROJECT_ID=seu-projeto-firebase
FIREBASE_PRIVATE_KEY_ID=sua-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
```

### 2. Executar População
```bash
cd backend
./run-population.sh
```

### 3. Verificar Resultados
```bash
node verify-population.js
```

## 🎨 Integração com Frontend

### Páginas que Usam os Dados
- `A_02__premium.html` - Anúncios N1 em destaque premium
- `A_03__massagistas.html` - Massagistas com rodízio N3
- `A_04__trans.html` - Trans com todos os níveis
- `A_05__homens.html` - Homens com todos os níveis
- `A_06__webcam.html` - Webcam com todos os níveis

### API Endpoints
- `GET /api/anuncios` - Lista todos os anúncios
- `GET /api/anuncios?categoria=mulheres` - Filtra por categoria
- `GET /api/anuncios?nivel=N1` - Filtra por nível

## ✅ Verificações Automáticas

O sistema verifica automaticamente:
- ✅ Quantidade correta por categoria e nível
- ✅ Todos os anúncios têm fotos para stories
- ✅ N1 e N3 estão marcados como destaque
- ✅ Preços diferenciados por nível
- ✅ Status ativo e verificado
- ✅ Distribuição correta entre categorias

## 🎯 Próximos Passos

1. **Configure suas credenciais Firebase** no arquivo `config.env`
2. **Execute a população real** com `./run-population.sh`
3. **Verifique os resultados** com `node verify-population.js`
4. **Teste o frontend** para confirmar que os dados aparecem corretamente
5. **Ajuste conforme necessário** editando os arquivos de configuração

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do script
2. Execute a verificação
3. Consulte a documentação técnica
4. Verifique as configurações do Firebase

---

**🎉 Sistema implementado com sucesso! Todos os 1.215 anúncios foram gerados conforme suas especificações.**












