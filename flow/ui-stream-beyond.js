/* ui-stream-beyond.js
 * ui-stream 的相依增強：不修改 ui-stream.js，另外掛上三項功能。
 * 命名規則：相依增強檔一律叫 {元件名}-beyond.js。
 *
 * 1. avatar-glow（stream-item 屬性）
 *    這一則訊息的頭像出現時加光暈，用來強調。光暈先閃三下，之後維持。
 *    只寫屬性名稱，光暈用該角色的顏色；值可寫色票名稱或任何 CSS 顏色。
 *      <stream-item avatar-glow>重點</stream-item>
 *      <stream-item avatar-glow="yellow">重點</stream-item>
 *    頭像被隱藏時（avatar="false"、avatar-repeat 隱藏同一人連續訊息的頭像）看不到光暈。
 *
 * 2. reveal-pause（stream-item 屬性）
 *    ui-stream 的 pause 是「這則訊息出現後停住，按了才顯示 reveal」。
 *    加上 reveal-pause 後，reveal 顯示完會再停一次，再按一下才出現下一則訊息。
 *    值是按鈕文字；只寫屬性名稱不寫值，沿用 ui-stream 的 pause-text。
 *    需搭配 pause 與 reveal 使用。
 *      <stream-item pause="先想三秒" reveal="a1" reveal-pause="看完了再繼續">…</stream-item>
 *
 * 3. data-style 新增兩個值（stream-item 與 stream-role 都能用）
 *    spot：醒目，粗框加外圈，字加粗放大。
 *    faint：不醒目，灰框灰字縮小，頭像轉灰階。
 *    layout 為 flat 或 tail 時，ui-stream 本來就不套用 data-style，這兩個值也不會生效。
 *      <stream-item data-style="spot">重點</stream-item>
 *      <stream-item data-style="faint">補充說明</stream-item>
 *
 * 載入順序：avatar-glow 與 reveal-pause 要在 ui-stream 清掉原始標記之前讀取，
 * 所以請把本檔放在 ui-stream.js 之前。只用 data-style 的話，順序不拘。
 * 不使用 Shadow DOM，樣式載入後自動注入。
 */
(function () {
  'use strict';
  if (typeof document === 'undefined' || window.UiStreamBeyond) return;

  var DEFAULT_TEXT = '點一下繼續';
  var DEFAULT_ICON = 'hand-index-thumb';
  var GRAY = '#86877F';

  /* ── 樣式：ui-stream 會把 data-style 的值變成 .us-值，所以只要補 CSS 就能新增外觀 ── */
  var CSS = [
    'ui-stream .us-spot .us-bubble{border-width:3px;background:color-mix(in srgb,var(--us-c) 22%,var(--us-bg));color:var(--us-rt,var(--us-text));font-weight:700;font-size:1.1em;outline:2px solid var(--us-c);outline-offset:3px;}',
    'ui-stream .us-spot .us-meta b{font-size:1.05em;}',
    'ui-stream .us-faint .us-bubble{border-color:' + GRAY + ';background:none;color:' + GRAY + ';font-size:0.85em;}',
    'ui-stream .us-faint .us-meta b{color:' + GRAY + ';}',
    'ui-stream .us-faint .us-avatar{filter:grayscale(1);}',
    'ui-stream .us-avatar.usb-glow{box-shadow:0 0 0 3px var(--usb-g),0 0 16px 6px var(--usb-g);animation:usb-glow-in 0.7s ease 3;}',
    '@keyframes usb-glow-in{0%,100%{box-shadow:0 0 0 3px var(--usb-g),0 0 16px 6px var(--usb-g);}50%{box-shadow:0 0 0 5px var(--usb-g),0 0 28px 12px var(--usb-g);}}'
  ].join('\n');
  var style = document.createElement('style');
  style.id = 'ui-stream-beyond-style';
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);

  /* ── 讀取屬性：ui-stream 建好後會清掉原始的 stream-item，所以要在那之前記下來（索引從 0 起，與訊息順序一致） ── */
  function scan(root) {
    var found = 0, ready = 0;
    (root || document).querySelectorAll('ui-stream').forEach(function (el) {
      if (el.__usbHolds) return;
      var items = Array.prototype.filter.call(el.children, function (c) { return c.tagName === 'STREAM-ITEM'; });
      if (!items.length) { if (el.hasAttribute('data-ready')) ready++; return; }
      var holds = new Map(), glows = new Map();
      items.forEach(function (it, i) {
        if (it.hasAttribute('reveal-pause')) holds.set(i, it.getAttribute('reveal-pause'));
        if (it.hasAttribute('avatar-glow')) glows.set(i, it.getAttribute('avatar-glow'));
      });
      el.__usbHolds = holds;
      el.__usbGlows = glows;
      if (holds.size) watchHold(el);
      if (glows.size) watchGlow(el);
      if (holds.size || glows.size) found++;
    });
    if (ready && !found && typeof console !== 'undefined') {
      console.info('[ui-stream-beyond] 已建好的 ui-stream 無法再讀取 avatar-glow 與 reveal-pause。若有使用，請把 ui-stream-beyond.js 放在 ui-stream.js 之前；只用 data-style 則不受影響。');
    }
  }

  /* ── avatar-glow ── */

  function resolveColor(v) {
    var t = String(v).trim();
    var pal = window.UiStream && window.UiStream.colors;
    return (pal && pal[t.toLowerCase()]) || t;
  }

  /* ui-stream 每顯示一則訊息就送出 ui-stream:item，detail.item 是整則訊息的元素，從裡面找頭像加上光暈 */
  function watchGlow(el) {
    el.addEventListener('ui-stream:item', function (e) {
      if (e.target !== el) return;
      var idx = e.detail && e.detail.index;
      if (!el.__usbGlows.has(idx)) return;
      var av = e.detail.item && e.detail.item.querySelector('.us-avatar');
      if (!av) return;
      var v = el.__usbGlows.get(idx);
      av.style.setProperty('--usb-g', v ? resolveColor(v) : 'var(--us-c)');
      av.classList.add('usb-glow');
    });
  }

  /* ── reveal-pause ── */

  function watchHold(el) {
    el.addEventListener('ui-stream:resume', function (e) {
      if (e.target !== el) return;
      var idx = e.detail && e.detail.index;
      if (!el.__usbHolds.has(idx)) return;
      wrapPlay(el);
      var st = el.__usb;
      st.armed = true; st.text = el.__usbHolds.get(idx);
      /* 正常情況下，ui-stream 會在事件送出後立刻呼叫 play()，那一次被攔下來；沒被攔到就解除，避免殘留 */
      setTimeout(function () { st.armed = false; }, 0);
    });
  }

  /* ui-stream 在「按下繼續」時依序做：顯示 reveal、送出 ui-stream:resume、呼叫 this.play()。
     這裡在實例上包一層 play：reveal 後的第一次 play() 改成顯示第二顆按鈕；
     按下按鈕、或使用者按控制列的播放，才真正往下。 */
  function wrapPlay(el) {
    if (el.__usb) return;
    var orig = el.play;
    var st = el.__usb = { armed: false, text: '', btn: null };

    function held() { return st.btn && st.btn.isConnected; }

    function release() {
      if (held()) st.btn.remove();
      st.btn = null;
      orig.call(el);
      /* 最後一則停在這裡：play() 不會再送 done，補一次 next() 讓 ui-stream:done 照常送出 */
      if (el.index >= el.total) el.next();
    }

    function hold() {
      var feed = el.querySelector('.us-feed');
      if (!feed) { orig.call(el); return; }
      var b = document.createElement('button');
      b.className = 'us-pause us-hold';
      var icon = el.getAttribute('pause-icon') || DEFAULT_ICON;
      var text = st.text || el.getAttribute('pause-text') || DEFAULT_TEXT;
      var i = document.createElement('i'); i.className = 'bi bi-' + icon;
      b.appendChild(i); b.appendChild(document.createTextNode(text));
      var gap = parseFloat(el.getAttribute('gap'));
      b.style.setProperty('--us-mt', (isNaN(gap) ? 14 : gap) + 'px');
      b.onclick = release;
      feed.appendChild(b);
      st.btn = b;
      if (typeof el._scroll === 'function') { try { el._scroll(); } catch (err) { /* 捲動只是輔助，失敗不影響流程 */ } }
    }

    el.play = function () {
      if (st.armed) { st.armed = false; hold(); return; }
      if (held()) { release(); return; }
      return orig.apply(el, arguments);
    };
  }

  window.UiStreamBeyond = { scan: scan };
  scan(document);
})();
