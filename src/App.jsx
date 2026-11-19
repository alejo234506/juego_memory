import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { ponerSilencio, sonidos } from './logica/sonido.js';
import { leer, guardar } from './logica/almacen.js';

// Cada juego se carga solo cuando lo abres (la página inicial carga más rápido)
const JUEGOS = [
  {
    id: 'memoria',
    nombre: 'Memoria',
    icono: '🃏',
    habilidad: 'Memoria',
    descripcion: 'Voltea las cartas y encuentra todas las parejas.',
    color: '#9b1f40',
    Componente: lazy(() => import('./juegos/memoria/Memoria.jsx')),
  },
  {
    id: 'rompecabezas',
    nombre: 'Rompecabezas',
    icono: '🧩',
    habilidad: 'Lógica',
    descripcion: 'Desliza las fichas hasta armar la imagen.',
    color: '#2a6fb0',
    Componente: lazy(() => import('./juegos/rompecabezas/Rompecabezas.jsx')),
  },
  {
    id: 'adivinanzas',
    nombre: 'Adivinanzas',
    icono: '🤔',
    habilidad: 'Ingenio',
    descripcion: 'Resuelve acertijos con pistas y gana rachas.',
    color: '#d0851a',
    Componente: lazy(() => import('./juegos/adivinanzas/Adivinanzas.jsx')),
  },
  {
    id: 'detective',
    nombre: 'Detective',
    icono: '🕵️',
    habilidad: 'Deducción',
    descripcion: 'Investiga pistas, interroga sospechosos y resuelve el crimen.',
    color: '#3d3a4f',
    Componente: lazy(() => import('./juegos/detective/Detective.jsx')),
  },
  {
    id: 'sopa',
    nombre: 'Sopa de letras',
    icono: '🔤',
    habilidad: 'Atención',
    descripcion: 'Encuentra las palabras escondidas en todas las direcciones.',
    color: '#1f7a4d',
    Componente: lazy(() => import('./juegos/sopa/SopaDeLetras.jsx')),
  },
  {
    id: 'sudoku',
    nombre: 'Sudoku',
    icono: '🔢',
    habilidad: 'Concentración',
    descripcion: 'Llena la cuadrícula sin repetir números. Del Mini al Experto.',
    color: '#5b4636',
    Componente: lazy(() => import('./juegos/sudoku/Sudoku.jsx')),
  },
  {
    id: 'codigo',
    nombre: 'Código secreto',
    icono: '🔐',
    habilidad: 'Razonamiento',
    descripcion: 'Descifra la clave escondida combinando las pistas de cada intento.',
    color: '#7a2e8c',
    Componente: lazy(() => import('./juegos/codigo/CodigoSecreto.jsx')),
  },
  {
    id: 'karts',
    nombre: 'Turbo Karts',
    icono: '🏎️',
    habilidad: 'Reflejos',
    descripcion: 'Carreras de karts para 2 jugadores en la misma pantalla, con turbos y objetos.',
    color: '#c62828',
    Componente: lazy(() => import('./juegos/karts/Karts.jsx')),
  },
];

const rutaActual = () => {
  const id = window.location.hash.replace(/^#\/?/, '');
  return JUEGOS.some((j) => j.id === id) ? id : null;
};

const temaSistema = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro');

function prefsIniciales() {
  // Antes el tema y el sonido se guardaban en las preferencias de la memoria
  const viejas = leer('memoria-prefs', {});
  const prefs = { ...viejas, ...leer('sala-prefs', {}) };
  return {
    tema: prefs.tema === 'oscuro' || prefs.tema === 'claro' ? prefs.tema : temaSistema(),
    silencio: !!prefs.silencio,
  };
}

// Si un juego falla, se muestra un aviso en vez de dejar la página en blanco
class ProteccionJuego extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="sala-error" role="alert">
          <p>😵 Algo salió mal al abrir este juego.</p>
          <button type="button" className="boton boton--principal" onClick={this.props.onVolver}>
            Volver a la sala
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Cargando = () => (
  <div className="sala-cargando" role="status">
    <span className="sala-cargando__cartas" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
    Preparando la mesa…
  </div>
);

const App = () => {
  const [ruta, setRuta] = useState(rutaActual);
  const [{ tema, silencio }, setPrefs] = useState(prefsIniciales);
  const tituloRef = useRef(null);
  const primeraVez = useRef(true);

  const juego = JUEGOS.find((j) => j.id === ruta);

  // La ruta vive en la URL (#/memoria), así funcionan el botón "atrás" y los enlaces
  useEffect(() => {
    const alCambiar = () => setRuta(rutaActual());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  useEffect(() => {
    document.title = juego ? `${juego.nombre} · Sala de Juegos` : 'Sala de Juegos Mentales';
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    tituloRef.current?.focus();
  }, [juego]);

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
  }, [tema]);

  useEffect(() => {
    ponerSilencio(silencio);
  }, [silencio]);

  useEffect(() => {
    guardar('sala-prefs', { tema, silencio });
  }, [tema, silencio]);

  const abrir = (id) => {
    sonidos.voltear();
    window.location.hash = `/${id}`;
  };

  const volver = () => {
    if (window.location.hash) {
      window.location.hash = '';
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setRuta(null);
  };

  return (
    <div className="app">
      <header className="cabecera">
        {juego ? (
          <div className="sala-titulo">
            <button type="button" className="boton-redondo" onClick={volver} aria-label="Volver a la sala de juegos" title="Volver a la sala">
              ←
            </button>
            <h1 className="logo" ref={tituloRef} tabIndex={-1}>
              <span className="sala-titulo__icono" aria-hidden="true">
                {juego.icono}
              </span>
              <strong>{juego.nombre}</strong>
            </h1>
          </div>
        ) : (
          <h1 className="logo" ref={tituloRef} tabIndex={-1}>
            <span className="logo__cartas" aria-hidden="true">
              <span className="mini-dorso" />
              <span className="mini-frente">🧠</span>
            </span>
            <span>
              Sala de <strong>Juegos</strong>
            </span>
          </h1>
        )}

        <div className="cabecera__botones">
          <button
            type="button"
            className="boton-redondo"
            onClick={() => setPrefs((p) => ({ ...p, silencio: !p.silencio }))}
            aria-label={silencio ? 'Activar sonido' : 'Silenciar'}
            title={silencio ? 'Activar sonido' : 'Silenciar'}
          >
            {silencio ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            className="boton-redondo"
            onClick={() => setPrefs((p) => ({ ...p, tema: p.tema === 'oscuro' ? 'claro' : 'oscuro' }))}
            aria-label="Cambiar entre tema claro y oscuro"
            title="Cambiar tema"
          >
            {tema === 'oscuro' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {juego ? (
        <ProteccionJuego key={juego.id} onVolver={volver}>
          <Suspense fallback={<Cargando />}>
            <juego.Componente />
          </Suspense>
        </ProteccionJuego>
      ) : (
        <main className="sala">
          <p className="sala__intro">Elige un juego y pon a prueba tu mente 🧠✨</p>
          <ul className="sala__juegos">
            {JUEGOS.map((j, i) => (
              <li key={j.id} style={{ '--color-caja': j.color, '--i': i }}>
                <button type="button" className="sala-caja" onClick={() => abrir(j.id)}>
                  <span className="sala-caja__tapa">
                    <span className="sala-caja__icono" aria-hidden="true">
                      {j.icono}
                    </span>
                    <span className="sala-caja__nombre">{j.nombre}</span>
                  </span>
                  <span className="sala-caja__info">
                    <span className="sala-caja__habilidad">Entrena: {j.habilidad}</span>
                    <span className="sala-caja__descripcion">{j.descripcion}</span>
                    <span className="sala-caja__jugar">Jugar →</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}
    </div>
  );
};

export default App;
