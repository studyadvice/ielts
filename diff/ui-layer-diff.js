/*!
 * <ui-layer-diff> 逐層改寫比對元件 v1.2.0
 * v1.2.0（11-09-26）
 *   - 新增 note-hide-initial：載入時先不顯示說明（右側說明欄與句子下方的 note），
 *     第一次切換層之後才顯示，之後回到起始層也會照常顯示。
 *   - 新增 note-placeholder：說明隱藏期間，右側說明欄顯示的文字，預設空白。
 *   - note-hide-initial 期間，進度條（progress）也保持全空，第一次切換層之後才填色。
 * v1.1.0（11-09-26）
 *   - mode 新增 comparison：左側為比對方框，右側說明欄隨層切換，顯示該層的 note。
 *     mode 可寫多個值，例如 mode="comparison auto"。
 *   - comparison 模式下 width 改為左側方框寬度（預設 50%），元件本身佔滿容器。
 *   - <ui-layer> 新增 note-tpl：填 <template> 的 id，右側顯示其 HTML，優先於 note。
 *   - 說明欄外觀屬性：note-font-size、note-color、note-bg、note-border、note-padding、
 *     note-gap、note-align、note-title、note-title-size、note-title-color。
 *   - 修正：theme 值前後的空白會自動去除；無效的主題名稱會在主控台提示，再退回 dark。
 *   - 修正：theme 寫 key、key-deep、calm、quiet、playful、urgent、shell 時未套用，退回 dark。
 */
(function () {
  'use strict';

  if (window.customElements && customElements.get('ui-layer-diff')) return;

  var PALETTE = {
    bg: '#0C0D0C', shell: '#C6C7BD',
    vanilla: '#DBEDD8', yellow: '#E3D322',
    indigo: '#778CE1', pink: '#FF91D7',
    orange: '#FFA987',
    /* 新色票 */
    red: '#EF6661',
    green: '#71CD76',
    blue: '#5DBAE8',
    violet: '#B484E8',
    gray: '#86877F',
    /* 新增色 */
    key: '#51DBCF',
    'key-deep': '#51DBCF',
    calm: '#A3C4BC',
    quiet: '#8EA4DE',
    playful: '#FFA987',
    urgent: '#FF2E63',
    energetic: '#B6FF00',
    dreamy: '#DE8EC9',
    'bg-alternative': '#3B2A20'
  };

  var THEMES = {
    dark: { bg: '#0C0D0C', text: '#C6C7BD', border: '#5DBAE8', accent: '#5DBAE8', add: '#71CD76', del: '#EF6661' },
    light: { bg: '#DBEDD8', text: '#0C0D0C', border: '#71CD76', accent: '#71CD76', add: '#778CE1', del: '#EF6661' }
  };
  /* v1.1：17 個品牌色都可當主題（原本 key、calm、quiet 等未建立，會退回 dark） */
  Object.keys(PALETTE).forEach(function (n) {
    if (n === 'bg') return;
    THEMES[n] = { bg: '#0C0D0C', text: '#C6C7BD', border: PALETTE[n], accent: PALETTE[n], add: '#71CD76', del: '#EF6661' };
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
    'ui-layer-diff .uld-bar-tick{position:absolute;top:0;bottom:0;width:2px;margin:0 0 0 -1px;background:var(--uld-bg)}',
    /* v1.1 comparison 排版：左側方框，右側說明欄 */
    'ui-layer-diff .uld-cmp{display:grid;grid-template-columns:minmax(0,var(--uld-lw,50%)) minmax(0,1fr);gap:var(--uld-ng,24px);align-items:var(--uld-na,stretch)}',
    'ui-layer-diff .uld-side{box-sizing:border-box;background:var(--uld-nbg);color:var(--uld-nc);border:var(--uld-nb);padding:var(--uld-np);font-family:system-ui,-apple-system,"Segoe UI","Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;font-size:var(--uld-nfs);line-height:1.6;text-align:left}',
    'ui-layer-diff .uld-side-stage{display:grid}',
    'ui-layer-diff .uld-sl{grid-area:1 / 1;visibility:hidden;opacity:0;transform:translateX(8px);transition:opacity .3s ease,transform .3s ease,visibility 0s linear .3s}',
    'ui-layer-diff .uld-sl.is-active{visibility:visible;opacity:1;transform:none;transition:opacity .3s ease,transform .3s ease,visibility 0s linear 0s}',
    'ui-layer-diff .uld-sl-title{display:block;margin:0 0 8px 0;font-size:var(--uld-ntfs);font-weight:700;color:var(--uld-ntc)}',
    'ui-layer-diff .uld-sl-body > :first-child{margin-top:0}',
    'ui-layer-diff .uld-sl-body > :last-child{margin-bottom:0}',
    /* v1.2 note-hide-initial：說明先隱藏，直到第一次切換層 */
    'ui-layer-diff.uld-nh .uld-note{visibility:hidden}',
    'ui-layer-diff .uld-sl-ph{color:var(--uld-nc)}'
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
    'progress-from', 'progress-to', 'progress-height', 'result-gap',
    'note-font-size', 'note-color', 'note-bg', 'note-border', 'note-padding', 'note-gap', 'note-align',
    'note-title-size', 'note-title-color'];
  var BUILD_ATTRS = ['controls', 'legend', 'show-del', 'add-label', 'del-label',
    'show-result', 'result-label', 'progress', 'progress-position', 'progress-ticks', 'note-title', 'note-placeholder', 'note-hide-initial'];

  /* 讀取 note-tpl 指向的內容：<template> 取其 HTML，其他元素取 innerHTML，找不到回傳 null */
  function tplHtml(id) {
    id = (id || '').trim().replace(/^#/, '');
    if (!id) return null;
    var el = document.getElementById(id);
    if (!el) return null;
    return el.innerHTML;
  }

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
      this._noteShown = false;
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
      if (name === 'mode') { this._playing = this._isAuto(); this._applyStyle(); this._rebuild(); return; }
      if (BUILD_ATTRS.indexOf(name) > -1) this._rebuild();
    }

    /* public api */

    get layers() { return (this._layers || []).slice(); }
    set layers(v) {
      this._layers = (v || []).map(function (x) {
        return typeof x === 'string'
          ? { text: x, label: '', note: '', noteHtml: null }
          : { text: x.text || '', label: x.label || '', note: x.note || '',
              noteHtml: x.noteHtml != null ? String(x.noteHtml) : tplHtml(x.noteTpl) };
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

    /* mode 可寫多個值，以空白分隔，例如 mode="comparison auto" */
    _modes() { return (this.getAttribute('mode') || '').toLowerCase().split(/[\s,]+/); }
    _isAuto() { return this._modes().indexOf('auto') > -1; }
    _isCmp() { return this._modes().indexOf('comparison') > -1; }

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
          note: el.getAttribute('note') || '',
          noteHtml: tplHtml(el.getAttribute('note-tpl'))
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
      var tn = (this.getAttribute('theme') || 'dark').trim().toLowerCase() || 'dark';
      var t = THEMES[tn];
      if (!t) {
        console.warn('[ui-layer-diff] theme="' + tn + '" 不是有效的主題，已改用 dark。');
        t = THEMES.dark;
      }
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
      if (this._isCmp()) {
        /* comparison：元件佔滿容器，width 改為左側方框的寬度，預設 50% */
        s.setProperty('--uld-w', '100%');
        s.setProperty('--uld-lw', w ? withUnit(w, 'px', 50) : '50%');
      } else {
        s.setProperty('--uld-w', w ? withUnit(w, 'px', 100) : '100%');
      }
      s.setProperty('--uld-nfs', withUnit(this.getAttribute('note-font-size'), 'rem', 1.125));
      s.setProperty('--uld-nc', color(this.getAttribute('note-color'), t.text));
      s.setProperty('--uld-nbg', color(this.getAttribute('note-bg'), t.bg));
      s.setProperty('--uld-nb', parseBorder(this.getAttribute('note-border'), t.border));
      s.setProperty('--uld-np', parsePadding(this.getAttribute('note-padding')));
      s.setProperty('--uld-ng', withUnit(this.getAttribute('note-gap'), 'px', 24));
      var na = (this.getAttribute('note-align') || '').trim().toLowerCase();
      s.setProperty('--uld-na', na === 'top' ? 'start' : na === 'center' ? 'center' : 'stretch');
      s.setProperty('--uld-ntfs', withUnit(this.getAttribute('note-title-size'), 'rem', 1.25));
      s.setProperty('--uld-ntc', color(this.getAttribute('note-title-color'), t.accent));
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
      var cmp = this._isCmp();
      var stage = L.map(function (l, i) {
        var inner = i === 0 ? esc(l.text) : diffHtml(L[i - 1].text, l.text, showDel);
        /* comparison 模式的 note 移到右側說明欄，左側不再重複 */
        var note = l.note && !cmp ? '<div class="uld-note">' + esc(l.note) + '</div>' : '';
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

      var box = '<div class="uld-box">' +
        '<div class="uld-head"><span class="uld-label"></span><span class="uld-count"></span></div>' +
        barTop + '<div class="uld-stage">' + stage + '</div>' + barBottom + foot + '</div>';

      if (!cmp) { this.innerHTML = box; return; }

      /* 右側說明欄：note-tpl 的 HTML 優先，其次 note 文字；note-title 控制是否顯示層標題 */
      var showTitle = this._flag('note-title', true);
      var side = L.map(function (l, i) {
        var title = showTitle ? '<span class="uld-sl-title">' + esc(l.label || ('第 ' + (i + 1) + ' 層')) + '</span>' : '';
        var body = l.noteHtml != null ? l.noteHtml : (l.note ? '<p>' + esc(l.note) + '</p>' : '');
        return '<div class="uld-sl">' + title + '<div class="uld-sl-body">' + body + '</div></div>';
      }).join('');
      /* 說明隱藏期間顯示的佔位內容，未設定 note-placeholder 時為空白 */
      var ph = '<div class="uld-sl uld-sl-ph"><div class="uld-sl-body">' +
        esc(this.getAttribute('note-placeholder') || '') + '</div></div>';
      this.innerHTML = '<div class="uld-cmp">' + box +
        '<aside class="uld-side"><div class="uld-side-stage">' + side + ph + '</div></aside></div>';
    }

    _show(i, source) {
      var L = this._layers, n = L ? L.length : 0;
      if (!n) return;
      i = Math.max(0, Math.min(n - 1, i));
      this._idx = i;
      var layerEls = this.querySelectorAll('.uld-layer');
      Array.prototype.forEach.call(layerEls, function (el, k) { el.classList.toggle('is-active', k === i); });
      /* note-hide-initial：載入時不顯示說明，任何一次切換層（手動、自動、API）之後才顯示 */
      if (source) this._noteShown = true;
      var hideNote = this._flag('note-hide-initial', false) && !this._noteShown;
      this.classList.toggle('uld-nh', hideNote);
      Array.prototype.forEach.call(this.querySelectorAll('.uld-sl:not(.uld-sl-ph)'), function (el, k) { el.classList.toggle('is-active', !hideNote && k === i); });
      var phEl = this.querySelector('.uld-sl-ph');
      if (phEl) phEl.classList.toggle('is-active', hideNote);
      var label = L[i].label || ('第 ' + (i + 1) + ' 層');
      var lb = this.querySelector('.uld-label'), ct = this.querySelector('.uld-count');
      if (lb) lb.textContent = label;
      if (ct) ct.textContent = (i + 1) + ' / ' + n;
      Array.prototype.forEach.call(this.querySelectorAll('.uld-dot'), function (d, k) { d.classList.toggle('is-active', k === i); });
      var barEl = this.querySelector('.uld-bar');
      /* note-hide-initial 期間進度條保持全空，第一次切換層之後才填色 */
      if (barEl) barEl.style.setProperty('--uld-p', hideNote ? '0%' : ((i + 1) / n * 100) + '%');
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
/* ── 色名標籤 <c-blue>、<c-key> 等：所有元件共用同一份，頁面上只注入一次 ── */
(function () {
  'use strict';
  if (typeof document === 'undefined' || document.getElementById('ui-color-tags')) return;
  var COLORS = { shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', orange:'#FFA987', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', 'key-deep':'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#DE8EC9' };
  var css = [];
  Object.keys(COLORS).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[k] + '}'); });
  var s = document.createElement('style'); s.id = 'ui-color-tags'; s.textContent = css.join('\n');
  (document.head || document.documentElement).appendChild(s);
  if (typeof window !== 'undefined' && !window.UiColorTags) { window.UiColorTags = { colors: COLORS }; }
})();
