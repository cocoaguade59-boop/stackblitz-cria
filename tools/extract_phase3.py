#!/usr/bin/env python3
"""
Fase 3 del refactor: Extrae entidades (Cre class), evolución, pool de aprendizaje
y estados de batalla a src/entities/.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "script.js").read_text(encoding="utf-8")
lines = SRC.split("\n")


def slice_lines(a, b):
    return "\n".join(lines[a - 1 : b])


def write_module(path: Path, header: str, body: str, exports: list[str]):
    export_line = "export { " + ", ".join(exports) + " };\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(header + "\n\n" + body + "\n\n" + export_line, encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)}  ({len(body.splitlines())} lines)")


print("== Fase 3: extrayendo entidades ==\n")

# ------------------------------------------------------------------
# 1) creature.js — clase Cre (líneas 71..417)
#    Depende de: CDB, ALL_MOVES  (ya en src/data/)
# ------------------------------------------------------------------
cre_body = slice_lines(71, 417)
cre_body = (
    "import { CDB } from '../data/creatures.js';\n"
    "import { ALL_MOVES } from '../data/moves.js';\n\n"
    + cre_body
)
write_module(
    ROOT / "src/entities/creature.js",
    "// Clase Cre: representa una criatura instanciada (con nivel, HP, movs, etc.).\n"
    "// Depende de CDB y ALL_MOVES.",
    cre_body,
    ["Cre"],
)

# ------------------------------------------------------------------
# 2) learn-pool.js — LEARN_POOL + checkLearnMove (líneas 419..1067)
#    Sin dependencias externas.
# ------------------------------------------------------------------
lp_body = slice_lines(419, 1067)
write_module(
    ROOT / "src/entities/learn-pool.js",
    "// Pool de ataques por nivel y tipo + verificación de aprendizaje al subir nivel.\n"
    "// Sin dependencias externas.",
    lp_body,
    ["LEARN_POOL", "checkLearnMove"],
)

# ------------------------------------------------------------------
# 3) evolution.js — checkEvolution + evolveCre (líneas 1068..1094)
#    Depende de: CDB
# ------------------------------------------------------------------
evo_body = slice_lines(1068, 1094)
evo_body = "import { CDB } from '../data/creatures.js';\n\n" + evo_body
write_module(
    ROOT / "src/entities/evolution.js",
    "// Sistema de evolución de criaturas.\n"
    "// Depende de CDB.",
    evo_body,
    ["checkEvolution", "evolveCre"],
)

# ------------------------------------------------------------------
# 4) battle-state.js — STATUS + battleState + helpers (líneas 1096..1208)
#    Depende de: tEff.  Exporta la instancia mutable battleState.
# ------------------------------------------------------------------
bs_body = slice_lines(1096, 1208)
bs_body = "import { tEff } from '../data/types.js';\n\n" + bs_body
write_module(
    ROOT / "src/entities/battle-state.js",
    "// Estados de batalla globales (STATUS, battleState) y helpers de daño.\n"
    "// `battleState` se exporta como instancia mutable compartida.\n"
    "// Depende de tEff.",
    bs_body,
    ["STATUS", "battleState", "resetBattleState", "getModdedStat", "cDmg"],
)

print("\n✅ Fase 3: módulos creados. script.js aún no modificado.")
