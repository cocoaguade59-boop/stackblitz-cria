// Borrador local C1.5a-2e — posiciones de NPCs para el mundo 120×300.
// No está importado ni subido. Mantiene nombres/roles existentes.

const EXPANDED_NPC_PLACEMENTS = {
  pitch: {
    Alessandro: { x: 56, y: 284 },
    Luas: { x: 63, y: 284 },
    Alexandro: { x: 52, y: 288 },
    Luis: { x: 76, y: 280 }, // ribera/puente para su futura misión
    Nicole: { x: 55, y: 291 },
  },
  storyboard: {
    Gabriela: { x: 56, y: 216 },
    Fabiana: { x: 50, y: 210 },
    Paulo: { x: 69, y: 210 },
    Claudia: { x: 56, y: 224 },
    Tamara: { x: 49, y: 205 }, // frente a la Proa (cols 47-52, rows 200-203)
    DavidO: { x: 60, y: 220 },
    Luas: { x: 61, y: 220 },   // regla: David-O izquierda, Luas derecha
  },
  rodaje: {
    Luchito: { x: 60, y: 141 },
    Dante: { x: 66, y: 143 },
    Pachi: { x: 55, y: 143 },
    Gonchi: { x: 52, y: 147 },
    Nahuel: { x: 69, y: 147 },
    Andre: { x: 73, y: 139 },
    DavidO: { x: 65, y: 138 },
    Luas: { x: 66, y: 138 },   // regla: David-O izquierda, Luas derecha
    Piero: { x: 76, y: 126 },
  },
  ultimatoma: {
    Andrea: { x: 60, y: 81 },
    Brisa: { x: 56, y: 84 },
    Roberto: { x: 64, y: 84 },
    Deyna: { x: 53, y: 88 },
    Dayana: { x: 68, y: 88 },
    DavidO: { x: 66, y: 78 },
    Luas: { x: 67, y: 78 },   // regla: David-O izquierda, Luas derecha
  },
  montaje: {
    Dan: { x: 60, y: 24 },
    Chrys: { x: 54, y: 29 },
  },
};

const EXPANDED_SPAWN = {
  player: { x: 60, y: 285, d: 3 },
  lastHeal: { x: 63, y: 284, map: 'world' },
  emergency: { x: 60, y: 285 },
};

export { EXPANDED_NPC_PLACEMENTS, EXPANDED_SPAWN };
