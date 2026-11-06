/*!
 * ui-steps.js  v1.0
 * 流程與時間軸元件：<ui-steps> 內放 <step-item>，可橫向或直向排列，步驟之間有連接線與箭頭。
 * 點擊帶 source 的步驟，在內容區顯示對應內容；內容中帶 detail 的元素，在下方細節區顯示內容。
 * 遵守 ui 元件共同約定（見 ui-conventions.html）。屬性只在載入時讀取一次，內容一律複製。
 * 依賴：Bootstrap Icons（使用 icon 屬性時）。
 * MIT License
 */
(() => {
  'use strict';
  if (customElements.get('ui-steps')) return;

  /* ---------- 配色與圖形 ---------- */
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
  /* 新色票都偏亮，實心底一律用深色字 */
  const LIGHT_TEXT = new Set(['key-deep']);
  const ARROW_SVG = {
    arrow: '<path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
    chevron: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    triangle: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>'
  };

  /* ---------- 小工具 ---------- */
  const color = v => (v ? (PALETTE[v.trim()] || v.trim()) : '');
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const iconEl = name => el('i', 'bi ' + (name.startsWith('bi-') ? name : 'bi-' + name));
  const lineStyle = st => (st === 'none' ? 'none' : (['solid', 'dashed', 'dotted'].includes(st) ? st : 'solid'));

  /* ---------- 樣式 ---------- */
  const variantCSS = Object.entries(PALETTE)
    .filter(([k]) => k !== 'base')
    .map(([k, v]) => `ui-steps .uis-btn.uis-v-${k}{background:${v};color:${LIGHT_TEXT.has(k) ? PALETTE.vanilla : PALETTE.base};}`)
    .join('\n');

  const CSS = `
ui-steps{display:block;color:${PALETTE.shell};font-size:1rem;}
ui-steps:not([data-ready]){visibility:hidden;}
ui-steps .uis-title{font-size:1.2rem;font-weight:700;color:${PALETTE.violet};margin:0 0 16px 0;}
ui-steps .uis-wrap{display:grid;gap:var(--uis-gap);box-sizing:border-box;}
ui-steps .uis-v.uis-has-panel{grid-template-columns:var(--uis-cols);align-items:start;}
ui-steps[bordered] .uis-wrap{border:1px solid ${PALETTE.shell};border-radius:8px;padding:var(--uis-pad);}

ui-steps .uis-track{display:flex;min-width:0;}
ui-steps .uis-h .uis-track{flex-direction:row;align-items:flex-start;overflow-x:auto;padding:4px 4px 8px 4px;}
ui-steps .uis-v .uis-track{flex-direction:column;align-items:stretch;padding:4px;}

ui-steps step-item{display:flex;user-select:none;outline:none;}
ui-steps .uis-h step-item{flex-direction:column;align-items:center;flex:0 0 auto;text-align:center;width:var(--uis-labw);}
ui-steps .uis-v step-item{flex-direction:row;align-items:center;gap:12px;}
ui-steps step-item[data-click]{cursor:pointer;}
ui-steps step-item[disabled]{cursor:not-allowed;}

ui-steps .uis-node{position:relative;flex:0 0 auto;width:var(--uis-size);height:var(--uis-size);border-radius:50%;background:var(--uis-node);color:var(--uis-icon);display:flex;align-items:center;justify-content:center;font-size:var(--uis-isize);font-weight:700;border:2px solid transparent;box-sizing:border-box;}
ui-steps[node-shape="square"] .uis-node{border-radius:0;}
ui-steps[node-shape="rounded"] .uis-node{border-radius:8px;}
ui-steps step-item[data-status="done"] .uis-node{background:var(--uis-done);}
ui-steps step-item[data-status="current"] .uis-node{background:var(--uis-accent);}
ui-steps step-item[data-click]:hover .uis-node{border-color:${PALETTE.vanilla};}
ui-steps step-item[data-active] .uis-node{border-color:${PALETTE.vanilla};box-shadow:0 0 0 3px ${PALETTE.vanilla};}
ui-steps step-item[disabled] .uis-node{background:${PALETTE.base};color:${PALETTE.shell};border:2px dashed ${PALETTE.shell};box-shadow:none;}
ui-steps .uis-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:${PALETTE.red};color:${PALETTE.vanilla};font-size:0.7rem;font-weight:700;line-height:18px;text-align:center;box-sizing:border-box;}

ui-steps .uis-text{display:flex;flex-direction:column;gap:2px;min-width:0;}
ui-steps .uis-h .uis-text{margin:8px 0 0 0;align-items:center;}
ui-steps .uis-label{font-size:0.95rem;font-weight:700;line-height:1.4;}
ui-steps .uis-note{font-size:0.8rem;color:${PALETTE.indigo};line-height:1.4;}
ui-steps step-item[data-status="current"] .uis-label{color:var(--uis-accent);}
ui-steps step-item[data-active] .uis-label{color:${PALETTE.vanilla};}

ui-steps .uis-link{position:relative;display:flex;align-items:center;justify-content:center;flex:1 1 0;color:var(--uis-acolor);}
ui-steps .uis-h .uis-link{min-width:var(--uis-len);height:var(--uis-size);}
ui-steps .uis-v .uis-link{min-height:var(--uis-len);width:var(--uis-size);}
ui-steps[compact] .uis-link{flex:0 0 var(--uis-len);}
ui-steps .uis-link::before{content:"";position:absolute;}
ui-steps .uis-h .uis-link::before{left:6px;right:6px;top:50%;border-top:var(--uis-lt) var(--uis-ls) var(--uis-lc);transform:translateY(-50%);}
ui-steps .uis-v .uis-link::before{top:6px;bottom:6px;left:50%;border-left:var(--uis-lt) var(--uis-ls) var(--uis-lc);transform:translateX(-50%);}
ui-steps .uis-link[data-on]{color:var(--uis-aon);}
ui-steps .uis-link[data-on]::before{border-color:var(--uis-lon);}

ui-steps .uis-arrow{position:relative;z-index:1;width:var(--uis-asize);height:var(--uis-asize);background:${PALETTE.base};display:flex;align-items:center;justify-content:center;box-sizing:border-box;line-height:1;}
ui-steps .uis-v .uis-arrow{transform:rotate(90deg);}
ui-steps .uis-arrow svg{width:100%;height:100%;display:block;}
ui-steps .uis-arrow i{font-size:calc(var(--uis-asize) * 0.9);line-height:1;}
ui-steps[arrow-style="circle"] .uis-arrow{border:2px solid currentColor;border-radius:50%;padding:calc(var(--uis-asize) * 0.18);}
ui-steps[arrow-style="circle"] .uis-arrow i{font-size:calc(var(--uis-asize) * 0.55);}

ui-steps .uis-panel{min-width:0;}
ui-steps[bordered] .uis-h .uis-panel{border-top:1px solid ${PALETTE.shell};padding:16px 0 0 0;}
ui-steps[bordered] .uis-v .uis-panel{border-left:1px solid ${PALETTE.shell};padding:0 0 0 16px;}
ui-steps .uis-sub{margin:16px 0 0 0;padding:16px 0 0 0;border-top:1px dashed ${PALETTE.violet};}
ui-steps .uis-sub[hidden]{display:none;}
ui-steps .uis-head{font-size:1.1rem;font-weight:700;color:${PALETTE.violet};margin:0 0 12px 0;padding:0 0 8px 0;border-bottom:1px solid ${PALETTE.violet};}
ui-steps .uis-head:empty{display:none;}
ui-steps .uis-body{line-height:1.7;}
ui-steps .uis-body > :first-child{margin-top:0;}
ui-steps .uis-body > :last-child{margin-bottom:0;}
ui-steps .uis-ph{color:${PALETTE.indigo};font-size:0.95rem;text-align:center;border:1px dashed ${PALETTE.indigo};border-radius:8px;padding:24px 16px;}
ui-steps .uis-alert{background:${PALETTE.base};border:1px solid ${PALETTE.red};color:${PALETTE.red};border-radius:6px;padding:12px 16px;margin:0;font-size:0.95rem;}

ui-steps .uis-btn{display:inline-flex;align-items:center;gap:6px;border:2px solid transparent;border-radius:6px;padding:6px 14px;margin:4px 8px 4px 0;font-size:0.95rem;font-weight:600;line-height:1.4;cursor:pointer;text-decoration:none;}
ui-steps .uis-btn:hover{border-color:${PALETTE.vanilla};}
ui-steps .uis-btn.uis-on{border-color:${PALETTE.vanilla};box-shadow:0 0 0 2px ${PALETTE.vanilla};}
ui-steps .uis-btn[disabled]{cursor:not-allowed;filter:grayscale(1);}
${variantCSS}
`;

  (function injectStyle() {
    if (document.getElementById('ui-steps-style')) return;
    const s = el('style');
    s.id = 'ui-steps-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  })();

  customElements.define('step-item', class extends HTMLElement {});

  class UiSteps extends HTMLElement {
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
      const vertical = a('direction') === 'vertical';

      const o = this._o = {
        trigger: a('trigger') || 'click',
        detailTrigger: a('detail-trigger') || 'click',
        toggle: has('toggle'),
        numbered: has('numbered'),
        doneIcon: a('done-icon') || '',
        panelTitle: a('panel-title') || '',
        detailTitle: a('detail-title') || '',
        placeholder: has('placeholder') ? a('placeholder') : '請點選步驟。',
        btnColor: a('button-color') || 'blue'
      };
      const heading = a('title');
      if (heading != null) this.removeAttribute('title');

      /* 外觀變數 */
      const s = this.style;
      const accent = color(a('accent')) || PALETTE.blue;
      s.setProperty('--uis-size', num(a('node-size'), 48) + 'px');
      s.setProperty('--uis-isize', num(a('icon-size'), 1.3) + 'rem');
      s.setProperty('--uis-node', color(a('color')) || PALETTE.shell);
      s.setProperty('--uis-accent', accent);
      s.setProperty('--uis-done', color(a('done-color')) || PALETTE.green);
      s.setProperty('--uis-icon', color(a('icon-color')) || PALETTE.base);
      s.setProperty('--uis-gap', num(a('gap'), 24) + 'px');
      s.setProperty('--uis-pad', num(a('padding'), 16) + 'px');
      s.setProperty('--uis-len', num(a('connector-length'), 48) + 'px');
      s.setProperty('--uis-labw', has('label-width') ? num(a('label-width'), 96) + 'px' : 'auto');
      s.setProperty('--uis-ls', has('line') ? lineStyle(a('line') || 'solid') : 'none');
      s.setProperty('--uis-lt', num(a('line-width'), 2) + 'px');
      s.setProperty('--uis-lc', color(a('line-color')) || PALETTE.shell);
      s.setProperty('--uis-lon', color(a('line-active-color')) || accent);
      s.setProperty('--uis-asize', num(a('arrow-size'), 20) + 'px');
      s.setProperty('--uis-acolor', color(a('arrow-color')) || PALETTE.shell);
      s.setProperty('--uis-aon', color(a('arrow-active-color')) || accent);

      /* 步驟狀態：status 優先，其次依 current（從 1 起算） */
      const items = [...this.children].filter(n => n.localName === 'step-item');
      const cur = parseInt(a('current'), 10);
      const statuses = items.map((it, i) => {
        const st = it.getAttribute('status');
        if (['done', 'current', 'todo'].includes(st)) return st;
        if (!cur) return 'todo';
        return i < cur - 1 ? 'done' : (i === cur - 1 ? 'current' : 'todo');
      });

      /* 建立軌道 */
      const wrap = this._wrap = el('div', 'uis-wrap ' + (vertical ? 'uis-v' : 'uis-h'));
      const track = el('div', 'uis-track');
      wrap.append(track);

      const arrowProto = has('arrows') ? this._arrow(a) : null;
      this._items = items;
      items.forEach((it, i) => {
        this._decorate(it, i, statuses[i]);
        track.append(it);
        if (i < items.length - 1) {
          const link = el('span', 'uis-link');
          if (statuses[i] === 'done' && statuses[i + 1] !== 'todo') link.setAttribute('data-on', '');
          if (arrowProto) link.append(arrowProto.cloneNode(true));
          track.append(link);
        }
      });

      /* 內容區：有任何步驟帶 source 或 detail 才建立 */
      if (items.some(it => it.hasAttribute('source') || it.hasAttribute('detail'))) {
        const panel = el('div', 'uis-panel');
        this._main = this._part();
        this._sub = this._part();
        this._sub.col.classList.add('uis-sub');
        this._sub.col.hidden = true;
        panel.append(this._main.col, this._sub.col);
        if (has('panel-height')) {
          panel.style.maxHeight = num(a('panel-height'), 0) + 'px';
          panel.style.overflow = 'auto';
        }
        wrap.append(panel);

        if (vertical) {
          const c = (a('columns') || '4,8').split(',').map(v => num(v, 1));
          s.setProperty('--uis-cols', `${c[0]}fr ${c[1] != null ? c[1] : c[0]}fr`);
          wrap.classList.add('uis-has-panel');
        }

        const pickBtn = e => {
          const b = e.target.closest('[detail]');
          return b && panel.contains(b) ? b : null;
        };
        panel.addEventListener('click', e => {
          const b = pickBtn(e);
          if (!b) return;
          e.preventDefault();
          this._press(b, true);
        });
        if (o.detailTrigger === 'hover') {
          panel.addEventListener('mouseover', e => {
            const b = pickBtn(e);
            if (b && b !== this._on) this._press(b, false);
          });
        }
      }

      this.replaceChildren(...(heading ? [el('div', 'uis-title', heading)] : []), wrap);

      /* 步驟事件 */
      const pick = e => e.target.closest('step-item');
      track.addEventListener('click', e => {
        const it = pick(e);
        if (it) this._activate(it, true);
      });
      if (o.trigger === 'hover') {
        track.addEventListener('mouseover', e => {
          const it = pick(e);
          if (it && it !== this._active) this._activate(it, false);
        });
      }

      /* 初始狀態 */
      if (this._main) {
        this._placeholder(this._main, o.placeholder, o.panelTitle.replace('{label}', '').trim());
        const act = a('active');
        const it = act && items.find(x => x.getAttribute('source') === act);
        if (it && !it.hasAttribute('disabled')) this._select(it);
        const ad = a('active-detail');
        if (ad) this._showDetail(ad, this._findBtn(ad));
      }

      this.setAttribute('data-ready', '');
    }

    _arrow(a) {
      const ar = el('span', 'uis-arrow');
      const icon = a('arrow-icon');
      if (icon) ar.append(iconEl(icon));
      else ar.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ARROW_SVG[a('arrow-shape')] || ARROW_SVG.arrow}</svg>`;
      return ar;
    }

    _part() {
      const col = el('div');
      const head = el('div', 'uis-head');
      const body = el('div', 'uis-body');
      col.append(head, body);
      return { col, head, body };
    }

    _decorate(it, i, status) {
      const o = this._o;
      const ta = n => it.getAttribute(n);
      it.dataset.status = status;

      const node = el('span', 'uis-node');
      const icon = status === 'done' && o.doneIcon ? o.doneIcon : ta('icon');
      if (icon) node.append(iconEl(icon));
      else if (o.numbered) node.append(String(i + 1));
      if (ta('badge')) node.append(el('span', 'uis-badge', ta('badge')));

      const parts = [node];
      const label = ta('label');
      const note = ta('note');
      if (label || note) {
        const text = el('span', 'uis-text');
        if (label) text.append(el('span', 'uis-label', label));
        if (note) text.append(el('span', 'uis-note', note));
        parts.push(text);
      }
      it.replaceChildren(...parts);

      if (ta('tooltip')) it.title = ta('tooltip');
      if (ta('color')) {
        const c = color(ta('color'));
        ['--uis-node', '--uis-done', '--uis-accent'].forEach(v => it.style.setProperty(v, c));
      }
      if (ta('icon-color')) it.style.setProperty('--uis-icon', color(ta('icon-color')));
      if (!it.hasAttribute('disabled') && (ta('source') || ta('detail') || ta('href'))) it.setAttribute('data-click', '');
    }

    /* 步驟被點擊或滑過 */
    _activate(it, isClick) {
      if (it.hasAttribute('disabled') || !it.hasAttribute('data-click')) return;

      const href = it.getAttribute('href');
      if (href) {
        if (isClick) {
          const target = it.getAttribute('target');
          target ? window.open(href, target) : (location.href = href);
        }
        return;
      }
      if (!this._main) return;

      if (it === this._active) {
        if (isClick && this._o.toggle) this._reset();
        return;
      }
      this._select(it);
    }

    _select(it) {
      this._items.forEach(x => x.toggleAttribute('data-active', x === it));
      this._active = it;

      const title = this._o.panelTitle.replace('{label}', it.getAttribute('label') || '');
      const src = it.getAttribute('source');
      if (src) {
        this._fill(this._main, src, title);
        this._decorateButtons(this._main.body);
      } else {
        this._placeholder(this._main, '', title);
      }
      this._clearDetail();

      const d = it.getAttribute('detail');
      if (d) this._showDetail(d, this._findBtn(d));
    }

    _reset() {
      this._items.forEach(x => x.removeAttribute('data-active'));
      this._active = null;
      this._placeholder(this._main, this._o.placeholder, this._o.panelTitle.replace('{label}', '').trim());
      this._clearDetail();
    }

    /* 細節區 */
    _press(b, isClick) {
      if (b.disabled || b.hasAttribute('disabled')) return;
      if (b === this._on) {
        if (isClick && b.hasAttribute('toggle')) this._clearDetail();
        return;
      }
      this._showDetail(b.getAttribute('detail'), b);
    }

    _setOn(b, on) {
      if (!b) return;
      b.classList.toggle('uis-on', on);
      if (b.classList.contains('btn')) b.classList.toggle('active', on);
    }

    _showDetail(id, btn) {
      this._setOn(this._on, false);
      this._on = btn;
      this._setOn(btn, true);
      const title = btn && btn.hasAttribute('detail-title') ? btn.getAttribute('detail-title') : this._o.detailTitle;
      this._sub.col.hidden = false;
      this._fill(this._sub, id, title);
      this._decorateButtons(this._sub.body);
    }

    _clearDetail() {
      this._setOn(this._on, false);
      this._on = null;
      this._sub.col.hidden = true;
      this._sub.head.textContent = '';
      this._sub.body.replaceChildren();
    }

    _findBtn(id) {
      return [...this._main.body.querySelectorAll('[detail]')].find(b => b.getAttribute('detail') === id) || null;
    }

    _decorateButtons(root) {
      root.querySelectorAll('[detail]').forEach(b => {
        if (b.localName === 'button' && !b.hasAttribute('type')) b.type = 'button';
        if (b.classList.contains('uis-btn')) return;
        if ([...b.classList].some(c => c === 'btn' || c.startsWith('btn-'))) return;
        const v = b.getAttribute('color') || this._o.btnColor;
        b.classList.add('uis-btn');
        if (PALETTE[v]) {
          b.classList.add('uis-v-' + v);
        } else {
          b.style.background = color(v);
          b.style.color = PALETTE.base;
        }
      });
    }

    /* 內容填入：一律複製 */
    _fill(part, id, title) {
      part.head.textContent = title || '';
      const src = id ? document.getElementById(id) : null;
      if (!src) {
        part.body.replaceChildren(el('div', 'alert alert-danger uis-alert', `找不到 id 為「${id}」的內容。`));
        return;
      }
      let node;
      if (src.localName === 'template') {
        node = src.content.cloneNode(true);
      } else {
        node = src.cloneNode(true);
        node.removeAttribute('id');
        node.hidden = false;
        if (node.style.display === 'none') node.style.removeProperty('display');
      }
      part.body.replaceChildren(node);
    }

    _placeholder(part, text, title) {
      part.head.textContent = title || '';
      part.body.replaceChildren(...(text ? [el('div', 'uis-ph', text)] : []));
    }
  }

  customElements.define('ui-steps', UiSteps);
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
