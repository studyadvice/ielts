(() => {
  'use strict';
  if (customElements.get('ui-post')) return;

  const PALETTE = {
    'background': '#0C0D0C', 'bg-alternative': '#3B2A20', 'shell': '#C6C7BD', 'vanilla': '#DBEDD8',
    'yellow': '#E3D322', 'pink': '#FF91D7', 'red': '#EF6661', 'green': '#71CD76', 'blue': '#5DBAE8',
    'indigo': '#778CE1', 'violet': '#B484E8', 'gray': '#86877F', 'key': '#51DBCF', 'calm': '#A3C4BC',
    'quiet': '#8EA4DE', 'playful': '#FFA987', 'urgent': '#FF2E63', 'energetic': '#B6FF00', 'dreamy': '#C394CD', 'salmon': '#FFC88A'
  };
  const AVATAR_COLORS = ['#5DBAE8', '#FF91D7', '#71CD76', '#E3D322', '#B484E8', '#FFA987', '#51DBCF', '#778CE1', '#C394CD', '#A3C4BC'];
  const RATES = [0.5, 1, 2];
  const CANCEL = { cancelled: true };
  const STYLE_ID = 'ui-post-style';
  const SVG_HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.6-4.6-9.5-9.2C1.1 7.9 3.2 4.3 6.8 4.3c2.1 0 3.5 1.1 4.2 2.3.7-1.2 2.1-2.3 4.2-2.3 3.6 0 5.7 3.6 4.3 7C17.6 15.9 12 20.5 12 20.5z"/></svg>';
  const SVG_COMMENT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h16v11H9l-5 4z"/></svg>';
  const SVG_GRIP = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="5.5" r="1.7"/><circle cx="15" cy="5.5" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="18.5" r="1.7"/><circle cx="15" cy="18.5" r="1.7"/></svg>';
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
ui-post .upo{background:var(--upo-bg,#0C0D0C);border:var(--upo-bw,2px) solid var(--upo-bc,#86877F);border-radius:14px;overflow:hidden;font-size:var(--upo-font-size,1rem);color:var(--upo-text,#DBEDD8);}
ui-post .upo-card{padding:20px 20px 14px 20px;border-bottom:1px solid var(--upo-div,var(--upo-bc,#86877F));}
ui-post .upo-head{display:flex;gap:12px;align-items:center;margin:0 0 12px 0;}
ui-post .upo-av{flex:0 0 auto;width:42px;height:42px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:1.05rem;color:#0C0D0C;overflow:hidden;}
ui-post .upo-av img{width:100%;height:100%;object-fit:cover;display:block;}
ui-post .upo-name{font-weight:700;font-size:.95rem;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
ui-post .upo-time{font-size:.8rem;color:#86877F;}
/* compact：發文作者區塊緊湊排版，頭像縮小、名字與時間同一行、內文與互動列縮小間距 */
ui-post[compact]:not([compact="false"]) .upo-card{padding:12px 16px 10px 16px;}
ui-post[compact]:not([compact="false"]) .upo-head{gap:10px;margin:0 0 8px 0;}
ui-post[compact]:not([compact="false"]) .upo-head .upo-av{width:30px;height:30px;font-size:.8rem;}
ui-post[compact]:not([compact="false"]) .upo-meta{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;min-width:0;}
ui-post[compact]:not([compact="false"]) .upo-name{font-size:.9rem;}
ui-post[compact]:not([compact="false"]) .upo-time{font-size:.75rem;}
ui-post[compact]:not([compact="false"]) .upo-body{font-size:1.05em;line-height:1.45;margin:0 0 8px 0;}
ui-post[compact]:not([compact="false"]) .upo-actions{gap:16px;font-size:.8rem;}
ui-post[compact]:not([compact="false"]) .upo-actions svg{width:16px;height:16px;}
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
ui-post .upo-item.is-reply{position:relative;margin-left:52px;}
ui-post .upo-item.is-reply::before{content:"";position:absolute;left:-26px;top:-14px;width:2px;height:32px;background:var(--upo-div,#86877F);}
ui-post .upo-item.is-reply::after{content:"";position:absolute;left:-26px;top:18px;width:22px;height:2px;background:var(--upo-div,#86877F);}
/* grip：每則留言右側的握把，點一下隱藏這則留言（含特效） */
ui-post .upo-grip{flex:0 0 auto;align-self:center;background:none;border:0;border-radius:6px;padding:4px 2px;margin:0 0 0 4px;color:var(--upo-grip,#86877F);cursor:pointer;line-height:0;}
ui-post .upo-grip svg{width:18px;height:18px;fill:currentColor;}
ui-post .upo-grip:hover{color:var(--upo-grip-hover,#FF91D7);}
ui-post .upo-item.is-hiding{overflow:hidden;pointer-events:none;}
ui-post .upo-item.is-hidden{display:none;}
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
ui-post .upo-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 12px;border-top:1px solid var(--upo-div,var(--upo-bc,#86877F));background:#141614;}
ui-post .upo-btn{font-family:inherit;font-size:.8125rem;line-height:1.4;background:#0C0D0C;color:#C6C7BD;border:1px solid #86877F;border-radius:6px;padding:4px 10px;cursor:pointer;}
ui-post .upo-btn:hover{border-color:#FF91D7;color:#FF91D7;}
ui-post .upo-btn.is-on,ui-post .upo-btn.is-on:hover{background:#FF91D7;border-color:#FF91D7;color:#0C0D0C;}
ui-post .upo-btn:disabled,ui-post .upo-btn:disabled:hover{background:#0C0D0C;border-color:#3B2A20;color:#86877F;cursor:not-allowed;}
ui-post .upo-sep{width:1px;height:20px;background:var(--upo-div,var(--upo-bc,#86877F));margin:0 4px;}
ui-post .upo-state{flex:1;text-align:right;font-size:.8125rem;color:#86877F;}
.ui-post-heart{position:fixed;left:0;top:0;z-index:9999;pointer-events:none;width:22px;height:22px;margin:-11px 0 0 -11px;}
.ui-post-heart svg{display:block;width:100%;height:100%;fill:currentColor;}
ui-post .upo-av.is-profile{cursor:pointer;}
ui-post .upo-av.is-profile:hover{box-shadow:0 0 0 3px #51DBCF;}
.ui-post-pop{position:fixed;z-index:10000;box-sizing:border-box;background:#0C0D0C;color:#DBEDD8;border:2px solid #86877F;border-radius:14px;transform:scale(.6);transition:transform .25s ease-out;font-family:system-ui,-apple-system,"Segoe UI","Noto Sans TC","Microsoft JhengHei",sans-serif;font-size:1rem;line-height:1.6;}
.ui-post-pop.is-open{transform:scale(1);}
.ui-post-pop-close{position:absolute;top:8px;right:8px;background:#0C0D0C;border:1px solid #86877F;color:#C6C7BD;border-radius:6px;padding:2px 8px;font-size:0.9rem;cursor:pointer;}
.ui-post-pop-close:hover{border-color:#FF91D7;color:#FF91D7;}
.ui-post-pop-body{padding:20px 20px 16px 20px;}
@keyframes upo-in{from{transform:translateY(14px) scale(.97)}to{transform:none}}
@keyframes upo-pop{0%{transform:scale(0)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes upo-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
@keyframes upo-dot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
`;

  /* ── 特效：stamp-fx（蓋章）、note-fx（評語）。寫在訊息裡面，訊息出現後依序執行。
     暫停、倍速、重播都會影響特效；start="with" 與前一個特效同時開始，delay 延後開始（毫秒）。
     target 省略時作用在這則訊息的內容，搭配 text（與 nth）可指定其中一段文字 ── */
  const UpoFx = (() => {
    const CANCEL = { cancelled: true, fx: true };
    const TAGS = 'stamp-fx, note-fx';
    const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
    const len = (v) => { if (v == null || v === '') return null; const s = String(v).trim(); return /^-?\d+(\.\d+)?$/.test(s) ? s + 'px' : s; };
    const col = (v, d) => color(v) || d;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    const CSS = `
ui-post stamp-fx,ui-post note-fx{display:none;}
ui-post .upo-fxl{position:relative;}
ui-post .upo-fxnote{position:absolute;z-index:2;width:max-content;box-sizing:border-box;padding:8px 12px;border:1px solid;border-radius:8px;line-height:1.5;text-align:left;font-weight:400;
  font-family:system-ui,"Microsoft JhengHei",sans-serif;}
ui-post .upo-fxtip{position:absolute;width:10px;height:10px;box-sizing:border-box;border:0 solid;transform:rotate(45deg);}
ui-post .upo-fxstamp{position:absolute;left:0;top:0;z-index:2;box-sizing:border-box;padding:3px;border-style:solid;white-space:nowrap;line-height:1.2;
  -webkit-mask-size:100% 100%;mask-size:100% 100%;font-weight:700;pointer-events:none;}
ui-post .upo-fxstamp-in{display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:100%;height:100%;}
`;
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

    /* 把 html 裡的特效標籤取出來，回傳乾淨的內容與特效清單 */
    function extract(html) {
      if (!html || !/<(stamp|note)-fx\b/i.test(html)) return { html, fx: [] };
      const t = document.createElement('template'); t.innerHTML = html;
      const fx = [...t.content.querySelectorAll(TAGS)].map((n) => { const s = n.outerHTML; n.remove(); return s; });
      return { html: t.innerHTML.trim(), fx };
    }

    /* ── 一次特效播放：可暫停、繼續、快轉完成、取消 ── */
    class Run {
      constructor(o) {
        this.rate = o.rate || (() => 1);
        this.cancelToken = o.cancel || CANCEL;
        this.skipping = !!o.instant;
        this.instant = !!o.instant;
        this.detached = !!o.detached;
        this.hold = !!o.hold && !o.instant;
        this.dead = false;
        this.waits = new Set();
        this.anims = new Set();
      }
      sleep(ms) {
        if (this.dead) return Promise.reject(this.cancelToken);
        return new Promise((res, rej) => {
          const w = { res, rej, left: Math.max(0, ms || 0) / this.rate(), t: null, at: 0 };
          w.done = () => { this.waits.delete(w); clearTimeout(w.t); res(); };
          this.waits.add(w);
          if (this.skipping) { w.done(); return; }
          if (!this.hold) this._arm(w);
        });
      }
      _arm(w) { w.at = performance.now(); w.t = setTimeout(w.done, w.left); }
      anim(el, kf, ms, opts) {
        if (this.dead) return Promise.reject(this.cancelToken);
        const own = kf.some((k) => k.easing);
        const a = el.animate(kf, Object.assign({ duration: this.skipping ? 1 : Math.max(1, ms / this.rate()), fill: 'both', easing: own ? 'linear' : 'ease-out' }, opts || {}));
        this.anims.add(a);
        if (this.skipping) { try { a.finish(); } catch (e) { /* 略過 */ } } else if (this.hold) a.pause();
        return a.finished.then(() => {}, () => {}).then(() => { this.anims.delete(a); if (this.dead) throw this.cancelToken; });
      }
      pause() {
        if (this.hold || this.skipping || this.dead) return;
        this.hold = true;
        this.waits.forEach((w) => { if (w.t != null) { clearTimeout(w.t); w.t = null; w.left = Math.max(0, w.left - (performance.now() - w.at)); } });
        this.anims.forEach((a) => { try { a.pause(); } catch (e) { /* 略過 */ } });
      }
      resume() {
        if (!this.hold || this.dead) return;
        this.hold = false;
        this.waits.forEach((w) => this._arm(w));
        this.anims.forEach((a) => { try { a.play(); } catch (e) { /* 略過 */ } });
      }
      skip() {
        if (this.dead) return;
        this.skipping = true; this.hold = false;
        [...this.waits].forEach((w) => w.done());
        this.anims.forEach((a) => { try { a.finish(); } catch (e) { /* 略過 */ } });
      }
      cancel() {
        if (this.dead) return;
        this.dead = true;
        [...this.waits].forEach((w) => { clearTimeout(w.t); this.waits.delete(w); w.rej(this.cancelToken); });
        this.anims.forEach((a) => { try { a.cancel(); } catch (e) { /* 略過 */ } });
      }
    }

    /* ── 亂數、墨跡遮罩（同 ui-play） ── */
    function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    function makeRng(seed) {
      let a = seed >>> 0;
      return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    }
    function seedOf(v, fallback) { if (v != null && v !== '') return /^\d+$/.test(v) ? parseInt(v, 10) : hashStr(String(v)); return hashStr(fallback); }
    function valueNoise(w, h, cell, rnd) {
      const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2;
      const g = new Float32Array(gw * gh);
      for (let i = 0; i < g.length; i++) g[i] = rnd();
      const out = new Float32Array(w * h);
      const sm = (t) => t * t * (3 - 2 * t);
      for (let y = 0; y < h; y++) {
        const gy = y / cell, y0 = Math.floor(gy), fy = sm(gy - y0);
        for (let x = 0; x < w; x++) {
          const gx = x / cell, x0 = Math.floor(gx), fx = sm(gx - x0);
          const a = g[y0 * gw + x0], b = g[y0 * gw + x0 + 1], c = g[(y0 + 1) * gw + x0], d = g[(y0 + 1) * gw + x0 + 1];
          out[y * w + x] = (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fy;
        }
      }
      return out;
    }
    function inkMask(w, h, opt) {
      const S = 2;
      const W = Math.max(2, Math.round(w * S)), H = Math.max(2, Math.round(h * S));
      const rnd = makeRng(opt.seed);
      const blot = valueNoise(W, H, 22 * S, rnd), mid = valueNoise(W, H, 7 * S, rnd);
      const grain = valueNoise(W, H, 1.6 * S, rnd), chip = valueNoise(W, H, 5 * S, rnd);
      let side = opt.pressure;
      if (side === 'random') side = ['left', 'right', 'top', 'bottom', 'even'][Math.floor(rnd() * 5)];
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d'); const img = ctx.createImageData(W, H);
      const round = opt.shape === 'circle' || opt.shape === 'ellipse';
      const edgeZone = (4 + opt.edge * 10) * S;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = y * W + x;
          let d;
          if (round) { const nx = (x - W / 2) / (W / 2), ny = (y - H / 2) / (H / 2); d = (1 - Math.sqrt(nx * nx + ny * ny)) * Math.min(W, H) / 2; }
          else d = Math.min(x, W - x, y, H - y);
          const ed = Math.max(0, 1 - d / edgeZone);
          let pr = 0;
          if (side === 'left') pr = 1 - x / W; else if (side === 'right') pr = x / W; else if (side === 'top') pr = 1 - y / H; else if (side === 'bottom') pr = y / H;
          const score = blot[i] * 0.45 + mid[i] * 0.3 + grain[i] * 0.25;
          let th = opt.ink * 0.34 + pr * pr * 0.3 * (opt.ink + 0.3);
          th += ed * ed * opt.edge * (0.35 + chip[i] * 0.6);
          img.data[i * 4 + 3] = score >= th ? 255 : 0;
        }
      }
      ctx.putImageData(img, 0, 0);
      return cv.toDataURL('image/png');
    }
    /* ── 目標與定位 ── */
    const subs = new WeakMap();
    function sub(root, text, nth) {
      let cache = subs.get(root); if (!cache) { cache = new Map(); subs.set(root, cache); }
      const key = text + '\u0000' + nth;
      if (cache.has(key) && cache.get(key).isConnected) return cache.get(key);
      const nodes = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let full = '';
      while (w.nextNode()) { nodes.push({ node: w.currentNode, start: full.length }); full += w.currentNode.data; }
      let idx = -1, from = 0;
      for (let i = 0; i < nth; i++) { idx = full.indexOf(text, from); if (idx === -1) return null; from = idx + text.length; }
      const end = idx + text.length;
      const locate = (pos, isEnd) => {
        for (let i = 0; i < nodes.length; i++) { const n = nodes[i], L = n.node.data.length; if (pos < n.start + L || (isEnd && pos === n.start + L)) return { node: n.node, off: pos - n.start }; }
        const last = nodes[nodes.length - 1]; return { node: last.node, off: last.node.data.length };
      };
      const a = locate(idx, false), b = locate(end, true);
      const range = document.createRange(); range.setStart(a.node, a.off); range.setEnd(b.node, b.off);
      const span = document.createElement('span'); span.className = 'upo-fxsub';
      span.appendChild(range.extractContents()); range.insertNode(span);
      cache.set(key, span);
      return span;
    }
    function targets(el, ctx) {
      const sel = el.getAttribute('target');
      let list = [];
      if (!sel) list = [ctx.scope];
      else {
        try {
          list = [...ctx.scope.querySelectorAll(sel)];
          if (!list.length) list = [...ctx.layer.querySelectorAll(sel)];
          if (!list.length) list = [...document.querySelectorAll(sel)];
        } catch (e) { return []; }
      }
      const text = el.getAttribute('text');
      if (text != null && text !== '') { const nth = parseInt(el.getAttribute('nth'), 10) || 1; return list.map((n) => sub(n, text, nth)).filter(Boolean); }
      return list;
    }
    /* 對齊基準：區塊元素以文字實際範圍為準；座標相對於 layer */
    function rel(el, layer) {
      const c = layer.getBoundingClientRect();
      if (getComputedStyle(el).display !== 'inline') {
        const rg = document.createRange(); rg.selectNodeContents(el);
        const rs = [...rg.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
        if (rs.length) {
          const x1 = Math.min(...rs.map((r) => r.left)), y1 = Math.min(...rs.map((r) => r.top));
          const x2 = Math.max(...rs.map((r) => r.right)), y2 = Math.max(...rs.map((r) => r.bottom));
          return { x: x1 - c.left, y: y1 - c.top, w: x2 - x1, h: y2 - y1 };
        }
      }
      const r = el.getBoundingClientRect();
      return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
    }
    function keep(ctx, place) { ctx.live.push(place); return () => { const i = ctx.live.indexOf(place); if (i >= 0) ctx.live.splice(i, 1); }; }
    function stayFor(run, el, node, drop, def) {
      const stay = el.getAttribute('stay') || 'forever';
      if (stay === 'forever') return;
      run.sleep(num(stay, 2000)).then(() => {
        if (!node.isConnected) return;
        const a = node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: Math.max(1, num(el.getAttribute('fade-out'), def) / run.rate()), fill: 'forwards' });
        a.finished.then(() => { node.remove(); drop(); }, () => {});
      }, () => {});
    }

    /* note-fx */
    async function note(run, el, ctx) {
      const t = targets(el, ctx)[0];
      if (!t) return;
      const layer = ctx.layer;
      const pos = (el.getAttribute('position') || 'auto').toLowerCase();
      const ox = num(el.getAttribute('offset-x'), 0), oy = num(el.getAttribute('offset-y'), 0);
      const fg = col(el.getAttribute('color'), '#DBEDD8'), bg = col(el.getAttribute('bg-color'), '#3B2A20');
      const bc = col(el.getAttribute('border-color'), ctx.accent || '#51DBCF');
      const nt = document.createElement('div');
      nt.className = 'upo-fxnote';
      nt.innerHTML = el.innerHTML;
      Object.assign(nt.style, { color: fg, background: bg, borderColor: bc, fontSize: len(el.getAttribute('font-size')) || '1rem', maxWidth: len(el.getAttribute('max-width')) || '320px', visibility: 'hidden' });
      const tip = document.createElement('div');
      tip.className = 'upo-fxtip';
      tip.style.background = bg; tip.style.borderColor = bc;
      if (el.getAttribute('pointer') !== 'false') nt.appendChild(tip);
      layer.appendChild(nt);
      let side = pos;
      const place = () => {
        if (!nt.isConnected || !t.isConnected) return;
        const r = rel(t, layer), b = ctx.bounds();
        const w = nt.offsetWidth, h = nt.offsetHeight, gap = 12;
        if (pos === 'auto') side = r.y - h - gap >= b.y ? 'top' : 'bottom';
        let x, y;
        if (side === 'top' || side === 'bottom') {
          x = Math.max(b.x + 4, Math.min(b.x + b.w - w - 4, r.x + r.w / 2 - w / 2));
          y = side === 'top' ? r.y - h - gap : r.y + r.h + gap;
        } else {
          y = r.y + r.h / 2 - h / 2;
          x = side === 'left' ? r.x - w - gap : r.x + r.w + gap;
        }
        x += ox; y += oy;
        nt.style.left = x + 'px'; nt.style.top = y + 'px';
        const ts = tip.style;
        ts.borderWidth = '0'; ts.left = ts.top = ts.right = ts.bottom = '';
        if (side === 'top' || side === 'bottom') {
          ts.left = Math.max(10, Math.min(w - 20, r.x + r.w / 2 - x - 5)) + 'px';
          if (side === 'top') { ts.bottom = '-6px'; ts.borderRightWidth = ts.borderBottomWidth = '1px'; }
          else { ts.top = '-6px'; ts.borderLeftWidth = ts.borderTopWidth = '1px'; }
        } else {
          ts.top = (h / 2 - 5) + 'px';
          if (side === 'left') { ts.right = '-6px'; ts.borderRightWidth = ts.borderTopWidth = '1px'; }
          else { ts.left = '-6px'; ts.borderLeftWidth = ts.borderBottomWidth = '1px'; }
        }
      };
      place();
      nt.style.visibility = '';
      const drop = keep(ctx, place);
      const dy = side === 'bottom' ? '-6px' : '6px';
      await run.anim(nt, [{ opacity: 0, transform: `translateY(${dy})` }, { opacity: 1, transform: 'none' }], num(el.getAttribute('speed'), 300));
      stayFor(run, el, nt, drop, 300);
    }

    /* stamp-fx */
    async function stamp(run, el, ctx) {
      const label = el.textContent.trim();
      const icon = (el.getAttribute('icon') || '').trim();
      const t = targets(el, ctx)[0];
      if (!t || (!label && !icon)) return;
      const layer = ctx.layer;
      const c = col(el.getAttribute('color'), '#EF6661');
      const size = len(el.getAttribute('size')) || '1.4rem';
      const bw = num(el.getAttribute('border-width'), 3);
      const shape = (el.getAttribute('shape') || 'round').toLowerCase();
      const inner = (el.getAttribute('inner-border') || 'single').toLowerCase();
      const vertical = (el.getAttribute('direction') || 'horizontal').toLowerCase() === 'vertical';
      const ls = len(el.getAttribute('letter-spacing')) || '6px';
      const ink = clamp(num(el.getAttribute('ink'), 0.5), 0, 1);
      const edge = clamp(num(el.getAttribute('edge'), 0.4), 0, 1);
      const bleed = clamp(num(el.getAttribute('bleed'), 0.2), 0, 1);
      const pressure = (el.getAttribute('pressure') || 'random').toLowerCase();
      const seed = seedOf(el.getAttribute('seed'), label + '|' + icon);
      const rnd = makeRng(seed);
      const rotAttr = el.getAttribute('rotate');
      const rot = rotAttr === 'random' ? (rnd() * 2 - 1) * num(el.getAttribute('rotate-range'), 12) : num(rotAttr, -8);
      const anchor = (el.getAttribute('anchor') || 'center').toLowerCase();
      const ox = num(el.getAttribute('offset-x'), 0), oy = num(el.getAttribute('offset-y'), 0);
      const speed = num(el.getAttribute('speed'), 380);
      const drop0 = num(el.getAttribute('drop-scale'), 2.6);
      const bounce = clamp(num(el.getAttribute('bounce'), 0.3), 0, 1);
      const shake = num(el.getAttribute('shake'), 2);
      const radius = { rect: '2px', round: '10px', circle: '50%', ellipse: '50%' }[shape] || '10px';

      const s = document.createElement('div');
      s.className = 'upo-fxstamp';
      Object.assign(s.style, { color: c, borderColor: c, borderWidth: (bw + bleed * 1.2) + 'px', borderRadius: radius, fontSize: size });
      if (el.getAttribute('font-family')) s.style.fontFamily = el.getAttribute('font-family');
      const inn = document.createElement('div');
      inn.className = 'upo-fxstamp-in';
      inn.style.borderRadius = radius;
      inn.style.padding = (el.getAttribute('padding') || (vertical ? '16px 6px' : '6px 16px')).split(/\s+/).map(len).join(' ');
      if (inner === 'single') inn.style.border = Math.max(1, bw * 0.5) + 'px solid ' + c;
      else if (inner === 'double') inn.style.border = Math.max(4, bw + 1) + 'px double ' + c;
      if (bleed > 0) { const b = (bleed * 0.9).toFixed(2); inn.style.textShadow = `${b}px 0 0 ${c},-${b}px 0 0 ${c},0 ${b}px 0 ${c},0 -${b}px 0 ${c}`; }
      const iconPos = (el.getAttribute('icon-position') || (vertical ? 'top' : 'left')).toLowerCase();
      inn.style.flexDirection = { left: 'row', right: 'row-reverse', top: 'column', bottom: 'column-reverse' }[iconPos] || 'row';
      inn.style.gap = len(el.getAttribute('icon-gap')) || '6px';
      if (icon) {
        const i = document.createElement('i');
        i.className = 'bi ' + (/^bi-/.test(icon) ? icon : 'bi-' + icon);
        Object.assign(i.style, { fontSize: num(el.getAttribute('icon-size'), 1.1) + 'em', lineHeight: '1', display: 'block' });
        inn.appendChild(i);
      }
      /* 文字用 | 分行；直書時每行成為一欄 */
      if (label) {
        const tx = document.createElement('div');
        Object.assign(tx.style, { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' });
        if (vertical) tx.style.writingMode = 'vertical-rl';
        label.split('|').map((x) => x.trim()).filter(Boolean).forEach((line) => {
          const ln = document.createElement('span');
          ln.textContent = line; ln.style.letterSpacing = ls; ln.style.whiteSpace = 'nowrap';
          if (vertical) ln.style.marginBottom = '-' + ls; else ln.style.marginRight = '-' + ls;
          tx.appendChild(ln);
        });
        inn.appendChild(tx);
      }
      s.appendChild(inn);
      s.style.visibility = 'hidden';
      layer.appendChild(s);
      /* 等字型載入完成再量尺寸，墨跡遮罩才會吻合 */
      if (document.fonts) {
        try {
          const cs = getComputedStyle(s);
          const loads = [document.fonts.load(`700 ${cs.fontSize} ${cs.fontFamily}`, label || 'A')];
          if (icon) loads.push(document.fonts.load(`${cs.fontSize} bootstrap-icons`));
          await Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 1500))]);
        } catch (e) { /* 略過 */ }
      }
      if (run.dead) { s.remove(); throw run.cancelToken; }
      if (shape === 'circle') { const m = Math.max(s.offsetWidth, s.offsetHeight); s.style.width = s.style.height = m + 'px'; }
      const url = inkMask(s.offsetWidth, s.offsetHeight, { seed, ink, edge, pressure, shape });
      s.style.webkitMaskImage = `url(${url})`; s.style.maskImage = `url(${url})`;
      const place = () => {
        if (!s.isConnected || !t.isConnected) return;
        const r = rel(t, layer);
        let ax = r.x + r.w / 2, ay = r.y + r.h / 2;
        if (anchor.indexOf('left') !== -1) ax = r.x;
        if (anchor.indexOf('right') !== -1) ax = r.x + r.w;
        if (anchor.indexOf('top') !== -1) ay = r.y;
        if (anchor.indexOf('bottom') !== -1) ay = r.y + r.h;
        s.style.left = (ax + ox) + 'px'; s.style.top = (ay + oy) + 'px';
      };
      place();
      const T = (k) => `translate(-50%,-50%) rotate(${rot}deg) scale(${k})`;
      s.style.transform = T(1);
      s.style.visibility = '';
      const drop = keep(ctx, place);
      const impact = 0.72;
      const landing = run.anim(s, [
        { opacity: 0, transform: T(drop0), easing: 'cubic-bezier(.55,0,.9,.4)' },
        { opacity: 1, transform: T(1 - 0.12 * bounce), offset: impact, easing: 'ease-out' },
        { opacity: 1, transform: T(1) }
      ], speed, { easing: 'linear' });
      if (!run.skipping) {
        run.sleep(speed * impact).then(() => {
          if (run.skipping) return;
          if (shake > 0 && ctx.shake) {
            const k = shake;
            run.anim(ctx.shake, [{ transform: 'none' }, { transform: `translate(${k}px,${k * 0.5}px)` }, { transform: `translate(-${k}px,-${k * 0.5}px)` },
              { transform: `translate(${k * 0.5}px,-${k * 0.5}px)` }, { transform: 'none' }], 180, { fill: 'none', easing: 'linear' }).catch(() => {});
          }
        }, () => {});
      }
      await landing;
      stayFor(run, el, s, drop, 400);
    }

    /* 依序執行；start="with" 與前一個同時開始 */
    async function play(run, specs, ctx) {
      const els = specs.map((x) => { const t = document.createElement('template'); t.innerHTML = x; return t.content.firstElementChild; }).filter(Boolean);
      const groups = [];
      els.forEach((el) => {
        const s = (el.getAttribute('start') || 'after').toLowerCase();
        if (s === 'with' && groups.length) groups[groups.length - 1].push(el); else groups.push([el]);
      });
      for (const g of groups) {
        await Promise.all(g.map(async (el) => {
          await run.sleep(num(el.getAttribute('delay'), 0));
          if (el.tagName === 'STAMP-FX') await stamp(run, el, ctx); else await note(run, el, ctx);
          if (ctx.onStep) ctx.onStep();
        }));
      }
    }

    return { CANCEL, TAGS, extract, Run, play, relayout: (list) => list.slice().forEach((f) => f()) };
  })();

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = STYLE_TEXT;
    document.head.appendChild(s);
  }

  // 同一時間只開一個板主視窗
  let openPop = null;
  function onDocClick(e) {
    if (!openPop || openPop.el.contains(e.target)) return;
    closeProfile();
  }
  function onKey(e) { if (e.key === 'Escape') closeProfile(); }
  function closeProfile() {
    if (!openPop) return;
    const el = openPop.el;
    openPop = null;
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('scroll', closeProfile, true);
    window.removeEventListener('resize', closeProfile);
    el.classList.remove('is-open');
    setTimeout(() => el.remove(), 260);
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
      if (openPop && openPop.owner === this) closeProfile();
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
      this._fxRuns = new Set();
      this._fxLive = [];
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
      this._live = (this.getAttribute('mode') || '').trim().toLowerCase() === 'live';
      this._buildDom();
      this._idle();
      if (this._live) this._liveInit();
      else this._setupStart();
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
      css('--upo-grip', color(this.getAttribute('grip-color')));
      css('--upo-grip-hover', color(this.getAttribute('grip-hover-color')));
      const theme = color(this.getAttribute('theme'));
      css('--upo-bc', color(this.getAttribute('border-color')) || theme);
      css('--upo-div', color(this.getAttribute('divider-color')) || theme);
      css('--upo-bw', len(this.getAttribute('border-width')));

      const box = document.createElement('div');
      box.className = 'upo';

      // 貼文卡片
      const card = document.createElement('div');
      card.className = 'upo-card';
      const head = document.createElement('div');
      head.className = 'upo-head';
      const author = this.getAttribute('author') || 'IELTS Examiner';
      const headAv = this._avatar(this.getAttribute('avatar'), this.getAttribute('avatar-color'), author);
      if (this.getAttribute('profile-target')) {
        headAv.classList.add('is-profile');
        headAv.addEventListener('click', (e) => { e.stopPropagation(); this._openProfile(headAv); });
      }
      head.appendChild(headAv);
      const meta = document.createElement('div');
      meta.className = 'upo-meta';
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
      if (window.ResizeObserver) { this._fxRO = new ResizeObserver(() => UpoFx.relayout(this._fxLive)); this._fxRO.observe(box); }
      this._list = list;
      this._typing = typing;

      if (bool(this.getAttribute('controls'), true) && !this._live) {
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

    _openProfile(anchor) {
      if (openPop && openPop.anchor === anchor) { closeProfile(); return; }
      const id = (this.getAttribute('profile-target') || '').trim().replace(/^#/, '');
      const src = id ? document.getElementById(id) : null;
      if (!src) return;
      closeProfile();

      let content;
      if (src.tagName === 'TEMPLATE') {
        content = src.content.cloneNode(true);
      } else {
        content = src.cloneNode(true);
        content.removeAttribute('hidden');
        content.style.display = '';
      }

      const pop = document.createElement('div');
      pop.className = 'ui-post-pop';
      pop.style.width = len(this.getAttribute('profile-width')) || '320px';
      pop.style.borderColor = getComputedStyle(this).getPropertyValue('--upo-bc').trim() || '#86877F';

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'ui-post-pop-close';
      close.textContent = '✕';
      close.addEventListener('click', (e) => { e.stopPropagation(); closeProfile(); });

      const body = document.createElement('div');
      body.className = 'ui-post-pop-body';
      body.appendChild(content);
      pop.append(close, body);
      document.body.appendChild(pop);

      // 放在頭像右側；右側放不下就放左側；上下不超出視窗
      const r = anchor.getBoundingClientRect();
      const pw = pop.offsetWidth, ph = pop.offsetHeight;
      let left = r.right + 12, origin = 'left top';
      if (left + pw > window.innerWidth - 8) { left = r.left - pw - 12; origin = 'right top'; }
      left = Math.max(8, left);
      const top = Math.min(Math.max(8, r.top), window.innerHeight - ph - 8);
      pop.style.left = left + 'px';
      pop.style.top = top + 'px';
      pop.style.transformOrigin = origin;

      openPop = { el: pop, anchor, owner: this };
      requestAnimationFrame(() => pop.classList.add('is-open'));
      setTimeout(() => {
        if (!openPop || openPop.el !== pop) return;
        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onKey);
        window.addEventListener('scroll', closeProfile, true);
        window.addEventListener('resize', closeProfile);
      }, 0);
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
      this._replyMap = new Map();   // 最佳回答 → 其回覆清單
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
      if (!this._built || this._live) return;
      if (!this._started || this._ended) { this._go(); return; }
      if (this._paused) {
        this._paused = false;
        this._box.querySelectorAll('.upo-item.was-surging').forEach((el) => el.classList.replace('was-surging', 'is-surging'));
        const q = this._resumeQ;
        this._resumeQ = [];
        q.forEach((f) => f());
        this._fxRuns.forEach((r) => r.resume());
        this._sync();
      }
    }

    pause() {
      if (!this._built || this._live || !this._started || this._ended) return;
      this._paused = true;
      this._box.querySelectorAll('.upo-item.is-surging').forEach((el) => el.classList.replace('is-surging', 'was-surging'));
      this._fxRuns.forEach((r) => r.pause());
      this._sync();
    }

    restart() {
      if (this._built && !this._live) this._go();
    }

    /* 加一則留言。mode="live" 時立刻排入播放：正在輸入、出現、愛心跳動、最佳回答判定；
       其他模式只加進清單，下次重播才出現。item 的鍵名同 post-item 屬性（駝峰或連字號皆可），
       內容用 html 或 text。回傳目前留言總數。 */
    add(item) {
      if (!this._built) { (this._pendingAdd = this._pendingAdd || []).push(item); return 0; }
      const src = this._toItem(item || {});
      if (!this._live) { this._items.push(src); return this._items.length; }
      this._liveTotal++;
      this._liveChain = this._liveChain.then(() => this._liveOne(src, false)).catch((err) => { if (err !== CANCEL) console.error(err); });
      return this._liveTotal;
    }
    get live() { return !!this._live; }
    get total() { return this._live ? this._liveTotal : (this._items ? this._items.length : 0); }

    _toItem(item) {
      const el = document.createElement('post-item');
      Object.keys(item).forEach((k) => {
        if (k === 'html' || k === 'text') return;
        let v = item[k];
        if (v === null || v === undefined || v === false) return;
        if (Array.isArray(v)) v = v.join(',');
        el.setAttribute(k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()), v === true ? '' : String(v));
      });
      if (item.html != null) el.innerHTML = item.html;
      else if (item.text != null) el.textContent = item.text;
      return el;
    }

    /* ---------- live 模式 ---------- */
    _liveInit() {
      this._started = true;
      this._shown = 0;
      this._liveModels = [];
      this._liveTotal = this._items.length;
      this._liveChain = Promise.resolve();
      this._setState('');
      // 預先寫好的留言直接顯示，不播動畫
      this._items.forEach((src) => this._liveOne(src, true));
      (this._pendingAdd || []).forEach((it) => this.add(it));
      this._pendingAdd = null;
    }

    _liveOne(src, instant) {
      const m = this._model(src, this._liveModels.length);
      if (m.reply) {
        for (let j = this._liveModels.length - 1; j >= 0; j--) {
          if (this._liveModels[j].best) { m.replyParent = this._liveModels[j]; break; }
        }
      }
      this._liveModels.push(m);
      if (instant) {
        this._makeItem(m);
        if (m.fx.length) this._runFx(m, this._run, true).catch(() => {});
        m.cur = m.likes; m.count.textContent = this._fmt(m.likes);
        if (m.shareEl) { m.curShares = m.shares; m.shareEl.textContent = this._fmt(m.shares); }
        this._ccount.textContent = String(++this._shown);
        this._liveJudge(m, true, this._run);
        return Promise.resolve();
      }
      return this._liveAnimate(m);
    }

    async _liveAnimate(m) {
      const run = this._run;
      const A = (n, d, mn, mx) => num(this.getAttribute(n), d, mn, mx);
      await this._appear(m, run, A, true);
      this._ccount.textContent = String(++this._shown);
      if (!m.after) {
        const full = A('surge', 3500, 300, 60000);
        const dur = m.best ? full : Math.min(full, A('live-surge', 1200, 300, 60000));
        await this._surge([m], run, dur);
      }
      await this._liveJudge(m, false, run);
      this.dispatchEvent(new CustomEvent('post-add-end', { bubbles: true, detail: { index: m.index, author: m.author, best: m.best } }));
    }

    async _liveJudge(m, instant, run) {
      if (m.after) { this._showTags(m); this._reveal(m.el); return; }
      if (m.best) {
        const burst = (this.getAttribute('burst') || 'big').toLowerCase();
        m.el.classList.add('is-best');
        m.heart.classList.add('is-on');
        m.name.appendChild(this._pill(this.getAttribute('best-label') || '最佳回答', 'is-best'));
        if (!instant) {
          if (burst === 'big') for (let i = 0; i < 26; i++) this._heart(m.heart, 1.3);
          else if (burst === 'small') for (let i = 0; i < 6; i++) this._heart(m.heart, 0.6);
          await this._wait(500, run);
        }
        if (bool(this.getAttribute('sort'), true) && !m.replyParent) {
          // 所有最佳回答依出現順序置頂，回覆跟著對象移動
          const pinned = this._liveModels.filter((x) => x.best && x.el && !x.replyParent).map((x) => x.el);
          const els = Array.from(this._list.children);
          const before = instant ? null : new Map(els.map((el) => [el, el.getBoundingClientRect().top]));
          const blockOf = (el) => [el].concat(this._replyMap.get(el) || []);
          const order = pinned.flatMap(blockOf)
            .concat(els.filter((el) => !el.classList.contains('is-reply') && !pinned.includes(el)).flatMap(blockOf));
          order.forEach((el) => this._list.appendChild(el));
          if (before) {
            order.forEach((el) => {
              const dy = before.get(el) - el.getBoundingClientRect().top;
              if (dy && el.animate) el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 650 / this.rate, easing: 'cubic-bezier(.3,.7,.3,1)' });
            });
            await this._wait(700, run);
          }
        }
      }
      this._applyLow(m);
      this._showTags(m);
      this._reveal(m.el);
    }

    /* ---------- 播放流程 ---------- */
    async _go() {
      const run = ++this._run;
      this._fxRuns.forEach((r) => r.cancel());
      this._fxRuns.clear();
      this._fxLive.length = 0;
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
        // 回覆：對象為它前面最近的一則最佳回答
        items.forEach((m) => {
          if (!m.reply) return;
          for (let j = m.index - 1; j >= 0; j--) {
            if (items[j].best) { m.replyParent = items[j]; break; }
          }
        });
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
          this._reveal(m.el);
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
        reply: src.hasAttribute('reply') && bool(src.getAttribute('reply'), true), replyParent: null,
        start: Math.round(num(src.getAttribute('start-likes'), defStart, 0, 1e9)),
        shares: src.hasAttribute('shares') ? Math.round(num(src.getAttribute('shares'), 0, 0, 1e9)) : null,
        startShares: Math.round(num(src.getAttribute('start-shares'), 0, 0, 1e9)),
        shareEl: null, curShares: 0,
        tags: (src.getAttribute('tags') || '').split(',').map((s) => s.trim()).filter(Boolean),
        el: null, heart: null, count: null, cur: 0
      };
    }

    async _appear(m, run, A, live) {
      const src = m.src;
      const author = src.getAttribute('author') || (m.examiner ? 'IELTS Examiner' : 'User');
      await this._wait(num(src.getAttribute('delay'), live ? 0 : A('item-delay', 700, 0, 60000), 0, 60000), run);
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
        this._reveal(this._typing);
        await this._wait(typingMs, run);
        this._typing.hidden = true;
      }
      this._makeItem(m);
      if (m.fx.length) await this._runFx(m, run, false);
    }

    _makeItem(m) {
      const src = m.src;
      const author = src.getAttribute('author') || (m.examiner ? 'IELTS Examiner' : 'User');
      m.author = author;
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
      if (m.examiner) name.appendChild(this._pill(src.getAttribute('role-label') || this.getAttribute('examiner-label') || '考官', 'is-examiner'));
      const text = document.createElement('div');
      text.className = 'upo-text';
      Array.from(src.childNodes).forEach((n) => text.appendChild(n.cloneNode(true)));
      /* 特效標籤不顯示在留言裡，另外收集起來，留言出現後執行 */
      m.fx = Array.from(text.querySelectorAll(UpoFx.TAGS)).map((n) => { const h = n.outerHTML; n.remove(); return h; });
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
      /* grip：ui-post 寫 grip 時每則都有，post-item 可用 grip 或 grip="false" 個別覆寫 */
      if (bool(src.getAttribute('grip'), bool(this.getAttribute('grip'), false))) {
        const g = document.createElement('button');
        g.type = 'button';
        g.className = 'upo-grip';
        g.title = this.getAttribute('grip-label') || '隱藏這則留言';
        g.innerHTML = SVG_GRIP;
        g.addEventListener('click', (e) => { e.stopPropagation(); this._hideItem(m); });
        el.appendChild(g);
        m.grip = g;
      }
      const parentEl = m.replyParent && m.replyParent.el;
      if (parentEl) {
        // 回覆接在對象與其既有回覆之後，並加上 is-reply 縮排
        const replies = this._replyMap.get(parentEl) || [];
        const tail = replies.length ? replies[replies.length - 1] : parentEl;
        this._list.insertBefore(el, tail.nextSibling);
        this._replyMap.set(parentEl, replies.concat([el]));
        el.classList.add('is-reply');
      } else {
        this._list.appendChild(el);
      }
      this._reveal(el);
      m.el = el;
      m.main = main;
      m.name = name;
      m.bubble = bubble;
      m.text = text;
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
        // 回覆跟著對象一起移動
        const blockOf = (el) => [el].concat(this._replyMap.get(el) || []);
        const order = best.flatMap((m) => blockOf(m.el))
          .concat(els.filter((el) => !el.classList.contains('is-reply') && !best.some((m) => m.el === el)).flatMap(blockOf));
        order.forEach((el) => this._list.appendChild(el));
        order.forEach((el) => {
          const dy = before.get(el) - el.getBoundingClientRect().top;
          if (dy && el.animate) el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 650 / this.rate, easing: 'cubic-bezier(.3,.7,.3,1)' });
        });
        await this._wait(700, run);
      }

      // 低分留言
      items.forEach((m) => this._applyLow(m));

      // 講評標籤
      items.forEach((m) => this._showTags(m));
      if (items.some((m) => m.tags.length)) await this._wait(500, run);
    }

    /* 隱藏一則留言：高度收合後移出版面，章與評語在留言裡面，一起消失。重播後會再出現 */
    _hideItem(m) {
      const el = m.el;
      if (!el || el.classList.contains('is-hidden') || el.classList.contains('is-hiding')) return;
      const done = () => {
        el.classList.remove('is-hiding');
        el.classList.add('is-hidden');
        this.dispatchEvent(new CustomEvent('post-item-hide', { bubbles: true, detail: { index: m.index, author: m.author } }));
      };
      if (!el.animate) { done(); return; }
      el.classList.add('is-hiding');
      const gap = parseFloat(getComputedStyle(this._list).rowGap) || 0;
      el.animate([
        { height: el.offsetHeight + 'px', marginBottom: '0px', transform: 'none' },
        { height: '0px', marginBottom: -gap + 'px', transform: 'scale(.96)' }
      ], { duration: 280 / this.rate, easing: 'ease-in', fill: 'forwards' }).finished.then(done, done);
    }

    _applyLow(m) {
      if (!m.low || m.low === 'keep') return;
      if (m.low === 'dim') { m.el.classList.add('is-dim'); return; }
      const fold = document.createElement('button');
      fold.type = 'button';
      fold.className = 'upo-fold';
      fold.textContent = this.getAttribute('fold-label') || '這則留言因評價過低已被摺疊，點一下展開';
      m.main.style.display = 'none';
      m.el.classList.add('is-dim');
      m.el.insertBefore(fold, m.grip || null);
      fold.addEventListener('click', () => { fold.remove(); m.main.style.display = ''; });
    }

    /* 內容超出螢幕時，依 auto-scroll 決定是否捲動到新出現的內容（預設不捲動） */
    _reveal(el) {
      if (!el || !bool(this.getAttribute('auto-scroll'), false)) return;
      const r = el.getBoundingClientRect();
      if (r.top >= 0 && r.bottom <= window.innerHeight) return;
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
      const colors = ['#FF2E63', '#FF91D7', '#C394CD', '#EF6661', '#FFA987'];
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

    /* ---------- 特效：stamp-fx、note-fx ---------- */
    _runFx(m, runId, instant) {
      m.main.classList.add('upo-fxl');
      const r = new UpoFx.Run({ rate: () => this.rate, instant, detached: instant, hold: this._paused, cancel: CANCEL });
      this._fxRuns.add(r);
      const ctx = {
        layer: m.main, scope: m.text, shake: m.bubble, live: this._fxLive,
        accent: color(this.getAttribute('examiner-color')) || '#51DBCF',
        onStep: () => { if (!instant) this._reveal(m.el); },
        /* 評語的可用範圍：整個 ui-post 外框，座標相對於這則留言 */
        bounds: () => { const b = this._box.getBoundingClientRect(), l = m.main.getBoundingClientRect(); return { x: b.left - l.left, y: b.top - l.top, w: b.width, h: b.height }; }
      };
      /* 等留言進場動畫結束再量位置 */
      const p = (instant ? Promise.resolve() : r.sleep(380)).then(() => UpoFx.play(r, m.fx, ctx));
      return p.then(() => { this._fxRuns.delete(r); }, (e) => { this._fxRuns.delete(r); if (runId !== this._run || e === CANCEL) throw CANCEL; throw e; });
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
  var COLORS = { shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#C394CD', salmon:'#FFC88A' };
  var css = [];
  Object.keys(COLORS).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[k] + '}'); });
  var s = document.createElement('style'); s.id = 'ui-color-tags'; s.textContent = css.join('\n');
  (document.head || document.documentElement).appendChild(s);
  if (typeof window !== 'undefined' && !window.UiColorTags) { window.UiColorTags = { colors: COLORS }; }
})();
