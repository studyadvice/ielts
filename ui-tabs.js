(function (global) {
  'use strict';
  if (typeof customElements === 'undefined' || customElements.get('ui-tabs')) return;

  /* ═══════════════════════════════════════════════════════════════════
   *  ui-tabs：頁籤
   *
   *  <ui-tabs shape="trapezoid" theme-color="key" gap="-8px">
   *    <tab-item label="口說" icon="mic" accent="pink">內容寫在裡面</tab-item>
   *    <tab-item label="寫作" source="panel-w"></tab-item>
   *  </ui-tabs>
   *
   *  外形：trapezoid 梯形、chamfer-right 右上切角、chamfer-left 左上切角、
   *  browser 瀏覽器分頁（圓角斜邊、有色邊框、底線隨選中頁籤變色，可加裝飾用的 + ）。
   *  未選中是空心輪廓，選中是實心。gap 可以是負值，讓右邊的頁籤疊在左邊上面。
   *
   *  面板內容是「搬進去」而不是複製，裡面的元件、事件、輸入內容都不會遺失。
   * ═══════════════════════════════════════════════════════════════════ */

  var BRAND = {
    base: '#0C0D0C', shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322',
    indigo: '#778CE1', pink: '#FF91D7', red: '#EF6661', green: '#71CD76',
    blue: '#5DBAE8', violet: '#B484E8', gray: '#86877F', key: '#51DBCF',
    calm: '#A3C4BC', quiet: '#8EA4DE', playful: '#FFA987', urgent: '#FF2E63',
    energetic: '#B6FF00', dreamy: '#C394CD', salmon: '#FFC88A',
    'bg-alternative': '#2D2D2D'
  };
  var BG = BRAND.base;

  var SHAPES = ['trapezoid', 'chamfer-right', 'chamfer-left', 'browser'];
  var ANIMS  = ['slide', 'fade', 'none'];
  var STACKS = ['right', 'left'];
  var ALIGNS = { start: 'flex-start', center: 'center', end: 'flex-end' };

  function warn(msg) { if (global.console && console.warn) console.warn('[ui-tabs] ' + msg); }

  /* ---------- 樣式 ---------- */

  /* 輪廓用兩層疊出來：外層是線色，內層縮 2px 填底色，底邊敞開，頁籤像是站在底線上。
     --ut-cut 是斜邊的大小；內層的斜邊往內縮 2px，切角是 45 度，所以交點多縮 0.83px。 */
  var STYLE = [
    'ui-tabs{display:block;--ut-cut:8px;--ut-gap:6px;--ut-line:' + BRAND.gray + ';--ut-theme:' + BRAND.key + ';--ut-fs:1rem;--ut-skew:14deg;--ut-fr:8px}',
    'ui-tabs[shape="browser"]{--ut-gap:-6px;--ut-cut:12px;--ut-arrbg:' + BRAND['bg-alternative'] + '}',

    '.utabs-wrap{position:relative;isolation:isolate}',
    '.utabs-bar{position:relative;scrollbar-width:none;display:flex;align-items:flex-end;flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;' +
      'border-bottom:2px solid var(--ut-line);padding:0;margin:0}',
    '.utabs-bar::-webkit-scrollbar{display:none}',

    '.utabs-tab{position:relative;flex:none;display:inline-flex;align-items:center;gap:8px;' +
      'margin:0;border:0;background:none;color:' + BRAND.shell + ';font:inherit;font-size:var(--ut-fs);font-weight:700;line-height:1.4;' +
      'padding:10px calc(14px + var(--ut-cut));cursor:pointer;-webkit-appearance:none;appearance:none;' +
      'transition:color .2s ease}',
    '.utabs-tab + .utabs-tab{margin-left:var(--ut-gap)}',
    /* 負間距時，被蓋住的那一側多留空間，文字才不會被壓到 */
    '.utabs[data-stack="right"] .utabs-tab:not(:last-child){padding-right:calc(14px + var(--ut-cut) + max(0px, -1 * var(--ut-gap)))}',
    '.utabs[data-stack="left"] .utabs-tab:not(:first-child){padding-left:calc(14px + var(--ut-cut) + max(0px, -1 * var(--ut-gap)))}',

    '.utabs-f{position:absolute;inset:0;z-index:0;background:var(--ut-line);pointer-events:none;transition:background .2s ease}',
    '.utabs-f::after{content:"";position:absolute;inset:0;background:' + BG + '}',
    '.utabs-tab[data-on] .utabs-f,.utabs-tab:not([data-on]):not([disabled]):hover .utabs-f{background:var(--tc)}',
    '.utabs-tab[data-on] .utabs-f::after{display:none}',
    '.utabs-tab > :not(.utabs-f){position:relative;z-index:1}',
    '.utabs-tab:not([data-on]):hover:not([disabled]){color:var(--tc)}',
    '.utabs-tab[data-on]{color:var(--tc-on)}',
    '.utabs-tab[disabled]{opacity:.45;cursor:not-allowed}',

    /* 梯形：上窄下寬 */
    '.utabs[data-shape="trapezoid"] .utabs-f{clip-path:polygon(var(--ut-cut) 0,calc(100% - var(--ut-cut)) 0,100% 100%,0 100%)}',
    '.utabs[data-shape="trapezoid"] .utabs-f::after{clip-path:polygon(calc(var(--ut-cut) + 2px) 2px,calc(100% - var(--ut-cut) - 2px) 2px,calc(100% - 2px) 100%,2px 100%)}',
    /* 右上切角 */
    '.utabs[data-shape="chamfer-right"] .utabs-f{clip-path:polygon(0 0,calc(100% - var(--ut-cut)) 0,100% var(--ut-cut),100% 100%,0 100%)}',
    '.utabs[data-shape="chamfer-right"] .utabs-f::after{clip-path:polygon(2px 2px,calc(100% - var(--ut-cut) - 0.83px) 2px,calc(100% - 2px) calc(var(--ut-cut) + 0.83px),calc(100% - 2px) 100%,2px 100%)}',
    /* 左上切角 */
    '.utabs[data-shape="chamfer-left"] .utabs-f{clip-path:polygon(var(--ut-cut) 0,100% 0,100% 100%,0 100%,0 var(--ut-cut))}',
    '.utabs[data-shape="chamfer-left"] .utabs-f::after{clip-path:polygon(calc(var(--ut-cut) + 0.83px) 2px,calc(100% - 2px) 2px,calc(100% - 2px) 100%,2px 100%,2px calc(var(--ut-cut) + 0.83px))}',

    /* 頁籤太多時，頁籤列兩端出現左右箭頭 */
    '.utabs-arr{position:absolute;top:0;bottom:2px;width:32px;z-index:1000;display:none;align-items:center;border:0;padding:0;margin:0;cursor:pointer;color:' + BRAND.shell + ';-webkit-appearance:none;appearance:none}',
    '.utabs-arr[data-show]{display:flex}',
    '.utabs-arr-l{left:0;justify-content:flex-start;padding-left:6px;background:linear-gradient(to right,var(--ut-arrbg,' + BG + ') 55%,transparent)}',
    '.utabs-arr-r{right:0;justify-content:flex-end;padding-right:6px;background:linear-gradient(to left,var(--ut-arrbg,' + BG + ') 55%,transparent)}',
    '.utabs-arr::before{content:"";width:9px;height:9px;border-top:3px solid currentColor;border-right:3px solid currentColor;transition:color .2s ease}',
    '.utabs-arr-l::before{transform:rotate(-135deg);margin-left:4px}',
    '.utabs-arr-r::before{transform:rotate(45deg);margin-right:4px}',
    '.utabs-arr:hover{color:var(--ut-theme)}',

    /* 選中頁籤底部往外張開的圓弧（browser 外形）：用放射狀漸層畫出弧線與填色，並蓋掉頁籤側邊最下面那一小段邊框 */
    '.utabs-fl,.utabs-fr{display:none}',
    '.utabs[data-shape="browser"]:not([data-flare="off"]) .utabs-tab[data-on] .utabs-fl,.utabs[data-shape="browser"]:not([data-flare="off"]) .utabs-tab[data-on] .utabs-fr{' +
      'display:block;position:absolute;z-index:1;bottom:0;height:var(--ut-fr);width:calc(var(--ut-fr) + 4px);pointer-events:none}',
    '.utabs-fl{left:calc(-1 * var(--ut-fr) + var(--ut-fr) * tan(var(--ut-skew)));' +
      'background:radial-gradient(circle at 0 0,transparent calc(var(--ut-fr) - .5px),var(--tc) var(--ut-fr),var(--tc) calc(var(--ut-fr) + 2px),var(--tf) calc(var(--ut-fr) + 2.5px))}',
    '.utabs-fr{right:calc(-1 * var(--ut-fr) + var(--ut-fr) * tan(var(--ut-skew)));' +
      'background:radial-gradient(circle at 100% 0,transparent calc(var(--ut-fr) - .5px),var(--tc) var(--ut-fr),var(--tc) calc(var(--ut-fr) + 2px),var(--tf) calc(var(--ut-fr) + 2.5px))}',

    /* 裝飾用的 +：不能點，不屬於任何頁籤 */
    '.utabs-plus{opacity:.45;pointer-events:none;cursor:default;user-select:none}',
    '.utabs-plus[hidden]{display:none}',

    /* 瀏覽器分頁：圓角、斜邊、有色邊框，每個頁籤用自己顏色的深色調填滿。
       左右兩半各自 skew，所以斜邊的傾斜角度固定，不會因為頁籤寬度不同而改變。 */
    '.utabs[data-shape="browser"] .utabs-bar{background:var(--ut-barbg,' + BRAND['bg-alternative'] + ');padding:10px 10px 0 10px;transition:border-color .2s ease}',
    '.utabs[data-shape="browser"] .utabs-tab{font-size:calc(var(--ut-fs) * .85);padding-top:8px;padding-bottom:8px;color:' + BRAND.shell + '}',
    '.utabs[data-shape="browser"] .utabs-tab[data-on]{font-size:calc(var(--ut-fs) * 1.25);padding-top:10px;padding-bottom:10px;color:' + BRAND.vanilla + '}',
    '.utabs[data-shape="browser"] .utabs-tab:not([data-on]):hover:not([disabled]){color:' + BRAND.vanilla + '}',
    '.utabs[data-shape="browser"] .utabs-f,.utabs[data-shape="browser"] .utabs-tab[data-on] .utabs-f,.utabs[data-shape="browser"] .utabs-tab:not([data-on]):not([disabled]):hover .utabs-f{' +
      'background:none;clip-path:none;--tf:color-mix(in srgb,var(--tc) 26%,' + BG + ')}',
    '.utabs[data-shape="browser"] .utabs-tab[data-on] .utabs-f{--tf:color-mix(in srgb,var(--tc) 38%,' + BG + ')}',
    '.utabs[data-shape="browser"] .utabs-tab:not([data-on]):not([disabled]):hover .utabs-f{--tf:color-mix(in srgb,var(--tc) 34%,' + BG + ')}',
    '.utabs[data-shape="browser"] .utabs-f::before,.utabs[data-shape="browser"] .utabs-f::after{' +
      'content:"";display:block;position:absolute;top:0;bottom:0;width:calc(50% + 2px);box-sizing:border-box;' +
      'background:var(--tf);border:2px solid var(--tc);border-bottom:0;clip-path:none;transform-origin:bottom;transition:background .2s ease}',
    '.utabs[data-shape="browser"] .utabs-f::before{left:0;right:auto;border-right:0;border-top-left-radius:10px;transform:skewX(calc(-1 * var(--ut-skew)))}',
    '.utabs[data-shape="browser"] .utabs-f::after{left:auto;right:0;border-left:0;border-top-right-radius:10px;transform:skewX(var(--ut-skew))}',
    '.utabs[data-shape="browser"] .utabs-plus{opacity:1;color:#fff;font-size:calc(var(--ut-fs) * .95);padding-top:6px;padding-bottom:6px}',
    '.utabs[data-shape="browser"] .utabs-plus .utabs-f{--tf:#3B3B3B}',
    '.utabs[data-shape="browser"] .utabs-plus .utabs-f::before,.utabs[data-shape="browser"] .utabs-plus .utabs-f::after{border:0}',
    '.utabs[data-plus][data-stack="right"] .utabs-tab:nth-last-child(2){padding-right:calc(14px + var(--ut-cut))}',

    '.utabs-panels{position:relative;padding:var(--ut-pp,16px) 0 0 0;overflow-x:clip}',
    '.utabs-panel{display:none}',
    '.utabs-panel[data-on]{display:block}',
    '.utabs-in-r{animation:utabs-r .28s ease both}',
    '.utabs-in-l{animation:utabs-l .28s ease both}',
    '.utabs-in-f{animation:utabs-f .28s ease both}',
    '@keyframes utabs-r{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:none}}',
    '@keyframes utabs-l{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:none}}',
    '@keyframes utabs-f{from{opacity:0}to{opacity:1}}',

    'tab-item{display:none}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('_utabs_css')) return;
    var el = document.createElement('style');
    el.id = '_utabs_css';
    el.textContent = STYLE;
    (document.head || document.documentElement).appendChild(el);
  }

  /* ---------- 顏色 ---------- */

  function resolveColor(v) {
    if (v === null || v === undefined) return '';
    var t = String(v).trim();
    if (!t) return '';
    var k = t.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(BRAND, k)) return BRAND[k];
    if (global.CSS && global.CSS.supports && global.CSS.supports('color', t)) return t;
    warn('顏色 "' + t + '" 無效，可用名稱：' + Object.keys(BRAND).join('、'));
    return '';
  }

  function textOn(c) {
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c || '');
    if (!m) return BG;
    var h = m[1];
    if (h.length === 3) h = h.split('').map(function (x) { return x + x; }).join('');
    var r = parseInt(h.substr(0, 2), 16) / 255, g = parseInt(h.substr(2, 2), 16) / 255, b = parseInt(h.substr(4, 2), 16) / 255;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 0.5 ? BRAND.vanilla : BG;
  }

  function fs(v) {
    if (v == null) return '';
    var t = String(v).trim();
    if (!t) return '';
    return /^\d*\.?\d+$/.test(t) ? t + 'rem' : t;
  }

  function lenOk(v) {
    return /^-?\d*\.?\d+(px|rem|em)$/.test(String(v).trim());
  }

  /* ---------- 元件 ---------- */

  var UiTabs = global.UiTabs = {};

  class UiTabsEl extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'gap', 'cut', 'theme-color', 'line-color', 'tab-size', 'stack', 'align', 'panel-padding', 'skew', 'bar-color', 'plus', 'flare'];
    }

    connectedCallback() {
      if (this._built) return;
      injectCSS();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._build(), { once: true });
      } else {
        this._build();
      }
    }

    attributeChangedCallback() {
      if (this._built) this._style();
    }

    /* 讀取 <tab-item>，把內容搬進面板 */
    _build() {
      if (this._built) return;
      var items = Array.prototype.slice.call(this.querySelectorAll(':scope > tab-item'));
      if (!items.length) { warn('<ui-tabs> 裡沒有 <tab-item>'); return; }
      this._built = true;

      var root = document.createElement('div');
      root.className = 'utabs';
      var bar = document.createElement('div');
      bar.className = 'utabs-bar';
      var panels = document.createElement('div');
      panels.className = 'utabs-panels';

      this._tabs = [];
      this._panels = [];
      var self = this;
      var first = -1, marked = -1;

      items.forEach(function (it, i) {
        var label = it.getAttribute('label') || ('頁籤 ' + (i + 1));
        var disabled = it.hasAttribute('disabled');
        var accent = resolveColor(it.getAttribute('accent'));

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'utabs-tab';
        if (disabled) btn.setAttribute('disabled', '');
        btn._accent = accent;

        var f = document.createElement('i');
        f.className = 'utabs-f';
        var fl = document.createElement('i'); fl.className = 'utabs-fl';
        var fr = document.createElement('i'); fr.className = 'utabs-fr';
        f.appendChild(fl);
        f.appendChild(fr);
        btn.appendChild(f);

        var icon = (it.getAttribute('icon') || '').trim();
        if (icon) {
          var ie = document.createElement('i');
          ie.className = 'bi ' + (icon.indexOf('bi-') === 0 ? icon : 'bi-' + icon);
          btn.appendChild(ie);
        }
        var sp = document.createElement('span');
        sp.textContent = label;
        btn.appendChild(sp);

        var panel = document.createElement('div');
        panel.className = 'utabs-panel';

        /* 內容來源：source 指向的元素（<template> 則複製內容，其他元素把子節點搬進來），否則用 <tab-item> 自己的內容 */
        var srcId = (it.getAttribute('source') || '').trim().replace(/^#/, '');
        var src = srcId ? document.getElementById(srcId) : null;
        if (srcId && !src) warn('找不到 source 指定的元素 #' + srcId);
        if (src && src.localName === 'template') {
          panel.appendChild(src.content.cloneNode(true));
        } else if (src) {
          while (src.firstChild) panel.appendChild(src.firstChild);
          src.style.display = 'none';
        } else {
          while (it.firstChild) panel.appendChild(it.firstChild);
        }

        btn.addEventListener('click', function () { if (!btn.hasAttribute('disabled')) self.select(i); });

        bar.appendChild(btn);
        panels.appendChild(panel);
        self._tabs.push(btn);
        self._panels.push(panel);

        if (!disabled && first < 0) first = i;
        if (!disabled && marked < 0 && it.hasAttribute('active')) marked = i;
      });

      var plus = document.createElement('span');
      plus.className = 'utabs-tab utabs-plus';
      plus.setAttribute('aria-hidden', 'true');
      plus.hidden = true;
      var pf = document.createElement('i');
      pf.className = 'utabs-f';
      var pt = document.createElement('span');
      pt.textContent = '+';
      plus.appendChild(pf);
      plus.appendChild(pt);
      bar.appendChild(plus);
      this._plus = plus;

      items.forEach(function (it) { it.remove(); });
      var wrap = document.createElement('div');
      wrap.className = 'utabs-wrap';
      var aL = document.createElement('button'), aR = document.createElement('button');
      aL.type = aR.type = 'button';
      aL.className = 'utabs-arr utabs-arr-l';
      aR.className = 'utabs-arr utabs-arr-r';
      aL.tabIndex = aR.tabIndex = -1;
      aL.addEventListener('click', function () { bar.scrollBy({ left: -bar.clientWidth * 0.6, behavior: 'smooth' }); });
      aR.addEventListener('click', function () { bar.scrollBy({ left: bar.clientWidth * 0.6, behavior: 'smooth' }); });
      wrap.appendChild(bar);
      wrap.appendChild(aL);
      wrap.appendChild(aR);
      this._aL = aL;
      this._aR = aR;
      bar.addEventListener('scroll', function () { self._arrows(); });
      /* 頁籤列溢出時，滑鼠滾輪的垂直滾動改成橫向 */
      bar.addEventListener('wheel', function (e) {
        if (bar.scrollWidth <= bar.clientWidth || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
        e.preventDefault();
        bar.scrollLeft += e.deltaY;
      }, { passive: false });
      if (global.ResizeObserver) {
        var ro = new ResizeObserver(function () { self._arrows(); });
        ro.observe(bar);
        this._tabs.forEach(function (b) { ro.observe(b); });
        this._ro = ro;
      }
      root.appendChild(wrap);
      root.appendChild(panels);
      this.appendChild(root);
      this._root = root;
      this._bar = bar;

      this._style();
      this._index = -1;
      var start = marked >= 0 ? marked : first;
      if (start >= 0) this._show(start, false);
    }

    /* 套用外觀屬性 */
    _style() {
      var a = (n) => this.getAttribute(n);
      var root = this._root;

      var shape = (a('shape') || 'trapezoid').trim().toLowerCase();
      if (SHAPES.indexOf(shape) === -1) { warn('shape="' + shape + '" 無效，可用：' + SHAPES.join('、') + '，已改用 trapezoid'); shape = 'trapezoid'; }
      root.setAttribute('data-shape', shape);

      var stack = (a('stack') || 'right').trim().toLowerCase();
      if (STACKS.indexOf(stack) === -1) { warn('stack="' + stack + '" 無效，可用：right、left，已改用 right'); stack = 'right'; }
      root.setAttribute('data-stack', stack);

      var setVar = (name, v) => { if (v) this.style.setProperty(name, v); else this.style.removeProperty(name); };

      var gap = a('gap');
      if (gap && !lenOk(gap)) { warn('gap="' + gap + '" 無效，請用 px、rem 或 em，可以是負值，例如 -8px'); gap = ''; }
      setVar('--ut-gap', gap ? gap.trim() : '');

      var cut = a('cut');
      if (cut && !lenOk(cut)) { warn('cut="' + cut + '" 無效，請用 px、rem 或 em，例如 8px'); cut = ''; }
      setVar('--ut-cut', cut ? cut.trim() : '');

      setVar('--ut-theme', resolveColor(a('theme-color')));
      setVar('--ut-line', resolveColor(a('line-color')));
      setVar('--ut-fs', fs(a('tab-size')));
      setVar('--ut-pp', a('panel-padding') ? a('panel-padding').trim() : '');

      var skew = a('skew');
      if (skew && !(/^\d*\.?\d+(deg)?$/.test(skew.trim()) && parseFloat(skew) <= 30)) { warn('skew="' + skew + '" 無效，請用 0 到 30 的角度，例如 14'); skew = ''; }
      setVar('--ut-skew', skew ? parseFloat(skew) + 'deg' : '');

      var bb = a('bar-color');
      setVar('--ut-barbg', bb ? resolveColor(bb) : '');

      var fr = a('flare');
      var frT = fr ? fr.trim().toLowerCase() : '';
      if (frT === 'none' || frT === '0' || frT === 'false') {
        root.setAttribute('data-flare', 'off'); setVar('--ut-fr', '');
      } else {
        root.removeAttribute('data-flare');
        if (frT && !lenOk(frT)) { warn('flare="' + fr + '" 無效，請用 px、rem 或 em，或寫 none 關閉'); frT = ''; }
        setVar('--ut-fr', frT);
      }
      var bbc = bb ? resolveColor(bb) : '';
      /* 箭頭的底色要蓋住頁籤，頁籤列背景是透明時改用頁面底色 */
      setVar('--ut-arrbg', bbc ? (bbc === 'transparent' ? BG : bbc) : (bb && /^transparent$/i.test(bb.trim()) ? BG : ''));

      var pl = a('plus');
      var plusOn = pl !== null && String(pl).trim().toLowerCase() !== 'false';
      this._plus.hidden = !plusOn;
      if (plusOn) root.setAttribute('data-plus', ''); else root.removeAttribute('data-plus');

      var al = (a('align') || 'start').trim().toLowerCase();
      this._bar.style.justifyContent = ALIGNS[al] || 'flex-start';

      var theme = resolveColor(a('theme-color')) || BRAND.key;
      var n = this._tabs.length;
      this._tabs.forEach(function (btn, i) {
        var c = btn._accent || theme;
        btn.style.setProperty('--tc', c);
        btn.style.setProperty('--tc-on', textOn(c));
      });
      this._zorder();
      this._barColor();
    }

    /* 依捲動位置顯示或隱藏左右箭頭 */
    _arrows() {
      if (!this._bar) return;
      var b = this._bar;
      var over = b.scrollWidth > b.clientWidth + 1;
      this._aL.toggleAttribute('data-show', over && b.scrollLeft > 1);
      this._aR.toggleAttribute('data-show', over && b.scrollLeft + b.clientWidth < b.scrollWidth - 1);
    }

    /* 把選中的頁籤捲到頁籤列中間 */
    _reveal(smooth) {
      var b = this._bar, t = this._tabs[this._index];
      if (!b || !t || b.scrollWidth <= b.clientWidth) return;
      b.scrollTo({ left: t.offsetLeft - (b.clientWidth - t.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
    }

    /* 瀏覽器外形：整條底線的顏色跟著選中的頁籤 */
    _barColor() {
      if (!this._bar) return;
      var t = this._tabs[this._index];
      var on = this._root.getAttribute('data-shape') === 'browser' && t;
      this._bar.style.borderBottomColor = on ? t.style.getPropertyValue('--tc') : '';
    }

    /* 疊放順序：預設右邊蓋左邊（stack="left" 則相反），選中的永遠在最上面 */
    _zorder() {
      var n = this._tabs.length;
      var right = this._root.getAttribute('data-stack') !== 'left';
      var cur = this._index;
      this._plus.style.zIndex = 0;
      this._tabs.forEach(function (btn, i) {
        btn.style.zIndex = (i === cur) ? n + 1 : (right ? i + 1 : n - i);
      });
    }

    _show(i, animate) {
      var prev = this._index;
      var tabs = this._tabs, panels = this._panels;
      this._index = i;
      tabs.forEach(function (b, k) { if (k === i) b.setAttribute('data-on', ''); else b.removeAttribute('data-on'); });
      panels.forEach(function (p, k) {
        p.classList.remove('utabs-in-r', 'utabs-in-l', 'utabs-in-f');
        if (k === i) p.setAttribute('data-on', ''); else p.removeAttribute('data-on');
      });
      this._zorder();
      this._barColor();
      this._reveal(animate);
      this._arrows();

      var anim = (this.getAttribute('animation') || 'slide').trim().toLowerCase();
      if (ANIMS.indexOf(anim) === -1) { warn('animation="' + anim + '" 無效，可用：' + ANIMS.join('、') + '，已改用 slide'); anim = 'slide'; }
      if (animate && anim !== 'none' && prev !== i) {
        var cls = anim === 'fade' ? 'utabs-in-f' : (i > prev ? 'utabs-in-r' : 'utabs-in-l');
        panels[i].classList.add(cls);
      }
      /* 剛顯示出來的面板裡若有要量尺寸的元件（表格、圖表），通知它們重新排版 */
      if (animate) global.dispatchEvent(new Event('resize'));
    }

    /* 切換到第 n 個頁籤（從 0 開始），或指定頁籤標題 */
    select(target) {
      if (!this._built) return;
      var i = typeof target === 'number' ? target : this._tabs.findIndex(function (b) {
        return b.querySelector('span:last-child').textContent === String(target);
      });
      if (i < 0 || i >= this._tabs.length || this._tabs[i].hasAttribute('disabled') || i === this._index) return;
      this._show(i, true);
    }

    get index() { return this._index; }
  }

  customElements.define('ui-tabs', UiTabsEl);

  UiTabs.select = function (el, target) { if (el && el.select) el.select(target); };
  UiTabs.colors = BRAND;

  injectCSS();

}(window));
