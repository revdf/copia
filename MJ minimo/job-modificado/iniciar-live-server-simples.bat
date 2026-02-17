@echo off
title Mansao do Job - Live Server

echo.
echo 🚀 MANSÃO DO JOB - LIVE SERVER
echo ==============================
echo.

REM Verificar se já está rodando
netstat -an | find "8080" >nul
if %errorlevel% == 0 (
    echo ✅ Live Server já está rodando!
    echo 🌐 Acesse: http://localhost:8080
    echo 📄 Página inicial: http://localhost:8080/A_01__index.html
    echo.
    echo 📋 Páginas disponíveis:
    echo   🏠 Início: http://localhost:8080/A_01__index.html
    echo   ⭐ Premium: http://localhost:8080/A_02__premium.html
    echo   👥 Massagistas: http://localhost:8080/A_03__massagistas.html
    echo   🏳️⚧️ Trans: http://localhost:8080/A_04__trans.html
    echo   👨 Homens: http://localhost:8080/A_05__homens.html
    echo   📝 Cadastro: http://localhost:8080/register.html
    echo   🔧 Admin: http://localhost:8080/admin-login.html
    echo.
    pause
    exit /b 0
)

REM Verificar se backend está rodando
netstat -an | find "5001" >nul
if %errorlevel% neq 0 (
    echo ⚠️  Backend não está rodando na porta 5001
    echo 💡 Inicie o backend primeiro:
    echo    cd backend ^&^& node simple-server.js
    echo.
    echo 🔄 Ou continue sem backend (funcionalidades limitadas)
    echo.
    set /p continuar="Continuar mesmo assim? (s/n): "
    if /i not "%continuar%"=="s" exit /b 1
)

echo 🌐 Iniciando Live Server...
echo 📁 Diretório: frontend/src
echo 🔧 Configuração: live-server-otimizado.json
echo.

REM Navegar para o diretório correto
cd /d "%~dp0frontend\src"

REM Iniciar Live Server com configuração otimizada
echo 🚀 Iniciando...
live-server --config=..\live-server-otimizado.json

echo.
echo 🔚 Live Server encerrado
pause

