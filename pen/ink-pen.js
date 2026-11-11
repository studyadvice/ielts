/* =========================================================
 * ink-pen.js
 * 螢幕錄影用極簡畫筆層（觸控筆 / 雷射筆 / 行內手寫空格）
 * 零依賴，單檔即可運作
 * 跳轉圓點 <dot-go> 與簡報式轉場已拆到同資料夾的 dot-go.js，需要時另外載入
 *
 * 自訂標籤：
 *   <ui-ink-layer>    全頁繪圖層（觸控筆、雷射筆）
 *   <ui-ink-bar>      迷你工具列（可收合成一顆小圓鈕）
 *   <ink-handwrite>   行內手寫空格，內容以底線長度決定寬度，可加 answer 屬性附解答
 *   <ui-ink-modal>    手寫視窗（首次需要時自動建立，不必自己放）
 *   <ui-ink-ng-mask>  NG 紅色遮罩（首次需要時自動建立，不必自己放）
 *   <ui-ink-ng-panel> NG 標記清單視窗（首次需要時自動建立，不必自己放）
 *
 * NG 標記（螢幕錄影剪輯用）：
 *   工具列按「錄」開始計時，錄影中遇到 NG 就按 Ctrl+Shift+4，
 *   整頁出現紅色遮罩 2 秒（錄進影片當記號），同時記下時間點。
 *   所有時間點（含按下「錄」的那一刻）一律前推 3 秒當保險，不足 0 以 00:00.0 計。
 *   每次標記立刻存進 localStorage，網頁重新整理或意外關閉也不會遺失，
 *   重新整理時若計時尚未結束，會接著計時。
 *   按工具列「清單」可檢視、複製或下載純文字清單。
 *   工具列屬性：
 *     data-ng-mask-ms="2000"    遮罩秒數（毫秒），預設 2000
 *     data-ng-offset="3"        標記前推秒數，預設 3
 *     data-ng-start-offset="3"  開始時間前推秒數，預設 3
 *
 * 對外介面：window.InkPen
 *   .layer()              取得繪圖層實體
 *   .bar()                取得工具列實體
 *   .modal()              取得手寫視窗實體
 *   .blanks()             取得頁面上所有 <ink-handwrite>
 *   .lockScroll(v)        設定捲動鎖定（true／"pen"／false），等同改 data-lock-scroll
 *   .shortcuts            快捷鍵對照表（模式與 NG 標記）
 *   .ng                   NG 標記：start() stop() toggle() mark() text() clear() isRecording()
 *   .palette              配色表
 *   同時載入 dot-go.js 時，.dots()、.transition() 等轉場介面也會掛在這裡
 *
 * 本元件不在畫面上顯示任何提示訊息，設定錯誤只寫入 console，
 * 以免錄影時跳出東西干擾畫面。
 *
 * 快捷鍵：
 *   Ctrl+Shift+1  觸控筆
 *   Ctrl+Shift+2  雷射筆
 *   Ctrl+Shift+`  關閉繪圖，回到一般點選
 *   Ctrl+Shift+3  開始／結束 NG 計時
 *   Ctrl+Shift+4  標記 NG（顯示紅色遮罩並記下時間點）
 *                 以實體按鍵位置判斷（e.code），不受輸入法與 Shift 換字影響；
 *                 游標停在工具列的輸入框裡也有效
 *   C  清除全部筆跡
 *   H  收合／展開工具列
 *   A  顯示／收起全部解答
 *   Esc  關閉手寫視窗
 * ========================================================= */
(function () {
  'use strict';

  var PALETTE = {
    bg: '#0C0D0C', shell: '#C6C7BD',
    vanilla: '#DBEDD8', yellow: '#E3D322',
    indigo: '#778CE1', pink: '#FF91D7',
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

  /* 品牌色名稱轉換：不分大小寫，base 為 bg 的別名；不是名稱時原樣回傳 */
  function brandOf(v) {
    var t = String(v == null ? '' : v).trim();
    var k = t.toLowerCase();
    if (k === 'base') k = 'bg';
    return Object.prototype.hasOwnProperty.call(PALETTE, k) ? PALETTE[k] : t;
  }

  var PEN_OPTIONS = [
    ['vanilla', '香草白 vanilla'],
    ['blue', '藍 blue'],
    ['yellow', '黃 yellow'],
    ['green', '綠 green'],
    ['pink', '粉紅 pink'],
    ['playful', '蜜桃 playful'],
    ['violet', '紫 violet'],
    ['red', '紅 red']
  ];

  var WIDTH_MIN = 3;
  var WIDTH_MAX = 12;
  var WIDTH_DEFAULT = 3;

  var HW_MIN = 4;
  var HW_MAX = 24;
  var HW_DEFAULT = 10;
  var SLOT_MIN = 8;
  var SLOT_MAX = 255;
  var SLOT_FALLBACK = 10;
  var ANSWER_MIN_SCALE = 0.6;
  var HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  /* 觸控筆離開螢幕後這段時間內的手指觸碰，視為手掌誤觸 */
  var PALM_MS = 600;
  /* 捲動鎖定期間，程式端捲動（例如 dot-go.js 的同頁跳轉）可放行的時間 */
  var LOCK_PASS_MS = 700;
  /* 會造成頁面捲動的按鍵 */
  var SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'];
  /* 模式快捷鍵：Ctrl+Shift+實體按鍵。
   * fallback 用於少數不回報 e.code 的裝置，比對 e.key（含 Shift 換出的符號） */
  var MODE_KEYS = [
    { code: 'Digit1', keys: ['1', '!'], mode: 'pen', label: 'Ctrl+Shift+1' },
    { code: 'Digit2', keys: ['2', '@'], mode: 'laser', label: 'Ctrl+Shift+2' },
    { code: 'Backquote', keys: ['`', '~'], mode: 'off', label: 'Ctrl+Shift+`' }
  ];

  /* NG 標記快捷鍵，判斷方式同上 */
  var ACTION_KEYS = [
    { code: 'Digit3', keys: ['3', '#'], action: 'rec', label: 'Ctrl+Shift+3' },
    { code: 'Digit4', keys: ['4', '$'], action: 'ng', label: 'Ctrl+Shift+4' }
  ];

  function actionKeyLabel(action) {
    for (var i = 0; i < ACTION_KEYS.length; i++) {
      if (ACTION_KEYS[i].action === action) return ACTION_KEYS[i].label;
    }
    return '';
  }

  /* NG 標記預設值 */
  var NG_MASK_MS = 2000;
  var NG_OFFSET_S = 3;
  var NG_START_OFFSET_S = 3;
  var NG_STORE_KEY = 'ink-pen:ng-session';

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* 毫秒轉 mm:ss.s，滿一小時改 h:mm:ss.s，負值以 0 計 */
  function fmtElapsed(ms) {
    if (!(ms > 0)) ms = 0;
    var tenth = Math.floor(ms / 100) % 10;
    var total = Math.floor(ms / 1000);
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    return (h ? h + ':' + pad2(m) : pad2(m)) + ':' + pad2(s) + '.' + tenth;
  }

  function fmtClock(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' +
      pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function fmtStamp(ts) {
    var d = new Date(ts);
    return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '-' +
      pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds());
  }

  function numAttr(el, name, def) {
    var raw = el.getAttribute(name);
    if (raw === null || String(raw).trim() === '') return def;
    var n = Number(raw);
    return (isFinite(n) && n >= 0) ? n : def;
  }

  function modeKeyLabel(mode) {
    for (var i = 0; i < MODE_KEYS.length; i++) {
      if (MODE_KEYS[i].mode === mode) return MODE_KEYS[i].label;
    }
    return '';
  }

  function isEditable(t) {
    return !!(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' ||
      t.tagName === 'SELECT' || t.isContentEditable));
  }

  /* data-lock-scroll 的值轉成規則：
   *   未設定 / "false" / "none" / "off"   不鎖定（維持原本行為）
   *   有屬性但空值 / "true" / "all"        觸控筆與雷射筆模式都鎖定
   *   "pen"                               只在觸控筆模式鎖定 */
  function parseLockRule(v) {
    if (v === null || v === undefined) return 'none';
    var s = String(v).trim().toLowerCase();
    if (s === '' || s === 'true' || s === 'all') return 'all';
    if (s === 'pen') return 'pen';
    if (s === 'false' || s === 'none' || s === 'off') return 'none';
    warn('data-lock-scroll 只接受 true、pen、false，已當作 true：' + v);
    return 'all';
  }
  var PEN_ICON = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">'
    + '<path d="M3 17.3V21h3.7L17.6 10.1l-3.7-3.7L3 17.3zM20.7 7c.4-.4.4-1 0-1.4l-2.3-2.3c-.4-.4-1-.4-1.4 0l-1.8 1.8 3.7 3.7L20.7 7z" '
    + 'fill="currentColor"/></svg>';

  function warn(msg) {
    if (window.console && console.warn) console.warn('[ink-pen] ' + msg);
  }

  function injectStyles() {
    if (document.getElementById('ink-pen-styles')) return;
    var css = ''
      /* ---- 繪圖層 ---- */
      + 'ui-ink-layer{position:fixed;inset:0;z-index:820;pointer-events:none;display:block;}'
      + 'ui-ink-layer canvas{position:absolute;inset:0;width:100%;height:100%;}'
      /* 一律 touch-action:none，避免瀏覽器把筆的上下移動當成捲動而中斷筆畫；
       * 文件座標模式下的手指捲動改由程式處理 */
      + 'ui-ink-layer.ip-live{pointer-events:auto;cursor:crosshair;touch-action:none;}'
      /* 捲動鎖定時關掉邊界回彈，觸控板滑到底也不會晃動畫面 */
      + 'html.ip-scroll-locked,html.ip-scroll-locked body{overscroll-behavior:none;}'

      /* ---- 工具列容器 ---- */
      + 'ui-ink-bar{position:fixed;z-index:880;display:flex;align-items:center;gap:10px;}'
      + 'ui-ink-bar[data-pos="br"],ui-ink-bar:not([data-pos]){right:20px;bottom:20px;flex-direction:row-reverse;}'
      + 'ui-ink-bar[data-pos="bl"]{left:20px;bottom:20px;}'
      + 'ui-ink-bar[data-pos="tr"]{right:20px;top:20px;flex-direction:row-reverse;}'
      + 'ui-ink-bar[data-pos="tl"]{left:20px;top:20px;}'

      /* ---- 收合鈕 ---- */
      + '.ip-dot{width:40px;height:40px;border-radius:50%;flex:0 0 auto;cursor:pointer;'
      + 'display:flex;align-items:center;justify-content:center;padding:0;'
      + 'background:rgba(19,20,18,0.92);border:1px solid rgba(58,59,55,0.9);'
      + 'box-shadow:0 4px 14px rgba(0,0,0,0.82);transition:border-color .15s ease;}'
      + '.ip-dot:hover{border-color:var(--c-blue,#5DBAE8);}'
      + '.ip-dot i{width:14px;height:14px;border-radius:50%;display:block;'
      + 'background:var(--c-vanilla,#DBEDD8);}'
      + '.ip-dot.ip-armed{border-color:rgba(93,186,232,0.9);'
      + 'box-shadow:0 0 0 2px rgba(93,186,232,0.82),0 4px 14px rgba(0,0,0,0.82);}'

      /* ---- 主體膠囊 ---- */
      + '.ip-bar{display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:22px;'
      + 'background:rgba(19,20,18,0.94);border:1px solid rgba(58,59,55,0.9);'
      + 'box-shadow:0 6px 20px rgba(0,0,0,0.82);}'
      + '.ip-bar.ip-hidden{display:none;}'
      + '.ip-sep{width:1px;height:22px;background:rgba(58,59,55,0.9);}'
      + '.ip-btn{font-size:0.88rem;line-height:1.4;padding:5px 12px;border-radius:14px;'
      + 'border:1px solid rgba(58,59,55,0.9);background:rgba(32,33,25,0.92);'
      + 'color:var(--c-shell,#C6C7BD);cursor:pointer;white-space:nowrap;}'
      + '.ip-btn:hover{border-color:var(--c-blue,#5DBAE8);color:var(--c-blue,#5DBAE8);}'
      + '.ip-btn.ip-active{background:var(--c-green,#71CD76);border-color:var(--c-green,#71CD76);'
      + 'color:#07211D;font-weight:600;}'
      + '.ip-bar select,.ip-bar input[type=number]{background:rgba(15,16,14,0.95);'
      + 'border:1px solid rgba(58,59,55,0.9);color:var(--c-shell,#C6C7BD);border-radius:12px;'
      + 'padding:5px 8px;font-size:0.85rem;line-height:1.4;}'
      + '.ip-bar input[type=number]{width:58px;}'
      + '.ip-swatch{width:16px;height:16px;border-radius:50%;flex:0 0 auto;'
      + 'border:1px solid rgba(198,199,189,0.82);}'

      /* ---- 行內手寫空格 ----
       * 高度壓在 1.55em 以內，避免超出 line-height 1.5 的行框而壓到上一行；
       * 內容裝在 .ih-clip 裡並裁切，解答圓點則留在框外不被裁掉。
       */
      + 'ink-handwrite{display:inline-flex;align-items:center;justify-content:center;'
      + 'vertical-align:-0.3em;height:1.55em;cursor:pointer;position:relative;'
      + 'width:calc(var(--ih-n,10) * 1.05ch);margin:0 3px;padding:0;'
      + 'border-bottom:2px solid rgba(113,205,118,0.86);border-radius:3px 3px 0 0;'
      + 'transition:background .15s ease,border-color .15s ease;}'
      + 'ink-handwrite:hover{background:rgba(113,205,118,0.2);border-color:var(--c-blue,#5DBAE8);}'
      + 'ink-handwrite.ih-has-answer{margin-right:17px;}'
      + 'ink-handwrite .ih-clip{position:absolute;inset:0;overflow:hidden;'
      + 'display:flex;align-items:center;justify-content:center;pointer-events:none;}'
      + 'ink-handwrite .ih-icon{display:flex;align-items:center;justify-content:center;'
      + 'color:rgba(198,199,189,0.82);}'
      + 'ink-handwrite:hover .ih-icon{color:var(--c-blue,#5DBAE8);}'
      + 'ink-handwrite .ih-clip img{position:absolute;left:4px;top:2px;'
      + 'width:calc(100% - 8px);height:calc(100% - 6px);'
      + 'object-fit:contain;display:block;}'
      + 'ink-handwrite.ih-filled{border-color:rgba(113,205,118,0.86);}'
      + 'ink-handwrite.ih-filled .ih-icon{display:none;}'

      /* ---- 解答 ---- */
      + 'ink-handwrite .ih-ans{display:none;white-space:nowrap;line-height:1.4;'
      + 'color:var(--c-green,#71CD76);transform-origin:center center;}'
      + 'ink-handwrite.ih-answered .ih-ans{display:block;}'
      + 'ink-handwrite.ih-answered .ih-icon{display:none;}'
      + 'ink-handwrite.ih-answered{border-bottom-width:3px;'
      + 'border-color:rgba(113,205,118,0.86);}'
      /* 圓點的 z-index 高於繪圖層，所以開著筆也點得到 */
      + 'ink-handwrite .ih-dot{position:absolute;right:-13px;top:50%;'
      + 'width:9px;height:9px;margin-top:-5px;border-radius:50%;z-index:830;cursor:pointer;'
      + 'border:1px solid rgba(198,199,189,0.82);background:rgba(12,13,12,0.86);'
      + 'transition:background .12s ease,border-color .12s ease;}'
      + 'ink-handwrite .ih-dot:hover{background:var(--c-blue,#5DBAE8);'
      + 'border-color:var(--c-blue,#5DBAE8);}'
      + 'ink-handwrite.ih-answered .ih-dot{background:var(--c-green,#71CD76);'
      + 'border-color:var(--c-green,#71CD76);}'

      /* ---- 手寫視窗 ---- */
      + 'ui-ink-modal{position:fixed;inset:0;z-index:960;display:none;'
      + 'align-items:center;justify-content:center;background:rgba(12,13,12,0.9);}'
      + 'ui-ink-modal.ip-on{display:flex;}'
      + '.ipm-box{background:rgba(23,24,26,0.97);border:1px solid rgba(51,52,47,0.9);'
      + 'border-radius:12px;padding:24px 28px;box-shadow:0 14px 44px rgba(0,0,0,0.86);}'
      + '.ipm-head{display:flex;align-items:baseline;gap:14px;margin-bottom:16px;}'
      + '.ipm-head h4{margin:0;font-size:1.1rem;line-height:1.4;color:var(--c-vanilla,#DBEDD8);}'
      + '.ipm-head span{font-size:0.85rem;line-height:1.4;color:#9a9b94;}'
      + '.ipm-pad{position:relative;border-radius:10px;overflow:hidden;'
      + 'background:rgba(15,16,14,0.95);border:1px solid rgba(58,59,55,0.9);}'
      + '.ipm-pad canvas{display:block;width:100%;height:100%;touch-action:none;cursor:crosshair;}'
      + '.ipm-base{position:absolute;left:5%;right:5%;bottom:28%;height:0;'
      + 'border-top:1px dashed rgba(198,199,189,0.82);pointer-events:none;}'
      + '.ipm-foot{display:flex;align-items:center;gap:10px;margin-top:18px;flex-wrap:wrap;}'
      + '.ipm-foot .ipm-spacer{flex:1 1 auto;}'
      + '.ipm-foot select,.ipm-foot input[type=number]{background:rgba(15,16,14,0.95);'
      + 'border:1px solid rgba(58,59,55,0.9);color:var(--c-shell,#C6C7BD);border-radius:12px;'
      + 'padding:6px 10px;font-size:0.88rem;line-height:1.4;}'
      + '.ipm-foot input[type=number]{width:64px;}'
      + '.ipm-ok{background:var(--c-green,#71CD76);border-color:var(--c-green,#71CD76);'
      + 'color:#07211D;font-weight:600;}'
      + '.ipm-ok:hover{color:#07211D;border-color:var(--c-green,#71CD76);}'

      /* ---- NG 標記：工具列按鈕 ---- */
      + '.ip-btn.ip-rec{background:var(--c-urgent,#FF2E63);border-color:var(--c-urgent,#FF2E63);'
      + 'color:#0C0D0C;font-weight:600;}'
      + '.ip-btn.ip-rec:hover{color:#0C0D0C;border-color:var(--c-urgent,#FF2E63);}'
      + '.ip-dot.ip-recording{border-color:rgba(255,46,99,0.9);'
      + 'box-shadow:0 0 0 2px rgba(255,46,99,0.82),0 4px 14px rgba(0,0,0,0.82);}'

      /* ---- NG 標記：紅色遮罩，不擋任何操作，層級高於所有元件 ---- */
      + 'ui-ink-ng-mask{position:fixed;inset:0;z-index:990;display:none;pointer-events:none;'
      + 'background:rgba(255,46,99,0.9);}'
      + 'ui-ink-ng-mask.ip-on{display:block;}'

      /* ---- NG 標記：清單視窗 ---- */
      + 'ui-ink-ng-panel{position:fixed;inset:0;z-index:950;display:none;'
      + 'align-items:center;justify-content:center;background:rgba(12,13,12,0.9);}'
      + 'ui-ink-ng-panel.ip-on{display:flex;}'
      + '.ipn-box{width:min(960px,92vw);background:rgba(23,24,26,0.97);'
      + 'border:1px solid rgba(51,52,47,0.9);border-radius:12px;padding:24px 28px;'
      + 'box-shadow:0 14px 44px rgba(0,0,0,0.86);}'
      + '.ipn-box h4{margin:0 0 6px;font-size:1.1rem;line-height:1.4;color:var(--c-vanilla,#DBEDD8);}'
      + '.ipn-box p{margin:0 0 14px;font-size:0.85rem;line-height:1.6;color:#9a9b94;}'
      + '.ipn-box textarea{display:block;width:100%;box-sizing:border-box;resize:vertical;'
      + 'font-family:Consolas,"Courier New",monospace;font-size:0.95rem;line-height:1.6;'
      + 'padding:12px 14px;border-radius:10px;color:var(--c-shell,#C6C7BD);'
      + 'background:rgba(15,16,14,0.95);border:1px solid rgba(58,59,55,0.9);}'
      + '.ipn-foot{display:flex;align-items:center;gap:10px;margin-top:18px;flex-wrap:wrap;}'
      + '.ipn-foot .ipn-spacer{flex:1 1 auto;}'

      ;
    var style = document.createElement('style');
    style.id = 'ink-pen-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- 共用：以點序列作畫 ---------- */
  function paintStrokes(ctx, strokes) {
    strokes.forEach(function (s) {
      if (!s.points.length) return;
      ctx.save();
      ctx.strokeStyle = s.color;
      ctx.fillStyle = s.color;
      if (s.points.length === 1) {
        var d = s.points[0];
        ctx.beginPath();
        ctx.arc(d.x, d.y, Math.max(1, d.w / 2), 0, Math.PI * 2);
        ctx.fill();
      } else {
        for (var i = 1; i < s.points.length; i++) {
          var a = s.points[i - 1], b = s.points[i];
          ctx.lineWidth = b.w;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    });
  }

  /* =========================================================
   * <ui-ink-layer>
   *
   * 兩張畫布：ink 保留筆跡，laser 每幀重畫殘影。
   *
   * 屬性 data-anchor：
   *   "viewport"（預設）筆跡貼著視窗，捲動時跟著螢幕走
   *   "document"        筆跡貼著內容，捲動時跟著段落走（邊捲邊畫）
   *                     此模式下手指拖曳會捲動頁面，觸控筆與滑鼠負責作畫
   * 兩種模式可隨時互換，既有筆跡會依當下捲動量自動換算座標。
   *
   * 屬性 data-lock-scroll：繪圖時鎖定頁面捲動
   *   不寫此屬性        不鎖定，維持原本行為
   *   "true"（或空值）  觸控筆、雷射筆模式下都鎖定，按「關」才能捲動
   *   "pen"             只在觸控筆模式鎖定，雷射筆模式仍可捲動
   * 鎖定期間滾輪、觸控拖曳、方向鍵／PageUp／PageDown／空白鍵、拖曳捲軸都無效，
   * viewport 與 document 兩種座標模式一視同仁；document 模式下手指拖曳
   * 不再捲動頁面，改為和 viewport 模式一樣交給作畫（防手掌誤觸照常運作）。
   * 唯一例外是 <dot-go> 的同頁跳轉，仍會正常平滑捲動到目標。
   *
   * 事件 ink-scroll-lock：鎖定狀態改變時觸發
   *   detail: { locked, rule, mode }
   * ========================================================= */
  class UiInkLayer extends HTMLElement {
    static get observedAttributes() { return ['data-anchor', 'data-lock-scroll']; }

    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this.innerHTML = '<canvas data-role="ink"></canvas><canvas data-role="laser"></canvas>';
      this._ink = this.querySelector('[data-role="ink"]');
      this._laser = this.querySelector('[data-role="laser"]');
      this._ictx = this._ink.getContext('2d');
      this._lctx = this._laser.getContext('2d');

      this._mode = 'off';
      this._anchor = (this.getAttribute('data-anchor') === 'document') ? 'document' : 'viewport';
      this._color = PALETTE.vanilla;
      this._width = WIDTH_DEFAULT;
      this._strokes = [];
      this._trail = [];
      this._drawing = false;
      this._dirty = false;

      this._lockRule = parseLockRule(this.getAttribute('data-lock-scroll'));
      this._locked = false;
      this._lockX = 0;
      this._lockY = 0;
      this._passUntil = 0;

      this.classList.toggle('ip-doc', this._anchor === 'document');

      this._resize();
      window.addEventListener('resize', () => this._resize());
      window.addEventListener('scroll', () => {
        if (this._anchor === 'document') this._dirty = true;
        this._guardScroll();
      }, { passive: true });
      this._bindLock();
      this._bind();
      this._tick();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (!this._built) return;
      if (name === 'data-anchor') this._applyAnchor(newVal);
      if (name === 'data-lock-scroll') {
        this._lockRule = parseLockRule(newVal);
        this._updateLock();
      }
    }

    /* ---------- 捲動鎖定 ---------- */
    /* v：true／"all" 全部繪圖模式鎖定，"pen" 只鎖觸控筆，false／"none" 解除 */
    setScrollLock(v) {
      var rule;
      if (v === false || v === null || v === undefined) rule = 'none';
      else if (v === true) rule = 'all';
      else rule = parseLockRule(v);
      if (rule === 'none') this.removeAttribute('data-lock-scroll');
      else this.setAttribute('data-lock-scroll', rule === 'pen' ? 'pen' : 'true');
      return rule;
    }
    getScrollLock() { return this._lockRule; }
    isScrollLocked() { return this._locked; }

    /* 鎖定期間暫時放行程式端捲動（<dot-go> 同頁跳轉會呼叫） */
    allowScroll(ms) {
      this._passUntil = performance.now() + (Number(ms) || LOCK_PASS_MS);
    }

    _shouldLock() {
      if (this._lockRule === 'all') return this._mode !== 'off';
      if (this._lockRule === 'pen') return this._mode === 'pen';
      return false;
    }

    _updateLock() {
      var next = this._shouldLock();
      if (next === this._locked) return;
      this._locked = next;
      if (next) {
        this._lockX = window.scrollX;
        this._lockY = window.scrollY;
        this._scrollId = null;
      }
      document.documentElement.classList.toggle('ip-scroll-locked', next);
      this.dispatchEvent(new CustomEvent('ink-scroll-lock', {
        bubbles: true,
        detail: { locked: next, rule: this._lockRule, mode: this._mode }
      }));
    }

    /* 擋不掉的捲動（拖曳捲軸、錨點連結等）由這裡拉回原位 */
    _guardScroll() {
      if (!this._locked) return;
      var now = performance.now();
      if (now < this._passUntil) {
        /* 放行中：記下新位置，平滑捲動還在進行就順延 */
        this._lockX = window.scrollX;
        this._lockY = window.scrollY;
        this._passUntil = Math.max(this._passUntil, now + 180);
        return;
      }
      if (window.scrollX !== this._lockX || window.scrollY !== this._lockY) {
        window.scrollTo({ left: this._lockX, top: this._lockY, behavior: 'instant' });
      }
    }

    /* 在源頭擋下滾輪、觸控拖曳與捲動鍵，避免拉回時畫面抖動 */
    _bindLock() {
      var block = (e) => {
        if (!this._locked) return;
        if (e.type === 'wheel' && e.ctrlKey) return; /* Ctrl+滾輪是縮放，不是捲動 */
        if (e.cancelable) e.preventDefault();
      };
      window.addEventListener('wheel', block, { passive: false });
      window.addEventListener('touchmove', block, { passive: false });

      window.addEventListener('keydown', (e) => {
        if (!this._locked) return;
        if (SCROLL_KEYS.indexOf(e.key) === -1) return;
        if (isEditable(e.target)) return;
        /* 空白鍵在按鈕上是「按下按鈕」，不會捲動，放行 */
        if ((e.key === ' ' || e.key === 'Spacebar') && e.target &&
            e.target.tagName === 'BUTTON') return;
        e.preventDefault();
      }, true);
    }

    /* ---------- 座標模式 ---------- */
    setAnchor(mode) {
      var next = (mode === 'document') ? 'document' : 'viewport';
      this.setAttribute('data-anchor', next);
      this._applyAnchor(next);
      return next;
    }
    getAnchor() { return this._anchor; }

    /* 換算既有筆跡，讓畫面上的位置在切換瞬間維持不動 */
    _applyAnchor(value) {
      var next = (value === 'document') ? 'document' : 'viewport';
      if (next === this._anchor) return;
      var sign = (next === 'document') ? 1 : -1;
      var dx = window.scrollX * sign;
      var dy = window.scrollY * sign;
      this._strokes.forEach(function (s) {
        s.points.forEach(function (p) { p.x += dx; p.y += dy; });
      });
      this._trail.forEach(function (p) { p.x += dx; p.y += dy; });
      this._anchor = next;
      this.classList.toggle('ip-doc', next === 'document');
      this._redraw();
    }

    _ox() { return this._anchor === 'document' ? window.scrollX : 0; }
    _oy() { return this._anchor === 'document' ? window.scrollY : 0; }
    _pt(e) { return { x: e.clientX + this._ox(), y: e.clientY + this._oy() }; }

    /* ---------- 設定 ---------- */
    setMode(mode) {
      this._mode = mode;
      this.classList.toggle('ip-live', mode !== 'off');
      if (mode !== 'laser') this._trail = [];
      this._updateLock();
    }
    getMode() { return this._mode; }

    setColor(key) {
      this._color = brandOf(key) || key;
      return this._color;
    }
    getColor() { return this._color; }

    setWidth(px) {
      var n = Number(px) || WIDTH_DEFAULT;
      this._width = Math.min(WIDTH_MAX, Math.max(WIDTH_MIN, n));
      return this._width;
    }
    getWidth() { return this._width; }

    clear() {
      this._strokes = [];
      this._trail = [];
      this._redraw();
    }
    isEmpty() { return !this._strokes.length; }

    /* ---------- 繪圖 ---------- */
    _resize() {
      var dpr = window.devicePixelRatio || 1;
      var w = this.clientWidth, h = this.clientHeight;
      [this._ink, this._laser].forEach(function (cv) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      });
      [this._ictx, this._lctx].forEach(function (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      });
      this._redraw();
    }

    _redraw() {
      this._ictx.clearRect(0, 0, this.clientWidth, this.clientHeight);
      var ctx = this._ictx;
      ctx.save();
      ctx.translate(-this._ox(), -this._oy());
      paintStrokes(ctx, this._strokes);
      ctx.restore();
      this._dirty = false;
    }

    _drawLast(stroke) {
      var n = stroke.points.length;
      if (n < 2) return;
      var ctx = this._ictx;
      ctx.save();
      ctx.translate(-this._ox(), -this._oy());
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.points[n - 1].w;
      ctx.beginPath();
      ctx.moveTo(stroke.points[n - 2].x, stroke.points[n - 2].y);
      ctx.lineTo(stroke.points[n - 1].x, stroke.points[n - 1].y);
      ctx.stroke();
      ctx.restore();
    }

    /* 觸控筆有壓感時依壓力調整線寬，滑鼠則維持固定寬度 */
    _lineWidth(e) {
      if (e.pointerType === 'pen' && e.pressure > 0) {
        return Math.max(1, this._width * (0.35 + e.pressure * 1.5));
      }
      return this._width;
    }

    /* 觸點分工：
     *   一次只追蹤一個作畫的觸點，其他觸點（例如手掌）不會混進同一筆
     *   觸控筆剛離開螢幕的短時間內，手指觸碰一律忽略（防手掌誤觸）
     *   文件座標模式下，手指拖曳改為捲動頁面，觸控筆與滑鼠負責作畫
     *   捲動鎖定中則一律不捲動，手指觸碰比照 viewport 模式處理
     * 每次移動都讀取合併事件（getCoalescedEvents），筆走得快也不會漏點 */
    _bind() {
      this._drawId = null;
      this._scrollId = null;
      this._penAt = 0;

      var palm = () => performance.now() - this._penAt < PALM_MS;

      this.addEventListener('pointerdown', (e) => {
        if (this._mode === 'off') return;
        var touch = e.pointerType === 'touch';
        if (e.pointerType === 'pen') this._penAt = performance.now();

        if (touch && (this._drawId !== null || palm())) return;

        if (touch && this._anchor === 'document' && !this._locked) {
          if (this._scrollId !== null) return;
          this._scrollId = e.pointerId;
          this._sx = e.clientX;
          this._sy = e.clientY;
          this.setPointerCapture(e.pointerId);
          return;
        }

        if (this._drawId !== null) return;
        e.preventDefault();
        this.setPointerCapture(e.pointerId);
        this._drawId = e.pointerId;
        this._drawing = true;
        var p = this._pt(e);
        if (this._mode === 'laser') {
          this._trail.push({ x: p.x, y: p.y, t: performance.now() });
          return;
        }
        this._strokes.push({
          color: this._color,
          points: [{ x: p.x, y: p.y, w: this._lineWidth(e) }]
        });
        this._drawDot(this._strokes[this._strokes.length - 1]);
      });

      this.addEventListener('pointermove', (e) => {
        if (e.pointerId === this._scrollId) {
          if (this._locked) return;
          window.scrollBy(this._sx - e.clientX, this._sy - e.clientY);
          this._sx = e.clientX;
          this._sy = e.clientY;
          return;
        }
        if (e.pointerId !== this._drawId || this._mode === 'off') return;
        if (e.pointerType === 'pen') this._penAt = performance.now();

        var list = (typeof e.getCoalescedEvents === 'function') ? e.getCoalescedEvents() : [];
        if (!list || !list.length) list = [e];

        if (this._mode === 'laser') {
          var now = performance.now();
          list.forEach((ev) => {
            var lp = this._pt(ev);
            this._trail.push({ x: lp.x, y: lp.y, t: now });
          });
          return;
        }
        var s = this._strokes[this._strokes.length - 1];
        if (!s) return;
        list.forEach((ev) => {
          var p = this._pt(ev);
          s.points.push({ x: p.x, y: p.y, w: this._lineWidth(ev) });
          this._drawLast(s);
        });
      });

      var end = (e) => {
        if (e.pointerId === this._scrollId) {
          this._scrollId = null;
          return;
        }
        if (e.pointerId !== this._drawId) return;
        if (e.pointerType === 'pen') this._penAt = performance.now();
        this._drawId = null;
        this._drawing = false;
      };
      this.addEventListener('pointerup', end);
      this.addEventListener('pointercancel', end);
      this.addEventListener('lostpointercapture', end);
    }

    /* 點一下就放開時也要留下一個圓點 */
    _drawDot(stroke) {
      var p = stroke.points[0];
      var ctx = this._ictx;
      ctx.save();
      ctx.translate(-this._ox(), -this._oy());
      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.w / 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* 每幀重畫雷射殘影；文件座標模式下捲動後補畫筆跡 */
    _tick() {
      var step = () => {
        if (this._dirty) this._redraw();

        var ctx = this._lctx;
        ctx.clearRect(0, 0, this.clientWidth, this.clientHeight);
        var now = performance.now();
        this._trail = this._trail.filter(function (p) { return now - p.t < 620; });
        if (this._mode === 'laser' && this._trail.length > 1) {
          ctx.save();
          ctx.translate(-this._ox(), -this._oy());
          ctx.globalAlpha = 0.88;
          ctx.strokeStyle = PALETTE.red;
          ctx.shadowColor = PALETTE.red;
          ctx.shadowBlur = 14;
          for (var i = 1; i < this._trail.length; i++) {
            var a = this._trail[i - 1], b = this._trail[i];
            var life = 1 - (now - b.t) / 620;
            ctx.lineWidth = Math.max(1, this._width * 1.6 * life);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
          ctx.restore();
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }
  customElements.define('ui-ink-layer', UiInkLayer);

  /* =========================================================
   * <ink-handwrite>
   *
   * 用法：<ink-handwrite>__________</ink-handwrite>
   * 底線數量決定空格寬度，可辨識 5 至 15 個，超出範圍自動收斂。
   * 也可改用 data-slots="12" 直接指定。
   * ========================================================= */
  class InkHandwrite extends HTMLElement {
    /* 本檔在 <head> 載入時，解析器一讀到起始標籤就會升級元件，
     * 此時標籤內的底線還沒進來，因此等文件解析完才讀長度。 */
    connectedCallback() {
      if (this._built) return;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._init(), { once: true });
        return;
      }
      this._init();
    }

    _init() {
      if (this._built) return;
      this._built = true;

      this._answer = (this.getAttribute('answer') || '').trim();

      var n = Number(this.getAttribute('data-slots'));
      if (!n) {
        var hits = String(this.textContent || '').match(/[_＿]/g);
        /* 沒寫底線時，用答案長度推算格數 */
        n = hits ? hits.length : (this._answer ? this._answer.length : SLOT_FALLBACK);
      }
      this._slots = Math.min(SLOT_MAX, Math.max(SLOT_MIN, n));
      this.style.setProperty('--ih-n', this._slots);

      this.innerHTML =
        '<span class="ih-clip">' +
        '<span class="ih-icon">' + PEN_ICON + '</span>' +
        '<span class="ih-ans" data-role="ans"></span>' +
        '</span>' +
        (this._answer ? '<span class="ih-dot" data-role="dot" title="顯示解答"></span>' : '');

      this._clip = this.querySelector('.ih-clip');
      this._ansEl = this.querySelector('[data-role="ans"]');
      this._ansEl.textContent = this._answer;
      this.classList.toggle('ih-has-answer', !!this._answer);
      this.setAttribute('title', '點一下用觸控筆手寫（' + this._slots + ' 格寬）');

      this.addEventListener('click', () => {
        if (this.classList.contains('ih-answered')) this.hideAnswer();
        ensureModal().open(this);
      });

      var dot = this.querySelector('[data-role="dot"]');
      if (dot) {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleAnswer();
        });
      }
    }

    get slots() { return this._slots; }
    get answer() { return this._answer || ''; }

    getInk() { return this._ink || null; }
    hasInk() { return !!this._ink; }

    setInk(dataUrl) {
      this._ink = dataUrl || null;
      var img = this._clip.querySelector('img');
      if (!dataUrl) {
        if (img) img.remove();
        this.classList.remove('ih-filled');
        return;
      }
      if (!img) {
        img = document.createElement('img');
        img.alt = '';
        this._clip.appendChild(img);
      }
      img.src = dataUrl;
      this.classList.add('ih-filled');
    }

    clearInk() { this.setInk(null); }

    /* ---------- 解答 ---------- */
    hasAnswer() { return !!this._answer; }
    answerShown() { return this.classList.contains('ih-answered'); }

    /* 顯示解答會覆蓋手寫，筆跡不保留 */
    showAnswer() {
      if (!this._answer || this.answerShown()) return false;
      if (this._ink) this.setInk(null);
      this.classList.add('ih-answered');
      this._fitAnswer();
      this._emitAnswer(true);
      return true;
    }

    hideAnswer() {
      if (!this.answerShown()) return false;
      this.classList.remove('ih-answered');
      this._emitAnswer(false);
      return true;
    }

    toggleAnswer() {
      return this.answerShown() ? !this.hideAnswer() : this.showAnswer();
    }

    /* 答案比空格長時等比縮小，下限 0.6 倍 */
    _fitAnswer() {
      var el = this._ansEl;
      el.style.transform = 'none';
      var avail = this.clientWidth - 8;
      var need = el.scrollWidth;
      if (!need || need <= avail) return;
      var ratio = avail / need;
      if (ratio < ANSWER_MIN_SCALE) {
        warn('答案「' + this._answer + '」在 ' + this._slots
          + ' 格寬的空格裡放不下，已縮到下限 ' + ANSWER_MIN_SCALE + ' 倍，建議加長底線。');
        ratio = ANSWER_MIN_SCALE;
      }
      el.style.transform = 'scale(' + ratio + ')';
    }

    _emitAnswer(shown) {
      this.dispatchEvent(new CustomEvent('ink-answer', {
        bubbles: true,
        detail: { el: this, shown: shown, answer: this._answer, slots: this._slots }
      }));
    }
  }
  customElements.define('ink-handwrite', InkHandwrite);

  /* =========================================================
   * <ui-ink-modal>
   * 手寫視窗。每次開啟都是空白畫布，確認後把筆跡裁切成最小外框，
   * 再以圖片塞回空格；確認時若未書寫，等同清空該空格。
   * ========================================================= */
  class UiInkModal extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;

      this.innerHTML =
        '<div class="ipm-box" data-role="box">' +
        '<div class="ipm-head"><h4>手寫填空</h4><span data-role="sub"></span></div>' +
        '<div class="ipm-pad" data-role="pad"><canvas data-role="cv"></canvas>' +
        '<span class="ipm-base"></span></div>' +
        '<div class="ipm-foot">' +
        '<span class="ip-swatch" data-role="swatch"></span>' +
        '<select data-role="color" title="筆跡色彩"></select>' +
        '<input type="number" data-role="width" min="' + HW_MIN + '" max="' + HW_MAX +
        '" step="1" value="' + HW_DEFAULT + '" title="筆跡粗細" />' +
        '<button type="button" class="ip-btn" data-act="clear">清除重寫</button>' +
        '<span class="ipm-spacer"></span>' +
        '<button type="button" class="ip-btn" data-act="cancel">取消 Esc</button>' +
        '<button type="button" class="ip-btn ipm-ok" data-act="ok">確認填入</button>' +
        '</div></div>';

      this._box = this.querySelector('[data-role="box"]');
      this._pad = this.querySelector('[data-role="pad"]');
      this._cv = this.querySelector('[data-role="cv"]');
      this._ctx = this._cv.getContext('2d');
      this._sub = this.querySelector('[data-role="sub"]');
      this._select = this.querySelector('[data-role="color"]');
      this._widthInput = this.querySelector('[data-role="width"]');
      this._swatch = this.querySelector('[data-role="swatch"]');

      this._strokes = [];
      this._drawing = false;
      this._color = PALETTE.vanilla;
      this._width = HW_DEFAULT;
      this._target = null;

      this._wire();
    }

    _wire() {
      this.addEventListener('click', (e) => { if (e.target === this) this.close(); });
      this._box.addEventListener('click', function (e) { e.stopPropagation(); });

      this.querySelector('[data-act="clear"]').addEventListener('click', () => this.clearPad());
      this.querySelector('[data-act="cancel"]').addEventListener('click', () => this.close());
      this.querySelector('[data-act="ok"]').addEventListener('click', () => this.confirm());

      this._select.addEventListener('change', () => this._syncPen());
      this._widthInput.addEventListener('change', () => this._syncPen());
      this._widthInput.addEventListener('input', () => this._syncPen());

      document.addEventListener('keydown', (e) => {
        if (!this.classList.contains('ip-on')) return;
        if (e.key === 'Escape') { e.preventDefault(); this.close(); }
      });

      this._bindPad();
    }

    isOpen() { return this.classList.contains('ip-on'); }

    /* ---------- 開關 ---------- */
    open(target) {
      this._target = target || null;
      this._loadColors();
      this._sizePad(target);
      this.clearPad();
      this._sub.textContent = target
        ? ('空格寬度 ' + target.slots + ' 格，寫完按確認填入')
        : '寫完按確認填入';
      this.classList.add('ip-on');
    }

    close() {
      this.classList.remove('ip-on');
      this._target = null;
      this._strokes = [];
    }

    clearPad() {
      this._strokes = [];
      this._ctx.clearRect(0, 0, this._cv.clientWidth, this._cv.clientHeight);
    }

    /* 色彩選單跟著工具列走，包含 extra-color 自訂色 */
    _loadColors() {
      var bar = document.querySelector('ui-ink-bar');
      var barSel = bar && bar.querySelector('[data-role="color"]');
      if (barSel) {
        this._select.innerHTML = barSel.innerHTML;
        this._select.value = barSel.value;
      } else if (!this._select.options.length) {
        this._select.innerHTML = PEN_OPTIONS.map(function (o) {
          return '<option value="' + o[0] + '">' + o[1] + '</option>';
        }).join('');
      }
      this._syncPen();
    }

    _syncPen() {
      var key = this._select.value;
      this._color = brandOf(key) || key;
      this._swatch.style.background = this._color;
      var n = Number(this._widthInput.value) || HW_DEFAULT;
      this._width = Math.min(HW_MAX, Math.max(HW_MIN, n));
      if (String(this._width) !== String(this._widthInput.value) && this._widthInput.value !== '') {
        this._widthInput.value = this._width;
      }
    }

    /* 畫布比例貼近目標空格，寫出來的字塞回去才不會變形 */
    _sizePad(target) {
      var w = Math.min(920, Math.round(window.innerWidth * 0.84));
      var h = 200;
      if (target) {
        var r = target.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          h = Math.round(w * (r.height / r.width));
        }
      }
      h = Math.min(340, Math.max(170, h));
      this._pad.style.width = w + 'px';
      this._pad.style.height = h + 'px';

      var dpr = window.devicePixelRatio || 1;
      this._cv.width = Math.round(w * dpr);
      this._cv.height = Math.round(h * dpr);
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._ctx.lineCap = 'round';
      this._ctx.lineJoin = 'round';
    }

    _lineWidth(e) {
      if (e.pointerType === 'pen' && e.pressure > 0) {
        return Math.max(1, this._width * (0.35 + e.pressure * 1.5));
      }
      return this._width;
    }

    _bindPad() {
      var pt = (e) => {
        var r = this._cv.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      };

      this._cv.addEventListener('pointerdown', (e) => {
        this._cv.setPointerCapture(e.pointerId);
        this._drawing = true;
        var p = pt(e);
        this._strokes.push({
          color: this._color,
          points: [{ x: p.x, y: p.y, w: this._lineWidth(e) }]
        });
        this._dot(this._strokes[this._strokes.length - 1]);
      });

      this._cv.addEventListener('pointermove', (e) => {
        if (!this._drawing) return;
        var s = this._strokes[this._strokes.length - 1];
        if (!s) return;
        var p = pt(e);
        s.points.push({ x: p.x, y: p.y, w: this._lineWidth(e) });
        this._drawLast(s);
      });

      var end = () => { this._drawing = false; };
      this._cv.addEventListener('pointerup', end);
      this._cv.addEventListener('pointercancel', end);
      this._cv.addEventListener('pointerleave', end);
    }

    _dot(stroke) {
      var p = stroke.points[0];
      var ctx = this._ctx;
      ctx.save();
      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.w / 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    _drawLast(stroke) {
      var n = stroke.points.length;
      if (n < 2) return;
      var ctx = this._ctx;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.points[n - 1].w;
      ctx.beginPath();
      ctx.moveTo(stroke.points[n - 2].x, stroke.points[n - 2].y);
      ctx.lineTo(stroke.points[n - 1].x, stroke.points[n - 1].y);
      ctx.stroke();
      ctx.restore();
    }

    /* 裁切成筆跡的最小外框再輸出，空格裡才不會留一大片空白 */
    _crop() {
      if (!this._strokes.length) return null;
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, maxW = 1;
      this._strokes.forEach(function (s) {
        s.points.forEach(function (p) {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
          if (p.w > maxW) maxW = p.w;
        });
      });
      var pad = maxW / 2 + 6;
      minX -= pad; minY -= pad; maxX += pad; maxY += pad;
      var w = Math.max(10, maxX - minX);
      var h = Math.max(10, maxY - minY);

      var dpr = Math.min(3, window.devicePixelRatio || 1);
      var cv = document.createElement('canvas');
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      var ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.translate(-minX, -minY);
      paintStrokes(ctx, this._strokes);
      return cv.toDataURL('image/png');
    }

    confirm() {
      var target = this._target;
      if (!target) { this.close(); return; }
      var url = this._crop();
      target.setInk(url);
      target.dispatchEvent(new CustomEvent('ink-written', {
        bubbles: true,
        detail: { el: target, dataUrl: url, empty: !url, slots: target.slots }
      }));
      this.close();
    }
  }
  customElements.define('ui-ink-modal', UiInkModal);

  function ensureModal() {
    var m = document.querySelector('ui-ink-modal');
    if (!m) {
      m = document.createElement('ui-ink-modal');
      document.body.appendChild(m);
    }
    return m;
  }

  /* =========================================================
   * NG 標記：遮罩與清單視窗
   * ========================================================= */
  function ensureNgMask() {
    var m = document.querySelector('ui-ink-ng-mask');
    if (!m) {
      m = document.createElement('ui-ink-ng-mask');
      document.body.appendChild(m);
    }
    return m;
  }

  class UiInkNgPanel extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this.innerHTML =
        '<div class="ipn-box">' +
        '<h4>NG 標記清單</h4>' +
        '<p>時間皆為粗定位，剪輯時請對照影片裡的紅色遮罩判斷精準位置。</p>' +
        '<textarea rows="12" readonly spellcheck="false" data-role="text"></textarea>' +
        '<div class="ipn-foot">' +
        '<button type="button" class="ip-btn" data-act="copy">複製</button>' +
        '<button type="button" class="ip-btn" data-act="download">下載 .txt</button>' +
        '<button type="button" class="ip-btn" data-act="reset">清空紀錄</button>' +
        '<span class="ipn-spacer"></span>' +
        '<button type="button" class="ip-btn ipm-ok" data-act="close">關閉</button>' +
        '</div></div>';

      this._ta = this.querySelector('[data-role="text"]');
      this.querySelector('[data-act="copy"]').addEventListener('click', (e) => this._copy(e.currentTarget));
      this.querySelector('[data-act="download"]').addEventListener('click', () => this._download());
      this.querySelector('[data-act="reset"]').addEventListener('click', (e) => this._reset(e.currentTarget));
      this.querySelector('[data-act="close"]').addEventListener('click', () => this.close());
      /* 點背景關閉 */
      this.addEventListener('mousedown', (e) => { if (e.target === this) this.close(); });
    }

    isOpen() { return this.classList.contains('ip-on'); }

    open() {
      this.refresh();
      this.classList.add('ip-on');
    }

    close() { this.classList.remove('ip-on'); }

    refresh() {
      if (!this._ta) return;
      var ng = window.InkPen && window.InkPen.ng;
      this._ta.value = ng ? ng.text() : '';
    }

    /* 按鈕文字暫時換成提示，不用 alert */
    _flash(btn, label) {
      var old = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', old);
      btn.textContent = label;
      clearTimeout(btn._t);
      btn._t = setTimeout(function () { btn.textContent = old; }, 1400);
    }

    _copy(btn) {
      var ta = this._ta;
      var done = () => this._flash(btn, '已複製');
      var fallback = () => {
        ta.focus();
        ta.select();
        try {
          if (document.execCommand('copy')) done(); else warn('複製失敗，請手動選取文字複製');
        } catch (err) { warn('複製失敗，請手動選取文字複製'); }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(done, fallback);
      } else {
        fallback();
      }
    }

    _download() {
      var text = this._ta.value;
      var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      var started = window.InkPen.ng.startedAt();
      a.href = url;
      a.download = 'ink-pen-ng-' + fmtStamp(started || Date.now()) + '.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    /* 需連按兩次才清空，避免誤觸 */
    _reset(btn) {
      if (btn._armed) {
        btn._armed = false;
        clearTimeout(btn._t2);
        window.InkPen.ng.clear();
        btn.textContent = '清空紀錄';
        this.refresh();
        return;
      }
      btn._armed = true;
      btn.textContent = '再按一次確認';
      clearTimeout(btn._t2);
      btn._t2 = setTimeout(function () {
        btn._armed = false;
        btn.textContent = '清空紀錄';
      }, 3000);
    }
  }
  customElements.define('ui-ink-ng-panel', UiInkNgPanel);

  function ensureNgPanel() {
    var p = document.querySelector('ui-ink-ng-panel');
    if (!p) {
      p = document.createElement('ui-ink-ng-panel');
      document.body.appendChild(p);
    }
    return p;
  }

  /* =========================================================
   * <ui-ink-bar>
   * 屬性：
   *   data-pos="br|bl|tr|tl"   擺放位置，預設右下角
   *   data-open="true"         載入時直接展開，預設收合成小圓鈕
   *   extra-color="#FFFFFF"    追加一個自訂筆色，載入時自動選用；也可填品牌色名稱，例如 extra-color="key"
   *   extra-label="純白"       自訂筆色的顯示名稱，省略時顯示色碼
   * ========================================================= */
  class UiInkBar extends HTMLElement {
    static get observedAttributes() { return ['extra-color', 'extra-label']; }

    connectedCallback() {
      if (this._built) return;
      this._built = true;

      this.innerHTML =
        '<button type="button" class="ip-dot" data-role="dot" title="展開畫筆工具列（H）">' +
        '<i data-role="dotcolor"></i></button>' +
        '<div class="ip-bar ip-hidden" data-role="bar">' +
        '<button type="button" class="ip-btn" data-mode="pen" title="觸控筆（' +
        modeKeyLabel('pen') + '）">筆</button>' +
        '<button type="button" class="ip-btn" data-mode="laser" title="雷射筆（' +
        modeKeyLabel('laser') + '）">雷射</button>' +
        '<button type="button" class="ip-btn ip-active" data-mode="off" title="關閉繪圖（' +
        modeKeyLabel('off') + '）">關</button>' +
        '<span class="ip-sep"></span>' +
        '<span class="ip-swatch" data-role="swatch"></span>' +
        '<select data-role="color" title="筆跡色彩"></select>' +
        '<input type="number" data-role="width" min="' + WIDTH_MIN + '" max="' + WIDTH_MAX +
        '" step="1" value="' + WIDTH_DEFAULT + '" title="筆跡粗細（' + WIDTH_MIN + ' 至 ' + WIDTH_MAX + ' px）" />' +
        '<span class="ip-sep"></span>' +
        '<button type="button" class="ip-btn" data-act="clear">清除 C</button>' +
        '<span class="ip-sep"></span>' +
        '<button type="button" class="ip-btn" data-act="rec" title="開始或結束 NG 計時（' +
        actionKeyLabel('rec') + '）">錄</button>' +
        '<button type="button" class="ip-btn" data-act="ng" title="標記 NG，顯示紅色遮罩（' +
        actionKeyLabel('ng') + '）">NG</button>' +
        '<button type="button" class="ip-btn" data-act="nglist" title="檢視 NG 標記清單">清單</button>' +
        '<span class="ip-sep"></span>' +
        '<button type="button" class="ip-btn" data-act="hide">收合 H</button>' +
        '</div>';

      this._bar = this.querySelector('[data-role="bar"]');
      this._dot = this.querySelector('[data-role="dot"]');
      this._dotColor = this.querySelector('[data-role="dotcolor"]');
      this._swatch = this.querySelector('[data-role="swatch"]');
      this._select = this.querySelector('[data-role="color"]');

      this._ng = this._ngLoad();
      this._renderColors(true);
      this._wire();
      this._syncPen();
      this._ngSyncUi();
      if (this.getAttribute('data-open') === 'true') this.toggleBar(true);
      this._bindKeys();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (!this._built) return;
      if (name === 'extra-color' || name === 'extra-label') this._renderColors(true);
    }

    get layer() { return document.querySelector('ui-ink-layer'); }

    /* ---------- 色彩選單 ---------- */
    _extra() {
      var raw = (this.getAttribute('extra-color') || '').trim();
      if (!raw) return null;
      var hex = brandOf(raw);
      if (!HEX_RE.test(hex)) {
        warn('extra-color 格式不符，請用 #RGB、#RRGGBB 或品牌色名稱：' + raw);
        return null;
      }
      var label = (this.getAttribute('extra-label') || '').trim();
      var named = hex !== raw;
      return { hex: hex.toUpperCase(), label: label || ('自訂 ' + (named ? raw.toLowerCase() : hex.toUpperCase())) };
    }

    /* selectExtra 為 true 時，若有自訂色就自動選用 */
    _renderColors(selectExtra) {
      var prev = this._select.value;
      var extra = this._extra();
      var html = PEN_OPTIONS.map(function (o) {
        return '<option value="' + o[0] + '">' + o[1] + '</option>';
      }).join('');
      if (extra) {
        html += '<option value="' + extra.hex + '">' + extra.label + '</option>';
      }
      this._select.innerHTML = html;

      if (extra && (selectExtra || prev === '' || prev === undefined)) {
        this._select.value = extra.hex;
      } else if (prev && this._select.querySelector('option[value="' + prev + '"]')) {
        this._select.value = prev;
      }
      this._syncPen();
    }

    /* 程式端追加或更換自訂色 */
    setExtraColor(hex, label) {
      if (!hex) {
        this.removeAttribute('extra-color');
        this.removeAttribute('extra-label');
        return null;
      }
      if (!HEX_RE.test(String(hex).trim())) {
        warn('extra-color 格式不符，請用 #RGB 或 #RRGGBB：' + hex);
        return null;
      }
      if (label) this.setAttribute('extra-label', label);
      this.setAttribute('extra-color', String(hex).trim());
      return String(hex).trim().toUpperCase();
    }

    _wire() {
      this.querySelectorAll('[data-mode]').forEach((btn) => {
        btn.addEventListener('click', () => this.setMode(btn.getAttribute('data-mode')));
      });
      this.querySelector('[data-act="clear"]').addEventListener('click', () => this.clear());
      this.querySelector('[data-act="hide"]').addEventListener('click', () => this.toggleBar(false));
      this.querySelector('[data-act="rec"]').addEventListener('click', () => this.ngToggle());
      this.querySelector('[data-act="ng"]').addEventListener('click', () => this.ngMark());
      this.querySelector('[data-act="nglist"]').addEventListener('click', () => this.ngOpenPanel());
      this._dot.addEventListener('click', () => this.toggleBar());

      var widthInput = this.querySelector('[data-role="width"]');
      this._select.addEventListener('change', () => this._syncPen());
      widthInput.addEventListener('change', () => this._syncPen());
      widthInput.addEventListener('input', () => this._syncPen());
    }

    _syncPen() {
      var key = this._select.value;
      var widthInput = this.querySelector('[data-role="width"]');
      var color = PALETTE[key] || key;
      this._swatch.style.background = color;
      this._dotColor.style.background = color;
      if (this.layer) {
        this.layer.setColor(key);
        var applied = this.layer.setWidth(widthInput.value);
        if (String(applied) !== String(widthInput.value) && widthInput.value !== '') {
          widthInput.value = applied;
        }
      }
    }

    /* ---------- 行為 ---------- */
    setMode(mode) {
      if (this.layer) this.layer.setMode(mode);
      this.querySelectorAll('[data-mode]').forEach(function (b) {
        b.classList.toggle('ip-active', b.getAttribute('data-mode') === mode);
      });
      this._dot.classList.toggle('ip-armed', mode !== 'off');
      this._dot.setAttribute('title', mode === 'off'
        ? '展開畫筆工具列（H）'
        : (mode === 'pen' ? '觸控筆作用中（H 展開工具列）' : '雷射筆作用中（H 展開工具列）'));
    }

    /* 座標模式的便捷入口，實際狀態仍存在繪圖層 */
    setAnchor(mode) {
      if (!this.layer) return null;
      return this.layer.setAnchor(mode);
    }
    getAnchor() { return this.layer ? this.layer.getAnchor() : null; }

    /* 捲動鎖定的便捷入口，實際狀態存在繪圖層的 data-lock-scroll */
    setScrollLock(v) {
      if (!this.layer) return null;
      return this.layer.setScrollLock(v);
    }
    getScrollLock() { return this.layer ? this.layer.getScrollLock() : null; }

    clear() {
      if (this.layer) this.layer.clear();
    }

    toggleBar(force) {
      var next = (force === undefined) ? this._bar.classList.contains('ip-hidden') : !!force;
      this._bar.classList.toggle('ip-hidden', !next);
      return next;
    }

    /* ---------- NG 標記 ---------- */
    _ngBlank() {
      return {
        running: false, startedAt: 0, endedAt: 0,
        startOffset: NG_START_OFFSET_S, ngOffset: NG_OFFSET_S, marks: []
      };
    }

    _ngLoad() {
      try {
        var raw = window.localStorage.getItem(NG_STORE_KEY);
        if (!raw) return this._ngBlank();
        var d = JSON.parse(raw);
        if (!d || !Array.isArray(d.marks)) return this._ngBlank();
        return {
          running: !!d.running,
          startedAt: Number(d.startedAt) || 0,
          endedAt: Number(d.endedAt) || 0,
          startOffset: isFinite(Number(d.startOffset)) ? Number(d.startOffset) : NG_START_OFFSET_S,
          ngOffset: isFinite(Number(d.ngOffset)) ? Number(d.ngOffset) : NG_OFFSET_S,
          marks: d.marks.map(Number).filter(function (n) { return isFinite(n); })
        };
      } catch (e) {
        return this._ngBlank();
      }
    }

    _ngSave() {
      try {
        window.localStorage.setItem(NG_STORE_KEY, JSON.stringify(this._ng));
      } catch (e) {
        warn('NG 紀錄無法寫入 localStorage：' + e.message);
      }
    }

    /* 狀態變動後：存檔、更新按鈕、清單視窗開著就同步刷新 */
    _ngChanged() {
      this._ngSave();
      this._ngSyncUi();
      var p = document.querySelector('ui-ink-ng-panel');
      if (p && p.isOpen && p.isOpen()) p.refresh();
    }

    _ngSyncUi() {
      var rec = this.querySelector('[data-act="rec"]');
      var on = !!this._ng.running;
      rec.classList.toggle('ip-rec', on);
      rec.textContent = on ? '停' : '錄';
      rec.setAttribute('title', (on ? '結束 NG 計時（' : '開始或結束 NG 計時（') + actionKeyLabel('rec') + '）');
      this._dot.classList.toggle('ip-recording', on);
    }

    ngIsRecording() { return !!this._ng.running; }
    ngStartedAt() { return this._ng.startedAt || 0; }

    ngStart() {
      if (this._ng.running) return false;
      this._ng = {
        running: true,
        startedAt: Date.now(),
        endedAt: 0,
        startOffset: numAttr(this, 'data-ng-start-offset', NG_START_OFFSET_S),
        ngOffset: numAttr(this, 'data-ng-offset', NG_OFFSET_S),
        marks: []
      };
      this._ngChanged();
      return true;
    }

    ngStop() {
      if (!this._ng.running) return false;
      this._ng.running = false;
      this._ng.endedAt = Date.now();
      this._ngChanged();
      return true;
    }

    ngToggle() {
      return this._ng.running ? !this.ngStop() : this.ngStart();
    }

    /* 遮罩一定會顯示（它本身就是影片裡的記號）；計時中才會記下時間點。
     * 回傳這次標記的經過毫秒，沒在計時則回傳 null */
    ngMark() {
      this._ngShowMask();
      if (!this._ng.running) {
        warn('尚未開始計時，只顯示遮罩，沒有記下時間點。請先按「錄」。');
        return null;
      }
      var now = Date.now();
      this._ng.marks.push(now);
      this._ngChanged();
      return now - this._ng.startedAt;
    }

    _ngShowMask() {
      var el = ensureNgMask();
      var ms = numAttr(this, 'data-ng-mask-ms', NG_MASK_MS);
      el.classList.add('ip-on');
      clearTimeout(this._ngMaskTimer);
      this._ngMaskTimer = setTimeout(function () { el.classList.remove('ip-on'); }, ms);
    }

    ngClear() {
      var wasRunning = this._ng.running;
      if (wasRunning) {
        this._ng.marks = [];
      } else {
        this._ng = this._ngBlank();
      }
      this._ngChanged();
    }

    ngText() {
      var s = this._ng;
      if (!s.startedAt) return '尚無紀錄。按工具列的「錄」開始計時。';
      var so = s.startOffset;
      var no = s.ngOffset;
      var lines = [];
      lines.push('ink-pen NG 標記清單');
      lines.push('開始計時：' + fmtClock(s.startedAt) + '（前推 ' + so + ' 秒：' + fmtClock(s.startedAt - so * 1000) + '）');
      if (s.running) {
        lines.push('狀態：計時中，已過 ' + fmtElapsed(Date.now() - s.startedAt));
      } else {
        lines.push('結束計時：' + fmtClock(s.endedAt) + '，總長 ' + fmtElapsed(s.endedAt - s.startedAt));
      }
      lines.push('時間以按下「錄」那一刻為 00:00.0，每筆標記前推 ' + no + ' 秒，不足 0 以 00:00.0 計。');
      lines.push('');
      lines.push('開始    按鍵 ' + fmtElapsed(0) + '    建議剪輯點 ' + fmtElapsed(-so * 1000));
      if (!s.marks.length) {
        lines.push('（目前沒有 NG 標記）');
      } else {
        s.marks.forEach(function (t, i) {
          var el = t - s.startedAt;
          var n = String(i + 1);
          lines.push('NG ' + (n.length < 2 ? '0' + n : n) + '  按鍵 ' + fmtElapsed(el) +
            '    建議剪輯點 ' + fmtElapsed(el - no * 1000));
        });
      }
      return lines.join('\n');
    }

    ngOpenPanel() {
      ensureNgPanel().open();
    }

    /* ---------- 快捷鍵 ---------- */
    _matchActionKey(e) {
      if (!e.ctrlKey || !e.shiftKey || e.altKey || e.metaKey) return null;
      var code = e.code || '';
      for (var i = 0; i < ACTION_KEYS.length; i++) {
        var k = ACTION_KEYS[i];
        if (code === k.code) return k.action;
        if ((!code || code === 'Unidentified') && k.keys.indexOf(e.key) !== -1) return k.action;
      }
      return null;
    }

    /* 模式切換用 Ctrl+Shift 組合鍵，依實體按鍵（e.code）判斷，
     * 因為按住 Shift 時 e.key 會變成 ! @ ~，中文輸入法下也可能不準 */
    _matchModeKey(e) {
      if (!e.ctrlKey || !e.shiftKey || e.altKey || e.metaKey) return null;
      var code = e.code || '';
      for (var i = 0; i < MODE_KEYS.length; i++) {
        var k = MODE_KEYS[i];
        if (code === k.code) return k.mode;
        if ((!code || code === 'Unidentified') && k.keys.indexOf(e.key) !== -1) return k.mode;
      }
      return null;
    }

    _bindKeys() {
      document.addEventListener('keydown', (e) => {
        var modal = document.querySelector('ui-ink-modal');
        if (modal && modal.isOpen && modal.isOpen()) return;

        /* NG 清單視窗開著時，Esc 關閉它 */
        var ngPanel = document.querySelector('ui-ink-ng-panel');
        var panelOpen = !!(ngPanel && ngPanel.isOpen && ngPanel.isOpen());
        if (panelOpen && e.key === 'Escape') {
          e.preventDefault();
          ngPanel.close();
          return;
        }

        /* 組合鍵不會和打字衝突，游標在輸入框裡也照樣切換 */
        var mode = this._matchModeKey(e);
        if (mode) {
          e.preventDefault();
          this.setMode(mode);
          return;
        }

        /* NG 標記：按住不放不重複觸發 */
        var act = this._matchActionKey(e);
        if (act) {
          e.preventDefault();
          if (e.repeat) return;
          if (act === 'rec') this.ngToggle(); else this.ngMark();
          return;
        }

        if (panelOpen) return;
        if (isEditable(e.target)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        switch (e.key) {
          case 'c': case 'C': this.clear(); break;
          case 'h': case 'H': this.toggleBar(); break;
          case 'a': case 'A': window.InkPen.toggleAnswers(); break;
          default: return;
        }
        e.preventDefault();
      });
    }
  }
  customElements.define('ui-ink-bar', UiInkBar);


  /* ---------- 對外介面 ---------- */
  function InkPenBar() { return document.querySelector('ui-ink-bar'); }
  injectStyles();
  window.InkPen = {
    palette: PALETTE,
    penColorOptions: PEN_OPTIONS,
    widthRange: { min: WIDTH_MIN, max: WIDTH_MAX, def: WIDTH_DEFAULT },
    handwriteRange: { min: HW_MIN, max: HW_MAX, def: HW_DEFAULT },
    slotRange: { min: SLOT_MIN, max: SLOT_MAX },
    shortcuts: MODE_KEYS.map(function (k) { return { mode: k.mode, label: k.label, code: k.code }; })
      .concat(ACTION_KEYS.map(function (k) { return { action: k.action, label: k.label, code: k.code }; })),
    /* NG 標記：給程式或 demo 呼叫，實際狀態存在工具列與 localStorage */
    ng: {
      start: function () { var b = InkPenBar(); return b ? b.ngStart() : false; },
      stop: function () { var b = InkPenBar(); return b ? b.ngStop() : false; },
      toggle: function () { var b = InkPenBar(); return b ? b.ngToggle() : false; },
      mark: function () { var b = InkPenBar(); return b ? b.ngMark() : null; },
      clear: function () { var b = InkPenBar(); if (b) b.ngClear(); },
      text: function () { var b = InkPenBar(); return b ? b.ngText() : ''; },
      isRecording: function () { var b = InkPenBar(); return b ? b.ngIsRecording() : false; },
      startedAt: function () { var b = InkPenBar(); return b ? b.ngStartedAt() : 0; },
      openPanel: function () { var b = InkPenBar(); if (b) b.ngOpenPanel(); }
    },
    layer: function () { return document.querySelector('ui-ink-layer'); },
    /* 捲動鎖定：true 全部繪圖模式、"pen" 只鎖觸控筆、false 解除 */
    lockScroll: function (v) {
      var l = this.layer();
      return (l && l.setScrollLock) ? l.setScrollLock(v) : null;
    },
    bar: function () { return document.querySelector('ui-ink-bar'); },
    modal: function () { return ensureModal(); },
    blanks: function () {
      return Array.prototype.slice.call(document.querySelectorAll('ink-handwrite'));
    },
    clearBlanks: function () {
      this.blanks().forEach(function (b) { b.clearInk(); });
    },
    /* 只影響有 answer 屬性的空格 */
    answerBlanks: function () {
      return this.blanks().filter(function (b) { return b.hasAnswer && b.hasAnswer(); });
    },
    showAnswers: function (on) {
      var show = (on === undefined) ? true : !!on;
      this.answerBlanks().forEach(function (b) {
        if (show) b.showAnswer(); else b.hideAnswer();
      });
      return show;
    },
    /* 只要還有沒顯示的就全部顯示，否則全部收起 */
    toggleAnswers: function () {
      var list = this.answerBlanks();
      if (!list.length) return false;
      var anyHidden = list.some(function (b) { return !b.answerShown(); });
      return this.showAnswers(anyHidden);
    }
  };

  /* dot-go.js 比本檔早載入時，把它的介面接到 InkPen，舊頁面的 InkPen.dots()、InkPen.transition() 照常可用 */
  if (window.DotGo) {
    ['dotStyles', 'dots', 'transitions', 'transitionSupport', 'transition'].forEach(function (k) {
      window.InkPen[k] = window.DotGo[k];
    });
  }
})();
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
