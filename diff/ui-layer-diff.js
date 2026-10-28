(function () {
  'use strict';

  if (window.customElements && customElements.get('ui-layer-diff')) return;

  var PALETTE = {
    bg: '#0C0D0C', shell: '#C6C7BD', lavender: '#C3A5E5', sky: '#82C8E5',
    warning: '#E6374B', salmon: '#E5C3B3', ocean: '#1CCAE8', safe: '#27AE60',
    teal: '#0DA591', vanilla: '#DBEDD8', yellow: '#E3D322', focus: '#D4FFFC',
    special: '#B3DE73', info: '#4171BF', indigo: '#7849C9', pink: '#FF91D7',
    orange: '#EDA109'
  };

  var THEMES = {
    dark: { bg: '#0C0D0C', text: '#C6C7BD', border: '#82C8E5', accent: '#82C8E5', add: '#B3DE73', del: '#E6374B' },
    light: { bg: '#DBEDD8', text: '#0C0D0C', border: '#0DA591', accent: '#0DA591', add: '#4171BF', del: '#E6374B' }
  };
  ['ocean', 'lavender', 'teal', 'pink', 'orange', 'salmon', 'sky', 'yellow'].forEach(function (n) {
    THEMES[n] = { bg: '#0C0D0C', text: '#C6C7BD', border: PALETTE[n], accent: PALETTE[n], add: '#B3DE73', del: '#E6374B' };
  });

  var BORDER_STYLES = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'];

  var CSS = [
    'ui-layer-diff{display:block;box-sizing:border-box;width:var(--uld-w,100%);max-width:100%}',
    'ui-layer-diff ui-layer{display:none}',
    'ui-layer-diff .uld-box{box-sizing:border-box;width:100%;background:var(--uld-bg);color:var(--uld-text);border:var(--uld-border);padding:var(--uld-pad);font-family:system-ui,-apple-system,"Segoe UI","Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;font-size:var(--uld-fs);line-height:1.5;text-align:left}',
    'ui-layer-diff .uld-head{display:flex;justify-content:space-between;align-items:center;margin:0 0 8px 0;font-size:calc(var(--uld-fs) * 0.75);font-weight:600;color:var(--uld-accent)}',
    'ui-layer-diff .uld-stage{display:grid}',
    'ui-layer-diff .uld-layer{grid-area:1 / 1;visibility:hidden;opacity:0;transition:opacity .25s ease,visibility 0s linear .25s}',
    'ui-layer-diff .uld-layer.is-active{visibility:visible;opacity:1;transition:opacity .25s ease,visibility 0s linear 0s}',
    'ui-layer-diff .uld-note{margin:6px 0 0 0;font-size:calc(var(--uld-fs) * 0.8);color:var(--uld-accent)}',
    'ui-layer-diff .uld-add{color:var(--uld-add);font-weight:600}',
    'ui-layer-diff .uld-del{color:var(--uld-del);text-decoration:line-through;text-decoration-thickness:1px}',
    'ui-layer-diff .uld-del + .uld-add{margin-left:4px}',
    'ui-layer-diff .uld-foot{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;margin:12px 0 0 0;padding:8px 0 0 0;border-top:1px dashed var(--uld-accent);font-size:calc(var(--uld-fs) * 0.75)}',
    'ui-layer-diff .uld-legend{display:flex;align-items:center;gap:12px}',
    'ui-layer-diff .uld-sw{display:inline-block;width:10px;height:10px;margin:0 4px 0 0}',
    'ui-layer-diff .uld-sw-add{background:var(--uld-add)}',
    'ui-layer-diff .uld-sw-del{background:var(--uld-del)}',
    'ui-layer-diff .uld-ctl{display:flex;align-items:center;gap:6px;margin-left:auto}',
    'ui-layer-diff .uld-btn{box-sizing:border-box;margin:0;padding:2px 10px;background:transparent;color:var(--uld-text);border:1px solid var(--uld-text);font:inherit;font-size:calc(var(--uld-fs) * 0.75);line-height:1.5;cursor:pointer}',
    'ui-layer-diff .uld-btn:hover{color:var(--uld-accent);border-color:var(--uld-accent)}',
    'ui-layer-diff .uld-btn[disabled]{border-style:dashed;opacity:.78;cursor:default}',
    'ui-layer-diff .uld-btn[disabled]:hover{color:var(--uld-text);border-color:var(--uld-text)}',
    'ui-layer-diff .uld-dot{box-sizing:border-box;width:10px;height:10px;margin:0 2px;padding:0;background:transparent;border:1px solid var(--uld-text);border-radius:50%;cursor:pointer}',
    'ui-layer-diff .uld-dot:hover{border-color:var(--uld-accent)}',
    'ui-layer-diff .uld-dot.is-active{background:var(--uld-accent);border-color:var(--uld-accent)}',
    'ui-layer-diff .uld-result{margin:var(--uld-rg,10px) 0 0 0;padding:8px 0 0 0;border-top:1px dashed var(--uld-accent)}',
    'ui-layer-diff .uld-result-label{display:block;margin:0 0 2px 0;font-size:calc(var(--uld-fs) * 0.75);font-weight:600;color:var(--uld-accent)}',
    'ui-layer-diff .uld-result-text{color:var(--uld-text)}',
    'ui-layer-diff .uld-bar{position:relative;box-sizing:border-box;height:var(--uld-ph,10px);margin:12px 0 0 0;background:var(--uld-bg);border:1px solid var(--uld-accent);overflow:hidden;cursor:pointer}',
    'ui-layer-diff .uld-bar.is-top{margin:0 0 12px 0}',
    'ui-layer-diff .uld-bar-fill{position:absolute;left:0;top:0;bottom:0;width:100%;background:linear-gradient(to right,var(--uld-pf),var(--uld-pt));clip-path:inset(0 calc(100% - var(--uld-p,0%)) 0 0);transition:clip-path .35s ease}',
    'ui-layer-diff .uld-bar-tick{position:absolute;top:0;bottom:0;width:2px;margin:0 0 0 -1px;background:var(--uld-bg)}'
  ].join('\n');

  function injectCss() {
    if (document.getElementById('ui-layer-diff-style')) return;
    var s = document.createElement('style');
    s.id = 'ui-layer-diff-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function color(v, fallback) {
    v = (v || '').trim();
    if (!v) return fallback;
    var k = v.toLowerCase();
    return PALETTE[k] || v;
  }

  function withUnit(v, unit, def) {
    v = (v || '').trim();
    if (!v) return def + unit;
    return /^\d+(\.\d+)?$/.test(v) ? v + unit : v;
  }

  function parsePadding(v) {
    v = (v || '').trim();
    if (!v) return '16px';
    return v.split(/\s+/).map(function (t) { return withUnit(t, 'px', 16); }).join(' ');
  }

  function parseBorder(v, def) {
    v = (v || '').trim();
    if (!v) return '1px solid ' + def;
    if (v === 'none' || v === '0') return 'none';
    var w = '1px', st = 'solid', c = def;
    v.split(/\s+/).forEach(function (t) {
      if (/^\d/.test(t)) w = /^\d+(\.\d+)?$/.test(t) ? t + 'px' : t;
      else if (BORDER_STYLES.indexOf(t.toLowerCase()) > -1) st = t.toLowerCase();
      else c = color(t, t);
    });
    return w + ' ' + st + ' ' + c;
  }

  /* ---------- diff ---------- */

  function tokenize(s) {
    return s.match(/\s+|[A-Za-z0-9\u00C0-\u024F]+(?:['\u2019\-][A-Za-z0-9\u00C0-\u024F]+)*|[\u3400-\u9fff]|[^\s]/g) || [];
  }

  function tokenKey(t) { return /^\s+$/.test(t) ? ' ' : t; }

  function diffOps(a, b) {
    var A = tokenize(a), B = tokenize(b), n = A.length, m = B.length, i, j;
    var ka = A.map(tokenKey), kb = B.map(tokenKey);
    var dp = [];
    for (i = 0; i <= n; i++) dp.push(new Array(m + 1).fill(0));
    for (i = n - 1; i >= 0; i--) {
      for (j = m - 1; j >= 0; j--) {
        dp[i][j] = ka[i] === kb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var ops = [];
    i = 0; j = 0;
    while (i < n && j < m) {
      if (ka[i] === kb[j]) { ops.push(['eq', B[j]]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push(['del', A[i]]); i++; }
      else { ops.push(['add', B[j]]); j++; }
    }
    while (i < n) ops.push(['del', A[i++]]);
    while (j < m) ops.push(['add', B[j++]]);
    return normalize(ops);
  }

  function mergeOps(list) {
    var out = [];
    list.forEach(function (o) {
      if (out.length && out[out.length - 1][0] === o[0]) out[out.length - 1][1] += o[1];
      else out.push([o[0], o[1]]);
    });
    return out;
  }

  function normalize(ops) {
    var ws = /^\s+$/, m = mergeOps(ops), i;
    for (i = 1; i < m.length - 1; i++) {
      if (m[i][0] === 'eq' && ws.test(m[i][1]) && m[i - 1][0] !== 'eq' && m[i - 1][0] === m[i + 1][0]) {
        m[i][0] = m[i - 1][0];
      }
    }
    var r = [];
    m.forEach(function (o) {
      var t = o[0];
      if (ws.test(o[1])) {
        if (t === 'del') return;
        if (t === 'add') t = 'eq';
      }
      r.push([t, o[1]]);
    });
    return mergeOps(r);
  }

  function diffHtml(a, b, showDel) {
    var out = '';
    diffOps(a, b).forEach(function (o) {
      var t = o[0], s = o[1];
      if (t === 'add') {
        out += '<span class="uld-add">' + esc(s) + '</span>';
      } else if (t === 'del') {
        if (!showDel) return;
        var p = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
        out += esc(p[1]) + '<span class="uld-del">' + esc(p[2]) + '</span>' + esc(p[3]);
      } else {
        out += esc(s);
      }
    });
    return out;
  }

  /* ---------- element ---------- */

  var STYLE_ATTRS = ['width', 'theme', 'padding', 'font-size', 'border', 'add-color', 'del-color',
    'progress-from', 'progress-to', 'progress-height', 'result-gap'];
  var BUILD_ATTRS = ['controls', 'legend', 'show-del', 'add-label', 'del-label',
    'show-result', 'result-label', 'progress', 'progress-position', 'progress-ticks'];

  class UiLayerDiff extends HTMLElement {
    static get observedAttributes() {
      return STYLE_ATTRS.concat(BUILD_ATTRS, ['mode', 'interval', 'loop', 'start']);
    }

    constructor() {
      super();
      this._layers = null;
      this._idx = 0;
      this._timer = null;
      this._playing = false;
      this._ready = false;
      var self = this;
      this.addEventListener('click', function (e) { self._onClick(e); });
    }

    connectedCallback() {
      var self = this;
      if (this._ready) { this._arm(); return; }
      if (document.readyState === 'loading' && !this._layers) {
        document.addEventListener('DOMContentLoaded', function () { self._init(); }, { once: true });
      } else {
        this._init();
      }
    }

    disconnectedCallback() { this._clear(); }

    attributeChangedCallback(name, oldV, newV) {
      if (!this._ready || oldV === newV) return;
      if (STYLE_ATTRS.indexOf(name) > -1) { this._applyStyle(); return; }
      if (name === 'interval') { this._arm(); return; }
      if (name === 'loop') { this._show(this._idx, null); return; }
      if (name === 'mode') { this._playing = this._isAuto(); this._rebuild(); return; }
      if (BUILD_ATTRS.indexOf(name) > -1) this._rebuild();
    }

    /* public api */

    get layers() { return (this._layers || []).slice(); }
    set layers(v) {
      this._layers = (v || []).map(function (x) {
        return typeof x === 'string' ? { text: x, label: '', note: '' } : { text: x.text || '', label: x.label || '', note: x.note || '' };
      });
      if (this._ready) { this._idx = 0; this._rebuild(); }
    }

    get layer() { return this._idx + 1; }
    set layer(n) { this._go((parseInt(n, 10) || 1) - 1, 'api'); }

    next() { this._go(this._idx + 1, 'api'); }
    prev() { this._go(this._idx - 1, 'api'); }

    play() {
      var n = this._layers ? this._layers.length : 0;
      if (n < 2) return;
      if (this._idx === n - 1 && !this.hasAttribute('loop')) this._show(0, 'api');
      this._playing = true;
      this._syncCtl();
      this._arm();
    }

    pause() {
      this._playing = false;
      this._clear();
      this._syncCtl();
    }

    /* internals */

    _isAuto() { return (this.getAttribute('mode') || '').toLowerCase() === 'auto'; }

    /* attribute absent -> def; value "false" -> false; anything else (including empty) -> true */
    _flag(name, def) {
      if (!this.hasAttribute(name)) return def;
      return (this.getAttribute(name) || '').trim().toLowerCase() !== 'false';
    }

    _interval() { return Math.max(300, parseInt(this.getAttribute('interval'), 10) || 2500); }

    _readChildren() {
      return Array.prototype.filter.call(this.children, function (el) { return el.tagName === 'UI-LAYER'; }).map(function (el) {
        return {
          text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
          label: el.getAttribute('label') || '',
          note: el.getAttribute('note') || ''
        };
      });
    }

    _init() {
      if (this._ready) return;
      injectCss();
      if (!this._layers) this._layers = this._readChildren();
      this._ready = true;
      var start = (parseInt(this.getAttribute('start'), 10) || 1) - 1;
      this._idx = Math.max(0, Math.min(this._layers.length - 1, start));
      this._playing = this._isAuto();
      this._applyStyle();
      this._rebuild();
    }

    _rebuild() {
      this._build();
      this._show(this._idx, null);
      this._arm();
    }

    _applyStyle() {
      var t = THEMES[(this.getAttribute('theme') || 'dark').toLowerCase()] || THEMES.dark;
      var s = this.style;
      s.setProperty('--uld-bg', t.bg);
      s.setProperty('--uld-text', t.text);
      s.setProperty('--uld-accent', t.accent);
      s.setProperty('--uld-add', color(this.getAttribute('add-color'), t.add));
      s.setProperty('--uld-del', color(this.getAttribute('del-color'), t.del));
      s.setProperty('--uld-border', parseBorder(this.getAttribute('border'), t.border));
      s.setProperty('--uld-pad', parsePadding(this.getAttribute('padding')));
      s.setProperty('--uld-fs', withUnit(this.getAttribute('font-size'), 'rem', 1.125));
      var w = (this.getAttribute('width') || '').trim();
      s.setProperty('--uld-w', w ? withUnit(w, 'px', 100) : '100%');
      s.setProperty('--uld-pf', color(this.getAttribute('progress-from'), t.accent));
      s.setProperty('--uld-pt', color(this.getAttribute('progress-to'), color(this.getAttribute('add-color'), t.add)));
      s.setProperty('--uld-ph', withUnit(this.getAttribute('progress-height'), 'px', 10));
      s.setProperty('--uld-rg', withUnit(this.getAttribute('result-gap'), 'px', 10));
    }

    _build() {
      var L = this._layers, n = L.length;
      if (!n) { this.innerHTML = ''; return; }
      var showDel = this.getAttribute('show-del') !== 'false';
      var showResult = this._flag('show-result', false);
      var resultLabel = esc(this.getAttribute('result-label') || '完整句子');
      var stage = L.map(function (l, i) {
        var inner = i === 0 ? esc(l.text) : diffHtml(L[i - 1].text, l.text, showDel);
        var note = l.note ? '<div class="uld-note">' + esc(l.note) + '</div>' : '';
        /* layer 1 is identical to its own diff text, so its full sentence is never shown */
        var result = showResult && i > 0
          ? '<div class="uld-result"><span class="uld-result-label">' + resultLabel + '</span><div class="uld-result-text">' + esc(l.text) + '</div></div>'
          : '';
        return '<div class="uld-layer"><div class="uld-text">' + inner + '</div>' + note + result + '</div>';
      }).join('');

      var bar = '';
      if (this._flag('progress', false)) {
        var top = (this.getAttribute('progress-position') || '').toLowerCase() === 'top';
        var ticks = '';
        if (this._flag('progress-ticks', true)) {
          for (var k = 1; k < n; k++) ticks += '<i class="uld-bar-tick" style="left:' + (k / n * 100) + '%"></i>';
        }
        bar = '<div class="uld-bar' + (top ? ' is-top' : '') + '" data-bar="1"><div class="uld-bar-fill"></div>' + ticks + '</div>';
      }
      var barTop = bar && /is-top/.test(bar) ? bar : '';
      var barBottom = bar && !barTop ? bar : '';

      var showLegend = this.getAttribute('legend') !== 'false';
      var showCtl = this.getAttribute('controls') !== 'false' && n > 1;
      var legend = '';
      if (showLegend) {
        legend = '<div class="uld-legend">' +
          '<span><i class="uld-sw uld-sw-add"></i>' + esc(this.getAttribute('add-label') || '增加') + '</span>' +
          (showDel ? '<span><i class="uld-sw uld-sw-del"></i>' + esc(this.getAttribute('del-label') || '減去') + '</span>' : '') +
          '</div>';
      }
      var ctl = '';
      if (showCtl) {
        var dots = L.map(function (l, i) {
          return '<button type="button" class="uld-dot" data-act="go" data-i="' + i + '"></button>';
        }).join('');
        ctl = '<div class="uld-ctl">' +
          '<button type="button" class="uld-btn" data-act="prev">上一層</button>' +
          (this._isAuto() ? '<button type="button" class="uld-btn" data-act="toggle">暫停</button>' : '') +
          dots +
          '<button type="button" class="uld-btn" data-act="next">下一層</button>' +
          '</div>';
      }
      var foot = (legend || ctl) ? '<div class="uld-foot">' + legend + ctl + '</div>' : '';

      this.innerHTML = '<div class="uld-box">' +
        '<div class="uld-head"><span class="uld-label"></span><span class="uld-count"></span></div>' +
        barTop + '<div class="uld-stage">' + stage + '</div>' + barBottom + foot + '</div>';
    }

    _show(i, source) {
      var L = this._layers, n = L ? L.length : 0;
      if (!n) return;
      i = Math.max(0, Math.min(n - 1, i));
      this._idx = i;
      var layerEls = this.querySelectorAll('.uld-layer');
      Array.prototype.forEach.call(layerEls, function (el, k) { el.classList.toggle('is-active', k === i); });
      var label = L[i].label || ('第 ' + (i + 1) + ' 層');
      var lb = this.querySelector('.uld-label'), ct = this.querySelector('.uld-count');
      if (lb) lb.textContent = label;
      if (ct) ct.textContent = (i + 1) + ' / ' + n;
      Array.prototype.forEach.call(this.querySelectorAll('.uld-dot'), function (d, k) { d.classList.toggle('is-active', k === i); });
      var barEl = this.querySelector('.uld-bar');
      if (barEl) barEl.style.setProperty('--uld-p', ((i + 1) / n * 100) + '%');
      var loop = this.hasAttribute('loop');
      var pv = this.querySelector('[data-act="prev"]'), nx = this.querySelector('[data-act="next"]');
      if (pv) pv.disabled = !loop && i === 0;
      if (nx) nx.disabled = !loop && i === n - 1;
      this._syncCtl();
      if (source) {
        this.dispatchEvent(new CustomEvent('layerchange', { bubbles: true, detail: { layer: i + 1, total: n, label: label, source: source } }));
      }
    }

    _go(i, source) {
      var n = this._layers ? this._layers.length : 0;
      if (!n) return;
      if (this.hasAttribute('loop')) i = (i + n) % n;
      else i = Math.max(0, Math.min(n - 1, i));
      this._show(i, source);
      this._arm();
    }

    _syncCtl() {
      var b = this.querySelector('[data-act="toggle"]');
      if (b) b.textContent = this._playing ? '暫停' : '播放';
    }

    _clear() {
      if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    }

    _arm() {
      this._clear();
      if (!this._ready || !this._playing || !this._layers || this._layers.length < 2) return;
      var self = this;
      this._timer = setTimeout(function () { self._advance(); }, this._interval());
    }

    _advance() {
      var n = this._layers.length, i = this._idx + 1;
      if (i >= n) {
        if (this.hasAttribute('loop')) {
          i = 0;
        } else {
          this._playing = false;
          this._syncCtl();
          this.dispatchEvent(new CustomEvent('layerend', { bubbles: true, detail: { total: n } }));
          return;
        }
      }
      this._show(i, 'auto');
      this._arm();
    }

    _onClick(e) {
      var bar = e.target.closest ? e.target.closest('.uld-bar') : null;
      if (bar && this.contains(bar) && this._layers && this._layers.length) {
        var r = bar.getBoundingClientRect(), n = this._layers.length;
        var f = r.width ? (e.clientX - r.left) / r.width : 0;
        this._go(Math.min(n - 1, Math.max(0, Math.floor(f * n))), 'user');
        return;
      }
      var t = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!t || !this.contains(t) || t.disabled) return;
      var act = t.getAttribute('data-act');
      if (act === 'prev') this._go(this._idx - 1, 'user');
      else if (act === 'next') this._go(this._idx + 1, 'user');
      else if (act === 'go') this._go(parseInt(t.getAttribute('data-i'), 10), 'user');
      else if (act === 'toggle') { if (this._playing) this.pause(); else this.play(); }
    }
  }

  UiLayerDiff.diff = function (a, b, showDel) { return diffHtml(a, b, showDel !== false); };
  window.UiLayerDiff = UiLayerDiff;
  injectCss();
  customElements.define('ui-layer-diff', UiLayerDiff);
})();
