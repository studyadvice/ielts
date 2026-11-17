(() => {
  'use strict';
  if (customElements.get('ui-stream')) return;

  const PALETTE = { base:'#0C0D0C', shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#C394CD', salmon:'#FFC88A', 'bg-alternative':'#3B2A20' };
  const color = v => { if (!v) return ''; const t = String(v).trim(); return PALETTE[t.toLowerCase()] || t; };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const fs = v => /^\d*\.?\d+$/.test(String(v)) ? v + 'rem' : v;

  const DEFAULTS = {
    /* 模式 */ mode: '', layout: '', splitLabels: '',
    /* 畫面區 */ stage: '', stageWidth: 60, stageStart: '',
    /* 播放 */ autoplay: false, speed: 30, delay: 600, start: 0, loop: false, autoScroll: true, scrollSpace: 48, typeAll: false, step: false,
    /* 控制列 */ controls: false, controlsPosition: 'top', counter: true, progress: false, labels: '播放,暫停,下一則,重播', speedControl: false,
    /* 版面 */ height: 0, gap: 14, gapSame: -1, gapSystem: -1, padding: 16, bubbleWidth: 78, bubbleRadius: 12, bubblePadding: '10px 14px', lineHeight: 1.6,
               fontSize: '1rem', metaSize: '0.75rem', bordered: true, borderWidth: 1, bubbleBorderWidth: 0, textAlign: '', avatar: true, avatarSize: 36, avatarPosition: 'top', avatarRepeat: 'all',
    /* 標題 */ titleSize: '1.2rem', titleWeight: 700, titleColor: 'violet',
    /* 色彩 */ accent: 'key', borderColor: 'bg-alternative', textColor: 'vanilla', background: 'base', markColor: '',
               teacherColor: 'key', studentColor: 'violet', systemColor: 'gray', pauseColor: 'yellow',
    /* 動畫與暫停 */ animation: 'slide', cursor: true, typingIndicator: false, pauseIcon: 'hand-index-thumb', pauseText: '點一下繼續', pauseStyle: 'button'
  };
  const CFG = Object.assign({}, DEFAULTS, window.UiStreamConfig || {});

  /* ── 內建角色 ── side = 氣泡靠哪邊；dataStyle = filled | outline | dashed | double | notch | callout */
  const BUILTIN_ROLES = {
    teacher: { color: 'teacherColor', icon: 'mortarboard-fill', side: 'right', dataStyle: 'filled' },
    student: { color: 'studentColor', icon: 'person-fill', side: 'left', dataStyle: 'outline' },
    system:  { color: 'systemColor', icon: '', side: 'center', dataStyle: 'dashed' }
  };

  const CSS = `
ui-stream{display:block;color:${PALETTE.shell};font-size:var(--us-fs);}
ui-stream:not([data-ready]){visibility:hidden;}
ui-stream .us-title{font-size:var(--us-tfs);font-weight:var(--us-tfw);color:var(--us-tc);margin:0 0 12px 0;}
ui-stream .us-wrap{position:relative;border:var(--us-wbw,1px) solid var(--us-border);border-radius:10px;background:var(--us-bg);display:flex;flex-direction:column;overflow:hidden;}
ui-stream .us-wrap.us-noborder{border:0;border-radius:0;}
ui-stream .us-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--us-border);}
ui-stream .us-wrap.us-cbottom .us-bar{order:9;border-bottom:0;border-top:1px solid var(--us-border);}
ui-stream .us-bar button,ui-stream .us-bar select{background:transparent;border:1px solid var(--us-accent);color:var(--us-accent);border-radius:6px;padding:2px 10px;font-size:0.85rem;cursor:pointer;line-height:1.6;}
ui-stream .us-bar button:hover,ui-stream .us-bar button.on{background:var(--us-accent);color:${PALETTE.base};}
ui-stream .us-bar button:disabled,ui-stream .us-bar button:disabled:hover{background:transparent;border-color:${PALETTE.gray};color:${PALETTE.gray};cursor:not-allowed;opacity:.5;}
ui-stream .us-bar select option{background:${PALETTE.base};color:${PALETTE.shell};}
ui-stream .us-bar .us-count{margin-left:auto;font-size:0.8rem;color:${PALETTE.gray};font-variant-numeric:tabular-nums;}
ui-stream .us-prog{height:3px;background:var(--us-border);}
ui-stream .us-prog i{display:block;height:100%;width:0;background:var(--us-accent);transition:width .3s;}
ui-stream .us-feed{flex:1 1 auto;overflow:auto;padding:var(--us-pad);display:flex;flex-direction:column;scroll-behavior:smooth;}
ui-stream .us-feed > *{margin:var(--us-mt,0) 0 0 0;}
ui-stream .us-feed.us-hasfx{overflow-x:hidden;}
ui-stream .us-feed > :first-child{margin-top:0;}
/* 固定高度時，內容流底部留白（scroll-space），捲到底時最後一行下方仍有空間 */
ui-stream .us-wrap.us-fixed .us-feed::after{content:'';display:block;flex:0 0 var(--us-ss);min-height:var(--us-ss);}
ui-stream .us-msg{display:flex;gap:10px;max-width:var(--us-bw);opacity:0;transition:opacity .35s,transform .35s;}
ui-stream[avatar-position="bottom"] .us-msg{align-items:flex-end;}
ui-stream[animation="slide"] .us-msg.us-left{transform:translateX(-24px);}
ui-stream[animation="slide"] .us-msg.us-right{transform:translateX(24px);}
ui-stream[animation="slide"] .us-msg.us-center{transform:translateY(12px);}
ui-stream[animation="pop"] .us-msg{transform:scale(0.9);}
ui-stream .us-msg.us-right{align-self:flex-end;flex-direction:row-reverse;}
ui-stream .us-msg.us-center{align-self:center;max-width:90%;}
ui-stream .us-feed .us-msg.on{opacity:1;transform:none;}
ui-stream .us-avatar{flex:0 0 var(--us-av);width:var(--us-av);height:var(--us-av);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:calc(var(--us-av) * 0.5);color:${PALETTE.base};background:var(--us-c);overflow:hidden;}
ui-stream .us-avatar img{width:100%;height:100%;object-fit:cover;}
ui-stream .us-avatar .us-ini{font-size:calc(var(--us-av) * 0.38);font-weight:700;line-height:1;letter-spacing:0;}
ui-stream .us-avatar.us-av-blank{visibility:hidden;}
ui-stream .us-body{min-width:0;}
ui-stream .us-meta{font-size:var(--us-ms);color:${PALETTE.gray};margin:0 0 4px 0;display:flex;gap:8px;align-items:baseline;}
ui-stream .us-right .us-meta{justify-content:flex-end;}
ui-stream .us-meta b{color:var(--us-c);font-weight:700;}
ui-stream .us-badge{font-size:0.7rem;font-weight:700;border-radius:999px;padding:0 8px;background:var(--us-badge,var(--us-c));color:${PALETTE.base};}
ui-stream .us-bubble{border:var(--us-bbw,1px) solid var(--us-c);border-radius:var(--us-br);padding:var(--us-bp);line-height:var(--us-lh);color:var(--us-rt,var(--us-text));background:var(--us-bg);}
ui-stream .us-bubble > :last-child{margin-bottom:0;}
ui-stream .us-filled .us-bubble{background:var(--us-c);color:var(--us-rt,${PALETTE.base});}
ui-stream .us-dashed .us-bubble{border-style:dashed;color:var(--us-rt,${PALETTE.shell});font-size:inherit;text-align:center;}
/* double：雙線框 */
ui-stream .us-double .us-bubble{border-style:double;border-width:var(--us-bbw,4px);}
/* notch：切角框。氣泡靠左切右上角、靠右切左上角；切角大小沿用 bubble-radius。外層填邊框色，內層用 ::before 填底色 */
ui-stream .us-notch .us-bubble{position:relative;isolation:isolate;border:0;border-radius:0;background:var(--us-c);
  --cut:max(var(--us-br),6px);--nb:var(--us-bbw,1.5px);
  clip-path:polygon(0 0,calc(100% - var(--cut)) 0,100% var(--cut),100% 100%,0 100%);}
ui-stream .us-notch .us-bubble::before{content:'';position:absolute;inset:var(--nb);z-index:-1;
  background:color-mix(in srgb,var(--us-c) 26%,var(--us-bg));
  clip-path:polygon(0 0,calc(100% - var(--cut) + var(--nb) * 0.586) 0,100% calc(var(--cut) - var(--nb) * 0.586),100% 100%,0 100%);}
ui-stream .us-right.us-notch .us-bubble{clip-path:polygon(var(--cut) 0,100% 0,100% 100%,0 100%,0 var(--cut));}
ui-stream .us-right.us-notch .us-bubble::before{clip-path:polygon(calc(var(--cut) - var(--nb) * 0.586) 0,100% 0,100% 100%,0 100%,0 calc(var(--cut) - var(--nb) * 0.586));}
/* callout：粗框，外側另有一條分離的直線，直線上再拉出一條折線引線 */
ui-stream .us-callout .us-bubble{position:relative;border-width:var(--cb);border-radius:0;margin:0 0 0 78px;--cb:var(--us-bbw,3px);}
ui-stream .us-callout .us-bubble::before,ui-stream .us-callout .us-bubble::after{content:'';position:absolute;}
ui-stream .us-callout .us-bubble::before{top:calc(-1 * var(--cb));bottom:calc(-1 * var(--cb));left:calc(-2 * var(--cb) - 12px);width:var(--cb);background:var(--us-c);}
/* 引線：水平段從直線拉出，斜段指向頭像。頭像在上（預設）時往左上，avatar-position="bottom" 時往左下；靠右時鏡像 */
ui-stream .us-callout .us-bubble::after{top:-6px;left:calc(-2 * var(--cb) - 44px);width:calc(32px + var(--cb));height:36px;box-sizing:border-box;
  border-bottom:var(--cb) solid var(--us-c);border-left:var(--cb) solid var(--us-c);transform-origin:bottom left;transform:skewX(40deg);}
ui-stream .us-right.us-callout .us-bubble{margin:0 78px 0 0;}
ui-stream .us-right.us-callout .us-bubble::before{left:auto;right:calc(-2 * var(--cb) - 12px);}
ui-stream .us-right.us-callout .us-bubble::after{left:auto;right:calc(-2 * var(--cb) - 44px);border-left:0;border-right:var(--cb) solid var(--us-c);
  transform-origin:bottom right;transform:skewX(-40deg);}
ui-stream[avatar-position="bottom"] .us-callout .us-bubble::after{top:auto;bottom:-6px;border-bottom:0;border-top:var(--cb) solid var(--us-c);
  transform-origin:top left;transform:skewX(-40deg);}
ui-stream[avatar-position="bottom"] .us-right.us-callout .us-bubble::after{transform-origin:top right;transform:skewX(40deg);}
ui-stream[mark-color] .us-bubble mark{background:var(--us-mark);color:${PALETTE.base};}
ui-stream .us-hl .us-bubble{animation:us-hl 0.7s ease 3;}
@keyframes us-hl{0%,100%{box-shadow:0 0 0 0 var(--us-accent);}50%{box-shadow:0 0 0 4px var(--us-accent);}}
ui-stream .us-ch{display:none;}
ui-stream .us-ch.on{display:inline;}
ui-stream .us-cursor{display:inline-block;width:2px;height:1em;background:currentColor;vertical-align:-2px;margin:0 0 0 2px;animation:us-blink .8s steps(1) infinite;}
@keyframes us-blink{50%{opacity:0;}}
ui-stream .us-dots{display:inline-flex;gap:4px;align-items:center;height:1.6em;}
ui-stream .us-dots i{width:7px;height:7px;border-radius:50%;background:currentColor;animation:us-dot 1s infinite;}
ui-stream .us-dots i:nth-child(2){animation-delay:.2s;}
ui-stream .us-dots i:nth-child(3){animation-delay:.4s;}
@keyframes us-dot{0%,80%,100%{transform:translateY(0);opacity:0.4;}40%{transform:translateY(-4px);opacity:1;}}
ui-stream .us-pause{align-self:center;border:1px solid var(--us-pc);color:var(--us-pc);border-radius:999px;padding:6px 18px;font-size:0.9rem;cursor:pointer;background:var(--us-bg);}
ui-stream .us-pause:hover{background:var(--us-pc);color:${PALETTE.base};}
ui-stream .us-pause i{margin:0 6px 0 0;}
ui-stream .us-overlay{position:absolute;inset:0;background:var(--us-bg);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:3;}
ui-stream .us-overlay .us-pause{font-size:1.1rem;padding:12px 28px;margin:0;}
ui-stream .us-reveal{border:1px dashed var(--us-accent);border-radius:8px;padding:10px 14px;color:var(--us-text);align-self:stretch;}
ui-stream .us-reveal > :last-child{margin-bottom:0;}
/* ── layout="flat"：平鋪式。全部靠左、沒有氣泡框，連續發言合併；system 變成左邊有色條的引用區塊 ── */
ui-stream[layout="flat"] .us-msg{max-width:100%;}
ui-stream[layout="flat"] .us-avatar{border-radius:8px;}
ui-stream[layout="flat"] .us-avatar.us-av-blank{height:0;}
ui-stream[layout="flat"] .us-meta{margin:0 0 2px 0;}
ui-stream[layout="flat"] .us-meta b{font-size:1.2em;}
ui-stream .us-plain .us-bubble{border:0;border-radius:0;background:none;padding:0;color:var(--us-rt,var(--us-text));}
ui-stream[layout="flat"] .us-feed > .us-fnote,ui-stream[layout="flat"] .us-feed > .us-reveal{margin-left:var(--us-ind);}
ui-stream .us-fnote{align-self:stretch;max-width:none;}
ui-stream .us-fnote .us-bubble{border:0;border-left:4px solid var(--us-c);border-radius:0;background:color-mix(in srgb,var(--us-c) 12%,var(--us-bg));color:var(--us-rt,var(--us-text));}
/* ── layout="tail"：尾巴氣泡。實心大圓角、不顯示頭像，連續發言只有最後一則有尾巴；system 變成置中小字 ── */
ui-stream .us-tbub .us-bubble{position:relative;border:0;background:var(--us-c);color:var(--us-rt,${PALETTE.base});border-radius:calc(var(--us-br) + 6px);}
ui-stream .us-tbub .us-meta{margin:0 12px 4px 12px;}
ui-stream .us-tbub.us-left.us-tend .us-bubble{border-bottom-left-radius:4px;}
ui-stream .us-tbub.us-right.us-tend .us-bubble{border-bottom-right-radius:4px;}
ui-stream .us-tbub.us-tend .us-bubble::after{content:'';position:absolute;bottom:0;width:10px;height:12px;background:var(--us-c);}
ui-stream .us-tbub.us-left.us-tend .us-bubble::after{left:-7px;clip-path:polygon(100% 0,100% 100%,0 100%);}
ui-stream .us-tbub.us-right.us-tend .us-bubble::after{right:-7px;clip-path:polygon(0 0,100% 100%,0 100%);}
ui-stream .us-tsys .us-bubble{border:0;background:none;padding:2px 0;color:var(--us-rt,var(--us-c));font-size:0.85em;text-align:center;}
/* ── layout="split"：雙欄對照。left 進左欄、right 進右欄、center 橫跨兩欄；中間一條分隔線 ── */
ui-stream .us-shead{display:grid;grid-template-columns:1fr 1fr;column-gap:20px;padding:12px var(--us-pad) 0 var(--us-pad);}
ui-stream .us-shead div{font-size:0.85rem;font-weight:700;color:var(--us-hc);border-bottom:2px solid var(--us-hc);padding:0 0 6px 0;}
ui-stream[layout="split"] .us-feed{background-image:linear-gradient(var(--us-border),var(--us-border));background-size:1px 100%;background-position:center top;background-repeat:no-repeat;background-attachment:local;}
ui-stream[layout="split"] .us-msg.us-left,ui-stream[layout="split"] .us-msg.us-right{width:calc(50% - 10px);max-width:none;}
ui-stream[layout="split"] .us-msg.us-right{flex-direction:row;}
ui-stream[layout="split"] .us-right .us-meta{justify-content:flex-start;}
ui-stream[layout="split"] .us-body{flex:1 1 auto;}
ui-stream[layout="split"] .us-msg.us-center{align-self:stretch;max-width:none;}
ui-stream[layout="split"] .us-center .us-bubble,ui-stream[layout="split"] .us-reveal{background:var(--us-bg);}
/* ── stage：外框裡切出一塊畫面區，訊息出現時切換成該則指定的圖片或 template ── */
ui-stream .us-main{display:flex;flex:1 1 auto;min-height:0;}
ui-stream .us-main.us-stage-r{flex-direction:row-reverse;}
ui-stream .us-col{flex:1 1 auto;min-width:0;min-height:0;display:flex;flex-direction:column;}
ui-stream .us-col .us-feed{min-height:0;}
ui-stream .us-stage{flex:0 0 var(--us-stw);box-sizing:border-box;min-width:0;min-height:0;padding:var(--us-pad);border-right:1px solid var(--us-border);display:flex;overflow:auto;color:var(--us-text);}
ui-stream .us-stage-r .us-stage{border-right:0;border-left:1px solid var(--us-border);}
ui-stream .us-stage-in{margin:auto;max-width:100%;}
ui-stream .us-stage-in > :last-child{margin-bottom:0;}
ui-stream .us-stage-in.us-st-img{align-self:stretch;width:100%;margin:0;display:flex;align-items:center;justify-content:center;}
ui-stream .us-stage-in.us-st-img img{display:block;max-width:100%;max-height:100%;object-fit:contain;border-radius:6px;}
ui-stream .us-st-fade{animation:us-stfade .4s ease;}
@keyframes us-stfade{from{opacity:0;}to{opacity:1;}}
ui-stream .us-err{color:${PALETTE.red};border:1px solid ${PALETTE.red};border-radius:8px;padding:8px 12px;font-size:0.9rem;}
`;
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

  /* ── 特效：stamp-fx（蓋章）、note-fx（評語）。寫在訊息裡面，訊息出現後依序執行。
     暫停、倍速、重播都會影響特效；start="with" 與前一個特效同時開始，delay 延後開始（毫秒）。
     target 省略時作用在這則訊息的內容，搭配 text（與 nth）可指定其中一段文字 ── */
  const UsFx = (() => {
    const CANCEL = { cancelled: true, fx: true };
    const TAGS = 'stamp-fx, note-fx';
    const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
    const len = (v) => { if (v == null || v === '') return null; const s = String(v).trim(); return /^-?\d+(\.\d+)?$/.test(s) ? s + 'px' : s; };
    const col = (v, d) => color(v) || d;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    const CSS = `
ui-stream stamp-fx,ui-stream note-fx{display:none;}
ui-stream .us-fxl{position:relative;}
ui-stream .us-fxnote{position:absolute;z-index:2;width:max-content;box-sizing:border-box;padding:8px 12px;border:1px solid;border-radius:8px;line-height:1.5;text-align:left;font-weight:400;
  font-family:system-ui,"Microsoft JhengHei",sans-serif;}
ui-stream .us-fxtip{position:absolute;width:10px;height:10px;box-sizing:border-box;border:0 solid;transform:rotate(45deg);}
ui-stream .us-fxstamp{position:absolute;left:0;top:0;z-index:2;box-sizing:border-box;padding:3px;border-style:solid;white-space:nowrap;line-height:1.2;
  -webkit-mask-size:100% 100%;mask-size:100% 100%;font-weight:700;pointer-events:none;}
ui-stream .us-fxstamp-in{display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:100%;height:100%;}
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
      const span = document.createElement('span'); span.className = 'us-fxsub';
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
      nt.className = 'us-fxnote';
      nt.innerHTML = el.innerHTML;
      Object.assign(nt.style, { color: fg, background: bg, borderColor: bc, fontSize: len(el.getAttribute('font-size')) || '1rem', maxWidth: len(el.getAttribute('max-width')) || '320px', visibility: 'hidden' });
      const tip = document.createElement('div');
      tip.className = 'us-fxtip';
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
      s.className = 'us-fxstamp';
      Object.assign(s.style, { color: c, borderColor: c, borderWidth: (bw + bleed * 1.2) + 'px', borderRadius: radius, fontSize: size });
      if (el.getAttribute('font-family')) s.style.fontFamily = el.getAttribute('font-family');
      const inn = document.createElement('div');
      inn.className = 'us-fxstamp-in';
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

  /* 把內容裡每個字包成 span，逐字顯示時 HTML 標籤（mark、c-key 等）會跟著出現 */
  function wrapChars(root) {
    const spans = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const texts = []; while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(t => {
      const frag = document.createDocumentFragment();
      [...t.textContent].forEach(ch => { const s = el('span', 'us-ch', ch); frag.append(s); spans.push(s); });
      t.replaceWith(frag);
    });
    return spans;
  }
  const cloneSource = id => {
    const src = document.getElementById(id);
    if (!src) return el('span', 'us-err', `找不到 #${id}`);
    if (src.content) return src.content.cloneNode(true);
    const c = src.cloneNode(true); c.removeAttribute('id'); c.hidden = false; c.style.display = ''; return c;
  };

  class UiStream extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this._opt = {};
      Object.keys(DEFAULTS).forEach(k => {
        const attr = k.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
        if (!this.hasAttribute(attr)) { this._opt[k] = CFG[k]; return; }
        const v = this.getAttribute(attr);
        this._opt[k] = typeof DEFAULTS[k] === 'boolean' ? v !== 'false' : typeof DEFAULTS[k] === 'number' ? num(v, CFG[k]) : v;
      });
      const lay = String(this._opt.layout || '').trim().toLowerCase();
      this._layout = ['flat', 'tail', 'split'].includes(lay) ? lay : '';
      if (this._layout) this.setAttribute('layout', this._layout); else this.removeAttribute('layout');
      /* flat、tail 沒寫 avatar-repeat 時，連續發言預設合併（等同 first） */
      this._repSet = this.hasAttribute('avatar-repeat') || !!(window.UiStreamConfig && 'avatarRepeat' in window.UiStreamConfig);
      if (String(this._opt.mode).toLowerCase() === 'live') { this._live = true; Object.assign(this._opt, { controls: false, loop: false, autoplay: false, start: 0 }); }
      ['animation', 'avatar-position'].forEach(a => { const k = a.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); if (!this.hasAttribute(a)) this.setAttribute(a, this._opt[k]); });
      if (this._opt.markColor && !this.hasAttribute('mark-color')) this.setAttribute('mark-color', this._opt.markColor);
      if (!this._opt.markColor) this.removeAttribute('mark-color');

      this._roles = {};
      Object.entries(BUILTIN_ROLES).forEach(([n, r]) => { this._roles[n] = Object.assign({}, r, { color: color(this._opt[r.color]) }); });
      this.querySelectorAll(':scope > stream-role').forEach(r => this._addRole(r.getAttribute('name'), { color: r.getAttribute('color'), icon: r.getAttribute('icon'), side: r.getAttribute('side'), dataStyle: r.getAttribute('data-style'), label: r.getAttribute('label'), image: r.getAttribute('image'), initials: r.getAttribute('initials'), textColor: r.getAttribute('text-color'), textAlign: r.getAttribute('text-align') }));
      (this._pendingRoles || []).forEach(([n, r]) => this._addRole(n, r)); this._pendingRoles = null;

      this._title = this.getAttribute('title'); this.removeAttribute('title');
      this._rate = 1;
      const src = this.getAttribute('src'), dataId = this.getAttribute('data-id');
      if (dataId) { this._fromJSON(window[dataId]); this._build(); }
      else if (src) { fetch(src).then(r => r.json()).then(j => { this._fromJSON(j); this._build(); }).catch(e => { this.innerHTML = ''; this.appendChild(el('div', 'us-err', '[ui-stream] 讀取 src 失敗：' + e.message)); this.setAttribute('data-ready', ''); }); }
      else { this._fromMarkup(); this._build(); }
    }

    _addRole(name, r) {
      if (!name) return;
      r = r || {}; name = String(name).toLowerCase();
      const base = this._roles[name] || { icon: 'person-fill', side: 'left', dataStyle: 'outline' };
      this._roles[name] = { color: r.color ? color(r.color) : (base.color || PALETTE.shell), icon: r.icon != null ? r.icon : base.icon, side: r.side || base.side, dataStyle: r.dataStyle || base.dataStyle, label: r.label || base.label, image: r.image || base.image, initials: r.initials || base.initials, textColor: r.textColor ? color(r.textColor) : base.textColor, textAlign: r.textAlign || base.textAlign };
    }
    _normItem(d) {
      const n = Object.assign({ from: 'student', name: '', time: '', typed: false, html: '' }, d, { from: (d.from || 'student').toLowerCase(), html: d.html != null ? d.html : (d.text || '') });
      if (n.typed === 'false') n.typed = false;
      if (!n.fx) { const x = UsFx.extract(n.html); n.html = x.html; n.fx = x.fx; }
      return n;
    }
    _fromMarkup() {
      this._src = [...this.querySelectorAll(':scope > stream-item')].map(it => {
        const srcId = it.getAttribute('source'), srcEl = srcId && document.getElementById(srcId);
        const html = srcEl ? (srcEl.content ? [...srcEl.content.childNodes].map(n => n.outerHTML || n.textContent).join('') : srcEl.innerHTML) : it.innerHTML;
        return this._normItem({
          from: it.getAttribute('from'), name: it.getAttribute('name'), time: it.getAttribute('time'),
          icon: it.getAttribute('icon'), image: it.getAttribute('image'), initials: it.getAttribute('initials'), side: it.getAttribute('side'), dataStyle: it.getAttribute('data-style'), badge: it.getAttribute('badge'), badgeColor: it.getAttribute('badge-color'), color: it.getAttribute('color'),
          typed: it.hasAttribute('typed'), speed: it.getAttribute('speed'), delay: it.getAttribute('delay'), gap: it.getAttribute('gap'), highlight: it.hasAttribute('highlight'),
          pause: it.getAttribute('pause'), reveal: it.getAttribute('reveal'), revealTarget: it.getAttribute('reveal-target'), textAlign: it.getAttribute('text-align'),
          stage: it.getAttribute('stage'),
          html: srcId && !srcEl ? `<span class="us-err">找不到 #${srcId}</span>` : html
        });
      });
    }
    _fromJSON(j) {
      if (!j) { this._src = []; return; }
      const items = Array.isArray(j) ? j : (j.items || []);
      if (j && j.roles) Object.entries(j.roles).forEach(([n, r]) => this._addRole(n, r));
      this._src = items.map(d => this._normItem(d));
    }

    _build() {
      const o = this._opt;
      this.innerHTML = '';
      const sv = (k, v) => this.style.setProperty(k, v);
      sv('--us-fs', fs(o.fontSize)); sv('--us-ms', fs(o.metaSize));
      sv('--us-pad', o.padding + 'px'); sv('--us-bw', o.bubbleWidth + '%'); sv('--us-br', o.bubbleRadius + 'px'); sv('--us-bp', o.bubblePadding); sv('--us-lh', o.lineHeight); sv('--us-av', o.avatarSize + 'px');
      sv('--us-accent', color(o.accent)); sv('--us-border', color(o.borderColor)); sv('--us-text', color(o.textColor)); sv('--us-pc', color(o.pauseColor)); sv('--us-bg', color(o.background));
      if (o.markColor) sv('--us-mark', color(o.markColor));
      sv('--us-tfs', fs(o.titleSize)); sv('--us-tfw', o.titleWeight); sv('--us-tc', color(o.titleColor));
      sv('--us-wbw', Math.max(0, o.borderWidth) + 'px');
      sv('--us-ind', o.avatar ? (o.avatarSize + 10) + 'px' : '0px');
      sv('--us-stw', Math.min(90, Math.max(10, num(o.stageWidth, 60))) + '%');
      if (o.bubbleBorderWidth > 0) sv('--us-bbw', o.bubbleBorderWidth + 'px');
      if (this._title) this.appendChild(el('div', 'us-title', this._title));
      const wrap = el('div', 'us-wrap' + (o.bordered ? '' : ' us-noborder') + (o.controlsPosition === 'bottom' ? ' us-cbottom' : ''));
      this._wrap = wrap;
      if (o.height) { wrap.style.height = o.height + 'px'; wrap.classList.add('us-fixed'); }
      sv('--us-ss', Math.max(0, o.scrollSpace) + 'px');
      if (this._live) wrap.classList.add('us-live');
      if (o.controls) {
        const bar = el('div', 'us-bar'); const L = String(o.labels).split(',');
        const mk = (ic, t, fn) => { const b = el('button'); b.innerHTML = `<i class="bi bi-${ic}"></i> ${t || ''}`.trim(); b.onclick = fn; return b; };
        this._btnPlay = mk('play-fill', L[0], () => this.toggle());
        this._btnNext = mk('skip-end-fill', L[2], () => this.next());
        bar.append(this._btnPlay, this._btnNext, mk('arrow-counterclockwise', L[3], () => this.replay()));
        this._labels = L;
        if (o.speedControl) {
          const sel = el('select');
          [['0.5', '0.5x'], ['1', '1x'], ['1.5', '1.5x'], ['2', '2x']].forEach(([v, t]) => { const op = el('option', null, t); op.value = v; if (v === '1') op.selected = true; sel.append(op); });
          sel.onchange = () => { this._rate = parseFloat(sel.value); };
          bar.append(sel);
        }
        if (o.counter) { this._count = el('span', 'us-count'); bar.append(this._count); }
        wrap.append(bar);
      }
      if (o.progress) { this._prog = el('div', 'us-prog'); this._prog.append(el('i')); wrap.append(this._prog); }
      /* stage="left"（或只寫 stage）／stage="right"：外框裡切出畫面區，內容流放另一邊 */
      const ss = String(o.stage || '').trim().toLowerCase();
      const stSide = ss === 'right' ? 'right' : (ss === 'left' || (ss === '' && this.hasAttribute('stage'))) ? 'left' : '';
      let host = wrap; this._stage = null;
      if (stSide) {
        const main = el('div', 'us-main' + (stSide === 'right' ? ' us-stage-r' : '')), col = el('div', 'us-col');
        this._stage = el('div', 'us-stage'); main.append(this._stage, col); wrap.append(main); host = col;
      }
      if (this._layout === 'split' && o.splitLabels) {
        /* split-labels="Examiner:playful, Candidate:blue"：左右兩欄的標題，冒號後是顏色 */
        const head = el('div', 'us-shead');
        String(o.splitLabels).split(',').slice(0, 2).forEach(t => {
          const [txt, c] = t.split(':').map(x => x.trim()); const h = el('div', null, txt || '');
          h.style.setProperty('--us-hc', color(c) || color(o.textColor)); head.append(h);
        });
        host.append(head);
      }
      this._feed = el('div', 'us-feed'); host.append(this._feed); this.appendChild(wrap);
      this._stageSet(o.stageStart, false);
      this._fxRuns = new Set(); this._fxLive = []; this._fxNextReq = false;
      if (window.ResizeObserver) { this._fxRO = new ResizeObserver(() => UsFx.relayout(this._fxLive)); this._fxRO.observe(this._feed); }
      this.setAttribute('data-ready', '');
      this._i = 0; this._playing = false; this._typing = null; this._prev = null;
      this._update();
      if (this._live) { while (this._i < this._src.length) this._show(true, true); this._update(); return; }
      if (o.start > 0) this.goto(o.start);
      if (o.autoplay) this.play();
    }

    /* ── 公開方法 ── */
    play() {
      /* 特效播放中：只繼續特效，播完後照常往下 */
      if (this._fxBusy()) { if (!this._playing) { this._playing = true; this._update(); } this._fxRuns.forEach(r => r.resume()); return; }
      if (this._playing || this._i >= this._src.length) return; this._playing = true; this._update(); this._show(false); }
    pause() { this._playing = false; clearTimeout(this._t); if (this._typing) this._typing.finish(); if (this._fxRuns) this._fxRuns.forEach(r => r.pause()); this._update(); }
    toggle() { this._playing ? this.pause() : this.play(); }
    next() {
      if (this._doneSent && !this._opt.loop) return;
      /* 特效播放中：先把特效快轉完成，再顯示下一則 */
      if (this._fxBusy()) { this.pause(); this._fxNextReq = true; this._fxRuns.forEach(r => { if (!r.detached) r.skip(); }); return; }
      this.pause(); this._clearPause(); this._show(true);
    }
    replay() { this.pause(); this._clearPause(); this._fxReset(); this._doneSent = false; this._i = 0; this._prev = null; this._feed.innerHTML = ''; this._stageSet(this._opt.stageStart, false); this._update(); this.play(); }
    finish() { this.pause(); this._clearPause(); this._fxRuns.forEach(r => { r.detached = true; r.skip(); }); while (this._i < this._src.length) this._show(true, true); }
    goto(i) { this.pause(); this._clearPause(); this._fxReset(); this._doneSent = false; this._i = 0; this._prev = null; this._feed.innerHTML = ''; this._stageSet(this._opt.stageStart, false); const n = Math.max(0, Math.min(i, this._src.length)); while (this._i < n) this._show(true, true); this._update(); }
    add(item) { const atEnd = this._i >= this._src.length; this._src.push(this._normItem(item || {})); this._doneSent = false; this._update(); if (atEnd && !this._feed.querySelector('.us-pause') && !this._wrap.querySelector('.us-overlay')) this.play(); return this._src.length; }
    export(format) {
      const msgs = [...this._feed.querySelectorAll('.us-msg')];
      if (format === 'html') return msgs.map(m => m.outerHTML).join('\n');
      return msgs.map(m => { const nm = m.querySelector('.us-meta b'), t = m.querySelector('.us-meta span:not(.us-badge)'); const head = [nm && nm.textContent, t && t.textContent].filter(Boolean).join(' '); return (head ? head + '：' : '') + m.querySelector('.us-bubble').textContent.trim(); }).join('\n');
    }
    /* 從外部註冊或更新角色；opts 鍵名同 stream-role 屬性的駝峰式，例如 dataStyle、textColor */
    addRole(name, opts) { if (!this._roles) { (this._pendingRoles = this._pendingRoles || []).push([name, opts || {}]); return; } this._addRole(name, opts || {}); }
    /* 從外部切換畫面區：值同 stream-item 的 stage */
    setStage(v) { this._stageSet(v, true); }
    hasRole(name) { return !!(this._roles && this._roles[String(name).toLowerCase()]); }
    get live() { return !!this._live; }
    get index() { return this._i; }
    get total() { return this._src.length; }

    _update() {
      if (this._count) this._count.textContent = `${this._i} / ${this._src.length}`;
      if (this._prog) this._prog.firstChild.style.width = (this._src.length ? this._i / this._src.length * 100 : 0) + '%';
      if (this._btnNext) this._btnNext.disabled = !!this._doneSent && !this._opt.loop;
      if (this._btnPlay) { const L = this._labels; this._btnPlay.innerHTML = this._playing ? `<i class="bi bi-pause-fill"></i> ${L[1] || ''}` : `<i class="bi bi-play-fill"></i> ${L[0] || ''}`; this._btnPlay.classList.toggle('on', this._playing); }
    }
    _fxBusy() { return !!this._fxRuns && [...this._fxRuns].some(r => !r.detached); }
    _fxReset() { this._fxRuns.forEach(r => r.cancel()); this._fxRuns.clear(); this._fxLive.length = 0; this._fxNextReq = false; }
    _runFx(d, msg, bub, instant) {
      msg.classList.add('us-fxl'); this._feed.classList.add('us-hasfx');
      const run = new UsFx.Run({ rate: () => this._rate, instant, detached: instant });
      this._fxRuns.add(run);
      const feed = this._feed;
      const ctx = {
        layer: msg, scope: bub, shake: bub, live: this._fxLive, accent: color(this._opt.accent),
        onStep: () => { if (!run.instant) this._scroll(); },
        /* 評語的可用範圍：整個訊息區（含捲動內容），座標相對於這則訊息 */
        bounds: () => { const f = feed.getBoundingClientRect(), m = msg.getBoundingClientRect(); return { x: f.left - m.left, y: f.top - m.top - feed.scrollTop, w: feed.clientWidth, h: feed.scrollHeight }; }
      };
      /* 等訊息進場動畫結束再量位置 */
      const p = (instant ? Promise.resolve() : run.sleep(380)).then(() => UsFx.play(run, d.fx, ctx));
      return p.then(() => { this._fxRuns.delete(run); return run; }, e => { this._fxRuns.delete(run); if (e !== UsFx.CANCEL) console.error(e); throw UsFx.CANCEL; });
    }
    _clearPause() { this._feed.querySelectorAll('.us-pause').forEach(p => p.remove()); this._wrap.querySelectorAll('.us-overlay').forEach(p => p.remove()); }
    _scroll() {
      if (!this._opt.autoScroll) return;
      if (this._opt.height) { this._feed.scrollTop = this._feed.scrollHeight; return; }
      /* 沒設 height：元件往下長，改捲動整個頁面，讓最後一行加上 scroll-space 留在視窗內。
         只有元件目前在畫面上時才捲，避免同頁多個元件搶著捲動 */
      const r = this._wrap.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom <= 0 || r.top >= vh) return;
      /* 用絕對位置計算目標，連續呼叫時不會因平滑捲動尚未結束而累加過頭 */
      const target = Math.round(window.scrollY + r.bottom + Math.max(0, this._opt.scrollSpace) - vh);
      if (target > window.scrollY + 1) window.scrollTo({ top: target, behavior: 'smooth' });
    }
    _ms(v) { return v / this._rate; }
    _gapFor(d, role) {
      const o = this._opt;
      if (d.gap != null && d.gap !== '') return num(d.gap, o.gap);
      const isSys = role.side === 'center', prevSys = this._prev && this._prev.side === 'center';
      if ((isSys || prevSys) && o.gapSystem >= 0) return o.gapSystem;
      const gs = o.gapSame >= 0 ? o.gapSame : (this._layout === 'flat' || this._layout === 'tail' ? 4 : -1);
      if (this._prev && this._prev.from === d.from && this._prev.side === role.side && !isSys && gs >= 0) return gs;
      return o.gap;
    }

    /* 全部播完：只發一次 ui-stream:done，並讓「下一則」失效；replay、goto、loop、add 會重置 */
    _end() {
      if (this._doneSent) { this._update(); return; }
      this._doneSent = true; this._update();
      this.dispatchEvent(new CustomEvent('ui-stream:done', { bubbles: true, detail: { total: this._src.length } }));
    }

    _show(manual, silent) {
      if (this._i >= this._src.length) {
        this._playing = false;
        this._end();
        if (this._opt.loop && !silent) { this._fxReset(); this._doneSent = false; this._i = 0; this._prev = null; this._feed.innerHTML = ''; this._stageSet(this._opt.stageStart, false); this._t = setTimeout(() => this.play(), this._ms(this._opt.delay)); }
        return;
      }
      const d = this._src[this._i], idx = this._i++;
      const role0 = this._roles[d.from] || this._roles.student;
      const lay = this._layout;
      let side = d.side || role0.side;
      if (lay === 'flat' && side !== 'center') side = 'left';
      const role = Object.assign({}, role0, { side, dataStyle: d.dataStyle || role0.dataStyle });
      const c = d.color ? color(d.color) : role.color;
      /* flat、tail 有自己的外觀，data-style 不套用 */
      let look = 'us-' + role.dataStyle;
      if (lay === 'flat') look = side === 'center' ? 'us-fnote' : 'us-plain';
      else if (lay === 'tail') look = side === 'center' ? 'us-tsys' : 'us-tbub';
      const msg = el('div', `us-msg us-${role.side} ${look}`); msg.style.setProperty('--us-c', c);
      msg.style.setProperty('--us-mt', this._gapFor(d, role) + 'px');
      if (role.textColor) msg.style.setProperty('--us-rt', role.textColor);
      if (d.badgeColor) msg.style.setProperty('--us-badge', color(d.badgeColor));
      // 同一人連續發言：avatar-repeat="first" 只在第一則顯示頭像，"last" 只在最後一則顯示（空位保留，對齊不變）
      const same = this._prev && this._prev.from === d.from && this._prev.side === role.side && role.side !== 'center';
      const rep = String((!this._repSet && (lay === 'flat' || lay === 'tail')) ? 'first' : (this._opt.avatarRepeat || 'all')).toLowerCase();
      /* tail：尾巴只留在連續發言的最後一則 */
      if (lay === 'tail' && role.side !== 'center') { if (same && this._prevMsg) this._prevMsg.classList.remove('us-tend'); msg.classList.add('us-tend'); }
      this._prev = { from: d.from, side: role.side };
      if (role.side !== 'center' && this._opt.avatar && lay !== 'tail') {
        const av = el('div', 'us-avatar'); const img = d.image || role.image;
        const ini = d.initials || role.initials;
        if (img) { const im = el('img'); im.src = img; im.alt = d.name || ''; av.append(im); }
        else if (ini) av.append(el('span', 'us-ini', ini));
        else av.innerHTML = `<i class="bi bi-${d.icon || role.icon || 'person-fill'}"></i>`;
        if (same && rep === 'first') av.classList.add('us-av-blank');
        if (same && rep === 'last' && this._prevMsg) { const pa = this._prevMsg.querySelector('.us-avatar'); if (pa) pa.classList.add('us-av-blank'); }
        msg.append(av);
      }
      this._prevMsg = msg;
      const body = el('div', 'us-body');
      const nm = d.name || role.label || '';
      // avatar-repeat 不是 all 時，連續發言只在這一串的第一則顯示名字（時間、徽章照常）
      const showName = nm && !(same && rep !== 'all');
      if (showName || d.time || d.badge) { const m = el('div', 'us-meta'); if (showName) m.append(el('b', null, nm)); if (d.time) m.append(el('span', null, d.time)); if (d.badge) m.append(el('span', 'us-badge', d.badge)); body.append(m); }
      const bub = el('div', 'us-bubble'); body.append(bub); msg.append(body);
      const ta = d.textAlign || role.textAlign || this._opt.textAlign; if (ta) bub.style.textAlign = ta;
      this._feed.append(msg);
      /* 訊息一出現就切換畫面區（不等逐字打完）；沒寫 stage 的訊息不動畫面區 */
      if (this._stage && d.stage != null && d.stage !== '') {
        this._stageSet(d.stage, !silent);
        if (!silent) this.dispatchEvent(new CustomEvent('ui-stream:stage', { bubbles: true, detail: { index: idx, value: d.stage } }));
      }
      if (silent) { bub.innerHTML = d.html; msg.classList.add('on'); if (d.fx && d.fx.length) this._runFx(d, msg, bub, true).catch(() => {}); this._update(); return; }
      requestAnimationFrame(() => { msg.classList.add('on'); this._scroll(); });
      this._update();
      this.dispatchEvent(new CustomEvent('ui-stream:item', { bubbles: true, detail: { index: idx, item: msg, role: d.from } }));

      const after = () => {
        this._typing = null;
        if (d.highlight) msg.classList.add('us-hl');
        if (d.fx && d.fx.length) {
          this._runFx(d, msg, bub, false).then(run => {
            if (run.detached) return;
            const wantNext = this._fxNextReq; this._fxNextReq = false;
            rest();
            if (wantNext && d.pause == null) this._show(true);
          }, () => {});
          return;
        }
        rest();
      };
      const rest = () => {
        if (d.pause != null) {
          this._playing = false; this._update();
          const p = el('button', 'us-pause'); p.innerHTML = `<i class="bi bi-${this._opt.pauseIcon}"></i>${d.pause || this._opt.pauseText}`;
          const go = () => { this._clearPause(); this._reveal(d); this.dispatchEvent(new CustomEvent('ui-stream:resume', { bubbles: true, detail: { index: idx } })); this.play(); };
          if (this._opt.pauseStyle === 'overlay') { const ov = el('div', 'us-overlay'); ov.append(p); ov.onclick = go; const bar = this._wrap.querySelector('.us-bar'); if (bar) ov.style[this._opt.controlsPosition === 'bottom' ? 'bottom' : 'top'] = bar.offsetHeight + 'px'; this._wrap.append(ov); }
          else { p.style.setProperty('--us-mt', this._opt.gap + 'px'); p.onclick = go; this._feed.append(p); this._scroll(); }
          this.dispatchEvent(new CustomEvent('ui-stream:pause', { bubbles: true, detail: { index: idx, text: d.pause } }));
          return;
        }
        this._reveal(d);
        /* 最後一則完成後，若不會自動往下，就直接視為播完，不必再按一次下一則 */
        const last = this._i >= this._src.length && !this._live;
        if (this._opt.step) { this._playing = false; this._update(); if (last) this._end(); return; }
        if (last && !this._playing) { this._end(); return; }
        if (this._playing) this._t = setTimeout(() => this._show(false), this._ms(num(d.delay, this._opt.delay)));
      };
      const typed = (d.typed || this._opt.typeAll) && !manual;
      const startTyping = () => {
        bub.innerHTML = d.html;
        const spans = wrapChars(bub); const cur = this._opt.cursor ? el('span', 'us-cursor') : null; if (cur) bub.append(cur);
        let k = 0; const sp = this._ms(num(d.speed, this._opt.speed));
        const done = () => { spans.forEach(s => s.classList.add('on')); if (cur) cur.remove(); this.dispatchEvent(new CustomEvent('ui-stream:typed', { bubbles: true, detail: { index: idx } })); };
        const tick = () => {
          if (k < spans.length) { spans[k++].classList.add('on'); if (k % 4 === 0) this._scroll(); this._t = setTimeout(tick, sp); }
          else { done(); after(); }
        };
        this._typing = { finish: () => { clearTimeout(this._t); done(); } };
        tick();
      };
      if (typed && this._opt.typingIndicator && role.side !== 'center') {
        bub.innerHTML = '<span class="us-dots"><i></i><i></i><i></i></span>';
        this._typing = { finish: () => { clearTimeout(this._t); bub.innerHTML = d.html; this.dispatchEvent(new CustomEvent('ui-stream:typed', { bubbles: true, detail: { index: idx } })); } };
        this._t = setTimeout(startTyping, this._ms(700));
      } else if (typed) startTyping();
      else { bub.innerHTML = d.html; after(); }
    }
    /* stage 的值：#id → 複製該 template（或元素）的內容；clear → 清空；其他 → 當成圖片網址 */
    _stageSet(v, anim) {
      const box = this._stage; if (!box) return;
      v = v == null ? '' : String(v).trim();
      box.innerHTML = '';
      if (!v || v.toLowerCase() === 'clear') return;
      const inn = el('div', 'us-stage-in');
      if (v[0] === '#') inn.append(cloneSource(v.slice(1)));
      else { inn.classList.add('us-st-img'); const im = el('img'); im.src = v; im.alt = ''; inn.append(im); }
      if (anim) inn.classList.add('us-st-fade');
      box.append(inn);
    }
    _reveal(d) {
      if (!d.reveal) return;
      const content = cloneSource(d.reveal);
      if (d.revealTarget) {
        const tg = document.getElementById(d.revealTarget);
        if (!tg) { const e = el('div', 'us-err', `找不到 reveal-target #${d.revealTarget}`); e.style.setProperty('--us-mt', this._opt.gap + 'px'); this._feed.append(e); return; }
        tg.innerHTML = ''; tg.append(content); tg.hidden = false; tg.classList.remove('d-none'); tg.style.display = '';
        return;
      }
      const box = el('div', 'us-reveal'); box.style.setProperty('--us-mt', this._opt.gap + 'px'); box.append(content);
      this._feed.append(box); this._scroll();
    }
  }
  customElements.define('stream-role', class extends HTMLElement {});
  customElements.define('stream-item', class extends HTMLElement {});
  customElements.define('ui-stream', UiStream);
  window.UiStream = { defaults: DEFAULTS, config: CFG, colors: PALETTE };
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
