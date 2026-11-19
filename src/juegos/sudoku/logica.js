// Reglas del Sudoku como funciones puras (sin React), para poder probarlas.
// El tablero es un arreglo de n*n números: 0 = vacío, 1..n = valor.

// logica: 'simple'   = se resuelve solo con "únicos" (desnudos y ocultos)
//         'avanzada' = NO basta con únicos: hay que razonar más
//         null       = cualquiera
export const NIVELES = {
  mini: { nombre: 'Mini', n: 6, filasCaja: 2, colsCaja: 3, pistas: 16, detalle: '6×6', logica: 'simple' },
  facil: { nombre: 'Fácil', n: 9, filasCaja: 3, colsCaja: 3, pistas: 40, detalle: '9×9', logica: 'simple' },
  medio: { nombre: 'Medio', n: 9, filasCaja: 3, colsCaja: 3, pistas: 32, detalle: '9×9', logica: 'simple' },
  dificil: { nombre: 'Difícil', n: 9, filasCaja: 3, colsCaja: 3, pistas: 27, detalle: '9×9', logica: null },
  experto: { nombre: 'Experto', n: 9, filasCaja: 3, colsCaja: 3, pistas: 24, detalle: '9×9', logica: 'avanzada' },
};

export const ORDEN_NIVELES = ['mini', 'facil', 'medio', 'dificil', 'experto'];

// ================== Azar (con semilla opcional para las pruebas) ==================
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

function barajar(lista, azar) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ================== Geometría ==================
export const fila = (i, n) => Math.floor(i / n);
export const columna = (i, n) => i % n;
export function caja(i, nivel) {
  const { n, filasCaja, colsCaja } = nivel;
  const f = fila(i, n);
  const c = columna(i, n);
  return Math.floor(f / filasCaja) * (n / colsCaja) + Math.floor(c / colsCaja);
}

// Vecinos (misma fila, columna o caja), calculados una vez por tamaño
const cacheVecinos = new Map();
export function vecinos(nivel) {
  const clave = `${nivel.n}-${nivel.filasCaja}-${nivel.colsCaja}`;
  if (cacheVecinos.has(clave)) return cacheVecinos.get(clave);
  const { n } = nivel;
  const lista = [];
  for (let i = 0; i < n * n; i++) {
    const v = [];
    for (let j = 0; j < n * n; j++) {
      if (i === j) continue;
      if (fila(i, n) === fila(j, n) || columna(i, n) === columna(j, n) || caja(i, nivel) === caja(j, nivel)) v.push(j);
    }
    lista.push(v);
  }
  cacheVecinos.set(clave, lista);
  return lista;
}

// ================== Resolver con máscaras de bits ==================
function mascaras(tablero, nivel) {
  const { n } = nivel;
  const filas = new Array(n).fill(0);
  const cols = new Array(n).fill(0);
  const cajas = new Array(n).fill(0);
  for (let i = 0; i < n * n; i++) {
    const v = tablero[i];
    if (!v) continue;
    const bit = 1 << v;
    const f = fila(i, n);
    const c = columna(i, n);
    const b = caja(i, nivel);
    if (filas[f] & bit || cols[c] & bit || cajas[b] & bit) return null; // tablero inválido
    filas[f] |= bit;
    cols[c] |= bit;
    cajas[b] |= bit;
  }
  return { filas, cols, cajas };
}

const contarBits = (x) => {
  let c = 0;
  while (x) {
    x &= x - 1;
    c++;
  }
  return c;
};

/**
 * Cuenta soluciones hasta `limite` (por defecto 2: basta para saber si es única).
 * Usa la celda con menos candidatos primero, así es muy rápido.
 */
export function contarSoluciones(tableroOriginal, nivel, limite = 2) {
  const { n } = nivel;
  const tablero = [...tableroOriginal];
  const m = mascaras(tablero, nivel);
  if (!m) return 0;
  const { filas, cols, cajas } = m;
  const todos = ((1 << (n + 1)) - 1) & ~1; // bits 1..n
  const cajaDe = Array.from({ length: n * n }, (_, i) => caja(i, nivel));
  let total = 0;

  const buscar = () => {
    let mejor = -1;
    let mejorMask = 0;
    let mejorCuenta = 99;
    for (let i = 0; i < n * n; i++) {
      if (tablero[i]) continue;
      const mask = todos & ~(filas[fila(i, n)] | cols[columna(i, n)] | cajas[cajaDe[i]]);
      const cuenta = contarBits(mask);
      if (cuenta === 0) return;
      if (cuenta < mejorCuenta) {
        mejor = i;
        mejorMask = mask;
        mejorCuenta = cuenta;
        if (cuenta === 1) break;
      }
    }
    if (mejor === -1) {
      total++;
      return;
    }
    const f = fila(mejor, n);
    const c = columna(mejor, n);
    const b = cajaDe[mejor];
    for (let v = 1; v <= n; v++) {
      const bit = 1 << v;
      if (!(mejorMask & bit)) continue;
      tablero[mejor] = v;
      filas[f] |= bit;
      cols[c] |= bit;
      cajas[b] |= bit;
      buscar();
      filas[f] &= ~bit;
      cols[c] &= ~bit;
      cajas[b] &= ~bit;
      tablero[mejor] = 0;
      if (total >= limite) return;
    }
  };

  buscar();
  return total;
}

/** Devuelve la solución (o null si no tiene). */
export function resolver(tableroOriginal, nivel) {
  const { n } = nivel;
  const tablero = [...tableroOriginal];
  const m = mascaras(tablero, nivel);
  if (!m) return null;
  const { filas, cols, cajas } = m;
  const todos = ((1 << (n + 1)) - 1) & ~1;
  const cajaDe = Array.from({ length: n * n }, (_, i) => caja(i, nivel));

  const buscar = () => {
    let mejor = -1;
    let mejorMask = 0;
    let mejorCuenta = 99;
    for (let i = 0; i < n * n; i++) {
      if (tablero[i]) continue;
      const mask = todos & ~(filas[fila(i, n)] | cols[columna(i, n)] | cajas[cajaDe[i]]);
      const cuenta = contarBits(mask);
      if (cuenta === 0) return false;
      if (cuenta < mejorCuenta) {
        mejor = i;
        mejorMask = mask;
        mejorCuenta = cuenta;
      }
    }
    if (mejor === -1) return true;
    const f = fila(mejor, n);
    const c = columna(mejor, n);
    const b = cajaDe[mejor];
    for (let v = 1; v <= n; v++) {
      const bit = 1 << v;
      if (!(mejorMask & bit)) continue;
      tablero[mejor] = v;
      filas[f] |= bit;
      cols[c] |= bit;
      cajas[b] |= bit;
      if (buscar()) return true;
      filas[f] &= ~bit;
      cols[c] &= ~bit;
      cajas[b] &= ~bit;
      tablero[mejor] = 0;
    }
    return false;
  };

  return buscar() ? tablero : null;
}

/**
 * Intenta resolver solo con técnicas sencillas, como lo haría una persona:
 *  - único desnudo: la celda solo admite un número
 *  - único oculto: un número solo cabe en una celda de su fila, columna o caja
 * Devuelve true si así se llena todo el tablero.
 */
export function resolverConUnicos(tableroOriginal, nivel) {
  const { n } = nivel;
  const tablero = [...tableroOriginal];
  const vec = vecinos(nivel);
  const unidades = [];
  for (let k = 0; k < n; k++) {
    unidades.push(tablero.map((_, i) => i).filter((i) => fila(i, n) === k));
    unidades.push(tablero.map((_, i) => i).filter((i) => columna(i, n) === k));
    unidades.push(tablero.map((_, i) => i).filter((i) => caja(i, nivel) === k));
  }
  const candidatos = (i) => {
    let mask = ((1 << (n + 1)) - 1) & ~1;
    for (const j of vec[i]) if (tablero[j]) mask &= ~(1 << tablero[j]);
    return mask;
  };

  let avanzo = true;
  while (avanzo) {
    avanzo = false;
    for (let i = 0; i < n * n; i++) {
      if (tablero[i]) continue;
      const mask = candidatos(i);
      if (mask === 0) return false;
      if (contarBits(mask) === 1) {
        tablero[i] = Math.log2(mask);
        avanzo = true;
      }
    }
    for (const unidad of unidades) {
      for (let v = 1; v <= n; v++) {
        if (unidad.some((i) => tablero[i] === v)) continue;
        const lugares = unidad.filter((i) => !tablero[i] && candidatos(i) & (1 << v));
        if (lugares.length === 1) {
          tablero[lugares[0]] = v;
          avanzo = true;
        }
      }
    }
  }
  return tablero.every(Boolean);
}

// ================== Generar ==================
/** Tablero completo y válido, con números al azar (backtracking aleatorio). */
export function generarCompleto(nivel, azar = Math.random) {
  const { n } = nivel;
  const tablero = new Array(n * n).fill(0);
  const vec = vecinos(nivel);

  const llenar = (i) => {
    if (i === n * n) return true;
    const usados = new Set(vec[i].map((j) => tablero[j]));
    for (const v of barajar(Array.from({ length: n }, (_, k) => k + 1), azar)) {
      if (usados.has(v)) continue;
      tablero[i] = v;
      if (llenar(i + 1)) return true;
    }
    tablero[i] = 0;
    return false;
  };

  llenar(0);
  return tablero;
}

/**
 * Crea un sudoku con solución ÚNICA.
 * Quita números al azar mientras siga habiendo una sola solución.
 * Si no llega a la cantidad de pistas del nivel, reintenta (máx. `tiempoMax` ms)
 * y se queda con el mejor intento.
 */
export function generarSudoku(idNivel, { azar = Math.random, tiempoMax = 1200 } = {}) {
  const nivel = NIVELES[idNivel];
  const { n, pistas } = nivel;
  const inicio = Date.now();
  let mejor = null;

  const cumpleLogica = (tablero) => {
    if (!nivel.logica) return true;
    const simple = resolverConUnicos(tablero, nivel);
    return nivel.logica === 'simple' ? simple : !simple;
  };

  do {
    const solucion = generarCompleto(nivel, azar);
    const tablero = [...solucion];
    let quedan = n * n;
    for (const i of barajar(Array.from({ length: n * n }, (_, k) => k), azar)) {
      if (quedan <= pistas) break;
      const valor = tablero[i];
      tablero[i] = 0;
      // En los niveles "simples" no se quita un número si eso obliga a adivinar
      const ok =
        contarSoluciones(tablero, nivel, 2) === 1 && (nivel.logica !== 'simple' || resolverConUnicos(tablero, nivel));
      if (!ok) tablero[i] = valor;
      else quedan--;
    }
    const logicaOk = cumpleLogica(tablero);
    // Preferimos: primero que cumpla la lógica del nivel, luego menos pistas
    const puntaje = (logicaOk ? 0 : 1000) + quedan;
    if (!mejor || puntaje < mejor.puntaje) mejor = { tablero, solucion, pistas: quedan, puntaje, logicaOk };
    if (quedan <= pistas && logicaOk) break;
  } while (Date.now() - inicio < tiempoMax);

  return {
    nivel: idNivel,
    tablero: mejor.tablero,
    solucion: mejor.solucion,
    pistas: mejor.pistas,
    logicaOk: mejor.logicaOk,
  };
}

// ================== Ayudas para el juego ==================
/** Celdas con un número repetido en su fila, columna o caja. */
export function conflictos(valores, nivel) {
  const vec = vecinos(nivel);
  const malos = new Set();
  valores.forEach((v, i) => {
    if (!v) return;
    if (vec[i].some((j) => valores[j] === v)) malos.add(i);
  });
  return malos;
}

/** Cuántas veces falta poner cada número (índice 1..n). */
export function restantes(valores, nivel) {
  const { n } = nivel;
  const cuenta = new Array(n + 1).fill(n);
  cuenta[0] = 0;
  valores.forEach((v) => {
    if (v) cuenta[v]--;
  });
  return cuenta;
}

export const estaResuelto = (valores, solucion) => valores.every((v, i) => v === solucion[i]);

/** Celda para la pista: la seleccionada si está vacía o mal; si no, una vacía al azar. */
export function celdaParaPista(valores, solucion, fijas, seleccion, azar = Math.random) {
  const sirve = (i) => !fijas[i] && valores[i] !== solucion[i];
  if (seleccion != null && sirve(seleccion)) return seleccion;
  const opciones = valores.map((_, i) => i).filter(sirve);
  if (!opciones.length) return null;
  return opciones[Math.floor(azar() * opciones.length)];
}

/** Quita la nota `v` de los vecinos de la celda i (al poner un número correcto). */
export function limpiarNotas(notas, i, v, nivel) {
  const nuevas = [...notas];
  const bit = 1 << v;
  for (const j of vecinos(nivel)[i]) nuevas[j] &= ~bit;
  nuevas[i] = 0;
  return nuevas;
}

export function calcularEstrellas(errores, pistas) {
  const fallas = errores + pistas;
  if (fallas === 0) return 3;
  if (fallas <= 2) return 2;
  return 1;
}

export function esMejorMarca(marca, record) {
  if (!record) return true;
  return marca.tiempo < record.tiempo;
}
