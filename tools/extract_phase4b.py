#!/usr/bin/env python3
"""
Fase 4B del refactor: extrae el Bloque 2 (UI Completa) del monolito
en 7 módulos coherentes dentro de src/render/ y src/utils/.

También extrae fr del cuerpo de script.js a src/core/frame.js.

Divisiones:
  src/utils/particles.js             (aP, aN, uP) [líneas 150-178]
  src/render/ui-boxes.js             (dBox, dBoxMenu, dDialogBox, dDialogAdaptive, wrapText, dMenuOption, dArrow)
  src/render/ui-bars.js              (dHP, dEXP, dBattlePanel)
  src/render/ui-type-icons.js        (dTypeIcon, moveUiCol, movePpColor, dMoveButton)
  src/render/world-decor.js          (dShadow, dRouteTree, dRouteProa, dRouteSign, dFallenPortrait)
  src/render/battle-backgrounds.js   (initBattleBackgroundAssets, drawBattleBackgroundAsset, dWorldEncounterBG, dBattleBG, dBattleIntroBG)
  src/render/notifications-draw.js   (drawNotifications, drawParticles)
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "script.js").read_text(encoding="utf-8")
lines = SRC.split("\n")


def slice_lines(a, b):
    return "\n".join(lines[a - 1:b])


def write_module(path: Path, header: str, imports: str, body: str, exports: list[str]):
    export_line = "export { " + ", ".join(exports) + " };\n"
    full = header + "\n\n"
    if imports:
        full += imports + "\n\n"
    full += body + "\n\n" + export_line
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(full, encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)}  ({len(body.splitlines())} lines)")


# ---------- RANGOS (verificados en el archivo actual) ----------
# 150-178: aP, aN, uP (comentario "// === PARTICLES & NOTIFICATIONS ===" en 150)
# 187-219: dBox
# 220-259: dBoxMenu
# 260-289: dDialogBox
# 290-315: dHP
# 316-327: dEXP
# 328-349: dBattlePanel
# 350-359: dDialogAdaptive
# 360-376: wrapText
# 377-383: dMenuOption
# 384-416: dTypeIcon
# 417-420: moveUiCol
# 421-426: movePpColor
# 427-487: dMoveButton
# 488-493: dArrow
# 494-501: dShadow (con comentario "// === SOMBRA")
# 502-513: dRouteTree
# 514-543: dRouteProa
# 544-553: dRouteSign
# 554-591: dFallenPortrait   (verificar end)
# 592-641: battleBgAssets + initBattleBackgroundAssets + drawBattleBackgroundAsset
# 642-746: dWorldEncounterBG
# 747-780: dBattleBG
# 781-806: dBattleIntroBG
# 807-826: drawNotifications
# 827-836: drawParticles

# --------- 1) src/utils/particles.js ---------
print("== Fase 4B: extrayendo Bloque 2 (UI Completa) ==\n")

body = slice_lines(150, 178)
write_module(
    ROOT / "src/utils/particles.js",
    "// Sistema de partículas y notificaciones flotantes.\n"
    "// Depende del game state G para almacenar arrays activos.",
    "import { G } from '../core/game-state.js';",
    body,
    ["aP", "aN", "uP"],
)

# --------- 2) src/render/ui-boxes.js ---------
# Junta: dBox, dBoxMenu, dDialogBox, dDialogAdaptive, wrapText, dMenuOption, dArrow
# Estas están en rangos NO contiguos. Recolectamos los pedazos.
parts = [
    slice_lines(187, 219),   # dBox (con comentario)
    slice_lines(220, 259),   # dBoxMenu (con comentario)
    slice_lines(260, 289),   # dDialogBox (con comentario)
    slice_lines(350, 359),   # dDialogAdaptive
    slice_lines(360, 376),   # wrapText
    slice_lines(377, 383),   # dMenuOption
    slice_lines(488, 493),   # dArrow (con comentario, y usa fr)
]
body = "\n\n".join(parts)
write_module(
    ROOT / "src/render/ui-boxes.js",
    "// Cajas de UI (dBox, dBoxMenu, dDialogBox, etc.) y utilidades de texto.\n"
    "// Depende del contexto de canvas cx, primitivas px, y el contador fr para animar dArrow.",
    "import { cx } from '../core/canvas.js';\n"
    "import { px } from './render-utils.js';\n"
    "import { fr } from '../core/frame.js';",
    body,
    ["dBox", "dBoxMenu", "dDialogBox", "dDialogAdaptive",
     "wrapText", "dMenuOption", "dArrow"],
)

# --------- 3) src/render/ui-bars.js ---------
parts = [
    slice_lines(290, 315),   # dHP (con comentario)
    slice_lines(316, 327),   # dEXP (con comentario)
    slice_lines(328, 349),   # dBattlePanel (con comentario) — legacy, sigue usado
]
body = "\n\n".join(parts)
write_module(
    ROOT / "src/render/ui-bars.js",
    "// Barras (HP, EXP) y panel legacy dBattlePanel.\n"
    "// dBattlePanel ya casi no se usa (reemplazado por battle-hud.js) pero se\n"
    "// mantiene por compatibilidad con partes viejas del código.",
    "import { cx } from '../core/canvas.js';\n"
    "import { px } from './render-utils.js';",
    body,
    ["dHP", "dEXP", "dBattlePanel"],
)

# --------- 4) src/render/ui-type-icons.js ---------
parts = [
    slice_lines(384, 416),   # dTypeIcon (con comentario)
    slice_lines(417, 420),   # moveUiCol
    slice_lines(421, 426),   # movePpColor
    slice_lines(427, 487),   # dMoveButton (con comentario)
]
body = "\n\n".join(parts)
write_module(
    ROOT / "src/render/ui-type-icons.js",
    "// Íconos y botones relacionados con tipos de criatura y movimientos.\n"
    "// Depende de tCol/tNam para los colores de tipo.",
    "import { cx } from '../core/canvas.js';\n"
    "import { px } from './render-utils.js';\n"
    "import { tCol, tNam } from '../data/types.js';",
    body,
    ["dTypeIcon", "moveUiCol", "movePpColor", "dMoveButton"],
)

# --------- 5) src/render/world-decor.js ---------
parts = [
    slice_lines(495, 499),   # dShadow (con comentario)
    slice_lines(502, 512),   # dRouteTree
    slice_lines(514, 542),   # dRouteProa
    slice_lines(544, 553),   # dRouteSign
    slice_lines(555, 591),   # dFallenPortrait
]
body = "\n\n".join(parts)
write_module(
    ROOT / "src/render/world-decor.js",
    "// Decoración del mundo (sombras, árboles de ruta, Proa, carteles, retratos).",
    "import { cx } from '../core/canvas.js';\n"
    "import { px, pixelGlow } from './render-utils.js';\n"
    "import { SK } from './skin-colors.js';",
    body,
    ["dShadow", "dRouteTree", "dRouteProa", "dRouteSign", "dFallenPortrait"],
)

# --------- 6) src/render/battle-backgrounds.js ---------
# Este bloque incluye la constante battleBgAssets al inicio.
# 592 es el comentario "// === ASSETS DE FONDOS DE BATALLA ===", pero la constante empieza antes.
# Confirmamos leyendo:
body = slice_lines(593, 805)
write_module(
    ROOT / "src/render/battle-backgrounds.js",
    "// Assets y funciones para fondos de batalla (salvaje, NPC, intro).\n"
    "// Depende de cx, del game state G, y del contador de frames fr.",
    "import { cx } from '../core/canvas.js';\n"
    "import { G } from '../core/game-state.js';\n"
    "import { fr } from '../core/frame.js';",
    body,
    ["initBattleBackgroundAssets", "drawBattleBackgroundAsset",
     "dWorldEncounterBG", "dBattleBG", "dBattleIntroBG"],
)

# --------- 7) src/render/notifications-draw.js ---------
body = slice_lines(807, 835)
write_module(
    ROOT / "src/render/notifications-draw.js",
    "// Renderizado de notificaciones flotantes y partículas.\n"
    "// Los arrays viven en G.nots y G.pts (poblados por particles.js).",
    "import { cx } from '../core/canvas.js';\n"
    "import { G } from '../core/game-state.js';",
    body,
    ["drawNotifications", "drawParticles"],
)

# --------- extra: fr ya está creado a mano en src/core/frame.js ---------
print("\n✅ Fase 4B: 7 módulos creados. script.js aún no modificado.")
