/* =========================================================================
 * <ui-dashboard> 與 <dash-cell>：用屬性快速排出儀表板版面
 *
 * 版面字串式：
 *   <ui-dashboard areas="head head | nav main | nav foot">
 *     <dash-cell area="head">…</dash-cell>
 *   </ui-dashboard>
 * 欄列式：
 *   <ui-dashboard cols="12" row-height="120">
 *     <dash-cell span="8x3">…</dash-cell>
 *   </ui-dashboard>
 *
 * 只負責版面（CSS Grid），格子裡可以放純 HTML 或任何元件。
 * 不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。
 * ========================================================================= */
(() => {
  'use strict';
  if (customElements.get('ui-dashboard')) return;

  /* ---------- 樣式（只注入一次） ---------- */
  const STYLE_ID = 'ui-dashboard-style';
  const STYLE_TEXT = `
ui-dashboard{display:grid;box-sizing:border-box;width:100%;gap:16px;grid-auto-rows:120px}
ui-dashboard.is-stacked{grid-template-columns:minmax(0,1fr)!important;grid-template-areas:none!important;grid-template-rows:none!important;grid-auto-rows:minmax(var(--dash-rh,120px),auto)!important}
ui-dashboard.is-stacked > dash-cell{grid-area:auto!important;grid-column:auto!important;grid-row:auto!important}
dash-cell{display:flex;flex-direction:column;box-sizing:border-box;min-width:0;min-height:0;overflow:auto}
dash-cell > *{flex:0 0 auto;max-width:100%}
dash-cell[data-fit] > *{flex:1 1 auto;min-height:0}
dash-cell[scroll="none"]{overflow:hidden}
dash-cell[hidden][reserve]{display:flex!important;visibility:hidden}
dash-cell[heading]::before{content:attr(heading);display:block;flex:0 0 auto;margin-bottom:12px;font-size:.875rem;line-height:1.5;font-weight:700;letter-spacing:.08em;color:#A3C4BC}
dash-cell[card]{background:rgb(36,36,36);color:#DBEDD8;border:1px solid #2D2D2D;border-radius:12px;padding:16px}
`;
  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = STYLE_TEXT;
    document.head.insertBefore(s, document.head.firstChild);
  };

  /* ---------- 小工具 ---------- */
  // 純數字視為 px，其餘（1fr、20rem、minmax(...)）原樣使用
  const len = (v) => (/^-?\d+(\.\d+)?$/.test(String(v).trim()) ? `${String(v).trim()}px` : String(v).trim());
  // 以空白分隔，括號內的空白不拆
  const tokens = (str) => {
    const out = [];
    let cur = '', depth = 0;
    for (const ch of String(str)) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (/\s/.test(ch) && depth === 0) { if (cur) out.push(cur); cur = ''; } else cur += ch;
    }
    if (cur) out.push(cur);
    return out;
  };
  const warn = (msg) => console.warn(`[ui-dashboard] ${msg}`);

  /* ---------- <ui-dashboard> ---------- */
  class UiDashboard extends HTMLElement {
    static get observedAttributes() {
      return ['areas', 'cols', 'col-widths', 'row-height', 'gap', 'stack-below'];
    }

    constructor() {
      super();
      this._mql = null;
      this._onMql = () => this._applyStack();
    }

    connectedCallback() {
      injectStyle();
      this._apply();
    }

    disconnectedCallback() {
      this._unbindStack();
    }

    attributeChangedCallback(name, oldV, newV) {
      if (oldV === newV || !this.isConnected) return;
      this._apply();
    }

    // 版面字串：列用 | 或換行分隔，格內以空白分隔區域名稱，「.」代表空格。
    _parseAreas() {
      const raw = this.getAttribute('areas');
      if (!raw || !raw.trim()) return null;
      const rows = raw.split(/[|\n]/).map(r => r.trim()).filter(Boolean).map(r => r.split(/\s+/));
      const n = rows[0].length;
      if (rows.some(r => r.length !== n)) warn(`areas 每一列的欄數必須相同：${raw.trim()}`);
      return rows;
    }

    _apply() {
      const st = this.style;
      const gap = this.getAttribute('gap');
      st.gap = gap !== null && gap !== '' ? len(gap) : '';

      const rhList = tokens(this.getAttribute('row-height') || '120').map(len);
      const lastRh = rhList[rhList.length - 1];
      this.style.setProperty('--dash-rh', rhList[0]);
      st.gridAutoRows = lastRh;

      const areas = this._parseAreas();
      const colWidths = tokens(this.getAttribute('col-widths') || '').map(len);
      const colsN = parseInt(this.getAttribute('cols'), 10);

      if (areas) {
        const n = areas[0].length;
        st.gridTemplateAreas = areas.map(r => `"${r.join(' ')}"`).join(' ');
        st.gridTemplateColumns = colWidths.length
          ? colWidths.join(' ')
          : `repeat(${n}, minmax(0, 1fr))`;
        if (colWidths.length && colWidths.length !== n) warn(`col-widths 有 ${colWidths.length} 個值，areas 有 ${n} 欄。`);
        // 每列高度：給一個值則全部相同；給多個值依序對應，不足的沿用最後一個
        st.gridTemplateRows = areas.map((_, i) => rhList[Math.min(i, rhList.length - 1)]).join(' ');
        this._areaNames = new Set(areas.flat().filter(a => a !== '.'));
      } else {
        st.gridTemplateAreas = '';
        st.gridTemplateRows = rhList.length > 1 ? rhList.join(' ') : '';
        this._areaNames = null;
        if (colWidths.length) st.gridTemplateColumns = colWidths.join(' ');
        else st.gridTemplateColumns = `repeat(${colsN > 0 ? colsN : 12}, minmax(0, 1fr))`;
      }
      this._applyStackBinding();
      // 通知格子重新檢查區域名稱
      this.querySelectorAll(':scope > dash-cell').forEach(c => c._place && c._place());
    }

    /* ----- 窄螢幕堆疊 ----- */
    _unbindStack() {
      if (this._mql) { this._mql.removeEventListener('change', this._onMql); this._mql = null; }
    }

    _applyStackBinding() {
      this._unbindStack();
      const w = parseInt(this.getAttribute('stack-below'), 10);
      if (w > 0 && window.matchMedia) {
        this._mql = window.matchMedia(`(max-width:${w}px)`);
        this._mql.addEventListener('change', this._onMql);
      }
      this._applyStack();
    }

    _applyStack() {
      this.classList.toggle('is-stacked', !!(this._mql && this._mql.matches));
    }
  }

  /* ---------- <dash-cell> ---------- */
  // 格子內只有一個「容器型」子元素時，讓它撐滿格子；行內元素（span、a 等）不撐。
  const FIT_TAGS = new Set(['DIV', 'SECTION', 'ARTICLE', 'MAIN', 'ASIDE', 'TABLE', 'UL', 'OL', 'PRE',
    'FORM', 'IFRAME', 'CANVAS', 'SVG', 'VIDEO', 'FIGURE']);

  class DashCell extends HTMLElement {
    static get observedAttributes() { return ['area', 'col', 'row', 'span', 'pad']; }

    connectedCallback() {
      injectStyle();
      this._place();
      this._fit();
      if (!this._mo) this._mo = new MutationObserver(() => this._fit());
      this._mo.observe(this, { childList: true });
    }

    disconnectedCallback() {
      if (this._mo) this._mo.disconnect();
    }

    _fit() {
      const kids = this.children;
      const one = kids.length === 1 ? kids[0] : null;
      const fit = !!one && (one.tagName.includes('-') || FIT_TAGS.has(one.tagName));
      this.toggleAttribute('data-fit', fit);
    }

    attributeChangedCallback(name, oldV, newV) {
      if (oldV === newV || !this.isConnected) return;
      this._place();
    }

    // "3" → 起點；"2-4" → 第 2 到第 4 個（含）
    _range(attr) {
      const v = (this.getAttribute(attr) || '').trim();
      if (!v) return null;
      const m = v.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) return { start: +m[1], end: +m[2] };
      if (/^\d+$/.test(v)) return { start: +v, end: null };
      warn(`${attr}="${v}" 無法辨識，請寫 3 或 2-4。`);
      return null;
    }

    _place() {
      const st = this.style;
      const area = (this.getAttribute('area') || '').trim();
      let c = this._range('col'), r = this._range('row');
      let w = 1, h = 1, hasSpan = false;
      const sp = (this.getAttribute('span') || '').trim();
      if (sp) {
        const m = sp.match(/^(\d+)(?:\s*[xX×]\s*(\d+))?$/);
        if (m) { w = +m[1]; h = m[2] ? +m[2] : 1; hasSpan = true; }
        else warn(`span="${sp}" 無法辨識，請寫 2 或 2x3（欄 x 列）。`);
      }
      const fmt = (rg, n) => {
        if (rg && rg.end) return `${rg.start} / ${rg.end + 1}`;
        if (rg && rg.start) return n > 1 ? `${rg.start} / span ${n}` : `${rg.start}`;
        return n > 1 ? `span ${n}` : '';
      };
      if (area) {
        const host = this.parentElement;
        if (host && host._areaNames && !host._areaNames.has(area)) warn(`找不到區域「${area}」，請檢查 areas 設定。`);
        // grid-area 是 grid-column、grid-row 的簡寫，必須先清掉後者再設定
        st.gridColumn = '';
        st.gridRow = '';
        st.gridArea = area;
      } else {
        st.gridArea = '';
        st.gridColumn = fmt(c, hasSpan ? w : 1);
        st.gridRow = fmt(r, hasSpan ? h : 1);
      }
      const pad = this.getAttribute('pad');
      st.padding = pad !== null && pad !== '' ? tokens(pad).map(len).join(' ') : '';
    }
  }

  customElements.define('ui-dashboard', UiDashboard);
  customElements.define('dash-cell', DashCell);
})();
