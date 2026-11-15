# Bloque 2 — bugs de estado, caché y delta time

**Rama:** `arena/c5315ad3-stackblitz-cria` · **Base:** `main` @ `3f5e31d`

Cierra los puntos 1, 2, 3, 4, 5, 6, 7 y 8 de `docs/auditoria-codigo-y-lag.md`.

---

## 1. 🔴 El menú ejecutaba otra cosa de la que mostraba (arreglado)

`dMenu` (dibujo, `src/screens/menu.js`) y `uMenu` (lógica, inline en `game.js`) tenían **cada uno su copia** de la lista de opciones. Al agregar "Partida portátil" en el PR #1 sólo se actualizó una:

| Índice | mostraba | ejecutaba |
|---|---|---|
| 9 | Partida portátil | Volver |
| 10 | Volver | **Reiniciar toda la partida** |
| 11 | Reiniciar toda la partida | nada |

**Arreglo:** `uMenu`, `getMenuOpts`, `dMenu` viven **sólo** en `src/screens/menu.js`; `game.js` los importa. Se eliminó la copia inline.

## 2. 🔴 El progreso de las misiones Proa se perdía (arreglado)

`LEADER_MISSIONS` (golpes súper efectivos de Luchito, quiz de Andrea, chismes de Dan) no se guardaba, no se cargaba, y `resetGame()` no lo limpiaba.

- **Síntoma 1:** acumulabas 2 golpes, guardabas y cerrabas → volvía a 0. El diploma "Documental" era imposible en varias sesiones.
- **Síntoma 2:** reiniciar la partida conservaba el contador viejo → diploma gratis en partida nueva.

**Arreglo:** `getProaMissionProgress()` / `applyProaMissionProgress()` en `src/data/proa-missions.js`, conectados a `buildSaveObject()` y `loadGame()`. `resetGame()` ahora llama a `resetLeaderMissions()`.

**Bonus, bug encontrado mientras escribía el test:** `dan.reported` nunca se inicializaba (`undefined`), así que `reported.push(...)` lanzaba `TypeError` al reportar **el primer chisme**. Dan era injugable. Ahora arranca en `[]`.

## 3. 🔴 Las 5 pantallas duplicadas (unificadas)

Se eliminaron **~230 líneas** de copias inline divergentes en `game.js`:

| Pantalla | Inline | Módulo | Estado |
|---|---|---|---|
| `uTitle` | sí | sí | **diferentes** (inline tenía `optCount = 2` fijo) |
| `uIntro` | sí | sí | idénticas (37 líneas duplicadas 1:1) |
| `uStarter` | sí | sí | **diferentes** (spawn) |
| `uMenu` + `getMenuOpts` | sí | sí | **desincronizadas** (bug §1) |
| `startNewGameFlow` | sí | sí | **diferentes** (273 chars) |

Se conservó la versión **que realmente se ejecutaba** en cada caso (el inline de `startNewGameFlow`, que reseteaba inventario, y el `EXPANDED_SPAWN` de `uStarter`), y se unificó el spawn con `EXPANDED_SPAWN.player` en `title.js` y `starter.js`.

`game.js`: **7 440 → 7 217 líneas**.

## 4. 🟠 Lag: caché de sprites (el mayor ahorro)

`creature-sprites.js` redibujaba cada criatura pixel a pixel **en cada frame**: 2 654 líneas de `fillRect`, media de **29.8 operaciones por sprite**, hasta 91. En batalla son 2 sprites grandes más el HUD, 60 veces por segundo.

**Arreglo:** cada sprite se rasteriza **una vez** en un canvas offscreen y se blitea con `drawImage`.

- Clave de caché: `id + min(lv,5) + bob redondeado` → el bob de `sin(f*0.15)*2` sólo toma **5 valores**, así que 60 frames requieren **5 rasterizaciones** en vez de 60.
- La sombra se dibuja aparte (1 `fillRect`, depende del tamaño).
- Tope de 4 000 entradas con limpieza total.
- Si no hay `document.createElement` (tests, SSR) cae al camino directo.

**Detalle importante:** el proxy de contexto tuvo que ser un `Proxy` real. Mi primer intento con getters/setters explícitos **no reenviaba `globalAlpha` ni `imageSmoothingEnabled`**, y el sprite se habría rasterizado con el alpha equivocado (los sprites que usan transparencias, como `lucilente`, habrían perdido el efecto). El test `test-sprite-proxy.mjs` cubre ese caso.

## 5. 🟠 Lag: `lerpColor` (caché) y gradientes

- `lerpColor` se llamaba 459 veces por frame con el mismo par de colores y `t` por fila. Ahora cachea por `(colorA, colorB, t redondeado a 1/256)`.
  - Probado contra la implementación original en las 900 combinaciones reales de fila: **delta máximo 1 por canal** (invisible). Con 1/64 el delta era 2, que sí se nota en pixel art; por eso se subió.
- `createLinearGradient()` se creaba **por frame** en el título (2-3) y en batalla (1-3). Ahora se cachean: 0 creaciones después del primer frame.

## 6. 🟠 El bucle no tenía delta time (arreglado)

`loop()` llamaba `update()` una vez por `requestAnimationFrame`. En 144 Hz el juego corría **2.4× más rápido** (jugador, animaciones y tasa de encuentros por segundo real).

**Arreglo:** acumulador de paso fijo a 60 Hz con techo de 5 pasos por frame (evita la espiral de la muerte al volver de una pestaña en segundo plano) y descarte del excedente.

Medido: 30/60/120/144/240 Hz → velocidad de juego **0.99x–1.00x** en todos los casos.

## 7. Limpieza

- **6 funciones muertas eliminadas:** `getSoloFighters`, `playerTile`, `tpPlayer`, `isGabrielaArmored`, `isHernanShaved`, `isNicoleCrucified`.
- **`hasAllDiplomas()` dejó de ser código muerto:** ahora `canEnterThroneRoom()` exige los 4 diplomas además de vencer a Yam. En el flujo normal no cambia nada (para llegar a Yam ya cruzaste el puesto de Dan), pero un save inconsistente o un salto con modo supervisor ya no abre el trono sin haber hecho el recorrido.
- **10 scripts de test reparados:** importaban Playwright desde `/tmp/node_modules/...`, ruta inexistente. Ahora `from 'playwright'`. Los 6 con aserciones van a `tests/`, los 5 de diagnóstico a `tools/`.

---

## Verificación

```
npm test        → 8 suites, 80 aserciones, TODO OK
npm run build   → 479 kB (145 kB gzip)
node --check    → game.js + 72 módulos OK
huérfanos       → 0
funciones muertas → 0
```

**Suites nuevas:**
| Test | Cubre |
|---|---|
| `test-menu-sync.mjs` | cada índice del menú hace lo que promete |
| `test-proa-progress.mjs` | 23 casos: guardar/cargar/reset y tolerancia a saves corruptos |
| `test-sprite-cache.mjs` | 60 frames → 5 rasterizaciones, no 60 |
| `test-sprite-proxy.mjs` | el proxy reenvía contexto y métodos |
| `test-all-sprites.mjs` | las **59 especies** rasterizan y blitean |
| `test-lerp-color.mjs` | 900 colores comparados contra el original |
| `test-loop-timestep.mjs` | 30–240 Hz dan la misma velocidad de juego |

## Riesgos y límites

- **No pude probar en navegador real** (Chromium no descarga en este sandbox). La verificación es unitaria + build + `curl` al preview. Los cambios visuales (sprites cacheados, gradientes) conviene mirarlos en pantalla.
- El canvas no usa `devicePixelRatio` (punto 10 de la auditoría, pendiente): el pixel art sigue viéndose algo blando en pantallas retina.
- Los tabs de 5 PNG huérfanos en `assets/` siguen ahí (punto 9, cosmético).

---

# Bloque 4 — "recuadro negro que no se mueve" (2026-11-15)

## Síntoma reportado

> "Lo abrí y lo ejecuté, me sale un recuadro negro y no se mueve."

## Causa

`viteSingleFile` + `format: 'iife'` producen un `<script>` **clásico**, y
`make-standalone.mjs` lo dejaba donde Vite lo pone: en el `<head>`.

Un `<script>` clásico **no es diferido**. Se ejecuta en el instante en que el
parser lo encuentra. Si está en el `<head>`, el `<canvas id="c">` del `<body>`
todavía no existe:

```js
// src/core/canvas.js
const cv = document.getElementById('c'),   // → null
      cx = cv.getContext('2d');            // → TypeError
```

```
Uncaught TypeError: Cannot read properties of null (reading 'getContext')
```

El juego moría en la primera línea del bundle. El canvas quedaba en pantalla,
negro (`canvas { background: #000 }`), sin que nada lo dibujara nunca.

Con `type="module"` esto no pasaba porque los módulos ES **sí** son diferidos:
se ejecutan después de parsear el documento. Al convertir el bundle a script
clásico para que funcione en `file://`, heredamos el problema sin darnos cuenta.

## Por qué los tests no lo atraparon

`tests/test-standalone-boot.mjs` armaba un DOM falso donde
`getElementById('c')` **siempre** devolvía un canvas. Es decir, suponía que el
canvas existía. Verificaba además que `requestAnimationFrame` se hubiera
llamado, pero no que se dibujara nada.

Dos huecos:

1. El harness era más permisivo que un navegador real.
2. "El loop arrancó" no es "se ve algo".

## Arreglo

| Archivo | Cambio |
|---|---|
| `tools/make-standalone.mjs` | Mueve los `<script>` del `<head>` al final del `<body>`, después del `<canvas>`. **Falla el build** si el script queda antes del canvas. |
| `tests/test-standalone-boot.mjs` | Simula el parseo progresivo: `getElementById('c')` devuelve `null` si el canvas aún no fue parseado. Verifica orden DOM, ausencia de errores, que ningún frame lance excepción y que haya ≥50 operaciones de canvas en 5 frames. |
| `vite.config.js` | Plugin `inlineAssetImages`: embebe los 6 PNG de `assets/` como `data:` URIs en `__INLINE_ASSETS__`. |
| `src/core/sprite-loader.js` | `resolverSrc()`: usa `__INLINE_ASSETS__[ruta]` si existe, si no devuelve la ruta. En `dev` y `dist/` la variable no existe → comportamiento idéntico. |
| `src/render/battle-backgrounds.js` | El fondo del bosque también pasa por `resolverSrc()`. |
| `tools/make-zip.mjs` | Genera el ZIP para repartir, con la misma estructura de rutas que el repo para que los lanzadores funcionen sin cambios. |

### Verificación de que el test nuevo sirve

El test nuevo se corrió contra el build **viejo** (con el bug) y contra el
**arreglado**:

```
build con el bug:   FAIL el <canvas> aparece antes del <script>
                    FAIL el bundle lanzó: Cannot read properties of null
build arreglado:    7/7 PASS
```

## Efecto lateral: el archivo pesa más

Los 6 PNG suman 1,9 MB → 2,6 MB en base64. `dist-app/index.html` pasó de
620 KB a 3,2 MB (2,1 MB comprimido en el ZIP).

El culpable es `assets/battle/forest-encounter.png`: 1,3 MB para un fondo de
640×480. Redimensionarlo a 640×480 y guardarlo como PNG de 8 bits lo dejaría en
~150 KB y el archivo bajaría a ~2 MB. Pendiente.

## Lección

Un test que corre el bundle en un DOM falso tiene que ser **más estricto** que
el navegador, no menos. Y "el loop arrancó" no prueba que se vea algo: hay que
contar operaciones de dibujo.

---

# Bloque 5 — el aviso visible (2026-11-15)

## Por qué

El usuario reportó el error del bloque 4 estando en `main`, que todavía no tenía
el arreglo. El build roto le mostró **un canvas negro sin ningún mensaje**. Para
darse cuenta de que estaba en la versión vieja hubo que comparar el número de
línea del stack trace (`index.html:7` vs `index.html:14`).

Eso es una falla de diseño del producto, no del usuario: **cuando algo revienta
al arrancar, la pantalla tiene que decirlo.**

## Qué se agregó

`tools/error-overlay.html` — un `<script>` que se inyecta **antes** del script
del juego y registra `window.onerror`. Si el juego lanza al ejecutarse, reemplaza
la pantalla por un cartel con:

- el mensaje de error y su ubicación,
- una nota que distingue "versión vieja" de "bug nuevo".

Se sacó a un archivo aparte (en vez de un template string dentro del `.mjs`)
porque los escapes de `\n` dentro de un template anidado se rompían: el primer
intento generó JavaScript inválido y el navegador lo reportaba como
`SyntaxError: Invalid or unexpected token`.

## Detalle de orden

```
línea 10  <canvas id="c">
línea 14  <script>            ← overlay (registra el listener de error)
línea 56  <script data-juego> ← el juego
```

El overlay tiene que ir **primero**: si el juego lanza antes de que el listener
esté registrado, no hay quién muestre nada. El atributo `data-juego` lo
distingue en las verificaciones del build y en los tests.

## Test nuevo: `tests/test-error-overlay.mjs`

Comprueba las dos caras, porque un aviso que salta siempre es tan malo como uno
que nunca salta:

| Caso | Esperado |
|---|---|
| Arranque sano | el cartel **NO** aparece |
| Arranque roto (error inyectado a propósito) | el cartel **SÍ** aparece |

También verifica el orden DOM: overlay antes del juego, canvas antes del juego.

## Estado

`npm test` → **95 aserciones PASS**, 0 fallos.
