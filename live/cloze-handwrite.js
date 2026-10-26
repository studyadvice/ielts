/* =========================================================
 * cloze-handwrite.js
 * 觸控筆克漏字手寫教學元件（中英對照／方括號挖空／手寫回存）
 *
 * 自訂標籤：
 *   <ui-import>          檔案匯入（.txt / .json）
 *   <ui-collapse>         通用收合元件
 *   <ui-cloze-text>      英文克漏字正文＋字體縮放
 *   <ui-bilingual-block> 單一題組（中文可收合＋英文克漏字）
 *   <ui-handwrite-modal> 觸控筆書寫視窗（全頁僅需一個實體）
 *
 * 對外介面：window.ClozeHandwrite
 *   .parseTxt(text)         → [{zh, en}]
 *   .parseJson(text)        → [{zh, en}]
 *   .showAlert(msg, type)   取代原生 alert
 *   .palette                品牌色票物件
 *   .penColorOptions        筆跡顏色下拉選項 [[key, label], ...]
 * ========================================================= */
(function () {
  'use strict';

  /* ---------- 品牌配色 ---------- */
  var PALETTE = {
    bg: '#0C0D0C',
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

  var PEN_COLOR_OPTIONS = [
    ['shell', '殼白 shell'],
    ['ocean', '海洋藍 ocean'],
    ['sky', '天空藍 sky'],
    ['special', '嫩綠 special'],
    ['vanilla', '香草白 vanilla'],
    ['yellow', '黃 yellow'],
    ['salmon', '鮭粉 salmon'],
    ['pink', '粉紅 pink'],
    ['orange', '橙 orange'],
    ['lavender', '薰衣草 lavender'],
    ['indigo', '靛 indigo']
  ];

  function injectStyles() {
    if (document.getElementById('cloze-handwrite-styles')) return;
    var css = ''
      + ':root{'
      + '--c-bg:' + PALETTE.bg + ';--c-shell:' + PALETTE.shell + ';--c-lavender:' + PALETTE.lavender + ';'
      + '--c-sky:' + PALETTE.sky + ';--c-warning:' + PALETTE.warning + ';--c-salmon:' + PALETTE.salmon + ';'
      + '--c-ocean:' + PALETTE.ocean + ';--c-safe:' + PALETTE.safe + ';--c-teal:' + PALETTE.teal + ';'
      + '--c-vanilla:' + PALETTE.vanilla + ';--c-yellow:' + PALETTE.yellow + ';--c-focus:' + PALETTE.focus + ';'
      + '--c-special:' + PALETTE.special + ';--c-info:' + PALETTE.info + ';--c-indigo:' + PALETTE.indigo + ';'
      + '--c-pink:' + PALETTE.pink + ';--c-orange:' + PALETTE.orange + ';'
      + '--en-font-size:1.6rem;'
      + '}'

      + 'body{min-width:1080px;margin:0;background:var(--c-bg);color:var(--c-shell);'
      + 'font-family:-apple-system,"Segoe UI","Noto Sans TC",sans-serif;font-size:1rem;}'
      + 'ui-import,ui-bilingual-block,ui-cloze-text,ui-collapse{display:block;}'

      + '.ci-bar{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#17181a;border:1px solid #2a2b28;border-radius:8px;flex-wrap:wrap;}'
      + '.ci-bar input[type=file]{color:var(--c-shell);font-size:0.9rem;}'
      + '.ci-btn{font-size:0.95rem;padding:8px 14px;border-radius:6px;border:1px solid #3a3b37;background:#202119;color:var(--c-shell);cursor:pointer;}'
      + '.ci-btn:hover{border-color:var(--c-ocean);color:var(--c-ocean);}'
      + '.ci-hint{font-size:0.8rem;color:#9a9b94;}'

      /* ---- 收合元件 ---- */
      + '.cc-head{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;padding:8px 12px;background:#15241f;border-left:4px solid var(--c-teal);border-radius:4px;}'
      + '.cc-head .cc-arrow{display:inline-block;transition:transform .15s ease;color:var(--c-teal);font-size:0.9rem;}'
      + '.cc-head.cc-collapsed .cc-arrow{transform:rotate(-90deg);}'
      + '.cc-body{padding:10px 16px 4px 16px;font-size:1.05rem;line-height:1.5;color:var(--c-shell);}'
      + '.cc-body.cc-collapsed{display:none;}'

      /* ---- 題組區塊 ---- */
      + '.bb-wrap{margin-bottom:56px;padding:18px;background:#131412;border:1px solid #26271f;border-radius:10px;}'
      + '.bb-zh{margin-bottom:56px;}'
      + '.en-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:20px;}'
      + '.en-toolbar .zoom-btn{width:34px;height:34px;border-radius:6px;border:1px solid #3a3b37;background:#202119;color:var(--c-shell);font-size:1.1rem;cursor:pointer;}'
      + '.en-toolbar .zoom-btn:hover{border-color:var(--c-sky);color:var(--c-sky);}'
      + '.en-toolbar .zoom-label{font-size:0.85rem;color:#9a9b94;}'
      + '.en-body{font-size:var(--en-font-size);line-height:1.5;color:var(--c-shell);}'

      /* ---- 克漏字空格 ---- */
      + '.blank{position:relative;display:inline-block;min-width:2.2em;margin:0 2px;vertical-align:bottom;'
      + 'border-bottom:2px dashed var(--c-sky);cursor:pointer;text-align:center;}'
      + '.blank .blank-hint{opacity:0.5;font-size:0.85em;}'
      + '.blank:hover{border-color:var(--c-ocean);}'
      + '.blank.filled{cursor:default;border-bottom:2px solid var(--c-teal);}'
      + '.blank.filled img{display:block;height:1.3em;width:auto;max-width:none;margin:0 auto;}'
      + '.blank-clear{position:absolute;top:-10px;right:-8px;width:16px;height:16px;line-height:14px;'
      + 'text-align:center;border-radius:50%;background:var(--c-warning);color:#fff;font-size:11px;'
      + 'cursor:pointer;border:none;padding:0;}'

      /* ---- Modal ---- */
      + '.hw-backdrop{position:fixed;inset:0;background:rgba(12,13,12,0.86);display:none;align-items:center;justify-content:center;z-index:999;}'
      + '.hw-backdrop.open{display:flex;}'
      + '.hw-dialog{background:#17181a;border:1px solid #33342f;border-radius:12px;padding:20px;width:720px;'
      + 'max-width:92vw;box-shadow:0 10px 40px rgba(0,0,0,0.82);}'
      + '.hw-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}'
      + '.hw-title{font-size:1.1rem;color:var(--c-shell);}'
      + '.hw-close{background:none;border:none;color:#9a9b94;font-size:1.3rem;cursor:pointer;}'
      + '.hw-close:hover{color:var(--c-warning);}'
      + '.hw-canvas-wrap{background:#0f100e;border:1px dashed #3a3b37;border-radius:8px;touch-action:none;}'
      + '.hw-canvas-wrap canvas{display:block;width:100%;height:280px;touch-action:none;}'
      + '.hw-foot{display:flex;justify-content:flex-end;gap:10px;margin-top:16px;}'
      + '.hw-btn{font-size:0.95rem;padding:9px 18px;border-radius:6px;border:1px solid #3a3b37;background:#202119;color:var(--c-shell);cursor:pointer;}'
      + '.hw-btn.primary{background:var(--c-teal);border-color:var(--c-teal);color:#07211d;font-weight:600;}'
      + '.hw-btn.danger{color:var(--c-warning);}'
      + '.hw-btn:hover{filter:brightness(1.15);}'

      /* ---- 全域筆跡設定區塊 ---- */
      + '.pen-settings{display:flex;align-items:center;gap:16px;padding:10px 16px;background:#17181a;'
      + 'border:1px solid #2a2b28;border-radius:8px;margin-top:12px;font-size:0.9rem;color:var(--c-shell);flex-wrap:wrap;}'
      + '.pen-settings label{display:flex;align-items:center;gap:6px;}'
      + '.pen-settings select,.pen-settings input[type=number]{background:#0f100e;border:1px solid #3a3b37;'
      + 'color:var(--c-shell);border-radius:4px;padding:4px 6px;font-size:0.9rem;}'

      /* ---- 提示訊息（取代 alert） ---- */
      + '.app-alert{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:1200;padding:10px 20px;'
      + 'border-radius:8px;font-size:0.9rem;background:rgba(230,55,75,0.9);color:#fff;box-shadow:0 4px 18px rgba(0,0,0,0.8);}'
      + '.app-alert.info{background:rgba(65,113,191,0.9);}'
      ;
    var style = document.createElement('style');
    style.id = 'cloze-handwrite-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- 共用：取代 alert 的提示 ---------- */
  function showAlert(msg, type) {
    var el = document.createElement('div');
    el.className = 'app-alert' + (type === 'info' ? ' info' : '');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, 3200);
  }

  /* ---------- 解析：txt / json → [{zh, en}] ---------- */
  function parseTxt(text) {
    var pairs = [];
    var re = /\[ZH\]\s*([\s\S]*?)\[EN\]\s*([\s\S]*?)(?=\[ZH\]|$)/gi;
    var m;
    while ((m = re.exec(text)) !== null) {
      var zh = m[1].trim();
      var en = m[2].trim();
      if (zh || en) pairs.push({ zh: zh, en: en });
    }
    return pairs;
  }

  function parseJson(text) {
    var data = JSON.parse(text);
    if (!Array.isArray(data)) data = [data];
    return data.map(function (d) {
      return { zh: (d.zh || '').trim(), en: (d.en || '').trim() };
    });
  }

  /* =========================================================
   * <ui-collapse>
   * 子元素須包含 [data-role="summary"] 與 [data-role="content"]
   * ========================================================= */
  class UiCollapse extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      var summary = this.querySelector('[data-role="summary"]');
      var content = this.querySelector('[data-role="content"]');
      var openDefault = this.getAttribute('data-open') !== 'false';

      var head = document.createElement('div');
      head.className = 'cc-head' + (openDefault ? '' : ' cc-collapsed');
      head.innerHTML = '<span class="cc-arrow">▾</span>';
      if (summary) head.appendChild(summary);
      this.insertBefore(head, content || null);

      if (content) {
        content.classList.add('cc-body');
        if (!openDefault) content.classList.add('cc-collapsed');
      }

      head.addEventListener('click', function () {
        head.classList.toggle('cc-collapsed');
        if (content) content.classList.toggle('cc-collapsed');
      });
    }
  }
  customElements.define('ui-collapse', UiCollapse);

  /* =========================================================
   * <ui-cloze-text>
   * 方法：setText(raw) → 解析方括號並渲染為可點擊空格
   * ========================================================= */
  class UiClozeText extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this._fontRem = 1.6;
      this.innerHTML =
        '<div class="en-toolbar">' +
        '<button type="button" class="zoom-btn" data-act="dec">A-</button>' +
        '<button type="button" class="zoom-btn" data-act="inc">A+</button>' +
        '</div>' +
        '<div class="en-body" data-role="body"></div>';
      this.style.setProperty('--en-font-size', this._fontRem + 'rem');
      this.querySelector('[data-act="dec"]').addEventListener('click', () => this._zoom(-0.2));
      this.querySelector('[data-act="inc"]').addEventListener('click', () => this._zoom(0.2));
      if (this._pendingText !== undefined) {
        this.setText(this._pendingText);
      }
    }

    _zoom(delta) {
      this._fontRem = Math.min(3, Math.max(1, this._fontRem + delta));
      this.style.setProperty('--en-font-size', this._fontRem + 'rem');
    }

    setText(raw) {
      if (!this.isConnected) {
        this._pendingText = raw;
        return;
      }
      var body = this.querySelector('[data-role="body"]');
      body.innerHTML = '';
      var re = /\[([^[\]]+)\]/g;
      var lastIndex = 0;
      var m;
      var idx = 0;
      var frag = document.createDocumentFragment();
      while ((m = re.exec(raw)) !== null) {
        if (m.index > lastIndex) {
          frag.appendChild(document.createTextNode(raw.slice(lastIndex, m.index)));
        }
        frag.appendChild(this._makeBlank(m[1], idx++));
        lastIndex = re.lastIndex;
      }
      if (lastIndex < raw.length) {
        frag.appendChild(document.createTextNode(raw.slice(lastIndex)));
      }
      body.appendChild(frag);
    }

    _makeBlank(word, index) {
      var span = document.createElement('span');
      span.className = 'blank';
      span.dataset.word = word;
      span.dataset.index = String(index);
      var approxCh = Math.max(2, word.length);
      span.style.minWidth = (approxCh * 0.9) + 'em';
      span.innerHTML = '<span class="blank-hint">✎</span>';
      span.addEventListener('click', () => {
        if (span.classList.contains('filled')) return;
        document.dispatchEvent(new CustomEvent('open-handwrite', {
          detail: { blank: span, word: word }
        }));
      });
      return span;
    }
  }
  customElements.define('ui-cloze-text', UiClozeText);

  /* =========================================================
   * <ui-bilingual-block>
   * 屬性：data = {zh, en}
   * ========================================================= */
  class UiBilingualBlock extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this.innerHTML =
        '<div class="bb-wrap">' +
        '<div class="bb-zh">' +
        '<ui-collapse data-open="true">' +
        '<span data-role="summary">中文</span>' +
        '<div data-role="content"></div>' +
        '</ui-collapse>' +
        '</div>' +
        '<ui-cloze-text></ui-cloze-text>' +
        '</div>';
      if (this._pendingData) this._apply(this._pendingData);
    }

    set data(val) {
      if (!this.isConnected) {
        this._pendingData = val;
        return;
      }
      this._apply(val);
    }

    _apply(val) {
      var zhContent = this.querySelector('[data-role="content"]');
      var clozeEl = this.querySelector('ui-cloze-text');
      zhContent.textContent = val.zh || '';
      clozeEl.setText(val.en || '');
    }
  }
  customElements.define('ui-bilingual-block', UiBilingualBlock);

  /* =========================================================
   * <ui-import>
   * 匯入 .txt / .json，解析後派發 'data-parsed' 事件
   * detail: Array<{zh, en}>
   * ========================================================= */
  class UiImport extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this.innerHTML =
        '<div class="ci-bar">' +
        '<input type="file" accept=".txt,.json" data-role="file" />' +
        '<span class="ci-hint">支援 .txt（[ZH]/[EN] 標記）或 .json（[{"zh":"","en":""}]），' +
        '英文中以 [方括號] 標示欲挖空的字詞。</span>' +
        '</div>';
      this.querySelector('[data-role="file"]').addEventListener('change', (e) => this._onFile(e));
    }

    _onFile(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = () => {
        var text = reader.result;
        var pairs;
        try {
          if (/\.json$/i.test(file.name)) {
            pairs = parseJson(text);
          } else {
            pairs = parseTxt(text);
          }
        } catch (err) {
          showAlert('檔案解析失敗：' + err.message);
          return;
        }
        if (!pairs.length) {
          showAlert('沒有解析到任何題組，請確認檔案格式。');
          return;
        }
        this.dispatchEvent(new CustomEvent('data-parsed', { detail: pairs, bubbles: true }));
      };
      reader.onerror = () => showAlert('檔案讀取失敗。');
      reader.readAsText(file, 'utf-8');
    }
  }
  customElements.define('ui-import', UiImport);

  /* =========================================================
   * <ui-handwrite-modal>
   * 全頁僅需一個實體，監聽 document 的 'open-handwrite' 事件
   * ========================================================= */
  class UiHandwriteModal extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this._penColor = PALETTE.focus;
      this._penWidth = 4;
      this._drawing = false;
      this._hasInk = false;

      this.innerHTML =
        '<div class="hw-backdrop" data-role="backdrop">' +
        '<div class="hw-dialog">' +
        '<div class="hw-head">' +
        '<span class="hw-title" data-role="title">觸控筆書寫</span>' +
        '<button type="button" class="hw-close" data-act="close">&times;</button>' +
        '</div>' +
        '<div class="hw-canvas-wrap"><canvas data-role="canvas"></canvas></div>' +
        '<div class="hw-foot">' +
        '<button type="button" class="hw-btn danger" data-act="clear">清除重寫</button>' +
        '<button type="button" class="hw-btn" data-act="cancel">取消</button>' +
        '<button type="button" class="hw-btn primary" data-act="confirm">確認存入</button>' +
        '</div>' +
        '</div>' +
        '</div>';

      this._backdrop = this.querySelector('[data-role="backdrop"]');
      this._canvas = this.querySelector('[data-role="canvas"]');
      this._ctx = this._canvas.getContext('2d');
      this._title = this.querySelector('[data-role="title"]');

      this.querySelector('[data-act="close"]').addEventListener('click', () => this.close());
      this.querySelector('[data-act="cancel"]').addEventListener('click', () => this.close());
      this.querySelector('[data-act="clear"]').addEventListener('click', () => this._clearCanvas());
      this.querySelector('[data-act="confirm"]').addEventListener('click', () => this._confirm());

      this._bindPointer();
      document.addEventListener('open-handwrite', (e) => this.open(e.detail.blank, e.detail.word));
      window.addEventListener('resize', () => {
        if (this._backdrop.classList.contains('open')) this._resizeCanvas();
      });
    }

    setPenColor(colorKey) {
      this._penColor = PALETTE[colorKey] || colorKey;
    }
    setPenWidth(px) {
      this._penWidth = Math.max(1, Number(px) || 4);
    }

    open(blankEl, word) {
      this._currentBlank = blankEl;
      this._title.textContent = 'Nelson is writing ...';
      this._backdrop.classList.add('open');
      this._resizeCanvas();
      this._clearCanvas();
    }

    close() {
      this._backdrop.classList.remove('open');
      this._currentBlank = null;
    }

    _resizeCanvas() {
      var dpr = window.devicePixelRatio || 1;
      var rect = this._canvas.getBoundingClientRect();
      this._canvas.width = rect.width * dpr;
      this._canvas.height = rect.height * dpr;
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._ctx.lineCap = 'round';
      this._ctx.lineJoin = 'round';
    }

    _clearCanvas() {
      var rect = this._canvas.getBoundingClientRect();
      this._ctx.clearRect(0, 0, rect.width, rect.height);
      this._hasInk = false;
    }

    _bindPointer() {
      var last = null;
      this._canvas.addEventListener('pointerdown', (e) => {
        this._drawing = true;
        this._hasInk = true;
        this._canvas.setPointerCapture(e.pointerId);
        last = this._pos(e);
      });
      this._canvas.addEventListener('pointermove', (e) => {
        if (!this._drawing) return;
        var p = this._pos(e);
        var w = this._penWidth;
        if (e.pointerType === 'pen' && e.pressure > 0) {
          w = this._penWidth * (0.2 + e.pressure * 1.6);
        }
        this._ctx.strokeStyle = this._penColor;
        this._ctx.lineWidth = w;
        this._ctx.beginPath();
        this._ctx.moveTo(last.x, last.y);
        this._ctx.lineTo(p.x, p.y);
        this._ctx.stroke();
        last = p;
      });
      var end = () => { this._drawing = false; };
      this._canvas.addEventListener('pointerup', end);
      this._canvas.addEventListener('pointercancel', end);
      this._canvas.addEventListener('pointerleave', end);
    }

    _pos(e) {
      var rect = this._canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    _confirm() {
      if (!this._hasInk) {
        showAlert('尚未書寫任何筆跡。', 'info');
        return;
      }
      var dataUrl = this._canvas.toDataURL('image/png');
      var blank = this._currentBlank;
      if (blank) {
        blank.classList.add('filled');
        blank.innerHTML = '<img src="' + dataUrl + '" alt="手寫筆跡" />' +
          '<button type="button" class="blank-clear" title="清除筆跡">&times;</button>';
        blank.querySelector('.blank-clear').addEventListener('click', (ev) => {
          ev.stopPropagation();
          blank.classList.remove('filled');
          blank.innerHTML = '<span class="blank-hint">✎</span>';
        });
      }
      this.close();
    }
  }
  customElements.define('ui-handwrite-modal', UiHandwriteModal);

  injectStyles();
  window.ClozeHandwrite = {
    parseTxt: parseTxt,
    parseJson: parseJson,
    showAlert: showAlert,
    palette: PALETTE,
    penColorOptions: PEN_COLOR_OPTIONS
  };
})();