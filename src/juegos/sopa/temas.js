// Temas de la sopa de letras. Las palabras se muestran con tildes en la lista;
// en la cuadrícula se escriben sin tildes (pero la Ñ se conserva).

export const TEMAS = {
  animales: {
    nombre: 'Animales',
    icono: '🦁',
    palabras: [
      'Perro', 'Gato', 'León', 'Tigre', 'Elefante', 'Jirafa', 'Caballo', 'Conejo',
      'Delfín', 'Ballena', 'Águila', 'Tortuga', 'Serpiente', 'Mono', 'Oso', 'Lobo',
      'Zorro', 'Pingüino', 'Cebra', 'Búho', 'Ratón', 'Hormiga',
    ],
  },
  frutas: {
    nombre: 'Frutas',
    icono: '🍓',
    palabras: [
      'Manzana', 'Pera', 'Banano', 'Uva', 'Fresa', 'Mango', 'Piña', 'Sandía',
      'Melón', 'Papaya', 'Kiwi', 'Limón', 'Naranja', 'Cereza', 'Durazno', 'Guayaba',
      'Maracuyá', 'Coco', 'Mora', 'Lulo', 'Guanábana',
    ],
  },
  paises: {
    nombre: 'Países',
    icono: '🌎',
    palabras: [
      'Colombia', 'México', 'Perú', 'Chile', 'Brasil', 'España', 'Francia', 'Italia',
      'Japón', 'China', 'Canadá', 'Cuba', 'Ecuador', 'Bolivia', 'Panamá', 'Uruguay',
      'Paraguay', 'Alemania', 'Egipto', 'India', 'Rusia',
    ],
  },
  colores: {
    nombre: 'Colores',
    icono: '🎨',
    palabras: [
      'Rojo', 'Azul', 'Verde', 'Amarillo', 'Negro', 'Blanco', 'Rosado', 'Morado',
      'Naranja', 'Gris', 'Café', 'Violeta', 'Celeste', 'Dorado', 'Plateado', 'Turquesa',
      'Beige', 'Lila', 'Fucsia', 'Marrón',
    ],
  },
  deportes: {
    nombre: 'Deportes',
    icono: '⚽',
    palabras: [
      'Fútbol', 'Tenis', 'Natación', 'Boxeo', 'Golf', 'Rugby', 'Béisbol', 'Ciclismo',
      'Atletismo', 'Voleibol', 'Karate', 'Judo', 'Surf', 'Esgrima', 'Remo', 'Patinaje',
      'Ajedrez', 'Hockey', 'Baloncesto', 'Polo',
    ],
  },
  profesiones: {
    nombre: 'Profesiones',
    icono: '👩‍⚕️',
    palabras: [
      'Médico', 'Abogado', 'Docente', 'Chef', 'Piloto', 'Bombero', 'Policía', 'Pintor',
      'Músico', 'Actor', 'Juez', 'Ingeniero', 'Enfermero', 'Carpintero', 'Panadero',
      'Granjero', 'Dentista', 'Arquitecto', 'Periodista', 'Sastre', 'Cartero',
    ],
  },
  instrumentos: {
    nombre: 'Instrumentos',
    icono: '🎸',
    palabras: [
      'Guitarra', 'Piano', 'Violín', 'Flauta', 'Tambor', 'Trompeta', 'Arpa', 'Bajo',
      'Saxofón', 'Batería', 'Acordeón', 'Clarinete', 'Maracas', 'Ukelele', 'Órgano',
      'Tuba', 'Banjo', 'Gaita', 'Charango', 'Marimba', 'Triángulo',
    ],
  },
  cuerpo: {
    nombre: 'Cuerpo humano',
    icono: '🫀',
    palabras: [
      'Cabeza', 'Brazo', 'Pierna', 'Mano', 'Pie', 'Ojo', 'Nariz', 'Boca', 'Oreja',
      'Diente', 'Lengua', 'Cuello', 'Hombro', 'Rodilla', 'Codo', 'Dedo', 'Uña',
      'Corazón', 'Pulmón', 'Cerebro', 'Hueso', 'Espalda', 'Cadera',
    ],
  },
  espacio: {
    nombre: 'Espacio',
    icono: '🚀',
    palabras: [
      'Sol', 'Luna', 'Estrella', 'Planeta', 'Cometa', 'Galaxia', 'Marte', 'Venus',
      'Júpiter', 'Saturno', 'Tierra', 'Cohete', 'Órbita', 'Satélite', 'Asteroide',
      'Nebulosa', 'Eclipse', 'Meteoro', 'Urano', 'Plutón',
    ],
  },
};

export const ORDEN_TEMAS = Object.keys(TEMAS);
