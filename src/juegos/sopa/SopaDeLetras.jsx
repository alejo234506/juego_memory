import { useEffect, useMemo, useRef, useState } from 'react';
import './sopa.css';
import { TEMAS, ORDEN_TEMAS, entradasDe } from './temas.js';
import {
  DIFICULTADES,
  ORDEN_DIFICULTADES,
  COLORES,
  generarSopa,
  lineaEntre,
  ajustarFin,
  verificarSeleccion,
  extremos,
  formatoTiempo,
  estrellasPorPistas,
  MODOS,
  ORDEN_MODOS,
  tiempoRestante,
  claveRecord,
  esMejor,
  mascara,
} from './logica.js';
import { sonidos } from '../../logica/sonido.js';
import { leer, guardar } from '../../logica/almacen.js';

const PENALIZACION = 15000; // cada pista suma 15 segundos
const FLECHAS = { '0,1': '→', '1,0': '↓', '1,1': '↘', '-1,1': '↗', '0,-1': '←', '-1,0': '↑', '-1,-1': '↖', '1,-1': '↙' };

const prefs = leer('sopa-prefs', {});
const temaGuardado = prefs.tema === 'azar' || prefs.tema in TEMAS ? prefs.tema : 'animales';
const difGuardada = prefs.dificultad in DIFICULTADES ? prefs.dificultad : 'facil';
const modoGuardado = prefs.modo in MODOS ? prefs.modo : 'clasico';

function crearPartida(tema, dificultad, modo) {
  const idTema = tema === 'azar' ? ORDEN_TEMAS[Math.floor(Math.random() * ORDEN_TEMAS.length)] : tema;
  return {
    idTema,
    dificultad,
    modo,
    sopa: generarSopa(entradasDe(idTema), dificultad),
    ayudas: {}, // modo Rompecráneos: id de palabra -> 1 (primera letra) o 2 (señalada en la grilla)
    agotado: false, // contrarreloj: se acabó el tiempo
    encontradas: [], // { id, inicio, fin, color }
    inicio: null,
    fin: null,
    pistas: 0,
    numero: 100 + Math.floor(Math.random() * 900),
  };
}

const iguales = (a, b) => a && b && a.fila === b.fila && a.col === b.col;
const centro = (c) => ({ x: c.col + 0.5, y: c.fila + 0.5 });

// ---------- Pantalla de victoria ----------
const COLORES_CONFETI = ['#ffcf4a', '#ff6b8b', '#4ad9a0', '#5cb8ff', '#b78cff', '#ff9f43'];

function Victoria({ tiempo, pistas, palabras, halladas, modo, agotado, nuevoRecord, record, dificultad, haySiguiente, onOtraVez, onSiguiente }) {
  const botonRef = useRef(null);
  useEffect(() => botonRef.current?.focus(), []);
  const contrarreloj = modo === 'contrarreloj';
  const estrellas = contrarreloj
    ? halladas === palabras ? 3 : halladas >= palabras / 2 ? 2 : halladas > 0 ? 1 : 0
    : estrellasPorPistas(pistas);
  const textoRecord = (r) => (contrarreloj ? `${r.palabras} palabras` : formatoTiempo(r));
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
    <div className="victoria" role="dialog" aria-modal="true" aria-labelledby="sopa-titulo-victoria">
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
          Sopa de letras · {DIFICULTADES[dificultad].nombre} · {MODOS[modo].icono} {MODOS[modo].nombre}
        </p>
        <h2 id="sopa-titulo-victoria">{agotado ? '¡Se acabó el tiempo! ⏱' : '¡Sopa completada! 🎉'}</h2>
        <div className="victoria__estrellas" aria-label={`${estrellas} de 3 estrellas`}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={n <= estrellas ? 'llena' : ''} style={{ '--n': n }}>
              ★
            </span>
          ))}
        </div>
        {nuevoRecord && <p className="victoria__record">🏆 ¡Nuevo récord!</p>}
        <dl className="victoria__datos">
          <div>
            <dt>{contrarreloj ? 'Sobró' : 'Tiempo'}</dt>
            <dd>{formatoTiempo(tiempo)}</dd>
          </div>
          <div>
            <dt>Palabras</dt>
            <dd>{contrarreloj ? `${halladas}/${palabras}` : palabras}</dd>
          </div>
          <div>
            <dt>Pistas</dt>
            <dd>{pistas}</dd>
          </div>
        </dl>
        {record != null && !nuevoRecord && <p className="victoria__mejor">Tu récord en este nivel: {textoRecord(record)}</p>}
        <div className="victoria__botones">
          <button type="button" ref={botonRef} className="boton boton--principal" onClick={onOtraVez}>
            Otra sopa
          </button>
          {haySiguiente && (
            <button type="button" className="boton" onClick={onSiguiente}>
              Más difícil →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Juego ----------
export default function SopaDeLetras() {
  const [tema, setTema] = useState(temaGuardado);
  const [partida, setPartida] = useState(() => crearPartida(temaGuardado, difGuardada, modoGuardado));
  const [arrastre, setArrastre] = useState(null); // { inicio, fin, movio }
  const [ancla, setAncla] = useState(null); // inicio elegido con clic o teclado
  const [hover, setHover] = useState(null);
  const [cursor, setCursor] = useState({ fila: 0, col: 0 });
  const [enfocado, setEnfocado] = useState(false);
  const [error, setError] = useState(null);
  const [pista, setPista] = useState(null);
  const [recien, setRecien] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [ahora, setAhora] = useState(() => Date.now());
  const [records, setRecords] = useState(() => leer('sopa-records', {}));
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const grillaRef = useRef(null);
  const arrastreRef = useRef(null);

  const { sopa, dificultad, modo } = partida;
  const contrarreloj = modo === 'contrarreloj';
  const rompecraneos = modo === 'rompecraneos';
  const { tam } = sopa;
  const dif = DIFICULTADES[dificultad];
  const encontradasIds = useMemo(() => new Set(partida.encontradas.map((e) => e.id)), [partida.encontradas]);
  const colorDe = useMemo(() => Object.fromEntries(partida.encontradas.map((e) => [e.id, e.color])), [partida.encontradas]);
  const penal = partida.pistas * PENALIZACION;
  const restante = contrarreloj
    ? Math.max(0, tiempoRestante({ ...partida, encontradas: partida.encontradas.length }, ahora, PENALIZACION))
    : 0;
  const tiempo = contrarreloj ? restante : partida.inicio ? (partida.fin ?? ahora) - partida.inicio + penal : penal;
  const record = records[claveRecord(dificultad, modo)];
  const textoRecord =
    record == null ? '—' : contrarreloj ? (typeof record === 'object' ? `${record.palabras} pal.` : '—') : formatoTiempo(record);

  // Cronómetro
  useEffect(() => {
    if (!partida.inicio || partida.fin) return;
    const t = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(t);
  }, [partida.inicio, partida.fin]);

  // Contrarreloj: cuando llega a cero se termina la partida
  useEffect(() => {
    if (!contrarreloj || !partida.inicio || partida.fin || restante > 0) return;
    sonidos.fallo();
    setMensaje('¡Se acabó el tiempo!');
    setPartida((p) => (p.fin ? p : { ...p, fin: Date.now(), agotado: true }));
  }, [contrarreloj, partida.inicio, partida.fin, restante]);

  // Preferencias
  useEffect(() => guardar('sopa-prefs', { tema, dificultad, modo }), [tema, dificultad, modo]);

  // Al terminar: sonido y récord
  useEffect(() => {
    if (!partida.fin) return;
    const clave = claveRecord(dificultad, modo);
    const marca =
      modo === 'contrarreloj'
        ? {
            palabras: partida.encontradas.length,
            restante: Math.max(
              0,
              tiempoRestante({ ...partida, encontradas: partida.encontradas.length }, partida.fin, PENALIZACION)
            ),
          }
        : partida.fin - partida.inicio + partida.pistas * PENALIZACION;
    const anterior = leer('sopa-records', {});
    const esNuevo = (modo !== 'contrarreloj' || marca.palabras > 0) && esMejor(marca, anterior[clave], modo);
    setNuevoRecord(esNuevo);
    if (esNuevo) {
      const nuevos = { ...anterior, [clave]: marca };
      setRecords(nuevos);
      guardar('sopa-records', nuevos);
    }
    const t = partida.agotado ? null : setTimeout(sonidos.victoria, 350);
    return () => clearTimeout(t);
  }, [partida.fin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Efectos temporales
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 550);
    return () => clearTimeout(t);
  }, [error]);
  useEffect(() => {
    if (!pista) return;
    const t = setTimeout(() => setPista(null), 2600);
    return () => clearTimeout(t);
  }, [pista]);

  const nueva = (cambios = {}) => {
    const t = cambios.tema ?? tema;
    const d = cambios.dificultad ?? dificultad;
    const m = cambios.modo ?? modo;
    if (cambios.tema) setTema(cambios.tema);
    arrastreRef.current = null;
    setArrastre(null);
    setAncla(null);
    setHover(null);
    setError(null);
    setPista(null);
    setRecien(null);
    setNuevoRecord(false);
    setCursor({ fila: 0, col: 0 });
    setMensaje('Nueva sopa de letras lista');
    setPartida(crearPartida(t, d, m));
  };

  const arrancarReloj = () => {
    if (!partida.inicio) {
      const t = Date.now();
      setAhora(t);
      setPartida((p) => (p.inicio ? p : { ...p, inicio: t }));
    }
  };

  const intentar = (a, b) => {
    const linea = lineaEntre(a, b);
    if (!linea || linea.length < 2) return;
    const p = verificarSeleccion(sopa, encontradasIds, a, b);
    if (!p) {
      sonidos.fallo();
      setError({ inicio: a, fin: b, n: Date.now() });
      return;
    }
    sonidos.voltear();
    sonidos.pareja();
    const color = COLORES[partida.encontradas.length % COLORES.length];
    const encontradas = [...partida.encontradas, { id: p.id, inicio: a, fin: b, color }];
    const gano = encontradas.length === sopa.palabras.length;
    setRecien(p.id);
    setMensaje(
      gano
        ? '¡Encontraste todas las palabras!'
        : `¡Encontraste ${p.texto}!${contrarreloj ? ' +10 segundos.' : ''} Faltan ${sopa.palabras.length - encontradas.length}.`
    );
    setPartida((prev) => ({ ...prev, encontradas, fin: gano ? Date.now() : null }));
  };

  // Selección con clic (primera letra y luego última) o teclado
  const tocar = (c) => {
    if (partida.fin) return;
    arrancarReloj();
    if (!ancla) {
      setAncla(c);
      sonidos.voltear();
    } else if (iguales(ancla, c)) {
      setAncla(null);
    } else if (lineaEntre(ancla, c)) {
      intentar(ancla, c);
      setAncla(null);
    } else {
      setAncla(c);
    }
  };

  // ---------- Puntero (mouse y touch) ----------
  const celdaDesde = (e) => {
    const r = grillaRef.current.getBoundingClientRect();
    const col = Math.min(tam - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * tam)));
    const fila = Math.min(tam - 1, Math.max(0, Math.floor(((e.clientY - r.top) / r.height) * tam)));
    return { fila, col };
  };

  const alBajar = (e) => {
    if (partida.fin || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    grillaRef.current.focus({ preventScroll: true });
    grillaRef.current.setPointerCapture?.(e.pointerId);
    const c = celdaDesde(e);
    arrastreRef.current = { inicio: c, fin: c, movio: false };
    setArrastre(arrastreRef.current);
    setCursor(c);
  };

  const alMover = (e) => {
    const c = celdaDesde(e);
    const a = arrastreRef.current;
    if (a) {
      const fin = ajustarFin(a.inicio, c, tam);
      if (!iguales(fin, a.fin)) {
        arrastreRef.current = { ...a, fin, movio: a.movio || !iguales(fin, a.inicio) };
        setArrastre(arrastreRef.current);
      }
    } else if (e.pointerType === 'mouse' && !iguales(c, hover)) {
      setHover(c);
    }
  };

  const alSoltar = () => {
    const a = arrastreRef.current;
    if (!a) return;
    arrastreRef.current = null;
    setArrastre(null);
    if (a.movio && !iguales(a.inicio, a.fin)) {
      arrancarReloj();
      setAncla(null);
      intentar(a.inicio, a.fin);
    } else {
      tocar(a.inicio);
    }
  };

  const alCancelar = () => {
    arrastreRef.current = null;
    setArrastre(null);
  };

  // ---------- Teclado ----------
  const alTeclear = (e) => {
    if (partida.fin) return;
    const pasos = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] };
    if (e.key in pasos) {
      e.preventDefault();
      const [df, dc] = pasos[e.key];
      setHover(null);
      setCursor((c) => ({
        fila: Math.min(tam - 1, Math.max(0, c.fila + df)),
        col: Math.min(tam - 1, Math.max(0, c.col + dc)),
      }));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      tocar(cursor);
    } else if (e.key === 'Escape' && ancla) {
      e.preventDefault();
      setAncla(null);
    }
  };

  // ---------- Pista ----------
  const textoCastigo = contrarreloj ? '−15 segundos' : '+15 segundos';

  const senalar = (p) => {
    setPista({ ...extremos(p).inicio, n: Date.now() });
    setMensaje(
      `Pista: busca ${rompecraneos ? 'esa palabra' : p.texto} empezando en la fila ${extremos(p).inicio.fila + 1}, columna ${
        extremos(p).inicio.col + 1
      }. ${textoCastigo}.`
    );
  };

  // En Rompecráneos: 1.ª ayuda = primera letra en la lista, 2.ª = señalarla en la grilla
  const ayudarCon = (p) => {
    if (partida.fin || encontradasIds.has(p.id)) return;
    arrancarReloj();
    sonidos.racha();
    const nivel = partida.ayudas[p.id] ?? 0;
    if (rompecraneos && nivel === 0) {
      setMensaje(`Pista: la palabra empieza por ${p.norm[0]}. ${textoCastigo}.`);
    } else {
      senalar(p);
    }
    setPartida((prev) => ({
      ...prev,
      pistas: prev.pistas + 1,
      ayudas: { ...prev.ayudas, [p.id]: Math.min(2, nivel + 1) },
    }));
  };

  const darPista = () => {
    if (partida.fin) return;
    const faltan = sopa.palabras.filter((p) => !encontradasIds.has(p.id));
    if (!faltan.length) return;
    // primero las que todavía no tienen ayuda
    const menor = Math.min(...faltan.map((p) => partida.ayudas[p.id] ?? 0));
    const opciones = faltan.filter((p) => (partida.ayudas[p.id] ?? 0) === menor);
    ayudarCon(opciones[Math.floor(Math.random() * opciones.length)]);
  };

  // Línea que se dibuja mientras eliges
  let vista = null;
  if (arrastre) vista = { inicio: arrastre.inicio, fin: arrastre.fin };
  else if (ancla) {
    const objetivo = hover ?? (enfocado ? cursor : null);
    vista = { inicio: ancla, fin: objetivo && lineaEntre(ancla, objetivo) ? objetivo : ancla };
  }

  const tema_ = TEMAS[partida.idTema];
  const indiceDif = ORDEN_DIFICULTADES.indexOf(dificultad);
  const siguiente = ORDEN_DIFICULTADES[indiceDif + 1];
  const direcciones = dif.direcciones.map(([a, b]) => FLECHAS[`${a},${b}`]).join(' ');

  return (
    <div className="sopa">
      <section className="sopa-opciones" aria-label="Opciones de la sopa de letras">
        <div className="selector" role="group" aria-label="Dificultad">
          {ORDEN_DIFICULTADES.map((id) => (
            <button
              key={id}
              type="button"
              className={`selector__opcion ${dificultad === id ? 'activa' : ''}`}
              aria-pressed={dificultad === id}
              onClick={() => nueva({ dificultad: id })}
            >
              {DIFICULTADES[id].nombre}
              <small>
                {DIFICULTADES[id].tam}×{DIFICULTADES[id].tam}
              </small>
            </button>
          ))}
        </div>

        <div className="selector sopa-modos" role="group" aria-label="Modo de juego">
          {ORDEN_MODOS.map((id) => (
            <button
              key={id}
              type="button"
              className={`selector__opcion ${modo === id ? 'activa' : ''}`}
              aria-pressed={modo === id}
              title={MODOS[id].descripcion}
              onClick={() => nueva({ modo: id })}
            >
              <span aria-hidden="true">{MODOS[id].icono}</span> {MODOS[id].nombre}
            </button>
          ))}
        </div>

        <label className="sopa-tema">
          <span>Tema</span>
          <select value={tema} onChange={(e) => nueva({ tema: e.target.value })}>
            <option value="azar">🎲 Al azar</option>
            {ORDEN_TEMAS.map((id) => (
              <option key={id} value={id}>
                {TEMAS[id].icono} {TEMAS[id].nombre}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="sopa-marcador" aria-label="Marcador">
        <div className="dato">
          <span className="dato__titulo">{contrarreloj ? 'Quedan' : 'Tiempo'}</span>
          <span className={`dato__valor ${contrarreloj && partida.inicio && restante < 20000 ? 'sopa-urgente' : ''}`}>
            {formatoTiempo(tiempo)}
          </span>
        </div>
        <div className="dato">
          <span className="dato__titulo">Palabras</span>
          <span className="dato__valor">
            {partida.encontradas.length}/{sopa.palabras.length}
          </span>
        </div>
        <div className="dato">
          <span className="dato__titulo">Pistas</span>
          <span className="dato__valor">{partida.pistas}</span>
        </div>
        <div className="dato">
          <span className="dato__titulo">🏆 Récord</span>
          <span className="dato__valor">{textoRecord}</span>
        </div>
      </section>

      <main className="mesa sopa-mesa">
        <article className="sopa-hoja">
          <header className="sopa-hoja__cabeza">
            <div>
              <p className="sopa-hoja__numero">Pasatiempo N.º {partida.numero}</p>
              <h2 className="sopa-hoja__titulo">Sopa de letras</h2>
            </div>
            <p className="sopa-hoja__tema">
              <span aria-hidden="true">{tema_.icono}</span> {tema_.nombre}
              <small>
                {dif.nombre} · {MODOS[modo].nombre}
              </small>
            </p>
          </header>

          <div className="sopa-hoja__cuerpo">
            <div className="sopa-caja" style={{ '--tam': tam }}>
              <div
                ref={grillaRef}
                className={`sopa-grilla ${enfocado ? 'sopa-grilla--enfocada' : ''}`}
                role="grid"
                aria-label={`Sopa de letras de ${tam} por ${tam}. Usa las flechas para moverte y Enter para marcar la primera y la última letra de una palabra.`}
                aria-activedescendant={`sopa-c-${cursor.fila}-${cursor.col}`}
                tabIndex={0}
                onPointerDown={alBajar}
                onPointerMove={alMover}
                onPointerUp={alSoltar}
                onPointerCancel={alCancelar}
                onPointerLeave={() => setHover(null)}
                onKeyDown={alTeclear}
                onFocus={() => setEnfocado(true)}
                onBlur={() => setEnfocado(false)}
              >
                {sopa.grilla.map((fila, f) => (
                  <div role="row" className="sopa-fila" key={f}>
                    {fila.map((letra, c) => {
                      const clases = ['sopa-celda'];
                      if (enfocado && cursor.fila === f && cursor.col === c) clases.push('sopa-celda--cursor');
                      if (pista && pista.fila === f && pista.col === c) clases.push('sopa-celda--pista');
                      if (iguales(ancla, { fila: f, col: c })) clases.push('sopa-celda--ancla');
                      return (
                        <span
                          key={c}
                          id={`sopa-c-${f}-${c}`}
                          role="gridcell"
                          className={clases.join(' ')}
                          aria-label={`${letra}, fila ${f + 1}, columna ${c + 1}`}
                          aria-selected={iguales(ancla, { fila: f, col: c })}
                        >
                          {letra}
                        </span>
                      );
                    })}
                  </div>
                ))}

                <svg className="sopa-trazos" viewBox={`0 0 ${tam} ${tam}`} preserveAspectRatio="none" aria-hidden="true">
                  {partida.encontradas.map((e) => {
                    const a = centro(e.inicio);
                    const b = centro(e.fin);
                    return (
                      <g key={e.id} className={`sopa-capsula ${recien === e.id ? 'sopa-capsula--nueva' : ''}`}>
                        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.color} pathLength="1" className="sopa-capsula__relleno" />
                      </g>
                    );
                  })}
                  {error && (
                    <line
                      key={error.n}
                      className="sopa-error"
                      x1={centro(error.inicio).x}
                      y1={centro(error.inicio).y}
                      x2={centro(error.fin).x}
                      y2={centro(error.fin).y}
                    />
                  )}
                  {vista &&
                    (iguales(vista.inicio, vista.fin) ? (
                      <circle className="sopa-seleccion sopa-seleccion--punto" cx={centro(vista.inicio).x} cy={centro(vista.inicio).y} r="0.42" />
                    ) : (
                      <line
                        className="sopa-seleccion"
                        x1={centro(vista.inicio).x}
                        y1={centro(vista.inicio).y}
                        x2={centro(vista.fin).x}
                        y2={centro(vista.fin).y}
                      />
                    ))}
                </svg>
              </div>
            </div>

            <aside className="sopa-lista-caja">
              <h3>{rompecraneos ? '¿Qué palabra es?' : 'Palabras a buscar'}</h3>
              {rompecraneos && <p className="sopa-instruccion">Lee la pista, adivina la palabra y búscala en la sopa.</p>}
              <ul className={`sopa-lista ${rompecraneos ? 'sopa-lista--definiciones' : ''}`}>
                {sopa.palabras.map((p) => {
                  const hallada = encontradasIds.has(p.id);
                  const clases = `${hallada ? 'sopa-lista__hallada' : ''} ${recien === p.id ? 'sopa-lista__recien' : ''}`;
                  if (rompecraneos) {
                    const ayuda = partida.ayudas[p.id] ?? 0;
                    return (
                      <li key={p.id} className={`sopa-def ${clases}`}>
                        <span className="sopa-lista__marca" style={hallada ? { background: colorDe[p.id] } : undefined} aria-hidden="true" />
                        <span className="sopa-def__cuerpo">
                          <span className="sopa-def__texto">{p.definicion}</span>
                          {hallada ? (
                            <span className="sopa-def__palabra">{p.texto}</span>
                          ) : (
                            <span
                              className="sopa-def__mascara"
                              aria-label={`${p.norm.length} letras${ayuda ? `, empieza por ${p.norm[0]}` : ''}`}
                            >
                              {mascara(p.norm, ayuda ? 1 : 0)}
                            </span>
                          )}
                        </span>
                        {!hallada && !partida.fin && (
                          <button
                            type="button"
                            className="sopa-def__ayuda"
                            onClick={() => ayudarCon(p)}
                            aria-label={ayuda ? 'Señalar dónde empieza esta palabra' : 'Ver la primera letra de esta palabra'}
                            title={ayuda ? 'Señalar en la sopa (+15 s)' : 'Ver primera letra (+15 s)'}
                          >
                            💡
                          </button>
                        )}
                      </li>
                    );
                  }
                  return (
                    <li key={p.id} className={clases}>
                      <span className="sopa-lista__marca" style={hallada ? { background: colorDe[p.id] } : undefined} aria-hidden="true" />
                      <span className="sopa-lista__texto">{p.texto}</span>
                      {hallada && <span className="sopa-sr"> (encontrada)</span>}
                    </li>
                  );
                })}
              </ul>
              <p className="sopa-direcciones">
                Direcciones: <span>{direcciones}</span>
              </p>
            </aside>
          </div>
        </article>

        <div className="sopa-lapiz" aria-hidden="true" />
      </main>

      <footer className="pie sopa-pie">
        <div className="sopa-pie__botones">
          <button type="button" className="boton" onClick={() => nueva()}>
            ↻ Nueva sopa
          </button>
          <button type="button" className="boton" onClick={darPista} disabled={!!partida.fin}>
            💡 Pista <small>({contrarreloj ? '−15 s' : '+15 s'})</small>
          </button>
        </div>
        <p>Arrastra sobre las letras, o toca la primera y luego la última. Con teclado: flechas y Enter.</p>
      </footer>

      <p className="sopa-sr" aria-live="polite">
        {mensaje}
      </p>

      {partida.fin && (
        <Victoria
          tiempo={tiempo}
          pistas={partida.pistas}
          palabras={sopa.palabras.length}
          halladas={partida.encontradas.length}
          modo={modo}
          agotado={partida.agotado}
          nuevoRecord={nuevoRecord}
          record={record}
          dificultad={dificultad}
          haySiguiente={!!siguiente}
          onOtraVez={() => nueva()}
          onSiguiente={() => nueva({ dificultad: siguiente })}
        />
      )}
    </div>
  );
}
