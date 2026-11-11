/* ── 色名標籤 <c-blue>、<c-key> 等：所有元件共用同一份，頁面上只注入一次 ── */
(function () {
  'use strict';
  if (typeof document === 'undefined' || document.getElementById('ui-color-tags')) return;
  var COLORS = { shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#DE8EC9' };
  var css = [];
  Object.keys(COLORS).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[k] + '}'); });
  var s = document.createElement('style'); s.id = 'ui-color-tags'; s.textContent = css.join('\n');
  (document.head || document.documentElement).appendChild(s);
  if (typeof window !== 'undefined' && !window.UiColorTags) { window.UiColorTags = { colors: COLORS }; }
})();

/**
 * ui-guide.js：指引框。框住頁面上任何有 id 的元素，左側放號碼方塊，
 * 再用水平、垂直的自動折線連到另一個元素，終點畫一個圓點。
 *
 *   <ui-guide id="g1" mode="step">
 *     <guide-mark num="1" target="#old-a" to="#new-a" exit="left" enter="left">
 *       檢查狀態移到<b>下方</b>
 *     </guide-mark>
 *   </ui-guide>
 *   <button guide-for="g1" guide-action="next">下一個</button>
 *
 * 顯示由頁面上的按鈕控制：任何元素加上 guide-for="ui-guide 的 id" 就會成為控制鈕，
 * guide-action 可用 toggle、show、hide、next、prev、reset，以及說明卡用的 cards-show、cards-hide、cards-toggle。
 * card-reveal（click、button、step）讓說明卡按下才顯示，框旁會有提示。
 *
 * 不使用 Shadow DOM。框、線與說明卡畫在 <body> 上的一層透明圖層，不改動原本的版面；
 * 視窗縮放、內容變動、捲動時自動重新計算位置。
 */
(() => {
  'use strict';
  if (customElements.get('ui-guide')) return;

  const PALETTE = {
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7', red: '#EF6661',
    green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1', violet: '#B484E8',
    gray: '#86877F', key: '#51DBCF', calm: '#A3C4BC', quiet: '#8EA4DE',
    playful: '#FFA987', urgent: '#FF2E63', energetic: '#B6FF00', dreamy: '#DE8EC9', 'bg-alternative': '#3B2A20'
  };
  const BG = '#0C0D0C';
  const color = v => {
    if (!v) return '';
    const t = v.trim(), k = t.toLowerCase();
    return PALETTE[t] || PALETTE[k] || (k === 'base' ? '#0C0D0C' : t);
  };
  const onColor = v => (v && v.trim() === 'bg-alternative' ? '#FFFFFF' : BG);
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const SIDES = ['left', 'right', 'top', 'bottom'];
  const DIVIDERS = ['solid', 'dashed', 'dotted', 'none'];
  const SVGNS = 'http://www.w3.org/2000/svg';

  const STYLE_ID = 'ui-guide-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
ui-guide,guide-mark{display:none;}
.ug-layer{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:1500;}
.ug-layer svg{position:absolute;left:0;top:0;overflow:visible;}
.ug-mark{position:absolute;left:0;top:0;}
.ug-frame{position:absolute;box-sizing:border-box;border:var(--ug-w) solid var(--ug-c);border-radius:var(--ug-r);display:flex;}
.ug-num{box-sizing:border-box;flex:none;width:var(--ug-tab);height:100%;display:flex;align-items:center;justify-content:center;background:var(--ug-c);color:var(--ug-on);font-weight:700;font-size:var(--ug-num-fs, 1.4rem);line-height:1;font-family:inherit;}
.ug-frame[data-num-pos="left"] .ug-num{border-radius:calc(var(--ug-r) - var(--ug-w)) 0 0 calc(var(--ug-r) - var(--ug-w));}
.ug-frame[data-num-pos="right"]{flex-direction:row-reverse;}
.ug-frame[data-num-pos="right"] .ug-num{border-radius:0 calc(var(--ug-r) - var(--ug-w)) calc(var(--ug-r) - var(--ug-w)) 0;}
.ug-frame[data-num-pos="none"] .ug-num{display:none;}
.ug-frame[data-line="dashed"]{border-style:dashed;}
.ug-frag{display:block;}
/* 說明卡按下才顯示：提示問號、號碼可點、小按鈕、關閉鈕 */
.ug-hint{position:absolute;width:20px;height:20px;border-radius:50%;background:var(--ug-c);color:var(--ug-on);font-size:0.75rem;font-weight:700;line-height:20px;text-align:center;pointer-events:auto;cursor:pointer;animation:ug-pulse 1.6s ease-in-out infinite;}
@keyframes ug-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
.ug-mark[data-reveal="click"] .ug-num{pointer-events:auto;cursor:pointer;}
.ug-cbtn{position:absolute;pointer-events:auto;cursor:pointer;display:inline-flex;align-items:center;gap:6px;background:#161716;color:var(--ug-c);border:1px dashed var(--ug-c);border-radius:6px;padding:5px 12px;font-size:0.85rem;font-family:inherit;line-height:1.4;white-space:nowrap;}
.ug-cbtn:hover{border-style:solid;}
.ug-close{position:absolute;top:4px;right:6px;width:22px;height:22px;border:0;background:transparent;color:#86877F;font-size:1rem;line-height:1;cursor:pointer;padding:0;}
.ug-close:hover{color:#DBEDD8;}
.ug-card.ug-has-close .ug-card-body{padding-right:18px;}
.ug-card.ug-open{animation:ug-fade .25s ease both;}
.ug-frame[data-num-pos="badge"] .ug-num{position:absolute;left:-12px;top:-12px;width:24px;height:24px;border-radius:50%;font-size:0.8rem;}
.ug-card{position:absolute;box-sizing:border-box;width:var(--ug-card-w);background:#161716;border:1px solid var(--ug-c);border-radius:8px;padding:10px 14px;color:#C6C7BD;font-size:var(--ug-card-fs, 0.92rem);line-height:1.6;pointer-events:auto;}
.ug-card-body > :first-child{margin-top:0;}
.ug-card-body > :last-child{margin-bottom:0;}
.ug-card-num{display:inline-flex;align-items:center;justify-content:center;min-width:1.5em;height:1.5em;padding:0 4px;margin:0 8px 0 0;border-radius:4px;background:var(--ug-c);color:var(--ug-on);font-weight:700;font-size:0.85em;vertical-align:1px;}
.ug-badge{position:absolute;top:-10px;right:10px;background:var(--ug-badge-bg, #EF6661);color:var(--ug-badge-fg, #0C0D0C);font-size:0.75rem;font-weight:700;line-height:1.5;border-radius:999px;padding:1px 9px;}
.ug-foot{margin:10px 0 0 0;padding:8px 0 0 0;border-top:1px var(--ug-div, solid) var(--ug-div-c, #3A3B38);color:#86877F;font-size:0.85em;}
.ug-card[data-divider="none"] .ug-foot{border-top:0;padding-top:0;}
.ug-line{fill:none;stroke:var(--ug-c);stroke-width:var(--ug-w);stroke-linejoin:round;stroke-linecap:round;}
.ug-line[data-style="dashed"]{stroke-dasharray:7 6;}
.ug-dot{fill:var(--ug-c);}
.ug-mark.ug-in .ug-frame,.ug-mark.ug-in .ug-card{animation:ug-fade .3s ease both;}
.ug-mark.ug-in .ug-card{animation-delay:.12s;}
.ug-mark.ug-in .ug-dot{animation:ug-fade .2s ease both;animation-delay:var(--ug-dot-delay, .55s);}
@keyframes ug-fade{from{opacity:0}to{opacity:1}}
`;
    (document.head || document.documentElement).appendChild(s);
  }

  /* 共用圖層：所有 ui-guide 畫在同一層，座標為頁面座標 */
  let layer = null, svg = null;
  function getLayer() {
    if (layer && layer.isConnected) return layer;
    layer = document.createElement('div');
    layer.className = 'ug-layer';
    svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('width', '1');
    svg.setAttribute('height', '1');
    layer.append(svg);
    document.body.append(layer);
    return layer;
  }

  function findEl(sel) {
    if (!sel) return null;
    sel = sel.trim();
    try { return document.querySelector(sel.startsWith('#') || /[.\[\s>]/.test(sel) ? sel : '#' + sel); }
    catch (e) { return document.getElementById(sel.replace(/^#/, '')); }
  }
  const relRect = (r, b) => ({ left: r.left - b.left, top: r.top - b.top, right: r.right - b.left, bottom: r.bottom - b.top, width: r.width, height: r.height });
  /* 以圖層左上角為原點的座標；不論 body 有沒有定位、捲動到哪裡都正確 */
  function pageRect(el) {
    const r = el.getBoundingClientRect();
    const b = layer.getBoundingClientRect();
    return { left: r.left - b.left, top: r.top - b.top, right: r.right - b.left, bottom: r.bottom - b.top, width: r.width, height: r.height };
  }
  const visible = el => !!(el && el.isConnected && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));

  function sidePoint(r, side) {
    if (side === 'left') return { x: r.left, y: (r.top + r.bottom) / 2 };
    if (side === 'right') return { x: r.right, y: (r.top + r.bottom) / 2 };
    if (side === 'top') return { x: (r.left + r.right) / 2, y: r.top };
    return { x: (r.left + r.right) / 2, y: r.bottom };
  }
  const isH = s => s === 'left' || s === 'right';
  const out = (p, side, g) => ({ x: p.x + (side === 'left' ? -g : side === 'right' ? g : 0), y: p.y + (side === 'top' ? -g : side === 'bottom' ? g : 0) });
  /* 出口與入口的預設方向：依兩個區塊的相對位置挑最直接的一邊 */
  function autoSides(a, b) {
    const ac = { x: (a.left + a.right) / 2, y: (a.top + a.bottom) / 2 };
    const bc = { x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 };
    const dx = bc.x - ac.x, dy = bc.y - ac.y;
    if (b.top >= a.bottom) return ['bottom', 'top'];
    if (b.bottom <= a.top) return ['top', 'bottom'];
    return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? ['right', 'left'] : ['left', 'right']) : (dy > 0 ? ['bottom', 'top'] : ['top', 'bottom']);
  }
  /* 只走水平與垂直的折線：起點往外走一段，再轉到終點外側，最後進入終點 */
  function route(S, exit, E, enter, gap, lo) {
    lo = lo || 0;
    const S1 = out(S, exit, gap), E1 = out(E, enter, gap);
    const pts = [S, S1];
    if (isH(exit) && isH(enter)) {
      let x;
      if (exit === enter) x = exit === 'left' ? Math.min(S1.x, E1.x) : Math.max(S1.x, E1.x);
      else {
        /* 左右相對：兩者之間要有空間；垂直段靠近目標，先離開來源所在的文字區 */
        const room = exit === 'right' ? E.x - S.x : S.x - E.x;
        if (room >= 24) {
          const want = exit === 'right' ? E.x - gap : E.x + gap;
          x = exit === 'right' ? Math.min(Math.max(want, S.x + 12), E.x - 12) : Math.max(Math.min(want, S.x - 12), E.x + 12);
          pts.length = 1;   /* 直接從起點橫走，不先往外推 */
        } else x = null;
      }
      if (x != null) pts.push({ x, y: S.y }, { x, y: E.y });
      else { const y = (S.y + E.y) / 2 + lo; pts.push({ x: S1.x, y }, { x: E1.x, y }); }
    } else if (!isH(exit) && !isH(enter)) {
      let y;
      if (exit === enter) y = exit === 'top' ? Math.min(S1.y, E1.y) : Math.max(S1.y, E1.y);
      else {
        /* 上下相對：水平段靠近起點，依錯開距離分層，但不超過兩者之間的空間 */
        const room = exit === 'bottom' ? E.y - S.y : S.y - E.y;
        if (room >= 24) {
          const want = exit === 'bottom' ? S.y + gap : S.y - gap;
          y = exit === 'bottom' ? Math.min(Math.max(want, S.y + 12), E.y - 12) : Math.max(Math.min(want, S.y - 12), E.y + 12);
          pts.length = 1;
        } else y = null;
      }
      if (y != null) pts.push({ x: S.x, y }, { x: E.x, y });
      else { const x = (S.x + E.x) / 2 + lo; pts.push({ x, y: S1.y }, { x, y: E1.y }); }
    } else if (isH(exit)) {
      /* 水平出、垂直進：先橫走到終點正上（下）方，再直下；方向相反時先繞出去，不穿過框 */
      const ok = (enter === 'top' ? S.y <= E1.y : S.y >= E1.y) && (exit === 'right' ? E.x >= S1.x : E.x <= S1.x);
      if (ok) pts.push({ x: E.x, y: S.y });
      else pts.push({ x: S1.x, y: E1.y }, { x: E.x, y: E1.y });
    } else {
      const ok = (enter === 'left' ? S.x <= E1.x : S.x >= E1.x) && (exit === 'bottom' ? E.y >= S1.y : E.y <= S1.y);
      if (ok) pts.push({ x: S.x, y: E.y });
      else pts.push({ x: E1.x, y: S1.y }, { x: E1.x, y: E.y });
    }
    pts.push(E1, E);
    /* 去掉重複點與共線的中間點 */
    const clean = [];
    pts.forEach(p => {
      const q = { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 };
      const l = clean[clean.length - 1];
      if (l && l.x === q.x && l.y === q.y) return;
      clean.push(q);
    });
    for (let i = clean.length - 2; i > 0; i--) {
      const a = clean[i - 1], b = clean[i], c = clean[i + 1];
      if ((a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y)) clean.splice(i, 1);
    }
    return clean;
  }

  class GuideMark extends HTMLElement {}

  class UiGuide extends HTMLElement {
    connectedCallback() {
      if (this._init) return;
      this._init = true;
      injectStyle();
      /* 等子元素與其他元件都就緒再建立 */
      requestAnimationFrame(() => this._setup());
    }

    disconnectedCallback() {
      clearInterval(this._tick);
      (this._items || []).forEach(it => { it.g.remove(); it.path.remove(); it.dot.remove(); });
    }

    _opt(m, n, d) {
      const v = m.getAttribute(n);
      if (v != null && v !== '') return v;
      const w = this.getAttribute(n);
      return w != null && w !== '' ? w : d;
    }

    _setup() {
      getLayer();
      this._mode = (this.getAttribute('mode') || 'all').trim() === 'step' ? 'step' : 'all';
      this._items = [...this.querySelectorAll('guide-mark')].map((m, i) => this._build(m, i));
      this._step = 0;
      this._shown = new Set();
      if (this.hasAttribute('open')) this.show();
      this._sync();
      /* 位置隨版面變動 */
      const re = () => this.refresh();
      this._ro = new ResizeObserver(re);
      this._ro.observe(document.body);
      this._items.forEach(it => { if (it.tEl) this._ro.observe(it.tEl); if (it.dEl) this._ro.observe(it.dEl); });
      addEventListener('resize', re);
      addEventListener('scroll', re, true);
      addEventListener('load', re);
      this._tick = setInterval(() => { if (this._shown && this._shown.size) this._layoutAll(); }, 300);
    }

    _build(m, i) {
      const opt = (n, d) => this._opt(m, n, d);
      const cName = opt('color', 'shell');
      const it = {
        m, i,
        num: m.getAttribute('num') || String(i + 1),
        tEl: findEl(m.getAttribute('target')),
        dEl: findEl(m.getAttribute('to')),
        exit: (m.getAttribute('exit') || '').trim(),
        enter: (m.getAttribute('enter') || '').trim(),
        lane: num(m.getAttribute('lane'), 0),
        laneSet: m.hasAttribute('lane'),
        gap: num(opt('gap', 28), 28),
        pad: num(opt('pad', 6), 6),
        tab: num(opt('tab-width', 44), 44),
        numPos: opt('num-pos', 'left'),
        labelPos: opt('label-pos', 'bottom'),
        c: color(cName), on: onColor(cName)
      };
      if (!it.tEl) console.error('[ui-guide] 找不到 target="' + m.getAttribute('target') + '"，這個框不會出現。');
      if (m.getAttribute('to') && !it.dEl) console.error('[ui-guide] 找不到 to="' + m.getAttribute('to') + '"，這個框不畫線。');
      if (it.exit && !SIDES.includes(it.exit)) { console.warn('[ui-guide] exit="' + it.exit + '" 請用 left、right、top、bottom，已改用自動。'); it.exit = ''; }
      if (it.enter && !SIDES.includes(it.enter)) { console.warn('[ui-guide] enter="' + it.enter + '" 請用 left、right、top、bottom，已改用自動。'); it.enter = ''; }
      if (!['left', 'right', 'badge', 'none'].includes(it.numPos)) it.numPos = 'left';
      if (!SIDES.includes(it.labelPos)) it.labelPos = 'bottom';

      const g = document.createElement('div');
      g.className = 'ug-mark';
      g.style.display = 'none';
      g.style.setProperty('--ug-c', it.c);
      g.style.setProperty('--ug-on', it.on);
      g.style.setProperty('--ug-w', num(opt('line-width', 2), 2) + 'px');
      g.style.setProperty('--ug-r', num(opt('radius', 10), 10) + 'px');
      g.style.setProperty('--ug-tab', ((it.numPos === 'left' || it.numPos === 'right') ? it.tab : 0) + 'px');
      g.style.setProperty('--ug-card-w', num(opt('card-width', 280), 280) + 'px');

      const frame = document.createElement('div');
      frame.className = 'ug-frame';
      frame.setAttribute('data-num-pos', it.numPos);
      frame.setAttribute('data-line', opt('line-style', 'solid'));
      const nb = document.createElement('div');
      nb.className = 'ug-num';
      nb.innerHTML = it.num;
      frame.append(nb);
      g.append(frame);
      it.frame = frame;

      /* 說明卡：內容（支援 HTML）、角標、頁尾與分隔線 */
      const src = m.getAttribute('source');
      let html = m.innerHTML.trim();
      if (src) {
        const t = document.getElementById(src);
        if (t) html = t.tagName === 'TEMPLATE' ? t.innerHTML : t.innerHTML;
        else console.error('[ui-guide] source 找不到 id="' + src + '"。');
      }
      const badge = m.getAttribute('badge');
      const foot = m.getAttribute('footer');
      if (html || badge || foot) {
        const card = document.createElement('div');
        card.className = 'ug-card';
        const dv = opt('divider', 'solid');
        card.setAttribute('data-divider', DIVIDERS.includes(dv) ? dv : 'solid');
        if (dv && dv !== 'none' && DIVIDERS.includes(dv)) card.style.setProperty('--ug-div', dv);
        if (opt('divider-color', '')) card.style.setProperty('--ug-div-c', color(opt('divider-color', '')));
        if (opt('card-font-size', '')) card.style.setProperty('--ug-card-fs', opt('card-font-size', ''));
        const body = document.createElement('div');
        body.className = 'ug-card-body';
        body.innerHTML = (it.numPos === 'none' || this._opt(m, 'card-num', '') === 'false' ? '' : '<span class="ug-card-num">' + it.num + '</span>') + html;
        card.append(body);
        if (badge) {
          const b = document.createElement('span');
          b.className = 'ug-badge';
          b.innerHTML = badge;
          const bc = m.getAttribute('badge-color');
          if (bc) { card.style.setProperty('--ug-badge-bg', color(bc)); card.style.setProperty('--ug-badge-fg', onColor(bc)); }
          card.append(b);
        }
        if (foot) {
          const f = document.createElement('div');
          f.className = 'ug-foot';
          f.innerHTML = foot;
          card.append(f);
        }
        g.append(card);
        it.card = card;
        /* card-reveal：click 點號碼、button 點小按鈕、step 逐步模式多按一下；空白為跟著框一起出現 */
        const rv = (opt('card-reveal', '') || '').trim();
        it.reveal = ['click', 'button', 'step'].includes(rv) ? rv : '';
        if (rv && !it.reveal) console.warn('[ui-guide] card-reveal="' + rv + '" 請用 click、button、step。');
        it.cardOpen = !it.reveal;
        if (it.reveal) {
          g.setAttribute('data-reveal', it.reveal);
          if (it.reveal !== 'button') {
            const h = document.createElement('span');
            h.className = 'ug-hint';
            h.textContent = '?';
            h.title = '顯示說明';
            h.addEventListener('click', e => { e.stopPropagation(); this._card(it, true); });
            g.append(h);
            it.hint = h;
          }
          if (it.reveal === 'button') {
            const bt = document.createElement('button');
            bt.type = 'button';
            bt.className = 'ug-cbtn';
            bt.innerHTML = opt('card-button-label', '<i class="bi bi-chat-square-text"></i> 看解說');
            bt.addEventListener('click', e => { e.stopPropagation(); this._card(it, true); });
            g.append(bt);
            it.cbtn = bt;
          }
          if (it.reveal === 'click') nb.addEventListener('click', e => { e.stopPropagation(); this._card(it); });
          if (it.reveal !== 'step') {
            const x = document.createElement('button');
            x.type = 'button';
            x.className = 'ug-close';
            x.innerHTML = '&times;';
            x.title = '收起說明';
            x.addEventListener('click', e => { e.stopPropagation(); this._card(it, false); });
            card.append(x);
            card.classList.add('ug-has-close');
          }
        }
      }
      layer.append(g);
      it.g = g;

      const path = document.createElementNS(SVGNS, 'path');
      path.setAttribute('class', 'ug-line');
      path.setAttribute('data-style', opt('line-style', 'solid'));
      path.style.setProperty('--ug-c', it.c);
      path.style.setProperty('--ug-w', num(opt('line-width', 2), 2) + 'px');
      path.style.display = 'none';
      const dot = document.createElementNS(SVGNS, 'circle');
      dot.setAttribute('class', 'ug-dot');
      dot.setAttribute('r', String(num(opt('dot-size', 5), 5)));
      dot.style.setProperty('--ug-c', it.c);
      dot.style.display = 'none';
      svg.append(path, dot);
      it.path = path;
      it.dot = dot;
      return it;
    }

    /* 先算出每個框的位置與出入方向，再統一分配：
       同一目標同一邊的多條線，終點沿著那一邊平均分開；
       同一出口方向的線自動錯開距離，避免平行線段重疊 */
    _layoutAll() {
      const lb = layer.getBoundingClientRect();
      const live = [];
      (this._items || []).forEach(it => {
        const on = this._shown.has(it) && !it._pending && visible(it.tEl);
        it.g.style.display = on ? '' : 'none';
        const drawLine = on && visible(it.dEl);
        it.path.style.display = drawLine ? '' : 'none';
        it.dot.style.display = drawLine ? '' : 'none';
        if (!on) return;
        /* 段落裡換行的文字：每一行各畫一個框，號碼放在第一段 */
        const inline = getComputedStyle(it.tEl).display === 'inline';
        let frags = inline ? [...it.tEl.getClientRects()].filter(r => r.width > 1).map(r => relRect(r, lb)) : [];
        if (frags.length < 2) frags = [pageRect(it.tEl)];
        const tab = (it.numPos === 'left' || it.numPos === 'right') ? it.tab : 0;
        const box = (t, first) => ({
          left: t.left - it.pad - (first && it.numPos === 'left' ? tab : 0),
          top: t.top - it.pad,
          right: t.right + it.pad + (first && it.numPos === 'right' ? tab : 0),
          bottom: t.bottom + it.pad
        });
        const boxes = frags.map((t, k) => box(t, k === 0));
        const place = (el, b) => Object.assign(el.style, { left: b.left + 'px', top: b.top + 'px', width: (b.right - b.left) + 'px', height: (b.bottom - b.top) + 'px' });
        place(it.frame, boxes[0]);
        it.frags = it.frags || [];
        while (it.frags.length < boxes.length - 1) {
          const f = document.createElement('div');
          f.className = 'ug-frame ug-frag';
          f.setAttribute('data-num-pos', 'none');
          f.setAttribute('data-line', it.frame.getAttribute('data-line'));
          it.g.insertBefore(f, it.frame.nextSibling);
          it.frags.push(f);
        }
        it.frags.forEach((f, k) => { if (k < boxes.length - 1) { f.style.display = ''; place(f, boxes[k + 1]); } else f.style.display = 'none'; });
        it.boxes = boxes;
        /* 連線與說明卡用的框：整體範圍；出線時再挑最靠近出口的那一段 */
        it.fr = {
          left: Math.min(...boxes.map(b => b.left)), top: boxes[0].top,
          right: Math.max(...boxes.map(b => b.right)), bottom: boxes[boxes.length - 1].bottom
        };
        const fr = it.fr;
        if (it.card) {
          it.card.style.display = it.cardOpen ? '' : 'none';
          if (it.cbtn) it.cbtn.style.display = it.cardOpen ? 'none' : '';
          if (it.hint) {
            it.hint.style.display = it.cardOpen ? 'none' : '';
            /* 提示放在框的右上角 */
            it.hint.style.left = (fr.right - 10) + 'px';
            it.hint.style.top = (fr.top - 10) + 'px';
          }
        }
        /* 說明卡（或代替它的小按鈕）放在 label-pos 那一側 */
        const cardEl = it.card && (it.cardOpen ? it.card : it.cbtn);
        if (cardEl) {
          const cw = cardEl.offsetWidth, ch = cardEl.offsetHeight, gapC = 10;
          let x, y;
          if (it.labelPos === 'bottom') { x = fr.left; y = fr.bottom + gapC; }
          else if (it.labelPos === 'top') { x = fr.left; y = fr.top - ch - gapC; }
          else if (it.labelPos === 'right') { x = fr.right + gapC; y = fr.top; }
          else { x = fr.left - cw - gapC; y = fr.top; }
          /* 說明卡不超出視窗左右邊緣 */
          x = Math.max(4 - lb.left, Math.min(x, document.documentElement.clientWidth - lb.left - cw - 4));
          cardEl.style.left = x + 'px';
          cardEl.style.top = Math.max(4 - lb.top - scrollY, y) + 'px';
        }
        if (drawLine) {
          it.dr = pageRect(it.dEl);
          const auto = autoSides(fr, it.dr);
          it.ex = it.exit || auto[0];
          it.en = it.enter || auto[1];
          live.push(it);
        }
      });
      /* 自動錯開：沒寫 lane 的線，依出口方向各自編號 */
      const laneN = {};
      live.forEach(it => {
        if (it.laneSet) { it.ln = it.lane; return; }
        it.ln = laneN[it.ex] = (laneN[it.ex] == null ? 0 : laneN[it.ex] + 1);
      });
      /* 同一目標、同一邊的終點平均分開，依起點的位置排序，減少交叉 */
      const groups = new Map();
      live.forEach(it => {
        const k = it.en;
        const arr = groups.get(it.dEl) || {};
        (arr[k] = arr[k] || []).push(it);
        groups.set(it.dEl, arr);
      });
      groups.forEach(bySide => Object.keys(bySide).forEach(side => {
        const arr = bySide[side];
        const horiz = side === 'top' || side === 'bottom';
        arr.sort((a, b) => horiz ? (a.fr.left + a.fr.right) - (b.fr.left + b.fr.right) : (a.fr.top + a.fr.bottom) - (b.fr.top + b.fr.bottom));
        arr.forEach((it, k) => { it.slot = (k + 1) / (arr.length + 1); });
      }));
      live.forEach(it => {
        /* 換行的文字：往下、往右出線用最後一段，往上、往左用第一段 */
        const bx = it.boxes.length > 1 ? (it.ex === 'bottom' || it.ex === 'right' ? it.boxes[it.boxes.length - 1] : it.boxes[0]) : it.fr;
        const S = sidePoint(bx, it.ex);
        /* 段落裡的文字（inline）往左右出線時，從框的底邊轉角出去，沿著行距空隙走，不穿過同一行的字 */
        if (isH(it.ex) && getComputedStyle(it.tEl).display === 'inline') S.y = bx.bottom;
        const d = it.dr;
        const E = it.en === 'left' || it.en === 'right'
          ? { x: it.en === 'left' ? d.left : d.right, y: d.top + (d.bottom - d.top) * it.slot }
          : { x: d.left + (d.right - d.left) * it.slot, y: it.en === 'top' ? d.top : d.bottom };
        const pts = route(S, it.ex, E, it.en, it.gap + it.ln * 14, it.ln * 14);
        const dStr = pts.map((p, k) => (k ? 'L' : 'M') + p.x + ' ' + p.y).join(' ');
        if (it.path.getAttribute('d') !== dStr) it.path.setAttribute('d', dStr);
        it.dot.setAttribute('cx', E.x);
        it.dot.setAttribute('cy', E.y);
      });
    }

    _layout() { this._layoutAll(); }

    _animate(it) {
      it.g.classList.remove('ug-in');
      void it.g.offsetWidth;
      it.g.classList.add('ug-in');
      if (this.hasAttribute('no-animation') || it.path.style.display === 'none') return;
      const len = it.path.getTotalLength ? it.path.getTotalLength() : 0;
      if (!len) return;
      const ms = num(this.getAttribute('draw-speed'), 600);
      it.path.style.transition = 'none';
      it.path.style.strokeDasharray = len + ' ' + len;
      it.path.style.strokeDashoffset = len;
      it.dot.style.opacity = '0';
      void it.path.getBoundingClientRect();
      it.path.style.transition = 'stroke-dashoffset ' + ms + 'ms ease';
      it.path.style.strokeDashoffset = '0';
      clearTimeout(it._t);
      it._t = setTimeout(() => {
        it.path.style.transition = '';
        it.path.style.strokeDasharray = '';
        it.path.style.strokeDashoffset = '';
        it.dot.style.opacity = '';
      }, ms + 30);
    }

    _reveal(list) {
      const stagger = num(this.getAttribute('stagger'), 0);
      list.forEach((it, k) => {
        const go = () => {
          it._pending = false;
          if (!this._shown.has(it)) return;
          this._layoutAll();
          this._animate(it);
        };
        this._shown.add(it);
        if (stagger > 0 && k > 0) { it._pending = true; setTimeout(go, stagger * k); }
        else go();
      });
    }

    /* ── API ── */
    show() { this._reveal(this._items.filter(it => !this._shown.has(it))); this._step = this._items.length; this._sync(); }
    hide() { this._shown.clear(); this._step = 0; this._items.forEach(it => { if (it.reveal) it.cardOpen = false; }); this._layoutAll(); this._sync(); }

    /* 說明卡：open 省略時切換 */
    _card(it, open) {
      if (!it.card || !it.reveal) return;
      const v = open == null ? !it.cardOpen : !!open;
      if (v === it.cardOpen) return;
      it.cardOpen = v;
      this._layoutAll();
      if (v) { it.card.classList.remove('ug-open'); void it.card.offsetWidth; it.card.classList.add('ug-open'); }
      this.dispatchEvent(new CustomEvent('ui-guide:card', { bubbles: true, detail: { num: it.num, open: v } }));
    }
    cardsShow() { this._items.forEach(it => { if (this._shown.has(it)) this._card(it, true); }); }
    cardsHide() { this._items.forEach(it => this._card(it, false)); }
    cardsToggle() {
      const any = this._items.some(it => this._shown.has(it) && it.reveal && it.card && !it.cardOpen);
      any ? this.cardsShow() : this.cardsHide();
    }
    toggle() { this._shown.size ? this.hide() : this.show(); }
    next() {
      /* step：目前這個框的說明卡還沒出現，先揭曉說明卡 */
      const cur = this._items[this._step - 1];
      if (cur && cur.reveal === 'step' && cur.card && !cur.cardOpen && this._shown.has(cur)) { this._card(cur, true); this._sync(); return; }
      if (this._step >= this._items.length) { if (this.hasAttribute('loop')) this.hide(); return; }
      const it = this._items[this._step++];
      this._reveal([it]);
      this._sync();
    }
    prev() {
      if (this._step <= 0) return;
      const cur = this._items[this._step - 1];
      if (cur && cur.reveal === 'step' && cur.cardOpen) { this._card(cur, false); this._sync(); return; }
      const it = this._items[--this._step];
      if (it.reveal) it.cardOpen = false;
      this._shown.delete(it);
      this._layoutAll();
      this._sync();
    }
    reset() { this.hide(); }
    refresh() {
      cancelAnimationFrame(this._raf);
      this._raf = requestAnimationFrame(() => this._layoutAll());
    }
    get shownCount() { return this._shown ? this._shown.size : 0; }

    _sync() {
      const n = this._shown.size, total = this._items.length;
      document.querySelectorAll('[guide-for="' + this.id + '"]').forEach(b => {
        b.classList.toggle('ug-on', n > 0 && (b.getAttribute('guide-action') || '') !== 'next' && (b.getAttribute('guide-action') || '') !== 'prev' && this._mode === 'all');
        b.setAttribute('aria-pressed', n > 0 ? 'true' : 'false');
        const lo = b.getAttribute('guide-label-open'), lc = b.getAttribute('guide-label-closed');
        if (lo && lc) b.innerHTML = n > 0 ? lo : lc;
      });
      this.dispatchEvent(new CustomEvent('ui-guide:change', { bubbles: true, detail: { shown: [...this._shown].map(it => it.num), step: this._step, total } }));
    }
  }

  /* 控制鈕：guide-for="id" guide-action="toggle|show|hide|next|prev|reset" */
  document.addEventListener('click', e => {
    const b = e.target.closest('[guide-for]');
    if (!b) return;
    const g = document.getElementById(b.getAttribute('guide-for'));
    if (!g || g.localName !== 'ui-guide' || !g._items) { console.error('[ui-guide] guide-for 找不到 id="' + b.getAttribute('guide-for') + '" 的 ui-guide。'); return; }
    const def = g._mode === 'step' ? 'next' : 'toggle';
    const act = (b.getAttribute('guide-action') || def).trim();
    const map = { toggle: 'toggle', show: 'show', hide: 'hide', next: 'next', prev: 'prev', reset: 'reset', 'cards-show': 'cardsShow', 'cards-hide': 'cardsHide', 'cards-toggle': 'cardsToggle' };
    if (map[act]) { e.preventDefault(); g[map[act]](); }
    else console.warn('[ui-guide] guide-action="' + act + '" 請用 toggle、show、hide、next、prev、reset、cards-show、cards-hide、cards-toggle。');
  });

  customElements.define('guide-mark', GuideMark);
  customElements.define('ui-guide', UiGuide);
})();
