"""
Simula la nueva dBoxMenu para verificar que los títulos quedan centrados.
Compara antes/después.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

BASE_W, BASE_H = 640, 480
img = Image.new("RGB", (BASE_W, BASE_H), (60, 90, 120))
d = ImageDraw.Draw(img)

FONT_PATH = str(Path(__file__).parent / "PressStart2P-Regular.ttf")


def font(size):
    return ImageFont.truetype(FONT_PATH, size)


def px(x, y, w, h, c):
    d.rectangle([x, y, x + w, y + h], fill=c)


# ---- versión ANTIGUA (bug: alineación izquierda apretada) ----
def dBoxMenu_OLD(x, y, w, h, t):
    d.rectangle([x + 4, y + 4, x + w + 4, y + h + 4], fill=(0, 0, 0, 150))
    d.rectangle([x, y, x + w, y + h], fill=(10, 10, 46))
    d.rectangle([x, y, x + w, y + h], outline=(255, 215, 0), width=4)
    d.rectangle([x + 6, y + 6, x + w - 6, y + h - 6], outline=(139, 105, 20), width=2)
    for cx0, cy0 in [(x, y), (x + w - 8, y), (x, y + h - 8), (x + w - 8, y + h - 8)]:
        d.rectangle([cx0, cy0, cx0 + 8, cy0 + 8], fill=(255, 215, 0))
    if t:
        fnt = font(10)
        titleW = len(t) * 11 + 22
        d.rectangle([x + 20, y - 10, x + 20 + titleW, y + 10], fill=(10, 10, 46))
        d.rectangle([x + 20, y - 10, x + 20 + titleW, y + 10],
                    outline=(255, 215, 0), width=2)
        d.text((x + 28, y - 6), t, fill=(255, 255, 255), font=fnt)


# ---- versión NUEVA (título centrado, ancho medido) ----
def dBoxMenu_NEW(x, y, w, h, t):
    d.rectangle([x + 4, y + 4, x + w + 4, y + h + 4], fill=(0, 0, 0, 150))
    d.rectangle([x, y, x + w, y + h], fill=(10, 10, 46))
    d.rectangle([x, y, x + w, y + h], outline=(255, 215, 0), width=4)
    d.rectangle([x + 6, y + 6, x + w - 6, y + h - 6], outline=(139, 105, 20), width=2)
    for cx0, cy0 in [(x, y), (x + w - 8, y), (x, y + h - 8), (x + w - 8, y + h - 8)]:
        d.rectangle([cx0, cy0, cx0 + 8, cy0 + 8], fill=(255, 215, 0))
    if t:
        fnt = font(10)
        bbox = d.textbbox((0, 0), t, font=fnt)
        textW = bbox[2] - bbox[0]
        padX = 14
        titleW = int(textW + padX * 2)
        titleH = 20
        titleX = x + round((w - titleW) / 2)
        titleY = y - round(titleH / 2)
        d.rectangle([titleX, titleY, titleX + titleW, titleY + titleH], fill=(10, 10, 46))
        d.rectangle([titleX, titleY, titleX + titleW, titleY + titleH],
                    outline=(255, 215, 0), width=2)
        textH = bbox[3] - bbox[1]
        d.text((titleX + (titleW - textW) // 2, titleY + (titleH - textH) // 2 - 1),
               t, fill=(255, 255, 255), font=fnt)


# Ejemplos visuales
d.text((10, 8), "ANTES (title corrido a la izquierda):", fill=(255, 255, 255), font=font(9))
dBoxMenu_OLD(30, 40, 300, 80, "INICIO")
dBoxMenu_OLD(30, 145, 300, 80, "NUEVA AVENTURA")
dBoxMenu_OLD(30, 250, 300, 80, "¡Evolución!")

d.text((350, 8), "DESPUÉS (title centrado):", fill=(200, 255, 200), font=font(9))
dBoxMenu_NEW(360, 40, 260, 80, "INICIO")
dBoxMenu_NEW(360, 145, 260, 80, "NUEVA AVENTURA")
dBoxMenu_NEW(360, 250, 260, 80, "¡Evolución!")

# Un ejemplo grande con caja ancha para ver que se centra bien
d.text((10, 360), "Caja ancha con título centrado:", fill=(255, 255, 255), font=font(9))
dBoxMenu_NEW(30, 395, 580, 70, "MENÚ BATALLADOR")

out = Path(__file__).parent / "title-centering-check.png"
img.save(out, "PNG")
print(f"OK -> {out}")
