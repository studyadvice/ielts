(function (global) {
  'use strict';

  /* ──────────────────────────────────────────────────────────
   *  色票 PALETTE
   *  更新：sky / safe / focus / info 修正；新增 bg / transparent
   * ────────────────────────────────────────────────────────── */
  const PALETTE = {
    bg:          '#0C0D0C',
    shell:       '#C6C7BD',
    lavender:    '#C3A5E5',
    special:     '#B3DE73',
    warning:     '#E6374B',
    salmon:      '#E5C3B3',
    sky:         '#82C8E5',   /* 修正：原 #95C9DE */
    ocean:       '#1CCAE8',
    safe:        '#27AE60',   /* 修正：原 #299459 */
    teal:        '#0DA591',
    vanilla:     '#DBEDD8',
    focus:       '#D4FFFC',   /* 修正：原 #3C7BCF */
    yellow:      '#E3D322',
    info:        '#4171BF',   /* 修正：原 #2351DB */
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
   *  新增 style === 'none' | 'transparent' → 透明留白模式
   * ────────────────────────────────────────────────────────── */
  function buildBg(color, style, dash, gap, dir) {
    /* 透明 / 無線 → 元素保有尺寸，視覺完全透明，用於留白 */
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

    /* dashed（預設） */
    if (dir === 'h') {
      return `background-image:repeating-linear-gradient(` +
             `90deg,${c} 0,${c} ${d}px,transparent ${d}px,transparent ${cycle}px)`;
    }
    return `background-image:repeating-linear-gradient(` +
           `180deg,${c} 0,${c} ${d}px,transparent ${d}px,transparent ${cycle}px)`;
  }

  /* ──────────────────────────────────────────────────────────
   *  共用工具：extraclass 管理
   *
   *  規則：
   *  - extraclass 存在 且 未明確設定 margin 屬性 → 跳過 inline margin，
   *    讓 Bootstrap class（如 my-5）接管間距。
   *  - extraclass 存在 且 已明確設定 margin 屬性 → inline margin 優先
   *    （inline style 優先級高於 class）。
   *  - 無 extraclass → 一律套用 inline margin（來自屬性或預設值）。
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
  };

  const HR_KEY_MAP = {
    'color-left':  'colorLeft',
    'color-right': 'colorRight',
    'line-style':  'lineStyle',
  };

  class DualHR extends HTMLElement {

    static get observedAttributes() {
      return [
        'color-left', 'color-right', 'ratio', 'thickness', 'margin',
        'line-style', 'dash', 'gap', 'extraclass',
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

      /* 有 extraclass 且未明確設定 margin 屬性時，交由 Bootstrap 接管 */
      const useInlineMargin = !extraclass || this.hasAttribute('margin');
      const margin = this._get('margin', 'margin');

      const [lv, rv] = parseRatio(this.getAttribute('ratio') || HR_DEFAULTS.ratio);
      const total    = lv + rv;
      const lp       = (lv / total * 100).toFixed(5) + '%';
      const rp       = (rv / total * 100).toFixed(5) + '%';

      applyExtraClass(this, extraclass);

      this.style.cssText =
        `display:flex;width:100%;height:${thickness};overflow:hidden;` +
        (useInlineMargin ? `margin:${margin};` : '');

      this.innerHTML =
        `<span style="display:block;width:${lp};height:100%;` +
          `${buildBg(cl, lineStyle, dash, gap, 'h')}"></span>` +
        `<span style="display:block;width:${rp};height:100%;` +
          `${buildBg(cr, lineStyle, dash, gap, 'h')}"></span>`;
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
  };

  const VR_KEY_MAP = {
    'color-top':    'colorTop',
    'color-bottom': 'colorBottom',
    'color-left':   'colorTop',    /* 別名 */
    'color-right':  'colorBottom', /* 別名 */
    'line-style':   'lineStyle',
  };

  class DualVR extends HTMLElement {

    static get observedAttributes() {
      return [
        'color-top', 'color-bottom', 'color-left', 'color-right',
        'ratio', 'thickness', 'height', 'margin',
        'line-style', 'dash', 'gap', 'extraclass',
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

      const useInlineMargin = !extraclass || this.hasAttribute('margin');
      const margin = this._get('margin', 'margin');

      const [tv, bv] = parseRatio(this.getAttribute('ratio') || VR_DEFAULTS.ratio);
      const total    = tv + bv;
      const tp       = (tv / total * 100).toFixed(5) + '%';
      const bp       = (bv / total * 100).toFixed(5) + '%';

      applyExtraClass(this, extraclass);

      const parts = [
        'display:inline-flex',
        'flex-direction:column',
        `width:${thickness}`,
        `height:${height}`,
        'overflow:hidden',
        'vertical-align:middle',
      ];
      if (useInlineMargin) parts.push(`margin:${margin}`);
      this.style.cssText = parts.join(';') + ';';

      this.innerHTML =
        `<span style="display:block;width:100%;height:${tp};` +
          `${buildBg(ct, lineStyle, dash, gap, 'v')}"></span>` +
        `<span style="display:block;width:100%;height:${bp};` +
          `${buildBg(cb, lineStyle, dash, gap, 'v')}"></span>`;
    }
  }

  /* ──────────────────────────────────────────────────────────
   *  Register & Export
   * ────────────────────────────────────────────────────────── */
  if (!customElements.get('dual-hr')) customElements.define('dual-hr', DualHR);
  if (!customElements.get('dual-vr')) customElements.define('dual-vr', DualVR);

  const DualLine = {
    palette: PALETTE,

    /** 新增或覆寫色票項目 */
    addColor(name, hex) { PALETTE[name] = hex; },

    /** 設定 <dual-hr> 全域預設，並重繪所有已存在的實例 */
    configureHR(opts) { DualHR.configure(opts); },

    /** 設定 <dual-vr> 全域預設，並重繪所有已存在的實例 */
    configureVR(opts) { DualVR.configure(opts); },

    /** 同時設定 <dual-hr> 與 <dual-vr> 共用的屬性 */
    configure(opts) {
      DualHR.configure(opts);
      DualVR.configure(opts);
    },
  };

  global.DualHR   = DualHR;
  global.DualVR   = DualVR;
  global.DualLine = DualLine;

}(window));
