(function () {
  'use strict';

  const cap     = s => s.charAt(0).toUpperCase() + s.slice(1);
  const addUnit = (v, u) => {
    if (!v) return null;
    return /[a-z%]$/i.test(String(v)) ? String(v) : v + u;
  };

  /* 不透明混色：前景色以 pct% 疊在底色上，回傳不透明的十六進位色碼。
     底色不是十六進位時退回 color-mix()，結果同樣不透明。
     用來取代所有半透明 rgba，畫面看起來相同，但沒有任何透明度。 */
  const hexToRgb = h => {
    if (typeof h !== 'string' || h.charAt(0) !== '#') return null;
    let t = h.slice(1);
    if (t.length === 3) t = t.split('').map(c => c + c).join('');
    if (t.length !== 6 || /[^0-9a-f]/i.test(t)) return null;
    return [0, 2, 4].map(i => parseInt(t.slice(i, i + 2), 16));
  };
  const solid = (fg, pct, bg) => {
    const a = hexToRgb(fg), b = hexToRgb(bg);
    if (!a || !b) return `color-mix(in srgb, ${fg} ${pct}%, ${bg})`;
    const k = pct / 100;
    return '#' + a.map((v, i) =>
      Math.round(v * k + b[i] * (1 - k)).toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  const BrandColors = {
    bg:       '#0C0D0C',
    region:   '#333333',
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
    info:     '#2351DB',
    indigo:   '#7849C9',
    pink:     '#FF91D7',
    orange:   '#EDA109',
    special:  '#B3DE73',
    stone:    '#82C8E5',
    gold:     '#C9973F',
  };

  /* ── 全域預設值 ── */
  const defaults = {
    defaultColor:       'sky',
    animDuration:       500,
    horizontalAnimDur:  380,
    defaultInterval:    500,
    borderWidth:        4,
    borderAllWidth:     null,
    borderTopWidth:     null,
    borderRightWidth:   null,
    borderBottomWidth:  null,
    borderLeftWidth:    null,
    borderStyle:        'solid',
    borderTopStyle:     null,
    borderRightStyle:   null,
    borderBottomStyle:  null,
    borderLeftStyle:    null,
    borderRadius:       '0 6px 6px 0',
    bgColor:            BrandColors.region,
    textColor:          BrandColors.shell,
    fontSize:           '1rem',
    padding:            '14px 18px 20px 20px',
    marginBottom:       '10px',
    countdownHeight:    3,
    countdownPosition:  'bottom',
    progressHeight:     4,
    progressPosition:   'bottom',
    progressTransition: 400,
    manualLabel:        '▶ 下一步',
    manualAlign:        'right',
    cascadeInterval:    0,
    colsPerRow:         4,
    btnWidth:           null,
    btnHeight:          null,
    btnFontSize:        null,
    btnPadding:         null,
    startBtnWidth:      null,
    startBtnHeight:     null,
    startBtnFontSize:   null,
    startBtnPadding:    null,
    resetBtnWidth:      null,
    resetBtnHeight:     null,
    resetBtnFontSize:   null,
    resetBtnPadding:    null,
    choiceFontSize:     null,   /* ir-choice 字體大小，null = 用 CSS 預設 0.95rem */
    choicePadding:      null,   /* ir-choice 內距，null = 用 CSS 預設 10px 14px   */
    fx:                 true,   /* false = 全域關閉電流動畫（ir-gold 與 fx="electric"） */
  };

  window.InfoRegionConfig = Object.assign({}, defaults, window.InfoRegionConfig || {});

  /* ── CSS 注入（每頁只執行一次）── */
  let _stylesInjected = false;

  function injectStyles() {
    if (_stylesInjected) return;
    _stylesInjected = true;

    const cfg    = window.InfoRegionConfig;
    const vDur   = cfg.animDuration + 'ms';
    const hDur   = cfg.horizontalAnimDur + 'ms';
    const defClr = BrandColors[cfg.defaultColor] || BrandColors.sky;
    const REGION = cfg.bgColor;     /* 區塊底色，測驗選項與解說的混色基準 */
    const PAGE   = BrandColors.bg;  /* 頁面底色，計分板的混色基準 */

    /* 色彩 variant：自動從 BrandColors 生成，新增色票只需修改上方物件 */
    const skip = new Set(['bg', 'region']);

    const COLOR_VARIANTS = Object.entries(BrandColors)
      .filter(([k]) => !skip.has(k))
      .map(([k, v]) =>
        `info-region[active="true"][color="${k}"]{border-left-color:${v}}`
      ).join('\n      ');

    const BTN_VARIANTS = Object.entries(BrandColors)
      .filter(([k]) => !skip.has(k))
      .map(([k, v]) =>
        `.ir-btn--${k}{border-color:${v};color:${v}}` +
        `.ir-btn--${k}:hover{background:${solid(v, 18, BrandColors.region)}}`
      ).join('\n      ');

    const css = `
      info-region {
        display: block;
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transform: translateY(10px);
        pointer-events: none;
        position: relative;
        border-left: ${cfg.borderWidth}px solid ${defClr};
        border-radius: ${cfg.borderRadius};
        font-size: ${cfg.fontSize};
        line-height: 1.75;
        transition:
          max-height  ${vDur} cubic-bezier(.4, 0, .2, 1),
          opacity     ${vDur} ease,
          transform   ${vDur} ease;
      }
      info-region[active="true"] {
        max-height: 4000px;
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
        margin-bottom: ${cfg.marginBottom};
        background: ${cfg.bgColor};
        color: ${cfg.textColor};
        padding: ${cfg.padding};
        border-left-color: ${defClr};
      }
      ${COLOR_VARIANTS}

      info-region-group[layout="horizontal"] {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ir-row-gap, 16px);
        align-items: stretch;
      }
      info-region-group[layout="horizontal"] info-region {
        flex: 1 1 var(--ir-col-min, 200px);
        max-height: none;
        overflow: visible;
        transform: translateX(-8px);
        padding: ${cfg.padding};
        margin-bottom: 0;
        transition: opacity ${hDur} ease, transform ${hDur} ease;
      }
      info-region-group[layout="horizontal"] info-region[active="true"] {
        max-height: none;
        transform: translateX(0);
        margin-bottom: 0;
      }

      .ir-col { display: flex; flex-direction: column; }

      .ir-countdown-bar {
        position: absolute;
        left: 0;
        width: 100%;
        transform-origin: left center;
        transform: scaleX(1);
        pointer-events: none;
        border-radius: 0 2px 2px 0;
      }

      .ir-manual-wrap { display: flex; margin-top: 14px; }
      .ir-manual-btn {
        font-size: 0.85rem;
        padding: 6px 16px;
        animation: ir-manual-in 0.25s ease forwards;
      }
      @keyframes ir-manual-in {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .ir-manual-btn.is-leaving {
        animation: ir-manual-out 0.18s ease forwards;
      }
      @keyframes ir-manual-out {
        from { opacity: 1; transform: translateY(0); }
        to   { opacity: 0; transform: translateY(-4px); }
      }

      info-region-group { display: block; }

      .ir-controls { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }

      .ir-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: ${BrandColors.region};
        border: 1px solid #555;
        border-radius: 6px;
        padding: 8px 20px;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 0.9rem;
        line-height: 1;
        cursor: pointer;
        color: ${BrandColors.shell};
        transition: background 0.2s, border-color 0.2s, color 0.2s;
        -webkit-user-select: none;
        user-select: none;
      }
      .ir-btn:hover { background: #3a3b3a; }
      ${BTN_VARIANTS}

      .ir-global-progress-wrap { display: flex; align-items: center; gap: 10px; }
      .ir-global-progress-track {
        flex: 1;
        position: relative;
        border-radius: 3px;
        background: #1e1f1e;
        overflow: hidden;
      }
      .ir-global-progress-bar {
        position: absolute;
        inset: 0;
        transform-origin: left center;
        transform: scaleX(0);
        border-radius: 3px;
      }
      .ir-global-percent {
        font-family: 'Space Mono', monospace;
        font-size: 0.72rem;
        min-width: 38px;
        text-align: right;
        opacity: 0;
        transition: opacity 0.3s ease;
        white-space: nowrap;
        letter-spacing: 0.03em;
      }

      info-region h1, info-region h2, info-region h3,
      info-region h4, info-region h5, info-region h6 {
        color: inherit; margin-bottom: 6px;
      }
      info-region p  { margin-bottom: 4px; }
      info-region p:last-child { margin-bottom: 0; }
      info-region ul, info-region ol { padding-left: 18px; }
      info-region li { margin-bottom: 3px; }

      /* ══ 金箔特別版：class="ir-gold" ══
         用於步驟序列的第一步（開場）或最後一步（結尾），
         視覺獨特，與中間普通步驟明顯區隔。            */
      info-region.ir-gold[active="true"] {
        background: linear-gradient(
          150deg,
          #1A1200 0%,
          #2E2000 40%,
          #1F1700 70%,
          #1A1200 100%
        ) !important;
        border-left: 4px solid #C9973F !important;
        border-top: 1px solid rgba(185,140,55,0.82) !important;
        border-right: 1px solid rgba(185,140,55,0.82) !important;
        border-bottom: 1px solid rgba(185,140,55,0.82) !important;
        border-radius: 6px !important;
        color: #EFD9A2 !important;
      }
      /* 掃光動畫：不透明的黑到暗金漸層，用 screen 混合模式疊加，黑色部分不改變底色 */
      info-region.ir-gold::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
          102deg,
          #000000 25%,
          #2B2008 50%,
          #000000 75%
        );
        background-size: 200% 100%;
        mix-blend-mode: screen;
        animation: ir-gold-shimmer 4s ease-in-out infinite;
      }
      @keyframes ir-gold-shimmer {
        0%   { background-position: -60% center; }
        100% { background-position: 160% center; }
      }
      info-region.ir-gold > *:not(.ir-countdown-bar):not(.ir-fx-bolt) {
        position: relative;
        z-index: 1;
      }

      /* ══ 電流特效 ══
         class="ir-gold" 預設開啟，其他顏色加 fx="electric"，fx="off" 關閉。
         所有顏色皆為不透明色。                                              */
      info-region.ir-gold {
        --ir-fx-edge: #C9973F;
        --ir-fx-dim:  #6B4F12;
        --ir-fx-core: #D4FFFC;
      }
      @property --ir-fx-angle {
        syntax: '<angle>';
        inherits: false;
        initial-value: 0deg;
      }
      @keyframes ir-fx-spin { to { --ir-fx-angle: 360deg; } }
      @keyframes ir-fx-glow {
        0%, 100% { box-shadow: 0 0 10px var(--ir-fx-dim); }
        7%       { box-shadow: 0 0 22px var(--ir-fx-edge); }
        9%       { box-shadow: 0 0 6px  var(--ir-fx-dim); }
        12%      { box-shadow: 0 0 28px var(--ir-fx-core); }
        16%      { box-shadow: 0 0 12px var(--ir-fx-edge); }
        55%      { box-shadow: 0 0 10px var(--ir-fx-dim); }
        58%      { box-shadow: 0 0 20px var(--ir-fx-edge); }
        60%      { box-shadow: 0 0 8px  var(--ir-fx-dim); }
      }
      @keyframes ir-fx-bolt {
        0%, 100% { background: var(--ir-fx-core); }
        7%       { background: var(--ir-fx-dim); }
        9%       { background: var(--ir-fx-core); }
        12%      { background: var(--ir-fx-edge); }
        15%      { background: var(--ir-fx-core); }
        56%      { background: var(--ir-fx-core); }
        58%      { background: var(--ir-fx-dim); }
        61%      { background: var(--ir-fx-core); }
      }
      /* 光暈明滅 */
      info-region[data-ir-fx="electric"][active="true"] {
        animation: ir-fx-glow 3.6s linear infinite;
      }
      /* 沿內緣繞行的電流環 */
      info-region[data-ir-fx="electric"][active="true"]::after {
        content: '';
        position: absolute;
        inset: 0;
        padding: 2px;
        border-radius: inherit;
        pointer-events: none;
        background: conic-gradient(from var(--ir-fx-angle, 0deg),
          var(--ir-fx-dim) 0deg,
          var(--ir-fx-dim) 190deg,
          var(--ir-fx-edge) 270deg,
          var(--ir-fx-core) 335deg,
          var(--ir-fx-dim) 360deg);
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        mask-composite: exclude;
        animation: ir-fx-spin 2.6s linear infinite;
      }
      /* 右上角閃爍的閃電（由腳本加入） */
      .ir-fx-bolt {
        position: absolute;
        top: 10px;
        right: 12px;
        width: 11px;
        height: 18px;
        z-index: 2;
        pointer-events: none;
        background: var(--ir-fx-core);
        clip-path: polygon(62% 0, 8% 56%, 44% 56%, 30% 100%, 92% 38%, 56% 38%);
        animation: ir-fx-bolt 3.6s linear infinite;
      }

      /* ══ 測驗模式 ══ */

      /* 選項容器 */
      ir-choices {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 16px;
      }
      ir-choices[layout="column"] {
        grid-template-columns: 1fr;
      }

      /* 單一選項 */
      ir-choice {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: ${cfg.choicePadding || '10px 14px'};
        background: ${solid('#FFFFFF', 5, REGION)};
        border: 1.5px solid ${solid(BrandColors.shell, 22, REGION)};
        border-radius: 6px;
        cursor: pointer;
        font-size: ${cfg.choiceFontSize ? addUnit(cfg.choiceFontSize, 'rem') : '0.95rem'};
        line-height: 1.45;
        color: ${BrandColors.shell};
        transition: background 0.18s, border-color 0.18s;
        position: relative;
        -webkit-user-select: none;
        user-select: none;
      }
      ir-choice:hover:not([disabled]) {
        background: ${solid(BrandColors.sky, 12, REGION)};
        border-color: ${solid(BrandColors.sky, 55, REGION)};
      }
      ir-choice[disabled] { cursor: default; }

      /* 選項標籤字母圓圈 */
      .ir-choice-key {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1.5px solid ${solid(BrandColors.shell, 40, REGION)};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0;
        color: ${BrandColors.shell};
        transition: background 0.18s, border-color 0.18s, color 0.18s;
      }

      /* 答對 */
      ir-choice[state="correct"] {
        background: ${solid(BrandColors.safe, 15, REGION)};
        border-color: ${BrandColors.safe};
      }
      ir-choice[state="correct"] .ir-choice-key {
        background: ${BrandColors.safe};
        border-color: ${BrandColors.safe};
        color: #0C0D0C;
      }

      /* 答錯（被選的那個） */
      ir-choice[state="wrong"] {
        background: ${solid(BrandColors.warning, 15, REGION)};
        border-color: ${BrandColors.warning};
      }
      ir-choice[state="wrong"] .ir-choice-key {
        background: ${BrandColors.warning};
        border-color: ${BrandColors.warning};
        color: #fff;
      }

      /* 其他未選但正確的選項（顯示正解） */
      ir-choice[state="reveal"] {
        background: ${solid(BrandColors.safe, 8, REGION)};
        border-color: ${solid(BrandColors.safe, 45, REGION)};
      }
      ir-choice[state="reveal"] .ir-choice-key {
        border-color: ${BrandColors.safe};
        color: ${BrandColors.safe};
      }

      /* 解說區塊 */
      .ir-quiz-explain {
        margin-top: 14px;
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 0.9rem;
        line-height: 1.5;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.28s ease, transform 0.28s ease;
        pointer-events: none;
      }
      .ir-quiz-explain.is-visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      .ir-quiz-explain.is-correct {
        background: ${solid(BrandColors.safe, 12, REGION)};
        border: 1px solid ${solid(BrandColors.safe, 40, REGION)};
        color: #a5e6bc;
      }
      .ir-quiz-explain.is-wrong {
        background: ${solid(BrandColors.warning, 12, REGION)};
        border: 1px solid ${solid(BrandColors.warning, 40, REGION)};
        color: #f0a0a8;
      }
      .ir-quiz-explain code {
        font-family: 'Space Mono', monospace;
        font-size: 0.88em;
        background: ${solid('#FFFFFF', 10, REGION)};
        padding: 1px 5px;
        border-radius: 3px;
      }
      .ir-quiz-explain br { display: block; content: ''; margin-top: 4px; }
      .ir-quiz-explain strong, .ir-quiz-explain b { font-weight: 700; }
      .ir-quiz-explain em, .ir-quiz-explain i { font-style: italic; }
      .ir-quiz-explain u { text-decoration: underline; }
      .ir-quiz-explain small { font-size: 0.82em; opacity: 0.82; }

      /* 答題後的繼續按鈕 */
      .ir-quiz-next-wrap {
        display: flex;
        margin-top: 14px;
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 0.25s ease 0.15s, transform 0.25s ease 0.15s;
        pointer-events: none;
      }
      .ir-quiz-next-wrap.is-visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      /* 重試按鈕列 */
      .ir-quiz-retry-wrap {
        display: flex;
        justify-content: flex-start;
        margin-top: 8px;
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 0.25s ease 0.25s, transform 0.25s ease 0.25s;
        pointer-events: none;
      }
      .ir-quiz-retry-wrap.is-visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      .ir-quiz-retry-wrap .ir-btn {
        font-size: 0.8rem;
        padding: 4px 13px;
      }

      /* 題號標籤 */
      .ir-quiz-label {
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        color: ${solid(BrandColors.shell, 50, REGION)};
        margin-bottom: 8px;
        font-family: 'Space Mono', monospace;
      }

      /* 計分板 */
      .ir-quiz-scoreboard {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 14px 20px;
        background: ${solid('#FFFFFF', 4, PAGE)};
        border: 1px solid ${solid(BrandColors.shell, 15, PAGE)};
        border-radius: 6px;
        margin-top: 16px;
        font-size: 0.88rem;
        color: ${BrandColors.shell};
      }
      .ir-quiz-score-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
      .ir-quiz-score-val {
        font-size: 1.6rem;
        font-family: 'Space Mono', monospace;
        line-height: 1;
      }
      .ir-quiz-score-lbl { font-size: 0.68rem; color: ${solid(BrandColors.shell, 60, PAGE)}; letter-spacing: 0.06em; }
      .ir-quiz-score-divider { width: 1px; height: 36px; background: ${solid(BrandColors.shell, 18, PAGE)}; }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'info-region-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  class InfoRegion extends HTMLElement {
    static get observedAttributes() {
      return [
        'active', 'color',
        'border-width',
        'border-top-width', 'border-right-width',
        'border-bottom-width', 'border-left-width',
        'border-style',
        'border-top-style', 'border-right-style',
        'border-bottom-style', 'border-left-style',
        'fx', 'fx-core', 'fx-dim',
      ];
    }

    connectedCallback() {
      injectStyles();
      if (!this._irConnected) {
        this._irConnected = true;
        if (this.getAttribute('active') === 'true') {
          requestAnimationFrame(() => this._onActivated());
        }
      }
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (name === 'active') {
        if (newVal === 'true' && oldVal !== 'true') this._onActivated();
      } else if (this.getAttribute('active') === 'true') {
        this._applyBorderStyles();
        this._applyFx();
      }
    }

    _onActivated() {
      this._applyBorderStyles();
      this._applyFx();

      /* ── 測驗模式優先接管 ── */
      if (this.hasAttribute('quiz')) {
        this._setupQuiz();
        return;
      }

      if (this.hasAttribute('manual') && this.getAttribute('next')) {
        this._insertManualButton();
        return;
      }

      const grp = this.closest('info-region-group');
      if (grp && (
        grp.hasAttribute('global-progress') ||
        parseInt(grp.getAttribute('cascade-interval'), 10) > 0
      )) return;

      if (this.hasAttribute('countdown') && !(grp && grp.hasAttribute('global-progress'))) {
        this._startCountdown();
      } else {
        this._triggerNext(this._getInterval());
      }
    }

    _applyBorderStyles() {
      const cfg  = window.InfoRegionConfig;
      const hex  = BrandColors[this.getAttribute('color') || cfg.defaultColor] || BrandColors.sky;
      const allW = this.getAttribute('border-width');
      const allS = this.getAttribute('border-style');

      ['top', 'right', 'bottom', 'left'].forEach(side => {
        const C = cap(side), p = 'border' + C;

        const aw  = this.getAttribute(`border-${side}-width`) ?? allW;
        const cfW = cfg[`border${C}Width`] ?? cfg.borderAllWidth ?? (side === 'left' ? cfg.borderWidth : 0);
        const w   = parseInt(aw ?? cfW, 10) || 0;

        const as = this.getAttribute(`border-${side}-style`) ?? allS;
        const s  = as || cfg[`border${C}Style`] || cfg.borderStyle || 'solid';

        this.style[`${p}Width`] = w + 'px';
        this.style[`${p}Style`] = w > 0 ? s : 'none';
        this.style[`${p}Color`] = hex;
      });
    }

    _clearBorderStyles() {
      ['top', 'right', 'bottom', 'left'].forEach(side => {
        const p = 'border' + cap(side);
        this.style[`${p}Width`] = this.style[`${p}Style`] = this.style[`${p}Color`] = '';
      });
    }

    /* 電流特效：ir-gold 預設開啟，其他顏色要加 fx="electric"。
       fx="off" 或 InfoRegionConfig.fx = false 則關閉。可用 fx-core、fx-dim 自訂亮點色與暗部色。 */
    _applyFx() {
      const cfg  = window.InfoRegionConfig;
      const gold = this.classList.contains('ir-gold');
      const mode = this.getAttribute('fx') || (gold ? 'electric' : '');
      const on   = cfg.fx !== false && mode === 'electric';
      const bolt = this.querySelector(':scope > .ir-fx-bolt');

      if (!on) {
        this.removeAttribute('data-ir-fx');
        ['--ir-fx-edge', '--ir-fx-dim', '--ir-fx-core'].forEach(k => this.style.removeProperty(k));
        if (bolt) bolt.remove();
        return;
      }

      const edge = gold
        ? BrandColors.gold
        : (BrandColors[this.getAttribute('color') || cfg.defaultColor] || BrandColors.sky);
      const dim  = this.getAttribute('fx-dim')  || (gold ? '#6B4F12' : solid('#000000', 55, edge));
      const core = this.getAttribute('fx-core') || BrandColors.focus;

      this.setAttribute('data-ir-fx', 'electric');
      this.style.setProperty('--ir-fx-edge', edge);
      this.style.setProperty('--ir-fx-dim',  dim);
      this.style.setProperty('--ir-fx-core', core);

      if (!bolt) {
        const b = document.createElement('span');
        b.className = 'ir-fx-bolt';
        this.appendChild(b);
      }
    }

    _insertManualButton() {
      if (this.querySelector('.ir-manual-wrap')) return;

      const cfg   = window.InfoRegionConfig;
      const label = this.getAttribute('manual-label') || cfg.manualLabel;
      const color = this.getAttribute('manual-color') || this.getAttribute('color') || cfg.defaultColor;
      const align = this.getAttribute('manual-align') || cfg.manualAlign;
      const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };

      const wrap = document.createElement('div');
      wrap.className = 'ir-manual-wrap';
      wrap.style.justifyContent = justifyMap[align] || 'flex-end';

      const btn = document.createElement('button');
      btn.className = `ir-btn ir-manual-btn ir-btn--${color}`;
      btn.textContent = label;

      btn.addEventListener('click', () => {
        btn.classList.add('is-leaving');
        btn.addEventListener('animationend', () => {
          wrap.remove();
          this._triggerNext(0);
        }, { once: true });
      });

      wrap.appendChild(btn);
      this.appendChild(wrap);
    }

    _startCountdown() {
      const cfg      = window.InfoRegionConfig;
      const duration = parseInt(this.getAttribute('countdown'), 10) || 2000;
      const position = this.getAttribute('countdown-position') || cfg.countdownPosition;
      const height   = parseInt(this.getAttribute('countdown-height'), 10) || cfg.countdownHeight;
      const color    = this.getAttribute('countdown-color') || this.getAttribute('color') || cfg.defaultColor;
      const colorHex = BrandColors[color] || BrandColors.sky;

      const old = this.querySelector('.ir-countdown-bar');
      if (old) old.remove();

      const bar = document.createElement('div');
      bar.className = 'ir-countdown-bar';
      Object.assign(bar.style, {
        height:     height + 'px',
        background: colorHex,
        [position]: '0',
        transition: `transform ${duration}ms linear`,
      });
      this.appendChild(bar);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => { bar.style.transform = 'scaleX(0)'; });
      });

      setTimeout(() => this._triggerNext(0), duration);
    }

    _triggerNext(delay) {
      const nextId = this.getAttribute('next');
      if (!nextId) return;
      setTimeout(() => {
        const el = document.getElementById(nextId);
        if (el) el.setAttribute('active', 'true');
        else console.warn(`[InfoRegion] 找不到 id="${nextId}" 的元素。`);
      }, delay);
    }

    _getInterval() {
      return parseInt(this.getAttribute('next-interval'), 10) ||
             window.InfoRegionConfig.defaultInterval;
    }

    activate() { this.setAttribute('active', 'true'); }

    reset() {
      this._irConnected = false;
      this._quizAnswered = false;
      this.removeAttribute('active');
      this._clearBorderStyles();
      this.querySelector('.ir-countdown-bar')?.remove();
      this.querySelector('.ir-manual-wrap')?.remove();
      /* 測驗模式：還原選項狀態 */
      this.querySelectorAll('ir-choice').forEach(c => {
        c.removeAttribute('state');
        c.removeAttribute('disabled');
      });
      this.querySelector('.ir-quiz-explain')?.remove();
      this.querySelector('.ir-quiz-next-wrap')?.remove();
      this.querySelector('.ir-quiz-retry-wrap')?.remove();
    }

    /* ── 測驗模式核心 ── */
    _setupQuiz() {
      if (this._quizAnswered) return;   /* 重試同一題時不重複渲染 */

      const answer      = (this.getAttribute('answer') || '').trim().toLowerCase();
      const correctNext = this.getAttribute('correct-next');
      const wrongNext   = this.getAttribute('wrong-next');
      const _nd         = parseInt(this.getAttribute('quiz-next-delay'), 10);
      const nextDelay   = Number.isNaN(_nd) ? 1200 : _nd;
      const explainTxt  = this.getAttribute('explain') || '';
      const correctMsg  = this.getAttribute('correct-msg')  || '✓ 答對了！';
      const wrongMsg    = this.getAttribute('wrong-msg')    || '✗ 答錯了。';
      const nextLabel   = this.getAttribute('quiz-next-label') || '繼續 ▶';
      const nextColor   = this.getAttribute('color') || window.InfoRegionConfig.defaultColor;
      const autoNext    = !this.hasAttribute('manual-next');  /* 預設自動跳題 */
      const showRetry   = this.hasAttribute('show-retry');
      const retryLabel  = this.getAttribute('retry-label') || '↺ 重試';
      const retryColor  = this.getAttribute('retry-color') || 'warning';

      /* 題號標籤（可選） */
      const labelTxt = this.getAttribute('quiz-label');
      if (labelTxt && !this.querySelector('.ir-quiz-label')) {
        const lbl = document.createElement('div');
        lbl.className = 'ir-quiz-label';
        lbl.textContent = labelTxt;
        this.insertBefore(lbl, this.firstChild);
      }

      /* 收集選項 */
      const choices = Array.from(this.querySelectorAll('ir-choice'));
      const keys    = 'ABCDEFGHIJKLMNOP';

      choices.forEach((ch, i) => {
        /* 注入字母圈（只做一次） */
        if (!ch.querySelector('.ir-choice-key')) {
          const keyEl = document.createElement('span');
          keyEl.className = 'ir-choice-key';
          keyEl.textContent = keys[i] || String(i + 1);
          ch.insertBefore(keyEl, ch.firstChild);
        }
        /* 注入後立即將已解析的 font-size 同步到圓圈 */
        if (typeof ch._applyKeySize === 'function') {
          const resolvedFs = ch.style.fontSize ||
            window.InfoRegionConfig.choiceFontSize ||
            (this.getAttribute('choice-font-size'));
          if (resolvedFs) ch._applyKeySize(resolvedFs);
        }

        ch.removeAttribute('disabled');
        ch.removeAttribute('state');

        ch.addEventListener('click', () => {
          if (ch.hasAttribute('disabled') || this._quizAnswered) return;

          const chosen = (ch.getAttribute('value') || '').trim().toLowerCase();
          const correct = chosen === answer;
          this._quizAnswered = true;

          /* 通知 group 計分 */
          const grp = this.closest('info-region-group');
          if (grp?._recordQuizResult) grp._recordQuizResult(this.id, correct);

          /* 鎖定所有選項 */
          choices.forEach(c => c.setAttribute('disabled', ''));

          /* 標記狀態 */
          ch.setAttribute('state', correct ? 'correct' : 'wrong');
          if (!correct) {
            choices
              .filter(c => (c.getAttribute('value') || '').trim().toLowerCase() === answer)
              .forEach(c => c.setAttribute('state', 'reveal'));
          }

          /* 解說文字（支援基本 HTML 標籤：<b> <strong> <i> <em> <u> <br> <span> <code> <small>） */
          const explainEl = document.createElement('div');
          explainEl.className = `ir-quiz-explain ${correct ? 'is-correct' : 'is-wrong'}`;
          const msgHtml     = correct ? correctMsg : wrongMsg;
          const explainHtml = explainTxt ? '　' + explainTxt : '';
          explainEl.innerHTML = msgHtml + explainHtml;
          this.appendChild(explainEl);
          requestAnimationFrame(() => explainEl.classList.add('is-visible'));

          /* 重試按鈕（show-retry 屬性啟用，答對也顯示） */
          if (showRetry) {
            const retryWrap = document.createElement('div');
            retryWrap.className = 'ir-quiz-retry-wrap';

            const retryBtn = document.createElement('button');
            retryBtn.className = `ir-btn ir-manual-btn ir-btn--${retryColor}`;
            retryBtn.textContent = retryLabel;

            retryBtn.addEventListener('click', () => {
              /* 原地重置：還原選項狀態，清除解說與按鈕列，重新執行 _setupQuiz */
              this._quizAnswered = false;
              this.querySelectorAll('ir-choice').forEach(c => {
                c.removeAttribute('state');
                c.removeAttribute('disabled');
              });
              this.querySelector('.ir-quiz-explain')?.remove();
              this.querySelector('.ir-quiz-next-wrap')?.remove();
              this.querySelector('.ir-quiz-retry-wrap')?.remove();
              this._setupQuiz();
            });

            retryWrap.appendChild(retryBtn);
            this.appendChild(retryWrap);
            requestAnimationFrame(() => retryWrap.classList.add('is-visible'));
          }

          /* 決定下一個 id */
          const nextId = correct ? correctNext : wrongNext;

          if (autoNext && nextId) {
            setTimeout(() => this._triggerNextById(nextId), nextDelay);
          } else if (nextId) {
            /* 手動繼續按鈕 */
            const wrap = document.createElement('div');
            wrap.className = 'ir-quiz-next-wrap';
            const justifyMap = { left:'flex-start', center:'center', right:'flex-end' };
            const align = this.getAttribute('manual-align') ||
                          window.InfoRegionConfig.manualAlign;
            wrap.style.justifyContent = justifyMap[align] || 'flex-end';

            const btn = document.createElement('button');
            btn.className = `ir-btn ir-manual-btn ir-btn--${nextColor}`;
            btn.textContent = nextLabel;
            btn.addEventListener('click', () => {
              btn.classList.add('is-leaving');
              btn.addEventListener('animationend', () => {
                wrap.remove();
                this._triggerNextById(nextId);
              }, { once: true });
            });

            wrap.appendChild(btn);
            this.appendChild(wrap);
            requestAnimationFrame(() => wrap.classList.add('is-visible'));
          }
          /* nextId 為 null → 本題為終點，不跳轉 */
        }, { once: false });
      });
    }

    _triggerNextById(id) {
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.setAttribute('active', 'true');
      else console.warn(`[InfoRegion] 找不到 id="${id}" 的元素。`);
    }
  }

  class InfoRegionGroup extends HTMLElement {
    constructor() {
      super();
      this._progressBar    = null;
      this._percentEl      = null;
      this._observer       = null;
      this._answeredSet    = new Set();   /* 已答對的題目 id，防進度條倒退 */
      this._quizScore      = { correct: 0, wrong: 0 };
      this._scoreboardEl   = null;
    }

    connectedCallback() {
      injectStyles();
      if (this._irGroupBuilt) return;
      this._irGroupBuilt = true;
      Promise.resolve().then(() => this._build());
    }

    disconnectedCallback() {
      this._observer?.disconnect();
    }

    _getChildren() {
      return Array.from(this.querySelectorAll('info-region'));
    }

    _build() {
      this._setupLayout();
      this._setupControls();
      if (this.hasAttribute('global-progress')) {
        this._setupGlobalProgress();
        this._setupObserver();
      }
      if (this.hasAttribute('show-score')) {
        this._setupScoreboard();
      }
      if (this.hasAttribute('auto-start')) {
        Promise.resolve().then(() => this._start());
      }
    }

    /* 記錄單題答題結果 */
    _recordQuizResult(id, correct) {
      if (correct) {
        if (!this._answeredSet.has(id)) {
          this._answeredSet.add(id);
          this._quizScore.correct++;
        }
      } else {
        /* 答錯且本題從未答對過，才累加 wrong */
        if (!this._answeredSet.has(id)) {
          this._quizScore.wrong++;
        }
      }
      this._updateScoreboard();
    }

    _setupScoreboard() {
      const board = document.createElement('div');
      board.className = 'ir-quiz-scoreboard';

      const mkItem = (val, lbl) => {
        const item = document.createElement('div');
        item.className = 'ir-quiz-score-item';
        const v = document.createElement('span');
        v.className = 'ir-quiz-score-val';
        v.textContent = val;
        const l = document.createElement('span');
        l.className = 'ir-quiz-score-lbl';
        l.textContent = lbl;
        item.append(v, l);
        return { item, val: v };
      };

      const divider = () => {
        const d = document.createElement('div');
        d.className = 'ir-quiz-score-divider';
        return d;
      };

      const { item: cItem, val: cVal } = mkItem('0', '答對');
      const { item: wItem, val: wVal } = mkItem('0', '答錯');
      const { item: tItem, val: tVal } = mkItem('0', '總題數');
      cVal.style.color = BrandColors.safe;
      wVal.style.color = BrandColors.warning;

      board.append(cItem, divider(), wItem, divider(), tItem);
      this._scoreboardEl = { board, cVal, wVal, tVal };

      /* 插在 controls 後面或最前面 */
      const controls = this.querySelector('.ir-controls');
      if (controls) controls.insertAdjacentElement('afterend', board);
      else this.insertBefore(board, this.firstChild);
    }

    _updateScoreboard() {
      if (!this._scoreboardEl) return;
      const { cVal, wVal, tVal } = this._scoreboardEl;
      const total = this._quizScore.correct + this._quizScore.wrong;
      cVal.textContent = String(this._quizScore.correct);
      wVal.textContent = String(this._quizScore.wrong);
      tVal.textContent = String(total);
    }

    _setupLayout() {
      if (this.getAttribute('layout') !== 'horizontal') return;

      const cfg    = window.InfoRegionConfig;
      const perRow = parseInt(this.getAttribute('cols-per-row'), 10) || cfg.colsPerRow || 4;
      const gap    = this.getAttribute('gutter-size') || '16px';
      const rowGap = this.getAttribute('row-gap')     || gap;
      const pct    = Math.floor(100 / perRow) - 1;

      this.style.setProperty('--ir-col-min', pct + '%');
      this.style.setProperty('--ir-row-gap', rowGap);
      this.style.gap = rowGap;
    }

    _setupControls() {
      if (this.getAttribute('show-controls') === 'false') return;

      const div = document.createElement('div');
      div.className = 'ir-controls';

      const mkBtn = (label, color) => {
        const b = document.createElement('button');
        b.className = `ir-btn ir-btn--${color}`;
        b.textContent = label;
        return b;
      };

      const startBtn = mkBtn(
        this.getAttribute('start-label') || '▶ 開始',
        this.getAttribute('start-color') || 'sky'
      );
      const resetBtn = mkBtn(
        this.getAttribute('reset-label') || '↺ 重設',
        this.getAttribute('reset-color') || 'warning'
      );

      startBtn.addEventListener('click', () => this._start());
      resetBtn.addEventListener('click', () => this._reset());

      this._applyBtnStyles(startBtn, 'start');
      this._applyBtnStyles(resetBtn, 'reset');

      div.append(startBtn, resetBtn);
      this.insertBefore(div, this.firstChild);
    }

    _applyBtnStyles(btn, prefix) {
      const cfg = window.InfoRegionConfig;
      const pre = prefix + 'Btn';

      const resolve = (a, ck, fa, fck) => {
        const av = this.getAttribute(a);      if (av != null) return av;
        if (cfg[ck]  != null) return String(cfg[ck]);
        const fv = fa && this.getAttribute(fa); if (fv != null) return fv;
        if (fck && cfg[fck] != null) return String(cfg[fck]);
        return null;
      };

      const w  = resolve(`${prefix}-width`,     `${pre}Width`,    'btn-width',     'btnWidth');
      const h  = resolve(`${prefix}-height`,    `${pre}Height`,   'btn-height',    'btnHeight');
      const fs = resolve(`${prefix}-font-size`, `${pre}FontSize`, 'btn-font-size', 'btnFontSize');
      const pa = resolve(`${prefix}-padding`,   `${pre}Padding`,  'btn-padding',   'btnPadding');

      if (w)  btn.style.width    = addUnit(w, 'px');
      if (h)  btn.style.height   = addUnit(h, 'px');
      if (fs) btn.style.fontSize = addUnit(fs, 'rem');
      if (pa) btn.style.padding  = pa;
    }

    _setupGlobalProgress() {
      const cfg      = window.InfoRegionConfig;
      const position = this.getAttribute('progress-position') || cfg.progressPosition;
      const height   = parseInt(this.getAttribute('progress-height'), 10) || cfg.progressHeight;
      const color    = this.getAttribute('progress-color') || cfg.defaultColor;
      const colorHex = BrandColors[color] || BrandColors.sky;
      const showPct  = this.hasAttribute('show-percent');

      const wrap  = document.createElement('div');
      wrap.className = 'ir-global-progress-wrap';
      wrap.style[position === 'top' ? 'marginBottom' : 'marginTop'] = '12px';

      const track = document.createElement('div');
      track.className = 'ir-global-progress-track';
      track.style.height = height + 'px';

      const bar = document.createElement('div');
      bar.className = 'ir-global-progress-bar';
      bar.style.background = colorHex;
      track.appendChild(bar);
      this._progressBar = bar;
      wrap.appendChild(track);

      if (showPct) {
        const pct = document.createElement('span');
        pct.className = 'ir-global-percent';
        pct.style.color = colorHex;
        pct.textContent = '0%';
        wrap.appendChild(pct);
        this._percentEl = pct;
      }

      if (position === 'top') {
        const controls = this.querySelector('.ir-controls');
        (controls ? controls : this).insertAdjacentElement(
          controls ? 'afterend' : 'afterbegin', wrap
        );
      } else {
        this.appendChild(wrap);
      }
    }

    _setupObserver() {
      this._observer = new MutationObserver(() => this._updateProgress());
      this._getChildren().forEach(child => {
        this._observer.observe(child, { attributes: true, attributeFilter: ['active'] });
      });
    }

    _updateProgress() {
      if (!this._progressBar) return;
      const children = this._getChildren();

      /* 若有 quiz-item 屬性，只統計題目型區塊（不含解說區塊） */
      const quizItems = children.filter(el => el.hasAttribute('quiz-item'));
      const countBase = quizItems.length > 0 ? quizItems : children;

      /* 已答對的集合（不因重試倒退）優先；若非測驗群組則用 active 計數 */
      let ratio = 0;
      if (quizItems.length > 0) {
        ratio = countBase.length > 0
          ? Math.min(this._answeredSet.size / countBase.length, 1)
          : 0;
      } else {
        ratio = countBase.length > 0
          ? countBase.filter(el => el.getAttribute('active') === 'true').length / countBase.length
          : 0;
      }

      this._progressBar.style.transform = `scaleX(${ratio})`;

      if (this._percentEl) {
        this._percentEl.textContent = Math.round(ratio * 100) + '%';
        if (ratio > 0) this._percentEl.style.opacity = '1';
      }
    }

    _start() {
      this._reset(false);

      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (this._progressBar) {
          this._progressBar.style.transition =
            `transform ${window.InfoRegionConfig.progressTransition}ms ease`;
        }

        const children  = this._getChildren();
        if (!children.length) return;

        const cascadeMs = parseInt(this.getAttribute('cascade-interval'), 10) ||
                          window.InfoRegionConfig.cascadeInterval;

        if (cascadeMs > 0) {
          children.forEach((c, i) => setTimeout(() => c.activate(), i * cascadeMs));
        } else {
          children[0].activate();
        }
      }));
    }

    _reset(reenableTransition = true) {
      this._answeredSet.clear();
      this._quizScore   = { correct: 0, wrong: 0 };
      this._updateScoreboard();
      this._getChildren().forEach(el => el.reset());

      if (this._progressBar) {
        this._progressBar.style.transition = 'none';
        this._progressBar.style.transform  = 'scaleX(0)';
        if (reenableTransition) {
          requestAnimationFrame(() => {
            if (this._progressBar) {
              this._progressBar.style.transition =
                `transform ${window.InfoRegionConfig.progressTransition}ms ease`;
            }
          });
        }
      }

      if (this._percentEl) {
        this._percentEl.textContent = '0%';
        this._percentEl.style.opacity = '0';
      }
    }

    start() { this._start(); }
    reset() { this._reset(); }
  }

  /* ── ir-choices / ir-choice：純語意容器，邏輯由 InfoRegion 驅動 ── */
  class IrChoices extends HTMLElement {}
  class IrChoice  extends HTMLElement {
    connectedCallback() {
      /* 確保 role 語意 */
      if (!this.getAttribute('role')) this.setAttribute('role', 'button');
      if (!this.getAttribute('tabindex')) this.setAttribute('tabindex', '0');

      /* ── 字體大小與內距：屬性 > 父 info-region 屬性 > InfoRegionConfig ── */
      this._applyChoiceStyles();

      /* 鍵盤支援 */
      this.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && !this.hasAttribute('disabled')) {
          e.preventDefault();
          this.click();
        }
      });
    }

    static get observedAttributes() {
      return ['choice-font-size', 'choice-padding'];
    }

    attributeChangedCallback() {
      this._applyChoiceStyles();
    }

    _applyChoiceStyles() {
      const cfg    = window.InfoRegionConfig;
      const region = this.closest('info-region');

      /* 解析優先順序：自身屬性 > 最近 info-region 屬性 > InfoRegionConfig */
      const resolveAttr = (attrName, cfgKey) => {
        const self = this.getAttribute(attrName);
        if (self != null) return self;
        const parent = region && region.getAttribute(attrName);
        if (parent != null) return parent;
        return cfg[cfgKey] != null ? String(cfg[cfgKey]) : null;
      };

      const fs = resolveAttr('choice-font-size', 'choiceFontSize');
      const pa = resolveAttr('choice-padding',   'choicePadding');

      if (fs) {
        this.style.fontSize = addUnit(fs, 'rem');
        this._applyKeySize(fs);
      }
      if (pa) this.style.padding = pa;
    }

    /* 讓 .ir-choice-key 圓圈的尺寸與字體跟隨 choice-font-size
       基準：choice-font-size = 0.95rem 時圓圈 24px / 字 0.75rem
       換算：圓圈 = fontSize_px * 1.45（無單位 rem 值 × 16 × 1.45）
             key 字 = fontSize_px * 0.79                              */
    _applyKeySize(fsValue) {
      const keyEl = this.querySelector('.ir-choice-key');
      if (!keyEl) return;

      /* 解析出純數字（rem 值）*/
      const numStr = String(fsValue).replace(/[a-z%]/gi, '').trim();
      const remVal = parseFloat(numStr);
      if (isNaN(remVal)) return;

      const basePx   = remVal * 16;
      const circlePx = Math.round(basePx * 1.45);
      const keyFsRem = (remVal * 0.79).toFixed(3) + 'rem';

      keyEl.style.width    = circlePx + 'px';
      keyEl.style.height   = circlePx + 'px';
      keyEl.style.fontSize = keyFsRem;
    }
  }

  customElements.define('info-region',       InfoRegion);
  customElements.define('info-region-group', InfoRegionGroup);
  customElements.define('ir-choices',        IrChoices);
  customElements.define('ir-choice',         IrChoice);

  window.InfoRegion = {
    activate(id) {
      const el = document.getElementById(id);
      if (el?.tagName === 'INFO-REGION') el.activate();
      else console.warn(`[InfoRegion.activate] 找不到 info-region#${id}`);
    },
    resetAll(scopeSelector = 'info-region') {
      document.querySelectorAll(scopeSelector).forEach(el => {
        if (el.tagName === 'INFO-REGION') el.reset();
      });
    },
    get colors() { return Object.keys(BrandColors); },
    get config()  { return Object.assign({}, window.InfoRegionConfig); },
  };

})();
