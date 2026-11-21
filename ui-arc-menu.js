/*!
 * ui-arc-menu
 * 弧形單層菜單，語意標籤元件，不使用 shadow DOM，CSS 內嵌於本檔。
 *
 * <ui-arc-menu position="right" collapsible theme="blue" tunnel="rings" duration="800">
 *   <ui-arc-item href="#home">首頁</ui-arc-item>
 *   <ui-arc-item href="#about" icon="bi-person">關於</ui-arc-item>
 *   <ui-arc-item href="/x.html" theme="pink">連結</ui-arc-item>
 * </ui-arc-menu>
 *
 * ui-arc-menu 屬性
 *   position    left | right | top | bottom，貼齊該邊並置中，預設 right
 *   collapsible 布林，有寫才可收合（點擊中心鈕切換，不使用 hover）
 *   collapsed   布林，可收合時，載入當下先收合（預設為展開）
 *   open        目前展開狀態，會隨點擊同步，可由外部讀取或設定
 *   theme       項目預設主題色，項目自己的 theme 優先
 *   radius      弧半徑 px，預設 160
 *   tunnel      rings | lines | both | none，預設 rings
 *   duration    隧道轉場毫秒，預設 800
 *
 * ui-arc-item 屬性
 *   href        點擊後以隧道轉場前往，target="_blank" 則直接開新視窗
 *   icon        有設定就只顯示圖示（bi- 開頭視為 Bootstrap Icons class，否則當文字符號），
 *               標籤文字改放 title；沒設定就只顯示文字
 *   theme       主題色名稱
 *   disabled    布林
 *
 * 事件（皆在 ui-arc-menu 上觸發並冒泡）
 *   arc-select    可取消，detail: { item, href, label, index }
 *   arc-navigate  隧道結束後、前往 href 前觸發，可取消，取消後由外部自行處理
 *   arc-toggle    展開狀態改變，detail: { open }
 *
 * 方法：expand()、collapse()、toggle()
 */
(function () {
  if (customElements.get('ui-arc-menu')) return;

  var THEMES = {
    yellow: '#E3D322', pink: '#FF91D7', red: '#EF6661', green: '#71CD76',
    blue: '#5DBAE8', indigo: '#778CE1', violet: '#B484E8', key: '#51DBCF',
    calm: '#A3C4BC', quiet: '#8EA4DE', playful: '#FFA987', urgent: '#FF2E63',
    energetic: '#B6FF00', dreamy: '#C394CD', salmon: '#FFC88A',
    shell: '#C6C7BD', vanilla: '#DBEDD8'
  };
  var CYCLE = ['key', 'pink', 'yellow', 'green', 'blue', 'violet', 'playful', 'indigo'];
  var DARK = '#0C0D0C', ALT = '#2D2D2D', SHELL = '#C6C7BD';
  var POS = ['left', 'right', 'top', 'bottom'];
  var MODES = ['rings', 'lines', 'both', 'none'];

  function injectStyle() {
    if (document.getElementById('ui-arc-menu-style')) return;
    var css = '' +
      'ui-arc-menu{--c:' + THEMES.key + ';position:fixed;z-index:1000;display:block;width:0;height:0;right:36px;left:auto;top:50%;bottom:auto}' +
      'ui-arc-menu[position="left"]{left:36px;right:auto;top:50%;bottom:auto}' +
      'ui-arc-menu[position="right"]{right:36px;left:auto;top:50%;bottom:auto}' +
      'ui-arc-menu[position="top"]{top:36px;bottom:auto;left:50%;right:auto}' +
      'ui-arc-menu[position="bottom"]{bottom:36px;top:auto;left:50%;right:auto}' +
      '.ui-arc-hub{position:absolute;left:0;top:0;z-index:2;width:56px;height:56px;margin:0;padding:0;border:2px solid var(--c);border-radius:50%;background:' + ALT + ';cursor:pointer;outline:none;transform:translate(-50%,-50%);transition:transform .35s ease,box-shadow .2s ease}' +
      '.ui-arc-hub:hover,.ui-arc-hub:focus-visible{box-shadow:0 0 0 3px ' + SHELL + '}' +
      '.ui-arc-hub::before,.ui-arc-hub::after{content:"";position:absolute;left:50%;top:50%;width:22px;height:3px;margin:-1.5px 0 0 -11px;border-radius:2px;background:var(--c)}' +
      '.ui-arc-hub::after{transform:rotate(90deg)}' +
      'ui-arc-menu:not([collapsible]) .ui-arc-hub{cursor:default}' +
      'ui-arc-menu:not([collapsible]) .ui-arc-hub:hover{box-shadow:none}' +
      'ui-arc-menu:not([collapsible]) .ui-arc-hub::before{width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%}' +
      'ui-arc-menu:not([collapsible]) .ui-arc-hub::after{display:none}' +
      'ui-arc-menu[collapsible][open] .ui-arc-hub{transform:translate(-50%,-50%) rotate(45deg)}' +
      'ui-arc-item{--c:' + THEMES.key + ';position:absolute;left:0;top:0;z-index:1;box-sizing:border-box;display:flex;align-items:center;justify-content:center;min-width:48px;height:48px;padding:0 16px;border-radius:24px;background:var(--c);color:' + DARK + ';font-size:.9375rem;font-weight:600;line-height:1;white-space:nowrap;cursor:pointer;user-select:none;' +
        'transform:translate(-50%,-50%) translate(var(--x,0px),var(--y,0px)) scale(1);opacity:1;visibility:visible;' +
        'transition:transform .4s cubic-bezier(.34,1.4,.64,1) var(--d,0ms),opacity .25s ease var(--d,0ms),visibility 0s linear 0s,box-shadow .2s ease}' +
      'ui-arc-item[icon]{width:48px;padding:0;border-radius:50%}' +
      'ui-arc-item:hover{box-shadow:0 0 0 3px ' + SHELL + '}' +
      'ui-arc-item[disabled]{opacity:.4;cursor:not-allowed}' +
      'ui-arc-menu[collapsible]:not([open]) ui-arc-item{transform:translate(-50%,-50%) scale(0);opacity:0;visibility:hidden;pointer-events:none;transition-delay:0s,0s,.4s,0s}' +
      '.ui-arc-ico{display:block;font-size:1.25rem;line-height:1}' +
      '.ui-arc-txt{display:block}' +
      '.ui-arc-tunnel{position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483000;overflow:hidden;pointer-events:auto}';
    Object.keys(THEMES).forEach(function (k) {
      css += 'ui-arc-menu[theme="' + k + '"],ui-arc-item[data-theme="' + k + '"]{--c:' + THEMES[k] + '}';
    });
    var s = document.createElement('style');
    s.id = 'ui-arc-menu-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function renderItem(el) {
    var icon = el.getAttribute('icon');
    var label = el._arcLabel || '';
    var s = document.createElement('span');
    el.textContent = '';
    el.removeAttribute('title');
    if (icon) {
      s.className = 'ui-arc-ico';
      if (/^bi-/.test(icon)) {
        var i = document.createElement('i');
        i.className = 'bi ' + icon;
        s.appendChild(i);
      } else {
        s.textContent = icon;
      }
      if (label) el.setAttribute('title', label);
    } else {
      s.className = 'ui-arc-txt';
      s.textContent = label;
    }
    el.appendChild(s);
  }

  function setupItem(el) {
    if (el._arcReady) return;
    var label = el.textContent.trim();
    if (!label && !el.getAttribute('icon')) return;
    el._arcReady = true;
    el._arcLabel = label;
    renderItem(el);
  }

  function runTunnel(ox, oy, color, mode, dur) {
    var W = window.innerWidth, H = window.innerHeight;
    var maxD = Math.max(
      Math.hypot(ox, oy), Math.hypot(W - ox, oy),
      Math.hypot(ox, H - oy), Math.hypot(W - ox, H - oy)
    ) + 4;
    var ov = document.createElement('div');
    ov.className = 'ui-arc-tunnel';
    document.documentElement.appendChild(ov);
    var anims = [];
    var i;

    if (mode === 'lines') {
      var bg = document.createElement('div');
      bg.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;background:' + DARK;
      ov.appendChild(bg);
      anims.push(bg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur * 0.7, delay: dur * 0.3, easing: 'ease-in', fill: 'both' }));
    }

    if (mode === 'rings' || mode === 'both') {
      var n = 7;
      for (i = 0; i < n; i++) {
        var col = i === n - 1 ? DARK : (i % 2 === 0 ? color : ALT);
        var d = document.createElement('div');
        d.style.cssText = 'position:absolute;border-radius:50%;left:' + (ox - maxD) + 'px;top:' + (oy - maxD) + 'px;width:' + (maxD * 2) + 'px;height:' + (maxD * 2) + 'px;background:' + col;
        ov.appendChild(d);
        anims.push(d.animate(
          [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
          { duration: dur * 0.55, delay: i * dur * 0.45 / (n - 1), easing: 'ease-in', fill: 'both' }
        ));
      }
    }

    if (mode === 'lines' || mode === 'both') {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'position:absolute;width:0;height:0;left:' + ox + 'px;top:' + oy + 'px';
      ov.appendChild(wrap);
      var count = 60;
      for (i = 0; i < count; i++) {
        var a = i * (360 / count) + Math.random() * 5;
        var w = 1 + Math.random() * 3;
        var top = 16 + Math.random() * 70;
        var c = i % 3 === 0 ? color : SHELL;
        var l = document.createElement('div');
        l.style.cssText = 'position:absolute;left:' + (-w / 2) + 'px;top:' + top + 'px;width:' + w + 'px;height:' + (maxD - top) + 'px;transform-origin:50% ' + (-top) + 'px;background:' + c;
        wrap.appendChild(l);
        anims.push(l.animate(
          [
            { transform: 'rotate(' + a + 'deg) scaleY(0)', opacity: 0 },
            { transform: 'rotate(' + a + 'deg) scaleY(1)', opacity: 1 }
          ],
          { duration: dur * 0.6, delay: Math.random() * dur * 0.35, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'both' }
        ));
      }
    }

    return Promise.all(anims.map(function (x) { return x.finished; })).then(function () { return ov; });
  }

  class ArcItem extends HTMLElement {
    static get observedAttributes() { return ['icon']; }
    attributeChangedCallback(n, o, v) {
      if (this._arcReady && o !== v) renderItem(this);
    }
  }

  class ArcMenu extends HTMLElement {
    static get observedAttributes() { return ['position', 'radius', 'open']; }

    get position() {
      var v = this.getAttribute('position');
      return POS.indexOf(v) > -1 ? v : 'right';
    }
    get radius() { return Math.max(40, parseFloat(this.getAttribute('radius')) || 160); }

    expand() { this.setAttribute('open', ''); }
    collapse() { this.removeAttribute('open'); }
    toggle() { if (this.hasAttribute('open')) this.collapse(); else this.expand(); }

    connectedCallback() {
      injectStyle();
      if (!this._init) {
        if (this.hasAttribute('collapsed')) this.removeAttribute('collapsed');
        else if (!this.hasAttribute('open')) this.setAttribute('open', '');
        this._init = true;
        var hub = document.createElement('button');
        hub.type = 'button';
        hub.className = 'ui-arc-hub';
        this.insertBefore(hub, this.firstChild);
        this.addEventListener('click', this._onClick.bind(this));
        var self = this;
        this._mo = new MutationObserver(function () { self._queue(); });
        this._mo.observe(this, { childList: true, subtree: true, characterData: true });
        document.addEventListener('DOMContentLoaded', function () { self._layout(); });
      }
      this._queue();
    }

    attributeChangedCallback(name, o, v) {
      if (!this._init || o === v) return;
      if (name === 'open') {
        this.dispatchEvent(new CustomEvent('arc-toggle', { bubbles: true, detail: { open: v !== null } }));
      } else {
        this._layout();
      }
    }

    _items() {
      return Array.prototype.filter.call(this.children, function (c) {
        return c.tagName === 'UI-ARC-ITEM';
      });
    }

    _queue() {
      if (document.readyState === 'loading' || this._raf) return;
      var self = this;
      this._raf = requestAnimationFrame(function () { self._raf = 0; self._layout(); });
    }

    _layout() {
      var items = this._items();
      var n = items.length;
      var R = this.radius;
      var pos = this.position;
      var inward = { left: [1, 0], right: [-1, 0], top: [0, 1], bottom: [0, -1] }[pos];
      var perp = (pos === 'left' || pos === 'right') ? [0, 1] : [1, 0];
      var menuTheme = this.getAttribute('theme');
      items.forEach(function (it, k) {
        setupItem(it);
        var t = n === 1 ? 0 : -90 + 180 * k / (n - 1);
        var r = t * Math.PI / 180;
        var x = R * (Math.cos(r) * inward[0] + Math.sin(r) * perp[0]);
        var y = R * (Math.cos(r) * inward[1] + Math.sin(r) * perp[1]);
        it.style.setProperty('--x', x.toFixed(2) + 'px');
        it.style.setProperty('--y', y.toFixed(2) + 'px');
        it.style.setProperty('--d', (k * 40) + 'ms');
        var th = it.getAttribute('theme') || menuTheme;
        if (!THEMES[th]) th = CYCLE[k % CYCLE.length];
        it.setAttribute('data-theme', th);
      });
    }

    _onClick(e) {
      var hub = e.target.closest('.ui-arc-hub');
      if (hub && hub.parentNode === this) {
        if (this.hasAttribute('collapsible')) this.toggle();
        return;
      }
      var it = e.target.closest('ui-arc-item');
      if (it && it.parentNode === this) this._select(it);
    }

    _select(item) {
      if (this._busy || item.hasAttribute('disabled')) return;
      var self = this;
      var href = item.getAttribute('href');
      var detail = {
        item: item,
        href: href,
        label: item._arcLabel || '',
        index: this._items().indexOf(item)
      };
      if (!this.dispatchEvent(new CustomEvent('arc-select', { bubbles: true, cancelable: true, detail: detail }))) return;

      var rect = item.getBoundingClientRect();
      var ox = rect.left + rect.width / 2;
      var oy = rect.top + rect.height / 2;
      var color = THEMES[item.getAttribute('data-theme')] || THEMES.key;
      if (this.hasAttribute('collapsible')) this.collapse();
      if (!href) return;
      if (item.getAttribute('target') === '_blank') {
        window.open(href, '_blank', 'noopener');
        return;
      }

      var mode = this.getAttribute('tunnel');
      if (MODES.indexOf(mode) < 0) mode = 'rings';
      var dur = parseFloat(this.getAttribute('duration')) || 800;

      function go() {
        var ok = self.dispatchEvent(new CustomEvent('arc-navigate', { bubbles: true, cancelable: true, detail: detail }));
        if (!ok) return 'stay';
        if (href.charAt(0) === '#') { location.hash = href; return 'stay'; }
        location.href = href;
        return 'leave';
      }

      if (mode === 'none') { go(); return; }

      this._busy = true;
      runTunnel(ox, oy, color, mode, dur).then(function (ov) {
        if (go() === 'leave') {
          setTimeout(function () { if (ov.isConnected) self._reveal(ov); }, 3000);
        } else {
          self._reveal(ov);
        }
      });
    }

    _reveal(ov) {
      var self = this;
      ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease-out', fill: 'forwards' })
        .finished.then(function () { ov.remove(); self._busy = false; });
    }
  }

  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    document.querySelectorAll('.ui-arc-tunnel').forEach(function (n) { n.remove(); });
    document.querySelectorAll('ui-arc-menu').forEach(function (m) { m._busy = false; });
  });

  customElements.define('ui-arc-item', ArcItem);
  customElements.define('ui-arc-menu', ArcMenu);
})();
