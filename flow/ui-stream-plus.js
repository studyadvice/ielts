/* ui-stream-plus.js
 * ui-stream 的相依增強：不修改 ui-stream.js，另外掛上兩項功能。
 *
 * 1. reveal-pause（stream-item 屬性）
 *    ui-stream 的 pause 是「這則訊息出現後停住，按了才顯示 reveal」。
 *    加上 reveal-pause 後，reveal 顯示完會再停一次，再按一下才出現下一則訊息。
 *    值是按鈕文字；只寫屬性名稱不寫值，沿用 ui-stream 的 pause-text。
 *    需搭配 pause 與 reveal 使用。
 *      <stream-item pause="先想三秒" reveal="a1" reveal-pause="看完了再繼續">…</stream-item>
 *
 * 2. data-style 新增兩個值（stream-item 與 stream-role 都能用）
 *    spot：醒目，粗框加外圈，字加粗放大。
 *    faint：不醒目，灰框灰字縮小，頭像轉灰階。
 *    layout 為 flat 或 tail 時，ui-stream 本來就不套用 data-style，這兩個值也不會生效。
 *      <stream-item data-style="spot">重點</stream-item>
 *      <stream-item data-style="faint">補充說明</stream-item>
 *
 * 載入順序：reveal-pause 要在 ui-stream 清掉原始標記之前讀取，
 * 所以請把本檔放在 ui-stream.js 之前。只用 data-style 的話，順序不拘。
 * 不使用 Shadow DOM，樣式載入後自動注入。
 */
(function () {
  'use strict';
  if (typeof document === 'undefined' || window.UiStreamPlus) return;

  var DEFAULT_TEXT = '點一下繼續';
  var DEFAULT_ICON = 'hand-index-thumb';
  var GRAY = '#86877F';

  /* ── 樣式：ui-stream 會把 data-style 的值變成 .us-值，所以只要補 CSS 就能新增外觀 ── */
  var CSS = [
    'ui-stream .us-spot .us-bubble{border-width:3px;background:color-mix(in srgb,var(--us-c) 22%,var(--us-bg));color:var(--us-rt,var(--us-text));font-weight:700;font-size:1.1em;outline:2px solid var(--us-c);outline-offset:3px;}',
    'ui-stream .us-spot .us-meta b{font-size:1.05em;}',
    'ui-stream .us-faint .us-bubble{border-color:' + GRAY + ';background:none;color:' + GRAY + ';font-size:0.85em;}',
    'ui-stream .us-faint .us-meta b{color:' + GRAY + ';}',
    'ui-stream .us-faint .us-avatar{filter:grayscale(1);}'
  ].join('\n');
  var style = document.createElement('style');
  style.id = 'ui-stream-plus-style';
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);

  /* ── reveal-pause ── */

  /* 讀取尚未被 ui-stream 處理的 stream-item，記下哪幾則要在 reveal 後再停一次（索引從 0 起，與訊息順序一致） */
  function scan(root) {
    var found = 0, ready = 0;
    (root || document).querySelectorAll('ui-stream').forEach(function (el) {
      if (el.__uspHolds) return;
      var items = Array.prototype.filter.call(el.children, function (c) { return c.tagName === 'STREAM-ITEM'; });
      if (!items.length) { if (el.hasAttribute('data-ready')) ready++; return; }
      var holds = new Map();
      items.forEach(function (it, i) { if (it.hasAttribute('reveal-pause')) holds.set(i, it.getAttribute('reveal-pause')); });
      el.__uspHolds = holds;
      if (holds.size) { found++; watch(el); }
    });
    if (ready && !found && typeof console !== 'undefined') {
      console.info('[ui-stream-plus] 已建好的 ui-stream 無法再讀取 reveal-pause。若有使用，請把 ui-stream-plus.js 放在 ui-stream.js 之前；只用 data-style 則不受影響。');
    }
  }

  function watch(el) {
    el.addEventListener('ui-stream:resume', function (e) {
      if (e.target !== el) return;
      var idx = e.detail && e.detail.index;
      if (!el.__uspHolds.has(idx)) return;
      wrapPlay(el);
      var st = el.__usp;
      st.armed = true; st.text = el.__uspHolds.get(idx);
      /* 正常情況下，ui-stream 會在事件送出後立刻呼叫 play()，那一次被攔下來；沒被攔到就解除，避免殘留 */
      setTimeout(function () { st.armed = false; }, 0);
    });
  }

  /* ui-stream 在「按下繼續」時依序做：顯示 reveal、送出 ui-stream:resume、呼叫 this.play()。
     這裡在實例上包一層 play：reveal 後的第一次 play() 改成顯示第二顆按鈕；
     按下按鈕、或使用者按控制列的播放，才真正往下。 */
  function wrapPlay(el) {
    if (el.__usp) return;
    var orig = el.play;
    var st = el.__usp = { armed: false, text: '', btn: null };

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

  window.UiStreamPlus = { scan: scan };
  scan(document);
})();
