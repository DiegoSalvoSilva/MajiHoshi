import { HIRAGANA, GROUPS } from './data.js';
import { speak } from './utils.js';

/**
 * Pestaña de Estudio: grid de tarjetas de referencia, filtrable por
 * grupo (chips) y por texto (búsqueda por romaji o kana). Cada tarjeta
 * es pulsable y reproduce el sonido del carácter vía Web Speech API.
 */
export function initStudy() {
  const grid = document.getElementById('study-grid');
  const chipsContainer = document.getElementById('study-filters');
  const searchInput = document.getElementById('study-search');
  const countLabel = document.getElementById('study-count');

  let activeGroup = 'all';

  const chipDefs = [{ id: 'all', label: 'Todos' }, ...GROUPS];
  chipDefs.forEach((group) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (group.id === 'all' ? ' active' : '');
    chip.textContent = group.label;
    chip.dataset.group = group.id;
    chip.addEventListener('click', () => {
      activeGroup = group.id;
      chipsContainer.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
      render();
    });
    chipsContainer.appendChild(chip);
  });

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = HIRAGANA.filter((item) => {
      const matchesGroup = activeGroup === 'all' || item.group === activeGroup;
      const matchesQuery = !query || item.char.includes(query) || item.romaji.includes(query);
      return matchesGroup && matchesQuery;
    });

    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    filtered.forEach((item) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'kana-card';
      card.setAttribute('aria-label', `${item.char}, se lee ${item.romaji}`);
      card.innerHTML = `<span class="kana-char">${item.char}</span><span class="kana-romaji">${item.romaji}</span>`;
      card.addEventListener('click', () => speak(item.char));
      fragment.appendChild(card);
    });
    grid.appendChild(fragment);

    countLabel.textContent = `${filtered.length} carácter${filtered.length === 1 ? '' : 'es'}`;
    grid.classList.toggle('empty', filtered.length === 0);
    if (filtered.length === 0) {
      grid.innerHTML = '<p class="empty-state">No se encontraron caracteres para esa búsqueda.</p>';
    }
  }

  searchInput.addEventListener('input', render);
  render();
}
