(function (win, doc) {
  'use strict';

  const CSS_ID = '__practice-tracker-v1__';

  /* ── 品牌色票 ─────────────────────────────────────────── */
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

  /* ── 預設配置 ─────────────────────────────────────────── */
  const DEFAULTS = {
    prefix:          'ex-',          // section id 前綴
    position:        'bottom-right', // bottom-right / bottom-left / top-right / top-left
    offsetX:         '24px',
    offsetY:         '24px',
    panelWidth:      '220px',
    zIndex:          '999',
    collapsed:       false,
    cellSize:        '16px',
    cellGap:         '6px',
    cellRadius:      '4px',
    cellsPerRow:     5,
    colorDone:       BRAND.safe,
    colorPending:    '#2a2b2a',
    colorPanel:      '#1a1b1a',
    colorText:       BRAND.shell,
    colorComplete:   BRAND.special,
    title:           '進度',
    labelDone:       '完成',
    completeText:    '全部完成',
    completeSubText: '',
    animateCell:     true,
    animateDuration: '0.3s',
    eventName:       'pt:stage-complete',
    watchStepper:    true,
  };

  /* ── 元素屬性對應表 ───────────────────────────────────── */
  /*
   * 支援在 <practice-tracker> 元素上用 data-* 屬性覆蓋配置。
   * 優先序：DEFAULTS → window.PracticeTrackerConfig → data-* 屬性（最高）
   */
  const ATTR_MAP = {
    'data-prefix':           { key: 'prefix',          type: 'string' },
    'data-position':         { key: 'position',         type: 'string' },
    'data-offset-x':         { key: 'offsetX',          type: 'string' },
    'data-offset-y':         { key: 'offsetY',          type: 'string' },
    'data-panel-width':      { key: 'panelWidth',       type: 'string' },
    'data-z-index':          { key: 'zIndex',           type: 'string' },
    'data-collapsed':        { key: 'collapsed',        type: 'bool'   },
    'data-cell-size':        { key: 'cellSize',         type: 'string' },
    'data-cell-gap':         { key: 'cellGap',          type: 'string' },
    'data-cell-radius':      { key: 'cellRadius',       type: 'string' },
    'data-cells-per-row':    { key: 'cellsPerRow',      type: 'int'    },
    'data-color-done':       { key: 'colorDone',        type: 'string' },
    'data-color-pending':    { key: 'colorPending',     type: 'string' },
    'data-color-panel':      { key: 'colorPanel',       type: 'string' },
    'data-color-text':       { key: 'colorText',        type: 'string' },
    'data-color-complete':   { key: 'colorComplete',    type: 'string' },
    'data-title':            { key: 'title',            type: 'string' },
    'data-label-done':       { key: 'labelDone',        type: 'string' },
    'data-complete-text':    { key: 'completeText',     type: 'string' },
    'data-complete-sub':     { key: 'completeSubText',  type: 'string' },
    'data-animate-cell':     { key: 'animateCell',      type: 'bool'   },
    'data-animate-duration': { key: 'animateDuration',  type: 'string' },
    'data-event-name':       { key: 'eventName',        type: 'string' },
    'data-watch-stepper':    { key: 'watchStepper',     type: 'bool'   },
  };

  /* ── 讀取元素屬性、就地覆蓋 cfg ─────────────────────── */
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

  /* ── 注入全域樣式（僅一次）──────────────────────────── */
  if (!doc.getElementById(CSS_ID)) {
    const s = doc.createElement('style');
    s.id = CSS_ID;
    s.textContent = `
/* 語意標籤：預設 block */
practice-tracker,
pt-header, pt-title, pt-toggle,
pt-body, pt-grid, pt-cell,
pt-count, pt-complete, pt-complete-sub {
  display: block;
  box-sizing: border-box;
}

/* ── 面板外框（position:fixed 浮動，預設）────────────────── */
practice-tracker {
  position: fixed;
  width: var(--pt-width, 220px);
  background: var(--pt-panel-bg, #1a1b1a);
  border: 1px solid rgba(198,199,189,0.15);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4);
  font-family: 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  font-size: 0.85rem;
  color: var(--pt-text, #C6C7BD);
  overflow: hidden;
  z-index: var(--pt-z, 999);
  transition: border-color 0.4s ease;
}
practice-tracker.pt-complete-state {
  border-color: rgba(179,222,115,0.45);
}

/* ── 行內嵌入模式（data-inline）────────────────────────── */
/*
 * 寫法：<practice-tracker data-inline ...>
 * 元素保留在文件流中，不蓋住內容。
 * 移除 data-inline 即恢復浮動模式。
 */
practice-tracker[data-inline] {
  position: relative;
  top:    auto !important;
  bottom: auto !important;
  left:   auto !important;
  right:  auto !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.45), 0 1px 6px rgba(0,0,0,0.30);
}

/* ── 標題列 ──────────────────────────────────────────────── */
pt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px 8px;
  border-bottom: 1px solid rgba(198,199,189,0.10);
  cursor: pointer;
  user-select: none;
}
pt-title {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  opacity: 0.8;
  text-transform: uppercase;
}
pt-toggle {
  font-size: 1rem;
  line-height: 1;
  opacity: 0.45;
  width: 16px;
  text-align: center;
  transition: opacity 0.2s;
  font-family: monospace;
}
pt-header:hover pt-toggle { opacity: 0.85; }

/* ── 主體（可收合）──────────────────────────────────────── */
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

/* ── 格子陣列 ────────────────────────────────────────────── */
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
pt-cell.is-done {
  background: var(--pt-done, #27AE60);
}
pt-cell.pt-pop {
  transform: scale(1.4);
}

/* ── 進度文字 ────────────────────────────────────────────── */
pt-count {
  font-size: 0.76rem;
  opacity: 0.55;
  margin-top: 2px;
  transition: opacity 0.3s;
}
practice-tracker.pt-complete-state pt-count {
  opacity: 0.3;
}

/* ── 完成訊息 ────────────────────────────────────────────── */
pt-complete {
  display: none;
  padding: 0 12px 10px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--pt-complete-color, #B3DE73);
  letter-spacing: 0.02em;
  line-height: 1.5;
}
practice-tracker.pt-complete-state pt-complete {
  display: block;
}
pt-complete-sub {
  font-size: 0.73rem;
  font-weight: 400;
  opacity: 0.7;
  margin-top: 2px;
}
    `;
    doc.head.appendChild(s);
  }

  /* ── CSS 變數注入 ────────────────────────────────────── */
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
  }

  /* ── 浮動位置 ────────────────────────────────────────── */
  function applyPosition(el, cfg) {
    const pos = cfg.position || 'bottom-right';
    el.style.top    = pos.includes('top')    ? cfg.offsetY : 'auto';
    el.style.bottom = pos.includes('bottom') ? cfg.offsetY : 'auto';
    el.style.left   = pos.includes('left')   ? cfg.offsetX : 'auto';
    el.style.right  = pos.includes('right')  ? cfg.offsetX : 'auto';
  }

  /* ── 主流程 ──────────────────────────────────────────── */
  function init() {

    /* ① 偵測 HTML 中是否已存在 <practice-tracker> 元素 */
    const hostEl = doc.querySelector('practice-tracker');

    /* ② 建立此次實例的配置（三層優先序）
     *   DEFAULTS  →  window.PracticeTrackerConfig  →  data-* 屬性（最高）
     */
    const cfg = Object.assign({}, DEFAULTS, win.PracticeTrackerConfig || {});
    if (hostEl) readElementAttrs(hostEl, cfg);

    /* ③ 收集目標 section */
    const sections = Array.from(
      doc.querySelectorAll(`section[id^="${cfg.prefix}"]`)
    );
    if (!sections.length) return;

    const total   = sections.length;
    const doneSet = new Set();
    const cells   = {};

    /* ④ 取用（或新建）tracker 元素；清空原有子內容 */
    const tracker = hostEl || doc.createElement('practice-tracker');
    if (hostEl) hostEl.innerHTML = '';

    applyCSSVars(tracker, cfg);

    /* ⑤ 位置處理
     *   data-inline 存在  → 保留文件流，不套 fixed 座標
     *   data-inline 不存在 → 套 position:fixed + offsetX/Y
     */
    const isInline = hostEl && hostEl.hasAttribute('data-inline');
    if (!isInline) applyPosition(tracker, cfg);

    if (cfg.collapsed) tracker.classList.add('is-collapsed');

    /* ⑥ 標題列 */
    const header   = doc.createElement('pt-header');
    const titleEl  = doc.createElement('pt-title');
    const toggleEl = doc.createElement('pt-toggle');
    titleEl.textContent  = cfg.title;
    toggleEl.textContent = cfg.collapsed ? '+' : '−';
    header.appendChild(titleEl);
    header.appendChild(toggleEl);

    /* ⑦ 主體 */
    const body = doc.createElement('pt-body');
    body.style.maxHeight = '300px';

    /* ⑧ 格子陣列 */
    const grid = doc.createElement('pt-grid');
    sections.forEach(sec => {
      const cell = doc.createElement('pt-cell');
      cell.setAttribute('data-id', sec.id);
      cell.title = sec.id;
      grid.appendChild(cell);
      cells[sec.id] = cell;
    });

    /* ⑨ 進度計數 */
    const countEl = doc.createElement('pt-count');
    countEl.textContent = `0 / ${total} ${cfg.labelDone}`;

    body.appendChild(grid);
    body.appendChild(countEl);

    /* ⑩ 完成訊息 */
    const completeEl = doc.createElement('pt-complete');
    completeEl.textContent = cfg.completeText;
    if (cfg.completeSubText) {
      const sub = doc.createElement('pt-complete-sub');
      sub.textContent = cfg.completeSubText;
      completeEl.appendChild(sub);
    }

    /* ⑪ 組裝 */
    tracker.appendChild(header);
    tracker.appendChild(body);
    tracker.appendChild(completeEl);

    /* ⑫ 只在「純 JS 建立」模式下才 append 至 body */
    if (!hostEl) doc.body.appendChild(tracker);

    /* ⑬ 收合切換 */
    header.addEventListener('click', () => {
      const nowCollapsed = tracker.classList.toggle('is-collapsed');
      toggleEl.textContent = nowCollapsed ? '+' : '−';
      if (!nowCollapsed) body.style.maxHeight = '300px';
    });

    /* ── markDone：標記某階段完成 ─────────────────────── */
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

      countEl.textContent = `${doneSet.size} / ${total} ${cfg.labelDone}`;
      if (doneSet.size === total) tracker.classList.add('pt-complete-state');
    }

    /* ⑭ 事件監聽 */
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

    /* ⑮ 公開 API */
    win.PracticeTracker = { markDone, total, doneSet, cfg };
  }

  /* ── 時機：DOMContentLoaded 或立即執行 ──────────────── */
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
