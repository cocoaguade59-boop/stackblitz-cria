#!/usr/bin/env python3
"""
Patch Fase 4C: reemplaza el Bloque 3 en game.js por un import.
Idempotente.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "game.js"
text = SCRIPT.read_text(encoding="utf-8")

MARKER = "// [refactor-phase4c] sprite del jugador importado"
if MARKER in text:
    print("⏭  patch_phase4c.py ya se aplicó.")
    raise SystemExit(0)

lines = text.split("\n")

# Rango del Bloque 3: líneas 202-582 (contenido, sin el banner)
# Sanity check: línea 202 debe ser "// === NUEVO SPRITE DEL JUGADOR..."
start = 202
end = 582
got = lines[start - 1]
if "NUEVO SPRITE DEL JUGADOR" not in got:
    raise RuntimeError(f"Sanity failed: esperaba 'NUEVO SPRITE DEL JUGADOR' en línea {start}, got: {got!r}")

# Última línea debe cerrar dPlayerBig (una llave de cierre)
got_end = lines[end - 1]
if got_end.strip() != "}":
    raise RuntimeError(f"Sanity failed: esperaba '}}' en línea {end}, got: {got_end!r}")

print("✅ Sanity checks OK. Aplicando parche...")

# Construir nuevas líneas: reemplazamos rango [start..end] por un stub
new_lines = lines[:start - 1] + [
    "// [refactor-phase4c] bloque 3 (sprite del jugador) movido a src/render/player-sprite.js"
] + lines[end:]

# Insertar el import después del último import de Fase 4B (notifications-draw)
IMPORTS = (
    f"\n{MARKER}\n"
    "import { dPlayerGBA } from './src/render/player-sprite.js';\n"
)

insert_idx = None
for idx, l in enumerate(new_lines):
    if "from './src/render/notifications-draw.js'" in l:
        insert_idx = idx + 1
        break
if insert_idx is None:
    raise RuntimeError("No encontré el import de notifications-draw para anclar Fase 4C.")

new_lines.insert(insert_idx, IMPORTS)

new_text = "\n".join(new_lines)

# Backup
SCRIPT.with_suffix(".js.bak4c").write_text(text, encoding="utf-8")
SCRIPT.write_text(new_text, encoding="utf-8")

print(f"✅ game.js parcheado.")
print(f"   Antes: {len(lines)} líneas → Después: {len(new_lines)} líneas")
print(f"   Backup: game.js.bak4c")
