#!/usr/bin/env python3
"""
Fase 4F: extrae el Bloque 6A (dCre - sprites de las 59 criaturas)
a src/render/creature-sprites.js.

Es la función más grande del proyecto: switch(id) con casos pixel-art
para cada criatura del CDB.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "script.js").read_text(encoding="utf-8")
lines = SRC.split("\n")


def slice_lines(a, b):
    return "\n".join(lines[a - 1:b])


# Rango: líneas 230-2863 (function dCre ... } // fin dCre)
body = slice_lines(230, 2863)

header = (
    "// Sprites de las 59 criaturas del juego (Bloque 6A original).\n"
    "//\n"
    "// Una sola función `dCre(x, y, id, lv, f)` con un switch (id) que\n"
    "// dibuja cada criatura pixel a pixel. Cada caso puede usar SPRITE_LOADER\n"
    "// para cargar un PNG si está disponible (ver Knightapple/hydrapom).\n"
    "//\n"
    "// Para agregar una criatura nueva: añadir un case al switch.\n"
    "// Para reemplazar el sprite pixel-art por PNG: agregar el patrón\n"
    "// if (SPRITE_LOADER.has('<id>')) { drawImage } else { pixel-art }\n"
)

imports = (
    "import { cx } from '../core/canvas.js';\n"
    "import { px, pixelGlow } from './render-utils.js';\n"
    "import { dShadow } from './world-decor.js';\n"
    "import { SPRITE_LOADER } from '../core/sprite-loader.js';\n"
    "import { fr } from '../core/frame.js';\n"
    "import { tCol, tEmo } from '../data/types.js';"
)

exports = "export { dCre };\n"

out = ROOT / "src/render/creature-sprites.js"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(header + "\n" + imports + "\n\n" + body + "\n\n" + exports, encoding="utf-8")
print(f"✅ Wrote {out.relative_to(ROOT)}  ({len(body.splitlines())} lines)")
