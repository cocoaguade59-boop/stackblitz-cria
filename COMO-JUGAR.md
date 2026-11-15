# Cómo jugar (sin StackBlitz, sin internet, sin instalar nada)

## Opción 1 — La más simple: doble clic

Descargá el repo (botón verde **Code → Download ZIP**, y descomprimilo).

| Sistema | Qué hacer |
|---|---|
| **Windows** | Doble clic en **`Jugar.bat`** |
| **macOS** | Doble clic en **`Jugar.command`** (la primera vez: clic derecho → Abrir) |
| **Linux** | Doble clic en **`jugar.sh`**, o `./jugar.sh` en la terminal |

Se abre el juego en tu navegador y ya podés jugar. **No hace falta internet**
después de descargar: la fuente está embebida y todo el juego vive en un solo
archivo de ~620 KB.

Si el lanzador dice que falta Node.js, es porque el archivo compilado no vino
en tu descarga. En ese caso:

- **Opción A:** instalá [Node.js](https://nodejs.org) (una sola vez) y volvé a
  hacer doble clic en el lanzador: compila y abre solo.
- **Opción B:** abrí directamente `dist-app/index.html`.

También podés abrir `dist-app/index.html` con doble clic sin usar el lanzador.
Funciona en Chrome, Edge, Firefox y Safari.

## Opción 2 — Si querés tocar el código

El archivo de `dist-app/` es **el juego compilado**: si editás `src/` no cambia.
Para desarrollar:

```bash
npm install       # una sola vez
npm run dev       # abre http://localhost:5173 con recarga automática
```

Editás cualquier archivo de `src/` o `game.js`, guardás, y el navegador se
actualiza solo. Cuando estés conforme:

```bash
npm run build:app   # regenera dist-app/index.html para repartir
```

## Qué es cada comando

| Comando | Qué hace | Para quién |
|---|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en vivo | vos, mientras editás |
| `npm run build:app` | **Un solo archivo** `dist-app/index.html` (~620 KB) | repartir el juego |
| `npm run build` | Build multi-archivo en `dist/` | subir a un hosting (GitHub Pages, Netlify) |
| `npm test` | 8 suites, 80 aserciones | comprobar que no rompiste nada |

## Los dos builds, explicados

Hay una trampa clásica acá, así que conviene saberla:

- **`dist/`** genera `<script type="module" src="/assets/index-xxx.js">`.
  Los módulos ES **no cargan desde `file://`** (el navegador los bloquea por
  CORS), y la ruta `/assets/...` es absoluta. Ese build **necesita un servidor**.
- **`dist-app/`** genera un único HTML con el juego inline en formato `iife`
  (sin `import`/`export`), sin rutas absolutas y con la fuente en base64. Ese
  sí funciona con doble clic.

`tools/make-standalone.mjs` es el que hace la conversión y **verifica** que no
queden `type="module"`, rutas absolutas ni sintaxis ESM. Si esa verificación
falla, el build falla: nunca te va a entregar un archivo que no abra.

## Preguntas frecuentes

**¿Se guarda la partida?**
Sí, en el `localStorage` del navegador. Cada navegador tiene la suya. Para
moverla entre navegadores: menú → **Partida portátil** → exportar/importar.

**¿Funciona en el celular?**
Sí. En pantallas táctiles aparecen los controles en pantalla (D-pad + A/B).

**¿Y si quiero subirlo a internet para pasar un link?**
`npm run build` y subí la carpeta `dist/` a GitHub Pages, Netlify o Vercel.
También sirve `dist-app/index.html` solo: es un archivo autónomo.
