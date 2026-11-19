# 🧠 Sala de Juegos Mentales

Cinco juegos para entrenar la mente, todos sobre una mesa de madera con aspecto realista.

**Jugar en línea:** https://juego-memory.vercel.app/

| Juego | Entrena | Qué tiene |
|--|--|--|
| 🃏 **Memoria** | Memoria | Cartas 3D, 4 niveles, 3 mazos, rachas, estrellas y récords |
| 🧩 **Rompecabezas** | Lógica | Fichas deslizantes 3×3, 4×4 y 5×5, con números o con imágenes (Atardecer y Océano) |
| 🤔 **Adivinanzas** | Ingenio | 52 adivinanzas en 6 categorías, pistas, opciones, rachas y contrarreloj |
| 🕵️ **Detective** | Deducción | 5 casos originales: investiga lugares, interroga sospechosos, usa la libreta y acusa al culpable |
| 🔤 **Sopa de letras** | Atención | 9 temas, 3 dificultades, palabras en diagonal y al revés, se juega arrastrando |

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
    └── sopa/                 # SopaDeLetras.jsx, logica.js, temas.js, sopa.css
```

Cada juego tiene su lógica en `logica.js` (funciones puras, fáciles de probar) y su contenido aparte (`datos.js`, `casos.js`, `temas.js`), así que agregar adivinanzas, casos o temas nuevos es solo editar esos archivos.

Hecho con React + Vite.
