// Pilotos originales de Turbo Karts. Las estadísticas van de 0.9 a 1.1 (1 = promedio).
export const PILOTOS = [
  { id: 'lola', nombre: 'Lola Rayo', cara: '⚡', color: '#ff4d6d', color2: '#ffd1da', velocidad: 1.04, aceleracion: 0.96, manejo: 1.0, frase: 'Rápida como un relámpago' },
  { id: 'tito', nombre: 'Tito Tornillo', cara: '🔧', color: '#ff9f1c', color2: '#ffe3b8', velocidad: 0.97, aceleracion: 1.08, manejo: 0.98, frase: 'Arranca antes que nadie' },
  { id: 'nube', nombre: 'Nube Azul', cara: '☁️', color: '#3a86ff', color2: '#cfe0ff', velocidad: 1.0, aceleracion: 1.0, manejo: 1.06, frase: 'Toma las curvas flotando' },
  { id: 'coco', nombre: 'Coco Loco', cara: '🥥', color: '#2ec4b6', color2: '#c8f5f0', velocidad: 1.06, aceleracion: 0.94, manejo: 0.96, frase: 'Todo o nada en la recta' },
  { id: 'mora', nombre: 'Mora Estelar', cara: '🌟', color: '#8338ec', color2: '#e2d0ff', velocidad: 1.01, aceleracion: 1.02, manejo: 1.02, frase: 'Equilibrio perfecto' },
  { id: 'pepe', nombre: 'Pepe Pimienta', cara: '🌶️', color: '#e63946', color2: '#ffd6d9', velocidad: 0.99, aceleracion: 1.05, manejo: 1.03, frase: 'Picante en cada derrape' },
  { id: 'lima', nombre: 'Lima Limón', cara: '🍋', color: '#9bd420', color2: '#ecffc2', velocidad: 0.96, aceleracion: 1.06, manejo: 1.08, frase: 'Ácida en las curvas' },
  { id: 'max', nombre: 'Max Motor', cara: '🦾', color: '#6c757d', color2: '#e1e4e8', velocidad: 1.08, aceleracion: 0.92, manejo: 0.94, frase: 'Pesado pero imparable' },
];

export const DIFICULTADES = {
  facil: { nombre: 'Fácil', velocidad: 0.86, error: 0.35, objetos: 0.4 },
  normal: { nombre: 'Normal', velocidad: 0.94, error: 0.18, objetos: 0.75 },
  dificil: { nombre: 'Difícil', velocidad: 1.0, error: 0.06, objetos: 1 },
};

export const PUNTOS_COPA = [10, 8, 6, 5, 4, 3];
