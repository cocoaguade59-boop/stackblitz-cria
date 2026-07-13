#!/usr/bin/env python3
"""
Auditor RIGUROSO: para cada módulo en src/, revisa que TODOS los símbolos
del juego (definidos en algún módulo con export) estén importados si se
usan. Detecta imports faltantes con precisión.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

# PASO 1: encontrar TODOS los símbolos exportados por el proyecto
all_exports = set()
export_locations = {}  # symbol -> file path
for f in sorted(SRC.rglob('*.js')):
    text = f.read_text(encoding='utf-8')
    for m in re.finditer(r'export\s*\{([^}]+)\}', text):
        for name in m.group(1).split(','):
            name = name.strip()
            if ' as ' in name:
                name = name.split(' as ')[1].strip()
            if name and re.match(r'^\w+$', name):
                all_exports.add(name)
                export_locations[name] = str(f.relative_to(ROOT))

print(f"📦 Símbolos exportados en el proyecto: {len(all_exports)}\n")

# PASO 2: para cada archivo, ver qué símbolos exportados USA sin importar
problems = []
for f in sorted(SRC.rglob('*.js')):
    text = f.read_text(encoding='utf-8')
    filename = str(f.relative_to(ROOT))

    # Símbolos importados
    imported = set()
    for m in re.finditer(r'import\s*\{([^}]+)\}\s*from', text):
        for name in m.group(1).split(','):
            name = name.strip()
            if ' as ' in name:
                name = name.split(' as ')[1].strip()
            if name and re.match(r'^\w+$', name):
                imported.add(name)

    # Símbolos DEFINIDOS localmente (para no marcarlos como faltantes si por casualidad tienen el mismo nombre que un export)
    defined = set()
    for m in re.finditer(r'\b(?:function|class)\s+(\w+)', text):
        defined.add(m.group(1))
    for m in re.finditer(r'\b(?:const|let|var)\s+(\w+)', text):
        defined.add(m.group(1))

    # Quitar comentarios y strings
    clean = re.sub(r'"[^"]*"', '""', text)
    clean = re.sub(r"'[^']*'", "''", clean)
    clean = re.sub(r'`[^`]*`', '``', clean)
    clean = re.sub(r'//.*$', '', clean, flags=re.MULTILINE)
    clean = re.sub(r'/\*.*?\*/', '', clean, flags=re.DOTALL)

    # Para cada símbolo exportado, ver si aparece usado en este archivo
    faltantes = []
    for sym in all_exports:
        if sym in imported or sym in defined:
            continue
        # Skip: el propio archivo no necesita importar lo que exporta
        if export_locations.get(sym) == filename:
            continue
        # Buscar uso: aparición como identifier standalone (no como propiedad .X)
        pattern = r'(?<!\.)\b' + re.escape(sym) + r'\b'
        if re.search(pattern, clean):
            faltantes.append(sym)

    if faltantes:
        problems.append((filename, faltantes))

if not problems:
    print("✅ Cero problemas detectados")
else:
    print(f"⚠️  {len(problems)} archivos con símbolos exportados usados SIN import:\n")
    for path, syms in problems:
        print(f"  📄 {path}:")
        for s in syms:
            loc = export_locations.get(s, '?')
            print(f"     ❌ {s}  (exportado por {loc})")
        print()
