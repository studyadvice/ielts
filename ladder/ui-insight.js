(() => {
  if (customElements.get('ui-insight')) return;

  /* 品牌色名稱對照：顏色屬性可直接填名稱（不分大小寫） */
  const COLOR_NAMES = {
    base: '#0C0D0C',
    shell: '#C6C7BD',
    vanilla: '#DBEDD8',
    yellow: '#E3D322',
    indigo: '#778CE1',
    pink: '#FF91D7',
    /* 新色票 */
    red: '#EF6661',
    green: '#71CD76',
    blue: '#5DBAE8',
    violet: '#B484E8',
    gray: '#86877F',
    /* 新增色 */
    key: '#51DBCF',
    calm: '#A3C4BC',
    quiet: '#8EA4DE',
    playful: '#FFA987',
    urgent: '#FF2E63',
    energetic: '#B6FF00',
    dreamy: '#DE8EC9',
    'bg-alternative': '#3B2A20'
  };

  /* CSS_ATTRS 之中屬於顏色的屬性，值會先經過品牌色名稱轉換 */
  const COLOR_ATTRS = new Set([
    'bg', 'border-color',
    'card-bg', 'card-border', 'card-hover-border', 'card-active-border',
    'heading-color', 'sentence-color', 'num-bg', 'num-color', 'num-active-bg', 'num-active-color',
    'hl-line-color', 'hl-hot-bg', 'hl-hot-color', 'sup-color',
    'panel-bg', 'summary-color', 'note-num-bg', 'note-num-color', 'note-word-color',
    'note-text-color', 'note-divider-color', 'note-hot-bg',
    'tag-text-color', 'tag-default-bg', 'empty-color',
    'ini-title-color', 'ini-title-bg',
    'extra-bg', 'extra-color', 'extra-border-color'
  ]);

  const resolveColor = (v) => {
    if (typeof v !== 'string') return v;
    const key = v.trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(COLOR_NAMES, key) ? COLOR_NAMES[key] : v;
  };

  /* 主題：只列出與預設不同的顏色屬性，值可用品牌色名稱。
   * default 為空物件，代表完全使用 CSS_ATTRS 的內建預設。 */
  const accentTheme = (a, on = 'base') => ({
    'border-color': a,
    'card-active-border': a,
    'heading-color': a,
    'num-active-bg': a,
    'num-active-color': on,
    'hl-line-color': a,
    'hl-hot-bg': a,
    'hl-hot-color': on,
    'sup-color': a,
    'note-num-bg': a,
    'note-num-color': on,
    'note-word-color': a,
    'tag-default-bg': a,
    'tag-text-color': on,
    'ini-title-color': a,
    'extra-border-color': a
  });

  const THEMES = {
    default: {},
    yellow: accentTheme('yellow'),
    pink: accentTheme('pink'),
    indigo: accentTheme('indigo'),
    /* 新色票 */
    red: accentTheme('red'),
    green: accentTheme('green'),
    blue: accentTheme('blue'),
    violet: accentTheme('violet'),
    gray: accentTheme('gray'),
    vanilla: accentTheme('vanilla'),
    shell: accentTheme('shell'),
    key: accentTheme('key'),
    calm: accentTheme('calm'),
    quiet: accentTheme('quiet'),
    playful: accentTheme('playful'),
    urgent: accentTheme('urgent'),
    energetic: accentTheme('energetic'),
    dreamy: accentTheme('dreamy')
  };

  /* 內建標籤：tag="lr" 等簡寫會轉成中文文字與預設顏色 */
  const TAGS = {
    lr: { text: '詞彙', color: '#71CD76' },
    gra: { text: '文法', color: '#B484E8' },
    fc: { text: '連貫', color: '#5DBAE8' },
    p: { text: '發音', color: '#FFA987' }
  };

  /* 會轉成 CSS 變數的屬性與預設值 */
  const CSS_ATTRS = {
    'margin': '6px 12px',
    'padding': '6px 12px',
    'bg': '#0C0D0C',
    'border-color': '#C6C7BD',
    'border-width': '1px',
    'border-radius': '12px',
    'split': '55%',
    'column-gap': '20px',

    'card-gap': '10px',
    'card-padding': '12px 14px',
    'card-bg': '#161816',
    'card-border': '#2A2B29',
    'card-hover-border': '#5A5B56',
    'card-active-border': '#5DBAE8',
    'card-radius': '8px',
    'heading-font-size': '0.75rem',
    'heading-color': '#B484E8',
    'sentence-font-size': '1rem',
    'sentence-color': '#C6C7BD',
    'sentence-line-height': '2.1',
    'num-bg': '#2A2B29',
    'num-color': '#C6C7BD',
    'num-active-bg': '#5DBAE8',
    'num-active-color': '#0C0D0C',

    'hl-line-color': '#71CD76',
    'hl-line-style': 'solid',
    'hl-line-width': '2px',
    'hl-hot-bg': '#71CD76',
    'hl-hot-color': '#0C0D0C',
    'sup-font-size': '0.625rem',
    'sup-color': '#71CD76',

    'panel-bg': '#161816',
    'panel-padding': '14px 16px',
    'panel-radius': '8px',
    'panel-top': '12px',
    'summary-font-size': '0.75rem',
    'summary-color': '#C6C7BD',
    'note-num-bg': '#71CD76',
    'note-num-color': '#0C0D0C',
    'note-word-size': '0.95rem',
    'note-word-color': '#71CD76',
    'note-text-size': '0.82rem',
    'note-text-color': '#C6C7BD',
    'note-divider-style': 'dashed',
    'note-divider-width': '1px',
    'note-divider-color': '#2A2B29',
    'note-hot-bg': '#222522',
    'tag-font-size': '0.6875rem',
    'tag-text-color': '#0C0D0C',
    'tag-default-bg': '#FF91D7',
    'empty-color': '#C6C7BD',

    'ini-title-size': '1rem',
    'ini-title-color': '#5DBAE8',
    'ini-title-bg': '#161816',

    'extra-bg': '#1E201E',
    'extra-color': '#C6C7BD',
    'extra-border-color': '#5DBAE8',
    'extra-font-size': '0.85rem',
    'extra-padding': '10px 12px',
    'extra-radius': '6px',
    'extra-top': '12px',
    'extra-col-gap': '16px',
    'extra-row-gap': '6px'
  };

  /* 其他屬性（開關與文字） */
  const OPT_ATTRS = {
    'theme': 'default',
    'border': 'false',
    'show-num': 'true',
    'show-sup': 'true',
    'show-summary': 'true',
    'panel-sticky': 'true',
    'summary-text': '第 {n} 句，共 {count} 個亮點',
    'empty-text': '這一句沒有標記亮點。',
    'start': '1',
    'ini-title': '點擊展開',
    'keyboard': 'true',
    'extra-info-style': 'outline',
    'extra-info-label': '補充',
    'extra-info-split': 'true',
    'extra-info-cols': '',
    'extra-info-col-divider': 'none'
  };

  const EXTRA_STYLES = ['outline', 'dashed', 'divider', 'label'];

  const STYLE = `
ui-insight{display:block;box-sizing:border-box;margin:var(--uin-margin);padding:var(--uin-padding);background:var(--uin-bg);border:var(--uin-border-line);border-radius:var(--uin-border-radius);color:var(--uin-sentence-color)}
ui-insight *{box-sizing:border-box}
ui-insight:not([data-uin-ready]) > *{display:none}
ui-insight:focus,ui-insight:focus-visible{outline:none}
ui-insight .uin-wrap{display:grid;grid-template-columns:minmax(0,var(--uin-split)) minmax(0,1fr);gap:var(--uin-column-gap);align-items:start}
ui-insight .uin-list{display:flex;flex-direction:column;gap:var(--uin-card-gap)}
ui-insight .uin-card{background:var(--uin-card-bg);border:1px solid var(--uin-card-border);border-radius:var(--uin-card-radius);padding:var(--uin-card-padding);cursor:pointer;transition:border-color .2s}
ui-insight .uin-card:hover{border-color:var(--uin-card-hover-border)}
ui-insight .uin-card.is-on{border-color:var(--uin-card-active-border)}
ui-insight .uin-heading{font-size:var(--uin-heading-font-size);color:var(--uin-heading-color);margin:0 0 4px 0;line-height:1.5}
ui-insight .uin-sentence{font-size:var(--uin-sentence-font-size);color:var(--uin-sentence-color);line-height:var(--uin-sentence-line-height)}
ui-insight .uin-num{display:inline-block;width:1.4em;height:1.4em;line-height:1.4em;border-radius:50%;background:var(--uin-num-bg);color:var(--uin-num-color);font-size:0.75em;text-align:center;margin:0 8px 0 0;vertical-align:0.1em;transition:all .2s}
ui-insight .uin-card.is-on .uin-num{background:var(--uin-num-active-bg);color:var(--uin-num-active-color)}
ui-insight .uin-hl{border-bottom:var(--uin-hl-line-width) var(--uin-hl-line-style) transparent;transition:background .2s,color .2s,border-color .2s;border-radius:3px}
ui-insight .uin-card.is-on .uin-hl{border-bottom-color:var(--uin-hl-line-color)}
ui-insight .uin-card.is-on .uin-hl.is-hot{background:var(--uin-hl-hot-bg);color:var(--uin-hl-hot-color)}
ui-insight .uin-hl sup{font-size:var(--uin-sup-font-size);color:var(--uin-sup-color);margin:0 0 0 2px}
ui-insight .uin-card.is-on .uin-hl.is-hot sup{color:var(--uin-hl-hot-color)}
ui-insight .uin-panel{background:var(--uin-panel-bg);border-radius:var(--uin-panel-radius);padding:var(--uin-panel-padding)}
ui-insight.uin-sticky .uin-panel{position:sticky;top:var(--uin-panel-top)}
ui-insight .uin-summary{font-size:var(--uin-summary-font-size);color:var(--uin-summary-color);margin:0 0 8px 0}
ui-insight .uin-note{display:flex;gap:10px;padding:10px 8px;border-radius:6px;transition:background .2s;cursor:default}
ui-insight .uin-note + .uin-note{border-top:var(--uin-note-divider-width) var(--uin-note-divider-style) var(--uin-note-divider-color)}
ui-insight .uin-note.is-hot{background:var(--uin-note-hot-bg)}
ui-insight .uin-nn{flex-shrink:0;width:1.6em;height:1.6em;line-height:1.6em;border-radius:50%;background:var(--uin-note-num-bg);color:var(--uin-note-num-color);font-size:0.6875rem;text-align:center;margin:2px 0 0 0}
ui-insight .uin-word{font-size:var(--uin-note-word-size);color:var(--uin-note-word-color);font-weight:600}
ui-insight .uin-tag{display:inline-block;font-size:var(--uin-tag-font-size);color:var(--uin-tag-text-color);border-radius:999px;padding:0 8px;margin:0 0 0 8px;vertical-align:0.15em;line-height:1.6}
ui-insight .uin-why{font-size:var(--uin-note-text-size);color:var(--uin-note-text-color);line-height:1.7;margin:2px 0 0 0}
ui-insight .uin-empty{font-size:var(--uin-note-text-size);color:var(--uin-empty-color);padding:6px 8px}
ui-insight .uin-in{animation:uin-fade .3s ease}
@keyframes uin-fade{from{opacity:.2;transform:translateY(4px)}to{opacity:1;transform:none}}
ui-insight .uin-head{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;background:var(--uin-ini-title-bg);color:var(--uin-ini-title-color);font-size:var(--uin-ini-title-size);border-radius:8px;padding:10px 14px}
ui-insight .uin-head:hover{filter:brightness(1.15)}
ui-insight .uin-head .uin-head-text{flex:1}
ui-insight .uin-head .uin-chev{transition:transform .25s}
ui-insight.uin-open .uin-head .uin-chev{transform:rotate(180deg)}
ui-insight.uin-collapsible.uin-open .uin-wrap{margin:14px 0 0 0;animation:uin-fade .3s ease}
ui-insight.uin-collapsible:not(.uin-open) .uin-wrap{display:none}
ui-insight .uin-extra{position:relative;margin:var(--uin-extra-top) 0 0 0;padding:var(--uin-extra-padding);background:var(--uin-extra-bg);color:var(--uin-extra-color);font-size:var(--uin-extra-font-size);border:1px solid var(--uin-extra-border-color);border-radius:var(--uin-extra-radius);line-height:1.7}
ui-insight .uin-extra[hidden]{display:none}
ui-insight .uin-extra-body > :last-child{margin-bottom:0}
ui-insight .uin-extra[data-style="dashed"]{border-style:dashed;background:transparent}
ui-insight .uin-extra[data-style="divider"]{border-width:1px 0 0 0;border-radius:0;background:transparent;padding:10px 2px 0 2px}
ui-insight .uin-extra[data-style="label"]{margin:calc(var(--uin-extra-top) + 8px) 0 0 0;padding-top:16px}
ui-insight .uin-cols{display:grid;column-gap:var(--uin-extra-col-gap);row-gap:var(--uin-extra-row-gap);margin:0 0 6px 0}
ui-insight .uin-cols:last-child{margin-bottom:0}
ui-insight .uin-col{min-width:0}
ui-insight .uin-cols[data-divider] .uin-col:not(.is-first){border-left:1px var(--uin-col-divider) var(--uin-extra-border-color);padding-left:var(--uin-extra-col-gap)}
ui-insight .uin-extra-label{position:absolute;top:-0.8em;left:10px;padding:0 8px;font-size:0.7rem;line-height:1.6;color:var(--uin-extra-border-color);background:var(--uin-panel-bg);border:1px solid var(--uin-extra-border-color);border-radius:999px;font-weight:600}
ui-insight.uin-kbd-active .uin-card.is-on{outline:2px solid var(--uin-card-active-border);outline-offset:3px}
`;

  if (!document.getElementById('ui-insight-style')) {
    const s = document.createElement('style');
    s.id = 'ui-insight-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  /* 鍵盤：Ctrl+Shift+上下方向鍵，作用於最近一次被游標指到、點擊或取得焦點的元件 */
  let activeInsight = null;
  document.addEventListener('keydown', (e) => {
    if (!e.ctrlKey || !e.shiftKey || e.altKey || e.metaKey) return;
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const ae = document.activeElement;
    const inside = ae && ae.closest ? ae.closest('ui-insight') : null;
    const editing = ae && (ae.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName));
    if (editing && !inside) return;
    const target = activeInsight || inside;
    if (!target || !target.isConnected || typeof target._keyMove !== 'function') return;
    if (target._keyMove(e.key === 'ArrowUp' ? 'up' : 'down')) e.preventDefault();
  });

  /* ── extra-info 快速分欄：template 內用 | 分欄，\| 為字面上的直線 ── */
  const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER']);
  const KEEP_TAGS = new Set(['UL', 'OL', 'TABLE', 'PRE', 'HR', 'DL', 'FIGURE', 'IMG']);
  const escHtml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const hasBar = (t) => /(^|[^\\])\|/.test(t);

  /* 依 | 切開 HTML 字串，略過標籤內的字元；\| 保留為 | */
  function splitBars(html) {
    const parts = [];
    let cur = '', inTag = false;
    for (let i = 0; i < html.length; i++) {
      const ch = html[i];
      if (ch === '<') inTag = true;
      else if (ch === '>') inTag = false;
      if (!inTag && ch === '\\' && html[i + 1] === '|') { cur += '|'; i++; continue; }
      if (!inTag && ch === '|') { parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    parts.push(cur);
    return parts.map((x) => x.trim());
  }

  /* 只把 \| 還原成 |（沒有真正分欄時使用） */
  function unescapeBars(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) if (w.currentNode.data.indexOf('\\|') !== -1) w.currentNode.data = w.currentNode.data.replace(/\\\|/g, '|');
  }

  /* 把容器內容依「行」整理：文字換行或區塊元素各算一行；含 | 的行變成一列，連續的列共用一個 grid，欄位上下對齊 */
  function applyColumns(root, cols, divider) {
    if (!hasBar(root.textContent)) { unescapeBars(root); return; }
    const lines = [];
    let buf = '';
    const flush = () => { if (buf.trim()) lines.push({ html: buf, inline: true }); buf = ''; };
    [...root.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const segs = n.data.split(/\r?\n/);
        segs.forEach((seg, k) => { if (k > 0) flush(); buf += escHtml(seg); });
      } else if (n.nodeType === 1) {
        if (BLOCK_TAGS.has(n.tagName) && hasBar(n.textContent)) { flush(); lines.push({ html: n.innerHTML, block: n }); }
        else if (BLOCK_TAGS.has(n.tagName) || KEEP_TAGS.has(n.tagName)) { flush(); lines.push({ node: n }); }
        else buf += n.outerHTML;
      }
    });
    flush();

    const out = document.createDocumentFragment();
    let grid = null, plain = [];
    const endPlain = () => {
      if (!plain.length) return;
      const d = document.createElement('div');
      d.innerHTML = plain.join('\n');
      unescapeBars(d);
      out.appendChild(d);
      plain = [];
    };
    const endGrid = () => {
      if (!grid) return;
      const n = Math.max(...grid.rows.map((r) => r.length));
      const g = document.createElement('div');
      g.className = 'uin-cols';
      g.style.gridTemplateColumns = cols || `repeat(${n}, minmax(0, 1fr))`;
      if (divider && divider !== 'none') { g.dataset.divider = ''; g.style.setProperty('--uin-col-divider', divider); }
      grid.rows.forEach((cells) => {
        cells.forEach((c, i) => {
          const cell = document.createElement('div');
          cell.className = 'uin-col' + (i === 0 ? ' is-first' : '');
          cell.innerHTML = c;
          if (i === cells.length - 1 && cells.length < n) cell.style.gridColumn = `span ${n - cells.length + 1}`;
          g.appendChild(cell);
        });
      });
      out.appendChild(g);
      grid = null;
    };
    lines.forEach((ln) => {
      if (ln.node) { endPlain(); endGrid(); unescapeBars(ln.node); out.appendChild(ln.node); return; }
      if (hasBar(ln.html.replace(/<[^>]*>/g, ''))) {
        endPlain();
        if (!grid) grid = { rows: [] };
        grid.rows.push(splitBars(ln.html));
      } else {
        endGrid();
        if (ln.block) { const b = ln.block; b.innerHTML = ln.html; unescapeBars(b); endPlain(); out.appendChild(b); }
        else plain.push(ln.html);
      }
    });
    endPlain();
    endGrid();
    while (root.firstChild) root.removeChild(root.firstChild);
    root.appendChild(out);
  }

  const trimWord = (t) => t.replace(/\s+/g, ' ').trim().replace(/[\s,.;:!?，。；：！？、]+$/u, '');

  class UiInsight extends HTMLElement {
    static get observedAttributes() {
      return [...Object.keys(CSS_ATTRS), ...Object.keys(OPT_ATTRS), 'ini-collapse'];
    }

    constructor() {
      super();
      this._lines = null;
      this._cur = 0;
      this._ready = false;
      this._open = true;
    }

    connectedCallback() {
      if (this._ready) return;
      const init = () => this._init();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
      } else {
        init();
      }
    }

    attributeChangedCallback(name) {
      if (!this._ready) return;
      if (name === 'ini-collapse') this._open = !this._collapsible();
      this._applyVars();
      this._build();
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

    _collapsible() {
      const v = this.getAttribute('ini-collapse');
      return v !== null && v.toLowerCase() !== 'false';
    }

    _init() {
      if (this._ready) return;
      const lines = [...this.querySelectorAll(':scope > ins-line')];
      this._lines = lines.map((line) => {
        const clone = line.cloneNode(true);
        const notes = [];
        [...clone.querySelectorAll('hl')].forEach((h, i) => {
          const n = i + 1;
          notes.push({
            word: h.getAttribute('word') || trimWord(h.textContent),
            why: h.getAttribute('why') || '',
            tag: h.getAttribute('tag') || '',
            tagColor: h.getAttribute('tag-color') || ''
          });
          const span = document.createElement('span');
          span.className = 'uin-hl';
          span.dataset.n = n;
          span.innerHTML = `${h.innerHTML}<sup class="uin-sup">${n}</sup>`;
          h.replaceWith(span);
        });
        return {
          heading: line.getAttribute('heading') || '',
          extra: (line.getAttribute('extra-info') || '').trim(),
          extraStyle: (line.getAttribute('extra-info-style') || '').trim().toLowerCase(),
          extraLabel: line.getAttribute('extra-info-label'),
          html: clone.innerHTML.trim(),
          notes
        };
      });

      this.innerHTML = '';
      this.setAttribute('data-uin-ready', '');
      if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
      this._open = !this._collapsible();
      const start = parseInt(this._opt('start'), 10);
      this._cur = Math.min(Math.max((isNaN(start) ? 1 : start) - 1, 0), Math.max(this._lines.length - 1, 0));

      const mark = () => { activeInsight = this; };
      this.addEventListener('pointerenter', mark);
      this.addEventListener('focusin', mark);
      this.addEventListener('pointerdown', () => {
        mark();
        this.classList.remove('uin-kbd-active');
      });

      this._ready = true;
      this._applyVars();
      this._build();
    }

    _applyVars() {
      const st = this.style;
      Object.keys(CSS_ATTRS).forEach((k) => st.setProperty(`--uin-${k}`, this._css(k)));
      st.setProperty('--uin-border-line',
        this._bool('border') ? `${this._css('border-width')} solid ${this._css('border-color')}` : 'none');
      this.classList.toggle('uin-sticky', this._bool('panel-sticky'));
    }

    _build() {
      const coll = this._collapsible();
      this.classList.toggle('uin-collapsible', coll);
      this.classList.toggle('uin-open', this._open);

      this.innerHTML = `
        ${coll ? `<div class="uin-head">
          <i class="bi bi-lightbulb"></i>
          <span class="uin-head-text">${this._opt('ini-title')}</span>
          <i class="bi bi-chevron-down uin-chev"></i>
        </div>` : ''}
        <div class="uin-wrap">
          <div class="uin-list"></div>
          <div class="uin-panel">
            ${this._bool('show-summary') ? '<p class="uin-summary"></p>' : ''}
            <div class="uin-notes"></div>
            <div class="uin-extra" hidden></div>
          </div>
        </div>`;

      const list = this.querySelector('.uin-list');
      const showNum = this._bool('show-num');
      const showSup = this._bool('show-sup');

      (this._lines || []).forEach((ln, i) => {
        const card = document.createElement('div');
        card.className = 'uin-card';
        card.innerHTML =
          (ln.heading ? `<div class="uin-heading">${ln.heading}</div>` : '') +
          `<div class="uin-sentence">${showNum ? `<span class="uin-num">${i + 1}</span>` : ''}${ln.html}</div>`;
        if (!showSup) card.querySelectorAll('.uin-sup').forEach((s) => s.remove());
        card.addEventListener('click', (e) => {
          const h = e.target.closest('.uin-hl');
          this.go(i + 1);
          if (h) this._hot(h.dataset.n);
        });
        card.querySelectorAll('.uin-hl').forEach((h) => {
          h.addEventListener('mouseenter', () => { if (this._cur === i) this._hot(h.dataset.n); });
          h.addEventListener('mouseleave', () => { if (this._cur === i) this._hot(null); });
        });
        list.appendChild(card);
      });

      const hd = this.querySelector('.uin-head');
      if (hd) hd.addEventListener('click', () => this.toggle());

      this._render(false);
    }

    _tagHtml(nt) {
      if (!nt.tag) return '';
      const preset = TAGS[nt.tag.toLowerCase()];
      const text = preset ? preset.text : nt.tag;
      const bg = resolveColor(nt.tagColor) || (preset ? preset.color : this._css('tag-default-bg'));
      return `<span class="uin-tag" style="background:${bg}">${text}</span>`;
    }

    _render(animate = true) {
      const lines = this._lines || [];
      if (!lines.length) return;
      const ln = lines[this._cur];

      [...this.querySelectorAll('.uin-card')].forEach((c, i) => c.classList.toggle('is-on', i === this._cur));

      const sm = this.querySelector('.uin-summary');
      if (sm) {
        sm.textContent = this._opt('summary-text')
          .replace(/\{n\}/g, this._cur + 1)
          .replace(/\{total\}/g, lines.length)
          .replace(/\{count\}/g, ln.notes.length);
      }

      const box = this.querySelector('.uin-notes');
      box.innerHTML = ln.notes.length
        ? ln.notes.map((nt, j) => `
          <div class="uin-note" data-n="${j + 1}">
            <span class="uin-nn">${j + 1}</span>
            <div>
              <span class="uin-word">${nt.word}</span>${this._tagHtml(nt)}
              <div class="uin-why">${nt.why}</div>
            </div>
          </div>`).join('')
        : `<div class="uin-empty">${this._opt('empty-text')}</div>`;

      const ex = this.querySelector('.uin-extra');
      if (ex) {
        ex.innerHTML = '';
        const src = ln.extra ? document.getElementById(ln.extra) : null;
        ex.hidden = !src;
        if (src) {
          let style = ln.extraStyle || this._opt('extra-info-style').trim().toLowerCase();
          if (!EXTRA_STYLES.includes(style)) style = 'outline';
          ex.dataset.style = style;
          if (style === 'label') {
            const lb = document.createElement('span');
            lb.className = 'uin-extra-label';
            lb.textContent = ln.extraLabel !== null && ln.extraLabel !== '' ? ln.extraLabel : this._opt('extra-info-label');
            ex.appendChild(lb);
          }
          const body = document.createElement('div');
          body.className = 'uin-extra-body';
          if (src instanceof HTMLTemplateElement) body.appendChild(src.content.cloneNode(true));
          else body.innerHTML = src.innerHTML;
          /* 快速分欄：template 上的 split、cols、col-divider 優先於元件屬性 */
          const sp = (src.getAttribute('split') || this._opt('extra-info-split')).trim().toLowerCase();
          if (sp !== 'false' && src instanceof HTMLTemplateElement) {
            const cols = (src.getAttribute('cols') || this._opt('extra-info-cols')).trim();
            const div = (src.getAttribute('col-divider') || this._opt('extra-info-col-divider')).trim().toLowerCase();
            applyColumns(body, cols, div);
          }
          ex.appendChild(body);
        }
      }

      box.querySelectorAll('.uin-note').forEach((nd) => {
        nd.addEventListener('mouseenter', () => this._hot(nd.dataset.n));
        nd.addEventListener('mouseleave', () => this._hot(null));
      });

      if (animate) {
        [box, ex].forEach((el) => {
          if (!el) return;
          el.classList.remove('uin-in');
          void el.offsetWidth;
          el.classList.add('uin-in');
        });
      }
    }

    _hot(n) {
      const card = this.querySelectorAll('.uin-card')[this._cur];
      if (card) card.querySelectorAll('.uin-hl').forEach((h) => h.classList.toggle('is-hot', h.dataset.n === n));
      this.querySelectorAll('.uin-note').forEach((nd) => nd.classList.toggle('is-hot', nd.dataset.n === n));
    }

    _keyMove(dir) {
      if (!this._bool('keyboard')) return false;
      if (this._collapsible() && !this._open) return false;
      if (dir === 'down') this.next(); else this.prev();
      this.classList.add('uin-kbd-active');
      const card = this.querySelectorAll('.uin-card')[this._cur];
      if (card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return true;
    }

    /* 公開方法 */
    get current() { return this._cur + 1; }
    get total() { return (this._lines || []).length; }
    get isOpen() { return this._open; }

    go(n) {
      const total = this.total;
      if (!total) return;
      const idx = Math.min(Math.max(n - 1, 0), total - 1);
      if (idx === this._cur) return;
      this._cur = idx;
      this._render(true);
      this.dispatchEvent(new CustomEvent('insight-change', {
        bubbles: true,
        detail: { index: idx + 1, total, count: this._lines[idx].notes.length }
      }));
    }

    next() { this.go(this._cur + 2); }
    prev() { this.go(this._cur); }

    open() { this._setOpen(true); }
    close() { this._setOpen(false); }
    toggle() { this._setOpen(!this._open); }

    _setOpen(v) {
      if (!this._collapsible() || this._open === v) return;
      this._open = v;
      this.classList.toggle('uin-open', v);
      this.dispatchEvent(new CustomEvent('insight-toggle', { bubbles: true, detail: { open: v } }));
    }
  }

  customElements.define('ui-insight', UiInsight);
})();
/* ── 色名標籤 <c-blue>、<c-key> 等：所有元件共用同一份，頁面上只注入一次 ── */
(function () {
  'use strict';
  if (typeof document === 'undefined' || document.getElementById('ui-color-tags')) return;
  var COLORS = { shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#DE8EC9' };
  var css = [];
  Object.keys(COLORS).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[k] + '}'); });
  var s = document.createElement('style'); s.id = 'ui-color-tags'; s.textContent = css.join('\n');
  (document.head || document.documentElement).appendChild(s);
  if (typeof window !== 'undefined' && !window.UiColorTags) { window.UiColorTags = { colors: COLORS }; }
})();
