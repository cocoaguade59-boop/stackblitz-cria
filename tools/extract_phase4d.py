#!/usr/bin/env python3
"""
Fase 4D: extrae el Bloque 4A (Sprites de NPCs del mapa) a
src/render/npc-sprites.js.

Es una sola función gigante `dNPC(x, y, id, f)` con un switch(id)
que dibuja 37 NPCs distintos, cada uno pixel a pixel.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "script.js").read_text(encoding="utf-8")
lines = SRC.split("\n")


def slice_lines(a, b):
    return "\n".join(lines[a - 1:b])


# Rango: líneas 211-1600 (function dNPC ... } // fin dNPC)
body = slice_lines(211, 1600)

header = (
    "// Sprites de NPCs del mapa (aldeas, castillo, torre, cueva).\n"
    "//\n"
    "// Una sola función `dNPC(x, y, id, f)` con un switch (id) que dibuja\n"
    "// cada NPC pixel a pixel. Actualmente hay ~37 NPCs implementados.\n"
    "//\n"
    "// Para agregar un NPC nuevo: añadir un nuevo case al switch.\n"
)

imports = (
    "import { cx } from '../core/canvas.js';\n"
    "import { px } from './render-utils.js';\n"
    "import { SK } from './skin-colors.js';\n"
    "import { dShadow } from './world-decor.js';"
)

# Nota: 'fr' se pasa como parámetro `f` a dNPC, no se importa.
# Ver script.js: llamadas tipo dNPC(x, y, 'id', fr).

exports = "export { dNPC };\n"

out = ROOT / "src/render/npc-sprites.js"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(header + "\n" + imports + "\n\n" + body + "\n\n" + exports, encoding="utf-8")
print(f"✅ Wrote {out.relative_to(ROOT)}  ({len(body.splitlines())} lines)")
