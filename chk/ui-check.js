/*!
 * ui-check　閱讀檢核點按鈕
 * 用法：<ui-check>懂了嗎？</ui-check>
 *       <ui-check key="part2-tense" color="yellow" icon="bi-exclamation-triangle" size="sm">這裡的時態有把握嗎？</ui-check>
 *       <ui-check variant="gradient" color="blue" color2="violet" shape="pill">看懂了</ui-check>
 *
 * 屬性全部可省：
 *   key      紀錄用的識別字。由伺服器決定並寫進屬性，手動寫在內容裡也可以（限 a-z0-9_-，不得用 auto- 開頭）。
 *   color    品牌色名，預設 blue。寫錯就退回預設色，不會讓按鈕消失。
 *   color2   第二色，只在 gradient 與 gradient-outline 使用，預設 violet。
 *   variant  outline（預設）／solid／soft／ghost／link／gradient／gradient-outline。
 *   angle    漸層方向，例如 90deg、135deg，預設 135deg。
 *   shape    rounded（預設）／pill／square。
 *   size     xs（預設）／sm／md／lg。
 *   icon     Bootstrap Icons 的 class 名，例如 bi-question-circle。省略就不顯示圖示。
 *   state    伺服器加的，state="done" 代表這位學員已經點過，直接顯示已確認。
 *
 * 只接受 17 個品牌色名或色碼，舊色名（sky、safe、lavender 等）已移除。
 * 不用 shadow DOM，樣式與程式都在這一個檔案裡。
 * 點擊會 POST 到祖先元素的 data-cp-url；找不到設定時只在畫面上切換狀態（給 demo 檔用）。
 */
(function () {
  'use strict';

  /* ── 品牌色。與 inc/palette.php 的 brand_text_colors() 同步 ── */
  var COLORS = {
    base: '#0C0D0C',  /* 與 ui-insight 一致的頁面底色名稱 */
    shell:   '#C6C7BD',
    vanilla: '#DBEDD8',
    yellow:  '#E3D322',
    pink:    '#FF91D7',
    red:     '#EF6661',
    green:   '#71CD76',
    blue:    '#5DBAE8',
    indigo:  '#778CE1',
    violet:  '#B484E8',
    gray:    '#86877F',
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

  /* ── 舊色名：對應到最接近的新品牌色，讓既有內容不會退回預設色 ── */
  var ALIASES = {
  };

  var BASE          = '#0C0D0C';   /* 底層背景色 */
  var DEFAULT_COLOR = 'blue';
  var DEFAULT_COLOR2 = 'violet';
  var DONE_COLOR    = COLORS.green;   /* 已確認一律用這個色，與原本的 color 無關 */
  var SIZES         = { xs: 1, sm: 1, md: 1, lg: 1 };
  var VARIANTS      = { outline: 1, solid: 1, soft: 1, ghost: 1, link: 1, gradient: 1, 'gradient-outline': 1 };
  var SHAPES        = { rounded: 1, pill: 1, square: 1 };

  /* ── 樣式只注入一次。全部以 ui-check 為範圍、uck- 為前綴，不影響其他元件 ── */
  var STYLE_ID = 'ui-check-style';

  function css() {
    var s = [
      /* 沒有註冊成功時，標籤裡的文字就以普通文字呈現，不隱藏，不會整段消失 */
      'ui-check{display:inline-block;vertical-align:baseline;line-height:1.5}',
      'ui-check .uck-btn{display:inline-flex;align-items:center;gap:4px;line-height:1.5;',
        'color:var(--uck-c);background:transparent;border:1px solid var(--uck-c);border-radius:4px;',
        'font-family:inherit;font-weight:500;cursor:pointer;text-align:left;margin:0;',
        'transition:background-color .12s linear,color .12s linear,filter .12s linear}',
      'ui-check .uck-btn:focus-visible{outline:2px solid ' + COLORS.vanilla + ';outline-offset:1px}',
      'ui-check .uck-btn[disabled]{cursor:default;opacity:0.78}',

      /* 外形 */
      'ui-check .uck-pill{border-radius:999px}',
      'ui-check .uck-square{border-radius:0}',

      /* 尺寸：字體用 rem，padding 用 px */
      'ui-check .uck-xs{padding:1px;font-size:0.75rem}',
      /* 有底色的樣式在 xs 尺寸留一點左右內距，文字才不會貼邊 */
      'ui-check .uck-xs.uck-solid,ui-check .uck-xs.uck-soft,',
        'ui-check .uck-xs.uck-gradient,ui-check .uck-xs.uck-gradient-outline{padding:1px 6px}',
      'ui-check .uck-sm{padding:3px 10px;font-size:0.8125rem}',
      'ui-check .uck-md{padding:6px 14px;font-size:0.875rem}',
      'ui-check .uck-lg{padding:10px 20px;font-size:1rem}',

      /* outline：外框，滑過時變成 solid（品牌色實心底、依亮度選文字色） */
      'ui-check .uck-outline:hover:not([disabled]){background:var(--uck-c);color:var(--uck-on)}',

      /* solid：實心，文字依底色亮度自動選擇 */
      'ui-check .uck-solid{background:var(--uck-c);color:var(--uck-on)}',
      'ui-check .uck-solid:hover:not([disabled]){filter:brightness(1.1)}',

      /* soft：品牌色與底色混成的不透明淺底 */
      'ui-check .uck-soft{background:color-mix(in srgb, var(--uck-c) 22%, ' + BASE + ');',
        'border-color:color-mix(in srgb, var(--uck-c) 45%, ' + BASE + ')}',
      'ui-check .uck-soft:hover:not([disabled]){background:color-mix(in srgb, var(--uck-c) 32%, ' + BASE + ')}',

      /* ghost：沒有邊框，滑過才出現底色 */
      'ui-check .uck-ghost{border-color:transparent}',
      'ui-check .uck-ghost:hover:not([disabled]){background:#1B1C1B;border-color:#2A2B29}',

      /* link：只有文字與底線 */
      'ui-check .uck-link{border-color:transparent;padding-left:0;padding-right:0;',
        'text-decoration:underline;text-underline-offset:3px}',
      'ui-check .uck-link:hover:not([disabled]){text-decoration-thickness:2px}',

      /* gradient：雙色漸層底，文字依兩色平均亮度自動選擇 */
      'ui-check .uck-gradient{border-color:transparent;color:var(--uck-on);',
        'background:linear-gradient(var(--uck-angle), var(--uck-c), var(--uck-c2))}',
      'ui-check .uck-gradient:hover:not([disabled]){filter:brightness(1.1)}',

      /* gradient-outline：漸層外框、深色底 */
      'ui-check .uck-gradient-outline{border:1px solid transparent;color:var(--uck-c);',
        'background:linear-gradient(' + BASE + ',' + BASE + ') padding-box,',
        'linear-gradient(var(--uck-angle), var(--uck-c), var(--uck-c2)) border-box}',
      'ui-check .uck-gradient-outline:hover:not([disabled]){',
        'background:linear-gradient(#1B1C1B,#1B1C1B) padding-box,',
        'linear-gradient(var(--uck-angle), var(--uck-c), var(--uck-c2)) border-box}',

      /* 已確認：去掉邊框，只留勾與文字 */
      'ui-check .uck-done{display:inline-flex;align-items:center;gap:4px;line-height:1.5;',
        'color:' + DONE_COLOR + ';border:1px solid transparent;background:transparent}',
      'ui-check .uck-busy{opacity:0.78}',
      'ui-check .uck-err{display:block;margin:8px 0 0}'
    ];
    return s.join('');
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = css();
    (document.head || document.documentElement).appendChild(el);
  }

  /* ── 小工具 ── */
  function colorKey(name, fallback) {
    name = String(name || '').trim().toLowerCase();
    if (COLORS[name]) return name;
    if (ALIASES[name]) return ALIASES[name];
    return fallback;
  }

  function colorOf(name, fallback) {
    return COLORS[colorKey(name, fallback || DEFAULT_COLOR)];
  }

  function pick(name, table, fallback) {
    name = String(name || '').trim().toLowerCase();
    return table[name] ? name : fallback;
  }

  function sizeOf(name) { return pick(name, SIZES, 'xs'); }
  function variantOf(name) { return pick(name, VARIANTS, 'outline'); }
  function shapeOf(name) { return pick(name, SHAPES, 'rounded'); }

  /** 漸層角度：接受 0deg 到 360deg 或 to right 這類方向字，其餘退回 135deg。 */
  function angleOf(v) {
    v = String(v || '').trim().toLowerCase();
    if (/^-?\d{1,3}(\.\d+)?deg$/.test(v)) return v;
    if (/^to (top|bottom|left|right)( (top|bottom|left|right))?$/.test(v)) return v;
    return '135deg';
  }

  /** 相對亮度，用來決定實心底上的文字色。 */
  function luminance(hex) {
    var h = hex.replace('#', '');
    var rgb = [0, 2, 4].map(function (i) {
      var c = parseInt(h.substr(i, 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  /** 和深色字、淺色字分別比對比，選對比較高的一個。 */
  function textOn(hexes) {
    var L = hexes.reduce(function (s, h) { return s + luminance(h); }, 0) / hexes.length;
    var dark = (L + 0.05) / (luminance(BASE) + 0.05);
    var light = (luminance(COLORS.vanilla) + 0.05) / (L + 0.05);
    return dark >= light ? BASE : COLORS.vanilla;
  }

  /** 只收 Bootstrap Icons 的 class 名，格式與伺服器端的 checkpoint_icon_ok() 一致。 */
  function iconOf(name) {
    name = String(name || '').trim().toLowerCase();
    return (name && name.length <= 40 && /^[a-z0-9-]+$/.test(name)) ? name : '';
  }

  /** 往上找設定。回傳 null 代表沒有伺服器可送（demo 檔就是這種情況）。 */
  function configOf(el) {
    var host = el.closest('[data-cp-url]');
    if (!host) return null;
    return {
      el:   host,
      url:  host.getAttribute('data-cp-url') || '',
      done: host.getAttribute('data-cp-done-text')
    };
  }

  function doneTextOf(cfg) {
    if (cfg && cfg.done !== null && cfg.done !== undefined) return cfg.done;
    return '已確認';
  }

  /* ── 元件 ── */
  class UiCheck extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      injectStyle();

      // 標籤文字只讀一次，之後重畫都用這一份
      this._label = (this.textContent || '').replace(/\s+/g, ' ').trim();
      this._cfg   = configOf(this);
      this.render();
    }

    static get observedAttributes() {
      return ['state', 'color', 'color2', 'variant', 'angle', 'shape', 'size', 'icon'];
    }

    attributeChangedCallback(name, old, now) {
      if (this._ready && old !== now) this.render();
    }

    get key() { return (this.getAttribute('key') || '').trim(); }

    get isDone() {
      return (this.getAttribute('state') || '').toLowerCase() === 'done';
    }

    render() {
      this.clearError();
      this.textContent = '';
      this._btn = null;
      this.isDone ? this.renderDone() : this.renderButton();
    }

    renderDone() {
      var span = document.createElement('span');
      span.className = 'uck-done uck-' + sizeOf(this.getAttribute('size'));
      var i = document.createElement('i');
      i.className = 'bi bi-check2-circle';
      span.appendChild(i);
      var txt = doneTextOf(this._cfg);
      if (txt) {
        span.appendChild(document.createTextNode(txt));
      }
      span.title = this._label;
      this.appendChild(span);
    }

    renderButton() {
      var variant = variantOf(this.getAttribute('variant'));
      var c1 = colorOf(this.getAttribute('color'), DEFAULT_COLOR);
      var c2 = colorOf(this.getAttribute('color2'), DEFAULT_COLOR2);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'uck-btn uck-' + variant +
        ' uck-' + sizeOf(this.getAttribute('size')) +
        ' uck-' + shapeOf(this.getAttribute('shape'));
      btn.style.setProperty('--uck-c', c1);
      btn.style.setProperty('--uck-c2', c2);
      btn.style.setProperty('--uck-angle', angleOf(this.getAttribute('angle')));
      btn.style.setProperty('--uck-on', textOn(variant === 'gradient' ? [c1, c2] : [c1]));

      var ic = iconOf(this.getAttribute('icon'));
      if (ic) {
        var i = document.createElement('i');
        i.className = 'bi ' + ic;
        btn.appendChild(i);
      }
      if (this._label) {
        btn.appendChild(document.createTextNode(this._label));
      }
      btn.addEventListener('click', this.onClick.bind(this));
      this._btn = btn;
      this.appendChild(btn);
    }

    /** 錯誤用 Bootstrap alert 呈現，不用 alert()。 */
    showError(msg) {
      this.clearError();
      var box = document.createElement('div');
      box.className = 'alert alert-warning uck-err';
      box.setAttribute('role', 'alert');
      box.textContent = msg;
      this.appendChild(box);
      this._err = box;
      var self = this;
      this._errTimer = setTimeout(function () { self.clearError(); }, 6000);
    }

    clearError() {
      if (this._errTimer) { clearTimeout(this._errTimer); this._errTimer = null; }
      if (this._err && this._err.parentNode) { this._err.parentNode.removeChild(this._err); }
      this._err = null;
    }

    onClick() {
      if (this._busy || this.isDone) return;
      this.clearError();

      // 沒有伺服器設定：只在畫面上切換，demo 檔靠這條路運作
      if (!this._cfg || !this._cfg.url) {
        this.setAttribute('state', 'done');
        this.dispatchEvent(new CustomEvent('ui-check-done', {
          bubbles: true, detail: { key: this.key, local: true }
        }));
        return;
      }
      if (!this.key) {
        this.showError('這顆按鈕沒有識別字，無法記錄。請通知老師。');
        return;
      }
      this.send();
    }

    send() {
      var self = this;
      var host = this._cfg.el;
      var tok  = host.getAttribute('data-cp-token') || '';

      this._busy = true;
      if (this._btn) { this._btn.disabled = true; this._btn.classList.add('uck-busy'); }

      var body = new FormData();
      body.append('_csrf', tok);
      body.append('key', this.key);

      fetch(this._cfg.url, {
        method: 'POST',
        body: body,
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' }
      }).then(function (r) {
        return r.json().catch(function () { return { ok: false, error: '伺服器回應無法解讀。' }; });
      }).then(function (d) {
        // 憑證是一次性的，伺服器每次都會給一個新的，換掉手上這個下一顆才能點
        if (d && d.token) { host.setAttribute('data-cp-token', d.token); }
        self._busy = false;
        if (d && d.ok) {
          self.setAttribute('state', 'done');
          self.dispatchEvent(new CustomEvent('ui-check-done', {
            bubbles: true, detail: { key: self.key, local: false }
          }));
          return;
        }
        self.restore();
        self.showError((d && d.error) ? d.error : '沒有記錄成功，請重新整理後再試。');
      }).catch(function () {
        self.restore();
        self.showError('連線失敗，沒有記錄成功。請檢查網路後再試一次。');
      });
    }

    restore() {
      this._busy = false;
      if (this._btn) { this._btn.disabled = false; this._btn.classList.remove('uck-busy'); }
    }
  }

  /* 供範例頁或其他程式讀取色票 */
  UiCheck.colors = COLORS;
  UiCheck.aliases = ALIASES;

  if (!window.customElements || customElements.get('ui-check')) return;
  customElements.define('ui-check', UiCheck);
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
