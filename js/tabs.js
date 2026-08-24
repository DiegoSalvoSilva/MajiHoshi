/**
 * Navegación por pestañas al estilo SPA.
 * No hay recarga de página ni router: simplemente se alterna la clase
 * "active" entre botones y paneles. Al activar una pestaña se emite un
 * evento "tab:activated" en document para que otros módulos (p. ej. el
 * canvas de escritura) puedan reaccionar cuando su panel se hace visible.
 */
export function initTabs() {
  const buttons = Array.from(document.querySelectorAll('.tab-btn'));
  const panels = Array.from(document.querySelectorAll('.tab-panel'));

  function activate(targetId) {
    buttons.forEach((btn) => {
      const isActive = btn.dataset.tab === targetId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
    panels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === targetId);
    });
    document.dispatchEvent(new CustomEvent('tab:activated', { detail: targetId }));
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      activate(btn.dataset.tab);
    });
  });
}
