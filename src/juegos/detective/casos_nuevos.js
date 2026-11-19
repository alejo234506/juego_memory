// Casos nuevos del juego Detective. Todo el contenido es original.
//
// Campos extra (opcionales) además de los de casos.js:
// - pistas[id].hora: 'HH:MM' (y `dia: 1` si es después de medianoche) → aparece en la cronología.
// - contradicciones: [{ id, pistas: [a, b], sospechoso, deduccion, necesaria }]
//   El jugador cruza dos pistas de la libreta; si forman la contradicción, se revela la deducción.
//   `necesaria: true` → hay que descubrirla para la tercera insignia.
// - sospechoso.rigor: { requiere, pregunta, respuesta: [...], pista }
//   Pregunta extra que solo aparece después de interrogarlo y de encontrar la pista `requiere`.

export const NUEVOS = [
  // ==================================================================
  {
    id: 'colegio',
    titulo: 'Galleta desapareció del salón',
    icono: '🐹',
    dificultad: 'Fácil',
    acciones: 6,
    intro:
      'Galleta, el hámster del grado cuarto, desapareció de su jaula durante el recreo, de 10:00 a 10:30. ' +
      'Ayer la profesora anunció que Galleta se iría a vivir al salón de tercero, y medio curso quedó triste. ' +
      'La jaula no está rota y nadie vio al hámster correr por los pasillos. ¿Quién se lo llevó?',
    sospechosos: [
      {
        id: 'ruth',
        nombre: 'Profe Ruth',
        avatar: '👩‍🏫',
        rol: 'Directora de grupo',
        descripcion: 'Gafas rojas, siempre con un termo de tinto. Fue ella quien decidió que Galleta cambiaría de salón.',
        coartada: 'Dice que pasó el recreo en la sala de profesores calificando exámenes.',
        interrogatorio: [
          'Galleta se va a tercero porque allá tienen una jaula más grande, nada más.',
          'Ayer cuando lo anuncié, Valentina se puso a llorar. Le tiene mucho cariño.',
        ],
        pista: 'p-ruth',
      },
      {
        id: 'tomas',
        nombre: 'Tomás',
        avatar: '⚽',
        rol: 'Estudiante, arquero del curso',
        descripcion: 'Siempre tiene los guayos embarrados. Dice que los hámsteres le dan alergia.',
        coartada: 'Dice que jugó fútbol todo el recreo.',
        interrogatorio: [
          '¡Yo jugué fútbol todo el recreo! Bueno... a las 10:10 el balón se metió por la ventana del salón y entré a sacarlo.',
          'Galleta estaba en su jaula, dormido. Me salí rápido porque me pica la nariz con el aserrín.',
        ],
        pista: 'p-tomas',
      },
      {
        id: 'valentina',
        nombre: 'Valentina',
        avatar: '👧',
        rol: 'Estudiante, encargada de alimentar a Galleta',
        descripcion: 'Trenzas con cintas moradas. Todos los días le lleva una zanahoria a Galleta.',
        coartada: 'Dice que pasó el recreo leyendo en la biblioteca.',
        interrogatorio: [
          'Yo estuve en la biblioteca todo el recreo, leyendo un libro de dinosaurios.',
          'No es justo que se lleven a Galleta. ¡Yo soy la que lo cuida!',
        ],
        pista: 'p-valentina',
      },
      {
        id: 'efrain',
        nombre: 'Don Efraín',
        avatar: '🧹',
        rol: 'Conserje del colegio',
        descripcion: 'Conoce cada rincón del colegio. Barre el pasillo del cuarto durante el recreo.',
        coartada: 'Dice que estuvo barriendo el pasillo frente al salón.',
        interrogatorio: [
          'Barrí el pasillo todo el recreo. A las 10:20 vi a una niña con cintas moradas salir del salón con una caja de zapatos.',
          'Pensé que llevaba una maqueta. Los niños siempre andan con cajas.',
        ],
        pista: 'p-efrain',
      },
    ],
    lugares: [
      { id: 'jaula', nombre: 'Jaula de Galleta', icono: '🏠', pista: 'p-jaula' },
      { id: 'biblioteca', nombre: 'Biblioteca', icono: '📚', pista: 'p-biblioteca' },
      { id: 'cancha', nombre: 'Cancha de fútbol', icono: '🥅', pista: 'p-cancha' },
      { id: 'casilleros', nombre: 'Casilleros del salón', icono: '🗄️', pista: 'p-casillero' },
      { id: 'sala-profes', nombre: 'Sala de profesores', icono: '☕', pista: 'p-sala' },
    ],
    pistas: {
      'p-jaula': {
        texto: 'La puerta de la jaula se abrió desde afuera: el seguro solo se puede quitar por fuera. Adentro quedan trocitos de zanahoria fresca.',
        clave: false,
        sobre: [],
      },
      'p-biblioteca': {
        texto: 'En la puerta hay un cartel: "Cerrado durante el recreo por inventario". La bibliotecaria confirma que no abrió hasta las 10:30.',
        clave: true,
        sobre: [],
        hora: '10:00',
      },
      'p-cancha': {
        texto: 'El árbitro del recreo anotó en su libreta que Tomás jugó todo el partido, con una salida corta a las 10:10 "por el balón".',
        clave: false,
        sobre: ['tomas'],
      },
      'p-casillero': {
        texto: 'En el último casillero, sin nombre, hay una caja de zapatos con huequitos. Adentro duerme Galleta, junto a media zanahoria y una cinta de pelo morada.',
        clave: true,
        sobre: [],
      },
      'p-sala': {
        texto: 'El libro de la sala de profesores muestra que la profe Ruth estuvo ahí todo el recreo, con otros dos profesores.',
        clave: false,
        sobre: ['ruth'],
      },
      'p-ruth': {
        texto: 'La profe Ruth anunció ayer que Galleta se iría a tercero. Valentina lloró al oírlo.',
        clave: false,
        sobre: ['ruth', 'valentina'],
      },
      'p-tomas': {
        texto: 'Tomás entró al salón por el balón y vio a Galleta dormido en su jaula.',
        clave: false,
        sobre: ['tomas'],
        hora: '10:10',
      },
      'p-valentina': {
        texto: 'Valentina dice que pasó todo el recreo leyendo en la biblioteca, y que no es justo que se lleven a Galleta.',
        clave: true,
        sobre: ['valentina'],
      },
      'p-efrain': {
        texto: 'Don Efraín vio a una niña con cintas moradas salir del salón con una caja de zapatos.',
        clave: false,
        sobre: [],
        hora: '10:20',
      },
    },
    contradicciones: [
      {
        id: 'c-biblioteca',
        pistas: ['p-valentina', 'p-biblioteca'],
        sospechoso: 'valentina',
        deduccion: 'Valentina no pudo estar leyendo en la biblioteca: estuvo cerrada todo el recreo. Su coartada es falsa.',
        necesaria: false,
      },
      {
        id: 'c-hora',
        pistas: ['p-tomas', 'p-efrain'],
        sospechoso: null,
        deduccion: 'Galleta seguía en su jaula a las 10:10 y la caja salió del salón a las 10:20: se lo llevaron entre esas dos horas.',
        necesaria: false,
      },
    ],
    motivos: [
      { id: 'quedarselo', texto: 'No quería que se lo llevaran a otro salón' },
      { id: 'vender', texto: 'Venderlo en la tienda de mascotas' },
      { id: 'broma', texto: 'Hacerle una broma a la profesora' },
      { id: 'alergia', texto: 'Le daba alergia tenerlo en el salón' },
    ],
    metodos: [
      { id: 'caja', texto: 'Lo escondió en una caja de zapatos en un casillero' },
      { id: 'patio', texto: 'Lo soltó en el patio' },
      { id: 'morral', texto: 'Se lo llevó en el morral a la casa' },
      { id: 'peluche', texto: 'Lo cambió por un peluche' },
    ],
    solucion: { culpable: 'valentina', motivo: 'quedarselo', metodo: 'caja' },
    explicacion:
      'A las 10:10 Tomás vio a Galleta en su jaula, y a las 10:20 don Efraín vio salir a una niña con cintas moradas ' +
      'y una caja de zapatos. Valentina, la de las cintas moradas, dijo que estaba en la biblioteca... pero la ' +
      'biblioteca estuvo cerrada todo el recreo. En el casillero sin nombre estaba Galleta, con su zanahoria y una ' +
      'cinta morada. Valentina lo escondió porque no quería que se lo llevaran a otro salón.',
  },

  // ==================================================================
  {
    id: 'circo',
    titulo: 'Apagón bajo la carpa',
    icono: '🎪',
    dificultad: 'Media',
    acciones: 6,
    intro:
      'Esta noche unos cazatalentos de un circo internacional vinieron a escoger a UN artista para un contrato. ' +
      'Las favoritas eran la malabarista Kira y una acróbata de la compañía. A las 20:15, justo antes del acto de Kira, ' +
      'todas las luces de la carpa se apagaron y la función se suspendió. Los cazatalentos se fueron sin ver a Kira. ' +
      'El técnico dice que alguien cortó la luz a propósito.',
    sospechosos: [
      {
        id: 'kira',
        nombre: 'Kira',
        avatar: '🤹‍♀️',
        rol: 'Malabarista estrella',
        descripcion: 'Lanza siete clavas al tiempo. Lleva diez años en el circo.',
        coartada: 'Dice que estaba detrás de la cortina, lista para salir.',
        interrogatorio: [
          'Esta tarde discutí con Bruno por el orden de los actos, pero él no sabe ni cambiar un bombillo.',
          'Ayer Mara me preguntó dónde quedaba la caseta eléctrica. Me dijo que era "para cargar el celular".',
        ],
        pista: 'p-kira',
      },
      {
        id: 'bruno',
        nombre: 'Bruno',
        avatar: '🤡',
        rol: 'Payaso',
        descripcion: 'Nariz roja y cara pintada de blanco. Peleó a gritos con Kira esta tarde.',
        coartada: 'Dice que a esa hora estaba en la pista haciendo su número.',
        interrogatorio: [
          '¡Sí, peleé con Kira! Ella siempre quiere el mejor turno.',
          'Pero cuando se fue la luz yo estaba en plena pista con mis zapatos gigantes. ¡El público me vio!',
        ],
        pista: 'p-bruno',
      },
      {
        id: 'mara',
        nombre: 'Mara',
        avatar: '🤸‍♀️',
        rol: 'Acróbata de trapecio',
        descripcion: 'Siempre tiene las manos blancas de magnesio, el polvo que usan los acróbatas para no resbalarse.',
        coartada: 'Dice que estuvo calentando en la carpa de práctica y que doña Leonor la vio.',
        interrogatorio: [
          'Calenté sin parar de 20:00 a 20:30 en la carpa de práctica. Doña Leonor me vio, pregúntele.',
          'Kira y yo somos amigas. Que gane la mejor, ¿no?',
        ],
        pista: 'p-mara',
      },
      {
        id: 'leonor',
        nombre: 'Doña Leonor',
        avatar: '🎩',
        rol: 'Dueña del circo',
        descripcion: 'Sombrero de copa y bastón dorado. Necesita que el circo consiga ese contrato.',
        coartada: 'Dice que a esa hora estaba en la taquilla.',
        interrogatorio: [
          'A las 20:00 pasé por la carpa de práctica y vi a Mara calentando.',
          'A las 20:05 me fui a la taquilla a contar boletas. Desde ahí ya no la vi más.',
        ],
        pista: 'p-leonor',
      },
      {
        id: 'pipo',
        nombre: 'Pipo',
        avatar: '💡',
        rol: 'Técnico de luces',
        descripcion: 'Audífonos gigantes y una linterna en la frente. Maneja la consola desde una tarima.',
        coartada: 'Dice que estaba en la consola de luces.',
        interrogatorio: [
          'Mi consola funcionaba perfecto. La luz se fue en TODA la carpa, eso viene de la caseta eléctrica general.',
          'La caseta queda atrás, en el potrero. Con la lluvia de ayer eso es puro barro.',
        ],
        pista: 'p-pipo',
      },
    ],
    lugares: [
      { id: 'caseta', nombre: 'Caseta eléctrica', icono: '⚡', pista: 'p-caseta' },
      { id: 'camerino-bruno', nombre: 'Camerino de Bruno', icono: '🎭', pista: 'p-camerino-bruno' },
      { id: 'camerino-mara', nombre: 'Camerino de Mara', icono: '🪞', pista: 'p-camerino-mara' },
      { id: 'consola', nombre: 'Consola de luces', icono: '🎛️', pista: 'p-consola' },
      { id: 'taquilla', nombre: 'Taquilla', icono: '🎟️', pista: 'p-taquilla' },
    ],
    pistas: {
      'p-caseta': {
        texto: 'El interruptor general está bajado. En la palanca hay una huella blanca de polvo SECO, no de crema.',
        clave: true,
        sobre: [],
      },
      'p-camerino-bruno': {
        texto: 'Maquillaje blanco de payaso en crema, grasoso. Nada de polvo. Sus zapatos gigantes están limpios.',
        clave: false,
        sobre: ['bruno'],
      },
      'p-camerino-mara': {
        texto: 'Una bolsa de magnesio abierta y unas zapatillas de práctica llenas de barro fresco del potrero.',
        clave: true,
        sobre: ['mara'],
      },
      'p-consola': {
        texto: 'La consola está intacta. Su registro dice: "pérdida de energía externa".',
        clave: false,
        sobre: ['pipo'],
        hora: '20:15',
      },
      'p-taquilla': {
        texto: 'El taquillero confirma que doña Leonor contó boletas con él desde las 20:05 hasta las 20:40.',
        clave: false,
        sobre: ['leonor'],
        hora: '20:05',
      },
      'p-kira': {
        texto: 'Ayer Mara le preguntó a Kira dónde quedaba la caseta eléctrica, "para cargar el celular".',
        clave: false,
        sobre: ['mara', 'kira'],
      },
      'p-bruno': {
        texto: 'Bruno admite que peleó con Kira, pero dice que estaba en la pista cuando se fue la luz.',
        clave: false,
        sobre: ['bruno'],
      },
      'p-mara': {
        texto: 'Mara dice que calentó sin parar de 20:00 a 20:30 en la carpa de práctica, y que doña Leonor la vio.',
        clave: true,
        sobre: ['mara'],
      },
      'p-leonor': {
        texto: 'Doña Leonor vio a Mara calentando, pero a las 20:05 se fue a la taquilla y no la volvió a ver.',
        clave: true,
        sobre: ['mara', 'leonor'],
        hora: '20:00',
      },
      'p-pipo': {
        texto: 'Pipo dice que el corte vino de la caseta general, que queda atrás en el potrero lleno de barro.',
        clave: false,
        sobre: ['pipo'],
      },
    },
    contradicciones: [
      {
        id: 'c-mara',
        pistas: ['p-mara', 'p-leonor'],
        sospechoso: 'mara',
        deduccion: 'Doña Leonor solo vio a Mara a las 20:00. Nadie la vio entre 20:05 y 20:30: su coartada no cubre el apagón de las 20:15.',
        necesaria: false,
      },
      {
        id: 'c-polvo',
        pistas: ['p-caseta', 'p-camerino-bruno'],
        sospechoso: 'bruno',
        deduccion: 'La huella de la palanca es de polvo seco y el maquillaje de Bruno es crema grasosa: la huella no es suya.',
        necesaria: false,
      },
    ],
    motivos: [
      { id: 'contrato', texto: 'Quedarse con el contrato internacional' },
      { id: 'venganza', texto: 'Vengarse por la pelea de la tarde' },
      { id: 'ahorro', texto: 'Ahorrar en la cuenta de la luz' },
      { id: 'broma', texto: 'Hacer una broma de circo' },
    ],
    metodos: [
      { id: 'interruptor', texto: 'Bajó el interruptor general en la caseta' },
      { id: 'cables', texto: 'Cortó los cables de la consola' },
      { id: 'bombillos', texto: 'Aflojó todos los bombillos' },
      { id: 'generador', texto: 'Le quitó la gasolina al generador' },
    ],
    solucion: { culpable: 'mara', motivo: 'contrato', metodo: 'interruptor' },
    explicacion:
      'El corte vino de la caseta general: alguien bajó el interruptor y dejó una huella de polvo seco, como el ' +
      'magnesio de los acróbatas (el maquillaje de Bruno es crema). Mara dijo que doña Leonor la vio calentando ' +
      'hasta las 20:30, pero Leonor solo la vio a las 20:00. En el camerino de Mara había magnesio y zapatillas con ' +
      'barro del potrero, donde está la caseta. Quería que los cazatalentos no vieran a Kira para quedarse con el contrato.',
  },

  // ==================================================================
  {
    id: 'estadio',
    titulo: 'La copa del entretiempo',
    icono: '🏆',
    dificultad: 'Difícil',
    acciones: 6,
    intro:
      'Final del torneo regional. La copa de campeón estaba en la vitrina del vestuario, lista para la premiación. ' +
      'En el entretiempo, de 16:45 a 17:00, desapareció. La vitrina no está rota y el vigilante jura que nadie ' +
      'ha salido del estadio con un paquete. La copa sigue escondida en alguna parte... ¿quién la tomó?',
    sospechosos: [
      {
        id: 'ramiro',
        nombre: 'Ramiro',
        avatar: '🧺',
        rol: 'Utilero del equipo local',
        descripcion: 'Lleva treinta años lavando uniformes. Tiene acceso a todas las llaves.',
        coartada: 'Dice que estaba llevando bebidas a la banca.',
        interrogatorio: [
          'A las 16:40 la copa estaba en la vitrina, la limpié yo mismo. Volví a las 17:05 y ya no estaba.',
          'La llave de la vitrina cuelga en el tablero del pasillo. La ve todo el que pasa.',
        ],
        pista: 'p-ramiro',
      },
      {
        id: 'andres',
        nombre: 'Andrés',
        avatar: '🧤',
        rol: 'Capitán del equipo rival',
        descripcion: 'Está lesionado y vio el partido desde la orilla. Antes del juego dijo "esa copa va a ser nuestra".',
        coartada: 'Dice que estuvo en la cancha todo el entretiempo.',
        interrogatorio: [
          'Dije que la copa sería nuestra... ¡ganándola en la cancha, no robándola!',
          'En el entretiempo me quedé en la cancha haciendo ejercicios con el fisioterapeuta.',
        ],
        pista: 'p-andres',
      },
      {
        id: 'celeste',
        nombre: 'Celeste',
        avatar: '🎙️',
        rol: 'Periodista deportiva',
        descripcion: 'Cámara profesional con un teleobjetivo enorme y gorra que dice PRENSA. Siempre carga su trípode.',
        coartada: 'Dice que pasó todo el entretiempo en la cabina de prensa, transmitiendo en vivo.',
        interrogatorio: [
          'Estuve TODO el entretiempo en la cabina, transmitiendo en vivo. Pregunten a quien quieran.',
          '¿Robar la copa? Yo vine a contar la historia, no a ser parte de ella.',
        ],
        pista: 'p-celeste',
        rigor: {
          requiere: 'p-tapa',
          pregunta: '¿Esta tapa de lente de 77 mm es de su cámara?',
          respuesta: [
            'Eh... se me pierden las tapas todo el tiempo, pudo caer en cualquier parte.',
            'Bueno, sí, bajé un momento al pasillo a tomar unas fotos. Pero no entré al vestuario.',
          ],
          pista: 'p-celeste-rigor',
        },
      },
      {
        id: 'gloria',
        nombre: 'Doña Gloria',
        avatar: '🥟',
        rol: 'Vendedora de empanadas',
        descripcion: 'Su carrito queda justo al lado de la cabina de prensa. Oye todo lo que se habla ahí.',
        coartada: 'Dice que no se movió de su carrito.',
        interrogatorio: [
          'Yo no me muevo de aquí, mijo, si me descuido me roban las empanadas.',
          'Ayer la periodista lloraba por teléfono: si no conseguía una gran noticia esta semana, la echaban del canal.',
        ],
        pista: 'p-gloria',
      },
      {
        id: 'ferney',
        nombre: 'Ferney',
        avatar: '📋',
        rol: 'Entrenador del equipo local',
        descripcion: 'Graba todas las jugadas con una camarita de mano para analizarlas.',
        coartada: 'Dice que dio la charla técnica en el camerino de sus jugadores.',
        interrogatorio: [
          'Di la charla técnica en el camerino de mis jugadores, al otro lado del estadio. Treinta muchachos me vieron.',
          'Mi camarita es chiquita, de bolsillo. Ni tapa tiene.',
        ],
        pista: 'p-ferney',
      },
    ],
    lugares: [
      { id: 'vestuario', nombre: 'Vestuario de la copa', icono: '🚪', pista: 'p-tapa' },
      { id: 'cabina', nombre: 'Cabina de prensa', icono: '📺', pista: 'p-cabina' },
      { id: 'camaras', nombre: 'Sala de cámaras de seguridad', icono: '📹', pista: 'p-camaras' },
      { id: 'utileria', nombre: 'Utilería', icono: '👕', pista: 'p-utileria' },
      { id: 'cancha', nombre: 'Orilla de la cancha', icono: '🏟️', pista: 'p-cancha' },
      { id: 'salida', nombre: 'Puerta de salida', icono: '🚧', pista: 'p-salida' },
    ],
    pistas: {
      'p-tapa': {
        texto: 'La vitrina se abrió con su llave. En el piso hay una tapa de lente profesional de 77 mm, de las que usan los teleobjetivos grandes.',
        clave: true,
        sobre: [],
      },
      'p-cabina': {
        texto: 'Planilla de la cabina: Celeste firmó salida a las 16:47 y regreso a las 16:58. Su trípode está recostado en la pared... y su estuche largo no está.',
        clave: true,
        sobre: ['celeste'],
        hora: '16:47',
      },
      'p-camaras': {
        texto: 'Cámara del pasillo: alguien con gorra de PRENSA entra al pasillo del vestuario cargando un estuche negro largo. No se le ve la cara.',
        clave: true,
        sobre: [],
        hora: '16:50',
      },
      'p-utileria': {
        texto: 'El tablero de llaves está junto a la puerta de utilería, a la vista de todos. Cualquiera podía tomar la de la vitrina.',
        clave: false,
        sobre: ['ramiro'],
      },
      'p-cancha': {
        texto: 'El fisioterapeuta confirma que Andrés hizo ejercicios con él en la cancha todo el entretiempo.',
        clave: false,
        sobre: ['andres'],
      },
      'p-salida': {
        texto: 'El vigilante revisa cada bolso que sale. Nadie ha sacado nada grande del estadio: la copa sigue adentro.',
        clave: false,
        sobre: [],
      },
      'p-ramiro': {
        texto: 'Ramiro limpió la copa a las 16:40. A las 17:05 ya no estaba. La llave cuelga en el tablero del pasillo.',
        clave: false,
        sobre: ['ramiro'],
        hora: '16:40',
      },
      'p-andres': {
        texto: 'Andrés dice que pasó el entretiempo en la cancha con el fisioterapeuta.',
        clave: false,
        sobre: ['andres'],
      },
      'p-celeste': {
        texto: 'Celeste asegura que estuvo TODO el entretiempo en la cabina de prensa.',
        clave: true,
        sobre: ['celeste'],
      },
      'p-celeste-rigor': {
        texto: 'Celeste, nerviosa, admite que bajó al pasillo "a tomar unas fotos" durante el entretiempo.',
        clave: false,
        sobre: ['celeste'],
      },
      'p-gloria': {
        texto: 'Doña Gloria oyó a Celeste decir por teléfono que, si no conseguía una gran noticia esta semana, la echaban del canal.',
        clave: true,
        sobre: ['celeste'],
      },
      'p-ferney': {
        texto: 'Ferney dio la charla técnica al otro lado del estadio. Usa una camarita de bolsillo, sin tapa de lente.',
        clave: false,
        sobre: ['ferney'],
      },
    },
    contradicciones: [
      {
        id: 'c-cabina',
        pistas: ['p-celeste', 'p-cabina'],
        sospechoso: 'celeste',
        deduccion: 'Celeste NO estuvo todo el entretiempo en la cabina: firmó salida de 16:47 a 16:58, justo cuando desapareció la copa.',
        necesaria: true,
      },
      {
        id: 'c-tapa',
        pistas: ['p-tapa', 'p-ferney'],
        sospechoso: 'ferney',
        deduccion: 'La tapa de 77 mm es de un teleobjetivo grande: no puede ser de la camarita de bolsillo de Ferney.',
        necesaria: false,
      },
      {
        id: 'c-estuche',
        pistas: ['p-cabina', 'p-camaras'],
        sospechoso: null,
        deduccion: 'El estuche largo que falta en la cabina es como el que carga la persona de gorra de PRENSA en el video: ahí escondieron la copa.',
        necesaria: false,
      },
    ],
    motivos: [
      { id: 'noticia', texto: 'Fingir el robo para "encontrar" la copa y tener la gran noticia' },
      { id: 'rival', texto: 'Que el equipo rival no pudiera levantar la copa' },
      { id: 'vender', texto: 'Vender la copa' },
      { id: 'deuda', texto: 'Vengarse del club por una deuda' },
    ],
    metodos: [
      { id: 'estuche', texto: 'La tomó con la llave del tablero y la escondió en el estuche del trípode' },
      { id: 'uniformes', texto: 'La escondió en el carro de los uniformes sucios' },
      { id: 'ventana', texto: 'La sacó por una ventana del vestuario' },
      { id: 'carrito', texto: 'La metió en el carrito de las empanadas' },
    ],
    solucion: { culpable: 'celeste', motivo: 'noticia', metodo: 'estuche' },
    explicacion:
      'La copa desapareció entre las 16:40 y las 17:05. Celeste dijo que no salió de la cabina, pero la planilla dice ' +
      'que salió de 16:47 a 16:58, y a las 16:50 la cámara grabó a alguien con gorra de PRENSA y un estuche largo ' +
      'entrando al vestuario. Allí quedó una tapa de teleobjetivo de 77 mm (la camarita de Ferney ni tapa tiene). ' +
      'Su estuche de trípode desapareció de la cabina: ahí escondió la copa, que nunca salió del estadio. Doña Gloria ' +
      'la oyó decir que necesitaba una gran noticia: pensaba "encontrar" la copa después y tener la exclusiva.',
  },

  // ==================================================================
  {
    id: 'tren',
    titulo: 'El violín del tren nocturno',
    icono: '🚂',
    dificultad: 'Experto',
    acciones: 7,
    intro:
      'El tren nocturno de la sabana viaja entre la montaña y el mar. A las 23:00 la violinista Elena Ríos cerró con ' +
      'llave su compartimiento y fue a cenar. Cuando volvió, a la 01:00, abrió su estuche y casi se desmaya: su ' +
      'violín antiguo, de más de doscientos años, había sido cambiado por un violín de estudiante barato. ' +
      'La cerradura no está forzada y el tren solo se detuvo una vez. El violín verdadero sigue a bordo.',
    sospechosos: [
      {
        id: 'elena',
        nombre: 'Elena Ríos',
        avatar: '🎻',
        rol: 'Violinista, dueña del violín',
        descripcion: 'Famosa en todo el país. Viaja a la costa para su último concierto antes de mudarse.',
        coartada: 'Cenó en el vagón comedor de 23:10 a 00:50.',
        interrogatorio: [
          'Cerré con llave a las 23:00. Solo hay dos llaves: la mía, que nunca suelto, y la llave maestra del revisor.',
          'Voy a vender el violín para irme a vivir a Viena. Julián, mi alumno, lo sabe... se puso muy triste.',
        ],
        pista: 'p-elena',
      },
      {
        id: 'gaspar',
        nombre: 'Gaspar',
        avatar: '🎫',
        rol: 'Revisor del tren',
        descripcion: 'Gorra azul, perforadora de boletos en el cinturón. Tiene la llave maestra de todos los compartimientos.',
        coartada: 'Dice que estuvo revisando boletos y ayudando a los pasajeros toda la noche.',
        interrogatorio: [
          'Mi llave maestra no se separa de mí... bueno, casi nunca.',
          'De 23:50 a 00:20 la dejé colgada en el gancho de mi cabina mientras ayudaba a una señora con una maleta atascada en el vagón de equipaje.',
        ],
        pista: 'p-gaspar',
      },
      {
        id: 'miranda',
        nombre: 'Dra. Miranda Paz',
        avatar: '🩺',
        rol: 'Médica, viaja en el compartimiento vecino',
        descripcion: 'Duerme muy poco y hace crucigramas toda la noche.',
        coartada: 'Dice que no salió de su compartimiento.',
        interrogatorio: [
          'Durante el túnel, cuando se apagaron las luces, oí la puerta de Elena abrirse.',
          'Alguien silbaba bajito una melodía muy bonita, como de concierto. A los pocos minutos la puerta se cerró.',
        ],
        pista: 'p-miranda',
      },
      {
        id: 'julian',
        nombre: 'Julián',
        avatar: '🧑‍🎤',
        rol: 'Alumno de Elena',
        descripcion: 'Diecisiete años, pelo crespo, siempre silbando las piezas que está practicando.',
        coartada: 'Dice que se durmió a las 23:00 y no se despertó hasta la parada de Puerto Alegre.',
        interrogatorio: [
          'Estaba rendido, me dormí apenas me acosté, a las 23:00. No oí nada.',
          'Elena es la mejor profesora del mundo. No quiero que se vaya a Viena...',
        ],
        pista: 'p-julian',
        rigor: {
          requiere: 'p-comp-elena',
          pregunta: '¿Y la envoltura de chocolate del comedor que quedó en el piso de Elena?',
          respuesta: [
            '¿Chocolate? Yo... bueno, a lo mejor pasé a saludarla antes de dormirme.',
            '¡Pero ella no estaba! Solo me asomé. No toqué nada.',
          ],
          pista: 'p-julian-rigor',
        },
      },
      {
        id: 'ortega',
        nombre: 'Sr. Ortega',
        avatar: '🧐',
        rol: 'Anticuario',
        descripcion: 'Bastón con mango de plata y lupa colgada del cuello. Lleva una caja fuerte de viaje.',
        coartada: 'Cenó con Elena en el vagón comedor.',
        interrogatorio: [
          'Le ofrecí a Elena una fortuna por el violín y aceptó. Lo compro en Viena el mes entrante.',
          '¿Para qué lo iba a robar si ya es casi mío? Además, cené con ella toda la noche.',
        ],
        pista: 'p-ortega',
      },
      {
        id: 'rosa',
        nombre: 'Rosa',
        avatar: '☕',
        rol: 'Camarera del vagón comedor',
        descripcion: 'Conoce a todos los pasajeros por lo que piden. Nunca olvida una cara.',
        coartada: 'Atendió el vagón comedor toda la noche.',
        interrogatorio: [
          'Elena y el señor Ortega cenaron conmigo de 23:10 a 00:50. No se pararon de la mesa.',
          'A las 23:55 un muchacho de pelo crespo pidió un chocolate para llevar y se fue hacia la cabina del revisor.',
        ],
        pista: 'p-rosa',
      },
    ],
    lugares: [
      { id: 'comp-elena', nombre: 'Compartimiento de Elena', icono: '🚪', pista: 'p-comp-elena' },
      { id: 'cabina-revisor', nombre: 'Cabina del revisor', icono: '🔑', pista: 'p-cabina' },
      { id: 'caja', nombre: 'Caja del vagón comedor', icono: '🧾', pista: 'p-caja' },
      { id: 'comp-julian', nombre: 'Compartimiento de Julián', icono: '🛏️', pista: 'p-comp-julian' },
      { id: 'equipaje', nombre: 'Vagón de equipaje', icono: '🧳', pista: 'p-equipaje' },
      { id: 'maquinista', nombre: 'Cabina del maquinista', icono: '🚦', pista: 'p-maquinista' },
      { id: 'comp-miranda', nombre: 'Compartimiento de la doctora', icono: '🧩', pista: 'p-comp-miranda' },
    ],
    pistas: {
      'p-comp-elena': {
        texto: 'La cerradura se abrió con llave, sin forzarla. En el estuche hay un violín de estudiante con el número de serie 0571 grabado. En el piso, una envoltura de chocolate del vagón comedor.',
        clave: true,
        sobre: [],
      },
      'p-cabina': {
        texto: 'En el gancho de la llave maestra quedaron unas manchitas pegajosas de chocolate.',
        clave: false,
        sobre: ['gaspar'],
      },
      'p-caja': {
        texto: 'La caja registradora muestra que esta noche se vendió un solo chocolate para llevar.',
        clave: false,
        sobre: [],
        hora: '23:55',
      },
      'p-comp-julian': {
        texto: 'El estuche de violín de Julián está vacío. En la tapa, la etiqueta de la tienda: "Violín de estudiante 4/4, serie 0571".',
        clave: false,
        sobre: ['julian'],
      },
      'p-equipaje': {
        texto: 'La caja fuerte de viaje del Sr. Ortega está vacía (dice que es para el violín que comprará). Una señora confirma que el revisor la ayudó aquí con su maleta de 23:50 a 00:20.',
        clave: false,
        sobre: ['ortega', 'gaspar'],
      },
      'p-maquinista': {
        texto: 'Registro del tren: túnel de 00:08 a 00:13 con todas las luces apagadas. Única parada en Puerto Alegre de 00:30 a 00:40; nadie se bajó.',
        clave: false,
        sobre: [],
        hora: '00:08',
        dia: 1,
      },
      'p-comp-miranda': {
        texto: 'Crucigramas, un termo de aromática y unas pastillas para el mareo. Nada que ver con violines.',
        clave: false,
        sobre: ['miranda'],
      },
      'p-elena': {
        texto: 'Solo hay dos llaves del compartimiento: la de Elena y la maestra del revisor. Elena venderá el violín para irse a Viena, y su alumno Julián lo sabe y está muy triste.',
        clave: true,
        sobre: ['elena', 'gaspar', 'julian'],
      },
      'p-gaspar': {
        texto: 'Gaspar dejó la llave maestra colgada en el gancho de su cabina, sin vigilancia, de 23:50 a 00:20.',
        clave: true,
        sobre: ['gaspar'],
        hora: '23:50',
      },
      'p-miranda': {
        texto: 'Durante el túnel la doctora oyó abrirse la puerta de Elena y a alguien silbar bajito una melodía de concierto.',
        clave: false,
        sobre: [],
        hora: '00:10',
        dia: 1,
      },
      'p-julian': {
        texto: 'Julián dice que se durmió a las 23:00 y no se despertó hasta la parada de Puerto Alegre.',
        clave: true,
        sobre: ['julian'],
        hora: '23:00',
      },
      'p-julian-rigor': {
        texto: 'Julián se pone rojo: admite que "pasó a saludar" al compartimiento de Elena esa noche.',
        clave: false,
        sobre: ['julian'],
      },
      'p-ortega': {
        texto: 'El Sr. Ortega ya acordó comprar el violín en Viena y dice que cenó con Elena toda la noche.',
        clave: false,
        sobre: ['ortega'],
      },
      'p-rosa': {
        texto: 'Rosa confirma que Elena y Ortega cenaron de 23:10 a 00:50. Además, un muchacho de pelo crespo compró un chocolate para llevar y se fue hacia la cabina del revisor.',
        clave: true,
        sobre: ['elena', 'ortega'],
        hora: '23:55',
      },
    },
    contradicciones: [
      {
        id: 'c-dormido',
        pistas: ['p-julian', 'p-rosa'],
        sospechoso: 'julian',
        deduccion: 'Julián no estaba dormido: a las 23:55 compró chocolate y fue hacia la cabina del revisor, justo cuando la llave maestra estaba colgada sin vigilancia.',
        necesaria: true,
      },
      {
        id: 'c-serie',
        pistas: ['p-comp-elena', 'p-comp-julian'],
        sospechoso: 'julian',
        deduccion: 'El violín barato que dejaron en el estuche de Elena (serie 0571) es el violín de Julián.',
        necesaria: false,
      },
      {
        id: 'c-tunel',
        pistas: ['p-miranda', 'p-maquinista'],
        sospechoso: null,
        deduccion: 'La puerta de Elena se abrió durante el túnel (00:08 a 00:13), a oscuras. Y como nadie se bajó en Puerto Alegre, el violín sigue en el tren.',
        necesaria: false,
      },
    ],
    motivos: [
      { id: 'viena', texto: 'Que su profesora no vendiera el violín ni se fuera a Viena' },
      { id: 'reventa', texto: 'Revendérselo más caro a otro coleccionista' },
      { id: 'nota', texto: 'Vengarse por una mala calificación' },
      { id: 'concurso', texto: 'Tocarlo en un concurso importante' },
      { id: 'seguro', texto: 'Cobrar el seguro del violín' },
    ],
    metodos: [
      { id: 'llave', texto: 'Tomó la llave maestra del gancho y cambió el violín por el suyo en el túnel' },
      { id: 'forzar', texto: 'Forzó la cerradura durante la cena' },
      { id: 'parada', texto: 'Lo bajó del tren en la parada de Puerto Alegre' },
      { id: 'comedor', texto: 'Lo cambió en el vagón comedor sin que Elena se diera cuenta' },
    ],
    solucion: { culpable: 'julian', motivo: 'viena', metodo: 'llave' },
    explicacion:
      'La puerta se abrió con llave y Elena nunca soltó la suya, así que se usó la llave maestra. Gaspar la dejó ' +
      'colgada de 23:50 a 00:20 (la señora del equipaje lo confirma). Julián dijo que dormía desde las 23:00, pero a ' +
      'las 23:55 Rosa lo vio comprar el único chocolate de la noche e ir hacia la cabina del revisor; quedaron manchas ' +
      'de chocolate en el gancho y la envoltura en el piso de Elena. En el túnel, a oscuras, la doctora oyó a alguien ' +
      'silbar, como hace siempre Julián. Dejó su propio violín (serie 0571) en el estuche y escondió el de Elena en el ' +
      'tren. No quería que su profesora vendiera el violín y se fuera a Viena.',
  },

  // ==================================================================
  {
    id: 'hotel',
    titulo: 'Huellas en la nieve del páramo',
    icono: '🏔️',
    dificultad: 'Experto',
    acciones: 8,
    intro:
      'En el hotel de montaña Los Frailejones, en lo alto del páramo, se guarda el mapa del explorador Fermín Ospina, ' +
      'de 1890. Esta noche nevó, algo rarísimo, y nadie pudo bajar al pueblo. A las 23:00 la dueña encontró la vitrina ' +
      'del salón vacía y la ventana entreabierta. Afuera, la nieve guarda huellas... si sabes leerlas.',
    sospechosos: [
      {
        id: 'ines',
        nombre: 'Doña Inés',
        avatar: '🏨',
        rol: 'Dueña del hotel',
        descripcion: 'Heredó el hotel y el mapa de su abuelo. El hotel no anda bien de plata.',
        coartada: 'Dice que jugó cartas en la cocina toda la noche.',
        interrogatorio: [
          'Ese mapa es lo único que me queda de mi abuelo. Ayer la señora Beltrán me ofreció comprarlo y le dije que no.',
          'Jugamos cartas en la cocina con Lina y la señora Beltrán de 21:30 a 23:00.',
        ],
        pista: 'p-ines',
      },
      {
        id: 'aurelio',
        nombre: 'Profesor Aurelio',
        avatar: '🔭',
        rol: 'Astrónomo, huésped',
        descripcion: 'Bufanda larguísima y libreta llena de números. Usa el telescopio del observatorio del hotel.',
        coartada: 'Dice que estuvo en el observatorio de 21:30 a 22:30, observando sin parar.',
        interrogatorio: [
          'Estuve en el observatorio de 21:30 a 22:30, mirando el cielo sin parar. Las noches despejadas después de una nevada son únicas.',
          'Estoy a punto del descubrimiento de mi vida: un meteorito que nadie ha encontrado.',
        ],
        pista: 'p-aurelio',
        rigor: {
          requiere: 'p-salon',
          pregunta: '¿Por qué hay grasa negra de engranajes de telescopio en el tapete del salón?',
          respuesta: [
            '¿Grasa? Pues... la grasa de engranajes la usa cualquier máquina, ¿no?',
            'Bueno, quizás pasé por el salón a mirar el mapa. ¡Mirar no es delito!',
          ],
          pista: 'p-aurelio-rigor',
        },
      },
      {
        id: 'lina',
        nombre: 'Lina',
        avatar: '👩‍🍳',
        rol: 'Cocinera',
        descripcion: 'Prepara el mejor chocolate con queso del páramo. Mira el reloj cada cinco minutos.',
        coartada: 'Jugó cartas en la cocina.',
        interrogatorio: [
          'Empezó a nevar a las 21:00 en punto y paró a las 22:00 en punto. Lo sé porque tenía la torta en el horno.',
          'Después de las diez no cayó ni un copito más.',
        ],
        pista: 'p-lina',
      },
      {
        id: 'matias',
        nombre: 'Matías',
        avatar: '🥾',
        rol: 'Guía de montaña',
        descripcion: 'Botas enormes con suela de cocada. Sale a revisar el generador cuando hace frío.',
        coartada: 'Dice que salió a revisar el generador y volvió antes de que parara de nevar.',
        interrogatorio: [
          'Salí a revisar el generador de 21:15 a 21:40, todavía nevaba duro.',
          'Después me quedé en mi cuarto secando las botas al lado de la chimenea.',
        ],
        pista: 'p-matias',
      },
      {
        id: 'beltran',
        nombre: 'Sra. Beltrán',
        avatar: '🗺️',
        rol: 'Coleccionista de mapas',
        descripcion: 'Viajó desde lejos solo para ver el mapa de Fermín Ospina. Quería comprarlo a toda costa.',
        coartada: 'Jugó cartas en la cocina.',
        interrogatorio: [
          '¡Claro que quería el mapa! Pero se compra, no se roba.',
          'Ese mapa marca el lugar donde cayó un meteorito en 1890. Cualquier astrónomo daría lo que fuera por encontrarlo primero.',
        ],
        pista: 'p-beltran',
      },
      {
        id: 'kevin',
        nombre: 'Kevin',
        avatar: '🎮',
        rol: 'Sobrino de doña Inés',
        descripcion: 'Catorce años. No se quita los audífonos ni para comer.',
        coartada: 'Dice que estuvo jugando videojuegos en su cuarto.',
        interrogatorio: [
          'A las 22:00 bajé por agua y pasé por el salón. El mapa estaba en la vitrina, seguro.',
          'Después me encerré a jugar con los audífonos puestos. No oí nada.',
        ],
        pista: 'p-kevin',
      },
    ],
    lugares: [
      { id: 'salon', nombre: 'Salón del mapa', icono: '🖼️', pista: 'p-salon' },
      { id: 'jardin', nombre: 'Nieve bajo la ventana', icono: '❄️', pista: 'p-jardin' },
      { id: 'observatorio', nombre: 'Observatorio', icono: '🔭', pista: 'p-observatorio' },
      { id: 'cocina', nombre: 'Cocina', icono: '🃏', pista: 'p-cocina' },
      { id: 'recepcion', nombre: 'Recepción', icono: '🛎️', pista: 'p-recepcion' },
      { id: 'cuarto-beltran', nombre: 'Cuarto de la Sra. Beltrán', icono: '🧳', pista: 'p-cuarto-beltran' },
      { id: 'generador', nombre: 'Caseta del generador', icono: '⚙️', pista: 'p-generador' },
    ],
    pistas: {
      'p-salon': {
        texto: 'La vitrina está abierta y la ventana entreabierta. En el tapete hay una mancha de grasa negra, de la que se usa en los engranajes de los telescopios.',
        clave: true,
        sobre: [],
      },
      'p-jardin': {
        texto: 'Bajo la ventana del salón salen unas huellas NÍTIDAS, sin un solo copo encima, que van directo al observatorio. Otras huellas de cocada, casi tapadas por la nieve, van hacia el generador.',
        clave: true,
        sobre: [],
      },
      'p-observatorio': {
        texto: 'El registro automático del telescopio dice: apagado de 22:05 a 22:40. Junto al telescopio, su estuche alargado está cerrado con candado.',
        clave: true,
        sobre: ['aurelio'],
        hora: '22:05',
      },
      'p-cocina': {
        texto: 'Libreta de puntajes: Inés, Lina y la Sra. Beltrán jugaron cartas de 21:30 a 23:00 sin pararse de la mesa.',
        clave: false,
        sobre: ['ines', 'lina', 'beltran'],
        hora: '21:30',
      },
      'p-recepcion': {
        texto: 'Cartas del banco: el hotel debe dinero. Pero el mapa no tiene seguro: si se pierde, doña Inés no recibe ni un peso.',
        clave: false,
        sobre: ['ines'],
      },
      'p-cuarto-beltran': {
        texto: 'Catálogos de mapas antiguos y una oferta escrita por el mapa de Fermín Ospina, que doña Inés rechazó.',
        clave: false,
        sobre: ['beltran'],
      },
      'p-generador': {
        texto: 'Bitácora del generador: "Revisión de 21:15 a 21:40 — Matías". En la nieve quedaron marcas de botas de cocada.',
        clave: false,
        sobre: ['matias'],
        hora: '21:15',
      },
      'p-ines': {
        texto: 'Doña Inés rechazó ayer la oferta de la Sra. Beltrán. Dice que jugó cartas en la cocina toda la noche.',
        clave: false,
        sobre: ['ines', 'beltran'],
      },
      'p-aurelio': {
        texto: 'El profesor Aurelio dice que observó sin parar en el observatorio de 21:30 a 22:30, y que está por descubrir un meteorito.',
        clave: true,
        sobre: ['aurelio'],
      },
      'p-aurelio-rigor': {
        texto: 'Aurelio no sabe explicar la grasa y termina admitiendo que "pasó por el salón a mirar el mapa".',
        clave: false,
        sobre: ['aurelio'],
      },
      'p-lina': {
        texto: 'Según Lina, nevó desde las 21:00 hasta las 22:00 en punto. Después no cayó ni un copo.',
        clave: true,
        sobre: [],
        hora: '22:00',
      },
      'p-matias': {
        texto: 'Matías salió al generador de 21:15 a 21:40, mientras todavía nevaba, y después se quedó en su cuarto.',
        clave: false,
        sobre: ['matias'],
        hora: '21:40',
      },
      'p-beltran': {
        texto: 'La Sra. Beltrán explica que el mapa marca dónde cayó un meteorito en 1890: un tesoro para cualquier astrónomo.',
        clave: true,
        sobre: ['beltran'],
      },
      'p-kevin': {
        texto: 'Kevin vio el mapa en su vitrina cuando pasó por el salón.',
        clave: false,
        sobre: ['kevin'],
        hora: '22:00',
      },
    },
    contradicciones: [
      {
        id: 'c-telescopio',
        pistas: ['p-aurelio', 'p-observatorio'],
        sospechoso: 'aurelio',
        deduccion: 'Aurelio dice que observó sin parar hasta las 22:30, pero el telescopio estuvo apagado de 22:05 a 22:40. Su coartada es falsa.',
        necesaria: true,
      },
      {
        id: 'c-nieve',
        pistas: ['p-jardin', 'p-lina'],
        sospechoso: null,
        deduccion: 'Las huellas nítidas hacia el observatorio se hicieron DESPUÉS de las 22:00, cuando ya no nevaba. Las de cocada, tapadas por la nieve, son de antes.',
        necesaria: true,
      },
      {
        id: 'c-generador',
        pistas: ['p-jardin', 'p-generador'],
        sospechoso: 'matias',
        deduccion: 'Las huellas de cocada casi tapadas son de Matías, que salió al generador mientras nevaba. No son las del ladrón.',
        necesaria: false,
      },
    ],
    motivos: [
      { id: 'meteorito', texto: 'Encontrar primero el meteorito que marca el mapa' },
      { id: 'coleccion', texto: 'Tenerlo en su colección privada' },
      { id: 'seguro', texto: 'Cobrar el seguro del mapa' },
      { id: 'venta', texto: 'Vendérselo a la coleccionista' },
    ],
    metodos: [
      { id: 'telescopio', texto: 'Lo sacó por la ventana y lo escondió en el estuche del telescopio' },
      { id: 'chimenea', texto: 'Lo escondió detrás de la chimenea del salón' },
      { id: 'copia', texto: 'Lo cambió por una copia durante la cena' },
      { id: 'maleta', texto: 'Lo guardó en su maleta durante el juego de cartas' },
    ],
    solucion: { culpable: 'aurelio', motivo: 'meteorito', metodo: 'telescopio' },
    explicacion:
      'Kevin vio el mapa a las 22:00. Lina sabe que la nieve paró a las 22:00 en punto, así que las huellas nítidas ' +
      'que van de la ventana al observatorio se hicieron después (las de cocada, tapadas, son de Matías, que salió ' +
      'antes). Inés, Lina y la Sra. Beltrán jugaron cartas hasta las 23:00. Aurelio dijo que observó sin parar, pero ' +
      'el telescopio estuvo apagado de 22:05 a 22:40, y en el salón quedó grasa de engranajes de telescopio. El mapa ' +
      'marca dónde cayó un meteorito: lo escondió en el estuche del telescopio para encontrarlo primero.',
  },

  // ==================================================================
  {
    id: 'television',
    titulo: 'Respuestas filtradas en vivo',
    icono: '📺',
    dificultad: 'Maestro',
    acciones: 8,
    intro:
      'En el concurso de televisión "¿Quién sabe más?", las preguntas de la ronda final van en un sobre con sello ' +
      'dorado que nadie abre hasta el aire. Esta noche, la concursante Andrea respondió las cinco preguntas finales ' +
      'sin dudar un segundo y ganó el premio mayor. Al revisar el sobre, el sello estaba despegado y vuelto a pegar. ' +
      'Alguien abrió el sobre antes del programa y le pasó las respuestas.',
    sospechosos: [
      {
        id: 'leo',
        nombre: 'Leo',
        avatar: '🎤',
        rol: 'Presentador',
        descripcion: 'Sonrisa de comercial y peinado perfecto. El sobre se queda en su camerino antes del programa.',
        coartada: 'Dice que ensayó en el escenario de 19:00 a 19:45.',
        interrogatorio: [
          'El sobre estaba en la mesa de mi camerino. Yo ensayé en el escenario toda esa hora, no me bajé ni un minuto.',
          'Cuando volví a las 19:45, el camerino olía a ropa recién planchada. Raro, ahí no se plancha.',
        ],
        pista: 'p-leo',
      },
      {
        id: 'dana',
        nombre: 'Dana',
        avatar: '🎬',
        rol: 'Productora',
        descripcion: 'Audífono, tabla de apuntes y tres celulares. Vive pendiente del rating.',
        coartada: 'Dice que estuvo en la cabina de control.',
        interrogatorio: [
          'Saqué el sobre de la caja fuerte a las 19:00 y lo dejé en el camerino de Leo, como siempre.',
          'Claro que quiero un buen rating... ¡pero con un final honesto! Este escándalo nos puede cerrar el programa.',
        ],
        pista: 'p-dana',
      },
      {
        id: 'andrea',
        nombre: 'Andrea',
        avatar: '🙋‍♀️',
        rol: 'Concursante ganadora',
        descripcion: 'Estudiante de enfermería. Dice que entró al concurso por su familia.',
        coartada: 'Dice que estuvo en el camerino de concursantes.',
        interrogatorio: [
          'Mi prima Yuli trabaja aquí y me ayudó a conseguir el cupo en el programa.',
          'Necesitamos el premio para la operación de mi abuela... pero yo no abrí ningún sobre, ¡lo juro!',
        ],
        pista: 'p-andrea',
        rigor: {
          requiere: 'p-concursantes',
          pregunta: '¿Quién le dio la polvera que tenía las respuestas?',
          respuesta: [
            'En la pausa comercial Yuli me la prestó y me dijo: "mírate bien en el espejito".',
            'Cuando la abrí vi el papelito... y no fui capaz de no mirarlo. Perdón.',
          ],
          pista: 'p-andrea-rigor',
        },
      },
      {
        id: 'felipe',
        nombre: 'Felipe',
        avatar: '🤓',
        rol: 'Concursante que perdió',
        descripcion: 'Se sabe la enciclopedia de memoria. Está furioso por haber perdido.',
        coartada: 'Dice que pasó la tarde repasando en la cafetería.',
        interrogatorio: [
          '¡Andrea hizo trampa! En la pausa comercial se encerró a retocarse con una polvera rarísima.',
          'Yo estuve repasando en la cafetería desde las seis y media. Ni me acerqué a los camerinos.',
        ],
        pista: 'p-felipe',
      },
      {
        id: 'yuli',
        nombre: 'Yuli',
        avatar: '💄',
        rol: 'Maquilladora',
        descripcion: 'Maquilla a todo el elenco. Su maletín está lleno de brochas, polveras y una plancha de vapor de viaje.',
        coartada: 'Dice que a las 19:15 estaba maquillando a Leo en su camerino.',
        interrogatorio: [
          'A las 19:15 fui al camerino de Leo a maquillarlo, como todos los días.',
          'Después estuve en vestuario planchando los vestidos de las modelos.',
        ],
        pista: 'p-yuli',
      },
      {
        id: 'tito',
        nombre: 'Tito',
        avatar: '🔨',
        rol: 'Escenógrafo',
        descripcion: 'Tiene llaves de todos los cuartos del estudio y una memoria de elefante para los horarios.',
        coartada: 'Dice que estuvo armando la escenografía.',
        interrogatorio: [
          'Yo firmé el plan de ensayo con el director. Lo que diga ese papel, así fue.',
          'A las 19:30 la plancha de vapor de vestuario estaba prendida, pero no había ni un vestido colgado para planchar.',
        ],
        pista: 'p-tito',
      },
    ],
    lugares: [
      { id: 'sobre', nombre: 'El sobre dorado', icono: '✉️', pista: 'p-sobre' },
      { id: 'camerino-leo', nombre: 'Camerino del presentador', icono: '⭐', pista: 'p-camerino-leo' },
      { id: 'vestuario', nombre: 'Cuarto de vestuario', icono: '👗', pista: 'p-vestuario' },
      { id: 'concursantes', nombre: 'Camerino de concursantes', icono: '🪞', pista: 'p-concursantes' },
      { id: 'escenario', nombre: 'Escenario', icono: '🎙️', pista: 'p-escenario' },
      { id: 'control', nombre: 'Cabina de control', icono: '🎚️', pista: 'p-control' },
      { id: 'cafeteria', nombre: 'Cafetería', icono: '☕', pista: 'p-cafeteria' },
    ],
    pistas: {
      'p-sobre': {
        texto: 'El sello dorado se despegó y se volvió a pegar. El papel está ondulado por la humedad, como si lo hubieran abierto con vapor.',
        clave: true,
        sobre: [],
      },
      'p-camerino-leo': {
        texto: 'En la mesa donde estaba el sobre hay una marca redonda de agua seca, y un pelito de brocha de maquillaje.',
        clave: false,
        sobre: [],
      },
      'p-vestuario': {
        texto: 'En la base de la plancha de vapor de viaje quedaron restos del pegante dorado del sello. Esa plancha es la del maletín de Yuli.',
        clave: true,
        sobre: ['yuli'],
      },
      'p-concursantes': {
        texto: 'En la polvera que usó Andrea en la pausa hay un papelito con cinco respuestas en letra diminuta. La polvera tiene grabado "Yuli — Maquillaje".',
        clave: true,
        sobre: ['andrea', 'yuli'],
      },
      'p-escenario': {
        texto: 'El plan de ensayo dice que Leo estuvo en el escenario de 19:00 a 19:45 sin bajarse. Lo firman el director y el escenógrafo.',
        clave: true,
        sobre: ['leo'],
        hora: '19:00',
      },
      'p-control': {
        texto: 'Las cámaras del pasillo de camerinos estaban apagadas de 19:00 a 20:00 por un mantenimiento programado hace un mes.',
        clave: false,
        sobre: ['dana'],
        hora: '19:00',
      },
      'p-cafeteria': {
        texto: 'El mesero confirma que Felipe estuvo repasando con su enciclopedia de 18:30 a 19:50, sin levantarse.',
        clave: false,
        sobre: ['felipe'],
        hora: '18:30',
      },
      'p-leo': {
        texto: 'Leo dejó el sobre en su camerino mientras ensayaba. Al volver, el camerino olía a ropa planchada.',
        clave: false,
        sobre: ['leo'],
        hora: '19:45',
      },
      'p-dana': {
        texto: 'Dana sacó el sobre de la caja fuerte y lo dejó en el camerino de Leo, como siempre. Teme que el escándalo cierre el programa.',
        clave: false,
        sobre: ['dana'],
        hora: '19:00',
      },
      'p-andrea': {
        texto: 'Andrea cuenta que su prima Yuli le consiguió el cupo, y que necesitan el premio para la operación de su abuela.',
        clave: true,
        sobre: ['andrea', 'yuli'],
      },
      'p-andrea-rigor': {
        texto: 'Andrea confiesa que Yuli le prestó la polvera en la pausa y le dijo "mírate bien en el espejito".',
        clave: false,
        sobre: ['andrea', 'yuli'],
      },
      'p-felipe': {
        texto: 'Felipe acusa a Andrea de retocarse con una polvera rarísima en la pausa comercial, y dice que él no se movió de la cafetería.',
        clave: false,
        sobre: ['felipe', 'andrea'],
      },
      'p-yuli': {
        texto: 'Yuli dice que fue al camerino de Leo a maquillarlo, y que luego planchó vestidos en vestuario.',
        clave: true,
        sobre: ['yuli'],
        hora: '19:15',
      },
      'p-tito': {
        texto: 'Tito vio la plancha de vapor de vestuario prendida, sin ningún vestido para planchar.',
        clave: false,
        sobre: [],
        hora: '19:30',
      },
    },
    contradicciones: [
      {
        id: 'c-maquillaje',
        pistas: ['p-yuli', 'p-escenario'],
        sospechoso: 'yuli',
        deduccion: 'Yuli dice que a las 19:15 maquilló a Leo en su camerino, pero Leo estaba en el escenario de 19:00 a 19:45. Entró al camerino cuando él NO estaba.',
        necesaria: true,
      },
      {
        id: 'c-plancha',
        pistas: ['p-sobre', 'p-vestuario'],
        sospechoso: 'yuli',
        deduccion: 'El sobre se abrió con vapor, y el pegante dorado quedó en la plancha de viaje de Yuli.',
        necesaria: true,
      },
      {
        id: 'c-felipe',
        pistas: ['p-felipe', 'p-cafeteria'],
        sospechoso: 'felipe',
        deduccion: 'Felipe no pudo abrir el sobre: estuvo en la cafetería de 18:30 a 19:50, todo el tiempo que el sobre estuvo en el camerino.',
        necesaria: false,
      },
    ],
    motivos: [
      { id: 'abuela', texto: 'Que su prima ganara para pagar la operación de la abuela' },
      { id: 'rating', texto: 'Un final espectacular para subir el rating' },
      { id: 'venganza', texto: 'Vengarse del programa por perder' },
      { id: 'apuesta', texto: 'Ganar una apuesta sobre quién ganaría' },
    ],
    metodos: [
      { id: 'vapor', texto: 'Abrió el sobre con vapor y escondió las respuestas en una polvera' },
      { id: 'audifono', texto: 'Le dictó las respuestas por un audífono escondido' },
      { id: 'copia', texto: 'Hizo una copia de las preguntas en la caja fuerte' },
      { id: 'pantalla', texto: 'Puso las respuestas en la pantalla del público' },
    ],
    solucion: { culpable: 'yuli', motivo: 'abuela', metodo: 'vapor' },
    explicacion:
      'El sobre estuvo en el camerino de Leo de 19:00 a 19:45, mientras él ensayaba en el escenario. Yuli dijo que a ' +
      'las 19:15 lo maquilló allí... pero Leo no estaba. El sello se abrió con vapor: el pegante dorado quedó en la ' +
      'plancha de viaje de Yuli, que Tito vio prendida sin ropa que planchar, y Leo encontró el camerino oliendo a ' +
      'planchado. Las respuestas aparecieron en una polvera grabada con el nombre de Yuli, que se la prestó a su ' +
      'prima Andrea en la pausa. Lo hizo para que ganara el premio y pagaran la operación de la abuela.',
  },

  // ==================================================================
  {
    id: 'cafe',
    titulo: 'La cosecha de oro',
    icono: '☕',
    dificultad: 'Maestro',
    acciones: 8,
    intro:
      'En una finca cafetera del Quindío, don Abelardo preparó su mejor café en años: el "Lote Esperanza", un costal ' +
      'de 50 kilos para el concurso nacional en Salento. Lo selló anoche con su sello número 777. Esta mañana, en la ' +
      'mesa de cata, la jueza probó el café y frunció la cara: era café corriente de supermercado. ' +
      'El costal dice 777... pero algo no cuadra. ¿Dónde quedó el café de oro?',
    sospechosos: [
      {
        id: 'abelardo',
        nombre: 'Don Abelardo',
        avatar: '👨‍🌾',
        rol: 'Dueño de la finca',
        descripcion: 'Sombrero aguadeño y carriel. Cuarenta años sembrando café.',
        coartada: 'Dice que cerró la bodega a las 20:00 y se acostó.',
        interrogatorio: [
          'A las 20:00 sellé el costal con mi sello impreso 777 y cerré la bodega con candado.',
          'Hace una semana el ingeniero Duarte me ofreció comprarme el Lote Esperanza antes del concurso. Le dije que no.',
        ],
        pista: 'p-abelardo',
      },
      {
        id: 'chepe',
        nombre: 'Don Chepe',
        avatar: '🚙',
        rol: 'Conductor del Willys',
        descripcion: 'Maneja el Willys de la vereda desde hace treinta años. Conoce cada curva de memoria.',
        coartada: 'Dice que llevó el costal directo al concurso.',
        interrogatorio: [
          'A las 5:00 cargué el costal en el Willys y arranqué para Salento.',
          'A las 5:40 paré en la fonda La Ceiba por un tinto, quince minuticos. El Willys quedó abierto, como siempre.',
        ],
        pista: 'p-chepe',
      },
      {
        id: 'yesid',
        nombre: 'Yesid',
        avatar: '🧺',
        rol: 'Mayordomo de la finca',
        descripcion: 'Tiene la otra llave de la bodega. Botas de caucho siempre embarradas.',
        coartada: 'Dice que estuvo en la novena de la vereda.',
        interrogatorio: [
          'Tengo la otra llave de la bodega, sí. Pero anoche estuve en la novena hasta las 23:00. Me vio toda la vereda.',
          'Aquí todos andamos con botas de caucho embarradas, doctor. Eso no prueba nada.',
        ],
        pista: 'p-yesid',
      },
      {
        id: 'marcela',
        nombre: 'Marcela',
        avatar: '👩‍🦱',
        rol: 'Caficultora de la finca vecina',
        descripcion: 'Su café quedó de segundo el año pasado, detrás del de Abelardo. Compite este año también.',
        coartada: 'Dice que solo fue a la finca de Abelardo a devolver una lámpara.',
        interrogatorio: [
          'Anoche, durante el apagón de las 22:00, fui a devolverle una lámpara a Abelardo. Se la dejé en el beneficiadero.',
          '¡Mi café es mejor que el de él sin hacer trampas!',
        ],
        pista: 'p-marcela',
      },
      {
        id: 'natalia',
        nombre: 'Natalia',
        avatar: '👩‍🎓',
        rol: 'Nieta de Abelardo, barista',
        descripcion: 'Estudia en Bogotá y ganó un campeonato de barismo. Tiene un olfato increíble.',
        coartada: 'Llegó a Salento directo desde Bogotá esta mañana.',
        interrogatorio: [
          'Ese café de la mesa de cata es corriente, tostado ayer. El Lote Esperanza es grano verde, sin tostar, y grandote.',
          'Un lote ganador del concurso se vende diez veces más caro en el exterior. Hay gente que haría cualquier cosa.',
        ],
        pista: 'p-natalia',
      },
      {
        id: 'duarte',
        nombre: 'Ingeniero Duarte',
        avatar: '👔',
        rol: 'Comprador de una exportadora',
        descripcion: 'Corbata, casco de moto y unas botas blancas de caucho recién compradas, sin un raspón.',
        coartada: 'Dice que durmió en el hotel de Salento hasta las 7:00.',
        interrogatorio: [
          'Le ofrecí a Abelardo un buen precio por su lote. Es negocio, nada más.',
          'Anoche me acosté temprano en el hotel de Salento y me desperté a las 7:00.',
        ],
        pista: 'p-duarte',
        rigor: {
          requiere: 'p-moto',
          pregunta: '¿Por qué hay granos verdes del Lote Esperanza en la parrilla de su moto?',
          respuesta: [
            'Granos de café hay en todas partes en esta región, detective.',
            'Bueno... sí, madrugué a dar una vuelta en la moto. Me gusta ver el amanecer.',
          ],
          pista: 'p-duarte-rigor',
        },
      },
    ],
    lugares: [
      { id: 'bodega', nombre: 'Bodega de la finca', icono: '🏚️', pista: 'p-bodega' },
      { id: 'beneficiadero', nombre: 'Beneficiadero', icono: '💧', pista: 'p-beneficiadero' },
      { id: 'willys', nombre: 'Platón del Willys', icono: '🚙', pista: 'p-willys' },
      { id: 'fonda', nombre: 'Fonda La Ceiba', icono: '🏠', pista: 'p-fonda' },
      { id: 'cata', nombre: 'Mesa de cata', icono: '🥄', pista: 'p-cata' },
      { id: 'moto', nombre: 'Moto alquilada del hotel', icono: '🏍️', pista: 'p-moto' },
      { id: 'finca-marcela', nombre: 'Finca de Marcela', icono: '🌿', pista: 'p-finca-marcela' },
    ],
    pistas: {
      'p-bodega': {
        texto: 'El candado no fue forzado. El costal ya no está (Chepe se lo llevó a las 5:00). Hay huellas de botas de caucho por todas partes.',
        clave: false,
        sobre: [],
      },
      'p-beneficiadero': {
        texto: 'Una lámpara con una nota: "Gracias, vecino — Marcela". Nada más se movió de su sitio.',
        clave: false,
        sobre: ['marcela'],
      },
      'p-willys': {
        texto: 'En el platón del Willys hay granos de café corriente YA TOSTADO, regados como de un costal mal amarrado.',
        clave: false,
        sobre: ['chepe'],
      },
      'p-fonda': {
        texto: 'La dueña de la fonda sirvió dos tintos: uno a don Chepe y otro a un señor de corbata y botas blancas nuevas que llegó en moto y se fue antes que Chepe.',
        clave: true,
        sobre: ['chepe'],
        hora: '05:40',
        dia: 1,
      },
      'p-cata': {
        texto: 'El sello del costal dice 777, pero escrito a mano con marcador. Los sellos de la finca de Abelardo son impresos.',
        clave: true,
        sobre: [],
        hora: '06:30',
        dia: 1,
      },
      'p-moto': {
        texto: 'Registro del hotel: la moto de Duarte salió a las 5:00 y volvió a las 6:20. En la parrilla hay restos de cabuya de costal y granos verdes grandes, como los del Lote Esperanza.',
        clave: true,
        sobre: ['duarte'],
        hora: '05:00',
        dia: 1,
      },
      'p-finca-marcela': {
        texto: 'Los costales de Marcela para el concurso llevan el sello de su finca, "La Palma". Ninguno dice 777.',
        clave: false,
        sobre: ['marcela'],
      },
      'p-abelardo': {
        texto: 'Abelardo selló el costal con su sello IMPRESO 777 y cerró la bodega. Hace una semana rechazó la oferta del ingeniero Duarte.',
        clave: true,
        sobre: ['abelardo', 'duarte'],
        hora: '20:00',
      },
      'p-chepe': {
        texto: 'Chepe paró en la fonda La Ceiba quince minutos. El Willys quedó abierto con el costal en el platón.',
        clave: true,
        sobre: ['chepe'],
        hora: '05:40',
        dia: 1,
      },
      'p-yesid': {
        texto: 'Yesid tiene la otra llave de la bodega, pero estuvo en la novena de la vereda hasta las 23:00, delante de todos.',
        clave: false,
        sobre: ['yesid'],
      },
      'p-marcela': {
        texto: 'Marcela fue a devolver una lámpara durante el apagón y la dejó en el beneficiadero.',
        clave: false,
        sobre: ['marcela'],
        hora: '22:00',
      },
      'p-natalia': {
        texto: 'Natalia huele que el café de la mesa de cata es corriente y tostado ayer. El Lote Esperanza es grano verde y grande. Un lote ganador vale diez veces más en el exterior.',
        clave: true,
        sobre: [],
      },
      'p-duarte': {
        texto: 'El ingeniero Duarte asegura que durmió en el hotel de Salento hasta las 7:00.',
        clave: true,
        sobre: ['duarte'],
      },
      'p-duarte-rigor': {
        texto: 'Duarte termina admitiendo que madrugó "a dar una vuelta en la moto".',
        clave: false,
        sobre: ['duarte'],
      },
    },
    contradicciones: [
      {
        id: 'c-hotel',
        pistas: ['p-duarte', 'p-moto'],
        sospechoso: 'duarte',
        deduccion: 'Duarte dice que durmió hasta las 7:00, pero su moto salió del hotel a las 5:00 y volvió a las 6:20. Su coartada es falsa.',
        necesaria: true,
      },
      {
        id: 'c-sello',
        pistas: ['p-abelardo', 'p-cata'],
        sospechoso: null,
        deduccion: 'Abelardo selló con un sello impreso, y el del concurso está escrito a mano: el costal que llegó NO es el suyo. Lo cambiaron por el camino.',
        necesaria: true,
      },
      {
        id: 'c-fonda',
        pistas: ['p-chepe', 'p-fonda'],
        sospechoso: 'chepe',
        deduccion: 'Mientras Chepe se tomaba el tinto, el Willys quedó abierto... y en la fonda había un señor de corbata y botas blancas nuevas que llegó en moto.',
        necesaria: false,
      },
    ],
    motivos: [
      { id: 'exportar', texto: 'Venderlo en el exterior como café de concurso' },
      { id: 'ganar', texto: 'Que su propio café ganara el concurso' },
      { id: 'venganza', texto: 'Vengarse de don Abelardo' },
      { id: 'finca', texto: 'Obligar a Abelardo a vender la finca' },
    ],
    metodos: [
      { id: 'fonda', texto: 'Cambió el costal en la fonda por uno falso con el sello escrito a mano' },
      { id: 'apagon', texto: 'Mezcló café corriente en la bodega durante el apagón' },
      { id: 'jueza', texto: 'Le pagó a la jueza para que dijera que era corriente' },
      { id: 'mesa', texto: 'Cambió el costal en la mesa de cata' },
    ],
    solucion: { culpable: 'duarte', motivo: 'exportar', metodo: 'fonda' },
    explicacion:
      'Abelardo selló el costal con su sello impreso, pero en la mesa de cata el 777 estaba escrito a mano: el costal ' +
      'fue cambiado en el camino, no en la bodega (por eso Marcela y Yesid no importan). La única parada fue en la ' +
      'fonda La Ceiba a las 5:40, con el Willys abierto; ahí había un señor de corbata y botas blancas nuevas en moto, ' +
      'como Duarte. Él dijo que dormía hasta las 7:00, pero su moto salió del hotel a las 5:00 y volvió a las 6:20, con ' +
      'cabuya y granos verdes del Lote Esperanza en la parrilla. Dejó un costal de café corriente tostado (sus granos ' +
      'quedaron en el Willys) y se llevó el de oro para venderlo en el exterior como café de concurso.',
  },
];
