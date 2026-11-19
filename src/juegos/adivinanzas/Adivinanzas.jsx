import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ADIVINANZAS, CATEGORIAS } from './datos.js';
import {
  PREGUNTAS_POR_RONDA,
  SEGUNDOS_CONTRARRELOJ,
  INTENTOS,
  PUNTOS,
  crearRonda,
  opcionesPara,
  esCorrecta,
  calcularPuntos,
  estrellasRonda,
  capitalizar,
  preguntaNueva,
  reducer,
} from './logica.js';
import { sonidos } from '../../logica/sonido.js';
import { leer, guardar } from '../../logica/almacen.js';
import './adivinanzas.css';

const CLAVE_PREFS = 'adivinanzas-prefs';
const CLAVE_RECORDS = 'adivinanzas-records';
const COLORES_CONFETI = ['#ffcf4a', '#ff6b8b', '#4ad9a0', '#5cb8ff', '#b78cff', '#ff9f43'];

const prefs = leer(CLAVE_PREFS, {});
const estadoBase = {
  fase: 'inicio', // 'inicio' | 'jugando' | 'resumen'
  categoria: prefs.categoria === 'todas' || prefs.categoria in CATEGORIAS ? prefs.categoria : 'todas',
  contrarreloj: !!prefs.contrarreloj,
  siempreOpciones: !!prefs.siempreOpciones,
  ronda: [],
  opcionesRonda: [],
  indice: 0,
  puntos: 0,
  racha: 0,
  mejorRacha: 0,
  resultados: [],
  limite: null,
  p: preguntaNueva(),
};

// ---------------------------------------------------------------- componente
const Adivinanzas = () => {
  const [s, despachar] = useReducer(reducer, estadoBase);
  const [texto, setTexto] = useState('');
  const [sacudir, setSacudir] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());
  const [records, setRecords] = useState(() => leer(CLAVE_RECORDS, {}));
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const entradaRef = useRef(null);
  const siguienteRef = useRef(null);
  const fallosPrevios = useRef(0);

  const actual = s.ronda[s.indice];
  const opciones = s.opcionesRonda[s.indice] ?? [];
  const restante = s.limite ? Math.max(0, (s.limite - ahora) / 1000) : 0;
  const aciertos = s.resultados.filter((r) => r.acerto).length;
  const record = records[s.categoria];

  // Guardar preferencias
  useEffect(() => {
    guardar(CLAVE_PREFS, { categoria: s.categoria, contrarreloj: s.contrarreloj, siempreOpciones: s.siempreOpciones });
  }, [s.categoria, s.contrarreloj, s.siempreOpciones]);

  // Cronómetro del contrarreloj
  useEffect(() => {
    if (s.fase !== 'jugando' || !s.limite || s.p.estado !== 'pensando') return;
    setAhora(Date.now());
    const t = setInterval(() => {
      const n = Date.now();
      setAhora(n);
      if (n >= s.limite) despachar({ type: 'TIEMPO', ahora: n });
    }, 200);
    return () => clearInterval(t);
  }, [s.fase, s.limite, s.p.estado]);

  // Nueva adivinanza: limpiar y enfocar
  useEffect(() => {
    if (s.fase !== 'jugando') return;
    setTexto('');
    fallosPrevios.current = 0;
    sonidos.voltear();
  }, [s.fase, s.indice, s.ronda]);

  useEffect(() => {
    if (s.fase !== 'jugando') return;
    if (s.p.estado === 'pensando') entradaRef.current?.focus();
    else siguienteRef.current?.focus();
  }, [s.fase, s.indice, s.p.estado, s.p.conOpciones]);

  // Intento escrito equivocado: sacudir y sonar
  useEffect(() => {
    if (s.p.fallos > fallosPrevios.current) {
      fallosPrevios.current = s.p.fallos;
      if (s.p.estado === 'pensando') {
        setSacudir(true);
        sonidos.fallo();
        entradaRef.current?.select();
      }
    }
  }, [s.p.fallos, s.p.estado]);

  // Sonidos al resolver
  useEffect(() => {
    if (s.p.estado === 'acierto') {
      sonidos.pareja();
      if (s.racha >= 3) sonidos.racha();
    }
    if (s.p.estado === 'fallo') sonidos.fallo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.p.estado, s.indice]);

  // Fin de ronda: récord y fanfarria
  useEffect(() => {
    if (s.fase !== 'resumen') return;
    const anterior = records[s.categoria];
    const esNuevo = !anterior || s.puntos > anterior.puntos;
    setNuevoRecord(esNuevo && s.puntos > 0);
    if (esNuevo && s.puntos > 0) {
      const nuevos = { ...records, [s.categoria]: { puntos: s.puntos, aciertos } };
      setRecords(nuevos);
      guardar(CLAVE_RECORDS, nuevos);
    }
    if (estrellasRonda(aciertos) >= 2) sonidos.victoria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.fase]);

  const empezar = () => {
    setNuevoRecord(false);
    despachar({ type: 'EMPEZAR', ahora: Date.now() });
  };

  const responder = (e) => {
    e.preventDefault();
    despachar({ type: 'RESPONDER', texto, ahora: Date.now() });
  };

  const pedirPista = () => {
    sonidos.voltear();
    despachar({ type: 'PISTA' });
  };

  const verOpciones = () => {
    sonidos.voltear();
    despachar({ type: 'VER_OPCIONES' });
  };

  // ================================================================ INICIO
  if (s.fase === 'inicio') {
    const categorias = [['todas', { nombre: 'Todas', icono: '🎲', color: '#ffcf4a' }], ...Object.entries(CATEGORIAS)];
    const cuantas = (id) => (id === 'todas' ? ADIVINANZAS.length : ADIVINANZAS.filter((x) => x.categoria === id).length);
    return (
      <div className="adv">
        <section className="adv-portada">
          <span className="adv-portada__cinta" aria-hidden="true" />
          <p className="adv-portada__sobre">Juego de palabras</p>
          <h2 className="adv-portada__titulo">Adivina, adivinador… 🤔</h2>
          <p className="adv-portada__texto">
            Lee cada adivinanza y escribe la respuesta. Tienes {INTENTOS} intentos, pistas si te atascas y opciones si de
            plano no sale. ¡Cada ronda trae {PREGUNTAS_POR_RONDA} adivinanzas!
          </p>
        </section>

        <section className="adv-bloque" aria-labelledby="adv-titulo-cat">
          <h3 id="adv-titulo-cat" className="adv-bloque__titulo">
            Elige una categoría
          </h3>
          <div className="adv-categorias">
            {categorias.map(([id, c]) => (
              <button
                key={id}
                type="button"
                className={`adv-categoria ${s.categoria === id ? 'adv-categoria--activa' : ''}`}
                style={{ '--adv-color': c.color }}
                aria-pressed={s.categoria === id}
                onClick={() => despachar({ type: 'CONFIGURAR', cambios: { categoria: id } })}
              >
                <span className="adv-categoria__icono" aria-hidden="true">
                  {c.icono}
                </span>
                <span className="adv-categoria__nombre">{c.nombre}</span>
                <small>{cuantas(id)} adivinanzas</small>
              </button>
            ))}
          </div>
        </section>

        <section className="adv-bloque adv-ajustes" aria-label="Ajustes">
          <label className="adv-interruptor">
            <input
              type="checkbox"
              checked={s.contrarreloj}
              onChange={(e) => despachar({ type: 'CONFIGURAR', cambios: { contrarreloj: e.target.checked } })}
            />
            <span className="adv-interruptor__riel" aria-hidden="true" />
            <span>
              ⏱ <strong>Contrarreloj</strong>
              <small>{SEGUNDOS_CONTRARRELOJ} s por adivinanza · +{PUNTOS.porSegundo} pts por segundo que sobre</small>
            </span>
          </label>
          <label className="adv-interruptor">
            <input
              type="checkbox"
              checked={s.siempreOpciones}
              onChange={(e) => despachar({ type: 'CONFIGURAR', cambios: { siempreOpciones: e.target.checked } })}
            />
            <span className="adv-interruptor__riel" aria-hidden="true" />
            <span>
              🔢 <strong>Siempre con opciones</strong>
              <small>Más fácil: eliges entre 4 · −{PUNTOS.opciones} pts por adivinanza</small>
            </span>
          </label>
        </section>

        <div className="adv-arranque">
          <p className="adv-record">
            🏆 Récord en {s.categoria === 'todas' ? 'Todas' : CATEGORIAS[s.categoria].nombre}:{' '}
            <strong>{record ? `${record.puntos} pts (${record.aciertos}/${PREGUNTAS_POR_RONDA})` : 'todavía no hay'}</strong>
          </p>
          <button type="button" className="boton boton--principal adv-empezar" onClick={empezar}>
            ¡A adivinar! →
          </button>
        </div>

        <details className="adv-reglas">
          <summary>¿Cómo se ganan los puntos?</summary>
          <ul>
            <li>Cada acierto vale {PUNTOS.base} puntos.</li>
            <li>
              Cada pista resta {PUNTOS.pista}, ver opciones resta {PUNTOS.opciones} y cada intento fallido resta{' '}
              {PUNTOS.intentoFallido} (un acierto nunca vale menos de {PUNTOS.minimo}).
            </li>
            <li>
              Racha: +{PUNTOS.rachaPaso} por cada acierto seguido (hasta +{PUNTOS.rachaMax}).
            </li>
            <li>No importan las mayúsculas, las tildes ni si escribes “el” o “la”.</li>
          </ul>
        </details>
      </div>
    );
  }

  // ================================================================ JUEGO
  const cat = CATEGORIAS[actual?.categoria] ?? CATEGORIAS.logica;
  const pensando = s.p.estado === 'pensando';
  const intentosQuedan = INTENTOS - s.p.fallos;
  const mensajeFallo = {
    intentos: 'Se acabaron los intentos.',
    opcion: '¡Uy, esa no era!',
    tiempo: '⏰ ¡Se acabó el tiempo!',
    saltada: 'La saltaste.',
  }[s.p.motivo];

  return (
    <div className="adv">
      <section className="marcador adv-marcador" aria-live="polite">
        <div className="dato">
          <span className="dato__titulo">Adivinanza</span>
          <span className="dato__valor">
            {Math.min(s.indice + 1, s.ronda.length)}/{s.ronda.length}
          </span>
        </div>
        <div className="dato">
          <span className="dato__titulo">Puntos</span>
          <span className="dato__valor">{s.puntos}</span>
        </div>
        <div className="dato">
          <span className="dato__titulo">Racha</span>
          <span className={`dato__valor ${s.racha >= 2 ? 'adv-fuego' : ''}`}>
            {s.racha >= 2 ? `🔥 x${s.racha}` : s.racha}
          </span>
        </div>
        {s.contrarreloj && (
          <div className={`dato adv-reloj ${pensando && restante <= 10 ? 'adv-reloj--urgente' : ''}`}>
            <span className="dato__titulo">Tiempo</span>
            <span className="dato__valor">{pensando ? Math.ceil(restante) : '—'} s</span>
            <span className="adv-reloj__barra" aria-hidden="true">
              <span style={{ width: `${pensando ? (restante / SEGUNDOS_CONTRARRELOJ) * 100 : 0}%` }} />
            </span>
          </div>
        )}
      </section>

      <ol className="adv-progreso" aria-label="Progreso de la ronda">
        {s.ronda.map((x, i) => {
          const r = s.resultados[i];
          const clase = r ? (r.acerto ? 'adv-punto--bien' : 'adv-punto--mal') : i === s.indice ? 'adv-punto--actual' : '';
          return (
            <li key={x.id} className={`adv-punto ${clase}`}>
              <span className="adv-oculto">
                Adivinanza {i + 1}: {r ? (r.acerto ? 'acertada' : 'fallada') : i === s.indice ? 'actual' : 'pendiente'}
              </span>
            </li>
          );
        })}
      </ol>

      <main className="mesa adv-mesa">
        <article
          key={actual?.id}
          className={`adv-carta ${s.p.estado === 'acierto' ? 'adv-carta--bien' : ''} ${s.p.estado === 'fallo' ? 'adv-carta--mal' : ''}`}
          style={{ '--adv-color': cat.color }}
        >
          <span className="adv-carta__cinta" aria-hidden="true" />
          <header className="adv-carta__cabeza">
            <span className="adv-etiqueta">
              {cat.icono} {cat.nombre}
            </span>
            <span className="adv-carta__numero">N.º {s.indice + 1}</span>
          </header>

          <p className="adv-carta__texto">
            <span aria-hidden="true">“</span>
            {actual?.texto}
            <span aria-hidden="true">”</span>
          </p>
          <p className="adv-carta__pregunta">¿Qué es?</p>

          {s.p.pistas > 0 && (
            <div className="adv-pistas">
              {actual.pistas.slice(0, s.p.pistas).map((pista, i) => (
                <p key={i} className="adv-pista" style={{ '--n': i }}>
                  <strong>Pista {i + 1}:</strong> {pista}
                </p>
              ))}
            </div>
          )}

          {s.p.estado === 'acierto' && (
            <span className="adv-sello adv-sello--bien" aria-hidden="true">
              ¡Correcto!
            </span>
          )}
          {s.p.estado === 'fallo' && (
            <span className="adv-sello adv-sello--mal" aria-hidden="true">
              Era: {actual.respuesta}
            </span>
          )}
        </article>
      </main>

      <section className="adv-respuesta" aria-live="polite">
        {pensando && !s.p.conOpciones && (
          <form className={`adv-formulario ${sacudir ? 'adv-sacudir' : ''}`} onSubmit={responder} onAnimationEnd={() => setSacudir(false)}>
            <label htmlFor="adv-entrada" className="adv-oculto">
              Tu respuesta
            </label>
            <input
              id="adv-entrada"
              ref={entradaRef}
              className="adv-entrada"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe tu respuesta…"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              maxLength={40}
            />
            <button type="submit" className="boton boton--principal" disabled={!texto.trim()}>
              Responder
            </button>
            <p className="adv-intentos">
              Intentos:{' '}
              {Array.from({ length: INTENTOS }, (_, i) => (
                <span key={i} className={i < intentosQuedan ? 'adv-vida' : 'adv-vida adv-vida--gastada'} aria-hidden="true">
                  ●
                </span>
              ))}
              <span className="adv-oculto">quedan {intentosQuedan}</span>
              {s.p.fallos > 0 && <em className="adv-casi"> No es esa… ¡intenta otra vez!</em>}
            </p>
          </form>
        )}

        {s.p.conOpciones && (
          <div className="adv-opciones" role="group" aria-label="Opciones">
            {opciones.map((op, i) => {
              const correcta = esCorrecta(op, actual);
              let clase = '';
              if (!pensando) {
                if (correcta) clase = 'adv-opcion--bien';
                else if (op === s.p.elegida) clase = 'adv-opcion--mal';
                else clase = 'adv-opcion--apagada';
              }
              return (
                <button
                  key={op}
                  type="button"
                  ref={i === 0 && pensando ? entradaRef : null}
                  className={`adv-opcion ${clase}`}
                  disabled={!pensando}
                  onClick={() => despachar({ type: 'ELEGIR', opcion: op, ahora: Date.now() })}
                >
                  <span className="adv-opcion__letra" aria-hidden="true">
                    {'ABCD'[i]}
                  </span>
                  {capitalizar(op)}
                </button>
              );
            })}
          </div>
        )}

        {pensando && (
          <div className="adv-herramientas">
            <button type="button" className="boton" onClick={pedirPista} disabled={s.p.pistas >= 2}>
              💡 Pista {s.p.pistas < 2 ? `(−${PUNTOS.pista})` : '(no quedan)'}
            </button>
            {!s.p.conOpciones && (
              <button type="button" className="boton" onClick={verOpciones}>
                🔢 Ver opciones (−{PUNTOS.opciones})
              </button>
            )}
            <button type="button" className="boton adv-saltar" onClick={() => despachar({ type: 'SALTAR', ahora: Date.now() })}>
              Saltar ⏭
            </button>
          </div>
        )}

        {!pensando && (
          <div className={`adv-resultado ${s.p.estado === 'acierto' ? 'adv-resultado--bien' : 'adv-resultado--mal'}`}>
            {s.p.estado === 'acierto' ? (
              <p className="adv-resultado__titulo">
                ¡Correcto! <strong>+{s.p.ganancia.total}</strong>
                <small>
                  {s.p.ganancia.base} base
                  {s.p.ganancia.bonusRacha > 0 && ` · +${s.p.ganancia.bonusRacha} racha 🔥`}
                  {s.p.ganancia.bonusTiempo > 0 && ` · +${s.p.ganancia.bonusTiempo} tiempo ⏱`}
                </small>
              </p>
            ) : (
              <p className="adv-resultado__titulo">
                {mensajeFallo} La respuesta era <strong>{capitalizar(actual.respuesta)}</strong>.
              </p>
            )}
            <button
              type="button"
              ref={siguienteRef}
              className="boton boton--principal"
              onClick={() => despachar({ type: 'SIGUIENTE', ahora: Date.now() })}
            >
              {s.indice + 1 >= s.ronda.length ? 'Ver resultados 🏁' : 'Siguiente →'}
            </button>
          </div>
        )}
      </section>

      <footer className="pie adv-pie">
        <button type="button" className="boton" onClick={() => despachar({ type: 'MENU' })}>
          ← Categorías
        </button>
        <p>Enter para responder · las tildes y mayúsculas no importan</p>
      </footer>

      {s.fase === 'resumen' && (
        <Resumen
          resultados={s.resultados}
          puntos={s.puntos}
          aciertos={aciertos}
          mejorRacha={s.mejorRacha}
          nuevoRecord={nuevoRecord}
          record={record}
          categoria={s.categoria === 'todas' ? 'Todas' : CATEGORIAS[s.categoria].nombre}
          onOtraVez={empezar}
          onMenu={() => despachar({ type: 'MENU' })}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------- resumen
const Resumen = ({ resultados, puntos, aciertos, mejorRacha, nuevoRecord, record, categoria, onOtraVez, onMenu }) => {
  const botonRef = useRef(null);
  const estrellas = estrellasRonda(aciertos, resultados.length);
  const titulo = ['¡A seguir practicando!', '¡Nada mal!', '¡Muy bien!', '¡Eres un genio! 🧠'][estrellas];

  useEffect(() => {
    botonRef.current?.focus();
  }, []);

  const confeti = useMemo(
    () =>
      estrellas >= 2
        ? Array.from({ length: 80 }, (_, i) => ({
            id: i,
            izquierda: Math.random() * 100,
            retraso: Math.random() * 0.8,
            duracion: 2.2 + Math.random() * 1.8,
            giro: Math.random() * 720 - 360,
            color: COLORES_CONFETI[i % COLORES_CONFETI.length],
            ancho: 6 + Math.random() * 6,
          }))
        : [],
    [estrellas]
  );

  return (
    <div className="victoria" role="dialog" aria-modal="true" aria-labelledby="adv-titulo-resumen">
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

      <div className="victoria__tarjeta adv-resumen">
        <p className="victoria__nivel">Adivinanzas · {categoria}</p>
        <h2 id="adv-titulo-resumen">{titulo}</h2>

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
            <dt>Puntos</dt>
            <dd>{puntos}</dd>
          </div>
          <div>
            <dt>Aciertos</dt>
            <dd>
              {aciertos}/{resultados.length}
            </dd>
          </div>
          <div>
            <dt>Mejor racha</dt>
            <dd>x{mejorRacha}</dd>
          </div>
        </dl>

        {record && !nuevoRecord && <p className="victoria__mejor">Tu récord: {record.puntos} puntos</p>}

        <ol className="adv-lista">
          {resultados.map((r, i) => (
            <li key={r.adivinanza.id} className={r.acerto ? 'adv-lista--bien' : 'adv-lista--mal'}>
              <span className="adv-lista__marca" aria-label={r.acerto ? 'acertada' : 'fallada'}>
                {r.acerto ? '✔' : '✘'}
              </span>
              <span className="adv-lista__texto">
                <span className="adv-lista__adivinanza">
                  {i + 1}. {r.adivinanza.texto}
                </span>
                <strong>{capitalizar(r.adivinanza.respuesta)}</strong>
                {(r.pistas > 0 || r.conOpciones) && (
                  <small>
                    {r.pistas > 0 && ` 💡×${r.pistas}`}
                    {r.conOpciones && ' 🔢'}
                  </small>
                )}
              </span>
              <span className="adv-lista__puntos">{r.acerto ? `+${r.puntos}` : '0'}</span>
            </li>
          ))}
        </ol>

        <div className="victoria__botones">
          <button type="button" ref={botonRef} className="boton boton--principal" onClick={onOtraVez}>
            Jugar otra vez
          </button>
          <button type="button" className="boton" onClick={onMenu}>
            Cambiar categoría
          </button>
        </div>
      </div>
    </div>
  );
};

export default Adivinanzas;
