const Carta = ({ carta, indice, animacion, onVoltear }) => {
  const visible = carta.estado !== 'abajo';
  const clases = [
    'carta',
    visible && 'volteada',
    carta.estado === 'pareja' && 'emparejada',
    animacion,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={clases}
      style={{ '--i': indice }}
      onClick={onVoltear}
      data-indice={indice}
      aria-label={visible ? `Carta ${indice + 1}: ${carta.simbolo}` : `Carta ${indice + 1}, boca abajo`}
      aria-pressed={visible}
      aria-disabled={carta.estado === 'pareja'}
    >
      <span className="carta__interior">
        <span className="carta__cara carta__dorso" aria-hidden="true">
          <span className="dorso__emblema">?</span>
        </span>
        <span className="carta__cara carta__frente" aria-hidden="true">
          <span className="esquina esquina--arriba">{carta.simbolo}</span>
          <span className="simbolo">{carta.simbolo}</span>
          <span className="esquina esquina--abajo">{carta.simbolo}</span>
        </span>
      </span>
    </button>
  );
};

export default Carta;
