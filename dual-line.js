/*!
 * dual-line.js  v1.2.0
 * ─────────────────────────────────────────────────────────────
 *  <dual-hr>  雙色水平線
 *  <dual-vr>  雙色垂直線
 *  樣式：solid | dashed | dotted
 *  無依賴，無 Shadow DOM
 * ─────────────────────────────────────────────────────────────
 *
 * ── 快速開始 ──────────────────────────────────────────────────
 *  <script src="dual-line.js"></script>
 *
 *  <dual-hr color-left="yellow" color-right="sky" ratio="3:7"></dual-hr>
 *  <dual-hr color-left="warning" color-right="safe" ratio="1:1" thickness="3px" line-style="dashed"></dual-hr>
 *  <dual-vr color-top="lavender" color-bottom="orange" ratio="4:6" height="120px"></dual-vr>
 *
 * ── 全域配置 ──────────────────────────────────────────────────
 *  DualLine.configureHR({ colorLeft:'salmon', thickness:'2px' });
 *  DualLine.configureVR({ colorTop:'pink', height:'100px' });
 *  DualLine.configure({ lineStyle:'dashed', dash:'6px', gap:'4px' });  // 同時設定兩者
 *
 * ── 自訂色票 ──────────────────────────────────────────────────
 *  DualLine.addColor('brand', '#299459');
 *  // 之後即可使用 color-left="brand"
 *
 * ── <dual-hr> 屬性 ────────────────────────────────────────────
 *  color-left   左段色彩（色票名稱 或 任意 CSS 色碼）   預設 yellow
 *  color-right  右段色彩                              預設 sky
 *  ratio        左:右寬度比，如 3:7                   預設 5:5
 *  thickness    線條高度（任何 CSS 長度）               預設 1px
 *  margin       上下外距                              預設 8px 0
 *  line-style   solid | dashed | dotted               預設 solid
 *  dash         虛線/點線每段長度                      預設 8px
 *  gap          虛線/點線每段間距                      預設 5px
 *
 * ── <dual-vr> 屬性 ────────────────────────────────────────────
 *  color-top    上段色彩（亦可用 color-left 別名）      預設 yellow
 *  color-bottom 下段色彩（亦可用 color-right 別名）     預設 sky
 *  ratio        上:下高度比，如 4:6                    預設 5:5
 *  thickness    線條寬度                              預設 1px
 *  height       線條總高度                            預設 80px
 *  margin       左右外距                              預設 0 8px
 *  line-style   solid | dashed | dotted               預設 solid
 *  dash         虛線/點線每段長度                      預設 8px
 *  gap          虛線/點線每段間距                      預設 5px
 *
 * ── 注意事項 ──────────────────────────────────────────────────
 *  dotted 圓點效果：需 thickness ≥ dash 才會出現明顯圓形；
 *  在細線（1–2px）上會退化為短方塊，視覺接近 dashed。
 */
(function (global) {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // 色票
  // ═══════════════════════════════════════════════════════════
  const PALETTE = {
    shell:    '#C6C7BD',
    lavender: '#C3A5E5',
    special:  '#B3DE73',
    warning:  '#E6374B',
    salmon:   '#E5C3B3',
    sky:      '#95C9DE',
    ocean:    '#1CCAE8',
    safe:     '#299459',
    teal:     '#0DA591',
    vanilla:  '#DBEDD8',
    focus:    '#3C7BCF',
    yellow:   '#E3D322',
    info:     '#2351DB',
    indigo:   '#7849C9',
    pink:     '#FF91D7',
    orange:   '#EDA109',
  };

  // ═══════════════════════════════════════════════════════════
  // 內部工具
  // ═══════════════════════════════════════════════════════════

  /** 解析色票名稱或直接返回原始色碼 */
  function resolveColor(name) {
    if (!name) return 'transparent';
    return Object.prototype.hasOwnProperty.call(PALETTE, name) ? PALETTE[name] : name;
  }

  /** 解析 "3:7" 格式的比例，返回 [左/上, 右/下] 數值 */
  function parseRatio(str) {
    const parts = (str || '5:5').split(':');
    const a = parseFloat(parts[0]) || 5;
    const b = parseFloat(parts[1]) || 5;
    return [a, b];
  }

  /** 取數字部分（去除 px 等單位），用於計算 */
  function num(val) {
    return parseFloat(val) || 0;
  }

  /**
   * 產生 CSS 背景樣式字串（含 background / background-image 等）
   * @param {string}    color     - 色票名稱或 CSS 色碼
   * @param {string}    style     - 'solid' | 'dashed' | 'dotted'
   * @param {string}    dash      - 虛線段長度（含單位）
   * @param {string}    gap       - 間距（含單位）
   * @param {'h'|'v'}   dir       - 水平(h) 或 垂直(v)
   * @returns {string}  可直接插入 style attribute 的 CSS 字串（不含尾部分號）
   */
  function buildBg(color, style, dash, gap, dir) {
    const c = resolveColor(color);

    if (style === 'solid') {
      return `background:${c}`;
    }

    const d     = num(dash);
    const g     = num(gap);
    const cycle = d + g;

    if (style === 'dotted') {
      const r = d / 2;  // 圓半徑
      if (dir === 'h') {
        return [
          `background-image:radial-gradient(circle at ${r}px 50%,${c} ${r}px,transparent ${r}px)`,
          `background-size:${cycle}px 100%`,
          `background-repeat:repeat-x`,
        ].join(';');
      } else {
        return [
          `background-image:radial-gradient(circle at 50% ${r}px,${c} ${r}px,transparent ${r}px)`,
          `background-size:100% ${cycle}px`,
          `background-repeat:repeat-y`,
        ].join(';');
      }
    }

    // dashed
    if (dir === 'h') {
      return `background-image:repeating-linear-gradient(` +
             `90deg,${c} 0,${c} ${d}px,transparent ${d}px,transparent ${cycle}px)`;
    } else {
      return `background-image:repeating-linear-gradient(` +
             `180deg,${c} 0,${c} ${d}px,transparent ${d}px,transparent ${cycle}px)`;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // <dual-hr>  水平線
  // ═══════════════════════════════════════════════════════════
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

  /** camelCase → 實際 defaults key 對照表（供 configure 使用） */
  const HR_KEY_MAP = {
    'color-left':  'colorLeft',
    'color-right': 'colorRight',
    'line-style':  'lineStyle',
  };

  class DualHR extends HTMLElement {

    static get observedAttributes() {
      return ['color-left', 'color-right', 'ratio', 'thickness', 'margin',
              'line-style', 'dash', 'gap'];
    }

    /** 取得目前全域預設值（唯讀參考） */
    static get defaults() { return HR_DEFAULTS; }

    /**
     * 更新 <dual-hr> 的全域預設值，並立即重繪所有已存在的實例。
     * 支援 camelCase 與 kebab-case 兩種 key 格式。
     * @param {object} opts
     * @example
     *   DualHR.configure({ colorLeft:'salmon', thickness:'2px', lineStyle:'dashed' });
     *   DualHR.configure({ 'color-left':'salmon' });  // 兩種格式都可以
     */
    static configure(opts = {}) {
      Object.entries(opts).forEach(([k, v]) => {
        const key = HR_KEY_MAP[k] ?? k;
        if (Object.prototype.hasOwnProperty.call(HR_DEFAULTS, key)) {
          HR_DEFAULTS[key] = v;
        }
      });
      document.querySelectorAll('dual-hr').forEach(el => el._render());
    }

    connectedCallback()        { this._render(); }
    attributeChangedCallback() { this._render(); }

    /** 讀取屬性，若不存在則回傳全域預設 */
    _get(attr, defaultKey) {
      return this.getAttribute(attr) || HR_DEFAULTS[defaultKey];
    }

    _render() {
      const cl        = this._get('color-left',  'colorLeft');
      const cr        = this._get('color-right', 'colorRight');
      const thickness = this._get('thickness',   'thickness');
      const margin    = this._get('margin',      'margin');
      const lineStyle = this._get('line-style',  'lineStyle');
      const dash      = this._get('dash',        'dash');
      const gap       = this._get('gap',         'gap');

      const [lv, rv] = parseRatio(this.getAttribute('ratio') || HR_DEFAULTS.ratio);
      const total    = lv + rv;
      const lp       = (lv / total * 100).toFixed(5) + '%';
      const rp       = (rv / total * 100).toFixed(5) + '%';

      this.style.cssText =
        `display:flex;width:100%;height:${thickness};margin:${margin};overflow:hidden;`;

      this.innerHTML =
        `<span style="display:block;width:${lp};height:100%;` +
          `${buildBg(cl, lineStyle, dash, gap, 'h')}"></span>` +
        `<span style="display:block;width:${rp};height:100%;` +
          `${buildBg(cr, lineStyle, dash, gap, 'h')}"></span>`;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // <dual-vr>  垂直線
  // ═══════════════════════════════════════════════════════════
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
    'color-left':   'colorTop',     // 別名
    'color-right':  'colorBottom',  // 別名
    'line-style':   'lineStyle',
  };

  class DualVR extends HTMLElement {

    static get observedAttributes() {
      return ['color-top', 'color-bottom', 'color-left', 'color-right',
              'ratio', 'thickness', 'height', 'margin',
              'line-style', 'dash', 'gap'];
    }

    static get defaults() { return VR_DEFAULTS; }

    /**
     * 更新 <dual-vr> 的全域預設值，並立即重繪所有已存在的實例。
     * color-left / color-right 可作為 color-top / color-bottom 的別名。
     * @param {object} opts
     */
    static configure(opts = {}) {
      Object.entries(opts).forEach(([k, v]) => {
        const key = VR_KEY_MAP[k] ?? k;
        if (Object.prototype.hasOwnProperty.call(VR_DEFAULTS, key)) {
          VR_DEFAULTS[key] = v;
        }
      });
      document.querySelectorAll('dual-vr').forEach(el => el._render());
    }

    connectedCallback()        { this._render(); }
    attributeChangedCallback() { this._render(); }

    _get(attr, defaultKey) {
      return this.getAttribute(attr) || VR_DEFAULTS[defaultKey];
    }

    _render() {
      // color-top / color-left 兩種屬性名均可用
      const ct = this.getAttribute('color-top')    ||
                 this.getAttribute('color-left')   ||
                 VR_DEFAULTS.colorTop;
      const cb = this.getAttribute('color-bottom') ||
                 this.getAttribute('color-right')  ||
                 VR_DEFAULTS.colorBottom;

      const thickness = this._get('thickness',  'thickness');
      const height    = this._get('height',     'height');
      const margin    = this._get('margin',     'margin');
      const lineStyle = this._get('line-style', 'lineStyle');
      const dash      = this._get('dash',       'dash');
      const gap       = this._get('gap',        'gap');

      const [tv, bv] = parseRatio(this.getAttribute('ratio') || VR_DEFAULTS.ratio);
      const total    = tv + bv;
      const tp       = (tv / total * 100).toFixed(5) + '%';
      const bp       = (bv / total * 100).toFixed(5) + '%';

      this.style.cssText = [
        'display:inline-flex',
        'flex-direction:column',
        `width:${thickness}`,
        `height:${height}`,
        `margin:${margin}`,
        'overflow:hidden',
        'vertical-align:middle',
      ].join(';') + ';';

      this.innerHTML =
        `<span style="display:block;width:100%;height:${tp};` +
          `${buildBg(ct, lineStyle, dash, gap, 'v')}"></span>` +
        `<span style="display:block;width:100%;height:${bp};` +
          `${buildBg(cb, lineStyle, dash, gap, 'v')}"></span>`;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 註冊 Custom Elements
  // ═══════════════════════════════════════════════════════════
  if (!customElements.get('dual-hr')) customElements.define('dual-hr', DualHR);
  if (!customElements.get('dual-vr')) customElements.define('dual-vr', DualVR);

  // ═══════════════════════════════════════════════════════════
  // 公開 API  →  global.DualHR / global.DualVR / global.DualLine
  // ═══════════════════════════════════════════════════════════

  /**
   * DualLine — 統一操作入口
   *
   * DualLine.addColor('brand', '#299459')
   *   → 新增自訂色票名稱
   *
   * DualLine.configureHR({ colorLeft:'salmon', thickness:'2px' })
   *   → 設定 <dual-hr> 全域預設
   *
   * DualLine.configureVR({ colorTop:'pink', height:'100px' })
   *   → 設定 <dual-vr> 全域預設
   *
   * DualLine.configure({ lineStyle:'dashed', dash:'6px', gap:'4px' })
   *   → 同時設定兩者
   */
  const DualLine = {
    palette: PALETTE,

    /** 新增或覆蓋色票 */
    addColor(name, hex) {
      PALETTE[name] = hex;
    },

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
