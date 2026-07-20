# Criaturas del Reino

RPG de exploración y combate por turnos en HTML Canvas, construido con JavaScript ES Modules y Vite.

## Desarrollo

```bash
npm install
npm run dev
```

El punto de entrada único es `game.js`. La lógica de coordinación vive allí; los datos, mundo, pantallas, renderizado y servicios se organizan bajo `src/`.

## Estructura

- `src/data/`: criaturas, movimientos, regiones, Proas, marcadores y diálogos.
- `src/world/`: generación de mapas, conexiones y contratos de misiones regionales.
- `src/screens/`: pantallas y puzzles.
- `src/core/`: canvas, input, cámara, audio y guardado.
- `src/render/`: sprites, HUD, tiles y efectos.

La hoja de ruta regional usa las fases A–L. La persistencia se prueba por fase para partidas nuevas; no se mantiene migración retroactiva de saves anteriores.
