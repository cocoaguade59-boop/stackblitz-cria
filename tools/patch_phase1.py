#!/usr/bin/env python3
"""
Reemplaza los bloques de datos ya extraídos en script.js por imports ES.
Idempotente: si detecta que ya se aplicó, no hace nada.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "script.js"
text = SCRIPT.read_text(encoding="utf-8")

MARKER = "// [refactor-phase1] datos importados desde src/data/"

if MARKER in text:
    print("⏭  patch_phase1.py ya se aplicó (marker presente). Nada que hacer.")
    raise SystemExit(0)

lines = text.split("\n")

# Rangos originales (1-indexed inclusive) — DEBEN COINCIDIR con extract_phase1.py
BLOCKS = [
    ("types",        139,  243),
    ("creatures",    244,  849),
    ("descriptions", 850,  1147),
    # 1148..1167 = SAVE_KEY / hasSaveGame / clearAllGameSaves / captureCount → NO tocar
    ("pools",        1170, 1176),
    ("moves",        1178, 1857),
]

# Verificación de sanidad: primeras líneas de cada bloque
sanity_checks = {
    "types":        "// === TIPOS ===",
    "creatures":    "// === CREATURE DATABASE ===",
    "descriptions": "// === DESCRIPCIONES LARGAS",
    "pools":        "const POOLS = {",
    "moves":        "const ALL_MOVES = [",
}

for name, start, end in BLOCKS:
    first = lines[start - 1]
    expected = sanity_checks[name]
    if expected not in first:
        raise RuntimeError(
            f"Sanity check falló para bloque '{name}':\n"
            f"  esperaba '{expected}' en línea {start}\n"
            f"  encontré: {first!r}"
        )

print("✅ Sanity checks OK. Aplicando parche...")

# Reemplazo: reconstruyo el archivo. Como los rangos NO se solapan y están ordenados,
# voy en orden y sustituyo cada bloque por un stub de import.

# Estrategia: mantener una lista de líneas resultantes, con reemplazos.
# Convertimos a 0-indexed para trabajar.
new_lines = []
i = 0  # 0-indexed
block_iter = iter(BLOCKS)
next_block = next(block_iter, None)

# Añadir bloque de imports arriba (justo después del banner inicial de comentarios).
# El script empieza así:
#   line 1: // ============================================================
#   line 2: // CRIATURAS DEL REINO V2 - BLOQUE 1: BASE
#   line 3: // ============================================================
# Insertaré los imports en la línea 4 (índice 3).
IMPORTS = (
    "\n"
    f"{MARKER}\n"
    "import { tEff, tCol, tColL, tEmo, tNam } from './src/data/types.js';\n"
    "import { CDB } from './src/data/creatures.js';\n"
    "import { CRE_DESC } from './src/data/creature-descriptions.js';\n"
    "import { POOLS } from './src/data/pools.js';\n"
    "import { ALL_MOVES } from './src/data/moves.js';\n"
)

while i < len(lines):
    line_num_1based = i + 1
    if next_block and line_num_1based == next_block[1]:
        name, start, end = next_block
        # Reemplazar todo el rango [start..end] por un stub
        new_lines.append(f"// [refactor-phase1] bloque '{name}' movido a src/data/{name}.js")
        i = end  # saltar hasta el final del bloque (0-indexed end == end)
        next_block = next(block_iter, None)
    else:
        new_lines.append(lines[i])
        i += 1

# Insertar los imports después del banner inicial (3 líneas de comentario)
# Buscar la primera línea que NO sea comentario después del banner
insert_at = 3  # tras las 3 primeras líneas de banner
new_lines.insert(insert_at, IMPORTS)

new_text = "\n".join(new_lines)

# Backup por seguridad
(SCRIPT.with_suffix(".js.bak")).write_text(text, encoding="utf-8")
SCRIPT.write_text(new_text, encoding="utf-8")

removed = len(lines) - len(new_lines) + IMPORTS.count("\n")
print(f"✅ script.js parcheado.")
print(f"   Antes: {len(lines)} líneas / Después: {len(new_lines)} líneas")
print(f"   Backup: script.js.bak")
