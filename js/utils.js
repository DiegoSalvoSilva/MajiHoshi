/** Utilidades compartidas por los distintos módulos de la app. */

/** Devuelve una copia mezclada del array (Fisher-Yates), sin mutar el original. */
export function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Pronuncia un carácter usando la Web Speech API si el navegador la soporta. */
export function speak(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Síntesis de voz no disponible: fallamos en silencio, no es una función crítica.
  }
}
