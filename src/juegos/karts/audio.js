// Sonido de Turbo Karts: motores y efectos sintetizados con Web Audio.
// Respeta el botón de silencio de la sala (se guarda en 'sala-prefs').
import { leer } from '../../logica/almacen.js';

let ctx = null;
let maestro = null;
let silencio = false;
const motores = [];

function contexto() {
  if (silencio) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      maestro = ctx.createGain();
      maestro.gain.value = 0.9;
      maestro.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function revisarSilencio() {
  const nuevo = !!leer('sala-prefs', {}).silencio;
  if (nuevo !== silencio) {
    silencio = nuevo;
    if (maestro) maestro.gain.value = silencio ? 0 : 0.9;
  }
  return silencio;
}

function tono(frec, dur, { tipo = 'square', vol = 0.08, hasta, retraso = 0 } = {}) {
  const c = contexto();
  if (!c) return;
  const t = c.currentTime + retraso;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(frec, t);
  if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(maestro);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function ruido(dur, { vol = 0.15, frec = 900, q = 0.7, tipo = 'bandpass' } = {}) {
  const c = contexto();
  if (!c) return;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const f = c.createBufferSource();
  f.buffer = buf;
  const filtro = c.createBiquadFilter();
  filtro.type = tipo;
  filtro.frequency.value = frec;
  filtro.Q.value = q;
  const g = c.createGain();
  g.gain.value = vol;
  f.connect(filtro).connect(g).connect(maestro);
  f.start();
}

export const efectos = {
  cuenta: () => tono(440, 0.25, { tipo: 'square', vol: 0.07 }),
  ya: () => tono(880, 0.5, { tipo: 'square', vol: 0.08 }),
  turbo: () => {
    ruido(0.5, { vol: 0.18, frec: 600, q: 0.5 });
    tono(220, 0.45, { tipo: 'sawtooth', vol: 0.04, hasta: 660 });
  },
  miniturbo: (nivel) => tono(500 + nivel * 180, 0.25, { tipo: 'triangle', vol: 0.08, hasta: 1200 + nivel * 200 }),
  choque: () => ruido(0.18, { vol: 0.3, frec: 180, q: 0.6, tipo: 'lowpass' }),
  toque: () => ruido(0.08, { vol: 0.15, frec: 400, q: 1 }),
  caja: () => [880, 1175, 1568].forEach((f, i) => tono(f, 0.1, { tipo: 'triangle', vol: 0.07, retraso: i * 0.05 })),
  usar: () => tono(660, 0.18, { tipo: 'triangle', vol: 0.08, hasta: 990 }),
  trompo: () => tono(700, 0.7, { tipo: 'sawtooth', vol: 0.05, hasta: 120 }),
  tinta: () => ruido(0.35, { vol: 0.2, frec: 300, q: 2 }),
  escudo: () => tono(1200, 0.3, { tipo: 'sine', vol: 0.08, hasta: 400 }),
  vuelta: () => [660, 880].forEach((f, i) => tono(f, 0.15, { tipo: 'square', vol: 0.06, retraso: i * 0.12 })),
  meta: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, 0.3, { tipo: 'triangle', vol: 0.1, retraso: i * 0.1 })),
};

// Un motor por jugador humano: zumbido que sube con la velocidad
export function iniciarMotores(cantidad) {
  detenerMotores();
  const c = contexto();
  if (!c) return;
  for (let i = 0; i < cantidad; i++) {
    const o = c.createOscillator();
    const o2 = c.createOscillator();
    const filtro = c.createBiquadFilter();
    const g = c.createGain();
    o.type = 'sawtooth';
    o2.type = 'square';
    o2.detune.value = 7;
    filtro.type = 'lowpass';
    filtro.frequency.value = 700;
    g.gain.value = 0;
    o.connect(filtro);
    o2.connect(filtro);
    filtro.connect(g).connect(maestro);
    o.start();
    o2.start();
    motores.push({ o, o2, filtro, g });
  }
}

export function actualizarMotor(i, velocidad, activo) {
  const m = motores[i];
  if (!m || !ctx) return;
  const v = Math.max(0, velocidad);
  const t = ctx.currentTime;
  m.o.frequency.setTargetAtTime(48 + v * 0.17, t, 0.05);
  m.o2.frequency.setTargetAtTime(24 + v * 0.085, t, 0.05);
  m.filtro.frequency.setTargetAtTime(400 + v * 1.6, t, 0.05);
  m.g.gain.setTargetAtTime(activo ? 0.022 + Math.min(0.02, v / 30000) : 0, t, 0.08);
}

export function detenerMotores() {
  motores.splice(0).forEach((m) => {
    try {
      m.g.gain.value = 0;
      m.o.stop();
      m.o2.stop();
    } catch {
      /* ya detenido */
    }
  });
}
