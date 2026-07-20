#!/usr/bin/env python3
"""
Fase 4A del refactor: extrae las 3 fundaciones del render/estado:
  - src/core/canvas.js      (cv, cx)
  - src/core/game-state.js  (G)
  - src/render/render-utils.js  (px, pixelGlow, pixelDiamond)

Estas 3 piezas son las que TODOS los demás módulos de render van a
necesitar importar. Una vez sacadas, en siguientes sub-fases podremos
mover UI, sprites y tiles con seguridad.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "game.js").read_text(encoding="utf-8")
lines = SRC.split("\n")


def slice_lines(a, b):
    return "\n".join(lines[a - 1 : b])


def write_module(path: Path, header: str, body: str, exports: list[str]):
    export_line = "export { " + ", ".join(exports) + " };\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(header + "\n\n" + body + "\n\n" + export_line, encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)}  ({len(body.splitlines())} lines)")


print("== Fase 4A: fundaciones del render ==\n")

# 1) canvas.js — cv, cx (líneas 27..28)
canvas_body = slice_lines(27, 28)
write_module(
    ROOT / "src/core/canvas.js",
    "// Canvas 2D y su contexto. Todo el render depende de estos dos exports.\n"
    "// Sin dependencias externas.",
    canvas_body,
    ["cv", "cx"],
)

# 2) game-state.js — G (líneas 84..124)
gs_body = slice_lines(84, 124)
write_module(
    ROOT / "src/core/game-state.js",
    "// Estado global mutable del juego. Se exporta como instancia única\n"
    "// (todos los módulos que la importen mutan la misma referencia).\n"
    "// Sin dependencias externas.",
    gs_body,
    ["G"],
)

# 3) render-utils.js — px, pixelGlow, pixelDiamond
# Estos están dentro del Bloque 2. Verificamos rangos exactos.
# px:            líneas 218..221 (function px + close)
# pixelGlow:     línea 223..229
# pixelDiamond:  línea 232..~245  (buscar cierre)
# El bloque completo es una sección coherente al inicio de Bloque 2.
# Extraemos desde la línea 218 hasta el final de pixelDiamond.
# Verifico rangos leyendo el archivo.
util_body = slice_lines(218, 241)  # px + pixelGlow + pixelDiamond (con cierre)
write_module(
    ROOT / "src/render/render-utils.js",
    "// Utilidades básicas de dibujo pixel-art: px, pixelGlow, pixelDiamond.\n"
    "// Depende del contexto 2D (cx) de canvas.js.",
    "import { cx } from '../core/canvas.js';\n\n" + util_body,
    ["px", "pixelGlow", "pixelDiamond"],
)

print("\n✅ Fase 4A: módulos creados. game.js aún no modificado.")
