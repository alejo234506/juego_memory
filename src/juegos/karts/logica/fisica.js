// Física arcade de un kart. Pura: recibe el kart, la entrada y la pista, y lo modifica.
import { angDif, puntoCercano } from './pistas.js';

export const F = {
  VMAX: 540,
  ACEL: 430,
  FRENO: 950,
  REVERSA: 170,
  ROCE: 170,
  GIRO: 2.75,
  RADIO: 15,
  FUERA_MAX: 0.45, // fracción de la velocidad máxima en el pasto
  LAVA_MAX: 0.32,
  TURBO_MAX: 1.38,
  TURBO_ACEL: 1300,
  DERRAPE_MIN_VEL: 210,
  NIVELES_DERRAPE: [0.75, 1.5, 2.3], // segundos de carga para azul, naranja, morado
  TURBO_DERRAPE: [0.5, 0.9, 1.3],
};

export const ENTRADA_VACIA = Object.freeze({ acel: 0, freno: 0, giro: 0, derrape: false, objeto: false });

export function crearKart({ id, piloto, x, y, angulo, humano = false, jugador = null, pista }) {
  const cerca = puntoCercano(pista, x, y);
  return {
    id,
    piloto,
    humano,
    jugador,
    x,
    y,
    ang: angulo,
    dirVel: angulo,
    vel: 0,
    indice: cerca.indice,
    lateral: cerca.lateral,
    fuera: false,
    // vueltas
    vuelta: 0,
    cp: 0,
    terminado: false,
    tiempoFinal: null,
    tiemposVuelta: [],
    inicioVuelta: 0,
    puesto: 1,
    progreso: 0,
    // estados
    objeto: null,
    ruleta: 0, // tiempo que queda de la ruleta de objeto
    derrape: { activo: false, dir: 0, carga: 0 },
    turbo: 0,
    giroLoco: 0, // trompo por aceite
    salto: 0,
    escudo: 0,
    tinta: 0,
    iman: 0,
    imanObjetivo: null,
    contrario: 0,
    atascado: 0,
    eventos: [],
  };
}

export function nivelDerrape(carga) {
  let n = 0;
  F.NIVELES_DERRAPE.forEach((umbral, i) => {
    if (carga >= umbral) n = i + 1;
  });
  return n;
}

const limitar = (v, a, b) => Math.max(a, Math.min(b, v));

export function pasoKart(k, entrada, pista, dt) {
  const p = k.piloto;
  const vmaxBase = F.VMAX * p.velocidad;
  const enAire = k.salto > 0;
  let e = entrada;

  // Trompo: no se controla el kart
  if (k.giroLoco > 0) {
    k.giroLoco -= dt;
    k.ang += 9 * dt;
    k.vel *= Math.max(0, 1 - 2.6 * dt);
    e = ENTRADA_VACIA;
    k.derrape.activo = false;
    k.derrape.carga = 0;
  }

  // Velocidad máxima según terreno y turbo
  let vmax = vmaxBase;
  if (k.fuera && !enAire) vmax *= pista.tema.lava ? F.LAVA_MAX : F.FUERA_MAX;
  if (k.turbo > 0) vmax = Math.max(vmax, vmaxBase * (k.fuera && !enAire ? 0.8 : F.TURBO_MAX));
  if (k.iman > 0) vmax *= 1.12;

  // Acelerar, frenar, reversa
  if (k.turbo > 0) {
    // El turbo empuja fuerte pero nunca pasa de su propio tope
    if (k.vel < vmax) k.vel = Math.min(vmax, k.vel + F.TURBO_ACEL * dt);
    k.turbo -= dt;
  } else if (e.acel > 0 && k.vel >= -5) {
    // La aceleración baja al acercarse al máximo (curva suave)
    const falta = Math.max(0, 1 - k.vel / vmax);
    k.vel += F.ACEL * p.aceleracion * e.acel * (0.35 + 0.65 * falta) * dt;
  } else if (e.freno > 0) {
    if (k.vel > 0) k.vel -= F.FRENO * e.freno * dt;
    else k.vel -= F.ACEL * 0.6 * e.freno * dt;
  } else {
    // rodando sin pedal
    const roce = F.ROCE * dt;
    k.vel = Math.abs(k.vel) <= roce ? 0 : k.vel - Math.sign(k.vel) * roce;
  }
  if (e.acel > 0 && k.vel < 0 && e.freno === 0) k.vel += F.FRENO * dt; // acelerar sale de la reversa

  // Por encima del máximo se frena gradualmente (no de golpe)
  if (k.vel > vmax) k.vel = Math.max(vmax, k.vel - (k.fuera ? 900 : 500) * dt);
  if (k.vel < -F.REVERSA) k.vel = -F.REVERSA;

  // Derrape y mini-turbo
  const d = k.derrape;
  if (!d.activo && e.derrape && Math.abs(e.giro) > 0.3 && k.vel > F.DERRAPE_MIN_VEL && !enAire && k.giroLoco <= 0) {
    d.activo = true;
    d.dir = Math.sign(e.giro);
    d.carga = 0;
    k.eventos.push('derrape');
  }
  if (d.activo) {
    if (!e.derrape || k.vel < F.DERRAPE_MIN_VEL * 0.7) {
      const nivel = nivelDerrape(d.carga);
      if (nivel > 0 && e.derrape === false) {
        k.turbo = Math.max(k.turbo, F.TURBO_DERRAPE[nivel - 1]);
        k.eventos.push('miniturbo' + nivel);
      }
      d.activo = false;
      d.carga = 0;
      d.dir = 0;
    } else {
      // En la dirección del derrape se carga más rápido si se gira fuerte hacia ese lado
      const mismoLado = Math.sign(e.giro) === d.dir ? Math.abs(e.giro) : 0;
      d.carga += dt * (0.55 + 0.45 * mismoLado) * (k.fuera ? 0.3 : 1);
    }
  }

  // Giro
  const factorVel = limitar(Math.abs(k.vel) / 150, 0, 1) * (1 - 0.22 * limitar(k.vel / F.VMAX, 0, 1));
  let giro = e.giro;
  if (d.activo) giro = limitar(d.dir * 0.62 + e.giro * 0.55, -1.2, 1.2);
  if (k.tinta > 0 && !k.humano) giro += Math.sin(k.tinta * 11) * 0.5; // los CPU ven mal con tinta
  let tasa = F.GIRO * p.manejo * factorVel * (d.activo ? 1.22 : 1) * (enAire ? 0.35 : 1);
  k.ang += giro * tasa * dt * (k.vel >= 0 ? 1 : -1);

  // Imán: empuja suavemente hacia el rival de adelante
  if (k.iman > 0) {
    k.iman -= dt;
    const obj = k.imanObjetivo;
    if (obj) {
      const haciaObj = Math.atan2(obj.y - k.y, obj.x - k.x);
      k.ang += angDif(haciaObj, k.ang) * Math.min(1, 1.6 * dt);
      k.vel += 220 * dt;
    }
  }

  // La dirección real del movimiento sigue a la nariz del kart (con poco agarre derrapa)
  const agarre = d.activo ? 3.4 : 10 * pista.agarre;
  k.dirVel += angDif(k.ang, k.dirVel) * Math.min(1, agarre * dt);

  // Mover
  k.x += Math.cos(k.dirVel) * k.vel * dt;
  k.y += Math.sin(k.dirVel) * k.vel * dt;

  // Ubicación respecto a la pista
  const c = puntoCercano(pista, k.x, k.y, k.indice);
  k.indice = c.indice;
  k.lateral = c.lateral;
  k.fuera = Math.abs(c.lateral) > pista.mitad;

  // Muro
  const limite = pista.muro - F.RADIO;
  if (Math.abs(c.lateral) > limite) {
    const lado = Math.sign(c.lateral);
    const i = c.indice;
    const nx = -pista.ty[i];
    const ny = pista.tx[i];
    k.x = pista.xs[i] + nx * lado * limite;
    k.y = pista.ys[i] + ny * lado * limite;
    k.lateral = lado * limite;
    if (Math.abs(k.vel) > 140) k.eventos.push('choque');
    k.vel *= 0.62;
    // rebote: la dirección se acerca a la de la pista
    const angPista = Math.atan2(pista.ty[i], pista.tx[i]) + (k.vel < 0 ? Math.PI : 0);
    k.dirVel += angDif(angPista, k.dirVel) * 0.6;
    k.ang += angDif(angPista, k.ang) * 0.25;
    if (d.activo) {
      d.activo = false;
      d.carga = 0;
    }
  }

  // Temporizadores
  if (k.salto > 0) k.salto = Math.max(0, k.salto - dt);
  if (k.escudo > 0) k.escudo = Math.max(0, k.escudo - dt);
  if (k.tinta > 0) k.tinta = Math.max(0, k.tinta - dt);
  if (k.turbo < 0) k.turbo = 0;

  // ¿Va en sentido contrario?
  const angPista = Math.atan2(pista.ty[k.indice], pista.tx[k.indice]);
  if (Math.abs(angDif(k.ang, angPista)) > 2.0 && Math.abs(k.vel) > 60) k.contrario += dt;
  else k.contrario = Math.max(0, k.contrario - dt * 2);
}
