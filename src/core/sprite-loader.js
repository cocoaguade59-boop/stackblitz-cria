// Cargador de sprites PNG desde assets/sprites/<id>.png
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
// Precargar sprites conocidos (agrega más ids aquí cuando subas más PNGs)
SPRITE_LOADER.load('hydrapom');

export { SPRITE_LOADER };
