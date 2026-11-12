/*!
 * ui-post.js v1.0.0
 * <ui-post> 社群貼文留言動畫元件
 *
 * 模擬社群貼文：貼文先出現，留言一則一則冒出（前面有「正在輸入」動畫），
 * 接著愛心數開始跳動，最佳回答的愛心爆棚、蓋上徽章並置頂，差的答案變灰或摺疊，
 * 最後可接考官留言與講評標籤。適合螢幕錄影教學。
 *
 * 用法：
 * <ui-post author="IELTS Examiner" time="2h">
 *   How often do you exercise?
 *   <post-item author="Amy" likes="3" low tags="照抄題目:red">I exercise almost every day.</post-item>
 *   <post-item author="Ben" likes="1280" best tags="具體:green,慣用語:yellow">I go jogging every day, rain or shine.</post-item>
 *   <post-item author="Examiner" examiner>Name the sport and add an idiom.</post-item>
 * </ui-post>
 *
 * <ui-post> 屬性：
 *   內容：author、avatar（文字、emoji 或圖片網址）、avatar-color、time、badge（作者旁徽章）、
 *         brand（時間後方的平台名稱）、likes（貼文愛心數）、shares（貼文轉寄數）、
 *         share（轉寄圖示，預設顯示，false 隱藏）、share-label（轉寄文字，預設「分享」）
 *   播放：autoplay（預設進入畫面時開始，false 為手動）、rate（初始倍率，預設 1）、
 *         start-delay（600）、item-delay（留言間隔 700）、typing（輸入中動畫 1100）、
 *         surge-delay（全部留言出現後到愛心爆發前的停頓 700）、surge（爆發時間 3500）、
 *         end-delay（爆發後到考官留言的停頓 900）
 *   效果：burst（big、small、none，預設 big）、sort（最佳回答置頂，預設 true）、
 *         low-style（低分留言：dim、fold、keep，預設 dim）、count-format（short、full，預設 short）
 *   外觀：width（預設 640px）、font-size、bg-color、bubble-color、text-color、
 *         heart-color（urgent）、best-color（yellow）、examiner-color（key）、controls（預設顯示）
 *   文字：best-label、examiner-label、fold-label、typing-label、comment-label、like-label
 *
 * <post-item> 屬性：
 *   author、avatar、avatar-color、time、likes（最後的愛心數）、start-likes（爆發前的愛心數）、
 *   shares（轉寄數，設定後留言下方出現轉寄圖示，爆發時跟著愛心一起增加）、start-shares、
 *   best（最佳回答）、low（低分，可填 dim、fold、keep 覆蓋 low-style）、
 *   examiner（考官留言，預設在爆發後出現）、after（爆發後才出現；after="false" 可讓考官留言提早）、
 *   tags（講評標籤，逗點分隔，可用「文字:色名」，在爆發後出現）、liked（愛心一開始就是實心）、
 *   delay、typing（這一則的間隔與輸入中動畫毫秒數）
 *   行內可用 <b>、<i>、<c-key> 等色名標籤。
 *
 * 事件：post-item-show（detail: { index, author, after }）、post-surge-end、post-end
 * 方法：play()、pause()、restart()；屬性 rate 可讀寫
 *
 * MIT License
 */
(() => {
  'use strict';
  if (customElements.get('ui-post')) return;

  const PALETTE = {
    'background': '#0C0D0C', 'bg-alternative': '#3B2A20', 'shell': '#C6C7BD', 'vanilla': '#DBEDD8',
    'yellow': '#E3D322', 'pink': '#FF91D7', 'red': '#EF6661', 'green': '#71CD76', 'blue': '#5DBAE8',
    'indigo': '#778CE1', 'violet': '#B484E8', 'gray': '#86877F', 'key': '#51DBCF', 'calm': '#A3C4BC',
    'quiet': '#8EA4DE', 'playful': '#FFA987', 'urgent': '#FF2E63', 'energetic': '#B6FF00', 'dreamy': '#DE8EC9'
  };
  const AVATAR_COLORS = ['#5DBAE8', '#FF91D7', '#71CD76', '#E3D322', '#B484E8', '#FFA987', '#51DBCF', '#778CE1', '#DE8EC9', '#A3C4BC'];
  const RATES = [0.5, 1, 2];
  const CANCEL = { cancelled: true };
  const STYLE_ID = 'ui-post-style';
  const SVG_HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.6-4.6-9.5-9.2C1.1 7.9 3.2 4.3 6.8 4.3c2.1 0 3.5 1.1 4.2 2.3.7-1.2 2.1-2.3 4.2-2.3 3.6 0 5.7 3.6 4.3 7C17.6 15.9 12 20.5 12 20.5z"/></svg>';
  const SVG_COMMENT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h16v11H9l-5 4z"/></svg>';
  const SVG_SHARE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 5l7 6.5-7 6.5v-3.8C8.4 14.2 5.3 15.9 3.5 19.5c.6-5.6 3.8-9.6 10-10.6z"/></svg>';

  const color = (v) => {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    const k = String(v).trim().toLowerCase();
    return PALETTE[k] || String(v).trim();
  };
  const bool = (v, def) => {
    if (v === null || v === undefined) return def;
    const s = String(v).trim().toLowerCase();
    return !(s === 'false' || s === '0' || s === 'no' || s === 'off');
  };
  const num = (v, def, min, max) => {
    const n = parseFloat(v);
    if (!Number.isFinite(n)) return def;
    return Math.min(max, Math.max(min, n));
  };
  const len = (v) => {
    if (!v) return null;
    const s = String(v).trim();
    return /^\d+(\.\d+)?$/.test(s) ? s + 'px' : s;
  };
  const hash = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };

  const STYLE_TEXT = `
ui-post{display:block;max-width:var(--upo-width,640px);font-family:system-ui,-apple-system,"Segoe UI","Noto Sans TC","Microsoft JhengHei",sans-serif;}
ui-post > post-item{display:none;}
ui-post .upo,ui-post .upo *{box-sizing:border-box;}
ui-post .upo{background:var(--upo-bg,#0C0D0C);border:1px solid #3B2A20;border-radius:14px;overflow:hidden;font-size:var(--upo-font-size,1rem);color:var(--upo-text,#DBEDD8);}
ui-post .upo-card{padding:20px 20px 14px 20px;border-bottom:1px solid #3B2A20;}
ui-post .upo-head{display:flex;gap:12px;align-items:center;margin:0 0 12px 0;}
ui-post .upo-av{flex:0 0 auto;width:42px;height:42px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:1.05rem;color:#0C0D0C;overflow:hidden;}
ui-post .upo-av img{width:100%;height:100%;object-fit:cover;display:block;}
ui-post .upo-name{font-weight:700;font-size:.95rem;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
ui-post .upo-time{font-size:.8rem;color:#86877F;}
ui-post .upo-body{font-size:1.25em;line-height:1.5;font-weight:600;margin:0 0 14px 0;word-break:break-word;}
ui-post .upo-actions{display:flex;gap:24px;font-size:.875rem;color:#C6C7BD;}
ui-post .upo-act{display:inline-flex;align-items:center;gap:6px;}
ui-post .upo-share-item{display:inline-flex;align-items:center;gap:6px;color:#C6C7BD;font-size:.875rem;font-weight:700;}
ui-post .upo-share-item svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round;}
ui-post .upo-item.is-surging .upo-share-item{color:var(--upo-share,#5DBAE8);}
ui-post .upo-act svg,ui-post .upo-heart svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round;}
ui-post .upo-list{padding:14px 16px 6px 16px;display:flex;flex-direction:column;gap:14px;min-height:var(--upo-min-height,80px);}
ui-post .upo-item{display:flex;gap:10px;align-items:flex-start;animation:upo-in .35s ease-out;}
ui-post .upo-item .upo-av{width:36px;height:36px;font-size:.9rem;}
ui-post .upo-main{flex:1;min-width:0;}
ui-post .upo-bubble{display:inline-block;max-width:100%;background:var(--upo-bubble,#3B2A20);border:2px solid var(--upo-bubble,#3B2A20);border-radius:14px;padding:10px 14px;}
ui-post .upo-text{line-height:1.55;word-break:break-word;margin:4px 0 0 0;}
ui-post .upo-foot{display:flex;align-items:center;gap:16px;margin:6px 0 0 10px;font-size:.8rem;color:#86877F;}
ui-post .upo-heart{display:inline-flex;align-items:center;gap:6px;background:none;border:0;padding:0;color:#C6C7BD;font:inherit;font-size:.875rem;font-weight:700;cursor:default;}
ui-post .upo-heart b{font-variant-numeric:tabular-nums;min-width:2ch;}
ui-post .upo-heart.is-on{color:var(--upo-heart,#FF2E63);}
ui-post .upo-heart.is-on svg{fill:currentColor;}
ui-post .upo-item.is-surging .upo-heart{color:var(--upo-heart,#FF2E63);}
ui-post .upo-item.is-surging .upo-heart svg{animation:upo-beat .45s ease-in-out infinite;}
ui-post .upo-item.is-surging .upo-heart b{font-size:1.15rem;}
ui-post .upo-pill{display:inline-flex;align-items:center;gap:4px;font-size:.72rem;font-weight:800;padding:2px 8px;border-radius:999px;color:#0C0D0C;animation:upo-pop .45s ease-out;}
ui-post .upo-pill.is-best{background:var(--upo-best,#E3D322);}
ui-post .upo-pill.is-examiner{background:var(--upo-examiner,#51DBCF);}
ui-post .upo-pill.is-badge{background:#C6C7BD;}
ui-post .upo-item.is-best .upo-bubble{border-color:var(--upo-best,#E3D322);}
ui-post .upo-item.is-examiner .upo-bubble{border-color:var(--upo-examiner,#51DBCF);}
ui-post .upo-item.is-dim .upo-text,ui-post .upo-item.is-dim .upo-name{color:#86877F;}
ui-post .upo-item.is-dim .upo-av{filter:grayscale(1);}
ui-post .upo-fold{display:inline-block;font:inherit;font-size:.85rem;font-style:italic;color:#86877F;background:none;border:1px dashed #86877F;border-radius:10px;padding:8px 12px;cursor:pointer;animation:upo-in .35s ease-out;}
ui-post .upo-tags{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0 0;}
ui-post .upo-tag{font-size:.75rem;font-weight:700;border-radius:999px;padding:2px 10px;color:#0C0D0C;background:#86877F;animation:upo-pop .45s ease-out both;}
ui-post .upo-typing{display:flex;align-items:center;gap:10px;padding:4px 16px 14px 16px;color:#86877F;font-size:.85rem;}
ui-post .upo-typing[hidden]{display:none;}
ui-post .upo-typing .upo-av{width:28px;height:28px;font-size:.75rem;}
ui-post .upo-dots{display:inline-flex;gap:4px;margin:0 0 0 2px;}
ui-post .upo-dots span{display:block;width:6px;height:6px;border-radius:50%;background:#86877F;animation:upo-dot 1s ease-in-out infinite;}
ui-post .upo-dots span:nth-child(2){animation-delay:.15s;}
ui-post .upo-dots span:nth-child(3){animation-delay:.3s;}
ui-post .upo-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 12px;border-top:1px solid #3B2A20;background:#141614;}
ui-post .upo-btn{font-family:inherit;font-size:.8125rem;line-height:1.4;background:#0C0D0C;color:#C6C7BD;border:1px solid #86877F;border-radius:6px;padding:4px 10px;cursor:pointer;}
ui-post .upo-btn:hover{border-color:#FF91D7;color:#FF91D7;}
ui-post .upo-btn.is-on,ui-post .upo-btn.is-on:hover{background:#FF91D7;border-color:#FF91D7;color:#0C0D0C;}
ui-post .upo-btn:disabled,ui-post .upo-btn:disabled:hover{background:#0C0D0C;border-color:#3B2A20;color:#86877F;cursor:not-allowed;}
ui-post .upo-sep{width:1px;height:20px;background:#3B2A20;margin:0 4px;}
ui-post .upo-state{flex:1;text-align:right;font-size:.8125rem;color:#86877F;}
.ui-post-heart{position:fixed;left:0;top:0;z-index:9999;pointer-events:none;width:22px;height:22px;margin:-11px 0 0 -11px;}
.ui-post-heart svg{display:block;width:100%;height:100%;fill:currentColor;}
@keyframes upo-in{from{transform:translateY(14px) scale(.97)}to{transform:none}}
@keyframes upo-pop{0%{transform:scale(0)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes upo-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
@keyframes upo-dot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
`;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = STYLE_TEXT;
    document.head.appendChild(s);
  }

  class UiPost extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      injectStyle();   // 先隱藏 <post-item>，避免解析期間閃出原文
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._init(), { once: true });
      } else {
        this._init();
      }
    }

    disconnectedCallback() {
      if (this._io) { this._io.disconnect(); this._io = null; }
    }

    get rate() { return this._rate || 1; }
    set rate(v) {
      const r = parseFloat(v);
      if (!(r > 0)) return;
      this._rate = Math.min(8, Math.max(0.1, r));
      if (this._built) this._sync();
    }

    /* ---------- 建置 ---------- */
    _init() {
      if (this._built || !this.isConnected) return;
      this._built = true;
      this._rate = num(this.getAttribute('rate'), 1, 0.1, 8);
      this._run = 0;
      this._paused = false;
      this._resumeQ = [];
      this._started = false;
      this._ended = false;

      // 解析：貼文內容（非 post-item 的子節點）與留言
      const body = document.createDocumentFragment();
      this._items = [];
      Array.from(this.childNodes).forEach((n) => {
        if (n.nodeType === 1 && n.tagName === 'POST-ITEM') this._items.push(n.cloneNode(true));
        else body.appendChild(n.cloneNode(true));
      });
      this._bodyFrag = body;
      this._buildDom();
      this._idle();
      this._setupStart();
    }

    _buildDom() {
      this.innerHTML = '';
      const css = (k, v) => { if (v) this.style.setProperty(k, v); };
      css('--upo-width', len(this.getAttribute('width')));
      css('--upo-font-size', this.getAttribute('font-size'));
      css('--upo-min-height', len(this.getAttribute('min-height')));
      css('--upo-bg', color(this.getAttribute('bg-color')));
      css('--upo-bubble', color(this.getAttribute('bubble-color')));
      css('--upo-text', color(this.getAttribute('text-color')));
      css('--upo-heart', color(this.getAttribute('heart-color')));
      css('--upo-best', color(this.getAttribute('best-color')));
      css('--upo-examiner', color(this.getAttribute('examiner-color')));
      css('--upo-share', color(this.getAttribute('share-color')));

      const box = document.createElement('div');
      box.className = 'upo';

      // 貼文卡片
      const card = document.createElement('div');
      card.className = 'upo-card';
      const head = document.createElement('div');
      head.className = 'upo-head';
      const author = this.getAttribute('author') || 'IELTS Examiner';
      head.appendChild(this._avatar(this.getAttribute('avatar'), this.getAttribute('avatar-color'), author));
      const meta = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'upo-name';
      name.textContent = author;
      const badge = this.getAttribute('badge');
      if (badge) name.appendChild(this._pill(badge, 'is-badge'));
      const time = document.createElement('div');
      time.className = 'upo-time';
      time.textContent = [this.getAttribute('time') || '1h', this.getAttribute('brand')].filter(Boolean).join(' · ');
      meta.append(name, time);
      head.appendChild(meta);
      const bodyEl = document.createElement('div');
      bodyEl.className = 'upo-body';
      bodyEl.appendChild(this._bodyFrag.cloneNode(true));
      this._trim(bodyEl);
      const actions = document.createElement('div');
      actions.className = 'upo-actions';
      actions.innerHTML = `<span class="upo-act">${SVG_HEART}<b></b></span><span class="upo-act">${SVG_COMMENT}<b class="upo-ccount">0</b><span class="upo-clabel"></span></span>`;
      if (bool(this.getAttribute('share'), true)) {
        const sh = document.createElement('span');
        sh.className = 'upo-act upo-share';
        sh.innerHTML = SVG_SHARE + '<b></b><span></span>';
        sh.querySelector('b').textContent = this._fmt(Math.round(num(this.getAttribute('shares'), 0, 0, 1e9)));
        sh.querySelector('span').textContent = this.getAttribute('share-label') || '分享';
        actions.appendChild(sh);
      }
      actions.querySelector('b').textContent = this._fmt(Math.round(num(this.getAttribute('likes'), 0, 0, 1e9)));
      actions.querySelector('.upo-clabel').textContent = this.getAttribute('comment-label') || '則留言';
      this._ccount = actions.querySelector('.upo-ccount');
      card.append(head, bodyEl, actions);

      const list = document.createElement('div');
      list.className = 'upo-list';

      const typing = document.createElement('div');
      typing.className = 'upo-typing';
      typing.hidden = true;

      box.append(card, list, typing);
      this._box = box;
      this._list = list;
      this._typing = typing;

      if (bool(this.getAttribute('controls'), true)) {
        const bar = document.createElement('div');
        bar.className = 'upo-controls';
        const btn = (text, tip) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'upo-btn';
          b.textContent = text;
          b.title = tip;
          bar.appendChild(b);
          return b;
        };
        this._btnPlay = btn('▶ 播放', '播放／暫停');
        this._btnRestart = btn('↺ 重播', '從頭播放');
        const sep = document.createElement('span');
        sep.className = 'upo-sep';
        bar.appendChild(sep);
        this._rateBtns = RATES.map((r) => {
          const b = btn(r + '×', '播放速度 ' + r + ' 倍');
          b.addEventListener('click', () => { this.rate = r; });
          return b;
        });
        this._stateEl = document.createElement('span');
        this._stateEl.className = 'upo-state';
        bar.appendChild(this._stateEl);
        this._btnPlay.addEventListener('click', () => {
          if (!this._started || this._ended || this._paused) this.play();
          else this.pause();
        });
        this._btnRestart.addEventListener('click', () => this.restart());
        box.appendChild(bar);
      }
      this.appendChild(box);
      this._sync();
    }

    _trim(el) {
      const texts = [];
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) texts.push(w.currentNode);
      texts.forEach((t) => { t.data = t.data.replace(/\s+/g, ' '); });
      const ne = texts.filter((t) => t.data.trim());
      if (ne.length) {
        ne[0].data = ne[0].data.replace(/^ /, '');
        ne[ne.length - 1].data = ne[ne.length - 1].data.replace(/ $/, '');
      }
    }

    _avatar(src, bg, author) {
      const av = document.createElement('span');
      av.className = 'upo-av';
      av.style.background = color(bg) || AVATAR_COLORS[hash(author || '') % AVATAR_COLORS.length];
      const s = (src || '').trim();
      if (s && /[/.]/.test(s) && s.length > 2) {
        const img = document.createElement('img');
        img.src = s;
        img.alt = '';
        av.appendChild(img);
      } else {
        av.textContent = s || (author || '?').trim().charAt(0).toUpperCase();
      }
      return av;
    }

    _pill(text, cls) {
      const p = document.createElement('span');
      p.className = 'upo-pill ' + cls;
      p.textContent = text;
      return p;
    }

    _fmt(n) {
      if (!n) return '';   // 0 不顯示數字，只留空心愛心
      if ((this.getAttribute('count-format') || 'short').toLowerCase() === 'full') return n.toLocaleString('en-US');
      if (n < 1000) return String(n);
      if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
      if (n < 1e6) return Math.round(n / 1000) + 'K';
      return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    }

    _idle() {
      this._list.replaceChildren();
      this._typing.hidden = true;
      this._ccount.textContent = '0';
      this._setState(bool(this.getAttribute('autoplay'), true) ? '' : '按 ▶ 播放開始');
    }

    _setupStart() {
      if (!bool(this.getAttribute('autoplay'), true)) return;
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
    }

    /* ---------- 公開方法 ---------- */
    play() {
      if (!this._built) return;
      if (!this._started || this._ended) { this._go(); return; }
      if (this._paused) {
        this._paused = false;
        this._box.querySelectorAll('.upo-item.was-surging').forEach((el) => el.classList.replace('was-surging', 'is-surging'));
        const q = this._resumeQ;
        this._resumeQ = [];
        q.forEach((f) => f());
        this._sync();
      }
    }

    pause() {
      if (!this._built || !this._started || this._ended) return;
      this._paused = true;
      this._box.querySelectorAll('.upo-item.is-surging').forEach((el) => el.classList.replace('is-surging', 'was-surging'));
      this._sync();
    }

    restart() {
      if (this._built) this._go();
    }

    /* ---------- 播放流程 ---------- */
    async _go() {
      const run = ++this._run;
      this._started = true;
      this._ended = false;
      this._paused = false;
      this._resumeQ = [];
      this._idle();
      this._sync();
      const A = (n, d, mn, mx) => num(this.getAttribute(n), d, mn, mx);
      try {
        await this._wait(A('start-delay', 600, 0, 60000), run);
        const items = this._items.map((src, i) => this._model(src, i));
        const early = items.filter((m) => !m.after);
        const late = items.filter((m) => m.after);
        let shown = 0;

        for (const m of early) {
          await this._appear(m, run, A);
          this._ccount.textContent = String(++shown);
        }

        await this._wait(A('surge-delay', 700, 0, 60000), run);
        await this._surge(early, run, A('surge', 3500, 300, 60000));
        await this._judge(early, run);
        this.dispatchEvent(new CustomEvent('post-surge-end', { bubbles: true }));

        if (late.length) await this._wait(A('end-delay', 900, 0, 60000), run);
        for (const m of late) {
          await this._appear(m, run, A);
          this._ccount.textContent = String(++shown);
          this._showTags(m);
        }
        this._ended = true;
        this._sync();
        this.dispatchEvent(new CustomEvent('post-end', { bubbles: true }));
      } catch (err) {
        if (err !== CANCEL) throw err;
      }
    }

    _model(src, index) {
      const likes = Math.round(num(src.getAttribute('likes'), 0, 0, 1e9));
      const best = src.hasAttribute('best');
      const examiner = src.hasAttribute('examiner');
      const after = src.hasAttribute('after') ? bool(src.getAttribute('after'), true) : examiner;
      const defStart = best ? Math.min(likes, 2) : Math.round(likes * 0.35);
      const lowAttr = src.getAttribute('low');
      let low = null;
      if (lowAttr !== null) {
        const v = lowAttr.trim().toLowerCase();
        low = ['dim', 'fold', 'keep'].includes(v) ? v : (this.getAttribute('low-style') || 'dim').toLowerCase();
      }
      return {
        src, index, likes, best, examiner, after, low,
        start: Math.round(num(src.getAttribute('start-likes'), defStart, 0, 1e9)),
        shares: src.hasAttribute('shares') ? Math.round(num(src.getAttribute('shares'), 0, 0, 1e9)) : null,
        startShares: Math.round(num(src.getAttribute('start-shares'), 0, 0, 1e9)),
        shareEl: null, curShares: 0,
        tags: (src.getAttribute('tags') || '').split(',').map((s) => s.trim()).filter(Boolean),
        el: null, heart: null, count: null, cur: 0
      };
    }

    async _appear(m, run, A) {
      const src = m.src;
      const author = src.getAttribute('author') || (m.examiner ? 'IELTS Examiner' : 'User');
      await this._wait(num(src.getAttribute('delay'), A('item-delay', 700, 0, 60000), 0, 60000), run);
      const typingMs = num(src.getAttribute('typing'), A('typing', 1100, 0, 60000), 0, 60000);
      if (typingMs > 0) {
        this._typing.replaceChildren(
          this._avatar(src.getAttribute('avatar'), src.getAttribute('avatar-color'), author),
          document.createTextNode(author + ' ' + (this.getAttribute('typing-label') || '正在輸入'))
        );
        const dots = document.createElement('span');
        dots.className = 'upo-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';
        this._typing.appendChild(dots);
        this._typing.hidden = false;
        await this._wait(typingMs, run);
        this._typing.hidden = true;
      }

      const el = document.createElement('div');
      el.className = 'upo-item' + (m.examiner ? ' is-examiner' : '');
      el.appendChild(this._avatar(src.getAttribute('avatar'), src.getAttribute('avatar-color'), author));
      const main = document.createElement('div');
      main.className = 'upo-main';
      const bubble = document.createElement('div');
      bubble.className = 'upo-bubble';
      const name = document.createElement('div');
      name.className = 'upo-name';
      name.textContent = author;
      if (m.examiner) name.appendChild(this._pill(this.getAttribute('examiner-label') || '考官', 'is-examiner'));
      const text = document.createElement('div');
      text.className = 'upo-text';
      Array.from(src.childNodes).forEach((n) => text.appendChild(n.cloneNode(true)));
      this._trim(text);
      bubble.append(name, text);
      const foot = document.createElement('div');
      foot.className = 'upo-foot';
      const time = document.createElement('span');
      time.textContent = src.getAttribute('time') || '剛剛';
      const heart = document.createElement('span');
      heart.className = 'upo-heart' + (src.hasAttribute('liked') ? ' is-on' : '');
      heart.innerHTML = SVG_HEART + '<b></b>';
      heart.title = this.getAttribute('like-label') || '讚';
      foot.append(time, heart);
      if (m.shares !== null) {
        const sh = document.createElement('span');
        sh.className = 'upo-share-item';
        sh.title = this.getAttribute('share-label') || '分享';
        sh.innerHTML = SVG_SHARE + '<b></b>';
        foot.appendChild(sh);
        m.shareEl = sh.querySelector('b');
        m.curShares = m.after ? m.shares : Math.min(m.startShares, m.shares);
        m.shareEl.textContent = this._fmt(m.curShares);
      }
      main.append(bubble, foot);
      el.appendChild(main);
      this._list.appendChild(el);
      m.el = el;
      m.main = main;
      m.name = name;
      m.bubble = bubble;
      m.heart = heart;
      m.count = heart.querySelector('b');
      m.cur = m.after ? m.likes : m.start;
      m.count.textContent = this._fmt(m.cur);
      this.dispatchEvent(new CustomEvent('post-item-show', { bubbles: true, detail: { index: m.index, author, after: m.after } }));
    }

    async _surge(items, run, dur) {
      const step = 33;
      const burst = (this.getAttribute('burst') || 'big').toLowerCase();
      items.forEach((m) => { if (m.best) m.el.classList.add('is-surging'); });
      let t = 0, frame = 0;
      while (t < dur) {
        await this._wait(step, run);
        t += step;
        frame++;
        const p = Math.min(1, t / dur);
        for (const m of items) {
          const k = m.best ? Math.pow(p, 2.6) : 1 - Math.pow(1 - p, 2);
          const v = Math.round(m.start + (m.likes - m.start) * k);
          if (v !== m.cur) { m.cur = v; m.count.textContent = this._fmt(v); }
          if (m.shareEl) {
            const sv = Math.round(m.startShares + (m.shares - m.startShares) * k);
            if (sv !== m.curShares) { m.curShares = sv; m.shareEl.textContent = this._fmt(sv); }
          }
          if (m.best && burst !== 'none') {
            const n = burst === 'small' ? (frame % 4 === 0 ? 1 : 0) : (p < 0.25 ? (frame % 2) : p < 0.6 ? 1 : 2 + (p > 0.85 ? 1 : 0));
            for (let i = 0; i < n; i++) this._heart(m.heart, burst === 'big' ? 1 : 0.5);
          }
        }
      }
      items.forEach((m) => {
        m.cur = m.likes;
        m.count.textContent = this._fmt(m.likes);
        if (m.shareEl) { m.curShares = m.shares; m.shareEl.textContent = this._fmt(m.shares); }
        m.el.classList.remove('is-surging', 'was-surging');
      });
    }

    async _judge(items, run) {
      const burst = (this.getAttribute('burst') || 'big').toLowerCase();
      const best = items.filter((m) => m.best);
      best.forEach((m) => {
        m.el.classList.add('is-best');
        m.heart.classList.add('is-on');
        m.name.appendChild(this._pill(this.getAttribute('best-label') || '最佳回答', 'is-best'));
        if (burst === 'big') for (let i = 0; i < 26; i++) this._heart(m.heart, 1.3);
        else if (burst === 'small') for (let i = 0; i < 6; i++) this._heart(m.heart, 0.6);
      });
      await this._wait(500, run);

      // 最佳回答置頂（FLIP 動畫）
      if (best.length && bool(this.getAttribute('sort'), true)) {
        const els = Array.from(this._list.children);
        const before = new Map(els.map((el) => [el, el.getBoundingClientRect().top]));
        const order = best.map((m) => m.el).concat(els.filter((el) => !best.some((m) => m.el === el)));
        order.forEach((el) => this._list.appendChild(el));
        order.forEach((el) => {
          const dy = before.get(el) - el.getBoundingClientRect().top;
          if (dy && el.animate) el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 650 / this.rate, easing: 'cubic-bezier(.3,.7,.3,1)' });
        });
        await this._wait(700, run);
      }

      // 低分留言
      items.forEach((m) => {
        if (!m.low || m.low === 'keep') return;
        if (m.low === 'dim') { m.el.classList.add('is-dim'); return; }
        const fold = document.createElement('button');
        fold.type = 'button';
        fold.className = 'upo-fold';
        fold.textContent = this.getAttribute('fold-label') || '這則留言因評價過低已被摺疊，點一下展開';
        m.main.style.display = 'none';
        m.el.classList.add('is-dim');
        m.el.appendChild(fold);
        fold.addEventListener('click', () => { fold.remove(); m.main.style.display = ''; });
      });

      // 講評標籤
      items.forEach((m) => this._showTags(m));
      if (items.some((m) => m.tags.length)) await this._wait(500, run);
    }

    _showTags(m) {
      if (!m.tags.length || m.el.querySelector('.upo-tags')) return;
      const box = document.createElement('div');
      box.className = 'upo-tags';
      m.tags.forEach((t, i) => {
        const at = t.lastIndexOf(':');
        const label = at > 0 ? t.slice(0, at).trim() : t;
        const c = at > 0 ? color(t.slice(at + 1)) : null;
        const s = document.createElement('span');
        s.className = 'upo-tag';
        s.textContent = label;
        if (c) s.style.background = c;
        s.style.animationDelay = (i * 120) + 'ms';
        box.appendChild(s);
      });
      m.bubble.appendChild(box);
    }

    /* 從愛心按鈕噴出愛心；scale 控制飛行距離與大小，不使用透明度，以縮小消失 */
    _heart(anchor, scale) {
      const r = anchor.getBoundingClientRect();
      if (!r.width) return;
      const h = document.createElement('span');
      h.className = 'ui-post-heart';
      const colors = ['#FF2E63', '#FF91D7', '#DE8EC9', '#EF6661', '#FFA987'];
      h.style.color = color(this.getAttribute('heart-color')) && Math.random() < 0.5 ? color(this.getAttribute('heart-color')) : colors[(Math.random() * colors.length) | 0];
      const size = (14 + Math.random() * 18) * (0.7 + scale * 0.5);
      h.style.width = h.style.height = size + 'px';
      h.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
      h.style.left = (r.left + 9) + 'px';
      h.style.top = (r.top + r.height / 2) + 'px';
      h.innerHTML = SVG_HEART;
      document.body.appendChild(h);
      const rise = (90 + Math.random() * 260) * scale * (scale > 1 ? 1.4 : 1);
      const drift = (Math.random() * 2 - 1) * 120 * scale;
      const rot = (Math.random() * 2 - 1) * 40;
      const dur = (900 + Math.random() * 900) / this.rate;
      const anim = h.animate([
        { transform: 'translate(0,0) scale(.2) rotate(0deg)' },
        { transform: `translate(${drift * 0.4}px,${-rise * 0.45}px) scale(1.15) rotate(${rot * 0.5}deg)`, offset: 0.35 },
        { transform: `translate(${drift}px,${-rise}px) scale(0) rotate(${rot}deg)` }
      ], { duration: dur, easing: 'cubic-bezier(.2,.7,.4,1)' });
      anim.onfinish = () => h.remove();
      setTimeout(() => h.remove(), dur + 500);
    }

    /* ---------- 計時：受倍率、暫停、重播影響 ---------- */
    _wait(ms, run) {
      return new Promise((resolve, reject) => {
        const go = () => {
          if (run !== this._run) { reject(CANCEL); return; }
          if (this._paused) { this._resumeQ.push(go); return; }
          if (ms <= 0) { resolve(); return; }
          setTimeout(() => {
            if (run !== this._run) { reject(CANCEL); return; }
            if (this._paused) {
              this._resumeQ.push(() => { if (run !== this._run) reject(CANCEL); else resolve(); });
              return;
            }
            resolve();
          }, ms / this.rate);
        };
        go();
      });
    }

    _setState(t) { if (this._stateEl) this._stateEl.textContent = t; }

    _sync() {
      if (!this._btnPlay) return;
      const playing = this._started && !this._ended && !this._paused;
      this._btnPlay.textContent = playing ? '❚❚ 暫停' : '▶ 播放';
      this._btnRestart.disabled = !this._started;
      this._rateBtns.forEach((b, i) => b.classList.toggle('is-on', RATES[i] === this.rate));
      if (this._ended) this._setState('播放完畢');
      else if (this._paused) this._setState('已暫停');
      else if (this._started) this._setState('');
    }
  }

  customElements.define('ui-post', UiPost);
  window.UiPost = UiPost;
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
