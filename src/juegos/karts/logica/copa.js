// Copa: varias pistas seguidas, se suman puntos según el puesto de cada carrera.
import { PUNTOS_COPA } from './pilotos.js';
import { PISTAS_DATOS } from './pistas.js';

export function crearCopa(pistas = PISTAS_DATOS.map((p) => p.id)) {
  return { pistas, indice: 0, puntos: {}, historial: [] };
}

export function puntosPorPuesto(puesto) {
  return PUNTOS_COPA[puesto - 1] ?? 1;
}

// resultados: [{ piloto, puesto, humano, jugador }]
export function sumarCarrera(copa, resultados) {
  const puntos = { ...copa.puntos };
  const ganados = {};
  resultados.forEach((r) => {
    const p = puntosPorPuesto(r.puesto);
    ganados[r.piloto.id] = p;
    puntos[r.piloto.id] = (puntos[r.piloto.id] ?? 0) + p;
  });
  return {
    ...copa,
    puntos,
    indice: copa.indice + 1,
    historial: [...copa.historial, { pista: copa.pistas[copa.indice], ganados }],
  };
}

export function copaTerminada(copa) {
  return copa.indice >= copa.pistas.length;
}

// Tabla ordenada; en empate gana quien tuvo más primeros puestos
export function clasificacion(copa, pilotos) {
  const primeros = (id) => copa.historial.filter((h) => h.ganados[id] === PUNTOS_COPA[0]).length;
  return pilotos
    .map((p) => ({ piloto: p, puntos: copa.puntos[p.id] ?? 0, primeros: primeros(p.id) }))
    .sort((a, b) => b.puntos - a.puntos || b.primeros - a.primeros);
}
