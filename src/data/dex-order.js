// Orden del Criaturario (Dex) — define en qué orden aparecen las criaturas
// en la pantalla de Dex y en el desfile del título.
//
// dexIds() devuelve el orden completo, añadiendo automáticamente cualquier
// criatura del CDB que se olvidara agregar aquí, y siempre poniendo al
// legendario 'serafox' al final.

import { CDB } from './creatures.js';

const DEX_ORDER = [
  // Iniciales: Planta -> Fuego -> Agua
  'gorilan', 'gorilirico', 'gorilegend',
  'flameye', 'flamcrest', 'inferpavo',
  'axolotl', 'ajolord', 'glaciolote',

  // Resto por ciclos: Planta -> Fuego -> Agua -> Dragón -> Hada
  'ivygoat', 'hedroble',
  'flamingo', 'flamencero',
  'medusync', 'medubass',
  'wyvern', 'wyvernax', 'wyvernlord',
  'pixie', 'duendetron',

  'orquidea', 'mantisdanza',
  'emberwing',
  'pinzardo', 'pinzamestre',
  'eastern', 'longwok',
  'sidhe', 'sidhearia',

  'thornbuck', 'espinarcor', 'espinardoom',
  'salamandro', 'alquimero', 'piromante',
  'pingueson', 'pinguchef', 'pingumitre',
  'ornispia', 'ornishadow', 'ornisagent',
  'spritefly', 'lucilente', 'lucistrella',

  'raizan',
  'blaztoro', 'infernotoro',
  'peztronauta', 'cosmocardumen',
  'serpentdrg', 'serpentboss',
  'elefantasy', 'elefantastico',

  'gusarix', 'crisalmanza', 'hydrapom',
  'zumbaflor', 'zumbaccino',

  // Legendario al final
  'serafox',
];

function dexIds() {
  const seen = new Set();
  const ordered = [];
  DEX_ORDER.forEach((id) => {
    if (CDB[id] && !seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  });
  // Seguridad: si agregamos criaturas nuevas y olvidamos meterlas al orden,
  // aparecen antes del legendario final sin romper el Criaturario.
  Object.keys(CDB).forEach((id) => {
    if (id !== 'serafox' && !seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  });
  if (CDB.serafox && !ordered.includes('serafox')) ordered.push('serafox');
  return ordered;
}

export { DEX_ORDER, dexIds };
