# Mansão do Job

Sistema de gerenciamento de anúncios e serviços.

## Requisitos

- Python 3.8+
- Node.js 18+
- PostgreSQL 13+
- Angular CLI

## Configuração do Ambiente

### Backend (Django)

1. Crie um ambiente virtual Python:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\activate  # Windows
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

3. Configure o banco de dados PostgreSQL:
- Crie um banco de dados chamado 'mansaodojob'
- Atualize as credenciais no arquivo settings.py

4. Execute as migrações:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Crie um superusuário:
```bash
python manage.py createsuperuser
```

6. Inicie o servidor Django:
```bash
python manage.py runserver
```

### Frontend (Angular)

1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
ng serve
```

## Estrutura do Projeto

```
mansaodojob/
├── backend/
│   ├── core/
│   │   ├── models.py
│   │   ├── views.py
│   │   └── ...
│   ├── mansaodojob_backend/
│   │   ├── settings.py
│   │   └── ...
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── ...
│   └── package.json
└── README.md
```

## Funcionalidades

- Sistema de autenticação e autorização
- Gerenciamento de anúncios (Premium e Luxo)
- Upload de mídia (fotos, vídeos, áudios)
- Sistema de mensagens
- Painel administrativo
- Gerenciamento de lojas e serviços

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes. 