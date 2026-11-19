// Efectos de sonido sintetizados con Web Audio (no necesita archivos de audio)

let contexto = null;
let silencio = false;

export function ponerSilencio(valor) {
  silencio = valor;
}

function audio() {
  if (silencio) return null;
  try {
    if (!contexto) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      contexto = new AC();
    }
    if (contexto.state === 'suspended') contexto.resume();
    return contexto;
  } catch {
    return null;
  }
}

function tono(frecuencia, duracion, { tipo = 'sine', volumen = 0.12, retraso = 0, hasta } = {}) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + retraso;
  const osc = c.createOscillator();
  const gan = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frecuencia, t);
  if (hasta) osc.frequency.exponentialRampToValueAtTime(hasta, t + duracion);
  gan.gain.setValueAtTime(0.0001, t);
  gan.gain.exponentialRampToValueAtTime(volumen, t + 0.012);
  gan.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
  osc.connect(gan).connect(c.destination);
  osc.start(t);
  osc.stop(t + duracion + 0.05);
}

// "Fsst" de una carta al voltearse: ruido filtrado muy corto
function roce(volumen = 0.25) {
  const c = audio();
  if (!c) return;
  const dur = 0.09;
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < datos.length; i++) {
    datos[i] = (Math.random() * 2 - 1) * (1 - i / datos.length);
  }
  const fuente = c.createBufferSource();
  fuente.buffer = buffer;
  const filtro = c.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.frequency.value = 2600;
  filtro.Q.value = 0.8;
  const gan = c.createGain();
  gan.gain.value = volumen;
  fuente.connect(filtro).connect(gan).connect(c.destination);
  fuente.start();
}

export const sonidos = {
  voltear: () => roce(),
  pareja: () => {
    tono(660, 0.14, { tipo: 'triangle', volumen: 0.14 });
    tono(990, 0.22, { tipo: 'triangle', volumen: 0.12, retraso: 0.09 });
  },
  fallo: () => tono(240, 0.28, { tipo: 'sawtooth', volumen: 0.04, hasta: 150 }),
  racha: () => tono(1320, 0.18, { tipo: 'sine', volumen: 0.08, retraso: 0.18 }),
  victoria: () =>
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      tono(f, 0.32, { tipo: 'triangle', volumen: 0.12, retraso: i * 0.11 })
    ),
};
