/*!
 * <ui-detail-ladder> 細節階梯元件 v1.3
 * v1.3（11-12-26）：新增自動播放。加上 autoplay 屬性即開啟，每階預設停 8 秒，autoplay="12" 可改秒數，
 *       <ladder-step dwell="15"> 可單獨改某一階。autoplay-start 決定何時開始（預設 click 按播放鍵、view 捲進畫面、
 *       load 載入），autoplay-end 決定播完後（stop 停在最後一階、loop 回到第一階）。
 *       點階梯、按鈕或用鍵盤切換時自動暫停；按鈕列多一顆播放／暫停鍵；Ctrl+Shift+空白鍵 切換播放。
 *       元件離開畫面、切到別的分頁、收合時暫時停止計時。內容下方有倒數線（show-timer）。
 *       方法 play()、pause()，屬性 isPlaying，事件 ladder-play、ladder-pause、ladder-end。
 * v1.2：修正顏色屬性填品牌色名稱時失效的問題。所有顏色屬性（含 <step-title> 的 icon-color）
 *       可直接填品牌色名稱，例如 title-color="key"、bg="base"，名稱不分大小寫，
 *       也仍可填 #hex 或 rgb()。
 * v1.2：新增 theme 屬性，例如 theme="violet"，與 <ui-insight> 相同。影響強調色的個別屬性
 *       預設都跟著 theme，有明確指定的屬性才會覆蓋。優先順序：個別屬性 > theme > 內建預設。
 *       可用主題：default 與 17 個品牌色名稱（shell、vanilla、yellow、pink、red、green、
 *       blue、indigo、violet、gray、key、calm、quiet、playful、urgent、energetic、dreamy），
 *       名稱不分大小寫，不存在時退回 default。也可在執行中修改 theme，元件會立即重繪。
 */
(() => {
  if (customElements.get('ui-detail-ladder')) return;

  const CSS_ATTRS = {
    'margin': '6px 12px',
    'padding': '6px 12px',
    'bg': '#0C0D0C',
    'border-color': '#C6C7BD',
    'border-width': '1px',
    'border-radius': '12px',
    'rail-width': '200px',
    'column-gap': '24px',
    'step-gap': '14px',
    'step-font-size': '0.8125rem',
    'dot-size': '22px',
    'dot-font-size': '0.6875rem',
    'label-color': '#C6C7BD',
    'active-color': '#5DBAE8',
    'current-color': '#5DBAE8',
    'line-style': 'solid',
    'line-width': '2px',
    'line-color': '#C6C7BD',
    'line-active-color': '#5DBAE8',
    'pill-font-size': '0.85rem',
    'pill-bg': '#B484E8',
    'pill-color': '#0C0D0C',
    'title-font-size': '1.0625rem',
    'title-color': '#5DBAE8',
    'body-font-size': '1rem',
    'body-color': '#C6C7BD',
    'note-font-size': '0.85rem',
    'note-color': '#C6C7BD',
    'divider-style': 'solid',
    'divider-width': '1px',
    'divider-color': '#C6C7BD',
    'hl-bg': '#71CD76',
    'hl-color': '#0C0D0C',
    'progress-height': '6px',
    'progress-color': '#71CD76',
    'progress-color-end': '',
    'progress-track': '#262826',
    'progress-text-size': '0.75rem',
    'progress-text-color': '#C6C7BD',
    'button-font-size': '0.875rem',
    'title-icon-color': '#E3D322',
    'ini-title-size': '1rem',
    'ini-title-color': '#5DBAE8',
    'ini-title-bg': '#161816'
  };

  /* 品牌色名稱對照：顏色屬性可直接填名稱（不分大小寫） */
  const COLOR_NAMES = {
    base: '#0C0D0C', 'bg-alternative': '#3B2A20',
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7',
    red: '#EF6661', green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1',
    violet: '#B484E8', gray: '#86877F', key: '#51DBCF', calm: '#A3C4BC',
    quiet: '#8EA4DE', playful: '#FFA987', urgent: '#FF2E63',
    energetic: '#B6FF00', dreamy: '#DE8EC9'
  };

  /* CSS_ATTRS 之中屬於顏色的屬性，值會先經過品牌色名稱轉換 */
  const COLOR_ATTRS = new Set([
    'bg', 'border-color', 'label-color', 'active-color', 'current-color',
    'line-color', 'line-active-color', 'pill-bg', 'pill-color', 'title-color',
    'body-color', 'note-color', 'divider-color', 'hl-bg', 'hl-color',
    'progress-color', 'progress-color-end', 'progress-track', 'progress-text-color',
    'title-icon-color', 'ini-title-color', 'ini-title-bg'
  ]);

  const resolveColor = (v) => {
    if (typeof v !== 'string') return v;
    const k = v.trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(COLOR_NAMES, k) ? COLOR_NAMES[k] : v;
  };

  /* 主題：只列出與預設不同的顏色屬性，值可用品牌色名稱。
   * a 為強調色，on 為疊在強調色上的文字色。default 為空物件，代表完全使用 CSS_ATTRS 的內建預設。 */
  const accentTheme = (a, on = 'base') => ({
    'border-color': a,
    'active-color': a,
    'current-color': a,
    'line-active-color': a,
    'pill-bg': a,
    'pill-color': on,
    'title-color': a,
    'divider-color': a,
    'hl-bg': a,
    'hl-color': on,
    'progress-color': a,
    'ini-title-color': a
  });

  const THEMES = { default: {} };
  ['shell', 'vanilla', 'yellow', 'pink', 'red', 'green', 'blue', 'indigo', 'violet', 'gray',
    'key', 'calm', 'quiet', 'playful', 'urgent', 'energetic', 'dreamy'
  ].forEach((n) => { THEMES[n] = accentTheme(n); });

  const OPT_ATTRS = {
    'direction': 'up',
    'border': 'false',
    'show-pill': 'true',
    'show-divider': 'false',
    'show-progress': 'true',
    'show-buttons': 'true',
    'progress-text': '具體程度 {p}%',
    'next-text': '往上一階',
    'reset-text': '重來',
    'start': '1',
    'ini-title': '點擊展開',
    'keyboard': 'true',
    'theme': 'default',
    'autoplay-start': 'click',
    'autoplay-end': 'stop',
    'pause-on-hover': 'false',
    'show-timer': 'true',
    'play-text': '播放',
    'pause-text': '暫停'
  };
  const AUTOPLAY_SEC = 8;

  const STYLE = `
ui-detail-ladder{display:block;box-sizing:border-box;margin:var(--udl-margin);padding:var(--udl-padding);background:var(--udl-bg);border:var(--udl-border-line);border-radius:var(--udl-border-radius);color:var(--udl-body-color)}
ui-detail-ladder *{box-sizing:border-box}
ui-detail-ladder:not([data-udl-ready]) ladder-step{display:none}
ui-detail-ladder .udl-wrap{display:grid;grid-template-columns:var(--udl-rail-width) minmax(0,1fr);gap:var(--udl-column-gap);align-items:start}
ui-detail-ladder .udl-rail{position:relative;padding:4px 0}
ui-detail-ladder .udl-steps{position:relative;z-index:2;display:flex;flex-direction:column-reverse;gap:var(--udl-step-gap)}
ui-detail-ladder[direction="down"] .udl-steps{flex-direction:column}
ui-detail-ladder .udl-line,ui-detail-ladder .udl-line-fill{position:absolute;z-index:1;width:0;left:calc(var(--udl-dot-size) / 2 - var(--udl-line-width) / 2);border-left:var(--udl-line-width) var(--udl-line-style) var(--udl-line-color)}
ui-detail-ladder .udl-line-fill{border-left-color:var(--udl-line-active-color);transition:top .35s,height .35s}
ui-detail-ladder .udl-rung{display:flex;align-items:center;gap:12px;cursor:pointer;user-select:none}
ui-detail-ladder .udl-dot{flex-shrink:0;width:var(--udl-dot-size);height:var(--udl-dot-size);border-radius:50%;border:2px solid var(--udl-label-color);background:var(--udl-bg);color:var(--udl-label-color);font-size:var(--udl-dot-font-size);display:flex;align-items:center;justify-content:center;transition:all .25s}
ui-detail-ladder .udl-label{font-size:var(--udl-step-font-size);color:var(--udl-label-color);line-height:1.4;transition:color .25s}
ui-detail-ladder .udl-rung.is-on .udl-dot{border-color:var(--udl-active-color);background:var(--udl-active-color);color:var(--udl-bg)}
ui-detail-ladder .udl-rung.is-on .udl-label{color:var(--udl-active-color)}
ui-detail-ladder .udl-rung.is-cur .udl-dot{border-color:var(--udl-current-color);background:var(--udl-current-color);color:var(--udl-bg);transform:scale(1.2)}
ui-detail-ladder .udl-rung.is-cur .udl-label{color:var(--udl-current-color)}
ui-detail-ladder .udl-rung:hover .udl-label{text-decoration:underline}
ui-detail-ladder .udl-pill{display:inline-block;font-size:var(--udl-pill-font-size);background:var(--udl-pill-bg);color:var(--udl-pill-color);border-radius:999px;padding:2px 12px;margin:0 0 10px 0}
ui-detail-ladder .udl-title{font-size:var(--udl-title-font-size);color:var(--udl-title-color);font-weight:600;margin:0 0 8px 0}
ui-detail-ladder .udl-title:empty,ui-detail-ladder .udl-note:empty{display:none}
ui-detail-ladder .udl-body{font-size:var(--udl-body-font-size);color:var(--udl-body-color);line-height:1.8;border-top:var(--udl-divider-line);border-bottom:var(--udl-divider-line);padding:var(--udl-body-pad)}
ui-detail-ladder .udl-note{font-size:var(--udl-note-font-size);color:var(--udl-note-color);line-height:1.7;margin:10px 0 0 0}
ui-detail-ladder .udl-in{animation:udl-fade .35s ease}
@keyframes udl-fade{from{opacity:.2;transform:translateY(4px)}to{opacity:1;transform:none}}
ui-detail-ladder mark{background:var(--udl-hl-bg);color:var(--udl-hl-color);border-radius:4px;padding:0 4px}
ui-detail-ladder .udl-progress{margin:16px 0 0 0}
ui-detail-ladder .udl-track{height:var(--udl-progress-height);background:var(--udl-progress-track);border-radius:999px;overflow:hidden}
ui-detail-ladder .udl-bar{height:100%;width:0;background:var(--udl-progress-fill);border-radius:999px;transition:width .35s}
ui-detail-ladder .udl-ptext{font-size:var(--udl-progress-text-size);color:var(--udl-progress-text-color);margin:6px 0 0 0}
ui-detail-ladder .udl-btns{display:flex;gap:8px;margin:14px 0 4px 0}
ui-detail-ladder .udl-btn{font-size:var(--udl-button-font-size);border:none;border-radius:6px;padding:6px 14px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
ui-detail-ladder .udl-next{background:var(--udl-active-color);color:var(--udl-bg)}
ui-detail-ladder .udl-reset{background:var(--udl-progress-track);color:var(--udl-label-color)}
ui-detail-ladder .udl-btn:hover{filter:brightness(1.1)}
ui-detail-ladder:focus,ui-detail-ladder:focus-visible{outline:none}
ui-detail-ladder .udl-title i.bi{color:var(--udl-title-icon-color);margin:0 8px 0 0}
ui-detail-ladder .udl-head{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;background:var(--udl-ini-title-bg);color:var(--udl-ini-title-color);font-size:var(--udl-ini-title-size);border-radius:8px;padding:10px 14px}
ui-detail-ladder .udl-head:hover{filter:brightness(1.15)}
ui-detail-ladder .udl-head .udl-head-text{flex:1}
ui-detail-ladder .udl-head .udl-chev{transition:transform .25s}
ui-detail-ladder.udl-open .udl-head .udl-chev{transform:rotate(180deg)}
ui-detail-ladder.udl-collapsible.udl-open .udl-wrap{margin:14px 0 0 0}
ui-detail-ladder.udl-collapsible:not(.udl-open) .udl-wrap{display:none}
ui-detail-ladder.udl-collapsible.udl-open .udl-wrap{animation:udl-fade .3s ease}
ui-detail-ladder .udl-timer{height:3px;background:var(--udl-progress-track);border-radius:999px;overflow:hidden;margin:14px 0 0 0}
ui-detail-ladder .udl-timer > i{display:block;height:100%;background:var(--udl-active-color);transform-origin:left center}
ui-detail-ladder .udl-timer.is-paused > i{background:var(--udl-label-color)}
ui-detail-ladder .udl-play{background:var(--udl-progress-track);color:var(--udl-active-color)}
ui-detail-ladder .udl-play.is-playing{background:var(--udl-active-color);color:var(--udl-bg)}
ui-detail-ladder.udl-kbd-active .udl-rung.is-cur .udl-dot{outline:2px solid var(--udl-current-color);outline-offset:3px}
`;

  if (!document.getElementById('ui-detail-ladder-style')) {
    const s = document.createElement('style');
    s.id = 'ui-detail-ladder-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  /* 鍵盤：Ctrl+Shift+上下方向鍵，作用於取得焦點或游標最後停留的元件 */
  let activeLadder = null;
  document.addEventListener('keydown', (e) => {
    if (!e.ctrlKey || !e.shiftKey || e.altKey || e.metaKey) return;
    const isSpace = e.code === 'Space' || e.key === ' ';
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && !isSpace) return;
    const ae = document.activeElement;
    const inLadder = ae && ae.closest ? ae.closest('ui-detail-ladder') : null;
    const editing = ae && (ae.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName));
    if (editing && !inLadder) return;
    const target = inLadder || activeLadder;
    if (!target || !target.isConnected || typeof target._keyMove !== 'function') return;
    if (isSpace) {
      if (target._keyToggle()) e.preventDefault();
      return;
    }
    if (target._keyMove(e.key === 'ArrowUp' ? 'up' : 'down')) e.preventDefault();
  });

  class UiDetailLadder extends HTMLElement {
    static get observedAttributes() {
      return [...Object.keys(CSS_ATTRS), ...Object.keys(OPT_ATTRS), 'ini-collapse', 'autoplay'];
    }

    constructor() {
      super();
      this._steps = null;
      this._cur = 0;
      this._ready = false;
      this._open = true;
      this._playing = false;
      this._elapsed = 0;
      this._holds = new Set();
      this._raf = 0;
      this._autoStarted = false;
      this._auto = null;
    }

    connectedCallback() {
      if (this._ready) { this._setupAuto(); return; }
      const init = () => this._init();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
      } else {
        init();
      }
    }

    disconnectedCallback() {
      if (this._ro) this._ro.disconnect();
      this._teardownAuto();
      if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
    }

    attributeChangedCallback(name) {
      if (!this._ready) return;
      if (name === 'ini-collapse') this._open = !this._collapsible();
      this._applyVars();
      this._build();
      if (name.indexOf('autoplay') === 0 || name === 'pause-on-hover') this._setupAuto();
    }

    _collapsible() {
      const v = this.getAttribute('ini-collapse');
      return v !== null && v.toLowerCase() !== 'false';
    }

    _opt(name) {
      const v = this.getAttribute(name);
      return v === null || v === '' ? OPT_ATTRS[name] : v;
    }

    _bool(name) {
      return this._opt(name).toLowerCase() !== 'false';
    }

    _css(name) {
      const v = this.getAttribute(name);
      const has = v !== null && v !== '';
      if (!COLOR_ATTRS.has(name)) return has ? v : CSS_ATTRS[name];
      /* 顏色屬性的優先順序：個別屬性 > theme > 內建預設 */
      if (has) return resolveColor(v);
      const tv = THEMES[this._themeName()][name];
      return resolveColor(tv !== undefined ? tv : CSS_ATTRS[name]);
    }

    _themeName() {
      const t = this._opt('theme').trim().toLowerCase();
      return Object.prototype.hasOwnProperty.call(THEMES, t) ? t : 'default';
    }

    static get themes() {
      return Object.keys(THEMES);
    }

    _init() {
      if (this._ready) return;
      const nodes = [...this.querySelectorAll(':scope > ladder-step')];
      this._steps = nodes.map((n, i) => {
        const pick = (tag) => {
          const el = n.querySelector(tag);
          return el ? el.innerHTML.trim() : '';
        };
        const t = n.querySelector('step-title');
        return {
          label: n.getAttribute('label') || '',
          pill: n.getAttribute('pill') || (i === 0 ? '起點' : `第${i}階`),
          title: pick('step-title'),
          icon: t ? (t.getAttribute('icon') || '') : '',
          iconColor: t ? (t.getAttribute('icon-color') || '') : '',
          body: pick('step-body'),
          note: pick('step-note'),
          dwell: parseFloat(n.getAttribute('dwell'))
        };
      });
      this.innerHTML = '';
      this.setAttribute('data-udl-ready', '');
      if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
      this._open = !this._collapsible();
      const mark = () => { activeLadder = this; };
      this.addEventListener('pointerenter', mark);
      this.addEventListener('focusin', mark);
      this.addEventListener('pointerdown', () => {
        mark();
        this.classList.remove('udl-kbd-active');
      });
      const start = parseInt(this._opt('start'), 10);
      this._cur = Math.min(Math.max((isNaN(start) ? 1 : start) - 1, 0), Math.max(this._steps.length - 1, 0));
      this._ready = true;
      this._applyVars();
      this._build();
      this._ro = new ResizeObserver(() => this._layoutLine());
      this._ro.observe(this);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this._layoutLine());
      this._setupAuto();
    }

    _applyVars() {
      const st = this.style;
      Object.keys(CSS_ATTRS).forEach((k) => {
        if (k === 'progress-color-end') return;
        st.setProperty(`--udl-${k}`, this._css(k));
      });
      st.setProperty('--udl-border-line',
        this._bool('border') ? `${this._css('border-width')} solid ${this._css('border-color')}` : 'none');
      const divOn = this._bool('show-divider');
      st.setProperty('--udl-divider-line',
        divOn ? `${this._css('divider-width')} ${this._css('divider-style')} ${this._css('divider-color')}` : 'none');
      st.setProperty('--udl-body-pad', divOn ? '10px 0' : '0');
      const c1 = this._css('progress-color');
      const c2 = this._css('progress-color-end');
      st.setProperty('--udl-progress-fill', c2 ? `linear-gradient(90deg, ${c1}, ${c2})` : c1);
    }

    _build() {
      const steps = this._steps || [];
      const down = this._opt('direction') === 'down';
      const arrow = down ? 'bi-arrow-down' : 'bi-arrow-up';
      const coll = this._collapsible();
      this.classList.toggle('udl-collapsible', coll);
      this.classList.toggle('udl-open', this._open);

      this.innerHTML = `
        ${coll ? `<div class="udl-head">
          <i class="bi bi-layers"></i>
          <span class="udl-head-text">${this._opt('ini-title')}</span>
          <i class="bi bi-chevron-down udl-chev"></i>
        </div>` : ''}
        <div class="udl-wrap">
          <div class="udl-rail">
            <div class="udl-line"></div>
            <div class="udl-line-fill"></div>
            <div class="udl-steps"></div>
          </div>
          <div class="udl-main">
            ${this._bool('show-pill') ? '<span class="udl-pill"></span>' : ''}
            <div class="udl-content">
              <div class="udl-title"></div>
              <div class="udl-body"></div>
              <div class="udl-note"></div>
            </div>
            ${this._hasAutoplay() && this._bool('show-timer') ? '<div class="udl-timer"><i></i></div>' : ''}
            ${this._bool('show-progress') ? '<div class="udl-progress"><div class="udl-track"><div class="udl-bar"></div></div><div class="udl-ptext"></div></div>' : ''}
            ${this._bool('show-buttons') ? `<div class="udl-btns">
              <button type="button" class="udl-btn udl-next"><span>${this._opt('next-text')}</span><i class="bi ${arrow}"></i></button>
              <button type="button" class="udl-btn udl-reset"><i class="bi bi-arrow-counterclockwise"></i><span>${this._opt('reset-text')}</span></button>
              ${this._hasAutoplay() ? '<button type="button" class="udl-btn udl-play"><i class="bi bi-play-fill"></i><span></span></button>' : ''}
            </div>` : ''}
          </div>
        </div>`;

      const box = this.querySelector('.udl-steps');
      steps.forEach((s, i) => {
        const r = document.createElement('div');
        r.className = 'udl-rung';
        r.innerHTML = `<span class="udl-dot">${i + 1}</span><span class="udl-label">${s.label}</span>`;
        r.addEventListener('click', () => { this.pause(); this.go(i + 1); });
        box.appendChild(r);
      });

      const nx = this.querySelector('.udl-next');
      const rs = this.querySelector('.udl-reset');
      if (nx) nx.addEventListener('click', () => { this.pause(); this.next(); });
      if (rs) rs.addEventListener('click', () => { this.pause(); this.reset(); });
      const pl = this.querySelector('.udl-play');
      if (pl) pl.addEventListener('click', () => (this._playing ? this.pause() : this.play()));
      const hd = this.querySelector('.udl-head');
      if (hd) hd.addEventListener('click', () => this.toggle());

      this._render(false);
      this._syncPlayBtn();
      this._renderTimer();
    }

    _iconHtml(s) {
      if (!s.icon) return '';
      let n = s.icon.trim().replace(/^bi\s+/, '');
      if (!n.startsWith('bi-')) n = `bi-${n}`;
      const st = s.iconColor ? ` style="color:${resolveColor(s.iconColor)}"` : '';
      return `<i class="bi ${n}"${st}></i>`;
    }

    _keyMove(dir) {
      if (!this._bool('keyboard')) return false;
      if (this._collapsible() && !this._open) return false;
      const down = this._opt('direction') === 'down';
      /* 方向鍵依畫面上的上下移動：由下往上排列時，上鍵是下一階 */
      const forward = down ? dir === 'down' : dir === 'up';
      this.pause();
      if (forward) this.next(); else this.prev();
      this.classList.add('udl-kbd-active');
      return true;
    }

    _render(animate = true) {
      const steps = this._steps || [];
      if (!steps.length) return;
      const s = steps[this._cur];

      [...this.querySelectorAll('.udl-rung')].forEach((r, i) => {
        r.classList.toggle('is-on', i < this._cur);
        r.classList.toggle('is-cur', i === this._cur);
      });

      const pill = this.querySelector('.udl-pill');
      if (pill) pill.textContent = s.label ? `${s.pill}：${s.label}` : s.pill;

      this.querySelector('.udl-title').innerHTML = this._iconHtml(s) + s.title;
      this.querySelector('.udl-body').innerHTML = s.body;
      this.querySelector('.udl-note').innerHTML = s.note;

      const content = this.querySelector('.udl-content');
      if (animate) {
        content.classList.remove('udl-in');
        void content.offsetWidth;
        content.classList.add('udl-in');
      }

      const total = steps.length;
      const p = Math.round(((this._cur + 1) / total) * 100);
      const bar = this.querySelector('.udl-bar');
      if (bar) bar.style.width = `${p}%`;
      const pt = this.querySelector('.udl-ptext');
      if (pt) {
        pt.textContent = this._opt('progress-text')
          .replace(/\{p\}/g, p)
          .replace(/\{n\}/g, this._cur + 1)
          .replace(/\{total\}/g, total);
      }

      const nx = this.querySelector('.udl-next');
      if (nx) nx.style.visibility = this._cur < total - 1 ? 'visible' : 'hidden';

      this._layoutLine();
    }

    _layoutLine() {
      const rail = this.querySelector('.udl-rail');
      const dots = [...this.querySelectorAll('.udl-dot')];
      const line = this.querySelector('.udl-line');
      const fill = this.querySelector('.udl-line-fill');
      if (!rail || !line || dots.length < 2) {
        if (line) line.style.height = '0';
        if (fill) fill.style.height = '0';
        return;
      }
      const base = rail.getBoundingClientRect().top;
      const cy = (el) => {
        const r = el.getBoundingClientRect();
        return r.top - base + r.height / 2;
      };
      const first = cy(dots[0]);
      const last = cy(dots[dots.length - 1]);
      const cur = cy(dots[this._cur]);
      line.style.top = `${Math.min(first, last)}px`;
      line.style.height = `${Math.abs(last - first)}px`;
      fill.style.top = `${Math.min(first, cur)}px`;
      fill.style.height = `${Math.abs(cur - first)}px`;
    }

    get current() { return this._cur + 1; }
    get total() { return (this._steps || []).length; }

    go(n) {
      const total = this.total;
      if (!total) return;
      const idx = Math.min(Math.max(n - 1, 0), total - 1);
      if (idx === this._cur && this._ready) { this._render(false); return; }
      this._cur = idx;
      this._elapsed = 0;
      this._render(true);
      this.dispatchEvent(new CustomEvent('ladder-change', {
        bubbles: true,
        detail: { index: idx + 1, total, label: this._steps[idx].label }
      }));
    }

    next() { this.go(this._cur + 2); }
    prev() { this.go(this._cur); }
    reset() { this.go(1); }

    /* ── 自動播放（v1.3） ── */
    _hasAutoplay() {
      const v = this.getAttribute('autoplay');
      return v !== null && v.trim().toLowerCase() !== 'false';
    }

    _dwell() {
      const s = (this._steps || [])[this._cur];
      if (s && s.dwell > 0) return s.dwell * 1000;
      const v = parseFloat(this.getAttribute('autoplay'));
      return (v > 0 ? v : AUTOPLAY_SEC) * 1000;
    }

    _loopMode() { return this._opt('autoplay-end').trim().toLowerCase() === 'loop'; }

    _setupAuto() {
      this._teardownAuto();
      if (!this._ready || !this.isConnected) return;
      if (!this._hasAutoplay()) {
        if (this._playing) this.pause('off');
        return;
      }
      const a = this._auto = {};
      const hold = (k, on) => {
        if (on) this._holds.add(k); else this._holds.delete(k);
        this._renderTimer();
      };
      a.vis = () => hold('hidden', document.hidden);
      document.addEventListener('visibilitychange', a.vis);
      a.vis();
      const start = this._opt('autoplay-start').trim().toLowerCase();
      if ('IntersectionObserver' in window) {
        hold('offscreen', true);
        a.io = new IntersectionObserver((list) => {
          const vis = list[list.length - 1].isIntersecting;
          hold('offscreen', !vis);
          if (vis && start === 'view' && !this._autoStarted) this.play();
        }, { threshold: 0.35 });
        a.io.observe(this);
      } else if (start === 'view' && !this._autoStarted) {
        this.play();
      }
      if (start === 'load' && !this._autoStarted) this.play();
      if (this._opt('pause-on-hover').trim().toLowerCase() === 'true') {
        a.en = () => hold('hover', true);
        a.lv = () => hold('hover', false);
        this.addEventListener('pointerenter', a.en);
        this.addEventListener('pointerleave', a.lv);
        hold('hover', this.matches(':hover'));
      }
      if (this._playing) this._loop();
    }

    _teardownAuto() {
      const a = this._auto;
      if (!a) return;
      document.removeEventListener('visibilitychange', a.vis);
      if (a.io) a.io.disconnect();
      if (a.en) {
        this.removeEventListener('pointerenter', a.en);
        this.removeEventListener('pointerleave', a.lv);
      }
      this._holds.clear();
      this._auto = null;
    }

    /* 播放中而且沒有任何暫時停止的原因（離開畫面、切換分頁、游標停留、收合）才計時 */
    _canRun() {
      return this._playing && this._holds.size === 0 && !(this._collapsible() && !this._open) && this.total > 1;
    }

    _loop() {
      if (this._raf) return;
      let last = null;
      const f = (t) => {
        this._raf = 0;
        if (!this._playing) return;
        if (this._canRun()) {
          if (last !== null) this._elapsed += Math.min(t - last, 100);
          last = t;
          if (this._elapsed >= this._dwell()) this._advance();
        } else {
          last = null;
        }
        this._renderTimer();
        if (this._playing) this._raf = requestAnimationFrame(f);
      };
      this._raf = requestAnimationFrame(f);
    }

    _advance() {
      const total = this.total;
      if (this._cur < total - 1) {
        this.go(this._cur + 2);
        if (this._cur === total - 1 && !this._loopMode()) {
          this.pause('end');
          this.dispatchEvent(new CustomEvent('ladder-end', { bubbles: true, detail: { total } }));
        }
      } else {
        this.go(1);
      }
    }

    _renderTimer() {
      const el = this.querySelector('.udl-timer');
      if (!el) return;
      const r = Math.min(Math.max(1 - this._elapsed / this._dwell(), 0), 1);
      el.firstElementChild.style.transform = `scaleX(${r})`;
      el.classList.toggle('is-paused', !this._canRun());
    }

    _syncPlayBtn() {
      const b = this.querySelector('.udl-play');
      if (!b) return;
      b.classList.toggle('is-playing', this._playing);
      b.querySelector('i').className = `bi ${this._playing ? 'bi-pause-fill' : 'bi-play-fill'}`;
      b.querySelector('span').textContent = this._opt(this._playing ? 'pause-text' : 'play-text');
    }

    _keyToggle() {
      if (!this._bool('keyboard') || !this._hasAutoplay()) return false;
      if (this._playing) this.pause(); else this.play();
      return true;
    }

    get isPlaying() { return this._playing; }

    play() {
      if (this._playing || !this._ready) return;
      if (this._cur >= this.total - 1 && !this._loopMode()) this.go(1);
      this._autoStarted = true;
      this._playing = true;
      this._syncPlayBtn();
      this.dispatchEvent(new CustomEvent('ladder-play', { bubbles: true, detail: { index: this._cur + 1 } }));
      this._loop();
    }

    pause(reason = 'user') {
      if (!this._playing) return;
      this._playing = false;
      if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
      this._syncPlayBtn();
      this._renderTimer();
      this.dispatchEvent(new CustomEvent('ladder-pause', { bubbles: true, detail: { index: this._cur + 1, reason } }));
    }

    get isOpen() { return this._open; }

    open() { this._setOpen(true); }
    close() { this._setOpen(false); }
    toggle() { this._setOpen(!this._open); }

    _setOpen(v) {
      if (!this._collapsible() || this._open === v) return;
      this._open = v;
      this.classList.toggle('udl-open', v);
      if (v) requestAnimationFrame(() => this._layoutLine());
      this._renderTimer();
      this.dispatchEvent(new CustomEvent('ladder-toggle', { bubbles: true, detail: { open: v } }));
    }
  }

  customElements.define('ui-detail-ladder', UiDetailLadder);
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
