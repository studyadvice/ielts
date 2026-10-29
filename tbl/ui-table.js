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
    autoRevealInterval: 0,
    cellAlignment:      'left',
    verticalAlignment:  'top',
    hoverBgColor:       '',
    cellMinHeight:      '',
    rowBorder:          '',
    arrowSize:          '1.5rem',
    arrowColor:         'focus',
    arrowPos:           'center',
    extraInfoSize:      '',      /* extra-info 握把圖示高度，空字串 = 跟隨文字（1em） */
    extraInfoColor:     '',      /* extra-info 握把圖示色彩，空字串 = 跟隨 theme */
    treeCol:            1,       /* 樹狀展開鈕與縮排放在第幾欄（1 起算） */
    treeIndent:         '20px',  /* 每一層的縮排寬度，也是展開鈕的寬度 */
    treeIcon:           'chevron', /* chevron / caret / plus */
    treeLineColor:      '#3A3B38', /* 導引線色彩（tree-line 開啟時） */
    iconsListInterval:  500        /* icons-list 每個圖示之間的間隔（毫秒） */
  }, global.UiTableConfig || {});

  var SEG_GAP = 3;
  var TREE_ICO = {
    chevron: '<svg class="rot" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"' +
             ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18 15 12 9 6"/></svg>',
    caret:   '<svg class="rot" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3 11.5 8 5.5 13Z" fill="currentColor"/></svg>',
    plus:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">' +
             '<rect x="1.7" y="1.7" width="12.6" height="12.6" rx="2"/><path d="M5 8h6"/><path class="uit-tv" d="M8 5v6"/></svg>'
  };

  function isEnh(r) {
    return r.tagName.toLowerCase() === 'ui-row-enhance';
  }

  function kidRows(r) {
    return isEnh(r) ? qsa(':scope > ui-row-enhance', r) : [];
  }

  /* icons-list：逗號分隔，前後空白會去掉，空項目略過 */
  function parseIconList(raw) {
    return String(raw || '').split(',')
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }

  function mkListIco(name) {
    var sp = mk('span', 'uit-ili');
    if (/^bi-/.test(name)) sp.innerHTML = '<i class="bi ' + name + '" aria-hidden="true"></i>';
    else if (ICO[name])    sp.innerHTML = ICO[name];
    else                   sp.textContent = name;
    return sp;
  }

  /* 子列沒寫時沿用父列的版面設定，巢狀標記可以寫得比較精簡 */
  var TREE_INHERIT = ['col-widths', 'cell-padding', 'border', 'col-border'];

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

  /* 同時有 hidden 與 id 的 ui-col 不算欄位、不渲染，可以當 extra-info 的內容來源 */
  function isSrcCol(el) {
    return el.hasAttribute('hidden') && el.hasAttribute('id');
  }

  /* 箭頭尺寸：純數字視為 px，也接受 px、rem、em，其餘用後備值 */
  function normSize(v, fb) {
    v = String(v == null ? '' : v).trim();
    if (/^\d*\.?\d+$/.test(v)) return v + 'px';
    if (/^\d*\.?\d+(px|rem|em)$/.test(v)) return v;
    return fb;
  }

  /* fat：有箭尾的粗箭頭（純顯示）；tri：實心三角形（可點擊） */
  var ARROW_SHAPE = {
    fat: { ratio: 1.7, vb: '0 0 34 20', d: 'M0 6H20V0L34 10L20 20V14H0Z' },
    tri: { ratio: 0.7, vb: '0 0 14 20', d: 'M0 0L14 10L0 20Z' }
  };

  function mkArrow(kind, size, color, pos) {
    var sh = ARROW_SHAPE[kind];
    var el = mk('div', 'uit-arrow p-' + pos + (kind === 'tri' ? ' is-click' : ''));
    el.style.setProperty('--uit-asz', size);
    el.style.setProperty('--uit-ar', sh.ratio);
    el.innerHTML = '<svg viewBox="' + sh.vb + '" aria-hidden="true">' +
      '<path d="' + sh.d + '" fill="' + color + '" stroke="' + BG + '"' +
      ' stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke" paint-order="stroke"/></svg>';
    return el;
  }

  /* 進度條填色：progress-bar-color1 + progress-bar-color2 → 由左到右的漸層；
     只設其中一個時當單色使用；都沒設時用 progress-bar-color，最後才用預設色 */
  function pbPaint(colEl, fallback) {
    var c1 = resolveColor(colEl.getAttribute('progress-bar-color1'));
    var c2 = resolveColor(colEl.getAttribute('progress-bar-color2'));
    if (c1 && c2) return 'linear-gradient(to right,' + c1 + ',' + c2 + ')';
    if (c1 || c2) {
      console.warn('[ui-table] 漸層需要同時設定 progress-bar-color1 與 progress-bar-color2，已改用單色。');
      return c1 || c2;
    }
    return resolveColor(colEl.getAttribute('progress-bar-color')) || fallback;
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
    '.uit-row + .uit-row{margin-top:-1px}',

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
    '.uit-xi{cursor:pointer;flex-shrink:0;display:inline-flex;align-items:center;min-height:1.5em;padding:0 3px;color:var(--uit-tm);opacity:.82;transition:opacity .2s;user-select:none}',
    '.uit-xi:hover,.uit-xi.open{opacity:1}',
    '.uit-col.is-inv .uit-xi{color:#0C0D0C}',
    '.uit-xi svg{display:block;height:var(--uit-xsz,1em);width:calc(var(--uit-xsz,1em) * 0.65)}',
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

    /* 自動輪播進度條：用 clip-path 倒數，漸層色會固定不動，不會跟著被壓縮 */
    '.uit-pb{position:relative;height:3px;background:var(--uit-pbtrk,#3A3B38);overflow:hidden;margin-top:6px;flex-shrink:0}',
    '.uit-pf{position:absolute;inset:0}',
    '@keyframes uit-prog{from{clip-path:inset(0 0 0 0)}to{clip-path:inset(0 100% 0 0)}}',

    /* 手動輪播（carousel-interval="0"）：分段進度條貼齊儲存格下緣，上方留較大空白，點擊切換下一畫面 */
    '.uit-pb-sp{height:24px;flex-shrink:0}',
    '.uit-pb.is-man{position:absolute;left:0;right:0;bottom:0;height:auto;margin:0;padding-top:10px;background:none;overflow:visible;cursor:pointer;z-index:2}',
    '.uit-pbt{position:relative;height:7px;background:var(--uit-pbtrk,#3A3B38);overflow:hidden;transition:filter .2s ease;' +
      '-webkit-mask-image:var(--uit-pbmask);mask-image:var(--uit-pbmask)}',
    '.uit-pb.is-man:hover .uit-pbt{filter:brightness(1.3)}',
    '.uit-pb.is-man.is-busy{cursor:progress}',
    '.uit-pbt .uit-pf{transition:clip-path .35s ease}',

    /* 欄間箭頭：掛在列上，不受儲存格 overflow 裁切 */
    '.uit-arrow{position:absolute;z-index:12;display:none;line-height:0;pointer-events:none}',
    '.uit-arrow.on{display:block}',
    '.uit-arrow.p-center{top:50%;transform:translate(-50%,-50%)}',
    '.uit-arrow.p-top{top:12px;transform:translate(-50%,0)}',
    '.uit-arrow.p-bottom{bottom:12px;transform:translate(-50%,0)}',
    '.uit-arrow svg{display:block;overflow:visible;height:var(--uit-asz,1.5rem);width:calc(var(--uit-asz,1.5rem) * var(--uit-ar,1.7));transition:transform .25s ease,filter .2s ease}',
    '.uit-arrow.is-click{pointer-events:auto;cursor:pointer;padding:6px}',
    '.uit-arrow.is-click:hover svg{filter:brightness(1.12);transform:scale(1.15)}',
    '.uit-col.uit-arrow-off{visibility:hidden}',

    /* 固定欄 */
    '.uit-col.fix-l{position:sticky;left:0;z-index:5}',
    '.uit-col.fix-r{position:sticky;right:0;z-index:5}',

    /* 樹狀巢狀（僅 ui-row-enhance）：子列包在 .uit-tk 裡，用 grid-template-rows 0fr → 1fr 做到高度自動的滑順展開 */
    '.uit-tk{display:grid;grid-template-rows:0fr;transition:grid-template-rows .32s ease}',
    '.uit-tk.open{grid-template-rows:1fr}',
    '.uit-tk-in{min-height:0;overflow:hidden;overflow:clip;opacity:0;transition:opacity .28s ease}',
    '.uit-tk.open>.uit-tk-in{opacity:1}',
    '.uit-tk-in>.uit-row:first-child{margin-top:-1px}',
    '.uit-tk+.uit-row{margin-top:-1px}',
    '.uit-row.uit-hidden+.uit-tk{display:none}',

    /* 縮排、導引線與展開鈕 */
    '.uit-tree{display:inline-flex;align-items:center;flex-shrink:0;min-height:1.5em;align-self:stretch}',
    '.uit-tind{position:relative;align-self:stretch;flex-shrink:0;width:var(--uit-tind,20px)}',
    '.uit-tree.has-line .uit-tind::before{content:"";position:absolute;left:50%;top:-999px;bottom:-999px;border-left:1px solid var(--uit-tlc,#3A3B38)}',
    '.uit-tt{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:var(--uit-tind,20px);height:1.5em;cursor:pointer;user-select:none}',
    '.uit-tt svg{display:block;width:.95em;height:.95em;transition:transform .28s ease}',
    '.uit-tt.open svg.rot{transform:rotate(90deg)}',
    '.uit-tt:not(.is-leaf):hover svg{transform:scale(1.2)}',
    '.uit-tt.open:not(.is-leaf):hover svg.rot{transform:rotate(90deg) scale(1.2)}',
    '.uit-tt .uit-tv{transition:opacity .2s ease}',
    '.uit-tt.open .uit-tv{opacity:0}',
    '.uit-tt.is-leaf{cursor:default}',
    '.uit-tree.has-line .uit-tt.is-dot::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--uit-tlc,#3A3B38)}',

    /* icons-list（僅 ui-row-enhance）：播放時藏起格子內容（樹狀欄的展開鈕除外），圖示列疊在原位置上依序出現 */
    '.uit-ils{display:none;position:absolute;top:0;bottom:0;right:0;align-items:center;gap:6px;overflow:hidden;pointer-events:none}',
    '.uit-ci.uit-il-on>.uit-ils{display:flex}',
    '.uit-ci.uit-il-on>:not(.uit-tree):not(.uit-ils){visibility:hidden}',
    '.uit-ili{display:inline-flex;align-items:center;flex-shrink:0;line-height:1;font-size:1.25em;opacity:0;transform:translateX(-8px);transition:opacity .22s ease,transform .22s ease}',
    '.uit-ili.on{opacity:1;transform:none}',
    '.uit-ili svg{width:1em;height:1em}',
    '@keyframes uit-ilback{from{opacity:0}to{opacity:1}}',
    '.uit-ci.uit-il-back>:not(.uit-tree):not(.uit-ils){animation:uit-ilback .28s ease}'

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
    this._nodes = [];     /* 樹狀節點（有子列的 ui-row-enhance），給 expandAll / collapseAll 使用 */
    el._uitInst = this;
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
    if (data.extraInfoSize)      this.el.setAttribute('extra-info-size',      String(data.extraInfoSize));
    if (data.extraInfoColor)     this.el.setAttribute('extra-info-color',     data.extraInfoColor);
    /* 樹狀設定（表格層級） */
    if (data.treeCol)            this.el.setAttribute('tree-col',             String(data.treeCol));
    if (data.treeIndent)         this.el.setAttribute('tree-indent',          String(data.treeIndent));
    if (data.treeIcon)           this.el.setAttribute('tree-icon',            data.treeIcon);
    if (data.treeLine)           this.el.setAttribute('tree-line',            '');
    if (data.treeLineColor)      this.el.setAttribute('tree-line-color',      data.treeLineColor);
    if (data.treeAccordion)      this.el.setAttribute('tree-accordion',       '');
    if (data.treeOpen)           this.el.setAttribute('tree-open',            '');

    this.el.innerHTML = '';

    /* 建立一列；nested = true 時是巢狀子列，一律建成 ui-row-enhance */
    function buildRow(rd, nested) {
      var enh = !!(nested || rd.enhance);
      var r = mk(enh ? 'ui-row-enhance' : 'ui-row');
      if (rd.treeOpen) r.setAttribute('tree-open', '');
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
      if (rd.arrow != null)      r.setAttribute('arrow',       rd.arrow === true ? '' : rd.arrow);
      if (rd.arrowSize)          r.setAttribute('arrow-size',  rd.arrowSize);
      if (rd.arrowColor)         r.setAttribute('arrow-color', rd.arrowColor);
      if (rd.arrowPos)           r.setAttribute('arrow-pos',   rd.arrowPos);
      if (rd.arrowOpen)          r.setAttribute('arrow-open',  '');
      if (rd.extraInfoSize)      r.setAttribute('extra-info-size',  String(rd.extraInfoSize));
      if (rd.extraInfoColor)     r.setAttribute('extra-info-color', rd.extraInfoColor);

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
        if (cd.extraInfoSize)     c.setAttribute('extra-info-size',   String(cd.extraInfoSize));
        if (cd.extraInfoColor)    c.setAttribute('extra-info-color',  cd.extraInfoColor);
        if (cd.maskInvert)        c.setAttribute('mask-invert',       '');
        if (cd.maskColor)         c.setAttribute('mask-color',        cd.maskColor);
        if (cd.maskOrder != null) c.setAttribute('mask-order',        String(cd.maskOrder));
        /* 0 也是有效值（手動輪播），所以不能用 truthy 判斷 */
        if (cd.carouselInterval != null) c.setAttribute('carousel-interval', String(cd.carouselInterval));
        if (cd.progressBar)       c.setAttribute('progress-bar',      '');
        if (cd.progressBarColor)  c.setAttribute('progress-bar-color', cd.progressBarColor);
        if (cd.progressBarColor1) c.setAttribute('progress-bar-color1', cd.progressBarColor1);
        if (cd.progressBarColor2) c.setAttribute('progress-bar-color2', cd.progressBarColor2);
        if (cd.arrow != null)     c.setAttribute('arrow',             cd.arrow === true ? '' : cd.arrow);
        if (cd.arrowSize)         c.setAttribute('arrow-size',        cd.arrowSize);
        if (cd.arrowColor)        c.setAttribute('arrow-color',       cd.arrowColor);
        if (cd.arrowPos)          c.setAttribute('arrow-pos',         cd.arrowPos);
        if (cd.arrowOpen)         c.setAttribute('arrow-open',        '');
        /* iconsList 可以是陣列或逗號分隔字串 */
        if (cd.iconsList)         c.setAttribute('icons-list',        Array.isArray(cd.iconsList) ? cd.iconsList.join(', ') : String(cd.iconsList));
        if (cd.iconsListInterval) c.setAttribute('icons-list-interval', String(cd.iconsListInterval));

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

      if (rd.children && rd.children.length) {
        if (!enh) {
          console.warn('[ui-table] children（巢狀子列）僅支援 enhance 列，已忽略。');
        } else {
          rd.children.forEach(function (cd) { r.appendChild(buildRow(cd, true)); });
        }
      }
      return r;
    }

    (data.groups || []).forEach(function (gd) {
      var g = mk('ui-group');
      if (gd.titleLeft)   g.setAttribute('title-left',  gd.titleLeft);
      if (gd.titleRight)  g.setAttribute('title-right', gd.titleRight);
      if (gd.iniCollapse) g.setAttribute('ini-collapse', '');

      (gd.rows || []).forEach(function (rd) {
        g.appendChild(buildRow(rd, false));
      });
      self.el.appendChild(g);
    });
    /* 沒有 groups 時，也接受最外層直接寫 rows */
    if (!(data.groups && data.groups.length)) {
      (data.rows || []).forEach(function (rd) {
        self.el.appendChild(buildRow(rd, false));
      });
    }
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

    /* 樹狀設定：全部寫在 ui-table 上，子列只需要 tree-open */
    var te = this.el;
    var tIcon = (te.getAttribute('tree-icon') || CFG.treeIcon || 'chevron').toLowerCase();
    if (!TREE_ICO[tIcon]) {
      console.warn('[ui-table] tree-icon="' + tIcon + '" 不是有效的值（chevron / caret / plus），已改用 chevron。');
      tIcon = 'chevron';
    }
    this._tree = {
      col:       parseInt(te.getAttribute('tree-col'), 10) || parseInt(CFG.treeCol, 10) || 1,
      icon:      tIcon,
      line:      te.hasAttribute('tree-line'),
      accordion: te.hasAttribute('tree-accordion'),
      openAll:   te.hasAttribute('tree-open')
    };
    vars.push('--uit-tind:' + normSize(te.getAttribute('tree-indent'), normSize(CFG.treeIndent, '20px')));
    vars.push('--uit-tlc:'  + (resolveColor(te.getAttribute('tree-line-color')) || resolveColor(CFG.treeLineColor) || '#3A3B38'));

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
    var vCounter = { n: 0 };   /* 垂直編號的跨列累計計數器，範圍與 mask-order 相同：同一次 _renderRows 呼叫（同一 group 或無 group 時的整張表） */

    /* mask-order 的重複檢查要涵蓋所有巢狀子列 */
    var globalMoCount = {};
    (function count(list) {
      list.forEach(function (r) {
        qsa(':scope > ui-col', r)
          .filter(function (c) { return !isSrcCol(c); })
          .forEach(function (c) {
            var mo = parseInt(c.getAttribute('mask-order'));
            if (!isNaN(mo)) globalMoCount[mo] = (globalMoCount[mo] || 0) + 1;
          });
        count(kidRows(r));
      });
    })(rowEls);

    var rds = this._renderList(rowEls, container, 0, null, globalMoCount, vCounter);

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

  /* 渲染同一層的列；ui-row-enhance 裡直屬的 ui-row-enhance 會遞迴渲染成可展開的子列。
     回傳這一層的 rds（給 show-next 使用，子層在這裡自行綁定） */
  UiTable.prototype._renderList = function (rowEls, container, depth, parentEl, moCount, vCounter) {
    var self = this;
    var rds  = [];
    var level = [];   /* 這一層的樹狀節點，tree-accordion 用來互相收合 */

    /* 頂層只要有任何一列有子列，整層都加上展開鈕或佔位，文字才會對齊；子層一律加 */
    var treeOn = depth > 0 || rowEls.some(function (r) { return kidRows(r).length > 0; });

    rowEls.forEach(function (r) {
      var enh = isEnh(r);

      if (!enh && qsa(':scope > ui-row, :scope > ui-row-enhance', r).length) {
        console.warn('[ui-table] 巢狀子列只支援 ui-row-enhance，ui-row 裡面的子列已忽略。');
      }
      if (enh && qsa(':scope > ui-row', r).length) {
        console.warn('[ui-table] 巢狀子列請使用 ui-row-enhance，裡面的 ui-row 已忽略。');
      }

      if (parentEl) self._inheritRow(r, parentEl);

      var d = self._renderRow(r, moCount, enh, vCounter);
      if (!d) return;
      rds.push({ el: d, src: r });
      container.appendChild(d);
      if (!enh) return;

      var kids = kidRows(r);
      var btn  = treeOn ? self._treeCell(d, depth, kids.length > 0) : null;
      if (!kids.length) return;

      var tk  = mk('div', 'uit-tk');
      var tin = mk('div', 'uit-tk-in');
      tk.appendChild(tin);
      container.appendChild(tk);

      var childRds = self._renderList(kids, tin, depth + 1, r, moCount, vCounter);
      self._bindSN(childRds);

      var node = { depth: depth, open: false, src: r, row: d };
      /* source：'click' 使用者點擊、'api' expandAll / collapseAll、'accordion' 手風琴自動收合 */
      node.set = function (open, source) {
        open = !!open;
        if (open === node.open) return;
        node.open = open;
        tk.classList.toggle('open', open);
        if (btn) btn.classList.toggle('open', open);
        if (!open && _pop && tk.contains(_pop.anchor)) closePop();
        if (open && source === 'click' && self._tree.accordion) {
          level.forEach(function (n) { if (n !== node) n.set(false, 'accordion'); });
        }
        /* 事件發在原本的 <ui-table> 元素上，可用 addEventListener('uit-tree-toggle', ...) 監聽 */
        self.el.dispatchEvent(new CustomEvent('uit-tree-toggle', {
          detail: { open: open, depth: depth, source: source, row: r, rowEl: d }
        }));
      };

      /* 初始狀態直接套 class，不觸發事件，也不會在載入時播放展開動畫 */
      if (r.hasAttribute('tree-open') || self._tree.openAll) {
        node.open = true;
        tk.classList.add('open');
        if (btn) btn.classList.add('open');
      }

      if (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();   /* 只有展開鈕會切換，不觸發 show-next 等儲存格點擊 */
          node.set(!node.open, 'click');
        });
      }

      level.push(node);
      self._nodes.push(node);
    });

    return rds;
  };

  /* 子列沒寫的版面屬性沿用父列；col-widths 只在欄數相同時沿用 */
  UiTable.prototype._inheritRow = function (r, parentEl) {
    TREE_INHERIT.forEach(function (a) {
      if (r.hasAttribute(a) || !parentEl.hasAttribute(a)) return;
      var v = parentEl.getAttribute(a);
      if (a === 'col-widths') {
        var n = qsa(':scope > ui-col', r).filter(function (c) { return !isSrcCol(c); }).length;
        if (v.split(':').length !== n) return;
      }
      r.setAttribute(a, v);
    });
  };

  /* 在樹狀欄（tree-col）的內容前面加上縮排、導引線與展開鈕；葉節點放同寬的佔位，文字才會對齊 */
  UiTable.prototype._treeCell = function (rowDiv, depth, hasKids) {
    var cols = rowDiv.querySelectorAll(':scope > .uit-col');
    if (!cols.length) return null;
    var cell = cols[Math.min(Math.max(this._tree.col, 1), cols.length) - 1];
    var ci   = cell.querySelector(':scope > .uit-ci');
    if (!ci) return null;

    var tr = mk('span', 'uit-tree' + (this._tree.line ? ' has-line' : ''));
    for (var i = 0; i < depth; i++) tr.appendChild(mk('span', 'uit-tind'));
    /* 葉節點的小圓點只畫在子層（depth ≥ 1），最上層沒有導引線，畫了反而突兀（例如表頭列） */
    var btn = mk('span', 'uit-tt' + (hasKids ? '' : ' is-leaf' + (depth > 0 ? ' is-dot' : '')));
    if (hasKids) btn.innerHTML = TREE_ICO[this._tree.icon];
    tr.appendChild(btn);

    ci.insertBefore(tr, ci.firstChild);
    ci.style.justifyContent = 'flex-start';   /* 樹狀欄固定靠左，縮排才有意義 */
    cell.classList.add('is-tree');
    return hasKids ? btn : null;
  };

  UiTable.prototype._renderRow = function (rowEl, globalMoCount, useLocalN, vCounter) {
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

    /* auto-number 的值：
       outline / fill                → 橫向（預設）：同一列由左到右 1 起算，列與列之間各自歸零
       outline-v / fill-v / v        → 縱向：同一容器（group 或整張表）內跨列累計，
                                        同一列中沒有 icon 的欄位共用該列的序號 */
    var anRaw = rowEl.hasAttribute('auto-number')
      ? (rowEl.getAttribute('auto-number') || 'outline').toLowerCase()
      : null;
    var anVertical = !!anRaw && /(^v$|-v$)/.test(anRaw);
    var anFill     = !!anRaw && /^fill/.test(anRaw);

    var rowStyle = {
      fontSize:           rowEl.getAttribute('font-size'),
      fontColor:          resolveColor(rowEl.getAttribute('font-color')),
      autoNumber:         !!anRaw,
      autoNumberFill:     anFill,
      autoNumberVertical: anVertical,
      lineHeight:         rowEl.getAttribute('line-height'),
      textIndent:         rowEl.getAttribute('text-indent'),
      colBorder:          hasSpan ? null : rowEl.getAttribute('col-border'),
      xiSize:             rowEl.getAttribute('extra-info-size'),
      xiColor:            rowEl.getAttribute('extra-info-color'),
      enhance:            !!useLocalN    /* 這一列是否為 ui-row-enhance（icons-list 只在這種列生效） */
    };

    /* 縱向模式：這一列只領一個序號（累計計數器 +1 一次），橫向模式則維持逐欄 idx+1 */
    var vSeq = null;
    if (rowStyle.autoNumber && rowStyle.autoNumberVertical) {
      vCounter.n += 1;
      vSeq = vCounter.n;
    }

    var colTotal = active.length;
    var colDivs  = [];
    active.forEach(function (colEl, idx) {
      var numIdx = rowStyle.autoNumberVertical ? vSeq : (idx + 1);
      var cd = self._renderCol(colEl, pad, rowStyle, globalMoCount, numIdx);
      div.appendChild(cd);
      colDivs.push(cd);

      if (rowStyle.colBorder && idx < colTotal - 1) {
        cd.style.borderRight = rowStyle.colBorder + ' ' + self.color;
      }
    });

    self._setupArrows(div, rowEl, active, colDivs);

    return div;
  };

  /* 欄間箭頭：arrow 設在起點欄（或整列），箭頭壓在它與下一欄的交界線上。
     arrow / arrow="right"：純顯示的粗箭頭
     arrow="click"：實心三角形，點擊後顯示右邊儲存格的內容，再點一次收合
     arrow="none"：整列設定時，個別欄關閉
     arrow-open：搭配 click，右邊儲存格一開始就是顯示的 */
  UiTable.prototype._setupArrows = function (rowDiv, rowEl, colEls, colDivs) {
    var rowArrow = rowEl.getAttribute('arrow');
    var items = [];

    colEls.forEach(function (colEl, i) {
      var explicit = colEl.hasAttribute('arrow');
      var raw = explicit ? colEl.getAttribute('arrow') : rowArrow;
      if (raw === null) return;
      var mode = String(raw).trim().toLowerCase();
      if (mode === 'none') return;

      if (i === colEls.length - 1) {
        if (explicit) console.warn('[ui-table] 最後一欄右邊沒有下一欄，arrow 已忽略。');
        return;
      }
      var nextEl = colEls[i + 1];
      if (colEl.hasAttribute('mask-text') || nextEl.hasAttribute('mask-text')) {
        console.warn('[ui-table] arrow 與 mask-text 互斥，此處的 arrow 已忽略。');
        return;
      }
      if (mode && mode !== 'right' && mode !== 'click') {
        console.warn('[ui-table] arrow="' + raw + '" 不是有效的值，已當作純顯示箭頭。');
      }

      var isClick = mode === 'click';
      var kind = isClick ? 'tri' : 'fat';

      function pick(name) {
        return colEl.getAttribute(name) || rowEl.getAttribute(name) || '';
      }
      var size  = normSize(pick('arrow-size'), normSize(CFG.arrowSize, '1.5rem'));
      var color = resolveColor(pick('arrow-color')) || resolveColor(CFG.arrowColor) || BRAND.focus;
      var pos   = (pick('arrow-pos') || CFG.arrowPos || 'center').toLowerCase();
      if (pos === 'middle') pos = 'center';
      if (pos !== 'top' && pos !== 'bottom') pos = 'center';

      var el = mkArrow(kind, size, color, pos);
      var it = {
        el: el, left: colDivs[i], right: colDivs[i + 1], click: isClick,
        opened: colEl.hasAttribute('arrow-open') || rowEl.hasAttribute('arrow-open')
      };
      if (isClick) {
        el.addEventListener('click', function (e) {
          e.stopPropagation();
          it.opened = !it.opened;
          place();
        });
      }

      /* 替箭頭兩側的儲存格預留空間，避免箭頭壓到文字 */
      var half    = Math.max(ARROW_SHAPE[kind].ratio, 1) / 2;
      var reserve = 'calc(' + size + ' * ' + half + ' + 12px)';
      [[colDivs[i], 'paddingRight'], [colDivs[i + 1], 'paddingLeft']].forEach(function (x) {
        x[0].style[x[1]] = 'max(' + (x[0].style[x[1]] || '0px') + ', ' + reserve + ')';
      });

      rowDiv.appendChild(el);
      items.push(it);
    });

    if (!items.length) return;

    /* 依左到右的順序計算：右邊儲存格是否被箭頭藏起來，以及箭頭本身顯示與否。
       左邊儲存格看不到時，右邊一律藏起來，所以逐步揭示可以連鎖（甲 ▶ 乙 ▶ 丙）。 */
    function place() {
      items.forEach(function (it) {
        var l = it.left, r = it.right;
        var lOk = !l.classList.contains('uit-cell-off') && !l.classList.contains('uit-arrow-off');
        if (it.click) r.classList.toggle('uit-arrow-off', !(it.opened && lOk));

        var sameLine = Math.abs(l.offsetTop - r.offsetTop) < 2 && r.offsetLeft > l.offsetLeft;
        var vis = lOk && !r.classList.contains('uit-cell-off') && sameLine && rowDiv.offsetWidth > 0;
        it.el.classList.toggle('on', vis);
        if (it.click) it.el.classList.toggle('open', it.opened);
        if (vis) it.el.style.left = r.offsetLeft + 'px';
      });
    }

    place();
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(place);
      ro.observe(rowDiv);
      colDivs.forEach(function (c) { ro.observe(c); });
    }
    if (window.MutationObserver) {
      var mo = new MutationObserver(place);
      colDivs.forEach(function (c) { mo.observe(c, { attributes: true, attributeFilter: ['class'] }); });
    }
    window.addEventListener('resize', place);
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
    var hasSN    = colEl.hasAttribute('show-next');
    var hasMO    = colEl.hasAttribute('mask-order');
    var hasInv   = colEl.hasAttribute('inverse');
    var xid      = (colEl.getAttribute('extra-info') || '').trim();
    var hasExtra = colEl.hasAttribute('extra-info');

    if (hasMask  && hasExp)  console.warn('[ui-table] mask-text+expandable 互斥，expandable 已忽略。');
    if (hasMask  && hasCar)  console.warn('[ui-table] mask-text+carousel-interval 互斥，carousel-interval 已忽略。');
    if (hasExtra && !xid)    console.error('[ui-table] extra-info 需要填入 div 的 id，已忽略。');
    if (hasExtra && hasMask) console.warn('[ui-table] mask-text+extra-info 互斥，extra-info 已忽略。');
    if (hasExtra && hasCar)  console.warn('[ui-table] carousel-interval+extra-info 互斥，extra-info 已忽略。');

    var useCar = hasCar && !hasMask;
    var useExp = hasExp && !hasMask;
    var useExtra = hasExtra && !!xid && !hasMask && !hasCar;

    /* icons-list：只在 ui-row-enhance 生效；與 mask-text、carousel-interval 互斥，衝突時忽略 icons-list */
    var hasIL  = colEl.hasAttribute('icons-list');
    var ilList = hasIL ? parseIconList(colEl.getAttribute('icons-list')) : [];
    var useIL  = hasIL && ilList.length > 0;
    if (hasIL && !ilList.length) {
      console.warn('[ui-table] icons-list 沒有任何圖示名稱，已忽略。');
    }
    if (useIL && !(rowStyle && rowStyle.enhance)) {
      console.warn('[ui-table] icons-list 僅支援 ui-row-enhance，ui-row 裡的 icons-list 已忽略。');
      useIL = false;
    }
    if (useIL && hasMask) {
      console.warn('[ui-table] mask-text+icons-list 互斥，icons-list 已忽略。');
      useIL = false;
    }
    if (useIL && hasCar) {
      console.warn('[ui-table] carousel-interval+icons-list 互斥，icons-list 已忽略。');
      useIL = false;
    }

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
      /* auto-number：橫向時 numIdx 為同列由 1 起算的欄位順序；縱向時 numIdx 為該列在容器內的累計序號。
         自訂 icon 的儲存格以 icon 為準，但仍佔用該位置的編號（橫向時會跳號）。 */
      ci.insertAdjacentHTML('beforeend', mkNum(numIdx, rowStyle.autoNumberFill));
    }

    if (useCar) {
      div.appendChild(ci);
      var items  = Array.from(colEl.querySelectorAll('cell-item'));
      /* carousel-interval：正整數 = 自動輪播毫秒數；0 = 手動輪播（需搭配 progress-bar）；空值或無效值 = 3000 */
      var ciRaw  = parseInt(colEl.getAttribute('carousel-interval'), 10);
      var manual = ciRaw === 0;
      var ms     = manual ? 0 : (ciRaw > 0 ? ciRaw : 3000);
      var hasPb  = colEl.hasAttribute('progress-bar');
      var pbFill = pbPaint(colEl, hasInv ? BG : this.color);
      if (hasInv) div.style.setProperty('--uit-pbtrk', '#6B6C66');   /* inverse 底色較亮，軌道改用中灰才看得出深色填色 */
      if (manual && !hasPb) {
        console.warn('[ui-table] carousel-interval="0"（手動輪播）需要搭配 progress-bar，目前只顯示第一個項目。');
      }
      this._setupCarousel(ci, div, items, ms, hasPb, pbFill);
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
        /* 握把尺寸與色彩，優先順序：ui-col > ui-row > ui-table > UiTableConfig。
           尺寸是圖示高度（寬度自動為 0.65 倍），純數字視為 px，也接受 px、rem、em */
        var xiSizeRaw = colEl.getAttribute('extra-info-size') ||
                        (rowStyle && rowStyle.xiSize) ||
                        this.el.getAttribute('extra-info-size') ||
                        CFG.extraInfoSize;
        if (xiSizeRaw) {
          var xiSize = normSize(xiSizeRaw, '');
          if (xiSize) xi.style.setProperty('--uit-xsz', xiSize);
          else console.warn('[ui-table] extra-info-size="' + xiSizeRaw + '" 不是有效的尺寸，已改用預設值。');
        }
        var xiClrRaw = colEl.getAttribute('extra-info-color') ||
                       (rowStyle && rowStyle.xiColor) ||
                       this.el.getAttribute('extra-info-color') ||
                       CFG.extraInfoColor;
        if (xiClrRaw) {
          var xiClr = resolveColor(xiClrRaw);
          if (xiClr) xi.style.color = xiClr;   /* inline 色彩，優先於 theme 與 inverse 的預設色 */
          else console.warn('[ui-table] extra-info-color="' + xiClrRaw + '" 不是有效的色彩，已改用預設值。');
        }
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

    if (useIL) {
      var ilRaw = parseInt(colEl.getAttribute('icons-list-interval'), 10);
      var ilMs  = ilRaw > 0 ? ilRaw : (parseInt(CFG.iconsListInterval, 10) || 500);
      this._setupIconsList(div, ci, ilList, ilMs);
    }

    return div;
  };

  /* icons-list 動畫：每次滑鼠移入都從頭播放。
     時間軸（n 個圖示、間隔 ms）：0 清空內容並顯示第 1 個，之後每隔 ms 再顯示下一個，
     最後一個出現後再過 ms 恢復原本的內容，總長 n × ms。播放途中再次移入會重新開始。 */
  UiTable.prototype._setupIconsList = function (cell, ci, names, ms) {
    var strip   = mk('span', 'uit-ils');
    var timers  = [];
    var checked = false;
    ci.style.position = 'relative';
    ci.appendChild(strip);

    function stop() {
      timers.forEach(clearTimeout);
      timers = [];
    }

    /* 第一次播放時檢查 Bootstrap Icons 名稱是否存在（不存在的圖示 ::before 沒有 content） */
    function validate(spans) {
      var bad = [];
      spans.forEach(function (s, i) {
        var ic = s.querySelector('i.bi');
        if (!ic) return;
        var c = getComputedStyle(ic, '::before').content;
        if (!c || c === 'none' || c === 'normal' || c === '""') bad.push(names[i]);
      });
      if (bad.length) {
        console.warn('[ui-table] icons-list 找不到這些 Bootstrap Icons：' + bad.join('、') +
          '。請確認名稱是否正確，以及頁面是否已載入 bootstrap-icons。');
      }
    }

    function play() {
      stop();
      if (_pop && cell.contains(_pop.anchor)) closePop();   /* 握把被藏起來時，一併關閉它的 popover */

      /* 樹狀欄：展開鈕保持顯示，圖示列從展開鈕右邊開始 */
      var tr = ci.querySelector(':scope > .uit-tree');
      strip.style.left = (tr ? tr.offsetWidth + 6 : 0) + 'px';
      var ct = ci.querySelector(':scope > .uit-ct');
      strip.style.fontSize = ct ? getComputedStyle(ct).fontSize : '';
      strip.style.justifyContent = tr ? 'flex-start' : getComputedStyle(ci).justifyContent;

      strip.innerHTML = '';
      var spans = names.map(function (n) {
        var s = mkListIco(n);
        strip.appendChild(s);
        return s;
      });

      ci.classList.remove('uit-il-back');
      ci.classList.add('uit-il-on');
      if (!checked) { checked = true; validate(spans); }
      void strip.offsetWidth;   /* 先讓初始的透明狀態生效，第一個圖示才會有淡入效果 */

      spans.forEach(function (s, i) {
        timers.push(setTimeout(function () { s.classList.add('on'); }, i * ms));
      });
      timers.push(setTimeout(function () {
        ci.classList.remove('uit-il-on');
        ci.classList.add('uit-il-back');
        timers.push(setTimeout(function () { ci.classList.remove('uit-il-back'); }, 320));
      }, spans.length * ms));
    }

    cell.addEventListener('mouseenter', play);
  };

  /* ms > 0：自動輪播；ms === 0：手動輪播（點擊分段進度條切換下一畫面） */
  UiTable.prototype._setupCarousel = function (ci, colDiv, items, ms, hasPb, pbFill) {
    if (!items.length) return;

    var manual = ms === 0;
    var n      = items.length;
    var wrap   = mk('div', 'uit-car');

    var curEl = mk('div', 'uit-car-item');
    curEl.innerHTML = items[0].innerHTML;
    wrap.appendChild(curEl);
    ci.appendChild(wrap);

    var idx = 0;
    var animating = false;

    /* 目前項目往上滑出、下一個項目由下方滑入；done 在動畫結束後執行 */
    function slideTo(next, done) {
      if (animating || next === idx) return;
      animating = true;
      idx = next;

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
        if (done) done();
      }, 440);
    }

    /* ---------- 手動輪播 ---------- */
    if (manual) {
      if (!hasPb) return;   /* 沒有進度條就沒有切換的入口，只顯示第一個項目（警告已在 _renderCol 發出） */

      /* 拉高內容與進度條之間的空白；進度條本身絕對定位貼齊儲存格下緣 */
      colDiv.appendChild(mk('div', 'uit-pb-sp'));

      var bar = mk('div', 'uit-pb is-man');
      var trk = mk('div', 'uit-pbt');
      var seg = mk('div', 'uit-pf');
      seg.style.background = pbFill;

      /* 每一段的週期 = (總寬 + 間距) / 段數；用重複漸層當遮罩切出分隔點，
         填色層是整條的漸層，所以漸層會連續橫跨所有分段 */
      var period = '(100% + ' + SEG_GAP + 'px) / ' + n;
      trk.style.setProperty('--uit-pbmask',
        'repeating-linear-gradient(to right,#000 0 calc(' + period + ' - ' + SEG_GAP + 'px),' +
        'transparent 0 calc(' + period + '))');
      trk.appendChild(seg);
      bar.appendChild(trk);
      colDiv.appendChild(bar);

      /* 目前在第 idx + 1 個畫面，就填滿前 idx + 1 段 */
      function paint() {
        var k = idx + 1;
        seg.style.clipPath = k >= n
          ? 'inset(0 0 0 0)'
          : 'inset(0 calc(100% - ' + k + ' * ' + period + ') 0 0)';
      }
      paint();

      bar.addEventListener('click', function (e) {
        e.stopPropagation();   /* 避免同時觸發 show-next 等儲存格層級的點擊 */
        if (n <= 1 || animating) return;
        bar.classList.add('is-busy');
        slideTo((idx + 1) % n, function () { bar.classList.remove('is-busy'); });
        paint();               /* 最後一個畫面再點一次會回到第一個 */
      });
      return;
    }

    /* ---------- 自動輪播 ---------- */
    var fill = null;
    if (hasPb) {
      var pb = mk('div', 'uit-pb');
      fill = mk('div', 'uit-pf');
      fill.style.background = pbFill;
      fill.style.animation  = 'uit-prog ' + ms + 'ms linear infinite';
      pb.appendChild(fill);
      colDiv.appendChild(pb);
    }

    if (n <= 1) return;

    setInterval(function () {
      slideTo((idx + 1) % n, function () {
        if (!fill) return;
        fill.style.animation = 'none';
        void fill.offsetHeight;
        fill.style.animation = 'uit-prog ' + ms + 'ms linear infinite';
      });
    }, ms);
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
  /* 樹狀 API：target 可以是 <ui-table> 元素、CSS 選擇器，或省略（頁面上全部的表格）。
     expandAll 的 level：只展開到第幾層（1 = 只展開最上層的節點），省略則全部展開 */
  function treeTargets(target) {
    var els = !target ? qsa('ui-table')
            : typeof target === 'string' ? qsa(target)
            : [target];
    return els.map(function (el) { return el && el._uitInst; }).filter(Boolean);
  }

  function expandAll(target, level) {
    var lv = parseInt(level, 10);
    treeTargets(target).forEach(function (t) {
      t._nodes.forEach(function (n) {
        if (!lv || n.depth < lv) n.set(true, 'api');
        else n.set(false, 'api');
      });
    });
  }

  function collapseAll(target) {
    treeTargets(target).forEach(function (t) {
      t._nodes.forEach(function (n) { n.set(false, 'api'); });
    });
  }

  global.UiTable = {
    init: boot, config: CFG, colors: BRAND,
    expandAll: expandAll, collapseAll: collapseAll
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window);
