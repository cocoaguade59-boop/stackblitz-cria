#!/usr/bin/env python3
"""
Patch Fase 4G:
1. Migra `T, WC, WR, CC, CR, KC, KR, cam, wMap, cave1, cave2, castMap`
   desde script.js hacia src/core/world-constants.js.
2. Reemplaza el Bloque 7 (dTileW) por import.
3. Reemplaza asignaciones `cam = ...`, `wMap = ...`, etc. por setters.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "script.js"
text = SCRIPT.read_text(encoding="utf-8")

MARKER = "// [refactor-phase4g] tiles del mundo importados"
if MARKER in text:
    print("⏭  Ya aplicado.")
    raise SystemExit(0)

# ---- Parte 1: eliminar declaraciones de constantes y arrays de mundo ----
# El bloque original está en las líneas 79-90 (aprox):
#   const T = 32, WC = 80, WR = 150, CC = 40, CR = 30, KC = 30, KR = 25;
#   let cam = { x: 0, y: 0 }, wMap = [], cave1 = [], cave2 = [], castMap = [];

old_const_decl = """const T = 32,
  WC = 80,
  WR = 150,
  CC = 40,
  CR = 30,
  KC = 30,
  KR = 25;"""

if old_const_decl not in text:
    raise RuntimeError("No encontré la declaración de const T, WC, ...")

text = text.replace(
    old_const_decl,
    "// [refactor-phase4g] T/WC/WR/CC/CR/KC/KR movidos a src/core/world-constants.js"
)

old_let_decl = """let cam = { x: 0, y: 0 },
  wMap = [],
  cave1 = [],
  cave2 = [],
  castMap = [];"""

if old_let_decl not in text:
    raise RuntimeError("No encontré la declaración de let cam, wMap, ...")

text = text.replace(
    old_let_decl,
    "// [refactor-phase4g] cam/wMap/cave1/cave2/castMap movidos a src/core/world-constants.js"
)

# ---- Parte 2: reemplazar el Bloque 7 (dTileW) por import ----
lines = text.split("\n")

# El bloque 7 sigue existiendo en las mismas líneas relativas dentro del archivo.
# Buscamos "// Mezcla dos colores hex" que es el comentario que arranca el bloque.
start = None
end = None
for i, line in enumerate(lines):
    if start is None and "// Mezcla dos colores hex" in line:
        start = i + 1  # 1-indexed
    if start is not None and "// fin dTileW" in line:
        end = i + 1
        break

if start is None or end is None:
    raise RuntimeError(f"No encontré rango del Bloque 7 (start={start}, end={end})")

print(f"Bloque 7 encontrado: líneas {start}-{end}")

new_lines = lines[:start - 1] + [
    "// [refactor-phase4g] bloque 7 (dTileW - tiles del mundo) movido a src/render/tiles-world.js"
] + lines[end:]

# ---- Parte 3: agregar imports ----
IMPORTS = (
    f"\n{MARKER}\n"
    "import { dTileW, lerpColor, drawWorldDecorBase } from './src/render/tiles-world.js';\n"
    "import {\n"
    "  T, WC, WR, CC, CR, KC, KR,\n"
    "  cam, wMap, cave1, cave2, castMap,\n"
    "  setCam, setWMap, setCave1, setCave2, setCastMap,\n"
    "} from './src/core/world-constants.js';\n"
)

insert_idx = None
for idx, l in enumerate(new_lines):
    if "from './src/render/creature-sprites.js'" in l:
        insert_idx = idx + 1
        break
if insert_idx is None:
    raise RuntimeError("No encontré anchor para Fase 4G.")

new_lines.insert(insert_idx, IMPORTS)

# ---- Parte 4: reemplazar asignaciones globales ----
text = "\n".join(new_lines)

# NOTA: cam.x = ..., cam.y = ... son mutaciones de propiedades — funcionan sin setter.
# Solo necesitamos setter si se hace `cam = { ... }`, `wMap = ...` etc.
# Voy a buscar esas asignaciones específicas.

def replace_assignment(text_local, var, setter):
    """Reemplaza asignaciones tipo:  var = expr;  →  setter(expr);"""
    count = 0
    def repl(m):
        nonlocal count
        count += 1
        indent = m.group(1)
        value = m.group(2).rstrip(';').strip()
        return f"{indent}{setter}({value});"
    # Regex: no atrapar `cam.x = ...`
    pattern = r'^([ \t]*)' + re.escape(var) + r'\s*=\s*([^\n;]+);'
    text_local = re.sub(pattern, repl, text_local, flags=re.MULTILINE)
    if count > 0:
        print(f"  ✓ Reemplazadas {count} asignaciones de '{var}' → {setter}()")
    return text_local

for var, setter in [
    ('cam', 'setCam'),
    ('wMap', 'setWMap'),
    ('cave1', 'setCave1'),
    ('cave2', 'setCave2'),
    ('castMap', 'setCastMap'),
]:
    text = replace_assignment(text, var, setter)

SCRIPT.with_suffix(".js.bak4g").write_text(SRC := (ROOT / "script.js").read_text(encoding="utf-8"), encoding="utf-8")
# Guardar sobre el archivo original ya modificado en memoria
# (SRC hereda el texto ANTES de nuestros cambios, para backup)
# Actualizo el backup a la versión previa real:
# NOTE: para simplificar, hacemos el backup ANTES de sobrescribir
SCRIPT.write_text(text, encoding="utf-8")

print(f"\n✅ script.js parcheado.")
