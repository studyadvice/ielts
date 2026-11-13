/* =========================================================================
 * <link-when> 元件串接：A 播完（或發生某事件）時，對 B 執行動作
 *
 * <link-when source="#a" event="done" target="#b" do="play"
 *            exit="fade" exit-speed="400" exit-gap="0" in-place></link-when>
 *
 * 流程：A 觸發事件 → delay → A 退場（exit）→ exit-gap → B 移到 A 的位置（in-place）
 *       → B 顯示（enter）→ 對 B 執行 do
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
    'ui-check': 'ui-check-done',
    'ui-icon-anim': 'anim-end',
    'ui-fillin': 'fillin-submit',
    'ui-mask': 'mask-reveal',
    'sentence-build': 'sb:complete',
    'ui-steps': 'steps:end',
    'chunk-demo': 'chunk-end',
    'ui-timeline': 'timeline-end'
  };
  const doneEventOf = (el) => {
    const tag = el.localName;
    if (tag === 'ui-blank') return el.getAttribute('mode') === 'cli' ? 'cli-end' : 'blank-submit';
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

  /* ---------- A 退場 ---------- */
  async function exitSource(a, mode, ms) {
    if (mode === 'none' || !a.isConnected) return;
    if (mode === 'fade') {
      await animate(a, [{ opacity: 1 }, { opacity: 0 }], ms, { fill: 'forwards' });
      a.hidden = true;
      a.style.display = 'none';
      a.getAnimations().forEach((x) => x.cancel());
      return;
    }
    if (mode === 'collapse') {
      const h = a.offsetHeight;
      a.style.overflow = 'hidden';
      await animate(a, [{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], ms, { fill: 'forwards' });
      a.hidden = true;
      a.style.display = 'none';
      a.style.overflow = '';
      a.getAnimations().forEach((x) => x.cancel());
      return;
    }
    if (mode === 'hide') { a.hidden = true; a.style.display = 'none'; return; }
    if (mode === 'remove') a.remove();
  }

  /* ---------- B 顯示 ---------- */
  async function showTarget(b, effect, ms) {
    if (!isHidden(b)) return;
    b.hidden = false;
    if (b.style.display === 'none') b.style.display = '';
    if (getComputedStyle(b).display === 'none') b.style.display = 'block';
    if (effect !== 'none') await animate(b, frames(effect), ms);
  }

  /* ---------- 對 B 執行動作 ---------- */
  async function runAction(b, action) {
    if (!action || action === 'show') return;
    if (action === 'hide') { b.hidden = true; b.style.display = 'none'; return; }
    if (action === 'scroll') { b.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (b.localName.indexOf('-') !== -1 && !customElements.get(b.localName)) {
      await Promise.race([customElements.whenDefined(b.localName), wait(3000)]);
    }
    const fn = b[action];
    if (typeof fn === 'function') {
      fn.call(b);
    } else {
      console.warn(`[link-when] ${b.localName}${b.id ? '#' + b.id : ''} 沒有 ${action}() 方法。`);
    }
  }

  class LinkWhen extends HTMLElement {
    connectedCallback() {
      if (this._bound) return;
      const go = () => this._bind();
      document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', go, { once: true })
        : setTimeout(go, 0);
    }

    disconnectedCallback() { this._unbind(); }

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
      if (ev === 'done') {
        ev = doneEventOf(a);
        if (!ev) { console.warn(`[link-when] ${a.localName} 沒有對應的完成事件，請在 event 寫出事件名稱。`); return; }
      }
      /* 有些元件的樣式會蓋過 hidden 屬性，這裡補上 display:none，確保 B 真的先藏起來 */
      const b = this._find('target');
      if (b && b.hasAttribute('hidden')) b.style.display = 'none';
      this._a = a;
      this._ev = ev;
      this._handler = () => this._fire();
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

    async _fire() {
      if (this._running) return;
      const once = (this.getAttribute('once') || 'true').trim().toLowerCase() !== 'false';
      if (once && this._fired) return;
      this._fired = true;
      this._running = true;

      const a = this._a;
      const b = this._find('target');
      const action = (this.getAttribute('do') || 'play').trim();
      const exit = (this.getAttribute('exit') || 'none').trim().toLowerCase();
      const exitMs = num(this.getAttribute('exit-speed'), 400);
      const enter = (this.getAttribute('enter') || 'fade').trim().toLowerCase();
      const enterMs = num(this.getAttribute('enter-speed'), 500);
      const inPlace = this.hasAttribute('in-place') && this.getAttribute('in-place') !== 'false';

      /* 記住 A 的位置，A 被刪除後 B 仍能放回原處 */
      const anchorParent = a && a.parentNode;
      const anchorNext = a && a.nextSibling;

      this.dispatchEvent(new CustomEvent('link-when:start', { bubbles: true, detail: { source: a, target: b } }));
      await wait(num(this.getAttribute('delay'), 0));
      if (a) await exitSource(a, exit, exitMs);
      await wait(num(this.getAttribute('exit-gap'), 0));

      if (b) {
        if (inPlace && anchorParent) {
          if (a && a.isConnected && a.parentNode === anchorParent) anchorParent.insertBefore(b, a);
          else if (anchorNext && anchorNext.parentNode === anchorParent) anchorParent.insertBefore(b, anchorNext);
          else anchorParent.appendChild(b);
        }
        if (action !== 'hide') await showTarget(b, enter, enterMs);
        await runAction(b, action);
      } else {
        console.warn(`[link-when] 找不到 target「${this.getAttribute('target')}」。`);
      }

      this._running = false;
      this.dispatchEvent(new CustomEvent('link-when:done', { bubbles: true, detail: { source: a, target: b } }));
      if (!once) this._fired = false;
    }
  }

  customElements.define('link-when', LinkWhen);
  window.LinkWhen = { doneEvents: DONE_EVENTS };
})();
