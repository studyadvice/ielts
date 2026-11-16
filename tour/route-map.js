/* route-map.js v1.0：捷運路線圖。路線＝類別、車站＝項目、轉乘站＝共有項目、分區＝階段、亮暗＝進度。
   語意標籤：<route-map> <route-zone> <route-line> <route-stop> <route-transfer> <route-here>
   單一檔案，CSS 內建，不使用 Shadow DOM。 */
(() => {
  'use strict';
  if (customElements.get('route-map')) return;

  const PALETTE = { base:'#0C0D0C', shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#C394CD', salmon:'#FFC88A', 'bg-alternative':'#3B2A20' };
  const color = v => { if (!v) return ''; const t = String(v).trim(); return PALETTE[t.toLowerCase()] || t; };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const pt = v => String(v || '').split(',').map(x => num(x, 0));
  const pts = v => String(v || '').trim().split(/\s+/).filter(Boolean).map(pt);
  /* 兩個實色混成新的實色，用來畫「還沒到」的暗色路段（不用透明度） */
  const mix = (hex, bg, k) => {
    const p = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
    if (!/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex)) return hex;
    const a = p(hex), b = p(bg);
    return '#' + a.map((v, i) => Math.round(v * k + b[i] * (1 - k)).toString(16).padStart(2, '0')).join('');
  };
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };

  const STYLE = `
route-map{display:block;}
route-map > route-zone,route-map > route-line,route-map > route-transfer,route-map > route-here{display:none;}
route-map svg.rm{display:block;max-width:100%;height:auto;}
route-map .rm-name{font-size:0.82rem;font-weight:700;fill:#DBEDD8;paint-order:stroke;stroke:#0C0D0C;stroke-width:5px;stroke-linejoin:round;}
route-map .rm-name.rm-x{font-size:0.9rem;fill:#FFFFFF;}
route-map .rm-name.rm-future{fill:#86877F;}
route-map .rm-subl{font-size:0.7rem;fill:#86877F;paint-order:stroke;stroke:#0C0D0C;stroke-width:4px;stroke-linejoin:round;}
route-map .rm-zone{font-size:0.78rem;font-weight:700;fill:#86877F;letter-spacing:1px;}
route-map .rm-badge,route-map .rm-here{font-size:0.78rem;font-weight:800;fill:#0C0D0C;}
route-map .rm-leg{font-size:0.75rem;fill:#C6C7BD;}
route-map .rm-legh{font-size:0.8rem;font-weight:800;fill:#DBEDD8;}
route-map .rm-st.rm-zoomable{cursor:default;}
route-map .rm-pulse{animation:rmPulse 2.2s ease-out infinite;transform-box:fill-box;transform-origin:center;}
@keyframes rmPulse{0%{transform:scale(0.6);opacity:1;}100%{transform:scale(1.8);opacity:0;}}
route-map .rm-err{color:${PALETTE.red};border:1px solid ${PALETTE.red};border-radius:8px;padding:8px 12px;font-size:0.9rem;}
`;
  const style = document.createElement('style'); style.textContent = STYLE; document.head.appendChild(style);

  /* 折線轉角改成圓角 */
  function roundPath(P, r) {
    let d = `M${P[0][0]},${P[0][1]}`;
    for (let i = 1; i < P.length - 1; i++) {
      const [ax, ay] = P[i - 1], [bx, by] = P[i], [cx, cy] = P[i + 1];
      const l1 = Math.hypot(bx - ax, by - ay), l2 = Math.hypot(cx - bx, cy - by), rr = Math.min(r, l1 / 2, l2 / 2);
      d += ` L${bx - (bx - ax) / l1 * rr},${by - (by - ay) / l1 * rr} Q${bx},${by} ${bx + (cx - bx) / l2 * rr},${by + (cy - by) / l2 * rr}`;
    }
    const e = P[P.length - 1]; return d + ` L${e[0]},${e[1]}`;
  }
  const DIRS = { n:[0,-1,'middle'], s:[0,1,'middle'], e:[1,0,'start'], w:[-1,0,'end'], ne:[.75,-.75,'start'], nw:[-.75,-.75,'end'], se:[.75,.75,'start'], sw:[-.75,.75,'end'] };

  class RouteMap extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      /* 等子標籤都解析完再畫 */
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => this.render(), { once: true });
      else requestAnimationFrame(() => this.render());
    }

    /* 讀取子標籤：route-stop、route-transfer 的 id 會移到畫出來的車站上，讓 page-tour 可以直接指定 */
    _read() {
      const takeId = n => { if (n.id) { n.dataset.rmId = n.id; n.removeAttribute('id'); } return n.dataset.rmId || ''; };
      const stopOf = n => ({ at: pt(n.getAttribute('at')), label: (n.getAttribute('label') || 's').toLowerCase(), sub: n.getAttribute('sub') || '', name: n.textContent.trim(), zoom: n.hasAttribute('zoom') ? num(n.getAttribute('zoom'), 1) : null, id: takeId(n) });
      const q = s => [...this.querySelectorAll(':scope > ' + s)];
      return {
        zones: q('route-zone').map(n => ({ from: num(n.getAttribute('from'), 0), to: num(n.getAttribute('to'), 0), label: n.textContent.trim() })),
        lines: q('route-line').map(n => ({ name: n.getAttribute('name') || '', color: color(n.getAttribute('color') || 'key'), path: pts(n.getAttribute('path')), badge: n.getAttribute('badge') !== 'false', stops: [...n.querySelectorAll(':scope > route-stop')].map(stopOf) })),
        transfers: q('route-transfer').map(stopOf),
        here: q('route-here').map(n => ({ at: pt(n.getAttribute('at')), text: n.textContent.trim() || '你在這裡' }))[0] || null
      };
    }

    render() {
      if (this._svg) this._svg.remove();
      if (this._err) this._err.remove();
      const M = this._read();
      if (!M.lines.length || M.lines.some(L => L.path.length < 2)) {
        this._err = document.createElement('div'); this._err.className = 'rm-err';
        this._err.textContent = '[route-map] 每條 route-line 都要有 path，至少兩個座標，例如 path="1,9 31,9"';
        this.append(this._err); return;
      }
      const a = (n, d) => this.hasAttribute(n) ? this.getAttribute(n) : d;
      const g = num(a('grid'), 36), P = num(a('pad'), 1.7);
      const cols = num(a('cols'), Math.max(...M.lines.flatMap(L => L.path.map(p => p[0]))) + 1);
      const rows = num(a('rows'), Math.max(...M.lines.flatMap(L => L.path.map(p => p[1]))) + 1);
      const done = this.hasAttribute('done') ? num(a('done'), null) : null;
      const X = v => (v + P) * g, W = (cols + P * 2) * g, H = (rows + P * 2) * g;
      const lw = num(a('line-width'), Math.max(7, g * 0.26));
      const isDone = x => done == null || x <= done + 0.01;
      this._zoom = num(a('label-zoom'), 1); this._speed = num(a('label-zoom-speed'), 180);

      const root = mk('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'rm' });
      this.append(root); this._svg = root;
      const defs = mk('defs', {}, root), gz = mk('g', {}, root), svg = mk('g', {}, root);

      /* 路線（黑邊＋顏色；有 done 時先畫暗色，再用裁切畫出亮色部分） */
      let clip = null;
      if (done != null) { clip = 'rmc' + Math.random().toString(36).slice(2, 8); mk('rect', { x: -9999, y: -9999, width: X(done) + 9999, height: 99999 }, mk('clipPath', { id: clip }, defs)); }
      const gl = mk('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
      M.lines.forEach(L => {
        const d = roundPath(L.path.map(p => [X(p[0]), X(p[1])]), g * 0.9);
        mk('path', { d, stroke: '#0C0D0C', 'stroke-width': lw + 6 }, gl);
        if (clip) { mk('path', { d, stroke: mix(L.color, '#0C0D0C', 0.32), 'stroke-width': lw }, gl); mk('path', { d, stroke: L.color, 'stroke-width': lw, 'clip-path': `url(#${clip})` }, gl); }
        else mk('path', { d, stroke: L.color, 'stroke-width': lw }, gl);
      });

      /* 端點路線牌 */
      M.lines.forEach(L => {
        if (!L.badge) return;
        [[L.path[0], L.path[1]], [L.path[L.path.length - 1], L.path[L.path.length - 2]]].forEach(([e, n]) => {
          const vx = Math.sign(e[0] - n[0]), vy = Math.sign(e[1] - n[1]), bw = L.name.length * 14 + 22, bh = 26;
          let bx, by;
          if (vx > 0) { bx = X(e[0]) + g * 0.55; by = X(e[1]) - bh / 2 + (vy ? vy * g * 0.4 : 0); }
          else if (vx < 0) { bx = X(e[0]) - g * 0.55 - bw; by = X(e[1]) - bh / 2 + (vy ? vy * g * 0.4 : 0); }
          else { bx = X(e[0]) - bw / 2; by = vy > 0 ? X(e[1]) + g * 0.55 : X(e[1]) - g * 0.55 - bh; }
          mk('rect', { x: bx, y: by, width: bw, height: bh, rx: 6, fill: isDone(e[0]) ? L.color : mix(L.color, '#0C0D0C', 0.45) }, svg);
          mk('text', { x: bx + bw / 2, y: by + 18, 'text-anchor': 'middle', class: 'rm-badge' }, svg).textContent = L.name;
        });
      });

      /* 車站：圓點與站名放在同一個群組，hover 時只放大站名 */
      const station = (s, isX, col) => {
        const cx = X(s.at[0]), cy = X(s.at[1]), d = isDone(s.at[0]);
        const gs = mk('g', Object.assign({ class: 'rm-st' }, s.id ? { id: s.id } : {}), svg);
        gs._rm = { cx, cy, zoom: s.zoom != null ? s.zoom : this._zoom, k: 1 };
        if (isX) {
          const r = lw * 1.05;
          mk('circle', { cx, cy, r: r + 3, fill: '#0C0D0C' }, gs);
          mk('circle', { cx, cy, r, fill: d ? '#FFFFFF' : '#86877F', stroke: '#0C0D0C', 'stroke-width': 3 }, gs);
          mk('circle', { cx, cy, r: r * 0.36, fill: '#0C0D0C' }, gs);
        } else mk('circle', { cx, cy, r: lw * 0.62, fill: '#0C0D0C', stroke: d ? col : mix(col, '#0C0D0C', 0.45), 'stroke-width': lw * 0.42 }, gs);
        mk('circle', { cx, cy, r: lw * 1.8, fill: 'none', 'pointer-events': 'all' }, gs);
        const lab = mk('g', { class: 'rm-lab' }, gs);
        const [dx, dy, anchor] = DIRS[s.label] || DIRS.s, gap = isX ? g * 0.62 : g * 0.5;
        const x = cx + dx * gap, y = cy + dy * gap + (dy > 0 ? 8 : dy < 0 ? -2 : 5) + (dy < 0 && s.sub ? -14 : 0);
        mk('text', { x, y, 'text-anchor': anchor, class: 'rm-name' + (isX ? ' rm-x' : '') + (d ? '' : ' rm-future') }, lab).textContent = s.name;
        if (s.sub) mk('text', { x, y: y + 16, 'text-anchor': anchor, class: 'rm-subl' }, lab).textContent = s.sub;
        gs._rm.lab = lab;
        if (gs._rm.zoom > 1) {
          gs.classList.add('rm-zoomable');
          gs.addEventListener('mouseenter', () => this.hover(gs, true));
          gs.addEventListener('mouseleave', () => this.hover(gs, false));
        }
      };
      M.lines.forEach(L => L.stops.forEach(s => station(s, false, L.color)));
      M.transfers.forEach(t => station(t, true));

      /* 目前位置 */
      if (M.here) {
        const hx = X(M.here.at[0]), hy = X(M.here.at[1]), bw = M.here.text.length * 14 + 24, py = hy - g * 1.15;
        mk('circle', { cx: hx, cy: hy, r: lw * 1.5, fill: 'none', stroke: '#E3D322', 'stroke-width': 3, class: 'rm-pulse', 'pointer-events': 'none' }, svg);
        mk('circle', { cx: hx, cy: hy, r: lw * 1.15, fill: 'none', stroke: '#E3D322', 'stroke-width': 3, 'pointer-events': 'none' }, svg);
        mk('rect', { x: hx - bw / 2, y: py - 15, width: bw, height: 28, rx: 14, fill: '#E3D322' }, svg);
        mk('path', { d: `M${hx - 7},${py + 12} L${hx + 7},${py + 12} L${hx},${py + 21} Z`, fill: '#E3D322' }, svg);
        mk('text', { x: hx, y: py + 5, 'text-anchor': 'middle', class: 'rm-here' }, svg).textContent = M.here.text;
      }

      /* 圖例 */
      if (this.hasAttribute('legend')) {
        const [ax, ay] = pt(a('legend', '0,0')), lx = X(ax), ly = X(ay), rowH = 22, extra = (M.transfers.length ? 1 : 0) + (done != null ? 1 : 0) + (M.here ? 1 : 0);
        mk('rect', { x: lx, y: ly, width: 214, height: 40 + (M.lines.length + extra) * rowH, rx: 10, fill: '#0C0D0C', stroke: '#3B2A20', 'stroke-width': 1.5 }, svg);
        mk('text', { x: lx + 16, y: ly + 26, class: 'rm-legh' }, svg).textContent = a('legend-title', '圖例');
        let y = ly + 50;
        const row = t => { mk('text', { x: lx + 64, y, class: 'rm-leg' }, svg).textContent = t; y += rowH; };
        M.lines.forEach(L => { mk('line', { x1: lx + 16, y1: y - 4, x2: lx + 52, y2: y - 4, stroke: L.color, 'stroke-width': 7, 'stroke-linecap': 'round' }, svg); row(L.name); });
        if (M.transfers.length) { mk('circle', { cx: lx + 34, cy: y - 4, r: 9, fill: '#FFFFFF', stroke: '#0C0D0C', 'stroke-width': 3 }, svg); mk('circle', { cx: lx + 34, cy: y - 4, r: 3, fill: '#0C0D0C' }, svg); row(a('legend-transfer', '轉乘站：兩條路線共用')); }
        if (done != null) { mk('line', { x1: lx + 16, y1: y - 4, x2: lx + 52, y2: y - 4, stroke: mix(M.lines[0].color, '#0C0D0C', 0.32), 'stroke-width': 7, 'stroke-linecap': 'round' }, svg); row(a('legend-future', '暗色：還沒到')); }
        if (M.here) { mk('circle', { cx: lx + 34, cy: y - 4, r: 9, fill: 'none', stroke: '#E3D322', 'stroke-width': 3 }, svg); row(a('legend-here', '目前位置')); }
      }

      /* 依內容範圍裁切整張圖；分區背景延伸到邊緣 */
      const bb = svg.getBBox(), m = 18, zl = M.zones.length ? 30 : 0;
      const vx = bb.x - m, vy = bb.y - m - zl, vw = bb.width + m * 2, vh = bb.height + m * 2 + zl;
      M.zones.forEach((z, i, zs) => {
        const x0 = i === 0 ? vx : X(z.from), x1 = i === zs.length - 1 ? vx + vw : X(z.to);
        mk('rect', { x: x0, y: vy, width: x1 - x0, height: vh, fill: i % 2 ? '#131413' : '#0F100F' }, gz);
        mk('text', { x: x0 + 16, y: vy + 24, class: 'rm-zone' }, gz).textContent = z.label;
      });
      root.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`); root.setAttribute('width', vw); root.setAttribute('height', vh);
      this.dispatchEvent(new CustomEvent('route-map:render', { bubbles: true }));
    }

    /* 放大或還原站名。target：車站 id、車站元素，或 route-stop 原本的 id */
    hover(target, on = true) {
      const gs = typeof target === 'string' ? this.querySelector('#' + CSS.escape(target.replace(/^#/, ''))) : target;
      if (!gs || !gs._rm) return false;
      const r = gs._rm, to = on ? Math.max(1, r.zoom) : 1;
      if (on && gs.parentNode.lastChild !== gs) gs.parentNode.appendChild(gs);   /* 放大的那一個疊到最上層 */
      cancelAnimationFrame(r.raf);
      const from = r.k, t0 = performance.now(), dur = Math.max(1, this._speed);
      const step = now => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        r.k = from + (to - from) * e;
        r.lab.setAttribute('transform', `translate(${r.cx} ${r.cy}) scale(${r.k}) translate(${-r.cx} ${-r.cy})`);
        if (p < 1) r.raf = requestAnimationFrame(step);
      };
      r.raf = requestAnimationFrame(step);
      this.dispatchEvent(new CustomEvent('route-map:hover', { bubbles: true, detail: { id: gs.id, on } }));
      return true;
    }
    get stations() { return this._svg ? [...this._svg.querySelectorAll('.rm-st')].map(n => n.id).filter(Boolean) : []; }
  }

  ['route-zone', 'route-line', 'route-stop', 'route-transfer', 'route-here'].forEach(t => customElements.define(t, class extends HTMLElement {}));
  customElements.define('route-map', RouteMap);
  window.RouteMap = { colors: PALETTE };
})();
