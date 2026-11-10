(() => {
  'use strict';
  if (window.customElements.get('ui-network')) return;

  const PALETTE = Object.freeze({
    'background': '#0C0D0C', 'shell': '#C6C7BD', 'vanilla': '#DBEDD8', 'yellow': '#E3D322',
    'pink': '#FF91D7', 'red': '#EF6661', 'green': '#71CD76',
    'blue': '#5DBAE8', 'indigo': '#778CE1', 'violet': '#B484E8', 'gray': '#86877F',
    'key': '#51DBCF', 'calm': '#A3C4BC', 'quiet': '#8EA4DE',
    'playful': '#FFA987', 'urgent': '#FF2E63', 'energetic': '#B6FF00', 'dreamy': '#DE8EC9', 'bg-alternative': '#3B2A20'
  });

  const AUTO_COLORS = ['green', 'indigo', 'red', 'gray', 'violet', 'pink', 'energetic', 'blue', 'dreamy', 'urgent', 'playful'];
  const SIZE_PRESETS = { xs: 72, sm: 96, md: 120, lg: 150, xl: 210 };
  const REF_WIDTH = 1280;          // 預設尺寸對應的參考寬度
  const DENSITY = { sparse: 1.3, normal: 1.75, dense: 2.4 };
  const ICON_RATIO = 0.52;         // 圖示字級相對於圓圈直徑
  const LINE_OPACITY = 0.8;        // 線條未指定透明度時的預設值
  const MIN_ALPHA = 0.78;          // 任何顏色的透明度下限
  const BLACK_FILL = PALETTE.background;  // random-black 模式的圓圈底色
  const MAX_FILL = 0.4;            // 圓圈總面積占可用區域的上限
  const NS = 'http://www.w3.org/2000/svg';

  const CSS = `
ui-network{display:block;position:relative;width:100%;overflow:hidden;user-select:none;-webkit-user-select:none;}
ui-network > svg.un-lines{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:0;}
ui-network .un-line{fill:none;stroke:var(--un-line,rgba(198,199,189,${LINE_OPACITY}));stroke-width:var(--un-lw,1.5px);stroke-linecap:round;transition:stroke .2s ease,stroke-width .2s ease;}
ui-network .un-line.is-active{stroke:var(--un-line-active,#51DBCF);stroke-width:calc(var(--un-lw,1.5px) + 1.5px);}
ui-network .un-line.is-draw{animation:un-draw .9s ease-out backwards;}
ui-network > ui-node{position:absolute;left:0;top:0;display:block;z-index:1;will-change:transform;}
ui-network > ui-node:hover{z-index:2;}
ui-network > ui-node .un-link{display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:50%;text-decoration:none;outline:0 solid var(--un-line-active,#51DBCF);outline-offset:4px;transition:transform .25s ease,outline-width .2s ease;}
ui-network > ui-node .un-link.is-pop{animation:un-pop .55s cubic-bezier(.2,1.5,.4,1) backwards;}
ui-network > ui-node:hover .un-link{transform:scale(1.08);outline-width:4px;}
ui-network > ui-node[href] .un-link{cursor:pointer;}
ui-network > ui-node .un-link > i{display:block;line-height:1;pointer-events:none;}
@keyframes un-pop{from{transform:scale(0);}to{transform:scale(1);}}
@keyframes un-draw{from{stroke-dashoffset:var(--un-len);}to{stroke-dashoffset:0;}}
.un-alert-box{margin:0;padding:0;}
.un-alert{display:flex;align-items:center;gap:10px;margin:0 0 12px 0;font-size:.95rem;border-width:1px;}
.un-alert.alert-warning{background:#E3D322;color:#0C0D0C;border-color:#FFA987;}
.un-alert.alert-danger{background:#EF6661;color:#0C0D0C;border-color:#FF2E63;}
`;

  function injectStyle() {
    if (document.getElementById('ui-network-style')) return;
    const s = document.createElement('style');
    s.id = 'ui-network-style';
    s.textContent = CSS;
    document.head.append(s);
  }

  /* ===== 工具函式 ===== */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashSeed(v) {
    const s = String(v).trim();
    if (/^\d+$/.test(s)) return Number(s) >>> 0;
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }

  /* padding 屬性：比照 CSS 的 1 到 4 個數值，單位一律 px */
  function parsePadding(v) {
    const p = String(v ?? '').trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n) && n >= 0);
    if (p.length === 0) return { t: 40, r: 40, b: 40, l: 40 };
    if (p.length === 1) return { t: p[0], r: p[0], b: p[0], l: p[0] };
    if (p.length === 2) return { t: p[0], r: p[1], b: p[0], l: p[1] };
    if (p.length === 3) return { t: p[0], r: p[1], b: p[2], l: p[1] };
    return { t: p[0], r: p[1], b: p[2], l: p[3] };
  }

  function parseRatio(v) {
    const m = String(v || '').match(/^\s*(\d+(?:\.\d+)?)\s*[:/x]\s*(\d+(?:\.\d+)?)\s*$/);
    return m && +m[1] > 0 && +m[2] > 0 ? [+m[1], +m[2]] : [16, 9];
  }

  /*
   * 顏色解析：色票名稱、#RGB、#RGBA、#RRGGBB、#RRGGBBAA、rgb()、rgba()。
   * 回傳 { r, g, b, a, explicit }，explicit 表示是否明確指定透明度；無法辨識時回傳 null。
   * 色票名稱優先，因此 red、blue 等名稱代表色票色，不是 CSS 具名顏色。
   */
  function parseColor(v) {
    const s = String(v ?? '').trim();
    if (!s) return null;
    const lower = s.toLowerCase();
    if (PALETTE[lower]) return parseColor(PALETTE[lower]);

    if (s[0] === '#') {
      const h = s.slice(1);
      if (!/^[0-9a-f]+$/i.test(h) || ![3, 4, 6, 8].includes(h.length)) return null;
      const full = h.length <= 4 ? [...h].map(c => c + c).join('') : h;
      const byte = i => parseInt(full.slice(i, i + 2), 16);
      const explicit = full.length === 8;
      return { r: byte(0), g: byte(2), b: byte(4), a: explicit ? byte(6) / 255 : 1, explicit };
    }

    const m = lower.match(/^rgba?\((.+)\)$/);
    if (m) {
      const parts = m[1].trim().split(/\s*[,/]\s*|\s+/).filter(Boolean);
      if (parts.length !== 3 && parts.length !== 4) return null;
      const num = x => /^-?\d*\.?\d+%?$/.test(x) ? parseFloat(x) : NaN;
      const ch = x => (x.endsWith('%') ? num(x) * 2.55 : num(x));
      const [r, g, b] = parts.slice(0, 3).map(ch);
      const explicit = parts.length === 4;
      const a = explicit ? (parts[3].endsWith('%') ? num(parts[3]) / 100 : num(parts[3])) : 1;
      if ([r, g, b, a].some(isNaN)) return null;
      const c255 = x => Math.round(Math.min(255, Math.max(0, x)));
      return { r: c255(r), g: c255(g), b: c255(b), a: Math.min(1, Math.max(0, a)), explicit };
    }
    return null;
  }

  function toCss(c) {
    return c.a >= 1 ? `rgb(${c.r}, ${c.g}, ${c.b})` : `rgba(${c.r}, ${c.g}, ${c.b}, ${+c.a.toFixed(3)})`;
  }

  function segDist(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const l2 = dx * dx + dy * dy;
    let t = l2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }

  /* Bowyer–Watson 演算法，回傳不重複的邊 [a, b] */
  function delaunayEdges(pts) {
    const n = pts.length;
    if (n < 2) return [];
    if (n === 2) return [[0, 1]];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y;
    }
    const dm = Math.max(maxX - minX, maxY - minY) || 1;
    const mx = (minX + maxX) / 2, my = (minY + maxY) / 2;
    const P = pts.slice();
    P.push({ x: mx - 20 * dm, y: my - dm }, { x: mx, y: my + 20 * dm }, { x: mx + 20 * dm, y: my - dm });

    const tri = (a, b, c) => {
      const A = P[a], B = P[b], C = P[c];
      const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
      if (Math.abs(d) < 1e-9) return { a, b, c, x: 0, y: 0, r2: -1 };
      const a2 = A.x * A.x + A.y * A.y, b2 = B.x * B.x + B.y * B.y, c2 = C.x * C.x + C.y * C.y;
      const x = (a2 * (B.y - C.y) + b2 * (C.y - A.y) + c2 * (A.y - B.y)) / d;
      const y = (a2 * (C.x - B.x) + b2 * (A.x - C.x) + c2 * (B.x - A.x)) / d;
      return { a, b, c, x, y, r2: (A.x - x) ** 2 + (A.y - y) ** 2 };
    };
    const key = (u, v) => (u < v ? u + ',' + v : v + ',' + u);

    let tris = [tri(n, n + 1, n + 2)];
    for (let i = 0; i < n; i++) {
      const p = P[i];
      const keep = [];
      const poly = new Map();
      for (const t of tris) {
        const dx = p.x - t.x, dy = p.y - t.y;
        if (dx * dx + dy * dy < t.r2) {
          for (const [u, v] of [[t.a, t.b], [t.b, t.c], [t.c, t.a]]) {
            const k = key(u, v);
            poly.set(k, poly.has(k) ? null : [u, v]);
          }
        } else keep.push(t);
      }
      for (const e of poly.values()) if (e) keep.push(tri(e[0], e[1], i));
      tris = keep;
    }
    const out = new Map();
    for (const t of tris) {
      if (t.a >= n || t.b >= n || t.c >= n) continue;
      for (const [u, v] of [[t.a, t.b], [t.b, t.c], [t.c, t.a]]) {
        const k = key(u, v);
        if (!out.has(k)) out.set(k, [Math.min(u, v), Math.max(u, v)]);
      }
    }
    return [...out.values()];
  }

  /* 互斥鬆弛：把過近的圓推開，大圓移動較少 */
  function relax(pos, radii, inner, gap, iters = 90) {
    const n = pos.length;
    const clamp = i => {
      const r = radii[i], p = pos[i];
      p.x = inner.w > 2 * r ? Math.min(Math.max(p.x, inner.x + r), inner.x + inner.w - r) : inner.x + inner.w / 2;
      p.y = inner.h > 2 * r ? Math.min(Math.max(p.y, inner.y + r), inner.y + inner.h - r) : inner.y + inner.h / 2;
    };
    for (let i = 0; i < n; i++) clamp(i);
    for (let it = 0; it < iters; it++) {
      let moved = false;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = pos[j].x - pos[i].x, dy = pos[j].y - pos[i].y;
          const d = Math.hypot(dx, dy);
          const min = radii[i] + radii[j] + gap;
          if (d >= min) continue;
          let ux, uy;
          if (d < 1e-6) { const ang = i * 7.3 + j * 3.1; ux = Math.cos(ang); uy = Math.sin(ang); }
          else { ux = dx / d; uy = dy / d; }
          const ai = radii[i] ** 2, aj = radii[j] ** 2;
          const over = min - d;
          const wi = aj / (ai + aj), wj = ai / (ai + aj);
          pos[i].x -= ux * over * wi; pos[i].y -= uy * over * wi;
          pos[j].x += ux * over * wj; pos[j].y += uy * over * wj;
          moved = true;
        }
      }
      for (let i = 0; i < n; i++) clamp(i);
      if (!moved) break;
    }
  }

  /* ===== <ui-node> ===== */
  class UINode extends HTMLElement {
    static get observedAttributes() { return ['icon', 'size', 'color', 'fill', 'href', 'target']; }
    attributeChangedCallback(name, oldV, newV) {
      if (oldV === newV) return;
      const net = this.parentElement;
      if (net && net.tagName === 'UI-NETWORK' && net._ready) net._schedule(name === 'size' ? 'resize' : 'paint');
    }
  }

  /* ===== <ui-network> ===== */
  class UINetwork extends HTMLElement {
    static get observedAttributes() {
      return ['seed', 'density', 'padding', 'height', 'ratio', 'fixed-size', 'bg-from', 'bg-to',
        'line-color', 'line-active', 'line-width', 'node-fill', 'float', 'animate', 'random-black'];
    }
    static get palette() { return PALETTE; }

    constructor() {
      super();
      this._ready = false;
      this._nodes = [];
      this._norm = null;
      this._pos = [];
      this._radii = [];
      this._phantoms = [];
      this._edges = [];
      this._lineEls = [];
      this._adj = [];
      this._float = [];
      this._floatT = null;
      this._w = 0; this._h = 0;
      this._raf = 0; this._schedRaf = 0; this._pending = null;
      this._alerts = new Set();
      this._autoSeed = String((Math.random() * 4294967296) >>> 0);
      this._seedOverride = null;
      this._hoverNode = null;
      this._randColors = null;
      this._randKey = '';
    }

    /* ---- 公開 API ---- */
    get currentSeed() { return this._seedOverride ?? this.getAttribute('seed') ?? this._autoSeed; }

    shuffle(seed) {
      this._seedOverride = seed != null && String(seed).trim() !== '' ? String(seed).trim() : String((Math.random() * 4294967296) >>> 0);
      if (this._ready) this._schedule('rebuild');
      return this._seedOverride;
    }

    refresh() { if (this._ready) this._schedule('rebuild'); }

    /* ---- 生命週期 ---- */
    connectedCallback() {
      injectStyle();
      const start = () => { if (!this._ready && this.isConnected) this._init(); };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
      else start();
    }

    disconnectedCallback() {
      this._ro && this._ro.disconnect();
      this._mo && this._mo.disconnect();
      cancelAnimationFrame(this._raf); this._raf = 0;
      cancelAnimationFrame(this._schedRaf); this._schedRaf = 0;
      this._ready = false;
    }

    attributeChangedCallback(name, oldV, newV) {
      if (oldV === newV || !this._ready) return;
      switch (name) {
        case 'seed': this._seedOverride = null; this._schedule('rebuild'); break;
        case 'density': this._schedule('edges'); break;
        case 'padding': case 'height': case 'ratio': case 'fixed-size': this._schedule('resize'); break;
        case 'bg-from': case 'bg-to': this._applyBackground(); break;
        case 'float': this._toggleFloat(); break;
        case 'animate': break;
        default: this._schedule('paint');
      }
    }

    _init() {
      this._ready = true;
      const old = this.querySelector(':scope > svg.un-lines');
      if (old) old.remove();
      this._svg = document.createElementNS(NS, 'svg');
      this._svg.setAttribute('class', 'un-lines');
      this._svg.setAttribute('aria-hidden', 'true');
      this.prepend(this._svg);
      this._applyBackground();
      this._bindEvents();

      this._ro = new ResizeObserver(() => {
        if (!this._norm) { this._schedule('rebuild'); return; }
        if (Math.round(this.clientWidth) !== this._w) this._schedule('resize');
      });
      this._ro.observe(this);

      this._mo = new MutationObserver(muts => {
        const hit = muts.some(m => [...m.addedNodes, ...m.removedNodes].some(n => n.nodeName === 'UI-NODE'));
        if (hit) this._schedule('rebuild');
      });
      this._mo.observe(this, { childList: true });

      this._run('rebuild');
      this._toggleFloat();
    }

    /* ---- 排程：同一畫格內合併多次變更 ---- */
    _schedule(kind) {
      const rank = { paint: 1, edges: 2, resize: 3, rebuild: 4 };
      if (!this._pending || rank[kind] > rank[this._pending]) this._pending = kind;
      if (this._schedRaf) return;
      this._schedRaf = requestAnimationFrame(() => {
        this._schedRaf = 0;
        const k = this._pending;
        this._pending = null;
        if (this._ready) this._run(k);
      });
    }

    _run(kind) {
      if (kind === 'rebuild') {
        this._nodes = [...this.children].filter(c => c.tagName === 'UI-NODE');
        this._norm = null;
      }
      if (kind === 'rebuild' || kind === 'resize') {
        this._measure();
        if (!this._w) return;
        this._metrics();
        if (!this._norm || this._norm.length !== this._nodes.length) this._randomize();
        this._layout();
      }
      if (!this._w) return;
      if (kind === 'paint') {
        this._applyVars();
        this._nodes.forEach((_, i) => this._paintNode(i));
      } else {
        this._triangulate();
        this._render(kind === 'rebuild' && this.getAttribute('animate') !== 'off');
        this.dispatchEvent(new CustomEvent('network-render', {
          bubbles: true,
          detail: { seed: this.currentSeed, nodes: this._nodes.length, edges: this._edges.length }
        }));
      }
      this._whenLoaded(() => this._validateIcons());
    }

    /* ---- 量測與尺寸 ---- */
    _measure() {
      const w = Math.round(this.clientWidth);
      let h;
      const ha = parseFloat(this.getAttribute('height'));
      if (ha > 0) h = Math.round(ha);
      else {
        const [a, b] = parseRatio(this.getAttribute('ratio'));
        h = Math.round(w * b / a);
      }
      if (w > 0) this.style.height = h + 'px';
      this._w = w; this._h = h;
    }

    _metrics() {
      const w = this._w, h = this._h;
      const pad = parsePadding(this.getAttribute('padding') ?? '40');
      const inner = { x: pad.l, y: pad.t, w: Math.max(1, w - pad.l - pad.r), h: Math.max(1, h - pad.t - pad.b) };
      const fixed = this.hasAttribute('fixed-size');
      let scale = fixed ? 1 : Math.min(1.3, Math.max(0.5, w / REF_WIDTH));

      const diam = this._nodes.map(el => {
        const raw = (el.getAttribute('size') || 'md').trim().toLowerCase();
        if (SIZE_PRESETS[raw]) return SIZE_PRESETS[raw];
        const num = parseFloat(raw);
        if (num > 0) return num;
        this._alert(`尺寸「${raw}」無法辨識，已改用 md。可用值為 xs、sm、md、lg、xl 或直徑數字。`, 'warning');
        return SIZE_PRESETS.md;
      });
      let radii = diam.map(d => d * scale / 2);

      if (!fixed) {
        const area = radii.reduce((s, r) => s + Math.PI * r * r, 0);
        const fill = area / (inner.w * inner.h);
        if (fill > MAX_FILL) {
          const k = Math.sqrt(MAX_FILL / fill);
          radii = radii.map(r => r * k);
          scale *= k;
        }
      }
      const cap = Math.min(inner.w, inner.h) / 2;
      radii = radii.map(r => Math.min(r, cap));

      this._m = { pad, inner, scale };
      this._radii = radii;
      this._gap = 18 * scale;
    }

    /* ---- 隨機排列（最佳候選取樣） ---- */
    _randomize() {
      const rng = mulberry32(hashSeed(this.currentSeed));
      const { inner, scale } = this._m;
      const radii = this._radii;
      const n = this._nodes.length;
      const order = [...Array(n).keys()].sort((a, b) => radii[b] - radii[a]);
      const placed = [];
      const norm = new Array(n);
      const tries = Math.min(120, 30 + n * 3);

      for (const idx of order) {
        const r = radii[idx];
        let best = null, bestScore = -Infinity;
        for (let t = 0; t < tries; t++) {
          const x = inner.w > 2 * r ? inner.x + r + rng() * (inner.w - 2 * r) : inner.x + inner.w / 2;
          const y = inner.h > 2 * r ? inner.y + r + rng() * (inner.h - 2 * r) : inner.y + inner.h / 2;
          if (!placed.length) { best = { x, y }; break; }
          let score = Infinity;
          for (const p of placed) score = Math.min(score, Math.hypot(x - p.x, y - p.y) - r - p.r);
          const edgeGap = Math.min(x - inner.x - r, inner.x + inner.w - r - x, y - inner.y - r, inner.y + inner.h - r - y);
          score = Math.min(score, edgeGap * 1.5 + 20 * scale);
          if (score > bestScore) { bestScore = score; best = { x, y }; }
        }
        placed.push({ x: best.x, y: best.y, r });
        norm[idx] = { nx: (best.x - inner.x) / inner.w, ny: (best.y - inner.y) / inner.h };
      }
      this._norm = norm;

      /* 漂浮參數 */
      this._float = this._nodes.map(() => ({ ph: rng() * Math.PI * 2, amp: 3 + rng() * 5, sp: 0.5 + rng() * 0.5 }));

      /* 畫布外的虛擬錨點，讓線條自然延伸出邊界 */
      const w = this._w, h = this._h;
      const ph = [];
      const cx = Math.max(3, Math.round(w / 240)), cy = Math.max(2, Math.round(h / 200));
      for (let i = 0; i < cx; i++) {
        ph.push({ fx: (i + 0.5 + (rng() - 0.5) * 0.7) / cx, fy: -(0.04 + rng() * 0.1) });
        ph.push({ fx: (i + 0.5 + (rng() - 0.5) * 0.7) / cx, fy: 1.04 + rng() * 0.1 });
      }
      for (let i = 0; i < cy; i++) {
        ph.push({ fx: -(0.03 + rng() * 0.07), fy: (i + 0.5 + (rng() - 0.5) * 0.7) / cy });
        ph.push({ fx: 1.03 + rng() * 0.07, fy: (i + 0.5 + (rng() - 0.5) * 0.7) / cy });
      }
      ph.push({ fx: -0.06, fy: -0.08 }, { fx: 1.06, fy: -0.08 }, { fx: -0.06, fy: 1.08 }, { fx: 1.06, fy: 1.08 });
      this._phantoms = ph;
    }

    _layout() {
      const { inner } = this._m;
      const pos = this._norm.map(p => ({ x: inner.x + p.nx * inner.w, y: inner.y + p.ny * inner.h }));
      relax(pos, this._radii, inner, this._gap);
      this._pos = pos;

      const n = pos.length;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y) < this._radii[i] + this._radii[j] - 1) {
            this._alert('可用空間不足，部分圓圈發生重疊。請減少節點、縮小尺寸，或調整 padding 與高度。', 'warning');
            return;
          }
        }
      }
    }

    _phantomPx() { return this._phantoms.map(p => ({ x: p.fx * this._w, y: p.fy * this._h })); }

    /* ---- 連線 ---- */
    _triangulate() {
      const n = this._nodes.length;
      const pts = this._pos.concat(this._phantomPx());
      const all = delaunayEdges(pts);
      const len = (a, b) => Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);

      const nn = all.filter(([a, b]) => a < n && b < n).map(([a, b]) => len(a, b)).sort((x, y) => x - y);
      const base = nn.length ? nn[Math.floor(nn.length / 2)] : Math.hypot(this._w, this._h) / 4;
      const factor = DENSITY[(this.getAttribute('density') || 'normal').trim()] || DENSITY.normal;
      const limit = base * factor;

      const occluded = (a, b) => {
        for (let k = 0; k < n; k++) {
          if (k === a || k === b) continue;
          if (segDist(pts[k], pts[a], pts[b]) < this._radii[k] * 0.85) return true;
        }
        return false;
      };

      const edges = [];
      const deg = new Array(n).fill(0);
      const cands = [];
      for (const [a, b] of all) {
        if (a >= n && b >= n) continue;
        const L = len(a, b);
        cands.push({ a, b, L });
        if (L > limit * (a >= n || b >= n ? 1.15 : 1)) continue;
        if (occluded(a, b)) continue;
        edges.push({ a, b });
        if (a < n) deg[a]++;
        if (b < n) deg[b]++;
      }
      for (let i = 0; i < n; i++) {
        if (deg[i]) continue;
        const best = cands.filter(c => c.a === i || c.b === i).sort((x, y) => x.L - y.L)[0];
        if (best) { edges.push({ a: best.a, b: best.b }); deg[i]++; }
      }
      this._edges = edges;
    }

    _applyBackground() {
      const from = this._color(this.getAttribute('bg-from'), 'blue');
      const to = this._color(this.getAttribute('bg-to'), 'bg-alternative');
      this.style.background = `radial-gradient(ellipse 80% 100% at 32% 48%, ${from} -25%, ${to} 90%)`;
    }

    _applyVars() {
      const line = this._rgba(this.getAttribute('line-color'), 'shell');
      if (!line.explicit) line.a = LINE_OPACITY;   // 未明確指定透明度時套用預設值
      this.style.setProperty('--un-line', toCss(line));
      this.style.setProperty('--un-line-active', this._color(this.getAttribute('line-active'), 'key'));
      const lw = parseFloat(this.getAttribute('line-width'));
      this.style.setProperty('--un-lw', (lw > 0 ? lw : 1.5) + 'px');
    }

    /* 解析顏色屬性；無法辨識時提示並改用預設色，透明度低於 0.78 時提示並調整為 0.78 */
    _rgba(value, fallback) {
      const raw = (value || '').trim();
      const fb = () => ({ ...parseColor(fallback), explicit: false });
      if (!raw) return fb();
      const c = parseColor(raw);
      if (!c) {
        this._alert(`顏色「${raw}」無法辨識，已改用預設色 ${fallback}。可用色票名稱、#RGB、#RRGGBB、#RRGGBBAA、rgb() 或 rgba()。`, 'warning');
        return fb();
      }
      if (c.a < MIN_ALPHA) {
        this._alert(`顏色「${raw}」的透明度 ${+c.a.toFixed(2)} 低於 ${MIN_ALPHA}，已調整為 ${MIN_ALPHA}。`, 'warning');
        c.a = MIN_ALPHA;
      }
      return c;
    }

    _color(value, fallback) { return toCss(this._rgba(value, fallback)); }

    _framePts() {
      const t = this._floatT;
      const s = this._m ? this._m.scale : 1;
      const nodes = this._pos.map((p, i) => {
        if (t == null || !this._float[i]) return p;
        const f = this._float[i];
        return {
          x: p.x + f.amp * s * Math.sin(t * f.sp + f.ph),
          y: p.y + f.amp * s * Math.cos(t * f.sp * 0.83 + f.ph * 1.7)
        };
      });
      return nodes.concat(this._phantomPx());
    }

    _render(animate) {
      const w = this._w, h = this._h;
      this._applyVars();
      this._svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      this._svg.replaceChildren();
      const pts = this._framePts();
      const n = this._nodes.length;
      this._adj = this._nodes.map(() => []);

      this._lineEls = this._edges.map((e, i) => {
        const l = document.createElementNS(NS, 'line');
        l.setAttribute('class', 'un-line');
        const A = pts[e.a], B = pts[e.b];
        l.setAttribute('x1', A.x); l.setAttribute('y1', A.y);
        l.setAttribute('x2', B.x); l.setAttribute('y2', B.y);
        if (animate) {
          const L = Math.hypot(A.x - B.x, A.y - B.y) + 40;
          l.style.setProperty('--un-len', L + 'px');
          l.style.strokeDasharray = L + 'px';
          l.style.animationDelay = Math.round(250 + ((A.x + B.x) / 2 / w) * 900) + 'ms';
          l.classList.add('is-draw');
          l.addEventListener('animationend', () => {
            l.classList.remove('is-draw');
            l.style.strokeDasharray = '';
            l.style.removeProperty('--un-len');
          }, { once: true });
        }
        if (e.a < n) this._adj[e.a].push(i);
        if (e.b < n) this._adj[e.b].push(i);
        this._svg.append(l);
        return l;
      });

      this._nodes.forEach((el, i) => {
        this._paintNode(i);
        const r = this._radii[i];
        el.style.transform = `translate(${pts[i].x - r}px, ${pts[i].y - r}px)`;
        if (animate) {
          const link = el._unLink;
          link.classList.remove('is-pop');
          void link.offsetWidth;
          link.style.animationDelay = Math.round((pts[i].x / w) * 700) + 'ms';
          link.classList.add('is-pop');
        }
      });
      this._hoverNode = null;
    }

    _paintNode(i) {
      const el = this._nodes[i];
      const r = this._radii[i];
      if (!el || r == null) return;
      const icon = (el.getAttribute('icon') || 'circle').trim().replace(/^bi-/, '');
      const black = this.hasAttribute('random-black');
      const color = black ? this._randomColor(i) : this._color(el.getAttribute('color'), AUTO_COLORS[i % AUTO_COLORS.length]);
      const fill = black ? BLACK_FILL : this._color(el.getAttribute('fill') || this.getAttribute('node-fill'), 'vanilla');
      const href = el.getAttribute('href');
      const tag = href ? 'a' : 'span';

      let link = el._unLink;
      if (!link || link.parentNode !== el || link.tagName.toLowerCase() !== tag) {
        el.replaceChildren();
        link = document.createElement(tag);
        link.className = 'un-link';
        link.append(document.createElement('i'));
        el.append(link);
        el._unLink = link;
      }
      if (href) {
        link.setAttribute('href', href);
        const target = el.getAttribute('target');
        if (target) link.setAttribute('target', target); else link.removeAttribute('target');
        if (target === '_blank') link.setAttribute('rel', 'noopener noreferrer'); else link.removeAttribute('rel');
      }
      const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const d = r * 2;
      el.style.width = d + 'px';
      el.style.height = d + 'px';
      link.style.background = fill;
      const ic = link.firstElementChild;
      ic.className = `bi bi-${icon}`;
      ic.style.color = color;
      ic.style.fontSize = (d * ICON_RATIO / rootPx).toFixed(3) + 'rem';
    }

    /*
     * random-black 模式的圖示色：依種子產生，相同種子得到相同配色。
     * 色相以黃金角間隔分散，避免相鄰節點顏色太接近；亮度與飽和度限制在黑底上清楚可辨的範圍。
     */
    _randomColor(i) {
      const n = this._nodes.length;
      const key = this.currentSeed + ':' + n;
      if (!this._randColors || this._randKey !== key) {
        const rng = mulberry32(hashSeed(this.currentSeed + ':random-black'));
        const start = rng() * 360;
        this._randColors = Array.from({ length: n }, (_, k) => {
          const h = (start + k * 137.508 + (rng() - 0.5) * 24 + 360) % 360;
          const sat = 68 + rng() * 24;
          const light = 58 + rng() * 14;
          return `hsl(${h.toFixed(1)}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%)`;
        });
        this._randKey = key;
      }
      return this._randColors[i];
    }

    _toggleFloat() {
      const on = this._ready && this.hasAttribute('float');
      if (on && !this._raf) {
        const tick = ms => {
          this._raf = requestAnimationFrame(tick);
          if (document.hidden || !this._pos.length) return;
          this._floatT = ms / 1000;
          this._applyFrame();
        };
        this._raf = requestAnimationFrame(tick);
      } else if (!on && this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = 0;
        this._floatT = null;
        this._applyFrame();
      }
    }

    _applyFrame() {
      const pts = this._framePts();
      this._nodes.forEach((el, i) => {
        const r = this._radii[i];
        if (pts[i] && r != null) el.style.transform = `translate(${pts[i].x - r}px, ${pts[i].y - r}px)`;
      });
      this._edges.forEach((e, i) => {
        const l = this._lineEls[i];
        if (!l) return;
        const A = pts[e.a], B = pts[e.b];
        l.setAttribute('x1', A.x); l.setAttribute('y1', A.y);
        l.setAttribute('x2', B.x); l.setAttribute('y2', B.y);
      });
    }

    _bindEvents() {
      if (this._bound) return;
      this._bound = true;

      this.addEventListener('mouseover', e => {
        const node = e.target.closest('ui-node');
        this._setHover(node && node.parentElement === this ? node : null);
      });
      this.addEventListener('mouseleave', () => this._setHover(null));

      this.addEventListener('click', e => {
        const node = e.target.closest('ui-node');
        if (!node || node.parentElement !== this) return;
        const index = this._nodes.indexOf(node);
        const href = node.getAttribute('href');
        const ev = new CustomEvent('node-click', {
          bubbles: true, cancelable: true,
          detail: { index, node, icon: node.getAttribute('icon'), href }
        });
        if (!this.dispatchEvent(ev)) { e.preventDefault(); return; }
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const id = decodeURIComponent(href.slice(1));
          const target = id ? document.getElementById(id) : null;
          if (!target) {
            this._alert(`找不到書籤「${href}」，請確認頁面上有對應 id 的元素。`, 'warning');
            return;
          }
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', href);
        }
      });
    }

    _setHover(node) {
      if (node === this._hoverNode) return;
      if (this._hoverNode) {
        const prev = this._nodes.indexOf(this._hoverNode);
        (this._adj[prev] || []).forEach(li => this._lineEls[li] && this._lineEls[li].classList.remove('is-active'));
      }
      this._hoverNode = node;
      if (node) {
        const idx = this._nodes.indexOf(node);
        (this._adj[idx] || []).forEach(li => this._lineEls[li] && this._lineEls[li].classList.add('is-active'));
      }
    }

    /* ---- 圖示檢查與提示訊息 ---- */
    _whenLoaded(fn) {
      if (document.readyState === 'complete') requestAnimationFrame(fn);
      else window.addEventListener('load', () => fn(), { once: true });
    }

    _validateIcons() {
      if (!this._ready) return;
      const has = el => {
        const c = getComputedStyle(el, '::before').content;
        return !!c && c !== 'none' && c !== 'normal' && c !== '""';
      };
      const probe = document.createElement('i');
      probe.className = 'bi bi-circle';
      probe.style.position = 'absolute';
      probe.style.left = '-9999px';
      document.body.append(probe);
      const loaded = has(probe);
      probe.remove();
      if (!loaded) {
        this._alert('未偵測到 Bootstrap Icons 樣式表，圖示無法顯示，請確認已載入 bootstrap-icons.css。', 'danger');
        return;
      }
      const bad = new Set();
      this._nodes.forEach(n => {
        const ic = n._unLink && n._unLink.firstElementChild;
        if (ic && !has(ic)) bad.add((n.getAttribute('icon') || '').trim() || '(空白)');
      });
      if (bad.size) this._alert(`以下圖示名稱在 Bootstrap Icons 中不存在：${[...bad].join('、')}。`, 'warning');
    }

    _alert(msg, type = 'warning') {
      if (this._alerts.has(msg)) return;
      this._alerts.add(msg);
      if (!this._alertBox || !this._alertBox.isConnected) {
        this._alertBox = document.createElement('div');
        this._alertBox.className = 'un-alert-box';
        this.before(this._alertBox);
      }
      const el = document.createElement('div');
      el.className = `alert alert-${type} alert-dismissible un-alert`;
      el.setAttribute('role', 'alert');
      const icon = document.createElement('i');
      icon.className = type === 'danger' ? 'bi bi-x-octagon-fill' : 'bi bi-exclamation-triangle-fill';
      const text = document.createElement('span');
      text.textContent = msg;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-close';
      btn.setAttribute('aria-label', '關閉');
      btn.addEventListener('click', () => { el.remove(); this._alerts.delete(msg); });
      el.append(icon, text, btn);
      this._alertBox.append(el);
    }
  }

  window.customElements.define('ui-node', UINode);
  window.customElements.define('ui-network', UINetwork);
})();
