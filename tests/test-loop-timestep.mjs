const STEP_MS = 1000 / 60, MAX_STEPS = 5;
function simulate(hz, seconds, renderCostMs = 0) {
  let acc = 0, last = 0, updates = 0, draws = 0;
  const frameMs = 1000 / hz;
  const frames = Math.round(seconds * hz);
  for (let i = 0; i < frames; i++) {
    const ts = i * frameMs;
    if (!last) last = ts;
    const elapsed = ts - last;
    last = ts;
    acc += Math.min(elapsed, STEP_MS * MAX_STEPS);
    let steps = 0;
    while (acc >= STEP_MS && steps < MAX_STEPS) { updates++; acc -= STEP_MS; steps++; }
    if (steps === MAX_STEPS) acc = 0;
    draws++;
    if (renderCostMs) { /* coste de render simulado */ }
  }
  return { updates, draws, updatesPerSecond: (updates / seconds).toFixed(1) };
}
let fails = 0;
const ok = (c, l) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fails++; };

console.log('Hz | updates en 10s | esperado 600');
for (const hz of [30, 60, 120, 144, 240]) {
  const r = simulate(hz, 10);
  const ratio = r.updates / 600;
  console.log(`${String(hz).padStart(3)} | ${String(r.updates).padStart(14)} | ratio ${ratio.toFixed(2)}x`);
  ok(Math.abs(ratio - 1) < 0.06, `${hz} Hz → velocidad de juego ${ratio.toFixed(2)}x (antes: ${(hz / 60).toFixed(2)}x)`);
}
console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
