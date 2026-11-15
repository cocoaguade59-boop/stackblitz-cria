# Cómo jugar

> **¿Sos de Windows?** Hacé doble clic en **`JUGAR-AQUI-WINDOWS.bat`** (el que
> está suelto en la carpeta principal). Nada más. Si Windows te muestra un
> cartel de "Windows protegió tu PC", tocá **"Más información" → "Ejecutar de
> todas formas"** (es porque el archivo no tiene firma digital, no porque
> tenga un virus — es tu propio juego).
>
> **Si no querés usar el `.bat`**, también podés hacer doble clic directo en
> **`dist-app\index.html`**. Es lo mismo, un paso menos.

---

## Para Windows

1. Descargá el repo: botón verde **Code → Download ZIP**.
2. Descomprimí el ZIP (clic derecho → **Extraer todo**).
   ⚠️ **Importante:** si hacés doble clic dentro del ZIP sin extraerlo, no
   funciona. Windows muestra los archivos comprimidos como si estuvieran
   sueltos, pero no lo están.
3. Doble clic en **`JUGAR-AQUI-WINDOWS.bat`**.

También podés abrir directamente `dist-app\index.html` con doble clic, sin
usar el lanzador. Funciona igual.

### ⚠️ El error más común

> *"Me sale que tengo que elegir un programa para abrir sh"*

Eso pasa si hacés doble clic en `jugar-en-Linux.sh` (o en el `.command` de Mac).
**Esos son para otros sistemas.** En Windows solo sirve el `.bat`.
Cerrá el cartel con **Cancelar** y abrí el archivo correcto.

Con las extensiones ocultas (lo normal en Windows), los tres archivos se ven
parecidos: `Jugar` , `Jugar` y `jugar`... por eso están ahora en carpetas
separadas:

```
1-WINDOWS\Jugar-en-Windows.bat   ← este es tuyo
2-MAC\Jugar-en-Mac.command       ← no lo toques
3-LINUX\jugar-en-Linux.sh        ← no lo toques
```

Y el de la raíz, `JUGAR-AQUI-WINDOWS.bat`, hace lo mismo que el de la carpeta 1.

---

## Para macOS

Doble clic en **`2-MAC/Jugar-en-Mac.command`**.

La primera vez macOS lo bloquea: **clic derecho → Abrir → Abrir**. Después ya
funciona con doble clic normal.

## Para Linux

Doble clic en **`3-LINUX/jugar-en-Linux.sh`**, o en una terminal:

```bash
./3-LINUX/jugar-en-Linux.sh
```

---

## No necesita internet ni instalar nada

El juego compilado (`dist-app/index.html`, ~620 KB) tiene el código, los
gráficos y la fuente adentro. Funciona sin conexión, en Chrome, Edge, Firefox
y Safari.

Si tu descarga no trajo `dist-app/`, el lanzador intenta compilarlo. Para eso
necesita [Node.js](https://nodejs.org) instalado (una sola vez).

---

## Si querés tocar el código

`dist-app/index.html` es el juego **compilado**: si editás `src/` no cambia
nada ahí. Para desarrollar:

```bash
npm install        # una sola vez
npm run dev        # abre http://localhost:5173 con recarga en vivo
```

Editás un archivo de `src/` o `game.js`, guardás, y el navegador se actualiza
solo. Cuando estés conforme:

```bash
npm run build:app  # regenera dist-app/index.html para repartir
```

| Comando | Qué hace | Para quién |
|---|---|---|
| `npm run dev` | servidor con recarga en vivo | mientras editás |
| `npm run build:app` | **un archivo** `dist-app/index.html` | repartir el juego |
| `npm run build` | build multi-archivo en `dist/` | subir a un hosting |
| `npm test` | 8 suites, 80 aserciones | verificar que no rompiste nada |

---

## Por qué hay dos builds (la trampa clásica)

- **`dist/`** genera `<script type="module" src="/assets/index-xxx.js">`.
  Los módulos ES **no cargan desde `file://`** (el navegador los bloquea por
  CORS) y la ruta es absoluta. Ese build **necesita un servidor**.
- **`dist-app/`** genera un único HTML con el juego inline en formato `iife`
  (sin `import`/`export`), sin rutas absolutas y con la fuente en base64.
  Ese sí abre con doble clic.

`tools/make-standalone.mjs` hace la conversión y **verifica** que no queden
`type="module"`, rutas absolutas ni sintaxis ESM. Si la verificación falla, el
build falla: nunca se entrega un archivo que no abra.

---

## Preguntas frecuentes

**¿Se guarda la partida?**
Sí, en el `localStorage` del navegador. Cada navegador tiene la suya. Para
pasarla a otra computadora: menú → **Partida portátil** → exportar/importar.

En la pantalla de título, debajo de «Continuar», vas a ver un resumen de la
partida guardada:

```
Guardado 1 · Rodaje · 2h 14m · 3 insignias · Lv.18
```

Pueblo donde quedaste, tiempo jugado, insignias de los Proa y nivel del equipo.

**¿Qué teclas se usan?**
`Flechas` mover · **`C` acción** (hablar, confirmar, abrir pines) · `X` menú/volver
· `Z` correr · `P` pausa.
ESPACIO y ENTER siguen funcionando como acción (por si ya tenías la costumbre),
pero el juego te va a pedir `C`.

**Dentro de una batalla**, además:

| Tecla | Qué hace |
|---|---|
| `V` | velocidad ×1 / ×2 (se mantiene entre combates) |
| `C` | confirmar ataque |
| `X` | volver |

**¿Cómo sé si mi ataque va a servir?**
Mirá el borde de la casilla del ataque: **naranja** = pega fuerte,
**azul** = pega poco, **sin borde** = normal. Sin números, sin cuentas.

**¿Y si un movimiento no tiene PP?**
El cursor ya no se detiene en los movimientos agotados: las flechas los saltean
y, si todos están sin PP, te avisa antes de elegir.

**¿Por qué a veces suena una campanita?**
Porque hay algo cerca: un pin para abrir con `C` o alguien con algo nuevo que
contarte. Suena una sola vez por lugar.

**¿Funciona en el celular?**
Sí. En pantallas táctiles aparecen los controles en pantalla (D-pad + A/B).

**¿Y si quiero pasar un link en vez de un archivo?**
`npm run build` y subí la carpeta `dist/` a GitHub Pages, Netlify o Vercel.
`dist-app/index.html` también sirve suelto: es un archivo autónomo.

**Se ve un recuadro negro que no se mueve.**
Ese fue un bug real (corregido en el PR #4). El `<script>` quedaba en el
`<head>`, antes que el `<canvas>`. Como el script clásico no es diferido, corría
cuando el canvas todavía no existía:

```
Cannot read properties of null (reading 'getContext')
```

El juego moría ahí y quedaba el canvas vacío: negro, sin dibujar, para siempre.
Si te pasa, estás abriendo una versión vieja del archivo. Bajá de nuevo el ZIP.

Para diagnosticar cualquier problema: **F12** → pestaña **Console**. Los
mensajes en rojo dicen exactamente qué falló. Copiámelos.

**Se ve todo en blanco / vacío.**
Casi siempre es una de estas dos:
1. Estás abriendo el archivo **de dentro del ZIP** sin descomprimir.
2. Abriste `index.html` de la **raíz** del repo (ese es el de desarrollo y
   necesita servidor). El correcto es `dist-app\index.html`.

**¿Y los gráficos de las criaturas?**
El juego dibuja las criaturas por código (píxel a píxel), así que se ve igual
sin ningún archivo externo. Los 6 PNG que hay en `assets/` (hydrapom, retratos
de NPC y el fondo de batalla del bosque) van **embebidos en base64** dentro del
HTML del build de un solo archivo, para que también aparezcan al abrirlo solo.
Por eso ese archivo pesa 3,2 MB en vez de 620 KB: el fondo del bosque solo ya
son 1,3 MB.
