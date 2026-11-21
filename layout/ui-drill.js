(() => {
  'use strict';
  if (customElements.get('ui-drill')) return;

  const PALETTE = {
    base: '#0C0D0C', shell: '#C6C7BD',
    vanilla: '#DBEDD8', yellow: '#E3D322',
    indigo: '#778CE1', pink: '#FF91D7',
    /* 新色票 */
    red: '#EF6661',
    green: '#71CD76',
    blue: '#5DBAE8',
    violet: '#B484E8',
    gray: '#86877F',
    /* 新增色 */
    key: '#51DBCF',
    calm: '#A3C4BC',
    quiet: '#8EA4DE',
    playful: '#FFA987',
    urgent: '#FF2E63',
    energetic: '#B6FF00',
    dreamy: '#C394CD',
    salmon: '#FFC88A',
    'bg-alternative': '#3B2A20'
  };
  /* 新色票都偏亮，實心底一律用深色字 */
  const LIGHT_TEXT = new Set(['bg-alternative']);

  const ARROW_SVG = {
    arrow: '<path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
    chevron: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    triangle: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>'
  };

  const color = v => {
    if (!v) return '';
    const t = v.trim(), k = t.toLowerCase();
    return PALETTE[t] || PALETTE[k] || (k === 'base' ? '#0C0D0C' : t);
  };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  /* ── extra-info 快速分欄：template 內用 | 分欄，\| 為字面上的直線 ── */
  const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER']);
  const KEEP_TAGS = new Set(['UL', 'OL', 'TABLE', 'PRE', 'HR', 'DL', 'FIGURE', 'IMG']);
  const escHtml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const hasBar = (t) => /(^|[^\\])\|/.test(t);

  /* 依 | 切開 HTML 字串，略過標籤內的字元；\| 保留為 | */
  function splitBars(html) {
    const parts = [];
    let cur = '', inTag = false;
    for (let i = 0; i < html.length; i++) {
      const ch = html[i];
      if (ch === '<') inTag = true;
      else if (ch === '>') inTag = false;
      if (!inTag && ch === '\\' && html[i + 1] === '|') { cur += '|'; i++; continue; }
      if (!inTag && ch === '|') { parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    parts.push(cur);
    return parts.map((x) => x.trim());
  }

  /* 只把 \| 還原成 |（沒有真正分欄時使用） */
  function unescapeBars(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) if (w.currentNode.data.indexOf('\\|') !== -1) w.currentNode.data = w.currentNode.data.replace(/\\\|/g, '|');
  }

  /* 把容器內容依「行」整理：文字換行或區塊元素各算一行；含 | 的行變成一列，連續的列共用一個 grid，欄位上下對齊 */
  function applyColumns(root, cols, divider) {
    if (!hasBar(root.textContent)) { unescapeBars(root); return; }
    const lines = [];
    let buf = '';
    const flush = () => { if (buf.trim()) lines.push({ html: buf, inline: true }); buf = ''; };
    [...root.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const segs = n.data.split(/\r?\n/);
        segs.forEach((seg, k) => { if (k > 0) flush(); buf += escHtml(seg); });
      } else if (n.nodeType === 1) {
        if (BLOCK_TAGS.has(n.tagName) && hasBar(n.textContent)) { flush(); lines.push({ html: n.innerHTML, block: n }); }
        else if (BLOCK_TAGS.has(n.tagName) || KEEP_TAGS.has(n.tagName)) { flush(); lines.push({ node: n }); }
        else buf += n.outerHTML;
      }
    });
    flush();

    const out = document.createDocumentFragment();
    let grid = null, plain = [];
    const endPlain = () => {
      if (!plain.length) return;
      const d = document.createElement('div');
      d.innerHTML = plain.join('\n');
      unescapeBars(d);
      out.appendChild(d);
      plain = [];
    };
    const endGrid = () => {
      if (!grid) return;
      const n = Math.max(...grid.rows.map((r) => r.length));
      const g = document.createElement('div');
      g.className = 'uid-cols';
      g.style.gridTemplateColumns = cols || `repeat(${n}, minmax(0, 1fr))`;
      if (divider && divider !== 'none') { g.dataset.divider = ''; g.style.setProperty('--uid-col-divider', divider); }
      grid.rows.forEach((cells) => {
        cells.forEach((c, i) => {
          const cell = document.createElement('div');
          cell.className = 'uid-col' + (i === 0 ? ' is-first' : '');
          cell.innerHTML = c;
          if (i === cells.length - 1 && cells.length < n) cell.style.gridColumn = `span ${n - cells.length + 1}`;
          g.appendChild(cell);
        });
      });
      out.appendChild(g);
      grid = null;
    };
    lines.forEach((ln) => {
      if (ln.node) { endPlain(); endGrid(); unescapeBars(ln.node); out.appendChild(ln.node); return; }
      if (hasBar(ln.html.replace(/<[^>]*>/g, ''))) {
        endPlain();
        if (!grid) grid = { rows: [] };
        grid.rows.push(splitBars(ln.html));
      } else {
        endGrid();
        if (ln.block) { const b = ln.block; b.innerHTML = ln.html; unescapeBars(b); endPlain(); out.appendChild(b); }
        else plain.push(ln.html);
      }
    });
    endPlain();
    endGrid();
    while (root.firstChild) root.removeChild(root.firstChild);
    root.appendChild(out);
  }

  const variantCSS = Object.entries(PALETTE)
    .filter(([k]) => k !== 'base')
    .map(([k, v]) => `ui-drill .uid-btn.uid-v-${k}{background:${v};color:${LIGHT_TEXT.has(k) ? PALETTE.vanilla : PALETTE.base};}`)
    .join('\n');

  /* ── 版面裝飾 decor：terminal 終端機、blueprint 藍圖、chalkboard 黑板 ──
     只改外觀，不改行為；強調色跟著 accent（--uid-tile-on）。
     外層三欄一律寫成 .uid-wrap > .uid-col，避免套到 template 分欄的格子（格子也叫 uid-col）。
     .uid-tabbar + .uid-wrap 一併列出，壓過分頁版型的預設內距。 */
  const DECOR = ['terminal', 'blueprint', 'chalkboard'];
  const DECOR_GAP0 = new Set(['terminal', 'chalkboard']);
  const MONO = 'Consolas,ui-monospace,Menlo,monospace';
  const CHALK = '"Comic Sans MS","BiauKai","DFKai-SB","Kaiti TC","KaiTi",cursive';
  const BP_GRID = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M0 0.5H120M0 24.5H120M0 48.5H120M0 72.5H120M0 96.5H120M0.5 0V120M24.5 0V120M48.5 0V120M72.5 0V120M96.5 0V120' stroke='%231E2D52' stroke-width='1'/%3E%3Cpath d='M0 0.5H120M0.5 0V120' stroke='%232A3D6B' stroke-width='1'/%3E%3C/svg%3E\")";
  const CHALK_DUST = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cg fill='%232A4538'%3E%3Ccircle cx='12' cy='18' r='1.2'/%3E%3Ccircle cx='58' cy='9' r='0.9'/%3E%3Ccircle cx='77' cy='52' r='1.3'/%3E%3Ccircle cx='31' cy='64' r='1'/%3E%3Ccircle cx='49' cy='81' r='1.1'/%3E%3Cpath d='M6 44 q14 -4 26 1' stroke='%232A4538' stroke-width='2' fill='none'/%3E%3Cpath d='M54 30 q12 3 24 -2' stroke='%232A4538' stroke-width='2' fill='none'/%3E%3C/g%3E%3C/svg%3E\")";
  const DECOR_CSS = `
/* terminal：視窗標題列（decor-label，預設用 title）、紅黃綠三點、$ 提示符、閃爍游標、等寬字 */
ui-drill[decor="terminal"] .uid-title{font-family:${MONO};color:${PALETTE.green};}
ui-drill[decor="terminal"] .uid-title::before{content:"// ";color:${PALETTE.gray};}
ui-drill[decor="terminal"] .uid-wrap,
ui-drill[decor="terminal"] .uid-tabbar + .uid-wrap{position:relative;background:#0F100F;border:2px solid #3A3B3A;border-radius:10px;padding:34px 0 0 0;gap:0;}
ui-drill[decor="terminal"] .uid-wrap::before{content:attr(data-term);position:absolute;left:0;right:0;top:0;height:32px;background:#1C1D1C;border-bottom:2px solid #3A3B3A;border-radius:8px 8px 0 0;color:${PALETTE.gray};font-family:${MONO};font-size:0.85rem;line-height:32px;text-align:center;overflow:hidden;white-space:nowrap;}
ui-drill[decor="terminal"] .uid-wrap::after{content:"";position:absolute;left:16px;top:10px;width:12px;height:12px;border-radius:50%;background:${PALETTE.red};box-shadow:20px 0 0 0 ${PALETTE.yellow},40px 0 0 0 ${PALETTE.green};}
ui-drill[decor="terminal"] .uid-wrap > .uid-col{padding:16px 20px;}
ui-drill[decor="terminal"] .uid-wrap > .uid-col + .uid-col{border-left:1px solid #2A2B2A;}
ui-drill[decor="terminal"] .uid-stack > .uid-right{border-top:1px solid #2A2B2A;}
ui-drill[decor="terminal"] .uid-head{font-family:${MONO};color:var(--uid-tile-on);border-bottom:1px dashed #3A3B3A;}
ui-drill[decor="terminal"] .uid-head::before{content:"$ ";color:${PALETTE.green};}
ui-drill[decor="terminal"] .uid-head::after{content:"";display:inline-block;width:9px;height:1.05em;margin:0 0 0 6px;vertical-align:-2px;background:var(--uid-tile-on);animation:uidBlink 1s steps(1) infinite;}
ui-drill[decor="terminal"] .uid-body{font-family:${MONO},"Microsoft JhengHei",sans-serif;font-size:0.95rem;}
ui-drill[decor="terminal"] drill-tile .uid-box{border-radius:4px;}
ui-drill[decor="terminal"] .uid-btn{border-radius:2px;font-family:${MONO};}
ui-drill[decor="terminal"] .uid-arrow{background:#0F100F;}
@keyframes uidBlink{50%{background:#0F100F;}}

/* blueprint：深藍方格底、每欄虛線框、左上角 A-01 編號、直角 */
ui-drill[decor="blueprint"] .uid-title{display:inline-block;color:${PALETTE.vanilla};letter-spacing:2px;border-bottom:3px double ${PALETTE.quiet};padding:0 0 6px 0;}
ui-drill[decor="blueprint"] .uid-wrap,
ui-drill[decor="blueprint"] .uid-tabbar + .uid-wrap{counter-reset:uidbp;background-color:#14203B;background-image:${BP_GRID};border:2px solid ${PALETTE.quiet};border-radius:4px;padding:16px;gap:var(--uid-gap);}
ui-drill[decor="blueprint"] .uid-wrap > .uid-col{counter-increment:uidbp;position:relative;border:1px dashed ${PALETTE.quiet};padding:30px 16px 16px 16px;background:#14203B;}
ui-drill[decor="blueprint"] .uid-wrap > .uid-col::before{content:"A-0" counter(uidbp);position:absolute;top:0;left:0;background:${PALETTE.quiet};color:#14203B;font-family:${MONO};font-size:0.75rem;font-weight:700;padding:2px 8px;}
ui-drill[decor="blueprint"] .uid-head{color:${PALETTE.vanilla};letter-spacing:1px;border-bottom:1px solid ${PALETTE.quiet};}
ui-drill[decor="blueprint"] drill-tile .uid-box,
ui-drill[decor="blueprint"] .uid-btn{border-radius:0;}
ui-drill[decor="blueprint"] .uid-ph{border-color:${PALETTE.quiet};color:${PALETTE.quiet};}
ui-drill[decor="blueprint"] .uid-arrow{background:#14203B;}

/* chalkboard：深綠板面、木框、粉筆槽與四支粉筆、粉筆字、虛線按鈕（按下才填滿） */
ui-drill[decor="chalkboard"] .uid-title{display:inline-block;background:#6B4A32;color:#F4F1EA;border:3px solid #4A3222;border-radius:6px;padding:4px 18px;font-family:${CHALK};font-size:1.25rem;}
ui-drill[decor="chalkboard"] .uid-wrap,
ui-drill[decor="chalkboard"] .uid-tabbar + .uid-wrap{position:relative;gap:0;background-color:#233B30;background-image:${CHALK_DUST};border:14px solid #6B4A32;border-radius:8px;padding:22px 16px 44px 16px;box-shadow:inset 0 0 0 3px #1A2E25,0 0 0 3px #4A3222;}
ui-drill[decor="chalkboard"] .uid-wrap::after{content:"";position:absolute;left:24px;right:24px;bottom:0;height:12px;background:#5A3D29;border-top:2px solid #7B5A40;border-radius:3px 3px 0 0;}
ui-drill[decor="chalkboard"] .uid-wrap::before{content:"";position:absolute;right:220px;bottom:12px;width:30px;height:8px;border-radius:3px;background:#F4F1EA;box-shadow:42px 0 0 0 ${PALETTE.yellow},84px 0 0 0 ${PALETTE.pink},126px 0 0 0 ${PALETTE.blue};z-index:1;}
ui-drill[decor="chalkboard"] .uid-wrap > .uid-col{padding:0 20px;}
ui-drill[decor="chalkboard"] .uid-wrap > .uid-col + .uid-col{border-left:2px dashed #7E9A8B;}
ui-drill[decor="chalkboard"] .uid-stack > .uid-right{border-top:2px dashed #7E9A8B;padding-top:16px;}
ui-drill[decor="chalkboard"] .uid-head{font-family:${CHALK};font-size:1.3rem;color:#F4F1EA;border-bottom:2px dashed #F4F1EA;}
ui-drill[decor="chalkboard"] .uid-body{color:#EDEBE4;}
ui-drill[decor="chalkboard"] .uid-body b{color:${PALETTE.yellow};font-family:${CHALK};}
ui-drill[decor="chalkboard"] drill-tile .uid-box{border-radius:10px;}
ui-drill[decor="chalkboard"] .uid-label{color:#EDEBE4;}
ui-drill[decor="chalkboard"] .uid-btn{background:#233B30 !important;color:var(--uid-tile-on) !important;border:2px dashed var(--uid-tile-on);box-shadow:none;}
ui-drill[decor="chalkboard"] .uid-btn:hover,
ui-drill[decor="chalkboard"] .uid-btn.uid-on{border-style:solid;background:var(--uid-tile-on) !important;color:#233B30 !important;}
ui-drill[decor="chalkboard"] .uid-ph{border-color:#7E9A8B;color:${PALETTE.shell};}
ui-drill[decor="chalkboard"] .uid-arrow{background:#233B30;}
`;

  const CSS = `
ui-drill{display:block;color:${PALETTE.shell};font-size:1rem;}
ui-drill:not([data-ready]){visibility:hidden;}
ui-drill .uid-title{font-size:1.2rem;font-weight:700;color:${PALETTE.violet};margin:0 0 16px 0;}
ui-drill .uid-wrap{display:grid;grid-template-columns:var(--uid-cols);gap:var(--uid-gap);align-items:stretch;box-sizing:border-box;}
ui-drill .uid-wrap.uid-noright{grid-template-columns:var(--uid-cols2);}
ui-drill .uid-wrap.uid-noright .uid-right{display:none;}
ui-drill .uid-col{min-width:0;overflow:auto;display:flex;flex-direction:column;box-sizing:border-box;}
ui-drill[bordered] .uid-wrap{border:1px solid ${PALETTE.shell};border-radius:8px;gap:0;}
ui-drill[bordered] .uid-col{padding:16px;}
ui-drill[bordered] .uid-col + .uid-col{border-left:1px solid ${PALETTE.shell};}
ui-drill .uid-left{grid-column:1;grid-row:1;}
ui-drill .uid-mid{grid-column:2;grid-row:1;}
ui-drill .uid-right{grid-column:3;grid-row:1;}

ui-drill .uid-arrow{grid-row:1;z-index:2;pointer-events:none;justify-self:start;align-self:start;width:var(--uid-asize);height:var(--uid-asize);margin-top:var(--uid-aoff);margin-left:calc(-1 * (var(--uid-agap) / 2 + var(--uid-asize) / 2));color:var(--uid-acolor);background:${PALETTE.base};display:flex;align-items:center;justify-content:center;box-sizing:border-box;line-height:1;}
ui-drill .uid-arrow-1{grid-column:2;}
ui-drill .uid-arrow-2{grid-column:3;}
ui-drill .uid-arrow[data-on]{color:var(--uid-aon);}
ui-drill .uid-arrow svg{width:100%;height:100%;display:block;}
ui-drill .uid-arrow i{font-size:calc(var(--uid-asize) * 0.9);line-height:1;}
ui-drill[arrow-style="circle"] .uid-arrow{border:2px solid currentColor;border-radius:50%;padding:calc(var(--uid-asize) * 0.18);}
ui-drill[arrow-style="circle"] .uid-arrow i{font-size:calc(var(--uid-asize) * 0.55);}
ui-drill[arrow-position="middle"] .uid-arrow{align-self:center;margin-top:0;}
ui-drill[arrow-position="bottom"] .uid-arrow{align-self:end;margin-top:0;margin-bottom:var(--uid-aoff);}
ui-drill .uid-wrap.uid-noright .uid-arrow-2{display:none;}

ui-drill .uid-wrap.uid-stack{grid-template-columns:var(--uid-cols2);grid-template-rows:var(--uid-srows);}
ui-drill .uid-wrap.uid-stack.uid-noright{grid-template-rows:var(--uid-srows2);}
ui-drill .uid-stack .uid-left{grid-row:1 / -1;}
ui-drill .uid-stack .uid-rightup{grid-column:2;grid-row:1;}
ui-drill .uid-stack .uid-mid{display:none;}
ui-drill .uid-stack .uid-right{grid-column:2;grid-row:var(--uid-rright);}
ui-drill[bordered] .uid-stack .uid-rightup + .uid-mid,
ui-drill[bordered] .uid-stack .uid-right{border-top:1px solid ${PALETTE.shell};}
ui-drill .uid-stack .uid-arrow-1{grid-row:1 / -1;}
ui-drill .uid-stack .uid-arrow-2{grid-column:2;grid-row:var(--uid-rright);justify-self:center;align-self:start;margin:calc(-1 * (var(--uid-agap) / 2 + var(--uid-asize) / 2)) 0 0 0;transform:rotate(90deg);}

ui-drill rightup-item{display:flex;gap:12px;align-items:baseline;padding:var(--uid-rupad) 0;}
ui-drill rightup-item[hidden]{display:none;}
ui-drill rightup-item:not([data-last]){border-bottom:var(--uid-rud);}
ui-drill[rightup-label="top"] rightup-item{align-items:flex-start;}
ui-drill .uid-ru-label{flex:0 0 var(--uid-rulw);color:${PALETTE.blue};font-weight:700;font-size:0.95rem;}
ui-drill .uid-ru-main,
ui-drill .uid-ru-box{flex:1 1 auto;min-width:0;}
ui-drill .uid-ru-icon{flex:0 0 auto;font-size:1.1rem;line-height:1.6;color:var(--uid-tile-on);}
ui-drill .uid-ru-line{display:flex;align-items:baseline;gap:12px;}
ui-drill .uid-ru-line .uid-ru-label{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
ui-drill .uid-ru-note{font-size:0.9rem;color:${PALETTE.vanilla};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
ui-drill[rightup-label="top"] .uid-ru-body{font-size:0.85rem;color:${PALETTE.indigo};display:-webkit-box;-webkit-line-clamp:var(--uid-rulines);-webkit-box-orient:vertical;overflow:hidden;}
ui-drill .uid-ru-end{flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;margin-left:auto;}
ui-drill .uid-ru-meta{font-size:0.8rem;color:${PALETTE.indigo};white-space:nowrap;}
ui-drill .uid-ru-badge{background:${PALETTE.red};color:${PALETTE.vanilla};font-size:0.7rem;font-weight:700;line-height:1.5;border-radius:999px;padding:1px 8px;}
ui-drill rightup-item[unread] .uid-ru-label{color:${PALETTE.vanilla};font-weight:800;}
ui-drill rightup-item[unread] .uid-ru-label::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--uid-tile-on);margin:0 8px 0 0;vertical-align:middle;}
ui-drill rightup-item.uid-on .uid-ru-label{color:var(--uid-tile-on);}
ui-drill rightup-item[disabled]{cursor:not-allowed;filter:grayscale(1);}
ui-drill .uid-ru-body > :first-child{margin-top:0;}
ui-drill .uid-ru-body > :last-child{margin-bottom:0;}
ui-drill rightup-item[detail]{cursor:pointer;}
ui-drill rightup-item[detail]:hover .uid-ru-body{color:${PALETTE.vanilla};}
ui-drill rightup-item.uid-on{box-shadow:inset 3px 0 0 var(--uid-tile-on);padding-left:12px;}

ui-drill .uid-head{font-size:1.1rem;font-weight:700;color:var(--uid-head,${PALETTE.blue});margin:0 0 12px 0;padding:0 0 8px 0;border-bottom:1px solid var(--uid-head-line,var(--uid-head,${PALETTE.blue}));}
ui-drill .uid-head:empty{display:none;}
ui-drill .uid-body{line-height:1.7;}
ui-drill .uid-body > :first-child{margin-top:0;}
ui-drill .uid-body > :last-child{margin-bottom:0;}
ui-drill .uid-cols{display:grid;column-gap:var(--uid-scg);row-gap:var(--uid-srg);margin:0 0 6px 0;}
ui-drill .uid-cols:last-child{margin-bottom:0;}
ui-drill .uid-col{min-width:0;}
ui-drill .uid-cols[data-divider] .uid-col:not(.is-first){border-left:1px var(--uid-col-divider) var(--uid-sdc);padding-left:var(--uid-scg);}
ui-drill .uid-ph{color:${PALETTE.indigo};font-size:0.95rem;text-align:center;border:1px dashed ${PALETTE.indigo};border-radius:8px;padding:24px 16px;}
ui-drill .uid-alert{background:${PALETTE.base};border:1px solid ${PALETTE.red};color:${PALETTE.red};border-radius:6px;padding:12px 16px;margin:0;font-size:0.95rem;}

ui-drill .uid-tiles{display:grid;grid-template-columns:repeat(var(--uid-tcols),max-content);gap:var(--uid-tgap);align-content:start;justify-content:start;}
ui-drill .uid-group{grid-column:1 / -1;font-size:0.8rem;font-weight:700;color:${PALETTE.blue};margin:6px 0 0 0;}
ui-drill .uid-group:first-child{margin-top:0;}
ui-drill drill-tile{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;user-select:none;outline:none;}
ui-drill drill-tile .uid-box{position:relative;width:var(--uid-size);height:var(--uid-size);background:var(--uid-tile);color:var(--uid-icon);display:flex;align-items:center;justify-content:center;font-size:var(--uid-isize);border:2px solid transparent;box-sizing:border-box;}
ui-drill[tile-shape="rounded"] drill-tile .uid-box{border-radius:8px;}
ui-drill[tile-shape="circle"] drill-tile .uid-box{border-radius:50%;}
ui-drill drill-tile:hover .uid-box{border-color:${PALETTE.vanilla};}
ui-drill drill-tile[data-active] .uid-box{background:var(--uid-tile-on);border-color:${PALETTE.vanilla};}
ui-drill drill-tile:focus-visible .uid-box{outline:2px dashed ${PALETTE.vanilla};outline-offset:2px;}
ui-drill drill-tile[disabled]{cursor:not-allowed;}
ui-drill drill-tile[disabled] .uid-box{background:${PALETTE.base};color:${PALETTE.shell};border:2px dashed ${PALETTE.shell};}
ui-drill .uid-label{font-size:0.8rem;line-height:1.3;text-align:center;max-width:calc(var(--uid-size) + 24px);word-break:break-all;}
ui-drill drill-tile[data-active] .uid-label{color:var(--uid-tile-on);font-weight:700;}
ui-drill .uid-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:${PALETTE.red};color:${PALETTE.vanilla};font-size:0.7rem;font-weight:700;line-height:18px;text-align:center;box-sizing:border-box;}

ui-drill .uid-btn{display:inline-flex;align-items:center;gap:6px;border:2px solid transparent;border-radius:6px;padding:6px 14px;margin:4px 8px 4px 0;font-size:0.95rem;font-weight:600;line-height:1.4;cursor:pointer;text-decoration:none;}
ui-drill .uid-btn:hover{border-color:${PALETTE.vanilla};}
ui-drill .uid-btn.uid-on{border-color:${PALETTE.vanilla};box-shadow:0 0 0 2px ${PALETTE.vanilla};}
ui-drill .uid-btn[disabled]{cursor:not-allowed;filter:grayscale(1);}

ui-drill .uid-tabbar .uid-tiles{display:flex;flex-wrap:nowrap;align-items:flex-end;justify-content:var(--uid-tjust);gap:var(--uid-tgap);overflow-x:auto;padding:8px 0 0 0;border-bottom:var(--uid-tbar) solid var(--uid-barc);}
ui-drill .uid-tabbar drill-tile{flex-direction:row;}
ui-drill[tab-align="stretch"] .uid-tabbar drill-tile{flex:1 1 0;}
ui-drill[tab-align="stretch"] .uid-tabbar .uid-box{width:100%;}
ui-drill .uid-tabbar .uid-box{width:var(--uid-tw);height:var(--uid-size);padding:0 var(--uid-tpad);gap:8px;font-size:var(--uid-tfs);font-weight:600;white-space:nowrap;border:none;border-radius:0;filter:brightness(var(--uid-tdim));}
ui-drill .uid-tabbar .uid-box i{font-size:var(--uid-isize);}
ui-drill .uid-tabbar drill-tile:hover .uid-box{filter:brightness(0.92);}
ui-drill .uid-tabbar drill-tile[data-active] .uid-box{filter:none;height:calc(var(--uid-size) + 6px);background:var(--uid-tile-on);}
ui-drill .uid-tabbar drill-tile[disabled] .uid-box{filter:grayscale(1) brightness(0.55);border:none;background:var(--uid-tile);color:var(--uid-icon);}
ui-drill .uid-tabbar drill-tile:focus-visible .uid-box{outline:2px dashed ${PALETTE.vanilla};outline-offset:-4px;}
ui-drill .uid-tabbar .uid-badge{position:static;margin:0 0 0 2px;}
ui-drill[tile-shape="tab-trapezoid"] .uid-tabbar .uid-box{clip-path:polygon(12px 0,calc(100% - 12px) 0,100% 100%,0 100%);padding:0 calc(var(--uid-tpad) + 8px);}
ui-drill[tile-shape="tab-rounded"] .uid-tabbar .uid-box{border-radius:10px 10px 0 0;}
ui-drill[tile-shape="tab-folder"] .uid-tabbar .uid-box{clip-path:polygon(0 100%,0 8px,8px 0,calc(100% - 20px) 0,100% 100%);padding:0 calc(var(--uid-tpad) + 12px) 0 var(--uid-tpad);}
ui-drill[tile-shape="tab-pill"] .uid-tabbar .uid-tiles{align-items:center;padding:8px 0;}
ui-drill[tile-shape="tab-pill"] .uid-tabbar .uid-box{border-radius:999px;}
ui-drill[tile-shape="tab-pill"] .uid-tabbar drill-tile[data-active] .uid-box{height:var(--uid-size);}
ui-drill[tile-shape="tab-underline"] .uid-tabbar .uid-tiles{border-bottom:1px solid ${PALETTE.shell};}
ui-drill[tile-shape="tab-underline"] .uid-tabbar .uid-box{background:transparent;color:${PALETTE.shell};filter:none;border-bottom:3px solid transparent;}
ui-drill[tile-shape="tab-underline"] .uid-tabbar drill-tile[data-active] .uid-box{background:transparent;color:var(--uid-tile-on);border-bottom-color:var(--uid-tile-on);height:var(--uid-size);}

ui-drill .uid-wrap.uid-tabs{grid-template-columns:var(--uid-tcols2);}
ui-drill .uid-wrap.uid-tabs.uid-noright,
ui-drill .uid-wrap.uid-tabs.uid-stack{grid-template-columns:minmax(0,1fr);}
ui-drill .uid-tabs .uid-mid{grid-column:1;}
ui-drill .uid-tabs .uid-right{grid-column:2;}
ui-drill .uid-tabs .uid-arrow-1{display:none;}
ui-drill .uid-tabs .uid-arrow-2{grid-column:2;}
ui-drill .uid-tabs.uid-stack .uid-rightup,
ui-drill .uid-tabs.uid-stack .uid-right,
ui-drill .uid-tabs.uid-stack .uid-arrow-2{grid-column:1;}
ui-drill[bordered] .uid-tabs.uid-stack .uid-col{border-left:none;}
ui-drill[bordered] .uid-tabbar + .uid-wrap{border-top:none;border-radius:0 0 8px 8px;}
ui-drill:not([bordered]) .uid-tabbar + .uid-wrap{padding:16px 0 0 0;}
${variantCSS}
${DECOR_CSS}
`;

  (function injectStyle() {
    if (document.getElementById('ui-drill-style')) return;
    const s = el('style');
    s.id = 'ui-drill-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  })();

  customElements.define('drill-tile', class extends HTMLElement {});
  customElements.define('rightup-item', class extends HTMLElement {});

  const divLine = st => {
    if (!st || st === 'none') return 'none';
    return `1px ${['solid', 'dashed', 'dotted'].includes(st) ? st : 'solid'} var(--uid-rudc)`;
  };

  class UiDrill extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      const go = () => this._build();
      document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', go, { once: true })
        : go();
    }

    _build() {
      const a = n => this.getAttribute(n);
      const has = n => this.hasAttribute(n);

      const cols = (a('columns') || '2,5,5').split(',').map(v => num(v, 1));
      while (cols.length < 3) cols.push(cols[cols.length - 1] || 1);

      const stack = a('layout') === 'stack';
      const shape = a('tile-shape') || '';
      const tab = shape.startsWith('tab-') ? shape.slice(4) : '';
      const o = this._o = {
        layout: stack ? 'stack' : 'columns',
        tab,
        accent: color(a('accent')) || PALETTE.blue,
        tileCols: Math.max(1, parseInt(a('tile-cols'), 10) || 3),
        tileLabel: a('tile-label') || 'tooltip',
        trigger: a('trigger') || 'click',
        detailTrigger: a('detail-trigger') || 'click',
        midTitle: a('mid-title') || '',
        rightTitle: a('right-title') || '',
        midPh: has('mid-placeholder') ? a('mid-placeholder') : '請點選左側方塊。',
        rightPh: has('right-placeholder') ? a('right-placeholder') : (stack ? '請點選上方清單。' : '請點選中欄按鈕。'),
        hideEmptyRight: has('hide-empty-right'),
        toggle: has('toggle'),
        keyboard: has('keyboard'),
        variant: a('button-color') || a('button-variant') || 'blue',
        split: (a('split') || 'true').trim().toLowerCase() !== 'false',
        splitCols: (a('split-cols') || '').trim(),
        splitDivider: (a('split-divider') || 'none').trim().toLowerCase()
      };
      const heading = a('title');
      if (heading != null) this.removeAttribute('title');

      const s = this.style;
      s.setProperty('--uid-cols', `${cols[0]}fr ${cols[1]}fr ${cols[2]}fr`);
      s.setProperty('--uid-cols2', `${cols[0]}fr ${cols[1] + cols[2]}fr`);
      s.setProperty('--uid-gap', num(a('gap'), 16) + 'px');
      s.setProperty('--uid-scg', num(a('split-col-gap'), 16) + 'px');
      s.setProperty('--uid-srg', num(a('split-row-gap'), 6) + 'px');
      s.setProperty('--uid-sdc', color(a('split-divider-color')) || o.accent);
      s.setProperty('--uid-tcols', o.tileCols);
      s.setProperty('--uid-size', num(a('tile-size'), tab ? 40 : 48) + 'px');
      s.setProperty('--uid-tgap', num(a('tile-gap'), tab ? 4 : 8) + 'px');
      s.setProperty('--uid-isize', num(a('icon-size'), tab ? 1.1 : 1.5) + 'rem');
      if (tab) {
        const just = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' };
        s.setProperty('--uid-tcols2', `${cols[1]}fr ${cols[2]}fr`);
        s.setProperty('--uid-tw', has('tab-width') ? num(a('tab-width'), 120) + 'px' : 'auto');
        s.setProperty('--uid-tpad', num(a('tab-padding'), 18) + 'px');
        s.setProperty('--uid-tfs', num(a('tab-font-size'), 1) + 'rem');
        s.setProperty('--uid-tdim', tab === 'underline' ? 1 : Math.min(1, num(a('tab-dim'), 0.75)));
        s.setProperty('--uid-tbar', num(a('tab-bar'), tab === 'pill' ? 0 : 4) + 'px');
        s.setProperty('--uid-tjust', just[a('tab-align')] || 'flex-start');
        s.setProperty('--uid-barc', o.accent);
      }
      s.setProperty('--uid-tile', color(a('tile-color')) || PALETTE.shell);
      s.setProperty('--uid-tile-on', color(a('accent')) || PALETTE.blue);
      s.setProperty('--uid-icon', color(a('icon-color')) || PALETTE.base);
      /* 欄位標題（mid-title、right-title、rightup-title）的文字色與下方分隔線色 */
      const headC = color(a('head-color')) || PALETTE.blue;
      s.setProperty('--uid-head', headC);
      s.setProperty('--uid-head-line', color(a('head-line-color')) || headC);

      const wrap = this._wrap = el('div', 'uid-wrap');
      /* 版面裝飾：decor="terminal | blueprint | chalkboard"；terminal 標題列文字用 decor-label，預設用 title */
      const decor = (a('decor') || '').trim().toLowerCase();
      if (decor && !DECOR.includes(decor)) console.warn(`[ui-drill] 不支援的 decor「${decor}」，可用：${DECOR.join('、')}`);
      if (decor === 'terminal') wrap.dataset.term = has('decor-label') ? a('decor-label') : (heading || '');
      if (has('height')) wrap.style.height = num(a('height'), 0) + 'px';
      if (has('min-height')) wrap.style.minHeight = num(a('min-height'), 0) + 'px';

      const left = el('div', 'uid-col uid-left');
      const tiles = el('div', 'uid-tiles');
      left.append(tiles);
      this._mid = this._makeCol('uid-mid');
      this._right = this._makeCol('uid-right');
      if (tab) {
        this._nav = el('div', 'uid-tabbar');
        this._nav.append(tiles);
        wrap.classList.add('uid-tabs');
        wrap.append(this._mid.col, this._right.col);
      } else {
        wrap.append(left, this._mid.col, this._right.col);
      }

      if (stack) this._buildStack(wrap, a, has);

      this._arrows = {};
      if (has('arrows')) {
        const which = (a('arrows') || 'both').trim();
        s.setProperty('--uid-asize', num(a('arrow-size'), 24) + 'px');
        s.setProperty('--uid-aoff', num(a('arrow-offset'), 16) + 'px');
        s.setProperty('--uid-agap', (has('bordered') || DECOR_GAP0.has(decor) ? 0 : num(a('gap'), 16)) + 'px');
        s.setProperty('--uid-acolor', color(a('arrow-color')) || PALETTE.shell);
        s.setProperty('--uid-aon', color(a('arrow-active-color')) || color(a('accent')) || PALETTE.blue);
        [1, 2].forEach(n => {
          if ((which === 'first' && n === 2) || (which === 'second' && n === 1)) return;
          const ar = el('span', 'uid-arrow uid-arrow-' + n);
          const icon = a('arrow-icon');
          if (icon) {
            ar.append(el('i', 'bi ' + (icon.startsWith('bi-') ? icon : 'bi-' + icon)));
          } else {
            const shape = ARROW_SVG[a('arrow-shape')] || ARROW_SVG.arrow;
            ar.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${shape}</svg>`;
          }
          wrap.append(ar);
          this._arrows[n] = ar;
        });
      }

      this._tiles = [];
      let group = null;
      [...this.children].filter(n => n.localName === 'drill-tile').forEach(t => {
        const g = t.getAttribute('group');
        if (g && g !== group && !tab) tiles.append(el('div', 'uid-group', g));
        group = g;
        this._decorateTile(t);
        tiles.append(t);
        this._tiles.push(t);
      });
      this.replaceChildren(...(heading ? [el('div', 'uid-title', heading)] : []), ...(this._nav ? [this._nav] : []), wrap);

      const pickTile = e => e.target.closest('drill-tile');
      tiles.addEventListener('click', e => {
        const t = pickTile(e);
        if (t) this._activate(t, true);
      });
      if (o.trigger === 'hover') {
        tiles.addEventListener('mouseover', e => {
          const t = pickTile(e);
          if (t && t !== this._active) this._activate(t, false);
        });
      }

      [this._mid.body, this._right.body].forEach(body => {
        const pickBtn = e => {
          const b = e.target.closest('[detail]');
          return b && body.contains(b) ? b : null;
        };
        body.addEventListener('click', e => {
          const b = pickBtn(e);
          if (!b) return;
          e.preventDefault();
          this._pressButton(b, true);
        });
        if (o.detailTrigger === 'hover') {
          body.addEventListener('mouseover', e => {
            const b = pickBtn(e);
            if (b && b !== this._detailBtn) this._pressButton(b, false);
          });
        }
      });

      if (o.keyboard) {
        tiles.addEventListener('keydown', e => this._onKey(e, pickTile(e)));
        this.addEventListener('keydown', e => { if (e.key === 'Escape') this._clearRight(); });
      }

      if (stack) {
        this._filterList();
        this._updateCounts();
      }
      this._placeholder(this._mid, o.midPh, o.midTitle.replace('{label}', '').trim());
      this._clearRight();

      const act = a('active');
      const tile = act && this._tiles.find(x => x.getAttribute('source') === act);
      if (tile && !tile.hasAttribute('disabled')) this._select(tile);

      const ad = a('active-detail');
      if (ad) this._openDetail(ad, this._findButton(ad));

      this.setAttribute('data-ready', '');
    }

    _buildStack(wrap, a, has) {
      const s = this.style;
      const o = this._o;
      o.listTitle = a('mid-title') || a('rightup-title') || '';
      o.listEmpty = has('list-empty') ? a('list-empty') : '此分類沒有項目。';
      o.autoOpen = has('auto-open');
      o.markRead = has('mark-read');
      o.tileCount = has('tile-count') ? (a('tile-count') === 'all' ? 'all' : 'unread') : '';
      o.ruTop = a('rightup-label') === 'top';

      let r1 = 'auto', r2 = 'auto';
      if (has('height')) {
        const r = (a('stack-ratio') || '1,1').split(',').map(v => num(v, 1));
        r1 = `minmax(0,${r[0]}fr)`;
        r2 = `minmax(0,${r[1] != null ? r[1] : r[0]}fr)`;
      }
      wrap.classList.add('uid-stack');
      s.setProperty('--uid-srows', `${r1} ${r2}`);
      s.setProperty('--uid-srows2', r1);
      s.setProperty('--uid-rright', 2);

      s.setProperty('--uid-rud', has('rightup-divider') ? divLine(a('rightup-divider') || 'solid') : 'none');
      s.setProperty('--uid-rudc', color(a('rightup-divider-color')) || PALETTE.shell);
      s.setProperty('--uid-rupad', num(a('rightup-padding'), 8) + 'px');
      s.setProperty('--uid-rulw', num(a('rightup-label-width'), 96) + 'px');
      s.setProperty('--uid-rulines', Math.max(1, parseInt(a('rightup-lines'), 10) || 2));

      const ru = this._list = this._makeCol('uid-rightup');
      if (has('rightup-max-height')) ru.col.style.maxHeight = num(a('rightup-max-height'), 0) + 'px';

      const tileEls = [...this.children].filter(n => n.localName === 'drill-tile');
      tileEls.forEach((t, i) => { t._uidKey = t.getAttribute('source') || 'uid-auto-' + i; });

      this._ruItems = [...this.querySelectorAll('rightup-item')].filter(r => {
        const p = r.parentElement;
        if (p === this) return true;
        if (p && p.localName === 'drill-tile' && p.parentElement === this) {
          if (!r.hasAttribute('tile')) r.setAttribute('tile', p._uidKey);
          return true;
        }
        return false;
      });
      this._ruItems.forEach(it => {
        this._decorateRow(it);
        ru.body.append(it);
      });
      this._listMsg = el('div', 'uid-ph');
      ru.body.append(this._listMsg);

      const pickRow = e => e.target.closest('rightup-item[detail]');
      ru.body.addEventListener('click', e => {
        const row = pickRow(e);
        if (row) this._pressButton(row, true);
      });
      if (o.detailTrigger === 'hover') {
        ru.body.addEventListener('mouseover', e => {
          const row = pickRow(e);
          if (row && row !== this._detailBtn) this._pressButton(row, false);
        });
      }

      wrap.insertBefore(ru.col, this._mid.col);
    }

    _decorateRow(it) {
      const ia = n => it.getAttribute(n);
      if (it.hasAttribute('divider')) it.style.setProperty('--uid-rud', divLine(ia('divider') || 'solid'));
      if (ia('color')) it.style.color = color(ia('color'));

      const body = el('div', 'uid-ru-body');
      body.append(...it.childNodes);
      if (ia('align')) body.style.textAlign = ia('align');
      const hasBody = body.children.length || body.textContent.trim();

      const icon = ia('icon') ? el('span', 'uid-ru-icon') : null;
      if (icon) icon.append(el('i', 'bi ' + (ia('icon').startsWith('bi-') ? ia('icon') : 'bi-' + ia('icon'))));
      const label = ia('label') ? el('span', 'uid-ru-label', ia('label')) : null;
      const note = ia('note') ? el('div', 'uid-ru-note', ia('note')) : null;
      let end = null;
      if (ia('meta') || ia('badge')) {
        end = el('span', 'uid-ru-end');
        if (ia('meta')) end.append(el('span', 'uid-ru-meta', ia('meta')));
        if (ia('badge')) end.append(el('span', 'uid-ru-badge', ia('badge')));
      }

      const parts = icon ? [icon] : [];
      if (this._o.ruTop) {
        const box = el('div', 'uid-ru-box');
        if (label || end) {
          const line = el('div', 'uid-ru-line');
          if (label) line.append(label);
          if (end) line.append(end);
          box.append(line);
        }
        if (note) box.append(note);
        if (hasBody) box.append(body);
        parts.push(box);
      } else {
        if (label) parts.push(label);
        const main = el('div', 'uid-ru-main');
        if (note) main.append(note);
        if (hasBody) main.append(body);
        parts.push(main);
        if (end) parts.push(end);
      }
      it.replaceChildren(...parts);
    }

    _filterList() {
      const t = this._active;
      const key = t ? t._uidKey : null;
      let last = null;
      let count = 0;
      this._ruItems.forEach(it => {
        const tl = it.getAttribute('tile');
        const show = !tl || (key != null && tl.split(',').map(x => x.trim()).includes(key));
        it.hidden = !show;
        it.removeAttribute('data-last');
        if (show) { last = it; count++; }
      });
      if (last) last.setAttribute('data-last', '');

      this._list.head.textContent = this._o.listTitle.replace('{label}', t ? (t.getAttribute('label') || '') : '').trim();
      const msg = t ? this._o.listEmpty : this._o.midPh;
      this._listMsg.textContent = msg || '';
      this._listMsg.hidden = count > 0 || !msg;
    }

    _updateCounts() {
      if (!this._o.tileCount) return;
      this._tiles.forEach(t => {
        if (t.hasAttribute('badge')) return;
        const key = t._uidKey;
        const n = this._ruItems.filter(r => {
          const tl = r.getAttribute('tile');
          return tl && tl.split(',').map(x => x.trim()).includes(key)
            && (this._o.tileCount === 'all' || r.hasAttribute('unread'));
        }).length;
        const box = t.querySelector('.uid-box');
        let b = box.querySelector('.uid-badge');
        if (!n) { if (b) b.remove(); return; }
        if (!b) { b = el('span', 'uid-badge'); box.append(b); }
        b.textContent = n;
      });
    }

    _makeCol(cls) {
      const col = el('div', 'uid-col ' + cls);
      const head = el('div', 'uid-head');
      const body = el('div', 'uid-body');
      col.append(head, body);
      return { col, head, body };
    }

    _decorateTile(t) {
      const o = this._o;
      const ta = n => t.getAttribute(n);

      const box = el('span', 'uid-box');
      const icon = ta('icon');
      if (icon) {
        const i = el('i', 'bi ' + (icon.startsWith('bi-') ? icon : 'bi-' + icon));
        box.append(i);
      }
      const label = ta('label') || '';
      if (o.tab && label) box.append(el('span', 'uid-tablabel', label));
      if (ta('badge')) box.append(el('span', 'uid-badge', ta('badge')));
      t.replaceChildren(box);

      if (!o.tab && o.tileLabel === 'below' && label) t.append(el('span', 'uid-label', label));

      const tip = ta('tooltip') || (!o.tab && o.tileLabel === 'tooltip' ? label : '');
      if (tip) t.title = tip;

      if (ta('size')) t.style.setProperty('--uid-size', num(ta('size'), 48) + 'px');
      if (ta('color')) t.style.setProperty('--uid-tile', color(ta('color')));
      t._uidOn = color(ta('active-color')) || (o.tab && color(ta('color'))) || o.accent;
      if (ta('active-color') || (o.tab && ta('color'))) t.style.setProperty('--uid-tile-on', t._uidOn);
      if (ta('icon-color')) t.style.setProperty('--uid-icon', color(ta('icon-color')));

      if (o.keyboard && !t.hasAttribute('disabled')) t.tabIndex = 0;
    }

    _activate(t, isClick) {
      if (t.hasAttribute('disabled')) return;

      const href = t.getAttribute('href');
      if (href) {
        if (isClick) {
          const target = t.getAttribute('target');
          target ? window.open(href, target) : (location.href = href);
        }
        return;
      }

      if (t === this._active) {
        if (isClick && this._o.toggle) this._reset();
        return;
      }
      this._select(t);
    }

    _select(t) {
      this._tiles.forEach(x => x.toggleAttribute('data-active', x === t));
      this._active = t;
      this._arrowOn(1, true);
      if (this._nav) this._nav.style.setProperty('--uid-barc', t._uidOn);

      if (this._o.layout === 'stack') {
        this._filterList();
        this._clearRight();
        const d = t.getAttribute('detail');
        if (d) {
          this._openDetail(d, this._findButton(d));
        } else if (this._o.autoOpen) {
          const row = this._ruItems.find(r => !r.hidden && r.hasAttribute('detail') && !r.hasAttribute('disabled'));
          if (row) this._openDetail(row.getAttribute('detail'), row);
        }
        return;
      }

      const label = t.getAttribute('label') || '';
      const src = t.getAttribute('source');
      this._fill(this._mid, src, this._o.midTitle.replace('{label}', label), src ? '' : '此方塊未設定 source 屬性。');
      this._decorateButtons(this._mid.body);
      this._clearRight();

      const d = t.getAttribute('detail');
      if (d) this._openDetail(d, this._findButton(d));
    }

    _reset() {
      this._tiles.forEach(x => x.removeAttribute('data-active'));
      this._active = null;
      this._arrowOn(1, false);
      if (this._nav) this._nav.style.setProperty('--uid-barc', this._o.accent);
      this._placeholder(this._mid, this._o.midPh, this._o.midTitle.replace('{label}', '').trim());
      if (this._o.layout === 'stack') this._filterList();
      this._clearRight();
    }

    _decorateButtons(root) {
      root.querySelectorAll('[detail]').forEach(b => {
        if (b.localName === 'button' && !b.hasAttribute('type')) b.type = 'button';
        if (b.classList.contains('uid-btn')) return;
        // 使用者自己套了 Bootstrap 按鈕樣式就不覆蓋
        if ([...b.classList].some(c => c === 'btn' || c.startsWith('btn-'))) return;
        const v = b.getAttribute('color') || b.getAttribute('variant') || this._o.variant;
        b.classList.add('uid-btn');
        const vk = String(v || '').trim().toLowerCase();
        if (PALETTE[vk]) {
          b.classList.add('uid-v-' + vk);
        } else {
          b.style.background = color(v);
          b.style.color = PALETTE.base;
        }
      });
    }

    _findButton(id) {
      const root = this._o.layout === 'stack' ? this._list.body : this._mid.body;
      return [...root.querySelectorAll('[detail]')].find(b => !b.hidden && b.getAttribute('detail') === id) || null;
    }

    _pressButton(b, isClick) {
      if (b.disabled || b.hasAttribute('disabled')) return;
      if (b === this._detailBtn) {
        if (isClick && b.hasAttribute('toggle')) this._clearRight();
        return;
      }
      this._openDetail(b.getAttribute('detail'), b);
    }

    _setBtnOn(b, on) {
      if (!b) return;
      b.classList.toggle('uid-on', on);
      if (b.classList.contains('btn')) b.classList.toggle('active', on);
    }

    _openDetail(id, btn) {
      this._setBtnOn(this._detailBtn, false);
      this._detailBtn = btn;
      this._setBtnOn(btn, true);

      const btnLabel = btn ? (btn.getAttribute('label') || btn.textContent.trim()) : '';
      const title = btn && btn.hasAttribute('detail-title')
        ? btn.getAttribute('detail-title')
        : this._o.rightTitle.replace('{label}', btnLabel);
      if (btn && btn.localName === 'rightup-item' && this._o.markRead && btn.hasAttribute('unread')) {
        btn.removeAttribute('unread');
        this._updateCounts();
      }
      this._wrap.classList.remove('uid-noright');
      this._arrowOn(2, true);
      this._fill(this._right, id, title);
      this._decorateButtons(this._right.body);
    }

    /* 欄位有內容時，前方箭頭改用啟用色 */
    _arrowOn(n, on) {
      const ar = this._arrows && this._arrows[n];
      if (ar) ar.toggleAttribute('data-on', on);
    }

    _clearRight() {
      this._setBtnOn(this._detailBtn, false);
      this._detailBtn = null;
      this._arrowOn(2, false);

      // stack：尚未點清單時，下方顯示方塊 source 的內容（例如資料夾說明）
      const t = this._active;
      const src = this._o.layout === 'stack' && t && t.getAttribute('source');
      if (src && document.getElementById(src)) {
        this._fill(this._right, src, this._o.rightTitle.replace('{label}', t.getAttribute('label') || ''));
        this._decorateButtons(this._right.body);
        this._wrap.classList.remove('uid-noright');
        return;
      }
      this._placeholder(this._right, this._o.rightPh, this._o.rightTitle.replace('{label}', '').trim());
      if (this._o.hideEmptyRight) this._wrap.classList.add('uid-noright');
    }

    _fill(part, id, title, missingMsg) {
      part.head.textContent = title || '';
      const src = id ? document.getElementById(id) : null;

      if (!src) {
        const box = el('div', 'alert alert-danger uid-alert', missingMsg || `找不到 id 為「${id}」的內容。`);
        part.body.replaceChildren(box);
        return;
      }

      let node;
      if (src.localName === 'template') {
        node = src.content.cloneNode(true);
        /* 快速分欄：template 上的 split、cols、col-divider 優先於元件屬性 */
        const sp = src.getAttribute('split');
        if (sp ? sp.trim().toLowerCase() !== 'false' : this._o.split) {
          applyColumns(node, (src.getAttribute('cols') || this._o.splitCols).trim(),
            (src.getAttribute('col-divider') || this._o.splitDivider).trim().toLowerCase());
        }
      } else {
        node = src.cloneNode(true);
        node.removeAttribute('id');
        node.hidden = false;
        if (node.style.display === 'none') node.style.removeProperty('display');
      }
      part.body.replaceChildren(node);
    }

    _placeholder(part, text, title) {
      part.head.textContent = title || '';
      part.body.replaceChildren(...(text ? [el('div', 'uid-ph', text)] : []));
    }

    _onKey(e, t) {
      if (!t) return;
      const list = this._tiles;
      const cols = this._o.tab ? list.length : this._o.tileCols;
      const steps = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._activate(t, true);
        return;
      }

      let j;
      if (e.key === 'Home') j = list.findIndex(x => !x.hasAttribute('disabled'));
      else if (e.key === 'End') j = list.length - 1 - [...list].reverse().findIndex(x => !x.hasAttribute('disabled'));
      else if (steps[e.key]) {
        const step = steps[e.key];
        j = list.indexOf(t) + step;
        while (j >= 0 && j < list.length && list[j].hasAttribute('disabled')) j += step;
        if (j < 0 || j >= list.length) { e.preventDefault(); return; }
      } else return;

      e.preventDefault();
      if (list[j]) list[j].focus();
    }
  }

  customElements.define('ui-drill', UiDrill);
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

/* ── mark-fx 行內標記效果：ui-drill 裡的文字可包上 <mark-fx kind="underline" color="red">…</mark-fx> ──
   kind：highlight、underline、strike、circle、double、wavy、cross、arrow、box、bracket；
   其他屬性：color、text-color、thickness、rough、padding、speed、line-style、direction、arrow-length、animate、seed。
   與 ui-play、ui-table、bp-stepper 的 mark-fx 效果相同。文字進入畫面才播放動畫，版面改變時自動重畫；
   內容是之後才動態產生或複製進來的（頁籤、翻面、細節區），也會自動啟動。 */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const COLORS = (window.UiColorTags && window.UiColorTags.colors) || { shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#C394CD', salmon:'#FFC88A' };
  const brandOf = (v) => {
    if (typeof v !== 'string') return v;
    const k = v.trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(COLORS, k) ? COLORS[k] : v;
  };
  // ─── mark-fx 行內標記效果 ────────────────────────────────────────────────────
  // <mark-fx kind="underline" color="red">文字</mark-fx>
  // 把 ui-play 的 mark-fx 效果用在標題、內文與總標題的文字上：highlight、underline、strike、circle、
  // double、wavy、cross、arrow、box、bracket。文字出現在畫面上時才播放手繪動畫，版面改變時自動重畫。
  const MFX_KINDS = ['highlight', 'underline', 'strike', 'circle', 'double', 'wavy', 'cross', 'arrow', 'box', 'bracket'];
  const MFX_NS = 'http://www.w3.org/2000/svg';

  const mfxNum = (v, d) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  const mfxHash = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  const mfxRng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const mfxLine = (x1, y1, x2, y2, rough, rnd) => {
    const j = () => (rnd() - 0.5) * rough * 4;
    const L = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / L, ny = (x2 - x1) / L;
    const bow = (rnd() - 0.5) * rough * (2 + L * 0.02);
    const mx = (x1 + x2) / 2 + nx * bow, my = (y1 + y2) / 2 + ny * bow;
    return `M${(x1 + j()).toFixed(1)} ${(y1 + j()).toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${(x2 + j()).toFixed(1)} ${(y2 + j()).toFixed(1)}`;
  };
  const mfxEllipse = (cx, cy, rx, ry, rough, rnd) => {
    const a0 = -Math.PI * (0.55 + rnd() * 0.3);
    const over = 0.25 + rough * 0.45;
    const n = 64, total = Math.PI * 2 + over;
    const drift = (rnd() - 0.5) * 0.12 * rough;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = a0 + total * t;
      const k = 1 + drift * t + (rnd() - 0.5) * 0.025 * rough;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rx * k).toFixed(1) + ' ' + (cy + Math.sin(a) * ry * k).toFixed(1);
    }
    return d;
  };
  const mfxJagged = (rough, rnd) => {
    const pts = [], n = 6;
    const j = () => (rnd() * rough * 14).toFixed(1);
    for (let i = 0; i <= n; i++) pts.push(`${(i / n * 100).toFixed(1)}% ${j()}%`);
    for (let i = n; i >= 0; i--) pts.push(`${(i / n * 100).toFixed(1)}% ${(100 - j()).toFixed(1)}%`);
    return `polygon(${pts.join(',')})`;
  };

  /* 文字每一行的矩形（座標相對於 origin 的左上角）。只看文字節點，不含效果圖層本身 */
  function mfxLines(el, origin) {
    const rects = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => n.parentNode.closest('.udr-mfx-layer') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    let node;
    while ((node = walker.nextNode())) {
      const rg = document.createRange();
      rg.selectNodeContents(node);
      Array.from(rg.getClientRects()).forEach((r) => { if (r.width > 0.5 && r.height > 0.5) rects.push(r); });
    }
    const merged = [];
    rects.forEach((r) => {
      const m = merged.find((q) => Math.abs(q.top - r.top) < r.height * 0.5);
      if (m) {
        m.left = Math.min(m.left, r.left); m.right = Math.max(m.right, r.right);
        m.top = Math.min(m.top, r.top);    m.bottom = Math.max(m.bottom, r.bottom);
      } else {
        merged.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
      }
    });
    return merged.map((m) => ({ x: m.left - origin.left, y: m.top - origin.top, w: m.right - m.left, h: m.bottom - m.top }));
  }

  /* 線條類效果的 SVG 路徑（highlight 不用路徑） */
  function mfxPaths(kind, lines, o) {
    const { pad, thick, rough, rnd } = o;
    const ds = [];
    const u = lines.reduce((a, r) => ({
      x1: Math.min(a.x1, r.x), y1: Math.min(a.y1, r.y), x2: Math.max(a.x2, r.x + r.w), y2: Math.max(a.y2, r.y + r.h),
    }), { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity });
    let x1, y1, x2, y2;
    if (kind === 'underline') {
      lines.forEach((r) => { const y = r.y + r.h * 0.92 + pad * 0.5; ds.push(mfxLine(r.x - pad * 0.5, y, r.x + r.w + pad * 0.5, y, rough, rnd)); });
    } else if (kind === 'strike') {
      lines.forEach((r) => { const y = r.y + r.h * 0.55; ds.push(mfxLine(r.x - pad * 0.5, y, r.x + r.w + pad * 0.5, y, rough, rnd)); });
    } else if (kind === 'circle') {
      ds.push(mfxEllipse((u.x1 + u.x2) / 2, (u.y1 + u.y2) / 2, (u.x2 - u.x1) / 2 + pad * 2.5, (u.y2 - u.y1) / 2 + pad * 1.5, rough, rnd));
    } else if (kind === 'double') {
      lines.forEach((r) => {
        const y = r.y + r.h * 0.9 + pad * 0.5, a = r.x - pad * 0.5, b = r.x + r.w + pad * 0.5;
        ds.push(mfxLine(a, y, b, y, rough, rnd), mfxLine(a, y + thick * 2.4, b, y + thick * 2.4, rough, rnd));
      });
    } else if (kind === 'wavy') {
      const A = Math.max(1.5, thick * 0.8);
      lines.forEach((r) => {
        const y = r.y + r.h * 0.92 + pad * 0.5, n = Math.max(2, Math.ceil((r.w + pad) / 6));
        ds.push(`M${(r.x - pad * 0.5).toFixed(1)} ${y.toFixed(1)} q3 ${-A} 6 0` + ' t6 0'.repeat(n - 1));
      });
    } else if (kind === 'cross') {
      x1 = u.x1 - pad; y1 = u.y1 - pad * 0.5; x2 = u.x2 + pad; y2 = u.y2 + pad * 0.5;
      ds.push(mfxLine(x1, y1, x2, y2, rough, rnd), mfxLine(x1, y2, x2, y1, rough, rnd));
    } else if (kind === 'arrow') {
      /* 箭頭從 direction 那一側指向文字：left（預設）、right、top、bottom */
      const L = o.arrowLen, hd = Math.max(8, thick * 3.2);
      const cx = (u.x1 + u.x2) / 2, cy = (u.y1 + u.y2) / 2, gap = pad + 6;
      const V = { left: [1, 0], right: [-1, 0], top: [0, 1], bottom: [0, -1] }[o.direction] || [1, 0];
      const ex = V[0] === 1 ? u.x1 - gap : V[0] === -1 ? u.x2 + gap : cx;
      const ey = V[1] === 1 ? u.y1 - gap : V[1] === -1 ? u.y2 + gap : cy;
      const sx = ex - V[0] * L, sy = ey - V[1] * L, px = -V[1], py = V[0];
      ds.push(mfxLine(sx, sy, ex, ey, rough * 0.6, rnd),
        `M${(ex - V[0] * hd + px * hd * 0.55).toFixed(1)} ${(ey - V[1] * hd + py * hd * 0.55).toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)} L${(ex - V[0] * hd - px * hd * 0.55).toFixed(1)} ${(ey - V[1] * hd - py * hd * 0.55).toFixed(1)}`);
    } else if (kind === 'box') {
      x1 = u.x1 - pad; y1 = u.y1 - pad * 0.5; x2 = u.x2 + pad; y2 = u.y2 + pad * 0.5;
      ds.push(mfxLine(x1, y1, x2, y1, rough, rnd), mfxLine(x2, y1, x2, y2, rough, rnd), mfxLine(x2, y2, x1, y2, rough, rnd), mfxLine(x1, y2, x1, y1, rough, rnd));
    } else if (kind === 'bracket') {
      const bw = Math.min(12, (u.y2 - u.y1) * 0.25);
      x1 = u.x1 - pad; x2 = u.x2 + pad; y1 = u.y1 - pad * 0.5; y2 = u.y2 + pad * 0.5;
      ds.push(mfxLine(x1 + bw, y1, x1, y1, rough, rnd) + mfxLine(x1, y1, x1, y2, rough, rnd).replace(/^M/, 'L') + mfxLine(x1, y2, x1 + bw, y2, rough, rnd).replace(/^M/, 'L'));
      ds.push(mfxLine(x2 - bw, y1, x2, y1, rough, rnd) + mfxLine(x2, y1, x2, y2, rough, rnd).replace(/^M/, 'L') + mfxLine(x2, y2, x2 - bw, y2, rough, rnd).replace(/^M/, 'L'));
    }
    return ds;
  }

  function mfxPlay(node, frames, ms) {
    if (!node.animate) return Promise.resolve();
    const a = node.animate(frames, { duration: Math.max(1, ms), easing: 'ease-in-out', fill: 'forwards' });
    return a.finished.then(() => a, () => a);
  }

  /* 最近的非行內祖先，版面寬度改變時才需要重畫 */
  function mfxHost(el) {
    let p = el.parentElement;
    while (p && p !== document.body && getComputedStyle(p).display.indexOf('inline') === 0) p = p.parentElement;
    return p || document.body;
  }

  function injectMfxCSS() {
    if (document.getElementById('ui-drill-mfx-style')) return;
    const s = document.createElement('style');
    s.id = 'ui-drill-mfx-style';
    s.textContent = [
      'ui-drill mark-fx{display:inline;position:relative;z-index:0;background:transparent;color:inherit}',
      '.udr-mfx-layer{position:absolute;left:0;top:0;width:0;height:0;overflow:visible;pointer-events:none}',
      '.udr-mfx-under{z-index:-1}',
      '.udr-mfx-over{z-index:1}',
      '.udr-mfx-hl{position:absolute;transform-origin:left center}',
      '.udr-mfx-layer svg{position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible}',
    ].join('\n');
    document.head.appendChild(s);
  }

  function bootMark(el) {
    /* _uitm 與 ui-table.js 共用：已被任一元件啟動的標記不重複處理 */
    if (el._uitm) return;
    el._uitm = true;

    let kind = String(el.getAttribute('kind') || 'highlight').trim().toLowerCase();
    if (MFX_KINDS.indexOf(kind) < 0) {
      console.warn(`[ui-drill] mark-fx kind="${kind}" 不是有效的值（${MFX_KINDS.join(' / ')}），已改用 highlight。`);
      kind = 'highlight';
    }
    const colRaw = el.getAttribute('color');
    let col = colRaw ? brandOf(colRaw) : null;
    if (colRaw && col === colRaw && !/^#|^rgb/i.test(colRaw.trim())) {
      console.warn(`[ui-drill] mark-fx color="${colRaw}" 不是有效的色彩，已改用 yellow。`);
      col = null;
    }
    col = col || '#E3D322';

    const thick = mfxNum(el.getAttribute('thickness'), 3);
    const rough = Math.min(1, Math.max(0, mfxNum(el.getAttribute('rough'), 0.5)));
    const pad = mfxNum(el.getAttribute('padding'), 4);
    const speed = mfxNum(el.getAttribute('speed'), 600);
    const lineStyle = String(el.getAttribute('line-style') || 'solid').trim().toLowerCase();
    const animate = el.getAttribute('animate') !== 'false';
    const seedAttr = el.getAttribute('seed');
    const seed = seedAttr != null && seedAttr !== ''
      ? (/^\d+$/.test(seedAttr) ? parseInt(seedAttr, 10) : mfxHash(seedAttr))
      : mfxHash(kind + '|' + el.textContent);
    const opts = {
      pad, thick, rough,
      direction: String(el.getAttribute('direction') || 'left').trim().toLowerCase(),
      arrowLen: mfxNum(el.getAttribute('arrow-length'), 48),
    };

    injectMfxCSS();
    Array.from(el.children).forEach((c) => { if (c.classList.contains('udr-mfx-layer')) el.removeChild(c); });
    const layer = document.createElement('span');
    layer.className = 'udr-mfx-layer ' + (kind === 'highlight' ? 'udr-mfx-under' : 'udr-mfx-over');
    layer.setAttribute('aria-hidden', 'true');
    el.appendChild(layer);
    if (kind === 'highlight') {
      const tc = el.getAttribute('text-color');
      el.style.color = (tc && brandOf(tc)) || '#0C0D0C';
    }

    let tok = 0;
    let started = false;

    function render(anim) {
      const my = ++tok;
      while (layer.firstChild) layer.removeChild(layer.firstChild);
      const lines = mfxLines(el, layer.getBoundingClientRect());
      if (!lines.length) return false;
      const rnd = mfxRng(seed);
      let seq = Promise.resolve();

      if (kind === 'highlight') {
        const nodes = lines.map((r) => {
          const d = document.createElement('div');
          d.className = 'udr-mfx-hl';
          const ey = r.h * 0.08;
          d.style.left = (r.x - pad) + 'px';
          d.style.top = (r.y - ey) + 'px';
          d.style.width = (r.w + pad * 2) + 'px';
          d.style.height = (r.h + ey * 2) + 'px';
          d.style.background = col;
          d.style.clipPath = rough > 0 ? mfxJagged(rough, rnd) : 'none';
          d.style.borderRadius = rough > 0 ? '0' : '3px';
          if (anim) d.style.transform = 'scaleX(0)';
          layer.appendChild(d);
          return d;
        });
        if (anim) {
          const total = nodes.reduce((s, n) => s + n.offsetWidth, 0) || 1;
          nodes.forEach((n) => {
            seq = seq.then(() => {
              if (my !== tok) return;
              return mfxPlay(n, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], speed * n.offsetWidth / total)
                .then((a) => { if (my === tok) { n.style.transform = ''; if (a && a.cancel) a.cancel(); } });
            });
          });
        }
        return true;
      }

      const ds = mfxPaths(kind, lines, Object.assign({ rnd }, opts));
      const svg = document.createElementNS(MFX_NS, 'svg');
      layer.appendChild(svg);
      const dash = lineStyle === 'dashed' ? '10 7' : lineStyle === 'dotted' ? '0.1 ' + (thick * 2.6).toFixed(1) : 'none';
      const paths = ds.map((d) => {
        const p = document.createElementNS(MFX_NS, 'path');
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', col);
        p.setAttribute('stroke-width', thick);
        p.setAttribute('stroke-linecap', 'round');
        p.setAttribute('stroke-linejoin', 'round');
        p.setAttribute('d', d);
        svg.appendChild(p);
        return p;
      });
      if (!anim) { paths.forEach((p) => { p.style.strokeDasharray = dash; }); return true; }
      const lens = paths.map((p) => p.getTotalLength());
      const total = lens.reduce((a, b) => a + b, 0) || 1;
      paths.forEach((p, i) => { p.style.strokeDasharray = lens[i]; p.style.strokeDashoffset = lens[i]; });
      paths.forEach((p, i) => {
        seq = seq.then(() => {
          if (my !== tok) return;
          return mfxPlay(p, [{ strokeDashoffset: lens[i] }, { strokeDashoffset: 0 }], speed * lens[i] / total)
            .then((a) => {
              if (my !== tok) return;
              p.style.strokeDasharray = dash;
              p.style.strokeDashoffset = '0';
              if (a && a.cancel) a.cancel();
            });
        });
      });
      return true;
    }

    /* 版面寬度變動（換行位置改變）時重畫，不再播放動畫 */
    function watch() {
      const host = mfxHost(el);
      const last = host.getBoundingClientRect();
      let lw = last.width, lh = last.height, raf = 0;
      const relayout = () => {
        if (!el.isConnected) return;
        const r = host.getBoundingClientRect();
        if (Math.abs(r.width - lw) < 0.5 && Math.abs(r.height - lh) < 0.5) return;
        lw = r.width; lh = r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => render(false));
      };
      if (window.ResizeObserver) new ResizeObserver(relayout).observe(host);
      else window.addEventListener('resize', relayout);
    }

    function start() {
      if (started || !el.isConnected) return false;
      if (render(animate)) { started = true; watch(); return true; }
      return false;
    }

    /* 文字進入畫面才開始畫，所以 progress-show 尚未揭示的步驟不會在看不到時就畫完 */
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver((entries) => {
        if (!el.isConnected) { io.disconnect(); return; }
        if (entries.some((e) => e.isIntersecting) && start()) io.disconnect();
      }, { threshold: 0.01 });
      io.observe(el);
    } else {
      requestAnimationFrame(start);
    }

    el._uitmReplay = () => { if (started) render(true); else start(); };
  }

  function initMarks(root) {
    (root || document).querySelectorAll('ui-drill mark-fx').forEach(bootMark);
  }
  const scan = (n) => {
    if (n.nodeType !== 1) return;
    if (n.localName === 'mark-fx' && n.closest('ui-drill')) bootMark(n);
    else if (n.querySelectorAll) n.querySelectorAll('mark-fx').forEach((m) => { if (m.closest('ui-drill')) bootMark(m); });
  };
  const start = () => {
    initMarks();
    new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(scan))).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
