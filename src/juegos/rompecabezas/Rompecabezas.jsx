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
  mezclarGiros,
  girar,
  girosResueltos,
  cuantasDerechas,
  estaDerecha,
  minimoGiros,
  calcularEstrellasGiro,
} from './logica.js';
import { IMAGENES } from './ilustraciones.js';
import { formatoTiempo } from '../../logica/juego.js';
import { sonidos } from '../../logica/sonido.js';
import { leer, guardar } from '../../logica/almacen.js';
import './rompecabezas.css';

// Dibujos de las fichas: números de madera o una de las ilustraciones
const DIBUJOS = {
  numeros: { nombre: 'Números', icono: '🔢', imagen: null },
  ...IMAGENES,
};

// Formas de jugar
const TIPOS = {
  deslizar: { nombre: 'Deslizar', icono: '🧩', ayuda: 'Desliza las fichas hacia el espacio vacío' },
  girar: { nombre: 'Fichas giradas', icono: '🔄', ayuda: 'Gira cada ficha hasta que quede derecha' },
};

const COLORES_CONFETI = ['#ffcf4a', '#ff6b8b', '#4ad9a0', '#5cb8ff', '#b78cff', '#ff9f43'];

const prefs = leer('rompecabezas-prefs', {});
const tamanoInicial = ORDEN_TAMANOS.includes(prefs.n) ? prefs.n : 3;
const dibujoInicial = prefs.modo in DIBUJOS ? prefs.modo : 'numeros';
const tipoInicial = prefs.tipo in TIPOS ? prefs.tipo : 'deslizar';
const ayudaInicial = prefs.ayuda !== false;

function partidaNueva(tipo, n) {
  const base = { tipo, n, movimientos: 0, inicio: null, fin: null };
  if (tipo === 'girar') {
    const giros = mezclarGiros(n);
    return { ...base, giros, minimo: minimoGiros(giros) };
  }
  return { ...base, fichas: mezclar(n) };
}

const claveRecord = (tipo, n) => (tipo === 'girar' ? `g${n}` : String(n));

const estrellasDe = (partida) =>
  partida.tipo === 'girar'
    ? calcularEstrellasGiro(partida.movimientos, partida.minimo)
    : calcularEstrellas(partida.movimientos, partida.n);

// ================== Pantalla de victoria ==================
const Ganaste = ({ partida, nuevoRecord, record, onOtraVez, onSiguiente, haySiguiente, imagen }) => {
  const botonRef = useRef(null);
  useEffect(() => botonRef.current?.focus(), []);
  const estrellas = estrellasDe(partida);
  const girando = partida.tipo === 'girar';
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
          {girando ? 'Fichas giradas' : 'Rompecabezas'} {partida.n}×{partida.n}
        </p>
        <h2 id="rc-titulo-victoria">{girando ? '¡Todo derecho! 🔄' : '¡Armado! 🧩'}</h2>
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
            <dt>{girando ? 'Giros' : 'Movimientos'}</dt>
            <dd>{partida.movimientos}</dd>
          </div>
          <div>
            <dt>Tiempo</dt>
            <dd>{formatoTiempo(partida.fin - partida.inicio)}</dd>
          </div>
        </dl>
        {girando && <p className="victoria__mejor">Lo mínimo posible era {partida.minimo} giros</p>}
        {record && !nuevoRecord && (
          <p className="victoria__mejor">
            Tu récord: {record.movimientos} {girando ? 'giros' : 'movimientos'} en {formatoTiempo(record.tiempo)}
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
  const [partida, setPartida] = useState(() => partidaNueva(tipoInicial, tamanoInicial));
  const [dibujo, setDibujo] = useState(dibujoInicial);
  const [ayuda, setAyuda] = useState(ayudaInicial);
  const [ahora, setAhora] = useState(() => Date.now());
  const [mirando, setMirando] = useState(false);
  const [records, setRecords] = useState(() => leer('rompecabezas-records', {}));
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [sacudir, setSacudir] = useState(null); // { valor, k }
  const [cursor, setCursor] = useState(0); // ficha elegida con el teclado (modo girar)
  const [enfocado, setEnfocado] = useState(false);
  const tableroRef = useRef(null);

  const { tipo, n } = partida;
  const girando = tipo === 'girar';
  const imagen = DIBUJOS[dibujo].imagen;
  const record = records[claveRecord(tipo, n)];
  const tiempo = partida.inicio ? Math.max(0, (partida.fin ?? ahora) - partida.inicio) : 0;
  const correctas = girando ? cuantasDerechas(partida.giros) : cuantasEnSuLugar(partida.fichas);
  const totalFichas = girando ? n * n : n * n - 1;

  useEffect(() => {
    guardar('rompecabezas-prefs', { n, modo: dibujo, tipo, ayuda });
  }, [n, dibujo, tipo, ayuda]);

  // Cronómetro desde el primer movimiento
  useEffect(() => {
    if (!partida.inicio || partida.fin) return;
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(t);
  }, [partida.inicio, partida.fin]);

  const reiniciar = (nuevoN = n, nuevoTipo = tipo) => {
    setNuevoRecord(false);
    setMirando(false);
    setCursor(0);
    setPartida(partidaNueva(nuevoTipo, nuevoN));
    requestAnimationFrame(() => tableroRef.current?.focus());
  };

  // Registra el final de una partida y revisa si es récord
  const terminar = (movimientos, inicio, momento) => {
    setTimeout(sonidos.victoria, 250);
    const marca = { movimientos, tiempo: momento - inicio };
    const clave = claveRecord(tipo, n);
    const esNuevo = esMejorMarca(marca, records[clave]);
    setNuevoRecord(esNuevo);
    if (esNuevo) {
      const nuevos = { ...records, [clave]: marca };
      setRecords(nuevos);
      guardar('rompecabezas-records', nuevos);
    }
  };

  // ----- Modo deslizar -----
  const aplicar = (resultado) => {
    if (!resultado || partida.fin) return;
    const momento = Date.now();
    const inicio = partida.inicio ?? momento;
    const movimientos = partida.movimientos + resultado.movidas;
    const ganado = estaResuelto(resultado.fichas);
    setPartida({ ...partida, fichas: resultado.fichas, movimientos, inicio, fin: ganado ? momento : null });
    setMirando(false);

    sonidos.voltear();
    if (ganado) terminar(movimientos, inicio, momento);
    else if (cuantasEnSuLugar(resultado.fichas) > correctas) sonidos.pareja();
  };

  const alTocar = (indice) => {
    if (partida.fin) return;
    const resultado = mover(partida.fichas, n, indice);
    if (!resultado) {
      sonidos.fallo();
      setSacudir((s) => ({ valor: partida.fichas[indice], k: (s?.k ?? 0) + 1 }));
      return;
    }
    aplicar(resultado);
  };

  // ----- Modo girar -----
  const alGirar = (indice, sentido = 1) => {
    if (partida.fin) return;
    const giros = girar(partida.giros, indice, sentido);
    if (!giros) return;
    const momento = Date.now();
    const inicio = partida.inicio ?? momento;
    const movimientos = partida.movimientos + 1;
    const ganado = girosResueltos(giros);
    setPartida({ ...partida, giros, movimientos, inicio, fin: ganado ? momento : null });
    setMirando(false);
    setCursor(indice);

    sonidos.voltear();
    if (ganado) terminar(movimientos, inicio, momento);
    else if (estaDerecha(giros[indice])) sonidos.pareja();
  };

  const alPresionarTecla = (e) => {
    if (girando) {
      const pasos = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: n, ArrowUp: -n };
      if (e.key in pasos) {
        e.preventDefault();
        const destino = cursor + pasos[e.key];
        const mismaFila = e.key === 'ArrowRight' || e.key === 'ArrowLeft' ? fila(destino, n) === fila(cursor, n) : true;
        if (destino >= 0 && destino < n * n && mismaFila) setCursor(destino);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        alGirar(cursor, e.shiftKey ? -1 : 1);
      }
      return;
    }
    if (!e.key.startsWith('Arrow')) return;
    e.preventDefault();
    aplicar(moverConFlecha(partida.fichas, n, e.key));
  };

  // Modo deslizar: las fichas se dibujan siempre en el mismo orden (por valor) y se
  // ubican con transform, así el navegador anima el deslizamiento.
  const valores = useMemo(() => tableroResuelto(n).filter((v) => v !== HUECO), [n]);
  const indiceDe = useMemo(() => {
    if (girando) return {};
    const mapa = {};
    partida.fichas.forEach((v, i) => (mapa[v] = i));
    return mapa;
  }, [partida, girando]);

  const indiceSiguiente = ORDEN_TAMANOS.indexOf(n) + 1;
  const haySiguiente = indiceSiguiente < ORDEN_TAMANOS.length;
  const hueco = girando ? -1 : partida.fichas.indexOf(HUECO);
  const claseNumero = imagen ? `rc-numero rc-numero--chico ${ayuda ? '' : 'rc-numero--oculto'}` : 'rc-numero';

  const fichaDeslizar = (valor) => {
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
        className={['rc-ficha', movible && !partida.fin ? 'rc-ficha--movible' : '', correcta ? 'rc-ficha--correcta' : ''].join(' ')}
        style={{ '--x': c, '--y': r }}
        onClick={() => alTocar(i)}
        aria-label={`Ficha ${valor}, fila ${r + 1}, columna ${c + 1}${correcta ? ', en su lugar' : ''}`}
      >
        <span
          key={animarSacudida ? sacudir.k : 'quieta'}
          className={`rc-ficha__cara ${animarSacudida ? 'rc-sacudir' : ''}`}
          style={imagen ? { backgroundPosition: recorteImagen(valor, n) } : undefined}
        >
          <span className={claseNumero}>{valor}</span>
        </span>
      </button>
    );
  };

  const fichaGirar = (giro, i) => {
    const r = fila(i, n);
    const c = columna(i, n);
    const derecha = estaDerecha(giro);
    return (
      <button
        key={i}
        type="button"
        tabIndex={-1}
        className={[
          'rc-ficha',
          'rc-ficha--girable',
          derecha ? 'rc-ficha--correcta' : '',
          enfocado && cursor === i && !partida.fin ? 'rc-ficha--cursor' : '',
        ].join(' ')}
        style={{ '--x': c, '--y': r }}
        onClick={(e) => alGirar(i, e.shiftKey ? -1 : 1)}
        onContextMenu={(e) => {
          e.preventDefault();
          alGirar(i, -1);
        }}
        aria-label={`Ficha ${i + 1}, fila ${r + 1}, columna ${c + 1}${derecha ? ', derecha' : ', girada'}`}
      >
        <span
          className="rc-ficha__cara rc-ficha__cara--giro"
          style={{
            '--giro': `${giro * 90}deg`,
            ...(imagen ? { backgroundPosition: recorteImagen(i + 1, n) } : {}),
          }}
        >
          <span className={claseNumero}>{i + 1}</span>
        </span>
      </button>
    );
  };

  return (
    <div className="rc">
      <section className="opciones" aria-label="Opciones del rompecabezas">
        <div className="selector" role="group" aria-label="Forma de jugar">
          {Object.entries(TIPOS).map(([id, t]) => (
            <button
              key={id}
              type="button"
              className={`selector__opcion ${tipo === id ? 'activa' : ''}`}
              aria-pressed={tipo === id}
              title={t.ayuda}
              onClick={() => reiniciar(n, id)}
            >
              <span aria-hidden="true">{t.icono}</span> {t.nombre}
            </button>
          ))}
        </div>
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
      </section>

      <section className="rc-dibujos" aria-label="Dibujo de las fichas">
        <div className="selector rc-selector-dibujos" role="group" aria-label="Dibujo">
          {Object.entries(DIBUJOS).map(([id, m]) => (
            <button
              key={id}
              type="button"
              className={`selector__opcion ${dibujo === id ? 'activa' : ''}`}
              aria-pressed={dibujo === id}
              onClick={() => setDibujo(id)}
            >
              <span aria-hidden="true">{m.icono}</span> {m.nombre}
            </button>
          ))}
        </div>
        {imagen && (
          <button
            type="button"
            className={`selector__opcion rc-ayuda ${ayuda ? '' : 'activa'}`}
            aria-pressed={!ayuda}
            onClick={() => setAyuda((a) => !a)}
            title="Quita los números pequeños de las fichas para hacerlo más difícil"
          >
            {ayuda ? '🔢 Con números de ayuda' : '🚫 Sin números (difícil)'}
          </button>
        )}
      </section>

      <section className="marcador rc-marcador" aria-live="polite">
        <div className="dato">
          <span className="dato__titulo">{girando ? 'Giros' : 'Movimientos'}</span>
          <span className="dato__valor">{partida.movimientos}</span>
        </div>
        <div className="dato">
          <span className="dato__titulo">Tiempo</span>
          <span className="dato__valor">{formatoTiempo(tiempo)}</span>
        </div>
        <div className="dato">
          <span className="dato__titulo">{girando ? 'Derechas' : 'En su lugar'}</span>
          <span className="dato__valor">
            {correctas}/{totalFichas}
          </span>
        </div>
        <div className="dato dato--record">
          <span className="dato__titulo">🏆 Récord</span>
          <span className="dato__valor">
            {record ? `${record.movimientos} ${girando ? 'giros' : 'mov'} · ${formatoTiempo(record.tiempo)}` : '—'}
          </span>
        </div>
      </section>

      <main className="mesa rc-mesa">
        <div className="rc-bandeja">
          <div
            ref={tableroRef}
            className={[
              'rc-tablero',
              imagen ? 'rc-tablero--imagen' : '',
              girando ? 'rc-tablero--girar' : '',
              partida.fin ? 'rc-tablero--armado' : '',
            ].join(' ')}
            style={{ '--n': n, '--imagen': imagen ?? 'none' }}
            tabIndex={0}
            role="group"
            aria-label={
              girando
                ? `Fichas giradas ${n} por ${n}. Muévete con las flechas y gira con Enter; con Mayúsculas + Enter giras al otro lado.`
                : `Rompecabezas ${n} por ${n}. Usa las flechas para mover las fichas hacia el espacio vacío.`
            }
            onKeyDown={alPresionarTecla}
            onFocus={() => setEnfocado(true)}
            onBlur={() => setEnfocado(false)}
          >
            {/* Huecos de la bandeja (fondo tallado) */}
            <div className="rc-fondo" aria-hidden="true" />

            {girando ? partida.giros.map(fichaGirar) : valores.map(fichaDeslizar)}

            {/* Vistazo: cómo se ve el rompecabezas armado */}
            <div className={`rc-vistazo ${mirando ? 'rc-vistazo--visible' : ''}`} aria-hidden={!mirando}>
              {imagen ? (
                <div className="rc-vistazo__imagen" style={{ backgroundImage: imagen }} />
              ) : (
                <div className="rc-vistazo__numeros">
                  {(girando ? tableroResuelto(n).map((_, i) => i + 1) : valores).map((v) => (
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
        <p>
          {girando
            ? 'Toca una ficha para girarla a la derecha; clic derecho (o Mayús + clic) la gira a la izquierda.'
            : 'Toca una ficha en la fila o columna del espacio vacío, o usa las flechas del teclado.'}
        </p>
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
