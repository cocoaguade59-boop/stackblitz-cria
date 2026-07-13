// Contador global de frames. Se incrementa en el loop principal.
// Los módulos que lo importen obtienen siempre el valor actualizado
// (las importaciones ES son "live bindings", no copias).

let fr = 0;

function tickFrame() {
  fr++;
}

function getFrame() {
  return fr;
}

// Nota: NO se puede exportar `fr` directamente y usarla como número desde
// otro módulo sin llamar a getFrame(), porque quien lo importe solo recibe
// una "binding". Por eso proveemos getFrame() para uso simple.

export { fr, tickFrame, getFrame };
