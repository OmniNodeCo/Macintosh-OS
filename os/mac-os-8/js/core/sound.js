/* All sound is synthesised with the Web Audio API — no audio files, no samples.
   (The real Mac played its startup chime from a ROM routine; this is an
   approximation of the 1984 chord, not a sampled copy.) */

let ac = null;
let master = null;

export const audio = {
  enabled: true,
  bellVolume: 0.7,
  alarmVolume: 0.7,
};

function context() {
  if (!audio.enabled) return null;
  if (!ac) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ac = new Ctx();
    master = ac.createGain();
    master.gain.value = 0.5;
    master.connect(ac.destination);
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

export function unlockAudio() { context(); }

function tone({ freq = 880, dur = 0.12, type = 'square', vol = 0.25, delay = 0, glide = null, attack = 0.004 }) {
  const c = context();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.001, vol), t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise({ dur = 0.18, vol = 0.18, delay = 0, from = 2400, to = 200 }) {
  const c = context();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = 'bandpass';
  filt.Q.value = 1.1;
  filt.frequency.setValueAtTime(from, t0);
  filt.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(filt).connect(g).connect(master);
  src.start(t0);
}

/* ---- the sounds of a 1984 Mac -------------------------------------------- */

export function chime() {
  const c = context(); if (!c) return;
  // warm four-note chord that swells and decays, like the ROM startup sound
  const notes = [369.99, 466.16, 554.37, 739.99];
  notes.forEach((f, i) => {
    tone({ freq: f, dur: 2.2, type: 'sine', vol: 0.16, delay: i * 0.02, attack: 0.05 });
    tone({ freq: f / 2, dur: 2.4, type: 'triangle', vol: 0.07, delay: i * 0.02, attack: 0.08 });
  });
  tone({ freq: 110.0, dur: 2.6, type: 'sine', vol: 0.09, attack: 0.09 });
}

export function beep(vol = 0.22) {
  tone({ freq: 880, dur: 0.13, type: 'square', vol });
}

export function sosumi() {
  tone({ freq: 1567.98, dur: 0.09, type: 'square', vol: 0.14 });
  tone({ freq: 783.99, dur: 0.22, type: 'square', vol: 0.14, delay: 0.1 });
}

export function click() {
  tone({ freq: 2000, dur: 0.014, type: 'square', vol: 0.06 });
}

export function keyClick() {
  tone({ freq: 1400 + Math.random() * 300, dur: 0.01, type: 'square', vol: 0.045 });
}

export function alarm() {
  const v = 0.3 * audio.alarmVolume;
  for (let i = 0; i < 4; i++) {
    tone({ freq: 1046.5, dur: 0.09, type: 'square', vol: v, delay: i * 0.16 });
    tone({ freq: 1318.5, dur: 0.09, type: 'square', vol: v, delay: i * 0.16 + 0.08 });
  }
}

export function diskInsert() {
  noise({ dur: 0.34, vol: 0.16, from: 900, to: 260 });
  tone({ freq: 180, dur: 0.1, type: 'square', vol: 0.1, delay: 0.03 });
}

export function diskEject() {
  noise({ dur: 0.28, vol: 0.15, from: 300, to: 1800 });
  tone({ freq: 220, dur: 0.22, type: 'square', vol: 0.1, glide: 660 });
}

export function bootSad() {
  tone({ freq: 110, dur: 0.5, type: 'square', vol: 0.2 });
  tone({ freq: 98, dur: 0.9, type: 'square', vol: 0.2, delay: 0.45 });
}

export function shutdownSound() {
  tone({ freq: 660, dur: 0.5, type: 'triangle', vol: 0.16, glide: 110 });
  noise({ dur: 0.5, vol: 0.05, from: 1200, to: 120 });
}
