@echo off
REM 🚀 Script para fazer push do projeto Mansão do Job para o GitHub
REM ================================================================

echo 🔥 Mansão do Job - Push para GitHub
echo ==================================

REM Verificar se estamos no diretório correto
if not exist "FLUXO-NAVEGACAO-COMPLETO.txt" (
    echo ❌ Erro: Execute este script no diretório raiz do projeto
    pause
    exit /b 1
)

REM Verificar status do Git
echo 📊 Verificando status do Git...
git status --porcelain

echo.
echo 🔐 Configuração de Autenticação:
echo 1. Token de Acesso Pessoal (mais fácil)
echo 2. SSH Key (mais seguro)
echo 3. Sair
echo.

set /p choice="Escolha uma opção (1-3): "

if "%choice%"=="1" (
    echo.
    echo 📝 Para usar Token de Acesso:
    echo 1. Acesse: https://github.com/settings/tokens
    echo 2. Gere um novo token com permissão 'repo'
    echo 3. Cole o token abaixo:
    echo.
    set /p token="Token: "
    
    if not "%token%"=="" (
        echo 🔗 Configurando repositório com token...
        git remote set-url origin https://%token%@github.com/revdf/copia-do-JOB.git
        echo 🚀 Fazendo push...
        git push -u origin main
    ) else (
        echo ❌ Token não fornecido
        pause
        exit /b 1
    )
) else if "%choice%"=="2" (
    echo.
    echo 🔑 Para usar SSH:
    echo 1. Gere uma chave SSH: ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
    echo 2. Adicione ao GitHub: https://github.com/settings/ssh/new
    echo 3. Teste a conexão: ssh -T git@github.com
    echo.
    pause
    
    echo 🔗 Configurando repositório SSH...
    git remote set-url origin git@github.com:revdf/copia-do-JOB.git
    echo 🚀 Fazendo push...
    git push -u origin main
) else if "%choice%"=="3" (
    echo 👋 Saindo...
    exit /b 0
) else (
    echo ❌ Opção inválida
    pause
    exit /b 1
)

echo.
echo ✅ Push concluído!
echo 🌐 Verifique no GitHub: https://github.com/revdf/copia-do-JOB
pause
