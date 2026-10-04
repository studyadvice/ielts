class DualCell {

  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`[dual-cell] 找不到容器: ${containerId}`);
      return;
    }

    const theme = options.theme || null;
    const tc    = theme ? DualCell.getThemeConfig(theme) : {};
    const R     = DualCell.resolveColor;

    this.options = {
      theme,

      cols:      parseInt(options.cols) || 2,
      colWidths: options.colWidths || null,

      cellMinHeight:     options.cellMinHeight   || '40px',
      cellPadding:       options.cellPadding     || '8px 12px',
      cellBgColor:       R(options.cellBgColor)  || tc.cellBgColor   || '#333333',
      hoverBgColor:      R(options.hoverBgColor) || tc.hoverBgColor  || '#404040',
      textColor:         R(options.textColor)    || tc.textColor     || '#c6c7bd',
      fontSize:          options.fontSize        || '1rem',
      cellAlignment:     options.cellAlignment   || 'left',
      verticalAlignment: options.verticalAlignment || 'middle',

      borderWidth:       options.borderWidth  || '1px',
      borderStyle:       options.borderStyle  || 'solid',
      borderColor:       R(options.borderColor) || tc.borderColor || '#c6c7bd',
      borderFollowTheme: options.borderFollowTheme || false,

      showMenuButton:               options.showMenuButton !== false,
      menuButtonPosition:           options.menuButtonPosition  || 'right',
      menuButtonColor:              R(options.menuButtonColor)  || tc.menuButtonColor || '#b3de73',
      menuButtonSize:               options.menuButtonSize      || '1.25rem',
      menuButtonIconPush:           options.menuButtonIconPush           || null,
      menuButtonIconPull:           options.menuButtonIconPull           || null,
      menuButtonIconCopy:           options.menuButtonIconCopy           || null,
      menuButtonIconSwap:           options.menuButtonIconSwap           || null,
      menuButtonIconClear:          options.menuButtonIconClear          || null,
      menuButtonIconToggle:         options.menuButtonIconToggle         || null,
      menuButtonIconToggleExpanded: options.menuButtonIconToggleExpanded || null,
      menuButtonIconPut:            options.menuButtonIconPut            || null,
      menuButtonIconShowNext:       options.menuButtonIconShowNext       || null,
      targetId: options.targetId || null,

      overlay1Text:  options.overlay1Text  || null,
      overlay1Color: R(options.overlay1Color) || tc.menuButtonColor || '#DECA4B',
      overlay2Text:  options.overlay2Text  || null,
      overlay2Color: R(options.overlay2Color) || tc.menuButtonColor || '#DECA4B',
      overlayInvert: options.overlayInvert || false,
      accentColor:   tc.menuButtonColor || R(options.menuButtonColor) || '#b3de73',

      groupTitleFontSize: options.groupTitleFontSize || '1.125rem',
      groupTitleColor:    R(options.groupTitleColor)   || tc.groupTitleColor   || '#1C1C1E',
      groupTitleBgColor:  R(options.groupTitleBgColor) || tc.groupTitleBgColor || '#b3de73',
      groupTitlePadding:  options.groupTitlePadding    || '10px 12px',
      groupIconSize:      options.groupIconSize        || '1rem',
      groupCollapsedIcon: options.groupCollapsedIcon   || null,
      groupExpandedIcon:  options.groupExpandedIcon    || null,

      carouselInterval:        parseInt(options.carouselInterval)   || 4000,
      carouselIndicator:       options.carouselIndicator       !== false,
      autoRevealInterval:      parseInt(options.autoRevealInterval) || 0,
      carouselIndicatorColor:  R(options.carouselIndicatorColor) || tc.menuButtonColor || '#b3de73',
      carouselIndicatorHeight: options.carouselIndicatorHeight || '3px',

      // ── 回調 ──────────────────────────────────────────────────
      onCellClick:   options.onCellClick   || null,
      onMenuClick:   options.onMenuClick   || null,
      onContentPush: options.onContentPush || null,
      onContentPull: options.onContentPull || null,
    };

    this.targetElement  = this.options.targetId
      ? document.getElementById(this.options.targetId) : null;
    this.rows           = [];
    this._carouselCells = new Map();
    this.init();
  }

  static getThemeConfig(name) {
    // ── 個人品牌配色系統 ─────────────────────────────────────────
    // shell:#C6C7BD  lavender:#C3A5E5  special:#b3de73  warning:#F08080
    // salmon:#E5C3B3 sky:#0ABDC6       safe:#299459     vanilla:#DBEDD8
    // yellow:#DECA4B info:#1E65C7      stone:#95c9de    indigo:#9B72CF
    // pink:#FFB3D9   orange:#EDA109    focus:#E0BE79
    // ────────────────────────────────────────────────────────────
    const T = {
      // ── 既有品牌色（已全數對齊）──────────────────────────────
      lavender:  { borderColor:'#C3A5E5', cellBgColor:'#2a2435', hoverBgColor:'#3d344a', textColor:'#e8dff5', menuButtonColor:'#C3A5E5', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#C3A5E5' },
      special:   { borderColor:'#b3de73', cellBgColor:'#2a2e1a', hoverBgColor:'#3d4329', textColor:'#edf0d9', menuButtonColor:'#b3de73', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#b3de73' },
      warning:   { borderColor:'#F08080', cellBgColor:'#2e2422', hoverBgColor:'#443532', textColor:'#f5e8e6', menuButtonColor:'#F08080', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#F08080' },
      sky:       { borderColor:'#0ABDC6', cellBgColor:'#182e30', hoverBgColor:'#244044', textColor:'#d9f4f5', menuButtonColor:'#0ABDC6', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#0ABDC6' },
      safe:      { borderColor:'#299459', cellBgColor:'#1e2d25', hoverBgColor:'#2c4035', textColor:'#daf5ec', menuButtonColor:'#299459', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#299459' },
      salmon:    { borderColor:'#E5C3B3', cellBgColor:'#2e2824', hoverBgColor:'#443d36', textColor:'#f5ede8', menuButtonColor:'#E5C3B3', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#E5C3B3' },
      pink:      { borderColor:'#FFB3D9', cellBgColor:'#2e2228', hoverBgColor:'#44323d', textColor:'#ffe8f5', menuButtonColor:'#FFB3D9', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#FFB3D9' },
      orange:    { borderColor:'#EDA109', cellBgColor:'#2d2510', hoverBgColor:'#42381a', textColor:'#f5ece0', menuButtonColor:'#EDA109', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#EDA109' },
      yellow:    { borderColor:'#DECA4B', cellBgColor:'#2c2d10', hoverBgColor:'#403f1a', textColor:'#f5f2d9', menuButtonColor:'#DECA4B', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#DECA4B' },

      // ── 更新色值（★）────────────────────────────────────────
      // info: #1E65C7 → #1E65C7（對齊品牌 info 藍）
      info:      { borderColor:'#1E65C7', cellBgColor:'#1a2540', hoverBgColor:'#263a58', textColor:'#d9e8ff', menuButtonColor:'#1E65C7', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#1E65C7' },
      // stone: #7090A8 → #95c9de（對齊品牌石藍）
      stone:     { borderColor:'#95c9de', cellBgColor:'#1e2830', hoverBgColor:'#2c3d48', textColor:'#daeaf5', menuButtonColor:'#95c9de', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#95c9de' },
      // attention: #E5E5A6 → #DECA4B（對齊品牌 yellow，向後相容保留別名）
      attention: { borderColor:'#DECA4B', cellBgColor:'#2b2a12', hoverBgColor:'#3d3c1e', textColor:'#f5f0d0', menuButtonColor:'#DECA4B', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#DECA4B' },

      // ── 新增品牌主題（✦）────────────────────────────────────
      // vanilla: #DBEDD8（薄荷米綠）
      vanilla:   { borderColor:'#DBEDD8', cellBgColor:'#1e2b1e', hoverBgColor:'#2b3d2a', textColor:'#e8f5e5', menuButtonColor:'#DBEDD8', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#DBEDD8' },
      // indigo: #9B72CF（紫羅蘭）
      indigo:    { borderColor:'#9B72CF', cellBgColor:'#221838', hoverBgColor:'#33254e', textColor:'#eedff8', menuButtonColor:'#9B72CF', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#9B72CF' },
      // focus: #E0BE79（草綠）✦ 新增
      focus:     { borderColor:'#E0BE79', cellBgColor:'#1e2d1a', hoverBgColor:'#2c4025', textColor:'#e2f5d0', menuButtonColor:'#E0BE79', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#E0BE79' },

      // ── 保留向後相容（非品牌色）──────────────────────────────
      brown:     { borderColor:'#d9b375', cellBgColor:'#2b2621', hoverBgColor:'#3f3931', textColor:'#f2ebe3', menuButtonColor:'#d9b375', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#d9b375' },
      default:   { borderColor:'#C6C7BD', cellBgColor:'#333333', hoverBgColor:'#404040', textColor:'#C6C7BD', menuButtonColor:'#C6C7BD', groupTitleColor:'#1C1C1E', groupTitleBgColor:'#C6C7BD' },
    };
    return T[name?.toLowerCase()] || T.default;
  }

  static resolveColor(color) {
    if (!color) return null;
    // ── 個人品牌色名稱對照表 ──────────────────────────────────
    // ★ = 更新色值    ✦ = 新增色票
    const M = {
      shell:     '#C6C7BD',
      lavender:  '#C3A5E5',
      special:   '#b3de73',
      warning:   '#F08080',
      salmon:    '#E5C3B3',
      sky:       '#0ABDC6',   // ★ #95c9de → #0ABDC6
      safe:      '#299459',
      vanilla:   '#DBEDD8',   // ★ #DBEDD8 → #DBEDD8
      yellow:    '#DECA4B',
      focus:     '#E0BE79',   // ✦ 新增
      info:      '#1E65C7',   // ★ #1E65C7 → #1E65C7
      stone:     '#95c9de',   // ★ #7090A8 → #95c9de
      indigo:    '#9B72CF',   // ★ #9B72CF → #9B72CF
      pink:      '#FFB3D9',
      orange:    '#EDA109',
      attention: '#DECA4B',   // ★ #E5E5A6 → #DECA4B（向後相容，同 yellow）
      // 非品牌色，保留向後相容
      brown:     '#d9b375',
      // 功能性顏色
      bg:        '#0C0D0C',
      area:      '#333333',
    };
    return M[color.toLowerCase()] || color;
  }

  init() {
    this.loadRows();
    this.createStyles();
    this.createTable();
  }

  loadRows() {
    this.parseChildren(Array.from(this.container.children), this.rows, this.options.cols);
  }

  parseChildren(elements, targetArray, colsPerRow) {
    let colBuf = [];

    const flushBuf = () => {
      if (!colBuf.length) return;
      for (let i = 0; i < colBuf.length; i += colsPerRow) {
        targetArray.push(this.parseRow(colBuf.slice(i, i + colsPerRow), null));
      }
      colBuf = [];
    };

    for (const el of elements) {
      const tag = el.tagName;
      if (tag === 'DUAL-GROUP' || el.hasAttribute('data-group')) {
        flushBuf();
        targetArray.push(this.parseGroup(el));
        el.style.display = 'none';
      } else if (tag === 'DUAL-ROW' || el.hasAttribute('data-dual-row')) {
        flushBuf();
        const colEls = Array.from(el.querySelectorAll(':scope > dual-col, :scope > [data-col]'));
        targetArray.push(this.parseRow(colEls, el));
        el.style.display = 'none';
      } else if (tag === 'DUAL-COL' || el.hasAttribute('data-col')) {
        colBuf.push(el);
        el.style.display = 'none';
      }
    }
    flushBuf();
  }

  parseGroup(element) {
    const g = {
      type:         'group',
      title:        element.getAttribute('title') || element.getAttribute('data-group') || '群組',
      titleIcon:    element.getAttribute('title-icon')       || null,
      titleRight:   element.getAttribute('title-right')      || null,
      titleRightIcon: element.getAttribute('title-right-icon') || null,
      collapsed:    element.getAttribute('collapsed') === 'true',
      titleFontSize: element.getAttribute('title-font-size') || this.options.groupTitleFontSize,
      titleColor:   DualCell.resolveColor(element.getAttribute('title-color'))    || this.options.groupTitleColor,
      titleBgColor: DualCell.resolveColor(element.getAttribute('title-bg-color')) || this.options.groupTitleBgColor,
      titlePadding: element.getAttribute('title-padding')  || null,
      collapsedIcon: element.getAttribute('collapsed-icon') || this.options.groupCollapsedIcon,
      expandedIcon:  element.getAttribute('expanded-icon')  || this.options.groupExpandedIcon,
      rows: [],
    };
    this.parseChildren(Array.from(element.children), g.rows, this.options.cols);
    return g;
  }

  parseRow(colElements, rowEl) {
    const slotEl       = rowEl?.querySelector(':scope > dual-slot, :scope > [data-slot]');
    const rowColWidths = rowEl?.getAttribute('col-widths') || null;
    const cols         = colElements.map(el => this.parseCol(el));
    const flexVals     = this.computeFlexValues(cols.length, rowColWidths || this.options.colWidths);
    cols.forEach((col, i) => { if (!col.width) col.flex = flexVals[i]; });

    let slotContent = '';
    let slotCols    = null;
    if (slotEl) {
      const slotColEls = Array.from(slotEl.querySelectorAll(':scope > dual-col'));
      if (slotColEls.length >= 2) {
        slotCols = slotColEls.map(c => c.innerHTML);
      } else {
        slotContent = slotEl.innerHTML;
      }
    }

    return {
      type: 'row', cols, slotContent, slotCols,
      hidden:           rowEl?.hasAttribute('hidden')              || false,
      autoRevealDelay:  parseInt(rowEl?.getAttribute('auto-reveal-delay')) || 0,
    };
  }

  parseCol(el) {
    if (!el) return this.emptyColData();
    const a = (k) => el.getAttribute(k) || null;
    const R = DualCell.resolveColor;
    const O = this.options;

    // ── 遮罩 ──
    const ov1Text  = a('overlay-1-text')  ?? O.overlay1Text;
    const ov1Color = R(a('overlay-1-color')) || O.overlay1Color;
    const ov2Text  = a('overlay-2-text')  ?? O.overlay2Text;
    const ov2Color = R(a('overlay-2-color')) || O.overlay2Color;
    const ovInvert = el.hasAttribute('overlay-invert')
      ? el.getAttribute('overlay-invert') === 'true' : O.overlayInvert;

    // ── 垂直輪播：偵測直接子元素 <dual-item> ──
    // 超過 1 個 item 才有輪播意義，只有 1 個或沒有都視為靜態
    const itemEls       = Array.from(el.querySelectorAll(':scope > dual-item, :scope > [data-item]'));
    const carouselItems = itemEls.length > 1 ? itemEls.map(i => i.innerHTML) : null;

    // per-col 輪播設定：有設屬性才覆蓋，否則留 null 讓 _startCarousel 退回全域值
    const ciInterval  = a('carousel-interval') !== null ? parseInt(a('carousel-interval')) : null;
    const ciIndicator = el.hasAttribute('carousel-indicator')
      ? el.getAttribute('carousel-indicator') !== 'false' : null;
    const ciColor     = R(a('carousel-indicator-color'));
    const ciHeight    = a('carousel-indicator-height');

    return {
      // 輪播模式：content 顯示第一項；靜態模式：整個 innerHTML
      content:     carouselItems ? carouselItems[0] : el.innerHTML,
      width:       a('width'),
      spanAll:     el.getAttribute('span') === 'all',
      padding:     a('padding'),
      showMenu:    el.getAttribute('show-menu') !== 'false',
      menuAction:  a('menu-action') || 'push',
      menuTarget:  a('target'),
      cellId:      el.id || null,
      // 遮罩
      ov1Text, ov1Color, ov2Text, ov2Color, ovInvert,
      hasOverlay: !!(ov1Text || ov2Text),
      // Hover
      hoverSource: a('hover-source'),
      hoverTarget: a('hover-target'),
      // 輪播
      carouselItems,
      carouselInterval:        ciInterval,
      carouselIndicator:       ciIndicator,
      carouselIndicatorColor:  ciColor,
      carouselIndicatorHeight: ciHeight,
      flex: 1,
    };
  }

  emptyColData() {
    return {
      content:'', width:null, spanAll:false, padding:null,
      showMenu:true, menuAction:'push', menuTarget:null, cellId:null,
      ov1Text:null, ov1Color:null, ov2Text:null, ov2Color:null,
      ovInvert:false, hasOverlay:false,
      hoverSource:null, hoverTarget:null,
      carouselItems:null, carouselInterval:null,
      carouselIndicator:null, carouselIndicatorColor:null, carouselIndicatorHeight:null,
      flex:1,
    };
  }

  computeFlexValues(n, colWidthsStr) {
    if (!colWidthsStr) return Array(n).fill(1);
    const parts = colWidthsStr.split(':').map(Number);
    if (parts.length !== n || parts.some(isNaN)) return Array(n).fill(1);
    return parts;
  }

  // ════════════════════════════════════════════════════════════════
  // CSS 樣式（per-instance，不同實例互不干擾）
  // ════════════════════════════════════════════════════════════════

  createStyles() {
    const id  = this.container.id;
    const sId = `dc-styles-${id}`;
    if (document.getElementById(sId)) return;

    const o   = this.options;
    const bdr = `${o.borderWidth} ${o.borderStyle} ${o.borderColor}`;
    const va  = { top:'flex-start', middle:'center', bottom:'flex-end' }[o.verticalAlignment] || 'center';

    const style = document.createElement('style');
    style.id    = sId;
    style.textContent = `
      #${id} .dc-table{width:100%;color:${o.textColor};font-size:${o.fontSize}}
      #${id} .dc-row{display:flex;border:${bdr};border-bottom:none}
      #${id} .dc-row-container:last-child>.dc-row,
      #${id} .dc-group-content .dc-row-container:last-child>.dc-row{border-bottom:${bdr}}
      #${id} .dc-cell{
        min-height:${o.cellMinHeight};padding:${o.cellPadding};
        display:flex;align-items:${va};justify-content:space-between;
        position:relative;overflow:hidden;
        background:${o.cellBgColor};text-align:${o.cellAlignment};
        transition:background-color 0.2s}
      #${id} .dc-cell:not(:last-child){border-right:${bdr}}
      #${id} .dc-cell:hover{background:${o.hoverBgColor}}
      #${id} .dc-cell.has-overlay:hover{background:${o.cellBgColor}}
      #${id} .dc-content{flex:1;display:flex;align-items:${va};min-width:0;overflow:hidden;word-break:break-word}
      #${id} .dc-content.blurred{filter:blur(6px);user-select:none;pointer-events:none}
      #${id} .dc-revealed{animation:dc-reveal 0.25s ease}
      @keyframes dc-reveal{from{filter:blur(6px);opacity:.5}to{filter:blur(0);opacity:1}}

      /* ── 選單按鈕 ── */
      #${id} .dc-menu-btn{
        background:none;border:none;color:${o.menuButtonColor};font-size:${o.menuButtonSize};
        cursor:pointer;padding:0 4px;margin-left:8px;flex-shrink:0;
        opacity:0.7;transition:opacity .2s,transform .2s;display:flex;align-items:center}
      #${id} .dc-menu-btn:hover{opacity:1;transform:scale(1.1)}
      #${id} .dc-menu-btn:active{transform:scale(.95)}
      #${id} .dc-menu-btn.pos-left{margin-left:0;margin-right:8px;order:-1}

      /* ── 遮罩 ── */
      #${id} .dc-overlay{
        position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        cursor:pointer;z-index:10;transition:opacity .15s}
      #${id} .dc-ov-dark{background:rgba(0,0,0,.76)}
      #${id} .dc-ov-dark:hover{background:rgba(0,0,0,.88)}
      #${id} .dc-ov-invert{background:${o.accentColor}}
      #${id} .dc-ov-invert:hover{filter:brightness(1.1)}
      #${id} .dc-ov-label{
        font-size:.875rem;font-weight:700;letter-spacing:1px;
        padding:6px 16px;border-radius:4px;border-width:2px;border-style:solid;
        background:rgba(0,0,0,.35)}
      #${id} .dc-ov-invert .dc-ov-label{
        background:rgba(0,0,0,.18);color:#1C1C1E;border-color:rgba(0,0,0,.4)}

      /* ── Toggle slot ── */
      #${id} .dc-toggle{
        background:${o.cellBgColor};color:${o.textColor};padding:${o.cellPadding};
        border:${bdr};border-top:2px solid ${o.menuButtonColor};display:none}
      #${id} .dc-toggle.expanded{display:block;animation:dc-slide .25s ease}
      @keyframes dc-slide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

      /* ── 群組 ── */
      #${id} .dc-group-header{
        background:${o.groupTitleBgColor};color:${o.groupTitleColor};
        padding:${o.groupTitlePadding};font-size:${o.groupTitleFontSize};
        font-weight:700;cursor:pointer;user-select:none;
        display:flex;align-items:center;justify-content:space-between;gap:8px;
        border:${bdr};border-bottom:none;transition:opacity .2s}
      #${id} .dc-group-header:hover{opacity:.9}
      #${id} .dc-group-header:active{opacity:.8}
      #${id} .dc-group-title-l{flex:1}
      #${id} .dc-group-title-r{font-size:.8em;opacity:.85;flex-shrink:0}
      #${id} .dc-group-icon{font-size:${o.groupIconSize};flex-shrink:0;transition:transform .2s}
      #${id} .dc-group-content{overflow:hidden;transition:max-height .3s ease,opacity .3s ease}
      #${id} .dc-group-content.collapsed{max-height:0;opacity:0}
      #${id} .dc-group-content.expanded{max-height:10000px;opacity:1}

      /* ── 垂直輪播內容動畫 ── */
      /* 退場：向上滑出並淡出 */
      @keyframes dc-car-out{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-12px)}}
      /* 進場：從下方滑入並淡入 */
      @keyframes dc-car-in {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      #${id} .dc-content.dc-car-exit {animation:dc-car-out .3s ease forwards;pointer-events:none}
      #${id} .dc-content.dc-car-enter{animation:dc-car-in  .38s ease forwards}

      /* ── 讀秒進度條 ── */
      /* position:absolute 貼在 cell 底部邊框正上方，不佔用 cell padding 空間 */
      #${id} .dc-progress-track{
        position:absolute;bottom:0;left:0;right:0;
        overflow:hidden;pointer-events:none;z-index:1}
      #${id} .dc-progress-bar{
        height:100%;
        /* 初始寬度 100%，由 JS 啟動收縮動畫 */
        width:100%}
      /* dc-shrink 動畫由 JS inline style 注入 duration，讓 per-col 間隔各自不同 */
      @keyframes dc-shrink{from{width:100%}to{width:0%}}

      /* ── 列展開動畫（show-next / auto-reveal） ── */
      @keyframes dc-row-reveal{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      #${id} .dc-reveal-row{animation:dc-row-reveal .35s ease forwards}
    `;
    document.head.appendChild(style);
  }

  // ════════════════════════════════════════════════════════════════
  // DOM 建表
  // ════════════════════════════════════════════════════════════════

  createTable() {
    const table = document.createElement('div');
    table.className = 'dc-table';

    let rowIdx = 0;
    this.rows.forEach(item => {
      if (item.type === 'group') {
        table.appendChild(this.createGroup(item, rowIdx));
        rowIdx += item.rows.length;
      } else {
        table.appendChild(this.createRow(item, rowIdx++));
      }
    });

    this.setupTableEvents(table);
    this.container.appendChild(table);

    // 所有 cell 建立並掛上 DOM 後才啟動輪播，確保 getBoundingClientRect 等操作可用
    this._initCarousels();
    // 全域定時展開（情境一）
    this._startAutoRevealInterval();
  }

  createGroup(groupData, startIdx) {
    const wrap   = document.createElement('div');
    wrap.className = 'dc-group';

    const header = document.createElement('div');
    header.className = 'dc-group-header';
    if (groupData.titleFontSize) header.style.fontSize   = groupData.titleFontSize;
    if (groupData.titleColor)    header.style.color      = groupData.titleColor;
    if (groupData.titleBgColor)  header.style.background = groupData.titleBgColor;
    if (groupData.titlePadding)  header.style.padding    = groupData.titlePadding;
    if (this.options.borderFollowTheme && groupData.titleBgColor)
      header.style.borderColor = groupData.titleBgColor;

    const initIcon = groupData.collapsed ? groupData.collapsedIcon : groupData.expandedIcon;
    if (initIcon) {
      const icon = document.createElement('i');
      icon.className = `bi ${initIcon} dc-group-icon`;
      header.appendChild(icon);
    }

    const tL = document.createElement('span');
    tL.className = 'dc-group-title-l';
    const iconHtml = groupData.titleIcon ? `<i class="bi ${groupData.titleIcon}" style="margin-right:6px"></i>` : '';
    tL.innerHTML = iconHtml + groupData.title;
    header.appendChild(tL);

    if (groupData.titleRight) {
      const tR = document.createElement('span');
      tR.className = 'dc-group-title-r';
      const rIconHtml = groupData.titleRightIcon ? `<i class="bi ${groupData.titleRightIcon}" style="margin-right:4px"></i>` : '';
      tR.innerHTML = rIconHtml + groupData.titleRight;
      header.appendChild(tR);
    }

    const content = document.createElement('div');
    content.className = `dc-group-content ${groupData.collapsed ? 'collapsed' : 'expanded'}`;

    groupData.rows.forEach((row, i) => {
      const rowEl = this.createRow(row, startIdx + i);
      if (this.options.borderFollowTheme && groupData.titleBgColor)
        this.applyGroupBorder(rowEl, groupData.titleBgColor);
      content.appendChild(rowEl);
    });

    header.addEventListener('click', () => {
      const nowCollapsed = content.classList.contains('collapsed');
      content.classList.toggle('collapsed', !nowCollapsed);
      content.classList.toggle('expanded',   nowCollapsed);
      const icon = header.querySelector('.dc-group-icon');
      if (icon) {
        const next = nowCollapsed ? groupData.expandedIcon : groupData.collapsedIcon;
        if (next) icon.className = `bi ${next} dc-group-icon`;
      }
    });

    wrap.appendChild(header);
    wrap.appendChild(content);
    return wrap;
  }

  applyGroupBorder(rowContainer, color) {
    const row    = rowContainer.querySelector('.dc-row');
    const toggle = rowContainer.querySelector('.dc-toggle');
    if (row) {
      row.style.borderColor = color;
      row.querySelectorAll('.dc-cell:not(:last-child)').forEach(c => {
        c.style.borderRightColor = color;
      });
    }
    if (toggle) { toggle.style.borderColor = color; toggle.style.borderTopColor = color; }
  }

  createRow(rowData, rowIdx) {
    const container = document.createElement('div');
    container.className = 'dc-row-container';
    // 若此列初始為隱藏（由 hidden 屬性宣告），立即設 display:none
    if (rowData.hidden)          container.style.display = 'none';
    // 儲存 per-row 自動展開延遲（毫秒），供 _showRow 使用
    if (rowData.autoRevealDelay) container.dataset.autoRevealDelay = rowData.autoRevealDelay;

    const row = document.createElement('div');
    row.className    = 'dc-row';
    row.dataset.rowIdx = rowIdx;

    rowData.cols.forEach((colData, colIdx) => {
      row.appendChild(this.createCell(colData, rowIdx, colIdx));
    });
    container.appendChild(row);

    if (rowData.slotCols) {
      const toggle = document.createElement('div');
      toggle.className      = 'dc-toggle has-slot';
      toggle.dataset.rowIdx = rowIdx;
      const bsRow = document.createElement('div');
      bsRow.className = 'row';
      rowData.slotCols.forEach(html => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = html;
        bsRow.appendChild(col);
      });
      toggle.appendChild(bsRow);
      container.appendChild(toggle);
    } else if (rowData.slotContent?.trim()) {
      const toggle = document.createElement('div');
      toggle.className    = 'dc-toggle has-slot';
      toggle.dataset.rowIdx = rowIdx;
      toggle.innerHTML    = rowData.slotContent;
      container.appendChild(toggle);
    }

    return container;
  }

  createCell(colData, rowIdx, colIdx) {
    const cell = document.createElement('div');
    cell.className      = 'dc-cell';
    cell.dataset.rowIdx = rowIdx;
    cell.dataset.colIdx = colIdx;
    if (colData.cellId)  cell.id          = colData.cellId;
    if (colData.padding) cell.style.padding = colData.padding;

    // 欄寬：spanAll > 固定 width > flex 比例
    if (colData.spanAll) {
      cell.style.cssText += ';flex:1 0 100%;border-right:none';
    } else if (colData.width) {
      cell.style.width = colData.width;
      cell.style.flex  = 'none';
    } else {
      cell.style.flex = String(colData.flex || 1);
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'dc-content';
    contentDiv.innerHTML = colData.content;

    if (this.options.menuButtonPosition === 'left') {
      if (this.options.showMenuButton && colData.showMenu)
        cell.appendChild(this.createMenuButton(colData, rowIdx, colIdx));
      cell.appendChild(contentDiv);
    } else {
      cell.appendChild(contentDiv);
      if (this.options.showMenuButton && colData.showMenu)
        cell.appendChild(this.createMenuButton(colData, rowIdx, colIdx));
    }

    // ── 兩層遮罩：layer2 先插入（底層），layer1 後插入（頂層）──
    if (colData.hasOverlay) {
      cell.classList.add('has-overlay');
      if (!colData.ovInvert) contentDiv.classList.add('blurred');
      if (colData.ov2Text) cell.appendChild(this.createOverlayEl(colData.ov2Text, colData.ov2Color, colData.ovInvert, 2));
      if (colData.ov1Text) cell.appendChild(this.createOverlayEl(colData.ov1Text, colData.ov1Color, colData.ovInvert, 1));
    }

    // ── 垂直輪播：建立讀秒進度條並登記，等 createTable() 結束後統一啟動 ──
    if (colData.carouselItems) {
      cell.classList.add('has-carousel');

      // 進度條容器（貼底部）
      const track = document.createElement('div');
      track.className = 'dc-progress-track';
      // 粗細優先順序：per-col > 全域
      track.style.height = colData.carouselIndicatorHeight || this.options.carouselIndicatorHeight;

      const bar = document.createElement('div');
      bar.className = 'dc-progress-bar';
      track.appendChild(bar);
      cell.appendChild(track);

      // 登記到 Map，createTable() 最後再統一 _initCarousels()
      this._carouselCells.set(cell, colData);
    }

    return cell;
  }

  createOverlayEl(text, color, invert, layer) {
    const ov = document.createElement('div');
    ov.className     = `dc-overlay ${invert ? 'dc-ov-invert' : 'dc-ov-dark'}`;
    ov.dataset.layer = layer;
    const label = document.createElement('span');
    label.className = 'dc-ov-label';
    label.textContent = text;
    if (!invert) { label.style.color = color; label.style.borderColor = color; }
    ov.appendChild(label);
    return ov;
  }

  createMenuButton(colData, rowIdx, colIdx) {
    const btn = document.createElement('button');
    btn.className      = 'dc-menu-btn';
    btn.dataset.action = colData.menuAction;
    btn.dataset.rowIdx = rowIdx;
    btn.dataset.colIdx = colIdx;
    if (this.options.menuButtonPosition === 'left') btn.classList.add('pos-left');
    if (colData.menuTarget) btn.dataset.target = colData.menuTarget;

    const ICONS  = { push:this.options.menuButtonIconPush, pull:this.options.menuButtonIconPull, copy:this.options.menuButtonIconCopy, swap:this.options.menuButtonIconSwap, clear:this.options.menuButtonIconClear, toggle:this.options.menuButtonIconToggle, put:this.options.menuButtonIconPut, 'show-next':this.options.menuButtonIconShowNext };
    const TITLES = { push:'推送到目標', pull:'從目標拉取', copy:'複製', swap:'與相鄰欄交換', clear:'清空', toggle:'展開/收合', put:'放置到指定儲存格', 'show-next':'展開下一列' };
    const icon = ICONS[colData.menuAction];
    if (icon) btn.innerHTML = `<i class="bi ${icon}"></i>`;
    btn.title = TITLES[colData.menuAction] || '';
    return btn;
  }

  // ════════════════════════════════════════════════════════════════
  // 垂直輪播引擎
  // ════════════════════════════════════════════════════════════════

  /** 統一啟動所有已登記的輪播 cell。在 createTable() 最後呼叫。 */
  _initCarousels() {
    this._carouselCells.forEach((colData, cellEl) => {
      if (cellEl.isConnected) this._startCarousel(cellEl, colData);
    });
  }

  /**
   * 啟動單一 cell 的輪播週期。
   *
   * 時序設計（遞迴 setTimeout，不用 setInterval，無累積誤差）：
   *
   *   ┌─────────────────────────────── interval ─────────────────────────────┐
   *   │  顯示第 N 項，進度條從 100% 線性縮短到 0%                             │
   *   └──────────────────────────────────────────────────────────────────────┘
   *        ↓  setTimeout(interval) 到期
   *   退場動畫 (300ms)：dc-car-exit，內容向上淡出
   *        ↓  setTimeout(300) 到期
   *   換 innerHTML 為第 N+1 項
   *   進場動畫 (380ms)：dc-car-enter，內容從下方淡入
   *   同時重啟進度條（兩者同步）
   *        ↓  setTimeout(interval) 到期
   *   下一輪…
   */
  _startCarousel(cellEl, colData) {
    const items    = colData.carouselItems;
    // per-col 明確設定的優先；null 退回全域
    const interval = colData.carouselInterval ?? this.options.carouselInterval;
    const showInd  = colData.carouselIndicator !== null
      ? colData.carouselIndicator : this.options.carouselIndicator;
    const indColor  = colData.carouselIndicatorColor  || this.options.carouselIndicatorColor;
    const indHeight = colData.carouselIndicatorHeight || this.options.carouselIndicatorHeight;

    const contentEl = cellEl.querySelector('.dc-content');
    const trackEl   = cellEl.querySelector('.dc-progress-track');
    const barEl     = cellEl.querySelector('.dc-progress-bar');

    // 若關閉 indicator，隱藏進度條容器
    if (!showInd && trackEl) { trackEl.style.display = 'none'; }
    // 確保尺寸與顏色正確（per-col 可能與全域不同）
    if (trackEl && indHeight) trackEl.style.height = indHeight;
    if (barEl)   barEl.style.background = indColor;

    let idx = 0;

    /**
     * 重啟進度條的 CSS 動畫。
     *
     * 「移除 animation → 強制 reflow → 重新賦值」是瀏覽器重播同名 CSS 動畫的
     * 唯一可靠方法。若省略 offsetHeight 這行（reflow），瀏覽器會認為動畫
     * 沒有改變而跳過重播，導致第二輪之後進度條停在 0% 不動。
     */
    const restartBar = () => {
      if (!barEl || !showInd) return;
      barEl.style.animation = 'none';
      barEl.offsetHeight;   // 強制 reflow，讓 animation:none 真正生效
      barEl.style.animation = `dc-shrink ${interval}ms linear forwards`;
    };

    /**
     * 執行一次切換（退場 → 換內容 → 進場 → 重啟計時）。
     * 退場與進場動畫不重疊：退場完全結束後才換 innerHTML 並啟動進場，
     * 保證畫面不會同時出現舊內容和新內容。
     */
    const advance = () => {
      // 1. 退場動畫
      contentEl.classList.add('dc-car-exit');

      setTimeout(() => {
        // 2. 退場結束：切換到下一項
        idx = (idx + 1) % items.length;
        contentEl.innerHTML = items[idx];

        // 3. 移除退場，加進場動畫
        contentEl.classList.remove('dc-car-exit');
        contentEl.classList.add('dc-car-enter');
        // 進場動畫播完後清除 class，避免影響 hover 等其他樣式
        setTimeout(() => contentEl.classList.remove('dc-car-enter'), 400);

        // 4. 進場同時重啟進度條（視覺上兩者同步開始）
        restartBar();

        // 5. 遞迴安排下一次切換
        setTimeout(advance, interval);

      }, 300);  // 等退場動畫的 300ms 播完
    };

    // 首次顯示：第一項不需要進場動畫（剛建立元件），直接啟動進度條
    restartBar();
    // interval 毫秒後觸發第一次切換
    setTimeout(advance, interval);
  }

  // ════════════════════════════════════════════════════════════════
  // 事件委派（整個 table 只掛一個 click、一個 mouseover）
  // ════════════════════════════════════════════════════════════════

  setupTableEvents(tableEl) {
    tableEl.addEventListener('click', (e) => {
      const overlay = e.target.closest('.dc-overlay');
      const btn     = e.target.closest('.dc-menu-btn');
      const cell    = e.target.closest('.dc-cell');

      if (overlay && cell) {
        e.stopPropagation();
        this.handleOverlayClick(overlay, cell);
        return;
      }
      if (btn) {
        e.stopPropagation();
        const { action, rowIdx, colIdx, target } = btn.dataset;
        this.handleMenuAction(action, target || null, parseInt(rowIdx), parseInt(colIdx), btn);
        return;
      }
      if (cell && this.options.onCellClick) {
        this.options.onCellClick(parseInt(cell.dataset.rowIdx), parseInt(cell.dataset.colIdx));
      }
    });

    tableEl.addEventListener('mouseover', (e) => {
      const cell = e.target.closest('.dc-cell');
      if (!cell) return;
      // 排除在同一 cell 內部子元素之間移動觸發的 mouseover
      if (e.relatedTarget?.closest('.dc-cell') === cell) return;

      const col = this.getColData(
        parseInt(cell.dataset.rowIdx),
        parseInt(cell.dataset.colIdx)
      );
      if (!col?.hoverSource || !col?.hoverTarget) return;

      const src = document.getElementById(col.hoverSource);
      const tgt = document.getElementById(col.hoverTarget);
      if (src && tgt) tgt.innerHTML = src.innerHTML;
      // 刻意不掛 mouseout：離開後保留最後的內容，讓使用者可以繼續閱讀
    });
  }

  // ════════════════════════════════════════════════════════════════
  // 遮罩點擊
  // ════════════════════════════════════════════════════════════════

  handleOverlayClick(overlayEl, cellEl) {
    const layer      = parseInt(overlayEl.dataset.layer);
    const contentDiv = cellEl.querySelector('.dc-content');
    overlayEl.remove();

    if (layer === 1) {
      // 如果 layer 2 還在，等下次點擊；否則直接揭開
      const layer2 = cellEl.querySelector('.dc-overlay[data-layer="2"]');
      if (!layer2) {
        contentDiv.classList.remove('blurred');
        contentDiv.classList.add('dc-revealed');
        cellEl.classList.remove('has-overlay');
      }
    } else {
      // layer 2 被點到 → 最後一層，揭開內容
      contentDiv.classList.remove('blurred');
      contentDiv.classList.add('dc-revealed');
      cellEl.classList.remove('has-overlay');
    }
  }

  // ════════════════════════════════════════════════════════════════
  // 選單動作
  // ════════════════════════════════════════════════════════════════

  handleMenuAction(action, customTarget, rowIdx, colIdx, btnEl) {
    const cellEl     = this.container.querySelector(
      `.dc-cell[data-row-idx="${rowIdx}"][data-col-idx="${colIdx}"]`
    );
    const contentDiv = cellEl?.querySelector('.dc-content');
    if (!contentDiv) return;

    switch (action) {
      case 'copy':   this.copyToClipboard(contentDiv); break;
      case 'swap':   this.swapCols(rowIdx, colIdx); break;
      case 'clear':  if (confirm('確定清空？')) contentDiv.innerHTML = ''; break;
      case 'toggle': this.toggleSlot(customTarget, rowIdx, colIdx, cellEl, btnEl); break;
      case 'put':    this.putToCell(customTarget, contentDiv); break;
      case 'show-next': {
        // 找出目前這個 cell 所在的 dc-row-container，然後展開它之後第一個隱藏的列
        const rowContainer = cellEl.closest('.dc-row-container');
        const next = this._nextHiddenRow(rowContainer);
        if (next) this._showRow(next);
        break;
      }
      default: {
        const target = customTarget
          ? document.getElementById(customTarget) : this.targetElement;
        if (!target) { console.warn('[dual-cell] 找不到目標元素'); break; }
        if (action === 'push') {
          target.innerHTML = contentDiv.innerHTML;
          if (this.options.onContentPush) this.options.onContentPush(rowIdx, colIdx, contentDiv.innerHTML);
        } else if (action === 'pull') {
          contentDiv.innerHTML = target.innerHTML;
          if (this.options.onContentPull) this.options.onContentPull(rowIdx, colIdx, target.innerHTML);
        }
      }
    }
    if (this.options.onMenuClick) this.options.onMenuClick(action, rowIdx, colIdx);
  }

  copyToClipboard(contentDiv) {
    const text = contentDiv.textContent || '';
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(err => console.error(err));
    } else {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  swapCols(rowIdx, colIdx) {
    const cells = Array.from(
      this.container.querySelectorAll(`.dc-row[data-row-idx="${rowIdx}"] .dc-cell`)
    );
    if (cells.length < 2) return;
    const other = colIdx + 1 < cells.length ? colIdx + 1 : colIdx - 1;
    const cwA = cells[colIdx]?.querySelector('.dc-content');
    const cwB = cells[other ]?.querySelector('.dc-content');
    if (!cwA || !cwB) return;
    [cwA.innerHTML, cwB.innerHTML] = [cwB.innerHTML, cwA.innerHTML];
  }

  toggleSlot(customTarget, rowIdx, colIdx, cellEl, btnEl) {
    const rowContainer = cellEl.closest('.dc-row-container');
    if (!rowContainer) return;
    let tc = rowContainer.querySelector('.dc-toggle');
    if (!tc) {
      tc = document.createElement('div');
      tc.className = 'dc-toggle'; tc.dataset.rowIdx = rowIdx;
      rowContainer.appendChild(tc);
    }
    const expanding = !tc.classList.contains('expanded');
    if (expanding && !tc.classList.contains('has-slot') && customTarget) {
      const src = document.getElementById(customTarget);
      if (src) tc.innerHTML = src.innerHTML;
    }
    tc.classList.toggle('expanded', expanding);
    if (btnEl) {
      const iE = this.options.menuButtonIconToggleExpanded;
      const iC = this.options.menuButtonIconToggle;
      if (expanding && iE) btnEl.innerHTML = `<i class="bi ${iE}"></i>`;
      if (!expanding && iC) btnEl.innerHTML = `<i class="bi ${iC}"></i>`;
    }
  }

  putToCell(targetCellId, sourceContentDiv) {
    if (!targetCellId) return;
    const tgtCell    = document.getElementById(targetCellId);
    const tgtContent = tgtCell?.querySelector('.dc-content');
    if (tgtContent) tgtContent.innerHTML = sourceContentDiv.innerHTML;
  }

  // ════════════════════════════════════════════════════════════════
  // show-next 與 auto-reveal 輔助方法
  // ════════════════════════════════════════════════════════════════

  /**
   * 顯示一個隱藏的列，並在它有 auto-reveal-delay 屬性時
   * 於指定毫秒後自動展開它之後的下一個隱藏列（情境二：逐步自動鏈）。
   * 注意：只有被 show-next 動作（或本方法自身遞迴）觸發才會走這條路，
   * 全域 _startAutoRevealInterval 不呼叫本方法，兩條路徑互不干擾。
   */
  _showRow(rowContainer) {
    if (!rowContainer || rowContainer.style.display !== 'none') return;
    rowContainer.style.display = '';
    rowContainer.classList.add('dc-reveal-row');
    const delay = parseInt(rowContainer.dataset.autoRevealDelay) || 0;
    if (delay > 0) {
      setTimeout(() => {
        const next = this._nextHiddenRow(rowContainer);
        if (next) this._showRow(next);
      }, delay);
    }
  }

  /**
   * 從 fromContainer 往後找，回傳第一個 display:none 的 dc-row-container。
   * 略過所有已可見的列，也略過非列元素（例如 dc-toggle）。
   */
  _nextHiddenRow(fromContainer) {
    let el = fromContainer?.nextElementSibling;
    while (el) {
      if (el.classList.contains('dc-row-container') && el.style.display === 'none') return el;
      el = el.nextElementSibling;
    }
    return null;
  }

  /**
   * 情境一：全域定時展開。
   * 在 createTable() 末尾呼叫；若 autoRevealInterval > 0，
   * 掃描所有初始隱藏的列，以等間距 setTimeout 逐一展開。
   * 直接操作 DOM（不呼叫 _showRow），不觸發 auto-reveal-delay 鏈，
   * 確保兩個情境互不干擾。
   */
  _startAutoRevealInterval() {
    const interval = this.options.autoRevealInterval;
    if (!interval) return;
    const rows = Array.from(
      this.container.querySelectorAll('.dc-table .dc-row-container')
    ).filter(r => r.style.display === 'none');
    rows.forEach((row, i) => {
      setTimeout(() => {
        if (row.style.display === 'none') {   // guard：避免已被 click 展開的列重複處理
          row.style.display = '';
          row.classList.add('dc-reveal-row');
        }
      }, interval * (i + 1));
    });
  }

  // ════════════════════════════════════════════════════════════════
  // 資料查詢
  // ════════════════════════════════════════════════════════════════

  getColData(rowIdx, colIdx) {
    let cur = 0;
    for (const item of this.rows) {
      if (item.type === 'group') {
        const end = cur + item.rows.length;
        if (rowIdx < end) return item.rows[rowIdx - cur]?.cols?.[colIdx] ?? null;
        cur = end;
      } else {
        if (cur === rowIdx) return item.cols?.[colIdx] ?? null;
        cur++;
      }
    }
    return null;
  }
}

// ════════════════════════════════════════════════════════════════
// Custom Elements（標籤識別用，DualCellElement 有行為，其餘純被動）
// ════════════════════════════════════════════════════════════════

class DualCellElement extends HTMLElement {
  connectedCallback() {
    this.dualCellInstance = new DualCell(this.id, this._buildOptions());
  }

  _buildOptions() {
    const opts = {};
    const boolAttrs = new Set(['show-menu-button', 'border-follow-theme', 'overlay-invert', 'carousel-indicator']);
    const MAP = {
      'theme':'theme', 'cols':'cols', 'col-widths':'colWidths',
      'cell-min-height':'cellMinHeight', 'cell-padding':'cellPadding',
      'cell-bg-color':'cellBgColor', 'hover-bg-color':'hoverBgColor',
      'text-color':'textColor', 'font-size':'fontSize',
      'cell-alignment':'cellAlignment', 'vertical-alignment':'verticalAlignment',
      'border-width':'borderWidth', 'border-color':'borderColor',
      'border-style':'borderStyle', 'border-follow-theme':'borderFollowTheme',
      'show-menu-button':'showMenuButton',
      'menu-button-position':'menuButtonPosition',
      'menu-button-color':'menuButtonColor', 'menu-button-size':'menuButtonSize',
      'menu-button-icon-push':'menuButtonIconPush',
      'menu-button-icon-pull':'menuButtonIconPull',
      'menu-button-icon-copy':'menuButtonIconCopy',
      'menu-button-icon-swap':'menuButtonIconSwap',
      'menu-button-icon-clear':'menuButtonIconClear',
      'menu-button-icon-toggle':'menuButtonIconToggle',
      'menu-button-icon-toggle-expanded':'menuButtonIconToggleExpanded',
      'menu-button-icon-put':'menuButtonIconPut',
      'menu-button-icon-show-next':'menuButtonIconShowNext',
      'target-id':'targetId',
      'auto-reveal-interval':'autoRevealInterval',
      'overlay-1-text':'overlay1Text', 'overlay-1-color':'overlay1Color',
      'overlay-2-text':'overlay2Text', 'overlay-2-color':'overlay2Color',
      'overlay-invert':'overlayInvert',
      'carousel-interval':'carouselInterval',
      'carousel-indicator':'carouselIndicator',
      'carousel-indicator-color':'carouselIndicatorColor',
      'carousel-indicator-height':'carouselIndicatorHeight',
      'group-title-font-size':'groupTitleFontSize',
      'group-title-color':'groupTitleColor',
      'group-title-bg-color':'groupTitleBgColor',
      'group-title-padding':'groupTitlePadding',
      'group-icon-size':'groupIconSize',
      'group-collapsed-icon':'groupCollapsedIcon',
      'group-expanded-icon':'groupExpandedIcon',
    };
    for (const [attr, key] of Object.entries(MAP)) {
      if (this.hasAttribute(attr)) {
        const v = this.getAttribute(attr);
        opts[key] = boolAttrs.has(attr) ? v !== 'false' : v;
      }
    }
    return opts;
  }
}

class DualGroupElement extends HTMLElement {}
class DualRowElement   extends HTMLElement {}
class DualColElement   extends HTMLElement {}
class DualSlotElement  extends HTMLElement {}
class DualItemElement  extends HTMLElement {}   // 輪播子項目，純標籤識別

[
  ['dual-cell',  DualCellElement],
  ['dual-group', DualGroupElement],
  ['dual-row',   DualRowElement],
  ['dual-col',   DualColElement],
  ['dual-slot',  DualSlotElement],
  ['dual-item',  DualItemElement],
].forEach(([name, cls]) => {
  if (!customElements.get(name)) customElements.define(name, cls);
});

// ════════════════════════════════════════════════════════════════
// data-dual-cell 屬性自動初始化
// ════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-dual-cell]').forEach(el => {
    const d   = el.dataset;
    const opt = {};
    const p   = (k, v) => { if (v !== undefined && v !== '') opt[k] = v; };
    const pb  = (k, v) => { if (v !== undefined) opt[k] = v !== 'false'; };

    p('theme', d.theme); p('cols', d.cols); p('colWidths', d.colWidths);
    p('cellMinHeight', d.cellMinHeight); p('cellPadding', d.cellPadding);
    p('cellBgColor', d.cellBgColor); p('hoverBgColor', d.hoverBgColor);
    p('textColor', d.textColor); p('fontSize', d.fontSize);
    p('cellAlignment', d.cellAlignment); p('verticalAlignment', d.verticalAlignment);
    p('borderWidth', d.borderWidth); p('borderColor', d.borderColor); p('borderStyle', d.borderStyle);
    pb('borderFollowTheme', d.borderFollowTheme); pb('showMenuButton', d.showMenuButton);
    p('menuButtonPosition', d.menuButtonPosition);
    p('menuButtonColor', d.menuButtonColor); p('menuButtonSize', d.menuButtonSize);
    p('menuButtonIconPush', d.menuButtonIconPush); p('menuButtonIconPull', d.menuButtonIconPull);
    p('menuButtonIconCopy', d.menuButtonIconCopy); p('menuButtonIconSwap', d.menuButtonIconSwap);
    p('menuButtonIconClear', d.menuButtonIconClear); p('menuButtonIconToggle', d.menuButtonIconToggle);
    p('menuButtonIconToggleExpanded', d.menuButtonIconToggleExpanded);
    p('menuButtonIconPut', d.menuButtonIconPut);
    p('menuButtonIconShowNext', d.menuButtonIconShowNext);
    p('autoRevealInterval', d.autoRevealInterval);
    p('targetId', d.targetId);
    p('overlay1Text', d.overlay1Text); p('overlay1Color', d.overlay1Color);
    p('overlay2Text', d.overlay2Text); p('overlay2Color', d.overlay2Color);
    pb('overlayInvert', d.overlayInvert);
    p('carouselInterval', d.carouselInterval);
    pb('carouselIndicator', d.carouselIndicator);
    p('carouselIndicatorColor', d.carouselIndicatorColor);
    p('carouselIndicatorHeight', d.carouselIndicatorHeight);
    p('groupTitleFontSize', d.groupTitleFontSize); p('groupTitleColor', d.groupTitleColor);
    p('groupTitleBgColor', d.groupTitleBgColor); p('groupTitlePadding', d.groupTitlePadding);
    p('groupIconSize', d.groupIconSize);
    p('groupCollapsedIcon', d.groupCollapsedIcon); p('groupExpandedIcon', d.groupExpandedIcon);

    el.dualCellInstance = new DualCell(el.id, opt);
  });
});