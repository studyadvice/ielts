/*!
 * ui-orbit.js
 * <ui-orbit> 軌道：題目在中心，想法繞著轉；點一個想法，它脫離軌道停進下方插槽並展開細節，再點就回去。
 *
 *  <ui-orbit size="420" radius="160" item-size="64" period="40" accent="pink" slot-title="{label}">
 *    <orbit-core icon="chat-quote-fill" label="Describe a river"></orbit-core>
 *    <orbit-item icon="geo-alt" label="在哪裡" detail="o-where" color="key"></orbit-item>
 *    <orbit-item icon="eye" label="看到什麼" detail="o-see" color="green"></orbit-item>
 *  </ui-orbit>
 *
 *  ui-orbit 屬性：size（px，整體寬高）、radius（px，軌道半徑）、item-size（px）、period（秒，轉一圈）、
 *                 accent、ring-color、slot-title（可用 {label}）、placeholder、pause-on-hover、direction = cw | ccw
 *  orbit-core 屬性：icon、label、color
 *  orbit-item 屬性：icon、label、detail（內容 id）、color、ring（第幾圈，預設 1；每圈半徑加 item-size + 20px）
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
ui-orbit{display:grid;grid-template-columns:var(--uo-size) 1fr;gap:24px;align-items:start;color:${PALETTE.shell};font-size:1rem;}
ui-orbit .uo-stage{position:relative;width:var(--uo-size);height:var(--uo-size);}
ui-orbit .uo-ring{position:absolute;left:50%;top:50%;border:1px dashed var(--uo-ring);border-radius:50%;transform:translate(-50%,-50%);}
ui-orbit .uo-spin{position:absolute;inset:0;animation:uo-spin var(--uo-period) linear infinite;}
ui-orbit[direction="ccw"] .uo-spin{animation-direction:reverse;}
ui-orbit .uo-stage.paused .uo-spin{animation-play-state:paused;}
@keyframes uo-spin{to{transform:rotate(360deg);}}
ui-orbit .uo-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:calc(var(--uo-item) * 1.9);height:calc(var(--uo-item) * 1.9);border-radius:50%;background:var(--uo-core);color:${PALETTE.base};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8px;box-sizing:border-box;}
ui-orbit .uo-core i{font-size:1.8rem;}
ui-orbit .uo-core span{font-size:0.8rem;font-weight:700;line-height:1.2;margin:4px 0 0 0;}
ui-orbit .uo-item{position:absolute;left:50%;top:50%;width:var(--uo-item);height:var(--uo-item);margin:calc(var(--uo-item) / -2) 0 0 calc(var(--uo-item) / -2);}
ui-orbit .uo-btn{width:100%;height:100%;border-radius:50%;border:2px solid var(--uo-c);background:${PALETTE.base};color:var(--uo-c);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;animation:uo-spin var(--uo-period) linear infinite reverse;transition:transform .2s,background .2s;}
ui-orbit[direction="ccw"] .uo-btn{animation-direction:normal;}
ui-orbit .uo-stage.paused .uo-btn{animation-play-state:paused;}
ui-orbit .uo-btn i{font-size:1.3rem;}
ui-orbit .uo-btn span{font-size:0.7rem;font-weight:700;line-height:1.1;margin:2px 0 0 0;}
ui-orbit .uo-btn:hover{background:var(--uo-c);color:${PALETTE.base};}
ui-orbit .uo-item.docked .uo-btn{opacity:0.25;border-style:dashed;pointer-events:none;}
ui-orbit .uo-side{display:flex;flex-direction:column;gap:14px;min-width:0;}
ui-orbit .uo-slot{border:2px dashed var(--uo-accent);border-radius:12px;min-height:calc(var(--uo-item) + 32px);display:flex;align-items:center;gap:16px;padding:14px 18px;}
ui-orbit .uo-slot .uo-ph{color:${PALETTE.indigo};font-size:0.95rem;}
ui-orbit .uo-slot .uo-btn{width:var(--uo-item);height:var(--uo-item);animation:none;flex:0 0 auto;cursor:pointer;}
ui-orbit .uo-slot .uo-slot-title{font-size:1.1rem;font-weight:700;color:var(--uo-accent);}
ui-orbit .uo-slot .uo-slot-hint{font-size:0.8rem;color:${PALETTE.gray};margin:2px 0 0 0;}
ui-orbit .uo-detail{line-height:1.7;color:${PALETTE.vanilla};border-left:3px solid var(--uo-accent);padding:4px 16px;}
ui-orbit .uo-detail > :last-child{margin-bottom:0;}
ui-orbit .uo-fly{position:fixed;z-index:50;pointer-events:none;transition:left .45s cubic-bezier(.4,0,.2,1),top .45s cubic-bezier(.4,0,.2,1);}
`;
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

  class UiOrbit extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const core = this.querySelector(':scope > orbit-core');
      const items = [...this.querySelectorAll(':scope > orbit-item')].map(it => ({
        icon: it.getAttribute('icon') || 'circle', label: it.getAttribute('label') || '', detail: it.getAttribute('detail'),
        color: color(it.getAttribute('color') || 'key'), ring: num(it.getAttribute('ring'), 1)
      }));
      const coreData = { icon: core ? core.getAttribute('icon') : 'star-fill', label: core ? core.getAttribute('label') : '', color: color((core && core.getAttribute('color')) || 'yellow') };
      this.innerHTML = '';
      const R = num(this.getAttribute('radius'), 150), item = num(this.getAttribute('item-size'), 64);
      const maxRing = Math.max(1, ...items.map(i => i.ring));
      const size = Math.max(num(this.getAttribute('size'), 420), 2 * (R + (maxRing - 1) * (item + 20) + item / 2 + 8));
      this.style.setProperty('--uo-size', size + 'px'); this.style.setProperty('--uo-item', item + 'px');
      this.style.setProperty('--uo-period', num(this.getAttribute('period'), 40) + 's');
      this.style.setProperty('--uo-accent', color(this.getAttribute('accent') || 'pink'));
      this.style.setProperty('--uo-ring', color(this.getAttribute('ring-color') || 'gray'));
      this.style.setProperty('--uo-core', coreData.color);
      const stTpl = this.getAttribute('slot-title') || '{label}';

      const stage = el('div', 'uo-stage'); this.append(stage);
      const rings = [...new Set(items.map(i => i.ring))];
      rings.forEach(rg => { const r = R + (rg - 1) * (item + 20); const ring = el('div', 'uo-ring'); ring.style.width = ring.style.height = r * 2 + 'px'; stage.append(ring); });
      const c = el('div', 'uo-core'); c.innerHTML = `<i class="bi bi-${coreData.icon}"></i><span>${coreData.label}</span>`; stage.append(c);
      const spin = el('div', 'uo-spin'); stage.append(spin);
      if (this.hasAttribute('pause-on-hover')) { stage.addEventListener('mouseenter', () => stage.classList.add('paused')); stage.addEventListener('mouseleave', () => { if (!this._docked) stage.classList.remove('paused'); }); }

      const side = el('div', 'uo-side'); this.append(side);
      const slot = el('div', 'uo-slot'); slot.append(el('div', 'uo-ph', this.getAttribute('placeholder') || '點軌道上的一個想法，它會停進這裡。')); side.append(slot);
      const detail = el('div', 'uo-detail'); detail.hidden = true; side.append(detail);

      rings.forEach(rg => {
        const group = items.filter(i => i.ring === rg), r = R + (rg - 1) * (item + 20);
        group.forEach((d, i) => {
          const ang = (i / group.length) * Math.PI * 2 - Math.PI / 2;
          const w = el('div', 'uo-item'); w.style.setProperty('--uo-c', d.color);
          w.style.transform = `translate(${Math.cos(ang) * r}px, ${Math.sin(ang) * r}px)`;
          const b = el('button', 'uo-btn'); b.innerHTML = `<i class="bi bi-${d.icon}"></i><span>${d.label}</span>`; w.append(b); spin.append(w);
          b.addEventListener('click', () => this._dock(d, w, b, stage, slot, detail, stTpl));
        });
      });
    }
    _dock(d, w, b, stage, slot, detail, stTpl) {
      if (this._docked) this._release(stage, slot, detail);
      this._docked = { d, w };
      /* 飛行動畫：複製按鈕，從原位飛到插槽 */
      const from = b.getBoundingClientRect(), ghost = b.cloneNode(true); ghost.className = 'uo-btn uo-fly'; ghost.style.setProperty('--uo-c', d.color);
      ghost.style.width = ghost.style.height = from.width + 'px'; ghost.style.left = from.left + 'px'; ghost.style.top = from.top + 'px'; ghost.style.animation = 'none';
      document.body.append(ghost);
      w.classList.add('docked'); stage.classList.add('paused');
      slot.innerHTML = '';
      const holder = el('div'); holder.style.width = holder.style.height = 'var(--uo-item)'; holder.style.flex = '0 0 auto'; slot.append(holder);
      const txt = el('div'); txt.append(el('div', 'uo-slot-title', stTpl.replace('{label}', d.label)), el('div', 'uo-slot-hint', '再點一次圖示，送回軌道。')); slot.append(txt);
      const to = holder.getBoundingClientRect();
      requestAnimationFrame(() => { ghost.style.left = to.left + 'px'; ghost.style.top = to.top + 'px'; });
      setTimeout(() => {
        ghost.remove();
        const real = b.cloneNode(true); real.style.setProperty('--uo-c', d.color); real.style.animation = 'none'; holder.replaceWith(real);
        real.addEventListener('click', () => this._release(stage, slot, detail, true));
      }, 470);
      detail.innerHTML = ''; detail.hidden = false;
      const src = d.detail && document.getElementById(d.detail);
      if (src) detail.append(src.content ? src.content.cloneNode(true) : (() => { const c = src.cloneNode(true); c.removeAttribute('id'); c.hidden = false; return c; })());
      else detail.append(el('div', 'uo-ph', d.detail ? `找不到 #${d.detail}` : '這個想法還沒有內容。'));
      this.dispatchEvent(new CustomEvent('ui-orbit:dock', { bubbles: true, detail: { label: d.label } }));
    }
    _release(stage, slot, detail, resume) {
      if (!this._docked) return;
      const { d, w } = this._docked; this._docked = null;
      w.classList.remove('docked');
      if (resume) {
        stage.classList.remove('paused');
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
