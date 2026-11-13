(() => {
  'use strict';
  if (customElements.get('ui-stream')) return;

  const PALETTE = { base:'#0C0D0C', shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#DE8EC9', 'bg-alternative':'#3B2A20' };
  const color = v => { if (!v) return ''; const t = String(v).trim(); return PALETTE[t.toLowerCase()] || t; };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const fs = v => /^\d*\.?\d+$/.test(String(v)) ? v + 'rem' : v;

  const DEFAULTS = {
    /* 播放 */ autoplay: false, speed: 30, delay: 600, start: 0, loop: false, autoScroll: true, typeAll: false, step: false,
    /* 控制列 */ controls: false, controlsPosition: 'top', counter: true, progress: false, labels: '播放,暫停,下一則,重播', speedControl: false,
    /* 版面 */ height: 0, gap: 14, gapSame: -1, gapSystem: -1, padding: 16, bubbleWidth: 78, bubbleRadius: 12, bubblePadding: '10px 14px', lineHeight: 1.6,
               fontSize: '1rem', metaSize: '0.75rem', bordered: true, borderWidth: 1, bubbleBorderWidth: 0, avatar: true, avatarSize: 36, avatarPosition: 'top',
    /* 色彩 */ accent: 'key', borderColor: 'bg-alternative', textColor: 'vanilla', background: 'base', markColor: '',
               teacherColor: 'key', studentColor: 'violet', systemColor: 'gray', pauseColor: 'yellow',
    /* 動畫與暫停 */ animation: 'slide', cursor: true, typingIndicator: false, pauseIcon: 'hand-index-thumb', pauseText: '點一下繼續', pauseStyle: 'button'
  };
  const CFG = Object.assign({}, DEFAULTS, window.UiStreamConfig || {});

  /* ── 內建角色 ── side = 氣泡靠哪邊；style = filled | outline | dashed | double | notch | callout */
  const BUILTIN_ROLES = {
    teacher: { color: 'teacherColor', icon: 'mortarboard-fill', side: 'right', style: 'filled' },
    student: { color: 'studentColor', icon: 'person-fill', side: 'left', style: 'outline' },
    system:  { color: 'systemColor', icon: '', side: 'center', style: 'dashed' }
  };

  const CSS = `
ui-stream{display:block;color:${PALETTE.shell};font-size:var(--us-fs);}
ui-stream:not([data-ready]){visibility:hidden;}
ui-stream .us-title{font-size:1.2rem;font-weight:700;color:${PALETTE.violet};margin:0 0 12px 0;}
ui-stream .us-wrap{position:relative;border:var(--us-wbw,1px) solid var(--us-border);border-radius:10px;background:var(--us-bg);display:flex;flex-direction:column;overflow:hidden;}
ui-stream .us-wrap.us-noborder{border:0;border-radius:0;}
ui-stream .us-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--us-border);}
ui-stream .us-wrap.us-cbottom .us-bar{order:9;border-bottom:0;border-top:1px solid var(--us-border);}
ui-stream .us-bar button,ui-stream .us-bar select{background:transparent;border:1px solid var(--us-accent);color:var(--us-accent);border-radius:6px;padding:2px 10px;font-size:0.85rem;cursor:pointer;line-height:1.6;}
ui-stream .us-bar button:hover,ui-stream .us-bar button.on{background:var(--us-accent);color:${PALETTE.base};}
ui-stream .us-bar select option{background:${PALETTE.base};color:${PALETTE.shell};}
ui-stream .us-bar .us-count{margin-left:auto;font-size:0.8rem;color:${PALETTE.gray};font-variant-numeric:tabular-nums;}
ui-stream .us-prog{height:3px;background:var(--us-border);}
ui-stream .us-prog i{display:block;height:100%;width:0;background:var(--us-accent);transition:width .3s;}
ui-stream .us-feed{flex:1 1 auto;overflow:auto;padding:var(--us-pad);display:flex;flex-direction:column;scroll-behavior:smooth;}
ui-stream .us-feed > *{margin:var(--us-mt,0) 0 0 0;}
ui-stream .us-feed > :first-child{margin-top:0;}
ui-stream .us-msg{display:flex;gap:10px;max-width:var(--us-bw);opacity:0;transition:opacity .35s,transform .35s;}
ui-stream[avatar-position="bottom"] .us-msg{align-items:flex-end;}
ui-stream[animation="slide"] .us-msg.us-left{transform:translateX(-24px);}
ui-stream[animation="slide"] .us-msg.us-right{transform:translateX(24px);}
ui-stream[animation="slide"] .us-msg.us-center{transform:translateY(12px);}
ui-stream[animation="pop"] .us-msg{transform:scale(0.9);}
ui-stream .us-msg.us-right{align-self:flex-end;flex-direction:row-reverse;}
ui-stream .us-msg.us-center{align-self:center;max-width:90%;}
ui-stream .us-feed .us-msg.on{opacity:1;transform:none;}
ui-stream .us-avatar{flex:0 0 var(--us-av);width:var(--us-av);height:var(--us-av);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:calc(var(--us-av) * 0.5);color:${PALETTE.base};background:var(--us-c);overflow:hidden;}
ui-stream .us-avatar img{width:100%;height:100%;object-fit:cover;}
ui-stream .us-body{min-width:0;}
ui-stream .us-meta{font-size:var(--us-ms);color:${PALETTE.gray};margin:0 0 4px 0;display:flex;gap:8px;align-items:baseline;}
ui-stream .us-right .us-meta{justify-content:flex-end;}
ui-stream .us-meta b{color:var(--us-c);font-weight:700;}
ui-stream .us-badge{font-size:0.7rem;font-weight:700;border-radius:999px;padding:0 8px;background:var(--us-badge,var(--us-c));color:${PALETTE.base};}
ui-stream .us-bubble{border:var(--us-bbw,1px) solid var(--us-c);border-radius:var(--us-br);padding:var(--us-bp);line-height:var(--us-lh);color:var(--us-rt,var(--us-text));background:var(--us-bg);}
ui-stream .us-bubble > :last-child{margin-bottom:0;}
ui-stream .us-filled .us-bubble{background:var(--us-c);color:var(--us-rt,${PALETTE.base});}
ui-stream .us-dashed .us-bubble{border-style:dashed;color:var(--us-rt,${PALETTE.shell});font-size:0.9rem;text-align:center;}
/* double：雙線框 */
ui-stream .us-double .us-bubble{border-style:double;border-width:var(--us-bbw,4px);}
/* notch：切角框。氣泡靠左切右上角、靠右切左上角；切角大小沿用 bubble-radius。外層填邊框色，內層用 ::before 填底色 */
ui-stream .us-notch .us-bubble{position:relative;isolation:isolate;border:0;border-radius:0;background:var(--us-c);
  --cut:max(var(--us-br),6px);--nb:var(--us-bbw,1.5px);
  clip-path:polygon(0 0,calc(100% - var(--cut)) 0,100% var(--cut),100% 100%,0 100%);}
ui-stream .us-notch .us-bubble::before{content:'';position:absolute;inset:var(--nb);z-index:-1;
  background:color-mix(in srgb,var(--us-c) 26%,var(--us-bg));
  clip-path:polygon(0 0,calc(100% - var(--cut) + var(--nb) * 0.586) 0,100% calc(var(--cut) - var(--nb) * 0.586),100% 100%,0 100%);}
ui-stream .us-right.us-notch .us-bubble{clip-path:polygon(var(--cut) 0,100% 0,100% 100%,0 100%,0 var(--cut));}
ui-stream .us-right.us-notch .us-bubble::before{clip-path:polygon(calc(var(--cut) - var(--nb) * 0.586) 0,100% 0,100% 100%,0 100%,0 calc(var(--cut) - var(--nb) * 0.586));}
/* callout：粗框，外側另有一條分離的直線，直線上再拉出一條折線引線 */
ui-stream .us-callout .us-bubble{position:relative;border-width:var(--cb);border-radius:0;margin:0 0 0 78px;--cb:var(--us-bbw,3px);}
ui-stream .us-callout .us-bubble::before,ui-stream .us-callout .us-bubble::after{content:'';position:absolute;}
ui-stream .us-callout .us-bubble::before{top:calc(-1 * var(--cb));bottom:calc(-1 * var(--cb));left:calc(-2 * var(--cb) - 12px);width:var(--cb);background:var(--us-c);}
/* 引線：水平段從直線拉出，斜段指向頭像。頭像在上（預設）時往左上，avatar-position="bottom" 時往左下；靠右時鏡像 */
ui-stream .us-callout .us-bubble::after{top:-6px;left:calc(-2 * var(--cb) - 44px);width:calc(32px + var(--cb));height:36px;box-sizing:border-box;
  border-bottom:var(--cb) solid var(--us-c);border-left:var(--cb) solid var(--us-c);transform-origin:bottom left;transform:skewX(40deg);}
ui-stream .us-right.us-callout .us-bubble{margin:0 78px 0 0;}
ui-stream .us-right.us-callout .us-bubble::before{left:auto;right:calc(-2 * var(--cb) - 12px);}
ui-stream .us-right.us-callout .us-bubble::after{left:auto;right:calc(-2 * var(--cb) - 44px);border-left:0;border-right:var(--cb) solid var(--us-c);
  transform-origin:bottom right;transform:skewX(-40deg);}
ui-stream[avatar-position="bottom"] .us-callout .us-bubble::after{top:auto;bottom:-6px;border-bottom:0;border-top:var(--cb) solid var(--us-c);
  transform-origin:top left;transform:skewX(-40deg);}
ui-stream[avatar-position="bottom"] .us-right.us-callout .us-bubble::after{transform-origin:top right;transform:skewX(40deg);}
ui-stream[mark-color] .us-bubble mark{background:var(--us-mark);color:${PALETTE.base};}
ui-stream .us-hl .us-bubble{animation:us-hl 0.7s ease 3;}
@keyframes us-hl{0%,100%{box-shadow:0 0 0 0 var(--us-accent);}50%{box-shadow:0 0 0 4px var(--us-accent);}}
ui-stream .us-ch{display:none;}
ui-stream .us-ch.on{display:inline;}
ui-stream .us-cursor{display:inline-block;width:2px;height:1em;background:currentColor;vertical-align:-2px;margin:0 0 0 2px;animation:us-blink .8s steps(1) infinite;}
@keyframes us-blink{50%{opacity:0;}}
ui-stream .us-dots{display:inline-flex;gap:4px;align-items:center;height:1.6em;}
ui-stream .us-dots i{width:7px;height:7px;border-radius:50%;background:currentColor;animation:us-dot 1s infinite;}
ui-stream .us-dots i:nth-child(2){animation-delay:.2s;}
ui-stream .us-dots i:nth-child(3){animation-delay:.4s;}
@keyframes us-dot{0%,80%,100%{transform:translateY(0);opacity:0.4;}40%{transform:translateY(-4px);opacity:1;}}
ui-stream .us-pause{align-self:center;border:1px solid var(--us-pc);color:var(--us-pc);border-radius:999px;padding:6px 18px;font-size:0.9rem;cursor:pointer;background:var(--us-bg);}
ui-stream .us-pause:hover{background:var(--us-pc);color:${PALETTE.base};}
ui-stream .us-pause i{margin:0 6px 0 0;}
ui-stream .us-overlay{position:absolute;inset:0;background:var(--us-bg);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:3;}
ui-stream .us-overlay .us-pause{font-size:1.1rem;padding:12px 28px;margin:0;}
ui-stream .us-reveal{border:1px dashed var(--us-accent);border-radius:8px;padding:10px 14px;color:var(--us-text);align-self:stretch;}
ui-stream .us-reveal > :last-child{margin-bottom:0;}
ui-stream .us-err{color:${PALETTE.red};border:1px solid ${PALETTE.red};border-radius:8px;padding:8px 12px;font-size:0.9rem;}
`;
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

  /* 把內容裡每個字包成 span，逐字顯示時 HTML 標籤（mark、c-key 等）會跟著出現 */
  function wrapChars(root) {
    const spans = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const texts = []; while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(t => {
      const frag = document.createDocumentFragment();
      [...t.textContent].forEach(ch => { const s = el('span', 'us-ch', ch); frag.append(s); spans.push(s); });
      t.replaceWith(frag);
    });
    return spans;
  }
  const cloneSource = id => {
    const src = document.getElementById(id);
    if (!src) return el('span', 'us-err', `找不到 #${id}`);
    if (src.content) return src.content.cloneNode(true);
    const c = src.cloneNode(true); c.removeAttribute('id'); c.hidden = false; c.style.display = ''; return c;
  };

  class UiStream extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this._opt = {};
      Object.keys(DEFAULTS).forEach(k => {
        const attr = k.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
        if (!this.hasAttribute(attr)) { this._opt[k] = CFG[k]; return; }
        const v = this.getAttribute(attr);
        this._opt[k] = typeof DEFAULTS[k] === 'boolean' ? v !== 'false' : typeof DEFAULTS[k] === 'number' ? num(v, CFG[k]) : v;
      });
      ['animation', 'avatar-position'].forEach(a => { const k = a.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); if (!this.hasAttribute(a)) this.setAttribute(a, this._opt[k]); });
      if (this._opt.markColor && !this.hasAttribute('mark-color')) this.setAttribute('mark-color', this._opt.markColor);
      if (!this._opt.markColor) this.removeAttribute('mark-color');

      this._roles = {};
      Object.entries(BUILTIN_ROLES).forEach(([n, r]) => { this._roles[n] = Object.assign({}, r, { color: color(this._opt[r.color]) }); });
      this.querySelectorAll(':scope > stream-role').forEach(r => this._addRole(r.getAttribute('name'), { color: r.getAttribute('color'), icon: r.getAttribute('icon'), side: r.getAttribute('side'), style: r.getAttribute('style'), label: r.getAttribute('label'), image: r.getAttribute('image'), textColor: r.getAttribute('text-color') }));

      this._title = this.getAttribute('title'); this.removeAttribute('title');
      this._rate = 1;
      const src = this.getAttribute('src'), dataId = this.getAttribute('data-id');
      if (dataId) { this._fromJSON(window[dataId]); this._build(); }
      else if (src) { fetch(src).then(r => r.json()).then(j => { this._fromJSON(j); this._build(); }).catch(e => { this.innerHTML = ''; this.appendChild(el('div', 'us-err', '[ui-stream] 讀取 src 失敗：' + e.message)); this.setAttribute('data-ready', ''); }); }
      else { this._fromMarkup(); this._build(); }
    }

    _addRole(name, r) {
      if (!name) return;
      const base = this._roles[name] || { icon: 'person-fill', side: 'left', style: 'outline' };
      this._roles[name] = { color: r.color ? color(r.color) : (base.color || PALETTE.shell), icon: r.icon != null ? r.icon : base.icon, side: r.side || base.side, style: r.style || base.style, label: r.label || base.label, image: r.image || base.image, textColor: r.textColor ? color(r.textColor) : base.textColor };
    }
    _normItem(d) {
      return Object.assign({ from: 'student', name: '', time: '', typed: false, html: '' }, d, { from: (d.from || 'student').toLowerCase(), html: d.html != null ? d.html : (d.text || '') });
    }
    _fromMarkup() {
      this._src = [...this.querySelectorAll(':scope > stream-item')].map(it => {
        const srcId = it.getAttribute('source'), srcEl = srcId && document.getElementById(srcId);
        const html = srcEl ? (srcEl.content ? [...srcEl.content.childNodes].map(n => n.outerHTML || n.textContent).join('') : srcEl.innerHTML) : it.innerHTML;
        return this._normItem({
          from: it.getAttribute('from'), name: it.getAttribute('name'), time: it.getAttribute('time'),
          icon: it.getAttribute('icon'), image: it.getAttribute('image'), badge: it.getAttribute('badge'), badgeColor: it.getAttribute('badge-color'), color: it.getAttribute('color'),
          typed: it.hasAttribute('typed'), speed: it.getAttribute('speed'), delay: it.getAttribute('delay'), gap: it.getAttribute('gap'), highlight: it.hasAttribute('highlight'),
          pause: it.getAttribute('pause'), reveal: it.getAttribute('reveal'), revealTarget: it.getAttribute('reveal-target'),
          html: srcId && !srcEl ? `<span class="us-err">找不到 #${srcId}</span>` : html
        });
      });
    }
    _fromJSON(j) {
      if (!j) { this._src = []; return; }
      const items = Array.isArray(j) ? j : (j.items || []);
      if (j && j.roles) Object.entries(j.roles).forEach(([n, r]) => this._addRole(n, r));
      this._src = items.map(d => this._normItem(d));
    }

    _build() {
      const o = this._opt;
      this.innerHTML = '';
      const sv = (k, v) => this.style.setProperty(k, v);
      sv('--us-fs', fs(o.fontSize)); sv('--us-ms', fs(o.metaSize));
      sv('--us-pad', o.padding + 'px'); sv('--us-bw', o.bubbleWidth + '%'); sv('--us-br', o.bubbleRadius + 'px'); sv('--us-bp', o.bubblePadding); sv('--us-lh', o.lineHeight); sv('--us-av', o.avatarSize + 'px');
      sv('--us-accent', color(o.accent)); sv('--us-border', color(o.borderColor)); sv('--us-text', color(o.textColor)); sv('--us-pc', color(o.pauseColor)); sv('--us-bg', color(o.background));
      if (o.markColor) sv('--us-mark', color(o.markColor));
      sv('--us-wbw', Math.max(0, o.borderWidth) + 'px');
      if (o.bubbleBorderWidth > 0) sv('--us-bbw', o.bubbleBorderWidth + 'px');
      if (this._title) this.appendChild(el('div', 'us-title', this._title));
      const wrap = el('div', 'us-wrap' + (o.bordered ? '' : ' us-noborder') + (o.controlsPosition === 'bottom' ? ' us-cbottom' : ''));
      this._wrap = wrap;
      if (o.height) wrap.style.height = o.height + 'px';
      if (o.controls) {
        const bar = el('div', 'us-bar'); const L = String(o.labels).split(',');
        const mk = (ic, t, fn) => { const b = el('button'); b.innerHTML = `<i class="bi bi-${ic}"></i> ${t || ''}`.trim(); b.onclick = fn; return b; };
        this._btnPlay = mk('play-fill', L[0], () => this.toggle());
        bar.append(this._btnPlay, mk('skip-end-fill', L[2], () => this.next()), mk('arrow-counterclockwise', L[3], () => this.replay()));
        this._labels = L;
        if (o.speedControl) {
          const sel = el('select');
          [['0.5', '0.5x'], ['1', '1x'], ['1.5', '1.5x'], ['2', '2x']].forEach(([v, t]) => { const op = el('option', null, t); op.value = v; if (v === '1') op.selected = true; sel.append(op); });
          sel.onchange = () => { this._rate = parseFloat(sel.value); };
          bar.append(sel);
        }
        if (o.counter) { this._count = el('span', 'us-count'); bar.append(this._count); }
        wrap.append(bar);
      }
      if (o.progress) { this._prog = el('div', 'us-prog'); this._prog.append(el('i')); wrap.append(this._prog); }
      this._feed = el('div', 'us-feed'); wrap.append(this._feed); this.appendChild(wrap);
      this.setAttribute('data-ready', '');
      this._i = 0; this._playing = false; this._typing = null; this._prev = null;
      this._update();
      if (o.start > 0) this.goto(o.start);
      if (o.autoplay) this.play();
    }

    /* ── 公開方法 ── */
    play() { if (this._playing || this._i >= this._src.length) return; this._playing = true; this._update(); this._show(false); }
    pause() { this._playing = false; clearTimeout(this._t); if (this._typing) this._typing.finish(); this._update(); }
    toggle() { this._playing ? this.pause() : this.play(); }
    next() { this.pause(); this._clearPause(); this._show(true); }
    replay() { this.pause(); this._clearPause(); this._i = 0; this._prev = null; this._feed.innerHTML = ''; this._update(); this.play(); }
    finish() { this.pause(); this._clearPause(); while (this._i < this._src.length) this._show(true, true); }
    goto(i) { this.pause(); this._clearPause(); this._i = 0; this._prev = null; this._feed.innerHTML = ''; const n = Math.max(0, Math.min(i, this._src.length)); while (this._i < n) this._show(true, true); this._update(); }
    add(item) { const atEnd = this._i >= this._src.length; this._src.push(this._normItem(item || {})); this._update(); if (atEnd && !this._feed.querySelector('.us-pause') && !this._wrap.querySelector('.us-overlay')) this.play(); return this._src.length; }
    export(format) {
      const msgs = [...this._feed.querySelectorAll('.us-msg')];
      if (format === 'html') return msgs.map(m => m.outerHTML).join('\n');
      return msgs.map(m => { const nm = m.querySelector('.us-meta b'), t = m.querySelector('.us-meta span:not(.us-badge)'); const head = [nm && nm.textContent, t && t.textContent].filter(Boolean).join(' '); return (head ? head + '：' : '') + m.querySelector('.us-bubble').textContent.trim(); }).join('\n');
    }
    get index() { return this._i; }
    get total() { return this._src.length; }

    _update() {
      if (this._count) this._count.textContent = `${this._i} / ${this._src.length}`;
      if (this._prog) this._prog.firstChild.style.width = (this._src.length ? this._i / this._src.length * 100 : 0) + '%';
      if (this._btnPlay) { const L = this._labels; this._btnPlay.innerHTML = this._playing ? `<i class="bi bi-pause-fill"></i> ${L[1] || ''}` : `<i class="bi bi-play-fill"></i> ${L[0] || ''}`; this._btnPlay.classList.toggle('on', this._playing); }
    }
    _clearPause() { this._feed.querySelectorAll('.us-pause').forEach(p => p.remove()); this._wrap.querySelectorAll('.us-overlay').forEach(p => p.remove()); }
    _scroll() { if (this._opt.autoScroll) this._feed.scrollTop = this._feed.scrollHeight; }
    _ms(v) { return v / this._rate; }
    _gapFor(d, role) {
      const o = this._opt;
      if (d.gap != null && d.gap !== '') return num(d.gap, o.gap);
      const isSys = role.side === 'center', prevSys = this._prev && this._prev.side === 'center';
      if ((isSys || prevSys) && o.gapSystem >= 0) return o.gapSystem;
      if (this._prev && this._prev.from === d.from && !isSys && o.gapSame >= 0) return o.gapSame;
      return o.gap;
    }

    _show(manual, silent) {
      if (this._i >= this._src.length) {
        this._playing = false; this._update();
        this.dispatchEvent(new CustomEvent('ui-stream:done', { bubbles: true, detail: { total: this._src.length } }));
        if (this._opt.loop && !silent) { this._i = 0; this._prev = null; this._feed.innerHTML = ''; this._t = setTimeout(() => this.play(), this._ms(this._opt.delay)); }
        return;
      }
      const d = this._src[this._i], idx = this._i++;
      const role = this._roles[d.from] || this._roles.student;
      const c = d.color ? color(d.color) : role.color;
      const msg = el('div', `us-msg us-${role.side} us-${role.style}`); msg.style.setProperty('--us-c', c);
      msg.style.setProperty('--us-mt', this._gapFor(d, role) + 'px');
      if (role.textColor) msg.style.setProperty('--us-rt', role.textColor);
      if (d.badgeColor) msg.style.setProperty('--us-badge', color(d.badgeColor));
      this._prev = { from: d.from, side: role.side };
      if (role.side !== 'center' && this._opt.avatar) {
        const av = el('div', 'us-avatar'); const img = d.image || role.image;
        if (img) { const im = el('img'); im.src = img; im.alt = d.name || ''; av.append(im); }
        else av.innerHTML = `<i class="bi bi-${d.icon || role.icon || 'person-fill'}"></i>`;
        msg.append(av);
      }
      const body = el('div', 'us-body');
      const nm = d.name || role.label || '';
      if (nm || d.time || d.badge) { const m = el('div', 'us-meta'); if (nm) m.append(el('b', null, nm)); if (d.time) m.append(el('span', null, d.time)); if (d.badge) m.append(el('span', 'us-badge', d.badge)); body.append(m); }
      const bub = el('div', 'us-bubble'); body.append(bub); msg.append(body);
      this._feed.append(msg);
      if (silent) { bub.innerHTML = d.html; msg.classList.add('on'); this._update(); return; }
      requestAnimationFrame(() => { msg.classList.add('on'); this._scroll(); });
      this._update();
      this.dispatchEvent(new CustomEvent('ui-stream:item', { bubbles: true, detail: { index: idx, item: msg, role: d.from } }));

      const after = () => {
        this._typing = null;
        if (d.highlight) msg.classList.add('us-hl');
        if (d.pause != null) {
          this._playing = false; this._update();
          const p = el('button', 'us-pause'); p.innerHTML = `<i class="bi bi-${this._opt.pauseIcon}"></i>${d.pause || this._opt.pauseText}`;
          const go = () => { this._clearPause(); this._reveal(d); this.dispatchEvent(new CustomEvent('ui-stream:resume', { bubbles: true, detail: { index: idx } })); this.play(); };
          if (this._opt.pauseStyle === 'overlay') { const ov = el('div', 'us-overlay'); ov.append(p); ov.onclick = go; const bar = this._wrap.querySelector('.us-bar'); if (bar) ov.style[this._opt.controlsPosition === 'bottom' ? 'bottom' : 'top'] = bar.offsetHeight + 'px'; this._wrap.append(ov); }
          else { p.style.setProperty('--us-mt', this._opt.gap + 'px'); p.onclick = go; this._feed.append(p); this._scroll(); }
          this.dispatchEvent(new CustomEvent('ui-stream:pause', { bubbles: true, detail: { index: idx, text: d.pause } }));
          return;
        }
        this._reveal(d);
        if (this._opt.step) { this._playing = false; this._update(); return; }
        if (this._playing) this._t = setTimeout(() => this._show(false), this._ms(num(d.delay, this._opt.delay)));
      };
      const typed = (d.typed || this._opt.typeAll) && !manual;
      const startTyping = () => {
        bub.innerHTML = d.html;
        const spans = wrapChars(bub); const cur = this._opt.cursor ? el('span', 'us-cursor') : null; if (cur) bub.append(cur);
        let k = 0; const sp = this._ms(num(d.speed, this._opt.speed));
        const done = () => { spans.forEach(s => s.classList.add('on')); if (cur) cur.remove(); this.dispatchEvent(new CustomEvent('ui-stream:typed', { bubbles: true, detail: { index: idx } })); };
        const tick = () => {
          if (k < spans.length) { spans[k++].classList.add('on'); if (k % 4 === 0) this._scroll(); this._t = setTimeout(tick, sp); }
          else { done(); after(); }
        };
        this._typing = { finish: () => { clearTimeout(this._t); done(); } };
        tick();
      };
      if (typed && this._opt.typingIndicator && role.side !== 'center') {
        bub.innerHTML = '<span class="us-dots"><i></i><i></i><i></i></span>';
        this._typing = { finish: () => { clearTimeout(this._t); bub.innerHTML = d.html; this.dispatchEvent(new CustomEvent('ui-stream:typed', { bubbles: true, detail: { index: idx } })); } };
        this._t = setTimeout(startTyping, this._ms(700));
      } else if (typed) startTyping();
      else { bub.innerHTML = d.html; after(); }
    }
    _reveal(d) {
      if (!d.reveal) return;
      const content = cloneSource(d.reveal);
      if (d.revealTarget) {
        const tg = document.getElementById(d.revealTarget);
        if (!tg) { const e = el('div', 'us-err', `找不到 reveal-target #${d.revealTarget}`); e.style.setProperty('--us-mt', this._opt.gap + 'px'); this._feed.append(e); return; }
        tg.innerHTML = ''; tg.append(content); tg.hidden = false; tg.classList.remove('d-none'); tg.style.display = '';
        return;
      }
      const box = el('div', 'us-reveal'); box.style.setProperty('--us-mt', this._opt.gap + 'px'); box.append(content);
      this._feed.append(box); this._scroll();
    }
  }
  customElements.define('stream-role', class extends HTMLElement {});
  customElements.define('stream-item', class extends HTMLElement {});
  customElements.define('ui-stream', UiStream);
  window.UiStream = { defaults: DEFAULTS, config: CFG, colors: PALETTE };
})();
