@echo off
title Mansao do Job - Servidor Funcionando

echo.
echo 🚀 MANSÃO DO JOB - SERVIDOR FUNCIONANDO
echo =======================================
echo.

REM Verificar se já está rodando
netstat -an | find "8080" >nul
if %errorlevel% == 0 (
    echo ✅ Servidor já está rodando!
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

echo 🌐 Iniciando servidor Python...
echo 📁 Diretório: frontend/src
echo 🔧 Porta: 8080
echo.

REM Navegar para o diretório correto
cd /d "%~dp0frontend\src"

echo 🚀 Iniciando servidor...
echo ✅ Servidor iniciado com sucesso!
echo 🌐 Acesse: http://localhost:8080
echo 📄 Página inicial: http://localhost:8080/A_01__index.html
echo.
echo 📋 Páginas disponíveis:
echo   🏠 Início: http://localhost:8080/A_01__index.html
echo   ⭐ Premium: http://localhost:8080/A_02__premium.html
echo   👥 Massagistas: http://localhost:8080/A_03__massagistas.html
echo   🏳️⚧️ Trans: http://localhost:8080/A_04__trans.html
echo   👨 Homens: http://localhost:8080/A_05__homens.html
echo   📹 Webcam: http://localhost:8080/A_06__webcam.html
echo   📝 Cadastro: http://localhost:8080/register.html
echo   🔧 Admin: http://localhost:8080/admin-login.html
echo.
echo 🔄 Para parar: Ctrl+C

REM Iniciar servidor Python
python -m http.server 8080

echo.
echo 🔚 Servidor encerrado
pause
