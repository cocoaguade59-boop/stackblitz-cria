# Bloque 6 — tecla C y bosque guiado

## 1. La tecla de acción pasa a ser C

Antes: ESPACIO y ENTER, mezclados en 59 lugares distintos con
`kp(' ') || kp('Enter')`.

Ahora:

```js
// src/core/input.js
const ACTION_KEYS = ['c'];
const ACTION_ALIASES = ['c', ' ', 'Enter'];  // alias: nadie queda trabado

function kAction() {
  for (const k of ACTION_ALIASES) if (kp(k)) return true;
  return false;
}
```

Los 59 sitios pasaron a `kAction()`. Los alias se mantienen porque a esta
altura hay gente con la costumbre de ESPACIO, y romperles el juego por un
cambio estético sería peor que dejar dos teclas.

Detalle importante que ya estaba resuelto y se respetó: **no usar `||` con dos
`kp()` en la misma expresión**. El primero consume el frame (`kcd`) y el
segundo devuelve `false` siempre. `kAction()` evalúa los alias **en secuencia**,
no en cortocircuito.

Toda la UI que anunciaba SPACE/ENTER se actualizó (26 textos en 9 archivos) y el
botón táctil `A` ahora manda `'c'`.

Test: `tests/test-action-key.mjs` — C dispara, no se dispara dos veces, ESPACIO
y ENTER siguen andando, mayúscula también, X no dispara, y la UI no anuncia
teclas viejas.

## 2. El bosque guiado

### El problema

Miraba mal por dos motivos distintos:

1. **Paredes rectas.** `buildRoute*` sorteaba árboles con
   `Math.random()` sobre una caja rectangular:
   ```js
   else if ((c + r) % 3 === 0) setWorld(c, r, 3);
   ```
   Eso produce líneas perfectas de árboles cruzando el mapa.

2. **Un anillo alrededor del pueblo.** La fila 270 salía así:
   ```
   TT.TT.TT.TT.TT.TT.TT.TT.TT.TT.====T.TT.TT.TT...
   ```
   Una empalizada con un solo hueco en el camino.

### Lo que hace ahora `src/world/route-forest.js`

| Regla | Cómo |
|---|---|
| El camino nunca se tapa | Los árboles sólo se ponen fuera de los tiles 1 |
| El camino curva | Ondulación con dos senos + jitter, **atenuada en los extremos** (ventana seno) para que entre y salga exacto en la plaza del pueblo |
| No hay paredes | `romperParedes()`: toda línea recta de 12+ árboles se agujerea de forma irregular |
| El camino se lee como camino | `cerrarHuecosDeCamino()` y `liberarCaminoApretado()` |
| Hay opción de perderse | Cada ~14 filas, un claro y un sendero lateral corto que muere en el pasto |
| Determinista | `h2(c,r)`, hash por coordenada. Sin `Math.random()`: el mapa es igual en cada partida y se puede testear |

### Verificación

`tests/test-route-forest.mjs` no mira el código: **genera el mapa y lo audita**.

```
PASS el mapa sale igual en cada partida (generación determinista)
PASS se llega caminando a Storyboard (r215)
PASS se llega caminando a Rodaje (r145)
PASS se llega caminando a Última Toma (r85)
PASS se llega caminando a Montaje (r28)
PASS se llega caminando al Castillo (r10)
PASS ningún tile de camino está ahogado entre árboles (0)
PASS no hay paredes rectas de árboles (12+ seguidas): 0
PASS el camino ondula en vez de ser una línea recta (varía 7.0 tiles)
PASS se puede salir del camino y explorar a los costados (22075 tiles)
PASS la plaza de Pitch sigue libre de árboles
PASS la plaza de Storyboard sigue libre de árboles
```

La conectividad se prueba con un **flood fill** desde la plaza de Pitch usando
la misma tabla de sólidos que el juego. Si algún día un árbol tapa el paso, el
test lo dice con el nombre del pueblo que quedó incomunicado.

Herramienta para verlo a ojo: `node tools/ver-mapa.mjs [x1 y1 x2 y2]` imprime el
mundo en ASCII (`T` árbol, `=` camino, `~` agua, `#` casa, `o` roca).

## 3. Dos bugs del generador de builds que aparecieron en el camino

### `$&` en `String.replace`

El bundle incluye un path SVG con `</body>` dentro, y expresiones como `!$`.
Al hacer:

```js
doc.replace(/<\/body>/, `${bloque}\n  </body>`)   // ✗ cadena
```

el `$` del reemplazo se interpreta como patrón y el HTML **se metió dentro del
JavaScript**:

```js
!    </body>&_&&(t.fillStyle=...
```

Arreglo: **función de reemplazo**, que desactiva ese parseo.

```js
doc.replace(/<\/body>/, () => `${bloque}\n  </body>`)   // ✓ función
```

### Verificación que faltaba

`make-standalone.mjs` ahora compila el bundle con `new vm.Script(...)` antes de
escribir el archivo y **falla el build** si no es JavaScript válido. Ese chequeo
es el que encontró el bug de arriba.

También es **idempotente**: si el HTML ya fue procesado, sale sin tocar nada.
Necesario porque en la segunda pasada el `</body>` del bundle se confunde con el
del documento.

## Estado

`npm test` → **115 aserciones PASS**, 0 fallos.
