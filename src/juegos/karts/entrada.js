// Controles: teclado compartido por dos personas, mandos (Gamepad API) y botones táctiles.

// e.code no depende del idioma del teclado: en un teclado en español 'Slash' es la tecla "-"
export const CONTROLES = {
  0: {
    acel: ['KeyW'],
    freno: ['KeyS'],
    izq: ['KeyA'],
    der: ['KeyD'],
    derrape: ['ShiftLeft', 'Space'],
    objeto: ['KeyQ', 'KeyE'],
    texto: { mover: 'W A S D', derrape: 'Shift izq. o Espacio', objeto: 'Q o E' },
  },
  1: {
    acel: ['ArrowUp'],
    freno: ['ArrowDown'],
    izq: ['ArrowLeft'],
    der: ['ArrowRight'],
    derrape: ['ShiftRight', 'Slash', 'ControlRight'],
    objeto: ['Period', 'Enter', 'NumpadEnter', 'Numpad0'],
    texto: { mover: 'Flechas', derrape: 'Shift der. o -', objeto: '. o Enter' },
  },
};

export const TECLAS_JUEGO = new Set(
  Object.values(CONTROLES).flatMap((c) => [...c.acel, ...c.freno, ...c.izq, ...c.der, ...c.derrape, ...c.objeto])
);

export function crearEntradas() {
  return {
    teclas: new Set(),
    tactil: { acel: false, freno: false, izq: false, der: false, derrape: false, objeto: false },
    previoObjeto: [false, false],
  };
}

const alguna = (teclas, lista) => lista.some((t) => teclas.has(t));

function leerMando(pad) {
  if (!pad) return null;
  const b = (i) => {
    const x = pad.buttons[i];
    return x ? (typeof x === 'object' ? (x.pressed ? Math.max(x.value, 1) : x.value) : x) : 0;
  };
  let giro = pad.axes[0] ?? 0;
  if (Math.abs(giro) < 0.2) giro = 0;
  if (b(14)) giro = -1;
  if (b(15)) giro = 1;
  return {
    acel: Math.max(b(0) ? 1 : 0, b(7)),
    freno: Math.max(b(1) ? 1 : 0, b(6)),
    giro,
    derrape: b(5) > 0.5 || b(4) > 0.5,
    objeto: b(2) > 0.5 || b(3) > 0.5,
    pausa: b(9) > 0.5,
  };
}

// Construye las entradas de cada jugador para este cuadro
export function leerEntradas(estado, jugadores) {
  const { teclas, tactil } = estado;
  const pads = (navigator.getGamepads?.() ?? []).filter(Boolean);
  const salida = {};
  let pausaMando = false;
  for (let j = 0; j < jugadores; j++) {
    // Con un solo jugador sirven las dos manos del teclado
    const mapas = jugadores === 1 ? [CONTROLES[0], CONTROLES[1]] : [CONTROLES[j]];
    const tecla = (accion) => mapas.some((m) => alguna(teclas, m[accion]));
    const e = {
      acel: tecla('acel') ? 1 : 0,
      freno: tecla('freno') ? 1 : 0,
      giro: (tecla('der') ? 1 : 0) - (tecla('izq') ? 1 : 0),
      derrape: tecla('derrape'),
      objeto: tecla('objeto'),
    };
    if (j === 0 && jugadores === 1) {
      if (tactil.acel) e.acel = 1;
      if (tactil.freno) e.freno = 1;
      if (tactil.izq) e.giro = -1;
      if (tactil.der) e.giro = 1;
      if (tactil.derrape) e.derrape = true;
      if (tactil.objeto) e.objeto = true;
    }
    const mando = leerMando(jugadores === 1 ? pads[0] : pads[j]);
    if (mando) {
      e.acel = Math.max(e.acel, mando.acel);
      e.freno = Math.max(e.freno, mando.freno);
      if (mando.giro) e.giro = mando.giro;
      e.derrape = e.derrape || mando.derrape;
      e.objeto = e.objeto || mando.objeto;
      pausaMando = pausaMando || mando.pausa;
    }
    // El objeto se usa al presionar, no mientras se mantiene
    const presionado = e.objeto;
    e.objeto = presionado && !estado.previoObjeto[j];
    estado.previoObjeto[j] = presionado;
    salida[j] = e;
  }
  return { entradas: salida, pausaMando, mandos: pads.length };
}
