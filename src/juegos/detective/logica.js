// Reglas del juego Detective (funciones puras, sin React)

export const MARCAS = [null, 'sospechoso', 'descartado'];

/** Partida nueva para un caso. */
export function crearPartida(caso) {
  return {
    casoId: caso.id,
    acciones: caso.acciones,
    hechos: [], // fuentes ya usadas: 'l:<lugar>' o 's:<sospechoso>'
    pistas: [], // ids de pistas encontradas, en orden
    marcas: {}, // { sospechosoId: 'sospechoso' | 'descartado' }
  };
}

export const claveFuente = (tipo, id) => `${tipo === 'lugar' ? 'l' : 's'}:${id}`;

export function yaHecho(partida, tipo, id) {
  return partida.hechos.includes(claveFuente(tipo, id));
}

/**
 * Investiga un lugar o interroga a un sospechoso.
 * Cuesta 1 acción. Si no quedan acciones o ya se hizo, devuelve la misma partida.
 */
export function investigar(partida, caso, tipo, id) {
  if (partida.acciones <= 0 || yaHecho(partida, tipo, id)) return partida;
  const lista = tipo === 'lugar' ? caso.lugares : caso.sospechosos;
  const fuente = lista.find((x) => x.id === id);
  if (!fuente) return partida;

  const pistas = fuente.pista && !partida.pistas.includes(fuente.pista)
    ? [...partida.pistas, fuente.pista]
    : partida.pistas;

  return {
    ...partida,
    acciones: partida.acciones - 1,
    hechos: [...partida.hechos, claveFuente(tipo, id)],
    pistas,
  };
}

/** Rota la marca de un sospechoso: sin marca → sospechoso → descartado → sin marca. */
export function alternarMarca(partida, sospechosoId) {
  const actual = partida.marcas[sospechosoId] ?? null;
  const siguiente = MARCAS[(MARCAS.indexOf(actual) + 1) % MARCAS.length];
  const marcas = { ...partida.marcas };
  if (siguiente) marcas[sospechosoId] = siguiente;
  else delete marcas[sospechosoId];
  return { ...partida, marcas };
}

/**
 * Evalúa la acusación.
 * 0 insignias: culpable equivocado (caso sin resolver).
 * 1: culpable correcto.  2: culpable + motivo + método.  3: todo correcto y sobró al menos 1 acción.
 */
export function evaluar(caso, acusacion, accionesRestantes) {
  const culpable = acusacion.culpable === caso.solucion.culpable;
  const motivo = acusacion.motivo === caso.solucion.motivo;
  const metodo = acusacion.metodo === caso.solucion.metodo;
  let insignias = 0;
  if (culpable) {
    insignias = 1;
    if (motivo && metodo) {
      insignias = 2;
      if (accionesRestantes >= 1) insignias = 3;
    }
  }
  return { culpable, motivo, metodo, insignias, resuelto: culpable };
}

/** Un caso está abierto si es el primero o si el anterior se resolvió (≥ 1 insignia). */
export function casoDesbloqueado(casos, indice, progreso) {
  if (indice === 0) return true;
  return (progreso[casos[indice - 1].id] ?? 0) >= 1;
}

/** Guarda la mejor marca de un caso sin empeorarla. */
export function actualizarProgreso(progreso, casoId, insignias) {
  const anterior = progreso[casoId] ?? 0;
  if (insignias <= anterior) return progreso;
  return { ...progreso, [casoId]: insignias };
}

/** De dónde salió una pista (para mostrarlo en la libreta). */
export function origenDePista(caso, pistaId) {
  const lugar = caso.lugares.find((l) => l.pista === pistaId);
  if (lugar) return { tipo: 'lugar', icono: lugar.icono, nombre: lugar.nombre };
  const sosp = caso.sospechosos.find((s) => s.pista === pistaId);
  if (sosp) return { tipo: 'sospechoso', icono: sosp.avatar, nombre: sosp.nombre };
  return null;
}

/** Revisa que un caso esté bien armado. Devuelve una lista de errores (vacía si todo está bien). */
export function validarCaso(caso) {
  const errores = [];
  const idsSosp = new Set(caso.sospechosos.map((s) => s.id));
  const idsMot = new Set(caso.motivos.map((m) => m.id));
  const idsMet = new Set(caso.metodos.map((m) => m.id));
  const idsPistas = new Set(Object.keys(caso.pistas));

  if (!idsSosp.has(caso.solucion.culpable)) errores.push('culpable no existe');
  if (!idsMot.has(caso.solucion.motivo)) errores.push('motivo no existe');
  if (!idsMet.has(caso.solucion.metodo)) errores.push('método no existe');
  if (caso.sospechosos.length < 4 || caso.sospechosos.length > 5) errores.push('debe tener 4 o 5 sospechosos');
  if (caso.lugares.length < 4 || caso.lugares.length > 6) errores.push('debe tener de 4 a 6 lugares');

  const usadas = [];
  for (const f of [...caso.lugares, ...caso.sospechosos]) {
    if (f.pista) {
      if (!idsPistas.has(f.pista)) errores.push(`pista ${f.pista} no existe`);
      usadas.push(f.pista);
    }
  }
  if (new Set(usadas).size !== usadas.length) errores.push('una pista sale de dos fuentes');
  for (const id of idsPistas) {
    if (!usadas.includes(id)) errores.push(`pista ${id} no se puede encontrar`);
    for (const s of caso.pistas[id].sobre ?? []) {
      if (!idsSosp.has(s)) errores.push(`pista ${id} menciona a ${s}, que no existe`);
    }
  }

  const claves = Object.values(caso.pistas).filter((p) => p.clave).length;
  // Debe alcanzar para las pistas clave y sobrar 1 acción (para la tercera insignia)
  if (claves + 1 > caso.acciones) errores.push(`faltan acciones: ${claves} pistas clave y ${caso.acciones} acciones`);
  const total = caso.lugares.length + caso.sospechosos.length;
  if (caso.acciones >= total) errores.push('las acciones alcanzan para todo: no hay que escoger');
  if (!caso.explicacion) errores.push('falta la explicación');
  return errores;
}
