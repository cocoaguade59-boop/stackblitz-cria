#!/usr/bin/env python3
"""
Fase 4E: extrae el Bloque 5 (dTrainerBig - sprites grandes de entrenadores
para intro de batalla) a src/render/trainer-big-sprites.js.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "game.js").read_text(encoding="utf-8")
lines = SRC.split("\n")


def slice_lines(a, b):
    return "\n".join(lines[a - 1:b])


# Rango: líneas 220-1419 (function dTrainerBig ... } // fin dTrainerBig)
body = slice_lines(220, 1419)

header = (
    "// Sprites grandes de entrenadores para la intro de batalla NPC.\n"
    "//\n"
    "// Una sola función `dTrainerBig(x, y, id, f)` con un switch (id)\n"
    "// que dibuja versiones grandes (para la escena de intro previa\n"
    "// al combate) de los entrenadores importantes del juego.\n"
    "//\n"
    "// Solo se usa cuando aparece la banda 'Se acerca X!' antes de un combate NPC.\n"
)

imports = (
    "import { cx } from '../core/canvas.js';\n"
    "import { px } from './render-utils.js';\n"
    "import { SK } from './skin-colors.js';"
)

exports = "export { dTrainerBig };\n"

out = ROOT / "src/render/trainer-big-sprites.js"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(header + "\n" + imports + "\n\n" + body + "\n\n" + exports, encoding="utf-8")
print(f"✅ Wrote {out.relative_to(ROOT)}  ({len(body.splitlines())} lines)")
