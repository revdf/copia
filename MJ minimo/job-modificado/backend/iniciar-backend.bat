@echo off
title Backend Server - Mansao do Job
color 0A
echo.
echo ========================================
echo    BACKEND SERVER - MANSAO DO JOB
echo ========================================
echo.
echo Iniciando servidor...
echo.
echo Servidor rodando em: http://localhost:5000
echo API Test: http://localhost:5000/api/test
echo.
echo Para parar o servidor, pressione Ctrl+C
echo ========================================
echo.

node src/server.js

echo.
echo Servidor parado.
pause

















