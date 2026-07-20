#!/usr/bin/env python3
"""
Patch Fase 4E: reemplaza el Bloque 5 (dTrainerBig) en game.js por un import.
Idempotente.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "game.js"
text = SCRIPT.read_text(encoding="utf-8")

MARKER = "// [refactor-phase4e] sprites de entrenadores importados"
if MARKER in text:
    print("⏭  patch_phase4e.py ya se aplicó.")
    raise SystemExit(0)

lines = text.split("\n")

start = 220
end = 1419

got_start = lines[start - 1]
if "function dTrainerBig(x, y, id, f)" not in got_start:
    raise RuntimeError(f"Sanity failed at line {start}: {got_start!r}")

got_end = lines[end - 1]
if "fin dTrainerBig" not in got_end:
    raise RuntimeError(f"Sanity failed at line {end}: {got_end!r}")

print("✅ Sanity checks OK. Aplicando parche...")

new_lines = lines[:start - 1] + [
    "// [refactor-phase4e] bloque 5 (dTrainerBig) movido a src/render/trainer-big-sprites.js"
] + lines[end:]

IMPORTS = (
    f"\n{MARKER}\n"
    "import { dTrainerBig } from './src/render/trainer-big-sprites.js';\n"
)

insert_idx = None
for idx, l in enumerate(new_lines):
    if "from './src/render/npc-sprites.js'" in l:
        insert_idx = idx + 1
        break
if insert_idx is None:
    raise RuntimeError("No encontré el import de npc-sprites para anclar Fase 4E.")

new_lines.insert(insert_idx, IMPORTS)

new_text = "\n".join(new_lines)
SCRIPT.with_suffix(".js.bak4e").write_text(text, encoding="utf-8")
SCRIPT.write_text(new_text, encoding="utf-8")

print(f"✅ game.js parcheado.")
print(f"   Antes: {len(lines)} líneas → Después: {len(new_lines)} líneas")
