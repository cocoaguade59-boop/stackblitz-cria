"""
Verifica la NUEVA version de dBoxMenu title: banda POR ENCIMA de la caja
(no partida), texto claramente dentro de la banda.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 640, 480
img = Image.new("RGB", (W, H), (60, 90, 60))  # verde tipo mundo del juego
d = ImageDraw.Draw(img)
FONT_PATH = str(Path(__file__).parent / "PressStart2P-Regular.ttf")


def font(size):
    return ImageFont.truetype(FONT_PATH, size)


def dBoxMenu(x, y, w, h, t):
    # Sombra
    d.rectangle([x + 4, y + 4, x + w + 4, y + h + 4], fill=(0, 0, 0))
    # Fondo azul noche
    d.rectangle([x, y, x + w, y + h], fill=(10, 10, 46))
    # Borde dorado exterior grueso (4 px)
    d.rectangle([x, y, x + w, y + h], outline=(255, 215, 0), width=4)
    # Borde dorado interior (2 px)
    d.rectangle([x + 6, y + 6, x + w - 6, y + h - 6], outline=(139, 105, 20), width=2)
    # Esquinas doradas
    for cx0, cy0 in [(x, y), (x + w - 8, y), (x, y + h - 8), (x + w - 8, y + h - 8)]:
        d.rectangle([cx0, cy0, cx0 + 8, cy0 + 8], fill=(255, 215, 0))
        # detalle interno
    for cx0, cy0 in [(x + 2, y + 2), (x + w - 6, y + 2),
                     (x + 2, y + h - 6), (x + w - 6, y + h - 6)]:
        d.rectangle([cx0, cy0, cx0 + 4, cy0 + 4], fill=(26, 26, 62))

    # ---- BANDA DEL TÍTULO (NUEVA versión) ----
    if t:
        fnt = font(10)
        bbox = d.textbbox((0, 0), t, font=fnt)
        text_w = bbox[2] - bbox[0]
        pad_x = 12
        pad_y = 5
        font_size = 10
        title_w = text_w + pad_x * 2
        title_h = font_size + pad_y * 2   # 20
        title_x = x + round((w - title_w) / 2)
        title_y = y - title_h              # banda POR ENCIMA
        # fondo
        d.rectangle([title_x, title_y, title_x + title_w, title_y + title_h],
                    fill=(10, 10, 46))
        # borde dorado
        d.rectangle([title_x, title_y, title_x + title_w, title_y + title_h],
                    outline=(255, 215, 0), width=2)
        # texto arriba-izquierda + padding
        # medimos el bbox top para posicionar bien
        text_top = bbox[1]
        d.text((title_x + pad_x, title_y + pad_y - text_top),
               t, fill=(255, 255, 255), font=fnt)


# Ejemplos
d.text((10, 8), "INICIO (corto)", fill=(255, 255, 255), font=font(7))
dBoxMenu(30, 60, 260, 100, "INICIO")

d.text((330, 8), "NUEVA AVENTURA (medio)", fill=(255, 255, 255), font=font(7))
dBoxMenu(340, 60, 280, 100, "NUEVA AVENTURA")

d.text((10, 220), "MENU BATALLADOR (largo)", fill=(255, 255, 255), font=font(7))
dBoxMenu(30, 260, 380, 120, "MENU BATALLADOR")

d.text((10, 400), "¡Evolucion completa!", fill=(255, 255, 255), font=font(7))
dBoxMenu(430, 260, 190, 120, "¡Evolucion!")

out = Path(__file__).parent / "title-check-v2.png"
img.save(out, "PNG")
print(f"OK -> {out}")
