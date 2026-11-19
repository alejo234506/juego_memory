import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  NIVELES,
  ORDEN_NIVELES,
  generarSudoku,
  fila,
  columna,
  caja,
  conflictos,
  restantes,
  estaResuelto,
  celdaParaPista,
  limpiarNotas,
  calcularEstrellas,
  esMejorMarca,
} from './logica.js';
import { formatoTiempo } from '../../logica/juego.js';
import { sonidos } from '../../logica/sonido.js';
import { leer, guardar } from '../../logica/almacen.js';
import './sudoku.css';

const LIMITE_ERRORES = 3;
const COLORES_CONFETI = ['#ffcf4a', '#ff6b8b', '#4ad9a0', '#5cb8ff', '#b78cff', '#ff9f43'];

// ================== Estado de la partida ==================
function partidaDesde(sudoku) {
  const nivel = NIVELES[sudoku.nivel];
  return {
    nivel: sudoku.nivel,
    fijas: sudoku.tablero.map(Boolean),
    solucion: sudoku.solucion,
    valores: [...sudoku.tablero],
    notas: new Array(nivel.n * nivel.n).fill(0),
    historial: [],
    errores: 0,
    pistas: 0,
    inicio: null,
    fin: null,
    perdida: false,
    seleccion: sudoku.tablero.findIndex((v) => !v),
    ultimo: null,
  };
}

function conHistorial(p) {
  // Guardamos hasta 200 pasos para poder deshacer
  return [...p.historial.slice(-199), { valores: p.valores, notas: p.notas }];
}

export function reducer(p, accion) {
  if (accion.type === 'NUEVA') return partidaDesde(accion.sudoku);
  if (accion.type === 'RESTAURAR') return accion.partida;
  if (!p) return p;

  const nivel = NIVELES[p.nivel];
  const { n } = nivel;
  const terminada = p.fin || p.perdida;
  const k = (p.ultimo?.k ?? 0) + 1;

  switch (accion.type) {
    case 'SELECCIONAR':
      return { ...p, seleccion: accion.i };

    case 'CONTINUAR':
      return { ...p, perdida: false };

    case 'MOVER': {
      const i = p.seleccion < 0 ? 0 : p.seleccion;
      let f = fila(i, n);
      let c = columna(i, n);
      if (accion.tecla === 'ArrowUp') f = (f - 1 + n) % n;
      if (accion.tecla === 'ArrowDown') f = (f + 1) % n;
      if (accion.tecla === 'ArrowLeft') c = (c - 1 + n) % n;
      if (accion.tecla === 'ArrowRight') c = (c + 1) % n;
      return { ...p, seleccion: f * n + c };
    }

    case 'ESCRIBIR': {
      const i = p.seleccion;
      const v = accion.valor;
      if (terminada || i < 0 || p.fijas[i] || v < 1 || v > n) return p;
      const inicio = p.inicio ?? accion.ahora;

      if (accion.notas) {
        if (p.valores[i]) return p;
        const notas = [...p.notas];
        notas[i] ^= 1 << v;
        return { ...p, inicio, notas, historial: conHistorial(p), ultimo: { tipo: 'nota', i, k } };
      }

      // Tocar el mismo número otra vez lo borra
      if (p.valores[i] === v) {
        const valores = [...p.valores];
        valores[i] = 0;
        return { ...p, inicio, valores, historial: conHistorial(p), ultimo: { tipo: 'borrar', i, k } };
      }

      const valores = [...p.valores];
      valores[i] = v;
      const correcto = v === p.solucion[i];
      const notas = correcto ? limpiarNotas(p.notas, i, v, nivel) : p.notas;
      const errores = p.errores + (correcto ? 0 : 1);
      const fin = estaResuelto(valores, p.solucion) ? accion.ahora : null;
      const perdida = !fin && accion.limite && errores >= LIMITE_ERRORES;
      return {
        ...p,
        inicio,
        valores,
        notas,
        errores,
        fin,
        perdida,
        historial: conHistorial(p),
        ultimo: { tipo: fin ? 'victoria' : correcto ? 'ok' : 'error', i, k },
      };
    }

    case 'BORRAR': {
      const i = p.seleccion;
      if (terminada || i < 0 || p.fijas[i] || (!p.valores[i] && !p.notas[i])) return p;
      const valores = [...p.valores];
      const notas = [...p.notas];
      if (valores[i]) valores[i] = 0;
      else notas[i] = 0;
      return { ...p, valores, notas, historial: conHistorial(p), ultimo: { tipo: 'borrar', i, k } };
    }

    case 'DESHACER': {
      if (terminada || !p.historial.length) return p;
      const anterior = p.historial[p.historial.length - 1];
      return { ...p, ...anterior, historial: p.historial.slice(0, -1), ultimo: { tipo: 'deshacer', i: p.seleccion, k } };
    }

    case 'PISTA': {
      if (terminada) return p;
      const i = celdaParaPista(p.valores, p.solucion, p.fijas, p.seleccion);
      if (i == null) return p;
      const valores = [...p.valores];
      valores[i] = p.solucion[i];
      const notas = limpiarNotas(p.notas, i, valores[i], nivel);
      const fin = estaResuelto(valores, p.solucion) ? accion.ahora : null;
      return {
        ...p,
        inicio: p.inicio ?? accion.ahora,
        valores,
        notas,
        pistas: p.pistas + 1,
        seleccion: i,
        fin,
        historial: conHistorial(p),
        ultimo: { tipo: fin ? 'victoria' : 'pista', i, k },
      };
    }

    default:
      return p;
  }
}

// ================== Pantallas finales ==================
function Confeti() {
  const piezas = useMemo(
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
    <div className="confeti" aria-hidden="true">
      {piezas.map((p) => (
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
  );
}

function Final({ partida, ganada, nuevoRecord, record, haySiguiente, onOtra, onSiguiente, onReintentar }) {
  const botonRef = useRef(null);
  useEffect(() => botonRef.current?.focus(), []);
  const nivel = NIVELES[partida.nivel];
  const estrellas = calcularEstrellas(partida.errores, partida.pistas);
  const tiempo = (partida.fin ?? Date.now()) - (partida.inicio ?? Date.now());

  return (
    <div className="victoria" role="dialog" aria-modal="true" aria-labelledby="sdk-titulo-final">
      {ganada && <Confeti />}
      <div className="victoria__tarjeta">
        <p className="victoria__nivel">
          Sudoku {nivel.nombre} · {nivel.detalle}
        </p>
        <h2 id="sdk-titulo-final">{ganada ? '¡Sudoku resuelto! 🧠' : 'Se acabaron los intentos 😵'}</h2>

        {ganada ? (
          <div className="victoria__estrellas" aria-label={`${estrellas} de 3 estrellas`}>
            {[1, 2, 3].map((n) => (
              <span key={n} className={n <= estrellas ? 'llena' : ''} style={{ '--n': n }}>
                ★
              </span>
            ))}
          </div>
        ) : (
          <p className="sdk-final__texto">
            Cometiste {LIMITE_ERRORES} errores. Puedes seguir intentándolo con el mismo sudoku o probar uno nuevo.
          </p>
        )}

        {nuevoRecord && <p className="victoria__record">🏆 ¡Nuevo récord!</p>}

        <dl className="victoria__datos">
          <div>
            <dt>Tiempo</dt>
            <dd>{formatoTiempo(tiempo)}</dd>
          </div>
          <div>
            <dt>Errores</dt>
            <dd>{partida.errores}</dd>
          </div>
          <div>
            <dt>Pistas</dt>
            <dd>{partida.pistas}</dd>
          </div>
        </dl>

        {ganada && record && !nuevoRecord && <p className="victoria__mejor">Tu récord: {formatoTiempo(record.tiempo)}</p>}

        <div className="victoria__botones">
          {ganada ? (
            <>
              <button type="button" ref={botonRef} className="boton boton--principal" onClick={onOtra}>
                Otro sudoku
              </button>
              {haySiguiente && (
                <button type="button" className="boton" onClick={onSiguiente}>
                  Más difícil →
                </button>
              )}
            </>
          ) : (
            <>
              <button type="button" ref={botonRef} className="boton boton--principal" onClick={onReintentar}>
                Seguir con este
              </button>
              <button type="button" className="boton" onClick={onOtra}>
                Sudoku nuevo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ================== Juego ==================
const prefsIniciales = () => {
  const p = leer('sudoku-prefs', {});
  return {
    nivel: p.nivel in NIVELES ? p.nivel : 'facil',
    mostrarErrores: p.mostrarErrores ?? true,
    limite: p.limite ?? false,
  };
};

function partidaGuardada() {
  const p = leer('sudoku-partida', null);
  if (!p || !(p.nivel in NIVELES) || p.fin || !Array.isArray(p.valores)) return null;
  const tam = NIVELES[p.nivel].n ** 2;
  if (p.valores.length !== tam || p.solucion?.length !== tam) return null;
  return { ...p, historial: [], ultimo: null, perdida: false, inicio: p.inicio ? Date.now() - (p.transcurrido ?? 0) : null };
}

const Sudoku = () => {
  const [prefs, setPrefs] = useState(prefsIniciales);
  const [partida, despachar] = useReducer(reducer, null, partidaGuardada);
  const [pedido, setPedido] = useState(() => (partida ? null : { nivel: prefs.nivel, k: 0 }));
  const [modoNotas, setModoNotas] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());
  const [records, setRecords] = useState(() => leer('sudoku-records', {}));
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [continuando, setContinuando] = useState(false);
  const tableroRef = useRef(null);

  const generando = !!pedido;
  const nivel = partida ? NIVELES[partida.nivel] : NIVELES[prefs.nivel];
  const { n } = nivel;

  // Generar un sudoku nuevo (en el siguiente "tick" para que se vea el aviso)
  useEffect(() => {
    if (!pedido) return;
    const t = setTimeout(() => {
      despachar({ type: 'NUEVA', sudoku: generarSudoku(pedido.nivel) });
      setPedido(null);
      setNuevoRecord(false);
      setContinuando(false);
      requestAnimationFrame(() => tableroRef.current?.querySelector('[tabindex="0"]')?.focus());
    }, 40);
    return () => clearTimeout(t);
  }, [pedido]);

  useEffect(() => {
    guardar('sudoku-prefs', prefs);
  }, [prefs]);

  // Guardar la partida en curso para retomarla después
  useEffect(() => {
    if (!partida) return;
    if (partida.fin) {
      guardar('sudoku-partida', null);
      return;
    }
    const { historial, ultimo, ...resto } = partida;
    guardar('sudoku-partida', { ...resto, transcurrido: partida.inicio ? Date.now() - partida.inicio : 0 });
  }, [partida]);

  // Cronómetro
  useEffect(() => {
    if (!partida?.inicio || partida.fin || (partida.perdida && !continuando)) return;
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(t);
  }, [partida?.inicio, partida?.fin, partida?.perdida, continuando]);

  // Sonidos y récords
  useEffect(() => {
    const u = partida?.ultimo;
    if (!u) return;
    if (u.tipo === 'ok' || u.tipo === 'nota' || u.tipo === 'borrar' || u.tipo === 'deshacer') sonidos.voltear();
    if (u.tipo === 'error') sonidos.fallo();
    if (u.tipo === 'pista') sonidos.pareja();
    if (u.tipo === 'victoria') {
      setTimeout(sonidos.victoria, 200);
      const marca = { tiempo: partida.fin - partida.inicio, errores: partida.errores, pistas: partida.pistas };
      const esNuevo = esMejorMarca(marca, records[partida.nivel]);
      setNuevoRecord(esNuevo);
      if (esNuevo) {
        const nuevos = { ...records, [partida.nivel]: marca };
        setRecords(nuevos);
        guardar('sudoku-records', nuevos);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partida?.ultimo]);

  // El foco sigue a la celda seleccionada cuando se usa el teclado
  useEffect(() => {
    const tablero = tableroRef.current;
    if (!tablero || !partida || !tablero.contains(document.activeElement)) return;
    tablero.querySelector(`[data-i="${partida.seleccion}"]`)?.focus();
  }, [partida?.seleccion, partida]);

  const nuevo = (idNivel = prefs.nivel) => {
    setPrefs((p) => ({ ...p, nivel: idNivel }));
    setPedido({ nivel: idNivel, k: Date.now() });
  };

  const escribir = (valor) =>
    despachar({ type: 'ESCRIBIR', valor, notas: modoNotas, ahora: Date.now(), limite: prefs.limite && !continuando });

  const alPresionarTecla = (e) => {
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      despachar({ type: 'MOVER', tecla: e.key });
      return;
    }
    if (/^[1-9]$/.test(e.key)) {
      e.preventDefault();
      escribir(Number(e.key));
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      e.preventDefault();
      despachar({ type: 'BORRAR' });
      return;
    }
    if (e.key.toLowerCase() === 'n') {
      setModoNotas((m) => !m);
      return;
    }
    if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      despachar({ type: 'DESHACER' });
    }
  };

  // ----- Datos para dibujar -----
  const valores = partida?.valores ?? [];
  const malos = useMemo(() => (partida ? conflictos(partida.valores, nivel) : new Set()), [partida, nivel]);
  const faltan = useMemo(() => (partida ? restantes(partida.valores, nivel) : []), [partida, nivel]);
  const sel = partida?.seleccion ?? -1;
  const valorSel = sel >= 0 ? valores[sel] : 0;
  const cajaSel = sel >= 0 ? caja(sel, nivel) : -1;
  const tiempo = partida?.inicio ? Math.max(0, (partida.fin ?? ahora) - partida.inicio) : 0;
  const record = partida ? records[partida.nivel] : null;
  const indiceNivel = ORDEN_NIVELES.indexOf(partida?.nivel ?? prefs.nivel);
  const siguiente = ORDEN_NIVELES[indiceNivel + 1];
  const columnasNotas = 3;

  return (
    <div className="sdk">
      <section className="opciones" aria-label="Opciones del sudoku">
        <div className="selector" role="group" aria-label="Nivel">
          {ORDEN_NIVELES.map((id) => (
            <button
              key={id}
              type="button"
              className={`selector__opcion ${(partida?.nivel ?? prefs.nivel) === id ? 'activa' : ''}`}
              aria-pressed={(partida?.nivel ?? prefs.nivel) === id}
              onClick={() => nuevo(id)}
            >
              {NIVELES[id].nombre}
              <small>{NIVELES[id].detalle}</small>
            </button>
          ))}
        </div>
        <div className="sdk-interruptores">
          <label className="sdk-interruptor">
            <input
              type="checkbox"
              checked={prefs.mostrarErrores}
              onChange={(e) => setPrefs((p) => ({ ...p, mostrarErrores: e.target.checked }))}
            />
            <span className="sdk-interruptor__pista" aria-hidden="true" />
            Mostrar errores
          </label>
          <label className="sdk-interruptor">
            <input type="checkbox" checked={prefs.limite} onChange={(e) => setPrefs((p) => ({ ...p, limite: e.target.checked }))} />
            <span className="sdk-interruptor__pista" aria-hidden="true" />
            Máx. {LIMITE_ERRORES} errores
          </label>
        </div>
      </section>

      <section className="marcador sdk-marcador" aria-live="polite">
        <div className="dato">
          <span className="dato__titulo">Tiempo</span>
          <span className="dato__valor">{formatoTiempo(tiempo)}</span>
        </div>
        <div className={`dato ${partida?.errores && prefs.limite ? 'sdk-dato--alerta' : ''}`}>
          <span className="dato__titulo">Errores</span>
          <span className="dato__valor">
            {partida?.errores ?? 0}
            {prefs.limite && !continuando ? `/${LIMITE_ERRORES}` : ''}
          </span>
        </div>
        <div className="dato">
          <span className="dato__titulo">Pistas</span>
          <span className="dato__valor">{partida?.pistas ?? 0}</span>
        </div>
        <div className="dato dato--record">
          <span className="dato__titulo">🏆 Récord</span>
          <span className="dato__valor">{record ? formatoTiempo(record.tiempo) : '—'}</span>
        </div>
      </section>

      <main className="mesa sdk-mesa">
        <div className="sdk-hoja">
          <header className="sdk-hoja__cabecera">
            <span className="sdk-hoja__periodico">El Diario de la Mente</span>
            <span className="sdk-hoja__seccion">
              Pasatiempos · Sudoku {nivel.nombre.toLowerCase()}
            </span>
          </header>

          {generando || !partida ? (
            <div className="sdk-generando" role="status">
              <span className="sdk-generando__lapiz" aria-hidden="true">
                ✏️
              </span>
              Preparando un sudoku nuevo…
            </div>
          ) : (
            <div className="sdk-juego">
              <div
                ref={tableroRef}
                className={`sdk-tablero sdk-tablero--${n}`}
                style={{ '--n': n }}
                role="grid"
                aria-label={`Sudoku ${n} por ${n}. Usa las flechas para moverte, los números para escribir, N para notas y Retroceso para borrar.`}
                onKeyDown={alPresionarTecla}
              >
                {valores.map((v, i) => {
                  const f = fila(i, n);
                  const c = columna(i, n);
                  const fija = partida.fijas[i];
                  const seleccionada = i === sel;
                  const vecina = !seleccionada && sel >= 0 && (f === fila(sel, n) || c === columna(sel, n) || caja(i, nivel) === cajaSel);
                  const igual = !seleccionada && v && v === valorSel;
                  const conflicto = malos.has(i) && !fija;
                  const equivocada = prefs.mostrarErrores && !fija && v && v !== partida.solucion[i];
                  const animar = partida.ultimo?.i === i ? partida.ultimo : null;
                  const clases = [
                    'sdk-celda',
                    fija && 'sdk-celda--fija',
                    seleccionada && 'sdk-celda--seleccionada',
                    vecina && 'sdk-celda--vecina',
                    igual && 'sdk-celda--igual',
                    (conflicto || equivocada) && 'sdk-celda--error',
                    (c + 1) % nivel.colsCaja === 0 && c < n - 1 && 'sdk-celda--borde-der',
                    (f + 1) % nivel.filasCaja === 0 && f < n - 1 && 'sdk-celda--borde-abajo',
                    animar?.tipo === 'ok' && 'sdk-celda--ok',
                    animar?.tipo === 'pista' && 'sdk-celda--pista',
                    animar?.tipo === 'error' && 'sdk-celda--sacudir',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  const notasCelda = partida.notas[i];
                  const listaNotas = [];
                  for (let d = 1; d <= n; d++) if (notasCelda & (1 << d)) listaNotas.push(d);
                  return (
                    <button
                      key={animar ? `${i}-${animar.k}` : i}
                      type="button"
                      role="gridcell"
                      data-i={i}
                      tabIndex={seleccionada ? 0 : -1}
                      className={clases}
                      aria-selected={seleccionada}
                      aria-label={`Fila ${f + 1}, columna ${c + 1}: ${v || 'vacía'}${fija ? ', fija' : ''}${
                        listaNotas.length ? `, notas ${listaNotas.join(' ')}` : ''
                      }`}
                      onClick={() => despachar({ type: 'SELECCIONAR', i })}
                    >
                      {v ? (
                        <span className="sdk-celda__valor">{v}</span>
                      ) : notasCelda ? (
                        <span className="sdk-notas" style={{ '--cols-notas': columnasNotas }} aria-hidden="true">
                          {Array.from({ length: n }, (_, k) => (
                            <span key={k} className={notasCelda & (1 << (k + 1)) ? 'activa' : ''}>
                              {k + 1}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="sdk-controles">
                <div className="sdk-teclado" role="group" aria-label="Números">
                  {Array.from({ length: n }, (_, k) => k + 1).map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`sdk-tecla ${faltan[d] === 0 ? 'sdk-tecla--completa' : ''} ${modoNotas ? 'sdk-tecla--nota' : ''}`}
                      onClick={() => escribir(d)}
                      aria-label={`${modoNotas ? 'Nota' : 'Número'} ${d}, faltan ${faltan[d]}`}
                    >
                      <span className="sdk-tecla__numero">{d}</span>
                      <small className="sdk-tecla__faltan">{faltan[d] > 0 ? `faltan ${faltan[d]}` : '✓'}</small>
                    </button>
                  ))}
                </div>
                <div className="sdk-herramientas">
                  <button
                    type="button"
                    className={`sdk-herramienta ${modoNotas ? 'activa' : ''}`}
                    aria-pressed={modoNotas}
                    onClick={() => setModoNotas((m) => !m)}
                    title="Notas a lápiz (tecla N)"
                  >
                    <span aria-hidden="true">✏️</span> Notas {modoNotas ? 'ON' : 'OFF'}
                  </button>
                  <button type="button" className="sdk-herramienta" onClick={() => despachar({ type: 'BORRAR' })} title="Borrar (Retroceso)">
                    <span aria-hidden="true">⌫</span> Borrar
                  </button>
                  <button
                    type="button"
                    className="sdk-herramienta"
                    onClick={() => despachar({ type: 'DESHACER' })}
                    disabled={!partida.historial.length}
                    title="Deshacer (Ctrl + Z)"
                  >
                    <span aria-hidden="true">↶</span> Deshacer
                  </button>
                  <button type="button" className="sdk-herramienta" onClick={() => despachar({ type: 'PISTA', ahora: Date.now() })} title="Rellena una celda">
                    <span aria-hidden="true">💡</span> Pista
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="pie">
        <button type="button" className="boton" onClick={() => nuevo()}>
          ↻ Sudoku nuevo
        </button>
        <p>Cada fila, columna y caja debe tener todos los números sin repetir. Teclado: flechas, números, N = notas.</p>
      </footer>

      {partida && (partida.fin || (partida.perdida && !continuando)) && (
        <Final
          partida={partida}
          ganada={!!partida.fin}
          nuevoRecord={nuevoRecord}
          record={record}
          haySiguiente={!!siguiente}
          onOtra={() => nuevo()}
          onSiguiente={() => nuevo(siguiente)}
          onReintentar={() => {
            setContinuando(true);
            despachar({ type: 'CONTINUAR' });
            requestAnimationFrame(() => tableroRef.current?.querySelector('[tabindex="0"]')?.focus());
          }}
        />
      )}
    </div>
  );
};

export default Sudoku;
