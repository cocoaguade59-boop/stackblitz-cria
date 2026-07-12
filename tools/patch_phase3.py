#!/usr/bin/env python3
"""
Reemplaza en script.js los bloques de Fase 3 por imports ES.
Idempotente.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "script.js"
text = SCRIPT.read_text(encoding="utf-8")

MARKER = "// [refactor-phase3] entidades importadas"
if MARKER in text:
    print("⏭  patch_phase3.py ya se aplicó.")
    raise SystemExit(0)

lines = text.split("\n")

BLOCKS = [
    # (name, start, end, sanity)
    ("creature",     71,   417,  "// === CREATURE CLASS ==="),
    ("learn-pool",   419,  1067, "// === POOL DE ATAQUES POR NIVEL Y TIPO ==="),
    ("evolution",    1068, 1094, "// === SISTEMA DE EVOLUCIÓN ==="),
    ("battle-state", 1096, 1208, "// === ESTADOS DE BATALLA ==="),
]

for name, start, end, needle in BLOCKS:
    got = lines[start - 1]
    if needle not in got:
        raise RuntimeError(f"Sanity failed '{name}': esperado {needle!r} en línea {start}, got {got!r}")

print("✅ Sanity checks OK. Aplicando parche...")

new_lines = []
i = 0
it = iter(BLOCKS)
nb = next(it, None)

while i < len(lines):
    ln = i + 1
    if nb and ln == nb[1]:
        name, start, end, _ = nb
        new_lines.append(f"// [refactor-phase3] bloque '{name}' movido a src/entities/{name}.js")
        i = end
        nb = next(it, None)
    else:
        new_lines.append(lines[i])
        i += 1

IMPORTS = (
    f"\n{MARKER}\n"
    "import { Cre } from './src/entities/creature.js';\n"
    "import { LEARN_POOL, checkLearnMove } from './src/entities/learn-pool.js';\n"
    "import { checkEvolution, evolveCre } from './src/entities/evolution.js';\n"
    "import { STATUS, battleState, resetBattleState, getModdedStat, cDmg } from './src/entities/battle-state.js';\n"
)

# Insertar después del último import de src/core/music.js (último de Fase 2)
insert_idx = None
for idx, l in enumerate(new_lines):
    if "from './src/core/music.js'" in l:
        insert_idx = idx + 1
        break
if insert_idx is None:
    raise RuntimeError("No pude encontrar el import de music.js para anclar Fase 3.")

new_lines.insert(insert_idx, IMPORTS)

new_text = "\n".join(new_lines)
SCRIPT.with_suffix(".js.bak3").write_text(text, encoding="utf-8")
SCRIPT.write_text(new_text, encoding="utf-8")

print(f"✅ script.js parcheado.")
print(f"   Antes: {len(lines)} líneas → Después: {len(new_lines)} líneas")
print(f"   Backup: script.js.bak3")
