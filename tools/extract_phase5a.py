#!/usr/bin/env python3
"""
Fase 5A: extrae las pantallas iniciales (título, intro, starter) del game.js
a src/screens/.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "game.js").read_text(encoding="utf-8")
lines = SRC.split("\n")


def slice_lines(a, b):
    return "\n".join(lines[a - 1:b])


def write_module(path, header, imports, body, exports):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    text = header + "\n\n" + imports + "\n\n" + body + "\n\nexport { " + ", ".join(exports) + " };\n"
    p.write_text(text, encoding="utf-8")
    print(f"  wrote {path}  ({len(body.splitlines())} lines)")


# --- 1. Title ---
# Líneas 3018-3286: comentario + playTitleHorn + startNewGameFlow + uTitle + dTitle
body = slice_lines(3018, 3286)
write_module(
    "src/screens/title.js",
    "// Pantalla de título del juego.\n"
    "// Incluye la animación de cielo → fanfarria → carrusel de criaturas\n"
    "// y el menú inferior (INICIO / NUEVA AVENTURA).\n",
    "import { cx } from '../core/canvas.js';\n"
    "import { G } from '../core/game-state.js';\n"
    "import { sfx } from '../core/audio.js';\n"
    "import { fr } from '../core/frame.js';\n"
    "import { hasSaveGame, clearAllGameSaves } from '../core/save.js';\n"
    "import { CDB } from '../data/creatures.js';\n"
    "import { dexIds } from '../data/dex-order.js';\n"
    "import { dCre } from '../render/creature-sprites.js';\n"
    "import { dShadow } from '../render/world-decor.js';\n"
    "import { dBoxMenu } from '../render/ui-boxes.js';\n"
    "import { px } from '../render/render-utils.js';\n"
    "// kp lo asumimos global (definido en game.js). Si extraemos input a\n"
    "// un módulo aparte más adelante, aquí se agrega el import.",
    body,
    ["playTitleHorn", "startNewGameFlow", "uTitle", "dTitle"],
)

# --- 2. Intro ---
# Líneas 3288-3412: comentario + INTRO_LINES + uIntro + dIntro
body = slice_lines(3288, 3412)
write_module(
    "src/screens/intro.js",
    "// Escena de introducción tutorial: Alessandro se acerca al prota\n"
    "// y le explica el reino antes de la elección del inicial.\n",
    "import { cx } from '../core/canvas.js';\n"
    "import { G } from '../core/game-state.js';\n"
    "import { sfx } from '../core/audio.js';\n"
    "import { fr } from '../core/frame.js';\n"
    "import { dNPC } from '../render/npc-sprites.js';\n"
    "import { dPlayerGBA } from '../render/player-sprite.js';\n"
    "import { dDialogBox } from '../render/ui-boxes.js';\n"
    "// kp global",
    body,
    ["INTRO_LINES", "uIntro", "dIntro"],
)

# --- 3. Starter ---
# Líneas 3414-3534: comentario + uStarter + dStarter
body = slice_lines(3414, 3534)
write_module(
    "src/screens/starter.js",
    "// Pantalla de selección del compañero inicial (Fuego/Agua/Planta).\n"
    "// Tras confirmar, el prota queda listo en Aldea Pitch.\n",
    "import { cx } from '../core/canvas.js';\n"
    "import { G } from '../core/game-state.js';\n"
    "import { sfx } from '../core/audio.js';\n"
    "import { fr } from '../core/frame.js';\n"
    "import { Cre } from '../entities/creature.js';\n"
    "import { CDB } from '../data/creatures.js';\n"
    "import { tCol, tEmo, tNam } from '../data/types.js';\n"
    "import { dCre } from '../render/creature-sprites.js';\n"
    "import { dBox } from '../render/ui-boxes.js';\n"
    "import { aN } from '../utils/particles.js';\n"
    "import { setProa } from '../core/game-flags.js';\n"
    "import { WC, WR } from '../core/world-constants.js';\n"
    "import { updateCamera } from '../core/camera.js';\n"
    "// kp global",
    body,
    ["uStarter", "dStarter"],
)

print("\n✅ Fase 5A: módulos creados. game.js aún no modificado.")
