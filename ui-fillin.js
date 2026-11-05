(() => {
  'use strict';
  if (customElements.get('ui-fillin')) return;

  // 品牌色票：所有 *-color 屬性與 line-color 都可直接使用這些名稱（不分大小寫）
  const BRAND = {
    base: '#0C0D0C',
    shell: '#C6C7BD',
    lavender: '#B484E8',
    sky: '#5DBAE8',
    warning: '#EF6661',
    salmon: '#F79C40',
    ocean: '#5DBAE8',
    safe: '#71CD76',
    teal: '#71CD76',
    vanilla: '#DBEDD8',
    yellow: '#E3D322',
    bluebell: '#778CE1',
    special: '#71CD76',
    info: '#778CE1',
    indigo: '#778CE1',
    pink: '#FF91D7',
    orange: '#F79C40',
    /* 新色票 */
    red: '#EF6661',
    green: '#71CD76',
    blue: '#5DBAE8',
    violet: '#B484E8',
    gray: '#86877F'
  };
  // 別名：bg / background 都指向底層背景色 base
  const BRAND_ALIAS = { bg: 'base', background: 'base' };
  const MIN_ALPHA = 0.78;

  const BRAND_VARS = Object.keys(BRAND).map((k) => `--uf-c-${k}:${BRAND[k]};`).join('');

  const CSS = `
ui-fillin{
  ${BRAND_VARS}
  --uf-bg:var(--uf-c-base);--uf-text:var(--uf-c-shell);--uf-accent:var(--uf-c-shell);
  --uf-ok:var(--uf-c-safe);--uf-bad:var(--uf-c-warning);
  --uf-blank:var(--uf-accent);--uf-picked:var(--uf-blank);--uf-menu:var(--uf-bg);
  --uf-hover:var(--uf-accent);--uf-head:var(--uf-accent);--uf-btn:var(--uf-accent);--uf-alert:var(--uf-accent);
  --uf-line-rgb:198,199,189;--uf-line-a:0.78;
  --uf-line:rgba(var(--uf-line-rgb),var(--uf-line-a));
  --uf-sans:"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif;
  --uf-serif:Georgia,"Noto Serif TC","PMingLiU",serif;
  --uf-font-size:1.125rem;
  --uf-line-height:1.4;
  --uf-root-padding:8px;--uf-main-padding:8px;--uf-blank-padding:2px 6px;
  --uf-menu-padding:6px;--uf-option-padding:4px 10px;--uf-ans-padding:8px;
  --uf-btn-padding:3px 10px;--uf-btn-font-size:calc(var(--uf-font-size) * 0.8);--uf-btn-radius:5px;
  --uf-blank-max-width:20rem;--uf-menu-max-width:24rem;--uf-menu-max-height:60vh;
  --uf-border-width:2px;--uf-radius:6px;
  display:block;position:relative;box-sizing:border-box;width:100%;
  padding:var(--uf-root-padding);border:var(--uf-border-width) solid var(--uf-line);background:var(--uf-bg);color:var(--uf-text);
  font:var(--uf-font-size)/var(--uf-line-height) var(--uf-sans);
}
ui-fillin main-box{display:block;box-sizing:border-box;padding:var(--uf-main-padding);font-family:var(--uf-serif);font-size:calc(var(--uf-font-size) * 1.05);line-height:var(--uf-line-height)}
ui-fillin main-box p{margin:0 0 6px}
ui-fillin main-box p:last-child{margin-bottom:0}
ui-fillin main-box ul,ui-fillin main-box ol{margin:0;padding:0;list-style:none}
ui-fillin main-box li{margin:0 0 6px}
ui-fillin main-box li:last-child{margin-bottom:0}
ui-fillin main-box:empty,ui-fillin ans-box:empty{display:none}

ui-fillin .uf-blank{display:inline-flex;align-items:center;gap:4px;box-sizing:border-box;max-width:var(--uf-blank-max-width);margin:0 2px;padding:var(--uf-blank-padding);
  vertical-align:baseline;white-space:nowrap;appearance:none;background:transparent;color:var(--uf-blank);border:1px solid var(--uf-blank);border-radius:var(--uf-radius);
  font:var(--uf-font-size)/var(--uf-line-height) var(--uf-sans);cursor:pointer}
ui-fillin .uf-blank .uf-no{font-weight:700}
ui-fillin .uf-blank .uf-no::after{content:"."}
ui-fillin .uf-blank[data-no-dot="1"] .uf-no::after{content:""}
ui-fillin .uf-blank .uf-val{overflow:hidden;text-overflow:ellipsis}
ui-fillin .uf-blank .uf-mark{font-weight:700}
ui-fillin .uf-blank .uf-mark:empty{display:none}
ui-fillin .uf-blank:not(:disabled):hover,ui-fillin .uf-blank.is-open{box-shadow:inset 0 0 0 1px var(--uf-blank)}
ui-fillin .uf-blank.is-picked{background:var(--uf-picked);border-color:var(--uf-picked);color:var(--uf-bg)}
ui-fillin .uf-blank.is-ok{background:transparent;color:var(--uf-ok);border-color:var(--uf-ok)}
ui-fillin .uf-blank.is-bad{background:transparent;color:var(--uf-bad);border-color:var(--uf-bad)}
ui-fillin .uf-blank:disabled{cursor:default}
ui-fillin .uf-blank:focus-visible,ui-fillin .uf-btn:focus-visible,ui-fillin .uf-opt:focus-visible{outline:2px solid var(--uf-accent);outline-offset:2px}

ui-fillin .uf-blank.uf-tblank{cursor:text}
ui-fillin .uf-blank.uf-tblank:focus-within{box-shadow:inset 0 0 0 1px var(--uf-blank)}
ui-fillin .uf-tfield{appearance:none;background:transparent;border:0;outline:0;color:inherit;font:inherit;padding:0;min-width:3ch;text-align:inherit}
ui-fillin .uf-tfield:disabled{color:inherit;opacity:1;-webkit-text-fill-color:currentColor}
ui-fillin .uf-blank.uf-tblank .uf-hint-ans{margin-left:6px;font-weight:400;opacity:0.85}
ui-fillin .uf-blank.uf-has-hint{white-space:normal;max-width:none;vertical-align:text-bottom}

ui-fillin .uf-menu{position:fixed;z-index:1000;display:flex;flex-direction:column;gap:2px;box-sizing:border-box;min-width:9rem;
  max-width:min(var(--uf-menu-max-width),calc(100vw - 16px));max-height:var(--uf-menu-max-height);overflow:auto;padding:var(--uf-menu-padding);
  background:var(--uf-menu);color:var(--uf-text);border:1px solid var(--uf-accent);border-radius:var(--uf-radius);font:var(--uf-font-size)/var(--uf-line-height) var(--uf-sans)}
ui-fillin .uf-menu[hidden]{display:none}
ui-fillin .uf-hint{padding:0 10px;color:var(--uf-accent)}
ui-fillin .uf-opt{display:flex;align-items:baseline;gap:10px;width:100%;box-sizing:border-box;padding:var(--uf-option-padding);
  appearance:none;background:transparent;color:var(--uf-text);border:0;border-radius:4px;font:inherit;text-align:left;cursor:pointer}
ui-fillin .uf-opt .uf-key{flex:none;font-weight:700;color:var(--uf-accent)}
ui-fillin .uf-opt.is-on{color:var(--uf-accent);box-shadow:inset 0 0 0 1px var(--uf-accent)}
ui-fillin .uf-opt.is-on::after{content:"✓";margin-left:auto;font-weight:700}
ui-fillin .uf-opt:hover,ui-fillin .uf-opt.is-on:hover{background:var(--uf-hover);color:var(--uf-bg)}
ui-fillin .uf-opt:hover .uf-key{color:var(--uf-bg)}

ui-fillin ans-box{display:block;box-sizing:border-box;margin-top:0;padding:var(--uf-ans-padding);border-top:1px dashed var(--uf-line)}
ui-fillin ans-box[hidden]{display:none}
ui-fillin .uf-scroll{overflow-x:auto}
ui-fillin .uf-table{width:100%;border-collapse:collapse}
ui-fillin .uf-table th,ui-fillin .uf-table td{min-width:4.5rem;padding:4px 10px;line-height:var(--uf-line-height);border:1px solid var(--uf-line);text-align:center;vertical-align:middle}
ui-fillin .uf-table th{color:var(--uf-head);font-weight:700}
ui-fillin .uf-table td.is-ok{background:var(--uf-ok);color:var(--uf-bg)}
ui-fillin .uf-table td.is-bad{background:var(--uf-bad);color:var(--uf-bg)}
ui-fillin .uf-table .uf-mark{margin-left:6px;font-weight:700}
ui-fillin .uf-bar{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
ui-fillin .uf-btn{appearance:none;padding:var(--uf-btn-padding);border:1px solid var(--uf-btn);border-radius:var(--uf-btn-radius);background:transparent;color:var(--uf-text);font-family:var(--uf-sans);font-size:var(--uf-btn-font-size);cursor:pointer}
ui-fillin .uf-btn.is-primary{background:var(--uf-btn);color:var(--uf-bg)}
ui-fillin .uf-btn.is-ghost{border-color:var(--uf-line)}
ui-fillin .uf-btn:disabled{cursor:default;background:transparent;color:var(--uf-line);border-color:var(--uf-line)}

ui-fillin .uf-alerts{margin-bottom:6px}
ui-fillin .uf-alerts:empty{display:none}
ui-fillin .uf-alert{margin:0;padding:6px 10px;border:1px solid var(--uf-alert);border-radius:var(--uf-radius);background:var(--uf-alert);color:var(--uf-bg);font:inherit}
ui-fillin .uf-btn,ui-fillin .uf-opt{line-height:var(--uf-line-height)}
ui-fillin .uf-alert.is-bad{background:var(--uf-bad);border-color:var(--uf-bad);color:var(--uf-bg)}
`;
  const styleEl = document.createElement('style');
  styleEl.id = 'ui-fillin-style';
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  const PADS = ['root', 'main', 'blank', 'menu', 'option', 'ans', 'btn'];
  // 可設定色彩的部位：屬性名稱為「部位-color」，例如 accent-color="sky"
  const COLORS = ['bg', 'text', 'accent', 'ok', 'bad', 'blank', 'picked', 'menu', 'hover', 'head', 'btn', 'alert'];
  const LABELS = {
    'label-correct': '正確',
    'label-incorrect': '錯誤',
    'label-unanswered': '未作答',
    'label-multi-hint': '可複選',
    'label-submit': '提交答案',
    'label-reset': '重做',
    'label-submitted': '已批改，請查看每題的對錯。',
    'label-no-source': '找不到題目來源區塊，請檢查 main-box 的 source 屬性。',
    'label-no-blanks': '題幹中沒有可用的空格，選擇題格式為 {*正確答案|選項二|選項三}，輸入題格式為 {答案1|答案2}。',
    'label-correct-answer-prefix': '正確答案：'
  };
  const CJK_SEQ = '甲乙丙丁戊己庚辛壬癸';

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  function hexToRgb(hex) {
    let h = String(hex).replace('#', '');
    if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('');
    h = h.slice(0, 6);
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // 品牌色名稱解析：支援「sky」或「sky/0.9」（斜線後為透明度，低於 0.78 自動提高到 0.78）
  function resolveBrand(v) {
    if (v == null) return null;
    const m = /^\s*([a-z][a-z-]*)\s*(?:\/\s*(\d*\.?\d+)\s*)?$/i.exec(String(v));
    if (!m) return null;
    let key = m[1].toLowerCase();
    key = BRAND_ALIAS[key] || key;
    const hex = BRAND[key];
    if (!hex) return null;
    let a = m[2] != null ? parseFloat(m[2]) : null;
    if (a != null) a = Math.min(1, Math.max(MIN_ALPHA, a));
    return { name: key, hex, rgb: hexToRgb(hex), alpha: a };
  }

  // padding 屬性值：只接受 px 或純數字，最多四個值
  function normPad(v) {
    if (v == null) return null;
    const t = String(v).trim().split(/\s+/);
    if (!t[0] || t.length > 4) return null;
    const out = [];
    for (const x of t) {
      const m = /^(\d+(?:\.\d+)?)(px)?$/.exec(x);
      if (!m) return null;
      out.push(m[1] + 'px');
    }
    return out.join(' ');
  }

  // font-size 屬性值：純數字或 rem，一律換算成 rem
  function normFont(v) {
    if (v == null) return null;
    const m = /^\s*(\d+(?:\.\d+)?)(rem)?\s*$/.exec(String(v));
    return m && parseFloat(m[1]) > 0 ? m[1] + 'rem' : null;
  }

  // line-height 屬性值：純數字，限制 <=1.5（符合排版規範）
  function normLH(v) {
    if (v == null) return null;
    const m = /^\s*(\d+(?:\.\d+)?)\s*$/.exec(String(v));
    if (!m) return null;
    const n = parseFloat(m[1]);
    if (!(n > 0)) return null;
    return String(Math.min(n, 1.5));
  }

  // 寬度/高度屬性值：rem、vh 或純數字（視為 rem）
  function normLen(v, unit) {
    if (v == null) return null;
    const m = /^\s*(\d+(?:\.\d+)?)(rem|vh|px)?\s*$/.exec(String(v));
    if (!m) return null;
    return m[1] + (m[2] || unit);
  }

  // 色彩屬性值：品牌色名稱優先，其次才是 rgba / hex / hsl / CSS 色名
  // 注意：orange、pink 等與 CSS 內建色名重複時，一律採用品牌色
  function normColor(v) {
    if (v == null) return null;
    const s = String(v).trim();
    if (!s) return null;
    const b = resolveBrand(s);
    if (b) return b.alpha == null ? b.hex : `rgba(${b.rgb.join(',')},${b.alpha})`;
    const rgbaM = /^rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(s);
    if (rgbaM) {
      const a = rgbaM[1] != null ? parseFloat(rgbaM[1]) : 1;
      return a < MIN_ALPHA ? null : s;
    }
    if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s)) return s;
    if (/^hsla?\(/i.test(s)) return s;
    if (/^[a-z]+$/i.test(s)) return s;
    return null;
  }

  // 選項代號：alpha=A/B/C、digit=1/2/3、cjk=甲/乙/丙
  function optionKey(style, i) {
    if (style === 'digit') return String(i + 1);
    if (style === 'cjk') return CJK_SEQ[i] || String(i + 1);
    return String.fromCharCode(65 + (i % 26));
  }

  // 洗牌（Fisher-Yates），優先使用 crypto 亂數
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      let j;
      if (window.crypto && window.crypto.getRandomValues) {
        const u = new Uint32Array(1);
        window.crypto.getRandomValues(u);
        j = u[0] % (i + 1);
      } else {
        j = Math.floor(Math.random() * (i + 1));
      }
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function parseBody(body) {
    const items = [];
    let cur = [];
    for (let i = 0; i < body.length; i++) {
      const c = body[i];
      if (c === '\\' && i + 1 < body.length) {
        cur.push([body[++i], true]);
      } else if (c === '|') {
        items.push(cur);
        cur = [];
      } else {
        cur.push([c, false]);
      }
    }
    items.push(cur);
    const isWs = (x) => !x[1] && /\s/.test(x[0]);
    const opts = [];
    for (const it of items) {
      let a = 0;
      let b = it.length;
      while (a < b && isWs(it[a])) a++;
      while (b > a && isWs(it[b - 1])) b--;
      let ok = false;
      if (a < b && !it[a][1] && it[a][0] === '*') {
        ok = true;
        a++;
        while (a < b && isWs(it[a])) a++;
      }
      const text = it.slice(a, b).map((x) => x[0]).join('');
      if (text) opts.push({ text, ok });
    }
    return opts;
  }

  function parseTextAnswers(body) {
    const items = [];
    let cur = [];
    for (let i = 0; i < body.length; i++) {
      const c = body[i];
      if (c === '\\' && i + 1 < body.length) {
        cur.push(body[++i]);
      } else if (c === '|') {
        items.push(cur);
        cur = [];
      } else {
        cur.push(c);
      }
    }
    items.push(cur);
    return items
      .map((chars) => chars.join('').trim())
      .filter((s) => s.length > 0);
  }

  function fullWidthToHalf(s) {
    return s.replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
      .replace(/　/g, ' ');
  }

  const BLOCK_SRC = '\\{((?:\\\\[\\s\\S]|[^{}\\\\])*)\\}';

  class MainBox extends HTMLElement {}
  class AnsBox extends HTMLElement {}

  class UiFillin extends HTMLElement {
    static get observedAttributes() {
      return ['font-size', 'line-height', 'blank-max-width', 'menu-max-width', 'menu-max-height', 'border-width', 'radius', 'btn-font-size', 'btn-radius']
        .concat(PADS.map((p) => p + '-padding'))
        .concat(COLORS.map((c) => c + '-color'))
        .concat(['line-color', 'line-alpha']);
    }

    // 品牌色票（唯讀副本），例如 customElements.get('ui-fillin').brand.sky
    static get brand() {
      return Object.assign({}, BRAND);
    }

    // 可設定色彩的部位清單
    static get colorParts() {
      return COLORS.concat(['line']);
    }

    // 把品牌色名稱轉成 CSS 色值，無法辨識時回傳 null
    static resolveColor(v) {
      return normColor(v);
    }

    constructor() {
      super();
      this._qs = [];
      this._cells = [];
      this._done = false;
      this._ready = false;
      this._openQ = null;
      this._srcFrag = null; // 原始（未挖空）內容的備份，供 reshuffle-on-reset 重建用
      this._onDown = (e) => {
        if (!this._openQ) return;
        const t = e.target;
        if (this._menu.contains(t)) return;
        if (t.closest && t.closest('.uf-blank') && this.contains(t)) return;
        this.closeMenu();
      };
      this._onKey = (e) => {
        if (e.key === 'Escape') this.closeMenu();
      };
      this._onPlace = () => this._place();
    }

    _lab(name) {
      const v = this.getAttribute(name);
      return v != null && v !== '' ? v : LABELS[name];
    }

    _warnColor(name, v) {
      if (v != null && String(v).trim() !== '' && window.console) {
        console.warn(`[ui-fillin] ${name}="${v}" 無法辨識，已改用預設色。可用的品牌色：${Object.keys(BRAND).join(', ')}`);
      }
    }

    attributeChangedCallback(name) {
      if (name === 'font-size') {
        const f = normFont(this.getAttribute(name));
        this.style.setProperty('--uf-font-size', f || '1.125rem');
        return;
      }
      if (name === 'line-height') {
        const v = normLH(this.getAttribute(name));
        this.style.setProperty('--uf-line-height', v || '1.4');
        return;
      }
      if (name === 'blank-max-width') {
        const v = normLen(this.getAttribute(name), 'rem');
        this.style.setProperty('--uf-blank-max-width', v || '20rem');
        return;
      }
      if (name === 'menu-max-width') {
        const v = normLen(this.getAttribute(name), 'rem');
        this.style.setProperty('--uf-menu-max-width', v || '24rem');
        return;
      }
      if (name === 'menu-max-height') {
        const v = normLen(this.getAttribute(name), 'vh');
        this.style.setProperty('--uf-menu-max-height', v || '60vh');
        return;
      }
      if (name === 'border-width') {
        const v = normLen(this.getAttribute(name), 'px');
        this.style.setProperty('--uf-border-width', v || '2px');
        return;
      }
      if (name === 'radius') {
        const v = normLen(this.getAttribute(name), 'px');
        this.style.setProperty('--uf-radius', v || '6px');
        return;
      }
      if (name === 'btn-font-size') {
        const f = normFont(this.getAttribute(name));
        if (f) this.style.setProperty('--uf-btn-font-size', f);
        else this.style.removeProperty('--uf-btn-font-size');
        return;
      }
      if (name === 'btn-radius') {
        const v = normLen(this.getAttribute(name), 'px');
        if (v) this.style.setProperty('--uf-btn-radius', v);
        else this.style.removeProperty('--uf-btn-radius');
        return;
      }
      if (name === 'line-color') {
        // 接受「r,g,b」、品牌色名稱（可帶 /透明度）或 hex
        const v = this.getAttribute(name);
        let rgb = null;
        let a = null;
        const m = v && /^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/.exec(v);
        if (m) {
          rgb = [m[1], m[2], m[3]];
        } else if (v) {
          const b = resolveBrand(v);
          if (b) {
            rgb = b.rgb;
            a = b.alpha;
          } else if (/^\s*#([0-9a-f]{3}|[0-9a-f]{6})\s*$/i.test(v)) {
            rgb = hexToRgb(v.trim());
          } else {
            this._warnColor(name, v);
          }
        }
        this.style.setProperty('--uf-line-rgb', rgb ? rgb.join(',') : '198,199,189');
        // 名稱內帶的透明度只在沒有另外設定 line-alpha 時生效
        if (!this.hasAttribute('line-alpha')) {
          if (a != null) this.style.setProperty('--uf-line-a', String(a));
          else this.style.removeProperty('--uf-line-a');
        }
        return;
      }
      if (name === 'line-alpha') {
        const a = parseFloat(this.getAttribute(name));
        this.style.setProperty('--uf-line-a', (a >= MIN_ALPHA ? Math.min(a, 1) : MIN_ALPHA));
        return;
      }
      if (name.endsWith('-color')) {
        const key = name.replace('-color', '');
        if (COLORS.includes(key)) {
          const raw = this.getAttribute(name);
          const v = normColor(raw);
          if (v) this.style.setProperty('--uf-' + key, v);
          else {
            this.style.removeProperty('--uf-' + key);
            this._warnColor(name, raw);
          }
        }
        return;
      }
      const key = name.replace('-padding', '');
      const v = normPad(this.getAttribute(name));
      if (v) this.style.setProperty('--uf-' + key + '-padding', v);
      else this.style.removeProperty('--uf-' + key + '-padding');
    }

    connectedCallback() {
      document.addEventListener('pointerdown', this._onDown, true);
      document.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onPlace);
      window.addEventListener('scroll', this._onPlace, true);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._init(), { once: true });
      } else {
        this._init();
      }
    }

    disconnectedCallback() {
      document.removeEventListener('pointerdown', this._onDown, true);
      document.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onPlace);
      window.removeEventListener('scroll', this._onPlace, true);
      this.closeMenu();
    }

    _init() {
      if (this._ready || !this.isConnected) return;
      this._ready = true;

      this._alerts = el('div', 'uf-alerts');
      this.insertBefore(this._alerts, this.firstChild);
      this._menu = el('div', 'uf-menu');
      this._menu.hidden = true;
      this.appendChild(this._menu);

      this._main = this.querySelector('main-box');
      this._ans = this.querySelector('ans-box');
      if (!this._ans) {
        this._ans = document.createElement('ans-box');
        this.insertBefore(this._ans, this._menu);
      }
      // 布林屬性 hide-answer-table：隱藏文末的「全題總表」，僅保留提交／重做按鈕
      this._hideTable = this.hasAttribute('hide-answer-table');

      const sid = this._main && this._main.getAttribute('source');
      const src = sid ? document.getElementById(sid) : null;
      if (!src) {
        this._alert(this._lab('label-no-source'), 'bad');
        return;
      }
      this._srcEl = src;

      this._build(true);
      if (!this._qs.length) {
        this._alert(this._lab('label-no-blanks'), 'bad');
        return;
      }
      this._renderAns();

      this._main.addEventListener('click', (e) => {
        const b = e.target.closest('.uf-blank');
        if (!b || b.classList.contains('uf-tblank') || this._done) return;
        const q = this._qs[+b.dataset.k];
        if (this._openQ === q) this.closeMenu();
        else this._openMenu(q);
      });
      this._main.addEventListener('input', (e) => {
        const inp = e.target.closest('.uf-tfield');
        if (!inp) return;
        const wrap = inp.closest('.uf-blank');
        const q = this._qs[+wrap.dataset.k];
        q.value = inp.value;
        this._paintText(q);
        this._paintAns(q.no - 1);
        this.dispatchEvent(new CustomEvent('fillin-change', {
          bubbles: true,
          detail: { no: q.no, value: q.value }
        }));
      });
      this._menu.addEventListener('click', (e) => {
        const b = e.target.closest('.uf-opt');
        if (!b || !this._openQ) return;
        this._pick(this._openQ, +b.dataset.i, b);
      });
      this._ans.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]');
        if (!b) return;
        if (b.dataset.act === 'submit') this.submit();
        else this.reset();
      });
    }

    _build(first) {
      const base = first ? this._srcEl : this._srcFrag;
      const frag = document.createDocumentFragment();
      Array.from(base.childNodes).forEach((n) => frag.appendChild(n.cloneNode(true)));
      if (first) {
        this._srcFrag = frag.cloneNode(true); // 備份：挖空前、洗牌前的原稿
      }
      // 布林屬性 random：來源內的清單項目（li）隨機換序，題號之後依新順序自動編
      if (this.hasAttribute('random')) {
        frag.querySelectorAll('ul,ol').forEach((list) => {
          const lis = Array.from(list.children).filter((c) => c.tagName === 'LI');
          shuffle(lis).forEach((li) => list.appendChild(li));
        });
      }
      const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      // 元件層級屬性 mode="text" 切換成「文字輸入比對」模式；預設 mode="choice"（選擇題）
      const textMode = this.getAttribute('mode') === 'text';

      this._qs = [];
      nodes.forEach((node) => {
        const s = node.nodeValue;
        if (s.indexOf('{') < 0) return;
        const re = new RegExp(BLOCK_SRC, 'g');
        const out = document.createDocumentFragment();
        let last = 0;
        let hit = false;
        let m;
        while ((m = re.exec(s))) {
          let made = null;
          if (textMode) {
            const answers = parseTextAnswers(m[1]);
            if (answers.length < 1) continue;
            made = this._makeTextBlank(answers);
          } else {
            const opts = parseBody(m[1]);
            if (opts.length < 2) continue;
            made = this._makeBlank(opts);
          }
          hit = true;
          if (m.index > last) out.appendChild(document.createTextNode(s.slice(last, m.index)));
          out.appendChild(made);
          last = re.lastIndex;
        }
        if (!hit) return;
        if (last < s.length) out.appendChild(document.createTextNode(s.slice(last)));
        node.parentNode.replaceChild(out, node);
      });

      this._main.textContent = '';
      this._main.appendChild(frag);
      if (first) {
        this._srcEl.textContent = '';
        this._srcEl.hidden = true;
      }
    }

    _makeBlank(opts) {
      const k = this._qs.length;
      const ok = [];
      opts.forEach((o, i) => { if (o.ok) ok.push(i); });
      const q = { mode: 'choice', no: k + 1, options: opts, ok, multi: ok.length > 1, sel: [], btn: null };
      const b = el('button', 'uf-blank');
      b.type = 'button';
      b.dataset.k = k;
      if (this.hasAttribute('no-number-dot')) b.dataset.noDot = '1';
      if (this.hasAttribute('hide-number')) {
        b.append(el('span', 'uf-val'), el('span', 'uf-mark'));
      } else {
        b.append(el('span', 'uf-no', String(q.no)), el('span', 'uf-val'), el('span', 'uf-mark'));
      }
      q.btn = b;
      this._qs.push(q);
      this._paint(q);
      return b;
    }

    _makeTextBlank(answers) {
      const k = this._qs.length;
      const q = { mode: 'text', no: k + 1, answers, value: '', input: null, wrap: null, mark: null };
      const wrap = el('span', 'uf-blank uf-tblank');
      wrap.dataset.k = k;
      if (this.hasAttribute('no-number-dot')) wrap.dataset.noDot = '1';
      if (!this.hasAttribute('hide-number')) wrap.appendChild(el('span', 'uf-no', String(q.no)));

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'uf-tfield';
      input.autocomplete = 'off';
      input.spellcheck = false;
      const maxLen = answers.reduce((m, a) => Math.max(m, a.length), 0);
      input.size = Math.max(3, maxLen + 1);
      q.input = input;
      wrap.appendChild(input);

      const mark = el('span', 'uf-mark');
      q.mark = mark;
      wrap.appendChild(mark);

      q.wrap = wrap;
      this._qs.push(q);
      this._paint(q);
      return wrap;
    }

    _judge(q) {
      if (q.mode === 'text') {
        const norm = this.hasAttribute('normalize-width') ? fullWidthToHalf : (s) => s;
        const v = norm(q.value.trim());
        if (!v) return false;
        return q.answers.some((a) => norm(a) === v); // 永遠區分大小寫（case sensitive）
      }
      return q.sel.length > 0 && q.sel.length === q.ok.length && q.sel.every((i) => q.ok.includes(i));
    }

    _selText(q) {
      if (q.mode === 'text') return q.value;
      return q.sel.map((i) => q.options[i].text).join(' / ');
    }

    _paint(q) {
      if (q.mode === 'text') return this._paintText(q);
      const done = this._done;
      const picked = q.sel.length > 0;
      const res = done ? this._judge(q) : null;
      q.btn.querySelector('.uf-val').textContent = picked ? this._selText(q) : (done ? this._lab('label-unanswered') : '▾');
      q.btn.querySelector('.uf-mark').textContent = done ? (res ? this._lab('label-correct') : this._lab('label-incorrect')) : '';
      q.btn.classList.toggle('is-picked', picked);
      q.btn.classList.toggle('is-ok', done && res === true);
      q.btn.classList.toggle('is-bad', done && res === false);
      q.btn.disabled = done;
    }

    _paintText(q) {
      const done = this._done;
      const picked = q.value.trim().length > 0;
      const res = done ? this._judge(q) : null;
      q.wrap.classList.toggle('is-picked', picked && !done);
      q.wrap.classList.toggle('is-ok', done && res === true);
      q.wrap.classList.toggle('is-bad', done && res === false);
      q.input.disabled = done;
      q.mark.textContent = done ? (res ? this._lab('label-correct') : (picked ? this._lab('label-incorrect') : this._lab('label-unanswered'))) : '';
      const old = q.wrap.querySelector('.uf-hint-ans');
      if (old) old.remove();
      if (done && !res && this.hasAttribute('show-answer-on-wrong')) {
        const hint = el('span', 'uf-hint-ans', this._lab('label-correct-answer-prefix') + q.answers.join(' / '));
        q.wrap.appendChild(hint);
        // 提示文字可能很長（尤其英文答案），這格暫時解除緊湊模式的不換行／最大寬度限制，
        // 避免內容撐破外框邊界、疊到下一個挖空格（與容器高度無關，是外框本身的 CSS 限制）
        q.wrap.classList.add('uf-has-hint');
      } else {
        q.wrap.classList.remove('uf-has-hint');
      }
    }

    _renderAns() {
      const a = this._ans;
      a.textContent = '';
      a.hidden = false;

      if (!this._hideTable) {
        const scroll = el('div', 'uf-scroll');
        const table = el('table', 'uf-table');
        const tb = el('tbody');
        const r1 = el('tr');
        const r2 = el('tr');
        this._cells = [];
        this._qs.forEach((q) => {
          r1.appendChild(el('th', null, q.no + '.'));
          const td = el('td');
          r2.appendChild(td);
          this._cells.push(td);
        });
        tb.append(r1, r2);
        table.appendChild(tb);
        scroll.appendChild(table);
        a.appendChild(scroll);
      } else {
        this._cells = [];
      }

      const bar = el('div', 'uf-bar');
      this._submitBtn = el('button', 'uf-btn is-primary', this._lab('label-submit'));
      this._submitBtn.type = 'button';
      this._submitBtn.dataset.act = 'submit';
      const resetBtn = el('button', 'uf-btn is-ghost', this._lab('label-reset'));
      resetBtn.type = 'button';
      resetBtn.dataset.act = 'reset';
      bar.append(this._submitBtn, resetBtn);

      a.appendChild(bar);
      if (!this._hideTable) this._qs.forEach((q, k) => this._paintAns(k));
    }

    _picked(q) {
      return q.mode === 'text' ? q.value.trim().length > 0 : q.sel.length > 0;
    }

    _paintAns(k) {
      if (this._hideTable) return;
      const q = this._qs[k];
      const td = this._cells[k];
      td.textContent = '';
      td.className = '';
      const picked = this._picked(q);
      td.appendChild(document.createTextNode(picked ? this._selText(q) : (this._done ? this._lab('label-unanswered') : '')));
      if (this._done) {
        const res = this._judge(q);
        td.classList.add(res ? 'is-ok' : 'is-bad');
        td.appendChild(el('span', 'uf-mark', res ? this._lab('label-correct') : this._lab('label-incorrect')));
      }
    }

    _openMenu(q) {
      this.closeMenu();
      const m = this._menu;
      const style = this.getAttribute('option-style') || 'alpha'; // alpha | digit | cjk
      m.textContent = '';
      if (q.multi) m.appendChild(el('div', 'uf-hint', this._lab('label-multi-hint')));
      q.options.forEach((o, i) => {
        const b = el('button', 'uf-opt' + (q.sel.includes(i) ? ' is-on' : ''));
        b.type = 'button';
        b.dataset.i = i;
        b.append(el('span', 'uf-key', optionKey(style, i)), el('span', 'uf-text', o.text));
        m.appendChild(b);
      });
      m.hidden = false;
      this._openQ = q;
      q.btn.classList.add('is-open');
      this._place();
    }

    closeMenu() {
      if (!this._menu) return;
      if (this._openQ) this._openQ.btn.classList.remove('is-open');
      this._openQ = null;
      this._menu.hidden = true;
    }

    _place() {
      const q = this._openQ;
      if (!q) return;
      const m = this._menu;
      const r = q.btn.getBoundingClientRect();
      m.style.left = '0px';
      m.style.top = '0px';
      const mw = m.offsetWidth;
      const mh = m.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const gap = 6;
      let top = r.bottom + gap;
      if (top + mh > vh - 8) {
        if (r.top - gap - mh >= 8) top = r.top - gap - mh;
        else top = Math.max(8, vh - 8 - mh);
      }
      const left = Math.min(Math.max(8, r.left), Math.max(8, vw - 8 - mw));
      m.style.left = left + 'px';
      m.style.top = top + 'px';
    }

    _pick(q, i, optEl) {
      if (q.multi) {
        const at = q.sel.indexOf(i);
        if (at >= 0) q.sel.splice(at, 1);
        else q.sel.push(i);
        q.sel.sort((a, b) => a - b);
        optEl.classList.toggle('is-on', at < 0);
      } else {
        q.sel = [i];
      }
      this._paint(q);
      this._paintAns(q.no - 1);
      if (!q.multi) this.closeMenu();
      else this._place();
      this.dispatchEvent(new CustomEvent('fillin-change', {
        bubbles: true,
        detail: { no: q.no, selected: q.sel.map((x) => q.options[x].text) }
      }));
    }

    submit() {
      if (this._done || !this._qs.length) return;
      this.closeMenu();
      this._done = true;
      const results = this._qs.map((q) => ({
        no: q.no,
        correct: this._judge(q),
        answered: this._picked(q)
      }));
      this._qs.forEach((q, k) => { this._paint(q); this._paintAns(k); });
      if (this._submitBtn) this._submitBtn.disabled = true;
      this._writeResults(results);
      this._alert(this._lab('label-submitted'), 'info');
      this.dispatchEvent(new CustomEvent('fillin-submit', { bubbles: true, detail: { results } }));
    }

    reset() {
      if (!this._srcFrag) return;
      this.closeMenu();
      this._done = false;
      this._alerts.replaceChildren();
      this._clearResults();

      if (this.hasAttribute('reshuffle-on-reset') && this.hasAttribute('random')) {
        this._build(false);
        this._renderAns();
      } else {
        if (!this._qs.length) return;
        this._qs.forEach((q, k) => {
          if (q.mode === 'text') { q.value = ''; q.input.value = ''; }
          else q.sel = [];
          this._paint(q);
          this._paintAns(k);
        });
        if (this._submitBtn) this._submitBtn.disabled = false;
      }
      this.dispatchEvent(new CustomEvent('fillin-reset', { bubbles: true }));
    }

    _resultsBox() {
      const id = this.getAttribute('results-id');
      return id ? document.getElementById(id) : null;
    }

    // 結果寫入位置：優先用結果區塊內帶 data-uf-results 的元素，否則在區塊末端附加一個容器。
    // 區塊內其他 HTML 與其他元件一律不動。
    _slot(box, create) {
      let slot = box.querySelector('[data-uf-results]');
      if (slot) return slot;
      slot = Array.from(box.children).find((c) => c.hasAttribute('data-uf-auto')) || null;
      if (!slot && create) {
        slot = el('div', 'uf-results');
        slot.setAttribute('data-uf-auto', '');
        box.appendChild(slot);
      }
      return slot;
    }

    _clearResults() {
      const box = this._resultsBox();
      if (!box) return;
      const slot = this._slot(box, false);
      if (!slot) return;
      if (slot.hasAttribute('data-uf-auto')) slot.remove();
      else slot.replaceChildren();
    }

    _writeResults(results) {
      const box = this._resultsBox();
      if (!box) return;
      const items = results.map((r) => {
        const state = r.correct ? this._lab('label-correct') : (r.answered ? this._lab('label-incorrect') : this._lab('label-unanswered'));
        const item = el('div', 'uf-result', r.no + '. ' + state);
        item.dataset.no = r.no;
        item.dataset.state = r.correct ? 'correct' : 'incorrect';
        item.dataset.answered = r.answered ? 'true' : 'false';
        return item;
      });
      this._slot(box, true).replaceChildren(...items);
    }

    _alert(msg, type) {
      const bad = type === 'bad';
      const a = el('div', 'alert uf-alert ' + (bad ? 'alert-danger is-bad' : 'alert-info'), msg);
      a.setAttribute('role', 'alert');
      this._alerts.replaceChildren(a);
    }
  }

  customElements.define('main-box', MainBox);
  customElements.define('ans-box', AnsBox);
  customElements.define('ui-fillin', UiFillin);
})();
/* ── 色名標籤 <c-blue>、<c-pink> 等：所有元件共用同一份，頁面上只注入一次 ── */
(function () {
  'use strict';
  if (typeof document === 'undefined' || document.getElementById('ui-color-tags')) return;
  var COLORS = {
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7',
    red: '#EF6661', orange: '#F79C40', green: '#71CD76', blue: '#5DBAE8',
    indigo: '#778CE1', violet: '#B484E8', gray: '#86877F'
  };
  /* 舊色名：對應到最接近的新色，與 chk/ui-check.js、inc/palette.php 一致 */
  var ALIASES = {
    lavender: 'violet', sky: 'blue', ocean: 'blue', stone: 'blue', info: 'indigo', bluebell: 'indigo',
    warning: 'red', salmon: 'orange', safe: 'green', teal: 'green', special: 'green',
    focus: 'vanilla', attention: 'yellow'
  };
  var css = [];
  Object.keys(COLORS).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[k] + '}'); });
  Object.keys(ALIASES).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[ALIASES[k]] + '}'); });
  var s = document.createElement('style');
  s.id = 'ui-color-tags';
  s.textContent = css.join('\n');
  (document.head || document.documentElement).appendChild(s);
  if (typeof window !== 'undefined' && !window.UiColorTags) {
    window.UiColorTags = { colors: COLORS, aliases: ALIASES };
  }
})();
