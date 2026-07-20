#!/usr/bin/env python3
"""
Migra las flags mutables globales (postGame, towerOpen, etc.) desde
game.js hacia src/core/game-flags.js.

Cambios:
1. Elimina las declaraciones `let postGame = false, towerOpen = false, ...`
2. Añade import de game-flags.js
3. Reemplaza asignaciones directas por setters:
     postGame = X  -->  setPostGame(X)
     etc.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "game.js"
text = SCRIPT.read_text(encoding="utf-8")

MARKER = "// [refactor-game-flags] flags mutables globales importadas"
if MARKER in text:
    print("⏭  Ya aplicado.")
    raise SystemExit(0)

# Variables a migrar
FLAGS = [
    ('postGame', 'setPostGame'),
    ('towerOpen', 'setTowerOpen'),
    ('oloDefeated', 'setOloDefeated'),
    ('pairBattles', 'setPairBattles'),
    ('npcDefeats', 'setNpcDefeats'),
    ('proa', 'setProa'),
    ('captureCount', 'setCaptureCount'),
    ('lastHealPos', 'setLastHealPos'),
    ('towerKey', 'setTowerKey'),
    ('diplomas', 'setDiplomas'),
]

lines = text.split('\n')

# PASO 1: eliminar las declaraciones. Estas están en:
#   line 78: let lastHealPos = ...
#   line 79-81: let postGame = false, towerOpen = false, oloDefeated = false;
#   line 82-83: let npcDefeats = {}, pairBattles = false;
#   line 84: let proa = ...
#   line 85-90: let towerKey = { ... }
#   line 100: let captureCount = {}
#   line 7878: let diplomas = { ... }

# Buscamos y eliminamos cada declaración. Usamos patrones específicos.
# Estrategia: reemplazar toda la línea (o rango) por un comentario.

# Convertimos a texto para hacer reemplazos más flexibles
new_text = text

# 1. let lastHealPos = { x: 20, y: 145, map: 'world' };
new_text = new_text.replace(
    "let lastHealPos = { x: 20, y: 145, map: 'world' };",
    "// [refactor-game-flags] 'lastHealPos' movido a src/core/game-flags.js"
)

# 2. let postGame = false, towerOpen = false, oloDefeated = false;
new_text = new_text.replace(
    "let postGame = false,\n  towerOpen = false,\n  oloDefeated = false;",
    "// [refactor-game-flags] postGame/towerOpen/oloDefeated movidos a src/core/game-flags.js"
)

# 3. let npcDefeats = {}, pairBattles = false;
new_text = new_text.replace(
    "let npcDefeats = {},\n  pairBattles = false;",
    "// [refactor-game-flags] npcDefeats/pairBattles movidos a src/core/game-flags.js"
)

# 4. let proa = []; // ...
new_text = new_text.replace(
    "let proa = []; // Almacén de criaturas extra",
    "// [refactor-game-flags] 'proa' movido a src/core/game-flags.js"
)

# 5. let towerKey = { ... };  (multilinea)
tower_key_decl = """let towerKey = {
  edison: false,
  roberto: false,
  gabriela: false,
  ximena: false,
};"""
new_text = new_text.replace(
    tower_key_decl,
    "// [refactor-game-flags] 'towerKey' movido a src/core/game-flags.js"
)

# 6. let captureCount = {};
new_text = new_text.replace(
    "let captureCount = {};",
    "// [refactor-game-flags] 'captureCount' movido a src/core/game-flags.js"
)

# 7. let diplomas = { ... }  (multilinea) - busco cerca de línea 7878
# Buscarlo dinámicamente:
diplomas_match = re.search(
    r'let diplomas = \{\s*tamara:[^}]+\};',
    new_text
)
if diplomas_match:
    new_text = new_text.replace(diplomas_match.group(0),
        "// [refactor-game-flags] 'diplomas' movido a src/core/game-flags.js")
    print(f"  ✓ Eliminada declaración de diplomas")

# PASO 2: Reemplazar asignaciones directas por setters
# Patrón: (inicio de línea o después de \n/;)  var = expr
# Ojo: hay que tener cuidado con comparaciones (== o ===) y con .x = ...

def replace_assignment(text_local, var, setter):
    """Reemplaza asignaciones de la forma: <ws>var = X;  →  <ws>setter(X);"""
    count = 0
    # Patrón: al inicio de línea con espacios, o después de otro statement
    # Ejemplo: "  postGame = true;" o "postGame = false;"
    # NO tocar comparaciones como "if (postGame === true)" o accesos "obj.postGame"
    def repl(m):
        nonlocal count
        count += 1
        indent = m.group(1)
        value = m.group(2).rstrip(';').strip()
        return f"{indent}{setter}({value});"

    # Regex: ^(<espacios opcionales>)var\s*=\s*(...);$
    pattern = r'^([ \t]*)' + re.escape(var) + r'\s*=\s*([^\n;]+);'
    text_local = re.sub(pattern, repl, text_local, flags=re.MULTILINE)
    if count > 0:
        print(f"  ✓ Reemplazadas {count} asignaciones de '{var}' → {setter}()")
    return text_local

for var, setter in FLAGS:
    new_text = replace_assignment(new_text, var, setter)

# PASO 3: agregar el import
# Insertamos después del último import de src/render/npc-sprites.js o similar
imports_line = (
    f"\n{MARKER}\n"
    "import {\n"
    "  postGame, towerOpen, oloDefeated, pairBattles,\n"
    "  npcDefeats, proa, captureCount, lastHealPos, towerKey, diplomas,\n"
    "  setPostGame, setTowerOpen, setOloDefeated, setPairBattles,\n"
    "  setNpcDefeats, setProa, setCaptureCount, setLastHealPos,\n"
    "  setTowerKey, setDiplomas,\n"
    "} from './src/core/game-flags.js';\n"
)

# Insertar después del import de trainer-big-sprites.js (último de render)
insert_after = "from './src/render/trainer-big-sprites.js';"
if insert_after in new_text:
    new_text = new_text.replace(
        insert_after,
        insert_after + imports_line
    )
    print(f"  ✓ Añadido import de game-flags.js")
else:
    raise RuntimeError("No encontré dónde anclar el import de game-flags.js")

# Backup
SCRIPT.with_suffix(".js.bak-flags").write_text(text, encoding="utf-8")
SCRIPT.write_text(new_text, encoding="utf-8")

diff_lines = len(new_text.split('\n')) - len(text.split('\n'))
print(f"\n✅ game.js parcheado. Diferencia: {diff_lines:+d} líneas")
