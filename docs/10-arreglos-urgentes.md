# 10 arreglos urgentes — Criaturas del Reino v2

Ordenados por **riesgo real**, no por dificultad. Estado verificado contra el código el 2026-11-15. Los cuatro primeros ya están resueltos en el PR #1.

---

## 🔴 Bloqueantes (rompen la partida o la entrega)

### 1. ~~`battle.js` huérfano con refs rotas~~ ✅ RESUELTO (#1)
2051 líneas que nadie importaba, con `avgPartyLv()` inexistente. Si alguien la cableaba, `ReferenceError` en la primera captura. **Borrada.**

### 2. ~~HP cuadrático desbalanceado~~ ✅ RESUELTO (#1)
`lv*6 + lv²*0.3` → un Lv100 tenía **+3600 HP** sobre la base. La Torre llega a Lv58, así que el final del juego era una pelea de desgaste. Ahora `lv*4 + lv²*0.12`.

### 3. ~~Sin forma de mover la partida~~ ✅ RESUELTO (#1)
El save vivía sólo en `localStorage`. Limpiar el navegador = partida perdida para siempre. Ahora hay exportar/importar (`CR1-<base64url>`).

### 4. ~~Cámara negra al cargar~~ ✅ RESUELTO (#1)
`loadGame()` no llamaba a `updateCamera()`.

### 5. **No hay final ni créditos** ⬜ PENDIENTE — *el más importante*
`activatePostGame()` sólo lanza tres notificaciones. El jugador vence a Navarrete, lee "¡¡GRACIAS, guerrero!!" y vuelve al mapa sin cierre. **Un regalo sin final no está terminado.**
- Pantalla de créditos con todos los nombres (Oscar, Piero, Nicole, Dayana, Deyna, Tamara, Luchito, Andrea, Dan, Chrys, Dante, Pachi, Brisa, Roberto…).
- Escena post-créditos.
- `src/screens/credits.js` + estado `G.scr = 'ending'`.

### 6. **Las 5 misiones regionales no existen** ⬜ PENDIENTE
`luisBridge`, `gabrielaScene`, `danteCollapse`, `lastTake`, `finalCut` son **sólo nombres** en un objeto de datos: cada una aparece 2 veces en todo el repo, y esas 2 son su propia declaración. El roadmap las llama F–K. **Sin ellas el camino al final está vacío**: se pasa de pueblo en pueblo peleando Proas, sin eventos.

## 🟠 Graves (pérdida de progreso o bugs visibles)

### 7. **`genCave()` no es determinista** ⬜ PENDIENTE
`genWorld()` y `genCastle()` dan hash idéntico en 3 de 3 ejecuciones; **las cuevas no**. Hoy sólo varía decoración y el spawn se reescribe al entrar, pero es una bomba de tiempo: cualquier día se agrega un tile sólido aleatorio y quedan partidas atrapadas. Solución: `mulberry32(seed)` en `map-generator.js` y guardar `seed` en el save.

### 8. **`postGame` se guarda pero el resto de flags derivados se recalculan** ⬜ PENDIENTE
`loadGame()` restaura `postGame`, `towerOpen`, `npcDefeats`, `diplomas`… pero no valida coherencia (ej.: `diplomas.dan` sin `npcDefeats.metDan`). Un save de una fase vieja puede quedar en un estado imposible. Añadir un `validateSave()` que repare en vez de crashear.

### 9. **La rama de parches quedó fuera de `main` durante 2 semanas** ⬜ A MEDIAS
`arena/95095293` se mergeó en el PR #1, pero el patrón puede repetirse. Conviene que Arena siempre trabaje desde `main` actualizado.

## 🟡 Deuda que cuesta caro más adelante

### 10. **`game.js` sigue en ~7400 líneas** ⬜ PENDIENTE
Ya se extrajeron 15 módulos, pero diálogos de líderes, pines, torre, misiones y el menú inline siguen ahí (el menú está **duplicado** entre `game.js` y `screens/menu.js` — con un comentario que avisa "actualizá AMBOS"). Cada misión nueva F–K se inserta en ese archivo, que es el que más conflictos genera. **Antes de escribir las 5 misiones, extraer `src/screens/leader-missions.js`.**

---

## Resumen

| Estado | Cantidad |
|---|---|
| ✅ Resuelto en PR #1 | 4 |
| ⬜ Pendiente | 6 |
| Prioridad siguiente | #5 (créditos) y #6 (misiones) |

**Secuencia recomendada:** 5 → 6 → 10 → 7 → 8. Créditos primero porque es lo que convierte el proyecto en entregable, aunque falten misiones: se puede cerrar el juego con "fin del contenido actual" y ampliarlo después sin tocar el cierre.
