# Bloque 7 — Batalla más legible y partida que se acuerda de vos

Cinco mejoras de la lista de 15, elegidas para que se noten en la primera
partida sin tocar el arte ni reescribir el combate.

Todo lo de este documento **se ve en el juego**: además de los tests de lógica
(corren sin navegador), hay tres tests que ejecutan el `dist-app/index.html`
real y comprueban que el texto o el color aparecen en el canvas.

---

## 4 + 6 · Efectividad al vuelo, sin números

**Antes:** elegías un ataque sin saber si iba a servir. La tabla de tipos
existía, pero estaba escondida en el código.

**Ahora:** cada casilla de ataque se enmarca con un borde de 2 px:

| Borde | Significado |
|---|---|
| Naranja `#F08A20` | pega fuerte (×2) |
| Azul `#3C7AE0` | pega poco (×0.5 y también ×0, «no le hace nada») |
| Sin borde | daño normal (×1) |

Sin números, sin fórmula, sin texto extra. El jugador aprende la tabla mirando,
que es más rápido que leerla.

Detalles que importan:

- El marco va **por fuera** de la casilla, así que no tapa el nombre, la
  cápsula de tipo ni los PP.
- Las cuatro esquinitas amarillas de «seleccionado» siguen ahí y no se pisan.
- Un movimiento **sin PP no lleva marco**: ya está gris, y sumarle color sería
  ruido.
- Sólo existen **dos** colores en toda la tabla. Hay un test que lo verifica:
  si alguien agrega un tercero, el test falla y recuerda la decisión.

Archivos: `src/render/ui-type-icons.js` (`moveEffFrame`, `dMoveButton`) y la
llamada en `game.js` (`dMoveButton(..., b.en.tp)`).

---

## 5 · Velocidad de batalla ×1 / ×2

**Tecla `V`** dentro de cualquier batalla. Es un interruptor: x1 → x2 → x1.

- El juego simula a 60 pasos fijos por segundo. Con x2 se ejecutan **dos pasos
  de batalla por paso real**, no se multiplica el tiempo ni se saltean frames.
  Resultado: la batalla va al doble de ritmo y las animaciones siguen exactas
  (nada de saltos ni de medios segundos perdidos).
- La preferencia vive en `G.battleSpd`, no en el estado de la batalla, así que
  **se mantiene entre combates**: el que acelera una vez quiere seguir rápido.
- Un valor corrupto (por ejemplo 99 en un save editado) cae a x1, nunca a una
  velocidad absurda.
- Se anuncia en el menú de acciones («V: velocidad x2») y una insignia naranja
  **x2** aparece arriba a la derecha mientras está activa.
- Fuera de la batalla la tecla no hace nada.

Archivo: `game.js` (`battleSpeed`, `toggleBattleSpeed`, `uBattle` / `uBattleStep`).

---

## 8 · Aviso de PP antes de elegir

Tres arreglos pequeños que quitan el «¡Sin PP!» inesperado:

1. **El cursor nace en un movimiento usable.** Si la primera técnica está
   agotada, al entrar a «Luchar» el cursor ya está en la siguiente con PP.
2. **Las flechas saltean los movimientos agotados.** Ese «abajo» que no hacía
   nada porque caía en un movimiento en gris ahora sigue avanzando hasta
   encontrar uno bueno.
3. **Si todo está agotado, se avisa antes**: «¡Sin PP! Cambia de criatura o
   huye» en rojo, en la propia pantalla de movimientos.

Archivo: `game.js` (`stepGrid` en la fase `move`, mensaje `allDry`).

---

## 11 · «Hay algo acá»

**El problema:** el mapa tiene 50 pines de hallazgo y decenas de NPCs, pero
nada te avisa que están ahí. Se camina de largo y se pierde contenido.

**Ahora:** al pisar una casilla se miran las 5 de alrededor (la propia y las
cuatro cardinales; las diagonales no). Si hay un pin sin abrir o un NPC con el
que todavía no hablaste, suena una campanita de dos notas y aparece un aviso
corto:

- `Hay algo aquí cerca (C para abrir)` — pin.
- `Nombre tiene algo que contarte` — NPC nuevo.

Reglas para que no sea molesto (esto es lo que más se cuida):

- **Una sola vez por sitio**: volver a pasar por al lado del mismo pin no
  vuelve a sonar nunca.
- **Anti-ráfaga**: como mínimo 6 pasos entre un aviso y el siguiente.
- **Los NPCs ya hablados no suenan.** El juego ya sabía a quién le hablaste
  (`G.talkedTo`), sólo no lo usaba para esto.
- Se apaga en los modos Supervisor y Batallador, donde los encuentros y los
  premios no aplican.
- Funciona en el mundo, las cuevas, la torre y el castillo.

Archivos: `src/world/tile-ping.js` (lógica pura, testeable),
`pingTileContents()` en `game.js`, y `sfx.ping()` en `src/core/audio.js`.

---

## 15 · Perfil de guardado

**Antes:** la pantalla de título decía «Continuar partida guardada». Nada más.
Al volver semanas después no había forma de saber qué había adentro.

**Ahora:** debajo de las opciones aparece una línea:

```
Guardado 1 · Rodaje · 2h 14m · 3 insignias · Lv.18
```

- **Pueblo:** se deduce de la posición en el mapa (las zonas verticales ya
  estaban definidas en `src/data/regions.js`), o del nombre propio si estás en
  una cueva, la torre o el castillo. Los nombres largos se acortan para que
  entren en pantalla («Feria Última Toma» → «Última Toma»).
- **Tiempo:** se acumula en `G.playMs` desde el bucle de paso fijo, o sea es
  tiempo real de juego, no «frames dibujados». Se guarda con la partida.
- **Insignias:** cuenta los diplomas de los cuatro Proa (0 a 4).
- **Nivel:** el más alto del equipo, para saber de un vistazo si la partida es
  inicial o avanzada.
- **Tolerante a guardados viejos:** si falta el reloj, los diplomas o el
  equipo, se muestra 0m / 0 insignias en vez de romperse.

Se calcula una sola vez y se cachea por el texto crudo del save: leer y
recorrer el JSON a 60 Hz sería tirar CPU al aire.

Archivos: `src/core/save-profile.js`, `src/screens/title.js`, `buildSaveObject()`
y `loadGame()` en `game.js`.

---

## Verificación

`npm test` → **273 aserciones PASS, 0 fallos** (19 suites).

Además de la lógica, tres suites abren el `dist-app/index.html` real en un
contexto simulado y confirman que las cosas **se dibujan**:

| Test | Qué comprueba en pantalla |
|---|---|
| `test-in-game-profile.mjs` | que el título pinta `Guardado 1 · Rodaje · 2h 14m · 3 insignias · Lv.18` |
| `test-in-game-battle.mjs` | marco naranja vs planta, azul vs agua, ninguno vs normal; `V` cambia la velocidad y aparece la insignia x2; el cursor nace en el movimiento con PP |
| `test-in-game-ping.mjs` | que el aviso de pin aparece y suena una sola vez |
| `test-move-frame-draw.mjs` | que el marco son exactamente 4 rectángulos de 2 px por fuera de la casilla |

Los tres primeros se pueden correr solos con `npm run test:visual`.

---

## Lo que NO se hizo a propósito

- **Nada de números de daño.** Se descartó mostrar la fórmula: en una fuente de
  6 px no se lee y ensucia la pantalla.
- **Nada de ×4 ni ×8.** Con el reloj a 60 Hz, ×4 ya convierte los textos en algo
  que no se puede leer. Si más adelante hace falta, se hace bien (acortando los
  tiempos de mensaje), no apilando multiplicadores.
- **El arte no se tocó.** La queja de los gráficos se resuelve con
  `devicePixelRatio` y una paleta unificada, que es un trabajo aparte.
