@echo off
REM ============================================================
REM  Criaturas del Reino - Lanzador para Windows
REM  Doble clic y jugar. No necesita internet ni instalar nada.
REM ============================================================
setlocal
cd /d "%~dp0"

if exist "dist-app\index.html" goto PLAY

echo No encuentro el juego compilado.
echo Intentando compilarlo (necesita Node.js instalado una sola vez)...
where npm >nul 2>nul
if errorlevel 1 goto NONODE

call npm install
call npm run build:app
if errorlevel 1 goto FAIL

:PLAY
start "" "dist-app\index.html"
goto END

:NONODE
echo.
echo  Falta Node.js y el juego no esta compilado todavia.
echo  Opcion 1: instala Node.js desde https://nodejs.org y volve a intentar.
echo  Opcion 2: pedime el archivo "index.html" ya compilado.
echo.
pause
goto END

:FAIL
echo.
echo  No se pudo compilar. Revisa los mensajes de arriba.
pause

:END
endlocal
