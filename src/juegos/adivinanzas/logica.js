// Reglas del juego de adivinanzas (funciones puras, sin React).
import { ADIVINANZAS, DIFICULTADES } from './datos.js';

export const PREGUNTAS_POR_RONDA = 10;
export const SEGUNDOS_CONTRARRELOJ = 30;
export const INTENTOS = 3;

// Desafío del genio: solo difíciles y de genio, sin opciones y con 1 pista como máximo
export const GENIO = { pistasMax: 1, dificultades: ['dificil', 'genio'] };

export const PUNTOS = {
  base: 100, // base de una fácil; las más difíciles valen más (ver DIFICULTADES)
  pista: 25, // se resta por cada pista usada
  opciones: 40, // se resta si pide ver las opciones
  intentoFallido: 10, // se resta por cada intento escrito que falle
  rachaPaso: 10, // bonus por cada acierto seguido después del primero
  rachaMax: 50,
  porSegundo: 2, // bonus en contrarreloj por cada segundo que sobra
  minimo: 10, // un acierto nunca vale menos que esto
};

// Palabras que se ignoran al comparar ("el sol", "creo que es la luna"…)
const RELLENO = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo', 'al', 'del',
  'es', 'son', 'creo', 'que', 'seria', 'sera', 'pues', 'eh', 'mmm',
]);

/** Minúsculas, sin tildes, sin signos y sin palabras de relleno. */
export function normalizar(texto) {
  const limpio = String(texto ?? '')
    .toLowerCase()
    .normalize('NFD') // separa las tildes (la ñ queda como n + ~)
    .replace(/[̀-ͯ]/g, '') // así "araña" = "arana" para quien no tenga la tecla ñ
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((p) => p && !RELLENO.has(p));
  return limpio.join(' ');
}

/** Quita el plural sencillo para aceptar "estrella" = "estrellas". */
function singular(texto) {
  return texto
    .split(' ')
    .map((p) => (p.length > 3 && p.endsWith('es') ? p.slice(0, -2) : p.length > 2 && p.endsWith('s') ? p.slice(0, -1) : p))
    .join(' ');
}

/** Todas las formas aceptadas de una adivinanza, ya normalizadas. */
export function respuestasAceptadas(adivinanza) {
  const formas = [adivinanza.respuesta, ...(adivinanza.sinonimos ?? [])].map(normalizar).filter(Boolean);
  return new Set([...formas, ...formas.map(singular)]);
}

export function esCorrecta(intento, adivinanza) {
  const n = normalizar(intento);
  if (!n) return false;
  const aceptadas = respuestasAceptadas(adivinanza);
  return aceptadas.has(n) || aceptadas.has(singular(n));
}

/** Fisher–Yates: devuelve una copia barajada. */
export function barajar(lista, aleatorio = Math.random) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Puntos base según la dificultad. */
export function puntosBase(dificultad) {
  return DIFICULTADES[dificultad]?.puntos ?? PUNTOS.base;
}

/** Adivinanzas de una categoría y una dificultad ('todas' = sin filtro). */
export function filtrar(adivinanzas, categoria = 'todas', dificultad = 'todas') {
  return adivinanzas.filter(
    (x) => (categoria === 'todas' || x.categoria === categoria) && (dificultad === 'todas' || x.dificultad === dificultad)
  );
}

/** Elige las adivinanzas de una ronda según la categoría y la dificultad. */
export function crearRonda(adivinanzas, categoria = 'todas', cantidad = PREGUNTAS_POR_RONDA, aleatorio = Math.random, dificultad = 'todas') {
  return barajar(filtrar(adivinanzas, categoria, dificultad), aleatorio).slice(0, cantidad);
}

/** Ronda del Desafío del genio: solo difíciles y de genio, de todas las categorías. */
export function crearRondaGenio(adivinanzas, cantidad = PREGUNTAS_POR_RONDA, aleatorio = Math.random) {
  const duras = adivinanzas.filter((x) => GENIO.dificultades.includes(x.dificultad));
  return barajar(duras, aleatorio).slice(0, cantidad);
}

/** Cuántas pistas se pueden pedir en la partida. */
export const pistasMaximas = (modo) => (modo === 'genio' ? GENIO.pistasMax : 2);

/** Clave del récord: cada combinación de categoría y dificultad tiene el suyo. */
export function claveRecord({ modo, categoria, dificultad }) {
  if (modo === 'genio') return 'genio';
  return dificultad && dificultad !== 'todas' ? `${categoria}|${dificultad}` : categoria;
}

/**
 * 4 opciones: la respuesta + 3 distractores (primero de la misma categoría).
 * Ningún distractor puede ser una respuesta aceptada ni repetirse.
 */
export function opcionesPara(adivinanza, todas, aleatorio = Math.random) {
  const aceptadas = respuestasAceptadas(adivinanza);
  const vistas = new Set([normalizar(adivinanza.respuesta)]);
  const candidatas = [
    ...barajar(todas.filter((x) => x.categoria === adivinanza.categoria), aleatorio),
    ...barajar(todas.filter((x) => x.categoria !== adivinanza.categoria), aleatorio),
  ];
  const distractores = [];
  for (const otra of candidatas) {
    if (distractores.length === 3) break;
    const n = normalizar(otra.respuesta);
    if (vistas.has(n) || aceptadas.has(n) || aceptadas.has(singular(n))) continue;
    vistas.add(n);
    distractores.push(otra.respuesta);
  }
  return barajar([adivinanza.respuesta, ...distractores], aleatorio);
}

/** Puntos de un acierto según las ayudas usadas, la racha y el tiempo. */
export function calcularPuntos({ dificultad = 'facil', pistas = 0, conOpciones = false, fallos = 0, racha = 1, segundosRestantes = 0, contrarreloj = false }) {
  let puntos = puntosBase(dificultad) - pistas * PUNTOS.pista - fallos * PUNTOS.intentoFallido;
  if (conOpciones) puntos -= PUNTOS.opciones;
  puntos = Math.max(PUNTOS.minimo, puntos);
  const bonusRacha = Math.min(PUNTOS.rachaMax, Math.max(0, racha - 1) * PUNTOS.rachaPaso);
  const bonusTiempo = contrarreloj ? Math.max(0, Math.round(segundosRestantes)) * PUNTOS.porSegundo : 0;
  return { base: puntos, bonusRacha, bonusTiempo, total: puntos + bonusRacha + bonusTiempo };
}

/** Estrellas de la ronda según los aciertos (de 10). */
export function estrellasRonda(aciertos, total = PREGUNTAS_POR_RONDA) {
  const p = total ? aciertos / total : 0;
  if (p >= 0.9) return 3;
  if (p >= 0.6) return 2;
  if (p >= 0.3) return 1;
  return 0;
}

/** Primera letra en mayúscula para mostrar respuestas. */
export function capitalizar(texto) {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
}

// ================== Estado de una partida (reducer) ==================
export const preguntaNueva = (conOpciones = false) => ({
  pistas: 0,
  conOpciones,
  fallos: 0,
  estado: 'pensando', // 'pensando' | 'acierto' | 'fallo'
  motivo: null, // 'intentos' | 'opcion' | 'tiempo' | 'saltada'
  ganancia: null,
  elegida: null,
});

// ---------------------------------------------------------------- reducer
function cerrarPregunta(s, acerto, motivo, extra = {}) {
  const actual = s.ronda[s.indice];
  const racha = acerto ? s.racha + 1 : 0;
  const ganancia = acerto
    ? calcularPuntos({
        dificultad: actual.dificultad,
        pistas: s.p.pistas,
        conOpciones: s.p.conOpciones,
        fallos: s.p.fallos,
        racha,
        contrarreloj: s.contrarreloj,
        segundosRestantes: s.limite ? (s.limite - (extra.ahora ?? Date.now())) / 1000 : 0,
      })
    : null;
  return {
    ...s,
    puntos: s.puntos + (ganancia?.total ?? 0),
    racha,
    mejorRacha: Math.max(s.mejorRacha, racha),
    resultados: [
      ...s.resultados,
      { adivinanza: actual, acerto, motivo, puntos: ganancia?.total ?? 0, pistas: s.p.pistas, conOpciones: s.p.conOpciones },
    ],
    p: { ...s.p, estado: acerto ? 'acierto' : 'fallo', motivo, ganancia, elegida: extra.elegida ?? null },
  };
}

export function reducer(s, accion) {
  const pensando = s.fase === 'jugando' && s.p.estado === 'pensando';
  switch (accion.type) {
    case 'CONFIGURAR':
      return { ...s, ...accion.cambios };
    case 'EMPEZAR': {
      const genio = s.modo === 'genio';
      const ronda = genio ? crearRondaGenio(ADIVINANZAS) : crearRonda(ADIVINANZAS, s.categoria, PREGUNTAS_POR_RONDA, Math.random, s.dificultad ?? 'todas');
      if (!ronda.length) return s;
      return {
        ...s,
        fase: 'jugando',
        ronda,
        opcionesRonda: ronda.map((x) => opcionesPara(x, ADIVINANZAS)),
        indice: 0,
        puntos: 0,
        racha: 0,
        mejorRacha: 0,
        resultados: [],
        limite: s.contrarreloj ? accion.ahora + SEGUNDOS_CONTRARRELOJ * 1000 : null,
        p: preguntaNueva(!genio && s.siempreOpciones),
      };
    }
    case 'PISTA':
      if (!pensando || s.p.pistas >= pistasMaximas(s.modo)) return s;
      return { ...s, p: { ...s.p, pistas: s.p.pistas + 1 } };
    case 'VER_OPCIONES':
      if (!pensando || s.p.conOpciones || s.modo === 'genio') return s;
      return { ...s, p: { ...s.p, conOpciones: true } };
    case 'RESPONDER': {
      if (!pensando || s.p.conOpciones || !accion.texto.trim()) return s;
      if (esCorrecta(accion.texto, s.ronda[s.indice])) return cerrarPregunta(s, true, null, accion);
      const fallos = s.p.fallos + 1;
      if (fallos >= INTENTOS) return cerrarPregunta({ ...s, p: { ...s.p, fallos } }, false, 'intentos', accion);
      return { ...s, p: { ...s.p, fallos } };
    }
    case 'ELEGIR': {
      if (!pensando || !s.p.conOpciones) return s;
      const acerto = esCorrecta(accion.opcion, s.ronda[s.indice]);
      return cerrarPregunta(s, acerto, acerto ? null : 'opcion', { ...accion, elegida: accion.opcion });
    }
    case 'SALTAR':
      return pensando ? cerrarPregunta(s, false, 'saltada', accion) : s;
    case 'TIEMPO':
      return pensando && s.limite ? cerrarPregunta(s, false, 'tiempo', accion) : s;
    case 'SIGUIENTE': {
      if (s.fase !== 'jugando' || s.p.estado === 'pensando') return s;
      if (s.indice + 1 >= s.ronda.length) return { ...s, fase: 'resumen' };
      return {
        ...s,
        indice: s.indice + 1,
        limite: s.contrarreloj ? accion.ahora + SEGUNDOS_CONTRARRELOJ * 1000 : null,
        p: preguntaNueva(s.modo !== 'genio' && s.siempreOpciones),
      };
    }
    case 'MENU':
      return { ...s, fase: 'inicio' };
    default:
      return s;
  }
}

