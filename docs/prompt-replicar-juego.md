# Prompt para replicar *Criaturas del Reino v2*

Copia todo lo que está debajo de la línea. Está escrito como especificación ejecutable: cualquier IA con acceso a un editor puede reconstruir el juego sin ver el repo original.

---

## ENCARGO

Construye un RPG de criaturas jugable en el navegador, en español, con estética pixel art de Game Boy Advance, llamado **Criaturas del Reino v2**.

**Restricción técnica dura:** todo el arte es **procedural** — no hay imágenes de sprites. Cada criatura, tile, NPC, retrato y efecto se dibuja con rectángulos sobre `<canvas>` en tiempo de ejecución. Un canvas de 640×480, escalado por CSS con `image-rendering: pixelated`. Nada de assets externos salvo la fuente `Press Start 2P` de Google Fonts.

**Stack:** JavaScript ES Modules puros + Vite. Un único entrypoint (`game.js`) que orquesta, y módulos por dominio en `src/`. Sin frameworks, sin TypeScript, sin dependencias de runtime.

**Nada de librerías de juego.** Motor propio: bucle de `requestAnimationFrame`, estado global mutable, input de teclado manual, audio sintetizado con WebAudio (osciladores `square`/`triangle`, sin archivos de sonido).

---

## 1. IDENTIDAD: el tema del juego

El reino no está organizado por geografía sino por **producción audiovisual**. Esto es el corazón del juego; sin esto es un Pokémon genérico.

- **Los pueblos son etapas de rodaje:** Aldea Pitch (pitch/presentación), Villa Storyboard, Cantera Rodaje, Feria Última Toma, Prados Montaje.
- **Los jefes de pueblo son "Proa"** y dan **diplomas** en lugar de medallas. Los diplomas son títulos de crédito reales: *Fotografía Estética, Documental, Ficción, Publicidad*.
- **Las personas se agrupan en órdenes y subgrupos**, y el juego lo explica a través de dos NPCs cronistas (Oscar y Piero) que muestran "crónicas" paginadas:
  - **Órdenes:** Materializadores (crean con las manos), Cronistas (registran), Pregoneros (transmiten).
  - **Subgrupos:** CTM (los veteranos), Las Monas (grupo inseparable de alta fidelidad), Brandcut (la siguiente generación, inexpertos), Los Rebata (ruidosos, se divierten), Los Proas (jefes de pueblo, malhumorados pero sabios), Los Outsiders (misteriosos, sin conexión con nadie).
  - Un personaje puede pertenecer a varios grupos a la vez.
- **Las "Proa" son también el PC del juego**: donde descansan las criaturas que no llevas.
- **Tono:** humor interno peruano, referencias a Brandcut, chistes que rompen la cuarta pared ("Primera regla de Brandcut... ok, mal ejemplo. Solo pelea.").

---

## 2. MUNDO

Mapa **120 × 300 tiles** de 32 px (3 840 × 9 600 px de mundo), cámara que sigue al jugador con vista de 15 × 9 tiles.

**Bandas de región (sur → norte), con rango de nivel de las criaturas salvajes:**

| Región | Filas | Tipo | Niveles |
|---|---|---|---|
| Aldea Pitch | 270–299 | pueblo | 2–5 |
| Ruta 1 | 230–269 | ruta | 4–7 |
| Villa Storyboard | 200–229 | pueblo | 8–11 |
| Ruta 2 | 160–199 | ruta | 10–14 |
| Cantera Rodaje | 130–159 | pueblo | 14–18 |
| Ruta 3 | 100–129 | ruta | 18–22 |
| Feria Última Toma | 70–99 | pueblo | 22–26 |
| Ruta 4 | 40–69 | ruta | 26–31 |
| Prados Montaje | 18–39 | pueblo | 31–36 |
| Ruta 5 | 8–17 | ruta | 36–40 |
| Castillo Difusión | 2–7 | castillo | 40–45 |
| Torre P.A. | mapa aparte 30×25 | torre post-game | 45–58 |

**Mapas interiores/separados:** Cueva Volcánica (40×30, niveles 10–16), Cueva Cristalina (40×30, 26–34), Castillo (30×25), Torre (30×25).

**Generación:** procedural con helpers `hPath(row, col1, col2, w)` y `vPath(col, row1, row2, w)` que trazan caminos de tierra sobre un mapa base. Los pueblos se "carven" limpiando un rectángulo, trazándoles calles y colocando casas en posiciones fijas. El mundo debe ser **determinista** (mismo hash en cada carga); las cuevas pueden variar sólo en decoración.

**Colisiones:** función `solidW(c, r)` consulta el tile en el mapa y devuelve `true` para agua, árboles, rocas, edificios, pines, decoración sólida y NPCs. El movimiento es por **salto de tile** (estilo GBA): tecla mantenida → se calcula destino, se anima el desplazamiento, al llegar se evalúa encuentro aleatorio.

**Encuentros:** probabilidad por paso según el tile (cueva con tile especial: 1.8%; tiles normales: 0.7%). Sesgo por hábitat de la región y por incienso activo.

---

## 3. CRIATURAS: 59 especies

**6 tipos activos:** `fire`, `water`, `plant`, `dragon`, `fairy`, `normal`. (La tabla interna define 17, pero sólo estos 6 se usan.)

**Distribución:** fuego 11, agua 12, planta 11, dragón 13, hada 11, normal 1.

**Estadísticas por especie:** `hp`, `ak` (ataque), `df` (defensa), `sp` (velocidad), más `nm` (nombre), `tp` (tipo), `desc`, `evo` (id de evolución) y `evoLv` (nivel de evolución).

**Líneas evolutivas de 2–3 etapas.** Ejemplos del criterio de nombres — **humor absurdo sobre oficios**:

| Línea | Diseño |
|---|---|
| Flameye → Flamcrest → Inferpavo | pavo real de fuego vanidoso |
| Ajolotín → Ajolord → Glaciolote | ajolote sonriente → ajolote de hielo ancestral |
| Gorilán → Gorilírico → Gorilegend | gorila poeta → gorila leyenda literaria |
| Pingüesón → Pingüchef → Pingümaître | pingüino mesero → dueño del restaurante |
| Gusarix → Crisálmanza → Knightapple | gusano en manzana → caballero manzana |
| Ornispía → Ornishadow → Orniságent | ornitorrinco agente secreto |
| Medusync → Medubass | medusa DJ de electrónica |
| Hedroca → Hedroble | cabra mayordomo con monóculo |
| Espinardo → Espinarcor → Espinardoom | carnero punk → heavy metal |
| Zumbaflor → Zumbaccino | colibrí barista hiperactivo |

**Fórmula de stats por nivel** (balanceado para que la Torre a Lv58 sea jugable):
```
mHp = floor(bHp + lv*4 + lv²*0.12)
ak  = floor(bAk + lv*2.2)
df  = floor(bDf + lv*1.8)
sp  = floor(bSp + lv*1.4)
```

**Iniciales:** 3 opciones (fuego / agua / planta) elegidas en una pantalla con carrusel, a nivel 5.

---

## 4. COMBATE POR TURNOS

**Movimientos: 69 en total.** Cada uno tiene `nm`, `tp` (tipo), `pw` (potencia; 0 = movimiento de estado), `pp` (usos), `acc` (precisión %), `ef` (efecto opcional) y `desc`.

**Fórmula de daño** (la del código real, no la de Pokémon):
```
si pw === 0            → no hace daño, sólo aplica efecto
si acc < 100 y random*100 > acc → falla
mult_efectividad = tabla de tipos (0 / 0.5 / 1 / 2)
mult_STAB        = 1.5 si el tipo del movimiento == tipo del atacante
mult_random      = 0.85 + random*0.15
crit             = 10% (25% si ef === 'highCrit'), ×1.5
clima            = ×1.5 si el tipo coincide con el clima, ×0.5 si es el opuesto
desesperación    = ×1.3 si el atacante tiene menos del 20% de HP
escudo           = ×0.5 y se consume
lvFactor = (2*lv)/5 + 2
raw      = (lvFactor * pw * atk/def) / 50 + 2
```

**Tabla de tipos** (sólo las 8 entradas que existen; el resto es neutro):
```
normal:   { steel: 0.5 }
fire:     { fire:0.5, water:0.5, plant:2, dragon:0.5, fairy:0.5, steel:2 }
water:    { fire:2, water:0.5, plant:0.5, dragon:0.5, steel:0.5 }
plant:    { fire:0.5, water:2, plant:0.5, dragon:0.5, steel:0.5 }
dragon:   { fire:0.5, water:0.5, plant:0.5, dragon:2, fairy:0, steel:0.5 }
fairy:    { fire:0.5, dragon:2, fighting:2, steel:0.5 }
fighting: { normal:2, fairy:0.5, steel:2 }
steel:    { fire:0.5, water:0.5, fairy:2, steel:0.5 }
```

**Estados alterados** (`STATUS`): quemado (7% HP/turno, 5 turnos), paralizado (25% de no actuar), dormido (2 turnos sin actuar), confuso (33% de auto-golpe, 4 turnos), drenadoras (5% HP/turno al rival, 5 turnos), maldito (12% HP/turno, 5 turnos), envenenado (6% HP/turno).

**Modificadores de stat:** etapas de −6 a +6 para ataque, defensa y velocidad, con tabla de multiplicadores por etapa.

**Clima:** `sun`, `rain`, `fairy`, con duración en turnos.

**Captura:** fórmula base `0.18 + HP_faltante*0.52`, con bonificación por estado (dormido +0.18, paralizado/quemado +0.10, confuso +0.08), penalización si el rival supera el nivel promedio del equipo (−0.015 por nivel de diferencia, máximo −0.18), +0.04 si ya tenés esa especie. Resultado acotado entre 0.08 y 0.90. Con 3 agitaciones del cristal como animación.

**IA:** puntúa cada movimiento por potencia × efectividad × STAB × precisión, penaliza PP bajo, y elige el mejor con 10% de probabilidad de escoger el segundo mejor.

**Flujo de pantalla de batalla:** intro (fondo + sprite grande del entrenador) → elección de acción (Luchar / Cristales / Cambiar / Huir) → elección de movimiento → resolución con cola de mensajes → victoria/derrota. Mensajes con "máquina de escribir" (carácter por carácter) y avance con SPACE. La criatura del jugador entra desde la izquierda, la rival desde la derecha, con sombra.

---

## 5. PROGRESIÓN

**4 Proas** (jefes), cada uno con una misión-diploma de mecánica distinta:

| Proa | Pueblo | Diploma | Requisito |
|---|---|---|---|
| Tamara | Villa Storyboard | Fotografía Estética | tener Fuego + Agua + Planta en el equipo |
| Luchito | Cantera Rodaje | Documental | dar 3 golpes súper efectivos |
| Andrea | Feria Última Toma | Ficción | (quiz de preguntas) |
| Dan | Prados Montaje | Publicidad | (chismes / trivia) |

**Puertas:** entre regiones hay "puestos Proa" que bloquean el paso hasta tener el diploma correspondiente. Pitch → Storyboard es libre a propósito (es el tutorial).

**Jefe final:** Rey Navarrete, equipo múltiple con 5 fases de diálogo entre criaturas, en el Castillo Difusión, con la Puerta del Rey (tile 34, sólida hasta tener los 4 diplomas + requisito de Yam).

**Post-game:** vencer a Navarrete activa `postGame = true`, lo que cambia diálogos de NPCs en todo el reino, abre la **Torre P.A.** (Lv45–58), habilita combates en pareja (Edison) y el modo teatro.

**Derrota:** al perder, el jugador reaparece en el último punto de curación, pierde la mitad del oro, y conserva todo el resto.

---

## 6. SISTEMAS SECUNDARIOS (todos existen, todos son opcionales)

1. **Criaturario (Dex):** grilla con las especies descubiertas a color y las no descubiertas como siluetas.
2. **Proa (PC):** guardar/retirar criaturas cuando el equipo está lleno (máximo 6 en equipo).
3. **Pines / hallazgos:** pines repartidos por el mapa se recogen con SPACE y dan **un** loot aleatorio: fragmentos de cristal (3 colores), pergaminos, fragancias.
4. **Cristales:** 4 fragmentos del mismo color → 1 cristal, fabricado por Fabiana o desde la mochila mejorada. Los cristales se gastan en capturar.
5. **Fragancias → inciensos:** un incienso activo dura 200 pasos y sesga los encuentros hacia un tipo concreto con 75% de probabilidad.
6. **Pergaminos → tutor de movimientos** (Hernán): enseña movimientos fuera del nivel.
7. **Inciensos y tienda** (David-O): pociones, revivir, cristales; también se puede pelear contra él para subir amistad.
8. **Trueque** (Gonchi): 2 criaturas → 1.
9. **Teatro:** dos carteleras (Pachi pre/post, André post-game) con combates que no existen en el mapa. Sirve para revivir peleas "de ensayo".
10. **Misiones:** pantalla de progreso con misión principal, secundarias y post-game.
11. **Mapa del mundo:** pantalla desplazable con marcadores de pueblo, cueva, castillo y posición actual.
12. **Crónicas:** pantallas paginadas de lore (las de Oscar y Piero explican órdenes y subgrupos).

---

## 7. PERSISTENCIA

- **Una sola clave** en `localStorage`: `criaturasDelReino_v2`.
- Se guarda: posición y dirección, mapa actual, equipo y Proa serializados, oro, inventario completo (pociones, revivir, cristales por color, fragmentos, pergaminos, fragancias, inciensos, incienso activo, mejora de mochila), progreso (diplomas, flags de NPC derrotados, contadores de captura, post-game, torre abierta), y último punto de curación.
- **No** se guarda semilla de mapas: `genWorld`/`genCastle` son deterministas, y las cuevas sólo varían en decoración (la posición se reescribe al entrar).
- Carga con `??` (nullish coalescing), nunca `||`, para no pisar valores `0`.
- **Autoguardado** tras diploma, captura y post-game; guardado manual desde el menú.
- **Partida portátil:** exportar el save como `CR1-<base64url>` para poder moverlo entre navegadores.

---

## 8. UI Y PRESENTACIÓN

- **Una sola fuente**, `Press Start 2P`, en tamaños de 5 a 16 px según el elemento.
- **Cajas:** fondo azul noche `#0a0a2e`, borde dorado `#ffd700` de 4 px, borde interior `#8b6914` de 2 px, esquinas decorativas de 8×8, y **título en banda** que se apoya sobre el borde superior de la caja.
- **Diálogos:** caja blanca `#F8F8F8` con borde negro, nombre del NPC arriba, texto que se escribe carácter por carácter, triángulo animado de "continuar".
- **Notificaciones:** texto flotante que sube y se desvanece, apilable, en la esquina.
- **Partículas:** sistema propio (`aP`, `uP`) para golpes, curación, estados y efectos de tipo.
- **Pantalla de título:** cielo animado → fanfarria de 4 notas sintetizadas → carrusel de criaturas con sombra, y menú INICIO / NUEVA AVENTURA.
- **Intro:** NPC se acerca caminando al protagonista, se abre caja de diálogo con 6 líneas que explican el reino, luego elección de inicial.

**Controles:** flechas (mover), SPACE/Enter (confirmar/interactuar), X/Escape (menú/volver), Z (correr).

---

## 9. ARQUITECTURA ESPERADA

```
game.js                    ← orquestador (~7 400 líneas): estado, update/draw, mundo, batalla, guardado
src/core/                  ← canvas, input, cámara, audio (WebAudio), música, frame, estado global, guardado
src/data/                  ← criaturas, movimientos, tipos, regiones, NPCs, misiones Proa, pines, teatro
src/entities/              ← criatura (stats, nivel, evolución), estado de batalla (daño, estados), learn-pool
src/render/                ← sprites procedurales, tiles, HUD, cajas, partículas, decoración
src/screens/               ← una pantalla por archivo: título, intro, starter, batalla, menú, dex, tienda, etc.
src/world/                 ← generador de mapas, interiores, pines, misiones de ruta, layout del mundo
```

**Patrón obligatorio para el estado global:** singletons sobre `window` (`window.__gs`, `window.__wc`, `window.__gf`, `window.__bs`). Motivo: en entornos tipo StackBlitz los módulos pueden cargar en orden impredecible y duplicarse; sin el singleton, dos copias del estado divergen y aparecen bugs imposibles de reproducir. Es el bug más caro del proyecto.

**Callbacks inyectados:** cuando un módulo necesita funciones del orquestador (marcar NPC derrotado, dar diploma, generar torre), se inyectan al inicializar con `setXCallbacks({...})` en lugar de importar `game.js` (que crearía un ciclo).

---

## 10. CRITERIOS DE ACEPTACIÓN

El resultado debe poder:
1. Correr `npm install && npm run dev` y abrir el juego en el navegador sin errores de consola.
2. `vite build` produciendo un bundle < 600 kB.
3. Empezar una partida nueva, elegir inicial, caminar por 3 pueblos, pelear contra salvajes y contra un Proa, ganar un diploma y desbloquear la siguiente región.
4. Guardar, recargar la página, continuar y estar exactamente en el mismo lugar con el mismo equipo.
5. Completar un combate con captura exitosa y que la criatura quede en el equipo o en la Proa.
6. Mostrar el Criaturario con al menos una criatura descubierta y el resto en silueta.
7. No tener ningún `console.log` de depuración, ningún módulo huérfano y ningún archivo duplicado que no se importe.

**Lo que NO hay que replicar todavía** (está incompleto en el original): pantalla de créditos, final narrativo, y las 5 misiones regionales de Luis, Gabriela, Dante, Pachi y Chrys. Son exactamente lo que falta para terminar el juego.
