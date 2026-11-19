import { useEffect, useReducer, useRef, useState } from 'react';
import Carta from '../../Componentes/Carta.jsx';
import Victoria from '../../Componentes/Victoria.jsx';
import {
  NIVELES,
  ORDEN_NIVELES,
  MAZOS,
  reducer,
  estadoInicial,
  calcularEstrellas,
  formatoTiempo,
  esMejorMarca,
} from '../../logica/juego.js';
import { sonidos } from '../../logica/sonido.js';
import { leer, guardar } from '../../logica/almacen.js';

const Memoria = () => {
  const [estado, despachar] = useReducer(reducer, null, () => {
    const prefs = leer('memoria-prefs', {});
    return estadoInicial(
      prefs.nivel in NIVELES ? prefs.nivel : 'medio',
      prefs.mazo in MAZOS ? prefs.mazo : 'original'
    );
  });
  const [ahora, setAhora] = useState(() => Date.now());
  const [records, setRecords] = useState(() => leer('memoria-records', {}));
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [aviso, setAviso] = useState(null);
  const recordsRef = useRef(records);
  const tableroRef = useRef(null);

  const nivel = NIVELES[estado.nivel];
  const tiempo = estado.inicio ? Math.max(0, (estado.fin ?? ahora) - estado.inicio) : 0;
  const estrellasActuales = calcularEstrellas(estado.movimientos, estado.totalParejas);
  const record = records[estado.nivel];

  // Cronómetro: corre desde la primera carta hasta ganar
  useEffect(() => {
    if (!estado.inicio || estado.fin) return;
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(t);
  }, [estado.inicio, estado.fin]);

  // Si no son pareja, se vuelven a tapar después de un momento
  useEffect(() => {
    if (estado.resultado?.tipo !== 'fallo') return;
    const t = setTimeout(() => despachar({ type: 'RESOLVER' }), 1050);
    return () => clearTimeout(t);
  }, [estado.resultado]);

  // Sonidos, rachas y récords según lo que acaba de pasar
  useEffect(() => {
    const r = estado.resultado;
    if (!r) return;
    if (r.tipo === 'volteo') sonidos.voltear();
    if (r.tipo === 'fallo') {
      sonidos.voltear();
      sonidos.fallo();
    }
    if (r.tipo === 'pareja' || r.tipo === 'victoria') {
      sonidos.voltear();
      sonidos.pareja();
      if (r.racha >= 2) {
        sonidos.racha();
        setAviso({ texto: `¡Racha x${r.racha}! 🔥`, n: r.n });
      }
    }
    if (r.tipo === 'victoria') {
      const t = setTimeout(sonidos.victoria, 450);
      const marca = {
        movimientos: estado.movimientos,
        tiempo: estado.fin - estado.inicio,
        estrellas: calcularEstrellas(estado.movimientos, estado.totalParejas),
      };
      const esNuevo = esMejorMarca(marca, recordsRef.current[estado.nivel]);
      setNuevoRecord(esNuevo);
      if (esNuevo) {
        const nuevos = { ...recordsRef.current, [estado.nivel]: marca };
        recordsRef.current = nuevos;
        setRecords(nuevos);
        guardar('memoria-records', nuevos);
      }
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.resultado]);

  // El aviso de racha se esconde solo
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 1400);
    return () => clearTimeout(t);
  }, [aviso]);

  // Recordar el nivel y el mazo elegidos
  useEffect(() => {
    guardar('memoria-prefs', { ...leer('memoria-prefs', {}), nivel: estado.nivel, mazo: estado.mazo });
  }, [estado.nivel, estado.mazo]);

  const reiniciar = (cambios = {}) => {
    setNuevoRecord(false);
    setAviso(null);
    despachar({ type: 'REINICIAR', ...cambios });
  };

  const indiceNivel = ORDEN_NIVELES.indexOf(estado.nivel);
  const siguienteNivel = ORDEN_NIVELES[indiceNivel + 1];

  // Moverse entre cartas con las flechas del teclado
  const alPresionarTecla = (e) => {
    const pasos = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: nivel.columnas, ArrowUp: -nivel.columnas };
    if (!(e.key in pasos)) return;
    const actual = Number(document.activeElement?.dataset?.indice);
    if (Number.isNaN(actual)) return;
    const destino = actual + pasos[e.key];
    if (destino < 0 || destino >= estado.cartas.length) return;
    e.preventDefault();
    tableroRef.current?.querySelector(`[data-indice="${destino}"]`)?.focus();
  };

  const animacionDe = (carta) => {
    const r = estado.resultado;
    if (!r?.ids?.includes(carta.id)) return '';
    if (r.tipo === 'fallo') return 'sacudir';
    if (r.tipo === 'pareja' || r.tipo === 'victoria') return 'celebrar';
    return '';
  };

  return (
    <>
      <section className="opciones" aria-label="Opciones de juego">
        <div className="selector" role="group" aria-label="Nivel">
          {ORDEN_NIVELES.map((id) => (
            <button
              key={id}
              type="button"
              className={`selector__opcion ${estado.nivel === id ? 'activa' : ''}`}
              aria-pressed={estado.nivel === id}
              onClick={() => reiniciar({ nivel: id })}
            >
              {NIVELES[id].nombre}
              <small>
                {NIVELES[id].columnas}×{NIVELES[id].filas}
              </small>
            </button>
          ))}
        </div>
        <div className="selector" role="group" aria-label="Mazo de cartas">
          {Object.entries(MAZOS).map(([id, mazo]) => (
            <button
              key={id}
              type="button"
              className={`selector__opcion ${estado.mazo === id ? 'activa' : ''}`}
              aria-pressed={estado.mazo === id}
              onClick={() => reiniciar({ mazo: id })}
            >
              <span aria-hidden="true">{mazo.icono}</span> {mazo.nombre}
            </button>
          ))}
        </div>
      </section>

      <section className="marcador" aria-live="polite">
        <div className="dato">
          <span className="dato__titulo">Movimientos</span>
          <span className="dato__valor">{estado.movimientos}</span>
        </div>
        <div className="dato">
          <span className="dato__titulo">Tiempo</span>
          <span className="dato__valor">{formatoTiempo(tiempo)}</span>
        </div>
        <div className="dato">
          <span className="dato__titulo">Parejas</span>
          <span className="dato__valor">
            {estado.parejas}/{estado.totalParejas}
          </span>
        </div>
        <div className="dato">
          <span className="dato__titulo">Estrellas</span>
          <span className="dato__valor estrellas" aria-label={`${estrellasActuales} de 3`}>
            {[1, 2, 3].map((n) => (
              <span key={n} className={n <= estrellasActuales ? 'llena' : ''}>
                ★
              </span>
            ))}
          </span>
        </div>
        <div className="dato dato--record">
          <span className="dato__titulo">🏆 Récord</span>
          <span className="dato__valor">
            {record ? `${record.movimientos} mov · ${formatoTiempo(record.tiempo)}` : '—'}
          </span>
        </div>
      </section>

      <main className="mesa">
        <div
          ref={tableroRef}
          className="tablero"
          style={{ '--cols': nivel.columnas, '--filas': nivel.filas }}
          onKeyDown={alPresionarTecla}
          aria-label="Tablero de cartas"
        >
          {estado.cartas.map((carta, i) => (
            <Carta
              key={carta.id}
              carta={carta}
              indice={i}
              animacion={animacionDe(carta)}
              onVoltear={() => despachar({ type: 'VOLTEAR', id: carta.id, ahora: Date.now() })}
            />
          ))}
        </div>

        {aviso && (
          <div key={aviso.n} className="aviso" role="status">
            {aviso.texto}
          </div>
        )}
      </main>

      <footer className="pie">
        <button type="button" className="boton" onClick={() => reiniciar()}>
          ↻ Reiniciar
        </button>
        <p>Usa el mouse, toca la pantalla o muévete con las flechas y Enter.</p>
      </footer>

      {estado.fin && (
        <Victoria
          movimientos={estado.movimientos}
          tiempo={estado.fin - estado.inicio}
          estrellas={calcularEstrellas(estado.movimientos, estado.totalParejas)}
          mejorRacha={estado.mejorRacha}
          nuevoRecord={nuevoRecord}
          record={record}
          nivelNombre={nivel.nombre}
          haySiguiente={!!siguienteNivel}
          onOtraVez={() => reiniciar()}
          onSiguiente={() => reiniciar({ nivel: siguienteNivel })}
        />
      )}
    </>
  );
};

export default Memoria;
