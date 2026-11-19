# 🧠 Sala de Juegos Mentales

Ocho juegos para entrenar la mente (y uno de carreras para jugar en pareja), todos sobre una mesa de madera con aspecto realista.

**Jugar en línea:** https://juego-memory.vercel.app/

| Juego | Entrena | Qué tiene |
|--|--|--|
| 🃏 **Memoria** | Memoria | Cartas 3D, 5 niveles (hasta 8×6), 11 mazos, modo Tríos, rachas y récords |
| 🧩 **Rompecabezas** | Lógica | Fichas deslizantes de 3×3 a 6×6 con 10 ilustraciones, modo Fichas giradas y opción sin números |
| 🤔 **Adivinanzas** | Ingenio | 225 adivinanzas en 12 categorías y 4 dificultades, pistas, explicaciones y Desafío del genio |
| 🕵️ **Detective** | Deducción | 12 casos originales, cruce de pistas, cronología, preguntas de rigor y acusación final |
| 🔤 **Sopa de letras** | Atención | 28 temas, 4 dificultades (hasta 16×16), modos Rompecráneos (con definiciones) y Contrarreloj |
| 🔢 **Sudoku** | Concentración | Mini 6×6 a Experto, solución única, notas, pistas, deshacer |
| 🔐 **Código secreto** | Razonamiento | Descifra la clave con pistas ● ○, 4 niveles, variante con números y ayuda del detective |
| 🏎️ **Turbo Karts** | Reflejos | Carreras para 1 o 2 jugadores en pantalla dividida, 5 pistas, 8 pilotos, objetos, derrape y Copa |

### Controles de Turbo Karts
| | Jugador 1 | Jugador 2 |
|--|--|--|
| Manejar | W A S D | Flechas |
| Derrapar | Shift izq. o Espacio | Shift der. o `-` |
| Objeto | Q o E | `.` o Enter |

Pausa con Esc o P. También funciona con 2 controles de videojuego conectados.

Para todos los juegos:
- Efectos de sonido (se pueden silenciar 🔇) y tema claro / oscuro 🌙
- Récords y progreso guardados en el navegador
- Funcionan en el celular y con el teclado

## Cómo correrlo en tu computador
Necesitas [Node.js](https://nodejs.org) instalado.

```bash
npm install      # solo la primera vez: descarga lo necesario
npm run dev      # abre el servidor de desarrollo
```
Luego abre el enlace que aparece en la terminal (por ejemplo `http://localhost:5173`).
Para apagarlo: `Ctrl + C` en la terminal.

Para generar la versión final: `npm run build` (queda en la carpeta `dist`).

## Estructura
```
src/
├── App.jsx                   # la sala: menú de juegos, sonido y tema
├── index.css                 # diseño general (mesa, botones, victoria)
├── Componentes/              # Carta y Victoria (usados por Memoria)
├── logica/                   # sonido.js y almacen.js (compartidos) + juego.js (Memoria)
└── juegos/
    ├── memoria/Memoria.jsx
    ├── rompecabezas/         # Rompecabezas.jsx, logica.js, rompecabezas.css
    ├── adivinanzas/          # Adivinanzas.jsx, logica.js, datos.js, adivinanzas.css
    ├── detective/            # Detective.jsx, logica.js, casos.js, detective.css
    ├── sopa/                 # SopaDeLetras.jsx, logica.js, temas.js, sopa.css
    ├── sudoku/               # Sudoku.jsx, logica.js, sudoku.css
    ├── codigo/               # CodigoSecreto.jsx, logica.js, codigo.css
    └── karts/                # Karts.jsx, render.js, audio.js, entrada.js, logica/ (pistas, física, IA…)
```

Cada juego tiene su lógica en `logica.js` (funciones puras, fáciles de probar) y su contenido aparte (`datos.js`, `casos.js`, `temas.js`), así que agregar adivinanzas, casos o temas nuevos es solo editar esos archivos.

Hecho con React + Vite.
