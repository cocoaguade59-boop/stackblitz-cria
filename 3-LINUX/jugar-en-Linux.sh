#!/bin/bash
# Criaturas del Reino - Lanzador para Linux
cd "$(dirname "$0")/.." || exit 1

echo
echo " ============================================"
echo "   CRIATURAS DEL REINO - Iniciando..."
echo " ============================================"
echo

if [ ! -f "dist-app/index.html" ]; then
  echo " No encuentro el juego compilado. Intentando compilarlo..."
  command -v npm >/dev/null 2>&1 || { echo " Falta Node.js (https://nodejs.org)"; exit 1; }
  npm install && npm run build:app || { echo " Falle la compilacion."; exit 1; }
fi

echo " Abriendo el juego..."
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "dist-app/index.html"
elif command -v gio >/dev/null 2>&1; then
  gio open "dist-app/index.html"
else
  echo " Abri manualmente: $(pwd)/dist-app/index.html"
fi
