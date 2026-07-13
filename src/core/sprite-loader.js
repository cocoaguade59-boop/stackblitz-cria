// Cargador de sprites PNG desde assets/sprites/
// Soporta rutas simples (ej: 'hydrapom' -> assets/sprites/hydrapom.png)
// y con subcarpetas (ej: 'npcs/alejandro' -> assets/sprites/npcs/alejandro.png).
// Sin dependencias externas.

const SPRITE_LOADER = {
  imgs: {},   // id -> HTMLImageElement
  ready: {},  // id -> true cuando la imagen cargó OK
  load(id) {
    if (this.imgs[id]) return;
    const img = new Image();
    img.onload = () => { this.ready[id] = true; };
    img.onerror = () => { this.ready[id] = false; };
    img.src = 'assets/sprites/' + id + '.png';
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

// NPCs van en assets/sprites/npcs/<id>.png para separarlos de las criaturas
SPRITE_LOADER.load('npcs/alejandro');

export { SPRITE_LOADER };
