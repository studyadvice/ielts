/*!
 * arrow-flow.js  v2.0.0
 * <arrow-flow> custom element — sequential step reveal + branching
 * No Shadow DOM · No external dependencies
 *
 * ─── 基本用法 ────────────────────────────────────────────────────────────────
 *  <arrow-flow theme="sky" gap="72px" arrow-tip="md"
 *              reveal="cumulative" animation="fade"
 *              equal-height on-complete="result-id" current="0"
 *              box-shadow="0 4px 24px rgba(0,0,0,.55)"
 *              border-width="2.5px" border-radius="6px"
 *              header-font-size="1rem" header-letter-spacing="0.04em"
 *              header-gradient="down" header-accent-line="left"
 *              content-font-size="1.125rem" content-line-height="1.5"
 *              arrow-glow arrow-style="solid"
 *              branch-label-theme="teal" branch-dim="0.30">
 *    <flow-step title="Step 1">HTML content</flow-step>
 *    <flow-step title="Step 2" header-color="lavender" border-color="indigo">…</flow-step>
 *    <flow-branch>
 *      <branch-option label="方案 A" theme="teal">
 *        <flow-step title="A-1">…</flow-step>
 *        <flow-step title="A-2">…</flow-step>
 *      </branch-option>
 *      <branch-option label="方案 B" theme="salmon">
 *        <flow-step title="B-1">…</flow-step>
 *      </branch-option>
 *    </flow-branch>
 *    <flow-step title="共同結尾">…</flow-step>   ← 合流後的主流程步驟
 *  </arrow-flow>
 *
 * ─── 全域設定 ─────────────────────────────────────────────────────────────────
 *  ArrowFlow.config({ theme:'sky', arrowTip:'lg', gap:'80px',
 *                     boxShadow:'…', borderWidth:'2px', borderRadius:'8px',
 *                     headerGradient:'down', headerAccentLine:'left',
 *                     headerFontSize:'1rem', headerLetterSpacing:'0.04em',
 *                     contentFontSize:'1.125rem', contentLineHeight:'1.5',
 *                     arrowGlow: true, branchLabelTheme:'teal', branchDim:'0.30' })
 *
 * ─── 樣式屬性速查（arrow-flow 層級）────────────────────────────────────────────
 *  box-shadow          — 盒子陰影，例如 "0 4px 24px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08)"
 *  border-width        — 邊框粗細，預設 "2.5px"
 *  border-radius       — 盒子圓角，預設 "5px"
 *  header-gradient     — header 漸層方向："down"|"up"|"none"，預設 "none"
 *  header-accent-line  — header 強調線位置："left"|"top"|"none"，預設 "none"
 *  header-font-size    — header 字體大小，預設 "1.125rem"
 *  header-letter-spacing — header 字距，預設 "0"
 *  content-font-size   — content 字體大小，預設 "1.125rem"
 *  content-line-height — content 行高，預設 "1.5"
 *  arrow-glow          — 布林屬性，啟用箭頭 SVG drop-shadow
 *  arrow-style         — "solid"|"dashed"，預設 "solid"
 *  branch-label-theme  — 分支選項按鈕顏色，預設 "teal"
 *  branch-dim          — 未選中分支的透明度 (0.78~1)，預設 "0.80"
 *
 * ─── flow-step 個別屬性 ────────────────────────────────────────────────────────
 *  title               — 步驟標題
 *  header-color        — 覆寫 header 背景色
 *  border-color        — 覆寫邊框色
 *  width               — 固定欄寬，例如 "220px"
 *
 * ─── branch-option 屬性 ─────────────────────────────────────────────────────────
 *  label               — 分支選擇按鈕文字
 *  theme               — 分支色系（palette key 或 hex）
 *
 * ─── Events (bubble) ─────────────────────────────────────────────────────────
 *  step-change    → e.detail = { index, path, branchId }
 *  branch-select  → e.detail = { branchId, label }
 *  flow-complete  → e.detail = { totalSteps, path }
 */
(function () {
  'use strict';

  /* ── 色板 ─────────────────────────────────────────────────────────────────── */
  const P = {
    bg      : '#0C0D0C', shell   : '#C6C7BD', lavender: '#C3A5E5',
    sky     : '#82C8E5', warning : '#E6374B', salmon  : '#E5C3B3',
    ocean   : '#1CCAE8', safe    : '#27AE60', teal    : '#0DA591',
    vanilla : '#DBEDD8', yellow  : '#E3D322', focus   : '#D4FFFC',
    special : '#B3DE73', info    : '#4171BF', indigo  : '#7849C9',
    pink    : '#FF91D7', orange  : '#EDA109',
  };

  /* ── 箭頭尖端尺寸 ──────────────────────────────────────────────────────────── */
  const TIPS = {
    sm : { hh: 16, hw: 18 },
    md : { hh: 24, hw: 28 },
    lg : { hh: 34, hw: 36 },
    xl : { hh: 40, hw: 44 },
  };

  /* ── 全域預設值 ────────────────────────────────────────────────────────────── */
  const DEF = {
    /* 流程行為 */
    theme             : 'shell',
    headerColor       : null,
    borderColor       : null,
    arrowColor        : null,
    arrowTip          : 'md',
    gap               : '72px',
    equalHeight       : false,
    reveal            : 'cumulative',
    animation         : 'fade',
    current           : 0,
    stepWidth         : null,
    arrowStyle        : 'solid',
    /* 新增：樣式彈性屬性 */
    boxShadow         : 'none',
    borderWidth       : '2.5px',
    borderRadius      : '5px',
    headerGradient    : 'none',      // 'down' | 'up' | 'none'
    headerAccentLine  : 'none',      // 'left' | 'top' | 'none'
    headerFontSize    : '1.125rem',
    headerLetterSpacing: '0',
    contentFontSize   : '1.125rem',
    contentLineHeight : '1.5',
    arrowGlow         : false,
    /* 分支 */
    branchLabelTheme  : 'teal',
    branchDim         : '0.80',
  };

  window.ArrowFlow = {
    PALETTE : P,
    config(opts = {}) {
      Object.keys(opts).forEach(k => {
        const ck = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (ck in DEF) DEF[ck] = opts[k];
      });
    },
  };

  /* ── 工具函式 ──────────────────────────────────────────────────────────────── */
  const clr  = n => (!n ? null : (P[n] ?? n));
  const toW  = v => (!v ? null : /^\d+$/.test(v) ? v + 'px' : v);

  function ctrst(hex) {
    if (!hex || hex[0] !== '#') return P.shell;
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return (0.299*r + 0.587*g + 0.114*b)/255 > 0.55 ? P.bg : P.shell;
  }

  /* 讓同色略微變暗，用於 header gradient stop */
  function darken(hex, pct = 0.12) {
    if (!hex || hex[0] !== '#') return hex;
    const r = Math.max(0, Math.round(parseInt(hex.slice(1,3),16) * (1-pct)));
    const g = Math.max(0, Math.round(parseInt(hex.slice(3,5),16) * (1-pct)));
    const b = Math.max(0, Math.round(parseInt(hex.slice(5,7),16) * (1-pct)));
    return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  }

  /* ── CSS 注入（僅一次）────────────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('af-css')) return;
    const s = document.createElement('style');
    s.id = 'af-css';
    s.textContent = `
flow-step, flow-branch, branch-option { display: none; }
arrow-flow { display: block; }

/* ── 主行容器 ── */
.af-w  { display: flex; align-items: stretch; }
.af-sc { flex: 1 1 0; display: flex; flex-direction: column; min-width: 0; }

/* ── 步驟盒子 ── */
.af-bx {
  flex: 1; display: flex; flex-direction: column;
  border-style: solid;
  border-width: var(--af-bw, 2.5px);
  border-color: var(--af-bd);
  border-radius: var(--af-br, 5px);
  overflow: hidden;
  box-shadow: var(--af-bs, none);
  opacity: 0;
}
.af-bx.af-fade  { transition: opacity .38s ease; }
.af-bx.af-slide { transition: opacity .38s ease, transform .38s ease;
                   transform: translateX(-22px); }
.af-bx.af-none  { transition: none; }
.af-bx.af-on                 { opacity: 1; }
.af-bx.af-slide.af-on        { transform: translateX(0); }

/* ── Header ── */
.af-hd {
  padding: 10px 16px;
  font-size: var(--af-hfs, 1.125rem);
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: var(--af-hls, 0);
  flex-shrink: 0;
  background: var(--af-hbg-css);
  color: var(--af-hfg);
  position: relative;
}
/* header accent line — left */
.af-hd.accent-left::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: var(--af-accent-line-clr, rgba(255,255,255,0.30));
  border-radius: 0 2px 2px 0;
}
/* header accent line — top */
.af-hd.accent-top::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--af-accent-line-clr, rgba(255,255,255,0.30));
}

/* ── Content ── */
.af-ct {
  padding: 16px;
  font-size: var(--af-cfs, 1.125rem);
  line-height: var(--af-clh, 1.5);
  color: rgba(198,199,189,0.92);
  background-color: #0C0D0C;
  flex: 1;
  border-top: 1px solid rgba(198,199,189,0.10);
}

/* ── 箭頭欄 ── */
.af-ar {
  flex-shrink: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  transition: opacity .3s;
  gap: 4px;
}
.af-ar.lk { opacity: .10; cursor: default;  pointer-events: none; }
.af-ar.ac { opacity: 1;   cursor: pointer;  pointer-events: auto; }
.af-ar.ps { opacity: .35; cursor: default;  pointer-events: none; }
.af-ar.ac:hover { opacity: 0.78; }
.af-ar-label {
  font-size: 0.72rem;
  color: rgba(198,199,189,0.55);
  text-align: center;
  max-width: 100%;
  line-height: 1.2;
  padding: 0 4px;
}

/* ── SVG 箭頭 ── */
.af-sv { display: block; width: 86%; height: auto; }

/* ── on-complete 揭露 ── */
.af-reveal { animation: af-reveal-in .5s ease both; }
@keyframes af-reveal-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}

/* ══════════════════════════════════════════════════════════════
   分支區塊
══════════════════════════════════════════════════════════════ */
.af-branch-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

/* 選擇按鈕列 */
.af-branch-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 0 10px 0;
  align-items: center;
}
.af-branch-btn {
  padding: 7px 18px;
  border: 2px solid var(--af-btn-clr);
  border-radius: 4px;
  background: transparent;
  color: var(--af-btn-clr);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s, color .2s;
  line-height: 1.3;
}
.af-branch-btn:hover {
  background: var(--af-btn-clr);
  color: #0C0D0C;
}
.af-branch-btn.selected {
  background: var(--af-btn-clr);
  color: #0C0D0C;
}

/* 主幹垂直線 + 縮排 */
.af-branch-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-left: 2px solid rgba(198,199,189,0.20);
  margin-left: 8px;
  padding-left: 18px;
}

/* 單一分支路徑容器 */
.af-branch-path {
  display: flex;
  flex-direction: column;
}
/* 橫向短連接線 */
.af-branch-path::before {
  content: '';
  display: block;
  width: 18px;
  height: 2px;
  background: rgba(198,199,189,0.20);
  margin-left: -18px;
  margin-bottom: 0;
  position: relative;
  top: 20px;
}

/* 分支路徑標題列 */
.af-branch-path-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--af-branch-clr);
  padding: 6px 0 8px 0;
  letter-spacing: 0.03em;
  opacity: 0.92;
}

/* 未啟用的分支路徑 */
.af-branch-path.dimmed {
  opacity: var(--af-branch-dim, 0.80);
  pointer-events: none;
}
/* 已選中的分支路徑：啟用 */
.af-branch-path.active {
  opacity: 1;
  pointer-events: auto;
}
/* 尚未選擇任何分支時，所有路徑都半可見 */
.af-branch-path.pending {
  opacity: 0.82;
  pointer-events: none;
}

/* 分支內的水平步驟列（復用 af-w） */
.af-branch-row {
  display: flex;
  align-items: stretch;
}

/* 分支到主流程之間的合流箭頭區 */
.af-merge-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  opacity: 0;
  transition: opacity .4s ease;
}
.af-merge-arrow.visible { opacity: 0.70; }
.af-merge-arrow svg { display: block; }
`;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ── SVG 箭頭製作 ─────────────────────────────────────────────────────────── */
  function makeSVG(tipKey, fill, style, glow) {
    const t  = TIPS[tipKey] || TIPS.md;
    const W  = 80;
    const cy = 20;
    const hs = W - t.hw;
    const ns = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} 40`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('af-sv');

    if (glow) {
      const defs = document.createElementNS(ns, 'defs');
      const filt = document.createElementNS(ns, 'filter');
      filt.setAttribute('id', 'af-glow');
      filt.setAttribute('x', '-20%'); filt.setAttribute('y', '-60%');
      filt.setAttribute('width', '140%'); filt.setAttribute('height', '220%');
      const fe = document.createElementNS(ns, 'feDropShadow');
      fe.setAttribute('dx', '0'); fe.setAttribute('dy', '0');
      fe.setAttribute('stdDeviation', '2.5');
      fe.setAttribute('flood-color', fill);
      fe.setAttribute('flood-opacity', '0.85');
      filt.appendChild(fe);
      defs.appendChild(filt);
      svg.appendChild(defs);
      svg.setAttribute('filter', 'url(#af-glow)');
    }

    let shaft;
    if (style === 'dashed') {
      shaft = document.createElementNS(ns, 'line');
      shaft.setAttribute('x1', '0');   shaft.setAttribute('y1', String(cy));
      shaft.setAttribute('x2', String(hs+1)); shaft.setAttribute('y2', String(cy));
      shaft.setAttribute('stroke', fill);
      shaft.setAttribute('stroke-width', '5');
      shaft.setAttribute('stroke-dasharray', '8 5');
      shaft.setAttribute('stroke-linecap', 'round');
    } else {
      shaft = document.createElementNS(ns, 'rect');
      shaft.setAttribute('x', '0');      shaft.setAttribute('y', '17');
      shaft.setAttribute('width', String(hs+3));
      shaft.setAttribute('height', '6');
      shaft.setAttribute('fill', fill);
    }

    const head = document.createElementNS(ns, 'polygon');
    head.setAttribute('points',
      `${hs},${cy - t.hh/2} ${W},${cy} ${hs},${cy + t.hh/2}`);
    head.setAttribute('fill', fill);

    svg.appendChild(shaft);
    svg.appendChild(head);
    return svg;
  }

  /* 垂直合流箭頭（向下） */
  function makeMergeSVG(fill) {
    const ns  = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 36');
    svg.setAttribute('width', '24'); svg.setAttribute('height', '36');
    svg.setAttribute('aria-hidden', 'true');

    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1','12'); line.setAttribute('y1','0');
    line.setAttribute('x2','12'); line.setAttribute('y2','24');
    line.setAttribute('stroke', fill);
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');

    const head = document.createElementNS(ns, 'polygon');
    head.setAttribute('points', '4,20 20,20 12,34');
    head.setAttribute('fill', fill);

    svg.appendChild(line);
    svg.appendChild(head);
    return svg;
  }

  /* ── 主元件類別 ───────────────────────────────────────────────────────────── */
  class ArrowFlowEl extends HTMLElement {
    connectedCallback() {
      if (this._up) return;
      this._up = true;
      injectCSS();
      document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', () => this._init())
        : Promise.resolve().then(() => this._init());
    }

    _o(attr, dk, fb = null) {
      const v = this.getAttribute(attr);
      if (v !== null && v !== '') return v;
      const d = DEF[dk];
      return (d !== undefined && d !== null) ? String(d) : fb;
    }

    _bool(attr, dk) {
      return this.hasAttribute(attr) || !!DEF[dk];
    }

    _init() {
      /* ── 讀取全域屬性 ── */
      const theme    = this._o('theme',         'theme',        'shell');
      const hcA      = this._o('header-color',   'headerColor',  null);
      const bcA      = this._o('border-color',   'borderColor',  null);
      const acA      = this._o('arrow-color',    'arrowColor',   null);
      const tip      = this._o('arrow-tip',      'arrowTip',     'md');
      const gap      = (() => { const g = this._o('gap','gap','72px'); return /^\d+$/.test(g)?g+'px':g; })();
      const rev      = this._o('reveal',         'reveal',       'cumulative');
      const anim     = this._o('animation',      'animation',    'fade');
      const eqH      = this._bool('equal-height','equalHeight');
      const start    = Math.min(Math.max(parseInt(this._o('current','current','0'))||0,0),99);
      const arStyle  = this._o('arrow-style',    'arrowStyle',   'solid');
      const arGlow   = this._bool('arrow-glow',  'arrowGlow');
      const globalW  = toW(this._o('step-width', 'stepWidth',    null));

      /* ── 新增樣式屬性 ── */
      const boxShadow   = this._o('box-shadow',           'boxShadow',          'none');
      const borderWidth = this._o('border-width',          'borderWidth',        '2.5px');
      const borderRadius= this._o('border-radius',         'borderRadius',       '5px');
      const hdrGrad     = this._o('header-gradient',       'headerGradient',     'none');
      const hdrAccent   = this._o('header-accent-line',    'headerAccentLine',   'none');
      const hdrFS       = this._o('header-font-size',      'headerFontSize',     '1.125rem');
      const hdrLS       = this._o('header-letter-spacing', 'headerLetterSpacing','0');
      const cntFS       = this._o('content-font-size',     'contentFontSize',    '1.125rem');
      const cntLH       = this._o('content-line-height',   'contentLineHeight',  '1.5');

      /* ── 分支樣式屬性 ── */
      const branchLabelTheme = this._o('branch-label-theme','branchLabelTheme','teal');
      const branchDim        = this._o('branch-dim',        'branchDim',       '0.80');

      /* ── 色彩解析 ── */
      const thHex  = clr(theme) || P.shell;
      const baseHB = clr(hcA)   || thHex;
      const baseBD = clr(bcA)   || thHex;
      const arrClr = clr(acA)   || thHex;
      const brBtnClr = clr(branchLabelTheme) || P.teal;

      /* ── on-complete ── */
      const ocId = this.getAttribute('on-complete');
      this._oc = ocId ? document.getElementById(ocId) : null;
      if (this._oc) this._oc.style.display = 'none';

      /* ── 狀態 ── */
      this._rev    = rev;
      this._eqH    = eqH;
      this._anim   = anim;
      this._cur    = start;
      this._path   = [];          // 記錄選擇路徑
      this._branchDone = false;   // 目前有無通過一個分支

      /* ── 解析子節點為「段落」清單 ──────────────────────────────────────────
         每個段落是 { type:'step', … } 或 { type:'branch', options:[…] }
      ─────────────────────────────────────────────────────────────────────── */
      const segments = this._parseSegments();
      if (!segments.length) return;

      const animCls = { fade:'af-fade', slide:'af-slide', none:'af-none' }[anim] ?? 'af-fade';

      /* 清空並重建 */
      this.innerHTML = '';

      /* ── 渲染 ── */
      this._bx      = [];   // 所有步驟 box 元素（主流程 + 分支內）
      this._ar      = [];   // 主流程箭頭欄元素
      this._segMeta = [];   // 每個 segment 的附加資訊
      this._branchEls = []; // { wrap, paths: [{btn, pathEl, steps, arrows}] }[]

      const wrap = document.createElement('div');
      wrap.className = 'af-w';
      this._mainWrap = wrap;

      /* 追蹤目前主流程已展示多少步驟（用於 start 支援） */
      let mainStepIdx = 0;

      segments.forEach((seg, si) => {
        if (seg.type === 'step') {
          const shown  = mainStepIdx <= start;
          const col    = this._makeStepCol(seg, {
            baseHB, baseBD, hdrGrad, hdrAccent, hdrFS, hdrLS,
            cntFS, cntLH, boxShadow, borderWidth, borderRadius,
            animCls, globalW, shown,
          });
          wrap.appendChild(col.colEl);
          this._bx.push(col.boxEl);
          this._segMeta.push({ type:'step', mainIdx: mainStepIdx, segIdx: si });

          /* 如果後面還有 segment，加箭頭欄 */
          const hasNext = si < segments.length - 1;
          if (hasNext) {
            const nextIsBranch = segments[si+1]?.type === 'branch';
            const arEl = this._makeArrow({
              tip, arrClr, arStyle, arGlow, gap,
              state: mainStepIdx < start ? 'ps'
                   : mainStepIdx === start ? 'ac'
                   : 'lk',
              onClick: () => this._mainFwd(si),
              label: nextIsBranch ? '選擇路徑' : null,
            });
            wrap.appendChild(arEl);
            this._ar.push({ el: arEl, segIdx: si });
          }

          mainStepIdx++;
        } else if (seg.type === 'branch') {
          /* 分支區塊 */
          const branchWrap = document.createElement('div');
          branchWrap.className = 'af-branch-wrap';

          /* 選擇按鈕列 */
          const btnsDiv = document.createElement('div');
          btnsDiv.className = 'af-branch-btns';

          /* 分支主體 */
          const bodyDiv = document.createElement('div');
          bodyDiv.className = 'af-branch-body';

          const pathsData = [];

          seg.options.forEach((opt, oi) => {
            const optClr = clr(opt.theme) || thHex;
            const optHB  = optClr;
            const optBD  = optClr;

            /* 選擇按鈕 */
            const btn = document.createElement('button');
            btn.className = 'af-branch-btn';
            btn.style.setProperty('--af-btn-clr', brBtnClr);
            btn.style.setProperty('--af-btn-clr', optClr);
            btn.textContent = opt.label || `路徑 ${oi+1}`;
            btnsDiv.appendChild(btn);

            /* 路徑容器 */
            const pathEl = document.createElement('div');
            pathEl.className = 'af-branch-path pending';
            pathEl.style.setProperty('--af-branch-clr', optClr);
            pathEl.style.setProperty('--af-branch-dim', branchDim);

            /* 路徑標題 */
            const ptitle = document.createElement('div');
            ptitle.className = 'af-branch-path-title';
            ptitle.textContent = opt.label || `路徑 ${oi+1}`;
            pathEl.appendChild(ptitle);

            /* 路徑內部水平步驟列 */
            const rowEl = document.createElement('div');
            rowEl.className = 'af-branch-row';

            const pathSteps   = [];
            const pathArrows  = [];

            opt.steps.forEach((step, pi) => {
              const col = this._makeStepCol(step, {
                baseHB: optHB, baseBD: optBD,
                hdrGrad, hdrAccent, hdrFS, hdrLS,
                cntFS, cntLH, boxShadow, borderWidth, borderRadius,
                animCls, globalW: step.width ? toW(step.width) : globalW,
                shown: false, /* 分支內步驟一律從隱藏開始 */
              });
              rowEl.appendChild(col.colEl);
              pathSteps.push(col.boxEl);

              if (pi < opt.steps.length - 1) {
                const arEl = this._makeArrow({
                  tip, arrClr: optClr, arStyle, arGlow, gap,
                  state: 'lk',
                  onClick: () => this._branchFwd(pathsData[oi], pi),
                });
                rowEl.appendChild(arEl);
                pathArrows.push({ el: arEl, stepIdx: pi });
              }
            });

            pathEl.appendChild(rowEl);
            bodyDiv.appendChild(pathEl);

            const pData = {
              idx: oi, label: opt.label, optClr,
              btn, pathEl, rowEl,
              steps: pathSteps,
              arrows: pathArrows,
              cur: -1,          // -1 = 尚未啟動
              done: false,
            };
            pathsData.push(pData);

            btn.addEventListener('click', () => this._selectBranch(si, pathsData, pData, segments));
          });

          branchWrap.appendChild(btnsDiv);
          branchWrap.appendChild(bodyDiv);

          /* 合流箭頭（如果後面還有主流程步驟） */
          const hasNextMain = si < segments.length - 1 && segments[si+1]?.type === 'step';
          let mergeArrow = null;
          if (hasNextMain) {
            mergeArrow = document.createElement('div');
            mergeArrow.className = 'af-merge-arrow';
            mergeArrow.appendChild(makeMergeSVG(arrClr));
            branchWrap.appendChild(mergeArrow);
          }

          /* 將分支區塊插入主行（換行方式：用獨立 div 包） */
          const branchCol = document.createElement('div');
          branchCol.style.cssText = 'width:100%;flex:none;display:flex;flex-direction:column;';
          branchCol.appendChild(branchWrap);
          wrap.appendChild(branchCol);

          this._branchEls.push({ si, pathsData, mergeArrow, resolved: false });
          this._segMeta.push({ type:'branch', branchIdx: this._branchEls.length-1, segIdx: si });
        }
      });

      /* 主流程計步（用於 _mainFwd 確定可點選的箭頭） */
      this._mainStepCount = mainStepIdx;

      /* 主流程換行 — af-w 改為 flex-wrap:wrap */
      wrap.style.flexWrap = 'wrap';

      this.appendChild(wrap);

      if (eqH) requestAnimationFrame(() => requestAnimationFrame(() => this._eqHt()));
      if (start >= mainStepIdx - 1 && !this._branchEls.length) this._done();
    }

    /* ── 解析子節點 ─────────────────────────────────────────────────────────── */
    _parseSegments() {
      const segs = [];
      this.querySelectorAll(':scope > flow-step, :scope > flow-branch').forEach(el => {
        if (el.tagName.toLowerCase() === 'flow-step') {
          segs.push({
            type  : 'step',
            title : el.getAttribute('title') || '',
            hc    : el.getAttribute('header-color'),
            bc    : el.getAttribute('border-color'),
            width : el.getAttribute('width'),
            html  : el.innerHTML,
          });
        } else {
          const opts = [];
          el.querySelectorAll(':scope > branch-option').forEach(bo => {
            const steps = [];
            bo.querySelectorAll(':scope > flow-step').forEach(fs => {
              steps.push({
                type  : 'step',
                title : fs.getAttribute('title') || '',
                hc    : fs.getAttribute('header-color'),
                bc    : fs.getAttribute('border-color'),
                width : fs.getAttribute('width'),
                html  : fs.innerHTML,
              });
            });
            opts.push({
              label : bo.getAttribute('label') || '',
              theme : bo.getAttribute('theme'),
              steps,
            });
          });
          segs.push({ type:'branch', options: opts });
        }
      });
      return segs;
    }

    /* ── 建立步驟欄 ─────────────────────────────────────────────────────────── */
    _makeStepCol(step, cfg) {
      const {
        baseHB, baseBD, hdrGrad, hdrAccent,
        hdrFS, hdrLS, cntFS, cntLH,
        boxShadow, borderWidth, borderRadius,
        animCls, globalW, shown,
      } = cfg;

      const hBg  = clr(step.hc) || baseHB;
      const bBd  = clr(step.bc) || baseBD;

      const col  = document.createElement('div');
      col.className = 'af-sc';
      const colW = toW(step.width) || globalW;
      if (colW) { col.style.flex = `0 0 ${colW}`; col.style.width = colW; col.style.maxWidth = colW; }

      const box = document.createElement('div');
      box.className = `af-bx ${animCls}`;
      /* CSS 變數 */
      box.style.setProperty('--af-bd',  bBd);
      box.style.setProperty('--af-bw',  borderWidth);
      box.style.setProperty('--af-br',  borderRadius);
      box.style.setProperty('--af-bs',  boxShadow);
      /* header 漸層 */
      let hBgCSS;
      if (hdrGrad === 'down') {
        hBgCSS = `linear-gradient(to bottom, ${hBg}, ${darken(hBg,0.14)})`;
      } else if (hdrGrad === 'up') {
        hBgCSS = `linear-gradient(to top, ${hBg}, ${darken(hBg,0.14)})`;
      } else {
        hBgCSS = hBg;
      }
      box.style.setProperty('--af-hbg-css', hBgCSS);
      box.style.setProperty('--af-hfg', ctrst(hBg));
      box.style.setProperty('--af-hfs', hdrFS);
      box.style.setProperty('--af-hls', hdrLS);
      box.style.setProperty('--af-cfs', cntFS);
      box.style.setProperty('--af-clh', cntLH);
      /* accent line 顏色：取 header 色的亮色反差 */
      box.style.setProperty('--af-accent-line-clr', `rgba(${ctrst(hBg)==='#0C0D0C'?'0,0,0':'255,255,255'},0.30)`);

      if (shown) {
        box.style.opacity = '1';
        box.style.transform = 'none';
        box.classList.add('af-on');
      }

      const hdr = document.createElement('div');
      hdr.className = 'af-hd';
      if (hdrAccent === 'left')  hdr.classList.add('accent-left');
      if (hdrAccent === 'top')   hdr.classList.add('accent-top');
      hdr.textContent = step.title;

      const cnt = document.createElement('div');
      cnt.className = 'af-ct';
      cnt.innerHTML = step.html;

      box.appendChild(hdr);
      box.appendChild(cnt);
      col.appendChild(box);
      return { colEl: col, boxEl: box };
    }

    /* ── 建立箭頭欄 ─────────────────────────────────────────────────────────── */
    _makeArrow({ tip, arrClr, arStyle, arGlow, gap, state, onClick, label }) {
      const ar = document.createElement('div');
      ar.className = `af-ar ${state}`;
      ar.style.width    = gap;
      ar.style.minWidth = gap;
      ar.setAttribute('title', '點擊繼續');
      ar.appendChild(makeSVG(tip, arrClr, arStyle, arGlow));
      if (label) {
        const lbl = document.createElement('span');
        lbl.className = 'af-ar-label';
        lbl.textContent = label;
        ar.appendChild(lbl);
      }
      ar.addEventListener('click', onClick);
      return ar;
    }

    /* ── 主流程前進 ─────────────────────────────────────────────────────────── */
    _mainFwd(si) {
      /* si = 當前段落索引；找下一個 step 段落 */
      const segs = this._segMeta;
      const cur  = segs.find(m => m.segIdx === si);
      if (!cur) return;

      /* 找緊接的下一個 step */
      const nextStepMeta = segs.find(m => m.type === 'step' && m.segIdx > si);
      if (!nextStepMeta) return;

      const ni = this._bx.indexOf(
        /* 對應的 box：從 bx 中找 mainIdx 對應的那個 */
        this._bx[nextStepMeta.mainIdx]
      );
      if (ni < 0) return;

      const nb = this._bx[nextStepMeta.mainIdx];
      void nb.offsetWidth;
      nb.classList.add('af-on');

      /* 更新箭頭狀態 */
      const curAr  = this._ar.find(a => a.segIdx === si);
      const nextAr = this._ar.find(a => a.segIdx === nextStepMeta.segIdx);
      if (curAr)  this._setArState(curAr.el, 'ps');
      if (nextAr) this._setArState(nextAr.el, 'ac');

      if (this._rev === 'single') {
        /* 淡出先前已顯示的主流程 step */
        segs.filter(m => m.type === 'step' && m.mainIdx < nextStepMeta.mainIdx).forEach(m => {
          const b = this._bx[m.mainIdx];
          b.style.transition = 'opacity .35s ease';
          b.style.opacity = '0';
        });
      }

      this._cur = nextStepMeta.mainIdx;
      this.dispatchEvent(new CustomEvent('step-change', {
        detail: { index: nextStepMeta.mainIdx, path: [...this._path], branchId: null },
        bubbles: true,
      }));

      if (this._eqH) requestAnimationFrame(() => this._eqHt());

      /* 判斷是否完成（最後一個 step 沒有後續未解鎖的 branch） */
      this._checkDone(si);
    }

    /* ── 分支選擇 ────────────────────────────────────────────────────────────── */
    _selectBranch(si, pathsData, chosen, segments) {
      /* 如果已選定過此分支，不允許重選（可視需求開放） */
      const brEl = this._branchEls.find(b => b.si === si);
      if (brEl && brEl.resolved) return;

      this._path.push(chosen.label || chosen.idx);

      this.dispatchEvent(new CustomEvent('branch-select', {
        detail: { branchId: chosen.idx, label: chosen.label },
        bubbles: true,
      }));

      /* 更新所有路徑的 CSS 狀態 */
      pathsData.forEach(p => {
        p.btn.classList.toggle('selected', p === chosen);
        p.pathEl.classList.remove('pending','active','dimmed');
        p.pathEl.classList.add(p === chosen ? 'active' : 'dimmed');
      });

      /* 啟動被選路徑的第一個步驟 */
      chosen.cur = 0;
      if (chosen.steps.length > 0) {
        const first = chosen.steps[0];
        void first.offsetWidth;
        first.classList.add('af-on');

        /* 若路徑只有一步，直接標記完成 */
        if (chosen.steps.length === 1) {
          chosen.done = true;
          this._checkBranchAllDone(si, pathsData, brEl, segments);
        } else {
          /* 啟用第一個箭頭 */
          if (chosen.arrows.length) this._setArState(chosen.arrows[0].el, 'ac');
        }
      } else {
        /* 空路徑，直接完成 */
        chosen.done = true;
        this._checkBranchAllDone(si, pathsData, brEl, segments);
      }

      if (this._eqH) requestAnimationFrame(() => this._eqHt());
    }

    /* ── 分支內步驟前進 ──────────────────────────────────────────────────────── */
    _branchFwd(pData, ai) {
      const ni = ai + 1;
      if (ni >= pData.steps.length) return;

      const nb = pData.steps[ni];
      void nb.offsetWidth;
      nb.classList.add('af-on');

      if (pData.arrows[ai])  this._setArState(pData.arrows[ai].el,  'ps');
      if (pData.arrows[ni])  this._setArState(pData.arrows[ni].el,  'ac');

      pData.cur = ni;

      this.dispatchEvent(new CustomEvent('step-change', {
        detail: { index: ni, path: [...this._path], branchId: pData.idx },
        bubbles: true,
      }));

      if (ni === pData.steps.length - 1) {
        pData.done = true;
        /* 找所屬 branch 的 si */
        const brEl = this._branchEls.find(b =>
          b.pathsData.includes(pData)
        );
        if (brEl) this._checkBranchAllDone(brEl.si, brEl.pathsData, brEl, this._allSegments());
      }

      if (this._eqH) requestAnimationFrame(() => this._eqHt());
    }

    /* segments 快取 */
    _allSegments() {
      return this._segMeta;
    }

    /* ── 判斷「被選分支」是否已走完，進而解鎖後續主流程 ─────────────────────── */
    _checkBranchAllDone(si, pathsData, brEl, segMeta) {
      /* 只要「被選中的那條路徑」done 即可（其他路徑不需完成） */
      const chosen = pathsData.find(p => p.pathEl.classList.contains('active'));
      if (!chosen || !chosen.done) return;
      if (brEl) brEl.resolved = true;

      /* 顯示合流箭頭 */
      if (brEl && brEl.mergeArrow) brEl.mergeArrow.classList.add('visible');

      /* 找緊接在此 branch 之後的下一個主流程 step，並解鎖其箭頭 */
      const nextStepMeta = this._segMeta.find(m => m.type === 'step' && m.segIdx > si);
      if (nextStepMeta) {
        /* 顯示下一個主流程 box */
        const nb = this._bx[nextStepMeta.mainIdx];
        if (nb) {
          void nb.offsetWidth;
          nb.classList.add('af-on');
        }
        /* 啟用緊接的那個箭頭 */
        const nextAr = this._ar.find(a => a.segIdx === nextStepMeta.segIdx);
        if (nextAr) this._setArState(nextAr.el, 'ac');
      } else {
        /* 沒有後續主流程步驟，整體完成 */
        this._done();
      }
    }

    /* ── 判斷整體是否完成 ────────────────────────────────────────────────────── */
    _checkDone(lastSi) {
      /* 最後一個段落索引 */
      const maxSi = Math.max(...this._segMeta.map(m => m.segIdx));
      if (lastSi >= maxSi) this._done();
    }

    _done() {
      this.dispatchEvent(new CustomEvent('flow-complete', {
        detail: { totalSteps: this._bx.length, path: [...(this._path||[])] },
        bubbles: true,
      }));
      if (this._oc) {
        this._oc.style.display = '';
        this._oc.classList.add('af-reveal');
      }
    }

    /* ── 工具 ────────────────────────────────────────────────────────────────── */
    _setArState(el, cls) {
      el.classList.remove('lk','ac','ps');
      el.classList.add(cls);
    }

    _eqHt() {
      this._bx.forEach(b => (b.style.minHeight = ''));
      const mx = Math.max(...this._bx.map(b => b.offsetHeight));
      if (mx > 0) this._bx.forEach(b => (b.style.minHeight = `${mx}px`));
    }
  }

  if (!customElements.get('arrow-flow'))
    customElements.define('arrow-flow', ArrowFlowEl);
  if (!customElements.get('flow-step'))
    customElements.define('flow-step', class extends HTMLElement {});
  if (!customElements.get('flow-branch'))
    customElements.define('flow-branch', class extends HTMLElement {});
  if (!customElements.get('branch-option'))
    customElements.define('branch-option', class extends HTMLElement {});

}());
