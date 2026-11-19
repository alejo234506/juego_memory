// Lógica pura del juego de memoria (sin React ni DOM) para poder probarla.

export const NIVELES = {
  facil: { nombre: 'Fácil', columnas: 4, filas: 3 },
  medio: { nombre: 'Medio', columnas: 4, filas: 4 },
  clasico: { nombre: 'Clásico', columnas: 5, filas: 4 },
  dificil: { nombre: 'Difícil', columnas: 6, filas: 5 },
};

export const ORDEN_NIVELES = ['facil', 'medio', 'clasico', 'dificil'];

export const MAZOS = {
  original: {
    nombre: 'Originales',
    icono: '💖',
    // los emojis del juego original + algunos más para los niveles grandes
    simbolos: ['✅', '🙌', '💖', '🐉', '👌', '🌹', '🤢', '😍', '🎶', '🍤', '🍕', '🚀', '⚽', '🎸', '🌈'],
  },
  animales: {
    nombre: 'Animales',
    icono: '🦊',
    simbolos: ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐵', '🐧', '🦉', '🐙', '🦋', '🐢', '🦄', '🐝', '🐳'],
  },
  comida: {
    nombre: 'Comida',
    icono: '🍓',
    simbolos: ['🍎', '🍌', '🍇', '🍓', '🍉', '🍍', '🥑', '🌮', '🍔', '🍟', '🍩', '🍪', '🧁', '🍿', '🥨'],
  },
};

export const paresDe = (nivelId) => (NIVELES[nivelId].columnas * NIVELES[nivelId].filas) / 2;

// Barajado justo de Fisher–Yates (no modifica el arreglo original)
export function barajar(arreglo, aleatorio = Math.random) {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function crearBaraja(simbolos, pares, partida = 0, aleatorio = Math.random) {
  if (pares > simbolos.length) throw new Error('No hay suficientes símbolos para tantas parejas');
  const elegidos = barajar(simbolos, aleatorio).slice(0, pares);
  return barajar([...elegidos, ...elegidos], aleatorio).map((simbolo, i) => ({
    id: `${partida}-${i}`,
    simbolo,
    estado: 'abajo', // 'abajo' | 'arriba' | 'pareja'
  }));
}

export function estadoInicial(nivel = 'medio', mazo = 'original', partida = 0, aleatorio = Math.random) {
  const totalParejas = paresDe(nivel);
  return {
    nivel,
    mazo,
    partida,
    cartas: crearBaraja(MAZOS[mazo].simbolos, totalParejas, partida, aleatorio),
    seleccion: [],
    movimientos: 0,
    parejas: 0,
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
      // Bloqueo: no se voltea nada si ya hay dos cartas comparándose o si ya ganó
      if (estado.fin || estado.seleccion.length >= 2) return estado;
      const carta = estado.cartas.find((c) => c.id === accion.id);
      if (!carta || carta.estado !== 'abajo') return estado;

      const ahora = accion.ahora ?? Date.now();
      const inicio = estado.inicio ?? ahora;
      let cartas = estado.cartas.map((c) => (c.id === accion.id ? { ...c, estado: 'arriba' } : c));
      const seleccion = [...estado.seleccion, accion.id];

      if (seleccion.length === 1) {
        return { ...estado, cartas, seleccion, inicio, resultado: evento(estado, { tipo: 'volteo', ids: seleccion }) };
      }

      const [a, b] = seleccion.map((id) => cartas.find((c) => c.id === id));
      const movimientos = estado.movimientos + 1;

      if (a.simbolo === b.simbolo) {
        cartas = cartas.map((c) => (seleccion.includes(c.id) ? { ...c, estado: 'pareja' } : c));
        const parejas = estado.parejas + 1;
        const racha = estado.racha + 1;
        const gano = parejas === estado.totalParejas;
        return {
          ...estado,
          cartas,
          seleccion: [],
          movimientos,
          parejas,
          racha,
          mejorRacha: Math.max(estado.mejorRacha, racha),
          inicio,
          fin: gano ? ahora : null,
          resultado: evento(estado, { tipo: gano ? 'victoria' : 'pareja', ids: seleccion, racha }),
        };
      }

      return {
        ...estado,
        cartas,
        seleccion,
        movimientos,
        racha: 0,
        inicio,
        resultado: evento(estado, { tipo: 'fallo', ids: seleccion }),
      };
    }

    case 'RESOLVER': {
      // Vuelve a tapar las dos cartas que no eran pareja
      if (estado.seleccion.length !== 2) return estado;
      const cartas = estado.cartas.map((c) =>
        estado.seleccion.includes(c.id) && c.estado === 'arriba' ? { ...c, estado: 'abajo' } : c
      );
      return { ...estado, cartas, seleccion: [], resultado: evento(estado, { tipo: 'oculto', ids: [] }) };
    }

    case 'REINICIAR':
      return estadoInicial(
        accion.nivel ?? estado.nivel,
        accion.mazo ?? estado.mazo,
        estado.partida + 1,
        accion.aleatorio
      );

    default:
      return estado;
  }
}

// 3 estrellas: casi perfecto · 2: bien · 1: lo lograste
export function calcularEstrellas(movimientos, pares) {
  if (movimientos <= Math.ceil(pares * 1.5)) return 3;
  if (movimientos <= Math.ceil(pares * 2.2)) return 2;
  return 1;
}

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
