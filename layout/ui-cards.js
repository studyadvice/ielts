(() => {
  'use strict';
  if (customElements.get('ui-cards')) return;

  const PALETTE = {
    base: '#0C0D0C', shell: '#C6C7BD', lavender: '#C3A5E5', sky: '#82C8E5',
    warning: '#E6374B', salmon: '#E5C3B3', ocean: '#1CCAE8', safe: '#27AE60',
    teal: '#0DA591', vanilla: '#DBEDD8', yellow: '#E3D322', bluebell: '#7589D9',
    focus: '#D4FFFC', special: '#B3DE73', info: '#92B5E0', indigo: '#7849C9',
    pink: '#FF91D7', orange: '#EDA109'
  };
  const LIGHT_TEXT = new Set(['warning', 'indigo', 'teal', 'safe']);

  /* 可設定字級的卡片區塊：屬性名稱為 {key}-size，對應 CSS 變數 --uic-fs-{key} */
  const SIZE_KEYS = ['label', 'note', 'tag', 'body', 'footer', 'badge'];

  const color = v => (v ? (PALETTE[v.trim()] || v.trim()) : '');
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  /* 純數字視為 rem；帶單位（px、em、%、clamp() 等）則原樣使用 */
  const fs = v => {
    if (v == null) return '';
    const t = String(v).trim();
    if (!t) return '';
    return /^\d*\.?\d+$/.test(t) ? t + 'rem' : t;
  };
  const applySizes = (node, get) => {
    SIZE_KEYS.forEach(k => {
      const v = fs(get(k + '-size'));
      if (v) node.style.setProperty('--uic-fs-' + k, v);
    });
  };
  /* 依底色深淺選擇文字色：色盤名稱沿用 LIGHT_TEXT，其餘色碼以亮度判斷 */
  const textOn = v => {
    const k = (v || '').trim();
    if (PALETTE[k]) return LIGHT_TEXT.has(k) ? PALETTE.vanilla : PALETTE.base;
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(k);
    if (!m) return PALETTE.base;
    let h = m[1];
    if (h.length === 3) h = [...h].map(x => x + x).join('');
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16) / 255);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 0.5 ? PALETTE.vanilla : PALETTE.base;
  };
  const applyBadgeColor = (node, v) => {
    if (!v) return;
    node.style.setProperty('--uic-badge-bg', color(v));
    node.style.setProperty('--uic-badge-fg', textOn(v));
  };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const iconEl = name => el('i', 'bi ' + (name.startsWith('bi-') ? name : 'bi-' + name));
  const lineStyle = st => (st === 'none' ? 'none' : (['solid', 'dashed', 'dotted'].includes(st) ? st : 'solid'));
  const alertEl = id => el('div', 'alert alert-danger uic-alert', `找不到 id 為「${id}」的內容。`);
  const cloneOf = id => {
    const src = id ? document.getElementById(id) : null;
    if (!src) return null;
    if (src.localName === 'template') return src.content.cloneNode(true);
    const node = src.cloneNode(true);
    node.removeAttribute('id');
    node.hidden = false;
    if (node.style.display === 'none') node.style.removeProperty('display');
    return node;
  };

  /* ---------- 樣式 ---------- */
  const variantCSS = Object.entries(PALETTE)
    .filter(([k]) => k !== 'base')
    .map(([k, v]) => `ui-cards .uic-btn.uic-v-${k}{background:${v};color:${LIGHT_TEXT.has(k) ? PALETTE.vanilla : PALETTE.base};}`)
    .join('\n');

  const CSS = `
ui-cards{display:block;color:${PALETTE.shell};font-size:1rem;}
ui-cards:not([data-ready]){visibility:hidden;}
ui-cards .uic-title{font-size:1.2rem;font-weight:700;color:${PALETTE.lavender};margin:0 0 16px 0;}
ui-cards .uic-wrap{display:grid;gap:var(--uic-gap);align-items:start;box-sizing:border-box;}
ui-cards .uic-wrap.uic-side{grid-template-columns:var(--uic-pcols);}
ui-cards .uic-wrap.uic-side.uic-nopanel{grid-template-columns:minmax(0,1fr);}
ui-cards .uic-nopanel .uic-panel{display:none;}
ui-cards[bordered] .uic-wrap{border:1px solid ${PALETTE.shell};border-radius:8px;padding:16px;}

ui-cards .uic-grid{display:grid;grid-template-columns:repeat(var(--uic-cols),minmax(0,1fr));gap:var(--uic-gap);min-width:0;}

ui-cards card-item{position:relative;display:flex;flex-direction:column;min-height:var(--uic-minh);border:1px solid var(--uic-c);border-radius:var(--uic-radius);background:${PALETTE.base};color:${PALETTE.shell};box-sizing:border-box;overflow:hidden;text-align:var(--uic-align);}
ui-cards[media-position="left"] card-item[data-media]{display:grid;grid-template-columns:var(--uic-mw) minmax(0,1fr);grid-template-rows:1fr auto;}
ui-cards[media-position="left"] card-item[data-media] .uic-media{grid-row:1 / -1;}
ui-cards[media-position="left"] card-item[data-media] .uic-main,
ui-cards[media-position="left"] card-item[data-media] .uic-foot{grid-column:2;}

ui-cards .uic-media{display:flex;align-items:center;justify-content:var(--uic-jc);color:var(--uic-icon, var(--uic-c));font-size:var(--uic-isize);line-height:1;padding:var(--uic-pad) var(--uic-pad) 0 var(--uic-pad);}
ui-cards[media-position="left"] .uic-media{padding:var(--uic-pad) 0 var(--uic-pad) var(--uic-pad);justify-content:center;}
ui-cards .uic-media.uic-img{padding:0;height:var(--uic-mh);}
ui-cards[media-position="left"] .uic-media.uic-img{height:auto;min-height:100%;}
ui-cards .uic-media img{width:100%;height:100%;object-fit:cover;display:block;}

ui-cards .uic-main{flex:1 1 auto;padding:var(--uic-pad);display:flex;flex-direction:column;gap:6px;min-width:0;}
ui-cards .uic-label{font-size:var(--uic-fs-label, 1.1rem);font-weight:700;line-height:1.4;color:var(--uic-c);}
ui-cards .uic-note{font-size:var(--uic-fs-note, 0.85rem);line-height:1.5;color:${PALETTE.info};}
ui-cards .uic-tags{display:flex;flex-wrap:wrap;gap:6px;justify-content:var(--uic-jc);}
ui-cards .uic-tag{font-size:var(--uic-fs-tag, 0.75rem);line-height:1.5;border:1px solid ${PALETTE.sky};color:${PALETTE.sky};border-radius:999px;padding:1px 8px;}
ui-cards .uic-body{font-size:var(--uic-fs-body, 0.95rem);line-height:1.7;}
ui-cards .uic-body > :first-child{margin-top:0;}
ui-cards .uic-body > :last-child{margin-bottom:0;}
ui-cards .uic-foot{border-top:var(--uic-div);padding:10px var(--uic-pad);font-size:var(--uic-fs-footer, 0.85rem);color:${PALETTE.info};}
ui-cards .uic-badge{position:absolute;top:8px;right:8px;z-index:1;display:inline-flex;align-items:center;gap:4px;background:var(--uic-badge-bg, ${PALETTE.warning});color:var(--uic-badge-fg, ${PALETTE.vanilla});font-size:var(--uic-fs-badge, 0.75rem);font-weight:700;line-height:1.5;border-radius:999px;padding:1px 8px;}
ui-cards .uic-badge .bi{line-height:1;}
ui-cards .uic-badge.uic-badge-only{justify-content:center;width:2em;height:2em;padding:0;}

ui-cards card-item[data-click]{cursor:pointer;}
ui-cards card-item[data-click]:hover{border-color:${PALETTE.focus};}
ui-cards card-item[data-active]{border-color:var(--uic-accent);box-shadow:0 0 0 2px var(--uic-accent);}
ui-cards card-item[disabled]{border-style:dashed;cursor:not-allowed;filter:grayscale(1);}

ui-cards[card-style="filled"] card-item{background:var(--uic-c);border-color:var(--uic-c);color:${PALETTE.base};}
ui-cards[card-style="filled"] .uic-label,
ui-cards[card-style="filled"] .uic-note,
ui-cards[card-style="filled"] .uic-foot{color:${PALETTE.base};}
ui-cards[card-style="filled"] .uic-media{color:var(--uic-icon, ${PALETTE.base});}
ui-cards[card-style="filled"] .uic-tag{border-color:${PALETTE.base};color:${PALETTE.base};}
ui-cards[card-style="filled"] .uic-foot{border-top-color:${PALETTE.base};}
ui-cards[card-style="plain"] card-item{border-color:transparent;background:transparent;}

ui-cards .uic-panel{min-width:0;border:1px solid ${PALETTE.shell};border-radius:8px;padding:16px;box-sizing:border-box;}
ui-cards .uic-side .uic-panel{position:sticky;top:16px;}
ui-cards .uic-head{font-size:1.1rem;font-weight:700;color:${PALETTE.lavender};margin:0 0 12px 0;padding:0 0 8px 0;border-bottom:1px solid ${PALETTE.lavender};}
ui-cards .uic-head:empty{display:none;}
ui-cards .uic-pbody{line-height:1.7;}
ui-cards .uic-pbody > :first-child{margin-top:0;}
ui-cards .uic-pbody > :last-child{margin-bottom:0;}
ui-cards .uic-ph{color:${PALETTE.info};font-size:0.95rem;text-align:center;border:1px dashed ${PALETTE.info};border-radius:8px;padding:24px 16px;}
ui-cards .uic-alert{background:${PALETTE.base};border:1px solid ${PALETTE.warning};color:${PALETTE.warning};border-radius:6px;padding:12px 16px;margin:0;font-size:0.95rem;}

ui-cards .uic-btn{display:inline-flex;align-items:center;gap:6px;border:2px solid transparent;border-radius:6px;padding:6px 14px;margin:4px 8px 4px 0;font-size:0.95rem;font-weight:600;line-height:1.4;cursor:pointer;text-decoration:none;}
ui-cards .uic-btn:hover{border-color:${PALETTE.focus};}
ui-cards .uic-btn.uic-on{border-color:${PALETTE.focus};box-shadow:0 0 0 2px ${PALETTE.focus};}
ui-cards .uic-btn[disabled]{cursor:not-allowed;filter:grayscale(1);}
${variantCSS}
`;

  (function injectStyle() {
    if (document.getElementById('ui-cards-style')) return;
    const s = el('style');
    s.id = 'ui-cards-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  })();

  customElements.define('card-item', class extends HTMLElement {});

  class UiCards extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      const go = () => this._build();
      document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', go, { once: true })
        : go();
    }

    _build() {
      const a = n => this.getAttribute(n);
      const has = n => this.hasAttribute(n);

      const o = this._o = {
        trigger: a('trigger') || 'click',
        detailTrigger: a('detail-trigger') || 'click',
        toggle: has('toggle'),
        panel: ['below', 'right', 'none'].includes(a('panel')) ? a('panel') : 'below',
        panelTitle: a('panel-title') || '',
        placeholder: has('placeholder') ? a('placeholder') : '請點選卡片。',
        hideEmpty: has('hide-empty-panel'),
        btnColor: a('button-color') || 'ocean'
      };
      const heading = a('title');
      if (heading != null) this.removeAttribute('title');

      /* 外觀變數 */
      const s = this.style;
      const center = a('align') === 'center';
      s.setProperty('--uic-cols', Math.max(1, parseInt(a('cols'), 10) || 3));
      s.setProperty('--uic-gap', num(a('gap'), 16) + 'px');
      s.setProperty('--uic-pad', num(a('card-padding'), 16) + 'px');
      s.setProperty('--uic-radius', num(a('card-radius'), 8) + 'px');
      s.setProperty('--uic-minh', has('card-height') ? num(a('card-height'), 0) + 'px' : 'auto');
      s.setProperty('--uic-mh', num(a('media-height'), 140) + 'px');
      s.setProperty('--uic-mw', num(a('media-width'), 120) + 'px');
      s.setProperty('--uic-isize', fs(a('icon-size')) || '2rem');
      s.setProperty('--uic-c', color(a('color')) || PALETTE.shell);
      s.setProperty('--uic-accent', color(a('accent')) || PALETTE.ocean);
      if (has('icon-color')) s.setProperty('--uic-icon', color(a('icon-color')));
      s.setProperty('--uic-align', center ? 'center' : 'left');
      s.setProperty('--uic-jc', center ? 'center' : 'flex-start');
      s.setProperty('--uic-div', has('divider')
        ? `1px ${lineStyle(a('divider') || 'solid')} ${color(a('divider-color')) || 'var(--uic-c)'}`
        : 'none');
      /* 全體卡片字級與角標底色 */
      applySizes(this, a);
      applyBadgeColor(this, a('badge-color'));

      /* 卡片 */
      const wrap = this._wrap = el('div', 'uic-wrap');
      const grid = el('div', 'uic-grid');
      this._cards = [...this.children].filter(n => n.localName === 'card-item');
      this._cards.forEach(c => {
        this._decorate(c);
        grid.append(c);
      });
      wrap.append(grid);
      this._decorateButtons(grid);

      /* 內容區：有任何 detail 才建立 */
      if (o.panel !== 'none' && grid.querySelector('[detail]')) {
        const col = el('div', 'uic-panel');
        const head = el('div', 'uic-head');
        const body = el('div', 'uic-pbody');
        col.append(head, body);
        if (has('panel-height')) {
          col.style.maxHeight = num(a('panel-height'), 0) + 'px';
          col.style.overflow = 'auto';
        }
        this._panel = { col, head, body };
        wrap.append(col);
        if (o.panel === 'right') {
          const c = (a('panel-columns') || '8,4').split(',').map(v => num(v, 1));
          s.setProperty('--uic-pcols', `minmax(0,${c[0]}fr) minmax(0,${c[1] != null ? c[1] : c[0]}fr)`);
          wrap.classList.add('uic-side');
        }
      }

      this.replaceChildren(...(heading ? [el('div', 'uic-title', heading)] : []), wrap);

      /* 事件 */
      wrap.addEventListener('click', e => this._onClick(e));
      if (o.trigger === 'hover' || o.detailTrigger === 'hover') {
        wrap.addEventListener('mouseover', e => {
          const b = e.target.closest('[detail]');
          if (!b || !wrap.contains(b) || b === this._on) return;
          const isCard = b.localName === 'card-item';
          if ((isCard && o.trigger === 'hover') || (!isCard && o.detailTrigger === 'hover')) this._press(b, false);
        });
      }

      /* 初始狀態 */
      if (this._panel) {
        this._clear();
        const ad = a('active-detail');
        if (ad) {
          const all = [...grid.querySelectorAll('[detail]')].filter(x => x.getAttribute('detail') === ad);
          const b = all.find(x => x.localName === 'card-item') || all[0] || null;
          this._open(ad, b);
        }
      }

      this.setAttribute('data-ready', '');
    }

    _decorate(c) {
      const ta = n => c.getAttribute(n);
      const kids = [...c.childNodes];
      const parts = [];

      const img = ta('image');
      const icon = ta('icon');
      if (img || icon) {
        const media = el('div', 'uic-media');
        if (img) {
          const im = el('img');
          im.src = img;
          im.alt = ta('label') || '';
          im.loading = 'lazy';
          media.classList.add('uic-img');
          media.append(im);
        } else {
          media.append(iconEl(icon));
        }
        c.setAttribute('data-media', '');
        parts.push(media);
      }

      const main = el('div', 'uic-main');
      if (ta('label')) main.append(el('div', 'uic-label', ta('label')));
      if (ta('note')) main.append(el('div', 'uic-note', ta('note')));
      if (ta('tags')) {
        const tg = el('div', 'uic-tags');
        ta('tags').split(',').map(t => t.trim()).filter(Boolean).forEach(t => tg.append(el('span', 'uic-tag', t)));
        main.append(tg);
      }

      const body = el('div', 'uic-body');
      body.append(...kids);
      if (ta('source')) body.append(cloneOf(ta('source')) || alertEl(ta('source')));
      if (body.children.length || body.textContent.trim()) main.append(body);
      parts.push(main);

      if (ta('footer')) parts.push(el('div', 'uic-foot', ta('footer')));
      const bText = ta('badge');
      const bIcon = ta('badge-icon');
      if (bText || bIcon) {
        const bd = el('span', 'uic-badge');
        if (bIcon) bd.append(iconEl(bIcon.trim()));
        if (bText) bd.append(el('span', null, bText));
        else bd.classList.add('uic-badge-only');
        parts.push(bd);
      }
      c.replaceChildren(...parts);
      applyBadgeColor(c, ta('badge-color'));

      if (ta('tooltip')) c.title = ta('tooltip');
      if (ta('color')) c.style.setProperty('--uic-c', color(ta('color')));
      if (ta('icon-color')) c.style.setProperty('--uic-icon', color(ta('icon-color')));
      if (ta('icon-size')) c.style.setProperty('--uic-isize', fs(ta('icon-size')));
      /* 單張卡片字級（覆寫 ui-cards 的設定） */
      applySizes(c, ta);
      if (ta('span')) c.style.gridColumn = `span ${Math.max(1, parseInt(ta('span'), 10) || 1)}`;
      if (!c.hasAttribute('disabled') && (ta('detail') || ta('href'))) c.setAttribute('data-click', '');
    }

    _onClick(e) {
      const wrap = this._wrap;
      const b = e.target.closest('[detail]');
      if (b && wrap.contains(b)) {
        const link = e.target.closest('a[href]');
        if (link && link !== b && !link.hasAttribute('detail') && b.contains(link)) return;
        e.preventDefault();
        this._press(b, true);
        return;
      }
      const c = e.target.closest('card-item[href]');
      if (c && wrap.contains(c) && !c.hasAttribute('disabled') && !e.target.closest('a[href], button')) {
        const target = c.getAttribute('target');
        target ? window.open(c.getAttribute('href'), target) : (location.href = c.getAttribute('href'));
      }
    }

    _press(b, isClick) {
      if (!this._panel) return;
      if (b.disabled || b.hasAttribute('disabled')) return;
      if (b === this._on) {
        if (isClick && (this._o.toggle || b.hasAttribute('toggle'))) this._clear();
        return;
      }
      this._open(b.getAttribute('detail'), b);
    }

    _setOn(b, on) {
      if (!b) return;
      if (b.localName === 'card-item') {
        b.toggleAttribute('data-active', on);
      } else {
        b.classList.toggle('uic-on', on);
        if (b.classList.contains('btn')) b.classList.toggle('active', on);
      }
    }

    _open(id, b) {
      const p = this._panel;
      this._setOn(this._on, false);
      this._on = b;
      this._setOn(b, true);

      const card = b && b.closest('card-item');
      const label = (card && card.getAttribute('label')) || '';
      p.head.textContent = b && b.hasAttribute('detail-title')
        ? b.getAttribute('detail-title')
        : this._o.panelTitle.replace('{label}', label);
      p.body.replaceChildren(cloneOf(id) || alertEl(id));
      this._decorateButtons(p.body);
      this._wrap.classList.remove('uic-nopanel');
    }

    _clear() {
      const p = this._panel;
      this._setOn(this._on, false);
      this._on = null;
      p.head.textContent = this._o.panelTitle.replace('{label}', '').trim();
      p.body.replaceChildren(...(this._o.placeholder ? [el('div', 'uic-ph', this._o.placeholder)] : []));
      if (this._o.hideEmpty) this._wrap.classList.add('uic-nopanel');
    }

    _decorateButtons(root) {
      root.querySelectorAll('[detail]').forEach(b => {
        if (b.localName === 'card-item') return;
        if (b.localName === 'button' && !b.hasAttribute('type')) b.type = 'button';
        if (b.classList.contains('uic-btn')) return;
        if ([...b.classList].some(c => c === 'btn' || c.startsWith('btn-'))) return;
        const v = b.getAttribute('color') || this._o.btnColor;
        b.classList.add('uic-btn');
        if (PALETTE[v]) {
          b.classList.add('uic-v-' + v);
        } else {
          b.style.background = color(v);
          b.style.color = PALETTE.base;
        }
      });
    }
  }

  customElements.define('ui-cards', UiCards);
})();
