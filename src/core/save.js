// Helpers de persistencia con localStorage.
// Las funciones saveGame/loadGame completas siguen en game.js (usan G global).
// Sin dependencias externas.

// === GUARDADO ===
const SAVE_KEY = 'criaturasDelReino_v2';
function hasSaveGame() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}
function clearAllGameSaves() {
  try {
    localStorage.removeItem(SAVE_KEY);
    // Limpieza de compatibilidad por si StackBlitz conservó claves antiguas.
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && /criaturas|reino/i.test(k)) localStorage.removeItem(k);
    }
  } catch (e) {
    console.error('Error limpiando guardado:', e);
  }
}

export { SAVE_KEY, hasSaveGame, clearAllGameSaves };
