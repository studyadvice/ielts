(() => {
  'use strict';
  const STYLE_ID = '__side-menu-style__';
  if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `

side-menu {
  display       : flex;
  flex-direction: column;
  width         : var(--sm-w, 320px);
  font-size     : var(--sm-fs, 1rem);
  background    : var(--sm-bg);
  border-right  : 1px solid var(--sm-divider);
  height        : 100%;
  overflow-y    : auto;
  overflow-x    : hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(128,128,128,0.12) transparent;
  transition    : background 0.25s ease;
}
side-menu::-webkit-scrollbar       { width: 4px; }
side-menu::-webkit-scrollbar-thumb {
  background: rgba(128,128,128,0.12); border-radius: 2px;
}

menu-brand {
  display      : flex;
  align-items  : center;
  padding      : 22px 20px 20px;
  border-bottom: 1px solid var(--sm-divider);
  margin-bottom: 16px;
  flex-shrink  : 0;
}

menu-section {
  display      : block;
  padding      : 0 10px;
  margin-bottom: 22px;
}

menu-footer {
  display    : block;
  margin-top : auto;
  padding    : 14px 10px 0;
  border-top : 1px solid var(--sm-divider);
  flex-shrink: 0;
}

/* ── 分組標題 ─────────────────────────────── */
.sm-group-label {
  display        : flex;
  align-items    : center;
  gap            : 9px;
  padding        : 0 8px 9px;
  font-size      : 0.64em;
  font-weight    : 700;
  letter-spacing : 0.15em;
  text-transform : uppercase;
  color          : var(--sm-label);
  user-select    : none;
}
.sm-group-label::after {
  content   : '';
  flex      : 1;
  height    : 1px;
  background: linear-gradient(to right, var(--sm-label-line), transparent);
}

/* ── 項目格線容器 ─────────────────────────── */
.sm-items-wrap {
  display: grid;
  gap    : 2px;
}
.sm-items-wrap[data-col="1"] { grid-template-columns: 1fr; }
.sm-items-wrap[data-col="2"] { grid-template-columns: 1fr 1fr; gap: 6px; }

/* ── menu-item 本體 ───────────────────────── */
menu-item {
  display   : block;
  cursor    : pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  outline   : none;
}

/* ── 單欄 inner ───────────────────────────── */
.sm-single {
  position     : relative;
  display      : flex;
  align-items  : center;
  gap          : 11px;
  padding      : 8px 10px 8px 16px;
  border-radius: 8px;
  transition   : background 0.18s ease;
}

/* 左側指示條 */
.sm-bar {
  position          : absolute;
  left              : 0; top: 7px; bottom: 7px;
  width             : 0;
  border-left-width : var(--sm-bar-w, 3px);
  border-left-style : var(--sm-bar-st, solid);
  border-left-color : transparent;
  border-radius     : 0 3px 3px 0;
  transition        : border-color 0.18s ease;
  display           : var(--sm-bar-display, block);
}

/* Icon 盒子（單欄）*/
.sm-single .sm-icon {
  width        : 34px; height: 34px;
  flex-shrink  : 0;
  display      : flex; align-items: center; justify-content: center;
  border-radius: 7px;
  background   : var(--sm-icon-bg);
  border       : 1px solid var(--sm-icon-bdr);
  color        : var(--sm-icon-c);
  font-size    : 1em;
  transition   : background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

/* 文字區 */
.sm-body { flex: 1; min-width: 0; transition: transform 0.18s ease; }
.sm-title {
  display      : block;
  font-size    : 0.87em;
  font-weight  : 500;
  color        : var(--sm-text-muted);
  white-space  : nowrap;
  overflow     : hidden;
  text-overflow: ellipsis;
  line-height  : 1.25;
  transition   : color 0.18s ease;
}
.sm-sub {
  display      : block;
  font-size    : 0.72em;
  color        : var(--sm-sub-c);
  margin-top   : 3px;
  white-space  : nowrap;
  overflow     : hidden;
  text-overflow: ellipsis;
  transition   : color 0.18s ease;
}

/* ── 單欄 HOVER ───────────────────────────── */
menu-item:hover .sm-single            { background: var(--sm-hover-bg); }
menu-item:hover .sm-bar               { border-left-color: var(--sm-bar-hover-c); }
menu-item:hover .sm-single .sm-icon  {
  background: var(--sm-icon-hover-bg);
  border-color: var(--sm-icon-hover-bdr);
  color: var(--sm-icon-hover-c);
}
menu-item:hover .sm-body              { transform: translateX(2px); }
menu-item:hover .sm-title             { color: var(--sm-text); }
menu-item:hover .sm-sub               { color: var(--sm-sub-hover-c); }

/* ── 單欄 ACTIVE ──────────────────────────── */
menu-item.active .sm-single           { background: var(--sm-active-bg); }
menu-item.active .sm-bar              { border-left-color: var(--sm-bar-active-c); }
menu-item.active .sm-single .sm-icon {
  background: var(--sm-icon-active-bg);
  border-color: var(--sm-icon-active-bdr);
  color: var(--sm-accent);
}
menu-item.active .sm-body             { transform: translateX(2px); }
menu-item.active .sm-title            { color: var(--sm-accent); font-weight: 600; }
menu-item.active .sm-sub              { color: var(--sm-accent-sub-c); }

/* ── 雙欄 inner ───────────────────────────── */
.sm-double {
  display      : flex;
  flex-direction: column;
  align-items  : flex-start;
  padding      : 12px 12px 11px;
  border-radius: 8px;
  border       : 1px solid var(--sm-dbl-bdr);
  background   : var(--sm-dbl-bg);
  gap          : 7px;
  min-height   : 70px;
  transition   : background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}
.sm-double.no-icon {
  align-items    : center;
  justify-content: center;
  text-align     : center;
}

/* Icon 盒子（雙欄，略小）*/
.sm-double .sm-icon {
  width        : 28px; height: 28px;
  flex-shrink  : 0;
  display      : flex; align-items: center; justify-content: center;
  border-radius: 6px;
  font-size    : 0.9em;
  background   : var(--sm-icon-bg);
  border       : 1px solid var(--sm-icon-bdr);
  color        : var(--sm-icon-c);
  transition   : background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.sm-double .sm-title { font-size: 0.83em; line-height: 1.3; white-space: normal; }
.sm-double .sm-sub   { font-size: 0.68em; margin-top: 0; }

/* ── 雙欄 HOVER ───────────────────────────── */
menu-item:hover .sm-double           {
  background  : var(--sm-dbl-hover-bg);
  border-color: var(--sm-dbl-hover-bdr);
}
menu-item:hover .sm-double .sm-icon  {
  background: var(--sm-icon-hover-bg);
  border-color: var(--sm-icon-hover-bdr);
  color: var(--sm-icon-hover-c);
}
menu-item:hover .sm-double .sm-title { color: var(--sm-text); }

/* ── 雙欄 ACTIVE ──────────────────────────── */
menu-item.active .sm-double           {
  background  : var(--sm-dbl-active-bg);
  border-color: var(--sm-accent-2);
  box-shadow  : 0 0 0 1px var(--sm-accent-2-dim);
}
menu-item.active .sm-double .sm-icon  {
  background: var(--sm-dbl-icon-active-bg);
  border-color: var(--sm-dbl-icon-active-bdr);
  color: var(--sm-accent-2);
}
menu-item.active .sm-double .sm-title { color: var(--sm-accent-2); font-weight: 600; }
menu-item.active .sm-double .sm-sub   { color: var(--sm-accent-2-sub); }

/* ── 鍵盤焦點 ─────────────────────────────── */
menu-item:focus-visible .sm-single,
menu-item:focus-visible .sm-double {
  outline       : 2px solid var(--sm-accent);
  outline-offset: 1px;
}

/* ── 分組 active 連帶提亮 label ──────────── */
menu-section:has(menu-item.active) .sm-group-label {
  color: var(--sm-label-active);
}

/* ═══════════════════════════════════════════
   DARK THEME（預設）
═══════════════════════════════════════════ */
side-menu,
side-menu[theme="dark"] {
  --sm-bg              : #0e0f0e;
  --sm-divider         : #1d1e1d;
  --sm-text            : #C6C7BD;
  --sm-text-muted      : rgba(198,199,189,0.91);  /* ↑ 亮度提升 */
  --sm-sub-c           : rgba(149,201,222,0.78);  /* ↑ 亮度提升 */
  --sm-sub-hover-c     : rgba(149,201,222,0.88);
  --sm-hover-bg        : rgba(198,199,189,0.05);
  --sm-active-bg       : rgba(179,222,115,0.16);   /* ↑ 對比加強 */
  --sm-label           : rgba(149,201,222,0.35);
  --sm-label-active    : rgba(149,201,222,0.6);
  --sm-label-line      : rgba(149,201,222,0.12);

  /* col=1 accent（黃綠）*/
  --sm-accent          : #b3de73;
  --sm-accent-sub-c    : rgba(179,222,115,0.6);

  /* col=2 accent（天藍）*/
  --sm-accent-2        : #95c9de;
  --sm-accent-2-dim    : rgba(149,201,222,0.22);
  --sm-accent-2-sub    : rgba(149,201,222,0.76);

  /* 指示條 */
  --sm-bar-hover-c     : rgba(179,222,115,0.32);
  --sm-bar-active-c    : #b3de73;

  /* icon（共用）—— 預設狀態明顯一些 */
  --sm-icon-bg         : rgba(198,199,189,0.07);  /* ↑ */
  --sm-icon-bdr        : rgba(198,199,189,0.13);  /* ↑ */
  --sm-icon-c          : rgba(198,199,189,0.58);  /* ↑ 亮度提升 */
  --sm-icon-hover-bg   : rgba(198,199,189,0.11);
  --sm-icon-hover-bdr  : rgba(179,222,115,0.25);
  --sm-icon-hover-c    : rgba(198,199,189,0.82);
  --sm-icon-active-bg  : rgba(179,222,115,0.16);   /* ↑ */
  --sm-icon-active-bdr : rgba(179,222,115,0.5);    /* ↑ */

  /* 雙欄卡片 */
  --sm-dbl-bg           : rgba(198,199,189,0.04);
  --sm-dbl-bdr          : rgba(198,199,189,0.11);
  --sm-dbl-hover-bg     : rgba(198,199,189,0.07);
  --sm-dbl-hover-bdr    : rgba(149,201,222,0.28);
  --sm-dbl-active-bg    : rgba(149,201,222,0.10);
  --sm-dbl-icon-active-bg : rgba(149,201,222,0.16);
  --sm-dbl-icon-active-bdr: rgba(149,201,222,0.40);
}

/* ═══════════════════════════════════════════
   LIGHT THEME
═══════════════════════════════════════════ */
side-menu[theme="light"] {
  --sm-bg              : #f2f3f1;
  --sm-divider         : #dde0db;
  --sm-text            : #252624;
  --sm-text-muted      : rgba(37,38,36,0.82);
  --sm-sub-c           : rgba(55,90,108,0.65);
  --sm-sub-hover-c     : rgba(55,90,108,0.85);
  --sm-hover-bg        : rgba(37,38,36,0.06);
  --sm-active-bg       : rgba(90,120,16,0.14);
  --sm-label           : rgba(55,90,108,0.45);
  --sm-label-active    : rgba(55,90,108,0.72);
  --sm-label-line      : rgba(55,90,108,0.14);

  /* col=1 accent（深橄欖，在亮色背景上可讀）*/
  --sm-accent          : #5a7a10;
  --sm-accent-sub-c    : rgba(90,122,16,0.55);

  /* col=2 accent（深天藍）*/
  --sm-accent-2        : #0E6882;
  --sm-accent-2-dim    : rgba(14,104,130,0.20);
  --sm-accent-2-sub    : rgba(14,104,130,0.55);

  /* 指示條 */
  --sm-bar-hover-c     : rgba(90,122,16,0.28);
  --sm-bar-active-c    : #5a7a10;

  /* icon */
  --sm-icon-bg         : rgba(37,38,36,0.07);
  --sm-icon-bdr        : rgba(37,38,36,0.15);
  --sm-icon-c          : rgba(37,38,36,0.55);
  --sm-icon-hover-bg   : rgba(37,38,36,0.11);
  --sm-icon-hover-bdr  : rgba(90,122,16,0.3);
  --sm-icon-hover-c    : rgba(37,38,36,0.78);
  --sm-icon-active-bg  : rgba(90,122,16,0.14);
  --sm-icon-active-bdr : rgba(90,122,16,0.42);

  /* 雙欄卡片 */
  --sm-dbl-bg           : rgba(37,38,36,0.035);
  --sm-dbl-bdr          : rgba(37,38,36,0.1);
  --sm-dbl-hover-bg     : rgba(37,38,36,0.07);
  --sm-dbl-hover-bdr    : rgba(14,104,130,0.28);
  --sm-dbl-active-bg    : rgba(14,104,130,0.08);
  --sm-dbl-icon-active-bg : rgba(14,104,130,0.12);
  --sm-dbl-icon-active-bdr: rgba(14,104,130,0.30);
}
    `;
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════
     Toggle 動畫工具（供 menu-item 的 target 功能使用）
  ═══════════════════════════════════════════ */
  function _isElHidden(el) {
    if (!el) return true;
    if (el.style.display === 'none') return true;
    return getComputedStyle(el).display === 'none';
  }

  function _showEl(el, animate) {
    if (animate === 'fade') {
      el.style.opacity    = '0';
      el.style.display    = '';
      el.style.transition = 'opacity .25s ease';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.addEventListener('transitionend', () => {
          el.style.transition = '';
        }, { once: true });
      }));
    } else {
      el.style.display = '';
    }
  }

  function _hideEl(el, animate) {
    if (animate === 'fade') {
      el.style.transition = 'opacity .25s ease';
      el.style.opacity    = '0';
      el.addEventListener('transitionend', () => {
        el.style.display    = 'none';
        el.style.opacity    = '';
        el.style.transition = '';
      }, { once: true });
    } else {
      el.style.display = 'none';
    }
  }

  /* ═══════════════════════════════════════════
     預設全域設定
  ═══════════════════════════════════════════ */
  const DEFAULTS = {
    theme   : 'dark',
    width   : 320,
    fontSize: '1rem',
    barShow : true,
    barColor: null,
    barWidth: 3,
    barStyle: 'solid',
  };
  let _cfg = { ...DEFAULTS };

  /* ═══════════════════════════════════════════
     工具
  ═══════════════════════════════════════════ */
  function _esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
      .replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ═══════════════════════════════════════════
     <side-menu>
  ═══════════════════════════════════════════ */
  class SideMenuElement extends HTMLElement {
    static get observedAttributes() {
      return ['theme','width','font-size','bar-show','bar-color','bar-width','bar-style'];
    }

    connectedCallback()              { this._applyVars(); }
    attributeChangedCallback()       { if (this.isConnected) this._applyVars(); }

    _applyVars() {
      const theme    = this.getAttribute('theme')      || _cfg.theme;
      const width    = parseInt(this.getAttribute('width')     || _cfg.width, 10);
      const fs       = this.getAttribute('font-size')  || _cfg.fontSize;
      const barShow  = (this.getAttribute('bar-show')  ?? String(_cfg.barShow)) !== 'false';
      const barColor = this.getAttribute('bar-color')  || _cfg.barColor;
      const barWidth = parseInt(this.getAttribute('bar-width') || _cfg.barWidth, 10);
      const barStyle = this.getAttribute('bar-style')  || _cfg.barStyle;

      // 確保 theme 屬性同步（供 CSS 選擇器使用）
      if (this.getAttribute('theme') !== theme) this.setAttribute('theme', theme);

      const st = this.style;
      st.setProperty('--sm-w',          `${width}px`);
      st.setProperty('--sm-fs',         fs);
      st.setProperty('--sm-bar-display', barShow ? 'block' : 'none');
      st.setProperty('--sm-bar-w',      `${barWidth}px`);
      st.setProperty('--sm-bar-st',     barStyle);

      if (barColor) {
        st.setProperty('--sm-bar-active-c', barColor);
        // hover 版：加上 40% 透明度
        st.setProperty('--sm-bar-hover-c', barColor + '66');
      } else {
        st.removeProperty('--sm-bar-active-c');
        st.removeProperty('--sm-bar-hover-c');
      }
    }

    setTheme(theme) {
      this.setAttribute('theme', theme);
      this.dispatchEvent(new CustomEvent('theme-change', {
        bubbles: true, detail: { theme }
      }));
    }

    static config(opts = {}) { Object.assign(_cfg, opts); }
    static resetConfig()     { _cfg = { ...DEFAULTS }; }
  }

  /* ═══════════════════════════════════════════
     <menu-brand>
  ═══════════════════════════════════════════ */
  class MenuBrandElement extends HTMLElement {
    connectedCallback() { /* 樣式由 CSS 定義，無需額外處理 */ }
  }

  /* ═══════════════════════════════════════════
     <menu-section>
  ═══════════════════════════════════════════ */
  class MenuSectionElement extends HTMLElement {
    static get observedAttributes() { return ['label','col']; }

    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this._build();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (!this.isConnected || !this._built || oldVal === newVal) return;
      if (name === 'label') {
        const sp = this.querySelector('.sm-group-label span');
        if (sp) sp.textContent = newVal || '';
      }
      if (name === 'col') {
        const wrap = this.querySelector('.sm-items-wrap');
        if (wrap) {
          wrap.setAttribute('data-col', newVal || '1');
          wrap.querySelectorAll('menu-item').forEach(i => i._render?.());
        }
      }
    }

    _build() {
      // 插入分組標題
      const labelText = this.getAttribute('label') || '';
      if (labelText) {
        const lbl = document.createElement('div');
        lbl.className = 'sm-group-label';
        lbl.innerHTML = `<span>${_esc(labelText)}</span>`;
        this.insertBefore(lbl, this.firstChild);
      }

      // 延遲一 tick，確保子 menu-item 全部連接後再包裹
      setTimeout(() => {
        const col   = this.getAttribute('col') || '1';
        const items = Array.from(this.querySelectorAll(':scope > menu-item'));
        if (!items.length) return;

        const wrap = document.createElement('div');
        wrap.className = 'sm-items-wrap';
        wrap.setAttribute('data-col', col);

        // 移入 wrap（會觸發 menu-item.connectedCallback，帶正確 col 重新渲染）
        items.forEach(item => wrap.appendChild(item));
        this.appendChild(wrap);
      }, 0);
    }
  }

  /* ═══════════════════════════════════════════
     <menu-item>
  ═══════════════════════════════════════════ */
  class MenuItemElement extends HTMLElement {
    static get observedAttributes() { return ['icon','title','subtitle','target']; }

    connectedCallback() {
      this.setAttribute('tabindex', '0');
      this.setAttribute('role', 'menuitem');
      this._render();
      this._bindEvents();
      // 延遲一 tick，等目標元素就緒後偵測初始狀態
      setTimeout(() => this._syncTargetState(), 0);
    }

    attributeChangedCallback() { if (this.isConnected) this._render(); }

    _col() {
      return this.closest('.sm-items-wrap')?.getAttribute('data-col') || '1';
    }

    _render() {
      const col  = this._col();
      const icon = this.getAttribute('icon');
      const ttl  = this.getAttribute('title')    || '';
      const sub  = this.getAttribute('subtitle') || '';

      const iconHtml = icon
        ? `<div class="sm-icon"><i class="bi ${_esc(icon)}"></i></div>`
        : '';
      const subHtml = sub
        ? `<span class="sm-sub">${_esc(sub)}</span>`
        : '';

      if (col === '2') {
        this.innerHTML =
          `<div class="sm-double${icon ? '' : ' no-icon'}">
            ${iconHtml}
            <div class="sm-body">
              <span class="sm-title">${_esc(ttl)}</span>
              ${subHtml}
            </div>
          </div>`;
      } else {
        this.innerHTML =
          `<div class="sm-single">
            <div class="sm-bar"></div>
            ${iconHtml}
            <div class="sm-body">
              <span class="sm-title">${_esc(ttl)}</span>
              ${subHtml}
            </div>
          </div>`;
      }
    }

    _bindEvents() {
      if (this._evBound) return;
      this._evBound = true;

      this.addEventListener('click', () => this._activate());
      this.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._activate(); }
      });
    }

    /* ── 目標元素清單 ─────────────────────── */
    _targetEls() {
      const sel = (this.getAttribute('target') || '').trim();
      if (!sel) return [];
      try { return Array.from(document.querySelectorAll(sel)); }
      catch { return []; }
    }

    /* ── 初始化 target 同步（連接後偵測目標初始狀態）*/
    _syncTargetState() {
      const els = this._targetEls();
      if (!els.length) return;
      // 若目標目前是顯示的，item 設為 active
      if (!_isElHidden(els[0])) this.classList.add('active');
    }

    /* ── 點擊觸發 ─────────────────────────── */
    _activate() {
      const targetSel = this.getAttribute('target');

      if (targetSel) {
        /* ── Toggle 模式 ── */
        this._handleToggle();
      } else {
        /* ── 一般導覽模式 ── */
        const menu  = this.closest('side-menu');
        const scope = menu || document;
        scope.querySelectorAll('menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        this._dispatchSelect();
      }
    }

    /* ── Toggle 目標顯示狀態 ──────────────── */
    _handleToggle() {
      const els = this._targetEls();
      if (!els.length) return;

      const mode    = this.getAttribute('toggle-mode') || 'display';
      const animate = this.getAttribute('animate')     || '';
      const nextOpen = _isElHidden(els[0]);   // 目前隱藏 → 下一步顯示

      els.forEach(el => {
        if (mode === 'class') {
          const cls = this.getAttribute('toggle-class') || 'is-hidden';
          el.classList.toggle(cls, !nextOpen);
        } else {
          nextOpen ? _showEl(el, animate) : _hideEl(el, animate);
        }
      });

      /* active 狀態跟隨開關 */
      if (nextOpen) {
        this.classList.add('active');
      } else {
        this.classList.remove('active');
      }

      /* 發出 menu-toggle 事件 */
      this.dispatchEvent(new CustomEvent('menu-toggle', {
        bubbles: true,
        detail : {
          open   : nextOpen,
          target : this.getAttribute('target'),
          title  : this.getAttribute('title') || '',
          targets: els,
        }
      }));

      this._dispatchSelect();
    }

    /* ── 公開 API：強制開 / 關 ──────────── */
    openTarget()  { this._setTarget(true);  }
    closeTarget() { this._setTarget(false); }

    _setTarget(toOpen) {
      const els     = this._targetEls();
      const mode    = this.getAttribute('toggle-mode') || 'display';
      const animate = this.getAttribute('animate')     || '';
      els.forEach(el => {
        if (mode === 'class') {
          const cls = this.getAttribute('toggle-class') || 'is-hidden';
          el.classList.toggle(cls, !toOpen);
        } else {
          toOpen ? _showEl(el, animate) : _hideEl(el, animate);
        }
      });
      toOpen ? this.classList.add('active') : this.classList.remove('active');
    }

    /* ── 共用：發出 menu-select ──────────── */
    _dispatchSelect() {
      this.dispatchEvent(new CustomEvent('menu-select', {
        bubbles: true,
        detail : {
          item   : this,
          title  : this.getAttribute('title')   || '',
          section: this.closest('menu-section')?.getAttribute('label') || '',
          col    : this._col(),
          icon   : this.getAttribute('icon')   || null,
        }
      }));
    }
  }

  /* ═══════════════════════════════════════════
     <menu-footer>
  ═══════════════════════════════════════════ */
  class MenuFooterElement extends HTMLElement {
    connectedCallback() { /* 樣式由 CSS 定義 */ }
  }

  /* ═══════════════════════════════════════════
     註冊
  ═══════════════════════════════════════════ */
  customElements.define('side-menu',    SideMenuElement);
  customElements.define('menu-brand',   MenuBrandElement);
  customElements.define('menu-section', MenuSectionElement);
  customElements.define('menu-item',    MenuItemElement);
  customElements.define('menu-footer',  MenuFooterElement);

  window.SideMenu = SideMenuElement;
})();
