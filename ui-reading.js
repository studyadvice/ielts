/**
 * ui-reading2.js  v1.1.1
 * ─────────────────────────────────────────────────────────────────────
 * 五合一閱讀互動元件（不打斷閱讀流暢度）
 *
 *  <text-morph>   段落文字原地變形，低分 ↔ 高分對比切換
 *  <margin-pin>   標記字詞，hover 後說明浮現於右邊界，虛線連回標記點
 *  <read-pulse>   段落進入視窗時左側出現節奏掃描線
 *  <chalk-mark>   點擊詞彙，手繪弧線動態畫出於文字上方；再點消除
 *  <col-pair>     搭配詞同色小印記，hover 同組成員同時亮起
 *  <chunk-spot>   語塊聚焦導覽：段落上方一排圓點，點擊高亮對應 <chunk>，其餘淡出
 *
 * 全域配置（在引入此檔前設定）：
 *   window.UiReadingConfig = { morphTheme: 'ocean', ... }
 *
 * API：
 *   UiReading.init()   — 重新掃描並初始化新節點（適合動態插入）
 *   UiReading.config   — 目前的全域配置物件（可即時修改）
 *   UiReading.colors   — 色票物件
 */
(function (global) {
  'use strict';

  /* ════════════════════════════════════════════════════════════════
   * 色票
   * ════════════════════════════════════════════════════════════════ */
  var BRAND = {
    shell:    '#C6C7BD', lavender: '#C3A5E5', sky:     '#95c9de',
    warning:  '#F08080', salmon:   '#E5C3B3', ocean:   '#0ABDC6',
    safe:     '#299459', teal:     '#0DA591', vanilla: '#DBEDD8',
    yellow:   '#DECA4B', focus:    '#e0be79', info:    '#1E65C7',
    indigo:   '#9B72CF', pink:     '#FFB3D9', orange:  '#EDA109',
    special:  '#b3de73'
  };
  var BG = '#0C0D0C';

  function clr(v) {
    if (!v) return BRAND.shell;
    v = String(v).trim();
    return BRAND[v] || (/^#|^rgb/.test(v) ? v : BRAND.shell);
  }

  /* ════════════════════════════════════════════════════════════════
   * 全域配置
   * ════════════════════════════════════════════════════════════════ */
  var CFG = global.UiReadingConfig = Object.assign({
    /* text-morph */
    morphTheme:     'sky',
    morphDuration:  420,        /* ms，淡出淡入時長 */
    morphLabelFrom: '← 還原',
    morphLabelTo:   '看升級版 →',

    /* margin-pin */
    pinTheme:  'sky',
    pinMargin: 50,              /* px，標注框距視窗右邊 */
    pinWidth:  500,             /* px，標注框最大寬度 */

    /* read-pulse */
    pulseColor:   'teal',
    pulseSpeed:   2800,         /* ms，掃描線從頂到底的時間 */
    pulseWidth:   '3px',        /* 掃描線粗細 */
    pulseGap:     16,           /* px，左側留白（容納掃描線） */
    pulseTrigger: 'visible',    /* visible | click | hover */

    /* chalk-mark */
    chalkTheme:     'focus',
    chalkThickness: 2.5,           /* px，弧線粗細 */
    chalkDuration:  420,           /* ms，畫出 / 消除動畫時長 */

    /* chunk-spot */
    chunkDotSize:   11,            /* px，導覽圓點直徑 */
    chunkDim:       0.22,          /* 非聚焦區段的 opacity */
    chunkTransition: 300,          /* ms，淡入淡出時長 */
    chunkTheme:     ''             /* 統一色票名稱；空字串 = 自動從色盤循環 */
  }, global.UiReadingConfig || {});

  /* ════════════════════════════════════════════════════════════════
   * CSS
   * ════════════════════════════════════════════════════════════════ */
  var CSS = [
    /* 避免初始化前閃現自訂元素 */
    'text-morph,morph-from,morph-to{display:none}',
    'margin-pin,read-pulse,chalk-mark,col-pair{display:none}',
    'chunk-spot,chunk{display:none}',

    /* ── text-morph ─────────────────────────────────────────────── */
    '.urm-morph{display:block}',

    '.urm-morph-body{' +
      'transition:opacity var(--urm-md,.38s) ease,' +
                 'transform var(--urm-md,.38s) ease}',

    '.urm-morph-body.urm-mo{opacity:0;transform:translateY(6px)}',

    '.urm-morph-ctrl{' +
      'display:flex;align-items:center;margin-top:10px;gap:8px}',

    '.urm-morph-badge{' +
      'display:inline-flex;align-items:center;gap:6px;' +
      'padding:4px 14px;border-radius:20px;font-size:.8rem;' +
      'font-weight:700;border:1.5px solid;cursor:pointer;' +
      'user-select:none;background:transparent;' +
      'transition:filter .2s ease,transform .12s ease}',
    '.urm-morph-badge:hover{filter:brightness(1.25)}',
    '.urm-morph-badge:active{transform:scale(.93)}',

    '.urm-morph-dot{' +
      'width:7px;height:7px;border-radius:50%;' +
      'background:currentColor;flex-shrink:0;' +
      'transition:background .3s ease}',

    /* ── margin-pin ─────────────────────────────────────────────── */
    '.urm-pin{' +
      'border-bottom:1.5px dashed;cursor:help;' +
      'display:inline;transition:opacity .15s ease}',
    '.urm-pin:hover{opacity:.8}',

    /* 標注框（全域唯一，fixed 定位） */
    '.urm-pannot{' +
      'position:fixed;z-index:9100;' +
      'padding:8px 14px;border-radius:9px;' +
      'font-size:.82rem;line-height:1.48;font-weight:500;' +
      'pointer-events:none;' +
      'opacity:0;transition:opacity .2s ease;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.55)}',
    '.urm-pannot.urm-pv{opacity:1}',

    /* 連接虛線（全域唯一，fixed 定位） */
    '.urm-pline{' +
      'position:fixed;z-index:9099;height:0;' +
      'border-top:1px dashed;pointer-events:none;' +
      'opacity:0;transition:opacity .2s ease}',
    '.urm-pline.urm-pv{opacity:.5}',

    /* ── read-pulse ─────────────────────────────────────────────── */
    '.urm-pulse{' +
      'position:relative;display:block;' +
      'padding-left:var(--urm-pg,14px)}',

    /* 掃描線 bar：position absolute，left 0（在 padding 區內） */
    '.urm-pbar{' +
      'position:absolute;left:0;top:0;' +
      'width:var(--urm-pw,3px);height:0;' +
      'border-radius:3px;pointer-events:none;' +
      'opacity:0;transition:opacity .3s ease}',

    /* 播放中：高度展開 */
    '.urm-pbar.urm-pa{' +
      'opacity:1;height:100%;' +
      'transition:height var(--urm-ps,2.8s) linear,opacity .3s ease}',

    /* 播放結束：淡出 */
    '.urm-pbar.urm-pd{' +
      'opacity:0;transition:opacity .9s ease .4s}',

    /* ── chalk-mark ─────────────────────────────────────────────── */
    /* inline-block + relative 確保 SVG absolute 定位可靠 */
    '.urm-chalk{' +
      'display:inline-block;position:relative;' +
      'vertical-align:baseline;cursor:crosshair;' +
      'transition:color .25s ease}',

    /* 弧線 SVG 容器（absolute，超出文字上方） */
    '.urm-chalk-svg{' +
      'position:absolute;overflow:visible;pointer-events:none}',

    /* 弧線路徑：transition 由 JS inline style 設定 */
    '.urm-chalk-path{fill:none;stroke-linecap:round}',

    /* ── col-pair ───────────────────────────────────────────────── */
    '.urm-cp{' +
      'display:inline;position:relative;cursor:default;' +
      'transition:color .2s ease}',

    /* 小圓點：absolute，浮在文字正上方，不影響行高 */
    '.urm-cp-dot{' +
      'position:absolute;top:-8px;left:50%;' +
      'transform:translateX(-50%) scale(1);' +
      'width:5px;height:5px;border-radius:50%;' +
      'background:var(--urm-cp-c,#DECA4B);' +
      'opacity:.65;pointer-events:none;' +
      'transition:transform .22s ease,opacity .22s ease}',

    /* 亮起狀態：文字變色，圓點放大發光 */
    '.urm-cp.urm-cp-lit{color:var(--urm-cp-c)}',
    '.urm-cp.urm-cp-lit .urm-cp-dot{' +
      'transform:translateX(-50%) scale(2.2);opacity:1}',

    /* ── chunk-spot ─────────────────────────────────────────────── */
    '.urm-cs{display:block}',

    /* 圓點導覽列 */
    '.urm-cs-nav{' +
      'display:flex;align-items:center;gap:10px;' +
      'margin-bottom:10px;flex-wrap:wrap}',

    /* 單顆圓點 */
    '.urm-cs-dot{' +
      'display:inline-block;border-radius:50%;flex-shrink:0;' +
      'background:var(--urm-cs-c,#DECA4B);cursor:pointer;' +
      'opacity:.48;' +
      'outline:2px solid transparent;outline-offset:3px;' +
      'transition:transform .22s ease,opacity .22s ease,outline-color .22s ease}',
    '.urm-cs-dot:hover{opacity:.88;transform:scale(1.32)}',

    /* 作用中圓點 */
    '.urm-cs-dot.urm-cs-active{' +
      'opacity:1;transform:scale(1.55);' +
      'outline-color:var(--urm-cs-c)}',

    /* 文字區段（一般文字 & 語塊）共用 transition */
    '.urm-cs-text,.urm-cs-chunk{' +
      'transition:opacity var(--urm-cs-dur,.3s) ease,' +
                 'color    var(--urm-cs-dur,.3s) ease}',

    /* 聚焦模式：一般文字 & 非亮語塊 淡出 */
    '.urm-cs-body.urm-cs-dimmed .urm-cs-text,' +
    '.urm-cs-body.urm-cs-dimmed .urm-cs-chunk:not(.urm-cs-lit){' +
      'opacity:var(--urm-cs-dim,.22)}',

    /* 聚焦語塊：恢復顯眼並染色 */
    '.urm-cs-body.urm-cs-dimmed .urm-cs-chunk.urm-cs-lit{' +
      'opacity:1;color:var(--urm-cs-c)}',

    /* chunk label="#id" → 來源 div 自動隱藏 */
    '[data-urm-cs-src]{display:none!important}',

    /* rich-label 彈出框（fixed，全域唯一） */
    '.urm-cs-annot{' +
      'position:fixed;z-index:9200;max-width:380px;min-width:120px;' +
      'padding:14px 18px;border-radius:11px;' +
      'background:#141514;' +
      'border:1px solid rgba(198,199,189,0.18);' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.88);' +
      'font-size:.86rem;line-height:1.58;' +
      'pointer-events:none;' +
      'opacity:0;transform:translateY(6px);' +
      'transition:opacity .2s ease,transform .2s ease}',
    '.urm-cs-annot.urm-cs-av{opacity:1;transform:translateY(0)}',

    /* 彈出框內 HTML 元素基本排版 */
    '.urm-cs-annot p{margin-bottom:8px}',
    '.urm-cs-annot p:last-child{margin-bottom:0}',
    '.urm-cs-annot ul,.urm-cs-annot ol{padding-left:18px;margin-bottom:8px}',
    '.urm-cs-annot li{margin-bottom:3px}',
    '.urm-cs-annot strong,.urm-cs-annot b{color:#DECA4B;font-weight:700}',
    '.urm-cs-annot em,.urm-cs-annot i{color:#95c9de;font-style:italic}',
    '.urm-cs-annot code{' +
      'font-family:monospace;font-size:.88em;' +
      'background:rgba(198,199,189,0.12);' +
      'padding:1px 5px;border-radius:4px}',
    '.urm-cs-annot pre{' +
      'font-family:monospace;font-size:.82em;' +
      'background:rgba(198,199,189,0.08);' +
      'padding:10px 12px;border-radius:7px;' +
      'overflow-x:auto;margin-bottom:8px;white-space:pre}',
    '.urm-cs-annot table{border-collapse:collapse;width:100%;margin-bottom:8px}',
    '.urm-cs-annot th,.urm-cs-annot td{' +
      'padding:5px 10px;font-size:.83em;' +
      'border:1px solid rgba(198,199,189,0.18)}',
    '.urm-cs-annot th{color:#DECA4B;background:rgba(198,199,189,0.07);font-weight:700}',
    '.urm-cs-annot hr{border:none;border-top:1px solid rgba(198,199,189,0.16);margin:8px 0}'

  ].join('\n');

  (function () {
    if (document.getElementById('urm-css')) return;
    var s = document.createElement('style');
    s.id = 'urm-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  })();

  /* ════════════════════════════════════════════════════════════════
   * text-morph
   *
   * 用法：
   *   <text-morph theme="sky" label-from="← 還原" label-to="看升級版 →">
   *     <morph-from>原版文字（可含任何 HTML）</morph-from>
   *     <morph-to>升級版文字（可含任何 HTML）</morph-to>
   *   </text-morph>
   *
   * 屬性：
   *   theme        按鈕色票名稱或 hex（預設 morphTheme）
   *   duration     過渡毫秒（預設 morphDuration）
   *   label-from   顯示「還原」按鈕的文字
   *   label-to     顯示「切換」按鈕的文字
   *
   * ★ morph 內容中的 chalk-mark / margin-pin / read-pulse
   *   在每次切換後會自動重新初始化。col-pair 不支援巢狀於 morph 內。
   * ════════════════════════════════════════════════════════════════ */
  function initMorph(el) {
    if (el.dataset.urm) return;
    el.dataset.urm = '1';

    var fromEl = el.querySelector('morph-from');
    var toEl   = el.querySelector('morph-to');
    if (!fromEl || !toEl) {
      console.warn('[ui-reading] <text-morph> 缺少 <morph-from> 或 <morph-to>，已略過。');
      return;
    }

    var fromHTML = fromEl.innerHTML;
    var toHTML   = toEl.innerHTML;
    var theme    = el.getAttribute('theme')       || CFG.morphTheme;
    var dur      = +(el.getAttribute('duration')  || CFG.morphDuration);
    var lblFrom  = el.getAttribute('label-from')  || CFG.morphLabelFrom;
    var lblTo    = el.getAttribute('label-to')    || CFG.morphLabelTo;
    var c        = clr(theme);
    var cSafe    = clr('safe');
    var shown    = false; /* false = from, true = to */

    /* ── DOM ── */
    var wrap = document.createElement('div');
    wrap.className = 'urm-morph';
    wrap.style.setProperty('--urm-md', dur + 'ms');

    var body = document.createElement('div');
    body.className = 'urm-morph-body';
    body.innerHTML = fromHTML;

    var ctrl  = document.createElement('div');
    ctrl.className = 'urm-morph-ctrl';

    var badge = document.createElement('span');
    badge.className = 'urm-morph-badge';

    var dot = document.createElement('span');
    dot.className = 'urm-morph-dot';

    var lbl = document.createElement('span');

    badge.appendChild(dot);
    badge.appendChild(lbl);
    ctrl.appendChild(badge);
    wrap.appendChild(body);
    wrap.appendChild(ctrl);
    el.replaceWith(wrap);

    function syncBadge() {
      var c2 = shown ? cSafe : c;
      badge.style.color       = c2;
      badge.style.borderColor = c2;
      dot.style.background    = c2;
      lbl.textContent = shown ? lblFrom : lblTo;
    }
    syncBadge();

    /* 重新初始化巢狀元件（chalk-mark / margin-pin / read-pulse） */
    function reinitNested() {
      body.querySelectorAll('chalk-mark:not([data-urm])').forEach(initChalk);
      body.querySelectorAll('margin-pin:not([data-urm])').forEach(initPin);
      body.querySelectorAll('read-pulse:not([data-urm])').forEach(initPulse);
    }

    var busy = false;
    badge.addEventListener('click', function () {
      if (busy) return;
      busy = true;
      body.classList.add('urm-mo');
      setTimeout(function () {
        shown = !shown;
        body.innerHTML = shown ? toHTML : fromHTML;
        reinitNested();
        syncBadge();
        body.classList.remove('urm-mo');
        setTimeout(function () { busy = false; }, dur + 50);
      }, dur);
    });
  }

  /* ════════════════════════════════════════════════════════════════
   * margin-pin
   *
   * 用法：
   *   <margin-pin note="說明文字" theme="yellow">標記詞</margin-pin>
   *
   * 屬性：
   *   note    浮動說明文字
   *   theme   標記色票名稱或 hex（預設 pinTheme）
   *
   * ★ 共用一對全域 DOM（標注框 + 連接線），不依賴容器寬度。
   *   建議在寬螢幕使用（視窗右側需有足夠空間顯示標注框）。
   * ════════════════════════════════════════════════════════════════ */
  var _pa = null, _pl = null, _pt = null;

  function ensurePinDom() {
    if (_pa) return;
    _pa = document.createElement('div');
    _pa.className = 'urm-pannot';
    _pl = document.createElement('div');
    _pl.className = 'urm-pline';
    document.body.appendChild(_pa);
    document.body.appendChild(_pl);
  }

  function initPin(el) {
    if (el.dataset.urm) return;
    el.dataset.urm = '1';

    var note     = el.getAttribute('note') || '';
    var themeRaw = el.getAttribute('theme') || CFG.pinTheme;

    /* 解析 outline 變體：theme="yellow-outline" → isOutline=true, themeName="yellow" */
    var isOutline = themeRaw.slice(-8) === '-outline';
    var themeName = isOutline ? themeRaw.slice(0, -8) : themeRaw;
    var c = clr(themeName);

    var mark = document.createElement('span');
    mark.className = 'urm-pin';
    mark.style.borderBottomColor = c;
    mark.style.color = c;
    mark.innerHTML = el.innerHTML;
    el.replaceWith(mark);
    ensurePinDom();

    mark.addEventListener('mouseenter', function () {
      clearTimeout(_pt);
      var mr = mark.getBoundingClientRect();

      /* 標注框：fill（預設）或 outline */
      if (isOutline) {
        _pa.style.background = BG;
        _pa.style.color      = c;
        _pa.style.border     = '1.5px solid ' + c;
        _pa.style.boxShadow  = '0 4px 16px rgba(0,0,0,.45)';
      } else {
        _pa.style.background = c;
        _pa.style.color      = BG;
        _pa.style.border     = 'none';
        _pa.style.boxShadow  = '0 4px 16px rgba(0,0,0,.55)';
      }

      _pa.style.right    = CFG.pinMargin + 'px';
      _pa.style.left     = '';
      _pa.style.maxWidth = CFG.pinWidth + 'px';
      _pa.style.top      = Math.max(8, mr.top + mr.height / 2 - 20) + 'px';
      _pa.innerHTML      = note;   /* innerHTML 支援 <br> 等標籤 */
      _pa.classList.add('urm-pv');

      /* 等標注框渲染後再計算連接線位置 */
      requestAnimationFrame(function () {
        var ar  = _pa.getBoundingClientRect();
        var ly  = mr.top + mr.height / 2;
        var lx1 = mr.right + 5;
        var lx2 = ar.left  - 5;
        _pl.style.top         = ly + 'px';
        _pl.style.left        = lx1 + 'px';
        _pl.style.width       = Math.max(0, lx2 - lx1) + 'px';
        _pl.style.borderColor = c;
        if (lx2 > lx1) _pl.classList.add('urm-pv');
      });
    });

    mark.addEventListener('mouseleave', function () {
      _pt = setTimeout(function () {
        _pa.classList.remove('urm-pv');
        _pl.classList.remove('urm-pv');
      }, 90);
    });
  }

  /* ════════════════════════════════════════════════════════════════
   * read-pulse
   *
   * 用法：
   *   <read-pulse color="teal" speed="2800" trigger="visible">
   *     段落文字…
   *   </read-pulse>
   *
   * 屬性：
   *   color        掃描線色票名稱或 hex（預設 pulseColor）
   *   speed        掃描毫秒（預設 pulseSpeed）
   *   pulse-width  掃描線粗細（預設 pulseWidth）
   *   gap          左側留白 px（預設 pulseGap）
   *   trigger      visible（預設）| click | hover
   *   repeat       有此屬性時可重複觸發（預設只播一次）
   * ════════════════════════════════════════════════════════════════ */
  function initPulse(el) {
    if (el.dataset.urm) return;
    el.dataset.urm = '1';

    var c       = clr(el.getAttribute('color')       || CFG.pulseColor);
    var speed   = +(el.getAttribute('speed')          || CFG.pulseSpeed);
    var pw      = el.getAttribute('pulse-width')      || CFG.pulseWidth;
    var gap     = +(el.getAttribute('gap')            || CFG.pulseGap);
    var trigger = el.getAttribute('trigger')          || CFG.pulseTrigger;
    var repeat  = el.hasAttribute('repeat');

    var wrap = document.createElement('div');
    wrap.className = 'urm-pulse';
    wrap.style.setProperty('--urm-ps', speed + 'ms');
    wrap.style.setProperty('--urm-pw', pw);
    wrap.style.setProperty('--urm-pg', gap + 'px');

    var bar = document.createElement('div');
    bar.className = 'urm-pbar';
    bar.style.background = c;
    wrap.appendChild(bar);

    /* 搬移子節點到 wrap（bar 已是第一個 absolute 子節點） */
    Array.from(el.childNodes).forEach(function (n) { wrap.appendChild(n); });
    el.replaceWith(wrap);

    var played = false, running = false;

    function pulse() {
      if (running) return;
      if (played && !repeat) return;
      played = running = true;

      bar.classList.remove('urm-pa', 'urm-pd');
      void bar.offsetHeight; /* force reflow，確保動畫重頭播放 */
      bar.classList.add('urm-pa');

      /* 掃完後淡出，再重置狀態 */
      setTimeout(function () {
        bar.classList.add('urm-pd');
        setTimeout(function () {
          bar.classList.remove('urm-pa', 'urm-pd');
          running = false;
        }, 1400);
      }, speed + 300);
    }

    if (trigger === 'visible') {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          setTimeout(pulse, 180); /* 短延遲讓視覺安頓後再出現 */
          if (!repeat) io.disconnect();
        });
      }, { threshold: 0.25 });
      io.observe(wrap);

    } else if (trigger === 'click') {
      wrap.style.cursor = 'pointer';
      wrap.addEventListener('click', pulse);

    } else if (trigger === 'hover') {
      wrap.addEventListener('mouseenter', pulse);
    }
  }

  /* ════════════════════════════════════════════════════════════════
   * chalk-mark
   *
   * 用法：
   *   <chalk-mark theme="focus">詞彙</chalk-mark>
   *   <chalk-mark theme="sky" active>預設已啟動</chalk-mark>
   *
   * 屬性：
   *   theme      弧線色票名稱或 hex（預設 chalkTheme）
   *   thickness  弧線粗細 px（預設 chalkThickness）
   *   duration   畫出 / 消除動畫毫秒（預設 chalkDuration）
   *   active     有此屬性時頁面載入後自動畫出弧線
   *
   * ★ 弧線以 SVG quadratic bezier 實作，
   *   用 stroke-dashoffset 動畫模擬手繪效果。
   *   chalk-mark 限用於單行短詞，跨行不保證正確。
   * ════════════════════════════════════════════════════════════════ */
  function initChalk(el) {
    if (el.dataset.urm) return;
    el.dataset.urm = '1';

    var c         = clr(el.getAttribute('theme')     || CFG.chalkTheme);
    var thick     = +(el.getAttribute('thickness')   || CFG.chalkThickness);
    var dur       = +(el.getAttribute('duration')    || CFG.chalkDuration);
    var preActive = el.hasAttribute('active');

    /* ── wrap ── */
    var wrap = document.createElement('span');
    wrap.className = 'urm-chalk';
    wrap.innerHTML = el.innerHTML;
    el.replaceWith(wrap);

    var svgEl = null, chalkPath = null, isActive = false;
    var _animId = null; /* 目前進行中的 rAF id */

    /* ── rAF 動畫：直接操作 SVG attribute，不依賴 CSS transition ── */
    function animateDash(path, fromOffset, toOffset, onDone) {
      if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var t     = Math.min((ts - start) / dur, 1);
        var ease  = 1 - Math.pow(1 - t, 3); /* cubic ease-out */
        var val   = fromOffset + (toOffset - fromOffset) * ease;
        if (path.isConnected) path.setAttribute('stroke-dashoffset', val);
        if (t < 1 && path.isConnected) {
          _animId = requestAnimationFrame(step);
        } else {
          _animId = null;
          if (onDone) onDone();
        }
      }
      _animId = requestAnimationFrame(step);
    }

    /* ── 建立弧線 SVG，回傳路徑長度（=0 表示在隱藏容器內） ── */
    function buildArc() {
      if (svgEl) { svgEl.remove(); svgEl = null; chalkPath = null; }
      if (_animId) { cancelAnimationFrame(_animId); _animId = null; }

      var rect  = wrap.getBoundingClientRect();
      var w     = rect.width;
      var h     = rect.height;
      var lift  = Math.round(h * 0.6);
      var pad   = 3;
      var svgW  = w + pad * 2;
      var svgH  = lift + 6;

      svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('class', 'urm-chalk-svg');
      svgEl.style.cssText =
        'position:absolute;overflow:visible;pointer-events:none;' +
        'left:' + (-pad) + 'px;' +
        'top:'  + (-svgH) + 'px;' +
        'width:'  + svgW + 'px;' +
        'height:' + svgH + 'px';

      var x1 = pad,        y1 = svgH - 2;
      var cx = svgW / 2,   cy = 3;
      var x2 = svgW - pad, y2 = svgH - 2;
      var d  = 'M ' + x1 + ' ' + y1 +
               ' Q ' + cx + ' ' + cy +
               ' ' + x2 + ' ' + y2;

      chalkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      chalkPath.setAttribute('fill',            'none');
      chalkPath.setAttribute('stroke',          c);
      chalkPath.setAttribute('stroke-width',    thick);
      chalkPath.setAttribute('stroke-linecap',  'round');
      chalkPath.setAttribute('d',               d);

      svgEl.appendChild(chalkPath);
      wrap.appendChild(svgEl);

      /* getTotalLength() 需要元素已在 DOM 中 */
      var len = chalkPath.getTotalLength();
      /* 初始：路徑完全隱藏（用 SVG attribute，不依賴 CSS） */
      chalkPath.setAttribute('stroke-dasharray',  len);
      chalkPath.setAttribute('stroke-dashoffset', len);

      return len;
    }

    /* ── 啟動：畫弧 ── */
    function activate() {
      isActive = true;
      wrap.style.color = c;
      var len = buildArc();
      /* 在隱藏容器（len≈0）時不動畫，等使用者點擊後重建 */
      if (len < 1) return;
      animateDash(chalkPath, len, 0, null);
    }

    /* ── 停用：消弧 ── */
    function deactivate() {
      isActive = false;
      wrap.style.color = '';
      if (!chalkPath) return;
      var len     = parseFloat(chalkPath.getAttribute('stroke-dasharray')) || 0;
      var current = parseFloat(chalkPath.getAttribute('stroke-dashoffset')) || 0;
      var _path   = chalkPath;
      var _svg    = svgEl;
      svgEl = null; chalkPath = null;
      animateDash(_path, current, len, function () {
        if (_svg && _svg.parentNode) _svg.remove();
      });
    }

    wrap.addEventListener('click', function () {
      if (isActive) {
        /* 偵測縮退弧線（在隱藏容器初始化的殘留）：直接重建 */
        var arcLen = chalkPath
          ? parseFloat(chalkPath.getAttribute('stroke-dasharray')) || 0
          : 0;
        if (arcLen < 1) {
          if (svgEl) { svgEl.remove(); svgEl = null; chalkPath = null; }
          isActive = false;
          activate();
          return;
        }
        deactivate();
      } else {
        activate();
      }
    });

    /* active 屬性：先確認元素可見，否則用 IO 等待 */
    if (preActive) {
      setTimeout(function () {
        var r = wrap.getBoundingClientRect();
        if (r.width > 0) {
          activate();
        } else {
          var io = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
              io.disconnect();
              activate();
            }
          }, { threshold: 0.01 });
          io.observe(wrap);
        }
      }, 80);
    }
  }

  /* ════════════════════════════════════════════════════════════════
   * col-pair — 搭配詞同色小印記
   *
   * 用法：
   *   I need to <col-pair group="g1">make</col-pair> a
   *   <col-pair group="g1">decision</col-pair> soon.
   *   This will <col-pair group="g2">have</col-pair> a significant
   *   <col-pair group="g2">impact</col-pair>.
   *
   * 屬性：
   *   group    同組識別碼（字串，必填）；同組自動共享顏色
   *   theme    覆蓋該組自動分配的色票名稱或 hex
   *            （同組第一個 theme 屬性生效，後續忽略）
   *   label    hover 時 title 提示文字，同組共用
   *
   * ★ 所有 col-pair 需一起初始化，UiReading.init() 可安全重複呼叫。
   * ════════════════════════════════════════════════════════════════ */

  /* 自動色盤（排除太淺或對比不足的色票） */
  var _cpPalette = [
    BRAND.yellow, BRAND.sky, BRAND.lavender, BRAND.ocean,
    BRAND.salmon, BRAND.teal, BRAND.focus,   BRAND.info,
    BRAND.pink,   BRAND.orange, BRAND.indigo, BRAND.vanilla
  ];
  var _cpPaletteIdx = 0;
  /* 群組登錄表：gid → { color, members[], label, _hasTheme } */
  var _cpGroups = {};

  function initColPairs() {
    var els = Array.from(
      document.querySelectorAll('col-pair:not([data-urm])')
    );
    if (!els.length) return;

    /* ── 第一遍：建群組，分配顏色 ── */
    els.forEach(function (el) {
      var gid   = el.getAttribute('group') || '_nogroup';
      var theme = el.getAttribute('theme');
      var label = el.getAttribute('label') || '';
      if (!_cpGroups[gid]) {
        var c = theme
          ? clr(theme)
          : _cpPalette[_cpPaletteIdx++ % _cpPalette.length];
        _cpGroups[gid] = { color: c, members: [], label: label, _hasTheme: !!theme };
      }
      /* 同組第一個 theme 優先，後續忽略 */
      if (theme && !_cpGroups[gid]._hasTheme) {
        _cpGroups[gid].color = clr(theme);
        _cpGroups[gid]._hasTheme = true;
      }
      if (label && !_cpGroups[gid].label) _cpGroups[gid].label = label;
    });

    /* ── 第二遍：替換 DOM ── */
    var registry = [];
    els.forEach(function (el) {
      el.dataset.urm = '1';
      var gid = el.getAttribute('group') || '_nogroup';
      var grp = _cpGroups[gid];
      var c   = grp.color;

      var wrap = document.createElement('span');
      wrap.className   = 'urm-cp';
      wrap.dataset.cpg = gid;
      wrap.style.setProperty('--urm-cp-c', c);
      if (grp.label) wrap.title = grp.label;
      wrap.innerHTML = el.innerHTML;

      /* 小印記圓點，insertBefore 確保在文字節點最前 */
      var dot = document.createElement('span');
      dot.className = 'urm-cp-dot';
      wrap.insertBefore(dot, wrap.firstChild);

      el.replaceWith(wrap);
      grp.members.push(wrap);
      registry.push({ wrap: wrap, gid: gid });
    });

    /* ── 第三遍：掛 hover 事件（此時 wrap 已全數入 DOM） ── */
    registry.forEach(function (item) {
      var grp = _cpGroups[item.gid];
      item.wrap.addEventListener('mouseenter', function () {
        grp.members.forEach(function (m) { m.classList.add('urm-cp-lit'); });
      });
      item.wrap.addEventListener('mouseleave', function () {
        grp.members.forEach(function (m) { m.classList.remove('urm-cp-lit'); });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
   * chunk-spot — 語塊聚焦導覽
   *
   * 用法：
   *   <chunk-spot>
   *     I need to <chunk>make a decision</chunk> before the deadline.
   *     It will <chunk theme="pink">have significant impact</chunk>
   *     on our <chunk label="能力描述">overall performance</chunk>.
   *   </chunk-spot>
   *
   * chunk-spot 屬性：
   *   dot-size    圓點直徑 px（預設 chunkDotSize）
   *   dim         非聚焦區段 opacity（預設 chunkDim）
   *   duration    淡入淡出毫秒（預設 chunkTransition）
   *
   * chunk 屬性：
   *   theme       覆蓋個別語塊色票名稱或 hex
   *   label       圓點提示文字；兩種格式：
   *               "純文字"    → 瀏覽器原生 title tooltip
   *               "#some-id"  → 讀取 id="some-id" 的 div 的 innerHTML
   *                             並以浮動框顯示（自動隱藏原始 div）
   *
   * ★ 段落中的一般文字與其他元素（strong、em 等）均自動包入
   *   <span class="urm-cs-text"> 並隨聚焦一起淡出。
   *   chunk-spot 可安全巢狀於 text-morph 的 morph-from / morph-to 內。
   * ════════════════════════════════════════════════════════════════ */

  /* rich-label 彈出框：全頁唯一，lazy 建立 */
  var _csAnnotEl = null, _csAnnotTm = null;

  function ensureCsAnnot() {
    if (_csAnnotEl) return;
    _csAnnotEl = document.createElement('div');
    _csAnnotEl.className = 'urm-cs-annot';
    document.body.appendChild(_csAnnotEl);
  }

  /* 語塊自動色盤（刻意與 col-pair 使用不同排列順序，避免撞色） */
  var _csPalette = [
    BRAND.sky, BRAND.yellow, BRAND.lavender, BRAND.salmon,
    BRAND.teal, BRAND.focus,  BRAND.pink,    BRAND.ocean,
    BRAND.info, BRAND.indigo, BRAND.orange,  BRAND.vanilla
  ];

  function initChunkSpot(el) {
    if (el.dataset.urm) return;
    el.dataset.urm = '1';

    var dotSize = +(el.getAttribute('dot-size') || CFG.chunkDotSize);
    var dimVal  =  +(el.getAttribute('dim')     || CFG.chunkDim);
    var dur     = +(el.getAttribute('duration') || CFG.chunkTransition);

    /* ── 掃描子節點，分類為 chunk / 一般文字 / 其他元素 ── */
    var segments   = [];
    var chunkMetas = [];   /* { html, color, label } */
    var palIdx     = 0;

    Array.from(el.childNodes).forEach(function (node) {
      if (node.nodeType === 1 && node.tagName.toLowerCase() === 'chunk') {
        /* 語塊元素 */
        var rawTheme = node.getAttribute('theme') || CFG.chunkTheme;
        var color    = rawTheme
          ? clr(rawTheme)
          : _csPalette[palIdx++ % _csPalette.length];
        var meta = {
          html:  node.innerHTML,
          color: color,
          label: node.getAttribute('label') || ''
        };
        segments.push({ type: 'chunk', idx: chunkMetas.length });
        chunkMetas.push(meta);

      } else if (node.nodeType === 3) {
        /* 純文字節點（保留空白以維持間距） */
        if (node.textContent !== '') {
          segments.push({ type: 'text', text: node.textContent });
        }

      } else if (node.nodeType === 1) {
        /* 其他元素（strong / em / br …） */
        segments.push({ type: 'elem', outer: node.outerHTML });
      }
    });

    if (!chunkMetas.length) {
      console.warn('[ui-reading] <chunk-spot> 內找不到 <chunk>，已略過。');
      return;
    }

    /* ── 建立 DOM 結構 ── */
    var wrap = document.createElement('div');
    wrap.className = 'urm-cs';
    wrap.style.setProperty('--urm-cs-dim', dimVal);
    wrap.style.setProperty('--urm-cs-dur', dur + 'ms');

    /* 導覽圓點列 */
    var nav  = document.createElement('div');
    nav.className = 'urm-cs-nav';

    var dots = [];
    chunkMetas.forEach(function (meta) {
      var dot = document.createElement('span');
      dot.className = 'urm-cs-dot';
      dot.style.setProperty('--urm-cs-c', meta.color);
      dot.style.width  = dotSize + 'px';
      dot.style.height = dotSize + 'px';

      if (meta.label) {
        if (meta.label.charAt(0) === '#') {
          /* ── rich-label：label="#some-id" ── */
          var targetId = meta.label.slice(1);

          /* 標記來源 div，CSS 將自動隱藏它 */
          var srcEl = document.getElementById(targetId);
          if (srcEl) srcEl.dataset.urmCsSrc = '1';

          dot.addEventListener('mouseenter', function () {
            var el = document.getElementById(targetId);
            if (!el) return;
            ensureCsAnnot();
            clearTimeout(_csAnnotTm);

            /* 填入內容 */
            _csAnnotEl.innerHTML = el.innerHTML;

            /* 先定位（避免閃爍），再顯示 */
            var r    = dot.getBoundingClientRect();
            var left = Math.min(r.left, window.innerWidth - 396);
            var top  = r.bottom + 9;
            /* 超出底部時改顯示於圓點上方 */
            _csAnnotEl.style.visibility = 'hidden';
            _csAnnotEl.style.top  = top  + 'px';
            _csAnnotEl.style.left = Math.max(8, left) + 'px';
            _csAnnotEl.classList.add('urm-cs-av');

            requestAnimationFrame(function () {
              var ar = _csAnnotEl.getBoundingClientRect();
              if (ar.bottom > window.innerHeight - 8) {
                _csAnnotEl.style.top = Math.max(8, r.top - ar.height - 9) + 'px';
              }
              _csAnnotEl.style.visibility = '';
            });
          });

          dot.addEventListener('mouseleave', function () {
            _csAnnotTm = setTimeout(function () {
              if (_csAnnotEl) _csAnnotEl.classList.remove('urm-cs-av');
            }, 120);
          });

        } else {
          /* ── 純文字 label：維持原有 title 行為 ── */
          dot.title = meta.label;
        }
      }

      dots.push(dot);
      nav.appendChild(dot);
    });

    /* 文字主體 */
    var body = document.createElement('div');
    body.className = 'urm-cs-body';

    var chunkSpans = [];
    segments.forEach(function (seg) {
      var s = document.createElement('span');
      if (seg.type === 'chunk') {
        var meta = chunkMetas[seg.idx];
        s.className = 'urm-cs-chunk';
        s.style.setProperty('--urm-cs-c', meta.color);
        s.dataset.idx = seg.idx;
        s.innerHTML   = meta.html;
        chunkSpans.push(s);
      } else if (seg.type === 'text') {
        s.className   = 'urm-cs-text';
        s.textContent = seg.text;
      } else {
        s.className = 'urm-cs-text';
        s.innerHTML = seg.outer;
      }
      body.appendChild(s);
    });

    wrap.appendChild(nav);
    wrap.appendChild(body);
    el.replaceWith(wrap);

    /* ── 互動邏輯 ── */
    var activeIdx = -1;

    function activate(idx) {
      if (activeIdx === idx) {
        /* 再次點擊同一圓點 → 解除聚焦 */
        activeIdx = -1;
        body.classList.remove('urm-cs-dimmed');
        dots.forEach(function (d) { d.classList.remove('urm-cs-active'); });
        chunkSpans.forEach(function (s) { s.classList.remove('urm-cs-lit'); });
      } else {
        activeIdx = idx;
        body.classList.add('urm-cs-dimmed');
        dots.forEach(function (d, i) {
          d.classList.toggle('urm-cs-active', i === idx);
        });
        chunkSpans.forEach(function (s, i) {
          s.classList.toggle('urm-cs-lit', i === idx);
        });
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { activate(i); });
    });
  }

  /* ════════════════════════════════════════════════════════════════
   * boot
   * ════════════════════════════════════════════════════════════════ */
  function boot() {
    document.querySelectorAll('text-morph:not([data-urm])').forEach(initMorph);
    document.querySelectorAll('margin-pin:not([data-urm])').forEach(initPin);
    document.querySelectorAll('read-pulse:not([data-urm])').forEach(initPulse);
    document.querySelectorAll('chalk-mark:not([data-urm])').forEach(initChalk);
    document.querySelectorAll('chunk-spot:not([data-urm])').forEach(initChunkSpot);
    initColPairs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.UiReading = { init: boot, config: CFG, colors: BRAND };

})(window);
