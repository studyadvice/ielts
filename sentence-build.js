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
  if (!document.getElementById('sb-css')) {
    const s = document.createElement('style');
    s.id = 'sb-css';
    s.textContent = `
sentence-build { display: block; }
.sb-wrap  { border-radius: 6px; background: #161716; }
.sb-prog  { font-size: .8rem; color: #9a9b96; margin-bottom: 5px;
            letter-spacing: .03em; display: flex; align-items: center; gap: 6px; }
.sb-prog-bar  { flex: 1; height: 3px; background: #252625; border-radius: 2px; overflow: hidden; }
.sb-prog-fill { height: 100%; border-radius: 2px; transition: width .4s ease; }
.sb-dlbl  { font-size: .78rem; margin-bottom: 3px; letter-spacing: .03em; color: #9a9b96; }
.sb-pool  { display: flex; flex-wrap: wrap; align-content: flex-start; min-height: 32px; }
.sb-div   { border: none; border-top: 1px solid #2e2f2e; margin: 6px 0; }
.sb-zhd   { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.sb-zlbl  { font-size: .78rem; flex: 1; color: #9a9b96; letter-spacing: .03em; }
.sb-cnt   { font-size: .75rem; color: #9a9b96; }
.sb-rib   { background: none; border: none; cursor: pointer; color: #9a9b96;
            line-height: 1; padding: 0 2px; transition: color .15s; }
.sb-rib:hover { color: #C6C7BD; }
.sb-zone  { display: flex; flex-wrap: wrap; align-items: center; align-content: flex-start;
            border-radius: 6px; padding: 4px 6px; transition: background .15s; }
.sb-zone.dov { background: #1e2c30; }
.sb-chunk { cursor: pointer; user-select: none; display: inline-flex;
            flex-direction: column; align-items: center; }
.sb-chunk:hover .sb-bg { opacity: .85; }
.sb-chunk.ghost        { opacity: .35; }
.sb-bg    { display: inline-block; white-space: nowrap; transition: outline .12s, opacity .15s; }
.sb-bg.ok { outline: 2px solid #27AE60; outline-offset: 1px; }
.sb-bg.no { outline: 2px solid #E6374B; outline-offset: 1px; }
.sb-clbl  { font-size: .72rem; color: #9a9b96; margin-top: 2px; text-align: center;
            max-width: 200px; line-height: 1.25; }
.sb-ph    { border: 2px dashed rgba(130,200,229,0.82); border-radius: 999px;
            display: inline-block; min-width: 48px; height: 28px;
            vertical-align: middle; pointer-events: none; }
.sb-fb    { font-size: .88rem; min-height: 1.4em; margin-top: 5px; }
.sb-hint  { font-size: .85rem; margin-top: 4px; line-height: 1.25; }
.sb-btns  { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.sb-btn   { border: none; cursor: pointer; font-size: .75rem;
            padding: 3px 12px; transition: opacity .15s; font-family: inherit; }
.sb-btn:hover    { opacity: .85; }
.sb-btn:disabled { opacity: .38; cursor: not-allowed; }
.sb-tr    { display: flex; align-items: center; gap: 8px; margin-top: 7px; }
.sb-tlbl  { font-size: .82rem; color: #9a9b96; }
.sb-tbar  { flex: 1; height: 4px; background: #252625; border-radius: 2px; overflow: hidden; }
.sb-fill  { height: 100%; border-radius: 2px; transition: width .9s linear, background-color .4s; }
.sb-tval  { font-size: .82rem; min-width: 2em; text-align: right;
            font-variant-numeric: tabular-nums; color: #C6C7BD; transition: color .3s; }
.sb-tval.warn { color: #E6374B; }
@keyframes sb-shk {
  0%,100% { transform: translateX(0);   }
  15%     { transform: translateX(-6px); }
  35%     { transform: translateX( 6px); }
  55%     { transform: translateX(-4px); }
  75%     { transform: translateX( 4px); }
}
.sb-shk { animation: sb-shk .36s ease; }
    `;
    document.head.appendChild(s);
  }

  /* ─── Component ───────────────────────────────────────────────────────── */
  class SentenceBuild extends HTMLElement {

    connectedCallback() {
      if (this._booted) return;
      this._booted = true;
      setTimeout(() => this._boot(), 0);
    }

    /* ── Bootstrap ── */
    _boot() {
      const e = this;
      this.cfg = {
        /* data */
        src       : sa(e,'src',''),
        lang      : sa(e,'lang','en'),
        /* pool (Option A) */
        poolSrc   : sa(e,'pool-src',''),
        poolSelect: sa(e,'pool-select','random'),   /* random | sequence */
        showProg  : ba(e,'show-progress',false),
        /* interaction */
        mode      : sa(e,'mode','click'),            /* click | drag | both */
        shuffle   : ba(e,'shuffle',true),
        allowRpt  : ba(e,'allow-repeat',false),
        autoChk   : ba(e,'auto-check',false),
        chkMode   : sa(e,'check-mode','submit'),     /* submit | immediate */
        maxAtt    : na(e,'max-attempts',3),
        /* feedback */
        showLbls  : ba(e,'show-labels',true),
        msgOk     : sa(e,'msg-correct','正確！'),
        msgBad    : sa(e,'msg-wrong','再試一次'),
        msgAns    : sa(e,'msg-answered',''),
        /* buttons */
        btnChk    : sa(e,'btn-check','確認'),
        btnRst    : sa(e,'btn-reset','重置'),
        btnHnt    : sa(e,'btn-hint',''),
        btnAns    : sa(e,'btn-answer','看答案'),
        hintTxt   : sa(e,'hint-text',''),
        /* next-question button (pool mode) */
        btnNext   : sa(e,'btn-next',''),             /* auto-set below if pool mode */
        nextOn    : sa(e,'next-on','done'),          /* done | always */
        /* visual */
        theme     : sa(e,'theme','sky'),
        chkStyle  : sa(e,'chunk-style','pill'),      /* pill | box | tag */
        chkFS     : sa(e,'chunk-font-size','1rem'),
        chkPad    : sa(e,'chunk-padding','2px 8px'),
        lblFS     : sa(e,'label-font-size','0.75rem'),
        gap       : sa(e,'gap','8px'),
        margin    : sa(e,'margin','1px'),
        padding   : sa(e,'padding','3px 6px'),
        poolDir   : sa(e,'pool-direction','row'),
        zoneDir   : sa(e,'zone-direction','row'),
        zoneMinH  : sa(e,'zone-min-height','32px'),
        zBorder   : sa(e,'zone-border','1px dashed'),
        divider   : ba(e,'divider',true),
        lPool     : sa(e,'label-pool',''),
        lZone     : sa(e,'label-zone',''),
        showCnt   : ba(e,'show-count',false),
        animDur   : na(e,'anim-duration',150),
        showRst   : ba(e,'show-reset',true),
        rstIcon   : sa(e,'reset-icon','↺'),
        rstSz     : sa(e,'reset-icon-size','0.8rem'),
        /* timer */
        timer     : sa(e,'timer',''),
        tWarn     : na(e,'timer-warn',10),
        tAction   : sa(e,'timer-action','lock'),     /* lock | submit | answer */
        tLabel    : sa(e,'timer-label',''),
        /* shake-wrong: always true — not an attribute */
        /* timer-position: always bottom — not an attribute */
      };

      /* In pool mode, default btn-next to "下一題" unless explicitly overridden */
      if (this.cfg.poolSrc && !e.hasAttribute('btn-next')) {
        this.cfg.btnNext = '下一題';
      }

      /* Save element-level hint so per-question hints can fall back to it */
      this._baseHint = this.cfg.hintTxt;

      this._parse();
      this._st  = { att:0, done:false, locked:false };
      this._rem = this.cfg.timer ? +this.cfg.timer : 0;
      this._tot = this._rem;
      this._iv  = null;
      this._hEl = null;

      this._render();
      this._events();
      if (this.cfg.timer) this._startT();
    }

    /* ── Data ── */

    _parse() {
      if (this.cfg.poolSrc) {
        this._qPool     = [];
        this._qCurrent  = -1;
        this._qRoundNum = 0;
        this._parsePool();
        if (!this._chks) { this._chks = []; this._ans = []; }
      } else if (this.cfg.src) {
        const src = document.querySelector(this.cfg.src);
        this._setChunks(src ? src.querySelectorAll('chunk-item') : []);
      } else {
        this._setChunks(this.querySelectorAll(':scope > chunk-item'));
      }
      this._initP();
    }

    _setChunks(items) {
      this._chks = Array.from(items).map((el,i) => ({
        idx:i, html:el.innerHTML, lbl:sa(el,'label',''),
        th:sa(el,'theme',''),    fs:sa(el,'font-size',''),
        fix:ba(el,'fixed',false), dec:ba(el,'decoy',false),
      }));
      this._ans = this._chks.filter(c=>!c.dec).map(c=>c.idx);
    }

    /* ── Pool ── */

    _parsePool() {
      const cont = document.querySelector(this.cfg.poolSrc);
      if (!cont) return;
      const divs = cont.querySelectorAll(':scope > [data-item]');
      this._qPool = Array.from(divs).map(div => ({
        chunks: Array.from(div.querySelectorAll('chunk-item')).map((el,i) => ({
          idx:i, html:el.innerHTML, lbl:sa(el,'label',''),
          th:sa(el,'theme',''),    fs:sa(el,'font-size',''),
          fix:ba(el,'fixed',false), dec:ba(el,'decoy',false),
        })),
        hint: div.hasAttribute('data-hint') ? div.getAttribute('data-hint') : undefined,
      }));

      if (this._qPool.length > 0) {
        this._initQueue();
        this._pickQ();
        this._loadQ(this._qCurrent);
      }
    }

    _initQueue() {
      const n = this._qPool.length;
      this._qQueue = Array.from({length:n}, (_,i) => i);
      if (this.cfg.poolSelect === 'random') {
        for (let i=n-1; i>0; i--) {
          const j = Math.floor(Math.random()*(i+1));
          [this._qQueue[i], this._qQueue[j]] = [this._qQueue[j], this._qQueue[i]];
        }
      }
      this._qPos = 0;
    }

    _pickQ() {
      /* wrap: reshuffle when queue is exhausted */
      if (this._qPos >= this._qQueue.length) {
        const last = this._qCurrent;
        this._initQueue();
        /* anti-repeat: first of new round must not equal last of previous round */
        if (this.cfg.poolSelect === 'random' &&
            this._qPool.length > 1 &&
            this._qQueue[0] === last) {
          const j = Math.floor(Math.random()*(this._qQueue.length-1)) + 1;
          [this._qQueue[0], this._qQueue[j]] = [this._qQueue[j], this._qQueue[0]];
        }
      }
      this._qCurrent  = this._qQueue[this._qPos++];
      this._qRoundNum = this._qPos;
    }

    _loadQ(idx) {
      const q = this._qPool[idx];
      this._chks   = q.chunks.map(c => ({...c}));
      this._ans    = this._chks.filter(c=>!c.dec).map(c=>c.idx);
      this.cfg.hintTxt = q.hint !== undefined ? q.hint : this._baseHint;
    }

    _initP() {
      const all = this._chks.map((_,i) => i);
      if (this.cfg.shuffle) {
        const nf = all.filter(i => !this._chks[i].fix);
        const sh = [...nf];
        for (let i=sh.length-1; i>0; i--) {
          const j = Math.floor(Math.random()*(i+1));
          [sh[i],sh[j]] = [sh[j],sh[i]];
        }
        let s = 0;
        this._po = all.map(i => this._chks[i].fix ? i : sh[s++]);
      } else {
        this._po = all;
      }
      this._ip = new Array(this._chks.length).fill(true);
      this._z  = [];
    }

    /* ── Render ── */

    _render() {
      const tc = clr(this.cfg.theme);
      this.innerHTML = '';
      this.style.margin = this.cfg.margin;

      const w = this._mk('div','sb-wrap');
      w.style.padding = this.cfg.padding;

      /* progress bar — pool mode only */
      if (this.cfg.poolSrc && this.cfg.showProg && this._qPool.length > 0) {
        const prog = this._mk('div','sb-prog');
        this._eProgTxt  = this._mk('span');
        const bar  = this._mk('div','sb-prog-bar');
        this._eProgFill = this._mk('div','sb-prog-fill');
        this._eProgFill.style.backgroundColor = tc;
        bar.appendChild(this._eProgFill);
        prog.appendChild(this._eProgTxt);
        prog.appendChild(bar);
        this._eProg = prog;
        w.appendChild(prog);
        this._upProg();
      }

      /* pool label */
      if (this.cfg.lPool) {
        const l = this._mk('div','sb-dlbl');
        l.textContent = this.cfg.lPool;
        w.appendChild(l);
      }

      /* chunk pool */
      const pool = this._mk('div','sb-pool');
      pool.dataset.a = 'pool';
      pool.style.gap = this.cfg.gap;
      pool.style.flexDirection = this.cfg.poolDir;
      this._eP = pool;
      w.appendChild(pool);

      /* divider */
      if (this.cfg.divider) w.appendChild(this._mk('hr','sb-div'));

      /* zone header */
      const zh = this._mk('div','sb-zhd');
      if (this.cfg.lZone) {
        const zl = this._mk('span','sb-zlbl');
        zl.textContent = this.cfg.lZone;
        zh.appendChild(zl);
      } else {
        const sp = this._mk('span'); sp.style.flex='1'; zh.appendChild(sp);
      }
      if (this.cfg.showCnt) {
        this._eC = this._mk('span','sb-cnt'); zh.appendChild(this._eC);
      }
      if (this.cfg.showRst) {
        const rib = this._mk('button','sb-rib');
        rib.innerHTML = this.cfg.rstIcon;
        rib.title = '重置本題';
        rib.style.fontSize = this.cfg.rstSz;
        rib.addEventListener('click', () => this._rst());
        zh.appendChild(rib);
      }
      w.appendChild(zh);

      /* answer zone */
      const zone = this._mk('div','sb-zone');
      zone.dataset.a = 'zone';
      zone.style.gap = this.cfg.gap;
      zone.style.minHeight = this.cfg.zoneMinH;
      zone.style.flexDirection = this.cfg.zoneDir;
      zone.style.border = `${this.cfg.zBorder} ${tc}`;
      this._eZ = zone;
      w.appendChild(zone);

      /* feedback */
      this._eFb = this._mk('div','sb-fb');
      w.appendChild(this._eFb);

      /* buttons */
      this._eBs = this._mk('div','sb-btns');
      w.appendChild(this._eBs);

      /* timer — always at bottom */
      if (this.cfg.timer) {
        const tr = this._mk('div','sb-tr');
        if (this.cfg.tLabel) {
          const tl = this._mk('span','sb-tlbl');
          tl.textContent = this.cfg.tLabel; tr.appendChild(tl);
        }
        const bar = this._mk('div','sb-tbar');
        this._eF = this._mk('div','sb-fill');
        this._eF.style.backgroundColor = tc;
        this._eF.style.width = '100%';
        bar.appendChild(this._eF); tr.appendChild(bar);
        this._eTV = this._mk('span','sb-tval');
        this._eTV.textContent = this._rem;
        tr.appendChild(this._eTV);
        w.appendChild(tr);
      }

      this.appendChild(w);
      this._rP(); this._rZ(); this._rB(); this._upC();
    }

    _upProg() {
      if (!this._eProg || !this._qPool) return;
      const n = this._qPool.length;
      this._eProgTxt.textContent = `第 ${this._qRoundNum} / ${n} 題`;
      this._eProgFill.style.width = `${(this._qRoundNum / n) * 100}%`;
    }

    _mk(tag, cls) {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      return e;
    }

    _rad() {
      return this.cfg.chkStyle==='pill' ? '999px'
           : this.cfg.chkStyle==='tag'  ? '0 4px 4px 0'
           : '4px';
    }

    _mkChunk(c, inZ) {
      const th = c.th || this.cfg.theme;
      const bg = clr(th), fgc = fg(th);

      const el = this._mk('div','sb-chunk');
      el.dataset.i = c.idx;
      el.dataset.a = inZ ? 'zone' : 'pool';

      const bgEl = this._mk('div','sb-bg');
      bgEl.style.background   = bg;
      bgEl.style.color        = fgc;
      bgEl.style.padding      = this.cfg.chkPad;
      bgEl.style.fontSize     = c.fs || this.cfg.chkFS;
      bgEl.style.borderRadius = this._rad();
      if (this.cfg.chkStyle === 'tag')
        bgEl.style.borderLeft = '4px solid rgba(0,0,0,0.85)';
      bgEl.innerHTML = c.html;
      el.appendChild(bgEl);

      if (inZ && this.cfg.showLbls && c.lbl && this._st.done) {
        const lb = this._mk('span','sb-clbl');
        lb.style.fontSize = this.cfg.lblFS;
        lb.textContent = c.lbl;
        el.appendChild(lb);
      }

      if (this.cfg.mode==='drag' || this.cfg.mode==='both') el.draggable = true;
      return el;
    }

    _rP() {
      this._eP.innerHTML = '';
      this._po.forEach(i => {
        const c = this._chks[i];
        if (this._ip[i] || c.fix) this._eP.appendChild(this._mkChunk(c, false));
      });
    }

    _rZ() {
      this._eZ.innerHTML = '';
      this._z.forEach(i => this._eZ.appendChild(this._mkChunk(this._chks[i], true)));
    }

    _rB() {
      this._eBs.innerHTML = '';
      this._eBChk = null; this._eBns = null; this._eBNext = null;
      const tc = clr(this.cfg.theme), fgc = fg(this.cfg.theme), gh = '#252625';

      const mk = (txt, bg, co) => {
        if (!txt) return null;
        const b = this._mk('button','sb-btn');
        b.textContent = txt; b.style.background = bg; b.style.color = co;
        return b;
      };

      /* 確認 */
      if (this.cfg.btnChk) {
        const b = mk(this.cfg.btnChk, tc, fgc);
        b.addEventListener('click', () => this._chk());
        this._eBChk = b; this._eBs.appendChild(b);
      }
      /* 重置（當前題目，不換題） */
      if (this.cfg.btnRst) {
        const b = mk(this.cfg.btnRst, gh, '#C6C7BD');
        b.addEventListener('click', () => this._rst());
        this._eBs.appendChild(b);
      }
      /* 提示 */
      if (this.cfg.btnHnt && this.cfg.hintTxt) {
        const b = mk(this.cfg.btnHnt, gh, '#C6C7BD');
        b.addEventListener('click', () => this._tHnt());
        this._eBs.appendChild(b);
      }
      /* 看答案（達 max-attempts 後才顯示） */
      if (this.cfg.btnAns) {
        const b = mk(this.cfg.btnAns, clr('warning'), '#fff');
        b.style.display = 'none';
        b.addEventListener('click', () => this._sAns());
        this._eBns = b; this._eBs.appendChild(b);
      }
      /* 下一題（pool 模式專用）
         next-on="done"   → 隱藏，答題完成後才顯示
         next-on="always" → 永遠可見，學生可自行跳題 */
      if (this.cfg.poolSrc && this.cfg.btnNext) {
        const b = mk(this.cfg.btnNext, clr('safe'), fg('safe'));
        if (this.cfg.nextOn === 'done' && !this._st.done) b.style.display = 'none';
        b.addEventListener('click', () => this._nextQ());
        this._eBNext = b; this._eBs.appendChild(b);
      }
    }

    _upC() {
      if (this._eC) this._eC.textContent = `${this._z.length} / ${this._ans.length}`;
    }

    /* ── Events ── */

    _events() {
      if (this.cfg.mode==='click' || this.cfg.mode==='both') {
        this._eP.addEventListener('click', e => {
          if (this._st.locked) return;
          const ch = e.target.closest('.sb-chunk[data-a="pool"]');
          if (ch) this._toZ(+ch.dataset.i);
        });
        this._eZ.addEventListener('click', e => {
          if (this._st.locked) return;
          const ch = e.target.closest('.sb-chunk[data-a="zone"]');
          if (ch) this._toP(+ch.dataset.i);
        });
      }
      if (this.cfg.mode==='drag' || this.cfg.mode==='both') this._drag();
    }

    _drag() {
      let d = null, ph = null;
      const mkPh = () => this._mk('div','sb-ph');

      this.addEventListener('dragstart', e => {
        const ch = e.target.closest('.sb-chunk');
        if (!ch || this._st.locked) { e.preventDefault(); return; }
        d = { i:+ch.dataset.i, a:ch.dataset.a, el:ch };
        ch.classList.add('ghost');
        e.dataTransfer.effectAllowed = 'move';
      });

      this.addEventListener('dragend', () => {
        d?.el.classList.remove('ghost'); d = null;
        ph?.parentNode?.removeChild(ph); ph = null;
        this._eZ.classList.remove('dov');
      });

      this._eZ.addEventListener('dragover', e => {
        if (!d || this._st.locked) return;
        e.preventDefault(); e.dataTransfer.dropEffect = 'move';
        if (!ph) ph = mkPh();
        const af = this._aft(this._eZ, e.clientX);
        af ? this._eZ.insertBefore(ph, af) : this._eZ.appendChild(ph);
        this._eZ.classList.add('dov');
      });

      this._eZ.addEventListener('dragleave', e => {
        if (!this._eZ.contains(e.relatedTarget)) this._eZ.classList.remove('dov');
      });

      this._eZ.addEventListener('drop', e => {
        e.preventDefault(); this._eZ.classList.remove('dov');
        if (!d || this._st.locked) return;
        const ci = d.i, c = this._chks[ci];
        const phIdx = ph ? [...this._eZ.children].indexOf(ph) : this._z.length;

        if (d.a === 'pool') {
          if (!c.fix) this._ip[ci] = false;
          if (!this.cfg.allowRpt && this._z.includes(ci)) { /* skip */ }
          else this._z.splice(phIdx, 0, ci);
        } else {
          const old = this._z.indexOf(ci);
          if (old !== -1) this._z.splice(old, 1);
          this._z.splice(Math.min(phIdx, this._z.length), 0, ci);
        }

        ph?.parentNode?.removeChild(ph); ph = null;
        this._ad();
      });

      this._eP.addEventListener('dragover', e => { if (d) e.preventDefault(); });
      this._eP.addEventListener('drop', e => {
        e.preventDefault();
        if (d?.a === 'zone') this._toP(d.i);
      });
    }

    _aft(cont, x) {
      return [...cont.querySelectorAll('.sb-chunk')].reduce((cl, el) => {
        const b = el.getBoundingClientRect(), off = x - b.left - b.width/2;
        return (off < 0 && off > cl.off) ? { off, el } : cl;
      }, { off:-Infinity }).el;
    }

    _ad() {
      this._rP(); this._rZ(); this._upC();
      if (this.cfg.chkMode === 'immediate') this._imm();
      if (this.cfg.autoChk && this._z.length === this._ans.length) this._chk();
    }

    /* ── Move ── */

    _toZ(ci) {
      const c = this._chks[ci];
      if (!this.cfg.allowRpt && !c.fix && this._z.includes(ci)) return;
      if (!c.fix) this._ip[ci] = false;
      this._z.push(ci);
      this._rP(); this._rZ(); this._upC();
      if (this.cfg.chkMode === 'immediate') this._imm();
      if (this.cfg.autoChk && this._z.length === this._ans.length) this._chk();
    }

    _toP(ci) {
      const pos = this._z.lastIndexOf(ci);
      if (pos !== -1) this._z.splice(pos, 1);
      this._ip[ci] = true;
      this._rP(); this._rZ(); this._upC();
    }

    /* ── Validation ── */

    _chk() {
      if (this._st.done) return;
      this._st.att++;
      const ok = this._z.length === this._ans.length &&
                 this._ans.every((ai,p) => this._z[p] === ai);
      if (ok) {
        this._st.done = this._st.locked = true;
        if (this._iv) clearInterval(this._iv);
        this._fb(this.cfg.msgOk, 'safe');
        this._mark(true);
        if (this.cfg.showLbls) this._rZ();
        if (this._eBChk) this._eBChk.disabled = true;
        this._showNext();
      } else {
        this._fb(this.cfg.msgBad, 'warning');
        this._mark(false);
        this._shk();
        if (this._st.att >= this.cfg.maxAtt && this._eBns)
          this._eBns.style.display = '';
      }
    }

    _imm() {
      [...this._eZ.querySelectorAll('.sb-chunk')].forEach((el,p) => {
        const bg = el.querySelector('.sb-bg'); if (!bg) return;
        bg.classList.remove('ok','no');
        if (p < this._ans.length)
          bg.classList.add(+el.dataset.i === this._ans[p] ? 'ok' : 'no');
      });
    }

    _mark(ok) {
      [...this._eZ.querySelectorAll('.sb-bg')].forEach(el => {
        el.classList.remove('ok','no');
        el.classList.add(ok ? 'ok' : 'no');
      });
    }

    _shk() {
      this._eZ.classList.remove('sb-shk');
      void this._eZ.offsetWidth;
      this._eZ.classList.add('sb-shk');
      setTimeout(() => this._eZ.classList.remove('sb-shk'), 400);
    }

    _fb(msg, col) { this._eFb.style.color = clr(col); this._eFb.textContent = msg; }

    /* reveal "下一題" button when nextOn="done" and question is completed */
    _showNext() {
      if (this._eBNext && this.cfg.nextOn === 'done')
        this._eBNext.style.display = '';
    }

    _tHnt() {
      if (this._hEl) { this._hEl.remove(); this._hEl = null; return; }
      const h = this._mk('div','sb-hint');
      h.style.color = clr('yellow'); h.innerHTML = this.cfg.hintTxt;
      this._eFb.after(h); this._hEl = h;
    }

    _sAns() {
      this._z = [...this._ans];
      this._ans.forEach(i => { this._ip[i] = false; });
      this._st.done = this._st.locked = true;
      if (this._iv) clearInterval(this._iv);
      this._rP(); this._rZ(); this._mark(true);
      if (this.cfg.msgAns) this._fb(this.cfg.msgAns, 'shell');
      if (this._eBChk) this._eBChk.disabled = true;
      if (this._eBns)  this._eBns.style.display = 'none';
      this._showNext();
    }

    /* ── Reset（重置當前題目，不換題） ── */
    _rst() {
      if (this._iv) clearInterval(this._iv);
      /* reshuffle chunks of the CURRENT question — question does NOT advance */
      this._initP();
      this._st  = { att:0, done:false, locked:false };
      this._rem = this._tot;
      this._eFb.textContent = '';
      if (this._hEl) { this._hEl.remove(); this._hEl = null; }
      this._rP(); this._rZ(); this._upC(); this._rB();
      /* _upProg: no change — still on the same question */
      if (this.cfg.timer) { this._updT(); this._startT(); }
    }

    /* ── Next question（換題，pool 模式） ── */
    _nextQ() {
      if (!this.cfg.poolSrc || !this._qPool || this._qPool.length === 0) return;
      if (this._iv) clearInterval(this._iv);
      this._pickQ();
      this._loadQ(this._qCurrent);
      this._initP();
      this._st  = { att:0, done:false, locked:false };
      this._rem = this._tot;
      this._eFb.textContent = '';
      if (this._hEl) { this._hEl.remove(); this._hEl = null; }
      this._rP(); this._rZ(); this._upC(); this._rB();
      this._upProg();
      if (this.cfg.timer) { this._updT(); this._startT(); }
    }

    /* ── Timer ── */

    _startT() {
      if (this._iv) clearInterval(this._iv);
      this._updT();
      this._iv = setInterval(() => {
        this._rem--;
        this._updT();
        if (this._rem <= 0) { clearInterval(this._iv); this._onEnd(); }
      }, 1000);
    }

    _updT() {
      if (!this._eTV) return;
      this._eTV.textContent = this._rem;
      const pct = this._tot > 0 ? (this._rem / this._tot) * 100 : 0;
      this._eF.style.width = `${pct}%`;
      const warn = this._rem <= this.cfg.tWarn;
      this._eF.style.backgroundColor = warn ? clr('warning') : clr(this.cfg.theme);
      this._eTV.classList.toggle('warn', warn);
    }

    _onEnd() {
      if      (this.cfg.tAction === 'submit') this._chk();
      else if (this.cfg.tAction === 'answer') this._sAns();
      else {
        this._st.locked = true;
        this._fb('時間到！', 'warning');
        if (this._eBns) this._eBns.style.display = '';
      }
    }
  }

  customElements.define('sentence-build', SentenceBuild);

})();
