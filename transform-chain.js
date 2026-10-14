(function () {
  'use strict';

  /* ─── Palette ─────────────────────────────────────────────────────────── */
  const P = {
    background:'#0C0D0C', shell:'#C6C7BD', lavender:'#C3A5E5',
    sky:'#82C8E5',     warning:'#E6374B',  salmon:'#E5C3B3',
    ocean:'#1CCAE8',   safe:'#27AE60',     teal:'#0DA591',
    vanilla:'#DBEDD8', yellow:'#E3D322',   focus:'#D4FFFC',
    special:'#B3DE73', info:'#4171BF',     indigo:'#7849C9',
    pink:'#FF91D7',    orange:'#EDA109',
  };
  const clr = k => P[k] || k || '#C6C7BD';
  const lum = h => {
    if (!h?.startsWith('#')) return 128;
    const r=parseInt(h.slice(1,3),16), g=parseInt(h.slice(3,5),16), b=parseInt(h.slice(5,7),16);
    return (r*299 + g*587 + b*114) / 1000;
  };
  const fg = t => lum(clr(t)) < 160 ? '#C6C7BD' : '#0C0D0C';

  /* ─── Attr helpers ────────────────────────────────────────────────────── */
  const sa = (el,n,d) => el.hasAttribute(n) ? el.getAttribute(n) : d;
  const ba = (el,n,d) => {
    if (!el.hasAttribute(n)) return d;
    const v = el.getAttribute(n);
    return (v===''||v==='true') ? true : v==='false' ? false : d;
  };
  const na = (el,n,d) => { const v=parseInt(el.getAttribute(n)); return isNaN(v)?d:v; };

  /* ─── Global styles (injected once) ──────────────────────────────────── */
  if (!document.getElementById('tc-css')) {
    const s = document.createElement('style');
    s.id = 'tc-css';
    s.textContent = `
transform-chain { display: block; }
.tc-wrap { border-radius: 6px; background: #161716; }

/* sentence row */
.tc-sent { display: flex; flex-wrap: wrap; align-items: flex-start; }

/* individual chunk */
.tc-chunk { display: inline-flex; flex-direction: column; align-items: center; }
.tc-chunk.hidden { display: none !important; }

/* coloured pill / box / tag */
.tc-bg {
  display: inline-block; white-space: nowrap;
  transition: background-color 0.55s ease, color 0.55s ease;
}

/* grammar label */
.tc-lbl { text-align: center; line-height: 1.3; }

/* note area */
.tc-note { font-size: .85rem; line-height: 1.45; min-height: 0; }
.tc-note:not(:empty) { margin-top: 8px; padding: 6px 10px;
  border-left: 3px solid; border-radius: 0 4px 4px 0; }

/* step indicator list */
.tc-slist { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
.tc-sitem { display: flex; align-items: center; gap: 4px; font-size: .72rem;
            padding: 2px 7px; border-radius: 4px; }

/* buttons */
.tc-btns { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.tc-btn  { border: none; cursor: pointer; border-radius: 4px; font-size: .85rem;
           padding: 3px 12px; transition: opacity .15s; font-family: inherit; }
.tc-btn:hover    { opacity: .82; }
.tc-btn:disabled { opacity: .38; cursor: not-allowed; }

.tc-count { font-size: .78rem; color: #9a9b96; margin-left: auto; }

/* pop-in animation for newly revealed chunk */
@keyframes tc-pop {
  0%   { transform: scale(.82); opacity: 0; }
  60%  { transform: scale(1.06); }
  100% { transform: scale(1);   opacity: 1; }
}
.tc-pop { animation: tc-pop .26s ease; }
    `;
    document.head.appendChild(s);
  }

  /* ─── Component ───────────────────────────────────────────────────────── */
  class TransformChain extends HTMLElement {

    connectedCallback() {
      if (this._booted) return;
      this._booted = true;
      setTimeout(() => this._boot(), 0);
    }

    _boot() {
      const e = this;
      this.cfg = {
        theme       : sa(e,'theme','sky'),
        hlTheme     : sa(e,'highlight-theme','yellow'),
        hlDur       : na(e,'highlight-duration',1500),
        chunkStyle  : sa(e,'chunk-style','pill'),        /* pill | box | tag */
        fontSize    : sa(e,'font-size','1.1rem'),
        labelFS     : sa(e,'label-font-size','0.75rem'),
        showLabels  : ba(e,'show-labels',true),
        showCount   : ba(e,'show-count',false),
        showStepList: ba(e,'show-step-list',false),
        gap         : sa(e,'gap','8px'),
        margin      : sa(e,'margin','1px'),
        padding     : sa(e,'padding','6px 9px'),
        btnNext     : sa(e,'btn-next','＋ 加語塊'),
        btnPrev     : sa(e,'btn-prev',''),
        btnReset    : sa(e,'btn-reset','重置'),
        autoPlay    : ba(e,'auto-play',false),
        autoInterval: na(e,'auto-interval',2000),
        /* note-position: below only (inline reserved for future) */
      };

      this._parse();
      this._revealed = 0;
      this._playing  = false;
      this._playIv   = null;

      this._render();
      this._keyboard();
    }

    /* ── Data ── */
    _parse() {
      const els = this.querySelectorAll(':scope > chain-step');
      this._steps = Array.from(els).map((el, i) => ({
        idx  : i,
        html : el.innerHTML,
        label: sa(el,'label',''),
        theme: sa(el,'theme',''),
        note : sa(el,'note',''),
        core : ba(el,'core',false),
      }));
      /* non-core steps in DOM order = reveal order */
      this._adds  = this._steps.filter(s => !s.core);
      this._total = this._adds.length;
    }

    /* ── Render ── */
    _render() {
      this.innerHTML = '';
      this.style.margin = this.cfg.margin;

      const w = this._mk('div','tc-wrap');
      w.style.padding = this.cfg.padding;

      /* sentence display */
      const sent = this._mk('div','tc-sent');
      sent.style.gap = this.cfg.gap;
      this._eSent = sent;

      this._chunkEls = [];
      this._steps.forEach(step => {
        const el = this._mkChunk(step);
        if (!step.core) el.classList.add('hidden');
        this._chunkEls.push(el);
        sent.appendChild(el);
      });
      w.appendChild(sent);

      /* note */
      const note = this._mk('div','tc-note');
      note.style.color       = clr('yellow');
      note.style.borderColor = clr('yellow');
      this._eNote = note;
      w.appendChild(note);

      /* step indicator list */
      if (this.cfg.showStepList) {
        this._eList = this._mk('div','tc-slist');
        w.appendChild(this._eList);
      }

      /* buttons */
      this._eBtns = this._mk('div','tc-btns');
      w.appendChild(this._eBtns);

      this.appendChild(w);
      this._renderBtns();
      this._sync();
    }

    _mkChunk(step) {
      const th  = step.theme || this.cfg.theme;
      const bg  = step.core ? '#252625' : clr(th);
      const fgc = step.core ? '#C6C7BD' : fg(th);

      const wrap = this._mk('div','tc-chunk');
      wrap.dataset.idx = step.idx;

      /* pill / box / tag body */
      const pill = this._mk('div','tc-bg');
      pill.innerHTML        = step.html;
      pill.style.background = bg;
      pill.style.color      = fgc;
      pill.style.fontSize   = this.cfg.fontSize;
      pill.style.padding    = '3px 12px';
      pill.style.borderRadius = this._rad();
      if (this.cfg.chunkStyle === 'tag')
        pill.style.borderLeft = '4px solid rgba(0,0,0,0.85)';
      wrap.appendChild(pill);

      /* grammar label */
      if (this.cfg.showLabels && step.label) {
        const lbl = this._mk('span','tc-lbl');
        lbl.textContent    = step.label;
        lbl.style.fontSize = this.cfg.labelFS;
        lbl.style.color    = step.core ? '#555650' : '#9a9b96';
        lbl.style.maxWidth = '180px';
        wrap.appendChild(lbl);
      }

      return wrap;
    }

    _mk(tag, cls) {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      return e;
    }

    _rad() {
      return this.cfg.chunkStyle==='pill' ? '999px'
           : this.cfg.chunkStyle==='tag'  ? '0 4px 4px 0'
           : '4px';
    }

    _renderBtns() {
      this._eBtns.innerHTML = '';
      this._eBNext = null; this._eBPrev = null; this._eBPlay = null; this._eCount = null;

      const tc = clr(this.cfg.theme), fgc = fg(this.cfg.theme), gh = '#252625';

      const mk = (txt, bg, co) => {
        if (!txt) return null;
        const b = this._mk('button','tc-btn');
        b.textContent = txt; b.style.background = bg; b.style.color = co;
        return b;
      };

      /* ← 上一步 */
      if (this.cfg.btnPrev) {
        const b = mk(this.cfg.btnPrev, gh, '#C6C7BD');
        b.addEventListener('click', () => this._prev());
        this._eBPrev = b; this._eBtns.appendChild(b);
      }
      /* ＋ 加語塊 */
      if (this.cfg.btnNext) {
        const b = mk(this.cfg.btnNext, tc, fgc);
        b.addEventListener('click', () => this._next());
        this._eBNext = b; this._eBtns.appendChild(b);
      }
      /* 重置 */
      if (this.cfg.btnReset) {
        const b = mk(this.cfg.btnReset, gh, '#C6C7BD');
        b.addEventListener('click', () => this._reset());
        this._eBtns.appendChild(b);
      }
      /* ▶ 自動播放 */
      if (this.cfg.autoPlay) {
        const b = mk('▶', clr('teal'), fg('teal'));
        b.addEventListener('click', () => this._togglePlay());
        this._eBPlay = b; this._eBtns.appendChild(b);
      }
      /* N / 總 計數 */
      if (this.cfg.showCount) {
        this._eCount = this._mk('span','tc-count');
        this._eBtns.appendChild(this._eCount);
      }
    }

    /* ── Step list ── */
    _renderList() {
      if (!this._eList) return;
      this._eList.innerHTML = '';
      const tc = clr(this.cfg.theme);

      this._steps.forEach((step, i) => {
        const item = this._mk('div','tc-sitem');
        const isCore     = step.core;
        const isRevealed = !isCore && this._adds.indexOf(step) < this._revealed;

        if (isCore) {
          item.style.background = '#252625';
          item.style.color      = '#555650';
          item.textContent      = (step.label || `#${i+1}`) + ' ✦';
        } else if (isRevealed) {
          item.style.background = tc + '33';
          item.style.color      = '#C6C7BD';
          item.textContent      = step.label || `#${i+1}`;
          item.style.outline    = `1px solid ${tc}88`;
        } else {
          item.style.background = '#1e1f1e';
          item.style.color      = '#3a3b38';
          item.textContent      = step.label || `#${i+1}`;
        }
        this._eList.appendChild(item);
      });
    }

    /* ── Sync button states & list ── */
    _sync() {
      const done = this._revealed >= this._total;
      if (this._eBNext) this._eBNext.disabled = done;
      if (this._eBPrev) this._eBPrev.disabled = this._revealed === 0;
      if (this._eCount) this._eCount.textContent = `${this._revealed} / ${this._total}`;
      if (done && this._playing) this._stopPlay();
      this._renderList();
    }

    /* ── Actions ── */
    _next() {
      if (this._revealed >= this._total) return;
      const step = this._adds[this._revealed];
      this._revealed++;

      const el   = this._chunkEls[step.idx];
      const pill = el.querySelector('.tc-bg');

      /* set highlight colour instantly (no transition), then reveal */
      const hlBg  = clr(step.theme || this.cfg.hlTheme);
      const hlFgc = fg(step.theme  || this.cfg.hlTheme);
      if (pill) {
        pill.style.transition = 'none';
        pill.style.background = hlBg;
        pill.style.color      = hlFgc;
        void pill.offsetWidth; /* flush */
        pill.style.transition = '';
      }

      el.classList.remove('hidden');
      el.classList.add('tc-pop');
      setTimeout(() => el.classList.remove('tc-pop'), 300);

      /* fade to theme colour after hlDur ms */
      if (pill) {
        const finalBg  = clr(step.theme || this.cfg.theme);
        const finalFgc = fg(step.theme  || this.cfg.theme);
        setTimeout(() => {
          pill.style.background = finalBg;
          pill.style.color      = finalFgc;
        }, this.cfg.hlDur);
      }

      /* note */
      this._eNote.innerHTML = step.note || '';

      this._sync();
    }

    _prev() {
      if (this._revealed === 0) return;
      this._revealed--;
      const step = this._adds[this._revealed];
      this._chunkEls[step.idx].classList.add('hidden');

      /* show previous step's note (if any) */
      const prevNote = this._revealed > 0 ? (this._adds[this._revealed-1].note || '') : '';
      this._eNote.innerHTML = prevNote;

      this._sync();
    }

    _reset() {
      this._stopPlay();
      this._adds.forEach(step => {
        const el   = this._chunkEls[step.idx];
        const pill = el.querySelector('.tc-bg');
        /* cancel any pending highlight fade by snapping to theme colour */
        if (pill) {
          pill.style.transition = 'none';
          pill.style.background = clr(step.theme || this.cfg.theme);
          pill.style.color      = fg(step.theme  || this.cfg.theme);
          void pill.offsetWidth;
          pill.style.transition = '';
        }
        el.classList.add('hidden');
      });
      this._revealed = 0;
      this._eNote.innerHTML = '';
      this._sync();
    }

    /* ── Auto-play ── */
    _togglePlay() {
      this._playing ? this._stopPlay() : this._startPlay();
    }

    _startPlay() {
      if (this._revealed >= this._total) this._reset();
      this._playing = true;
      if (this._eBPlay) {
        this._eBPlay.textContent  = '⏸';
        this._eBPlay.style.background = clr('warning');
        this._eBPlay.style.color      = fg('warning');
      }
      this._next(); /* show first step immediately */
      this._playIv = setInterval(() => {
        if (this._revealed >= this._total) { this._stopPlay(); return; }
        this._next();
      }, this.cfg.autoInterval);
    }

    _stopPlay() {
      this._playing = false;
      clearInterval(this._playIv);
      if (this._eBPlay) {
        this._eBPlay.textContent       = '▶';
        this._eBPlay.style.background  = clr('teal');
        this._eBPlay.style.color       = fg('teal');
      }
    }

    /* ── Keyboard (← → arrow keys when focused) ── */
    _keyboard() {
      this.setAttribute('tabindex','0');
      this.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); this._next(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); this._prev(); }
        if (e.key === ' ')          { e.preventDefault(); this._togglePlay(); }
      });
    }
  }

  customElements.define('transform-chain', TransformChain);
})();
