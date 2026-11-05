/*!
 * <ui-insight> 亮點字詞解說元件 v1.2
 * 用途：左側為一句一句的卡片，右側顯示所選句子中亮點字詞的解說，雙向對照。
 * 不使用 shadow DOM，CSS 由本檔自動注入。需要 Bootstrap Icons（bi-*）。
 * v1.1：所有顏色屬性（含 hl-hot-bg、hl-hot-color、tag-color）可直接填品牌色名稱，
 *       例如 hl-hot-bg="sky"、hl-hot-color="base"，名稱不分大小寫，也仍可填 #hex 或 rgb()。
 * v1.2：新增 theme 屬性，例如 theme="lavender"。影響外觀色彩的個別屬性預設都跟著 theme，
 *       有明確指定的屬性才會覆蓋 theme 的顏色。優先順序：個別屬性 > theme > 內建預設。
 *       可用主題：default、lavender、sky、ocean、teal、safe、special、yellow、orange、
 *       salmon、pink、warning、indigo、info。名稱不存在時退回 default。
 */
(() => {
  if (customElements.get('ui-insight')) return;

  const PALETTE = [
    '#C6C7BD', '#B484E8', '#5DBAE8', '#EF6661', '#F79C40', '#5DBAE8', '#71CD76', '#71CD76',
    '#DBEDD8', '#E3D322', '#DBEDD8', '#71CD76', '#778CE1', '#778CE1', '#FF91D7', '#F79C40'
  ];

  /* 品牌色名稱對照：顏色屬性可直接填名稱（不分大小寫） */
  const COLOR_NAMES = {
    base: '#0C0D0C',
    shell: '#C6C7BD',
    lavender: '#B484E8',
    sky: '#5DBAE8',
    warning: '#EF6661',
    salmon: '#F79C40',
    ocean: '#5DBAE8',
    safe: '#71CD76',
    teal: '#71CD76',
    vanilla: '#DBEDD8',
    yellow: '#E3D322',
    focus: '#DBEDD8',
    special: '#71CD76',
    info: '#778CE1',
    indigo: '#778CE1',
    pink: '#FF91D7',
    orange: '#F79C40',
    /* 新色票 */
    red: '#EF6661',
    green: '#71CD76',
    blue: '#5DBAE8',
    violet: '#B484E8',
    gray: '#86877F'
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
    'ini-title-color', 'ini-title-bg'
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
    'ini-title-color': a
  });

  const THEMES = {
    default: {},
    lavender: accentTheme('lavender'),
    sky: accentTheme('sky'),
    ocean: accentTheme('ocean'),
    teal: accentTheme('teal'),
    safe: accentTheme('safe'),
    special: accentTheme('special'),
    yellow: accentTheme('yellow'),
    orange: accentTheme('orange'),
    salmon: accentTheme('salmon'),
    pink: accentTheme('pink'),
    warning: accentTheme('warning'),
    indigo: accentTheme('indigo'),
    info: accentTheme('info'),
    /* 新色票 */
    red: accentTheme('red'),
    green: accentTheme('green'),
    blue: accentTheme('blue'),
    violet: accentTheme('violet'),
    gray: accentTheme('gray'),
    vanilla: accentTheme('vanilla')
  };

  /* 內建標籤：tag="lr" 等簡寫會轉成中文文字與預設顏色 */
  const TAGS = {
    lr: { text: '詞彙', color: '#71CD76' },
    gra: { text: '文法', color: '#B484E8' },
    fc: { text: '連貫', color: '#5DBAE8' },
    p: { text: '發音', color: '#F79C40' }
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
    'ini-title-bg': '#161816'
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
    'keyboard': 'true'
  };

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
ui-insight.uin-kbd-active .uin-card.is-on{outline:2px solid var(--uin-card-active-border);outline-offset:3px}
${PALETTE.map((c, i) => `ui-insight c${i + 1}{color:${c}}`).join('\n')}
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

      box.querySelectorAll('.uin-note').forEach((nd) => {
        nd.addEventListener('mouseenter', () => this._hot(nd.dataset.n));
        nd.addEventListener('mouseleave', () => this._hot(null));
      });

      if (animate) {
        box.classList.remove('uin-in');
        void box.offsetWidth;
        box.classList.add('uin-in');
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
