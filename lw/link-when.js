/* =========================================================================
 * <link-when> 元件串接：A 播完（或發生某事件）時，對 B 執行動作
 *
 * <link-when source="#a" event="done" target="#b" do="play" detail-match="index:3"
 *            exit="fade" exit-speed="400" exit-gap="0" in-place></link-when>
 *
 * 流程：A 觸發事件 → delay → A 退場（exit）→ exit-gap → B 移到 A 的位置（in-place）
 *       → B 顯示（enter）→ 對 B 執行 do
 * do="feed"：把 A 事件 detail 裡的輸入內容（md-editor 的 md-submit、ui-blank 的 blank-submit 等）
 *   送進 B：B 是 ui-post(live) 或 ui-stream 就呼叫 add()；寫了 template="#id" 就把內容代入該 template，填進 B 容器。
 * 本身不顯示任何畫面。不支援 ui-table 與 info-region。
 * ========================================================================= */
(function () {
  'use strict';
  if (customElements.get('link-when')) return;

  /* event="done" 對照表：標籤名稱 → 該元件的「完成」事件 */
  const DONE_EVENTS = {
    'ui-play': 'play-end',
    'ui-stream': 'ui-stream:done',
    'ui-detail-ladder': 'ladder-end',
    'bp-stepper': 'bps:complete',
    'arrow-flow': 'flow-complete',
    'slider-show': 'finished',
    'ui-layer-diff': 'layerend',
    'dino-deck': 'dino:done',
    'ui-drag-ans': 'drag-ans:complete',
    'ui-post': 'post-end',
    'ui-screen': 'ui-screen:end',
    'maze-quiz': 'maze-solved',
    'tetris-quiz': 'tetris-cleared',
    'md-editor': 'md-submit',
    'ui-check': 'ui-check-done',
    'ui-icon-anim': 'anim-end',
    'ui-fillin': 'fillin-submit',
    'ui-mask': 'mask-reveal',
    'sentence-build': 'sb:complete',
    'ui-steps': 'steps:end',
    'chunk-demo': 'chunk-end',
    'ui-timeline': 'timeline-end',
    'route-map': 'route-map:train-end'
  };
  /* event="done" 的附加條件：route-map 的 train-end 在火車被 stop() 中斷時也會發出，所以只有 completed 為 true（跑完）才算 done */
  const DONE_DETAIL = { 'route-map': { completed: 'true' } };
  const doneEventOf = (el) => {
    const tag = el.localName;
    if (tag === 'ui-blank') return el.getAttribute('mode') === 'cli' ? 'cli-end' : 'blank-submit';
    /* maze-quiz 有 show-template 時，done 等 template 內容顯示後（template-shown）才算，否則是路徑抵達出口（maze-solved） */
    if (tag === 'maze-quiz') return el.hasAttribute('show-template') ? 'template-shown' : 'maze-solved';
    /* tetris-quiz 同理：有 show-template 時等 template 內容顯示後（template-shown），否則是棋盤完全消除（tetris-cleared） */
    if (tag === 'tetris-quiz') return el.hasAttribute('show-template') ? 'template-shown' : 'tetris-cleared';
    return DONE_EVENTS[tag] || null;
  };

  const STYLE_ID = 'link-when-style';
  if (!document.getElementById(STYLE_ID) && document.head) {
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = 'link-when{display:none !important}';
    document.head.appendChild(st);
  }

  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const wait = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms)));

  const isHidden = (el) => el.hidden || el.style.display === 'none' || getComputedStyle(el).display === 'none';

  /* 進場與退場的關鍵影格，與 ui-play 的 show-fx 一致 */
  function frames(effect) {
    switch (effect) {
      case 'slide-up': return [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }];
      case 'slide-down': return [{ opacity: 0, transform: 'translateY(-24px)' }, { opacity: 1, transform: 'none' }];
      case 'zoom': return [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }];
      case 'swap-zoom': return [{ transform: 'scale(0)' }, { transform: 'scale(1)' }];
      case 'swap-flip': return [
        { transform: 'perspective(900px) rotateY(-90deg)' },
        { transform: 'perspective(900px) rotateY(0deg)' }
      ];
      case 'pop': return [
        { opacity: 0, transform: 'scale(.3)', easing: 'cubic-bezier(.2,.8,.3,1)' },
        { opacity: 1, transform: 'scale(1.12)', offset: 0.55 },
        { opacity: 1, transform: 'none' }
      ];
      default: return [
        { opacity: 0, transform: 'translateY(10px)', filter: 'blur(6px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0px)' }
      ];
    }
  }

  function animate(el, kf, ms, opts) {
    if (!el.animate || ms <= 0) return Promise.resolve();
    const own = kf.some((k) => k.easing);
    const a = el.animate(kf, Object.assign({ duration: ms, easing: own ? 'linear' : 'ease-out', fill: 'none' }, opts || {}));
    return a.finished.catch(() => {});
  }

  /* ---------- 倒數覆蓋層 ---------- */
  const PALETTE = {
    background: '#0C0D0C', 'bg-alternative': '#3B2A20', shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322',
    pink: '#FF91D7', red: '#EF6661', green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1', violet: '#B484E8',
    gray: '#86877F', key: '#51DBCF', calm: '#A3C4BC', quiet: '#8EA4DE', playful: '#FFA987', urgent: '#FF2E63',
    energetic: '#B6FF00', dreamy: '#C394CD', salmon: '#FFC88A'
  };
  const color = (v, d) => {
    const t = (v || '').trim();
    if (!t) return d;
    return PALETTE[t.toLowerCase()] || t;
  };

  /* 覆蓋層：固定在 A 的範圍上（每格更新位置，A 捲動或縮放都跟得上），中央是圓圈包著的數字 */
  async function countdown(host, a, n, o) {
    const el = document.createElement('div');
    el.className = 'lw-countdown';
    el.style.cssText = `position:absolute;z-index:9000;display:flex;align-items:center;justify-content:center;pointer-events:none;background:${o.cover}`;
    const ring = document.createElement('div');
    ring.style.cssText = `box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:50%;` +
      `border:${o.width}px solid ${o.color};background:${o.bg};color:${o.color};font-weight:800;line-height:1;` +
      `font-family:"Segoe UI","Noto Sans TC",system-ui,sans-serif;font-variant-numeric:tabular-nums`;
    el.appendChild(ring);
    document.body.appendChild(el);
    let raf = 0, frozen = false;
    const place = () => {
      const r = a.getBoundingClientRect();
      el.style.left = (r.left + window.scrollX) + 'px';
      el.style.top = (r.top + window.scrollY) + 'px';
      el.style.width = r.width + 'px';
      el.style.height = r.height + 'px';
      const size = Math.max(40, Math.min(o.size, Math.min(r.width, r.height) - 16));
      ring.style.width = ring.style.height = size + 'px';
      ring.style.fontSize = (o.fontSize || (size * 0.5) / 16) + 'rem';
    };
    const loop = () => { if (frozen || !el.isConnected) return; place(); raf = requestAnimationFrame(loop); };
    loop();
    const cd = {
      el,
      freeze() { frozen = true; cancelAnimationFrame(raf); },
      remove() { cd.freeze(); el.remove(); }
    };
    host._cover = cd;
    for (let i = n; i >= 1; i--) {
      ring.textContent = String(i);
      ring.animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
        { duration: Math.min(350, o.interval), easing: 'cubic-bezier(.2,.8,.3,1)' });
      host.dispatchEvent(new CustomEvent('link-when:countdown', { bubbles: true, detail: { value: i, source: a } }));
      await wait(o.interval);
    }
    return cd;
  }

  /* ---------- A 退場 ---------- */
  async function exitSource(a, mode, ms, cover) {
    if (mode === 'none' || !a.isConnected) { if (cover) cover.remove(); return; }
    if (mode === 'fade') {
      if (cover) cover.freeze();
      const kf = [{ opacity: 1 }, { opacity: 0 }];
      await Promise.all([animate(a, kf, ms, { fill: 'forwards' }), cover ? animate(cover.el, kf, ms, { fill: 'forwards' }) : null]);
      a.hidden = true;
      a.style.display = 'none';
      a.getAnimations().forEach((x) => x.cancel());
      if (cover) cover.remove();
      return;
    }
    if (mode === 'collapse') {
      if (cover) cover.freeze();
      const h = a.offsetHeight;
      a.style.overflow = 'hidden';
      const kf = [{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }];
      if (cover) cover.el.style.overflow = 'hidden';
      await Promise.all([animate(a, kf, ms, { fill: 'forwards' }), cover ? animate(cover.el, kf, ms, { fill: 'forwards' }) : null]);
      a.hidden = true;
      a.style.display = 'none';
      a.style.overflow = '';
      a.getAnimations().forEach((x) => x.cancel());
      if (cover) cover.remove();
      return;
    }
    if (cover) cover.remove();
    if (mode === 'hide') { a.hidden = true; a.style.display = 'none'; return; }
    if (mode === 'remove') a.remove();
  }

  /* ---------- swap：A 縮小或翻走並刪除，B 在原位登場 ---------- */
  // 量 B 顯示時的高度（B 先藏著，暫時放到畫面外量完再還原）。
  function measureHeight(b, width) {
    const saved = b.getAttribute('style');
    const wasHidden = b.hidden;
    b.hidden = false;
    b.style.cssText = (saved ? saved + ';' : '') + `display:block;position:absolute;visibility:hidden;left:-99999px;top:0;width:${width}px`;
    const h = b.getBoundingClientRect().height;
    if (saved === null) b.removeAttribute('style'); else b.setAttribute('style', saved);
    b.hidden = wasHidden;
    return h;
  }

  // A（和倒數覆蓋層）同時縮小或翻走，高度也一路變成 B 的高度，結束後 A 被刪除、B 接手，版面不會跳動。
  async function swapOut(a, b, cover, effect, ms) {
    if (getComputedStyle(a).display === 'inline') a.style.display = 'block';
    const r = a.getBoundingClientRect();
    const hB = b ? measureHeight(b, r.width) : r.height;
    a.style.boxSizing = 'border-box';
    a.style.overflow = 'hidden';
    if (cover) { cover.freeze(); cover.el.style.boxSizing = 'border-box'; cover.el.style.overflow = 'hidden'; }
    const kf = effect === 'flip'
      ? [{ transform: 'perspective(900px) rotateY(0deg)', height: r.height + 'px' }, { transform: 'perspective(900px) rotateY(90deg)', height: hB + 'px' }]
      : [{ transform: 'scale(1)', height: r.height + 'px' }, { transform: 'scale(0)', height: hB + 'px' }];
    const opts = { duration: ms, easing: 'ease-in', fill: 'forwards' };
    const list = [a.animate(kf, opts)];
    if (cover) list.push(cover.el.animate(kf, opts));
    await Promise.all(list.map((x) => x.finished.catch(() => {})));
  }

  /* ---------- B 顯示 ---------- */
  async function showTarget(b, effect, ms) {
    if (!isHidden(b)) return;
    b.hidden = false;
    if (b.style.display === 'none') b.style.display = '';
    if (getComputedStyle(b).display === 'none') b.style.display = 'block';
    if (effect !== 'none') await animate(b, frames(effect), ms);
  }

  /* ---------- feed：把輸入內容送進 B ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // 事件 detail 轉成統一的四個欄位。md-editor 給 markdown/html/text/name；ui-blank、ui-otp 只有 value，html 由純文字跳脫產生。
  function feedParts(d) {
    d = d || {};
    const markdown = String(d.markdown != null ? d.markdown : d.value != null ? d.value : d.text != null ? d.text : '');
    const text = String(d.text != null ? d.text : markdown);
    const html = d.html != null ? String(d.html) : esc(text).replace(/\n/g, '<br>');
    return { markdown, text, html, name: d.name != null ? String(d.name) : '' };
  }

  // 手動 fire() 沒有事件時，直接向 A 取目前的內容
  function sourceDetail(a) {
    if (!a) return {};
    const value = a.value != null ? a.value : '';
    return { value, markdown: value, html: a.html, text: a.text, name: a.getAttribute ? a.getAttribute('name') || '' : '' };
  }

  function feed(b, lw, detail) {
    const p = feedParts(detail);
    const sel = (lw.getAttribute('template') || '').trim();
    if (sel) {
      let t = null;
      try { t = document.querySelector(sel); } catch (e) { /* 選擇器錯誤 */ }
      if (!t || t.localName !== 'template') { console.warn(`[link-when] template「${sel}」不是 <template>。`); return; }
      // {html} 是轉好的 HTML，其餘一律跳脫成純文字，所以可以放在屬性裡（例如 text="{text}"）
      const src = t.innerHTML.replace(/\{(html|text|markdown|value|name)\}/g, (m, k) =>
        k === 'html' ? p.html : esc(k === 'text' ? p.text : k === 'name' ? p.name : p.markdown));
      const holder = document.createElement('template');
      holder.innerHTML = src;
      if ((lw.getAttribute('feed-mode') || 'replace').trim().toLowerCase() !== 'append') b.replaceChildren();
      b.appendChild(holder.content);
      return;
    }
    if (typeof b.add !== 'function') {
      console.warn(`[link-when] ${b.localName}${b.id ? '#' + b.id : ''} 沒有 add() 方法，要填進容器請加 template="#id"。`);
      return;
    }
    if (b.localName === 'ui-post' && b.live === false) {
      console.warn('[link-when] ui-post 需要 mode="live" 才能即時加入留言。');
    }
    let extra = {};
    const raw = lw.getAttribute('item');
    if (raw) { try { extra = JSON.parse(raw); } catch (e) { console.warn('[link-when] item 不是合法的 JSON，已忽略。'); } }
    const as = (lw.getAttribute('feed-as') || 'html').trim().toLowerCase();
    const body = as === 'text' ? { text: p.text } : as === 'markdown' ? { text: p.markdown } : { html: p.html };
    let item;
    if (b.localName === 'ui-post') item = Object.assign({ author: p.name || '我' }, body, extra);
    else if (b.localName === 'ui-stream') item = Object.assign({ from: 'student' }, p.name ? { name: p.name } : {}, body, extra);
    else item = Object.assign({}, body, extra);
    b.add(item);
  }

  /* ---------- 對 B 執行動作 ---------- */
  async function runAction(b, action, ctx) {
    if (!action || action === 'show') return;
    if (action === 'hide') { b.hidden = true; b.style.display = 'none'; return; }
    if (action === 'scroll') { b.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (b.localName.indexOf('-') !== -1 && !customElements.get(b.localName)) {
      await Promise.race([customElements.whenDefined(b.localName), wait(3000)]);
    }
    if (action === 'feed') { feed(b, ctx.lw, ctx.detail); return; }
    const fn = b[action];
    if (typeof fn === 'function') {
      fn.call(b);
    } else {
      console.warn(`[link-when] ${b.localName}${b.id ? '#' + b.id : ''} 沒有 ${action}() 方法。`);
    }
  }

  /* call="BpPopnote.fold" call-arg="true"：呼叫全域函式，B 當第一個參數，call-arg 為第二個參數 */
  function runCall(b, path, rawArg) {
    const fn = path.split('.').reduce((o, k) => (o == null ? o : o[k]), window);
    if (typeof fn !== 'function') { console.warn(`[link-when] 找不到全域函式 ${path}。`); return; }
    const t = rawArg == null ? null : String(rawArg).trim();
    let arg;
    if (t === 'true') arg = true;
    else if (t === 'false') arg = false;
    else if (t !== null && t !== '' && Number.isFinite(Number(t))) arg = Number(t);
    else if (t !== null && t !== '') arg = t;
    const ctx = path.indexOf('.') === -1 ? window : path.split('.').slice(0, -1).reduce((o, k) => o[k], window);
    fn.call(ctx, b, arg);
  }

  class LinkWhen extends HTMLElement {
    connectedCallback() {
      if (this._bound) return;
      const go = () => this._bind();
      document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', go, { once: true })
        : setTimeout(go, 0);
    }

    disconnectedCallback() {
      this._unbind();
      if (this._cover) { this._cover.remove(); this._cover = null; }
    }

    _find(attr) {
      const sel = (this.getAttribute(attr) || '').trim();
      if (!sel) return null;
      try { return document.querySelector(sel); } catch (e) { return null; }
    }

    _bind() {
      if (this._bound || !this.isConnected) return;
      const a = this._find('source');
      if (!a) { console.warn(`[link-when] 找不到 source「${this.getAttribute('source')}」。`); return; }
      let ev = (this.getAttribute('event') || 'done').trim();
      const viaDone = ev === 'done';
      if (viaDone) {
        ev = doneEventOf(a);
        if (!ev) { console.warn(`[link-when] ${a.localName} 沒有對應的完成事件，請在 event 寫出事件名稱。`); return; }
      }
      /* 有些元件的樣式會蓋過 hidden 屬性，這裡補上 display:none，確保 B 真的先藏起來 */
      const b = this._find('target');
      if (b && b.hasAttribute('hidden')) b.style.display = 'none';
      this._a = a;
      this._ev = ev;
      /* detail-match="index:3, role:system"：事件的 detail 符合全部條件才觸發 */
      const conds = (this.getAttribute('detail-match') || '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => {
        const i = x.indexOf(':');
        return i < 0 ? null : [x.slice(0, i).trim(), x.slice(i + 1).trim()];
      }).filter(Boolean);
      if (viaDone && DONE_DETAIL[a.localName]) Object.keys(DONE_DETAIL[a.localName]).forEach((k) => conds.push([k, DONE_DETAIL[a.localName][k]]));
      this._handler = (e) => {
        if (conds.length) {
          const d = (e && e.detail) || {};
          if (!conds.every(([k, v]) => d[k] !== undefined && String(d[k]) === v)) return;
        }
        this._fire(e);
      };
      a.addEventListener(ev, this._handler);
      this._bound = true;
    }

    _unbind() {
      if (this._a && this._handler) this._a.removeEventListener(this._ev, this._handler);
      this._bound = false;
      this._a = null;
    }

    /* 手動觸發，與事件發生時相同 */
    fire() { return this._fire(); }

    _fire(ev) {
      const call = (this.getAttribute('call') || '').trim();
      const action = call ? 'show' : (this.getAttribute('do') || 'play').trim();
      if (action !== 'feed') return this._go(ev, call, action);
      /* feed 每次送出都要處理（once 預設 false）；連續送出時排隊，依送出順序一個一個填，後送出的不會被先送出的蓋掉 */
      this._chain = (this._chain || Promise.resolve()).catch(() => {}).then(() => this._go(ev, call, action));
      return this._chain;
    }

    async _go(ev, call, action) {
      const isFeed = action === 'feed';
      if (this._running && !isFeed) return;
      const once = (this.getAttribute('once') || (isFeed ? 'false' : 'true')).trim().toLowerCase() !== 'false';
      if (once && this._fired) return;
      this._fired = true;
      if (!isFeed) this._running = true;

      const a = this._a;
      const b = this._find('target');
      const detail = isFeed ? ((ev && ev.detail && typeof ev.detail === 'object') ? ev.detail : sourceDetail(a)) : null;
      const exit = (this.getAttribute('exit') || 'none').trim().toLowerCase();
      const exitMs = num(this.getAttribute('exit-speed'), 400);
      const enter = (this.getAttribute('enter') || 'fade').trim().toLowerCase();
      const enterMs = num(this.getAttribute('enter-speed'), 500);
      const swapRaw = this.getAttribute('swap');
      let swap = swapRaw === null ? '' : (swapRaw.trim().toLowerCase() || 'zoom');
      if (swap && swap !== 'zoom' && swap !== 'flip') {
        console.warn(`[link-when] swap="${swapRaw}" 只支援 zoom、flip，已改用 zoom。`);
        swap = 'zoom';
      }
      const swapMs = num(this.getAttribute('swap-speed'), 800);
      /* swap 一律讓 B 回到 A 原本的位置；in-place="false" 可關閉 */
      const inPlace = swap
        ? this.getAttribute('in-place') !== 'false'
        : this.hasAttribute('in-place') && this.getAttribute('in-place') !== 'false';
      const cdN = parseInt(this.getAttribute('countdown'), 10);

      /* 記住 A 的位置，A 被刪除後 B 仍能放回原處 */
      const anchorParent = a && a.parentNode;
      const anchorNext = a && a.nextSibling;

      this.dispatchEvent(new CustomEvent('link-when:start', { bubbles: true, detail: { source: a, target: b } }));
      await wait(num(this.getAttribute('delay'), 0));

      /* 倒數：圓圈數字蓋住整個 A，數完才退場 */
      let cover = null;
      if (a && a.isConnected && cdN > 0) {
        cover = await countdown(this, a, cdN, {
          interval: num(this.getAttribute('countdown-interval'), 1000),
          size: num(this.getAttribute('countdown-size'), 120),
          width: num(this.getAttribute('countdown-width'), 6),
          color: color(this.getAttribute('countdown-color'), PALETTE.key),
          bg: color(this.getAttribute('countdown-bg'), PALETTE.background),
          cover: color(this.getAttribute('countdown-cover'), PALETTE.background),
          fontSize: num(this.getAttribute('countdown-font-size'), 0)
        });
      }

      const place = () => {
        if (inPlace && anchorParent) {
          if (a && a.isConnected && a.parentNode === anchorParent) anchorParent.insertBefore(b, a);
          else if (anchorNext && anchorNext.parentNode === anchorParent) anchorParent.insertBefore(b, anchorNext);
          else anchorParent.appendChild(b);
        }
      };

      if (swap && a && a.isConnected) {
        await swapOut(a, b, cover, swap, swapMs / 2);
        /* 同一格內換手：B 先就位，再刪除 A 與覆蓋層，最後 B 登場 */
        if (b) place();
        a.remove();
        if (cover) cover.remove();
        this._cover = null;
        if (b && action !== 'hide') await showTarget(b, 'swap-' + swap, swapMs / 2);
      } else {
        if (a) await exitSource(a, exit, exitMs, cover);
        this._cover = null;
        await wait(num(this.getAttribute('exit-gap'), 0));
      }

      if (b) {
        if (!swap) place();
        if (!swap && action !== 'hide') await showTarget(b, enter, enterMs);
        if (call) runCall(b, call, this.getAttribute('call-arg'));
        else await runAction(b, action, { lw: this, detail });
      } else {
        console.warn(`[link-when] 找不到 target「${this.getAttribute('target')}」。`);
      }

      if (!isFeed) this._running = false;
      this.dispatchEvent(new CustomEvent('link-when:done', { bubbles: true, detail: { source: a, target: b } }));
      if (!once) this._fired = false;
    }
  }

  customElements.define('link-when', LinkWhen);
  window.LinkWhen = { doneEvents: DONE_EVENTS, doneDetail: DONE_DETAIL };
})();
