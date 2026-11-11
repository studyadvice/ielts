/*!
 * <dino-deck> 恐龍噴火字卡元件 v1.1.0（11-12-26）
 * v1.1.0：恐龍預設去背，身體填色自動跟隨顯示區底色；dino-bg 改為選用，需要底框時再設定。
 * 點擊左側字卡，卡片飛入文字區變成描邊恐龍，恐龍噴火後例句從火焰處飛出，最後恐龍退場。
 * 不使用 shadow DOM，CSS 由本檔自動注入，不需要其他函式庫（有 Bootstrap 時錯誤提示可關閉）。
 *
 * 標籤：
 *   <dino-deck>   外層容器，管理版面、配色與動畫流程。
 *   <dino-card>   字卡，內文即卡面文字（支援 HTML），過長自動截斷並顯示「...」。
 *   <dino-stage>  顯示區，可省略，省略時自動產生。
 */
(function () {
  'use strict';
  if (window.customElements && customElements.get('dino-deck')) return;

  var PALETTE = {
    background: '#0C0D0C', base: '#0C0D0C', 'bg-alternative': '#3B2A20',
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7',
    red: '#EF6661', green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1',
    violet: '#B484E8', gray: '#86877F', key: '#51DBCF', calm: '#A3C4BC',
    quiet: '#8EA4DE', playful: '#FFA987', urgent: '#FF2E63',
    energetic: '#B6FF00', dreamy: '#DE8EC9'
  };

  /* 主題：統一配色，所有項目都可以用屬性個別覆蓋 */
  var THEMES = {
    ember: {
      'stage-bg': '#3B2A20', 'stage-color': '#DBEDD8', 'stage-border': '2px solid #86877F',
      'card-bg': '#DBEDD8,#8EA4DE', 'card-color': '#0C0D0C', 'card-border': '2px solid #0C0D0C',
      'extra-color': '#A3C4BC', 'mark-color': '#E3D322', 'active-color': '#51DBCF',
      'dino-line': '#DBEDD8'
    },
    night: {
      'stage-bg': '#0C0D0C', 'stage-color': '#C6C7BD', 'stage-border': '2px solid #51DBCF',
      'card-bg': '#51DBCF,#A3C4BC', 'card-color': '#0C0D0C', 'card-border': '2px solid #0C0D0C',
      'extra-color': '#8EA4DE', 'mark-color': '#B6FF00', 'active-color': '#B6FF00',
      'dino-line': '#DBEDD8'
    },
    candy: {
      'stage-bg': '#0C0D0C', 'stage-color': '#DBEDD8', 'stage-border': '2px dashed #FF91D7',
      'card-bg': '#FF91D7,#DE8EC9,#B484E8', 'card-color': '#0C0D0C', 'card-border': '2px solid #0C0D0C',
      'extra-color': '#DE8EC9', 'mark-color': '#FFA987', 'active-color': '#E3D322',
      'dino-line': '#DBEDD8'
    },
    shell: {
      'stage-bg': '#C6C7BD', 'stage-color': '#0C0D0C', 'stage-border': '2px solid #0C0D0C',
      'card-bg': '#DBEDD8,#5DBAE8', 'card-color': '#0C0D0C', 'card-border': '2px solid #0C0D0C',
      'extra-color': '#3B2A20', 'mark-color': '#3B2A20', 'active-color': '#FF2E63',
      'dino-line': '#0C0D0C'
    }
  };

  var DEFAULTS = {
    'stage-radius': '6px', 'stage-min-height': '320px', 'stage-font-size': '1.6rem', 'stage-padding': '24px',
    'card-radius': '0px', 'card-width': '220px', 'card-lines': '2', 'card-gap': '0px', 'card-font-size': '1.1rem',
    'card-padding': '10px 12px', 'dino-height': '72px', 'dino-bg': 'none'
  };

  var DECK_ATTRS = ['theme'].concat(Object.keys(THEMES.ember), Object.keys(DEFAULTS));

  /* none、transparent 或空白視為不填底 */
  function noBg(v) { v = (v || '').trim().toLowerCase(); return !v || v === 'none' || v === 'transparent'; }
  var CARD_ATTRS = ['bg', 'color', 'border', 'example', 'example-template', 'extra-info', 'extra-template'];

  /* 時間設定（毫秒） */
  var T = { fly: 650, swap: 160, fire: 1300, emergeAt: 380, emerge: 650, out: 260, collapse: 420, clear: 160 };

  var CSS = [
    'dino-deck{display:grid;grid-template-columns:var(--dd-cw) minmax(0,1fr);gap:24px;align-items:start}',
    'dino-deck .dd-cards{display:flex;flex-direction:column;gap:var(--dd-cgap);min-width:0}',

    /* 字卡：超過行數自動截斷，結尾顯示 ... */
    'dino-card,.dd-flyer{display:block;box-sizing:border-box;background:var(--dd-cbg);color:var(--dd-cc);border:var(--dd-cb);' +
      'border-radius:var(--dd-cr);padding:var(--dd-cp);font-size:var(--dd-cfs);line-height:1.45}',
    'dino-card{cursor:pointer;-webkit-user-select:none;user-select:none;transition:transform .15s ease}',
    'dino-card:hover{transform:translateX(4px)}',
    'dino-card[active]{outline:3px solid var(--dd-active);outline-offset:2px;position:relative;z-index:1}',
    'dino-card .dd-face,.dd-flyer .dd-face{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--dd-lines);' +
      'overflow:hidden;text-overflow:ellipsis;word-break:break-word}',
    '.dd-flyer{position:fixed;z-index:9999;margin:0;pointer-events:none;will-change:transform,opacity}',

    /* 顯示區 */
    'dino-deck dino-stage{display:block;box-sizing:border-box;min-height:var(--dd-smh);padding:var(--dd-sp);background:var(--dd-sbg);' +
      'color:var(--dd-sc);border:var(--dd-sb);border-radius:var(--dd-sr);font-size:var(--dd-sfs);line-height:1.45;min-width:0;overflow:hidden}',
    'dino-stage .dd-row{display:flex;align-items:flex-start}',
    'dino-stage .dd-slot{flex:none;height:var(--dd-dh);margin-right:20px;overflow:hidden}',
    'dino-stage .dd-dino{display:block;height:var(--dd-dh);width:calc(var(--dd-dh) * 850 / 240);background:var(--dd-dbg);border-radius:4px}',
    'dino-stage .dd-say{flex:1 1 auto;min-width:0}',
    'dino-stage .dd-sentence{display:block;transform-origin:0 50%}',
    'dino-stage .dd-sentence.has-extra{cursor:pointer}',
    'dino-stage mark{background:none;color:var(--dd-mark);font-weight:700;padding:0}',
    'dino-stage .dd-more{display:inline-block;margin-left:10px;padding:0 8px;font-size:0.8rem;line-height:1.6;vertical-align:middle;' +
      'border:1px solid var(--dd-extra);color:var(--dd-extra);border-radius:20px;transition:transform .2s ease}',
    'dino-stage .dd-sentence.open .dd-more{transform:rotate(180deg)}',
    'dino-stage .dd-extra{display:grid;grid-template-rows:0fr;transition:grid-template-rows .3s ease}',
    'dino-stage .dd-extra>div{overflow:hidden;min-height:0}',
    'dino-stage .dd-extra-in{margin-top:16px;padding-top:12px;border-top:1px dashed var(--dd-extra);color:var(--dd-extra);font-size:1rem;line-height:1.6}',
    'dino-stage .dd-extra.open{grid-template-rows:1fr}',
    'dino-stage .dd-alert{font-size:1rem;margin:0 0 12px;padding:10px 16px;background:#EF6661;color:#0C0D0C;border:1px solid #0C0D0C}',
    'dino-stage .dd-alert .btn-close{padding:12px}'
  ].join('\n');

  function injectCss() {
    if (document.getElementById('dino-deck-style')) return;
    var s = document.createElement('style');
    s.id = 'dino-deck-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function color(v) {
    v = (v || '').trim();
    return PALETTE[v.toLowerCase()] || v;
  }
  function px(v) {
    v = (v || '').trim();
    return v.split(/\s+/).map(function (t) { return /^-?\d+(\.\d+)?$/.test(t) ? t + 'px' : t; }).join(' ');
  }
  /* 邊框：「2 dashed key」轉成「2px dashed #51DBCF」；none 或 0 代表無邊框 */
  function border(v) {
    v = (v || '').trim();
    if (!v || v === 'none' || v === '0') return 'none';
    return v.split(/\s+/).map(function (t) {
      if (/^-?\d+(\.\d+)?$/.test(t)) return t + 'px';
      return PALETTE[t.toLowerCase()] || t;
    }).join(' ');
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- 描邊恐龍（只保留噴火段落） ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  var FLAME = 'M0 0 C60 -40 140 -30 180 -55 C165 -25 220 -30 265 -50 C255 -20 320 -15 345 0 C320 15 255 20 265 50 C220 30 165 25 180 55 C140 30 60 40 0 0 Z';
  var LEG = 'M232 220 C262 210 292 240 278 268 L272 300 L298 302 L300 312 L250 312 L256 296 L248 262 C238 250 228 236 232 220 Z';

  function teeth(x0, x1, y0, slope, dir, size) {
    var d = '';
    for (var x = x0; x < x1; x += 11) {
      var ya = y0 - (x - 420) * slope, yb = y0 - (x + 10 - 420) * slope;
      d += 'M' + x + ' ' + ya.toFixed(1) + ' L' + (x + 5) + ' ' + (ya + dir * size).toFixed(1) + ' L' + (x + 10) + ' ' + yb.toFixed(1) + ' ';
    }
    return d;
  }

  function makeDino(bg, line) {
    var g = '#86877F';
    var svg =
      '<svg class="dd-dino" viewBox="50 78 850 240" xmlns="' + NS + '" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<g transform="translate(40 0)">' +
        '<path d="' + LEG + '" stroke="' + g + '" stroke-width="3" fill="' + bg + '" transform="translate(-26 0) rotate(6 255 225)"/>' +
        '<path d="M168 170 L178 150 L192 160 L204 138 L220 150 L234 128 L250 142 L264 122 L280 138 L296 120 L312 136 L328 120 L344 134 L358 124 L372 140 L372 160 L168 190 Z" stroke="' + line + '" stroke-width="3" fill="' + bg + '"/>' +
        '<path d="M24 206 C100 198 160 170 210 152 C260 136 330 128 395 138 L405 205 C380 236 330 250 280 248 C220 246 140 226 24 213 Z" stroke="' + line + '" stroke-width="3.5" fill="' + bg + '"/>' +
        '<g stroke="' + g + '" stroke-width="2"><path d="M300 236 q8 6 4 12"/><path d="M325 232 q8 6 4 12"/><path d="M350 224 q8 6 4 12"/><path d="M120 200 q30 -10 60 -26"/></g>' +
        '<g transform="rotate(-6 255 225)"><path d="' + LEG + '" stroke="' + line + '" stroke-width="3.5" fill="' + bg + '"/></g>' +
        '<g class="dd-arm" stroke="' + line + '" stroke-width="3"><path d="M366 198 C386 206 396 220 398 236"/><path d="M402 234 l10 -2 M402 234 l8 7 M402 234 l1 10"/></g>' +
        '<g class="dd-head">' +
          '<g class="dd-fire" transform="translate(536 150) scale(0)">' +
            '<path class="dd-f1" d="' + FLAME + '" stroke="#EF6661" stroke-width="5"/>' +
            '<path class="dd-f2" d="' + FLAME + '" stroke="#FFA987" stroke-width="5.5"/>' +
            '<path class="dd-f3" d="' + FLAME + '" stroke="#E3D322" stroke-width="6"/>' +
            '<g class="dd-embers" stroke-width="3"></g>' +
          '</g>' +
          '<g class="dd-jaw">' +
            '<path d="' + teeth(440, 524, 157, 7 / 112, -1, 7) + '" stroke="' + line + '" stroke-width="2"/>' +
            '<path d="M420 156 L532 150 C530 166 512 178 486 182 C456 186 430 182 410 176 C404 170 410 160 420 156 Z" stroke="' + line + '" stroke-width="3.5" fill="' + bg + '"/>' +
          '</g>' +
          '<path d="M380 162 C382 118 440 96 494 106 C524 111 542 126 538 148 L420 154 C404 160 398 182 400 200 L384 198 Z" stroke="' + line + '" stroke-width="3.5" fill="' + bg + '"/>' +
          '<path d="' + teeth(436, 528, 154, 6 / 118, 1, 8) + '" stroke="' + line + '" stroke-width="2" fill="' + bg + '"/>' +
          '<circle cx="474" cy="124" r="8" stroke="' + line + '" stroke-width="3"/>' +
          '<circle cx="476" cy="124" r="2.5" stroke="#51DBCF" stroke-width="2.5"/>' +
          '<path class="dd-brow" d="M460 110 q14 -8 28 -2" stroke="' + line + '" stroke-width="3"/>' +
          '<path d="M522 120 q5 -3 8 2" stroke="' + line + '" stroke-width="2.5"/>' +
        '</g>' +
      '</g></svg>';
    var wrap = document.createElement('div');
    wrap.innerHTML = svg;
    var el = wrap.firstChild;
    var q = function (s) { return el.querySelector(s); };
    var head = q('.dd-head'), jaw = q('.dd-jaw'), arm = q('.dd-arm'), fire = q('.dd-fire'), brow = q('.dd-brow');
    var f1 = q('.dd-f1'), f2 = q('.dd-f2'), f3 = q('.dd-f3'), eg = q('.dd-embers');
    var embers = [];
    for (var i = 0; i < 9; i++) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', 2.5 + (i % 3));
      c.setAttribute('stroke', i % 2 ? '#E3D322' : '#FFA987');
      eg.appendChild(c); embers.push(c);
    }
    function ease(k) { return k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k); }

    /* t：噴火開始後經過的毫秒數 */
    function render(t) {
      var k = ease(Math.min(t / 220, (T.fire - t) / 220));
      head.setAttribute('transform', 'rotate(' + (-8 * k).toFixed(2) + ' 395 170)');
      jaw.setAttribute('transform', 'rotate(' + (22 * k).toFixed(2) + ' 422 158)');
      arm.setAttribute('transform', 'rotate(' + (-14 * k).toFixed(2) + ' 372 200)');
      brow.setAttribute('transform', 'translate(0 ' + (-3 * k).toFixed(2) + ')');
      if (k <= 0) { fire.setAttribute('transform', 'translate(536 150) scale(0)'); return; }
      var a = Math.sin(t / 45), b = Math.sin(t / 31 + 1);
      fire.setAttribute('transform', 'translate(536 150) scale(' + (k * (0.85 + 0.05 * a)).toFixed(3) + ')');
      f1.setAttribute('transform', 'scale(' + (1 + 0.05 * b).toFixed(3) + ' ' + (1 + 0.14 * a).toFixed(3) + ')');
      f2.setAttribute('transform', 'scale(' + (0.72 + 0.04 * a).toFixed(3) + ' ' + (0.7 + 0.15 * b).toFixed(3) + ')');
      f3.setAttribute('transform', 'scale(' + (0.45 + 0.04 * b).toFixed(3) + ' ' + (0.42 + 0.12 * a).toFixed(3) + ')');
      embers.forEach(function (c, i) {
        var x = (t * 0.32 + i * 40) % 360;
        c.setAttribute('cx', (x + 20).toFixed(1));
        c.setAttribute('cy', (Math.sin(t / 120 + i * 1.7) * (10 + x * 0.12) - x * 0.05).toFixed(1));
        c.setAttribute('opacity', (1 - x / 360).toFixed(2));
      });
    }
    render(0);

    /* 火焰中段在螢幕上的位置，例句從這裡飛出 */
    function firePoint() {
      var m = head.getScreenCTM();
      if (!m) { var r = el.getBoundingClientRect(); return { x: r.right, y: r.top + r.height / 2 }; }
      var p = el.createSVGPoint(); p.x = 700; p.y = 150;
      p = p.matrixTransform(m);
      return { x: p.x, y: p.y };
    }
    return { el: el, render: render, firePoint: firePoint };
  }

  /* ---------- <dino-card> ---------- */
  class DinoCard extends HTMLElement {
    static get observedAttributes() { return CARD_ATTRS; }
    connectedCallback() {
      injectCss();
      if (!this.querySelector(':scope > .dd-face')) {
        var face = document.createElement('div');
        face.className = 'dd-face';
        while (this.firstChild) face.appendChild(this.firstChild);
        this.appendChild(face);
      }
      this._syncTitle();
      var deck = this.closest('dino-deck');
      if (deck && deck._paintCards) deck._paintCards();
    }
    attributeChangedCallback() {
      var deck = this.closest('dino-deck');
      if (this.isConnected && deck && deck._paintCards) deck._paintCards();
    }
    get face() { return this.querySelector(':scope > .dd-face'); }
    /* 被截斷時，滑鼠停留可看到全文 */
    _syncTitle() {
      var f = this.face;
      if (f && !this.hasAttribute('title')) this.setAttribute('title', f.textContent.replace(/\s+/g, ' ').trim());
    }
    /* 讀取例句或額外資訊：template 優先，其次是屬性；回傳 DocumentFragment 或 null，找不到 template 時丟出錯誤 */
    _content(attr, tplAttr) {
      var id = (this.getAttribute(tplAttr) || '').trim();
      if (id) {
        var tpl = document.getElementById(id);
        if (!tpl || tpl.tagName !== 'TEMPLATE') throw new Error('找不到 <template id="' + id + '">（' + tplAttr + '）。');
        var frag = tpl.content.cloneNode(true);
        return isEmpty(frag) ? null : frag;
      }
      var html = this.getAttribute(attr);
      if (html == null || !html.trim()) return null;
      var t = document.createElement('template');
      t.innerHTML = html;
      return isEmpty(t.content) ? null : t.content;
    }
    get example() { return this._content('example', 'example-template'); }
    get extraInfo() { return this._content('extra-info', 'extra-template'); }
  }
  function isEmpty(frag) {
    return !frag.textContent.trim() && !frag.querySelector('img,svg,video,audio,iframe,canvas,table,hr');
  }

  /* ---------- <dino-stage> ---------- */
  class DinoStage extends HTMLElement {}

  /* ---------- <dino-deck> ---------- */
  class DinoDeck extends HTMLElement {
    static get observedAttributes() { return DECK_ATTRS; }

    constructor() {
      super();
      this._run = 0;
      this._anims = [];
      this._raf = 0;
      this._flyers = [];
      this._onClick = this._onClick.bind(this);
    }

    connectedCallback() {
      injectCss();
      if (!this._built) this._build();
      this._apply();
      this.addEventListener('click', this._onClick);
    }
    disconnectedCallback() {
      this.removeEventListener('click', this._onClick);
      this._cancel();
    }
    attributeChangedCallback(n, o, v) { if (o !== v && this._built) this._apply(); }

    _build() {
      this._built = true;
      this._cardsBox = document.createElement('div');
      this._cardsBox.className = 'dd-cards';
      this._stage = this.querySelector(':scope > dino-stage') || document.createElement('dino-stage');
      var cards = Array.prototype.slice.call(this.querySelectorAll(':scope > dino-card'));
      cards.forEach(function (c) { this._cardsBox.appendChild(c); }, this);
      this.insertBefore(this._cardsBox, this.firstChild);
      this.appendChild(this._stage);
      /* 之後才加入的字卡也自動歸位 */
      var self = this;
      this._mo = new MutationObserver(function () {
        var loose = self.querySelectorAll(':scope > dino-card');
        if (loose.length) Array.prototype.forEach.call(loose, function (c) { self._cardsBox.appendChild(c); });
        self._paintCards();
      });
      this._mo.observe(this, { childList: true });
      this._mo.observe(this._cardsBox, { childList: true });
    }

    /* 主題值，屬性優先 */
    _val(name) {
      var a = this.getAttribute(name);
      if (a != null && a.trim() !== '') return a.trim();
      var th = THEMES[(this.getAttribute('theme') || 'ember').trim().toLowerCase()] || THEMES.ember;
      if (th[name] != null) return th[name];
      return DEFAULTS[name];
    }

    _apply() {
      var s = this.style, v = this._val.bind(this);
      var th = (this.getAttribute('theme') || '').trim().toLowerCase();
      if (th && !THEMES[th]) console.warn('[dino-deck] theme="' + th + '" 不存在，可用：' + Object.keys(THEMES).join('、') + '。已改用 ember。');
      s.setProperty('--dd-cw', px(v('card-width')));
      s.setProperty('--dd-cgap', px(v('card-gap')));
      s.setProperty('--dd-cr', px(v('card-radius')));
      s.setProperty('--dd-cp', px(v('card-padding')));
      s.setProperty('--dd-cfs', v('card-font-size'));
      s.setProperty('--dd-lines', String(parseInt(v('card-lines'), 10) || 2));
      s.setProperty('--dd-sbg', color(v('stage-bg')));
      s.setProperty('--dd-sc', color(v('stage-color')));
      s.setProperty('--dd-sb', border(v('stage-border')));
      s.setProperty('--dd-sr', px(v('stage-radius')));
      s.setProperty('--dd-smh', px(v('stage-min-height')));
      s.setProperty('--dd-sp', px(v('stage-padding')));
      s.setProperty('--dd-sfs', v('stage-font-size'));
      s.setProperty('--dd-extra', color(v('extra-color')));
      s.setProperty('--dd-mark', color(v('mark-color')));
      s.setProperty('--dd-active', color(v('active-color')));
      s.setProperty('--dd-dbg', noBg(v('dino-bg')) ? 'transparent' : color(v('dino-bg')));
      s.setProperty('--dd-dh', px(v('dino-height')));
      this._paintCards();
    }

    /* 字卡配色：卡片自己的屬性優先，否則依序輪替 card-bg 清單 */
    _paintCards() {
      if (!this._cardsBox) return;
      var list = this._val('card-bg').split(',').map(function (c) { return color(c); }).filter(Boolean);
      var cc = color(this._val('card-color')), cb = border(this._val('card-border'));
      Array.prototype.forEach.call(this._cardsBox.querySelectorAll(':scope > dino-card'), function (card, i) {
        card.style.setProperty('--dd-cbg', color(card.getAttribute('bg')) || list[i % list.length]);
        card.style.setProperty('--dd-cc', color(card.getAttribute('color')) || cc);
        card.style.setProperty('--dd-cb', card.hasAttribute('border') ? border(card.getAttribute('border')) : cb);
      });
    }

    _onClick(e) {
      var card = e.target.closest('dino-card');
      if (card && this._cardsBox.contains(card)) { this.play(card); return; }
      var sen = e.target.closest('.dd-sentence.has-extra');
      if (sen && this._stage.contains(sen)) this._toggleExtra(sen);
    }

    _toggleExtra(sen) {
      var box = sen.parentNode.querySelector('.dd-extra');
      if (!box) return;
      var open = !box.classList.contains('open');
      box.classList.toggle('open', open);
      sen.classList.toggle('open', open);
      this._emit('dino:extra', { open: open, card: this._current });
    }

    _emit(name, detail) { this.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail })); }

    _track(a) { this._anims.push(a); return a.finished.catch(function () {}); }

    /* 中斷目前的動畫，清掉飛行中的卡片與恐龍 */
    _cancel() {
      this._run++;
      cancelAnimationFrame(this._raf);
      this._anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
      this._anims = [];
      this._flyers.forEach(function (f) { f.remove(); });
      this._flyers = [];
      if (this._stage) {
        var slot = this._stage.querySelector('.dd-slot');
        if (slot) slot.remove();
      }
    }

    _alert(msg) {
      var hasBs = !!(window.bootstrap && window.bootstrap.Alert);
      var box = document.createElement('div');
      box.className = 'alert dd-alert' + (hasBs ? ' alert-dismissible fade show' : '');
      box.setAttribute('role', 'alert');
      box.innerHTML = esc(msg) + (hasBs ? '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="關閉"></button>' : '');
      this._stage.insertBefore(box, this._stage.firstChild);
    }

    /* ---- public api ---- */
    clear() {
      this._cancel();
      this._stage.innerHTML = '';
      this._setActive(null);
    }

    play(card) {
      if (typeof card === 'number') card = this._cardsBox.querySelectorAll('dino-card')[card];
      if (!card) return Promise.resolve();
      this._cancel();
      return this._sequence(card, this._run);
    }

    _setActive(card) {
      Array.prototype.forEach.call(this._cardsBox.querySelectorAll('dino-card[active]'), function (c) { c.removeAttribute('active'); });
      if (card) card.setAttribute('active', '');
      this._current = card || null;
    }

    async _sequence(card, run) {
      var self = this, stage = this._stage;
      var alive = function () { return run === self._run; };
      this._setActive(card);
      this._emit('dino:play', { card: card });

      /* 讀取內容，錯誤時用提示框顯示 */
      var example, extra;
      stage.querySelectorAll('.dd-alert').forEach(function (a) { a.remove(); });
      try {
        example = card.example;
        extra = card.extraInfo;
      } catch (err) {
        stage.innerHTML = '';
        this._alert(err.message);
        return;
      }
      if (!example) {
        stage.innerHTML = '';
        this._alert('這張字卡沒有例句，請設定 example 或 example-template。');
        return;
      }

      /* 1. 舊的例句淡出，取代成新的一列 */
      var old = stage.querySelector('.dd-row');
      if (old) {
        await this._track(old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T.clear, fill: 'forwards' }));
        if (!alive()) return;
      }
      stage.innerHTML = '';

      var row = document.createElement('div'); row.className = 'dd-row';
      var slot = document.createElement('div'); slot.className = 'dd-slot';
      var say = document.createElement('div'); say.className = 'dd-say';
      var sen = document.createElement('div'); sen.className = 'dd-sentence';
      sen.appendChild(example);
      say.appendChild(sen);
      if (extra) {
        sen.classList.add('has-extra');
        var more = document.createElement('span'); more.className = 'dd-more'; more.textContent = '▾';
        sen.appendChild(more);
        var ex = document.createElement('div'); ex.className = 'dd-extra';
        var exWrap = document.createElement('div');
        var exIn = document.createElement('div'); exIn.className = 'dd-extra-in';
        exIn.appendChild(extra); exWrap.appendChild(exIn); ex.appendChild(exWrap);
        say.appendChild(ex);
      }
      sen.style.opacity = '0';
      /* 去背時，身體用顯示區底色填滿，遮住後腿與身體重疊的線條，看起來就像透明 */
      var dbg = this._val('dino-bg');
      var dino = makeDino(noBg(dbg) ? color(this._val('stage-bg')) : color(dbg), color(this._val('dino-line')));
      dino.el.style.opacity = '0';
      slot.appendChild(dino.el);
      row.appendChild(slot); row.appendChild(say);
      stage.appendChild(row);

      /* 2. 字卡沿弧線飛到恐龍的位置 */
      var cr = card.getBoundingClientRect(), sr = dino.el.getBoundingClientRect();
      var flyer = document.createElement('div');
      flyer.className = 'dd-flyer';
      flyer.innerHTML = '<div class="dd-face">' + card.face.innerHTML + '</div>';
      ['--dd-cbg', '--dd-cc', '--dd-cb'].forEach(function (p) { flyer.style.setProperty(p, card.style.getPropertyValue(p)); });
      var cs = getComputedStyle(this);
      ['--dd-cr', '--dd-cp', '--dd-cfs', '--dd-lines'].forEach(function (p) { flyer.style.setProperty(p, cs.getPropertyValue(p)); });
      flyer.style.left = cr.left + 'px';
      flyer.style.top = cr.top + 'px';
      flyer.style.width = cr.width + 'px';
      flyer.style.height = cr.height + 'px';
      flyer.style.fontFamily = getComputedStyle(card).fontFamily;
      document.body.appendChild(flyer);
      this._flyers.push(flyer);

      var dx = (sr.left + sr.width / 2) - (cr.left + cr.width / 2);
      var dy = (sr.top + sr.height / 2) - (cr.top + cr.height / 2);
      var sc = Math.min(sr.width / cr.width, sr.height / cr.height, 1);
      var lift = Math.max(70, Math.abs(dx) * 0.25);
      await this._track(flyer.animate([
        { transform: 'translate(0,0) scale(1)' },
        { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - lift) + 'px) scale(' + (1 + sc) / 2 + ') rotate(-6deg)', offset: 0.5 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')' }
      ], { duration: T.fly, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' }));
      if (!alive()) return;

      /* 3. 卡片化成恐龍 */
      this._track(flyer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T.swap, fill: 'forwards' }));
      await this._track(dino.el.animate([{ opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'scale(1)' }], { duration: T.swap, fill: 'forwards' }));
      if (!alive()) return;
      flyer.remove();

      /* 4. 噴火，途中例句從火焰處飛出 */
      var t0 = performance.now(), emerged = false, emergeDone = null;
      await new Promise(function (resolve) {
        function tick(now) {
          if (!alive()) { resolve(); return; }
          var t = now - t0;
          dino.render(Math.min(t, T.fire));
          if (!emerged && t >= T.emergeAt) {
            emerged = true;
            var fp = dino.firePoint(), r = sen.getBoundingClientRect();
            sen.style.opacity = '';
            emergeDone = self._track(sen.animate([
              { transform: 'translate(' + (fp.x - r.left) + 'px,' + (fp.y - (r.top + r.height / 2)) + 'px) scale(.05)', opacity: 0 },
              { opacity: 1, offset: 0.35 },
              { transform: 'translate(0,0) scale(1)', opacity: 1 }
            ], { duration: T.emerge, easing: 'cubic-bezier(.2,.8,.25,1)' }));
          }
          if (t < T.fire) self._raf = requestAnimationFrame(tick);
          else resolve();
        }
        self._raf = requestAnimationFrame(tick);
      });
      if (!alive()) return;
      if (emergeDone) await emergeDone;
      if (!alive()) return;
      this._emit('dino:sentence', { card: card, sentence: sen });

      /* 5. 恐龍退場，例句往左補位 */
      await this._track(dino.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T.out, fill: 'forwards' }));
      if (!alive()) return;
      var w = slot.getBoundingClientRect().width;
      await this._track(slot.animate([
        { width: w + 'px', marginRight: '20px' },
        { width: '0px', marginRight: '0px' }
      ], { duration: T.collapse, easing: 'ease-in-out', fill: 'forwards' }));
      if (!alive()) return;
      slot.remove();
      this._anims = [];
      this._emit('dino:done', { card: card, sentence: sen });
    }
  }

  window.DinoDeck = DinoDeck;
  customElements.define('dino-card', DinoCard);
  customElements.define('dino-stage', DinoStage);
  customElements.define('dino-deck', DinoDeck);
})();
