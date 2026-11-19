// Ilustraciones originales del rompecabezas (SVG dibujado aquí mismo) y el ayudante para crearlas.
// Las demás están en ilustraciones.js.

export const svg = (contenido) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' preserveAspectRatio='xMidYMid slice'>${contenido}</svg>`
  )}")`;

export const ATARDECER = svg(`
  <defs>
    <linearGradient id='cielo' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#2d1b69'/><stop offset='.45' stop-color='#e8476b'/><stop offset='.62' stop-color='#ffb347'/>
    </linearGradient>
    <linearGradient id='agua' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#ff9a5a'/><stop offset='1' stop-color='#3a1f5c'/>
    </linearGradient>
    <radialGradient id='sol'><stop offset='0' stop-color='#fff6c2'/><stop offset='1' stop-color='#ffcf4a'/></radialGradient>
  </defs>
  <rect width='400' height='400' fill='url(#cielo)'/>
  <circle cx='60' cy='50' r='2' fill='#fff'/><circle cx='120' cy='30' r='1.6' fill='#fff'/><circle cx='330' cy='45' r='2' fill='#fff'/><circle cx='260' cy='22' r='1.4' fill='#fff'/>
  <circle cx='200' cy='225' r='62' fill='url(#sol)'/>
  <path d='M0 250 L70 160 L120 210 L190 120 L260 205 L320 150 L400 235 L400 260 L0 260Z' fill='#5b2a6e'/>
  <path d='M0 262 L50 215 L110 250 L170 200 L240 255 L300 215 L360 245 L400 225 L400 262Z' fill='#3d1d55'/>
  <rect y='260' width='400' height='140' fill='url(#agua)'/>
  <g fill='#fff3c4' opacity='.75'>
    <rect x='150' y='272' width='100' height='4' rx='2'/><rect x='165' y='290' width='70' height='4' rx='2'/>
    <rect x='178' y='308' width='44' height='3' rx='1.5'/><rect x='188' y='324' width='24' height='3' rx='1.5'/>
  </g>
  <path d='M0 400 L0 300 Q60 280 120 310 Q150 330 140 400Z' fill='#1e1030'/>
  <g fill='#1e1030'>
    <path d='M30 305 L45 250 L60 305Z'/><path d='M60 300 L78 235 L96 300Z'/><path d='M95 312 L108 268 L121 312Z'/>
  </g>
  <rect x='310' y='280' width='56' height='36' fill='#2a1640'/><path d='M302 282 L338 254 L374 282Z' fill='#1e1030'/>
  <rect x='322' y='292' width='12' height='12' fill='#ffcf4a'/><rect x='344' y='292' width='12' height='12' fill='#ffcf4a'/>
  <path d='M290 400 Q330 310 400 300 L400 400Z' fill='#1e1030'/>
  <g fill='none' stroke='#2d1b69' stroke-width='3' stroke-linecap='round'>
    <path d='M80 110 q8 -8 16 0 q8 -8 16 0'/><path d='M130 90 q6 -6 12 0 q6 -6 12 0'/><path d='M280 100 q7 -7 14 0 q7 -7 14 0'/>
  </g>
`);

export const OCEANO = svg(`
  <defs>
    <linearGradient id='mar' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#4fd1e8'/><stop offset='.55' stop-color='#1270b8'/><stop offset='1' stop-color='#0a2a5e'/>
    </linearGradient>
  </defs>
  <rect width='400' height='400' fill='url(#mar)'/>
  <g fill='#ffffff' opacity='.18'>
    <path d='M60 0 L110 0 L40 260 L0 260Z'/><path d='M190 0 L230 0 L170 300 L130 300Z'/><path d='M320 0 L370 0 L300 240 L260 240Z'/>
  </g>
  <path d='M0 340 Q60 310 120 335 T240 330 T400 325 L400 400 L0 400Z' fill='#f2d49b'/>
  <path d='M0 370 Q80 350 160 368 T400 360 L400 400 L0 400Z' fill='#e0b874'/>
  <g fill='#ff6b8b'>
    <path d='M40 345 q-6 -40 6 -60 q4 20 10 30 q6 -24 14 -34 q-2 34 -10 64Z'/>
    <path d='M330 340 q-4 -30 4 -50 q4 14 8 22 q4 -18 12 -26 q0 28 -8 54Z'/>
  </g>
  <g fill='#2ea36b'>
    <path d='M100 345 q-10 -40 4 -80 q-4 40 6 80Z'/><path d='M112 345 q6 -50 -6 -95 q18 45 14 95Z'/>
    <path d='M280 340 q-8 -36 4 -70 q-2 36 6 70Z'/>
  </g>
  <g>
    <ellipse cx='150' cy='150' rx='38' ry='24' fill='#ffcf4a'/><path d='M186 150 L214 128 L214 172Z' fill='#ffcf4a'/>
    <path d='M130 132 L140 150 L130 168' fill='none' stroke='#e0a800' stroke-width='4'/>
    <circle cx='130' cy='144' r='5' fill='#fff'/><circle cx='129' cy='144' r='2.5' fill='#222'/>
  </g>
  <g>
    <ellipse cx='290' cy='230' rx='30' ry='18' fill='#ff9f43'/><path d='M318 230 L340 214 L340 246Z' fill='#ff9f43'/>
    <rect x='278' y='213' width='7' height='34' fill='#fff'/><rect x='298' y='215' width='6' height='30' fill='#fff'/>
    <circle cx='272' cy='226' r='4' fill='#fff'/><circle cx='271' cy='226' r='2' fill='#222'/>
  </g>
  <g fill='#ffffff' opacity='.7'>
    <circle cx='90' cy='120' r='6'/><circle cx='80' cy='95' r='4'/><circle cx='88' cy='75' r='3'/>
    <circle cx='240' cy='190' r='5'/><circle cx='248' cy='168' r='3'/>
  </g>
  <g>
    <path d='M200 300 q20 -40 40 0 Z' fill='#b78cff'/>
    <g stroke='#b78cff' stroke-width='3' fill='none' stroke-linecap='round'>
      <path d='M205 300 q-4 14 2 24'/><path d='M215 300 q2 16 -2 26'/><path d='M225 300 q4 14 0 24'/><path d='M235 300 q4 12 8 20'/>
    </g>
  </g>
`);
