import { useEffect, useMemo, useRef, useState } from 'react';
import { leer, guardar } from '../../logica/almacen.js';
import { sonidos } from '../../logica/sonido.js';
import { PISTAS_DATOS, obtenerPista } from './logica/pistas.js';
import { PILOTOS, DIFICULTADES } from './logica/pilotos.js';
import { OBJETOS } from './logica/objetos.js';
import { crearCarrera, pasoCarrera, resultados as resultadosDe, formatoTiempo } from './logica/carrera.js';
import { crearCopa, sumarCarrera, copaTerminada, clasificacion, puntosPorPuesto } from './logica/copa.js';
import { CONTROLES, TECLAS_JUEGO, crearEntradas, leerEntradas } from './entrada.js';
import { efectos, iniciarMotores, actualizarMotor, detenerMotores, revisarSilencio } from './audio.js';
import {
  prepararMundo,
  crearCamara,
  moverCamara,
  dibujarVista,
  dibujarSemaforo,
  calcularVistas,
  dibujarMiniaturaPista,
} from './render.js';
import './karts.css';

const PASO = 1 / 120;
const MODOS = {
  solo: { nombre: '1 jugador', icono: '🏎️', descripcion: 'Tú contra los rivales de la computadora', humanos: 1, cpuMin: 1, cpuMax: 5, cpuDef: 5 },
  duo: { nombre: '2 jugadores', icono: '👫', descripcion: 'Mano a mano, pantalla dividida', humanos: 2, cpuMin: 0, cpuMax: 0, cpuDef: 0 },
  duoCpu: { nombre: '2 jugadores + rivales', icono: '🏁', descripcion: 'Los dos juntos contra la computadora', humanos: 2, cpuMin: 1, cpuMax: 4, cpuDef: 4 },
};
const COLORES_CONFETI = ['#ffcf4a', '#ff5d6c', '#3ddc97', '#5dade2', '#c39bd3', '#ffffff'];

const reducirMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const esTactil = () => window.matchMedia?.('(pointer: coarse)').matches;

// ======================================================================
function Confeti() {
  const piezas = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
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

function Miniatura({ pistaId }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) dibujarMiniaturaPista(ref.current, obtenerPista(pistaId));
  }, [pistaId]);
  return <canvas ref={ref} width={240} height={150} className="kt-miniatura" aria-hidden="true" />;
}

function Barra({ etiqueta, valor }) {
  // valor entre 0.9 y 1.1
  const pct = Math.round(((valor - 0.88) / 0.24) * 100);
  return (
    <div className="kt-stat">
      <span>{etiqueta}</span>
      <span className="kt-stat__barra">
        <span style={{ width: `${Math.max(8, Math.min(100, pct))}%` }} />
      </span>
    </div>
  );
}

function AyudaControles({ humanos }) {
  return (
    <div className="kt-controles">
      {[0, 1].slice(0, humanos).map((j) => (
        <div key={j} className={`kt-controles__jugador kt-j${j + 1}`}>
          <strong>Jugador {j + 1}</strong>
          <span>🕹️ {humanos === 1 ? 'W A S D o flechas' : CONTROLES[j].texto.mover}</span>
          <span>💨 Derrapar: {humanos === 1 ? 'Shift o Espacio' : CONTROLES[j].texto.derrape}</span>
          <span>🎁 Objeto: {humanos === 1 ? 'Q, E o Enter' : CONTROLES[j].texto.objeto}</span>
        </div>
      ))}
      <p className="kt-controles__nota">
        También sirven los mandos (control 1 → jugador 1, control 2 → jugador 2). Pausa: <kbd>Esc</kbd> o <kbd>P</kbd>.
        Para el mini-turbo, mantén el derrape en una curva y suéltalo cuando salgan chispas azules, naranjas o moradas.
      </p>
    </div>
  );
}

// ======================================================================
// La carrera en sí: canvas + bucle del juego
function Carrera({ config, alTerminar, alSalir }) {
  const contRef = useRef(null);
  const canvasRef = useRef(null);
  const [pausa, setPausa] = useState(false);
  const pausaRef = useRef(false);
  const entradasRef = useRef(crearEntradas());
  const tactil = useMemo(() => esTactil() && config.humanos.length === 1, [config.humanos.length]);

  const cambiarPausa = (valor) => {
    pausaRef.current = valor;
    setPausa(valor);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const carrera = crearCarrera({
      pistaId: config.pistaId,
      vueltas: config.vueltas,
      humanos: config.humanos,
      cpus: config.cpus,
      dificultad: config.dificultad,
    });
    prepararMundo(carrera.pista);
    const humanos = carrera.karts.filter((k) => k.humano).sort((a, b) => a.jugador - b.jugador);
    const camaras = humanos.map(crearCamara);
    const tranquilo = reducirMovimiento();
    iniciarMotores(humanos.length);
    revisarSilencio();

    // Con pantalla dividida se dibuja el doble: se limita la resolución para mantener 60 fps
    const dprMax = humanos.length > 1 ? 1.5 : 2;
    let dpr = Math.min(dprMax, window.devicePixelRatio || 1);
    const ajustar = () => {
      dpr = Math.min(dprMax, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    };
    ajustar();
    const obs = new ResizeObserver(ajustar);
    obs.observe(canvas);

    const entradas = entradasRef.current;
    const alBajar = (e) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        cambiarPausa(!pausaRef.current);
        return;
      }
      if (TECLAS_JUEGO.has(e.code)) e.preventDefault();
      entradas.teclas.add(e.code);
    };
    const alSubir = (e) => entradas.teclas.delete(e.code);
    const alPerderFoco = () => {
      entradas.teclas.clear();
      if (carrera.fase !== 'fin') cambiarPausa(true);
    };
    window.addEventListener('keydown', alBajar);
    window.addEventListener('keyup', alSubir);
    window.addEventListener('blur', alPerderFoco);
    contRef.current?.focus();

    let ultimo = performance.now();
    let acumulado = 0;
    let reloj = 0;
    let finEn = null;
    let terminado = false;
    let revisionSilencio = 0;
    let pausaMandoAntes = false;
    let raf;

    const atenderEventos = () => {
      carrera.eventos.splice(0).forEach((ev) => {
        if (ev.startsWith('cuenta')) efectos.cuenta();
        if (ev === 'ya') efectos.ya();
      });
      carrera.karts.forEach((k) => {
        const lista = k.eventos.splice(0);
        if (!k.humano) return;
        const cam = camaras[k.jugador];
        lista.forEach((ev) => {
          if (ev === 'choque') {
            efectos.choque();
            if (!tranquilo) cam.temblor = 1;
          } else if (ev === 'toque') efectos.toque();
          else if (ev === 'turboPad') efectos.turbo();
          else if (ev.startsWith('miniturbo')) efectos.miniturbo(Number(ev.slice(-1)));
          else if (ev === 'caja') efectos.caja();
          else if (ev === 'usar') efectos.usar();
          else if (ev === 'trompo') {
            efectos.trompo();
            if (!tranquilo) cam.temblor = 0.7;
          } else if (ev === 'tinta') efectos.tinta();
          else if (ev === 'escudoRoto') efectos.escudo();
          else if (ev === 'vuelta') efectos.vuelta();
          else if (ev === 'meta') efectos.meta();
        });
      });
    };

    const cuadro = (ahora) => {
      raf = requestAnimationFrame(cuadro);
      const dt = Math.min(0.05, (ahora - ultimo) / 1000);
      ultimo = ahora;

      revisionSilencio += dt;
      if (revisionSilencio > 1) {
        revisionSilencio = 0;
        revisarSilencio();
      }

      const { entradas: e, pausaMando } = leerEntradas(entradas, humanos.length);
      if (pausaMando && !pausaMandoAntes) cambiarPausa(!pausaRef.current);
      pausaMandoAntes = pausaMando;

      if (!pausaRef.current) {
        reloj += dt;
        acumulado += dt;
        let primero = true;
        while (acumulado >= PASO) {
          pasoCarrera(carrera, e, PASO);
          if (primero) {
            // el objeto se usa una sola vez por pulsación
            Object.values(e).forEach((x) => {
              x.objeto = false;
            });
            primero = false;
          }
          acumulado -= PASO;
        }
        atenderEventos();
        humanos.forEach((k, i) => moverCamara(camaras[i], k, dt, tranquilo));
      }
      humanos.forEach((k, i) => actualizarMotor(i, k.vel, !pausaRef.current && carrera.fase !== 'fin'));

      // Dibujo
      const vistas = calcularVistas(canvas.width, canvas.height, humanos.length, dpr);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const teclaObjeto = (j) =>
        humanos.length === 1 ? (tactil ? '' : 'Q / Enter') : CONTROLES[j].texto.objeto;
      vistas.forEach((v, i) =>
        dibujarVista(ctx, v, carrera, humanos[i], camaras[i], {
          tiempo: reloj,
          efectos: !tranquilo,
          teclaObjeto: teclaObjeto(i),
        })
      );
      dibujarSemaforo(ctx, canvas.width, canvas.height, carrera.fase === 'cuenta' ? carrera.cuenta : -carrera.tiempo, dpr);

      if (carrera.fase === 'fin' && !terminado) {
        if (finEn === null) finEn = reloj;
        if (reloj - finEn > 2.2) {
          terminado = true;
          alTerminar(resultadosDe(carrera));
        }
      }
    };
    raf = requestAnimationFrame(cuadro);

    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      window.removeEventListener('keydown', alBajar);
      window.removeEventListener('keyup', alSubir);
      window.removeEventListener('blur', alPerderFoco);
      detenerMotores();
    };
    // la carrera se crea una sola vez por montaje
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pantallaCompleta = () => {
    const el = contRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.().catch(() => {});
  };

  const tocar = (accion, valor) => (ev) => {
    ev.preventDefault();
    entradasRef.current.tactil[accion] = valor;
  };
  const botonTactil = (accion, texto, etiqueta) => (
    <button
      type="button"
      className={`kt-tactil__boton kt-tactil__${accion}`}
      aria-label={etiqueta}
      onPointerDown={tocar(accion, true)}
      onPointerUp={tocar(accion, false)}
      onPointerLeave={tocar(accion, false)}
      onPointerCancel={tocar(accion, false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {texto}
    </button>
  );

  return (
    <div className="kt-carrera" ref={contRef} tabIndex={-1} aria-label="Carrera en curso">
      <canvas ref={canvasRef} className="kt-lienzo" />
      <div className="kt-carrera__botones">
        <button type="button" className="kt-mini" onClick={() => cambiarPausa(true)} aria-label="Pausa" title="Pausa (Esc)">
          ⏸
        </button>
        <button type="button" className="kt-mini" onClick={pantallaCompleta} aria-label="Pantalla completa" title="Pantalla completa">
          ⛶
        </button>
      </div>

      {tactil && (
        <div className="kt-tactil" aria-hidden="true">
          <div className="kt-tactil__lado">
            {botonTactil('izq', '◀', 'Girar a la izquierda')}
            {botonTactil('der', '▶', 'Girar a la derecha')}
          </div>
          <div className="kt-tactil__lado">
            {botonTactil('objeto', '🎁', 'Usar objeto')}
            {botonTactil('derrape', '💨', 'Derrapar')}
            {botonTactil('freno', '⬇', 'Frenar')}
            {botonTactil('acel', '⬆', 'Acelerar')}
          </div>
        </div>
      )}

      {pausa && (
        <div className="kt-pausa" role="dialog" aria-modal="true" aria-label="Pausa">
          <div className="kt-pausa__tarjeta">
            <h2>⏸ Pausa</h2>
            <AyudaControles humanos={config.humanos.length} />
            <div className="kt-botones">
              <button type="button" className="boton boton--principal" autoFocus onClick={() => cambiarPausa(false)}>
                ▶ Seguir
              </button>
              <button type="button" className="boton kt-boton-claro" onClick={alSalir}>
                Salir al menú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Pantalla de resultados (podio, tabla, récord y Copa)
export function Resultados({ resultado, alRevancha, alSiguientePista, alSiguienteCopa, alOtraCopa, alMenu }) {
  const { lista, nuevoRecord } = resultado;
  const copaRes = resultado.copa;
  const podio = lista.slice(0, 3);
  const ganador = lista[0];
  const enCopa = !!copaRes;
  const finCopa = enCopa && copaTerminada(copaRes);
  const todosPilotos = lista.map((r) => r.piloto);
  const tabla = enCopa ? clasificacion(copaRes, todosPilotos) : null;
  const campeon = finCopa ? tabla[0] : null;
  const nombreJugador = (r) => (r.humano ? `Jugador ${r.jugador + 1}` : 'CPU');
  return (
    <div className="kt kt-resultados">
      {(ganador.humano || (campeon && lista.find((r) => r.piloto.id === campeon.piloto.id)?.humano)) && <Confeti />}
      <h2 className="kt-titulo">
        {finCopa ? '🏆 ¡Fin de la Copa!' : enCopa ? `Copa · carrera ${copaRes.indice} de ${copaRes.pistas.length}` : '🏁 ¡Carrera terminada!'}
      </h2>
      {finCopa ? (
        <p className="kt-subtitulo">
          Campeón: <strong>{campeon.piloto.cara} {campeon.piloto.nombre}</strong> con {campeon.puntos} puntos
        </p>
      ) : (
        <p className="kt-subtitulo">
          Ganó <strong>{ganador.piloto.cara} {ganador.piloto.nombre}</strong> ({nombreJugador(ganador)})
        </p>
      )}

      <div className="kt-podio" aria-label="Podio">
        {[1, 0, 2].map((i) => {
          const r = podio[i];
          if (!r) return <div key={i} />;
          return (
            <div key={r.id} className={`kt-podio__lugar kt-podio__lugar--${i + 1}`} style={{ '--color': r.piloto.color }}>
              <span className="kt-podio__cara">{r.piloto.cara}</span>
              <span className="kt-podio__nombre">{r.piloto.nombre}</span>
              {r.humano && <span className={`kt-etiqueta kt-j${r.jugador + 1}`}>J{r.jugador + 1}</span>}
              <span className="kt-podio__bloque">{i + 1}º</span>
            </div>
          );
        })}
      </div>

      {nuevoRecord && (
        <p className="kt-record" role="status">
          🏆 ¡Nueva mejor vuelta del Jugador {nuevoRecord.jugador + 1}: {formatoTiempo(nuevoRecord.tiempo)}!
        </p>
      )}

      <table className="kt-tabla">
        <thead>
          <tr>
            <th>Puesto</th>
            <th>Piloto</th>
            <th>Tiempo</th>
            <th>Mejor vuelta</th>
            {enCopa && <th>Puntos</th>}
          </tr>
        </thead>
        <tbody>
          {lista.map((r) => (
            <tr key={r.id} className={r.humano ? 'kt-tabla__humano' : ''}>
              <td>{r.puesto}º</td>
              <td>
                <span className="kt-punto" style={{ background: r.piloto.color }} /> {r.piloto.cara} {r.piloto.nombre}{' '}
                <small>{nombreJugador(r)}</small>
              </td>
              <td>{r.tiempo == null ? 'no llegó' : formatoTiempo(r.tiempo)}</td>
              <td>{formatoTiempo(r.mejorVuelta)}</td>
              {enCopa && <td>+{puntosPorPuesto(r.puesto)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {enCopa && (
        <div className="kt-copa">
          <h3>Clasificación de la Copa</h3>
          <ol>
            {tabla.map((t) => (
              <li key={t.piloto.id}>
                <span>
                  {t.piloto.cara} {t.piloto.nombre}
                </span>
                <strong>{t.puntos} pts</strong>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="kt-botones">
        {enCopa && !finCopa ? (
          <button type="button" className="boton boton--principal" autoFocus onClick={alSiguienteCopa}>
            Siguiente carrera: {PISTAS_DATOS.find((p) => p.id === copaRes.pistas[copaRes.indice])?.nombre} →
          </button>
        ) : (
          <>
            <button type="button" className="boton boton--principal" autoFocus onClick={finCopa ? alOtraCopa : alRevancha}>
              {finCopa ? '🏆 Otra Copa' : '🔁 Revancha'}
            </button>
            {!enCopa && (
              <button type="button" className="boton" onClick={alSiguientePista}>
                Siguiente pista →
              </button>
            )}
          </>
        )}
        <button
          type="button"
          className="boton"
          onClick={alMenu}
        >
          Menú
        </button>
      </div>
    </div>
  );
}

// ======================================================================
const Karts = () => {
  const prefs = useMemo(() => leer('karts-prefs', {}), []);
  const [pantalla, setPantalla] = useState('menu');
  const [modo, setModo] = useState(prefs.modo in MODOS ? prefs.modo : 'duo');
  const [tipo, setTipo] = useState(prefs.tipo === 'copa' ? 'copa' : 'carrera');
  const [cpus, setCpus] = useState(prefs.cpus ?? MODOS[modo].cpuDef);
  const [dificultad, setDificultad] = useState(prefs.dificultad in DIFICULTADES ? prefs.dificultad : 'normal');
  const [vueltas, setVueltas] = useState(prefs.vueltas === 5 ? 5 : 3);
  const [pilotos, setPilotos] = useState(() => [prefs.p1 ?? 'lola', prefs.p2 ?? 'nube']);
  const [eligiendo, setEligiendo] = useState(0);
  const [pistaId, setPistaId] = useState(prefs.pista ?? PISTAS_DATOS[0].id);
  const [copa, setCopa] = useState(null);
  const [rivales, setRivales] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [idCarrera, setIdCarrera] = useState(0);
  const [records, setRecords] = useState(() => leer('karts-records', {}));

  const m = MODOS[modo];
  const cantidadCpu = Math.max(m.cpuMin, Math.min(m.cpuMax, cpus));

  useEffect(() => {
    guardar('karts-prefs', { modo, tipo, cpus, dificultad, vueltas, p1: pilotos[0], p2: pilotos[1], pista: pistaId });
  }, [modo, tipo, cpus, dificultad, vueltas, pilotos, pistaId]);

  // CPU: pilotos distintos a los elegidos por las personas, en orden al azar
  const elegirRivales = () => {
    const libres = PILOTOS.filter((p) => !pilotos.slice(0, m.humanos).includes(p.id)).map((p) => p.id);
    for (let i = libres.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [libres[i], libres[j]] = [libres[j], libres[i]];
    }
    return libres.slice(0, cantidadCpu);
  };

  const configCarrera = (pista, cpuIds) => ({
    pistaId: pista,
    vueltas,
    dificultad,
    humanos: pilotos.slice(0, m.humanos).map((pilotoId, jugador) => ({ pilotoId, jugador })),
    cpus: cpuIds,
  });
  const [config, setConfig] = useState(null);

  const empezar = (pista, cpuIds = rivales) => {
    sonidos.voltear();
    setPistaId(pista);
    setConfig(configCarrera(pista, cpuIds));
    setResultado(null);
    setIdCarrera((n) => n + 1);
    setPantalla('carrera');
  };

  const alListoPilotos = () => {
    const cpuIds = elegirRivales();
    setRivales(cpuIds);
    if (tipo === 'copa') {
      const nueva = crearCopa();
      setCopa(nueva);
      empezar(nueva.pistas[0], cpuIds);
    } else {
      setCopa(null);
      setPantalla('pistas');
    }
  };

  const alTerminar = (res) => {
    // Récords de mejor vuelta (solo de las personas)
    let nuevoRecord = null;
    const actuales = leer('karts-records', {});
    res.forEach((r) => {
      if (r.humano && r.mejorVuelta && (!actuales[config.pistaId] || r.mejorVuelta < actuales[config.pistaId].tiempo)) {
        actuales[config.pistaId] = { tiempo: r.mejorVuelta, piloto: r.piloto.nombre };
        nuevoRecord = { jugador: r.jugador, tiempo: r.mejorVuelta };
      }
    });
    if (nuevoRecord) {
      guardar('karts-records', actuales);
      setRecords(actuales);
    }
    let copaNueva = null;
    if (copa) {
      copaNueva = sumarCarrera(copa, res);
      setCopa(copaNueva);
    }
    const ganoHumano = res[0]?.humano;
    if (ganoHumano) sonidos.victoria();
    setResultado({ lista: res, nuevoRecord, copa: copaNueva });
    setPantalla('resultados');
  };

  const siguientePista = () => {
    const i = PISTAS_DATOS.findIndex((p) => p.id === pistaId);
    return PISTAS_DATOS[(i + 1) % PISTAS_DATOS.length].id;
  };

  // ---------------- Pantallas ----------------
  if (pantalla === 'carrera' && config) {
    return (
      <div className="kt">
        <Carrera
          key={idCarrera}
          config={config}
          alTerminar={alTerminar}
          alSalir={() => {
            setCopa(null);
            setPantalla('menu');
          }}
        />
      </div>
    );
  }

  if (pantalla === 'resultados' && resultado) {
    return (
      <Resultados
        resultado={resultado}
        alRevancha={() => empezar(pistaId)}
        alSiguientePista={() => empezar(siguientePista())}
        alSiguienteCopa={() => empezar(resultado.copa.pistas[resultado.copa.indice])}
        alOtraCopa={alListoPilotos}
        alMenu={() => {
          setCopa(null);
          setPantalla('menu');
        }}
      />
    );
  }

  if (pantalla === 'pilotos') {
    const ocupado = eligiendo === 1 ? pilotos[0] : null;
    return (
      <div className="kt">
        <h2 className="kt-titulo">
          <span className={`kt-etiqueta kt-j${eligiendo + 1}`}>J{eligiendo + 1}</span> Jugador {eligiendo + 1}, elige tu piloto
        </h2>
        <ul className="kt-pilotos">
          {PILOTOS.map((p) => {
            const elegido = pilotos[eligiendo] === p.id;
            const bloqueado = ocupado === p.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className={`kt-piloto ${elegido ? 'kt-piloto--elegido' : ''}`}
                  style={{ '--color': p.color, '--color2': p.color2 }}
                  disabled={bloqueado}
                  aria-pressed={elegido}
                  onClick={() => {
                    sonidos.voltear();
                    setPilotos((lista) => lista.map((x, i) => (i === eligiendo ? p.id : x)));
                  }}
                >
                  <span className="kt-piloto__kart" aria-hidden="true">
                    <span className="kt-piloto__cara">{p.cara}</span>
                  </span>
                  <span className="kt-piloto__nombre">{p.nombre}</span>
                  <span className="kt-piloto__frase">{bloqueado ? 'Elegido por el Jugador 1' : p.frase}</span>
                  <Barra etiqueta="Velocidad" valor={p.velocidad} />
                  <Barra etiqueta="Aceleración" valor={p.aceleracion} />
                  <Barra etiqueta="Manejo" valor={p.manejo} />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="kt-botones">
          <button type="button" className="boton" onClick={() => (eligiendo === 1 ? setEligiendo(0) : setPantalla('menu'))}>
            ← Atrás
          </button>
          <button
            type="button"
            className="boton boton--principal"
            onClick={() => {
              if (eligiendo === 0 && m.humanos === 2) {
                if (pilotos[1] === pilotos[0]) {
                  const otro = PILOTOS.find((p) => p.id !== pilotos[0]).id;
                  setPilotos([pilotos[0], otro]);
                }
                setEligiendo(1);
              } else alListoPilotos();
            }}
          >
            {eligiendo === 0 && m.humanos === 2 ? 'Listo, turno del Jugador 2 →' : tipo === 'copa' ? '¡A la Copa! 🏆' : 'Elegir pista →'}
          </button>
        </div>
      </div>
    );
  }

  if (pantalla === 'pistas') {
    return (
      <div className="kt">
        <h2 className="kt-titulo">Elige la pista</h2>
        <ul className="kt-pistas">
          {PISTAS_DATOS.map((p) => (
            <li key={p.id}>
              <button type="button" className="kt-pista" style={{ '--color': p.tema.muro, '--fondo': p.tema.fondo }} onClick={() => empezar(p.id)}>
                <Miniatura pistaId={p.id} />
                <span className="kt-pista__nombre">
                  {p.icono} {p.nombre}
                </span>
                <span className="kt-pista__datos">
                  {p.dificultad}
                  {p.agarre < 0.8 ? ' · resbala' : ''}
                  {p.tema.lava ? ' · lava' : ''}
                </span>
                <span className="kt-pista__record">
                  🏆 {records[p.id] ? `${formatoTiempo(records[p.id].tiempo)} (${records[p.id].piloto})` : 'sin récord'}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="kt-botones">
          <button type="button" className="boton" onClick={() => setPantalla('pilotos')}>
            ← Pilotos
          </button>
        </div>
      </div>
    );
  }

  // ---------------- Menú principal ----------------
  return (
    <div className="kt kt-menu">
      <div className="kt-logo" aria-hidden="true">
        <span className="kt-logo__turbo">TURBO</span>
        <span className="kt-logo__karts">KARTS</span>
        <span className="kt-logo__bandera">🏁</span>
      </div>
      <p className="kt-subtitulo">Carreras locas para jugar en pareja en el mismo computador 💕</p>

      <ul className="kt-modos">
        {Object.entries(MODOS).map(([id, x]) => (
          <li key={id}>
            <button
              type="button"
              className={`kt-modo ${modo === id ? 'kt-modo--activo' : ''}`}
              aria-pressed={modo === id}
              onClick={() => {
                setModo(id);
                setCpus(MODOS[id].cpuDef);
              }}
            >
              <span className="kt-modo__icono">{x.icono}</span>
              <span className="kt-modo__nombre">{x.nombre}</span>
              <span className="kt-modo__desc">{x.descripcion}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="kt-opciones">
        <div className="selector" role="group" aria-label="Tipo de juego">
          <button type="button" className={`selector__opcion ${tipo === 'carrera' ? 'activa' : ''}`} aria-pressed={tipo === 'carrera'} onClick={() => setTipo('carrera')}>
            🏁 Carrera rápida
          </button>
          <button type="button" className={`selector__opcion ${tipo === 'copa' ? 'activa' : ''}`} aria-pressed={tipo === 'copa'} onClick={() => setTipo('copa')}>
            🏆 Copa ({PISTAS_DATOS.length} pistas)
          </button>
        </div>
        <div className="selector" role="group" aria-label="Vueltas">
          {[3, 5].map((v) => (
            <button key={v} type="button" className={`selector__opcion ${vueltas === v ? 'activa' : ''}`} aria-pressed={vueltas === v} onClick={() => setVueltas(v)}>
              {v} vueltas
            </button>
          ))}
        </div>
        {m.cpuMax > 0 && (
          <>
            <div className="selector" role="group" aria-label="Dificultad de los rivales">
              {Object.entries(DIFICULTADES).map(([id, d]) => (
                <button key={id} type="button" className={`selector__opcion ${dificultad === id ? 'activa' : ''}`} aria-pressed={dificultad === id} onClick={() => setDificultad(id)}>
                  {d.nombre}
                </button>
              ))}
            </div>
            <div className="selector kt-contador" role="group" aria-label="Cantidad de rivales">
              <button type="button" className="selector__opcion" onClick={() => setCpus(Math.max(m.cpuMin, cantidadCpu - 1))} aria-label="Menos rivales">
                −
              </button>
              <span className="kt-contador__valor">🤖 {cantidadCpu} rivales</span>
              <button type="button" className="selector__opcion" onClick={() => setCpus(Math.min(m.cpuMax, cantidadCpu + 1))} aria-label="Más rivales">
                +
              </button>
            </div>
          </>
        )}
      </div>

      <AyudaControles humanos={m.humanos} />

      <details className="kt-objetos">
        <summary>🎁 Objetos que salen de las cápsulas ✦</summary>
        <ul>
          {Object.values(OBJETOS).map((o) => (
            <li key={o.nombre}>
              <span aria-hidden="true">{o.icono}</span> <strong>{o.nombre}:</strong> {o.descripcion}
            </li>
          ))}
        </ul>
      </details>

      <div className="kt-botones">
        <button
          type="button"
          className="boton boton--principal kt-grande"
          onClick={() => {
            sonidos.voltear();
            setEligiendo(0);
            setPantalla('pilotos');
          }}
        >
          Elegir pilotos →
        </button>
      </div>
    </div>
  );
};

export default Karts;
