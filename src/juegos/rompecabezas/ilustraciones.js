// Más ilustraciones originales para el rompecabezas (SVG dibujado aquí mismo).
// Cada una tiene detalles distintos en cada zona para que las fichas se puedan diferenciar.
import { svg, ATARDECER, OCEANO } from './imagenes.js';

export const SELVA = svg(`
  <defs>
    <linearGradient id='c' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#bff3c3'/><stop offset='.5' stop-color='#57c27a'/><stop offset='1' stop-color='#1d6b3c'/>
    </linearGradient>
    <linearGradient id='cascada' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#e9fbff'/><stop offset='1' stop-color='#7fd6ef'/>
    </linearGradient>
  </defs>
  <rect width='400' height='400' fill='url(#c)'/>
  <g fill='#fff8c9' opacity='.45'>
    <path d='M250 0 L290 0 L200 260 L170 260Z'/><path d='M320 0 L345 0 L260 220 L240 220Z'/>
  </g>
  <path d='M120 120 Q200 60 280 120 L280 300 L120 300Z' fill='#4b7f52'/>
  <rect x='175' y='100' width='50' height='210' fill='url(#cascada)'/>
  <g stroke='#ffffff' stroke-width='3' opacity='.8'><path d='M185 110 v180'/><path d='M200 120 v190'/><path d='M214 105 v185'/></g>
  <path d='M0 300 Q100 280 200 300 T400 295 L400 400 L0 400Z' fill='#2f8fb2'/>
  <g fill='#ffffff' opacity='.5'><ellipse cx='200' cy='305' rx='50' ry='8'/><ellipse cx='90' cy='340' rx='30' ry='4'/><ellipse cx='310' cy='355' rx='36' ry='4'/></g>
  <rect x='40' y='40' width='26' height='280' fill='#6b4226'/><rect x='330' y='20' width='30' height='300' fill='#5a3820'/>
  <g fill='#1f7a3d'>
    <path d='M53 40 Q0 20 -10 70 Q30 50 53 60Z'/><path d='M53 45 Q110 0 140 40 Q90 40 53 62Z'/><path d='M53 50 Q20 110 0 120 Q40 70 55 70Z'/>
    <path d='M345 25 Q290 0 270 50 Q310 35 345 45Z'/><path d='M345 25 Q400 0 420 50 Q380 35 345 48Z'/>
  </g>
  <g fill='none' stroke='#2b6b2e' stroke-width='4' stroke-linecap='round'>
    <path d='M100 0 q-10 60 10 110'/><path d='M150 0 q12 50 -4 90'/><path d='M300 0 q-12 70 8 130'/>
  </g>
  <g fill='#3ba55c'><circle cx='110' cy='112' r='7'/><circle cx='146' cy='92' r='6'/><circle cx='308' cy='132' r='7'/></g>
  <g>
    <ellipse cx='92' cy='190' rx='16' ry='22' fill='#222'/><circle cx='92' cy='166' r='11' fill='#222'/>
    <path d='M98 162 q30 -6 34 8 q-20 4 -34 2Z' fill='#ff9f1a'/><path d='M100 166 q18 2 30 6' stroke='#d94f00' stroke-width='2' fill='none'/>
    <circle cx='96' cy='163' r='3' fill='#fff'/><path d='M84 196 q8 14 16 0' fill='#fff7c2'/>
    <path d='M80 210 L66 236' stroke='#6b4226' stroke-width='4'/>
  </g>
  <g fill='#8a5a33'>
    <circle cx='300' cy='200' r='16'/><circle cx='300' cy='182' r='12'/>
    <circle cx='291' cy='178' r='4' fill='#e8c39a'/><circle cx='309' cy='178' r='4' fill='#e8c39a'/>
    <path d='M314 210 q30 10 20 40' stroke='#8a5a33' stroke-width='5' fill='none'/>
  </g>
  <g>
    <circle cx='40' cy='350' r='10' fill='#ff4f8b'/><circle cx='40' cy='350' r='4' fill='#ffd23f'/>
    <circle cx='370' cy='340' r='9' fill='#ff7a1a'/><circle cx='370' cy='340' r='3.5' fill='#fff'/>
    <circle cx='140' cy='370' r='8' fill='#b14fff'/><circle cx='260' cy='378' r='8' fill='#ffd23f'/>
  </g>
  <g fill='#1a5c33'><path d='M0 400 Q30 330 70 400Z'/><path d='M330 400 Q370 320 400 360 L400 400Z'/></g>
  <path d='M230 340 q10 -8 20 0 q-10 8 -20 0Z' fill='#ff5a5a'/>
`);

export const CIUDAD = svg(`
  <defs>
    <linearGradient id='n' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#0b1033'/><stop offset='.6' stop-color='#2c2a7a'/><stop offset='1' stop-color='#6a3a8f'/>
    </linearGradient>
    <linearGradient id='r' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#2a2366'/><stop offset='1' stop-color='#0a0d2b'/>
    </linearGradient>
  </defs>
  <rect width='400' height='400' fill='url(#n)'/>
  <g fill='#fff'>
    <circle cx='30' cy='30' r='1.6'/><circle cx='90' cy='60' r='1.2'/><circle cx='150' cy='20' r='2'/><circle cx='210' cy='50' r='1.3'/>
    <circle cx='250' cy='15' r='1.6'/><circle cx='380' cy='70' r='1.4'/><circle cx='60' cy='100' r='1'/><circle cx='190' cy='95' r='1.2'/>
  </g>
  <circle cx='320' cy='70' r='34' fill='#fff4c7'/><circle cx='308' cy='60' r='6' fill='#e8d9a0'/><circle cx='330' cy='82' r='5' fill='#e8d9a0'/><circle cx='334' cy='56' r='3' fill='#e8d9a0'/>
  <g fill='#151640'>
    <rect x='0' y='150' width='50' height='120'/><rect x='50' y='110' width='40' height='160'/><rect x='90' y='170' width='45' height='100'/>
    <rect x='135' y='80' width='36' height='190'/><path d='M135 80 L153 40 L171 80Z'/><rect x='151' y='20' width='3' height='22'/>
    <rect x='171' y='140' width='50' height='130'/><rect x='221' y='100' width='44' height='170'/><rect x='265' y='160' width='40' height='110'/>
    <rect x='305' y='120' width='50' height='150'/><rect x='355' y='175' width='45' height='95'/>
  </g>
  <g fill='#ffd45c'>
    <rect x='8' y='165' width='8' height='8'/><rect x='26' y='185' width='8' height='8'/><rect x='8' y='215' width='8' height='8'/>
    <rect x='58' y='125' width='7' height='9'/><rect x='74' y='150' width='7' height='9'/><rect x='58' y='190' width='7' height='9'/><rect x='74' y='225' width='7' height='9'/>
    <rect x='100' y='185' width='9' height='7'/><rect x='118' y='210' width='9' height='7'/>
    <rect x='142' y='100' width='6' height='10'/><rect x='158' y='130' width='6' height='10'/><rect x='142' y='175' width='6' height='10'/><rect x='158' y='220' width='6' height='10'/>
    <rect x='180' y='155' width='10' height='8'/><rect x='200' y='180' width='10' height='8'/><rect x='180' y='230' width='10' height='8'/>
    <rect x='230' y='115' width='8' height='8'/><rect x='248' y='140' width='8' height='8'/><rect x='230' y='200' width='8' height='8'/>
    <rect x='275' y='175' width='7' height='7'/><rect x='290' y='210' width='7' height='7'/>
    <rect x='315' y='135' width='9' height='9'/><rect x='335' y='170' width='9' height='9'/><rect x='315' y='220' width='9' height='9'/>
    <rect x='365' y='190' width='8' height='8'/><rect x='382' y='230' width='8' height='8'/>
  </g>
  <g fill='#7ef0ff'><rect x='226' y='240' width='34' height='5'/><rect x='58' y='250' width='24' height='4'/></g>
  <rect y='270' width='400' height='130' fill='url(#r)'/>
  <path d='M0 270 L400 270 L400 280 L0 280Z' fill='#3b3570'/>
  <g fill='none' stroke='#e24bb5' stroke-width='5'>
    <path d='M40 270 Q120 200 200 270'/><path d='M200 270 Q280 200 360 270'/>
  </g>
  <g stroke='#e24bb5' stroke-width='2'><path d='M80 247 v23'/><path d='M120 235 v35'/><path d='M160 247 v23'/><path d='M240 247 v23'/><path d='M280 235 v35'/><path d='M320 247 v23'/></g>
  <g opacity='.5'>
    <rect x='142' y='290' width='6' height='40' fill='#ffd45c'/><rect x='58' y='292' width='7' height='30' fill='#ffd45c'/>
    <rect x='315' y='292' width='9' height='34' fill='#ffd45c'/><rect x='300' y='300' width='40' height='3' fill='#fff4c7'/>
    <rect x='290' y='330' width='60' height='3' fill='#fff4c7'/>
  </g>
  <g fill='#e24bb5' opacity='.35'><path d='M40 290 Q120 350 200 290'/><path d='M200 290 Q280 350 360 290'/></g>
  <rect y='370' width='400' height='30' fill='#1b1a3a'/>
  <rect x='40' y='376' width='46' height='16' rx='6' fill='#e03a3a'/><rect x='240' y='378' width='40' height='14' rx='6' fill='#2a9df4'/>
  <g fill='#ffef8a'><circle cx='84' cy='384' r='4'/><circle cx='42' cy='384' r='3'/></g>
  <g fill='#ff4a4a'><circle cx='242' cy='386' r='3.5'/></g>
`);

export const ESPACIO = svg(`
  <defs>
    <radialGradient id='neb' cx='.3' cy='.35' r='.6'>
      <stop offset='0' stop-color='#b14fff' stop-opacity='.8'/><stop offset='1' stop-color='#b14fff' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='neb2' cx='.75' cy='.6' r='.5'>
      <stop offset='0' stop-color='#22d3ee' stop-opacity='.6'/><stop offset='1' stop-color='#22d3ee' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='pl' cx='.35' cy='.35'><stop offset='0' stop-color='#ffd27f'/><stop offset='1' stop-color='#d0631a'/></radialGradient>
    <radialGradient id='tierra' cx='.35' cy='.35'><stop offset='0' stop-color='#7fe3ff'/><stop offset='1' stop-color='#1d5fb8'/></radialGradient>
  </defs>
  <rect width='400' height='400' fill='#070718'/>
  <rect width='400' height='400' fill='url(#neb)'/><rect width='400' height='400' fill='url(#neb2)'/>
  <g fill='#fff'>
    <circle cx='20' cy='20' r='1.5'/><circle cx='70' cy='140' r='1'/><circle cx='120' cy='40' r='2'/><circle cx='200' cy='90' r='1.2'/>
    <circle cx='240' cy='30' r='1.6'/><circle cx='300' cy='220' r='1'/><circle cx='370' cy='30' r='2'/><circle cx='360' cy='200' r='1.3'/>
    <circle cx='30' cy='250' r='1.4'/><circle cx='170' cy='140' r='1'/><circle cx='250' cy='260' r='1.6'/><circle cx='100' cy='300' r='1.2'/>
  </g>
  <path d='M220 60 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4Z' fill='#fff7c2'/>
  <circle cx='300' cy='130' r='48' fill='url(#pl)'/>
  <ellipse cx='300' cy='130' rx='80' ry='18' transform='rotate(-15 300 130)' fill='none' stroke='#ffe1a8' stroke-width='6' opacity='.85'/>
  <path d='M262 118 q40 -10 76 6' stroke='#b9531a' stroke-width='5' fill='none' opacity='.6'/>
  <circle cx='80' cy='90' r='30' fill='url(#tierra)'/>
  <path d='M64 76 q10 -6 18 4 q-4 10 -14 8Z M86 98 q10 -4 12 6 q-8 6 -14 0Z' fill='#4ade80'/>
  <g transform='rotate(35 170 210)'>
    <rect x='155' y='170' width='30' height='70' rx='14' fill='#f2f2f2'/>
    <path d='M155 190 Q170 130 185 190Z' fill='#ff4a4a'/>
    <circle cx='170' cy='200' r='8' fill='#5cc8ff' stroke='#99aaaa' stroke-width='3'/>
    <path d='M155 225 l-14 22 l14 -6Z M185 225 l14 22 l-14 -6Z' fill='#ff4a4a'/>
    <path d='M160 240 q10 40 20 0Z' fill='#ffb020'/><path d='M164 240 q6 24 12 0Z' fill='#fff3a0'/>
  </g>
  <path d='M0 330 Q100 300 200 320 T400 310 L400 400 L0 400Z' fill='#9c9cb3'/>
  <g fill='#7a7a92'>
    <ellipse cx='70' cy='350' rx='26' ry='8'/><ellipse cx='210' cy='370' rx='34' ry='9'/><ellipse cx='330' cy='345' rx='20' ry='6'/><ellipse cx='140' cy='385' rx='14' ry='4'/>
  </g>
  <g>
    <circle cx='300' cy='290' r='14' fill='#fff'/><rect x='288' y='300' width='24' height='26' rx='6' fill='#fff'/>
    <rect x='292' y='285' width='16' height='10' rx='4' fill='#2a2a6a'/>
    <rect x='280' y='305' width='8' height='16' rx='4' fill='#eee'/><rect x='312' y='305' width='8' height='16' rx='4' fill='#eee'/>
    <rect x='290' y='326' width='8' height='12' fill='#ddd'/><rect x='302' y='326' width='8' height='12' fill='#ddd'/>
    <rect x='326' y='270' width='3' height='60' fill='#ccc'/><path d='M329 270 h26 v16 h-26Z' fill='#ff4a4a'/>
  </g>
`);

export const MONTANAS = svg(`
  <defs>
    <linearGradient id='c' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#7ec8ff'/><stop offset='1' stop-color='#e8f6ff'/>
    </linearGradient>
    <linearGradient id='lago' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#4aa3d8'/><stop offset='1' stop-color='#1b5a8a'/>
    </linearGradient>
  </defs>
  <rect width='400' height='400' fill='url(#c)'/>
  <circle cx='60' cy='60' r='26' fill='#fff3a0'/>
  <g fill='#fff'>
    <ellipse cx='150' cy='60' rx='40' ry='14'/><ellipse cx='180' cy='52' rx='26' ry='12'/>
    <ellipse cx='320' cy='40' rx='36' ry='12'/><ellipse cx='345' cy='34' rx='20' ry='10'/>
  </g>
  <path d='M0 230 L80 110 L140 190 L210 70 L290 180 L340 120 L400 200 L400 240 L0 240Z' fill='#6c7a99'/>
  <g fill='#fff'>
    <path d='M80 110 L62 137 L74 132 L84 142 L96 130 Z'/><path d='M210 70 L180 115 L198 108 L212 122 L226 106 L240 114Z'/>
    <path d='M340 120 L322 147 L336 142 L346 152 L358 140Z'/>
  </g>
  <path d='M0 250 L60 190 L120 240 L180 170 L250 245 L320 190 L400 245 L400 260 L0 260Z' fill='#4d5d7d'/>
  <g fill='#2f6b3a'>
    <path d='M10 260 l12 -36 l12 36Z'/><path d='M30 262 l14 -44 l14 44Z'/><path d='M60 260 l10 -30 l10 30Z'/>
    <path d='M300 262 l12 -40 l12 40Z'/><path d='M330 262 l14 -48 l14 48Z'/><path d='M362 260 l12 -34 l12 34Z'/>
  </g>
  <rect y='260' width='400' height='90' fill='url(#lago)'/>
  <path d='M0 260 L80 330 L140 290 L210 350 L290 295 L340 325 L400 285 L400 260Z' fill='#e8f6ff' opacity='.35'/>
  <g fill='#fff' opacity='.6'><rect x='120' y='300' width='60' height='3' rx='1.5'/><rect x='240' y='320' width='50' height='3' rx='1.5'/></g>
  <path d='M0 340 Q100 330 200 345 T400 340 L400 400 L0 400Z' fill='#5fa443'/>
  <g>
    <rect x='160' y='340' width='60' height='38' fill='#8b4a2b'/><path d='M150 342 L190 310 L230 342Z' fill='#5a2a16'/>
    <rect x='182' y='356' width='16' height='22' fill='#3b1d0e'/><rect x='166' y='350' width='12' height='10' fill='#ffd45c'/><rect x='204' y='350' width='12' height='10' fill='#ffd45c'/>
    <rect x='206' y='312' width='8' height='18' fill='#5a2a16'/><path d='M210 300 q6 -6 0 -12 q8 4 4 12' fill='#cfd8dc'/>
  </g>
  <g fill='#2f6b3a'><path d='M100 390 l14 -46 l14 46Z'/><path d='M260 392 l14 -50 l14 50Z'/><path d='M30 395 l12 -36 l12 36Z'/></g>
  <path d='M270 90 q10 -10 20 0 q10 -10 20 0' stroke='#333' stroke-width='3' fill='none'/>
  <g fill='#ff6b6b'><circle cx='240' cy='380' r='4'/><circle cx='70' cy='372' r='4'/><circle cx='340' cy='378' r='4'/></g>
`);

export const GRANJA = svg(`
  <defs>
    <linearGradient id='c' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#ffd9a0'/><stop offset='1' stop-color='#9fe0ff'/>
    </linearGradient>
  </defs>
  <rect width='400' height='400' fill='url(#c)'/>
  <circle cx='330' cy='60' r='30' fill='#ffcf4a'/>
  <g stroke='#ffcf4a' stroke-width='4' stroke-linecap='round'><path d='M330 20 v-12'/><path d='M372 60 h12'/><path d='M360 30 l8 -8'/><path d='M360 90 l8 8'/><path d='M288 60 h-12'/></g>
  <path d='M0 200 Q100 160 200 190 T400 180 L400 400 L0 400Z' fill='#8ed16a'/>
  <g fill='none' stroke='#6fb04d' stroke-width='6'><path d='M0 300 Q200 270 400 295'/><path d='M0 340 Q200 315 400 335'/><path d='M0 380 Q200 360 400 378'/></g>
  <path d='M220 200 Q300 180 400 190 L400 240 Q300 230 220 240Z' fill='#f2c94c'/>
  <g>
    <rect x='60' y='130' width='110' height='90' fill='#c0392b'/><path d='M50 135 L115 85 L180 135Z' fill='#8e2a20'/>
    <rect x='95' y='160' width='40' height='60' fill='#f5e6c8'/><path d='M95 160 L135 220 M135 160 L95 220' stroke='#c0392b' stroke-width='5'/>
    <rect x='103' y='110' width='24' height='18' fill='#f5e6c8'/>
  </g>
  <g>
    <rect x='265' y='100' width='16' height='110' fill='#b0b0b0'/>
    <g fill='#e0e0e0' stroke='#888' stroke-width='2' transform='translate(273 100)'>
      <path d='M0 0 L-8 -50 L8 -50Z'/><path d='M0 0 L50 -8 L50 8Z'/><path d='M0 0 L8 50 L-8 50Z'/><path d='M0 0 L-50 8 L-50 -8Z'/>
    </g>
    <circle cx='273' cy='100' r='6' fill='#555'/>
  </g>
  <g stroke='#8b5a2b' stroke-width='5'>
    <path d='M0 250 H400'/><path d='M0 272 H400'/>
    <path d='M20 240 v42'/><path d='M80 240 v42'/><path d='M140 240 v42'/><path d='M200 240 v42'/><path d='M260 240 v42'/><path d='M320 240 v42'/><path d='M380 240 v42'/>
  </g>
  <g>
    <ellipse cx='110' cy='320' rx='44' ry='26' fill='#fff'/>
    <ellipse cx='96' cy='312' rx='12' ry='9' fill='#222'/><ellipse cx='126' cy='330' rx='10' ry='7' fill='#222'/>
    <ellipse cx='60' cy='305' rx='18' ry='15' fill='#fff'/><ellipse cx='52' cy='312' rx='10' ry='7' fill='#ffb3c1'/>
    <circle cx='58' cy='298' r='3' fill='#222'/>
    <rect x='80' y='340' width='8' height='22' fill='#fff'/><rect x='130' y='340' width='8' height='22' fill='#fff'/>
  </g>
  <g>
    <ellipse cx='300' cy='350' rx='18' ry='14' fill='#fff'/><circle cx='314' cy='336' r='9' fill='#fff'/>
    <path d='M320 334 l8 3 l-8 3Z' fill='#ff9f1a'/><path d='M310 326 q4 -8 8 0' fill='#e74c3c'/>
    <ellipse cx='350' cy='362' rx='14' ry='11' fill='#d4a373'/><circle cx='361' cy='351' r='7' fill='#d4a373'/>
    <path d='M366 350 l7 2 l-7 3Z' fill='#ff9f1a'/>
  </g>
  <g>
    <rect x='190' y='310' width='50' height='34' rx='6' fill='#e9c46a'/>
    <g stroke='#c99a3a' stroke-width='2'><path d='M198 316 v22'/><path d='M215 316 v22'/><path d='M232 316 v22'/></g>
  </g>
  <g fill='#fff'><ellipse cx='120' cy='50' rx='32' ry='12'/><ellipse cx='145' cy='42' rx='20' ry='10'/></g>
`);

export const VOLCAN = svg(`
  <defs>
    <linearGradient id='c' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#3a1c4a'/><stop offset='.6' stop-color='#d9544f'/><stop offset='1' stop-color='#ffb067'/>
    </linearGradient>
    <linearGradient id='lava' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#fff27a'/><stop offset='.4' stop-color='#ff8a1a'/><stop offset='1' stop-color='#d62d0b'/>
    </linearGradient>
  </defs>
  <rect width='400' height='400' fill='url(#c)'/>
  <g fill='#5b4a5e' opacity='.9'>
    <circle cx='200' cy='70' r='34'/><circle cx='235' cy='45' r='28'/><circle cx='170' cy='40' r='24'/><circle cx='260' cy='80' r='22'/><circle cx='140' cy='80' r='18'/>
  </g>
  <g fill='#ff8a1a'><circle cx='150' cy='110' r='5'/><circle cx='260' cy='120' r='6'/><circle cx='230' cy='100' r='4'/><circle cx='175' cy='95' r='3'/></g>
  <path d='M60 300 L170 130 L230 130 L340 300Z' fill='#4a2c2a'/>
  <path d='M170 130 L230 130 L220 145 L180 145Z' fill='#ff8a1a'/>
  <path d='M190 140 Q180 200 150 230 Q140 260 120 300 L150 300 Q170 250 185 225 Q205 190 205 140Z' fill='url(#lava)'/>
  <path d='M212 140 Q230 190 260 220 Q275 250 300 300 L280 300 Q258 255 245 235 Q220 200 210 145Z' fill='url(#lava)'/>
  <g fill='#6b4440'><path d='M90 300 L120 255 L135 300Z'/><path d='M300 300 L280 260 L265 300Z'/></g>
  <path d='M0 300 Q100 285 200 300 T400 295 L400 400 L0 400Z' fill='#1e6f8f'/>
  <g fill='#ff8a1a' opacity='.45'><ellipse cx='140' cy='318' rx='40' ry='5'/><ellipse cx='290' cy='325' rx='34' ry='5'/></g>
  <path d='M0 350 Q60 330 130 345 Q140 380 120 400 L0 400Z' fill='#e7c27d'/>
  <g>
    <path d='M50 360 q4 -40 -6 -80' stroke='#7a4b23' stroke-width='7' fill='none'/>
    <g fill='#2e8b57'><path d='M44 282 q-30 -10 -44 10 q20 -4 44 -4Z'/><path d='M44 282 q30 -14 46 6 q-22 -2 -46 -2Z'/><path d='M44 282 q-10 -30 10 -40 q-6 20 -6 40Z'/></g>
    <g fill='#8b4513'><circle cx='42' cy='288' r='4'/><circle cx='50' cy='290' r='4'/></g>
  </g>
  <g fill='#3a7d44'>
    <ellipse cx='330' cy='370' rx='40' ry='16'/><path d='M360 365 q30 -40 20 -70 q-10 30 -30 50Z'/><circle cx='378' cy='296' r='10'/>
    <rect x='308' y='378' width='8' height='18'/><rect x='340' y='378' width='8' height='18'/><path d='M292 368 q-30 6 -40 -6 q20 0 40 -4Z'/>
  </g>
  <circle cx='382' cy='293' r='2.5' fill='#fff'/>
  <g fill='#fff' opacity='.6'><rect x='200' y='340' width='40' height='3' rx='1.5'/><rect x='170' y='370' width='30' height='3' rx='1.5'/></g>
`);

export const CASTILLO = svg(`
  <defs>
    <linearGradient id='c' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#ffb6e1'/><stop offset='.6' stop-color='#c3a6ff'/><stop offset='1' stop-color='#8fd3ff'/>
    </linearGradient>
  </defs>
  <rect width='400' height='400' fill='url(#c)'/>
  <g fill='#fff' opacity='.85'><ellipse cx='70' cy='70' rx='40' ry='14'/><ellipse cx='95' cy='60' rx='24' ry='12'/><ellipse cx='330' cy='120' rx='34' ry='12'/></g>
  <g>
    <ellipse cx='345' cy='40' rx='18' ry='22' fill='#ff4f8b'/><path d='M335 60 L355 60 L349 72 L341 72Z' fill='#b5651d'/>
    <ellipse cx='40' cy='150' rx='12' ry='15' fill='#ffd23f'/><path d='M34 164 L46 164 L42 172 L38 172Z' fill='#b5651d'/>
  </g>
  <path d='M0 290 Q100 250 200 270 T400 260 L400 400 L0 400Z' fill='#6cc36c'/>
  <g fill='#d8d2e6' stroke='#a59bbd' stroke-width='2'>
    <rect x='110' y='150' width='180' height='140'/>
    <rect x='80' y='110' width='50' height='180'/><rect x='270' y='110' width='50' height='180'/><rect x='175' y='90' width='50' height='80'/>
  </g>
  <g fill='#8e7bd1'>
    <path d='M75 112 L105 60 L135 112Z'/><path d='M265 112 L295 60 L325 112Z'/><path d='M170 92 L200 40 L230 92Z'/>
  </g>
  <g fill='#a59bbd'>
    <rect x='134' y='140' width='14' height='12'/><rect x='158' y='140' width='14' height='12'/>
    <rect x='228' y='140' width='14' height='12'/><rect x='252' y='140' width='14' height='12'/>
  </g>
  <g>
    <rect x='104' y='34' width='2' height='28' fill='#555'/><path d='M106 34 l22 7 l-22 7Z' fill='#ff4f8b'/>
    <rect x='294' y='34' width='2' height='28' fill='#555'/><path d='M296 34 l22 7 l-22 7Z' fill='#4fb3ff'/>
    <rect x='199' y='14' width='2' height='28' fill='#555'/><path d='M201 14 l22 7 l-22 7Z' fill='#ffd23f'/>
  </g>
  <g fill='#4a3b6b'>
    <path d='M98 150 a7 9 0 0 1 14 0 v16 h-14Z'/><path d='M288 150 a7 9 0 0 1 14 0 v16 h-14Z'/>
    <path d='M193 115 a7 9 0 0 1 14 0 v16 h-14Z'/><path d='M140 190 a7 9 0 0 1 14 0 v16 h-14Z'/><path d='M246 190 a7 9 0 0 1 14 0 v16 h-14Z'/>
  </g>
  <path d='M175 290 v-50 a25 25 0 0 1 50 0 v50Z' fill='#6b4226'/>
  <g stroke='#3b2414' stroke-width='2'><path d='M185 245 v45'/><path d='M200 236 v54'/><path d='M215 245 v45'/></g>
  <path d='M60 300 Q200 280 340 300 Q350 320 340 330 Q200 310 60 330 Q50 320 60 300Z' fill='#4fb3ff'/>
  <rect x='176' y='290' width='48' height='40' fill='#8b5a2b'/>
  <g stroke='#5a3a1c' stroke-width='2'><path d='M176 300 h48'/><path d='M176 312 h48'/><path d='M176 324 h48'/></g>
  <g>
    <path d='M310 230 q20 -20 40 -10 q-10 -20 10 -30 q10 20 -6 40 q20 10 30 0 q-6 24 -40 20 q-20 0 -34 -20Z' fill='#3cb371'/>
    <circle cx='360' cy='196' r='3' fill='#222'/><path d='M318 228 l-14 -10 l18 2Z' fill='#ff8a1a'/>
    <path d='M332 212 l8 -14 l6 14Z M346 206 l8 -14 l6 14Z' fill='#2e8b57'/>
  </g>
  <g fill='#ff4f8b'><circle cx='60' cy='360' r='6'/><circle cx='120' cy='375' r='6'/><circle cx='300' cy='370' r='6'/><circle cx='360' cy='355' r='6'/></g>
  <g fill='#ffd23f'><circle cx='60' cy='360' r='2'/><circle cx='120' cy='375' r='2'/><circle cx='300' cy='370' r='2'/><circle cx='360' cy='355' r='2'/></g>
`);

export const DESIERTO = svg(`
  <defs>
    <linearGradient id='c' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#ff9a3c'/><stop offset='.5' stop-color='#ffd07a'/><stop offset='1' stop-color='#fff1c9'/>
    </linearGradient>
  </defs>
  <rect width='400' height='400' fill='url(#c)'/>
  <circle cx='300' cy='110' r='58' fill='#fff6c2' opacity='.3'/><circle cx='300' cy='110' r='44' fill='#fff6c2'/>
  <path d='M120 220 L190 120 L260 220Z' fill='#c97b36'/>
  <path d='M190 120 L260 220 L210 220Z' fill='#a15e24'/>
  <g stroke='#8a4d1c' stroke-width='1.5' opacity='.6'><path d='M150 180 h80'/><path d='M135 200 h110'/><path d='M165 160 h50'/></g>
  <path d='M40 225 L80 170 L120 225Z' fill='#d58a46'/><path d='M80 170 L120 225 L95 225Z' fill='#a96428'/>
  <path d='M0 230 Q80 200 170 230 T400 220 L400 400 L0 400Z' fill='#f2b65a'/>
  <path d='M0 290 Q120 250 230 290 T400 280 L400 400 L0 400Z' fill='#e39b3f'/>
  <path d='M0 350 Q100 320 200 350 T400 340 L400 400 L0 400Z' fill='#cf8530'/>
  <g fill='none' stroke='#b9702a' stroke-width='2' opacity='.6'><path d='M30 320 q20 -6 40 0'/><path d='M260 380 q20 -6 40 0'/><path d='M150 370 q16 -5 32 0'/></g>
  <g fill='#3f9b4f'>
    <rect x='60' y='250' width='16' height='70' rx='8'/><rect x='40' y='265' width='12' height='30' rx='6'/><rect x='84' y='258' width='12' height='26' rx='6'/>
    <rect x='48' y='288' width='16' height='10' rx='5'/><rect x='72' y='278' width='16' height='10' rx='5'/>
    <rect x='340' y='270' width='14' height='60' rx='7'/><rect x='322' y='282' width='10' height='24' rx='5'/><rect x='330' y='300' width='14' height='8' rx='4'/>
  </g>
  <g fill='#ff5f8f'><circle cx='68' cy='250' r='4'/><circle cx='347' cy='270' r='4'/></g>
  <g fill='#9c5a2a'>
    <ellipse cx='210' cy='300' rx='40' ry='16'/><path d='M190 292 q10 -26 20 0Z'/><path d='M215 290 q10 -22 20 0Z'/>
    <path d='M250 296 q14 -6 14 -30 q10 0 12 10 l-8 4 q0 18 -12 24Z'/>
    <rect x='182' y='310' width='6' height='26'/><rect x='198' y='312' width='6' height='26'/><rect x='222' y='312' width='6' height='26'/><rect x='238' y='310' width='6' height='26'/>
  </g>
  <circle cx='271' cy='271' r='2' fill='#222'/>
  <g>
    <ellipse cx='120' cy='375' rx='50' ry='10' fill='#4fb3d8'/>
    <path d='M140 370 q-4 -40 10 -70' stroke='#7a4b23' stroke-width='5' fill='none'/>
    <g fill='#2e8b57'><path d='M150 300 q-26 -6 -36 10 q16 -4 36 -4Z'/><path d='M150 300 q24 -10 36 6 q-18 -2 -36 -2Z'/><path d='M150 300 q-4 -24 12 -30 q-6 16 -8 30Z'/></g>
  </g>
  <g fill='none' stroke='#5a3a1c' stroke-width='2.5'><path d='M60 70 q8 -8 16 0 q8 -8 16 0'/><path d='M110 50 q6 -6 12 0 q6 -6 12 0'/></g>
`);

// Todas las imágenes disponibles (id -> datos). El orden es el de los botones.
export const IMAGENES = {
  atardecer: { nombre: 'Atardecer', icono: '🌅', imagen: ATARDECER },
  oceano: { nombre: 'Océano', icono: '🐠', imagen: OCEANO },
  selva: { nombre: 'Selva', icono: '🌴', imagen: SELVA },
  ciudad: { nombre: 'Ciudad', icono: '🌃', imagen: CIUDAD },
  espacio: { nombre: 'Espacio', icono: '🚀', imagen: ESPACIO },
  montanas: { nombre: 'Montañas', icono: '⛰️', imagen: MONTANAS },
  granja: { nombre: 'Granja', icono: '🐄', imagen: GRANJA },
  volcan: { nombre: 'Volcán', icono: '🌋', imagen: VOLCAN },
  castillo: { nombre: 'Castillo', icono: '🏰', imagen: CASTILLO },
  desierto: { nombre: 'Desierto', icono: '🐪', imagen: DESIERTO },
};
