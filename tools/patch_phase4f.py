#!/usr/bin/env python3
"""
Patch Fase 4F: reemplaza el Bloque 6A (dCre) en script.js por un import.
Idempotente.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "script.js"
text = SCRIPT.read_text(encoding="utf-8")

MARKER = "// [refactor-phase4f] sprites de criaturas importados"
if MARKER in text:
    print("⏭  Ya aplicado.")
    raise SystemExit(0)

lines = text.split("\n")

start = 230
end = 2863

got_start = lines[start - 1]
if "function dCre(x, y, id, lv, f)" not in got_start:
    raise RuntimeError(f"Sanity failed at line {start}: {got_start!r}")

got_end = lines[end - 1]
if "fin dCre" not in got_end:
    raise RuntimeError(f"Sanity failed at line {end}: {got_end!r}")

print("✅ Sanity checks OK. Aplicando parche...")

new_lines = lines[:start - 1] + [
    "// [refactor-phase4f] bloque 6A (dCre - sprites de criaturas) movido a src/render/creature-sprites.js"
] + lines[end:]

IMPORTS = (
    f"\n{MARKER}\n"
    "import { dCre } from './src/render/creature-sprites.js';\n"
)

insert_idx = None
for idx, l in enumerate(new_lines):
    if "from './src/render/trainer-big-sprites.js'" in l:
        insert_idx = idx + 1
        break
if insert_idx is None:
    raise RuntimeError("No encontré anchor para Fase 4F.")

new_lines.insert(insert_idx, IMPORTS)

new_text = "\n".join(new_lines)
SCRIPT.with_suffix(".js.bak4f").write_text(text, encoding="utf-8")
SCRIPT.write_text(new_text, encoding="utf-8")

print(f"✅ script.js parcheado.")
print(f"   Antes: {len(lines)} líneas → Después: {len(new_lines)} líneas")
