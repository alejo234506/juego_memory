// Pistas de Turbo Karts: cada una es una curva cerrada (Catmull-Rom) con su ancho y tema.
// Todo es lógica pura (sin DOM) para poder probarla en Node.

export const MARGEN_PASTO = 60; // franja fuera del asfalto antes del muro
export const PASO_MUESTRA = 10; // distancia aproximada entre muestras de la línea central
export const SECTORES = 12; // puntos de control por vuelta
export const ESCALA = 1.4; // tamaño del circuito respecto a los puntos de control

export const PISTAS_DATOS = [
  {
    id: 'playa',
    nombre: 'Playa Coralina',
    icono: '🏝️',
    dificultad: 'Fácil',
    ancho: 190,
    agarre: 1,
    tema: {
      fondo: '#e9cf8f', fondo2: '#dcbb72', fuera: '#f3dfa6', asfalto: '#5d5f66',
      borde1: '#ffffff', borde2: '#2fb7c4', muro: '#2b7a8c', linea: '#ffffff',
      deco: 'palmera', cielo: '#7fd6e6',
    },
    puntos: [
      [400, 820], [640, 380], [1150, 230], [1700, 260], [2150, 520], [2250, 900],
      [1950, 1230], [1450, 1180], [1150, 1400], [650, 1380],
    ],
    turbos: [0.12, 0.47, 0.8],
    cajas: [0.3, 0.63, 0.92],
  },
  {
    id: 'ciudad',
    nombre: 'Avenida Neón',
    icono: '🌃',
    dificultad: 'Media',
    ancho: 165,
    agarre: 1,
    tema: {
      fondo: '#1b1d2e', fondo2: '#24273d', fuera: '#2e3147', asfalto: '#3b3d4a',
      borde1: '#ff3fa4', borde2: '#24e1ff', muro: '#8a5cff', linea: '#fff36b',
      deco: 'edificio', cielo: '#0d0f1c',
    },
    puntos: [
      [320, 320], [1150, 260], [1480, 560], [2050, 300], [2380, 760], [2080, 1320],
      [1400, 1400], [1180, 1020], [760, 1120], [520, 1340], [270, 1170], [230, 820],
    ],
    turbos: [0.06, 0.36, 0.7],
    cajas: [0.2, 0.52, 0.85],
  },
  {
    id: 'nieve',
    nombre: 'Bosque Escarcha',
    icono: '🌲',
    dificultad: 'Media',
    ancho: 160,
    agarre: 0.72, // la nieve resbala
    tema: {
      fondo: '#e9f2f8', fondo2: '#d7e6f0', fuera: '#f7fbfe', asfalto: '#7b8a99',
      borde1: '#ffffff', borde2: '#d6424f', muro: '#6b8aa3', linea: '#ffffff',
      deco: 'pino', cielo: '#cfe3f1',
    },
    puntos: [
      [300, 760], [480, 300], [900, 230], [1000, 700], [1400, 700], [1580, 300], [2050, 260],
      [2380, 640], [2200, 960], [2300, 1290], [1750, 1500], [1250, 1150], [820, 1480], [380, 1280],
    ],
    turbos: [0.15, 0.5, 0.78],
    cajas: [0.27, 0.6, 0.9],
  },
  {
    id: 'volcan',
    nombre: 'Cráter Ardiente',
    icono: '🌋',
    dificultad: 'Difícil',
    ancho: 150,
    agarre: 1,
    tema: {
      fondo: '#2a1714', fondo2: '#3a1d17', fuera: '#ff6a1f', asfalto: '#4a4141',
      borde1: '#ffd24a', borde2: '#2a2222', muro: '#120c0b', linea: '#ffd24a',
      deco: 'roca', cielo: '#1a0d0b', lava: true,
    },
    puntos: [
      [380, 420], [1000, 290], [1330, 720], [1750, 300], [2300, 430], [2250, 1050],
      [1680, 1380], [1250, 1050], [820, 1450], [300, 1180],
    ],
    turbos: [0.1, 0.44, 0.74],
    cajas: [0.24, 0.57, 0.88],
  },
  {
    id: 'desierto',
    nombre: 'Dunas del Cóndor',
    icono: '🏜️',
    dificultad: 'Difícil',
    ancho: 170,
    agarre: 0.9,
    tema: {
      fondo: '#d99a52', fondo2: '#c98a45', fuera: '#e8b06a', asfalto: '#6b5a4c',
      borde1: '#fff2d6', borde2: '#b0462b', muro: '#7a4a24', linea: '#fff2d6',
      deco: 'cactus', cielo: '#f3c784',
    },
    puntos: [
      [460, 1400], [280, 1200], [300, 420], [820, 240], [1230, 640], [1720, 260], [2400, 400],
      [2420, 1220], [2220, 1380], [1880, 1180], [1340, 1480], [800, 1170],
    ],
    turbos: [0.05, 0.4, 0.66],
    cajas: [0.18, 0.5, 0.82],
  },
];

// ---------- Geometría ----------
function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a, b, c, d) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
}

// Convierte los puntos de control en muestras equiespaciadas con distancia acumulada
export function construirPista(datos) {
  const pts = datos.puntos.map(([x, y]) => [x * ESCALA, y * ESCALA]);
  const n = pts.length;
  const densa = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    for (let k = 0; k < 60; k++) densa.push(catmull(p0, p1, p2, p3, k / 60));
  }
  // Longitud total
  let total = 0;
  const acum = [0];
  for (let i = 1; i <= densa.length; i++) {
    const a = densa[i - 1];
    const b = densa[i % densa.length];
    total += Math.hypot(b[0] - a[0], b[1] - a[1]);
    acum.push(total);
  }
  // Re-muestreo equiespaciado
  const cantidad = Math.round(total / PASO_MUESTRA);
  const paso = total / cantidad;
  const xs = new Float64Array(cantidad);
  const ys = new Float64Array(cantidad);
  let j = 0;
  for (let i = 0; i < cantidad; i++) {
    const s = i * paso;
    while (acum[j + 1] < s) j++;
    const a = densa[j];
    const b = densa[(j + 1) % densa.length];
    const t = (s - acum[j]) / (acum[j + 1] - acum[j] || 1);
    xs[i] = a[0] + (b[0] - a[0]) * t;
    ys[i] = a[1] + (b[1] - a[1]) * t;
  }
  // Tangentes (dirección de carrera) y curvatura
  const tx = new Float64Array(cantidad);
  const ty = new Float64Array(cantidad);
  for (let i = 0; i < cantidad; i++) {
    const a = (i - 1 + cantidad) % cantidad;
    const b = (i + 1) % cantidad;
    const dx = xs[b] - xs[a];
    const dy = ys[b] - ys[a];
    const l = Math.hypot(dx, dy) || 1;
    tx[i] = dx / l;
    ty[i] = dy / l;
  }
  const curva = new Float64Array(cantidad);
  for (let i = 0; i < cantidad; i++) {
    const b = (i + 3) % cantidad;
    const a1 = Math.atan2(ty[i], tx[i]);
    const a2 = Math.atan2(ty[b], tx[b]);
    curva[i] = Math.abs(angDif(a2, a1)) / (3 * paso);
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < cantidad; i++) {
    minX = Math.min(minX, xs[i]); maxX = Math.max(maxX, xs[i]);
    minY = Math.min(minY, ys[i]); maxY = Math.max(maxY, ys[i]);
  }
  const extra = datos.ancho / 2 + MARGEN_PASTO + 260;
  return {
    ...datos,
    n: cantidad,
    paso,
    largo: total,
    xs, ys, tx, ty, curva,
    limites: { minX: minX - extra, minY: minY - extra, maxX: maxX + extra, maxY: maxY + extra },
    mitad: datos.ancho / 2,
    muro: datos.ancho / 2 + MARGEN_PASTO,
  };
}

export function angDif(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

// Punto más cercano de la línea central. Si se da una pista (indice previo) busca cerca.
export function puntoCercano(pista, x, y, previo = -1, ventana = 45) {
  let mejor = -1;
  let mejorD = Infinity;
  const revisar = (i) => {
    const dx = x - pista.xs[i];
    const dy = y - pista.ys[i];
    const d = dx * dx + dy * dy;
    if (d < mejorD) {
      mejorD = d;
      mejor = i;
    }
  };
  if (previo < 0) {
    for (let i = 0; i < pista.n; i++) revisar(i);
  } else {
    for (let k = -ventana; k <= ventana; k++) revisar((previo + k + pista.n) % pista.n);
  }
  const i = mejor;
  const dx = x - pista.xs[i];
  const dy = y - pista.ys[i];
  // distancia lateral con signo (positivo = a la derecha de la dirección de carrera)
  const lateral = dx * -pista.ty[i] + dy * pista.tx[i];
  return { indice: i, lateral, distancia: Math.sqrt(mejorD), s: i * pista.paso };
}

export function puntoEn(pista, s, lateral = 0) {
  const n = pista.n;
  const f = (((s / pista.paso) % n) + n) % n;
  const i = Math.floor(f);
  const t = f - i;
  const j = (i + 1) % n;
  const x = pista.xs[i] + (pista.xs[j] - pista.xs[i]) * t;
  const y = pista.ys[i] + (pista.ys[j] - pista.ys[i]) * t;
  const tx = pista.tx[i];
  const ty = pista.ty[i];
  return { x: x - ty * lateral, y: y + tx * lateral, angulo: Math.atan2(ty, tx), indice: i };
}

// Revisa que una pista sea jugable: cerrada, sin tramos que se crucen o se toquen
export function validarPista(pista) {
  const errores = [];
  const n = pista.n;
  // Cerrada: el último punto queda cerca del primero
  const cierre = Math.hypot(pista.xs[n - 1] - pista.xs[0], pista.ys[n - 1] - pista.ys[0]);
  if (cierre > pista.paso * 2) errores.push(`no cierra (${cierre.toFixed(1)})`);
  // Tramos alejados en el recorrido deben estar separados más que dos corredores
  const sep = pista.muro * 2 + 30;
  const salto = Math.ceil((pista.muro * 2 + 60) / pista.paso) * 2;
  let peor = Infinity;
  for (let i = 0; i < n; i += 2) {
    for (let j = i + salto; j < n; j += 2) {
      const vuelta = n - (j - i);
      if (vuelta < salto) continue;
      const d = Math.hypot(pista.xs[i] - pista.xs[j], pista.ys[i] - pista.ys[j]);
      if (d < peor) peor = d;
    }
  }
  if (peor < sep) errores.push(`tramos muy juntos (${peor.toFixed(0)} < ${sep.toFixed(0)})`);
  // Curvas no imposibles: radio mínimo mayor que medio ancho
  let maxCurva = 0;
  for (let i = 0; i < n; i++) maxCurva = Math.max(maxCurva, pista.curva[i]);
  if (1 / maxCurva < pista.mitad * 0.8) errores.push(`curva demasiado cerrada (radio ${(1 / maxCurva).toFixed(0)})`);
  if (pista.ancho < 120) errores.push('pista muy angosta');
  return { valida: errores.length === 0, errores, separacionMinima: peor, radioMinimo: 1 / maxCurva };
}

const cache = new Map();
export function obtenerPista(id) {
  if (!cache.has(id)) {
    const datos = PISTAS_DATOS.find((p) => p.id === id) ?? PISTAS_DATOS[0];
    cache.set(id, construirPista(datos));
  }
  return cache.get(id);
}
