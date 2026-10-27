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
    ['shell', '殼白 shell'],
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

  /* ---------- 提示訊息（bootstrap alert 風格，不使用 alert） ---------- */
  function showAlert(msg, type) {
    var host = document.querySelector('ui-ink-alerts');
    if (!host) {
      host = document.createElement('ui-ink-alerts');
      document.body.appendChild(host);
    }
    var box = document.createElement('div');
    box.className = 'ip-alert ' + (type === 'info' ? 'ip-alert-info' : 'ip-alert-warn');
    box.textContent = msg;
    host.appendChild(box);
    setTimeout(function () { box.classList.add('ip-out'); }, 2000);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 2400);
  }

  /* ---------- 樣式（僅注入一次） ---------- */
  function injectStyles() {
    if (document.getElementById('ink-pen-styles')) return;
    var css = ''
      /* ---- 繪圖層 ---- */
      + 'ui-ink-layer{position:fixed;inset:0;z-index:820;pointer-events:none;display:block;}'
      + 'ui-ink-layer canvas{position:absolute;inset:0;width:100%;height:100%;}'
      + 'ui-ink-layer.ip-live{pointer-events:auto;cursor:crosshair;touch-action:none;}'

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

      /* ---- 提示訊息 ---- */
      + 'ui-ink-alerts{position:fixed;right:20px;bottom:76px;z-index:900;'
      + 'display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none;}'
      + '.ip-alert{font-size:0.88rem;line-height:1.4;padding:9px 16px;border-radius:8px;'
      + 'max-width:360px;background:rgba(23,24,26,0.94);box-shadow:0 6px 20px rgba(0,0,0,0.82);'
      + 'transition:opacity .35s ease;}'
      + '.ip-alert.ip-out{opacity:0;}'
      + '.ip-alert-info{border-left:4px solid var(--c-teal,#0DA591);color:var(--c-focus,#D4FFFC);}'
      + '.ip-alert-warn{border-left:4px solid var(--c-warning,#E6374B);color:var(--c-salmon,#E5C3B3);}'
      ;
    var style = document.createElement('style');
    style.id = 'ink-pen-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* =========================================================
   * <ui-ink-layer>
   * 兩張畫布：ink 保留筆跡，laser 每幀重畫殘影。
   * 座標以視窗為準（position:fixed），錄影時畫面不捲動即可。
   * ========================================================= */
  class UiInkLayer extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this.innerHTML = '<canvas data-role="ink"></canvas><canvas data-role="laser"></canvas>';
      this._ink = this.querySelector('[data-role="ink"]');
      this._laser = this.querySelector('[data-role="laser"]');
      this._ictx = this._ink.getContext('2d');
      this._lctx = this._laser.getContext('2d');

      this._mode = 'off';
      this._color = PALETTE.focus;
      this._width = WIDTH_DEFAULT;
      this._strokes = [];
      this._trail = [];
      this._drawing = false;

      this._resize();
      window.addEventListener('resize', () => this._resize());
      this._bind();
      this._tick();
    }

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
      this._strokes.forEach((s) => this._paint(s));
    }

    _paint(stroke) {
      if (stroke.points.length < 2) return;
      var ctx = this._ictx;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      for (var i = 1; i < stroke.points.length; i++) {
        var a = stroke.points[i - 1], b = stroke.points[i];
        ctx.lineWidth = b.w;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    _drawLast(stroke) {
      var n = stroke.points.length;
      if (n < 2) return;
      var ctx = this._ictx;
      ctx.save();
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
        if (this._mode === 'laser') {
          this._trail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
          return;
        }
        this._strokes.push({
          color: this._color,
          points: [{ x: e.clientX, y: e.clientY, w: this._lineWidth(e) }]
        });
      });

      this.addEventListener('pointermove', (e) => {
        if (!this._drawing || this._mode === 'off') return;
        if (this._mode === 'laser') {
          this._trail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
          return;
        }
        var s = this._strokes[this._strokes.length - 1];
        if (!s) return;
        s.points.push({ x: e.clientX, y: e.clientY, w: this._lineWidth(e) });
        this._drawLast(s);
      });

      var end = () => { this._drawing = false; };
      this.addEventListener('pointerup', end);
      this.addEventListener('pointercancel', end);
      this.addEventListener('pointerleave', end);
    }

    /* 每幀重畫雷射殘影 */
    _tick() {
      var step = () => {
        var ctx = this._lctx;
        ctx.clearRect(0, 0, this.clientWidth, this.clientHeight);
        var now = performance.now();
        this._trail = this._trail.filter(function (p) { return now - p.t < 620; });
        if (this._mode === 'laser' && this._trail.length > 1) {
          ctx.save();
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
   * <ui-ink-bar>
   * 屬性：
   *   data-pos="br|bl|tr|tl"  擺放位置，預設右下角
   *   data-open="true"        載入時直接展開，預設收合成小圓鈕
   * ========================================================= */
  class UiInkBar extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;

      var colorOpts = PEN_OPTIONS.map(function (o) {
        return '<option value="' + o[0] + '">' + o[1] + '</option>';
      }).join('');

      this.innerHTML =
        '<button type="button" class="ip-dot" data-role="dot" title="展開畫筆工具列（H）">' +
        '<i data-role="dotcolor"></i></button>' +
        '<div class="ip-bar ip-hidden" data-role="bar">' +
        '<button type="button" class="ip-btn" data-mode="pen">筆 1</button>' +
        '<button type="button" class="ip-btn" data-mode="laser">雷射 3</button>' +
        '<button type="button" class="ip-btn ip-active" data-mode="off">關 0</button>' +
        '<span class="ip-sep"></span>' +
        '<span class="ip-swatch" data-role="swatch"></span>' +
        '<select data-role="color" title="筆跡色彩">' + colorOpts + '</select>' +
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

      this._wire();
      this._syncPen();
      if (this.getAttribute('data-open') === 'true') this.toggleBar(true);
      this._bindKeys();
    }

    get layer() { return document.querySelector('ui-ink-layer'); }

    _wire() {
      this.querySelectorAll('[data-mode]').forEach((btn) => {
        btn.addEventListener('click', () => this.setMode(btn.getAttribute('data-mode')));
      });
      this.querySelector('[data-act="clear"]').addEventListener('click', () => this.clear());
      this.querySelector('[data-act="hide"]').addEventListener('click', () => this.toggleBar(false));
      this._dot.addEventListener('click', () => this.toggleBar());

      var colorSel = this.querySelector('[data-role="color"]');
      var widthInput = this.querySelector('[data-role="width"]');
      colorSel.addEventListener('change', () => this._syncPen());
      widthInput.addEventListener('change', () => this._syncPen());
      widthInput.addEventListener('input', () => this._syncPen());
    }

    _syncPen() {
      var key = this.querySelector('[data-role="color"]').value;
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

    clear() {
      if (!this.layer) return;
      if (this.layer.isEmpty()) {
        
        return;
      }
      this.layer.clear();
      
    }

    toggleBar(force) {
      var next = (force === undefined) ? this._bar.classList.contains('ip-hidden') : !!force;
      this._bar.classList.toggle('ip-hidden', !next);
      return next;
    }

    /* ---------- 快捷鍵 ---------- */
    _bindKeys() {
      document.addEventListener('keydown', (e) => {
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
    showAlert: showAlert,
    layer: function () { return document.querySelector('ui-ink-layer'); },
    bar: function () { return document.querySelector('ui-ink-bar'); }
  };
})();
