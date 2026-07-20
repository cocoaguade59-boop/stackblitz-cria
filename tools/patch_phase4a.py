#!/usr/bin/env python3
"""
Reemplaza en game.js los bloques de Fase 4A por imports ES.
- canvas (líneas 27-28)      → import { cv, cx } from './src/core/canvas.js'
- game-state (líneas 84-124) → import { G } from './src/core/game-state.js'
- render-utils (218-241)     → import { px, pixelGlow, pixelDiamond } from './src/render/render-utils.js'
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "game.js"
text = SCRIPT.read_text(encoding="utf-8")

MARKER = "// [refactor-phase4a] fundaciones render importadas"
if MARKER in text:
    print("⏭  patch_phase4a.py ya se aplicó.")
    raise SystemExit(0)

lines = text.split("\n")

BLOCKS = [
    ("canvas",       27,  28,  "const cv = document.getElementById('c')"),
    ("game-state",   84,  124, "// === GAME STATE ==="),
    ("render-utils", 218, 241, "function px(x, y, w, h, c)"),
]

for name, start, end, needle in BLOCKS:
    got = lines[start - 1]
    if needle not in got:
        raise RuntimeError(f"Sanity failed '{name}': esperado {needle!r} en línea {start}, got: {got!r}")

print("✅ Sanity checks OK. Aplicando parche...")

new_lines = []
i = 0
it = iter(BLOCKS)
nb = next(it, None)

while i < len(lines):
    ln = i + 1
    if nb and ln == nb[1]:
        name, start, end, _ = nb
        new_lines.append(f"// [refactor-phase4a] bloque '{name}' movido a src/")
        i = end
        nb = next(it, None)
    else:
        new_lines.append(lines[i])
        i += 1

IMPORTS = (
    f"\n{MARKER}\n"
    "import { cv, cx } from './src/core/canvas.js';\n"
    "import { G } from './src/core/game-state.js';\n"
    "import { px, pixelGlow, pixelDiamond } from './src/render/render-utils.js';\n"
)

# Insertar después del último import de Fase 3 (battle-state)
insert_idx = None
for idx, l in enumerate(new_lines):
    if "from './src/entities/battle-state.js'" in l:
        insert_idx = idx + 1
        break
if insert_idx is None:
    raise RuntimeError("No pude encontrar el import de battle-state.js para anclar Fase 4A.")

new_lines.insert(insert_idx, IMPORTS)

new_text = "\n".join(new_lines)
SCRIPT.with_suffix(".js.bak4a").write_text(text, encoding="utf-8")
SCRIPT.write_text(new_text, encoding="utf-8")

print(f"✅ game.js parcheado.")
print(f"   Antes: {len(lines)} líneas → Después: {len(new_lines)} líneas")
