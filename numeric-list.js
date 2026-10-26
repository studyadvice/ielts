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

    hoverFX:              null,   /* 全域預設 hover 效果，可被 ui-list / list-item 覆蓋 */

    fabSize:              '52px',
    fabIconSize:          '1.4rem',
    fabLabelSize:         '0.6rem',
    fabBg:                '#0d1b24',
    fabBorderRadius:      '8px',
    fabOffset:            '16px',
    fabBottom:            '120px'
  };

  /* 可用的 hover 效果名稱 */
  var HoverFX = ['glow', 'lift', 'fill', 'bar', 'slide', 'zoom', 'invert', 'frame', 'none'];

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

  function resolveFX(value, attrName) {
    if (value === null || value === undefined) return null;
    var v = String(value).trim().toLowerCase();
    if (!v) return null;
    if (HoverFX.indexOf(v) !== -1) return v;
    if (global.console && console.warn) {
      console.warn('[NumericList] ' + (attrName || 'hover-fx') + '="' + v + '" 無效，可用值：' +
        HoverFX.join(', '));
    }
    return null;
  }

  function buildCSS() {
    var c = Config;
    var fxc = 'var(--nl-fx-color,' + c.borderHoverColor + ')';

    return (
      'ui-list{display:block}' +

      '.nl-list{' +
        'display:flex;flex-direction:column;' +
        'gap:var(--nl-gap,' + c.rowGap + ');' +
        'list-style:none;margin:0;padding:0' +
      '}' +

      '.nl-list--grid{display:grid;grid-template-columns:repeat(var(--nl-cols,2),1fr)}' +
      '.nl-list--grid .nl-number{min-width:' + c.gridNumberMinWidth + '}' +
      '.nl-list--grid.nl-list--last-span>.nl-item:last-child{grid-column:1/-1}' +
      '.nl-list--grid.nl-list--last-span>.nl-item:last-child .nl-number{min-width:' + c.numberMinWidth + '}' +

      '.nl-item{' +
        'position:relative;' +
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

      /* ══════════════════════════════════════════════════
         hover-fx 選擇性滑過效果
         色彩來源：--nl-fx-color（item accent → list fx-color → hover color）
         一律以 color-mix 與底色混合成不透明色，不使用低透明度 rgba。
         ══════════════════════════════════════════════════ */

      /* 1. glow：外光暈，邊框同步染色 */
      '.nl-item--fx-glow{transition:border-color .18s ease,background .18s ease,box-shadow .22s ease}' +
      '.nl-item--fx-glow:hover{' +
        'border-color:' + fxc + ';' +
        'box-shadow:0 0 0 1px ' + fxc + ',0 4px 18px color-mix(in srgb,' + fxc + ' 40%,' + c.backgroundColor + ')' +
      '}' +

      /* 2. lift：整列上浮並加投影 */
      '.nl-item--fx-lift{transition:border-color .18s ease,background .18s ease,transform .2s ease,box-shadow .2s ease}' +
      '.nl-item--fx-lift:hover{' +
        'transform:translateY(-3px);' +
        'border-color:' + fxc + ';' +
        'box-shadow:0 10px 22px color-mix(in srgb,' + fxc + ' 22%,#000000)' +
      '}' +

      /* 3. fill：底色由左至右填滿 */
      '.nl-item--fx-fill::before{' +
        'content:"";position:absolute;inset:0;z-index:0;pointer-events:none;' +
        'background:color-mix(in srgb,' + fxc + ' 16%,' + c.backgroundColor + ');' +
        'transform:scaleX(0);transform-origin:left center;' +
        'transition:transform .28s ease' +
      '}' +
      '.nl-item--fx-fill:hover::before{transform:scaleX(1)}' +
      '.nl-item--fx-fill:hover{border-color:' + fxc + '}' +
      '.nl-item--fx-fill>*{position:relative;z-index:1}' +

      /* 4. bar：底部色條展開 */
      '.nl-item--fx-bar::after{' +
        'content:"";position:absolute;left:0;right:0;bottom:0;height:3px;' +
        'background:' + fxc + ';pointer-events:none;' +
        'transform:scaleX(0);transform-origin:left center;' +
        'transition:transform .24s ease' +
      '}' +
      '.nl-item--fx-bar:hover::after{transform:scaleX(1)}' +

      /* 5. slide：內文右移並染色 */
      '.nl-item--fx-slide .nl-content{transition:transform .2s ease,color .2s ease}' +
      '.nl-item--fx-slide:hover .nl-content{transform:translateX(10px);color:' + fxc + '}' +
      '.nl-item--fx-slide:hover{border-color:' + fxc + '}' +

      /* 6. zoom：數字（或圖示）放大並襯底 */
      '.nl-item--fx-zoom .nl-number{transition:transform .22s ease,background .22s ease}' +
      '.nl-item--fx-zoom:hover .nl-number{' +
        'transform:scale(1.1);' +
        'background:color-mix(in srgb,' + fxc + ' 20%,' + c.numberBg + ')' +
      '}' +
      '.nl-item--fx-zoom:hover{border-color:' + fxc + '}' +

      /* 7. invert：數字區反白 */
      '.nl-item--fx-invert .nl-number{transition:background .2s ease,color .2s ease}' +
      '.nl-item--fx-invert:hover .nl-number{background:' + fxc + ';color:' + c.backgroundColor + '!important}' +
      '.nl-item--fx-invert:hover{border-color:' + fxc + '}' +

      /* 8. frame：外框向外擴張 */
      '.nl-item--fx-frame{' +
        'outline:1px solid color-mix(in srgb,' + fxc + ' 0%,' + c.backgroundColor + ');outline-offset:0;' +
        'transition:border-color .18s ease,background .18s ease,outline-color .2s ease,outline-offset .2s ease' +
      '}' +
      '.nl-item--fx-frame:hover{border-color:' + fxc + ';outline-color:' + fxc + ';outline-offset:4px}' +

      /* none：停用所有滑過變化 */
      '.nl-item--fx-none:hover{border-color:' + c.borderColor + '}' +

      /* ══════════════════════════════════════════════════
         list-item-ad 廣告列
         gap 消除原理（CSS 自訂屬性繼承）：
           .nl-ad:not(:first-child) → 抵消上方 gap
           .nl-ad + .nl-item        → 抵消下方 gap
           .nl-ad + .nl-ad          → 兩廣告相鄰時亦同
         ══════════════════════════════════════════════════ */
      '.nl-ad:not(:first-child){' +
        'margin-top:calc(-1 * var(--nl-gap,' + c.rowGap + '))' +
      '}' +
      '.nl-ad + .nl-item,' +
      '.nl-ad + .nl-ad{' +
        'margin-top:calc(-1 * var(--nl-gap,' + c.rowGap + '))' +
      '}' +

      '.nl-ad-inner{' +
        'display:block;' +
        'padding:' + c.padV + ' ' + c.padH + ';' +
        'color:rgba(255,255,255,0.92);' +
        'font-size:' + c.fontSize + ';' +
        'line-height:' + c.lineHeight + ';' +
        'text-decoration:none;' +
        'text-shadow:0 1px 3px rgba(0,0,0,0.92)' +
      '}' +
      '.nl-ad-inner[href]{transition:filter .18s ease}' +
      '.nl-ad-inner[href]:hover{filter:brightness(1.12) saturate(1.08)}' +

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

  /* ═══════════════════════════════════════════════════════════════════
   *  extractNodes：讀取 <list-item> 和 <list-item-ad>，依 DOM 順序
   *  回傳混合陣列，type 欄位區分兩種節點。
   *  只用於直欄 / icon / Grid 渲染路徑。
   * ═══════════════════════════════════════════════════════════════════ */
  function extractNodes(listEl) {
    var children = listEl.querySelectorAll(':scope > list-item, :scope > list-item-ad');
    var seq      = 0;   /* 只計 list-item 的序號，ad 不佔號 */

    return Array.prototype.map.call(children, function (el) {
      if (el.tagName.toLowerCase() === 'list-item-ad') {
        return {
          type      : 'ad',
          html      : el.innerHTML.trim(),
          from      : el.getAttribute('from')        || null,
          to        : el.getAttribute('to')          || null,
          dir       : el.getAttribute('dir')         || null,
          href      : el.getAttribute('href')        || null,
          linkTarget: el.getAttribute('link-target') || null
        };
      }
      /* list-item */
      var n = seq++;
      return {
        type   : 'item',
        number : el.getAttribute('number')   || String(n + 1),
        accent : el.getAttribute('accent')   || null,
        source : el.getAttribute('source')   || null,
        target : el.getAttribute('target')   || null,
        icon   : el.getAttribute('icon')     || null,
        fx     : el.getAttribute('hover-fx') || null,
        fxColor: el.getAttribute('fx-color') || null,
        html   : el.innerHTML.trim()
      };
    });
  }

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
        fx        : item.getAttribute('hover-fx')    || null,
        fxColor   : item.getAttribute('fx-color')    || null,
        html      : item.innerHTML.trim()
      };
    });
  }

  function buildLi(data, idx, siblings, listTheme, isIconMode, listFX, listFXColor) {
    var accent = resolveColor(data.accent, 'accent')
      || listTheme
      || resolveColor(Config.themeColor, 'themeColor')
      || Config.accentColors[idx % Config.accentColors.length];

    var isClickable = !!(data.source && data.target);

    var li = document.createElement('li');
    li.className = 'nl-item' + (isClickable ? ' nl-item--clickable' : '');

    /* hover 效果：item 屬性 → list 屬性 → 全域 Config.hoverFX */
    var fx = resolveFX(data.fx, 'hover-fx')
      || listFX
      || resolveFX(Config.hoverFX, 'hoverFX');
    if (fx) li.classList.add('nl-item--fx-' + fx);

    /* 效果色：item fx-color → list fx-color → 該列 accent */
    var fxColor = resolveColor(data.fxColor, 'fx-color') || listFXColor || accent;
    li.style.setProperty('--nl-fx-color', fxColor);

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
   *  buildAd：廣告列，僅限直欄模式（Grid 模式略過）
   *
   *  href 行為完全等同原生 <a href>：
   *    同頁錨點 (#id) → 瀏覽器原生跳轉
   *    外部 URL       → 頁面導航（搭配 link-target="_blank"）
   *
   *  漸層預設：indigo (#7849C9) → ocean (#1CCAE8)，方向 135deg
   *  from / to / dir 屬性可覆蓋，支援 Palette 名稱或任意 CSS 色值。
   * ═══════════════════════════════════════════════════════════════════ */
  function buildAd(data) {
    var fromColor = resolveColor(data.from, 'from') || Palette.indigo;
    var toColor   = resolveColor(data.to,   'to')   || Palette.ocean;
    var dir       = data.dir || '135deg';

    var li       = document.createElement('li');
    li.className = 'nl-ad';

    var inner;
    if (data.href) {
      inner      = document.createElement('a');
      inner.href = data.href;
      if (data.linkTarget) inner.target = data.linkTarget;
      /* 外連才加 rel；同頁錨點不需要 */
      if (data.href.charAt(0) !== '#') inner.rel = 'noopener';
    } else {
      inner = document.createElement('div');
    }

    inner.className        = 'nl-ad-inner';
    inner.style.background = 'linear-gradient(' + dir + ',' + fromColor + ',' + toColor + ')';
    inner.innerHTML        = data.html;

    li.appendChild(inner);
    return li;
  }

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

    var theme  = getListTheme(listEl);
    var pos    = (listEl.getAttribute('position') || 'right').toLowerCase();
    var offset = listEl.getAttribute('offset') || Config.fabOffset;
    var bottom = listEl.getAttribute('bottom') || Config.fabBottom;
    var gap    = listEl.getAttribute('gap')    || Config.rowGap;

    listEl.style.position      = 'fixed';
    listEl.style.display       = 'flex';
    listEl.style.flexDirection = 'column';
    listEl.style.zIndex        = '9999';
    listEl.style.gap           = gap;
    listEl.style.bottom        = bottom;
    listEl.style.top           = '';
    listEl.style.width         = '';
    listEl.style.left          = (pos === 'left') ? offset : '';
    listEl.style.right         = (pos !== 'left') ? offset : '';

    listEl.innerHTML = '';
    for (var i = 0; i < itemData.length; i++) {
      listEl.appendChild(buildFabBtn(itemData[i], i, theme));
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  renderUIList：入口，依 mode 分流
   *
   *  mode="fab"  → renderFab()
   *  其餘         → 數字 / icon / Grid / ad 混合邏輯
   *
   *  list-item-ad 規則：
   *    ‣ 直欄 / icon 模式：正常渲染 buildAd()
   *    ‣ Grid 模式（cols >= 2）：略過，不渲染
   *    ‣ 廣告不佔 item 序號（accent 循環、編號不計廣告）
   *
   *  hover-fx 規則：
   *    ‣ list-item 的 hover-fx 優先，其次 ui-list，最後 Config.hoverFX
   *    ‣ fx-color 未指定時，效果色採用該列的 accent
   * ═══════════════════════════════════════════════════════════════════ */
  function renderUIList(listEl) {
    if (listEl.getAttribute('mode') === 'fab') {
      renderFab(listEl);
      return;
    }

    var widthAttr;
    var nodeData;
    var isIconMode;
    var cols;
    var hasLastSpan;
    var rawNodes = listEl.querySelectorAll(':scope > list-item, :scope > list-item-ad');

    if (rawNodes.length) {
      widthAttr   = listEl.getAttribute('width');
      isIconMode  = listEl.getAttribute('mode') === 'icon';
      var colsAttr = listEl.getAttribute('cols');
      cols        = colsAttr ? Math.max(1, parseInt(colsAttr, 10) || 1) : 0;
      hasLastSpan = cols >= 2 && listEl.hasAttribute('last-span');
      nodeData    = extractNodes(listEl);
      if (store) store.set(listEl, {
        width: widthAttr, items: nodeData,
        iconMode: isIconMode, cols: cols, lastSpan: hasLastSpan
      });
    } else {
      var cached = store ? store.get(listEl) : null;
      if (!cached) return;
      widthAttr   = cached.width;
      nodeData    = cached.items;
      isIconMode  = cached.iconMode;
      cols        = cached.cols    || 0;
      hasLastSpan = cached.lastSpan || false;
    }

    var isGridMode = cols >= 2;

    /* source 元素隱藏（只在 item 節點上） */
    for (var s = 0; s < nodeData.length; s++) {
      if (nodeData[s].type === 'item' && nodeData[s].source) {
        var srcEl = document.getElementById(nodeData[s].source);
        if (srcEl) srcEl.style.display = 'none';
      }
    }

    var theme     = getListTheme(listEl);
    var listFX    = resolveFX(listEl.getAttribute('hover-fx'), 'hover-fx');
    var listFXCol = resolveColor(listEl.getAttribute('fx-color'), 'fx-color');

    var ol = document.createElement('ol');
    ol.className = 'nl-list' +
      (isGridMode  ? ' nl-list--grid'      : '') +
      (hasLastSpan ? ' nl-list--last-span' : '');

    if (isGridMode) ol.style.setProperty('--nl-cols', String(cols));

    var liEls    = [];   /* 只收 nl-item，供 active 互斥使用 */
    var itemCount = 0;   /* 不計 ad，維持 accent 循環與序號正確 */

    for (var i = 0; i < nodeData.length; i++) {
      var d = nodeData[i];

      if (d.type === 'ad') {
        /* Grid 模式略過廣告（欄佔比不可預期） */
        if (!isGridMode) ol.appendChild(buildAd(d));
        continue;
      }

      /* list-item */
      var li = buildLi(d, itemCount, liEls, theme, isIconMode, listFX, listFXCol);
      liEls.push(li);
      ol.appendChild(li);
      itemCount++;
    }

    applyWidth(listEl, widthAttr);
    applyListProps(listEl, theme);

    listEl.innerHTML = '';
    listEl.appendChild(ol);
  }

  var NumericList = {
    get defaults() { return Object.assign({}, Config); },
    get colors()   { return Object.assign({}, Palette); },
    get effects()  { return HoverFX.slice(); },

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
      if (opts.hoverFX !== undefined) {
        Config.hoverFX = resolveFX(opts.hoverFX, 'hoverFX');
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
