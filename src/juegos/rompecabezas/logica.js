// Reglas del rompecabezas deslizante (funciones puras, sin React)
// El tablero es un arreglo de n*n números: 1..n*n-1 son fichas y 0 es el hueco.

export const TAMANOS = {
  3: { nombre: 'Fácil', pasosMezcla: 160, estrellas: [45, 90] },
  4: { nombre: 'Medio', pasosMezcla: 320, estrellas: [140, 260] },
  5: { nombre: 'Difícil', pasosMezcla: 520, estrellas: [320, 560] },
  6: { nombre: 'Experto', pasosMezcla: 900, estrellas: [620, 1050] },
};

export const ORDEN_TAMANOS = [3, 4, 5, 6];

export const HUECO = 0;

export function tableroResuelto(n) {
  return [...Array.from({ length: n * n - 1 }, (_, i) => i + 1), HUECO];
}

export const fila = (indice, n) => Math.floor(indice / n);
export const columna = (indice, n) => indice % n;

export function estaResuelto(fichas) {
  for (let i = 0; i < fichas.length - 1; i++) {
    if (fichas[i] !== i + 1) return false;
  }
  return fichas[fichas.length - 1] === HUECO;
}

// ¿La ficha (valor) está en su casilla correcta?
export const enSuLugar = (valor, indice) => valor !== HUECO && valor === indice + 1;

export function vecinos(indice, n) {
  const r = fila(indice, n);
  const c = columna(indice, n);
  const lista = [];
  if (r > 0) lista.push(indice - n);
  if (r < n - 1) lista.push(indice + n);
  if (c > 0) lista.push(indice - 1);
  if (c < n - 1) lista.push(indice + 1);
  return lista;
}

/**
 * Mueve la ficha en `indice` hacia el hueco. Si está en la misma fila o columna
 * que el hueco (aunque no sea vecina) se deslizan todas las fichas que hay en medio.
 * Devuelve { fichas, movidas } o null si no se puede mover.
 */
export function mover(fichas, n, indice) {
  const hueco = fichas.indexOf(HUECO);
  if (indice === hueco || indice < 0 || indice >= fichas.length) return null;

  let paso;
  if (fila(indice, n) === fila(hueco, n)) paso = indice > hueco ? 1 : -1;
  else if (columna(indice, n) === columna(hueco, n)) paso = indice > hueco ? n : -n;
  else return null;

  const nuevas = fichas.slice();
  let actual = hueco;
  let movidas = 0;
  while (actual !== indice) {
    nuevas[actual] = nuevas[actual + paso];
    actual += paso;
    movidas++;
  }
  nuevas[indice] = HUECO;
  return { fichas: nuevas, movidas };
}

/**
 * Flechas del teclado: la ficha que se mueve es la que está al otro lado del hueco.
 * ArrowUp => sube la ficha que está debajo del hueco, etc.
 */
export function moverConFlecha(fichas, n, tecla) {
  const hueco = fichas.indexOf(HUECO);
  const r = fila(hueco, n);
  const c = columna(hueco, n);
  const destinos = {
    ArrowUp: r < n - 1 ? hueco + n : -1,
    ArrowDown: r > 0 ? hueco - n : -1,
    ArrowLeft: c < n - 1 ? hueco + 1 : -1,
    ArrowRight: c > 0 ? hueco - 1 : -1,
  };
  const origen = destinos[tecla];
  if (origen === undefined || origen < 0) return null;
  return mover(fichas, n, origen);
}

/**
 * Mezcla haciendo movimientos legales al azar desde el tablero resuelto,
 * así siempre tiene solución. `azar` permite pruebas reproducibles.
 */
export function mezclar(n, pasos = TAMANOS[n]?.pasosMezcla ?? 200, azar = Math.random) {
  let fichas = tableroResuelto(n);
  let hueco = fichas.length - 1;
  let anterior = -1;
  let hechos = 0;
  while (hechos < pasos || estaResuelto(fichas) || cuantasEnSuLugar(fichas) > fichas.length / 2) {
    const opciones = vecinos(hueco, n).filter((v) => v !== anterior);
    const elegido = opciones[Math.floor(azar() * opciones.length)];
    fichas[hueco] = fichas[elegido];
    fichas[elegido] = HUECO;
    anterior = hueco;
    hueco = elegido;
    hechos++;
    if (hechos > pasos * 20) break; // seguro contra bucles infinitos
  }
  return fichas;
}

export function cuantasEnSuLugar(fichas) {
  return fichas.reduce((total, valor, i) => total + (enSuLugar(valor, i) ? 1 : 0), 0);
}

// Comprobación clásica por inversiones (se usa en las pruebas)
export function esResoluble(fichas, n) {
  const sinHueco = fichas.filter((v) => v !== HUECO);
  let inversiones = 0;
  for (let i = 0; i < sinHueco.length; i++) {
    for (let j = i + 1; j < sinHueco.length; j++) {
      if (sinHueco[i] > sinHueco[j]) inversiones++;
    }
  }
  if (n % 2 === 1) return inversiones % 2 === 0;
  const filaHuecoDesdeAbajo = n - fila(fichas.indexOf(HUECO), n);
  return (inversiones + filaHuecoDesdeAbajo) % 2 === 1;
}

export function calcularEstrellas(movimientos, n) {
  const [tres, dos] = TAMANOS[n]?.estrellas ?? [100, 200];
  if (movimientos <= tres) return 3;
  if (movimientos <= dos) return 2;
  return 1;
}

// Mejor = menos movimientos; si empatan, menos tiempo
export function esMejorMarca(nueva, anterior) {
  if (!anterior) return true;
  if (nueva.movimientos !== anterior.movimientos) return nueva.movimientos < anterior.movimientos;
  return nueva.tiempo < anterior.tiempo;
}

// Posición de fondo para recortar la imagen en n*n pedazos
export function recorteImagen(valor, n) {
  const casilla = valor - 1;
  const x = n === 1 ? 0 : (columna(casilla, n) / (n - 1)) * 100;
  const y = n === 1 ? 0 : (fila(casilla, n) / (n - 1)) * 100;
  return `${x}% ${y}%`;
}

// =====================================================================
// Modo "Fichas giradas": cada ficha ya está en su casilla pero girada.
// Se guarda cuántos cuartos de vuelta lleva cada ficha (puede ser cualquier
// entero, positivo o negativo, para que la animación siempre gire hacia el
// lado correcto). Está derecha cuando el giro es múltiplo de 4.
// =====================================================================

export const normalizarGiro = (giro) => ((giro % 4) + 4) % 4;

export const estaDerecha = (giro) => normalizarGiro(giro) === 0;

export const girosResueltos = (giros) => giros.every(estaDerecha);

export const cuantasDerechas = (giros) => giros.filter(estaDerecha).length;

/** Gira la ficha `indice` un cuarto de vuelta: sentido 1 = horario, -1 = antihorario. */
export function girar(giros, indice, sentido = 1) {
  if (indice < 0 || indice >= giros.length) return null;
  const nuevos = giros.slice();
  nuevos[indice] += sentido >= 0 ? 1 : -1;
  return nuevos;
}

/** Menos giros posibles para dejarlo todo derecho (girando hacia el lado más corto). */
export function minimoGiros(giros) {
  return giros.reduce((total, g) => {
    const r = normalizarGiro(g);
    return total + Math.min(r, 4 - r);
  }, 0);
}

/**
 * Giros iniciales al azar: nunca empieza resuelto y como máximo
 * una cuarta parte de las fichas queda derecha desde el principio.
 */
export function mezclarGiros(n, azar = Math.random) {
  const total = n * n;
  const giros = Array.from({ length: total }, () => Math.floor(azar() * 4));
  const maxDerechas = Math.floor(total / 4);
  let derechas = giros.map((g, i) => (g === 0 ? i : -1)).filter((i) => i >= 0);
  while (derechas.length > maxDerechas) {
    const k = Math.floor(azar() * derechas.length);
    giros[derechas[k]] = 1 + Math.floor(azar() * 3);
    derechas.splice(k, 1);
  }
  return giros;
}

/** Estrellas del modo girar, comparando los giros usados con el mínimo posible. */
export function calcularEstrellasGiro(movimientos, minimo) {
  if (movimientos <= Math.ceil(minimo * 1.15) + 2) return 3;
  if (movimientos <= Math.ceil(minimo * 1.6) + 4) return 2;
  return 1;
}
