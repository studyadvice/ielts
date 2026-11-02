(function () {
  'use strict';

  var PALETTE = {
    bg: '#0C0D0C', shell: '#C6C7BD', lavender: '#C3A5E5', sky: '#82C8E5',
    warning: '#E6374B', salmon: '#E5C3B3', ocean: '#1CCAE8', safe: '#27AE60',
    teal: '#0DA591', vanilla: '#DBEDD8', yellow: '#E3D322', focus: '#D4FFFC',
    special: '#B3DE73', info: '#4171BF', indigo: '#7849C9', pink: '#FF91D7',
    orange: '#EDA109'
  };

  var TYPES = ['text', 'number', 'select', 'date', 'date-roc', 'bool', 'rating', 'readonly', 'secret'];
  var TYPE_ALIAS = { dropdown: 'select', boolean: 'bool', 'rating-selector': 'rating', view: 'readonly', hidden: 'secret' };
  var RATING_ICONS = {
    star: ['bi-star', 'bi-star-fill'],
    circle: ['bi-circle', 'bi-circle-fill'],
    square: ['bi-square', 'bi-square-fill'],
    heart: ['bi-heart', 'bi-heart-fill']
  };
  var RATING_COLORS = { star: PALETTE.orange, circle: PALETTE.yellow, square: PALETTE.safe, heart: PALETTE.pink };
  var HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  var ICON_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  var MASK = '••••••';
  var ALERT_MS = 2800;

  function warn(msg) {
    if (window.console && console.warn) console.warn('[ui-progrid] ' + msg);
  }

  function esc(s) {
    return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function attr(el, name, def) {
    var v = el.getAttribute(name);
    return v === null ? def : v;
  }

  /* 有屬性即為真，但寫 "false"、"0"、"no"、"off" 視為假 */
  function boolAttr(el, name) {
    if (!el.hasAttribute(name)) return false;
    var v = String(el.getAttribute(name) || '').trim().toLowerCase();
    return v !== 'false' && v !== '0' && v !== 'no' && v !== 'off';
  }

  function numAttr(el, name) {
    var v = el.getAttribute(name);
    if (v === null || String(v).trim() === '') return undefined;
    var n = Number(v);
    return isNaN(n) ? undefined : n;
  }

  function resolveColor(v, fallback) {
    var t = String(v || '').trim();
    if (!t) return fallback;
    if (PALETTE[t]) return PALETTE[t];
    if (HEX_RE.test(t)) return t.toUpperCase();
    warn('無法辨識的顏色「' + t + '」，已改用預設色');
    return fallback;
  }

  function normalizeIcon(raw) {
    var s = String(raw || '').trim().toLowerCase().replace(/^bi\s+/, '').replace(/^bi-/, '');
    if (!s) return '';
    if (!ICON_RE.test(s)) {
      warn('icon 名稱格式不符：' + raw);
      return '';
    }
    return s;
  }

  function toBool(v) {
    if (v === true) return true;
    if (v === false || v === null || v === undefined) return false;
    return /^(true|1|yes|on|是)$/i.test(String(v).trim());
  }

  function clone(v) {
    return Array.isArray(v) ? v.slice() : v;
  }

  function same(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every(function (x, i) { return x === b[i]; });
    }
    return a === b;
  }

  /* ---------- 日期 ---------- */
  function parseDate(str, roc) {
    if (!str) return null;
    var parts = String(str).trim().split(/[\/\-\.]/);
    if (parts.length !== 3) return null;
    var y = parseInt(parts[0], 10), m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    if (roc) y += 1911;
    var dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
  }

  function injectStyles() {
    if (document.getElementById('ui-progrid-styles')) return;
    var chev = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E"
      + "%3Cpath fill='none' stroke='%239FA096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' "
      + "d='M3.5 6l4.5 4.5L12.5 6'/%3E%3C/svg%3E\")";
    var css = ''
      /* 資料用的子標籤一律不顯示 */
      + 'pg-cat,pg-row,pg-opt,pg-desc,pg-more,pg-note{display:none;}'

      + 'ui-progrid{display:flex;flex-direction:column;position:relative;'
      + 'background:#141513;border:1px solid #2A2B27;border-radius:8px;overflow:hidden;'
      + 'color:#C6C7BD;font-size:var(--pgx-fs);line-height:1.3;'
      + '--pgx-accent:#1CCAE8;--pgx-cols:40% 60%;'
      + '--pgx-row:30px;--pgx-ctl:24px;--pgx-px:10px;--pgx-gap:6px;'
      + '--pgx-fs:0.9rem;--pgx-fs-sm:0.8rem;--pgx-fs-lg:1rem;--pgx-ic:0.95rem;'
      + '--pgx-sw-w:28px;--pgx-sw-h:16px;--pgx-knob:12px;}'
      + 'ui-progrid[density="compact"]{--pgx-row:24px;--pgx-ctl:20px;--pgx-px:8px;--pgx-gap:5px;'
      + '--pgx-fs:0.8rem;--pgx-fs-sm:0.72rem;--pgx-fs-lg:0.88rem;--pgx-ic:0.8rem;'
      + '--pgx-sw-w:24px;--pgx-sw-h:13px;--pgx-knob:9px;border-radius:6px;}'
      + 'ui-progrid[density="loose"]{--pgx-row:42px;--pgx-ctl:34px;--pgx-px:14px;--pgx-gap:8px;'
      + '--pgx-fs:1rem;--pgx-fs-sm:0.88rem;--pgx-fs-lg:1.12rem;--pgx-ic:1.05rem;'
      + '--pgx-sw-w:34px;--pgx-sw-h:19px;--pgx-knob:15px;border-radius:10px;}'
      + 'ui-progrid *,ui-progrid *::before,ui-progrid *::after{box-sizing:border-box;}'

      /* ---- 標題列 ---- */
      + '.pgx-head{display:flex;align-items:center;gap:var(--pgx-gap);flex:none;'
      + 'height:calc(var(--pgx-row) + 8px);padding:0 var(--pgx-px) 0 calc(var(--pgx-px) + 2px);'
      + 'background:#111210;border-bottom:1px solid #262723;}'
      + '.pgx-title{color:#D4FFFC;font-size:var(--pgx-fs-lg);font-weight:600;white-space:nowrap;'
      + 'overflow:hidden;text-overflow:ellipsis;}'
      + '.pgx-tools{margin-left:auto;display:flex;align-items:center;gap:2px;}'
      + '.pgx-tool{width:var(--pgx-ctl);height:var(--pgx-ctl);display:inline-flex;align-items:center;'
      + 'justify-content:center;padding:0;border:none;border-radius:4px;background:transparent;'
      + 'color:#8E8F87;font-size:var(--pgx-ic);cursor:pointer;line-height:1;}'
      + '.pgx-tool:hover{background:#1F201D;color:var(--pgx-accent);}'

      /* ---- 捲動區 ---- */
      + '.pgx-body{flex:1 1 auto;overflow-y:auto;overflow-x:hidden;'
      + 'scrollbar-width:thin;scrollbar-color:#35362F #121311;}'
      + '.pgx-body::-webkit-scrollbar{width:8px;}'
      + '.pgx-body::-webkit-scrollbar-track{background:#121311;}'
      + '.pgx-body::-webkit-scrollbar-thumb{background:#35362F;border-radius:4px;}'

      /* ---- 分類列 ---- */
      + '.pgx-cat{display:flex;align-items:center;gap:var(--pgx-gap);height:var(--pgx-row);'
      + 'padding:0 var(--pgx-px);background:#181917;border-bottom:1px solid #22231F;'
      + 'color:var(--pgx-cat,#C3A5E5);font-size:var(--pgx-fs-sm);font-weight:600;letter-spacing:0.06em;'
      + 'cursor:pointer;user-select:none;outline:none;}'
      + '.pgx-cat:hover{background:#1C1D1A;}'
      + '.pgx-cat:focus-visible{box-shadow:inset 0 0 0 1px var(--pgx-accent);}'
      + '.pgx-chev{font-size:var(--pgx-fs-sm);transition:transform .15s ease;line-height:1;}'
      + '.pgx-cat.pgx-collapsed .pgx-chev{transform:rotate(-90deg);}'
      + '.pgx-cname{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.pgx-count{margin-left:auto;color:#7E7F77;font-weight:400;letter-spacing:0;'
      + 'font-variant-numeric:tabular-nums;}'
      + '.pgx-group.pgx-collapsed{display:none;}'

      + '.pgx-row{display:grid;grid-template-columns:var(--pgx-cols);min-height:var(--pgx-row);'
      + 'position:relative;border-bottom:1px solid #20211E;}'
      + '.pgx-row::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:transparent;}'
      + '.pgx-row:hover{background:#171816;}'
      + '.pgx-row.pgx-sel{background:#1A1B18;}'
      + '.pgx-row.pgx-sel::before{background:var(--pgx-accent);}'
      + '.pgx-row.pgx-invalid::before{background:#E6374B;}'
      + '.pgx-label{display:flex;align-items:center;gap:var(--pgx-gap);min-width:0;'
      + 'padding:0 var(--pgx-px) 0 calc(var(--pgx-px) + 4px);color:#A2A399;'
      + 'border-right:1px solid #20211E;white-space:nowrap;overflow:hidden;}'
      + '.pgx-ltext{overflow:hidden;text-overflow:ellipsis;}'
      + '.pgx-row.pgx-wrap .pgx-label{white-space:normal;padding-top:4px;padding-bottom:4px;}'
      + '.pgx-row.pgx-wrap .pgx-ltext{overflow:visible;}'
      + '.pgx-num{flex:none;font-weight:600;font-variant-numeric:tabular-nums;color:#82C8E5;}'
      + '.pgx-lic{flex:none;font-size:var(--pgx-ic);line-height:1;color:#8E8F87;}'
      + '.pgx-row.pgx-sel .pgx-label{color:#C6C7BD;}'
      + '.pgx-row.pgx-sel .pgx-lic{color:var(--pgx-accent);}'
      + '.pgx-req{flex:none;color:#E6374B;font-weight:600;}'
      + '.pgx-value{display:flex;align-items:center;gap:var(--pgx-gap);min-width:0;padding:0 var(--pgx-px);}'

      + '.pgx-in{flex:1 1 auto;min-width:0;width:100%;height:var(--pgx-ctl);margin:0;'
      + 'padding:0 6px;font:inherit;font-size:var(--pgx-fs);line-height:1;color:#C6C7BD;'
      + 'background:transparent;border:1px solid transparent;border-radius:4px;'
      + 'transition:border-color .12s ease,background-color .12s ease;}'
      + '.pgx-in::placeholder{color:#5C5D57;}'
      + '.pgx-in:focus{outline:none;border-color:var(--pgx-accent);background-color:#0E0F0D;}'
      + 'ui-progrid:not([field-style="boxed"]) .pgx-row:hover .pgx-in{border-color:#34352F;}'
      + 'ui-progrid:not([field-style="boxed"]) .pgx-row:hover .pgx-in:focus{border-color:var(--pgx-accent);}'
      + 'ui-progrid[field-style="boxed"] .pgx-in{background-color:#0E0F0D;border-color:#2F302B;}'
      + 'ui-progrid[field-style="boxed"] .pgx-in:hover{border-color:#3E3F39;}'
      + 'ui-progrid[field-style="boxed"] .pgx-in:focus{border-color:var(--pgx-accent);}'
      + '.pgx-row.pgx-invalid .pgx-in{border-color:#E6374B;}'
      + '.pgx-in[type=number]{flex:0 1 auto;width:7.5em;font-variant-numeric:tabular-nums;-moz-appearance:textfield;appearance:textfield;}'
      + '.pgx-in[type=number]::-webkit-outer-spin-button,.pgx-in[type=number]::-webkit-inner-spin-button'
      + '{-webkit-appearance:none;margin:0;}'
      + 'select.pgx-in{-webkit-appearance:none;appearance:none;cursor:pointer;padding-right:22px;'
      + 'background-image:' + chev + ';background-repeat:no-repeat;'
      + 'background-position:right 6px center;background-size:10px 10px;}'
      + 'select.pgx-in option{background:#141513;color:#C6C7BD;}'
      + '.pgx-text{flex:1 1 auto;min-width:0;padding:0 7px;white-space:nowrap;overflow:hidden;'
      + 'text-overflow:ellipsis;}'
      + '.pgx-row.pgx-wrap .pgx-text{white-space:normal;}'
      + '.pgx-text.pgx-num-v{flex:0 1 auto;font-variant-numeric:tabular-nums;}'
      + '.pgx-masked{color:#6E6F68;letter-spacing:0.12em;}'
      + '.pgx-unit{flex:none;color:#7E7F77;font-size:var(--pgx-fs-sm);}'

      + '.pgx-sw{flex:none;position:relative;width:var(--pgx-sw-w);height:var(--pgx-sw-h);'
      + 'margin:0 0 0 6px;padding:0;border:none;border-radius:999px;background:#2A2B27;cursor:pointer;'
      + 'transition:background-color .15s ease;}'
      + '.pgx-sw::after{content:"";position:absolute;top:calc((var(--pgx-sw-h) - var(--pgx-knob)) / 2);'
      + 'left:2px;width:var(--pgx-knob);height:var(--pgx-knob);border-radius:50%;background:#8E8F87;'
      + 'transition:left .15s ease,background-color .15s ease;}'
      + '.pgx-sw.pgx-on{background:#0DA591;}'
      + '.pgx-sw.pgx-on::after{left:calc(var(--pgx-sw-w) - var(--pgx-knob) - 2px);background:#D4FFFC;}'
      + '.pgx-sw:focus-visible{outline:1px solid var(--pgx-accent);outline-offset:2px;}'
      + '.pgx-sw:disabled{cursor:default;background:#22231F;}'
      + '.pgx-sw.pgx-on:disabled{background:#0B6E61;}'
      + '.pgx-swtxt{color:#A2A399;font-size:var(--pgx-fs-sm);}'

      + '.pgx-rate{display:inline-flex;align-items:center;gap:2px;margin-left:4px;}'
      + '.pgx-rt{display:inline-flex;align-items:center;justify-content:center;padding:0 1px;'
      + 'border:none;background:transparent;color:var(--pgx-rc);font-size:var(--pgx-ic);line-height:1;'
      + 'cursor:pointer;height:var(--pgx-ctl);transition:transform .1s ease;}'
      + '.pgx-rt:hover:not(:disabled){transform:scale(1.18);}'
      + '.pgx-rt:disabled{cursor:default;}'
      + '.pgx-rt:not(.pgx-on){color:#4E4F49;}'
      + '.pgx-rt:not(.pgx-on):hover:not(:disabled){color:var(--pgx-rc);}'
      + '.pgx-rt:focus-visible{outline:1px solid var(--pgx-accent);border-radius:3px;}'

      + '.pgx-mini{flex:none;display:inline-flex;align-items:center;justify-content:center;'
      + 'width:var(--pgx-ctl);height:var(--pgx-ctl);padding:0;border:none;border-radius:4px;'
      + 'background:transparent;color:#4E4F49;font-size:var(--pgx-ic);line-height:1;cursor:pointer;}'
      + '.pgx-row:hover .pgx-mini,.pgx-row.pgx-sel .pgx-mini{color:#A2A399;}'
      + '.pgx-mini:hover{background:#22231F;color:var(--pgx-accent) !important;}'
      + '.pgx-eye.pgx-on{color:var(--pgx-accent);}'
      + '.pgx-err-ic{display:none;flex:none;color:#E6374B;font-size:var(--pgx-ic);line-height:1;}'
      + '.pgx-row.pgx-invalid .pgx-err-ic{display:inline-block;}'

      + '.pgx-note{display:flex;gap:8px;padding:5px var(--pgx-px) 6px calc(var(--pgx-px) + 14px);'
      + 'background:#121311;border-bottom:1px solid #20211E;color:#A2A399;'
      + 'font-size:var(--pgx-fs-sm);line-height:1.55;}'
      + '.pgx-note > i{color:#C3A5E5;flex:none;line-height:1.55;}'
      + 'ui-progrid[density="compact"] .pgx-note{padding:4px var(--pgx-px) 5px calc(var(--pgx-px) + 12px);line-height:1.45;}'
      + 'ui-progrid[density="loose"] .pgx-note{padding:8px var(--pgx-px) 10px calc(var(--pgx-px) + 18px);line-height:1.65;}'

      + '.pgx-desc{flex:none;padding:8px 12px 9px;background:#111210;border-top:1px solid #262723;'
      + 'font-size:var(--pgx-fs-sm);line-height:1.6;max-height:140px;overflow-y:auto;'
      + 'scrollbar-width:thin;scrollbar-color:#35362F #111210;}'
      + 'ui-progrid[density="compact"] .pgx-desc{padding:6px 10px 7px;line-height:1.5;max-height:110px;}'
      + 'ui-progrid[density="loose"] .pgx-desc{padding:12px 16px 13px;line-height:1.7;max-height:180px;}'
      + '.pgx-desc-title{color:#82C8E5;font-weight:600;margin-right:8px;}'
      + '.pgx-desc-body{color:#C6C7BD;}'
      + '.pgx-desc-body p{margin:0 0 4px;}'
      + '.pgx-desc-err{display:inline-flex;align-items:center;gap:5px;color:#E6374B;font-weight:600;margin-right:10px;}'
      + '.pgx-muted{color:#7E7F77;}'

      + '.pgx-modal{position:fixed;inset:0;z-index:1090;display:none;align-items:center;'
      + 'justify-content:center;padding:20px;background:rgba(8,9,8,0.86);}'
      + '.pgx-modal.pgx-open{display:flex;}'
      + '.pgx-mbox{width:100%;max-width:720px;max-height:80vh;display:flex;flex-direction:column;'
      + 'background:#151614;border:1px solid #2E2F2A;border-radius:10px;'
      + 'box-shadow:0 18px 50px rgba(0,0,0,0.86);color:#C6C7BD;}'
      + '.pgx-mhead{display:flex;align-items:center;gap:10px;padding:12px 14px 12px 18px;'
      + 'border-bottom:1px solid #262723;}'
      + '.pgx-mtitle{color:#D4FFFC;font-size:1rem;font-weight:600;}'
      + '.pgx-mclose{margin-left:auto;width:30px;height:30px;padding:0;border:none;border-radius:6px;'
      + 'background:transparent;color:#9FA096;font-size:1.1rem;cursor:pointer;line-height:1;}'
      + '.pgx-mclose:hover{background:#2A1A1D;color:#E6374B;}'
      + '.pgx-mbody{padding:16px 18px 18px;overflow-y:auto;font-size:0.95rem;line-height:1.75;}'

      + '.pgx-alerts{position:fixed;top:20px;right:20px;z-index:1095;width:360px;'
      + 'display:flex;flex-direction:column;gap:8px;pointer-events:none;}'
      + '.pgx-alerts .alert.pgx-alert{pointer-events:auto;position:relative;margin:0;'
      + 'padding:10px 40px 10px 14px;border-radius:8px;background:#171816;color:#C6C7BD;'
      + 'border:1px solid #2E2F2A;border-left:4px solid var(--pgx-a,#1CCAE8);font-size:0.88rem;'
      + 'line-height:1.5;box-shadow:0 8px 24px rgba(0,0,0,0.82);transition:opacity .15s linear;}'
      + '.pgx-alerts .alert.pgx-alert:not(.show){opacity:0;}'
      + '.pgx-alert > i.bi{margin-right:6px;color:var(--pgx-a,#1CCAE8);}'
      + '.pgx-alert-x{position:absolute;top:6px;right:8px;width:24px;height:24px;padding:0;'
      + 'border:none;background:transparent;color:#9FA096;font-size:1rem;line-height:1;cursor:pointer;}'
      + '.pgx-alert-x:hover{color:#D4FFFC;}';
    var style = document.createElement('style');
    style.id = 'ui-progrid-styles';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  var ALERT_KINDS = {
    success: [PALETTE.safe, 'bi-check-circle-fill'],
    warning: [PALETTE.warning, 'bi-exclamation-triangle-fill'],
    info: [PALETTE.ocean, 'bi-info-circle-fill']
  };

  function notify(msg, kind) {
    var k = ALERT_KINDS[kind] ? kind : 'info';
    var zone = document.querySelector('.pgx-alerts');
    if (!zone) {
      zone = document.createElement('div');
      zone.className = 'pgx-alerts';
      document.body.appendChild(zone);
    }
    var box = document.createElement('div');
    box.className = 'alert alert-' + (k === 'warning' ? 'warning' : k) + ' alert-dismissible fade show pgx-alert';
    box.setAttribute('role', 'alert');
    box.style.setProperty('--pgx-a', ALERT_KINDS[k][0]);
    box.innerHTML = '<i class="bi ' + ALERT_KINDS[k][1] + '"></i>' + esc(msg)
      + '<button type="button" class="pgx-alert-x" aria-label="關閉"><i class="bi bi-x-lg"></i></button>';
    var close = function () {
      if (!box.isConnected) return;
      box.classList.remove('show');
      setTimeout(function () { box.remove(); }, 160);
    };
    box.querySelector('.pgx-alert-x').addEventListener('click', close);
    zone.appendChild(box);
    while (zone.children.length > 4) zone.firstElementChild.remove();
    setTimeout(close, ALERT_MS);
    return box;
  }

  /* ---------- 全頁共用：詳情視窗 ---------- */
  var modal = null;
  function getModal() {
    if (modal) return modal;
    var el = document.createElement('div');
    el.className = 'pgx-modal';
    el.innerHTML = '<div class="pgx-mbox" role="dialog">'
      + '<div class="pgx-mhead"><span class="pgx-mtitle"></span>'
      + '<button type="button" class="pgx-mclose" aria-label="關閉"><i class="bi bi-x-lg"></i></button></div>'
      + '<div class="pgx-mbody"></div></div>';
    document.body.appendChild(el);
    var api = {
      open: function (title, html) {
        el.querySelector('.pgx-mtitle').textContent = title;
        el.querySelector('.pgx-mbody').innerHTML = html;
        el.classList.add('pgx-open');
      },
      close: function () { el.classList.remove('pgx-open'); },
      isOpen: function () { return el.classList.contains('pgx-open'); }
    };
    el.addEventListener('click', function (e) { if (e.target === el) api.close(); });
    el.querySelector('.pgx-mclose').addEventListener('click', api.close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && api.isOpen()) { e.preventDefault(); api.close(); }
    });
    modal = api;
    return api;
  }

    static get observedAttributes() {
      return ['heading', 'density', 'field-style', 'accent', 'label-ratio', 'max-height',
        'readonly', 'no-desc', 'show-actions'];
    }

    connectedCallback() {
      if (this._built) return;
      /* 等文件解析完，子標籤才會到齊 */
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._init(), { once: true });
        return;
      }
      this._init();
    }

    attributeChangedCallback(name) {
      if (!this._built) return;
      if (name === 'accent' || name === 'label-ratio' || name === 'max-height') {
        this._applyVars();
        return;
      }
      if (name === 'density' || name === 'field-style') return; /* 純 CSS 切換 */
      this._render();
    }

    _init() {
      if (this._built) return;
      this._built = true;
      this._selKey = null;
      this._parse();
      this._bind();
      this._render();
    }

    /* ---------- 解析子標籤 ---------- */
    _parse() {
      this._cats = [];
      this._byKey = {};
      this._autoKey = 0;
      var loose = null;
      Array.prototype.forEach.call(this.children, (el) => {
        if (el.tagName === 'PG-CAT') {
          loose = null;
          var rows = Array.prototype.filter.call(el.children, function (c) { return c.tagName === 'PG-ROW'; });
          this._cats.push(this._parseCat(el, rows));
        } else if (el.tagName === 'PG-ROW') {
          if (!loose) {
            loose = this._parseCat(null, []);
            this._cats.push(loose);
          }
          loose.rows.push(this._parseRow(el));
        }
      });
      if (!this._cats.length) warn('<ui-progrid> 裡沒有任何 <pg-cat> 或 <pg-row>');
    }

    _parseCat(el, rowEls) {
      var cat = {
        anon: !el,
        name: el ? attr(el, 'name', '') : '',
        collapsed: el ? boolAttr(el, 'collapsed') : false,
        color: el ? resolveColor(attr(el, 'color', ''), '') : '',
        numbering: null,
        rows: []
      };
      if (el && boolAttr(el, 'numbering')) {
        cat.numbering = {
          start: numAttr(el, 'number-start') !== undefined ? numAttr(el, 'number-start') : 1,
          prefix: attr(el, 'number-prefix', ''),
          suffix: attr(el, 'number-suffix', '.'),
          color: resolveColor(attr(el, 'number-color', ''), PALETTE.sky)
        };
      }
      rowEls.forEach((r) => { cat.rows.push(this._parseRow(r)); });
      return cat;
    }

    _parseRow(el) {
      var type = String(attr(el, 'type', 'text')).trim().toLowerCase();
      type = TYPE_ALIAS[type] || type;
      if (TYPES.indexOf(type) === -1) {
        warn('不支援的 type「' + type + '」，已改用 text');
        type = 'text';
      }
      var key = String(attr(el, 'key', '')).trim();
      if (!key) {
        key = 'row' + (++this._autoKey);
        warn('有一列沒有 key，已自動命名為 ' + key);
      }
      if (this._byKey[key]) warn('key 重複：' + key + '，取值與設值只會對應到最後一列');

      var kids = Array.prototype.slice.call(el.children);
      var pick = function (tag) {
        for (var i = 0; i < kids.length; i++) if (kids[i].tagName === tag) return kids[i];
        return null;
      };
      var descEl = pick('PG-DESC'), moreEl = pick('PG-MORE'), noteEl = pick('PG-NOTE');

      var options = kids.filter(function (k) { return k.tagName === 'PG-OPT'; }).map(function (o) {
        var text = String(o.textContent || '').trim();
        var val = attr(o, 'value', text);
        return { value: String(val), label: text || String(val) };
      });
      if (!options.length && attr(el, 'options', '')) {
        options = attr(el, 'options', '').split('|').map(function (s) {
          var v = s.trim();
          return { value: v, label: v };
        }).filter(function (o) { return o.value !== ''; });
      }

      var count = numAttr(el, 'rating-count') || 5;
      count = Math.min(10, Math.max(1, Math.round(count)));
      var rstyle = String(attr(el, 'rating-style', 'star')).trim().toLowerCase();
      if (!RATING_ICONS[rstyle]) {
        warn('rating-style 不支援「' + rstyle + '」，已改用 star');
        rstyle = 'star';
      }
      var rmode = String(attr(el, 'rating-mode', 'pick')).trim().toLowerCase() === 'scale' ? 'scale' : 'pick';
      var rmin = numAttr(el, 'rating-min');
      var rmax = numAttr(el, 'rating-max');

      var row = {
        key: key,
        type: type,
        label: attr(el, 'label', key),
        icon: normalizeIcon(attr(el, 'icon', '')),
        descHtml: descEl ? descEl.innerHTML.trim() : '',
        descText: attr(el, 'desc', ''),
        moreHtml: moreEl ? moreEl.innerHTML.trim() : '',
        noteHtml: noteEl ? noteEl.innerHTML.trim() : '',
        options: options,
        readonly: boolAttr(el, 'readonly') || type === 'readonly' || type === 'secret',
        placeholder: attr(el, 'placeholder', null),
        unit: attr(el, 'unit', ''),
        wrap: boolAttr(el, 'wrap'),
        onText: attr(el, 'on-text', ''),
        offText: attr(el, 'off-text', ''),
        rating: {
          count: count, style: rstyle, mode: rmode,
          min: rmin === undefined ? 0 : rmin,
          max: rmax === undefined ? count : rmax
        },
        v: {
          required: boolAttr(el, 'required'),
          min: numAttr(el, 'min'),
          max: numAttr(el, 'max'),
          minLength: numAttr(el, 'minlength'),
          maxLength: numAttr(el, 'maxlength'),
          pattern: attr(el, 'pattern', ''),
          exact: el.hasAttribute('exact') ? el.getAttribute('exact') : undefined,
          minDate: attr(el, 'min-date', ''),
          maxDate: attr(el, 'max-date', '')
        },
        error: '',
        revealed: false
      };
      row.value = this._coerce(row, attr(el, 'value', ''));
      if (type === 'select' && row.value === '' && row.placeholder === null && options.length) {
        row.value = options[0].value;
      }
      this._byKey[key] = row;
      return row;
    }

    /* 依型別把輸入轉成內部值 */
    _coerce(row, raw) {
      switch (row.type) {
        case 'bool':
          return toBool(raw);
        case 'rating':
          if (row.rating.mode === 'scale') {
            var n = Math.round(Number(raw) || 0);
            return Math.min(row.rating.count, Math.max(0, n));
          }
          var list = Array.isArray(raw) ? raw : String(raw || '').split(/[,\s，、]+/);
          var seen = {};
          return list.map(Number).filter(function (x) {
            if (!isFinite(x) || x < 1 || x > row.rating.count || seen[x]) return false;
            seen[x] = true;
            return true;
          }).sort(function (a, b) { return a - b; });
        case 'number':
          if (raw === '' || raw === null || raw === undefined) return '';
          var num = Number(raw);
          return isNaN(num) ? String(raw) : num;
        default:
          return raw === null || raw === undefined ? '' : String(raw);
      }
    }

    _applyVars() {
      this.style.setProperty('--pgx-accent', resolveColor(this.getAttribute('accent'), PALETTE.ocean));

      var ratio = String(this.getAttribute('label-ratio') || '4:6').split(':').map(Number);
      var l = ratio[0], r = ratio[1];
      if (!(l > 0) || !(r > 0)) { l = 4; r = 6; }
      var left = Math.min(80, Math.max(20, l / (l + r) * 100));
      this.style.setProperty('--pgx-cols', left.toFixed(1) + '% ' + (100 - left).toFixed(1) + '%');

      if (this._bodyEl) {
        var mh = Number(this.getAttribute('max-height'));
        this._bodyEl.style.maxHeight = mh > 0 ? (mh + 'px') : '';
      }
    }

    _render() {
      this._ro = boolAttr(this, 'readonly');
      var heading = this.getAttribute('heading');
      var showActions = boolAttr(this, 'show-actions');
      var named = this._cats.filter(function (c) { return !c.anon; }).length;
      var html = '';

      /* 標題列 */
      var tools = '';
      if (named > 1) {
        var allCollapsed = this._cats.every(function (c) { return c.anon || c.collapsed; });
        tools += '<button type="button" class="pgx-tool" data-act="collapse-all" title="'
          + (allCollapsed ? '全部展開' : '全部摺疊') + '"><i class="bi '
          + (allCollapsed ? 'bi-arrows-expand' : 'bi-arrows-collapse') + '"></i></button>';
      }
      if (showActions) {
        if (!this._ro) {
          tools += '<button type="button" class="pgx-tool" data-act="validate" title="驗證所有欄位">'
            + '<i class="bi bi-check2-circle"></i></button>';
        }
        tools += '<button type="button" class="pgx-tool" data-act="export-full" title="匯出完整 JSON">'
          + '<i class="bi bi-filetype-json"></i></button>'
          + '<button type="button" class="pgx-tool" data-act="export-values" title="匯出數值 JSON">'
          + '<i class="bi bi-braces"></i></button>';
      }
      if (heading || tools) {
        html += '<div class="pgx-head"><span class="pgx-title">' + esc(heading || '') + '</span>'
          + (tools ? '<span class="pgx-tools">' + tools + '</span>' : '') + '</div>';
      }

      /* 屬性區 */
      html += '<div class="pgx-body">';
      this._cats.forEach((cat, ci) => {
        var col = cat.collapsed ? ' pgx-collapsed' : '';
        if (!cat.anon) {
          html += '<div class="pgx-cat' + col + '" data-ci="' + ci + '" role="button" tabindex="0"'
            + (cat.color ? ' style="--pgx-cat:' + cat.color + '"' : '') + '>'
            + '<i class="bi bi-chevron-down pgx-chev"></i>'
            + '<span class="pgx-cname">' + esc(cat.name) + '</span>'
            + '<span class="pgx-count">' + cat.rows.length + '</span></div>';
        }
        html += '<div class="pgx-group' + (cat.anon ? '' : col) + '" data-ci="' + ci + '">';
        var n = cat.numbering ? cat.numbering.start : 0;
        cat.rows.forEach((row) => {
          var num = cat.numbering
            ? { text: cat.numbering.prefix + (n++) + cat.numbering.suffix, color: cat.numbering.color }
            : null;
          html += this._rowHtml(row, num);
        });
        html += '</div>';
      });
      html += '</div>';

      /* 說明區 */
      if (!boolAttr(this, 'no-desc')) {
        html += '<div class="pgx-desc"><span class="pgx-desc-title"></span><span class="pgx-desc-body"></span></div>';
      }

      this.innerHTML = html;
      this._bodyEl = this.querySelector('.pgx-body');
      this._descEl = this.querySelector('.pgx-desc');

      Array.prototype.forEach.call(this.querySelectorAll('.pgx-row'), (el) => {
        var row = this._byKey[el.getAttribute('data-key')];
        if (row) row.el = el;
      });
      this._applyVars();

      /* 保留原本選取；沒有就選第一列可見的。
       * 沒有說明區時不預選，唯讀資訊卡才不會多一條選取色條 */
      var keep = this._selKey && this._byKey[this._selKey] ? this._selKey : null;
      this._selKey = null;
      if (keep) this.select(keep, true);
      else if (this._descEl) {
        var first = this.querySelector('.pgx-group:not(.pgx-collapsed) .pgx-row');
        if (first) this.select(first.getAttribute('data-key'), true);
        else this._updateDesc();
      }
    }

    _rowHtml(row, num) {
      var ro = row.readonly || this._ro;
      var cls = 'pgx-row' + (row.wrap ? ' pgx-wrap' : '') + (ro ? ' pgx-ro' : '')
        + (row.error && !ro ? ' pgx-invalid' : '');
      var h = '<div class="' + cls + '" data-key="' + esc(row.key) + '">';

      h += '<div class="pgx-label" title="' + esc(row.label) + '">';
      if (num) h += '<span class="pgx-num" style="color:' + num.color + '">' + esc(num.text) + '</span>';
      if (row.icon) h += '<i class="bi bi-' + row.icon + ' pgx-lic"></i>';
      h += '<span class="pgx-ltext">' + esc(row.label) + '</span>';
      if (row.v.required && !ro) h += '<span class="pgx-req">*</span>';
      h += '</div>';

      h += '<div class="pgx-value">' + this._editorHtml(row, ro);
      if (row.unit) h += '<span class="pgx-unit">' + esc(row.unit) + '</span>';
      h += '<i class="bi bi-exclamation-circle-fill pgx-err-ic" title="' + esc(row.error) + '"></i>';
      if (row.type === 'secret') {
        h += '<button type="button" class="pgx-mini pgx-eye' + (row.revealed ? ' pgx-on' : '')
          + '" data-act="eye" title="' + (row.revealed ? '隱藏' : '顯示') + '"><i class="bi '
          + (row.revealed ? 'bi-eye-slash' : 'bi-eye') + '"></i></button>';
      }
      if (row.moreHtml) {
        h += '<button type="button" class="pgx-mini" data-act="more" title="查看詳情">'
          + '<i class="bi bi-three-dots"></i></button>';
      }
      h += '</div></div>';

      if (row.noteHtml) {
        h += '<div class="pgx-note" data-note="' + esc(row.key) + '"><i class="bi bi-chat-left-text"></i>'
          + '<div>' + row.noteHtml + '</div></div>';
      }
      return h;
    }

    _displayText(row) {
      var v = row.value;
      if (row.type === 'select') {
        for (var i = 0; i < row.options.length; i++) {
          if (row.options[i].value === String(v)) return row.options[i].label;
        }
      }
      return v === null || v === undefined ? '' : String(v);
    }

    _editorHtml(row, ro) {
      var t = row.type;
      if (t === 'secret') {
        return '<span class="pgx-text' + (row.revealed ? '' : ' pgx-masked') + '" data-role="out">'
          + esc(row.revealed ? row.value : MASK) + '</span>';
      }
      if (t === 'bool') {
        var on = !!row.value;
        return '<button type="button" class="pgx-sw' + (on ? ' pgx-on' : '') + '" data-act="bool" role="switch"'
          + ' aria-checked="' + on + '"' + (ro ? ' disabled' : '') + '></button>'
          + ((row.onText || row.offText)
            ? '<span class="pgx-swtxt" data-role="swtxt">' + esc(on ? row.onText : row.offText) + '</span>' : '');
      }
      if (t === 'rating') {
        var icons = RATING_ICONS[row.rating.style];
        var h = '<span class="pgx-rate" style="--pgx-rc:' + RATING_COLORS[row.rating.style] + '">';
        for (var i = 1; i <= row.rating.count; i++) {
          var lit = this._ratingLit(row, i);
          h += '<button type="button" class="pgx-rt' + (lit ? ' pgx-on' : '') + '" data-act="rate" data-i="' + i + '"'
            + (ro ? ' disabled' : '') + ' title="' + i + '"><i class="bi ' + icons[lit ? 1 : 0] + '"></i></button>';
        }
        return h + '</span>';
      }
      if (ro || t === 'readonly') {
        return '<span class="pgx-text' + (t === 'number' ? ' pgx-num-v' : '') + '" data-role="out" title="'
          + esc(this._displayText(row)) + '">' + esc(this._displayText(row)) + '</span>';
      }
      if (t === 'select') {
        var s = '<select class="pgx-in" data-role="in">';
        if (row.placeholder !== null) s += '<option value="">' + esc(row.placeholder) + '</option>';
        row.options.forEach(function (o) {
          s += '<option value="' + esc(o.value) + '"' + (o.value === String(row.value) ? ' selected' : '') + '>'
            + esc(o.label) + '</option>';
        });
        return s + '</select>';
      }
      var type = t === 'number' ? 'number' : 'text';
      var ph = row.placeholder !== null ? row.placeholder
        : (t === 'date' ? 'YYYY/MM/DD' : (t === 'date-roc' ? 'YYY/MM/DD（民國）' : ''));
      return '<input class="pgx-in" data-role="in" type="' + type + '"'
        + (t === 'number' ? ' step="any" inputmode="decimal"' : '')
        + (row.v.maxLength !== undefined ? ' maxlength="' + row.v.maxLength + '"' : '')
        + ' value="' + esc(row.value) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '')
        + ' autocomplete="off" spellcheck="false">';
    }

    _ratingLit(row, i) {
      return row.rating.mode === 'scale' ? i <= row.value : row.value.indexOf(i) !== -1;
    }

    /* 只更新單一列的畫面，不整張重畫 */
    _syncEditor(row) {
      var el = row.el;
      if (!el) return;
      var t = row.type;
      if (t === 'bool') {
        var sw = el.querySelector('.pgx-sw');
        if (sw) {
          sw.classList.toggle('pgx-on', !!row.value);
          sw.setAttribute('aria-checked', String(!!row.value));
        }
        var txt = el.querySelector('[data-role="swtxt"]');
        if (txt) txt.textContent = row.value ? row.onText : row.offText;
        return;
      }
      if (t === 'rating') {
        var icons = RATING_ICONS[row.rating.style];
        Array.prototype.forEach.call(el.querySelectorAll('.pgx-rt'), (b) => {
          var lit = this._ratingLit(row, Number(b.getAttribute('data-i')));
          b.classList.toggle('pgx-on', lit);
          b.firstElementChild.className = 'bi ' + icons[lit ? 1 : 0];
        });
        return;
      }
      if (t === 'secret') {
        var sp = el.querySelector('[data-role="out"]');
        sp.textContent = row.revealed ? String(row.value) : MASK;
        sp.classList.toggle('pgx-masked', !row.revealed);
        var eye = el.querySelector('.pgx-eye');
        eye.classList.toggle('pgx-on', row.revealed);
        eye.title = row.revealed ? '隱藏' : '顯示';
        eye.firstElementChild.className = 'bi ' + (row.revealed ? 'bi-eye-slash' : 'bi-eye');
        return;
      }
      var input = el.querySelector('[data-role="in"]');
      if (input) {
        if (document.activeElement !== input || input.tagName === 'SELECT') input.value = String(row.value);
        return;
      }
      var out = el.querySelector('[data-role="out"]');
      if (out) {
        out.textContent = this._displayText(row);
        out.title = this._displayText(row);
      }
    }

    /* ---------- 事件 ---------- */
    _bind() {
      this.addEventListener('click', (e) => this._onClick(e));
      this.addEventListener('keydown', (e) => {
        var cat = e.target.closest && e.target.closest('.pgx-cat');
        if (cat && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          this.collapse(Number(cat.getAttribute('data-ci')));
        }
      });
      this.addEventListener('input', (e) => this._onInput(e));
      this.addEventListener('change', (e) => this._onInput(e));
      this.addEventListener('focusin', (e) => {
        var r = e.target.closest && e.target.closest('.pgx-row');
        if (r) this.select(r.getAttribute('data-key'));
      });
      this.addEventListener('focusout', (e) => {
        if (!e.target.matches || !e.target.matches('.pgx-in')) return;
        var row = this._rowOf(e.target);
        if (row) this._validateRow(row);
      });
    }

    _rowOf(el) {
      var r = el.closest('.pgx-row');
      return r ? this._byKey[r.getAttribute('data-key')] : null;
    }

    _onClick(e) {
      var t = e.target;
      var cat = t.closest('.pgx-cat');
      if (cat && this.contains(cat)) {
        this.collapse(Number(cat.getAttribute('data-ci')));
        return;
      }
      var btn = t.closest('[data-act]');
      var act = btn ? btn.getAttribute('data-act') : '';
      switch (act) {
        case 'collapse-all': {
          var all = this._cats.every(function (c) { return c.anon || c.collapsed; });
          this.collapseAll(!all);
          return;
        }
        case 'validate': {
          var res = this.validate();
          this._say(res.valid ? '所有欄位都通過驗證' : ('有 ' + res.errors.length + ' 個欄位需要修正'),
            res.valid ? 'success' : 'warning');
          return;
        }
        case 'export-full': this.download(true); return;
        case 'export-values': this.download(false); return;
      }

      var rowEl = t.closest('.pgx-row');
      if (!rowEl) return;
      var row = this._byKey[rowEl.getAttribute('data-key')];
      if (!row) return;
      this.select(row.key);
      if (btn && btn.disabled) return;

      if (act === 'bool') {
        this._commit(row, !row.value, 'user');
      } else if (act === 'rate') {
        this._rate(row, Number(btn.getAttribute('data-i')));
      } else if (act === 'eye') {
        row.revealed = !row.revealed;
        this._syncEditor(row);
      } else if (act === 'more') {
        getModal().open(row.label, row.moreHtml);
      }
    }

    _onInput(e) {
      var el = e.target;
      if (!el.matches || !el.matches('.pgx-in')) return;
      var row = this._rowOf(el);
      if (!row) return;
      var next = this._coerce(row, el.value);
      if (same(next, row.value)) return;
      var old = row.value;
      row.value = next;
      if (row.error) this._validateRow(row);
      this._emit('pg-change', { key: row.key, value: clone(next), old: clone(old), source: 'user' });
    }

    _rate(row, i) {
      var r = row.rating;
      var next;
      if (r.mode === 'scale') {
        next = (row.value === i) ? i - 1 : i;
        if (next < r.min) { this._say('最少 ' + r.min + ' 分', 'warning'); return; }
        if (next > r.max) { this._say('最多 ' + r.max + ' 分', 'warning'); return; }
      } else {
        var has = row.value.indexOf(i) !== -1;
        next = has ? row.value.filter(function (x) { return x !== i; }) : row.value.concat([i]);
        next.sort(function (a, b) { return a - b; });
        if (has && next.length < r.min) { this._say('至少需要選擇 ' + r.min + ' 項', 'warning'); return; }
        if (!has && next.length > r.max) { this._say('最多只能選擇 ' + r.max + ' 項', 'warning'); return; }
      }
      this._commit(row, next, 'user');
    }

    _commit(row, next, source) {
      var old = row.value;
      if (same(old, next)) return;
      row.value = next;
      this._syncEditor(row);
      if (row.error) this._validateRow(row);
      this._emit('pg-change', { key: row.key, value: clone(next), old: clone(old), source: source });
    }

    _emit(name, detail) {
      this.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail }));
    }

    _say(msg, kind) {
      if (boolAttr(this, 'silent')) {
        if (window.console && console.info) console.info('[ui-progrid] ' + msg);
        return;
      }
      notify(msg, kind);
    }

    /* ---------- 說明區 ---------- */
    _updateDesc() {
      if (!this._descEl) return;
      var title = this._descEl.querySelector('.pgx-desc-title');
      var body = this._descEl.querySelector('.pgx-desc-body');
      var row = this._selKey ? this._byKey[this._selKey] : null;
      if (!row) {
        title.textContent = '';
        body.innerHTML = '<span class="pgx-muted">選擇一列以查看說明</span>';
        return;
      }
      title.textContent = row.label;
      var h = '';
      if (row.error) {
        h += '<span class="pgx-desc-err"><i class="bi bi-exclamation-triangle-fill"></i>' + esc(row.error) + '</span>';
      }
      if (row.descHtml) h += row.descHtml;
      else if (row.descText) h += esc(row.descText);
      else if (row.type === 'secret') h += '<span class="pgx-muted">此欄位預設隱藏，按眼睛圖示切換顯示。</span>';
      else if (!row.error) h += '<span class="pgx-muted">無說明</span>';
      body.innerHTML = h;
    }

    /* ---------- 驗證 ---------- */
    _check(row) {
      if (row.readonly || this._ro) return '';
      var v = row.v;
      var val = row.value;
      var r = row.rating;
      if (row.type === 'bool') return '';
      if (row.type === 'rating') {
        if (r.mode === 'scale') {
          if (v.required && !val) return '請給分';
          if (val && val < r.min) return '最少 ' + r.min + ' 分';
          return '';
        }
        if (v.required && !val.length) return '至少選擇 1 項';
        if (val.length && val.length < r.min) return '至少需要選擇 ' + r.min + ' 項';
        if (val.length > r.max) return '最多只能選擇 ' + r.max + ' 項';
        return '';
      }
      var s = val === null || val === undefined ? '' : String(val);
      if (v.required && !s.trim()) return '必填';
      if (!s) return '';

      if (row.type === 'date' || row.type === 'date-roc') {
        var roc = row.type === 'date-roc';
        var dt = parseDate(s, roc);
        if (!dt) return roc ? '日期格式錯誤（民國 YYY/MM/DD）' : '日期格式錯誤（YYYY/MM/DD）';
        var minD = parseDate(v.minDate, roc), maxD = parseDate(v.maxDate, roc);
        if (minD && dt < minD) return '日期不得早於 ' + v.minDate;
        if (maxD && dt > maxD) return '日期不得晚於 ' + v.maxDate;
      }
      if (v.minLength !== undefined && s.length < v.minLength) return '最少需要 ' + v.minLength + ' 個字元';
      if (v.maxLength !== undefined && s.length > v.maxLength) return '最多 ' + v.maxLength + ' 個字元';
      if (row.type === 'number') {
        var n = Number(s);
        if (isNaN(n)) return '請輸入數字';
        if (v.min !== undefined && n < v.min) return '最小值為 ' + v.min;
        if (v.max !== undefined && n > v.max) return '最大值為 ' + v.max;
      }
      if (v.pattern) {
        try {
          if (!new RegExp(v.pattern).test(s)) return '格式不正確';
        } catch (err) {
          warn('pattern 無法解析：' + v.pattern);
        }
      }
      if (v.exact !== undefined && s !== v.exact) return '必須輸入：' + v.exact;
      return '';
    }

    _validateRow(row) {
      var msg = this._check(row);
      var changed = msg !== row.error;
      row.error = msg;
      if (row.el) {
        row.el.classList.toggle('pgx-invalid', !!msg);
        var ic = row.el.querySelector('.pgx-err-ic');
        if (ic) ic.title = msg;
      }
      if (row.key === this._selKey) this._updateDesc();
      if (msg && changed) this._emit('pg-invalid', { key: row.key, label: row.label, message: msg });
      return !msg;
    }

    getValue(key) {
      var row = this._byKey && this._byKey[key];
      return row ? clone(row.value) : undefined;
    }

    setValue(key, value) {
      var row = this._byKey && this._byKey[key];
      if (!row) { warn('setValue 找不到 key：' + key); return false; }
      this._commit(row, this._coerce(row, value), 'api');
      return true;
    }

    getValues() {
      var out = {};
      (this._cats || []).forEach(function (c) {
        c.rows.forEach(function (r) { out[r.key] = clone(r.value); });
      });
      return out;
    }

    getFocused() {
      var row = this._selKey ? this._byKey[this._selKey] : null;
      if (!row) return null;
      var cat = this._cats.filter(function (c) { return c.rows.indexOf(row) !== -1; })[0];
      return {
        key: row.key, label: row.label, value: clone(row.value), type: row.type,
        category: cat ? cat.name : '', readonly: row.readonly || this._ro
      };
    }

    select(key, quiet) {
      var row = this._byKey && this._byKey[key];
      if (!row || this._selKey === key) return !!row;
      if (this._selKey && this._byKey[this._selKey] && this._byKey[this._selKey].el) {
        this._byKey[this._selKey].el.classList.remove('pgx-sel');
      }
      this._selKey = key;
      if (row.el) row.el.classList.add('pgx-sel');
      this._updateDesc();
      if (!quiet) this._emit('pg-select', { key: key, label: row.label });
      return true;
    }

    validate() {
      var errors = [];
      var firstCat = -1, firstKey = null;
      this._cats.forEach((cat, ci) => {
        cat.rows.forEach((row) => {
          if (!this._validateRow(row)) {
            errors.push({ key: row.key, label: row.label, message: row.error });
            if (firstKey === null) { firstKey = row.key; firstCat = ci; }
          }
        });
      });
      if (firstKey !== null) {
        if (this._cats[firstCat].collapsed) this.collapse(firstCat, false);
        this.select(firstKey);
        var el = this._byKey[firstKey].el;
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
      }
      return { valid: !errors.length, errors: errors };
    }

    toJSON(full) {
      if (!full) return this.getValues();
      return {
        heading: this.getAttribute('heading') || '',
        categories: this._cats.map(function (c) {
          return {
            name: c.name,
            rows: c.rows.map(function (r) {
              return { key: r.key, label: r.label, type: r.type, value: clone(r.value), readonly: r.readonly };
            })
          };
        })
      };
    }

    download(full) {
      var data = JSON.stringify(this.toJSON(full), null, 2);
      var name = (this.id || 'progrid') + (full ? '-full' : '-values') + '.json';
      var url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      this._say('已下載 ' + name, 'success');
      return name;
    }

    collapse(target, on) {
      var ci = typeof target === 'number' ? target : -1;
      if (ci === -1) {
        for (var i = 0; i < this._cats.length; i++) {
          if (this._cats[i].name === target) { ci = i; break; }
        }
      }
      var cat = this._cats[ci];
      if (!cat || cat.anon) return false;
      cat.collapsed = (on === undefined) ? !cat.collapsed : !!on;
      var head = this.querySelector('.pgx-cat[data-ci="' + ci + '"]');
      var group = this.querySelector('.pgx-group[data-ci="' + ci + '"]');
      if (head) head.classList.toggle('pgx-collapsed', cat.collapsed);
      if (group) group.classList.toggle('pgx-collapsed', cat.collapsed);
      this._syncCollapseTool();
      return cat.collapsed;
    }

    collapseAll(on) {
      var state = on === undefined ? true : !!on;
      this._cats.forEach((c, i) => { if (!c.anon) this.collapse(i, state); });
      return state;
    }

    _syncCollapseTool() {
      var b = this.querySelector('[data-act="collapse-all"]');
      if (!b) return;
      var all = this._cats.every(function (c) { return c.anon || c.collapsed; });
      b.title = all ? '全部展開' : '全部摺疊';
      b.firstElementChild.className = 'bi ' + (all ? 'bi-arrows-expand' : 'bi-arrows-collapse');
    }

    rebuild(html) {
      if (typeof html === 'string') this.innerHTML = html;
      if (!this._built) { this._init(); return; }
      this._selKey = null;
      this._parse();
      this._render();
    }
  }

  injectStyles();
  customElements.define('ui-progrid', UiProgrid);

  window.UiProgrid = {
    palette: PALETTE,
    types: TYPES.slice(),
    find: function (id) {
      var el = document.getElementById(id);
      return el && el.tagName === 'UI-PROGRID' ? el : null;
    },
    all: function () {
      return Array.prototype.slice.call(document.querySelectorAll('ui-progrid'));
    },
    notify: notify
  };
})();
