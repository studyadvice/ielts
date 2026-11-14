/* =========================================================================
 * <ui-play> 教學錄影用的模擬畫面播放器
 *
 * 結構：
 * <ui-play frame="win" frame-title="Task 2">
 *   <stage-item> 任何 HTML 內容 </stage-item>
 *   <script-item>
 *     <mark-fx target="#s1" text="very good" kind="underline"></mark-fx>
 *     <stamp-fx target="#s1" text="very good" start="with">大錯特錯</stamp-fx>
 *   </script-item>
 * </ui-play>
 *
 * 效果標籤：show-fx、hide-fx、mark-fx、note-fx、stamp-fx、swap-fx、
 *           wait-fx、pause-fx、remove-fx
 * 共用屬性：start（click | with | after）、delay、name、target、text、nth
 * 下一步：next-by（key | click | both），click 為點內容區前進
 * 事件：play-end
 * 方法：el.play()、el.pause()、el.next()、el.rate
 * ========================================================================= */
(function () {
  'use strict';

  const COLORS = {
    base: '#0C0D0C', background: '#0C0D0C', 'bg-alternative': '#3B2A20',
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7',
    red: '#EF6661', green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1',
    violet: '#B484E8', gray: '#86877F', key: '#51DBCF', calm: '#A3C4BC',
    quiet: '#8EA4DE', playful: '#FFA987', urgent: '#FF2E63',
    energetic: '#B6FF00', dreamy: '#DE8EC9'
  };

  function color(v) {
    if (v == null || v === '') return null;
    const k = String(v).trim();
    return COLORS[k.toLowerCase()] || k;
  }
  function len(v) {
    if (v == null || v === '') return null;
    const s = String(v).trim();
    return /^-?\d+(\.\d+)?$/.test(s) ? s + 'px' : s;
  }
  function num(v, def) {
    const n = parseFloat(v);
    return isNaN(n) ? def : n;
  }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seedOf(v, fallback) {
    if (v != null && v !== '') return /^\d+$/.test(v) ? parseInt(v, 10) : hashStr(String(v));
    return hashStr(fallback);
  }

  function colName(i) {
    let s = '';
    i += 1;
    while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); }
    return s;
  }
  function colIndex(letters) {
    let n = 0;
    for (const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n - 1;
  }

  /* ---------------- 樣式 ---------------- */
  const STYLE_ID = 'ui-play-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID) || !document.head) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
ui-play{display:block;width:var(--upl-width,100%);max-width:100%;}
ui-play script-item,ui-play script-item *{display:none !important;}
ui-play .upl{box-sizing:border-box;width:100%;background:var(--upl-bg);color:var(--upl-text);
  border:var(--upl-bw) var(--upl-bs) var(--upl-bc);border-radius:var(--upl-radius);overflow:hidden;}
ui-play .upl *,ui-play .upl *::before,ui-play .upl *::after{box-sizing:border-box;}
ui-play .upl-body{position:relative;display:flex;flex-direction:column;justify-content:var(--upl-valign);
  min-height:var(--upl-min-h);height:var(--upl-h);aspect-ratio:var(--upl-aspect);overflow:hidden;}
ui-play .upl-canvas{position:relative;width:100%;padding:var(--upl-pad);text-align:var(--upl-align);
  font-family:var(--upl-font);font-size:var(--upl-fs);line-height:var(--upl-lh);}
ui-play .upl-under,ui-play .upl-over{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;}
ui-play .upl-under{z-index:0;}
ui-play stage-item{display:block;position:relative;z-index:1;}
ui-play .upl-over{z-index:3;}
ui-play .upl-heads{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2;}
ui-play .upl-over svg{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;}

ui-play .upl-bar{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--upl-bar);color:var(--upl-bar-text);
  font-size:.8125rem;line-height:1.4;font-family:system-ui,"Microsoft JhengHei",sans-serif;user-select:none;}
ui-play .upl-title{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
ui-play .upl-dots{display:flex;gap:8px;flex-shrink:0;}
ui-play .upl-dots span{display:block;width:12px;height:12px;border-radius:50%;}
ui-play .upl.f-mac .upl-bar{display:grid;grid-template-columns:72px minmax(0,1fr) 72px;}
ui-play .upl.f-mac .upl-title{text-align:center;}
ui-play .upl-winbtns{display:flex;gap:20px;flex-shrink:0;padding:0 4px;}
ui-play .upl.f-win .upl-bar{padding:6px 12px;}
ui-play .upl.f-win-classic{padding:3px;background:#C6C7BD;}
ui-play .upl.f-win-classic .upl-bar{padding:4px 4px 4px 8px;font-weight:700;}
ui-play .upl-clbtns{display:flex;gap:2px;flex-shrink:0;}
ui-play .upl-clbtns span{display:flex;align-items:center;justify-content:center;width:22px;height:20px;background:#C6C7BD;color:#0C0D0C;
  border:2px outset #DBEDD8;font-size:.75rem;font-weight:700;line-height:1;}
ui-play .upl.f-win-classic .upl-body{margin-top:3px;border:2px inset #C6C7BD;background:var(--upl-bg);}
ui-play .upl-nav{display:flex;gap:10px;flex-shrink:0;font-size:1rem;}
ui-play .upl-url{flex:1;min-width:0;padding:3px 12px;border-radius:6px;background:var(--upl-bg);color:#86877F;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
ui-play .upl.f-phone .upl-bar{justify-content:space-between;padding:10px 24px 6px;font-weight:700;background:var(--upl-bg);color:var(--upl-text);}
ui-play .upl-notch{width:96px;height:24px;border-radius:12px;background:#000;}
ui-play .upl-batt{display:inline-block;width:24px;height:12px;border:1.5px solid currentColor;border-radius:3px;padding:1px;vertical-align:middle;}
ui-play .upl-batt i{display:block;width:70%;height:100%;background:currentColor;border-radius:1px;}
ui-play .upl.f-paper .upl-canvas{flex:1 1 auto;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent calc(1lh - 1px),var(--upl-rule) calc(1lh - 1px),var(--upl-rule) 1lh);
  background-origin:content-box;background-clip:content-box;}
ui-play .upl.f-paper stage-item :is(p,ul,ol,h1,h2,h3,h4,h5,h6,blockquote){margin:0;}
ui-play .upl.f-paper .upl-canvas::before{content:'';position:absolute;left:40px;top:0;bottom:0;width:var(--upl-mlw);background:var(--upl-mlc);}

ui-play .upl.f-sheet .upl-canvas{flex:1 1 auto;padding:var(--upl-hh) 0 0 var(--upl-rw);
  background-image:linear-gradient(to right,var(--upl-grid) 1px,transparent 1px),linear-gradient(to bottom,var(--upl-grid) 1px,transparent 1px);
  background-size:var(--upl-cw) var(--upl-ch);background-position:var(--upl-rw) var(--upl-hh);}
ui-play .upl.f-sheet stage-item{padding:0 6px;}
ui-play .upl.f-sheet stage-item [cell]{position:absolute;margin:0;padding:0 6px;white-space:nowrap;line-height:var(--upl-ch);}
ui-play .upl-colh,ui-play .upl-rowh{position:absolute;display:flex;background:var(--upl-bar);color:var(--upl-bar-text);overflow:hidden;
  font-family:system-ui,"Segoe UI","Microsoft JhengHei",sans-serif;font-size:.9375rem;line-height:1;}
ui-play .upl-colh{left:var(--upl-rw);top:0;right:0;height:var(--upl-hh);}
ui-play .upl-rowh{left:0;top:var(--upl-hh);bottom:0;width:var(--upl-rw);flex-direction:column;}
ui-play .upl-colh span{flex:0 0 var(--upl-cw);display:flex;align-items:center;justify-content:center;border-right:1px solid var(--upl-hline);}
ui-play .upl-rowh span{flex:0 0 var(--upl-ch);display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--upl-hline);}
ui-play .upl-corner{position:absolute;left:0;top:0;width:var(--upl-rw);height:var(--upl-hh);background:var(--upl-bar);
  border-right:1px solid var(--upl-hline);border-bottom:1px solid var(--upl-hline);}
ui-play .upl-corner i{position:absolute;right:4px;bottom:4px;width:0;height:0;border-left:14px solid transparent;border-bottom:14px solid var(--upl-corner);}

ui-play .upl.f-notebook .upl-bar{align-items:flex-end;gap:16px;padding:10px 16px 0 16px;border-bottom:3px solid var(--upl-tab-active);}
ui-play .upl-tabs{display:flex;align-items:flex-end;gap:4px;flex:1;min-width:0;overflow:hidden;padding-left:6px;}
ui-play .upl-tab{position:relative;isolation:isolate;flex-shrink:0;padding:6px 22px 4px;color:#DBEDD8;font-size:1.125rem;line-height:1.4;white-space:nowrap;}
ui-play .upl-tab::before{content:'';position:absolute;left:0;top:0;right:0;bottom:0;z-index:-1;background:var(--tab-fill);
  border:2px solid var(--tab-c);border-bottom:0;border-radius:8px 8px 0 0;transform:perspective(40px) rotateX(5deg);transform-origin:bottom;}
ui-play .upl-tab.is-active{padding-top:10px;padding-bottom:6px;font-size:1.25rem;}
ui-play .upl-tab.is-add{padding:6px 18px 4px;font-weight:700;--tab-c:#86877F;--tab-fill:#3B2A20;}
ui-play .upl-search{display:flex;align-items:center;gap:8px;flex:0 0 auto;width:var(--upl-search-w);margin-bottom:8px;padding:4px 10px;
  background:var(--upl-bg);border:1px solid #86877F;color:#86877F;font-size:1rem;line-height:1.4;}
ui-play .upl-search span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
ui-play .upl-search i{color:#5DBAE8;}

ui-play[next-by="click" i] .upl:not(.is-ended) .upl-body,ui-play[next-by="both" i] .upl:not(.is-ended) .upl-body{cursor:pointer;user-select:none;}
ui-play .upl.f-draw .upl-bar{flex-direction:column;align-items:stretch;gap:0;padding:0;font-size:1rem;}
ui-play .upl-dmenu{display:flex;align-items:center;gap:4px;padding:6px 12px;background:#0C0D0C;color:#C6C7BD;white-space:nowrap;overflow:hidden;}
ui-play .upl-dmenu span{padding:4px 14px;font-size:1.0625rem;}
ui-play .upl-dmenu i{display:flex;align-items:center;justify-content:center;width:36px;height:30px;font-size:1.125rem;}
ui-play .upl-dmenu i.is-off{color:#86877F;}
ui-play .upl-dmenu b{display:block;width:1px;height:24px;margin:0 4px;background:#86877F;}
ui-play .upl-dribbon{display:flex;align-items:stretch;padding:8px 0 6px;overflow:hidden;}
ui-play .upl-dgrp{display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:6px;flex-shrink:0;padding:0 16px;border-right:1px solid #86877F;}
ui-play .upl-dgrp:last-child{border-right:0;}
ui-play .upl-dgrp > span{font-size:.9375rem;color:#C6C7BD;white-space:nowrap;}
ui-play .upl-dgrid{display:grid;grid-auto-flow:column;grid-template-rows:repeat(2,32px);gap:4px 6px;align-items:center;}
ui-play .upl-dic{display:flex;align-items:center;justify-content:center;gap:2px;min-width:36px;height:32px;border:1px solid transparent;border-radius:4px;font-size:1.125rem;color:#C6C7BD;}
ui-play .upl-dic small{font-size:.625rem;color:#C6C7BD;}
ui-play .upl-dic.is-big{flex-direction:column;width:56px;height:68px;font-size:1.5rem;grid-row:span 2;}
ui-play .upl-dic.is-on{border-color:var(--upl-draw-sel);background:#0C0D0C;}
ui-play .upl-dsel{display:block;width:26px;height:26px;border:2px dashed #C6C7BD;}
ui-play .upl-dcur{display:block;width:32px;height:32px;border-radius:50%;border:2px solid #C6C7BD;}
ui-play .upl-dsw{display:grid;grid-template-columns:repeat(6,20px);grid-template-rows:repeat(2,20px);gap:6px;align-self:center;}
ui-play .upl-dsw i{display:block;border-radius:50%;}
ui-play .upl-dslider{position:absolute;left:12px;top:12px;bottom:12px;z-index:4;width:44px;display:flex;flex-direction:column;align-items:center;gap:10px;
  padding:12px 0 14px;background:#3B2A20;border-radius:8px;color:#C6C7BD;font-size:1.125rem;pointer-events:none;}
ui-play .upl-dtrack{position:relative;flex:1;width:4px;border-radius:2px;background:#86877F;}
ui-play .upl-dtrack i{position:absolute;left:50%;bottom:var(--upl-draw-size);width:22px;height:22px;margin:0 0 -11px -11px;border-radius:50%;
  background:var(--upl-draw-sel);border:4px solid #0C0D0C;box-shadow:0 0 0 1px #86877F;}
ui-play .upl-controls{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--upl-bar);}
ui-play .upl-controls.is-outside{background:transparent;padding:8px 0;}
ui-play .upl-controls.is-hover{visibility:hidden;}
ui-play:hover .upl-controls.is-hover{visibility:visible;}
ui-play .upl-btn{font:inherit;font-size:.8125rem;line-height:1.4;background:#0C0D0C;color:#C6C7BD;border:1px solid #86877F;
  border-radius:6px;padding:4px 12px;cursor:pointer;}
ui-play .upl-btn:hover{border-color:var(--upl-accent);color:var(--upl-accent);}
ui-play .upl-btn:disabled{color:#86877F;border-color:#3B2A20;cursor:default;}

ui-play .upl-hl{position:absolute;transform-origin:left center;}
ui-play .upl-note{position:absolute;padding:8px 12px;border:1px solid;border-radius:8px;line-height:1.5;text-align:left;
  font-family:system-ui,"Microsoft JhengHei",sans-serif;}
ui-play .upl-tip{position:absolute;width:10px;height:10px;border:1px solid;transform:rotate(45deg);}
ui-play .upl-stamp{position:absolute;left:0;top:0;padding:3px;border-style:solid;white-space:nowrap;line-height:1.2;
  -webkit-mask-size:100% 100%;mask-size:100% 100%;font-weight:700;}
ui-play .upl-stamp-in{display:flex;align-items:center;justify-content:center;width:100%;height:100%;}
ui-play .upl-ins{display:inline-block;}
`;
    document.head.appendChild(s);
  }
  injectStyle();

  /* ---------------- 外框預設值 ---------------- */
  const BASE = {
    width: '100%', minH: '240px', pad: '32px', bw: '2px', bs: 'solid', bc: '#86877F', radius: '10px',
    bg: '#0C0D0C', bar: '#3B2A20', barText: '#C6C7BD', fs: '1.25rem', lh: '1.7', text: '#C6C7BD', accent: '#51DBCF'
  };
  const FRAME_DEF = {
    none: { bw: '0px', radius: '0px' },
    plain: {},
    mac: { bw: '2px' },
    win: { radius: '8px', bw: '2px' },
    'win-classic': { bw: '2px', bs: 'outset', bc: '#DBEDD8', radius: '0px', bar: '#778CE1', barText: '#0C0D0C' },
    browser: {},
    phone: { width: '390px', bw: '10px', radius: '36px', minH: '640px' },
    paper: { bg: '#3B2A20', text: '#DBEDD8', bc: '#86877F', radius: '4px', pad: '32px 32px 32px 64px' },
    sheet: { radius: '0px', pad: '0px', bar: '#3B2A20', barText: '#C6C7BD' },
    notebook: { radius: '8px' },
    draw: { radius: '8px', minH: '360px', pad: '32px 32px 32px 88px' }
  };

  /* ---------------- 音效 ---------------- */
  let audioCtx = null;
  function thump(volume) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);
      g.gain.setValueAtTime(volume, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(t); osc.stop(t + 0.25);
      const n = Math.floor(audioCtx.sampleRate * 0.05);
      const buf = audioCtx.createBuffer(1, n, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = audioCtx.createBufferSource();
      const lp = audioCtx.createBiquadFilter();
      const g2 = audioCtx.createGain();
      src.buffer = buf; lp.type = 'lowpass'; lp.frequency.value = 900; g2.gain.value = volume * 0.6;
      src.connect(lp).connect(g2).connect(audioCtx.destination);
      src.start(t);
    } catch (e) { /* 瀏覽器不支援時略過 */ }
  }

  /* ---------------- 墨跡遮罩（挖空式，不使用半透明） ---------------- */
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
    const blot = valueNoise(W, H, 22 * S, rnd);
    const mid = valueNoise(W, H, 7 * S, rnd);
    const grain = valueNoise(W, H, 1.6 * S, rnd);
    const chip = valueNoise(W, H, 5 * S, rnd);
    let side = opt.pressure;
    if (side === 'random') side = ['left', 'right', 'top', 'bottom', 'even'][Math.floor(rnd() * 5)];
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(W, H);
    const round = opt.shape === 'circle' || opt.shape === 'ellipse';
    const edgeZone = (4 + opt.edge * 10) * S;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        let d;
        if (round) {
          const nx = (x - W / 2) / (W / 2), ny = (y - H / 2) / (H / 2);
          d = (1 - Math.sqrt(nx * nx + ny * ny)) * Math.min(W, H) / 2;
        } else {
          d = Math.min(x, W - x, y, H - y);
        }
        const ed = Math.max(0, 1 - d / edgeZone);
        let pr = 0;
        if (side === 'left') pr = 1 - x / W;
        else if (side === 'right') pr = x / W;
        else if (side === 'top') pr = 1 - y / H;
        else if (side === 'bottom') pr = y / H;
        const score = blot[i] * 0.45 + mid[i] * 0.3 + grain[i] * 0.25;
        let th = opt.ink * 0.34 + pr * pr * 0.3 * (opt.ink + 0.3);
        th += ed * ed * opt.edge * (0.35 + chip[i] * 0.6);
        const keep = score >= th;
        img.data[i * 4 + 3] = keep ? 255 : 0;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cv.toDataURL('image/png');
  }

  /* ---------------- 手繪線條 ---------------- */
  function roughLine(x1, y1, x2, y2, rough, rnd) {
    const j = () => (rnd() - 0.5) * rough * 4;
    const L = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / L, ny = (x2 - x1) / L;
    const bow = (rnd() - 0.5) * rough * (2 + L * 0.02);
    const mx = (x1 + x2) / 2 + nx * bow, my = (y1 + y2) / 2 + ny * bow;
    return `M${(x1 + j()).toFixed(1)} ${(y1 + j()).toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${(x2 + j()).toFixed(1)} ${(y2 + j()).toFixed(1)}`;
  }
  function roughEllipse(cx, cy, rx, ry, rough, rnd) {
    const a0 = -Math.PI * (0.55 + rnd() * 0.3);
    const over = 0.25 + rough * 0.45;
    const n = 64, total = Math.PI * 2 + over;
    const drift = (rnd() - 0.5) * 0.12 * rough;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = a0 + total * t;
      const k = 1 + drift * t + (rnd() - 0.5) * 0.025 * rough;
      const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }
  function jaggedPolygon(rough, rnd) {
    const pts = [];
    const j = () => (rnd() * rough * 14).toFixed(1);
    const n = 6;
    for (let i = 0; i <= n; i++) pts.push(`${(i / n * 100).toFixed(1)}% ${j()}%`);
    for (let i = n; i >= 0; i--) pts.push(`${(i / n * 100).toFixed(1)}% ${(100 - j()).toFixed(1)}%`);
    return `polygon(${pts.join(',')})`;
  }

  /* ---------------- 動畫關鍵影格 ---------------- */
  function frames(effect, d) {
    switch (effect) {
      case 'slide-up': return [{ opacity: 0, transform: `translateY(${d})` }, { opacity: 1, transform: 'none' }];
      case 'slide-down': return [{ opacity: 0, transform: `translateY(-${d})` }, { opacity: 1, transform: 'none' }];
      case 'slide-left': return [{ opacity: 0, transform: `translateX(${d})` }, { opacity: 1, transform: 'none' }];
      case 'slide-right': return [{ opacity: 0, transform: `translateX(-${d})` }, { opacity: 1, transform: 'none' }];
      case 'zoom': return [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }];
      case 'pop': return [
        { opacity: 0, transform: 'scale(.3)', easing: 'cubic-bezier(.2,.8,.3,1)' },
        { opacity: 1, transform: 'scale(1.18)', offset: 0.55, easing: 'ease-in-out' },
        { opacity: 1, transform: 'scale(.94)', offset: 0.78, easing: 'ease-out' },
        { opacity: 1, transform: 'none' }
      ];
      case 'wipe': return [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }];
      // fade：淡入同時由模糊轉清晰並微微上浮，錄影時才看得出變化
      default: return [
        { opacity: 0, transform: 'translateY(10px) scale(.97)', filter: 'blur(6px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0px)' }
      ];
    }
  }
  // 各效果未指定 speed 時的預設時間
  const EFFECT_SPEED = { fade: 650, pop: 550 };
  function reverseFrames(f) {
    return f.slice().reverse().map((k) => {
      const c = Object.assign({}, k);
      if (c.offset != null) c.offset = 1 - c.offset;
      return c;
    });
  }
  const needsBox = (effect) => effect !== 'wipe';

  /* ---------------- 鍵盤：全域只掛一次 ---------------- */
  const players = new Set();
  let activePlayer = null;
  function onGlobalKey(e) {
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    /* 已播完或被隱藏的元件不再接收按鍵，改找畫面上的下一個 */
    const usable = (q) => q && q.isConnected && !q._ended && q.getClientRects().length > 0;
    let p = usable(activePlayer) ? activePlayer : null;
    if (!p) {
      for (const q of players) {
        if (!usable(q)) continue;
        const r = q.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) { p = q; break; }
      }
    }
    if (p) p._onKey(e);
  }
  document.addEventListener('keydown', onGlobalKey);

  const PAUSE_CANCEL = {};

  class UiPlay extends HTMLElement {
    constructor() {
      super();
      this._built = false;
      this._started = false;
      this._ended = false;
      this._paused = false;
      this._resumeQ = [];
      this._anims = new Set();
      this._live = [];
      this._subs = new WeakMap();
      this._keyWaiter = null;
      this._pendingKey = false;
      this._gated = false;
      this._rate = 1;
    }

    connectedCallback() {
      injectStyle();
      players.add(this);
      if (this._built) return;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { if (this.isConnected && !this._built) this._init(); }, { once: true });
      } else {
        this._init();
      }
    }

    disconnectedCallback() {
      players.delete(this);
      if (this._io) { this._io.disconnect(); this._io = null; }
      if (this._ro) { this._ro.disconnect(); this._ro = null; }
    }

    /* ---------- 公開 API ---------- */
    get rate() { return this._rate; }
    set rate(v) { const r = parseFloat(v); if (r > 0) this._rate = Math.min(8, Math.max(0.1, r)); }

    play() {
      if (!this._built) return;
      if (!this._started) { this._start(false); return; }
      if (this._paused) {
        this._paused = false;
        this._anims.forEach((a) => { try { a.play(); } catch (e) { /* 已結束 */ } });
        const q = this._resumeQ; this._resumeQ = [];
        q.forEach((fn) => fn());
        this._syncControls();
      }
    }

    pause() {
      if (!this._started || this._ended || this._paused) return;
      this._paused = true;
      this._anims.forEach((a) => { try { a.pause(); } catch (e) { /* 已結束 */ } });
      this._syncControls();
    }

    next() { this._press(); }

    /* ---------- 建置 ---------- */
    _init() {
      this._built = true;
      this._rate = num(this.getAttribute('rate'), 1);
      const stage = this.querySelector(':scope > stage-item') || document.createElement('stage-item');
      const script = this.querySelector(':scope > script-item');
      this._stage = stage;
      this._steps = script ? Array.prototype.filter.call(script.children, (el) => /-FX$/.test(el.tagName)) : [];

      const frame = (this.getAttribute('frame') || 'plain').toLowerCase();
      this._frame = FRAME_DEF[frame] ? frame : 'plain';
      this._applyVars();

      const box = document.createElement('div');
      box.className = 'upl f-' + this._frame;
      const bar = this._buildBar();
      if (bar) box.appendChild(bar);

      const body = document.createElement('div');
      body.className = 'upl-body';
      const canvas = document.createElement('div');
      canvas.className = 'upl-canvas';
      const under = document.createElement('div');
      under.className = 'upl-under';
      const over = document.createElement('div');
      over.className = 'upl-over';
      canvas.append(under, stage, over);
      body.appendChild(canvas);
      if (this._frame === 'draw' && this.getAttribute('draw-slider') !== 'false') {
        // 小畫家左側的筆刷大小滑桿，draw-size 為 0 到 100
        const sl = document.createElement('div');
        sl.className = 'upl-dslider';
        sl.innerHTML = '<i class="bi bi-water"></i><div class="upl-dtrack"><i></i></div>';
        const sz = Math.min(100, Math.max(0, num(this.getAttribute('draw-size'), 0)));
        this.style.setProperty('--upl-draw-size', sz + '%');
        body.appendChild(sl);
      }
      this._box = box; this._body = body; this._canvas = canvas; this._under = under; this._over = over;

      const ctrlMode = this.getAttribute('controls') || 'none';
      const ctrlPos = this.getAttribute('controls-position') || 'bottom';
      let controls = null;
      if (ctrlMode !== 'none') {
        controls = document.createElement('div');
        controls.className = 'upl-controls' + (ctrlMode === 'hover' ? ' is-hover' : '') + (ctrlPos === 'outside' ? ' is-outside' : '');
        this._btn = document.createElement('button');
        this._btn.type = 'button';
        this._btn.className = 'upl-btn';
        this._btn.addEventListener('click', () => {
          if (!this._started) this.play();
          else if (this._gated) this._press();
          else if (this._paused) this.play();
          else this.pause();
        });
        controls.appendChild(this._btn);
      }
      if (controls && ctrlPos === 'top') box.appendChild(controls);
      box.appendChild(body);
      if (controls && ctrlPos === 'bottom') box.appendChild(controls);

      this.insertBefore(box, this.firstChild);
      if (controls && ctrlPos === 'outside') box.after(controls);
      if (script) this.appendChild(script);

      this.addEventListener('pointerdown', () => { activePlayer = this; });
      body.addEventListener('click', (e) => this._onClick(e));

      // 預先隱藏 show-fx 的目標
      this._steps.forEach((el) => {
        if (el.tagName !== 'SHOW-FX') return;
        this._targets(el).forEach((t) => {
          t.style.visibility = 'hidden';
          if (el.hasAttribute('collapse')) t.style.display = 'none';
        });
      });

      if (this._frame === 'sheet') this._initSheet();

      if ('ResizeObserver' in window) {
        this._ro = new ResizeObserver(() => {
          if (this._frame === 'sheet') this._renderHeads();
          this._live.forEach((it) => it.place && it.place());
        });
        this._ro.observe(canvas);
      }
      this._syncControls();
      this._setupAutoplay();
    }

    /* ---------- sheet 外框 ---------- */
    _initSheet() {
      const heads = document.createElement('div');
      heads.className = 'upl-heads';
      heads.innerHTML = '<div class="upl-colh"></div><div class="upl-rowh"></div><div class="upl-corner"><i></i></div>';
      this._canvas.appendChild(heads);
      this._heads = heads;
      this._headCount = '';
      // 依 cell="B3" 或 cell="B3:D4" 定位舞台元素
      this._stage.querySelectorAll('[cell]').forEach((el) => {
        const m = /^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/i.exec((el.getAttribute('cell') || '').trim());
        if (!m) return;
        const c0 = colIndex(m[1]), r0 = parseInt(m[2], 10) - 1;
        const c1 = m[3] ? colIndex(m[3]) : c0, r1 = m[4] ? parseInt(m[4], 10) - 1 : r0;
        const cA = Math.min(c0, c1), cB = Math.max(c0, c1), rA = Math.min(r0, r1), rB = Math.max(r0, r1);
        el.style.left = `calc(var(--upl-cw) * ${cA})`;
        el.style.top = `calc(var(--upl-ch) * ${rA})`;
        el.style.width = `calc(var(--upl-cw) * ${cB - cA + 1})`;
        el.style.height = `calc(var(--upl-ch) * ${rB - rA + 1})`;
      });
      this._renderHeads();
    }

    _renderHeads() {
      if (!this._heads) return;
      const probe = document.createElement('div');
      probe.style.cssText = 'position:absolute;visibility:hidden;width:var(--upl-cw);height:var(--upl-ch);';
      this._heads.appendChild(probe);
      const cw = probe.offsetWidth || 96, chh = probe.offsetHeight || 34;
      probe.remove();
      const cols = Math.ceil(this._canvas.clientWidth / cw) + 1;
      const rows = Math.ceil(this._canvas.clientHeight / chh) + 1;
      const key = cols + 'x' + rows;
      if (key === this._headCount) return;
      this._headCount = key;
      let h = '';
      for (let i = 0; i < cols; i++) h += '<span>' + colName(i) + '</span>';
      this._heads.querySelector('.upl-colh').innerHTML = h;
      h = '';
      for (let i = 1; i <= rows; i++) h += '<span>' + i + '</span>';
      this._heads.querySelector('.upl-rowh').innerHTML = h;
    }

    _attr(name, def) {
      const v = this.getAttribute(name);
      return v == null || v === '' ? def : v;
    }

    _applyVars() {
      const fd = Object.assign({}, BASE, FRAME_DEF[this._frame]);
      const set = (k, v) => this.style.setProperty(k, v);
      set('--upl-width', len(this.getAttribute('width')) || fd.width);
      set('--upl-min-h', len(this.getAttribute('min-height')) || fd.minH);
      const aspect = this.getAttribute('aspect');
      set('--upl-aspect', aspect || 'auto');
      set('--upl-h', aspect ? 'auto' : (len(this.getAttribute('height')) || 'auto'));
      set('--upl-pad', this.getAttribute('padding') ? this.getAttribute('padding').split(/\s+/).map(len).join(' ') : fd.pad);
      set('--upl-align', this._attr('content-align', 'left'));
      const va = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[this._attr('content-valign', 'top')] || 'flex-start';
      set('--upl-valign', va);
      set('--upl-bw', len(this.getAttribute('border-width')) || fd.bw);
      set('--upl-bs', this._attr('border-style', fd.bs));
      set('--upl-bc', color(this.getAttribute('border-color')) || fd.bc);
      set('--upl-radius', len(this.getAttribute('radius')) || fd.radius);
      set('--upl-bg', color(this.getAttribute('bg-color')) || fd.bg);
      set('--upl-bar', color(this.getAttribute('bar-color')) || fd.bar);
      set('--upl-bar-text', color(this.getAttribute('bar-text-color')) || fd.barText);
      set('--upl-font', this._attr('font-family', 'system-ui,"Microsoft JhengHei","Noto Sans TC",sans-serif'));
      set('--upl-fs', len(this.getAttribute('font-size')) || fd.fs);
      set('--upl-lh', this._attr('line-height', fd.lh));
      set('--upl-text', color(this.getAttribute('text-color')) || fd.text);
      set('--upl-accent', color(this.getAttribute('accent-color')) || fd.accent);
      // paper：橫線、左側紅線
      set('--upl-rule', color(this.getAttribute('rule-color')) || '#86877F');
      set('--upl-mlw', len(this.getAttribute('margin-line-width')) || '3px');
      set('--upl-mlc', color(this.getAttribute('margin-line-color')) || '#EF6661');
      // sheet：儲存格、格線、欄列標頭
      const ch = len(this.getAttribute('cell-height')) || '34px';
      set('--upl-cw', len(this.getAttribute('cell-width')) || '96px');
      set('--upl-ch', ch);
      set('--upl-grid', color(this.getAttribute('grid-color')) || '#3B2A20');
      set('--upl-hline', color(this.getAttribute('header-line-color')) || '#0C0D0C');
      set('--upl-corner', color(this.getAttribute('corner-color')) || '#86877F');
      set('--upl-rw', len(this.getAttribute('row-header-width')) || '48px');
      set('--upl-hh', len(this.getAttribute('column-header-height')) || '30px');
      if (this._frame === 'sheet' && !this.getAttribute('line-height')) set('--upl-lh', ch);
    }

    _buildBar() {
      const f = this._frame;
      const title = this.getAttribute('frame-title') || '';
      const icon = this.getAttribute('frame-icon');
      const bar = document.createElement('div');
      bar.className = 'upl-bar';
      const titleEl = () => {
        const t = document.createElement('div');
        t.className = 'upl-title';
        if (icon) { const i = document.createElement('i'); i.className = 'bi ' + icon; i.style.marginRight = '8px'; t.appendChild(i); }
        t.appendChild(document.createTextNode(title));
        return t;
      };
      const dots = () => {
        const d = document.createElement('div');
        d.className = 'upl-dots';
        d.innerHTML = '<span style="background:#EF6661"></span><span style="background:#E3D322"></span><span style="background:#71CD76"></span>';
        return d;
      };
      if (f === 'mac') {
        bar.append(dots(), titleEl(), document.createElement('div'));
      } else if (f === 'win') {
        const b = document.createElement('div');
        b.className = 'upl-winbtns';
        b.innerHTML = '<span>&#x2500;</span><span>&#x2610;</span><span>&#x2715;</span>';
        bar.append(titleEl(), b);
      } else if (f === 'win-classic') {
        const b = document.createElement('div');
        b.className = 'upl-clbtns';
        b.innerHTML = '<span>_</span><span>&#x25A1;</span><span>&#x2715;</span>';
        bar.append(titleEl(), b);
      } else if (f === 'browser') {
        const nav = document.createElement('div');
        nav.className = 'upl-nav';
        nav.innerHTML = '<span>&#x2039;</span><span>&#x203A;</span><span>&#x21BB;</span>';
        const url = document.createElement('div');
        url.className = 'upl-url';
        url.textContent = this.getAttribute('frame-url') || title;
        bar.append(dots(), nav, url);
      } else if (f === 'notebook') {
        // 分頁：tabs="快速筆記|新的節 1|新的節 2"，tab-colors 依序對應，tab-active 為第幾個（從 1 起算）
        const names = (this.getAttribute('tabs') || title || '快速筆記').split('|').map((x) => x.trim()).filter(Boolean);
        const cols = (this.getAttribute('tab-colors') || 'green|blue|playful|violet|pink|key').split('|').map((x) => color(x.trim()));
        const act = Math.min(names.length, Math.max(1, parseInt(this.getAttribute('tab-active'), 10) || 1));
        const tabs = document.createElement('div');
        tabs.className = 'upl-tabs';
        names.forEach((n, i) => {
          const c = cols[i % cols.length];
          const tb = document.createElement('div');
          tb.className = 'upl-tab' + (i + 1 === act ? ' is-active' : '');
          tb.style.setProperty('--tab-c', c);
          tb.style.setProperty('--tab-fill', `color-mix(in srgb, ${c} 38%, #0C0D0C)`);
          tb.textContent = n;
          tabs.appendChild(tb);
        });
        if (this.getAttribute('tab-add') !== 'false') {
          const add = document.createElement('div');
          add.className = 'upl-tab is-add';
          add.textContent = '+';
          tabs.appendChild(add);
        }
        this.style.setProperty('--upl-tab-active', cols[(act - 1) % cols.length]);
        bar.appendChild(tabs);
        const ph = this.getAttribute('search');
        if (ph !== 'false') {
          const sb = document.createElement('div');
          sb.className = 'upl-search';
          sb.innerHTML = '<span></span><i class="bi bi-search"></i>';
          sb.querySelector('span').textContent = ph || '搜尋筆記本';
          this.style.setProperty('--upl-search-w', len(this.getAttribute('search-width')) || '280px');
          bar.appendChild(sb);
        }
      } else if (f === 'draw') {
        // 小畫家：功能表列＋功能區；draw-tool 指定選取中的工具
        const tool = this._attr('draw-tool', 'brush').toLowerCase();
        this.style.setProperty('--upl-draw-sel', color(this.getAttribute('draw-select-color')) || '#8EA4DE');
        const ic = (name, key, extra, c) => '<span class="upl-dic' + (key && key === tool ? ' is-on' : '') + (extra || '') + '">' +
          '<i class="bi ' + name + '"' + (c ? ' style="color:' + c + '"' : '') + '></i></span>';
        const dd = (name, c) => '<span class="upl-dic"><i class="bi ' + name + '"' + (c ? ' style="color:' + c + '"' : '') + '></i><small class="bi bi-chevron-down"></small></span>';
        const menu = document.createElement('div');
        menu.className = 'upl-dmenu';
        menu.innerHTML = '<span>檔案</span><span>編輯</span><span>檢視</span><b></b><i class="bi bi-floppy"></i><b></b>' +
          '<i class="bi bi-box-arrow-up-right"></i><b></b><i class="bi bi-arrow-counterclockwise"></i><i class="bi bi-arrow-clockwise is-off"></i>';
        const rb = document.createElement('div');
        rb.className = 'upl-dribbon';
        const grp = (label, inner) => '<div class="upl-dgrp">' + inner + '<span>' + label + '</span></div>';
        const sel = '<span class="upl-dic is-big' + (tool === 'select' ? ' is-on' : '') + '"><i class="upl-dsel"></i><small class="bi bi-chevron-down"></small></span>';
        const img = '<div class="upl-dgrid">' + ic('bi-crop') + ic('bi-person-bounding-box') + dd('bi-arrow-clockwise', '#5DBAE8') + dd('bi-symmetry-vertical', '#5DBAE8') +
          '<span class="upl-dic is-big"><i class="bi bi-aspect-ratio" style="color:#5DBAE8"></i></span></div>';
        const tools = '<div class="upl-dgrid">' + ic('bi-pencil', 'pencil', '', '#E3D322') + ic('bi-eraser', 'eraser', '', '#FF91D7') +
          ic('bi-paint-bucket', 'fill', '', '#5DBAE8') + ic('bi-eyedropper', 'picker', '', '#5DBAE8') +
          ic('bi-fonts', 'text') + ic('bi-zoom-in', 'zoom') + '</div>';
        const brush = '<span class="upl-dic is-big' + (tool === 'brush' ? ' is-on' : '') + '"><i class="bi bi-brush"></i><small class="bi bi-chevron-down"></small></span>';
        const cur = color(this.getAttribute('draw-color')) || '#E3D322';
        const sw = ['#DBEDD8', '#86877F', '#EF6661', '#FFA987', '#E3D322', '#71CD76', '#51DBCF', '#5DBAE8', '#778CE1', '#B484E8', '#FF91D7', '#0C0D0C']
          .map((c) => '<i style="background:' + c + (c === '#0C0D0C' ? ';box-shadow:0 0 0 1px #86877F' : '') + '"></i>').join('');
        const colors = '<div style="display:flex;gap:14px;align-items:center;flex:1"><i class="upl-dcur" style="background:' + cur + '"></i><div class="upl-dsw">' + sw + '</div></div>';
        rb.innerHTML = grp('選取項目', sel) + grp('影像', img) + grp('工具', tools) + grp('筆刷', brush) + grp('色彩', colors);
        bar.append(menu, rb);
      } else if (f === 'phone') {
        const time = document.createElement('span');
        time.textContent = title || '9:41';
        const notch = document.createElement('div');
        notch.className = 'upl-notch';
        const st = document.createElement('span');
        st.innerHTML = '5G <span class="upl-batt"><i></i></span>';
        bar.append(time, notch, st);
      } else {
        return null;
      }
      return bar;
    }

    _setupAutoplay() {
      const mode = this._attr('autoplay', 'false');
      if (mode === 'true') { this._start(false); return; }
      if (mode !== 'visible') return;
      if (!('IntersectionObserver' in window)) { this._start(false); return; }
      this._io = new IntersectionObserver((entries) => {
        for (const en of entries) {
          if (en.isIntersecting && en.intersectionRatio >= 0.6 && !this._started) {
            this._io.disconnect(); this._io = null;
            this._start(false);
            break;
          }
        }
      }, { threshold: [0.2, 0.4, 0.6, 0.8, 1] });
      this._io.observe(this);
    }

    _syncControls() {
      if (!this._btn) return;
      if (this._ended) { this._btn.textContent = '■ 播放完畢'; this._btn.disabled = true; return; }
      this._btn.disabled = false;
      if (!this._started) this._btn.textContent = '▶ 播放';
      else if (this._paused) this._btn.textContent = '▶ 繼續';
      else if (this._gated) this._btn.textContent = '▶ 播放';
      else this._btn.textContent = '❚❚ 暫停';
    }

    /* ---------- 鍵盤與節奏 ---------- */
    _nextBy() {
      const v = this._attr('next-by', 'key').toLowerCase();
      return v === 'click' || v === 'both' ? v : 'key';
    }

    _onClick(e) {
      if (this._nextBy() === 'key' || e.button !== 0) return;
      /* 點到舞台內的連結、按鈕、輸入框，或正在選取文字時，不當作下一步 */
      const t = e.target;
      if (t && t.closest && t.closest('a,button,input,textarea,select,label,[contenteditable="true"]')) return;
      const sel = window.getSelection && window.getSelection();
      if (sel && !sel.isCollapsed && this.contains(sel.anchorNode)) return;
      activePlayer = this;
      this._press();
    }

    _onKey(e) {
      if (!this._built || this.getAttribute('keyboard') === 'false' || this._nextBy() === 'click') return;
      const keys = this._attr('key-next', 'Space,ArrowRight').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      const k = e.key === ' ' ? 'space' : String(e.key).toLowerCase();
      const c = String(e.code || '').toLowerCase();
      if (keys.indexOf(k) === -1 && keys.indexOf(c) === -1) return;
      e.preventDefault();
      this._press();
    }

    _press() {
      if (!this._built || this._ended) return;
      if (!this._started) { this._start(true); return; }
      if (this._paused) { this.play(); return; }
      if (this._keyWaiter) { const w = this._keyWaiter; this._keyWaiter = null; w(); return; }
      this._pendingKey = true;
    }

    _waitKey() {
      if (this._pendingKey) { this._pendingKey = false; return Promise.resolve(); }
      return new Promise((res) => {
        this._keyWaiter = () => { this._gated = false; this._syncControls(); res(); };
        this._gated = true;
        this._syncControls();
      });
    }

    _sleep(ms) {
      ms = (ms || 0) / this._rate;
      return new Promise((res) => {
        const go = () => {
          if (this._paused) { this._resumeQ.push(go); return; }
          if (ms <= 0) { res(); return; }
          setTimeout(() => {
            if (this._paused) { this._resumeQ.push(res); return; }
            res();
          }, ms);
        };
        go();
      });
    }

    _anim(el, keyframes, ms, opts) {
      // 關鍵影格自帶 easing 時，整體時間軸用 linear，避免兩層 easing 疊加壓縮回彈
      const own = Array.isArray(keyframes) && keyframes.some((k) => k.easing);
      const a = el.animate(keyframes, Object.assign({ duration: Math.max(1, ms / this._rate), fill: 'both', easing: own ? 'linear' : 'ease-out' }, opts || {}));
      this._anims.add(a);
      if (this._paused) a.pause();
      return a.finished.then(() => { this._anims.delete(a); return a; }, () => { this._anims.delete(a); return a; });
    }

    _groups() {
      const mode = this._attr('step-mode', 'mixed');
      const def = mode === 'manual' ? 'click' : 'after';
      const groups = [];
      let gate = null;
      this._steps.forEach((el) => {
        if (el.tagName === 'PAUSE-FX') { gate = 'click'; return; }
        let start = (el.getAttribute('start') || def).toLowerCase();
        if (gate) { start = 'click'; gate = null; }
        if (start === 'with' && groups.length) groups[groups.length - 1].items.push(el);
        else groups.push({ gate: start === 'click' ? 'click' : 'after', items: [el] });
      });
      return groups;
    }

    async _start(byKey) {
      if (this._started) return;
      this._started = true;
      activePlayer = this;
      if (this._io) { this._io.disconnect(); this._io = null; }
      this._syncControls();
      const mode = this._attr('step-mode', 'mixed');
      const stepDelay = num(this.getAttribute('step-delay'), 600);
      const groups = this._groups();
      for (let gi = 0; gi < groups.length; gi++) {
        const g = groups[gi];
        if (g.gate === 'click' && mode !== 'auto') {
          if (!(gi === 0 && byKey)) await this._waitKey();
        } else if (gi > 0) {
          await this._sleep(stepDelay);
        }
        await Promise.all(g.items.map((el) => this._exec(el)));
        this._relayout();
      }
      await this._finish();
    }

    async _finish() {
      this._ended = true;
      if (this._box) this._box.classList.add('is-ended');
      this._syncControls();
      const id = (this.getAttribute('end-target') || '').replace(/^#/, '');
      const target = id ? document.getElementById(id) : null;
      if (target) {
        await this._sleep(num(this.getAttribute('end-delay'), 0));
        target.hidden = false;
        if (target.style.display === 'none') target.style.display = '';
        if (getComputedStyle(target).display === 'none') target.style.display = 'block';
        target.style.visibility = '';
        const eff = this._attr('end-effect', 'fade');
        if (needsBox(eff) && getComputedStyle(target).display === 'inline') target.style.display = 'inline-block';
        await this._anim(target, frames(eff, '24px'), num(this.getAttribute('end-speed'), EFFECT_SPEED[eff] || 400), { fill: 'none' });
      }
      this.dispatchEvent(new CustomEvent('play-end', { bubbles: true, detail: { endTarget: target } }));
    }

    /* ---------- 目標解析 ---------- */
    _targets(el) {
      const sel = el.getAttribute('target');
      if (!sel) return [];
      let list = [];
      try {
        list = Array.from(this._stage.querySelectorAll(sel));
        if (!list.length) list = Array.from(document.querySelectorAll(sel));
      } catch (e) { return []; }
      const text = el.getAttribute('text');
      if (text != null && text !== '') {
        const nth = parseInt(el.getAttribute('nth'), 10) || 1;
        return list.map((n) => this._sub(n, text, nth)).filter(Boolean);
      }
      return list;
    }

    _sub(root, text, nth) {
      let cache = this._subs.get(root);
      if (!cache) { cache = new Map(); this._subs.set(root, cache); }
      const key = text + '\u0000' + nth;
      if (cache.has(key) && cache.get(key).isConnected) return cache.get(key);
      const nodes = [];
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let full = '';
      while (w.nextNode()) { nodes.push({ node: w.currentNode, start: full.length }); full += w.currentNode.data; }
      let idx = -1, from = 0;
      for (let i = 0; i < nth; i++) {
        idx = full.indexOf(text, from);
        if (idx === -1) return null;
        from = idx + text.length;
      }
      const end = idx + text.length;
      const locate = (pos, isEnd) => {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i], L = n.node.data.length;
          if (pos < n.start + L || (isEnd && pos === n.start + L)) return { node: n.node, off: pos - n.start };
        }
        const last = nodes[nodes.length - 1];
        return { node: last.node, off: last.node.data.length };
      };
      const a = locate(idx, false), b = locate(end, true);
      const range = document.createRange();
      range.setStart(a.node, a.off);
      range.setEnd(b.node, b.off);
      const span = document.createElement('span');
      span.className = 'upl-sub';
      span.appendChild(range.extractContents());
      range.insertNode(span);
      cache.set(key, span);
      return span;
    }

    // 印章、註解的對齊基準：區塊元素以文字實際範圍為準，不用整行寬度
    _rel(el) {
      if (getComputedStyle(el).display !== 'inline') {
        const ls = this._lines(el);
        if (ls.length) {
          const x1 = Math.min.apply(null, ls.map((r) => r.x)), y1 = Math.min.apply(null, ls.map((r) => r.y));
          const x2 = Math.max.apply(null, ls.map((r) => r.x + r.w)), y2 = Math.max.apply(null, ls.map((r) => r.y + r.h));
          return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
        }
      }
      const c = this._canvas.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
    }

    // 標記以「文字實際所在」為準：區塊元素（段落、儲存格）改量內文的行框，
    // 圈選、底線才會貼著文字，而不是整個區塊的寬度
    _lines(el) {
      const c = this._canvas.getBoundingClientRect();
      let rects = Array.from(el.getClientRects());
      if (getComputedStyle(el).display !== 'inline') {
        const rg = document.createRange();
        rg.selectNodeContents(el);
        const inner = Array.from(rg.getClientRects()).filter((r) => r.width > 0.5 && r.height > 0.5);
        if (inner.length) {
          // 同一行的多個矩形合併成一個
          const merged = [];
          inner.forEach((r) => {
            const m = merged.find((q) => Math.abs(q.top - r.top) < r.height * 0.5);
            if (m) { const R = Math.max(m.right, r.right); m.left = Math.min(m.left, r.left); m.right = R; m.top = Math.min(m.top, r.top); m.bottom = Math.max(m.bottom, r.bottom); }
            else merged.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
          });
          rects = merged.map((m) => ({ left: m.left, top: m.top, width: m.right - m.left, height: m.bottom - m.top }));
        }
      }
      return rects.filter((r) => r.width > 0.5)
        .map((r) => ({ x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height }));
    }

    // 文字改變造成重新排版時，讓所有疊加效果重新對位
    _relayout() {
      this._live.forEach((it) => it.place && it.place());
    }

    _register(item) {
      this._live.push(item);
      return item;
    }

    /* ---------- 效果執行 ---------- */
    async _exec(el) {
      await this._sleep(num(el.getAttribute('delay'), 0));
      switch (el.tagName) {
        case 'SHOW-FX': return this._fxShow(el, true);
        case 'HIDE-FX': return this._fxShow(el, false);
        case 'MARK-FX': return this._fxMark(el);
        case 'NOTE-FX': return this._fxNote(el);
        case 'STAMP-FX': return this._fxStamp(el);
        case 'SWAP-FX': return this._fxSwap(el);
        case 'WAIT-FX': return this._sleep(num(el.getAttribute('ms'), 800));
        case 'REMOVE-FX': return this._fxRemove(el);
        default: return null;
      }
    }

    /* show-fx / hide-fx */
    async _fxShow(el, show) {
      const effect = el.getAttribute('effect') || 'fade';
      const speed = num(el.getAttribute('speed'), EFFECT_SPEED[effect] || 400);
      const dist = len(el.getAttribute('distance')) || '24px';
      const collapse = el.hasAttribute('collapse');
      const list = this._targets(el);
      await Promise.all(list.map(async (t) => {
        if (needsBox(effect) && getComputedStyle(t).display === 'inline') t.style.display = 'inline-block';
        // pop、zoom 以實際內容的中心縮放，整列寬的區塊（例如 li）才不會看起來像橫向滑動
        if (effect === 'pop' || effect === 'zoom') {
          const rg = document.createRange();
          rg.selectNodeContents(t);
          const cr = rg.getBoundingClientRect(), er = t.getBoundingClientRect();
          if (cr.width > 0) t.style.transformOrigin = `${cr.left - er.left + cr.width / 2}px ${cr.top - er.top + cr.height / 2}px`;
        }
        const f = frames(effect, dist);
        if (show) {
          t.style.visibility = '';
          if (collapse && t.style.display === 'none') { t.style.display = ''; this._relayout(); }
          await this._anim(t, f, speed, { fill: 'backwards' });
        } else {
          await this._anim(t, reverseFrames(f), speed, { fill: 'forwards', easing: 'ease-in' });
          t.style.visibility = 'hidden';
          if (collapse) { t.style.display = 'none'; this._relayout(); }
          t.getAnimations().forEach((a) => a.cancel());
        }
      }));
    }

    /* mark-fx */
    async _fxMark(el) {
      const kind = (el.getAttribute('kind') || 'highlight').toLowerCase();
      const col = color(el.getAttribute('color')) || '#E3D322';
      const thick = num(el.getAttribute('thickness'), 3);
      const rough = Math.min(1, Math.max(0, num(el.getAttribute('rough'), 0.5)));
      const pad = num(el.getAttribute('padding'), 4);
      const speed = num(el.getAttribute('speed'), 600);
      const name = el.getAttribute('name');
      const targets = this._targets(el);
      await Promise.all(targets.map(async (t, ti) => {
        const seed = seedOf(el.getAttribute('seed'), kind + '|' + (el.getAttribute('target') || '') + '|' + (el.getAttribute('text') || '') + '|' + ti);
        if (kind === 'highlight') {
          const txtCol = color(el.getAttribute('text-color')) || '#0C0D0C';
          const oldColor = t.style.color;
          const nodes = [];
          const place = (build) => {
            const rnd = makeRng(seed);
            const lines = this._lines(t);
            if (build) lines.forEach(() => { const d = document.createElement('div'); d.className = 'upl-hl'; this._under.appendChild(d); nodes.push(d); });
            lines.forEach((r, i) => {
              const d = nodes[i];
              if (!d) return;
              const extraY = r.h * 0.08;
              d.style.left = (r.x - pad) + 'px';
              d.style.top = (r.y - extraY) + 'px';
              d.style.width = (r.w + pad * 2) + 'px';
              d.style.height = (r.h + extraY * 2) + 'px';
              d.style.background = col;
              d.style.clipPath = rough > 0 ? jaggedPolygon(rough, rnd) : 'none';
              d.style.borderRadius = rough > 0 ? '0' : '3px';
            });
          };
          place(true);
          t.style.transition = 'color .2s';
          t.style.color = txtCol;
          const item = this._register({
            name, nodes, place: () => place(false),
            remove: async (ms) => {
              await Promise.all(nodes.map((n) => this._anim(n, [{ opacity: 1 }, { opacity: 0 }], ms)));
              nodes.forEach((n) => n.remove());
              t.style.color = oldColor;
            }
          });
          const total = nodes.reduce((s, n) => s + n.offsetWidth, 0) || 1;
          for (const n of nodes) {
            await this._anim(n, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], speed * n.offsetWidth / total, { easing: 'ease-in-out' });
          }
          return item;
        }
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this._over.appendChild(svg);
        const geom = () => {
          const rnd = makeRng(seed);
          const lines = this._lines(t);
          if (!lines.length) return [];
          const u = lines.reduce((a, r) => ({ x1: Math.min(a.x1, r.x), y1: Math.min(a.y1, r.y), x2: Math.max(a.x2, r.x + r.w), y2: Math.max(a.y2, r.y + r.h) }),
            { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity });
          const ds = [];
          if (kind === 'underline') lines.forEach((r) => { const y = r.y + r.h * 0.92 + pad * 0.5; ds.push(roughLine(r.x - pad * 0.5, y, r.x + r.w + pad * 0.5, y, rough, rnd)); });
          else if (kind === 'strike') lines.forEach((r) => { const y = r.y + r.h * 0.55; ds.push(roughLine(r.x - pad * 0.5, y, r.x + r.w + pad * 0.5, y, rough, rnd)); });
          else if (kind === 'circle') {
            const cx = (u.x1 + u.x2) / 2, cy = (u.y1 + u.y2) / 2;
            ds.push(roughEllipse(cx, cy, (u.x2 - u.x1) / 2 + pad * 2.5, (u.y2 - u.y1) / 2 + pad * 1.5, rough, rnd));
          } else if (kind === 'box') {
            const x1 = u.x1 - pad, y1 = u.y1 - pad * 0.5, x2 = u.x2 + pad, y2 = u.y2 + pad * 0.5;
            ds.push(roughLine(x1, y1, x2, y1, rough, rnd), roughLine(x2, y1, x2, y2, rough, rnd), roughLine(x2, y2, x1, y2, rough, rnd), roughLine(x1, y2, x1, y1, rough, rnd));
          } else if (kind === 'bracket') {
            const bw = Math.min(12, (u.y2 - u.y1) * 0.25), x1 = u.x1 - pad, x2 = u.x2 + pad, y1 = u.y1 - pad * 0.5, y2 = u.y2 + pad * 0.5;
            ds.push(roughLine(x1 + bw, y1, x1, y1, rough, rnd) + roughLine(x1, y1, x1, y2, rough, rnd).replace(/^M/, 'L') + roughLine(x1, y2, x1 + bw, y2, rough, rnd).replace(/^M/, 'L'));
            ds.push(roughLine(x2 - bw, y1, x2, y1, rough, rnd) + roughLine(x2, y1, x2, y2, rough, rnd).replace(/^M/, 'L') + roughLine(x2, y2, x2 - bw, y2, rough, rnd).replace(/^M/, 'L'));
          }
          return ds;
        };
        const paths = [];
        const draw = (build) => {
          const ds = geom();
          if (build) {
            ds.forEach(() => {
              const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              p.setAttribute('fill', 'none');
              p.setAttribute('stroke', col);
              p.setAttribute('stroke-width', thick);
              p.setAttribute('stroke-linecap', 'round');
              p.setAttribute('stroke-linejoin', 'round');
              svg.appendChild(p);
              paths.push(p);
            });
          }
          ds.forEach((d, i) => { if (paths[i]) paths[i].setAttribute('d', d); });
        };
        draw(true);
        const item = this._register({
          name, nodes: [svg], place: () => draw(false),
          remove: async (ms) => { await this._anim(svg, [{ opacity: 1 }, { opacity: 0 }], ms); svg.remove(); }
        });
        const lens = paths.map((p) => p.getTotalLength());
        const total = lens.reduce((a, b) => a + b, 0) || 1;
        paths.forEach((p, i) => { p.style.strokeDasharray = lens[i]; p.style.strokeDashoffset = lens[i]; });
        for (let i = 0; i < paths.length; i++) {
          await this._anim(paths[i], [{ strokeDashoffset: lens[i] }, { strokeDashoffset: 0 }], speed * lens[i] / total, { easing: 'ease-in-out' });
          paths[i].style.strokeDasharray = 'none';
          paths[i].style.strokeDashoffset = '0';
        }
        return item;
      }));
    }

    /* note-fx */
    async _fxNote(el) {
      const t = this._targets(el)[0];
      if (!t) return;
      const name = el.getAttribute('name');
      const pos = (el.getAttribute('position') || 'auto').toLowerCase();
      const ox = num(el.getAttribute('offset-x'), 0), oy = num(el.getAttribute('offset-y'), 0);
      const fg = color(el.getAttribute('color')) || '#DBEDD8';
      const bg = color(el.getAttribute('bg-color')) || '#3B2A20';
      const bc = color(el.getAttribute('border-color')) || getComputedStyle(this).getPropertyValue('--upl-accent').trim() || '#51DBCF';
      const speed = num(el.getAttribute('speed'), 300);
      const stay = el.getAttribute('stay') || 'forever';

      const note = document.createElement('div');
      note.className = 'upl-note';
      note.innerHTML = el.innerHTML;
      note.style.color = fg;
      note.style.background = bg;
      note.style.borderColor = bc;
      note.style.fontSize = len(el.getAttribute('font-size')) || '1rem';
      note.style.maxWidth = len(el.getAttribute('max-width')) || '320px';
      const tip = document.createElement('div');
      tip.className = 'upl-tip';
      tip.style.background = bg;
      tip.style.borderColor = bc;
      if (el.getAttribute('pointer') !== 'false') note.appendChild(tip);
      note.style.visibility = 'hidden';
      this._over.appendChild(note);

      let side = pos;
      const place = () => {
        const r = this._rel(t);
        const cw = this._canvas.clientWidth, ch = this._canvas.clientHeight;
        const w = note.offsetWidth, h = note.offsetHeight, gap = 12;
        if (pos === 'auto') side = r.y - h - gap >= 0 ? 'top' : (r.y + r.h + h + gap <= ch ? 'bottom' : 'top');
        let x, y;
        if (side === 'top' || side === 'bottom') {
          x = Math.max(4, Math.min(cw - w - 4, r.x + r.w / 2 - w / 2));
          y = side === 'top' ? r.y - h - gap : r.y + r.h + gap;
        } else {
          y = r.y + r.h / 2 - h / 2;
          x = side === 'left' ? r.x - w - gap : r.x + r.w + gap;
        }
        x += ox; y += oy;
        note.style.left = x + 'px';
        note.style.top = y + 'px';
        tip.style.borderWidth = '0';
        tip.style.borderStyle = 'solid';
        tip.style.left = tip.style.top = tip.style.right = tip.style.bottom = '';
        if (side === 'top' || side === 'bottom') {
          tip.style.left = Math.max(10, Math.min(w - 20, r.x + r.w / 2 - x - 5)) + 'px';
          if (side === 'top') { tip.style.bottom = '-6px'; tip.style.borderRightWidth = tip.style.borderBottomWidth = '1px'; }
          else { tip.style.top = '-6px'; tip.style.borderLeftWidth = tip.style.borderTopWidth = '1px'; }
        } else {
          tip.style.top = (h / 2 - 5) + 'px';
          if (side === 'left') { tip.style.right = '-6px'; tip.style.borderRightWidth = tip.style.borderTopWidth = '1px'; }
          else { tip.style.left = '-6px'; tip.style.borderLeftWidth = tip.style.borderBottomWidth = '1px'; }
        }
      };
      place();
      note.style.visibility = '';
      const item = this._register({
        name, nodes: [note], place,
        remove: async (ms) => { await this._anim(note, [{ opacity: 1 }, { opacity: 0 }], ms); note.remove(); this._unregister(item); }
      });
      const dy = side === 'bottom' ? '-6px' : '6px';
      await this._anim(note, [{ opacity: 0, transform: `translateY(${dy})` }, { opacity: 1, transform: 'none' }], speed);
      if (stay !== 'forever') {
        this._sleep(num(stay, 2000)).then(() => { if (note.isConnected) item.remove(num(el.getAttribute('fade-out'), 300)); });
      }
      return item;
    }

    /* stamp-fx */
    async _fxStamp(el) {
      const label = el.textContent.trim();
      const icon = (el.getAttribute('icon') || '').trim();
      const t = this._targets(el)[0];
      if (!t || (!label && !icon)) return;
      const name = el.getAttribute('name');
      const col = color(el.getAttribute('color')) || '#EF6661';
      const size = len(el.getAttribute('size')) || '1.4rem';
      const bw = num(el.getAttribute('border-width'), 3);
      const shape = (el.getAttribute('shape') || 'round').toLowerCase();
      const inner = (el.getAttribute('inner-border') || 'single').toLowerCase();
      const dir = (el.getAttribute('direction') || 'horizontal').toLowerCase();
      const ls = len(el.getAttribute('letter-spacing')) || '6px';
      const ink = Math.min(1, Math.max(0, num(el.getAttribute('ink'), 0.5)));
      const edge = Math.min(1, Math.max(0, num(el.getAttribute('edge'), 0.4)));
      const bleed = Math.min(1, Math.max(0, num(el.getAttribute('bleed'), 0.2)));
      const pressure = (el.getAttribute('pressure') || 'random').toLowerCase();
      const seed = seedOf(el.getAttribute('seed'), label + '|' + icon);
      const rnd = makeRng(seed);
      const rotAttr = el.getAttribute('rotate');
      const rot = rotAttr === 'random'
        ? (rnd() * 2 - 1) * num(el.getAttribute('rotate-range'), 12)
        : num(rotAttr, -8);
      const anchor = (el.getAttribute('anchor') || 'center').toLowerCase();
      const ox = num(el.getAttribute('offset-x'), 0), oy = num(el.getAttribute('offset-y'), 0);
      const speed = num(el.getAttribute('speed'), 380);
      const drop = num(el.getAttribute('drop-scale'), 2.6);
      const bounce = Math.min(1, Math.max(0, num(el.getAttribute('bounce'), 0.3)));
      const shake = num(el.getAttribute('shake'), 2);
      const stay = el.getAttribute('stay') || 'forever';
      const radius = { rect: '2px', round: '10px', circle: '50%', ellipse: '50%' }[shape] || '10px';

      const st = document.createElement('div');
      st.className = 'upl-stamp';
      st.style.color = col;
      st.style.borderColor = col;
      st.style.borderWidth = (bw + bleed * 1.2) + 'px';
      st.style.borderRadius = radius;
      st.style.fontSize = size;
      if (el.getAttribute('font-family')) st.style.fontFamily = el.getAttribute('font-family');
      const inn = document.createElement('div');
      inn.className = 'upl-stamp-in';
      inn.style.borderRadius = radius;
      inn.style.padding = (el.getAttribute('padding') || (dir === 'vertical' ? '16px 6px' : '6px 16px')).split(/\s+/).map(len).join(' ');
      if (inner === 'single') inn.style.border = Math.max(1, bw * 0.5) + 'px solid ' + col;
      else if (inner === 'double') inn.style.border = Math.max(4, bw + 1) + 'px double ' + col;
      const vertical = dir === 'vertical';
      if (bleed > 0) {
        const b = (bleed * 0.9).toFixed(2);
        inn.style.textShadow = `${b}px 0 0 ${col},-${b}px 0 0 ${col},0 ${b}px 0 ${col},0 -${b}px 0 ${col}`;
      }
      // 圖示與文字的排列方向
      const iconPos = (el.getAttribute('icon-position') || (vertical ? 'top' : 'left')).toLowerCase();
      inn.style.flexDirection = { left: 'row', right: 'row-reverse', top: 'column', bottom: 'column-reverse' }[iconPos] || 'row';
      inn.style.gap = len(el.getAttribute('icon-gap')) || '6px';
      if (icon) {
        const i = document.createElement('i');
        i.className = 'bi ' + icon;
        i.style.fontSize = num(el.getAttribute('icon-size'), 1.1) + 'em';
        i.style.lineHeight = '1';
        i.style.display = 'block';
        inn.appendChild(i);
      }
      // 文字：用 | 分行；直書時每行成為一欄，由右而左排列
      if (label) {
        const tx = document.createElement('div');
        tx.style.display = 'flex';
        tx.style.flexDirection = 'column';
        tx.style.alignItems = 'center';
        tx.style.textAlign = 'center';
        if (vertical) tx.style.writingMode = 'vertical-rl';
        label.split('|').map((s) => s.trim()).filter(Boolean).forEach((line) => {
          const ln = document.createElement('span');
          ln.textContent = line;
          ln.style.letterSpacing = ls;
          ln.style.whiteSpace = 'nowrap';
          if (vertical) ln.style.marginBottom = '-' + ls;
          else ln.style.marginRight = '-' + ls;
          tx.appendChild(ln);
        });
        inn.appendChild(tx);
      }
      st.appendChild(inn);
      st.style.visibility = 'hidden';
      this._over.appendChild(st);
      // 等字型（自訂字體、圖示字型）載入完成再量尺寸，墨跡遮罩才會吻合
      if (document.fonts) {
        try {
          const cs = getComputedStyle(st);
          const loads = [document.fonts.load(`700 ${cs.fontSize} ${cs.fontFamily}`, label || 'A')];
          if (icon) loads.push(document.fonts.load(`${cs.fontSize} bootstrap-icons`));
          await Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 1500))]);
        } catch (e) { /* 略過 */ }
      }
      if (shape === 'circle') {
        const m = Math.max(st.offsetWidth, st.offsetHeight);
        st.style.width = st.style.height = m + 'px';
      }
      const W = st.offsetWidth, H = st.offsetHeight;
      const url = inkMask(W, H, { seed, ink, edge, pressure, shape });
      st.style.webkitMaskImage = `url(${url})`;
      st.style.maskImage = `url(${url})`;

      const place = () => {
        const r = this._rel(t);
        let ax = r.x + r.w / 2, ay = r.y + r.h / 2;
        if (anchor.indexOf('left') !== -1) ax = r.x;
        if (anchor.indexOf('right') !== -1) ax = r.x + r.w;
        if (anchor.indexOf('top') !== -1) ay = r.y;
        if (anchor.indexOf('bottom') !== -1) ay = r.y + r.h;
        st.style.left = (ax + ox) + 'px';
        st.style.top = (ay + oy) + 'px';
      };
      place();
      const T = (s) => `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`;
      st.style.transform = T(1);
      st.style.visibility = '';
      const item = this._register({
        name, nodes: [st], place,
        remove: async (ms) => { await this._anim(st, [{ opacity: 1 }, { opacity: 0 }], ms); st.remove(); this._unregister(item); }
      });

      const impact = 0.72;
      const landing = this._anim(st, [
        { opacity: 0, transform: T(drop), easing: 'cubic-bezier(.55,0,.9,.4)' },
        { opacity: 1, transform: T(1 - 0.12 * bounce), offset: impact, easing: 'ease-out' },
        { opacity: 1, transform: T(1) }
      ], speed, { easing: 'linear' });
      this._sleep(speed * impact).then(() => {
        if (shake > 0) {
          const s = shake;
          this._anim(this._body, [
            { transform: 'none' }, { transform: `translate(${s}px,${s * 0.5}px)` }, { transform: `translate(-${s}px,-${s * 0.5}px)` },
            { transform: `translate(${s * 0.5}px,-${s * 0.5}px)` }, { transform: 'none' }
          ], 180, { fill: 'none', easing: 'linear' });
        }
        const snd = el.getAttribute('sound') || 'on';
        if (this.getAttribute('sound') !== 'off' && snd !== 'off') {
          const vol = Math.min(1, Math.max(0, num(this.getAttribute('volume'), 0.6)));
          if (snd === 'on') thump(vol);
          else { try { const a = new Audio(snd); a.volume = vol; a.play(); } catch (e) { /* 略過 */ } }
        }
      });
      await landing;
      if (stay !== 'forever') {
        this._sleep(num(stay, 2000)).then(() => { if (st.isConnected) item.remove(num(el.getAttribute('fade-out'), 400)); });
      }
      return item;
    }

    /* swap-fx */
    async _fxSwap(el) {
      const t = this._targets(el)[0];
      const to = el.getAttribute('to');
      if (!t || to == null) return;
      const mode = (el.getAttribute('mode') || 'strike').toLowerCase();
      const del = color(el.getAttribute('del-color')) || '#EF6661';
      const ins = color(el.getAttribute('ins-color')) || '#71CD76';
      if (mode === 'retype') {
        const gap = num(el.getAttribute('speed'), 60);
        let s = t.textContent;
        t.style.color = ins;
        while (s.length) { s = s.slice(0, -1); t.textContent = s; this._relayout(); await this._sleep(gap * 0.6); }
        for (const ch of to) { t.textContent += ch; this._relayout(); await this._sleep(gap); }
        return;
      }
      const speed = num(el.getAttribute('speed'), 500);
      if (mode === 'replace') {
        await this._anim(t, [{ opacity: 1 }, { opacity: 0 }], speed / 2, { fill: 'forwards' });
        t.textContent = to;
        t.style.color = ins;
        this._relayout();
        await this._anim(t, [{ opacity: 0 }, { opacity: 1 }], speed / 2, { fill: 'none' });
        t.getAnimations().forEach((a) => a.cancel());
        return;
      }
      // strike：劃掉舊字，新字接在後面
      t.style.color = del;
      t.style.backgroundImage = `linear-gradient(${del},${del})`;
      t.style.backgroundRepeat = 'no-repeat';
      t.style.backgroundPosition = '0 58%';
      await this._anim(t, [{ backgroundSize: '0% 0.09em' }, { backgroundSize: '100% 0.09em' }], speed * 0.6, { easing: 'ease-in-out' });
      const n = document.createElement('span');
      n.className = 'upl-ins';
      n.textContent = to;
      n.style.color = ins;
      t.after(document.createTextNode(' '), n);
      this._relayout();
      await this._anim(n, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], speed * 0.6, { easing: 'ease-out', fill: 'backwards' });
    }

    /* remove-fx */
    async _fxRemove(el) {
      const names = (el.getAttribute('name') || '').split(',').map((s) => s.trim()).filter(Boolean);
      const ms = num(el.getAttribute('speed'), 300);
      const hit = this._live.filter((it) => it.name && names.indexOf(it.name) !== -1);
      await Promise.all(hit.map((it) => it.remove(ms)));
      this._live = this._live.filter((it) => hit.indexOf(it) === -1);
    }

    _unregister(item) {
      const i = this._live.indexOf(item);
      if (i !== -1) this._live.splice(i, 1);
    }
  }

  customElements.define('ui-play', UiPlay);
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
