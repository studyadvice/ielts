/*!
 * ui-screen.js v1.0.2
 * 分隔線對照元件 <ui-screen>
 * 左右或上下拖曳分隔線，對照兩組以語意標籤定義的內容。
 * 把手圖示使用 Bootstrap Icons 類別名稱，圖示字型由專案自行載入。
 * MIT License
 */
(() => {
  'use strict';
  if (window.customElements.get('ui-screen')) return;

  /* 色票：顏色屬性可直接寫名稱，例如 line-color="dreamy" */
  const PALETTE = {
    'background': '#0C0D0C', 'shell': '#C6C7BD', 'vanilla': '#DBEDD8', 'yellow': '#E3D322',
    'pink': '#FF91D7', 'red': '#EF6661', 'green': '#71CD76',
    'blue': '#5DBAE8', 'indigo': '#778CE1', 'violet': '#B484E8', 'gray': '#86877F',
    'key': '#51DBCF', 'calm': '#A3C4BC', 'quiet': '#8EA4DE',
    'playful': '#FFA987', 'urgent': '#FF2E63', 'energetic': '#B6FF00', 'dreamy': '#DE8EC9', 'bg-alternative': '#3B2A20'
  };

  /* 漸層預設集：全部由色票組合而成 */
  const PRESETS = {
    warm:   ['yellow', 'playful', 'pink'],
    cool:   ['blue', 'indigo', 'violet'],
    fresh:  ['green', 'key', 'blue'],
    deep:   ['key', 'bg-alternative'],
    candy:  ['pink', 'violet', 'quiet'],
    fire:   ['urgent', 'playful', 'yellow'],
    mist:   ['calm', 'quiet', 'vanilla'],
    sunset: ['playful', 'pink', 'indigo']
  };

  const ATTRS = [
    'orientation', 'position', 'min', 'max', 'step', 'snap', 'snap-threshold', 'mode', 'effect',
    'transition', 'intro', 'intro-range', 'intro-duration', 'intro-delay', 'height', 'aspect-ratio',
    'stage-bg', 'border-width', 'border-color', 'border-gradient', 'border-gradient-angle',
    'border-gradient-type', 'radius', 'shadow', 'line-width', 'line-color', 'line-gradient',
    'line-gradient-angle', 'handle-shape', 'handle-size', 'handle-bg', 'handle-gradient',
    'handle-gradient-angle', 'handle-color', 'handle-border-width', 'handle-border-color',
    'handle-offset', 'handle-icon', 'handle-icon-vertical', 'handle-icon-size', 'label-position',
    'label-inset', 'label-size', 'label-radius', 'label-autohide', 'reset-on-leave', 'disabled'
  ];

  const EASE = 'cubic-bezier(.22,.8,.3,1)';
  const CSS = `
ui-screen{display:block;position:relative;--uis-pos:50%;}
ui-screen-handle{display:contents;}
ui-screen > .uis-frame{position:relative;box-sizing:border-box;height:100%;padding:var(--uis-bw,0px);border-radius:var(--uis-radius,0px);background:var(--uis-border,transparent);box-shadow:var(--uis-shadow,none);}
ui-screen > .uis-frame > .uis-stage{position:relative;overflow:hidden;border-radius:max(0px, calc(var(--uis-radius,0px) - var(--uis-bw,0px)));background:var(--uis-stage-bg,#0C0D0C);isolation:isolate;-webkit-user-select:none;user-select:none;}
.uis-stage > ui-screen-before,.uis-stage > ui-screen-after{display:block;overflow:hidden;box-sizing:border-box;background:var(--uis-layer-bg,var(--uis-stage-bg,#0C0D0C));}
.uis-stage > ui-screen-before{position:relative;z-index:1;}
.uis-stage > ui-screen-after{position:absolute;inset:0;z-index:2;}
.uis-stage.uis-fixed > ui-screen-before{position:absolute;inset:0;}
.uis-stage > ui-screen-before > img,.uis-stage > ui-screen-before > video,.uis-stage > ui-screen-after > img,.uis-stage > ui-screen-after > video{display:block;width:100%;height:100%;object-fit:cover;-webkit-user-drag:none;}
.uis-stage[data-effect="clip"][data-o="h"] > ui-screen-after{clip-path:inset(0 0 0 var(--uis-pos));}
.uis-stage[data-effect="clip"][data-o="v"] > ui-screen-after{clip-path:inset(var(--uis-pos) 0 0 0);}
.uis-stage[data-effect="squeeze"][data-o="h"] > ui-screen-before{inset:0 auto 0 0;width:var(--uis-pos);}
.uis-stage[data-effect="squeeze"][data-o="h"] > ui-screen-after{inset:0 0 0 var(--uis-pos);}
.uis-stage[data-effect="squeeze"][data-o="v"] > ui-screen-before{inset:0 0 auto 0;height:var(--uis-pos);}
.uis-stage[data-effect="squeeze"][data-o="v"] > ui-screen-after{inset:var(--uis-pos) 0 0 0;}
.uis-stage.uis-animating > ui-screen-before,.uis-stage.uis-animating > ui-screen-after,.uis-stage.uis-animating > .uis-divider{transition:clip-path var(--uis-ms,300ms) ${EASE},width var(--uis-ms,300ms) ${EASE},height var(--uis-ms,300ms) ${EASE},inset var(--uis-ms,300ms) ${EASE},left var(--uis-ms,300ms) ${EASE},top var(--uis-ms,300ms) ${EASE};}
.uis-stage[data-mode="drag"][data-o="h"],.uis-stage[data-mode="click"][data-o="h"]{cursor:ew-resize;}
.uis-stage[data-mode="drag"][data-o="v"],.uis-stage[data-mode="click"][data-o="v"]{cursor:ns-resize;}
.uis-stage[data-disabled]{cursor:default;}
.uis-stage > .uis-divider{position:absolute;z-index:5;pointer-events:none;}
.uis-stage[data-o="h"] > .uis-divider{top:0;bottom:0;left:var(--uis-pos);width:0;}
.uis-stage[data-o="v"] > .uis-divider{left:0;right:0;top:var(--uis-pos);height:0;}
.uis-divider > .uis-line{position:absolute;background:var(--uis-line,#E3D322);}
.uis-stage[data-o="h"] > .uis-divider > .uis-line{top:0;bottom:0;left:calc(var(--uis-line-w,3px) / -2);width:var(--uis-line-w,3px);}
.uis-stage[data-o="v"] > .uis-divider > .uis-line{left:0;right:0;top:calc(var(--uis-line-w,3px) / -2);height:var(--uis-line-w,3px);}
.uis-divider > .uis-handle{position:absolute;pointer-events:auto;box-sizing:border-box;width:var(--uis-hs,48px);height:var(--uis-hs,48px);display:flex;align-items:center;justify-content:center;background:var(--uis-hbg,#E3D322);color:var(--uis-hc,#0C0D0C);border:var(--uis-hbw,3px) solid var(--uis-hbc,#0C0D0C);border-radius:50%;transform:translate(-50%,-50%);font-size:var(--uis-his,1.1rem);line-height:1;cursor:grab;touch-action:none;outline:none;transition:scale .2s ease;box-shadow:0 8px 20px -8px rgba(12,13,12,0.86);}
.uis-stage[data-o="h"] > .uis-divider > .uis-handle{left:0;top:var(--uis-ho,50%);}
.uis-stage[data-o="v"] > .uis-divider > .uis-handle{top:0;left:var(--uis-ho,50%);}
.uis-divider > .uis-handle[data-dir="col"]{flex-direction:column;}
.uis-divider > .uis-handle > .bi{display:block;line-height:1;}
.uis-divider > .uis-handle[data-dir="row"] > .bi + .bi{margin-left:-3px;}
.uis-divider > .uis-handle[data-dir="col"] > .bi + .bi{margin-top:-3px;}
.uis-divider > .uis-handle:hover{scale:1.08;}
.uis-divider > .uis-handle:focus-visible{outline:3px solid #51DBCF;outline-offset:3px;}
.uis-stage.uis-dragging > .uis-divider > .uis-handle{cursor:grabbing;scale:1.12;}
.uis-stage[data-shape="square"] > .uis-divider > .uis-handle{border-radius:12px;}
.uis-stage[data-shape="pill"][data-o="h"] > .uis-divider > .uis-handle{width:calc(var(--uis-hs,48px) * .64);height:calc(var(--uis-hs,48px) * 1.5);border-radius:999px;}
.uis-stage[data-shape="pill"][data-o="v"] > .uis-divider > .uis-handle{width:calc(var(--uis-hs,48px) * 1.5);height:calc(var(--uis-hs,48px) * .64);border-radius:999px;}
.uis-stage[data-shape="none"] > .uis-divider > .uis-handle{display:none;}
.uis-stage[data-disabled] > .uis-divider > .uis-handle{cursor:not-allowed;opacity:.86;scale:1;}
.uis-stage > ui-screen-before > .uis-label,.uis-stage > ui-screen-after > .uis-label,.uis-stage > ui-screen-before > ui-screen-label,.uis-stage > ui-screen-after > ui-screen-label{position:absolute;z-index:3;display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:var(--uis-lr,999px);font-size:var(--uis-ls,1rem);font-weight:700;letter-spacing:.02em;line-height:1.25;white-space:nowrap;background:var(--uis-lbg);color:var(--uis-lc);pointer-events:none;transition:opacity .25s ease;}
`;

  const injectStyle = () => {
    if (document.getElementById('ui-screen-style')) return;
    const s = document.createElement('style');
    s.id = 'ui-screen-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  };

  /* 以最外層逗號切割，避免切到 rgba(...) 內的逗號 */
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

  /* 單色或漸層：預設名稱、最外層有逗號、或完整 CSS 漸層時視為漸層 */
  const paint = (v, angle = 180) => {
    const t = String(v).trim();
    const isGrad = PRESETS[t.toLowerCase()] || splitTop(t).length > 1 || /-gradient\(/i.test(t);
    return isGrad ? gradient(t, angle, 'linear') : color(t);
  };

  const len = (v, unit = 'px') => {
    if (v === null || v === undefined || v === '') return '';
    const s = String(v).trim();
    return /^-?[\d.]+$/.test(s) ? s + unit : s;
  };

  const bi = (n) => {
    const s = String(n).trim().replace(/^bi\s+/, '');
    return s.startsWith('bi-') ? s : 'bi-' + s;
  };

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  class UIScreen extends HTMLElement {
    static get observedAttributes() { return ATTRS; }
    static get presets() { return JSON.parse(JSON.stringify(PRESETS)); }
    static get palette() { return { ...PALETTE }; }
    static gradient(value, angle, type) { return gradient(value, angle, type); }

    constructor() {
      super();
      this._pos = 50;
      this._built = false;
      this._dragging = false;
      this._touched = false;
      this._introDone = false;
      this._msOverride = null;
      this._grab = 0;
      this._o = 'h';
    }

    connectedCallback() {
      if (this._built) { this._setupIntro(); return; }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._init(), { once: true });
      } else {
        this._init();
      }
    }

    disconnectedCallback() {
      if (this._io) { this._io.disconnect(); this._io = null; }
    }

    attributeChangedCallback(name, oldV, newV) {
      if (!this._built || oldV === newV) return;
      if (name === 'position') { this._setPos(this._num('position', 50), { animate: true }); return; }
      this._apply();
      this._setPos(this._pos, { silent: true });
    }

    /* ---------- 公開介面 ---------- */
    get position() { return this._pos; }
    set position(v) { this.setPosition(v); }
    get orientation() { return this._o === 'v' ? 'vertical' : 'horizontal'; }
    set orientation(v) { this.setAttribute('orientation', v); }

    setPosition(v, { animate = true, silent = false } = {}) {
      if (!this._built) { this.setAttribute('position', v); return; }
      this._setPos(parseFloat(v), { animate, silent });
      if (!silent) this._emit('ui-screen:end');
    }

    reset(animate = true) { this.setPosition(this._num('position', 50), { animate }); }

    toggleOrientation() {
      this.setAttribute('orientation', this._o === 'h' ? 'vertical' : 'horizontal');
    }

    replay() { this._introDone = true; this._runIntro(); }

    refresh() { if (this._built) { this._apply(); this._setPos(this._pos, { silent: true }); } }

    /* ---------- 內部 ---------- */
    _init() {
      if (this._built) return;
      injectStyle();
      this._build();
      this._built = true;
      this._apply();
      this._setPos(this._num('position', 50), { silent: true });
      this._setupIntro();
    }

    _build() {
      const pick = (tag) => this.querySelector(`:scope > ${tag}`);
      this._before = pick('ui-screen-before') || document.createElement('ui-screen-before');
      this._after = pick('ui-screen-after') || document.createElement('ui-screen-after');
      const custom = pick('ui-screen-handle');

      const mk = (cls) => { const d = document.createElement('div'); d.className = cls; return d; };
      this._frame = mk('uis-frame');
      this._stage = mk('uis-stage');
      this._divider = mk('uis-divider');
      this._line = mk('uis-line');
      this._handle = mk('uis-handle');
      this._handle.tabIndex = 0;
      this._custom = !!custom;
      if (custom) this._handle.appendChild(custom);

      this._divider.append(this._line, this._handle);
      this._stage.append(this._before, this._after, this._divider);
      this._frame.appendChild(this._stage);
      this.appendChild(this._frame);

      this._bind();

      this._mo = new MutationObserver(() => this._labels());
      [this._before, this._after].forEach((layer) => {
        this._mo.observe(layer, { attributes: true, attributeFilter: ['label', 'label-icon', 'label-bg', 'label-color', 'bg'] });
      });
    }

    _apply() {
      const a = (n) => this.getAttribute(n);
      const o = this._o = /^v/i.test(a('orientation') || '') ? 'v' : 'h';
      const effect = a('effect') === 'squeeze' ? 'squeeze' : 'clip';
      const mode = ['drag', 'handle', 'click', 'hover'].includes(a('mode')) ? a('mode') : 'drag';
      const shape = ['circle', 'pill', 'square', 'none'].includes(a('handle-shape')) ? a('handle-shape') : 'circle';
      const st = this._stage;

      st.dataset.o = o;
      st.dataset.effect = effect;
      st.dataset.mode = mode;
      st.dataset.shape = shape;
      st.toggleAttribute('data-disabled', this.hasAttribute('disabled'));

      const h = a('height');
      const ar = a('aspect-ratio');
      const fixed = !!(h || ar || effect === 'squeeze');
      st.classList.toggle('uis-fixed', fixed);
      st.style.height = h ? len(h) : '';
      st.style.aspectRatio = ar ? ar : (fixed && !h ? '16 / 9' : '');
      st.style.touchAction = (mode === 'drag' || mode === 'click') ? (o === 'h' ? 'pan-y' : 'pan-x') : '';

      const set = (k, v) => (v ? this.style.setProperty(k, v) : this.style.removeProperty(k));
      set('--uis-bw', len(a('border-width')));
      set('--uis-radius', len(a('radius')));
      set('--uis-border', gradient(a('border-gradient'), a('border-gradient-angle'), a('border-gradient-type') || 'linear') || color(a('border-color')));
      const sh = a('shadow');
      set('--uis-shadow', sh === null ? '' : (sh === '' || sh === 'true' ? '0 24px 48px -20px rgba(12, 13, 12, 0.86)' : sh));
      set('--uis-stage-bg', color(a('stage-bg')));
      set('--uis-line-w', len(a('line-width')));
      set('--uis-line', gradient(a('line-gradient'), a('line-gradient-angle') ?? (o === 'h' ? 180 : 90), 'linear') || color(a('line-color')));
      set('--uis-hs', len(a('handle-size')));
      set('--uis-hbg', gradient(a('handle-gradient'), a('handle-gradient-angle'), 'linear') || color(a('handle-bg')));
      set('--uis-hc', color(a('handle-color')));
      set('--uis-hbw', len(a('handle-border-width')));
      set('--uis-hbc', color(a('handle-border-color')));
      set('--uis-ho', len(a('handle-offset'), '%'));
      set('--uis-his', len(a('handle-icon-size'), 'rem'));
      set('--uis-ms', len(this._msOverride ?? a('transition'), 'ms'));
      set('--uis-ls', len(a('label-size'), 'rem'));
      set('--uis-lr', len(a('label-radius')));

      /* 圖示排列方向：直向膠囊把手或上下分隔的圓形把手採直排 */
      const col = (o === 'h' && shape === 'pill') || (o === 'v' && shape !== 'pill');
      this._handle.dataset.dir = col ? 'col' : 'row';
      if (!this._custom) this._handle.innerHTML = this._iconHTML(o);

      this._labels();
    }

    _iconHTML(o) {
      const raw = o === 'v'
        ? (this.getAttribute('handle-icon-vertical') ?? 'caret-up-fill,caret-down-fill')
        : (this.getAttribute('handle-icon') ?? 'caret-left-fill,caret-right-fill');
      if (!raw.trim() || raw.trim() === 'none') return '';
      return raw.split(',').map((s) => s.trim()).filter(Boolean)
        .map((n) => `<i class="bi ${bi(n)}"></i>`).join('');
    }

    _labels() {
      const defs = { before: ['rgba(12, 13, 12, 0.84)', '#C6C7BD'], after: ['#E3D322', '#0C0D0C'] };
      [['before', this._before], ['after', this._after]].forEach(([side, layer]) => {
        const text = layer.getAttribute('label');
        let tag = layer.querySelector(':scope > .uis-label');
        if (text !== null && text !== '') {
          if (!tag) { tag = document.createElement('span'); tag.className = 'uis-label'; layer.appendChild(tag); }
          tag.textContent = '';
          const ic = layer.getAttribute('label-icon');
          if (ic) { const i = document.createElement('i'); i.className = 'bi ' + bi(ic); tag.appendChild(i); }
          tag.appendChild(document.createTextNode(text));
        } else if (tag) {
          tag.remove();
        }
        layer.style.setProperty('--uis-lbg', color(layer.getAttribute('label-bg')) || defs[side][0]);
        layer.style.setProperty('--uis-lc', color(layer.getAttribute('label-color')) || defs[side][1]);
        /* 圖層底色：未設定時沿用 stage-bg，避免兩層內容互相透出 */
        const lbg = layer.getAttribute('bg');
        if (lbg) layer.style.setProperty('--uis-layer-bg', paint(lbg));
        else layer.style.removeProperty('--uis-layer-bg');
      });
      this._placeLabels();
      this._autohide();
    }

    _placeLabels() {
      const lp = this.getAttribute('label-position') || 'start';
      const gap = len(this.getAttribute('label-inset') || '16');
      const o = this._o;
      [['before', this._before], ['after', this._after]].forEach(([side, layer]) => {
        layer.querySelectorAll(':scope > .uis-label, :scope > ui-screen-label:not([free])').forEach((el) => {
          const s = el.style;
          s.top = s.right = s.bottom = s.left = '';
          s.transform = '';
          if (o === 'h') {
            if (side === 'before') s.left = gap; else s.right = gap;
            if (lp === 'center') { s.top = '50%'; s.transform = 'translateY(-50%)'; }
            else if (lp === 'end') s.bottom = gap;
            else s.top = gap;
          } else {
            if (side === 'before') s.top = gap; else s.bottom = gap;
            if (lp === 'center') { s.left = '50%'; s.transform = 'translateX(-50%)'; }
            else if (lp === 'end') s.right = gap;
            else s.left = gap;
          }
        });
      });
    }

    _autohide() {
      if (!this._before) return;
      const t = this.getAttribute('label-autohide');
      const th = t === null ? -1 : (t === '' ? 15 : parseFloat(t));
      const q = (layer) => layer.querySelectorAll(':scope > .uis-label, :scope > ui-screen-label');
      q(this._before).forEach((el) => { el.style.opacity = th >= 0 && this._pos < th ? '0' : ''; });
      q(this._after).forEach((el) => { el.style.opacity = th >= 0 && this._pos > 100 - th ? '0' : ''; });
    }

    _num(name, def) {
      const v = parseFloat(this.getAttribute(name));
      return Number.isFinite(v) ? v : def;
    }

    _ms() {
      const v = this._msOverride ?? parseFloat(this.getAttribute('transition'));
      return Number.isFinite(v) ? v : 300;
    }

    _setPos(p, { animate = false, silent = false } = {}) {
      const min = this._num('min', 0), max = this._num('max', 100);
      p = clamp(Number.isFinite(p) ? p : 50, Math.min(min, max), Math.max(min, max));
      if (animate && this._stage) {
        this._stage.classList.add('uis-animating');
        clearTimeout(this._animT);
        this._animT = setTimeout(() => this._stage.classList.remove('uis-animating'), this._ms() + 40);
      }
      this._pos = Math.round(p * 100) / 100;
      this.style.setProperty('--uis-pos', this._pos + '%');
      this._autohide();
      if (!silent) this._emit('ui-screen:change');
    }

    _emit(type) {
      this.dispatchEvent(new CustomEvent(type, {
        bubbles: true,
        detail: { position: this._pos, orientation: this.orientation }
      }));
    }

    _pct(e) {
      const r = this._stage.getBoundingClientRect();
      return this._o === 'h'
        ? ((e.clientX - r.left) / r.width) * 100
        : ((e.clientY - r.top) / r.height) * 100;
    }

    _snap() {
      const s = this.getAttribute('snap');
      if (!s) return;
      const pts = s.split(',').map((x) => parseFloat(x)).filter(Number.isFinite);
      const th = this._num('snap-threshold', 8);
      let best = null, d = Infinity;
      pts.forEach((p) => { const dd = Math.abs(p - this._pos); if (dd < d) { d = dd; best = p; } });
      if (best !== null && d <= th && d > 0) this._setPos(best, { animate: true });
    }

    _finish() {
      this._snap();
      this._emit('ui-screen:end');
    }

    _bind() {
      const st = this._stage, hd = this._handle;
      const off = () => this.hasAttribute('disabled');

      st.addEventListener('dragstart', (e) => e.preventDefault());

      st.addEventListener('pointerdown', (e) => {
        if (off()) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const mode = st.dataset.mode;
        if (mode === 'hover') return;
        const onHandle = hd.contains(e.target);
        if (!onHandle && mode === 'handle') return;
        this._touched = true;
        if (!onHandle && mode === 'click') {
          this._setPos(this._pct(e), { animate: true });
          this._finish();
          return;
        }
        e.preventDefault();
        if (onHandle) hd.focus({ preventScroll: true });
        this._dragging = true;
        this._pid = e.pointerId;
        try { st.setPointerCapture(e.pointerId); } catch (_) { /* 忽略 */ }
        st.classList.add('uis-dragging');
        if (onHandle) {
          this._grab = this._pct(e) - this._pos;
        } else {
          this._grab = 0;
          this._setPos(this._pct(e), { animate: true });
        }
      });

      st.addEventListener('pointermove', (e) => {
        if (off()) return;
        if (this._dragging && e.pointerId === this._pid) {
          st.classList.remove('uis-animating');
          this._setPos(this._pct(e) - this._grab);
        } else if (st.dataset.mode === 'hover' && e.pointerType !== 'touch') {
          this._touched = true;
          this._setPos(this._pct(e));
        }
      });

      const end = (e) => {
        if (!this._dragging || e.pointerId !== this._pid) return;
        this._dragging = false;
        st.classList.remove('uis-dragging');
        try { st.releasePointerCapture(e.pointerId); } catch (_) { /* 忽略 */ }
        this._finish();
      };
      st.addEventListener('pointerup', end);
      st.addEventListener('pointercancel', end);

      st.addEventListener('pointerleave', () => {
        if (st.dataset.mode !== 'hover' || off()) return;
        if (this.hasAttribute('reset-on-leave')) this._setPos(this._num('position', 50), { animate: true });
        this._finish();
      });

      hd.addEventListener('keydown', (e) => {
        if (off()) return;
        const step = this._num('step', 1) * (e.shiftKey ? 10 : 1);
        let p = this._pos;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') p -= step;
        else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') p += step;
        else if (e.key === 'Home') p = this._num('min', 0);
        else if (e.key === 'End') p = this._num('max', 100);
        else return;
        e.preventDefault();
        this._touched = true;
        this._setPos(p);
        this._emit('ui-screen:end');
      });
    }

    _setupIntro() {
      if (this._introDone || !this.hasAttribute('intro') || this._io) return;
      if (!('IntersectionObserver' in window)) { this._introDone = true; this._runIntro(); return; }
      this._io = new IntersectionObserver((entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        this._io.disconnect();
        this._io = null;
        this._introDone = true;
        this._runIntro();
      }, { threshold: 0.4 });
      this._io.observe(this);
    }

    async _runIntro() {
      const wait = (t) => new Promise((r) => setTimeout(r, t));
      const base = this._pos;
      const amp = this._num('intro-range', 18);
      const dur = this._num('intro-duration', 700);
      this._touched = false;
      await wait(this._num('intro-delay', 300));
      this._msOverride = dur;
      this.style.setProperty('--uis-ms', dur + 'ms');
      for (const p of [base - amp, base + amp, base]) {
        if (this._touched || this._dragging) break;
        this._setPos(p, { animate: true, silent: true });
        await wait(dur + 80);
      }
      this._msOverride = null;
      const t = this.getAttribute('transition');
      if (t) this.style.setProperty('--uis-ms', len(t, 'ms'));
      else this.style.removeProperty('--uis-ms');
    }
  }

  window.customElements.define('ui-screen', UIScreen);
  window.UIScreen = UIScreen;
})();
