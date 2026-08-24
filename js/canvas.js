import { HIRAGANA, GROUPS } from './data.js';
import { randomItem, debounce } from './utils.js';

/**
 * Pestaña de Escritura: canvas de dibujo libre con plantilla de fondo.
 *
 * Estrategia de dibujo:
 * - Los trazos se guardan en memoria como `strokes`: un array de arrays de
 *   puntos {x, y}. No dibujamos "a ciegas" sobre el canvas: cada vez que
 *   hace falta redibujar (nuevo trazo, cambio de carácter, resize) se
 *   repinta la plantilla guía y luego se repasan todos los trazos guardados.
 *   Esto evita que al redimensionar la ventana (p.ej. rotar el móvil) se
 *   pierda el dibujo del usuario, porque el canvas se puede reconstruir
 *   por completo a partir del estado guardado.
 * - Se soportan ratón (mousedown/mousemove/mouseup) y táctil
 *   (touchstart/touchmove/touchend) por separado, tal como pide el
 *   requisito, en lugar de unificarlos con Pointer Events.
 * - `touch-action: none` en CSS + `preventDefault()` en los handlers
 *   evita que el navegador intente hacer scroll/zoom mientras se dibuja.
 *
 * Feedback de precisión:
 * - Al soltar cada trazo se compara el dibujo del usuario contra la silueta
 *   real del carácter (no contra la plantilla semitransparente que se ve,
 *   sino un render aparte a tamaño fijo). Se rasterizan ambos en un canvas
 *   oculto de 200×200 y se comparan píxel a píxel:
 *     - cobertura  = píxeles del carácter que el usuario "pintó" encima
 *     - precisión  = píxeles del usuario que cayeron dentro de la silueta
 *   Combinar ambos con la media armónica (F1) castiga tanto quedarse corto
 *   (baja cobertura) como salirse mucho de la forma (baja precisión).
 * - Es una heurística de superposición de forma, no reconocimiento de
 *   orden de trazos ni de dirección: sirve para saber si el carácter
 *   "quedó parecido", no para validar el trazo caligráfico correcto.
 */
export function initCanvas() {
  const canvas = document.getElementById('writing-canvas');
  const ctx = canvas.getContext('2d');
  const select = document.getElementById('canvas-char-select');
  const randomBtn = document.getElementById('canvas-random');
  const undoBtn = document.getElementById('canvas-undo');
  const clearBtn = document.getElementById('canvas-clear');
  const romajiLabel = document.getElementById('canvas-current-romaji');
  const wrapper = canvas.parentElement;
  const accuracyFill = document.getElementById('accuracy-fill');
  const accuracyLabel = document.getElementById('accuracy-label');

  const strokeColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#c8394a';
  const guideColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#221f26';

  let current = HIRAGANA[0];
  let strokes = [];
  let activeStroke = null;
  let drawing = false;
  let cssSize = 0;

  const EVAL_SIZE = 200;
  const evalCanvas = document.createElement('canvas');
  evalCanvas.width = EVAL_SIZE;
  evalCanvas.height = EVAL_SIZE;
  const evalCtx = evalCanvas.getContext('2d', { willReadFrequently: true });

  populateSelect();
  setCurrent(current.char, { resetSelect: true });

  function populateSelect() {
    GROUPS.forEach((group) => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = group.label;
      HIRAGANA.filter((item) => item.group === group.id).forEach((item) => {
        const option = document.createElement('option');
        option.value = item.char;
        option.textContent = `${item.char}  —  ${item.romaji}`;
        optgroup.appendChild(option);
      });
      select.appendChild(optgroup);
    });
  }

  function setCurrent(char, { resetSelect = false } = {}) {
    current = HIRAGANA.find((item) => item.char === char) || HIRAGANA[0];
    if (resetSelect) select.value = current.char;
    romajiLabel.textContent = current.romaji;
    strokes = [];
    activeStroke = null;
    redraw();
    resetAccuracy();
  }

  function resize() {
    const size = Math.round(wrapper.clientWidth);
    if (size <= 0) return;
    cssSize = size;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  function drawGuide() {
    ctx.clearRect(0, 0, cssSize, cssSize);
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = guideColor;
    ctx.font = `${Math.round(cssSize * 0.7)}px "Noto Sans JP", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(current.char, cssSize / 2, cssSize / 2);
    ctx.restore();
  }

  function drawStrokes() {
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = Math.max(4, cssSize * 0.025);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    strokes.forEach((stroke) => {
      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i += 1) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    });
  }

  function redraw() {
    if (!cssSize) return;
    drawGuide();
    drawStrokes();
  }

  /** Rellena la silueta real del carácter (no la plantilla translúcida) en evalCtx. */
  function renderTargetMask() {
    evalCtx.clearRect(0, 0, EVAL_SIZE, EVAL_SIZE);
    evalCtx.fillStyle = '#000';
    evalCtx.textAlign = 'center';
    evalCtx.textBaseline = 'middle';
    evalCtx.font = `${Math.round(EVAL_SIZE * 0.72)}px "Noto Sans JP", sans-serif`;
    evalCtx.fillText(current.char, EVAL_SIZE / 2, EVAL_SIZE / 2);
    return evalCtx.getImageData(0, 0, EVAL_SIZE, EVAL_SIZE).data;
  }

  /** Rasteriza los trazos del usuario (escalados a EVAL_SIZE) en evalCtx. */
  function renderUserMask() {
    evalCtx.clearRect(0, 0, EVAL_SIZE, EVAL_SIZE);
    const scale = EVAL_SIZE / cssSize;
    evalCtx.strokeStyle = '#000';
    evalCtx.fillStyle = '#000';
    evalCtx.lineWidth = Math.max(3, EVAL_SIZE * 0.06); // trazo "grueso": da tolerancia a pequeños desvíos
    evalCtx.lineCap = 'round';
    evalCtx.lineJoin = 'round';
    strokes.forEach((stroke) => {
      if (stroke.length === 1) {
        evalCtx.beginPath();
        evalCtx.arc(stroke[0].x * scale, stroke[0].y * scale, evalCtx.lineWidth / 2, 0, Math.PI * 2);
        evalCtx.fill();
        return;
      }
      evalCtx.beginPath();
      evalCtx.moveTo(stroke[0].x * scale, stroke[0].y * scale);
      for (let i = 1; i < stroke.length; i += 1) evalCtx.lineTo(stroke[i].x * scale, stroke[i].y * scale);
      evalCtx.stroke();
    });
    return evalCtx.getImageData(0, 0, EVAL_SIZE, EVAL_SIZE).data;
  }

  function evaluate() {
    if (!cssSize || strokes.length === 0) return;
    const targetData = renderTargetMask();
    const userData = renderUserMask();

    let targetCount = 0;
    let userCount = 0;
    let overlapCount = 0;
    for (let i = 3; i < targetData.length; i += 4) {
      const isTarget = targetData[i] > 40;
      const isUser = userData[i] > 40;
      if (isTarget) targetCount += 1;
      if (isUser) userCount += 1;
      if (isTarget && isUser) overlapCount += 1;
    }

    const coverage = targetCount ? overlapCount / targetCount : 0;
    const precision = userCount ? overlapCount / userCount : 0;
    const score = coverage && precision ? (2 * coverage * precision) / (coverage + precision) : 0;
    showAccuracy(score);
  }

  function setAccuracyTier(tier) {
    wrapper.classList.remove('accuracy-good', 'accuracy-mid', 'accuracy-low');
    accuracyFill.classList.remove('accuracy-good', 'accuracy-mid', 'accuracy-low');
    if (tier) {
      wrapper.classList.add(`accuracy-${tier}`);
      accuracyFill.classList.add(`accuracy-${tier}`);
    }
  }

  function showAccuracy(score) {
    const pct = Math.round(score * 100);
    accuracyFill.style.width = `${pct}%`;
    if (pct >= 75) {
      setAccuracyTier('good');
      accuracyLabel.textContent = `${pct}% — ¡Muy bien trazado!`;
    } else if (pct >= 45) {
      setAccuracyTier('mid');
      accuracyLabel.textContent = `${pct}% — Vas bien, repasa la plantilla`;
    } else {
      setAccuracyTier('low');
      accuracyLabel.textContent = `${pct}% — Fuera de la plantilla, inténtalo de nuevo`;
    }
  }

  function resetAccuracy() {
    accuracyFill.style.width = '0%';
    setAccuracyTier(null);
    accuracyLabel.textContent = 'Dibuja el carácter para ver tu precisión';
  }

  function getPos(evt) {
    const rect = canvas.getBoundingClientRect();
    const touch = evt.touches && evt.touches[0];
    const clientX = touch ? touch.clientX : evt.clientX;
    const clientY = touch ? touch.clientY : evt.clientY;
    return {
      x: Math.min(Math.max(clientX - rect.left, 0), cssSize),
      y: Math.min(Math.max(clientY - rect.top, 0), cssSize),
    };
  }

  function startStroke(evt) {
    evt.preventDefault();
    drawing = true;
    activeStroke = [getPos(evt)];
    strokes.push(activeStroke);
  }

  function extendStroke(evt) {
    if (!drawing) return;
    evt.preventDefault();
    activeStroke.push(getPos(evt));
    redraw();
  }

  function endStroke() {
    if (!drawing) return; // evita reevaluar en mouseup/touchend "sueltos" sin trazo previo
    drawing = false;
    activeStroke = null;
    evaluate();
  }

  // Ratón (escritorio)
  canvas.addEventListener('mousedown', startStroke);
  canvas.addEventListener('mousemove', extendStroke);
  window.addEventListener('mouseup', endStroke);
  canvas.addEventListener('mouseleave', endStroke);

  // Táctil (móvil/tablet)
  canvas.addEventListener('touchstart', startStroke, { passive: false });
  canvas.addEventListener('touchmove', extendStroke, { passive: false });
  canvas.addEventListener('touchend', endStroke);
  canvas.addEventListener('touchcancel', endStroke);

  select.addEventListener('change', () => setCurrent(select.value));
  randomBtn.addEventListener('click', () => setCurrent(randomItem(HIRAGANA).char, { resetSelect: true }));
  undoBtn.addEventListener('click', () => {
    strokes.pop();
    redraw();
    if (strokes.length > 0) evaluate();
    else resetAccuracy();
  });
  clearBtn.addEventListener('click', () => {
    strokes = [];
    redraw();
    resetAccuracy();
  });

  window.addEventListener('resize', debounce(resize, 150));

  // El canvas está oculto (display:none) mientras su pestaña no está activa,
  // así que su ancho real es 0 hasta que el panel se muestra. Escuchamos el
  // evento emitido por tabs.js para recalcular el tamaño en ese momento.
  document.addEventListener('tab:activated', (evt) => {
    if (evt.detail === 'panel-writing') resize();
  });

  requestAnimationFrame(resize);
}
