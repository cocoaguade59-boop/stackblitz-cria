// Canvas 2D y su contexto. Todo el render depende de estos dos exports.
// Sin dependencias externas.

const cv = document.getElementById('c'),
  cx = cv.getContext('2d');

export { cv, cx };
