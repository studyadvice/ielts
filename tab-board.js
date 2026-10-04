/*!
 * TabBoard v1.1.0
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 宣告式用法：
 *   <tab-board theme="teal" tab-style="side" tab-width="140px">
 *     <tb-tab icon="house" label="首頁">
 *       <p>任意 HTML 內容，支援巢狀結構。</p>
 *     </tb-tab>
 *     <tb-tab icon="calendar" label="行程">
 *       <div class="p-3"><p>Bootstrap 工具類別也可直接使用。</p></div>
 *     </tb-tab>
 *     <tb-tab icon="bell" label="通知" disabled>
 *       <p>此頁籤不可點擊。</p>
 *     </tb-tab>
 *   </tab-board>
 *
 * ── <tab-board> 屬性 ──────────────────────────────────────────────────────────
 *   theme           — dark|light|teal|ocean|indigo|warm|safe|sky|lavender|
 *                     salmon|special|pink|yellow|aurora（預設 dark）
 *   tab-style       — side|filled|dot（預設 side）
 *   layout          — vertical|horizontal（預設 vertical；side 固定水平）
 *   animation       — fade|slide|none（預設 fade）
 *   width           — 元件總寬度（預設 100%）
 *   min-height      — content area 最小高度（預設 120px）
 *   margin          — 元件外距（預設 0）
 *   content-padding — content area 內距（預設 10px）
 *   tab-width       — side 模式頁籤列寬（預設 140px；filled/dot 無效）
 *   default-first   — 布林，自動選取第一個可用頁籤（預設 false）
 *   orders          — 布林，開啟循序解鎖模式（預設 false）
 *   orders-key      — 字串，localStorage 鍵名，省略時不持久化
 *
 * ── <tb-tab> 屬性 ─────────────────────────────────────────────────────────────
 *   icon     — Bootstrap Icons 名稱（如 house），orders 模式必填（否則顯示預設圓點）
 *   label    — 頁籤文字
 *   disabled — 布林，永遠不可點擊，orders 模式中會被跳過
 *
 * ── 事件 ─────────────────────────────────────────────────────────────────────
 *   tb-select   — CustomEvent（冒泡），detail: { index, label }
 *   tb-complete — CustomEvent（冒泡，orders 模式專用），detail: { total }
 *                 在最後一個可用頁籤被進入時觸發
 *
 * ── 元素方法 ──────────────────────────────────────────────────────────────────
 *   el.select(index)  — 程式化選取（跳過 orders 驗證，可直接跳至任意頁籤）
 *   el.reset()        — orders 模式：清除 localStorage，重置至第一個頁籤
 *   el.refresh()      — 重新掃描 <tb-tab> 子元素並重新掛載
 *   el.getConfig()    — 取得目前有效設定
 *
 * ── 注意 ──────────────────────────────────────────────────────────────────────
 *   Bootstrap Icons CSS 請在專案層級自行引用，元件本身不發出任何外部請求。
 *   頁籤超出寬度時不捲動，請調整 tab-width 或頁籤數量。
 *   orders 模式下，el.select() 會前進 ordersActive 並保存狀態，
 *   但不觸發 orders 順序驗證（可向後或跳躍）。
 */
((G, D) => {
  'use strict';

  const STYLE_ID  = '__tabboard_v1__';
  const LS_PREFIX = 'tb-orders:';

  // ── 主題調色盤 ────────────────────────────────────────────────────────────────
  const THEMES = {
    dark:     { bg:'#0C0D0C', sh:'#C6C7BD', dim:'rgba(198,199,189,0.81)', ab:'#C3A5E5',     at:'#0C0D0C', bar:'#1CCAE8',  hv:'rgba(198,199,189,0.09)', bd:'rgba(198,199,189,0.25)' },
    light:    { bg:'#F4F4F1', sh:'#1A1B1A', dim:'rgba(26,27,26,0.81)',    ab:'#9B6FD4',      at:'#ffffff', bar:'#0DA591',  hv:'rgba(26,27,26,0.07)',    bd:'rgba(26,27,26,0.25)'   },
    teal:     { bg:'#0C0D0C', sh:'#C6C7BD', dim:'rgba(198,199,189,0.81)', ab:'#7849C9',      at:'#ffffff', bar:'#82C8E5',  hv:'rgba(13,165,145,0.25)',  bd:'rgba(198,199,189,0.25)' },
    ocean:    { bg:'#0C0D0C', sh:'#C6C7BD', dim:'rgba(198,199,189,0.81)', ab:'#C3A5E5',      at:'#0C0D0C', bar:'#0DA591',  hv:'rgba(28,202,232,0.10)',  bd:'rgba(198,199,189,0.25)' },
    indigo:   { bg:'#0C0D0C', sh:'#C6C7BD', dim:'rgba(198,199,189,0.81)', ab:'#82C8E5',      at:'#0C0D0C', bar:'#C3A5E5',  hv:'rgba(120,73,201,0.25)',  bd:'rgba(198,199,189,0.25)' },
    warm:     { bg:'#0C0D0C', sh:'#C6C7BD', dim:'rgba(198,199,189,0.81)', ab:'#E5C3B3',      at:'#0C0D0C', bar:'#E3D322',  hv:'rgba(237,161,9,0.25)',   bd:'rgba(198,199,189,0.25)' },
    safe:     { bg:'#0C0D0C', sh:'#C6C7BD', dim:'rgba(198,199,189,0.81)', ab:'#DBEDD8',      at:'#0C0D0C', bar:'#B3DE73',  hv:'rgba(39,174,96,0.25)',   bd:'rgba(198,199,189,0.25)' },
    sky:      { bg:'#0C0D0C', sh:'#C6C7BD', dim:'rgba(198,199,189,0.81)', ab:'#C3A5E5',      at:'#0C0D0C', bar:'#1CCAE8',  hv:'rgba(130,200,229,0.25)', bd:'rgba(198,199,189,0.25)' },
    lavender: { bg:'#0C0D0C', sh:'#C6C7BD', dim:'rgba(198,199,189,0.81)', ab:'#7849C9',      at:'#ffffff', bar:'#FF91D7',  hv:'rgba(195,165,229,0.25)', bd:'rgba(198,199,189,0.25)' },
    salmon:   { bg:'#0C0D0C', sh:'#C6C7BD', dim:'rgba(198,199,189,0.81)', ab:'#EDA109',      at:'#0C0D0C', bar:'#E3D322',  hv:'rgba(229,195,179,0.25)', bd:'rgba(198,199,189,0.25)' },
    special:  { bg:'#0C0D0C', sh:'#C6C7BD', dim:'rgba(198,199,189,0.81)', ab:'#27AE60',      at:'#ffffff', bar:'#DBEDD8',  hv:'rgba(179,222,115,0.25)', bd:'rgba(198,199,189,0.25)' },
    pink:     { bg:'#0C0D0C', sh:'#C6C7BD', dim:'rgba(198,199,189,0.81)', ab:'#C3A5E5',      at:'#0C0D0C', bar:'#E6374B',  hv:'rgba(255,145,215,0.25)', bd:'rgba(198,199,189,0.25)' },
    yellow:   { bg:'#0C0D0C', sh:'#C6C7BD', dim:'rgba(198,199,189,0.81)', ab:'#EDA109',      at:'#0C0D0C', bar:'#B3DE73',  hv:'rgba(227,211,34,0.25)',  bd:'rgba(198,199,189,0.25)' },
    aurora:   { bg:'linear-gradient(160deg,#0C0D1E 0%,#0D1525 60%,#091420 100%)',
                sh:'#D4F0FF', dim:'rgba(212,240,255,0.81)',
                ab:'linear-gradient(135deg,#0DA591 0%,#1CCAE8 100%)',
                at:'#0C0D0C', bar:'#FF91D7', hv:'rgba(195,165,229,0.24)', bd:'rgba(212,240,255,0.25)' },
  };

  const DEF = {
    theme:          'dark',
    tabStyle:       'side',
    layout:         'vertical',
    animation:      'fade',
    width:          '100%',
    minHeight:      '120px',
    margin:         '0',
    contentPadding: '10px',
    tabWidth:       '140px',
    defaultFirst:   false,
    orders:         false,
    ordersKey:      '',
  };

  const mk = (tag, cls) => {
    const e = D.createElement(tag);
    if (cls) e.className = cls;
    return e;
  };

  function ordersLoad(key) {
    try { return parseInt(localStorage.getItem(LS_PREFIX + key), 10) || 0; } catch(e) { return 0; }
  }
  function ordersSave(key, val) {
    try { localStorage.setItem(LS_PREFIX + key, String(val)); } catch(e) {}
  }
  function ordersClear(key) {
    try { localStorage.removeItem(LS_PREFIX + key); } catch(e) {}
  }

  function nextNonDisabled(tabs, from) {
    for (let i = from + 1; i < tabs.length; i++) {
      if (!tabs[i].disabled) return i;
    }
    return -1;
  }

  function updateOrdersVisuals(inst) {
    const { tabs, tabListEl } = inst;
    const cur     = inst.ordersActive;
    const nextIdx = nextNonDisabled(tabs, cur);

    tabListEl.querySelectorAll('.tb-item').forEach((item, i) => {
      if (i >= tabs.length) return;
      const tab = tabs[i];

      item.classList.remove('tb-ord-completed', 'tb-ord-available', 'tb-ord-locked');

      // disabled 頁籤不參與 orders 狀態管理
      if (tab.disabled) return;

      let iconName = tab.icon || 'circle-fill';

      if (i < cur) {
        // 已走過，鎖定
        item.classList.add('tb-ord-completed');
        iconName = 'check2-circle';
      } else if (i === cur) {
        // 當前 active，顯示原圖示（tb-active 由 doSelect 管理）
        iconName = tab.icon || 'circle-fill';
      } else if (i === nextIdx) {
        // 下一個可點擊
        item.classList.add('tb-ord-available');
        iconName = tab.icon || 'circle-fill';
      } else {
        // 尚未解鎖
        item.classList.add('tb-ord-locked');
        iconName = 'lock-fill';
      }

      // 置換圖示 class（移除舊 bi-* 再加新的）
      const ic = item.querySelector('.tb-ic');
      if (ic) {
        ic.className = ic.className.split(' ')
          .filter(c => !c.startsWith('bi-'))
          .join(' ') + ' bi-' + iconName;
      }
    });
  }

  // ── CSS（每頁注入一次）────────────────────────────────────────────────────────
  function ensureCSS() {
    if (D.getElementById(STYLE_ID)) return;
    const s = D.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
tab-board{display:block}
tb-tab{display:none!important}
.tb-wrap{display:block;font-family:-apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC",sans-serif;box-sizing:border-box}
.tb-wrap *,.tb-wrap *::before,.tb-wrap *::after{box-sizing:inherit}
.tb-shell{background:var(--tb-bg);border-radius:16px;overflow:hidden}

/* ── 共用 ─────────────────────────────────────────────────────────────────── */
.tb-item{cursor:pointer;position:relative;display:flex;align-items:center;
  transition:background .15s;user-select:none;-webkit-user-select:none;
  -webkit-tap-highlight-color:transparent}
.tb-item.tb-dis{opacity:.35;pointer-events:none;cursor:default}
.tb-ic{font-size:16px;line-height:1;color:var(--tb-dim);transition:color .15s;flex-shrink:0;display:block}
.tb-lbl{font-size:13px;color:var(--tb-dim);transition:color .15s;white-space:nowrap;line-height:1.3;display:block}
.tb-content{flex:1 1 auto;overflow:auto;color:var(--tb-sh)}

/* ── Side ─────────────────────────────────────────────────────────────────── */
.tb-s-side{display:flex;flex-direction:row;align-items:stretch}
.tb-s-side .tb-tabs{display:flex;flex-direction:column;flex-shrink:0;
  padding:6px 0;border-right:1px solid var(--tb-bd);overflow:hidden}
.tb-s-side .tb-item{flex-direction:row;gap:8px;padding:8px 14px 8px 18px}
.tb-s-side .tb-item:not(.tb-dis):not(.tb-active):not(.tb-ord-completed):not(.tb-ord-locked):hover{background:var(--tb-hv)}
.tb-s-side .tb-item:not(.tb-dis):not(.tb-active):not(.tb-ord-completed):not(.tb-ord-locked):hover .tb-ic,
.tb-s-side .tb-item:not(.tb-dis):not(.tb-active):not(.tb-ord-completed):not(.tb-ord-locked):hover .tb-lbl{color:var(--tb-sh)}
.tb-s-side .tb-item.tb-active{background:var(--tb-hv)}
.tb-s-side .tb-item.tb-active .tb-ic{color:var(--tb-bar)}
.tb-s-side .tb-item.tb-active .tb-lbl{color:var(--tb-sh);font-weight:500}
.tb-bar{position:absolute;left:0;top:20%;bottom:20%;width:3px;
  border-radius:0 3px 3px 0;background:var(--tb-bar);
  opacity:0;transition:opacity .2s}
.tb-s-side .tb-item.tb-active .tb-bar{opacity:1}

/* ── Filled ────────────────────────────────────────────────────────────────── */
.tb-s-filled{display:flex;flex-direction:column}
.tb-s-filled .tb-tabs{display:flex;flex-direction:row;overflow:hidden;
  border-bottom:1px solid var(--tb-bd)}
.tb-s-filled .tb-item{gap:5px;padding:9px 16px;flex-shrink:0}
.tb-s-filled .tb-item:not(.tb-dis):not(.tb-active):not(.tb-ord-completed):not(.tb-ord-locked):hover .tb-ic,
.tb-s-filled .tb-item:not(.tb-dis):not(.tb-active):not(.tb-ord-completed):not(.tb-ord-locked):hover .tb-lbl{color:var(--tb-sh)}
.tb-s-filled .tb-item.tb-active{background:var(--tb-ab)}
.tb-s-filled .tb-item.tb-active .tb-ic,
.tb-s-filled .tb-item.tb-active .tb-lbl{color:var(--tb-at)}

/* ── Dot ───────────────────────────────────────────────────────────────────── */
.tb-s-dot{display:flex;flex-direction:column}
.tb-s-dot .tb-tabs{display:flex;flex-direction:row;overflow:hidden;
  border-bottom:1px solid var(--tb-bd)}
.tb-s-dot .tb-item{gap:5px;padding:9px 16px 11px;flex-shrink:0}
.tb-s-dot .tb-item:not(.tb-dis):not(.tb-active):not(.tb-ord-completed):not(.tb-ord-locked):hover .tb-ic,
.tb-s-dot .tb-item:not(.tb-dis):not(.tb-active):not(.tb-ord-completed):not(.tb-ord-locked):hover .tb-lbl{color:var(--tb-sh)}
.tb-s-dot .tb-item.tb-active .tb-ic,
.tb-s-dot .tb-item.tb-active .tb-lbl{color:var(--tb-sh)}
.tb-dot{width:5px;height:5px;border-radius:50%;background:var(--tb-bar);
  flex-shrink:0;opacity:0;transition:opacity .15s}
.tb-s-dot .tb-item.tb-active .tb-dot{opacity:1}

/* ── 版面修飾（filled / dot 的圖示排列）──────────────────────────────────── */
.tb-lv{flex-direction:column!important;align-items:center!important}
.tb-lh{flex-direction:row!important;align-items:center!important}
.tb-lv .tb-dot{margin-top:3px;align-self:center}
.tb-lh .tb-dot{margin-left:4px}

/* ── Orders 模式 ───────────────────────────────────────────────────────────── */

/* 已完成：圖示用 bar 色，文字略暗，不可互動 */
.tb-ord-completed{pointer-events:none!important;cursor:default!important}
.tb-ord-completed .tb-ic{color:var(--tb-bar)!important;opacity:.76}
.tb-ord-completed .tb-lbl{opacity:.60}

/* 鎖定：整體半透明，不可互動 */
.tb-ord-locked{pointer-events:none!important;cursor:default!important}
.tb-ord-locked .tb-ic{opacity:.28!important}
.tb-ord-locked .tb-lbl{opacity:.28!important}

/* 下一個可點（脈衝動畫吸引注意）*/
.tb-ord-available .tb-ic,.tb-ord-available .tb-lbl{color:var(--tb-sh)!important}
@keyframes tb-pulse{0%,100%{opacity:1}50%{opacity:.50}}
.tb-ord-available .tb-ic{animation:tb-pulse 2.2s ease-in-out infinite}
@media(prefers-reduced-motion:reduce){.tb-ord-available .tb-ic{animation:none}}

/* 在 orders 模式下，已在 active tab 上不給 pointer cursor */
.tb-orders .tb-item.tb-active{cursor:default!important}
`.trim();
    D.head.appendChild(s);
  }

  function applyVars(el, c) {
    [
      ['--tb-bg',  c.bg ], ['--tb-sh',  c.sh ],
      ['--tb-dim', c.dim], ['--tb-ab',  c.ab ],
      ['--tb-at',  c.at ], ['--tb-bar', c.bar],
      ['--tb-hv',  c.hv ], ['--tb-bd',  c.bd ],
    ].forEach(([k, v]) => el.style.setProperty(k, v));
  }

  function makeItem(tab, i) {
    const item = mk('div', 'tb-item');
    if (tab.disabled) item.classList.add('tb-dis');
    item.dataset.idx = String(i);
    return item;
  }

  // orders 模式：永遠建立圖示元素（用於狀態圖示置換），無 icon 時預設 circle-fill
  function appendIcon(item, icon, forceIcon) {
    if (!icon && !forceIcon) return;
    item.appendChild(mk('i', `bi bi-${icon || 'circle-fill'} tb-ic`));
  }

  function appendLabel(item, label) {
    if (!label) return;
    const lbl = mk('span', 'tb-lbl');
    lbl.textContent = label;
    item.appendChild(lbl);
  }

  function buildSide(inst) {
    const { cfg, tabs, shell } = inst;
    shell.classList.add('tb-s-side');
    if (cfg.orders) shell.classList.add('tb-orders');

    const tabList = mk('div', 'tb-tabs');
    tabList.style.width = cfg.tabWidth;

    tabs.forEach((tab, i) => {
      const item = makeItem(tab, i);
      item.appendChild(mk('div', 'tb-bar'));
      appendIcon(item, tab.icon, cfg.orders);
      appendLabel(item, tab.label);
      tabList.appendChild(item);
    });

    const content = mk('div', 'tb-content');
    content.style.minHeight = cfg.minHeight;
    content.style.padding   = cfg.contentPadding;

    shell.appendChild(tabList);
    shell.appendChild(content);
    Object.assign(inst, { tabListEl: tabList, contentEl: content });

    tabList.addEventListener('click', e => {
      const item = e.target.closest('.tb-item:not(.tb-dis)');
      if (item) doSelect(inst, parseInt(item.dataset.idx, 10), 'user');
    });
  }

  function buildTop(inst) {
    const { cfg, tabs, shell } = inst;
    const isFilled = cfg.tabStyle === 'filled';
    shell.classList.add(isFilled ? 'tb-s-filled' : 'tb-s-dot');
    if (cfg.orders) shell.classList.add('tb-orders');

    const tabList = mk('div', 'tb-tabs');
    const lc = cfg.layout === 'horizontal' ? 'tb-lh' : 'tb-lv';

    tabs.forEach((tab, i) => {
      const item = makeItem(tab, i);
      item.classList.add(lc);
      appendIcon(item, tab.icon, cfg.orders);
      appendLabel(item, tab.label);
      if (!isFilled) item.appendChild(mk('span', 'tb-dot'));
      tabList.appendChild(item);
    });

    const content = mk('div', 'tb-content');
    content.style.minHeight = cfg.minHeight;
    content.style.padding   = cfg.contentPadding;

    shell.appendChild(tabList);
    shell.appendChild(content);
    Object.assign(inst, { tabListEl: tabList, contentEl: content });

    tabList.addEventListener('click', e => {
      const item = e.target.closest('.tb-item:not(.tb-dis)');
      if (item) doSelect(inst, parseInt(item.dataset.idx, 10), 'user');
    });
  }

  // ── 選取邏輯 ──────────────────────────────────────────────────────────────────
  // mode: 'user'  — 使用者點擊（遵守 orders 驗證，只能點下一個）
  //        'api'  — 程式化呼叫（跳過驗證，可跳躍，但仍更新 ordersActive）
  //        'init' — 初始化顯示（跳過驗證、不推進 ordersActive、不觸發 tb-complete）
  function doSelect(inst, idx, mode) {
    mode = mode || 'user';
    const { tabs, contentEl, tabListEl, cfg, host } = inst;
    if (idx < 0 || idx >= tabs.length || tabs[idx].disabled) return;

    // Orders 驗證（僅 user 模式）
    if (cfg.orders && mode === 'user') {
      const next = nextNonDisabled(tabs, inst.ordersActive);
      if (idx !== next) return; // 只允許點下一個
    }

    // 更新 active 樣式
    tabListEl.querySelectorAll('.tb-item').forEach((el, i) => {
      el.classList.toggle('tb-active', i === idx);
    });

    const html = tabs[idx].content;
    if (cfg.animation === 'fade') {
      contentEl.style.transition = 'opacity .15s ease';
      contentEl.style.opacity    = '0';
      setTimeout(() => { contentEl.innerHTML = html; contentEl.style.opacity = '1'; }, 160);
    } else if (cfg.animation === 'slide') {
      contentEl.style.transition = 'opacity .2s ease,transform .2s ease';
      contentEl.style.opacity    = '0';
      contentEl.style.transform  = 'translateY(8px)';
      setTimeout(() => {
        contentEl.innerHTML       = html;
        contentEl.style.opacity   = '1';
        contentEl.style.transform = 'translateY(0)';
      }, 210);
    } else {
      contentEl.innerHTML = html;
    }

    if (cfg.orders && mode !== 'init') {
      if (idx >= inst.ordersActive) {
        inst.ordersActive = idx;
        if (cfg.ordersKey) ordersSave(cfg.ordersKey, idx);
      }
    }

    if (cfg.orders) updateOrdersVisuals(inst);

    if (cfg.orders && mode !== 'init') {
      if (nextNonDisabled(tabs, inst.ordersActive) === -1) {
        host.dispatchEvent(new CustomEvent('tb-complete', {
          bubbles: true, cancelable: false,
          detail: { total: tabs.filter(t => !t.disabled).length },
        }));
      }
    }

    inst.activeIndex = idx;
    host.dispatchEvent(new CustomEvent('tb-select', {
      bubbles: true, cancelable: false,
      detail: { index: idx, label: tabs[idx].label },
    }));
  }

  if (!G.customElements) return;

  class TabBoardElement extends HTMLElement {

    static get observedAttributes() {
      return [
        'theme', 'tab-style', 'layout', 'animation', 'width',
        'min-height', 'margin', 'content-padding', 'tab-width',
        'default-first', 'orders', 'orders-key',
      ];
    }

    connectedCallback() {
      this._mountTimer = setTimeout(() => {
        this._cachedTabs = this._parseTabs();
        this._mount();
      }, 0);
    }

    disconnectedCallback() {
      clearTimeout(this._mountTimer);
      this._unmount();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (this._mounted) { this._unmount(); this._mount(); }
    }

    _parseTabs() {
      const tabs = [];
      this.querySelectorAll('tb-tab').forEach(el => {
        tabs.push({
          icon:     el.getAttribute('icon')  || '',
          label:    el.getAttribute('label') || '',
          disabled: el.hasAttribute('disabled'),
          content:  el.innerHTML.trim(),
        });
      });
      return tabs;
    }

    _readCfg() {
      const a = (k, d) => this.hasAttribute(k) ? (this.getAttribute(k) || d) : d;
      const b = (k, d) => this.hasAttribute(k)
        ? (this.getAttribute(k) !== 'false' && this.getAttribute(k) !== '0')
        : d;
      return {
        theme:          a('theme',           DEF.theme),
        tabStyle:       a('tab-style',       DEF.tabStyle),
        layout:         a('layout',          DEF.layout),
        animation:      a('animation',       DEF.animation),
        width:          a('width',           DEF.width),
        minHeight:      a('min-height',      DEF.minHeight),
        margin:         a('margin',          DEF.margin),
        contentPadding: a('content-padding', DEF.contentPadding),
        tabWidth:       a('tab-width',       DEF.tabWidth),
        defaultFirst:   b('default-first',   DEF.defaultFirst),
        orders:         b('orders',          DEF.orders),
        ordersKey:      a('orders-key',      DEF.ordersKey),
      };
    }

    _mount() {
      const cfg    = this._readCfg();
      const colors = THEMES[cfg.theme] || THEMES.dark;
      const tabs   = this._cachedTabs || [];

      ensureCSS();

      const wrap = mk('div', 'tb-wrap');
      wrap.style.width  = cfg.width;
      wrap.style.margin = cfg.margin;
      applyVars(wrap, colors);

      const shell = mk('div', 'tb-shell');
      wrap.appendChild(shell);

      this._inst = {
        cfg, tabs, shell, host: this,
        activeIndex: -1, ordersActive: 0,
        tabListEl: null, contentEl: null,
      };

      cfg.tabStyle === 'side' ? buildSide(this._inst) : buildTop(this._inst);

      this.innerHTML = '';
      this.appendChild(wrap);
      this._mounted = true;

      if (cfg.orders) {
        const raw   = cfg.ordersKey ? ordersLoad(cfg.ordersKey) : 0;
        const bound = Math.max(0, Math.min(raw, tabs.length - 1));
        let start = bound;
        while (start > 0 && tabs[start] && tabs[start].disabled) start--;
        this._inst.ordersActive = start;
        setTimeout(() => doSelect(this._inst, start, 'init'), 50);
      } else if (cfg.defaultFirst) {
        const first = tabs.findIndex(t => !t.disabled);
        if (first >= 0) setTimeout(() => doSelect(this._inst, first), 50);
      }
    }

    _unmount() {
      this.innerHTML = '';
      this._mounted  = false;
      this._inst     = null;
    }

    select(index) {
      if (this._inst) doSelect(this._inst, index, 'api');
      return this;
    }

    reset() {
      if (!this._inst || !this._inst.cfg.orders) return this;
      const { cfg, tabs } = this._inst;
      if (cfg.ordersKey) ordersClear(cfg.ordersKey);
      this._inst.ordersActive = 0;
      const first = tabs.findIndex(t => !t.disabled);
      if (first >= 0) doSelect(this._inst, first, 'init');
      return this;
    }

    refresh() {
      this._cachedTabs = this._parseTabs();
      if (this._mounted) { this._unmount(); this._mount(); }
      return this;
    }

    getConfig() { return this._readCfg(); }
  }

  G.customElements.define('tab-board', TabBoardElement);

})(window, document);
