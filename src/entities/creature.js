// Clase Cre: representa una criatura instanciada (con nivel, HP, movs, etc.).
// Depende de CDB y ALL_MOVES.

import { CDB } from '../data/creatures.js';
import { ALL_MOVES } from '../data/moves.js';

// === CREATURE CLASS ===
class Cre {
  constructor(id, lv = 1, mix = false) {
    const d = CDB[id];
    if (!CDB[id]) {
      console.error('ID NO ENCONTRADO:', id);
      return;
    }

    this.id = id;
    this.nm = d.nm;
    this.tp = d.tp;
    this.lv = lv;
    this.ex = 0;
    this.exTo = lv * 30 + 20;
    this.bHp = d.hp;
    this.bAk = d.ak;
    this.bDf = d.df;
    this.bSp = d.sp;
    this.gender = Math.random() < 0.5 ? 'M' : 'F'; // Género aleatorio 50/50
    this.calc();
    this.hp = this.mHp;
    this.mv = mix ? this.mixMv() : this.gMv();
    this.fought = false;
  }

  calc() {
    this.mHp = Math.floor(this.bHp + this.lv * 6 + this.lv * this.lv * 0.3);
    this.ak = Math.floor(this.bAk + this.lv * 2.5);
    this.df = Math.floor(this.bDf + this.lv * 2);
    this.sp = Math.floor(this.bSp + this.lv * 1.5);
  }

  gMv() {
    const m = {
      fire: [
        {
          nm: 'Escupitajo Ardiente',
          tp: 'fire',
          pw: 40,
          pp: 25,
          mp: 25,
          acc: 100,
          desc: 'Escupe una chispa ardiente básica al enemigo.',
        },
        {
          nm: 'Picotazo',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Picotazo rápido y preciso.',
        },
        {
          nm: 'Bola Ígnea',
          tp: 'fire',
          pw: 70,
          pp: 12,
          mp: 12,
          acc: 90,
          desc: 'Una esfera de fuego concentrado. Potente pero algo imprecisa.',
        },
        {
          nm: 'Aleteo',
          tp: 'normal',
          pw: 45,
          pp: 20,
          mp: 20,
          acc: 95,
          desc: 'Golpe con alas extendidas.',
        },
      ],
      water: [
        {
          nm: 'Chorro',
          tp: 'water',
          pw: 40,
          pp: 25,
          mp: 25,
          acc: 100,
          desc: 'Dispara un chorro de agua básico al enemigo.',
        },
        {
          nm: 'Placaje',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Placaje con todo el cuerpo.',
        },
        {
          nm: 'Hidrobomba',
          tp: 'water',
          pw: 70,
          pp: 12,
          mp: 12,
          acc: 85,
          desc: 'Torrente de agua a presión. Potente pero imprecisa.',
        },
        {
          nm: 'Regenerar',
          tp: 'normal',
          pw: 0,
          pp: 10,
          mp: 10,
          acc: 100,
          ef: 'heal',
          desc: 'Concentra energía vital. Recupera 35% de HP máximo.',
        },
      ],
      plant: [
        {
          nm: 'Hoja Afilada',
          tp: 'plant',
          pw: 40,
          pp: 25,
          mp: 25,
          acc: 100,
          desc: 'Lanza hojas cortantes al enemigo.',
        },
        {
          nm: 'Embestida',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Embestida física básica.',
        },
        {
          nm: 'Tormenta Floral',
          tp: 'plant',
          pw: 70,
          pp: 12,
          mp: 12,
          acc: 90,
          desc: 'Tormenta de pétalos afilados. Potente pero algo imprecisa.',
        },
        {
          nm: 'Síntesis',
          tp: 'normal',
          pw: 0,
          pp: 10,
          mp: 10,
          acc: 100,
          ef: 'heal',
          desc: 'Absorbe luz solar. Recupera 35% de HP máximo.',
        },
      ],
      dragon: [
        {
          nm: 'Garra Dragón',
          tp: 'dragon',
          pw: 45,
          pp: 20,
          mp: 20,
          acc: 100,
          desc: 'Zarpazo con garras de dragón. Ataque básico.',
        },
        {
          nm: 'Cola Látigo',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Latigazo con la cola.',
        },
        {
          nm: 'Aliento Dragón',
          tp: 'dragon',
          pw: 75,
          pp: 10,
          mp: 10,
          acc: 90,
          desc: 'Exhala fuego ancestral. Potente pero algo impreciso.',
        },
        {
          nm: 'Embestida',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Embestida física básica.',
        },
      ],
      fairy: [
        {
          nm: 'Brillo Lunar',
          tp: 'fairy',
          pw: 40,
          pp: 25,
          mp: 25,
          acc: 100,
          desc: 'Rayo de luz de luna. Ataque básico de hada.',
        },
        {
          nm: 'Toque Mágico',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Toque con energía mágica sutil.',
        },
        {
          nm: 'Rayo Feérico',
          tp: 'fairy',
          pw: 70,
          pp: 12,
          mp: 12,
          acc: 90,
          desc: 'Rayo de energía feérica concentrada. Potente.',
        },
        {
          nm: 'Regenerar',
          tp: 'normal',
          pw: 0,
          pp: 10,
          mp: 10,
          acc: 100,
          ef: 'heal',
          desc: 'Concentra energía vital. Recupera 35% de HP máximo.',
        },
      ],
      normal: [
        {
          nm: 'Embestida',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Embestida física básica.',
        },
        {
          nm: 'Regenerar',
          tp: 'normal',
          pw: 0,
          pp: 10,
          mp: 10,
          acc: 100,
          ef: 'heal',
          desc: 'Concentra energía vital. Recupera 35% de HP máximo.',
        },
        {
          nm: 'Golpe Divino',
          tp: 'normal',
          pw: 80,
          pp: 8,
          mp: 8,
          acc: 90,
          desc: 'Golpe imbuido con energía celestial. Muy potente.',
        },
        {
          nm: 'Aura Celestial',
          tp: 'normal',
          pw: 0,
          pp: 5,
          mp: 5,
          acc: 100,
          ef: 'healAll',
          desc: 'Aura sagrada. Cura 20% HP a todo el equipo.',
        },
      ],
    };
    return m[this.tp] || m.fire;
  }

  mixMv() {
    return [...ALL_MOVES]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map((m) => ({ ...m, pp: m.mp }));
  }

  addEx(a) {
    this.ex += a;
    let l = false;
    while (this.ex >= this.exTo) {
      this.ex -= this.exTo;
      this.lv++;
      this.exTo = this.lv * 30 + 20;
      this.calc();
      this.hp = this.mHp;
      l = true;
    }
    return { leveled: l };
  }

  heal(a) {
    this.hp = Math.min(this.mHp, this.hp + a);
  }

  full() {
    this.hp = this.mHp;
    this.mv.forEach((m) => (m.pp = m.mp));
    this.fought = false;
  }

  toJSON() {
    return {
      id: this.id,
      lv: this.lv,
      hp: this.hp,
      ex: this.ex,
      gender: this.gender,
      mv: this.mv.map((m) => ({
        nm: m.nm,
        tp: m.tp,
        pw: m.pw,
        pp: m.pp,
        mp: m.mp,
        acc: m.acc || 100,
        ef: m.ef || null,
        desc: m.desc || '',
      })),
    };
  }

  static fromJSON(j) {
    const c = new Cre(j.id, j.lv);
    c.hp = j.hp;
    c.ex = j.ex;
    // Género: usar el guardado si existe, si no dejar el aleatorio del constructor
    if (j.gender === 'M' || j.gender === 'F') c.gender = j.gender;
    if (j.mv) {
      // Restaurar movimientos completos guardados
      c.mv = j.mv.map((savedMv) => {
        // Migrar nombres antiguos de partidas guardadas
        const savedName = savedMv.nm === 'Llamarada' ? 'Escupitajo Ardiente' : savedMv.nm;
        // Buscar el movimiento completo en ALL_MOVES o en los defaults
        const fullMove = ALL_MOVES.find((m) => m.nm === savedName);
        if (fullMove) {
          return { ...fullMove, pp: savedMv.pp };
        }
        // Si no se encuentra en ALL_MOVES, buscar en los movimientos por defecto
        const defaultMv = c.mv.find((m) => m.nm === savedName);
        if (defaultMv) {
          return { ...defaultMv, pp: savedMv.pp };
        }
        // Fallback: devolver lo que se guardó
        return savedMv;
      });
    }
    return c;
  }
}

export { Cre };
