# Sprites de Criaturas

Esta carpeta contiene los sprites de las criaturas del juego.

## Formato requerido

- **Formato:** PNG (con fondo transparente idealmente)
- **Nombre exacto:** debe coincidir con el `id` interno de la criatura en `script.js` (dentro del objeto `CDB`).
- **Tamaño recomendado:** ~64×64 px o proporcional (el juego escala el sprite al área del canvas).

## Sprites esperados

| ID interno | Nombre visible | Archivo esperado | Estado |
|------------|---------------|-------------------|--------|
| `hydrapom` | Knightapple   | `hydrapom.png`    | ⏳ Pendiente de subir |

## Cómo agregar el sprite de Knightapple

1. Guarda tu dibujo como PNG.
2. Renómbralo a `hydrapom.png` (así se llama la criatura internamente en el código).
3. Súbelo a esta carpeta: `assets/sprites/hydrapom.png`.
4. Recarga el juego — el sprite se cargará automáticamente y reemplazará al dibujo pixel-art anterior.

## Cómo funciona

El juego tiene un pequeño loader (`SPRITE_LOADER` en `script.js`) que precarga las imágenes desde esta carpeta al iniciar. Cuando una criatura tiene su sprite cargado, se usa `drawImage()` en vez del dibujo pixel a pixel. Si la imagen no existe o aún no cargó, se dibuja un placeholder.
