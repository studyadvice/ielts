(() => {
  'use strict';
  if (customElements.get('ui-cards')) return;

  const PALETTE = {
    base: '#0C0D0C', shell: '#C6C7BD', lavender: '#B484E8', sky: '#5DBAE8',
    warning: '#EF6661', salmon: '#F79C40', ocean: '#5DBAE8', safe: '#71CD76',
    teal: '#71CD76', vanilla: '#DBEDD8', yellow: '#E3D322', bluebell: '#778CE1',
    focus: '#DBEDD8', special: '#71CD76', info: '#778CE1', indigo: '#778CE1',
    pink: '#FF91D7', orange: '#F79C40',
    /* 新色票 */
    red: '#EF6661',
    green: '#71CD76',
    blue: '#5DBAE8',
    violet: '#B484E8',
    gray: '#86877F'
  };
  /* 新色票都偏亮，實心底一律用深色字 */
  const LIGHT_TEXT = new Set([]);

  const SIZE_KEYS = ['label', 'note', 'tag', 'body', 'footer', 'badge'];

  const color = v => (v ? (PALETTE[v.trim()] || v.trim()) : '');
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
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
  /* 角標：卡片與內容區共用 */
  const badgeEl = (text, icon) => {
    if (!text && !icon) return null;
    const bd = el('span', 'uic-badge');
    if (icon) bd.append(iconEl(icon.trim()));
    if (text) bd.append(el('span', null, text));
    else bd.classList.add('uic-badge-only');
    return bd;
  };
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

  /* 實心外觀：底色取 --uic-fill，文字色取 --uic-on；卡片樣式與選中樣式共用同一組規則 */
  const filledCSS = sel => `
${sel}{background:var(--uic-fill);border-color:var(--uic-fill);color:var(--uic-on);}
${sel} .uic-label,
${sel} .uic-note,
${sel} .uic-foot{color:var(--uic-on);}
${sel} .uic-media{color:var(--uic-icon, var(--uic-on));}
${sel} .uic-tag{border-color:var(--uic-on);color:var(--uic-on);}
${sel} .uic-foot{border-top-color:var(--uic-on);}`;
  const SEL_FILLED = 'ui-cards card-item[data-style="filled"]';
  const SEL_ACTIVE_FILLED = 'ui-cards[active-style="filled"] card-item[data-active]';

  const CSS = `
ui-cards{display:block;color:${PALETTE.shell};font-size:1rem;}
ui-cards:not([data-ready]){visibility:hidden;}
ui-cards .uic-title{font-size:var(--uic-fs-title, 1.2rem);font-weight:700;color:var(--uic-title-c, ${PALETTE.lavender});margin:0 0 16px 0;}
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

${SEL_FILLED}{--uic-fill:var(--uic-c);--uic-on:var(--uic-c-on, ${PALETTE.base});}
${SEL_ACTIVE_FILLED}{--uic-fill:var(--uic-accent);--uic-on:var(--uic-accent-on, ${PALETTE.base});}
${filledCSS(SEL_FILLED)}
${filledCSS(SEL_ACTIVE_FILLED)}
ui-cards card-item[data-style="plain"]{border-color:transparent;background:transparent;}

ui-cards .uic-panel{position:relative;min-width:0;border:1px solid ${PALETTE.shell};border-radius:8px;padding:16px;box-sizing:border-box;}
ui-cards .uic-panel.uic-has-badge .uic-head{padding-right:var(--uic-pbadge-w, 96px);}
ui-cards .uic-panel.uic-has-badge .uic-head:empty + .uic-pbody{padding-right:var(--uic-pbadge-w, 96px);}
ui-cards .uic-side .uic-panel{position:sticky;top:16px;}
ui-cards .uic-head{font-size:var(--uic-fs-head, 1.1rem);font-weight:700;color:var(--uic-head-c, ${PALETTE.lavender});margin:0 0 12px 0;padding:0 0 8px 0;border-bottom:1px solid var(--uic-head-line, var(--uic-head-c, ${PALETTE.lavender}));}
ui-cards[panel-title-line="none"] .uic-head{border-bottom:none;padding-bottom:0;}
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
        panelBadge: a('panel-badge') || '',
        panelBadgeIcon: a('panel-badge-icon') || '',
        panelBadgeColor: a('panel-badge-color') || '',
        btnColor: a('button-color') || 'ocean',
        cardStyle: a('card-style') || ''
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
      /* 實心時的文字色：依底色亮度自動選擇 */
      s.setProperty('--uic-c-on', textOn(a('color') || 'shell'));
      s.setProperty('--uic-accent-on', textOn(a('accent') || 'ocean'));
      if (has('icon-color')) s.setProperty('--uic-icon', color(a('icon-color')));
      s.setProperty('--uic-align', center ? 'center' : 'left');
      s.setProperty('--uic-jc', center ? 'center' : 'flex-start');
      s.setProperty('--uic-div', has('divider')
        ? `1px ${lineStyle(a('divider') || 'solid')} ${color(a('divider-color')) || 'var(--uic-c)'}`
        : 'none');
      /* 全體卡片字級與角標底色 */
      applySizes(this, a);
      applyBadgeColor(this, a('badge-color'));
      /* 元件大標題與內容區標題：字級、文字色、底線色 */
      const setVar = (name, v) => { if (v) s.setProperty(name, v); };
      setVar('--uic-fs-title', fs(a('title-size')));
      setVar('--uic-title-c', color(a('title-color')));
      setVar('--uic-fs-head', fs(a('panel-title-size')));
      setVar('--uic-head-c', color(a('panel-title-color')));
      const line = a('panel-title-line');
      if (line && line !== 'none') setVar('--uic-head-line', color(line));

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
      const bd = badgeEl(ta('badge'), ta('badge-icon'));
      if (bd) parts.push(bd);
      c.replaceChildren(...parts);
      applyBadgeColor(c, ta('badge-color'));

      if (ta('tooltip')) c.title = ta('tooltip');
      if (ta('color')) {
        c.style.setProperty('--uic-c', color(ta('color')));
        c.style.setProperty('--uic-c-on', textOn(ta('color')));
      }
      /* 卡片外觀：自己的 card-style 優先，其次為 ui-cards 的 card-style */
      const st = (ta('card-style') || this._o.cardStyle).trim();
      if (['filled', 'plain', 'outline'].includes(st)) c.setAttribute('data-style', st);
      if (ta('icon-color')) c.style.setProperty('--uic-icon', color(ta('icon-color')));
      if (ta('icon-size')) c.style.setProperty('--uic-isize', fs(ta('icon-size')));
      /* 單張卡片字級（覆寫 ui-cards 的設定） */
      applySizes(c, ta);
      if (ta('span')) c.style.gridColumn = `span ${Math.max(1, parseInt(ta('span'), 10) || 1)}`;
      if (!c.hasAttribute('disabled') && (ta('detail') || ta('href'))) c.setAttribute('data-click', '');
    }

    _onClick(e) {
      const wrap = this._wrap;
      /* 顯示按鈕優先處理，避免被所在卡片的 detail 攔截 */
      const r = e.target.closest('[reveal]');
      if (r && wrap.contains(r)) {
        e.preventDefault();
        e.stopPropagation();
        this._reveal(r);
        return;
      }
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

    /* 顯示目標區塊；按鈕有 remove-cards 時一併移除整個 ui-cards */
    _reveal(r) {
      if (r.disabled || r.hasAttribute('disabled')) return;
      const id = (r.getAttribute('reveal') || '').trim();
      const target = id ? document.getElementById(id) : null;
      if (!target) {
        const next = r.nextElementSibling;
        if (!(next && next.classList.contains('uic-alert'))) r.after(alertEl(id));
        return;
      }
      target.hidden = false;
      target.classList.remove('d-none');
      if (target.style.display === 'none') target.style.removeProperty('display');
      if (getComputedStyle(target).display === 'none') target.style.display = 'block';

      const removeCards = r.hasAttribute('remove-cards');
      target.dispatchEvent(new CustomEvent('ui-cards:reveal', {
        bubbles: true,
        detail: { id, removed: removeCards, button: r }
      }));
      if (removeCards) {
        this.remove();
      } else {
        r.classList.add('uic-on');
      }
      if (r.hasAttribute('reveal-scroll')) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      this._setPanelBadge(b);
      this._wrap.classList.remove('uic-nopanel');
    }

    /* 內容區角標：按鈕的 detail-badge* 優先，其次為 ui-cards 的 panel-badge*；清空時移除 */
    _setPanelBadge(b) {
      const p = this._panel;
      if (p.badge) p.badge.remove();
      p.badge = null;
      p.col.classList.remove('uic-has-badge');
      if (!b) return;
      const pick = (own, fallback) => (b.hasAttribute(own) ? b.getAttribute(own) : fallback);
      const text = pick('detail-badge', this._o.panelBadge);
      const icon = pick('detail-badge-icon', this._o.panelBadgeIcon);
      const bd = badgeEl(text, icon);
      if (!bd) return;
      applyBadgeColor(bd, pick('detail-badge-color', this._o.panelBadgeColor));
      p.col.append(bd);
      p.badge = bd;
      p.col.classList.add('uic-has-badge');
      p.col.style.setProperty('--uic-pbadge-w', (bd.offsetWidth + 16) + 'px');
    }

    _clear() {
      const p = this._panel;
      this._setOn(this._on, false);
      this._on = null;
      p.head.textContent = this._o.panelTitle.replace('{label}', '').trim();
      p.body.replaceChildren(...(this._o.placeholder ? [el('div', 'uic-ph', this._o.placeholder)] : []));
      this._setPanelBadge(null);
      if (this._o.hideEmpty) this._wrap.classList.add('uic-nopanel');
    }

    _decorateButtons(root) {
      root.querySelectorAll('[detail], [reveal]').forEach(b => {
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
/* ── 色名標籤 <c-blue>、<c-pink> 等：所有元件共用同一份，頁面上只注入一次 ── */
(function () {
  'use strict';
  if (typeof document === 'undefined' || document.getElementById('ui-color-tags')) return;
  var COLORS = {
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7',
    red: '#EF6661', orange: '#F79C40', green: '#71CD76', blue: '#5DBAE8',
    indigo: '#778CE1', violet: '#B484E8', gray: '#86877F'
  };
  /* 舊色名：對應到最接近的新色，與 chk/ui-check.js、inc/palette.php 一致 */
  var ALIASES = {
    lavender: 'violet', sky: 'blue', ocean: 'blue', stone: 'blue', info: 'indigo', bluebell: 'indigo',
    warning: 'red', salmon: 'orange', safe: 'green', teal: 'green', special: 'green',
    focus: 'vanilla', attention: 'yellow'
  };
  var css = [];
  Object.keys(COLORS).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[k] + '}'); });
  Object.keys(ALIASES).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[ALIASES[k]] + '}'); });
  var s = document.createElement('style');
  s.id = 'ui-color-tags';
  s.textContent = css.join('\n');
  (document.head || document.documentElement).appendChild(s);
  if (typeof window !== 'undefined' && !window.UiColorTags) {
    window.UiColorTags = { colors: COLORS, aliases: ALIASES };
  }
})();
