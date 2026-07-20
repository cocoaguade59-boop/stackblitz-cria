// Mapa vertical a escala del reino. No intenta comprimir el mundo completo.
import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { kp, kh } from '../core/input.js';
import { fr } from '../core/frame.js';
import { wMap, WC, WR } from '../core/world-constants.js';
import { diplomas } from '../core/game-flags.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import { MAP_LOCATIONS } from '../data/map-markers.js';
import { ROUTE_PROA_STATIONS, isRouteAuthorized, getRecommendedStation } from '../world/route-missions.js';

const SCALE = 7;
const VIEW_X = 40, VIEW_Y = 40, VIEW_W = WC * SCALE, VIEW_H = 380;
const MAP_H = WR * SCALE;
const MAX_SCROLL = MAP_H - VIEW_H;

function clampScroll(value) { return Math.max(0, Math.min(MAX_SCROLL, value)); }
function centerMapOnPlayer() { return clampScroll(G.pl.y * SCALE - VIEW_H / 2); }
function openMapScreen() { G.mapScrollY = centerMapOnPlayer(); }

function uMapScreen() {
  if (kp('x') || kp('Escape') || kp(' ') || kp('Enter')) { G.showMap = false; return; }
  const step = kh('z') ? 10 : 3;
  if (kh('ArrowUp')) G.mapScrollY = clampScroll((G.mapScrollY ?? centerMapOnPlayer()) - step);
  if (kh('ArrowDown')) G.mapScrollY = clampScroll((G.mapScrollY ?? centerMapOnPlayer()) + step);
}

function tileColor(tile) {
  if (tile === 2) return '#2070C0'; if (tile === 3) return '#1A5818'; if (tile === 4) return '#A09080';
  if (tile === 13) return '#687080'; if (tile === 1) return '#C8B898'; if (tile === 7) return '#707070';
  if (tile === 9) return '#484038'; if (tile === 11) return '#C8A830'; if (tile === 12) return '#D860A8';
  return '#3A6A28';
}
function stationState(station) {
  if (isRouteAuthorized(station.from, diplomas)) return { fill: '#40D870', label: 'AUT.' };
  return { fill: '#E84838', label: 'CERR.' };
}
function dMapScreen() {
  dBoxMenu(20, 8, 600, 464, 'MAPA VERTICAL DEL REINO');
  const scroll = clampScroll(G.mapScrollY ?? centerMapOnPlayer());
  G.mapScrollY = scroll;
  cx.save(); cx.beginPath(); cx.rect(VIEW_X, VIEW_Y, VIEW_W, VIEW_H); cx.clip();
  cx.fillStyle = '#3A6A28'; cx.fillRect(VIEW_X, VIEW_Y, VIEW_W, VIEW_H);
  const firstRow = Math.max(0, Math.floor(scroll / SCALE));
  const lastRow = Math.min(WR, Math.ceil((scroll + VIEW_H) / SCALE) + 1);
  for (let r = firstRow; r < lastRow; r++) for (let c = 0; c < WC; c++) {
    cx.fillStyle = tileColor(wMap[r]?.[c]);
    cx.fillRect(VIEW_X + c * SCALE, VIEW_Y + r * SCALE - scroll, SCALE + .5, SCALE + .5);
  }
  MAP_LOCATIONS.forEach((loc) => {
    const x = VIEW_X + loc.x * SCALE, y = VIEW_Y + loc.y * SCALE - scroll;
    if (y < VIEW_Y - 12 || y > VIEW_Y + VIEW_H + 12) return;
    cx.fillStyle = loc.col; cx.fillRect(x - 3, y - 3, 7, 7);
    cx.fillStyle = '#fff'; cx.fillRect(x - 1, y - 1, 3, 3);
    cx.fillStyle = '#fff'; cx.font = '5px "Press Start 2P"'; cx.fillText(loc.nm, x + 6, y + 2);
  });
  const recommended = getRecommendedStation(diplomas);
  ROUTE_PROA_STATIONS.forEach((station) => {
    const x = VIEW_X + station.x * SCALE, y = VIEW_Y + station.y * SCALE - scroll;
    if (y < VIEW_Y - 12 || y > VIEW_Y + VIEW_H + 12) return;
    const state = stationState(station);
    if (recommended?.from === station.from) { cx.strokeStyle = '#FFD700'; cx.lineWidth = 2; cx.strokeRect(x - 5, y - 5, 12, 12); }
    cx.fillStyle = state.fill; cx.fillRect(x - 3, y - 3, 7, 7);
    cx.fillStyle = '#111'; cx.font = '5px "Press Start 2P"'; cx.fillText('P', x - 1, y + 2);
  });
  const px = VIEW_X + G.pl.x * SCALE, py = VIEW_Y + G.pl.y * SCALE - scroll;
  if (py >= VIEW_Y && py <= VIEW_Y + VIEW_H && fr % 20 < 14) { cx.fillStyle = '#F8F8F8'; cx.fillRect(px - 4, py - 4, 8, 8); cx.fillStyle = '#E83030'; cx.fillRect(px - 2, py - 2, 4, 4); }
  cx.restore();
  // Barra de desplazamiento y leyenda.
  const barH = Math.max(20, VIEW_H * VIEW_H / MAP_H), barY = VIEW_Y + (VIEW_H - barH) * (scroll / MAX_SCROLL || 0);
  cx.fillStyle = '#202830'; cx.fillRect(605, VIEW_Y, 5, VIEW_H); cx.fillStyle = '#FFD700'; cx.fillRect(605, barY, 5, barH);
  cx.fillStyle = '#fff'; cx.font = '5px "Press Start 2P"';
  cx.fillText('↑↓: recorrer mapa   Z+↑↓: rápido   X: cerrar', 34, 440);
  cx.fillStyle = '#E84838'; cx.fillText('■P cerrado', 34, 455); cx.fillStyle = '#40D870'; cx.fillText('■P autorizado', 150, 455);
  cx.fillStyle = '#FFD700'; cx.fillText('□ próxima ruta', 300, 455); cx.fillStyle = '#F8F8F8'; cx.fillText('■ tú', 470, 455);
}
export { uMapScreen, dMapScreen, openMapScreen };
