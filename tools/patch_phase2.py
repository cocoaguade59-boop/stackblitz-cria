#!/usr/bin/env python3
"""
Reemplaza en game.js los bloques ya extraídos en la Fase 2 por imports ES.
Idempotente: si detecta que ya se aplicó, no hace nada.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "game.js"
text = SCRIPT.read_text(encoding="utf-8")

MARKER = "// [refactor-phase2] utilidades importadas"

if MARKER in text:
    print("⏭  patch_phase2.py ya se aplicó (marker presente).")
    raise SystemExit(0)

lines = text.split("\n")

# Rangos originales (1-indexed inclusive) — deben coincidir con extract_phase2.py.
BLOCKS = [
    # (name, start, end, sanity_check_substring_in_start_line)
    ("sprite-loader", 20,    39,    "const SPRITE_LOADER = {"),
    ("audio",         68,    146,   "// === AUDIO ==="),
    ("save",          151,   167,   "// === GUARDADO ==="),
    ("skin-colors",   1443,  1450,  "// === SKIN COLORS ==="),
    ("music",         18246, 18361, "// BLOQUE 24: MÚSICA"),  # incluye el header comentario
]

# Sanity checks
for name, start, end, needle in BLOCKS:
    first = lines[start - 1]
    if needle not in first:
        raise RuntimeError(
            f"Sanity failed for '{name}': expected {needle!r} at line {start}, got: {first!r}"
        )

print("✅ Sanity checks OK. Aplicando parche...")

# Recorremos y reemplazamos por stubs.
new_lines = []
i = 0
block_iter = iter(BLOCKS)
next_block = next(block_iter, None)

while i < len(lines):
    ln = i + 1
    if next_block and ln == next_block[1]:
        name, start, end, _ = next_block
        new_lines.append(f"// [refactor-phase2] bloque '{name}' movido a src/")
        i = end
        next_block = next(block_iter, None)
    else:
        new_lines.append(lines[i])
        i += 1

# Insertar los imports después del banner inicial y del bloque Fase 1.
# La estructura actual de game.js empieza así:
#   line 1..3: banner
#   line 4:    (vacía)
#   line 5:    // [refactor-phase1] datos importados desde src/data/
#   line 6..10: 5 imports de Fase 1
#   line 11:   (vacía)
#   line 12..: código
# Insertaremos los imports de Fase 2 justo después del import de moves.js.

IMPORTS = (
    f"\n{MARKER}\n"
    "import { SPRITE_LOADER } from './src/core/sprite-loader.js';\n"
    "import { SFX, sfx } from './src/core/audio.js';\n"
    "import { SAVE_KEY, hasSaveGame, clearAllGameSaves } from './src/core/save.js';\n"
    "import { SK } from './src/render/skin-colors.js';\n"
    "import { SONGS, playMusic, stopMusic } from './src/core/music.js';\n"
)

# Buscar la línea que contiene "from './src/data/moves.js'" para insertar después.
insert_idx = None
for idx, l in enumerate(new_lines):
    if "from './src/data/moves.js'" in l:
        insert_idx = idx + 1
        break

if insert_idx is None:
    raise RuntimeError("No pude encontrar el import de moves.js para anclar los imports de Fase 2.")

new_lines.insert(insert_idx, IMPORTS)

new_text = "\n".join(new_lines)

# Backup
SCRIPT.with_suffix(".js.bak2").write_text(text, encoding="utf-8")
SCRIPT.write_text(new_text, encoding="utf-8")

print(f"✅ game.js parcheado.")
print(f"   Antes: {len(lines)} líneas → Después: {len(new_lines)} líneas")
print(f"   Backup: game.js.bak2")
