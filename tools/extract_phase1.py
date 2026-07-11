#!/usr/bin/env python3
"""
Fase 1 del refactor: Extrae los datos puros del script.js monolítico
hacia módulos ES en src/data/.

Es idempotente y no destructivo: script.js NO se modifica en esta fase.
Solo escribe los archivos nuevos.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "script.js").read_text(encoding="utf-8")
lines = SRC.split("\n")  # 1-indexed logically


def slice_lines(start_1based, end_1based):
    """Devuelve las líneas [start..end] inclusive (1-indexed)."""
    return "\n".join(lines[start_1based - 1 : end_1based])


# --- Rangos (1-indexed, ya verificados manualmente) -------------------------
BLOCKS = {
    "types":        (139, 243),   # comentario "// === TIPOS ===" hasta antes de CDB
    "creatures":    (244, 849),   # const CDB = {...};
    "descriptions": (850, 1147),  # const CRE_DESC = {...};
    "pools":        (1168, 1176), # const POOLS = {...};
    "moves":        (1177, 1857), # const ALL_MOVES = [...];
}


def write_module(path: Path, header: str, body: str, exports: list[str]):
    export_line = "export { " + ", ".join(exports) + " };\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(header + "\n" + body + "\n\n" + export_line, encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)}  ({len(body.splitlines())} lines)")


print("== Fase 1: extrayendo módulos de datos ==\n")

# 1) types.js
types_body = slice_lines(*BLOCKS["types"])
write_module(
    ROOT / "src/data/types.js",
    "// Sistema de tipos: efectividad, colores, emojis, nombres.\n"
    "// Datos puros, sin dependencias.",
    types_body,
    ["tEff", "tCol", "tColL", "tEmo", "tNam"],
)

# 2) creatures.js  (CDB)
creatures_body = slice_lines(*BLOCKS["creatures"])
write_module(
    ROOT / "src/data/creatures.js",
    "// Base de datos de criaturas: stats, tipos, evoluciones.\n"
    "// Datos puros, sin dependencias.",
    creatures_body,
    ["CDB"],
)

# 3) creature-descriptions.js  (CRE_DESC)
desc_body = slice_lines(*BLOCKS["descriptions"])
write_module(
    ROOT / "src/data/creature-descriptions.js",
    "// Descripciones largas (flavor text) de cada criatura.\n"
    "// Datos puros, sin dependencias.",
    desc_body,
    ["CRE_DESC"],
)

# 4) pools.js
pools_body = slice_lines(*BLOCKS["pools"])
write_module(
    ROOT / "src/data/pools.js",
    "// Pools de criaturas por tipo (para captura aleatoria).\n"
    "// Datos puros, sin dependencias.",
    pools_body,
    ["POOLS"],
)

# 5) moves.js
moves_body = slice_lines(*BLOCKS["moves"])
write_module(
    ROOT / "src/data/moves.js",
    "// Lista completa de ataques del juego (todos los tipos).\n"
    "// Datos puros, sin dependencias.",
    moves_body,
    ["ALL_MOVES"],
)

print("\n✅ Fase 1 completa. script.js NO fue modificado.")
