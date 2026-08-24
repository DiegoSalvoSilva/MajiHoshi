import { initTabs } from './tabs.js';
import { initStudy } from './study.js';
import { initQuiz } from './quiz.js';
import { initVocab } from './vocab.js';
import { initCanvas } from './canvas.js';

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initStudy();
  initQuiz();
  initVocab();
  initCanvas();
});
