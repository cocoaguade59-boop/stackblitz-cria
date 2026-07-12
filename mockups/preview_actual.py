"""
Simula EXACTAMENTE el mismo dibujo que hace src/render/battle-hud.js
pero desde Python + Pillow, con los mismos tamaños actuales del juego.
Sirve para validar visualmente sin necesidad de abrir StackBlitz.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 640, 480
img = Image.new("RGB", (W, H), (0, 0, 0))
d = ImageDraw.Draw(img)

FONT_PATH = str(Path(__file__).parent / "PressStart2P-Regular.ttf")


def font(size):
    return ImageFont.truetype(FONT_PATH, size)


# Fondo
def draw_bg():
    sky = [(96, 176, 240), (112, 184, 240), (128, 192, 240), (144, 200, 240),
           (160, 208, 240), (176, 216, 240), (192, 224, 240), (208, 232, 248)]
    band = 260 // len(sky)
    for i, c in enumerate(sky):
        d.rectangle([0, i * band, W, (i + 1) * band], fill=c)
    d.rectangle([0, 260, W, H], fill=(88, 168, 72))
    for y in range(272, H, 20):
        d.rectangle([0, y, W, y + 4], fill=(64, 128, 56))
        d.rectangle([0, y + 4, W, y + 5], fill=(48, 96, 40))


draw_bg()

CORNER_EXT = [3, 2, 1, 1, 0, 0]


def _draw_layer(x, y, w, h, color, corners):
    N = len(CORNER_EXT)
    center_start = y + N
    center_end = y + h - N
    if center_end > center_start:
        d.rectangle([x, center_start, x + w, center_end], fill=color)
    for dy in range(N):
        left_cut = CORNER_EXT[dy] if corners.get("tl") else 0
        right_cut = CORNER_EXT[dy] if corners.get("tr") else 0
        if left_cut + right_cut < w:
            d.rectangle([x + left_cut, y + dy,
                         x + w - right_cut, y + dy + 1], fill=color)
        left_cut = CORNER_EXT[dy] if corners.get("bl") else 0
        right_cut = CORNER_EXT[dy] if corners.get("br") else 0
        if left_cut + right_cut < w:
            d.rectangle([x + left_cut, y + h - 1 - dy,
                         x + w - right_cut, y + h - dy], fill=color)


def d_pillow_frame(x, y, w, h, corners):
    _draw_layer(x + 3, y + 3, w, h, (0, 0, 0), corners)
    _draw_layer(x, y, w, h, (32, 32, 40), corners)
    _draw_layer(x + 2, y + 2, w - 4, h - 4, (160, 168, 184), corners)
    _draw_layer(x + 4, y + 4, w - 8, h - 8, (72, 76, 88), corners)
    _draw_layer(x + 6, y + 6, w - 12, h - 12, (200, 208, 216), corners)
    _draw_layer(x + 6, y + 6, w - 12, 2, (232, 236, 244), corners)


def _text_outlined(x, y, text, fnt, fill, outline, size=1):
    for dx in range(-size, size + 1):
        for dy in range(-size, size + 1):
            if dx == 0 and dy == 0:
                continue
            d.text((x + dx, y + dy), text, fill=outline, font=fnt)
    d.text((x, y), text, fill=fill, font=fnt)


def d_ps_label(x, y, h):
    w = 22
    # Borde negro grueso 2px
    d.rectangle([x - 1, y - 1, x + w + 1, y + h + 1], fill=(10, 10, 14))
    # Cuerpo
    d.rectangle([x + 1, y + 1, x + w - 1, y + h - 1], fill=(40, 40, 48))
    fnt = font(8)
    _text_outlined(x + 4, y + 5, "PS", fnt, (248, 216, 56), (64, 40, 8), size=1)
    return w


def d_hp_bar(x, y, w, h, hp, hp_max):
    ratio = max(0, min(1, hp / hp_max))
    d.rectangle([x - 1, y - 1, x + w + 1, y + h + 1], fill=(24, 24, 32))
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


def d_gender(x, y, g):
    if g == "M":
        col = (56, 120, 232)
        d.rectangle([x + 1, y + 4, x + 8, y + 11], fill=col)
        d.rectangle([x, y + 5, x + 9, y + 10], fill=col)
        d.rectangle([x + 3, y + 6, x + 6, y + 9], fill=(232, 232, 240))
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
    "QUE": {"top": (232, 72, 56), "bottom": (128, 24, 24), "outline": (72, 8, 8)},
    "PAR": {"top": (248, 208, 48), "bottom": (192, 112, 32), "outline": (128, 72, 8)},
    "DOR": {"top": (200, 200, 208), "bottom": (96, 96, 104), "outline": (48, 48, 56)},
}


def d_status_badge(x, y, w, h, label):
    st = STATUS[label]
    d.rectangle([x + 2, y + 2, x + w + 2, y + h + 2], fill=(0, 0, 0))
    d.rectangle([x, y, x + w, y + h - 3], fill=st["top"])
    d.rectangle([x, y + h - 3, x + w, y + h], fill=st["bottom"])
    d.rectangle([x, y, x + w, y + h], outline=(24, 24, 32), width=1)
    d.rectangle([x + 1, y + 1, x + w - 1, y + 2],
                fill=(min(st["top"][0] + 40, 255),
                      min(st["top"][1] + 40, 255),
                      min(st["top"][2] + 40, 255)))
    fnt = font(8)
    bbox = d.textbbox((0, 0), label, font=fnt)
    tw = bbox[2] - bbox[0]
    tx = x + (w - tw) // 2
    _text_outlined(tx, y + 3, label, fnt, (255, 255, 255), st["outline"], size=1)


def d_battle_hud(x, y, w, h, cre, is_player, status=None):
    corners = ({"tl": True, "tr": True, "bl": False, "br": True} if is_player
               else {"tl": True, "tr": True, "bl": True, "br": False})
    d_pillow_frame(x, y, w, h, corners)

    inner_left = x + 12
    inner_right = x + w - 12

    # Nombre
    fnt_name = font(11)
    d.text((inner_left, y + 10), cre["nm"], fill=(24, 24, 40), font=fnt_name)

    # Lv
    fnt_lv = font(9)
    lv_text = f"Lv{cre['lv']}"
    bbox = d.textbbox((0, 0), lv_text, font=fnt_lv)
    lv_w = bbox[2] - bbox[0]
    lv_x = inner_right - lv_w
    d.text((lv_x, y + 11), lv_text, fill=(24, 24, 40), font=fnt_lv)

    if cre.get("gender"):
        d_gender(lv_x - 16, y + 11, cre["gender"])

    # Fila estado + PS + barra
    row_y = y + 30
    row_h = 15
    x_cursor = inner_left
    if status:
        badge_w = 38
        d_status_badge(x_cursor, row_y, badge_w, row_h, status)
        x_cursor += badge_w + 5

    ps_w = d_ps_label(x_cursor, row_y, row_h)
    bar_x = x_cursor + ps_w + 2
    bar_end = inner_right
    bar_w = bar_end - bar_x
    bar_h = 10
    bar_y = row_y + (row_h - bar_h) // 2
    d_hp_bar(bar_x, bar_y, bar_w, bar_h, cre["hp"], cre["mHp"])

    if is_player:
        fnt_hp = font(9)
        text = f"{cre['hp']}/{cre['mHp']}"
        bbox = d.textbbox((0, 0), text, font=fnt_hp)
        tw = bbox[2] - bbox[0]
        d.text((inner_right - tw, row_y + row_h + 6),
               text, fill=(24, 24, 40), font=fnt_hp)


# Enemigo (arriba-izquierda), 260x66
d_battle_hud(8, 8, 260, 66,
             {"nm": "Inferpavo", "lv": 42, "gender": "M", "hp": 128, "mHp": 190},
             is_player=False, status="PAR")

# Jugador (abajo-derecha), 260x80
d_battle_hud(370, 232, 260, 80,
             {"nm": "Glaciolote", "lv": 38, "gender": "F", "hp": 34, "mHp": 155},
             is_player=True, status="QUE")

# Otra caja de ejemplo
d_battle_hud(8, 400, 260, 66,
             {"nm": "Pinguchef", "lv": 24, "gender": "M", "hp": 88, "mHp": 100},
             is_player=False, status="DOR")

out = Path(__file__).parent / "battle-ui-actual.png"
img.save(out, "PNG")
print(f"OK -> {out}")
