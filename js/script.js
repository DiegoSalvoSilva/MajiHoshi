import { SCRIPTS } from './data.js';

/**
 * Silabario activo (hiragana o katakana), compartido por las pestañas de
 * Estudio, Práctica y Escritura. Al cambiarlo se emite "script:changed" en
 * document para que cada módulo vuelva a renderizar con el nuevo dataset.
 * La elección se recuerda en localStorage entre visitas.
 */
const STORAGE_KEY = 'majihoshi:script';

let current = SCRIPTS.hiragana;
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SCRIPTS[saved]) current = SCRIPTS[saved];
} catch {
  // localStorage no disponible (modo privado, etc.): usamos hiragana.
}

export function getScript() {
  return current;
}

export function getKana() {
  return current.data;
}

function setScript(id) {
  if (!SCRIPTS[id] || SCRIPTS[id] === current) return;
  current = SCRIPTS[id];
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Ignorado: solo perdemos la preferencia guardada.
  }
  document.dispatchEvent(new CustomEvent('script:changed', { detail: id }));
}

export function initScriptToggle() {
  const buttons = Array.from(document.querySelectorAll('.script-btn'));
  const brandMark = document.getElementById('brand-mark');

  function sync() {
    buttons.forEach((btn) => {
      const isActive = btn.dataset.script === current.id;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    brandMark.textContent = current.mark;
    document.title = `MajiHoshi — Aprende ${current.label}`;
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => setScript(btn.dataset.script));
  });
  document.addEventListener('script:changed', sync);
  sync();
}
