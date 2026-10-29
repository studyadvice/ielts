/* =========================================================
 * ink-pen.js
 * 螢幕錄影用極簡畫筆層（觸控筆 / 雷射筆 / 行內手寫空格）
 * 零依賴，單檔即可運作
 *
 * 自訂標籤：
 *   <ui-ink-layer>    全頁繪圖層（觸控筆、雷射筆）
 *   <ui-ink-bar>      迷你工具列（可收合成一顆小圓鈕）
 *   <ink-handwrite>   行內手寫空格，內容以底線長度決定寬度，可加 answer 屬性附解答
 *   <ui-ink-modal>    手寫視窗（首次需要時自動建立，不必自己放）
 *
 * 對外介面：window.InkPen
 *   .layer()              取得繪圖層實體
 *   .bar()                取得工具列實體
 *   .modal()              取得手寫視窗實體
 *   .blanks()             取得頁面上所有 <ink-handwrite>
 *   .palette              配色表
 *
 * 本元件不在畫面上顯示任何提示訊息，設定錯誤只寫入 console，
 * 以免錄影時跳出東西干擾畫面。
 *
 * 快捷鍵：
 *   1  觸控筆
 *   3  雷射筆
 *   0  關閉繪圖，回到一般點選
 *   C  清除全部筆跡
 *   H  收合／展開工具列
 *   A  顯示／收起全部解答
 *   Esc  關閉手寫視窗
 * ========================================================= */
(function () {
  'use strict';

  var PALETTE = {
    bg: '#0C0D0C', shell: '#C6C7BD', lavender: '#C3A5E5', sky: '#82C8E5',
    warning: '#E6374B', salmon: '#E5C3B3', ocean: '#1CCAE8', safe: '#27AE60',
    teal: '#0DA591', vanilla: '#DBEDD8', yellow: '#E3D322', focus: '#D4FFFC',
    special: '#B3DE73', info: '#4171BF', indigo: '#7849C9', pink: '#FF91D7',
    orange: '#EDA109'
  };

  var PEN_OPTIONS = [
    ['focus', '霧白 focus'],
    ['ocean', '海洋藍 ocean'],
    ['yellow', '黃 yellow'],
    ['special', '嫩綠 special'],
    ['pink', '粉紅 pink'],
    ['orange', '橙 orange'],
    ['lavender', '薰衣草 lavender'],
    ['sky', '天空藍 sky']
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
      + 'ui-ink-layer.ip-live{pointer-events:auto;cursor:crosshair;touch-action:none;}'
      + 'ui-ink-layer.ip-live.ip-doc{touch-action:pan-y;}'

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
      + '.ip-dot:hover{border-color:var(--c-ocean,#1CCAE8);}'
      + '.ip-dot i{width:14px;height:14px;border-radius:50%;display:block;'
      + 'background:var(--c-focus,#D4FFFC);}'
      + '.ip-dot.ip-armed{border-color:rgba(28,202,232,0.9);'
      + 'box-shadow:0 0 0 2px rgba(28,202,232,0.82),0 4px 14px rgba(0,0,0,0.82);}'

      /* ---- 主體膠囊 ---- */
      + '.ip-bar{display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:22px;'
      + 'background:rgba(19,20,18,0.94);border:1px solid rgba(58,59,55,0.9);'
      + 'box-shadow:0 6px 20px rgba(0,0,0,0.82);}'
      + '.ip-bar.ip-hidden{display:none;}'
      + '.ip-sep{width:1px;height:22px;background:rgba(58,59,55,0.9);}'
      + '.ip-btn{font-size:0.88rem;line-height:1.4;padding:5px 12px;border-radius:14px;'
      + 'border:1px solid rgba(58,59,55,0.9);background:rgba(32,33,25,0.92);'
      + 'color:var(--c-shell,#C6C7BD);cursor:pointer;white-space:nowrap;}'
      + '.ip-btn:hover{border-color:var(--c-ocean,#1CCAE8);color:var(--c-ocean,#1CCAE8);}'
      + '.ip-btn.ip-active{background:var(--c-teal,#0DA591);border-color:var(--c-teal,#0DA591);'
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
      + 'border-bottom:2px solid rgba(13,165,145,0.86);border-radius:3px 3px 0 0;'
      + 'transition:background .15s ease,border-color .15s ease;}'
      + 'ink-handwrite:hover{background:rgba(13,165,145,0.2);border-color:var(--c-ocean,#1CCAE8);}'
      + 'ink-handwrite.ih-has-answer{margin-right:17px;}'
      + 'ink-handwrite .ih-clip{position:absolute;inset:0;overflow:hidden;'
      + 'display:flex;align-items:center;justify-content:center;pointer-events:none;}'
      + 'ink-handwrite .ih-icon{display:flex;align-items:center;justify-content:center;'
      + 'color:rgba(198,199,189,0.82);}'
      + 'ink-handwrite:hover .ih-icon{color:var(--c-ocean,#1CCAE8);}'
      + 'ink-handwrite .ih-clip img{position:absolute;left:4px;top:2px;'
      + 'width:calc(100% - 8px);height:calc(100% - 6px);'
      + 'object-fit:contain;display:block;}'
      + 'ink-handwrite.ih-filled{border-color:rgba(179,222,115,0.86);}'
      + 'ink-handwrite.ih-filled .ih-icon{display:none;}'

      /* ---- 解答 ---- */
      + 'ink-handwrite .ih-ans{display:none;white-space:nowrap;line-height:1.4;'
      + 'color:var(--c-special,#B3DE73);transform-origin:center center;}'
      + 'ink-handwrite.ih-answered .ih-ans{display:block;}'
      + 'ink-handwrite.ih-answered .ih-icon{display:none;}'
      + 'ink-handwrite.ih-answered{border-bottom-width:3px;'
      + 'border-color:rgba(179,222,115,0.86);}'
      /* 圓點的 z-index 高於繪圖層，所以開著筆也點得到 */
      + 'ink-handwrite .ih-dot{position:absolute;right:-13px;top:50%;'
      + 'width:9px;height:9px;margin-top:-5px;border-radius:50%;z-index:830;cursor:pointer;'
      + 'border:1px solid rgba(198,199,189,0.82);background:rgba(12,13,12,0.86);'
      + 'transition:background .12s ease,border-color .12s ease;}'
      + 'ink-handwrite .ih-dot:hover{background:var(--c-ocean,#1CCAE8);'
      + 'border-color:var(--c-ocean,#1CCAE8);}'
      + 'ink-handwrite.ih-answered .ih-dot{background:var(--c-special,#B3DE73);'
      + 'border-color:var(--c-special,#B3DE73);}'

      /* ---- 手寫視窗 ---- */
      + 'ui-ink-modal{position:fixed;inset:0;z-index:960;display:none;'
      + 'align-items:center;justify-content:center;background:rgba(12,13,12,0.9);}'
      + 'ui-ink-modal.ip-on{display:flex;}'
      + '.ipm-box{background:rgba(23,24,26,0.97);border:1px solid rgba(51,52,47,0.9);'
      + 'border-radius:12px;padding:24px 28px;box-shadow:0 14px 44px rgba(0,0,0,0.86);}'
      + '.ipm-head{display:flex;align-items:baseline;gap:14px;margin-bottom:16px;}'
      + '.ipm-head h4{margin:0;font-size:1.1rem;line-height:1.4;color:var(--c-focus,#D4FFFC);}'
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
      + '.ipm-ok{background:var(--c-teal,#0DA591);border-color:var(--c-teal,#0DA591);'
      + 'color:#07211D;font-weight:600;}'
      + '.ipm-ok:hover{color:#07211D;border-color:var(--c-teal,#0DA591);}'

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
   * 兩種模式可隨時互換，既有筆跡會依當下捲動量自動換算座標。
   * ========================================================= */
  class UiInkLayer extends HTMLElement {
    static get observedAttributes() { return ['data-anchor']; }

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
      this._color = PALETTE.focus;
      this._width = WIDTH_DEFAULT;
      this._strokes = [];
      this._trail = [];
      this._drawing = false;
      this._dirty = false;

      this.classList.toggle('ip-doc', this._anchor === 'document');

      this._resize();
      window.addEventListener('resize', () => this._resize());
      window.addEventListener('scroll', () => {
        if (this._anchor === 'document') this._dirty = true;
      }, { passive: true });
      this._bind();
      this._tick();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (!this._built) return;
      if (name === 'data-anchor') this._applyAnchor(newVal);
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
    }
    getMode() { return this._mode; }

    setColor(key) {
      this._color = PALETTE[key] || key;
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

    _bind() {
      this.addEventListener('pointerdown', (e) => {
        if (this._mode === 'off') return;
        this.setPointerCapture(e.pointerId);
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
      });

      this.addEventListener('pointermove', (e) => {
        if (!this._drawing || this._mode === 'off') return;
        var p = this._pt(e);
        if (this._mode === 'laser') {
          this._trail.push({ x: p.x, y: p.y, t: performance.now() });
          return;
        }
        var s = this._strokes[this._strokes.length - 1];
        if (!s) return;
        s.points.push({ x: p.x, y: p.y, w: this._lineWidth(e) });
        this._drawLast(s);
      });

      var end = () => { this._drawing = false; };
      this.addEventListener('pointerup', end);
      this.addEventListener('pointercancel', end);
      this.addEventListener('pointerleave', end);
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
          ctx.strokeStyle = PALETTE.warning;
          ctx.shadowColor = PALETTE.warning;
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
      this._color = PALETTE.focus;
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
      this._color = PALETTE[key] || key;
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
   * <ui-ink-bar>
   * 屬性：
   *   data-pos="br|bl|tr|tl"   擺放位置，預設右下角
   *   data-open="true"         載入時直接展開，預設收合成小圓鈕
   *   extra-color="#FFFFFF"    追加一個自訂筆色，載入時自動選用
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
        '<button type="button" class="ip-btn" data-mode="pen">筆 1</button>' +
        '<button type="button" class="ip-btn" data-mode="laser">雷射 3</button>' +
        '<button type="button" class="ip-btn ip-active" data-mode="off">關 0</button>' +
        '<span class="ip-sep"></span>' +
        '<span class="ip-swatch" data-role="swatch"></span>' +
        '<select data-role="color" title="筆跡色彩"></select>' +
        '<input type="number" data-role="width" min="' + WIDTH_MIN + '" max="' + WIDTH_MAX +
        '" step="1" value="' + WIDTH_DEFAULT + '" title="筆跡粗細（' + WIDTH_MIN + ' 至 ' + WIDTH_MAX + ' px）" />' +
        '<span class="ip-sep"></span>' +
        '<button type="button" class="ip-btn" data-act="clear">清除 C</button>' +
        '<button type="button" class="ip-btn" data-act="hide">收合 H</button>' +
        '</div>';

      this._bar = this.querySelector('[data-role="bar"]');
      this._dot = this.querySelector('[data-role="dot"]');
      this._dotColor = this.querySelector('[data-role="dotcolor"]');
      this._swatch = this.querySelector('[data-role="swatch"]');
      this._select = this.querySelector('[data-role="color"]');

      this._renderColors(true);
      this._wire();
      this._syncPen();
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
      var hex = (this.getAttribute('extra-color') || '').trim();
      if (!hex) return null;
      if (!HEX_RE.test(hex)) {
        warn('extra-color 格式不符，請用 #RGB 或 #RRGGBB：' + hex);
        return null;
      }
      var label = (this.getAttribute('extra-label') || '').trim();
      return { hex: hex.toUpperCase(), label: label || ('自訂 ' + hex.toUpperCase()) };
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

    clear() {
      if (this.layer) this.layer.clear();
    }

    toggleBar(force) {
      var next = (force === undefined) ? this._bar.classList.contains('ip-hidden') : !!force;
      this._bar.classList.toggle('ip-hidden', !next);
      return next;
    }

    /* ---------- 快捷鍵 ---------- */
    _bindKeys() {
      document.addEventListener('keydown', (e) => {
        var modal = document.querySelector('ui-ink-modal');
        if (modal && modal.isOpen && modal.isOpen()) return;
        var t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' ||
                  t.tagName === 'SELECT' || t.isContentEditable)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        switch (e.key) {
          case '1': this.setMode('pen'); break;
          case '3': this.setMode('laser'); break;
          case '0': this.setMode('off'); break;
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
  injectStyles();
  window.InkPen = {
    palette: PALETTE,
    penColorOptions: PEN_OPTIONS,
    widthRange: { min: WIDTH_MIN, max: WIDTH_MAX, def: WIDTH_DEFAULT },
    handwriteRange: { min: HW_MIN, max: HW_MAX, def: HW_DEFAULT },
    slotRange: { min: SLOT_MIN, max: SLOT_MAX },
    layer: function () { return document.querySelector('ui-ink-layer'); },
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
})();
