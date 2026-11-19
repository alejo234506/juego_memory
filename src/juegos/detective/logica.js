// Reglas del juego Detective (funciones puras, sin React)

export const MARCAS = [null, 'sospechoso', 'descartado'];

/** Errores permitidos al cruzar pistas (cada error cuesta 1 acción). */
export const MAX_CRUCES_FALLIDOS = 3;

/** Partida nueva para un caso. */
export function crearPartida(caso) {
  return {
    casoId: caso.id,
    acciones: caso.acciones,
    hechos: [], // fuentes ya usadas: 'l:<lugar>', 's:<sospechoso>' o 'r:<sospechoso>' (pregunta de rigor)
    pistas: [], // ids de pistas encontradas, en orden
    marcas: {}, // { sospechosoId: 'sospechoso' | 'descartado' }
    deducciones: [], // ids de contradicciones descubiertas
    crucesFallidos: 0,
  };
}

/** Completa una partida guardada con una versión anterior del juego. */
export function normalizarPartida(partida, caso) {
  if (!partida || partida.casoId !== caso.id || !Array.isArray(partida.hechos) || !Array.isArray(partida.pistas)) {
    return crearPartida(caso);
  }
  return {
    ...crearPartida(caso),
    ...partida,
    marcas: partida.marcas ?? {},
    deducciones: Array.isArray(partida.deducciones) ? partida.deducciones : [],
    crucesFallidos: Number.isFinite(partida.crucesFallidos) ? partida.crucesFallidos : 0,
  };
}

const PREFIJO = { lugar: 'l', sospechoso: 's', rigor: 'r' };
export const claveFuente = (tipo, id) => `${PREFIJO[tipo] ?? 's'}:${id}`;

export function yaHecho(partida, tipo, id) {
  return partida.hechos.includes(claveFuente(tipo, id));
}

/**
 * ¿Se puede hacer la pregunta de rigor a este sospechoso?
 * Solo después de interrogarlo y de haber encontrado la pista que la provoca.
 */
export function rigorDisponible(partida, caso, sospechosoId) {
  const s = caso.sospechosos.find((x) => x.id === sospechosoId);
  if (!s?.rigor) return false;
  return (
    yaHecho(partida, 'sospechoso', s.id) &&
    partida.pistas.includes(s.rigor.requiere) &&
    !yaHecho(partida, 'rigor', s.id)
  );
}

/**
 * Investiga un lugar, interroga a un sospechoso o le hace la pregunta de rigor.
 * Cuesta 1 acción. Si no quedan acciones, ya se hizo o no se puede, devuelve la misma partida.
 */
export function investigar(partida, caso, tipo, id) {
  if (partida.acciones <= 0 || yaHecho(partida, tipo, id)) return partida;

  let pista;
  if (tipo === 'lugar') {
    const lugar = caso.lugares.find((x) => x.id === id);
    if (!lugar) return partida;
    pista = lugar.pista;
  } else if (tipo === 'sospechoso') {
    const s = caso.sospechosos.find((x) => x.id === id);
    if (!s) return partida;
    pista = s.pista;
  } else if (tipo === 'rigor') {
    if (!rigorDisponible(partida, caso, id)) return partida;
    pista = caso.sospechosos.find((x) => x.id === id).rigor.pista;
  } else {
    return partida;
  }

  const pistas = pista && !partida.pistas.includes(pista) ? [...partida.pistas, pista] : partida.pistas;
  return {
    ...partida,
    acciones: partida.acciones - 1,
    hechos: [...partida.hechos, claveFuente(tipo, id)],
    pistas,
  };
}

/** Busca la contradicción que forman dos pistas (en cualquier orden). */
export function buscarContradiccion(caso, a, b) {
  return (caso.contradicciones ?? []).find(
    (c) => (c.pistas[0] === a && c.pistas[1] === b) || (c.pistas[0] === b && c.pistas[1] === a)
  );
}

/**
 * Cruza dos pistas de la libreta.
 * - Si forman una contradicción real: se descubre la deducción (no cuesta acciones).
 * - Si no: cuesta 1 acción (si quedan) y suma un cruce fallido. Hay un máximo de errores.
 * Devuelve { partida, resultado, contradiccion }.
 * resultado: 'nueva' | 'repetida' | 'nada' | 'agotado' | 'invalida'
 */
export function cruzarPistas(partida, caso, a, b) {
  if (!a || !b || a === b || !partida.pistas.includes(a) || !partida.pistas.includes(b)) {
    return { partida, resultado: 'invalida', contradiccion: null };
  }
  const c = buscarContradiccion(caso, a, b);
  if (c) {
    if (partida.deducciones.includes(c.id)) return { partida, resultado: 'repetida', contradiccion: c };
    return {
      partida: { ...partida, deducciones: [...partida.deducciones, c.id] },
      resultado: 'nueva',
      contradiccion: c,
    };
  }
  if (partida.crucesFallidos >= MAX_CRUCES_FALLIDOS) return { partida, resultado: 'agotado', contradiccion: null };
  return {
    partida: {
      ...partida,
      acciones: Math.max(0, partida.acciones - 1),
      crucesFallidos: partida.crucesFallidos + 1,
    },
    resultado: 'nada',
    contradiccion: null,
  };
}

/** Minutos desde el inicio del caso, para ordenar la cronología. `dia: 1` = después de medianoche. */
export function minutosDe(pista) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(pista?.hora ?? '');
  if (!m) return null;
  return (pista.dia ?? 0) * 1440 + Number(m[1]) * 60 + Number(m[2]);
}

/** Pistas encontradas que tienen hora, en orden cronológico. */
export function cronologia(caso, pistasEncontradas) {
  return pistasEncontradas
    .map((id) => ({ id, ...caso.pistas[id] }))
    .filter((p) => minutosDe(p) !== null)
    .sort((x, y) => minutosDe(x) - minutosDe(y));
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

/** Contradicciones que hay que descubrir para la tercera insignia. */
export const deduccionesNecesarias = (caso) => (caso.contradicciones ?? []).filter((c) => c.necesaria);

/**
 * Evalúa la acusación.
 * 0 insignias: culpable equivocado (caso sin resolver).
 * 1: culpable correcto.  2: culpable + motivo + método.
 * 3: todo correcto, sobró al menos 1 acción y se descubrieron las deducciones necesarias.
 */
export function evaluar(caso, acusacion, accionesRestantes, deducciones = []) {
  const culpable = acusacion.culpable === caso.solucion.culpable;
  const motivo = acusacion.motivo === caso.solucion.motivo;
  const metodo = acusacion.metodo === caso.solucion.metodo;
  const faltan = deduccionesNecesarias(caso).filter((c) => !deducciones.includes(c.id));
  let insignias = 0;
  if (culpable) {
    insignias = 1;
    if (motivo && metodo) {
      insignias = 2;
      if (accionesRestantes >= 1 && faltan.length === 0) insignias = 3;
    }
  }
  return {
    culpable,
    motivo,
    metodo,
    insignias,
    resuelto: culpable,
    deduccionesFaltantes: faltan.length,
    sinAcciones: accionesRestantes < 1,
  };
}

/**
 * Un caso está abierto si es el primero, si el anterior se resolvió (≥ 1 insignia),
 * o si ya tiene progreso él mismo o algún caso posterior (así no se pierde lo jugado
 * cuando se agregan casos nuevos en medio de la lista).
 */
export function casoDesbloqueado(casos, indice, progreso) {
  if (indice === 0) return true;
  if ((progreso[casos[indice - 1].id] ?? 0) >= 1) return true;
  return casos.slice(indice).some((c) => (progreso[c.id] ?? 0) >= 1);
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
  const rig = caso.sospechosos.find((s) => s.rigor?.pista === pistaId);
  if (rig) return { tipo: 'rigor', icono: rig.avatar, nombre: `${rig.nombre} (pregunta de rigor)` };
  return null;
}

/** Fuente (acción) que entrega una pista: ['lugar'|'sospechoso'|'rigor', id] o null. */
export function fuenteDePista(caso, pistaId) {
  const lugar = caso.lugares.find((l) => l.pista === pistaId);
  if (lugar) return ['lugar', lugar.id];
  const sosp = caso.sospechosos.find((s) => s.pista === pistaId);
  if (sosp) return ['sospechoso', sosp.id];
  const rig = caso.sospechosos.find((s) => s.rigor?.pista === pistaId);
  if (rig) return ['rigor', rig.id];
  return null;
}

/**
 * Pistas que hay que encontrar en una investigación perfecta: las clave y las que
 * forman las deducciones necesarias (más las que se requieren para las preguntas de rigor).
 */
export function pistasNecesarias(caso) {
  const set = new Set(Object.entries(caso.pistas).filter(([, p]) => p.clave).map(([id]) => id));
  for (const c of deduccionesNecesarias(caso)) c.pistas.forEach((id) => set.add(id));
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const id of [...set]) {
      const f = fuenteDePista(caso, id);
      if (f?.[0] === 'rigor') {
        const s = caso.sospechosos.find((x) => x.id === f[1]);
        if (!set.has(s.rigor.requiere)) {
          set.add(s.rigor.requiere);
          cambio = true;
        }
      }
    }
  }
  return [...set];
}

/** Acciones (fuentes) mínimas para una investigación perfecta, en un orden que se puede jugar. */
export function caminoPerfecto(caso) {
  const necesarias = pistasNecesarias(caso);
  const pasos = [];
  const agregar = (tipo, id) => {
    if (!pasos.some(([t, i]) => t === tipo && i === id)) pasos.push([tipo, id]);
  };
  // Primero lugares e interrogatorios; las preguntas de rigor al final
  for (const id of necesarias) {
    const f = fuenteDePista(caso, id);
    if (f && f[0] !== 'rigor') agregar(...f);
  }
  for (const id of necesarias) {
    const f = fuenteDePista(caso, id);
    if (f?.[0] === 'rigor') {
      agregar('sospechoso', f[1]);
      agregar('rigor', f[1]);
    }
  }
  return pasos;
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
  if (caso.sospechosos.length < 4 || caso.sospechosos.length > 6) errores.push('debe tener de 4 a 6 sospechosos');
  if (caso.lugares.length < 4 || caso.lugares.length > 7) errores.push('debe tener de 4 a 7 lugares');
  if (caso.motivos.length < 3 || caso.metodos.length < 3) errores.push('pocas opciones de motivo o método');
  if (!caso.intro || !caso.explicacion) errores.push('falta la introducción o la explicación');

  // Cada pista sale de una sola fuente y todas se pueden encontrar
  const usadas = [];
  for (const f of [...caso.lugares, ...caso.sospechosos]) {
    if (!f.pista) errores.push(`${f.id} no da ninguna pista`);
    else {
      if (!idsPistas.has(f.pista)) errores.push(`pista ${f.pista} no existe`);
      usadas.push(f.pista);
    }
  }
  for (const s of caso.sospechosos) {
    if (!s.rigor) continue;
    const r = s.rigor;
    if (!r.pregunta || !Array.isArray(r.respuesta) || r.respuesta.length === 0) errores.push(`rigor de ${s.id} incompleto`);
    if (!idsPistas.has(r.pista)) errores.push(`rigor de ${s.id}: pista ${r.pista} no existe`);
    if (!idsPistas.has(r.requiere)) errores.push(`rigor de ${s.id}: requiere ${r.requiere}, que no existe`);
    if (r.requiere === r.pista) errores.push(`rigor de ${s.id} se requiere a sí mismo`);
    const fReq = fuenteDePista(caso, r.requiere);
    if (fReq?.[0] === 'rigor') errores.push(`rigor de ${s.id} requiere otra pregunta de rigor`);
    usadas.push(r.pista);
  }
  if (new Set(usadas).size !== usadas.length) errores.push('una pista sale de dos fuentes');
  for (const id of idsPistas) {
    const p = caso.pistas[id];
    if (!usadas.includes(id)) errores.push(`pista ${id} no se puede encontrar`);
    if (!p.texto) errores.push(`pista ${id} sin texto`);
    for (const s of p.sobre ?? []) if (!idsSosp.has(s)) errores.push(`pista ${id} menciona a ${s}, que no existe`);
    if (p.hora !== undefined && minutosDe(p) === null) errores.push(`pista ${id}: hora "${p.hora}" mal escrita`);
  }

  // Contradicciones
  const idsContra = new Set();
  for (const c of caso.contradicciones ?? []) {
    if (idsContra.has(c.id)) errores.push(`contradicción ${c.id} repetida`);
    idsContra.add(c.id);
    if (!Array.isArray(c.pistas) || c.pistas.length !== 2 || c.pistas[0] === c.pistas[1]) {
      errores.push(`contradicción ${c.id} debe unir dos pistas distintas`);
      continue;
    }
    for (const p of c.pistas) if (!idsPistas.has(p)) errores.push(`contradicción ${c.id}: pista ${p} no existe`);
    if (c.sospechoso && !idsSosp.has(c.sospechoso)) errores.push(`contradicción ${c.id}: sospechoso ${c.sospechoso} no existe`);
    if (!c.deduccion) errores.push(`contradicción ${c.id} sin deducción`);
  }
  const pares = (caso.contradicciones ?? []).map((c) => [...c.pistas].sort().join('+'));
  if (new Set(pares).size !== pares.length) errores.push('dos contradicciones usan el mismo par de pistas');

  // Presupuesto: alcanza para la investigación perfecta y sobra 1 acción, pero no para todo
  const minimo = caminoPerfecto(caso).length;
  if (minimo + 1 > caso.acciones) errores.push(`faltan acciones: se necesitan ${minimo} y hay ${caso.acciones}`);
  const total = caso.lugares.length + caso.sospechosos.length + caso.sospechosos.filter((s) => s.rigor).length;
  if (caso.acciones >= total) errores.push('las acciones alcanzan para todo: no hay que escoger');
  return errores;
}
