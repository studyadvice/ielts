/*!
 * <ui-mask> 行內文字遮罩元件 v1.1.0（11-11-26）
 * v1.1.0：修正 label 在短內容時被擠成直排、在表格或卡片內被裁掉、與半透明原文重疊的問題；
 *         新增 label-mode="show"，讓行內遮罩也能直接顯示提示文字。
 * 用途：包住一段文字產生遮罩，點擊後揭曉原文。可放在一般段落、<ui-table> 的格子、<ui-cards> 的卡片與面板裡。
 * 不使用 shadow DOM，CSS 由本檔自動注入，不需要其他函式庫。
 *
 * 設計原則（為了在 ui-table、ui-cards 裡正常運作）：
 *   - 不修改子元素：遮罩全部用 CSS 畫出，元件被 innerHTML 複製或 cloneNode 後不會重複疊加結構。
 *   - 狀態寫在屬性上：揭曉後加上 revealed 屬性，複製時跟著走。
 *   - 每次連上頁面都重新綁定事件：被宿主元件重建的元素也能點擊。
 *   - 未揭曉時攔下點擊，不讓它觸發宿主格子或卡片的點擊功能；揭曉後點擊照常往上傳遞。
 */
(function () {
  'use strict';
  if (window.customElements && customElements.get('ui-mask')) return;

  var PALETTE = {
    background: '#0C0D0C', base: '#0C0D0C',
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7',
    red: '#EF6661', green: '#71CD76', blue: '#5DBAE8',
    indigo: '#778CE1', violet: '#B484E8', gray: '#86877F', key: '#51DBCF',
    calm: '#A3C4BC', quiet: '#8EA4DE', playful: '#FFA987',
    urgent: '#FF2E63',
    energetic: '#B6FF00',
    dreamy: '#DE8EC9',
    'bg-alternative': '#3B2A20'
  };

  /* 與 ui-table 的 mask-gradient 相同的六組預設漸層 */
  var GRADIENTS = {
    '1': 'linear-gradient(135deg,#0d0814 0%,#1e1040 45%,#778CE1 100%)',
    '2': 'linear-gradient(135deg,#041418 0%,#073540 45%,#5DBAE8 100%)',
    '3': 'linear-gradient(135deg,#1c0900 0%,#6b3000 50%,#FFA987 100%)',
    '4': 'linear-gradient(135deg,#1a060e 0%,#5e1535 50%,#FF91D7 100%)',
    '5': 'linear-gradient(135deg,#041208 0%,#083820 50%,#71CD76 100%)',
    '6': 'linear-gradient(135deg,#060c1e 0%,#162060 50%,#778CE1 80%,#778CE1 100%)'
  };

  var STYLES = ['solid', 'stripe', 'dots', 'blur', 'underline', 'gradient'];

  /* 遮罩生效的條件：未揭曉，而且不是 hover 模式下滑鼠正停在上面 */
  var M = 'ui-mask:not([revealed]):not([data-um-hover])';

  var CSS = [
    'ui-mask{display:inline;position:relative;border-radius:var(--um-r,4px);padding:var(--um-p,0 2px);' +
      '-webkit-box-decoration-break:clone;box-decoration-break:clone;' +
      'transition:background-color .25s ease,color .25s ease,text-shadow .25s ease,text-decoration-color .25s ease}',
    'ui-mask[display="block"]{display:block}',
    'ui-mask[display="inline-block"]{display:inline-block}',
    M + '{cursor:pointer;-webkit-user-select:none;user-select:none}',
    'ui-mask[revealed][toggle]{cursor:pointer}',
    /* 遮罩期間，子元素（色名標籤、粗體等）一律跟著淡出，避免自己的顏色透出來 */
    M + ' *{color:inherit !important;background:transparent !important;text-shadow:inherit !important;border-color:transparent !important}',
    M + ' img,' + M + ' svg,' + M + ' i{visibility:hidden}',

    /* 文字依透明度淡出：opacity 1 完全看不見，0.5 剩一半 */
    M + '[data-um-style="solid"],' + M + '[data-um-style="stripe"],' + M + '[data-um-style="dots"],' + M + '[data-um-style="gradient"]{' +
      'color:color-mix(in srgb,currentColor calc((1 - var(--um-o,1)) * 100%),transparent)}',

    M + '[data-um-style="solid"]{background-color:var(--um-bg)}',
    M + '[data-um-style="stripe"]{background-image:repeating-linear-gradient(45deg,var(--um-bg) 0 6px,var(--um-bg2) 6px 12px)}',
    M + '[data-um-style="dots"]{background-color:var(--um-bg);background-image:radial-gradient(circle,var(--um-bg2) 1.6px,transparent 2px);background-size:8px 8px}',
    /* 漸層本身不透明，opacity 只控制文字被遮住的程度 */
    M + '[data-um-style="gradient"]{background-image:var(--um-grad)}',

    /* 模糊：文字改成遮罩色的模糊光暈，opacity 控制光暈濃淡 */
    M + '[data-um-style="blur"]{color:transparent;text-shadow:0 0 var(--um-blur,5px) var(--um-bg)}',

    M + '[data-um-style="underline"]{color:transparent;text-decoration:underline;text-decoration-color:var(--um-c);' +
      'text-decoration-thickness:var(--um-lw,2px);text-underline-offset:6px;text-decoration-skip-ink:none}',
    M + '[data-um-style="underline"] *{text-decoration:inherit}',

    /* 提示文字（data-um-lv 由 JS 依 display 與 label-mode 決定）：
       不換行、置中，遮罩至少撐到提示文字的寬度；空間仍不夠時以 ... 截斷，不再溢出蓋到別行 */
    M + '[data-um-lv]{min-width:min(var(--um-lmin,0px),100%);min-height:1.6em;max-width:100%;box-sizing:border-box}',
    M + '[data-um-lv]:not([display="block"]){display:inline-block;vertical-align:bottom}',
    M + '[data-um-lv]::after{' +
      'content:attr(label);position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);display:block;' +
      'padding:0 8px;box-sizing:border-box;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' +
      'color:var(--um-lc);font-size:0.95em;font-weight:700;line-height:1.3;pointer-events:none;' +
      'text-shadow:none;text-decoration:none}',
    /* 有提示文字時，原文完全隱藏，避免與提示文字疊在一起（模糊樣式保留光暈） */
    M + '[data-um-lv]:not([data-um-style="blur"]){color:transparent !important}',
    M + '[data-um-lv][data-um-style="blur"]{text-shadow:0 0 var(--um-blur,5px) color-mix(in srgb,var(--um-bg) 45%,transparent)}',

    /* 揭曉的瞬間淡入 */
    'ui-mask[revealed]{animation:um-in .3s ease}',
    '@keyframes um-in{from{opacity:.35}to{opacity:1}}'
  ].join('\n');

  function injectCss() {
    if (document.getElementById('ui-mask-style')) return;
    var s = document.createElement('style');
    s.id = 'ui-mask-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function color(v, def) {
    v = (v || '').trim();
    if (!v) return def;
    return PALETTE[v.toLowerCase()] || v;
  }

  function px(v, def) {
    v = (v || '').trim();
    if (!v) return def;
    return v.split(/\s+/).map(function (t) { return /^-?\d+(\.\d+)?$/.test(t) ? t + 'px' : t; }).join(' ');
  }

  /* 依遮罩顏色決定提示文字用深色或淺色 */
  function labelColor(c) {
    var m = /^#([0-9a-f]{6})$/i.exec(c);
    if (!m) return '#0C0D0C';
    var n = parseInt(m[1], 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (r * 299 + g * 587 + b * 114) / 1000 < 140 ? '#DBEDD8' : '#0C0D0C';
  }

  var ATTRS = ['color', 'opacity', 'mask-style', 'blur', 'radius', 'padding', 'label', 'label-color', 'line-width', 'gradient', 'display', 'label-mode'];

  class UiMask extends HTMLElement {
    static get observedAttributes() { return ATTRS.concat(['revealed']); }

    constructor() {
      super();
      this._onClick = this._onClick.bind(this);
      this._onEnter = this._onEnter.bind(this);
      this._onLeave = this._onLeave.bind(this);
    }

    connectedCallback() {
      injectCss();
      this._apply();
      this.addEventListener('click', this._onClick);
      this.addEventListener('mouseenter', this._onEnter);
      this.addEventListener('mouseleave', this._onLeave);
    }

    disconnectedCallback() {
      this.removeEventListener('click', this._onClick);
      this.removeEventListener('mouseenter', this._onEnter);
      this.removeEventListener('mouseleave', this._onLeave);
      this.removeAttribute('data-um-hover');
    }

    attributeChangedCallback(name, oldV, newV) {
      if (oldV === newV || !this.isConnected) return;
      if (name === 'revealed') { this._syncTitle(); return; }
      this._apply();
    }

    /* ---- public api ---- */
    get revealed() { return this.hasAttribute('revealed'); }
    set revealed(v) { if (v) this.reveal(); else this.hide(); }
    reveal() { this._set(true, 'api'); }
    hide() { this._set(false, 'api'); }

    /* ---- internals ---- */
    _isHover() { return (this.getAttribute('trigger') || '').trim().toLowerCase() === 'hover'; }

    _apply() {
      var st = (this.getAttribute('mask-style') || 'solid').trim().toLowerCase();
      if (STYLES.indexOf(st) === -1) {
        console.warn('[ui-mask] mask-style="' + st + '" 不是有效的值（' + STYLES.join(' / ') + '），已改用 solid。');
        st = 'solid';
      }
      if (this.getAttribute('data-um-style') !== st) this.setAttribute('data-um-style', st);

      var c = color(this.getAttribute('color'), PALETTE.shell);
      var o = parseFloat(this.getAttribute('opacity'));
      if (!isFinite(o)) o = 1;
      o = Math.max(0, Math.min(1, o));
      var pct = Math.round(o * 1000) / 10 + '%';

      var s = this.style;
      s.setProperty('--um-c', c);
      s.setProperty('--um-o', String(o));
      s.setProperty('--um-bg', 'color-mix(in srgb,' + c + ' ' + pct + ',transparent)');
      s.setProperty('--um-bg2', 'color-mix(in srgb,color-mix(in srgb,' + c + ' 62%,#0C0D0C) ' + pct + ',transparent)');
      var g = (this.getAttribute('gradient') || '1').trim();
      s.setProperty('--um-grad', GRADIENTS[g] || g);
      s.setProperty('--um-blur', px(this.getAttribute('blur'), '5px'));
      s.setProperty('--um-r', px(this.getAttribute('radius'), '4px'));
      s.setProperty('--um-p', px(this.getAttribute('padding'), '0 2px'));
      s.setProperty('--um-lw', px(this.getAttribute('line-width'), '2px'));
      /* 提示文字預設色：色塊類取對比色；模糊、底線沒有底色，直接用遮罩色 */
      var lcDef = (st === 'blur' || st === 'underline') ? c : labelColor(st === 'gradient' ? '#0C0D0C' : c);
      s.setProperty('--um-lc', color(this.getAttribute('label-color'), lcDef));
      this._syncLabel();
      this._syncTitle();
    }

    /* 提示文字是否顯示在遮罩上：區塊、行內區塊一律顯示；行內預設只當滑鼠提示，label-mode="show" 時才顯示 */
    _labelVisible() {
      if (!this.getAttribute('label')) return false;
      var d = (this.getAttribute('display') || 'inline').toLowerCase();
      if (d !== 'inline') return true;
      return (this.getAttribute('label-mode') || '').trim().toLowerCase() === 'show';
    }

    _syncLabel() {
      if (!this._labelVisible()) {
        this.removeAttribute('data-um-lv');
        this.style.removeProperty('--um-lmin');
        return;
      }
      if (!this.hasAttribute('data-um-lv')) this.setAttribute('data-um-lv', '');
      this._measureLabel();
    }

    /* 量出提示文字的寬度，讓遮罩至少這麼寬（加上左右各 8px 內距） */
    _measureLabel() {
      var cs = getComputedStyle(this);
      var size = parseFloat(cs.fontSize) * 0.95 || 15;
      var ctx = UiMask._ctx || (UiMask._ctx = document.createElement('canvas').getContext('2d'));
      ctx.font = '700 ' + size + 'px ' + cs.fontFamily;
      var w = Math.ceil(ctx.measureText(this.getAttribute('label')).width) + 16 + 4;
      this.style.setProperty('--um-lmin', w + 'px');
    }

    /* 行內模式沒有空間放提示文字，改用滑鼠提示；揭曉後移除 */
    _syncTitle() {
      var d = (this.getAttribute('display') || 'inline').toLowerCase();
      var label = this.getAttribute('label');
      if (label && d === 'inline' && !this._labelVisible() && !this.revealed) this.setAttribute('title', label);
      else if (this.getAttribute('title') === label) this.removeAttribute('title');
    }

    _set(on, source) {
      if (on === this.revealed) return;
      if (on) this.setAttribute('revealed', '');
      else this.removeAttribute('revealed');
      this.dispatchEvent(new CustomEvent('mask-reveal', {
        bubbles: true,
        detail: { revealed: on, source: source }
      }));
    }

    _onClick(e) {
      if (this._isHover()) return;
      if (!this.revealed) {
        /* 未揭曉：這次點擊只用來揭曉，不往上觸發格子或卡片的功能 */
        e.stopPropagation();
        e.preventDefault();
        this._set(true, 'click');
      } else if (this.hasAttribute('toggle')) {
        e.stopPropagation();
        e.preventDefault();
        this._set(false, 'click');
      }
    }

    _onEnter() { if (this._isHover() && !this.revealed) this.setAttribute('data-um-hover', ''); }
    _onLeave() { this.removeAttribute('data-um-hover'); }
  }

  function scopeOf(scope) {
    if (!scope) return document;
    if (typeof scope === 'string') return document.querySelector(scope) || document;
    return scope;
  }

  UiMask.revealAll = function (scope) {
    Array.prototype.forEach.call(scopeOf(scope).querySelectorAll('ui-mask'), function (m) { m._set(true, 'api'); });
  };
  UiMask.hideAll = function (scope) {
    Array.prototype.forEach.call(scopeOf(scope).querySelectorAll('ui-mask'), function (m) { m._set(false, 'api'); });
  };

  /* 網頁字型載入後重新量一次提示文字寬度 */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      Array.prototype.forEach.call(document.querySelectorAll('ui-mask[data-um-lv]'), function (m) { if (m._measureLabel) m._measureLabel(); });
    });
  }

  window.UiMask = UiMask;
  injectCss();
  customElements.define('ui-mask', UiMask);
})();
