/*!
 * ui-metro.js  v0.1（粗製版）
 * <ui-metro> 捷運路線圖：幾條路線代表幾種結構，站點是段落，同一個 key 的站點是轉乘站（共用段落）。
 *
 *  <ui-metro title="Task 2 三種結構" gap-x="150" gap-y="72" stop-size="18" panel-title="{line}：{label}">
 *    <metro-line name="同意型" color="key">
 *      <metro-stop key="intro" label="開頭" detail="m-intro"></metro-stop>
 *      <metro-stop key="a1" label="論點一" detail="m-a1"></metro-stop>
 *      <metro-stop key="concl" label="結論" detail="m-concl"></metro-stop>
 *    </metro-line>
 *  </ui-metro>
 *
 *  ui-metro 屬性：title、gap-x、gap-y（px）、stop-size（px）、label-size（rem）、line-width（px）、
 *                 panel-title（可用 {line}、{label}）、placeholder、dim（未選路線的亮度 0~1，預設 0.35）
 *  metro-stop 屬性：key（同 key = 轉乘站）、label、detail（內容 id）、icon
 *  事件：ui-metro:select { line, key, label }
 */
(() => {
  'use strict';
  if (customElements.get('ui-metro')) return;

  const PALETTE = { base:'#0C0D0C', shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#DE8EC9', 'bg-alternative':'#3B2A20' };
  const color = v => { if (!v) return ''; const t = v.trim(); return PALETTE[t.toLowerCase()] || t; };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs) => { const n = document.createElementNS(NS, tag); Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v)); return n; };

  const CSS = `
ui-metro{display:block;color:${PALETTE.shell};font-size:1rem;}
ui-metro .um-title{font-size:1.2rem;font-weight:700;color:${PALETTE.violet};margin:0 0 12px 0;}
ui-metro .um-map{overflow:auto;border:1px solid #3B2A20;border-radius:10px;background:${PALETTE.base};padding:16px;}
ui-metro svg{display:block;font-family:inherit;}
ui-metro .um-line-name{font-size:0.85rem;font-weight:700;}
ui-metro .um-track{fill:none;stroke-linecap:round;stroke-linejoin:round;transition:opacity .3s;}
ui-metro .um-link{fill:none;stroke:${PALETTE.vanilla};stroke-dasharray:4 4;}
ui-metro .um-stop{cursor:pointer;transition:opacity .3s;}
ui-metro .um-stop circle{stroke-width:3;transition:r .15s;}
ui-metro .um-stop:hover circle{r:var(--um-r-hover);}
ui-metro .um-stop.on circle{fill:${PALETTE.vanilla};}
ui-metro .um-stop text{fill:${PALETTE.shell};font-size:var(--um-ls);text-anchor:middle;pointer-events:none;}
ui-metro .um-stop.on text{fill:${PALETTE.vanilla};font-weight:700;}
ui-metro .um-ring{fill:none;stroke:${PALETTE.vanilla};stroke-width:2;}
ui-metro .um-dim{opacity:var(--um-dim);}
ui-metro .um-panel{margin:16px 0 0 0;border-left:3px solid var(--um-accent,${PALETTE.violet});padding:4px 16px;line-height:1.7;color:${PALETTE.vanilla};}
ui-metro .um-panel-title{font-size:1.05rem;font-weight:700;color:var(--um-accent,${PALETTE.violet});margin:0 0 8px 0;}
ui-metro .um-ph{color:${PALETTE.indigo};font-size:0.95rem;}
ui-metro .um-panel > :last-child{margin-bottom:0;}
`;
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

  class UiMetro extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const lines = [...this.querySelectorAll(':scope > metro-line')].map(ln => ({
        name: ln.getAttribute('name') || '', color: color(ln.getAttribute('color') || 'blue'),
        stops: [...ln.querySelectorAll('metro-stop')].map(s => ({ key: s.getAttribute('key') || s.getAttribute('label'), label: s.getAttribute('label') || '', detail: s.getAttribute('detail'), icon: s.getAttribute('icon') }))
      }));
      const title = this.getAttribute('title'); this.removeAttribute('title');
      this.innerHTML = '';
      const gx = num(this.getAttribute('gap-x'), 150), gy = num(this.getAttribute('gap-y'), 72), r = num(this.getAttribute('stop-size'), 18) / 2, lw = num(this.getAttribute('line-width'), 8);
      this.style.setProperty('--um-ls', num(this.getAttribute('label-size'), 0.85) + 'rem');
      this.style.setProperty('--um-dim', num(this.getAttribute('dim'), 0.35));
      this.style.setProperty('--um-r-hover', r + 4);
      const ptpl = this.getAttribute('panel-title') || '{line}：{label}';

      /* 欄位：依 key 第一次出現的順序 */
      const count = {}, col = {};
      lines.forEach(ln => ln.stops.forEach(s => { count[s.key] = (count[s.key] || 0) + 1; }));
      /* 欄位：同一條線上後面的站一定在前一站右邊，轉乘站取各線的最大值，反覆算到穩定 */
      let changed = true, guard = 0;
      while (changed && guard++ < 50) {
        changed = false;
        lines.forEach(ln => ln.stops.forEach((s, j) => {
          const want = j ? col[ln.stops[j - 1].key] + 1 : 0;
          if ((col[s.key] ?? -1) < want) { col[s.key] = want; changed = true; }
        }));
      }
      const cols = Object.keys(col).sort((a, b) => col[a] - col[b]);
      const ncol = Math.max(...Object.values(col)) + 1;
      const padL = 120, padT = 30, padB = 40;
      const W = padL + (ncol - 1) * gx + 60, H = padT + (lines.length - 1) * gy + padB + 20;
      const X = k => padL + col[k] * gx, Y = i => padT + i * gy;

      if (title) this.append(el('div', 'um-title', title));
      const map = el('div', 'um-map'); const S = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H }); map.append(S); this.append(map);

      /* 轉乘站的直向連線 */
      cols.forEach(k => {
        if (count[k] < 2) return;
        const rows = lines.map((ln, i) => ln.stops.some(s => s.key === k) ? i : -1).filter(i => i >= 0);
        S.append(svg('line', { class: 'um-link', x1: X(k), y1: Y(rows[0]), x2: X(k), y2: Y(rows[rows.length - 1]), 'stroke-width': 2 }));
      });
      /* 路線 */
      const groups = lines.map((ln, i) => {
        const g = svg('g', { class: 'um-lg' });
        const d = ln.stops.map((s, j) => (j ? 'L' : 'M') + X(s.key) + ' ' + Y(i)).join(' ');
        g.append(svg('path', { class: 'um-track', d, stroke: ln.color, 'stroke-width': lw }));
        const nm = svg('text', { class: 'um-line-name', x: padL - 20, y: Y(i) + 5, 'text-anchor': 'end', fill: ln.color }); nm.textContent = ln.name; g.append(nm);
        ln.stops.forEach(s => {
          const st = svg('g', { class: 'um-stop' });
          st.append(svg('circle', { cx: X(s.key), cy: Y(i), r, fill: PALETTE.base, stroke: ln.color }));
          if (count[s.key] > 1) st.append(svg('circle', { class: 'um-ring', cx: X(s.key), cy: Y(i), r: r + 6 }));
          if (i === lines.length - 1 || !lines.slice(i + 1).some(o => o.stops.some(x => x.key === s.key))) {
            const t = svg('text', { x: X(s.key), y: Y(i) + r + 22 }); t.textContent = s.label; st.append(t);
          }
          st.addEventListener('click', () => this._select(i, s, ln, groups));
          g.append(st); s._el = st;
        });
        S.append(g); return g;
      });
      this._panel = el('div', 'um-panel'); this._panel.append(el('div', 'um-ph', this.getAttribute('placeholder') || '點一個站點，看這一段怎麼寫。')); this.append(this._panel);
      this._ptpl = ptpl; this._lines = lines;
    }
    _select(i, s, ln, groups) {
      groups.forEach((g, j) => g.classList.toggle('um-dim', j !== i));
      this._lines.forEach(l => l.stops.forEach(x => x._el.classList.remove('on')));
      s._el.classList.add('on');
      this.style.setProperty('--um-accent', ln.color);
      this._panel.innerHTML = '';
      this._panel.append(el('div', 'um-panel-title', this._ptpl.replace('{line}', ln.name).replace('{label}', s.label)));
      const src = s.detail && document.getElementById(s.detail);
      if (src) this._panel.append(src.content ? src.content.cloneNode(true) : (() => { const c = src.cloneNode(true); c.removeAttribute('id'); c.hidden = false; return c; })());
      else this._panel.append(el('div', 'um-ph', s.detail ? `找不到 #${s.detail}` : '這一站沒有內容。'));
      this.dispatchEvent(new CustomEvent('ui-metro:select', { bubbles: true, detail: { line: ln.name, key: s.key, label: s.label } }));
    }
  }
  customElements.define('metro-line', class extends HTMLElement {});
  customElements.define('metro-stop', class extends HTMLElement {});
  customElements.define('ui-metro', UiMetro);
})();
