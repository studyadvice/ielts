/*!
  * <ui-badge>          Badge 元件 — 任意字符、5 種形狀、solid / outline
 * <ui-symbol-picker>  符號選擇器 — 9 分類、3 種模式（inline / compact / popup）
 *
 * 一個 <script> 標籤同時啟用兩個元件。
 *
 * [ui-badge] 屬性
 *   char | shape | fill | bg | color | size | stroke | font-weight | radius | on-click
 *   Click: on-click attr · el.onClick · 'ui-badge:click' CustomEvent
 *
 * [ui-symbol-picker] 屬性
 *   mode        inline | compact | popup
 *   target      CSS 選擇器 → ui-badge 更新 char；input/textarea 更新 value
 *   trigger     Popup 模式的外部觸發元素選擇器
 *   placement   bottom（預設）| top
 *   category    預設開啟的分類 id
 *   categories  分類白名單，逗號分隔，同時決定顯示順序
 *               省略 → 繼承全域設定（預設不含 emoji）
 *               例：categories="geometric,arrow,emoji"
 *   on-select   全域函式名稱
 *   label       Popup 自動生成按鈕的文字（預設 "⬡ 符號"）
 *   Select: on-select attr · el.onSelect · 'ui-symbol-picker:select' CustomEvent
 *   detail: { char, category, categoryLabel, codepoint }
 *
 * [全域設定]
 *   UIBadge.config({
 *     defaultSize, defaultShape, defaultFill, defaultStroke,
 *     defaultFontWeight, defaultRadius, theme:{bg,color,darkText,lightText},
 *     picker: {
 *       defaultMode, defaultCategory,
 *       categories: ['geometric','misc','arrow']  // 白名單決定所有 picker 預設分類
 *     }
 *   })
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════════
     §1  BADGE 預設值
  ══════════════════════════════════════════════════════════════════════════ */
  const CFG = {
    defaultSize:       36,
    defaultShape:      'circle',
    defaultFill:       'outline',
    defaultStroke:     2,
    defaultFontWeight: 700,
    defaultRadius:     6,
    theme: {
      bg:        '#C3A5E5',
      color:     '#C6C7BD',
      darkText:  '#0C0D0C',
      lightText: '#C6C7BD',
    },
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     §2  PICKER 預設值
  ══════════════════════════════════════════════════════════════════════════ */
  const PCFG = {
    defaultMode:     'inline',
    defaultCategory: 'geometric',
    // 全域預設白名單：不含 emoji（預設隱藏）
    // 白名單同時決定 Tab 顯示順序
    categories: ['geometric','drawing','misc','game','music','number','arrow','math'],
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     §2-B  RING 預設值
  ══════════════════════════════════════════════════════════════════════════ */
  const RCFG = {
    defaultSize:         200,
    defaultGap:          12,
    defaultRingWidth:    8,
    defaultLinecap:      'round',
    defaultTrackColor:   '#3A3B39',
    defaultTrackWidth:   1.5,
    defaultCenterColor:  '#C6C7BD',
    defaultCenterSize:   '2rem',
    defaultCenterWeight: '700',
    defaultMargin:       '0',
    defaultPadding:      '0',
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     §3  符號資料（8 分類）
  ══════════════════════════════════════════════════════════════════════════ */
  const SYM = [
    {
      id: 'geometric', label: '幾何', compact: '幾',
      items: [...'■□▲△▶▷▼▽◀◁◆◇●○◎◐◑◒◓◔◕◖◗◢◣◤◥◯▪▫▬▭▮▯▸◂▴▾⬡⬢⬟⬛⬜⬤◈◉◊'],
    },
    {
      id: 'drawing', label: '製圖', compact: '圖',
      items: [
        ...'─│┌┐└┘├┤┬┴┼━┃┏┓┗┛┣┫┳┻╋═║╔╗╚╝╠╣╦╩╬╭╮╯╰╱╲╳┄┅┆┇┈┉┊┋',
        ...'▀▁▂▃▄▅▆▇█▉▊▋▌▍▎▏▐░▒▓▔▕',
      ],
    },
    {
      id: 'misc', label: '雜項', compact: '雜',
      items: [...'★☆✦✧✩✪✫✬✭✮✯✰☀☁☂☃❄⚡☎✆☯♻⚠⚓☠✓✔✗✘✕✖✿❀❁❂❃❊❋©®™¶§'],
    },
    {
      id: 'game', label: '遊戲', compact: '牌',
      items: [...'♠♡♢♣♤♥♦♧☻☺☹♔♕♖♗♘♙♚♛♜♝♞♟⚀⚁⚂⚃⚄⚅'],
    },
    {
      id: 'music', label: '音符', compact: '音',
      items: [...'♩♪♫♬♭♮♯'],
    },
    {
      id: 'number', label: '數字', compact: '圈',
      items: [...'①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳⓪❶❷❸❹❺❻❼❽❾❿'],
    },
    {
      id: 'arrow', label: '箭頭', compact: '箭',
      items: [...'→←↑↓↔↕↖↗↘↙⇒⇐⇑⇓⇔⇕⇖⇗⇘⇙➡⬅⬆⬇➔➜➝➞➟↩↪↻↺⇄⇆⇋⇌'],
    },
    {
      id: 'math', label: '數學', compact: '數',
      items: [
        '+','−','×','÷','=','≠','≤','≥','<','>',
        '±','∓','∞','√','∛','∜','∑','∏','∂','∫','∇',
        '∈','∉','∩','∪','⊂','⊃','⊆','⊇',
        '∧','∨','¬','∀','∃','≈','≡','≅','∝','⊕','⊗',
        'π','φ','θ','λ','μ','σ','α','β','γ','δ',
      ],
    },
    // ── 表情符號（預設不在 PCFG.categories 白名單內，需明確開啟） ────────────
    // 使用陣列形式避免 [...string] 對代理對的切割問題
    {
      id: 'emoji', label: '表情', compact: '表',
      items: [
        '😀','😃','😄','😁','😆','😅','😂','🤣',
        '😊','😍','🥰','😘','😋','😎','🤩','🥳',
        '😢','😭','😤','😡','😰','🤔','😴','🤒',
        '👍','👎','👋','🤚','🙌','👏','💪','🤞',
        '❤','🧡','💛','💚','💙','💜','🖤','💔',
        '⭐','🌟','✨','💫','🔥','💧','🌈','🌙',
        '🎉','🎊','🎈','🎁','🏆','🎯','🔑','💡',
        '🍀','🌸','🌺','🍁','🐶','🐱','🦊','🐼',
      ],
    },
  ];

  /* ═══════════════════════════════════════════════════════════════════════════
     §4  色彩工具
  ══════════════════════════════════════════════════════════════════════════ */
  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }
  function autoTextColor(bgHex) {
    return relativeLuminance(bgHex) > 0.179 ? CFG.theme.darkText : CFG.theme.lightText;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     §4-B  弧段 SVG 建構器（供 ui-ring 使用）
  ══════════════════════════════════════════════════════════════════════════ */
  /**
   * 順時針弧段。0° = 12 點鐘，角度範圍 0–360。
   * from === to → 不畫弧；from → to 相差 360° → 整圓。
   * 跨零點：from=350, to=20 → 順時針 30° 弧。
   */
  function buildArc(cx, cy, R, from, to, color, strokeW, linecap) {
    if (from === to) return '';   // 零長度，跳過

    // 順時針弧長（% 修正負值，|| 360 處理差值恰好是整數倍 360 的情況）
    const span = (((to - from) % 360) + 360) % 360 || 360;
    const sa   = `fill="none" stroke="${color}" stroke-width="${strokeW.toFixed(2)}" stroke-linecap="${linecap}"`;

    if (span >= 359.9) {
      // 整圓：SVG arc 無法繪製 360°，改用 circle
      return `<circle cx="${cx.toFixed(3)}" cy="${cy.toFixed(3)}" r="${R.toFixed(3)}" ${sa}/>`;
    }

    const toRad = a => a * Math.PI / 180;
    const sx  = cx + R * Math.sin(toRad(from));
    const sy  = cy - R * Math.cos(toRad(from));
    const ex  = cx + R * Math.sin(toRad(to));
    const ey  = cy - R * Math.cos(toRad(to));
    const lg  = span > 180 ? 1 : 0;   // large-arc-flag

    return (
      `<path d="M${sx.toFixed(3)},${sy.toFixed(3)} ` +
      `A${R.toFixed(3)},${R.toFixed(3)} 0 ${lg},1 ${ex.toFixed(3)},${ey.toFixed(3)}" ${sa}/>`
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     §5  PICKER 樣式注入（每頁只執行一次）
  ══════════════════════════════════════════════════════════════════════════ */
  function injectPickerStyles() {
    if (document.getElementById('_usp_css')) return;
    const el = document.createElement('style');
    el.id = '_usp_css';
    el.textContent = `
/* ui-symbol-picker ─────────────────────────────────────────────────────── */
ui-symbol-picker { display: inline-block; }

.usp-wrap {
  display: block;
  background: #191A19;
  border: 1px solid #2A2B2A;
  border-radius: 10px;
  overflow: hidden;
  font-family: inherit;
}
.usp-inline  { width: 420px; }
.usp-compact { width: 268px; }

/* popup 浮動面板 */
.usp-popup-panel {
  display: none;
  position: fixed;
  z-index: 9999;
  background: #191A19;
  border: 1px solid #2A2B2A;
  border-radius: 10px;
  overflow: hidden;
  width: 420px;
  /* rgba alpha = 0.85 ≥ 0.76 ✓ */
  box-shadow: 0 8px 28px rgba(0,0,0,0.85);
}

/* 分類 tabs */
.usp-tabs {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 2px;
  padding: 6px 6px 0;
  background: #111211;
  border-bottom: 1px solid #2A2B2A;
  scrollbar-width: none;
}
.usp-tabs::-webkit-scrollbar { display: none; }

.usp-tab, .usp-cell, .usp-trig {
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  margin: 0;
  font-family: inherit;
}
.usp-tab {
  flex-shrink: 0;
  background: transparent;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  color: #797A76;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  line-height: 1.4;
  white-space: nowrap;
}
.usp-tab:hover  { background: #1E1F1E; color: #C6C7BD; }
.usp-tab.usp-on { background: #191A19; border-color: #2A2B2A; color: #C3A5E5; font-weight: 600; }

/* 符號格 */
.usp-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 6px;
  gap: 2px;
  align-content: flex-start;
}
/* compact 捲動容器 */
.usp-scr {
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #3D3E3C #111211;
}
.usp-scr::-webkit-scrollbar       { width: 4px; }
.usp-scr::-webkit-scrollbar-track { background: #111211; }
.usp-scr::-webkit-scrollbar-thumb { background: #3D3E3C; border-radius: 2px; }

.usp-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 5px;
  cursor: pointer;
  color: #C6C7BD;
  line-height: 1;
  padding: 0;
}
.usp-cell:hover  { background: #2D2E2D; border-color: #3D3E3C; color: #DBEDD8; }
.usp-cell:active { background: #30234A; border-color: #C3A5E5; color: #C3A5E5; }

/* inline / popup 尺寸：36×36px */
.usp-inline .usp-cell,
.usp-popup-panel .usp-cell { width: 36px; height: 36px; font-size: 20px; }

/* compact 尺寸：30×30px */
.usp-compact .usp-cell { width: 30px; height: 30px; font-size: 18px; }

/* popup 自動觸發按鈕 */
.usp-trig {
  background: #242524;
  border: 1px solid #2A2B2A;
  border-radius: 8px;
  color: #C3A5E5;
  cursor: pointer;
  font-size: 18px;
  padding: 6px 14px;
  line-height: 1.4;
}
.usp-trig:hover   { background: #2D2E2D; }
.usp-trig.usp-open { background: #30234A; border-color: #C3A5E5; }
`.trim();
    document.head.appendChild(el);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     §6  BADGE SVG 建構器
  ══════════════════════════════════════════════════════════════════════════ */
  function px2u(px, size) { return px * 100 / size; }

  function buildSVG({ char, shape, fill, bg, color, size, stroke, fontWeight, radius }) {
    const isOut   = fill === 'outline';
    const sw      = isOut ? px2u(stroke, size) : 0;
    const pad     = sw / 2 + 3;
    const safe    = char.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const tColor  = color ?? (isOut ? CFG.theme.color : autoTextColor(bg));
    const shFill  = isOut ? 'none' : bg;
    const shStr   = isOut ? bg : 'none';
    const sA      = `fill="${shFill}" stroke="${shStr}" stroke-width="${sw.toFixed(2)}"`;

    let shp = '', ty = 50;

    switch (shape) {
      case 'circle':
        shp = `<circle cx="50" cy="50" r="${(50-pad).toFixed(2)}" ${sA}/>`;
        break;
      case 'square': {
        const x = pad, w = 100-2*pad, rx = Math.min(radius, w/2);
        shp = `<rect x="${x.toFixed(2)}" y="${x.toFixed(2)}" width="${w.toFixed(2)}" height="${w.toFixed(2)}" rx="${rx.toFixed(1)}" ${sA}/>`;
        break;
      }
      case 'triangle': {
        const ay = pad, by = 100-pad;
        shp = `<polygon points="50,${ay.toFixed(2)} ${(100-pad).toFixed(2)},${by.toFixed(2)} ${pad.toFixed(2)},${by.toFixed(2)}" ${sA} stroke-linejoin="round"/>`;
        ty = (ay + by + by) / 3;
        break;
      }
      case 'hexagon': {
        const r = 50-pad;
        const pts = Array.from({length:6}, (_,i) => {
          const a = (i*60-90) * Math.PI/180;
          return `${(50+r*Math.cos(a)).toFixed(2)},${(50+r*Math.sin(a)).toFixed(2)}`;
        }).join(' ');
        shp = `<polygon points="${pts}" ${sA} stroke-linejoin="round"/>`;
        break;
      }
      case 'diamond': {
        const p = pad;
        shp = `<polygon points="50,${p.toFixed(2)} ${(100-p).toFixed(2)},50 50,${(100-p).toFixed(2)} ${p.toFixed(2)},50" ${sA} stroke-linejoin="round"/>`;
        break;
      }
      default:
        shp = `<circle cx="50" cy="50" r="${(50-pad).toFixed(2)}" ${sA}/>`;
    }

    const n  = [...char].length;
    const fs = n===1 ? 46 : n===2 ? 36 : Math.max(Math.floor(48/Math.sqrt(n)), 14);

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" ` +
      `width="${size}" height="${size}" style="display:inline-block;vertical-align:middle;">` +
      shp +
      `<text x="50" y="${ty.toFixed(2)}" text-anchor="middle" dominant-baseline="central" ` +
      `font-size="${fs}" font-weight="${fontWeight}" fill="${tColor}" ` +
      `style="font-family:inherit;user-select:none;pointer-events:none;">${safe}</text>` +
      `</svg>`
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     §7  UIBadge 元件
  ══════════════════════════════════════════════════════════════════════════ */
  class UIBadge extends HTMLElement {
    constructor() { super(); this._onClick = null; this._clickBound = null; }

    static get observedAttributes() {
      return ['char','shape','fill','bg','color','size','stroke','font-weight','radius','on-click'];
    }
    connectedCallback()        { this._render(); }
    attributeChangedCallback() { if (this.isConnected) this._render(); }
    _attr(k, d)                { return this.hasAttribute(k) ? this.getAttribute(k) : d; }

    _render() {
      const char       = this._attr('char',        '?');
      const shape      = this._attr('shape',        CFG.defaultShape);
      const fill       = this._attr('fill',         CFG.defaultFill);
      const size       = parseFloat(this._attr('size',        CFG.defaultSize));
      const stroke     = parseFloat(this._attr('stroke',      CFG.defaultStroke));
      const fontWeight = this._attr('font-weight',  CFG.defaultFontWeight);
      const bg         = this._attr('bg',           CFG.theme.bg);
      const radius     = parseFloat(this._attr('radius',      CFG.defaultRadius));
      const color      = this.hasAttribute('color') ? this.getAttribute('color') : null;

      this.innerHTML     = buildSVG({ char, shape, fill, bg, color, size, stroke, fontWeight, radius });
      this.style.display = 'inline-block';

      const hasClick = this.hasAttribute('on-click') || typeof this._onClick === 'function';
      this.style.cursor = hasClick ? 'pointer' : 'default';

      if (this._clickBound) this.removeEventListener('click', this._clickBound);
      this._clickBound = () => {
        const detail = { char, shape, fill, bg, color, size, element: this };
        const fn = this.getAttribute('on-click');
        if (fn && typeof window[fn] === 'function') window[fn](detail);
        if (typeof this._onClick === 'function') this._onClick(detail);
        this.dispatchEvent(new CustomEvent('ui-badge:click', { bubbles: true, detail }));
      };
      this.addEventListener('click', this._clickBound);
    }
    set onClick(fn) { this._onClick = fn; this.style.cursor = fn ? 'pointer' : 'default'; }
    get onClick()   { return this._onClick; }
  }
  customElements.define('ui-badge', UIBadge);

  /* ═══════════════════════════════════════════════════════════════════════════
     §8  UISymbolPicker 元件
  ══════════════════════════════════════════════════════════════════════════ */
  class UISymbolPicker extends HTMLElement {
    constructor() {
      super();
      this._onSelect       = null;
      this._cat            = null;       // 目前選中分類 id
      this._isOpen         = false;
      this._outsideHandler = null;
      this._keyHandler     = null;
      this._exTriggerEl    = null;       // 外部 trigger 元素
      this._exTriggerCb    = null;
      this._delegated      = false;
    }

    static get observedAttributes() {
      return ['mode','target','trigger','placement','category','categories','on-select','label'];
    }

    connectedCallback() {
      injectPickerStyles();
      if (!this._cat) this._cat = this._attr('category', PCFG.defaultCategory);
      // 事件委派只附加一次（元素生命週期內）
      if (!this._delegated) {
        this.addEventListener('click', e => this._handleClick(e));
        this._delegated = true;
      }
      this._render();
    }

    attributeChangedCallback(name) {
      // 'category' 直接更新目前分類（_panelInner 會做 fallback 驗證）
      if (name === 'category' && this.hasAttribute('category')) {
        this._cat = this.getAttribute('category');
      }
      // 'categories' 白名單變更：_cat 可能不再有效，讓 _panelInner 自動降級
      if (this.isConnected) this._render();
    }

    disconnectedCallback() {
      this._cleanupPopupListeners();
      this._detachExTrigger();
    }

    _attr(k, d) { return this.hasAttribute(k) ? this.getAttribute(k) : d; }

    /* ── 分類白名單（屬性 > 全域設定，順序即 Tab 順序） ─────────────────── */
    _effectiveCategories() {
      const ids = this.hasAttribute('categories')
        ? this.getAttribute('categories').split(',').map(s => s.trim())
        : PCFG.categories;
      return ids.filter(id => SYM.some(c => c.id === id));
    }

    /* ── 確保 _cat 在白名單內，否則自動降級 ─────────────────────────────── */
    _effectiveCat(cats) {
      if (cats.includes(this._cat)) return this._cat;
      const pref = this._attr('category', PCFG.defaultCategory);
      if (cats.includes(pref)) return pref;
      return cats[0] ?? null;
    }

    /* ── 渲染 ─────────────────────────────────────────────────────────────── */
    _render() {
      if (this._isOpen) this._closePopup();  // 重繪前先關閉浮動面板

      const mode = this._attr('mode', PCFG.defaultMode);
      this.style.display = 'inline-block';

      if (mode === 'popup') {
        const label = this._attr('label', '⬡ 符號');
        const hasExtTrig = this.hasAttribute('trigger');
        this.innerHTML =
          (hasExtTrig ? '' : `<button class="usp-trig">${label}</button>`) +
          `<div class="usp-popup-panel">${this._panelInner('inline')}</div>`;
        this._setupExTrigger();
      } else {
        this.innerHTML = `<div class="usp-wrap usp-${mode}">${this._panelInner(mode)}</div>`;
      }
    }

    /* ── 面板內容 HTML ─────────────────────────────────────────────────────── */
    _panelInner(mode) {
      const compact = mode === 'compact';

      // 套用白名單（決定可見分類與 Tab 順序）
      const cats    = this._effectiveCategories();
      const active  = this._effectiveCat(cats);
      this._cat     = active;  // 同步，確保 _switchCat 時參照正確

      const catData = SYM.find(c => c.id === active);

      const tabs = cats.map(id => {
        const c = SYM.find(s => s.id === id);
        if (!c) return '';
        return (
          `<button class="usp-tab${id === active ? ' usp-on' : ''}" ` +
          `data-cat="${id}" title="${c.label}">` +
          (compact ? c.compact : c.label) +
          `</button>`
        );
      }).join('');

      const cells = catData ? catData.items.map(ch => this._cellHTML(ch)).join('') : '';

      return `<div class="usp-tabs">${tabs}</div>` +
             `<div class="usp-grid${compact ? ' usp-scr' : ''}">${cells}</div>`;
    }

    _cellHTML(ch) {
      // 支援多碼點字符（emoji 等），逐一列出各 codepoint
      const cp = [...ch]
        .map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'))
        .join(' ');
      const safe = ch.replace(/"/g, '&quot;');
      return `<button class="usp-cell" data-char="${safe}" title="${ch}  ${cp}">${ch}</button>`;
    }

    /* ── 事件委派入口 ─────────────────────────────────────────────────────── */
    _handleClick(e) {
      const tab  = e.target.closest('.usp-tab');
      const cell = e.target.closest('.usp-cell');
      const trig = e.target.closest('.usp-trig');

      if (tab)  { this._switchCat(tab.dataset.cat); return; }
      if (cell) { this._select(cell.dataset.char);  return; }
      if (trig) { e.stopPropagation(); this._togglePopup(trig); }
    }

    /* ── 切換分類（只更新格子，不重繪整個元件） ────────────────────────── */
    _switchCat(catId) {
      // 驗證：目標分類必須在白名單內
      if (!this._effectiveCategories().includes(catId)) return;
      const cat = SYM.find(c => c.id === catId);
      if (!cat) return;
      this._cat = catId;

      this.querySelectorAll('.usp-tab').forEach(t =>
        t.classList.toggle('usp-on', t.dataset.cat === catId)
      );
      const grid = this.querySelector('.usp-grid');
      if (grid) grid.innerHTML = cat.items.map(ch => this._cellHTML(ch)).join('');
    }

    /* ── 選擇符號 ─────────────────────────────────────────────────────────── */
    _select(char) {
      const catObj = SYM.find(c => c.id === this._cat);
      const detail = {
        char,
        category:      this._cat,
        categoryLabel: catObj?.label ?? '',
        codepoint:     'U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'),
      };

      // 自動更新 target
      const sel = this.getAttribute('target');
      if (sel) {
        const el = document.querySelector(sel);
        if (el) {
          if (el.tagName.toLowerCase() === 'ui-badge') {
            el.setAttribute('char', char);
          } else if (el.matches('input,textarea')) {
            el.value = char;
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }

      // Layer 1: on-select attribute
      const fn = this.getAttribute('on-select');
      if (fn && typeof window[fn] === 'function') window[fn](detail);

      // Layer 2: onSelect property
      if (typeof this._onSelect === 'function') this._onSelect(detail);

      // Layer 3: CustomEvent
      this.dispatchEvent(new CustomEvent('ui-symbol-picker:select', { bubbles: true, detail }));

      // Popup 模式選完後關閉
      if (this._attr('mode', PCFG.defaultMode) === 'popup') this._closePopup();
    }

    /* ── Popup 控制 ───────────────────────────────────────────────────────── */
    _setupExTrigger() {
      this._detachExTrigger();
      const sel = this.getAttribute('trigger');
      if (!sel) return;
      const el = document.querySelector(sel);
      if (!el) return;
      this._exTriggerEl = el;
      this._exTriggerCb = e => { e.stopPropagation(); this._togglePopup(el); };
      el.addEventListener('click', this._exTriggerCb);
    }

    _detachExTrigger() {
      if (this._exTriggerEl && this._exTriggerCb) {
        this._exTriggerEl.removeEventListener('click', this._exTriggerCb);
        this._exTriggerEl = null;
        this._exTriggerCb = null;
      }
    }

    _togglePopup(trigEl) {
      this._isOpen ? this._closePopup() : this._openPopup(trigEl);
    }

    _openPopup(trigEl) {
      const panel = this.querySelector('.usp-popup-panel');
      if (!panel) return;

      panel.style.visibility = 'hidden';
      panel.style.display    = 'block';
      this._positionPopup(trigEl, panel);
      panel.style.visibility = '';

      this._isOpen = true;
      trigEl.classList.add('usp-open');

      setTimeout(() => {
        this._outsideHandler = e => {
          if (!this.contains(e.target) &&
              !(this._exTriggerEl && this._exTriggerEl.contains(e.target))) {
            this._closePopup();
          }
        };
        this._keyHandler = e => { if (e.key === 'Escape') this._closePopup(); };
        document.addEventListener('click',   this._outsideHandler);
        document.addEventListener('keydown', this._keyHandler);
      }, 0);
    }

    _closePopup() {
      const panel = this.querySelector('.usp-popup-panel');
      if (panel) panel.style.display = 'none';
      this._isOpen = false;
      this.querySelectorAll('.usp-trig').forEach(b => b.classList.remove('usp-open'));
      if (this._exTriggerEl) this._exTriggerEl.classList.remove('usp-open');
      this._cleanupPopupListeners();
    }

    _cleanupPopupListeners() {
      if (this._outsideHandler) { document.removeEventListener('click',   this._outsideHandler); this._outsideHandler = null; }
      if (this._keyHandler)     { document.removeEventListener('keydown', this._keyHandler);     this._keyHandler     = null; }
    }

    _positionPopup(trigEl, panel) {
      const placement = this._attr('placement', 'bottom');
      const tr = trigEl.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const pw = panel.offsetWidth,  ph = panel.offsetHeight;

      let left = tr.left;
      let top  = (placement === 'top') ? tr.top - ph - 6 : tr.bottom + 6;

      if (placement !== 'top' && top + ph > vh - 8) top = tr.top - ph - 6;

      if (left + pw > vw - 8) left = vw - pw - 8;
      if (left < 8) left = 8;
      if (top  < 8) top  = 8;

      panel.style.left = left + 'px';
      panel.style.top  = top  + 'px';
    }

    set onSelect(fn) { this._onSelect = fn; }
    get onSelect()   { return this._onSelect; }
  }
  customElements.define('ui-symbol-picker', UISymbolPicker);

  /* ═══════════════════════════════════════════════════════════════════════════
     §10  UIRing 元件
     size           SVG 總尺寸 px                   (預設 200)
     center         中心單行文字
     center-size    中心字體大小                     (預設 '2rem')
     center-color   中心文字色                       (預設 '#C6C7BD')
     center-weight  中心字重                         (預設 '700')
     gap            環間等距 px                      (預設 12)
     ring-width     所有環寬 px（全域統一）           (預設 8)
     track-color    軌道圓圈顏色                     (預設 '#2A2B2A')
     track-width    軌道圓圈線寬 px                  (預設 1.5)
     linecap        弧端形狀 round|butt|square       (預設 'round')
     margin         容器對外邊距（CSS 簡寫）          (預設 '0')
     padding        容器對內邊距（CSS 簡寫）          (預設 '0')
     source         點擊來源 CSS 選擇器（自動隱藏）
     target         點擊目標 CSS 選擇器（寫入 innerHTML）
     rings          JSON 陣列，第 0 項為最外環
                    [{"from":0,"to":90,"color":"#299459"}, ...]
                    from/to：0–360，0=12 點鐘，順時針
  ══════════════════════════════════════════════════════════════════════════ */
  class UIRing extends HTMLElement {
    constructor() {
      super();
      this._delegated = false;
    }

    static get observedAttributes() {
      return [
        'size','center','center-size','center-color','center-weight',
        'gap','ring-width','track-color','track-width','linecap',
        'source','target','margin','padding','rings',
      ];
    }

    connectedCallback() {
      if (!this._delegated) {
        this.addEventListener('click', e => {
          if (e.target.closest('.uir-center')) this._copy();
        });
        this._delegated = true;
      }
      this._render();
    }

    attributeChangedCallback() { if (this.isConnected) this._render(); }

    _attr(k, d) { return this.hasAttribute(k) ? this.getAttribute(k) : d; }

    _render() {
      const size       = parseFloat(this._attr('size',          RCFG.defaultSize));
      const cx         = size / 2;
      const center     = this._attr('center',        '');
      const cColor     = this._attr('center-color',  RCFG.defaultCenterColor);
      const cSize      = this._attr('center-size',   RCFG.defaultCenterSize);
      const cWeight    = this._attr('center-weight', RCFG.defaultCenterWeight);
      const gap        = parseFloat(this._attr('gap',           RCFG.defaultGap));
      const ringW      = parseFloat(this._attr('ring-width',    RCFG.defaultRingWidth));
      const trackColor = this._attr('track-color',   RCFG.defaultTrackColor);
      const trackW     = parseFloat(this._attr('track-width',   RCFG.defaultTrackWidth));
      const linecap    = this._attr('linecap',       RCFG.defaultLinecap);
      const margin     = this._attr('margin',        RCFG.defaultMargin);
      const padding    = this._attr('padding',       RCFG.defaultPadding);

      let rings = [];
      try { rings = JSON.parse(this._attr('rings', '[]')); } catch (_) {}

      const Rmax = cx - ringW / 2 - 2;

      const ringsSVG = rings.map((r, i) => {
        const R = Rmax - i * (ringW + gap);
        if (R <= ringW / 2) return '';
        const track = (
          `<circle cx="${cx}" cy="${cx}" r="${R.toFixed(3)}" ` +
          `fill="none" stroke="${trackColor}" stroke-width="${trackW}"/>`
        );
        const arc = buildArc(
          cx, cx, R,
          r.from ?? 0, r.to ?? 0,
          r.color ?? '#C3A5E5',
          ringW, linecap
        );
        return track + arc;
      }).join('');

      const clickable  = this.hasAttribute('source') && this.hasAttribute('target');
      const safeCenter = String(center)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const centerSVG = center
        ? (`<text class="uir-center" x="${cx}" y="${cx}" ` +
           `text-anchor="middle" dominant-baseline="central" ` +
           `fill="${cColor}" font-size="${cSize}" font-weight="${cWeight}" ` +
           `style="font-family:inherit;user-select:none;${clickable ? 'cursor:pointer;' : ''}"` +
           `>${safeCenter}</text>`)
        : '';

      this.innerHTML =
        `<div style="display:inline-block;line-height:0;margin:${margin};padding:${padding};">` +
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" ` +
        `width="${size}" height="${size}" style="display:block;">` +
        ringsSVG + centerSVG +
        `</svg></div>`;

      this.style.display = 'inline-block';

      if (this.hasAttribute('source')) {
        const src = document.querySelector(this.getAttribute('source'));
        if (src) src.style.display = 'none';
      }
    }

    _copy() {
      const src = this.hasAttribute('source')
        ? document.querySelector(this.getAttribute('source')) : null;
      const tgt = this.hasAttribute('target')
        ? document.querySelector(this.getAttribute('target')) : null;
      if (src && tgt) tgt.innerHTML = src.innerHTML;
    }
  }
  customElements.define('ui-ring', UIRing);

  function injectBtnSwitchStyles() {
    if (document.getElementById('_bsw_css')) return;
    const el = document.createElement('style');
    el.id = '_bsw_css';
    el.textContent = '.bsw-trigger { cursor: pointer !important; }';
    document.head.appendChild(el);
  }

  class BtnSwitch extends HTMLElement {
    constructor() {
      super();
      this._idx        = 0;    // 目前顯示的 source 索引
      this._sources    = [];   // 快取解析後的 source 元素陣列
      this._linkEl     = null; // 連接的觸發容器元素
      this._clickBound = null; // 已綁定的 click handler
    }

    static get observedAttributes() {
      return ['link', 'source', 'target'];
    }

    connectedCallback() {
      injectBtnSwitchStyles();
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        this._init();
      } else {
        document.addEventListener('DOMContentLoaded', () => this._init(), { once: true });
      }
    }

    attributeChangedCallback() {
      if (this.isConnected) setTimeout(() => this._init(), 0);
    }

    disconnectedCallback() { this._detach(); }

    _init() {
      this._detach();
      const linkId = this.getAttribute('link');
      if (!linkId) {
        console.error('<btn-switch>: 必須提供 link 屬性（目標容器的 id）。');
        return;
      }
      const linkEl = document.getElementById(linkId);
      if (!linkEl) {
        console.error(`<btn-switch>: 找不到 id="${linkId}" 的元素。`);
        return;
      }

      const srcAttr = (this.getAttribute('source') || '').trim();
      this._sources = srcAttr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(sel => document.querySelector(sel))
        .filter(Boolean);

      if (srcAttr && this._sources.length === 0) {
        console.warn(`<btn-switch>: 找不到任何 source 元素（${srcAttr}）。`);
      }

      this._sources.forEach(el => { el.style.display = 'none'; });

      this._idx    = 0;
      this._linkEl = linkEl;

      linkEl.classList.add('bsw-trigger');

      this._clickBound = () => this._trigger();
      linkEl.addEventListener('click', this._clickBound);

      this.style.display = 'none';
    }

    _trigger() {
      if (this._sources.length === 0) return;

      const tgtSel = this.getAttribute('target');
      if (!tgtSel) return;
      const tgt = document.querySelector(tgtSel);
      if (!tgt) return;

      tgt.innerHTML = this._sources[this._idx].innerHTML;

      this._idx = (this._idx + 1) % this._sources.length;
    }

    _detach() {
      if (this._linkEl) {
        if (this._clickBound) {
          this._linkEl.removeEventListener('click', this._clickBound);
        }
        this._linkEl.classList.remove('bsw-trigger');
      }
      this._linkEl     = null;
      this._clickBound = null;
      this._sources    = [];
    }
  }
  customElements.define('btn-switch', BtnSwitch);
  window.UIBadge = {
    config(opts = {}) {
      ['defaultSize','defaultShape','defaultFill','defaultStroke','defaultFontWeight','defaultRadius']
        .forEach(k => { if (opts[k] !== undefined) CFG[k] = opts[k]; });
      if (opts.theme) Object.assign(CFG.theme, opts.theme);
      if (opts.picker) {
        const p = opts.picker;
        if (p.defaultMode     !== undefined) PCFG.defaultMode     = p.defaultMode;
        if (p.defaultCategory !== undefined) PCFG.defaultCategory = p.defaultCategory;
        // categories 白名單：覆寫全域預設（陣列順序 = Tab 顯示順序）
        if (Array.isArray(p.categories)) PCFG.categories = [...p.categories];
      }
      if (opts.ring) {
        const r = opts.ring;
        ['defaultSize','defaultGap','defaultRingWidth','defaultLinecap',
         'defaultTrackColor','defaultTrackWidth','defaultCenterColor',
         'defaultCenterSize','defaultCenterWeight','defaultMargin','defaultPadding']
          .forEach(k => { if (r[k] !== undefined) RCFG[k] = r[k]; });
      }
    },
  };

})();