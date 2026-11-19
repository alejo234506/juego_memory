// Una carrera completa: parrilla, cuenta regresiva, vueltas, posiciones, objetos, CPU.
// Lógica pura (sin DOM): el componente solo dibuja y lee las entradas.
import { obtenerPista, puntoEn, angDif, SECTORES } from './pistas.js';
import { crearKart, pasoKart, F, ENTRADA_VACIA } from './fisica.js';
import { sortearObjeto, usarObjeto, golpearConAceite } from './objetos.js';
import { PILOTOS, DIFICULTADES } from './pilotos.js';

export const CUENTA_REGRESIVA = 3.6;
const RADIO_CAJA = 30;
const RADIO_CHARCO = 27;

export function crearCarrera({
  pistaId,
  vueltas = 3,
  humanos = [], // [{ pilotoId, jugador }]
  cpus = [], // [pilotoId]
  dificultad = 'normal',
  azar = Math.random,
}) {
  const pista = obtenerPista(pistaId);
  const hab = DIFICULTADES[dificultad] ?? DIFICULTADES.normal;
  // Los humanos salen atrás (si hay CPU), como en las carreras de verdad
  const parrilla = [
    ...cpus.map((pilotoId) => ({ pilotoId, humano: false, jugador: null })),
    ...humanos.map((h) => ({ pilotoId: h.pilotoId, humano: true, jugador: h.jugador })),
  ];
  const karts = parrilla.map((p, i) => {
    const fila = Math.floor(i / 2);
    const lado = i % 2 === 0 ? -1 : 1;
    const pos = puntoEn(pista, pista.largo - 45 - fila * 58, lado * pista.mitad * 0.42);
    const piloto = PILOTOS.find((x) => x.id === p.pilotoId) ?? PILOTOS[i % PILOTOS.length];
    const k = crearKart({ id: i, piloto, x: pos.x, y: pos.y, angulo: pos.angulo, humano: p.humano, jugador: p.jugador, pista });
    k.cp = SECTORES - 1; // la parrilla está en el último sector, antes de la meta
    k.cpu = {
      desvio: (azar() * 2 - 1) * 0.35,
      cambio: 2 + azar() * 3,
      reversa: 0,
      tenencia: 0,
      ruido: azar() * 10,
    };
    return k;
  });

  const cajas = [];
  pista.cajas.forEach((t) => {
    [-0.5, 0, 0.5].forEach((f) => {
      const p = puntoEn(pista, t * pista.largo, f * pista.mitad);
      cajas.push({ x: p.x, y: p.y, angulo: p.angulo, activa: true, reaparece: 0 });
    });
  });
  const turbos = pista.turbos.map((t) => {
    const p = puntoEn(pista, t * pista.largo, 0);
    return { s: t * pista.largo, largo: 80, ancho: pista.mitad * 0.5, x: p.x, y: p.y, angulo: p.angulo };
  });

  const carrera = {
    pista,
    vueltas,
    dificultad,
    habilidad: hab,
    karts,
    cajas,
    turbos,
    charcos: [],
    siguienteId: 1,
    fase: 'cuenta', // cuenta → carrera → fin
    cuenta: CUENTA_REGRESIVA,
    tiempo: 0,
    azar,
    terminados: 0,
    eventos: [],
  };
  actualizarPuestos(carrera);
  return carrera;
}

// ---------------- Vueltas y puestos ----------------
export function actualizarVuelta(c, k) {
  const { pista } = c;
  const largoSector = pista.largo / SECTORES;
  const s = k.indice * pista.paso;
  const sector = Math.min(SECTORES - 1, Math.floor(s / largoSector));
  const esperado = (k.cp + 1) % SECTORES;
  if (sector === esperado) {
    k.cp = esperado;
    if (esperado === 0) {
      k.vuelta += 1;
      if (k.vuelta === 1) {
        k.inicioVuelta = c.tiempo;
      } else {
        k.tiemposVuelta.push(c.tiempo - k.inicioVuelta);
        k.inicioVuelta = c.tiempo;
        k.eventos.push(k.vuelta > c.vueltas ? 'meta' : 'vuelta');
      }
      if (k.vuelta > c.vueltas && !k.terminado) {
        k.terminado = true;
        k.tiempoFinal = c.tiempo;
        c.terminados += 1;
        k.lugarFinal = c.terminados;
      }
    }
  }
  // progreso para ordenar (no se puede inflar cortando ni yendo en reversa)
  const finCp = (k.cp + 1) * largoSector;
  let sEf = s;
  if (sEf > finCp + pista.largo / 2) sEf -= pista.largo;
  sEf = Math.min(sEf, finCp + largoSector);
  k.progreso = (k.vuelta - 1) * pista.largo + sEf;
}

export function actualizarPuestos(c) {
  const orden = [...c.karts].sort((a, b) => {
    if (a.terminado && b.terminado) return a.lugarFinal - b.lugarFinal;
    if (a.terminado) return -1;
    if (b.terminado) return 1;
    return b.progreso - a.progreso;
  });
  orden.forEach((k, i) => {
    k.puesto = i + 1;
  });
  return orden;
}

// ---------------- Inteligencia de los rivales ----------------
function curvaAdelante(pista, indice, distancia) {
  const pasos = Math.max(1, Math.round(distancia / pista.paso));
  let max = 0;
  for (let j = 4; j < pasos; j += 2) max = Math.max(max, pista.curva[(indice + j) % pista.n]);
  return max;
}

export function entradaCPU(c, k, dt) {
  const { pista } = c;
  const hab = c.habilidad;
  const cpu = k.cpu;
  if (c.fase !== 'carrera') return ENTRADA_VACIA;

  // Atascado: echa reversa un momento
  if (cpu.reversa > 0) {
    cpu.reversa -= dt;
    return { acel: 0, freno: 1, giro: -Math.sign(k.lateral || 1), derrape: false, objeto: false };
  }
  if (Math.abs(k.vel) < 40 && k.giroLoco <= 0) k.atascado += dt;
  else k.atascado = 0;
  if (k.atascado > 1.2) {
    k.atascado = 0;
    cpu.reversa = 0.9;
  }

  // Cambia de carril de vez en cuando
  cpu.cambio -= dt;
  if (cpu.cambio <= 0) {
    cpu.desvio = (c.azar() * 2 - 1) * 0.45;
    cpu.cambio = 2 + c.azar() * 3;
  }
  const s = k.indice * pista.paso;
  let desvio = cpu.desvio * pista.mitad;

  // Busca cajas si no tiene objeto
  if (!k.objeto && k.ruleta <= 0) {
    for (const caja of c.cajas) {
      if (!caja.activa) continue;
      const dx = caja.x - k.x;
      const dy = caja.y - k.y;
      const delante = dx * Math.cos(k.ang) + dy * Math.sin(k.ang);
      if (delante > 40 && delante < 260 && Math.hypot(dx, dy) < 280) {
        const lat = dx * -pista.ty[k.indice] + dy * pista.tx[k.indice];
        desvio = k.lateral + lat;
        break;
      }
    }
  }
  // Esquiva charcos
  for (const ch of c.charcos) {
    const dx = ch.x - k.x;
    const dy = ch.y - k.y;
    const delante = dx * Math.cos(k.ang) + dy * Math.sin(k.ang);
    if (delante > 0 && delante < 220) {
      const lat = dx * -pista.ty[k.indice] + dy * pista.tx[k.indice];
      if (Math.abs(lat - (desvio - k.lateral)) < 55) desvio = k.lateral + lat + (lat > 0 ? -70 : 70);
    }
  }
  desvio = Math.max(-pista.mitad * 0.75, Math.min(pista.mitad * 0.75, desvio));

  const mirar = 110 + Math.max(0, k.vel) * 0.42;
  const objetivo = puntoEn(pista, s + mirar, desvio);
  const angObj = Math.atan2(objetivo.y - k.y, objetivo.x - k.x);
  let giro = angDif(angObj, k.ang) * 2.4;
  giro += Math.sin(c.tiempo * 1.7 + cpu.ruido) * hab.error * 0.5;
  giro = Math.max(-1, Math.min(1, giro));

  // Velocidad según la curva que viene
  const curv = curvaAdelante(pista, k.indice, 90 + Math.max(0, k.vel) * 0.75);
  const lateralMax = 1250 * pista.agarre * k.piloto.manejo;
  let vObjetivo = Math.min(F.VMAX * k.piloto.velocidad * hab.velocidad, curv > 0 ? Math.sqrt(lateralMax / curv) : Infinity);

  // Un poco de "goma elástica" para que la carrera sea pareja
  const humanos = c.karts.filter((o) => o.humano);
  if (humanos.length) {
    const mejorHumano = Math.max(...humanos.map((h) => h.progreso));
    const ventaja = k.progreso - mejorHumano;
    if (ventaja > 900) vObjetivo *= 0.92;
    else if (ventaja < -900) vObjetivo *= 1.06;
  }

  let acel = 1;
  let freno = 0;
  if (k.vel > vObjetivo + 25) {
    acel = 0;
    freno = Math.min(1, (k.vel - vObjetivo) / 200);
  } else if (k.vel > vObjetivo) {
    acel = 0;
  }

  // Los buenos derrapan en curvas largas
  const derrape = hab.velocidad >= 0.94 && curv > 0.0032 && k.vel > 280 && Math.abs(giro) > 0.35;

  // Objetos
  let objeto = false;
  if (k.objeto && k.ruleta <= 0) {
    cpu.tenencia += dt;
    if (c.azar() < hab.objetos * dt * 2) {
      const atras = c.karts.some((o) => o !== k && o.progreso < k.progreso && k.progreso - o.progreso < 260);
      const adelante = c.karts.some((o) => o !== k && o.progreso > k.progreso && o.progreso - k.progreso < 900);
      const charcoCerca = c.charcos.some((ch) => Math.hypot(ch.x - k.x, ch.y - k.y) < 190);
      switch (k.objeto) {
        case 'cohete': objeto = curv < 0.0018 || cpu.tenencia > 6; break;
        case 'aceite': objeto = atras || cpu.tenencia > 5; break;
        case 'iman': objeto = (k.puesto > 1 && adelante) || cpu.tenencia > 7; break;
        case 'escudo': objeto = true; break;
        case 'tinta': objeto = k.puesto > 1; break;
        case 'resorte': objeto = charcoCerca || (k.fuera && cpu.tenencia > 1) || cpu.tenencia > 6; break;
        default: objeto = true;
      }
    }
  } else {
    cpu.tenencia = 0;
  }

  return { acel, freno, giro, derrape, objeto };
}

// ---------------- Paso de la carrera ----------------
export function pasoCarrera(c, entradas = {}, dt = 1 / 60) {
  if (c.fase === 'fin') return c;
  if (c.fase === 'cuenta') {
    const antes = Math.ceil(c.cuenta);
    c.cuenta -= dt;
    if (Math.ceil(c.cuenta) !== antes && c.cuenta > 0) c.eventos.push('cuenta' + Math.ceil(c.cuenta));
    if (c.cuenta <= 0) {
      c.fase = 'carrera';
      c.eventos.push('ya');
    }
    return c;
  }
  c.tiempo += dt;
  const { pista } = c;

  for (const k of c.karts) {
    let e;
    if (k.humano && !k.terminado) e = entradas[k.jugador] ?? ENTRADA_VACIA;
    else e = entradaCPU(c, k, dt); // al terminar, el kart del jugador sigue solo
    if (e.objeto) usarObjeto(c, k);
    if (k.ruleta > 0) k.ruleta = Math.max(0, k.ruleta - dt);
    pasoKart(k, e, pista, dt);
    actualizarVuelta(c, k);

    // Pads de turbo
    const s = k.indice * pista.paso;
    for (const t of c.turbos) {
      let ds = s - t.s;
      if (ds > pista.largo / 2) ds -= pista.largo;
      if (ds < -pista.largo / 2) ds += pista.largo;
      if (ds >= -t.largo / 2 && ds <= t.largo / 2 && Math.abs(k.lateral) < t.ancho && k.salto <= 0) {
        if (k.turbo < 0.5) k.eventos.push('turboPad');
        k.turbo = Math.max(k.turbo, 0.75);
      }
    }
    // Cajas de objetos
    for (const caja of c.cajas) {
      if (!caja.activa) continue;
      if (Math.hypot(caja.x - k.x, caja.y - k.y) < RADIO_CAJA + F.RADIO * 0.5) {
        caja.activa = false;
        caja.reaparece = 3;
        if (!k.objeto && k.ruleta <= 0) {
          k.objeto = sortearObjeto(k.puesto, c.karts.length, c.azar);
          k.ruleta = 1;
          k.eventos.push('caja');
        }
      }
    }
  }

  // Cajas que reaparecen
  for (const caja of c.cajas) {
    if (!caja.activa) {
      caja.reaparece -= dt;
      if (caja.reaparece <= 0) caja.activa = true;
    }
  }

  // Charcos de aceite
  c.charcos = c.charcos.filter((ch) => {
    ch.vida -= dt;
    ch.gracia -= dt;
    if (ch.vida <= 0) return false;
    for (const k of c.karts) {
      if (ch.dueno === k.id && ch.gracia > 0) continue;
      if (Math.hypot(ch.x - k.x, ch.y - k.y) < RADIO_CHARCO + F.RADIO * 0.6) {
        const r = golpearConAceite(k);
        if (r !== 'salto') return false;
      }
    }
    return true;
  });

  // Choques entre karts
  const ks = c.karts;
  for (let i = 0; i < ks.length; i++) {
    for (let j = i + 1; j < ks.length; j++) {
      const a = ks[i];
      const b = ks[j];
      if ((a.salto > 0) !== (b.salto > 0)) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      const min = F.RADIO * 2;
      if (d > 0 && d < min) {
        const empuje = (min - d) / 2;
        const nx = dx / d;
        const ny = dy / d;
        a.x -= nx * empuje;
        a.y -= ny * empuje;
        b.x += nx * empuje;
        b.y += ny * empuje;
        const dv = (b.vel - a.vel) * 0.25;
        a.vel += dv;
        b.vel -= dv;
        if (Math.abs(dv) > 30) {
          a.eventos.push('toque');
          b.eventos.push('toque');
        }
      }
    }
  }

  actualizarPuestos(c);

  // Fin: cuando todos los humanos terminan (o, sin humanos, todos los karts)
  const humanos = ks.filter((k) => k.humano);
  const todosListos = humanos.length ? humanos.every((k) => k.terminado) : ks.every((k) => k.terminado);
  if (todosListos) {
    // Los que no alcanzaron a llegar se ordenan por su progreso
    const orden = actualizarPuestos(c);
    orden.forEach((k) => {
      if (!k.terminado) {
        k.terminado = true;
        c.terminados += 1;
        k.lugarFinal = c.terminados;
        k.tiempoFinal = null; // no llegó
      }
    });
    actualizarPuestos(c);
    c.fase = 'fin';
    c.eventos.push('fin');
  }
  return c;
}

export function resultados(c) {
  return [...c.karts]
    .sort((a, b) => a.puesto - b.puesto)
    .map((k) => ({
      id: k.id,
      piloto: k.piloto,
      humano: k.humano,
      jugador: k.jugador,
      puesto: k.puesto,
      tiempo: k.tiempoFinal,
      mejorVuelta: k.tiemposVuelta.length ? Math.min(...k.tiemposVuelta) : null,
    }));
}

export function formatoTiempo(seg) {
  if (seg == null) return '—';
  const m = Math.floor(seg / 60);
  const s = seg - m * 60;
  return `${m}:${s.toFixed(2).padStart(5, '0')}`;
}
