"""Convierte hojas de sprites dibujadas al doble de tamaño (4 filas x 4 columnas:
abajo, izquierda, derecha, arriba) en hojas de 4x4 cuadros de 32x32 a escala del juego,
con los pies alineados, y genera js/sprites_usuario.js con las imágenes embebidas
(para que el juego siga abriendo con doble clic).
Uso: python3 tools/importar_sprites.py"""
import base64, io, json, os, sys
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIG = os.path.join(RAIZ, 'assets', 'personajes', 'originales')
SAL = os.path.join(RAIZ, 'assets', 'personajes')
F = 32  # tamaño de cada cuadro en el juego

def mejor_desfase(im):
    px = im.load(); w, h = im.size; mejor = (0, 0, -1)
    for ox in (0, 1):
        for oy in (0, 1):
            ok = tot = 0
            for y in range(oy, h - 1, 2):
                for x in range(ox, w - 1, 2):
                    a = px[x, y]
                    if a[3] == 0 and px[x + 1, y + 1][3] == 0: continue
                    tot += 1; ok += a == px[x + 1, y] == px[x, y + 1] == px[x + 1, y + 1]
            r = ok / max(1, tot)
            if r > mejor[2]: mejor = (ox, oy, r)
    return mejor

def limpiar(celda):
    # borra manchitas sueltas (restos de la fila vecina): componentes de menos de 12 píxeles
    w, h = celda.size; px = celda.load(); visto = set()
    for y in range(h):
        for x in range(w):
            if px[x, y][3] == 0 or (x, y) in visto: continue
            pila, comp = [(x, y)], []
            visto.add((x, y))
            while pila:
                a, b = pila.pop(); comp.append((a, b))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                    n = (a + dx, b + dy)
                    if 0 <= n[0] < w and 0 <= n[1] < h and n not in visto and px[n][3] > 0:
                        visto.add(n); pila.append(n)
            if len(comp) < 12:
                for c in comp: px[c] = (0, 0, 0, 0)
    return celda

def procesar(ruta):
    im = Image.open(ruta).convert('RGBA')
    ox, oy, r = mejor_desfase(im)
    w, h = im.size
    peq = Image.new('RGBA', ((w - ox) // 2, (h - oy) // 2))
    src, dst = im.load(), peq.load()
    for y in range(peq.height):
        for x in range(peq.width):
            p = src[ox + 2 * x, oy + 2 * y]
            dst[x, y] = p if p[3] > 100 else (0, 0, 0, 0)
    cw, ch = peq.width / 4, peq.height / 4
    hoja = Image.new('RGBA', (F * 4, F * 4))
    for fila in range(4):
        cajas = []
        for col in range(4):
            celda = limpiar(peq.crop((round(col * cw), round(fila * ch), round((col + 1) * cw), round((fila + 1) * ch))))
            cajas.append((celda, celda.getbbox()))
        # centro horizontal común de la fila (evita temblores al caminar)
        centros = sorted(((b[0] + b[2]) / 2) for _, b in cajas if b)
        cx = centros[len(centros) // 2]
        for col, (celda, b) in enumerate(cajas):
            if not b: continue
            recorte = celda.crop((0, b[1], celda.width, b[3]))
            x = round(F / 2 - cx) + col * F
            y = (fila + 1) * F - recorte.height  # pies abajo del cuadro
            hoja.alpha_composite(recorte, (max(col * F, x), max(fila * F, y)))
    return hoja, r

datos = {}
for nombre in sorted(os.listdir(ORIG)):
    if not nombre.endswith('.png'): continue
    clave = nombre[:-4]
    hoja, r = procesar(os.path.join(ORIG, nombre))
    hoja.save(os.path.join(SAL, clave + '.png'))
    buf = io.BytesIO(); hoja.save(buf, 'PNG')
    datos[clave] = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    print(clave, 'coincidencia 2x2:', round(r, 2))
with open(os.path.join(RAIZ, 'js', 'sprites_usuario.js'), 'w') as f:
    f.write("'use strict';\n// Sprites de personajes dibujados a mano (generado por tools/importar_sprites.py; no editar).\n")
    f.write('// Cada hoja: 4 filas (abajo, izquierda, derecha, arriba) x 4 cuadros de caminata, 32x32.\n')
    f.write('const SPRITES_USUARIO = ' + json.dumps(datos, indent=1) + ';\n')
