/* =========================================================
 * dot-go.js
 * 跳轉圓點與簡報式轉場（由 ink-pen.js 拆出的獨立元件）
 * 零依賴，單檔即可運作；和 ink-pen.js 一起使用時自動配合繪圖層
 *
 * 自訂標籤：
 *   <dot-go>  跳轉圓點，可跳到同頁標籤或其他網頁，
 *             可加 transition 播放簡報式轉場（View Transitions API，見「轉場」段落）
 *
 * 與 ink-pen.js 的配合（沒載入 ink-pen.js 時這些功能自動略過）：
 *   圓點的 z-index 高於繪圖層，開著觸控筆或雷射筆也點得到
 *   繪圖層鎖定捲動時，同頁跳轉仍可捲動
 *   clear-ink 屬性會在跳轉前清除繪圖層筆跡
 *   轉場時工具列與 NG 遮罩固定在原位
 *   兩支檔案的載入順序不拘
 *
 * 跨頁轉場時，出發頁與目的頁都要在 <head> 裡載入 dot-go.js。
 *
 * 對外介面：window.DotGo
 *   .dots()               取得頁面上所有 <dot-go>
 *   .dotStyles            dot-style 可用值
 *   .palette              配色表
 *   .transitions          轉場種類清單
 *   .transitionSupport    瀏覽器支援狀況 { sameDocument, crossDocument }
 *   .transition(name, fn, { ms, edge, direction, scope })
 *                         自訂換畫面時套用轉場，fn 負責實際換畫面
 * 同時載入 ink-pen.js 時，以上介面也會掛到 window.InkPen，舊頁面的寫法照常可用。
 *
 * 本元件不在畫面上顯示任何提示訊息，設定錯誤只寫入 console。
 * ========================================================= */
(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.customElements || customElements.get('dot-go')) return;

  var PALETTE = {
    bg: '#0C0D0C', shell: '#C6C7BD',
    vanilla: '#DBEDD8', yellow: '#E3D322',
    indigo: '#778CE1', pink: '#FF91D7',
    red: '#EF6661',
    green: '#71CD76',
    blue: '#5DBAE8',
    violet: '#B484E8',
    gray: '#86877F',
    key: '#51DBCF',
    calm: '#A3C4BC',
    quiet: '#8EA4DE',
    playful: '#FFA987',
    urgent: '#FF2E63',
    energetic: '#B6FF00',
    dreamy: '#DE8EC9',
    'bg-alternative': '#3B2A20'
  };
  var HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  /* 繪圖層鎖定捲動時，同頁跳轉可放行的平滑捲動時間 */
  var LOCK_PASS_MS = 700;

  function warn(msg) {
    if (window.console && console.warn) console.warn('[dot-go] ' + msg);
  }

  /* =========================================================
   * <dot-go>
   *
   * 用法：
   *   <dot-go href="#part2" theme="blue" dot-style="star-fill"></dot-go>
   *   <dot-go href="lesson-02.html" theme="pink" dot-style="square">下一課</dot-go>
   *
   * 屬性：
   *   href         目標。"#id" 為同頁平滑捲動，其餘視為網址
   *   theme        配色表名稱（blue、pink…）或 #RGB／#RRGGBB，預設 blue
   *   dot-style    circle | circle-fill | star | star-fill | square | square-fill | icon
   *                預設 circle-fill
   *   icon         dot-style="icon" 時使用的 Bootstrap Icons 名稱，
   *                寫 "bi-translate" 或 "translate" 皆可
   *                頁面若尚未載入 Bootstrap Icons，會自動從 jsDelivr 載入一次
   *   size         圖示大小（px），預設 18，範圍 10 至 48
   *   target       "_blank" 時另開分頁，其餘同分頁跳轉
   *   offset       同頁跳轉時保留的上方距離（px），給固定頁首用，預設 16
   *   clear-ink    有此屬性時，跳轉前先清除繪圖層筆跡
   *   transition       轉場種類，例如 push-left、cube-left、flip-up、zoom-in、fade、morph
   *   transition-ms    轉場時間（毫秒），預設 600
   *   transition-edge  移動畫面邊緣的亮色線，例如 key，深色背景時建議加上
   *                    三者的完整說明見下方「轉場」段落
   *
   * 標籤內的文字會顯示在圖示右側當標籤，留空則只顯示圖示。
   *
   * 圓點的 z-index 為 830，高於繪圖層的 820，所以開著觸控筆或雷射筆也點得到。
   * 但若 <dot-go> 的祖先自己建立了堆疊環境（設了 transform、filter、
   * opacity 小於 1、或 position 搭配 z-index），圓點會被困在裡面，請避開。
   *
   * 繪圖層開了 data-lock-scroll 時，同頁跳轉仍可捲動，落點會成為新的鎖定位置。
   *
   * 事件：
   *   dot-go       跳轉前觸發，可 preventDefault() 取消
   *                detail: { el, href, internal, target }
   * ========================================================= */
  var DOT_STYLES = ['circle', 'circle-fill', 'star', 'star-fill', 'square', 'square-fill', 'icon'];
  var BI_CSS_URL = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
  var BI_NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  var DOT_SIZE_MIN = 10;
  var DOT_SIZE_MAX = 48;
  var DOT_SIZE_DEFAULT = 18;
  var DOT_FLASH_MS = 1400;

  var DOT_SHAPES = {
    circle: '<circle cx="12" cy="12" r="8.5"/>',
    star: '<path d="M12 2.8l2.85 5.95 6.5.85-4.78 4.5 1.22 6.45L12 17.4l-5.79 3.15 '
      + '1.22-6.45-4.78-4.5 6.5-.85z"/>',
    square: '<rect x="3.8" y="3.8" width="16.4" height="16.4" rx="2.2"/>'
  };

  function injectDotStyles() {
    if (document.getElementById('dot-go-styles')) return;
    var css = ''
      + 'dot-go{display:inline-flex;align-items:center;gap:6px;position:relative;z-index:830;'
      + 'vertical-align:middle;cursor:pointer;margin:0 3px;padding:2px 4px;border-radius:8px;'
      + 'color:var(--dg-c,#5DBAE8);line-height:1.3;user-select:none;-webkit-user-select:none;'
      + 'touch-action:manipulation;transition:background .12s ease;}'
      + 'dot-go:hover{background:#202119;}'
      + 'dot-go .dg-icon{display:flex;align-items:center;justify-content:center;flex:0 0 auto;'
      + 'transition:transform .15s ease;}'
      + 'dot-go:hover .dg-icon{transform:scale(1.2);}'
      + 'dot-go:active .dg-icon{transform:scale(0.92);}'
      + 'dot-go .dg-icon svg{display:block;overflow:visible;}'
      + 'dot-go .dg-icon i.bi{display:block;line-height:1;color:currentColor;}'
      + 'dot-go .dg-icon i.bi::before{display:block;vertical-align:0;}'
      + 'dot-go .dg-label{font-size:0.92rem;color:var(--dg-c,#5DBAE8);white-space:nowrap;}'
      + 'dot-go .dg-label:empty{display:none;}'
      + 'dot-go.dg-off{cursor:not-allowed;color:#6b6c66;}'
      + 'dot-go.dg-off .dg-label{color:#6b6c66;}'
      + 'dot-go.dg-off:hover .dg-icon{transform:none;}'
      /* 跳到同頁標籤時，目標閃一下外框，提示觀眾畫面落在哪裡 */
      + '.dg-flash{animation:dg-flash ' + DOT_FLASH_MS + 'ms ease-out 1;'
      + 'outline-style:solid;outline-color:var(--dg-flash,#5DBAE8);border-radius:6px;}'
      + '@keyframes dg-flash{'
      + '0%{outline-width:4px;outline-offset:2px;}'
      + '60%{outline-width:3px;outline-offset:8px;}'
      + '100%{outline-width:0;outline-offset:12px;}}';
    var style = document.createElement('style');
    style.id = 'dot-go-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function resolveColor(theme) {
    var t = String(theme || '').trim();
    if (!t) return PALETTE.blue;
    if (PALETTE[t]) return PALETTE[t];
    if (HEX_RE.test(t)) return t.toUpperCase();
    warn('dot-go 的 theme 無法辨識，已改用 blue：' + t);
    return PALETTE.blue;
  }

  /* 頁面上已有 Bootstrap Icons 就不重複載入 */
  function ensureBootstrapIcons() {
    if (document.getElementById('dot-go-bi-css')) return;
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (/bootstrap-icons/i.test(links[i].href || '')) return;
    }
    var link = document.createElement('link');
    link.id = 'dot-go-bi-css';
    link.rel = 'stylesheet';
    link.href = BI_CSS_URL;
    link.addEventListener('error', function () {
      warn('Bootstrap Icons 載入失敗，請確認網路或自行引入：' + BI_CSS_URL);
    });
    document.head.appendChild(link);
  }

  /* "bi-translate"、"bi bi-translate"、"translate" 都轉成 "translate" */
  function normalizeIcon(raw) {
    var s = String(raw || '').trim().toLowerCase().replace(/^bi\s+/, '').replace(/^bi-/, '');
    if (!s) return '';
    if (!BI_NAME_RE.test(s)) {
      warn('icon 名稱格式不符，只接受英數與連字號：' + raw);
      return '';
    }
    return s;
  }

  class DotGo extends HTMLElement {
    static get observedAttributes() { return ['href', 'theme', 'dot-style', 'size', 'icon']; }

    connectedCallback() {
      if (this._built) return;
      /* 與 <ink-handwrite> 相同，等文件解析完才讀標籤內文字 */
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._init(), { once: true });
        return;
      }
      this._init();
    }

    _init() {
      if (this._built) return;
      this._built = true;

      var label = String(this.textContent || '').trim();
      this.innerHTML = '<span class="dg-icon" data-role="icon"></span>'
        + '<span class="dg-label" data-role="label"></span>';
      this._icon = this.querySelector('[data-role="icon"]');
      this._label = this.querySelector('[data-role="label"]');
      this._label.textContent = label;

      this._render();

      /* 觸控筆點擊時阻止事件往下，避免同時觸發其他元件 */
      this.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      this.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.go();
      });
    }

    attributeChangedCallback() {
      if (this._built) this._render();
    }

    /* ---------- 屬性讀取 ---------- */
    get href() { return (this.getAttribute('href') || '').trim(); }
    get internal() { return this.href.charAt(0) === '#'; }

    get dotStyle() {
      var s = (this.getAttribute('dot-style') || '').trim();
      if (!s) return 'circle-fill';
      if (DOT_STYLES.indexOf(s) === -1) {
        warn('dot-style 不支援「' + s + '」，已改用 circle-fill');
        return 'circle-fill';
      }
      return s;
    }

    get size() {
      var n = Number(this.getAttribute('size'));
      if (!n) return DOT_SIZE_DEFAULT;
      return Math.min(DOT_SIZE_MAX, Math.max(DOT_SIZE_MIN, n));
    }

    get color() { return resolveColor(this.getAttribute('theme') || 'blue'); }

    /* ---------- 外觀 ---------- */
    _render() {
      var style = this.dotStyle;
      var size = this.size;
      this.style.setProperty('--dg-c', this.color);

      /* icon 樣式：改用 Bootstrap Icons 字型圖示，缺名稱時退回 circle-fill */
      var iconName = '';
      if (style === 'icon') {
        iconName = normalizeIcon(this.getAttribute('icon'));
        if (!iconName) {
          warn('dot-style="icon" 需要 icon 屬性，例如 icon="bi-translate"，已改用 circle-fill');
          style = 'circle-fill';
        }
      }

      if (iconName) {
        ensureBootstrapIcons();
        var i = document.createElement('i');
        i.className = 'bi bi-' + iconName;
        i.setAttribute('aria-hidden', 'true');
        i.style.fontSize = (size / 16) + 'rem';
        this._icon.innerHTML = '';
        this._icon.appendChild(i);
      } else {
        var shape = style.replace('-fill', '');
        var filled = style.indexOf('-fill') !== -1;
        var stroke = filled ? 'none' : 'currentColor';
        var fill = filled ? 'currentColor' : 'none';
        this._icon.innerHTML = '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size
          + '" aria-hidden="true" fill="' + fill + '" stroke="' + stroke
          + '" stroke-width="2.2" stroke-linejoin="round">' + DOT_SHAPES[shape] + '</svg>';
      }

      var href = this.href;
      this.classList.toggle('dg-off', !href);
      if (!href) {
        warn('dot-go 缺少 href，圓點已停用');
        this.setAttribute('title', '未設定 href');
        return;
      }
      var tip = this.internal ? ('跳到 ' + href) : ('前往 ' + href);
      if (this.getAttribute('target') === '_blank') tip += '（新分頁）';
      this.setAttribute('title', tip);
    }

    /* ---------- 跳轉 ---------- */
    go() {
      var href = this.href;
      if (!href) return false;

      var target = this.getAttribute('target') || '';
      var evt = new CustomEvent('dot-go', {
        bubbles: true,
        cancelable: true,
        detail: { el: this, href: href, internal: this.internal, target: target }
      });
      if (!this.dispatchEvent(evt)) return false;

      if (this.hasAttribute('clear-ink')) {
        var layer = document.querySelector('ui-ink-layer');
        if (layer && layer.clear) layer.clear();
      }

      if (this.internal) return this._jumpLocal(href);

      if (target === '_blank') {
        window.open(href, '_blank', 'noopener');
      } else {
        var vt = VT_CROSS && vtSameOrigin(href) ? vtOptions(this) : null;
        if (vt && !VT_IN_HEAD) {
          warn('跨頁轉場需要把 dot-go.js 放在 <head>（出發頁與目的頁都要），這次直接換頁');
          vt = null;
        }
        if (vt) {
          vt.name = vtDirected(vt.name, 'left');
          vt.t = Date.now();
          try { sessionStorage.setItem(VT_KEY, JSON.stringify(vt)); } catch (err) { /* 無法存取時照常換頁 */ }
        }
        window.location.href = href;
      }
      return true;
    }

    /* 繪圖層若處於捲動鎖定，先暫時放行這次跳轉 */
    _passLock() {
      var layer = document.querySelector('ui-ink-layer');
      if (layer && layer.allowScroll) layer.allowScroll(LOCK_PASS_MS);
    }

    _jumpLocal(href) {
      var id = href.slice(1);
      var vt = vtOptions(this);
      if (!id) {
        this._passLock();
        if (vt && VT_SAME) {
          vt.name = vtDirected(vt.name, window.scrollY > 0 ? 'down' : 'up');
          vtRun(vt, function () { window.scrollTo({ top: 0, behavior: 'instant' }); });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return true;
      }
      var el = null;
      try { el = document.getElementById(decodeURIComponent(id)); }
      catch (err) { el = document.getElementById(id); }
      if (!el) el = document.querySelector('[name="' + id.replace(/"/g, '') + '"]');
      if (!el) {
        warn('找不到同頁目標：' + href);
        return false;
      }

      var offset = Number(this.getAttribute('offset'));
      if (isNaN(offset) || this.getAttribute('offset') === null) offset = 16;
      var top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
      this._passLock();
      var self = this;
      var pushHash = function () {
        if (window.history && history.pushState && location.hash !== href) {
          history.pushState(null, '', href);
        }
      };

      if (vt && VT_SAME) {
        vt.name = vtDirected(vt.name, top >= window.scrollY ? 'up' : 'down');
        var t = vtRun(vt, function () {
          window.scrollTo({ top: top, behavior: 'instant' });
          pushHash();
        }, el);
        if (t && t.finished) {
          var flash = function () { self._flash(el); };
          t.finished.then(flash, flash);
        } else {
          this._flash(el);
        }
        return true;
      }

      window.scrollTo({ top: top, behavior: 'smooth' });
      pushHash();
      this._flash(el);
      return true;
    }

    _flash(el) {
      el.style.setProperty('--dg-flash', this.color);
      el.classList.remove('dg-flash');
      void el.offsetWidth;
      el.classList.add('dg-flash');
      clearTimeout(el._dgTimer);
      el._dgTimer = setTimeout(function () { el.classList.remove('dg-flash'); }, DOT_FLASH_MS + 400);
    }
  }
  customElements.define('dot-go', DotGo);


  /* =========================================================
   * 轉場（View Transitions API）
   *
   * <dot-go> 跳轉時，像簡報切換投影片一樣播放轉場。
   * 瀏覽器先拍下舊畫面，換成新畫面後在兩張畫面之間做動畫，
   * 所以新舊畫面會同時出現（推入、覆蓋、翻轉等）。
   *
   *   <dot-go href="#part2" transition="push-left">下一段</dot-go>
   *   <dot-go href="lesson-02.html" transition="cube-left" transition-edge="key">下一課</dot-go>
   *
   * 屬性（寫在 <dot-go> 上；寫在 <body>、<ui-ink-bar> 或 <ui-ink-layer> 上的
   * data-transition、data-transition-ms、data-transition-edge 當全頁預設）：
   *   transition       轉場種類，見 VT_TYPES；none 或不寫為不播放（維持原本的平滑捲動）
   *   transition-ms    轉場時間（毫秒），預設 600，範圍 150 至 3000
   *   transition-edge  移動中畫面邊緣的亮色線（品牌色名稱或色碼），
   *                    深色背景切換到深色背景時，讓動態更明顯
   *
   * 方向：push、cover、uncover、flip、cube 不寫方向時自動判斷。
   *   同頁往下跳時新畫面從下方進來，往上跳時從上方進來；跨頁一律從右邊進來。
   *
   * 轉化（morph）：
   *   在新舊兩處的對應元素加上相同的 data-morph="名稱"，例如兩段的標題都寫 data-morph="title"，
   *   轉場時標題會從舊位置移動並變形到新位置。任何轉場種類都可以搭配，
   *   transition="morph" 則是只讓 data-morph 元素移動，其餘畫面交叉淡化。
   *
   * 跨頁轉場：
   *   出發頁與目的頁都要在 <head> 裡載入 dot-go.js，且兩頁同網域。
   *   放在 </body> 前的話，目的頁來不及在第一次繪製前宣告轉場，瀏覽器會直接換頁。
   *   只有從 <dot-go> 出發的換頁會播放，一般連結、瀏覽器上一頁與重新整理都維持原狀。
   *
   * 瀏覽器不支援時（同頁需要 Chrome 111、Edge 111、Safari 18 以上，
   * 跨頁需要 Chrome 126、Edge 126、Safari 18.2 以上），直接照原本方式跳轉，不會出錯。
   * 工具列與 NG 遮罩不參與轉場，會固定在原位。
   * ========================================================= */
  var VT_TYPES = [
    'fade', 'morph',
    'push', 'push-left', 'push-right', 'push-up', 'push-down',
    'cover', 'cover-left', 'cover-right', 'cover-up', 'cover-down',
    'uncover', 'uncover-left', 'uncover-right', 'uncover-up', 'uncover-down',
    'zoom-in', 'zoom-out',
    'flip', 'flip-left', 'flip-right', 'flip-up', 'flip-down',
    'cube', 'cube-left', 'cube-right', 'cube-up', 'cube-down'
  ];
  var VT_AUTO = ['push', 'cover', 'uncover', 'flip', 'cube'];
  var VT_MS_DEFAULT = 600;
  var VT_MS_MIN = 150;
  var VT_MS_MAX = 3000;
  var VT_KEY = 'dot-go-vt';
  var VT_TTL = 8000;
  var VT_SAME = typeof document.startViewTransition === 'function';
  /* 跨頁轉場需要在 <head> 載入，才能在目的頁第一次繪製前宣告 */
  var VT_IN_HEAD = !!(document.currentScript && document.head && document.head.contains(document.currentScript));
  var VT_CROSS = VT_SAME && typeof window !== 'undefined' && 'onpagereveal' in window;
  var vtBusy = null;

  function injectVtStyles() {
    if (document.getElementById('dot-go-vt-styles')) return;
    var R = 'html[data-dg-vt]';
    var O = '::view-transition-old(root)';
    var N = '::view-transition-new(root)';
    var css = ''
      + '@view-transition{navigation:auto;}'
      + R + '::view-transition-group(*){animation-duration:var(--dg-vt-ms,600ms);'
      + 'animation-timing-function:cubic-bezier(.65,0,.35,1);}'
      + R + O + ',' + R + N + '{animation-duration:var(--dg-vt-ms,600ms);'
      + 'animation-timing-function:cubic-bezier(.65,0,.35,1);animation-fill-mode:both;'
      + 'mix-blend-mode:normal;backface-visibility:hidden;}'
      + R + '::view-transition-image-pair(root){perspective:1600px;}'
      /* 移動類轉場不淡化，整片實心移動 */
      + R + ':not([data-dg-vt="fade"]):not([data-dg-vt="morph"])' + O + ','
      + R + ':not([data-dg-vt="fade"]):not([data-dg-vt="morph"])' + N + '{opacity:1;}'
      /* 邊緣亮線 */
      + R + '[data-dg-vt-edge]' + O + ',' + R + '[data-dg-vt-edge]' + N
      + '{box-shadow:0 0 0 6px var(--dg-vt-edge);}'
      + R + '[data-dg-vt^="uncover"]' + O + ',' + R + '[data-dg-vt="zoom-out"]' + O + '{z-index:1;}'
      + '@keyframes dg-vt-out-l{to{transform:translateX(-100%)}}'
      + '@keyframes dg-vt-out-r{to{transform:translateX(100%)}}'
      + '@keyframes dg-vt-out-u{to{transform:translateY(-100%)}}'
      + '@keyframes dg-vt-out-d{to{transform:translateY(100%)}}'
      + '@keyframes dg-vt-in-l{from{transform:translateX(100%)}}'
      + '@keyframes dg-vt-in-r{from{transform:translateX(-100%)}}'
      + '@keyframes dg-vt-in-u{from{transform:translateY(100%)}}'
      + '@keyframes dg-vt-in-d{from{transform:translateY(-100%)}}'
      + '@keyframes dg-vt-hold{from{transform:none}to{transform:none}}'
      + '@keyframes dg-vt-zoom-in-new{from{transform:scale(.55)}}'
      + '@keyframes dg-vt-zoom-in-old{to{transform:scale(1.12)}}'
      + '@keyframes dg-vt-zoom-out-old{to{transform:scale(.55)}}'
      + '@keyframes dg-vt-zoom-out-new{from{transform:scale(1.12)}}'
      + '@keyframes dg-vt-flip-old-l{0%{transform:rotateY(0)}50%,100%{transform:rotateY(90deg)}}'
      + '@keyframes dg-vt-flip-new-l{0%,50%{transform:rotateY(-90deg)}100%{transform:rotateY(0)}}'
      + '@keyframes dg-vt-flip-old-r{0%{transform:rotateY(0)}50%,100%{transform:rotateY(-90deg)}}'
      + '@keyframes dg-vt-flip-new-r{0%,50%{transform:rotateY(90deg)}100%{transform:rotateY(0)}}'
      + '@keyframes dg-vt-flip-old-u{0%{transform:rotateX(0)}50%,100%{transform:rotateX(-90deg)}}'
      + '@keyframes dg-vt-flip-new-u{0%,50%{transform:rotateX(90deg)}100%{transform:rotateX(0)}}'
      + '@keyframes dg-vt-flip-old-d{0%{transform:rotateX(0)}50%,100%{transform:rotateX(90deg)}}'
      + '@keyframes dg-vt-flip-new-d{0%,50%{transform:rotateX(-90deg)}100%{transform:rotateX(0)}}'
      + '@keyframes dg-vt-cube-old-l{from{transform:translateX(0) rotateY(0deg)}to{transform:translateX(-100%) rotateY(-90deg)}}'
      + '@keyframes dg-vt-cube-new-l{from{transform:translateX(100%) rotateY(90deg)}to{transform:translateX(0) rotateY(0deg)}}'
      + '@keyframes dg-vt-cube-old-r{from{transform:translateX(0) rotateY(0deg)}to{transform:translateX(100%) rotateY(90deg)}}'
      + '@keyframes dg-vt-cube-new-r{from{transform:translateX(-100%) rotateY(-90deg)}to{transform:translateX(0) rotateY(0deg)}}'
      + '@keyframes dg-vt-cube-old-u{from{transform:translateY(0) rotateX(0deg)}to{transform:translateY(-100%) rotateX(90deg)}}'
      + '@keyframes dg-vt-cube-new-u{from{transform:translateY(100%) rotateX(-90deg)}to{transform:translateY(0) rotateX(0deg)}}'
      + '@keyframes dg-vt-cube-old-d{from{transform:translateY(0) rotateX(0deg)}to{transform:translateY(100%) rotateX(-90deg)}}'
      + '@keyframes dg-vt-cube-new-d{from{transform:translateY(-100%) rotateX(90deg)}to{transform:translateY(0) rotateX(0deg)}}';

    var DIRS = { left: 'l', right: 'r', up: 'u', down: 'd' };
    var rule = function (type, oldAnim, newAnim) {
      return R + '[data-dg-vt="' + type + '"]' + O + '{animation-name:' + oldAnim + ';}'
        + R + '[data-dg-vt="' + type + '"]' + N + '{animation-name:' + newAnim + ';}';
    };
    Object.keys(DIRS).forEach(function (d) {
      var k = DIRS[d];
      css += rule('push-' + d, 'dg-vt-out-' + k, 'dg-vt-in-' + k);
      css += rule('cover-' + d, 'dg-vt-hold', 'dg-vt-in-' + k);
      css += rule('uncover-' + d, 'dg-vt-out-' + k, 'dg-vt-hold');
      css += rule('flip-' + d, 'dg-vt-flip-old-' + k, 'dg-vt-flip-new-' + k);
      css += rule('cube-' + d, 'dg-vt-cube-old-' + k, 'dg-vt-cube-new-' + k);
    });
    css += rule('zoom-in', 'dg-vt-zoom-in-old', 'dg-vt-zoom-in-new');
    css += rule('zoom-out', 'dg-vt-zoom-out-old', 'dg-vt-zoom-out-new');
    /* 3D 轉場的旋轉軸 */
    css += R + '[data-dg-vt^="flip"]' + O + ',' + R + '[data-dg-vt^="flip"]' + N + '{transform-origin:50% 50%;}';
    /* 立方體：舊畫面以離場側的邊緣為軸，新畫面以進場側的邊緣為軸，邊旋轉邊平移 */
    var CUBE_ORIGIN = {
      left: ['100% 50%', '0% 50%'], right: ['0% 50%', '100% 50%'],
      up: ['50% 100%', '50% 0%'], down: ['50% 0%', '50% 100%']
    };
    Object.keys(CUBE_ORIGIN).forEach(function (d) {
      css += R + '[data-dg-vt="cube-' + d + '"]' + O + '{transform-origin:' + CUBE_ORIGIN[d][0] + ';}'
        + R + '[data-dg-vt="cube-' + d + '"]' + N + '{transform-origin:' + CUBE_ORIGIN[d][1] + ';}';
    });

    var st = document.createElement('style');
    st.id = 'dot-go-vt-styles';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  /* 轉場設定：<dot-go> 自己的屬性優先，其次為工具列或繪圖層上的 data-* */
  function vtOptions(dot) {
    var host = document.querySelector('body[data-transition], ui-ink-bar[data-transition], ui-ink-layer[data-transition]');
    var pick = function (attr) {
      if (dot && dot.hasAttribute(attr)) return dot.getAttribute(attr);
      return host ? host.getAttribute('data-' + attr) : null;
    };
    var name = String(pick('transition') || '').trim().toLowerCase();
    if (!name || name === 'none' || name === 'false') return null;
    if (VT_TYPES.indexOf(name) === -1) {
      warn('transition 不支援「' + name + '」，已略過轉場');
      return null;
    }
    var ms = Number(pick('transition-ms'));
    ms = ms ? Math.min(VT_MS_MAX, Math.max(VT_MS_MIN, ms)) : VT_MS_DEFAULT;
    var edge = String(pick('transition-edge') || '').trim();
    return { name: name, ms: ms, edge: edge ? resolveColor(edge) : '' };
  }

  /* push、cover、uncover、flip、cube 不寫方向時補上方向 */
  function vtDirected(name, dir) {
    return VT_AUTO.indexOf(name) === -1 ? name : name + '-' + dir;
  }

  function vtApply(opts) {
    var html = document.documentElement;
    html.setAttribute('data-dg-vt', opts.name);
    html.style.setProperty('--dg-vt-ms', opts.ms + 'ms');
    if (opts.edge) {
      html.setAttribute('data-dg-vt-edge', '');
      html.style.setProperty('--dg-vt-edge', opts.edge);
    } else {
      html.removeAttribute('data-dg-vt-edge');
    }
    /* 固定介面不參與轉場：各自拍成獨立畫面，保持原位 */
    var fixed = ['ui-ink-bar', 'ui-ink-ng-mask'];
    fixed.forEach(function (sel, i) {
      var n = document.querySelector(sel);
      if (n) n.style.viewTransitionName = 'dg-vt-fixed-' + i;
    });
  }

  function vtCleanup() {
    var html = document.documentElement;
    html.removeAttribute('data-dg-vt');
    html.removeAttribute('data-dg-vt-edge');
    html.style.removeProperty('--dg-vt-ms');
    html.style.removeProperty('--dg-vt-edge');
    ['ui-ink-bar', 'ui-ink-ng-mask'].forEach(function (sel) {
      var n = document.querySelector(sel);
      if (n) n.style.removeProperty('view-transition-name');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-morph]'), function (n) {
      n.style.removeProperty('view-transition-name');
    });
  }

  function vtInView(n) {
    var r = n.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight
      && r.right > 0 && r.left < window.innerWidth;
  }

  /* 轉化：同名的 data-morph 各取畫面中的一個；名稱只給成對出現的元素 */
  function vtMorphKey(k) {
    return 'dg-morph-' + String(k).trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  }
  function vtMorphPick(scope, inView) {
    var map = {};
    Array.prototype.forEach.call((scope || document).querySelectorAll('[data-morph]'), function (n) {
      var k = (n.getAttribute('data-morph') || '').trim();
      if (!k || map[k]) return;
      if (inView && !vtInView(n)) return;
      map[k] = n;
    });
    return map;
  }

  /*
   * 執行一次轉場。update 負責實際換畫面（捲動、改內容皆可），
   * scope 為新畫面所在的元素（找 data-morph 用，可省略）。
   * 不支援或 opts 為 null 時直接執行 update，回傳 false。
   */
  function vtRun(opts, update, scope) {
    if (!opts || !VT_SAME) { update(); return false; }
    if (vtBusy) { try { vtBusy.skipTransition(); } catch (err) { /* 已結束 */ } }
    vtApply(opts);
    var olds = vtMorphPick(null, true);
    Object.keys(olds).forEach(function (k) { olds[k].style.viewTransitionName = vtMorphKey(k); });
    var t;
    try {
      t = document.startViewTransition(function () {
        Object.keys(olds).forEach(function (k) { olds[k].style.removeProperty('view-transition-name'); });
        update();
        var news = scope ? vtMorphPick(scope, false) : vtMorphPick(null, true);
        Object.keys(news).forEach(function (k) {
          if (olds[k] && olds[k] !== news[k]) news[k].style.viewTransitionName = vtMorphKey(k);
        });
      });
    } catch (err) {
      vtCleanup();
      update();
      return false;
    }
    vtBusy = t;
    var done = function () { if (vtBusy === t) vtBusy = null; vtCleanup(); };
    t.finished.then(done, done);
    return t;
  }

  /* 跨頁：出發頁記下設定，目的頁讀到才播放；其他換頁一律略過 */
  function vtReadFlag() {
    try {
      var raw = sessionStorage.getItem(VT_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.name || Date.now() - (d.t || 0) > VT_TTL) return null;
      return d;
    } catch (err) { return null; }
  }
  function vtClearFlag() {
    try { sessionStorage.removeItem(VT_KEY); } catch (err) { /* 無法存取時略過 */ }
  }
  function vtSameOrigin(href) {
    try { return new URL(href, location.href).origin === location.origin; }
    catch (err) { return false; }
  }

  function bindCrossDocument() {
    if (!VT_CROSS) return;
    window.addEventListener('pageswap', function (e) {
      if (!e.viewTransition) return;
      var d = vtReadFlag();
      if (!d) { e.viewTransition.skipTransition(); return; }
      vtApply(d);
    });
    window.addEventListener('pagereveal', function (e) {
      if (!e.viewTransition) return;
      var d = vtReadFlag();
      vtClearFlag();
      if (!d) { e.viewTransition.skipTransition(); return; }
      vtApply(d);
      var done = function () { vtCleanup(); };
      e.viewTransition.finished.then(done, done);
    });
  }

  /* ---------- 對外介面 ---------- */
  injectDotStyles();
  injectVtStyles();
  bindCrossDocument();

  var api = {
    palette: PALETTE,
    dotStyles: DOT_STYLES.slice(),
    dots: function () {
      return Array.prototype.slice.call(document.querySelectorAll('dot-go'));
    },
    /* 轉場：種類清單、支援狀況，以及自訂換畫面時套用轉場
     *   DotGo.transition('push-left', function () { 換畫面 }, { ms: 800, edge: 'key', scope: 目標元素 }) */
    transitions: VT_TYPES.slice(),
    transitionSupport: { sameDocument: VT_SAME, crossDocument: VT_CROSS },
    transition: function (name, update, o) {
      o = o || {};
      var n = String(name || '').trim().toLowerCase();
      var opts = null;
      if (n && n !== 'none') {
        if (VT_TYPES.indexOf(n) === -1) warn('transition 不支援「' + n + '」，已略過轉場');
        else {
          var ms = Number(o.ms);
          opts = {
            name: vtDirected(n, o.direction || 'left'),
            ms: ms ? Math.min(VT_MS_MAX, Math.max(VT_MS_MIN, ms)) : VT_MS_DEFAULT,
            edge: o.edge ? resolveColor(o.edge) : ''
          };
        }
      }
      return vtRun(opts, typeof update === 'function' ? update : function () {}, o.scope || null);
    }
  };
  window.DotGo = api;

  /* 舊頁面相容：ink-pen.js 已載入時，把介面也掛到 window.InkPen；
   * ink-pen.js 較晚載入的話，由它自己接上 window.DotGo */
  if (window.InkPen) {
    ['dotStyles', 'dots', 'transitions', 'transitionSupport', 'transition'].forEach(function (k) {
      window.InkPen[k] = api[k];
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
