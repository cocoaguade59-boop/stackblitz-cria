# Sprites del juego

Esta carpeta contiene los sprites PNG usados por el juego. Se cargan
automáticamente al iniciar mediante `SPRITE_LOADER` (ver
`src/core/sprite-loader.js`).

## Estructura

```
assets/sprites/
├── README.md
├── <criatura>.png      ← Sprites de criaturas (ej: hydrapom.png para Knightapple)
└── npcs/
    └── <npc>.png       ← Sprites de NPCs (ej: alejandro.png)
```

## Reglas

- **Formato:** PNG con fondo transparente idealmente
- **Nombre exacto:** debe coincidir con el `id` interno del NPC o criatura
- **Tamaño recomendado:**
  - Criaturas: cualquiera (el juego lo escala según nivel)
  - NPCs: **más alto que ancho** funciona mejor (ej: 104×205 px)

## Sprites disponibles

| Ruta | ID interno | Personaje | Estado |
|------|-----------|-----------|--------|
| `hydrapom.png` | `hydrapom` | Knightapple (criatura) | ✅ Presente |
| `npcs/alejandro.png` | `alejandro` | Alejandro (NPC) | ⏳ Sube tu PNG aquí |

## Cómo agregar un sprite nuevo

### Para una criatura:
1. Renombra tu PNG con el ID interno de la criatura (ej: `flameye.png`)
2. Colócalo en `assets/sprites/` directamente
3. Agrega `SPRITE_LOADER.load('flameye');` en `src/core/sprite-loader.js`
4. Modifica el `case 'flameye'` en `src/render/creature-sprites.js` (Fase 4F pendiente)

### Para un NPC:
1. Renombra tu PNG con el ID interno del NPC (ej: `alejandro.png`)
2. Colócalo en `assets/sprites/npcs/`
3. Agrega `SPRITE_LOADER.load('npcs/alejandro');` en `src/core/sprite-loader.js`
4. Modifica el `case 'alejandro'` en:
   - `src/render/npc-sprites.js` (para el mapa)
   - `src/render/trainer-big-sprites.js` (para intro de batalla)

En ambos casos, agrega el condicional `if (SPRITE_LOADER.has('...')) { drawImage } else { pixel-art fallback }`.

## Cómo funciona el fallback

Si el PNG no existe o falla al cargar, el juego dibuja automáticamente el
pixel-art antiguo (el que se dibuja con `px(...)` a mano). Esto significa
que puedes agregar sprites gradualmente sin romper nada.
