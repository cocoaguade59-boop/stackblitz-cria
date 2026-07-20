#!/usr/bin/env python3
"""
Patch Fase 4D: reemplaza el Bloque 4A (dNPC) en game.js por un import.
Idempotente.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "game.js"
text = SCRIPT.read_text(encoding="utf-8")

MARKER = "// [refactor-phase4d] sprites de NPCs importados"
if MARKER in text:
    print("⏭  patch_phase4d.py ya se aplicó.")
    raise SystemExit(0)

lines = text.split("\n")

# Rango: líneas 211-1600 (function dNPC ... } // fin dNPC)
start = 211
end = 1600

# Sanity check: línea 211 debe ser "function dNPC(x, y, id, f) {"
got_start = lines[start - 1]
if "function dNPC(x, y, id, f)" not in got_start:
    raise RuntimeError(f"Sanity failed: esperaba 'function dNPC' en línea {start}, got: {got_start!r}")

# Línea 1600 debe ser "} // fin dNPC"
got_end = lines[end - 1]
if "fin dNPC" not in got_end:
    raise RuntimeError(f"Sanity failed: esperaba '// fin dNPC' en línea {end}, got: {got_end!r}")

print("✅ Sanity checks OK. Aplicando parche...")

# Reemplazar rango [start..end] por un stub
new_lines = lines[:start - 1] + [
    "// [refactor-phase4d] bloque 4A (dNPC: sprites de NPCs) movido a src/render/npc-sprites.js"
] + lines[end:]

# Insertar el import después del último import de Fase 4C (player-sprite)
IMPORTS = (
    f"\n{MARKER}\n"
    "import { dNPC } from './src/render/npc-sprites.js';\n"
)

insert_idx = None
for idx, l in enumerate(new_lines):
    if "from './src/render/player-sprite.js'" in l:
        insert_idx = idx + 1
        break
if insert_idx is None:
    raise RuntimeError("No encontré el import de player-sprite para anclar Fase 4D.")

new_lines.insert(insert_idx, IMPORTS)

new_text = "\n".join(new_lines)

# Backup
SCRIPT.with_suffix(".js.bak4d").write_text(text, encoding="utf-8")
SCRIPT.write_text(new_text, encoding="utf-8")

print(f"✅ game.js parcheado.")
print(f"   Antes: {len(lines)} líneas → Después: {len(new_lines)} líneas")
print(f"   Backup: game.js.bak4d")
