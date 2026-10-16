(function (global) {
  'use strict';

  /* ──────────────────────────────────────────────────────────
   *  色票 PALETTE
   * ────────────────────────────────────────────────────────── */
  const PALETTE = {
    bg:          '#0C0D0C',
    shell:       '#C6C7BD',
    lavender:    '#C3A5E5',
    special:     '#B3DE73',
    warning:     '#E6374B',
    salmon:      '#E5C3B3',
    sky:         '#82C8E5',
    ocean:       '#1CCAE8',
    safe:        '#27AE60',
    teal:        '#0DA591',
    vanilla:     '#DBEDD8',
    focus:       '#D4FFFC',
    yellow:      '#E3D322',
    info:        '#4171BF',
    indigo:      '#7849C9',
    pink:        '#FF91D7',
    orange:      '#EDA109',
    transparent: 'transparent',
  };

  function resolveColor(name) {
    if (!name) return 'transparent';
    return Object.prototype.hasOwnProperty.call(PALETTE, name) ? PALETTE[name] : name;
  }

  function parseRatio(str) {
    const parts = (str || '5:5').split(':');
    const a = parseFloat(parts[0]) || 5;
    const b = parseFloat(parts[1]) || 5;
    return [a, b];
  }

  function num(val) { return parseFloat(val) || 0; }

  /* ──────────────────────────────────────────────────────────
   *  buildBg
   * ────────────────────────────────────────────────────────── */
  function buildBg(color, style, dash, gap, dir) {
    if (style === 'none' || style === 'transparent') {
      return 'background:transparent';
    }
    const c = resolveColor(color);
    if (style === 'solid') return `background:${c}`;

    const d     = num(dash);
    const g     = num(gap);
    const cycle = d + g;

    if (style === 'dotted') {
      const r = d / 2;
      if (dir === 'h') {
        return [
          `background-image:radial-gradient(circle at ${r}px 50%,${c} ${r}px,transparent ${r}px)`,
          `background-size:${cycle}px 100%`,
          `background-repeat:repeat-x`,
        ].join(';');
      }
      return [
        `background-image:radial-gradient(circle at 50% ${r}px,${c} ${r}px,transparent ${r}px)`,
        `background-size:100% ${cycle}px`,
        `background-repeat:repeat-y`,
      ].join(';');
    }

    /* dashed */
    if (dir === 'h') {
      return `background-image:repeating-linear-gradient(` +
             `90deg,${c} 0,${c} ${d}px,transparent ${d}px,transparent ${cycle}px)`;
    }
    return `background-image:repeating-linear-gradient(` +
           `180deg,${c} 0,${c} ${d}px,transparent ${d}px,transparent ${cycle}px)`;
  }

  /* ──────────────────────────────────────────────────────────
   *  箭頭 span 產生器
   *
   *  arrowSpanH: dir = 'left'(◀) | 'right'(▶)
   *  arrowSpanV: dir = 'up'(▲)   | 'down'(▼)
   *
   *  利用 CSS border trick 產生三角形，元素本身 width/height 皆為 0，
   *  讓 flex 佈局以 border box（= 箭頭尺寸）計算佔用空間。
   * ────────────────────────────────────────────────────────── */
  function arrowSpanH(color, dir, size) {
    const c    = resolveColor(color);
    const half = size / 2;
    const side = dir === 'left'
      ? `border-right:${size}px solid ${c}`   /* ◀ border-right 為實色側 */
      : `border-left:${size}px solid ${c}`;   /* ▶ border-left 為實色側 */
    return `<span style="display:block;width:0;height:0;flex-shrink:0;` +
           `border-top:${half}px solid transparent;` +
           `border-bottom:${half}px solid transparent;` +
           `${side}"></span>`;
  }

  function arrowSpanV(color, dir, size) {
    const c    = resolveColor(color);
    const half = size / 2;
    const side = dir === 'up'
      ? `border-bottom:${size}px solid ${c}`  /* ▲ border-bottom 為實色側 */
      : `border-top:${size}px solid ${c}`;    /* ▼ border-top 為實色側 */
    return `<span style="display:block;width:0;height:0;flex-shrink:0;` +
           `border-left:${half}px solid transparent;` +
           `border-right:${half}px solid transparent;` +
           `${side}"></span>`;
  }

  /* ──────────────────────────────────────────────────────────
   *  共用工具：extraclass 管理
   * ────────────────────────────────────────────────────────── */
  function applyExtraClass(el, newClass) {
    const prev = el._lastExtraClass || '';
    if (prev) prev.split(/\s+/).filter(Boolean).forEach(c => el.classList.remove(c));
    if (newClass) newClass.split(/\s+/).filter(Boolean).forEach(c => el.classList.add(c));
    el._lastExtraClass = newClass;
  }

  /* ──────────────────────────────────────────────────────────
   *  <dual-hr>
   * ────────────────────────────────────────────────────────── */
  const HR_DEFAULTS = {
    colorLeft:  'yellow',
    colorRight: 'sky',
    ratio:      '5:5',
    thickness:  '1px',
    margin:     '8px 0',
    lineStyle:  'solid',
    dash:       '8px',
    gap:        '5px',
    arrow:      '',    /* left | right | start | end | both */
    arrowSize:  '8',   /* px，接受純數字或帶 px 字串 */
  };

  const HR_KEY_MAP = {
    'color-left':  'colorLeft',
    'color-right': 'colorRight',
    'line-style':  'lineStyle',
    'arrow-size':  'arrowSize',
  };

  class DualHR extends HTMLElement {

    static get observedAttributes() {
      return [
        'color-left', 'color-right', 'ratio', 'thickness', 'margin',
        'line-style', 'dash', 'gap', 'extraclass',
        'arrow', 'arrow-size',
      ];
    }

    static get defaults() { return HR_DEFAULTS; }

    static configure(opts = {}) {
      Object.entries(opts).forEach(([k, v]) => {
        const key = HR_KEY_MAP[k] ?? k;
        if (Object.prototype.hasOwnProperty.call(HR_DEFAULTS, key)) HR_DEFAULTS[key] = v;
      });
      document.querySelectorAll('dual-hr').forEach(el => el._render());
    }

    connectedCallback()        { this._render(); }
    attributeChangedCallback() { this._render(); }

    _get(attr, key) { return this.getAttribute(attr) || HR_DEFAULTS[key]; }

    _render() {
      const cl         = this._get('color-left',  'colorLeft');
      const cr         = this._get('color-right', 'colorRight');
      const thickness  = this._get('thickness',   'thickness');
      const lineStyle  = this._get('line-style',  'lineStyle');
      const dash       = this._get('dash',        'dash');
      const gap        = this._get('gap',         'gap');
      const extraclass = this.getAttribute('extraclass') || '';
      const arrow      = (this.getAttribute('arrow') || HR_DEFAULTS.arrow).toLowerCase();
      const arrowPx    = parseFloat(this.getAttribute('arrow-size') || HR_DEFAULTS.arrowSize) || 8;

      const useInlineMargin = !extraclass || this.hasAttribute('margin');
      const margin = this._get('margin', 'margin');

      const [lv, rv] = parseRatio(this.getAttribute('ratio') || HR_DEFAULTS.ratio);

      /* 箭頭方向判斷（支援語意別名） */
      const hasArrowStart = arrow === 'start' || arrow === 'left'  || arrow === 'both';
      const hasArrowEnd   = arrow === 'end'   || arrow === 'right' || arrow === 'both';
      const hasArrow      = hasArrowStart || hasArrowEnd;

      applyExtraClass(this, extraclass);

      /* 有箭頭時：容器高度取 max(thickness, arrowSize px)，開放 overflow */
      this.style.cssText =
        `display:flex;align-items:center;width:100%;` +
        `height:${hasArrow ? `max(${thickness}, ${arrowPx}px)` : thickness};` +
        `overflow:${hasArrow ? 'visible' : 'hidden'};` +
        (useInlineMargin ? `margin:${margin};` : '');

      /* 線條 span 改用 flex 比例，箭頭 span 靠 flex-shrink:0 佔固定空間 */
      let html = '';
      if (hasArrowStart) html += arrowSpanH(cl, 'left', arrowPx);
      html +=
        `<span style="flex:${lv} 1 0%;height:${thickness};min-width:0;` +
          `${buildBg(cl, lineStyle, dash, gap, 'h')}"></span>` +
        `<span style="flex:${rv} 1 0%;height:${thickness};min-width:0;` +
          `${buildBg(cr, lineStyle, dash, gap, 'h')}"></span>`;
      if (hasArrowEnd) html += arrowSpanH(cr, 'right', arrowPx);

      this.innerHTML = html;
    }
  }

  /* ──────────────────────────────────────────────────────────
   *  <dual-vr>
   * ────────────────────────────────────────────────────────── */
  const VR_DEFAULTS = {
    colorTop:    'yellow',
    colorBottom: 'sky',
    ratio:       '5:5',
    thickness:   '1px',
    height:      '80px',
    margin:      '0 8px',
    lineStyle:   'solid',
    dash:        '8px',
    gap:         '5px',
    arrow:       '',   /* top | bottom | start | end | both */
    arrowSize:   '8',
  };

  const VR_KEY_MAP = {
    'color-top':    'colorTop',
    'color-bottom': 'colorBottom',
    'color-left':   'colorTop',
    'color-right':  'colorBottom',
    'line-style':   'lineStyle',
    'arrow-size':   'arrowSize',
  };

  class DualVR extends HTMLElement {

    static get observedAttributes() {
      return [
        'color-top', 'color-bottom', 'color-left', 'color-right',
        'ratio', 'thickness', 'height', 'margin',
        'line-style', 'dash', 'gap', 'extraclass',
        'arrow', 'arrow-size',
      ];
    }

    static get defaults() { return VR_DEFAULTS; }

    static configure(opts = {}) {
      Object.entries(opts).forEach(([k, v]) => {
        const key = VR_KEY_MAP[k] ?? k;
        if (Object.prototype.hasOwnProperty.call(VR_DEFAULTS, key)) VR_DEFAULTS[key] = v;
      });
      document.querySelectorAll('dual-vr').forEach(el => el._render());
    }

    connectedCallback()        { this._render(); }
    attributeChangedCallback() { this._render(); }

    _get(attr, key) { return this.getAttribute(attr) || VR_DEFAULTS[key]; }

    _render() {
      const ct = this.getAttribute('color-top')    ||
                 this.getAttribute('color-left')   ||
                 VR_DEFAULTS.colorTop;
      const cb = this.getAttribute('color-bottom') ||
                 this.getAttribute('color-right')  ||
                 VR_DEFAULTS.colorBottom;

      const thickness  = this._get('thickness',  'thickness');
      const height     = this._get('height',     'height');
      const lineStyle  = this._get('line-style', 'lineStyle');
      const dash       = this._get('dash',       'dash');
      const gap        = this._get('gap',        'gap');
      const extraclass = this.getAttribute('extraclass') || '';
      const arrow      = (this.getAttribute('arrow') || VR_DEFAULTS.arrow).toLowerCase();
      const arrowPx    = parseFloat(this.getAttribute('arrow-size') || VR_DEFAULTS.arrowSize) || 8;

      const useInlineMargin = !extraclass || this.hasAttribute('margin');
      const margin = this._get('margin', 'margin');

      const [tv, bv] = parseRatio(this.getAttribute('ratio') || VR_DEFAULTS.ratio);

      const hasArrowStart = arrow === 'start' || arrow === 'top'    || arrow === 'both';
      const hasArrowEnd   = arrow === 'end'   || arrow === 'bottom' || arrow === 'both';
      const hasArrow      = hasArrowStart || hasArrowEnd;

      applyExtraClass(this, extraclass);

      const parts = [
        'display:inline-flex',
        'flex-direction:column',
        'align-items:center',
        /* 有箭頭時容器寬度取 max(thickness, arrowSize px) */
        `width:${hasArrow ? `max(${thickness}, ${arrowPx}px)` : thickness}`,
        `height:${height}`,
        `overflow:${hasArrow ? 'visible' : 'hidden'}`,
        'vertical-align:middle',
      ];
      if (useInlineMargin) parts.push(`margin:${margin}`);
      this.style.cssText = parts.join(';') + ';';

      let html = '';
      if (hasArrowStart) html += arrowSpanV(ct, 'up', arrowPx);
      html +=
        `<span style="flex:${tv} 1 0%;width:${thickness};min-height:0;` +
          `${buildBg(ct, lineStyle, dash, gap, 'v')}"></span>` +
        `<span style="flex:${bv} 1 0%;width:${thickness};min-height:0;` +
          `${buildBg(cb, lineStyle, dash, gap, 'v')}"></span>`;
      if (hasArrowEnd) html += arrowSpanV(cb, 'down', arrowPx);

      this.innerHTML = html;
    }
  }

  /* ──────────────────────────────────────────────────────────
   *  Register & Export
   * ────────────────────────────────────────────────────────── */
  if (!customElements.get('dual-hr')) customElements.define('dual-hr', DualHR);
  if (!customElements.get('dual-vr')) customElements.define('dual-vr', DualVR);

  const DualLine = {
    palette: PALETTE,
    addColor(name, hex) { PALETTE[name] = hex; },
    configureHR(opts)   { DualHR.configure(opts); },
    configureVR(opts)   { DualVR.configure(opts); },
    configure(opts)     { DualHR.configure(opts); DualVR.configure(opts); },
  };

  global.DualHR   = DualHR;
  global.DualVR   = DualVR;
  global.DualLine = DualLine;

}(window));
