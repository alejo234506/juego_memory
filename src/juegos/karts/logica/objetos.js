// Objetos originales de Turbo Karts.
export const OBJETOS = {
  cohete: { nombre: 'Turbo cohete', icono: '🚀', descripcion: 'Impulso fuerte durante un momento' },
  aceite: { nombre: 'Charco de aceite', icono: '🛢️', descripcion: 'Lo sueltas atrás; quien lo pise da un trompo' },
  iman: { nombre: 'Imán', icono: '🧲', descripcion: 'Te jala hacia el rival que va adelante' },
  escudo: { nombre: 'Escudo burbuja', icono: '🫧', descripcion: 'Te protege de un golpe' },
  tinta: { nombre: 'Nube de tinta', icono: '🦑', descripcion: 'Mancha la vista de los que van adelante' },
  resorte: { nombre: 'Resorte', icono: '🌀', descripcion: 'Un salto que pasa por encima de charcos y pasto' },
};

export const ORDEN_OBJETOS = Object.keys(OBJETOS);

// Probabilidades según qué tan atrás vas (0 = primero, 1 = último)
const PESOS = {
  adelante: { cohete: 1, aceite: 5, iman: 0, escudo: 4, tinta: 1, resorte: 2 },
  medio: { cohete: 3, aceite: 3, iman: 2, escudo: 2, tinta: 3, resorte: 2 },
  atras: { cohete: 5, aceite: 1, iman: 5, escudo: 1, tinta: 3, resorte: 1 },
};

export function pesosPorPuesto(puesto, total) {
  if (total <= 1) return PESOS.medio;
  const f = (puesto - 1) / (total - 1);
  if (f < 0.34) return PESOS.adelante;
  if (f < 0.67) return PESOS.medio;
  return PESOS.atras;
}

export function sortearObjeto(puesto, total, azar = Math.random) {
  const pesos = pesosPorPuesto(puesto, total);
  const suma = ORDEN_OBJETOS.reduce((s, id) => s + pesos[id], 0);
  let r = azar() * suma;
  for (const id of ORDEN_OBJETOS) {
    r -= pesos[id];
    if (r < 0) return id;
  }
  return ORDEN_OBJETOS[ORDEN_OBJETOS.length - 1];
}

// Golpe de aceite: el escudo lo absorbe; en el aire no afecta
export function golpearConAceite(k) {
  if (k.salto > 0) return 'salto';
  if (k.escudo > 0) {
    k.escudo = 0;
    k.eventos.push('escudoRoto');
    return 'escudo';
  }
  k.giroLoco = 1.1;
  k.turbo = 0;
  k.vel *= 0.45;
  k.derrape.activo = false;
  k.derrape.carga = 0;
  k.eventos.push('trompo');
  return 'trompo';
}

export function mancharConTinta(k) {
  if (k.escudo > 0) {
    k.escudo = 0;
    k.eventos.push('escudoRoto');
    return 'escudo';
  }
  k.tinta = 3.2;
  k.eventos.push('tinta');
  return 'tinta';
}

// Usa el objeto del kart. Devuelve lo que pasó (para sonidos y pruebas).
export function usarObjeto(carrera, k) {
  const id = k.objeto;
  if (!id || k.ruleta > 0 || k.terminado) return null;
  k.objeto = null;
  k.eventos.push('usar');
  switch (id) {
    case 'cohete':
      k.turbo = Math.max(k.turbo, 1.6);
      break;
    case 'aceite': {
      const atras = 34;
      carrera.charcos.push({
        id: carrera.siguienteId++,
        x: k.x - Math.cos(k.ang) * atras,
        y: k.y - Math.sin(k.ang) * atras,
        dueno: k.id,
        vida: 25,
        gracia: 0.6, // el dueño no lo pisa apenas lo suelta
      });
      break;
    }
    case 'iman': {
      const adelante = carrera.karts.find((o) => o.puesto === k.puesto - 1);
      k.iman = 2.6;
      k.imanObjetivo = adelante ?? null;
      break;
    }
    case 'escudo':
      k.escudo = 9;
      break;
    case 'tinta':
      carrera.karts.forEach((o) => {
        if (o !== k && o.puesto < k.puesto && !o.terminado) mancharConTinta(o);
      });
      break;
    case 'resorte':
      k.salto = 0.85;
      break;
    default:
      return null;
  }
  return id;
}
