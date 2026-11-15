#!/bin/bash
# Criaturas del Reino - Lanzador para macOS
cd "$(dirname "$0")/.." || exit 1

echo
echo " ============================================"
echo "   CRIATURAS DEL REINO - Iniciando..."
echo " ============================================"
echo

if [ ! -f "dist-app/index.html" ]; then
  echo " No encuentro el juego compilado. Intentando compilarlo..."
  if ! command -v npm >/dev/null 2>&1; then
    echo ""
    echo " Falta Node.js. Instalalo desde https://nodejs.org"
    echo " Alternativa: pedime el archivo index.html ya compilado."
    read -r -p " Enter para cerrar..."
    exit 1
  fi
  npm install && npm run build:app || { echo " Falle la compilacion."; read -r -p " Enter..."; exit 1; }
fi

echo " Abriendo el juego en tu navegador..."
open "dist-app/index.html"
