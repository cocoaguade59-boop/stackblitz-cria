// Tiles de mapas cerrados: cuevas, castillo y torre (Bloque 8 original).
//
// Export único: dTileC(c, r, map)
//
// El parámetro `map` es la matriz de tiles del mapa activo
// (cave1, cave2, castMap o towerMap). El tile se dibuja según su
// tipo con un switch grande de casos pixel-art.

import { cx } from '../core/canvas.js';
import { px, pixelGlow } from './render-utils.js';
import { fr } from '../core/frame.js';
import { T, cam } from '../core/world-constants.js';

function dTileC(c, r, map) {
  const x = c * T - cam.x,
    y = r * T - cam.y;
  if (x < -T || x > 640 || y < -T || y > 480) return;
  const t = map[r]?.[c];
  if (t === undefined) return;

  // Detectar vecinos para bordes naturales
  const tUp = map[r - 1]?.[c];
  const tDn = map[r + 1]?.[c];
  const tLf = map[r]?.[c - 1];
  const tRt = map[r]?.[c + 1];
  const isFloor = t === 20 || t === 26 || t === 27 || t === 28;

  switch (t) {
    case 20: // Suelo de cueva - piedra natural con variación
      {
        // Color base con variación por posición
        const v = (c * 7 + r * 13) % 3;
        const bases = ['#3D4455', '#3A4050', '#383E4C'];
        cx.fillStyle = bases[v];
        cx.fillRect(x, y, T, T);

        // Textura de piedra irregular
        cx.fillStyle = '#434B5C';
        if ((c + r) % 2 === 0) {
          cx.fillRect(x + 2, y + 2, 14, 14);
          cx.fillRect(x + 18, y + 18, 12, 12);
        } else {
          cx.fillRect(x + 4, y + 16, 12, 14);
          cx.fillRect(x + 20, y + 2, 10, 12);
        }

        // Grietas finas
        cx.fillStyle = '#2E3440';
        if ((c * 3 + r * 5) % 7 === 0) {
          cx.fillRect(x + 8, y + 4, 1, 10);
          cx.fillRect(x + 8, y + 4, 6, 1);
        }
        if ((c * 5 + r * 3) % 11 === 0) {
          cx.fillRect(x + 20, y + 18, 1, 8);
          cx.fillRect(x + 16, y + 18, 5, 1);
        }

        // Piedras pequeñas sueltas
        cx.fillStyle = '#4A5268';
        if ((c * 11 + r * 7) % 9 === 0) {
          cx.fillRect(x + 6, y + 24, 3, 2);
          cx.fillRect(x + 22, y + 8, 2, 2);
        }
        if ((c * 7 + r * 11) % 13 === 0) {
          cx.fillRect(x + 14, y + 26, 4, 2);
        }

        // Charcos de agua ocasionales
        if ((c * 13 + r * 17) % 23 === 0) {
          cx.fillStyle = '#2A3A5A';
          cx.fillRect(x + 8, y + 12, 10, 6);
          cx.fillStyle = '#3A4A6A';
          cx.fillRect(x + 10, y + 14, 6, 2);
          cx.fillStyle = 'rgba(100,160,220,.15)';
          cx.fillRect(x + 10, y + 13, 4, 1);
        }

        // Bordes suaves hacia paredes
        if (tUp === 21) {
          cx.fillStyle = '#2A3040';
          cx.fillRect(x, y, T, 4);
          cx.fillStyle = '#323844';
          cx.fillRect(x + 2, y + 2, T - 4, 3);
        }
        if (tDn === 21) {
          cx.fillStyle = '#2A3040';
          cx.fillRect(x, y + 28, T, 4);
          cx.fillStyle = '#323844';
          cx.fillRect(x + 2, y + 27, T - 4, 3);
        }
        if (tLf === 21) {
          cx.fillStyle = '#2A3040';
          cx.fillRect(x, y, 4, T);
          cx.fillStyle = '#323844';
          cx.fillRect(x + 1, y + 2, 4, T - 4);
        }
        if (tRt === 21) {
          cx.fillStyle = '#2A3040';
          cx.fillRect(x + 28, y, 4, T);
          cx.fillStyle = '#323844';
          cx.fillRect(x + 27, y + 2, 4, T - 4);
        }

        // Musgo en esquinas contra paredes
        if (tUp === 21 && tLf === 21) {
          cx.fillStyle = '#2A5038';
          cx.fillRect(x + 1, y + 1, 5, 3);
          cx.fillRect(x + 1, y + 1, 3, 5);
        }
        if (tUp === 21 && tRt === 21) {
          cx.fillStyle = '#2A5038';
          cx.fillRect(x + 26, y + 1, 5, 3);
          cx.fillRect(x + 28, y + 1, 3, 5);
        }
      }
      break;

    case 21: // Pared de cueva - roca sólida con profundidad
      {
        // Base oscura
        cx.fillStyle = '#1A2030';
        cx.fillRect(x, y, T, T);

        // Capas de roca con variación
        const rv = (c * 11 + r * 7) % 4;
        if (rv === 0) {
          cx.fillStyle = '#222838';
          cx.fillRect(x + 1, y + 1, 15, 15);
          cx.fillStyle = '#252C3C';
          cx.fillRect(x + 17, y + 17, 14, 14);
          cx.fillStyle = '#1E2535';
          cx.fillRect(x + 2, y + 18, 12, 13);
          cx.fillStyle = '#212838';
          cx.fillRect(x + 18, y + 1, 13, 14);
        } else if (rv === 1) {
          cx.fillStyle = '#232A3A';
          cx.fillRect(x + 2, y + 2, 20, 12);
          cx.fillStyle = '#1E2535';
          cx.fillRect(x + 1, y + 16, 18, 15);
          cx.fillStyle = '#212838';
          cx.fillRect(x + 20, y + 14, 11, 17);
        } else if (rv === 2) {
          cx.fillStyle = '#252C3C';
          cx.fillRect(x + 1, y + 1, 12, 20);
          cx.fillStyle = '#1E2535';
          cx.fillRect(x + 14, y + 2, 17, 13);
          cx.fillStyle = '#222838';
          cx.fillRect(x + 3, y + 22, 26, 9);
        } else {
          cx.fillStyle = '#212838';
          cx.fillRect(x + 2, y + 1, 28, 14);
          cx.fillStyle = '#1E2535';
          cx.fillRect(x + 1, y + 16, 14, 15);
          cx.fillStyle = '#252C3C';
          cx.fillRect(x + 16, y + 18, 15, 13);
        }

        // Juntas entre piedras
        cx.fillStyle = '#151C28';
        cx.fillRect(x + 15, y, 1, T);
        cx.fillRect(x, y + 15, T, 1);
        if (rv % 2 === 0) {
          cx.fillRect(x + 8, y + 8, 1, 8);
          cx.fillRect(x + 22, y + 20, 1, 6);
        }

        // Textura de roca (puntos)
        cx.fillStyle = '#2A3248';
        if ((c + r) % 3 === 0) {
          cx.fillRect(x + 6, y + 6, 2, 2);
          cx.fillRect(x + 22, y + 22, 2, 2);
        }
        if ((c + r) % 5 === 0) {
          cx.fillRect(x + 18, y + 8, 2, 2);
          cx.fillRect(x + 8, y + 24, 2, 2);
        }

        // Brillo sutil en bordes superiores
        if (tUp !== 21) {
          cx.fillStyle = '#303848';
          cx.fillRect(x + 2, y, T - 4, 2);
          cx.fillStyle = '#384058';
          cx.fillRect(x + 4, y, T - 8, 1);
        }

        // Musgo/humedad en paredes que tocan suelo
        const touchesFloor =
          (tUp !== 21 && tUp !== undefined) ||
          (tDn !== 21 && tDn !== undefined) ||
          (tLf !== 21 && tLf !== undefined) ||
          (tRt !== 21 && tRt !== undefined);
        if (touchesFloor && (c * 3 + r * 7) % 5 === 0) {
          cx.fillStyle = '#2A5040';
          if (tDn !== 21 && tDn !== undefined)
            cx.fillRect(x + 4 + ((c * 7) % 10), y + 28, 6, 3);
          if (tRt !== 21 && tRt !== undefined)
            cx.fillRect(x + 28, y + 6 + ((r * 5) % 8), 3, 5);
        }

        // Antorcha decorativa
        if ((c * 5 + r * 3) % 13 === 0 && touchesFloor) {
          // Soporte de hierro
          cx.fillStyle = '#484848';
          cx.fillRect(x + 14, y + 8, 4, 2);
          cx.fillStyle = '#585858';
          cx.fillRect(x + 13, y + 6, 6, 3);
          // Antorcha de madera
          cx.fillStyle = '#5A4020';
          cx.fillRect(x + 15, y + 10, 2, 8);
          cx.fillStyle = '#6A5030';
          cx.fillRect(x + 14, y + 9, 4, 2);
          // Llama animada
          const flk = Math.sin(fr * 0.15 + c + r) * 2;
          cx.fillStyle = '#E07020';
          cx.fillRect(x + 13, y + 4 + flk, 6, 5);
          cx.fillStyle = '#F09030';
          cx.fillRect(x + 14, y + 3 + flk, 4, 4);
          cx.fillStyle = '#F8B850';
          cx.fillRect(x + 15, y + 2 + flk, 2, 3);
          cx.fillStyle = '#F8D880';
          cx.fillRect(x + 15, y + 1 + flk, 2, 2);
          // Halo de luz
          cx.globalAlpha = 0.06;
          cx.fillStyle = '#F8A050';
      pixelGlow(x + 16, y + 10, 14, 12);
          cx.globalAlpha = 1;
          // Chispas
          if (fr % 30 < 15) {
            cx.fillStyle = '#F8C060';
            cx.fillRect(x + 12 + Math.sin(fr * 0.2) * 3, y + flk, 1, 1);
            cx.fillRect(x + 18 + Math.sin(fr * 0.3) * 2, y + 2 + flk, 1, 1);
          }
        }

        // Estandarte ocasional
        if ((c * 7 + r * 2) % 17 === 0 && touchesFloor) {
          cx.fillStyle = '#484848';
          cx.fillRect(x + 12, y + 6, 8, 2);
          cx.fillStyle = '#6A2020';
          cx.fillRect(x + 13, y + 8, 6, 12);
          cx.fillStyle = '#7A3030';
          cx.fillRect(x + 14, y + 10, 4, 8);
          // Emblema
          cx.fillStyle = '#C8A830';
          cx.fillRect(x + 15, y + 12, 2, 3);
          // Punta
          cx.fillStyle = '#6A2020';
          cx.fillRect(x + 14, y + 20, 2, 2);
          cx.fillRect(x + 16, y + 20, 2, 2);
          cx.fillRect(x + 15, y + 22, 2, 1);
        }
      }
      break;

    case 22: // Cristal decorativo cueva - gemas brillantes
      {
        cx.fillStyle = '#3D4455';
        cx.fillRect(x, y, T, T);
        // Textura suelo
        cx.fillStyle = '#434B5C';
        if ((c + r) % 2 === 0) cx.fillRect(x + 2, y + 2, 14, 14);

        const gc = ['#40E8A8', '#E040A8', '#40A8F8', '#E8A840', '#A060F0'][
          (c + r) % 5
        ];
        const gcl = ['#80F8D0', '#F880C8', '#80D0F8', '#F8C878', '#C090F8'][
          (c + r) % 5
        ];
        const gl = Math.sin(fr * 0.08 + c + r) * 0.3 + 0.7;
        cx.globalAlpha = gl;

        // Base de cristal (roca)
        cx.fillStyle = '#404858';
        cx.fillRect(x + 8, y + 22, 16, 6);
        cx.fillStyle = '#485060';
        cx.fillRect(x + 10, y + 20, 12, 4);

        // Cristal principal
        cx.fillStyle = gc;
        cx.fillRect(x + 12, y + 6, 8, 16);
        cx.fillRect(x + 10, y + 10, 12, 8);
        // Interior brillante
        cx.fillStyle = gcl;
        cx.fillRect(x + 14, y + 8, 4, 12);
        cx.fillRect(x + 12, y + 12, 8, 4);

        // Cristales pequeños al lado
        cx.fillStyle = gc;
        cx.fillRect(x + 6, y + 14, 4, 8);
        cx.fillRect(x + 22, y + 12, 4, 10);
        cx.fillStyle = gcl;
        cx.fillRect(x + 7, y + 16, 2, 4);
        cx.fillRect(x + 23, y + 14, 2, 6);

        // Brillo estrella
        cx.fillStyle = '#fff';
        cx.fillRect(x + 14, y + 10, 1, 3);
        cx.fillRect(x + 13, y + 11, 3, 1);

        // Reflejo
        cx.fillStyle = 'rgba(255,255,255,.25)';
        cx.fillRect(x + 12, y + 8, 3, 8);
        cx.globalAlpha = 1;

        // Destellos animados
        if (fr % 20 < 10) {
          cx.globalAlpha = 0.7;
          cx.fillStyle = '#F8F8F8';
          cx.fillRect(x + 6 + Math.sin(fr * 0.1) * 2, y + 4, 2, 2);
          cx.fillRect(x + 24 + Math.sin(fr * 0.12) * 2, y + 18, 2, 2);
          cx.globalAlpha = 1;
        }

        // Halo de color
        cx.globalAlpha = 0.04;
        cx.fillStyle = gc;
      pixelGlow(x + 16, y + 16, 14, 12);
        cx.globalAlpha = 1;
      }
      break;

    case 23: // Agua subterránea - lago oscuro profundo
      {
        const w = Math.sin(fr * 0.04 + c * 0.7 + r * 0.5);
        cx.fillStyle = w > 0 ? '#162848' : '#1E3458';
        cx.fillRect(x, y, T, T);

        // Profundidad
        cx.fillStyle = '#0E1830';
        cx.fillRect(x + 4, y + 4, T - 8, T - 8);
        cx.fillStyle = '#122040';
        cx.fillRect(x + 8, y + 8, T - 16, T - 16);

        // Ondas suaves
        cx.fillStyle = '#2A4870';
        const w1 = Math.sin(fr * 0.05 + c * 1.5) * 4;
        const w2 = Math.sin(fr * 0.04 + c * 2) * 3;
        cx.fillRect(x + w1 + 8, y + 8, 14, 1);
        cx.fillRect(x + w2 + 6, y + 16, 12, 1);
        cx.fillRect(x + w1 + 10, y + 24, 10, 1);

        // Reflejos brillantes
        cx.fillStyle = 'rgba(80,160,255,.15)';
        cx.fillRect(x + Math.sin(fr * 0.07 + c) * 5 + 10, y + 12, 6, 1);
        cx.fillRect(x + Math.sin(fr * 0.06 + r) * 4 + 8, y + 20, 8, 1);

        // Espuma en bordes
        if (tUp !== 23 && tUp !== undefined) {
          cx.fillStyle = '#3A5878';
          cx.fillRect(x, y, T, 3);
          cx.fillStyle = '#4A6888';
          cx.fillRect(x + 4, y, T - 8, 2);
          cx.fillStyle = 'rgba(100,180,230,.2)';
          cx.fillRect(x + 6 + Math.sin(fr * 0.08 + c) * 3, y + 1, 8, 1);
        }
        if (tDn !== 23 && tDn !== undefined) {
          cx.fillStyle = '#3A5878';
          cx.fillRect(x, y + 29, T, 3);
          cx.fillStyle = '#4A6888';
          cx.fillRect(x + 4, y + 30, T - 8, 2);
        }
        if (tLf !== 23 && tLf !== undefined) {
          cx.fillStyle = '#3A5878';
          cx.fillRect(x, y, 3, T);
        }
        if (tRt !== 23 && tRt !== undefined) {
          cx.fillStyle = '#3A5878';
          cx.fillRect(x + 29, y, 3, T);
        }

        // Burbujas ocasionales
        if ((c * 7 + r * 11) % 13 === 0) {
          const by2 = Math.sin(fr * 0.06 + c) * 3;
          cx.globalAlpha = 0.4;
          cx.fillStyle = '#5888B8';
          cx.fillRect(x + 14 + by2, y + 10, 3, 3);
          cx.fillRect(x + 20 + by2, y + 18, 2, 2);
          cx.globalAlpha = 1;
        }
      }
      break;

    case 24: // Lava - magma ardiente pulsante
      {
        // Roca oscura alrededor
        cx.fillStyle = '#2A1810';
        cx.fillRect(x, y, T, T);

        // Lava interior
        const lp = Math.sin(fr * 0.08 + c * 0.5 + r * 0.3);
        cx.fillStyle = lp > 0 ? '#C02818' : '#D83820';
        cx.fillRect(x + 2, y + 2, T - 4, T - 4);
        cx.fillStyle = '#E04830';
        cx.fillRect(x + 4, y + 4, T - 8, T - 8);
        cx.fillStyle = '#E86040';
        cx.fillRect(x + 6, y + 6, T - 12, T - 12);

        // Venas de magma brillante
        cx.fillStyle = '#F08050';
        const vx = Math.sin(fr * 0.1 + c) * 3;
        cx.fillRect(x + 10 + vx, y + 8, 4, 4);
        cx.fillRect(x + 16 + vx, y + 18, 5, 3);
        cx.fillRect(x + 8, y + 14 + vx, 3, 4);

        // Centro incandescente
        cx.fillStyle = '#F8A070';
        cx.fillRect(x + 12, y + 12, 8, 8);
        cx.fillStyle = '#F8C098';
        cx.fillRect(x + 14, y + 14, 4, 4);

        // Burbujas de lava
        if (fr % 16 < 8) {
          const bx = Math.sin(fr * 0.12 + c) * 4;
          cx.fillStyle = '#F8B060';
          cx.fillRect(x + 10 + bx, y + 8, 4, 3);
          cx.fillStyle = '#F8D088';
          cx.fillRect(x + 11 + bx, y + 7, 2, 2);
        }
        if (fr % 24 < 12) {
          cx.fillStyle = '#F8A050';
          cx.fillRect(x + 20, y + 20 + Math.sin(fr * 0.1) * 2, 3, 3);
        }

        // Corteza oscura en bordes
        cx.fillStyle = '#801808';
        cx.fillRect(x + 2, y + 2, T - 4, 2);
        cx.fillRect(x + 2, y + T - 4, T - 4, 2);
        cx.fillRect(x + 2, y + 2, 2, T - 4);
        cx.fillRect(x + T - 4, y + 2, 2, T - 4);

        // Grietas de calor en corteza
        cx.fillStyle = '#D04020';
        if ((c + r) % 2 === 0) {
          cx.fillRect(x + 3, y + 8, 1, 6);
          cx.fillRect(x + T - 4, y + 12, 1, 8);
        }

        // Calor emanando hacia arriba
        if (tUp !== 24) {
          cx.globalAlpha = 0.06;
          cx.fillStyle = '#F88040';
          cx.fillRect(x + 6, y - 4 + Math.sin(fr * 0.06 + c) * 2, 6, 8);
          cx.fillRect(x + 18, y - 2 + Math.sin(fr * 0.08 + c) * 3, 4, 6);
          cx.globalAlpha = 1;
        }

        // Brillo pulsante
        cx.globalAlpha = 0.04 + Math.sin(fr * 0.1 + c + r) * 0.02;
        cx.fillStyle = '#F8A060';
        cx.fillRect(x, y, T, T);
        cx.globalAlpha = 1;
      }
      break;

    case 26: // Vegetación de cueva - ecosistema subterráneo
      {
        // Suelo base
        const v = (c * 7 + r * 13) % 3;
        cx.fillStyle = ['#3D4455', '#3A4050', '#383E4C'][v];
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#434B5C';
        if ((c + r) % 2 === 0) cx.fillRect(x + 2, y + 2, 14, 14);

        // Musgo en suelo
        cx.fillStyle = '#1A4030';
        cx.fillRect(x, y + 24, T, 8);
        cx.fillStyle = '#204838';
        cx.fillRect(x + 2, y + 26, T - 4, 4);

        // Tallos de plantas bioluminiscentes
        cx.fillStyle = '#1A5840';
        cx.fillRect(x + 4, y + 6, 2, 20);
        cx.fillRect(x + 14, y + 4, 2, 22);
        cx.fillRect(x + 24, y + 8, 2, 18);
        // Hojas
        cx.fillStyle = '#28704A';
        cx.fillRect(x + 2, y + 10, 4, 2);
        cx.fillRect(x + 5, y + 14, 4, 2);
        cx.fillRect(x + 12, y + 8, 4, 2);
        cx.fillRect(x + 15, y + 12, 4, 2);
        cx.fillRect(x + 22, y + 12, 4, 2);
        cx.fillRect(x + 25, y + 16, 4, 2);

        // Puntas brillantes bioluminiscentes
        const glow = Math.sin(fr * 0.06 + c + r) * 0.3 + 0.7;
        cx.globalAlpha = glow;
        cx.fillStyle = '#50F8A0';
        cx.fillRect(x + 4, y + 4, 2, 3);
        cx.fillRect(x + 14, y + 2, 2, 3);
        cx.fillRect(x + 24, y + 6, 2, 3);
        cx.globalAlpha = 1;

        // Hongos grandes
        const hc = ['#8860B0', '#6898C0', '#C07850'][(c * 3 + r) % 3];
        const hcl = ['#A880D0', '#88B8E0', '#D89870'][(c * 3 + r) % 3];
        // Hongo 1
        cx.fillStyle = '#C8B898';
        cx.fillRect(x + 8, y + 20, 2, 6); // Tallo
        cx.fillStyle = hc;
        cx.fillRect(x + 5, y + 16, 8, 5); // Sombrero
        cx.fillStyle = hcl;
        cx.fillRect(x + 6, y + 17, 6, 3);
        cx.fillStyle = 'rgba(255,255,255,.2)';
        cx.fillRect(x + 6, y + 17, 3, 1);
        // Hongo 2
        cx.fillStyle = '#C8B898';
        cx.fillRect(x + 21, y + 18, 2, 8);
        cx.fillStyle = hc;
        cx.fillRect(x + 18, y + 14, 8, 5);
        cx.fillStyle = hcl;
        cx.fillRect(x + 19, y + 15, 6, 3);
        cx.fillStyle = 'rgba(255,255,255,.2)';
        cx.fillRect(x + 19, y + 15, 3, 1);

        // Esporas flotantes
        if ((c + r) % 3 === 0) {
          cx.globalAlpha = 0.3 + Math.sin(fr * 0.04 + c) * 0.15;
          cx.fillStyle = '#80F8C0';
          cx.fillRect(
            x + 10 + Math.sin(fr * 0.05 + c) * 3,
            y + 6 + Math.sin(fr * 0.04 + r) * 2,
            2,
            2
          );
          cx.fillRect(
            x + 20 + Math.sin(fr * 0.07 + r) * 2,
            y + 4 + Math.sin(fr * 0.06 + c) * 3,
            1,
            1
          );
          cx.globalAlpha = 1;
        }

        // Halo bioluminiscente sutil
        cx.globalAlpha = 0.03;
        cx.fillStyle = '#50F8A0';
      pixelGlow(x + 16, y + 12, 12, 10);
        cx.globalAlpha = 1;
      }
      break;

    case 27: // Salida de cueva - luz del exterior
      {
        // Marco de roca
        cx.fillStyle = '#1A2030';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#252C3C';
        cx.fillRect(x + 2, y + 1, T - 4, 3);
        cx.fillRect(x + 2, y + T - 3, T - 4, 2);
        cx.fillRect(x, y + 2, 3, T - 4);
        cx.fillRect(x + T - 3, y + 2, 3, T - 4);

        // Arco de piedra superior
        cx.fillStyle = '#303848';
        cx.fillRect(x + 2, y, T - 4, 4);
        cx.fillStyle = '#384058';
        cx.fillRect(x + 4, y + 1, T - 8, 2);

        // Interior luminoso (gradiente simulado)
        cx.fillStyle = '#708090';
        cx.fillRect(x + 4, y + 5, T - 8, T - 6);
        cx.fillStyle = '#90A0B0';
        cx.fillRect(x + 6, y + 7, T - 12, T - 8);
        cx.fillStyle = '#B0C0D0';
        cx.fillRect(x + 8, y + 9, T - 16, T - 10);
        cx.fillStyle = '#D0D8E0';
        cx.fillRect(x + 10, y + 11, T - 20, T - 14);

        // Rayos de luz
        cx.globalAlpha = 0.15;
        cx.fillStyle = '#F8F8E0';
        cx.fillRect(x + 10, y + 4, 4, T - 6);
        cx.fillRect(x + 18, y + 6, 3, T - 8);
        cx.globalAlpha = 1;

        // Flecha animada
        const ab = Math.sin(fr * 0.15) * 2;
        cx.fillStyle = '#F8F8F8';
        cx.fillRect(x + 13, y + 14 + ab, 6, 3);
        cx.fillRect(x + 15, y + 12 + ab, 2, 2);

        // Musgo en los bordes del arco
        cx.fillStyle = '#2A5038';
        cx.fillRect(x + 2, y + 4, 4, 3);
        cx.fillRect(x + T - 6, y + 5, 4, 3);

        // Partículas de polvo en la luz
        if (fr % 20 < 10) {
          cx.globalAlpha = 0.3;
          cx.fillStyle = '#F8F0D0';
          cx.fillRect(x + 12 + Math.sin(fr * 0.08) * 3, y + 10, 1, 1);
          cx.fillRect(x + 18 + Math.sin(fr * 0.1) * 2, y + 16, 1, 1);
          cx.globalAlpha = 1;
        }
      }
      break;

    case 29: // Desnivel de cueva / plataforma rocosa
      {
        const v = (c * 7 + r * 13) % 3;
        cx.fillStyle = ['#3D4455', '#3A4050', '#383E4C'][v];
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#2E3440';
        cx.fillRect(x, y + 14, T, 16);
        cx.fillStyle = '#525C70';
        cx.fillRect(x, y + 10, T, 6);
        cx.fillStyle = '#677288';
        if ((c + r) % 2 === 0) cx.fillRect(x + 4, y + 10, 12, 2);
        else cx.fillRect(x + 18, y + 10, 10, 2);
        cx.fillStyle = '#252B36';
        cx.fillRect(x + 7, y + 20, 2, 8);
        cx.fillRect(x + 22, y + 18, 2, 6);
      }
      break;

    case 28: // Pin de hallazgo en cueva/torre (negro/rojo) — gema baja, SIN asta/báculo
      {
        // Suelo base
        const v = (c * 7 + r * 13) % 3;
        cx.fillStyle = ['#3D4455', '#3A4050', '#383E4C'][v];
        cx.fillRect(x, y, T, T);

        // Montículo de piedra bajo el pin
        cx.fillStyle = '#2A3038';
        cx.fillRect(x + 8, y + 22, 16, 6);
        cx.fillStyle = '#383E48';
        cx.fillRect(x + 10, y + 21, 12, 4);

        // Sombra
        cx.fillStyle = 'rgba(0,0,0,0.35)';
        cx.fillRect(x + 10, y + 26, 12, 3);

        // Base negra baja (engaste, no asta)
        cx.fillStyle = '#08080C';
        cx.fillRect(x + 10, y + 17, 12, 7);
        cx.fillStyle = '#1A1214';
        cx.fillRect(x + 11, y + 18, 10, 5);
        cx.fillStyle = '#2A1818';
        cx.fillRect(x + 12, y + 19, 8, 3);

        // Gema roja compacta
        const pulse = 0.82 + Math.sin(fr * 0.12) * 0.18;
        cx.globalAlpha = pulse;
        cx.fillStyle = '#100408';
        cx.fillRect(x + 11, y + 9, 10, 10);
        cx.fillRect(x + 12, y + 8, 8, 12);
        cx.fillStyle = '#8B1018';
        cx.fillRect(x + 12, y + 10, 8, 8);
        cx.fillStyle = '#C81828';
        cx.fillRect(x + 13, y + 11, 6, 6);
        cx.fillStyle = '#E83040';
        cx.fillRect(x + 14, y + 12, 4, 4);
        cx.fillStyle = '#FF6870';
        cx.fillRect(x + 14, y + 11, 2, 2);
        cx.globalAlpha = 1;

        // Banda del engaste
        cx.fillStyle = '#08080C';
        cx.fillRect(x + 11, y + 16, 10, 2);

        // Aura roja suave
        cx.globalAlpha = 0.08 + Math.sin(fr * 0.08) * 0.04;
        cx.fillStyle = '#C81828';
        pixelGlow(x + 16, y + 14, 12, 10);
        cx.globalAlpha = 1;

        // Destellos rojos
        if (fr % 22 < 11) {
          cx.globalAlpha = 0.65;
          cx.fillStyle = '#FF4050';
          cx.fillRect(x + 8, y + 9, 2, 2);
          cx.fillRect(x + 22, y + 13, 2, 2);
          cx.globalAlpha = 1;
        }
      }
      break;

    // ==========================================
    // CASTILLO (sin cambios en estructura)
    // ==========================================

    case 30: // Suelo de castillo
      cx.fillStyle = '#585068';
      cx.fillRect(x, y, T, T);
      if ((c + r) % 2 === 0) {
        cx.fillStyle = '#686078';
        cx.fillRect(x + 1, y + 1, T - 2, T - 2);
        cx.fillStyle = '#706880';
        cx.fillRect(x + 2, y + 2, T - 4, T - 4);
      } else {
        cx.fillStyle = '#504868';
        cx.fillRect(x + 1, y + 1, T - 2, T - 2);
      }
      cx.fillStyle = '#484058';
      cx.fillRect(x, y, T, 1);
      cx.fillRect(x, y, 1, T);
      if (c >= 14 && c <= 16) {
        cx.fillStyle = '#A02020';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#B83030';
        cx.fillRect(x + 2, y, T - 4, T);
        cx.fillStyle = '#C84040';
        cx.fillRect(x + 4, y, T - 8, T);
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 1, y, 2, T);
        cx.fillRect(x + T - 3, y, 2, T);
      }
      break;

    case 31: // Pared de castillo
      cx.fillStyle = '#383048';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#484058';
      cx.fillRect(x + 2, y + 2, T - 4, T - 4);
      cx.fillStyle = '#504860';
      if ((c + r) % 2 === 0) {
        cx.fillRect(x + 1, y + 1, 15, 15);
        cx.fillRect(x + 17, y + 17, 14, 14);
      } else {
        cx.fillRect(x + 17, y + 1, 14, 15);
        cx.fillRect(x + 1, y + 17, 15, 14);
      }
      cx.fillStyle = '#302840';
      cx.fillRect(x + 16, y, 1, T);
      cx.fillRect(x, y + 16, T, 1);
      if ((c * 5 + r * 3) % 11 === 0) {
        cx.fillStyle = '#5A4020';
        cx.fillRect(x + 14, y + 6, 4, 10);
        cx.fillStyle = '#6A5030';
        cx.fillRect(x + 13, y + 5, 6, 3);
        const flk = Math.sin(fr * 0.15 + c) * 2;
        cx.fillStyle = '#E88030';
        cx.fillRect(x + 13, y + 2 + flk, 6, 4);
        cx.fillStyle = '#F8A050';
        cx.fillRect(x + 14, y + 1 + flk, 4, 3);
        cx.fillStyle = '#F8D080';
        cx.fillRect(x + 15, y + flk, 2, 2);
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#F8A050';
      pixelGlow(x + 16, y + 8, 12, 10);
        cx.globalAlpha = 1;
      }
      if ((c * 7 + r * 2) % 13 === 0) {
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 12, y + 4, 8, 2);
        cx.fillStyle = '#A02020';
        cx.fillRect(x + 13, y + 6, 6, 14);
        cx.fillStyle = '#B03030';
        cx.fillRect(x + 14, y + 8, 4, 10);
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 15, y + 10, 2, 4);
        cx.fillStyle = '#A02020';
        cx.fillRect(x + 14, y + 20, 2, 2);
        cx.fillRect(x + 16, y + 20, 2, 2);
        cx.fillRect(x + 15, y + 22, 2, 2);
      }
      break;

    case 32: // Suelo sala del trono
      cx.fillStyle = '#685078';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#786088';
      if ((c + r) % 2 === 0) cx.fillRect(x + 2, y + 2, T - 4, T - 4);
      cx.fillStyle = '#C8A830';
      if ((c + r) % 4 === 0) {
        cx.fillRect(x + 12, y + 12, 8, 8);
        cx.fillStyle = '#D8B840';
        cx.fillRect(x + 14, y + 14, 4, 4);
      }
      cx.fillStyle = '#584868';
      cx.fillRect(x, y, T, 1);
      cx.fillRect(x, y, 1, T);
      if (c >= 14 && c <= 16) {
        cx.fillStyle = '#C82020';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#D83030';
        cx.fillRect(x + 2, y, T - 4, T);
        cx.fillStyle = '#E84040';
        cx.fillRect(x + 4, y, T - 8, T);
        cx.fillStyle = '#E8C830';
        cx.fillRect(x + 1, y, 2, T);
        cx.fillRect(x + T - 3, y, 2, T);
        if ((c + r) % 3 === 0) {
          cx.fillStyle = '#F8D830';
          cx.fillRect(x + 12, y + 12, 8, 8);
          cx.fillStyle = '#F8E848';
          cx.fillRect(x + 14, y + 14, 4, 4);
        }
      }
      break;

    case 33: // Salida del castillo
      cx.fillStyle = '#585068';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#5A4A38';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#6A5A48';
      cx.fillRect(x + 2, y + 1, T - 4, 3);
      cx.fillStyle = '#A0A0A0';
      cx.fillRect(x + 4, y + 6, T - 8, T - 6);
      cx.fillStyle = '#C0C0C0';
      cx.fillRect(x + 6, y + 8, T - 12, T - 8);
      cx.fillStyle = '#E0E0E0';
      cx.fillRect(x + 8, y + 10, T - 16, T - 12);
      const ab2 = Math.sin(fr * 0.15) * 2;
      cx.fillStyle = '#F8F8F8';
      cx.fillRect(x + 13, y + 14 + ab2, 6, 4);
      px(x + 15, y + 12 + ab2, 2, 2, '#F8F8F8');
      cx.fillStyle = '#C8A830';
      cx.fillRect(x + 2, y + 8, 3, 3);
      cx.fillRect(x + T - 5, y + 8, 3, 3);
      cx.globalAlpha = 0.08;
      cx.fillStyle = '#F8F8E0';
      cx.fillRect(x + 2, y + 4, T - 4, T - 4);
      cx.globalAlpha = 1;
      break;

    case 34: {
      // Puerta bloqueada del rey (con candado dorado). Sólida.
      // Fondo de piedra oscura
      cx.fillStyle = '#3A3040';
      cx.fillRect(x, y, T, T);
      // Marco de la puerta (madera oscura)
      cx.fillStyle = '#4A3018';
      cx.fillRect(x + 2, y, T - 4, T);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 4, y + 2, T - 8, T - 2);
      // Tablones verticales
      cx.fillStyle = '#5A3818';
      cx.fillRect(x + T / 2 - 1, y + 2, 2, T - 4);
      // Bordes metálicos horizontales
      cx.fillStyle = '#888';
      cx.fillRect(x + 4, y + 6, T - 8, 2);
      cx.fillRect(x + 4, y + T - 10, T - 8, 2);
      // Remaches dorados
      cx.fillStyle = '#C8A830';
      cx.fillRect(x + 6, y + 6, 2, 2);
      cx.fillRect(x + T - 8, y + 6, 2, 2);
      cx.fillRect(x + 6, y + T - 10, 2, 2);
      cx.fillRect(x + T - 8, y + T - 10, 2, 2);
      // CANDADO GRANDE dorado en el centro (parpadea sutilmente)
      const glow = Math.sin(fr * 0.08) * 0.3 + 0.7;
      cx.globalAlpha = glow;
      cx.fillStyle = '#000';
      cx.fillRect(x + T / 2 - 5, y + T / 2 - 4, 10, 10);
      cx.fillStyle = '#F8D030';
      cx.fillRect(x + T / 2 - 4, y + T / 2 - 3, 8, 8);
      // Arco del candado
      cx.fillStyle = '#000';
      cx.fillRect(x + T / 2 - 3, y + T / 2 - 7, 6, 2);
      cx.fillRect(x + T / 2 - 3, y + T / 2 - 6, 2, 3);
      cx.fillRect(x + T / 2 + 1, y + T / 2 - 6, 2, 3);
      // Ojo de la cerradura (X negra)
      cx.fillStyle = '#000';
      cx.fillRect(x + T / 2 - 1, y + T / 2 - 1, 2, 3);
      cx.globalAlpha = 1;
      break;
    }
  } // fin switch
} // fin dTileC

export { dTileC };
