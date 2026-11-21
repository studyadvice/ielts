(() => {
  if (customElements.get('ui-detail-ladder')) return;

  const CSS_ATTRS = {
    'margin': '6px 12px',
    'padding': '6px 12px',
    'bg': '#0C0D0C',
    'border-color': '#C6C7BD',
    'border-width': '1px',
    'border-radius': '12px',
    'rail-width': '200px',
    'column-gap': '24px',
    'step-gap': '14px',
    'step-font-size': '0.8125rem',
    'dot-size': '22px',
    'dot-font-size': '0.6875rem',
    'label-color': '#C6C7BD',
    'active-color': '#5DBAE8',
    'current-color': '#5DBAE8',
    'line-style': 'solid',
    'line-width': '2px',
    'line-color': '#C6C7BD',
    'line-active-color': '#5DBAE8',
    'pill-font-size': '0.85rem',
    'pill-bg': '#B484E8',
    'pill-color': '#0C0D0C',
    'title-font-size': '1.0625rem',
    'title-color': '#5DBAE8',
    'body-font-size': '1rem',
    'body-color': '#C6C7BD',
    'note-font-size': '0.85rem',
    'note-color': '#C6C7BD',
    'divider-style': 'solid',
    'divider-width': '1px',
    'divider-color': '#C6C7BD',
    'hl-bg': '#71CD76',
    'hl-color': '#0C0D0C',
    'progress-height': '6px',
    'progress-color': '#71CD76',
    'progress-color-end': '',
    'progress-track': '#262826',
    'progress-text-size': '0.75rem',
    'progress-text-color': '#C6C7BD',
    'button-font-size': '0.875rem',
    'title-icon-color': '#E3D322',
    'ini-title-size': '1rem',
    'ini-title-color': '#5DBAE8',
    'ini-title-bg': '#161816'
  };

  /* 品牌色名稱對照：顏色屬性可直接填名稱（不分大小寫） */
  const COLOR_NAMES = {
    base: '#0C0D0C', 'bg-alternative': '#2D2D2D',
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7',
    red: '#EF6661', green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1',
    violet: '#B484E8', gray: '#86877F', key: '#51DBCF', calm: '#A3C4BC',
    quiet: '#8EA4DE', playful: '#FFA987', urgent: '#FF2E63',
    energetic: '#B6FF00', dreamy: '#C394CD', salmon: '#FFC88A'
  };

  /* CSS_ATTRS 之中屬於顏色的屬性，值會先經過品牌色名稱轉換 */
  const COLOR_ATTRS = new Set([
    'bg', 'border-color', 'label-color', 'active-color', 'current-color',
    'line-color', 'line-active-color', 'pill-bg', 'pill-color', 'title-color',
    'body-color', 'note-color', 'divider-color', 'hl-bg', 'hl-color',
    'progress-color', 'progress-color-end', 'progress-track', 'progress-text-color',
    'title-icon-color', 'ini-title-color', 'ini-title-bg'
  ]);

  const resolveColor = (v) => {
    if (typeof v !== 'string') return v;
    const k = v.trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(COLOR_NAMES, k) ? COLOR_NAMES[k] : v;
  };

  /* 主題：只列出與預設不同的顏色屬性，值可用品牌色名稱。
   * a 為強調色，on 為疊在強調色上的文字色。default 為空物件，代表完全使用 CSS_ATTRS 的內建預設。 */
  const accentTheme = (a, on = 'base') => ({
    'border-color': a,
    'active-color': a,
    'current-color': a,
    'line-active-color': a,
    'pill-bg': a,
    'pill-color': on,
    'title-color': a,
    'divider-color': a,
    'hl-bg': a,
    'hl-color': on,
    'progress-color': a,
    'ini-title-color': a
  });

  const THEMES = { default: {} };
  ['shell', 'vanilla', 'yellow', 'pink', 'red', 'green', 'blue', 'indigo', 'violet', 'gray',
    'key', 'calm', 'quiet', 'playful', 'urgent', 'energetic', 'dreamy', 'salmon'
  ].forEach((n) => { THEMES[n] = accentTheme(n); });

  const OPT_ATTRS = {
    'direction': 'up',
    'border': 'false',
    'show-pill': 'true',
    'show-divider': 'false',
    'show-progress': 'true',
    'show-buttons': 'true',
    'progress-text': '具體程度 {p}%',
    'next-text': '往上一階',
    'reset-text': '重來',
    'start': '1',
    'ini-title': '點擊展開',
    'keyboard': 'true',
    'theme': 'default',
    'autoplay-start': 'click',
    'autoplay-end': 'stop',
    'pause-on-hover': 'false',
    'show-timer': 'true',
    'play-text': '播放',
    'pause-text': '暫停',
    'mark-fx': 'true',
    'mark-speed': '1',
    'mark-delay': '400',
    'mark-animate': 'true'
  };
  const AUTOPLAY_SEC = 8;

  const STYLE = `
ui-detail-ladder{display:block;box-sizing:border-box;margin:var(--udl-margin);padding:var(--udl-padding);background:var(--udl-bg);border:var(--udl-border-line);border-radius:var(--udl-border-radius);color:var(--udl-body-color)}
ui-detail-ladder *{box-sizing:border-box}
ui-detail-ladder:not([data-udl-ready]) ladder-step{display:none}
ui-detail-ladder .udl-wrap{display:grid;grid-template-columns:var(--udl-rail-width) minmax(0,1fr);gap:var(--udl-column-gap);align-items:start}
ui-detail-ladder .udl-rail{position:relative;padding:4px 0}
ui-detail-ladder .udl-steps{position:relative;z-index:2;display:flex;flex-direction:column-reverse;gap:var(--udl-step-gap)}
ui-detail-ladder[direction="down"] .udl-steps{flex-direction:column}
ui-detail-ladder .udl-line,ui-detail-ladder .udl-line-fill{position:absolute;z-index:1;width:0;left:calc(var(--udl-dot-size) / 2 - var(--udl-line-width) / 2);border-left:var(--udl-line-width) var(--udl-line-style) var(--udl-line-color)}
ui-detail-ladder .udl-line-fill{border-left-color:var(--udl-line-active-color);transition:top .35s,height .35s}
ui-detail-ladder .udl-rung{display:flex;align-items:center;gap:12px;cursor:pointer;user-select:none}
ui-detail-ladder .udl-dot{flex-shrink:0;width:var(--udl-dot-size);height:var(--udl-dot-size);border-radius:50%;border:2px solid var(--udl-label-color);background:var(--udl-bg);color:var(--udl-label-color);font-size:var(--udl-dot-font-size);display:flex;align-items:center;justify-content:center;transition:all .25s}
ui-detail-ladder .udl-label{font-size:var(--udl-step-font-size);color:var(--udl-label-color);line-height:1.4;transition:color .25s}
ui-detail-ladder .udl-rung.is-on .udl-dot{border-color:var(--udl-active-color);background:var(--udl-active-color);color:var(--udl-bg)}
ui-detail-ladder .udl-rung.is-on .udl-label{color:var(--udl-active-color)}
ui-detail-ladder .udl-rung.is-cur .udl-dot{border-color:var(--udl-current-color);background:var(--udl-current-color);color:var(--udl-bg);transform:scale(1.2)}
ui-detail-ladder .udl-rung.is-cur .udl-label{color:var(--udl-current-color)}
ui-detail-ladder .udl-rung:hover .udl-label{text-decoration:underline}
ui-detail-ladder .udl-pill{display:inline-block;font-size:var(--udl-pill-font-size);background:var(--udl-pill-bg);color:var(--udl-pill-color);border-radius:999px;padding:2px 12px;margin:0 0 10px 0}
ui-detail-ladder .udl-title{font-size:var(--udl-title-font-size);color:var(--udl-title-color);font-weight:600;margin:0 0 8px 0}
ui-detail-ladder .udl-title:empty,ui-detail-ladder .udl-note:empty{display:none}
ui-detail-ladder .udl-body{font-size:var(--udl-body-font-size);color:var(--udl-body-color);line-height:1.8;border-top:var(--udl-divider-line);border-bottom:var(--udl-divider-line);padding:var(--udl-body-pad)}
ui-detail-ladder .udl-note{font-size:var(--udl-note-font-size);color:var(--udl-note-color);line-height:1.7;margin:10px 0 0 0}
ui-detail-ladder .udl-in{animation:udl-fade .35s ease}
@keyframes udl-fade{from{opacity:.2;transform:translateY(4px)}to{opacity:1;transform:none}}
ui-detail-ladder mark-fx{display:none}
ui-detail-ladder .udl-content{position:relative}
ui-detail-ladder .udl-fxmark{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:1}
ui-detail-ladder mark{background:var(--udl-hl-bg);color:var(--udl-hl-color);border-radius:4px;padding:0 4px}
ui-detail-ladder .udl-progress{margin:16px 0 0 0}
ui-detail-ladder .udl-track{height:var(--udl-progress-height);background:var(--udl-progress-track);border-radius:999px;overflow:hidden}
ui-detail-ladder .udl-bar{height:100%;width:0;background:var(--udl-progress-fill);border-radius:999px;transition:width .35s}
ui-detail-ladder .udl-ptext{font-size:var(--udl-progress-text-size);color:var(--udl-progress-text-color);margin:6px 0 0 0}
ui-detail-ladder .udl-btns{display:flex;gap:8px;margin:14px 0 4px 0}
ui-detail-ladder .udl-btn{font-size:var(--udl-button-font-size);border:none;border-radius:6px;padding:6px 14px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
ui-detail-ladder .udl-next{background:var(--udl-active-color);color:var(--udl-bg)}
ui-detail-ladder .udl-reset{background:var(--udl-progress-track);color:var(--udl-label-color)}
ui-detail-ladder .udl-btn:hover{filter:brightness(1.1)}
ui-detail-ladder:focus,ui-detail-ladder:focus-visible{outline:none}
ui-detail-ladder .udl-title i.bi{color:var(--udl-title-icon-color);margin:0 8px 0 0}
ui-detail-ladder .udl-head{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;background:var(--udl-ini-title-bg);color:var(--udl-ini-title-color);font-size:var(--udl-ini-title-size);border-radius:8px;padding:10px 14px}
ui-detail-ladder .udl-head:hover{filter:brightness(1.15)}
ui-detail-ladder .udl-head .udl-head-text{flex:1}
ui-detail-ladder .udl-head .udl-chev{transition:transform .25s}
ui-detail-ladder.udl-open .udl-head .udl-chev{transform:rotate(180deg)}
ui-detail-ladder.udl-collapsible.udl-open .udl-wrap{margin:14px 0 0 0}
ui-detail-ladder.udl-collapsible:not(.udl-open) .udl-wrap{display:none}
ui-detail-ladder.udl-collapsible.udl-open .udl-wrap{animation:udl-fade .3s ease}
ui-detail-ladder .udl-timer{height:3px;background:var(--udl-progress-track);border-radius:999px;overflow:hidden;margin:14px 0 0 0}
ui-detail-ladder .udl-timer > i{display:block;height:100%;background:var(--udl-active-color);transform-origin:left center}
ui-detail-ladder .udl-timer.is-paused > i{background:var(--udl-label-color)}
ui-detail-ladder .udl-play{background:var(--udl-progress-track);color:var(--udl-active-color)}
ui-detail-ladder .udl-play.is-playing{background:var(--udl-active-color);color:var(--udl-bg)}
ui-detail-ladder.udl-kbd-active .udl-rung.is-cur .udl-dot{outline:2px solid var(--udl-current-color);outline-offset:3px}
`;

  if (!document.getElementById('ui-detail-ladder-style')) {
    const s = document.createElement('style');
    s.id = 'ui-detail-ladder-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  /* 鍵盤：Ctrl+Shift+上下方向鍵，作用於取得焦點或游標最後停留的元件 */
  let activeLadder = null;
  document.addEventListener('keydown', (e) => {
    if (!e.ctrlKey || !e.shiftKey || e.altKey || e.metaKey) return;
    const isSpace = e.code === 'Space' || e.key === ' ';
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && !isSpace) return;
    const ae = document.activeElement;
    const inLadder = ae && ae.closest ? ae.closest('ui-detail-ladder') : null;
    const editing = ae && (ae.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName));
    if (editing && !inLadder) return;
    const target = inLadder || activeLadder;
    if (!target || !target.isConnected || typeof target._keyMove !== 'function') return;
    if (isSpace) {
      if (target._keyToggle()) e.preventDefault();
      return;
    }
    if (target._keyMove(e.key === 'ArrowUp' ? 'up' : 'down')) e.preventDefault();
  });

  /* ── mark-fx 文字標記（與 ui-post 的 mark-fx 同一套寫法，精簡移植：不含 stamp-fx、note-fx） ── */
  const LadderFx = (() => {
    const CANCEL = { cancelled: true, fx: true };
    const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
    const col = (v, d) => (v == null || String(v).trim() === '') ? d : resolveColor(String(v).trim());
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    class Run {
      constructor(o) {
        this.rate = o.rate || (() => 1);
        this.skipping = !!o.instant;
        this.skipping0 = this.skipping;
        this.dead = false;
        this.waits = new Set();
        this.anims = new Set();
      }
      sleep(ms) {
        if (this.dead) return Promise.reject(CANCEL);
        return new Promise((res, rej) => {
          const w = { res, rej, t: null };
          w.done = () => { this.waits.delete(w); clearTimeout(w.t); res(); };
          this.waits.add(w);
          if (this.skipping) { w.done(); return; }
          w.t = setTimeout(w.done, Math.max(0, ms || 0) / this.rate());
        });
      }
      anim(el, kf, ms, opts) {
        if (this.dead) return Promise.reject(CANCEL);
        const a = el.animate(kf, Object.assign({ duration: this.skipping ? 1 : Math.max(1, ms / this.rate()), fill: 'both', easing: 'ease-out' }, opts || {}));
        this.anims.add(a);
        if (this.skipping) { try { a.finish(); } catch (e) {} }
        return a.finished.then(() => {}, () => {}).then(() => { this.anims.delete(a); if (this.dead) throw CANCEL; });
      }
      skip() {
        if (this.dead) return;
        this.skipping = true;
        [...this.waits].forEach((w) => w.done());
        this.anims.forEach((a) => { try { a.finish(); } catch (e) {} });
      }
      cancel() {
        if (this.dead) return;
        this.dead = true;
        [...this.waits].forEach((w) => { clearTimeout(w.t); this.waits.delete(w); w.rej(CANCEL); });
        this.anims.forEach((a) => { try { a.cancel(); } catch (e) {} });
      }
    }

    function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    function makeRng(seed) {
      let a = seed >>> 0;
      return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    }
    function seedOf(v, fallback) { if (v != null && v !== '') return /^\d+$/.test(v) ? parseInt(v, 10) : hashStr(String(v)); return hashStr(fallback); }
    const subs = new WeakMap();
    function sub(root, text, nth) {
      let cache = subs.get(root); if (!cache) { cache = new Map(); subs.set(root, cache); }
      const key = text + '\u0000' + nth;
      if (cache.has(key) && cache.get(key).isConnected) return cache.get(key);
      const nodes = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let full = '';
      while (w.nextNode()) { nodes.push({ node: w.currentNode, start: full.length }); full += w.currentNode.data; }
      let idx = -1, from = 0;
      for (let i = 0; i < nth; i++) { idx = full.indexOf(text, from); if (idx === -1) return null; from = idx + text.length; }
      const end = idx + text.length;
      const locate = (pos, isEnd) => {
        for (let i = 0; i < nodes.length; i++) { const n = nodes[i], L = n.node.data.length; if (pos < n.start + L || (isEnd && pos === n.start + L)) return { node: n.node, off: pos - n.start }; }
        const last = nodes[nodes.length - 1]; return { node: last.node, off: last.node.data.length };
      };
      const a = locate(idx, false), b = locate(end, true);
      const range = document.createRange(); range.setStart(a.node, a.off); range.setEnd(b.node, b.off);
      const span = document.createElement('span'); span.className = 'udl-fxsub';
      span.appendChild(range.extractContents()); range.insertNode(span);
      cache.set(key, span);
      return span;
    }
    function targets(el, ctx) {
      const sel = el.getAttribute('target');
      let list = [];
      if (!sel) list = [ctx.scope];
      else {
        try {
          list = [...ctx.scope.querySelectorAll(sel)];
          if (!list.length) list = [...ctx.layer.querySelectorAll(sel)];
        } catch (e) { return []; }
      }
      const text = el.getAttribute('text');
      if (text != null && text !== '') { const nth = parseInt(el.getAttribute('nth'), 10) || 1; return list.map((n) => sub(n, text, nth)).filter(Boolean); }
      return list;
    }
    function keep(ctx, place) { ctx.live.push(place); return () => { const i = ctx.live.indexOf(place); if (i >= 0) ctx.live.splice(i, 1); }; }
    function stayFor(run, el, node, drop, def) {
      const stay = el.getAttribute('stay') || 'forever';
      if (stay === 'forever') return;
      run.sleep(num(stay, 2000)).then(() => {
        if (!node.isConnected) return;
        const a = node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: Math.max(1, num(el.getAttribute('fade-out'), def) / run.rate()), fill: 'forwards' });
        a.finished.then(() => { node.remove(); drop(); }, () => {});
      }, () => {});
    }

    const SVGNS = 'http://www.w3.org/2000/svg';
    function roughLine(x1, y1, x2, y2, rough, rnd) {
      const j = () => (rnd() - 0.5) * rough * 4;
      const L = Math.hypot(x2 - x1, y2 - y1) || 1;
      const nx = -(y2 - y1) / L, ny = (x2 - x1) / L;
      const bow = (rnd() - 0.5) * rough * (2 + L * 0.02);
      const mx = (x1 + x2) / 2 + nx * bow, my = (y1 + y2) / 2 + ny * bow;
      return `M${(x1 + j()).toFixed(1)} ${(y1 + j()).toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${(x2 + j()).toFixed(1)} ${(y2 + j()).toFixed(1)}`;
    }
    function wavePath(x1, x2, y, amp, rough, rnd) {
      const w = Math.max(1, x2 - x1), half = w / Math.max(2, Math.round(w / (amp * 2)));
      let d = `M${x1.toFixed(1)} ${y.toFixed(1)}`, x = x1, up = true;
      while (x < x2 - 0.01) {
        const nx = Math.min(x2, x + half), j = (rnd() - 0.5) * rough * amp;
        d += ` Q${((x + nx) / 2).toFixed(1)} ${(y + (up ? -1 : 1) * (amp * 2 + j)).toFixed(1)} ${nx.toFixed(1)} ${y.toFixed(1)}`;
        x = nx; up = !up;
      }
      return d;
    }
    function lines(el, layer) {
      const c = layer.getBoundingClientRect();
      let rects = [...el.getClientRects()];
      if (getComputedStyle(el).display !== 'inline') {
        const rg = document.createRange(); rg.selectNodeContents(el);
        const inner = [...rg.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
        if (inner.length) {
          const merged = [];
          inner.forEach((r) => {
            const m = merged.find((q) => Math.abs(q.top - r.top) < r.height * 0.5);
            if (m) { m.left = Math.min(m.left, r.left); m.right = Math.max(m.right, r.right); m.top = Math.min(m.top, r.top); m.bottom = Math.max(m.bottom, r.bottom); }
            else merged.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
          });
          rects = merged.map((m) => ({ left: m.left, top: m.top, width: m.right - m.left, height: m.bottom - m.top }));
        }
      }
      return rects.filter((r) => r.width > 0.5).map((r) => ({ x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height }));
    }
    async function mark(run, el, ctx) {
      const kind = (el.getAttribute('kind') || 'box').toLowerCase();
      const list = targets(el, ctx);
      if (!list.length) return;
      const speed = num(el.getAttribute('speed'), kind === 'color' ? 300 : 600);

      if (kind === 'color') {
        const c = col(el.getAttribute('color'), '#51DBCF');
        const old = list.map((t) => t.style.color);
        list.forEach((t) => { t.style.transition = run.skipping ? '' : `color ${Math.max(1, speed / run.rate())}ms`; t.style.color = c; });
        await run.sleep(speed);
        const stay = el.getAttribute('stay') || 'forever';
        if (stay !== 'forever') run.sleep(num(stay, 2000)).then(() => list.forEach((t, i) => { t.style.color = old[i]; }), () => {});
        return;
      }

      const layer = ctx.layer;
      const c = col(el.getAttribute('color'), kind === 'arrow' || kind === 'box' ? '#51DBCF' : '#EF6661');
      const thick = num(el.getAttribute('thickness'), kind === 'wavy' || kind === 'box' ? 2 : 3);
      const rough = clamp(num(el.getAttribute('rough'), 0.5), 0, 1);
      const pad = num(el.getAttribute('padding'), kind === 'cross' ? 2 : 4);
      const seed0 = el.getAttribute('seed');
      let dest = null;
      if (kind === 'arrow') {
        const toSel = el.getAttribute('to-target'), toText = el.getAttribute('to');
        if (toSel) { try { dest = ctx.scope.querySelector(toSel) || layer.querySelector(toSel) || document.querySelector(toSel); } catch (e) { dest = null; } }
        if (toText != null && toText !== '') dest = sub(dest || ctx.scope, toText, parseInt(el.getAttribute('to-nth'), 10) || 1);
        if (!dest) return;
      }
      const geom = () => {
        const ds = [];
        (kind === 'arrow' ? list.slice(0, 1) : list).forEach((t, ti) => {
          if (!t.isConnected) return;
          const rnd = makeRng(seedOf(seed0, kind + '|' + (el.getAttribute('text') || '') + '|' + ti));
          const ls = lines(t, layer);
          if (!ls.length) return;
          if (kind === 'wavy') {
            const amp = thick * 0.6 + 1.2;
            ls.forEach((r) => ds.push(wavePath(r.x - pad * 0.25, r.x + r.w + pad * 0.25, r.y + r.h * 0.98 + amp * 0.5, amp, rough, rnd)));
          } else if (kind === 'box') {
            /* 把文字框起來：每一行各畫一個圓角框，rough 愈大線條愈歪；radius 控制圓角 */
            const rad = num(el.getAttribute('radius'), 4);
            ls.forEach((r) => {
              const j = () => (rnd() - 0.5) * rough * 3;
              const x1 = r.x - pad, x2 = r.x + r.w + pad, y1 = r.y + r.h * 0.06 - pad * 0.5, y2 = r.y + r.h * 0.96 + pad * 0.5;
              const q = Math.min(rad, (x2 - x1) / 2, (y2 - y1) / 2);
              const P = (x, y) => `${(x + j()).toFixed(1)} ${(y + j()).toFixed(1)}`;
              ds.push(`M${P(x1 + q, y1)} L${P(x2 - q, y1)} Q${P(x2, y1)} ${P(x2, y1 + q)} L${P(x2, y2 - q)} Q${P(x2, y2)} ${P(x2 - q, y2)} L${P(x1 + q, y2)} Q${P(x1, y2)} ${P(x1, y2 - q)} L${P(x1, y1 + q)} Q${P(x1, y1)} ${P(x1 + q + 3, y1)}`);
            });
          } else if (kind === 'cross') {
            ls.forEach((r) => {
              const x1 = r.x - pad, x2 = r.x + r.w + pad, y1 = r.y + r.h * 0.1 - pad * 0.5, y2 = r.y + r.h * 0.92 + pad * 0.5;
              ds.push(roughLine(x1, y1, x2, y2, rough, rnd), roughLine(x2, y1, x1, y2, rough, rnd));
            });
          } else if (kind === 'arrow') {
            if (!dest.isConnected) return;
            const dl = lines(dest, layer);
            if (!dl.length) return;
            const a = ls[0], b = dl[0];
            const head = num(el.getAttribute('head'), 9);
            const sx = a.x + a.w / 2, ex = b.x + b.w / 2;
            const dist = Math.hypot(ex - sx, (b.y + b.h / 2) - (a.y + a.h / 2));
            const bend = num(el.getAttribute('bend'), clamp(dist * 0.1, 6, 14));
            const jx = (rnd() - 0.5) * rough * 6, jy = (rnd() - 0.5) * rough * 4;
            let sy, ey, cx, cy, shaft;
            if (Math.abs(a.y - b.y) < a.h * 0.5) {
              let side = (el.getAttribute('side') || 'auto').toLowerCase();
              if (side !== 'top' && side !== 'bottom') {
                const all = lines(ctx.scope, layer);
                const lastY = all.length ? Math.max(...all.map((r) => r.y)) : a.y;
                side = a.y > lastY - a.h * 0.5 ? 'bottom' : 'top';
              }
              const below = side === 'bottom', gap = 3;
              sy = below ? a.y + a.h + gap : a.y - gap; ey = below ? b.y + b.h + gap : b.y - gap;
              cx = (sx + ex) / 2 + jx; cy = (below ? Math.max(sy, ey) + bend * 2 : Math.min(sy, ey) - bend * 2) + jy;
              shaft = `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
            } else {
              const down = b.y > a.y, gap = 1;
              sy = down ? a.y + a.h + gap : a.y - gap; ey = down ? b.y - gap : b.y + b.h + gap;
              const k = Math.max(bend, Math.abs(ey - sy) * 0.5) * (down ? 1 : -1);
              cx = ex + jx * 0.3; cy = ey - k;
              shaft = `M${sx.toFixed(1)} ${sy.toFixed(1)} C${(sx + jx).toFixed(1)} ${(sy + k).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
            }
            const tl = Math.hypot(ex - cx, ey - cy) || 1, ux = (ex - cx) / tl, uy = (ey - cy) / tl;
            const wing = (ang) => { const co = Math.cos(ang), si = Math.sin(ang); return [ex - (ux * co - uy * si) * head, ey - (ux * si + uy * co) * head]; };
            const w1 = wing(0.5), w2 = wing(-0.5);
            ds.push(shaft);
            ds.push(`M${w1[0].toFixed(1)} ${w1[1].toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)} L${w2[0].toFixed(1)} ${w2[1].toFixed(1)}`);
          } else {
            ls.forEach((r) => { const y = r.y + r.h * 0.55; ds.push(roughLine(r.x - pad * 0.5, y, r.x + r.w + pad * 0.5, y, rough, rnd)); });
          }
        });
        return ds;
      };
      const svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('class', 'udl-fxmark');
      layer.appendChild(svg);
      const paths = [];
      const draw = () => {
        const ds = geom();
        while (paths.length < ds.length) {
          const p = document.createElementNS(SVGNS, 'path');
          p.setAttribute('fill', 'none'); p.setAttribute('stroke', c); p.setAttribute('stroke-width', thick);
          p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
          svg.appendChild(p); paths.push(p);
        }
        while (paths.length > ds.length) paths.pop().remove();
        ds.forEach((d, i) => paths[i].setAttribute('d', d));
      };
      draw();
      if (!paths.length) { svg.remove(); return; }
      const drop = keep(ctx, () => { if (svg.isConnected) draw(); });
      const first = paths.slice();
      const lens = first.map((p) => (p.getTotalLength ? p.getTotalLength() : 100) || 1);
      const total = lens.reduce((x, y) => x + y, 0) || 1;
      first.forEach((p, i) => { p.style.strokeDasharray = lens[i]; p.style.strokeDashoffset = lens[i]; });
      for (let i = 0; i < first.length; i++) {
        await run.anim(first[i], [{ strokeDashoffset: lens[i] }, { strokeDashoffset: 0 }], speed * lens[i] / total, { easing: 'ease-in-out' });
        first[i].style.strokeDasharray = 'none'; first[i].style.strokeDashoffset = '0';
      }
      stayFor(run, el, svg, drop, 300);
    }

    async function play(run, specs, ctxOf) {
      const els = specs.map((x) => { const t = document.createElement('template'); t.innerHTML = x.h; const e = t.content.firstElementChild; if (e) e._r = x.r; return e; }).filter(Boolean);
      const groups = [];
      els.forEach((el) => {
        const s = (el.getAttribute('start') || 'after').toLowerCase();
        if (s === 'with' && groups.length) groups[groups.length - 1].push(el); else groups.push([el]);
      });
      for (const g of groups) {
        await Promise.all(g.map(async (el) => {
          await run.sleep(num(el.getAttribute('delay'), 0));
          await mark(run, el, ctxOf(el._r));
        }));
      }
    }

    return { CANCEL, Run, play };
  })();

  class UiDetailLadder extends HTMLElement {
    static get observedAttributes() {
      return [...Object.keys(CSS_ATTRS), ...Object.keys(OPT_ATTRS), 'ini-collapse', 'autoplay'];
    }

    constructor() {
      super();
      this._steps = null;
      this._cur = 0;
      this._ready = false;
      this._open = true;
      this._playing = false;
      this._elapsed = 0;
      this._holds = new Set();
      this._raf = 0;
      this._autoStarted = false;
      this._auto = null;
      this._fxRun = null; this._fxTimer = 0; this._fxLive = []; this._marksStarted = false; this._io = null;
    }

    connectedCallback() {
      if (this._ready) { this._setupAuto(); return; }
      const init = () => this._init();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
      } else {
        init();
      }
    }

    disconnectedCallback() {
      if (this._ro) this._ro.disconnect();
      this._teardownAuto();
      this._stopMarks();
      if (this._io) { this._io.disconnect(); this._io = null; }
      if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
    }

    attributeChangedCallback(name) {
      if (!this._ready) return;
      if (name === 'ini-collapse') this._open = !this._collapsible();
      this._applyVars();
      this._build();
      if (name.indexOf('autoplay') === 0 || name === 'pause-on-hover') this._setupAuto();
    }

    _collapsible() {
      const v = this.getAttribute('ini-collapse');
      return v !== null && v.toLowerCase() !== 'false';
    }

    _opt(name) {
      const v = this.getAttribute(name);
      return v === null || v === '' ? OPT_ATTRS[name] : v;
    }

    _bool(name) {
      return this._opt(name).toLowerCase() !== 'false';
    }

    _css(name) {
      const v = this.getAttribute(name);
      const has = v !== null && v !== '';
      if (!COLOR_ATTRS.has(name)) return has ? v : CSS_ATTRS[name];
      /* 顏色屬性的優先順序：個別屬性 > theme > 內建預設 */
      if (has) return resolveColor(v);
      const tv = THEMES[this._themeName()][name];
      return resolveColor(tv !== undefined ? tv : CSS_ATTRS[name]);
    }

    _themeName() {
      const t = this._opt('theme').trim().toLowerCase();
      return Object.prototype.hasOwnProperty.call(THEMES, t) ? t : 'default';
    }

    static get themes() {
      return Object.keys(THEMES);
    }

    _init() {
      if (this._ready) return;
      const nodes = [...this.querySelectorAll(':scope > ladder-step')];
      this._steps = nodes.map((n, i) => {
        const fx = [];
        const pick = (tag) => {
          const el = n.querySelector(tag);
          if (!el) return '';
          const html = el.innerHTML;
          if (!/<mark-fx\b/i.test(html)) return html.trim();
          const tp = document.createElement('template');
          tp.innerHTML = html;
          [...tp.content.querySelectorAll('mark-fx')].forEach((m) => { fx.push({ r: tag.replace('step-', ''), h: m.outerHTML }); m.remove(); });
          return tp.innerHTML.trim();
        };
        const t = n.querySelector('step-title');
        return {
          fx,
          label: n.getAttribute('label') || '',
          pill: n.getAttribute('pill') || (i === 0 ? '起點' : `第${i}階`),
          title: pick('step-title'),
          icon: t ? (t.getAttribute('icon') || '') : '',
          iconColor: t ? (t.getAttribute('icon-color') || '') : '',
          body: pick('step-body'),
          note: pick('step-note'),
          dwell: parseFloat(n.getAttribute('dwell'))
        };
      });
      this.innerHTML = '';
      this.setAttribute('data-udl-ready', '');
      if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
      this._open = !this._collapsible();
      const mark = () => { activeLadder = this; };
      this.addEventListener('pointerenter', mark);
      this.addEventListener('focusin', mark);
      this.addEventListener('pointerdown', () => {
        mark();
        this.classList.remove('udl-kbd-active');
      });
      const start = parseInt(this._opt('start'), 10);
      this._cur = Math.min(Math.max((isNaN(start) ? 1 : start) - 1, 0), Math.max(this._steps.length - 1, 0));
      this._ready = true;
      this._applyVars();
      this._build();
      this._ro = new ResizeObserver(() => { this._layoutLine(); this._relayoutMarks(); });
      this._ro.observe(this);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this._layoutLine());
      this._setupAuto();
    }

    _applyVars() {
      const st = this.style;
      Object.keys(CSS_ATTRS).forEach((k) => {
        if (k === 'progress-color-end') return;
        st.setProperty(`--udl-${k}`, this._css(k));
      });
      st.setProperty('--udl-border-line',
        this._bool('border') ? `${this._css('border-width')} solid ${this._css('border-color')}` : 'none');
      const divOn = this._bool('show-divider');
      st.setProperty('--udl-divider-line',
        divOn ? `${this._css('divider-width')} ${this._css('divider-style')} ${this._css('divider-color')}` : 'none');
      st.setProperty('--udl-body-pad', divOn ? '10px 0' : '0');
      const c1 = this._css('progress-color');
      const c2 = this._css('progress-color-end');
      st.setProperty('--udl-progress-fill', c2 ? `linear-gradient(90deg, ${c1}, ${c2})` : c1);
    }

    _build() {
      const steps = this._steps || [];
      const down = this._opt('direction') === 'down';
      const arrow = down ? 'bi-arrow-down' : 'bi-arrow-up';
      const coll = this._collapsible();
      this.classList.toggle('udl-collapsible', coll);
      this.classList.toggle('udl-open', this._open);

      this.innerHTML = `
        ${coll ? `<div class="udl-head">
          <i class="bi bi-layers"></i>
          <span class="udl-head-text">${this._opt('ini-title')}</span>
          <i class="bi bi-chevron-down udl-chev"></i>
        </div>` : ''}
        <div class="udl-wrap">
          <div class="udl-rail">
            <div class="udl-line"></div>
            <div class="udl-line-fill"></div>
            <div class="udl-steps"></div>
          </div>
          <div class="udl-main">
            ${this._bool('show-pill') ? '<span class="udl-pill"></span>' : ''}
            <div class="udl-content">
              <div class="udl-title"></div>
              <div class="udl-body"></div>
              <div class="udl-note"></div>
            </div>
            ${this._hasAutoplay() && this._bool('show-timer') ? '<div class="udl-timer"><i></i></div>' : ''}
            ${this._bool('show-progress') ? '<div class="udl-progress"><div class="udl-track"><div class="udl-bar"></div></div><div class="udl-ptext"></div></div>' : ''}
            ${this._bool('show-buttons') ? `<div class="udl-btns">
              <button type="button" class="udl-btn udl-next"><span>${this._opt('next-text')}</span><i class="bi ${arrow}"></i></button>
              <button type="button" class="udl-btn udl-reset"><i class="bi bi-arrow-counterclockwise"></i><span>${this._opt('reset-text')}</span></button>
              ${this._hasAutoplay() ? '<button type="button" class="udl-btn udl-play"><i class="bi bi-play-fill"></i><span></span></button>' : ''}
            </div>` : ''}
          </div>
        </div>`;

      const box = this.querySelector('.udl-steps');
      steps.forEach((s, i) => {
        const r = document.createElement('div');
        r.className = 'udl-rung';
        r.innerHTML = `<span class="udl-dot">${i + 1}</span><span class="udl-label">${s.label}</span>`;
        r.addEventListener('click', () => { this.pause(); this.go(i + 1); });
        box.appendChild(r);
      });

      const nx = this.querySelector('.udl-next');
      const rs = this.querySelector('.udl-reset');
      if (nx) nx.addEventListener('click', () => { this.pause(); this.next(); });
      if (rs) rs.addEventListener('click', () => { this.pause(); this.reset(); });
      const pl = this.querySelector('.udl-play');
      if (pl) pl.addEventListener('click', () => (this._playing ? this.pause() : this.play()));
      const hd = this.querySelector('.udl-head');
      if (hd) hd.addEventListener('click', () => this.toggle());

      this._render(false);
      this._syncPlayBtn();
      this._renderTimer();
    }

    _iconHtml(s) {
      if (!s.icon) return '';
      let n = s.icon.trim().replace(/^bi\s+/, '');
      if (!n.startsWith('bi-')) n = `bi-${n}`;
      const st = s.iconColor ? ` style="color:${resolveColor(s.iconColor)}"` : '';
      return `<i class="bi ${n}"${st}></i>`;
    }

    _keyMove(dir) {
      if (!this._bool('keyboard')) return false;
      if (this._collapsible() && !this._open) return false;
      const down = this._opt('direction') === 'down';
      /* 方向鍵依畫面上的上下移動：由下往上排列時，上鍵是下一階 */
      const forward = down ? dir === 'down' : dir === 'up';
      this.pause();
      if (forward) this.next(); else this.prev();
      this.classList.add('udl-kbd-active');
      return true;
    }

    _render(animate = true) {
      const steps = this._steps || [];
      if (!steps.length) return;
      const s = steps[this._cur];

      [...this.querySelectorAll('.udl-rung')].forEach((r, i) => {
        r.classList.toggle('is-on', i < this._cur);
        r.classList.toggle('is-cur', i === this._cur);
      });

      const pill = this.querySelector('.udl-pill');
      if (pill) pill.textContent = s.label ? `${s.pill}：${s.label}` : s.pill;

      this.querySelector('.udl-title').innerHTML = this._iconHtml(s) + s.title;
      this.querySelector('.udl-body').innerHTML = s.body;
      this.querySelector('.udl-note').innerHTML = s.note;
      this._runMarks(animate);

      const content = this.querySelector('.udl-content');
      if (animate) {
        content.classList.remove('udl-in');
        void content.offsetWidth;
        content.classList.add('udl-in');
      }

      const total = steps.length;
      const p = Math.round(((this._cur + 1) / total) * 100);
      const bar = this.querySelector('.udl-bar');
      if (bar) bar.style.width = `${p}%`;
      const pt = this.querySelector('.udl-ptext');
      if (pt) {
        pt.textContent = this._opt('progress-text')
          .replace(/\{p\}/g, p)
          .replace(/\{n\}/g, this._cur + 1)
          .replace(/\{total\}/g, total);
      }

      const nx = this.querySelector('.udl-next');
      if (nx) nx.style.visibility = this._cur < total - 1 ? 'visible' : 'hidden';

      this._layoutLine();
    }

    /* ── mark-fx 文字標記 ── */
    _stopMarks() {
      if (this._fxRun) { this._fxRun.cancel(); this._fxRun = null; }
      if (this._fxTimer) { clearTimeout(this._fxTimer); this._fxTimer = 0; }
      this._fxLive = [];
      this.querySelectorAll('.udl-fxmark').forEach((n) => n.remove());
    }

    _runMarks(animate) {
      this._stopMarks();
      const s = (this._steps || [])[this._cur];
      const content = this.querySelector('.udl-content');
      if (!s || !s.fx.length || !content || !this._bool('mark-fx')) return;
      if (this._collapsible() && !this._open) return;
      const first = !this._marksStarted;
      if (first) {
        this._marksStarted = true;
        if (!this._io && window.IntersectionObserver) {
          const wait = () => {
            this._io = new IntersectionObserver((es) => {
              if (!es.some((e) => e.isIntersecting)) return;
              this._io.disconnect(); this._io = null;
              this._runMarks(true);
            }, { threshold: 0.3 });
            this._io.observe(this);
          };
          const r = this.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight || r.width === 0) { this._marksStarted = false; wait(); return; }
        }
      }
      const instant = !this._bool('mark-animate') || (animate === false && !first);
      const speed = Math.min(4, Math.max(0.25, parseFloat(this._opt('mark-speed')) || 1));
      const delay = Math.max(0, parseFloat(this._opt('mark-delay')) || 0);
      const run = new LadderFx.Run({ rate: () => speed, instant });
      this._fxRun = run;
      const live = this._fxLive;
      const ctxOf = (r) => ({ layer: content, scope: this.querySelector('.udl-' + r) || content, live });
      /* 自動播放時，標記必須在該階停留時間結束前畫完，來不及就直接顯示完成 */
      if (this._hasAutoplay() && !instant) this._fxTimer = setTimeout(() => run.skip(), Math.max(0, this._dwell() - 700));
      run.sleep(delay).then(() => LadderFx.play(run, s.fx, ctxOf)).catch((e) => { if (e !== LadderFx.CANCEL) console.warn('[ui-detail-ladder] mark-fx 錯誤', e); });
    }

    _relayoutMarks() {
      (this._fxLive || []).slice().forEach((f) => f());
    }

    _layoutLine() {
      const rail = this.querySelector('.udl-rail');
      const dots = [...this.querySelectorAll('.udl-dot')];
      const line = this.querySelector('.udl-line');
      const fill = this.querySelector('.udl-line-fill');
      if (!rail || !line || dots.length < 2) {
        if (line) line.style.height = '0';
        if (fill) fill.style.height = '0';
        return;
      }
      const base = rail.getBoundingClientRect().top;
      const cy = (el) => {
        const r = el.getBoundingClientRect();
        return r.top - base + r.height / 2;
      };
      const first = cy(dots[0]);
      const last = cy(dots[dots.length - 1]);
      const cur = cy(dots[this._cur]);
      line.style.top = `${Math.min(first, last)}px`;
      line.style.height = `${Math.abs(last - first)}px`;
      fill.style.top = `${Math.min(first, cur)}px`;
      fill.style.height = `${Math.abs(cur - first)}px`;
    }

    get current() { return this._cur + 1; }
    get total() { return (this._steps || []).length; }

    go(n) {
      const total = this.total;
      if (!total) return;
      const idx = Math.min(Math.max(n - 1, 0), total - 1);
      if (idx === this._cur && this._ready) { this._render(false); return; }
      this._cur = idx;
      this._elapsed = 0;
      this._render(true);
      this.dispatchEvent(new CustomEvent('ladder-change', {
        bubbles: true,
        detail: { index: idx + 1, total, label: this._steps[idx].label }
      }));
    }

    next() { this.go(this._cur + 2); }
    prev() { this.go(this._cur); }
    reset() { this.go(1); }

    /* ── 自動播放（v1.3） ── */
    _hasAutoplay() {
      const v = this.getAttribute('autoplay');
      return v !== null && v.trim().toLowerCase() !== 'false';
    }

    _dwell() {
      const s = (this._steps || [])[this._cur];
      if (s && s.dwell > 0) return s.dwell * 1000;
      const v = parseFloat(this.getAttribute('autoplay'));
      return (v > 0 ? v : AUTOPLAY_SEC) * 1000;
    }

    _loopMode() { return this._opt('autoplay-end').trim().toLowerCase() === 'loop'; }

    _setupAuto() {
      this._teardownAuto();
      if (!this._ready || !this.isConnected) return;
      if (!this._hasAutoplay()) {
        if (this._playing) this.pause('off');
        return;
      }
      const a = this._auto = {};
      const hold = (k, on) => {
        if (on) this._holds.add(k); else this._holds.delete(k);
        this._renderTimer();
      };
      a.vis = () => hold('hidden', document.hidden);
      document.addEventListener('visibilitychange', a.vis);
      a.vis();
      const start = this._opt('autoplay-start').trim().toLowerCase();
      if ('IntersectionObserver' in window) {
        hold('offscreen', true);
        a.io = new IntersectionObserver((list) => {
          const vis = list[list.length - 1].isIntersecting;
          hold('offscreen', !vis);
          if (vis && start === 'view' && !this._autoStarted) this.play();
        }, { threshold: 0.35 });
        a.io.observe(this);
      } else if (start === 'view' && !this._autoStarted) {
        this.play();
      }
      if (start === 'load' && !this._autoStarted) this.play();
      if (this._opt('pause-on-hover').trim().toLowerCase() === 'true') {
        a.en = () => hold('hover', true);
        a.lv = () => hold('hover', false);
        this.addEventListener('pointerenter', a.en);
        this.addEventListener('pointerleave', a.lv);
        hold('hover', this.matches(':hover'));
      }
      if (this._playing) this._loop();
    }

    _teardownAuto() {
      const a = this._auto;
      if (!a) return;
      document.removeEventListener('visibilitychange', a.vis);
      if (a.io) a.io.disconnect();
      if (a.en) {
        this.removeEventListener('pointerenter', a.en);
        this.removeEventListener('pointerleave', a.lv);
      }
      this._holds.clear();
      this._auto = null;
    }

    /* 播放中而且沒有任何暫時停止的原因（離開畫面、切換分頁、游標停留、收合）才計時 */
    _canRun() {
      return this._playing && this._holds.size === 0 && !(this._collapsible() && !this._open) && this.total > 1;
    }

    _loop() {
      if (this._raf) return;
      let last = null;
      const f = (t) => {
        this._raf = 0;
        if (!this._playing) return;
        if (this._canRun()) {
          if (last !== null) this._elapsed += Math.min(t - last, 100);
          last = t;
          if (this._elapsed >= this._dwell()) this._advance();
        } else {
          last = null;
        }
        this._renderTimer();
        if (this._playing) this._raf = requestAnimationFrame(f);
      };
      this._raf = requestAnimationFrame(f);
    }

    _advance() {
      const total = this.total;
      if (this._cur < total - 1) {
        this.go(this._cur + 2);
        if (this._cur === total - 1 && !this._loopMode()) {
          this.pause('end');
          this.dispatchEvent(new CustomEvent('ladder-end', { bubbles: true, detail: { total } }));
        }
      } else {
        this.go(1);
      }
    }

    _renderTimer() {
      const el = this.querySelector('.udl-timer');
      if (!el) return;
      const r = Math.min(Math.max(1 - this._elapsed / this._dwell(), 0), 1);
      el.firstElementChild.style.transform = `scaleX(${r})`;
      el.classList.toggle('is-paused', !this._canRun());
    }

    _syncPlayBtn() {
      const b = this.querySelector('.udl-play');
      if (!b) return;
      b.classList.toggle('is-playing', this._playing);
      b.querySelector('i').className = `bi ${this._playing ? 'bi-pause-fill' : 'bi-play-fill'}`;
      b.querySelector('span').textContent = this._opt(this._playing ? 'pause-text' : 'play-text');
    }

    _keyToggle() {
      if (!this._bool('keyboard') || !this._hasAutoplay()) return false;
      if (this._playing) this.pause(); else this.play();
      return true;
    }

    get isPlaying() { return this._playing; }

    play() {
      if (this._playing || !this._ready) return;
      if (this._cur >= this.total - 1 && !this._loopMode()) this.go(1);
      this._autoStarted = true;
      this._playing = true;
      this._syncPlayBtn();
      this.dispatchEvent(new CustomEvent('ladder-play', { bubbles: true, detail: { index: this._cur + 1 } }));
      this._loop();
    }

    pause(reason = 'user') {
      if (!this._playing) return;
      this._playing = false;
      if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
      this._syncPlayBtn();
      this._renderTimer();
      this.dispatchEvent(new CustomEvent('ladder-pause', { bubbles: true, detail: { index: this._cur + 1, reason } }));
    }

    get isOpen() { return this._open; }

    open() { this._setOpen(true); }
    close() { this._setOpen(false); }
    toggle() { this._setOpen(!this._open); }

    _setOpen(v) {
      if (!this._collapsible() || this._open === v) return;
      this._open = v;
      this.classList.toggle('udl-open', v);
      if (v) requestAnimationFrame(() => { this._layoutLine(); this._runMarks(true); });
      this._renderTimer();
      this.dispatchEvent(new CustomEvent('ladder-toggle', { bubbles: true, detail: { open: v } }));
    }
  }

  customElements.define('ui-detail-ladder', UiDetailLadder);
})();
/* ── 色名標籤 <c-blue>、<c-key> 等：所有元件共用同一份，頁面上只注入一次 ── */
(function () {
  'use strict';
  if (typeof document === 'undefined' || document.getElementById('ui-color-tags')) return;
  var COLORS = { shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#C394CD', salmon:'#FFC88A' };
  var css = [];
  Object.keys(COLORS).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[k] + '}'); });
  var s = document.createElement('style'); s.id = 'ui-color-tags'; s.textContent = css.join('\n');
  (document.head || document.documentElement).appendChild(s);
  if (typeof window !== 'undefined' && !window.UiColorTags) { window.UiColorTags = { colors: COLORS }; }
})();
