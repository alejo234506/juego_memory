import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NIVELES,
  ORDEN_NIVELES,
  GEMAS,
  VARIANTES,
  reglas,
  generarCodigo,
  evaluar,
  esValido,
  contarPosibles,
  gano,
  actualizarEstadisticas,
  promedio,
  calcularEstrellas,
} from './logica.js';
import { formatoTiempo } from '../../logica/juego.js';
import { sonidos } from '../../logica/sonido.js';
import { leer, guardar } from '../../logica/almacen.js';
import './codigo.css';

const COLORES_CONFETI = ['#ffcf4a', '#ff6b8b', '#4ad9a0', '#5cb8ff', '#b78cff', '#ff9f43'];

function partidaNueva(nivel, variante) {
  const r = reglas(nivel, variante);
  return {
    nivel,
    variante,
    codigo: generarCodigo(r),
    filas: [],
    actual: new Array(r.huecos).fill(null),
    activo: 0,
    fin: null, // 'gano' | 'perdio'
    inicio: null,
    terminoEn: null,
  };
}

const nombreSimbolo = (s, variante) => (variante === 'numeros' ? `número ${s}` : GEMAS[s].nombre);

// ================== Una ficha (gema o número) ==================
function Ficha({ simbolo, variante, pequena = false }) {
  if (simbolo == null) return null;
  if (variante === 'numeros') {
    return <span className={`cod-ficha cod-ficha--numero ${pequena ? 'cod-ficha--pequena' : ''}`}>{simbolo}</span>;
  }
  const g = GEMAS[simbolo];
  return (
    <span className={`cod-ficha cod-ficha--gema ${pequena ? 'cod-ficha--pequena' : ''}`} style={{ '--gema': g.color }}>
      <span className="cod-ficha__forma">{g.forma}</span>
    </span>
  );
}

// ================== Pistas (clavijas ● ○) ==================
function Pistas({ negras, blancas, huecos }) {
  const lista = [
    ...Array(negras).fill('negra'),
    ...Array(blancas).fill('blanca'),
    ...Array(Math.max(0, huecos - negras - blancas)).fill('vacia'),
  ];
  return (
    <span
      className="cod-pistas"
      style={{ '--cols-pistas': Math.ceil(huecos / 2) }}
      aria-label={`${negras} en su lugar, ${blancas} en otro lugar`}
      title={`● ${negras} en su lugar · ○ ${blancas} en otro lugar`}
    >
      {lista.map((tipo, i) => (
        <span key={i} className={`cod-clavija cod-clavija--${tipo}`} aria-hidden="true" />
      ))}
    </span>
  );
}

// ================== Pantalla final ==================
function Final({ partida, est, onOtra, onSiguiente, haySiguiente }) {
  const botonRef = useRef(null);
  useEffect(() => botonRef.current?.focus(), []);
  const r = reglas(partida.nivel, partida.variante);
  const ganada = partida.fin === 'gano';
  const usados = partida.filas.length;
  const estrellas = calcularEstrellas(usados, r);
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
  const prom = promedio(est);

  return (
    <div className="victoria" role="dialog" aria-modal="true" aria-labelledby="cod-titulo-final">
      {ganada && (
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
      )}
      <div className="victoria__tarjeta">
        <p className="victoria__nivel">
          Código secreto · {NIVELES[partida.nivel].nombre} · {VARIANTES[partida.variante].nombre}
        </p>
        <h2 id="cod-titulo-final">{ganada ? '¡Código descifrado! 🔓' : 'La caja sigue cerrada 🔒'}</h2>

        {ganada && (
          <div className="victoria__estrellas" aria-label={`${estrellas} de 3 estrellas`}>
            {[1, 2, 3].map((n) => (
              <span key={n} className={n <= estrellas ? 'llena' : ''} style={{ '--n': n }}>
                ★
              </span>
            ))}
          </div>
        )}

        <div className="cod-final__codigo" aria-label={`El código era: ${partida.codigo.map((s) => nombreSimbolo(s, partida.variante)).join(', ')}`}>
          <span className="cod-final__etiqueta">{ganada ? 'Lo lograste en ' + usados + (usados === 1 ? ' intento' : ' intentos') : 'El código era'}</span>
          <span className="cod-final__fichas">
            {partida.codigo.map((s, i) => (
              <span key={i} className="cod-hueco cod-hueco--lleno" style={{ '--i': i }}>
                <Ficha simbolo={s} variante={partida.variante} />
              </span>
            ))}
          </span>
        </div>

        <dl className="victoria__datos">
          <div>
            <dt>Tiempo</dt>
            <dd>{formatoTiempo((partida.terminoEn ?? 0) - (partida.inicio ?? partida.terminoEn ?? 0))}</dd>
          </div>
          <div>
            <dt>Ganadas</dt>
            <dd>
              {est.ganadas}/{est.jugadas}
            </dd>
          </div>
          <div>
            <dt>Racha</dt>
            <dd>{est.racha} 🔥</dd>
          </div>
        </dl>
        <p className="victoria__mejor">
          {prom ? `Promedio: ${prom.toFixed(1)} intentos · Mejor: ${est.mejor}` : 'Todavía no has ganado en este nivel.'}
        </p>

        <div className="victoria__botones">
          <button type="button" ref={botonRef} className="boton boton--principal" onClick={onOtra}>
            {ganada ? 'Otro código' : 'Intentar otro'}
          </button>
          {ganada && haySiguiente && (
            <button type="button" className="boton" onClick={onSiguiente}>
              Más difícil →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ================== Juego ==================
const prefsIniciales = () => {
  const p = leer('codigo-prefs', {});
  return {
    nivel: p.nivel in NIVELES ? p.nivel : 'facil',
    variante: p.variante in VARIANTES ? p.variante : 'gemas',
    ayuda: !!p.ayuda,
  };
};

const CodigoSecreto = () => {
  const [prefs, setPrefs] = useState(prefsIniciales);
  const [partida, setPartida] = useState(() => partidaNueva(prefs.nivel, prefs.variante));
  const [stats, setStats] = useState(() => leer('codigo-stats', {}));
  const [aviso, setAviso] = useState(null);
  const [sacudir, setSacudir] = useState(0);
  const [ahora, setAhora] = useState(() => Date.now());
  const [arrastrando, setArrastrando] = useState(null);

  const r = reglas(partida.nivel, partida.variante);
  const clave = `${partida.variante}-${partida.nivel}`;
  const est = stats[clave] ?? { jugadas: 0, ganadas: 0, racha: 0, mejorRacha: 0, sumaIntentos: 0, mejor: null };
  const simbolos = Array.from({ length: r.colores }, (_, i) => i);
  const completo = partida.actual.every((s) => s != null);
  const tiempo = partida.inicio ? Math.max(0, (partida.terminoEn ?? ahora) - partida.inicio) : 0;
  const indiceNivel = ORDEN_NIVELES.indexOf(partida.nivel);
  const siguiente = ORDEN_NIVELES[indiceNivel + 1];

  useEffect(() => {
    guardar('codigo-prefs', prefs);
  }, [prefs]);

  useEffect(() => {
    if (!partida.inicio || partida.fin) return;
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(t);
  }, [partida.inicio, partida.fin]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 1800);
    return () => clearTimeout(t);
  }, [aviso]);

  // Ayuda del detective: cuántos códigos siguen siendo posibles
  const posibles = useMemo(
    () => (prefs.ayuda ? contarPosibles(r, partida.filas, { tope: 1000 }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prefs.ayuda, partida.filas, partida.nivel, partida.variante]
  );

  const nueva = (nivel = partida.nivel, variante = partida.variante) => {
    setPrefs((p) => ({ ...p, nivel, variante }));
    setPartida(partidaNueva(nivel, variante));
    setAviso(null);
  };

  const poner = (simbolo, hueco = null) => {
    if (partida.fin) return;
    const destino = hueco ?? (partida.actual[partida.activo] == null ? partida.activo : partida.actual.indexOf(null));
    if (destino < 0) {
      setAviso('La fila ya está llena: comprueba o quita una ficha.');
      return;
    }
    if (!r.repetir && partida.actual.some((s, i) => s === simbolo && i !== destino)) {
      sonidos.fallo();
      setSacudir((k) => k + 1);
      setAviso(`En este nivel no se repiten: ya usaste ${nombreSimbolo(simbolo, partida.variante)}.`);
      return;
    }
    sonidos.voltear();
    const actual = [...partida.actual];
    actual[destino] = simbolo;
    const vacio = actual.findIndex((s, i) => s == null && i > destino);
    const activo = vacio >= 0 ? vacio : Math.max(0, actual.indexOf(null));
    setPartida({ ...partida, actual, activo, inicio: partida.inicio ?? Date.now() });
  };

  const quitar = (hueco) => {
    if (partida.fin) return;
    const i = hueco ?? (() => {
      for (let k = partida.actual.length - 1; k >= 0; k--) if (partida.actual[k] != null) return k;
      return -1;
    })();
    if (i < 0 || partida.actual[i] == null) return;
    const actual = [...partida.actual];
    actual[i] = null;
    setPartida({ ...partida, actual, activo: i });
  };

  const limpiar = () => {
    if (partida.fin) return;
    setPartida({ ...partida, actual: new Array(r.huecos).fill(null), activo: 0 });
  };

  const comprobar = () => {
    if (partida.fin) return;
    if (!completo) {
      sonidos.fallo();
      setSacudir((k) => k + 1);
      setAviso('Completa todos los huecos antes de comprobar.');
      return;
    }
    if (!esValido(partida.actual, r)) return;
    const e = evaluar(partida.actual, partida.codigo);
    const filas = [...partida.filas, { intento: partida.actual, ...e }];
    const ganada = gano(e, r);
    const perdida = !ganada && filas.length >= r.intentos;
    const momento = Date.now();
    const siguientePartida = {
      ...partida,
      filas,
      actual: new Array(r.huecos).fill(null),
      activo: 0,
      fin: ganada ? 'gano' : perdida ? 'perdio' : null,
      inicio: partida.inicio ?? momento,
      terminoEn: ganada || perdida ? momento : null,
    };
    setPartida(siguientePartida);

    if (ganada || perdida) {
      const nuevos = { ...stats, [clave]: actualizarEstadisticas(stats[clave], ganada, filas.length) };
      setStats(nuevos);
      guardar('codigo-stats', nuevos);
      if (ganada) setTimeout(sonidos.victoria, 300);
      else sonidos.fallo();
    } else if (e.negras + e.blancas > 0) {
      sonidos.pareja();
    } else {
      sonidos.voltear();
    }
  };

  // Teclado: números para poner, Retroceso para quitar, Enter para comprobar
  useEffect(() => {
    const alPresionar = (e) => {
      if (partida.fin || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest?.('input, textarea, select')) return;
      if (/^[0-9]$/.test(e.key)) {
        const d = Number(e.key);
        const simbolo = partida.variante === 'numeros' ? d : d - 1;
        if (simbolo >= 0 && simbolo < r.colores) {
          e.preventDefault();
          poner(simbolo);
        }
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        quitar();
      } else if (e.key === 'Enter' && !e.target.closest?.('button')) {
        e.preventDefault();
        comprobar();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (!e.target.closest?.('.cod-fila--activa')) return;
        e.preventDefault();
        const paso = e.key === 'ArrowRight' ? 1 : -1;
        const activo = (partida.activo + paso + r.huecos) % r.huecos;
        setPartida({ ...partida, activo });
        document.querySelector(`.cod-fila--activa [data-hueco="${activo}"]`)?.focus();
      }
    };
    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  });

  // Arrastrar y soltar (mouse); en pantallas táctiles se toca la gema
  const alSoltar = (e, hueco) => {
    e.preventDefault();
    const dato = e.dataTransfer.getData('text/plain');
    setArrastrando(null);
    if (dato === '') return;
    poner(Number(dato), hueco);
  };

  const filasVacias = Math.max(0, r.intentos - partida.filas.length - (partida.fin ? 0 : 1));

  return (
    <div className="cod">
      <section className="opciones" aria-label="Opciones del código secreto">
        <div className="selector" role="group" aria-label="Nivel">
          {ORDEN_NIVELES.map((id) => {
            const n = NIVELES[id];
            return (
              <button
                key={id}
                type="button"
                className={`selector__opcion ${partida.nivel === id ? 'activa' : ''}`}
                aria-pressed={partida.nivel === id}
                onClick={() => nueva(id)}
                title={`${n.huecos} huecos, ${n.intentos} intentos${n.repetir ? ', con repetidos' : ', sin repetidos'}`}
              >
                {n.nombre}
                <small>
                  {n.huecos}·{n.intentos}
                  {n.repetir ? '' : ' ≠'}
                </small>
              </button>
            );
          })}
        </div>
        <div className="selector" role="group" aria-label="Tipo de fichas">
          {Object.entries(VARIANTES).map(([id, v]) => (
            <button
              key={id}
              type="button"
              className={`selector__opcion ${partida.variante === id ? 'activa' : ''}`}
              aria-pressed={partida.variante === id}
              onClick={() => nueva(partida.nivel, id)}
            >
              <span aria-hidden="true">{v.icono}</span> {v.nombre}
            </button>
          ))}
        </div>
      </section>

      <section className="marcador cod-marcador" aria-live="polite">
        <div className="dato">
          <span className="dato__titulo">Intento</span>
          <span className="dato__valor">
            {Math.min(partida.filas.length + (partida.fin ? 0 : 1), r.intentos)}/{r.intentos}
          </span>
        </div>
        <div className="dato">
          <span className="dato__titulo">Tiempo</span>
          <span className="dato__valor">{formatoTiempo(tiempo)}</span>
        </div>
        <div className="dato">
          <span className="dato__titulo">Racha</span>
          <span className="dato__valor">{est.racha} 🔥</span>
        </div>
        <div className="dato dato--record">
          <span className="dato__titulo">📊 Ganadas</span>
          <span className="dato__valor">
            {est.ganadas}/{est.jugadas}
            {promedio(est) ? ` · prom. ${promedio(est).toFixed(1)}` : ''}
          </span>
        </div>
      </section>

      <main className="mesa cod-mesa">
        <div className="cod-juego">
          <div className={`cod-tablero cod-tablero--${r.huecos}`} style={{ '--huecos': r.huecos }}>
            {/* Código escondido detrás de una tapa de madera */}
            <div className={`cod-secreto ${partida.fin ? 'cod-secreto--abierto' : ''}`}>
              <span className="cod-fila__numero" aria-hidden="true">
                🔒
              </span>
              <span className="cod-fila__huecos">
                {partida.codigo.map((s, i) => (
                  <span key={i} className="cod-hueco cod-hueco--secreto">
                    {partida.fin ? <Ficha simbolo={s} variante={partida.variante} /> : <span className="cod-incognita">?</span>}
                  </span>
                ))}
              </span>
              <span className="cod-secreto__tapa" aria-hidden="true">
                CÓDIGO SECRETO
              </span>
            </div>

            <ol className="cod-filas">
              {partida.filas.map((f, n) => (
                <li key={n} className="cod-fila cod-fila--hecha">
                  <span className="cod-fila__numero">{n + 1}</span>
                  <span className="cod-fila__huecos" aria-label={`Intento ${n + 1}: ${f.intento.map((s) => nombreSimbolo(s, partida.variante)).join(', ')}`}>
                    {f.intento.map((s, i) => (
                      <span key={i} className="cod-hueco cod-hueco--lleno">
                        <Ficha simbolo={s} variante={partida.variante} />
                      </span>
                    ))}
                  </span>
                  <Pistas negras={f.negras} blancas={f.blancas} huecos={r.huecos} />
                </li>
              ))}

              {!partida.fin && (
                <li key={`activa-${sacudir}`} className={`cod-fila cod-fila--activa ${sacudir ? 'cod-fila--sacudir' : ''}`}>
                  <span className="cod-fila__numero">{partida.filas.length + 1}</span>
                  <span className="cod-fila__huecos" role="group" aria-label="Tu intento">
                    {partida.actual.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        data-hueco={i}
                        className={`cod-hueco ${s != null ? 'cod-hueco--lleno' : ''} ${i === partida.activo ? 'cod-hueco--activo' : ''} ${
                          arrastrando != null ? 'cod-hueco--destino' : ''
                        }`}
                        aria-label={`Hueco ${i + 1}: ${s != null ? nombreSimbolo(s, partida.variante) : 'vacío'}${
                          i === partida.activo ? ' (seleccionado)' : ''
                        }`}
                        onClick={() => (s != null && i === partida.activo ? quitar(i) : setPartida({ ...partida, activo: i }))}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => alSoltar(e, i)}
                      >
                        <Ficha simbolo={s} variante={partida.variante} />
                      </button>
                    ))}
                  </span>
                  <Pistas negras={0} blancas={0} huecos={r.huecos} />
                </li>
              )}

              {Array.from({ length: filasVacias }, (_, n) => (
                <li key={`vacia-${n}`} className="cod-fila cod-fila--vacia" aria-hidden="true">
                  <span className="cod-fila__numero">{partida.filas.length + 2 + n}</span>
                  <span className="cod-fila__huecos">
                    {Array.from({ length: r.huecos }, (_, i) => (
                      <span key={i} className="cod-hueco" />
                    ))}
                  </span>
                  <Pistas negras={0} blancas={0} huecos={r.huecos} />
                </li>
              ))}
            </ol>
          </div>

          <aside className="cod-panel">
            <div className="cod-bandeja" role="group" aria-label={partida.variante === 'numeros' ? 'Números' : 'Gemas'}>
              {simbolos.map((s) => {
                const usado = !r.repetir && partida.actual.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className={`cod-bandeja__ficha ${usado ? 'cod-bandeja__ficha--usada' : ''}`}
                    draggable={!partida.fin}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(s));
                      e.dataTransfer.effectAllowed = 'copy';
                      setArrastrando(s);
                    }}
                    onDragEnd={() => setArrastrando(null)}
                    onClick={() => poner(s)}
                    disabled={!!partida.fin}
                    aria-label={`Poner ${nombreSimbolo(s, partida.variante)}`}
                    title={`${nombreSimbolo(s, partida.variante)} (tecla ${partida.variante === 'numeros' ? s : s + 1})`}
                  >
                    <Ficha simbolo={s} variante={partida.variante} />
                    <small className="cod-bandeja__tecla">{partida.variante === 'numeros' ? '' : s + 1}</small>
                  </button>
                );
              })}
            </div>

            <div className="cod-acciones">
              <button type="button" className="boton boton--principal cod-comprobar" onClick={comprobar} disabled={!!partida.fin || !completo}>
                🔍 Comprobar
              </button>
              <div className="cod-acciones__fila">
                <button type="button" className="boton" onClick={() => quitar()} disabled={!!partida.fin}>
                  ⌫ Quitar
                </button>
                <button type="button" className="boton" onClick={limpiar} disabled={!!partida.fin}>
                  🧹 Limpiar
                </button>
              </div>
            </div>

            {aviso && (
              <p className="cod-aviso" role="status">
                {aviso}
              </p>
            )}

            <label className="cod-ayuda">
              <input type="checkbox" checked={prefs.ayuda} onChange={(e) => setPrefs((p) => ({ ...p, ayuda: e.target.checked }))} />
              <span>🕵️ Ayuda del detective</span>
            </label>
            {prefs.ayuda && posibles && (
              <p className="cod-posibles" aria-live="polite">
                {posibles.mas
                  ? 'Quedan más de 1000 códigos posibles.'
                  : posibles.cantidad === 1
                    ? '¡Solo queda 1 código posible! Ya puedes deducirlo.'
                    : `Quedan ${posibles.cantidad} códigos posibles.`}
              </p>
            )}

            <div className="cod-reglas">
              <p>
                <span className="cod-clavija cod-clavija--negra" aria-hidden="true" /> Ficha correcta en su lugar
              </p>
              <p>
                <span className="cod-clavija cod-clavija--blanca" aria-hidden="true" /> Ficha correcta en otro lugar
              </p>
              <p className="cod-reglas__nota">
                {r.repetir ? 'El código puede repetir fichas.' : 'El código no repite fichas.'} Las pistas no dicen cuál ficha es cuál.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="pie">
        <button type="button" className="boton" onClick={() => nueva()}>
          ↻ Código nuevo
        </button>
        <p>Toca o arrastra las fichas · teclas {partida.variante === 'numeros' ? '0–9' : `1–${r.colores}`} · Retroceso quita · Enter comprueba.</p>
      </footer>

      {partida.fin && (
        <Final
          partida={partida}
          est={est}
          haySiguiente={!!siguiente}
          onOtra={() => nueva()}
          onSiguiente={() => nueva(siguiente)}
        />
      )}
    </div>
  );
};

export default CodigoSecreto;
