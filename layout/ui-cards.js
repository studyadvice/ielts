(() => {
  'use strict';
  if (customElements.get('ui-cards')) return;

  const PALETTE = {
    base: '#0C0D0C', shell: '#C6C7BD',
    vanilla: '#DBEDD8', yellow: '#E3D322',
    indigo: '#778CE1',
    pink: '#FF91D7',
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
    dreamy: '#DE8EC9',
    'bg-alternative': '#3B2A20'
  };
  /* 新色票都偏亮，實心底一律用深色字 */
  const LIGHT_TEXT = new Set(['bg-alternative']);

  const SIZE_KEYS = ['label', 'note', 'tag', 'body', 'footer', 'badge'];

  const color = v => {
    if (!v) return '';
    const t = v.trim(), k = t.toLowerCase();
    return PALETTE[t] || PALETTE[k] || (k === 'base' ? '#0C0D0C' : t);
  };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const fs = v => {
    if (v == null) return '';
    const t = String(v).trim();
    if (!t) return '';
    return /^\d*\.?\d+$/.test(t) ? t + 'rem' : t;
  };
  const applySizes = (node, get) => {
    SIZE_KEYS.forEach(k => {
      const v = fs(get(k + '-size'));
      if (v) node.style.setProperty('--uic-fs-' + k, v);
    });
  };
  const textOn = v => {
    const k = (v || '').trim().toLowerCase();
    if (PALETTE[k]) return LIGHT_TEXT.has(k) ? PALETTE.vanilla : PALETTE.base;
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(k);
    if (!m) return PALETTE.base;
    let h = m[1];
    if (h.length === 3) h = [...h].map(x => x + x).join('');
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16) / 255);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 0.5 ? PALETTE.vanilla : PALETTE.base;
  };
  const applyBadgeColor = (node, v) => {
    if (!v) return;
    node.style.setProperty('--uic-badge-bg', color(v));
    node.style.setProperty('--uic-badge-fg', textOn(v));
  };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const iconEl = name => el('i', 'bi ' + (name.startsWith('bi-') ? name : 'bi-' + name));
  /* 角標：卡片與內容區共用 */
  const badgeEl = (text, icon) => {
    if (!text && !icon) return null;
    const bd = el('span', 'uic-badge');
    if (icon) bd.append(iconEl(icon.trim()));
    if (text) bd.append(el('span', null, text));
    else bd.classList.add('uic-badge-only');
    return bd;
  };
  /* border-width、hover-width 為 px 數字；hover-color 為品牌色名稱或色碼 */
  const applyBorder = (node, get) => {
    const bw = get('border-width'), hw = get('hover-width'), hc = get('hover-color');
    if (bw != null && bw !== '') node.style.setProperty('--uic-bw', num(bw, 1) + 'px');
    if (hw != null && hw !== '') node.style.setProperty('--uic-hw', num(hw, 0) + 'px');
    if (hc) node.style.setProperty('--uic-hc', color(hc));
  };
  const lineStyle = st => (st === 'none' ? 'none' : (['solid', 'dashed', 'dotted'].includes(st) ? st : 'solid'));
  const alertEl = id => el('div', 'alert alert-danger uic-alert', `找不到 id 為「${id}」的內容。`);
  /* 內容區主題關鍵字 → [組別, 值]；預設值（outline、plain、head-line、normal）等於不設定 */
  const THEME_TOKENS = {
    outline: ['frame', ''], 'top-bar': ['frame', 'top-bar'], double: ['frame', 'double'], corner: ['frame', 'corner'],
    plain: ['bg', ''], tint: ['bg', 'tint'], hatch: ['bg', 'hatch'], gold: ['bg', 'gold'],
    'head-line': ['head', ''], 'head-filled': ['head', 'filled'], 'head-tab': ['head', 'tab'], 'head-chip': ['head', 'chip'], 'head-under': ['head', 'under'],
    normal: ['size', ''], compact: ['size', 'compact'],
    electric: ['fx', 'electric'], pulse: ['fx', 'pulse'], 'no-fx': ['fx', '']
  };

  const cloneOf = id => {
    const src = id ? document.getElementById(id) : null;
    if (!src) return null;
    if (src.localName === 'template') return src.content.cloneNode(true);
    const node = src.cloneNode(true);
    node.removeAttribute('id');
    node.hidden = false;
    if (node.style.display === 'none') node.style.removeProperty('display');
    return node;
  };

  /* ---------- 樣式 ---------- */
  const variantCSS = Object.entries(PALETTE)
    .filter(([k]) => k !== 'base')
    .map(([k, v]) => `ui-cards .uic-btn.uic-v-${k}{background:${v};color:${LIGHT_TEXT.has(k) ? PALETTE.vanilla : PALETTE.base};}`)
    .join('\n');

  /* 實心外觀：底色取 --uic-fill，文字色取 --uic-on；卡片樣式與選中樣式共用同一組規則 */
  const filledCSS = sel => `
${sel}{background:var(--uic-fill);border-color:var(--uic-fill);color:var(--uic-on);}
${sel} .uic-label,
${sel} .uic-note,
${sel} .uic-foot{color:var(--uic-on);}
${sel} .uic-media{color:var(--uic-icon, var(--uic-on));}
${sel} .uic-tag{border-color:var(--uic-on);color:var(--uic-on);}
${sel} .uic-foot{border-top-color:var(--uic-on);}`;
  const SEL_FILLED = 'ui-cards card-item[data-style="filled"]';
  const SEL_ACTIVE_FILLED = 'ui-cards[active-style="filled"] card-item[data-active]';

  const CSS = `
ui-cards{display:block;color:${PALETTE.shell};font-size:1rem;}
ui-cards:not([data-ready]){visibility:hidden;}
ui-cards .uic-title{font-size:var(--uic-fs-title, 1.2rem);font-weight:700;color:var(--uic-title-c, ${PALETTE.violet});margin:0 0 16px 0;}
ui-cards .uic-wrap{display:grid;gap:var(--uic-gap);align-items:start;box-sizing:border-box;}
ui-cards .uic-wrap.uic-side{grid-template-columns:var(--uic-pcols);}
ui-cards .uic-wrap.uic-side.uic-nopanel{grid-template-columns:minmax(0,1fr);}
ui-cards .uic-nopanel .uic-panel{display:none;}
ui-cards[bordered] .uic-wrap{border:1px solid ${PALETTE.shell};border-radius:8px;padding:16px;}

ui-cards .uic-grid{display:grid;grid-template-columns:repeat(var(--uic-cols),minmax(0,1fr));gap:var(--uic-gap);min-width:0;}

ui-cards card-item{position:relative;display:flex;flex-direction:column;min-height:var(--uic-minh);border:var(--uic-bw, 1px) solid var(--uic-c);border-radius:var(--uic-radius);background:${PALETTE.base};color:${PALETTE.shell};box-sizing:border-box;overflow:hidden;text-align:var(--uic-align);}
ui-cards[media-position="left"] card-item[data-media]{display:grid;grid-template-columns:var(--uic-mw) minmax(0,1fr);grid-template-rows:1fr auto;}
ui-cards[media-position="left"] card-item[data-media] .uic-media{grid-row:1 / -1;}
ui-cards[media-position="left"] card-item[data-media] .uic-main,
ui-cards[media-position="left"] card-item[data-media] .uic-foot{grid-column:2;}

ui-cards .uic-media{display:flex;align-items:center;justify-content:var(--uic-jc);color:var(--uic-icon, var(--uic-c));font-size:var(--uic-isize);line-height:1;padding:var(--uic-pad) var(--uic-pad) 0 var(--uic-pad);}
ui-cards[media-position="left"] .uic-media{padding:var(--uic-pad) 0 var(--uic-pad) var(--uic-pad);justify-content:center;}
ui-cards .uic-media.uic-img{padding:0;height:var(--uic-mh);}
ui-cards[media-position="left"] .uic-media.uic-img{height:auto;min-height:100%;}
ui-cards .uic-media img{width:100%;height:100%;object-fit:cover;display:block;}

/* 標題列：media-position="inline" 時圖示與標題同一行；meta 是右側小字；有標題列時角標也排在列內 */
ui-cards .uic-chead{display:flex;align-items:center;gap:10px;min-width:0;}
ui-cards .uic-chead .uic-label{flex:1 1 auto;min-width:0;}
ui-cards .uic-hicon{flex:none;display:inline-flex;align-items:center;justify-content:center;width:2.1em;height:2.1em;border:1px solid #2C2D2B;border-radius:8px;color:var(--uic-icon, var(--uic-c));font-size:var(--uic-fs-label, 1.1rem);line-height:1;overflow:hidden;}
ui-cards .uic-hicon img{width:100%;height:100%;object-fit:cover;display:block;}
ui-cards .uic-meta{flex:none;color:${PALETTE.gray};font-size:0.85rem;white-space:nowrap;}
ui-cards .uic-chead .uic-badge{position:static;flex:none;}
ui-cards .uic-main{flex:1 1 auto;padding:var(--uic-pad);display:flex;flex-direction:column;gap:6px;min-width:0;}
ui-cards .uic-label{font-size:var(--uic-fs-label, 1.1rem);font-weight:700;line-height:1.4;color:var(--uic-c);}
ui-cards .uic-note{font-size:var(--uic-fs-note, 0.85rem);line-height:1.5;color:${PALETTE.indigo};}
ui-cards .uic-tags{display:flex;flex-wrap:wrap;gap:6px;justify-content:var(--uic-jc);}
ui-cards .uic-tag{font-size:var(--uic-fs-tag, 0.75rem);line-height:1.5;border:1px solid ${PALETTE.blue};color:${PALETTE.blue};border-radius:999px;padding:1px 8px;}
ui-cards .uic-body{font-size:var(--uic-fs-body, 0.95rem);line-height:1.7;}
ui-cards .uic-body > :first-child{margin-top:0;}
ui-cards .uic-body > :last-child{margin-bottom:0;}
ui-cards .uic-foot{border-top:var(--uic-div);padding:10px var(--uic-pad);font-size:var(--uic-fs-footer, 0.85rem);color:${PALETTE.indigo};}
ui-cards .uic-badge{position:absolute;top:8px;right:8px;z-index:1;display:inline-flex;align-items:center;gap:4px;background:var(--uic-badge-bg, ${PALETTE.red});color:var(--uic-badge-fg, ${PALETTE.vanilla});font-size:var(--uic-fs-badge, 0.75rem);font-weight:700;line-height:1.5;border-radius:999px;padding:1px 8px;}
ui-cards .uic-badge .bi{line-height:1;}
ui-cards .uic-badge.uic-badge-only{justify-content:center;width:2em;height:2em;padding:0;}

ui-cards card-item[data-click]{cursor:pointer;}
ui-cards card-item[data-click]:hover,
ui-cards[hover-all] card-item:not([disabled]):hover{border-color:var(--uic-hc, ${PALETTE.vanilla});outline:var(--uic-hw, 0px) solid var(--uic-hc, ${PALETTE.vanilla});outline-offset:calc(var(--uic-hw, 0px) * -1);}
ui-cards card-item[data-active]{border-color:var(--uic-accent);box-shadow:0 0 0 2px var(--uic-accent);}
ui-cards card-item[disabled]{border-style:dashed;cursor:not-allowed;filter:grayscale(1);}

/* 翻面：背面平時隱藏；翻面後只留背面、角標與倒數條 */
ui-cards card-item[data-flip]{cursor:pointer;}
ui-cards card-item[data-flip]:focus-visible{outline:2px solid ${PALETTE.vanilla};outline-offset:2px;}
ui-cards card-item > .uic-back{display:none;padding:var(--uic-pad);grid-column:1 / -1;grid-row:1 / -1;}
ui-cards card-item[data-flipped] > :not(.uic-back):not(.uic-badge):not(.uic-flipbar){display:none;}
ui-cards card-item[data-flipped] > .uic-back{display:block;}
ui-cards card-item[data-flip-anim="fade"][data-flipped] > .uic-back,
ui-cards card-item[data-flip-anim="fade"].uic-unflip > *{animation:uic-fade .35s ease;}
ui-cards card-item[data-flip-anim="slide"][data-flipped] > .uic-back,
ui-cards card-item[data-flip-anim="slide"].uic-unflip > *{animation:uic-slide .35s ease;}
ui-cards .uic-flip-hint{font-size:0.75rem;color:${PALETTE.indigo};margin:10px 0 0 0;}
ui-cards .uic-flipbar{position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--uic-flipbar, var(--uic-c));transform-origin:left center;animation:uic-count linear forwards;}
@keyframes uic-fade{from{opacity:0}to{opacity:1}}
@keyframes uic-slide{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
@keyframes uic-count{from{transform:scaleX(1)}to{transform:scaleX(0)}}

${SEL_FILLED}{--uic-fill:var(--uic-c);--uic-on:var(--uic-c-on, ${PALETTE.base});}
${SEL_ACTIVE_FILLED}{--uic-fill:var(--uic-accent);--uic-on:var(--uic-accent-on, ${PALETTE.base});}
${filledCSS(SEL_FILLED)}
${filledCSS(SEL_ACTIVE_FILLED)}
ui-cards card-item[data-style="plain"]{border-color:transparent;background:transparent;}

ui-cards .uic-panel{position:relative;min-width:0;border:1px solid ${PALETTE.shell};border-radius:8px;padding:16px;box-sizing:border-box;}
ui-cards .uic-panel.uic-has-badge .uic-head{padding-right:var(--uic-pbadge-w, 96px);}
ui-cards .uic-panel.uic-has-badge .uic-head:empty + .uic-pbody{padding-right:var(--uic-pbadge-w, 96px);}
ui-cards .uic-side .uic-panel{position:sticky;top:16px;}
ui-cards .uic-head{font-size:var(--uic-fs-head, 1.1rem);font-weight:700;color:var(--uic-head-c, ${PALETTE.violet});margin:0 0 12px 0;padding:0 0 8px 0;border-bottom:1px solid var(--uic-head-line, var(--uic-head-c, ${PALETTE.violet}));}
ui-cards[panel-title-line="none"] .uic-head{border-bottom:none;padding-bottom:0;}
ui-cards .uic-head:empty{display:none;}
ui-cards .uic-pbody{line-height:1.7;}
ui-cards .uic-pbody > :first-child{margin-top:0;}
ui-cards .uic-pbody > :last-child{margin-bottom:0;}
ui-cards .uic-ph{color:${PALETTE.indigo};font-size:0.95rem;text-align:center;border:1px dashed ${PALETTE.indigo};border-radius:8px;padding:24px 16px;}
/* ══ 內容區主題 theme：外框 frame、底色 bg、標題 head、密度 size、特效 fx，各組各取一個 ══ */
ui-cards .uic-panel{--uic-pac:var(--uic-head-c, ${PALETTE.violet});--uic-pac-on:#0C0D0C;--uic-pad-y:16px;--uic-pad-x:16px;}
ui-cards .uic-panel .uic-head{color:var(--uic-pac);border-bottom-color:var(--uic-head-line, var(--uic-pac));}
ui-cards .uic-panel > .uic-head,ui-cards .uic-panel > .uic-pbody{position:relative;z-index:1;}
ui-cards .uic-panel > .uic-badge{z-index:3;}
/* 外框 */
ui-cards .uic-panel[data-frame="top-bar"]{border:1px solid #3A3B38;border-top:4px solid var(--uic-pac);border-radius:4px 4px 8px 8px;}
ui-cards .uic-panel[data-frame="double"]{border:3px double var(--uic-pac);}
ui-cards .uic-panel[data-frame="corner"]{border-color:transparent;border-radius:0;--uic-pad-y:20px;--uic-pad-x:20px;padding:20px;}
ui-cards .uic-panel[data-frame="corner"]::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;background:
  linear-gradient(var(--uic-pac),var(--uic-pac)) top left/40px 3px no-repeat,linear-gradient(var(--uic-pac),var(--uic-pac)) top left/3px 40px no-repeat,
  linear-gradient(var(--uic-pac),var(--uic-pac)) top right/40px 3px no-repeat,linear-gradient(var(--uic-pac),var(--uic-pac)) top right/3px 40px no-repeat,
  linear-gradient(var(--uic-pac),var(--uic-pac)) bottom left/40px 3px no-repeat,linear-gradient(var(--uic-pac),var(--uic-pac)) bottom left/3px 40px no-repeat,
  linear-gradient(var(--uic-pac),var(--uic-pac)) bottom right/40px 3px no-repeat,linear-gradient(var(--uic-pac),var(--uic-pac)) bottom right/3px 40px no-repeat;}
/* 底色（不透明，強調色與底色混合） */
ui-cards .uic-panel[data-bg="tint"]{background:color-mix(in srgb,var(--uic-pac) 13%,#0C0D0C);}
ui-cards .uic-panel[data-bg="hatch"]{background:repeating-linear-gradient(135deg,#0C0D0C 0 10px,color-mix(in srgb,var(--uic-pac) 9%,#0C0D0C) 10px 20px);}
/* 金箔：與 info-region 的 ir-gold 相同，會蓋掉外框與顏色 */
ui-cards .uic-panel[data-bg="gold"]{--uic-pac:#C9973F;--uic-pac-on:#0C0D0C;background:linear-gradient(150deg,#1A1200 0%,#2E2000 40%,#1F1700 70%,#1A1200 100%);border:1px solid rgba(185,140,55,0.82);border-left:4px solid #C9973F;border-radius:6px;color:#EFD9A2;}
ui-cards .uic-panel[data-bg="gold"]::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;background:linear-gradient(102deg,#000000 25%,#2B2008 50%,#000000 75%);background-size:200% 100%;mix-blend-mode:screen;animation:uic-gold-shimmer 4s ease-in-out infinite;}
@keyframes uic-gold-shimmer{0%{background-position:-60% center}100%{background-position:160% center}}
ui-cards .uic-panel[data-bg="gold"] .uic-head{color:#E3C27A;border-bottom-color:#C9973F;}
ui-cards .uic-panel[data-bg="gold"] .uic-ph{color:#E3C27A;border-color:#C9973F;}
/* 標題 */
ui-cards .uic-panel[data-head="filled"] .uic-head{background:var(--uic-pac);color:var(--uic-pac-on);border-bottom:0;margin:calc(var(--uic-pad-y) * -1) calc(var(--uic-pad-x) * -1) 14px;padding:10px var(--uic-pad-x);border-radius:7px 7px 0 0;}
ui-cards .uic-panel[data-frame="corner"][data-head="filled"] .uic-head{border-radius:0;}
ui-cards .uic-panel[data-bg="gold"][data-head="filled"] .uic-head{color:#0C0D0C;border-radius:0 5px 0 0;}
ui-cards .uic-panel[data-head="tab"]:has(> .uic-head:not(:empty)){margin-top:18px;}
ui-cards .uic-panel[data-head="tab"] .uic-head{position:absolute;left:12px;top:-15px;margin:0;padding:3px 12px;font-size:0.95rem;line-height:1.4;border:0;border-radius:6px 6px 0 0;background:var(--uic-pac);color:var(--uic-pac-on);}
ui-cards .uic-panel[data-head="tab"] .uic-pbody{padding-top:10px;}
ui-cards .uic-panel[data-head="tab"][style*="max-height"] .uic-head{position:static;display:inline-block;margin:0 0 12px;}
ui-cards .uic-panel[data-head="tab"][style*="max-height"]{margin-top:0;}
ui-cards .uic-panel[data-head="chip"] .uic-head{display:inline-block;border:1.5px solid var(--uic-pac);border-radius:999px;padding:1px 14px;font-size:0.95rem;}
ui-cards .uic-panel[data-head="under"] .uic-head{display:inline-block;border-bottom:3px solid var(--uic-pac);padding:0 0 4px;}
ui-cards .uic-panel[data-head="chip"]:not(.uic-has-badge) .uic-head:empty + .uic-pbody,ui-cards .uic-panel[data-head="under"] .uic-head:empty + .uic-pbody{padding-right:0;}
/* 密度 */
ui-cards .uic-panel[data-size="compact"]{--uic-pad-y:10px;--uic-pad-x:12px;padding:10px 12px;font-size:0.92rem;}
ui-cards .uic-panel[data-size="compact"] .uic-pbody{line-height:1.55;}
ui-cards .uic-panel[data-size="compact"] .uic-head{font-size:1rem;margin-bottom:8px;padding-bottom:6px;}
ui-cards .uic-panel[data-size="compact"][data-head="filled"] .uic-head{padding:7px 12px;margin-bottom:10px;}
ui-cards .uic-panel[data-size="compact"][data-head="chip"] .uic-head,ui-cards .uic-panel[data-size="compact"][data-head="tab"] .uic-head{padding:1px 12px;}
ui-cards .uic-panel[data-size="compact"][data-frame="corner"]{--uic-pad-y:14px;--uic-pad-x:14px;padding:14px;}
/* 特效：electric 電流（與 info-region 相同）、pulse 外圈呼吸光 */
@property --uic-fx-angle{syntax:'<angle>';inherits:false;initial-value:0deg;}
@keyframes uic-fx-spin{to{--uic-fx-angle:360deg;}}
@keyframes uic-fx-glow{0%,100%{box-shadow:0 0 10px var(--uic-fx-dim)}7%{box-shadow:0 0 22px var(--uic-fx-edge)}9%{box-shadow:0 0 6px var(--uic-fx-dim)}12%{box-shadow:0 0 28px var(--uic-fx-core)}16%{box-shadow:0 0 12px var(--uic-fx-edge)}55%{box-shadow:0 0 10px var(--uic-fx-dim)}58%{box-shadow:0 0 20px var(--uic-fx-edge)}60%{box-shadow:0 0 8px var(--uic-fx-dim)}}
@keyframes uic-fx-bolt{0%,100%{background:var(--uic-fx-core)}7%{background:var(--uic-fx-dim)}9%{background:var(--uic-fx-core)}12%{background:var(--uic-fx-edge)}15%{background:var(--uic-fx-core)}56%{background:var(--uic-fx-core)}58%{background:var(--uic-fx-dim)}61%{background:var(--uic-fx-core)}}
ui-cards .uic-panel[data-fx="electric"]{--uic-fx-edge:var(--uic-pac);--uic-fx-dim:color-mix(in srgb,var(--uic-pac) 45%,#000000);--uic-fx-core:#DBEDD8;animation:uic-fx-glow 3.6s linear infinite;}
ui-cards .uic-panel[data-fx="electric"][data-bg="gold"]{--uic-fx-dim:#6B4F12;}
ui-cards .uic-panel[data-fx="electric"]::after{content:'';position:absolute;inset:0;padding:2px;border-radius:inherit;pointer-events:none;z-index:2;background:conic-gradient(from var(--uic-fx-angle,0deg),var(--uic-fx-dim) 0deg,var(--uic-fx-dim) 190deg,var(--uic-fx-edge) 270deg,var(--uic-fx-core) 335deg,var(--uic-fx-dim) 360deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;animation:uic-fx-spin 2.6s linear infinite;}
ui-cards .uic-fx-bolt{position:absolute;top:10px;right:12px;width:11px;height:18px;z-index:3;pointer-events:none;background:var(--uic-fx-core);clip-path:polygon(62% 0,8% 56%,44% 56%,30% 100%,92% 38%,56% 38%);animation:uic-fx-bolt 3.6s linear infinite;}
ui-cards .uic-panel.uic-has-badge .uic-fx-bolt,ui-cards .uic-panel[data-head="filled"] .uic-fx-bolt{top:auto;bottom:10px;}
ui-cards .uic-panel[data-fx="electric"]:not(.uic-has-badge):not([data-head="filled"]) .uic-head{padding-right:28px;}
ui-cards .uic-panel[data-fx="electric"][data-head="chip"]:not(.uic-has-badge) .uic-head,ui-cards .uic-panel[data-fx="electric"][data-head="tab"] .uic-head{padding-right:14px;}
@keyframes uic-fx-pulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--uic-pac) 70%,#0C0D0C)}50%{box-shadow:0 0 0 6px color-mix(in srgb,var(--uic-pac) 25%,#0C0D0C)}}
ui-cards .uic-panel[data-fx="pulse"]{animation:uic-fx-pulse 2.4s ease-in-out infinite;}
ui-cards .uic-alert{background:${PALETTE.base};border:1px solid ${PALETTE.red};color:${PALETTE.red};border-radius:6px;padding:12px 16px;margin:0;font-size:0.95rem;}

ui-cards .uic-btn{display:inline-flex;align-items:center;gap:6px;border:2px solid transparent;border-radius:6px;padding:6px 14px;margin:4px 8px 4px 0;font-size:0.95rem;font-weight:600;line-height:1.4;cursor:pointer;text-decoration:none;}
ui-cards .uic-btn:hover{border-color:${PALETTE.vanilla};}
ui-cards .uic-btn.uic-on{border-color:${PALETTE.vanilla};box-shadow:0 0 0 2px ${PALETTE.vanilla};}
ui-cards .uic-btn[disabled]{cursor:not-allowed;filter:grayscale(1);}
${variantCSS}
`;

  (function injectStyle() {
    if (document.getElementById('ui-cards-style')) return;
    const s = el('style');
    s.id = 'ui-cards-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  })();

  customElements.define('card-item', class extends HTMLElement {});

  class UiCards extends HTMLElement {
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

      const o = this._o = {
        trigger: a('trigger') || 'click',
        detailTrigger: a('detail-trigger') || 'click',
        toggle: has('toggle'),
        panel: ['below', 'right', 'none'].includes(a('panel')) ? a('panel') : 'below',
        panelTitle: a('panel-title') || '',
        placeholder: has('placeholder') ? a('placeholder') : '請點選卡片。',
        hideEmpty: has('hide-empty-panel'),
        panelBadge: a('panel-badge') || '',
        panelBadgeIcon: a('panel-badge-icon') || '',
        panelBadgeColor: a('panel-badge-color') || '',
        panelTheme: a('panel-theme') || '',
        panelColor: a('panel-color') || '',
        btnColor: a('button-color') || 'blue',
        cardStyle: a('card-style') || ''
      };
      const heading = a('title');
      if (heading != null) this.removeAttribute('title');

      /* 外觀變數 */
      const s = this.style;
      const center = a('align') === 'center';
      s.setProperty('--uic-cols', Math.max(1, parseInt(a('cols'), 10) || 3));
      s.setProperty('--uic-gap', num(a('gap'), 16) + 'px');
      s.setProperty('--uic-pad', num(a('card-padding'), 16) + 'px');
      s.setProperty('--uic-radius', num(a('card-radius'), 8) + 'px');
      s.setProperty('--uic-minh', has('card-height') ? num(a('card-height'), 0) + 'px' : 'auto');
      s.setProperty('--uic-mh', num(a('media-height'), 140) + 'px');
      s.setProperty('--uic-mw', num(a('media-width'), 120) + 'px');
      s.setProperty('--uic-isize', fs(a('icon-size')) || '2rem');
      s.setProperty('--uic-c', color(a('color')) || PALETTE.shell);
      s.setProperty('--uic-accent', color(a('accent')) || PALETTE.blue);
      /* 實心時的文字色：依底色亮度自動選擇 */
      s.setProperty('--uic-c-on', textOn(a('color') || 'shell'));
      s.setProperty('--uic-accent-on', textOn(a('accent') || 'blue'));
      if (has('icon-color')) s.setProperty('--uic-icon', color(a('icon-color')));
      /* 卡片框線與滑過效果 */
      applyBorder(this, a);
      s.setProperty('--uic-align', center ? 'center' : 'left');
      s.setProperty('--uic-jc', center ? 'center' : 'flex-start');
      s.setProperty('--uic-div', has('divider')
        ? `1px ${lineStyle(a('divider') || 'solid')} ${color(a('divider-color')) || 'var(--uic-c)'}`
        : 'none');
      /* 全體卡片字級與角標底色 */
      applySizes(this, a);
      applyBadgeColor(this, a('badge-color'));
      /* 元件大標題與內容區標題：字級、文字色、底線色 */
      const setVar = (name, v) => { if (v) s.setProperty(name, v); };
      setVar('--uic-fs-title', fs(a('title-size')));
      setVar('--uic-title-c', color(a('title-color')));
      setVar('--uic-fs-head', fs(a('panel-title-size')));
      setVar('--uic-head-c', color(a('panel-title-color')));
      const line = a('panel-title-line');
      if (line && line !== 'none') setVar('--uic-head-line', color(line));

      /* 卡片 */
      const wrap = this._wrap = el('div', 'uic-wrap');
      const grid = el('div', 'uic-grid');
      this._cards = [...this.children].filter(n => n.localName === 'card-item');
      this._cards.forEach(c => {
        this._decorate(c);
        grid.append(c);
      });
      wrap.append(grid);
      this._decorateButtons(grid);

      /* 內容區：有任何 detail 才建立 */
      if (o.panel !== 'none' && grid.querySelector('[detail]')) {
        const col = el('div', 'uic-panel');
        const head = el('div', 'uic-head');
        const body = el('div', 'uic-pbody');
        col.append(head, body);
        if (has('panel-height')) {
          col.style.maxHeight = num(a('panel-height'), 0) + 'px';
          col.style.overflow = 'auto';
        }
        this._panel = { col, head, body };
        wrap.append(col);
        this._setPanelTheme(null);
        if (o.panel === 'right') {
          const c = (a('panel-columns') || '8,4').split(',').map(v => num(v, 1));
          s.setProperty('--uic-pcols', `minmax(0,${c[0]}fr) minmax(0,${c[1] != null ? c[1] : c[0]}fr)`);
          wrap.classList.add('uic-side');
        }
      }

      this.replaceChildren(...(heading ? [el('div', 'uic-title', heading)] : []), wrap);

      /* 事件 */
      wrap.addEventListener('click', e => this._onClick(e));
      wrap.addEventListener('keydown', e => {
        const fc = e.target;
        if ((e.key === 'Enter' || e.key === ' ') && fc.localName === 'card-item' && fc.hasAttribute('data-flip') && !fc.hasAttribute('disabled')) {
          e.preventDefault();
          this._flip(fc);
        }
      });
      if (o.trigger === 'hover' || o.detailTrigger === 'hover') {
        wrap.addEventListener('mouseover', e => {
          const b = e.target.closest('[detail]');
          if (!b || !wrap.contains(b) || b === this._on) return;
          const isCard = b.localName === 'card-item';
          if ((isCard && o.trigger === 'hover') || (!isCard && o.detailTrigger === 'hover')) this._press(b, false);
        });
      }

      /* 初始狀態 */
      if (this._panel) {
        this._clear();
        const ad = a('active-detail');
        if (ad) {
          const all = [...grid.querySelectorAll('[detail]')].filter(x => x.getAttribute('detail') === ad);
          const b = all.find(x => x.localName === 'card-item') || all[0] || null;
          this._open(ad, b);
        }
      }

      this.setAttribute('data-ready', '');
    }

    _decorate(c) {
      const ta = n => c.getAttribute(n);
      const kids = [...c.childNodes];
      const parts = [];

      const img = ta('image');
      const icon = ta('icon');
      /* inline：圖示放進標題列，不另佔一塊 */
      const inline = (ta('media-position') || this.getAttribute('media-position') || '').trim() === 'inline';
      const meta = ta('meta');
      const useHead = inline || !!meta;
      if ((img || icon) && !inline) {
        const media = el('div', 'uic-media');
        if (img) {
          const im = el('img');
          im.src = img;
          im.alt = ta('label') || '';
          im.loading = 'lazy';
          media.classList.add('uic-img');
          media.append(im);
        } else {
          media.append(iconEl(icon));
        }
        c.setAttribute('data-media', '');
        parts.push(media);
      }

      const main = el('div', 'uic-main');
      let head = null;
      if (useHead) {
        head = el('div', 'uic-chead');
        if (inline && (img || icon)) {
          const hi = el('span', 'uic-hicon');
          if (img) { const im = el('img'); im.src = img; im.alt = ta('label') || ''; im.loading = 'lazy'; hi.append(im); }
          else hi.append(iconEl(icon));
          head.append(hi);
        }
        head.append(el('div', 'uic-label', ta('label') || ''));
        if (meta) head.append(el('div', 'uic-meta', meta));
        main.append(head);
      } else if (ta('label')) main.append(el('div', 'uic-label', ta('label')));
      if (ta('note')) main.append(el('div', 'uic-note', ta('note')));
      if (ta('tags')) {
        const tg = el('div', 'uic-tags');
        ta('tags').split(',').map(t => t.trim()).filter(Boolean).forEach(t => tg.append(el('span', 'uic-tag', t)));
        main.append(tg);
      }

      const body = el('div', 'uic-body');
      body.append(...kids);
      if (ta('source')) body.append(cloneOf(ta('source')) || alertEl(ta('source')));
      if (body.children.length || body.textContent.trim()) main.append(body);
      parts.push(main);

      if (ta('footer')) parts.push(el('div', 'uic-foot', ta('footer')));

      /* 翻面：back 或 back-source；flip-* 屬性可寫在 ui-cards 上當整組預設 */
      const fa = n => (c.hasAttribute(n) ? c.getAttribute(n) : this.getAttribute(n));
      const hasBack = c.hasAttribute('back') || c.hasAttribute('back-source');
      if (hasBack) {
        const back = el('div', 'uic-back');
        const bb = el('div', 'uic-body');
        if (ta('back-source')) bb.append(cloneOf(ta('back-source')) || alertEl(ta('back-source')));
        else bb.innerHTML = ta('back') || '';
        back.append(bb);
        const tg = fa('flip-toggle');
        c._flipToggle = tg != null && tg !== 'false';
        if (c._flipToggle && fa('flip-hint') !== '') back.append(el('div', 'uic-flip-hint', fa('flip-hint') || '點擊翻回'));
        parts.push(back);
        c._autoFlip = num(fa('auto-flip'), 0);
        c._flipColor = fa('flip-color') || '';
        if (fa('flip-bar-color')) c.style.setProperty('--uic-flipbar', color(fa('flip-bar-color')));
        const an = fa('flip-animation');
        c.setAttribute('data-flip-anim', ['fade', 'slide', 'none'].includes(an) ? an : 'fade');
        c.setAttribute('data-flip', '');
        if (!c.hasAttribute('tabindex')) c.tabIndex = 0;
        c.setAttribute('role', 'button');
        c.setAttribute('aria-pressed', 'false');
      }
      const bd = badgeEl(ta('badge'), ta('badge-icon'));
      if (bd && head) head.append(bd);
      else if (bd) parts.push(bd);
      c.replaceChildren(...parts);
      applyBadgeColor(c, ta('badge-color'));

      if (ta('tooltip')) c.title = ta('tooltip');
      if (ta('color')) {
        c.style.setProperty('--uic-c', color(ta('color')));
        c.style.setProperty('--uic-c-on', textOn(ta('color')));
      }
      /* 卡片外觀：自己的 card-style 優先，其次為 ui-cards 的 card-style */
      const st = (ta('card-style') || this._o.cardStyle).trim();
      if (['filled', 'plain', 'outline'].includes(st)) c.setAttribute('data-style', st);
      if (ta('icon-color')) c.style.setProperty('--uic-icon', color(ta('icon-color')));
      /* 單張卡片的框線與滑過效果（覆寫 ui-cards 的設定） */
      applyBorder(c, ta);
      if (ta('icon-size')) c.style.setProperty('--uic-isize', fs(ta('icon-size')));
      /* 單張卡片字級（覆寫 ui-cards 的設定） */
      applySizes(c, ta);
      if (ta('span')) c.style.gridColumn = `span ${Math.max(1, parseInt(ta('span'), 10) || 1)}`;
      if (!c.hasAttribute('disabled') && (ta('detail') || ta('href') || hasBack)) c.setAttribute('data-click', '');
    }

    _onClick(e) {
      const wrap = this._wrap;
      /* 顯示按鈕優先處理，避免被所在卡片的 detail 攔截 */
      const r = e.target.closest('[reveal]');
      if (r && wrap.contains(r)) {
        e.preventDefault();
        e.stopPropagation();
        this._reveal(r);
        return;
      }
      /* 翻面卡片：點卡片本身翻面；卡片內的按鈕、連結、輸入框照常運作 */
      const fc = e.target.closest('card-item[data-flip]');
      if (fc && wrap.contains(fc) && !fc.hasAttribute('disabled')) {
        const inner = e.target.closest('[detail], a[href], button, input, select, textarea, label, summary');
        if (!inner || inner === fc) {
          e.preventDefault();
          this._flip(fc);
          return;
        }
      }
      const b = e.target.closest('[detail]');
      if (b && wrap.contains(b)) {
        const link = e.target.closest('a[href]');
        if (link && link !== b && !link.hasAttribute('detail') && b.contains(link)) return;
        e.preventDefault();
        this._press(b, true);
        return;
      }
      const c = e.target.closest('card-item[href]');
      if (c && wrap.contains(c) && !c.hasAttribute('disabled') && !e.target.closest('a[href], button')) {
        const target = c.getAttribute('target');
        target ? window.open(c.getAttribute('href'), target) : (location.href = c.getAttribute('href'));
      }
    }

    /* 顯示目標區塊；按鈕有 remove-cards 時一併移除整個 ui-cards */
    _reveal(r) {
      if (r.disabled || r.hasAttribute('disabled')) return;
      const id = (r.getAttribute('reveal') || '').trim();
      const target = id ? document.getElementById(id) : null;
      if (!target) {
        const next = r.nextElementSibling;
        if (!(next && next.classList.contains('uic-alert'))) r.after(alertEl(id));
        return;
      }
      target.hidden = false;
      target.classList.remove('d-none');
      if (target.style.display === 'none') target.style.removeProperty('display');
      if (getComputedStyle(target).display === 'none') target.style.display = 'block';

      const removeCards = r.hasAttribute('remove-cards');
      target.dispatchEvent(new CustomEvent('ui-cards:reveal', {
        bubbles: true,
        detail: { id, removed: removeCards, button: r }
      }));
      if (removeCards) {
        this.remove();
      } else {
        r.classList.add('uic-on');
      }
      if (r.hasAttribute('reveal-scroll')) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    _press(b, isClick) {
      if (!this._panel) return;
      if (b.disabled || b.hasAttribute('disabled')) return;
      if (b === this._on) {
        if (isClick && (this._o.toggle || b.hasAttribute('toggle'))) this._clear();
        return;
      }
      this._open(b.getAttribute('detail'), b);
    }

    _setOn(b, on) {
      if (!b) return;
      if (b.localName === 'card-item') {
        b.toggleAttribute('data-active', on);
      } else {
        b.classList.toggle('uic-on', on);
        if (b.classList.contains('btn')) b.classList.toggle('active', on);
      }
    }

    _open(id, b) {
      const p = this._panel;
      this._setOn(this._on, false);
      this._on = b;
      this._setOn(b, true);

      const card = b && b.closest('card-item');
      const label = (card && card.getAttribute('label')) || '';
      p.head.textContent = b && b.hasAttribute('detail-title')
        ? b.getAttribute('detail-title')
        : this._o.panelTitle.replace('{label}', label);
      p.body.replaceChildren(cloneOf(id) || alertEl(id));
      this._decorateButtons(p.body);
      this._setPanelBadge(b);
      this._setPanelTheme(b);
      this._wrap.classList.remove('uic-nopanel');
    }

    /* 內容區主題：ui-cards 的 panel-theme → 內容來源元素的 theme → 按鈕的 detail-theme，依序疊加，
       同一組後寫的蓋掉先寫的；顏色同理（panel-color → color → detail-color）。 */
    _setPanelTheme(b) {
      const p = this._panel, o = this._o, col = p.col;
      const src = b && b.getAttribute('detail') ? document.getElementById(b.getAttribute('detail')) : null;
      const tokens = [o.panelTheme, src && src.getAttribute('theme'), b && b.getAttribute('detail-theme')]
        .filter(Boolean).join(' ').split(/[\s,]+/).filter(Boolean);
      const st = { frame: '', bg: '', head: '', size: '', fx: '' };
      tokens.forEach(t => {
        const g = THEME_TOKENS[t];
        if (g) st[g[0]] = g[1];
        else console.warn('[ui-cards] theme="' + t + '" 不是可用的關鍵字，可用：' + Object.keys(THEME_TOKENS).join('、') + '。');
      });
      Object.keys(st).forEach(k => (st[k] ? col.setAttribute('data-' + k, st[k]) : col.removeAttribute('data-' + k)));
      const cName = (b && b.getAttribute('detail-color')) || (src && src.getAttribute('color')) || o.panelColor;
      if (cName && st.bg !== 'gold') {
        col.style.setProperty('--uic-pac', color(cName));
        col.style.setProperty('--uic-pac-on', textOn(cName));
      } else {
        col.style.removeProperty('--uic-pac');
        col.style.removeProperty('--uic-pac-on');
      }
      let bolt = col.querySelector(':scope > .uic-fx-bolt');
      if (st.fx === 'electric') { if (!bolt) col.append(el('span', 'uic-fx-bolt')); }
      else if (bolt) bolt.remove();
    }

    /* 內容區角標：按鈕的 detail-badge* 優先，其次為 ui-cards 的 panel-badge*；清空時移除 */
    _setPanelBadge(b) {
      const p = this._panel;
      if (p.badge) p.badge.remove();
      p.badge = null;
      p.col.classList.remove('uic-has-badge');
      if (!b) return;
      const pick = (own, fallback) => (b.hasAttribute(own) ? b.getAttribute(own) : fallback);
      const text = pick('detail-badge', this._o.panelBadge);
      const icon = pick('detail-badge-icon', this._o.panelBadgeIcon);
      const bd = badgeEl(text, icon);
      if (!bd) return;
      applyBadgeColor(bd, pick('detail-badge-color', this._o.panelBadgeColor));
      p.col.append(bd);
      p.badge = bd;
      p.col.classList.add('uic-has-badge');
      p.col.style.setProperty('--uic-pbadge-w', (bd.offsetWidth + 16) + 'px');
    }

    /* 翻面；want 為 true／false 時強制指定狀態（API 與倒數用），省略時切換 */
    _flip(c, want) {
      const on = c.hasAttribute('data-flipped');
      const next = want == null ? !on : !!want;
      if (next === on) return;
      if (!next && want == null && !c._flipToggle) return;
      clearTimeout(c._flipT);
      c.querySelector(':scope > .uic-flipbar')?.remove();
      c.classList.remove('uic-unflip');
      if (next) {
        c.style.minHeight = c.offsetHeight + 'px';   /* 背面較短時維持高度，避免版面跳動 */
        c._prevC = [c.style.getPropertyValue('--uic-c'), c.style.getPropertyValue('--uic-c-on')];
        if (c._flipColor) {
          c.style.setProperty('--uic-c', color(c._flipColor));
          c.style.setProperty('--uic-c-on', textOn(c._flipColor));
        }
        c.setAttribute('data-flipped', '');
        if (c._autoFlip > 0) {
          const bar = el('div', 'uic-flipbar');
          bar.style.animationDuration = c._autoFlip + 'ms';
          c.append(bar);
          c._flipT = setTimeout(() => this._flip(c, false), c._autoFlip);
        }
      } else {
        c.removeAttribute('data-flipped');
        c.style.minHeight = '';
        const pc = c._prevC || ['', ''];
        pc[0] ? c.style.setProperty('--uic-c', pc[0]) : c.style.removeProperty('--uic-c');
        pc[1] ? c.style.setProperty('--uic-c-on', pc[1]) : c.style.removeProperty('--uic-c-on');
        c.classList.add('uic-unflip');
        setTimeout(() => c.classList.remove('uic-unflip'), 400);
      }
      c.setAttribute('aria-pressed', String(next));
      c.dispatchEvent(new CustomEvent('ui-cards:flip', { bubbles: true, detail: { card: c, flipped: next } }));
    }

    /* API：flip(卡片元素或索引, true／false／省略)、unflipAll() */
    flip(target, state) {
      const c = typeof target === 'number' ? (this._cards || [])[target] : target;
      if (c && c.hasAttribute('data-flip')) this._flip(c, state == null ? !c.hasAttribute('data-flipped') : state);
    }

    unflipAll() {
      (this._cards || []).forEach(c => { if (c.hasAttribute('data-flipped')) this._flip(c, false); });
    }

    _clear() {
      const p = this._panel;
      this._setOn(this._on, false);
      this._on = null;
      p.head.textContent = this._o.panelTitle.replace('{label}', '').trim();
      p.body.replaceChildren(...(this._o.placeholder ? [el('div', 'uic-ph', this._o.placeholder)] : []));
      this._setPanelBadge(null);
      this._setPanelTheme(null);
      if (this._o.hideEmpty) this._wrap.classList.add('uic-nopanel');
    }

    _decorateButtons(root) {
      root.querySelectorAll('[detail], [reveal]').forEach(b => {
        if (b.localName === 'card-item') return;
        if (b.localName === 'button' && !b.hasAttribute('type')) b.type = 'button';
        if (b.classList.contains('uic-btn')) return;
        if ([...b.classList].some(c => c === 'btn' || c.startsWith('btn-'))) return;
        const v = b.getAttribute('color') || this._o.btnColor;
        b.classList.add('uic-btn');
        const vk = String(v || '').trim().toLowerCase();
        if (PALETTE[vk]) {
          b.classList.add('uic-v-' + vk);
        } else {
          b.style.background = color(v);
          b.style.color = PALETTE.base;
        }
      });
    }
  }

  customElements.define('ui-cards', UiCards);
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
