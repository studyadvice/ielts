(function (global) {
  'use strict';
  var BRAND = {
    shell:    '#C6C7BD',
    vanilla:  '#DBEDD8',
    yellow:   '#E3D322',
    indigo:   '#778CE1',
    pink:     '#FF91D7',
    /* 新色票 */
    red: '#EF6661',
    green: '#71CD76',
    blue: '#5DBAE8',
    violet: '#B484E8',
    gray: '#86877F',
    /* 新增色 */
    key: '#51DBCF',
    calm: '#A3C4BC',
    quiet: '#8EA4DE',
    playful: '#FFA987',
    urgent: '#FF2E63',
    energetic: '#B6FF00',
    dreamy: '#DE8EC9',
    'bg-alternative': '#3B2A20'
  };

  var BG     = '#0C0D0C';
  var BG_RGB = [12, 13, 12];

  function resolveColor(v) {
    if (!v) return null;
    v = String(v).trim();
    var k = v.toLowerCase();
    if (k === 'base') return '#0C0D0C';
    return BRAND[v] || BRAND[k] || (/^#|^rgb/.test(v) ? v : null);
  }

  function clr(v) {
    if (!v) return BRAND.shell;
    v = String(v).trim();
    var k = v.toLowerCase();
    if (k === 'base') return '#0C0D0C';
    return BRAND[v] || BRAND[k] || (/^#|^rgb/.test(v) ? v : BRAND.shell);
  }

  function hexToRgb(hex) {
    var h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function blendColor(hex, alpha) {
    var c = hexToRgb(hex);
    return 'rgb(' +
      Math.round(BG_RGB[0] + alpha * (c[0] - BG_RGB[0])) + ',' +
      Math.round(BG_RGB[1] + alpha * (c[1] - BG_RGB[1])) + ',' +
      Math.round(BG_RGB[2] + alpha * (c[2] - BG_RGB[2])) + ')';
  }

  function rAF2(fn) {
    requestAnimationFrame(function () { requestAnimationFrame(fn); });
  }

  /* wait：保險計時的毫秒數，預設 600；動畫較長時傳入動畫時間，避免提前收尾 */
  function onTransEnd(el, prop, fn, wait) {
    var done = false;
    function h(e) {
      if (e.propertyName === prop && !done) {
        done = true;
        el.removeEventListener('transitionend', h);
        fn();
      }
    }
    el.addEventListener('transitionend', h);
    setTimeout(function () {
      if (!done) { done = true; el.removeEventListener('transitionend', h); fn(); }
    }, Math.max(600, (+wait || 0) + 120));
  }

  function clearAnim(el) {
    el.style.transition = el.style.maxHeight = el.style.overflow =
      el.style.opacity = '';
  }

  /* 顯示元素：先清掉行內 display；若仍被 class（例如 bp-hidden）隱藏，改用 block */
  function showEl(el) {
    el.style.display = '';
    if (getComputedStyle(el).display === 'none') el.style.display = 'block';
  }

  /* 目前是否處於顯示狀態（收合動畫進行中視為已隱藏） */
  function isShown(el) {
    if (!el || el._ubtnClosing) return false;
    return getComputedStyle(el).display !== 'none';
  }

  /* 每次開合遞增序號，舊動畫的收尾回呼若已過期就不執行，
     避免「收合中又快速展開」時，收合的回呼把內容又藏起來 */
  function nextSeq(el) {
    el._ubtnSeq = (el._ubtnSeq || 0) + 1;
    return el._ubtnSeq;
  }

  function animOpen(el, mode, dur) {
    var seq = nextSeq(el);
    el._ubtnClosing = false;
    clearAnim(el);
    if (mode === 'none') { showEl(el); return; }
    /* 先關閉過渡並設好起點，讓瀏覽器以「透明、高度 0」作為起始樣式，
       下一個畫面才掛上過渡並設定終點，淡入與展開才會完整播放 */
    el.style.transition = 'none';
    el.style.opacity    = '0';
    if (mode === 'fade') {
      showEl(el);
      void el.offsetHeight;
      rAF2(function () {
        if (el._ubtnSeq !== seq) return;
        el.style.transition = 'opacity ' + dur + 'ms ease';
        el.style.opacity    = '1';
      });
      onTransEnd(el, 'opacity', function () {
        if (el._ubtnSeq !== seq) return;
        el.style.transition = el.style.opacity = '';
      }, dur + 40);
    } else {
      showEl(el);
      var h = el.scrollHeight || 200;
      el.style.overflow   = 'hidden';
      el.style.maxHeight  = '0';
      void el.offsetHeight;
      rAF2(function () {
        if (el._ubtnSeq !== seq) return;
        el.style.transition = 'max-height ' + dur + 'ms ease, opacity ' +
          Math.round(dur * 0.7) + 'ms ease';
        el.style.maxHeight = h + 'px';
        el.style.opacity   = '1';
      });
      onTransEnd(el, 'max-height', function () {
        if (el._ubtnSeq !== seq) return;
        el.style.maxHeight = el.style.overflow =
          el.style.transition = el.style.opacity = '';
      }, dur);
    }
  }

  function animClose(el, mode, dur) {
    var seq = nextSeq(el);
    clearAnim(el);
    if (mode === 'none') { el._ubtnClosing = false; el.style.display = 'none'; return; }
    el._ubtnClosing = true;
    function done() {
      if (el._ubtnSeq !== seq) return;
      el._ubtnClosing     = false;
      el.style.display    = 'none';
      el.style.maxHeight  = el.style.overflow =
        el.style.transition = el.style.opacity = '';
    }
    if (mode === 'fade') {
      el.style.transition = 'opacity ' + dur + 'ms ease';
      el.style.opacity    = '0';
      onTransEnd(el, 'opacity', done, dur);
    } else {
      var h = el.scrollHeight || 1;
      el.style.overflow   = 'hidden';
      el.style.maxHeight  = h + 'px';
      el.style.transition = 'max-height ' + dur + 'ms ease, opacity ' +
        Math.round(dur * 0.7) + 'ms ease';
      rAF2(function () {
        if (el._ubtnSeq !== seq) return;
        el.style.maxHeight = '0';
        el.style.opacity   = '0';
      });
      onTransEnd(el, 'max-height', done, dur);
    }
  }

  var CSS_READING = [
    'read-pulse,chalk-mark,col-pair{display:none}',

    '.urm-pulse{position:relative;display:block;padding-left:var(--urm-pg,14px)}',
    '.urm-pbar{position:absolute;left:0;top:0;' +
      'width:var(--urm-pw,3px);height:0;' +
      'border-radius:3px;pointer-events:none;opacity:0;transition:opacity .3s ease}',
    '.urm-pbar.urm-pa{opacity:1;height:100%;' +
      'transition:height var(--urm-ps,2.8s) linear,opacity .3s ease}',
    '.urm-pbar.urm-pd{opacity:0;transition:opacity .9s ease .4s}',

    '.urm-pulse[data-style="gradient"] .urm-pbar{' +
      'background:linear-gradient(to bottom,var(--urm-c2,var(--urm-c)),var(--urm-c))}',
    '.urm-pulse[data-style="glow"] .urm-pbar{box-shadow:0 0 9px 1px var(--urm-c)}',
    '.urm-pulse[data-style="segmented"] .urm-pbar{' +
      'background-color:transparent;' +
      'background-image:repeating-linear-gradient(to bottom,var(--urm-c) 0,var(--urm-c) 6px,transparent 6px,transparent 11px)}',

    /* fuse：燃燒引信。條身由上方燒過的暗色漸變到火花處的亮色，底端火花閃爍、火星飛濺 */
    '.urm-pulse[data-style="fuse"] .urm-pbar{overflow:visible;' +
      'background:linear-gradient(to bottom,' +
      'color-mix(in srgb,var(--urm-c) 22%,#0C0D0C) 0%,' +
      'color-mix(in srgb,var(--urm-c) 80%,#0C0D0C) 100%)}',
    '.urm-pulse[data-style="fuse"] .urm-pbar::after{content:"";position:absolute;left:50%;' +
      'bottom:calc(var(--urm-tip,8px) * -.5);transform:translateX(-50%);' +
      'width:var(--urm-tip,8px);height:var(--urm-tip,8px);border-radius:50%;' +
      'background:radial-gradient(circle,#DBEDD8 0%,#DBEDD8 30%,var(--urm-c) 70%,var(--urm-c) 100%);' +
      'box-shadow:0 0 var(--urm-tip,8px) calc(var(--urm-tip,8px) * .35) var(--urm-c),' +
      '0 0 calc(var(--urm-tip,8px) * 2.5) calc(var(--urm-tip,8px) * .5) var(--urm-c);' +
      'animation:urm-fuse-spark 90ms ease-in-out infinite alternate}',
    '.urm-pulse[data-style="fuse"] .urm-pbar::before{content:"";position:absolute;' +
      'left:calc(50% + var(--urm-tip,8px) * .45);bottom:calc(var(--urm-tip,8px) * .4);' +
      'width:calc(var(--urm-tip,8px) * .35);height:calc(var(--urm-tip,8px) * .35);border-radius:50%;' +
      'background:color-mix(in srgb,var(--urm-c) 70%,#DBEDD8);' +
      'animation:urm-fuse-ember 130ms ease-in-out infinite alternate-reverse}',
    '.urm-pulse[data-style="fuse"] .urm-pbar:not(.urm-pa)::after,' +
    '.urm-pulse[data-style="fuse"] .urm-pbar:not(.urm-pa)::before,' +
    '.urm-pulse[data-style="fuse"] .urm-pbar.urm-pd::after,' +
    '.urm-pulse[data-style="fuse"] .urm-pbar.urm-pd::before{animation:none;display:none}',
    '@keyframes urm-fuse-spark{' +
      'from{transform:translateX(-50%) scale(1);opacity:1}' +
      'to{transform:translateX(-50%) scale(1.3);opacity:.85}}',
    '@keyframes urm-fuse-ember{' +
      'from{transform:translate(0,0) scale(1);opacity:.9}' +
      'to{transform:translate(3px,-4px) scale(.55);opacity:.3}}',

    '.urm-pbar2{position:absolute;left:var(--urm-pg2,9px);top:0;' +
      'width:var(--urm-pw2,2px);height:0;' +
      'border-radius:3px;pointer-events:none;opacity:0;transition:opacity .3s ease}',
    '.urm-pbar2.urm-pa{opacity:.62;height:100%;' +
      'transition:height var(--urm-ps2,3.3s) linear,opacity .3s ease}',
    '.urm-pbar2.urm-pd{opacity:0;transition:opacity .9s ease .4s}',

    '.urm-chalk{display:inline-block;position:relative;' +
      'vertical-align:baseline;cursor:crosshair;transition:color .25s ease}',
    '.urm-chalk-svg{position:absolute;overflow:visible;pointer-events:none}',
    '.urm-chalk-path{fill:none;stroke-linecap:round}',

    '.urm-cp{display:inline;position:relative;cursor:default;transition:color .2s ease}',
    '.urm-cp-dot{position:absolute;top:-8px;left:50%;' +
      'transform:translateX(-50%) scale(1);' +
      'width:5px;height:5px;border-radius:50%;' +
      'background:var(--urm-cp-c,#E3D322);' +
      'opacity:.65;pointer-events:none;' +
      'transition:transform .22s ease,opacity .22s ease}',
    '.urm-cp.urm-cp-lit{color:var(--urm-cp-c)}',
    '.urm-cp.urm-cp-lit .urm-cp-dot{transform:translateX(-50%) scale(2.2);opacity:1}'
  ].join('\n');

  var CSS_BTN = [
    'ui-btn{display:none}',

    '.ubtn-wrap{display:inline-block;vertical-align:middle}',

    '.ubtn{display:inline-flex;align-items:center;justify-content:center;' +
      'border:none;cursor:pointer;font-family:inherit;font-weight:600;' +
      'line-height:1;white-space:nowrap;user-select:none;outline:none;' +
      'box-sizing:border-box;position:relative;' +
      'transition:filter .2s ease,transform .12s ease,background .2s ease}',
    '.ubtn:not([disabled]):hover{filter:brightness(1.1)}',
    '.ubtn:not([disabled]):active{transform:scale(0.93)}',
    '.ubtn[disabled]{opacity:.48;cursor:not-allowed;pointer-events:none}',

    '.ubtn-fill{color:' + BG + ';background:var(--ubtn-c)}',
    '.ubtn-fill.is-open{filter:brightness(0.88)}',
    '.ubtn-fill.is-open:hover{filter:brightness(0.92)}',

    '.ubtn-outline{background:transparent;color:var(--ubtn-c);border:1.5px solid var(--ubtn-c)}',
    '.ubtn-outline:hover{background:var(--ubtn-ch);filter:none}',
    '.ubtn-outline.is-open{background:var(--ubtn-ch)}',

    '.ubtn-ghost{background:transparent;color:var(--ubtn-c)}',
    '.ubtn-ghost:hover{background:var(--ubtn-ch);filter:none}',
    '.ubtn-ghost.is-open{background:var(--ubtn-ch)}',

    '.ubtn-chev{display:inline-flex;align-items:center;flex-shrink:0;margin-left:2px;' +
      'transition:transform .28s ease}',
    '.ubtn.is-open .ubtn-chev{transform:rotate(180deg)}',

    '.ubtn-ico{display:inline-flex;align-items:center;flex-shrink:0;line-height:1}',
    '.ubtn-lbl{flex-shrink:0}',

    '.ubtn-dot{position:absolute;bottom:3px;right:3px;width:5px;height:5px;' +
      'border-radius:50%;opacity:0;transition:opacity .2s ease}',
    '.ubtn-fill .ubtn-dot{background:' + BG + '}',
    '.ubtn-outline .ubtn-dot,.ubtn-ghost .ubtn-dot{background:var(--ubtn-c)}',
    '.ubtn.is-open .ubtn-dot{opacity:1}',

    '.ubtn-gate-target{transition:opacity .4s ease}',
    '.ubtn-gate-locked{opacity:.5;pointer-events:none;user-select:none}',
    '@keyframes ubtn-gpulse{0%,100%{box-shadow:0 0 0 0 var(--ubtn-c,' +
      '#C6C7BD)}60%{box-shadow:0 0 0 11px #0C0D0C}}',
    '.ubtn-gate-cue{animation:ubtn-gpulse 2.2s ease-in-out infinite}',

    /* 揭曉儲存格時，格子內框短暫亮起按鈕顏色再收掉 */
    '@keyframes ubtn-cflash{0%{box-shadow:inset 0 0 0 3px var(--ubtn-c,#C6C7BD)}' +
      '100%{box-shadow:inset 0 0 0 0 var(--ubtn-c,#C6C7BD)}}',
    '.ubtn-cell-flash{animation:ubtn-cflash 1.2s ease-out}',

    '.ubtn-astack{position:fixed;left:50%;transform:translateX(-50%);z-index:9999;' +
      'display:flex;flex-direction:column;align-items:center;gap:8px;' +
      'pointer-events:none;max-width:calc(100vw - 32px)}',
    '.ubtn-astack-top{top:16px}',
    '.ubtn-astack-bottom{bottom:16px;flex-direction:column-reverse}',

    '.ubtn-alert{display:flex;align-items:center;gap:8px;' +
      'padding:10px 14px 10px 18px;border-radius:24px;' +
      'font-weight:600;font-size:1rem;line-height:1.4;' +
      'pointer-events:all;white-space:nowrap;max-width:88vw;' +
      'opacity:0;transition:opacity .25s ease,transform .25s ease}',
    '.ubtn-astack-top .ubtn-alert{transform:translateY(-14px)}',
    '.ubtn-astack-bottom .ubtn-alert{transform:translateY(14px)}',
    '.ubtn-alert.ubtn-alert-in{opacity:1;transform:translateY(0)}',

    '.ubtn-alert-x{background:none;border:none;cursor:pointer;' +
      'font-size:1.15rem;line-height:1;padding:0;margin-left:6px;' +
      'opacity:.65;font-weight:700;flex-shrink:0;transition:opacity .15s ease}',
    '.ubtn-alert-x:hover{opacity:1}'
  ].join('\n');

  (function () {
    if (document.getElementById('ui-components-css')) return;
    var s = document.createElement('style');
    s.id = 'ui-components-css';
    s.textContent = CSS_READING + '\n' + CSS_BTN;
    (document.head || document.documentElement).appendChild(s);
  })();

  var UR_CFG = global.UiReadingConfig = Object.assign({
    pulseColor:      'green',
    pulseColor2:     '',
    pulseStyle:      'solid',
    pulseSpeed:      2800,
    pulseWidth:      '3px',
    pulseWidth2:     '2px',
    pulseGap:        14,
    pulseGap2:       9,
    pulseTrigger:    'visible',
    pulseSparkSize:  8,
    chalkTheme:      'focus',
    chalkThickness:  2.5,
    chalkDuration:   420,
    chalkDirection:  'ltr',
    chalkArrowSize:  '8px'
  }, global.UiReadingConfig || {});

  function initPulse(el) {
    if (el.dataset.urm) return;
    el.dataset.urm = '1';

    var c       = clr(el.getAttribute('color')       || UR_CFG.pulseColor);
    var c2Raw   = el.getAttribute('color2')          || UR_CFG.pulseColor2;
    var c2      = c2Raw ? clr(c2Raw) : null;
    var style   = el.getAttribute('style')           || UR_CFG.pulseStyle;
    var speed   = +(el.getAttribute('speed')         || UR_CFG.pulseSpeed);
    var pw      = el.getAttribute('pulse-width')     || UR_CFG.pulseWidth;
    var pw2     = el.getAttribute('pulse-width-2')   || UR_CFG.pulseWidth2;
    var gap     = +(el.getAttribute('gap')           || UR_CFG.pulseGap);
    var gap2    = +(el.getAttribute('gap-2')         || UR_CFG.pulseGap2);
    var speed2  = +(el.getAttribute('speed-2')       || Math.round(speed * 1.15));
    var trigger = el.getAttribute('trigger')         || UR_CFG.pulseTrigger;
    var repeat  = el.hasAttribute('repeat');
    var spark   = +(el.getAttribute('spark-size')    || UR_CFG.pulseSparkSize) || 8;
    var isDouble = style === 'double';

    var wrap = document.createElement('div');
    wrap.className = 'urm-pulse';
    wrap.dataset.style = style;
    /* 保留原始屬性：其他元件用 innerHTML 複製本區塊時，副本會失去互動，靠這份紀錄重建 */
    var srcAttrs = {};
    Array.from(el.attributes).forEach(function (a) { if (a.name !== 'data-urm') srcAttrs[a.name] = a.value; });
    wrap.setAttribute('data-urm-pulse', JSON.stringify(srcAttrs));
    _livePulses.add(wrap);
    wrap.style.setProperty('--urm-ps', speed + 'ms');
    wrap.style.setProperty('--urm-pw', pw);
    wrap.style.setProperty('--urm-pg', (isDouble ? gap + gap2 : gap) + 'px');
    wrap.style.setProperty('--urm-c', c);
    if (c2) wrap.style.setProperty('--urm-c2', c2);
    if (isDouble) wrap.style.setProperty('--urm-ps2', speed2 + 'ms');
    if (style === 'fuse') wrap.style.setProperty('--urm-tip', Math.max(4, spark) + 'px');

    var bar = document.createElement('div');
    bar.className = 'urm-pbar';
    if (style !== 'gradient' && style !== 'segmented' && style !== 'fuse') bar.style.background = c;
    wrap.appendChild(bar);

    var bar2 = null;
    if (isDouble) {
      bar2 = document.createElement('div');
      bar2.className = 'urm-pbar2';
      bar2.style.background = c2 || c;
      bar2.style.left = gap + 'px';
      bar2.style.width = pw2;
      wrap.appendChild(bar2);
    }

    Array.from(el.childNodes).forEach(function (n) { wrap.appendChild(n); });
    el.replaceWith(wrap);

    var played = false, running = false;

    function pulse() {
      if (running) return;
      if (played && !repeat) return;
      played = running = true;
      bar.classList.remove('urm-pa', 'urm-pd');
      void bar.offsetHeight;
      bar.classList.add('urm-pa');
      if (bar2) {
        var delay = Math.round(speed * 0.18);
        setTimeout(function () {
          bar2.classList.remove('urm-pa', 'urm-pd');
          void bar2.offsetHeight;
          bar2.classList.add('urm-pa');
        }, delay);
      }
      setTimeout(function () {
        bar.classList.add('urm-pd');
        if (bar2) bar2.classList.add('urm-pd');
        setTimeout(function () {
          bar.classList.remove('urm-pa', 'urm-pd');
          if (bar2) bar2.classList.remove('urm-pa', 'urm-pd');
          running = false;
        }, 1400);
      }, speed + 300);
    }

    if (trigger === 'visible') {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          setTimeout(pulse, 180);
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

  function initChalk(el) {
    if (el.dataset.urm) return;
    el.dataset.urm = '1';

    var c         = clr(el.getAttribute('theme')     || UR_CFG.chalkTheme);
    var thick     = +(el.getAttribute('thickness')   || UR_CFG.chalkThickness);
    var dur       = +(el.getAttribute('duration')    || UR_CFG.chalkDuration);
    var preActive = el.hasAttribute('active');
    /* direction="rtl"：由右往左畫；arrow：終點加箭頭，可填尺寸（px、rem、em，純數字視為 px） */
    var rtl       = String(el.getAttribute('direction') || UR_CFG.chalkDirection).trim().toLowerCase() === 'rtl';
    var arrowRaw  = el.hasAttribute('arrow') ? (el.getAttribute('arrow') || '').trim() : null;
    if (arrowRaw === 'false' || arrowRaw === 'none') arrowRaw = null;
    /* arrow-to：弧線從本標記延伸到指定 id 的字（例如後位修飾所修飾的名詞），終點自動加箭頭，該字一併上色 */
    var arrowToId = (el.getAttribute('arrow-to') || '').replace(/^#/, '').trim();
    var arrowTarget = null, targetPrevColor = '';

    var wrap = document.createElement('span');
    wrap.className = 'urm-chalk';
    wrap.innerHTML = el.innerHTML;
    el.replaceWith(wrap);

    var svgEl = null, chalkPath = null, arrowPath = null, isActive = false;

    /* 箭頭尺寸換算成 px：rem 以根字級、em 以本元素字級為準 */
    function arrowSizePx() {
      var v = arrowRaw || String(UR_CFG.chalkArrowSize);
      var m = /^(\d*\.?\d+)\s*(px|rem|em)?$/i.exec(v);
      if (!m) { console.warn('[chalk-mark] arrow 尺寸格式無效（可用 8、8px、0.5rem、0.6em），已改用 8px：', v); return 8; }
      var n = parseFloat(m[1]), unit = (m[2] || 'px').toLowerCase();
      if (unit === 'rem') return n * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
      if (unit === 'em')  return n * (parseFloat(getComputedStyle(wrap).fontSize) || 16);
      return n;
    }
    var _animId = null;

    function animateDash(path, fromOffset, toOffset, onDone) {
      if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var t    = Math.min((ts - start) / dur, 1);
        var ease = 1 - Math.pow(1 - t, 3);
        var val  = fromOffset + (toOffset - fromOffset) * ease;
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

    function buildArc() {
      if (svgEl) { svgEl.remove(); svgEl = null; chalkPath = null; arrowPath = null; }
      if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
      var rect = wrap.getBoundingClientRect();
      var w    = rect.width;
      var h    = rect.height;
      var lift = Math.round(h * 0.6);
      var pad  = 3;
      var svgW = w + pad * 2;
      var svgH = lift + 6;

      svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('class', 'urm-chalk-svg');
      svgEl.style.cssText =
        'position:absolute;overflow:visible;pointer-events:none;' +
        'left:' + (-pad) + 'px;top:' + (-svgH) + 'px;' +
        'width:' + svgW + 'px;height:' + svgH + 'px';

      var x1 = pad, y1 = svgH - 2, cx = svgW / 2, cy = 3, x2 = svgW - pad, y2 = svgH - 2;
      if (rtl) { var tx = x1; x1 = x2; x2 = tx; }

      arrowTarget = arrowToId ? document.getElementById(arrowToId) : null;
      if (arrowToId && !arrowTarget && !wrap._urmWarned) {
        wrap._urmWarned = true;
        console.warn('[chalk-mark] arrow-to 找不到 id="' + arrowToId + '"，改畫一般弧線。');
      }
      if (arrowTarget) {
        /* 座標以本標記左上角為原點：起點在本標記上緣中央，終點在目標字上緣中央（取最靠近的那一行） */
        var sx = w / 2, sy = -2;
        var best = null, bestD = Infinity;
        Array.prototype.forEach.call(arrowTarget.getClientRects(), function (r) {
          var mx = r.left + r.width / 2 - rect.left, my = r.top - rect.top;
          var dd = Math.abs(mx - sx) + Math.abs(my - sy);
          if (dd < bestD) { bestD = dd; best = { x: mx, y: my, h: r.height }; }
        });
        if (!best) { var br = arrowTarget.getBoundingClientRect(); best = { x: br.left + br.width / 2 - rect.left, y: br.top - rect.top, h: br.height }; }
        /* 三次曲線，三種情況：
           同一行：兩端都往上，像一座橋，箭頭朝下指著目標字。
           目標在上方的行：從本標記上緣出發，走行距之間的空隙，箭頭從目標字下方往上指，不穿過文字。
           目標在下方的行：反過來，從本標記下緣出發，箭頭從目標字上方往下指。 */
        var ex = best.x, ey, c1x, c1y, c2x, c2y, k;
        /* 跨行且幾乎上下對齊時，起點沿本標記上（下）緣往旁邊挪，讓曲線有水平距離，箭頭才不會擠成一團 */
        if (Math.abs(best.y) > h * 0.5 && Math.abs(ex - sx) < h * 2.5) {
          var room = h * 3;
          sx = (ex + room <= w - 4) ? ex + room : Math.max(4, ex - room);
        }
        if (best.y < -h * 0.5) {
          sy = -2; ey = best.y + best.h + 2;
          k = Math.max(Math.abs(sy - ey) * 0.55, h * 0.4);
          c1x = sx; c1y = sy - k; c2x = ex; c2y = ey + k;
        } else if (best.y > h * 0.5) {
          sy = h + 2; ey = best.y - 2;
          k = Math.max(Math.abs(ey - sy) * 0.55, h * 0.4);
          c1x = sx; c1y = sy + k; c2x = ex; c2y = ey - k;
        } else {
          ey = best.y - 2;
          var dist = Math.abs(ex - sx);
          k = Math.max(h * 0.8, Math.min(dist * 0.3, h * 2));
          c1x = sx; c1y = sy - k; c2x = ex; c2y = ey - k;
        }
        x1 = sx; y1 = sy; x2 = ex; y2 = ey;
        cx = c2x; cy = c2y;   /* 箭頭切線：第二控制點指向終點 */
        svgEl.style.cssText = 'position:absolute;overflow:visible;pointer-events:none;left:0;top:0;width:1px;height:1px';
      }
      var d = arrowTarget
        ? 'M ' + x1 + ' ' + y1 + ' C ' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + x2 + ' ' + y2
        : 'M ' + x1 + ' ' + y1 + ' Q ' + cx + ' ' + cy + ' ' + x2 + ' ' + y2;

      chalkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      chalkPath.setAttribute('fill',           'none');
      chalkPath.setAttribute('stroke',         c);
      chalkPath.setAttribute('stroke-width',   thick);
      chalkPath.setAttribute('stroke-linecap', 'round');
      chalkPath.setAttribute('d',              d);
      svgEl.appendChild(chalkPath);

      if (arrowRaw !== null || arrowTarget) {
        /* 箭頭方向沿終點的切線（二次曲線終點切線為控制點指向終點） */
        var size  = Math.max(3, arrowSizePx());
        var ang   = Math.atan2(y2 - cy, x2 - cx);
        var wing  = Math.PI / 6.5;
        var ax1 = x2 - size * Math.cos(ang - wing), ay1 = y2 - size * Math.sin(ang - wing);
        var ax2 = x2 - size * Math.cos(ang + wing), ay2 = y2 - size * Math.sin(ang + wing);
        arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('fill',            'none');
        arrowPath.setAttribute('stroke',          c);
        arrowPath.setAttribute('stroke-width',    thick);
        arrowPath.setAttribute('stroke-linecap',  'round');
        arrowPath.setAttribute('stroke-linejoin', 'round');
        arrowPath.setAttribute('d', 'M ' + ax1.toFixed(2) + ' ' + ay1.toFixed(2) + ' L ' + x2 + ' ' + y2 +
                                    ' L ' + ax2.toFixed(2) + ' ' + ay2.toFixed(2));
        arrowPath.style.opacity    = '0';
        arrowPath.style.transition = 'opacity .16s ease';
        svgEl.appendChild(arrowPath);
      }
      wrap.appendChild(svgEl);

      var len = chalkPath.getTotalLength();
      chalkPath.setAttribute('stroke-dasharray',  len);
      chalkPath.setAttribute('stroke-dashoffset', len);
      return len;
    }

    function activate() {
      isActive = true;
      wrap.style.color = c;
      var len = buildArc();
      if (arrowTarget) {
        targetPrevColor = arrowTarget.style.color;
        arrowTarget.style.transition = 'color .25s ease';
        arrowTarget.style.color = c;
      }
      if (len < 1) return;
      var _arrow = arrowPath;
      animateDash(chalkPath, len, 0, function () {
        if (_arrow && _arrow.isConnected && isActive) _arrow.style.opacity = '1';
      });
    }

    function deactivate() {
      isActive = false;
      wrap.style.color = '';
      if (arrowTarget) arrowTarget.style.color = targetPrevColor;
      if (!chalkPath) return;
      var len     = parseFloat(chalkPath.getAttribute('stroke-dasharray'))  || 0;
      var current = parseFloat(chalkPath.getAttribute('stroke-dashoffset')) || 0;
      var _path = chalkPath, _svg = svgEl;
      if (arrowPath) { arrowPath.style.transition = 'none'; arrowPath.style.opacity = '0'; }
      svgEl = null; chalkPath = null; arrowPath = null;
      animateDash(_path, current, len, function () {
        if (_svg && _svg.parentNode) _svg.remove();
      });
    }

    wrap.addEventListener('click', function () {
      if (isActive) {
        var arcLen = chalkPath ? parseFloat(chalkPath.getAttribute('stroke-dasharray')) || 0 : 0;
        if (arcLen < 1) {
          if (svgEl) { svgEl.remove(); svgEl = null; chalkPath = null; arrowPath = null; }
          isActive = false;
          activate();
          return;
        }
        deactivate();
      } else {
        activate();
      }
    });

    /* arrow-to 的弧線跨越兩個元素，版面改變（視窗縮放、換行）時重畫到新位置 */
    if (arrowToId) {
      var _rzRaf = 0;
      window.addEventListener('resize', function () {
        if (!isActive || !chalkPath) return;
        cancelAnimationFrame(_rzRaf);
        _rzRaf = requestAnimationFrame(function () {
          if (!isActive) return;
          buildArc();
          if (chalkPath) chalkPath.setAttribute('stroke-dashoffset', 0);
          if (arrowPath) { arrowPath.style.transition = 'none'; arrowPath.style.opacity = '1'; }
        });
      });
    }

    if (preActive) {
      setTimeout(function () {
        var r = wrap.getBoundingClientRect();
        if (r.width > 0) {
          activate();
        } else {
          var io = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) { io.disconnect(); activate(); }
          }, { threshold: 0.01 });
          io.observe(wrap);
        }
      }, 80);
    }
  }

  var _cpPalette = [
    BRAND.yellow, BRAND.blue,   BRAND.violet,   BRAND.green,
    BRAND.playful, BRAND.pink,   BRAND.red,      BRAND.indigo,
    BRAND.vanilla, BRAND.gray
  ];
  var _cpPaletteIdx = 0;
  var _cpGroups = {};

  function initColPairs() {
    var els = Array.from(document.querySelectorAll('col-pair:not([data-urm])'));
    if (!els.length) return;

    els.forEach(function (el) {
      var gid   = el.getAttribute('group') || '_nogroup';
      var theme = el.getAttribute('theme');
      var label = el.getAttribute('label') || '';
      if (!_cpGroups[gid]) {
        var c = theme ? clr(theme) : _cpPalette[_cpPaletteIdx++ % _cpPalette.length];
        _cpGroups[gid] = { color: c, members: [], label: label, _hasTheme: !!theme };
      }
      if (theme && !_cpGroups[gid]._hasTheme) {
        _cpGroups[gid].color = clr(theme);
        _cpGroups[gid]._hasTheme = true;
      }
      if (label && !_cpGroups[gid].label) _cpGroups[gid].label = label;
    });

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

      var dot = document.createElement('span');
      dot.className = 'urm-cp-dot';
      wrap.insertBefore(dot, wrap.firstChild);

      el.replaceWith(wrap);
      grp.members.push(wrap);
      registry.push({ wrap: wrap, gid: gid });
    });

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

  /* 已綁定互動的 read-pulse 外框；不在這裡的 .urm-pulse 就是被複製出來的副本 */
  var _livePulses = typeof WeakSet === 'function' ? new WeakSet() : { add: function () {}, has: function () { return true; } };

  /* 把失去互動的副本還原成 <read-pulse> 再重新初始化 */
  function revivePulse(wrap) {
    if (_livePulses.has(wrap)) return;
    var attrs = {};
    try { attrs = JSON.parse(wrap.getAttribute('data-urm-pulse') || '{}'); } catch (e) { attrs = {}; }
    var rp = document.createElement('read-pulse');
    Object.keys(attrs).forEach(function (k) { rp.setAttribute(k, attrs[k]); });
    Array.from(wrap.childNodes).forEach(function (n) {
      if (n.nodeType === 1 && (n.classList.contains('urm-pbar') || n.classList.contains('urm-pbar2'))) return;
      rp.appendChild(n);
    });
    wrap.replaceWith(rp);
    initPulse(rp);
  }

  function bootReading() {
    document.querySelectorAll('.urm-pulse[data-urm-pulse]').forEach(revivePulse);
    document.querySelectorAll('read-pulse:not([data-urm])').forEach(initPulse);
    document.querySelectorAll('chalk-mark:not([data-urm])').forEach(initChalk);
    initColPairs();
  }

  var UB_CFG = global.UiBtnConfig = Object.assign({
    theme:        'shell',
    size:         'md',
    variant:      'fill',
    animation:    'slide',
    animDuration: 320,
    chevron:      false
  }, global.UiBtnConfig || {});

  var SIZES = {
    sm: { fs: '0.85rem', pad: '5px 12px',  r: '20px', dim: '32px', gap: '5px', icoFs: '1rem'    },
    md: { fs: '1rem',    pad: '8px 16px',  r: '24px', dim: '40px', gap: '6px', icoFs: '1.15rem' },
    lg: { fs: '1.1rem',  pad: '10px 20px', r: '28px', dim: '48px', gap: '8px', icoFs: '1.3rem'  }
  };

  /* size 除了 sm/md/lg，也接受字級長度：2rem、1.5em、24px，純數字視為 rem。
     以 md（1rem）為基準等比例換算，內距、圓角、間距、直徑一律輸出 px。 */
  function resolveBtnSize(val, el) {
    var key = String(val || '').trim().toLowerCase();
    if (SIZES[key]) return SIZES[key];
    var m = key.match(/^(\d*\.?\d+)\s*(rem|em|px)?$/);
    if (!m || !(+m[1] > 0)) {
      console.warn('[ui-btn] size 格式無效（可用 sm、md、lg，或 2rem、1.5em、24px 等長度），已改用 md：', val);
      return SIZES.md;
    }
    var rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    var unit = m[2] || 'rem';
    var px = +m[1];
    if (unit === 'rem') px *= rootPx;
    else if (unit === 'em') {
      var host = (el && el.parentElement) || document.documentElement;
      px *= parseFloat(getComputedStyle(host).fontSize) || rootPx;
    }
    var k = px / rootPx;
    var p = function (n) { return Math.max(1, Math.round(n * k)) + 'px'; };
    return {
      fs: +k.toFixed(4) + 'rem', pad: p(8) + ' ' + p(16), r: p(24), dim: p(40), gap: p(6),
      icoFs: +(k * 1.15).toFixed(4) + 'rem', chev: p(11), dot: p(5), dotOff: p(3), custom: true
    };
  }

  function parseUnlockChunk(val) {
    if (!val) return [];
    return val.split(',').reduce(function (acc, seg) {
      seg = seg.trim();
      var parts = seg.split(':');
      if (parts.length !== 2) {
        console.warn('[ui-btn] unlock-chunk 格式錯誤（應為 "demoId:chunkId"）：', seg);
        return acc;
      }
      var demoId  = parts[0].trim();
      var chunkId = parseInt(parts[1].trim(), 10);
      if (!demoId || isNaN(chunkId)) {
        console.warn('[ui-btn] unlock-chunk 解析失敗：', seg);
        return acc;
      }
      acc.push({ demoId: demoId, chunkId: chunkId });
      return acc;
    }, []);
  }

  /* "a, b c,#d" → ['a','b','c','d']：逗號或空白分隔，開頭的 # 可省略，重複的 id 只算一次 */
  function parseIdList(val) {
    var out = [];
    String(val || '').split(/[\s,]+/).forEach(function (s) {
      s = s.replace(/^#/, '').trim();
      if (s && out.indexOf(s) < 0) out.push(s);
    });
    return out;
  }

  /* <template> 本身不會顯示。第一次展開時把內容複製到緊接在 template 後面的 <div>，
     之後的開合都作用在這個 <div>。同一個 template 被多顆按鈕指向時共用同一份輸出。
     template 的 class 與 style 會帶到輸出的 <div>。 */
  function renderTemplate(tpl, btn) {
    if (tpl._ubtnOut && tpl._ubtnOut.isConnected) return tpl._ubtnOut;
    var box = document.createElement('div');
    box.className = 'ubtn-tpl-out' + (tpl.className ? ' ' + tpl.className : '');
    var st = tpl.getAttribute('style');
    if (st) box.setAttribute('style', st);
    if (tpl.id) box.setAttribute('data-ubtn-from', tpl.id);
    box.style.display = 'none';
    box.appendChild(tpl.content.cloneNode(true));
    tpl.after(box);
    tpl._ubtnOut = box;
    /* 內容裡若有 ui-btn、read-pulse 等本檔元件，一併初始化 */
    boot();
    tpl.dispatchEvent(new CustomEvent('ubtn-template-rendered', {
      bubbles: true,
      detail: { template: tpl, output: box, button: btn ? btn.el : null }
    }));
    return box;
  }

  function mkIco(name) {
    if (!name) return '';
    if (/^bi-/.test(name)) {
      return '<span class="ubtn-ico"><i class="bi ' + name + '" aria-hidden="true"></i></span>';
    }
    return '';
  }

  var CHEV_SVG = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none"' +
    ' stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M6 9 12 15 18 9"/></svg>';

  var _groups        = {};
  var _gateInstances = [];
  var _gateInited    = false;
  var _gateLimit     = null;

  function _calcGateLimit() {
    var limit = null;
    for (var i = 0; i < _gateInstances.length; i++) {
      var g = _gateInstances[i];
      if (!g.isOpen && g._wrap) {
        var rect   = g._wrap.getBoundingClientRect();
        var absTop = rect.top + window.pageYOffset;
        if (limit === null || absTop < limit) limit = absTop;
      }
    }
    return limit;
  }

  function _syncGateLimit() {
    _gateLimit = _calcGateLimit();
    if (_gateLimit !== null && window.pageYOffset > _gateLimit) {
      window.scrollTo({ top: _gateLimit, behavior: 'smooth' });
    }
  }

  function _initGate() {
    if (_gateInited) return;
    _gateInited = true;
    var MARGIN = 2;

    function blocked(dy) {
      return dy > 0 && _gateLimit !== null &&
        window.pageYOffset >= _gateLimit - MARGIN;
    }

    window.addEventListener('wheel', function (e) {
      if (blocked(e.deltaY)) e.preventDefault();
    }, { passive: false });

    var _ty = 0;
    window.addEventListener('touchstart', function (e) {
      _ty = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (blocked(_ty - e.touches[0].clientY)) e.preventDefault();
    }, { passive: false });

    var _downKeys = ['ArrowDown', 'PageDown', 'End'];
    window.addEventListener('keydown', function (e) {
      var isDown = _downKeys.indexOf(e.key) >= 0 || (e.key === ' ' && !e.shiftKey);
      if (isDown && blocked(1)) e.preventDefault();
    });

    var _snapping = false;
    window.addEventListener('scroll', function () {
      if (_gateLimit === null || _snapping) return;
      if (window.pageYOffset > _gateLimit) {
        _snapping = true;
        window.scrollTo(0, _gateLimit);
        setTimeout(function () { _snapping = false; }, 60);
      }
    }, { passive: true });
  }

  function UiBtn(el) {
    this.el          = el;
    this.icon        = el.getAttribute('icon')         || '';
    this.iconActive  = el.getAttribute('icon-active')  || '';
    this.theme       = el.getAttribute('theme')        || UB_CFG.theme;
    this.size        = el.getAttribute('size')         || UB_CFG.size;
    this.variant     = el.getAttribute('variant')      || UB_CFG.variant;
    this.animation   = el.getAttribute('animation')    || UB_CFG.animation;
    this.animDur     = parseInt(el.getAttribute('anim-duration')) || UB_CFG.animDuration;
    this.hasChevron  = el.hasAttribute('chevron')      || !!UB_CFG.chevron;
    this.startOpen   = el.hasAttribute('open');
    this.disabled    = el.hasAttribute('disabled');
    /* target 與 targets 都可填多個 id（逗號或空白分隔），兩者合併 */
    this.targetIds   = parseIdList((el.getAttribute('target') || '') + ',' +
                                   (el.getAttribute('targets') || ''));
    this.targetId    = this.targetIds[0] || '';
    /* remove-target：點擊後把這些 id 的元素從網頁移除，重新整理前不會復原 */
    this.removeIds   = parseIdList(el.getAttribute('remove-target') || '');
    this.stagger     = Math.max(0, parseInt(el.getAttribute('stagger'), 10) || 0);

    /* 搭配 mini-table.js：揭曉表格裡指定的儲存格（座標同 Excel，表頭算第 1 列）。
       min-table-id 是 mini-table-id 的別名，少打一個字母也能用 */
    this.cellTableId  = (el.getAttribute('mini-table-id') || el.getAttribute('min-table-id') || '')
                          .replace(/^#/, '').trim();
    this.cellSpec     = el.getAttribute('target-cell') || '';
    this.cellContent  = el.getAttribute('target-cell-content');
    this.cellSourceId = (el.getAttribute('target-cell-source') || '').replace(/^#/, '').trim();
    this._cellRefs    = [];
    this.href        = el.getAttribute('href')         || '';
    this.hrefTarget  = el.getAttribute('href-target')  || '_self';
    this.labelClosed = el.textContent.trim();
    this.labelOpen   = el.getAttribute('label-open')   || '';
    this.group       = el.getAttribute('group')        || '';
    this.tooltip     = el.getAttribute('tooltip')      || '';

    this.alertMsg  = el.getAttribute('alert') || '';
    this.alertOpts = {
      theme:    el.getAttribute('alert-theme')    || '',
      position: el.getAttribute('alert-position') || 'top',
      duration: el.hasAttribute('alert-duration') ? el.getAttribute('alert-duration') : null,
      width:    el.getAttribute('alert-width')    || '',
      icon:     el.getAttribute('alert-icon')     || ''
    };

    this.unlockChunkTargets = parseUnlockChunk(el.getAttribute('unlock-chunk') || '');
    this.scrollGate         = el.hasAttribute('scroll-gate');

    this.color   = resolveColor(this.theme) || BRAND.shell;
    this.isOpen  = false;
    this._target = null;
    this._items  = [];
    this._timers = [];
    this._btn    = null;
    this._lbl    = null;
    this._icoEl  = null;
    this._wrap   = null;

    var ns = el.nextElementSibling;
    while (ns && ns.tagName && ns.tagName.toLowerCase() === 'ui-btn') {
      ns = ns.nextElementSibling;
    }
    this._nextSib = ns || null;
  }

  UiBtn.prototype.init = function () {
    var self = this;
    this._render();

    var srcs = [];
    if (this.targetIds.length) {
      this.targetIds.forEach(function (id) {
        var t = document.getElementById(id);
        if (t) srcs.push(t);
        else console.warn('[ui-btn] 找不到 target: #' + id);
      });
    } else if (!this.href && !this.cellTableId && !this.removeIds.length) {
      if (this._nextSib) srcs.push(this._nextSib);
      else if (!this.alertMsg) console.warn('[ui-btn] 找不到目標元素，請設定 target 或 targets 屬性。');
    }
    if (this.cellTableId && !this.cellSpec) {
      console.warn('[ui-btn] 有 mini-table-id="' + this.cellTableId + '" 但沒有 target-cell，請指定儲存格，例如 target-cell="B2"。');
    }
    this._items = srcs.map(function (src) {
      var isTpl = src.tagName.toLowerCase() === 'template';
      return { src: src, tpl: isTpl, el: isTpl ? (src._ubtnOut || null) : src };
    });

    if (this.scrollGate) {
      this.isOpen = this.startOpen;
      if (this._items.length) {
        this._items.forEach(function (it) {
          var el = self._itemEl(it);
          showEl(el);
          el.classList.add('ubtn-gate-target');
          if (!self.isOpen) el.classList.add('ubtn-gate-locked');
        });
        if (!this.isOpen) this._btn.classList.add('ubtn-gate-cue');
        _gateInstances.push(this);
        _initGate();
        setTimeout(_syncGateLimit, 0);
      }
    } else if (this._items.length) {
      if (this.startOpen) {
        this._items.forEach(function (it) {
          var el = self._itemEl(it);
          if (!isShown(el)) showEl(el);
        });
        this.isOpen = true;
      } else {
        /* 全部目標都已顯示才算展開；template 尚未渲染一律視為隱藏 */
        this.isOpen = this._items.every(function (it) { return isShown(self._itemEl(it, true)); });
      }
    } else {
      this.isOpen = this.startOpen;
    }
    /* 有指定儲存格時，除非寫了 open，一律從「未揭曉」開始 */
    if (this.cellTableId && this.cellSpec) {
      if (this.startOpen) {
        var tblEl = document.getElementById(this.cellTableId);
        var reveal = function () { self._revealCells(0, false); };
        if (tblEl && typeof tblEl.setCell !== 'function' && global.customElements) {
          customElements.whenDefined('mini-table').then(function () { setTimeout(reveal, 0); });
        } else {
          reveal();
        }
      } else {
        this.isOpen = false;
      }
    }
    this._target = this._items.length ? this._itemEl(this._items[0], true) : null;

    this._syncBtn();

    if (this.isOpen && this.unlockChunkTargets.length) {
      var self = this;
      setTimeout(function () { self._applyChunkLock(false); }, 0);
    }
  };

  UiBtn.prototype._render = function () {
    var self     = this;
    var sz       = resolveBtnSize(this.size, this.el);
    var hasText  = !!this.labelClosed;
    var iconOnly = !hasText;
    var hoverBg  = blendColor(this.color, 0.22);

    var wrap = document.createElement('span');
    wrap.className = 'ubtn-wrap';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ubtn ubtn-' + this.variant;
    if (this.disabled) btn.setAttribute('disabled', '');
    if (this.tooltip)  btn.title = this.tooltip;
    btn.style.cssText = '--ubtn-c:' + this.color + ';--ubtn-ch:' + hoverBg;

    if (iconOnly) {
      btn.style.width        = sz.dim;
      btn.style.height       = sz.dim;
      btn.style.borderRadius = '50%';
      btn.style.fontSize     = sz.icoFs;
    } else {
      btn.style.padding      = sz.pad;
      btn.style.borderRadius = sz.r;
      btn.style.gap          = sz.gap;
      btn.style.fontSize     = sz.fs;
    }

    if (this.icon) {
      btn.insertAdjacentHTML('beforeend', mkIco(this.icon));
      this._icoEl = btn.querySelector('.ubtn-ico i');
    }

    if (hasText) {
      var lbl = document.createElement('span');
      lbl.className   = 'ubtn-lbl';
      lbl.textContent = this.labelClosed;
      btn.appendChild(lbl);
      this._lbl = lbl;
    }

    if (this.hasChevron) {
      var chev = document.createElement('span');
      chev.className = 'ubtn-chev';
      chev.innerHTML = CHEV_SVG;
      if (sz.custom) {
        chev.firstChild.setAttribute('width', parseInt(sz.chev, 10));
        chev.firstChild.setAttribute('height', parseInt(sz.chev, 10));
      }
      btn.appendChild(chev);
    }

    if (iconOnly) {
      var dot = document.createElement('span');
      dot.className = 'ubtn-dot';
      if (sz.custom) {
        dot.style.width  = sz.dot;
        dot.style.height = sz.dot;
        dot.style.right  = sz.dotOff;
        dot.style.bottom = sz.dotOff;
      }
      btn.appendChild(dot);
    }

    btn.addEventListener('click', function (e) {
      if ((!self.href && !self.removeIds.length) || self.targetIds.length || self.cellTableId) self._toggle();
      if (self.removeIds.length) self._removeTargets();
      if (self.alertMsg) showAlert(self.alertMsg, self.alertOpts);
      if (self.href) {
        var t = self.hrefTarget;
        if (e.ctrlKey || e.metaKey || t === '_blank') {
          window.open(self.href, '_blank', 'noopener');
        } else if (t === '_self') {
          window.location.href = self.href;
        } else {
          window.open(self.href, t);
        }
      }
    });
    wrap.appendChild(btn);
    this.el.before(wrap);
    this.el.style.display = 'none';
    this._btn  = btn;
    this._wrap = wrap;
  };

  /* 移除 remove-target 指定的元素：依 animation 收合後從網頁刪除，不可復原。
     按鈕若沒有其他功能（展開、跳頁、提示、儲存格、解鎖），全部移除後改為停用 */
  UiBtn.prototype._removeTargets = function () {
    var self = this, removed = [], missing = [];
    var dur = this.animation === 'none' ? 0 : this.animDur;
    this.removeIds.forEach(function (id) {
      var t = document.getElementById(id);
      if (!t) { if ((self._removed || []).indexOf(id) < 0) missing.push(id); return; }
      if (t._ubtnRemoving) return;
      t._ubtnRemoving = true;
      removed.push(id);
      (self._removed = self._removed || []).push(id);
      if (!dur || !isShown(t)) { t.remove(); return; }
      animClose(t, self.animation, dur);
      setTimeout(function () { t.remove(); if (_gateInstances.length) _syncGateLimit(); }, dur + 60);
    });
    if (missing.length) console.warn('[ui-btn] remove-target 找不到元素（可能已經移除）：#' + missing.join('、#'));
    if (_gateInstances.length) _syncGateLimit();
    var onlyRemove = !this.targetIds.length && !this.href && !this.alertMsg && !this.cellTableId && !this.unlockChunkTargets.length;
    var left = this.removeIds.some(function (id) {
      var t = document.getElementById(id);
      return t && !t._ubtnRemoving;
    });
    if (onlyRemove && !left) {
      this.disabled = true;
      this._btn.setAttribute('disabled', '');
    }
    if (removed.length) {
      this.el.dispatchEvent(new CustomEvent('ubtn-removed', {
        bubbles: true, detail: { ids: removed, button: this.el }
      }));
    }
  };

  UiBtn.prototype._toggle = function () {
    var self = this;
    if (this.isOpen) {
      this._close();
    } else {
      if (this.group && _groups[this.group]) {
        _groups[this.group].forEach(function (b) {
          if (b !== self && b.isOpen) b._close();
        });
      }
      this._open();
    }
  };

  /* 取得目標實際要開合的元素；template 會在這裡渲染（peek 為 true 時只查詢不渲染） */
  UiBtn.prototype._itemEl = function (it, peek) {
    if (!it.tpl) return it.src;
    it.el = peek ? (it.src._ubtnOut || null) : renderTemplate(it.src, this);
    return it.el;
  };

  UiBtn.prototype._clearTimers = function () {
    this._timers.forEach(clearTimeout);
    this._timers = [];
  };

  UiBtn.prototype._open = function () {
    var self = this;
    this._clearTimers();
    this.isOpen = true;
    this._syncBtn();
    var k = 0;
    if (this._items.length) {
      if (this.scrollGate) {
        this._items.forEach(function (it) {
          self._itemEl(it).classList.remove('ubtn-gate-locked');
        });
        this._btn.classList.remove('ubtn-gate-cue');
        _syncGateLimit();
      } else {
        /* 依 targets 的順序展開；有 stagger 時每個間隔 stagger 毫秒。已顯示的不重播動畫 */
        this._items.forEach(function (it) {
          var el = self._itemEl(it);
          if (isShown(el)) return;
          var delay = self.stagger * k++;
          if (!delay) { animOpen(el, self.animation, self.animDur); return; }
          el.style.display = 'none';
          self._timers.push(setTimeout(function () {
            if (self.isOpen) animOpen(el, self.animation, self.animDur);
          }, delay));
        });
      }
    }
    /* 儲存格接在元素之後，延續同一個 stagger 順序 */
    this._revealCells(k, this.animation !== 'none');
    this._applyChunkLock(false);
  };

  /* 依 | 切開內容；\| 視為文字的 |（與 mini-table 的寫法相同） */
  function splitCellContent(text) {
    var MARK = '\u0000';
    return String(text).replace(/\\\|/g, MARK).split('|').map(function (s) {
      return s.replace(/\u0000/g, '|').trim();
    });
  }

  /* 找到表格並展開座標，回傳 { tbl, refs, contents }；找不到時警告並回傳 null */
  UiBtn.prototype._cellPlan = function () {
    if (!this.cellTableId || !this.cellSpec) return null;
    var tbl = document.getElementById(this.cellTableId);
    if (!tbl) {
      console.warn('[ui-btn] 找不到 mini-table #' + this.cellTableId);
      return null;
    }
    if (typeof tbl.resolveCells !== 'function') {
      console.warn('[ui-btn] #' + this.cellTableId + ' 不支援儲存格操作，請確認已載入新版 mini-table.js。');
      return null;
    }
    var refs = tbl.resolveCells(this.cellSpec);
    if (!refs.length) return null;

    /* 內容來源：target-cell-source（template 或元素）優先，其次 target-cell-content */
    var raw = null;
    if (this.cellSourceId) {
      var src = document.getElementById(this.cellSourceId);
      if (src) raw = src.innerHTML;
      else console.warn('[ui-btn] 找不到 target-cell-source #' + this.cellSourceId);
    }
    if (raw == null) raw = this.cellContent;
    if (raw == null) {
      console.warn('[ui-btn] 沒有要顯示的內容，請設定 target-cell-content 或 target-cell-source。');
      raw = '';
    }

    /* 單格：整段內容照用；多格：用 | 分成每一格的內容，只有一段時每格都用同一段 */
    var contents;
    if (refs.length === 1) {
      contents = [String(raw).replace(/\\\|/g, '|').trim()];
    } else {
      var parts = splitCellContent(raw);
      if (parts.length === 1) {
        contents = refs.map(function () { return parts[0]; });
      } else {
        if (parts.length !== refs.length) {
          console.warn('[ui-btn] target-cell 有 ' + refs.length + ' 格（' + refs.join('、') + '），內容卻有 ' +
            parts.length + ' 段，請用 | 分隔，一格一段。多的略過，少的留空。');
        }
        contents = refs.map(function (r, i) { return parts[i] != null ? parts[i] : ''; });
      }
    }
    return { tbl: tbl, refs: refs, contents: contents };
  };

  /* 揭曉儲存格：k 是 stagger 的起始序號，animate 為 false 時直接顯示 */
  UiBtn.prototype._revealCells = function (k, animate) {
    var self = this;
    var plan = this._cellPlan();
    if (!plan) return k;
    this._cellRefs = plan.refs.slice();
    plan.refs.forEach(function (ref, i) {
      var html = '<span class="ubtn-cell">' + plan.contents[i] + '</span>';
      var run = function () {
        if (!self.isOpen) return;
        var td = plan.tbl.setCell(ref, html);
        if (!td || !animate) return;
        var sp = td.querySelector('.ubtn-cell');
        if (sp) fadeInline(sp, true, self.animDur);
        td.style.setProperty('--ubtn-c', self.color);
        td.classList.remove('ubtn-cell-flash');
        void td.offsetWidth;
        td.classList.add('ubtn-cell-flash');
      };
      var delay = animate ? self.stagger * k++ : 0;
      if (delay) self._timers.push(setTimeout(run, delay));
      else run();
    });
    return k;
  };

  /* 收回儲存格：淡出後恢復原始內容 */
  UiBtn.prototype._hideCells = function () {
    var self = this;
    if (!this._cellRefs.length) return;
    var tbl = document.getElementById(this.cellTableId);
    if (!tbl || typeof tbl.resetCell !== 'function') return;
    var refs = this._cellRefs;
    this._cellRefs = [];
    var animate = this.animation !== 'none';
    refs.forEach(function (ref) {
      var td = tbl.cellAt(ref, true);
      var sp = td && td.querySelector('.ubtn-cell');
      if (!animate || !sp) { tbl.resetCell(ref); return; }
      fadeInline(sp, false, self.animDur);
      self._timers.push(setTimeout(function () {
        if (!self.isOpen) tbl.resetCell(ref);
      }, self.animDur + 20));
    });
  };

  /* 格子裡的內容只做淡入淡出（格子本身的框線與底色不動） */
  function fadeInline(el, show, dur) {
    el.style.transition = 'none';
    el.style.opacity = show ? '0' : '1';
    void el.offsetWidth;
    rAF2(function () {
      el.style.transition = 'opacity ' + dur + 'ms ease';
      el.style.opacity = show ? '1' : '0';
    });
  }

  UiBtn.prototype._close = function () {
    var self = this;
    this._clearTimers();
    this.isOpen = false;
    this._syncBtn();
    if (this._items.length) {
      if (this.scrollGate) {
        this._items.forEach(function (it) {
          self._itemEl(it).classList.add('ubtn-gate-locked');
        });
        this._btn.classList.add('ubtn-gate-cue');
        _syncGateLimit();
      } else {
        /* 收合一律同時進行；尚未渲染的 template 不需處理 */
        this._items.forEach(function (it) {
          var el = self._itemEl(it, true);
          if (isShown(el)) animClose(el, self.animation, self.animDur);
        });
      }
    }
    this._hideCells();
    this._applyChunkLock(true);
  };

  UiBtn.prototype._applyChunkLock = function (lock) {
    if (!this.unlockChunkTargets.length) return;
    this.unlockChunkTargets.forEach(function (t) {
      var el = document.getElementById(t.demoId);
      if (!el) {
        console.warn('[ui-btn] unlock-chunk：找不到 chunk-demo #' + t.demoId);
        return;
      }
      var method = lock ? 'lockChunk' : 'unlockChunk';
      if (typeof el[method] === 'function') {
        el[method](t.chunkId);
      } else {
        console.warn('[ui-btn] unlock-chunk：#' + t.demoId + ' 不支援 ' + method + '()，請確認已載入 chunk-demo.js');
      }
    });
  };

  UiBtn.prototype._syncBtn = function () {
    if (!this._btn) return;
    this._btn.classList.toggle('is-open', this.isOpen);
    if (this._icoEl) {
      this._icoEl.className = (this.isOpen && this.iconActive)
        ? 'bi ' + this.iconActive
        : 'bi ' + this.icon;
    }
    if (this._lbl) {
      this._lbl.textContent = (this.isOpen && this.labelOpen)
        ? this.labelOpen : this.labelClosed;
    }
  };

  var _alertStacks = {};

  function ensureAlertStack(pos) {
    if (!_alertStacks[pos]) {
      var c = document.createElement('div');
      c.className = 'ubtn-astack ubtn-astack-' + pos;
      document.body.appendChild(c);
      _alertStacks[pos] = c;
    }
    return _alertStacks[pos];
  }

  function showAlert(message, opts) {
    opts = opts || {};
    var pos   = opts.position === 'bottom' ? 'bottom' : 'top';
    var color = resolveColor(opts.theme) || BRAND.green;
    var dur   = (opts.duration != null) ? +opts.duration : 3000;
    var icon  = opts.icon || '';

    var width = opts.width ? String(opts.width).trim() : '';
    if (width && !/^\d+(\.\d+)?(px|%)$/.test(width)) {
      console.warn('[ui-btn] alert width 格式無效（應為 px 或 %，例如 "400px"、"80%"），已忽略。');
      width = '';
    }

    var stack = ensureAlertStack(pos);
    var item  = document.createElement('div');
    item.className = 'ubtn-alert';
    item.style.background = color;
    item.style.color      = BG;

    if (width) {
      item.style.width      = width;
      item.style.maxWidth   = 'none';
      item.style.whiteSpace = 'normal';
    }

    if (icon && /^bi-/.test(icon)) {
      var iEl = document.createElement('i');
      iEl.className = 'bi ' + icon;
      iEl.setAttribute('aria-hidden', 'true');
      iEl.style.flexShrink = '0';
      item.appendChild(iEl);
    }

    var txt = document.createElement('span');
    txt.textContent = message;
    item.appendChild(txt);

    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'ubtn-alert-x';
    x.innerHTML = '&times;';
    x.style.color = BG;
    item.appendChild(x);

    function dismiss() {
      item.classList.remove('ubtn-alert-in');
      onTransEnd(item, 'opacity', function () { item.remove(); });
    }

    x.addEventListener('click', dismiss);
    var timer = (dur > 0) ? setTimeout(dismiss, dur) : null;
    item.addEventListener('click', function (e) {
      if (e.target !== x) { clearTimeout(timer); dismiss(); }
    });

    stack.appendChild(item);
    rAF2(function () { item.classList.add('ubtn-alert-in'); });

    return { dismiss: dismiss };
  }

  showAlert.clear = function () {
    ['top', 'bottom'].forEach(function (pos) {
      if (_alertStacks[pos]) {
        Array.from(_alertStacks[pos].children).forEach(function (c) { c.remove(); });
      }
    });
  };

  function bootBtn() {
    var instances = [];
    document.querySelectorAll('ui-btn:not([data-ubtn])').forEach(function (el) {
      el.setAttribute('data-ubtn', '');
      instances.push(new UiBtn(el));
    });
    instances.forEach(function (b) {
      b.init();
      if (b.group) {
        if (!_groups[b.group]) _groups[b.group] = [];
        _groups[b.group].push(b);
      }
    });
  }

  function boot() {
    bootReading();
    bootBtn();
    watchReading();
  }

  /* 監看頁面：之後才出現的 read-pulse、chalk-mark、col-pair，或被其他元件（例如 ui-table、ui-cards）
     複製出來的 read-pulse 副本，自動初始化。同一輪的多次變動合併成一次處理 */
  var _watching = false, _rbQueued = false;
  var READING_SEL = 'read-pulse:not([data-urm]),chalk-mark:not([data-urm]),col-pair:not([data-urm]),.urm-pulse[data-urm-pulse]';
  function watchReading() {
    if (_watching || typeof MutationObserver === 'undefined' || !document.body) return;
    _watching = true;
    new MutationObserver(function (muts) {
      if (_rbQueued) return;
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          var hit = (n.matches && n.matches(READING_SEL)) || (n.querySelector && n.querySelector(READING_SEL));
          if (!hit) continue;
          if (n.matches && n.matches('.urm-pulse') && _livePulses.has(n) && !n.querySelector(READING_SEL)) continue;
          _rbQueued = true;
          (window.queueMicrotask || function (f) { Promise.resolve().then(f); })(function () {
            _rbQueued = false;
            bootReading();
          });
          return;
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.UiReading = { init: bootReading, config: UR_CFG, colors: BRAND };
  global.UiBtn     = { init: bootBtn,     alert: showAlert, config: UB_CFG, colors: BRAND };

})(window);
/* ── 色名標籤 <c-blue>、<c-key> 等：所有元件共用同一份，頁面上只注入一次 ── */
(function () {
  'use strict';
  if (typeof document === 'undefined' || document.getElementById('ui-color-tags')) return;
  var COLORS = { shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#DE8EC9' };
  var css = [];
  Object.keys(COLORS).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[k] + '}'); });
  var s = document.createElement('style'); s.id = 'ui-color-tags'; s.textContent = css.join('\n');
  (document.head || document.documentElement).appendChild(s);
  if (typeof window !== 'undefined' && !window.UiColorTags) { window.UiColorTags = { colors: COLORS }; }
})();
