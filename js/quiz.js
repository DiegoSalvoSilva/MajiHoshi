import { HIRAGANA, GROUPS } from './data.js';
import { shuffle, randomItem, speak } from './utils.js';

/**
 * Pestaña de Práctica: quiz de opción múltiple.
 * Se elige un carácter al azar (respetando los grupos activos) y se generan
 * 3 distractores con romaji distinto al correcto, para evitar ambigüedad
 * en casos como じ/ぢ o ず/づ que comparten romaji.
 */
export function initQuiz() {
  const charEl = document.getElementById('quiz-char');
  const speakBtn = document.getElementById('quiz-speak');
  const optionsEl = document.getElementById('quiz-options');
  const feedbackEl = document.getElementById('quiz-feedback');
  const scoreEl = document.getElementById('quiz-score');
  const streakEl = document.getElementById('quiz-streak');
  const nextBtn = document.getElementById('quiz-next');
  const filtersEl = document.getElementById('quiz-filters');

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
        if (activeGroups.size === 1) return; // al menos un grupo debe seguir activo
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
    return HIRAGANA.filter((item) => activeGroups.has(item.group));
  }

  function newQuestion() {
    answered = false;
    feedbackEl.textContent = '';
    feedbackEl.className = 'quiz-feedback';
    nextBtn.hidden = true;

    const available = pool();
    current = randomItem(available);
    charEl.textContent = current.char;

    const distractorPool = available.filter((item) => item.romaji !== current.romaji);
    const distractors = shuffle(distractorPool).slice(0, 3).map((item) => item.romaji);
    const options = shuffle([current.romaji, ...distractors]);

    optionsEl.innerHTML = '';
    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleAnswer(opt, btn));
      optionsEl.appendChild(btn);
    });
  }

  function handleAnswer(selected, btn) {
    if (answered) return;
    answered = true;
    score.total += 1;

    const isCorrect = selected === current.romaji;
    if (isCorrect) {
      score.correct += 1;
      streak += 1;
      btn.classList.add('correct');
      feedbackEl.textContent = '¡Correcto!';
      feedbackEl.classList.add('correct');
    } else {
      streak = 0;
      btn.classList.add('incorrect');
      feedbackEl.textContent = `Incorrecto. La respuesta era "${current.romaji}".`;
      feedbackEl.classList.add('incorrect');
      Array.from(optionsEl.children).forEach((b) => {
        if (b.textContent === current.romaji) b.classList.add('correct');
      });
    }

    Array.from(optionsEl.children).forEach((b) => { b.disabled = true; });
    updateScore();
    nextBtn.hidden = false;
    nextBtn.focus();
  }

  function updateScore() {
    scoreEl.textContent = `${score.correct} / ${score.total}`;
    streakEl.textContent = String(streak);
  }

  nextBtn.addEventListener('click', newQuestion);
  speakBtn.addEventListener('click', () => current && speak(current.char));

  newQuestion();
}
