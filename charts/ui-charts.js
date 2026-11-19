/* =========================================================================
 * <ui-chart> 靜態圖表：直式長條（column）、橫條（bar）、折線（line）、圓餅（pie、donut）
 *
 * <ui-chart type="column" title="Employment" series="Male,Female" unit="%">
 *   <chart-row label="2010" values="30,45"></chart-row>
 *   <chart-row label="2020" values="35,50"></chart-row>
 * </ui-chart>
 *
 * - 純 SVG，沒有 Shadow DOM，CSS 由本檔注入，不需要其他函式庫。
 * - 不做提示、點擊、縮放；依元件實際大小重畫，字級用 rem，不會被縮放變形。
 * - 放進 ui-dashboard 的單一格子時會撐滿格子；單獨使用時用 height 決定高度（預設 320px）。
 * - 資料來源：chart-row 子標籤、setData()、src（JSON 網址）、data-id（window 上的物件）。
 * ========================================================================= */
(function () {
  'use strict';
  if (customElements.get('ui-chart')) return;

  const PALETTE = {
    background: '#0C0D0C', base: '#0C0D0C', 'bg-alternative': '#3B2A20', shell: '#C6C7BD', vanilla: '#DBEDD8',
    yellow: '#E3D322', pink: '#FF91D7', red: '#EF6661', green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1',
    violet: '#B484E8', gray: '#86877F', key: '#51DBCF', calm: '#A3C4BC', quiet: '#8EA4DE', playful: '#FFA987',
    urgent: '#FF2E63', energetic: '#B6FF00', dreamy: '#C394CD', salmon: '#FFC88A'
  };
  const SERIES = ['key', 'playful', 'violet', 'green', 'yellow', 'pink', 'blue', 'red', 'indigo', 'salmon', 'calm', 'dreamy'];
  const color = (v, d) => { const t = String(v == null ? '' : v).trim(); return t ? (PALETTE[t.toLowerCase()] || t) : d; };
  const NS = 'http://www.w3.org/2000/svg';
  const FONT = '"Segoe UI","Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif';

  const STYLE_ID = 'ui-chart-style';
  const CSS = `
ui-chart{display:block;position:relative;width:100%;height:var(--uc-h,320px);overflow:hidden;color:#C6C7BD;font-family:${FONT};}
ui-chart[hidden]{display:none !important;}
ui-chart chart-row{display:none;}
ui-chart > svg.uc-svg{position:absolute;left:0;top:0;display:block;}
`;
  function injectStyle() {
    if (document.getElementById(STYLE_ID) || !document.head) return;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- 小工具 ---------- */
  let remPx = 0;
  const REM = () => remPx || (remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
  let mctx = null;
  function tw(text, px, weight) {
    if (!mctx) mctx = document.createElement('canvas').getContext('2d');
    mctx.font = (weight || 400) + ' ' + px + 'px ' + FONT;
    return mctx.measureText(String(text)).width;
  }
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const toNum = (v) => { if (v == null) return null; const t = String(v).trim(); if (!t) return null; const n = parseFloat(t.replace(/,/g, '')); return Number.isFinite(n) ? n : null; };

  /* 顏色工具：任何 CSS 顏色先用 canvas 正規化成 RGB */
  let c2 = null;
  function toRGB(str) {
    if (!c2) c2 = document.createElement('canvas').getContext('2d');
    c2.fillStyle = '#000000';
    c2.fillStyle = String(str);
    const v = c2.fillStyle;
    if (v[0] === '#') return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];
    const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
  }
  const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  const toHex = (rgb) => '#' + hex2(rgb[0]) + hex2(rgb[1]) + hex2(rgb[2]);
  function rgb2hsl(rgb) {
    const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn;
    const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  function hsl2rgb(h, s, l) {
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0) * 255, f(8) * 255, f(4) * 255];
  }
  const lum = (rgb) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
  };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  /* 色塊上的文字：淺色塊用深字，深色塊用淺字 */
  const onColor = (c) => (lum(toRGB(c)) > 0.35 ? '#0C0D0C' : '#DBEDD8');

  /* 以主色算出 n 個漸層色：第一個就是主色，後面色相不變，逐步變亮（或變暗）、飽和度略降 */
  function makeRamp(main, n, dir) {
    const rgb = toRGB(main);
    if (n <= 1) return [toHex(rgb)];
    const [h, s, l] = rgb2hsl(rgb);
    const darker = dir === 'dark' || (dir !== 'light' && l > 0.75);
    const endL = darker ? Math.max(0.12, l * 0.45) : Math.min(0.96, Math.max(l, 0.88));
    const endS = s * 0.6;
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      out.push(i === 0 ? toHex(rgb) : toHex(hsl2rgb(h, s + (endS - s) * t, l + (endL - l) * t)));
    }
    return out;
  }

  function wrapText(text, maxW, px, weight) {
    const lines = [];
    let cur = '';
    String(text).split(/\s+/).filter(Boolean).forEach((w) => {
      const t = cur ? cur + ' ' + w : w;
      if (!cur || tw(t, px, weight) <= maxW) cur = t; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    const out = [];
    lines.forEach((l) => {
      if (tw(l, px, weight) <= maxW) { out.push(l); return; }
      /* 英文單字放不下就不硬拆（拆成 Disag / ree 很難看），標記 overflow 讓呼叫端改用圖例；中日文可以逐字折行 */
      if (!/[\u3000-\u9fff]/.test(l)) { out.overflow = true; out.push(l); return; }
      let c = '';
      for (const ch of l) { if (c && tw(c + ch, px, weight) > maxW) { out.push(c); c = ch; } else c += ch; }
      if (c) out.push(c);
    });
    return out;
  }

  function node(parent, name, attrs) {
    const n = document.createElementNS(NS, name);
    if (attrs) Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(n);
    return n;
  }

  function niceStep(range, count) {
    const raw = range / Math.max(1, count);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    const f = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return f * mag;
  }

  function makeScale(dmin, dmax, o) {
    let lo = o.min != null ? o.min : Math.min(0, dmin);
    let hi = o.max != null ? o.max : Math.max(0, dmax);
    if (!(hi > lo)) hi = lo + 1;
    const step = o.step > 0 ? o.step : niceStep(hi - lo, o.count);
    if (o.min == null) lo = Math.floor(lo / step + 1e-9) * step;
    if (o.max == null) hi = Math.ceil(hi / step - 1e-9) * step;
    if (!(hi > lo)) hi = lo + step;
    const ticks = [];
    for (let i = 0, v = lo; v <= hi + step * 1e-6 && i < 200; i++, v = lo + i * step) ticks.push(+v.toFixed(10));
    return { lo, hi, step, ticks };
  }

  /* 扇形之間的分隔線要和底色一致：往上找第一個不透明的背景色 */
  function bgOf(el) {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && c !== 'transparent' && !/^rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)$/.test(c)) return c;
    }
    return '#0C0D0C';
  }

  /* ---------- 元件 ---------- */
  class UiChart extends HTMLElement {
    connectedCallback() {
      if (this._ready) { this._schedule(); return; }
      this._ready = true;
      injectStyle();
      this.querySelectorAll(':scope > svg.uc-svg').forEach((n) => n.remove());
      this._svg = node(null, 'svg', { class: 'uc-svg' });
      this.appendChild(this._svg);
      const h = this.getAttribute('height');
      if (h) this.style.setProperty('--uc-h', /^\d+(\.\d+)?$/.test(h.trim()) ? h.trim() + 'px' : h);
      this._read();
      this._ro = new ResizeObserver(() => this._schedule());
      this._ro.observe(this);
      const relevant = (m) => {
        if (m.target === this) return m.type === 'attributes' || [...m.addedNodes, ...m.removedNodes].some((n) => !(n.localName === 'svg' && n.classList && n.classList.contains('uc-svg')));
        return m.target.localName === 'chart-row' || (m.target.closest && !m.target.closest('svg.uc-svg') && m.type === 'childList');
      };
      this._mo = new MutationObserver((muts) => {
        if (!muts.some(relevant)) return;
        if (muts.some((m) => m.target === this && m.type === 'attributes' && m.attributeName === 'height')) {
          const hv = this.getAttribute('height');
          if (hv) this.style.setProperty('--uc-h', /^\d+(\.\d+)?$/.test(hv.trim()) ? hv.trim() + 'px' : hv); else this.style.removeProperty('--uc-h');
        }
        this._read();
        this._schedule();
      });
      this._mo.observe(this, { childList: true, subtree: true, attributes: true });
      this._load();
      this._schedule();
    }

    disconnectedCallback() {
      if (this._ro) this._ro.disconnect();
      if (this._mo) this._mo.disconnect();
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = 0;
      this._ready = false;
    }

    /* ---------- 資料 ---------- */
    _read() {
      if (this._manual) return;
      const rows = [...this.querySelectorAll(':scope > chart-row')].map((r) => {
        const raw = r.hasAttribute('values') ? r.getAttribute('values') : r.getAttribute('value');
        return {
          label: r.getAttribute('label') || '',
          values: String(raw == null ? '' : raw).split(/[,|]/).map(toNum),
          color: r.getAttribute('color') || ''
        };
      });
      const sAttr = this.getAttribute('series');
      this._data = { rows, series: sAttr ? sAttr.split(',').map((s) => s.trim()) : [] };
    }

    _normalize(d) {
      d = d || {};
      const list = Array.isArray(d) ? d : (d.rows || []);
      const rows = list.map((r) => {
        const v = r.values != null ? r.values : r.value;
        const arr = Array.isArray(v) ? v : String(v == null ? '' : v).split(/[,|]/);
        return { label: String(r.label == null ? '' : r.label), values: arr.map(toNum), color: r.color || '' };
      });
      const s = Array.isArray(d) ? [] : (Array.isArray(d.series) ? d.series : (d.series ? String(d.series).split(',') : []));
      return { rows, series: s.map((x) => String(x).trim()) };
    }

    /* 用程式設定資料：{ type?, title?, series?, rows: [{label, values}], …其他選項 }；沒寫在屬性上的選項才會採用 */
    setData(d) {
      this._manual = true;
      this._over = (d && !Array.isArray(d)) ? d : {};
      this._data = this._normalize(d);
      this._schedule();
    }

    getData() { return this._data ? JSON.parse(JSON.stringify(this._data)) : { rows: [], series: [] }; }

    render() { this._draw(); }

    _load() {
      const id = this.getAttribute('data-id');
      const src = this.getAttribute('src');
      if (id && window[id]) { this.setData(window[id]); return; }
      if (src) {
        fetch(src).then((r) => r.json()).then((j) => { if (this.isConnected) this.setData(j); })
          .catch((e) => console.warn('[ui-chart] 讀不到 src「' + src + '」：', e));
      }
    }

    _o(name, def) {
      const v = this.getAttribute(name);
      if (v !== null) return v;
      const k = name.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
      if (this._over && this._over[k] != null) return String(this._over[k]);
      return def;
    }
    _n(name, def) { return num(this._o(name, null), def); }
    _b(name, def) { const v = this._o(name, null); return v === null ? def : String(v).trim().toLowerCase() !== 'false'; }
    _nn(name) { const v = this._o(name, null); return v === null || v === '' ? null : num(v, null); }

    _schedule() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => { this._raf = 0; this._draw(); });
    }

    /* ---------- 繪圖 ---------- */
    _draw() {
      if (!this._svg || !this.isConnected) return;
      const W = this.clientWidth;
      const H = this.clientHeight;
      const svg = this._svg;
      svg.replaceChildren();
      if (W < 40 || H < 40) return;
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

      let type = String(this._o('type', 'column')).trim().toLowerCase();
      if (!/^(column|bar|line|pie|donut|stack)$/.test(type)) { console.warn('[ui-chart] type="' + type + '" 只支援 column、bar、line、pie、donut、stack，已改用 column。'); type = 'column'; }
      const rows = (this._data && this._data.rows) || [];
      const names = (this._data && this._data.series) || [];
      const ns = Math.max(1, names.length, ...rows.map((r) => r.values.length));
      const base = this._n('font-size', 1) * REM();
      const C = {
        text: color(this._o('text-color', 'shell')),
        title: color(this._o('title-color', 'vanilla')),
        grid: color(this._o('grid-color', 'bg-alternative')),
        axis: color(this._o('axis-color', 'gray')),
        bg: this._o('bg', null) ? color(this._o('bg', null)) : bgOf(this)
      };
      const F = { title: base * 1.125, label: base * 0.875, tick: base * 0.8125, val: base * 0.8125, legend: base * 0.8125 };
      const ctx = { svg, W, H, type, rows, names, ns, F, C, base, pad: 12 };
      const colors = String(this._o('colors', '')).split(',').map((s) => s.trim()).filter(Boolean);
      /* theme：用一個主色算出漸層色；colors 屬性優先，其次是 theme，最後才是內建依序色。rampN 是目前需要的色數 */
      const themeRaw = String(this._o('theme', '')).trim();
      const theme = themeRaw ? color(themeRaw) : null;
      const rampDir = String(this._o('ramp', 'auto')).trim().toLowerCase();
      let rampKey = '';
      let ramp = null;
      ctx.rampN = ns;
      ctx.colorOf = (i) => {
        if (colors[i]) return color(colors[i]);
        if (theme) {
          if (rampKey !== ctx.rampN + rampDir) { ramp = makeRamp(theme, ctx.rampN, rampDir); rampKey = ctx.rampN + rampDir; }
          return ramp[i % ramp.length];
        }
        return color(SERIES[i % SERIES.length]);
      };
      ctx.dec = this._nn('decimals');
      const unit = this._o('unit', '');
      const prefix = this._o('prefix', '');
      ctx.fmt = (v) => prefix + v.toLocaleString('en-US', { minimumFractionDigits: ctx.dec != null ? ctx.dec : 0, maximumFractionDigits: ctx.dec != null ? ctx.dec : 2 }) + unit;

      this._text = (parent, x, y, str, o) => {
        o = o || {};
        const t = node(parent || svg, 'text', {
          x, y, fill: o.fill || C.text, 'text-anchor': o.anchor || 'start',
          'dominant-baseline': o.baseline || 'alphabetic', 'font-family': FONT
        });
        t.style.fontSize = ((o.size || F.label) / REM()) + 'rem';
        if (o.weight) t.setAttribute('font-weight', o.weight);
        if (o.rotate) t.setAttribute('transform', 'rotate(' + o.rotate + ' ' + x + ' ' + y + ')');
        t.textContent = str;
        return t;
      };

      if (!rows.length) {
        this._text(svg, W / 2, H / 2, this._o('label-empty', 'No data'), { anchor: 'middle', baseline: 'middle', size: F.label });
        return;
      }

      let top = ctx.pad;
      const title = this._o('title', '');
      if (title) {
        const left = String(this._o('title-align', 'center')).toLowerCase() === 'left';
        this._text(svg, left ? ctx.pad : W / 2, top + F.title, title, { anchor: left ? 'start' : 'middle', size: F.title, weight: 700, fill: C.title });
        top += F.title * 1.3 + 8;
      }
      ctx.top = top;

      if (type === 'pie' || type === 'donut') this._pie(ctx, type);
      else if (type === 'stack') this._stack(ctx);
      else this._cartesian(ctx, type);

      this.dispatchEvent(new CustomEvent('ui-chart:render', { bubbles: true, detail: { type, width: W, height: H } }));
    }

    /* 圖例：回傳占用的高度與寬度，並依位置畫出 */
    _legend(ctx, items, pos) {
      const { svg, W, H, F, C, pad } = ctx;
      const sw = 12;
      const rowH = F.legend * 1.7;
      const widths = items.map((it) => sw + 6 + tw(it.name, F.legend));
      if (pos === 'right') {
        const w = Math.max(...widths) + 8;
        return { w, h: 0, draw: (top, bottom) => {
          const total = items.length * rowH;
          let y = top + Math.max(0, (bottom - top - total) / 2);
          const x = W - pad - w;
          items.forEach((it) => {
            node(svg, 'rect', { x, y: y + (rowH - sw) / 2, width: sw, height: sw, rx: 2, fill: it.color });
            this._text(svg, x + sw + 6, y + rowH / 2, it.name, { size: F.legend, baseline: 'central' });
            y += rowH;
          });
        } };
      }
      const maxW = W - pad * 2;
      const lines = [[]];
      let cur = 0;
      items.forEach((it, i) => {
        const w = widths[i] + 18;
        if (cur + w - 18 > maxW && lines[lines.length - 1].length) { lines.push([]); cur = 0; }
        lines[lines.length - 1].push({ it, w: widths[i] });
        cur += w;
      });
      const h = lines.length * rowH + 4;
      return { w: 0, h, draw: (yTop) => {
        lines.forEach((ln, li) => {
          const total = ln.reduce((s, x) => s + x.w, 0) + (ln.length - 1) * 18;
          let x = (W - total) / 2;
          const y = yTop + li * rowH;
          ln.forEach((x2) => {
            node(svg, 'rect', { x, y: y + (rowH - sw) / 2, width: sw, height: sw, rx: 2, fill: x2.it.color });
            this._text(svg, x + sw + 6, y + rowH / 2, x2.it.name, { size: F.legend, baseline: 'central' });
            x += x2.w + 18;
          });
        });
      } };
    }

    _cartesian(ctx, type) {
      const { svg, W, H, rows, ns, F, C, pad } = ctx;
      const horiz = type === 'bar';
      const names = ctx.names.length ? ctx.names : Array.from({ length: ns }, (_, i) => 'S' + (i + 1));
      const vary = ns === 1 && this._b('vary', false);
      ctx.rampN = vary ? rows.length : ns;

      /* 數值軸 */
      let dmin = Infinity;
      let dmax = -Infinity;
      rows.forEach((r) => r.values.forEach((v) => { if (v != null) { dmin = Math.min(dmin, v); dmax = Math.max(dmax, v); } }));
      if (!Number.isFinite(dmin)) { dmin = 0; dmax = 1; }
      const showVals = this._b('show-values', false);
      if (showVals && dmin < 0 && this._nn('y-min') == null) dmin -= (dmax - dmin) * 0.08;
      const sc = makeScale(dmin, dmax, { min: this._nn('y-min'), max: this._nn('y-max'), step: this._n('y-step', 0), count: this._n('ticks', 5) });
      const stepDec = ((String(sc.step).split('.')[1]) || '').length;
      const tickFmt = (v) => {
        const d = ctx.dec != null ? ctx.dec : Math.min(4, stepDec);
        return this._o('prefix', '') + v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) + this._o('unit', '');
      };
      const tickW = Math.max(...sc.ticks.map((t) => tw(tickFmt(t), F.tick)));

      /* 圖例 */
      const legendPos = String(this._o('legend', ns > 1 || vary ? 'bottom' : 'none')).toLowerCase();
      const legItems = vary ? rows.map((r, i) => ({ name: r.label, color: r.color ? color(r.color) : ctx.colorOf(i) })) : names.map((n, i) => ({ name: n, color: ctx.colorOf(i) }));
      let L = pad;
      let R = pad;
      let T = ctx.top;
      let B = pad;
      let leg = null;
      if (legendPos !== 'none') {
        leg = this._legend(ctx, legItems, legendPos);
        if (legendPos === 'right') R += leg.w + 12;
        else if (legendPos === 'top') { T += leg.h; } else B += leg.h;
      }
      const xTitle = this._o('x-title', '');
      const yTitle = this._o('y-title', '');
      if (showVals && !horiz) T += F.val * 1.5;
      if (xTitle) B += F.label * 1.5;
      if (yTitle) L += F.label * 1.5;

      /* 類別標籤 */
      const labels = rows.map((r) => r.label);
      const maxLabW = Math.max(...labels.map((s) => tw(s, F.label)));
      let rotate = 0;
      let skip = 1;
      let catBlock;
      if (horiz) {
        const cap = Math.max(60, (W - L - R) * 0.4);
        catBlock = Math.min(maxLabW, cap) + 10;
        L += catBlock;
        R += tickW / 2;
        B += F.tick * 1.8;
      } else {
        L += tickW + 8;
        R += 4;
        const plotW0 = W - L - R;
        const band0 = plotW0 / rows.length;
        const rot = String(this._o('label-rotate', 'auto')).toLowerCase();
        if (rot === 'auto') rotate = maxLabW > band0 - 6 ? -35 : 0;
        else rotate = num(rot, 0);
        if (rotate) {
          const rad = Math.abs(rotate) * Math.PI / 180;
          if (rotate < 0) L += Math.max(0, labels[0] ? Math.min(maxLabW, tw(labels[0], F.label)) * Math.cos(rad) - band0 * 0.5 - 4 : 0);
          B += maxLabW * Math.sin(rad) + F.label * Math.cos(rad) + 8;
          skip = Math.max(1, Math.ceil((F.label * 1.3) / (band0 * Math.max(0.2, Math.sin(rad)))));
        } else {
          B += F.label * 1.4 + 4;
          skip = Math.max(1, Math.ceil((maxLabW + 6) / band0));
        }
      }
      const px = L;
      const py = T;
      const pw = Math.max(20, W - L - R);
      const ph = Math.max(20, H - T - B);
      const n = rows.length;
      const band = (horiz ? ph : pw) / n;
      const vPos = horiz
        ? (v) => px + (v - sc.lo) / (sc.hi - sc.lo) * pw
        : (v) => py + ph - (v - sc.lo) / (sc.hi - sc.lo) * ph;

      /* 格線與刻度 */
      const grid = this._b('grid', true);
      sc.ticks.forEach((t) => {
        const p = vPos(t);
        if (grid) {
          if (horiz) node(svg, 'line', { x1: p, x2: p, y1: py, y2: py + ph, stroke: C.grid, 'stroke-width': 1 });
          else node(svg, 'line', { x1: px, x2: px + pw, y1: p, y2: p, stroke: C.grid, 'stroke-width': 1 });
        }
        if (horiz) this._text(svg, p, py + ph + F.tick * 1.4, tickFmt(t), { anchor: 'middle', size: F.tick });
        else this._text(svg, px - 8, p, tickFmt(t), { anchor: 'end', baseline: 'central', size: F.tick });
      });
      /* 零線 */
      const z = vPos(Math.max(sc.lo, Math.min(sc.hi, 0)));
      if (horiz) node(svg, 'line', { x1: z, x2: z, y1: py, y2: py + ph, stroke: C.axis, 'stroke-width': 1.5 });
      else node(svg, 'line', { x1: px, x2: px + pw, y1: z, y2: z, stroke: C.axis, 'stroke-width': 1.5 });

      /* 類別標籤 */
      rows.forEach((r, i) => {
        if (i % skip) return;
        const c = (i + 0.5) * band;
        if (horiz) {
          let s = r.label;
          while (s.length > 1 && tw(s, F.label) > catBlock - 10) s = s.slice(0, -1);
          if (s !== r.label) s = s.slice(0, -1) + '…';
          this._text(svg, px - 8, py + c, s, { anchor: 'end', baseline: 'central', size: F.label });
        } else if (rotate) {
          this._text(svg, px + c, py + ph + F.label * 1.3, r.label, { anchor: rotate < 0 ? 'end' : 'start', size: F.label, rotate });
        } else {
          this._text(svg, px + c, py + ph + F.label * 1.3, r.label, { anchor: 'middle', size: F.label });
        }
      });

      /* 軸標題 */
      if (xTitle) this._text(svg, px + pw / 2, H - pad - (leg && legendPos === 'bottom' ? leg.h : 0) - F.label * 0.2, xTitle, { anchor: 'middle', size: F.label });
      if (yTitle) this._text(svg, pad + F.label * 0.6, py + ph / 2, yTitle, { anchor: 'middle', size: F.label, rotate: -90 });

      const val = (v, x, y, anchor, baseline) => this._text(svg, x, y, ctx.fmt(v), { anchor, baseline, size: F.val });

      if (type === 'line') {
        const lw = this._n('line-width', 2.5);
        const markers = this._b('markers', true);
        for (let s = 0; s < ns; s++) {
          const col = ctx.colorOf(s);
          let d = '';
          let pen = false;
          const pts = [];
          rows.forEach((r, i) => {
            const v = r.values[s];
            if (v == null) { pen = false; return; }
            const x = px + (i + 0.5) * band;
            const y = vPos(v);
            d += (pen ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
            pen = true;
            pts.push({ x, y, v });
          });
          if (d) node(svg, 'path', { d, fill: 'none', stroke: col, 'stroke-width': lw, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
          pts.forEach((p) => {
            if (markers) node(svg, 'circle', { cx: p.x, cy: p.y, r: lw * 1.4, fill: col });
            if (showVals) val(p.v, p.x, p.y - lw * 1.4 - 5, 'middle', 'alphabetic');
          });
        }
      } else {
        const gap = Math.min(0.9, Math.max(0, this._n('bar-gap', 0.3)));
        const group = Math.min(band * (1 - gap), ns * 72);
        const bw = group / ns - (ns > 1 ? 2 : 0);
        rows.forEach((r, i) => {
          const start = (i + 0.5) * band - group / 2;
          for (let s = 0; s < ns; s++) {
            const v = r.values[s];
            if (v == null) continue;
            const col = vary ? (r.color ? color(r.color) : ctx.colorOf(i)) : (ns === 1 && r.color ? color(r.color) : ctx.colorOf(s));
            const off = start + s * (group / ns) + (ns > 1 ? 1 : 0);
            const a = vPos(v);
            if (horiz) {
              const x = Math.min(a, z);
              const w = Math.max(Math.abs(a - z), v === 0 ? 0 : 1);
              node(svg, 'rect', { x, y: py + off, width: w, height: bw, fill: col, rx: 2 });
              if (showVals && v !== 0) val(v, v >= 0 ? x + w + 6 : x - 6, py + off + bw / 2, v >= 0 ? 'start' : 'end', 'central');
            } else {
              const y = Math.min(a, z);
              const h = Math.max(Math.abs(a - z), v === 0 ? 0 : 1);
              node(svg, 'rect', { x: px + off, y, width: bw, height: h, fill: col, rx: 2 });
              if (showVals && v !== 0 && tw(ctx.fmt(v), F.val) <= bw + (ns === 1 ? band * 0.5 : 6)) val(v, px + off + bw / 2, v >= 0 ? y - 5 : y + h + F.val + 2, 'middle', 'alphabetic');
            }
          }
        });
      }
      if (leg) {
        if (legendPos === 'right') leg.draw(T, H - B);
        else if (legendPos === 'top') leg.draw(ctx.top);
        else leg.draw(H - pad - leg.h + 4);
      }
    }

    /* 堆疊橫條：每列一條，各段是各系列的值；預設換算成各列合計 100%，色塊內顯示數值，欄名排在第一條上方 */
    _stack(ctx) {
      const { svg, W, H, rows, ns, F, C, pad } = ctx;
      const names = ctx.names.length ? ctx.names : Array.from({ length: ns }, (_, i) => 'S' + (i + 1));
      ctx.rampN = ns;
      const normalize = this._b('normalize', true);
      const showVals = this._b('show-values', true);
      let legendMode = String(this._o('legend', 'header')).toLowerCase();
      const totals = rows.map((r) => r.values.reduce((a, v) => a + (v > 0 ? v : 0), 0));
      const maxTotal = Math.max(...totals, 1e-9);
      const lf = F.label * 1.1;
      const maxLab = Math.max(...rows.map((r) => tw(r.label, lf)));
      const labW = Math.min(maxLab, Math.max(60, W * 0.35));
      const L = pad + (labW ? labW + 14 : 0);
      const pw = Math.max(40, W - L - pad);
      const segs = rows.map((r, ri) => {
        const full = normalize ? 1 : totals[ri] / maxTotal;
        let x = L;
        return Array.from({ length: ns }, (_, s) => {
          const v = r.values[s];
          if (!(v > 0) || !totals[ri]) return null;
          const w = pw * full * (v / totals[ri]);
          const seg = { s, v, x, w };
          x += w;
          return seg;
        });
      });

      /* 欄名放在第一條上方；放不下（段太窄、折行太多、第一列缺值）時改用圖例 */
      const hf = F.label * 1.05;
      let headers = null;
      if (legendMode === 'header') {
        const first = segs[0] || [];
        const lines = names.map((n, s) => (first[s] && first[s].w >= 36 ? wrapText(n, first[s].w - 8, hf, 700) : null));
        if (lines.every((l) => l && l.length <= 4 && !l.overflow)) headers = lines;
        else legendMode = 'bottom';
      }
      let top = ctx.top;
      let bottom = H - pad;
      let right = W;
      let leg = null;
      let headerH = 0;
      if (headers) headerH = Math.max(...headers.map((l) => l.length)) * hf * 1.25 + 12;
      else if (legendMode !== 'none') {
        leg = this._legend(ctx, names.map((n, i) => ({ name: n, color: ctx.colorOf(i) })), legendMode);
        if (legendMode === 'right') right -= leg.w + 12;
        else if (legendMode === 'top') top += leg.h;
        else bottom -= leg.h;
      }
      const barsTop = top + headerH;
      const ph = Math.max(20, bottom - barsTop);
      const band = ph / rows.length;
      const gap = Math.min(0.8, Math.max(0, this._n('bar-gap', 0.3)));
      const barH = Math.min(band * (1 - gap), 110);

      if (headers) {
        const bgRGB = toRGB(C.bg);
        headers.forEach((ls, s) => {
          const seg = segs[0][s];
          const col = ctx.colorOf(s);
          const fill = contrast(toRGB(col), bgRGB) >= 3 ? col : C.text;
          const yBase = barsTop - 12 - (ls.length - 1) * hf * 1.25;
          ls.forEach((t, li) => this._text(svg, seg.x + seg.w / 2, yBase + li * hf * 1.25 + hf * 0.8, t, { anchor: 'middle', size: hf, weight: 700, fill }));
        });
      }
      rows.forEach((r, ri) => {
        const y = barsTop + band * ri + (band - barH) / 2;
        let lab = r.label;
        while (lab.length > 1 && tw(lab, lf) > labW) lab = lab.slice(0, -1);
        if (lab !== r.label) lab = lab.slice(0, -1) + '…';
        this._text(svg, pad + labW, y + barH / 2, lab, { anchor: 'end', baseline: 'central', size: lf });
        const row = segs[ri].filter(Boolean);
        row.forEach((g, gi) => {
          const col = r.color && ns === 1 ? color(r.color) : ctx.colorOf(g.s);
          node(svg, 'rect', { x: g.x, y, width: g.w + (gi < row.length - 1 ? 0.6 : 0), height: barH, fill: col });
          const t = ctx.fmt(g.v);
          if (showVals && tw(t, F.val * 1.2) + 8 <= g.w) this._text(svg, g.x + g.w / 2, y + barH / 2, t, { anchor: 'middle', baseline: 'central', size: F.val * 1.2, fill: onColor(col) });
        });
      });
      if (leg) {
        if (legendMode === 'right') leg.draw(barsTop, bottom);
        else if (legendMode === 'top') leg.draw(ctx.top);
        else leg.draw(H - pad - leg.h + 4);
      }
    }

    _pie(ctx, type) {
      const { svg, W, H, rows, F, C, pad } = ctx;
      ctx.rampN = rows.length;
      const slices = rows.map((r, i) => ({ label: r.label, v: r.values[0], color: r.color ? color(r.color) : ctx.colorOf(i) }))
        .filter((s) => s.v != null && s.v > 0);
      if (!slices.length) { this._text(svg, W / 2, H / 2, this._o('label-empty', 'No data'), { anchor: 'middle', baseline: 'middle', size: F.label }); return; }
      if (this._b('sort', false)) slices.sort((a, b) => b.v - a.v);
      const sum = slices.reduce((s, x) => s + x.v, 0);
      const showPct = this._b('show-percent', true);
      const showVal = this._b('show-values', false);
      const pctDec = ctx.dec != null ? ctx.dec : 0;
      slices.forEach((s) => {
        s.pct = (s.v / sum * 100).toFixed(pctDec) + '%';
        const parts = [];
        if (showVal && !(showPct && ctx.fmt(s.v) === s.pct)) parts.push(ctx.fmt(s.v));
        if (showPct) parts.push(s.pct);
        s.text = s.label + (parts.length ? '  ' + parts.join(' · ') : '');
      });
      let legendPos = String(this._o('legend', 'none')).toLowerCase();
      const maxLab = Math.max(...slices.map((s) => tw(s.text, F.label)));
      const holeAttr = this._nn('hole');
      const hole = Math.min(0.9, Math.max(0, holeAttr != null ? holeAttr : (type === 'donut' ? 0.55 : 0)));

      let outside = true;
      let top = ctx.top;
      let bottom = H - pad;
      let right = W - pad;
      let leg = null;
      const mk = (useText) => {
        if (legendPos === 'none') return;
        leg = this._legend(ctx, slices.map((s) => ({ name: useText ? s.text : s.label, color: s.color })), legendPos);
        if (legendPos === 'right') right -= leg.w + 12;
        else if (legendPos === 'top') top += leg.h;
        else bottom -= leg.h;
      };
      mk();
      let R = Math.min((right - pad - 2 * (maxLab + 34)) / 2, (bottom - top) / 2 - 10);
      if (R < 40) {
        outside = false;
        if (legendPos === 'none') legendPos = 'bottom';
        top = ctx.top; bottom = H - pad; right = W - pad; mk(true);
        R = Math.min((right - pad) / 2, (bottom - top) / 2) - 4;
      }
      R = Math.max(20, R);
      const cx = (pad + right) / 2;
      const cy = (top + bottom) / 2;
      const start = this._n('start-angle', 0) * Math.PI / 180 - Math.PI / 2;
      const r0 = R * hole;
      const P = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      let a0 = start;
      slices.forEach((s) => {
        const ang = s.v / sum * Math.PI * 2;
        s.a0 = a0;
        s.a1 = a0 + ang;
        s.mid = a0 + ang / 2;
        a0 += ang;
      });
      slices.forEach((s) => {
        let d;
        const full = s.a1 - s.a0 >= Math.PI * 2 - 1e-6;
        if (full) {
          d = 'M' + (cx - R) + ' ' + cy + 'A' + R + ' ' + R + ' 0 1 1 ' + (cx + R) + ' ' + cy + 'A' + R + ' ' + R + ' 0 1 1 ' + (cx - R) + ' ' + cy + 'Z';
          if (r0 > 0) d += 'M' + (cx - r0) + ' ' + cy + 'A' + r0 + ' ' + r0 + ' 0 1 0 ' + (cx + r0) + ' ' + cy + 'A' + r0 + ' ' + r0 + ' 0 1 0 ' + (cx - r0) + ' ' + cy + 'Z';
        } else {
          const large = s.a1 - s.a0 > Math.PI ? 1 : 0;
          const [x1, y1] = P(R, s.a0);
          const [x2, y2] = P(R, s.a1);
          if (r0 > 0) {
            const [x3, y3] = P(r0, s.a1);
            const [x4, y4] = P(r0, s.a0);
            d = 'M' + x1 + ' ' + y1 + 'A' + R + ' ' + R + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 + 'L' + x3 + ' ' + y3 + 'A' + r0 + ' ' + r0 + ' 0 ' + large + ' 0 ' + x4 + ' ' + y4 + 'Z';
          } else {
            d = 'M' + cx + ' ' + cy + 'L' + x1 + ' ' + y1 + 'A' + R + ' ' + R + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 + 'Z';
          }
        }
        node(svg, 'path', { d, fill: s.color, 'fill-rule': 'evenodd', stroke: C.bg, 'stroke-width': slices.length > 1 ? 2 : 0, 'stroke-linejoin': 'round' });
      });

      const center = this._o('center', '');
      if (center && r0 > 0) this._text(svg, cx, cy, center, { anchor: 'middle', baseline: 'central', size: Math.min(F.title * 1.4, r0 * 0.5), weight: 700, fill: C.title });

      if (outside) {
        /* 外側標籤：左右各自由上而下排開，避免重疊，再拉折線連到扇形 */
        const side = (right2) => slices.filter((s) => (Math.cos(s.mid) >= 0) === right2).sort((a, b) => Math.sin(a.mid) - Math.sin(b.mid));
        const minGap = F.label * 1.4;
        [true, false].forEach((isRight) => {
          const list = side(isRight);
          list.forEach((s) => { s.ly = cy + Math.sin(s.mid) * (R + 18); });
          for (let i = 1; i < list.length; i++) if (list[i].ly - list[i - 1].ly < minGap) list[i].ly = list[i - 1].ly + minGap;
          const lim = bottom - 4;
          const over = list.length ? list[list.length - 1].ly - lim : 0;
          if (over > 0) {
            list[list.length - 1].ly -= over;
            for (let i = list.length - 2; i >= 0; i--) if (list[i + 1].ly - list[i].ly < minGap) list[i].ly = list[i + 1].ly - minGap;
          }
          list.forEach((s) => {
            const [sx, sy] = P(R * 0.98, s.mid);
            const [ex, ey] = P(R + 8, s.mid);
            const lx = cx + (isRight ? 1 : -1) * (R + 22);
            node(svg, 'polyline', { points: sx + ',' + sy + ' ' + ex + ',' + ey + ' ' + lx + ',' + s.ly, fill: 'none', stroke: C.axis, 'stroke-width': 1 });
            this._text(svg, lx + (isRight ? 4 : -4), s.ly, s.text, { anchor: isRight ? 'start' : 'end', baseline: 'central', size: F.label });
          });
        });
      }
      if (leg) {
        if (legendPos === 'right') leg.draw(top, bottom);
        else if (legendPos === 'top') leg.draw(ctx.top);
        else leg.draw(H - pad - leg.h + 4);
      }
    }
  }

  customElements.define('ui-chart', UiChart);
  customElements.define('chart-row', class extends HTMLElement {});
  window.UiChart = { version: '1.1.0', palette: SERIES.slice() };
})();
