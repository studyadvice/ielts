/*!
 * ui-inputs.js — 輸入／驗證類元件集合
 *
 * 目前包含：
 * - <ui-otp>：單一 input 版 OTP 輸入／驗證元件，另外還有一個「生成模式」
 *   可以隨機產生一組驗證碼給使用者複製。
 * - <ui-blank>：單行輸入填充題元件，自帶 Bootstrap Icons 的送出按鈕與內建驗證。
 *
 * ========================= <ui-otp> mode="input"（預設） =========================
 *
 * 用法：
 * <ui-otp length="6" groups="3,3" type="numeric" expected-value="123456"></ui-otp>
 *
 * 內部只有一個真正接收鍵盤輸入的 <input>（opacity:0，蓋滿整個元件，
 * 點任何一格都會聚焦到它），畫面上看到的每一格都是純展示用的 <div>，
 * 內容由 JS 依照 input 目前的 value 同步產生。好處是不用處理「跳格」
 * 「倒退鍵合併」這類焦點邏輯 —— 原生 input 本來就會處理游標移動、
 * 選取、刪除、貼上整串驗證碼；元件只負責把 value 拆開顯示、畫出目前
 * 作用中那一格的 focus ring，以及處理驗證。
 *
 * 三種驗證方式（依序判斷）：
 * 1. 給 check-url：填滿後自動打後端 API 確認這組碼是否存在資料庫（見下方
 *    「後端驗證／查重」說明），回來的結果決定 valid/invalid。
 * 2. 沒有 check-url、但有給 expected-value：前端比對，填滿自動比對。
 * 3. 兩者都沒給：外部非同步驗證模式，監聽 'otp-complete' 事件自行打 API，
 *    驗證完呼叫 el.setState('valid' | 'invalid' | 'idle')。
 *
 * 事件：
 * - 'otp-input'：每次內容變動，detail = { value, complete }
 * - 'otp-complete'：填滿整組格子時，detail = { value, valid }
 *   （valid 在前端比對／後端驗證模式下是 true/false，外部驗證模式下是 null）
 *
 * clear-on-invalid（布林）：驗證失敗時自動清空重輸，延遲時間由 clear-delay
 * 控制（毫秒，預設 700）。
 *
 * ========================= <ui-otp> mode="generate" =========================
 *
 * 用法：
 * <ui-otp mode="generate" length="16" separator="-" groups="4,4,4,4"
 *   check-url="check_code.php"></ui-otp>
 *
 * 連結到畫面時自動隨機產生一組碼（唯讀展示，非輸入），格子旁邊會有一個
 * 複製到剪貼簿的按鈕。格式可以用 length/groups/separator（跟 input 模式
 * 共用同一套概念），或是改用更彈性的 format 屬性直接寫版型字串，例如
 * format="OOOO-OOOOO-OOOOOO"，用 O 代表一個產生出來的字元，其他字元
 * 原樣當作固定分隔符號插入（有給 format 就以它為準，忽略 length/groups）。
 *
 * exclude-ambiguous（布林，預設開）：排除容易看錯的字元（0/O、1/I/l）。
 *
 * 後端驗證／查重（check-url，generate 與 input 模式共用同一套屬性）：
 * - check-url：後端驗證端點網址。
 * - check-method：GET 或 POST，預設 POST。
 * - check-param：送出碼時的參數名稱，預設 "code"。
 * - check-field：後端回傳 JSON 裡「是否存在」欄位的名稱，預設 "exists"
 *   （值是布林，true 代表已存在於資料庫）。
 * - check-max-retries：generate 模式下，重複就重骰的次數上限，預設 5。
 *
 * generate 模式事件：
 * - 'otp-check-start'：開始打 API 檢查，detail = { value }
 * - 'otp-check-result'：單次檢查結果，detail = { value, exists }
 * - 'otp-generated'：最終確定可用的碼，detail = { value, attempts }
 * - 'otp-check-exhausted'：超過重試上限仍重複，detail = { value, attempts }
 * - 'otp-check-error'：API 本身出錯，detail = { error }
 * - 'otp-copied'：複製成功，detail = { value }
 *
 * 公開方法／屬性（JS property，非 HTML attribute）：
 * - el.value（get/set）
 * - el.reset()：input 模式清空重填；generate 模式重新產生一組新碼
 * - el.generate()：generate 模式專用，手動重新產生（會重跑 check-url 查重）
 * - el.setState('valid' | 'invalid' | 'idle')
 * - el.focus()
 */
(function () {
  'use strict';

  const BRAND_COLORS = {
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
  border-color:var(--uo-focus-ring-color,var(--uo-accent-color,#82C8E5));
}
ui-otp.is-focused .uo-cell.is-active-cell{
  box-shadow:0 0 0 var(--uo-focus-ring-width,3px) var(--uo-focus-ring-shadow,rgba(130,200,229,.35));
}
ui-otp .uo-cell.is-active-cell::after{
  content:'';
  display:var(--uo-caret-display,none);
  width:2px;
  height:55%;
  background:var(--uo-focus-ring-color,var(--uo-accent-color,#82C8E5));
  animation:uo-blink 1s step-start infinite;
}
@keyframes uo-blink{ 50%{ opacity:0; } }

ui-otp.is-valid .uo-cell{
  border-color:var(--uo-valid-color,#27AE60);
}
ui-otp.is-invalid .uo-cell{
  border-color:var(--uo-error-color,#E6374B);
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
  color:var(--uo-error-color,#E6374B);
}
ui-otp.is-valid .uo-message{
  color:var(--uo-valid-color,#27AE60);
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
  background:var(--uo-copy-btn-bg,var(--uo-accent-color,#82C8E5));
  border:var(--uo-border-width,1px) solid var(--uo-accent-color,#82C8E5);
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
  box-shadow:0 0 0 var(--ub-focus-ring-width,3px) var(--ub-focus-ring-shadow,rgba(130,200,229,.35));
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
  border-color:var(--ub-focus-ring-color,var(--ub-accent-color,#82C8E5));
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
  background:var(--ub-btn-bg,var(--ub-accent-color,#82C8E5));
  border:var(--ub-border-width,1px) solid var(--ub-accent-color,#82C8E5);
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
  border-color:var(--ub-valid-color,#27AE60);
}
ui-blank.is-invalid .ub-input,
ui-blank.is-invalid .ub-button{
  border-color:var(--ub-error-color,#E6374B);
}
ui-blank.is-disabled .ub-input,
ui-blank.is-disabled .ub-button{
  opacity:.5;
}

ui-blank .ub-message{
  margin-top:6px;
  font-size:var(--ub-message-font-size,0.85rem);
  line-height:1.4;
  color:var(--ub-error-color,#E6374B);
}
ui-blank.is-valid .ub-message{
  color:var(--ub-valid-color,#27AE60);
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
    get value() { return this._input.value; }
    set value(v) { this._input.value = v == null ? '' : String(v); }

    reset() {
      this._input.value = '';
      this._state = 'idle';
      this.classList.remove('is-valid', 'is-invalid');
      this._renderMessage();
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

    focus() { this._input.focus(); }

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
      const fillBase = this._state === 'valid' ? (validColor || '#27AE60')
        : this._state === 'invalid' ? (errorColor || '#E6374B') : null;
      if (fillBase) set('--ub-message-fill', toRgba(fillBase, 0.15));
      this._renderMessage();
    }
  }

  customElements.define('ui-blank', UiBlank);
})();
