#!/bin/bash
# ============================================================
#  Criaturas del Reino - Lanzador para Linux
#  Uso: ./jugar.sh   (o doble clic si tu escritorio lo permite)
# ============================================================
cd "$(dirname "$0")" || exit 1

if [ ! -f "dist-app/index.html" ]; then
  echo "No encuentro el juego compilado. Compilando..."
  command -v npm >/dev/null 2>&1 || { echo "Falta Node.js (https://nodejs.org)"; exit 1; }
  npm install && npm run build:app || { echo "Falló la compilación."; exit 1; }
fi

# Abre con el navegador por defecto
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "dist-app/index.html"
elif command -v gio >/dev/null 2>&1; then
  gio open "dist-app/index.html"
else
  echo "Abrí manualmente: $(pwd)/dist-app/index.html"
fi
