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
