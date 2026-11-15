# Auditoría técnica — verificación independiente

**Fecha:** 2026-11-15
**Rama auditada:** `main` @ `131ee93` (idéntica a `origin/main`, verificado con `git rev-list --count`)
**Método:** lectura de código + ejecución real (`npm install`, `vite build`, generación de mapas en Node, `git fetch`).
**Alcance:** contrastar punto por punto la lista de recomendaciones de otra IA con el código actual.

---

## 0. Resumen ejecutivo

- La lista externa **acierta en 6 de 12 puntos** y **exagera o se equivoca en 6**.
- El error más importante de esa lista **no es un falso positivo, es una omisión**: existe una **rama anterior de Arena (`arena/95095293-stackblitz-cria`, commit `9a1d29c`) con 7 parches críticos ya escritos y nunca mergeados**. Se aplica limpio sobre `main` (0 conflictos) y corrige cosas que la lista da por "menores".
- El repo en GitHub **no está atrasado**: `main` local y `origin/main` son el mismo commit, y ese commit es del **2026-07-21**. La otra IA leyó exactamente esta versión; simplemente no vio la rama con parches.
- Riesgo real más alto para un regalo: **no hay final ni créditos**, y las 5 misiones regionales del roadmap **existen solo como nombres en un objeto de datos** (0 lógica).

---

## 1. Verificación punto por punto

| # | Afirmación externa | Veredicto | Evidencia |
|---|---|---|---|
| 1 | `battle.js` (2051 líneas) no lo importa nadie y duplica la batalla real | ✅ **CIERTO** | `grep -rn "screens/battle"` → 0 resultados. `game.js` tiene `uBattle` (3138), `dBattle` (4952), `calcCaptureChance` (3026); `battle.js` los reimplementa en 298 / 1649 / 224. |
| 1b | `battle.js` tiene refs rotas (`avgPartyLv`, `clamp`, `TWC`, `TWR`) | ✅ **CIERTO** | `battle.js:237` llama `avgPartyLv()` **que no existe en ningún archivo**; `clamp` (241), `TWC`/`TWR` (712) existen pero en `game.js`, no en el módulo → `ReferenceError` garantizado si se cablea. |
| 1c | `expanded-world-layout.js` huérfano | ✅ **CIERTO** | No lo importa nadie. Es el **único otro** archivo huérfano de `src/` (43 líneas). |
| 2 | Mapas se regeneran al cargar y el save no guarda semilla → puedes aparecer en casilla bloqueada | 🟡 **PARCIAL** | Verificado empíricamente: `genWorld()` produce **hash idéntico 3 de 3 veces** (determinista); `genCastle()` también. **`genCave()` NO**: hash distinto en cada ejecución. Pero los tiles aleatorios de cueva son decorativos (`22/23/24/26/29`), son sólidos únicamente `21/23/24/28/29/31/34`, y el spawn **siempre se reescribe** al entrar por cueva (`rx=15, ry=106`). Riesgo real: bajo, no el que describe la lista. |
| 3 | Save solo en `localStorage`, clave `criaturasDelReino_v2`, sin exportar/importar | ✅ **CIERTO** (matiz) | Clave confirmada. Sin export/import. Matiz: el README **declara** que no habrá migración ("partidas se reinician por fase"), así que "los saves mueren" es *decisión de diseño*, no bug. |
| 4 | `vite build` funciona (467 kB) y convendría desplegar en Netlify/Vercel/Pages | ✅ **CIERTO** | Reproducido hoy: `72 modules transformed`, `dist/assets/index-*.js 467.03 kB / gzip 140.37 kB`, 2.75 s. |
| 5 | No hay final ni créditos; Montaje, Castillo y Torre "no están hechas"; fases F–K pendientes | 🟡 **PARCIAL** | **Créditos: no existen** (0 coincidencias de `credits/créditos/ending`). Pero **Montaje SÍ está generada** (`buildVillage(42,19,'montaje')`), **Castillo** (`genCastle`), **Torre** (`genTower`), y las 4 Proas + Rey Navarrete son combatibles. Lo que falta no es el mapa: son **las 5 misiones regionales** (`luisBridge`, `gabrielaScene`, `danteCollapse`, `lastTake`, `finalCut`), que existen **solo como contratos de datos** con **2 apariciones en total** cada una (su propia declaración). |
| 6a | `hPath`/`vPath` declarados dos veces | ✅ **CIERTO** | `game.js:2809/2819` y `2829/2839`, dentro de `resetGame()`, cuerpos **idénticos** letra por letra. |
| 6b | 9 de 17 tipos sin efectividad ofensiva | ✅ **CIERTO** | La tabla define 8 atacantes (`normal, fire, water, plant, dragon, fairy, fighting, steel`); `tNam` lista 17. Pero **el juego solo usa 6 tipos**: criaturas = fire 11 / water 12 / plant 11 / dragon 13 / fairy 11 / normal 1, y **movimientos = fire 9 / water 9 / plant 10 / dragon 9 / fairy 10 / normal 22**. Los otros 11 tipos son **decorativos**. |
| 6c | Solo 6 de 11 tests tienen aserciones | 🔴 **INCORRECTO** | 5 scripts tienen `process.exit(1)` ante fallo (`battle`, `fresh`, `interiors`, `phase5a`, `phase5b`, `title` → en realidad 6). Los otros 5 (`diag`, `dist`, `err`, `full-diag`, `state`) son **scripts de diagnóstico**, no tests. El "problema" es de nomenclatura, no de cobertura. |
| 6d | GitHub está desactualizado respecto a StackBlitz | 🔴 **NO VERIFICABLE / FALSO** | `git rev-list --count origin/main..HEAD` = 0 y `HEAD..origin/main` = 0. No hay commits en StackBlitz ausentes de GitHub que yo pueda ver. Lo que sí existe es la **rama de parches sin mergear** — probablemente el origen de la confusión. |
| — | Nicole "crucificada" post-game y personajes amargados = humor pesado sobre gente real | ✅ **CIERTO** | `src/data/npcs.js:242` `// Aquí es donde aparece clavada en la cruz`; `:255` `'Estoy literalmente crucificada'`; `src/render/npc-sprites.js:127` dibuja la cruz. |
| — | 41 NPCs, 29 combatibles | 🟡 **APROXIMADO** | 39 NPCs declarados; **27 combatibles** (`battle` o `fixedTeam`); 26 con `fixedTeam`. 5 entradas son duplicados de Luas/David-O en otros mapas. |

---

## 2. Lo que la lista externa NO vio

### 2.1 Rama `arena/95095293-stackblitz-cria` (`9a1d29c`, 2026-10-30) — parches listos, sin mergear

Merge-base = `131ee93` (= `main` **actual**). Aplica sobre hoy **sin conflictos**. Contiene `docs/auditoria-mejoras.md` (188 líneas) + cambios en `game.js`, `battle-state.js`, `creature.js`, `pin-system.js`.

**Y los bugs que describe siguen vivos en `main`** — lo verifiqué uno por uno:

| ID | Bug en `main` hoy | Evidencia |
|---|---|---|
| C1 | `hPath`/`vPath` duplicados | `game.js:2809` y `:2829` |
| C2 | `battleState` reasignado (`let`, sin singleton) | `battle-state.js:52` `battleState = {...}` en `resetBattleState()` |
| C4 | `Nitrocarga` (daño + `spdUp`) pisa el mensaje del buff | bloque de `procAct` sin check `pw === 0` |
| C5 | Pines inconsistentes: generador crea 50, respawn espera 35 | `pin-system.js:9` `WORLD_PIN_COUNT = 35` |
| C6 | `console.log` por frame en intro | `game.js:6116` y `intro.js:27` (¡duplicado en dos archivos!) |
| C7 | HP cuadrático: Lv100 → +3600 HP | `creature.js:34` `lv*6 + lv²*0.3` |

**Conclusión:** hay trabajo hecho que conviene mergear **antes** de empezar cualquier cosa nueva.

### 2.2 `console.log` de depuración en producción

`game.js:7401` `[game.js] calling init()`, `title.js:66/79/81` y `intro.js:27`. Ruido en consola para cualquiera que abra el regalo.

### 2.3 Bugs de guardado que nadie había listado

- `loadGame()` **carga `postGame` pero no `bossOk`/`allTalked`/`allCaught` como flags derivados** → revisar coherencia al mergear parches.
- `loadGame()` **no actualiza la cámara**, pero eso está mitigado porque `uWorld()` llama `updateCamera(WC, WR)` al final de cada frame (`game.js:1294`). El bug C3 del doc es **menos grave de lo que dice el propio doc**.
- No hay auto-guardado: sólo `Menú → Guardar`.

---

## 3. El riesgo real para "el regalo"

Completar el juego tiene un bloqueo **estructural**, no de contenido: `game.js` ya pesa **7402 líneas** y las misiones regionales F–K exigen insertar lógica en ese archivo, que es el que más conflictos genera.

Orden que recomiendo:

1. **Mergear la rama de parches** (0 conflictos hoy, menos mañana). Sin riesgo de save: el doc documenta que los HP se recalculan al cargar.
2. **Cerrar el juego**: pantalla de créditos + escena post-créditos + `ending` disparado tras vencer a Navarrete. Hoy `activatePostGame()` sólo muestra 3 notificaciones. Este es el cambio que convierte el proyecto en "regalo entregable".
3. **Misiones regionales en versión mínima** (F–K): cada una es un diálogo + una condición + un cambio de mapa. No requieren sistema nuevo.
4. **Higiene**: cablear o borrar `battle.js`, deduplicar `hPath`/`vPath`, quitar `console.log`, export/import de partida, deploy estático.
5. **Opcional / discutible**: completar los 11 tipos decorativos (cambio de diseño grande, poco retorno para un regalo), modo relajado, viaje rápido.

---

## 4. Cómo reproducir esta auditoría

```bash
git rev-list --count origin/main..HEAD          # 0 → GitHub no está atrasado
git log -1 --format='%h %ad' 9a1d29c            # la rama de parches
git diff --stat 131ee93 9a1d29c                 # 5 archivos, +257/−76
npx vite build                                  # 467 kB, OK
# determinismo de mapas: genWorld/genCastle estables, genCave no
```
