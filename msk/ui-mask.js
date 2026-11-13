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

    /* ── 圖片遮罩（<mask-cover>）：只要 ui-mask 裡有 mask-cover 就進入這個模式 ── */
    'ui-mask[data-um-cover]{display:block;position:relative;background:none !important;' +
      'transition:min-height var(--um-cd,450ms) ease}',
    M + '[data-um-cover]{min-height:var(--um-cover-h,0px);color:transparent}',
    M + '[data-um-cover] > :not(mask-cover){visibility:hidden}',
    'ui-mask > mask-cover{display:none}',
    'ui-mask[data-um-cover] > mask-cover{display:block;position:absolute;inset:0;z-index:3;overflow:hidden;' +
      'border-radius:var(--um-r,4px);cursor:pointer;' +
      'transition:opacity var(--um-cd,450ms) ease,transform var(--um-cd,450ms) ease,clip-path var(--um-cd,450ms) ease,visibility 0s linear 0s}',
    'ui-mask[data-um-cover]:not([revealed]) > mask-cover{background:var(--um-cover-bg,#C6C7BD) !important}',
    'ui-mask[data-um-cover] > mask-cover > svg,ui-mask[data-um-cover] > mask-cover > template{display:none}',
    'ui-mask[data-um-cover] .um-cover-in{display:flex;flex-direction:column;align-items:center;gap:0px;' +
      'padding:var(--um-cover-pad,16px);box-sizing:border-box}',
    'ui-mask[data-um-cover][data-um-cover-pos="center"] > mask-cover{display:flex;flex-direction:column;justify-content:center}',
    'ui-mask[data-um-cover][data-um-cover-pos="bottom"] > mask-cover{display:flex;flex-direction:column;justify-content:flex-end}',
    'ui-mask[data-um-cover] .um-cover-img{display:block;width:var(--um-cover-w,100%);max-width:100%;height:auto;' +
      'visibility:visible !important;-webkit-user-drag:none;user-select:none}',
    'ui-mask[data-um-cover] .um-cover-band{align-self:stretch;margin:12px 0 0 0;padding:8px 12px;border-radius:6px;' +
      'text-align:center;font-weight:700;font-size:0.95rem;line-height:1.4;' +
      'background:var(--um-c) !important;color:var(--um-lc) !important}',
    'ui-mask[data-um-cover] .um-cover-band:empty{display:none}',
    /* 揭曉：圖片層依效果離場，之後不再擋點擊 */
    'ui-mask[data-um-cover][revealed] > mask-cover,ui-mask[data-um-cover][data-um-hover] > mask-cover{' +
      'pointer-events:none;visibility:hidden;' +
      'transition:opacity var(--um-cd,450ms) ease,transform var(--um-cd,450ms) ease,clip-path var(--um-cd,450ms) ease,visibility 0s linear var(--um-cd,450ms)}',
    'ui-mask[data-um-cover][data-um-cover-fx="fade"][revealed] > mask-cover,ui-mask[data-um-cover][data-um-cover-fx="fade"][data-um-hover] > mask-cover{opacity:0}',
    'ui-mask[data-um-cover][data-um-cover-fx="lift"] > mask-cover{clip-path:inset(0 0 0 0)}',
    'ui-mask[data-um-cover][data-um-cover-fx="lift"][revealed] > mask-cover,ui-mask[data-um-cover][data-um-cover-fx="lift"][data-um-hover] > mask-cover{clip-path:inset(0 0 100% 0)}',
    'ui-mask[data-um-cover][data-um-cover-fx="shrink"][revealed] > mask-cover,ui-mask[data-um-cover][data-um-cover-fx="shrink"][data-um-hover] > mask-cover{opacity:0;transform:scale(.6)}',
    'ui-mask[data-um-cover][revealed]{animation:none}',

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

  var ATTRS = ['color', 'opacity', 'mask-style', 'blur', 'radius', 'padding', 'label', 'label-color', 'line-width', 'gradient', 'display', 'label-mode', 'trigger'];

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
      this._syncCover();
      this._syncLabel();
      this._syncTitle();
    }

    /* 有 <mask-cover> 子元件時進入圖片遮罩模式 */
    _coverEl() { return this.querySelector(':scope > mask-cover'); }
    _syncCover() {
      var cv = this._coverEl();
      if (!cv) {
        ['data-um-cover', 'data-um-cover-fx', 'data-um-cover-pos'].forEach(function (a) { this.removeAttribute(a); }, this);
        return;
      }
      if (!this.hasAttribute('data-um-cover')) this.setAttribute('data-um-cover', '');
      if (cv._render) cv._render();
    }

    /* 提示文字是否顯示在遮罩上：區塊、行內區塊一律顯示；行內預設只當滑鼠提示，label-mode="show" 時才顯示 */
    _labelVisible() {
      if (!this.getAttribute('label')) return false;
      if (this._coverEl()) return false;   /* 圖片遮罩的提示語畫在圖片下方的橫帶 */
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
      if (label && d === 'inline' && !this._coverEl() && !this._labelVisible() && !this.revealed) this.setAttribute('title', label);
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


  /* ══ <mask-cover>：圖片遮罩 ══════════════════════════════════════════════
     放在 <ui-mask> 裡第一層。圖片來源三選一：src（網址）、template（<template> 的 id）、直接把 <svg> 寫在裡面。
     SVG 一律轉成 <img> 顯示，同一張圖用在多處時，SVG 內的 id 與樣式不會互相干擾。 */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var COVER_ATTRS = ['src', 'template', 'width', 'bg', 'effect', 'duration', 'position', 'padding', 'alt'];
  var COVER_FX = ['fade', 'lift', 'shrink'];
  var _svgCache = {}, _fetchCache = {};

  function cssLen(v, def) {
    v = (v || '').trim();
    if (!v) return def;
    if (/^\d+(\.\d+)?$/.test(v)) return v + 'px';
    if (/^\d*\.?\d+(px|rem|em|%|vw)$/.test(v)) return v;
    console.warn('[mask-cover] 長度格式無效：' + v + '，已改用 ' + def + '。');
    return def;
  }

  /* 從 SVG 原始碼找出鋪滿整張圖的底色（第一個 rect 或 path 鋪滿 viewBox 時才算） */
  function svgBackground(text) {
    try {
      var doc = new DOMParser().parseFromString(text, 'image/svg+xml');
      var root = doc.documentElement;
      if (!root || root.nodeName.toLowerCase() !== 'svg') return '';
      var vb = (root.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(parseFloat);
      var W = vb.length === 4 ? vb[2] : parseFloat(root.getAttribute('width'));
      var H = vb.length === 4 ? vb[3] : parseFloat(root.getAttribute('height'));
      var first = null;
      for (var n = root.firstElementChild; n; n = n.nextElementSibling) {
        var tag = n.nodeName.toLowerCase();
        if (tag === 'defs' || tag === 'title' || tag === 'desc' || tag === 'style') continue;
        first = n; break;
      }
      if (!first || first.nodeName.toLowerCase() !== 'rect') return '';
      var w = first.getAttribute('width'), h = first.getAttribute('height');
      var full = (w === '100%' || parseFloat(w) >= W * 0.98) && (h === '100%' || parseFloat(h) >= H * 0.98);
      var fill = first.getAttribute('fill') || '';
      return full && fill && fill !== 'none' ? fill : '';
    } catch (e) { return ''; }
  }

  function svgToUrl(text) {
    if (_svgCache[text]) return _svgCache[text];
    if (!/xmlns=/.test(text.slice(0, 400))) text = text.replace(/<svg\b/i, '<svg xmlns="' + SVGNS + '"');
    var url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
    _svgCache[text] = url;
    return url;
  }

  class MaskCover extends HTMLElement {
    static get observedAttributes() { return COVER_ATTRS; }

    connectedCallback() {
      injectCss();
      var host = this.parentElement;
      /* ui-mask 可能比本元件先連上頁面，這時通知它切換成圖片遮罩模式 */
      if (host && host.localName === 'ui-mask' && host._apply) host._apply();
      else console.warn('[mask-cover] 必須直接放在 <ui-mask> 裡第一層。');
    }
    disconnectedCallback() {
      if (this._ro) { this._ro.disconnect(); this._ro = null; }
      var host = this._host;
      this._host = null;
      if (host && host.isConnected && host._apply) host._apply();
    }
    attributeChangedCallback(n, o, v) { if (o !== v && this.isConnected) this._render(); }

    /* 取得 SVG 原始碼或圖片網址；回傳 Promise<{url, svg}> */
    _source() {
      var self = this;
      var inline = this.querySelector(':scope > svg');
      if (inline) return Promise.resolve({ svg: inline.outerHTML });
      var tid = (this.getAttribute('template') || '').replace(/^#/, '').trim();
      if (tid) {
        var t = document.getElementById(tid);
        var svg = t && t.content ? t.content.querySelector('svg') : (t ? t.querySelector('svg') : null);
        if (svg) return Promise.resolve({ svg: svg.outerHTML });
        console.warn('[mask-cover] 找不到 template="' + tid + '"，或裡面沒有 <svg>。');
      }
      var src = (this.getAttribute('src') || '').trim();
      if (!src) return Promise.resolve({});
      /* .svg 網址先嘗試讀原始碼，才能自動偵測底色；讀不到就直接當圖片網址用。
         直接開啟本機檔案（file:）時瀏覽器不允許讀取，略過以免主控台出現錯誤。同一網址只讀一次 */
      var abs;
      try { abs = new URL(src, document.baseURI); } catch (e) { abs = null; }
      if (abs && /\.svg$/i.test(abs.pathname) && window.fetch && abs.protocol !== 'file:' && location.protocol !== 'file:') {
        var key = abs.href;
        if (!_fetchCache[key]) {
          _fetchCache[key] = fetch(key).then(function (r) { if (!r.ok) throw 0; return r.text(); })
            .then(function (txt) { return /<svg\b/i.test(txt) ? { svg: txt } : { url: src }; })
            .catch(function () { return { url: src }; });
        }
        return _fetchCache[key];
      }
      return Promise.resolve({ url: src });
    }

    _render() {
      var host = this.parentElement;
      if (!host || host.localName !== 'ui-mask') return;
      this._host = host;
      var self = this, a = this.getAttribute.bind(this);
      var fx = (a('effect') || 'fade').trim().toLowerCase();
      if (COVER_FX.indexOf(fx) === -1) { console.warn('[mask-cover] effect="' + fx + '" 請用 ' + COVER_FX.join('、') + '，已改用 fade。'); fx = 'fade'; }
      var pos = (a('position') || 'center').trim().toLowerCase();
      if (['top', 'center', 'bottom'].indexOf(pos) === -1) pos = 'center';
      host.setAttribute('data-um-cover-fx', fx);
      host.setAttribute('data-um-cover-pos', pos);
      var dur = parseInt(a('duration'), 10);
      host.style.setProperty('--um-cd', (isFinite(dur) && dur >= 0 ? dur : 450) + 'ms');
      host.style.setProperty('--um-cover-w', cssLen(a('width'), '100%'));
      host.style.setProperty('--um-cover-pad', px(a('padding'), '16px'));

      /* 內部結構：每次重建，被複製進來的舊結構一併清掉 */
      Array.prototype.forEach.call(this.querySelectorAll(':scope > .um-cover-in'), function (n) { n.remove(); });
      var box = document.createElement('div'); box.className = 'um-cover-in';
      var img = document.createElement('img'); img.className = 'um-cover-img'; img.alt = a('alt') || '';
      img.draggable = false;
      var band = document.createElement('div'); band.className = 'um-cover-band';
      band.textContent = host.getAttribute('label') || '';
      box.appendChild(img); box.appendChild(band);
      this.appendChild(box);

      /* 遮罩期間，區塊至少撐到圖片的高度 */
      if (this._ro) this._ro.disconnect();
      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(function () { host.style.setProperty('--um-cover-h', box.offsetHeight + 'px'); });
        this._ro.observe(box);
      }
      img.addEventListener('load', function () { host.style.setProperty('--um-cover-h', box.offsetHeight + 'px'); });
      img.addEventListener('error', function () { console.warn('[mask-cover] 圖片載入失敗：' + (a('src') || '（內嵌 SVG）')); });

      var token = (this._token || 0) + 1;
      this._token = token;
      var bgAttr = (a('bg') || 'auto').trim();
      var fallback = color(host.getAttribute('color'), PALETTE.shell);
      host.style.setProperty('--um-cover-bg', bgAttr.toLowerCase() === 'auto' ? fallback : color(bgAttr, fallback));
      this._source().then(function (res) {
        if (token !== self._token) return;
        if (res.svg) {
          img.src = svgToUrl(res.svg);
          if (bgAttr.toLowerCase() === 'auto') {
            var b = svgBackground(res.svg);
            if (b) host.style.setProperty('--um-cover-bg', color(b, b));
          }
        } else if (res.url) {
          img.src = res.url;
        } else {
          console.warn('[mask-cover] 沒有圖片來源：請設定 src、template，或直接放一個 <svg>。');
        }
      });
    }
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
  customElements.define('mask-cover', MaskCover);
})();
