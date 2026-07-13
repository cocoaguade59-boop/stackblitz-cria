# Sprites de NPCs

Cada archivo `<id>.png` reemplaza el dibujo pixel-art del NPC con ese id.

**Se usan tanto en el mapa (pequeño) como en la intro de batalla (grande).**
El juego escala la misma imagen según el contexto:
- En el mapa: ~40 px de alto
- En intro de batalla: ~220 px de alto

## Sprites esperados

| Archivo | NPC | Estado |
|---------|-----|--------|
| `alejandro.png` | Alejandro (pelo largo negro, bandana roja) | ⏳ Pendiente |

## Recomendaciones

- **Aspect ratio vertical** (más alto que ancho) funciona mejor porque los NPCs
  son personajes de cuerpo entero
- **Fondo transparente** en el PNG
- **Tamaño**: cualquier resolución sirve, el juego escala manteniendo el ratio
