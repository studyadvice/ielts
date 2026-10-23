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
    info:     '#4171BF',
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

    /* ── 片語收藏子區塊（偵測到頁面有 <phrase-chip data-phrase> 才會出現）── */
    phraseBlock:         true,          // 設為 false 可強制關閉，即使頁面有 phrase-chip
    phraseTitle:         '片語收藏',
    phraseLabelDone:      '已收藏',
    phraseCompleteText:  '片語獵人認證！',
    phraseCompleteSub:   '',
    phraseColorDone:     BRAND.pink,
    phraseColorPending:  '',            // 留空則沿用 colorPending
    phraseColorComplete: BRAND.special,
    phraseCellShape:     'circle',
    phraseEventName:     'pt:phrase-collected',

    /* ── 收藏清單 offcanvas（第一次收藏才會出現開啟按鈕）── */
    phraseListBtnLabel:  '查看收藏清單',
    phraseListTitle:     '',            // 留空則沿用 phraseTitle
    phraseListPlacement: 'end',         // start | end | top | bottom
    phraseListTheme:     '',            // 留空則沿用 phraseColorDone
    phraseListWidth:     '380px',
    phraseListEmptyText: '尚未收藏任何片語',
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

    /* ── 片語收藏子區塊屬性 ── */
    'data-phrase-block':          { key: 'phraseBlock',         type: 'bool'   },
    'data-phrase-title':          { key: 'phraseTitle',         type: 'string' },
    'data-phrase-label-done':     { key: 'phraseLabelDone',     type: 'string' },
    'data-phrase-complete-text':  { key: 'phraseCompleteText',  type: 'string' },
    'data-phrase-complete-sub':   { key: 'phraseCompleteSub',   type: 'string' },
    'data-phrase-color-done':     { key: 'phraseColorDone',     type: 'string' },
    'data-phrase-color-pending':  { key: 'phraseColorPending',  type: 'string' },
    'data-phrase-color-complete': { key: 'phraseColorComplete', type: 'string' },
    'data-phrase-cell-shape':     { key: 'phraseCellShape',     type: 'string' },
    'data-phrase-event-name':     { key: 'phraseEventName',     type: 'string' },

    'data-phrase-list-btn-label':  { key: 'phraseListBtnLabel',  type: 'string' },
    'data-phrase-list-title':      { key: 'phraseListTitle',     type: 'string' },
    'data-phrase-list-placement':  { key: 'phraseListPlacement', type: 'string' },
    'data-phrase-list-theme':      { key: 'phraseListTheme',     type: 'string' },
    'data-phrase-list-width':      { key: 'phraseListWidth',     type: 'string' },
    'data-phrase-list-empty-text': { key: 'phraseListEmptyText', type: 'string' },
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
pt-body, pt-grid, pt-cell, pt-phrase-block,
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

/* 收合時顯示的進度數字（僅反映章節進度，片語收藏不佔用這個欄位） */
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

/* ── 片語收藏子區塊：物理上獨立一塊，不與章節格子混排 ──
   顏色靠 --pt-done / --pt-pending / --pt-complete-color 在這層重新覆寫，
   只影響這個子樹底下的 pt-cell / pt-complete，章節格子完全不受影響 */
pt-phrase-block {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #2a2b2a;
}
pt-phrase-block pt-title {
  margin-bottom: 6px;
  text-transform: none;
}
pt-phrase-block pt-complete {
  padding: 0;
  margin-top: 4px;
}
pt-phrase-list-btn {
  display: none;
  text-align: center;
  cursor: pointer;
  font-weight: 700;
  font-size: var(--pt-fs-count, 0.76rem);
  padding: 7px 10px;
  border-radius: 6px;
  margin-top: 8px;
  color: #0C0D0C;
  transition: filter 0.2s ease;
}
pt-phrase-list-btn:hover { filter: brightness(1.15); }
pt-phrase-list-btn.is-shown { display: block; }

/* ── 收藏清單 offcanvas（附掛在 body，樣式自成一套、不依賴其他元件）─── */
.pt-phrase-offcanvas {
  background: #141514 !important;
  color: #C6C7BD !important;
}
.pt-phrase-offcanvas .offcanvas-header {
  color: #0C0D0C;
}
.pt-phrase-offcanvas .offcanvas-title {
  font-weight: 700;
  font-size: 1.05rem;
}
.pt-phrase-offcanvas .offcanvas-body {
  padding: 14px;
}
.pt-phrase-item {
  border-left: 4px solid var(--pli-accent, #1CCAE8);
  background: #1a1b1a;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 10px;
  font-size: 0.95rem;
  line-height: 1.5;
}
.pt-phrase-item-title {
  font-weight: 700;
  color: var(--pli-accent, #1CCAE8);
  margin-bottom: 4px;
  font-size: 1rem;
}
.pt-phrase-item-example { margin-bottom: 4px; }
.pt-phrase-item-example mark {
  background: var(--pli-accent, #1CCAE8);
  color: #0C0D0C;
  padding: 0 3px;
  border-radius: 3px;
}
.pt-phrase-item-translation { opacity: 0.75; font-size: 0.9rem; }
.pt-phrase-empty { opacity: 0.6; font-size: 0.9rem; padding: 4px 2px; }
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

    /* ── 片語收藏偵測：頁面沒有 <phrase-chip data-phrase> 就完全不建立
       這個子區塊，practice-tracker 的介面與行為跟原本一模一樣 ──────── */
    const phraseChipEls = Array.from(doc.querySelectorAll('phrase-chip[data-phrase]'));

    /* 一個 phrase-chip 若帶 data-disable-collect="true"，代表它是純字典模式，
       永遠不會觸發收藏事件。只有在同一個片語「所有」實例都是這種模式時，
       才把它整個排除在總數之外；只要還有一個可收藏的實例，就照常計入 */
    function isCollectible(el) {
      if (!el.hasAttribute('data-disable-collect')) return true;
      return el.getAttribute('data-disable-collect') === 'false';
    }

    const phraseCollectible = new Map(); // phrase -> 是否至少有一個可收藏的實例
    phraseChipEls.forEach(el => {
      const p = (el.getAttribute('data-phrase') || '').trim();
      if (!p) return;
      if (!phraseCollectible.has(p)) phraseCollectible.set(p, false);
      if (isCollectible(el)) phraseCollectible.set(p, true);
    });

    const phraseSet = new Set(
      Array.from(phraseCollectible.entries())
        .filter(([, collectible]) => collectible)
        .map(([phrase]) => phrase)
    );
    const phraseEnabled = cfg.phraseBlock !== false && phraseSet.size > 0;
    const phraseTotal   = phraseSet.size;
    const phraseDoneSet = new Set();
    const phraseCells   = {};
    let phraseBlockEl   = null;
    let phraseCountEl   = null;
    let phraseCompleteEl = null;
    let phraseListBtnEl  = null;
    let phraseOffcanvasBodyEl = null;
    const phraseCollectedOrder = []; // 依收藏先後順序，供清單渲染

    const tracker = hostEl || doc.createElement('practice-tracker');
    if (hostEl) hostEl.innerHTML = '';

    applyCSSVars(tracker, cfg);
    const isInline = hostEl && hostEl.hasAttribute('data-inline');
    if (!isInline) applyPosition(tracker, cfg);
    if (cfg.collapsed) tracker.classList.add('is-collapsed');

    /* ── 標題列 ── */
    const header        = doc.createElement('pt-header');
    const titleEl       = doc.createElement('pt-title');
    const headerCountEl = doc.createElement('pt-header-count');  // 收合時顯示（只反映章節進度）
    const toggleEl      = doc.createElement('pt-toggle');

    titleEl.textContent       = cfg.title;
    headerCountEl.textContent = `0 / ${total}`;
    toggleEl.textContent      = cfg.collapsed ? '+' : '−';

    header.appendChild(titleEl);
    header.appendChild(headerCountEl);
    header.appendChild(toggleEl);

    /* ── 主體 ── */
    const body = doc.createElement('pt-body');
    body.style.maxHeight = '600px';

    /* ── 章節格子 ── */
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

    /* ── 章節計數 ── */
    const countEl = doc.createElement('pt-count');
    countEl.textContent = `0 / ${total} ${cfg.labelDone}`;

    body.appendChild(grid);
    body.appendChild(countEl);

    /* ── 章節完成提示 ── */
    const completeEl = doc.createElement('pt-complete');
    completeEl.textContent = cfg.completeText;
    if (cfg.completeSubText) {
      const sub = doc.createElement('pt-complete-sub');
      sub.textContent = cfg.completeSubText;
      completeEl.appendChild(sub);
    }
    body.appendChild(completeEl);

    /* ── 片語收藏子區塊：物理獨立、顏色獨立覆寫、完成文案獨立 ──────── */
    if (phraseEnabled) {
      phraseBlockEl = doc.createElement('pt-phrase-block');
      phraseBlockEl.style.setProperty('--pt-done',           cfg.phraseColorDone);
      phraseBlockEl.style.setProperty('--pt-pending',        cfg.phraseColorPending || cfg.colorPending);
      phraseBlockEl.style.setProperty('--pt-complete-color', cfg.phraseColorComplete);

      const pTitle = doc.createElement('pt-title');
      pTitle.textContent = cfg.phraseTitle;

      const pShapeVal = SHAPES.has((cfg.phraseCellShape || '').toLowerCase())
        ? cfg.phraseCellShape.toLowerCase()
        : 'circle';

      const pGrid = doc.createElement('pt-grid');
      Array.from(phraseSet).forEach(phrase => {
        const cell = doc.createElement('pt-cell');
        cell.setAttribute('data-phrase', phrase);
        cell.title = phrase;
        if (pShapeVal !== 'square') cell.setAttribute('data-shape', pShapeVal);
        pGrid.appendChild(cell);
        phraseCells[phrase] = cell;
      });

      phraseCountEl = doc.createElement('pt-count');
      phraseCountEl.textContent = `0 / ${phraseTotal} ${cfg.phraseLabelDone}`;

      phraseCompleteEl = doc.createElement('pt-complete');
      phraseCompleteEl.textContent = cfg.phraseCompleteText;
      if (cfg.phraseCompleteSub) {
        const pSub = doc.createElement('pt-complete-sub');
        pSub.textContent = cfg.phraseCompleteSub;
        phraseCompleteEl.appendChild(pSub);
      }

      /* ── 收藏清單開啟按鈕：收藏 0 個時隱藏，收到第一個才淡入常駐 ── */
      const listThemeHex = BRAND[cfg.phraseListTheme] || cfg.phraseColorDone;
      phraseListBtnEl = doc.createElement('pt-phrase-list-btn');
      phraseListBtnEl.textContent = cfg.phraseListBtnLabel;
      phraseListBtnEl.style.background = listThemeHex;

      const offcanvasId = 'pt-phrase-list-' + Math.random().toString(36).slice(2, 9);
      phraseListBtnEl.setAttribute('data-bs-toggle', 'offcanvas');
      phraseListBtnEl.setAttribute('data-bs-target', `#${offcanvasId}`);

      phraseBlockEl.appendChild(pTitle);
      phraseBlockEl.appendChild(pGrid);
      phraseBlockEl.appendChild(phraseCountEl);
      phraseBlockEl.appendChild(phraseListBtnEl);
      phraseBlockEl.appendChild(phraseCompleteEl);

      body.appendChild(phraseBlockEl);

      /* ── 收藏清單 offcanvas：獨立掛在 body，避免被 tracker 的
         overflow:hidden 裁切，也不受面板收合狀態影響 ─────────────── */
      const placement = ['start', 'end', 'top', 'bottom'].includes(cfg.phraseListPlacement)
        ? cfg.phraseListPlacement
        : 'end';

      const offcanvasEl = doc.createElement('div');
      offcanvasEl.className = `offcanvas offcanvas-${placement} pt-phrase-offcanvas`;
      offcanvasEl.id = offcanvasId;
      offcanvasEl.tabIndex = -1;
      if (placement === 'start' || placement === 'end') {
        offcanvasEl.style.width = cfg.phraseListWidth;
      }

      const ocHeader = doc.createElement('div');
      ocHeader.className = 'offcanvas-header';
      ocHeader.style.background = listThemeHex;

      const ocTitle = doc.createElement('h5');
      ocTitle.className = 'offcanvas-title';
      ocTitle.textContent = cfg.phraseListTitle || cfg.phraseTitle;

      const ocClose = doc.createElement('button');
      ocClose.type = 'button';
      ocClose.className = 'btn-close';
      ocClose.setAttribute('data-bs-dismiss', 'offcanvas');

      ocHeader.appendChild(ocTitle);
      ocHeader.appendChild(ocClose);

      phraseOffcanvasBodyEl = doc.createElement('div');
      phraseOffcanvasBodyEl.className = 'offcanvas-body';

      const emptyEl = doc.createElement('div');
      emptyEl.className = 'pt-phrase-empty';
      emptyEl.textContent = cfg.phraseListEmptyText;
      phraseOffcanvasBodyEl.appendChild(emptyEl);

      offcanvasEl.appendChild(ocHeader);
      offcanvasEl.appendChild(phraseOffcanvasBodyEl);
      doc.body.appendChild(offcanvasEl);
    }

    /* ── 組裝 ── */
    tracker.appendChild(header);
    tracker.appendChild(body);

    if (!hostEl) doc.body.appendChild(tracker);

    /* ── 收合切換 ── */
    header.addEventListener('click', () => {
      const nowCollapsed = tracker.classList.toggle('is-collapsed');
      toggleEl.textContent = nowCollapsed ? '+' : '−';
      if (!nowCollapsed) body.style.maxHeight = '600px';
    });

    /* ── markDone：章節完成 ──────────────────────────────────── */
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

    /* ── markPhraseCollected：片語收藏（沒有片語區塊時安靜地什麼都不做）─
       meta 可帶 { theme, exampleHTML, translationText }，用來渲染收藏清單；
       不傳就只在清單顯示片語本身，不中斷既有流程 */
    function markPhraseCollected(phrase, meta) {
      if (!phraseEnabled) return;
      const key = (phrase || '').trim();
      if (!key || phraseDoneSet.has(key) || !phraseCells[key]) return;

      phraseDoneSet.add(key);
      const cell = phraseCells[key];
      cell.classList.add('is-done');

      if (cfg.animateCell) {
        cell.classList.add('pt-pop');
        setTimeout(
          () => cell.classList.remove('pt-pop'),
          parseFloat(cfg.animateDuration) * 1000 + 50
        );
      }

      const n = phraseDoneSet.size;
      phraseCountEl.textContent = `${n} / ${phraseTotal} ${cfg.phraseLabelDone}`;

      if (n === phraseTotal) phraseBlockEl.classList.add('pt-complete-state');

      /* ── 收藏清單：第一筆收藏時清掉「尚未收藏」提示，之後依序往下疊加 ── */
      phraseCollectedOrder.push(key);
      if (phraseOffcanvasBodyEl) {
        if (n === 1) phraseOffcanvasBodyEl.innerHTML = '';

        const m = meta || {};
        const accentHex = BRAND[m.theme] || cfg.phraseColorDone;

        const item = doc.createElement('div');
        item.className = 'pt-phrase-item';
        item.style.setProperty('--pli-accent', accentHex);

        const titleEl = doc.createElement('div');
        titleEl.className = 'pt-phrase-item-title';
        titleEl.textContent = key;
        item.appendChild(titleEl);

        if (m.exampleHTML) {
          const exEl = doc.createElement('div');
          exEl.className = 'pt-phrase-item-example';
          exEl.innerHTML = m.exampleHTML;
          item.appendChild(exEl);
        }

        if (m.translationText) {
          const trEl = doc.createElement('div');
          trEl.className = 'pt-phrase-item-translation';
          trEl.textContent = m.translationText;
          item.appendChild(trEl);
        }

        phraseOffcanvasBodyEl.appendChild(item);
      }

      if (phraseListBtnEl) phraseListBtnEl.classList.add('is-shown');
    }

    /* ── changeShape：執行期動態切換章節格子形狀 ─────────────── */
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

    /* phrase-chip.js 收藏事件：沒有片語區塊時，監聽器仍掛著但不會做任何事 */
    doc.addEventListener(cfg.phraseEventName, e => {
      const detail = e.detail || {};
      if (detail.phrase) markPhraseCollected(detail.phrase, detail);
    });

    win.PracticeTracker = {
      markDone,
      markPhraseCollected,
      changeShape,
      total,
      doneSet,
      phraseTotal,
      phraseDoneSet,
      phraseCollectedOrder,
      cfg,
    };
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
