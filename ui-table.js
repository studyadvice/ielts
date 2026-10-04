(function (global) {
  'use strict';

  var BRAND = {
    shell:    '#C6C7BD',
    lavender: '#C3A5E5',
    special:  '#B3DE73',
    warning:  '#E6374B',
    salmon:   '#E5C3B3',
    sky:      '#95C9DE',
    ocean:    '#1CCAE8',
    safe:     '#299459',
    vanilla:  '#DBEDD8',
    yellow:   '#E3D322',
    info:     '#2351DB',
    indigo:   '#7849C9',
    pink:     '#FF91D7',
    focus:    '#3C7BCF',
    orange:   '#EDA109',
    teal:     '#0DA591'
  };

  var BG = '#0C0D0C';

  /* ----------------------------------------------------------------
   * 全域設定（可在引入前用 window.UiTableConfig = {...} 預設）
   *
   * 新增（v1.4.0）：
   *   autoRevealInterval  — ms；>0 時頁面載入後依序展開所有 hidden 列
   *   cellAlignment       — left | center | right
   *   verticalAlignment   — top | middle | bottom
   *   hoverBgColor        — 品牌色名或 hex；'' = 無 hover 效果
   *   cellMinHeight       — 例如 '40px'；'' = 不限
   * 新增（v1.4.1）：
   *   rowBorder           — 全局列邊框，格式同 CSS border-width，例如 '1px solid'
   *                         會套用到所有 ui-row 與 ui-row-enhance；
   *                         個別列的 border 屬性仍可覆寫
   * ---------------------------------------------------------------- */
  var CFG = global.UiTableConfig = Object.assign({
    theme:              'shell',
    cellPadding:        '6px',
    fontSize:           '1rem',
    alertDuration:      5000,
    autoRevealInterval: 0,
    cellAlignment:      'left',
    verticalAlignment:  'top',
    hoverBgColor:       '',
    cellMinHeight:      '',
    rowBorder:          ''
  }, global.UiTableConfig || {});

  var ICO = {
    'i-arrow-down':  icoP('M6 9 12 15 18 9'),
    'i-arrow-up':    icoP('M18 15 12 9 6 15'),
    'i-arrow-right': icoP('M9 18 15 12 9 6'),
    'i-arrow-left':  icoP('M15 18 9 12 15 6'),
    'i-check':       icoP('M20 6 9 17 4 12'),
    'i-expand':      icoP('M6 9 12 15 18 9'),
    'i-collapse':    icoP('M18 15 12 9 6 15'),
    'i-lock': [
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"',
      ' stroke="currentColor" stroke-width="2.5"',
      ' stroke-linecap="round" stroke-linejoin="round">',
      '<rect x="3" y="11" width="18" height="11" rx="2"/>',
      '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
      '</svg>'
    ].join('')
  };

  function icoP(d) {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"' +
      ' stroke="currentColor" stroke-width="2.5"' +
      ' stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="' + d + '"/></svg>';
  }

  var MASK_GRADIENTS = {
    '1': 'linear-gradient(135deg,#0d0814 0%,#1e1040 45%,#7849C9 100%)',
    '2': 'linear-gradient(135deg,#041418 0%,#073540 45%,#1CCAE8 100%)',
    '3': 'linear-gradient(135deg,#1c0900 0%,#6b3000 50%,#EDA109 100%)',
    '4': 'linear-gradient(135deg,#1a060e 0%,#5e1535 50%,#FF91D7 100%)',
    '5': 'linear-gradient(135deg,#041208 0%,#083820 50%,#0DA591 100%)',
    '6': 'linear-gradient(135deg,#060c1e 0%,#162060 50%,#2351DB 80%,#7849C9 100%)'
  };

  var MASK_GRAD_TEXT = '#DBEDD8';

  function resolveColor(v) {
    if (!v) return null;
    v = String(v).trim();
    return BRAND[v] || (/^#|^rgb/.test(v) ? v : null);
  }

  function hexRgba(hex, a) {
    a = Math.max(+a || 0, 0.76);
    var h = hex.replace('#', '');
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  /* ── 對齊工具函式 ── */
  function alignH(v) {
    if (v === 'center') return 'center';
    if (v === 'right')  return 'flex-end';
    return 'flex-start';
  }

  function alignV(v) {
    if (v === 'middle') return 'center';
    if (v === 'bottom') return 'flex-end';
    return 'flex-start';
  }

  function alignTxt(v) {
    if (v === 'center') return 'center';
    if (v === 'right')  return 'right';
    return 'left';
  }

  function mkIco(name) {
    if (!name) return '';
    if (/^bi-/.test(name)) {
      return '<span class="uit-ico">' +
        '<i class="bi ' + name + '" aria-hidden="true"></i>' +
        '</span>';
    }
    return ICO[name] ? '<span class="uit-ico">' + ICO[name] + '</span>' : '';
  }

  function mk(tag, cls) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }

  function qsa(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  function isSrcCol(el) {
    return el.hasAttribute('hidden') && el.hasAttribute('id');
  }

  function timedTrigger(showFn, hideFn, interval, duration) {
    function once() {
      showFn();
      setTimeout(hideFn, duration);
    }
    setTimeout(function () { once(); setInterval(once, interval); }, interval);
  }

  /* ----------------------------------------------------------------
   * CSS
   *
   * 變更（v1.4.0）：
   *   - ui-row-enhance 加入隱藏規則
   *   - .uit-col 改為 flex column，啟用垂直對齊與 min-height 變數
   *   - .uit-ci 加入水平對齊變數 --uit-halign
   *   - .uit-ct 加入文字對齊變數 --uit-txtalign
   *   - 新增 .uit-col:hover 規則（--uit-hover 空時透明無效果）
   * ---------------------------------------------------------------- */
  var CSS = [

    'ui-table,ui-group,ui-row,ui-row-enhance,ui-col,cell-item{display:none}',
    '.uit-wrap{width:100%;box-sizing:border-box;position:relative;font-size:var(--uit-fs,1rem);line-height:1.5}',
    '.uit-scroll{overflow-x:auto;width:100%}',
    '.uit-group{margin-bottom:16px;border-radius:6px;overflow:hidden;border:1px solid var(--uit-tm20)}',

    /* Group header */
    '.uit-gh{display:flex;align-items:center;padding:10px 16px;cursor:pointer;user-select:none;gap:8px;background:var(--uit-tm15)}',
    '.uit-gtl{font-weight:700;color:var(--uit-tm);flex:1;font-size:var(--uit-fs)}',
    '.uit-gtr{font-size:calc(var(--uit-fs)*0.85);color:var(--uit-tm);opacity:.85}',
    '.uit-gtog{display:inline-flex;align-items:center;color:var(--uit-tm);transition:transform .28s ease;flex-shrink:0}',
    '.uit-group.collapsed .uit-gtog{transform:rotate(-90deg)}',

    /* Group body */
    '.uit-gb{overflow:hidden;max-height:9999px;transition:max-height .35s ease,opacity .28s ease;opacity:1}',
    '.uit-gb.collapsed{max-height:0!important;opacity:0}',

    /* ui-row */
    '.uit-row{display:grid;position:relative;box-sizing:border-box}',
    '.uit-row.uit-hidden{display:none!important}',

    /* ui-col —— 改為 flex column，支援垂直對齊與 min-height */
    '.uit-col{position:relative;box-sizing:border-box;overflow:hidden;word-break:break-word;min-width:0;' +
      'display:flex;flex-direction:column;' +
      'justify-content:var(--uit-valign,flex-start);' +
      'min-height:var(--uit-minh,0)}',

    /* hover：--uit-hover 未設定時為 transparent，無視覺效果 */
    '.uit-col:hover{background:var(--uit-hover,transparent)}',

    /* ui-ci —— 加入水平對齊 */
    '.uit-ci{display:flex;align-items:flex-start;gap:6px;min-width:0;justify-content:var(--uit-halign,flex-start)}',
    '.uit-ico{display:inline-flex;align-items:center;flex-shrink:0;margin-top:.1em}',

    /* uit-ct —— 加入文字對齊 */
    '.uit-ct{flex:1;min-width:0;font-size:var(--uit-fs);text-align:var(--uit-txtalign,left)}',

    /* expandable */
    '.uit-col.is-exp .uit-ct{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;cursor:pointer}',
    '.uit-col.is-exp.expanded .uit-ct{display:block;overflow:visible}',
    '.uit-etog{cursor:pointer;flex-shrink:0;display:inline-flex;align-items:center;opacity:.82;color:var(--uit-tm);margin-top:.15em;transition:opacity .2s}',
    '.uit-etog:hover{opacity:1}',

    /* show-next */
    '.uit-col.has-sn{cursor:pointer;transition:opacity .2s}',
    '.uit-col.has-sn:hover{opacity:.82}',

    /* 遮罩 */
    '.uit-mask{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:10;gap:8px;font-weight:600;transition:opacity .3s ease;font-size:var(--uit-fs);border-radius:inherit}',
    '.uit-mask.unlockable{cursor:pointer}',
    '.uit-mask.unlockable:hover{filter:brightness(1.1)}',
    '.uit-mask.locked{cursor:not-allowed;filter:brightness(0.76)}',
    '.uit-mask.revealed{opacity:0;pointer-events:none}',
    '.uit-mlock{display:inline-flex;align-items:center}',

    /* 輪播 */
    '.uit-car{position:relative;overflow:hidden;flex:1;font-size:var(--uit-fs)}',
    '.uit-car-item{width:100%;box-sizing:border-box}',

    /* 進度條 */
    '.uit-pb{height:3px;background:rgba(255,255,255,.15);border-radius:2px;overflow:hidden;margin-top:6px;flex-shrink:0}',
    '.uit-pf{height:100%;border-radius:2px;transform-origin:left center}',
    '@keyframes uit-prog{from{transform:scaleX(1)}to{transform:scaleX(0)}}',

    /* Alert */
    '.uit-alert-A{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:6px 12px;white-space:normal;text-align:center;opacity:0;transition:opacity .35s ease;pointer-events:none;font-weight:600;font-size:var(--uit-fs)}',
    '.uit-alert-A.vis{opacity:1}',
    '.uit-alert-ext{position:fixed;z-index:9999;pointer-events:none;padding:5px 14px;border-radius:6px;font-weight:600;line-height:1.5;white-space:nowrap;opacity:0;transition:opacity .35s ease;font-size:var(--uit-fs,1rem)}',
    '.uit-alert-ext.vis{opacity:1}',

    /* 固定欄 */
    '.uit-col.fix-l{position:sticky;left:0;z-index:5}',
    '.uit-col.fix-r{position:sticky;right:0;z-index:5}'

  ].join('\n');

  var _cssInj = false;
  function injectCSS() {
    if (_cssInj) return;
    _cssInj = true;
    var s = document.createElement('style');
    s.id = 'uit-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  injectCSS();

  /* ----------------------------------------------------------------
   * UiTable 建構子
   * ---------------------------------------------------------------- */
  function UiTable(el) {
    this.el     = el;
    this.wrap   = null;   // 在 _render 後設定
    this.theme  = el.getAttribute('theme') || CFG.theme;
    this.color  = resolveColor(this.theme) || BRAND.shell;
    this.src    = el.getAttribute('src');
    this.dataId = el.getAttribute('data-id');
    this.colN   = 0;

    this.srcMap = {};
    var self = this;
    el.querySelectorAll('ui-col[id][hidden]').forEach(function (c) {
      self.srcMap[c.id] = c.innerHTML;
    });
  }

  /* ----------------------------------------------------------------
   * init：決定資料來源後啟動渲染
   * ---------------------------------------------------------------- */
  UiTable.prototype.init = function () {
    var self = this;
    if (this.src) {
      fetch(this.src)
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (d) { self._fromJSON(d); })
        .catch(function (e) { console.error('[ui-table] src 載入失敗:', e); });
    } else if (this.dataId) {
      var d = global[this.dataId];
      if (!d) { console.error('[ui-table] data-id 找不到:', this.dataId); return; }
      this._fromJSON(d);
    } else {
      this._render();
    }
  };

  /* ----------------------------------------------------------------
   * _fromJSON：從 JSON 物件建立 DOM，再呼叫 _render
   *
   * 新增（v1.4.0）：
   *   - data 頂層支援 autoRevealInterval / cellAlignment /
   *     verticalAlignment / hoverBgColor / cellMinHeight
   *   - row 層支援 enhance: true → 建立 <ui-row-enhance>
   *   - col 層支援 maskText2 / maskInvert
   * ---------------------------------------------------------------- */
  UiTable.prototype._fromJSON = function (data) {
    var self = this;

    if (data.fontSize)           this.el.setAttribute('font-size',           data.fontSize);
    if (data.autoRevealInterval) this.el.setAttribute('auto-reveal-interval', String(data.autoRevealInterval));
    if (data.cellAlignment)      this.el.setAttribute('cell-alignment',       data.cellAlignment);
    if (data.verticalAlignment)  this.el.setAttribute('vertical-alignment',   data.verticalAlignment);
    if (data.hoverBgColor)       this.el.setAttribute('hover-bg-color',       data.hoverBgColor);
    if (data.cellMinHeight)      this.el.setAttribute('cell-min-height',      data.cellMinHeight);
    if (data.rowBorder)          this.el.setAttribute('row-border',           data.rowBorder);

    this.el.innerHTML = '';

    (data.groups || []).forEach(function (gd) {
      var g = mk('ui-group');
      if (gd.titleLeft)   g.setAttribute('title-left',  gd.titleLeft);
      if (gd.titleRight)  g.setAttribute('title-right', gd.titleRight);
      if (gd.iniCollapse) g.setAttribute('ini-collapse', '');

      (gd.rows || []).forEach(function (rd) {
        /* enhance: true → <ui-row-enhance>；否則 <ui-row> */
        var r = mk(rd.enhance ? 'ui-row-enhance' : 'ui-row');
        if (rd.hidden)      r.setAttribute('hidden',       '');
        if (rd.cellPadding) r.setAttribute('cell-padding', rd.cellPadding);
        if (rd.border)      r.setAttribute('border',       rd.border);
        if (rd.colWidths)   r.setAttribute('col-widths',   rd.colWidths);
        if (rd.colBorder)   r.setAttribute('col-border',   rd.colBorder);
        if (rd.fontSize)    r.setAttribute('font-size',    rd.fontSize);
        if (rd.lineHeight)  r.setAttribute('line-height',  rd.lineHeight);
        if (rd.textIndent)  r.setAttribute('text-indent',  rd.textIndent);

        (rd.cols || []).forEach(function (cd) {
          var c = mk('ui-col');
          if (cd.icon)              c.setAttribute('icon',              cd.icon);
          if (cd.span)              c.setAttribute('span',              String(cd.span));
          if (cd.width)             c.setAttribute('width',             cd.width);
          if (cd.fixed)             c.setAttribute('fixed',             cd.fixed);
          if (cd.showNext)          c.setAttribute('show-next',         'true');
          if (cd.expandable)        c.setAttribute('expandable',        '');
          if (cd.maskText)          c.setAttribute('mask-text',         cd.maskText);
          if (cd.maskText2)         c.setAttribute('mask-text-2',       cd.maskText2);
          if (cd.maskInvert)        c.setAttribute('mask-invert',       '');
          if (cd.maskColor)         c.setAttribute('mask-color',        cd.maskColor);
          if (cd.maskOrder != null) c.setAttribute('mask-order',        String(cd.maskOrder));
          if (cd.carouselInterval)  c.setAttribute('carousel-interval', String(cd.carouselInterval));
          if (cd.progressBar)       c.setAttribute('progress-bar',      '');
          if (cd.progressBarColor)  c.setAttribute('progress-bar-color', cd.progressBarColor);
          if (cd.alertMsg)          c.setAttribute('alert-msg',         cd.alertMsg);
          if (cd.alertColor)        c.setAttribute('alert-color',       cd.alertColor);
          if (cd.alertInterval)     c.setAttribute('alert-interval',    String(cd.alertInterval));
          if (cd.alertPos)          c.setAttribute('alert-pos',         cd.alertPos);

          if (cd.items && cd.items.length) {
            cd.items.forEach(function (it) {
              var ci = mk('cell-item');
              ci.innerHTML = it;
              c.appendChild(ci);
            });
          } else {
            c.innerHTML = cd.content || '';
          }
          r.appendChild(c);
        });
        g.appendChild(r);
      });
      self.el.appendChild(g);
    });
    this._render();
  };

  /* ----------------------------------------------------------------
   * _render：主渲染流程
   *
   * 新增（v1.4.0）：
   *   - 讀取對齊、hover、min-height 設定並注入 CSS 變數
   *   - 儲存 this.wrap 供 _setupAutoReveal 使用
   *   - 渲染後呼叫 _setupAutoReveal
   *   - 無 group 時的 qsa 加入 ui-row-enhance
   * ---------------------------------------------------------------- */
  UiTable.prototype._render = function () {
    this.colN = this._getColCount();

    var wrap = mk('div', 'uit-wrap');
    this.wrap = wrap;

    var c  = this.color;
    var fs = this.el.getAttribute('font-size') || CFG.fontSize;

    /* 讀取對齊設定（element 屬性 > CFG） */
    var caRaw = this.el.getAttribute('cell-alignment')    || CFG.cellAlignment;
    var vaRaw = this.el.getAttribute('vertical-alignment') || CFG.verticalAlignment;
    var ha    = alignH(caRaw);
    var va    = alignV(vaRaw);
    var ta    = alignTxt(caRaw);

    /* Hover 色 */
    var hoverRaw = this.el.getAttribute('hover-bg-color') || CFG.hoverBgColor;
    var hoverC   = resolveColor(hoverRaw);

    /* Min-height */
    var minh = this.el.getAttribute('cell-min-height') || CFG.cellMinHeight;

    /* 全局列邊框（element 屬性 > CFG） */
    this._rowBorder = this.el.getAttribute('row-border') || CFG.rowBorder || '';

    var vars = [
      '--uit-tm:'      + c,
      '--uit-fs:'      + fs,
      '--uit-tm15:'    + hexRgba(c, 0.15),
      '--uit-tm20:'    + hexRgba(c, 0.20),
      '--uit-halign:'  + ha,
      '--uit-valign:'  + va,
      '--uit-txtalign:' + ta
    ];
    if (hoverC) {
      var hv = /^#/.test(hoverC) ? hexRgba(hoverC, 0.12) : hoverC;
      vars.push('--uit-hover:' + hv);
    }
    if (minh) vars.push('--uit-minh:' + minh);

    wrap.style.cssText = vars.join(';');

    var scroll = mk('div', 'uit-scroll');
    wrap.appendChild(scroll);

    var self   = this;
    var groups = qsa(':scope > ui-group', this.el);
    if (groups.length) {
      groups.forEach(function (g) { scroll.appendChild(self._renderGroup(g)); });
    } else {
      /* 無 group：同時掃描 ui-row 與 ui-row-enhance */
      var rows = qsa(':scope > ui-row, :scope > ui-row-enhance', this.el);
      var rds  = this._renderRows(rows, scroll);
      this._bindSN(rds);
    }

    this.el.before(wrap);
    this.el.style.display = 'none';

    this._setupAutoReveal();
  };

  /* ----------------------------------------------------------------
   * _setupAutoReveal：頁面載入後依序展開 hidden 列
   *
   * 觸發條件（任一）：
   *   <ui-table auto-reveal-interval="1500"> 元素屬性
   *   UiTableConfig.autoRevealInterval = 1500 全域設定
   * ---------------------------------------------------------------- */
  UiTable.prototype._setupAutoReveal = function () {
    var ms = parseInt(this.el.getAttribute('auto-reveal-interval')) ||
             CFG.autoRevealInterval;
    if (!ms) return;
    var hiddenRows = Array.from(this.wrap.querySelectorAll('.uit-row.uit-hidden'));
    if (!hiddenRows.length) return;
    hiddenRows.forEach(function (row, i) {
      setTimeout(function () {
        row.classList.remove('uit-hidden');
      }, ms * (i + 1));
    });
  };

  /* ----------------------------------------------------------------
   * _getColCount：取第一個含有作用欄的 ui-row 的欄數
   *
   * 注意（v1.4.0）：只掃描 <ui-row>，不含 <ui-row-enhance>。
   * ui-row-enhance 各列自行決定欄數，不參與全局 colN 計算。
   * ---------------------------------------------------------------- */
  UiTable.prototype._getColCount = function () {
    var rows = qsa('ui-row', this.el);
    for (var i = 0; i < rows.length; i++) {
      var active = qsa(':scope > ui-col', rows[i]).filter(function (c) {
        return !isSrcCol(c);
      });
      if (active.length) return active.length;
    }
    return 0;
  };

  /* ----------------------------------------------------------------
   * _renderGroup：渲染 ui-group（含折疊）
   *
   * 更新（v1.4.0）：qsa 加入 ui-row-enhance
   * ---------------------------------------------------------------- */
  UiTable.prototype._renderGroup = function (gEl) {
    var self = this;
    var div  = mk('div', 'uit-group');
    var tl   = gEl.getAttribute('title-left')  || '';
    var tr   = gEl.getAttribute('title-right') || '';
    var ini  = gEl.hasAttribute('ini-collapse');

    var gh = mk('div', 'uit-gh');
    gh.style.background = hexRgba(this.color, 0.15);

    var gtl = mk('span', 'uit-gtl');
    gtl.textContent = tl;
    gtl.style.color = this.color;

    var gtr = mk('span', 'uit-gtr');
    gtr.textContent = tr;
    gtr.style.color = this.color;

    var gtog = mk('span', 'uit-gtog');
    gtog.innerHTML = ICO['i-arrow-down'] || '▾';
    gtog.style.color = this.color;

    gh.append(gtl, gtr, gtog);

    var gb   = mk('div', 'uit-gb');
    /* 同時蒐集 ui-row 與 ui-row-enhance */
    var rows = qsa(':scope > ui-row, :scope > ui-row-enhance', gEl);
    var rds  = this._renderRows(rows, gb);
    this._bindSN(rds);

    if (ini) {
      div.classList.add('collapsed');
      gb.classList.add('collapsed');
    }

    gh.addEventListener('click', function () {
      var c = div.classList.toggle('collapsed');
      gb.classList.toggle('collapsed', c);
    });

    div.append(gh, gb);
    return div;
  };

  /* ----------------------------------------------------------------
   * _renderRows：渲染多列，統一建立全域遮罩鏈
   *
   * 更新（v1.4.0）：
   *   根據標籤名稱分流——ui-row-enhance 傳 useLocalN=true，
   *   讓 _renderRow 使用自身欄數而非全局 colN。
   * ---------------------------------------------------------------- */
  UiTable.prototype._renderRows = function (rowEls, container) {
    var self = this;
    var rds  = [];

    /* Step 1：跨列計算 mask-order 出現次數 */
    var globalMoCount = {};
    rowEls.forEach(function (r) {
      qsa(':scope > ui-col', r)
        .filter(function (c) { return !isSrcCol(c); })
        .forEach(function (c) {
          var mo = parseInt(c.getAttribute('mask-order'));
          if (!isNaN(mo)) globalMoCount[mo] = (globalMoCount[mo] || 0) + 1;
        });
    });

    /* Step 2：渲染各列；ui-row-enhance 用自身欄數 */
    rowEls.forEach(function (r) {
      var useLocalN = r.tagName.toLowerCase() === 'ui-row-enhance';
      var d = self._renderRow(r, globalMoCount, useLocalN);
      if (d) {
        rds.push({ el: d, src: r });
        container.appendChild(d);
      }
    });

    /* Step 3：全局遮罩鏈 */
    var masks = Array.from(
      container.querySelectorAll('.uit-mask[data-mask-order]')
    ).sort(function (a, b) {
      return +a.dataset.maskOrder - +b.dataset.maskOrder;
    });

    for (var i = 1; i < masks.length; i++) {
      var prev = +masks[i - 1].dataset.maskOrder;
      var curr = +masks[i].dataset.maskOrder;
      if (curr !== prev + 1) {
        console.warn('[ui-table] mask-order 不連續: ' + prev + ' → ' + curr);
      }
    }

    self._setupMaskChain(masks);
    return rds;
  };

  /* ----------------------------------------------------------------
   * _renderRow：渲染單列
   *
   * 更新（v1.4.0）：
   *   新增第三參數 useLocalN（boolean）。
   *   useLocalN = true  → 欄數取自本列實際 ui-col 數（ui-row-enhance）
   *   useLocalN = false → 欄數使用全局 this.colN（ui-row，原有行為）
   * ---------------------------------------------------------------- */
  UiTable.prototype._renderRow = function (rowEl, globalMoCount, useLocalN) {
    var self = this;

    var active = qsa(':scope > ui-col', rowEl).filter(function (c) {
      return !isSrcCol(c);
    });
    if (!active.length) return null;

    var hasSpan = active.some(function (c) { return c.hasAttribute('span'); });

    /* 決定本列使用的欄數 */
    var colN = useLocalN ? active.length : this.colN;

    /* col-widths 驗證對比 colN（enhance 列對比自身欄數） */
    var cw = hasSpan ? null : rowEl.getAttribute('col-widths');
    if (cw) {
      var parts = cw.split(':');
      if (parts.length !== colN) {
        console.error(
          '[ui-table] col-widths="' + cw + '" 比例數(' + parts.length +
          ')與欄數(' + colN + ')不符，略過此列渲染。'
        );
        return null;
      }
    }

    var div = mk('div', 'uit-row');
    if (rowEl.hasAttribute('hidden')) div.classList.add('uit-hidden');

    var tpl = (cw && !hasSpan)
      ? cw.split(':').map(function (v) { return parseFloat(v) + 'fr'; }).join(' ')
      : 'repeat(' + colN + ',1fr)';
    div.style.gridTemplateColumns = tpl;

    /* 個別列 border 屬性優先；若無則使用全局 this._rowBorder */
    var bdr = rowEl.getAttribute('border') || this._rowBorder;
    if (bdr) div.style.border = bdr + ' ' + this.color;

    var pad = rowEl.getAttribute('cell-padding') || CFG.cellPadding;

    var rowStyle = {
      fontSize:   rowEl.getAttribute('font-size'),
      lineHeight: rowEl.getAttribute('line-height'),
      textIndent: rowEl.getAttribute('text-indent'),
      colBorder:  hasSpan ? null : rowEl.getAttribute('col-border')
    };

    var colTotal = active.length;
    active.forEach(function (colEl, idx) {
      var cd = self._renderCol(colEl, pad, rowStyle, globalMoCount);
      div.appendChild(cd);

      if (rowStyle.colBorder && idx < colTotal - 1) {
        cd.style.borderRight = rowStyle.colBorder + ' ' + self.color;
      }
    });

    return div;
  };

  /* ----------------------------------------------------------------
   * _setupMaskChain：依序解鎖遮罩陣列（原有邏輯不變）
   * ---------------------------------------------------------------- */
  UiTable.prototype._setupMaskChain = function (masks) {
    if (!masks.length) return;

    function unlockAt(idx) {
      if (idx >= masks.length) return;
      var m = masks[idx];

      m.classList.remove('locked');
      m.classList.add('unlockable');
      var lk = m.querySelector('.uit-mlock');
      if (lk) lk.remove();

      m.addEventListener('click', function handler() {
        if (!m.classList.contains('unlockable')) return;
        m.classList.add('revealed');
        unlockAt(idx + 1);
        m.removeEventListener('click', handler);
      });
    }

    unlockAt(0);
  };

  /* ----------------------------------------------------------------
   * _renderCol：渲染單欄
   *
   * 更新（v1.4.0）：
   *   遮罩新增兩種模式：
   *   ① mask-text-2（雙層）：第一次點擊顯示第二層文字，第二次才揭開
   *   ② mask-invert（反色）：深底色 + 主題色文字（對比一般的彩色底 + 深文字）
   *
   *   優先權：mask-order > mask-text-2 > 單層（原有邏輯）
   *   mask-invert 與其他三種皆可搭配（套在背景色邏輯上）。
   * ---------------------------------------------------------------- */
  UiTable.prototype._renderCol = function (colEl, pad, rowStyle, globalMoCount) {
    var self = this;
    var div  = mk('div', 'uit-col');
    div.style.padding = pad;

    /* span 跨欄 */
    var spanVal = colEl.getAttribute('span');
    if (spanVal) {
      if (spanVal === 'all') {
        div.style.gridColumn = '1 / -1';
      } else {
        var spanN = parseInt(spanVal);
        if (!isNaN(spanN) && spanN > 1) {
          div.style.gridColumn = 'span ' + spanN;
        }
      }
    }

    /* 欄寬 & 固定欄 */
    var w = colEl.getAttribute('width');
    if (w) div.style.width = w;
    var fx = colEl.getAttribute('fixed');
    if (fx === 'left')  { div.classList.add('fix-l'); div.style.background = BG; }
    if (fx === 'right') { div.classList.add('fix-r'); div.style.background = BG; }

    /* 功能旗標 */
    var hasMask  = colEl.hasAttribute('mask-text');
    var hasCar   = colEl.hasAttribute('carousel-interval');
    var hasExp   = colEl.hasAttribute('expandable');
    var hasAlert = colEl.hasAttribute('alert-msg');
    var hasSN    = colEl.hasAttribute('show-next');
    var hasMO    = colEl.hasAttribute('mask-order');

    /* 互斥警告 */
    if (hasMask  && hasExp)  console.warn('[ui-table] mask-text+expandable 互斥，expandable 已忽略。');
    if (hasMask  && hasCar)  console.warn('[ui-table] mask-text+carousel-interval 互斥，carousel-interval 已忽略。');
    if (hasAlert && hasCar)  console.warn('[ui-table] alert-msg+carousel-interval 互斥，carousel-interval 已忽略。');

    var useCar = hasCar && !hasMask && !hasAlert;
    var useExp = hasExp && !hasMask;

    if (hasSN) div.classList.add('has-sn');

    /* 內容區 */
    var ci = mk('div', 'uit-ci');
    ci.style.color = this.color;

    var ico = colEl.getAttribute('icon');
    if (ico) ci.insertAdjacentHTML('beforeend', mkIco(ico));

    if (useCar) {
      div.appendChild(ci);
      var items  = Array.from(colEl.querySelectorAll('cell-item'));
      var ms     = parseInt(colEl.getAttribute('carousel-interval')) || 3000;
      var hasPb  = colEl.hasAttribute('progress-bar');
      var pbClr  = resolveColor(colEl.getAttribute('progress-bar-color')) || this.color;
      this._setupCarousel(ci, div, items, ms, hasPb, pbClr);
    } else {
      var clone = colEl.cloneNode(true);
      clone.querySelectorAll('cell-item').forEach(function (c) { c.remove(); });
      var ct = mk('div', 'uit-ct');
      ct.innerHTML = clone.innerHTML.trim();
      if (rowStyle) {
        if (rowStyle.fontSize)   ct.style.fontSize   = rowStyle.fontSize;
        if (rowStyle.lineHeight) ct.style.lineHeight  = rowStyle.lineHeight;
        if (rowStyle.textIndent) ct.style.textIndent  = rowStyle.textIndent;
      }
      ci.appendChild(ct);

      if (useExp) {
        div.classList.add('is-exp');
        var tog = mk('span', 'uit-etog');
        tog.innerHTML = ICO['i-expand'] || '▾';
        ci.appendChild(tog);

        ;[ct, tog].forEach(function (t) {
          t.addEventListener('click', function (e) {
            e.stopPropagation();
            var exp = div.classList.toggle('expanded');
            tog.innerHTML = exp ? (ICO['i-collapse'] || '▴') : (ICO['i-expand'] || '▾');
          });
        });
      }

      div.appendChild(ci);
    }

    /* ── 遮罩層 ── */
    if (hasMask) {
      var maskGrad   = colEl.getAttribute('mask-gradient') || '';
      var maskText2  = colEl.getAttribute('mask-text-2')   || '';   // 雙層第二層文字
      var maskInvert = colEl.hasAttribute('mask-invert');            // 反色模式
      var mc = resolveColor(colEl.getAttribute('mask-color')) || this.color;
      var m  = mk('div', 'uit-mask');

      /* ── 背景色決策：invert > gradient > 純色 ── */
      if (maskInvert) {
        /* 反色：深底 + 主題色文字 */
        m.style.background = hexRgba(BG, 0.97);
        m.style.color      = mc;
      } else if (maskGrad) {
        /* 漸層 */
        m.style.background = MASK_GRADIENTS[maskGrad] || maskGrad;
        m.style.color      = MASK_GRAD_TEXT;
      } else {
        /* 純色 */
        m.style.background = hexRgba(mc, 0.97);
        m.style.color      = BG;
      }

      var lbl = mk('span');
      lbl.textContent = colEl.getAttribute('mask-text');
      m.appendChild(lbl);

      /* ── 點擊行為決策：mask-order > mask-text-2 > 單層 ── */
      if (hasMO) {
        /* 有序解鎖鏈（原有邏輯） */
        var moVal = parseInt(colEl.getAttribute('mask-order'));
        var isDup = !isNaN(moVal) && globalMoCount && globalMoCount[moVal] > 1;

        if (isDup) {
          console.error('[ui-table] mask-order="' + moVal + '" 重複，視為無序。');
          m.classList.add('unlockable');
          m.addEventListener('click', function () { m.classList.add('revealed'); });
        } else {
          m.classList.add('locked');
          m.dataset.maskOrder = String(isNaN(moVal) ? 0 : moVal);
          var lockIcon = mk('span', 'uit-mlock');
          lockIcon.innerHTML = ICO['i-lock'] || '🔒';
          m.appendChild(lockIcon);
        }

      } else if (maskText2) {
        /* 雙層：第一次顯示第二層文字，第二次揭開 */
        m.classList.add('unlockable');
        m._dualLayer = 1;
        m.addEventListener('click', function () {
          if (m._dualLayer === 1) {
            lbl.textContent = maskText2;
            m._dualLayer = 2;
          } else {
            m.classList.add('revealed');
          }
        });

      } else {
        /* 單層：直接揭開（原有邏輯） */
        m.classList.add('unlockable');
        m.addEventListener('click', function () { m.classList.add('revealed'); });
      }

      div.appendChild(m);
    }

    /* Alert */
    if (hasAlert) this._setupAlert(div, colEl);

    return div;
  };

  /* ----------------------------------------------------------------
   * _setupCarousel（不變）
   * ---------------------------------------------------------------- */
  UiTable.prototype._setupCarousel = function (ci, colDiv, items, ms, hasPb, pbClr) {
    if (!items.length) return;

    var wrap = mk('div', 'uit-car');

    var curEl = mk('div', 'uit-car-item');
    curEl.innerHTML = items[0].innerHTML;
    wrap.appendChild(curEl);
    ci.appendChild(wrap);

    var pbFill = null;
    if (hasPb) {
      var pb = mk('div', 'uit-pb');
      var pf = mk('div', 'uit-pf');
      pf.style.background  = pbClr;
      pf.style.animation   = 'uit-prog ' + ms + 'ms linear infinite';
      pb.appendChild(pf);
      colDiv.appendChild(pb);
      pbFill = pf;
    }

    if (items.length <= 1) return;

    var idx = 0;
    var animating = false;

    setInterval(function () {
      if (animating) return;
      animating = true;

      idx = (idx + 1) % items.length;

      var h = wrap.offsetHeight || 24;
      wrap.style.height = h + 'px';

      var nxt = mk('div', 'uit-car-item');
      nxt.innerHTML = items[idx].innerHTML;
      nxt.style.cssText = [
        'position:absolute', 'top:0', 'left:0', 'width:100%',
        'transform:translateY(100%)',
        'transition:transform .4s ease'
      ].join(';');
      wrap.appendChild(nxt);

      var old = curEl;
      old.style.cssText = [
        'position:absolute', 'top:0', 'left:0', 'width:100%',
        'transition:transform .4s ease'
      ].join(';');

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          old.style.transform = 'translateY(-100%)';
          nxt.style.transform = 'translateY(0)';
        });
      });

      setTimeout(function () {
        old.remove();
        nxt.style.cssText = '';
        curEl = nxt;
        wrap.style.height = '';
        animating = false;

        if (pbFill) {
          pbFill.style.animation = 'none';
          void pbFill.offsetHeight;
          pbFill.style.animation = 'uit-prog ' + ms + 'ms linear infinite';
        }
      }, 440);
    }, ms);
  };

  /* ----------------------------------------------------------------
   * _setupAlert（不變）
   * ---------------------------------------------------------------- */
  UiTable.prototype._setupAlert = function (colDiv, colEl) {
    var msg      = colEl.getAttribute('alert-msg') || '';
    var clr      = resolveColor(colEl.getAttribute('alert-color')) || this.color;
    var interval = parseInt(colEl.getAttribute('alert-interval'));
    var pos      = (colEl.getAttribute('alert-pos') || 'C').toUpperCase();

    if (!interval || !pos || !msg) {
      console.error('[ui-table] alert-msg 需要同時設定 alert-interval 與 alert-pos，已略過。');
      return;
    }

    var content = (this.srcMap[msg] !== undefined) ? this.srcMap[msg] : msg;
    var dur     = CFG.alertDuration;
    var bgStyle = 'background:' + hexRgba(clr, 0.92) + ';color:' + BG + ';';

    if (pos === 'A') {
      var al = mk('div', 'uit-alert-A');
      al.style.cssText = bgStyle;
      al.style.fontSize = CFG.fontSize;
      al.innerHTML = content;
      colDiv.style.position = 'relative';
      colDiv.appendChild(al);

      timedTrigger(
        function () { al.classList.add('vis'); },
        function () { al.classList.remove('vis'); },
        interval, dur
      );
    } else {
      var ext = mk('div', 'uit-alert-ext');
      ext.style.cssText = bgStyle + 'font-size:' + CFG.fontSize + ';';
      ext.innerHTML = content;
      document.body.appendChild(ext);

      timedTrigger(
        function () {
          var r = colDiv.getBoundingClientRect();
          if (pos === 'B') {
            ext.style.left = r.left + 'px';
            ext.style.top  = (r.top - (ext.offsetHeight || 34) - 6) + 'px';
          } else {
            ext.style.left = (r.right + 8) + 'px';
            ext.style.top  = (r.top + r.height / 2 - (ext.offsetHeight || 18) / 2) + 'px';
          }
          ext.classList.add('vis');
        },
        function () { ext.classList.remove('vis'); },
        interval, dur
      );
    }
  };

  /* ----------------------------------------------------------------
   * _bindSN（不變）
   * ---------------------------------------------------------------- */
  UiTable.prototype._bindSN = function (rds) {
    rds.forEach(function (rd, i) {
      var snCols = rd.el.querySelectorAll('.has-sn');
      if (!snCols.length) return;

      var nxt = rds[i + 1];
      if (!nxt) {
        console.warn('[ui-table] show-next 找不到下一列，已略過。');
        return;
      }

      snCols.forEach(function (c) {
        c.addEventListener('click', function () {
          nxt.el.classList.toggle('uit-hidden');
        });
      });
    });
  };

  /* ----------------------------------------------------------------
   * boot & 暴露
   * ---------------------------------------------------------------- */
  function boot() {
    document.querySelectorAll('ui-table').forEach(function (el) {
      if (!el._uit) {
        el._uit = true;
        new UiTable(el).init();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.UiTable = { init: boot, config: CFG, colors: BRAND };

})(window);
