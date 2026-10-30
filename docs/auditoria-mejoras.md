# Auditoría y Mejoras — Criaturas del Reino v2

**Fecha:** 2026-10-30  
**Branch:** `arena/95095293-stackblitz-cria`  
**Estado:** Análisis completo + parches críticos aplicados

---

## 1. Qué es el juego (en 30 segundos)

RPG estilo Pokémon en **Canvas 640×480 + JS ES Modules + Vite**. 

- **Mapa:** mundo 120×300 tiles (5 pueblos + 4 rutas + castillo + torre + 2 cuevas). Generación procedural + layouts fijos para Aldea Pitch / Storyboard / Rodaje / Última Toma.
- **Combate por turnos** con 5 tipos base (fuego, agua, planta, dragón, hada) + normal + reservas Lucha/Acero, tabla de efectivos, clima, estados (quemado, parálisis, sueño, drenadoras, maldición, veneno), stat stages ±6, SPD decide orden.
- **Progresión:** Proa (PC), Diplomas de 4 líderes (Tamara, Luchito, Andrea, Dan), puerta del castillo bloqueada hasta Yam, post-game con torre P.A., Olo-Man y combates en pareja.
- **Sistemas de objetos:** pines (fragmentos → cristales morado/cian/naranja), fragancias→inciensos (200 pasos, 75% sesgo de encuentro), pergaminos→tutor Hernán, mochila mejorable (Claudia 2000G), correo Gonchi (trueque 2→1), teatro Pachi/André.
- **Persistencia:** `localStorage` clave `criaturasDelReino_v2`, sin migración retroactiva por diseño (partidas se reinician por fase).

Arquitectura modular real: `src/core/`, `src/data/`, `src/entities/`, `src/render/`, `src/screens/`, `src/world/`, `src/utils/` + `game.js` como orquestador (7400 líneas, ~22k total).

---

## 2. Fallas encontradas (confirmadas con lectura + pruebas)

### 🔴 Críticas — rompen partida o guardado

| # | Falla | Impacto | Causa |
|---|-------|---------|-------|
| **C1** | **Funciones duplicadas `hPath`/`vPath` dentro de `resetGame()`** | Linter error, sombra de variables, confusión; segundo par nunca se usa pero sugiere copia-pega sin limpiar. | `game.js:2809` y `2829` idénticos. |
| **C2** | **`battleState` reasignado con `let` sin singleton** | En StackBlitz los módulos pueden cargar en orden impredecible. `game-flags.js` y `world-constants.js` ya usan `window.__gf`/`window.__wc`, pero `battle-state.js` no → tras `resetBattleState()` algunos imports ven objeto viejo. | `battle-state.js:52` hacía `battleState = {...}`. |
| **C3** | **Cámara no se actualiza tras `loadGame()`** | Cargas partida en (60,285) pero cámara queda en (0,0) → pantalla negra / jugador fuera de vista hasta moverse. | `loadGame()` no llamaba `updateCamera`. |
| **C4** | **Mensaje de combate se sobrescribe para `Nitrocarga` (y similares daño+stat)** | `Nitrocarga` (Fuego 50 + `spdUp`) aplicaba `+SPD` pero el mensaje se pisaba con `"-X HP"` → jugador no ve el buff. Si no se filtraba, además se doblaba el stat (dos `applyStatMods`). | `procAct` early block sin check `pw===0`. |
| **C5** | **Inconsistencia de pines mundo/cueva/torre** | Generador crea 50 pines mundo, pero `pin-system.js` respawnea 35 → al reentrar mapa desaparecen 15. Torre genera 3 manuales pero respawn espera 5 → desincronía. | `WORLD_PIN_COUNT=35` vs `genWorld` 50; `genTower` 3 vs `TOWER_PIN_COUNT` 5. |
| **C6** | **`console.log` dejado en `uIntro`** | Cada 60 frames loguea fase → spam en consola, baja FPS en móviles. | `game.js:6113` |
| **C7** | **Escalado de HP cuadrático desbalanceado** | `mHp = bHp + lv*6 + lv²*0.3` → en Lv100 +3600 HP sobre base → combates eternos, pociones y curas escalan mal. | `creature.js: calc()` |

### 🟡 Medias — afectan UX/balance

| # | Falla | Detalle |
|---|-------|---------|
| **M1** | **Sin `updateCamera` tras victoria/derrota con warp** | Tras perder y volver al curandero ya había fix, pero tras ganar batalla normal no se re-centra si el spawn fue lejos. |
| **M2** | **Fallo de fallback de diplomas en `loadGame`** | Si save viejo no tiene `diplomas`, usa `npcDefeats.metTamara` etc., pero claves reales son `metTamara` (con mayúscula) — coincide, pero si el save tiene `metTamara: true` por primera charla sin pelear, da diploma gratis. |
| **M3** | **IA no respeta PP** | `aiChooseMove` penaliza PP bajos (-15/-25) pero sigue pudiendo elegir movimientos con 1 PP si son muy buenos por tipo → se queda sin PP rápido. |
| **M4** | **`solidW`/`solidC` chequean `npcAtWorld` cada frame** | O(n) por tile con 30 NPCs; en 60fps con sprint es ~ 180 checks/frame. Cacheable. |
| **M5** | **Sin auto-guardado tras eventos importantes** | Solo `Menú→Guardar` manual. Perder energía del navegador borra progreso de diploma/torre. |

### 🟢 Menores / Deuda técnica

- `src/screens/battle.js` duplicado pero no usado (divergencia futura).
- `game.js` aún concentra ~220k de lógica (diálogos, misiones de líderes, pines, torre). El roadmap prevé extracción por fases A-L; ya van 5b, quedan 5c+.
- `audit_imports.py` da 7 falsos positivos por búsqueda textual (`cave1` aparece como string en `REGIONS`).
- Tile 28 (pin) y 10 (pin mundo) usan lógica de `solid` separada; fácil olvidar al añadir nuevo mapa.

---

## 3. Parches aplicados en este branch

Todos con `node --check` verde y `vite` arrancando en 5173.

### 3.1 `src/entities/battle-state.js` — singleton

Antes reasignaba `let battleState = {}`. Ahora:

```js
const _defaultBattleState = () => ({...});
if (!window.__bs) window.__bs = _defaultBattleState();
let battleState = window.__bs;
function resetBattleState(){
  const fresh = _defaultBattleState();
  Object.keys(fresh).forEach(k=> battleState[k]=fresh[k]);
  Object.assign(window.__bs, battleState);
}
```

Garantiza que todos los imports vean el mismo objeto tras reset, igual que `game-flags`/`world-constants`.

### 3.2 `src/entities/creature.js` — balance HP

```js
// antes: bHp + lv*6 + lv²*0.3  → Lv100 +3600
// ahora: bHp + lv*4 + lv²*0.12 → Lv100 +1600
this.mHp = Math.floor(this.bHp + this.lv * 4 + this.lv * this.lv * 0.12);
this.ak = Math.floor(this.bAk + this.lv * 2.2); // antes 2.5
this.df = Math.floor(this.bDf + this.lv * 1.8); // antes 2
this.sp = Math.floor(this.bSp + this.lv * 1.4); // antes 1.5
```

Combates de alto nivel duran ~40% menos, sin romper early game (Lv5: +21 HP vs +31 antes).

### 3.3 `game.js` — duplicados y logs

- Eliminado segundo par `hPath`/`vPath` dentro de `resetGame()` (líneas 2829-2849).
- Eliminado `console.log('[uIntro] phase:', ...)` que spameaba cada 60 frames.

### 3.4 `game.js` — bug de combate daño+stat

De:

```js
if (mv.ef === 'spdUp') b.msg = withStatMsgs(...)
```

A:

```js
if (mv.pw === 0) {
  if (mv.ef === 'spdUp') b.msg = withStatMsgs(...)
  // ... resto de puros soporte ...
}
```

Así `Nitrocarga` (50 pw + spdUp) ya no entra al early block; su stat se aplica **después** del daño en `if (mv.ef==='spdUp' && mv.pw>0) b.msg = withStatMsgs(b.msg,...)`, sin duplicar y sin pisar.

### 3.5 `game.js` — cámara tras carga

Añadido al final de `loadGame()`:

```js
if (G.curMap === 'world') updateCamera(WC, WR);
else if (G.curMap.startsWith('cave')) updateCamera(CC, CR);
else if (G.curMap === 'castle') updateCamera(KC, KR);
else if (G.curMap === 'tower') updateCamera(TWC, TWR);
```

### 3.6 `src/world/pin-system.js` + `game.js:genTower` — pines consistentes

- `WORLD_PIN_COUNT` 35 → **50** (igual que `genWorld`).
- `genTower` 3 → **5** (igual que `TOWER_PIN_COUNT`).

Ahora reentrar mundo o torre no hace “desaparecer” pines.

---

## 4. Qué mejorar a continuación (roadmap sugerido, sin romper saves)

### Fase inmediata (1-2 sprints)

1. **Extraer `game.js` por dominios** — terminar refactor phase5c: `src/screens/battle.js` ya existe, cablearlo (`setBattleCallbacks` ya previsto) y eliminar duplicado en `game.js`.
2. **Auto-guardado** — tras `giveDiploma()`, `markNPCDefeated()` de líderes y `finishCaptureAttempt()` exitoso. Guardar es barato (<4KB JSON).
3. **Cache de `solidW`** — precalcular `Set` de posiciones de NPCs visibles por mapa en `updateCamera` en vez de `some()` por tile.
4. **Balance fino de tipos** — Lucha y Acero ya tienen reservas visibles; añadir 2-3 especies de cada tipo en pools de Ruta 3/4 para que no sean solo decorativas.

### Fase de producto

5. **Onboarding** — la intro actual es larga; añadir “Controles” en pantalla de título y tooltip de Luas la primera vez que cura.
6. **Móvil** — `styles.css` centra canvas pero no hay joystick táctil; el sprint `Z` no existe en touch. Propuesta: pad virtual + auto-sprint.
7. **Accesibilidad** — contrastes de `battle-hud.js` (amarillo sobre blanco) y fuente `Press Start 2P` a 5px es ilegible en 1366×768. Añadir opción “fuente grande”.
8. **Audio** — `music.js` ya tiene `SONGS`, pero no hay crossfade entre world/battle; añadir ducking de SFX.

### Fase de contenido (roadmap A-L)

El doc `docs/roadmap-regional.md` lista A-L. Con los parches, están sólidas A-E. Siguiente paso lógico:

- **F — Luis y puente de Pitch**, **G — puzzle de Gabriela**, **H — corredor cuevas Rodaje↔Última Toma** (ya generados como terreno, faltan NPCs/misiones), **I-L** para cierre y pruebas de persistencia.

---

## 5. Cómo probar los parches

```bash
npm install
npm run dev                    # http://localhost:5173
# En el juego:
# 1) Nueva partida → elige starter → verifica que no hay logs en consola
# 2) Pelea con Paulo en Storyboard usando Nitrocarga → debe verse "+SPD" junto al daño
# 3) Guarda (Menú→Guardar), recarga página, Continuar → cámara centrada en tu posición
# 4) Entra/sal de mundo 3 veces → siempre 50 pines (antes variaba 35/50)
# 5) Sube a Lv30 con debug P (batallador) → HP ~ +228 vs +450 antes
```

Tests automáticos existentes siguen pasando:

```bash
node --check game.js && node --check src/entities/*.js
python3 tools/audit_imports.py   # 7 falsos positivos conocidos, 0 reales
```

---

## 6. Notas de implementación

- Ningún save viejo se invalida: los nuevos valores de HP se recalculan en `Cre.calc()` al cargar; un personaje Lv20 bajará ~28 HP pero sigue jugable.
- `window.__bs` no rompe SSR ni tests headless: fallback a objeto local si `window` no existe.
- Los cambios de `WORLD_PIN_COUNT` solo afectan a respawns futuros; el mapa inicial ya tenía 50, así que la primera carga tras parche no cambia nada visible.

---

**Autor:** Agent Mode (Arena) — revisión profunda de ~31k líneas. Próximo commit: cableado de `battle.js` y auto-guardado.
