/* page-tour.js v1.0：鏡頭漫遊。把既有的教材頁面當成畫布，依劇本自動運鏡、加特效，適合直接螢幕錄影。
   語意標籤：<page-tour> <tour-world> <tour-panel> <tour-step> 與 <fx-*> 特效
   單一檔案，CSS 內建，不使用 Shadow DOM。 */
(() => {
  'use strict';
  if (customElements.get('page-tour')) return;

  const PALETTE = { base:'#0C0D0C', shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#C394CD', salmon:'#FFC88A', 'bg-alternative':'#2D2D2D' };
  const color = v => { if (!v) return ''; const t = String(v).trim(); return PALETTE[t.toLowerCase()] || t; };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const el = (t, c, p) => { const e = document.createElement(t); if (c) e.className = c; if (p) p.append(e); return e; };
  const SPEEDS = [0.5, 1, 1.5, 2];
  const SIDES = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0], 'top-left': [-1, -1], 'top-right': [1, -1], 'bottom-left': [-1, 1], 'bottom-right': [1, 1] };
  const CONFETTI = ['#E3D322', '#FF91D7', '#51DBCF', '#71CD76', '#5DBAE8', '#B484E8', '#FFA987', '#B6FF00', '#EF6661'];

  const STYLE = `
page-tour{display:block;position:relative;overflow:hidden;aspect-ratio:var(--pt-ar,16/9);background:var(--pt-bg);border:1px solid #2D2D2D;border-radius:12px;user-select:none;}
page-tour:fullscreen{border:0;border-radius:0;width:100vw;height:100vh;aspect-ratio:auto;}
page-tour > tour-step,page-tour > tour-step *{display:none;}
page-tour tour-world{display:block;position:absolute;left:0;top:0;transform-origin:0 0;background-color:var(--pt-bg);}
page-tour.pt-dots tour-world{background-image:radial-gradient(#232422 1.6px,var(--pt-bg) 1.7px);background-size:34px 34px;}
page-tour tour-panel{display:block;}
page-tour tour-panel[x]{position:absolute;box-sizing:border-box;}
page-tour .pt-dim{filter:brightness(0.3) saturate(0.5);transition:filter .6s ease;}
page-tour .pt-undim{transition:filter .6s ease;}
page-tour .pt-lines{position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:50;transition:filter .6s ease;}
page-tour .pt-lines.pt-ldim,page-tour .pt-anchor.pt-ln.pt-ldim{filter:brightness(0.3);}
page-tour .pt-fx{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:51;}
page-tour .pt-anchor{position:absolute;width:0;height:0;transition:filter .6s ease;}
page-tour .pt-sc{position:absolute;left:0;top:0;transform-origin:0 0;}
page-tour .pt-ring{position:absolute;border-radius:50%;border:4px solid #E3D322;box-sizing:border-box;}
page-tour .pt-ring.p2{animation:ptRing 1.6s ease-out infinite;}
@keyframes ptRing{0%{transform:scale(1);opacity:1;}100%{transform:scale(1.35);opacity:0;}}
page-tour .pt-arrow{position:absolute;left:0;top:0;transform-origin:0 0;}
page-tour .pt-arrow svg{position:absolute;display:block;animation:ptBob .9s ease-in-out infinite;}
@keyframes ptBob{0%,100%{transform:translateX(-16px);}50%{transform:translateX(0);}}
page-tour .pt-pill{position:absolute;white-space:nowrap;transform:translate(-50%,-50%);padding:8px 18px;border-radius:999px;font-size:1.3rem;font-weight:800;color:#0C0D0C;animation:ptPop .45s cubic-bezier(.3,1.6,.5,1) both;}
@keyframes ptPop{0%{transform:translate(-50%,-50%) scale(0);}100%{transform:translate(-50%,-50%) scale(1);}}
page-tour .pt-note{position:absolute;width:260px;padding:18px 20px;background:#E3D322;color:#0C0D0C;font-size:1.15rem;font-weight:700;line-height:1.5;border-radius:4px;box-shadow:0 10px 0 #9E9418;transform:rotate(-4deg);animation:ptNote .5s cubic-bezier(.3,1.6,.5,1) both;}
@keyframes ptNote{0%{transform:rotate(-14deg) scale(0);}100%{transform:rotate(-4deg) scale(1);}}
.pt-mark{background-image:linear-gradient(var(--mk,#E3D322),var(--mk,#E3D322));background-repeat:no-repeat;background-position:0 90%;background-size:0% 100%;transition:background-size .8s ease,color .4s ease .3s;border-radius:4px;}
.pt-mark.on{background-size:100% 100%;color:#0C0D0C;}
.pt-mark.instant{transition:none;}
.pt-shake{animation:ptShake .5s ease;}
@keyframes ptShake{0%,100%{transform:translateX(0);}20%{transform:translateX(-10px) rotate(-1deg);}40%{transform:translateX(10px) rotate(1deg);}60%{transform:translateX(-6px);}80%{transform:translateX(6px);}}
page-tour .pt-out{animation:ptOut .35s ease forwards;}
@keyframes ptOut{to{opacity:0;}}
page-tour .pt-screen{position:absolute;inset:0;pointer-events:none;z-index:60;}
page-tour .pt-screen canvas{position:absolute;inset:0;width:100%;height:100%;}
page-tour .pt-cap{position:absolute;left:50%;bottom:34px;transform:translate(-50%,160%);max-width:76%;padding:12px 28px;background:#0C0D0C;border:2px solid var(--pt-cc);border-radius:12px;color:#DBEDD8;font-size:1.3rem;font-weight:700;text-align:center;transition:transform .5s cubic-bezier(.3,1.3,.5,1);}
page-tour .pt-cap.on{transform:translate(-50%,0);}
page-tour .pt-count{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:9rem;font-weight:800;color:#E3D322;}
page-tour .pt-count span{animation:ptCnt 1s ease-out both;}
@keyframes ptCnt{0%{transform:scale(1.8);opacity:0;}25%{transform:scale(1);opacity:1;}80%{opacity:1;}100%{transform:scale(0.8);opacity:0;}}
page-tour .pt-cursor{position:absolute;left:0;top:0;width:34px;height:34px;display:none;}
page-tour .pt-ripple{position:absolute;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:3px solid #FF91D7;animation:ptRip .6s ease-out forwards;}
@keyframes ptRip{to{transform:scale(4);opacity:0;}}
page-tour .pt-start{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:var(--pt-bg);cursor:pointer;z-index:80;}
page-tour .pt-start b{font-size:2.2rem;color:#DBEDD8;}
page-tour .pt-start .go{border:2px solid var(--pt-hc);color:var(--pt-hc);border-radius:999px;padding:10px 34px;font-size:1.3rem;font-weight:800;}
page-tour .pt-start .go:hover{background:var(--pt-hc);color:#0C0D0C;}
page-tour .pt-start small{color:#86877F;font-size:0.9rem;}
page-tour .pt-hud{position:absolute;right:14px;bottom:14px;display:flex;gap:6px;align-items:center;z-index:70;}
page-tour .pt-hud button{background:#0C0D0C;border:1px solid var(--pt-hc);color:var(--pt-hc);border-radius:6px;padding:3px 10px;font-size:0.8rem;cursor:pointer;font-family:inherit;line-height:1.5;}
page-tour .pt-hud button:hover{background:var(--pt-hc);color:#0C0D0C;}
page-tour .pt-hud span{color:#86877F;font-size:0.8rem;font-variant-numeric:tabular-nums;margin:0 6px 0 0;}
page-tour .pt-prog{position:absolute;left:0;right:0;bottom:0;height:4px;background:#1D1E1C;z-index:70;}
page-tour .pt-prog i{display:block;height:100%;width:0;background:var(--pt-hc);transition:width .4s;}
page-tour.pt-clean .pt-hud,page-tour.pt-clean .pt-prog{display:none;}
page-tour.pt-paused *{animation-play-state:paused !important;}
page-tour .pt-alert{position:absolute;left:14px;top:14px;z-index:90;max-width:60%;margin:0;padding:10px 16px;border-radius:8px;border:1px solid #EF6661;background:#2A1312;color:#FFD0CE;font-size:0.9rem;}
`;
  const st = document.createElement('style'); st.textContent = STYLE; document.head.appendChild(st);

  class PageTour extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const go = () => requestAnimationFrame(() => this._setup());
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true }); else go();
    }

    _setup() {
      const a = (n, d) => this.hasAttribute(n) ? this.getAttribute(n) : d;
      this.W = num(a('world-w'), 1600);
      this.style.setProperty('--pt-ar', a('aspect', '16/9'));
      this.style.setProperty('--pt-bg', color(a('background', 'base')));
      this.style.setProperty('--pt-cc', color(a('caption-color', 'key')));
      this.style.setProperty('--pt-hc', color(a('hud-color', 'key')));
      if (this.hasAttribute('dots')) this.classList.add('pt-dots');
      if (this.hasAttribute('clean')) this.classList.add('pt-clean');

      const stepEls = [...this.querySelectorAll(':scope > tour-step')];
      this.steps = stepEls.map(s => this._parse(s));
      stepEls.forEach(s => s.remove());

      /* 畫布：有 <tour-world> 就直接用（推薦，原本的內容完全不移動）；沒有就把其他子元素搬進新建的 tour-world */
      this.world = this.querySelector(':scope > tour-world');
      if (!this.world) { this.world = document.createElement('tour-world'); [...this.childNodes].forEach(n => this.world.append(n)); this.append(this.world); }
      this.world.style.width = this.W + 'px';
      this.world.style.position = 'absolute';
      this.world.querySelectorAll('tour-panel[x]').forEach(p => {
        ['x', 'y', 'w', 'h'].forEach((k, i) => { if (p.hasAttribute(k)) p.style[['left', 'top', 'width', 'height'][i]] = num(p.getAttribute(k), 0) + 'px'; });
      });
      this.lines = mk('svg', { class: 'pt-lines' }, this.world);
      this.fx = el('div', 'pt-fx', this.world);
      this.screen = el('div', 'pt-screen', this);
      this.cv = el('canvas', '', this.screen);
      this.cap = el('div', 'pt-cap', this.screen);
      this.cnt = el('div', 'pt-count', this.screen);
      this.cursor = el('div', 'pt-cursor', this.screen);
      this.cursor.innerHTML = '<svg viewBox="0 0 24 24" width="34" height="34"><path d="M3 2 L3 20 L8 15 L11.5 22 L14.5 20.5 L11 13.8 L18 13.8 Z" fill="#FFFFFF" stroke="#0C0D0C" stroke-width="1.6" stroke-linejoin="round"/></svg>';
      this.prog = el('div', 'pt-prog', this); el('i', '', this.prog);
      this._hud();

      this.t = 0; this.rate = 1; this.paused = false; this.timers = []; this.tweens = []; this.parts = [];
      this.runId = 0; this.i = -1; this._dimmed = []; this._hovers = []; this._marks = new Set(); this._counts = new Map(); this._clicked = new Set();
      this._sizeWorld();
      this.cam = this._camFor({ to: 'overview', rotate: 0 }); this._apply();
      this._progress();

      new ResizeObserver(() => { this._sizeCanvas(); if (this.i < 0) this.cam = this._camFor({ to: 'overview', rotate: 0 }); this._apply(); }).observe(this);
      new ResizeObserver(() => this._sizeWorld()).observe(this.world);
      this._sizeCanvas();
      let last = performance.now();
      const loop = now => { const dt = Math.min(0.1, (now - last) / 1000); last = now; if (!this.paused) { this.t += dt * this.rate; this._advance(); } this._confetti(this.paused ? 0 : dt * this.rate); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
      if (a('keyboard', 'true') !== 'false') document.addEventListener('keydown', e => this._key(e));

      const startAt = Math.max(0, num(a('start'), 0));
      if (this.hasAttribute('autoplay')) { this._started = true; this.hasAttribute('countdown') ? this._countdown().then(() => this.jump(startAt)) : this.jump(startAt); }
      else this._startScreen(startAt);
      this.dispatchEvent(new CustomEvent('page-tour:ready', { bubbles: true, detail: { total: this.steps.length } }));
    }

    _parse(s) {
      const a = (n, d) => s.hasAttribute(n) ? s.getAttribute(n) : d;
      const at = s.hasAttribute('at') ? String(a('at')).split(',').map(v => num(v, 0)) : null;
      return {
        to: a('to', 'overview').trim() || 'overview', at, zoom: s.hasAttribute('zoom') ? num(a('zoom'), 1) : (at ? 2 : null),
        move: num(a('move'), 1.4), hold: num(a('hold'), 2.5), rotate: num(a('rotate'), 0),
        dim: s.hasAttribute('dim'), drift: s.hasAttribute('drift'), caption: a('caption', ''),
        via: String(a('via', '')).split(',').map(x => x.trim()).filter(Boolean),
        fx: [...s.children].filter(c => /^FX-/.test(c.tagName)).map(c => ({ type: c.tagName.toLowerCase(), at: num(c.getAttribute('at'), 0), get: (n, d) => c.hasAttribute(n) ? c.getAttribute(n) : d, has: n => c.hasAttribute(n), text: c.textContent.trim() }))
      };
    }

    /* ── 時鐘：暫停與速度都作用在這裡 ── */
    wait(sec) { return new Promise(res => this.timers.push({ at: this.t + Math.max(0, sec), res })); }
    tween(sec, fn) { return new Promise(res => { if (sec <= 0) { fn(1); res(); return; } this.tweens.push({ t0: this.t, dur: sec, fn, res }); }); }
    _advance() {
      this.timers = this.timers.filter(w => { if (w.at <= this.t) { w.res(); return false; } return true; });
      this.tweens = this.tweens.filter(w => { const p = Math.min(1, (this.t - w.t0) / w.dur); w.fn(p); if (p >= 1) { w.res(); return false; } return true; });
    }

    /* ── 畫布與鏡頭 ── */
    _vw() { return this.clientWidth; }
    _vh() { return this.clientHeight; }
    _H() {
      let h = this.world.offsetHeight;
      this.world.querySelectorAll('tour-panel[x]').forEach(p => { h = Math.max(h, p.offsetTop + p.offsetHeight + 40); });
      return Math.max(h, 1);
    }
    _sizeWorld() { const h = this._H(); this.lines.setAttribute('width', this.W); this.lines.setAttribute('height', h); this.lines.setAttribute('viewBox', `0 0 ${this.W} ${h}`); }
    _q(sel) { try { return this.world.querySelector(sel); } catch (e) { return null; } }
    _box(sel) {
      if (sel === 'overview') return { x: 0, y: 0, w: this.W, h: this._H() };
      const keep = this.world.style.transform; this.world.style.transform = 'none';
      const wr = this.world.getBoundingClientRect(); let b = null;
      String(sel).split(',').map(x => x.trim()).filter(Boolean).forEach(q => {
        const e = this._q(q); if (!e) { this._warn(`找不到 ${q}`); return; }
        const r = e.getBoundingClientRect(), c = { x: r.left - wr.left, y: r.top - wr.top, w: r.width, h: r.height };
        if (!b) b = c; else { const x0 = Math.min(b.x, c.x), y0 = Math.min(b.y, c.y), x1 = Math.max(b.x + b.w, c.x + c.w), y1 = Math.max(b.y + b.h, c.y + c.h); b = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; }
      });
      this.world.style.transform = keep;
      return b || { x: 0, y: 0, w: this.W, h: this._H() };
    }
    _overS() { return Math.min((this._vw() - 40) / this.W, (this._vh() - 40) / this._H()); }
    _camFor(S) {
      if (S.at) { const s = this._overS() * (S.zoom || 2); return { x: S.at[0], y: S.at[1], s, r: S.rotate || 0 }; }
      const b = this._box(S.to), over = S.to === 'overview';
      const pad = over ? 20 : 70, vw = this._vw(), vh = this._vh() - (over ? 0 : 60);
      const s = S.zoom != null ? this._overS() * S.zoom : Math.min((vw - pad * 2) / Math.max(1, b.w), (vh - pad * 2) / Math.max(1, b.h));
      return { x: b.x + b.w / 2, y: b.y + b.h / 2 + (over ? 0 : 30 / s), s, r: S.rotate || 0 };
    }
    _apply() {
      const c = this.cam;
      this.world.style.transform = `translate(${this._vw() / 2}px, ${this._vh() / 2}px) rotate(${c.r}deg) scale(${c.s}) translate(${-c.x}px, ${-c.y}px)`;
      this.fx.querySelectorAll('.pt-sc.k').forEach(e => { e.style.transform = `scale(${1 / c.s})`; });
    }
    async _fly(to, dur) {
      const from = Object.assign({}, this.cam);
      const dist = Math.hypot(to.x - from.x, to.y - from.y) * Math.min(from.s, to.s);
      const arc = Math.min(0.42, Math.max(0, dist / (this._vw() * 2.2)));   /* 距離越遠，途中拉得越遠 */
      const l0 = Math.log(from.s), l1 = Math.log(to.s);
      await this.tween(dur, p => {
        const e = ease(p);
        this.cam = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, s: Math.exp(l0 + (l1 - l0) * e) * (1 - arc * Math.sin(Math.PI * e)), r: from.r + (to.r - from.r) * e };
        this._apply();
      });
    }

    /* ── 播放 ── */
    play() { if (!this.steps) return; if (!this._started) { this._begin(this._startIndex || 0); return; } if (this.paused) this.toggle(); }
    pause() { if (!this.paused) this.toggle(); }
    toggle() { this.paused = !this.paused; this.classList.toggle('pt-paused', this.paused); if (this.btnPlay) this.btnPlay.textContent = this.paused ? '播放' : '暫停'; }
    next() { this.jump(this.i + 1); }
    prev() { this.jump(this.i - 1); }
    restart() { this.jump(0); }
    get index() { return this.i; }
    get total() { return this.steps ? this.steps.length : 0; }

    _begin(i) {
      if (this.startEl) { this.startEl.remove(); this.startEl = null; }
      this._started = true;
      this.dispatchEvent(new CustomEvent('page-tour:start', { bubbles: true }));
      this._countdown().then(() => this.jump(i));
    }
    async _countdown() {
      const n = num(this.getAttribute('countdown'), 3);
      for (let k = n; k > 0; k--) { this.cnt.innerHTML = `<span>${k}</span>`; await this.wait(1); }
      this.cnt.innerHTML = '';
    }
    async _run(from) {
      const id = ++this.runId;
      for (let i = from; i < this.steps.length; i++) {
        this.i = i; this._progress();
        this.dispatchEvent(new CustomEvent('page-tour:step', { bubbles: true, detail: { index: i, total: this.steps.length } }));
        await this._step(this.steps[i], id);
        if (id !== this.runId) return;
      }
      this.i = this.steps.length; this._progress();
      this.dispatchEvent(new CustomEvent('page-tour:done', { bubbles: true }));
      if (this.hasAttribute('loop')) { await this.wait(1.5); if (id === this.runId) this.jump(0); }
    }
    async _step(S, id) {
      this._clearTransient();
      this._caption(S.caption);
      this._dim(S);
      for (const v of S.via) { await this._fly(this._camFor({ to: v, zoom: S.zoom, rotate: S.rotate }), S.move / (S.via.length + 1)); if (id !== this.runId) return; }
      const target = this._camFor(S);
      await this._fly(target, S.move / (S.via.length + 1));
      if (id !== this.runId) return;
      S.fx.forEach(f => this.wait(f.at).then(() => { if (id === this.runId) this._fx(f, false); }));
      if (S.drift) this.tween(S.hold, p => { this.cam.s = target.s * (1 + 0.05 * p); this._apply(); });
      await this.wait(S.hold);
    }
    _caption(t) { if (t) { this.cap.textContent = t; this.cap.classList.add('on'); } else this.cap.classList.remove('on'); }

    /* 聚光：從目標往上到 tour-world，沿途把「不在這條路上」的兄弟元素壓暗。SVG 內部不處理，整張 SVG 視為一個單位 */
    _dim(S) {
      this._dimmed.forEach(e => { e.classList.remove('pt-dim'); e.classList.add('pt-undim'); });
      this._dimmed = [];
      const on = S.dim && S.to !== 'overview' && !S.at;
      this.lines.classList.toggle('pt-ldim', on);
      this.fx.querySelectorAll('.pt-ln').forEach(e => e.classList.toggle('pt-ldim', on));
      if (!on) return;
      const targets = S.to.split(',').map(q => this._q(q.trim())).filter(Boolean).map(t => t.closest('svg') && t.closest('svg').parentElement && t instanceof SVGElement ? t.closest('svg') : t);
      const keep = new Set();
      targets.forEach(t => { for (let e = t; e && e !== this.world; e = e.parentElement) keep.add(e); });
      targets.forEach(t => {
        for (let e = t; e && e !== this.world; e = e.parentElement) {
          const p = e.parentElement; if (!p) break;
          [...p.children].forEach(c => {
            if (keep.has(c) || c === this.lines || c === this.fx || /^(SCRIPT|STYLE|TEMPLATE)$/.test(c.tagName)) return;
            if (!c.classList.contains('pt-dim')) { c.classList.add('pt-dim'); this._dimmed.push(c); }
          });
        }
      });
    }
    _clearTransient() {
      this.fx.querySelectorAll('.pt-tr').forEach(n => { n.classList.add('pt-out'); setTimeout(() => n.remove(), 400); });
      this.cursor.style.display = 'none';
      this._hovers.forEach(f => f()); this._hovers = [];
    }

    /* 跳步：清掉特效、把螢光筆與數字還原，再把前面各步會留下來的效果瞬間補上，從第 i 步開始播。
       頁面上被模擬點擊改變的內容不會還原；同一個點擊不會重複觸發 */
    jump(i) {
      if (!this.steps || !this.steps.length) return;
      i = Math.max(0, Math.min(this.steps.length - 1, i));
      if (this.startEl) { this.startEl.remove(); this.startEl = null; this._started = true; }
      this.runId++; this.timers = []; this.tweens = []; this.parts = []; this.cnt.innerHTML = '';
      this._clearTransient(); this.fx.innerHTML = ''; this.lines.innerHTML = '';
      this._marks.forEach(e => { e.classList.remove('pt-mark', 'on', 'instant'); e.style.removeProperty('--mk'); }); this._marks.clear();
      this._counts.forEach((t, e) => { e.textContent = t; });
      for (let k = 0; k < i; k++) this.steps[k].fx.forEach(f => this._fx(f, true));
      this.cam = i > 0 ? this._camFor(this.steps[i - 1]) : this._camFor({ to: 'overview', rotate: 0 });
      this._apply();
      if (this.paused) this.toggle();
      this._run(i);
    }
    _progress() {
      const n = this.steps.length;
      this.prog.firstChild.style.width = (n ? Math.max(0, this.i) / n * 100 : 0) + '%';
      if (this.stepEl) this.stepEl.textContent = `${Math.min(n, Math.max(0, this.i + 1))} / ${n}`;
    }
    _warn(msg) {
      clearTimeout(this._warnT);
      if (!this._alert) { this._alert = el('div', 'alert alert-danger pt-alert', this); this._alert.setAttribute('role', 'alert'); }
      this._alert.textContent = '[page-tour] ' + msg; this._alert.hidden = false;
      this._warnT = setTimeout(() => { this._alert.hidden = true; }, 4000);
    }

    /* ── 特效 ── */
    /* constant：每次運鏡都重設縮放，畫面上的大小固定 */
    _anchor(x, y, transient, constant) {
      const a = el('div', 'pt-anchor' + (transient ? ' pt-tr' : ''), this.fx);
      a.style.left = x + 'px'; a.style.top = y + 'px';
      const sc = el('div', 'pt-sc' + (constant ? ' k' : ''), a); sc.style.transform = `scale(${1 / this.cam.s})`;
      return sc;
    }
    _fx(f, instant) {
      const T = q => q && this._q(q);
      const s = this.cam.s;
      const need = q => { const e = T(q); if (!e) this._warn(`${f.type} 找不到 ${q || '（沒有寫 target）'}`); return e; };
      switch (f.type) {
        case 'fx-ring': {
          if (instant || !need(f.get('target'))) return;
          const b = this._box(f.get('target')), col = color(f.get('color', 'yellow'));
          const R = Math.max(b.w, b.h) / 2 * s + 18, sc = this._anchor(b.x + b.w / 2, b.y + b.h / 2, true);
          ['', 'p2'].forEach(k => { const r = el('div', 'pt-ring ' + k, sc); Object.assign(r.style, { left: -R + 'px', top: -R + 'px', width: R * 2 + 'px', height: R * 2 + 'px', borderColor: col }); });
          break;
        }
        case 'fx-arrow': {
          if (instant || !need(f.get('target'))) return;
          const b = this._box(f.get('target')), col = color(f.get('color', 'yellow'));
          const D = SIDES[f.get('from', 'top-left')] || SIDES['top-left'];
          const n = Math.hypot(D[0], D[1]), ux = D[0] / n, uy = D[1] / n;
          const tx = b.x + b.w / 2 + ux * (b.w / 2 + 10 / s), ty = b.y + b.h / 2 + uy * (b.h / 2 + 10 / s);
          const sc = this._anchor(tx, ty, true), len = num(f.get('length'), 170), th = 30, ang = Math.atan2(-uy, -ux) * 180 / Math.PI;
          const ar = el('div', 'pt-arrow', sc); ar.style.transform = `rotate(${ang}deg)`;
          ar.innerHTML = `<svg width="${len}" height="${th * 2.6}" viewBox="0 0 ${len} ${th * 2.6}" style="left:${-len}px;top:${-th * 1.3}px"><path d="M0,${th * 0.85} L${len - th * 1.4},${th * 0.85} L${len - th * 1.4},0 L${len},${th * 1.3} L${len - th * 1.4},${th * 2.6} L${len - th * 1.4},${th * 1.75} L0,${th * 1.75} Z" fill="${col}" stroke="#0C0D0C" stroke-width="4" stroke-linejoin="round"/></svg>`;
          if (f.text) { const p = el('div', 'pt-pill', sc); p.textContent = f.text; p.style.background = col; p.style.left = ux * (len + (Math.abs(ux) > 0.5 ? 74 : 40)) + 'px'; p.style.top = uy * (len + 34) + 'px'; }
          break;
        }
        case 'fx-mark': {
          const e = need(f.get('target')); if (!e) return;
          e.style.setProperty('--mk', color(f.get('color', 'yellow'))); e.classList.add('pt-mark'); this._marks.add(e);
          if (instant) { e.classList.add('instant', 'on'); return; }
          void e.offsetWidth; e.classList.add('on');
          break;
        }
        case 'fx-line': {
          if (!need(f.get('from')) || !need(f.get('to'))) return;
          const a = this._box(f.get('from')), b = this._box(f.get('to')), col = color(f.get('color', 'key'));
          const auto = (u, v) => { const dx = (v.x + v.w / 2) - (u.x + u.w / 2), dy = (v.y + v.h / 2) - (u.y + u.h / 2); return Math.abs(dx) / u.w > Math.abs(dy) / u.h ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top'); };
          const sa = SIDES[f.get('from-side')] ? f.get('from-side') : auto(a, b), sb = SIDES[f.get('to-side')] ? f.get('to-side') : auto(b, a);
          const at = (u, sd) => { const [ux, uy] = SIDES[sd]; return [u.x + u.w / 2 + ux * (u.w / 2 + 12), u.y + u.h / 2 + uy * (u.h / 2 + 12)]; };
          const nv = sd => { const [ux, uy] = SIDES[sd], n = Math.hypot(ux, uy); return [ux / n, uy / n]; };
          const p0 = at(a, sa), p3 = at(b, sb), n0 = nv(sa), n3 = nv(sb), k = Math.max(90, Math.hypot(p3[0] - p0[0], p3[1] - p0[1]) * 0.42);
          const p1 = [p0[0] + n0[0] * k, p0[1] + n0[1] * k], p2 = [p3[0] + n3[0] * k, p3[1] + n3[1] * k];
          const L = (u, v, t) => [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t];
          /* 畫到 t 為止的那一段曲線，以及該點的切線方向 */
          const part = t => { const a1 = L(p0, p1, t), b1 = L(p1, p2, t), c1 = L(p2, p3, t), a2 = L(a1, b1, t), b2 = L(b1, c1, t), e = L(a2, b2, t); return { d: `M${p0} C${a1} ${a2} ${e}`, e, ang: Math.atan2(b2[1] - a2[1], b2[0] - a2[0]) * 180 / Math.PI }; };
          const path = mk('path', { fill: 'none', stroke: col, 'stroke-width': num(f.get('width'), 4), 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' }, this.lines);
          const dot = this._anchor(p0[0], p0[1], false, true); dot.innerHTML = `<div style="position:absolute;left:-7px;top:-7px;width:14px;height:14px;border-radius:50%;background:${col}"></div>`;
          const head = this._anchor(p0[0], p0[1], false, true);
          head.innerHTML = `<svg width="26" height="26" viewBox="-13 -13 26 26" style="position:absolute;left:-13px;top:-13px;overflow:visible"><path d="M-6,-11 L10,0 L-6,11 Z" fill="${col}"/></svg>`;
          dot.parentNode.classList.add('pt-ln'); head.parentNode.classList.add('pt-ln');
          const draw = t => { const r = part(Math.max(0.001, t)); path.setAttribute('d', r.d); head.parentNode.style.left = r.e[0] + 'px'; head.parentNode.style.top = r.e[1] + 'px'; head.firstChild.style.transform = `rotate(${r.ang}deg)`; };
          if (instant) draw(1); else { draw(0.001); this.tween(num(f.get('duration'), 1.2), p => draw(ease(p))); }
          break;
        }
        case 'fx-count': {
          const e = need(f.get('target')); if (!e) return;
          if (!this._counts.has(e)) this._counts.set(e, e.textContent);
          const a = num(f.get('from'), 0), b = num(f.get('to'), 0), dec = num(f.get('decimals'), 0);
          if (instant) { e.textContent = b.toFixed(dec); return; }
          this.tween(num(f.get('duration'), 1.2), p => { e.textContent = (a + (b - a) * ease(p)).toFixed(dec); });
          break;
        }
        case 'fx-punch': {
          if (instant) return;
          const s0 = this.cam.s, k = num(f.get('strength'), 0.07);
          this.tween(0.45, p => { this.cam.s = s0 * (1 + k * Math.sin(Math.PI * p)); this._apply(); });
          break;
        }
        case 'fx-shake': {
          if (instant) return;
          const e = need(f.get('target')); if (!e) return;
          e.classList.remove('pt-shake'); void e.offsetWidth; e.classList.add('pt-shake');
          break;
        }
        case 'fx-note': {
          if (instant || !need(f.get('target'))) return;
          const b = this._box(f.get('target')), sc = this._anchor(b.x + b.w * 0.55, b.y + b.h + 12 / s, true);
          const n = el('div', 'pt-note', sc); n.textContent = f.text;
          if (f.has('color')) n.style.background = color(f.get('color'));
          break;
        }
        case 'fx-hover': {
          if (instant) return;
          const e = need(f.get('target')); if (!e) return;
          this._hover(e);
          break;
        }
        case 'fx-cursor': {
          const e = need(f.get('target')); if (!e) return;
          if (instant) { if (f.has('click') && !this._clicked.has(f)) { this._clicked.add(f); e.click(); } return; }
          const vr = this.getBoundingClientRect(), r = e.getBoundingClientRect();
          const x1 = r.left - vr.left + Math.min(r.width * 0.3, 60), y1 = r.top - vr.top + r.height * 0.55;
          const x0 = this._vw() * 0.82, y0 = this._vh() * 0.86;
          this.cursor.style.display = 'block';
          this.tween(num(f.get('duration'), 0.9), p => { const k = ease(p); this.cursor.style.transform = `translate(${x0 + (x1 - x0) * k}px, ${y0 + (y1 - y0) * k}px)`; })
            .then(() => this.wait(0.15)).then(() => {
              if (f.has('hover')) this._hover(e);
              if (!f.has('click') || this._clicked.has(f)) return;
              const rp = el('div', 'pt-ripple', this.screen); rp.style.left = x1 + 'px'; rp.style.top = y1 + 'px'; setTimeout(() => rp.remove(), 700);
              this._clicked.add(f); e.click();
            });
          break;
        }
        case 'fx-confetti': {
          if (instant) return;
          const q = f.get('target');
          if (q && T(q)) { const vr = this.getBoundingClientRect(), r = T(q).getBoundingClientRect(); this._burst(r.left - vr.left + r.width / 2, r.top - vr.top + r.height / 2, num(f.get('count'), 140)); }
          else this._rain(num(f.get('count'), 260));
          break;
        }
        default: this._warn(`不認得的特效 <${f.type}>`);
      }
    }
    /* hover：route-map 的車站用它自己的放大方法；其他元素送出 mouseenter 並加上 tour-hover class。步驟結束時自動還原 */
    _hover(e) {
      const map = e.closest && e.closest('route-map');
      if (map && typeof map.hover === 'function' && map.hover(e, true)) { this._hovers.push(() => map.hover(e, false)); return; }
      e.classList.add('tour-hover');
      e.dispatchEvent(new MouseEvent('mouseenter')); e.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      this._hovers.push(() => { e.classList.remove('tour-hover'); e.dispatchEvent(new MouseEvent('mouseleave')); e.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })); });
    }

    /* ── 彩帶 ── */
    _sizeCanvas() { const d = window.devicePixelRatio || 1; this.cv.width = Math.max(1, this._vw() * d); this.cv.height = Math.max(1, this._vh() * d); this.cv.getContext('2d').setTransform(d, 0, 0, d, 0, 0); }
    _particle(x, y, vx, vy) {
      const ribbon = Math.random() < 0.3;
      return { x, y, vx, vy, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 12, w: ribbon ? 5 : 8 + Math.random() * 6, h: ribbon ? 22 + Math.random() * 14 : 5 + Math.random() * 5, ph: Math.random() * 6.28, col: CONFETTI[(Math.random() * CONFETTI.length) | 0], life: 0, max: 3.2 + Math.random() * 1.6 };
    }
    _burst(x, y, n) { for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.9, v = 380 + Math.random() * 520; this.parts.push(this._particle(x, y, Math.cos(a) * v, Math.sin(a) * v)); } }
    _rain(n) {
      const w = this._vw(), h = this._vh();
      for (let i = 0; i < n * 0.5; i++) this.parts.push(this._particle(Math.random() * w, -20 - Math.random() * 200, (Math.random() - 0.5) * 120, 80 + Math.random() * 160));
      [[0, h * 0.9, 1], [w, h * 0.9, -1]].forEach(([x, y, d]) => { for (let i = 0; i < n * 0.25; i++) { const a = -Math.PI / 2 + d * (0.35 + Math.random() * 0.5), v = 600 + Math.random() * 500; this.parts.push(this._particle(x, y, Math.cos(a) * v, Math.sin(a) * v)); } });
    }
    _confetti(dt) {
      const ctx = this.cv.getContext('2d'); ctx.clearRect(0, 0, this._vw(), this._vh());
      if (!this.parts.length) return;
      this.parts = this.parts.filter(p => p.life < p.max && p.y < this._vh() + 60);
      this.parts.forEach(p => {
        p.life += dt; p.vy += 900 * dt; p.vx *= Math.pow(0.35, dt); p.vy *= Math.pow(0.55, dt); p.vy = Math.min(p.vy, 420);
        p.x += (p.vx + Math.sin(p.life * 6 + p.ph) * 40) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.life * 9 + p.ph));
        ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
    }

    /* ── 控制 ── */
    _hud() {
      const hud = el('div', 'pt-hud', this);
      const b = (t, fn) => { const x = el('button', '', hud); x.type = 'button'; x.textContent = t; x.onclick = e => { e.stopPropagation(); fn(); }; return x; };
      this.stepEl = el('span', '', hud);
      b('上一步', () => this.prev());
      this.btnPlay = b('暫停', () => this.toggle());
      b('下一步', () => this.next());
      b('重播', () => this.restart());
      this.btnRate = b('1x', () => this._rate((SPEEDS.indexOf(this.rate) + 1) % SPEEDS.length));
      b('隱藏 H', () => this.classList.toggle('pt-clean'));
      b('全螢幕 F', () => this._full());
    }
    _rate(k) { this.rate = SPEEDS[k]; this.btnRate.textContent = this.rate + 'x'; }
    _full() { if (document.fullscreenElement) document.exitFullscreen(); else if (this.requestFullscreen) this.requestFullscreen(); }
    _startScreen(i) {
      this._startIndex = i;
      const s = el('div', 'pt-start', this);
      s.innerHTML = `<b></b><div class="go"></div><small></small>`;
      s.children[0].textContent = this.getAttribute('start-title') || '鏡頭漫遊';
      s.children[1].textContent = this.getAttribute('start-button') || '開始播放';
      const n = num(this.getAttribute('countdown'), 3);
      s.children[2].textContent = this.getAttribute('start-text') || (n > 0 ? `開始後會先倒數 ${n} 秒，方便你按下錄影。也可以按空白鍵開始。` : '按空白鍵也可以開始。');
      s.onclick = () => this._begin(i); this.startEl = s;
    }
    _key(e) {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
      const r = this.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || !this.steps) return;
      const k = e.key.toLowerCase();
      if (k === ' ') { e.preventDefault(); if (this.startEl) this._begin(this._startIndex || 0); else this.toggle(); }
      else if (k === 'arrowright') { e.preventDefault(); this.next(); }
      else if (k === 'arrowleft') { e.preventDefault(); this.prev(); }
      else if (k === 'r') this.restart();
      else if (k === 'h') this.classList.toggle('pt-clean');
      else if (k === 'f') this._full();
      else if ('1234'.includes(k) && k) this._rate(+k - 1);
    }
  }

  ['tour-world', 'tour-panel', 'tour-step'].forEach(t => customElements.define(t, class extends HTMLElement {}));
  customElements.define('page-tour', PageTour);
  window.PageTour = { colors: PALETTE, effects: ['fx-ring', 'fx-arrow', 'fx-mark', 'fx-line', 'fx-count', 'fx-punch', 'fx-shake', 'fx-note', 'fx-hover', 'fx-cursor', 'fx-confetti'] };
})();
