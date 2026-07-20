#!/usr/bin/env python3
"""
Fase 4C: extrae el Bloque 3 (Sprite del Jugador) a src/render/player-sprite.js.

Un solo módulo, un solo export externo (dPlayerGBA), el resto es privado
al módulo (const HERO_*, heroImg, heroReady, dPlayerChibi00s,
dPlayerGBAFallback, dPlayerBig).
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "game.js").read_text(encoding="utf-8")
lines = SRC.split("\n")


def slice_lines(a, b):
    return "\n".join(lines[a - 1:b])


# El Bloque 3 va desde el banner "// BLOQUE 3: SPRITE DEL JUGADOR" hasta
# justo antes del banner del Bloque 4A. Verificamos rangos:
#   199: // BLOQUE 3: SPRITE DEL JUGADOR
#   200: // ============================================================
#   201: (vacío)
#   202-583: contenido del bloque
#   584: // BLOQUE 4A: SPRITES NPCs MAPA - ALDEAS

# Extraemos desde línea 202 (después del banner) hasta 582 (antes del banner Bloque 4A).
# Necesitamos ser cuidadosos: dPlayerBig termina en 582 (línea 583 es el banner "===").
body = slice_lines(202, 582)

header = (
    "// Sprite del jugador (protagonista del juego).\n"
    "//\n"
    "// El PNG del prota está embebido como base64 (HERO_B64), un spritesheet\n"
    "// medieval de OpenGameArt (\"2D RPG character walk\" por arikel,\n"
    "// licencia CC-BY 4.0 / CC0). 8 columnas x 4 filas, cada frame 24x32.\n"
    "//\n"
    "// Export único: dPlayerGBA (dibuja el prota en (x, y) mirando en dir).\n"
    "// Todo lo demás es interno al módulo.\n"
)

imports = (
    "import { cx } from '../core/canvas.js';\n"
    "import { px } from './render-utils.js';\n"
    "import { G } from '../core/game-state.js';\n"
    "import { SK } from './skin-colors.js';"
)

exports = "export { dPlayerGBA };\n"

out = ROOT / "src/render/player-sprite.js"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(header + "\n" + imports + "\n\n" + body + "\n\n" + exports, encoding="utf-8")
print(f"✅ Wrote {out.relative_to(ROOT)}  ({len(body.splitlines())} lines)")
