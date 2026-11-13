/* =========================================================================
 * <ui-timeline> 圓點時間軸
 *
 * <ui-timeline heading="最新更新紀錄" theme="arc" play-mode="reveal" autoplay="visible"
 *              interval="800" more-text="查看全部紀錄" more-target="#all-log">
 *   <tl-item sub-heading="2 小時前">ui-play 新增<c-key>小畫家外框</c-key></tl-item>
 *   <tl-item sub-heading="5 小時前" color="pink">內容可寫任何 HTML</tl-item>
 * </ui-timeline>
 * <template id="all-log"> ……點擊後才出現的內容…… </template>
 *
 * 主題：arc（預設）、cool、warm、ember、ocean、forest、dusk、aurora、mono
 * 形狀：dot-shape（circle、square、rounded、diamond、ring、ring-square、triangle、hexagon、star、number、icon），
 *       單項可用 shape、dot-text、icon 覆寫
 * 播放：play-mode="reveal"（逐一出現）或 "highlight"（逐一點亮）
 * 事件：timeline-end（播完）、timeline-more（展開或收合，detail.open）
 * 方法：el.play()、el.stop()、el.toggleMore(open)
 * ========================================================================= */
(function () {
  'use strict';
  if (window.customElements.get('ui-timeline')) return;

  const PALETTE = {
    background: '#0C0D0C', base: '#0C0D0C', bg: '#0C0D0C', 'bg-alternative': '#3B2A20',
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7', red: '#EF6661',
    green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1', violet: '#B484E8', gray: '#86877F',
    key: '#51DBCF', calm: '#A3C4BC', quiet: '#8EA4DE', playful: '#FFA987', urgent: '#FF2E63',
    energetic: '#B6FF00', dreamy: '#DE8EC9'
  };
  const color = (v) => { if (!v) return ''; const t = String(v).trim(); return PALETTE[t.toLowerCase()] || t; };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const px = (v) => (/^-?\d*\.?\d+$/.test(String(v).trim()) ? v + 'px' : v);
  const rem = (v) => (/^\d*\.?\d+$/.test(String(v).trim()) ? v + 'rem' : v);

  /* 主題：cycle 為固定色循環，ramp 為依項目數重新計算的漸層 */
  const BASE_UI = { bg: '#0C0D0C', line: '#3B2A20', heading: '#DBEDD8', sub: '#86877F', text: '#C6C7BD', more: '#86877F' };
  const THEMES = {
    arc: Object.assign({ cycle: ['#51DBCF', '#5DBAE8', '#8EA4DE', '#778CE1', '#B484E8', '#DE8EC9', '#FF91D7', '#FFA987'] }, BASE_UI),
    cool: Object.assign({ cycle: ['#B6FF00', '#71CD76', '#51DBCF', '#A3C4BC', '#5DBAE8', '#8EA4DE', '#778CE1', '#B484E8'] }, BASE_UI),
    warm: Object.assign({ cycle: ['#E3D322', '#FFA987', '#EF6661', '#FF2E63', '#FF91D7', '#DE8EC9', '#B484E8', '#778CE1'] }, BASE_UI),
    ember: { ramp: ['#FFD27A', '#DD7350', '#5A2C40'], bg: '#121014', line: '#2A2228', heading: '#F5EFE4', sub: '#8C8478', text: '#EDE6DA', more: '#8C8478' },
    ocean: { ramp: ['#A8F0E6', '#3FA7C9', '#1F4E79'], bg: '#0A1116', line: '#1C2A33', heading: '#E4F4F7', sub: '#7C939C', text: '#CFE3E8', more: '#7C939C' },
    forest: { ramp: ['#D8F28A', '#6DBE6A', '#2D5E3E'], bg: '#0D120E', line: '#1F2A21', heading: '#E9F2E1', sub: '#87947F', text: '#D3DFCB', more: '#87947F' },
    dusk: { ramp: ['#FFC6A8', '#E07AA8', '#5B3F8C'], bg: '#110E16', line: '#262033', heading: '#F2E8F2', sub: '#928AA0', text: '#E0D6E6', more: '#928AA0' },
    aurora: { ramp: ['#7CF5B0', '#4CC9F0', '#9B7BF2', '#F27BD8'], bg: '#0B0D14', line: '#1E2233', heading: '#E8ECF7', sub: '#858BA0', text: '#D3D8E8', more: '#858BA0' },
    mono: { ramp: ['#F2F2EE', '#5E5F5A'], bg: '#0F0F0E', line: '#2A2A28', heading: '#F2F2EE', sub: '#86877F', text: '#C6C7BD', more: '#86877F' }
  };

  const hex2rgb = (h) => { const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(h); return m ? [1, 2, 3].map((i) => parseInt(m[i], 16)) : [128, 128, 128]; };
  const rgb2hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  function ramp(stops, n) {
    if (n <= 1) return [stops[0]];
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1) * (stops.length - 1);
      const k = Math.min(stops.length - 2, Math.floor(t));
      const f = t - k;
      const a = hex2rgb(stops[k]), b = hex2rgb(stops[k + 1]);
      out.push(rgb2hex(a.map((v, j) => v + (b[j] - v) * f)));
    }
    return out;
  }

  function frames(effect) {
    if (effect === 'slide-up') return [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }];
    if (effect === 'slide-left') return [{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }];
    if (effect === 'none') return [{ opacity: 1 }, { opacity: 1 }];
    return [{ opacity: 0 }, { opacity: 1 }];
  }

  const CSS = `
ui-timeline{display:block;box-sizing:border-box;width:var(--tl-w,100%);padding:var(--tl-pad);background:var(--tl-bg);border-radius:var(--tl-radius);
  color:var(--tl-text);font-size:var(--tl-fs);line-height:1.5;}
ui-timeline .tlx-head{margin:0 0 16px 0;color:var(--tl-heading);font-size:var(--tl-hfs);font-weight:600;line-height:1.4;}
ui-timeline tl-item{display:block;position:relative;padding:0 0 var(--tl-gap) calc(var(--tl-dot) + 18px);cursor:inherit;
  transition:color .3s;}
ui-timeline tl-item::before{content:attr(sub-heading);display:block;color:var(--tl-sub);font-size:.875em;line-height:1.5;transition:color .3s;}
ui-timeline tl-item:not([sub-heading])::before{display:none;}
ui-timeline tl-item{--dc:var(--dot);--tf:translate(0,0);}
ui-timeline tl-item::after{content:'';position:absolute;left:0;top:var(--tl-dot-top);box-sizing:border-box;width:var(--tl-dot);height:var(--tl-dot);border-radius:50%;
  background:var(--dc);border:0 solid var(--dc);transform:var(--tf);transition:background .3s,border-color .3s,transform .3s,box-shadow .3s;}
ui-timeline tl-item[data-shape="square"]::after{border-radius:2px;}
ui-timeline tl-item[data-shape="rounded"]::after{border-radius:30%;}
ui-timeline tl-item[data-shape="diamond"]{--tf:rotate(45deg) scale(.82);}
ui-timeline tl-item[data-shape="diamond"]::after{border-radius:2px;}
ui-timeline tl-item[data-shape="ring"]::after,ui-timeline tl-item[data-shape="ring-square"]::after{background:var(--tl-ring-bg);border-width:var(--tl-ring);}
ui-timeline tl-item[data-shape="ring-square"]::after{border-radius:2px;}
ui-timeline tl-item[data-shape="triangle"]{--tf:scale(1.2);}
ui-timeline tl-item[data-shape="star"]{--tf:scale(1.4);}
ui-timeline tl-item[data-shape="triangle"]::after{border-radius:0;clip-path:polygon(50% 4%,100% 92%,0 92%);}
ui-timeline tl-item[data-shape="hexagon"]::after{border-radius:0;clip-path:polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0 50%);}
ui-timeline tl-item[data-shape="star"]::after{border-radius:0;clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);}
ui-timeline tl-item[data-shape="number"]::after{content:attr(data-num);display:flex;align-items:center;justify-content:center;color:var(--tl-num-text);
  font-size:calc(var(--tl-dot) * .55);font-weight:700;line-height:1;font-family:system-ui,"Segoe UI",sans-serif;}
ui-timeline tl-item[data-shape="icon"]::after{display:none;}
ui-timeline .tlx-ic{position:absolute;left:0;top:var(--tl-dot-top);width:var(--tl-dot);height:var(--tl-dot);display:flex;align-items:center;justify-content:center;
  color:var(--dc);background:var(--tl-ring-bg);font-size:var(--tl-dot);line-height:1;font-style:normal;transition:color .3s,transform .3s;}
ui-timeline tl-item.is-on .tlx-ic{transform:scale(1.3);}
ui-timeline tl-item.tlx-tail{background:linear-gradient(var(--tl-line),var(--tl-line)) no-repeat;background-size:2px calc(100% - var(--tl-dot-top));
  background-position:calc(var(--tl-dot) / 2 - 1px) var(--tl-dot-top);}
ui-timeline tl-item.tlx-wait{visibility:hidden;}
ui-timeline.tlx-hl tl-item:not(.is-on){color:var(--tl-sub);}
ui-timeline.tlx-hl tl-item:not(.is-on){--dc:var(--dot-dim);}
ui-timeline.tlx-hl tl-item:not(.is-on)::before{color:var(--tl-line-text);}
ui-timeline tl-item.is-on::after{transform:var(--tf) scale(1.5);box-shadow:0 0 0 3px var(--tl-ring-bg),0 0 0 5px var(--dot-dim);}
ui-timeline tl-item.is-on:is([data-shape="number"],[data-shape="ring"],[data-shape="ring-square"])::after{transform:var(--tf) scale(1.25);}
ui-timeline .tlx-more{display:inline-flex;align-items:center;gap:6px;margin:0 0 0 calc(var(--tl-dot) + 18px);padding:0;background:none;border:0;
  font:inherit;font-size:.9375em;color:var(--tl-more);cursor:pointer;}
ui-timeline .tlx-more:hover{color:var(--tl-heading);}
ui-timeline .tlx-more[hidden]{display:none;}
ui-timeline .tlx-more span{transition:transform .2s;}
ui-timeline .tlx-more:hover span{transform:translateX(3px);}
ui-timeline.tlx-click{cursor:pointer;}
.tlx-more-box[hidden]{display:none !important;}
`;

  class UiTimeline extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { if (this.isConnected && !this._built) this._init(); }, { once: true });
      } else {
        this._init();
      }
    }

    disconnectedCallback() {
      if (this._io) { this._io.disconnect(); this._io = null; }
    }

    _attr(n, d) { const v = this.getAttribute(n); return v == null || v === '' ? d : v; }

    _init() {
      this._built = true;
      if (!document.getElementById('ui-timeline-style')) {
        const s = document.createElement('style');
        s.id = 'ui-timeline-style';
        s.textContent = CSS;
        document.head.appendChild(s);
      }
      this._items = Array.from(this.querySelectorAll(':scope > tl-item'));
      this._mode = this._attr('play-mode', 'none').toLowerCase();
      this._applyColors();

      const h = this.getAttribute('heading');
      if (h) {
        const head = document.createElement('div');
        head.className = 'tlx-head';
        head.textContent = h;
        this.insertBefore(head, this.firstChild);
      }
      this._items.forEach((it, i) => it.classList.toggle('tlx-tail', i < this._items.length - 1));
      this._buildMore();

      if (this._mode === 'reveal') {
        this._items.forEach((it) => { it.classList.add('tlx-wait'); it.classList.remove('tlx-tail'); });
        if (this._moreBtn) this._moreBtn.hidden = true;
      }
      if (this._mode === 'reveal' || this._mode === 'highlight') {
        const auto = this._attr('autoplay', 'false').toLowerCase();
        if (auto === 'true') this.play();
        else if (auto === 'visible') this._watch();
        else {
          this.classList.add('tlx-click');
          this.addEventListener('click', (e) => { if (!this._started && !e.target.closest('.tlx-more')) this.play(); });
        }
      }
    }

    _applyColors() {
      const th = THEMES[this._attr('theme', 'arc').toLowerCase()] || THEMES.arc;
      const set = (k, v) => this.style.setProperty(k, v);
      const pick = (attr, def) => color(this.getAttribute(attr)) || def;
      const bg = pick('bg-color', th.bg);
      set('--tl-bg', bg === 'none' ? 'transparent' : bg);
      set('--tl-line', pick('line-color', th.line));
      set('--tl-heading', pick('heading-color', th.heading));
      set('--tl-sub', pick('sub-color', th.sub));
      set('--tl-text', pick('text-color', th.text));
      set('--tl-more', pick('more-color', th.more));
      set('--tl-line-text', `color-mix(in srgb, ${pick('sub-color', th.sub)} 55%, ${bg === 'none' ? '#0C0D0C' : bg})`);
      const shape = this._attr('dot-shape', 'circle').toLowerCase();
      const big = shape === 'number' || shape === 'icon';
      set('--tl-dot', px(this._attr('dot-size', big ? '22' : '12')));
      set('--tl-dot-top', px(this._attr('dot-top', big ? '1' : '6')));
      set('--tl-ring', px(this._attr('ring-width', '3')));
      set('--tl-ring-bg', bg === 'none' ? '#0C0D0C' : bg);
      set('--tl-num-text', pick('number-color', bg === 'none' ? '#0C0D0C' : bg));
      set('--tl-gap', px(this._attr('gap', '16')));
      set('--tl-pad', this._attr('padding', '20 24').split(/\s+/).map(px).join(' '));
      set('--tl-radius', px(this._attr('radius', '12')));
      set('--tl-fs', rem(this._attr('font-size', '1')));
      set('--tl-hfs', rem(this._attr('heading-size', '1.25')));
      if (this.getAttribute('width')) set('--tl-w', px(this.getAttribute('width')));

      const custom = (this.getAttribute('dot-colors') || '').split('|').map((x) => color(x.trim())).filter(Boolean);
      const n = this._items.length;
      let dots;
      if (custom.length) dots = this._items.map((_, i) => custom[i % custom.length]);
      else if (th.ramp) dots = ramp(th.ramp, n);
      else dots = this._items.map((_, i) => th.cycle[i % th.cycle.length]);
      const dimBg = bg === 'none' ? '#0C0D0C' : bg;
      this._items.forEach((it, i) => {
        const c = color(it.getAttribute('color')) || dots[i];
        it.style.setProperty('--dot', c);
        it.style.setProperty('--dot-dim', `color-mix(in srgb, ${c} 35%, ${dimBg})`);
        const sh = (it.getAttribute('shape') || shape).toLowerCase();
        it.dataset.shape = sh;
        it.dataset.num = it.getAttribute('dot-text') || String(i + 1);
        const icon = it.getAttribute('icon') || this.getAttribute('dot-icon');
        const old = it.querySelector(':scope > .tlx-ic');
        if (old) old.remove();
        if (sh === 'icon') {
          const ic = document.createElement('i');
          ic.className = 'tlx-ic bi ' + (icon || 'bi-circle-fill');
          ic.setAttribute('aria-hidden', 'true');
          it.insertBefore(ic, it.firstChild);
        }
      });
    }

    /* ---------- 查看全部 ---------- */
    _buildMore() {
      const sel = this.getAttribute('more-target');
      if (!sel) return;
      this._moreSel = sel.charAt(0) === '#' || /[.\[\s>]/.test(sel) ? sel : '#' + sel;
      const t = this._moreTarget();
      if (t && t.localName !== 'template') { t.hidden = true; t.style.display = 'none'; }
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tlx-more';
      this._moreBtn = b;
      this._open = false;
      this._moreLabel();
      b.addEventListener('click', () => this.toggleMore());
      this.appendChild(b);
    }

    _moreTarget() {
      try { return document.querySelector(this._moreSel); } catch (e) { return null; }
    }

    _moreLabel() {
      const arrow = this.getAttribute('more-arrow') !== 'false';
      const txt = this._open ? this._attr('less-text', '收合') : this._attr('more-text', '查看全部紀錄');
      this._moreBtn.textContent = txt;
      if (arrow) {
        const s = document.createElement('span');
        s.textContent = this._open ? '↑' : '→';
        this._moreBtn.appendChild(s);
      }
    }

    toggleMore(open) {
      if (!this._moreBtn) return;
      const want = typeof open === 'boolean' ? open : !this._open;
      const t = this._moreTarget();
      if (!t) { console.warn('[ui-timeline] 找不到 more-target「' + this.getAttribute('more-target') + '」。'); return; }
      let box = t;
      if (t.localName === 'template') {
        if (!this._tplBox) {
          if (!want) return;
          /* 第一次展開才把 template 的內容放進頁面，裡面的元件此時才初始化；之後只切換顯示，保留狀態 */
          this._tplBox = document.createElement('div');
          this._tplBox.className = 'tlx-more-box';
          this._tplBox.hidden = true;
          this._tplBox.appendChild(document.importNode(t.content, true));
          this.after(this._tplBox);
        }
        box = this._tplBox;
      }
      this._open = want;
      if (want) {
        box.hidden = false;
        box.style.display = '';
        if (getComputedStyle(box).display === 'none') box.style.display = 'block';
        box.animate(frames(this._attr('effect', 'fade')), { duration: num(this.getAttribute('speed'), 400), easing: 'ease-out' });
        /* 原本隱藏時量不到尺寸的元件，靠 resize 重新排版 */
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
      } else {
        box.hidden = true;
        box.style.display = 'none';
      }
      if (want && this._attr('more-mode', 'toggle') === 'once') this._moreBtn.hidden = true;
      else this._moreLabel();
      this.dispatchEvent(new CustomEvent('timeline-more', { bubbles: true, detail: { open: want, target: box } }));
    }

    /* ---------- 播放 ---------- */
    _watch() {
      if (!('IntersectionObserver' in window)) { this.play(); return; }
      this._io = new IntersectionObserver((es) => {
        if (es.some((e) => e.isIntersecting && e.intersectionRatio >= 0.4)) { this._io.disconnect(); this._io = null; this.play(); }
      }, { threshold: [0.4, 0.7, 1] });
      this._io.observe(this);
    }

    _sleep(ms) { return new Promise((r) => { this._timer = setTimeout(r, Math.max(0, ms)); }); }

    async play() {
      if (!this._built || this._running) return;
      if (this._mode !== 'reveal' && this._mode !== 'highlight') return;
      this._started = true;
      this._running = true;
      this._stopped = false;
      this.classList.remove('tlx-click');
      if (this._io) { this._io.disconnect(); this._io = null; }
      const gap = num(this.getAttribute('interval'), 800);
      const speed = num(this.getAttribute('speed'), 400);
      const effect = this._attr('effect', 'fade');
      const items = this._items;

      if (this._mode === 'reveal') {
        items.forEach((it) => { it.classList.add('tlx-wait'); it.classList.remove('tlx-tail'); });
        if (this._moreBtn) this._moreBtn.hidden = true;
        for (let i = 0; i < items.length; i++) {
          if (this._stopped) break;
          if (i > 0) { items[i - 1].classList.add('tlx-tail'); }
          items[i].classList.remove('tlx-wait');
          items[i].animate(frames(effect), { duration: speed, easing: 'ease-out' });
          if (i < items.length - 1) await this._sleep(gap);
        }
        await this._sleep(speed);
        items.forEach((it, i) => { it.classList.remove('tlx-wait'); it.classList.toggle('tlx-tail', i < items.length - 1); });
        if (this._moreBtn && !(this._open && this._attr('more-mode', 'toggle') === 'once')) {
          this._moreBtn.hidden = false;
          this._moreBtn.animate(frames('fade'), { duration: speed, easing: 'ease-out' });
        }
      } else {
        const loop = this.hasAttribute('loop') && this.getAttribute('loop') !== 'false';
        this.classList.add('tlx-hl');
        do {
          for (let i = 0; i < items.length && !this._stopped; i++) {
            items.forEach((it, j) => it.classList.toggle('is-on', j === i));
            await this._sleep(gap);
          }
        } while (loop && !this._stopped);
        items.forEach((it) => it.classList.remove('is-on'));
        this.classList.remove('tlx-hl');
      }
      this._running = false;
      if (!this._stopped) this.dispatchEvent(new CustomEvent('timeline-end', { bubbles: true }));
    }

    stop() {
      this._stopped = true;
      clearTimeout(this._timer);
      this._running = false;
      this._items.forEach((it, i) => { it.classList.remove('tlx-wait', 'is-on'); it.classList.toggle('tlx-tail', i < this._items.length - 1); });
      this.classList.remove('tlx-hl');
      if (this._moreBtn && !(this._open && this._attr('more-mode', 'toggle') === 'once')) this._moreBtn.hidden = false;
    }
  }

  customElements.define('ui-timeline', UiTimeline);
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
