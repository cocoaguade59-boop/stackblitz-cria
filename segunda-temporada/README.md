# Criaturas del Reino: Segunda Temporada

RPG de criaturas y combates por turnos, inspirado en la estructura de los juegos de DS
(dos pantallas, comandos táctiles abajo), con la identidad de *Criaturas del Reino*:
pueblos con nombres de etapas audiovisuales, diplomas en lugar de medallas y un reparto
lleno de humor, chismes y algún que otro momento melancólico.

## Jugar

**Doble clic en `index.html`.** No necesita instalar nada, ni servidor, ni internet.
Funciona en Chrome, Edge, Firefox y Safari, en compu y en celular.

| Acción | Teclado | Táctil |
|---|---|---|
| Moverse | Flechas / WASD | Cruceta en pantalla |
| Hablar / aceptar | Z, Espacio | A, o tocar la pantalla de arriba |
| Cancelar / correr (mantener) | X, Esc | B |
| Menú | Enter | MENÚ, o los botones de la pantalla de abajo |
| Silenciar | M | — |

La partida se guarda en el navegador (menú → GUARDAR).

## Recorrido

1. **Aldea Pitch**: Alessandro te recibe y elegís compañero (Fuego, Agua o Planta).
   Gabriela, tu amiga y rival, elige el suyo.
2. **Villa Storyboard**: Tamara pide equilibrio: Fuego, Agua y Planta en tu equipo → *Fotografía Estética*.
3. **Cantera Rodaje**: Luchito anota tres golpes superefectivos → *Documental*.
4. **Cueva Volcánica** → **Feria Última Toma**: Andrea toma examen sobre el reino → *Ficción*.
   Teatro de Pachi con combates de ensayo y Profe de Doblaje (tutor de movimientos).
5. **Prados Montaje**: Dan quiere tres chismes → *Publicidad*.
6. **Ruta 5** → **Castillo Difusión**: André, Yam (con la llave) y el Rey Navarrete.
7. **Post-juego**: Torre P.A. (5 pisos y una criatura legendaria), combates de parejas con
   Edison, revanchas y nuevos diálogos.

Extras: hallazgos ocultos (brillitos en el suelo), taller de cristales en la Proa,
inciensos de tipo, criaturario de 41 especies, evoluciones, quemadura/parálisis/sueño,
noche y atardecer según tu reloj.

## Sprites dibujados a mano

Las hojas originales van en `assets/personajes/originales/` (4 filas: abajo, izquierda, derecha,
arriba; 4 cuadros de caminata cada una, dibujadas al doble de tamaño). Para sumarlas al juego:

```bash
python3 tools/importar_sprites.py
```

El script las reduce a escala de juego, alinea los pies y genera `js/sprites_usuario.js`. Si el
nombre del archivo coincide con un personaje (por ejemplo `nicole.png`), ese personaje usa el
sprite dibujado en vez del dibujado por código.

## Código

Scripts clásicos (sin módulos ni build) para que abra con doble clic:

- `js/core.js`: pantallas, input, escenas, texto y bucle.
- `js/audio.js`: música y efectos chiptune sintetizados.
- `js/data.js`: tipos, movimientos, especies, objetos.
- `js/gfx.js`: todo el arte procedural (criaturas, personas, tiles, edificios, fondos).
- `js/ui.js`, `js/battle.js`, `js/world.js`: menús, combate y mundo.
- `js/maps.js`, `js/story.js`: mapas y guion.

Pruebas automáticas (necesitan Playwright): `node tools/play.cjs <carpeta> tools/flow-bfs.cjs`
valida que todos los mapas estén conectados; `tools/flow-story.cjs` recorre la historia completa.
