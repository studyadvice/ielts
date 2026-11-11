/*!
 * ui-orbit.js v2.0.0（11-11-26）
 * <ui-orbit> 軌道：題目在中心，想法繞著轉；點一個想法，它脫離軌道停進右側插槽並展開細節，再點就回去。
 *
 * v2.0.0：小圓圈只放圖示，文字改成水平標籤放在軌道外側。右半邊的標籤靠左對齊，左半邊靠右對齊，
 *         上下方置中，隨著旋轉平滑移動，不會倒立。標籤最多顯示 label-lines 行，超過以 ... 截斷。
 *
 *  <ui-orbit radius="150" item-size="56" period="40" accent="pink" label-width="170" slot-title="{label}">
 *    <orbit-core icon="chat-quote-fill" label="Describe a river"></orbit-core>
 *    <orbit-item icon="geo-alt" label="在哪裡：給一個具體地名" detail="o-where" color="key"></orbit-item>
 *  </ui-orbit>
 *
 *  ui-orbit 屬性：size（px，軌道區最小寬度）、radius（px，軌道半徑）、item-size（px）、period（秒，轉一圈）、
 *                 accent、ring-color、slot-title（可用 {label}）、placeholder、pause-on-hover、direction = cw | ccw、
 *                 label-width（px，標籤最大寬度，預設 170）、label-lines（標籤最多行數，預設 2）、
 *                 label-size（標籤字級，預設 0.95rem）、label-gap（px，圓圈與標籤的距離，預設 8）、
 *                 core-size（px，中心圓直徑，預設 item-size 的 2.3 倍）、
 *                 ring-gap（px，相鄰兩圈的距離，預設 item-size + 24 + 一個標籤高度，避免內圈標籤壓到外圈）
 *  orbit-core 屬性：icon、label、color
 *  orbit-item 屬性：icon、label、detail（內容 id）、color、ring（第幾圈，預設 1；每圈半徑加 ring-gap）
 *  事件：ui-orbit:dock { label }、ui-orbit:release { label }
 */
(() => {
  'use strict';
  if (customElements.get('ui-orbit')) return;

  const PALETTE = { base:'#0C0D0C', shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#DE8EC9', 'bg-alternative':'#3B2A20' };
  const color = v => { if (!v) return ''; const t = v.trim(); return PALETTE[t.toLowerCase()] || t; };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  const CSS = `
ui-orbit{display:grid;grid-template-columns:var(--uo-w) minmax(0,1fr);gap:24px;align-items:start;color:${PALETTE.shell};font-size:1rem;}
ui-orbit .uo-stage{position:relative;width:var(--uo-w);height:var(--uo-h);}
ui-orbit .uo-ring{position:absolute;left:50%;top:50%;border:1px dashed var(--uo-ring);border-radius:50%;transform:translate(-50%,-50%);}
ui-orbit .uo-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:var(--uo-core-size);height:var(--uo-core-size);border-radius:50%;background:var(--uo-core);color:${PALETTE.base};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:12px;box-sizing:border-box;z-index:1;}
ui-orbit .uo-core i{font-size:1.6rem;}
ui-orbit .uo-core span{font-size:0.85rem;font-weight:700;line-height:1.25;margin:4px 0 0 0;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden;word-break:break-word;}
ui-orbit .uo-item{position:absolute;left:50%;top:50%;width:var(--uo-item);height:var(--uo-item);margin:calc(var(--uo-item) / -2) 0 0 calc(var(--uo-item) / -2);z-index:2;}
ui-orbit .uo-btn{width:100%;height:100%;padding:0;border-radius:50%;border:2px solid var(--uo-c);background:${PALETTE.base};color:var(--uo-c);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s,color .2s,opacity .2s;}
ui-orbit .uo-btn i{font-size:calc(var(--uo-item) * 0.4);line-height:1;}
ui-orbit .uo-btn:hover{background:var(--uo-c);color:${PALETTE.base};}
ui-orbit .uo-lab{position:absolute;left:0;top:0;z-index:3;box-sizing:border-box;max-width:var(--uo-lw);padding:2px 6px;border-radius:4px;background:${PALETTE.base};color:var(--uo-c);font-size:var(--uo-ls);font-weight:700;line-height:1.35;cursor:pointer;white-space:normal;word-break:break-word;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--uo-ll);overflow:hidden;will-change:transform;}
ui-orbit[data-uo-one] .uo-lab{display:block;white-space:nowrap;text-overflow:ellipsis;}
ui-orbit .uo-lab:hover{text-decoration:underline;text-underline-offset:3px;}
ui-orbit .uo-item.docked .uo-btn{opacity:0.25;border-style:dashed;pointer-events:none;}
ui-orbit .uo-lab.docked{opacity:0.3;pointer-events:none;}
ui-orbit .uo-side{display:flex;flex-direction:column;gap:14px;min-width:0;}
ui-orbit .uo-slot{border:2px dashed var(--uo-accent);border-radius:12px;min-height:calc(var(--uo-item) + 32px);display:flex;align-items:center;gap:16px;padding:14px 18px;}
ui-orbit .uo-slot .uo-ph{color:${PALETTE.indigo};font-size:0.95rem;}
ui-orbit .uo-slot .uo-btn{width:var(--uo-item);height:var(--uo-item);flex:0 0 auto;cursor:pointer;}
ui-orbit .uo-slot .uo-slot-title{font-size:1.1rem;font-weight:700;color:var(--uo-accent);}
ui-orbit .uo-slot .uo-slot-hint{font-size:0.8rem;color:${PALETTE.gray};margin:2px 0 0 0;}
ui-orbit .uo-detail{line-height:1.7;color:${PALETTE.vanilla};border-left:3px solid var(--uo-accent);padding:4px 16px;}
ui-orbit .uo-detail > :last-child{margin-bottom:0;}
ui-orbit .uo-fly{position:fixed;z-index:50;pointer-events:none;transition:left .45s cubic-bezier(.4,0,.2,1),top .45s cubic-bezier(.4,0,.2,1);}
`;
  const style = document.createElement('style'); style.id = 'ui-orbit-style'; style.textContent = CSS; document.head.appendChild(style);

  class UiOrbit extends HTMLElement {
    connectedCallback() {
      if (this._init) { this._start(); return; }
      this._init = true;
      const core = this.querySelector(':scope > orbit-core');
      const items = [...this.querySelectorAll(':scope > orbit-item')].map(it => ({
        icon: it.getAttribute('icon') || 'circle', label: it.getAttribute('label') || '', detail: it.getAttribute('detail'),
        color: color(it.getAttribute('color') || 'key'), ring: num(it.getAttribute('ring'), 1)
      }));
      const coreData = { icon: core ? core.getAttribute('icon') : 'star-fill', label: core ? core.getAttribute('label') : '', color: color((core && core.getAttribute('color')) || 'yellow') };
      this.innerHTML = '';

      const R = num(this.getAttribute('radius'), 150), item = num(this.getAttribute('item-size'), 56);
      const lw = num(this.getAttribute('label-width'), 170), gap = num(this.getAttribute('label-gap'), 8);
      const lines = Math.max(1, Math.round(num(this.getAttribute('label-lines'), 2)));
      const ls = (this.getAttribute('label-size') || '0.95rem').trim();
      const coreSize = num(this.getAttribute('core-size'), Math.round(item * 2.3));
      const maxRing = Math.max(1, ...items.map(i => i.ring));
      const lsPx = ls.endsWith('rem') ? parseFloat(ls) * parseFloat(getComputedStyle(document.documentElement).fontSize) : num(ls, 15);
      const labH = Math.ceil(lsPx * 1.35 * lines + 4);
      const ringGap = num(this.getAttribute('ring-gap'), item + 24 + labH);
      const ringR = rg => R + (rg - 1) * ringGap;
      const Rmax = ringR(maxRing);
      /* 軌道區尺寸：左右要留標籤寬度，上下留標籤行高 */
      const W = Math.max(num(this.getAttribute('size'), 0), Math.ceil(2 * (Rmax + item / 2 + gap + lw) + 8));
      const H = Math.ceil(2 * (Rmax + item / 2 + gap + labH) + 8);

      this.style.setProperty('--uo-w', W + 'px'); this.style.setProperty('--uo-h', H + 'px');
      this.style.setProperty('--uo-item', item + 'px'); this.style.setProperty('--uo-core-size', coreSize + 'px');
      this.style.setProperty('--uo-lw', lw + 'px'); this.style.setProperty('--uo-ll', String(lines)); if (lines === 1) this.setAttribute('data-uo-one', ''); else this.removeAttribute('data-uo-one'); this.style.setProperty('--uo-ls', ls);
      this.style.setProperty('--uo-accent', color(this.getAttribute('accent') || 'pink'));
      this.style.setProperty('--uo-ring', color(this.getAttribute('ring-color') || 'gray'));
      this.style.setProperty('--uo-core', coreData.color);
      const stTpl = this.getAttribute('slot-title') || '{label}';

      const stage = el('div', 'uo-stage'); this.append(stage);
      this._stage = stage;
      const rings = [...new Set(items.map(i => i.ring))].sort((a, b) => a - b);
      rings.forEach(rg => { const ring = el('div', 'uo-ring'); ring.style.width = ring.style.height = ringR(rg) * 2 + 'px'; stage.append(ring); });
      const c = el('div', 'uo-core'); c.innerHTML = `<i class="bi bi-${coreData.icon}"></i>`; c.append(el('span', '', coreData.label));
      if (coreData.label) c.title = coreData.label;
      stage.append(c);

      this._paused = false; this._hover = false;
      if (this.hasAttribute('pause-on-hover')) {
        stage.addEventListener('mouseenter', () => { this._hover = true; });
        stage.addEventListener('mouseleave', () => { this._hover = false; });
      }

      const side = el('div', 'uo-side'); this.append(side);
      const slot = el('div', 'uo-slot'); slot.append(el('div', 'uo-ph', this.getAttribute('placeholder') || '點軌道上的一個想法，它會停進這裡。')); side.append(slot);
      const detail = el('div', 'uo-detail'); detail.hidden = true; side.append(detail);

      /* 每個想法：圓圈（圖示）加外側標籤，位置由 _frame 每格計算 */
      this._nodes = [];
      rings.forEach(rg => {
        const group = items.filter(i => i.ring === rg), r = ringR(rg);
        group.forEach((d, i) => {
          const w = el('div', 'uo-item'); w.style.setProperty('--uo-c', d.color);
          const b = el('button', 'uo-btn'); b.type = 'button'; b.innerHTML = `<i class="bi bi-${d.icon}"></i>`; b.title = d.label;
          w.append(b); stage.append(w);
          const lab = el('div', 'uo-lab', d.label); lab.style.setProperty('--uo-c', d.color); lab.title = d.label;
          stage.append(lab);
          const dock = () => this._dock(d, w, b, lab, slot, detail, stTpl);
          b.addEventListener('click', dock); lab.addEventListener('click', dock);
          this._nodes.push({ w, lab, r, a0: (i / group.length) * Math.PI * 2 - Math.PI / 2, lr: r + item / 2 + gap });
        });
      });

      this._period = Math.max(1, num(this.getAttribute('period'), 40)) * 1000;
      this._dir = (this.getAttribute('direction') || 'cw').trim().toLowerCase() === 'ccw' ? -1 : 1;
      this._phase = 0;
      this._frame(0);
      this._start();
    }

    disconnectedCallback() { cancelAnimationFrame(this._raf); this._raf = 0; this._last = null; }

    _start() {
      if (this._raf) return;
      this._last = null;
      const loop = now => {
        if (this._last != null && !this._paused && !this._hover) this._phase += (now - this._last) / this._period * Math.PI * 2 * this._dir;
        this._last = now;
        this._frame(this._phase);
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }

    /* 標籤錨點在圓圈外側：依角度連續調整對齊，右邊靠左、左邊靠右、上下置中 */
    _frame(phase) {
      for (const n of this._nodes) {
        const a = n.a0 + phase, cos = Math.cos(a), sin = Math.sin(a);
        n.w.style.transform = `translate(${(cos * n.r).toFixed(2)}px,${(sin * n.r).toFixed(2)}px)`;
        const cx = this._stage.clientWidth / 2 + cos * n.lr, cy = this._stage.clientHeight / 2 + sin * n.lr;
        const ax = (1 - cos) / 2 * 100, ay = (1 - sin) / 2 * 100;
        n.lab.style.transform = `translate(${cx.toFixed(2)}px,${cy.toFixed(2)}px) translate(${(-ax).toFixed(2)}%,${(-ay).toFixed(2)}%)`;
        const align = cos > 0.2 ? 'left' : cos < -0.2 ? 'right' : 'center';
        if (n.align !== align) { n.align = align; n.lab.style.textAlign = align; }
      }
    }

    _dock(d, w, b, lab, slot, detail, stTpl) {
      if (this._docked) this._release(slot, detail);
      this._docked = { d, w, lab };
      /* 飛行動畫：複製圓圈，從原位飛到插槽 */
      const from = b.getBoundingClientRect(), ghost = b.cloneNode(true); ghost.className = 'uo-btn uo-fly'; ghost.style.setProperty('--uo-c', d.color);
      ghost.style.setProperty('--uo-item', from.width + 'px');
      ghost.style.width = ghost.style.height = from.width + 'px'; ghost.style.left = from.left + 'px'; ghost.style.top = from.top + 'px';
      document.body.append(ghost);
      w.classList.add('docked'); lab.classList.add('docked'); this._paused = true;
      slot.innerHTML = '';
      const holder = el('div'); holder.style.width = holder.style.height = 'var(--uo-item)'; holder.style.flex = '0 0 auto'; slot.append(holder);
      const txt = el('div'); txt.append(el('div', 'uo-slot-title', stTpl.replace('{label}', d.label)), el('div', 'uo-slot-hint', '再點一次圖示，送回軌道。')); slot.append(txt);
      const to = holder.getBoundingClientRect();
      requestAnimationFrame(() => { ghost.style.left = to.left + 'px'; ghost.style.top = to.top + 'px'; });
      setTimeout(() => {
        ghost.remove();
        if (!holder.isConnected) return;
        const real = b.cloneNode(true); real.style.setProperty('--uo-c', d.color); holder.replaceWith(real);
        real.addEventListener('click', () => this._release(slot, detail, true));
      }, 470);
      detail.innerHTML = ''; detail.hidden = false;
      const src = d.detail && document.getElementById(d.detail);
      if (src) detail.append(src.content ? src.content.cloneNode(true) : (() => { const c = src.cloneNode(true); c.removeAttribute('id'); c.hidden = false; return c; })());
      else detail.append(el('div', 'uo-ph', d.detail ? `找不到 #${d.detail}` : '這個想法還沒有內容。'));
      this.dispatchEvent(new CustomEvent('ui-orbit:dock', { bubbles: true, detail: { label: d.label } }));
    }

    _release(slot, detail, resume) {
      if (!this._docked) return;
      const { d, w, lab } = this._docked; this._docked = null;
      w.classList.remove('docked'); lab.classList.remove('docked');
      if (resume) {
        this._paused = false;
        slot.innerHTML = ''; slot.append(el('div', 'uo-ph', this.getAttribute('placeholder') || '點軌道上的一個想法，它會停進這裡。'));
        detail.hidden = true; detail.innerHTML = '';
      }
      this.dispatchEvent(new CustomEvent('ui-orbit:release', { bubbles: true, detail: { label: d.label } }));
    }
  }
  customElements.define('orbit-core', class extends HTMLElement {});
  customElements.define('orbit-item', class extends HTMLElement {});
  customElements.define('ui-orbit', UiOrbit);
})();
