#!/usr/bin/env python3
"""
Parche Fase 4B: reemplaza en script.js los bloques ya extraídos por imports.
También extrae `fr` a src/core/frame.js.

Idempotente.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "script.js"
text = SCRIPT.read_text(encoding="utf-8")

MARKER = "// [refactor-phase4b] UI y utilidades importadas"
if MARKER in text:
    print("⏭  patch_phase4b.py ya se aplicó.")
    raise SystemExit(0)

lines = text.split("\n")

# ---------------------------------------------------------------------
# Bloques a reemplazar por stubs. Cada tupla: (name, start_1idx, end_1idx, sanity_substr)
# ORDENADOS por línea de inicio. NO deben solaparse.
# ---------------------------------------------------------------------
BLOCKS = [
    ("particles",             150, 178, "// === PARTICLES & NOTIFICATIONS ==="),
    ("ui-boxes-dBox",         187, 219, "// === CAJA DORADA MEDIEVAL"),
    ("ui-boxes-dBoxMenu",     220, 259, "// === CAJA MENÚ/TIENDA"),
    ("ui-boxes-dDialogBox",   260, 289, "// === CAJA DE DIÁLOGO"),
    ("ui-bars-dHP",           290, 315, "// === BARRA DE HP"),
    ("ui-bars-dEXP",          316, 327, "// === BARRA DE EXP"),
    ("ui-bars-dBattlePanel",  328, 349, "// === PANEL DE BATALLA"),
    ("ui-boxes-dDialogAdaptive", 350, 359, "// === CAJA DE DIÁLOGO ADAPTATIVA"),
    ("ui-boxes-wrapText",     360, 376, "// === SEPARAR TEXTO"),
    ("ui-boxes-dMenuOption",  377, 383, "// === BOTÓN/OPCIÓN"),
    ("ui-type-icons-dTypeIcon", 384, 416, "// === ICONO DE TIPO"),
    ("ui-type-icons-moveUiCol", 417, 420, "function moveUiCol"),
    ("ui-type-icons-movePpColor", 421, 426, "function movePpColor"),
    ("ui-type-icons-dMoveButton", 427, 487, "function dMoveButton"),
    ("ui-boxes-dArrow",       488, 493, "// === FLECHA INDICADORA"),
    ("world-decor-dShadow",   495, 499, "// === SOMBRA PIXELADA"),
    ("world-decor-dRouteTree", 502, 512, "function dRouteTree"),
    ("world-decor-dRouteProa", 514, 542, "function dRouteProa"),
    ("world-decor-dRouteSign", 544, 553, "function dRouteSign"),
    ("world-decor-dFallenPortrait", 555, 591, "function dFallenPortrait"),
    ("battle-backgrounds",    593, 805, "// === ASSETS DE FONDOS DE BATALLA"),
    ("notifications-draw",    807, 835, "// === DIBUJAR NOTIFICACIONES"),
]

# Sanity checks
for name, start, end, needle in BLOCKS:
    got = lines[start - 1]
    if needle not in got:
        raise RuntimeError(
            f"Sanity failed for '{name}': expected {needle!r} at line {start}, got: {got!r}"
        )

print("✅ Sanity checks OK. Aplicando parche...")

# --- Sustituir cada bloque por un stub ---
new_lines = []
i = 0
it = iter(BLOCKS)
nb = next(it, None)

while i < len(lines):
    ln = i + 1
    if nb and ln == nb[1]:
        name, start, end, _ = nb
        new_lines.append(f"// [refactor-phase4b] bloque '{name}' movido a src/")
        i = end   # saltar hasta 'end' inclusive
        nb = next(it, None)
    else:
        new_lines.append(lines[i])
        i += 1

# --- Insertar imports después del último import de Fase 4A ---
IMPORTS = (
    f"\n{MARKER}\n"
    "import { fr, tickFrame } from './src/core/frame.js';\n"
    "import { aP, aN, uP } from './src/utils/particles.js';\n"
    "import { dBox, dBoxMenu, dDialogBox, dDialogAdaptive, wrapText, dMenuOption, dArrow } from './src/render/ui-boxes.js';\n"
    "import { dHP, dEXP, dBattlePanel } from './src/render/ui-bars.js';\n"
    "import { dTypeIcon, moveUiCol, movePpColor, dMoveButton } from './src/render/ui-type-icons.js';\n"
    "import { dShadow, dRouteTree, dRouteProa, dRouteSign, dFallenPortrait } from './src/render/world-decor.js';\n"
    "import { initBattleBackgroundAssets, drawBattleBackgroundAsset, dWorldEncounterBG, dBattleBG, dBattleIntroBG } from './src/render/battle-backgrounds.js';\n"
    "import { drawNotifications, drawParticles } from './src/render/notifications-draw.js';\n"
)

insert_idx = None
for idx, l in enumerate(new_lines):
    if "from './src/render/render-utils.js'" in l:
        insert_idx = idx + 1
        break
if insert_idx is None:
    raise RuntimeError("No pude encontrar el import de render-utils para anclar Fase 4B.")

new_lines.insert(insert_idx, IMPORTS)

# --- Manejo especial de `fr` ---
# El código original tiene `let cam = {x:0, y:0}, fr = 0, wMap = [], cave1 = []...`.
# `fr` ahora vive en src/core/frame.js. Debemos QUITAR `fr = 0,` de esa declaración.
# También en update() hay `fr++;` que debemos cambiar a `tickFrame();`.
final_text = "\n".join(new_lines)

# Quitar `  fr = 0,\n` (con indentación de 2 espacios) del bloque let
old_frame_decl = "let cam = { x: 0, y: 0 },\n  fr = 0,\n  wMap = [],"
new_frame_decl = "let cam = { x: 0, y: 0 },\n  wMap = [],"
if old_frame_decl in final_text:
    final_text = final_text.replace(old_frame_decl, new_frame_decl, 1)
    print("  reemplazado: 'let fr = 0' en la declaración de cam/wMap")
else:
    print("  ⚠️  NO encontré el patrón 'let cam = ..., fr = 0, wMap = []'. Verificar manualmente.")

# Reemplazar `fr++;` (en update) por `tickFrame();`
# El `fr++;` original está dentro de function update() {\n  fr++;\n ...
if "\n  fr++;\n" in final_text:
    final_text = final_text.replace("\n  fr++;\n", "\n  tickFrame();\n", 1)
    print("  reemplazado: 'fr++' → 'tickFrame()' en update()")
else:
    print("  ⚠️  NO encontré 'fr++;' — verificar manualmente.")

# Backup
SCRIPT.with_suffix(".js.bak4b").write_text(text, encoding="utf-8")
SCRIPT.write_text(final_text, encoding="utf-8")

removed = len(lines) - len(final_text.split("\n"))
print(f"✅ script.js parcheado.")
print(f"   Antes: {len(lines)} líneas → Después: {len(final_text.split(chr(10)))} líneas")
print(f"   Backup: script.js.bak4b")
