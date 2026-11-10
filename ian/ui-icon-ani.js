/*!
 * ui-icon-anim.js  v1.2.0
 * 基本用法：
 *   <ui-icon-anim icons="bi-heart,bi-star" interval="800" mode="replace" colors="pink,yellow"></ui-icon-anim>
 *
 * 屬性：
 *   icons          圖示類別名稱，逗點或空白分隔，可省略 bi- 前綴
 *   icons-from     從指定 id 元素的文字內容擷取圖示清單（icons 未設定時使用）
 *                  兩者都未設定時，自動讀取 <div id="global_icon_list">
 *   colors-from    從指定 id 元素的文字內容擷取色彩清單（colors 未設定時使用）
 *   interval       切換間隔（毫秒），預設 1000，最小 100
 *   mode           replace（原地取代）或 sequence（由左至右排出），預設 replace
 *   effect         fade / scale / flip / none，預設 fade
 *   colors         配色名稱或 HEX，單一值套用全部，或逗點分隔一一對應（不足時循環）
 *   size           sm / md / lg / xl、數字（視為 rem）或含單位的值，可逗點分隔一一對應
 *   gap            sequence 模式圖示間距（px），預設 8
 *   hold           sequence 模式排滿後的停留時間（毫秒），預設等於 interval
 *   loop           是否循環，預設 true，設為 false 只播一輪
 *   autoplay       是否自動播放，預設 true（按鈕模式下忽略）
 *   remove-on-end  播放結束後移除或隱藏元件（loop="false" 時才生效）
 *   remove-delay   結束後等待多久才移除（毫秒），預設 0
 *   remove-effect  fade / shrink / none，預設 fade
 *   remove-mode    remove（從 DOM 刪除）或 hide（隱藏，可再 play() 重播），預設 remove
 *   reveal-on-end  播放結束時要顯示的元素 id，逗點分隔，可帶 # 或不帶
 *   reveal-effect  fade / slide / none，預設 fade
 *   reveal-delay   顯示前的延遲（毫秒），預設 0
 *   href           播放結束後跳轉的網址（loop="false" 時才生效）
 *   href-target    _self（預設）、_blank 或其他視窗名稱
 *   href-delay     跳轉前的延遲（毫秒），預設 0
 *
 * 按鈕模式（設定 button-text 或 button-icon 即啟用）：
 *   button-text     點擊前顯示的按鈕文字，例如「開始」
 *   button-icon     按鈕文字前的圖示，例如 bi-play-fill
 *   button-color    按鈕色彩，配色名稱或 HEX，預設 blue
 *   button-keep     保留按鈕外框，動畫在按鈕內播放；未設定時按鈕消失，由動畫取代
 *   button-restore  播放結束後回到按鈕狀態，可再次點擊（loop="false" 且未 remove-on-end 時生效）
 *
 * 方法：play()、pause()、reset()、goTo(index)
 *   按鈕模式下 reset() 會回到按鈕狀態；play() 可略過按鈕直接播放。
 * 唯讀屬性：index、playing、armed（是否停在按鈕狀態）
 * 事件（皆會冒泡）：
 *   trigger-click  按鈕被點擊，可 preventDefault() 阻止開始播放
 *   icon-change    每次顯示新圖示，detail: { index, icon, mode, cycle }
 *   cycle-end      完成一輪，detail: { cycle, mode }
 *   anim-end       播放結束（只在 loop="false" 時），detail: { cycle, removeOnEnd, revealTargets }
 *   before-remove  移除前觸發，可 preventDefault() 阻止，detail: { mode }
 *   removed        元件刪除後在原父元素上觸發，detail: { element }
 *   hidden         remove-mode="hide" 隱藏後觸發
 *   revealed       reveal-on-end 目標顯示後觸發，detail: { ids, elements, source }
 *   before-navigate  跳轉前觸發，可 preventDefault() 阻止，detail: { href, target, source }
 *
 * 結束流程順序：anim-end → 移除或隱藏（remove-on-end）→ 顯示目標（reveal-on-end）→ 跳轉（href）。
 * 元件已從 DOM 移除時，revealed 與 before-navigate 改在 document 上觸發。
 * href-target="_blank" 在非使用者操作的時機開啟新視窗，可能被瀏覽器的彈出視窗封鎖攔下。
 *
 * 時間規則：最後一個圖示停留一個 interval（sequence 模式為 hold）後，視為一輪結束。
 * 若 reveal-on-end 與 remove-on-end 同時設定，會在元件移除或隱藏完成後才顯示目標；
 * 若移除被 preventDefault() 取消，仍會照常顯示目標。
 * icons-from、colors-from 的來源元素內容變動時，元件會自動重新開始。
 *
 * MIT License
 */
(() => {
  'use strict';
  if (customElements.get('ui-icon-anim')) return;

  const PALETTE = {
    base: '#0C0D0C', shell: '#C6C7BD',
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
  const SIZE_PRESETS = { sm: '1.25rem', md: '2rem', lg: '3rem', xl: '4.5rem' };
  const EFFECTS = ['fade', 'scale', 'flip', 'none'];
  const DEFAULT_ICON_SOURCE = 'global_icon_list';
  const ANIM_MS = 360;
  const LEAVE_MS = 400;
  const STYLE_ID = 'ui-icon-anim-style';
  const HALF = ANIM_MS / 2;

  const CSS = `
ui-icon-anim{display:inline-block;vertical-align:middle;line-height:1;}
ui-icon-anim.uia-host-hidden{display:none !important;}
ui-icon-anim .uia-stage{position:relative;display:flex;align-items:flex-end;}
ui-icon-anim .uia-stage.uia-replace{justify-content:center;align-items:center;}
ui-icon-anim .uia-icon{display:inline-block;line-height:1;font-style:normal;}
ui-icon-anim .uia-icon::before{vertical-align:top;line-height:1;}
ui-icon-anim .uia-replace .uia-icon{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;}

ui-icon-anim .uia-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  font-family:inherit;font-size:1rem;line-height:1.2;padding:8px 20px;border-radius:8px;
  border:1px solid var(--uia-btn-color,#5DBAE8);background:#141614;color:var(--uia-btn-color,#5DBAE8);
  cursor:pointer;transition:background-color .2s ease,color .2s ease;}
ui-icon-anim .uia-btn:hover,ui-icon-anim .uia-btn:focus-visible{background:var(--uia-btn-color,#5DBAE8);color:#0C0D0C;outline:none;}
ui-icon-anim .uia-btn-label{display:inline-flex;align-items:center;gap:8px;}
ui-icon-anim .uia-btn-label .bi::before{vertical-align:top;}
ui-icon-anim.uia-armed .uia-stage{display:none;}
ui-icon-anim.uia-btn-mode:not(.uia-armed):not(.uia-keep) .uia-btn{display:none;}
ui-icon-anim.uia-keep:not(.uia-armed) .uia-btn-label{display:none;}
ui-icon-anim.uia-keep:not(.uia-armed) .uia-btn{cursor:default;pointer-events:none;background:#141614;}

@keyframes uia-fade-in{from{opacity:0}to{opacity:1}}
@keyframes uia-fade-out{from{opacity:1}to{opacity:0}}
@keyframes uia-scale-in{0%{opacity:0;transform:scale(.3)}70%{opacity:1;transform:scale(1.12)}100%{opacity:1;transform:scale(1)}}
@keyframes uia-scale-out{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.3)}}
@keyframes uia-flip-in{from{opacity:0;transform:perspective(400px) rotateY(90deg)}to{opacity:1;transform:perspective(400px) rotateY(0deg)}}
@keyframes uia-flip-out{from{opacity:1;transform:perspective(400px) rotateY(0deg)}to{opacity:0;transform:perspective(400px) rotateY(-90deg)}}
@keyframes uia-shrink{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(0)}}
@keyframes uia-slide-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}

ui-icon-anim .uia-in-fade{animation:uia-fade-in ${ANIM_MS}ms ease both;}
ui-icon-anim .uia-in-scale{animation:uia-scale-in ${ANIM_MS}ms ease both;}
ui-icon-anim .uia-in-flip{animation:uia-flip-in ${ANIM_MS}ms ease both;}
ui-icon-anim .uia-out-fade{animation:uia-fade-out ${ANIM_MS}ms ease forwards;}
ui-icon-anim .uia-out-scale{animation:uia-scale-out ${ANIM_MS}ms ease forwards;}
ui-icon-anim .uia-out-flip{animation:uia-flip-out ${ANIM_MS}ms ease forwards;}
ui-icon-anim .uia-replace .uia-out-flip{animation-duration:${HALF}ms;}
ui-icon-anim .uia-replace .uia-in-flip{animation-duration:${HALF}ms;animation-delay:${HALF}ms;}

ui-icon-anim.uia-leave-fade{animation:uia-fade-out ${LEAVE_MS}ms ease forwards;}
ui-icon-anim.uia-leave-shrink{animation:uia-shrink ${LEAVE_MS}ms ease forwards;}

.uia-reveal-fade{animation:uia-fade-in 500ms ease both;}
.uia-reveal-slide{animation:uia-slide-in 500ms ease both;}

.uia-sys-alert{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;
  min-width:420px;max-width:90vw;background:#1C1A0E;border:1px solid #FFA987;color:#FFA987;
  border-radius:8px;padding:12px 44px 12px 16px;font-size:0.95rem;line-height:1.6;}
.uia-sys-alert code{color:#E3D322;font-size:0.85rem;word-break:break-all;}
.uia-sys-alert .uia-close{position:absolute;top:8px;right:10px;background:none;border:0;
  color:#FFA987;font-size:1.25rem;line-height:1;cursor:pointer;padding:0 4px;}
`;

  /* ---------- 工具函式 ---------- */
  const toBool = (v, def) => {
    if (v === null || v === undefined) return def;
    const s = String(v).trim().toLowerCase();
    return !(s === 'false' || s === '0' || s === 'no' || s === 'off');
  };
  const toInt = (v, def, min = 0) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? Math.max(min, n) : def;
  };
  const splitList = v => String(v || '').split(',').map(s => s.trim()).filter(Boolean);
  const splitTokens = v => String(v || '').split(/[\s,]+/).map(s => s.trim()).filter(s => s && s.toLowerCase() !== 'bi');
  const normIcon = n => {
    n = n.replace(/^bi\s+/i, '').trim();
    return n.startsWith('bi-') ? n : 'bi-' + n;
  };
  const resolveColor = c => PALETTE[c.toLowerCase()] || c;
  const resolveSize = s => {
    const k = s.toLowerCase();
    if (SIZE_PRESETS[k]) return SIZE_PRESETS[k];
    if (/^\d*\.?\d+$/.test(s)) return s + 'rem';
    return s;
  };
  const pick = (arr, i, def) => (arr.length ? arr[i % arr.length] : def);
  const cleanId = v => String(v || '').trim().replace(/^#/, '');

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- Bootstrap Icons 偵測 ---------- */
  let iconCheckScheduled = false;
  function scheduleIconCheck() {
    if (iconCheckScheduled) return;
    iconCheckScheduled = true;
    const run = () => setTimeout(checkIcons, 300);
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
  }
  function checkIcons() {
    const probe = document.createElement('i');
    probe.className = 'bi bi-heart';
    probe.style.cssText = 'position:absolute;left:-9999px;top:0;';
    document.body.appendChild(probe);
    const content = getComputedStyle(probe, '::before').content;
    probe.remove();
    if (content && content !== 'none' && content !== 'normal') return;
    showSysAlert('ui-icon-anim：未偵測到 Bootstrap Icons 樣式表，圖示將無法顯示。請在頁面加入：<br><code>https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css</code>');
  }
  function showSysAlert(html) {
    const box = document.createElement('div');
    box.className = 'alert alert-warning uia-sys-alert';
    box.setAttribute('role', 'alert');
    box.innerHTML = html + '<button type="button" class="uia-close" title="關閉">×</button>';
    box.querySelector('.uia-close').addEventListener('click', () => box.remove());
    document.body.prepend(box);
  }

  /* ---------- 元件本體 ---------- */
  class UiIconAnim extends HTMLElement {
    static get observedAttributes() {
      return ['icons', 'icons-from', 'colors-from', 'interval', 'mode', 'colors', 'size', 'loop',
        'effect', 'gap', 'hold', 'button-text', 'button-icon', 'button-color', 'button-keep'];
    }

    constructor() {
      super();
      this._index = -1;
      this._cycle = 0;
      this._timer = null;
      this._pending = null;
      this._remaining = 0;
      this._due = 0;
      this._wantPlay = false;
      this._inView = true;
      this._ended = false;
      this._stage = null;
      this._btn = null;
      this._label = null;
      this._io = null;
      this._mo = null;
      this._restartQueued = false;
      this._waitingDom = false;
      this._timers = new Set();
      this._warned = false;
    }

    /* ----- 屬性讀取 ----- */
    get mode() { return (this.getAttribute('mode') || '').toLowerCase() === 'sequence' ? 'sequence' : 'replace'; }
    get interval() { return toInt(this.getAttribute('interval'), 1000, 100); }
    get hold() { return toInt(this.getAttribute('hold'), this.interval, 0); }
    get loop() { return toBool(this.getAttribute('loop'), true); }
    get effect() {
      const e = (this.getAttribute('effect') || 'fade').toLowerCase();
      return EFFECTS.includes(e) ? e : 'fade';
    }
    get gap() { return toInt(this.getAttribute('gap'), 8, 0); }
    get icons() {
      const attr = (this.getAttribute('icons') || '').trim();
      if (attr) return splitTokens(attr).map(normIcon);
      const src = this._iconSource();
      return src ? splitTokens(src.textContent).map(normIcon) : [];
    }
    get colors() {
      const attr = (this.getAttribute('colors') || '').trim();
      if (attr) return splitList(attr).map(resolveColor);
      const src = this._colorSource();
      return src ? splitTokens(src.textContent).map(resolveColor) : [];
    }
    get sizes() {
      const l = splitList(this.getAttribute('size')).map(resolveSize);
      return l.length ? l : [SIZE_PRESETS.md];
    }
    get index() { return this._index; }
    get playing() { return this._wantPlay && !this._ended; }
    get armed() { return this.classList.contains('uia-armed'); }

    _iconSource() {
      if ((this.getAttribute('icons') || '').trim()) return null;
      const id = cleanId(this.getAttribute('icons-from'));
      return document.getElementById(id || DEFAULT_ICON_SOURCE);
    }
    _colorSource() {
      if ((this.getAttribute('colors') || '').trim()) return null;
      const id = cleanId(this.getAttribute('colors-from'));
      return id ? document.getElementById(id) : null;
    }
    _isButtonMode() { return this.hasAttribute('button-text') || this.hasAttribute('button-icon'); }
    _isKeep() { return this._isButtonMode() && toBool(this.getAttribute('button-keep'), false); }

    /* ----- 生命週期 ----- */
    connectedCallback() {
      injectStyle();
      scheduleIconCheck();
      this._build();
      this._applyLayout();
      this._observe();

      // 圖示來源元素可能位於元件之後，尚未解析完成時等 DOMContentLoaded 再啟動
      if (!this.icons.length && document.readyState === 'loading') {
        if (!this._waitingDom) {
          this._waitingDom = true;
          if (this._isButtonMode()) this.classList.add('uia-armed');
          document.addEventListener('DOMContentLoaded', () => {
            this._waitingDom = false;
            if (!this.isConnected) return;
            this._applyLayout();
            this._watchSources();
            this._warnOnce();
            this._autoStart();
          }, { once: true });
        }
        return;
      }
      this._watchSources();
      this._warnOnce();
      this._autoStart();
    }

    disconnectedCallback() {
      this._suspend();
      if (this._io) { this._io.disconnect(); this._io = null; }
      if (this._mo) { this._mo.disconnect(); this._mo = null; }
      this._timers.forEach(clearTimeout);
      this._timers.clear();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal || !this._stage || !this.isConnected) return;
      this._queueRestart();
    }

    _autoStart() {
      if (this._ended) return;
      if (this._index === -1 && !this._pending) {
        if (this._isButtonMode()) this._resetState();
        else if (toBool(this.getAttribute('autoplay'), true)) this.play();
      } else if (this._wantPlay) {
        this._resume();
      }
    }

    _queueRestart() {
      if (this._restartQueued) return;
      this._restartQueued = true;
      queueMicrotask(() => {
        this._restartQueued = false;
        if (!this.isConnected) return;
        const was = this._wantPlay;
        this._build();
        this._resetState();
        this._watchSources();
        if (was) this._start();
      });
    }

    /* ----- 公開方法 ----- */
    play() {
      if (this._ended || this.classList.contains('uia-host-hidden')) this._resetState();
      this._start();
    }

    pause() {
      this._wantPlay = false;
      this._suspend();
    }

    reset() {
      const was = this._wantPlay;
      this._resetState();
      if (was && !this._isButtonMode()) this._start();
    }

    goTo(i) {
      const n = this.icons.length;
      if (!n || !this._stage) return;
      i = (((parseInt(i, 10) || 0) % n) + n) % n;
      if (this._ended) this._resetState();
      this._disarm();
      clearTimeout(this._timer);
      this._timer = null;
      this._pending = null;
      if (this.mode === 'sequence') {
        this._stage.replaceChildren();
        for (let k = 0; k < i; k++) this._stage.appendChild(this._makeIcon(k, false));
      }
      this._index = i - 1;
      this._showNext();
    }

    /* ----- 內部：結構與按鈕 ----- */
    _build() {
      if (!this._stage) {
        this._stage = document.createElement('span');
        this._stage.className = 'uia-stage';
      }
      const btnMode = this._isButtonMode();
      const keep = this._isKeep();
      this.classList.toggle('uia-btn-mode', btnMode);
      this.classList.toggle('uia-keep', keep);

      if (!btnMode) {
        this.classList.remove('uia-armed');
        if (this._stage.parentNode !== this || this.childNodes.length !== 1) this.replaceChildren(this._stage);
        return;
      }

      if (!this._btn) {
        this._btn = document.createElement('button');
        this._btn.type = 'button';
        this._btn.className = 'uia-btn';
        this._label = document.createElement('span');
        this._label.className = 'uia-btn-label';
        this._btn.addEventListener('click', () => this._onButtonClick());
      }
      this._btn.style.setProperty('--uia-btn-color', resolveColor((this.getAttribute('button-color') || 'blue').trim()));

      const parts = [];
      const icon = (this.getAttribute('button-icon') || '').trim();
      if (icon) {
        const ic = document.createElement('i');
        ic.className = 'bi ' + normIcon(icon);
        parts.push(ic);
      }
      const text = this.getAttribute('button-text');
      if (text) {
        const tx = document.createElement('span');
        tx.textContent = text;
        parts.push(tx);
      }
      this._label.replaceChildren(...parts);

      if (keep) {
        this._btn.replaceChildren(this._label, this._stage);
        this.replaceChildren(this._btn);
      } else {
        this._btn.replaceChildren(this._label);
        this.replaceChildren(this._btn, this._stage);
      }
    }

    _onButtonClick() {
      if (!this.armed) return;
      const ok = this._emit('trigger-click', {}, true);
      if (!ok) return;
      this.play();
    }

    _disarm() {
      if (!this.armed) return;
      if (this._isKeep() && this._btn && !this._btn.style.minWidth) {
        this._btn.style.minWidth = this._btn.offsetWidth + 'px';
      }
      this.classList.remove('uia-armed');
    }

    _start() {
      this._disarm();
      this._wantPlay = true;
      if (this._pending) this._resume();
      else this._showNext();
    }

    _watchSources() {
      if (this._mo) { this._mo.disconnect(); this._mo = null; }
      if (!('MutationObserver' in window)) return;
      const srcs = [this._iconSource(), this._colorSource()].filter(Boolean);
      if (!srcs.length) return;
      this._mo = new MutationObserver(() => this._queueRestart());
      srcs.forEach(s => this._mo.observe(s, { childList: true, characterData: true, subtree: true }));
    }

    /* ----- 內部：版面 ----- */
    _applyLayout() {
      const st = this._stage;
      if (!st) return;
      const sizes = this.sizes;
      const max = sizes.length > 1 ? `max(${sizes.join(',')})` : sizes[0];
      const isReplace = this.mode === 'replace';
      st.classList.toggle('uia-replace', isReplace);
      st.classList.toggle('uia-sequence', !isReplace);
      st.style.minHeight = max;
      if (isReplace) {
        st.style.width = max;
        st.style.height = max;
        st.style.gap = '';
      } else {
        st.style.width = '';
        st.style.height = '';
        st.style.gap = this.gap + 'px';
      }
    }

    _makeIcon(i, animate = true) {
      const icons = this.icons;
      const el = document.createElement('i');
      el.className = `bi ${icons[i]} uia-icon`;
      el.style.color = pick(this.colors, i, 'inherit');
      el.style.fontSize = pick(this.sizes, i, SIZE_PRESETS.md);
      el.dataset.index = i;
      if (animate && this.effect !== 'none') el.classList.add('uia-in-' + this.effect);
      return el;
    }

    _render(i) {
      if (this.mode === 'replace') {
        this._stage.querySelectorAll('.uia-icon:not(.uia-leaving)').forEach(old => this._leave(old));
      }
      this._stage.appendChild(this._makeIcon(i));
    }

    _leave(el) {
      el.classList.add('uia-leaving');
      const eff = this.effect;
      if (eff === 'none') { el.remove(); return; }
      el.className = el.className.replace(/\buia-in-\w+/g, '').trim();
      el.classList.add('uia-out-' + eff);
      this._later(() => el.remove(), ANIM_MS);
    }

    _clearStage(animate) {
      if (animate && this.effect !== 'none') {
        this._stage.querySelectorAll('.uia-icon:not(.uia-leaving)').forEach(el => this._leave(el));
      } else {
        this._stage.replaceChildren();
      }
    }

    /* ----- 內部：計時 ----- */
    _canRun() { return this._wantPlay && this._inView && this.isConnected; }

    _schedule(fn, ms) {
      clearTimeout(this._timer);
      this._timer = null;
      this._pending = fn;
      this._remaining = ms;
      this._due = performance.now() + ms;
      if (this._canRun()) this._arm(ms);
    }

    _arm(ms) {
      this._due = performance.now() + ms;
      this._timer = setTimeout(() => {
        this._timer = null;
        const f = this._pending;
        this._pending = null;
        if (f) f();
      }, ms);
    }

    _suspend() {
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
        this._remaining = Math.max(0, this._due - performance.now());
      }
    }

    _resume() {
      if (this._pending && !this._timer && this._canRun()) this._arm(this._remaining);
    }

    _later(fn, ms) {
      const t = setTimeout(() => { this._timers.delete(t); fn(); }, ms);
      this._timers.add(t);
      return t;
    }

    _observe() {
      if (this._io || !('IntersectionObserver' in window)) return;
      this._io = new IntersectionObserver(entries => {
        const vis = entries[entries.length - 1].isIntersecting;
        this._inView = vis;
        if (vis) this._resume(); else this._suspend();
      });
      this._io.observe(this);
    }

    _resetState() {
      clearTimeout(this._timer);
      this._timer = null;
      this._pending = null;
      this._timers.forEach(clearTimeout);
      this._timers.clear();
      this._index = -1;
      this._cycle = 0;
      this._ended = false;
      this._wantPlay = false;
      this.classList.remove('uia-host-hidden', 'uia-leave-fade', 'uia-leave-shrink');
      if (this._stage) this._stage.replaceChildren();
      if (this._isButtonMode()) {
        this.classList.add('uia-armed');
        if (this._btn) this._btn.style.minWidth = '';
      }
      this._applyLayout();
    }

    /* ----- 內部：播放流程 ----- */
    _showNext() {
      const icons = this.icons;
      const n = icons.length;
      if (!n || !this._stage) return;
      this._index++;
      if (this._index >= n) this._index = 0;
      this._render(this._index);
      this._emit('icon-change', { index: this._index, icon: icons[this._index], mode: this.mode, cycle: this._cycle });
      if (this._index < n - 1) {
        this._schedule(() => this._showNext(), this.interval);
      } else {
        this._schedule(() => this._cycleDone(), this.mode === 'sequence' ? this.hold : this.interval);
      }
    }

    _cycleDone() {
      this._cycle++;
      this._emit('cycle-end', { cycle: this._cycle, mode: this.mode });
      if (this.loop) {
        this._index = -1;
        if (this.mode === 'sequence') {
          this._clearStage(true);
          this._schedule(() => this._showNext(), this.effect === 'none' ? 0 : ANIM_MS);
        } else {
          this._showNext();
        }
      } else {
        this._finish();
      }
    }

    _finish() {
      this._ended = true;
      this._wantPlay = false;
      this._pending = null;
      const reveal = splitList(this.getAttribute('reveal-on-end')).map(cleanId);
      const removeOn = toBool(this.getAttribute('remove-on-end'), false);
      this._emit('anim-end', { cycle: this._cycle, removeOnEnd: removeOn, revealTargets: reveal });
      if (!removeOn) {
        this._reveal(reveal);
        this._navigate();
        if (this._isButtonMode() && toBool(this.getAttribute('button-restore'), false)) this._resetState();
        return;
      }
      const delay = toInt(this.getAttribute('remove-delay'), 0, 0);
      this._later(() => this._doRemove(reveal), delay);
    }

    _removeMode() {
      return (this.getAttribute('remove-mode') || '').toLowerCase() === 'hide' ? 'hide' : 'remove';
    }

    _doRemove(reveal) {
      const mode = this._removeMode();
      const ok = this._emit('before-remove', { mode }, true);
      if (!ok) { this._reveal(reveal); this._navigate(); return; }
      const eff = (this.getAttribute('remove-effect') || 'fade').toLowerCase();
      const dur = eff === 'none' ? 0 : LEAVE_MS;
      if (dur) this.classList.add(eff === 'shrink' ? 'uia-leave-shrink' : 'uia-leave-fade');
      this._later(() => {
        this.classList.remove('uia-leave-fade', 'uia-leave-shrink');
        if (mode === 'hide') {
          this.classList.add('uia-host-hidden');
          this._emit('hidden', {});
        } else {
          const parent = this.parentNode;
          this.remove();
          if (parent) parent.dispatchEvent(new CustomEvent('removed', { bubbles: true, detail: { element: this } }));
        }
        this._reveal(reveal);
        this._navigate();
      }, dur);
    }

    _navigate() {
      const href = (this.getAttribute('href') || '').trim();
      if (!href) return;
      const target = (this.getAttribute('href-target') || '_self').trim() || '_self';
      const go = () => {
        const host = this.isConnected ? this : document;
        const ok = host.dispatchEvent(new CustomEvent('before-navigate', {
          bubbles: true, cancelable: true, detail: { href, target, source: this }
        }));
        if (!ok) return;
        if (target === '_self') {
          window.location.assign(href);
        } else {
          const w = window.open(href, target);
          if (!w) console.warn('[ui-icon-anim] 新視窗被瀏覽器攔截，請允許彈出視窗或改用 href-target="_self"。', this);
        }
      };
      const d = toInt(this.getAttribute('href-delay'), 0, 0);
      if (d) setTimeout(go, d); else go();
    }

    _reveal(ids) {
      if (!ids.length) return;
      const run = () => {
        const eff = (this.getAttribute('reveal-effect') || 'fade').toLowerCase();
        const shown = [];
        ids.forEach(id => {
          const el = document.getElementById(id);
          if (!el) { console.warn(`[ui-icon-anim] 找不到 id="${id}" 的元素，無法顯示。`); return; }
          el.hidden = false;
          el.classList.remove('d-none', 'invisible');
          if (el.style.display === 'none') el.style.display = '';
          if (getComputedStyle(el).display === 'none') el.style.display = 'block';
          if (el.style.visibility === 'hidden') el.style.visibility = '';
          el.classList.remove('uia-reveal-fade', 'uia-reveal-slide');
          if (eff === 'fade' || eff === 'slide') {
            void el.offsetWidth;
            el.classList.add('uia-reveal-' + eff);
          }
          shown.push(el);
        });
        const target = this.isConnected ? this : document;
        target.dispatchEvent(new CustomEvent('revealed', { bubbles: true, detail: { ids, elements: shown, source: this } }));
      };
      const d = toInt(this.getAttribute('reveal-delay'), 0, 0);
      if (d) setTimeout(run, d); else run();
    }

    _emit(name, detail, cancelable = false) {
      return this.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable, detail }));
    }

    _warnOnce() {
      if (this._warned) return;
      this._warned = true;
      if (!this.icons.length) {
        const from = cleanId(this.getAttribute('icons-from'));
        if (from && !document.getElementById(from)) console.warn(`[ui-icon-anim] icons-from 找不到 id="${from}" 的元素。`, this);
        else console.warn(`[ui-icon-anim] 沒有圖示可播放，請設定 icons、icons-from，或在頁面加入 <div id="${DEFAULT_ICON_SOURCE}">。`, this);
      }
      const cf = cleanId(this.getAttribute('colors-from'));
      if (cf && !(this.getAttribute('colors') || '').trim() && !document.getElementById(cf)) {
        console.warn(`[ui-icon-anim] colors-from 找不到 id="${cf}" 的元素。`, this);
      }
      if (this.loop && toBool(this.getAttribute('remove-on-end'), false)) {
        console.warn('[ui-icon-anim] remove-on-end 只在 loop="false" 時生效，目前會被忽略。', this);
      }
      if (this.loop && this.hasAttribute('reveal-on-end')) {
        console.warn('[ui-icon-anim] reveal-on-end 只在 loop="false" 時生效，目前會被忽略。', this);
      }
      if (this.loop && (this.getAttribute('href') || '').trim()) {
        console.warn('[ui-icon-anim] href 只在 loop="false" 時生效，目前會被忽略。', this);
      }
      if (this.loop && this.hasAttribute('button-restore')) {
        console.warn('[ui-icon-anim] button-restore 只在 loop="false" 時生效；循環播放時可呼叫 reset() 回到按鈕狀態。', this);
      }
    }
  }

  customElements.define('ui-icon-anim', UiIconAnim);
  window.UiIconAnim = UiIconAnim;
  window.UiIconAnim.PALETTE = PALETTE;
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
