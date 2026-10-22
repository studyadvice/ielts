(function (win, doc) {
  'use strict';

  const CSS_ID = '__practice-tracker-v2__';
  const SHAPES  = new Set(['square', 'circle', 'star', 'diamond', 'hexagon', 'heart']);

  const BRAND = {
    bg:       '#0C0D0C',
    shell:    '#C6C7BD',
    lavender: '#C3A5E5',
    sky:      '#82C8E5',
    warning:  '#E6374B',
    salmon:   '#E5C3B3',
    ocean:    '#1CCAE8',
    safe:     '#27AE60',
    teal:     '#0DA591',
    vanilla:  '#DBEDD8',
    yellow:   '#E3D322',
    focus:    '#D4FFFC',
    special:  '#B3DE73',
    info:     '#2351DB',
    indigo:   '#7849C9',
    pink:     '#FF91D7',
    orange:   '#EDA109',
  };

  const DEFAULTS = {
    prefix:              'ex-',
    position:            'bottom-right',
    offsetX:             '24px',
    offsetY:             '24px',
    panelWidth:          '220px',
    zIndex:              '999',
    collapsed:           false,
    cellSize:            '16px',
    cellGap:             '6px',
    cellRadius:          '4px',
    cellsPerRow:         5,
    cellShape:           'square',      // square | circle | star | diamond | hexagon | heart
    colorDone:           BRAND.safe,
    colorPending:        '#2a2b2a',
    colorPanel:          '#1a1b1a',
    colorText:           BRAND.shell,
    colorComplete:       BRAND.special,
    fontSizePanel:       '0.85rem',
    fontSizeTitle:       '0.78rem',
    fontSizeCount:       '0.76rem',
    fontSizeComplete:    '0.80rem',
    fontSizeCompleteSub: '0.73rem',
    title:               '進度',
    labelDone:           '完成',
    completeText:        '全部完成',
    completeSubText:     '',
    animateCell:         true,
    animateDuration:     '0.3s',
    eventName:           'pt:stage-complete',
    watchStepper:        true,
    clickGo:             false,
  };

  const ATTR_MAP = {
    'data-prefix':                { key: 'prefix',           type: 'string' },
    'data-position':              { key: 'position',          type: 'string' },
    'data-offset-x':              { key: 'offsetX',           type: 'string' },
    'data-offset-y':              { key: 'offsetY',           type: 'string' },
    'data-panel-width':           { key: 'panelWidth',        type: 'string' },
    'data-z-index':               { key: 'zIndex',            type: 'string' },
    'data-collapsed':             { key: 'collapsed',         type: 'bool'   },
    'data-cell-size':             { key: 'cellSize',          type: 'string' },
    'data-cell-gap':              { key: 'cellGap',           type: 'string' },
    'data-cell-radius':           { key: 'cellRadius',        type: 'string' },
    'data-cells-per-row':         { key: 'cellsPerRow',       type: 'int'    },
    'data-cell-shape':            { key: 'cellShape',         type: 'string' },
    'data-color-done':            { key: 'colorDone',         type: 'string' },
    'data-color-pending':         { key: 'colorPending',      type: 'string' },
    'data-color-panel':           { key: 'colorPanel',        type: 'string' },
    'data-color-text':            { key: 'colorText',         type: 'string' },
    'data-color-complete':        { key: 'colorComplete',     type: 'string' },
    'data-title':                 { key: 'title',             type: 'string' },
    'data-label-done':            { key: 'labelDone',         type: 'string' },
    'data-complete-text':         { key: 'completeText',      type: 'string' },
    'data-complete-sub':          { key: 'completeSubText',   type: 'string' },
    'data-animate-cell':          { key: 'animateCell',       type: 'bool'   },
    'data-animate-duration':      { key: 'animateDuration',   type: 'string' },
    'data-event-name':            { key: 'eventName',         type: 'string' },
    'data-watch-stepper':         { key: 'watchStepper',      type: 'bool'   },
    'data-font-size-panel':       { key: 'fontSizePanel',     type: 'string' },
    'data-font-size-title':       { key: 'fontSizeTitle',     type: 'string' },
    'data-font-size-count':       { key: 'fontSizeCount',     type: 'string' },
    'data-font-size-complete':    { key: 'fontSizeComplete',  type: 'string' },
    'data-font-size-complete-sub':{ key: 'fontSizeCompleteSub', type: 'string' },
    'data-click-go':              { key: 'clickGo',           type: 'bool'   },
  };

  function readElementAttrs(el, cfg) {
    for (const [attr, meta] of Object.entries(ATTR_MAP)) {
      if (!el.hasAttribute(attr)) continue;
      const raw = el.getAttribute(attr);
      switch (meta.type) {
        case 'bool': cfg[meta.key] = (raw !== 'false'); break;
        case 'int':  cfg[meta.key] = parseInt(raw, 10); break;
        default:     cfg[meta.key] = raw;
      }
    }
  }

  /* ── 樣式注入 ─────────────────────────────────────────────── */
  if (!doc.getElementById(CSS_ID)) {
    const s = doc.createElement('style');
    s.id = CSS_ID;
    s.textContent = `
practice-tracker,
pt-header, pt-title, pt-header-count, pt-toggle,
pt-body, pt-grid, pt-cell,
pt-count, pt-complete, pt-complete-sub {
  display: block;
  box-sizing: border-box;
}

practice-tracker {
  position: fixed;
  width: var(--pt-width, 220px);
  background: var(--pt-panel-bg, #1a1b1a);
  border: 1px solid rgba(198,199,189,0.15);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4);
  font-family: 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  font-size: var(--pt-fs-panel, 0.85rem);
  color: var(--pt-text, #C6C7BD);
  overflow: hidden;
  z-index: var(--pt-z, 999);
  transition: border-color 0.4s ease;
}
practice-tracker.pt-complete-state {
  border-color: rgba(179,222,115,0.45);
}
practice-tracker[data-inline] {
  position: relative;
  top:    auto !important;
  bottom: auto !important;
  left:   auto !important;
  right:  auto !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.45), 0 1px 6px rgba(0,0,0,0.30);
}

/* ── 標題列 ── */
pt-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px 8px;
  border-bottom: 1px solid rgba(198,199,189,0.10);
  cursor: pointer;
  user-select: none;
}
pt-title {
  flex: 1;
  font-size: var(--pt-fs-title, 0.78rem);
  font-weight: 600;
  letter-spacing: 0.05em;
  opacity: 0.8;
  text-transform: uppercase;
}

/* 收合時顯示的進度數字 */
pt-header-count {
  font-size: var(--pt-fs-count, 0.76rem);
  font-weight: 700;
  color: var(--pt-done, #27AE60);
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  line-height: 1;
  transition: opacity 0.22s ease;
}
practice-tracker.is-collapsed pt-header-count {
  opacity: 1;
}
practice-tracker.pt-complete-state pt-header-count {
  color: var(--pt-complete-color, #B3DE73);
}

pt-toggle {
  font-size: 1rem;
  line-height: 1;
  opacity: 0.45;
  width: 16px;
  text-align: center;
  transition: opacity 0.2s;
  font-family: monospace;
  flex-shrink: 0;
}
pt-header:hover pt-toggle { opacity: 0.85; }

/* ── 主體 ── */
pt-body {
  padding: 10px 12px 12px;
  overflow: hidden;
  transition:
    max-height 0.28s cubic-bezier(.4,0,.2,1),
    opacity    0.22s ease,
    padding    0.25s ease;
}
practice-tracker.is-collapsed pt-body {
  max-height: 0 !important;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
  pointer-events: none;
}
/* 收合時完成提示也同步隱藏，改由 header-count 傳達狀態 */
practice-tracker.is-collapsed pt-complete {
  display: none !important;
}

/* ── 格子陣列 ── */
pt-grid {
  display: grid;
  grid-template-columns: repeat(var(--pt-cols, 5), var(--pt-cell, 16px));
  gap: var(--pt-gap, 6px);
  margin-bottom: 8px;
}
pt-cell {
  width:  var(--pt-cell, 16px);
  height: var(--pt-cell, 16px);
  border-radius: var(--pt-radius, 4px);
  background: var(--pt-pending, #2a2b2a);
  transition:
    background var(--pt-anim, 0.3s) ease,
    transform  var(--pt-anim, 0.3s) cubic-bezier(.34,1.56,.64,1);
}
pt-cell.is-done { background: var(--pt-done, #27AE60); }
pt-cell.pt-pop  { transform: scale(1.4); }
pt-cell[data-clickable] { cursor: pointer; }
pt-cell[data-clickable]:hover {
  filter: brightness(1.35);
  transform: scale(1.12);
}

/* ── 形狀變體（clip-path 路線，is-done class 切換邏輯不變）── */
pt-cell[data-shape="circle"] {
  border-radius: 50%;
}
pt-cell[data-shape="star"] {
  border-radius: 0;
  clip-path: polygon(
    50%  0%, 61% 35%, 98% 35%,
    68% 57%, 79% 91%, 50% 70%,
    21% 91%, 32% 57%,  2% 35%,
    39% 35%
  );
}
pt-cell[data-shape="diamond"] {
  border-radius: 0;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}
pt-cell[data-shape="hexagon"] {
  border-radius: 0;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}
pt-cell[data-shape="heart"] {
  border-radius: 0;
  clip-path: polygon(
    50% 88%,
    18% 54%,  6% 38%,  6% 24%,
    12% 10%, 26%  4%, 40%  8%, 50% 20%,
    60%  8%, 74%  4%, 88% 10%,
    94% 24%, 94% 38%, 82% 54%
  );
}

/* ── 計數 & 完成 ── */
pt-count {
  font-size: var(--pt-fs-count, 0.76rem);
  opacity: 0.55;
  margin-top: 2px;
  transition: opacity 0.3s;
}
practice-tracker.pt-complete-state pt-count { opacity: 0.3; }

pt-complete {
  display: none;
  padding: 0 12px 10px;
  font-size: var(--pt-fs-complete, 0.80rem);
  font-weight: 700;
  color: var(--pt-complete-color, #B3DE73);
  letter-spacing: 0.02em;
  line-height: 1.5;
}
practice-tracker.pt-complete-state pt-complete { display: block; }
pt-complete-sub {
  font-size: var(--pt-fs-complete-sub, 0.73rem);
  font-weight: 400;
  opacity: 0.7;
  margin-top: 2px;
}
    `;
    doc.head.appendChild(s);
  }

  /* ── 工具函式 ──────────────────────────────────────────────── */
  function applyCSSVars(el, cfg) {
    el.style.setProperty('--pt-width',          cfg.panelWidth);
    el.style.setProperty('--pt-panel-bg',        cfg.colorPanel);
    el.style.setProperty('--pt-text',            cfg.colorText);
    el.style.setProperty('--pt-z',               String(cfg.zIndex));
    el.style.setProperty('--pt-cell',            cfg.cellSize);
    el.style.setProperty('--pt-gap',             cfg.cellGap);
    el.style.setProperty('--pt-radius',          cfg.cellRadius);
    el.style.setProperty('--pt-cols',            String(cfg.cellsPerRow));
    el.style.setProperty('--pt-done',            cfg.colorDone);
    el.style.setProperty('--pt-pending',         cfg.colorPending);
    el.style.setProperty('--pt-complete-color',  cfg.colorComplete);
    el.style.setProperty('--pt-anim',            cfg.animateCell ? cfg.animateDuration : '0s');
    el.style.setProperty('--pt-fs-panel',        cfg.fontSizePanel);
    el.style.setProperty('--pt-fs-title',        cfg.fontSizeTitle);
    el.style.setProperty('--pt-fs-count',        cfg.fontSizeCount);
    el.style.setProperty('--pt-fs-complete',     cfg.fontSizeComplete);
    el.style.setProperty('--pt-fs-complete-sub', cfg.fontSizeCompleteSub);
  }

  function applyPosition(el, cfg) {
    const pos = cfg.position || 'bottom-right';
    el.style.top    = pos.includes('top')    ? cfg.offsetY : 'auto';
    el.style.bottom = pos.includes('bottom') ? cfg.offsetY : 'auto';
    el.style.left   = pos.includes('left')   ? cfg.offsetX : 'auto';
    el.style.right  = pos.includes('right')  ? cfg.offsetX : 'auto';
  }

  /* ── 主流程 ────────────────────────────────────────────────── */
  function init() {

    const hostEl = doc.querySelector('practice-tracker');
    const cfg    = Object.assign({}, DEFAULTS, win.PracticeTrackerConfig || {});
    if (hostEl) readElementAttrs(hostEl, cfg);

    const sections = Array.from(
      doc.querySelectorAll(`section[id^="${cfg.prefix}"]`)
    );
    if (!sections.length) return;

    const total   = sections.length;
    const doneSet = new Set();
    const cells   = {};

    const tracker = hostEl || doc.createElement('practice-tracker');
    if (hostEl) hostEl.innerHTML = '';

    applyCSSVars(tracker, cfg);
    const isInline = hostEl && hostEl.hasAttribute('data-inline');
    if (!isInline) applyPosition(tracker, cfg);
    if (cfg.collapsed) tracker.classList.add('is-collapsed');

    /* ── 標題列 ── */
    const header        = doc.createElement('pt-header');
    const titleEl       = doc.createElement('pt-title');
    const headerCountEl = doc.createElement('pt-header-count');  // 收合時顯示
    const toggleEl      = doc.createElement('pt-toggle');

    titleEl.textContent       = cfg.title;
    headerCountEl.textContent = `0 / ${total}`;
    toggleEl.textContent      = cfg.collapsed ? '+' : '−';

    header.appendChild(titleEl);
    header.appendChild(headerCountEl);
    header.appendChild(toggleEl);

    /* ── 主體 ── */
    const body = doc.createElement('pt-body');
    body.style.maxHeight = '300px';

    /* ── 格子 ── */
    const grid     = doc.createElement('pt-grid');
    const shapeVal = SHAPES.has((cfg.cellShape || '').toLowerCase())
      ? cfg.cellShape.toLowerCase()
      : 'square';

    sections.forEach(sec => {
      const cell = doc.createElement('pt-cell');
      cell.setAttribute('data-id', sec.id);
      cell.title = sec.id;

      if (shapeVal !== 'square') cell.setAttribute('data-shape', shapeVal);

      if (cfg.clickGo) {
        cell.setAttribute('data-clickable', '');
        cell.addEventListener('click', () => {
          sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }

      grid.appendChild(cell);
      cells[sec.id] = cell;
    });

    /* ── 計數 ── */
    const countEl = doc.createElement('pt-count');
    countEl.textContent = `0 / ${total} ${cfg.labelDone}`;

    body.appendChild(grid);
    body.appendChild(countEl);

    /* ── 完成提示 ── */
    const completeEl = doc.createElement('pt-complete');
    completeEl.textContent = cfg.completeText;
    if (cfg.completeSubText) {
      const sub = doc.createElement('pt-complete-sub');
      sub.textContent = cfg.completeSubText;
      completeEl.appendChild(sub);
    }

    /* ── 組裝 ── */
    tracker.appendChild(header);
    tracker.appendChild(body);
    tracker.appendChild(completeEl);

    if (!hostEl) doc.body.appendChild(tracker);

    /* ── 收合切換 ── */
    header.addEventListener('click', () => {
      const nowCollapsed = tracker.classList.toggle('is-collapsed');
      toggleEl.textContent = nowCollapsed ? '+' : '−';
      if (!nowCollapsed) body.style.maxHeight = '300px';
    });

    /* ── markDone ─────────────────────────────────────────── */
    function markDone(sectionId) {
      if (doneSet.has(sectionId)) return;
      if (!cells[sectionId]) return;

      doneSet.add(sectionId);
      const cell = cells[sectionId];
      cell.classList.add('is-done');

      if (cfg.animateCell) {
        cell.classList.add('pt-pop');
        setTimeout(
          () => cell.classList.remove('pt-pop'),
          parseFloat(cfg.animateDuration) * 1000 + 50
        );
      }

      const n = doneSet.size;
      countEl.textContent       = `${n} / ${total} ${cfg.labelDone}`;
      headerCountEl.textContent = `${n} / ${total}`;

      if (n === total) tracker.classList.add('pt-complete-state');
    }

    /* ── changeShape：執行期動態切換形狀 ─────────────────── */
    function changeShape(shape) {
      const s = SHAPES.has((shape || '').toLowerCase())
        ? shape.toLowerCase()
        : 'square';
      Object.values(cells).forEach(cell => {
        if (s === 'square') {
          cell.removeAttribute('data-shape');
        } else {
          cell.setAttribute('data-shape', s);
        }
      });
    }

    /* ── 事件監聽 ── */
    if (cfg.watchStepper) {
      doc.addEventListener('bps:complete', e => {
        const sec = e.target.closest(`section[id^="${cfg.prefix}"]`);
        if (sec) markDone(sec.id);
      });
    }
    doc.addEventListener(cfg.eventName, e => {
      const id = e.detail && e.detail.sectionId;
      if (id) markDone(id);
    });

    win.PracticeTracker = { markDone, changeShape, total, doneSet, cfg };
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
