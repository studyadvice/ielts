/*!
 * ui-theme-switcher.js v1.2.0
 * 語意標籤元件：<ui-theme-switcher></ui-theme-switcher>
 * CSS 與 JS 同檔，不使用 shadow DOM。
 *
 * 屬性：
 *   storage-key  儲存鍵名前綴，預設 "ui-theme"（也可在載入前設定 window.UI_THEME_KEY）
 *   placement    選單展開方向，top 或 bottom，預設 top
 *   align        選單對齊，start 或 end，預設 start
 *   label        觸發按鈕文字，預設「外觀」
 *
 * 事件：document 會收到 "ui-theme-change"，detail 為 { mode, color, colorName, resolved }
 *
 * API：UIThemeSwitcher.get() / set({ mode, color }) / register(def) / roles / themes / brand / addBrand(name, hex, label)
 *
 * 品牌色：固定色碼，不隨主題與亮暗切換，以 --brand-名稱 輸出，例如 --brand-lavender。
 *
 * 建議放在 <head> 最前面載入，頁面會在繪製前套用已儲存的主題，避免閃爍。
 */
(function () {
  'use strict';
  if (window.UIThemeSwitcher) { return; }

  var DEFAULT_KEY = window.UI_THEME_KEY || 'ui-theme';
  var MODES = ['light', 'dark', 'system'];

  /* 角色清單：[變數名稱, 用途說明] */
  var ROLES = [
    ['bg-base', '整頁底色'],
    ['bg-panel', '卡片、側邊欄、浮層'],
    ['bg-hover', '懸停與選取底色'],
    ['text-main', '主要文字'],
    ['text-muted', '次要文字'],
    ['border', '邊框與分隔線'],
    ['accent', '主要強調色'],
    ['accent-2', '次要強調色'],
    ['warning', '警告與危險'],
    ['safe', '成功與安全'],
    ['info', '資訊'],
    ['caution', '注意'],
    ['focus', '焦點與高亮'],
    ['on-color', '實色底上的文字']
  ];

  /* 品牌色：[名稱, 色碼, 說明]，輸出為 --brand-名稱，不隨主題改變 */
  var BRAND = [
    ['bg', '#0C0D0C', '底層背景'],
    ['shell', '#C6C7BD', '主要文字'],
    ['lavender', '#C3A5E5', '薰衣草紫'],
    ['sky', '#82C8E5', '天空藍'],
    ['warning', '#E6374B', '警告紅'],
    ['salmon', '#E5C3B3', '鮭魚粉'],
    ['ocean', '#1CCAE8', '海洋藍'],
    ['safe', '#27AE60', '安全綠'],
    ['teal', '#0DA591', '藍綠'],
    ['vanilla', '#DBEDD8', '香草綠白'],
    ['yellow', '#E3D322', '黃'],
    ['focus', '#D4FFFC', '焦點淺青'],
    ['special', '#B3DE73', '特別黃綠'],
    ['info', '#4171BF', '資訊藍'],
    ['indigo', '#7849C9', '靛紫'],
    ['pink', '#FF91D7', '粉紅'],
    ['orange', '#EDA109', '橘']
  ];

  function pal(a) {
    var o = {};
    for (var i = 0; i < ROLES.length; i++) { o[ROLES[i][0]] = a[i]; }
    return o;
  }

  /* 順序：底色、面板、懸停、主文字、次文字、邊框、強調、強調2、警告、成功、資訊、注意、焦點、實色上文字 */
  var THEMES = [
    {
      id: 'shell', name: 'Shell',
      dark: pal(['#0C0D0C', '#161816', '#232623', '#C6C7BD', '#8F9088', '#3A3D3A', '#82C8E5', '#C3A5E5', '#E6374B', '#27AE60', '#4171BF', '#EDA109', '#D4FFFC', '#0C0D0C']),
      light: pal(['#F3F4EE', '#FFFFFF', '#E4E6DC', '#1B1D1A', '#5C5F58', '#B9BCB0', '#1A7FA8', '#7849C9', '#C4182C', '#1E8449', '#2F5AA6', '#B87800', '#0DA591', '#FFFFFF'])
    },
    {
      id: 'evernight', name: 'Evernight',
      dark: pal(['#1A1217', '#241920', '#32232C', '#E8DDE2', '#A8939D', '#4A3641', '#E57A8C', '#C3A5E5', '#FF5A6E', '#4CC38A', '#6FA3F0', '#EDA109', '#FFD1DA', '#1A1217']),
      light: pal(['#FBF3F5', '#FFFFFF', '#F3E1E6', '#2A1A20', '#75585F', '#DDBFC7', '#C2455B', '#7849C9', '#C4182C', '#1E8449', '#2F5AA6', '#B87800', '#C2455B', '#FFFFFF'])
    },
    {
      id: 'everforest', name: 'Everforest',
      dark: pal(['#2D353B', '#343F44', '#3D484D', '#D3C6AA', '#9DA9A0', '#4F5B58', '#A7C080', '#D699B6', '#E67E80', '#83C092', '#7FBBB3', '#DBBC7F', '#E69875', '#2D353B']),
      light: pal(['#FDF6E3', '#FFFBEF', '#F0EED9', '#5C6A72', '#6F7E70', '#D6D3BC', '#8DA101', '#DF69BA', '#F85552', '#35A77C', '#3A94C5', '#DFA000', '#F57D26', '#2D353B'])
    },
    {
      id: 'catppuccin', name: 'Catppuccin',
      dark: pal(['#1E1E2E', '#313244', '#45475A', '#CDD6F4', '#A6ADC8', '#585B70', '#CBA6F7', '#F5C2E7', '#F38BA8', '#A6E3A1', '#89B4FA', '#F9E2AF', '#94E2D5', '#1E1E2E']),
      light: pal(['#EFF1F5', '#FFFFFF', '#DCE0E8', '#4C4F69', '#6C6F85', '#ACB0BE', '#8839EF', '#EA76CB', '#D20F39', '#40A02B', '#1E66F5', '#DF8E1D', '#179299', '#FFFFFF'])
    },
    {
      id: 'gruvbox', name: 'Gruvbox',
      dark: pal(['#282828', '#3C3836', '#504945', '#EBDBB2', '#A89984', '#665C54', '#FABD2F', '#D3869B', '#FB4934', '#B8BB26', '#83A598', '#FE8019', '#8EC07C', '#282828']),
      light: pal(['#FBF1C7', '#F9F5D7', '#EBDBB2', '#3C3836', '#7C6F64', '#BDAE93', '#B57614', '#8F3F71', '#9D0006', '#79740E', '#076678', '#AF3A03', '#427B58', '#FBF1C7'])
    },
    {
      id: 'oled', name: 'OLED',
      dark: pal(['#000000', '#0D0D0D', '#1A1A1A', '#E6E6E6', '#9A9A9A', '#333333', '#6EA8FF', '#B794F6', '#FF4D5E', '#34D17A', '#5B9DFF', '#FFB020', '#D4FFFC', '#000000']),
      light: pal(['#FFFFFF', '#F7F7F7', '#EAEAEA', '#111111', '#666666', '#CCCCCC', '#1D5FD1', '#6B3FD1', '#C4182C', '#1E8449', '#1D5FD1', '#B87800', '#0A7A6C', '#FFFFFF'])
    }
  ];

  var state = { mode: 'dark', color: THEMES[0].id, key: DEFAULT_KEY };
  var instances = [];
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function findTheme(id) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) { return THEMES[i]; }
    }
    return null;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function readStore(k) {
    try { return window.localStorage.getItem(k); } catch (e) { return null; }
  }
  function writeStore(k, v) {
    try { window.localStorage.setItem(k, v); } catch (e) { /* 忽略儲存失敗 */ }
  }

  function load(key) {
    state.key = key;
    var m = readStore(key + '-mode');
    var c = readStore(key + '-color');
    state.mode = MODES.indexOf(m) > -1 ? m : 'dark';
    state.color = findTheme(c) ? c : THEMES[0].id;
  }

  function persist() {
    writeStore(state.key + '-mode', state.mode);
    writeStore(state.key + '-color', state.color);
  }

  function resolved() {
    if (state.mode === 'system') { return (mq && mq.matches) ? 'dark' : 'light'; }
    return state.mode === 'light' ? 'light' : 'dark';
  }

  function apply() {
    var r = resolved();
    var h = document.documentElement;
    h.setAttribute('data-jstheme', r);
    h.setAttribute('data-color', state.color);
    h.setAttribute('data-bs-theme', r);
  }

  function ensureStyle(id, css) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = css;
  }

  /* 產生所有主題的變數規則。後代選擇器讓容器上的 data-jstheme 也能固定亮或暗。 */
  function buildVars() {
    var out = [];
    var b = ':root{';
    BRAND.forEach(function (c) { b += '--brand-' + c[0] + ':' + c[1] + ';'; });
    out.push(b + '}');
    THEMES.forEach(function (t) {
      ['dark', 'light'].forEach(function (m) {
        var sel = '[data-color="' + t.id + '"][data-jstheme="' + m + '"],[data-color="' + t.id + '"] [data-jstheme="' + m + '"]';
        var body = 'color-scheme:' + m + ';';
        ROLES.forEach(function (r) { body += '--' + r[0] + ':' + t[m][r[0]] + ';'; });
        out.push(sel + '{' + body + '}');
      });
    });
    ensureStyle('ui-theme-switcher-vars', out.join('\n'));
  }

  var CSS = [
    'ui-theme-switcher{position:relative;display:inline-block;font-size:1rem;line-height:1.5;color:var(--text-main)}',
    'ui-theme-switcher .uts-trigger,ui-theme-switcher .uts-item{display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;border:0;border-radius:8px;background:transparent;color:var(--text-main);font:inherit;font-size:0.95rem;line-height:1.5;text-align:left;cursor:pointer}',
    'ui-theme-switcher .uts-trigger:hover,ui-theme-switcher .uts-item:hover,ui-theme-switcher .uts-trigger:focus-visible,ui-theme-switcher .uts-item:focus-visible{background:var(--bg-hover);outline:none}',
    'ui-theme-switcher[open] .uts-trigger{background:var(--bg-hover)}',
    'ui-theme-switcher .uts-icon{flex:none}',
    'ui-theme-switcher .uts-menu,ui-theme-switcher .uts-sub{display:none;position:absolute;min-width:240px;padding:6px;background:var(--bg-panel);border:1px solid var(--border);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.8);z-index:1080}',
    'ui-theme-switcher[open] .uts-menu{display:block}',
    'ui-theme-switcher .uts-menu{left:0;bottom:calc(100% + 6px)}',
    'ui-theme-switcher[placement="bottom"] .uts-menu{top:calc(100% + 6px);bottom:auto}',
    'ui-theme-switcher[align="end"] .uts-menu{left:auto;right:0}',
    'ui-theme-switcher .uts-subwrap{position:relative}',
    'ui-theme-switcher .uts-subwrap.is-open .uts-sub{display:block}',
    'ui-theme-switcher .uts-sub{left:calc(100% + 12px);bottom:-7px}',
    'ui-theme-switcher[placement="bottom"] .uts-sub{top:-7px;bottom:auto}',
    'ui-theme-switcher .uts-sub.flip{left:auto;right:calc(100% + 12px)}',
    'ui-theme-switcher .uts-sep{height:1px;margin:6px 0;background:var(--border)}',
    'ui-theme-switcher .uts-check{margin-left:auto;display:inline-flex;color:var(--accent)}',
    'ui-theme-switcher .uts-value{margin-left:auto;color:var(--text-muted);font-size:0.85rem}',
    'ui-theme-switcher .uts-badge{display:inline-flex;align-items:center;justify-content:center;flex:none;width:20px;height:20px;border-radius:5px;font-size:0.75rem;font-weight:700;line-height:1}'
  ].join('\n');

  function icon(inner, fill) {
    return '<svg class="uts-icon" viewBox="0 0 24 24" width="16" height="16" fill="' + (fill || 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }
  var ICON = {
    sun: icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'),
    moon: icon('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    monitor: icon('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'),
    check: icon('<path d="M20 6L9 17l-5-5"/>'),
    chev: icon('<path d="M9 18l6-6-6-6"/>'),
    contrast: icon('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>')
  };

  function emit() {
    document.dispatchEvent(new CustomEvent('ui-theme-change', { detail: api.get() }));
  }

  function rerender() {
    instances.forEach(function (el) { el.render(); });
  }

  var api = {
    version: '1.2.0',
    roles: ROLES,
    themes: THEMES,
    brand: BRAND,
    get: function () {
      var t = findTheme(state.color);
      return { mode: state.mode, color: state.color, colorName: t ? t.name : state.color, resolved: resolved() };
    },
    set: function (opts) {
      opts = opts || {};
      if (opts.mode && MODES.indexOf(opts.mode) > -1) { state.mode = opts.mode; }
      if (opts.color && findTheme(opts.color)) { state.color = opts.color; }
      persist();
      apply();
      rerender();
      emit();
    },

    /* 新增或覆蓋品牌色，只接受不透明色碼（#rgb 或 #rrggbb） */
    addBrand: function (name, hex, label) {
      name = String(name || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (!name || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) { return false; }
      for (var i = 0; i < BRAND.length; i++) {
        if (BRAND[i][0] === name) {
          BRAND[i][1] = hex;
          if (label) { BRAND[i][2] = label; }
          buildVars();
          return true;
        }
      }
      BRAND.push([name, hex, label || name]);
      buildVars();
      return true;
    },
    /* 註冊自訂主題：{ id, name, dark: [14 個色碼], light: [14 個色碼] }，順序同 roles */
    register: function (def) {
      if (!def || !def.id || findTheme(def.id)) { return false; }
      THEMES.push({ id: def.id, name: def.name || def.id, dark: pal(def.dark), light: pal(def.light) });
      buildVars();
      rerender();
      return true;
    }
  };

  class UIThemeSwitcherEl extends HTMLElement {
    constructor() {
      super();
      this._subOpen = false;
      this._onClick = this._onClick.bind(this);
      this._onDoc = this._onDoc.bind(this);
      this._onKey = this._onKey.bind(this);
    }

    connectedCallback() {
      var k = this.getAttribute('storage-key');
      if (k && k !== state.key) { load(k); apply(); }
      instances.push(this);
      this.addEventListener('click', this._onClick);
      document.addEventListener('click', this._onDoc);
      document.addEventListener('keydown', this._onKey);
      this.render();
    }

    disconnectedCallback() {
      this.removeEventListener('click', this._onClick);
      document.removeEventListener('click', this._onDoc);
      document.removeEventListener('keydown', this._onKey);
      var i = instances.indexOf(this);
      if (i > -1) { instances.splice(i, 1); }
    }

    _onDoc(e) {
      /* 使用 composedPath，避免點擊後重新繪製造成 target 脫離而誤判為外部點擊 */
      var path = e.composedPath ? e.composedPath() : [];
      if (path.indexOf(this) === -1) { this._close(); }
    }

    _onKey(e) {
      if (e.key === 'Escape') { this._close(); }
    }

    _close() {
      if (this.hasAttribute('open')) {
        this.removeAttribute('open');
        this._subOpen = false;
        this.render();
      }
    }

    _onClick(e) {
      var t = e.target.closest('[data-act]');
      if (!t) { return; }
      var act = t.getAttribute('data-act');
      if (act === 'toggle') {
        if (this.hasAttribute('open')) {
          this.removeAttribute('open');
          this._subOpen = false;
        } else {
          this.setAttribute('open', '');
        }
        this.render();
      } else if (act === 'mode') {
        api.set({ mode: t.getAttribute('data-mode') });
      } else if (act === 'sub') {
        this._subOpen = !this._subOpen;
        this.render();
      } else if (act === 'color') {
        api.set({ color: t.getAttribute('data-color-id') });
      }
    }

    render() {
      var mode = state.mode;
      var cur = findTheme(state.color) || THEMES[0];
      var label = this.getAttribute('label') || '外觀';
      var h = '';
      h += '<button type="button" class="uts-trigger" data-act="toggle">' + ICON.contrast + '<span>' + esc(label) + '</span></button>';
      h += '<div class="uts-menu">';
      [['light', '淺色', ICON.sun], ['dark', '深色', ICON.moon], ['system', '跟隨系統', ICON.monitor]].forEach(function (m) {
        h += '<button type="button" class="uts-item" data-act="mode" data-mode="' + m[0] + '">' + m[2] + '<span>' + m[1] + '</span>' +
          (mode === m[0] ? '<span class="uts-check">' + ICON.check + '</span>' : '') + '</button>';
      });
      h += '<div class="uts-sep"></div>';
      h += '<div class="uts-subwrap' + (this._subOpen ? ' is-open' : '') + '">';
      h += '<button type="button" class="uts-item" data-act="sub">' + badge(cur) + '<span>色彩主題</span><span class="uts-value">' + esc(cur.name) + '</span>' + ICON.chev + '</button>';
      h += '<div class="uts-sub">';
      THEMES.forEach(function (t) {
        h += '<button type="button" class="uts-item" data-act="color" data-color-id="' + esc(t.id) + '">' + badge(t) + '<span>' + esc(t.name) + '</span>' +
          (t.id === state.color ? '<span class="uts-check">' + ICON.check + '</span>' : '') + '</button>';
      });
      h += '</div></div></div>';
      this.innerHTML = h;
      if (this._subOpen) { this._place(); }
    }

    _place() {
      var sub = this.querySelector('.uts-sub');
      if (!sub) { return; }
      sub.classList.remove('flip');
      var r = sub.getBoundingClientRect();
      if (r.right > window.innerWidth) { sub.classList.add('flip'); }
    }
  }

  function badge(t) {
    var letter = esc(t.name.charAt(0).toUpperCase());
    return '<span class="uts-badge" style="background:' + t.dark.accent + ';color:' + t.dark['bg-base'] + '">' + letter + '</span>';
  }

  /* 初始化：先套用主題，再註冊元件 */
  load(DEFAULT_KEY);
  buildVars();
  ensureStyle('ui-theme-switcher-style', CSS);
  apply();

  if (mq) {
    var onSys = function () {
      if (state.mode === 'system') { apply(); rerender(); emit(); }
    };
    if (mq.addEventListener) { mq.addEventListener('change', onSys); } else if (mq.addListener) { mq.addListener(onSys); }
  }

  window.addEventListener('storage', function (e) {
    if (e.key === state.key + '-mode' || e.key === state.key + '-color') {
      load(state.key);
      apply();
      rerender();
      emit();
    }
  });

  if (!window.customElements.get('ui-theme-switcher')) {
    window.customElements.define('ui-theme-switcher', UIThemeSwitcherEl);
  }

  window.UIThemeSwitcher = api;
})();
