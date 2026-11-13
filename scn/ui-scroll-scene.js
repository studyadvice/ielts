(() => {
  'use strict';
  if (window.customElements.get('ui-scroll-scene')) return;

  /* 色票：顏色屬性可直接寫名稱，例如 accent="dreamy" */
  const PALETTE = {
    base: '#0C0D0C',  /* 與 ui-insight 一致的頁面底色名稱 */
    'background': '#0C0D0C', 'shell': '#C6C7BD', 'vanilla': '#DBEDD8', 'yellow': '#E3D322',
    'pink': '#FF91D7', 'red': '#EF6661', 'green': '#71CD76',
    'blue': '#5DBAE8', 'indigo': '#778CE1', 'violet': '#B484E8', 'gray': '#86877F',
    'key': '#51DBCF', 'calm': '#A3C4BC', 'quiet': '#8EA4DE',
    'playful': '#FFA987', 'urgent': '#FF2E63', 'energetic': '#B6FF00', 'dreamy': '#DE8EC9', 'bg-alternative': '#3B2A20'
  };

  /* 漸層預設集：與 ui-screen 相同 */
  const PRESETS = {
    warm: ['yellow', 'playful', 'pink'], cool: ['blue', 'indigo', 'violet'],
    fresh: ['green', 'key', 'blue'], deep: ['key', 'bg-alternative'],
    candy: ['pink', 'violet', 'quiet'], fire: ['urgent', 'playful', 'yellow'],
    mist: ['calm', 'quiet', 'vanilla'], sunset: ['playful', 'pink', 'indigo']
  };

  const ATTRS = [
    'stage-side', 'stage-width', 'stage-top', 'stage-height', 'gap', 'trigger', 'scroll', 'height',
    'step-style', 'step-min-height', 'step-gap', 'lead', 'tail', 'numbered', 'accent', 'nav',
    'layer-transition', 'layer-padding', 'transition', 'dim', 'focus-style', 'focus-padding',
    'zoom-max', 'zoom-padding', 'stage-bg', 'border-width', 'border-color', 'border-gradient',
    'border-gradient-angle', 'border-gradient-type', 'radius', 'shadow'
  ];

  const EASE = 'cubic-bezier(.22,.8,.3,1)';
  const S = 'ui-scroll-scene';
  const CSS = `
${S}{display:grid;position:relative;column-gap:var(--scs-gap,48px);align-items:start;--scs-vh:100vh;--scs-top:24px;--scs-accent:#51DBCF;--scs-ms:600ms;}
${S}[scroll="self"]{overflow-y:auto;overscroll-behavior:contain;}
${S} > scene-stage{grid-area:stage;display:block;position:sticky;top:var(--scs-top);height:var(--scs-stage-h, calc(var(--scs-vh) - var(--scs-top) - 24px));z-index:1;min-width:0;}
${S} > .scs-steps{grid-area:steps;display:flex;flex-direction:column;gap:var(--scs-step-gap,24px);padding-top:var(--scs-lead, calc(var(--scs-vh) * .3));padding-bottom:var(--scs-tail, calc(var(--scs-vh) * .45));min-width:0;}
${S} > scene-stage > .scs-frame{position:relative;height:100%;box-sizing:border-box;padding:var(--scs-bw,0px);border-radius:var(--scs-radius,16px);background:var(--scs-border,transparent);box-shadow:var(--scs-shadow,none);}
.scs-frame > .scs-view{position:relative;width:100%;height:100%;overflow:hidden;border-radius:max(0px, calc(var(--scs-radius,16px) - var(--scs-bw,0px)));background:var(--scs-stage-bg,#0C0D0C);}
.scs-view > .scs-canvas{position:absolute;left:0;top:0;width:100%;min-height:100%;transform-origin:0 0;transition:transform var(--scs-ms) ${EASE};}
.scs-view > .scs-canvas[data-layers]{height:100%;}
.scs-canvas > scene-layer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;box-sizing:border-box;padding:var(--scs-layer-pad,32px);opacity:0;visibility:hidden;transition:opacity var(--scs-ms) ease,transform var(--scs-ms) ${EASE},visibility 0s linear var(--scs-ms);}
.scs-canvas > scene-layer[align="start"]{align-items:stretch;justify-content:flex-start;}
.scs-canvas > scene-layer[data-tr="slide"]{transform:translateY(48px);}
.scs-canvas > scene-layer[data-tr="zoom"]{transform:scale(.92);}
.scs-canvas > scene-layer[data-tr="none"]{transition:none;}
.scs-canvas > scene-layer.scs-on{opacity:1;visibility:visible;transform:none;transition:opacity var(--scs-ms) ease,transform var(--scs-ms) ${EASE},visibility 0s;}
.scs-canvas > scene-layer > img,.scs-canvas > scene-layer > svg,.scs-canvas > scene-layer > video{max-width:100%;max-height:100%;}
.scs-canvas > .scs-dim{position:absolute;left:0;top:0;pointer-events:none;opacity:0;transition:opacity .35s ease;z-index:5;overflow:visible;}
.scs-canvas > .scs-dim.scs-on{opacity:1;}
.scs-dim .scs-hole{transition:x var(--scs-ms) ${EASE},y var(--scs-ms) ${EASE},width var(--scs-ms) ${EASE},height var(--scs-ms) ${EASE};}
scene-stage > .scs-frame > .scs-nav{position:absolute;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;padding:12px 8px;border-radius:999px;background:rgba(12,13,12,0.86);z-index:6;}
scene-stage[data-side="left"] > .scs-frame > .scs-nav{right:14px;}
scene-stage[data-side="right"] > .scs-frame > .scs-nav{left:14px;}
.scs-nav[data-type="none"]{display:none;}
.scs-nav > button{width:10px;height:10px;border-radius:999px;border:0;padding:0;background:#86877F;cursor:pointer;transition:height .3s ease,background .3s ease;}
.scs-nav > button:hover{background:#DBEDD8;}
.scs-nav > button.scs-on{height:28px;background:var(--scs-accent);}
.scs-nav[data-type="bar"]{padding:6px;height:46%;}
.scs-nav[data-type="bar"] > .scs-bar{position:relative;width:6px;height:100%;border-radius:999px;background:#86877F;overflow:hidden;}
.scs-nav[data-type="bar"] > .scs-bar > i{position:absolute;left:0;top:0;width:100%;height:var(--scs-p,0%);background:var(--scs-accent);border-radius:999px;}
.scs-steps > scene-step{display:block;position:relative;min-height:var(--scs-step-h, calc(var(--scs-vh) * .6));transition:filter .45s ease;}
.scs-steps > scene-step:not(.scs-on){filter:grayscale(.7) brightness(.62);}
.scs-steps > scene-step > .scs-card{box-sizing:border-box;transition:border-color .4s ease,box-shadow .4s ease;}
.scs-steps[data-style="card"] > scene-step > .scs-card{padding:24px 28px;border:1px solid #86877F;border-radius:16px;background:#0C0D0C;}
.scs-steps[data-style="card"] > scene-step.scs-on > .scs-card{border-color:var(--scs-accent);box-shadow:inset 4px 0 0 var(--scs-accent);}
.scs-steps[data-style="line"] > scene-step > .scs-card{padding:4px 0 4px 24px;border-left:3px solid #86877F;}
.scs-steps[data-style="line"] > scene-step.scs-on > .scs-card{border-left-color:var(--scs-accent);}
.scs-card > .scs-num{display:none;margin-bottom:8px;font-size:.85rem;font-weight:800;letter-spacing:.1em;color:var(--scs-accent);}
${S}[numbered] > .scs-steps > scene-step > .scs-card > .scs-num{display:block;}
`;

  /* ---------- 共用工具 ---------- */
  const injectStyle = () => {
    if (document.getElementById('ui-scroll-scene-style')) return;
    const s = document.createElement('style');
    s.id = 'ui-scroll-scene-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  };

  const splitTop = (str) => {
    const out = [];
    let depth = 0, buf = '';
    for (const ch of str) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { out.push(buf.trim()); buf = ''; } else buf += ch;
    }
    if (buf.trim()) out.push(buf.trim());
    return out;
  };

  const color = (v) => {
    if (v === null || v === undefined || v === '') return '';
    return String(v).trim().replace(/^[a-z][a-z-]*/i, (m) => PALETTE[m.toLowerCase()] ?? m);
  };

  const gradient = (value, angle, type) => {
    if (!value) return '';
    const v = value.trim();
    if (/^(repeating-)?(linear|radial|conic)-gradient\(/i.test(v)) return v;
    const stops = (PRESETS[v.toLowerCase()] || splitTop(v)).map(color);
    if (stops.length === 1) stops.push(stops[0]);
    const a = Number.isFinite(parseFloat(angle)) ? parseFloat(angle) : 135;
    if (type === 'conic') {
      const first = stops[0].replace(/\s+-?[\d.]+(%|px|deg)?$/, '');
      return `conic-gradient(from ${a}deg, ${stops.join(', ')}, ${first})`;
    }
    if (type === 'radial') return `radial-gradient(circle at center, ${stops.join(', ')})`;
    return `linear-gradient(${a}deg, ${stops.join(', ')})`;
  };

  const len = (v, unit = 'px') => {
    if (v === null || v === undefined || v === '') return '';
    const s = String(v).trim();
    return /^-?[\d.]+$/.test(s) ? s + unit : s;
  };

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const round = (n) => Math.round(n * 100) / 100;
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* set="#a attr=value; #b !attr" */
  const parseSet = (str) => (str || '').split(';').map((s) => s.trim()).filter(Boolean).map((seg) => {
    const m = seg.match(/^(\S+)\s+(!?)([\w:.-]+)(?:=(.*))?$/);
    return m ? { sel: m[1], remove: m[2] === '!', attr: m[3], val: (m[4] ?? '').trim(), els: [] } : null;
  }).filter(Boolean);

  /* scrub="#a attr 0 100 %" */
  const parseScrub = (str) => (str || '').split(';').map((s) => s.trim()).filter(Boolean).map((seg) => {
    const p = seg.split(/\s+/);
    const from = parseFloat(p[2]), to = parseFloat(p[3]);
    if (p.length < 4 || !Number.isFinite(from) || !Number.isFinite(to)) return null;
    return { sel: p[0], attr: p[1], from, to, unit: p[4] || '', els: [] };
  }).filter(Boolean);

  let UID = 0;

  class UIScrollScene extends HTMLElement {
    static get observedAttributes() { return ATTRS; }
    static get presets() { return JSON.parse(JSON.stringify(PRESETS)); }
    static get palette() { return { ...PALETTE }; }

    constructor() {
      super();
      this._built = false;
      this._index = -2;
      this._raf = 0;
      this._uid = ++UID;
      this._steps = [];
      this._layers = [];
      this._orig = new Map();
    }

    connectedCallback() {
      if (this._built) { this._listen(); this._update(true); return; }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._init(), { once: true });
      } else {
        this._init();
      }
    }

    disconnectedCallback() { this._unlisten(); }

    attributeChangedCallback(name, oldV, newV) {
      if (!this._built || oldV === newV) return;
      this._apply();
      this._update(true);
    }

    /* ---------- 公開介面 ---------- */
    get index() { return this._index; }
    get steps() { return this._steps.slice(); }

    goTo(n, { smooth = true } = {}) {
      if (!this._steps.length) return;
      const st = this._steps[clamp(n | 0, 0, this._steps.length - 1)];
      const delta = st.getBoundingClientRect().top - this._triggerY() + 2;
      const root = this._self ? this : window;
      root.scrollBy({ top: delta, behavior: smooth ? 'smooth' : 'auto' });
    }

    next() { this.goTo(Math.max(0, this._index + 1)); }
    prev() { this.goTo(Math.max(0, this._index - 1)); }
    refresh() { if (this._built) { this._apply(); this._update(true); } }

    /* ---------- 建立 ---------- */
    _init() {
      if (this._built) return;
      injectStyle();
      this._build();
      this._built = true;
      this._apply();
      this._resolveTargets();
      this._listen();
      this._update(true);
      window.addEventListener('load', () => this._update(true), { once: true });
    }

    _build() {
      const mk = (tag, cls) => { const d = document.createElement(tag); if (cls) d.className = cls; return d; };
      const stage = this.querySelector(':scope > scene-stage') || document.createElement('scene-stage');
      const steps = Array.from(this.querySelectorAll(':scope > scene-step'));

      this._frame = mk('div', 'scs-frame');
      this._view = mk('div', 'scs-view');
      this._canvas = mk('div', 'scs-canvas');
      while (stage.firstChild) this._canvas.appendChild(stage.firstChild);
      this._layers = Array.from(this._canvas.querySelectorAll(':scope > scene-layer'));
      this._canvas.toggleAttribute('data-layers', this._layers.length > 0);

      /* 聚光遮罩 */
      const svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('class', 'scs-dim');
      const maskId = `scs-mask-${this._uid}`;
      svg.innerHTML = `<defs><mask id="${maskId}" maskUnits="userSpaceOnUse"><rect class="scs-mask-bg" fill="#fff"/></mask></defs>`
        + `<rect class="scs-shade" mask="url(#${maskId})"/><g class="scs-rings"></g>`;
      this._dim = svg;
      this._mask = svg.querySelector('mask');
      this._rings = svg.querySelector('.scs-rings');
      this._canvas.appendChild(svg);

      this._nav = mk('div', 'scs-nav');
      this._view.appendChild(this._canvas);
      this._frame.append(this._view, this._nav);
      stage.appendChild(this._frame);
      this._stage = stage;

      this._stepsWrap = mk('div', 'scs-steps');
      steps.forEach((s, i) => {
        const src = s.getAttribute('source');
        if (src) {
          const t = document.getElementById(src);
          if (t) {
            if (t.content) s.appendChild(t.content.cloneNode(true));
            else Array.from(t.childNodes).forEach((n) => s.appendChild(n.cloneNode(true)));
          }
        }
        const card = mk('div', 'scs-card');
        while (s.firstChild) card.appendChild(s.firstChild);
        const num = mk('span', 'scs-num');
        num.textContent = String(i + 1).padStart(2, '0');
        card.prepend(num);
        s.appendChild(card);
        this._stepsWrap.appendChild(s);
      });
      this._steps = steps;
      this._sets = steps.map((s) => parseSet(s.getAttribute('set')));
      this._scrubs = steps.map((s) => parseScrub(s.getAttribute('scrub')));

      this.append(stage, this._stepsWrap);

      this._ro = new ResizeObserver(() => this._layout());
      this._ro.observe(this._view);
    }

    _apply() {
      const a = (n) => this.getAttribute(n);
      const set = (k, v) => (v ? this.style.setProperty(k, v) : this.style.removeProperty(k));
      const side = a('stage-side') === 'right' ? 'right' : 'left';
      const w = clamp(parseFloat(a('stage-width')) || 55, 20, 80);
      this.style.gridTemplateColumns = side === 'left' ? `${w}% minmax(0,1fr)` : `minmax(0,1fr) ${w}%`;
      this.style.gridTemplateAreas = side === 'left' ? '"stage steps"' : '"steps stage"';
      this._stage.dataset.side = side;

      this._self = a('scroll') === 'self';
      if (this._self) {
        const h = len(a('height') || '600');
        this.style.height = h;
        set('--scs-vh', h);
      } else {
        this.style.height = '';
        set('--scs-vh', '');
      }

      const top = a('stage-top');
      if (top === null || top === 'auto') {
        const sh = this._self ? null : document.querySelector('sticky-head');
        set('--scs-top', (24 + (sh ? Math.round(sh.getBoundingClientRect().height) : 0)) + 'px');
      } else {
        set('--scs-top', len(top));
      }

      set('--scs-stage-h', len(a('stage-height')));
      set('--scs-gap', len(a('gap')));
      set('--scs-step-gap', len(a('step-gap')));
      set('--scs-step-h', len(a('step-min-height')));
      set('--scs-lead', len(a('lead')));
      set('--scs-tail', len(a('tail')));
      set('--scs-accent', color(a('accent')));
      set('--scs-ms', len(a('transition'), 'ms'));
      set('--scs-layer-pad', len(a('layer-padding')));
      set('--scs-bw', len(a('border-width')));
      set('--scs-radius', len(a('radius')));
      set('--scs-border', gradient(a('border-gradient'), a('border-gradient-angle'), a('border-gradient-type') || 'linear') || color(a('border-color')));
      const sh = a('shadow');
      set('--scs-shadow', sh === null ? '' : (sh === '' || sh === 'true' ? '0 24px 48px -20px rgba(12, 13, 12, 0.86)' : sh));
      set('--scs-stage-bg', color(a('stage-bg')));

      const style = a('step-style');
      this._stepsWrap.dataset.style = ['card', 'line', 'plain'].includes(style) ? style : 'card';

      const nav = ['dots', 'bar', 'none'].includes(a('nav')) ? a('nav') : 'dots';
      if (this._nav.dataset.type !== nav) {
        this._nav.dataset.type = nav;
        this._nav.innerHTML = '';
        if (nav === 'dots') {
          this._steps.forEach((s, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.title = s.getAttribute('nav-label') || String(i + 1);
            b.addEventListener('click', () => this.goTo(i));
            this._nav.appendChild(b);
          });
        } else if (nav === 'bar') {
          this._nav.innerHTML = '<div class="scs-bar"><i></i></div>';
        }
      }
    }

    /* 找出 set、scrub 的目標，並記下原始屬性值，往回捲時才能還原 */
    _resolveTargets() {
      const find = (sel) => {
        let list = [];
        try { list = Array.from(this._stage.querySelectorAll(sel)); } catch (_) { return []; }
        if (!list.length) { try { list = Array.from(document.querySelectorAll(sel)); } catch (_) { list = []; } }
        return list;
      };
      const remember = (el, attr) => {
        if (!this._orig.has(el)) this._orig.set(el, new Map());
        const m = this._orig.get(el);
        if (!m.has(attr)) m.set(attr, el.getAttribute(attr));
      };
      [...this._sets, ...this._scrubs].forEach((list) => list.forEach((e) => {
        e.els = find(e.sel);
        e.els.forEach((el) => remember(el, e.attr));
      }));
    }

    /* ---------- 捲動 ---------- */
    _listen() {
      if (this._onScroll) return;
      this._onScroll = () => {
        if (this._raf) return;
        this._raf = requestAnimationFrame(() => { this._raf = 0; this._update(); });
      };
      this._onResize = () => { this._apply(); this._update(true); };
      document.addEventListener('scroll', this._onScroll, { passive: true, capture: true });
      window.addEventListener('resize', this._onResize);
    }

    _unlisten() {
      if (!this._onScroll) return;
      document.removeEventListener('scroll', this._onScroll, { capture: true });
      window.removeEventListener('resize', this._onResize);
      this._onScroll = null;
    }

    _num(name, def) {
      const v = parseFloat(this.getAttribute(name));
      return Number.isFinite(v) ? v : def;
    }

    _ms() { return this._num('transition', 600); }

    _triggerY() {
      const t = clamp(this._num('trigger', 55), 0, 100) / 100;
      if (this._self) { const r = this.getBoundingClientRect(); return r.top + r.height * t; }
      return window.innerHeight * t;
    }

    _update(force = false) {
      const steps = this._steps;
      if (!steps.length) return;
      const trig = this._triggerY();
      let idx = -1;
      for (let i = 0; i < steps.length; i++) {
        if (steps[i].getBoundingClientRect().top <= trig) idx = i; else break;
      }
      let prog = 0;
      if (idx >= 0) {
        const r = steps[idx].getBoundingClientRect();
        prog = clamp((trig - r.top) / Math.max(r.height, 1), 0, 1);
      }
      const changed = idx !== this._index;
      if (changed || force) {
        const prev = this._index;
        this._index = idx;
        this._activate(idx, changed && prev !== -2);
      }
      this._applyAttrs(idx, prog);

      if (this._nav.dataset.type === 'bar') {
        const p = idx < 0 ? 0 : ((idx + prog) / steps.length) * 100;
        this._nav.style.setProperty('--scs-p', round(p) + '%');
      }
      if (idx >= 0 && this._scrubs[idx].length && prog !== this._lastProg) {
        this._lastProg = prog;
        this._emit('scene:progress', { index: idx, progress: round(prog) });
      }
    }

    _activate(idx, emit) {
      this._steps.forEach((s, i) => s.classList.toggle('scs-on', i === idx));
      if (this._nav.dataset.type === 'dots') {
        Array.from(this._nav.children).forEach((b, i) => b.classList.toggle('scs-on', i === idx));
      }

      /* 圖層：取目前為止最後一個 show，沒有則顯示第一層 */
      if (this._layers.length) {
        let id = null, tr = this.getAttribute('layer-transition') || 'fade';
        for (let j = 0; j <= idx; j++) {
          const s = this._steps[j];
          if (s.hasAttribute('show')) { id = s.getAttribute('show'); tr = s.getAttribute('transition') || this.getAttribute('layer-transition') || 'fade'; }
        }
        const target = this._layers.find((l) => l.id === id) || this._layers[0];
        this._layers.forEach((l) => { l.dataset.tr = tr; l.classList.toggle('scs-on', l === target); });
        this._activeLayer = target;
      }

      this._layout();
      clearTimeout(this._layoutT);
      this._layoutT = setTimeout(() => this._layout(), this._ms() + 60);

      if (emit && idx >= 0) {
        const s = this._steps[idx];
        this._emit('scene:enter', { index: idx, id: s.id || '', step: s });
      }
    }

    _applyAttrs(idx, prog) {
      if (!this._orig.size) return;
      const want = new Map();
      const put = (el, attr, val) => {
        if (!want.has(el)) want.set(el, new Map());
        want.get(el).set(attr, val);
      };
      this._orig.forEach((m, el) => m.forEach((v, attr) => put(el, attr, v)));
      for (let j = 0; j <= idx; j++) {
        this._sets[j].forEach((e) => e.els.forEach((el) => put(el, e.attr, e.remove ? null : e.val)));
        this._scrubs[j].forEach((e) => {
          const p = j < idx ? 1 : prog;
          const v = round(e.from + (e.to - e.from) * p) + e.unit;
          e.els.forEach((el) => put(el, e.attr, v));
        });
      }
      want.forEach((m, el) => m.forEach((v, attr) => {
        const cur = el.getAttribute(attr);
        if (v === null) { if (cur !== null) el.removeAttribute(attr); }
        else if (cur !== v) el.setAttribute(attr, v);
      }));
    }

    /* ---------- 舞台：放大、平移、聚光 ---------- */
    _query(sel) {
      if (!sel) return [];
      let list = [];
      try { list = Array.from(this._canvas.querySelectorAll(sel)); } catch (_) { return []; }
      if (this._activeLayer) {
        const inLayer = list.filter((el) => this._activeLayer.contains(el));
        if (inLayer.length) return inLayer;
      }
      return list;
    }

    _box(els) {
      const cr = this._canvas.getBoundingClientRect();
      const k = cr.width / (this._canvas.offsetWidth || 1) || 1;
      let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
      const boxes = els.map((el) => {
        const r = el.getBoundingClientRect();
        const b = { x: (r.left - cr.left) / k, y: (r.top - cr.top) / k, w: r.width / k, h: r.height / k };
        x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
        x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h);
        return b;
      });
      return { boxes, union: boxes.length ? { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } : null };
    }

    _layout() {
      if (!this._canvas) return;
      const step = this._steps[this._index] || null;
      const cv = this._canvas;
      const W = this._view.clientWidth, H = this._view.clientHeight;
      const CW = cv.offsetWidth, CH = cv.offsetHeight;
      const zmax = this._num('zoom-max', 3), pad = this._num('zoom-padding', 24);
      let s = 1, tx = 0, ty = 0, framed = false;

      const zoom = step && step.getAttribute('zoom');
      const pan = step && step.getAttribute('pan');
      if (zoom) {
        const parts = zoom.split(',').map((t) => t.trim());
        if (parts.length === 3 && parts.every((p) => /^-?[\d.]+%?$/.test(p))) {
          s = clamp(parseFloat(parts[2]), 0.2, zmax);
          tx = W / 2 - (parseFloat(parts[0]) / 100) * CW * s;
          ty = H / 2 - (parseFloat(parts[1]) / 100) * CH * s;
          framed = true;
        } else if (/^[\d.]+$/.test(zoom)) {
          s = clamp(parseFloat(zoom), 0.2, zmax);
          tx = W / 2 - (CW / 2) * s;
          ty = H / 2 - (Math.min(CH, H) / 2) * s;
          framed = true;
        } else {
          const u = this._box(this._query(zoom)).union;
          if (u) {
            s = clamp(Math.min(W / (u.w + pad * 2), H / (u.h + pad * 2)), 0.2, zmax);
            tx = W / 2 - (u.x + u.w / 2) * s;
            ty = H / 2 - (u.y + u.h / 2) * s;
            framed = true;
          }
        }
      } else if (pan) {
        const u = this._box(this._query(pan)).union;
        if (u) { ty = H * 0.45 - (u.y + u.h / 2); framed = true; }
      }
      if (framed) {
        if (CW * s >= W) tx = clamp(tx, W - CW * s, 0);
        if (CH * s >= H) ty = clamp(ty, H - CH * s, 0);
        else if (!zoom) ty = 0;
      }
      cv.style.transform = `translate(${round(tx)}px, ${round(ty)}px) scale(${round(s * 1000) / 1000})`;

      /* 聚光 */
      const fsel = step && step.getAttribute('focus');
      const els = this._query(fsel);
      const svg = this._dim;
      svg.setAttribute('width', CW);
      svg.setAttribute('height', CH);
      const bg = this._mask.querySelector('.scs-mask-bg');
      const shade = svg.querySelector('.scs-shade');
      [bg, shade].forEach((r) => { r.setAttribute('width', CW); r.setAttribute('height', CH); });
      shade.setAttribute('fill', color(this.getAttribute('dim')) || 'rgba(12, 13, 12, 0.82)');
      const mode = this.getAttribute('focus-style') || 'both';
      shade.style.display = mode === 'ring' ? 'none' : '';
      this._mask.querySelectorAll('.scs-hole').forEach((n) => n.remove());
      this._rings.innerHTML = '';
      if (els.length) {
        const fp = this._num('focus-padding', 8);
        const accent = color(this.getAttribute('accent')) || '#51DBCF';
        this._box(els).boxes.forEach((b) => {
          const attrs = { x: b.x - fp, y: b.y - fp, width: b.w + fp * 2, height: b.h + fp * 2, rx: 10 };
          const hole = document.createElementNS(SVGNS, 'rect');
          Object.entries(attrs).forEach(([k, v]) => hole.setAttribute(k, round(v)));
          hole.setAttribute('class', 'scs-hole');
          hole.setAttribute('fill', '#000');
          this._mask.appendChild(hole);
          if (mode !== 'spotlight') {
            const ring = hole.cloneNode();
            ring.setAttribute('fill', 'none');
            ring.setAttribute('stroke', accent);
            ring.setAttribute('stroke-width', '2');
            ring.setAttribute('vector-effect', 'non-scaling-stroke');
            this._rings.appendChild(ring);
          }
        });
      }
      svg.classList.toggle('scs-on', els.length > 0);
    }

    _emit(type, detail) {
      this.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));
    }
  }

  window.customElements.define('ui-scroll-scene', UIScrollScene);
  window.UIScrollScene = UIScrollScene;
})();
