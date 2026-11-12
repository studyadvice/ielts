/*!
 * <ui-drag-ans> 拖曳填空元件 v1.1.0（11-12-26）
 * 題目中的空格用 {答案} 標記，元件自動產生對應的小卡。把小卡拖到正確的空格（或點小卡再點空格），
 * 空格就換成格式化的答案，用掉的小卡消失；放錯會彈回原位。比對區分大小寫。
 * 不使用 shadow DOM，CSS 由本檔自動注入，不需要其他函式庫。
 *
 *  <ui-drag-ans theme="key" bank="bottom">
 *    <p>The bus shelter right outside my house is {equipped with} a real-time display.</p>
 *    <p>The bus stop <drop-slot answer="in view of"><b>in view of</b></drop-slot> my house has a modern shelter.</p>
 *    <drag-card>popular with</drag-card>
 *  </ui-drag-ans>
 *
 * 可與 ui-cards 協作：原始題目保存在元件內的 <template class="uda-src">，元件被搬移或被複製到卡片、面板時，
 * 都會從原始題目重新建立成可作答的狀態。
 */
(function () {
  'use strict';
  if (window.customElements && customElements.get('ui-drag-ans')) return;

  var PALETTE = {
    background: '#0C0D0C', base: '#0C0D0C', 'bg-alternative': '#3B2A20',
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7',
    red: '#EF6661', green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1',
    violet: '#B484E8', gray: '#86877F', key: '#51DBCF', calm: '#A3C4BC',
    quiet: '#8EA4DE', playful: '#FFA987', urgent: '#FF2E63',
    energetic: '#B6FF00', dreamy: '#DE8EC9'
  };

  /* 主題：統一配色；每一項都能用同名屬性覆蓋 */
  var THEMES = {
    key: {
      'accent': '#51DBCF', 'frame-border': '2 solid #86877F', 'frame-bg': '#0C0D0C', 'frame-color': '#DBEDD8',
      'slot-border': '2 solid #51DBCF', 'card-border': '2 solid #51DBCF', 'card-bg': '#0C0D0C', 'card-color': '#DBEDD8',
      'bank-border': 'none', 'bank-bg': 'transparent', 'filled-color': '#51DBCF'
    },
    violet: {
      'accent': '#B484E8', 'frame-border': '2 solid #B484E8', 'frame-bg': '#0C0D0C', 'frame-color': '#DBEDD8',
      'slot-border': '2 dashed #B484E8', 'card-border': '2 solid #B484E8', 'card-bg': '#0C0D0C', 'card-color': '#DBEDD8',
      'bank-border': 'none', 'bank-bg': 'transparent', 'filled-color': '#E3D322'
    },
    pink: {
      'accent': '#FF91D7', 'frame-border': '2 solid #3B2A20', 'frame-bg': '#3B2A20', 'frame-color': '#DBEDD8',
      'slot-border': '2 solid #FF91D7', 'card-border': '2 solid #FF91D7', 'card-bg': '#0C0D0C', 'card-color': '#FF91D7',
      'bank-border': 'none', 'bank-bg': 'transparent', 'filled-color': '#FF91D7'
    },
    shell: {
      'accent': '#0C0D0C', 'frame-border': '2 solid #0C0D0C', 'frame-bg': '#C6C7BD', 'frame-color': '#0C0D0C',
      'slot-border': '2 solid #0C0D0C', 'card-border': '2 solid #0C0D0C', 'card-bg': '#DBEDD8', 'card-color': '#0C0D0C',
      'bank-border': 'none', 'bank-bg': 'transparent', 'filled-color': '#3B2A20'
    }
  };

  var DEFAULTS = {
    'frame-radius': '0px', 'frame-padding': '24px 40px', 'card-radius': '0px', 'card-padding': '8px 20px',
    'bank-gap': '10px', 'bank-padding': '0px', 'bank-width': '220px', 'slot-width': 'auto', 'slot-shape': 'line',
    'slot-hover-color': '', 'filled-style': 'bold', 'font-size': '1.25rem', 'card-font-size': '1rem',
    'label-done': '全部完成！', 'label-reset': '重做', 'reset-button': 'done',
    'drop-anim': 'shrink', 'shrink-duration': '450'
  };

  var ATTRS = ['theme', 'bank', 'shuffle'].concat(Object.keys(THEMES.key), Object.keys(DEFAULTS));

  var CSS = [
    'ui-drag-ans{display:block}',
    'ui-drag-ans > template.uda-src{display:none}',
    /* 尚未建立前不顯示原始的 {答案} 文字 */
    'ui-drag-ans:not([data-uda-ready]) > :not(template){visibility:hidden}',
    'ui-drag-ans .uda-wrap{display:grid;gap:0px;grid-template-columns:minmax(0,1fr);align-items:start}',
    'ui-drag-ans[data-bank="left"] .uda-wrap{grid-template-columns:var(--uda-bank-w) minmax(0,1fr);gap:16px}',
    'ui-drag-ans[data-bank="right"] .uda-wrap{grid-template-columns:minmax(0,1fr) var(--uda-bank-w);gap:16px}',
    'ui-drag-ans[data-bank="left"] .uda-bank{order:-1}',

    'ui-drag-ans .uda-frame{border:var(--uda-frame-border);border-radius:var(--uda-frame-radius);background:var(--uda-frame-bg);' +
      'color:var(--uda-frame-color);padding:var(--uda-frame-padding);font-size:var(--uda-fs);line-height:1.8;min-width:0}',
    'ui-drag-ans .uda-frame > :first-child{margin-top:0}',
    'ui-drag-ans .uda-frame > :last-child{margin-bottom:0}',
    'ui-drag-ans .uda-frame p{margin:0 0 12px 0}',

    /* 空格 */
    'ui-drag-ans .uda-slot{display:inline-block;min-width:var(--uda-slot-w,6em);height:1.4em;vertical-align:-0.25em;' +
      'margin:0 4px;box-sizing:border-box;transition:background-color .15s ease,box-shadow .15s ease}',
    'ui-drag-ans[data-slot-shape="line"] .uda-slot:not(.uda-filled),ui-drag-ans[data-slot-shape="line"] .uda-slot.uda-wait{border:0;border-bottom:var(--uda-slot-border)}',
    'ui-drag-ans[data-slot-shape="box"] .uda-slot:not(.uda-filled),ui-drag-ans[data-slot-shape="box"] .uda-slot.uda-wait{border:var(--uda-slot-border);border-radius:4px}',
    'ui-drag-ans .uda-slot.uda-wait{background:var(--uda-hover)}',
    'ui-drag-ans .uda-slot.uda-over{background:var(--uda-hover)}',
    'ui-drag-ans.uda-picking .uda-slot:not(.uda-filled){cursor:pointer}',
    'ui-drag-ans .uda-slot.uda-filled:not(.uda-wait){display:inline;min-width:0;height:auto;margin:0;color:var(--uda-filled-color);' +
      'animation:uda-pop .45s ease}',
    'ui-drag-ans[data-filled-bold] .uda-slot.uda-filled:not(.uda-wait){font-weight:700}',
    'ui-drag-ans[data-filled-underline] .uda-slot.uda-filled:not(.uda-wait){text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:4px}',
    'ui-drag-ans[data-filled-highlight] .uda-slot.uda-filled:not(.uda-wait){background:var(--uda-mark);border-radius:3px;padding:0 3px}',
    'ui-drag-ans[data-filled-italic] .uda-slot.uda-filled:not(.uda-wait){font-style:italic}',
    '@keyframes uda-pop{0%{text-shadow:0 0 0 var(--uda-filled-color)}40%{text-shadow:0 0 10px var(--uda-filled-color)}100%{text-shadow:none}}',

    /* 小卡區與小卡 */
    'ui-drag-ans .uda-bank{display:flex;flex-wrap:wrap;align-items:flex-start;gap:var(--uda-bank-gap);padding:var(--uda-bank-padding);' +
      'border:var(--uda-bank-border);background:var(--uda-bank-bg);min-width:0}',
    'ui-drag-ans[data-bank="bottom"] .uda-bank{margin:0px}',
    'ui-drag-ans[data-bank="left"] .uda-bank,ui-drag-ans[data-bank="right"] .uda-bank{flex-direction:column;align-items:stretch}',
    'ui-drag-ans .uda-card{border:var(--uda-card-border);border-radius:var(--uda-card-radius);background:var(--uda-card-bg);' +
      'color:var(--uda-card-color);padding:var(--uda-card-padding);font-size:var(--uda-card-fs);line-height:1.4;' +
      'cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none;box-sizing:border-box;text-align:center;' +
      'transition:opacity .2s ease,transform .2s ease,outline-color .15s ease}',
    'ui-drag-ans[data-bank="bottom"] .uda-card{min-width:160px}',
    'ui-drag-ans .uda-card:hover{transform:translateY(-2px)}',
    'ui-drag-ans .uda-card.uda-lifted{opacity:.25;transform:none}',
    'ui-drag-ans .uda-card.uda-selected{outline:3px solid var(--uda-accent);outline-offset:3px}',
    'ui-drag-ans .uda-card.uda-gone{opacity:0;transform:scale(.6);pointer-events:none}',
    '.uda-ghost{position:fixed;left:0;top:0;z-index:9999;pointer-events:none;margin:0;cursor:grabbing;' +
      'box-shadow:0 8px 20px #0C0D0C;transform-origin:center}',

    /* 完成與重做 */
    'ui-drag-ans .uda-foot{display:none;align-items:center;gap:12px;margin:12px 0 0 0;grid-column:1 / -1}',
    'ui-drag-ans.uda-show-reset .uda-foot{display:flex}',
    'ui-drag-ans .uda-done{display:none;padding:8px 14px;border-radius:6px;background:var(--uda-accent);color:#0C0D0C;font-weight:700;font-size:1rem}',
    'ui-drag-ans.uda-complete .uda-done{display:block}',
    'ui-drag-ans .uda-reset{background:transparent;color:var(--uda-frame-color);border:1px solid var(--uda-accent);border-radius:6px;' +
      'padding:6px 14px;font-size:0.95rem;cursor:pointer}',
    'ui-drag-ans .uda-reset:hover{background:var(--uda-accent);color:#0C0D0C}',
    'ui-drag-ans .uda-err{padding:10px 14px;border-radius:6px;background:#EF6661;color:#0C0D0C;font-size:1rem}'
  ].join('\n');

  function injectCss() {
    if (document.getElementById('ui-drag-ans-style')) return;
    var s = document.createElement('style');
    s.id = 'ui-drag-ans-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function color(v, d) { v = (v || '').trim(); if (!v) return d; return PALETTE[v.toLowerCase()] || v; }
  function px(v, d) {
    v = (v || '').trim(); if (!v) return d;
    return v.split(/\s+/).map(function (t) { return /^-?\d+(\.\d+)?$/.test(t) ? t + 'px' : t; }).join(' ');
  }
  /* 邊框：「2 solid key」轉成「2px solid #51DBCF」；none 或 0 為無邊框 */
  function border(v, d) {
    v = (v || '').trim(); if (!v) return d;
    if (v === 'none' || v === '0') return 'none';
    return v.split(/\s+/).map(function (t) {
      if (/^-?\d+(\.\d+)?$/.test(t)) return t + 'px';
      return PALETTE[t.toLowerCase()] || t;
    }).join(' ');
  }
  function rem(v, d) { v = (v || '').trim(); if (!v) return d; return /^\d+(\.\d+)?$/.test(v) ? v + 'rem' : v; }
  function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }

  customElements.define('drop-slot', class extends HTMLElement {});
  customElements.define('drag-card', class extends HTMLElement {});

  class UiDragAns extends HTMLElement {
    static get observedAttributes() { return ATTRS; }

    connectedCallback() {
      injectCss();
      /* 第一次：把原始題目存起來；之後被搬移時保留作答狀態，被複製時（新實例）從原始題目重建 */
      var src = this.querySelector(':scope > template.uda-src');
      if (!src) {
        src = document.createElement('template');
        src.className = 'uda-src';
        while (this.firstChild) src.content.appendChild(this.firstChild);
        this.appendChild(src);
      }
      this._src = src;
      if (!this._built || !this.querySelector(':scope > .uda-wrap')) this._build();
    }

    attributeChangedCallback(n, o, v) {
      if (o === v || !this._built) return;
      if (n === 'bank' || n === 'shuffle' || n === 'label-done' || n === 'label-reset') { this._build(); return; }
      this._apply();
    }

    _val(name) {
      var a = this.getAttribute(name);
      if (a != null && a.trim() !== '') return a.trim();
      var th = THEMES[(this.getAttribute('theme') || 'key').trim().toLowerCase()] || THEMES.key;
      if (th[name] != null) return th[name];
      return DEFAULTS[name];
    }

    _apply() {
      var s = this.style, v = this._val.bind(this);
      var th = (this.getAttribute('theme') || '').trim().toLowerCase();
      if (th && !THEMES[th]) console.warn('[ui-drag-ans] theme="' + th + '" 不存在，可用：' + Object.keys(THEMES).join('、') + '。已改用 key。');
      var accent = color(v('accent'), '#51DBCF');
      var frameBg = color(v('frame-bg'), '#0C0D0C');
      s.setProperty('--uda-accent', accent);
      s.setProperty('--uda-frame-border', border(v('frame-border'), 'none'));
      s.setProperty('--uda-frame-radius', px(v('frame-radius'), '0px'));
      s.setProperty('--uda-frame-bg', frameBg);
      s.setProperty('--uda-frame-color', color(v('frame-color'), '#DBEDD8'));
      s.setProperty('--uda-frame-padding', px(v('frame-padding'), '24px'));
      s.setProperty('--uda-slot-border', border(v('slot-border'), '2px solid ' + accent));
      var hover = v('slot-hover-color');
      s.setProperty('--uda-hover', hover ? color(hover, hover) : 'color-mix(in srgb,' + accent + ' 28%,' + frameBg + ')');
      s.setProperty('--uda-mark', 'color-mix(in srgb,' + accent + ' 28%,' + frameBg + ')');
      s.setProperty('--uda-card-border', border(v('card-border'), '2px solid ' + accent));
      s.setProperty('--uda-card-radius', px(v('card-radius'), '0px'));
      s.setProperty('--uda-card-bg', color(v('card-bg'), '#0C0D0C'));
      s.setProperty('--uda-card-color', color(v('card-color'), '#DBEDD8'));
      s.setProperty('--uda-card-padding', px(v('card-padding'), '8px 20px'));
      s.setProperty('--uda-bank-border', border(v('bank-border'), 'none'));
      s.setProperty('--uda-bank-bg', color(v('bank-bg'), 'transparent'));
      s.setProperty('--uda-bank-gap', px(v('bank-gap'), '10px'));
      s.setProperty('--uda-bank-padding', px(v('bank-padding'), '0px'));
      s.setProperty('--uda-bank-w', px(v('bank-width'), '220px'));
      s.setProperty('--uda-filled-color', color(v('filled-color'), accent));
      s.setProperty('--uda-fs', rem(v('font-size'), '1.25rem'));
      s.setProperty('--uda-card-fs', rem(v('card-font-size'), '1rem'));
      var shape = v('slot-shape').toLowerCase() === 'box' ? 'box' : 'line';
      this.setAttribute('data-slot-shape', shape);
      var fs = v('filled-style').toLowerCase().split(/[\s,]+/);
      var self = this;
      ['bold', 'underline', 'highlight', 'italic'].forEach(function (k) {
        if (fs.indexOf(k) > -1) self.setAttribute('data-filled-' + k, ''); else self.removeAttribute('data-filled-' + k);
      });
      var rb = v('reset-button').toLowerCase();
      this.classList.toggle('uda-show-reset', rb === 'always' || (rb === 'done' && this.classList.contains('uda-complete')));
      this._sizeSlots();
    }

    /* 從原始題目建立：題目框（空格取代 {答案}）、小卡區、完成列 */
    _build() {
      this._built = true;
      this._wrong = 0;
      Array.prototype.slice.call(this.childNodes).forEach(function (n) {
        if (!(n.nodeType === 1 && n.matches('template.uda-src'))) n.remove();
      }, this);
      this.classList.remove('uda-complete', 'uda-picking');

      var bank = (this.getAttribute('bank') || 'bottom').trim().toLowerCase();
      if (['bottom', 'left', 'right'].indexOf(bank) === -1) bank = 'bottom';
      this.setAttribute('data-bank', bank);

      var wrap = document.createElement('div'); wrap.className = 'uda-wrap';
      var frame = document.createElement('div'); frame.className = 'uda-frame';
      var bankEl = document.createElement('div'); bankEl.className = 'uda-bank';
      var foot = document.createElement('div'); foot.className = 'uda-foot';
      frame.appendChild(this._src.content.cloneNode(true));

      /* 干擾卡 */
      var cards = [];
      Array.prototype.slice.call(frame.querySelectorAll('drag-card')).forEach(function (dc) {
        cards.push({ value: norm(dc.getAttribute('value') || dc.textContent), html: dc.innerHTML.trim() });
        dc.remove();
      });

      /* 空格：<drop-slot answer> 與 {答案} */
      var slots = [];
      var self = this;
      Array.prototype.slice.call(frame.querySelectorAll('drop-slot')).forEach(function (ds) {
        var ans = norm(ds.getAttribute('answer') || ds.textContent);
        var html = ds.innerHTML.trim() || esc(ans);
        slots.push(self._makeSlot(ds, ans, html));
      });
      this._parseBraces(frame, slots);

      if (!slots.length) {
        var err = document.createElement('div'); err.className = 'uda-err';
        err.textContent = '找不到空格：請用 {答案} 或 <drop-slot answer="答案"> 標記空格。';
        frame.insertBefore(err, frame.firstChild);
      }

      slots.forEach(function (sl) { cards.push({ value: sl.dataset.answer, html: esc(sl.dataset.answer) }); });
      var shuf = (this.getAttribute('shuffle') || '').trim().toLowerCase();
      if (shuf !== 'false' && shuf !== 'off') shuffle(cards);
      cards.forEach(function (c) {
        var el = document.createElement('div');
        el.className = 'uda-card';
        el.innerHTML = c.html;
        el.dataset.value = c.value;
        bankEl.appendChild(el);
      });

      var done = document.createElement('div'); done.className = 'uda-done';
      done.textContent = this._val('label-done');
      var reset = document.createElement('button'); reset.type = 'button'; reset.className = 'uda-reset';
      reset.textContent = this._val('label-reset');
      reset.addEventListener('click', function () { self.reset(); });
      foot.appendChild(done); foot.appendChild(reset);

      wrap.appendChild(frame); wrap.appendChild(bankEl); wrap.appendChild(foot);
      this.appendChild(wrap);
      this._frame = frame; this._bank = bankEl;
      this._total = slots.length;
      this._bind();
      this._apply();
      this.setAttribute('data-uda-ready', '');
      var me = this;
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { me._sizeSlots(); });
    }

    _makeSlot(replace, ans, html) {
      var sl = document.createElement('span');
      sl.className = 'uda-slot';
      sl.dataset.answer = ans;
      sl._filledHtml = html;
      if (replace) replace.replaceWith(sl);
      return sl;
    }

    /* 把文字裡的 {答案} 換成空格；\{ \} 為一般大括號；略過 code、pre、script、style */
    _parseBraces(root, slots) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          if (n.parentElement && n.parentElement.closest('code,pre,script,style,textarea')) return NodeFilter.FILTER_REJECT;
          return /\{/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      });
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      var self = this;
      nodes.forEach(function (tn) {
        var text = tn.nodeValue, frag = document.createDocumentFragment(), buf = '', i = 0, changed = false;
        while (i < text.length) {
          var ch = text[i];
          if (ch === '\\' && (text[i + 1] === '{' || text[i + 1] === '}')) { buf += text[i + 1]; i += 2; continue; }
          if (ch === '{') {
            var j = text.indexOf('}', i + 1);
            if (j > i + 1) {
              var ans = norm(text.slice(i + 1, j));
              if (ans) {
                if (buf) { frag.appendChild(document.createTextNode(buf)); buf = ''; }
                var sl = self._makeSlot(null, ans, esc(ans));
                frag.appendChild(sl); slots.push(sl); changed = true;
                i = j + 1; continue;
              }
            }
          }
          buf += ch; i++;
        }
        if (!changed) { if (buf !== text) tn.nodeValue = buf; return; }
        if (buf) frag.appendChild(document.createTextNode(buf));
        tn.replaceWith(frag);
      });
    }

    /* 空格寬度：所有答案中最長的一個加上留白，避免用長度猜答案 */
    _sizeSlots() {
      if (!this._frame) return;
      var w = (this._val('slot-width') || 'auto').trim();
      if (w !== 'auto') { this.style.setProperty('--uda-slot-w', px(w, '6em')); return; }
      var cs = getComputedStyle(this._frame);
      var ctx = UiDragAns._ctx || (UiDragAns._ctx = document.createElement('canvas').getContext('2d'));
      ctx.font = '700 ' + cs.fontSize + ' ' + cs.fontFamily;
      var max = 0;
      Array.prototype.forEach.call(this._frame.querySelectorAll('.uda-slot'), function (sl) {
        max = Math.max(max, ctx.measureText(sl.dataset.answer).width);
      });
      this.style.setProperty('--uda-slot-w', Math.ceil(max + 24) + 'px');
    }

    /* ---- 互動：拖曳（pointer）與點選 ---- */
    _bind() {
      var self = this;
      /* 作答時的點擊不往上傳，避免觸發外層（例如 ui-cards 卡片）的點擊功能 */
      if (!this._clickGuard) {
        this._clickGuard = true;
        this.addEventListener('click', function (e) {
          if (e.target.closest && e.target.closest('.uda-card,.uda-slot,.uda-reset')) e.stopPropagation();
        });
      }
      this._bank.addEventListener('pointerdown', function (e) { self._down(e); });
      this._frame.addEventListener('click', function (e) {
        var sl = e.target.closest('.uda-slot:not(.uda-filled)');
        if (!sl || !self._selected) return;
        self._attempt(self._selected, sl, null);
      });
    }

    _down(e) {
      var card = e.target.closest('.uda-card');
      if (!card || card.classList.contains('uda-gone') || e.button !== 0) return;
      e.preventDefault();
      var self = this, sx = e.clientX, sy = e.clientY, ghost = null, over = null, offX = 0, offY = 0, raf = 0;
      var r0 = card.getBoundingClientRect();
      try { card.setPointerCapture(e.pointerId); } catch (err) {}

      function move(ev) {
        if (!ghost) {
          if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 5) return;
          ghost = self._makeGhost(card, r0);
          offX = sx - r0.left; offY = sy - r0.top;
          card.classList.add('uda-lifted');
          self._select(null);
        }
        ghost.style.transform = 'translate(' + (ev.clientX - offX) + 'px,' + (ev.clientY - offY) + 'px) rotate(-2deg)';
        var hit = document.elementFromPoint(ev.clientX, ev.clientY);
        var sl = hit && hit.closest ? hit.closest('.uda-slot:not(.uda-filled)') : null;
        if (sl && !self.contains(sl)) sl = null;
        if (sl !== over) {
          if (over) over.classList.remove('uda-over');
          if (sl) sl.classList.add('uda-over');
          over = sl;
        }
        /* 靠近視窗上下緣時自動捲動 */
        cancelAnimationFrame(raf);
        var edge = 60, dy = ev.clientY < edge ? -12 : (ev.clientY > innerHeight - edge ? 12 : 0);
        if (dy) raf = requestAnimationFrame(function step() { window.scrollBy(0, dy); raf = requestAnimationFrame(step); });
      }
      function up() {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerup', up);
        card.removeEventListener('pointercancel', up);
        cancelAnimationFrame(raf);
        if (over) over.classList.remove('uda-over');
        if (!ghost) {                       /* 沒有拖動：當成點選 */
          self._select(self._selected === card ? null : card);
          return;
        }
        if (over) self._attempt(card, over, ghost);
        else self._flyBack(card, ghost);
      }
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerup', up);
      card.addEventListener('pointercancel', up);
    }

    _select(card) {
      if (this._selected) this._selected.classList.remove('uda-selected');
      this._selected = card;
      if (card) card.classList.add('uda-selected');
      this.classList.toggle('uda-picking', !!card);
    }

    _attempt(card, slot, ghost) {
      var value = card.dataset.value, ans = slot.dataset.answer;
      this._select(null);
      if (value === ans) {
        var wait = this._fill(slot, card, ghost), self = this, frame = this._frame;
        this._emit('drag-ans:correct', { answer: ans, slot: slot });
        if (!frame.querySelector('.uda-slot:not(.uda-filled)')) {
          setTimeout(function () { if (self._frame === frame) self._complete(); }, wait);
        }
      } else {
        this._wrong++;
        slot.animate([
          { transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' },
          { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }
        ], { duration: 320 });
        if (ghost) this._flyBack(card, ghost);
        else card.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 260 });
        this._emit('drag-ans:wrong', { answer: value, expected: ans, slot: slot });
      }
    }

    _flyBack(card, ghost) {
      var r = card.getBoundingClientRect();
      var a = ghost.animate([
        { transform: ghost.style.transform },
        { transform: 'translate(' + r.left + 'px,' + r.top + 'px) rotate(0deg)' }
      ], { duration: 260, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
      a.onfinish = function () { ghost.remove(); card.classList.remove('uda-lifted'); };
    }

    _makeGhost(card, r0) {
      var self = this, ghost = card.cloneNode(true);
      ghost.classList.remove('uda-selected', 'uda-lifted', 'uda-gone');
      ghost.classList.add('uda-ghost');
      ghost.style.width = r0.width + 'px';
      ['--uda-card-border', '--uda-card-radius', '--uda-card-bg', '--uda-card-color', '--uda-card-padding', '--uda-card-fs', '--uda-accent'].forEach(function (p) {
        ghost.style.setProperty(p, self.style.getPropertyValue(p));
      });
      ghost.style.font = getComputedStyle(card).font;
      ghost.style.transform = 'translate(' + r0.left + 'px,' + r0.top + 'px)';
      document.body.appendChild(ghost);
      return ghost;
    }

    /* 放對：小卡逐漸縮小，收進空格中央，接著空格顯示答案 */
    _fill(slot, card, ghost, instant) {
      var self = this;
      var dur = parseInt(this._val('shrink-duration'), 10);
      if (!(dur >= 0)) dur = 450;
      var anim = String(this._val('drop-anim')).toLowerCase() === 'none' || instant ? 'none' : 'shrink';
      slot.classList.add('uda-filled');          /* 先鎖住空格，避免縮小途中再被放入 */
      slot.classList.add('uda-wait');
      function reveal() {
        slot.innerHTML = slot._filledHtml || esc(slot.dataset.answer);
        slot.classList.remove('uda-wait');
      }
      if (anim === 'shrink' && dur > 0) {
        if (!ghost) ghost = this._makeGhost(card, card.getBoundingClientRect());
        var r = slot.getBoundingClientRect();
        var w = ghost.offsetWidth, h = ghost.offsetHeight;
        var to = 'translate(' + (r.left + r.width / 2 - w / 2) + 'px,' + (r.top + r.height / 2 - h / 2) + 'px)';
        var a = ghost.animate([
          { transform: ghost.style.transform, opacity: 1 },
          { transform: to + ' scale(.75)', opacity: 1, offset: 0.35 },
          { transform: to + ' scale(.4)', opacity: 1, offset: 0.75 },
          { transform: to + ' scale(.05)', opacity: 0 }
        ], { duration: dur, easing: 'ease-in', fill: 'forwards' });
        a.onfinish = function () { ghost.remove(); reveal(); };
      } else {
        if (ghost) ghost.remove();
        reveal();
        dur = 0;
      }
      card.classList.remove('uda-lifted');
      card.classList.add('uda-gone');
      setTimeout(function () { card.remove(); }, 220);
      return dur;
    }

    _complete() {
      this.classList.add('uda-complete');
      Array.prototype.forEach.call(this._bank.querySelectorAll('.uda-card'), function (c) {
        c.classList.add('uda-gone');
        setTimeout(function () { c.remove(); }, 220);
      });
      this._apply();
      this._emit('drag-ans:complete', { wrong: this._wrong, total: this._total });
    }

    _emit(name, detail) { this.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail })); }

    /* ---- 公開方法 ---- */
    reset() { this._select(null); this._build(); this._emit('drag-ans:reset', {}); }

    revealAll() {
      var self = this;
      Array.prototype.forEach.call(this._frame.querySelectorAll('.uda-slot:not(.uda-filled)'), function (sl) {
        var card = Array.prototype.find.call(self._bank.querySelectorAll('.uda-card:not(.uda-gone)'), function (c) { return c.dataset.value === sl.dataset.answer; });
        if (card) self._fill(sl, card, null, true);
        else { sl.innerHTML = sl._filledHtml; sl.classList.add('uda-filled'); }
      });
      this._complete();
    }

    get progress() {
      var filled = this._frame ? this._frame.querySelectorAll('.uda-slot.uda-filled').length : 0;
      return { filled: filled, total: this._total || 0, wrong: this._wrong || 0 };
    }
  }

  window.UiDragAns = UiDragAns;
  customElements.define('ui-drag-ans', UiDragAns);
})();
