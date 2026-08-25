/**
 * Vocabulario ilustrado: palabras japonesas comunes con un ícono o muestra
 * de color a modo de "imagen". Cada palabra se clasifica según el tipo de
 * kana más complejo que aparece en su lectura (mismos grupos que en
 * data.js), para poder reusar los mismos filtros de Estudio/Práctica:
 *   - basic:       la lectura solo usa gojūon (p. ej. はな)
 *   - dakuten:     contiene al menos un carácter con dakuten (゛)
 *   - handakuten:  contiene al menos un carácter con handakuten (゜)
 *   - yoon:        contiene al menos un carácter combinado (きゃ, しゃ…)
 *
 * `visual` es o bien un ícono SVG en línea ({ type: 'icon', svg }) o una
 * muestra de color sólida ({ type: 'color', hex }), útil para vocabulario
 * de colores donde el "dibujo" es literalmente el color.
 */

const ICONS = {
  flower:
    '<circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="12" cy="6.5" r="3" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="12" cy="17.5" r="3" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="6.5" cy="12" r="3" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="17.5" cy="12" r="3" stroke="currentColor" stroke-width="1.4" fill="none"/>',
  dandelion:
    '<path d="M12 21V11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="12" cy="8" r="0.8" fill="currentColor"/><path d="M12 4.5v-1.5M9 5.5 8 4.3M15 5.5l1-1.2M8.3 8H6.8M17.2 8h-1.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>',
  mountain:
    '<path d="M3 18L9.5 7l4 6.5L16 9l5 9H3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>',
  waterDrop:
    '<path d="M12 3c3.5 4.5 6 7.8 6 11a6 6 0 1 1-12 0c0-3.2 2.5-6.5 6-11Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>',
  apple:
    '<path d="M12 8.5c-2.5-2-6-1-6 3 0 4 3 8.5 6 8.5s6-4.5 6-8.5c0-4-3.5-5-6-3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/><path d="M12 8.5V5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 5.5c1-1.3 2.2-1.6 3-1.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>',
  wind:
    '<path d="M3 9h11a3 3 0 1 0-2.5-4.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M3 14h15a3 3 0 1 1-2.5 4.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>',
  hat:
    '<path d="M4 16.5c0-4 3.5-8 8-8s8 4 8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><rect x="3" y="16" width="18" height="2.4" rx="1.2" fill="currentColor"/>',
  bread:
    '<path d="M4 12c0-4 3-7 8-7s8 3 8 7v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/><path d="M9 10.5v4M12 9.5v5M15 10.5v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  pencil:
    '<path d="M4 20l1-4.2L15.6 5.2a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>',
  panda:
    '<circle cx="12" cy="13" r="7" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="6.5" cy="6.5" r="2.3" fill="currentColor"/><circle cx="17.5" cy="6.5" r="2.3" fill="currentColor"/><ellipse cx="9" cy="13.5" rx="1.6" ry="2" fill="currentColor"/><ellipse cx="15" cy="13.5" rx="1.6" ry="2" fill="currentColor"/>',
  cucumber:
    '<path d="M5 17c0-6 3-11 9-12.5 2.5 1 3.5 3 3 5.5C15.5 14 10.5 18.5 5 17Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>',
  bicycle:
    '<circle cx="6" cy="17" r="3.2" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="18" cy="17" r="3.2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M6 17l4.5-8h4L12 17M10.5 9H8.5M14.5 9l3 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  camera:
    '<rect x="3" y="7.5" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M8 7.5l1.3-2.2h5.4L16 7.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/><circle cx="12" cy="13.5" r="3.3" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  photo:
    '<rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="8.5" cy="10" r="1.6" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M4 16.5l4.5-4.5 3 3 4-4.5 5.5 5.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>',
};

function icon(name) {
  return { type: 'icon', svg: ICONS[name] };
}

function color(hex) {
  return { type: 'color', hex };
}

/**
 * Para usar una foto real en vez de un ícono dibujado: descárgala a
 * assets/vocab/<archivo>.jpg y usa image('assets/vocab/<archivo>.jpg', 'texto alternativo').
 * Debe ser una ruta local del repo (no una URL externa), ver README para detalles.
 */
function image(src, alt) {
  return { type: 'image', src, alt };
}

/** Ilustración de OpenMoji ya descargada en assets/vocab/<romaji>.svg (ver README). */
function openmoji(romaji, alt) {
  return { type: 'image', src: `assets/vocab/${romaji}.svg`, alt };
}

export const VOCAB = [
  // --- básico (solo gojūon) ---
  { hiragana: 'はな', romaji: 'hana', meaning: 'flor', group: 'basic', visual: icon('flower') },
  { hiragana: 'あお', romaji: 'ao', meaning: 'azul', group: 'basic', visual: color('#2f6fed') },
  { hiragana: 'やま', romaji: 'yama', meaning: 'montaña', group: 'basic', visual: icon('mountain') },
  { hiragana: 'みず', romaji: 'mizu', meaning: 'agua', group: 'basic', visual: icon('waterDrop') },
  // usa tu foto assets/vocab/inu.png (se detecta sola); inu.svg queda de respaldo
  { hiragana: 'いぬ', romaji: 'inu', meaning: 'perro', group: 'basic', visual: icon('photo') },
  { hiragana: 'ねこ', romaji: 'neko', meaning: 'gato', group: 'basic', visual: openmoji('neko', 'Gato') },
  { hiragana: 'とり', romaji: 'tori', meaning: 'pájaro', group: 'basic', visual: openmoji('tori', 'Pájaro') },
  { hiragana: 'さかな', romaji: 'sakana', meaning: 'pez', group: 'basic', visual: openmoji('sakana', 'Pez') },
  { hiragana: 'たいよう', romaji: 'taiyou', meaning: 'sol', group: 'basic', visual: openmoji('taiyou', 'Sol') },
  { hiragana: 'つき', romaji: 'tsuki', meaning: 'luna', group: 'basic', visual: openmoji('tsuki', 'Luna') },
  { hiragana: 'ほし', romaji: 'hoshi', meaning: 'estrella', group: 'basic', visual: openmoji('hoshi', 'Estrella') },
  { hiragana: 'あめ', romaji: 'ame', meaning: 'lluvia', group: 'basic', visual: openmoji('ame', 'Lluvia') },
  // usa tu foto assets/vocab/yuki.jpg (se detecta sola); yuki.svg queda de respaldo
  { hiragana: 'ゆき', romaji: 'yuki', meaning: 'nieve', group: 'basic', visual: icon('photo') },
  // las siguientes 4 usan tus fotos en assets/vocab/<romaji>.{jpg,png,webp} (se detectan solas)
  { hiragana: 'さくら', romaji: 'sakura', meaning: 'cerezo (flor)', group: 'basic', visual: icon('photo') },
  { hiragana: 'すいか', romaji: 'suika', meaning: 'sandía', group: 'basic', visual: icon('photo') },
  { hiragana: 'ひまわり', romaji: 'himawari', meaning: 'girasol', group: 'basic', visual: icon('photo') },
  { hiragana: 'うるさい', romaji: 'urusai', meaning: 'ruidoso / ¡cállate!', group: 'basic', visual: icon('photo') },
  { hiragana: 'き', romaji: 'ki', meaning: 'árbol', group: 'basic', visual: openmoji('ki', 'Árbol') },
  { hiragana: 'うみ', romaji: 'umi', meaning: 'mar', group: 'basic', visual: openmoji('umi', 'Mar') },
  { hiragana: 'そら', romaji: 'sora', meaning: 'cielo', group: 'basic', visual: openmoji('sora', 'Cielo') },
  { hiragana: 'くるま', romaji: 'kuruma', meaning: 'auto', group: 'basic', visual: openmoji('kuruma', 'Auto') },
  { hiragana: 'いえ', romaji: 'ie', meaning: 'casa', group: 'basic', visual: openmoji('ie', 'Casa') },
  { hiragana: 'て', romaji: 'te', meaning: 'mano', group: 'basic', visual: openmoji('te', 'Mano') },
  { hiragana: 'め', romaji: 'me', meaning: 'ojo', group: 'basic', visual: openmoji('me', 'Ojo') },
  { hiragana: 'くち', romaji: 'kuchi', meaning: 'boca', group: 'basic', visual: openmoji('kuchi', 'Boca') },
  { hiragana: 'くま', romaji: 'kuma', meaning: 'oso', group: 'basic', visual: openmoji('kuma', 'Oso') },

  // --- dakuten ---
  { hiragana: 'りんご', romaji: 'ringo', meaning: 'manzana', group: 'dakuten', visual: icon('apple') },
  { hiragana: 'みどり', romaji: 'midori', meaning: 'verde', group: 'dakuten', visual: color('#2f9e58') },
  { hiragana: 'かぜ', romaji: 'kaze', meaning: 'viento', group: 'dakuten', visual: icon('wind') },
  { hiragana: 'ぼうし', romaji: 'boushi', meaning: 'sombrero', group: 'dakuten', visual: icon('hat') },
  { hiragana: 'たまご', romaji: 'tamago', meaning: 'huevo', group: 'dakuten', visual: openmoji('tamago', 'Huevo') },
  { hiragana: 'うさぎ', romaji: 'usagi', meaning: 'conejo', group: 'dakuten', visual: openmoji('usagi', 'Conejo') },
  { hiragana: 'ぞう', romaji: 'zou', meaning: 'elefante', group: 'dakuten', visual: openmoji('zou', 'Elefante') },

  // --- handakuten ---
  { hiragana: 'ぱん', romaji: 'pan', meaning: 'pan', group: 'handakuten', visual: icon('bread') },
  { hiragana: 'えんぴつ', romaji: 'enpitsu', meaning: 'lápiz', group: 'handakuten', visual: icon('pencil') },
  { hiragana: 'たんぽぽ', romaji: 'tanpopo', meaning: 'diente de león', group: 'handakuten', visual: icon('dandelion') },
  { hiragana: 'ぱんだ', romaji: 'panda', meaning: 'panda', group: 'handakuten', visual: icon('panda') },
  { hiragana: 'かんぱい', romaji: 'kanpai', meaning: '¡salud! (brindis)', group: 'handakuten', visual: openmoji('kanpai', 'Brindis') },
  { hiragana: 'さんぽ', romaji: 'sanpo', meaning: 'paseo', group: 'handakuten', visual: openmoji('sanpo', 'Paseo') },

  // --- yōon (combinados) ---
  { hiragana: 'ちゃいろ', romaji: 'chairo', meaning: 'marrón', group: 'yoon', visual: color('#8a5a34') },
  { hiragana: 'きゅうり', romaji: 'kyuuri', meaning: 'pepino', group: 'yoon', visual: icon('cucumber') },
  { hiragana: 'じてんしゃ', romaji: 'jitensha', meaning: 'bicicleta', group: 'yoon', visual: icon('bicycle') },
  { hiragana: 'しゃしん', romaji: 'shashin', meaning: 'foto', group: 'yoon', visual: icon('camera') },
  { hiragana: 'ぎゅうにゅう', romaji: 'gyunyuu', meaning: 'leche', group: 'yoon', visual: openmoji('gyunyuu', 'Leche') },
  { hiragana: 'おちゃ', romaji: 'ocha', meaning: 'té', group: 'yoon', visual: openmoji('ocha', 'Té') },
  { hiragana: 'りょこう', romaji: 'ryokou', meaning: 'viaje', group: 'yoon', visual: openmoji('ryokou', 'Viaje') },
  { hiragana: 'きょうしつ', romaji: 'kyoushitsu', meaning: 'salón de clases', group: 'yoon', visual: openmoji('kyoushitsu', 'Salón de clases') },
  { hiragana: 'ひゃく', romaji: 'hyaku', meaning: 'cien', group: 'yoon', visual: openmoji('hyaku', 'Cien') },
  { hiragana: 'びょういん', romaji: 'byouin', meaning: 'hospital', group: 'yoon', visual: openmoji('byouin', 'Hospital') },
  // usa tu foto assets/vocab/densha.jpg (se detecta sola)
  { hiragana: 'でんしゃ', romaji: 'densha', meaning: 'tren', group: 'yoon', visual: icon('photo') },
];
