@echo off
title Criaturas del Reino
setlocal
cd /d "%~dp0"
cd ..

echo.
echo  ============================================
echo    CRIATURAS DEL REINO - Iniciando...
echo  ============================================
echo.

if exist "dist-app\index.html" goto PLAY

echo  No encuentro el juego compilado (dist-app\index.html).
echo  Voy a intentar compilarlo. Necesita Node.js instalado.
echo.
where npm >nul 2>nul
if errorlevel 1 goto NONODE

call npm install
if errorlevel 1 goto FAIL
call npm run build:app
if errorlevel 1 goto FAIL

:PLAY
echo  Abriendo el juego en tu navegador...
start "" "dist-app\index.html"
timeout /t 2 >nul
goto END

:NONODE
echo.
echo  ------------------------------------------------------------
echo   Falta Node.js y el juego no vino compilado.
echo.
echo   Opcion 1: instala Node.js desde https://nodejs.org
echo             y volve a hacer doble clic en este archivo.
echo.
echo   Opcion 2: pedime el archivo "index.html" ya compilado.
echo  ------------------------------------------------------------
echo.
pause
goto END

:FAIL
echo.
echo  No se pudo compilar. Revisa los mensajes de arriba.
echo.
pause

:END
endlocal
