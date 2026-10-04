(function () {
  'use strict';

  const cap     = s => s.charAt(0).toUpperCase() + s.slice(1);
  const addUnit = (v, u) => {
    if (!v) return null;
    return /[a-z%]$/i.test(String(v)) ? String(v) : v + u;
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

    /* 色彩 variant — 自動從 BrandColors 生成，新增色票只需修改上方物件 */
    const skip = new Set(['bg', 'region']);

    const COLOR_VARIANTS = Object.entries(BrandColors)
      .filter(([k]) => !skip.has(k))
      .map(([k, v]) =>
        `info-region[active="true"][color="${k}"]{border-left-color:${v}}`
      ).join('\n      ');

    const BTN_VARIANTS = Object.entries(BrandColors)
      .filter(([k]) => !skip.has(k))
      .map(([k, v]) => {
        const [r, g, b] = [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16));
        return `.ir-btn--${k}{border-color:${v};color:${v}}` +
               `.ir-btn--${k}:hover{background:rgba(${r},${g},${b},0.18)}`;
      }).join('\n      ');

    const css = `
      info-region {
        display: block;
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transform: translateY(10px);
        pointer-events: none;
        position: relative;
        border-left: ${cfg.borderWidth}px solid transparent;
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

      /* ══ 金箔特別版 — class="ir-gold" ══
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
      /* 掃光動畫 — 裝飾性，低不透明度屬意為之 */
      info-region.ir-gold::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
          102deg,
          transparent 25%,
          rgba(255, 210, 80, 0.13) 50%,
          transparent 75%
        );
        background-size: 200% 100%;
        animation: ir-gold-shimmer 4s ease-in-out infinite;
      }
      @keyframes ir-gold-shimmer {
        0%   { background-position: -60% center; }
        100% { background-position: 160% center; }
      }
      info-region.ir-gold > *:not(.ir-countdown-bar) {
        position: relative;
        z-index: 1;
      }
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
      }
    }

    _onActivated() {
      this._applyBorderStyles();

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
        this.style[`${p}Color`] = w > 0 ? hex : 'transparent';
      });
    }

    _clearBorderStyles() {
      ['top', 'right', 'bottom', 'left'].forEach(side => {
        const p = 'border' + cap(side);
        this.style[`${p}Width`] = this.style[`${p}Style`] = this.style[`${p}Color`] = '';
      });
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
      this.removeAttribute('active');
      this._clearBorderStyles();
      this.querySelector('.ir-countdown-bar')?.remove();
      this.querySelector('.ir-manual-wrap')?.remove();
    }
  }

  class InfoRegionGroup extends HTMLElement {
    constructor() {
      super();
      this._progressBar = null;
      this._percentEl   = null;
      this._observer    = null;
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
      if (this.hasAttribute('auto-start')) {
        Promise.resolve().then(() => this._start());
      }
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
      const children  = this._getChildren();
      const ratio     = children.length > 0
        ? children.filter(el => el.getAttribute('active') === 'true').length / children.length
        : 0;

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

  customElements.define('info-region',       InfoRegion);
  customElements.define('info-region-group', InfoRegionGroup);

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
