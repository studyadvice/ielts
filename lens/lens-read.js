/*!
 * <lens-read> 點擊放大鏡 v0.2.0（11-12-26，粗製版）
 * v0.2.0：標註不再限定中文與說明，改為 above（字上方）、below（字下方）、extra-info（鏡片下方的說明框），
 *         三者都支援 HTML，也可用 above-template、below-template、extra-template 讀取 <template id>。
 *         舊的 zh、note、zh-color、note-color 仍可使用。
 * v0.3.0：新增 pin。開鏡後放大鏡固定在原位，點別處、拖曳、點鏡面、Esc 都不會移動或關閉，只有 × 能關閉。
 * 主文保持乾淨；點一下，放大鏡出現在點擊處，鏡內放大並顯示文法標註與中文。
 * 為觸控筆與螢幕錄影設計：點擊開鏡，拖曳鏡面移動，點一下鏡面（不拖曳）或按 Esc 關閉。
 * 不使用 shadow DOM，CSS 由本檔自動注入。
 *
 *  <lens-read radius="100" zoom="1.4">
 *    <p>The number of visitors <lens-word above="大幅增加" below="<b>V-ed</b> ＋ adv." extra-template="t1">rose sharply</lens-word> in 2010.</p>
 *  </lens-read>
 */
(function () {
  'use strict';
  if (customElements.get('lens-read')) return;

  var PALETTE = {
    background: '#0C0D0C', base: '#0C0D0C', 'bg-alternative': '#3B2A20',
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7',
    red: '#EF6661', green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1',
    violet: '#B484E8', gray: '#86877F', key: '#51DBCF', calm: '#A3C4BC',
    quiet: '#8EA4DE', playful: '#FFA987', urgent: '#FF2E63',
    energetic: '#B6FF00', dreamy: '#DE8EC9'
  };
  function color(v, d) { v = (v || '').trim(); return v ? (PALETTE[v.toLowerCase()] || v) : d; }
  function num(v, d) { var n = parseFloat(v); return isFinite(n) ? n : d; }
  function border(v, d) {
    v = (v || '').trim();
    if (!v) return d;
    if (v === 'none' || v === '0') return 'none';
    return v.split(/\s+/).map(function (t) {
      if (/^-?\d+(\.\d+)?$/.test(t)) return t + 'px';
      return PALETTE[t.toLowerCase()] || t;
    }).join(' ');
  }

  var CSS = [
    'lens-read{display:block;position:relative;font-size:1.25rem;color:var(--lr-text);line-height:var(--lr-lh);}',
    'lens-read .lr-box{position:relative;}',
    'lens-read.lr-open .lr-box{touch-action:none;}',
    'lens-read .lr-base{position:relative;}',
    'lens-read .lr-base > :last-child,lens-read .lr-layer > :last-child{margin-bottom:0;}',
    'lens-read .lr-base > :first-child,lens-read .lr-layer > :first-child{margin-top:0;}',
    'lens-read[trigger="click"] .lr-box,lens-read:not([trigger]) .lr-box{cursor:zoom-in;}',
    'lens-read.lr-open .lr-box{cursor:crosshair;}',

    /* 標註字：主文中只留提示記號 */
    'lens-read lens-word{position:relative;display:inline;}',
    'lens-read .lr-base lens-word{text-decoration:var(--lr-cue);text-decoration-color:var(--lr-cue-color);text-underline-offset:6px;text-decoration-thickness:2px;}',
    'lens-read .lr-ann{position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:0.6em;line-height:1.2;font-weight:700;pointer-events:none;}',
    'lens-read .lr-below{top:calc(100% + 1px);color:var(--lr-below);}',
    'lens-read .lr-above{bottom:calc(100% + 1px);color:var(--lr-above);}',
    'lens-read .lr-ann b,lens-read .lr-ann strong{font-weight:900;}',
    'lens-read .lr-base .lr-ann{visibility:hidden;}',
    'lens-read:not(.lr-show-above) .lr-above,lens-read:not(.lr-show-below) .lr-below{display:none;}',

    /* extra-info：鏡片下方（或上方）的說明框，不放大 */
    'lens-read .lr-extra{position:absolute;left:0;top:0;z-index:2;box-sizing:border-box;width:max-content;max-width:var(--lr-extra-w);' +
      'padding:10px 14px;border:var(--lr-extra-border);border-radius:8px;background:var(--lr-extra-bg);color:var(--lr-extra-text);' +
      'font-size:0.95rem;line-height:1.6;pointer-events:none;}',
    'lens-read .lr-extra > :first-child{margin-top:0;}',
    'lens-read .lr-extra > :last-child{margin-bottom:0;}',
    'lens-read .lr-extra ul,lens-read .lr-extra ol{padding-left:20px;}',

    /* 鏡內圖層：同一份內容，放大並顯示標註 */
    'lens-read .lr-layer{position:absolute;left:calc(var(--lr-pad) * -1);top:calc(var(--lr-pad) * -1);width:calc(100% + var(--lr-pad) * 2);height:calc(100% + var(--lr-pad) * 2);padding:var(--lr-pad);box-sizing:border-box;background:var(--lr-bg);color:var(--lr-lens-text);' +
      'pointer-events:none;-webkit-user-select:none;user-select:none;visibility:hidden;will-change:clip-path,transform;}',
    'lens-read .lr-layer lens-word{color:var(--lr-word);font-weight:700;}',

    /* 鏡框與關閉鈕 */
    'lens-read .lr-ring{position:absolute;left:0;top:0;box-sizing:border-box;border:var(--lr-border);border-radius:50%;pointer-events:auto;cursor:grab;visibility:hidden;}',
    'lens-read .lr-close{position:absolute;width:32px;height:32px;border-radius:50%;border:2px solid var(--lr-ring-color);background:var(--lr-page);' +
      'color:var(--lr-ring-color);font-size:1.1rem;line-height:1;padding:0;cursor:pointer;pointer-events:auto;display:flex;align-items:center;justify-content:center;}',
    'lens-read .lr-close:focus-visible{outline:2px solid var(--lr-ring-color);outline-offset:2px;}',
    'lens-read[close-button="off"] .lr-close{display:none;}',
    /* pin：固定位置，關閉鈕一律顯示（否則無法關閉） */
    'lens-read.lr-pinned.lr-open .lr-box,lens-read.lr-pinned .lr-ring{cursor:default;}',
    'lens-read.lr-pinned[close-button="off"] .lr-close{display:flex;}'
  ].join('\n');

  function injectCss() {
    if (document.getElementById('lens-read-style')) return;
    var s = document.createElement('style');
    s.id = 'lens-read-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  customElements.define('lens-word', class extends HTMLElement {});

  /* 讀取標註內容（HTML 字串）：<name>-template 優先，其次是屬性 name，再來是舊屬性 alias；空白回傳空字串 */
  function readHtml(w, name, alias, tplAttr) {
    var id = (w.getAttribute(tplAttr || name + '-template') || '').replace(/^#/, '').trim();
    if (id) {
      var t = document.getElementById(id);
      if (t && t.tagName === 'TEMPLATE') return t.innerHTML.trim();
      console.warn('[lens-read] 找不到 <template id="' + id + '">，改用屬性內容。');
    }
    var v = w.getAttribute(name);
    if ((v == null || !v.trim()) && alias) v = w.getAttribute(alias);
    return (v || '').trim();
  }

  var ATTRS = ['radius', 'zoom', 'lens-bg', 'lens-text', 'lens-border', 'word-color', 'note-color', 'zh-color',
               'above-color', 'below-color', 'extra-text', 'extra-bg', 'extra-border', 'extra-width', 'extra-position',
               'text-color', 'page-bg', 'line-gap', 'cue', 'cue-color', 'trigger', 'show', 'close-on-tap', 'close-button', 'pin'];

  class LensRead extends HTMLElement {
    static get observedAttributes() { return ATTRS; }

    constructor() {
      super();
      this._pos = { x: 0, y: 0 };
      this._r = 0;
      this._isOpen = false;
      this._raf = 0;
      this._drag = null;
      this._onKey = this._onKey.bind(this);
    }

    connectedCallback() {
      injectCss();
      if (!this._built) this._build();
      this._apply();
      document.addEventListener('keydown', this._onKey);
    }
    disconnectedCallback() { document.removeEventListener('keydown', this._onKey); cancelAnimationFrame(this._raf); }
    attributeChangedCallback() { if (this._built) { this._apply(); this._render(); } }

    _build() {
      this._built = true;
      var self = this;
      /* 在每個 lens-word 裡加上標註 */
      Array.prototype.forEach.call(this.querySelectorAll('lens-word'), function (w) {
        if (w.querySelector(':scope > .lr-ann')) return;
        var above = readHtml(w, 'above', 'zh'), below = readHtml(w, 'below', 'note');
        w._lrExtra = readHtml(w, 'extra-info', null, 'extra-template');
        if (above) { var a = document.createElement('span'); a.className = 'lr-ann lr-above'; a.innerHTML = above; w.appendChild(a); }
        if (below) { var b = document.createElement('span'); b.className = 'lr-ann lr-below'; b.innerHTML = below; w.appendChild(b); }
      });
      var box = document.createElement('div'); box.className = 'lr-box';
      var base = document.createElement('div'); base.className = 'lr-base';
      while (this.firstChild) base.appendChild(this.firstChild);
      var layer = base.cloneNode(true);
      layer.className = 'lr-layer';
      layer.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(layer.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
      var ring = document.createElement('div'); ring.className = 'lr-ring';
      var close = document.createElement('button');
      close.type = 'button'; close.className = 'lr-close'; close.setAttribute('aria-label', '關閉放大鏡'); close.textContent = '×';
      ring.appendChild(close);
      var extra = document.createElement('div'); extra.className = 'lr-extra'; extra.hidden = true;
      box.appendChild(base); box.appendChild(layer); box.appendChild(ring); box.appendChild(extra);
      this.appendChild(box);
      this._box = box; this._layer = layer; this._ring = ring; this._closeBtn = close; this._extra = extra;
      this._words = Array.prototype.slice.call(base.querySelectorAll('lens-word'));

      close.addEventListener('click', function (e) { e.stopPropagation(); self.close(); });
      close.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      box.addEventListener('pointerdown', this._down.bind(this));
      box.addEventListener('pointermove', this._move.bind(this));
      box.addEventListener('pointerup', this._up.bind(this));
      box.addEventListener('pointercancel', this._up.bind(this));
      box.addEventListener('pointerleave', function (e) {
        if (!self.pinned && self._trigger() === 'hover' && e.pointerType === 'mouse') self.close();
      });
    }

    _trigger() { var t = (this.getAttribute('trigger') || 'click').trim().toLowerCase(); return t === 'hover' ? 'hover' : 'click'; }
    get radius() { return Math.max(30, num(this.getAttribute('radius'), 100)); }
    /* pin 或 pin="on" 為固定；pin="off" 或未設定為可移動 */
    get pinned() { var v = this.getAttribute('pin'); return v != null && v.trim().toLowerCase() !== 'off' && v.trim().toLowerCase() !== 'false'; }
    get zoom() { return Math.min(4, Math.max(1, num(this.getAttribute('zoom'), 1.4))); }

    _apply() {
      var s = this.style, a = this.getAttribute.bind(this);
      var ringColor = color(a('word-color'), '#E3D322');
      s.setProperty('--lr-text', color(a('text-color'), '#C6C7BD'));
      s.setProperty('--lr-page', color(a('page-bg'), '#0C0D0C'));
      s.setProperty('--lr-bg', color(a('lens-bg'), '#3B2A20'));
      s.setProperty('--lr-lens-text', color(a('lens-text'), '#DBEDD8'));
      s.setProperty('--lr-word', ringColor);
      s.setProperty('--lr-below', color(a('below-color') || a('note-color'), '#51DBCF'));
      s.setProperty('--lr-above', color(a('above-color') || a('zh-color'), '#FF91D7'));
      s.setProperty('--lr-extra-text', color(a('extra-text'), '#DBEDD8'));
      s.setProperty('--lr-extra-bg', color(a('extra-bg'), '#0C0D0C'));
      s.setProperty('--lr-extra-w', Math.max(160, num(a('extra-width'), 320)) + 'px');
      /* show：above below extra 任意組合，空白分隔；舊值 zh、note、both 仍可用 */
      var show = (a('show') || 'all').trim().toLowerCase().split(/[\s,]+/), self = this;
      var on = { above: false, below: false, extra: false };
      show.forEach(function (t) {
        if (t === 'all' || t === 'both') { on.above = on.below = on.extra = true; }
        else if (t === 'zh' || t === 'above') on.above = true;
        else if (t === 'note' || t === 'below') on.below = true;
        else if (t === 'extra' || t === 'extra-info') on.extra = true;
      });
      ['above', 'below', 'extra'].forEach(function (k) { self.classList.toggle('lr-show-' + k, on[k]); });
      this.classList.toggle('lr-pinned', this.pinned);
      this._showExtra = on.extra;
      s.setProperty('--lr-border', border(a('lens-border'), '3px solid #51DBCF'));
      var bm = (s.getPropertyValue('--lr-border') || '').match(/#[0-9a-f]{3,8}|[a-z]+\([^)]*\)/i);
      s.setProperty('--lr-ring-color', bm ? bm[0] : ringColor);
      s.setProperty('--lr-extra-border', border(a('extra-border'), '2px solid ' + (bm ? bm[0] : ringColor)));
      s.setProperty('--lr-lh', String(num(a('line-gap'), 2.6)));
      s.setProperty('--lr-pad', this.radius + 'px');
      var cue = (a('cue') || 'dotted').trim().toLowerCase();
      s.setProperty('--lr-cue', cue === 'none' ? 'none' : 'underline ' + (cue === 'solid' || cue === 'dashed' || cue === 'wavy' ? cue : 'dotted'));
      s.setProperty('--lr-cue-color', color(a('cue-color'), '#86877F'));
    }

    /* ---- 指標事件：點擊開鏡、拖曳移動、點鏡面關閉 ---- */
    _local(e) {
      var r = this._box.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    _inside(p) { var dx = p.x - this._pos.x, dy = p.y - this._pos.y; return Math.sqrt(dx * dx + dy * dy) <= this.radius; }

    _down(e) {
      if (e.button !== 0) return;
      if (this.pinned) {
        /* 固定模式：已開鏡時一律不動，只有 × 能關閉；未開鏡時點擊開鏡 */
        if (!this._isOpen) { var q0 = this._local(e); this.open(q0.x, q0.y); }
        e.preventDefault();
        return;
      }
      if (this._trigger() === 'hover' && e.pointerType === 'mouse') return;
      var p = this._local(e);
      if (this._isOpen && this._inside(p)) {
        this._drag = { id: e.pointerId, sx: p.x, sy: p.y, dx: p.x - this._pos.x, dy: p.y - this._pos.y, moved: false };
        try { this._box.setPointerCapture(e.pointerId); } catch (err) {}
      } else {
        this.open(p.x, p.y);
      }
      e.preventDefault();
    }
    _move(e) {
      if (this.pinned) return;
      if (this._trigger() === 'hover' && e.pointerType === 'mouse' && !this._drag) {
        var q = this._local(e);
        if (!this._isOpen) this.open(q.x, q.y, true); else this._setPos(q.x, q.y);
        return;
      }
      var d = this._drag;
      if (!d || d.id !== e.pointerId) return;
      var p = this._local(e);
      if (!d.moved && Math.abs(p.x - d.sx) + Math.abs(p.y - d.sy) > 5) d.moved = true;
      if (d.moved) { cancelAnimationFrame(this._raf); this._setPos(p.x - d.dx, p.y - d.dy); }
    }
    _up(e) {
      var d = this._drag;
      if (!d || d.id !== e.pointerId) return;
      this._drag = null;
      if (d.moved) this._emit('lens-read:move');
      else if ((this.getAttribute('close-on-tap') || 'on').trim().toLowerCase() !== 'off') this.close();
    }
    _onKey(e) { if (e.key === 'Escape' && this._isOpen && !this.pinned) this.close(); }

    _clamp(x, y) {
      var w = this._box.clientWidth, h = this._box.clientHeight;
      return { x: Math.max(0, Math.min(w, x)), y: Math.max(0, Math.min(h, y)) };
    }
    _setPos(x, y) { this._pos = this._clamp(x, y); this._render(); }

    /* ---- 公開方法 ---- */
    open(x, y, instant) {
      var self = this, to = this._clamp(x, y), R = this.radius;
      var from = { x: this._pos.x, y: this._pos.y }, r0 = this._r;
      var moving = this._isOpen;
      if (!moving) { from = to; r0 = 0; }
      this._isOpen = true;
      this.classList.add('lr-open');
      cancelAnimationFrame(this._raf);
      if (instant) { this._pos = to; this._r = R; this._render(); this._emit('lens-read:open'); return; }
      var t0 = performance.now(), dur = moving ? 260 : 200;
      function tick(now) {
        var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        self._pos = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e };
        self._r = r0 + (R - r0) * e;
        self._render();
        if (k < 1) self._raf = requestAnimationFrame(tick);
      }
      this._raf = requestAnimationFrame(tick);
      this._emit(moving ? 'lens-read:move' : 'lens-read:open');
    }

    close() {
      if (!this._isOpen) return;
      var self = this, r0 = this._r, t0 = performance.now();
      this._isOpen = false;
      this._drag = null;
      this.classList.remove('lr-open');
      cancelAnimationFrame(this._raf);
      function tick(now) {
        var k = Math.min(1, (now - t0) / 160);
        self._r = r0 * (1 - k);
        self._render();
        if (k < 1) self._raf = requestAnimationFrame(tick);
      }
      this._raf = requestAnimationFrame(tick);
      this._emit('lens-read:close');
    }

    _render() {
      if (!this._layer) return;
      var x = this._pos.x, y = this._pos.y, r = this._r, z = this.zoom, P = this.radius;
      var vis = r > 0.5 ? 'visible' : 'hidden';
      this._layer.style.visibility = vis;
      /* 圖層向外延伸 P（= radius），座標要加回 P */
      this._layer.style.clipPath = 'circle(' + (r / z).toFixed(2) + 'px at ' + (x + P).toFixed(1) + 'px ' + (y + P).toFixed(1) + 'px)';
      this._layer.style.transformOrigin = (x + P).toFixed(1) + 'px ' + (y + P).toFixed(1) + 'px';
      this._layer.style.transform = 'scale(' + z + ')';
      var ring = this._ring;
      ring.style.visibility = vis;
      ring.style.width = ring.style.height = (2 * r).toFixed(1) + 'px';
      ring.style.transform = 'translate(' + (x - r).toFixed(1) + 'px,' + (y - r).toFixed(1) + 'px)';
      /* 關閉鈕放在鏡框右上 45 度 */
      var c = r * 0.7071;
      this._closeBtn.style.left = (r + c - 16).toFixed(1) + 'px';
      this._closeBtn.style.top = (r - c - 16).toFixed(1) + 'px';
      this._closeBtn.style.visibility = r > this.radius * 0.6 ? 'visible' : 'hidden';
      this._renderExtra(x, y, r);
    }

    /* 找出鏡心附近的標註字，顯示它的 extra-info */
    _renderExtra(x, y, r) {
      var box = this._extra;
      if (!this._showExtra || !this._isOpen || r < this.radius * 0.6) { box.hidden = true; this._extraWord = null; return; }
      var br = this._box.getBoundingClientRect(), reach = this.radius / this.zoom, best = null, bestD = Infinity;
      this._words.forEach(function (w) {
        if (!w._lrExtra) return;
        Array.prototype.forEach.call(w.getClientRects(), function (rc) {
          var dx = Math.max(rc.left - br.left - x, 0, x - (rc.right - br.left));
          var dy = Math.max(rc.top - br.top - y, 0, y - (rc.bottom - br.top));
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < bestD) { bestD = d; best = w; }
        });
      });
      if (!best || bestD > reach * 0.8) { box.hidden = true; this._extraWord = null; return; }
      if (best !== this._extraWord) { this._extraWord = best; box.innerHTML = best._lrExtra; }
      box.hidden = false;
      var above = (this.getAttribute('extra-position') || 'below').trim().toLowerCase() === 'above';
      var bw = box.offsetWidth, bh = box.offsetHeight, W = this._box.clientWidth;
      var left = Math.max(0, Math.min(W - bw, x - bw / 2));
      var top = above ? y - r - 12 - bh : y + r + 12;
      box.style.transform = 'translate(' + left.toFixed(1) + 'px,' + top.toFixed(1) + 'px)';
    }

    _emit(name) {
      this.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: { x: this._pos.x, y: this._pos.y } }));
    }
  }

  customElements.define('lens-read', LensRead);
  window.LensRead = LensRead;
})();
