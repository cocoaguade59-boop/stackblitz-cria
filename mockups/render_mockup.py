"""
Mockup v6: esquinas redondeadas HACIA AFUERA (convexas) estilo pillow/abombado
en pixel-art. NO se corta material — se AGREGA en las esquinas para
suavizarlas manteniendo los bordes visibles.

- 3 esquinas convexas + 1 esquina en punta (recta) que apunta al dueño.
- Los bordes negro y gris oscuro se respetan y se ven en el contorno.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

BASE_W, BASE_H = 640, 480
img = Image.new("RGB", (BASE_W, BASE_H), (0, 0, 0))
d = ImageDraw.Draw(img)

FONT_PATH = str(Path(__file__).parent / "PressStart2P-Regular.ttf")


def font(size):
    try:
        return ImageFont.truetype(FONT_PATH, size)
    except Exception:
        return ImageFont.load_default()


# ------------------------------------------------------------------
# Fondo
# ------------------------------------------------------------------
def draw_bg():
    sky = [(96, 176, 240), (112, 184, 240), (128, 192, 240), (144, 200, 240),
           (160, 208, 240), (176, 216, 240), (192, 224, 240), (208, 232, 248)]
    band = 260 // len(sky)
    for i, c in enumerate(sky):
        d.rectangle([0, i * band, BASE_W, (i + 1) * band], fill=c)
    d.rectangle([0, 260, BASE_W, BASE_H], fill=(88, 168, 72))
    for y in range(272, BASE_H, 20):
        d.rectangle([0, y, BASE_W, y + 4], fill=(64, 128, 56))
        d.rectangle([0, y + 4, BASE_W, y + 5], fill=(48, 96, 40))


draw_bg()


# ------------------------------------------------------------------
# Recuadro con esquinas CONVEXAS pixel-art
# ------------------------------------------------------------------
# La idea: el rectángulo base es el "cuerpo", y en cada esquina que queramos
# convexa AÑADIMOS píxeles adicionales que crean la ilusión de curvatura
# hacia afuera. El patrón clásico pixel-art es:
#
#     . . X X X X       (fila -3): 4 píxeles horizontales
#     . X X X X X       (fila -2): 5 píxeles
#     X X X X X X       (fila -1): 6 píxeles
#     X X X X X X       (fila 0):  6 píxeles (esta ya es del rect)
#
# Al hacerlo simétrico en las 2 direcciones da una esquina "abombada".
# ------------------------------------------------------------------

def draw_pillow_frame(x, y, w, h, corners):
    """
    Dibuja un recuadro biselado 32-bit con esquinas convexas (pillow).
    corners: dict {"tl": bool, "tr": bool, "bl": bool, "br": bool}
    True = convexa, False = punta recta (esquina normal a 90°)
    """
    # Radio de curvatura (en píxeles). Con R=6 y "peldaños" de 1px queda
    # una curva bonita tipo GBA/SNES.
    R = 5

    # Patrón de curvatura: para cada distancia radial, cuántos píxeles avanzar.
    # Definimos el "recorte" en cada fila cerca de la esquina.
    # ext[i] = cuántos píxeles EXTRA hay que quitar en la fila i-ésima
    # desde la esquina hacia dentro (0 = ninguno, R = toda la esquina).
    # Patrón suave: 3, 2, 1, 0, 0, 0
    ext = [3, 2, 1, 1, 0, 0]  # 6 filas

    # ----- Función para saber si un pixel dentro del rect debe DIBUJARSE -----
    def should_draw(px, py, rx, ry, rw, rh):
        """
        rx, ry = coord del rect a evaluar
        rw, rh = dimensiones de ese rect
        px, py = pixel absoluto
        Devuelve True si el pixel debería estar dibujado (dentro de la forma).
        """
        if px < rx or px >= rx + rw or py < ry or py >= ry + rh:
            return False
        # Distancia a cada esquina
        dx_left = px - rx
        dx_right = (rx + rw - 1) - px
        dy_top = py - ry
        dy_bot = (ry + rh - 1) - py

        # Esquina superior-izquierda
        if corners.get("tl") and dx_left < len(ext) and dy_top < len(ext):
            # Cuánto recortar en esta fila (contando desde el borde superior)
            cut = ext[dy_top]
            if dx_left < cut:
                return False
        # Esquina superior-derecha
        if corners.get("tr") and dx_right < len(ext) and dy_top < len(ext):
            cut = ext[dy_top]
            if dx_right < cut:
                return False
        # Esquina inferior-izquierda
        if corners.get("bl") and dx_left < len(ext) and dy_bot < len(ext):
            cut = ext[dy_bot]
            if dx_left < cut:
                return False
        # Esquina inferior-derecha
        if corners.get("br") and dx_right < len(ext) and dy_bot < len(ext):
            cut = ext[dy_bot]
            if dx_right < cut:
                return False
        return True

    # ---- Dibujar por capas usando should_draw ----
    layers = [
        # (offset_x, offset_y, ancho_extra, alto_extra, color)
        (3, 3, 0, 0, (0, 0, 0)),           # sombra
        (0, 0, 0, 0, (32, 32, 40)),         # borde exterior oscuro
        (2, 2, -4, -4, (160, 168, 184)),    # metálico claro
        (4, 4, -8, -8, (72, 76, 88)),       # borde interior oscuro
        (6, 6, -12, -12, (200, 208, 216)),  # fondo plateado
    ]
    for ox, oy, dw, dh, color in layers:
        rx = x + ox
        ry = y + oy
        rw = w + dw
        rh = h + dh
        if rw <= 0 or rh <= 0:
            continue
        for py in range(ry, ry + rh):
            for px in range(rx, rx + rw):
                if should_draw(px, py, rx, ry, rw, rh):
                    img.putpixel((px, py), color)

    # Highlight superior 2px de alto
    for py in range(y + 6, y + 8):
        for px in range(x + 6, x + w - 6):
            if should_draw(px, py, x + 6, y + 6, w - 12, h - 12):
                img.putpixel((px, py), (232, 236, 244))


# ------------------------------------------------------------------
# Texto con outline
# ------------------------------------------------------------------
def draw_text_outlined(x, y, text, fnt, fill, outline, size=1):
    for dx in range(-size, size + 1):
        for dy in range(-size, size + 1):
            if dx == 0 and dy == 0:
                continue
            d.text((x + dx, y + dy), text, fill=outline, font=fnt)
    d.text((x, y), text, fill=fill, font=fnt)


def draw_ps_label(x, y, h):
    w = 26
    d.rectangle([x, y, x + w, y + h], fill=(40, 40, 48))
    d.rectangle([x, y, x + w, y + h], outline=(16, 16, 20), width=1)
    fnt = font(10)
    text = "PS"
    bbox = d.textbbox((0, 0), text, font=fnt)
    tw = bbox[2] - bbox[0]
    tx = x + (w - tw) // 2
    ty = y + 3
    draw_text_outlined(tx, ty, text, fnt,
                       fill=(248, 216, 56), outline=(64, 40, 8), size=1)


def draw_hp_bar(x, y, w, h, ratio):
    ratio = max(0.0, min(1.0, ratio))
    d.rectangle([x - 1, y - 1, x + w + 1, y + h + 1], fill=(24, 24, 28))
    d.rectangle([x, y, x + w, y + h], fill=(56, 56, 64))
    if ratio > 0.5:
        light, dark = (112, 232, 96), (48, 144, 40)
    elif ratio > 0.2:
        light, dark = (248, 208, 40), (176, 120, 8)
    else:
        light, dark = (240, 72, 56), (144, 32, 24)
    fw = int(w * ratio)
    if fw > 0:
        d.rectangle([x, y, x + fw, y + h], fill=dark)
        d.rectangle([x, y, x + fw, y + h - 2], fill=light)
        d.rectangle([x, y, x + fw, y + 1], fill=(255, 255, 255))


def draw_gender(x, y, g):
    if g == "M":
        col = (48, 120, 232)
        d.rectangle([x + 1, y + 4, x + 8, y + 11], fill=col)
        d.rectangle([x, y + 5, x + 9, y + 10], fill=col)
        d.rectangle([x + 3, y + 6, x + 6, y + 9], fill=(230, 230, 240))
        d.rectangle([x + 6, y + 1, x + 12, y + 5], fill=col)
        d.rectangle([x + 9, y, x + 12, y + 4], fill=col)
        d.rectangle([x + 10, y, x + 12, y + 2], fill=col)
    else:
        col = (232, 96, 152)
        d.rectangle([x + 1, y + 1, x + 8, y + 9], fill=col)
        d.rectangle([x, y + 2, x + 9, y + 8], fill=col)
        d.rectangle([x + 3, y + 3, x + 6, y + 7], fill=(240, 220, 230))
        d.rectangle([x + 3, y + 9, x + 6, y + 14], fill=col)
        d.rectangle([x + 1, y + 11, x + 8, y + 13], fill=col)


STATUS = {
    "PAR": {"top": (248, 208, 48),  "bottom": (192, 112, 32), "outline": (128, 72, 8)},
    "QUE": {"top": (232, 72, 56),   "bottom": (128, 24, 24),  "outline": (72, 8, 8)},
    "DOR": {"top": (200, 200, 208), "bottom": (96, 96, 104),  "outline": (48, 48, 56)},
}


def draw_status_badge(x, y, label, w=48, hh=18):
    st = STATUS[label]
    d.rectangle([x + 2, y + 2, x + w + 2, y + hh + 2], fill=(0, 0, 0))
    d.rectangle([x, y, x + w, y + hh - 4], fill=st["top"])
    d.rectangle([x, y + hh - 4, x + w, y + hh], fill=st["bottom"])
    d.rectangle([x, y, x + w, y + hh], outline=(24, 24, 28), width=1)
    d.rectangle([x + 1, y + 1, x + w - 1, y + 2],
                fill=(min(st["top"][0] + 40, 255),
                      min(st["top"][1] + 40, 255),
                      min(st["top"][2] + 40, 255)))
    fnt = font(10)
    bbox = d.textbbox((0, 0), label, font=fnt)
    tw = bbox[2] - bbox[0]
    tx = x + (w - tw) // 2
    ty = y + 3
    draw_text_outlined(tx, ty, label, fnt,
                       fill=(255, 255, 255), outline=st["outline"], size=1)


def draw_creature_data(x, y, w, h, name, level, gender, hp, hp_max,
                       status=None, show_numbers=False):
    inner_left = x + 14
    inner_right = x + w - 14

    fnt_name = font(14)
    d.text((inner_left, y + 12), name, fill=(24, 24, 40), font=fnt_name)

    fnt_lv = font(12)
    lv_text = f"Lv{level}"
    bbox = d.textbbox((0, 0), lv_text, font=fnt_lv)
    lv_w = bbox[2] - bbox[0]
    lv_x = inner_right - lv_w
    d.text((lv_x, y + 14), lv_text, fill=(24, 24, 40), font=fnt_lv)
    draw_gender(lv_x - 18, y + 14, gender)

    row_y = y + 40
    row_h = 18
    x_cursor = inner_left
    if status:
        draw_status_badge(x_cursor, row_y, status, w=48, hh=row_h)
        x_cursor += 48 + 6

    ps_w = 26
    draw_ps_label(x_cursor, row_y, row_h)
    bar_x = x_cursor + ps_w + 1
    bar_end = inner_right
    bar_w = bar_end - bar_x
    bar_h = 12
    bar_y = row_y + (row_h - bar_h) // 2
    draw_hp_bar(bar_x, bar_y, bar_w, bar_h, hp / hp_max)

    if show_numbers:
        fnt_hp = font(11)
        text = f"{hp}/{hp_max}"
        bbox = d.textbbox((0, 0), text, font=fnt_hp)
        tw = bbox[2] - bbox[0]
        d.text((inner_right - tw, row_y + row_h + 8),
               text, fill=(24, 24, 40), font=fnt_hp)


# ------------------------------------------------------------------
# RENDER
# ------------------------------------------------------------------
CAJA_W = 310

# Enemigo: 3 esquinas convexas + inferior-derecha en PUNTA (recta)
draw_pillow_frame(20, 30, CAJA_W, 84, {
    "tl": True, "tr": True, "bl": True, "br": False,
})
draw_creature_data(20, 30, CAJA_W, 84, "Inferpavo", 42, "M", 128, 190,
                   status="PAR", show_numbers=False)

# Jugador: 3 esquinas convexas + inferior-izquierda en PUNTA
draw_pillow_frame(310, 295, CAJA_W, 100, {
    "tl": True, "tr": True, "bl": False, "br": True,
})
draw_creature_data(310, 295, CAJA_W, 100, "Glaciolote", 38, "F", 34, 155,
                   status="QUE", show_numbers=True)

# Otro ejemplo con DOR
draw_pillow_frame(20, 388, CAJA_W, 84, {
    "tl": True, "tr": True, "bl": True, "br": False,
})
draw_creature_data(20, 388, CAJA_W, 84, "Pinguchef", 24, "M", 88, 100,
                   status="DOR", show_numbers=False)

out = Path(__file__).parent / "battle-ui-mockup-v6.png"
img.save(out, "PNG")
print(f"OK -> {out}")
