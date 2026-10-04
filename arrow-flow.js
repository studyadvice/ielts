/*!
 * arrow-flow.js  v1.0.0
 * <arrow-flow> custom element — sequential step reveal with brand colours
 * No Shadow DOM · No external dependencies
 *
 * Usage:
 *   <arrow-flow theme="sky" gap="72px" arrow-tip="md"
 *               reveal="cumulative" animation="fade"
 *               equal-height on-complete="result-id" current="0">
 *     <flow-step title="Step 1">HTML content</flow-step>
 *     <flow-step title="Step 2" header-color="lavender" border-color="indigo">…</flow-step>
 *   </arrow-flow>
 *
 * Global config (call before elements are initialised):
 *   ArrowFlow.config({ theme:'sky', arrowTip:'lg', gap:'80px', animation:'slide' })
 *   ArrowFlow.config({ 'arrow-tip':'lg' })   // kebab-case also accepted
 *
 * Events (bubble):
 *   el.addEventListener('step-change',   e => e.detail.index)
 *   el.addEventListener('flow-complete', e => e.detail.totalSteps)
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
   *  Brand palette
   * ───────────────────────────────────────────────────────────────────────── */
  const P = {
    bg      : '#0C0D0C', shell   : '#C6C7BD', lavender: '#C3A5E5',
    sky     : '#82C8E5', warning : '#E6374B', salmon  : '#E5C3B3',
    ocean   : '#1CCAE8', safe    : '#27AE60', teal    : '#0DA591',
    vanilla : '#DBEDD8', yellow  : '#E3D322', focus   : '#D4FFFC',
    special : '#B3DE73', info    : '#2351DB', indigo  : '#7849C9',
    pink    : '#FF91D7', orange  : '#EDA109',
  };

  /* ─────────────────────────────────────────────────────────────────────────
   *  Arrow tip configs  (SVG viewBox 0 0 80 40)
   *  hh = head triangle total height  |  hw = head depth (width of triangle)
   *  Shaft is always 6 SVG-units tall, centred at cy=20
   * ───────────────────────────────────────────────────────────────────────── */
  const TIPS = {
    sm : { hh: 16, hw: 18 },
    md : { hh: 24, hw: 28 },
    lg : { hh: 34, hw: 36 },
    xl : { hh: 40, hw: 44 },
  };

  /* ─────────────────────────────────────────────────────────────────────────
   *  Global defaults  (mirrors attribute names → camelCase)
   * ───────────────────────────────────────────────────────────────────────── */
  const DEF = {
    theme       : 'shell',
    headerColor : null,
    borderColor : null,
    arrowColor  : null,
    arrowTip    : 'md',
    gap         : '72px',
    equalHeight : false,
    reveal      : 'cumulative',
    animation   : 'fade',
    current     : 0,
    stepWidth   : null,   // null = flex:1 (fill); any CSS length = fixed width
    arrowStyle  : 'solid',  // 'solid' | 'dashed'
  };

  /* ─────────────────────────────────────────────────────────────────────────
   *  Public API
   * ───────────────────────────────────────────────────────────────────────── */
  window.ArrowFlow = {
    PALETTE : P,
    /**
     * Override global defaults for all subsequently-initialised elements.
     * Accepts both camelCase and kebab-case keys.
     * @param {Object} opts
     */
    config(opts = {}) {
      Object.keys(opts).forEach(k => {
        const ck = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (ck in DEF) DEF[ck] = opts[k];
      });
    },
  };

  /* ─────────────────────────────────────────────────────────────────────────
   *  Helpers
   * ───────────────────────────────────────────────────────────────────────── */

  /** Resolve palette colour name, or pass through raw hex/css value. */
  const clr = n => (!n ? null : (P[n] ?? n));

  /** Return dark (bg) or light (shell) text colour for maximum contrast. */
  function ctrst(hex) {
    if (!hex || hex[0] !== '#') return P.shell;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? P.bg : P.shell;
  }

  /* ─────────────────────────────────────────────────────────────────────────
   *  CSS — injected once into <head>; called synchronously in connectedCallback
   *  so flow-step { display:none } is applied before the first paint.
   * ───────────────────────────────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('af-css')) return;
    const s = document.createElement('style');
    s.id = 'af-css';
    s.textContent = `
/* Hide raw <flow-step> children; component re-renders them */
flow-step { display: none; }
arrow-flow { display: block; }

/* Flex row: step columns alternating with arrow columns */
.af-w { display: flex; align-items: stretch; }
.af-sc { flex: 1 1 0; display: flex; flex-direction: column; min-width: 0; }

/* Box base (hidden by default) */
.af-bx {
  flex: 1; display: flex; flex-direction: column;
  border: 2.5px solid var(--af-bd); border-radius: 5px; overflow: hidden;
  opacity: 0;
}

/* Animation variants — applied at creation time; transition only fires on
   later class additions so initially-shown boxes appear without animation. */
.af-bx.af-fade  { transition: opacity .38s ease; }
.af-bx.af-slide { transition: opacity .38s ease, transform .38s ease;
                   transform: translateX(-22px); }
.af-bx.af-none  { transition: none; }

/* Shown state */
.af-bx.af-on                 { opacity: 1; }
.af-bx.af-slide.af-on        { transform: translateX(0); }

/* Header */
.af-hd {
  padding: 10px 16px;
  font-size: 1.125rem; font-weight: 700; line-height: 1.4;
  flex-shrink: 0;
  background-color: var(--af-hbg); color: var(--af-hfg);
}

/* Content area */
.af-ct {
  padding: 16px;
  font-size: 1.125rem; line-height: 1.5;
  color: rgba(198, 199, 189, 0.92);
  background-color: #0C0D0C;
  flex: 1;
}

/* Arrow column */
.af-ar {
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: opacity .3s;
}
.af-ar.lk { opacity: .10; cursor: default;  pointer-events: none; }
.af-ar.ac { opacity: 1;   cursor: pointer;  pointer-events: auto; }
.af-ar.ps { opacity: .35; cursor: default;  pointer-events: none; }

/* Active arrow: subtle opacity on hover only — no transforms to avoid click miss */
.af-ar.ac:hover { opacity: 0.76; }
.af-sv { display: block; width: 86%; height: auto; }

/* on-complete target: fade + rise reveal */
.af-reveal { animation: af-reveal-in .5s ease both; }
@keyframes af-reveal-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
    `;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────────────────
   *  SVG Arrow builder
   *  style: 'solid' (default) | 'dashed'
   *    solid  — filled <rect> shaft
   *    dashed — <line> with stroke-dasharray; head stays solid
   * ───────────────────────────────────────────────────────────────────────── */
  function makeSVG(tipKey, fill, style) {
    const t  = TIPS[tipKey] || TIPS.md;
    const W  = 80;
    const cy = 20;
    const hs = W - t.hw;          // x where head triangle begins
    const ns = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} 40`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('af-sv');

    /* Shaft — solid rect or dashed line */
    let shaft;
    if (style === 'dashed') {
      shaft = document.createElementNS(ns, 'line');
      shaft.setAttribute('x1',               '0');
      shaft.setAttribute('y1',               String(cy));
      shaft.setAttribute('x2',               String(hs + 1)); // +1 tucks under head
      shaft.setAttribute('y2',               String(cy));
      shaft.setAttribute('stroke',           fill);
      shaft.setAttribute('stroke-width',     '5');
      shaft.setAttribute('stroke-dasharray', '8 5');
      shaft.setAttribute('stroke-linecap',   'round');
    } else {
      shaft = document.createElementNS(ns, 'rect');
      shaft.setAttribute('x',      '0');
      shaft.setAttribute('y',      '17');
      shaft.setAttribute('width',  String(hs + 3)); // +3 overlap under head
      shaft.setAttribute('height', '6');
      shaft.setAttribute('fill',   fill);
    }

    /* Head (arrowhead triangle — always solid) */
    const head = document.createElementNS(ns, 'polygon');
    head.setAttribute('points',
      `${hs},${cy - t.hh / 2} ${W},${cy} ${hs},${cy + t.hh / 2}`
    );
    head.setAttribute('fill', fill);

    svg.appendChild(shaft);
    svg.appendChild(head);
    return svg;
  }

  /* ─────────────────────────────────────────────────────────────────────────
   *  Custom Element
   * ───────────────────────────────────────────────────────────────────────── */
  class ArrowFlowEl extends HTMLElement {
    connectedCallback() {
      if (this._up) return;
      this._up = true;
      /* Inject CSS synchronously so flow-step { display:none } is applied
         before the first paint, preventing raw content from flashing. */
      injectCSS();
      /* Defer _init so <flow-step> children are guaranteed parsed. */
      document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', () => this._init())
        : Promise.resolve().then(() => this._init());
    }

    /** Read attribute → fall back to global DEF → fall back to fb. */
    _o(attr, dk, fb = null) {
      const v = this.getAttribute(attr);
      if (v !== null && v !== '') return v;
      const d = DEF[dk];
      return (d !== undefined && d !== null) ? String(d) : fb;
    }

    /** Boolean attribute: present on element OR truthy in DEF. */
    _bool(attr, dk) {
      return this.hasAttribute(attr) || !!DEF[dk];
    }

    _init() {
      /* ── Snapshot <flow-step> data before wiping innerHTML ── */
      const steps = Array.from(this.querySelectorAll('flow-step')).map(el => ({
        title : el.getAttribute('title') || '',
        hc    : el.getAttribute('header-color'),
        bc    : el.getAttribute('border-color'),
        width : el.getAttribute('width'),   // per-step fixed width (optional)
        html  : el.innerHTML,
      }));
      if (!steps.length) return;

      /* ── Resolve options ── */
      const theme  = this._o('theme',        'theme',       'shell');
      const hcA    = this._o('header-color',  'headerColor', null);
      const bcA    = this._o('border-color',  'borderColor', null);
      const acA    = this._o('arrow-color',   'arrowColor',  null);
      const tip    = this._o('arrow-tip',     'arrowTip',    'md');
      const gap    = (() => {
        const g = this._o('gap', 'gap', '72px');
        return /^\d+$/.test(g) ? g + 'px' : g;
      })();
      const rev    = this._o('reveal',    'reveal',    'cumulative');
      const anim   = this._o('animation', 'animation', 'fade');
      const eqH    = this._bool('equal-height', 'equalHeight');
      const start  = Math.min(
        Math.max(parseInt(this._o('current', 'current', '0')) || 0, 0),
        steps.length - 1
      );
      /** Normalise a width value to a CSS length string, or null. */
      const toW = v => (!v ? null : /^\d+$/.test(v) ? v + 'px' : v);
      const globalW  = toW(this._o('step-width',  'stepWidth',  null));
      const arStyle  = this._o('arrow-style', 'arrowStyle', 'solid');

      /* ── Store instance state ── */
      this._rev  = rev;
      this._eqH  = eqH;
      this._n    = steps.length;
      this._cur  = start;

      /* ── Resolve base colours ── */
      const thHex  = clr(theme) || P.shell;
      const baseHB = clr(hcA)   || thHex;
      const baseBD = clr(bcA)   || thHex;
      const arrClr = clr(acA)   || thHex;

      /* ── on-complete target: hide on init, reveal on completion ── */
      const ocId = this.getAttribute('on-complete');
      this._oc = ocId ? document.getElementById(ocId) : null;
      if (this._oc) this._oc.style.display = 'none';

      /* ── Build DOM ── */
      const wrap = document.createElement('div');
      wrap.className = 'af-w';
      this._bx = [];   // box elements
      this._ar = [];   // arrow column elements

      const animCls = { fade: 'af-fade', slide: 'af-slide', none: 'af-none' }[anim] ?? 'af-fade';

      steps.forEach((s, i) => {
        const hBg  = clr(s.hc) || baseHB;
        const bBd  = clr(s.bc) || baseBD;
        const shown = i <= start;

        /* Step column */
        const col = document.createElement('div');
        col.className = 'af-sc';
        // Per-step width overrides global step-width; both override default flex:1
        const colW = toW(s.width) || globalW;
        if (colW) {
          col.style.flex     = `0 0 ${colW}`;
          col.style.width    = colW;
          col.style.maxWidth = colW;
        }

        /* Box */
        const box = document.createElement('div');
        box.className = `af-bx ${animCls}`;
        box.style.setProperty('--af-hbg', hBg);
        box.style.setProperty('--af-hfg', ctrst(hBg));
        box.style.setProperty('--af-bd',  bBd);

        if (shown) {
          /* Bypass CSS-driven transition for initially visible boxes.
             Inline style overrides CSS class, so no animation fires. */
          box.style.opacity   = '1';
          box.style.transform = 'none';
          box.classList.add('af-on');
        }

        /* Header */
        const hdr = document.createElement('div');
        hdr.className = 'af-hd';
        hdr.textContent = s.title;

        /* Content — full HTML support */
        const cnt = document.createElement('div');
        cnt.className = 'af-ct';
        cnt.innerHTML = s.html;

        box.appendChild(hdr);
        box.appendChild(cnt);
        col.appendChild(box);
        wrap.appendChild(col);
        this._bx.push(box);

        /* Arrow column (inserted between every pair of steps) */
        if (i < steps.length - 1) {
          const st = i < start          ? 'ps'
                   : i === start && start < this._n - 1 ? 'ac'
                   : 'lk';

          const ar = document.createElement('div');
          ar.className = `af-ar ${st}`;
          ar.style.width    = gap;
          ar.style.minWidth = gap;
          ar.setAttribute('title', '點擊繼續');
          ar.appendChild(makeSVG(tip, arrClr, arStyle));
          ar.addEventListener('click', () => this._fwd(i));
          wrap.appendChild(ar);
          this._ar.push(ar);
        }
      });

      /* Replace element content */
      this.innerHTML = '';
      this.appendChild(wrap);

      /* Equal-height: measure after two frames (layout fully settled) */
      if (eqH) {
        requestAnimationFrame(() => requestAnimationFrame(() => this._eqHt()));
      }

      /* Auto-complete when started at the last step */
      if (start === this._n - 1) this._done();
    }

    /** Advance flow by clicking arrow at index ai. */
    _fwd(ai) {
      const ni = ai + 1;
      if (ni >= this._n) return;

      const nb = this._bx[ni];

      /* Force reflow so the browser registers the current (hidden) state
         before the class addition triggers the CSS transition. */
      void nb.offsetWidth;
      nb.classList.add('af-on');

      /* Update arrow states */
      const setAr = (el, cls) => {
        if (!el) return;
        el.classList.remove('lk', 'ac', 'ps');
        el.classList.add(cls);
      };
      setAr(this._ar[ai], 'ps');
      if (ni < this._n - 1) setAr(this._ar[ni], 'ac');

      /* Single-reveal mode: fade out all boxes before the new one.
         Inline style overrides class-based opacity, so transition fires. */
      if (this._rev === 'single') {
        for (let j = 0; j <= ai; j++) {
          const b = this._bx[j];
          b.style.transition = 'opacity .35s ease';
          b.style.opacity    = '0';
        }
      }

      this._cur = ni;
      this.dispatchEvent(new CustomEvent('step-change', {
        detail  : { index: ni },
        bubbles : true,
      }));

      if (this._eqH) requestAnimationFrame(() => this._eqHt());
      if (ni === this._n - 1) this._done();
    }

    /** Dispatch flow-complete and reveal on-complete target. */
    _done() {
      this.dispatchEvent(new CustomEvent('flow-complete', {
        detail  : { totalSteps: this._n },
        bubbles : true,
      }));
      if (this._oc) {
        this._oc.style.display = '';
        this._oc.classList.add('af-reveal');
      }
    }

    /** Force all boxes to share the height of the tallest one. */
    _eqHt() {
      this._bx.forEach(b => (b.style.minHeight = ''));
      const mx = Math.max(...this._bx.map(b => b.offsetHeight));
      if (mx > 0) this._bx.forEach(b => (b.style.minHeight = `${mx}px`));
    }
  }

  /* ── Register custom elements ── */
  if (!customElements.get('arrow-flow'))
    customElements.define('arrow-flow', ArrowFlowEl);
  if (!customElements.get('flow-step'))
    customElements.define('flow-step', class extends HTMLElement {});

}());
