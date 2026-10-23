(function (win, doc) {
  'use strict';

  const CSS_ID = '__practice-tracker-v2__';
  const SHAPES  = new Set(['square', 'circle', 'star', 'diamond', 'hexagon', 'heart']);
  const BTN_STYLES = new Set(['solid', 'outline', 'pill', 'ghost', 'block', 'check', 'split']);
  const BTN_SIZES  = {
    sm: { fs: '0.875rem', pad: '2px 10px' },
    md: { fs: '1rem',     pad: '4px 14px' },
    lg: { fs: '1.25rem',  pad: '6px 20px' },
  };

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

    phraseListBtnLabel:  '查看收藏清單',
    phraseListTitle:     '',            // 留空則沿用 phraseTitle
    phraseListPlacement: 'end',         // start | end | top | bottom
    phraseListTheme:     '',            // 留空則沿用 phraseColorDone
    phraseListWidth:     '380px',
    phraseListEmptyText: '尚未收藏任何片語',

    /* 定時 Modal：promoTarget 留空就完全不啟用 */
    promoTarget:          '',           // 目標 div 的 id，可寫 promo-1 或 #promo-1
    promoMinutes:         5,            // 載入起算的牆鐘時間（分鐘，可小數，0 表示不限時間）
    promoMinSections:     4,            // 至少瀏覽幾個 section（0 表示只看累計時間）
    promoTitle:           '',           // Modal 標題，留空則不顯示標題文字
    promoButtonLabel:     '我知道了',
    promoViewRatio:       0.4,          // section 可見比例門檻
    promoViewSeconds:     2,            // 達到門檻後需連續停留的秒數
    promoIdleSeconds:     1.5,          // 捲動停止多久後才彈出
    promoEventName:       'pt:promo-shown',
    promoClosedEventName: 'pt:promo-closed',

    /* 內建「標記完成」按鈕：只有帶 data-btn* 屬性的 section 才會自動插入 */
    btn:                  true,         // 設為 false 可整體關閉
    btnStyle:             'outline',    // solid | outline | pill | ghost | block | check | split
    btnText:              '標記完成',
    btnDoneText:          '✓ 已完成',
    btnSize:              'md',         // sm | md | lg
    btnFontSize:          '',           // 有填就蓋過 btnSize 的字體
    btnWidth:             '',           // 例如 160px；留空為內容寬度
    btnPadding:           '',           // 例如 4px 14px；留空用 btnSize 的緊湊預設
    btnColor:             'ocean',      // 品牌色名稱或色碼
    btnAlign:             'start',      // start | center | end
    btnRadius:            '',
    btnEventName:         'pt:section-done',
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

    /* ── 定時 Modal 屬性 ── */
    'data-promo-target':             { key: 'promoTarget',          type: 'string' },
    'data-promo-minutes':            { key: 'promoMinutes',         type: 'float'  },
    'data-promo-min-sections':       { key: 'promoMinSections',     type: 'int'    },
    'data-promo-title':              { key: 'promoTitle',           type: 'string' },
    'data-promo-button-label':       { key: 'promoButtonLabel',     type: 'string' },
    'data-promo-view-ratio':         { key: 'promoViewRatio',       type: 'float'  },
    'data-promo-view-seconds':       { key: 'promoViewSeconds',     type: 'float'  },
    'data-promo-idle-seconds':       { key: 'promoIdleSeconds',     type: 'float'  },
    'data-promo-event-name':         { key: 'promoEventName',       type: 'string' },
    'data-promo-closed-event-name':  { key: 'promoClosedEventName', type: 'string' },

    /* ── 標記完成按鈕屬性（tracker 上是全域預設，section 或 pt-done-btn 上同名屬性可覆蓋）── */
    'data-btn':                      { key: 'btn',                  type: 'bool'   },
    'data-btn-style':                { key: 'btnStyle',             type: 'string' },
    'data-btn-text':                 { key: 'btnText',              type: 'string' },
    'data-btn-done-text':            { key: 'btnDoneText',          type: 'string' },
    'data-btn-size':                 { key: 'btnSize',              type: 'string' },
    'data-btn-font-size':            { key: 'btnFontSize',          type: 'string' },
    'data-btn-width':                { key: 'btnWidth',             type: 'string' },
    'data-btn-padding':              { key: 'btnPadding',           type: 'string' },
    'data-btn-color':                { key: 'btnColor',             type: 'string' },
    'data-btn-align':                { key: 'btnAlign',             type: 'string' },
    'data-btn-radius':               { key: 'btnRadius',            type: 'string' },
    'data-btn-event-name':           { key: 'btnEventName',         type: 'string' },
  };

  function readElementAttrs(el, cfg) {
    for (const [attr, meta] of Object.entries(ATTR_MAP)) {
      if (!el.hasAttribute(attr)) continue;
      const raw = el.getAttribute(attr);
      switch (meta.type) {
        case 'bool': cfg[meta.key] = (raw !== 'false'); break;
        case 'int':  cfg[meta.key] = parseInt(raw, 10); break;
        case 'float': cfg[meta.key] = parseFloat(raw); break;
        default:     cfg[meta.key] = raw;
      }
    }
  }

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
practice-tracker.is-collapsed pt-complete {
  display: none !important;
}

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

/* ── 定時 Modal（金色代表特殊內容，不在品牌色票內）─── */
body.pt-promo-open .modal-backdrop { --bs-backdrop-opacity: 0.9; }
.pt-promo-modal .modal-dialog { max-width: 880px; }
.pt-promo-modal .modal-content {
  position: relative;
  background: #0C0D0C;
  color: #C6C7BD;
  border: 2px solid #D4AF37;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 0 6px #0C0D0C, 0 0 0 7px #9A7B1F, 0 24px 64px rgba(0,0,0,0.95);
}
.pt-promo-bar {
  height: 8px;
  background: linear-gradient(90deg, #9A7B1F, #F3E1A0 50%, #9A7B1F);
}
.pt-promo-head {
  position: relative;
  padding: 28px 72px 4px;
  text-align: center;
}
.pt-promo-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.08em;
  color: #D4AF37;
  background: linear-gradient(180deg, #F3E1A0, #D4AF37 60%, #9A7B1F);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.pt-promo-orn {
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 420px;
  margin: 14px auto 0;
  color: #D4AF37;
  font-size: 1.125rem;
  line-height: 1.5;
}
.pt-promo-orn::before,
.pt-promo-orn::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #D4AF37);
}
.pt-promo-orn::after { transform: scaleX(-1); }
.pt-promo-close {
  position: absolute;
  top: 18px;
  right: 20px;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid #D4AF37;
  border-radius: 50%;
  background: #0C0D0C;
  color: #D4AF37;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}
.pt-promo-close:hover { background: #D4AF37; color: #0C0D0C; }
.pt-promo-modal .pt-promo-body {
  padding: 20px 48px 12px;
  font-size: 1.125rem;
  line-height: 1.5;
  color: #C6C7BD;
}
.pt-promo-body h1, .pt-promo-body h2, .pt-promo-body h3,
.pt-promo-body h4, .pt-promo-body h5, .pt-promo-body h6 {
  color: #F3E1A0;
  line-height: 1.4;
}
.pt-promo-body a { color: #D4AF37; text-decoration: underline; }
.pt-promo-body a:hover { color: #F3E1A0; }
.pt-promo-body hr { border-color: #D4AF37; opacity: 1; }
.pt-promo-body small { font-size: 1.125rem; }
.pt-promo-body li::marker { color: #D4AF37; }
.pt-promo-body img {
  max-width: 100%;
  border: 1px solid #9A7B1F;
  border-radius: 8px;
}
.pt-promo-foot {
  padding: 12px 48px 32px;
  text-align: center;
}
.pt-promo-btn {
  padding: 10px 40px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #F3E1A0, #D4AF37 50%, #9A7B1F);
  color: #0C0D0C;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: filter 0.2s ease, transform 0.2s ease;
}
.pt-promo-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }

/* ── 內建標記完成按鈕 ─── */
pt-done-btn {
  --ptb-color: var(--ptb-base, #1CCAE8);
  display: block;
  box-sizing: border-box;
  width: var(--ptb-width, fit-content);
  margin: 16px 0 0;
  padding: var(--ptb-pad, 4px 14px);
  font-family: inherit;
  font-size: var(--ptb-fs, 1rem);
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  color: var(--ptb-color);
  background: transparent;
  border: 1px solid var(--ptb-color);
  border-radius: var(--ptb-radius, 6px);
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease, color 0.2s ease, filter 0.2s ease;
}
pt-done-btn[data-align="center"] { margin-left: auto; margin-right: auto; }
pt-done-btn[data-align="end"]    { margin-left: auto; }
pt-done-icon  { display: none; }
pt-done-label { display: inline; }
pt-done-btn:hover { background: var(--ptb-color); color: #0C0D0C; }
pt-done-btn.is-done { --ptb-color: #27AE60; cursor: default; pointer-events: none; }

pt-done-btn[data-style="solid"],
pt-done-btn[data-style="pill"],
pt-done-btn[data-style="block"] { background: var(--ptb-color); color: #0C0D0C; }
pt-done-btn[data-style="solid"]:hover,
pt-done-btn[data-style="pill"]:hover,
pt-done-btn[data-style="block"]:hover { background: var(--ptb-color); color: #0C0D0C; filter: brightness(1.12); }
pt-done-btn[data-style="pill"]  { border-radius: var(--ptb-radius, 999px); }
pt-done-btn[data-style="block"] { width: var(--ptb-width, 100%); }

pt-done-btn[data-style="ghost"] {
  border-color: transparent;
  text-decoration: underline;
  text-underline-offset: 4px;
}
pt-done-btn[data-style="ghost"]:hover { background: transparent; color: var(--ptb-color); filter: brightness(1.25); }

pt-done-btn[data-style="check"] {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--ptb-width, 2.25em);
  height: var(--ptb-width, 2.25em);
  padding: 0;
  border-radius: var(--ptb-radius, 50%);
}
pt-done-btn[data-style="check"] pt-done-icon  { display: block; }
pt-done-btn[data-style="check"] pt-done-label { display: none; }
pt-done-btn[data-style="check"].is-done { background: var(--ptb-color); color: #0C0D0C; }

pt-done-btn[data-style="split"] { display: flex; padding: 0; overflow: hidden; }
pt-done-btn[data-style="split"] pt-done-icon {
  display: flex;
  align-items: center;
  padding: 0 0.7em;
  background: var(--ptb-color);
  color: #0C0D0C;
}
pt-done-btn[data-style="split"] pt-done-label { padding: var(--ptb-pad, 4px 14px); }
pt-done-btn[data-style="split"]:hover { background: transparent; color: var(--ptb-color); filter: brightness(1.2); }
    `;
    doc.head.appendChild(s);
  }

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
    const btnInfo = {};

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

    const body = doc.createElement('pt-body');
    body.style.maxHeight = '600px';

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

    tracker.appendChild(header);
    tracker.appendChild(body);

    if (!hostEl) doc.body.appendChild(tracker);

    header.addEventListener('click', () => {
      const nowCollapsed = tracker.classList.toggle('is-collapsed');
      toggleEl.textContent = nowCollapsed ? '+' : '−';
      if (!nowCollapsed) body.style.maxHeight = '600px';
    });

    function markDone(sectionId) {
      if (doneSet.has(sectionId)) return;
      if (!cells[sectionId]) return;

      doneSet.add(sectionId);
      syncDoneBtn(sectionId);
      if (cfg.btnEventName) {
        doc.dispatchEvent(new CustomEvent(cfg.btnEventName, { detail: { sectionId } }));
      }
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

    /* ── 內建「標記完成」按鈕 ─────────────────────────────────────
       自動插入條件：section 上有任何 data-btn* 屬性（data-btn="false" 除外）。
       想自己決定位置，就在 section 內放 <pt-done-btn></pt-done-btn>。
       設定優先順序：pt-done-btn 自身屬性 > section 屬性 > tracker 屬性 > 預設。 ── */
    function syncDoneBtn(id) {
      const b = btnInfo[id];
      if (!b) return;
      b.el.classList.add('is-done');
      b.label.textContent = b.styleName === 'split'
        ? b.doneText.replace(/^✓\s*/, '')
        : b.doneText;
      if (b.styleName === 'check') b.el.title = b.doneText;
    }

    if (cfg.btn !== false) {
      sections.forEach(sec => {
        if (sec.getAttribute('data-btn') === 'false') return;

        let el = sec.querySelector('pt-done-btn');
        if (!el) {
          const marked = Array.from(sec.attributes).some(a => a.name.indexOf('data-btn') === 0);
          if (!marked) return;
          el = doc.createElement('pt-done-btn');
          sec.appendChild(el);
        }

        const opt = (name, fallback) => {
          const a = 'data-btn-' + name;
          if (el.hasAttribute(a)  && el.getAttribute(a)  !== '') return el.getAttribute(a);
          if (sec.hasAttribute(a) && sec.getAttribute(a) !== '') return sec.getAttribute(a);
          return fallback;
        };

        let styleName = String(opt('style', cfg.btnStyle)).toLowerCase();
        if (!BTN_STYLES.has(styleName)) styleName = 'outline';

        const sz       = BTN_SIZES[String(opt('size', cfg.btnSize)).toLowerCase()] || BTN_SIZES.md;
        const colorKey = opt('color', cfg.btnColor);
        const color    = BRAND[colorKey] || colorKey || BRAND.ocean;
        const align    = String(opt('align', cfg.btnAlign)).toLowerCase();
        const text     = opt('text', cfg.btnText);
        const doneText = opt('done-text', cfg.btnDoneText);
        const width    = opt('width', cfg.btnWidth);
        const radius   = opt('radius', cfg.btnRadius);

        el.setAttribute('data-style', styleName);
        el.setAttribute('data-align', ['center', 'end'].includes(align) ? align : 'start');
        el.style.setProperty('--ptb-base', color);
        el.style.setProperty('--ptb-fs',   opt('font-size', cfg.btnFontSize) || sz.fs);
        el.style.setProperty('--ptb-pad',  opt('padding',   cfg.btnPadding)  || sz.pad);
        if (width)  el.style.setProperty('--ptb-width',  width);
        if (radius) el.style.setProperty('--ptb-radius', radius);
        el.tabIndex = 0;
        el.setAttribute('role', 'button');
        if (styleName === 'check') el.title = text;

        el.innerHTML = '';
        const icon  = doc.createElement('pt-done-icon');
        const label = doc.createElement('pt-done-label');
        icon.textContent  = '✓';
        label.textContent = text;
        el.appendChild(icon);
        el.appendChild(label);

        btnInfo[sec.id] = { el, label, styleName, doneText };

        const press = () => {
          if (el.classList.contains('is-done')) return;
          sec.classList.add('is-done');
          markDone(sec.id);
        };
        el.addEventListener('click', press);
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press(); }
        });

        if (doneSet.has(sec.id)) syncDoneBtn(sec.id);
      });
    }

    /* ── 定時 Modal ─────────────────────────────────────────────
       條件：載入起算滿 N 分鐘（牆鐘時間），且有效瀏覽的 section 數達標，
       兩者都成立才彈出，整個頁面生命週期只彈一次，不使用任何儲存機制。
       promoTarget 沒設定或找不到元素時，這整段安靜地什麼都不做。 ───── */
    const promoId   = String(cfg.promoTarget || '').trim().replace(/^#/, '');
    const promoSrc  = promoId ? doc.getElementById(promoId) : null;
    const promoEnabled = !!promoSrc;
    if (promoId && !promoSrc) {
      console.warn('[PracticeTracker] 找不到定時 Modal 的目標元素 #' + promoId + '，功能未啟用。');
    }

    const promoMin  = parseFloat(cfg.promoMinutes);
    const promoSec  = parseInt(cfg.promoMinSections, 10);
    const promoNeedMs   = (isNaN(promoMin) ? 5 : Math.max(0, promoMin)) * 60000;
    const promoNeedSec  = isNaN(promoSec) ? 4 : Math.max(0, promoSec);
    const promoIdleMs   = Math.max(0, (parseFloat(cfg.promoIdleSeconds) || 0) * 1000);
    const promoViewed   = new Set();
    const promoT0       = Date.now();
    let promoShown      = false;
    let promoPending    = false;
    let promoOpen       = false;
    let promoPollId     = 0;
    let promoLastScroll = 0;

    function promoMet() {
      return (Date.now() - promoT0) >= promoNeedMs && promoViewed.size >= promoNeedSec;
    }

    function promoReady() {
      return doc.visibilityState === 'visible'
        && (Date.now() - promoLastScroll) >= promoIdleMs
        && !doc.querySelector('.modal.show, .offcanvas.show');
    }

    function openPromo() {
      if (!promoEnabled || promoOpen) return false;
      if (!win.bootstrap || !win.bootstrap.Modal) {
        console.warn('[PracticeTracker] 找不到 Bootstrap Modal，已略過定時 Modal。');
        promoShown = true;
        return false;
      }
      promoShown = true;
      promoOpen  = true;

      const modalEl = doc.createElement('div');
      modalEl.className = 'modal fade pt-promo-modal';
      modalEl.id = 'pt-promo-' + Math.random().toString(36).slice(2, 9);
      modalEl.tabIndex = -1;
      modalEl.innerHTML =
        '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">' +
          '<div class="modal-content">' +
            '<div class="pt-promo-bar"></div>' +
            '<div class="pt-promo-head">' +
              '<button type="button" class="pt-promo-close" data-bs-dismiss="modal">×</button>' +
              '<div class="pt-promo-orn">◆</div>' +
            '</div>' +
            '<div class="modal-body pt-promo-body"></div>' +
            '<div class="pt-promo-foot">' +
              '<button type="button" class="pt-promo-btn" data-bs-dismiss="modal"></button>' +
            '</div>' +
          '</div>' +
        '</div>';

      if (cfg.promoTitle) {
        const t = doc.createElement('h5');
        t.className = 'pt-promo-title';
        t.textContent = cfg.promoTitle;
        const head = modalEl.querySelector('.pt-promo-head');
        head.insertBefore(t, head.querySelector('.pt-promo-orn'));
      }

      const bodyEl = modalEl.querySelector('.pt-promo-body');
      bodyEl.innerHTML = promoSrc.innerHTML;
      bodyEl.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      modalEl.querySelector('.pt-promo-btn').textContent = cfg.promoButtonLabel;

      doc.body.appendChild(modalEl);
      doc.body.classList.add('pt-promo-open');

      const modal = new win.bootstrap.Modal(modalEl);
      modalEl.addEventListener('hidden.bs.modal', () => {
        doc.body.classList.remove('pt-promo-open');
        promoOpen = false;
        doc.dispatchEvent(new CustomEvent(cfg.promoClosedEventName, {
          detail: { targetId: promoId },
        }));
        modal.dispose();
        modalEl.remove();
      });

      modal.show();
      doc.dispatchEvent(new CustomEvent(cfg.promoEventName, {
        detail: {
          targetId: promoId,
          viewedSections: Array.from(promoViewed),
          elapsedSeconds: Math.round((Date.now() - promoT0) / 1000),
        },
      }));
      return true;
    }

    function promoCheck() {
      if (!promoEnabled || promoShown || promoPending) return;
      if (!promoMet()) return;
      promoPending = true;
      promoPollId = setInterval(() => {
        if (promoShown) {
          clearInterval(promoPollId);
          promoPending = false;
          return;
        }
        if (!promoReady()) return;
        clearInterval(promoPollId);
        promoPending = false;
        openPromo();
      }, 500);
    }

    if (promoEnabled) {
      if (promoNeedSec > total) {
        console.warn('[PracticeTracker] 定時 Modal 要求瀏覽 ' + promoNeedSec +
          ' 個 section，但頁面只有 ' + total + ' 個，條件永遠無法達成。');
      }

      win.addEventListener('scroll', () => { promoLastScroll = Date.now(); }, { passive: true });
      doc.addEventListener('visibilitychange', promoCheck);

      if (promoNeedSec > 0) {
        if ('IntersectionObserver' in win) {
          const ratioRaw = parseFloat(cfg.promoViewRatio);
          const ratio    = isNaN(ratioRaw) ? 0.4 : Math.min(1, Math.max(0.05, ratioRaw));
          const dwellRaw = parseFloat(cfg.promoViewSeconds);
          const dwellMs  = (isNaN(dwellRaw) ? 2 : Math.max(0, dwellRaw)) * 1000;
          const dwellTimers = new Map();
          const thresholds  = [];
          for (let i = 0; i <= 20; i++) thresholds.push(i / 20);

          /* 兩種達標方式：區塊可見比例夠大，或可見高度已佔視窗高度夠大
             （後者是為了讓比視窗高很多的長 section 也能被計入） */
          const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              const id = entry.target.id;
              if (promoViewed.has(id)) return;
              const vh = (entry.rootBounds && entry.rootBounds.height) || win.innerHeight;
              const ok = entry.isIntersecting &&
                (entry.intersectionRatio >= ratio || entry.intersectionRect.height >= vh * ratio);
              if (ok && !dwellTimers.has(id)) {
                dwellTimers.set(id, setTimeout(() => {
                  dwellTimers.delete(id);
                  promoViewed.add(id);
                  io.unobserve(entry.target);
                  promoCheck();
                }, dwellMs));
              } else if (!ok && dwellTimers.has(id)) {
                clearTimeout(dwellTimers.get(id));
                dwellTimers.delete(id);
              }
            });
          }, { threshold: thresholds });

          sections.forEach(sec => io.observe(sec));
        } else {
          console.warn('[PracticeTracker] 瀏覽器不支援 IntersectionObserver，定時 Modal 無法計算瀏覽的 section。');
        }
      }

      setTimeout(promoCheck, promoNeedMs + 50);
      promoCheck();
    }

    win.PracticeTracker = {
      markDone,
      markPhraseCollected,
      changeShape,
      total,
      doneSet,
      phraseTotal,
      phraseDoneSet,
      phraseCollectedOrder,
      showPromo: openPromo,
      get promoState() {
        return {
          enabled:        promoEnabled,
          shown:          promoShown,
          viewedSections: promoViewed.size,
          viewedIds:      Array.from(promoViewed),
          needSections:   promoNeedSec,
          elapsedSeconds: Math.round((Date.now() - promoT0) / 1000),
          needSeconds:    Math.round(promoNeedMs / 1000),
        };
      },
      cfg,
    };
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
