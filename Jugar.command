#!/bin/bash
# ============================================================
#  Criaturas del Reino - Lanzador para macOS
#  Doble clic y jugar. No necesita internet ni instalar nada.
# ============================================================
cd "$(dirname "$0")" || exit 1

if [ ! -f "dist-app/index.html" ]; then
  echo "No encuentro el juego compilado."
  echo "Intentando compilarlo (necesita Node.js instalado)..."
  if ! command -v npm >/dev/null 2>&1; then
    echo ""
    echo " Falta Node.js. Instalalo desde https://nodejs.org y volvé a intentar."
    echo " Alternativa: pedime el archivo index.html ya compilado."
    read -r -p "Enter para cerrar..."
    exit 1
  fi
  npm install && npm run build:app || { echo "Falló la compilación."; read -r -p "Enter..."; exit 1; }
fi

open "dist-app/index.html"
