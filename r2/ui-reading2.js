(() => {
  'use strict';
  if (customElements.get('layer-switch')) return;

  const PALETTE = {
    base: '#0C0D0C', shell: '#C6C7BD',
    vanilla: '#DBEDD8', yellow: '#E3D322',
    indigo: '#778CE1', pink: '#FF91D7',
    orange: '#FF5530',
    /* 新色票 */
    red: '#EF6661',
    green: '#71CD76',
    blue: '#5DBAE8',
    violet: '#B484E8',
    gray: '#86877F',
    /* 新增色 */
    key: '#51DBCF',
    'key-deep': '#176878',
    calm: '#A3C4BC',
    quiet: '#A9B8E0',
    playful: '#FFA987',
    urgent: '#FF2E63'
  };
  const BG = PALETTE.base;
  const LS_PALETTE = ['blue', 'yellow', 'violet', 'orange', 'green', 'pink', 'indigo', 'red', 'vanilla', 'gray'];
  const CM_PALETTE = ['blue', 'yellow', 'violet', 'orange', 'green', 'red', 'indigo', 'pink', 'vanilla', 'gray'];

  const color = (v, d = '') => {
    if (!v) return d;
    v = String(v).trim();
    return PALETTE[v] || v;
  };
  const mix = (c, t) => {
    const h = color(c, PALETTE.shell);
    const m = /^#([0-9a-f]{6})$/i.exec(h);
    if (!m) return h;
    const n = parseInt(m[1], 16);
    const b = parseInt(BG.slice(1), 16);
    return '#' + [16, 8, 0].map(sh => {
      const x = (n >> sh) & 255;
      const y = (b >> sh) & 255;
      return Math.round(y + (x - y) * t).toString(16).padStart(2, '0');
    }).join('');
  };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  // 純數字補單位，其他 CSS 值照用
  const unit = u => (v, d) => {
    if (v == null || String(v).trim() === '') return d;
    v = String(v).trim();
    return /^-?\d*\.?\d+$/.test(v) ? v + u : v;
  };
  const px = unit('px');
  const rem = unit('rem');
  // 布林屬性：存在即為真，寫 false 視為假
  const flag = (host, name, def) => {
    if (!host.hasAttribute(name)) return def;
    const v = host.getAttribute(name).trim().toLowerCase();
    return v !== 'false' && v !== '0' && v !== 'no';
  };
  // 依序取第一個存在的屬性（新名稱在前，舊名稱在後）
  const attr = (host, ...names) => {
    for (const n of names) if (host.hasAttribute(n)) return host.getAttribute(n);
    return null;
  };
  const idOf = v => (v || '').trim().replace(/^#/, '');
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const iconEl = name => {
    name = name.trim();
    const cls = /(^|\s)bi(\s|$)/.test(name) ? name : 'bi ' + (name.startsWith('bi-') ? name : 'bi-' + name);
    const i = el('i', cls);
    i.setAttribute('aria-hidden', 'true');
    return i;
  };
  const takeTitle = host => {
    const t = host.getAttribute('title');
    if (t == null) return null;
    host.removeAttribute('title');
    return t ? el('div', 'urm-title', t) : null;
  };

  /* ---------- 內容來源：一律複製 ---------- */
  const cloneOf = id => {
    const src = id ? document.getElementById(id) : null;
    if (!src) return null;
    if (src.localName === 'template') return src.content.cloneNode(true);
    const frag = document.createDocumentFragment();
    src.childNodes.forEach(n => frag.append(n.cloneNode(true)));
    return frag;
  };
  const alertEl = id => el('div', 'alert alert-danger urm-alert', `找不到 id 為「${id}」的內容。`);
  const fillInto = (target, id) => target.replaceChildren(cloneOf(id) || alertEl(id));
  // 被引用的來源 div 自動隱藏（template 本來就不顯示）
  const hideSource = id => {
    const s = id && document.getElementById(id);
    if (s && s.localName !== 'template') s.setAttribute('data-urm-src', '');
  };

  /* 內建內容區 */
  class Panel {
    constructor(title, ph) {
      this.el = el('div', 'urm-panel');
      this.head = el('div', 'urm-head');
      this.body = el('div', 'urm-body');
      this.el.append(this.head, this.body);
      this.title = title || '';
      this.ph = ph;
      this.clear();
    }
    show(id, label) {
      this.head.textContent = this.title.replace('{label}', label || '').trim();
      fillInto(this.body, id);
    }
    clear() {
      this.head.textContent = this.title.replace('{label}', '').trim();
      this.body.replaceChildren(...(this.ph ? [el('div', 'urm-ph', this.ph)] : []));
    }
  }
  // 外部目標：使用者自訂樣式的 div
  const extSink = tid => ({
    show: id => { const t = document.getElementById(tid); if (t) fillInto(t, id); },
    clear: () => { const t = document.getElementById(tid); if (t) t.replaceChildren(); }
  });

  /* ---------- 樣式 ---------- */
  const CSS = `
layer-switch:not([data-ready]),collocation-map:not([data-ready]),cm-group:not([data-ready]),ui-spotlight:not([data-ready]){visibility:hidden;}
spotlight{display:none;}
[data-urm-src]{display:none!important;}
.urm-title{font-size:1.2rem;font-weight:700;color:${PALETTE.violet};margin:0 0 12px 0;}
.urm-panel{margin:16px 0 0 0;border:1px solid ${PALETTE.shell};border-radius:8px;padding:16px;color:${PALETTE.shell};}
.urm-head{font-size:1.05rem;font-weight:700;color:${PALETTE.violet};margin:0 0 12px 0;padding:0 0 8px 0;border-bottom:1px solid ${PALETTE.violet};}
.urm-head:empty{display:none;}
.urm-body{line-height:1.7;}
.urm-body > :first-child{margin-top:0;}
.urm-body > :last-child{margin-bottom:0;}
.urm-ph{color:${PALETTE.indigo};font-size:0.95rem;text-align:center;border:1px dashed ${PALETTE.indigo};border-radius:8px;padding:20px 16px;}
.urm-alert{background:${BG};border:1px solid ${PALETTE.red};color:${PALETTE.red};border-radius:6px;padding:12px 16px;margin:0;font-size:0.95rem;}

layer-switch{display:block;color:${PALETTE.shell};}
layer-switch[bordered]{border:1px solid ${PALETTE.shell};border-radius:8px;padding:16px;}
.urm-ls-ctrl{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 14px 0;}
layer-switch[toggle-position="bottom"] .urm-ls-ctrl{margin:14px 0 0 0;}
.urm-ls-btn{display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:20px;font:inherit;font-size:0.8rem;font-weight:700;line-height:1.5;border:2px solid;cursor:pointer;user-select:none;background:transparent;}
.urm-ls-btn:hover{filter:brightness(1.15);}
.urm-ls-btn:disabled{cursor:not-allowed;filter:grayscale(1);border-style:dashed;}
.urm-ls-dot{padding:0;width:16px;height:16px;border-radius:50%;}
.urm-ls-body{display:block;line-height:1.8;}
.urm-ls-mark{display:inline;border-radius:3px;padding:1px 3px;cursor:default;}
.urm-ls-hasdetail{cursor:help;}
layer-switch[detail-trigger="click"] .urm-ls-hasdetail{cursor:pointer;}
.urm-ls-mark-ul{text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:2px;padding:0;}
.urm-ls-mark-box{outline:2px solid transparent;outline-offset:1px;}
.urm-ls-locked{box-shadow:0 0 0 2px ${PALETTE.vanilla};}

ui-spotlight{display:block;position:relative;cursor:pointer;}
.urm-sp-ring{position:absolute;pointer-events:none;display:none;}
ui-spotlight.urm-sp-active > .urm-sp-ring{display:block;}
.urm-sp-hint{position:absolute;top:6px;right:6px;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0.35;pointer-events:none;}
ui-spotlight:hover > .urm-sp-hint{opacity:0.85;}
.urm-sp-overlay{position:fixed;inset:0;z-index:8999;display:none;background:var(--urm-sp-ovbg, rgba(12,13,12,0.82));}
.urm-sp-overlay.urm-sp-ov{display:block;}
body.urm-sp-mode ui-spotlight{z-index:9000;}
body.urm-sp-mode ui-spotlight:not(.urm-sp-active){opacity:var(--urm-sp-dim, 0.15);}

cm-group{display:block;}
.urm-cm-row{display:flex;padding:20px 0;}
cm-group > .urm-panel,
collocation-map > .urm-panel{margin:20px 0 0 0;}
collocation-map > .urm-cm{padding:20px 0;}
cm-group collocation-map > .urm-cm{padding:0;}
collocation-map{display:inline-block;vertical-align:middle;color:${PALETTE.shell};}
.urm-cm{display:inline-flex;align-items:center;}
.urm-cm-pt{display:flex;align-items:center;white-space:nowrap;padding:0 4px;}
.urm-cm-div{position:relative;align-self:stretch;display:flex;align-items:center;flex-shrink:0;}
.urm-cm-div::before{content:"";position:absolute;top:calc(-1 * var(--cm-ov, 16px));bottom:calc(-1 * var(--cm-ov, 16px));left:50%;transform:translateX(-50%);border-left:var(--cm-lw, 2px) var(--cm-ls, solid) var(--cm-lc, ${PALETTE.shell});}
.urm-cm-items{display:flex;flex-direction:column;}
.urm-cm-item{display:flex;align-items:center;user-select:none;cursor:default;}
.urm-cm-item.urm-cm-click{cursor:pointer;}
.urm-cm-item[data-disabled]{cursor:not-allowed;filter:grayscale(1);}
.urm-cm-item.urm-cm-locked .urm-cm-lbl{text-decoration:underline;text-underline-offset:4px;}
.urm-cm-dot{border-radius:50%;display:inline-block;flex-shrink:0;}
.urm-cm-lbl{white-space:nowrap;}
`;
  (function injectStyle() {
    if (document.getElementById('ui-reading2-style')) return;
    const s = el('style');
    s.id = 'ui-reading2-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  })();

  /* ---------- 共用基底：等整頁解析完才建立，屬性只讀一次 ---------- */
  class Base extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      const go = () => {
        this._build();
        this.setAttribute('data-ready', '');
      };
      document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', go, { once: true })
        : go();
    }
  }

  /* ════════════════════════════════════════════════════════════════
   * <layer-switch>
   * ════════════════════════════════════════════════════════════════ */
  class LayerSwitch extends Base {
    _build() {
      const a = n => this.getAttribute(n);
      const heading = takeTitle(this);
      const textEl = this.querySelector('ls-text');
      const layerEls = [...this.querySelectorAll('ls-layer')];
      if (!textEl || !layerEls.length) {
        console.warn('[ui-reading2] <layer-switch> 缺少 <ls-text> 或 <ls-layer>，已略過。');
        return;
      }

      const multi = flag(this, 'multi', false);
      const tStyle = a('toggle-style') || 'pill';
      const tPos = a('toggle-position') || 'top';
      const markStyle = a('mark-style') || 'highlight';
      const dim = num(a('dim'), 0.3);
      const bdRaw = a('body-dim');
      const bodyDim = bdRaw != null && flag(this, 'body-dim', false) ? num(bdRaw, num(a('body-dim-val'), 0.55)) : 0;
      const globalTgt = idOf(a('target'));
      const detailClick = a('detail-trigger') === 'click';
      const pal = (a('palette') || '').split(',').map(s => s.trim()).filter(Boolean);
      const palette = pal.length ? pal : LS_PALETTE;

      /* 層定義 */
      let pi = 0;
      const layers = new Map();
      layerEls.forEach(le => {
        const name = le.getAttribute('name');
        if (!name) return;
        const own = attr(le, 'color', 'theme');
        const src = idOf(le.getAttribute('source'));
        hideSource(src);
        layers.set(name, {
          name,
          label: le.getAttribute('label') || name,
          source: src,
          target: idOf(le.getAttribute('target')) || globalTgt,
          color: own ? color(own) : color(palette[pi++ % palette.length], PALETTE.shell),
          icon: le.getAttribute('icon') || '',
          tooltip: attr(le, 'tooltip', 'info') || '',
          disabled: le.hasAttribute('disabled')
        });
      });

      /* 標記：ls-mark 換成 span */
      const body = el('div', 'urm-ls-body');
      body.append(...textEl.childNodes);
      const marks = [...body.querySelectorAll('ls-mark')].map(m => {
        const cls = ['urm-ls-mark'];
        if (markStyle === 'underline') cls.push('urm-ls-mark-ul');
        if (markStyle === 'box') cls.push('urm-ls-mark-box');
        const span = el('span', cls.join(' '));
        span.dataset.layers = (m.getAttribute('layer') || '').trim();

        // 新名稱 detail、tooltip；舊名稱 note（#id 為內容，其餘為提示）
        const note = m.getAttribute('note') || '';
        const detail = idOf(m.getAttribute('detail') || (note.startsWith('#') ? note : ''));
        const tip = m.getAttribute('tooltip') || (note && !note.startsWith('#') ? note : '');
        if (tip) span.title = tip;
        if (detail) {
          span.dataset.detail = detail;
          span.classList.add('urm-ls-hasdetail');
          hideSource(detail);
        }
        if (m.getAttribute('weight') === 'bold') span.style.fontWeight = '700';
        if (m.getAttribute('size')) span.style.fontSize = rem(m.getAttribute('size'));
        span.append(...m.childNodes);
        m.replaceWith(span);
        return span;
      });

      /* 內容區：外部 target，或沒有 target 時的內建內容區 */
      const needPanel = a('panel') !== 'none' && (
        [...layers.values()].some(l => l.source && !l.target) ||
        (!globalTgt && marks.some(s => s.dataset.detail))
      );
      const panel = needPanel
        ? new Panel(a('panel-title') || '', this.hasAttribute('placeholder') ? a('placeholder') : '請點選按鈕。')
        : null;
      const sinkOf = key => (key ? extSink(key) : panel);
      const sinkKeys = new Map();
      layers.forEach(l => {
        if (l.source && !sinkKeys.has(l.target)) sinkKeys.set(l.target, sinkOf(l.target));
      });

      const active = new Set();

      const injectAll = () => {
        const write = new Map();
        active.forEach(n => {
          const l = layers.get(n);
          if (l && l.source) write.set(l.target, l);
        });
        sinkKeys.forEach((sink, key) => {
          if (!sink) return;
          const l = write.get(key);
          l ? sink.show(l.source, l.label) : sink.clear();
        });
      };

      const apply = inject => {
        const any = active.size > 0;
        body.style.opacity = bodyDim && any ? String(bodyDim) : '';
        marks.forEach(span => {
          const hit = span.dataset.layers.split(/\s+/).find(n => active.has(n));
          span.style.opacity = '';
          span.style.background = '';
          span.style.color = '';
          span.style.outlineColor = '';
          span.style.textDecorationColor = '';
          if (!any) return;
          if (hit) {
            const c = layers.get(hit).color;
            span.style.color = c;
            if (markStyle === 'underline') span.style.textDecorationColor = c;
            else if (markStyle === 'box') span.style.outlineColor = c;
            else span.style.background = mix(c, 0.26);
          } else {
            span.style.opacity = String(dim);
            if (markStyle === 'underline') span.style.textDecorationColor = 'transparent';
          }
        });
        if (inject) injectAll();
      };

      /* 標記的 detail：滑過（預設）或點擊顯示，離開或再點一次還原 */
      const markKey = span => {
        for (const n of span.dataset.layers.split(/\s+/)) {
          const l = layers.get(n);
          if (l && l.target) return l.target;
        }
        return globalTgt;
      };
      const restore = key => {
        const sink = sinkOf(key);
        if (!sink) return;
        for (const n of active) {
          const l = layers.get(n);
          if (l && l.source && l.target === key) { sink.show(l.source, l.label); return; }
        }
        sink.clear();
      };
      let locked = null;
      marks.filter(s => s.dataset.detail).forEach(span => {
        const key = markKey(span);
        const sink = sinkOf(key);
        if (!sink) return;
        const show = () => sink.show(span.dataset.detail, span.textContent.trim());
        if (detailClick) {
          span.addEventListener('click', () => {
            if (locked) locked.classList.remove('urm-ls-locked');
            if (locked === span) { locked = null; restore(key); return; }
            locked = span;
            span.classList.add('urm-ls-locked');
            show();
          });
        } else {
          span.addEventListener('mouseenter', show);
          span.addEventListener('mouseleave', () => restore(key));
        }
      });

      /* 切換按鈕 */
      const ctrl = el('div', 'urm-ls-ctrl');
      if (a('gap')) ctrl.style.gap = px(a('gap'), '8px');
      const btns = [];
      const sync = () => btns.forEach(b => {
        const l = layers.get(b.dataset.lsn);
        const on = active.has(l.name);
        b.style.background = on ? l.color : 'transparent';
        b.style.color = on ? BG : l.color;
        b.classList.toggle('urm-on', on);
      });
      layers.forEach(l => {
        const dot = tStyle === 'dot';
        const b = el('button', 'urm-ls-btn' + (dot ? ' urm-ls-dot' : ''));
        b.type = 'button';
        b.dataset.lsn = l.name;
        b.style.borderColor = l.color;
        if (l.tooltip || dot) b.title = l.tooltip || l.label;
        if (!dot) {
          if (l.icon) b.append(iconEl(l.icon));
          b.append(l.label);
        }
        if (l.disabled) b.disabled = true;
        b.addEventListener('click', () => {
          if (multi) {
            active.has(l.name) ? active.delete(l.name) : active.add(l.name);
          } else {
            const was = active.has(l.name);
            active.clear();
            if (!was) active.add(l.name);
          }
          if (locked) { locked.classList.remove('urm-ls-locked'); locked = null; }
          sync();
          apply(true);
        });
        ctrl.append(b);
        btns.push(b);
      });

      /* 組裝 */
      const parts = heading ? [heading] : [];
      if (tPos === 'bottom') parts.push(body, ctrl);
      else parts.push(ctrl, body);
      if (panel) parts.push(panel.el);
      this.replaceChildren(...parts);

      /* 初始：active 會顯示內容；舊屬性 default 只套標記樣式 */
      const act = a('active');
      const def = a('default');
      const first = [act, def].find(n => n && layers.has(n) && !layers.get(n).disabled);
      if (first) active.add(first);
      if (!act && !def) sinkKeys.forEach(sink => sink && sink.clear());
      sync();
      apply(!!(act && first));
    }
  }

  /* ════════════════════════════════════════════════════════════════
   * <ui-spotlight>（舊標籤 <spotlight> 會自動轉換）
   * ════════════════════════════════════════════════════════════════ */
  const SP = { overlay: null, all: [], active: null, escBound: false };

  const spOverlay = () => {
    if (SP.overlay) return SP.overlay;
    SP.overlay = el('div', 'urm-sp-overlay');
    document.body.appendChild(SP.overlay);
    SP.overlay.addEventListener('click', spOff);
    return SP.overlay;
  };
  function spOn(host) {
    if (SP.active === host) { spOff(); return; }
    SP.active = host;
    SP.all = SP.all.filter(x => x.isConnected);
    document.body.style.setProperty('--urm-sp-dim', host._spDim);
    spOverlay().style.setProperty('--urm-sp-ovbg', `rgba(12,13,12,${host._spBg})`);
    document.body.classList.add('urm-sp-mode');
    SP.all.forEach(x => x.classList.toggle('urm-sp-active', x === host));
    SP.overlay.classList.add('urm-sp-ov');
  }
  function spOff() {
    if (!SP.active) return;
    SP.active = null;
    document.body.classList.remove('urm-sp-mode');
    document.body.style.removeProperty('--urm-sp-dim');
    SP.all.forEach(x => x.classList.remove('urm-sp-active'));
    if (SP.overlay) SP.overlay.classList.remove('urm-sp-ov');
  }

  class UiSpotlight extends Base {
    _build() {
      const a = n => this.getAttribute(n);
      const c = color(attr(this, 'color', 'theme'), PALETTE.vanilla);
      this.classList.add('urm-sp');
      this._spDim = String(num(a('dim'), 0.15));
      // 遮罩透明度不低於 0.78
      this._spBg = Math.max(0.78, Math.min(1, num(a('dim-bg'), 0.82)));
      if (a('padding')) this.style.padding = px(a('padding'));

      if (flag(this, 'ring', true)) {
        const ring = el('div', 'urm-sp-ring');
        const inset = px(a('ring-inset'), '6px');
        ring.style.cssText =
          `border:${px(a('ring-width'), '2px')} ${a('ring-style') || 'solid'} ${c};` +
          `border-radius:${px(a('ring-radius'), '10px')};inset:calc(-1 * ${inset});`;
        this.append(ring);
      }
      if (flag(this, 'hint', true)) {
        const size = num(a('hint-size'), 18);
        const hint = el('div', 'urm-sp-hint');
        hint.style.cssText = `background:${c};color:${BG};width:${size}px;height:${size}px;font-size:${Math.round(size * 0.65)}px;`;
        hint.append(iconEl(a('hint-icon') || 'fullscreen'));
        this.append(hint);
      }

      SP.all.push(this);
      if (flag(this, 'escape', true) && !SP.escBound) {
        SP.escBound = true;
        document.addEventListener('keydown', e => { if (e.key === 'Escape') spOff(); });
      }
      if ((a('trigger') || 'click') === 'hover') {
        this.addEventListener('mouseenter', () => spOn(this));
        this.addEventListener('mouseleave', spOff);
      } else {
        this.addEventListener('click', e => { e.stopPropagation(); spOn(this); });
      }
      if (this.hasAttribute('active')) spOn(this);
    }
    disconnectedCallback() {
      if (SP.active === this) spOff();
    }
  }

  /* ════════════════════════════════════════════════════════════════
   * <cm-group>
   * ════════════════════════════════════════════════════════════════ */
  class CmGroup extends Base {
    _build() {
      const a = n => this.getAttribute(n);
      const heading = takeTitle(this);
      const isRow = (a('layout') || 'row') !== 'column';
      const row = el('div', 'urm-cm-row');
      row.style.flexDirection = isRow ? 'row' : 'column';
      row.style.gap = px(a('gap'), isRow ? '48px' : '32px');
      row.style.alignItems = a('align') || 'center';
      row.style.flexWrap = isRow && flag(this, 'wrap', true) ? 'wrap' : 'nowrap';
      row.style.justifyContent = a('justify') || 'flex-start';
      row.append(...this.childNodes);

      // 共用內容區：群組與搭配詞圖都沒有 target，且有搭配詞帶 detail 時建立
      this._target = idOf(a('target'));
      const needPanel = !this._target && a('panel') !== 'none' &&
        [...row.querySelectorAll('collocation-map')].some(m =>
          !m.getAttribute('target') && [...m.querySelectorAll('cm-item')].some(i => attr(i, 'detail', 'note') && !i.getAttribute('target')));
      this._panel = needPanel
        ? new Panel(a('panel-title') || '', this.hasAttribute('placeholder') ? a('placeholder') : '請將滑鼠移到搭配詞上。')
        : null;

      this.replaceChildren(...(heading ? [heading] : []), row, ...(this._panel ? [this._panel.el] : []));
    }
  }

  /* ════════════════════════════════════════════════════════════════
   * <collocation-map>
   * ════════════════════════════════════════════════════════════════ */
  class CollocationMap extends Base {
    _build() {
      const a = n => this.getAttribute(n);
      const heading = takeTitle(this);
      const side = a('anchor-side') || 'left';
      const alignMap = { center: 'center', start: 'flex-start', end: 'flex-end' };
      const pal = (a('palette') || '').split(',').map(s => s.trim()).filter(Boolean);
      const palette = pal.length ? pal : CM_PALETTE;
      const dotSize = px(a('dot-size'), '12px');
      const dotGap = px(a('dot-gap'), '8px');
      const dim = num(attr(this, 'dim', 'hover-dim'), 0.35);
      const trigger = a('trigger') || 'hover';
      const doHover = trigger === 'hover' || trigger === 'both';
      const doClick = trigger === 'click' || trigger === 'both';
      const group = this.closest('cm-group');
      const mapTgt = idOf(a('target')) || (group && group._target) || '';

      /* 錨點 */
      const ptEl = this.querySelector('cm-point');
      const pt = el('div', 'urm-cm-pt');
      if (ptEl) {
        pt.append(...ptEl.childNodes);
        pt.style.fontSize = rem(ptEl.getAttribute('size'), rem(a('point-size'), '1.4rem'));
        pt.style.fontWeight = ptEl.getAttribute('weight') || 'bold';
        pt.style.color = color(attr(ptEl, 'color', 'theme'), PALETTE.shell);
      }
      pt.style.textAlign = side === 'left' ? 'right' : 'left';

      /* 分隔線 */
      const line = el('div', 'urm-cm-div');
      line.style.setProperty('--cm-ov', px(a('line-overhang'), '16px'));
      line.style.setProperty('--cm-lc', color(a('line-color'), PALETTE.shell));
      line.style.setProperty('--cm-ls', a('line-style') || 'solid');
      line.style.setProperty('--cm-lw', px(a('line-width'), '2px'));
      line.style.padding = `0 ${px(a('line-gap'), '18px')}`;

      /* 搭配詞 */
      let pi = 0;
      const items = [...this.querySelectorAll('cm-item')].map(ie => {
        const own = attr(ie, 'color', 'theme');
        const it = {
          nodes: [...ie.childNodes],
          color: own ? color(own) : color(palette[pi++ % palette.length], PALETTE.shell),
          detail: idOf(attr(ie, 'detail', 'note')),
          target: idOf(ie.getAttribute('target')) || mapTgt,
          tooltip: ie.getAttribute('tooltip') || '',
          disabled: ie.hasAttribute('disabled')
        };
        hideSource(it.detail);
        return it;
      });

      // 內容去向：項目 target → 圖 target → 群組 target → 群組內容區 → 自己的內容區
      const needOwn = a('panel') !== 'none' && items.some(it => it.detail && !it.target) && !(group && group._panel);
      this._panel = needOwn
        ? new Panel(a('panel-title') || '', this.hasAttribute('placeholder') ? a('placeholder') : '')
        : null;
      const sinkOf = it => (it.target ? extSink(it.target) : (group && group._panel) || this._panel);

      const list = el('div', 'urm-cm-items');
      list.style.gap = px(a('gap'), '16px');
      const rows = items.map(it => {
        const row = el('div', 'urm-cm-item');
        row.style.gap = dotGap;
        const dot = el('span', 'urm-cm-dot');
        dot.style.width = dotSize;
        dot.style.height = dotSize;
        dot.style.background = it.color;
        const lbl = el('span', 'urm-cm-lbl');
        lbl.append(...it.nodes);
        lbl.style.fontSize = rem(a('item-size'), '1rem');
        lbl.style.color = it.color;
        if (side === 'left') row.append(lbl, dot);
        else row.append(dot, lbl);
        if (it.tooltip) row.title = it.tooltip;
        if (it.disabled) row.setAttribute('data-disabled', '');
        if (doClick && !it.disabled) row.classList.add('urm-cm-click');
        list.append(row);
        return row;
      });

      const wrap = el('div', 'urm-cm');
      wrap.style.alignItems = alignMap[a('anchor-align')] || 'center';
      if (side === 'left') wrap.append(pt, line, list);
      else wrap.append(list, line, pt);
      this.replaceChildren(...(heading ? [heading] : []), wrap, ...(this._panel ? [this._panel.el] : []));

      /* 互動 */
      let locked = -1;
      const dimOthers = idx => rows.forEach((r, i) => { r.style.opacity = i === idx ? '1' : String(dim); });
      const resetAll = () => rows.forEach(r => { r.style.opacity = '1'; r.classList.remove('urm-cm-locked'); });
      const show = idx => {
        const it = items[idx];
        const sink = it.detail && sinkOf(it);
        if (sink) sink.show(it.detail, rows[idx].querySelector('.urm-cm-lbl').textContent.trim());
      };
      const clear = idx => {
        const it = items[idx];
        const sink = it.detail && sinkOf(it);
        if (sink) sink.clear();
      };
      const lock = idx => {
        if (locked >= 0) clear(locked);
        locked = idx;
        resetAll();
        dimOthers(idx);
        rows[idx].classList.add('urm-cm-locked');
        show(idx);
      };

      rows.forEach((row, idx) => {
        if (items[idx].disabled) return;
        if (doHover) {
          row.addEventListener('mouseenter', () => {
            if (locked >= 0) return;
            dimOthers(idx);
            show(idx);
          });
          row.addEventListener('mouseleave', () => {
            if (locked >= 0) return;
            resetAll();
            clear(idx);
          });
        }
        if (doClick) {
          row.addEventListener('click', () => {
            if (locked === idx) {
              locked = -1;
              resetAll();
              clear(idx);
            } else {
              lock(idx);
            }
          });
        }
      });

      // 初始鎖定：active-detail 填搭配詞的 detail
      const ad = idOf(a('active-detail'));
      const start = ad ? items.findIndex(it => it.detail === ad && !it.disabled) : -1;
      if (start >= 0) lock(start);
    }
  }

  customElements.define('layer-switch', LayerSwitch);
  customElements.define('ui-spotlight', UiSpotlight);
  customElements.define('cm-group', CmGroup);
  customElements.define('collocation-map', CollocationMap);

  const upgradeLegacy = root => {
    const list = root.localName === 'spotlight' ? [root] : [...(root.querySelectorAll ? root.querySelectorAll('spotlight') : [])];
    list.forEach(old => {
      const n = document.createElement('ui-spotlight');
      [...old.attributes].forEach(at => n.setAttribute(at.name, at.value));
      n.append(...old.childNodes);
      old.replaceWith(n);
    });
  };
  const watchLegacy = () => {
    upgradeLegacy(document);
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 1) upgradeLegacy(n);
    }))).observe(document.documentElement, { childList: true, subtree: true });
  };
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', watchLegacy, { once: true })
    : watchLegacy();

  window.UiReading2 = { init: () => upgradeLegacy(document), colors: PALETTE };
})();
/* ── 色名標籤 <c-blue>、<c-key> 等：所有元件共用同一份，頁面上只注入一次 ── */
(function () {
  'use strict';
  if (typeof document === 'undefined' || document.getElementById('ui-color-tags')) return;
  var COLORS = { shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', orange:'#FF5530', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', 'key-deep':'#176878', calm:'#A3C4BC', quiet:'#A9B8E0', playful:'#FFA987', urgent:'#FF2E63' };
  var css = [];
  Object.keys(COLORS).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[k] + '}'); });
  var s = document.createElement('style'); s.id = 'ui-color-tags'; s.textContent = css.join('\n');
  (document.head || document.documentElement).appendChild(s);
  if (typeof window !== 'undefined' && !window.UiColorTags) { window.UiColorTags = { colors: COLORS }; }
})();
