@echo off
REM 🔄 Script para SUBSTITUIR COMPLETAMENTE o GitHub
REM ================================================

echo 🔥 SUBSTITUINDO GITHUB - Mansão do Job
echo =====================================
echo.
echo ⚠️  ATENÇÃO: Isso vai REMOVER o projeto Java do GitHub
echo ⚠️  e SUBSTITUIR pelo projeto Mansão do Job
echo.

set /p confirmacao="Tem certeza? (digite 'SIM' para continuar): "

if not "%confirmacao%"=="SIM" (
    echo ❌ Operação cancelada
    pause
    exit /b 1
)

echo.
echo 📝 Cole o token que você criou no GitHub:
echo    (Token de acesso pessoal)
echo.
set /p token="Token: "

if "%token%"=="" (
    echo ❌ Token não fornecido
    pause
    exit /b 1
)

echo.
echo 🔗 Configurando repositório com token...
git remote set-url origin https://%token%@github.com/revdf/copia-do-JOB.git

echo 🚀 Substituindo COMPLETAMENTE o GitHub...
echo    (Removendo projeto Java e adicionando Mansão do Job)
echo.

git push origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCESSO! GitHub substituído completamente!
    echo 🌐 Verifique: https://github.com/revdf/copia-do-JOB
    echo.
    echo 📋 O que foi feito:
    echo    ❌ Removido: Projeto Java Spring Boot
    echo    ✅ Adicionado: Projeto Mansão do Job (Node.js/Frontend)
    echo    🔄 Repositórios agora separados
) else (
    echo.
    echo ❌ Erro no push. Verifique:
    echo    - Token está correto?
    echo    - Tem permissões no repositório?
    echo    - Conexão com internet?
)

pause
