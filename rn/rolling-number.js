/*!
 * rolling-number.js  v1.1
 * 跳動數字 Web Component（無 Shadow DOM）
 *
 * 用法：
 *   <script src="rolling-number.js"></script>
 *   <rolling-number value="1234567"></rolling-number>
 *
 * 全域預設覆蓋：
 *   RollingNumber.defaults.fontSize    = '4rem';
 *   RollingNumber.defaults.colorScheme = 'mono';
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     全域預設值（外部可覆蓋 RollingNumber.defaults.xxx）
  ══════════════════════════════════════════════════════ */
  const FACTORY_DEFAULTS = {
    // 字型
    fontFamily:   'inherit',
    fontSize:     '3rem',
    fontWeight:   '800',

    // 顏色
    color:        '',            // 空字串 → 使用 colorScheme
    colorScheme:  'rainbow',     // 'rainbow' | 'mono'
    monoColor:    '#b3de73',     // colorScheme='mono' 時的單色
    separatorColor: '#c6c7bd',   // 千位分隔符 / 小數點顏色

    // 動畫
    duration:     1.6,           // 秒
    delayStep:    0.08,          // 每欄錯開的延遲（秒）
    easing:       'smooth',      // 預設緩動名稱或 cubic-bezier(...)

    // 數字格式
    separator:    ',',           // 千位分隔符；'' = 不顯示
    decimals:     0,             // 小數位數
    prefix:       '',            // 前綴文字，如 'NT$'
    suffix:       '',            // 後綴文字，如 ' 元'

    // 行為
    autoplay:     true,          // true = 進入視窗才播放（IntersectionObserver）
    threshold:    0.2,           // IntersectionObserver 觸發閾值（0–1）
    lineHeight:   1.35,          // 每格高度 = fontSize × lineHeight
  };

  /* ── 內建緩動預設值 ── */
  const EASINGS = {
    smooth:   'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
    bounce:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
    elastic:  'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    expo:     'cubic-bezier(0.16, 1, 0.3, 1)',
    decel:    'cubic-bezier(0, 0, 0.2, 1)',
    linear:   'linear',
  };

  /* ── 彩虹色序列（依設計師色票） ── */
  const RAINBOW = [
    '#b3de73', '#95c9de', '#299459', '#C3A5E5',
    '#eda109', '#E5C3B3', '#DECA4B', '#FFB3D9',
    '#9B72CF', '#95c9de',
  ];

  /* ══════════════════════════════════════════════════════
     注入全域 CSS（只執行一次）
  ══════════════════════════════════════════════════════ */
  const STYLE_ID = '__rolling-number-css__';
  if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = /* css */`
      rolling-number {
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        line-height: 1;
      }
      .rn-window {
        overflow: hidden;
        display: inline-block;
        position: relative;
      }
      .rn-track {
        display: flex;
        flex-direction: column;
        will-change: transform;
        transform: translateY(0);
      }
      .rn-track span {
        display: flex;
        align-items: center;
        justify-content: center;
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }
      .rn-sep,
      .rn-prefix,
      .rn-suffix {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      @keyframes rn-roll {
        from { transform: translateY(0); }
        to   { transform: translateY(var(--rn-to, 0px)); }
      }
    `;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════
     工具函數
  ══════════════════════════════════════════════════════ */
  function num(v, fallback) {
    const n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  }

  function resolveEasing(name) {
    if (!name) return EASINGS.smooth;
    if (name.startsWith('cubic-bezier') || name === 'linear') return name;
    return EASINGS[name] || EASINGS.smooth;
  }

  /** 從 CSS 尺寸字串（rem / px / em）估算像素值，用於計算軌道位移 */
  function cssSizeToPx(sizeStr) {
    if (!sizeStr) return 48;
    const val = parseFloat(sizeStr);
    if (sizeStr.endsWith('rem')) {
      return val * parseFloat(getComputedStyle(document.documentElement).fontSize || '16');
    }
    if (sizeStr.endsWith('em')) return val * 16;
    return val; // px
  }

  /* ══════════════════════════════════════════════════════
     Web Component
  ══════════════════════════════════════════════════════ */
  class RollingNumber extends HTMLElement {

    static get observedAttributes() {
      return [
        'value', 'font-family', 'font-size', 'font-weight',
        'color', 'color-scheme', 'mono-color', 'separator-color',
        'duration', 'delay-step', 'easing',
        'separator', 'decimals', 'prefix', 'suffix',
        'autoplay', 'threshold', 'line-height',
      ];
    }

    /* ── 生命週期 ─────────────────────────── */

    connectedCallback() {
      this._played = false;
      this._render();
      if (this._cfg().autoplay) {
        this._setupObserver();
      } else {
        this._scheduleAnimate();
      }
    }

    disconnectedCallback() {
      this._observer && this._observer.disconnect();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal || !this.isConnected) return;
      this._played = false;
      this._render();
      if (this._cfg().autoplay) {
        this._setupObserver();
      } else {
        this._scheduleAnimate();
      }
    }

    /* ── 公開 API ─────────────────────────── */

    /** 手動觸發動畫（例如按鈕點擊） */
    play() {
      this._played = false;
      this._render();
      this._scheduleAnimate();
    }

    /** 重設到 0，再播放到新值 */
    countTo(newValue) {
      this.setAttribute('value', newValue);
    }

    /* ── 讀取屬性 + 合併預設 ──────────────── */

    _cfg() {
      const D = Object.assign({}, FACTORY_DEFAULTS, RollingNumber.defaults);
      const a = (k, fb) => { const v = this.getAttribute(k); return v !== null ? v : fb; };
      return {
        value:          num(a('value', 0), 0),
        fontFamily:     a('font-family',     D.fontFamily),
        fontSize:       a('font-size',       D.fontSize),
        fontWeight:     a('font-weight',     D.fontWeight),
        color:          a('color',           D.color),
        colorScheme:    a('color-scheme',    D.colorScheme),
        monoColor:      a('mono-color',      D.monoColor),
        separatorColor: a('separator-color', D.separatorColor),
        duration:       num(a('duration',    D.duration),   D.duration),
        delayStep:      num(a('delay-step',  D.delayStep),  D.delayStep),
        easing:         a('easing',          D.easing),
        separator:      a('separator',       D.separator),
        decimals:       Math.max(0, parseInt(a('decimals', D.decimals)) || 0),
        prefix:         a('prefix',          D.prefix),
        suffix:         a('suffix',          D.suffix),
        autoplay:       a('autoplay',        String(D.autoplay)) !== 'false',
        threshold:      num(a('threshold',   D.threshold),  D.threshold),
        lineHeight:     num(a('line-height', D.lineHeight), D.lineHeight),
      };
    }

    /* ── 建構 DOM ─────────────────────────── */

    _render() {
      const cfg = this._cfg();
      this.innerHTML = '';

      // 套用宿主字型
      this.style.fontFamily = cfg.fontFamily;
      this.style.fontSize   = cfg.fontSize;

      // 每格高度（px，用於動畫計算）
      const fsPx   = cssSizeToPx(cfg.fontSize);
      const cellPx = fsPx * cfg.lineHeight;
      const cellStr = `${cellPx}px`;

      // 格式化數值
      const fixed   = Math.abs(cfg.value).toFixed(cfg.decimals);
      const [intPart, decPart] = fixed.split('.');
      const negative = cfg.value < 0;

      // 千位分隔
      let intFormatted = cfg.separator
        ? Number(intPart).toLocaleString('en-US').replaceAll(',', cfg.separator)
        : intPart;

      // 組合完整字串
      let fullStr = (negative ? '-' : '') + intFormatted;
      if (decPart !== undefined) fullStr += '.' + decPart;

      // prefix
      if (cfg.prefix) this.appendChild(this._makeText('rn-prefix', cfg.prefix, cellStr, cfg.separatorColor, cfg));

      // 依字元建立欄位
      let digitIdx = 0;
      for (const ch of fullStr) {
        if (ch >= '0' && ch <= '9') {
          const color = this._color(cfg, digitIdx);
          this.appendChild(this._makeDigitWindow(parseInt(ch), digitIdx, color, cellStr, fsPx, cfg));
          digitIdx++;
        } else {
          this.appendChild(this._makeSep(ch, cellStr, cfg));
        }
      }

      // suffix
      if (cfg.suffix) this.appendChild(this._makeText('rn-suffix', cfg.suffix, cellStr, cfg.separatorColor, cfg));
    }

    _color(cfg, idx) {
      if (cfg.color) return cfg.color;
      if (cfg.colorScheme === 'mono') return cfg.monoColor;
      return RAINBOW[idx % RAINBOW.length];
    }

    _makeText(cls, text, cellH, color, cfg) {
      const el = document.createElement('span');
      el.className = cls;
      el.textContent = text;
      el.style.cssText = `height:${cellH}; color:${color}; font-size:${cfg.fontSize}; font-weight:${cfg.fontWeight};`;
      return el;
    }

    _makeSep(ch, cellH, cfg) {
      const isMinus = ch === '-';
      const el = document.createElement('span');
      el.className = 'rn-sep';
      el.textContent = ch;
      el.style.cssText = `
        height: ${cellH};
        color: ${cfg.separatorColor};
        font-size: calc(${cfg.fontSize} * ${isMinus ? 0.9 : 0.7});
        font-weight: ${cfg.fontWeight};
        padding: 0 3px;
      `;
      return el;
    }

    _makeDigitWindow(digit, colIdx, color, cellH, fsPx, cfg) {
      // 外框
      const win = document.createElement('span');
      win.className = 'rn-window';
      win.style.height = cellH;

      // 軌道（0–9 直排）
      const track = document.createElement('span');
      track.className = 'rn-track';
      track.dataset.digit  = digit;
      track.dataset.col    = colIdx;
      track.dataset.cellpx = parseFloat(cellH); // 儲存供動畫用

      for (let i = 0; i <= 9; i++) {
        const sp = document.createElement('span');
        sp.textContent = i;
        sp.style.cssText = `
          height: ${cellH};
          color: ${color};
          font-size: ${cfg.fontSize};
          font-weight: ${cfg.fontWeight};
        `;
        track.appendChild(sp);
      }

      win.appendChild(track);
      return win;
    }

    /* ── 動畫 ─────────────────────────────── */

    _scheduleAnimate() {
      // 等兩個 rAF，確保 layout 完成後再讀 offsetHeight
      requestAnimationFrame(() => requestAnimationFrame(() => this._doAnimate()));
    }

    _doAnimate() {
      if (this._played) return;
      this._played = true;

      const cfg    = this._cfg();
      const easing = resolveEasing(cfg.easing);

      this.querySelectorAll('.rn-track').forEach(track => {
        const digit  = parseInt(track.dataset.digit);
        const colIdx = parseInt(track.dataset.col);
        // 優先用 offsetHeight（已 layout），備用 dataset
        const cellPx = track.parentElement.offsetHeight || parseFloat(track.dataset.cellpx) || 48;
        const toVal  = -(digit * cellPx);

        track.style.setProperty('--rn-to', `${toVal}px`);

        // 重置動畫（reflow trick）
        track.style.animation = 'none';
        void track.offsetHeight;

        const delay = (cfg.delayStep * colIdx).toFixed(3);
        track.style.animation =
          `rn-roll ${cfg.duration}s ${easing} ${delay}s 1 forwards`;
      });
    }

    /* ── IntersectionObserver ─────────────── */

    _setupObserver() {
      this._observer && this._observer.disconnect();
      this._observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          this._scheduleAnimate();
          this._observer.disconnect();
        }
      }, { threshold: this._cfg().threshold });
      this._observer.observe(this);
    }
  }

  /* ── 掛載全域設定介面 ── */
  RollingNumber.defaults = {};    // 使用者在這裡覆蓋預設值
  RollingNumber.EASINGS  = EASINGS;
  RollingNumber.RAINBOW  = RAINBOW;

  customElements.define('rolling-number', RollingNumber);
  window.RollingNumber = RollingNumber;

})();
