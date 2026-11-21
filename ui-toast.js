(function (global) {
  'use strict';
  if (global.UiToast) return;

  /* ═══════════════════════════════════════════════════════════════════
   *  ui-toast：浮動提示訊息
   *
   *  用法一（不用寫 JS）：在任何元素加上 toast 屬性，點擊時跳出提示。
   *    <button toast="已儲存">儲存</button>
   *    元件內容裡的按鈕、badge、連結也可以，包括之後才產生的元素。
   *
   *  用法二：訊息放在 <ui-toast>，用 toast-target 指向它（可含 HTML）。
   *    <ui-toast id="done" theme="green" icon="check-circle-fill">已完成</ui-toast>
   *    <button toast-target="done">完成</button>
   *
   *  用法三：UiToast.show('已儲存', { theme: 'green' })
   *
   *  提示會放進瀏覽器的最上層（Popover API），所以即使 <dialog> 或其他浮層
   *  已經開啟，提示仍然顯示在最上面。不支援時退回 z-index。
   * ═══════════════════════════════════════════════════════════════════ */

  var BRAND = {
    base:     '#0C0D0C',
    shell:    '#C6C7BD',
    vanilla:  '#DBEDD8',
    yellow:   '#E3D322',
    indigo:   '#778CE1',
    pink:     '#FF91D7',
    red:      '#EF6661',
    green:    '#71CD76',
    blue:     '#5DBAE8',
    violet:   '#B484E8',
    gray:     '#86877F',
    key:      '#51DBCF',
    calm:     '#A3C4BC',
    quiet:    '#8EA4DE',
    playful:  '#FFA987',
    urgent:   '#FF2E63',
    energetic:'#B6FF00',
    dreamy:   '#C394CD',
    salmon:   '#FFC88A',
    'bg-alternative': '#2D2D2D'
  };
  var BG = BRAND.base;

  var POSITIONS = ['top', 'top-left', 'top-right', 'bottom', 'bottom-left', 'bottom-right'];
  var VARIANTS  = ['fill', 'outline', 'square', 'square-border'];

  var CFG = global.UiToastConfig = Object.assign({
    theme:    'green',   /* 色票名稱、#色碼或任何 CSS 顏色 */
    position: 'top',     /* top、top-left、top-right、bottom、bottom-left、bottom-right */
    duration: 3000,      /* 毫秒，0 表示不會自動消失 */
    variant:  'fill',    /* fill 實心、outline 外框、square 長方形實心、square-border 長方形上下框線 */
    max:      5,         /* 同一位置最多同時顯示幾則，超過時最舊的先收掉 */
    zIndex:   2147483000 /* 瀏覽器不支援最上層時的備用層級 */
  }, global.UiToastConfig || {});

  var HAS_POPOVER = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

  function warn(msg) {
    if (global.console && console.warn) console.warn('[ui-toast] ' + msg);
  }

  function css() {
    var z = CFG.zIndex;
    return [
      'ui-toast{display:none}',

      '.utoast-stack{position:fixed;inset:auto;margin:0;padding:0;border:0;background:transparent;' +
        'color:inherit;overflow:visible;width:max-content;height:auto;max-width:calc(100vw - 32px);' +
        'display:flex;flex-direction:column;gap:8px;pointer-events:none;z-index:' + z + '}',
      '.utoast-top{top:16px;left:50%;transform:translateX(-50%);align-items:center}',
      '.utoast-top-left{top:16px;left:16px;align-items:flex-start}',
      '.utoast-top-right{top:16px;right:16px;align-items:flex-end}',
      '.utoast-bottom{bottom:16px;left:50%;transform:translateX(-50%);align-items:center;flex-direction:column-reverse}',
      '.utoast-bottom-left{bottom:16px;left:16px;align-items:flex-start;flex-direction:column-reverse}',
      '.utoast-bottom-right{bottom:16px;right:16px;align-items:flex-end;flex-direction:column-reverse}',

      '.utoast{box-sizing:border-box;display:flex;align-items:center;gap:8px;' +
        'padding:10px 14px 10px 18px;border:1px solid var(--ut-c);border-radius:20px;' +
        'font-family:inherit;font-weight:600;font-size:1rem;line-height:1.4;' +
        'width:max-content;max-width:min(88vw,560px);pointer-events:all;cursor:default;' +
        'opacity:0;transition:opacity .25s ease,transform .25s ease}',
      '.utoast-fill{background:var(--ut-c);color:var(--ut-on)}',
      '.utoast-outline{background:' + BRAND['bg-alternative'] + ';color:var(--ut-c)}',
      /* square：長方形（直角）實心；square-border：長方形空心，只有上下 3px 邊框 */
      '.utoast-square{background:var(--ut-c);color:var(--ut-on);border-radius:0}',
      '.utoast-square-border{background:' + BRAND['bg-alternative'] + ';color:var(--ut-c);border-width:3px 0;border-radius:0}',
      '.utoast-top .utoast,.utoast-top-left .utoast,.utoast-top-right .utoast{transform:translateY(-14px)}',
      '.utoast-bottom .utoast,.utoast-bottom-left .utoast,.utoast-bottom-right .utoast{transform:translateY(14px)}',
      '.utoast.utoast-in{opacity:1;transform:translateY(0)}',
      '.utoast-text{min-width:0;overflow-wrap:anywhere}',
      '.utoast-text > :first-child{margin-top:0}',
      '.utoast-text > :last-child{margin-bottom:0}',
      '.utoast .bi{flex:none}',
      '.utoast-x{flex:none;background:none;border:0;color:inherit;cursor:pointer;' +
        'font-size:1.15rem;line-height:1;padding:0;margin-left:6px;opacity:.65;font-weight:700;' +
        'transition:opacity .15s ease}',
      '.utoast-x:hover{opacity:1}'
    ].join('\n');
  }

  function injectCSS() {
    var el = document.getElementById('_utoast_css');
    if (!el) {
      el = document.createElement('style');
      el.id = '_utoast_css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = css();
  }

  /* ---------- 顏色 ---------- */

  function resolveColor(v) {
    if (v === null || v === undefined) return '';
    var t = String(v).trim();
    if (!t) return '';
    var k = t.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(BRAND, k)) return BRAND[k];
    if (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('color', t)) return t;
    warn('theme="' + t + '" 無效，可用名稱：' + Object.keys(BRAND).join('、'));
    return '';
  }

  /* 實心底上的文字色：底色亮就用深色字，暗就用淺色字；非色碼的 CSS 顏色一律用深色字 */
  function textOn(c) {
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c || '');
    if (!m) return BG;
    var h = m[1];
    if (h.length === 3) h = h.split('').map(function (x) { return x + x; }).join('');
    var r = parseInt(h.substr(0, 2), 16) / 255;
    var g = parseInt(h.substr(2, 2), 16) / 255;
    var b = parseInt(h.substr(4, 2), 16) / 255;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 0.5 ? BRAND.vanilla : BG;
  }

  /* ---------- 堆疊容器：每個位置一個 ---------- */

  var stacks = {};

  function getStack(pos) {
    if (!stacks[pos]) {
      var c = document.createElement('div');
      c.className = 'utoast-stack utoast-' + pos;
      if (HAS_POPOVER) c.setAttribute('popover', 'manual');
      document.body.appendChild(c);
      stacks[pos] = c;
    }
    return stacks[pos];
  }

  /* 每次新增提示都重新放到最上層，才會蓋過之後才開啟的 <dialog> */
  function promote(c) {
    if (!HAS_POPOVER) return;
    try {
      if (c.matches(':popover-open')) c.hidePopover();
      c.showPopover();
    } catch (e) { /* 忽略 */ }
  }

  /* ---------- 顯示一則提示 ---------- */

  function show(message, opts) {
    opts = opts || {};

    if (!document.body) {
      document.addEventListener('DOMContentLoaded', function () { show(message, opts); }, { once: true });
      return { dismiss: function () {} };
    }
    injectCSS();

    var pos = opts.position != null && opts.position !== '' ? String(opts.position).trim().toLowerCase() : CFG.position;
    if (POSITIONS.indexOf(pos) === -1) {
      warn('position="' + pos + '" 無效，可用：' + POSITIONS.join('、') + '，已改用 ' + CFG.position);
      pos = CFG.position;
    }

    var variant = opts.variant != null && opts.variant !== '' ? String(opts.variant).trim().toLowerCase() : CFG.variant;
    if (VARIANTS.indexOf(variant) === -1) {
      warn('variant="' + variant + '" 無效，可用：' + VARIANTS.join('、') + '，已改用 fill');
      variant = 'fill';
    }

    var color = resolveColor(opts.theme) || resolveColor(CFG.theme) || BRAND.green;

    var dur = (opts.duration != null && opts.duration !== '') ? +opts.duration : +CFG.duration;
    if (!isFinite(dur)) dur = 3000;

    var width = opts.width ? String(opts.width).trim() : '';
    if (width && !/^\d+(\.\d+)?(px|%)$/.test(width)) {
      warn('width 格式無效（應為 px 或 %，例如 "400px"、"80%"），已忽略。');
      width = '';
    }

    var icon = opts.icon ? String(opts.icon).trim().replace(/^bi[\s-]+bi-/, 'bi-') : '';
    if (icon && !/^[\w-]+$/.test(icon)) { warn('icon 格式無效，已忽略。'); icon = ''; }
    if (icon && icon.indexOf('bi-') !== 0) icon = 'bi-' + icon;

    var stack = getStack(pos);

    /* 超過上限，最舊的先收掉 */
    var max = Math.max(1, parseInt(CFG.max, 10) || 5);
    while (stack.children.length >= max) stack.removeChild(stack.firstElementChild);

    var item = document.createElement('div');
    item.className = 'utoast utoast-' + variant;
    item.style.setProperty('--ut-c', color);
    item.style.setProperty('--ut-on', textOn(color));
    if (width) {
      item.style.width = width;
      item.style.maxWidth = 'none';
    }

    if (icon) {
      var iEl = document.createElement('i');
      iEl.className = 'bi ' + icon;
      iEl.setAttribute('aria-hidden', 'true');
      item.appendChild(iEl);
    }

    var txt = document.createElement('div');
    txt.className = 'utoast-text';
    if (opts.html) txt.innerHTML = message; else txt.textContent = message;
    item.appendChild(txt);

    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'utoast-x';
    x.innerHTML = '&times;';
    item.appendChild(x);

    var timer = null, left = dur, started = 0, dismissed = false;

    function arm() {
      if (dur > 0 && !dismissed) {
        started = Date.now();
        timer = setTimeout(dismiss, left);
      }
    }

    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      clearTimeout(timer);
      item.classList.remove('utoast-in');
      var gone = false;
      function rm() { if (!gone) { gone = true; item.remove(); } }
      item.addEventListener('transitionend', rm);
      setTimeout(rm, 400);
    }

    /* 滑鼠停在提示上時暫停倒數，移開後接著倒數 */
    item.addEventListener('mouseenter', function () {
      if (timer) {
        clearTimeout(timer);
        timer = null;
        left = Math.max(300, left - (Date.now() - started));
      }
    });
    item.addEventListener('mouseleave', function () { if (!timer) arm(); });
    item.addEventListener('click', dismiss);

    stack.appendChild(item);
    promote(stack);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { item.classList.add('utoast-in'); });
    });
    arm();

    return { dismiss: dismiss };
  }

  function clear() {
    Object.keys(stacks).forEach(function (pos) {
      Array.prototype.slice.call(stacks[pos].children).forEach(function (c) { c.remove(); });
    });
  }

  /* ---------- 屬性觸發：整頁只掛一個點擊監聽 ---------- */

  /* 停用的按鈕不觸發。ui-btn 停用時，裡面的 <button> 帶 disabled，外層標籤沒有，所以也看直接子層 */
  function isDisabled(el) {
    if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return true;
    try { return !!el.querySelector(':scope > [disabled]'); } catch (e) { return false; }
  }

  /* 提示的外觀：觸發元素的 toast-* 屬性優先，其次是 <ui-toast> 自己的屬性 */
  function readOpts(el, holder) {
    function pick(name) {
      var v = el.getAttribute('toast-' + name);
      if (v !== null) return v;
      if (holder && holder.hasAttribute(name)) return holder.getAttribute(name);
      return null;
    }
    return {
      theme: pick('theme'), position: pick('position'), duration: pick('duration'),
      width: pick('width'), icon: pick('icon'), variant: pick('variant')
    };
  }

  /* 用捕獲階段：就算元件自己在點擊時呼叫 stopPropagation，這裡仍然收得到 */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var el = t.closest('[toast],[toast-target]');
    if (!el || isDisabled(el)) return;

    var msg, holder = null, html = false;
    var tid = el.getAttribute('toast-target');
    if (tid) {
      holder = document.getElementById(tid.trim().replace(/^#/, ''));
      if (!holder) { warn('找不到 toast-target 指定的元素 #' + tid.trim().replace(/^#/, '')); return; }
      msg = holder.innerHTML;
      html = true;
    } else {
      msg = el.getAttribute('toast');
    }
    if (msg === null || msg === '') return;

    var o = readOpts(el, holder);
    o.html = html;
    show(msg, o);
  }, true);

  var UiToast = { show: show, clear: clear, config: CFG, colors: BRAND };
  global.UiToast = UiToast;

  /* 先注入樣式，讓 <ui-toast> 訊息來源一開始就是隱藏的 */
  injectCSS();

}(window));
