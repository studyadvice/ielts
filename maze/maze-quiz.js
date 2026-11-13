/*!
 * maze-quiz.js v1.1.0
 * <maze-quiz> 迷宮填空動畫元件，<maze-quiz-panel> 外部題目面板
 *
 * 每次載入隨機生成「唯一解」迷宮（遞迴回溯法產生的完美迷宮，任兩格之間只有一條路），
 * 從左下入口描繪路徑到右上出口，抵達後在出口噴出彩帶，答案從出口跳出並飛入題目空格。
 *
 * <maze-quiz> 屬性：
 *   question      題目，用兩個以上的底線標示空格，例如 "I go _____ every day."
 *   answer        答案，例如 "jogging"
 *   cols          欄數（2 到 40，預設 10）
 *   rows          列數（2 到 40，預設 12）
 *   speed         每一格的描繪毫秒數（預設 70）
 *   autoplay      預設捲動到可見時自動播放；設為 "false" 則需手動開始
 *   seed          指定亂數種子可固定迷宮；不填則每次重新整理都不同
 *   maze-width    迷宮區總寬度；純數字視為 px，也接受 40%、24rem 等寫法（優先於 cell-size）
 *   cell-size     每格大小（px），迷宮寬度依格數自動計算
 *   route-colors  路徑漸層，一到三個顏色，例如 "#51DBCF,#FF91D7" 或 "key,pink,yellow"，沿路徑長度從入口過渡到出口。
 *                 可用色碼（#RGB、#RRGGBB，含透明度的寫法會忽略透明度）、色票名稱、CSS 色名或 rgb()、hsl()；
 *                 以半形或全形逗號、頓號、分號或空白分隔皆可，無法辨識的顏色會在主控台提示
 *   controls      按鈕位置：panel（預設，跟著題目面板）、maze（迷宮下方）、none（不顯示）
 *   hotkey        設為 "false" 時不回應快捷鍵
 *   label-play    開始按鈕文字（預設「開始解謎」）
 *   label-replay  重播按鈕文字（預設「重播」）
 *   label-new     換迷宮按鈕文字（預設「換一個迷宮」）
 *   play-size     開始按鈕尺寸：sm、md、lg、xl，或純數字（字級 rem，內距等比放大）
 *   confetti      設為 "false" 時跳過噴彩帶動畫
 *   hide-until-play  設為 "true"（或只寫屬性名稱）時，按下開始以前隱藏整個迷宮
 *   label-cover   隱藏時遮罩上的提示文字
 *   label-title   題目面板上方的標題（預設「填空題」）；設為空字串時不顯示標題
 *   label-reveal  答案填入後的狀態文字，{answer} 會換成答案（預設「答案揭曉：{answer}」）
 *   show-reveal   設為 "false" 時，答案填入後不顯示狀態文字
 *   reveal-color  揭曉文字的文字色，接受色碼、色票名稱或 CSS 色名（預設 #C6C7BD）
 *   reveal-bg     揭曉文字的背景色；設定後揭曉文字以色塊呈現（預設無背景）
 *
 * 外部面板：<maze-quiz-panel for="迷宮的 id"></maze-quiz-panel> 可放在同一網頁任何位置，
 *           有對應面板時迷宮不顯示內建題目區。答案飛入時若空格不在畫面內，會自動平滑捲動過去。
 *
 * 快捷鍵：Ctrl + Shift + 數字鍵盤 5，啟動目前畫面中露出最多的迷宮。
 *
 * 題庫：在元件內放入
 *   <script type="application/json">[{"q":"I go _____ every day.","a":"jogging"}]</script>
 *
 * 事件：maze-solved（路徑抵達出口）、answer-revealed（答案填入空格）
 *       detail 含 question、answer、cols、rows、steps
 * 方法：play() 播放或重播、regenerate(autoPlay) 換新迷宮
 *
 * MIT License
 */
(() => {
  'use strict';
  if (customElements.get('maze-quiz')) return;

  /* ---------- 樣式（只注入一次） ---------- */
  const STYLE_ID = 'maze-quiz-style';
  const H = ':is(maze-quiz,maze-quiz-panel)';
  const STYLE_TEXT = `
maze-quiz,maze-quiz-panel{display:block;color:#DBEDD8;font-family:"Segoe UI","Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif}
maze-quiz .mq-wrap{display:flex;gap:32px;align-items:stretch;background:#0C0D0C;border:1px solid #3B2A20;border-radius:16px;padding:24px}
maze-quiz .mq-wrap.is-solo{justify-content:center}
maze-quiz .mq-wrap.is-fit{width:fit-content;max-width:100%}
maze-quiz .mq-stage{flex:3 1 0;min-width:0;max-width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
maze-quiz .mq-stage.is-sized{flex:0 0 auto}
maze-quiz .mq-board{position:relative;width:100%;display:flex;justify-content:center}
maze-quiz .mq-svg{display:block;width:100%;height:auto}
maze-quiz .mq-stage:not(.is-sized) .mq-svg{max-height:72vh}
maze-quiz .mq-cover{display:none;position:absolute;left:0;top:0;right:0;bottom:0;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#151615;border:2px dashed #3B2A20;border-radius:12px;padding:16px;text-align:center}
maze-quiz .mq-cover-mark{font-size:4rem;font-weight:800;line-height:1;color:#3B2A20}
maze-quiz .mq-cover-text{font-size:1rem;color:#86877F}
maze-quiz .mq-board.is-concealed .mq-cover{display:flex}
maze-quiz .mq-board.is-concealed .mq-svg{visibility:hidden}
maze-quiz .mq-route,maze-quiz .mq-head{visibility:hidden}
maze-quiz .mq-out{transform-box:fill-box;transform-origin:center}
maze-quiz .mq-out.is-hit{animation:mq-pulse .6s ease-out 2}
maze-quiz .mq-wrap > .mq-panel{flex:2 1 0;min-width:0}
${H} .mq-panel{display:flex;flex-direction:column;justify-content:center;gap:24px;background:#3B2A20;border-radius:12px;padding:32px}
${H} .mq-label{font-size:.875rem;font-weight:700;letter-spacing:.1em;color:#A3C4BC}
${H} .mq-label.is-empty{display:none}
${H} .mq-question{font-size:2.25rem;line-height:1.6;font-weight:600;color:#DBEDD8;word-break:break-word}
${H} .mq-blank{display:inline-block;text-align:center;border-bottom:3px solid #C6C7BD;color:#E3D322;margin:0 6px;padding:0 4px;line-height:1.2}
${H} .mq-blank.is-filled{border-bottom-color:#E3D322;animation:mq-fill .45s ease-out}
${H} .mq-status{font-size:1.125rem;color:#C6C7BD;min-height:1.6em}
${H} .mq-status.has-bg{align-self:flex-start;max-width:100%;padding:6px 16px;border-radius:8px}
${H} .mq-actions{display:flex;gap:12px;flex-wrap:wrap}
maze-quiz .mq-stage > .mq-actions{justify-content:center}
${H} .mq-btn{font-size:1rem;font-weight:700;padding:10px 22px;border-radius:999px;border:2px solid #51DBCF;background:#0C0D0C;color:#51DBCF;cursor:pointer;transition:background .15s,color .15s}
${H} .mq-btn:hover{background:#51DBCF;color:#0C0D0C}
${H} .mq-btn.mq-new{border-color:#B484E8;color:#B484E8}
${H} .mq-btn.mq-new:hover{background:#B484E8;color:#0C0D0C}
${H} .mq-btn[disabled],${H} .mq-btn[disabled]:hover{border-color:#86877F;color:#86877F;background:#0C0D0C;cursor:not-allowed}
.maze-quiz-chip{position:fixed;left:0;top:0;z-index:9999;pointer-events:none;font-family:"Segoe UI","Noto Sans TC",system-ui,sans-serif;font-weight:800;border-radius:999px;border-style:solid;border-color:#0C0D0C;background:#E3D322;color:#0C0D0C;white-space:nowrap;transform:translate(-50%,-50%) scale(0)}
.maze-quiz-confetti{position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:9998}
@keyframes mq-pulse{0%{transform:scale(1)}50%{transform:scale(1.9)}100%{transform:scale(1)}}
@keyframes mq-fill{0%{transform:scale(.6)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
`;
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = STYLE_TEXT;
    document.head.appendChild(s);
  }

  /* ---------- 工具 ---------- */
  const COLORS = {
    wall: '#C6C7BD', route: '#51DBCF', head: '#B6FF00', entry: '#71CD76', exit: '#FF91D7'
  };
  const CONFETTI_COLORS = ['#E3D322', '#FF91D7', '#EF6661', '#71CD76', '#5DBAE8', '#778CE1',
    '#B484E8', '#51DBCF', '#FFA987', '#B6FF00', '#DE8EC9', '#FF2E63'];
  const PALETTE = {
    'background': '#0C0D0C', 'bg-alternative': '#3B2A20', 'shell': '#C6C7BD', 'vanilla': '#DBEDD8',
    'yellow': '#E3D322', 'pink': '#FF91D7', 'red': '#EF6661', 'green': '#71CD76', 'blue': '#5DBAE8',
    'indigo': '#778CE1', 'violet': '#B484E8', 'gray': '#86877F', 'key': '#51DBCF', 'calm': '#A3C4BC',
    'quiet': '#8EA4DE', 'playful': '#FFA987', 'urgent': '#FF2E63', 'energetic': '#B6FF00', 'dreamy': '#DE8EC9'
  };
  const BTN_SIZES = { sm: 0.875, md: 1, lg: 1.25, xl: 1.5 };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  // 解析單一顏色，回傳 [r, g, b]；含透明度的寫法只取顏色，忽略透明度。
  let colorProbe = null;
  function parseColor(str) {
    let s = String(str || '').trim();
    if (!s) return null;
    const key = s.toLowerCase();
    if (PALETTE[key]) s = PALETTE[key];
    const m = s.match(/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
    if (m) {
      let h = m[1];
      if (h.length <= 4) h = h.split('').map(c => c + c).join('');
      return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
    }
    // CSS 色名、rgb()、hsl() 等交給瀏覽器解析；先後填入黑與白，兩次結果不同表示無法辨識。
    if (!colorProbe) colorProbe = document.createElement('canvas').getContext('2d');
    const ctx = colorProbe;
    ctx.fillStyle = '#000000'; ctx.fillStyle = s; const a = ctx.fillStyle;
    ctx.fillStyle = '#ffffff'; ctx.fillStyle = s; const b = ctx.fillStyle;
    if (a !== b) return null;
    if (a[0] === '#') return parseColor(a);
    const n = a.match(/[\d.]+/g);
    return n && n.length >= 3 ? n.slice(0, 3).map(v => Math.round(+v)) : null;
  }
  // 拆開顏色清單：半形或全形逗號、頓號、分號、空白都視為分隔，括號內的內容不拆。
  function splitColors(str) {
    const src = String(str || '').replace(/[，、；;]/g, ',');
    const out = [];
    let cur = '', depth = 0;
    for (const ch of src) {
      if (ch === '(') depth++;
      else if (ch === ')') depth = Math.max(0, depth - 1);
      if (depth === 0 && (ch === ',' || /\s/.test(ch))) {
        if (cur.trim()) out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function mixHex(a, b, t) {
    return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  function cssLength(v) {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (/^\d+(\.\d+)?$/.test(s)) return s + 'px';
    if (/^\d+(\.\d+)?(px|%|rem|em|vw|vh)$/.test(s)) return s;
    return null;
  }

  /* ---------- 迷宮：生成與求解 ---------- */
  const N = 1, E = 2, S = 4, W = 8;
  const DIRS = [
    { bit: N, dx: 0, dy: -1, opp: S },
    { bit: E, dx: 1, dy: 0, opp: W },
    { bit: S, dx: 0, dy: 1, opp: N },
    { bit: W, dx: -1, dy: 0, opp: E }
  ];

  // 遞迴回溯法（以堆疊實作）：產生生成樹形式的完美迷宮，保證任兩格之間只有唯一路徑。
  function generateMaze(cols, rows, rand) {
    const total = cols * rows;
    const cells = new Uint8Array(total).fill(N | E | S | W);
    const seen = new Uint8Array(total);
    const start = Math.floor(rand() * total);
    const stack = [start];
    seen[start] = 1;
    while (stack.length) {
      const cur = stack[stack.length - 1];
      const cx = cur % cols, cy = (cur / cols) | 0;
      const opts = [];
      for (const d of DIRS) {
        const nx = cx + d.dx, ny = cy + d.dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const ni = ny * cols + nx;
        if (!seen[ni]) opts.push([d, ni]);
      }
      if (!opts.length) { stack.pop(); continue; }
      const [d, ni] = opts[Math.floor(rand() * opts.length)];
      cells[cur] &= ~d.bit;
      cells[ni] &= ~d.opp;
      seen[ni] = 1;
      stack.push(ni);
    }
    return cells;
  }

  function solveMaze(cells, cols, rows, from, to) {
    const prev = new Int32Array(cols * rows).fill(-1);
    prev[from] = from;
    const queue = [from];
    for (let h = 0; h < queue.length; h++) {
      const cur = queue[h];
      if (cur === to) break;
      const cx = cur % cols, cy = (cur / cols) | 0;
      for (const d of DIRS) {
        if (cells[cur] & d.bit) continue;
        const nx = cx + d.dx, ny = cy + d.dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const ni = ny * cols + nx;
        if (prev[ni] !== -1) continue;
        prev[ni] = cur;
        queue.push(ni);
      }
    }
    const path = [];
    for (let c = to; ; c = prev[c]) { path.push(c); if (c === from) break; }
    return path.reverse();
  }

  /* ---------- 彩帶（全頁共用一個 canvas，不使用透明度，以縮小或落出畫面方式退場） ---------- */
  const Confetti = {
    canvas: null, ctx: null, parts: [], raf: 0, last: 0, bound: false,
    ensure() {
      if (this.canvas && this.canvas.isConnected) return;
      const c = document.createElement('canvas');
      c.className = 'maze-quiz-confetti';
      document.body.appendChild(c);
      this.canvas = c;
      this.ctx = c.getContext('2d');
      this.resize();
      if (!this.bound) {
        this.bound = true;
        window.addEventListener('resize', () => { if (this.canvas) this.resize(); });
      }
    },
    resize() {
      const d = window.devicePixelRatio || 1;
      this.canvas.width = Math.round(window.innerWidth * d);
      this.canvas.height = Math.round(window.innerHeight * d);
      this.ctx.setTransform(d, 0, 0, d, 0, 0);
    },
    // o.size：彩帶尺寸倍率；o.power：噴發力道倍率（兩者都隨迷宮大小等比調整）
    burst(x, y, o = {}) {
      this.ensure();
      const size = o.size ?? 1;
      const count = Math.round((o.count ?? 160) * clamp(size, 0.55, 1));
      const angle = (o.angle ?? -105) * Math.PI / 180;
      const spread = (o.spread ?? 75) * Math.PI / 180;
      const power = (o.power ?? 1) * clamp(size, 0.5, 1.2);
      for (let i = 0; i < count; i++) {
        const a = angle + (Math.random() * 2 - 1) * spread;
        const v = (5 + Math.random() * 12) * power;
        const r = Math.random();
        const shape = r < 0.55 ? 'rect' : (r < 0.85 ? 'ribbon' : 'dot');
        this.parts.push({
          x, y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          w: (shape === 'ribbon' ? 4 + Math.random() * 2 : 7 + Math.random() * 6) * size,
          h: (shape === 'ribbon' ? 14 + Math.random() * 10 : 5 + Math.random() * 4) * size,
          shape,
          color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() * 2 - 1) * 0.25,
          phase: Math.random() * Math.PI * 2,
          vphase: 0.08 + Math.random() * 0.14,
          term: (2.4 + Math.random() * 2.2) * clamp(size, 0.6, 1.2),
          life: 0,
          max: 150 + Math.random() * 90,
          scale: 1
        });
      }
      if (!this.raf) {
        this.last = performance.now();
        this.raf = requestAnimationFrame(t => this.step(t));
      }
    },
    step(now) {
      const dt = Math.min(3, (now - this.last) / 16.667);
      this.last = now;
      const ctx = this.ctx, vw = window.innerWidth, vh = window.innerHeight;
      ctx.clearRect(0, 0, vw, vh);
      const drag = Math.pow(0.955, dt);
      for (let i = this.parts.length - 1; i >= 0; i--) {
        const p = this.parts[i];
        p.vx *= drag;
        p.vy = Math.min(p.vy * drag + 0.3 * dt, p.term);
        p.x += p.vx * dt + Math.sin(p.phase) * 0.9 * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.phase += p.vphase * dt;
        p.life += dt;
        if (p.life > p.max) p.scale -= 0.035 * dt;
        if (p.scale <= 0 || p.y > vh + 40 || p.x < -80 || p.x > vw + 80) {
          this.parts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(p.scale, p.scale * Math.cos(p.phase));
        ctx.fillStyle = p.color;
        if (p.shape === 'dot') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
      if (this.parts.length) {
        this.raf = requestAnimationFrame(t => this.step(t));
      } else {
        this.raf = 0;
        ctx.clearRect(0, 0, vw, vh);
      }
    }
  };

  /* ---------- 快捷鍵：Ctrl + Shift + 數字鍵盤 5 ---------- */
  const INSTANCES = new Set();
  document.addEventListener('keydown', (e) => {
    if (e.repeat || !e.ctrlKey || e.altKey || e.metaKey || e.code !== 'Numpad5') return;
    // Windows 在 NumLock 開啟時按住 Shift，數字鍵盤 5 會回報為 Clear，且 shiftKey 可能被系統放開，兩種情況都接受。
    if (!e.shiftKey && e.key !== 'Clear') return;
    let best = null, bestArea = 0;
    const vw = window.innerWidth, vh = window.innerHeight;
    for (const m of INSTANCES) {
      if (!m.isConnected || m.getAttribute('hotkey') === 'false' || !m.$svg) continue;
      const r = m.$svg.getBoundingClientRect();
      const w = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      const h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if (w * h > bestArea) { bestArea = w * h; best = m; }
    }
    if (!best) return;
    e.preventDefault();
    best.play();
  });

  /* ---------- 元件 ---------- */
  const CELL = 40;      // 每格在 viewBox 中的邊長
  const PAD = 30;       // 外框留白，用來放入口與出口標記
  const BUCKETS = 72;   // 漸層分段數
  const REF_SIZE = 560; // 答案標籤與彩帶的基準迷宮尺寸（px）
  let UID = 0;

  class MazeQuiz extends HTMLElement {
    static get observedAttributes() {
      return ['question', 'answer', 'cols', 'rows', 'maze-width', 'cell-size', 'route-colors', 'controls',
        'label-play', 'label-replay', 'label-new', 'label-cover', 'play-size', 'hide-until-play',
        'label-title', 'label-reveal', 'show-reveal', 'reveal-color', 'reveal-bg'];
    }

    constructor() {
      super();
      this._ready = false;
      this._runId = 0;
      this._raf = 0;
      this._timers = [];
      this._bank = null;
      this._lastIdx = -1;
      this._gen = 0;
      this._io = null;
      this._ro = null;
      this._chip = null;
      this._played = false;
      this._running = false;
      this._revealed = false;
      this._extPanel = null;
      this._k = 1;
      this._statusText = '';
      this._warnedColors = '';
    }

    connectedCallback() {
      if (this._ready) {
        INSTANCES.add(this);
        if (this._ro) this._ro.observe(this.$svg);
        return;
      }
      const init = () => {
        if (this._ready || !this.isConnected) return;
        injectStyle();
        this._uid = ++UID;
        this._readBank();
        this._buildShell();
        this._ready = true;
        INSTANCES.add(this);
        const ext = this._findExternalPanel();
        if (ext) this._attachPanel(ext, false);
        this.regenerate(false);
        this._setupAutoplay();
        if ('ResizeObserver' in window) {
          this._ro = new ResizeObserver(() => this._updateScale());
          this._ro.observe(this.$svg);
        }
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
      } else {
        init();
      }
    }

    disconnectedCallback() {
      this._cancel();
      INSTANCES.delete(this);
      if (this._io) { this._io.disconnect(); this._io = null; }
      if (this._ro) this._ro.disconnect();
    }

    attributeChangedCallback(name, oldV, newV) {
      if (!this._ready || oldV === newV) return;
      switch (name) {
        case 'maze-width':
        case 'cell-size':
          this._applySize();
          break;
        case 'controls':
          this._placeControls();
          break;
        case 'label-play':
        case 'label-replay':
        case 'label-new':
        case 'label-cover':
        case 'play-size':
          this._applyButtons();
          break;
        case 'hide-until-play':
          if (!this._played) this._setConcealed(this._wantsConceal());
          break;
        case 'label-title':
          this._applyTitle();
          break;
        case 'label-reveal':
        case 'show-reveal':
          if (this._revealed) this._setStatus(this._revealText(), true);
          break;
        case 'reveal-color':
        case 'reveal-bg':
          this._paintStatus();
          break;
        case 'route-colors':
          this._cancel();
          this._renderMaze();
          this._resetReveal();
          this._played = false;
          this._applyButtons();
          this._setConcealed(this._wantsConceal());
          this._setStatus(this._readyText());
          break;
        default:
          this.regenerate(this._played);
      }
    }

    /* ----- 公開方法 ----- */
    regenerate(autoPlay = true) {
      if (!this._ready) return;
      this._cancel();
      const cols = this._int('cols', 10, 2, 40);
      const rows = this._int('rows', 12, 2, 40);
      this._cols = cols;
      this._rows = rows;

      // 題目
      if (this._bank) {
        let i;
        do { i = Math.floor(Math.random() * this._bank.length); }
        while (this._bank.length > 1 && i === this._lastIdx);
        this._lastIdx = i;
        this._q = this._bank[i].q;
        this._a = this._bank[i].a;
      } else {
        this._q = this.getAttribute('question') || 'I go _____ every day.';
        this._a = this.getAttribute('answer') || 'jogging';
      }

      // 迷宮
      const seedAttr = this.getAttribute('seed');
      const rand = (seedAttr !== null && seedAttr !== '')
        ? mulberry32(hashString(seedAttr) + this._gen)
        : Math.random;
      this._gen++;
      this._cells = generateMaze(cols, rows, rand);
      this._routeCells = solveMaze(this._cells, cols, rows, (rows - 1) * cols, cols - 1);
      this._steps = this._routeCells.length;

      this._applySize();
      this._renderMaze();
      this._revealed = false;
      this._renderQuestion();
      this._played = false;
      this.$play.disabled = false;
      this._applyButtons();
      this._setConcealed(this._wantsConceal());
      this._setStatus(this._readyText());
      if (autoPlay) this.play();
    }

    play() {
      if (!this._ready || this._running) return;
      this._cancel();
      this._resetReveal();
      const run = ++this._runId;
      this._running = true;
      this._played = true;
      this.$play.disabled = true;
      this._setStatus('正在描繪路徑……');

      const reveal = this.$reveal, head = this.$head;
      const L = this._L;
      reveal.style.strokeDasharray = `${L} ${L}`;
      reveal.style.strokeDashoffset = String(L);

      const speed = this._int('speed', 70, 10, 1000);
      const dur = Math.min(15000, Math.max(1200, this._steps * speed));
      let t0 = 0;
      const begin = () => {
        this.$route.style.visibility = 'visible';
        head.style.visibility = 'visible';
        t0 = performance.now();
        this._raf = requestAnimationFrame(tick);
      };
      const tick = (now) => {
        if (run !== this._runId) return;
        const p = Math.min(1, (now - t0) / dur);
        const e = -(Math.cos(Math.PI * p) - 1) / 2;   // easeInOutSine
        const len = L * e;
        reveal.style.strokeDashoffset = String(L - len);
        const pt = this._pointAt(len);
        head.setAttribute('cx', pt[0]);
        head.setAttribute('cy', pt[1]);
        if (p < 1) this._raf = requestAnimationFrame(tick);
        else this._arrive(run);
      };
      // 隱藏模式：先以入口為圓心展開迷宮，再開始描繪路徑。
      if (this._concealed) this._later(run, this._unveil(), begin);
      else begin();
    }

    /* ----- 外部面板 ----- */
    _findExternalPanel() {
      if (!this.id) return null;
      return document.querySelector(`maze-quiz-panel[for="${CSS.escape(this.id)}"]`);
    }

    _attachPanel(panelEl, refresh = true) {
      if (this._extPanel === panelEl) return;
      if (this._extPanel) this._extPanel._owner = null;
      this._extPanel = panelEl;
      panelEl._owner = this;
      this.$innerPanel.remove();
      this.$wrap.classList.add('is-solo');
      const inner = document.createElement('div');
      inner.className = 'mq-panel';
      panelEl.replaceChildren(inner);
      this._mountPanel(inner);
      this._applySize();
      if (refresh) this._refreshPanel();
    }

    _detachPanel(panelEl) {
      if (this._extPanel !== panelEl) return;
      panelEl._owner = null;
      this._extPanel = null;
      this.$wrap.classList.remove('is-solo');
      this.$wrap.appendChild(this.$innerPanel);
      this._mountPanel(this.$innerPanel);
      this._applySize();
      this._refreshPanel();
    }

    _mountPanel(host) {
      this.$actions.remove();
      host.innerHTML = `
<div class="mq-label"></div>
<div class="mq-question"></div>
<div class="mq-status"></div>`;
      this._panelHost = host;
      this.$title = host.querySelector('.mq-label');
      this.$question = host.querySelector('.mq-question');
      this.$status = host.querySelector('.mq-status');
      this._applyTitle();
      this._placeControls();
    }

    _refreshPanel() {
      if (this._q === undefined) return;
      this._renderQuestion();
      if (this._revealed) {
        this.$blank.textContent = this._a;
        this.$blank.classList.add('is-filled');
      }
      this.$status.textContent = this._statusText;
      this._paintStatus();
    }

    _placeControls() {
      const mode = (this.getAttribute('controls') || 'panel').toLowerCase();
      if (mode === 'none') { this.$actions.remove(); return; }
      if (mode === 'maze') this.$stage.appendChild(this.$actions);
      else if (this._panelHost) this._panelHost.appendChild(this.$actions);
    }

    /* ----- 尺寸與等比縮放 ----- */
    _applySize() {
      const mw = cssLength(this.getAttribute('maze-width'));
      const cs = parseFloat(this.getAttribute('cell-size'));
      let width = mw;
      if (!width && cs > 0 && this._cols) {
        width = ((this._cols * CELL + PAD * 2) * cs / CELL).toFixed(1) + 'px';
      }
      this.$stage.style.width = width || '';
      this.$stage.classList.toggle('is-sized', !!width);
      this.$wrap.classList.toggle('is-fit', !!width && !!this._extPanel && !/%$/.test(width));
      this._updateScale();
    }

    // 依迷宮實際顯示大小調整線條最細值，並計算答案標籤與彩帶的縮放倍率。
    _updateScale() {
      const vb = this._vb;
      if (!vb || !this.$walls) return;
      const r = this.$svg.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const s = Math.min(r.width / vb.w, r.height / vb.h);
      this._k = clamp(Math.min(vb.w * s, vb.h * s) / REF_SIZE, 0.4, 1.25);
      const wall = Math.max(CELL * 0.1, 1.5 / s);
      const route = Math.min(CELL * 0.55, Math.max(CELL * 0.3, 3 / s));
      this.$walls.setAttribute('stroke-width', wall);
      this.$route.setAttribute('stroke-width', route);
      this.$reveal.setAttribute('stroke-width', route + 2 / s);
      const mark = Math.max(CELL * 0.2, 4 / s);
      this.$in.setAttribute('r', mark);
      this.$out.setAttribute('r', mark);
      this.$head.setAttribute('r', Math.max(CELL * 0.22, 4.5 / s));
      this.$head.setAttribute('stroke-width', Math.max(3, 1.5 / s));
    }

    /* ----- 內部流程 ----- */
    _arrive(run) {
      this.$head.style.visibility = 'hidden';
      this.$out.classList.add('is-hit');
      this._setStatus('抵達出口！');
      this._emit('maze-solved');
      const p = this._exitScreenPoint();
      const k = this._k;
      if (this._confettiOn()) {
        Confetti.burst(p.x, p.y, { angle: -110, spread: 70, count: 170, size: k });
        Confetti.burst(p.x, p.y, { angle: -45, spread: 35, count: 50, power: 0.8, size: k });
      }
      this._later(run, 220, () => this._popChip(run));
    }

    _popChip(run) {
      const p = this._exitScreenPoint();
      const k = this._k;
      const chip = document.createElement('div');
      chip.className = 'maze-quiz-chip';
      chip.textContent = this._a;
      chip.style.left = p.x + 'px';
      chip.style.top = p.y + 'px';
      chip.style.fontSize = (1.75 * k).toFixed(3) + 'rem';
      chip.style.padding = `${Math.round(8 * k)}px ${Math.round(22 * k)}px`;
      chip.style.borderWidth = Math.max(2, Math.round(3 * k)) + 'px';
      document.body.appendChild(chip);
      this._chip = chip;
      this._chipLift = Math.round(30 * k);
      chip.animate([
        { transform: 'translate(-50%,-50%) scale(0) rotate(-14deg)' },
        { transform: `translate(-50%,-50%) translateY(${-Math.round(40 * k)}px) scale(1.3) rotate(6deg)`, offset: 0.6 },
        { transform: `translate(-50%,-50%) translateY(${-this._chipLift}px) scale(1) rotate(0deg)` }
      ], { duration: 560, easing: 'ease-out', fill: 'forwards' });
      this._setStatus('答案出現了！');
      this._later(run, 1100, () => this._ensureBlankVisible(run, () => this._flyChip(run, p)));
    }

    // 空格不在畫面內時，先平滑捲動到空格再起飛。
    _ensureBlankVisible(run, go) {
      const r = this.$blank.getBoundingClientRect();
      const inView = r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth;
      if (inView) { go(); return; }
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.removeEventListener('scrollend', finish);
        if (run === this._runId) go();
      };
      window.addEventListener('scrollend', finish);
      this._later(run, 1200, finish);
      this.$blank.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }

    _flyChip(run, origin) {
      const chip = this._chip;
      if (!chip) return;
      const r = this.$blank.getBoundingClientRect();
      const dx = r.left + r.width / 2 - origin.x;
      const dy = r.top + r.height / 2 - origin.y;
      const lift = this._chipLift;
      const arc = Math.min(160, Math.hypot(dx, dy) * 0.25 + 40);
      const chipFont = parseFloat(getComputedStyle(chip).fontSize) || 28;
      const blankFont = parseFloat(getComputedStyle(this.$blank).fontSize) || chipFont;
      const endScale = clamp(blankFont / chipFont, 0.4, 3);
      const anim = chip.animate([
        { transform: `translate(-50%,-50%) translate(0px,${-lift}px) scale(1)` },
        { transform: `translate(-50%,-50%) translate(${dx * 0.5}px,${dy * 0.5 - arc}px) scale(${(1 + endScale) / 2 * 1.12}) rotate(-6deg)`, offset: 0.5 },
        { transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(${endScale}) rotate(0deg)` }
      ], { duration: 780, easing: 'cubic-bezier(.45,0,.3,1)', fill: 'forwards' });
      anim.onfinish = () => {
        if (run !== this._runId) return;
        chip.remove();
        this._chip = null;
        this._revealed = true;
        this.$blank.textContent = this._a;
        this.$blank.classList.remove('is-filled');
        void this.$blank.offsetWidth;
        this.$blank.classList.add('is-filled');
        if (this._confettiOn()) {
          const b = this.$blank.getBoundingClientRect();
          Confetti.burst(b.left + b.width / 2, b.top, { angle: -90, spread: 55, count: 55, power: 0.6, size: this._k });
        }
        this._setStatus(this._revealText(), true);
        this._running = false;
        this.$play.disabled = false;
        this.$play.textContent = this._label('label-replay', '重播');
        this._emit('answer-revealed');
      };
    }

    _resetReveal() {
      this._revealed = false;
      if (this.$blank) {
        this.$blank.textContent = '';
        this.$blank.classList.remove('is-filled');
      }
      this.$route.style.visibility = 'hidden';
      this.$head.style.visibility = 'hidden';
      this.$out.classList.remove('is-hit');
    }

    _cancel() {
      this._runId++;
      cancelAnimationFrame(this._raf);
      this._timers.forEach(clearTimeout);
      this._timers = [];
      if (this._chip) { this._chip.remove(); this._chip = null; }
      this._running = false;
      if (this.$play) this.$play.disabled = false;
    }

    _later(run, ms, fn) {
      const id = setTimeout(() => { if (run === this._runId) fn(); }, ms);
      this._timers.push(id);
    }

    /* ----- 按鈕、彩帶與隱藏 ----- */
    _label(name, def) {
      const v = this.getAttribute(name);
      return (v !== null && v.trim() !== '') ? v : def;
    }

    // 題目面板標題：未設定用預設值，設為空字串則隱藏。
    _applyTitle() {
      if (!this.$title) return;
      const v = this.getAttribute('label-title');
      const text = v === null ? '填空題' : v.trim();
      this.$title.textContent = text;
      this.$title.classList.toggle('is-empty', text === '');
    }

    _revealText() {
      if ((this.getAttribute('show-reveal') || '').trim().toLowerCase() === 'false') return '';
      return this._label('label-reveal', '答案揭曉：{answer}').replace(/\{answer\}/g, this._a);
    }

    _readyText() {
      return this.getAttribute('autoplay') === 'false'
        ? `準備就緒，按下「${this._label('label-play', '開始解謎')}」或 Ctrl + Shift + 數字鍵盤 5。`
        : '準備就緒。';
    }

    _applyButtons() {
      if (!this.$play) return;
      this.$play.textContent = this._played && !this._running
        ? this._label('label-replay', '重播')
        : this._label('label-play', '開始解謎');
      this.$new.textContent = this._label('label-new', '換一個迷宮');
      if (this.$coverText) this.$coverText.textContent = this._label('label-cover', '按下開始，迷宮就會出現');
      const raw = (this.getAttribute('play-size') || '').trim().toLowerCase();
      let size = BTN_SIZES[raw];
      if (size === undefined && /^\d+(\.\d+)?$/.test(raw)) size = clamp(parseFloat(raw), 0.6, 3);
      if (size === undefined) {
        this.$play.style.fontSize = '';
        this.$play.style.padding = '';
        this.$play.style.borderWidth = '';
      } else {
        this.$play.style.fontSize = size + 'rem';
        this.$play.style.padding = `${Math.round(10 * size)}px ${Math.round(22 * size)}px`;
        this.$play.style.borderWidth = Math.max(2, Math.round(2 * size)) + 'px';
      }
    }

    _confettiOn() {
      return (this.getAttribute('confetti') || '').trim().toLowerCase() !== 'false';
    }

    _wantsConceal() {
      const v = this.getAttribute('hide-until-play');
      return v !== null && v.trim().toLowerCase() !== 'false';
    }

    _setConcealed(on) {
      this._concealed = !!on;
      this.$board.classList.toggle('is-concealed', this._concealed);
    }

    // 移除遮罩，以入口為圓心把迷宮展開；回傳展開動畫的毫秒數。
    _unveil() {
      this._setConcealed(false);
      const vb = this._vb;
      const cx = ((PAD + CELL / 2) / vb.w * 100).toFixed(1);
      const cy = ((vb.h - PAD * 0.45) / vb.h * 100).toFixed(1);
      const dur = 650;
      if (this.$svg.animate) {
        this.$svg.animate([
          { clipPath: `circle(0% at ${cx}% ${cy}%)` },
          { clipPath: `circle(150% at ${cx}% ${cy}%)` }
        ], { duration: dur, easing: 'cubic-bezier(.4,0,.2,1)' });
      }
      return dur;
    }

    _setStatus(t, isReveal = false) {
      this._statusText = t;
      this._statusIsReveal = isReveal;
      if (this.$status) this.$status.textContent = t;
      this._paintStatus();
    }

    // 只有揭曉文字套用 reveal-color 與 reveal-bg，其他狀態文字維持預設樣式。
    _paintStatus() {
      const el = this.$status;
      if (!el) return;
      const on = !!this._statusIsReveal && this._statusText !== '';
      const pick = (name) => {
        const c = on ? parseColor(this.getAttribute(name)) : null;
        return c ? mixHex(c, c, 0) : '';
      };
      const fg = pick('reveal-color'), bg = pick('reveal-bg');
      el.style.color = fg;
      el.style.backgroundColor = bg;
      el.classList.toggle('has-bg', !!bg);
    }

    _exitScreenPoint() {
      const m = this.$svg.getScreenCTM();
      if (!m) return { x: window.innerWidth / 2, y: 0 };
      return new DOMPoint(this._exit[0], this._exit[1]).matrixTransform(m);
    }

    _pointAt(len) {
      const pts = this._pts, cum = this._cum;
      if (len <= 0) return pts[0];
      for (let i = 1; i < pts.length; i++) {
        if (cum[i] >= len) {
          const seg = cum[i] - cum[i - 1] || 1;
          const t = (len - cum[i - 1]) / seg;
          return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
        }
      }
      return pts[pts.length - 1];
    }

    _emit(type) {
      this.dispatchEvent(new CustomEvent(type, {
        bubbles: true,
        detail: { question: this._q, answer: this._a, cols: this._cols, rows: this._rows, steps: this._steps }
      }));
    }

    _setupAutoplay() {
      if (this.getAttribute('autoplay') === 'false') return;
      if (!('IntersectionObserver' in window)) { this.play(); return; }
      this._io = new IntersectionObserver((entries) => {
        for (const en of entries) {
          // 元件幾乎完全進入畫面（或已佔滿視窗高度）才播放，確保看得到左下入口。
          const mostlyVisible = en.intersectionRatio >= 0.95 ||
            en.intersectionRect.height >= window.innerHeight * 0.85;
          if (en.isIntersecting && mostlyVisible && !this._played && !this._running) {
            this.play();
            this._io.disconnect();
            this._io = null;
            break;
          }
        }
      }, { threshold: [0.25, 0.5, 0.75, 0.9, 0.95, 1] });
      this._io.observe(this);
    }

    _readBank() {
      const s = this.querySelector('script[type="application/json"]');
      if (!s) return;
      try {
        const arr = JSON.parse(s.textContent);
        if (Array.isArray(arr)) {
          const list = arr
            .filter(o => o && (o.q || o.question) && (o.a || o.answer))
            .map(o => ({ q: String(o.q ?? o.question), a: String(o.a ?? o.answer) }));
          this._bank = list.length ? list : null;
        }
      } catch (err) {
        console.warn('[maze-quiz] 題庫 JSON 格式錯誤，改用 question 與 answer 屬性。', err);
        this._bank = null;
      }
    }

    _buildShell() {
      this.innerHTML = `
<div class="mq-wrap">
  <div class="mq-stage">
    <div class="mq-board">
      <svg class="mq-svg" xmlns="http://www.w3.org/2000/svg"></svg>
      <div class="mq-cover"><div class="mq-cover-mark">?</div><div class="mq-cover-text"></div></div>
    </div>
  </div>
  <div class="mq-panel"></div>
</div>`;
      this.$wrap = this.querySelector('.mq-wrap');
      this.$stage = this.querySelector('.mq-stage');
      this.$svg = this.querySelector('.mq-svg');
      this.$board = this.querySelector('.mq-board');
      this.$coverText = this.querySelector('.mq-cover-text');
      this.$innerPanel = this.querySelector('.mq-wrap > .mq-panel');
      this.$actions = document.createElement('div');
      this.$actions.className = 'mq-actions';
      this.$actions.innerHTML = `
<button type="button" class="mq-btn mq-play">開始解謎</button>
<button type="button" class="mq-btn mq-new">換一個迷宮</button>`;
      this.$play = this.$actions.querySelector('.mq-play');
      this.$new = this.$actions.querySelector('.mq-new');
      this.$play.addEventListener('click', () => this.play());
      this.$new.addEventListener('click', () => this.regenerate(true));
      this._mountPanel(this.$innerPanel);
    }

    // 回傳一到三個顏色；無法辨識或超過三個時在主控台提示一次。
    _routeColors() {
      const attr = this.getAttribute('route-colors') || '';
      const tokens = splitColors(attr);
      const list = [], bad = [];
      for (const t of tokens) {
        const c = parseColor(t);
        if (c) list.push(c); else bad.push(t);
      }
      if ((bad.length || list.length > 3) && this._warnedColors !== attr) {
        this._warnedColors = attr;
        if (bad.length) console.warn(`[maze-quiz] route-colors 無法辨識：${bad.join('、')}`);
        if (list.length > 3) console.warn('[maze-quiz] route-colors 最多三個顏色，其餘忽略。');
      }
      const stops = list.slice(0, 3);
      if (!stops.length) stops.push(parseColor(COLORS.route));
      return stops;
    }

    _renderMaze() {
      const cells = this._cells, cols = this._cols, rows = this._rows, route = this._routeCells;
      const w = cols * CELL + PAD * 2;
      const h = rows * CELL + PAD * 2;
      this._vb = { w, h };
      const center = (i) => [PAD + (i % cols) * CELL + CELL / 2, PAD + ((i / cols) | 0) * CELL + CELL / 2];

      // 牆壁：每格畫北牆與西牆，最右欄補東牆，最下列補南牆；略過入口（左下的南牆）與出口（右上的北牆）。
      let walls = '';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const c = cells[y * cols + x];
          const X = PAD + x * CELL, Y = PAD + y * CELL;
          if ((c & N) && !(y === 0 && x === cols - 1)) walls += `M${X} ${Y}h${CELL}`;
          if (c & W) walls += `M${X} ${Y}v${CELL}`;
          if (x === cols - 1 && (c & E)) walls += `M${X + CELL} ${Y}v${CELL}`;
          if (y === rows - 1 && (c & S) && x !== 0) walls += `M${X} ${Y + CELL}h${CELL}`;
        }
      }

      // 路徑頂點：入口外側 → 各格中心 → 出口外側，合併共線點，並記錄累計長度。
      const entry = [PAD + CELL / 2, h - PAD * 0.45];
      const exit = [PAD + (cols - 1) * CELL + CELL / 2, PAD * 0.45];
      this._exit = exit;
      const raw = [entry, ...route.map(center), exit];
      const pts = [raw[0]];
      for (let i = 1; i < raw.length - 1; i++) {
        const a = pts[pts.length - 1], b = raw[i], c = raw[i + 1];
        const collinear = (a[0] === b[0] && b[0] === c[0]) || (a[1] === b[1] && b[1] === c[1]);
        if (!collinear) pts.push(b);
      }
      pts.push(raw[raw.length - 1]);
      const cum = [0];
      for (let i = 1; i < pts.length; i++) {
        cum.push(cum[i - 1] + Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]));
      }
      this._pts = pts;
      this._cum = cum;
      this._L = cum[cum.length - 1];
      const routeD = 'M' + pts.map(p => `${p[0]} ${p[1]}`).join('L');

      // 沿路徑長度漸層：把路徑切成多段，每段一個插值顏色；再用遮罩控制描繪進度。
      const stops = this._routeColors();
      const same = stops.every(c => c.every((v, i) => v === stops[0][i]));
      const n = same ? 1 : BUCKETS;
      // 顏色平均分配在路徑上：兩色時入口到出口，三色時中段經過第二色。
      const colorAt = (t) => {
        if (stops.length === 1) return mixHex(stops[0], stops[0], 0);
        const x = t * (stops.length - 1);
        const i = Math.min(stops.length - 2, Math.floor(x));
        return mixHex(stops[i], stops[i + 1], x - i);
      };
      const L = this._L;
      let segs = '';
      for (let k = 0; k < n; k++) {
        const a = L * k / n, b = L * (k + 1) / n;
        const sp = [this._pointAt(a)];
        for (let i = 1; i < pts.length - 1; i++) if (cum[i] > a && cum[i] < b) sp.push(pts[i]);
        sp.push(this._pointAt(b));
        const d = 'M' + sp.map(p => `${+p[0].toFixed(2)} ${+p[1].toFixed(2)}`).join('L');
        segs += `<path d="${d}" stroke="${colorAt(n === 1 ? 0 : (k + 0.5) / n)}"/>`;
      }

      const maskId = `mq-mask-${this._uid}`;
      this.$svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      this.$svg.innerHTML = `
<defs><mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">
  <path class="mq-reveal" d="${routeD}" fill="none" stroke="#FFFFFF" stroke-width="${CELL * 0.3 + 2}" stroke-linecap="round" stroke-linejoin="round"/>
</mask></defs>
<g class="mq-route" mask="url(#${maskId})" fill="none" stroke-width="${CELL * 0.3}" stroke-linecap="round" stroke-linejoin="round">${segs}</g>
<path class="mq-walls" d="${walls}" fill="none" stroke="${COLORS.wall}" stroke-width="${CELL * 0.1}" stroke-linecap="square"/>
<circle class="mq-in" cx="${entry[0]}" cy="${entry[1]}" r="${CELL * 0.2}" fill="${COLORS.entry}"/>
<circle class="mq-out" cx="${exit[0]}" cy="${exit[1]}" r="${CELL * 0.2}" fill="${COLORS.exit}"/>
<circle class="mq-head" cx="${entry[0]}" cy="${entry[1]}" r="${CELL * 0.22}" fill="${COLORS.head}" stroke="#0C0D0C" stroke-width="3"/>`;
      this.$reveal = this.$svg.querySelector('.mq-reveal');
      this.$route = this.$svg.querySelector('.mq-route');
      this.$walls = this.$svg.querySelector('.mq-walls');
      this.$in = this.$svg.querySelector('.mq-in');
      this.$out = this.$svg.querySelector('.mq-out');
      this.$head = this.$svg.querySelector('.mq-head');
      this._updateScale();
    }

    _renderQuestion() {
      const q = this._q;
      const m = q.match(/_{2,}/);
      const before = m ? q.slice(0, m.index) : q + ' ';
      const after = m ? q.slice(m.index + m[0].length) : '';
      this.$question.textContent = '';
      this.$question.append(document.createTextNode(before));
      const blank = document.createElement('span');
      blank.className = 'mq-blank';
      blank.style.minWidth = `${Math.max(this._a.length + 2, 6)}ch`;
      this.$question.append(blank, document.createTextNode(after));
      this.$blank = blank;
    }

    _int(name, def, min, max) {
      const v = parseInt(this.getAttribute(name), 10);
      if (Number.isNaN(v)) return def;
      return Math.min(max, Math.max(min, v));
    }
  }

  /* ---------- 外部題目面板 ---------- */
  class MazeQuizPanel extends HTMLElement {
    connectedCallback() {
      injectStyle();
      const id = this.getAttribute('for');
      const maze = id && document.getElementById(id);
      if (maze && maze._ready && maze._attachPanel) maze._attachPanel(this);
    }
    disconnectedCallback() {
      if (this._owner) this._owner._detachPanel(this);
    }
  }

  customElements.define('maze-quiz', MazeQuiz);
  customElements.define('maze-quiz-panel', MazeQuizPanel);
})();
