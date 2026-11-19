// Lógica pura de la sopa de letras (sin React): se puede probar con Node.

// [fila, columna] de cada dirección
const DER = [0, 1];
const ABA = [1, 0];
const DIAG_ABA = [1, 1];
const DIAG_ARR = [-1, 1];
const IZQ = [0, -1];
const ARR = [-1, 0];
const DIAG_ARR_IZQ = [-1, -1];
const DIAG_ABA_IZQ = [1, -1];

export const DIFICULTADES = {
  facil: { nombre: 'Fácil', tam: 8, palabras: 6, direcciones: [DER, ABA] },
  medio: { nombre: 'Medio', tam: 11, palabras: 9, direcciones: [DER, ABA, DIAG_ABA, DIAG_ARR] },
  dificil: {
    nombre: 'Difícil',
    tam: 14,
    palabras: 12,
    direcciones: [DER, ABA, DIAG_ABA, DIAG_ARR, IZQ, ARR, DIAG_ARR_IZQ, DIAG_ABA_IZQ],
  },
};

export const ORDEN_DIFICULTADES = ['facil', 'medio', 'dificil'];

// Frecuencia aproximada de letras en español (para rellenar los huecos)
const FRECUENCIAS = {
  E: 12.5, A: 11.7, O: 8.7, S: 8, R: 6.9, N: 6.7, I: 6.2, D: 5.9, L: 5, C: 4.7, T: 4.6,
  U: 3.9, M: 3.2, P: 2.5, B: 1.4, G: 1, V: 0.9, Y: 0.9, Q: 0.9, H: 0.7, F: 0.7, Z: 0.5,
  J: 0.4, Ñ: 0.3, X: 0.2, K: 0.1, W: 0.1,
};
const LETRAS = Object.keys(FRECUENCIAS);
const PESO_TOTAL = LETRAS.reduce((s, l) => s + FRECUENCIAS[l], 0);

export const COLORES = [
  '#ffd54a', '#ff8fab', '#6fe3b5', '#7cc4ff', '#c3a0ff', '#ffab5e',
  '#9be15d', '#ff7a7a', '#5ee0e0', '#f7a8ff', '#e0b86b', '#a0b4ff',
];

/** Quita tildes y diéresis, pasa a mayúsculas y conserva la Ñ. */
export function normalizar(palabra) {
  return palabra
    .toUpperCase()
    .replace(/Ñ/g, '\u0000')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\u0000/g, 'Ñ')
    .replace(/[^A-ZÑ]/g, '');
}

function letraAlAzar(rng) {
  let r = rng() * PESO_TOTAL;
  for (const l of LETRAS) {
    r -= FRECUENCIAS[l];
    if (r <= 0) return l;
  }
  return 'E';
}

function barajar(lista, rng) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Elige `cantidad` palabras distintas que quepan en la cuadrícula. */
export function elegirPalabras(lista, cantidad, tam, rng = Math.random) {
  const vistas = new Set();
  const candidatas = [];
  for (const texto of barajar(lista, rng)) {
    const norm = normalizar(texto);
    if (norm.length < 3 || norm.length > tam || vistas.has(norm)) continue;
    vistas.add(norm);
    candidatas.push({ texto, norm });
  }
  return candidatas.slice(0, cantidad);
}

function cabe(grilla, tam, norm, fila, col, [df, dc]) {
  for (let i = 0; i < norm.length; i++) {
    const f = fila + df * i;
    const c = col + dc * i;
    if (f < 0 || f >= tam || c < 0 || c >= tam) return false;
    const actual = grilla[f][c];
    if (actual && actual !== norm[i]) return false;
  }
  return true;
}

/** Busca un lugar para la palabra probando todas las posiciones en orden aleatorio. */
function colocar(grilla, tam, norm, direcciones, rng) {
  const opciones = [];
  for (const dir of direcciones) {
    for (let f = 0; f < tam; f++) {
      for (let c = 0; c < tam; c++) opciones.push([f, c, dir]);
    }
  }
  for (const [f, c, dir] of barajar(opciones, rng)) {
    if (cabe(grilla, tam, norm, f, c, dir)) return { fila: f, col: c, df: dir[0], dc: dir[1] };
  }
  return null;
}

/**
 * Genera una sopa de letras.
 * Devuelve { tam, grilla (matriz de letras), palabras: [{ id, texto, norm, fila, col, df, dc }] }
 */
export function generarSopa(listaPalabras, idDificultad, rng = Math.random) {
  const dif = DIFICULTADES[idDificultad];
  const { tam, direcciones } = dif;

  for (let intento = 0; intento < 200; intento++) {
    const elegidas = elegirPalabras(listaPalabras, dif.palabras, tam, rng)
      // las largas primero: es más fácil acomodar las cortas después
      .sort((a, b) => b.norm.length - a.norm.length);
    const grilla = Array.from({ length: tam }, () => Array(tam).fill(null));
    const palabras = [];
    let ok = true;

    for (const p of elegidas) {
      const lugar = colocar(grilla, tam, p.norm, direcciones, rng);
      if (!lugar) {
        ok = false;
        break;
      }
      for (let i = 0; i < p.norm.length; i++) {
        grilla[lugar.fila + lugar.df * i][lugar.col + lugar.dc * i] = p.norm[i];
      }
      palabras.push({ ...p, ...lugar });
    }

    if (!ok) continue;

    for (let f = 0; f < tam; f++) {
      for (let c = 0; c < tam; c++) if (!grilla[f][c]) grilla[f][c] = letraAlAzar(rng);
    }

    // Orden alfabético para la lista de la hoja
    palabras.sort((a, b) => a.norm.localeCompare(b.norm, 'es'));
    palabras.forEach((p, i) => (p.id = i));
    return { tam, grilla, palabras };
  }
  throw new Error('No se pudo generar la sopa de letras');
}

/** Celdas en línea recta entre a y b (horizontal, vertical o diagonal). null si no están alineadas. */
export function lineaEntre(a, b) {
  const df = b.fila - a.fila;
  const dc = b.col - a.col;
  if (df !== 0 && dc !== 0 && Math.abs(df) !== Math.abs(dc)) return null;
  const pasos = Math.max(Math.abs(df), Math.abs(dc));
  const sf = Math.sign(df);
  const sc = Math.sign(dc);
  return Array.from({ length: pasos + 1 }, (_, i) => ({ fila: a.fila + sf * i, col: a.col + sc * i }));
}

/**
 * Ajusta el punto final para que la línea quede en una de las 8 direcciones
 * (la más cercana al ángulo del arrastre) y dentro de la cuadrícula.
 */
export function ajustarFin(inicio, punto, tam) {
  const df = punto.fila - inicio.fila;
  const dc = punto.col - inicio.col;
  if (df === 0 && dc === 0) return { ...inicio };
  const angulo = Math.atan2(df, dc);
  const octante = Math.round(angulo / (Math.PI / 4));
  const sf = Math.round(Math.sin((octante * Math.PI) / 4));
  const sc = Math.round(Math.cos((octante * Math.PI) / 4));
  let largo = Math.max(Math.abs(df), Math.abs(dc));
  // no salirse del borde
  while (largo > 0) {
    const f = inicio.fila + sf * largo;
    const c = inicio.col + sc * largo;
    if (f >= 0 && f < tam && c >= 0 && c < tam) break;
    largo--;
  }
  return { fila: inicio.fila + sf * largo, col: inicio.col + sc * largo };
}

/** Texto que forman las celdas seleccionadas. */
export function textoDe(grilla, celdas) {
  return celdas.map(({ fila, col }) => grilla[fila][col]).join('');
}

/**
 * Revisa si la selección (de inicio a fin) es una palabra que falta por encontrar.
 * Acepta la palabra leída al derecho o al revés. Devuelve la palabra o null.
 */
export function verificarSeleccion(sopa, encontradas, inicio, fin) {
  const celdas = lineaEntre(inicio, fin);
  if (!celdas || celdas.length < 2) return null;
  const texto = textoDe(sopa.grilla, celdas);
  const reves = [...texto].reverse().join('');
  return (
    sopa.palabras.find((p) => !encontradas.has(p.id) && (p.norm === texto || p.norm === reves)) ?? null
  );
}

/** Celda inicial y final de una palabra colocada. */
export function extremos(p) {
  return {
    inicio: { fila: p.fila, col: p.col },
    fin: { fila: p.fila + p.df * (p.norm.length - 1), col: p.col + p.dc * (p.norm.length - 1) },
  };
}

export function formatoTiempo(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** Estrellas según las pistas usadas. */
export function estrellasPorPistas(pistas) {
  if (pistas === 0) return 3;
  if (pistas <= 2) return 2;
  return 1;
}
