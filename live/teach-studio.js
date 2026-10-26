/* =========================================================
 * teach-studio.js
 * 雅思教學螢幕錄影控制層（搭配觸控筆 / cloze-handwrite.js）
 *
 * 自訂標籤：
 *   <ui-annotate-layer>  全頁標註圖層（筆、螢光、雷射、復原、清除）
 *   <ui-spotlight>       聚光燈遮罩（跟隨指標）
 *   <ui-lower-third>     下方字卡（錄影用重點標題）
 *   <ui-key-hud>         快捷鍵提示徽章（讓觀眾看見你按了什麼）
 *   <ui-studio-bar>      主控列（筆色、粗細、題組導覽、計時、錄影指示）
 *
 * 對外介面：window.TeachStudio
 *   .shortcuts   快捷鍵對照表 [[key, label], ...]
 *   .bar()       取得主控列實體
 * ========================================================= */
(function () {
  'use strict';

  var CH = window.ClozeHandwrite || {};
  var PALETTE = CH.palette || {
    bg: '#0C0D0C', shell: '#C6C7BD', lavender: '#C3A5E5', sky: '#82C8E5',
    warning: '#E6374B', salmon: '#E5C3B3', ocean: '#1CCAE8', safe: '#27AE60',
    teal: '#0DA591', vanilla: '#DBEDD8', yellow: '#E3D322', focus: '#D4FFFC',
    special: '#B3DE73', info: '#4171BF', indigo: '#7849C9', pink: '#FF91D7',
    orange: '#EDA109'
  };
  var PEN_OPTIONS = CH.penColorOptions || [
    ['focus', '霧白 focus'], ['ocean', '海洋藍 ocean'], ['yellow', '黃 yellow'],
    ['special', '嫩綠 special'], ['pink', '粉紅 pink'], ['orange', '橙 orange']
  ];

  function toast(msg, type) {
    if (CH.showAlert) { CH.showAlert(msg, type); return; }
    console.log(msg);
  }

  var SHORTCUTS = [
    ['1', '一般筆跡標註'],
    ['2', '螢光筆標記'],
    ['3', '雷射指標'],
    ['0', '關閉標註，回到點選模式'],
    ['Z', '復原上一筆'],
    ['C', '清除全部標註'],
    ['S', '聚光燈開關'],
    ['F', '單題聚焦開關'],
    ['A', '顯示／隱藏所有答案'],
    ['J', '上一題組'],
    ['K', '下一題組'],
    ['T', '計時開始／暫停'],
    ['R', '錄影指示燈開關'],
    ['H', '隱藏／顯示主控列'],
    ['?', '快捷鍵說明']
  ];

  /* ---------- 樣式（僅注入一次） ---------- */
  function injectStyles() {
    if (document.getElementById('teach-studio-styles')) return;
    var css = ''
      + 'ui-studio-bar,ui-lower-third,ui-key-hud{display:block;}'

      /* ---- 標註圖層 ---- */
      + 'ui-annotate-layer{position:fixed;inset:0;z-index:820;pointer-events:none;}'
      + 'ui-annotate-layer canvas{position:absolute;inset:0;width:100%;height:100%;}'
      + 'ui-annotate-layer.ts-live{pointer-events:auto;cursor:crosshair;touch-action:none;}'

      /* ---- 聚光燈 ---- */
      + 'ui-spotlight{position:fixed;inset:0;z-index:810;pointer-events:none;display:none;'
      + 'background:radial-gradient(circle var(--ts-spot-r,210px) at var(--ts-spot-x,50%) var(--ts-spot-y,50%),'
      + 'rgba(12,13,12,0) 0%,rgba(12,13,12,0) 62%,rgba(12,13,12,0.88) 100%);}'
      + 'ui-spotlight.ts-on{display:block;}'

      /* ---- 下方字卡 ---- */
      + 'ui-lower-third{position:fixed;left:48px;bottom:44px;z-index:830;max-width:52vw;display:none;}'
      + 'ui-lower-third.ts-on{display:block;}'
      + '.ts-lt-card{background:rgba(23,24,26,0.94);border-left:6px solid var(--c-teal,#0DA591);'
      + 'border-radius:10px;padding:14px 22px;box-shadow:0 10px 36px rgba(0,0,0,0.86);}'
      + '.ts-lt-kicker{font-size:0.82rem;letter-spacing:2px;color:var(--c-teal,#0DA591);margin-bottom:6px;}'
      + '.ts-lt-text{font-size:1.5rem;line-height:1.4;color:var(--c-focus,#D4FFFC);}'

      /* ---- 快捷鍵徽章 ---- */
      + 'ui-key-hud{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:900;'
      + 'display:flex;gap:10px;pointer-events:none;}'
      + '.ts-key{display:flex;align-items:center;gap:10px;padding:8px 16px;border-radius:8px;'
      + 'background:rgba(18,20,18,0.92);border:1px solid rgba(198,199,189,0.82);'
      + 'color:var(--c-shell,#C6C7BD);font-size:0.95rem;line-height:1.4;}'
      + '.ts-key b{font-size:1.1rem;color:var(--c-focus,#D4FFFC);}'

      /* ---- 主控列 ---- */
      + '.ts-bar{position:fixed;top:0;left:0;right:0;z-index:880;display:flex;align-items:center;gap:18px;'
      + 'flex-wrap:wrap;padding:10px 24px;background:rgba(19,20,18,0.95);'
      + 'border-bottom:1px solid rgba(58,59,55,0.86);box-shadow:0 6px 22px rgba(0,0,0,0.82);}'
      + '.ts-bar.ts-hidden{display:none;}'
      + '.ts-group{display:flex;align-items:center;gap:8px;}'
      + '.ts-group+.ts-group{border-left:1px solid rgba(58,59,55,0.86);padding-left:18px;}'
      + '.ts-label{font-size:0.8rem;color:#9a9b94;letter-spacing:1px;}'
      + '.ts-btn{font-size:0.92rem;line-height:1.4;padding:7px 14px;border-radius:7px;'
      + 'border:1px solid rgba(58,59,55,0.9);background:rgba(32,33,25,0.92);'
      + 'color:var(--c-shell,#C6C7BD);cursor:pointer;}'
      + '.ts-btn:hover{border-color:var(--c-ocean,#1CCAE8);color:var(--c-ocean,#1CCAE8);}'
      + '.ts-btn.ts-active{background:var(--c-teal,#0DA591);border-color:var(--c-teal,#0DA591);'
      + 'color:#07211D;font-weight:600;}'
      + '.ts-bar select,.ts-bar input[type=number]{background:rgba(15,16,14,0.95);'
      + 'border:1px solid rgba(58,59,55,0.9);color:var(--c-shell,#C6C7BD);border-radius:6px;'
      + 'padding:6px 8px;font-size:0.9rem;}'
      + '.ts-swatch{width:18px;height:18px;border-radius:50%;border:1px solid rgba(198,199,189,0.82);}'
      + '.ts-clock{font-size:1.25rem;line-height:1.3;color:var(--c-focus,#D4FFFC);'
      + 'font-variant-numeric:tabular-nums;min-width:86px;text-align:center;}'
      + '.ts-count{font-size:0.9rem;color:#9a9b94;min-width:72px;text-align:center;}'

      /* ---- 錄影指示 ---- */
      + '.ts-rec{display:flex;align-items:center;gap:8px;font-size:0.9rem;color:var(--c-warning,#E6374B);}'
      + '.ts-rec i{width:11px;height:11px;border-radius:50%;background:var(--c-warning,#E6374B);'
      + 'display:inline-block;animation:ts-blink 1.4s infinite;}'
      + '@keyframes ts-blink{0%,100%{opacity:1;}50%{opacity:0.82;}}'
      + '.ts-frame{position:fixed;inset:0;z-index:870;pointer-events:none;display:none;'
      + 'box-shadow:inset 0 0 0 3px rgba(230,55,75,0.88);}'
      + '.ts-frame.ts-on{display:block;}'

      /* ---- 題組導覽與聚焦 ---- */
      + 'ui-bilingual-block{transition:opacity .18s ease,filter .18s ease;scroll-margin-top:96px;}'
      + 'ui-bilingual-block.ts-current .bb-wrap{border-color:var(--c-teal,#0DA591);'
      + 'box-shadow:0 0 0 1px rgba(13,165,145,0.86);}'
      + 'body.ts-focus ui-bilingual-block:not(.ts-current){opacity:0.2;filter:blur(2px);}'

      /* ---- 答案透視 ---- */
      + 'body.ts-answers .blank:not(.filled) .blank-hint{display:none;}'
      + 'body.ts-answers .blank:not(.filled)::after{content:attr(data-word);'
      + 'color:var(--c-special,#B3DE73);opacity:0.88;}'

      /* ---- 快捷鍵說明視窗 ---- */
      + '.ts-help{position:fixed;inset:0;z-index:950;display:none;align-items:center;justify-content:center;'
      + 'background:rgba(12,13,12,0.9);}'
      + '.ts-help.ts-on{display:flex;}'
      + '.ts-help-box{background:rgba(23,24,26,0.97);border:1px solid rgba(51,52,47,0.9);border-radius:12px;'
      + 'padding:26px 32px;width:620px;max-width:92vw;}'
      + '.ts-help-box h3{margin:0 0 16px 0;font-size:1.2rem;line-height:1.4;color:var(--c-focus,#D4FFFC);}'
      + '.ts-help-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px 28px;}'
      + '.ts-help-row{display:flex;align-items:center;gap:12px;font-size:0.95rem;line-height:1.4;}'
      + '.ts-help-row kbd{min-width:34px;text-align:center;padding:4px 8px;border-radius:6px;'
      + 'background:rgba(32,33,25,0.95);border:1px solid rgba(58,59,55,0.9);color:var(--c-yellow,#E3D322);}'
      ;
    var style = document.createElement('style');
    style.id = 'teach-studio-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* =========================================================
   * <ui-annotate-layer>
   * ========================================================= */
  class UiAnnotateLayer extends HTMLElement {
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
      this._width = 4;
      this._strokes = [];
      this._trail = [];
      this._drawing = false;
      this._resize();
      window.addEventListener('resize', () => this._resize());
      this._bind();
      this._tick();
    }

    setMode(mode) {
      this._mode = mode;
      this.classList.toggle('ts-live', mode !== 'off');
    }
    getMode() { return this._mode; }
    setColor(key) { this._color = PALETTE[key] || key; }
    setWidth(px) { this._width = Math.max(1, Number(px) || 4); }

    clear() {
      this._strokes = [];
      this._redraw();
    }
    undo() {
      this._strokes.pop();
      this._redraw();
    }

    _resize() {
      var dpr = window.devicePixelRatio || 1;
      var w = this.clientWidth, h = this.clientHeight;
      [this._ink, this._laser].forEach((cv) => {
        cv.width = w * dpr;
        cv.height = h * dpr;
      });
      this._ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._ictx.lineCap = 'round';
      this._ictx.lineJoin = 'round';
      this._lctx.lineCap = 'round';
      this._lctx.lineJoin = 'round';
      this._redraw();
    }

    _redraw() {
      this._ictx.clearRect(0, 0, this.clientWidth, this.clientHeight);
      this._strokes.forEach((s) => this._paint(s));
    }

    _paint(stroke) {
      var ctx = this._ictx;
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.globalAlpha = stroke.mode === 'marker' ? 0.78 : 1;
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

    _lineWidth(e) {
      var base = this._mode === 'marker' ? this._width * 5 : this._width;
      if (e.pointerType === 'pen' && e.pressure > 0) {
        return base * (0.25 + e.pressure * 1.6);
      }
      return base;
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
          mode: this._mode,
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
        var n = s.points.length;
        var ctx = this._ictx;
        ctx.save();
        ctx.globalAlpha = s.mode === 'marker' ? 0.78 : 1;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.points[n - 1].w;
        ctx.beginPath();
        ctx.moveTo(s.points[n - 2].x, s.points[n - 2].y);
        ctx.lineTo(s.points[n - 1].x, s.points[n - 1].y);
        ctx.stroke();
        ctx.restore();
      });
      var end = () => { this._drawing = false; };
      this.addEventListener('pointerup', end);
      this.addEventListener('pointercancel', end);
    }

    /* 雷射軌跡：僅以寬度衰減呈現殘影，不壓低透明度 */
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
  customElements.define('ui-annotate-layer', UiAnnotateLayer);

  /* =========================================================
   * <ui-spotlight>
   * ========================================================= */
  class UiSpotlight extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this._radius = 210;
      document.addEventListener('pointermove', (e) => {
        if (!this.classList.contains('ts-on')) return;
        this.style.setProperty('--ts-spot-x', e.clientX + 'px');
        this.style.setProperty('--ts-spot-y', e.clientY + 'px');
      });
    }
    toggle(on) {
      var next = (on === undefined) ? !this.classList.contains('ts-on') : !!on;
      this.classList.toggle('ts-on', next);
      return next;
    }
    setRadius(px) {
      this._radius = Math.max(80, Number(px) || 210);
      this.style.setProperty('--ts-spot-r', this._radius + 'px');
    }
  }
  customElements.define('ui-spotlight', UiSpotlight);

  /* =========================================================
   * <ui-lower-third>
   * ========================================================= */
  class UiLowerThird extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this.innerHTML =
        '<div class="ts-lt-card">' +
        '<div class="ts-lt-kicker" data-role="kicker">IELTS SPEAKING</div>' +
        '<div class="ts-lt-text" data-role="text"></div>' +
        '</div>';
    }
    show(text, kicker) {
      this.querySelector('[data-role="text"]').textContent = text || '';
      if (kicker) this.querySelector('[data-role="kicker"]').textContent = kicker;
      this.classList.add('ts-on');
    }
    hide() { this.classList.remove('ts-on'); }
    toggle(text, kicker) {
      if (this.classList.contains('ts-on')) { this.hide(); return false; }
      this.show(text, kicker);
      return true;
    }
  }
  customElements.define('ui-lower-third', UiLowerThird);

  /* =========================================================
   * <ui-key-hud>
   * ========================================================= */
  class UiKeyHud extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
    }
    flash(key, label) {
      this.innerHTML = '<div class="ts-key"><b>' + key + '</b><span>' + label + '</span></div>';
      clearTimeout(this._timer);
      this._timer = setTimeout(() => { this.innerHTML = ''; }, 1400);
    }
  }
  customElements.define('ui-key-hud', UiKeyHud);

  /* =========================================================
   * <ui-studio-bar>
   * ========================================================= */
  class UiStudioBar extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this._index = 0;
      this._seconds = 0;
      this._running = false;

      var colorOpts = PEN_OPTIONS.map(function (o) {
        return '<option value="' + o[0] + '">' + o[1] + '</option>';
      }).join('');

      this.innerHTML =
        '<div class="ts-bar" data-role="bar">' +
        '<div class="ts-group">' +
        '<span class="ts-label">標註</span>' +
        '<button type="button" class="ts-btn" data-mode="pen">筆 1</button>' +
        '<button type="button" class="ts-btn" data-mode="marker">螢光 2</button>' +
        '<button type="button" class="ts-btn" data-mode="laser">雷射 3</button>' +
        '<button type="button" class="ts-btn ts-active" data-mode="off">關閉 0</button>' +
        '<button type="button" class="ts-btn" data-act="undo">復原 Z</button>' +
        '<button type="button" class="ts-btn" data-act="clear">清除 C</button>' +
        '</div>' +
        '<div class="ts-group">' +
        '<span class="ts-label">筆跡</span>' +
        '<span class="ts-swatch" data-role="swatch"></span>' +
        '<select data-role="color">' + colorOpts + '</select>' +
        '<input type="number" data-role="width" min="1" max="14" step="1" value="4" style="width:64px" />' +
        '</div>' +
        '<div class="ts-group">' +
        '<span class="ts-label">畫面</span>' +
        '<button type="button" class="ts-btn" data-act="spot">聚光燈 S</button>' +
        '<button type="button" class="ts-btn" data-act="focus">單題聚焦 F</button>' +
        '<button type="button" class="ts-btn" data-act="answers">答案 A</button>' +
        '<button type="button" class="ts-btn" data-act="card">字卡</button>' +
        '</div>' +
        '<div class="ts-group">' +
        '<span class="ts-label">題組</span>' +
        '<button type="button" class="ts-btn" data-act="prev">上一題 J</button>' +
        '<span class="ts-count" data-role="count">0 / 0</span>' +
        '<button type="button" class="ts-btn" data-act="next">下一題 K</button>' +
        '</div>' +
        '<div class="ts-group">' +
        '<span class="ts-clock" data-role="clock">00:00</span>' +
        '<button type="button" class="ts-btn" data-act="timer">開始 T</button>' +
        '<button type="button" class="ts-btn" data-act="reset">歸零</button>' +
        '</div>' +
        '<div class="ts-group">' +
        '<button type="button" class="ts-btn" data-act="rec">錄影指示 R</button>' +
        '<span class="ts-rec" data-role="rec" style="display:none"><i></i>REC</span>' +
        '<button type="button" class="ts-btn" data-act="help">? 快捷鍵</button>' +
        '<button type="button" class="ts-btn" data-act="hide">隱藏 H</button>' +
        '</div>' +
        '</div>' +
        '<div class="ts-frame" data-role="frame"></div>' +
        '<div class="ts-help" data-role="help"><div class="ts-help-box">' +
        '<h3>錄影教學快捷鍵（按 Esc 或再按一次 ? 關閉）</h3>' +
        '<div class="ts-help-grid">' +
        SHORTCUTS.map(function (s) {
          return '<div class="ts-help-row"><kbd>' + s[0] + '</kbd><span>' + s[1] + '</span></div>';
        }).join('') +
        '</div></div></div>';

      this._bar = this.querySelector('[data-role="bar"]');
      this._frame = this.querySelector('[data-role="frame"]');
      this._help = this.querySelector('[data-role="help"]');
      this._clock = this.querySelector('[data-role="clock"]');
      this._count = this.querySelector('[data-role="count"]');
      this._swatch = this.querySelector('[data-role="swatch"]');

      this._wire();
      this._syncPen();
      this.refresh();
      setInterval(() => {
        if (!this._running) return;
        this._seconds += 1;
        this._renderClock();
      }, 1000);
      this._bindKeys();
    }

    /* ---- 相關元件查找 ---- */
    get layer() { return document.querySelector('ui-annotate-layer'); }
    get spot() { return document.querySelector('ui-spotlight'); }
    get card() { return document.querySelector('ui-lower-third'); }
    get hud() { return document.querySelector('ui-key-hud'); }
    get modal() { return document.querySelector('ui-handwrite-modal'); }
    get blocks() { return Array.prototype.slice.call(document.querySelectorAll('ui-bilingual-block')); }

    refresh() {
      var list = this.blocks;
      if (this._index >= list.length) this._index = Math.max(0, list.length - 1);
      this._count.textContent = (list.length ? this._index + 1 : 0) + ' / ' + list.length;
      list.forEach((b, i) => b.classList.toggle('ts-current', i === this._index));
    }

    _wire() {
      this.querySelectorAll('[data-mode]').forEach((btn) => {
        btn.addEventListener('click', () => this.setMode(btn.getAttribute('data-mode')));
      });
      var acts = {
        undo: () => { this.layer && this.layer.undo(); },
        clear: () => { this.layer && this.layer.clear(); },
        spot: () => this.toggleSpot(),
        focus: () => this.toggleFocus(),
        answers: () => this.toggleAnswers(),
        card: () => this.toggleCard(),
        prev: () => this.go(-1),
        next: () => this.go(1),
        timer: () => this.toggleTimer(),
        reset: () => { this._seconds = 0; this._renderClock(); },
        rec: () => this.toggleRec(),
        help: () => this.toggleHelp(),
        hide: () => this.toggleBar()
      };
      Object.keys(acts).forEach((k) => {
        var btn = this.querySelector('[data-act="' + k + '"]');
        if (btn) btn.addEventListener('click', acts[k]);
      });
      this._help.addEventListener('click', () => this.toggleHelp(false));

      this.querySelector('[data-role="color"]').addEventListener('change', () => this._syncPen());
      this.querySelector('[data-role="width"]').addEventListener('change', () => this._syncPen());
    }

    _syncPen() {
      var key = this.querySelector('[data-role="color"]').value;
      var width = this.querySelector('[data-role="width"]').value;
      this._swatch.style.background = PALETTE[key] || key;
      if (this.layer) { this.layer.setColor(key); this.layer.setWidth(width); }
      if (this.modal) { this.modal.setPenColor(key); this.modal.setPenWidth(width); }
    }

    /* ---- 行為 ---- */
    setMode(mode) {
      if (this.layer) this.layer.setMode(mode);
      this.querySelectorAll('[data-mode]').forEach((b) => {
        b.classList.toggle('ts-active', b.getAttribute('data-mode') === mode);
      });
    }
    toggleSpot() {
      var on = this.spot ? this.spot.toggle() : false;
      this.querySelector('[data-act="spot"]').classList.toggle('ts-active', on);
    }
    toggleFocus() {
      var on = document.body.classList.toggle('ts-focus');
      this.querySelector('[data-act="focus"]').classList.toggle('ts-active', on);
      if (on) this._scrollTo();
    }
    toggleAnswers() {
      var on = document.body.classList.toggle('ts-answers');
      this.querySelector('[data-act="answers"]').classList.toggle('ts-active', on);
    }
    toggleCard() {
      var list = this.blocks;
      var cur = list[this._index];
      var text = cur ? (cur.getAttribute('data-title') || ('題組 ' + (this._index + 1))) : '';
      var on = this.card ? this.card.toggle(text) : false;
      this.querySelector('[data-act="card"]').classList.toggle('ts-active', on);
    }
    go(step) {
      var list = this.blocks;
      if (!list.length) return;
      this._index = Math.min(list.length - 1, Math.max(0, this._index + step));
      this.refresh();
      this._scrollTo();
      if (this.card && this.card.classList.contains('ts-on')) {
        var cur = list[this._index];
        this.card.show(cur.getAttribute('data-title') || ('題組 ' + (this._index + 1)));
      }
    }
    _scrollTo() {
      var cur = this.blocks[this._index];
      if (cur) cur.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    toggleTimer() {
      this._running = !this._running;
      this.querySelector('[data-act="timer"]').textContent = (this._running ? '暫停 T' : '開始 T');
      this.querySelector('[data-act="timer"]').classList.toggle('ts-active', this._running);
    }
    _renderClock() {
      var m = String(Math.floor(this._seconds / 60)).padStart(2, '0');
      var s = String(this._seconds % 60).padStart(2, '0');
      this._clock.textContent = m + ':' + s;
    }
    toggleRec() {
      var on = this._frame.classList.toggle('ts-on');
      this.querySelector('[data-role="rec"]').style.display = on ? 'flex' : 'none';
      this.querySelector('[data-act="rec"]').classList.toggle('ts-active', on);
    }
    toggleHelp(force) {
      var next = (force === undefined) ? !this._help.classList.contains('ts-on') : !!force;
      this._help.classList.toggle('ts-on', next);
    }
    toggleBar() {
      var hidden = this._bar.classList.toggle('ts-hidden');
      if (hidden) toast('主控列已隱藏，按 H 可再次顯示。', 'info');
    }

    /* ---- 快捷鍵 ---- */
    _bindKeys() {
      document.addEventListener('keydown', (e) => {
        var t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var k = e.key;
        var label = '';
        switch (k) {
          case '1': this.setMode('pen'); label = '一般筆跡'; break;
          case '2': this.setMode('marker'); label = '螢光筆'; break;
          case '3': this.setMode('laser'); label = '雷射指標'; break;
          case '0': this.setMode('off'); label = '關閉標註'; break;
          case 'z': case 'Z': this.layer && this.layer.undo(); label = '復原'; break;
          case 'c': case 'C': this.layer && this.layer.clear(); label = '清除標註'; break;
          case 's': case 'S': this.toggleSpot(); label = '聚光燈'; break;
          case 'f': case 'F': this.toggleFocus(); label = '單題聚焦'; break;
          case 'a': case 'A': this.toggleAnswers(); label = '答案透視'; break;
          case 'j': case 'J': this.go(-1); label = '上一題組'; break;
          case 'k': case 'K': this.go(1); label = '下一題組'; break;
          case 't': case 'T': this.toggleTimer(); label = '計時'; break;
          case 'r': case 'R': this.toggleRec(); label = '錄影指示'; break;
          case 'h': case 'H': this.toggleBar(); label = '主控列'; break;
          case '?': this.toggleHelp(); label = '快捷鍵說明'; break;
          case 'Escape': this.toggleHelp(false); label = ''; break;
          default: return;
        }
        e.preventDefault();
        if (label && this.hud) this.hud.flash(k.toUpperCase(), label);
      });
    }
  }
  customElements.define('ui-studio-bar', UiStudioBar);

  /* ---------- 對外介面 ---------- */
  injectStyles();
  window.TeachStudio = {
    shortcuts: SHORTCUTS,
    bar: function () { return document.querySelector('ui-studio-bar'); }
  };
})();
