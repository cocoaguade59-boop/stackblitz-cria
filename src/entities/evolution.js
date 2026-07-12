// Sistema de evolución de criaturas.
// Depende de CDB.

import { CDB } from '../data/creatures.js';

// === SISTEMA DE EVOLUCIÓN ===
function checkEvolution(cre) {
  const data = CDB[cre.id];
  if (!data || !data.evo || !data.evoLv) return null;
  if (cre.lv >= data.evoLv) return data.evo;
  return null;
}

function evolveCre(cre) {
  const newId = checkEvolution(cre);
  if (!newId) return false;
  const newData = CDB[newId];
  if (!newData) return false;

  const oldName = cre.nm;
  cre.id = newId;
  cre.nm = newData.nm;
  cre.tp = newData.tp;
  cre.bHp = newData.hp;
  cre.bAk = newData.ak;
  cre.bDf = newData.df;
  cre.bSp = newData.sp;
  cre.calc();
  cre.hp = cre.mHp; // Curar al evolucionar

  return { oldName, newName: cre.nm };
}

export { checkEvolution, evolveCre };
