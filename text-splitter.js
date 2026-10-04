(() => {
  'use strict';

  /* ── 內建主題：只存 accent + color，variant 負責推導樣式 ── */
  const BUILT_IN_THEMES = {
    'before-after': [
      { accent: '#F08080', color: '#0C0D0C' },
      { accent: '#299459', color: '#0C0D0C' },
    ],
    'compare': [
      { accent: '#95c9de', color: '#0C0D0C' },
      { accent: '#C3A5E5', color: '#0C0D0C' },
    ],
    'wrong-right': [
      { accent: '#F08080', color: '#0C0D0C' },
      { accent: '#0ABDC6', color: '#0C0D0C' },
    ],
    'split': [
      { accent: '#C6C7BD', color: '#0C0D0C' },
      { accent: '#C6C7BD', color: '#0C0D0C' },
    ],
  };

  const DEFAULT_CONFIG = {
    mode      : 'sentence',
    delimiter : '|||',
    trimEmpty : true,
    balance   : 'char',
    fontSize  : null,
    color     : null,
    theme     : null,
    variant   : 'solid',
    themes    : {},
  };

  let _cfg = { ...DEFAULT_CONFIG };

  /* ── hex → "r,g,b" ── */
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `${r},${g},${b}`;
  }

  /* ── 清除可能殘留的舊樣式 ── */
  function clearThemeStyles(el) {
    el.style.background  = '';
    el.style.border      = '';
    el.style.borderLeft  = '';
    el.style.borderTop   = '';
    el.style.color       = '';
  }

  /* ── 依 variant 套用樣式 ── */
  function applyVariant(el, entry, variant) {
    clearThemeStyles(el);

    /* 舊格式相容（直接含 background 屬性） */
    if (entry.background) {
      el.style.background = entry.background;
      if (entry.color)      el.style.color      = entry.color;
      if (entry.borderLeft) el.style.borderLeft = entry.borderLeft;
      return;
    }

    const { accent, color = '#0C0D0C' } = entry;
    const rgb = hexToRgb(accent);
    el.style.color = color;

    switch (variant) {
      case 'gradient':
        el.style.background = `linear-gradient(to right, rgba(${rgb},0.18), transparent)`;
        el.style.borderLeft = `4px solid ${accent}`;
        break;
      case 'glass':
        el.style.background = `rgba(${rgb},0.06)`;
        el.style.border     = `1px solid rgba(${rgb},0.55)`;
        break;
      case 'top-bar':
        el.style.background = `rgba(${rgb},0.08)`;
        el.style.borderTop  = `3px solid ${accent}`;
        break;
      default: /* solid */
        el.style.background = `rgba(${rgb},0.82)`;
        el.style.borderLeft = `4px solid ${accent}`;
    }
  }

  /* ────────────────────────────────────────── */

  function splitBySentence(text) {
    const result = [];
    let buf = '';
    const endMarks = new Set(['.', '!', '?', '。', '！', '？', '…']);

    for (let i = 0; i < text.length; i++) {
      buf += text[i];
      if (endMarks.has(text[i])) {
        while (i + 1 < text.length && /\s/.test(text[i + 1])) {
          i++;
          buf += text[i];
        }
        const s = buf.trim();
        if (s) result.push(s);
        buf = '';
      }
    }
    const tail = buf.trim();
    if (tail) result.push(tail);
    return result;
  }

  function splitByWord(text) {
    return text.split(/\s+/).filter(Boolean);
  }

  function plainLen(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || '').length || html.length;
  }

  function distributeToN(units, n) {
    if (!n || n <= 0) return [];
    if (n === 1) return [units.join('')];
    if (!units.length) return Array(n).fill('');

    const lens      = units.map(plainLen);
    const total     = lens.reduce((a, b) => a + b, 0);
    const target    = total / n;
    const groups    = [];
    let cur         = [];
    let curLen      = 0;
    let groupsLeft  = n;

    for (let i = 0; i < units.length; i++) {
      cur.push(units[i]);
      curLen += lens[i];
      const unitsLeft = units.length - i - 1;

      if (groupsLeft > 1 && curLen >= target && unitsLeft >= groupsLeft - 1) {
        groups.push(cur.join(''));
        cur        = [];
        curLen     = 0;
        groupsLeft--;
      }
    }
    if (cur.length) groups.push(cur.join(''));
    while (groups.length < n) groups.push('');
    return groups;
  }

  function getTopLevelUnits(container) {
    const units = [];
    container.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        units.push({ html: node.outerHTML, text: node.textContent, isBlock: true });
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        units.push({ html: node.textContent, text: node.textContent, isBlock: false });
      }
    });
    return units;
  }

  function splitContent(html, n, mode, delim, trimEmpty) {
    if (html.includes(delim)) {
      let parts = html.split(delim);
      if (trimEmpty) parts = parts.map(p => p.trim()).filter(Boolean);
      return parts;
    }

    if (mode === 'delimiter') {
      return [html, ...Array(n - 1).fill('')];
    }

    const temp   = document.createElement('div');
    temp.innerHTML = html;
    const blocks = getTopLevelUnits(temp);
    let units    = [];

    if (mode === 'paragraph') {
      units = blocks.map(b => b.html);
      if (!units.length) {
        units = html.split(/\n\s*\n+/).map(s => s.trim()).filter(Boolean);
      }
    } else if (mode === 'sentence') {
      blocks.forEach(b => {
        const sents = splitBySentence(b.text);
        if (b.isBlock && sents.length <= 1) {
          units.push(b.html);
        } else {
          sents.forEach(s => units.push(s));
        }
      });
      if (!units.length) {
        splitBySentence(temp.textContent).forEach(s => units.push(s));
      }
    } else if (mode === 'word') {
      blocks.forEach(b => {
        splitByWord(b.text).forEach(w => units.push(w));
      });
      if (!units.length) {
        splitByWord(temp.textContent).forEach(w => units.push(w));
      }
    }

    if (trimEmpty) units = units.filter(u => u.trim());
    return distributeToN(units, n);
  }

  /* ────────────────────────────────────────── */

  class TextSplitterElement extends HTMLElement {

    connectedCallback() {
      this.style.display = 'none';
      const go = () => this.split();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', go, { once: true });
      } else {
        setTimeout(go, 0);
      }
    }

    _getSourceHtml() {
      if (this._override !== undefined) return this._override;
      const textAttr = this.getAttribute('text');
      if (textAttr !== null) return textAttr;
      const src = this.getAttribute('src');
      if (src) {
        const el = document.querySelector(src);
        if (el) return el.innerHTML;
      }
      return '';
    }

    split() {
      const html = this._getSourceHtml();
      if (!html.trim()) return;

      const mode      = this.getAttribute('mode')      ?? _cfg.mode;
      const delim     = this.getAttribute('delimiter') ?? _cfg.delimiter;
      const trimEmpty = (this.getAttribute('trim-empty') ?? String(_cfg.trimEmpty)) !== 'false';
      const fontSize  = this.getAttribute('font-size') || _cfg.fontSize;
      const color     = this.getAttribute('color')     || _cfg.color;
      const themeName = this.getAttribute('theme')     || _cfg.theme   || null;
      const variant   = this.getAttribute('variant')   || _cfg.variant || 'solid';

      const targets = (this.getAttribute('targets') || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => document.querySelector(s))
        .filter(Boolean);

      if (!targets.length) return;

      const parts       = splitContent(html, targets.length, mode, delim, trimEmpty);
      const allThemes   = { ...BUILT_IN_THEMES, ..._cfg.themes };
      const themeStyles = themeName ? (allThemes[themeName] ?? null) : null;

      targets.forEach((el, i) => {
        el.innerHTML = parts[i] ?? '';
        if (fontSize) el.style.fontSize = fontSize;
        if (color)    el.style.color    = color;
        if (themeStyles) {
          const entry = themeStyles[i % themeStyles.length];
          if (entry) applyVariant(el, entry, variant);
        }
      });

      this.dispatchEvent(new CustomEvent('text-split', {
        bubbles: true,
        detail : { parts, targetCount: targets.length },
      }));
    }

    setText(newHtml) {
      this._override = newHtml;
      this.split();
    }

    clearOverride() {
      delete this._override;
      this.split();
    }

    static config(opts = {}) {
      const { themes, ...rest } = opts;
      Object.assign(_cfg, rest);
      if (themes) Object.assign(_cfg.themes, themes);
    }

    static resetConfig() {
      _cfg = { ...DEFAULT_CONFIG, themes: {} };
    }

    static get availableThemes() {
      return Object.keys({ ...BUILT_IN_THEMES, ..._cfg.themes });
    }
  }

  customElements.define('text-splitter', TextSplitterElement);
  window.TextSplitter = TextSplitterElement;
})();
