/*! ui-fillin.js | 選擇題挖空元件 | 建立日期 10-06-26 */
(() => {
  'use strict';
  if (customElements.get('ui-fillin')) return;

  /* ---------- 樣式（與腳本同檔，不使用 shadow DOM） ---------- */
  const CSS = `
ui-fillin{
  --uf-bg:#0C0D0C;--uf-text:#C6C7BD;--uf-accent:#C6C7BD;
  --uf-ok:#27AE60;--uf-bad:#E6374B;
  --uf-line:rgba(198,199,189,0.78);
  --uf-sans:"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif;
  --uf-serif:Georgia,"Noto Serif TC","PMingLiU",serif;
  --uf-font-size:1rem;
  --uf-root-padding:12px;--uf-main-padding:12px;--uf-blank-padding:12px;
  --uf-menu-padding:12px;--uf-option-padding:12px;--uf-ans-padding:12px;
  display:block;position:relative;box-sizing:border-box;width:100%;
  padding:var(--uf-root-padding);border:2px solid var(--uf-line);background:var(--uf-bg);color:var(--uf-text);
  font:var(--uf-font-size)/1.25 var(--uf-sans);
}
ui-fillin main-box{display:block;box-sizing:border-box;padding:var(--uf-main-padding);font-family:var(--uf-serif);font-size:calc(var(--uf-font-size) * 1.1);line-height:1.5}
ui-fillin main-box p{margin:0 0 8px}
ui-fillin main-box p:last-child{margin-bottom:0}
ui-fillin main-box ul,ui-fillin main-box ol{margin:0;padding:0;list-style:none}
ui-fillin main-box li{margin:0 0 8px}
ui-fillin main-box li:last-child{margin-bottom:0}
ui-fillin main-box:empty,ui-fillin ans-box:empty{display:none}

ui-fillin .uf-blank{display:inline-flex;align-items:center;gap:4px;box-sizing:border-box;max-width:20rem;margin:0 2px;padding:var(--uf-blank-padding);
  vertical-align:baseline;white-space:nowrap;appearance:none;background:transparent;color:var(--uf-accent);border:1px solid var(--uf-accent);border-radius:6px;
  font:var(--uf-font-size)/1.25 var(--uf-sans);cursor:pointer}
ui-fillin .uf-blank .uf-no{font-weight:700}
ui-fillin .uf-blank .uf-no::after{content:"."}
ui-fillin .uf-blank .uf-val{overflow:hidden;text-overflow:ellipsis}
ui-fillin .uf-blank .uf-mark{font-weight:700}
ui-fillin .uf-blank .uf-mark:empty{display:none}
ui-fillin .uf-blank:not(:disabled):hover,ui-fillin .uf-blank.is-open{box-shadow:inset 0 0 0 1px var(--uf-accent)}
ui-fillin .uf-blank.is-picked{background:var(--uf-accent);color:var(--uf-bg)}
ui-fillin .uf-blank.is-ok{background:transparent;color:var(--uf-ok);border-color:var(--uf-ok)}
ui-fillin .uf-blank.is-bad{background:transparent;color:var(--uf-bad);border-color:var(--uf-bad)}
ui-fillin .uf-blank:disabled{cursor:default}
ui-fillin .uf-blank:focus-visible,ui-fillin .uf-btn:focus-visible,ui-fillin .uf-opt:focus-visible{outline:2px solid var(--uf-accent);outline-offset:2px}

ui-fillin .uf-menu{position:fixed;z-index:1000;display:flex;flex-direction:column;gap:2px;box-sizing:border-box;min-width:10rem;
  max-width:min(24rem,calc(100vw - 16px));max-height:60vh;overflow:auto;padding:var(--uf-menu-padding);
  background:var(--uf-bg);color:var(--uf-text);border:1px solid var(--uf-accent);border-radius:6px;font:var(--uf-font-size)/1.25 var(--uf-sans)}
ui-fillin .uf-menu[hidden]{display:none}
ui-fillin .uf-hint{padding:0 12px;color:var(--uf-accent)}
ui-fillin .uf-opt{display:flex;align-items:baseline;gap:12px;width:100%;box-sizing:border-box;padding:var(--uf-option-padding);
  appearance:none;background:transparent;color:var(--uf-text);border:0;border-radius:4px;font:inherit;text-align:left;cursor:pointer}
ui-fillin .uf-opt .uf-key{flex:none;font-weight:700;color:var(--uf-accent)}
ui-fillin .uf-opt.is-on{color:var(--uf-accent);box-shadow:inset 0 0 0 1px var(--uf-accent)}
ui-fillin .uf-opt.is-on::after{content:"✓";margin-left:auto;font-weight:700}
ui-fillin .uf-opt:hover,ui-fillin .uf-opt.is-on:hover{background:var(--uf-accent);color:var(--uf-bg)}
ui-fillin .uf-opt:hover .uf-key{color:var(--uf-bg)}

ui-fillin ans-box{display:block;box-sizing:border-box;margin-top:0;padding:var(--uf-ans-padding);border-top:1px dashed var(--uf-line)}
ui-fillin .uf-scroll{overflow-x:auto}
ui-fillin .uf-table{width:100%;border-collapse:collapse}
ui-fillin .uf-table th,ui-fillin .uf-table td{min-width:5rem;padding:6px 12px;line-height:1.25;border:1px solid var(--uf-line);text-align:center;vertical-align:middle}
ui-fillin .uf-table th{color:var(--uf-accent);font-weight:700}
ui-fillin .uf-table td.is-ok{background:var(--uf-ok);color:var(--uf-bg)}
ui-fillin .uf-table td.is-bad{background:var(--uf-bad);color:var(--uf-bg)}
ui-fillin .uf-table .uf-mark{margin-left:8px;font-weight:700}
ui-fillin .uf-bar{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
ui-fillin .uf-btn{appearance:none;padding:8px 20px;border:1px solid var(--uf-accent);border-radius:6px;background:transparent;color:var(--uf-text);font:inherit;cursor:pointer}
ui-fillin .uf-btn.is-primary{background:var(--uf-accent);color:var(--uf-bg)}
ui-fillin .uf-btn.is-ghost{border-color:var(--uf-line)}
ui-fillin .uf-btn:disabled{cursor:default;background:transparent;color:var(--uf-line);border-color:var(--uf-line)}

ui-fillin .uf-alerts{margin-bottom:8px}
ui-fillin .uf-alerts:empty{display:none}
ui-fillin .uf-alert{margin:0;padding:8px 12px;border:1px solid var(--uf-accent);border-radius:6px;background:var(--uf-accent);color:var(--uf-bg);font:inherit}
ui-fillin .uf-btn,ui-fillin .uf-opt{line-height:1.25}
ui-fillin .uf-alert.is-bad{background:var(--uf-bad);border-color:var(--uf-bad);color:var(--uf-bg)}
`;
  const styleEl = document.createElement('style');
  styleEl.id = 'ui-fillin-style';
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ---------- 小工具 ---------- */
  const PADS = ['root', 'main', 'blank', 'menu', 'option', 'ans'];
  const letter = (i) => String.fromCharCode(65 + (i % 26));
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // padding 屬性值：只接受 px 或純數字，最多四個值
  function normPad(v) {
    if (v == null) return null;
    const t = String(v).trim().split(/\s+/);
    if (!t[0] || t.length > 4) return null;
    const out = [];
    for (const x of t) {
      const m = /^(\d+(?:\.\d+)?)(px)?$/.exec(x);
      if (!m) return null;
      out.push(m[1] + 'px');
    }
    return out.join(' ');
  }

  // 洗牌（Fisher-Yates），優先使用 crypto 亂數
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      let j;
      if (window.crypto && window.crypto.getRandomValues) {
        const u = new Uint32Array(1);
        window.crypto.getRandomValues(u);
        j = u[0] % (i + 1);
      } else {
        j = Math.floor(Math.random() * (i + 1));
      }
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  // font-size 屬性值：純數字或 rem，一律換算成 rem
  function normFont(v) {
    if (v == null) return null;
    const m = /^\s*(\d+(?:\.\d+)?)(rem)?\s*$/.exec(String(v));
    return m && parseFloat(m[1]) > 0 ? m[1] + 'rem' : null;
  }

  // 解析大括號內文：直線分隔選項，開頭星號為正確答案，反斜線跳脫
  function parseBody(body) {
    const items = [];
    let cur = [];
    for (let i = 0; i < body.length; i++) {
      const c = body[i];
      if (c === '\\' && i + 1 < body.length) {
        cur.push([body[++i], true]);
      } else if (c === '|') {
        items.push(cur);
        cur = [];
      } else {
        cur.push([c, false]);
      }
    }
    items.push(cur);
    const isWs = (x) => !x[1] && /\s/.test(x[0]);
    const opts = [];
    for (const it of items) {
      let a = 0;
      let b = it.length;
      while (a < b && isWs(it[a])) a++;
      while (b > a && isWs(it[b - 1])) b--;
      let ok = false;
      if (a < b && !it[a][1] && it[a][0] === '*') {
        ok = true;
        a++;
        while (a < b && isWs(it[a])) a++;
      }
      const text = it.slice(a, b).map((x) => x[0]).join('');
      if (text) opts.push({ text, ok });
    }
    return opts;
  }

  const BLOCK_SRC = '\\{((?:\\\\[\\s\\S]|[^{}\\\\])*)\\}';

  /* ---------- 子元素（只當標籤，行為由 ui-fillin 統籌） ---------- */
  class MainBox extends HTMLElement {}
  class AnsBox extends HTMLElement {}

  /* ---------- 主元件 ---------- */
  class UiFillin extends HTMLElement {
    static get observedAttributes() {
      return ['font-size'].concat(PADS.map((p) => p + '-padding'));
    }

    constructor() {
      super();
      this._qs = [];
      this._cells = [];
      this._done = false;
      this._ready = false;
      this._openQ = null;
      this._onDown = (e) => {
        if (!this._openQ) return;
        const t = e.target;
        if (this._menu.contains(t)) return;
        if (t.closest && t.closest('.uf-blank') && this.contains(t)) return;
        this.closeMenu();
      };
      this._onKey = (e) => {
        if (e.key === 'Escape') this.closeMenu();
      };
      this._onPlace = () => this._place();
    }

    attributeChangedCallback(name) {
      if (name === 'font-size') {
        const f = normFont(this.getAttribute(name));
        if (f) this.style.setProperty('--uf-font-size', f);
        else this.style.removeProperty('--uf-font-size');
        return;
      }
      const key = name.replace('-padding', '');
      const v = normPad(this.getAttribute(name));
      if (v) this.style.setProperty('--uf-' + key + '-padding', v);
      else this.style.removeProperty('--uf-' + key + '-padding');
    }

    connectedCallback() {
      document.addEventListener('pointerdown', this._onDown, true);
      document.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onPlace);
      window.addEventListener('scroll', this._onPlace, true);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._init(), { once: true });
      } else {
        this._init();
      }
    }

    disconnectedCallback() {
      document.removeEventListener('pointerdown', this._onDown, true);
      document.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onPlace);
      window.removeEventListener('scroll', this._onPlace, true);
      this.closeMenu();
    }

    /* ----- 初始化 ----- */
    _init() {
      if (this._ready || !this.isConnected) return;
      this._ready = true;

      this._alerts = el('div', 'uf-alerts');
      this.insertBefore(this._alerts, this.firstChild);
      this._menu = el('div', 'uf-menu');
      this._menu.hidden = true;
      this.appendChild(this._menu);

      this._main = this.querySelector('main-box');
      this._ans = this.querySelector('ans-box');
      if (!this._ans) {
        this._ans = document.createElement('ans-box');
        this.insertBefore(this._ans, this._menu);
      }

      const sid = this._main && this._main.getAttribute('source');
      const src = sid ? document.getElementById(sid) : null;
      if (!src) {
        this._alert('找不到題目來源區塊，請檢查 main-box 的 source 屬性。', 'bad');
        return;
      }

      this._build(src);
      if (!this._qs.length) {
        this._alert('題幹中沒有可用的空格，格式為 {*正確答案|選項二|選項三}。', 'bad');
        return;
      }
      this._renderAns();

      this._main.addEventListener('click', (e) => {
        const b = e.target.closest('.uf-blank');
        if (!b || this._done) return;
        const q = this._qs[+b.dataset.k];
        if (this._openQ === q) this.closeMenu();
        else this._openMenu(q);
      });
      this._menu.addEventListener('click', (e) => {
        const b = e.target.closest('.uf-opt');
        if (!b || !this._openQ) return;
        this._pick(this._openQ, +b.dataset.i, b);
      });
      this._ans.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]');
        if (!b) return;
        if (b.dataset.act === 'submit') this.submit();
        else this.reset();
      });
    }

    // 讀取來源 div，複製後把大括號標記換成按鈕，原稿清空以免洩漏答案
    _build(src) {
      const frag = document.createDocumentFragment();
      Array.from(src.childNodes).forEach((n) => frag.appendChild(n.cloneNode(true)));
      // 布林屬性 random：來源內的清單項目（li）隨機換序，題號之後依新順序自動編
      if (this.hasAttribute('random')) {
        frag.querySelectorAll('ul,ol').forEach((list) => {
          const lis = Array.from(list.children).filter((c) => c.tagName === 'LI');
          shuffle(lis).forEach((li) => list.appendChild(li));
        });
      }
      const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      nodes.forEach((node) => {
        const s = node.nodeValue;
        if (s.indexOf('{') < 0) return;
        const re = new RegExp(BLOCK_SRC, 'g');
        const out = document.createDocumentFragment();
        let last = 0;
        let hit = false;
        let m;
        while ((m = re.exec(s))) {
          const opts = parseBody(m[1]);
          if (opts.length < 2) continue;
          hit = true;
          if (m.index > last) out.appendChild(document.createTextNode(s.slice(last, m.index)));
          out.appendChild(this._makeBlank(opts));
          last = re.lastIndex;
        }
        if (!hit) return;
        if (last < s.length) out.appendChild(document.createTextNode(s.slice(last)));
        node.parentNode.replaceChild(out, node);
      });

      this._main.textContent = '';
      this._main.appendChild(frag);
      src.textContent = '';
      src.hidden = true;
    }

    _makeBlank(opts) {
      const k = this._qs.length;
      const ok = [];
      opts.forEach((o, i) => { if (o.ok) ok.push(i); });
      const q = { no: k + 1, options: opts, ok, multi: ok.length > 1, sel: [], btn: null };
      const b = el('button', 'uf-blank');
      b.type = 'button';
      b.dataset.k = k;
      b.append(el('span', 'uf-no', String(q.no)), el('span', 'uf-val'), el('span', 'uf-mark'));
      q.btn = b;
      this._qs.push(q);
      this._paint(q);
      return b;
    }

    /* ----- 判斷與繪製 ----- */
    _judge(q) {
      return q.sel.length > 0 && q.sel.length === q.ok.length && q.sel.every((i) => q.ok.includes(i));
    }

    _selText(q) {
      return q.sel.map((i) => q.options[i].text).join(' / ');
    }

    _paint(q) {
      const done = this._done;
      const picked = q.sel.length > 0;
      const res = done ? this._judge(q) : null;
      q.btn.querySelector('.uf-val').textContent = picked ? this._selText(q) : (done ? '未作答' : '▾');
      q.btn.querySelector('.uf-mark').textContent = done ? (res ? '正確' : '錯誤') : '';
      q.btn.classList.toggle('is-picked', picked);
      q.btn.classList.toggle('is-ok', done && res === true);
      q.btn.classList.toggle('is-bad', done && res === false);
      q.btn.disabled = done;
    }

    _renderAns() {
      const a = this._ans;
      a.textContent = '';
      const scroll = el('div', 'uf-scroll');
      const table = el('table', 'uf-table');
      const tb = el('tbody');
      const r1 = el('tr');
      const r2 = el('tr');
      this._cells = [];
      this._qs.forEach((q) => {
        r1.appendChild(el('th', null, q.no + '.'));
        const td = el('td');
        r2.appendChild(td);
        this._cells.push(td);
      });
      tb.append(r1, r2);
      table.appendChild(tb);
      scroll.appendChild(table);

      const bar = el('div', 'uf-bar');
      this._submitBtn = el('button', 'uf-btn is-primary', '提交答案');
      this._submitBtn.type = 'button';
      this._submitBtn.dataset.act = 'submit';
      const resetBtn = el('button', 'uf-btn is-ghost', '重做');
      resetBtn.type = 'button';
      resetBtn.dataset.act = 'reset';
      bar.append(this._submitBtn, resetBtn);

      a.append(scroll, bar);
      this._qs.forEach((q, k) => this._paintAns(k));
    }

    _paintAns(k) {
      const q = this._qs[k];
      const td = this._cells[k];
      td.textContent = '';
      td.className = '';
      const picked = q.sel.length > 0;
      td.appendChild(document.createTextNode(picked ? this._selText(q) : (this._done ? '未作答' : '')));
      if (this._done) {
        const res = this._judge(q);
        td.classList.add(res ? 'is-ok' : 'is-bad');
        td.appendChild(el('span', 'uf-mark', res ? '正確' : '錯誤'));
      }
    }

    /* ----- 浮出選項清單 ----- */
    _openMenu(q) {
      this.closeMenu();
      const m = this._menu;
      m.textContent = '';
      if (q.multi) m.appendChild(el('div', 'uf-hint', '可複選'));
      q.options.forEach((o, i) => {
        const b = el('button', 'uf-opt' + (q.sel.includes(i) ? ' is-on' : ''));
        b.type = 'button';
        b.dataset.i = i;
        b.append(el('span', 'uf-key', letter(i)), el('span', 'uf-text', o.text));
        m.appendChild(b);
      });
      m.hidden = false;
      this._openQ = q;
      q.btn.classList.add('is-open');
      this._place();
    }

    closeMenu() {
      if (!this._menu) return;
      if (this._openQ) this._openQ.btn.classList.remove('is-open');
      this._openQ = null;
      this._menu.hidden = true;
    }

    _place() {
      const q = this._openQ;
      if (!q) return;
      const m = this._menu;
      const r = q.btn.getBoundingClientRect();
      m.style.left = '0px';
      m.style.top = '0px';
      const mw = m.offsetWidth;
      const mh = m.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const gap = 6;
      let top = r.bottom + gap;
      if (top + mh > vh - 8) {
        if (r.top - gap - mh >= 8) top = r.top - gap - mh;
        else top = Math.max(8, vh - 8 - mh);
      }
      const left = Math.min(Math.max(8, r.left), Math.max(8, vw - 8 - mw));
      m.style.left = left + 'px';
      m.style.top = top + 'px';
    }

    _pick(q, i, optEl) {
      if (q.multi) {
        const at = q.sel.indexOf(i);
        if (at >= 0) q.sel.splice(at, 1);
        else q.sel.push(i);
        q.sel.sort((a, b) => a - b);
        optEl.classList.toggle('is-on', at < 0);
      } else {
        q.sel = [i];
      }
      this._paint(q);
      this._paintAns(q.no - 1);
      if (!q.multi) this.closeMenu();
      else this._place();
      this.dispatchEvent(new CustomEvent('fillin-change', {
        bubbles: true,
        detail: { no: q.no, selected: q.sel.map((x) => q.options[x].text) }
      }));
    }

    /* ----- 提交與重做 ----- */
    submit() {
      if (this._done || !this._qs.length) return;
      this.closeMenu();
      this._done = true;
      const results = this._qs.map((q) => ({
        no: q.no,
        correct: this._judge(q),
        answered: q.sel.length > 0
      }));
      this._qs.forEach((q, k) => { this._paint(q); this._paintAns(k); });
      if (this._submitBtn) this._submitBtn.disabled = true;
      this._writeResults(results);
      this._alert('已批改，請查看每題的對錯。', 'info');
      this.dispatchEvent(new CustomEvent('fillin-submit', { bubbles: true, detail: { results } }));
    }

    reset() {
      if (!this._qs.length) return;
      this.closeMenu();
      this._done = false;
      this._qs.forEach((q, k) => { q.sel = []; this._paint(q); this._paintAns(k); });
      if (this._submitBtn) this._submitBtn.disabled = false;
      this._alerts.replaceChildren();
      this._clearResults();
      this.dispatchEvent(new CustomEvent('fillin-reset', { bubbles: true }));
    }

    /* ----- 結果輸出與提示 ----- */
    _resultsBox() {
      const id = this.getAttribute('results-id');
      return id ? document.getElementById(id) : null;
    }

    // 結果寫入位置：優先用結果區塊內帶 data-uf-results 的元素，否則在區塊末端附加一個容器。
    // 區塊內其他 HTML 與其他元件一律不動。
    _slot(box, create) {
      let slot = box.querySelector('[data-uf-results]');
      if (slot) return slot;
      slot = Array.from(box.children).find((c) => c.hasAttribute('data-uf-auto')) || null;
      if (!slot && create) {
        slot = el('div', 'uf-results');
        slot.setAttribute('data-uf-auto', '');
        box.appendChild(slot);
      }
      return slot;
    }

    _clearResults() {
      const box = this._resultsBox();
      if (!box) return;
      const slot = this._slot(box, false);
      if (!slot) return;
      if (slot.hasAttribute('data-uf-auto')) slot.remove();
      else slot.replaceChildren();
    }

    _writeResults(results) {
      const box = this._resultsBox();
      if (!box) return;
      const items = results.map((r) => {
        const item = el('div', 'uf-result', r.no + '. ' + (r.correct ? '正確' : (r.answered ? '錯誤' : '未作答')));
        item.dataset.no = r.no;
        item.dataset.state = r.correct ? 'correct' : 'incorrect';
        item.dataset.answered = r.answered ? 'true' : 'false';
        return item;
      });
      this._slot(box, true).replaceChildren(...items);
    }

    _alert(msg, type) {
      const bad = type === 'bad';
      const a = el('div', 'alert uf-alert ' + (bad ? 'alert-danger is-bad' : 'alert-info'), msg);
      a.setAttribute('role', 'alert');
      this._alerts.replaceChildren(a);
    }
  }

  customElements.define('main-box', MainBox);
  customElements.define('ans-box', AnsBox);
  customElements.define('ui-fillin', UiFillin);
})();
