(function (global) {
  'use strict';

  var BRAND = {
    shell:    '#C6C7BD',
    lavender: '#C3A5E5',
    special:  '#B3DE73',
    warning:  '#E6374B',
    salmon:   '#E5C3B3',
    sky:      '#82C8E5',
    ocean:    '#1CCAE8',
    safe:     '#27AE60',
    vanilla:  '#DBEDD8',
    yellow:   '#E3D322',
    info:     '#2351DB',
    indigo:   '#7849C9',
    pink:     '#FF91D7',
    focus:    '#D4FFFC',
    orange:   '#EDA109',
    teal:     '#0DA591'
  };

  var BG = '#0C0D0C';

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
    ].join(''),
    'i-grip': [
      '<svg width="0.65em" height="1em" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">',
      '<circle cx="2.5" cy="3" r="1.4"/><circle cx="7.5" cy="3" r="1.4"/>',
      '<circle cx="2.5" cy="8" r="1.4"/><circle cx="7.5" cy="8" r="1.4"/>',
      '<circle cx="2.5" cy="13" r="1.4"/><circle cx="7.5" cy="13" r="1.4"/>',
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
    a = Math.max(+a || 0, 0.78);
    var h = hex.replace('#', '');
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  /* inverse 用的實色底：hex 轉成不透明度 0.97 的 rgba，其他格式（rgb 等）原樣使用 */
  function solidBg(c) {
    if (/^#/.test(c)) {
      var h = c.replace('#', '');
      if (h.length === 3) {
        c = '#' + h.split('').map(function (x) { return x + x; }).join('');
      }
      return hexRgba(c, 0.97);
    }
    return c;
  }

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

  /* 圓圈編號：1 到 9 用 Bootstrap Icons，10 以上用同尺寸的 SVG 圓圈 */
  function mkNum(n, fill) {
    if (n >= 0 && n <= 9) {
      return '<span class="uit-ico"><i class="bi bi-' + n + '-circle' +
        (fill ? '-fill' : '') + '" aria-hidden="true"></i></span>';
    }
    return '<span class="uit-ico"><svg width="1em" height="1em" viewBox="0 0 16 16" aria-hidden="true">' +
      '<circle cx="8" cy="8" r="7.2" stroke="currentColor" stroke-width="1.2" fill="' +
      (fill ? 'currentColor' : 'none') + '"/>' +
      '<text x="8" y="8" text-anchor="middle" dominant-baseline="central" font-size="8" font-weight="600" fill="' +
      (fill ? BG : 'currentColor') + '">' + n + '</text></svg></span>';
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

  var CSS = [

    'ui-table,ui-group,ui-row,ui-row-enhance,ui-col,cell-item{display:none}',
    '.uit-wrap{width:100%;box-sizing:border-box;position:relative;font-size:var(--uit-fs,1rem);line-height:1.5}',
    '.uit-scroll{overflow-x:auto;width:100%}',
    '.uit-group{margin-bottom:16px;overflow:hidden;border:1px solid var(--uit-tm20)}',

    /* Group header */
    '.uit-gh{display:flex;align-items:center;padding:10px 16px;cursor:pointer;user-select:none;gap:8px;background:var(--uit-tm15)}',
    '.uit-gtl{font-weight:700;color:#0C0D0C;flex:1;font-size:var(--uit-fs)}',
    '.uit-gtr{font-size:calc(var(--uit-fs)*0.85);color:#0C0D0C;opacity:.85}',
    '.uit-gtog{display:inline-flex;align-items:center;color:#0C0D0C;transition:transform .28s ease;flex-shrink:0}',
    '.uit-group.collapsed .uit-gtog{transform:rotate(-90deg)}',

    /* Group body */
    '.uit-gb{overflow:hidden;max-height:9999px;transition:max-height .35s ease,opacity .28s ease;opacity:1}',
    '.uit-gb.collapsed{max-height:0!important;opacity:0}',

    '.uit-row{display:grid;position:relative;box-sizing:border-box}',
    '.uit-row.uit-hidden{display:none!important}',

    '.uit-col{position:relative;box-sizing:border-box;overflow:hidden;word-break:break-word;min-width:0;' +
      'display:flex;flex-direction:column;' +
      'justify-content:var(--uit-valign,flex-start);' +
      'min-height:var(--uit-minh,0)}',

    '.uit-col:hover{background:var(--uit-hover,transparent)}',

    '.uit-ci{display:flex;align-items:flex-start;gap:6px;min-width:0;justify-content:var(--uit-halign,flex-start)}',
    '.uit-ico{display:inline-flex;align-items:center;flex-shrink:0;margin-top:.1em}',

    '.uit-ct{flex:1;min-width:0;font-size:var(--uit-fs);text-align:var(--uit-txtalign,left)}',

    '.uit-col.is-exp .uit-ct{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;cursor:pointer}',
    '.uit-col.is-exp.expanded .uit-ct{display:block;overflow:visible}',
    '.uit-etog{cursor:pointer;flex-shrink:0;display:inline-flex;align-items:center;opacity:.82;color:var(--uit-tm);margin-top:.15em;transition:opacity .2s}',
    '.uit-etog:hover{opacity:1}',
    '.uit-col.is-inv .uit-etog{color:#0C0D0C}',

    /* extra-info 圖示與 popover（popover 掛在 body，不受儲存格 overflow 裁切） */
    '.uit-xi{cursor:pointer;flex-shrink:0;display:inline-flex;align-items:center;height:1.5em;padding:0 3px;color:var(--uit-tm);opacity:.82;transition:opacity .2s;user-select:none}',
    '.uit-xi:hover,.uit-xi.open{opacity:1}',
    '.uit-col.is-inv .uit-xi{color:#0C0D0C}',
    '.uit-pop{position:fixed;z-index:9990;display:none;box-sizing:border-box;max-width:min(480px,calc(100vw - 16px));max-height:60vh;overflow:auto;padding:12px 16px;line-height:1.5;word-break:break-word;border:1px solid #C6C7BD;box-shadow:0 6px 20px #000}',
    '.uit-pop.vis{display:block}',
    '.uit-pop a{color:inherit;text-decoration:underline}',
    '.uit-pop p,.uit-pop ul,.uit-pop ol{margin:0 0 8px}',
    '.uit-pop ul,.uit-pop ol{padding-left:24px}',
    '.uit-pop>:last-child{margin-bottom:0}',

    /* show-next */
    '.uit-col.has-sn{cursor:pointer;transition:opacity .2s}',
    '.uit-col.has-sn:hover{opacity:.82}',
    '.uit-col.uit-cell-off{visibility:hidden}',
    '.uit-sn-ico{display:inline-flex;align-items:center;flex-shrink:0;margin-left:auto;transition:transform .25s ease}',
    '.uit-col.sn-open .uit-sn-ico{transform:rotate(180deg)}',

    /* 遮罩 */
    '.uit-mask{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:10;gap:8px;font-weight:600;transition:opacity .3s ease;font-size:var(--uit-fs);border-radius:inherit}',
    '.uit-mask.unlockable{cursor:pointer}',
    '.uit-mask.unlockable:hover{filter:brightness(1.1)}',
    '.uit-mask.locked{cursor:not-allowed;filter:brightness(0.76)}',
    '.uit-mask.revealed{opacity:0;pointer-events:none}',
    '.uit-mlock{display:inline-flex;align-items:center}',

    '.uit-car{position:relative;overflow:hidden;flex:1;font-size:var(--uit-fs)}',
    '.uit-car-item{width:100%;box-sizing:border-box}',

    '.uit-pb{height:3px;background:#3A3B38;overflow:hidden;margin-top:6px;flex-shrink:0}',
    '.uit-pf{height:100%;transform-origin:left center}',
    '@keyframes uit-prog{from{transform:scaleX(1)}to{transform:scaleX(0)}}',

    '.uit-alert-A{z-index:11;position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:6px 12px;white-space:normal;text-align:center;opacity:0;transition:opacity .35s ease;pointer-events:none;font-weight:600;font-size:var(--uit-fs)}',
    '.uit-alert-A.vis{opacity:1}',
    '.uit-alert-ext{position:fixed;z-index:9999;pointer-events:none;padding:5px 14px;font-weight:600;line-height:1.5;white-space:nowrap;opacity:0;transition:opacity .35s ease;font-size:var(--uit-fs,1rem)}',
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

  /* ---------- extra-info popover（全頁只有一個實例） ---------- */
  var _pop = null;      /* { el: popover 元素, anchor: 目前的圖示 } */
  var _popEl = null;
  var _popRaf = 0;
  var _popBound = false;

  function popEl() {
    if (_popEl) return _popEl;
    _popEl = mk('div', 'uit-pop');
    _popEl.style.background = hexRgba(BG, 0.97);
    document.body.appendChild(_popEl);
    if (!_popBound) {
      _popBound = true;
      /* 捕獲階段：先於儲存格自己的 click 處理，點到 popover 與目前圖示以外的任何地方就關閉 */
      document.addEventListener('click', function (e) {
        if (!_pop) return;
        if (_pop.el.contains(e.target) || _pop.anchor.contains(e.target)) return;
        closePop();
      }, true);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closePop();
      });
      window.addEventListener('scroll', function (e) {
        if (_pop && _pop.el.contains(e.target)) return;   /* popover 自己內部捲動不重新定位 */
        schedulePlace();
      }, true);
      window.addEventListener('resize', schedulePlace);
    }
    return _popEl;
  }

  function closePop() {
    if (!_pop) return;
    _pop.el.classList.remove('vis');
    _pop.anchor.classList.remove('open');
    _pop = null;
  }

  function schedulePlace() {
    if (!_pop || _popRaf) return;
    _popRaf = requestAnimationFrame(function () { _popRaf = 0; placePop(); });
  }

  function placePop() {
    if (!_pop) return;
    var el = _pop.el;
    var r  = _pop.anchor.getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;
    /* 圖示被隱藏（display:none）或已捲出視窗時關閉 */
    if ((!r.width && !r.height) || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) {
      closePop();
      return;
    }
    var M = 8, GAP = 6;
    el.style.width = '';
    el.style.maxHeight = '';
    el.style.left = '0px';
    el.style.top  = '0px';
    var ow = el.offsetWidth;
    var oh = el.offsetHeight;
    el.style.width = ow + 'px';   /* 固定寬度，移動位置時不會重新換行 */

    /* 水平：對齊圖示右緣往左展開，並夾在視窗內 */
    var left = Math.max(M, Math.min(r.right - ow, vw - ow - M));

    /* 垂直：優先放下方，不夠就放上方，兩邊都不夠時選較大的一側並限制高度 */
    var below = vh - r.bottom - GAP - M;
    var above = r.top - GAP - M;
    var top;
    if (oh <= below) {
      top = r.bottom + GAP;
    } else if (oh <= above) {
      top = r.top - GAP - oh;
    } else if (below >= above) {
      el.style.maxHeight = Math.max(below, 80) + 'px';
      top = r.bottom + GAP;
    } else {
      el.style.maxHeight = Math.max(above, 80) + 'px';
      top = r.top - GAP - el.offsetHeight;
    }
    el.style.left = left + 'px';
    el.style.top  = Math.max(M, top) + 'px';
  }

  function openPop(anchor, id, color, fs) {
    if (_pop && _pop.anchor === anchor) { closePop(); return; }
    closePop();
    var src = document.getElementById(id);
    if (!src) {
      console.error('[ui-table] extra-info 找不到 id="' + id + '" 的元素。');
      return;
    }
    src.style.display = 'none';
    var el = popEl();
    el.innerHTML = src.innerHTML;          /* 點擊當下才讀取，所以內容之後有變動也會顯示最新的 */
    el.style.borderColor = color;
    el.style.color       = color;
    el.style.fontSize    = fs;
    el.classList.add('vis');
    anchor.classList.add('open');
    _pop = { el: el, anchor: anchor };
    placePop();
  }

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

  UiTable.prototype._fromJSON = function (data) {
    var self = this;

    if (data.fontSize)           this.el.setAttribute('font-size',           data.fontSize);
    if (data.fontColor)          this.el.setAttribute('font-color',          data.fontColor);
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
        var r = mk(rd.enhance ? 'ui-row-enhance' : 'ui-row');
        if (rd.hidden)      r.setAttribute('hidden',       '');
        if (rd.cellPadding) r.setAttribute('cell-padding', rd.cellPadding);
        if (rd.border)      r.setAttribute('border',       rd.border);
        if (rd.colWidths)   r.setAttribute('col-widths',   rd.colWidths);
        if (rd.colBorder)   r.setAttribute('col-border',   rd.colBorder);
        if (rd.fontSize)    r.setAttribute('font-size',    rd.fontSize);
        if (rd.fontColor)   r.setAttribute('font-color',   rd.fontColor);
        if (rd.autoNumber)  r.setAttribute('auto-number',  rd.autoNumber === true ? '' : rd.autoNumber);
        if (rd.lineHeight)  r.setAttribute('line-height',  rd.lineHeight);
        if (rd.textIndent)  r.setAttribute('text-indent',  rd.textIndent);

        (rd.cols || []).forEach(function (cd) {
          var c = mk('ui-col');
          if (cd.icon)              c.setAttribute('icon',              cd.icon);
          if (cd.fontColor)         c.setAttribute('font-color',        cd.fontColor);
          if (cd.span)              c.setAttribute('span',              String(cd.span));
          if (cd.width)             c.setAttribute('width',             cd.width);
          if (cd.fixed)             c.setAttribute('fixed',             cd.fixed);
          if (cd.showNext)          c.setAttribute('show-next',         'true');
          if (cd.expandable)        c.setAttribute('expandable',        '');
          if (cd.maskText)          c.setAttribute('mask-text',         cd.maskText);
          if (cd.maskText2)         c.setAttribute('mask-text-2',       cd.maskText2);
          if (cd.inverse)           c.setAttribute('inverse',           '');
          if (cd.extraInfo)         c.setAttribute('extra-info',        cd.extraInfo);
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

  UiTable.prototype._render = function () {
    this.colN = this._getColCount();
    /* 整表文字顏色：font-color（優先於 theme 的文字色，邊框與標題列仍用 theme） */
    this.fontColor = resolveColor(this.el.getAttribute('font-color'));

    var wrap = mk('div', 'uit-wrap');
    this.wrap = wrap;

    var c  = this.color;
    var fs = this.el.getAttribute('font-size') || CFG.fontSize;
    var caRaw = this.el.getAttribute('cell-alignment')    || CFG.cellAlignment;
    var vaRaw = this.el.getAttribute('vertical-alignment') || CFG.verticalAlignment;
    var ha    = alignH(caRaw);
    var va    = alignV(vaRaw);
    var ta    = alignTxt(caRaw);
    var hoverRaw = this.el.getAttribute('hover-bg-color') || CFG.hoverBgColor;
    var hoverC   = resolveColor(hoverRaw);
    var minh = this.el.getAttribute('cell-min-height') || CFG.cellMinHeight;

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
    gtl.style.color = BG;

    var gtr = mk('span', 'uit-gtr');
    gtr.textContent = tr;
    gtr.style.color = BG;

    var gtog = mk('span', 'uit-gtog');
    gtog.innerHTML = ICO['i-arrow-down'] || '▾';
    gtog.style.color = BG;

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

  UiTable.prototype._renderRows = function (rowEls, container) {
    var self = this;
    var rds  = [];

    var globalMoCount = {};
    rowEls.forEach(function (r) {
      qsa(':scope > ui-col', r)
        .filter(function (c) { return !isSrcCol(c); })
        .forEach(function (c) {
          var mo = parseInt(c.getAttribute('mask-order'));
          if (!isNaN(mo)) globalMoCount[mo] = (globalMoCount[mo] || 0) + 1;
        });
    });

    rowEls.forEach(function (r) {
      var useLocalN = r.tagName.toLowerCase() === 'ui-row-enhance';
      var d = self._renderRow(r, globalMoCount, useLocalN);
      if (d) {
        rds.push({ el: d, src: r });
        container.appendChild(d);
      }
    });

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

  UiTable.prototype._renderRow = function (rowEl, globalMoCount, useLocalN) {
    var self = this;

    var active = qsa(':scope > ui-col', rowEl).filter(function (c) {
      return !isSrcCol(c);
    });
    if (!active.length) return null;

    var hasSpan = active.some(function (c) { return c.hasAttribute('span'); });
    var colN = useLocalN ? active.length : this.colN;
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

    var bdr = rowEl.getAttribute('border') || this._rowBorder;
    if (bdr) div.style.border = bdr + ' ' + this.color;

    var pad = rowEl.getAttribute('cell-padding') || CFG.cellPadding;

    var rowStyle = {
      fontSize:   rowEl.getAttribute('font-size'),
      fontColor:  resolveColor(rowEl.getAttribute('font-color')),
      autoNumber: rowEl.hasAttribute('auto-number') ? (rowEl.getAttribute('auto-number') || 'outline') : null,
      lineHeight: rowEl.getAttribute('line-height'),
      textIndent: rowEl.getAttribute('text-indent'),
      colBorder:  hasSpan ? null : rowEl.getAttribute('col-border')
    };

    var colTotal = active.length;
    active.forEach(function (colEl, idx) {
      var cd = self._renderCol(colEl, pad, rowStyle, globalMoCount, idx + 1);
      div.appendChild(cd);

      if (rowStyle.colBorder && idx < colTotal - 1) {
        cd.style.borderRight = rowStyle.colBorder + ' ' + self.color;
      }
    });

    return div;
  };

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

  UiTable.prototype._renderCol = function (colEl, pad, rowStyle, globalMoCount, numIdx) {
    var self = this;
    var div  = mk('div', 'uit-col');
    div.style.padding = pad;

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

    var w = colEl.getAttribute('width');
    if (w) div.style.width = w;
    var fx = colEl.getAttribute('fixed');
    if (fx === 'left')  { div.classList.add('fix-l'); div.style.background = BG; }
    if (fx === 'right') { div.classList.add('fix-r'); div.style.background = BG; }

    var hasMask  = colEl.hasAttribute('mask-text');
    var hasCar   = colEl.hasAttribute('carousel-interval');
    var hasExp   = colEl.hasAttribute('expandable');
    var hasAlert = colEl.hasAttribute('alert-msg');
    var hasSN    = colEl.hasAttribute('show-next');
    var hasMO    = colEl.hasAttribute('mask-order');
    var hasInv   = colEl.hasAttribute('inverse');
    var xid      = (colEl.getAttribute('extra-info') || '').trim();
    var hasExtra = colEl.hasAttribute('extra-info');

    if (hasMask  && hasExp)  console.warn('[ui-table] mask-text+expandable 互斥，expandable 已忽略。');
    if (hasMask  && hasCar)  console.warn('[ui-table] mask-text+carousel-interval 互斥，carousel-interval 已忽略。');
    if (hasAlert && hasCar)  console.warn('[ui-table] alert-msg+carousel-interval 互斥，carousel-interval 已忽略。');
    if (hasExtra && !xid)    console.error('[ui-table] extra-info 需要填入 div 的 id，已忽略。');
    if (hasExtra && hasMask) console.warn('[ui-table] mask-text+extra-info 互斥，extra-info 已忽略。');
    if (hasExtra && hasCar)  console.warn('[ui-table] carousel-interval+extra-info 互斥，extra-info 已忽略。');

    var useCar = hasCar && !hasMask && !hasAlert;
    var useExp = hasExp && !hasMask;
    var useExtra = hasExtra && !!xid && !hasMask && !hasCar;

    if (hasSN) {
      div.classList.add('has-sn');
      div.dataset.snMode = (colEl.getAttribute('show-next') || '').toLowerCase();
    }

    var ci = mk('div', 'uit-ci');
    /* 優先順序：ui-col > ui-row > ui-table 的 font-color > theme */
    var cellFc = resolveColor(colEl.getAttribute('font-color')) ||
                 (rowStyle && rowStyle.fontColor) ||
                 this.fontColor ||
                 this.color;
    if (hasInv) {
      /* inverse：底色 = 原文字色，文字與圖示 = #0C0D0C；放在 fixed 之後，所以優先於 fixed 的底色 */
      div.classList.add('is-inv');
      div.style.background = solidBg(cellFc);
      ci.style.color = BG;
    } else {
      ci.style.color = cellFc;
    }

    var ico = colEl.getAttribute('icon');
    if (ico) {
      ci.insertAdjacentHTML('beforeend', mkIco(ico));
    } else if (rowStyle && rowStyle.autoNumber && numIdx) {
      /* auto-number：同列由 1 起算；自訂 icon 的儲存格以 icon 為準，但仍佔用該位置的編號 */
      ci.insertAdjacentHTML('beforeend', mkNum(numIdx, rowStyle.autoNumber === 'fill'));
    }

    if (useCar) {
      div.appendChild(ci);
      var items  = Array.from(colEl.querySelectorAll('cell-item'));
      var ms     = parseInt(colEl.getAttribute('carousel-interval')) || 3000;
      var hasPb  = colEl.hasAttribute('progress-bar');
      var pbClr  = resolveColor(colEl.getAttribute('progress-bar-color')) || (hasInv ? BG : this.color);
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

      if (useExtra) {
        var xi = mk('span', 'uit-xi');
        xi.innerHTML = ICO['i-grip'];
        if (rowStyle && rowStyle.fontSize) xi.style.fontSize = rowStyle.fontSize;
        xi.addEventListener('click', function (e) {
          e.stopPropagation();   /* 避免同時觸發 show-next 或展開 */
          openPop(xi, xid, self.color, self.el.getAttribute('font-size') || CFG.fontSize);
        });
        ci.appendChild(xi);
        /* 載入時自動隱藏來源區塊 */
        var xs = document.getElementById(xid);
        if (xs) xs.style.display = 'none';
        else console.warn('[ui-table] extra-info 找不到 id="' + xid + '" 的元素，點擊時會再試一次。');
      }

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

      if (hasSN) {
        var sn = mk('span', 'uit-sn-ico');
        sn.innerHTML = '<i class="bi bi-chevron-down" aria-hidden="true"></i>';
        ci.appendChild(sn);
      }

      div.appendChild(ci);
    }

    if (hasMask) {
      var maskGrad   = colEl.getAttribute('mask-gradient') || '';
      var maskText2  = colEl.getAttribute('mask-text-2')   || '';   // 雙層第二層文字
      var maskInvert = colEl.hasAttribute('mask-invert');            // 反色模式
      var mcAttr = resolveColor(colEl.getAttribute('mask-color'));
      var mc = mcAttr || this.color;
      var m  = mk('div', 'uit-mask');

      if (maskInvert) {
        m.style.background = hexRgba(BG, 0.97);
        m.style.color      = mcAttr || cellFc;   /* 反色遮罩的文字：mask-color > font-color > theme */
      } else if (maskGrad) {
        m.style.background = MASK_GRADIENTS[maskGrad] || maskGrad;
        m.style.color      = MASK_GRAD_TEXT;
      } else {
        m.style.background = hexRgba(mc, 0.97);
        m.style.color      = BG;
      }

      var lbl = mk('span');
      lbl.textContent = colEl.getAttribute('mask-text');
      m.appendChild(lbl);

      if (hasMO) {
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
        m.classList.add('unlockable');
        m.addEventListener('click', function () { m.classList.add('revealed'); });
      }

      div.appendChild(m);
    }

    if (hasAlert) this._setupAlert(div, colEl);

    return div;
  };

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
          if (!r.width && !r.height) return;   /* 儲存格被隱藏或摺疊時不顯示，避免跑到左上角 */
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

  UiTable.prototype._bindSN = function (rds) {
    rds.forEach(function (rd, i) {
      var cells = Array.from(rd.el.children);
      var snCols = cells.filter(function (c) { return c.classList.contains('has-sn'); });
      if (!snCols.length) return;

      var nxt = rds[i + 1];
      if (!nxt) {
        console.warn('[ui-table] show-next 找不到下一列，已略過。');
        return;
      }

      /* 模式：show-next="col" 各欄各自展開；"row" 整列展開；
         其他值（true）時，同列有兩個以上 show-next 就各欄各自展開，只有一個則整列展開 */
      function modeOf(c) {
        var m = c.dataset.snMode;
        if (m === 'col' || m === 'row') return m;
        return snCols.length > 1 ? 'col' : 'row';
      }
      var rowCols = snCols.filter(function (c) { return modeOf(c) === 'row'; });
      var colCols = snCols.filter(function (c) { return modeOf(c) === 'col'; });
      var nxtCells = Array.from(nxt.el.children);

      /* 整列模式 */
      rowCols.forEach(function (c) {
        c.classList.toggle('sn-open', !nxt.el.classList.contains('uit-hidden'));
        c.addEventListener('click', function () {
          var open = !nxt.el.classList.toggle('uit-hidden');
          rowCols.forEach(function (x) { x.classList.toggle('sn-open', open); });
        });
      });

      /* 各欄模式：下一列同位置的儲存格各自展開；沒有 show-next 的欄保持空白 */
      if (colCols.length) {
        nxtCells.forEach(function (nc) { nc.classList.add('uit-cell-off'); });

        function syncRow() {
          var any = nxtCells.some(function (nc) { return !nc.classList.contains('uit-cell-off'); });
          nxt.el.classList.toggle('uit-hidden', !any);
        }
        syncRow();

        colCols.forEach(function (c) {
          var target = nxtCells[cells.indexOf(c)];
          if (!target) {
            console.warn('[ui-table] show-next 在下一列找不到對應欄位，已略過。');
            return;
          }
          c.addEventListener('click', function () {
            var off = target.classList.toggle('uit-cell-off');
            c.classList.toggle('sn-open', !off);
            syncRow();
          });
        });
      }
    });
  };

  function boot() {
    document.querySelectorAll('ui-table').forEach(function (el) {
      if (el._uit) return;
      el._uit = true;
      try {
        new UiTable(el).init();
      } catch (err) {
        /* 單一表格初始化失敗時，不影響其他表格，也不影響全域物件的匯出 */
        console.error('[ui-table] 初始化失敗：', err);
      }
    });
  }

  /* 先匯出全域物件，再啟動自動初始化，避免初始化過程出錯時 UiTable 變成未定義 */
  global.UiTable = { init: boot, config: CFG, colors: BRAND };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window);
