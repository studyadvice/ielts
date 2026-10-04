(function (global) {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
   *  品牌色票（theme-color、hover、active 屬性皆可使用名稱）
   * ═══════════════════════════════════════════════════════════════════ */
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
    borderColor:        '#31332f',
    borderHoverColor:   '#82C8E5',
    borderActiveColor:  '#C3A5E5',
    numberColor:        '#82C8E5',
    themeColor:         null,        /* 全域主題色：非 null 時所有數字統一此色，可填品牌色名稱 */
    numberBg:           '#0d1b24',
    numberDivider:      '#1c2d38',
    textColor:          '#C6C7BD',
    backgroundColor:    '#0C0D0C',
    activeBackground:   '#10192a',

    accentColors: [
      '#82C8E5',   /* sky */
      '#C3A5E5',   /* lavender */
      '#1CCAE8',   /* ocean */
      '#B3DE73',   /* special */
      '#E3D322',   /* yellow */
      '#E5C3B3',   /* salmon */
      '#0DA591',   /* teal */
      '#FF91D7',   /* pink */
      '#EDA109',   /* orange */
      '#7849C9'    /* indigo */
    ],

    fontSize:       '1.125rem',
    numberFontSize: '3rem',
    numberMinWidth: '84px',
    borderRadius:   '6px',
    borderWidth:    '1px',
    rowGap:         '4px',
    lineHeight:     1.5,
    padV:           '8px',
    padH:           '12px',
    numberPad:      '12px 16px',
    lineGap:        '3px'
  };

  var store = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;

  /* ═══════════════════════════════════════════════════════════════════
   *  顏色解析
   *  1. 品牌色名稱（不分大小寫）：sky、Lavender ...
   *  2. 合法 CSS 顏色：#82C8E5、rgb(...)
   *  3. 其餘視為無效，回傳 null 並在 console 提示
   * ═══════════════════════════════════════════════════════════════════ */
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

      '.nl-list{' +
        'display:flex;flex-direction:column;' +
        'gap:var(--nl-gap,' + c.rowGap + ');' +
        'list-style:none;margin:0;padding:0' +
      '}' +

      '.nl-item{' +
        'display:flex;align-items:stretch;' +
        'border:' + c.borderWidth + ' solid ' + c.borderColor + ';' +
        'border-radius:' + c.borderRadius + ';overflow:hidden;' +
        'background:' + c.backgroundColor + ';' +
        'transition:border-color .18s ease,background .18s ease' +
      '}' +

      '.nl-item:hover{' +
        'border-color:var(--nl-hover-color,' + c.borderHoverColor + ')' +
      '}' +

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

      '.nl-content{' +
        'display:flex;flex-direction:column;justify-content:center;' +
        'padding:' + c.padV + ' ' + c.padH + ';gap:' + c.lineGap + ';flex:1;min-width:0;' +
        'font-size:' + c.fontSize + ';color:' + c.textColor + ';line-height:' + c.lineHeight +
      '}' +

      '.nl-content p,.nl-content li{margin:0;padding:0}' +
      '.nl-placeholder{color:#595a57;font-style:italic}'
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

  /* width="80%/360px" → width:80%; min-width:360px */
  function applyWidth(el, attr) {
    if (!attr) { el.style.width = '100%'; return; }
    var parts = attr.split('/');
    el.style.width = parts[0].trim();
    if (parts[1]) el.style.minWidth = parts[1].trim();
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  取得此清單的主題色（theme-color 屬性優先，其次全域 themeColor）
   * ═══════════════════════════════════════════════════════════════════ */
  function getListTheme(listEl) {
    return resolveColor(listEl.getAttribute('theme-color'), 'theme-color');
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  per-list CSS 自訂屬性
   *
   *  hover  顏色：hover 屬性 > theme-color > 全域設定
   *  active 顏色：active 屬性 > hover 屬性 > theme-color > 全域設定
   *  active 背景：有 theme-color 或 active 色時，自動以該色混入底色
   * ═══════════════════════════════════════════════════════════════════ */
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

  function extractItems(listEl) {
    var items = listEl.querySelectorAll(':scope > list-item');
    return Array.prototype.map.call(items, function (item, i) {
      return {
        number : item.getAttribute('number') || String(i + 1),
        accent : item.getAttribute('accent') || null,
        source : item.getAttribute('source') || null,
        target : item.getAttribute('target') || null,
        html   : item.innerHTML.trim()
      };
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  建立單一 <li>
   *
   *  數字顏色優先序：
   *    1. list-item 的 accent 屬性（可用品牌色名稱）
   *    2. ui-list 的 theme-color 屬性
   *    3. Config.themeColor（全域）
   *    4. Config.accentColors 循環
   * ═══════════════════════════════════════════════════════════════════ */
  function buildLi(data, idx, siblings, listTheme) {
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
    numDiv.textContent = data.number;

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
        for (var j = 0; j < siblings.length; j++) {
          siblings[j].classList.remove('nl-item--active');
        }
        li.classList.add('nl-item--active');

        var srcEl = document.getElementById(data.source);
        var tgtEl = document.getElementById(data.target);
        if (srcEl && tgtEl) tgtEl.innerHTML = srcEl.innerHTML;
      });
    }

    return li;
  }

  function renderUIList(listEl) {
    var widthAttr;
    var itemData;

    var rawItems = listEl.querySelectorAll(':scope > list-item');
    if (rawItems.length) {
      widthAttr = listEl.getAttribute('width');
      itemData  = extractItems(listEl);
      if (store) store.set(listEl, { width: widthAttr, items: itemData });
    } else {
      var cached = store ? store.get(listEl) : null;
      if (!cached) return;
      widthAttr = cached.width;
      itemData  = cached.items;
    }

    for (var s = 0; s < itemData.length; s++) {
      if (itemData[s].source) {
        var srcEl = document.getElementById(itemData[s].source);
        if (srcEl) srcEl.style.display = 'none';
      }
    }

    /* theme-color 每次渲染都重新讀取，修改屬性後呼叫 render(el) 即可生效 */
    var theme = getListTheme(listEl);

    var ol       = document.createElement('ol');
    ol.className = 'nl-list';
    var liEls    = [];

    for (var i = 0; i < itemData.length; i++) {
      var li = buildLi(itemData[i], i, liEls, theme);
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

    /* 品牌色票（唯讀副本） */
    get colors() { return Object.assign({}, Palette); },

    /**
     * 覆蓋全域設定並重建 CSS。
     * themeColor 可填品牌色名稱，例如 setup({ themeColor: 'lavender' })。
     * 恢復循環色：setup({ themeColor: null })
     */
    setup: function (opts) {
      if (!opts || typeof opts !== 'object') { injectCSS(); return; }

      Object.assign(Config, opts);

      /* themeColor、numberColor 允許使用品牌色名稱 */
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
