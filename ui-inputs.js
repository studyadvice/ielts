(function () {
  'use strict';

  const BRAND_COLORS = {
    base: '#0C0D0C',  /* 與 ui-insight 一致的頁面底色名稱 */
    background: '#0C0D0C',
    shell: '#C6C7BD',
    vanilla: '#DBEDD8',
    yellow: '#E3D322',
    indigo: '#778CE1',
    pink: '#FF91D7',
    /* 新色票 */
    red: '#EF6661',
    green: '#71CD76',
    blue: '#5DBAE8',
    violet: '#B484E8',
    gray: '#86877F',
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

  function parseColor(value) {
    if (!value) return null;
    const key = String(value).trim().toLowerCase();
    return BRAND_COLORS[key] || value;
  }

  // 把 hex 色碼轉成帶透明度的 rgba（給 focus ring 陰影、填色訊息框用）；
  // 若本來就不是 #hex（例如已經是 rgba 字串或色票解析失敗），原樣返回，
  // 不強制套透明度，交給使用者自訂的值。
  function toRgba(color, alpha) {
    if (typeof color !== 'string') return color;
    const hex = color.trim();
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return color;
    const n = parseInt(m[1], 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // 全形轉半形（數字／英文字母／常用符號／全形空白），供 normalize-width 用
  function normalizeWidth(str) {
    return str.replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
      .replace(/　/g, ' ');
  }

  const FILTERS = {
    numeric: /[^0-9]/g,
    alpha: /[^a-zA-Z]/g,
    alnum: /[^a-zA-Z0-9]/g,
    any: null
  };

  const INPUTMODES = {
    numeric: 'numeric',
    alpha: 'text',
    alnum: 'text',
    any: 'text'
  };

  const STYLE_ID = 'ui-otp-style';

  function injectStyleOnce() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
ui-otp{
  display:inline-block;
  position:relative;
}
ui-otp .uo-row{
  display:flex;
  align-items:center;
  gap:var(--uo-gap,10px);
}
ui-otp .uo-cell{
  box-sizing:border-box;
  width:var(--uo-cell-size,48px);
  height:var(--uo-cell-size,48px);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:var(--uo-font-size,1.25rem);
  line-height:1;
  color:var(--uo-text-color,#C6C7BD);
  background:var(--uo-bg-color,transparent);
  border:var(--uo-border-width,1px) solid var(--uo-border-color,rgba(198,199,189,0.78));
  border-radius:var(--uo-radius,8px);
  transition:border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
  position:relative;
  user-select:none;
}
ui-otp .uo-sep{
  color:var(--uo-text-color,#C6C7BD);
  opacity:.6;
  padding:0 2px;
  user-select:none;
}
ui-otp .uo-cell.is-active-cell{
  border-color:var(--uo-focus-ring-color,var(--uo-accent-color,#5DBAE8));
}
ui-otp.is-focused .uo-cell.is-active-cell{
  box-shadow:0 0 0 var(--uo-focus-ring-width,3px) var(--uo-focus-ring-shadow,rgba(93,186,232,.35));
}
ui-otp .uo-cell.is-active-cell::after{
  content:'';
  display:var(--uo-caret-display,none);
  width:2px;
  height:55%;
  background:var(--uo-focus-ring-color,var(--uo-accent-color,#5DBAE8));
  animation:uo-blink 1s step-start infinite;
}
@keyframes uo-blink{ 50%{ opacity:0; } }

ui-otp.is-valid .uo-cell{
  border-color:var(--uo-valid-color,#71CD76);
}
ui-otp.is-invalid .uo-cell{
  border-color:var(--uo-error-color,#EF6661);
}
ui-otp.is-disabled .uo-cell{
  opacity:.5;
}

ui-otp .uo-input{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  margin:0;
  padding:0;
  border:0;
  outline:0;
  opacity:0;
  background:transparent;
  color:transparent;
  caret-color:transparent;
  cursor:text;
  letter-spacing:0;
}
ui-otp.is-disabled .uo-input{ cursor:not-allowed; }

ui-otp .uo-message{
  margin-top:8px;
  font-size:var(--uo-message-font-size,0.9rem);
  color:var(--uo-error-color,#EF6661);
}
ui-otp.is-valid .uo-message{
  color:var(--uo-valid-color,#71CD76);
}

/* ---- mode="generate" 專用 ---- */
ui-otp .uo-generate-row{
  display:flex;
  align-items:center;
  gap:var(--uo-copy-gap,12px);
}
ui-otp[mode="generate"] .uo-cell{
  user-select:text;
  cursor:text;
}
ui-otp.is-checking .uo-cell{
  opacity:.5;
}
ui-otp .uo-copy-btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:5px;
  padding:var(--uo-copy-btn-padding,8px 14px);
  font-size:var(--uo-copy-btn-font-size,1rem);
  color:var(--uo-copy-btn-color,#0C0D0C);
  background:var(--uo-copy-btn-bg,var(--uo-accent-color,#5DBAE8));
  border:var(--uo-border-width,1px) solid var(--uo-accent-color,#5DBAE8);
  border-radius:var(--uo-radius,8px);
  cursor:pointer;
  white-space:nowrap;
  flex-shrink:0;
}
ui-otp .uo-copy-btn:disabled{
  cursor:not-allowed;
  opacity:.6;
}
ui-otp .uo-copy-btn .bi{ font-size:1.05em; line-height:1; }
`;
    document.head.appendChild(style);
  }

  class UiOtp extends HTMLElement {
    static get observedAttributes() {
      return [
        'mode', 'length', 'groups', 'separator', 'format', 'type', 'case', 'mask', 'disabled',
        'exclude-ambiguous',
        'cell-size', 'gap', 'font-size', 'radius', 'border-width',
        'border-color', 'bg-color', 'text-color',
        'accent-color', 'focus-ring-width', 'focus-ring-color',
        'error-color', 'valid-color',
        'expected-value', 'clear-on-invalid', 'clear-delay',
        'label-invalid', 'label-valid', 'show-message',
        'copy-icon', 'copy-icon-success', 'copy-text', 'copy-position', 'copy-feedback-duration',
        'auto-generate',
        'check-url', 'check-method', 'check-param', 'check-field', 'check-max-retries'
      ];
    }

    constructor() {
      super();
      this._value = '';
      this._displayValue = '';
      this._state = 'idle'; // idle | valid | invalid
      this._built = false;
      this._mode = 'input';
      this._attempts = 0;
    }

    connectedCallback() {
      injectStyleOnce();
      if (!this._built) this._build();
      this._applyVars();
      this._syncDisabled();
      this._refreshDisplay();
      if (this._mode === 'generate' && this.getAttribute('auto-generate') !== 'false' && !this._displayValue) {
        this.generate();
      }
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (!this._built || oldVal === newVal) return;
      if (name === 'mode' || name === 'copy-position') {
        this._built = false;
        this._build();
        this._applyVars();
        this._syncDisabled();
        if (this._mode === 'generate' && this.getAttribute('auto-generate') !== 'false') this.generate();
      } else if (['length', 'groups', 'separator', 'mask', 'format'].includes(name)) {
        this._renderCells();
        this._refreshDisplay();
      } else if (name === 'disabled') {
        this._syncDisabled();
      } else if (name === 'type') {
        this._syncInputMode();
      } else if (name === 'copy-icon' || name === 'copy-text') {
        if (this._copyBtn) this._renderCopyButton();
      } else {
        this._applyVars();
      }
    }

    // ---- 公開 API ----
    get value() { return this._mode === 'generate' ? this._displayValue : this._value; }
    set value(v) {
      if (this._mode === 'generate') {
        this._displayValue = v == null ? '' : String(v);
        this._refreshDisplay();
        return;
      }
      this._value = this._filter(String(v == null ? '' : v));
      this._input.value = this._value;
      this._refreshDisplay();
    }

    reset() {
      if (this._mode === 'generate') {
        this.generate();
        return;
      }
      this._value = '';
      this._input.value = '';
      this._state = 'idle';
      this.classList.remove('is-valid', 'is-invalid');
      this._refreshDisplay();
    }

    setState(state) {
      if (!['idle', 'valid', 'invalid'].includes(state)) return;
      this._state = state;
      this.classList.toggle('is-valid', state === 'valid');
      this.classList.toggle('is-invalid', state === 'invalid');
      this._renderMessage();
      if (state === 'invalid' && this.hasAttribute('clear-on-invalid')) {
        const delay = parseInt(this.getAttribute('clear-delay'), 10);
        setTimeout(() => { this.reset(); this.focus(); }, isNaN(delay) ? 700 : delay);
      }
    }

    focus() { if (this._input) this._input.focus(); }

    // generate 模式：手動（重新）產生一組碼，會自動跑 check-url 查重
    generate() {
      if (this._mode !== 'generate') return;
      this._attempts = 0;
      this._tryGenerateOnce();
    }

    // ---- 內部建置 ----
    _build() {
      this._built = true;
      this._mode = this.getAttribute('mode') === 'generate' ? 'generate' : 'input';
      this.innerHTML = '';

      this._row = document.createElement('div');
      this._row.className = 'uo-row';

      if (this._mode === 'input') {
        this._input = document.createElement('input');
        this._input.className = 'uo-input';
        this._input.setAttribute('autocomplete', 'one-time-code');
        this._input.setAttribute('aria-label', this.getAttribute('aria-label') || 'Verification code');
        this._input.addEventListener('input', () => this._onInput());
        this._input.addEventListener('focus', () => { this.classList.add('is-focused'); this._refreshDisplay(); });
        this._input.addEventListener('blur', () => { this.classList.remove('is-focused'); this._refreshDisplay(); });

        this.appendChild(this._row);
        this.appendChild(this._input);
        this._syncInputMode();
      } else {
        this._copyBtn = document.createElement('button');
        this._copyBtn.type = 'button';
        this._copyBtn.className = 'uo-copy-btn';
        this._copyBtn.addEventListener('click', () => this._copy());

        const wrap = document.createElement('div');
        wrap.className = 'uo-generate-row';
        const position = this.getAttribute('copy-position') === 'left' ? 'left' : 'right';
        if (position === 'left') {
          wrap.appendChild(this._copyBtn);
          wrap.appendChild(this._row);
        } else {
          wrap.appendChild(this._row);
          wrap.appendChild(this._copyBtn);
        }
        this.appendChild(wrap);
        this._renderCopyButton();
      }

      this._message = document.createElement('div');
      this._message.className = 'uo-message';
      this._message.hidden = true;
      this.appendChild(this._message);

      this._renderCells();
    }

    _syncInputMode() {
      if (!this._input) return;
      const type = this.getAttribute('type') || 'numeric';
      this._input.setAttribute('inputmode', INPUTMODES[type] || 'text');
    }

    _syncDisabled() {
      const disabled = this.hasAttribute('disabled');
      if (this._input) this._input.disabled = disabled;
      if (this._copyBtn) this._copyBtn.disabled = disabled;
      this.classList.toggle('is-disabled', disabled);
    }

    // generate 模式預設 16 碼，input 模式預設 6 碼（沒指定 length 的情況下）
    _resolvedLength() {
      const attr = this.getAttribute('length');
      if (attr) return parseInt(attr, 10) || 1;
      return this._mode === 'generate' ? 16 : 6;
    }

    _groups() {
      const raw = this.getAttribute('groups');
      const length = this._resolvedLength();
      if (!raw) return [length];
      const parts = raw.split(',').map((n) => parseInt(n.trim(), 10)).filter((n) => n > 0);
      const sum = parts.reduce((a, b) => a + b, 0);
      return sum === length ? parts : [length];
    }

    // 解析 format（如 "OOOO-OOOOO-OOOOOO"）：O 代表一個字元格，其他字元原樣
    // 當作固定分隔符號（連續的非 O 字元會合併成同一個分隔 span）
    _parseFormat(str) {
      const tokens = [];
      let buf = '';
      for (const ch of str) {
        if (ch === 'O') {
          if (buf) { tokens.push({ type: 'literal', text: buf }); buf = ''; }
          tokens.push({ type: 'slot' });
        } else {
          buf += ch;
        }
      }
      if (buf) tokens.push({ type: 'literal', text: buf });
      return tokens;
    }

    _renderCells() {
      const format = this._mode === 'generate' ? this.getAttribute('format') : null;

      this._row.innerHTML = '';
      this._cells = [];

      if (format) {
        this._parseFormat(format).forEach((tok) => {
          if (tok.type === 'slot') {
            const cell = document.createElement('div');
            cell.className = 'uo-cell';
            this._row.appendChild(cell);
            this._cells.push(cell);
          } else {
            const s = document.createElement('span');
            s.className = 'uo-sep';
            s.textContent = tok.text;
            this._row.appendChild(s);
          }
        });
        return;
      }

      const length = this._resolvedLength();
      if (this._input) this._input.maxLength = length;
      const sep = this.getAttribute('separator') || '-';
      const groups = this._groups();

      groups.forEach((groupLen, gi) => {
        for (let i = 0; i < groupLen; i++) {
          const cell = document.createElement('div');
          cell.className = 'uo-cell';
          this._row.appendChild(cell);
          this._cells.push(cell);
        }
        if (gi < groups.length - 1) {
          const s = document.createElement('span');
          s.className = 'uo-sep';
          s.textContent = sep;
          this._row.appendChild(s);
        }
      });
    }

    _filter(raw) {
      const type = this.getAttribute('type') || 'numeric';
      const length = this._resolvedLength();
      let v = raw;
      const re = FILTERS[type];
      if (re) v = v.replace(re, '');
      const caseMode = this.getAttribute('case');
      if (type !== 'numeric') {
        if (caseMode === 'upper') v = v.toUpperCase();
        else if (caseMode === 'lower') v = v.toLowerCase();
      }
      return v.slice(0, length);
    }

    _onInput() {
      if (this._state !== 'idle') {
        this._state = 'idle';
        this.classList.remove('is-valid', 'is-invalid');
        this._renderMessage();
      }
      const filtered = this._filter(this._input.value);
      this._value = filtered;
      if (this._input.value !== filtered) this._input.value = filtered;
      this._render();

      const length = this._resolvedLength();
      const complete = filtered.length === length;

      this.dispatchEvent(new CustomEvent('otp-input', {
        bubbles: true,
        detail: { value: filtered, complete }
      }));

      if (complete) this._onComplete(filtered);
    }

    _onComplete(value) {
      const checkUrl = this.getAttribute('check-url');
      if (checkUrl) {
        this._setChecking(true);
        this.dispatchEvent(new CustomEvent('otp-check-start', { bubbles: true, detail: { value } }));
        this._performCheck(value).then((exists) => {
          this._setChecking(false);
          this.dispatchEvent(new CustomEvent('otp-check-result', { bubbles: true, detail: { value, exists } }));
          this.setState(exists ? 'valid' : 'invalid');
          this.dispatchEvent(new CustomEvent('otp-complete', { bubbles: true, detail: { value, valid: exists } }));
        }).catch((err) => {
          this._setChecking(false);
          this.dispatchEvent(new CustomEvent('otp-check-error', { bubbles: true, detail: { error: String(err) } }));
        });
        return;
      }

      const expected = this.getAttribute('expected-value');
      let valid = null;
      if (expected !== null) {
        valid = value === expected;
        this.setState(valid ? 'valid' : 'invalid');
      }
      this.dispatchEvent(new CustomEvent('otp-complete', {
        bubbles: true,
        detail: { value, valid }
      }));
    }

    _render() {
      if (!this._cells) return;
      const value = this._value;
      const mask = this.hasAttribute('mask');
      const length = this._cells.length;
      const activeIndex = Math.min(value.length, length - 1);
      const focused = this.classList.contains('is-focused');

      this._cells.forEach((cell, i) => {
        const ch = value[i];
        cell.textContent = ch ? (mask ? '•' : ch) : '';
        const isActive = focused && i === activeIndex && this._state === 'idle';
        cell.classList.toggle('is-active-cell', isActive);
        cell.style.setProperty('--uo-caret-display', isActive && !ch ? 'block' : 'none');
      });
    }

    // 依目前 mode 分流：input 模式畫作用中格子／游標，generate 模式單純展示內容
    _refreshDisplay() {
      if (this._mode === 'generate') this._renderGenerated();
      else this._render();
    }

    _renderGenerated() {
      if (!this._cells) return;
      const val = this._displayValue || '';
      this._cells.forEach((cell, i) => { cell.textContent = val[i] || ''; });
    }

    // ---- generate 模式：產生亂數碼 ----
    _alphaPool() {
      const caseMode = this.getAttribute('case');
      if (caseMode === 'upper') return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (caseMode === 'lower') return 'abcdefghijklmnopqrstuvwxyz';
      return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    }

    _buildCharPool() {
      const type = this.getAttribute('type') || 'numeric';
      let pool;
      if (type === 'numeric') pool = '0123456789';
      else if (type === 'alpha') pool = this._alphaPool();
      else pool = '0123456789' + this._alphaPool(); // alnum、any 都退回英數混合

      if (this.getAttribute('exclude-ambiguous') !== 'false') {
        pool = pool.split('').filter((c) => '0O1Il'.indexOf(c) === -1).join('');
      }
      return pool || '0123456789';
    }

    _randomCode() {
      const pool = this._buildCharPool();
      const format = this.getAttribute('format');
      const slotCount = format ? (format.match(/O/g) || []).length : this._resolvedLength();
      let out = '';
      for (let i = 0; i < slotCount; i++) {
        out += pool.charAt(Math.floor(Math.random() * pool.length));
      }
      return out;
    }

    _tryGenerateOnce() {
      this._attempts++;
      const value = this._randomCode();
      this._displayValue = value;
      this._state = 'idle';
      this.classList.remove('is-valid', 'is-invalid');
      this._refreshDisplay();

      const checkUrl = this.getAttribute('check-url');
      if (!checkUrl) {
        this.dispatchEvent(new CustomEvent('otp-generated', { bubbles: true, detail: { value, attempts: this._attempts } }));
        return;
      }

      this._setChecking(true);
      this.dispatchEvent(new CustomEvent('otp-check-start', { bubbles: true, detail: { value } }));
      this._performCheck(value).then((exists) => {
        this.dispatchEvent(new CustomEvent('otp-check-result', { bubbles: true, detail: { value, exists } }));
        if (exists) {
          const max = parseInt(this.getAttribute('check-max-retries'), 10) || 5;
          if (this._attempts >= max) {
            this._setChecking(false);
            this.dispatchEvent(new CustomEvent('otp-check-exhausted', { bubbles: true, detail: { value, attempts: this._attempts } }));
            return;
          }
          this._tryGenerateOnce();
        } else {
          this._setChecking(false);
          this.dispatchEvent(new CustomEvent('otp-generated', { bubbles: true, detail: { value, attempts: this._attempts } }));
        }
      }).catch((err) => {
        this._setChecking(false);
        this.dispatchEvent(new CustomEvent('otp-check-error', { bubbles: true, detail: { error: String(err) } }));
      });
    }

    _setChecking(flag) {
      this.classList.toggle('is-checking', flag);
      if (this._copyBtn) this._copyBtn.disabled = flag || this.hasAttribute('disabled');
    }

    // 共用的後端查核：POST/GET 送出 { [check-param]: value }，
    // 解析回傳 JSON 裡 [check-field]（預設 "exists"）這個布林欄位
    _performCheck(value) {
      const url = this.getAttribute('check-url');
      const method = (this.getAttribute('check-method') || 'POST').toUpperCase();
      const param = this.getAttribute('check-param') || 'code';
      const field = this.getAttribute('check-field') || 'exists';

      let fetchUrl = url;
      const options = { method };
      if (method === 'GET') {
        const sep = url.indexOf('?') === -1 ? '?' : '&';
        fetchUrl = url + sep + encodeURIComponent(param) + '=' + encodeURIComponent(value);
      } else {
        options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        options.body = encodeURIComponent(param) + '=' + encodeURIComponent(value);
      }

      return fetch(fetchUrl, options).then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then((json) => !!json[field]);
    }

    _copy() {
      const value = this._displayValue || '';
      if (!value || !navigator.clipboard) { this._showCopyFeedback(false); return; }
      navigator.clipboard.writeText(value).then(() => {
        this._showCopyFeedback(true);
        this.dispatchEvent(new CustomEvent('otp-copied', { bubbles: true, detail: { value } }));
      }).catch(() => this._showCopyFeedback(false));
    }

    _showCopyFeedback(success) {
      if (!this._copyBtn) return;
      const icon = this._copyBtn.querySelector('i');
      if (!icon) return;
      const original = this.getAttribute('copy-icon') || 'bi-clipboard';
      const successIcon = this.getAttribute('copy-icon-success') || 'bi-clipboard-check';
      icon.className = 'bi ' + (success ? successIcon : original);
      const duration = parseInt(this.getAttribute('copy-feedback-duration'), 10) || 1500;
      clearTimeout(this._copyFeedbackTimer);
      this._copyFeedbackTimer = setTimeout(() => { icon.className = 'bi ' + original; }, duration);
    }

    _renderCopyButton() {
      if (!this._copyBtn) return;
      this._copyBtn.innerHTML = '';
      const icon = this.getAttribute('copy-icon') || 'bi-clipboard';
      const text = this.getAttribute('copy-text');
      const i = document.createElement('i');
      i.className = 'bi ' + icon;
      this._copyBtn.appendChild(i);
      if (text) {
        const span = document.createElement('span');
        span.textContent = text;
        this._copyBtn.appendChild(span);
      }
    }

    _renderMessage() {
      const show = this.getAttribute('show-message') !== 'false';
      if (!show) { this._message.hidden = true; return; }
      if (this._state === 'invalid') {
        this._message.textContent = this.getAttribute('label-invalid') || '驗證碼錯誤，請重新輸入。';
        this._message.hidden = false;
      } else if (this._state === 'valid' && this.getAttribute('label-valid')) {
        this._message.textContent = this.getAttribute('label-valid');
        this._message.hidden = false;
      } else {
        this._message.hidden = true;
      }
    }

    _applyVars() {
      const set = (name, value) => {
        if (value === null || value === undefined || value === '') return;
        this.style.setProperty(name, value);
      };
      set('--uo-cell-size', this.getAttribute('cell-size'));
      set('--uo-gap', this.getAttribute('gap'));
      set('--uo-font-size', this.getAttribute('font-size'));
      set('--uo-radius', this.getAttribute('radius'));
      set('--uo-border-width', this.getAttribute('border-width'));
      set('--uo-border-color', parseColor(this.getAttribute('border-color')));
      set('--uo-bg-color', parseColor(this.getAttribute('bg-color')));
      set('--uo-text-color', parseColor(this.getAttribute('text-color')));
      set('--uo-accent-color', parseColor(this.getAttribute('accent-color')));
      set('--uo-focus-ring-width', this.getAttribute('focus-ring-width'));
      const ringColor = parseColor(this.getAttribute('focus-ring-color')) || parseColor(this.getAttribute('accent-color'));
      set('--uo-focus-ring-color', ringColor);
      if (ringColor) set('--uo-focus-ring-shadow', toRgba(ringColor, 0.35));
      set('--uo-error-color', parseColor(this.getAttribute('error-color')));
      set('--uo-valid-color', parseColor(this.getAttribute('valid-color')));
      this._renderMessage();
    }
  }

  customElements.define('ui-otp', UiOtp);

  /* =========================================================================
   * <ui-blank> — 單行輸入填充題元件
   *
   * 用法：
   * <ui-blank expected-value="apple" button-icon="bi-send"></ui-blank>
   *
   * 永遠區分大小寫（不提供 case-sensitive 開關）。答案比對支援多個可接受值，
   * 用 "|" 分隔，例如 expected-value="台北|臺北"（兩個都要各自列出，不會
   * 自動視為同義）。
   *
   * 兩種驗證模式（跟 <ui-otp> 一致）：
   * 1. 前端比對：給 expected-value，按下送出鈕或 Enter 自動比對。
   * 2. 外部非同步驗證：不給 expected-value，監聽 'blank-submit' 事件自行
   *    打 API，驗證完呼叫 el.setState('valid' | 'invalid' | 'idle')。
   *
   * 事件：
   * - 'blank-submit'：按下送出時，detail = { value, raw, valid }
   *   （valid 在前端比對模式下是 true/false，外部驗證模式下是 null）
   *
   * 訊息顯示兩種模式：
   * - 預設：顯示在元件內建、本體正下方的訊息區塊，可用 message-style 選
   *   五種樣式之一（plain / bordered / filled / accent-bar / icon-banner）。
   * - message-target="某個id"：改成把純文字訊息寫進頁面上該 <div id> 裡，
   *   不套用任何 message-style 樣式，排版完全交給你自己控制。
   *
   * 公開方法／屬性：
   * - el.value（get/set）
   * - el.reset()
   * - el.setState('valid' | 'invalid' | 'idle')
   * - el.focus()
   */

  const BLANK_STYLE_ID = 'ui-blank-style';

  function injectBlankStyleOnce() {
    if (document.getElementById(BLANK_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = BLANK_STYLE_ID;
    style.textContent = `
ui-blank{
  display:inline-block;
}
ui-blank .ub-row{
  display:flex;
  align-items:stretch;
  border-radius:var(--ub-radius,6px);
  transition:box-shadow .15s ease;
}
ui-blank.is-focused .ub-row{
  box-shadow:0 0 0 var(--ub-focus-ring-width,3px) var(--ub-focus-ring-shadow,rgba(93,186,232,.35));
}
ui-blank .ub-input{
  box-sizing:border-box;
  width:var(--ub-width,220px);
  min-width:0;
  padding:var(--ub-padding,5px 10px);
  font-size:var(--ub-font-size,0.95rem);
  line-height:1.3;
  color:var(--ub-text-color,#C6C7BD);
  background:var(--ub-bg-color,transparent);
  border:var(--ub-border-width,1px) solid var(--ub-border-color,rgba(198,199,189,0.78));
  border-radius:var(--ub-radius,6px) 0 0 var(--ub-radius,6px);
  outline:0;
  transition:border-color .15s ease;
}
ui-blank .ub-input:focus{
  border-color:var(--ub-focus-ring-color,var(--ub-accent-color,#5DBAE8));
}
ui-blank .ub-button{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:5px;
  margin-left:-1px;
  padding:var(--ub-btn-padding,5px 12px);
  font-size:var(--ub-btn-font-size,0.95rem);
  line-height:1.3;
  color:var(--ub-btn-color,#0C0D0C);
  background:var(--ub-btn-bg,var(--ub-accent-color,#5DBAE8));
  border:var(--ub-border-width,1px) solid var(--ub-accent-color,#5DBAE8);
  border-radius:0 var(--ub-radius,6px) var(--ub-radius,6px) 0;
  cursor:pointer;
  white-space:nowrap;
}
ui-blank .ub-button:disabled{
  cursor:not-allowed;
  opacity:.6;
}
ui-blank .ub-button .bi{ font-size:1em; line-height:1; }

ui-blank.is-valid .ub-input,
ui-blank.is-valid .ub-button{
  border-color:var(--ub-valid-color,#71CD76);
}
ui-blank.is-invalid .ub-input,
ui-blank.is-invalid .ub-button{
  border-color:var(--ub-error-color,#EF6661);
}
ui-blank.is-disabled .ub-input,
ui-blank.is-disabled .ub-button{
  opacity:.5;
}

ui-blank .ub-message{
  margin-top:6px;
  font-size:var(--ub-message-font-size,0.85rem);
  line-height:1.4;
  color:var(--ub-error-color,#EF6661);
}
ui-blank.is-valid .ub-message{
  color:var(--ub-valid-color,#71CD76);
}

/* plain：純文字，不加框不加底色（預設） */
ui-blank .ub-message.is-style-plain{
  padding:var(--ub-message-padding,0px);
}

/* bordered：細邊框卡片 */
ui-blank .ub-message.is-style-bordered{
  padding:var(--ub-message-padding,8px 12px);
  border:1px solid currentColor;
  border-radius:var(--ub-message-radius,6px);
}

/* filled：淡化底色卡片 */
ui-blank .ub-message.is-style-filled{
  padding:var(--ub-message-padding,8px 12px);
  border-radius:var(--ub-message-radius,6px);
  background:var(--ub-message-fill,rgba(198,199,189,.15));
}

/* accent-bar：左側色條 */
ui-blank .ub-message.is-style-accent-bar{
  padding:var(--ub-message-padding,6px 12px 6px 14px);
  border-left:3px solid currentColor;
}

/* icon-banner：圖示 + 文字橫幅 */
ui-blank .ub-message.is-style-icon-banner{
  padding:var(--ub-message-padding,8px 14px);
  border-radius:var(--ub-message-radius,6px);
  background:var(--ub-message-fill,rgba(198,199,189,.15));
  display:flex;
  align-items:center;
  gap:8px;
}
ui-blank .ub-message.is-style-icon-banner .bi{ font-size:1.1em; }
`;
    document.head.appendChild(style);
  }

  const MESSAGE_STYLES = ['plain', 'bordered', 'filled', 'accent-bar', 'icon-banner'];

  class UiBlank extends HTMLElement {
    disconnectedCallback() {
      if (this._cliBuilt && this._io) { this._io.disconnect(); this._io = null; }
    }

    static get observedAttributes() {
      return [
        'placeholder', 'disabled',
        'trim-whitespace', 'normalize-width',
        'button-icon', 'button-text', 'button-position', 'disable-enter-submit',
        'width', 'font-size', 'padding', 'radius', 'border-width', 'border-color',
        'bg-color', 'text-color',
        'btn-padding', 'btn-font-size', 'btn-bg', 'btn-color',
        'accent-color', 'focus-ring-width', 'focus-ring-color',
        'error-color', 'valid-color',
        'expected-value', 'clear-on-invalid', 'clear-delay',
        'label-invalid', 'label-valid', 'show-message',
        'message-target', 'message-style', 'message-font-size', 'message-padding', 'message-radius',
        'message-icon-valid', 'message-icon-invalid'
      ];
    }

    constructor() {
      super();
      this._state = 'idle';
      this._built = false;
    }

    connectedCallback() {
      if (this.getAttribute('mode') === 'cli') {
        // CLI 模式要讀取子標籤劇本：文件還在解析時，等解析完成再建置
        if (this._cliBuilt) return;
        injectCliStyleOnce();   // 先隱藏劇本子標籤，避免解析期間閃出原文
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => { if (this.isConnected) this._cliInit(); }, { once: true });
        } else {
          this._cliInit();
        }
        return;
      }
      injectBlankStyleOnce();
      if (!this._built) this._build();
      this._applyVars();
      this._syncDisabled();
      this._renderMessage();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (!this._built || oldVal === newVal) return;
      if (name === 'disabled') {
        this._syncDisabled();
      } else if (name === 'placeholder') {
        this._input.placeholder = newVal || '';
      } else if (name === 'button-icon' || name === 'button-text' || name === 'button-position') {
        this._renderButton();
      } else {
        this._applyVars();
      }
    }

    // ---- 公開 API ----
    get value() { return this._input ? this._input.value : ''; }
    set value(v) { if (this._input) this._input.value = v == null ? '' : String(v); }

    reset() {
      if (this._cliBuilt) { this.restart(); return; }
      this._input.value = '';
      this._state = 'idle';
      this.classList.remove('is-valid', 'is-invalid');
      this._renderMessage();
    }

    setState(state) {
      if (this._cliBuilt) return;
      if (!['idle', 'valid', 'invalid'].includes(state)) return;
      this._state = state;
      this.classList.toggle('is-valid', state === 'valid');
      this.classList.toggle('is-invalid', state === 'invalid');
      this._renderMessage();
      if (state === 'invalid' && this.hasAttribute('clear-on-invalid')) {
        const delay = parseInt(this.getAttribute('clear-delay'), 10);
        setTimeout(() => { this.reset(); this.focus(); }, isNaN(delay) ? 700 : delay);
      }
    }

    focus() { if (this._input) this._input.focus(); }

    // ---- 內部建置 ----
    _build() {
      this._built = true;
      this.innerHTML = '';

      this._row = document.createElement('div');
      this._row.className = 'ub-row';

      this._input = document.createElement('input');
      this._input.type = 'text';
      this._input.className = 'ub-input';
      this._input.placeholder = this.getAttribute('placeholder') || '';
      this._input.addEventListener('focus', () => this.classList.add('is-focused'));
      this._input.addEventListener('blur', () => this.classList.remove('is-focused'));
      this._input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && this.getAttribute('disable-enter-submit') === null) {
          e.preventDefault();
          this._submit();
        }
      });
      this._input.addEventListener('input', () => {
        if (this._state !== 'idle') {
          this._state = 'idle';
          this.classList.remove('is-valid', 'is-invalid');
          this._renderMessage();
        }
      });

      this._button = document.createElement('button');
      this._button.type = 'button';
      this._button.className = 'ub-button';
      this._button.addEventListener('click', () => this._submit());

      this._row.appendChild(this._input);
      this._row.appendChild(this._button);

      this._message = document.createElement('div');
      this._message.className = 'ub-message';
      this._message.hidden = true;

      this.appendChild(this._row);
      this.appendChild(this._message);

      this._renderButton();
    }

    _renderButton() {
      this._button.innerHTML = '';
      const icon = this.getAttribute('button-icon');
      const text = this.getAttribute('button-text');
      const position = this.getAttribute('button-position') === 'icon-left' ? 'icon-left' : 'icon-right';

      const iconEl = icon ? (() => {
        const i = document.createElement('i');
        i.className = 'bi ' + icon;
        return i;
      })() : null;
      const textEl = text ? (() => {
        const span = document.createElement('span');
        span.textContent = text;
        return span;
      })() : null;

      if (position === 'icon-left') {
        if (iconEl) this._button.appendChild(iconEl);
        if (textEl) this._button.appendChild(textEl);
      } else {
        if (textEl) this._button.appendChild(textEl);
        if (iconEl) this._button.appendChild(iconEl);
      }
      if (!icon && !text) this._button.textContent = '送出';
    }

    _syncDisabled() {
      const disabled = this.hasAttribute('disabled');
      this._input.disabled = disabled;
      this._button.disabled = disabled;
      this.classList.toggle('is-disabled', disabled);
    }

    // 比對前的字串整理：去頭尾空白（可關）＋全形轉半形（可開）。
    // 僅用於「比對」，不會回寫、改動使用者畫面上看到的原始輸入內容。
    _prepareValue(raw) {
      let v = raw;
      if (this.getAttribute('normalize-width') !== null) v = normalizeWidth(v);
      if (this.getAttribute('trim-whitespace') !== 'false') v = v.trim();
      return v;
    }

    _submit() {
      if (this.hasAttribute('disabled')) return;
      const raw = this._input.value;
      const value = this._prepareValue(raw);
      const expected = this.getAttribute('expected-value');
      let valid = null;

      if (expected !== null) {
        const accepted = expected.split('|').map((s) => s.trim());
        valid = accepted.indexOf(value) !== -1;
        this.setState(valid ? 'valid' : 'invalid');
      }

      this.dispatchEvent(new CustomEvent('blank-submit', {
        bubbles: true,
        detail: { value, raw, valid }
      }));
    }

    _renderMessage() {
      const targetId = this.getAttribute('message-target');
      const show = this.getAttribute('show-message') !== 'false';

      let text = '';
      if (this._state === 'invalid') {
        text = this.getAttribute('label-invalid') || '答案不正確，請重新輸入。';
      } else if (this._state === 'valid') {
        text = this.getAttribute('label-valid') || '';
      }

      if (targetId) {
        const target = document.getElementById(targetId);
        this._message.hidden = true; // 內建訊息區塊關閉，改用外部 div
        if (target) target.textContent = show ? text : '';
        return;
      }

      // 內建訊息區塊：套用 message-style 樣式
      const styleName = MESSAGE_STYLES.indexOf(this.getAttribute('message-style')) !== -1
        ? this.getAttribute('message-style') : 'plain';
      this._message.className = 'ub-message is-style-' + styleName;

      if (!show || !text) {
        this._message.hidden = true;
        return;
      }

      this._message.innerHTML = '';
      if (styleName === 'icon-banner') {
        const iconName = this._state === 'valid'
          ? (this.getAttribute('message-icon-valid') || 'bi-check-circle')
          : (this.getAttribute('message-icon-invalid') || 'bi-x-circle');
        const i = document.createElement('i');
        i.className = 'bi ' + iconName;
        this._message.appendChild(i);
        const span = document.createElement('span');
        span.textContent = text;
        this._message.appendChild(span);
      } else {
        this._message.textContent = text;
      }
      this._message.hidden = false;
    }

    _applyVars() {
      const set = (name, value) => {
        if (value === null || value === undefined || value === '') return;
        this.style.setProperty(name, value);
      };
      set('--ub-width', this.getAttribute('width'));
      set('--ub-font-size', this.getAttribute('font-size'));
      set('--ub-padding', this.getAttribute('padding'));
      set('--ub-radius', this.getAttribute('radius'));
      set('--ub-border-width', this.getAttribute('border-width'));
      set('--ub-border-color', parseColor(this.getAttribute('border-color')));
      set('--ub-bg-color', parseColor(this.getAttribute('bg-color')));
      set('--ub-text-color', parseColor(this.getAttribute('text-color')));
      set('--ub-btn-padding', this.getAttribute('btn-padding'));
      set('--ub-btn-font-size', this.getAttribute('btn-font-size'));
      set('--ub-btn-bg', parseColor(this.getAttribute('btn-bg')));
      set('--ub-btn-color', parseColor(this.getAttribute('btn-color')));
      set('--ub-accent-color', parseColor(this.getAttribute('accent-color')));
      set('--ub-focus-ring-width', this.getAttribute('focus-ring-width'));
      const ringColor = parseColor(this.getAttribute('focus-ring-color')) || parseColor(this.getAttribute('accent-color'));
      set('--ub-focus-ring-color', ringColor);
      if (ringColor) set('--ub-focus-ring-shadow', toRgba(ringColor, 0.35));
      const errorColor = parseColor(this.getAttribute('error-color'));
      const validColor = parseColor(this.getAttribute('valid-color'));
      set('--ub-error-color', errorColor);
      set('--ub-valid-color', validColor);
      set('--ub-message-font-size', this.getAttribute('message-font-size'));
      set('--ub-message-padding', this.getAttribute('message-padding'));
      set('--ub-message-radius', this.getAttribute('message-radius'));
      // filled / icon-banner 樣式的淡化底色，跟著目前驗證狀態的顏色走
      const fillBase = this._state === 'valid' ? (validColor || '#71CD76')
        : this._state === 'invalid' ? (errorColor || '#EF6661') : null;
      if (fillBase) set('--ub-message-fill', toRgba(fillBase, 0.15));
      this._renderMessage();
    }
  }


  /* =========================================================================
   * <ui-blank mode="cli">：模擬 CLI 畫面的對話播放器
   *
   * 用法：
   * <ui-blank mode="cli" prompt="you $" speed="20">
   *   <cli-in>describe my hometown</cli-in>
   *   <cli-out>Kaohsiung: a harbour city famous for its seafood.</cli-out>
   *   <cli-in prompt="examiner $">what do you usually do there?</cli-in>
   *   <cli-ask placeholder="type anything" sample="I go jogging along the river."></cli-ask>
   *   <cli-wait ms="800"></cli-wait>
   * </ui-blank>
   *
   * 子標籤：
   * - <cli-in>：自動打字的輸入行，前面有提示符號。屬性 prompt、speed、delay、theme。
   * - <cli-out>：系統回應，沒有提示符號。屬性 speed、delay、theme、pre（保留原始換行與空白）。
   * - <cli-ask>：換使用者自己打，不比對答案，按 Enter 就繼續播放。
   *   屬性 prompt、placeholder（灰色提示字）、sample（按「略過」時自動打出的示範句）、allow-empty。
   * - <cli-wait ms="800">：停頓。
   * 行內可用 <c-key>、<c-yellow> 等色名標籤或 <b>、<br>，打字時保留格式。
   *
   * 事件：cli-answer（detail = { value, index }，同時送出 blank-submit，valid 為 null）、cli-end
   * 方法：el.play()、el.pause()、el.restart()、el.reset()（同 restart）、el.rate（播放倍率）
   * ========================================================================= */

  const CLI_STYLE_ID = 'ui-blank-cli-style';
  const CLI_CANCEL = { cancelled: true };
  const CLI_RATES = [0.5, 1, 2];

  function injectCliStyleOnce() {
    if (document.getElementById(CLI_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = CLI_STYLE_ID;
    style.textContent = `
ui-blank[mode="cli"]{display:block;max-width:var(--ucli-width,100%);}
ui-blank[mode="cli"] > cli-in,ui-blank[mode="cli"] > cli-out,ui-blank[mode="cli"] > cli-ask,ui-blank[mode="cli"] > cli-wait{display:none;}
ui-blank .ucli,ui-blank .ucli *{box-sizing:border-box;}
ui-blank .ucli{background:var(--ucli-bg,#0C0D0C);border:1px solid var(--ucli-border,#3B2A20);border-radius:10px;overflow:hidden;
  font-family:ui-monospace,"Cascadia Code","JetBrains Mono",Consolas,"Noto Sans Mono CJK TC","Microsoft JhengHei",monospace;}
ui-blank .ucli-bar{display:grid;grid-template-columns:72px minmax(0,1fr) 72px;align-items:center;background:var(--ucli-bar,#3B2A20);padding:8px 12px;}
ui-blank .ucli-bar.is-win{grid-template-columns:minmax(0,1fr) auto;}
ui-blank .ucli-dots{display:flex;gap:8px;}
ui-blank .ucli-dots span{display:block;width:12px;height:12px;border-radius:50%;}
ui-blank .ucli-title{font-size:.8125rem;color:var(--ucli-title,#C6C7BD);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
ui-blank .ucli-bar.is-win .ucli-title{text-align:left;}
ui-blank .ucli-winbtns{display:flex;gap:18px;font-size:.8125rem;color:var(--ucli-title,#C6C7BD);}
ui-blank .ucli-screen{position:relative;box-sizing:border-box;padding:16px 20px;font-size:var(--ucli-font-size,1rem);line-height:1.6;color:var(--ucli-text,#C6C7BD);
  white-space:pre-wrap;word-break:break-word;min-height:var(--ucli-min-height,160px);height:var(--ucli-height,auto);overflow-y:auto;cursor:text;}
ui-blank .ucli-line{min-height:1.6em;}
ui-blank .ucli-prompt{color:var(--ucli-prompt,#51DBCF);font-weight:700;margin:0 10px 0 0;}
ui-blank .ucli-in{color:var(--ucli-in,#DBEDD8);}
ui-blank .ucli-out{color:var(--ucli-out,#A3C4BC);}
ui-blank .ucli-ask{color:var(--ucli-ask,#E3D322);}
ui-blank .ucli-ghost{color:#86877F;}
ui-blank .ucli-cursor{display:inline-block;vertical-align:text-bottom;background:var(--ucli-cursor,#51DBCF);animation:ucli-blink 1.06s steps(1) infinite;}
ui-blank .ucli-cursor.is-block{width:.6em;height:1.25em;}
ui-blank .ucli-cursor.is-underline{width:.6em;height:2px;vertical-align:baseline;}
ui-blank .ucli-cursor.is-bar{width:2px;height:1.25em;}
ui-blank .ucli.is-typing .ucli-cursor{animation:none;}
@keyframes ucli-blink{0%{visibility:visible}50%{visibility:hidden}}
ui-blank .ucli-input{position:absolute;left:0;top:0;width:1px;height:1em;padding:0;margin:0;border:0;outline:0;opacity:0;font-size:16px;}
ui-blank .ucli-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 12px;border-top:1px solid var(--ucli-border,#3B2A20);background:#151615;}
ui-blank .ucli-btn{font-family:inherit;font-size:.8125rem;line-height:1.4;background:#0C0D0C;color:#C6C7BD;border:1px solid #86877F;border-radius:6px;padding:4px 10px;cursor:pointer;}
ui-blank .ucli-btn:hover{border-color:var(--ucli-prompt,#51DBCF);color:var(--ucli-prompt,#51DBCF);}
ui-blank .ucli-btn.is-on,ui-blank .ucli-btn.is-on:hover{background:var(--ucli-prompt,#51DBCF);border-color:var(--ucli-prompt,#51DBCF);color:#0C0D0C;}
ui-blank .ucli-btn:disabled,ui-blank .ucli-btn:disabled:hover{background:#0C0D0C;border-color:#3B2A20;color:#86877F;cursor:not-allowed;}
ui-blank .ucli-sep{width:1px;height:20px;background:#3B2A20;margin:0 4px;}
ui-blank .ucli-state{flex:1;text-align:right;font-size:.8125rem;color:#86877F;}
`;
    document.head.appendChild(style);
  }

  const CLI_METHODS = {
    /* ---- 建置 ---- */
    _cliInit() {
      if (this._cliBuilt) return;
      this._cliBuilt = true;
      injectCliStyleOnce();
      this._cliSteps = Array.prototype.filter.call(this.children, (el) =>
        /^CLI-(IN|OUT|ASK|WAIT)$/.test(el.tagName)).map((el) => ({
          type: el.tagName.slice(4).toLowerCase(),
          el: el.cloneNode(true)
        }));
      this._run = 0;
      this._paused = false;
      this._resumeQ = [];
      this._rate = 1;
      this._ff = false;
      this._started = false;
      this._history = [];
      this._asking = null;
      this._cliBuildDom();
      this._cliIdleScreen();
      this._cliSetupStart();
    },

    _cliBuildDom() {
      this.innerHTML = '';
      const css = (name, value) => { if (value) this.style.setProperty(name, value); };
      css('--ucli-width', this.getAttribute('width'));
      css('--ucli-font-size', this.getAttribute('font-size'));
      css('--ucli-height', this._cliLen(this.getAttribute('height')));
      css('--ucli-min-height', this._cliLen(this.getAttribute('min-height')));
      css('--ucli-bg', parseColor(this.getAttribute('bg-color')));
      css('--ucli-text', parseColor(this.getAttribute('text-color')));
      css('--ucli-prompt', parseColor(this.getAttribute('prompt-color')));
      css('--ucli-cursor', parseColor(this.getAttribute('prompt-color')));
      css('--ucli-in', parseColor(this.getAttribute('in-color')));
      css('--ucli-out', parseColor(this.getAttribute('out-color')));
      css('--ucli-ask', parseColor(this.getAttribute('ask-color')));
      css('--ucli-bar', parseColor(this.getAttribute('bar-color')));
      css('--ucli-title', parseColor(this.getAttribute('title-color')));

      const box = document.createElement('div');
      box.className = 'ucli';
      const frame = (this.getAttribute('frame') || 'mac').toLowerCase();
      const title = this.getAttribute('title') || 'terminal';
      if (frame === 'mac') {
        const bar = document.createElement('div');
        bar.className = 'ucli-bar';
        bar.innerHTML = '<div class="ucli-dots"><span style="background:#EF6661"></span><span style="background:#E3D322"></span><span style="background:#71CD76"></span></div><div class="ucli-title"></div><div></div>';
        bar.querySelector('.ucli-title').textContent = title;
        box.appendChild(bar);
      } else if (frame === 'win') {
        const bar = document.createElement('div');
        bar.className = 'ucli-bar is-win';
        bar.innerHTML = '<div class="ucli-title"></div><div class="ucli-winbtns"><span>&#x2500;</span><span>&#x2610;</span><span>&#x2715;</span></div>';
        bar.querySelector('.ucli-title').textContent = title;
        box.appendChild(bar);
      }
      this.removeAttribute('title');   // 避免瀏覽器把 title 當成整個元件的滑鼠提示
      this._cliTitle = title;

      const screen = document.createElement('div');
      screen.className = 'ucli-screen';
      box.appendChild(screen);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'ucli-input';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('aria-label', this.getAttribute('aria-label') || 'CLI input');
      input.tabIndex = -1;
      screen.appendChild(input);
      input.addEventListener('input', () => this._cliAskRender());
      input.addEventListener('keydown', (e) => this._cliAskKey(e));
      screen.addEventListener('click', () => {
        if (this._asking) this._input.focus({ preventScroll: true });
        else if (!this._started) this.play();
      });

      this._box = box;
      this._screen = screen;
      this._input = input;

      if (this.getAttribute('controls') !== 'false') {
        const bar = document.createElement('div');
        bar.className = 'ucli-controls';
        const btn = (cls, text, tip) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'ucli-btn ' + cls;
          b.textContent = text;
          b.title = tip;
          bar.appendChild(b);
          return b;
        };
        this._btnPlay = btn('ucli-play', '▶ 播放', '播放／暫停');
        this._btnRestart = btn('ucli-restart', '↺ 重播', '從頭播放');
        this._btnSkip = btn('ucli-skip', '⏭ 快轉', '快轉到下一個作答處；作答時則略過');
        const sep = document.createElement('span');
        sep.className = 'ucli-sep';
        bar.appendChild(sep);
        this._rateBtns = CLI_RATES.map((r) => {
          const b = btn('ucli-rate', r + '×', '播放速度 ' + r + ' 倍');
          b.addEventListener('click', () => { this.rate = r; });
          return b;
        });
        this._stateEl = document.createElement('span');
        this._stateEl.className = 'ucli-state';
        bar.appendChild(this._stateEl);
        this._btnPlay.addEventListener('click', () => {
          if (!this._started || this._ended) this.play();
          else if (this._paused) this.play();
          else this.pause();
        });
        this._btnRestart.addEventListener('click', () => this.restart());
        this._btnSkip.addEventListener('click', () => this._cliSkip());
        box.appendChild(bar);
      }
      this.appendChild(box);
      this._cliSyncControls();
    },

    _cliLen(v) {
      if (!v) return null;
      const s = String(v).trim();
      return /^\d+(\.\d+)?$/.test(s) ? s + 'px' : s;
    },

    _cliNum(name, def, min, max) {
      const v = parseFloat(this.getAttribute(name));
      if (isNaN(v)) return def;
      return Math.min(max, Math.max(min, v));
    },

    _cliStepNum(el, name, def) {
      const v = parseFloat(el.getAttribute(name));
      return isNaN(v) ? def : v;
    },

    /* 播放前的畫面：一個提示符號加閃爍游標 */
    _cliIdleScreen() {
      this._cliClear();
      const first = this._cliSteps.find((s) => s.type === 'in' || s.type === 'ask');
      const line = this._cliLine(first ? this._cliPromptOf(first.el) : this._cliPromptOf(null));
      line.appendChild(this._cliCursor());
      this._cliSetState(this.getAttribute('autoplay') === 'false' ? '按 ▶ 播放開始' : '');
    },

    _cliClear() {
      Array.prototype.slice.call(this._screen.children).forEach((n) => { if (n !== this._input) n.remove(); });
      this._box.classList.remove('is-typing');
    },

    _cliSetupStart() {
      if (this.getAttribute('autoplay') === 'false') return;
      if (!('IntersectionObserver' in window)) { this.play(); return; }
      this._io = new IntersectionObserver((entries) => {
        for (const en of entries) {
          const enough = en.intersectionRatio >= 0.6 || en.intersectionRect.height >= window.innerHeight * 0.8;
          if (en.isIntersecting && enough && !this._started) {
            this.play();
            this._io.disconnect();
            this._io = null;
            break;
          }
        }
      }, { threshold: [0.2, 0.4, 0.6, 0.8, 1] });
      this._io.observe(this);
    },

    /* ---- 公開方法 ---- */
    play() {
      if (!this._cliBuilt) return;
      if (!this._started || this._ended) { this._cliRun(); return; }
      if (this._paused) {
        this._paused = false;
        const q = this._resumeQ;
        this._resumeQ = [];
        q.forEach((fn) => fn());
        this._cliSyncControls();
      }
    },

    pause() {
      if (!this._cliBuilt || !this._started || this._ended || this._asking) return;
      this._paused = true;
      this._box.classList.remove('is-typing');
      this._cliSyncControls();
    },

    restart() {
      if (!this._cliBuilt) return;
      this._cliRun();
    },

    /* ---- 播放流程 ---- */
    async _cliRun() {
      const run = ++this._run;
      this._started = true;
      this._ended = false;
      this._paused = false;
      this._resumeQ = [];
      this._ff = false;
      this._asking = null;
      this._input.value = '';
      this._input.blur();
      this._cliClear();
      this._cliSyncControls();
      try {
        for (let i = 0; i < this._cliSteps.length; i++) {
          await this._cliStep(this._cliSteps[i], i, run);
        }
        if (run !== this._run) return;
        this._ended = true;
        this._ff = false;
        if (this.getAttribute('end-prompt') !== 'false') {
          const line = this._cliLine(this._cliPromptOf(null));
          line.appendChild(this._cliCursor());
          this._cliScroll();
        }
        this._cliSyncControls();
        this.dispatchEvent(new CustomEvent('cli-end', { bubbles: true }));
      } catch (err) {
        if (err !== CLI_CANCEL) throw err;
      }
    },

    async _cliStep(step, index, run) {
      const el = step.el;
      const lineDelay = this._cliNum('line-delay', 450, 0, 10000);
      if (step.type === 'wait') {
        await this._cliWait(this._cliStepNum(el, 'ms', 800), run);
        return;
      }
      if (step.type === 'in') {
        await this._cliWait(this._cliStepNum(el, 'delay', lineDelay), run);
        const line = this._cliLine(this._cliPromptOf(el));
        const span = document.createElement('span');
        span.className = 'ucli-in';
        this._cliTheme(span, el);
        line.appendChild(span);
        const cur = this._cliCursor();
        line.appendChild(cur);
        this._cliScroll();
        await this._cliWait(Math.min(lineDelay, 600) * 0.6, run);
        const cps = this._cliStepNum(el, 'speed', this._cliNum('speed', 20, 1, 400));
        await this._cliType(span, el, cps, this.getAttribute('humanize') !== 'false', run);
        await this._cliWait(220, run);   // 按下 Enter 前的停頓
        cur.remove();
        return;
      }
      if (step.type === 'out') {
        await this._cliWait(this._cliStepNum(el, 'delay', 250), run);
        const line = this._cliLine(null);
        const span = document.createElement('span');
        span.className = 'ucli-out';
        this._cliTheme(span, el);
        line.appendChild(span);
        const cps = this._cliStepNum(el, 'speed', this._cliNum('out-speed', 120, 0, 2000));
        await this._cliType(span, el, cps, false, run);
        return;
      }
      if (step.type === 'ask') {
        await this._cliWait(this._cliStepNum(el, 'delay', lineDelay), run);
        this._ff = false;
        const value = await this._cliAsk(el, index, run);
        this.dispatchEvent(new CustomEvent('cli-answer', { bubbles: true, detail: { value, index } }));
        this.dispatchEvent(new CustomEvent('blank-submit', { bubbles: true, detail: { value: value.trim(), raw: value, valid: null } }));
      }
    },

    /* 逐字打出：複製子標籤的結構，清空所有文字節點後依序補回字元，保留行內色名標籤等格式 */
    async _cliType(span, srcEl, cps, human, run) {
      const tpl = srcEl.cloneNode(true);
      const keepWs = srcEl.hasAttribute('pre');
      const texts = [];
      const walker = document.createTreeWalker(tpl, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) texts.push(walker.currentNode);
      if (keepWs) {
        this._cliDedent(texts);
      } else {
        texts.forEach((t) => { t.data = t.data.replace(/\s+/g, ' '); });
        const nonEmpty = texts.filter((t) => t.data.length);
        if (nonEmpty.length) {
          nonEmpty[0].data = nonEmpty[0].data.replace(/^ /, '');
          const last = nonEmpty[nonEmpty.length - 1];
          last.data = last.data.replace(/ $/, '');
        }
      }
      const full = texts.map((t) => t.data);
      texts.forEach((t) => { t.data = ''; });
      while (tpl.firstChild) span.appendChild(tpl.firstChild);

      if (!cps || this._ff) {
        texts.forEach((t, i) => { t.data = full[i]; });
        this._cliScroll();
        return;
      }
      this._box.classList.add('is-typing');
      const base = 1000 / cps;
      for (let i = 0; i < texts.length; i++) {
        const str = full[i];
        let k = 0;
        while (k < str.length) {
          if (this._ff) { texts[i].data = str; k = str.length; break; }
          // 每次至少等 16ms；速度很快時一次補多個字，避免計時器精度不足而變慢
          const step = Math.max(1, Math.round(16 / (base / this._rate)));
          const n = human ? 1 : step;
          texts[i].data += str.slice(k, k + n);
          const ch = str[k + n - 1];
          k += n;
          this._cliScroll();
          let d = human ? base * (0.55 + Math.random() * 0.9) : base * n;
          if (human && ch === ' ') d += base * 0.4;
          if (human && /[,.;:!?，。；：！？]/.test(ch)) d += base * 3;
          await this._cliWait(d, run, true);
        }
        for (let j = i + 1; j < texts.length && this._ff; j++) texts[j].data = full[j];
        if (this._ff) break;
      }
      this._box.classList.remove('is-typing');
      this._cliScroll();
    },

    _cliDedent(texts) {
      const all = texts.map((t) => t.data).join('\u0000');
      const lines = all.replace(/^\n+/, '').replace(/\s+$/, '').split('\n');
      const ind = Math.min(...lines.filter((l) => l.replace(/\u0000/g, '').trim()).map((l) => l.match(/^[ \t]*/)[0].length));
      const out = (ind > 0 && isFinite(ind)) ? lines.map((l) => l.slice(Math.min(ind, l.match(/^[ \t]*/)[0].length))).join('\n') : lines.join('\n');
      const parts = out.split('\u0000');
      texts.forEach((t, i) => { t.data = parts[i] || ''; });
    },

    /* 等待：受倍率、暫停、快轉、重播影響 */
    _cliWait(ms, run, typing) {
      return new Promise((resolve, reject) => {
        const go = () => {
          if (run !== this._run) { reject(CLI_CANCEL); return; }
          if (this._paused) { this._resumeQ.push(go); return; }
          if (this._ff || ms <= 0) { resolve(); return; }
          setTimeout(() => {
            if (run !== this._run) { reject(CLI_CANCEL); return; }
            if (this._paused) {
              if (typing) this._box.classList.remove('is-typing');
              this._resumeQ.push(() => {
                if (run !== this._run) { reject(CLI_CANCEL); return; }
                if (typing) this._box.classList.add('is-typing');
                resolve();
              });
              return;
            }
            resolve();
          }, ms / this._rate);
        };
        go();
      });
    },

    /* ---- 使用者作答 ---- */
    _cliAsk(el, index, run) {
      return new Promise((resolve, reject) => {
        const line = this._cliLine(this._cliPromptOf(el));
        const typed = document.createElement('span');
        typed.className = 'ucli-ask';
        this._cliTheme(typed, el);
        const cur = this._cliCursor();
        const ghost = document.createElement('span');
        ghost.className = 'ucli-ghost';
        ghost.textContent = el.getAttribute('placeholder') || '';
        line.append(typed, cur, ghost);
        this._input.value = '';
        this._histPos = this._history.length;
        this._asking = { el, line, typed, cur, ghost, run, index,
          done: (v) => {
            if (run !== this._run) { reject(CLI_CANCEL); return; }
            this._asking = null;
            ghost.remove();
            cur.remove();
            typed.textContent = v;
            this._input.value = '';
            this._input.blur();
            if (v.trim()) this._history.push(v);
            this._cliSyncControls();
            resolve(v);
          } };
        this._cliSyncControls();
        this._cliScroll();
        this._cliPlaceInput();
        const r = this.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) this._input.focus({ preventScroll: true });
      });
    },

    _cliAskRender() {
      const a = this._asking;
      if (!a) return;
      a.typed.textContent = this._input.value;
      a.ghost.hidden = this._input.value.length > 0;
      this._cliPlaceInput();
      this._cliScroll();
    },

    _cliAskKey(e) {
      const a = this._asking;
      if (!a) return;
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        const v = this._input.value;
        if (!v.trim() && !a.el.hasAttribute('allow-empty')) return;
        a.done(v);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (!this._history.length) return;
        e.preventDefault();
        this._histPos = Math.max(0, Math.min(this._history.length, this._histPos + (e.key === 'ArrowUp' ? -1 : 1)));
        this._input.value = this._history[this._histPos] || '';
        this._cliAskRender();
      }
    },

    _cliPlaceInput() {
      const a = this._asking;
      if (!a) return;
      this._input.style.left = a.cur.offsetLeft + 'px';
      this._input.style.top = a.cur.offsetTop + 'px';
    },

    /* 快轉：播放中快轉到下一個作答處；作答中則略過，有 sample 時自動打出示範句 */
    async _cliSkip() {
      if (!this._started || this._ended) return;
      const a = this._asking;
      if (!a) {
        this._ff = true;
        if (this._paused) this.play();
        return;
      }
      if (this._skipping) return;
      const sample = a.el.getAttribute('sample');
      if (!sample) { a.done(''); return; }
      this._skipping = true;
      this._input.blur();
      a.ghost.hidden = true;
      const run = a.run;
      try {
        a.typed.textContent = '';
        this._box.classList.add('is-typing');
        const base = 1000 / this._cliNum('speed', 20, 1, 400);
        for (const ch of sample) {
          a.typed.textContent += ch;
          this._cliScroll();
          await this._cliWait(base * (0.55 + Math.random() * 0.9), run, true);
        }
        this._box.classList.remove('is-typing');
        await this._cliWait(220, run);
        if (this._asking === a) a.done(sample);
      } catch (err) {
        if (err !== CLI_CANCEL) throw err;
      } finally {
        this._skipping = false;
      }
    },

    /* ---- 小工具 ---- */
    _cliPromptOf(el) {
      if (el && el.hasAttribute('prompt')) return el.getAttribute('prompt');
      const p = this.getAttribute('prompt');
      return p === null ? '$' : p;
    },

    _cliLine(prompt) {
      const line = document.createElement('div');
      line.className = 'ucli-line';
      if (prompt) {
        const p = document.createElement('span');
        p.className = 'ucli-prompt';
        p.textContent = prompt;
        line.appendChild(p);
      }
      this._screen.insertBefore(line, this._input);
      return line;
    },

    _cliCursor() {
      const c = document.createElement('span');
      const shape = (this.getAttribute('cursor') || 'block').toLowerCase();
      c.className = 'ucli-cursor is-' + (['block', 'underline', 'bar'].indexOf(shape) !== -1 ? shape : 'block');
      return c;
    },

    _cliTheme(span, el) {
      const color = parseColor(el.getAttribute('theme'));
      if (color) span.style.color = color;
    },

    _cliScroll() {
      const s = this._screen;
      if (s.scrollHeight > s.clientHeight) s.scrollTop = s.scrollHeight;
    },

    _cliSetState(text) {
      if (this._stateEl) this._stateEl.textContent = text;
    },

    _cliSyncControls() {
      if (!this._btnPlay) return;
      const playing = this._started && !this._ended && !this._paused;
      this._btnPlay.textContent = playing ? '❚❚ 暫停' : '▶ 播放';
      this._btnPlay.disabled = !!this._asking;
      this._btnSkip.textContent = this._asking ? '⏭ 略過' : '⏭ 快轉';
      this._btnSkip.disabled = !this._started || this._ended;
      this._btnRestart.disabled = !this._started;
      this._rateBtns.forEach((b, i) => b.classList.toggle('is-on', CLI_RATES[i] === this._rate));
      if (this._asking) this._cliSetState('輪到你輸入，按 Enter 繼續');
      else if (this._ended) this._cliSetState('播放完畢');
      else if (this._paused) this._cliSetState('已暫停');
      else if (this._started) this._cliSetState('');
    }
  };

  Object.defineProperty(CLI_METHODS, 'rate', {
    enumerable: true,
    get() { return this._rate || 1; },
    set(v) {
      const r = parseFloat(v);
      if (!(r > 0)) return;
      this._rate = Math.min(8, Math.max(0.1, r));
      if (this._cliBuilt) this._cliSyncControls();
    }
  });

  Object.defineProperties(UiBlank.prototype, Object.getOwnPropertyDescriptors(CLI_METHODS));

  customElements.define('ui-blank', UiBlank);
})();

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
