import { NUEVOS } from './casos_nuevos.js';

// Casos del juego Detective. Todo el contenido es original.
//
// Estructura de cada caso:
// - sospechosos: cada uno tiene coartada (siempre visible) e interrogatorio (cuesta 1 acción).
//   Si `pista` existe, interrogarlo agrega esa pista a la libreta.
// - lugares: investigar uno cuesta 1 acción y agrega su `pista` a la libreta.
// - pistas: `clave: true` marca las pistas necesarias para resolver el caso (no se muestra al jugador).
//   `sobre` lista los sospechosos a los que se refiere la pista.
// - solucion: ids de culpable, motivo y método.
// Los casos nuevos (casos_nuevos.js) agregan cronología, contradicciones y preguntas de rigor.

const ORIGINALES = [
  // ==================================================================
  {
    id: 'pastel',
    numero: 1,
    titulo: 'El pastel saboteado',
    icono: '🎂',
    dificultad: 'Fácil',
    acciones: 7,
    intro:
      'Domingo de concurso de repostería en el barrio. El pastel de doña Marta, campeona tres años seguidos, ' +
      'llegó a la mesa del jurado brillante y perfecto... pero al primer bocado los jueces escupieron: ¡estaba salado ' +
      'como agua de mar! Dos jueces terminaron con dolor de estómago. Marta jura que usó azúcar, como siempre. ' +
      'Alguien cambió algo en su mesa entre las 9:00 y las 10:00, mientras ella se arreglaba el peinado.',
    sospechosos: [
      {
        id: 'lucas',
        nombre: 'Lucas',
        avatar: '👦',
        rol: 'Sobrino y ayudante de Marta',
        descripcion: 'Quince años, delantal azul. Le toca lavar todos los moldes y dice que está aburrido del concurso.',
        coartada: 'Dice que de 9:30 a 10:00 fue a comprar hielo con don Hernán.',
        interrogatorio: [
          'Yo mismo llené el azucarero de mi tía a las 9:00. Lo probé con el dedo, ¡era azúcar, se lo juro!',
          'A las 9:30 don Hernán me pidió que lo acompañara a la tienda por hielo para las bebidas.',
        ],
        pista: 'p-lucas',
      },
      {
        id: 'beatriz',
        nombre: 'Beatriz',
        avatar: '👩‍🍳',
        rol: 'Repostera rival',
        descripcion:
          'Delantal de flores rosadas. El año pasado quedó de segunda por un solo punto, justo detrás de Marta.',
        coartada: 'Dice que no se movió de su propia mesa en toda la mañana.',
        interrogatorio: [
          'Yo ni me acerqué a la mesa de Marta. Tengo mi propio trabajo, ¿sabe?',
          'Y este año el trofeo es mío. Ya era hora de que alguien le ganara a la "campeona".',
          'Además yo solo decoro con chocolate. Nada de colores raros.',
        ],
        pista: 'p-beatriz',
      },
      {
        id: 'hernan',
        nombre: 'Don Hernán',
        avatar: '👴',
        rol: 'Juez del concurso',
        descripcion: 'Exprofesor de cocina, bigote canoso. Fue uno de los que se enfermó del estómago.',
        coartada: 'Dice que fue a la tienda con Lucas y volvió justo para juzgar.',
        interrogatorio: [
          'Fui por hielo con el muchacho de 9:30 a 10:00, el tendero nos vio a los dos.',
          'Yo jamás arruinaría un pastel: ¡me lo tenía que comer yo! Todavía me duele la barriga.',
        ],
        pista: 'p-hernan',
      },
      {
        id: 'camila',
        nombre: 'Camila',
        avatar: '👧',
        rol: 'Vende limonada en el concurso',
        descripcion: 'Nueve años. Su puesto de limonada está justo enfrente de la mesa de Marta.',
        coartada: 'Dice que no dejó su puesto en toda la mañana.',
        interrogatorio: [
          'Yo estaba vendiendo limonada, ¡a mil pesos el vaso!',
          'Cuando Lucas se fue, vi a una señora con delantal de flores rosadas parada en la mesa de doña Marta. ' +
            'Movió algo y se fue rapidito.',
        ],
        pista: 'p-camila',
      },
    ],
    lugares: [
      { id: 'mesa-marta', nombre: 'Mesa de doña Marta', icono: '🧁', pista: 'p-azucarero' },
      { id: 'mesa-beatriz', nombre: 'Mesa de Beatriz', icono: '🍰', pista: 'p-glaseado' },
      { id: 'limonada', nombre: 'Puesto de limonada', icono: '🍋', pista: 'p-limonada' },
      { id: 'basura', nombre: 'Caneca de basura', icono: '🗑️', pista: 'p-basura' },
    ],
    pistas: {
      'p-azucarero': {
        texto:
          'El azucarero de Marta está lleno de SAL, no de azúcar. En la tapa hay una huella pegajosa de glaseado color lila.',
        clave: true,
        sobre: [],
      },
      'p-glaseado': {
        texto:
          'El pastel de Beatriz está decorado con flores de glaseado color lila. En su mesa hay un salero grande... vacío.',
        clave: true,
        sobre: ['beatriz'],
      },
      'p-limonada': {
        texto: 'Camila tiene un costal enorme de azúcar para la limonada. Todo es azúcar de verdad, nada de sal.',
        clave: false,
        sobre: ['camila'],
      },
      'p-basura': {
        texto: 'Hay muchas cáscaras de huevo, servilletas y un vaso de limonada. Nada útil.',
        clave: false,
        sobre: [],
      },
      'p-lucas': {
        texto: 'Lucas llenó el azucarero con azúcar a las 9:00 y lo probó. A las 9:30 se fue por hielo con don Hernán.',
        clave: false,
        sobre: ['lucas', 'hernan'],
      },
      'p-hernan': {
        texto: 'Don Hernán confirma que estuvo con Lucas en la tienda de 9:30 a 10:00. El tendero los vio.',
        clave: false,
        sobre: ['hernan', 'lucas'],
      },
      'p-beatriz': {
        texto: 'Beatriz dice que nunca fue a la mesa de Marta, que quiere el trofeo y que "solo decora con chocolate".',
        clave: false,
        sobre: ['beatriz'],
      },
      'p-camila': {
        texto:
          'Camila vio a una señora con delantal de flores rosadas en la mesa de Marta cuando Lucas ya se había ido.',
        clave: true,
        sobre: ['beatriz'],
      },
    },
    motivos: [
      { id: 'trofeo', texto: 'Ganar por fin el concurso' },
      { id: 'aburrimiento', texto: 'Una broma por estar aburrido' },
      { id: 'herencia', texto: 'Quedarse con la receta familiar' },
      { id: 'apuesta', texto: 'Ganar una apuesta de dinero' },
    ],
    metodos: [
      { id: 'sal', texto: 'Cambió el azúcar por sal' },
      { id: 'vinagre', texto: 'Echó vinagre en la crema' },
      { id: 'horno', texto: 'Subió la temperatura del horno' },
      { id: 'huevos', texto: 'Usó huevos dañados' },
    ],
    solucion: { culpable: 'beatriz', motivo: 'trofeo', metodo: 'sal' },
    explicacion:
      'Lucas y don Hernán se cubren el uno al otro: estaban en la tienda de 9:30 a 10:00. En ese rato Camila vio ' +
      'a una señora con delantal de flores rosadas, como el de Beatriz, en la mesa de Marta. Beatriz dijo que solo ' +
      'usa chocolate, pero su pastel tiene glaseado lila, el mismo que quedó en la tapa del azucarero, y su salero ' +
      'grande está vacío. Cambió el azúcar por sal para ganar por fin el trofeo.',
  },

  // ==================================================================
  {
    id: 'cuadro',
    numero: 2,
    titulo: 'El faro que desapareció',
    icono: '🖼️',
    dificultad: 'Media',
    acciones: 7,
    intro:
      'El pequeño museo del pueblo amaneció con un marco vacío. La pintura "El faro dorado", la joya de la colección, ' +
      'fue cortada con cuidado y sacada del edificio durante la noche. Las puertas principales estaban cerradas y ' +
      'la ventana del baño apareció abierta. El director quiere respuestas antes de que llegue la prensa.',
    sospechosos: [
      {
        id: 'ignacio',
        nombre: 'Ignacio',
        avatar: '💂',
        rol: 'Guardia nocturno',
        descripcion: 'Lleva veinte años cuidando el museo. Hace rondas cada media hora con su linterna.',
        coartada: 'Dice que hizo sus rondas a la 1:00 y a la 1:30 sin ver a nadie.',
        interrogatorio: [
          'A la 1:00 todo estaba normal. A eso de la 1:10 vi luz debajo de la puerta del taller de restauración.',
          'Pensé que era la señora Sofía, ella a veces trabaja hasta tarde. No quise molestar.',
        ],
        pista: 'p-ignacio',
      },
      {
        id: 'sofia',
        nombre: 'Sofía',
        avatar: '👩‍🎨',
        rol: 'Restauradora del museo',
        descripcion: 'Experta en limpiar pinturas antiguas. Llevaba dos semanas trabajando en "El faro dorado".',
        coartada: 'Dice que salió del museo a las 11:00 de la noche y no volvió.',
        interrogatorio: [
          'Me fui a las 11:00, estaba agotada. Dejé el cuadro colgado y en perfecto estado.',
          'Mi trabajo con esa pintura fue impecable. Revise mis informes si quiere.',
        ],
        pista: 'p-sofia',
      },
      {
        id: 'mateo',
        nombre: 'Mateo',
        avatar: '🧔',
        rol: 'Director del museo',
        descripcion: 'Elegante y nervioso. El museo tiene problemas de dinero desde hace un año.',
        coartada: 'Dice que estuvo en una cena benéfica hasta las 2:00 de la madrugada.',
        interrogatorio: [
          'Estuve en la cena benéfica del hotel hasta las 2:00, con unas ochenta personas.',
          'Solo dos personas tenemos llave del taller de restauración: Sofía y yo.',
        ],
        pista: 'p-mateo',
      },
      {
        id: 'valentina',
        nombre: 'Valentina',
        avatar: '🧑‍🎓',
        rol: 'Estudiante de arte',
        descripcion: 'Viene todas las tardes a dibujar "El faro dorado" en su cuaderno.',
        coartada: 'Dice que por la noche estaba en su casa estudiando.',
        interrogatorio: [
          'Yo amo ese cuadro, lo dibujo todos los días.',
          'Ayer noté algo raro: la esquina de abajo, donde está el mar, se veía opaca, como borrosa. Antes no era así.',
        ],
        pista: 'p-valentina',
      },
      {
        id: 'ezequiel',
        nombre: 'Don Ezequiel',
        avatar: '🎩',
        rol: 'Coleccionista de arte',
        descripcion: 'Millonario que quiso comprar "El faro dorado" el mes pasado.',
        coartada: 'Dice que estaba de viaje en la capital.',
        interrogatorio: [
          'Ofrecí mucho dinero por esa pintura y el director me dijo que no. Me molestó, claro.',
          'Pero yo compro arte, no lo robo. Estoy en la capital desde el lunes, tengo el tiquete del avión.',
        ],
        pista: 'p-ezequiel',
      },
    ],
    lugares: [
      { id: 'sala', nombre: 'Sala del faro', icono: '🖼️', pista: 'p-marco' },
      { id: 'taller', nombre: 'Taller de restauración', icono: '🎨', pista: 'p-taller' },
      { id: 'vigilancia', nombre: 'Cuarto de cámaras', icono: '📹', pista: 'p-camaras' },
      { id: 'banio', nombre: 'Ventana del baño', icono: '🪟', pista: 'p-ventana' },
      { id: 'oficina', nombre: 'Oficina del director', icono: '🗄️', pista: 'p-oficina' },
    ],
    pistas: {
      'p-marco': {
        texto: 'La tela fue cortada con una cuchilla, siguiendo el borde del marco con mucha precisión. Mano experta.',
        clave: false,
        sobre: [],
      },
      'p-taller': {
        texto:
          'En la basura del taller hay algodones con solvente manchados del mismo azul del mar del cuadro, y un ' +
          'borrador de informe sin firmar: "Daño irreversible por solvente en la esquina inferior".',
        clave: true,
        sobre: ['sofia'],
      },
      'p-camaras': {
        texto:
          'La cámara de la puerta trasera del taller se apagó de 1:00 a 1:20. Ese interruptor solo se abre con la ' +
          'llave del taller. Ninguna otra cámara muestra a nadie.',
        clave: true,
        sobre: [],
      },
      'p-ventana': {
        texto:
          'La ventana está abierta y hay huellas de zapatos en el barro de afuera, pero el barro está seco y duro ' +
          'desde ayer en la tarde. Las huellas son viejas: es un montaje.',
        clave: false,
        sobre: [],
      },
      'p-oficina': {
        texto: 'Cartas del banco: el museo debe varios meses de luz. También la oferta rechazada de don Ezequiel.',
        clave: false,
        sobre: ['mateo', 'ezequiel'],
      },
      'p-ignacio': {
        texto: 'Ignacio vio luz en el taller de restauración a la 1:10 de la madrugada.',
        clave: true,
        sobre: ['sofia'],
      },
      'p-sofia': {
        texto: 'Sofía asegura que se fue a las 11:00 y que dejó el cuadro en perfecto estado.',
        clave: false,
        sobre: ['sofia'],
      },
      'p-mateo': {
        texto:
          'Mateo estuvo en una cena con 80 testigos hasta las 2:00. Solo Sofía y él tienen llave del taller.',
        clave: true,
        sobre: ['mateo', 'sofia'],
      },
      'p-valentina': {
        texto: 'Valentina notó ayer que la esquina inferior del cuadro se veía opaca y borrosa.',
        clave: false,
        sobre: ['valentina'],
      },
      'p-ezequiel': {
        texto: 'Don Ezequiel está en la capital desde el lunes y tiene el tiquete del avión.',
        clave: false,
        sobre: ['ezequiel'],
      },
    },
    motivos: [
      { id: 'vender', texto: 'Vendérselo a un coleccionista' },
      { id: 'deudas', texto: 'Pagar las deudas del museo' },
      { id: 'ocultar', texto: 'Esconder un daño que le causó al cuadro' },
      { id: 'amor', texto: 'Quedárselo por amor al arte' },
    ],
    metodos: [
      { id: 'ventana', texto: 'Lo sacó por la ventana del baño' },
      { id: 'taller', texto: 'Lo sacó por el taller, apagando la cámara con la llave' },
      { id: 'principal', texto: 'Lo sacó por la puerta principal' },
      { id: 'copia', texto: 'Lo cambió por una copia durante el día' },
    ],
    solucion: { culpable: 'sofia', motivo: 'ocultar', metodo: 'taller' },
    explicacion:
      'La ventana del baño es un montaje: las huellas son de antes de la noche. La cámara del taller se apagó ' +
      'de 1:00 a 1:20 y solo se puede apagar con la llave del taller, que tienen Sofía y Mateo. Mateo estaba en una ' +
      'cena con 80 testigos, y a la 1:10 Ignacio vio luz en el taller. Sofía mintió al decir que se fue a las 11:00. ' +
      'Su motivo está en la basura: dañó el cuadro con solvente (lo que Valentina vio borroso) y prefirió que ' +
      'pareciera un robo antes de que descubrieran su error.',
  },

  // ==================================================================
  {
    id: 'restaurante',
    numero: 3,
    titulo: 'Noche amarga en La Cuchara de Oro',
    icono: '🍮',
    dificultad: 'Media',
    acciones: 7,
    intro:
      'En la cena de aniversario del restaurante La Cuchara de Oro, seis comensales salieron corriendo al baño ' +
      'después del postre: un tres leches "especial de la casa". Esa misma noche estaba en el salón una famosa ' +
      'crítica gastronómica. El chef Aurelio jura que su receta es perfecta. ¿Accidente o sabotaje?',
    sospechosos: [
      {
        id: 'aurelio',
        nombre: 'Chef Aurelio',
        avatar: '👨‍🍳',
        rol: 'Chef principal',
        descripcion: 'Uniforme blanco impecable. Creó el famoso tres leches hace diez años.',
        coartada: 'Dice que pasó toda la noche en los fogones preparando los platos fuertes.',
        interrogatorio: [
          'Yo mismo hice la crema del tres leches a las 5:00 de la tarde. ¡Todo el equipo la comió en la cena del personal y nadie se enfermó!',
          'Después, Daniel quedó encargado de terminar y servir los postres. Yo no volví a tocarlos.',
        ],
        pista: 'p-aurelio',
      },
      {
        id: 'daniel',
        nombre: 'Daniel',
        avatar: '🧑‍🍳',
        rol: 'Subchef',
        descripcion: 'Uniforme negro, como manda la regla de la cocina para los subchefs. Muy ambicioso.',
        coartada: 'Dice que estuvo picando verduras toda la noche y que no entró al cuarto frío.',
        interrogatorio: [
          'Yo solo armé los platos de postre con lo que dejó el chef. Si salió mal, es culpa de su receta.',
          'Mi tarjeta de la cocina no la suelto nunca, siempre la tengo en el bolsillo.',
        ],
        pista: 'p-daniel',
      },
      {
        id: 'paola',
        nombre: 'Paola',
        avatar: '💁‍♀️',
        rol: 'Mesera',
        descripcion: 'Uniforme rojo de mesera. Atendió la mesa de la crítica toda la noche.',
        coartada: 'Dice que de 7:30 a 8:00 estuvo en la mesa de la crítica.',
        interrogatorio: [
          'A las 7:30 la señora Inés me retuvo como veinte minutos preguntándome cada ingrediente del menú.',
          'Los postres salieron de la cocina a las 8:15. Yo solo los llevé a las mesas.',
        ],
        pista: 'p-paola',
      },
      {
        id: 'gustavo',
        nombre: 'Gustavo',
        avatar: '🚚',
        rol: 'Proveedor de lácteos',
        descripcion: 'Trae la leche y la crema cada día. El chef le debe tres facturas.',
        coartada: 'Dice que entregó el pedido a las 4:00 de la tarde y se fue.',
        interrogatorio: [
          'Entregué a las 4:00 por la puerta de atrás y me fui. Ni siquiera tengo tarjeta para entrar.',
          'Sí, el chef me debe plata. Pero si le arruino el negocio, ¿cómo me va a pagar?',
        ],
        pista: 'p-gustavo',
      },
      {
        id: 'ines',
        nombre: 'Inés',
        avatar: '🕵️‍♀️',
        rol: 'Crítica gastronómica',
        descripcion: 'Sus reseñas pueden llenar o vaciar un restaurante. Ella también comió el postre.',
        coartada: 'Dice que estuvo sentada en su mesa toda la noche.',
        interrogatorio: [
          'Llegué a las 7:30 y le hice muchas preguntas a la mesera, como siempre.',
          'Me sentí fatal después del postre. Tenía un saborcito a tiza, muy extraño.',
        ],
        pista: 'p-ines',
      },
    ],
    lugares: [
      { id: 'cuarto-frio', nombre: 'Cuarto frío', icono: '🧊', pista: 'p-lata' },
      { id: 'oficina', nombre: 'Oficina del gerente', icono: '📋', pista: 'p-oficina' },
      { id: 'callejon', nombre: 'Basura del callejón', icono: '🗑️', pista: 'p-callejon' },
      { id: 'camion', nombre: 'Pedido del proveedor', icono: '🥛', pista: 'p-pedido' },
      { id: 'comedor', nombre: 'Mesa de la crítica', icono: '🍽️', pista: 'p-mesa' },
    ],
    pistas: {
      'p-lata': {
        texto:
          'Una lata de leche condensada abierta tiene polvo blanco pegado en el borde. El registro electrónico de ' +
          'la puerta dice: "7:38 p. m. — tarjeta n.º 2".',
        clave: true,
        sobre: [],
      },
      'p-oficina': {
        texto:
          'Lista de tarjetas: n.º 1 Chef Aurelio, n.º 2 Daniel, n.º 3 Paola. También una carta del dueño: ' +
          '"Si la noche de aniversario sale mal, Aurelio queda despedido y su subchef tomará el puesto".',
        clave: true,
        sobre: ['aurelio', 'daniel', 'paola'],
      },
      'p-callejon': {
        texto:
          'Un sobre vacío de laxante en polvo, envuelto dentro de un delantal NEGRO de cocina.',
        clave: true,
        sobre: [],
      },
      'p-pedido': {
        texto: 'Las leches y cremas que trajo Gustavo están selladas y frescas. No hay nada malo en ellas.',
        clave: false,
        sobre: ['gustavo'],
      },
      'p-mesa': {
        texto: 'La libreta de Inés: "7:30 llegada. Mesera muy amable, 20 minutos de preguntas. Postre: sabor a tiza."',
        clave: false,
        sobre: ['ines', 'paola'],
      },
      'p-aurelio': {
        texto: 'Aurelio hizo la crema a las 5:00; el personal la comió sin problema. Daniel terminó y sirvió los postres.',
        clave: false,
        sobre: ['aurelio', 'daniel'],
      },
      'p-daniel': {
        texto: 'Daniel dice que nunca suelta su tarjeta y que no entró al cuarto frío.',
        clave: false,
        sobre: ['daniel'],
      },
      'p-paola': {
        texto: 'Paola estuvo con la crítica de 7:30 a 7:50. Los postres salieron a las 8:15.',
        clave: false,
        sobre: ['paola', 'ines'],
      },
      'p-gustavo': {
        texto: 'Gustavo entregó a las 4:00 y no tiene tarjeta para entrar. El chef le debe dinero.',
        clave: false,
        sobre: ['gustavo'],
      },
      'p-ines': {
        texto: 'Inés llegó a las 7:30. El postre le supo "a tiza".',
        clave: false,
        sobre: ['ines'],
      },
    },
    motivos: [
      { id: 'puesto', texto: 'Quedarse con el puesto del chef' },
      { id: 'deuda', texto: 'Vengarse por una deuda sin pagar' },
      { id: 'resena', texto: 'Escribir una reseña escandalosa' },
      { id: 'broma', texto: 'Hacer una broma pesada' },
    ],
    metodos: [
      { id: 'laxante', texto: 'Laxante en la leche condensada' },
      { id: 'vencida', texto: 'Leche vencida del proveedor' },
      { id: 'huevos', texto: 'Huevos crudos en mal estado' },
      { id: 'jabon', texto: 'Jabón en los platos' },
    ],
    solucion: { culpable: 'daniel', motivo: 'puesto', metodo: 'laxante' },
    explicacion:
      'La crema de las 5:00 estaba bien: todo el personal la comió. El problema vino después, en la leche ' +
      'condensada con polvo blanco, abierta a las 7:38 con la tarjeta n.º 2, que es la de Daniel. Paola estaba con ' +
      'la crítica a esa hora y Gustavo ni siquiera tiene tarjeta. En el callejón apareció el sobre de laxante ' +
      'dentro de un delantal negro, el color de los subchefs. Daniel quería que la noche fracasara para quedarse ' +
      'con el puesto de Aurelio, como decía la carta del dueño.',
  },

  // ==================================================================
  {
    id: 'robot',
    numero: 4,
    titulo: 'Corto circuito en la feria de ciencias',
    icono: '🤖',
    dificultad: 'Difícil',
    acciones: 6,
    intro:
      'Feria de ciencias del colegio. El premio: una beca completa para el próximo año. El robot "Chispa" de Ana, ' +
      'el gran favorito, funcionaba perfecto a las 9:10. A las 9:50, justo antes de que llegara el jurado, estaba ' +
      'muerto: ni una luz. Entre las 9:15 y las 9:45 todo el curso salió al patio para un acto. ¿Quién volvió al salón?',
    sospechosos: [
      {
        id: 'ana',
        nombre: 'Ana',
        avatar: '👩‍🔬',
        rol: 'Creadora del robot Chispa',
        descripcion: 'Muy ordenada: marca todas sus piezas con cinta amarilla para no perderlas.',
        coartada: 'Dice que estuvo en el patio en primera fila durante el acto.',
        interrogatorio: [
          'A las 9:10 probé a Chispa y bailó perfecto. Usa una batería recargable SolarMax que cargué toda la noche.',
          'A las 9:50 volví y ya no prendía. Alguien le hizo algo, ¡estoy segura!',
        ],
        pista: 'p-ana',
      },
      {
        id: 'tomas',
        nombre: 'Tomás',
        avatar: '🧑',
        rol: 'Concursante (volcán)',
        descripcion: 'Presentó un volcán con luces. Dice que Ana es "la consentida de los profes".',
        coartada: 'Dice que estuvo en el patio sentado al lado de Felipe.',
        interrogatorio: [
          'Yo no salí del patio. Pregúntele a Felipe, estuvimos juntos todo el acto.',
          'Y sí, corté unos cables esta mañana... ¡pero para las luces de mi volcán!',
        ],
        pista: 'p-tomas',
      },
      {
        id: 'felipe',
        nombre: 'Felipe',
        avatar: '🧒',
        rol: 'Hermano mayor de Ana',
        descripcion: 'Le molesta que Ana siempre use su cargador sin pedirle permiso.',
        coartada: 'Dice que estuvo en el patio con Tomás.',
        interrogatorio: [
          'Tomás estuvo a mi lado todo el acto, se lo prometo.',
          'Mi hermana me saca de quicio con mi cargador, pero nunca le dañaría su robot.',
        ],
        pista: 'p-felipe',
      },
      {
        id: 'gil',
        nombre: 'Profesora Gil',
        avatar: '👩‍🏫',
        rol: 'Directora de curso y jueza',
        descripcion: 'Muy estricta: nadie sale del acto sin su permiso firmado.',
        coartada: 'Estuvo en el patio dirigiendo el acto.',
        interrogatorio: [
          'Durante el acto solo le di permiso a una alumna: Renata pidió ir al baño a las 9:20.',
          'Volvió a las 9:35. Los demás no se movieron, los estuve contando.',
        ],
        pista: 'p-gil',
      },
      {
        id: 'renata',
        nombre: 'Renata',
        avatar: '👱‍♀️',
        rol: 'Concursante (invernadero solar)',
        descripcion: 'Presentó un invernadero con panel solar. Muy callada y muy aplicada.',
        coartada: 'Dice que solo salió del acto para ir al baño.',
        interrogatorio: [
          'Fui al baño y volví, nada más. Ni me acerqué al salón.',
          'Necesito esa beca... mis papás no pueden pagar el colegio el próximo año.',
        ],
        pista: 'p-renata',
      },
    ],
    lugares: [
      { id: 'mesa-ana', nombre: 'Mesa del robot Chispa', icono: '🤖', pista: 'p-chispa' },
      { id: 'mesa-renata', nombre: 'Mesa del invernadero', icono: '🌱', pista: 'p-invernadero' },
      { id: 'mesa-tomas', nombre: 'Mesa del volcán', icono: '🌋', pista: 'p-volcan' },
      { id: 'banio', nombre: 'Baño de niñas', icono: '🚻', pista: 'p-banio' },
      { id: 'patio', nombre: 'Patio del acto', icono: '📸', pista: 'p-foto' },
    ],
    pistas: {
      'p-chispa': {
        texto:
          'Los cables de Chispa están intactos. Pero su batería es de marca "Volta" y está totalmente descargada. ' +
          'No tiene ninguna cinta.',
        clave: true,
        sobre: [],
      },
      'p-invernadero': {
        texto:
          'En la caja de herramientas del invernadero hay una batería SolarMax cargada al 100 %, con un pedacito ' +
          'de cinta amarilla pegado. También hay una caja de baterías Volta a la que le falta una.',
        clave: true,
        sobre: ['renata'],
      },
      'p-volcan': {
        texto: 'Hay trozos de cable cortado en la basura del volcán... y todos están conectados a sus luces nuevas.',
        clave: false,
        sobre: ['tomas'],
      },
      'p-banio': {
        texto: 'Letrero de la conserje en la puerta: "Baño cerrado por limpieza de 9:00 a 10:00".',
        clave: true,
        sobre: [],
      },
      'p-foto': {
        texto: 'Foto del acto a las 9:30: se ve a Ana, a Tomás junto a Felipe y a la profesora Gil. Renata no aparece.',
        clave: false,
        sobre: ['ana', 'tomas', 'felipe', 'gil', 'renata'],
      },
      'p-ana': {
        texto: 'Ana usa una batería recargable SolarMax en Chispa; a las 9:10 funcionaba.',
        clave: false,
        sobre: ['ana'],
      },
      'p-tomas': {
        texto: 'Tomás dice que no salió del patio y que cortó cables para las luces de su volcán.',
        clave: false,
        sobre: ['tomas', 'felipe'],
      },
      'p-felipe': {
        texto: 'Felipe confirma que Tomás estuvo a su lado todo el acto.',
        clave: false,
        sobre: ['felipe', 'tomas'],
      },
      'p-gil': {
        texto: 'La profesora Gil solo dejó salir a Renata, de 9:20 a 9:35, "para ir al baño".',
        clave: true,
        sobre: ['renata'],
      },
      'p-renata': {
        texto: 'Renata dice que solo fue al baño. Necesita la beca porque sus papás no pueden pagar el colegio.',
        clave: false,
        sobre: ['renata'],
      },
    },
    motivos: [
      { id: 'beca', texto: 'Ganar la beca' },
      { id: 'celos', texto: 'Celos de hermano' },
      { id: 'burla', texto: 'Vengarse de una burla' },
      { id: 'broma', texto: 'Hacer una broma' },
    ],
    metodos: [
      { id: 'bateria', texto: 'Cambió la batería por una descargada' },
      { id: 'cable', texto: 'Cortó un cable' },
      { id: 'agua', texto: 'Le echó agua al circuito' },
      { id: 'programa', texto: 'Borró el programa' },
    ],
    solucion: { culpable: 'renata', motivo: 'beca', metodo: 'bateria' },
    explicacion:
      'Los cables de Chispa están bien, así que no lo cortaron: le cambiaron la SolarMax de Ana por una Volta ' +
      'descargada. La SolarMax con la cinta amarilla de Ana apareció en la caja del invernadero, junto a una caja de ' +
      'Volta a la que le falta una. Solo Renata salió del acto (de 9:20 a 9:35) y dijo que iba al baño... que estaba ' +
      'cerrado por limpieza. Tomás y Felipe se cubren mutuamente. Renata lo hizo para ganar la beca.',
  },

  // ==================================================================
  {
    id: 'collar',
    numero: 5,
    titulo: 'La Lágrima de Luna',
    icono: '💎',
    dificultad: 'Experto',
    acciones: 6,
    intro:
      'Gran fiesta en la mansión de doña Leonor. A las 9:15 se fue la luz durante diez minutos. Cuando volvió, ' +
      'todo parecía en orden... hasta que doña Leonor notó que el collar "Lágrima de Luna" de su vitrina ya no ' +
      'brillaba igual: ¡es una imitación de vidrio! Todos creen que lo cambiaron a oscuras. ' +
      'Esa noche, a las 8:15, un experto había venido a tasar el collar.',
    sospechosos: [
      {
        id: 'clara',
        nombre: 'Clara',
        avatar: '👩',
        rol: 'Sobrina de doña Leonor',
        descripcion: 'Única heredera de la familia. Se rumora que debe mucho dinero por apuestas.',
        coartada: 'Dice que estaba en su cuarto, en el ala norte, porque tenía frío.',
        interrogatorio: [
          'Sí, tengo deudas de juego, no lo voy a negar.',
          'Tenía tanto frío que prendí tres estufas en mi cuarto. Justo después se fue la luz... ¿fui yo?',
        ],
        pista: 'p-clara',
      },
      {
        id: 'bruno',
        nombre: 'Bruno',
        avatar: '🤵',
        rol: 'Mayordomo',
        descripcion: 'Trabaja en la casa hace treinta años. Tiene llave de la vitrina.',
        coartada: 'Dice que a las 8:15 cuidó la puerta de la biblioteca durante la tasación.',
        interrogatorio: [
          'A las 8:15 el doctor Salcedo pidió quedarse solo con el collar en la biblioteca para tasarlo. Fueron veinte minutos.',
          'Yo cuidé la puerta. Cuando salió, el doctor mismo lo puso de nuevo en la vitrina.',
        ],
        pista: 'p-bruno',
      },
      {
        id: 'salcedo',
        nombre: 'Dr. Salcedo',
        avatar: '🧐',
        rol: 'Joyero y tasador',
        descripcion: 'Dueño de la joyería "Salcedo e Hijos". Vino a tasar el collar para el seguro.',
        coartada: 'Dice que durante el apagón estaba en el jardín tomando aire.',
        interrogatorio: [
          'Cuando lo revisé, el collar era auténtico. Se lo aseguro por mis treinta años de oficio.',
          'Seguro lo cambiaron durante el apagón. A oscuras cualquiera pudo hacerlo.',
        ],
        pista: 'p-salcedo',
      },
      {
        id: 'monica',
        nombre: 'Mónica',
        avatar: '🎹',
        rol: 'Pianista contratada',
        descripcion: 'Tocó el piano en el salón durante toda la fiesta.',
        coartada: 'Dice que no se levantó del piano en toda la noche.',
        interrogatorio: [
          'Toqué de las 8:00 hasta el apagón sin parar. Cuando se fue la luz, seguí tocando de memoria.',
          'Los invitados aplaudieron a oscuras. Fue muy bonito, la verdad.',
        ],
        pista: 'p-monica',
      },
      {
        id: 'rafael',
        nombre: 'Rafael',
        avatar: '👷',
        rol: 'Electricista de la casa',
        descripcion: 'Estaba de turno esa noche por si fallaban las luces del jardín.',
        coartada: 'Dice que durante el apagón estaba arreglando los fusibles.',
        interrogatorio: [
          'El apagón fue por sobrecarga en el ala norte. Lo arreglé en diez minutos.',
          'No vi a nadie sospechoso cerca de la vitrina, pero claro, estaba todo oscuro.',
        ],
        pista: 'p-rafael',
      },
    ],
    lugares: [
      { id: 'vitrina', nombre: 'La vitrina', icono: '🔍', pista: 'p-vitrina' },
      { id: 'fusibles', nombre: 'Cuarto de fusibles', icono: '⚡', pista: 'p-fusibles' },
      { id: 'maletin', nombre: 'Maletín del tasador', icono: '💼', pista: 'p-maletin' },
      { id: 'album', nombre: 'Cámara de la fotógrafa', icono: '📷', pista: 'p-fotos' },
      { id: 'cuarto-clara', nombre: 'Cuarto de Clara', icono: '🛏️', pista: 'p-cuarto' },
      { id: 'salon', nombre: 'Salón del piano', icono: '🎼', pista: 'p-salon' },
    ],
    pistas: {
      'p-vitrina': {
        texto:
          'La imitación tiene un broche nuevo y brillante. Dentro del estuche hay restos de cera rosada, como la ' +
          'que usan los joyeros para hacer moldes.',
        clave: false,
        sobre: [],
      },
      'p-fusibles': {
        texto:
          'El fusible del ala norte se quemó por sobrecarga: tres estufas conectadas al mismo enchufe. ' +
          'Fue un accidente, nadie lo provocó a propósito.',
        clave: false,
        sobre: ['clara', 'rafael'],
      },
      'p-maletin': {
        texto:
          'Una lupa, cera rosada para moldes, un recibo de un taller de bisutería de hace dos semanas: "Réplica ' +
          'de collar en forma de lágrima, vidrio", y una carta del banco: "Último aviso de embargo: Joyería ' +
          'Salcedo e Hijos".',
        clave: true,
        sobre: ['salcedo'],
      },
      'p-fotos': {
        texto:
          'Foto de las 8:05: el collar en la vitrina lanza destellos de arcoíris. Foto de las 8:50 (antes del ' +
          'apagón): el collar se ve opaco, sin destellos. ¡El cambio ocurrió antes de que se fuera la luz!',
        clave: true,
        sobre: [],
      },
      'p-cuarto': {
        texto: 'Cartas de cobro de un casino a nombre de Clara y tres estufas todavía calientes.',
        clave: false,
        sobre: ['clara'],
      },
      'p-salon': {
        texto: 'La grabación de la fiesta: el piano suena sin una sola pausa de 8:00 a 9:25.',
        clave: false,
        sobre: ['monica'],
      },
      'p-clara': {
        texto: 'Clara admite sus deudas de juego y que prendió tres estufas justo antes del apagón.',
        clave: false,
        sobre: ['clara'],
      },
      'p-bruno': {
        texto:
          'De 8:15 a 8:35 el Dr. Salcedo estuvo SOLO con el collar en la biblioteca. Él mismo lo devolvió a la vitrina.',
        clave: true,
        sobre: ['salcedo', 'bruno'],
      },
      'p-salcedo': {
        texto: 'El Dr. Salcedo asegura que el collar era auténtico cuando lo revisó y culpa al apagón.',
        clave: false,
        sobre: ['salcedo'],
      },
      'p-monica': {
        texto: 'Mónica dice que tocó sin parar toda la noche, incluso a oscuras.',
        clave: false,
        sobre: ['monica'],
      },
      'p-rafael': {
        texto: 'Rafael dice que el apagón fue por sobrecarga en el ala norte y que lo arregló en diez minutos.',
        clave: false,
        sobre: ['rafael'],
      },
    },
    motivos: [
      { id: 'joyeria', texto: 'Salvar su negocio de la quiebra' },
      { id: 'juego', texto: 'Pagar deudas de juego' },
      { id: 'herencia', texto: 'Adelantar la herencia' },
      { id: 'venganza', texto: 'Vengarse de doña Leonor' },
    ],
    metodos: [
      { id: 'apagon', texto: 'Lo cambió a oscuras durante el apagón' },
      { id: 'tasacion', texto: 'Lo cambió por una réplica durante la tasación' },
      { id: 'ventana', texto: 'Lo sacó por una ventana' },
      { id: 'piano', texto: 'Lo escondió dentro del piano' },
    ],
    solucion: { culpable: 'salcedo', motivo: 'joyeria', metodo: 'tasacion' },
    explicacion:
      'El apagón fue una casualidad: las estufas de Clara quemaron el fusible. Las fotos prueban que el collar ya era ' +
      'falso a las 8:50, antes del apagón. Entre las 8:05 y las 8:50, el único que estuvo a solas con él fue el ' +
      'Dr. Salcedo, durante la tasación de 8:15 a 8:35. En su maletín estaba la cera de moldes, el recibo de la ' +
      'réplica de vidrio mandada a hacer hace dos semanas y el aviso de embargo de su joyería. Lo planeó todo ' +
      'para salvar su negocio de la quiebra.',
  },
];

// Contradicciones agregadas a un caso original (para enseñar a cruzar pistas desde el principio)
const EXTRAS = {
  pastel: {
    contradicciones: [
      {
        id: 'c-chocolate',
        pistas: ['p-beatriz', 'p-glaseado'],
        sospechoso: 'beatriz',
        deduccion:
          'Beatriz dice que "solo decora con chocolate", pero su pastel tiene glaseado lila... el mismo color de la huella del azucarero.',
        necesaria: false,
      },
    ],
  },
};

// Orden del archivo: de lo más fácil a lo más difícil
const ORDEN = [
  'pastel', 'colegio', 'cuadro', 'circo', 'restaurante', 'robot',
  'estadio', 'collar', 'tren', 'hotel', 'television', 'cafe',
];

const TODOS = Object.fromEntries(
  [...ORIGINALES, ...NUEVOS].map((c) => [c.id, { ...c, ...(EXTRAS[c.id] ?? {}) }])
);

export const CASOS = ORDEN.map((id, i) => ({ ...TODOS[id], numero: i + 1 }));
