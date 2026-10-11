(function () {
  'use strict';

  const BASE_BG = '#0C0D0C';

  const BRAND_COLORS = {
    shell:    '#C6C7BD',
    lavender: '#C3A5E5',
    sky:      '#82C8E5',
    warning:  '#E6374B',
    salmon:   '#E5C3B3',
    ocean:    '#1CCAE8',
    safe:     '#27AE60',
    teal:     '#0DA591',
    vanilla:  '#DBEDD8',
    yellow:   '#E3D322',
    focus:    '#D4FFFC',
    special:  '#B3DE73',
    info:     '#4171BF',
    indigo:   '#7849C9',
    pink:     '#FF91D7',
    orange:   '#EDA109',
  };

  const LEGACY_THEME_ALIASES = {
    attention: 'yellow',
    brown:     'salmon',
  };


  const DEFAULTS = {
    theme:            'lavender',
    stripWidth:       8,
    mode:             'single',
    animMs:           260,
    loopBack:         true,
    showBadge:        false,
    showDots:         false,
    carouselInterval: 3000,
    carouselPause:    true,
    progressHeight:   2,
    progressStyle:    'bar',
    progressDir:      'ltr',
    showCountdown:    false,
    stripPosition:    'left',
    slideColor:       BRAND_COLORS.shell,
    slidePadding:     '6px 8px',
    slideLineHeight:  1.5,
    height:           'auto',
  };

  let cssInjected = false;
  function injectCSS () {
    if (cssInjected) return;
    cssInjected = true;
    const s = document.createElement('style');
    s.id = 'cell-drawer-styles';
    s.textContent = `
      cell-drawer, cell-level { display: block; }
      cell-drawer {
        --cd-bg: ${BASE_BG};
        --cd-surface: color-mix(in srgb, ${BASE_BG} 80%, ${BRAND_COLORS.shell});
      }
      cell-level { display: none; }

      .cd-wrap {
        display: flex;
        align-items: stretch;
        border: 1px solid var(--cd-color, ${BRAND_COLORS.shell});
        border-radius: 2px;
        background: var(--cd-bg);
        overflow: hidden;
        min-height: 32px;
        position: relative;
        font-size: .85rem;
        opacity: 1;
      }

      .cd-strip {
        flex: 0 0 var(--cd-sw, 8px);
        width: var(--cd-sw, 8px);
        background: var(--cd-color, #C3A5E5);
        cursor: pointer;
        transition: filter .15s ease, width .15s ease;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }
      .cd-strip:hover {
        filter: brightness(1.25);
      }
      .cd-strip:active {
        filter: brightness(.8);
      }

      .cd-strip-dots {
        display: flex;
        flex-direction: column;
        gap: 3px;
        pointer-events: none;
      }
      .cd-strip-dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: rgba(12,13,12,.78);
        transition: background .2s;
      }
      .cd-strip-dot.active {
        background: ${BRAND_COLORS.focus};
      }

      .cd-body {
        flex: 1 1 0;
        min-width: 0;
        position: relative;
        overflow: hidden;
        background: var(--cd-surface);
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .cd-slide {
        padding: var(--cd-sp, 7px 10px);
        color: var(--cd-sc, ${BRAND_COLORS.shell});
        line-height: var(--cd-slh, 1.5);
        will-change: transform, opacity;
      }

      .cd-slide.mode-single {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .cd-slide.mode-auto {
        white-space: normal;
        overflow: visible;
      }

      .cd-lv-badge {
        position: absolute;
        right: 5px;
        bottom: 3px;
        font-size: .6rem;
        color: rgba(198,199,189,.78);
        font-family: monospace;
        pointer-events: none;
        letter-spacing: .05em;
        line-height: 1;
      }

      .cd-slide.anim-out-left {
        transform: translateX(-110%);
        opacity: 0;
      }
      .cd-slide.anim-in-right {
        transform: translateX(110%);
        opacity: 0;
        transition: none !important;
      }
      .cd-slide.anim-settle {
        transform: translateX(0);
        opacity: 1;
      }

      .cd-wrap.cd-strip-right {
        flex-direction: row-reverse;
      }

      .cd-wrap.cd-strip-right .cd-lv-badge {
        right: auto;
        left: 5px;
      }

      .cd-wrap.cd-fixed {
        height: var(--cd-h, 120px);
        min-height: unset;
        align-items: stretch;
      }
      .cd-wrap.cd-fixed .cd-body {
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--cd-color, #C3A5E5) transparent;
      }
      .cd-wrap.cd-fixed .cd-body::-webkit-scrollbar { width: 4px; }
      .cd-wrap.cd-fixed .cd-body::-webkit-scrollbar-track { background: transparent; }
      .cd-wrap.cd-fixed .cd-body::-webkit-scrollbar-thumb {
        background: var(--cd-color, #C3A5E5);
        border-radius: 2px;
        opacity: .6;
      }
      .cd-slide.mode-fixed {
        white-space: normal;
        overflow: visible;
        height: auto;
      }

      .cd-start {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 6px 12px;
        min-width: 38px;
        white-space: nowrap;
        user-select: none;
        cursor: default;
        font-weight: 700;
        font-size: .78rem;
        letter-spacing: .04em;
        line-height: 1.2;

        border-left: 1px solid var(--cd-start-sep, ${BASE_BG});
        transition: background .25s ease, color .25s ease;
      }

      .cd-wrap.cd-strip-right .cd-start {
        border-left: none;
        border-right: 1px solid var(--cd-start-sep, ${BASE_BG});
      }
      .cd-start-icon {
        font-size: 1.05rem;
        line-height: 1;
        display: block;
      }
      .cd-start-text {
        font-size: .7rem;
        display: block;
        text-align: center;
        line-height: 1.2;
      }

      .cd-btnstart {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4px 9px;
        gap: 2px;
        cursor: pointer;
        user-select: none;
        border-left: 1px solid var(--cd-start-sep, ${BASE_BG});
        transition: filter .15s ease;
        min-width: 26px;
        white-space: nowrap;
      }
      .cd-btnstart:hover { filter: brightness(1.25); }
      .cd-btnstart:active { filter: brightness(.8); }
      .cd-btnstart-icon {
        font-size: .9rem;
        line-height: 1;
        display: block;
      }
      .cd-btnstart-label {
        font-size: .58rem;
        line-height: 1.2;
        text-align: center;
        display: block;
        letter-spacing: .02em;
      }
      .cd-wrap.cd-strip-right .cd-btnstart {
        border-left: none;
        border-right: 1px solid var(--cd-start-sep, ${BASE_BG});
      }

      .cd-tpl {
        color: var(--cd-color, #C3A5E5);
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        display: inline;
        border-radius: 2px;
        padding: 0 1px;
      }
      @keyframes cd-tpl-flash {
        0%   { background: var(--cd-color, #C3A5E5); color: ${BASE_BG}; border-radius: 2px; }
        100% { background: transparent; color: var(--cd-color, #C3A5E5); }
      }
      .cd-tpl.cd-flash {
        animation: cd-tpl-flash .45s ease-out forwards;
      }

      .cd-wrap.cd-carousel .cd-strip {
        display: none !important;
      }

      .cd-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: var(--cd-ph, 2px);
        width: 0%;
        background: var(--cd-color, #C3A5E5);
        pointer-events: none;
        will-change: width;
        overflow: visible;
        z-index: 2;
      }

      .cd-wrap.cd-paused .cd-progress {
        transition: none !important;
      }
      .cd-wrap.cd-paused .cd-progress::after,
      .cd-wrap.cd-paused .cd-progress::before {
        animation-play-state: paused !important;
      }

      .cd-progress.cd-fuse {

        background: linear-gradient(
          to right,
          var(--cd-surface) 0%,
          color-mix(in srgb, var(--cd-color) 78%, var(--cd-surface)) 100%
        );
      }

      .cd-progress.cd-fuse::after {
        content: '';
        position: absolute;
        right: calc(var(--cd-tip, 7px) * -.5);
        top: 50%;
        transform: translateY(-50%);
        width:  var(--cd-tip, 7px);
        height: var(--cd-tip, 7px);
        border-radius: 50%;
        background: radial-gradient(
          circle,
          ${BRAND_COLORS.focus}   0%,
          ${BRAND_COLORS.vanilla} 30%,
          var(--cd-color) 70%,
          var(--cd-color) 100%
        );
        box-shadow:
          0 0 calc(var(--cd-tip, 7px) * 1)   calc(var(--cd-tip, 7px) * .35) var(--cd-color),
          0 0 calc(var(--cd-tip, 7px) * 2.5) calc(var(--cd-tip, 7px) * .5)  var(--cd-color);
        animation: cd-fuse-spark 90ms ease-in-out infinite alternate;
        will-change: transform, opacity, box-shadow;
      }

      .cd-progress.cd-fuse::before {
        content: '';
        position: absolute;
        right: calc(var(--cd-tip, 7px) * .5 + 1px);
        top: 50%;
        transform: translateY(-50%);
        width:  calc(var(--cd-tip, 7px) * .35);
        height: calc(var(--cd-tip, 7px) * .35);
        border-radius: 50%;
        background: color-mix(in srgb, var(--cd-color) 70%, ${BRAND_COLORS.focus});
        opacity: .7;
        animation: cd-fuse-ember 130ms ease-in-out infinite alternate-reverse;
        will-change: opacity, transform;
      }

      .cd-progress.cd-fuse-rtl {
        right: 0;
        left: auto;
        background: linear-gradient(
          to left,
          var(--cd-surface) 0%,
          color-mix(in srgb, var(--cd-color) 78%, var(--cd-surface)) 100%
        );
      }
      .cd-progress.cd-fuse-rtl::after {
        right: auto;
        left: calc(var(--cd-tip, 7px) * -.5);
      }
      .cd-progress.cd-fuse-rtl::before {
        right: auto;
        left: calc(var(--cd-tip, 7px) * .5 + 1px);
      }

      .cd-countdown {
        position: absolute;
        bottom: calc(var(--cd-ph, 2px) + 1px);
        right: 4px;
        font-size: .52rem;
        font-family: monospace;
        color: var(--cd-color, #C3A5E5);
        opacity: .55;
        pointer-events: none;
        letter-spacing: .03em;
        line-height: 1;
        z-index: 3;
        transition: opacity .3s;
      }
      .cd-progress.cd-fuse-rtl ~ .cd-countdown {
        right: auto;
        left: 4px;
      }
      .cd-wrap.cd-paused .cd-countdown {
        opacity: .3;
      }

      @keyframes cd-fuse-spark {
        from {
          transform: translateY(-50%) scale(1);
          box-shadow:
            0 0 calc(var(--cd-tip, 7px) * 1)   calc(var(--cd-tip, 7px) * .35) var(--cd-color),
            0 0 calc(var(--cd-tip, 7px) * 2.5) calc(var(--cd-tip, 7px) * .5)  var(--cd-color);
          opacity: 1;
        }
        to {
          transform: translateY(-50%) scale(1.25);
          box-shadow:
            0 0 calc(var(--cd-tip, 7px) * .6)  calc(var(--cd-tip, 7px) * .2)  var(--cd-color),
            0 0 calc(var(--cd-tip, 7px) * 1.8) calc(var(--cd-tip, 7px) * .35) var(--cd-color);
          opacity: .88;
        }
      }

      @keyframes cd-fuse-ember {
        from { opacity: .75; transform: translateY(-60%) scale(1);    }
        to   { opacity: .25; transform: translateY(-40%) scale(.6);   }
      }
    `;
    document.head.appendChild(s);
  }

  const TPL_REGEX = /\{\{=\s*([a-zA-Z]+)\s*\(([^)]*)\)\s*\}\}/g;

  const _tplRegistry = new Map();

  function _tplNum (id) {
    const el = document.getElementById(id.trim());
    if (!el) return NaN;
    return parseFloat(
      (el.innerText || el.textContent || '').replace(/[$€¥£,\s]/g, '').trim()
    );
  }
  function _tplText (id) {
    const el = document.getElementById(id.trim());
    return el ? (el.innerText || el.textContent || '').trim() : '';
  }
  function _tplFmt (val) {
    if (typeof val === 'number')
      return Number.isInteger(val) ? String(val) : String(parseFloat(val.toFixed(10)));
    return String(val);
  }
  function _tplEval (fn, rawArgs) {
    fn = fn.toLowerCase();
    const args = rawArgs.split(',').map(a => a.trim()).filter(Boolean);
    switch (fn) {
      case 'sum': {
        const ns = args.map(_tplNum).filter(n => !isNaN(n));
        return ns.length ? ns.reduce((a,b)=>a+b,0) : '-';
      }
      case 'avg': {
        const ns = args.map(_tplNum).filter(n => !isNaN(n));
        return ns.length ? parseFloat((ns.reduce((a,b)=>a+b,0)/ns.length).toFixed(6)) : '-';
      }
      case 'max': {
        const ns = args.map(_tplNum).filter(n => !isNaN(n));
        return ns.length ? Math.max(...ns) : '-';
      }
      case 'min': {
        const ns = args.map(_tplNum).filter(n => !isNaN(n));
        return ns.length ? Math.min(...ns) : '-';
      }
      case 'mul': {
        const ns = args.map(_tplNum).filter(n => !isNaN(n));
        return ns.length ? ns.reduce((a,b)=>a*b,1) : '-';
      }
      case 'sub': {
        const a=_tplNum(args[0]),b=_tplNum(args[1]);
        return (!isNaN(a)&&!isNaN(b)) ? a-b : '-';
      }
      case 'div': {
        const a=_tplNum(args[0]),b=_tplNum(args[1]);
        return (!isNaN(a)&&!isNaN(b)&&b!==0) ? parseFloat((a/b).toFixed(6)) : '-';
      }
      case 'val':   return _tplText(args[0]) || '-';
      case 'count': {
        if (args.length===1) {
          const el=document.getElementById(args[0]);
          return el ? el.children.length : 0;
        }
        return args.filter(id=>!!document.getElementById(id)).length;
      }
      case 'fmt': {
        const num=_tplNum(args[0]), dec=Math.max(0,parseInt(args[1]||0));
        return isNaN(num) ? '-'
          : num.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});
      }
      case 'pct': {
        const part=_tplNum(args[0]),total=_tplNum(args[1]),dec=Math.max(0,parseInt(args[2]||1));
        return (isNaN(part)||isNaN(total)||total===0) ? '-'
          : (part/total*100).toFixed(dec)+'%';
      }
      case 'concat': return args.map(_tplText).join('');
      default: return '[?'+fn+']';
    }
  }
  function _tplRefIds (rawArgs) {
    return new Set(
      rawArgs.split(',').map(a=>a.trim())
        .filter(a=>a.length>0 && !/^\d+(\.\d+)?$/.test(a))
    );
  }
  function _tplProcess (html) {
    const refIds=new Set();
    TPL_REGEX.lastIndex=0;
    const result = html.replace(TPL_REGEX,(match,fn,rawArgs)=>{
      _tplRefIds(rawArgs).forEach(id=>refIds.add(id));
      const val=_tplEval(fn,rawArgs);
      const enc=match.replace(/"/g,'&quot;');
      return '<span class="cd-tpl" data-tpl="'+enc+'">'+_tplFmt(val)+'</span>';
    });
    return {html:result, refIds};
  }
  function _tplRefreshSpan (span) {
    const raw=(span.getAttribute('data-tpl')||'').replace(/&quot;/g,'"');
    TPL_REGEX.lastIndex=0;
    const m=raw.match(/\{\{=\s*([a-zA-Z]+)\s*\(([^)]*)\)\s*\}\}/);
    if (!m) return;
    const newVal=_tplFmt(_tplEval(m[1],m[2]));
    if (span.textContent===newVal) return;
    span.textContent=newVal;
    span.classList.remove('cd-flash');
    void span.offsetWidth;
    span.classList.add('cd-flash');
  }
  function _tplObserve (refIds, cb) {
    refIds.forEach(id=>{
      if (!_tplRegistry.has(id)){
        const callbacks=new Set();
        const observer=new MutationObserver(()=>callbacks.forEach(f=>f()));
        _tplRegistry.set(id,{observer,callbacks});
        const tryConn=()=>{
          const el=document.getElementById(id);
          if (el) observer.observe(el,{childList:true,subtree:true,characterData:true});
        };
        if (document.readyState==='loading')
          document.addEventListener('DOMContentLoaded',tryConn,{once:true});
        else tryConn();
      }
      _tplRegistry.get(id).callbacks.add(cb);
    });
  }
  function _tplUnobserve (refIds, cb) {
    if (!refIds) return;
    refIds.forEach(id=>{
      const entry=_tplRegistry.get(id);
      if (!entry) return;
      entry.callbacks.delete(cb);
      if (entry.callbacks.size===0){entry.observer.disconnect();_tplRegistry.delete(id);}
    });
  }
  window.CellDrawerTPL={eval:_tplEval,process:_tplProcess};

  class CellLevel extends HTMLElement {}
  class CellStart extends HTMLElement {}

  class CellDrawer extends HTMLElement {

    static configure (opts) {
      Object.assign(DEFAULTS, opts);
    }
    static get colors () { return BRAND_COLORS; }
    static get themes () { return BRAND_COLORS; }
    static get background () { return BASE_BG; }

    static get observedAttributes () {
      return ['theme','strip-width','mode','level','show-badge','show-dots',
              'carousel-interval','progress-height','progress-style','progress-dir',
              'show-countdown','no-loop','strip-position',
              'slide-color','slide-padding','slide-line-height','height','btn-start'];
    }
    attributeChangedCallback (name, oldVal, newVal) {
      if (oldVal === newVal || !this._ready) return;
      if (name === 'level') {
        this.goTo(parseInt(newVal) || 0, false);
      } else if (name === 'show-badge') {
        this._applyBadgeVisibility();
      } else if (name === 'show-dots') {
        this._applyDotsVisibility();
      } else if (name === 'carousel-interval') {
        if (this._isCarousel()) { this._stopCarousel(); this._startCarousel(); }
      } else if (name === 'progress-height' || name === 'progress-style' || name === 'progress-dir') {
        this._applyProgressStyle();
      } else if (name === 'show-countdown') {
        this._applyCountdownVisibility();
      } else if (name === 'slide-color' || name === 'slide-padding' || name === 'slide-line-height') {
        this._applySlideStyle();
      } else if (name === 'strip-position') {
        this._applyStripPosition();
      } else if (name === 'height') {
        this._applyFixedHeight();
      } else if (name === 'mode') {
        this._applyCarouselMode();
        this._applyFixedHeight();
      } else {
        this._applyStripStyle();
      }
    }

    connectedCallback () {
      injectCSS();
      this._collectLevels();
      this._build();
      this._ready = true;
      this._dispatchReady();
    }

    disconnectedCallback () {
      this._stopCarousel();
      this._stopCountdown();
      if (this._tplCb) _tplUnobserve(this._tplRefIds, this._tplCb);
    }

    _collectLevels () {
      this._levels = Array.from(this.querySelectorAll(':scope > cell-level')).map(el => ({
        src:      el.getAttribute('src') || null,
        mode:     el.getAttribute('mode') || null,
        html:     el.innerHTML,
        hintPage: el.hasAttribute('hint-page'),
      }));

      const startEl = this.querySelector(':scope > cell-start');
      this._startData = startEl ? {
        html: startEl.innerHTML,
        icon: startEl.getAttribute('icon') || null,
      } : null;
    }

    _theme () {
      const raw = this.getAttribute('theme') || DEFAULTS.theme;
      const key = LEGACY_THEME_ALIASES[raw] || raw;
      return BRAND_COLORS[key] || raw;
    }

    _sw () {
      return parseInt(this.getAttribute('strip-width') || DEFAULTS.stripWidth);
    }

    _mode () {
      return this.getAttribute('mode') || DEFAULTS.mode;
    }

    _isCarousel () {
      return this._mode() === 'carousel';
    }
    _carouselInterval () {
      return Math.max(400, parseInt(this.getAttribute('carousel-interval') || DEFAULTS.carouselInterval));
    }
    _carouselPause () {

      const attr = this.getAttribute('carousel-pause');
      if (attr === 'false') return false;
      return DEFAULTS.carouselPause;
    }

    _hasBtnStart () {
      const v = this.getAttribute('btn-start');
      return v === 'true' || v === '';
    }

    _loopBack () {
      if (this.hasAttribute('no-loop')) return false;
      return DEFAULTS.loopBack;
    }

    _progressDir () {
      return (this.getAttribute('progress-dir') || DEFAULTS.progressDir).toLowerCase() === 'rtl' ? 'rtl' : 'ltr';
    }

    _showCountdown () {
      return this.hasAttribute('show-countdown');
    }

    _stripPosition () {
      const v = this.getAttribute('strip-position') || DEFAULTS.stripPosition;
      return v === 'right' ? 'right' : 'left';
    }
    _applyStripPosition () {
      if (!this._wrap) return;
      this._wrap.classList.toggle('cd-strip-right', this._stripPosition() === 'right');
    }

    _progressHeight () {
      return Math.max(1, parseInt(this.getAttribute('progress-height') || DEFAULTS.progressHeight));
    }
    _progressStyle () {
      return (this.getAttribute('progress-style') || DEFAULTS.progressStyle).toLowerCase();
    }
    _applyProgressStyle () {
      if (!this._progress || !this._wrap) return;
      const ph  = this._progressHeight();
      const pst = this._progressStyle();
      const dir = this._progressDir();

      this._wrap.style.setProperty('--cd-ph', ph + 'px');

      const tipPx = Math.max(ph * 3, 6);
      this._wrap.style.setProperty('--cd-tip', tipPx + 'px');

      this._progress.classList.toggle('cd-fuse',     pst === 'fuse');
      this._progress.classList.toggle('cd-fuse-rtl', pst === 'fuse' && dir === 'rtl');
    }

    _build () {
      this._curIdx = Math.max(0,
        Math.min(parseInt(this.getAttribute('level') || 0), this._levels.length - 1));

      this.innerHTML = '';

      const wrap = document.createElement('div');
      wrap.className = 'cd-wrap';
      this._wrap = wrap;

      const strip = document.createElement('div');
      strip.className = 'cd-strip';
      strip.setAttribute('role', 'button');
      strip.setAttribute('aria-label', '切換層級');
      strip.tabIndex = 0;
      this._strip = strip;

      const dots = document.createElement('div');
      dots.className = 'cd-strip-dots';
      this._dots = dots;
      strip.appendChild(dots);

      strip.addEventListener('click', () => this.next());
      strip.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.next(); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); this.prev(); }
      });

      const body = document.createElement('div');
      body.className = 'cd-body';
      this._body = body;

      const slide = document.createElement('div');
      slide.className = 'cd-slide';
      this._slide = slide;
      body.appendChild(slide);

      const badge = document.createElement('div');
      badge.className = 'cd-lv-badge';
      this._badge = badge;
      body.appendChild(badge);

      const progress = document.createElement('div');
      progress.className = 'cd-progress';
      this._progress = progress;
      body.appendChild(progress);

      const countdown = document.createElement('div');
      countdown.className = 'cd-countdown';
      countdown.style.display = 'none';
      this._countdownEl = countdown;
      body.appendChild(countdown);

      wrap.appendChild(strip);
      wrap.appendChild(body);

      this._startEl = null;
      if (this._startData) {
        const startDiv = document.createElement('div');
        startDiv.className = 'cd-start';
        startDiv.setAttribute('aria-label', 'cell-start');

        if (this._startData.icon) {
          const ico = document.createElement('i');
          ico.className = this._startData.icon + ' cd-start-icon';
          startDiv.appendChild(ico);
        }

        const txt = this._startData.html.trim();
        if (txt) {
          const sp = document.createElement('span');
          sp.className = 'cd-start-text';
          sp.innerHTML = txt;
          startDiv.appendChild(sp);
        }
        this._startEl = startDiv;
        wrap.appendChild(startDiv);
      }

      this._btnStartEl = null;
      if (this._hasBtnStart() && this._isCarousel()) {
        const btn = document.createElement('div');
        btn.className = 'cd-btnstart';
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-label', '開始輪播');
        btn.tabIndex = 0;

        const ico = document.createElement('span');
        ico.className = 'cd-btnstart-icon';
        ico.textContent = '▶';
        btn.appendChild(ico);

        const lbl = document.createElement('span');
        lbl.className = 'cd-btnstart-label';
        lbl.textContent = '開始';
        btn.appendChild(lbl);

        btn.addEventListener('click', () => this._triggerBtnStart());
        btn.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._triggerBtnStart(); }
        });

        this._btnStartEl = btn;
        wrap.appendChild(btn);
      }

      this.appendChild(wrap);

      wrap.addEventListener('mouseenter', () => {
        if (!this._isCarousel() || !this._carouselPause() || !this._carouselStarted) return;
        this._pauseCarousel();
      });
      wrap.addEventListener('mouseleave', () => {
        if (!this._isCarousel() || !this._carouselPause() || !this._carouselStarted) return;
        this._resumeCarousel();
      });

      this._applyStripStyle();
      this._applyStripPosition();
      this._applyFixedHeight();
      this._updateDots();
      this._applyCarouselMode();
      this._applyCountdownVisibility();
      this._loadContent(this._curIdx, false);
    }

    _applyStripStyle () {
      if (!this._wrap) return;
      const c = this._theme();
      this._wrap.style.setProperty('--cd-color', c);
      this._wrap.style.setProperty('--cd-sw', this._sw() + 'px');
      this._wrap.style.borderColor = c;
      this._applyProgressStyle();
      this._applyStartStyle();
      this._applySlideStyle();
    }

    _applySlideStyle () {
      if (!this._wrap) return;
      const sc  = this.getAttribute('slide-color')       || DEFAULTS.slideColor;
      const sp  = this.getAttribute('slide-padding')     || DEFAULTS.slidePadding;
      const slh = this.getAttribute('slide-line-height') || DEFAULTS.slideLineHeight;
      this._wrap.style.setProperty('--cd-sc',  sc);
      this._wrap.style.setProperty('--cd-sp',  sp);
      this._wrap.style.setProperty('--cd-slh', slh);
    }

    _isFixed () {
      return this._mode() === 'fixed';
    }

    _applyFixedHeight () {
      if (!this._wrap) return;
      const fixed = this._isFixed();
      this._wrap.classList.toggle('cd-fixed', fixed);
      if (fixed) {
        const h = this.getAttribute('height') || DEFAULTS.height;
        if (h && h !== 'auto') this._wrap.style.setProperty('--cd-h', h);
      } else {
        this._wrap.style.removeProperty('--cd-h');
      }
    }

    _triggerBtnStart () {
      if (this._btnStartEl) {
        this._btnStartEl.style.display = 'none';
      }
      this._carouselStarted = true;
      const curLevel = this._levels[this._curIdx];
      if (curLevel && curLevel.hintPage) {
        this.next();
      }
      this._startCarousel();
    }

    _applyStartStyle () {
      const c = this._theme();
      const r = parseInt(c.slice(1,3),16);
      const g = parseInt(c.slice(3,5),16);
      const b = parseInt(c.slice(5,7),16);
      const lum = 0.299*r + 0.587*g + 0.114*b;
      const textCol = lum > 140 ? BASE_BG : BRAND_COLORS.vanilla;
      const shade = 'color-mix(in srgb, ' + c + ' 60%, ' + BASE_BG + ')';

      if (this._wrap) this._wrap.style.setProperty('--cd-start-sep', shade);

      if (this._startEl) {
        this._startEl.style.background = c;
        this._startEl.style.color      = textCol;
        this._startEl.style.borderColor = c;
      }

      if (this._btnStartEl) {
        this._btnStartEl.style.background = c;
        this._btnStartEl.style.color      = textCol;
      }
    }

    _applyMode (modeOverride) {
      if (!this._slide) return;
      const m = modeOverride || this._currentLevelMode(this._curIdx);
      this._slide.classList.remove('mode-single', 'mode-auto', 'mode-fixed');
      if (m === 'auto') {
        this._slide.classList.add('mode-auto');
      } else if (m === 'fixed') {
        this._slide.classList.add('mode-fixed');
      } else {
        this._slide.classList.add('mode-single');
      }
    }

    _currentLevelMode (idx) {
      const lv = this._levels[idx];
      return (lv && lv.mode) ? lv.mode : this._mode();
    }

    _showBadge () {
      return this.hasAttribute('show-badge') || DEFAULTS.showBadge;
    }
    _showDots () {
      return this.hasAttribute('show-dots') || DEFAULTS.showDots;
    }
    _applyBadgeVisibility () {
      if (this._badge) this._badge.style.display = this._showBadge() ? '' : 'none';
    }
    _applyDotsVisibility () {
      if (this._dots) this._dots.style.display = this._showDots() ? '' : 'none';
    }

    _applyCarouselMode () {
      if (!this._wrap) return;
      if (this._isCarousel()) {
        this._wrap.classList.add('cd-carousel');

        if (this._slide) {
          this._slide.classList.remove('mode-auto');
          this._slide.classList.add('mode-single');
        }
        this._applyProgressStyle();
        if (!this._hasBtnStart()) {
          this._carouselStarted = true;
          this._startCarousel();
        }
      } else {
        this._wrap.classList.remove('cd-carousel', 'cd-paused');
        this._stopCarousel();
        this._applyMode();

        if (this._progress) this._progress.style.width = '0%';
      }
    }

    _startCarousel () {
      this._stopCarousel();
      if (!this._isCarousel() || this._levels.length < 2) return;
      const ms = this._carouselInterval();
      this._resetProgress(ms);
      this._carouselTid = setInterval(() => {
        this.next();
        this._resetProgress(ms);
      }, ms);
    }

    _stopCarousel () {
      if (this._carouselTid) {
        clearInterval(this._carouselTid);
        this._carouselTid = null;
      }
    }

    _pauseCarousel () {
      if (!this._carouselTid) return;
      clearInterval(this._carouselTid);
      this._carouselTid = null;

      if (this._progress && this._wrap) {
        const w = this._progress.getBoundingClientRect().width;
        const total = this._body.getBoundingClientRect().width || 1;
        const pct = (w / total * 100);
        const rtl = this._progressDir() === 'rtl';
        this._progress.style.transition = 'none';
        this._progress.style.width = pct.toFixed(2) + '%';
        this._wrap.classList.add('cd-paused');

        // 記錄暫停當下的剩餘毫秒，供 countdown 顯示
        const ratio = rtl ? pct / 100 : 1 - pct / 100;
        this._countdownPausedRemaining = Math.max(0, this._carouselInterval() * ratio);
      }
      this._stopCountdown();
    }

    _resumeCarousel () {
      if (this._carouselTid || !this._isCarousel()) return;
      if (this._wrap) this._wrap.classList.remove('cd-paused');

      const rtl = this._progressDir() === 'rtl';
      let remaining = this._carouselInterval();
      if (this._progress) {
        const w = parseFloat(this._progress.style.width) || 0;
        remaining = rtl
          ? Math.max(200, this._carouselInterval() * (w / 100))
          : Math.max(200, this._carouselInterval() * (1 - w / 100));

        this._progress.style.transition = 'width ' + remaining + 'ms linear';
        this._progress.style.width = rtl ? '0%' : '100%';
      }

      this._countdownMs    = remaining;
      this._countdownStart = performance.now();
      this._startCountdown();

      this._carouselTid = setTimeout(() => {
        this.next();
        this._startCarousel();
      }, remaining);
    }

    _resetProgress (ms) {
      if (!this._progress) return;
      ms = ms || this._carouselInterval();
      const rtl = this._progressDir() === 'rtl';

      this._progress.style.transition = 'none';
      this._progress.style.width = rtl ? '100%' : '0%';

      void this._progress.offsetWidth;
      this._progress.style.transition = 'width ' + ms + 'ms linear';
      this._progress.style.width = rtl ? '0%' : '100%';

      this._countdownMs   = ms;
      this._countdownStart = performance.now();
      this._startCountdown();
    }

    _startCountdown () {
      this._stopCountdown();
      if (!this._showCountdown() || !this._countdownEl) return;
      this._countdownEl.style.display = '';
      this._updateCountdownDisplay();
      this._countdownTid = setInterval(() => {
        this._updateCountdownDisplay();
      }, 250);
    }

    _stopCountdown () {
      if (this._countdownTid) {
        clearInterval(this._countdownTid);
        this._countdownTid = null;
      }
      if (this._countdownEl) this._countdownEl.style.display = 'none';
    }

    _updateCountdownDisplay () {
      if (!this._countdownEl || !this._countdownStart) return;
      const elapsed = performance.now() - this._countdownStart;
      const remaining = Math.max(0, this._countdownMs - elapsed);
      const secs = Math.ceil(remaining / 1000);
      this._countdownEl.textContent = secs + 's';
    }

    _applyCountdownVisibility () {
      if (!this._countdownEl) return;
      if (!this._showCountdown()) {
        this._stopCountdown();
      }
    }

    _updateDots () {
      if (!this._dots) return;
      this._dots.innerHTML = '';
      const count = Math.min(this._levels.length, 8);
      for (let i = 0; i < count; i++) {
        const d = document.createElement('span');
        d.className = 'cd-strip-dot' + (i === this._curIdx ? ' active' : '');
        this._dots.appendChild(d);
      }

      if (this._badge) {
        this._badge.textContent = this._levels.length > 1
          ? this._curIdx + '/' + (this._levels.length - 1)
          : '';
        this._applyBadgeVisibility();
      }
      this._applyDotsVisibility();
    }

    _getHTML (idx) {
      const lv = this._levels[idx];
      if (!lv) return '';
      if (lv.src) {
        const el = document.getElementById(lv.src);
        return el ? el.innerHTML : '<em style="color:' + BRAND_COLORS.warning + '">找不到 #' + lv.src + '</em>';
      }
      return lv.html;
    }

    _loadContent (idx, animate) {

      if (this._tplCb) _tplUnobserve(this._tplRefIds, this._tplCb);

      const rawHtml = this._getHTML(idx);
      const { html, refIds } = _tplProcess(rawHtml);

      this._tplRefIds = refIds;
      this._tplCb = () => {
        if (!this._slide) return;
        this._slide.querySelectorAll('.cd-tpl[data-tpl]').forEach(_tplRefreshSpan);
      };
      _tplObserve(refIds, this._tplCb);

      this._applyMode(this._currentLevelMode(idx));

      if (!animate) {
        this._slide.innerHTML = html;
        this._slide.style.transform  = '';
        this._slide.style.opacity    = '';
        this._slide.style.transition = '';
        return;
      }

      const ms = DEFAULTS.animMs;

      const isRight = this._stripPosition() === 'right';
      const outDir  = isRight ? '110%' : '-110%';
      const inDir   = isRight ? '-110%' : '110%';

      this._slide.style.transition = 'transform ' + ms + 'ms ease, opacity ' + ms + 'ms ease';
      this._slide.style.transform  = 'translateX(' + outDir + ')';
      this._slide.style.opacity    = '0';

      setTimeout(() => {

        this._slide.style.transition = 'none';
        this._slide.style.opacity    = '0';
        this._slide.style.transform  = 'translateX(' + inDir + ')';
        void this._slide.offsetWidth;
        this._slide.innerHTML = html;
        void this._slide.offsetWidth;
        this._slide.style.transition = 'transform ' + ms + 'ms ease, opacity ' + ms + 'ms ease';
        this._slide.style.transform  = 'translateX(0)';
        this._slide.style.opacity    = '1';
      }, ms);
    }

    goTo (idx, animate = false) {
      const max = this._levels.length - 1;
      idx = Math.max(0, Math.min(idx, max));
      if (idx === this._curIdx && animate) return;
      this._curIdx = idx;
      this._updateDots();
      this._loadContent(idx, animate);
      this.setAttribute('level', idx);
      this.dispatchEvent(new CustomEvent('cd-change', {
        detail: { level: idx, total: this._levels.length },
        bubbles: true,
      }));
    }

    next () {
      const max = this._levels.length - 1;
      if (this._curIdx >= max) {
        if (this._loopBack()) {
          this.goTo(0);
        } else {
          this._stopCarousel();
          this._stopCountdown();
          if (this._progress) {
            this._progress.style.transition = 'none';
            this._progress.style.width = this._progressDir() === 'rtl' ? '0%' : '100%';
          }
        }
      } else {
        this.goTo(this._curIdx + 1);
      }
    }

    prev () {
      if (this._curIdx <= 0) {
        if (this._loopBack()) this.goTo(this._levels.length - 1);
      } else {
        this.goTo(this._curIdx - 1);
      }
    }

    get currentLevel () { return this._curIdx; }

    startCarousel () { this._startCarousel(); }

    stopCarousel ()  { this._stopCarousel(); }

    _dispatchReady () {
      this.dispatchEvent(new CustomEvent('cd-ready', {
        detail: { level: this._curIdx, total: this._levels.length },
        bubbles: true,
      }));
    }
  }

  customElements.define('cell-level',  CellLevel);
  customElements.define('cell-start',  CellStart);
  customElements.define('cell-drawer', CellDrawer);

  window.CellDrawer = CellDrawer;

})();