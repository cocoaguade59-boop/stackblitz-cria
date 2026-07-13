#!/usr/bin/env python3
"""
Fase 4H: extrae el Bloque 8 (dTileC - tiles de cueva/castillo/torre)
a src/render/tiles-cave-castle.js.

Es la última función de dibujo pixel-art del proyecto. Después de esta,
script.js queda ~9700 líneas y no contiene código de render.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "script.js").read_text(encoding="utf-8")
lines = SRC.split("\n")


def slice_lines(a, b):
    return "\n".join(lines[a - 1:b])


# Rango: líneas 244-1060 (function dTileC ... } // fin dTileC)
body = slice_lines(244, 1060)

header = (
    "// Tiles de mapas cerrados: cuevas, castillo y torre (Bloque 8 original).\n"
    "//\n"
    "// Export único: dTileC(c, r, map)\n"
    "//\n"
    "// El parámetro `map` es la matriz de tiles del mapa activo\n"
    "// (cave1, cave2, castMap o towerMap). El tile se dibuja según su\n"
    "// tipo con un switch grande de casos pixel-art.\n"
)

imports = (
    "import { cx } from '../core/canvas.js';\n"
    "import { px, pixelGlow } from './render-utils.js';\n"
    "import { fr } from '../core/frame.js';\n"
    "import { T, cam } from '../core/world-constants.js';"
)

exports = "export { dTileC };\n"

out = ROOT / "src/render/tiles-cave-castle.js"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(header + "\n" + imports + "\n\n" + body + "\n\n" + exports, encoding="utf-8")
print(f"✅ Wrote {out.relative_to(ROOT)}  ({len(body.splitlines())} lines)")
