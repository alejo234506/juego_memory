import { useEffect, useMemo, useRef } from 'react';
import { formatoTiempo } from '../logica/juego.js';

const COLORES = ['#ffcf4a', '#ff6b8b', '#4ad9a0', '#5cb8ff', '#b78cff', '#ff9f43'];

const Victoria = ({ movimientos, tiempo, estrellas, mejorRacha, nuevoRecord, record, nivelNombre, haySiguiente, onOtraVez, onSiguiente }) => {
  const botonRef = useRef(null);

  useEffect(() => {
    botonRef.current?.focus();
  }, []);

  // Confeti generado una sola vez
  const confeti = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
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

  return (
    <div className="victoria" role="dialog" aria-modal="true" aria-labelledby="titulo-victoria">
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
        <p className="victoria__nivel">Nivel {nivelNombre}</p>
        <h2 id="titulo-victoria">¡Lo lograste! 🎉</h2>

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
            <dt>Movimientos</dt>
            <dd>{movimientos}</dd>
          </div>
          <div>
            <dt>Tiempo</dt>
            <dd>{formatoTiempo(tiempo)}</dd>
          </div>
          <div>
            <dt>Mejor racha</dt>
            <dd>x{mejorRacha}</dd>
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
              Siguiente nivel →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Victoria;
