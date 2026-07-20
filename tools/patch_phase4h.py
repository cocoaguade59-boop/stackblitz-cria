#!/usr/bin/env python3
"""
Patch Fase 4H: reemplaza el Bloque 8 (dTileC) en game.js por un import.
Idempotente.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "game.js"
text = SCRIPT.read_text(encoding="utf-8")

MARKER = "// [refactor-phase4h] tiles de cuevas/castillo importados"
if MARKER in text:
    print("⏭  Ya aplicado.")
    raise SystemExit(0)

lines = text.split("\n")

start = 244
end = 1060

got_start = lines[start - 1]
if "function dTileC(c, r, map)" not in got_start:
    raise RuntimeError(f"Sanity failed at line {start}: {got_start!r}")

got_end = lines[end - 1]
if "fin dTileC" not in got_end:
    raise RuntimeError(f"Sanity failed at line {end}: {got_end!r}")

print("✅ Sanity checks OK. Aplicando parche...")

new_lines = lines[:start - 1] + [
    "// [refactor-phase4h] bloque 8 (dTileC - tiles cueva/castillo) movido a src/render/tiles-cave-castle.js"
] + lines[end:]

IMPORTS = (
    f"\n{MARKER}\n"
    "import { dTileC } from './src/render/tiles-cave-castle.js';\n"
)

insert_idx = None
for idx, l in enumerate(new_lines):
    if "from './src/render/tiles-world.js'" in l:
        insert_idx = idx + 1
        break
if insert_idx is None:
    raise RuntimeError("No encontré anchor para Fase 4H.")

new_lines.insert(insert_idx, IMPORTS)

new_text = "\n".join(new_lines)
SCRIPT.with_suffix(".js.bak4h").write_text(text, encoding="utf-8")
SCRIPT.write_text(new_text, encoding="utf-8")

print(f"✅ game.js parcheado.")
print(f"   Antes: {len(lines)} líneas → Después: {len(new_lines)} líneas")
