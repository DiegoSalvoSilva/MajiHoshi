import { GROUPS } from './data.js';
import { VOCAB } from './vocab-data.js';
import { randomItem, speak } from './utils.js';

/**
 * Pestaña de Vocabulario: se muestra un ícono/color representando una
 * palabra japonesa y hay que escribir su lectura en romaji. A diferencia
 * del quiz de opción múltiple, aquí se escribe la respuesta a mano, así
 * que la comprobación normaliza espacios y mayúsculas pero exige la
 * grafía romaji exacta del dataset (no se aceptan romanizaciones
 * alternativas como "si"/"shi").
 */
export function initVocab() {
  const hiraganaEl = document.getElementById('vocab-hiragana');
  const visualEl = document.getElementById('vocab-visual');
  const meaningEl = document.getElementById('vocab-meaning');
  const input = document.getElementById('vocab-input');
  const submitBtn = document.getElementById('vocab-submit');
  const nextBtn = document.getElementById('vocab-next');
  const feedbackEl = document.getElementById('vocab-feedback');
  const scoreEl = document.getElementById('vocab-score');
  const streakEl = document.getElementById('vocab-streak');
  const filtersEl = document.getElementById('vocab-filters');

  const activeGroups = new Set(GROUPS.map((g) => g.id));
  let current = null;
  let answered = false;
  const score = { correct: 0, total: 0 };
  let streak = 0;

  GROUPS.forEach((group) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip active';
    chip.textContent = group.label;
    chip.dataset.group = group.id;
    chip.addEventListener('click', () => {
      if (activeGroups.has(group.id)) {
        if (activeGroups.size === 1) return;
        activeGroups.delete(group.id);
        chip.classList.remove('active');
      } else {
        activeGroups.add(group.id);
        chip.classList.add('active');
      }
      newQuestion();
    });
    filtersEl.appendChild(chip);
  });

  function pool() {
    return VOCAB.filter((item) => activeGroups.has(item.group));
  }

  function renderVisual(item) {
    visualEl.innerHTML = '';
    visualEl.className = 'vocab-visual';
    visualEl.style.background = '';

    if (item.visual.type === 'color') {
      visualEl.classList.add('vocab-visual-color');
      visualEl.style.background = item.visual.hex;
    } else if (item.visual.type === 'image') {
      visualEl.classList.add('vocab-visual-image');
      const img = document.createElement('img');
      img.src = item.visual.src;
      img.alt = item.visual.alt || item.meaning || '';
      img.loading = 'lazy';
      visualEl.appendChild(img);
      return; // ya es una imagen explícita, no hace falta buscar foto por convención
    } else {
      visualEl.classList.add('vocab-visual-icon');
      visualEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${item.visual.svg}</svg>`;
    }

    tryPhotoOverlay(item);
  }

  /**
   * Busca assets/vocab/<romaji>.{jpg,jpeg,png,webp} y, si existe, la
   * superpone al ícono/color por defecto. Así se pueden ir agregando fotos
   * a la carpeta sin tocar el dataset: basta con nombrar el archivo como
   * el romaji de la palabra (p. ej. hana.jpg para はな).
   */
  function tryPhotoOverlay(item) {
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.className = 'vocab-visual-photo';
    let attempt = 0;

    img.addEventListener('error', () => {
      if (!img.isConnected) return; // la pregunta ya cambió, ignorar respuesta tardía
      attempt += 1;
      if (attempt < extensions.length) {
        img.src = `assets/vocab/${item.romaji}.${extensions[attempt]}`;
      } else {
        img.remove();
      }
    });
    img.addEventListener('load', () => {
      if (!img.isConnected) return;
      visualEl.classList.add('vocab-visual-has-photo');
    });

    img.src = `assets/vocab/${item.romaji}.${extensions[0]}`;
    visualEl.appendChild(img);
  }

  function newQuestion() {
    answered = false;
    feedbackEl.textContent = '';
    feedbackEl.className = 'quiz-feedback';
    meaningEl.textContent = '';
    nextBtn.hidden = true;
    input.value = '';
    input.disabled = false;
    submitBtn.hidden = false;

    const available = pool();
    current = randomItem(available);
    hiraganaEl.textContent = current.hiragana;
    renderVisual(current);
    input.focus();
  }

  function normalize(text) {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function handleSubmit() {
    if (answered || !input.value.trim()) return;
    answered = true;
    score.total += 1;

    const isCorrect = normalize(input.value) === normalize(current.romaji);
    if (isCorrect) {
      score.correct += 1;
      streak += 1;
      feedbackEl.textContent = '¡Correcto!';
      feedbackEl.classList.add('correct');
    } else {
      streak = 0;
      feedbackEl.textContent = `Incorrecto. Era "${current.romaji}".`;
      feedbackEl.classList.add('incorrect');
    }

    meaningEl.textContent = `${current.romaji} — “${current.meaning}”`;
    input.disabled = true;
    submitBtn.hidden = true;
    updateScore();
    nextBtn.hidden = false;
    nextBtn.focus();
    speak(current.hiragana);
  }

  function updateScore() {
    scoreEl.textContent = `${score.correct} / ${score.total}`;
    streakEl.textContent = String(streak);
  }

  submitBtn.addEventListener('click', handleSubmit);
  input.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      handleSubmit();
    }
  });
  nextBtn.addEventListener('click', newQuestion);

  newQuestion();
}
