"""Pasa los textos del juego del voseo rioplatense al tuteo peruano y cambia
argentinismos por peruanismos. Solo toca formas con tilde o frases concretas,
así no afecta al código."""
import re, sys
FRASES = [
    ('a vos', 'a ti'), ('A vos', 'A ti'), ('para vos', 'para ti'), ('con vos', 'contigo'), ('de vos', 'de ti'),
    ('Gracias a vos', 'Gracias a ti'), ('vos sos', 'tú eres'), ('¿Vos sos', '¿Tú eres'), ('¡Sos ', '¡Eres '),
    ('Y vos,', 'Y tú,'), ('Vos de nuevo', 'Tú de nuevo'), ('Andá vos', 'Anda tú'), ('vos contra mí', 'tú contra mí'),
    ('que vos no', 'que tú no'), ('Vos...', 'Tú...'), ('Escribí con', 'Escribe con'),
    ('pochoclo', 'canchita'), ('Choripán de utilería', 'Anticuchos de utilería'), ('choripán', 'anticucho'),
    ('a tomar mate', 'a tomar su cafecito'), ('nene', 'chibolo'),
]
PALABRAS = {
    'tomá': 'toma', 'querés': 'quieres', 'combatís': 'combates', 'elegí': 'elige', 'volvé': 'vuelve', 'traé': 'trae',
    'perdés': 'pierdes', 'tenés': 'tienes', 'ponés': 'pones', 'poné': 'pon', 'podés': 'puedes', 'mirá': 'mira',
    'fabricás': 'fabricas', 'dejás': 'dejas', 'tocá': 'toca', 'seguí': 'sigue', 'llevás': 'llevas', 'hablá': 'habla',
    'entrá': 'entra', 'buscá': 'busca', 'andá': 'anda', 'creés': 'crees', 'sabés': 'sabes', 'rendís': 'rindes',
    'elegís': 'eliges', 'dormís': 'duermes', 'conocés': 'conoces', 'cambiás': 'cambias', 'vení': 'ven', 'usá': 'usa',
    'visitá': 'visita', 'venís': 'vienes', 'usás': 'usas', 'traés': 'traes', 'tocás': 'tocas', 'superás': 'superas',
    'subí': 'sube', 'sembrás': 'siembras', 'seguís': 'sigues', 'saludá': 'saluda', 'rezá': 'reza', 'respondés': 'respondes',
    'pulsá': 'pulsa', 'prestá': 'presta', 'peleás': 'peleas', 'peleá': 'pelea', 'pasás': 'pasas', 'paralizás': 'paralizas',
    'mirás': 'miras', 'mareás': 'mareas', 'llegás': 'llegas', 'llamás': 'llamas', 'leé': 'lee', 'hacés': 'haces',
    'ganás': 'ganas', 'esperá': 'espera', 'escuchá': 'escucha', 'encontrás': 'encuentras', 'empezás': 'empiezas',
    'derrotá': 'derrota', 'decís': 'dices', 'cuidá': 'cuida', 'creás': 'creas', 'contás': 'cuentas', 'cocinás': 'cocinas',
    'cambiá': 'cambia', 'buscás': 'buscas', 'avisá': 'avisa', 'animás': 'animas', 'acordás': 'acuerdas', 'viajá': 'viaja',
    'repasá': 'repasa', 'necesitás': 'necesitas', 'llegá': 'llega', 'juntá': 'junta', 'cruzá': 'cruza', 'creá': 'crea',
    'conectá': 'conecta', 'completá': 'completa', 'anotá': 'anota', 'abrí': 'abre', 'recargá': 'recarga', 'sos': 'eres',
    'decile': 'dile', 'deciles': 'diles', 'decime': 'dime', 'traeme': 'tráeme', 'llevale': 'llévale', 'preparate': 'prepárate',
    'avisame': 'avísame', 'pasame': 'pásame', 'mirate': 'mírate', 'llevaselos': 'llévaselos', 'guardalo': 'guárdalo',
    'ganale': 'gánale', 'esperame': 'espérame', 'decíselo': 'díselo', 'bajales': 'bájales', 'bajale': 'bájale', 'contame': 'cuéntame',
    'vos': 'tú', 'ponele': 'ponle', 'fijate': 'fíjate', 'cuidate': 'cuídate', 'quedate': 'quédate', 'animate': 'anímate',
    'ganá': 'gana', 'perdé': 'pierde', 'probá': 'prueba', 'dale': 'dale', 'escribí:': 'escribe:', 'llevá': 'lleva',
    'disfrutá': 'disfruta', 'olvidá': 'olvida', 'hacé': 'haz', 'decí': 'di', 'aplaudís': 'aplaudes', 'salís': 'sales',
}
def caso(orig, nuevo):
    return nuevo[0].upper() + nuevo[1:] if orig[0].isupper() else nuevo
pat = re.compile(r"(?<![A-Za-zÁÉÍÓÚáéíóúñÑ])(" + '|'.join(sorted((re.escape(k) for k in PALABRAS), key=len, reverse=True)) + r")(?![A-Za-zÁÉÍÓÚáéíóúñÑ])", re.I)
total = 0
for ruta in sys.argv[1:]:
    s = open(ruta, encoding='utf8').read(); antes = s
    for a, b in FRASES: s = s.replace(a, b)
    s = pat.sub(lambda m: caso(m.group(0), PALABRAS[m.group(0).lower()]), s)
    if s != antes:
        n = sum(1 for x, y in zip(antes.split('\n'), s.split('\n')) if x != y)
        total += n; open(ruta, 'w', encoding='utf8').write(s); print(ruta, n, 'líneas')
print('total', total)
