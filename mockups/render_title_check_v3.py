"""
Verifica que el título ahora quede bien:
- Banda amarilla POR ENCIMA de la caja
- Texto DENTRO de la banda
- Y que el textAlign del contexto NO se rompa después
  (o sea que los textos siguientes en el centro sigan centrados)
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 640, 480
img = Image.new("RGB", (W, H), (30, 90, 30))  # verde tipo mundo
d = ImageDraw.Draw(img)
FONT_PATH = str(Path(__file__).parent / "PressStart2P-Regular.ttf")


def font(size):
    return ImageFont.truetype(FONT_PATH, size)


def dBoxMenu(x, y, w, h, t):
    # Fondo azul noche
    d.rectangle([x, y, x + w, y + h], fill=(10, 10, 46))
    # Borde dorado exterior grueso (4 px)
    d.rectangle([x, y, x + w, y + h], outline=(255, 215, 0), width=4)
    # Borde dorado interior (2 px)
    d.rectangle([x + 6, y + 6, x + w - 6, y + h - 6], outline=(139, 105, 20), width=2)
    # Esquinas
    for cx0, cy0 in [(x, y), (x + w - 8, y), (x, y + h - 8), (x + w - 8, y + h - 8)]:
        d.rectangle([cx0, cy0, cx0 + 8, cy0 + 8], fill=(255, 215, 0))
    # Título (nueva versión)
    if t:
        fnt = font(10)
        bbox = d.textbbox((0, 0), t, font=fnt)
        text_w = bbox[2] - bbox[0]
        text_top = bbox[1]
        pad_x = 12
        pad_y = 5
        font_size = 10
        title_w = text_w + pad_x * 2
        title_h = font_size + pad_y * 2
        title_x = x + round((w - title_w) / 2)
        title_y = y - title_h
        d.rectangle([title_x, title_y, title_x + title_w, title_y + title_h],
                    fill=(10, 10, 46))
        d.rectangle([title_x, title_y, title_x + title_w, title_y + title_h],
                    outline=(255, 215, 0), width=2)
        d.text((title_x + pad_x, title_y + pad_y - text_top),
               t, fill=(255, 255, 255), font=fnt)


# ---- Simular pantalla del título ----
# Placa clara arriba
d.rectangle([88, 34, 552, 152], fill=(210, 190, 130))
d.rectangle([96, 40, 544, 44], fill=(255, 245, 200))
# Texto del logo
lfnt = font(18)
lfnt_big = font(28)
t1 = "CRIATURAS DEL"
t2 = "REINO"
bbox1 = d.textbbox((0, 0), t1, font=lfnt)
bbox2 = d.textbbox((0, 0), t2, font=lfnt_big)
d.text((320 - (bbox1[2]-bbox1[0])//2, 81), t1, fill=(255, 224, 112), font=lfnt)
d.text((320 - (bbox2[2]-bbox2[0])//2, 121 - bbox2[1]), t2, fill=(255, 224, 112), font=lfnt_big)

# ---- Caja INICIO en el fondo ----
dBoxMenu(96, 360, 448, 108, "INICIO")

# ---- Opciones dentro de la caja (con textAlign='center' respetado) ----
opts_fnt = font(8)
opts = ["Continuar partida guardada", "Nueva partida desde Aldea Pitch"]
for i, o in enumerate(opts):
    text = ("> " if i == 0 else "  ") + o
    bbox = d.textbbox((0, 0), text, font=opts_fnt)
    tw = bbox[2] - bbox[0]
    color = (255, 215, 0) if i == 0 else (216, 216, 232)
    d.text((320 - tw//2, 396 + i*28), text, fill=color, font=opts_fnt)

# Footer
foot_fnt = font(6)
foot = "Flechas = elegir | SPACE = confirmar"
bbox = d.textbbox((0, 0), foot, font=foot_fnt)
d.text((320 - (bbox[2]-bbox[0])//2, 460), foot, fill=(96, 104, 120), font=foot_fnt)

out = Path(__file__).parent / "title-check-v3.png"
img.save(out, "PNG")
print(f"OK -> {out}")
