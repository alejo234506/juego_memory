import { useEffect, useMemo, useRef, useState } from 'react';
import { CASOS } from './casos.js';
import {
  crearPartida,
  normalizarPartida,
  investigar,
  yaHecho,
  rigorDisponible,
  cruzarPistas,
  cronologia,
  deduccionesNecesarias,
  MAX_CRUCES_FALLIDOS,
  alternarMarca,
  evaluar,
  casoDesbloqueado,
  actualizarProgreso,
  origenDePista,
} from './logica.js';
import { sonidos } from '../../logica/sonido.js';
import { leer, guardar } from '../../logica/almacen.js';
import './detective.css';

const CLAVE_PROGRESO = 'detective-progreso';
const CLAVE_PARTIDA = 'detective-partida';
const COLORES = ['#ffcf4a', '#ff6b8b', '#4ad9a0', '#5cb8ff', '#b78cff', '#ff9f43'];
const GIROS = [-3, 2, -1.5, 3, -2.5]; // cada polaroid un poco torcida

const ETIQUETA_MARCA = { sospechoso: 'Sospechoso', descartado: 'Descartado' };

function partidaGuardada(caso) {
  return normalizarPartida(leer(CLAVE_PARTIDA, null), caso);
}

const MENSAJE_CRUCE = {
  nueva: '💡 ¡Contradicción encontrada! Mira la nueva deducción.',
  repetida: 'Ya habías descubierto esa deducción.',
  nada: 'Esas dos pistas no se contradicen. Perdiste 1 acción.',
  agotado: 'Ya no puedes cruzar más pistas: se acabaron tus intentos.',
  invalida: 'Elige dos pistas distintas de la libreta.',
};

const Insignias = ({ n, grande = false }) => (
  <span className={`det-insignias ${grande ? 'det-insignias--grande' : ''}`} aria-label={`${n} de 3 insignias`}>
    {[1, 2, 3].map((i) => (
      <span key={i} className={i <= n ? 'det-insignia llena' : 'det-insignia'} style={{ '--n': i }} aria-hidden="true">
        ★
      </span>
    ))}
  </span>
);

// ======================= Archivo de casos =======================
const Archivo = ({ progreso, onAbrir }) => (
  <section className="det-archivo" aria-labelledby="det-titulo-archivo">
    <div className="det-archivo__cabeza">
      <h2 id="det-titulo-archivo" className="det-maquina">Archivo de casos</h2>
      <p>Investiga lugares, interroga sospechosos y resuelve el misterio antes de que se acaben tus acciones.</p>
      <p className="det-archivo__conteo">
        Casos resueltos: <strong>{CASOS.filter((c) => (progreso[c.id] ?? 0) >= 1).length}</strong>/{CASOS.length}
      </p>
      <ul className="det-consejos">
        <li><span aria-hidden="true">🔗</span> <strong>Cruza pistas</strong> en la libreta: si dos se contradicen, descubres una deducción (gratis). Si te equivocas, pierdes 1 acción.</li>
        <li><span aria-hidden="true">🕒</span> La <strong>cronología</strong> ordena por hora las pistas que tienen hora.</li>
        <li><span aria-hidden="true">❓</span> Algunos sospechosos tienen una <strong>pregunta de rigor</strong> que solo aparece cuando encuentras la pista adecuada.</li>
      </ul>
    </div>
    <div className="det-carpetas">
      {CASOS.map((caso, i) => {
        const abierto = casoDesbloqueado(CASOS, i, progreso);
        const insignias = progreso[caso.id] ?? 0;
        const necesarias = deduccionesNecesarias(caso).length;
        return (
          <button
            key={caso.id}
            type="button"
            className={`det-carpeta ${abierto ? '' : 'det-carpeta--cerrada'}`}
            style={{ '--giro': `${GIROS[i % GIROS.length] / 2}deg` }}
            disabled={!abierto}
            onClick={() => onAbrir(caso)}
            aria-label={abierto ? `Caso ${caso.numero}: ${caso.titulo}` : `Caso ${caso.numero} bloqueado`}
          >
            <span className="det-carpeta__pestana">Caso n.º {caso.numero}</span>
            <span className="det-carpeta__icono" aria-hidden="true">{abierto ? caso.icono : '🔒'}</span>
            <span className="det-carpeta__titulo">{abierto ? caso.titulo : 'Clasificado'}</span>
            <span className="det-carpeta__dificultad">
              {caso.dificultad}
              {abierto && necesarias > 0 && (
                <span className="det-carpeta__extra" title="Para la tercera insignia hay que descubrir deducciones">
                  {' '}· 🔗 {necesarias}
                </span>
              )}
            </span>
            {abierto && insignias > 0 && <Insignias n={insignias} />}
            {abierto && insignias > 0 && <span className="det-sello det-sello--resuelto">Resuelto</span>}
            {!abierto && <span className="det-carpeta__nota">Resuelve el caso anterior</span>}
          </button>
        );
      })}
    </div>
  </section>
);

// ======================= Acusación =======================
const Acusacion = ({ caso, onCancelar, onAcusar }) => {
  const [eleccion, setEleccion] = useState({ culpable: null, motivo: null, metodo: null });
  const primerRef = useRef(null);
  const listo = eleccion.culpable && eleccion.motivo && eleccion.metodo;
  const cancelarRef = useRef(onCancelar);
  cancelarRef.current = onCancelar;

  useEffect(() => {
    primerRef.current?.focus();
    const alTecla = (e) => e.key === 'Escape' && cancelarRef.current();
    window.addEventListener('keydown', alTecla);
    return () => window.removeEventListener('keydown', alTecla);
  }, []);

  const grupo = (campo, titulo, opciones, render) => (
    <fieldset className="det-acusar__grupo">
      <legend>{titulo}</legend>
      <div className={`det-opciones det-opciones--${campo}`}>
        {opciones.map((op, i) => (
          <label key={op.id} className={`det-opcion ${eleccion[campo] === op.id ? 'elegida' : ''}`}>
            <input
              type="radio"
              name={`det-${campo}`}
              value={op.id}
              ref={campo === 'culpable' && i === 0 ? primerRef : undefined}
              checked={eleccion[campo] === op.id}
              onChange={() => {
                sonidos.voltear();
                setEleccion((e) => ({ ...e, [campo]: op.id }));
              }}
            />
            {render(op)}
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="det-capa" role="dialog" aria-modal="true" aria-labelledby="det-titulo-acusar">
      <form
        className="det-acusar"
        onSubmit={(e) => {
          e.preventDefault();
          if (listo) onAcusar(eleccion);
        }}
      >
        <h2 id="det-titulo-acusar" className="det-maquina">Acusación formal</h2>
        <p className="det-acusar__ayuda">Revisa tu libreta. Una vez acuses, el caso se cierra.</p>

        {grupo('culpable', '¿Quién lo hizo?', caso.sospechosos, (s) => (
          <>
            <span className="det-opcion__avatar" aria-hidden="true">{s.avatar}</span>
            <span>{s.nombre}</span>
          </>
        ))}
        {grupo('motivo', '¿Por qué?', caso.motivos, (m) => <span>{m.texto}</span>)}
        {grupo('metodo', '¿Cómo lo hizo?', caso.metodos, (m) => <span>{m.texto}</span>)}

        <div className="det-acusar__botones">
          <button type="button" className="boton det-boton-papel" onClick={onCancelar}>
            Seguir investigando
          </button>
          <button type="submit" className="boton boton--principal" disabled={!listo}>
            ⚖️ Acusar
          </button>
        </div>
      </form>
    </div>
  );
};

// ======================= Resultado =======================
const Resultado = ({ caso, resultado, mejor, haySiguiente, onArchivo, onReintentar, onSiguiente }) => {
  const [verSolucion, setVerSolucion] = useState(resultado.resuelto);
  const botonRef = useRef(null);
  useEffect(() => botonRef.current?.focus(), []);

  const confeti = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        izquierda: Math.random() * 100,
        retraso: Math.random() * 0.8,
        duracion: 2.2 + Math.random() * 1.8,
        giro: Math.random() * 720 - 360,
        color: COLORES[i % COLORES.length],
        ancho: 6 + Math.random() * 6,
      })),
    []
  );

  const nombre = (lista, id) => lista.find((x) => x.id === id);
  const culpable = nombre(caso.sospechosos, caso.solucion.culpable);
  const fila = (ok, titulo, texto) => (
    <li className={ok ? 'det-fila det-fila--bien' : 'det-fila det-fila--mal'}>
      <span className="det-fila__marca" aria-hidden="true">{ok ? '✔' : '✘'}</span>
      <span>
        <strong>{titulo}:</strong> {ok ? 'correcto' : 'incorrecto'}
        {verSolucion && <em> — {texto}</em>}
      </span>
    </li>
  );

  return (
    <div className="det-capa" role="dialog" aria-modal="true" aria-labelledby="det-titulo-resultado">
      {resultado.resuelto && (
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
      <div className="det-resultado">
        <span className={`det-sello det-sello--grande ${resultado.resuelto ? 'det-sello--resuelto' : 'det-sello--fallido'}`}>
          {resultado.resuelto ? 'Caso resuelto' : 'Sin resolver'}
        </span>
        <h2 id="det-titulo-resultado" className="det-maquina">
          {caso.icono} {caso.titulo}
        </h2>

        <Insignias n={resultado.insignias} grande />
        {resultado.insignias === 3 && <p className="det-resultado__nota">¡Investigación perfecta y con acciones de sobra!</p>}
        {resultado.insignias === 2 && (
          <p className="det-resultado__nota">
            {resultado.deduccionesFaltantes > 0
              ? `Todo correcto, pero te faltó descubrir ${resultado.deduccionesFaltantes === 1 ? '1 deducción clave' : `${resultado.deduccionesFaltantes} deducciones clave`}: cruza las pistas que se contradicen en la libreta.`
              : 'Todo correcto. Usa menos acciones para la tercera insignia.'}
          </p>
        )}
        {resultado.insignias === 1 && <p className="det-resultado__nota">Atrapaste al culpable, pero el motivo o el método no eran esos.</p>}
        {resultado.insignias === 0 && <p className="det-resultado__nota">El verdadero culpable sigue libre... ¿lo intentas otra vez?</p>}

        <ul className="det-filas">
          {fila(resultado.culpable, 'Culpable', culpable ? `${culpable.avatar} ${culpable.nombre}` : '')}
          {fila(resultado.motivo, 'Motivo', nombre(caso.motivos, caso.solucion.motivo)?.texto)}
          {fila(resultado.metodo, 'Método', nombre(caso.metodos, caso.solucion.metodo)?.texto)}
        </ul>

        {verSolucion ? (
          <div className="det-explicacion">
            <h3>Así pasó todo</h3>
            <p>{caso.explicacion}</p>
          </div>
        ) : (
          <button type="button" className="det-enlace" onClick={() => setVerSolucion(true)}>
            Ver la solución (arruina el misterio)
          </button>
        )}

        {mejor > 0 && (
          <p className="det-resultado__mejor">
            Tu mejor marca en este caso: <Insignias n={mejor} />
          </p>
        )}

        <div className="det-acusar__botones">
          <button type="button" className="boton det-boton-papel" onClick={onArchivo}>
            📁 Archivo
          </button>
          <button
            type="button"
            ref={resultado.resuelto && haySiguiente ? undefined : botonRef}
            className={`boton ${resultado.resuelto && haySiguiente ? 'det-boton-papel' : 'boton--principal'}`}
            onClick={onReintentar}
          >
            ↻ Reintentar
          </button>
          {resultado.resuelto && haySiguiente && (
            <button type="button" ref={botonRef} className="boton boton--principal" onClick={onSiguiente}>
              Siguiente caso →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ======================= Juego principal =======================
const Detective = () => {
  const [progreso, setProgreso] = useState(() => leer(CLAVE_PROGRESO, {}));
  const [caso, setCaso] = useState(null);
  const [partida, setPartida] = useState(null);
  const [elegido, setElegido] = useState(null); // sospechoso abierto en la ficha
  const [acusando, setAcusando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [nueva, setNueva] = useState(null); // última pista encontrada (para animarla)
  const [pestana, setPestana] = useState('pistas'); // pestaña de la libreta
  const [seleccion, setSeleccion] = useState([]); // pistas elegidas para cruzar
  const [cruce, setCruce] = useState(null); // { resultado, deduccion }
  const fichaRef = useRef(null);

  // Guardar la partida en curso para poder volver después
  useEffect(() => {
    if (partida && !resultado) guardar(CLAVE_PARTIDA, partida);
  }, [partida, resultado]);

  const abrirCaso = (c, reiniciar = false) => {
    sonidos.voltear();
    setCaso(c);
    setPartida(reiniciar ? crearPartida(c) : partidaGuardada(c));
    setElegido(null);
    setResultado(null);
    setAcusando(false);
    setNueva(null);
    setPestana('pistas');
    setSeleccion([]);
    setCruce(null);
  };

  const volverArchivo = () => {
    setCaso(null);
    setPartida(null);
    setResultado(null);
    setAcusando(false);
  };

  const accion = (tipo, id) => {
    const siguiente = investigar(partida, caso, tipo, id);
    if (siguiente === partida) return;
    sonidos.voltear();
    setPartida(siguiente);
    const pistaNueva = siguiente.pistas.find((p) => !partida.pistas.includes(p));
    setNueva(pistaNueva ?? null);
  };

  const marcar = (id) => {
    sonidos.voltear();
    setPartida((p) => alternarMarca(p, id));
  };

  // Elegir hasta dos pistas para cruzarlas
  const alternarSeleccion = (id) => {
    sonidos.voltear();
    setCruce(null);
    setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 2 ? [s[1], id] : [...s, id]));
  };

  const cruzar = () => {
    const r = cruzarPistas(partida, caso, seleccion[0], seleccion[1]);
    setPartida(r.partida);
    setCruce({ resultado: r.resultado, deduccion: r.contradiccion?.deduccion ?? null });
    if (r.resultado === 'nueva') {
      sonidos.victoria();
      setSeleccion([]);
    } else if (r.resultado === 'nada' || r.resultado === 'agotado') {
      sonidos.fallo();
    }
  };

  const acusar = (eleccion) => {
    const r = evaluar(caso, eleccion, partida.acciones, partida.deducciones);
    if (r.resuelto) sonidos.victoria();
    else sonidos.fallo();
    const nuevoProgreso = actualizarProgreso(progreso, caso.id, r.insignias);
    if (nuevoProgreso !== progreso) {
      setProgreso(nuevoProgreso);
      guardar(CLAVE_PROGRESO, nuevoProgreso);
    }
    guardar(CLAVE_PARTIDA, null);
    setAcusando(false);
    setResultado(r);
  };

  if (!caso) {
    return (
      <div className="det">
        <Archivo progreso={progreso} onAbrir={(c) => abrirCaso(c)} />
      </div>
    );
  }

  const indice = CASOS.findIndex((c) => c.id === caso.id);
  const siguienteCaso = CASOS[indice + 1];
  const sospechoso = caso.sospechosos.find((s) => s.id === elegido);
  const sinAcciones = partida.acciones === 0;
  const necesarias = deduccionesNecesarias(caso);
  const necesariasHechas = necesarias.filter((c) => partida.deducciones.includes(c.id)).length;
  const deduccionesHechas = (caso.contradicciones ?? []).filter((c) => partida.deducciones.includes(c.id));
  const lineaTiempo = cronologia(caso, partida.pistas);
  const hayCruces = (caso.contradicciones ?? []).length > 0;
  const crucesAgotados = partida.crucesFallidos >= MAX_CRUCES_FALLIDOS;

  return (
    <div className="det">
      <div className="det-barra">
        <button type="button" className="boton det-boton-papel" onClick={volverArchivo}>
          ← Archivo
        </button>
        <div className="det-acciones" aria-live="polite">
          <span className="det-acciones__texto">
            Acciones: <strong>{partida.acciones}</strong>/{caso.acciones}
          </span>
          <span className="det-lupas" aria-hidden="true">
            {Array.from({ length: caso.acciones }, (_, i) => (
              <span key={i} className={i < partida.acciones ? 'det-lupa' : 'det-lupa gastada'}>
                🔍
              </span>
            ))}
          </span>
          {necesarias.length > 0 && (
            <span
              className={`det-acciones__deducciones ${necesariasHechas === necesarias.length ? 'completas' : ''}`}
              title="Deducciones clave descubiertas (necesarias para la tercera insignia)"
            >
              🔗 Deducciones clave: <strong>{necesariasHechas}</strong>/{necesarias.length}
            </span>
          )}
        </div>
        <button type="button" className="boton boton--principal" onClick={() => setAcusando(true)}>
          ⚖️ Hacer la acusación
        </button>
      </div>

      {sinAcciones && (
        <p className="det-alerta" role="status">
          Se acabaron tus acciones. Revisa la libreta y haz tu acusación.
        </p>
      )}

      <div className="det-mesa">
        <article className="det-expediente">
          <span className="det-clip" aria-hidden="true" />
          <header className="det-expediente__cabeza">
            <span className="det-expediente__numero">Expediente n.º {caso.numero} · {caso.dificultad}</span>
            <h2 className="det-maquina">
              <span aria-hidden="true">{caso.icono}</span> {caso.titulo}
            </h2>
            <p className="det-intro">{caso.intro}</p>
          </header>

          <h3 className="det-subtitulo">Sospechosos</h3>
          <div className="det-polaroids">
            {caso.sospechosos.map((s, i) => {
              const marca = partida.marcas[s.id];
              const interrogado = yaHecho(partida, 'sospechoso', s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`det-polaroid ${elegido === s.id ? 'abierta' : ''} ${marca ? `det-polaroid--${marca}` : ''}`}
                  style={{ '--giro': `${GIROS[i % GIROS.length]}deg` }}
                  aria-pressed={elegido === s.id}
                  aria-label={`${s.nombre}, ${s.rol}${marca ? `, marcado como ${ETIQUETA_MARCA[marca]}` : ''}`}
                  onClick={() => {
                    sonidos.voltear();
                    setElegido(elegido === s.id ? null : s.id);
                    requestAnimationFrame(() => fichaRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
                  }}
                >
                  <span className="det-cinta" aria-hidden="true" />
                  <span className="det-polaroid__foto" aria-hidden="true">{s.avatar}</span>
                  <span className="det-polaroid__nombre">{s.nombre}</span>
                  {interrogado && <span className="det-polaroid__visto" aria-hidden="true">💬</span>}
                  {marca && <span className={`det-marca det-marca--${marca}`}>{ETIQUETA_MARCA[marca]}</span>}
                </button>
              );
            })}
          </div>

          {sospechoso && (
            <div className="det-ficha" ref={fichaRef} key={sospechoso.id}>
              <div className="det-ficha__cabeza">
                <span className="det-ficha__avatar" aria-hidden="true">{sospechoso.avatar}</span>
                <div>
                  <h4>{sospechoso.nombre}</h4>
                  <p className="det-ficha__rol">{sospechoso.rol}</p>
                </div>
              </div>
              <p>{sospechoso.descripcion}</p>
              <p className="det-ficha__coartada">
                <strong>Coartada:</strong> {sospechoso.coartada}
              </p>

              {yaHecho(partida, 'sospechoso', sospechoso.id) ? (
                <div className="det-dialogo">
                  {sospechoso.interrogatorio.map((linea, i) => (
                    <p key={i} className="det-dialogo__linea" style={{ '--i': i }}>
                      «{linea}»
                    </p>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  className="boton det-boton-papel"
                  disabled={sinAcciones}
                  onClick={() => accion('sospechoso', sospechoso.id)}
                >
                  💬 Interrogar (1 acción)
                </button>
              )}

              {sospechoso.rigor && yaHecho(partida, 'sospechoso', sospechoso.id) && (
                <div className="det-rigor">
                  {yaHecho(partida, 'rigor', sospechoso.id) ? (
                    <>
                      <p className="det-rigor__pregunta">❓ {sospechoso.rigor.pregunta}</p>
                      <div className="det-dialogo">
                        {sospechoso.rigor.respuesta.map((linea, i) => (
                          <p key={i} className="det-dialogo__linea" style={{ '--i': i }}>
                            «{linea}»
                          </p>
                        ))}
                      </div>
                    </>
                  ) : rigorDisponible(partida, caso, sospechoso.id) ? (
                    <button
                      type="button"
                      className="boton det-boton-papel det-rigor__boton"
                      disabled={sinAcciones}
                      onClick={() => accion('rigor', sospechoso.id)}
                    >
                      ❓ Pregunta de rigor: «{sospechoso.rigor.pregunta}» (1 acción)
                    </button>
                  ) : (
                    <p className="det-rigor__pendiente">
                      🤔 Se nota nervioso... quizás diga algo más si encuentras la pista adecuada.
                    </p>
                  )}
                </div>
              )}

              <div className="det-ficha__marcas" role="group" aria-label={`Marcar a ${sospechoso.nombre}`}>
                <span>Tu opinión:</span>
                <button
                  type="button"
                  className={`det-chip ${partida.marcas[sospechoso.id] ? 'activo' : ''}`}
                  onClick={() => marcar(sospechoso.id)}
                >
                  {partida.marcas[sospechoso.id] === 'sospechoso'
                    ? '🔴 Sospechoso'
                    : partida.marcas[sospechoso.id] === 'descartado'
                      ? '⚪ Descartado'
                      : '◯ Sin marcar'}
                </button>
                <small>(toca para cambiar)</small>
              </div>
            </div>
          )}

          <h3 className="det-subtitulo">Lugares para investigar</h3>
          <div className="det-lugares">
            {caso.lugares.map((l) => {
              const hecho = yaHecho(partida, 'lugar', l.id);
              return (
                <div key={l.id} className={`det-lugar ${hecho ? 'det-lugar--hecho' : ''}`}>
                  <span className="det-lugar__icono" aria-hidden="true">{l.icono}</span>
                  <span className="det-lugar__nombre">{l.nombre}</span>
                  {hecho ? (
                    <span className="det-lugar__estado">✔ Revisado</span>
                  ) : (
                    <button
                      type="button"
                      className="det-lugar__boton"
                      disabled={sinAcciones}
                      onClick={() => accion('lugar', l.id)}
                      aria-label={`Investigar ${l.nombre} (1 acción)`}
                    >
                      Investigar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </article>

        <aside className="det-libreta" aria-labelledby="det-titulo-libreta">
          <span className="det-libreta__espiral" aria-hidden="true" />
          <h3 id="det-titulo-libreta" className="det-libreta__titulo">Libreta del detective</h3>

          <div className="det-pestanas" role="tablist" aria-label="Secciones de la libreta">
            {[
              ['pistas', `📝 Pistas (${partida.pistas.length})`],
              ['deducciones', `💡 Deducciones (${deduccionesHechas.length})`],
              ['cronologia', `🕒 Cronología (${lineaTiempo.length})`],
            ].map(([id, texto]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={pestana === id}
                className={`det-pestana ${pestana === id ? 'activa' : ''}`}
                onClick={() => setPestana(id)}
              >
                {texto}
              </button>
            ))}
          </div>

          {pestana === 'pistas' && (
            <>
              {hayCruces && partida.pistas.length >= 2 && (
                <div className="det-cruce">
                  <p className="det-cruce__ayuda">
                    Toca <strong>🔗</strong> en dos pistas que se contradigan y crúzalas.
                    <span className="det-cruce__intentos">
                      {' '}Errores: {partida.crucesFallidos}/{MAX_CRUCES_FALLIDOS}
                    </span>
                  </p>
                  <button
                    type="button"
                    className="boton boton--principal det-cruce__boton"
                    disabled={seleccion.length !== 2 || crucesAgotados}
                    onClick={cruzar}
                  >
                    🔗 Cruzar pistas ({seleccion.length}/2)
                  </button>
                  {cruce && (
                    <p className={`det-cruce__resultado det-cruce__resultado--${cruce.resultado}`} role="status">
                      {MENSAJE_CRUCE[cruce.resultado]}
                      {cruce.deduccion && <em className="det-cruce__deduccion">{cruce.deduccion}</em>}
                    </p>
                  )}
                </div>
              )}

              {partida.pistas.length === 0 ? (
                <p className="det-libreta__vacia">Todavía no hay pistas. Investiga un lugar o interroga a alguien.</p>
              ) : (
                <ol className="det-pistas">
                  {partida.pistas.map((id) => {
                    const pista = caso.pistas[id];
                    const origen = origenDePista(caso, id);
                    const elegida = seleccion.includes(id);
                    return (
                      <li
                        key={id}
                        className={`det-pista ${nueva === id ? 'det-pista--nueva' : ''} ${elegida ? 'det-pista--elegida' : ''}`}
                      >
                        <span className="det-pista__origen">
                          <span aria-hidden="true">{origen?.icono}</span> {origen?.nombre}
                          {pista.hora && <span className="det-pista__hora">🕒 {pista.hora}</span>}
                        </span>
                        <span className="det-pista__texto">{pista.texto}</span>
                        {hayCruces && partida.pistas.length >= 2 && (
                          <button
                            type="button"
                            className={`det-pista__unir ${elegida ? 'activo' : ''}`}
                            aria-pressed={elegida}
                            aria-label={elegida ? 'Quitar de la selección para cruzar' : 'Elegir para cruzar'}
                            title="Elegir para cruzar"
                            disabled={crucesAgotados && !elegida}
                            onClick={() => alternarSeleccion(id)}
                          >
                            🔗
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </>
          )}

          {pestana === 'deducciones' && (
            deduccionesHechas.length === 0 ? (
              <p className="det-libreta__vacia">
                {hayCruces
                  ? 'Todavía no hay deducciones. Cruza dos pistas que se contradigan para descubrir una.'
                  : 'En este caso no hay contradicciones escondidas: confía en tus pistas.'}
              </p>
            ) : (
              <ul className="det-deducciones">
                {deduccionesHechas.map((c) => (
                  <li key={c.id} className="det-deduccion">
                    <span className="det-deduccion__icono" aria-hidden="true">💡</span>
                    <span>{c.deduccion}</span>
                    {c.necesaria && <span className="det-deduccion__clave">Clave</span>}
                  </li>
                ))}
              </ul>
            )
          )}

          {pestana === 'cronologia' && (
            lineaTiempo.length === 0 ? (
              <p className="det-libreta__vacia">Todavía no tienes pistas con hora. Las que la tengan aparecerán aquí en orden.</p>
            ) : (
              <ol className="det-cronologia">
                {lineaTiempo.map((p) => (
                  <li key={p.id} className="det-cronologia__item">
                    <span className="det-cronologia__hora">{p.hora}{p.dia ? ' ☾' : ''}</span>
                    <span className="det-cronologia__texto">{p.texto}</span>
                  </li>
                ))}
              </ol>
            )
          )}
          {Object.keys(partida.marcas).length > 0 && (
            <div className="det-libreta__marcas">
              <span>Mis sospechas:</span>
              {caso.sospechosos
                .filter((s) => partida.marcas[s.id])
                .map((s) => (
                  <span key={s.id} className={`det-chip det-chip--${partida.marcas[s.id]}`}>
                    {s.avatar} {s.nombre}
                  </span>
                ))}
            </div>
          )}
        </aside>
      </div>

      {acusando && <Acusacion caso={caso} onCancelar={() => setAcusando(false)} onAcusar={acusar} />}

      {resultado && (
        <Resultado
          caso={caso}
          resultado={resultado}
          mejor={progreso[caso.id] ?? 0}
          haySiguiente={!!siguienteCaso}
          onArchivo={volverArchivo}
          onReintentar={() => abrirCaso(caso, true)}
          onSiguiente={() => abrirCaso(siguienteCaso, true)}
        />
      )}
    </div>
  );
};

export default Detective;
