// Cargador de sprites PNG desde assets/sprites/
// Soporta rutas simples (ej: 'hydrapom' -> assets/sprites/hydrapom.png)
// y con subcarpetas (ej: 'npcs/alejandro' -> assets/sprites/npcs/alejandro.png).
// Sin dependencias externas.
//
// IMPORTANTE (build de un solo archivo):
//   En dist-app/index.html, el build inyecta la variable global
//   __INLINE_ASSETS__ = { 'assets/sprites/hydrapom.png': 'data:image/png;base64,...' }
//   (ver el plugin inlineAssetImages de vite.config.js).
//   Si la ruta está ahí, se usa el data: URI en vez del archivo suelto.
//   Así el juego se ve completo con doble clic, cuando el HTML está solo en el
//   escritorio y no hay ninguna carpeta assets/ al lado. En dev y en dist/ la
//   variable no existe y se comporta exactamente igual que antes.
function resolverSrc(ruta) {
  const inline = typeof __INLINE_ASSETS__ !== 'undefined' ? __INLINE_ASSETS__ : null;
  return (inline && inline[ruta]) || ruta;
}

const SPRITE_LOADER = {
  imgs: {},   // id -> HTMLImageElement
  ready: {},  // id -> true cuando la imagen cargó OK
  load(id) {
    if (this.imgs[id]) return;
    const img = new Image();
    img.onload = () => { this.ready[id] = true; };
    img.onerror = () => { this.ready[id] = false; };
    img.src = resolverSrc('assets/sprites/' + id + '.png');
    this.imgs[id] = img;
  },
  has(id) {
    return this.ready[id] === true;
  },
  get(id) {
    return this.imgs[id];
  },
};

// Precargar sprites conocidos (agrega más ids aquí cuando subas más PNGs).
// Criaturas van en assets/sprites/<id>.png
SPRITE_LOADER.load('hydrapom');

// NPCs del mapa van en assets/sprites/npcs/<id>.png
SPRITE_LOADER.load('npcs/alejandro');
SPRITE_LOADER.load('npcs/alessandro');

// Entrenadores de batalla van en assets/sprites/trainers/<id>.png
SPRITE_LOADER.load('trainers/alessandro');
SPRITE_LOADER.load('trainers/alejandro');

export { SPRITE_LOADER, resolverSrc };
