(() => {
  'use strict';
  if (customElements.get('ui-drill')) return;

  const PALETTE = {
    base: '#0C0D0C', shell: '#C6C7BD',
    vanilla: '#DBEDD8', yellow: '#E3D322',
    indigo: '#778CE1', pink: '#FF91D7',
    orange: '#FFA987',
    /* 新色票 */
    red: '#EF6661',
    green: '#71CD76',
    blue: '#5DBAE8',
    violet: '#B484E8',
    gray: '#86877F',
    /* 新增色 */
    key: '#51DBCF',
    'key-deep': '#51DBCF',
    calm: '#A3C4BC',
    quiet: '#8EA4DE',
    playful: '#FFA987',
    urgent: '#FF2E63',
    energetic: '#B6FF00',
    dreamy: '#DE8EC9',
    'bg-alternative': '#3B2A20'
  };
  /* 新色票都偏亮，實心底一律用深色字 */
  const LIGHT_TEXT = new Set(['bg-alternative']);

  const ARROW_SVG = {
    arrow: '<path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
    chevron: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    triangle: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>'
  };

  const color = v => (v ? (PALETTE[v.trim()] || v.trim()) : '');
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  const variantCSS = Object.entries(PALETTE)
    .filter(([k]) => k !== 'base')
    .map(([k, v]) => `ui-drill .uid-btn.uid-v-${k}{background:${v};color:${LIGHT_TEXT.has(k) ? PALETTE.vanilla : PALETTE.base};}`)
    .join('\n');

  const CSS = `
ui-drill{display:block;color:${PALETTE.shell};font-size:1rem;}
ui-drill:not([data-ready]){visibility:hidden;}
ui-drill .uid-title{font-size:1.2rem;font-weight:700;color:${PALETTE.violet};margin:0 0 16px 0;}
ui-drill .uid-wrap{display:grid;grid-template-columns:var(--uid-cols);gap:var(--uid-gap);align-items:stretch;box-sizing:border-box;}
ui-drill .uid-wrap.uid-noright{grid-template-columns:var(--uid-cols2);}
ui-drill .uid-wrap.uid-noright .uid-right{display:none;}
ui-drill .uid-col{min-width:0;overflow:auto;display:flex;flex-direction:column;box-sizing:border-box;}
ui-drill[bordered] .uid-wrap{border:1px solid ${PALETTE.shell};border-radius:8px;gap:0;}
ui-drill[bordered] .uid-col{padding:16px;}
ui-drill[bordered] .uid-col + .uid-col{border-left:1px solid ${PALETTE.shell};}
ui-drill .uid-left{grid-column:1;grid-row:1;}
ui-drill .uid-mid{grid-column:2;grid-row:1;}
ui-drill .uid-right{grid-column:3;grid-row:1;}

ui-drill .uid-arrow{grid-row:1;z-index:2;pointer-events:none;justify-self:start;align-self:start;width:var(--uid-asize);height:var(--uid-asize);margin-top:var(--uid-aoff);margin-left:calc(-1 * (var(--uid-agap) / 2 + var(--uid-asize) / 2));color:var(--uid-acolor);background:${PALETTE.base};display:flex;align-items:center;justify-content:center;box-sizing:border-box;line-height:1;}
ui-drill .uid-arrow-1{grid-column:2;}
ui-drill .uid-arrow-2{grid-column:3;}
ui-drill .uid-arrow[data-on]{color:var(--uid-aon);}
ui-drill .uid-arrow svg{width:100%;height:100%;display:block;}
ui-drill .uid-arrow i{font-size:calc(var(--uid-asize) * 0.9);line-height:1;}
ui-drill[arrow-style="circle"] .uid-arrow{border:2px solid currentColor;border-radius:50%;padding:calc(var(--uid-asize) * 0.18);}
ui-drill[arrow-style="circle"] .uid-arrow i{font-size:calc(var(--uid-asize) * 0.55);}
ui-drill[arrow-position="middle"] .uid-arrow{align-self:center;margin-top:0;}
ui-drill[arrow-position="bottom"] .uid-arrow{align-self:end;margin-top:0;margin-bottom:var(--uid-aoff);}
ui-drill .uid-wrap.uid-noright .uid-arrow-2{display:none;}

ui-drill .uid-wrap.uid-stack{grid-template-columns:var(--uid-cols2);grid-template-rows:var(--uid-srows);}
ui-drill .uid-wrap.uid-stack.uid-noright{grid-template-rows:var(--uid-srows2);}
ui-drill .uid-stack .uid-left{grid-row:1 / -1;}
ui-drill .uid-stack .uid-rightup{grid-column:2;grid-row:1;}
ui-drill .uid-stack .uid-mid{display:none;}
ui-drill .uid-stack .uid-right{grid-column:2;grid-row:var(--uid-rright);}
ui-drill[bordered] .uid-stack .uid-rightup + .uid-mid,
ui-drill[bordered] .uid-stack .uid-right{border-top:1px solid ${PALETTE.shell};}
ui-drill .uid-stack .uid-arrow-1{grid-row:1 / -1;}
ui-drill .uid-stack .uid-arrow-2{grid-column:2;grid-row:var(--uid-rright);justify-self:center;align-self:start;margin:calc(-1 * (var(--uid-agap) / 2 + var(--uid-asize) / 2)) 0 0 0;transform:rotate(90deg);}

ui-drill rightup-item{display:flex;gap:12px;align-items:baseline;padding:var(--uid-rupad) 0;}
ui-drill rightup-item[hidden]{display:none;}
ui-drill rightup-item:not([data-last]){border-bottom:var(--uid-rud);}
ui-drill[rightup-label="top"] rightup-item{align-items:flex-start;}
ui-drill .uid-ru-label{flex:0 0 var(--uid-rulw);color:${PALETTE.blue};font-weight:700;font-size:0.95rem;}
ui-drill .uid-ru-main,
ui-drill .uid-ru-box{flex:1 1 auto;min-width:0;}
ui-drill .uid-ru-icon{flex:0 0 auto;font-size:1.1rem;line-height:1.6;color:var(--uid-tile-on);}
ui-drill .uid-ru-line{display:flex;align-items:baseline;gap:12px;}
ui-drill .uid-ru-line .uid-ru-label{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
ui-drill .uid-ru-note{font-size:0.9rem;color:${PALETTE.vanilla};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
ui-drill[rightup-label="top"] .uid-ru-body{font-size:0.85rem;color:${PALETTE.indigo};display:-webkit-box;-webkit-line-clamp:var(--uid-rulines);-webkit-box-orient:vertical;overflow:hidden;}
ui-drill .uid-ru-end{flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;margin-left:auto;}
ui-drill .uid-ru-meta{font-size:0.8rem;color:${PALETTE.indigo};white-space:nowrap;}
ui-drill .uid-ru-badge{background:${PALETTE.red};color:${PALETTE.vanilla};font-size:0.7rem;font-weight:700;line-height:1.5;border-radius:999px;padding:1px 8px;}
ui-drill rightup-item[unread] .uid-ru-label{color:${PALETTE.vanilla};font-weight:800;}
ui-drill rightup-item[unread] .uid-ru-label::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--uid-tile-on);margin:0 8px 0 0;vertical-align:middle;}
ui-drill rightup-item.uid-on .uid-ru-label{color:var(--uid-tile-on);}
ui-drill rightup-item[disabled]{cursor:not-allowed;filter:grayscale(1);}
ui-drill .uid-ru-body > :first-child{margin-top:0;}
ui-drill .uid-ru-body > :last-child{margin-bottom:0;}
ui-drill rightup-item[detail]{cursor:pointer;}
ui-drill rightup-item[detail]:hover .uid-ru-body{color:${PALETTE.vanilla};}
ui-drill rightup-item.uid-on{box-shadow:inset 3px 0 0 var(--uid-tile-on);padding-left:12px;}

ui-drill .uid-head{font-size:1.1rem;font-weight:700;color:${PALETTE.violet};margin:0 0 12px 0;padding:0 0 8px 0;border-bottom:1px solid ${PALETTE.violet};}
ui-drill .uid-head:empty{display:none;}
ui-drill .uid-body{line-height:1.7;}
ui-drill .uid-body > :first-child{margin-top:0;}
ui-drill .uid-body > :last-child{margin-bottom:0;}
ui-drill .uid-ph{color:${PALETTE.indigo};font-size:0.95rem;text-align:center;border:1px dashed ${PALETTE.indigo};border-radius:8px;padding:24px 16px;}
ui-drill .uid-alert{background:${PALETTE.base};border:1px solid ${PALETTE.red};color:${PALETTE.red};border-radius:6px;padding:12px 16px;margin:0;font-size:0.95rem;}

ui-drill .uid-tiles{display:grid;grid-template-columns:repeat(var(--uid-tcols),max-content);gap:var(--uid-tgap);align-content:start;justify-content:start;}
ui-drill .uid-group{grid-column:1 / -1;font-size:0.8rem;font-weight:700;color:${PALETTE.blue};margin:6px 0 0 0;}
ui-drill .uid-group:first-child{margin-top:0;}
ui-drill drill-tile{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;user-select:none;outline:none;}
ui-drill drill-tile .uid-box{position:relative;width:var(--uid-size);height:var(--uid-size);background:var(--uid-tile);color:var(--uid-icon);display:flex;align-items:center;justify-content:center;font-size:var(--uid-isize);border:2px solid transparent;box-sizing:border-box;}
ui-drill[tile-shape="rounded"] drill-tile .uid-box{border-radius:8px;}
ui-drill[tile-shape="circle"] drill-tile .uid-box{border-radius:50%;}
ui-drill drill-tile:hover .uid-box{border-color:${PALETTE.vanilla};}
ui-drill drill-tile[data-active] .uid-box{background:var(--uid-tile-on);border-color:${PALETTE.vanilla};}
ui-drill drill-tile:focus-visible .uid-box{outline:2px dashed ${PALETTE.vanilla};outline-offset:2px;}
ui-drill drill-tile[disabled]{cursor:not-allowed;}
ui-drill drill-tile[disabled] .uid-box{background:${PALETTE.base};color:${PALETTE.shell};border:2px dashed ${PALETTE.shell};}
ui-drill .uid-label{font-size:0.8rem;line-height:1.3;text-align:center;max-width:calc(var(--uid-size) + 24px);word-break:break-all;}
ui-drill drill-tile[data-active] .uid-label{color:var(--uid-tile-on);font-weight:700;}
ui-drill .uid-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:${PALETTE.red};color:${PALETTE.vanilla};font-size:0.7rem;font-weight:700;line-height:18px;text-align:center;box-sizing:border-box;}

ui-drill .uid-btn{display:inline-flex;align-items:center;gap:6px;border:2px solid transparent;border-radius:6px;padding:6px 14px;margin:4px 8px 4px 0;font-size:0.95rem;font-weight:600;line-height:1.4;cursor:pointer;text-decoration:none;}
ui-drill .uid-btn:hover{border-color:${PALETTE.vanilla};}
ui-drill .uid-btn.uid-on{border-color:${PALETTE.vanilla};box-shadow:0 0 0 2px ${PALETTE.vanilla};}
ui-drill .uid-btn[disabled]{cursor:not-allowed;filter:grayscale(1);}

ui-drill .uid-tabbar .uid-tiles{display:flex;flex-wrap:nowrap;align-items:flex-end;justify-content:var(--uid-tjust);gap:var(--uid-tgap);overflow-x:auto;padding:8px 0 0 0;border-bottom:var(--uid-tbar) solid var(--uid-barc);}
ui-drill .uid-tabbar drill-tile{flex-direction:row;}
ui-drill[tab-align="stretch"] .uid-tabbar drill-tile{flex:1 1 0;}
ui-drill[tab-align="stretch"] .uid-tabbar .uid-box{width:100%;}
ui-drill .uid-tabbar .uid-box{width:var(--uid-tw);height:var(--uid-size);padding:0 var(--uid-tpad);gap:8px;font-size:var(--uid-tfs);font-weight:600;white-space:nowrap;border:none;border-radius:0;filter:brightness(var(--uid-tdim));}
ui-drill .uid-tabbar .uid-box i{font-size:var(--uid-isize);}
ui-drill .uid-tabbar drill-tile:hover .uid-box{filter:brightness(0.92);}
ui-drill .uid-tabbar drill-tile[data-active] .uid-box{filter:none;height:calc(var(--uid-size) + 6px);background:var(--uid-tile-on);}
ui-drill .uid-tabbar drill-tile[disabled] .uid-box{filter:grayscale(1) brightness(0.55);border:none;background:var(--uid-tile);color:var(--uid-icon);}
ui-drill .uid-tabbar drill-tile:focus-visible .uid-box{outline:2px dashed ${PALETTE.vanilla};outline-offset:-4px;}
ui-drill .uid-tabbar .uid-badge{position:static;margin:0 0 0 2px;}
ui-drill[tile-shape="tab-trapezoid"] .uid-tabbar .uid-box{clip-path:polygon(12px 0,calc(100% - 12px) 0,100% 100%,0 100%);padding:0 calc(var(--uid-tpad) + 8px);}
ui-drill[tile-shape="tab-rounded"] .uid-tabbar .uid-box{border-radius:10px 10px 0 0;}
ui-drill[tile-shape="tab-folder"] .uid-tabbar .uid-box{clip-path:polygon(0 100%,0 8px,8px 0,calc(100% - 20px) 0,100% 100%);padding:0 calc(var(--uid-tpad) + 12px) 0 var(--uid-tpad);}
ui-drill[tile-shape="tab-pill"] .uid-tabbar .uid-tiles{align-items:center;padding:8px 0;}
ui-drill[tile-shape="tab-pill"] .uid-tabbar .uid-box{border-radius:999px;}
ui-drill[tile-shape="tab-pill"] .uid-tabbar drill-tile[data-active] .uid-box{height:var(--uid-size);}
ui-drill[tile-shape="tab-underline"] .uid-tabbar .uid-tiles{border-bottom:1px solid ${PALETTE.shell};}
ui-drill[tile-shape="tab-underline"] .uid-tabbar .uid-box{background:transparent;color:${PALETTE.shell};filter:none;border-bottom:3px solid transparent;}
ui-drill[tile-shape="tab-underline"] .uid-tabbar drill-tile[data-active] .uid-box{background:transparent;color:var(--uid-tile-on);border-bottom-color:var(--uid-tile-on);height:var(--uid-size);}

ui-drill .uid-wrap.uid-tabs{grid-template-columns:var(--uid-tcols2);}
ui-drill .uid-wrap.uid-tabs.uid-noright,
ui-drill .uid-wrap.uid-tabs.uid-stack{grid-template-columns:minmax(0,1fr);}
ui-drill .uid-tabs .uid-mid{grid-column:1;}
ui-drill .uid-tabs .uid-right{grid-column:2;}
ui-drill .uid-tabs .uid-arrow-1{display:none;}
ui-drill .uid-tabs .uid-arrow-2{grid-column:2;}
ui-drill .uid-tabs.uid-stack .uid-rightup,
ui-drill .uid-tabs.uid-stack .uid-right,
ui-drill .uid-tabs.uid-stack .uid-arrow-2{grid-column:1;}
ui-drill[bordered] .uid-tabs.uid-stack .uid-col{border-left:none;}
ui-drill[bordered] .uid-tabbar + .uid-wrap{border-top:none;border-radius:0 0 8px 8px;}
ui-drill:not([bordered]) .uid-tabbar + .uid-wrap{padding:16px 0 0 0;}
${variantCSS}
`;

  (function injectStyle() {
    if (document.getElementById('ui-drill-style')) return;
    const s = el('style');
    s.id = 'ui-drill-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  })();

  customElements.define('drill-tile', class extends HTMLElement {});
  customElements.define('rightup-item', class extends HTMLElement {});

  const divLine = st => {
    if (!st || st === 'none') return 'none';
    return `1px ${['solid', 'dashed', 'dotted'].includes(st) ? st : 'solid'} var(--uid-rudc)`;
  };

  class UiDrill extends HTMLElement {
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

      const cols = (a('columns') || '2,5,5').split(',').map(v => num(v, 1));
      while (cols.length < 3) cols.push(cols[cols.length - 1] || 1);

      const stack = a('layout') === 'stack';
      const shape = a('tile-shape') || '';
      const tab = shape.startsWith('tab-') ? shape.slice(4) : '';
      const o = this._o = {
        layout: stack ? 'stack' : 'columns',
        tab,
        accent: color(a('accent')) || PALETTE.blue,
        tileCols: Math.max(1, parseInt(a('tile-cols'), 10) || 3),
        tileLabel: a('tile-label') || 'tooltip',
        trigger: a('trigger') || 'click',
        detailTrigger: a('detail-trigger') || 'click',
        midTitle: a('mid-title') || '',
        rightTitle: a('right-title') || '',
        midPh: has('mid-placeholder') ? a('mid-placeholder') : '請點選左側方塊。',
        rightPh: has('right-placeholder') ? a('right-placeholder') : (stack ? '請點選上方清單。' : '請點選中欄按鈕。'),
        hideEmptyRight: has('hide-empty-right'),
        toggle: has('toggle'),
        keyboard: has('keyboard'),
        variant: a('button-color') || a('button-variant') || 'blue'
      };
      const heading = a('title');
      if (heading != null) this.removeAttribute('title');

      const s = this.style;
      s.setProperty('--uid-cols', `${cols[0]}fr ${cols[1]}fr ${cols[2]}fr`);
      s.setProperty('--uid-cols2', `${cols[0]}fr ${cols[1] + cols[2]}fr`);
      s.setProperty('--uid-gap', num(a('gap'), 16) + 'px');
      s.setProperty('--uid-tcols', o.tileCols);
      s.setProperty('--uid-size', num(a('tile-size'), tab ? 40 : 48) + 'px');
      s.setProperty('--uid-tgap', num(a('tile-gap'), tab ? 4 : 8) + 'px');
      s.setProperty('--uid-isize', num(a('icon-size'), tab ? 1.1 : 1.5) + 'rem');
      if (tab) {
        const just = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' };
        s.setProperty('--uid-tcols2', `${cols[1]}fr ${cols[2]}fr`);
        s.setProperty('--uid-tw', has('tab-width') ? num(a('tab-width'), 120) + 'px' : 'auto');
        s.setProperty('--uid-tpad', num(a('tab-padding'), 18) + 'px');
        s.setProperty('--uid-tfs', num(a('tab-font-size'), 1) + 'rem');
        s.setProperty('--uid-tdim', tab === 'underline' ? 1 : Math.min(1, num(a('tab-dim'), 0.75)));
        s.setProperty('--uid-tbar', num(a('tab-bar'), tab === 'pill' ? 0 : 4) + 'px');
        s.setProperty('--uid-tjust', just[a('tab-align')] || 'flex-start');
        s.setProperty('--uid-barc', o.accent);
      }
      s.setProperty('--uid-tile', color(a('tile-color')) || PALETTE.shell);
      s.setProperty('--uid-tile-on', color(a('accent')) || PALETTE.blue);
      s.setProperty('--uid-icon', color(a('icon-color')) || PALETTE.base);

      const wrap = this._wrap = el('div', 'uid-wrap');
      if (has('height')) wrap.style.height = num(a('height'), 0) + 'px';
      if (has('min-height')) wrap.style.minHeight = num(a('min-height'), 0) + 'px';

      const left = el('div', 'uid-col uid-left');
      const tiles = el('div', 'uid-tiles');
      left.append(tiles);
      this._mid = this._makeCol('uid-mid');
      this._right = this._makeCol('uid-right');
      if (tab) {
        this._nav = el('div', 'uid-tabbar');
        this._nav.append(tiles);
        wrap.classList.add('uid-tabs');
        wrap.append(this._mid.col, this._right.col);
      } else {
        wrap.append(left, this._mid.col, this._right.col);
      }

      if (stack) this._buildStack(wrap, a, has);

      this._arrows = {};
      if (has('arrows')) {
        const which = (a('arrows') || 'both').trim();
        s.setProperty('--uid-asize', num(a('arrow-size'), 24) + 'px');
        s.setProperty('--uid-aoff', num(a('arrow-offset'), 16) + 'px');
        s.setProperty('--uid-agap', (has('bordered') ? 0 : num(a('gap'), 16)) + 'px');
        s.setProperty('--uid-acolor', color(a('arrow-color')) || PALETTE.shell);
        s.setProperty('--uid-aon', color(a('arrow-active-color')) || color(a('accent')) || PALETTE.blue);
        [1, 2].forEach(n => {
          if ((which === 'first' && n === 2) || (which === 'second' && n === 1)) return;
          const ar = el('span', 'uid-arrow uid-arrow-' + n);
          const icon = a('arrow-icon');
          if (icon) {
            ar.append(el('i', 'bi ' + (icon.startsWith('bi-') ? icon : 'bi-' + icon)));
          } else {
            const shape = ARROW_SVG[a('arrow-shape')] || ARROW_SVG.arrow;
            ar.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${shape}</svg>`;
          }
          wrap.append(ar);
          this._arrows[n] = ar;
        });
      }

      this._tiles = [];
      let group = null;
      [...this.children].filter(n => n.localName === 'drill-tile').forEach(t => {
        const g = t.getAttribute('group');
        if (g && g !== group && !tab) tiles.append(el('div', 'uid-group', g));
        group = g;
        this._decorateTile(t);
        tiles.append(t);
        this._tiles.push(t);
      });
      this.replaceChildren(...(heading ? [el('div', 'uid-title', heading)] : []), ...(this._nav ? [this._nav] : []), wrap);

      const pickTile = e => e.target.closest('drill-tile');
      tiles.addEventListener('click', e => {
        const t = pickTile(e);
        if (t) this._activate(t, true);
      });
      if (o.trigger === 'hover') {
        tiles.addEventListener('mouseover', e => {
          const t = pickTile(e);
          if (t && t !== this._active) this._activate(t, false);
        });
      }

      [this._mid.body, this._right.body].forEach(body => {
        const pickBtn = e => {
          const b = e.target.closest('[detail]');
          return b && body.contains(b) ? b : null;
        };
        body.addEventListener('click', e => {
          const b = pickBtn(e);
          if (!b) return;
          e.preventDefault();
          this._pressButton(b, true);
        });
        if (o.detailTrigger === 'hover') {
          body.addEventListener('mouseover', e => {
            const b = pickBtn(e);
            if (b && b !== this._detailBtn) this._pressButton(b, false);
          });
        }
      });

      if (o.keyboard) {
        tiles.addEventListener('keydown', e => this._onKey(e, pickTile(e)));
        this.addEventListener('keydown', e => { if (e.key === 'Escape') this._clearRight(); });
      }

      if (stack) {
        this._filterList();
        this._updateCounts();
      }
      this._placeholder(this._mid, o.midPh, o.midTitle.replace('{label}', '').trim());
      this._clearRight();

      const act = a('active');
      const tile = act && this._tiles.find(x => x.getAttribute('source') === act);
      if (tile && !tile.hasAttribute('disabled')) this._select(tile);

      const ad = a('active-detail');
      if (ad) this._openDetail(ad, this._findButton(ad));

      this.setAttribute('data-ready', '');
    }

    _buildStack(wrap, a, has) {
      const s = this.style;
      const o = this._o;
      o.listTitle = a('mid-title') || a('rightup-title') || '';
      o.listEmpty = has('list-empty') ? a('list-empty') : '此分類沒有項目。';
      o.autoOpen = has('auto-open');
      o.markRead = has('mark-read');
      o.tileCount = has('tile-count') ? (a('tile-count') === 'all' ? 'all' : 'unread') : '';
      o.ruTop = a('rightup-label') === 'top';

      let r1 = 'auto', r2 = 'auto';
      if (has('height')) {
        const r = (a('stack-ratio') || '1,1').split(',').map(v => num(v, 1));
        r1 = `minmax(0,${r[0]}fr)`;
        r2 = `minmax(0,${r[1] != null ? r[1] : r[0]}fr)`;
      }
      wrap.classList.add('uid-stack');
      s.setProperty('--uid-srows', `${r1} ${r2}`);
      s.setProperty('--uid-srows2', r1);
      s.setProperty('--uid-rright', 2);

      s.setProperty('--uid-rud', has('rightup-divider') ? divLine(a('rightup-divider') || 'solid') : 'none');
      s.setProperty('--uid-rudc', color(a('rightup-divider-color')) || PALETTE.shell);
      s.setProperty('--uid-rupad', num(a('rightup-padding'), 8) + 'px');
      s.setProperty('--uid-rulw', num(a('rightup-label-width'), 96) + 'px');
      s.setProperty('--uid-rulines', Math.max(1, parseInt(a('rightup-lines'), 10) || 2));

      const ru = this._list = this._makeCol('uid-rightup');
      if (has('rightup-max-height')) ru.col.style.maxHeight = num(a('rightup-max-height'), 0) + 'px';

      const tileEls = [...this.children].filter(n => n.localName === 'drill-tile');
      tileEls.forEach((t, i) => { t._uidKey = t.getAttribute('source') || 'uid-auto-' + i; });

      this._ruItems = [...this.querySelectorAll('rightup-item')].filter(r => {
        const p = r.parentElement;
        if (p === this) return true;
        if (p && p.localName === 'drill-tile' && p.parentElement === this) {
          if (!r.hasAttribute('tile')) r.setAttribute('tile', p._uidKey);
          return true;
        }
        return false;
      });
      this._ruItems.forEach(it => {
        this._decorateRow(it);
        ru.body.append(it);
      });
      this._listMsg = el('div', 'uid-ph');
      ru.body.append(this._listMsg);

      const pickRow = e => e.target.closest('rightup-item[detail]');
      ru.body.addEventListener('click', e => {
        const row = pickRow(e);
        if (row) this._pressButton(row, true);
      });
      if (o.detailTrigger === 'hover') {
        ru.body.addEventListener('mouseover', e => {
          const row = pickRow(e);
          if (row && row !== this._detailBtn) this._pressButton(row, false);
        });
      }

      wrap.insertBefore(ru.col, this._mid.col);
    }

    _decorateRow(it) {
      const ia = n => it.getAttribute(n);
      if (it.hasAttribute('divider')) it.style.setProperty('--uid-rud', divLine(ia('divider') || 'solid'));
      if (ia('color')) it.style.color = color(ia('color'));

      const body = el('div', 'uid-ru-body');
      body.append(...it.childNodes);
      if (ia('align')) body.style.textAlign = ia('align');
      const hasBody = body.children.length || body.textContent.trim();

      const icon = ia('icon') ? el('span', 'uid-ru-icon') : null;
      if (icon) icon.append(el('i', 'bi ' + (ia('icon').startsWith('bi-') ? ia('icon') : 'bi-' + ia('icon'))));
      const label = ia('label') ? el('span', 'uid-ru-label', ia('label')) : null;
      const note = ia('note') ? el('div', 'uid-ru-note', ia('note')) : null;
      let end = null;
      if (ia('meta') || ia('badge')) {
        end = el('span', 'uid-ru-end');
        if (ia('meta')) end.append(el('span', 'uid-ru-meta', ia('meta')));
        if (ia('badge')) end.append(el('span', 'uid-ru-badge', ia('badge')));
      }

      const parts = icon ? [icon] : [];
      if (this._o.ruTop) {
        const box = el('div', 'uid-ru-box');
        if (label || end) {
          const line = el('div', 'uid-ru-line');
          if (label) line.append(label);
          if (end) line.append(end);
          box.append(line);
        }
        if (note) box.append(note);
        if (hasBody) box.append(body);
        parts.push(box);
      } else {
        if (label) parts.push(label);
        const main = el('div', 'uid-ru-main');
        if (note) main.append(note);
        if (hasBody) main.append(body);
        parts.push(main);
        if (end) parts.push(end);
      }
      it.replaceChildren(...parts);
    }

    _filterList() {
      const t = this._active;
      const key = t ? t._uidKey : null;
      let last = null;
      let count = 0;
      this._ruItems.forEach(it => {
        const tl = it.getAttribute('tile');
        const show = !tl || (key != null && tl.split(',').map(x => x.trim()).includes(key));
        it.hidden = !show;
        it.removeAttribute('data-last');
        if (show) { last = it; count++; }
      });
      if (last) last.setAttribute('data-last', '');

      this._list.head.textContent = this._o.listTitle.replace('{label}', t ? (t.getAttribute('label') || '') : '').trim();
      const msg = t ? this._o.listEmpty : this._o.midPh;
      this._listMsg.textContent = msg || '';
      this._listMsg.hidden = count > 0 || !msg;
    }

    _updateCounts() {
      if (!this._o.tileCount) return;
      this._tiles.forEach(t => {
        if (t.hasAttribute('badge')) return;
        const key = t._uidKey;
        const n = this._ruItems.filter(r => {
          const tl = r.getAttribute('tile');
          return tl && tl.split(',').map(x => x.trim()).includes(key)
            && (this._o.tileCount === 'all' || r.hasAttribute('unread'));
        }).length;
        const box = t.querySelector('.uid-box');
        let b = box.querySelector('.uid-badge');
        if (!n) { if (b) b.remove(); return; }
        if (!b) { b = el('span', 'uid-badge'); box.append(b); }
        b.textContent = n;
      });
    }

    _makeCol(cls) {
      const col = el('div', 'uid-col ' + cls);
      const head = el('div', 'uid-head');
      const body = el('div', 'uid-body');
      col.append(head, body);
      return { col, head, body };
    }

    _decorateTile(t) {
      const o = this._o;
      const ta = n => t.getAttribute(n);

      const box = el('span', 'uid-box');
      const icon = ta('icon');
      if (icon) {
        const i = el('i', 'bi ' + (icon.startsWith('bi-') ? icon : 'bi-' + icon));
        box.append(i);
      }
      const label = ta('label') || '';
      if (o.tab && label) box.append(el('span', 'uid-tablabel', label));
      if (ta('badge')) box.append(el('span', 'uid-badge', ta('badge')));
      t.replaceChildren(box);

      if (!o.tab && o.tileLabel === 'below' && label) t.append(el('span', 'uid-label', label));

      const tip = ta('tooltip') || (!o.tab && o.tileLabel === 'tooltip' ? label : '');
      if (tip) t.title = tip;

      if (ta('size')) t.style.setProperty('--uid-size', num(ta('size'), 48) + 'px');
      if (ta('color')) t.style.setProperty('--uid-tile', color(ta('color')));
      t._uidOn = color(ta('active-color')) || (o.tab && color(ta('color'))) || o.accent;
      if (ta('active-color') || (o.tab && ta('color'))) t.style.setProperty('--uid-tile-on', t._uidOn);
      if (ta('icon-color')) t.style.setProperty('--uid-icon', color(ta('icon-color')));

      if (o.keyboard && !t.hasAttribute('disabled')) t.tabIndex = 0;
    }

    _activate(t, isClick) {
      if (t.hasAttribute('disabled')) return;

      const href = t.getAttribute('href');
      if (href) {
        if (isClick) {
          const target = t.getAttribute('target');
          target ? window.open(href, target) : (location.href = href);
        }
        return;
      }

      if (t === this._active) {
        if (isClick && this._o.toggle) this._reset();
        return;
      }
      this._select(t);
    }

    _select(t) {
      this._tiles.forEach(x => x.toggleAttribute('data-active', x === t));
      this._active = t;
      this._arrowOn(1, true);
      if (this._nav) this._nav.style.setProperty('--uid-barc', t._uidOn);

      if (this._o.layout === 'stack') {
        this._filterList();
        this._clearRight();
        const d = t.getAttribute('detail');
        if (d) {
          this._openDetail(d, this._findButton(d));
        } else if (this._o.autoOpen) {
          const row = this._ruItems.find(r => !r.hidden && r.hasAttribute('detail') && !r.hasAttribute('disabled'));
          if (row) this._openDetail(row.getAttribute('detail'), row);
        }
        return;
      }

      const label = t.getAttribute('label') || '';
      const src = t.getAttribute('source');
      this._fill(this._mid, src, this._o.midTitle.replace('{label}', label), src ? '' : '此方塊未設定 source 屬性。');
      this._decorateButtons(this._mid.body);
      this._clearRight();

      const d = t.getAttribute('detail');
      if (d) this._openDetail(d, this._findButton(d));
    }

    _reset() {
      this._tiles.forEach(x => x.removeAttribute('data-active'));
      this._active = null;
      this._arrowOn(1, false);
      if (this._nav) this._nav.style.setProperty('--uid-barc', this._o.accent);
      this._placeholder(this._mid, this._o.midPh, this._o.midTitle.replace('{label}', '').trim());
      if (this._o.layout === 'stack') this._filterList();
      this._clearRight();
    }

    _decorateButtons(root) {
      root.querySelectorAll('[detail]').forEach(b => {
        if (b.localName === 'button' && !b.hasAttribute('type')) b.type = 'button';
        if (b.classList.contains('uid-btn')) return;
        // 使用者自己套了 Bootstrap 按鈕樣式就不覆蓋
        if ([...b.classList].some(c => c === 'btn' || c.startsWith('btn-'))) return;
        const v = b.getAttribute('color') || b.getAttribute('variant') || this._o.variant;
        b.classList.add('uid-btn');
        if (PALETTE[v]) {
          b.classList.add('uid-v-' + v);
        } else {
          b.style.background = color(v);
          b.style.color = PALETTE.base;
        }
      });
    }

    _findButton(id) {
      const root = this._o.layout === 'stack' ? this._list.body : this._mid.body;
      return [...root.querySelectorAll('[detail]')].find(b => !b.hidden && b.getAttribute('detail') === id) || null;
    }

    _pressButton(b, isClick) {
      if (b.disabled || b.hasAttribute('disabled')) return;
      if (b === this._detailBtn) {
        if (isClick && b.hasAttribute('toggle')) this._clearRight();
        return;
      }
      this._openDetail(b.getAttribute('detail'), b);
    }

    _setBtnOn(b, on) {
      if (!b) return;
      b.classList.toggle('uid-on', on);
      if (b.classList.contains('btn')) b.classList.toggle('active', on);
    }

    _openDetail(id, btn) {
      this._setBtnOn(this._detailBtn, false);
      this._detailBtn = btn;
      this._setBtnOn(btn, true);

      const btnLabel = btn ? (btn.getAttribute('label') || btn.textContent.trim()) : '';
      const title = btn && btn.hasAttribute('detail-title')
        ? btn.getAttribute('detail-title')
        : this._o.rightTitle.replace('{label}', btnLabel);
      if (btn && btn.localName === 'rightup-item' && this._o.markRead && btn.hasAttribute('unread')) {
        btn.removeAttribute('unread');
        this._updateCounts();
      }
      this._wrap.classList.remove('uid-noright');
      this._arrowOn(2, true);
      this._fill(this._right, id, title);
      this._decorateButtons(this._right.body);
    }

    /* 欄位有內容時，前方箭頭改用啟用色 */
    _arrowOn(n, on) {
      const ar = this._arrows && this._arrows[n];
      if (ar) ar.toggleAttribute('data-on', on);
    }

    _clearRight() {
      this._setBtnOn(this._detailBtn, false);
      this._detailBtn = null;
      this._arrowOn(2, false);

      // stack：尚未點清單時，下方顯示方塊 source 的內容（例如資料夾說明）
      const t = this._active;
      const src = this._o.layout === 'stack' && t && t.getAttribute('source');
      if (src && document.getElementById(src)) {
        this._fill(this._right, src, this._o.rightTitle.replace('{label}', t.getAttribute('label') || ''));
        this._decorateButtons(this._right.body);
        this._wrap.classList.remove('uid-noright');
        return;
      }
      this._placeholder(this._right, this._o.rightPh, this._o.rightTitle.replace('{label}', '').trim());
      if (this._o.hideEmptyRight) this._wrap.classList.add('uid-noright');
    }

    _fill(part, id, title, missingMsg) {
      part.head.textContent = title || '';
      const src = id ? document.getElementById(id) : null;

      if (!src) {
        const box = el('div', 'alert alert-danger uid-alert', missingMsg || `找不到 id 為「${id}」的內容。`);
        part.body.replaceChildren(box);
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
      part.body.replaceChildren(...(text ? [el('div', 'uid-ph', text)] : []));
    }

    _onKey(e, t) {
      if (!t) return;
      const list = this._tiles;
      const cols = this._o.tab ? list.length : this._o.tileCols;
      const steps = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._activate(t, true);
        return;
      }

      let j;
      if (e.key === 'Home') j = list.findIndex(x => !x.hasAttribute('disabled'));
      else if (e.key === 'End') j = list.length - 1 - [...list].reverse().findIndex(x => !x.hasAttribute('disabled'));
      else if (steps[e.key]) {
        const step = steps[e.key];
        j = list.indexOf(t) + step;
        while (j >= 0 && j < list.length && list[j].hasAttribute('disabled')) j += step;
        if (j < 0 || j >= list.length) { e.preventDefault(); return; }
      } else return;

      e.preventDefault();
      if (list[j]) list[j].focus();
    }
  }

  customElements.define('ui-drill', UiDrill);
})();
/* ── 色名標籤 <c-blue>、<c-key> 等：所有元件共用同一份，頁面上只注入一次 ── */
(function () {
  'use strict';
  if (typeof document === 'undefined' || document.getElementById('ui-color-tags')) return;
  var COLORS = { shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', orange:'#FFA987', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', 'key-deep':'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#DE8EC9' };
  var css = [];
  Object.keys(COLORS).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[k] + '}'); });
  var s = document.createElement('style'); s.id = 'ui-color-tags'; s.textContent = css.join('\n');
  (document.head || document.documentElement).appendChild(s);
  if (typeof window !== 'undefined' && !window.UiColorTags) { window.UiColorTags = { colors: COLORS }; }
})();
