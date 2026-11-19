import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TAMANOS,
  ORDEN_TAMANOS,
  HUECO,
  tableroResuelto,
  mezclar,
  mover,
  moverConFlecha,
  estaResuelto,
  enSuLugar,
  cuantasEnSuLugar,
  fila,
  columna,
  calcularEstrellas,
  esMejorMarca,
  recorteImagen,
} from './logica.js';
import { formatoTiempo } from '../../logica/juego.js';
import { sonidos } from '../../logica/sonido.js';
import { leer, guardar } from '../../logica/almacen.js';
import './rompecabezas.css';

// ================== Imágenes originales (SVG dibujado aquí mismo) ==================
const svg = (contenido) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' preserveAspectRatio='xMidYMid slice'>${contenido}</svg>`
  )}")`;

const ATARDECER = svg(`
  <defs>
    <linearGradient id='cielo' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#2d1b69'/><stop offset='.45' stop-color='#e8476b'/><stop offset='.62' stop-color='#ffb347'/>
    </linearGradient>
    <linearGradient id='agua' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#ff9a5a'/><stop offset='1' stop-color='#3a1f5c'/>
    </linearGradient>
    <radialGradient id='sol'><stop offset='0' stop-color='#fff6c2'/><stop offset='1' stop-color='#ffcf4a'/></radialGradient>
  </defs>
  <rect width='400' height='400' fill='url(#cielo)'/>
  <circle cx='60' cy='50' r='2' fill='#fff'/><circle cx='120' cy='30' r='1.6' fill='#fff'/><circle cx='330' cy='45' r='2' fill='#fff'/><circle cx='260' cy='22' r='1.4' fill='#fff'/>
  <circle cx='200' cy='225' r='62' fill='url(#sol)'/>
  <path d='M0 250 L70 160 L120 210 L190 120 L260 205 L320 150 L400 235 L400 260 L0 260Z' fill='#5b2a6e'/>
  <path d='M0 262 L50 215 L110 250 L170 200 L240 255 L300 215 L360 245 L400 225 L400 262Z' fill='#3d1d55'/>
  <rect y='260' width='400' height='140' fill='url(#agua)'/>
  <g fill='#fff3c4' opacity='.75'>
    <rect x='150' y='272' width='100' height='4' rx='2'/><rect x='165' y='290' width='70' height='4' rx='2'/>
    <rect x='178' y='308' width='44' height='3' rx='1.5'/><rect x='188' y='324' width='24' height='3' rx='1.5'/>
  </g>
  <path d='M0 400 L0 300 Q60 280 120 310 Q150 330 140 400Z' fill='#1e1030'/>
  <g fill='#1e1030'>
    <path d='M30 305 L45 250 L60 305Z'/><path d='M60 300 L78 235 L96 300Z'/><path d='M95 312 L108 268 L121 312Z'/>
  </g>
  <rect x='310' y='280' width='56' height='36' fill='#2a1640'/><path d='M302 282 L338 254 L374 282Z' fill='#1e1030'/>
  <rect x='322' y='292' width='12' height='12' fill='#ffcf4a'/><rect x='344' y='292' width='12' height='12' fill='#ffcf4a'/>
  <path d='M290 400 Q330 310 400 300 L400 400Z' fill='#1e1030'/>
  <g fill='none' stroke='#2d1b69' stroke-width='3' stroke-linecap='round'>
    <path d='M80 110 q8 -8 16 0 q8 -8 16 0'/><path d='M130 90 q6 -6 12 0 q6 -6 12 0'/><path d='M280 100 q7 -7 14 0 q7 -7 14 0'/>
  </g>
`);

const OCEANO = svg(`
  <defs>
    <linearGradient id='mar' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#4fd1e8'/><stop offset='.55' stop-color='#1270b8'/><stop offset='1' stop-color='#0a2a5e'/>
    </linearGradient>
  </defs>
  <rect width='400' height='400' fill='url(#mar)'/>
  <g fill='#ffffff' opacity='.18'>
    <path d='M60 0 L110 0 L40 260 L0 260Z'/><path d='M190 0 L230 0 L170 300 L130 300Z'/><path d='M320 0 L370 0 L300 240 L260 240Z'/>
  </g>
  <path d='M0 340 Q60 310 120 335 T240 330 T400 325 L400 400 L0 400Z' fill='#f2d49b'/>
  <path d='M0 370 Q80 350 160 368 T400 360 L400 400 L0 400Z' fill='#e0b874'/>
  <g fill='#ff6b8b'>
    <path d='M40 345 q-6 -40 6 -60 q4 20 10 30 q6 -24 14 -34 q-2 34 -10 64Z'/>
    <path d='M330 340 q-4 -30 4 -50 q4 14 8 22 q4 -18 12 -26 q0 28 -8 54Z'/>
  </g>
  <g fill='#2ea36b'>
    <path d='M100 345 q-10 -40 4 -80 q-4 40 6 80Z'/><path d='M112 345 q6 -50 -6 -95 q18 45 14 95Z'/>
    <path d='M280 340 q-8 -36 4 -70 q-2 36 6 70Z'/>
  </g>
  <g>
    <ellipse cx='150' cy='150' rx='38' ry='24' fill='#ffcf4a'/><path d='M186 150 L214 128 L214 172Z' fill='#ffcf4a'/>
    <path d='M130 132 L140 150 L130 168' fill='none' stroke='#e0a800' stroke-width='4'/>
    <circle cx='130' cy='144' r='5' fill='#fff'/><circle cx='129' cy='144' r='2.5' fill='#222'/>
  </g>
  <g>
    <ellipse cx='290' cy='230' rx='30' ry='18' fill='#ff9f43'/><path d='M318 230 L340 214 L340 246Z' fill='#ff9f43'/>
    <rect x='278' y='213' width='7' height='34' fill='#fff'/><rect x='298' y='215' width='6' height='30' fill='#fff'/>
    <circle cx='272' cy='226' r='4' fill='#fff'/><circle cx='271' cy='226' r='2' fill='#222'/>
  </g>
  <g fill='#ffffff' opacity='.7'>
    <circle cx='90' cy='120' r='6'/><circle cx='80' cy='95' r='4'/><circle cx='88' cy='75' r='3'/>
    <circle cx='240' cy='190' r='5'/><circle cx='248' cy='168' r='3'/>
  </g>
  <g>
    <path d='M200 300 q20 -40 40 0 Z' fill='#b78cff'/>
    <g stroke='#b78cff' stroke-width='3' fill='none' stroke-linecap='round'>
      <path d='M205 300 q-4 14 2 24'/><path d='M215 300 q2 16 -2 26'/><path d='M225 300 q4 14 0 24'/><path d='M235 300 q4 12 8 20'/>
    </g>
  </g>
`);

const MODOS = {
  numeros: { nombre: 'Números', icono: '🔢', imagen: null },
  atardecer: { nombre: 'Atardecer', icono: '🌅', imagen: ATARDECER },
  oceano: { nombre: 'Océano', icono: '🐠', imagen: OCEANO },
};

const COLORES_CONFETI = ['#ffcf4a', '#ff6b8b', '#4ad9a0', '#5cb8ff', '#b78cff', '#ff9f43'];

const prefs = leer('rompecabezas-prefs', {});
const tamanoInicial = ORDEN_TAMANOS.includes(prefs.n) ? prefs.n : 3;
const modoInicial = prefs.modo in MODOS ? prefs.modo : 'numeros';

const partidaNueva = (n) => ({
  n,
  fichas: mezclar(n),
  movimientos: 0,
  inicio: null,
  fin: null,
});

// ================== Pantalla de victoria ==================
const Ganaste = ({ partida, nuevoRecord, record, onOtraVez, onSiguiente, haySiguiente, imagen }) => {
  const botonRef = useRef(null);
  useEffect(() => botonRef.current?.focus(), []);
  const estrellas = calcularEstrellas(partida.movimientos, partida.n);
  const confeti = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        izquierda: Math.random() * 100,
        retraso: Math.random() * 0.8,
        duracion: 2.2 + Math.random() * 1.8,
        giro: Math.random() * 720 - 360,
        color: COLORES_CONFETI[i % COLORES_CONFETI.length],
        ancho: 6 + Math.random() * 6,
      })),
    []
  );

  return (
    <div className="victoria" role="dialog" aria-modal="true" aria-labelledby="rc-titulo-victoria">
      <div className="confeti" aria-hidden="true">
        {confeti.map((p) => (
          <span
            key={p.id}
            style={{
              left: `${p.izquierda}%`,
              background: p.color,
              width: p.ancho,
              animationDelay: `${p.retraso}s`,
              animationDuration: `${p.duracion}s`,
              '--giro': `${p.giro}deg`,
            }}
          />
        ))}
      </div>
      <div className="victoria__tarjeta">
        <p className="victoria__nivel">
          Rompecabezas {partida.n}×{partida.n}
        </p>
        <h2 id="rc-titulo-victoria">¡Armado! 🧩</h2>
        {imagen && <div className="rc-miniatura" style={{ backgroundImage: imagen }} aria-hidden="true" />}
        <div className="victoria__estrellas" aria-label={`${estrellas} de 3 estrellas`}>
          {[1, 2, 3].map((k) => (
            <span key={k} className={k <= estrellas ? 'llena' : ''} style={{ '--n': k }}>
              ★
            </span>
          ))}
        </div>
        {nuevoRecord && <p className="victoria__record">🏆 ¡Nuevo récord!</p>}
        <dl className="victoria__datos rc-datos">
          <div>
            <dt>Movimientos</dt>
            <dd>{partida.movimientos}</dd>
          </div>
          <div>
            <dt>Tiempo</dt>
            <dd>{formatoTiempo(partida.fin - partida.inicio)}</dd>
          </div>
        </dl>
        {record && !nuevoRecord && (
          <p className="victoria__mejor">
            Tu récord: {record.movimientos} movimientos en {formatoTiempo(record.tiempo)}
          </p>
        )}
        <div className="victoria__botones">
          <button type="button" ref={botonRef} className="boton boton--principal" onClick={onOtraVez}>
            Jugar otra vez
          </button>
          {haySiguiente && (
            <button type="button" className="boton" onClick={onSiguiente}>
              Más grande →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ================== Juego ==================
const Rompecabezas = () => {
  const [partida, setPartida] = useState(() => partidaNueva(tamanoInicial));
  const [modo, setModo] = useState(modoInicial);
  const [ahora, setAhora] = useState(() => Date.now());
  const [mirando, setMirando] = useState(false);
  const [records, setRecords] = useState(() => leer('rompecabezas-records', {}));
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [sacudir, setSacudir] = useState(null); // { valor, k }
  const tableroRef = useRef(null);

  const { n, fichas } = partida;
  const imagen = MODOS[modo].imagen;
  const hueco = fichas.indexOf(HUECO);
  const record = records[n];
  const tiempo = partida.inicio ? Math.max(0, (partida.fin ?? ahora) - partida.inicio) : 0;
  const correctas = cuantasEnSuLugar(fichas);

  useEffect(() => {
    guardar('rompecabezas-prefs', { n, modo });
  }, [n, modo]);

  // Cronómetro desde el primer movimiento
  useEffect(() => {
    if (!partida.inicio || partida.fin) return;
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(t);
  }, [partida.inicio, partida.fin]);

  const reiniciar = (nuevoN = n) => {
    setNuevoRecord(false);
    setMirando(false);
    setPartida(partidaNueva(nuevoN));
    requestAnimationFrame(() => tableroRef.current?.focus());
  };

  const aplicar = (resultado) => {
    if (!resultado || partida.fin) return;
    const momento = Date.now();
    const inicio = partida.inicio ?? momento;
    const movimientos = partida.movimientos + resultado.movidas;
    const ganado = estaResuelto(resultado.fichas);
    const siguiente = { ...partida, fichas: resultado.fichas, movimientos, inicio, fin: ganado ? momento : null };
    setPartida(siguiente);
    setMirando(false);

    sonidos.voltear();
    if (ganado) {
      setTimeout(sonidos.victoria, 250);
      const marca = { movimientos, tiempo: momento - inicio };
      const esNuevo = esMejorMarca(marca, records[n]);
      setNuevoRecord(esNuevo);
      if (esNuevo) {
        const nuevos = { ...records, [n]: marca };
        setRecords(nuevos);
        guardar('rompecabezas-records', nuevos);
      }
    } else if (cuantasEnSuLugar(resultado.fichas) > correctas) {
      sonidos.pareja();
    }
  };

  const alTocar = (indice) => {
    if (partida.fin) return;
    const resultado = mover(fichas, n, indice);
    if (!resultado) {
      sonidos.fallo();
      setSacudir((s) => ({ valor: fichas[indice], k: (s?.k ?? 0) + 1 }));
      return;
    }
    aplicar(resultado);
  };

  const alPresionarTecla = (e) => {
    if (!e.key.startsWith('Arrow')) return;
    e.preventDefault();
    aplicar(moverConFlecha(fichas, n, e.key));
  };

  // Las fichas se dibujan siempre en el mismo orden (por valor) y se ubican con
  // transform: así el navegador anima el deslizamiento.
  const valores = useMemo(() => tableroResuelto(n).filter((v) => v !== HUECO), [n]);
  const indiceDe = useMemo(() => {
    const mapa = {};
    fichas.forEach((v, i) => (mapa[v] = i));
    return mapa;
  }, [fichas]);

  const indiceSiguiente = ORDEN_TAMANOS.indexOf(n) + 1;
  const haySiguiente = indiceSiguiente < ORDEN_TAMANOS.length;

  return (
    <div className="rc">
      <section className="opciones" aria-label="Opciones del rompecabezas">
        <div className="selector" role="group" aria-label="Tamaño">
          {ORDEN_TAMANOS.map((t) => (
            <button
              key={t}
              type="button"
              className={`selector__opcion ${n === t ? 'activa' : ''}`}
              aria-pressed={n === t}
              onClick={() => reiniciar(t)}
            >
              {TAMANOS[t].nombre}
              <small>
                {t}×{t}
              </small>
            </button>
          ))}
        </div>
        <div className="selector" role="group" aria-label="Dibujo de las fichas">
          {Object.entries(MODOS).map(([id, m]) => (
            <button
              key={id}
              type="button"
              className={`selector__opcion ${modo === id ? 'activa' : ''}`}
              aria-pressed={modo === id}
              onClick={() => setModo(id)}
            >
              <span aria-hidden="true">{m.icono}</span> {m.nombre}
            </button>
          ))}
        </div>
      </section>

      <section className="marcador rc-marcador" aria-live="polite">
        <div className="dato">
          <span className="dato__titulo">Movimientos</span>
          <span className="dato__valor">{partida.movimientos}</span>
        </div>
        <div className="dato">
          <span className="dato__titulo">Tiempo</span>
          <span className="dato__valor">{formatoTiempo(tiempo)}</span>
        </div>
        <div className="dato">
          <span className="dato__titulo">En su lugar</span>
          <span className="dato__valor">
            {correctas}/{n * n - 1}
          </span>
        </div>
        <div className="dato dato--record">
          <span className="dato__titulo">🏆 Récord</span>
          <span className="dato__valor">
            {record ? `${record.movimientos} mov · ${formatoTiempo(record.tiempo)}` : '—'}
          </span>
        </div>
      </section>

      <main className="mesa rc-mesa">
        <div className="rc-bandeja">
          <div
            ref={tableroRef}
            className={`rc-tablero ${imagen ? 'rc-tablero--imagen' : ''} ${partida.fin ? 'rc-tablero--armado' : ''}`}
            style={{ '--n': n, '--imagen': imagen ?? 'none' }}
            tabIndex={0}
            role="group"
            aria-label={`Rompecabezas ${n} por ${n}. Usa las flechas para mover las fichas hacia el espacio vacío.`}
            onKeyDown={alPresionarTecla}
          >
            {/* Huecos de la bandeja (fondo tallado) */}
            <div className="rc-fondo" aria-hidden="true" />

            {valores.map((valor) => {
              const i = indiceDe[valor];
              const r = fila(i, n);
              const c = columna(i, n);
              const movible = fila(hueco, n) === r || columna(hueco, n) === c;
              const correcta = enSuLugar(valor, i);
              const animarSacudida = sacudir?.valor === valor;
              return (
                <button
                  key={valor}
                  type="button"
                  tabIndex={-1}
                  className={[
                    'rc-ficha',
                    movible && !partida.fin ? 'rc-ficha--movible' : '',
                    correcta ? 'rc-ficha--correcta' : '',
                  ].join(' ')}
                  style={{ '--x': c, '--y': r }}
                  onClick={() => alTocar(i)}
                  aria-label={`Ficha ${valor}, fila ${r + 1}, columna ${c + 1}${correcta ? ', en su lugar' : ''}`}
                >
                  <span
                    key={animarSacudida ? sacudir.k : 'quieta'}
                    className={`rc-ficha__cara ${animarSacudida ? 'rc-sacudir' : ''}`}
                    style={imagen ? { backgroundPosition: recorteImagen(valor, n) } : undefined}
                  >
                    <span className={imagen ? 'rc-numero rc-numero--chico' : 'rc-numero'}>{valor}</span>
                  </span>
                </button>
              );
            })}

            {/* Vistazo: cómo se ve el rompecabezas armado */}
            <div className={`rc-vistazo ${mirando ? 'rc-vistazo--visible' : ''}`} aria-hidden={!mirando}>
              {imagen ? (
                <div className="rc-vistazo__imagen" style={{ backgroundImage: imagen }} />
              ) : (
                <div className="rc-vistazo__numeros">
                  {valores.map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </div>
              )}
              <span className="rc-vistazo__etiqueta">Así debe quedar</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="pie">
        <div className="rc-botones">
          <button type="button" className="boton" onClick={() => reiniciar()}>
            🔀 Mezclar
          </button>
          <button
            type="button"
            className={`boton ${mirando ? 'boton--principal' : ''}`}
            aria-pressed={mirando}
            onClick={() => setMirando((m) => !m)}
          >
            👁 {mirando ? 'Ocultar' : 'Ver imagen'}
          </button>
        </div>
        <p>Toca una ficha en la fila o columna del espacio vacío, o usa las flechas del teclado.</p>
      </footer>

      {partida.fin && (
        <Ganaste
          partida={partida}
          nuevoRecord={nuevoRecord}
          record={record}
          imagen={imagen}
          haySiguiente={haySiguiente}
          onOtraVez={() => reiniciar()}
          onSiguiente={() => reiniciar(ORDEN_TAMANOS[indiceSiguiente])}
        />
      )}
    </div>
  );
};

export default Rompecabezas;
