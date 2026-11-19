// Dibujo de Turbo Karts en canvas 2D (todo procedural, sin imágenes externas).
import { puntoCercano } from './logica/pistas.js';
import { OBJETOS, ORDEN_OBJETOS } from './logica/objetos.js';
import { F, nivelDerrape } from './logica/fisica.js';
import { formatoTiempo } from './logica/carrera.js';

function azarSemilla(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function trazoPista(ctx, pista, ox, oy) {
  ctx.beginPath();
  ctx.moveTo(pista.xs[0] - ox, pista.ys[0] - oy);
  for (let i = 1; i < pista.n; i++) ctx.lineTo(pista.xs[i] - ox, pista.ys[i] - oy);
  ctx.closePath();
}

// ---------- Decoraciones vistas desde arriba ----------
function decoracion(ctx, tipo, x, y, r, rnd) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rnd() * Math.PI * 2);
  // sombra
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(r * 0.25, r * 0.3, r, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  if (tipo === 'palmera') {
    for (let i = 0; i < 7; i++) {
      ctx.rotate((Math.PI * 2) / 7);
      ctx.fillStyle = i % 2 ? '#2f9e44' : '#37b24d';
      ctx.beginPath();
      ctx.ellipse(r * 0.55, 0, r * 0.6, r * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#8d6e3f';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (tipo === 'edificio') {
    const w = r * 1.6;
    const h = r * (1.2 + rnd());
    ctx.fillStyle = '#2b2f4a';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = rnd() > 0.5 ? '#ff3fa4' : '#24e1ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    for (let i = -w / 2 + 8; i < w / 2 - 6; i += 14) {
      for (let j = -h / 2 + 8; j < h / 2 - 6; j += 14) {
        if (rnd() > 0.45) {
          ctx.fillStyle = rnd() > 0.5 ? '#fff36b' : '#9be7ff';
          ctx.fillRect(i, j, 6, 6);
        }
      }
    }
  } else if (tipo === 'pino') {
    [[1, '#1e5e3a'], [0.72, '#2b7a4b'], [0.44, '#3f9a5f']].forEach(([f, c]) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const rr = r * f * (i % 2 ? 0.7 : 1);
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.2, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  } else if (tipo === 'roca') {
    ctx.fillStyle = '#3b3030';
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const rr = r * (0.7 + rnd() * 0.35);
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ff8a2a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.1);
    ctx.lineTo(0, r * 0.15);
    ctx.lineTo(r * 0.35, -r * 0.2);
    ctx.stroke();
  } else if (tipo === 'cactus') {
    ctx.fillStyle = '#4f8a3a';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.28, r * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.45, -r * 0.15, r * 0.4, r * 0.16, 0, 0, Math.PI * 2);
    ctx.ellipse(-r * 0.4, r * 0.25, r * 0.35, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff6fa3';
    ctx.beginPath();
    ctx.arc(0, -r * 0.85, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------- El circuito se pinta una sola vez en un lienzo grande ----------
const cacheMundo = new Map();

export function prepararMundo(pista) {
  if (cacheMundo.has(pista.id)) return cacheMundo.get(pista.id);
  cacheMundo.clear(); // solo una pista en memoria
  const { minX, minY, maxX, maxY } = pista.limites;
  const w = Math.ceil(maxX - minX);
  const h = Math.ceil(maxY - minY);
  const lienzo = document.createElement('canvas');
  lienzo.width = w;
  lienzo.height = h;
  const ctx = lienzo.getContext('2d');
  const t = pista.tema;
  const rnd = azarSemilla(pista.id.length * 9973 + pista.n);

  // Terreno con textura
  ctx.fillStyle = t.fondo;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < (w * h) / 900; i++) {
    ctx.fillStyle = rnd() > 0.5 ? t.fondo2 : 'rgba(255,255,255,0.05)';
    const r = 2 + rnd() * 9;
    ctx.fillRect(rnd() * w, rnd() * h, r, r);
  }

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // Muro
  trazoPista(ctx, pista, minX, minY);
  ctx.strokeStyle = t.muro;
  ctx.lineWidth = pista.muro * 2 + 16;
  ctx.stroke();
  // Pasto / arena / lava
  ctx.strokeStyle = t.fuera;
  ctx.lineWidth = pista.muro * 2;
  ctx.stroke();
  if (t.lava) {
    ctx.strokeStyle = 'rgba(255, 210, 74, 0.35)';
    ctx.lineWidth = pista.muro * 2 - 30;
    ctx.setLineDash([40, 70]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // Pianos (bordes a rayas)
  ctx.strokeStyle = t.borde1;
  ctx.lineWidth = pista.ancho + 18;
  ctx.stroke();
  ctx.strokeStyle = t.borde2;
  ctx.setLineDash([26, 26]);
  ctx.stroke();
  ctx.setLineDash([]);
  // Asfalto
  ctx.strokeStyle = t.asfalto;
  ctx.lineWidth = pista.ancho;
  ctx.stroke();
  // Textura del asfalto
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = pista.ancho * 0.6;
  ctx.setLineDash([3, 9]);
  ctx.stroke();
  ctx.setLineDash([]);
  // Línea central
  ctx.strokeStyle = t.linea;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 3;
  ctx.setLineDash([30, 40]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  // Línea de meta a cuadros
  {
    const x = pista.xs[0] - minX;
    const y = pista.ys[0] - minY;
    const ang = Math.atan2(pista.ty[0], pista.tx[0]);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const cuadro = 12;
    for (let i = -pista.mitad; i < pista.mitad; i += cuadro) {
      for (let j = 0; j < 3; j++) {
        ctx.fillStyle = (Math.round(i / cuadro) + j) % 2 ? '#111' : '#fff';
        ctx.fillRect(j * cuadro - cuadro * 1.5, i, cuadro, cuadro);
      }
    }
    ctx.restore();
  }

  // Decoraciones fuera del circuito
  const cantidad = Math.round((w * h) / 52000);
  for (let i = 0; i < cantidad; i++) {
    const x = minX + rnd() * w;
    const y = minY + rnd() * h;
    const c = puntoCercano(pista, x, y);
    const r = 18 + rnd() * 22;
    if (c.distancia > pista.muro + r + 25) decoracion(ctx, t.deco, x - minX, y - minY, r, rnd);
  }

  const mundo = { lienzo, ox: minX, oy: minY, w, h };
  cacheMundo.set(pista.id, mundo);
  return mundo;
}

// ---------- Minimapa (también se pinta una vez) ----------
const cacheMini = new Map();
function lienzoMinimapa(pista, tam) {
  const clave = pista.id + tam;
  if (cacheMini.has(clave)) return cacheMini.get(clave);
  const { minX, minY, maxX, maxY } = pista.limites;
  const escala = tam / Math.max(maxX - minX, maxY - minY);
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.ceil((maxX - minX) * escala);
  lienzo.height = Math.ceil((maxY - minY) * escala);
  const ctx = lienzo.getContext('2d');
  ctx.scale(escala, escala);
  ctx.lineJoin = 'round';
  trazoPista(ctx, pista, minX, minY);
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = pista.ancho * 1.4;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = pista.ancho * 0.6;
  ctx.stroke();
  const m = { lienzo, escala, ox: minX, oy: minY };
  cacheMini.set(clave, m);
  return m;
}

export function dibujarMiniaturaPista(canvas, pista) {
  const ctx = canvas.getContext('2d');
  const { minX, minY, maxX, maxY } = pista.limites;
  const escala = Math.min(canvas.width / (maxX - minX), canvas.height / (maxY - minY));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate((canvas.width - (maxX - minX) * escala) / 2, (canvas.height - (maxY - minY) * escala) / 2);
  ctx.scale(escala, escala);
  ctx.lineJoin = 'round';
  trazoPista(ctx, pista, minX, minY);
  ctx.strokeStyle = pista.tema.muro;
  ctx.lineWidth = pista.ancho * 1.8;
  ctx.stroke();
  ctx.strokeStyle = pista.tema.asfalto;
  ctx.lineWidth = pista.ancho;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(pista.xs[0] - minX, pista.ys[0] - minY, pista.ancho * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------- Kart ----------
function dibujarKart(ctx, k, tiempo, efectos) {
  const elevado = k.salto > 0 ? Math.sin((1 - k.salto / 0.85) * Math.PI) : 0;
  ctx.save();
  ctx.translate(k.x, k.y);
  // sombra en el piso
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(4 + elevado * 14, 6 + elevado * 14, 21 - elevado * 4, 14 - elevado * 3, k.ang, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(k.ang + (k.derrape.activo ? k.derrape.dir * 0.32 : 0));
  const esc = 1 + elevado * 0.35;
  ctx.scale(esc, esc);

  // fuego del turbo
  if (k.turbo > 0) {
    const largo = 18 + Math.sin(tiempo * 60) * 5;
    const g = ctx.createLinearGradient(-20, 0, -20 - largo, 0);
    g.addColorStop(0, '#fff6b0');
    g.addColorStop(0.4, '#ff9f1c');
    g.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-18, -7);
    ctx.lineTo(-20 - largo, 0);
    ctx.lineTo(-18, 7);
    ctx.fill();
  }
  // ruedas
  ctx.fillStyle = '#16161a';
  [[-12, -12], [-12, 12], [12, -12], [12, 12]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.roundRect(x - 6, y - 4, 12, 8, 3);
    ctx.fill();
  });
  // carrocería
  const p = k.piloto;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.roundRect(-19, -10, 38, 20, 7);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.beginPath();
  ctx.roundRect(-15, -8, 30, 6, 3);
  ctx.fill();
  // alerón y trompa
  ctx.fillStyle = p.color2;
  ctx.fillRect(-21, -11, 5, 22);
  ctx.beginPath();
  ctx.moveTo(19, -7);
  ctx.lineTo(25, 0);
  ctx.lineTo(19, 7);
  ctx.fill();
  // piloto (cabeza con casco)
  ctx.fillStyle = p.color2;
  ctx.beginPath();
  ctx.arc(-2, 0, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.rotate(Math.PI / 2);
  ctx.font = '11px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.cara, 0, 2);
  ctx.restore();

  // escudo burbuja
  if (k.escudo > 0) {
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.sin(tiempo * 8) * 0.1;
    ctx.strokeStyle = '#9be7ff';
    ctx.fillStyle = 'rgba(155,231,255,0.18)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(k.x, k.y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  // chispas del derrape
  if (k.derrape.activo && efectos) {
    const nivel = nivelDerrape(k.derrape.carga);
    const color = ['#dddddd', '#4dabf7', '#ff922b', '#cc5de8'][nivel];
    for (let i = 0; i < 2; i++) {
      const lado = i ? 1 : -1;
      const bx = k.x - Math.cos(k.ang) * 16 + Math.cos(k.ang + Math.PI / 2) * 12 * lado;
      const by = k.y - Math.sin(k.ang) * 16 + Math.sin(k.ang + Math.PI / 2) * 12 * lado;
      ctx.fillStyle = color;
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.arc(bx + (Math.random() - 0.5) * 10, by + (Math.random() - 0.5) * 10, 1.5 + Math.random() * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  // iman
  if (k.iman > 0 && k.imanObjetivo) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 80, 120, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.lineDashOffset = -tiempo * 80;
    ctx.beginPath();
    ctx.moveTo(k.x, k.y);
    ctx.lineTo(k.imanObjetivo.x, k.imanObjetivo.y);
    ctx.stroke();
    ctx.restore();
  }
}

function dibujarCaja(ctx, caja, tiempo) {
  if (!caja.activa) return;
  ctx.save();
  ctx.translate(caja.x, caja.y);
  ctx.rotate(tiempo * 1.5);
  const brillo = 0.75 + Math.sin(tiempo * 4 + caja.x) * 0.25;
  // cápsula hexagonal de energía
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 18);
  g.addColorStop(0, `rgba(255,255,255,${brillo})`);
  g.addColorStop(1, 'rgba(80, 220, 160, 0.75)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#0b6e4f';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.rotate(-tiempo * 1.5);
  ctx.fillStyle = '#0b6e4f';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦', 0, 1);
  ctx.restore();
}

function dibujarCharco(ctx, ch) {
  ctx.save();
  ctx.translate(ch.x, ch.y);
  ctx.globalAlpha = Math.min(1, ch.vida / 2);
  ctx.fillStyle = '#121212';
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 19, 0.4, 0, Math.PI * 2);
  ctx.ellipse(12, 8, 12, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createLinearGradient(-20, -15, 20, 15);
  g.addColorStop(0, 'rgba(120, 80, 255, 0.45)');
  g.addColorStop(0.5, 'rgba(60, 220, 200, 0.35)');
  g.addColorStop(1, 'rgba(255, 220, 90, 0.4)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(-4, -3, 14, 8, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function dibujarTurbos(ctx, turbos, tiempo) {
  for (const t of turbos) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.angulo);
    ctx.fillStyle = 'rgba(255, 196, 0, 0.25)';
    ctx.fillRect(-t.largo / 2, -t.ancho, t.largo, t.ancho * 2);
    for (let i = 0; i < 3; i++) {
      const fase = (tiempo * 2 + i / 3) % 1;
      ctx.globalAlpha = 0.4 + fase * 0.6;
      ctx.fillStyle = '#ffd43b';
      const x = -t.largo / 2 + i * 26 + 6;
      ctx.beginPath();
      ctx.moveTo(x, -t.ancho * 0.7);
      ctx.lineTo(x + 18, 0);
      ctx.lineTo(x, t.ancho * 0.7);
      ctx.lineTo(x + 8, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

// ---------- Cámara ----------
export function crearCamara(k) {
  return { x: k.x, y: k.y, ang: k.ang, zoom: 1, temblor: 0 };
}

export function moverCamara(cam, k, dt, tranquilo) {
  const suave = 1 - Math.exp(-dt * 6);
  cam.x += (k.x - cam.x) * Math.min(1, suave * 2.2);
  cam.y += (k.y - cam.y) * Math.min(1, suave * 2.2);
  let d = k.ang - cam.ang;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  cam.ang += d * Math.min(1, dt * 4.2);
  const fr = Math.min(1.4, Math.max(0, k.vel) / F.VMAX);
  const zoomObj = 1.12 - fr * 0.22;
  cam.zoom += (zoomObj - cam.zoom) * Math.min(1, dt * 2);
  if (tranquilo) cam.temblor = 0;
  cam.temblor = Math.max(0, cam.temblor - dt * 3);
}

// ---------- Escena de una vista ----------
export function dibujarVista(ctx, vista, carrera, k, cam, opciones) {
  const { x, y, w, h, dpr } = vista;
  const { pista } = carrera;
  const mundo = prepararMundo(pista);
  const base = (Math.min(w, h * 1.5) / 980) * cam.zoom;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = pista.tema.fondo;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  const sx = cam.temblor > 0 ? (Math.random() - 0.5) * cam.temblor * 14 * dpr : 0;
  const sy = cam.temblor > 0 ? (Math.random() - 0.5) * cam.temblor * 14 * dpr : 0;
  ctx.translate(x + w / 2 + sx, y + h * 0.68 + sy);
  ctx.scale(base, base);
  ctx.rotate(-cam.ang - Math.PI / 2);
  ctx.translate(-cam.x, -cam.y);
  ctx.drawImage(mundo.lienzo, mundo.ox, mundo.oy);
  dibujarTurbos(ctx, carrera.turbos, opciones.tiempo);
  carrera.charcos.forEach((ch) => dibujarCharco(ctx, ch));
  carrera.cajas.forEach((c) => dibujarCaja(ctx, c, opciones.tiempo));
  // primero los que están en el piso, luego los que saltan
  const orden = [...carrera.karts].sort((a, b) => (a.salto > 0) - (b.salto > 0));
  orden.forEach((o) => dibujarKart(ctx, o, opciones.tiempo, opciones.efectos));
  ctx.restore();

  // Etiquetas de los jugadores sobre su kart (en pantalla, sin rotar)
  const aPantalla = (px, py) => {
    const dx = px - cam.x;
    const dy = py - cam.y;
    const a = -cam.ang - Math.PI / 2;
    return [
      x + w / 2 + (dx * Math.cos(a) - dy * Math.sin(a)) * base,
      y + h * 0.68 + (dx * Math.sin(a) + dy * Math.cos(a)) * base,
    ];
  };
  ctx.font = `700 ${Math.round(13 * dpr)}px Fredoka, sans-serif`;
  ctx.textAlign = 'center';
  carrera.karts.forEach((o) => {
    if (!o.humano) return;
    const [px, py] = aPantalla(o.x, o.y);
    if (px < x || px > x + w || py < y || py > y + h) return;
    const texto = `J${o.jugador + 1}`;
    ctx.fillStyle = o.jugador === 0 ? '#ff4d6d' : '#3a86ff';
    ctx.beginPath();
    ctx.roundRect(px - 16 * dpr, py - 46 * dpr * Math.max(0.6, base), 32 * dpr, 18 * dpr, 6 * dpr);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(texto, px, py - 46 * dpr * Math.max(0.6, base) + 13 * dpr);
  });

  // Mancha de tinta
  if (k.tinta > 0) {
    const fuerza = Math.min(1, k.tinta / 1.2);
    const rnd = azarSemilla(7);
    ctx.fillStyle = `rgba(20, 10, 40, ${0.82 * fuerza})`;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.arc(x + rnd() * w, y + rnd() * h * 0.8, (60 + rnd() * 120) * dpr * fuerza, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  dibujarHUD(ctx, vista, carrera, k, opciones);
  ctx.restore();
}

function caja(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function dibujarHUD(ctx, vista, carrera, k, opciones) {
  const { x, y, w, h, dpr } = vista;
  const u = dpr * Math.max(0.7, Math.min(1.2, Math.min(w / dpr, h / dpr * 1.6) / 760));
  const m = 12 * u;
  ctx.textBaseline = 'alphabetic';

  // Puesto
  const total = carrera.karts.length;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  caja(ctx, x + m, y + m, 104 * u, 70 * u, 14 * u);
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.fillStyle = k.puesto === 1 ? '#ffd43b' : '#ffffff';
  ctx.font = `800 ${Math.round(48 * u)}px Fredoka, sans-serif`;
  ctx.fillText(`${k.puesto}º`, x + m + 12 * u, y + m + 52 * u);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `600 ${Math.round(16 * u)}px Fredoka, sans-serif`;
  ctx.fillText(`/${total}`, x + m + 70 * u, y + m + 52 * u);

  // Vuelta y tiempo
  const vuelta = Math.max(1, Math.min(carrera.vueltas, k.vuelta));
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  caja(ctx, x + w - m - 150 * u, y + m, 150 * u, 70 * u, 14 * u);
  ctx.fill();
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff';
  ctx.font = `700 ${Math.round(22 * u)}px Fredoka, sans-serif`;
  ctx.fillText(`Vuelta ${vuelta}/${carrera.vueltas}`, x + w - m - 12 * u, y + m + 30 * u);
  ctx.font = `600 ${Math.round(17 * u)}px Fredoka, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  const tVuelta = k.terminado ? k.tiempoFinal : carrera.tiempo - (k.vuelta >= 1 ? k.inicioVuelta : 0);
  ctx.fillText(k.terminado ? `Total ${formatoTiempo(k.tiempoFinal)}` : `⏱ ${formatoTiempo(Math.max(0, tVuelta))}`, x + w - m - 12 * u, y + m + 56 * u);

  // Objeto
  const cx = x + w / 2;
  const tam = 64 * u;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  caja(ctx, cx - tam / 2, y + m, tam, tam, 16 * u);
  ctx.fill();
  ctx.strokeStyle = k.objeto ? '#ffd43b' : 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 3 * u;
  ctx.stroke();
  let icono = null;
  if (k.ruleta > 0) icono = OBJETOS[ORDEN_OBJETOS[Math.floor(opciones.tiempo * 14) % ORDEN_OBJETOS.length]].icono;
  else if (k.objeto) icono = OBJETOS[k.objeto].icono;
  if (icono) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(36 * u)}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.fillText(icono, cx, y + m + tam / 2 + 2 * u);
    ctx.textBaseline = 'alphabetic';
  }
  if (k.objeto && k.ruleta <= 0 && opciones.teclaObjeto) {
    ctx.textAlign = 'center';
    ctx.font = `600 ${Math.round(12 * u)}px Fredoka, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(opciones.teclaObjeto, cx, y + m + tam + 16 * u);
  }

  // Velocímetro
  const vel = Math.max(0, Math.round(k.vel / 5));
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  caja(ctx, x + m, y + h - m - 50 * u, 120 * u, 50 * u, 12 * u);
  ctx.fill();
  ctx.fillStyle = k.turbo > 0 ? '#ffd43b' : '#fff';
  ctx.font = `800 ${Math.round(28 * u)}px Fredoka, sans-serif`;
  ctx.fillText(`${vel}`, x + m + 12 * u, y + h - m - 16 * u);
  ctx.font = `600 ${Math.round(13 * u)}px Fredoka, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('km/h', x + m + 66 * u, y + h - m - 16 * u);

  // Minimapa
  const tamMini = Math.round(Math.min(150 * u, w * 0.3, h * 0.3));
  const mini = lienzoMinimapa(carrera.pista, tamMini);
  const mx = x + w - m - mini.lienzo.width;
  const my = y + h - m - mini.lienzo.height;
  ctx.globalAlpha = 0.85;
  ctx.drawImage(mini.lienzo, mx, my);
  ctx.globalAlpha = 1;
  carrera.karts.forEach((o) => {
    const px = mx + (o.x - mini.ox) * mini.escala;
    const py = my + (o.y - mini.oy) * mini.escala;
    ctx.fillStyle = o.piloto.color;
    ctx.beginPath();
    ctx.arc(px, py, (o === k ? 6 : 4) * u, 0, Math.PI * 2);
    ctx.fill();
    if (o.humano) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2 * u;
      ctx.stroke();
    }
  });

  // Avisos centrales
  ctx.textAlign = 'center';
  let aviso = null;
  if (k.terminado) aviso = { texto: `¡Llegaste ${k.puesto}º!`, color: k.puesto === 1 ? '#ffd43b' : '#fff' };
  else if (k.contrario > 1) aviso = { texto: '⚠️ ¡Sentido contrario!', color: '#ff6b6b' };
  else if (k.vuelta === carrera.vueltas && carrera.tiempo - k.inicioVuelta < 2.5) aviso = { texto: '¡Última vuelta!', color: '#ffd43b' };
  else if (k.vuelta > 1 && carrera.tiempo - k.inicioVuelta < 2) aviso = { texto: `Vuelta ${k.vuelta}`, color: '#fff' };
  if (aviso) {
    ctx.font = `800 ${Math.round(36 * u)}px Fredoka, sans-serif`;
    ctx.lineWidth = 6 * u;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.strokeText(aviso.texto, cx, y + h * 0.3);
    ctx.fillStyle = aviso.color;
    ctx.fillText(aviso.texto, cx, y + h * 0.3);
  }
}

// ---------- Semáforo de la cuenta regresiva ----------
export function dibujarSemaforo(ctx, ancho, alto, cuenta, dpr) {
  if (cuenta <= -1) return;
  const u = dpr * Math.max(0.8, Math.min(1.4, ancho / dpr / 900));
  const w = 230 * u;
  const h = 84 * u;
  const x = ancho / 2 - w / 2;
  const y = alto * 0.12;
  ctx.save();
  ctx.globalAlpha = cuenta < 0 ? Math.max(0, 1 + cuenta) : 1;
  ctx.fillStyle = '#1a1a1a';
  caja(ctx, x, y, w, h, 18 * u);
  ctx.fill();
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 3 * u;
  ctx.stroke();
  const encendidas = cuenta > 0 ? 3 - Math.ceil(cuenta) + 1 : 3;
  for (let i = 0; i < 3; i++) {
    let color = '#3a1515';
    if (cuenta <= 0) color = '#40ff7a';
    else if (i < encendidas) color = '#ff3b3b';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = color === '#3a1515' ? 0 : 20 * u;
    ctx.beginPath();
    ctx.arc(x + w * (0.22 + i * 0.28), y + h / 2, 24 * u, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.font = `800 ${Math.round(64 * u)}px Fredoka, sans-serif`;
  const texto = cuenta > 3 ? '¿Listos?' : cuenta > 0 ? String(Math.ceil(cuenta)) : '¡YA!';
  ctx.lineWidth = 8 * u;
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.strokeText(texto, ancho / 2, y + h + 76 * u);
  ctx.fillStyle = cuenta > 0 ? '#fff' : '#40ff7a';
  ctx.fillText(texto, ancho / 2, y + h + 76 * u);
  ctx.restore();
}

// División de pantalla: 1 o 2 vistas
export function calcularVistas(ancho, alto, cantidad, dpr) {
  if (cantidad < 2) return [{ x: 0, y: 0, w: ancho, h: alto, dpr }];
  const separador = Math.round(4 * dpr);
  if (ancho >= alto * 1.15) {
    const w = Math.floor((ancho - separador) / 2);
    return [
      { x: 0, y: 0, w, h: alto, dpr },
      { x: w + separador, y: 0, w: ancho - w - separador, h: alto, dpr },
    ];
  }
  const h = Math.floor((alto - separador) / 2);
  return [
    { x: 0, y: 0, w: ancho, h, dpr },
    { x: 0, y: h + separador, w: ancho, h: alto - h - separador, dpr },
  ];
}
