(function (global) {
  'use strict';

  var Palette = {
    shell:    '#C6C7BD',
    lavender: '#C3A5E5',
    sky:      '#82C8E5',
    warning:  '#E6374B',
    salmon:   '#E5C3B3',
    ocean:    '#1CCAE8',
    safe:     '#27AE60',
    teal:     '#0DA591',
    vanilla:  '#DBEDD8',
    yellow:   '#E3D322',
    focus:    '#D4FFFC',
    special:  '#B3DE73',
    info:     '#2351DB',
    indigo:   '#7849C9',
    pink:     '#FF91D7',
    orange:   '#EDA109'
  };

  var Config = {
    borderColor:          '#6a6b68',
    borderHoverColor:     '#82C8E5',
    borderActiveColor:    '#C3A5E5',
    numberColor:          '#82C8E5',
    themeColor:           null,

    accentColors: [
      '#82C8E5', '#C3A5E5', '#1CCAE8', '#B3DE73', '#E3D322',
      '#E5C3B3', '#0DA591', '#FF91D7', '#EDA109', '#7849C9'
    ],

    backgroundColor:      '#0C0D0C',
    activeBackground:     '#10192a',
    numberBg:             '#0d1b24',
    numberDivider:        '#1c2d38',
    textColor:            '#C6C7BD',

    fontSize:             '1.125rem',
    numberFontSize:       '3rem',
    iconFontSize:         '2.25rem',
    numberMinWidth:       '84px',
    gridNumberMinWidth:   '60px',
    borderRadius:         '6px',
    borderWidth:          '1px',
    rowGap:               '4px',
    lineHeight:           1.5,
    padV:                 '8px',
    padH:                 '12px',
    numberPad:            '12px 16px',
    lineGap:              '3px',

    /* ── FAB 專屬設定 ── */
    fabSize:              '52px',    /* 按鈕寬高 */
    fabIconSize:          '1.4rem',  /* 圖示字體大小 */
    fabLabelSize:         '0.6rem',  /* label 短文字大小 */
    fabBg:                '#0d1b24', /* 按鈕底色 */
    fabBorderRadius:      '8px',     /* 按鈕圓角 */
    fabOffset:            '16px',    /* 距螢幕左 / 右邊緣距離 */
    fabBottom:            '120px'    /* 距螢幕底部距離 */
  };

  var store = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;

  function resolveColor(value, attrName) {
    if (value === null || value === undefined) return null;
    var v = String(value).trim();
    if (!v) return null;
    var key = v.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(Palette, key)) return Palette[key];
    if (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('color', v)) return v;
    if (global.console && console.warn) {
      console.warn('[NumericList] ' + (attrName || 'color') + '="' + v + '" 無效，可用名稱：' +
        Object.keys(Palette).join(', '));
    }
    return null;
  }

  function buildCSS() {
    var c = Config;
    return (
      'ui-list{display:block}' +

      /* ── 直欄（預設） ── */
      '.nl-list{' +
        'display:flex;flex-direction:column;' +
        'gap:var(--nl-gap,' + c.rowGap + ');' +
        'list-style:none;margin:0;padding:0' +
      '}' +

      /* ── Grid 模式 ── */
      '.nl-list--grid{display:grid;grid-template-columns:repeat(var(--nl-cols,2),1fr)}' +
      '.nl-list--grid .nl-number{min-width:' + c.gridNumberMinWidth + '}' +
      '.nl-list--grid.nl-list--last-span>.nl-item:last-child{grid-column:1/-1}' +
      '.nl-list--grid.nl-list--last-span>.nl-item:last-child .nl-number{min-width:' + c.numberMinWidth + '}' +

      /* ── 共用 item ── */
      '.nl-item{' +
        'display:flex;align-items:stretch;' +
        'border:' + c.borderWidth + ' solid ' + c.borderColor + ';' +
        'border-radius:' + c.borderRadius + ';overflow:hidden;' +
        'background:' + c.backgroundColor + ';' +
        'transition:border-color .18s ease,background .18s ease' +
      '}' +
      '.nl-item:hover{border-color:var(--nl-hover-color,' + c.borderHoverColor + ')}' +
      '.nl-item--clickable{cursor:pointer}' +
      '.nl-item--active{' +
        'border-color:var(--nl-active-color,' + c.borderActiveColor + ')!important;' +
        'background:var(--nl-active-bg,' + c.activeBackground + ')' +
      '}' +

      '.nl-number{' +
        'display:flex;align-items:center;justify-content:center;' +
        'min-width:' + c.numberMinWidth + ';background:' + c.numberBg + ';' +
        'font-size:' + c.numberFontSize + ';font-weight:700;' +
        'padding:' + c.numberPad + ';' +
        'border-right:' + c.borderWidth + ' solid ' + c.numberDivider + ';' +
        'flex-shrink:0;line-height:1;user-select:none;font-variant-numeric:tabular-nums' +
      '}' +
      '.nl-number--icon{font-size:' + c.iconFontSize + ';font-weight:400;font-variant-numeric:normal}' +

      '.nl-content{' +
        'display:flex;flex-direction:column;justify-content:center;' +
        'padding:' + c.padV + ' ' + c.padH + ';gap:' + c.lineGap + ';flex:1;min-width:0;' +
        'font-size:' + c.fontSize + ';color:' + c.textColor + ';line-height:' + c.lineHeight +
      '}' +
      '.nl-content p,.nl-content li{margin:0;padding:0}' +
      '.nl-placeholder{color:#595a57;font-style:italic}' +

      /* ══════════════════════════════════════════
         FAB 按鈕樣式
         hover 色由 JS 以 --nl-fab-hover 注入至
         每個按鈕，使每顆按鈕獨立顯示 accent 色。
         ══════════════════════════════════════════ */
      '.nl-fab-btn{' +
        'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'width:' + c.fabSize + ';min-height:' + c.fabSize + ';' +
        'background:' + c.fabBg + ';' +
        'border:' + c.borderWidth + ' solid ' + c.borderColor + ';' +
        'border-radius:' + c.fabBorderRadius + ';' +
        'font-size:' + c.fabIconSize + ';font-family:inherit;' +
        'gap:3px;padding:8px 4px;' +
        'text-decoration:none;cursor:pointer;' +
        'transition:border-color .18s ease,background .18s ease,color .18s ease;' +
        'user-select:none;box-sizing:border-box;' +
        '-webkit-appearance:none;appearance:none' +
      '}' +

      '.nl-fab-btn:hover{' +
        'border-color:var(--nl-fab-hover,' + c.borderHoverColor + ');' +
        'background:color-mix(in srgb,var(--nl-fab-hover,' + c.borderHoverColor + ') 15%,' + c.backgroundColor + ');' +
        'color:var(--nl-fab-hover,' + c.borderHoverColor + ')' +
      '}' +

      '.nl-fab-label{' +
        'font-size:' + c.fabLabelSize + ';font-weight:700;' +
        'letter-spacing:0.05em;line-height:1;color:inherit' +
      '}'
    );
  }

  function injectCSS() {
    var el = document.getElementById('_nl_css');
    if (!el) {
      el = document.createElement('style');
      el.id = '_nl_css';
      document.head.appendChild(el);
    }
    el.textContent = buildCSS();
  }

  function applyWidth(el, attr) {
    if (!attr) { el.style.width = '100%'; return; }
    var parts = attr.split('/');
    el.style.width = parts[0].trim();
    if (parts[1]) el.style.minWidth = parts[1].trim();
  }

  function getListTheme(listEl) {
    return resolveColor(listEl.getAttribute('theme-color'), 'theme-color');
  }

  function applyListProps(listEl, theme) {
    var props = ['--nl-gap', '--nl-hover-color', '--nl-active-color', '--nl-active-bg'];
    for (var p = 0; p < props.length; p++) listEl.style.removeProperty(props[p]);

    var gap    = listEl.getAttribute('gap');
    var hover  = resolveColor(listEl.getAttribute('hover'),  'hover');
    var active = resolveColor(listEl.getAttribute('active'), 'active');

    var hoverColor  = hover || theme;
    var activeColor = active || hover || theme;

    if (gap)         listEl.style.setProperty('--nl-gap', gap);
    if (hoverColor)  listEl.style.setProperty('--nl-hover-color', hoverColor);
    if (activeColor) {
      listEl.style.setProperty('--nl-active-color', activeColor);
      listEl.style.setProperty('--nl-active-bg',
        'color-mix(in srgb,' + activeColor + ' 12%,' + Config.backgroundColor + ')');
    }
  }

  /* extractItems 同時服務所有模式；
     fab 專屬欄位（href / label / linkTarget）在其他模式下為 null，無副作用。 */
  function extractItems(listEl) {
    var items = listEl.querySelectorAll(':scope > list-item');
    return Array.prototype.map.call(items, function (item, i) {
      return {
        number    : item.getAttribute('number')      || String(i + 1),
        accent    : item.getAttribute('accent')      || null,
        source    : item.getAttribute('source')      || null,
        target    : item.getAttribute('target')      || null,
        icon      : item.getAttribute('icon')        || null,
        href      : item.getAttribute('href')        || null,
        label     : item.getAttribute('label')       || null,
        linkTarget: item.getAttribute('link-target') || null,
        html      : item.innerHTML.trim()
      };
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  buildLi：數字 / icon / Grid 模式共用
   * ═══════════════════════════════════════════════════════════════════ */
  function buildLi(data, idx, siblings, listTheme, isIconMode) {
    var accent = resolveColor(data.accent, 'accent')
      || listTheme
      || resolveColor(Config.themeColor, 'themeColor')
      || Config.accentColors[idx % Config.accentColors.length];

    var isClickable = !!(data.source && data.target);

    var li = document.createElement('li');
    li.className = 'nl-item' + (isClickable ? ' nl-item--clickable' : '');

    var numDiv = document.createElement('div');
    numDiv.className   = 'nl-number';
    numDiv.style.color = accent;

    if (isIconMode && data.icon) {
      numDiv.classList.add('nl-number--icon');
      var iconEl = document.createElement('i');
      iconEl.className = 'bi bi-' + data.icon;
      numDiv.appendChild(iconEl);
    } else {
      numDiv.textContent = data.number;
    }

    var body = document.createElement('div');
    body.className = 'nl-content';

    if (data.html) {
      body.innerHTML = data.html;
    } else if (isClickable) {
      body.innerHTML = '<span class="nl-placeholder">點擊載入內容</span>';
    }

    li.appendChild(numDiv);
    li.appendChild(body);

    if (isClickable) {
      li.addEventListener('click', function () {
        for (var j = 0; j < siblings.length; j++) siblings[j].classList.remove('nl-item--active');
        li.classList.add('nl-item--active');
        var srcEl = document.getElementById(data.source);
        var tgtEl = document.getElementById(data.target);
        if (srcEl && tgtEl) tgtEl.innerHTML = srcEl.innerHTML;
      });
    }

    return li;
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  buildFabBtn：fab 模式專用
   *
   *  href 有值且不以 # 開頭 → <a> 外連結（rel="noopener"）
   *  href 以 # 開頭          → <button> + JS smooth scroll
   *  href 無值               → <button>（使用者自行 attach 事件）
   *
   *  link-target 屬性對應 <a target="...">，與 source/target 機制不衝突。
   * ═══════════════════════════════════════════════════════════════════ */
  function buildFabBtn(data, idx, listTheme) {
    var accent = resolveColor(data.accent, 'accent')
      || listTheme
      || resolveColor(Config.themeColor, 'themeColor')
      || Config.accentColors[idx % Config.accentColors.length];

    var el;
    var isExternal = !!(data.href && data.href.charAt(0) !== '#');

    if (isExternal) {
      el      = document.createElement('a');
      el.href = data.href;
      if (data.linkTarget) el.target = data.linkTarget;
      el.rel  = 'noopener';
    } else {
      el      = document.createElement('button');
      el.type = 'button';
      if (data.href) {
        var scrollTarget = data.href;
        el.addEventListener('click', function () {
          if (scrollTarget === '#' || scrollTarget === '#top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            var anchor = document.querySelector(scrollTarget);
            if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    }

    el.className = 'nl-fab-btn';
    el.style.color = accent;
    el.style.setProperty('--nl-fab-hover', accent);

    if (data.icon) {
      var iconEl = document.createElement('i');
      iconEl.className = 'bi bi-' + data.icon;
      el.appendChild(iconEl);
    }

    if (data.label) {
      var labelEl = document.createElement('span');
      labelEl.className   = 'nl-fab-label';
      labelEl.textContent = data.label;
      el.appendChild(labelEl);
    }

    return el;
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  renderFab：<ui-list> 本身作為 fixed 容器
   *
   *  position="right"（預設）/ "left"
   *  offset="16px"  — 距螢幕邊緣
   *  bottom="120px" — 距螢幕底部
   * ═══════════════════════════════════════════════════════════════════ */
  function renderFab(listEl) {
    var rawItems = listEl.querySelectorAll(':scope > list-item');
    var itemData;

    if (rawItems.length) {
      itemData = extractItems(listEl);
      if (store) store.set(listEl, { fabItems: itemData });
    } else {
      var cached = store ? store.get(listEl) : null;
      if (!cached || !cached.fabItems) return;
      itemData = cached.fabItems;
    }

    var theme    = getListTheme(listEl);
    var pos      = (listEl.getAttribute('position') || 'right').toLowerCase();
    var offset   = listEl.getAttribute('offset') || Config.fabOffset;
    var bottom   = listEl.getAttribute('bottom') || Config.fabBottom;
    var gap      = listEl.getAttribute('gap')    || Config.rowGap;

    /* ui-list 自身轉為 fixed 容器 */
    listEl.style.position      = 'fixed';
    listEl.style.display       = 'flex';
    listEl.style.flexDirection = 'column';
    listEl.style.zIndex        = '9999';
    listEl.style.gap           = gap;
    listEl.style.bottom        = bottom;
    listEl.style.top           = '';
    listEl.style.width         = '';
    listEl.style.left          = (pos === 'left')  ? offset : '';
    listEl.style.right         = (pos !== 'left')  ? offset : '';

    listEl.innerHTML = '';

    for (var i = 0; i < itemData.length; i++) {
      listEl.appendChild(buildFabBtn(itemData[i], i, theme));
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  renderUIList：入口，依 mode 分流
   *
   *  mode="fab"  → renderFab()（獨立邏輯，不共用 buildLi）
   *  其餘         → 數字 / icon / Grid 邏輯
   * ═══════════════════════════════════════════════════════════════════ */
  function renderUIList(listEl) {
    /* fab 走獨立分支 */
    if (listEl.getAttribute('mode') === 'fab') {
      renderFab(listEl);
      return;
    }

    var widthAttr;
    var itemData;
    var isIconMode;
    var cols;
    var hasLastSpan;

    var rawItems = listEl.querySelectorAll(':scope > list-item');
    if (rawItems.length) {
      widthAttr   = listEl.getAttribute('width');
      isIconMode  = listEl.getAttribute('mode') === 'icon';
      var colsAttr = listEl.getAttribute('cols');
      cols        = colsAttr ? Math.max(1, parseInt(colsAttr, 10) || 1) : 0;
      hasLastSpan = cols >= 2 && listEl.hasAttribute('last-span');
      itemData    = extractItems(listEl);
      if (store) store.set(listEl, {
        width: widthAttr, items: itemData,
        iconMode: isIconMode, cols: cols, lastSpan: hasLastSpan
      });
    } else {
      var cached = store ? store.get(listEl) : null;
      if (!cached) return;
      widthAttr   = cached.width;
      itemData    = cached.items;
      isIconMode  = cached.iconMode;
      cols        = cached.cols    || 0;
      hasLastSpan = cached.lastSpan || false;
    }

    var isGridMode = cols >= 2;

    for (var s = 0; s < itemData.length; s++) {
      if (itemData[s].source) {
        var srcEl = document.getElementById(itemData[s].source);
        if (srcEl) srcEl.style.display = 'none';
      }
    }

    var theme = getListTheme(listEl);

    var ol = document.createElement('ol');
    ol.className = 'nl-list' +
      (isGridMode  ? ' nl-list--grid'       : '') +
      (hasLastSpan ? ' nl-list--last-span'  : '');

    if (isGridMode) ol.style.setProperty('--nl-cols', String(cols));

    var liEls = [];
    for (var i = 0; i < itemData.length; i++) {
      var li = buildLi(itemData[i], i, liEls, theme, isIconMode);
      liEls.push(li);
      ol.appendChild(li);
    }

    applyWidth(listEl, widthAttr);
    applyListProps(listEl, theme);

    listEl.innerHTML = '';
    listEl.appendChild(ol);
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  公開 API
   * ═══════════════════════════════════════════════════════════════════ */
  var NumericList = {
    get defaults() { return Object.assign({}, Config); },
    get colors()   { return Object.assign({}, Palette); },

    /**
     * 覆蓋全域設定並重建 CSS。
     *
     * fab 相關設定：
     *   fabSize          — 按鈕寬高（預設 52px）
     *   fabIconSize      — 圖示大小（預設 1.4rem）
     *   fabLabelSize     — label 文字大小（預設 0.6rem）
     *   fabBg            — 按鈕背景色（預設 #0d1b24）
     *   fabBorderRadius  — 圓角（預設 8px）
     *   fabOffset        — 距螢幕邊緣（預設 16px）
     *   fabBottom        — 距螢幕底部（預設 120px）
     */
    setup: function (opts) {
      if (!opts || typeof opts !== 'object') { injectCSS(); return; }

      Object.assign(Config, opts);

      if (opts.themeColor !== undefined && opts.themeColor !== null) {
        Config.themeColor = resolveColor(opts.themeColor, 'themeColor');
      }
      if (opts.numberColor !== undefined) {
        Config.numberColor = resolveColor(opts.numberColor, 'numberColor') || Config.numberColor;
      }
      if (opts.numberColor !== undefined && opts.themeColor === undefined) {
        Config.themeColor = Config.numberColor;
      }

      var themeChanged = opts.numberColor !== undefined || opts.themeColor !== undefined;
      if (themeChanged && opts.borderHoverColor === undefined) {
        Config.borderHoverColor = Config.themeColor || Config.numberColor;
      }
      if (themeChanged && opts.borderActiveColor === undefined) {
        Config.borderActiveColor = Config.themeColor || Config.numberColor;
      }

      injectCSS();
    },

    init: function () {
      injectCSS();
      var lists = document.querySelectorAll('ui-list');
      Array.prototype.forEach.call(lists, renderUIList);
    },

    render: function (el) {
      if (!el) return;
      injectCSS();
      renderUIList(el);
    }
  };

  global.NumericList = NumericList;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { NumericList.init(); });
  } else {
    NumericList.init();
  }

}(window));
