# Mansão do Job

Sistema completo de gerenciamento de anúncios e serviços com frontend, backend e integração Firebase.

## 📋 Visão Geral

Este projeto é uma plataforma web para gerenciamento de anúncios e serviços, desenvolvida com tecnologias modernas incluindo Firebase, Node.js, e PostgreSQL.

## 🏗️ Estrutura do Projeto

```
copia/
├── S-COPIA-S/
│   ├── job-modificado/          # Projeto principal
│   │   ├── frontend/            # Frontend (HTML/CSS/JavaScript)
│   │   ├── backend/             # Backend (Node.js/Express/Firebase)
│   │   ├── functions/           # Firebase Cloud Functions
│   │   └── README.md            # Documentação do projeto principal
│   ├── database/                # Scripts SQL e documentação do banco
│   │   ├── 01_create_database.sql
│   │   ├── 02_insert_initial_data.sql
│   │   ├── 03_validation_functions.sql
│   │   ├── 04_views_and_queries.sql
│   │   └── README.md            # Documentação do banco de dados
│   └── app/                      # Validações e utilitários
│       └── validations/
└── README.md                     # Este arquivo
```

## 🚀 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Banco de Dados**: Firebase Firestore, PostgreSQL
- **Storage**: Firebase Storage
- **Autenticação**: Firebase Auth
- **Cloud Functions**: Firebase Functions

## 📚 Documentação

- **[Projeto Principal](S-COPIA-S/job-modificado/README.md)** - Documentação completa do projeto principal
- **[Banco de Dados](S-COPIA-S/database/README.md)** - Scripts SQL e documentação do banco de dados

## 🔧 Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- PostgreSQL 13+ (para banco de dados local)
- Conta Firebase configurada
- Git

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/revdf/copia.git
cd copia
```

2. Configure o Firebase:
   - Acesse o diretório `S-COPIA-S/job-modificado/`
   - Configure as credenciais do Firebase conforme a documentação

3. Configure o banco de dados:
   - Siga as instruções em `S-COPIA-S/database/README.md`

4. Instale as dependências:
```bash
cd S-COPIA-S/job-modificado/frontend
npm install

cd ../backend
npm install

cd ../functions
npm install
```

## 🎯 Funcionalidades Principais

- Sistema de autenticação e autorização
- Gerenciamento de anúncios (Premium e Luxo)
- Upload de mídia (fotos, vídeos, áudios)
- Sistema de mensagens
- Painel administrativo
- Gerenciamento de lojas e serviços
- Categorias: Premium, Massagistas, Trans, Homens, Webcam

## 🔐 Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite credenciais do Firebase
- Mantenha arquivos `.env` e `firebase-service-account.json` fora do controle de versão
- Revise o arquivo `.gitignore` antes de fazer commits

## 📝 Scripts Úteis

Os scripts de automação estão localizados em `S-COPIA-S/job-modificado/`:
- Scripts de inicialização do servidor
- Scripts de configuração do Firebase
- Scripts de push para GitHub

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🔗 Links

- Repositório: https://github.com/revdf/copia
- Documentação do Firebase: https://firebase.google.com/docs

---

**Desenvolvido com ❤️ para o projeto Mansão do Job**

