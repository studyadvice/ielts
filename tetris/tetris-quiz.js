/* =========================================================================
 * <tetris-quiz>：俄羅斯方塊填空動畫元件
 *
 * <tetris-quiz question="I go _____ every day." answer="jogging" rows="8"></tetris-quiz>
 *
 * 棋盤寬度固定 8 欄，列數由 rows 設定。每次載入都會隨機生成一份「保證完全消除」的劇本：
 * 方塊依序落下、旋轉、鎖定、滿行消除，最後一塊落下後棋盤清空，答案從棋盤跳出飛進題目的空格。
 * 完全消除時觸發 tetris-cleared 事件，可搭配 show-template 與 <link-when> 使用。
 * 不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。
 * ========================================================================= */
(() => {
  'use strict';
  if (customElements.get('tetris-quiz')) return;

  /* ---------- 樣式（只注入一次） ---------- */
  const STYLE_ID = 'tetris-quiz-style';
  const H = ':is(tetris-quiz,tetris-quiz-panel)';
  // 可被 extra-class 覆蓋的預設值：權重只有一個 class（0,1,0），樣式表又插在 head 最前面，
  // 所以同權重的 Bootstrap 或自訂類別（例如 .bp-lnh-5）排在後面就會勝出，不需要 !important。
  const L = ':where(tetris-quiz,tetris-quiz-panel)';
  const STYLE_TEXT = `
tetris-quiz,tetris-quiz-panel{display:block;color:#DBEDD8;font-family:"Segoe UI","Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif}
tetris-quiz .tq-wrap{display:flex;gap:32px;align-items:stretch;background:#0C0D0C;border:1px solid #2D2D2D;border-radius:16px;padding:24px}
tetris-quiz .tq-wrap.is-solo{justify-content:center}
tetris-quiz .tq-wrap.is-fit{width:fit-content;max-width:100%}
tetris-quiz .tq-stage{flex:0 0 auto;width:min(100%,380px);min-width:0;max-width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
tetris-quiz .tq-stage.is-sized{flex:0 0 auto}
tetris-quiz .tq-wrap.is-solo > .tq-stage:not(.is-sized){width:min(100%,380px)}
tetris-quiz .tq-board{position:relative;width:100%;display:flex;justify-content:center}
tetris-quiz .tq-svg{display:block;width:100%;height:auto;overflow:visible}
tetris-quiz .tq-stage:not(.is-sized) .tq-svg{max-height:78vh}
tetris-quiz .tq-c{transform-box:fill-box;transform-origin:center}
tetris-quiz .tq-cover{display:none;position:absolute;left:0;top:0;right:0;bottom:0;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#151615;border:2px dashed #2D2D2D;border-radius:12px;padding:16px;text-align:center}
tetris-quiz .tq-cover-mark{font-size:4rem;font-weight:800;line-height:1;color:#2D2D2D}
tetris-quiz .tq-cover-text{font-size:1rem;color:#86877F}
tetris-quiz .tq-board.is-concealed .tq-cover{display:flex}
tetris-quiz .tq-board.is-concealed .tq-svg{visibility:hidden}
tetris-quiz .tq-hud{width:100%;display:flex;flex-direction:column;gap:8px}
tetris-quiz .tq-hud-row{display:flex;align-items:baseline;gap:12px}
tetris-quiz .tq-hud-label{font-size:.875rem;font-weight:700;letter-spacing:.08em;color:#A3C4BC}
tetris-quiz .tq-hud-score{font-size:1.75rem;font-weight:800;line-height:1.2;color:#E3D322;font-variant-numeric:tabular-nums}
tetris-quiz .tq-hud-target{margin-left:auto;font-size:.875rem;color:#86877F}
tetris-quiz .tq-hud-bar{height:8px;border-radius:999px;background:#2D2D2D;overflow:hidden}
tetris-quiz .tq-hud-fill{height:100%;width:0;border-radius:999px;background:#51DBCF;transition:width .3s}
tetris-quiz .tq-wrap > .tq-panel{flex:1 1 0;min-width:0}
${H} .tq-panel{display:flex;flex-direction:column;justify-content:center}
${L} .tq-panel{gap:24px;background:#2D2D2D;border-radius:12px;padding:32px;font-size:2.25rem;line-height:1.6;font-weight:600;color:#DBEDD8}
${H} .tq-label{font-size:max(.75rem, calc(.875em / 2.25));line-height:1.5;font-weight:700;letter-spacing:.1em;color:#A3C4BC}
${H} .tq-label.is-empty{display:none}
${H} .tq-question{font-size:1em;line-height:inherit;font-weight:inherit;color:inherit;word-break:break-word}
${H} .tq-blank{display:inline-block;text-align:center;border-bottom:3px solid #C6C7BD;color:#E3D322;margin:0 6px;padding:0 4px;line-height:1.2}
${H} .tq-blank.is-filled{border-bottom-color:#E3D322;animation:tq-fill .45s ease-out}
${H} .tq-status{font-size:max(1rem, calc(1.125em / 2.25));line-height:1.5;font-weight:400;color:#C6C7BD;min-height:1.6em}
${H} .tq-status.has-bg{align-self:flex-start;max-width:100%;padding:6px 16px;border-radius:8px}
${H} .tq-actions{display:flex;gap:12px;flex-wrap:wrap}
tetris-quiz .tq-stage > .tq-actions{justify-content:center}
${H} .tq-btn{font-size:1rem;line-height:1.5;font-weight:700;padding:10px 22px;border-radius:999px;border:2px solid #51DBCF;background:#0C0D0C;color:#51DBCF;cursor:pointer;transition:background .15s,color .15s}
${H} .tq-btn:hover{background:#51DBCF;color:#0C0D0C}
${H} .tq-btn.tq-new{border-color:#B484E8;color:#B484E8}
${H} .tq-btn.tq-new:hover{background:#B484E8;color:#0C0D0C}
${H} .tq-btn[disabled],${H} .tq-btn[disabled]:hover{border-color:#86877F;color:#86877F;background:#0C0D0C;cursor:not-allowed}
.tetris-quiz-chip{position:fixed;left:0;top:0;z-index:9999;pointer-events:none;font-family:"Segoe UI","Noto Sans TC",system-ui,sans-serif;font-weight:800;border-radius:999px;border-style:solid;border-color:#0C0D0C;background:#E3D322;color:#0C0D0C;white-space:nowrap;transform:translate(-50%,-50%) scale(0)}
.tetris-quiz-confetti{position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:9998}
@keyframes tq-fill{0%{transform:scale(.6)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
`;
  function syncClasses(el, prev, value) {
    const next = (value || '').split(/\s+/).filter(t => t && t !== 'tq-panel');
    for (const t of prev || []) if (!next.includes(t)) el.classList.remove(t);
    for (const t of next) el.classList.add(t);
    return next;
  }

  /* 以文字節點加入內容，只把 <br> 轉成換行；其他標籤原樣顯示為文字，不經過 innerHTML */
  function appendWithBreaks(el, text) {
    text.split(/<br\s*\/?>/i).forEach((part, i) => {
      if (i) el.append(document.createElement('br'));
      if (part) el.append(document.createTextNode(part));
    });
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = STYLE_TEXT;
    document.head.prepend(s);
  }

  const CONFETTI_COLORS = ['#E3D322', '#FF91D7', '#EF6661', '#71CD76', '#5DBAE8', '#778CE1',
    '#B484E8', '#51DBCF', '#FFA987', '#B6FF00', '#C394CD', '#FF2E63'];
  const PALETTE = {
    'background': '#0C0D0C', 'bg-alternative': '#2D2D2D', 'shell': '#C6C7BD', 'vanilla': '#DBEDD8',
    'yellow': '#E3D322', 'pink': '#FF91D7', 'red': '#EF6661', 'green': '#71CD76', 'blue': '#5DBAE8',
    'indigo': '#778CE1', 'violet': '#B484E8', 'gray': '#86877F', 'key': '#51DBCF', 'calm': '#A3C4BC',
    'quiet': '#8EA4DE', 'playful': '#FFA987', 'urgent': '#FF2E63', 'energetic': '#B6FF00', 'dreamy': '#C394CD', 'salmon': '#FFC88A'
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


  /* ---------- 方塊：形狀與旋轉 ---------- */
  const COLS = 8;       // 棋盤寬度固定 8 欄
  const HEAD = 4;       // 棋盤上方的出生區（列數）
  const BASE_SHAPES = {
    I: [[0, 0], [1, 0], [2, 0], [3, 0]],
    O: [[0, 0], [1, 0], [0, 1], [1, 1]],
    T: [[0, 0], [1, 0], [2, 0], [1, 1]],
    S: [[1, 0], [2, 0], [0, 1], [1, 1]],
    Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
    J: [[0, 0], [0, 1], [1, 1], [2, 1]],
    L: [[2, 0], [0, 1], [1, 1], [2, 1]]
  };
  const SHAPE_KEYS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const SHAPE_COLORS = ['#51DBCF', '#E3D322', '#B484E8', '#71CD76', '#EF6661', '#5DBAE8', '#FFA987'];

  /* >>> engine（純函式，不碰 DOM） */
  const norm = (cells) => {
    const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1]));
    return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  };
  const rotCW = (cells) => {
    const h = Math.max(...cells.map(c => c[1])) + 1;
    return norm(cells.map(([x, y]) => [h - 1 - y, x]));
  };
  // ORIENTS[形狀][姿勢]：順時針旋轉並去除重複，cells 已正規化並依列、欄排序
  const ORIENTS = SHAPE_KEYS.map(k => {
    const list = [];
    let c = norm(BASE_SHAPES[k]);
    for (let i = 0; i < 4; i++) {
      const key = JSON.stringify(c);
      if (!list.some(o => o.key === key)) {
        list.push({ key, cells: c, w: Math.max(...c.map(p => p[0])) + 1, h: Math.max(...c.map(p => p[1])) + 1 });
      }
      c = rotCW(c);
    }
    return list;
  });
  const clampN = (v, a, b) => Math.min(b, Math.max(a, v));

  // 把 COLS × rows 的棋盤隨機切成四格方塊（精確覆蓋，回溯法）；失敗回傳 null。
  function tilePieces(rows, rand) {
    const total = COLS * rows, grid = new Int16Array(total).fill(-1), pieces = [];
    const opts = [];
    ORIENTS.forEach((os, s) => os.forEach((o, oi) => opts.push([s, oi])));
    let nodes = 0;
    const rec = (pos) => {
      while (pos < total && grid[pos] !== -1) pos++;
      if (pos >= total) return true;
      if (++nodes > 40000) return false;
      const x0 = pos % COLS, y0 = (pos / COLS) | 0;
      const order = opts.slice();
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      for (const [s, oi] of order) {
        const o = ORIENTS[s][oi];
        const ox = x0 - o.cells[0][0], oy = y0 - o.cells[0][1];
        let ok = true;
        for (const [cx, cy] of o.cells) {
          const x = ox + cx, y = oy + cy;
          if (x < 0 || x >= COLS || y < 0 || y >= rows || grid[y * COLS + x] !== -1) { ok = false; break; }
        }
        if (!ok) continue;
        const id = pieces.length;
        for (const [cx, cy] of o.cells) grid[(oy + cy) * COLS + ox + cx] = id;
        pieces.push({ shape: s, orient: oi, x: ox, y: oy });
        if (rec(pos + 1)) return true;
        pieces.pop();
        for (const [cx, cy] of o.cells) grid[(oy + cy) * COLS + ox + cx] = -1;
      }
      return false;
    };
    return rec(0) ? { pieces, grid } : null;
  }

  // 保底切法：2 × 2 方塊鋪滿，列數為奇數時最後一列用兩條橫的長條。
  function fallbackTiling(rows) {
    const pieces = [];
    let y = 0;
    for (; y + 1 < rows; y += 2) for (let x = 0; x < COLS; x += 2) pieces.push({ shape: 1, orient: 0, x, y });
    if (y < rows) for (let x = 0; x < COLS; x += 4) pieces.push({ shape: 0, orient: 0, x, y });
    const grid = new Int16Array(COLS * rows).fill(-1);
    pieces.forEach((p, id) => ORIENTS[p.shape][p.orient].cells.forEach(([cx, cy]) => { grid[(p.y + cy) * COLS + p.x + cx] = id; }));
    return { pieces, grid };
  }

  // 排出放置順序：方塊正上方的方塊必須比它晚放，這樣每塊都能從上方垂直落下。
  // 有互相卡住的切法（循環）時回傳 null。
  function orderPieces(pieces, grid, rows, rand) {
    const n = pieces.length;
    const after = pieces.map(() => new Set());
    const indeg = new Array(n).fill(0);
    for (let y = 1; y < rows; y++) {
      for (let x = 0; x < COLS; x++) {
        const up = grid[(y - 1) * COLS + x], me = grid[y * COLS + x];
        if (up !== me && !after[me].has(up)) { after[me].add(up); indeg[up]++; }
      }
    }
    const bottom = (p) => pieces[p].y + ORIENTS[pieces[p].shape][pieces[p].orient].h - 1;
    const ready = [];
    for (let i = 0; i < n; i++) if (indeg[i] === 0) ready.push(i);
    const out = [];
    while (ready.length) {
      let pick;
      if (rand() < 0.6) {
        // 多半先放最低的，像在堆疊；其餘隨機，讓節奏不死板
        let best = -1;
        const cand = [];
        for (let i = 0; i < ready.length; i++) {
          const b = bottom(ready[i]);
          if (b > best) { best = b; cand.length = 0; }
          if (b === best) cand.push(i);
        }
        pick = cand[Math.floor(rand() * cand.length)];
      } else {
        pick = Math.floor(rand() * ready.length);
      }
      const id = ready.splice(pick, 1)[0];
      out.push(id);
      for (const nx of after[id]) if (--indeg[nx] === 0) ready.push(nx);
    }
    return out.length === n ? out : null;
  }

  // 生成並模擬一輪劇本：每塊的起始姿勢、旋轉與平移動作、落點、落地後要消除的列。
  function buildRound(rows, rand) {
    let tiled = null, order = null;
    for (let t = 0; t < 400 && !order; t++) {
      tiled = tilePieces(rows, rand);
      if (tiled) order = orderPieces(tiled.pieces, tiled.grid, rows, rand);
    }
    if (!order) {
      tiled = fallbackTiling(rows);
      order = orderPieces(tiled.pieces, tiled.grid, rows, rand);
    }
    const pieces = tiled.pieces;
    let occ = Array.from({ length: rows }, () => new Array(COLS).fill(false));
    const steps = [];
    for (const id of order) {
      const p = pieces[id], os = ORIENTS[p.shape], len = os.length, to = p.orient;
      // 起始姿勢：往回轉 0 到 len-1 次，起始欄在目標欄附近
      let rotLeft = len > 1 ? Math.floor(rand() * len) : 0;
      let cur = ((to - rotLeft) % len + len) % len;
      let x = clampN(p.x + Math.round((rand() * 2 - 1) * 3), 0, COLS - os[cur].w);
      const start = { orient: cur, x };
      const actions = [];
      while (rotLeft > 0 || x !== p.x || cur !== to) {
        const nextO = (cur + 1) % len;
        const d = Math.sign(p.x - x);
        const nx = clampN(x + d, 0, COLS - os[cur].w);
        if (rotLeft > 0 && (x === p.x || nx === x || rand() < 0.45)) {
          x = clampN(x + Math.floor((os[cur].w - os[nextO].w) / 2), 0, COLS - os[nextO].w);
          cur = nextO;
          rotLeft--;
          actions.push({ t: 'r', x, orient: cur });
        } else {
          x = nx;
          actions.push({ t: 'm', x, orient: cur });
        }
      }
      // 落點：從棋盤上方垂直落下，直到碰到底部或已鎖定的方塊
      const cells = os[to].cells;
      const hit = (yy) => cells.some(([cx, cy]) => {
        const gy = yy + cy, gx = p.x + cx;
        return gy >= rows || (gy >= 0 && occ[gy][gx]);
      });
      let y = -os[to].h;
      while (!hit(y + 1)) y++;
      cells.forEach(([cx, cy]) => { if (y + cy >= 0) occ[y + cy][p.x + cx] = true; });
      // 滿行消除：上方的列整體下移
      const full = [];
      for (let r = 0; r < rows; r++) if (occ[r].every(Boolean)) full.push(r);
      if (full.length) {
        const keep = occ.filter((row, r) => !full.includes(r));
        while (keep.length < rows) keep.unshift(new Array(COLS).fill(false));
        occ = keep;
      }
      const left = occ.reduce((n, row) => n + row.filter(Boolean).length, 0);
      steps.push({ shape: p.shape, to, start, actions, x: p.x, y, clear: full, left });
    }
    const perfect = occ.every(row => row.every(v => !v));
    return { steps, perfect, rows };
  }

  // 一次消 n 行的得分：base × n × (n + 1) / 2，即 100、300、600、1000……
  const lineScore = (n, base) => base * n * (n + 1) / 2;

  // 完整劇本：沒有目標分數時是一輪（完全消除即完成）；有目標分數時一輪接一輪，
  // 累計分數在某次消行達標的那一刻就結束，棋盤上若還有方塊，結尾時一併掃除。
  function buildScript(rows, rand, opts) {
    const base = opts && opts.base > 0 ? opts.base : 100;
    const target = opts && opts.target > 0 ? opts.target : 0;
    const MAX_ROUNDS = 40;
    const steps = [];
    let total = 0, round = 0, reached = false, sweep = false;
    do {
      const r = buildRound(rows, rand);
      round++;
      for (let i = 0; i < r.steps.length; i++) {
        const st = r.steps[i];
        const gain = st.clear.length ? lineScore(st.clear.length, base) : 0;
        total += gain;
        steps.push(Object.assign(st, { score: gain, total, round, newRound: round > 1 && i === 0 }));
        if (target && total >= target && gain) { reached = true; sweep = st.left > 0; break; }
      }
    } while (target && !reached && round < MAX_ROUNDS);
    return { steps, rows, total, target, base, rounds: round, reached: reached || !target, sweep };
  }
  /* <<< engine */
  /* ---------- 彩帶（全頁共用一個 canvas，不使用透明度，以縮小或落出畫面方式退場） ---------- */
  const Confetti = {
    canvas: null, ctx: null, parts: [], raf: 0, last: 0, bound: false,
    ensure() {
      if (this.canvas && this.canvas.isConnected) return;
      const c = document.createElement('canvas');
      c.className = 'tetris-quiz-confetti';
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
    // o.size：彩帶尺寸倍率；o.power：噴發力道倍率（兩者都隨棋盤大小等比調整）
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
  const PAD = 20;       // 棋盤外框留白
  const INSET = 2;      // 方塊與格線的間隙
  const REF_SIZE = 380; // 答案標籤與彩帶的基準棋盤寬度（px）
  const CANCEL = Symbol('cancel');
  const px = (x) => PAD + x * CELL;
  const py = (y) => PAD + (y + HEAD) * CELL;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  let UID = 0;

  class TetrisQuiz extends HTMLElement {
    static get observedAttributes() {
      return ['question', 'answer', 'rows', 'board-width', 'cell-size', 'piece-colors', 'controls',
        'label-play', 'label-replay', 'label-new', 'label-cover', 'play-size', 'hide-until-play',
        'label-title', 'label-reveal', 'show-reveal', 'reveal-color', 'reveal-bg', 'panel-class', 'show-template',
        'target-score', 'line-score', 'show-score', 'label-score', 'label-target'];
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
      this._grid = null;
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
        case 'board-width':
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
        case 'panel-class':
          this._applyPanelClass();
          break;
        case 'show-template':
          this._hideTemplate();
          if (this._revealed && !this._running) this._showTemplate();
          break;
        case 'label-reveal':
        case 'show-reveal':
          if (this._revealed) this._setStatus(this._revealText(), true);
          break;
        case 'reveal-color':
        case 'reveal-bg':
          this._paintStatus();
          break;
        case 'show-score':
        case 'label-score':
        case 'label-target':
          this._applyHud();
          break;
        case 'piece-colors':
          this._cancel();
          this._renderBoard();
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
      const rows = this._int('rows', 8, 4, 16);
      this._rows = rows;
      this._cols = COLS;

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

      // 劇本
      const seedAttr = this.getAttribute('seed');
      const rand = (seedAttr !== null && seedAttr !== '')
        ? mulberry32(hashString(seedAttr) + this._gen)
        : Math.random;
      this._gen++;
      this._script = buildScript(rows, rand, {
        target: this._int('target-score', 0, 0, 1e9),
        base: this._int('line-score', 100, 1, 1e6)
      });
      this._steps = this._script.steps.length;
      this._target = this._script.target;

      this._applySize();
      this._renderBoard();
      this._setScore(0, false);
      this._applyHud();
      this._revealed = false;
      this._hideTemplate();
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
      this._setStatus('方塊落下中……');
      if (this._concealed) this._later(run, this._unveil(), () => this._perform(run));
      else this._perform(run);
    }

    /* ----- 外部面板 ----- */
    _applyPanelClass() {
      if (!this.$innerPanel) return;
      this._panelClasses = syncClasses(this.$innerPanel, this._panelClasses, this.getAttribute('panel-class'));
    }

    _findExternalPanel() {
      if (!this.id) return null;
      return document.querySelector(`tetris-quiz-panel[for="${CSS.escape(this.id)}"]`);
    }

    _attachPanel(panelEl, refresh = true) {
      if (this._extPanel === panelEl) return;
      if (this._extPanel) this._extPanel._owner = null;
      this._extPanel = panelEl;
      panelEl._owner = this;
      this.$innerPanel.remove();
      this.$wrap.classList.add('is-solo');
      const inner = document.createElement('div');
      inner.className = 'tq-panel';
      panelEl.replaceChildren(inner);
      panelEl._extraApplied = [];
      if (panelEl._applyExtraClass) panelEl._applyExtraClass();
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
<div class="tq-label"></div>
<div class="tq-question"></div>
<div class="tq-status"></div>`;
      this._panelHost = host;
      this.$title = host.querySelector('.tq-label');
      this.$question = host.querySelector('.tq-question');
      this.$status = host.querySelector('.tq-status');
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
      if (mode === 'board') this.$stage.appendChild(this.$actions);
      else if (this._panelHost) this._panelHost.appendChild(this.$actions);
    }

    /* ----- 尺寸與等比縮放 ----- */
    _applySize() {
      const bw = cssLength(this.getAttribute('board-width'));
      const cs = parseFloat(this.getAttribute('cell-size'));
      let width = bw;
      if (!width && cs > 0) width = ((COLS * CELL + PAD * 2) * cs / CELL).toFixed(1) + 'px';
      this.$stage.style.width = width || '';
      this.$stage.classList.toggle('is-sized', !!width);
      this.$wrap.classList.toggle('is-fit', !!width && !!this._extPanel && !/%$/.test(width));
      this._updateScale();
    }

    // 依棋盤實際顯示大小調整線條最細值，並計算答案標籤與彩帶的縮放倍率。
    _updateScale() {
      const vb = this._vb;
      if (!vb || !this.$walls) return;
      const r = this.$svg.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const s = Math.min(r.width / vb.w, r.height / vb.h);
      this._k = clamp((vb.w * s) / REF_SIZE, 0.4, 1.25);
      this.$walls.setAttribute('stroke-width', Math.max(CELL * 0.1, 2 / s));
      this.$gridLines.setAttribute('stroke-width', Math.max(1, 1 / s));
    }

    /* ----- 播放流程 ----- */
    _sleep(run, ms) {
      return new Promise((res, rej) => {
        const id = setTimeout(() => (run === this._runId ? res() : rej(CANCEL)), Math.max(0, ms));
        this._timers.push(id);
      });
    }

    _tween(run, ms, fn) {
      return new Promise((res, rej) => {
        const t0 = performance.now();
        const tick = (now) => {
          if (run !== this._runId) { rej(CANCEL); return; }
          const p = clamp((now - t0) / ms, 0, 1);
          fn(p);
          if (p < 1) this._raf = requestAnimationFrame(tick);
          else res();
        };
        this._raf = requestAnimationFrame(tick);
      });
    }

    async _anims(run, list) {
      await Promise.all(list.map(a => a.finished.catch(() => {})));
      if (run !== this._runId) throw CANCEL;
    }

    async _perform(run) {
      const sc = this._script;
      const speed = this._int('drop-speed', 24, 6, 200);
      const act = clamp(speed * 3, 50, 260);
      const shrink = this._int('clear-speed', 22, 6, 120);
      let cleared = 0;
      this._emit('tetris-start', { pieces: sc.steps.length, target: sc.target });
      try {
        for (let i = 0; i < sc.steps.length; i++) {
          const st = sc.steps[i];
          if (st.newRound) {
            cleared = 0;
            this._setStatus(`第 ${st.round} 輪`);
            await this._sleep(run, act * 4);
          }
          await this._dropPiece(run, st, speed, act);
          this._emit('piece-landed', { index: i + 1, pieces: sc.steps.length, shape: SHAPE_KEYS[st.shape], round: st.round });
          if (st.clear.length) {
            this._setStatus(`消除 ${st.clear.length} 行！`);
            await this._clearRows(run, st.clear, act, shrink, () => {
              this._popScore(st.clear, st.score);
              this._setScore(st.total, true);
            });
            cleared += st.clear.length;
            this._emit('lines-cleared', {
              lines: st.clear.length, cleared, remaining: this._rows - cleared,
              score: st.score, total: st.total, target: sc.target, round: st.round
            });
            this._setStatus('方塊落下中……');
          }
        }
        if (sc.sweep) await this._sweepBoard(run, shrink);
        await this._sleep(run, 120);
      } catch (e) {
        if (e === CANCEL) return;
        throw e;
      }
      this._arrive(run);
    }

    // 達到目標分數時，棋盤上剩下的方塊一併掃除。
    async _sweepBoard(run, shrink) {
      this._setStatus('達到目標分數，清場！');
      const list = [];
      this._grid.forEach((row, r) => row.forEach((el, x) => {
        if (!el) return;
        list.push(el.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(0)' }],
          { duration: 220, delay: (this._rows - 1 - r) * shrink * 2 + x * shrink, easing: 'ease-in', fill: 'forwards' }));
      }));
      await this._anims(run, list);
      this._clearBoard();
    }

    /* ----- 分數 ----- */
    _fmt(n) { return Math.round(n).toLocaleString('en-US'); }

    _applyHud() {
      if (!this.$hud) return;
      const show = (this.getAttribute('show-score') || '').toLowerCase() !== 'false';
      this.$hud.style.display = show ? '' : 'none';
      this.$hudLabel.textContent = this._label('label-score', '分數');
      const t = this._target || 0;
      this.$hudTarget.textContent = t ? `${this._label('label-target', '目標')} ${this._fmt(t)}` : '';
      this.$hudBar.style.display = t ? '' : 'none';
      this._paintScore(this._score || 0);
    }

    _paintScore(v) {
      this.$hudScore.textContent = this._fmt(v);
      const t = this._target || 0;
      this.$hudFill.style.width = t ? `${clamp(v / t, 0, 1) * 100}%` : '0%';
    }

    _setScore(v, animate) {
      cancelAnimationFrame(this._sraf);
      const from = this._score || 0;
      this._score = v;
      if (!this.$hud) return;
      if (!animate || from === v) { this._paintScore(v); return; }
      const t0 = performance.now(), dur = 420;
      const tick = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        this._paintScore(from + (v - from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) this._sraf = requestAnimationFrame(tick);
      };
      this._sraf = requestAnimationFrame(tick);
    }

    // 消行處冒出「+分數」：往上飄並縮小消失（不使用透明度）。
    _popScore(rowsList, gain) {
      if (!gain || !this._vb) return;
      const avg = rowsList.reduce((a, b) => a + b, 0) / rowsList.length;
      const el = document.createElement('div');
      el.textContent = `+${this._fmt(gain)}`;
      el.style.cssText = `position:absolute;left:50%;top:${(py(avg + 0.5) / this._vb.h * 100).toFixed(2)}%;` +
        `font-size:${(1.75 * this._k).toFixed(2)}rem;font-weight:800;line-height:1;color:#B6FF00;` +
        'pointer-events:none;white-space:nowrap;z-index:2;transform:translate(-50%,-50%) scale(.5)';
      this.$board.appendChild(el);
      const run = this._runId;
      const anim = el.animate([
        { transform: 'translate(-50%,-50%) scale(.5)', offset: 0 },
        { transform: 'translate(-50%,-90%) scale(1.15)', offset: 0.35 },
        { transform: 'translate(-50%,-150%) scale(1)', offset: 0.75 },
        { transform: 'translate(-50%,-190%) scale(0)', offset: 1 }
      ], { duration: 950, easing: 'ease-out', fill: 'forwards' });
      anim.finished.then(() => el.remove(), () => el.remove());
      if (run !== this._runId) el.remove();
    }

    _mkRect(color) {
      const r = document.createElementNS(SVG_NS, 'rect');
      r.setAttribute('class', 'tq-c');
      r.setAttribute('width', CELL - INSET * 2);
      r.setAttribute('height', CELL - INSET * 2);
      r.setAttribute('rx', 5);
      r.setAttribute('fill', color);
      r.dataset.fill = color;
      return r;
    }

    _setRect(rect, gx, gy) {
      rect.setAttribute('x', px(gx) + INSET);
      rect.setAttribute('y', py(gy) + INSET);
    }

    async _dropPiece(run, st, speed, act) {
      const os = ORIENTS[st.shape];
      const color = this._colors()[st.shape];
      const g = this.$active;
      g.textContent = '';
      const rects = [0, 1, 2, 3].map(() => { const r = this._mkRect(color); g.appendChild(r); return r; });
      const place = (orient, xx, yy) => {
        os[orient].cells.forEach(([cx, cy], k) => {
          rects[k].setAttribute('x', cx * CELL + INSET);
          rects[k].setAttribute('y', cy * CELL + INSET);
        });
        g.setAttribute('transform', `translate(${px(xx)} ${py(yy)})`);
      };
      // 出生區：旋轉與平移到目標姿勢
      place(st.start.orient, st.start.x, -os[st.start.orient].h);
      await this._sleep(run, act * 0.8);
      for (const a of st.actions) {
        place(a.orient, a.x, -os[a.orient].h);
        await this._sleep(run, act);
      }
      await this._sleep(run, act * 0.4);
      // 落下：越落越快
      const y0 = -os[st.to].h, dist = st.y - y0;
      await this._tween(run, 90 + dist * speed, (p) => place(st.to, st.x, y0 + dist * p * p));
      // 鎖定：方塊交給棋盤
      os[st.to].cells.forEach(([cx, cy], k) => {
        const gx = st.x + cx, gy = st.y + cy;
        this._setRect(rects[k], gx, gy);
        this.$cells.appendChild(rects[k]);
        this._grid[gy][gx] = rects[k];
      });
      g.removeAttribute('transform');
      rects.forEach(r => r.animate(
        [{ transform: 'scale(1.18,.82)' }, { transform: 'scale(1,1)' }],
        { duration: 160, easing: 'ease-out' }));
      await this._sleep(run, act * 0.7);
    }

    async _clearRows(run, rowsList, act, shrink, onShrink) {
      const set = new Set(rowsList);
      const rectsOf = (r) => this._grid[r].filter(Boolean);
      // 閃白兩次（不用透明度，改成色塊在白色與原色之間切換）
      for (let f = 0; f < 2; f++) {
        rowsList.forEach(r => rectsOf(r).forEach(el => el.setAttribute('fill', '#DBEDD8')));
        await this._sleep(run, act * 1.1);
        rowsList.forEach(r => rectsOf(r).forEach(el => el.setAttribute('fill', el.dataset.fill)));
        await this._sleep(run, act * 0.9);
      }
      if (onShrink) onShrink();
      // 由左到右逐格縮小
      const shrinking = [];
      rowsList.forEach(r => this._grid[r].forEach((el, x) => {
        if (!el) return;
        shrinking.push(el.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(0)' }],
          { duration: 220, delay: x * shrink, easing: 'ease-in', fill: 'forwards' }));
      }));
      await this._anims(run, shrinking);
      rowsList.forEach(r => this._grid[r].forEach((el, x) => { if (el) { el.remove(); this._grid[r][x] = null; } }));
      // 上方的列整體下移
      const rows = this._rows;
      const next = Array.from({ length: rows }, () => new Array(COLS).fill(null));
      const moving = [];
      let below = 0, maxShift = 0;
      for (let r = rows - 1; r >= 0; r--) {
        if (set.has(r)) { below++; continue; }
        for (let x = 0; x < COLS; x++) {
          const el = this._grid[r][x];
          if (!el) continue;
          next[r + below][x] = el;
          if (below) { moving.push([el, r + below, x, below]); maxShift = Math.max(maxShift, below); }
        }
      }
      const falls = moving.map(([el, , , n]) => el.animate(
        [{ transform: 'translateY(0px)' }, { transform: `translateY(${n * CELL}px)` }],
        { duration: 130 + n * 70, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'forwards' }));
      await this._anims(run, falls);
      moving.forEach(([el, ny, x], i) => { this._setRect(el, x, ny); falls[i].cancel(); });
      this._grid = next;
      await this._sleep(run, act * 0.5);
    }

    _arrive(run) {
      const sc = this._script;
      const byScore = !!sc.target;
      this._setStatus(byScore ? '達到目標分數！' : '完全消除！');
      this._emit('tetris-cleared', { score: sc.total, target: sc.target, rounds: sc.rounds, reason: byScore ? 'score' : 'perfect' });
      const p = this._centerScreenPoint();
      const k = this._k;
      this.$walls.animate(
        [{ stroke: '#C6C7BD' }, { stroke: '#B6FF00' }, { stroke: '#C6C7BD' }],
        { duration: 700, iterations: 2 });
      if (this._confettiOn()) {
        Confetti.burst(p.x, p.y, { angle: -110, spread: 70, count: 170, size: k });
        Confetti.burst(p.x, p.y, { angle: -70, spread: 35, count: 50, power: 0.8, size: k });
      }
      this._later(run, 220, () => this._popChip(run));
    }

    _popChip(run) {
      const p = this._centerScreenPoint();
      const k = this._k;
      const chip = document.createElement('div');
      chip.className = 'tetris-quiz-chip';
      chip.textContent = this._a;
      chip.style.left = p.x + 'px';
      chip.style.top = p.y + 'px';
      chip.style.fontSize = (1.75 * k).toFixed(3) + 'rem';
      chip.style.padding = `${Math.round(8 * k)}px ${Math.round(22 * k)}px`;
      chip.style.borderWidth = Math.max(2, Math.round(3 * k)) + 'px';
      this._styleChip(chip, k);
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
        // 等空格的填入動畫（.45s）結束，才算全部播放完畢
        if (this.hasAttribute('show-template')) this._later(run, 450, () => this._showTemplate());
      };
    }

    /* ----- show-template：播放完畢後顯示 <template> 內容 ----- */
    _showTemplate() {
      if (this._tplNodes) return;
      const id = (this.getAttribute('show-template') || '').trim().replace(/^#/, '');
      if (!id) return;
      const tpl = document.getElementById(id);
      if (!(tpl instanceof HTMLTemplateElement)) {
        console.warn(`[tetris-quiz] show-template 找不到 <template id="${id}">`);
        return;
      }
      const frag = tpl.content.cloneNode(true);
      this._tplNodes = [...frag.childNodes];
      tpl.after(frag);
      this._emit('template-shown');
    }

    _hideTemplate() {
      if (!this._tplNodes) return;
      this._tplNodes.forEach(n => n.remove());
      this._tplNodes = null;
    }

    _resetReveal() {
      this._revealed = false;
      this._hideTemplate();
      if (this.$blank) {
        this.$blank.textContent = '';
        this.$blank.classList.remove('is-filled');
      }
      this._setScore(0, false);
      this._clearBoard();
    }

    _clearBoard() {
      if (!this.$cells) return;
      this.$cells.textContent = '';
      this.$active.textContent = '';
      this.$active.removeAttribute('transform');
      this._grid = Array.from({ length: this._rows }, () => new Array(COLS).fill(null));
    }

    _cancel() {
      this._runId++;
      cancelAnimationFrame(this._raf);
      cancelAnimationFrame(this._sraf);
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
        ? `準備就緒，按下「${this._label('label-play', '開始消除')}」或 Ctrl + Shift + 數字鍵盤 5。`
        : '準備就緒。';
    }

    _applyButtons() {
      if (!this.$play) return;
      this.$play.textContent = this._played && !this._running
        ? this._label('label-replay', '重播')
        : this._label('label-play', '開始消除');
      this.$new.textContent = this._label('label-new', '換一局');
      if (this.$coverText) this.$coverText.textContent = this._label('label-cover', '按下開始，方塊就會落下');
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

    // 答案標籤的形狀與顏色；未設定時沿用樣式表的膠囊黃底深色字。
    _styleChip(chip, k) {
      const shape = (this.getAttribute('chip-shape') || '').trim().toLowerCase();
      let radius = '';
      if (shape === 'rounded') radius = Math.max(4, Math.round(12 * k)) + 'px';
      else if (shape === 'square') radius = '0px';
      else if (/^\d+(\.\d+)?$/.test(shape)) radius = Math.round(parseFloat(shape) * k) + 'px';
      chip.style.borderRadius = radius;
      const hex = (name) => { const c = parseColor(this.getAttribute(name)); return c ? mixHex(c, c, 0) : ''; };
      chip.style.backgroundColor = hex('chip-bg');
      chip.style.color = hex('chip-color');
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

    // 移除遮罩，以棋盤中央為圓心展開；回傳展開動畫的毫秒數。
    _unveil() {
      this._setConcealed(false);
      const dur = 650;
      if (this.$svg.animate) {
        this.$svg.animate([
          { clipPath: 'circle(0% at 50% 50%)' },
          { clipPath: 'circle(150% at 50% 50%)' }
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

    // 棋盤中央的螢幕座標，答案標籤與彩帶從這裡出發。
    _centerScreenPoint() {
      const m = this.$svg.getScreenCTM();
      if (!m) return { x: window.innerWidth / 2, y: 0 };
      const vb = this._vb;
      return new DOMPoint(vb.w / 2, py(this._rows / 2)).matrixTransform(m);
    }

    _emit(type, extra) {
      this.dispatchEvent(new CustomEvent(type, {
        bubbles: true,
        detail: Object.assign({ question: this._q, answer: this._a, cols: COLS, rows: this._rows, pieces: this._steps }, extra || {})
      }));
    }

    _setupAutoplay() {
      if (this.getAttribute('autoplay') === 'false') return;
      if (!('IntersectionObserver' in window)) { this.play(); return; }
      this._io = new IntersectionObserver((entries) => {
        for (const en of entries) {
          // 元件幾乎完全進入畫面（或已佔滿視窗高度）才播放，確保看得到整個棋盤。
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
        console.warn('[tetris-quiz] 題庫 JSON 格式錯誤，改用 question 與 answer 屬性。', err);
        this._bank = null;
      }
    }

    _buildShell() {
      this.innerHTML = `
<div class="tq-wrap">
  <div class="tq-stage">
    <div class="tq-board">
      <svg class="tq-svg" xmlns="http://www.w3.org/2000/svg"></svg>
      <div class="tq-cover"><div class="tq-cover-mark">?</div><div class="tq-cover-text"></div></div>
    </div>
    <div class="tq-hud">
      <div class="tq-hud-row"><span class="tq-hud-label"></span><span class="tq-hud-score">0</span><span class="tq-hud-target"></span></div>
      <div class="tq-hud-bar"><div class="tq-hud-fill"></div></div>
    </div>
  </div>
  <div class="tq-panel"></div>
</div>`;
      this.$wrap = this.querySelector('.tq-wrap');
      this.$stage = this.querySelector('.tq-stage');
      this.$svg = this.querySelector('.tq-svg');
      this.$board = this.querySelector('.tq-board');
      this.$coverText = this.querySelector('.tq-cover-text');
      this.$hud = this.querySelector('.tq-hud');
      this.$hudLabel = this.querySelector('.tq-hud-label');
      this.$hudScore = this.querySelector('.tq-hud-score');
      this.$hudTarget = this.querySelector('.tq-hud-target');
      this.$hudBar = this.querySelector('.tq-hud-bar');
      this.$hudFill = this.querySelector('.tq-hud-fill');
      this.$innerPanel = this.querySelector('.tq-wrap > .tq-panel');
      this._applyPanelClass();
      this.$actions = document.createElement('div');
      this.$actions.className = 'tq-actions';
      this.$actions.innerHTML = `
<button type="button" class="tq-btn tq-play">開始消除</button>
<button type="button" class="tq-btn tq-new">換一局</button>`;
      this.$play = this.$actions.querySelector('.tq-play');
      this.$new = this.$actions.querySelector('.tq-new');
      this.$play.addEventListener('click', () => this.play());
      this.$new.addEventListener('click', () => this.regenerate(true));
      this._mountPanel(this.$innerPanel);
    }

    // 七種方塊的顏色：piece-colors 依序覆蓋 I、O、T、S、Z、J、L；不足的沿用預設色。
    _colors() {
      const attr = this.getAttribute('piece-colors') || '';
      const out = SHAPE_COLORS.slice();
      const bad = [];
      splitColors(attr).slice(0, 7).forEach((t, i) => {
        const c = parseColor(t);
        if (c) out[i] = mixHex(c, c, 0); else bad.push(t);
      });
      if (bad.length && this._warnedColors !== attr) {
        this._warnedColors = attr;
        console.warn(`[tetris-quiz] piece-colors 無法辨識：${bad.join('、')}`);
      }
      return out;
    }

    _renderBoard() {
      const rows = this._rows;
      const w = COLS * CELL + PAD * 2;
      const h = (rows + HEAD) * CELL + PAD * 2;
      this._vb = { w, h };
      const x0 = px(0), x1 = px(COLS), y0 = py(0), y1 = py(rows);
      let lines = '';
      for (let i = 1; i < COLS; i++) lines += `M${px(i)} ${y0}V${y1}`;
      for (let j = 1; j < rows; j++) lines += `M${x0} ${py(j)}H${x1}`;
      this.$svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      this.$svg.innerHTML = `
<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#151615"/>
<path class="tq-lines" d="${lines}" stroke="#2D2D2D" stroke-width="1" fill="none"/>
<path d="M${x0} ${y0}H${x1}" stroke="#86877F" stroke-width="1.5" stroke-dasharray="6 6" fill="none"/>
<g class="tq-cells"></g>
<g class="tq-active"></g>
<path class="tq-walls" d="M${x0} ${y0}V${y1}H${x1}V${y0}" stroke="#C6C7BD" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      this.$cells = this.$svg.querySelector('.tq-cells');
      this.$active = this.$svg.querySelector('.tq-active');
      this.$walls = this.$svg.querySelector('.tq-walls');
      this.$gridLines = this.$svg.querySelector('.tq-lines');
      this._grid = Array.from({ length: rows }, () => new Array(COLS).fill(null));
      this._updateScale();
    }

    _renderQuestion() {
      const q = this._q;
      const m = q.match(/_{2,}/);
      const before = m ? q.slice(0, m.index) : q + ' ';
      const after = m ? q.slice(m.index + m[0].length) : '';
      this.$question.textContent = '';
      appendWithBreaks(this.$question, before);
      const blank = document.createElement('span');
      blank.className = 'tq-blank';
      blank.style.minWidth = `${Math.max(this._a.length + 2, 6)}ch`;
      this.$question.append(blank);
      appendWithBreaks(this.$question, after);
      this.$blank = blank;
    }

    _int(name, def, min, max) {
      const v = parseInt(this.getAttribute(name), 10);
      if (Number.isNaN(v)) return def;
      return Math.min(max, Math.max(min, v));
    }
  }

  /* ---------- 外部題目面板 ---------- */
  class TetrisQuizPanel extends HTMLElement {
    static get observedAttributes() { return ['extra-class']; }
    attributeChangedCallback() { this._applyExtraClass(); }
    /* extra-class 加在內層 .tq-panel；屬性改變時移除上次加入、這次沒有的類別 */
    _applyExtraClass() {
      const inner = this.firstElementChild;
      if (!inner || !inner.classList.contains('tq-panel')) return;
      this._extraApplied = syncClasses(inner, this._extraApplied, this.getAttribute('extra-class'));
    }
    connectedCallback() {
      injectStyle();
      const id = this.getAttribute('for');
      const quiz = id && document.getElementById(id);
      if (quiz && quiz._ready && quiz._attachPanel) quiz._attachPanel(this);
    }
    disconnectedCallback() {
      if (this._owner) this._owner._detachPanel(this);
    }
  }

  customElements.define('tetris-quiz', TetrisQuiz);
  customElements.define('tetris-quiz-panel', TetrisQuizPanel);
})();
