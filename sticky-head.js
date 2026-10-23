/*!
 * sticky-head.js
 * 語意標籤元件：<sticky-head> 章節吸頂標題列
 * v1.1.0  2026-10-23
 *
 * v1.1.0 修正捲動閃爍：
 *   1. 外框高度鎖定，縮放只發生在內層 .sh-bar，文件總高度不再隨動畫變動
 *   2. 捲動方向改用累積位移加門檻與冷卻，瀏覽器 scroll anchiring 的補償不再被誤判
 *   3. overflow-anchor:none，blur 改為選用且圖層常駐，進度條不再逐格做 transition
 *
 * 用法（必須是 <section> 的直接子元素，吸頂範圍才會被該 section 限制住）：
 *
 *   <section id="lesson-1">
 *     <sticky-head top="0px" accent="ocean" label="Lesson 1" top-btn="回本節">
 *       <h2>主幹保證＋附加資訊</h2>
 *     </sticky-head>
 *     ... 內容 ...
 *   </section>
 *
 * 無 Shadow DOM、無外部 CSS 檔、無框架相依。
 */
(function () {
  'use strict';

  var VERSION = '1.1.0';
  var STYLE_ID = 'sticky-head-inline-style';

  /* ---------- 配色 ---------- */
  var PALETTE = {
    background: '#0C0D0C',
    shell: '#C6C7BD',
    lavender: '#C3A5E5',
    sky: '#82C8E5',
    warning: '#E6374B',
    salmon: '#E5C3B3',
    ocean: '#1CCAE8',
    safe: '#27AE60',
    teal: '#0DA591',
    vanilla: '#DBEDD8',
    yellow: '#E3D322',
    focus: '#D4FFFC',
    special: '#B3DE73',
    info: '#4171BF',
    indigo: '#7849C9',
    pink: '#FF91D7',
    orange: '#EDA109'
  };

  var MIN_ALPHA = 0.78;      // 透明度下限
  var DIR_THRESHOLD = 10;    // 累積位移門檻，低於此值不判定方向
  var HIDE_COOLDOWN = 240;   // auto-hide 兩次切換的最短間隔，單位 ms

  function resolveColor(value, fallback) {
    if (value === null || value === undefined || value === '') return fallback;
    var v = String(value).trim();
    var hit = PALETTE[v.toLowerCase()];
    return hit ? hit : v;
  }

  function hexToRgba(hex, alpha) {
    var h = String(hex).trim().replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return hex;
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    var a = Math.max(MIN_ALPHA, Math.min(1, alpha));
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
  }

  function rootFontSize() {
    var fs = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return isNaN(fs) ? 16 : fs;
  }

  function toPx(value, fallback) {
    if (value === null || value === undefined || value === '') return fallback;
    var v = String(value).trim();
    var n = parseFloat(v);
    if (isNaN(n)) return fallback;
    if (v.indexOf('rem') > -1 || v.indexOf('em') > -1) return n * rootFontSize();
    return n;
  }

  function boolAttr(el, name, dflt) {
    if (!el.hasAttribute(name)) return dflt;
    var v = el.getAttribute(name);
    if (v === '' || v === null) return true;
    v = String(v).trim().toLowerCase();
    return !(v === 'false' || v === '0' || v === 'no');
  }

  /* ---------- 樣式注入（CSS 與 JS 同檔，不分離） ---------- */
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      /* 外框：只負責吸頂與佔位，高度鎖定後永不改變，所以文件高度不會抖動 */
      'sticky-head{',
      '  position:sticky;display:block;box-sizing:border-box;',
      '  top:var(--sh-top,0px);z-index:var(--sh-z,60);',
      '  height:var(--sh-h,auto);',
      '  overflow-anchor:none;pointer-events:none;',
      '}',

      /* 內層視覺列：所有尺寸與配色變化都在這一層，不影響外部版面 */
      'sticky-head .sh-bar{',
      '  position:relative;box-sizing:border-box;pointer-events:auto;',
      '  display:flex;align-items:center;justify-content:space-between;gap:16px;',
      '  padding:var(--sh-pad,16px 20px);',
      '  font-size:var(--sh-size,1.75rem);line-height:1.3;',
      '  color:var(--sh-color,#C6C7BD);',
      '  background-color:transparent;',
      '  border-bottom:1px solid transparent;',
      '  transition:padding .22s ease,font-size .22s ease,background-color .24s ease,',
      '    border-color .24s ease,box-shadow .24s ease,transform .26s ease;',
      '}',
      'sticky-head[data-stuck="true"] .sh-bar{',
      '  padding:var(--sh-pad-stuck,8px 20px);',
      '  font-size:var(--sh-size-stuck,1.125rem);',
      '  background-color:var(--sh-bg);',
      '  border-bottom-color:var(--sh-accent);',
      '  box-shadow:var(--sh-shadow,none);',
      '}',

      /* blur 為選用。圖層常駐，避免吸頂瞬間新建或銷毀合成圖層造成閃一下 */
      'sticky-head[data-blur="1"] .sh-bar{',
      '  backdrop-filter:blur(var(--sh-blur-now,0px));',
      '  -webkit-backdrop-filter:blur(var(--sh-blur-now,0px));',
      '}',
      'sticky-head[data-blur="1"][data-stuck="true"] .sh-bar{--sh-blur-now:var(--sh-blur,0px);}',

      /* 量測用的瞬時狀態：強制回到未吸頂尺寸且停用動畫，同一個 task 內讀完就移除 */
      'sticky-head[data-measuring] .sh-bar{',
      '  padding:var(--sh-pad,16px 20px) !important;',
      '  font-size:var(--sh-size,1.75rem) !important;',
      '  transform:none !important;transition:none !important;',
      '}',

      'sticky-head[data-hidden="true"] .sh-bar{transform:translateY(-140%);}',
      'sticky-head .sh-main{flex:1 1 auto;min-width:0;}',
      'sticky-head .sh-main>*{margin:0;font-size:inherit;line-height:inherit;color:inherit;}',
      'sticky-head .sh-aside{',
      '  flex:0 0 auto;display:flex;align-items:center;gap:10px;',
      '  font-size:1.125rem;line-height:1.4;',
      '  opacity:0;transform:translateY(-4px);pointer-events:none;',
      '  transition:opacity .2s ease,transform .2s ease;',
      '}',
      'sticky-head[data-stuck="true"] .sh-aside{opacity:1;transform:none;pointer-events:auto;}',
      'sticky-head[data-hidden="true"] .sh-aside{pointer-events:none;}',
      'sticky-head .sh-chip{',
      '  padding:3px 14px;border-radius:999px;white-space:nowrap;',
      '  border:1px solid var(--sh-accent);color:var(--sh-accent);',
      '}',
      'sticky-head .sh-top-btn{',
      '  font:inherit;line-height:1.4;cursor:pointer;white-space:nowrap;',
      '  padding:3px 14px;border-radius:999px;',
      '  background-color:transparent;border:1px solid var(--sh-accent);color:var(--sh-accent);',
      '  transition:background-color .18s ease,color .18s ease;',
      '}',
      'sticky-head .sh-top-btn:hover,sticky-head .sh-top-btn:focus-visible{',
      '  background-color:var(--sh-accent);color:var(--sh-bg-solid,#0C0D0C);outline:none;',
      '}',
      /* 進度條：逐格直接設定寬度，不做 transition，避免持續的合成動畫 */
      'sticky-head .sh-progress{',
      '  position:absolute;left:0;right:0;bottom:-1px;overflow:hidden;',
      '  height:var(--sh-bar-h,3px);background-color:transparent;',
      '  opacity:0;transition:opacity .24s ease;pointer-events:none;',
      '}',
      'sticky-head[data-stuck="true"] .sh-progress{opacity:1;}',
      'sticky-head .sh-progress>i{',
      '  display:block;height:100%;width:0;background-color:var(--sh-accent);',
      '}',
      'sticky-head .sh-sentinel{',
      '  display:block;height:1px;margin:0;padding:0;',
      '  visibility:hidden;overflow-anchor:none;',
      '}',
      '@media (prefers-reduced-motion: reduce){',
      '  sticky-head .sh-bar,sticky-head .sh-aside,sticky-head .sh-progress{transition:none;}',
      '}'
    ].join('\n');

    var tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.setAttribute('data-from', 'sticky-head.js v' + VERSION);
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  /* ---------- 共用的捲動排程 ---------- */
  var instances = [];
  var ticking = false;
  var lastY = window.pageYOffset || 0;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.pageYOffset || 0;
      var dy = y - lastY;
      lastY = y;
      for (var i = 0; i < instances.length; i++) instances[i]._tick(dy);
      ticking = false;
    });
  }

  var resizeTid = null;
  function onResize() {
    if (resizeTid) clearTimeout(resizeTid);
    resizeTid = setTimeout(function () {
      for (var i = 0; i < instances.length; i++) {
        instances[i]._measure();
        instances[i]._measureHeight();
      }
      lastY = window.pageYOffset || 0;
      onScroll();
    }, 120);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('hashchange', function () {
    lastY = window.pageYOffset || 0;
    onScroll();
  });

  /* ---------- 元件本體 ---------- */
  function defineElement() {
    if (window.customElements && customElements.get('sticky-head')) return;

    var StickyHeadElement = class extends HTMLElement {
      constructor() {
        super();
        this._built = false;
        this._stuck = false;
        this._hidden = false;
        this._topPx = 0;
        this._acc = 0;
        this._lastToggle = 0;
        this._io = null;
        this._scope = null;
        this._lastWidth = 0;
      }

      connectedCallback() {
        injectStyle();
        if (!this._built) this._build();
        this._ensureSentinel();
        if (instances.indexOf(this) === -1) instances.push(this);
        this._measure();

        var self = this;
        this._measureHeight();
        requestAnimationFrame(function () { self._measureHeight(); });
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function () { self._measureHeight(); });
        }
        this._watchWidth();
        this._observe();
        this._tick(0);
      }

      disconnectedCallback() {
        var i = instances.indexOf(this);
        if (i > -1) instances.splice(i, 1);
        if (this._io) { this._io.disconnect(); this._io = null; }
        if (this._ro) { this._ro.disconnect(); this._ro = null; }
        if (this._sentinel && this._sentinel.parentNode) {
          this._sentinel.parentNode.removeChild(this._sentinel);
        }
      }

      /* 建立內部結構並搬移原有內容 */
      _build() {
        var bar = document.createElement('div');
        bar.className = 'sh-bar';

        var main = document.createElement('div');
        main.className = 'sh-main';
        while (this.firstChild) main.appendChild(this.firstChild);

        var aside = document.createElement('div');
        aside.className = 'sh-aside';

        var label = this.getAttribute('label');
        if (label) {
          var chip = document.createElement('span');
          chip.className = 'sh-chip';
          chip.textContent = label;
          aside.appendChild(chip);
        }

        var btnText = this.getAttribute('top-btn');
        if (btnText) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'sh-top-btn';
          btn.textContent = btnText;
          var self = this;
          btn.addEventListener('click', function () { self.scrollToSection(); });
          aside.appendChild(btn);
        }

        bar.appendChild(main);
        bar.appendChild(aside);

        if (boolAttr(this, 'progress', true)) {
          var prog = document.createElement('div');
          prog.className = 'sh-progress';
          var fill = document.createElement('i');
          prog.appendChild(fill);
          bar.appendChild(prog);
          this._fill = fill;
        }

        this.appendChild(bar);
        this._bar = bar;
        this._main = main;
        this._aside = aside;
        this._built = true;
        this._applyVars();
      }

      /* 哨兵：固定 1px，放在元件前方，用來穩定判斷吸頂狀態 */
      _ensureSentinel() {
        if (this._sentinel && this._sentinel.parentNode === this.parentNode) return;
        var sentinel = document.createElement('span');
        sentinel.className = 'sh-sentinel';
        sentinel.setAttribute('aria-hidden', 'true');
        if (this.parentNode) this.parentNode.insertBefore(sentinel, this);
        this._sentinel = sentinel;
      }

      _applyVars() {
        var accent = resolveColor(this.getAttribute('accent'), PALETTE.ocean);
        var color = resolveColor(this.getAttribute('color'), PALETTE.shell);
        var bgSolid = resolveColor(this.getAttribute('bg'), PALETTE.background);
        var alphaAttr = parseFloat(this.getAttribute('opacity'));
        var alpha = isNaN(alphaAttr) ? 0.88 : alphaAttr;
        var blur = toPx(this.getAttribute("blur"), 6);

        this.style.setProperty('--sh-top', this.getAttribute('top') || '0px');
        this.style.setProperty('--sh-z', this.getAttribute('z') || '60');
        this.style.setProperty('--sh-color', color);
        this.style.setProperty('--sh-accent', accent);
        this.style.setProperty('--sh-bg', hexToRgba(bgSolid, alpha));
        this.style.setProperty('--sh-bg-solid', bgSolid);
        this.style.setProperty('--sh-size', this.getAttribute('size') || '1.75rem');
        this.style.setProperty('--sh-size-stuck', this.getAttribute('size-stuck') || '1.125rem');
        this.style.setProperty('--sh-pad', this.getAttribute('padding') || '16px 20px');
        this.style.setProperty('--sh-pad-stuck', this.getAttribute('padding-stuck') || '8px 20px');
        this.style.setProperty('--sh-bar-h', toPx(this.getAttribute('bar-height'), 3) + 'px');
        this.style.setProperty(
          '--sh-shadow',
          boolAttr(this, 'shadow', true) ? '0 6px 18px rgba(12, 13, 12, 0.82)' : 'none'
        );

        if (blur > 0) {
          this.style.setProperty('--sh-blur', blur + 'px');
          this.setAttribute('data-blur', '1');
        } else {
          this.removeAttribute('data-blur');
        }
      }

      /*
       * 鎖定外框高度。
       * 先暫時強制回到未吸頂尺寸並停用動畫，同步讀取高度後立刻還原；
       * 讀寫都在同一個 task 內完成，中間不會發生繪製，所以看不到跳動。
       */
      _measureHeight() {
        if (!this._bar || !this.isConnected) return;
        this.setAttribute('data-measuring', '1');
        this.style.setProperty('--sh-h', 'auto');
        var h = this._bar.offsetHeight;
        this.removeAttribute('data-measuring');
        if (h > 0) this.style.setProperty('--sh-h', h + 'px');
      }

      /* 寬度改變才重新量測，避免觀察自身高度造成回饋循環 */
      _watchWidth() {
        if (!('ResizeObserver' in window) || !this.parentElement) return;
        var self = this;
        this._lastWidth = this.parentElement.clientWidth;
        this._ro = new ResizeObserver(function () {
          if (!self.parentElement) return;
          var w = self.parentElement.clientWidth;
          if (w === self._lastWidth) return;
          self._lastWidth = w;
          self._measureHeight();
        });
        this._ro.observe(this.parentElement);
      }

      _measure() {
        this._topPx = toPx(this.getAttribute('top'), 0);
        var sel = this.getAttribute('scope');
        this._scope = sel ? document.querySelector(sel)
                          : (this.closest('section') || this.parentElement);

        // 任何祖先設了 overflow 非 visible，position:sticky 都會失效
        var node = this.parentElement;
        while (node && node !== document.body) {
          var cs = getComputedStyle(node);
          if (cs.overflow !== 'visible' || cs.overflowY !== 'visible') {
            console.warn('[sticky-head] 祖先元素的 overflow 為 ' +
              cs.overflow + ' / ' + cs.overflowY + '，position:sticky 會失效。', node);
            break;
          }
          node = node.parentElement;
        }
      }

      _observe() {
        if (!('IntersectionObserver' in window) || !this._sentinel) return;
        if (this._io) this._io.disconnect();
        var self = this;
        this._io = new IntersectionObserver(function () {
          self._evalStuck();
        }, {
          rootMargin: '-' + Math.round(this._topPx) + 'px 0px 0px 0px',
          threshold: [0, 1]
        });
        this._io.observe(this._sentinel);
      }

      /*
       * 直接以哨兵的位置判定吸頂，不依賴 IntersectionObserver 的狀態轉換。
       * 跳躍式捲動（錨點連結、目錄、程式捲動）會讓哨兵一次越過整個視窗，
       * isIntersecting 全程維持 false，IO 不會觸發回呼，狀態因此卡住。
       * 2px 的遲滯用來避免剛好停在交界時反覆切換。
       */
      _evalStuck() {
        if (!this._sentinel || !this.isConnected) return;
        var top = this._sentinel.getBoundingClientRect().top;
        if (!this._stuck && top <= this._topPx) this._setStuck(true);
        else if (this._stuck && top > this._topPx + 2) this._setStuck(false);
      }

      _setStuck(stuck) {
        if (stuck === this._stuck) return;
        this._stuck = stuck;
        this.setAttribute('data-stuck', stuck ? 'true' : 'false');
        this._acc = 0;
        if (!stuck) this._setHidden(false);
        this.dispatchEvent(new CustomEvent(stuck ? 'sticky-head:stuck' : 'sticky-head:unstuck', {
          bubbles: true,
          detail: { id: this.id || null, scope: this._scope }
        }));
      }

      _setHidden(hidden) {
        if (hidden === this._hidden) return;
        this._hidden = hidden;
        this._lastToggle = Date.now();
        this.setAttribute('data-hidden', hidden ? 'true' : 'false');
      }

      /*
       * dy 是本格的捲動位移。
       * 方向改用累積位移加門檻判定，瀏覽器為了穩定畫面而補償的 1 到 4px
       * 不足以越過門檻，因此不會被誤判成反向捲動。
       */
      _tick(dy) {
        this._evalStuck();

        if (boolAttr(this, 'auto-hide', false)) {
          if (dy !== 0) {
            if ((dy > 0) !== (this._acc > 0)) this._acc = 0;
            this._acc += dy;
          }
          if (Math.abs(this._acc) >= DIR_THRESHOLD &&
              Date.now() - this._lastToggle >= HIDE_COOLDOWN) {
            if (this._acc > 0 && this._stuck) { this._setHidden(true); this._acc = 0; }
            else if (this._acc < 0) { this._setHidden(false); this._acc = 0; }
          }
        }

        if (!this._fill || !this._scope) return;
        this._fill.style.width = (this.progress * 100).toFixed(2) + '%';
      }

      /* ---- 公開 API ---- */
      get isStuck() { return this._stuck; }

      get progress() {
        if (!this._scope) return 0;
        var r = this._scope.getBoundingClientRect();
        var span = r.height - this.offsetHeight;
        if (span <= 0) return 0;
        return Math.max(0, Math.min(1, (this._topPx - r.top) / span));
      }

      scrollToSection() {
        var target = this._scope || this;
        var y = window.pageYOffset + target.getBoundingClientRect().top - this._topPx - 2;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }

      refresh() {
        this._applyVars();
        this._measure();
        this._measureHeight();
        this._observe();
        this._tick(0);
      }
    };

    customElements.define('sticky-head', StickyHeadElement);
  }

  defineElement();

  /* ---------- 全域工具 ---------- */
  window.StickyHead = {
    version: VERSION,
    palette: PALETTE,
    refresh: function () {
      document.querySelectorAll('sticky-head').forEach(function (el) {
        if (typeof el.refresh === 'function') el.refresh();
      });
      lastY = window.pageYOffset || 0;
      onScroll();
    },
    remeasure: function () {
      document.querySelectorAll('sticky-head').forEach(function (el) {
        if (typeof el._measureHeight === 'function') el._measureHeight();
      });
    },
    all: function () {
      return Array.prototype.slice.call(document.querySelectorAll('sticky-head'));
    }
  };
})();
