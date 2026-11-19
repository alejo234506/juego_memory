// Lógica pura del juego de memoria (sin React ni DOM) para poder probarla.

// Cada nivel tiene su tablero para parejas y otro para tríos
// (en tríos el número de cartas tiene que ser múltiplo de 3).
export const NIVELES = {
  facil: { nombre: 'Fácil', columnas: 4, filas: 3, trio: { columnas: 4, filas: 3 } },
  medio: { nombre: 'Medio', columnas: 4, filas: 4, trio: { columnas: 6, filas: 3 } },
  clasico: { nombre: 'Clásico', columnas: 5, filas: 4, trio: { columnas: 6, filas: 4 } },
  dificil: { nombre: 'Difícil', columnas: 6, filas: 5, trio: { columnas: 6, filas: 5 } },
  experto: { nombre: 'Experto', columnas: 8, filas: 6, trio: { columnas: 8, filas: 6 } },
};

export const ORDEN_NIVELES = ['facil', 'medio', 'clasico', 'dificil', 'experto'];

// Formas de jugar: encontrar parejas (2 cartas iguales) o tríos (3 cartas iguales)
export const MODOS = {
  parejas: { nombre: 'Parejas', icono: '👯', tamano: 2, grupo: 'Parejas' },
  trios: { nombre: 'Tríos', icono: '🧠', tamano: 3, grupo: 'Tríos' },
};

// Todos los mazos tienen 24 símbolos distintos: alcanza para el nivel Experto (24 parejas)
export const MAZOS = {
  original: {
    nombre: 'Originales',
    icono: '💖',
    // los emojis del juego original + más para los niveles grandes
    simbolos: ['✅', '🙌', '💖', '🐉', '👌', '🌹', '🤢', '😍', '🎶', '🍤', '🍕', '🚀', '⚽', '🎸', '🌈', '🎈', '🌟', '🍀', '🎁', '🔥', '💎', '🎯', '🧸', '🍦'],
  },
  animales: {
    nombre: 'Animales',
    icono: '🦊',
    simbolos: ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐵', '🐧', '🦉', '🐙', '🦋', '🐢', '🦄', '🐝', '🐳', '🐯', '🐨', '🐷', '🐮', '🐰', '🦒', '🦓', '🐘', '🦔'],
  },
  comida: {
    nombre: 'Comida',
    icono: '🍓',
    simbolos: ['🍎', '🍌', '🍇', '🍓', '🍉', '🍍', '🥑', '🌮', '🍔', '🍟', '🍩', '🍪', '🧁', '🍿', '🥨', '🍒', '🥕', '🌽', '🍕', '🥐', '🧀', '🍫', '🥞', '🍭'],
  },
  espacio: {
    nombre: 'Espacio',
    icono: '🚀',
    simbolos: ['🚀', '🛸', '🌍', '🌙', '⭐', '🪐', '☄️', '🌞', '👽', '🔭', '🛰️', '🌌', '🌠', '👨‍🚀', '🌑', '🌕', '✨', '💫', '🌗', '📡', '🤖', '👾', '🌎', '🌏'],
  },
  deportes: {
    nombre: 'Deportes',
    icono: '⚽',
    simbolos: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋', '⛳', '🏒', '🏑', '🥍', '🏏', '🛹', '⛸️', '🎿', '🏆', '🥇', '🏹', '🤿'],
  },
  oceano: {
    nombre: 'Océano',
    icono: '🐬',
    simbolos: ['🐳', '🐋', '🐬', '🐟', '🐠', '🐡', '🦈', '🐙', '🦑', '🦀', '🦞', '🦐', '🐚', '🌊', '⚓', '🛥️', '⛵', '🏝️', '🧜‍♀️', '🐢', '🦦', '🐧', '🦭', '🌴'],
  },
  musica: {
    nombre: 'Música',
    icono: '🎸',
    simbolos: ['🎵', '🎶', '🎸', '🎹', '🎺', '🎷', '🥁', '🎻', '🪕', '🎤', '🎧', '📻', '🎼', '🎙️', '🔔', '📯', '🎚️', '🎛️', '💿', '📀', '📢', '🎭', '🕺', '💃'],
  },
  transporte: {
    nombre: 'Transporte',
    icono: '🚗',
    simbolos: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🚂', '🚆', '✈️', '🚁', '⛵', '🚢'],
  },
  clima: {
    nombre: 'Naturaleza',
    icono: '🌦️',
    simbolos: ['☀️', '🌤️', '⛅', '🌧️', '⛈️', '🌩️', '❄️', '☃️', '🌪️', '🌈', '🌊', '🌋', '🌵', '🌲', '🌸', '🌻', '🍁', '🍄', '🌙', '⭐', '🔥', '💧', '🍂', '🌷'],
  },
  fantasia: {
    nombre: 'Fantasía',
    icono: '🧙',
    simbolos: ['🐉', '🦄', '🧚', '🧙', '🧜‍♀️', '🧛', '🧞', '👻', '👾', '🤖', '👽', '🎃', '👹', '👺', '🦸', '🦹', '🧝', '🏰', '🔮', '🪄', '🗝️', '⚔️', '🛡️', '👑'],
  },
  caras: {
    nombre: 'Caritas',
    icono: '😎',
    // muy parecidas entre sí: ¡el mazo más difícil!
    simbolos: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤔', '😎'],
  },
};

export const modoValido = (modo) => (modo in MODOS ? modo : 'parejas');

/** Columnas y filas del tablero según el nivel y la forma de jugar. */
export function dimensiones(nivelId, modo = 'parejas') {
  const nivel = NIVELES[nivelId];
  return modoValido(modo) === 'trios' ? nivel.trio : { columnas: nivel.columnas, filas: nivel.filas };
}

/** Cuántos grupos (parejas o tríos) hay que encontrar. */
export function gruposDe(nivelId, modo = 'parejas') {
  const { columnas, filas } = dimensiones(nivelId, modo);
  return (columnas * filas) / MODOS[modoValido(modo)].tamano;
}

export const paresDe = (nivelId) => gruposDe(nivelId, 'parejas');

// Barajado justo de Fisher–Yates (no modifica el arreglo original)
export function barajar(arreglo, aleatorio = Math.random) {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Crea la baraja: `grupos` símbolos distintos, cada uno repetido `tamano` veces (2 = parejas, 3 = tríos). */
export function crearBaraja(simbolos, grupos, partida = 0, aleatorio = Math.random, tamano = 2) {
  if (grupos > simbolos.length) throw new Error('No hay suficientes símbolos para tantos grupos');
  const elegidos = barajar(simbolos, aleatorio).slice(0, grupos);
  const todas = elegidos.flatMap((s) => Array(tamano).fill(s));
  return barajar(todas, aleatorio).map((simbolo, i) => ({
    id: `${partida}-${i}`,
    simbolo,
    estado: 'abajo', // 'abajo' | 'arriba' | 'pareja'
  }));
}

export function estadoInicial(nivel = 'medio', mazo = 'original', partida = 0, aleatorio = Math.random, modo = 'parejas') {
  const modoOk = modoValido(modo);
  const tamano = MODOS[modoOk].tamano;
  const totalParejas = gruposDe(nivel, modoOk);
  return {
    nivel,
    mazo,
    modo: modoOk,
    tamano,
    partida,
    cartas: crearBaraja(MAZOS[mazo].simbolos, totalParejas, partida, aleatorio, tamano),
    seleccion: [],
    esperando: false, // true mientras se muestran cartas que no coinciden
    movimientos: 0,
    parejas: 0, // grupos encontrados (parejas o tríos)
    totalParejas,
    racha: 0,
    mejorRacha: 0,
    inicio: null,
    fin: null,
    resultado: null, // último evento, para sonidos y animaciones
  };
}

const evento = (estado, datos) => ({ ...datos, n: (estado.resultado?.n ?? 0) + 1 });

export function reducer(estado, accion) {
  switch (accion.type) {
    case 'VOLTEAR': {
      const tamano = estado.tamano ?? 2;
      // Bloqueo: nada se voltea mientras se muestran cartas que no coinciden,
      // si ya está completo el grupo o si ya ganó
      if (estado.fin || estado.esperando || estado.seleccion.length >= tamano) return estado;
      const carta = estado.cartas.find((c) => c.id === accion.id);
      if (!carta || carta.estado !== 'abajo') return estado;

      const ahora = accion.ahora ?? Date.now();
      const inicio = estado.inicio ?? ahora;
      let cartas = estado.cartas.map((c) => (c.id === accion.id ? { ...c, estado: 'arriba' } : c));
      const seleccion = [...estado.seleccion, accion.id];

      if (seleccion.length === 1) {
        return { ...estado, cartas, seleccion, inicio, resultado: evento(estado, { tipo: 'volteo', ids: seleccion }) };
      }

      const primera = cartas.find((c) => c.id === seleccion[0]);

      // Esta carta no es igual a las anteriores: falló el intento
      if (carta.simbolo !== primera.simbolo) {
        return {
          ...estado,
          cartas,
          seleccion,
          esperando: true,
          movimientos: estado.movimientos + 1,
          racha: 0,
          inicio,
          resultado: evento(estado, { tipo: 'fallo', ids: seleccion }),
        };
      }

      // Coincide pero el trío todavía no está completo
      if (seleccion.length < tamano) {
        return { ...estado, cartas, seleccion, inicio, resultado: evento(estado, { tipo: 'volteo', ids: seleccion }) };
      }

      // ¡Grupo completo!
      cartas = cartas.map((c) => (seleccion.includes(c.id) ? { ...c, estado: 'pareja' } : c));
      const parejas = estado.parejas + 1;
      const racha = estado.racha + 1;
      const gano = parejas === estado.totalParejas;
      return {
        ...estado,
        cartas,
        seleccion: [],
        movimientos: estado.movimientos + 1,
        parejas,
        racha,
        mejorRacha: Math.max(estado.mejorRacha, racha),
        inicio,
        fin: gano ? ahora : null,
        resultado: evento(estado, { tipo: gano ? 'victoria' : 'pareja', ids: seleccion, racha }),
      };
    }

    case 'RESOLVER': {
      // Vuelve a tapar las cartas que no coincidían
      if (!estado.esperando) return estado;
      const cartas = estado.cartas.map((c) =>
        estado.seleccion.includes(c.id) && c.estado === 'arriba' ? { ...c, estado: 'abajo' } : c
      );
      return { ...estado, cartas, seleccion: [], esperando: false, resultado: evento(estado, { tipo: 'oculto', ids: [] }) };
    }

    case 'REINICIAR':
      return estadoInicial(
        accion.nivel ?? estado.nivel,
        accion.mazo ?? estado.mazo,
        estado.partida + 1,
        accion.aleatorio,
        accion.modo ?? estado.modo
      );

    default:
      return estado;
  }
}

// 3 estrellas: casi perfecto · 2: bien · 1: lo lograste. Los tríos dan más margen.
export function calcularEstrellas(movimientos, grupos, tamano = 2) {
  const [tres, dos] = tamano === 3 ? [2.4, 3.6] : [1.5, 2.2];
  if (movimientos <= Math.ceil(grupos * tres)) return 3;
  if (movimientos <= Math.ceil(grupos * dos)) return 2;
  return 1;
}

/** Clave para guardar el récord: los tríos llevan su propio récord por nivel. */
export const claveRecord = (nivel, modo = 'parejas') => (modoValido(modo) === 'trios' ? `${nivel}-trios` : nivel);

export function formatoTiempo(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(total / 60);
  const seg = String(total % 60).padStart(2, '0');
  return `${min}:${seg}`;
}

// Mejor marca = menos movimientos; si empatan, menos tiempo
export function esMejorMarca(nueva, anterior) {
  if (!anterior) return true;
  if (nueva.movimientos !== anterior.movimientos) return nueva.movimientos < anterior.movimientos;
  return nueva.tiempo < anterior.tiempo;
}
