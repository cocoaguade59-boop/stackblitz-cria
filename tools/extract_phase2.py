#!/usr/bin/env python3
"""
Fase 2 del refactor: Extrae utilidades independientes (audio, sprite loader,
save/load, skin colors, música) del script.js hacia módulos ES.

No destructivo: solo escribe los archivos nuevos. El parche en script.js
va aparte (patch_phase2.py).
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / "script.js").read_text(encoding="utf-8")
lines = SRC.split("\n")


def slice_lines(start_1based, end_1based):
    return "\n".join(lines[start_1based - 1 : end_1based])


def write_module(path: Path, header: str, body: str, exports: list[str]):
    export_line = "export { " + ", ".join(exports) + " };\n" if exports else ""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(header + "\n\n" + body + "\n\n" + export_line, encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)}  ({len(body.splitlines())} lines)")


# --- Rangos (1-indexed) verificados en el script actual ---
# script.js linea 20-39: SPRITE_LOADER + su .load('hydrapom')
# script.js linea 68-146: class SFX + const sfx
# script.js linea 151-167: SAVE_KEY, hasSaveGame, clearAllGameSaves
# script.js linea 1443-1449: SK skin colors
# script.js linea 18248-18365: música (SONGS, playMusic, stopMusic, updateMusic)

print("== Fase 2: extrayendo utilidades ==\n")

# 1) sprite-loader.js
sl_body = slice_lines(20, 39)
write_module(
    ROOT / "src/core/sprite-loader.js",
    "// Cargador de sprites PNG desde assets/sprites/<id>.png\n"
    "// Sin dependencias externas.",
    sl_body,
    ["SPRITE_LOADER"],
)

# 2) audio.js  — clase SFX + instancia sfx
audio_body = slice_lines(68, 146)
write_module(
    ROOT / "src/core/audio.js",
    "// Motor de audio: sintetizador de efectos de sonido con Web Audio API.\n"
    "// Sin dependencias externas.",
    audio_body,
    ["SFX", "sfx"],
)

# 3) save.js — SAVE_KEY, hasSaveGame, clearAllGameSaves
save_body = slice_lines(151, 167)
write_module(
    ROOT / "src/core/save.js",
    "// Helpers de persistencia con localStorage.\n"
    "// Las funciones saveGame/loadGame completas siguen en script.js (usan G global).\n"
    "// Sin dependencias externas.",
    save_body,
    ["SAVE_KEY", "hasSaveGame", "clearAllGameSaves"],
)

# 4) skin-colors.js — paleta SK (líneas 1443..1450, incluye el '};' de cierre)
skin_body = slice_lines(1443, 1450)
write_module(
    ROOT / "src/render/skin-colors.js",
    "// Paleta de colores de piel para NPCs.\n"
    "// Sin dependencias externas.",
    skin_body,
    ["SK"],
)

# 5) music.js — SONGS + playMusic/stopMusic (NO updateMusic, que usa G global)
# El bloque va de línea 18248 (SONGS) hasta 18355 (fin de stopMusic).
# updateMusic (18357-18365) usa G, la dejamos en script.js.
music_body = slice_lines(18248, 18361)
# Importa `sfx` porque playMusic lo usa.
music_header = (
    "// Motor de música procedural con osciladores.\n"
    "// Depende de la instancia `sfx` de audio.js."
)
music_body = "import { sfx } from './audio.js';\n\n" + music_body
write_module(
    ROOT / "src/core/music.js",
    music_header,
    music_body,
    ["SONGS", "playMusic", "stopMusic"],
)

print("\n✅ Fase 2: módulos creados. script.js aún no modificado.")
