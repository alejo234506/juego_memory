# 🃏 Juego de Memoria

Encuentra todas las parejas de cartas con la menor cantidad de movimientos y en el menor tiempo.

**Jugar en línea:** https://juego-memory.vercel.app/

## Qué tiene
- Cartas con volteo 3D realista sobre una mesa de madera con tapete de fieltro
- 4 niveles: Fácil (4×3), Medio (4×4), Clásico (5×4) y Difícil (6×5)
- 3 mazos: Originales, Animales y Comida
- Movimientos, cronómetro, estrellas (★★★) y racha de aciertos
- Récord por nivel guardado en el navegador
- Pantalla de victoria con confeti y botón para pasar al siguiente nivel
- Efectos de sonido (se pueden silenciar 🔇)
- Tema claro y oscuro
- Funciona en el celular y se puede jugar con el teclado (flechas + Enter)

## Cómo correrlo en tu computador
```bash
npm install
npm run dev
```
Luego abre el enlace que aparece en la terminal (por ejemplo `http://localhost:5173`).

Para generar la versión final: `npm run build` (queda en la carpeta `dist`).

## Estructura
```
src/
├── App.jsx                 # pantalla principal: opciones, marcador y tablero
├── Componentes/
│   ├── Carta.jsx           # una carta (dorso y frente)
│   └── Victoria.jsx        # pantalla de victoria con confeti
├── logica/
│   ├── juego.js            # reglas del juego (barajar, voltear, parejas, estrellas)
│   ├── sonido.js           # sonidos generados con Web Audio
│   └── almacen.js          # guardar récords y preferencias
└── index.css               # todo el diseño
```

Hecho con React + Vite.
