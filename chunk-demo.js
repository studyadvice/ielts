(function (win, doc) {
  'use strict';
  const CSS_ID = '__chunk-demo-v6__';
  if (!doc.getElementById(CSS_ID)) {
    const s = doc.createElement('style');
    s.id = CSS_ID;
    s.textContent = `
/* 資料載體元素永遠隱藏 */
cd-chunk, cd-level { display: none !important; }

chunk-demo { display: block; }

/* ── 句子框 ─────────────────────────────── */
.cd-bar {
  display: flex; align-items: center; flex-wrap: wrap;
  gap: 4px 8px; padding: 16px 22px 8px;
  border-radius: 12px; border: 1px solid;
  font-size: 1.1rem; line-height: 2.2;
}

/* ── 語塊錨點（定位容器）────────────── */
.cd-anchor { position: relative; display: inline-flex; align-items: center; }
.cd-anchor-grp { display: inline-flex; align-items: center; }
.cd-anchor--full { flex-basis: 100%; }

/* ── 語塊按鈕 ───────────────────────────── */
.cd-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px 4px 9px;
  border-radius: 8px;
  border: 2px solid transparent;
  font-family: inherit; font-size: 0.95rem; line-height: 1.35;
  cursor: pointer;
  transition: filter .16s ease, box-shadow .16s ease;
  white-space: nowrap;
}
.cd-btn:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.cd-btn:hover         { filter: brightness(1.2); }
.cd-btn.is-open       { box-shadow: 0 0 0 3px rgba(255,255,255,.12); filter: brightness(1.18); }

.cd-b-icon { font-size: .9em; }
.cd-b-text { font-weight: 500; display: inline-block; }
.cd-b-arr  { font-size: .68em; opacity: .66; transition: transform .18s ease; margin-left: 1px; }
.cd-btn.is-open .cd-b-arr { transform: rotate(180deg); }

/* dot / dots-ext mode：隱藏箭頭 */
.cd-btn.cd-btn--dot .cd-b-arr,
.cd-btn.cd-btn--ext .cd-b-arr { display: none; }

/* dots-ext：點按時短暫縮放回饋 */
.cd-btn.cd-btn--ext { cursor: pointer; }
.cd-btn.cd-btn--ext:active { transform: scale(.96); transition: transform .08s ease; }

/* ── 遮罩模式（mask-mode）────────────────── */
.cd-btn.is-masked .cd-b-text {
  background   : var(--cd-mask-bg, #252625);
  color        : transparent;
  border-radius: 3px;
  padding      : 0 10px;
  min-width    : 48px;
  user-select  : none;
  transition   : none;
}
.cd-btn.is-masked:hover .cd-b-text {
  background: color-mix(in srgb, var(--cd-mask-bg, #252625) 80%, white);
}
.cd-btn.is-masked.is-open { box-shadow: 0 0 0 3px rgba(255,255,255,.12); }

/* ── 下拉選單 ───────────────────────────── */
.cd-dd {
  position: absolute;
  top: calc(100% + 6px); left: 0;
  z-index: 9999;
  border: 1px solid; border-radius: 10px; overflow: hidden;
  box-shadow: 0 16px 44px rgba(0,0,0,.72);
  min-width: 240px; max-width: 420px;
  opacity: 0; transform: translateY(-5px) scale(.985);
  pointer-events: none;
  transition: opacity .17s ease, transform .17s ease;
}
.cd-dd.cd-dd--up {
  top: auto; bottom: calc(100% + 6px);
  transform: translateY(5px) scale(.985);
}
.cd-dd.is-open { opacity: 1; transform: none; pointer-events: auto; }

.cd-dd-head {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 13px 7px;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.cd-h-lbl {
  font-size: .7rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase;
  color: #95C9DE;
}

.cd-lv {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255,255,255,.04);
  cursor: pointer; transition: background .12s; position: relative;
}
.cd-lv:last-child { border-bottom: none; }
.cd-lv:hover      { background: rgba(255,255,255,.04); }
.cd-lv.is-sel     { background: rgba(255,255,255,.07); }
.cd-lv.is-sel::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px; background: var(--sel-bar, var(--lc, #C6C7BD));
  border-radius: 0 2px 2px 0;
}
.cd-lv-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--lc, #C6C7BD); flex-shrink: 0; margin-top: 5px;
}
.cd-lv-text { font-size: .91rem; line-height: 1.5; color: #9da09a; white-space: normal; }
.cd-lv.is-sel .cd-lv-text { color: #dde0d8; }

/* ── 整句預覽 ───────────────────────────── */
.cd-preview {
  margin-top: 1px; padding: 3px;
  border-left: 3px solid var(--pvb, #B3DE73);
  border-radius: 0 6px 6px 0;
  background: var(--pvbg, rgba(255,255,255,.035));
}
.cd-pv-text { font-size: .9rem; font-style: italic; color: var(--pvt, #7a8078); }

.cd-translation {
  margin-top: 1px; padding: 3px;
  margin-left: var(--trl-indent, 0px);
  border-left: 3px solid var(--trlb, #C6C7BD);
  border-radius: 0 6px 6px 0;
  background: rgba(255,255,255,.025);
}
.cd-tr-text {
  font-size: .9rem; color: var(--trlc, #8C9088);
  letter-spacing: .01em; line-height: 1.25;
}

.cd-note {
  margin-top: 1px; padding: 3px;
  margin-left: var(--note-indent, 0px);
  border-left: 3px solid var(--noteb, #C6C7BD);
  border-radius: 0 6px 6px 0;
  background: rgba(255,255,255,.018);
}
.cd-note-text {
  font-size: .9rem; color: var(--notec, #6e7270);
  letter-spacing: .02em; line-height: 1.3; font-style: italic;
}

/* ── 鎖定語塊 ── */
.cd-btn.is-locked { opacity: 0.48; cursor: not-allowed; }
.cd-btn.is-locked:hover { filter: none !important; }
.cd-btn.is-locked:active { transform: none !important; }
.cd-btn.is-locked .cd-b-arr { opacity: 1; font-style: normal; }

/* ══ 圓點浮層（mode="dots"）══════════════════════ */
.cd-dots-pill {
  position: absolute;
  top: calc(100% + 6px); left: 50%;
  transform: translateX(-50%);
  translate: 0 -5px;
  scale: 0.90;
  z-index: 9999;
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  border-radius: 99px;
  border: 1px solid;
  box-shadow: 0 10px 32px rgba(0,0,0,.72);
  opacity: 0;
  pointer-events: none;
  transition: opacity .17s ease, translate .17s ease, scale .17s ease;
  white-space: nowrap;
}
.cd-dots-pill--up {
  top: auto; bottom: calc(100% + 6px);
  translate: 0 5px;
}
.cd-dots-pill.is-open {
  opacity: 1; translate: 0 0; scale: 1; pointer-events: auto;
}

/* ══ 圓點面板（mode="dots-ext"）══════════════════ */
.cd-dots-panel {
  border-radius: 10px;
  border: 1px solid;
  padding: 9px 12px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.cd-dots-panel--top  { margin-bottom: 9px; }
.cd-dots-panel--bottom { margin-top: 9px; }

/* 每一個 chunk 的橫列 */
.cd-dp-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 3px;
  border-radius: 8px;
  transition: background .18s ease;
}

/* pulse 高亮動畫（句子框內按鈕點擊時觸發）*/
@keyframes cd-row-pulse {
  0%   { background: transparent; }
  25%  { background: rgba(255,255,255,.09); }
  100% { background: transparent; }
}
.cd-dp-row.is-pulsed { animation: cd-row-pulse .45s ease forwards; }

/* {N} 標籤（有 label 屬性時改用內文字型，由 JS 處理）*/
.cd-dp-label {
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: .9rem;
  letter-spacing: .03em;
  min-width: 36px;
  flex-shrink: 0;
  user-select: none;
  opacity: .8;
  white-space: nowrap;
}

/* 圓點容器（dots mode 和 dots-ext panel 共用 .cd-dp-dot）*/
.cd-dp-dots {
  display: flex; align-items: center; gap: 16px;
}

/* ── 共用圓點樣式 ── */
.cd-dp-dot {
  width: 16px; height: 16px; border-radius: 50%;
  cursor: pointer; flex-shrink: 0;
  opacity: .7;
  transition: opacity .14s ease, transform .14s ease, box-shadow .14s ease;
}
.cd-dp-dot:hover    { opacity: .75; transform: scale(1.5); }
.cd-dp-dot.is-active {
  opacity: 1;
  transform: scale(1.5);
  box-shadow: 0 0 0 2.5px rgba(255,255,255,.22);
}

/* 文字切換動畫 (slide + fade) */
@keyframes cd-txt-out {
  0%   { opacity: 1; transform: translateY(0);     }
  100% { opacity: 0; transform: translateY(-11px); }
}
@keyframes cd-txt-in {
  0%   { opacity: 0; transform: translateY(11px); }
  100% { opacity: 1; transform: translateY(0);    }
}
.cd-b-text.cd-anim-out { animation: cd-txt-out .14s ease forwards; }
.cd-b-text.cd-anim-in  { animation: cd-txt-in  .14s ease forwards; }
    `.trim();
    (doc.head || doc.documentElement).appendChild(s);
  }

  const DEFAULTS = {
    themes: {
      shell:    { border: '#C6C7BD', text: '#C6C7BD', bg: 'rgba(198,199,189,.09)' },
      lavender: { border: '#C3A5E5', text: '#C3A5E5', bg: 'rgba(195,165,229,.09)' },
      special:  { border: '#B3DE73', text: '#B3DE73', bg: 'rgba(179,222,115,.09)' },
      warning:  { border: '#E6374B', text: '#E6374B', bg: 'rgba(230,55,75,.09)'   },
      salmon:   { border: '#E5C3B3', text: '#E5C3B3', bg: 'rgba(229,195,179,.09)' },
      sky:      { border: '#95C9DE', text: '#95C9DE', bg: 'rgba(149,201,222,.09)' },
      safe:     { border: '#299459', text: '#299459', bg: 'rgba(41,148,89,.09)'   },
      vanilla:  { border: '#DBEDD8', text: '#DBEDD8', bg: 'rgba(219,237,216,.09)' },
      focus:    { border: '#3C7BCF', text: '#3C7BCF', bg: 'rgba(60,123,207,.09)'  },
      yellow:   { border: '#E3D322', text: '#E3D322', bg: 'rgba(227,211,34,.09)'  },
      info:     { border: '#2351DB', text: '#2351DB', bg: 'rgba(35,81,219,.09)'   },
      indigo:   { border: '#7849C9', text: '#7849C9', bg: 'rgba(120,73,201,.09)'  },
      pink:     { border: '#FF91D7', text: '#FF91D7', bg: 'rgba(255,145,215,.09)' },
      orange:   { border: '#EDA109', text: '#EDA109', bg: 'rgba(237,161,9,.09)'   },
    },
    defaultTheme:     'special',
    chunkBorderWidth: '1.5px',
    chunkBorderStyle: 'solid',

    levelDotColors: {
      1: '#299459',
      2: '#E3D322',
      3: '#C3A5E5',
      4: '#1CCAE8',
      5: '#E6374B',
      6: '#EDA109',
      7: '#FF91D7',
      8: '#95C9DE',
    },

    fixedTextColor:     '#C6C7BD',
    sentenceBg:         '#161816',
    sentenceBorder:     '#222422',
    dropdownBg:         '#1d1f1d',
    dropdownBorder:     '#2c2e2c',
    previewBorderColor: null,
    previewTextColor:   null,
    previewBg:          null,
    showPreview:        false,
    showDots:           true,
    maskMode:           false,
    maskColor:          '#252625',
    width:              null,
    dropdownWidth:      null,
    buttonWidth:        null,
    longChunkThreshold: 0.52,

    showTranslation:        false,
    translationColor:       '#8C9088',
    translationBorderColor: null,
    translationIndent:      0,

    showNote:        false,
    noteColor:       '#6e7270',
    noteBorderColor: null,
    noteIndent:      0,

    mode:    'dropdown',   /* 'dropdown' | 'dots' | 'dots-ext' */
    dotsPos: 'bottom',     /* 'bottom' | 'top'  — dots-ext 面板位置 */
  };

  class ChunkDemo extends HTMLElement {

    static get observedAttributes() {
      return [
        'sentence', 'chunks', 'show-preview',
        'theme', 'border-width', 'border-style', 'data-config',
        'show-dots', 'width', 'dropdown-width', 'button-width',
        'level-colors', 'mask-mode',
        'translation', 'show-translation', 'translation-indent',
        'note', 'show-note', 'note-indent',
        'long-chunk-threshold',
        'lock-chunks',
        'mode',       /* 'dropdown' | 'dots' | 'dots-ext' */
        'dots-pos',   /* 'bottom' | 'top'  */
      ];
    }

    constructor() {
      super();
      this._state    = [];
      this._chunks   = [];
      this._sent     = '';
      this._openId   = null;
      this._btns     = {};
      this._dds      = {};
      this._pills    = {};
      this._panel    = null;   /* dots-ext 面板參考 */
      this._ready    = false;
      this._revealed = new Set();
      this._ro       = null;
      this._locked   = new Set();
      this._docClick = () => this._close();
      this._docKey   = e => { if (e.key === 'Escape') this._close(); };
    }

    connectedCallback() {
      doc.addEventListener('click',   this._docClick);
      doc.addEventListener('keydown', this._docKey);

      if (typeof ResizeObserver !== 'undefined') {
        this._ro = new ResizeObserver(() => {
          const bar = this.querySelector('.cd-bar');
          if (bar) this._checkLongBtns(bar);
        });
        this._ro.observe(this);
      }

      setTimeout(() => { this._ready = true; this._init(); }, 0);
    }

    disconnectedCallback() {
      doc.removeEventListener('click',   this._docClick);
      doc.removeEventListener('keydown', this._docKey);
      this._ro?.disconnect();
      this._ro = null;
    }

    attributeChangedCallback() {
      if (this.isConnected && this._ready) this._init();
    }

    _cfg() {
      const G = win.ChunkDemoConfig || {};
      let E = {};
      try { E = JSON.parse(this.getAttribute('data-config') || '{}'); } catch {}

      const cfg = {
        ...DEFAULTS, ...G, ...E,
        themes        : { ...DEFAULTS.themes,         ...(G.themes         || {}), ...(E.themes         || {}) },
        levelDotColors: { ...DEFAULTS.levelDotColors, ...(G.levelDotColors || {}), ...(E.levelDotColors || {}) },
      };

      const name  = this.getAttribute('theme') || cfg.defaultTheme || 'special';
      cfg._theme  = cfg.themes[name] || cfg.themes.special || DEFAULTS.themes.special;

      if (this.getAttribute('border-width')) cfg.chunkBorderWidth = this.getAttribute('border-width');
      if (this.getAttribute('border-style')) cfg.chunkBorderStyle = this.getAttribute('border-style');

      const lcAttr = this.getAttribute('level-colors');
      if (lcAttr) {
        lcAttr.split(',').forEach((color, i) => {
          const c = color.trim();
          if (c) cfg.levelDotColors[i + 1] = c;
        });
      }

      const sdAttr = this.getAttribute('show-dots');
      if (sdAttr !== null) cfg.showDots = sdAttr !== 'false';

      if (this.getAttribute('width'))          cfg.width         = this.getAttribute('width');
      if (this.getAttribute('dropdown-width')) cfg.dropdownWidth = this.getAttribute('dropdown-width');
      if (this.getAttribute('button-width'))   cfg.buttonWidth   = this.getAttribute('button-width');

      const mmAttr = this.getAttribute('mask-mode');
      if (mmAttr !== null) cfg.maskMode = mmAttr === 'true';

      const stAttr = this.getAttribute('show-translation');
      if (stAttr !== null) cfg.showTranslation = stAttr === 'true';

      const tiAttr = this.getAttribute('translation-indent');
      if (tiAttr !== null) cfg.translationIndent = parseFloat(tiAttr) || 0;

      const snAttr = this.getAttribute('show-note');
      if (snAttr !== null) cfg.showNote = snAttr === 'true';

      const niAttr = this.getAttribute('note-indent');
      if (niAttr !== null) cfg.noteIndent = parseFloat(niAttr) || 0;

      const lctAttr = this.getAttribute('long-chunk-threshold');
      if (lctAttr !== null) {
        const v = parseFloat(lctAttr);
        if (!isNaN(v)) cfg.longChunkThreshold = v;
      }

      const modeAttr = this.getAttribute('mode');
      if (['dropdown','dots','dots-ext'].includes(modeAttr)) cfg.mode = modeAttr;

      const dpAttr = this.getAttribute('dots-pos');
      if (dpAttr === 'top' || dpAttr === 'bottom') cfg.dotsPos = dpAttr;

      cfg._pvColor   = cfg.previewBorderColor || cfg._theme.border;
      cfg._maskColor = cfg.maskColor || DEFAULTS.maskColor;
      cfg._trColor   = cfg.translationBorderColor || cfg._theme.border;
      cfg._noteColor = cfg.noteBorderColor || cfg._theme.border;

      return cfg;
    }

    _parseChildren(cdChunks) {
      return cdChunks.map((el, i) => {
        const rawId    = el.getAttribute('id');
        const cdLevels = Array.from(el.querySelectorAll('cd-level'));
        return {
          id          : rawId !== null ? parseInt(rawId) : i,
          icon        : el.getAttribute('icon')          || '',
          label       : el.getAttribute('label')         ?? '',
          currentLevel: parseInt(el.getAttribute('current-level') || '1'),
          levels      : cdLevels.map((lv, j) => ({
            level: parseInt(lv.getAttribute('level') || String(j + 1)),
            text : lv.innerHTML.trim(),
            trans: lv.getAttribute('trans') ?? '',
          })),
        };
      });
    }

    _init() {
      const cdChunks = Array.from(this.querySelectorAll(':scope > cd-chunk'));
      let chunks;

      if (cdChunks.length > 0) {
        chunks = this._parseChildren(cdChunks);
      } else {
        try { chunks = JSON.parse(this.getAttribute('chunks') || '[]'); } catch { chunks = []; }
      }

      this._sent   = this.getAttribute('sentence')    || '';
      this._trans  = this.getAttribute('translation') || '';
      this._chunks = chunks;

      const lcAttrRaw = this.getAttribute('lock-chunks') || '';
      this._locked = new Set(
        lcAttrRaw.split(',')
          .map(s => parseInt(s.trim(), 10))
          .filter(n => !isNaN(n))
      );

      const prev  = this._state;
      this._state = chunks.map(c => {
        const p = prev.find(s => s.id === c.id);
        return { id: c.id, level: p ? p.level : (c.currentLevel || 1) };
      });

      this._revealed = new Set();
      this._openId   = null;
      this._draw();
    }

    _draw() {
      const srcNodes = Array.from(this.querySelectorAll(':scope > cd-chunk'));
      this.innerHTML = '';
      this._btns  = {};
      this._dds   = {};
      this._pills = {};
      this._panel = null;
      srcNodes.forEach(n => this.appendChild(n));

      const cfg = this._cfg();

      if (cfg.width) {
        this.style.width = cfg.width;
      } else {
        this.style.removeProperty('width');
      }

      if (cfg.maskMode) {
        this.style.setProperty('--cd-mask-bg', cfg._maskColor);
      } else {
        this.style.removeProperty('--cd-mask-bg');
      }

      const bar = this._buildBar(cfg);
      this.appendChild(bar);
      requestAnimationFrame(() => this._checkLongBtns(bar, cfg));

      if (cfg.mode === 'dots-ext') {
        const panel = this._mkDotsPanel(cfg);
        if (cfg.dotsPos === 'top') {
          this.insertBefore(panel, bar);   /* 插在 bar 之前 */
          panel.classList.add('cd-dots-panel--top');
        } else {
          this.appendChild(panel);
          panel.classList.add('cd-dots-panel--bottom');
        }
        this._panel = panel;
      }

      /* 整句預覽 */
      const showPrev =
        this.getAttribute('show-preview') === 'true' ||
        (this.getAttribute('show-preview') === null && cfg.showPreview);

      if (showPrev) {
        const pv = doc.createElement('div');
        pv.className = 'cd-preview';
        pv.style.setProperty('--pvb', cfg._pvColor);
        if (cfg.previewTextColor) pv.style.setProperty('--pvt',  cfg.previewTextColor);
        if (cfg.previewBg)        pv.style.setProperty('--pvbg', cfg.previewBg);
        const t     = doc.createElement('div');
        t.className = 'cd-pv-text';
        t.innerHTML = this._full();
        pv.appendChild(t);
        this.appendChild(pv);
      }

      /* 翻譯 */
      const showTrans =
        this.getAttribute('show-translation') === 'true' ||
        (this.getAttribute('show-translation') === null && cfg.showTranslation);

      if (showTrans && this._trans) {
        const tr = doc.createElement('div');
        tr.className = 'cd-translation';
        tr.style.setProperty('--trlb', cfg._trColor);
        if (cfg.translationColor)  tr.style.setProperty('--trlc', cfg.translationColor);
        if (cfg.translationIndent) tr.style.setProperty('--trl-indent', cfg.translationIndent + 'px');
        const tt     = doc.createElement('div');
        tt.className = 'cd-tr-text';
        tt.innerHTML = this._fullTrans();
        tr.appendChild(tt);
        this.appendChild(tr);
      }

      /* 備註 */
      const showNote =
        this.getAttribute('show-note') === 'true' ||
        (this.getAttribute('show-note') === null && cfg.showNote);
      const noteText = this.getAttribute('note') || '';
      if (showNote && noteText) {
        const nt = doc.createElement('div');
        nt.className = 'cd-note';
        nt.style.setProperty('--noteb', cfg._noteColor);
        if (cfg.noteColor)  nt.style.setProperty('--notec', cfg.noteColor);
        if (cfg.noteIndent) nt.style.setProperty('--note-indent', cfg.noteIndent + 'px');
        const ntx     = doc.createElement('div');
        ntx.className = 'cd-note-text';
        ntx.innerHTML = noteText;
        nt.appendChild(ntx);
        this.appendChild(nt);
      }
    }

    _buildBar(cfg) {
      const bar = doc.createElement('div');
      bar.className        = 'cd-bar';
      bar.style.background  = cfg.sentenceBg;
      bar.style.borderColor = cfg.sentenceBorder;

      const PUNCT_RE = /^([.,!?;:…\u3002\uff0c\uff01\uff1f\uff1b\uff1a]+)([\s\S]*)$/;
      const parts    = this._sent.split(/(\{\d+\})/);

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const m    = part.match(/^\{(\d+)\}$/);

        if (m) {
          const chunk = this._chunks.find(c => c.id === +m[1]);
          if (!chunk) continue;

          const anchor   = this._mkAnchor(chunk, cfg);
          const nextPart = parts[i + 1] ?? '';
          const punctM   = PUNCT_RE.exec(nextPart);

          if (punctM) {
            const grp = doc.createElement('span');
            grp.className = 'cd-anchor-grp';
            grp.appendChild(anchor);
            const ps = doc.createElement('span');
            ps.style.color = cfg.fixedTextColor;
            ps.textContent = punctM[1];
            grp.appendChild(ps);
            bar.appendChild(grp);
            parts[i + 1] = punctM[2];
          } else {
            bar.appendChild(anchor);
          }

        } else if (part) {
          const sp = doc.createElement('span');
          sp.style.color = cfg.fixedTextColor;
          sp.textContent = part;
          bar.appendChild(sp);
        }
      }

      return bar;
    }

    _checkLongBtns(bar, cfg) {
      if (!cfg) cfg = this._cfg();
      const padH      = 44;
      const barW      = bar.clientWidth - padH;
      if (barW <= 0) return;

      const threshold = cfg.longChunkThreshold ?? DEFAULTS.longChunkThreshold;

      bar.querySelectorAll(':scope > .cd-anchor, :scope > .cd-anchor-grp').forEach(el => {
        const btn = el.querySelector('.cd-btn');
        if (!btn) return;
        el.classList.toggle('cd-anchor--full', btn.scrollWidth > barW * threshold);
      });
    }

    /* ── 建立錨點（三種模式分支）────────────── */
    _mkAnchor(chunk, cfg) {
      const st       = this._state.find(s => s.id === chunk.id) || { level: 1 };
      const lvNum    = st.level;
      const lvD      = chunk.levels.find(l => l.level === lvNum) || chunk.levels[0];
      const th       = cfg._theme;
      const bw       = cfg.chunkBorderWidth || '1.5px';
      const bs       = cfg.chunkBorderStyle || 'solid';
      const isMasked = cfg.maskMode && !this._revealed.has(chunk.id);
      const isLocked = this._locked.has(chunk.id);
      const mode     = cfg.mode;

      const anchor     = doc.createElement('div');
      anchor.className = 'cd-anchor';

      const btn     = doc.createElement('button');
      btn.className = 'cd-btn' +
        (isMasked          ? ' is-masked'   : '') +
        (isLocked          ? ' is-locked'   : '') +
        (mode === 'dots'   ? ' cd-btn--dot' : '') +
        (mode === 'dots-ext' ? ' cd-btn--ext' : '');
      btn.style.cssText =
        `border-color:${th.border};border-width:${bw};border-style:${bs};` +
        `color:${th.text};background:${th.bg};`;

      if (cfg.buttonWidth) btn.style.minWidth = cfg.buttonWidth;

      if (chunk.icon) {
        const ic       = doc.createElement('span');
        ic.className   = 'cd-b-icon';
        ic.textContent = chunk.icon;
        btn.appendChild(ic);
      }

      const tx     = doc.createElement('span');
      tx.className = 'cd-b-text';
      tx.innerHTML = lvD?.text ?? '—';
      btn.appendChild(tx);

      if (mode === 'dropdown') {
        const arr       = doc.createElement('span');
        arr.className   = 'cd-b-arr';
        arr.textContent = isLocked ? '🔒' : '▾';
        arr.setAttribute('aria-hidden', 'true');
        btn.appendChild(arr);
      }

      if (mode === 'dots') {
        btn.addEventListener('click', e => { e.stopPropagation(); this._toggleDot(chunk.id); });
      } else if (mode === 'dots-ext') {
        btn.addEventListener('click', e => { e.stopPropagation(); this._pingPanelRow(chunk.id); });
      } else {
        btn.addEventListener('click', e => { e.stopPropagation(); this._toggle(chunk.id); });
      }

      this._btns[chunk.id] = btn;
      anchor.appendChild(btn);

      if (mode === 'dots') {
        const pill = this._mkDotPill(chunk, cfg, lvNum);
        this._pills[chunk.id] = pill;
        anchor.appendChild(pill);
      } else if (mode === 'dropdown') {
        const dd = this._mkDD(chunk, cfg, lvNum);
        this._dds[chunk.id] = dd;
        anchor.appendChild(dd);
      }

      return anchor;
    }

    _mkDD(chunk, cfg, currentLevel) {
      const dd     = doc.createElement('div');
      dd.className = 'cd-dd';
      dd.style.background  = cfg.dropdownBg;
      dd.style.borderColor = cfg.dropdownBorder;

      if (cfg.dropdownWidth) {
        dd.style.minWidth = cfg.dropdownWidth;
        dd.style.maxWidth = cfg.dropdownWidth;
      }

      const lbl = (typeof chunk.label === 'string') ? chunk.label.trim() : '';
      if (lbl) {
        const hd     = doc.createElement('div');
        hd.className = 'cd-dd-head';
        if (chunk.icon) {
          const ic       = doc.createElement('span');
          ic.textContent = chunk.icon;
          hd.appendChild(ic);
        }
        const lb       = doc.createElement('span');
        lb.className   = 'cd-h-lbl';
        lb.textContent = lbl;
        hd.appendChild(lb);
        dd.appendChild(hd);
      }

      chunk.levels.forEach(lv => {
        const dotC  = cfg.levelDotColors[lv.level] || '#C6C7BD';
        const isSel = lv.level === currentLevel;

        const row     = doc.createElement('div');
        row.className = 'cd-lv' + (isSel ? ' is-sel' : '');
        row.style.setProperty('--lc', dotC);
        if (isSel) row.style.setProperty('--sel-bar', cfg._theme.border);

        if (cfg.showDots !== false) {
          const dot     = doc.createElement('span');
          dot.className = 'cd-lv-dot';
          row.appendChild(dot);
        }

        const text     = doc.createElement('div');
        text.className = 'cd-lv-text';
        text.innerHTML = lv.text;
        row.appendChild(text);

        row.addEventListener('click', e => { e.stopPropagation(); this._pick(chunk.id, lv.level); });
        dd.appendChild(row);
      });

      return dd;
    }

    _mkDotPill(chunk, cfg, currentLevel) {
      const pill = doc.createElement('div');
      pill.className = 'cd-dots-pill';
      pill.style.background  = cfg.dropdownBg;
      pill.style.borderColor = cfg.dropdownBorder;

      chunk.levels.forEach(lv => {
        const dotC    = cfg.levelDotColors[lv.level] || '#C6C7BD';
        const isActive = lv.level === currentLevel;

        const dot     = doc.createElement('span');
        dot.className = 'cd-dp-dot' + (isActive ? ' is-active' : '');
        dot.style.background = dotC;
        dot.dataset.level    = String(lv.level);
        dot.title = lv.text.replace(/<[^>]+>/g, '').trim();

        dot.addEventListener('click', e => {
          e.stopPropagation();
          this._pickDot(chunk.id, lv.level);
        });
        pill.appendChild(dot);
      });

      return pill;
    }

    _mkDotsPanel(cfg) {
      const panel = doc.createElement('div');
      panel.className = 'cd-dots-panel';
      panel.style.background  = cfg.dropdownBg;
      panel.style.borderColor = cfg.dropdownBorder;

      this._chunks.forEach(chunk => {
        const st      = this._state.find(s => s.id === chunk.id) || { level: 1 };
        const currLvl = st.level;
        const isLocked = this._locked.has(chunk.id);

        const row = doc.createElement('div');
        row.className = 'cd-dp-row';
        row.dataset.chunkId = String(chunk.id);

        const lbl = doc.createElement('span');
        lbl.className = 'cd-dp-label';
        const hasLabel = typeof chunk.label === 'string' && chunk.label.trim() !== '';
        lbl.textContent = hasLabel ? chunk.label.trim() : `{${chunk.id}}`;
        lbl.style.color = cfg._theme.text;
        if (hasLabel) lbl.style.fontFamily = 'inherit';
        row.appendChild(lbl);

        const dotsWrap = doc.createElement('span');
        dotsWrap.className = 'cd-dp-dots';

        chunk.levels.forEach(lv => {
          const dotC    = cfg.levelDotColors[lv.level] || '#C6C7BD';
          const isActive = lv.level === currLvl;

          const dot = doc.createElement('span');
          dot.className = 'cd-dp-dot' + (isActive ? ' is-active' : '');
          dot.style.background = dotC;
          dot.dataset.level    = String(lv.level);
          dot.title = lv.text.replace(/<[^>]+>/g, '').trim();

          if (!isLocked) {
            dot.addEventListener('click', e => {
              e.stopPropagation();
              this._pickExt(chunk.id, lv.level);
            });
          } else {
            dot.style.cursor = 'not-allowed';
            dot.style.opacity = '0.2';
          }

          dotsWrap.appendChild(dot);
        });

        row.appendChild(dotsWrap);
        panel.appendChild(row);
      });

      return panel;
    }

    _pickExt(id, level) {
      const st = this._state.find(s => s.id === id);
      if (!st) return;
      if (st.level === level) return;

      this._revealed.add(id);

      const chunk = this._chunks.find(c => c.id === id);
      const lvD   = chunk?.levels.find(l => l.level === level) || chunk?.levels[0];
      if (!lvD) return;

      const btn    = this._btns[id];
      const txSpan = btn?.querySelector('.cd-b-text');

      if (!txSpan) {
        st.level = level;
        this._draw();
        return;
      }

      const ANIM_DUR = 140;

      txSpan.classList.add('cd-anim-out');

      setTimeout(() => {
        st.level         = level;
        txSpan.innerHTML = lvD.text;
        txSpan.classList.remove('cd-anim-out');

        if (btn.classList.contains('is-masked')) btn.classList.remove('is-masked');

        txSpan.classList.add('cd-anim-in');
        setTimeout(() => txSpan.classList.remove('cd-anim-in'), ANIM_DUR);

        if (this._panel) {
          const row = this._panel.querySelector(`.cd-dp-row[data-chunk-id="${id}"]`);
          if (row) {
            row.querySelectorAll('.cd-dp-dot').forEach(dot => {
              dot.classList.toggle('is-active', parseInt(dot.dataset.level) === level);
            });
          }
        }

        this._updateSubs();
      }, ANIM_DUR);
    }

    _pingPanelRow(id) {
      if (!this._panel) return;
      const row = this._panel.querySelector(`.cd-dp-row[data-chunk-id="${id}"]`);
      if (!row) return;
      row.classList.remove('is-pulsed');
      void row.offsetWidth;                           /* 強制 reflow，重啟動畫 */
      row.classList.add('is-pulsed');
      row.addEventListener('animationend', () => row.classList.remove('is-pulsed'), { once: true });
    }

    _toggleDot(id) {
      if (this._locked.has(id)) return;
      if (this._openId === id) { this._close(); return; }
      this._close();
      this._openId = id;
      this._btns[id]?.classList.add('is-open');

      const pill = this._pills[id];
      if (!pill) return;

      const btn        = this._btns[id];
      const btnRect    = btn.getBoundingClientRect();
      const pillH      = pill.scrollHeight || 36;
      const spaceBelow = win.innerHeight - btnRect.bottom;
      const spaceAbove = btnRect.top;

      if (spaceBelow < pillH + 16 && spaceAbove > pillH + 16) {
        pill.classList.add('cd-dots-pill--up');
      } else {
        pill.classList.remove('cd-dots-pill--up');
      }

      pill.classList.add('is-open');

      requestAnimationFrame(() => {
        if (!this._pills[id]) return;
        const r = pill.getBoundingClientRect();
        if (r.right > win.innerWidth - 8) {
          pill.style.left      = 'auto';
          pill.style.right     = '0';
          pill.style.transform = 'none';
        } else if (r.left < 8) {
          pill.style.left      = '0';
          pill.style.right     = 'auto';
          pill.style.transform = 'none';
        }
      });
    }

    _pickDot(id, level) {
      const st = this._state.find(s => s.id === id);
      if (!st) return;
      if (st.level === level) { this._close(); return; }

      this._revealed.add(id);
      this._close();

      const chunk = this._chunks.find(c => c.id === id);
      const lvD   = chunk?.levels.find(l => l.level === level) || chunk?.levels[0];
      if (!lvD) return;

      const btn    = this._btns[id];
      const txSpan = btn?.querySelector('.cd-b-text');

      if (!txSpan) {
        st.level = level;
        this._draw();
        return;
      }

      const ANIM_DUR = 140;

      txSpan.classList.add('cd-anim-out');

      setTimeout(() => {
        st.level         = level;
        txSpan.innerHTML = lvD.text;
        txSpan.classList.remove('cd-anim-out');

        if (btn.classList.contains('is-masked')) btn.classList.remove('is-masked');

        txSpan.classList.add('cd-anim-in');
        setTimeout(() => txSpan.classList.remove('cd-anim-in'), ANIM_DUR);

        const pill = this._pills[id];
        if (pill) {
          pill.querySelectorAll('.cd-dp-dot').forEach(dot => {
            dot.classList.toggle('is-active', parseInt(dot.dataset.level) === level);
          });
        }

        this._updateSubs();
      }, ANIM_DUR);
    }

    _updateSubs() {
      const pvText = this.querySelector('.cd-pv-text');
      if (pvText) pvText.innerHTML = this._full();

      const trText = this.querySelector('.cd-tr-text');
      if (trText) trText.innerHTML = this._fullTrans();
    }

    _toggle(id) {
      if (this._locked.has(id)) return;
      if (this._openId === id) { this._close(); return; }
      this._close();
      this._openId = id;
      this._btns[id]?.classList.add('is-open');
      const dd = this._dds[id];
      if (!dd) return;

      const btn        = this._btns[id];
      const btnRect    = btn.getBoundingClientRect();
      const ddH        = dd.offsetHeight;
      const spaceBelow = win.innerHeight - btnRect.bottom;
      const spaceAbove = btnRect.top;

      if (spaceBelow < ddH + 8 && spaceAbove > ddH + 8) {
        dd.classList.add('cd-dd--up');
        dd.style.top    = 'auto';
        dd.style.bottom = 'calc(100% + 6px)';
      } else {
        dd.classList.remove('cd-dd--up');
        dd.style.top    = 'calc(100% + 6px)';
        dd.style.bottom = 'auto';
      }

      dd.classList.add('is-open');

      requestAnimationFrame(() => {
        if (!this._dds[id]) return;
        const r        = dd.getBoundingClientRect();
        dd.style.left  = r.right > win.innerWidth - 8 ? 'auto' : '0';
        dd.style.right = r.right > win.innerWidth - 8 ? '0'    : 'auto';
      });
    }

    _close() {
      if (this._openId === null) return;
      this._btns[this._openId]?.classList.remove('is-open');

      const dd = this._dds[this._openId];
      if (dd) {
        dd.classList.remove('is-open', 'cd-dd--up');
        dd.style.top    = '';
        dd.style.bottom = '';
        dd.style.left   = '';
        dd.style.right  = '';
      }

      const pill = this._pills[this._openId];
      if (pill) {
        pill.classList.remove('is-open', 'cd-dots-pill--up');
        pill.style.left      = '';
        pill.style.right     = '';
        pill.style.transform = '';
      }

      this._openId = null;
    }

    _pick(id, level) {
      const st = this._state.find(s => s.id === id);
      if (st) st.level = level;
      this._revealed.add(id);
      this._close();
      this._draw();
    }

    _full() {
      let result = this._sent;
      this._chunks.forEach(c => {
        const lvNum = (this._state.find(st => st.id === c.id) || {}).level || 1;
        const lvD   = c.levels.find(l => l.level === lvNum) || c.levels[0];
        result = result.replace(`{${c.id}}`, lvD?.text ?? '…');
      });
      return result;
    }

    _fullTrans() {
      if (!this._trans) return '';
      let result = this._trans;
      this._chunks.forEach(c => {
        const lvNum = (this._state.find(st => st.id === c.id) || {}).level || 1;
        const lvD   = c.levels.find(l => l.level === lvNum) || c.levels[0];
        result = result.replace(`{${c.id}}`, lvD?.trans || lvD?.text || '…');
      });
      return result;
    }

    unlockChunk(id) {
      const n = parseInt(id, 10);
      if (!isNaN(n) && this._locked.has(n)) {
        this._locked.delete(n);
        this._draw();
      }
    }

    lockChunk(id) {
      const n = parseInt(id, 10);
      if (!isNaN(n) && !this._locked.has(n)) {
        if (this._openId === n) this._close();
        this._locked.add(n);
        this._draw();
      }
    }
  }

  if (!customElements.get('chunk-demo')) {
    customElements.define('chunk-demo', ChunkDemo);
  }

}(window, document));