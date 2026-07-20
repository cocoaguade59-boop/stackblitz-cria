#!/usr/bin/env python3
"""
Fase 4G: extrae el Bloque 7 (dTileW - tiles del mundo) a
src/render/tiles-world.js.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "game.js").read_text(encoding="utf-8")
lines = SRC.split("\n")


def slice_lines(a, b):
    return "\n".join(lines[a - 1:b])


# Rango: líneas 240-1066 (lerpColor + drawWorldDecorBase + dTileW)
body = slice_lines(240, 1066)

header = (
    "// Tiles del mapa del mundo exterior (Bloque 7 original).\n"
    "//\n"
    "// Exporta:\n"
    "//   - dTileW(c, r): dibuja el tile en la columna c, fila r del mapa\n"
    "//   - lerpColor(a, b, t): utilidad para interpolar dos colores hex\n"
    "//   - drawWorldDecorBase(c, r, x, y): decoración base (arbustos, flores)\n"
)

imports = (
    "import { cx } from '../core/canvas.js';\n"
    "import { px, pixelGlow } from './render-utils.js';\n"
    "import { dShadow } from './world-decor.js';\n"
    "import { fr } from '../core/frame.js';\n"
    "import { T, cam, wMap } from '../core/world-constants.js';"
)

exports = "export { dTileW, lerpColor, drawWorldDecorBase };\n"

out = ROOT / "src/render/tiles-world.js"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(header + "\n" + imports + "\n\n" + body + "\n\n" + exports, encoding="utf-8")
print(f"✅ Wrote {out.relative_to(ROOT)}  ({len(body.splitlines())} lines)")
