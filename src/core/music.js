// Motor de música procedural con osciladores.
// Depende de la instancia `sfx` de audio.js.

import { sfx } from './audio.js';


let musicInterval = null;
let currentSong = null;

const SONGS = {
  world: [
    { f: 262, d: 0.2 },
    { f: 330, d: 0.2 },
    { f: 392, d: 0.2 },
    { f: 330, d: 0.2 },
    { f: 294, d: 0.2 },
    { f: 349, d: 0.2 },
    { f: 262, d: 0.4 },
    { f: 262, d: 0.2 },
    { f: 392, d: 0.2 },
    { f: 349, d: 0.2 },
    { f: 330, d: 0.2 },
    { f: 294, d: 0.2 },
    { f: 262, d: 0.4 },
    { f: 0, d: 0.4 },
  ],
  battle: [
    { f: 330, d: 0.15 },
    { f: 392, d: 0.15 },
    { f: 440, d: 0.15 },
    { f: 392, d: 0.15 },
    { f: 330, d: 0.15 },
    { f: 294, d: 0.15 },
    { f: 330, d: 0.3 },
    { f: 440, d: 0.15 },
    { f: 523, d: 0.15 },
    { f: 440, d: 0.15 },
    { f: 392, d: 0.15 },
    { f: 330, d: 0.15 },
    { f: 294, d: 0.3 },
    { f: 0, d: 0.3 },
  ],
  cave: [
    { f: 196, d: 0.3 },
    { f: 220, d: 0.3 },
    { f: 196, d: 0.3 },
    { f: 165, d: 0.3 },
    { f: 196, d: 0.3 },
    { f: 220, d: 0.2 },
    { f: 262, d: 0.2 },
    { f: 220, d: 0.4 },
    { f: 0, d: 0.4 },
  ],
  castle: [
    { f: 262, d: 0.3 },
    { f: 294, d: 0.3 },
    { f: 330, d: 0.3 },
    { f: 392, d: 0.3 },
    { f: 349, d: 0.3 },
    { f: 330, d: 0.3 },
    { f: 294, d: 0.6 },
    { f: 0, d: 0.3 },
  ],
  tower: [
    { f: 523, d: 0.3 },
    { f: 659, d: 0.3 },
    { f: 784, d: 0.3 },
    { f: 659, d: 0.3 },
    { f: 523, d: 0.3 },
    { f: 440, d: 0.3 },
    { f: 523, d: 0.6 },
    { f: 659, d: 0.2 },
    { f: 784, d: 0.2 },
    { f: 880, d: 0.4 },
    { f: 0, d: 0.4 },
  ],
  title: [
    { f: 392, d: 0.3 },
    { f: 440, d: 0.3 },
    { f: 523, d: 0.3 },
    { f: 440, d: 0.3 },
    { f: 392, d: 0.3 },
    { f: 330, d: 0.3 },
    { f: 392, d: 0.6 },
    { f: 0, d: 0.6 },
  ],
};

function playMusic(songName) {
  if (currentSong === songName) return;
  stopMusic();
  currentSong = songName;
  const song = SONGS[songName];
  if (!song || !sfx.c) return;

  let noteIdx = 0;
  let noteTime = 0;

  musicInterval = setInterval(() => {
    if (!sfx.c || !sfx.on) return;
    noteTime -= 50;
    if (noteTime <= 0) {
      const note = song[noteIdx % song.length];
      if (note.f > 0) {
        sfx.n(note.f, note.d, 'triangle', 0.03);
      }
      noteTime = note.d * 1000;
      noteIdx++;
    }
  }, 50);
}

function stopMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  currentSong = null;
}

export { SONGS, playMusic, stopMusic };
