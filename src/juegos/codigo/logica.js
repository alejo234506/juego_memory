// Código secreto: reglas como funciones puras (sin React), para poder probarlas.
// Un código es un arreglo de índices de símbolo (0..colores-1).

export const NIVELES = {
  facil: { nombre: 'Fácil', huecos: 4, colores: 6, intentos: 10, repetir: false },
  medio: { nombre: 'Medio', huecos: 4, colores: 6, intentos: 10, repetir: true },
  dificil: { nombre: 'Difícil', huecos: 5, colores: 8, intentos: 10, repetir: true },
  genio: { nombre: 'Genio', huecos: 6, colores: 8, intentos: 8, repetir: true },
};

export const ORDEN_NIVELES = ['facil', 'medio', 'dificil', 'genio'];

// Gemas: color + forma distinta (se distinguen aunque no se vean bien los colores)
export const GEMAS = [
  { nombre: 'Rubí', color: '#e53950', forma: '●' },
  { nombre: 'Ámbar', color: '#f59e2a', forma: '▲' },
  { nombre: 'Citrino', color: '#f2d03b', forma: '■' },
  { nombre: 'Esmeralda', color: '#2fbf71', forma: '◆' },
  { nombre: 'Zafiro', color: '#3a7bea', forma: '★' },
  { nombre: 'Amatista', color: '#9b5de5', forma: '♥' },
  { nombre: 'Perla', color: '#f2efe6', forma: '✚' },
  { nombre: 'Ónix', color: '#3b3b46', forma: '⬟' },
];

export const VARIANTES = {
  gemas: { nombre: 'Gemas', icono: '💎' },
  numeros: { nombre: 'Números', icono: '🔢' },
};

/** Reglas efectivas: en "Números" se usan los dígitos 0–9. */
export function reglas(idNivel, variante = 'gemas') {
  const base = NIVELES[idNivel];
  return { ...base, colores: variante === 'numeros' ? 10 : base.colores, variante };
}

// ================== Azar ==================
export function crearAzar(semilla) {
  if (semilla === undefined) return Math.random;
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generarCodigo(r, azar = Math.random) {
  const codigo = [];
  while (codigo.length < r.huecos) {
    const s = Math.floor(azar() * r.colores);
    if (!r.repetir && codigo.includes(s)) continue;
    codigo.push(s);
  }
  return codigo;
}

// ================== Pistas de cada intento ==================
/**
 * negras  = símbolo correcto en el lugar correcto (●)
 * blancas = símbolo correcto pero en otro lugar   (○)
 * Con repetidos, cada símbolo del código se cuenta una sola vez.
 */
export function evaluar(intento, codigo) {
  let negras = 0;
  const restoCodigo = {};
  const restoIntento = {};
  for (let i = 0; i < codigo.length; i++) {
    if (intento[i] === codigo[i]) negras++;
    else {
      restoCodigo[codigo[i]] = (restoCodigo[codigo[i]] ?? 0) + 1;
      restoIntento[intento[i]] = (restoIntento[intento[i]] ?? 0) + 1;
    }
  }
  let blancas = 0;
  for (const s in restoIntento) blancas += Math.min(restoIntento[s], restoCodigo[s] ?? 0);
  return { negras, blancas };
}

export const esValido = (intento, r) =>
  intento.length === r.huecos &&
  intento.every((s) => Number.isInteger(s) && s >= 0 && s < r.colores) &&
  (r.repetir || new Set(intento).size === intento.length);

export const totalCodigos = (r) => {
  if (r.repetir) return r.colores ** r.huecos;
  let t = 1;
  for (let k = 0; k < r.huecos; k++) t *= r.colores - k;
  return t;
};

/**
 * Cuántos códigos siguen siendo posibles con lo que ya se sabe.
 * Recorre todo el espacio (máx. 10^6 en "Números · Genio"), cortando apenas un intento lo descarta.
 * Si pasa de `tope`, devuelve { cantidad: tope, mas: true }.
 */
export function contarPosibles(r, historial, { tope = Infinity, ejemplo = false } = {}) {
  const { huecos, colores } = r;
  const codigo = new Int8Array(huecos);
  const cuentaA = new Int8Array(colores);
  const cuentaB = new Int8Array(colores);
  const usados = new Int8Array(colores);
  const intentos = historial.map((h) => Int8Array.from(h.intento));
  let cantidad = 0;
  let primero = null;
  const total = colores ** huecos;

  // Misma regla que evaluar(), pero sin crear objetos (mucho más rápido)
  const coincide = (intento, negrasEsperadas, blancasEsperadas) => {
    cuentaA.fill(0);
    cuentaB.fill(0);
    let negras = 0;
    for (let i = 0; i < huecos; i++) {
      if (intento[i] === codigo[i]) negras++;
      else {
        cuentaA[codigo[i]]++;
        cuentaB[intento[i]]++;
      }
    }
    if (negras !== negrasEsperadas) return false;
    let blancas = 0;
    for (let s = 0; s < colores; s++) blancas += cuentaA[s] < cuentaB[s] ? cuentaA[s] : cuentaB[s];
    return blancas === blancasEsperadas;
  };

  for (let n = 0; n < total; n++) {
    let x = n;
    for (let i = huecos - 1; i >= 0; i--) {
      codigo[i] = x % colores;
      x = (x - codigo[i]) / colores;
    }
    if (!r.repetir) {
      usados.fill(0);
      let repetido = false;
      for (let i = 0; i < huecos; i++) {
        if (usados[codigo[i]]) {
          repetido = true;
          break;
        }
        usados[codigo[i]] = 1;
      }
      if (repetido) continue;
    }
    let sirve = true;
    for (let h = 0; h < intentos.length; h++) {
      if (!coincide(intentos[h], historial[h].negras, historial[h].blancas)) {
        sirve = false;
        break;
      }
    }
    if (!sirve) continue;
    cantidad++;
    if (ejemplo && !primero) primero = Array.from(codigo);
    if (cantidad > tope) return { cantidad: tope, mas: true, ejemplo: primero };
  }
  return { cantidad, mas: false, ejemplo: primero };
}

export const gano = (e, r) => e.negras === r.huecos;

// ================== Estadísticas ==================
export function actualizarEstadisticas(est = {}, ganada, intentos) {
  const jugadas = (est.jugadas ?? 0) + 1;
  const ganadas = (est.ganadas ?? 0) + (ganada ? 1 : 0);
  const racha = ganada ? (est.racha ?? 0) + 1 : 0;
  const mejorRacha = Math.max(est.mejorRacha ?? 0, racha);
  const sumaIntentos = (est.sumaIntentos ?? 0) + (ganada ? intentos : 0);
  const mejor = ganada ? Math.min(est.mejor ?? Infinity, intentos) : est.mejor ?? null;
  return { jugadas, ganadas, racha, mejorRacha, sumaIntentos, mejor };
}

export const promedio = (est) => (est?.ganadas ? est.sumaIntentos / est.ganadas : null);

export function calcularEstrellas(intentosUsados, r) {
  const ratio = intentosUsados / r.intentos;
  if (ratio <= 0.5) return 3;
  if (ratio <= 0.8) return 2;
  return 1;
}
