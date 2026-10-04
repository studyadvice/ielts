/**
 * quiz-panel.js v5 — 題目面板元件（常駐展開）
 *
 * 收合功能已移除。面板永遠可見，寬度由 panel-width 固定，
 * 多個元件並排寬度完全獨立、不互相干擾。
 *
 * ── 欄寬 ──────────────────────────────────────────────────────────────────────
 *
 * panel-width="620px"    面板總寬（預設 620px）
 * ratio="1:1"            左:右欄比例（預設 1:1），與 right-width 擇一
 * right-width="220px"    固定右欄寬（設定後取消 ratio）
 * min-height="96px"      最小高度
 *
 * ── 題目與答案 ────────────────────────────────────────────────────────────────
 *
 * question="..."         題目文字（支援 **粗** *斜* `code` <br> \n）
 * answer="A|B"           正解（| 分隔多個）
 * explanation="..."      解說（核對後顯示）
 * placeholder="..."      輸入欄提示
 * case-sensitive="false"
 * match-mode="exact"     exact | contains | regex
 * input-type="text"      text | textarea
 * input-rows="2"
 * readonly-answer="false" 不顯示輸入欄，只有「顯示解說」按鈕
 * correct-message="✓ 正確！"
 * incorrect-message="✗ 錯誤"
 *
 * ── 按鈕 ──────────────────────────────────────────────────────────────────────
 *
 * btn-style="icon"       icon（預設）| text | both
 * btn-size="30px"        按鈕邊長
 * check-icon="<svg>…"   覆蓋核對圖示 HTML（預設 SVG 打勾）
 * reset-icon="<svg>…"   覆蓋重設圖示 HTML（預設 SVG 轉圈）
 * check-label="核對答案"  aria-label 及 tooltip
 * reset-label="重設"
 *
 * ── 字體大小 ──────────────────────────────────────────────────────────────────
 *
 * fs-question="0.96rem"    題目文字
 * fs-number="0.76rem"      題號
 * fs-input="0.88rem"       輸入欄
 * fs-result="0.8rem"       核對結果訊息
 * fs-explanation="0.82rem" 解說文字
 *
 * ── 品牌主題 ──────────────────────────────────────────────────────────────────
 *
 * theme="colorName"      套用品牌色（見下方 BRAND 色票）
 * theme-style="dark"     dark（預設）| filled
 *
 * 可用色名：lavender special warning salmon sky safe vanilla yellow
 *           focus info stone indigo pink orange shell
 *
 * ── 群組自動編號 ──────────────────────────────────────────────────────────────
 *
 * group="名稱"           群組識別，同名元件按 DOM 順序自動編號
 * group-start="N"        起始號（同群組第一個出現的值生效，預設 1）
 * group-no-number        布林，整組停用編號
 * skip-number            布林，此題不佔序號、不顯示
 * show-number="X"        手動指定顯示文字（優先於群組自動號）
 *
 * ── 全域設定（在引入 JS 前設定）─────────────────────────────────────────────
 *
 * window.QuizPanelConfig = {
 *   checkIcon, resetIcon, checkLabel, resetLabel,
 *   btnStyle, btnSize,
 *   placeholder, correctMessage, incorrectMessage,
 *   caseSensitive, matchMode,
 *   panelWidth, ratio, rightWidth, minHeight,
 *   questionColor, explanationColor, accentColor, dividerColor,
 *   animDuration,
 *   theme, themeStyle,
 *   fsQuestion, fsNumber, fsInput, fsResult, fsExplanation,
 * };
 *
 * ── 事件（bubble）────────────────────────────────────────────────────────────
 *
 * quiz-panel-check   detail: { answer, correct, expected }
 * quiz-panel-reset   detail: {}
 *
 * ── 實例 API（wrapper.__qp）──────────────────────────────────────────────────
 *
 * .check() / .reset()
 * .setQuestion(t) / .setAnswer(t) / .setExplanation(t)
 * .getGroupNumber()
 *
 * ── 靜態 API ─────────────────────────────────────────────────────────────────
 *
 * QuizPanel.getGroup(name)
 * QuizPanel.resetGroup(name)
 * QuizPanel.renumberGroup(name, N)
 * QuizPanel.collectAnswers([{ onlyAnswered, group }])  → Array
 * QuizPanel.collectAnswersJSON([opts])                 → JSON string
 *
 * collectAnswers 每筆欄位：
 *   index, number, group, question, userInput, expected, correct
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════
     調色盤
  ══════════════════════════════════════════ */
  const C = {
    bg:'#0C0D0C', bg1:'#141514', bg2:'#1C1D1C', bg3:'#252625',
    shell:'#C6C7BD', lavender:'#C3A5E5', special:'#b3de73',
    warning:'#F08080', safe:'#299459', vanilla:'#DBEDD8',
    focus:'#E0BE79', stone:'#95c9de', indigo:'#9B72CF',
  };

  const BRAND = {
    lavender:'#C3A5E5', special:'#b3de73', warning:'#F08080',
    salmon  :'#E5C3B3', sky    :'#95c9de', safe   :'#299459',
    vanilla :'#DBEDD8', yellow :'#DECA4B', focus  :'#E0BE79',
    info    :'#1E65C7', stone  :'#95c9de', indigo :'#9B72CF',
    pink    :'#FFB3D9', orange :'#EDA109', shell  :'#C6C7BD',
  };

  /* ══════════════════════════════════════════
     色彩工具
  ══════════════════════════════════════════ */
  function _rgb(hex) {
    hex = hex.replace('#','');
    return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
  }
  function _rgba(hex, a) { const [r,g,b]=_rgb(hex); return `rgba(${r},${g},${b},${a})`; }
  function _darken(hex,t) { const [r,g,b]=_rgb(hex),d=1-t; return `rgb(${Math.round(r*d)},${Math.round(g*d)},${Math.round(b*d)})`; }
  function _lighten(hex,t){ const [r,g,b]=_rgb(hex); return `rgb(${Math.round(r+(255-r)*t)},${Math.round(g+(255-g)*t)},${Math.round(b+(255-b)*t)})`; }

  /* ══════════════════════════════════════════
     主題變數
  ══════════════════════════════════════════ */
  function _themeVars(name, style) {
    const color = BRAND[name];
    if (!color) return {};
    if (style === 'filled') {
      return {
        '--qp-bg'          : color,
        '--qp-bg1'         : _darken(color,0.10),
        '--qp-bg2'         : _darken(color,0.18),
        '--qp-bg3'         : _darken(color,0.28),
        '--qp-panel-border': 'rgba(0,0,0,0.28)',
        '--qp-q-color'     : '#0a0b0a',
        '--qp-vanilla'     : '#0a0b0a',
        '--qp-inp-border'  : 'rgba(0,0,0,0.22)',
        '--qp-focus'       : 'rgba(0,0,0,0.55)',
        '--qp-inp-ok-bg'   : 'rgba(0,0,0,0.12)',
        '--qp-inp-err-bg'  : 'rgba(0,0,0,0.12)',
        '--qp-safe'        : '#0a5432',
        '--qp-warning'     : '#852020',
        '--qp-divider'     : 'rgba(0,0,0,0.18)',
        '--qp-expl-color'  : 'rgba(0,0,0,0.72)',
        '--qp-expl-bg'     : 'rgba(0,0,0,0.10)',
        '--qp-stone'       : 'rgba(0,0,0,0.42)',
        '--qp-ck-bg'       : 'rgba(0,0,0,0.68)',
        '--qp-ck-fg'       : color,
        '--qp-rs-bg'       : 'rgba(0,0,0,0.10)',
        '--qp-rs-fg'       : 'rgba(0,0,0,0.48)',
        '--qp-rs-bd'       : 'rgba(0,0,0,0.16)',
      };
    } else {
      return {
        '--qp-panel-border': _rgba(color,0.52),
        '--qp-q-color'     : color,
        '--qp-inp-border'  : _rgba(color,0.42),
        '--qp-focus'       : color,
        '--qp-divider'     : _rgba(color,0.32),
        '--qp-expl-color'  : _rgba(color,0.80),
        '--qp-expl-bg'     : `color-mix(in srgb,${color} 8%,#0C0D0C)`,
        '--qp-stone'       : _rgba(color,0.52),
        '--qp-accent'      : color,
        '--qp-ck-bg'       : color,
        '--qp-ck-fg'       : C.bg,
        '--qp-rs-fg'       : _rgba(color,0.60),
        '--qp-rs-bd'       : _rgba(color,0.18),
      };
    }
  }

  /* ══════════════════════════════════════════
     SVG 圖示
  ══════════════════════════════════════════ */
  const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const ICON_RESET = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;

  /* ══════════════════════════════════════════
     全域樣式
  ══════════════════════════════════════════ */
  const STYLE_ID = 'quiz-panel-style-v5';
  if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = /* css */`
      /* ── wrapper ── */
      .qp-wrapper {
        display        : inline-block;
        vertical-align : top;
        font-family    : system-ui, 'Segoe UI', sans-serif;
        font-size      : 1rem;
        /* width 由 JS 在初始化時直接寫入 style.width */
      }

      /* ── 面板（永遠可見）── */
      .qp-panel {
        display        : flex;
        flex-direction : row;
        align-items    : stretch;
        background     : var(--qp-bg);
        border         : 2px solid var(--qp-panel-border, var(--qp-shell));
        border-radius  : 8px;
        overflow       : hidden;
        width          : 100%;
        min-height     : var(--qp-min-h);
        box-sizing     : border-box;
      }

      /* ── 題目區 ── */
      .qp-question {
        flex       : 1 1 auto;
        min-width  : 0;
        padding    : 12px 16px;
        color      : var(--qp-q-color);
        font-size  : var(--qp-fs-q);
        line-height: 1.7;
        display    : flex;
        align-items: center;
        gap        : 8px;
        border-right: 2px dashed var(--qp-divider);
        word-break : break-word;
        box-sizing : border-box;
      }
      .qp-wrapper.qp-ratio .qp-question { flex: var(--qp-ratio-l) 1 0; }

      .qp-num {
        flex-shrink: 0;
        font-size  : var(--qp-fs-num);
        color      : var(--qp-stone);
        font-weight: 700;
        min-width  : 18px;
        align-self : flex-start;
        padding-top: 2px;
      }

      /* ── 右側操作區 ── */
      .qp-right {
        flex       : 0 0 var(--qp-right-w);
        min-width  : 0;
        display    : flex;
        flex-direction: column;
        padding    : 10px;
        gap        : 6px;
        background : var(--qp-bg1);
        box-sizing : border-box;
      }
      .qp-wrapper.qp-ratio .qp-right { flex: var(--qp-ratio-r) 1 0; }

      /* ── 輸入欄 ── */
      .qp-input {
        width        : 100%;
        background   : var(--qp-bg2);
        border       : 1.5px solid var(--qp-inp-border, var(--qp-stone));
        border-radius: 4px;
        color        : var(--qp-vanilla);
        font-size    : var(--qp-fs-inp);
        padding      : 5px 8px;
        outline      : none;
        box-sizing   : border-box;
        transition   : border-color .18s, background .18s;
        resize       : vertical;
        font-family  : inherit;
        line-height  : 1.5;
      }
      .qp-input::placeholder { color: #55555a; }
      .qp-input:focus        { border-color: var(--qp-focus); }
      .qp-input.qp-correct   { border-color: var(--qp-safe);    background: var(--qp-inp-ok-bg,  #0b1a12); }
      .qp-input.qp-incorrect { border-color: var(--qp-warning); background: var(--qp-inp-err-bg, #1c0b0b); }

      /* ── 操作列（按鈕 ＋ 結果 同行）── */
      .qp-action-row {
        display    : flex;
        align-items: center;
        gap        : 6px;
        min-height : var(--qp-btn-size);
      }

      /* ── 按鈕 ── */
      .qp-btn {
        flex           : 0 0 var(--qp-btn-size);
        width          : var(--qp-btn-size);
        height         : var(--qp-btn-size);
        padding        : 0;
        border         : none;
        border-radius  : 5px;
        cursor         : pointer;
        display        : flex;
        align-items    : center;
        justify-content: center;
        transition     : filter .14s, transform .1s;
        font-size      : var(--qp-fs-inp);
        font-family    : inherit;
        font-weight    : 600;
        line-height    : 1;
      }
      .qp-btn:hover  { filter: brightness(1.22); }
      .qp-btn:active { transform: scale(0.88); }
      .qp-btn-check  { background: var(--qp-ck-bg, var(--qp-accent)); color: var(--qp-ck-fg, #fff); }
      .qp-btn-reset  { background: var(--qp-rs-bg, var(--qp-bg3)); color: var(--qp-rs-fg, var(--qp-stone)); border: 1px solid var(--qp-rs-bd, #ffffff1a); }

      /* text / both 模式 */
      .qp-wrapper.qp-bstyle-text .qp-btn,
      .qp-wrapper.qp-bstyle-both .qp-btn { flex:1; width:auto; padding:0 8px; gap:5px; }
      .qp-btn-label { display:none; font-size:0.82rem; letter-spacing:.04em; }
      .qp-wrapper.qp-bstyle-both .qp-btn-label,
      .qp-wrapper.qp-bstyle-text .qp-btn-label { display:inline; }

      /* ── 結果訊息（inline）── */
      .qp-result {
        flex         : 1 1 0;
        min-width    : 0;
        display      : none;
        font-size    : var(--qp-fs-res);
        font-weight  : 700;
        overflow     : hidden;
        text-overflow: ellipsis;
        white-space  : nowrap;
        line-height  : var(--qp-btn-size);
      }
      .qp-result.qp-show     { display: block; }
      .qp-result.qp-correct  { color: var(--qp-safe); }
      .qp-result.qp-incorrect{ color: var(--qp-warning); }

      /* ── 解說 ── */
      .qp-explanation {
        display    : none;
        font-size  : var(--qp-fs-expl);
        color      : var(--qp-expl-color);
        line-height: 1.6;
        padding    : 7px 9px;
        background : var(--qp-expl-bg, #120d19);
        border-left: 3px solid var(--qp-expl-color);
        border-radius: 3px;
        word-break : break-word;
      }
      .qp-explanation.qp-show { display: block; }
      .qp-explanation code {
        background   : var(--qp-bg2);
        padding      : 1px 5px;
        border-radius: 3px;
        color        : var(--qp-special, #b3de73);
        font-size    : 0.9em;
      }

      /* ── readonly 顯示解說按鈕 ── */
      .qp-reveal-btn {
        width        : 100%;
        padding      : 6px 0;
        background   : var(--qp-bg3);
        border       : 1.5px dashed var(--qp-divider);
        border-radius: 4px;
        color        : var(--qp-stone);
        font-size    : var(--qp-fs-res);
        cursor       : pointer;
        font-family  : inherit;
        transition   : background .15s, color .15s;
      }
      .qp-reveal-btn:hover { background: var(--qp-bg2); color: var(--qp-shell); }
    `;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════
     預設值
  ══════════════════════════════════════════ */
  const D = {
    checkIcon    : ICON_CHECK,  resetIcon    : ICON_RESET,
    checkLabel   : '核對答案',   resetLabel   : '重設',
    btnStyle     : 'icon',      btnSize      : '30px',
    placeholder  : '請輸入答案…',
    correctMessage : '✓ 正確！',  incorrectMsg : '✗ 錯誤',
    caseSensitive: false,        matchMode    : 'exact',
    panelWidth   : '620px',      ratio        : '1:1',
    rightWidth   : null,         minHeight    : '96px',
    questionColor: C.shell,      explColor    : C.lavender,
    accentColor  : C.indigo,     dividerColor : C.stone,
    animDuration : 200,
    theme: '',   themeStyle: 'dark',
    fsQuestion:'0.96rem', fsNumber:'0.76rem', fsInput:'0.88rem',
    fsResult  :'0.8rem',  fsExplanation:'0.82rem',
  };

  /* ══════════════════════════════════════════
     群組
  ══════════════════════════════════════════ */
  const _groups = Object.create(null);
  const _timers = Object.create(null);

  function applyGroupNums(name) {
    const g = _groups[name];
    if (!g || g.noNumber) return;
    g.panels.sort((a,b) =>
      (a.$wrap.compareDocumentPosition(b.$wrap) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1
    );
    let n = g.start ?? 1;
    for (const p of g.panels) { if (!p.o.skipNumber) p._applyAutoNum(n++); }
  }

  /* ══════════════════════════════════════════
     工具
  ══════════════════════════════════════════ */
  function gcfg(el, attr, key, fb) {
    if (el.hasAttribute(attr)) return el.getAttribute(attr);
    const G = window.QuizPanelConfig || {};
    if (key in G) return G[key];
    return fb !== undefined ? fb : D[key];
  }
  function parseRatio(s) {
    if (!s) return null;
    const [l,r] = String(s).split(':').map(Number);
    return (isFinite(l)&&isFinite(r)) ? [l,r] : null;
  }
  function md(t) {
    if (!t) return '';
    const PH = '\x00BR\x00';
    return t
      .replace(/&lt;br\s*(\/)?&gt;/gi, PH)
      .replace(/<br\s*\/?>/gi, PH)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/`(.+?)`/g,'<code>$1</code>')
      .replace(/\n/g,'<br>')
      .replace(new RegExp(PH,'g'),'<br>');
  }
  function mk(tag,cls,attrs) {
    const e=document.createElement(tag);
    if(cls) e.className=cls;
    if(attrs) for(const [k,v] of Object.entries(attrs)) {
      if(k==='html') e.innerHTML=v;
      else if(k==='text') e.textContent=v;
      else e.setAttribute(k,v);
    }
    return e;
  }

  /* ══════════════════════════════════════════
     QuizPanel
  ══════════════════════════════════════════ */
  class QuizPanel {

    constructor(src) {
      this._src    = src;
      this._autoNum = null;
      this._numEl   = null;
      this._readCfg();
      this._build();
      this._bindEvents();
      if (this.o.group) this._registerGroup();
    }

    /* ─ 設定 ──────────────────────────────── */
    _readCfg() {
      const e = this._src;
      const G = window.QuizPanelConfig || {};
      const r = (attr,key,fb) => gcfg(e,attr,key,fb);

      let ratioStr=null, rightWidth=null;
      if      (e.hasAttribute('ratio'))       ratioStr  = e.getAttribute('ratio');
      else if (e.hasAttribute('right-width')) rightWidth= e.getAttribute('right-width');
      else if (G.ratio!=null)                 ratioStr  = G.ratio;
      else if (G.rightWidth!=null)            rightWidth= G.rightWidth;
      else                                    ratioStr  = D.ratio;

      this.o = {
        question    : e.getAttribute('question')    || '（未設定題目）',
        answer      : e.getAttribute('answer')      || '',
        explanation : e.getAttribute('explanation') || '',
        placeholder : r('placeholder',       'placeholder',    D.placeholder),
        checkLabel  : r('check-label',       'checkLabel',     D.checkLabel),
        resetLabel  : r('reset-label',       'resetLabel',     D.resetLabel),
        checkIcon   : r('check-icon',        'checkIcon',      D.checkIcon),
        resetIcon   : r('reset-icon',        'resetIcon',      D.resetIcon),
        btnStyle    : r('btn-style',         'btnStyle',       D.btnStyle),
        btnSize     : r('btn-size',          'btnSize',        D.btnSize),
        correctMsg  : r('correct-message',   'correctMessage', D.correctMessage),
        incorrectMsg: r('incorrect-message', 'incorrectMsg',   D.incorrectMsg),
        caseSensitive: r('case-sensitive','caseSensitive',String(D.caseSensitive))==='true',
        matchMode   : r('match-mode',        'matchMode',      D.matchMode),
        panelWidth  : r('panel-width',       'panelWidth',     D.panelWidth),
        minHeight   : r('min-height',        'minHeight',      D.minHeight),
        animDur     : r('anim-duration',     'animDuration',   D.animDuration),
        ratioStr, rightWidth,
        qColor      : r('question-color',    'questionColor',  D.questionColor),
        eColor      : r('explanation-color', 'explColor',      D.explColor),
        accent      : r('accent-color',      'accentColor',    D.accentColor),
        divider     : r('divider-color',     'dividerColor',   D.dividerColor),
        theme       : r('theme',             'theme',          D.theme),
        themeStyle  : r('theme-style',       'themeStyle',     D.themeStyle),
        fsQ         : r('fs-question',   'fsQuestion',   D.fsQuestion),
        fsNum       : r('fs-number',     'fsNumber',     D.fsNumber),
        fsInp       : r('fs-input',      'fsInput',      D.fsInput),
        fsRes       : r('fs-result',     'fsResult',     D.fsResult),
        fsExpl      : r('fs-explanation','fsExplanation',D.fsExplanation),
        showNum         : e.getAttribute('show-number') || '',
        inputType       : e.getAttribute('input-type')  || 'text',
        inputRows       : parseInt(e.getAttribute('input-rows') || '2'),
        readonlyAnswer  : (e.getAttribute('readonly-answer')||'false')==='true',
        group           : e.getAttribute('group')        || '',
        groupStart      : e.hasAttribute('group-start') ? parseInt(e.getAttribute('group-start'),10) : null,
        groupNoNumber   : e.hasAttribute('group-no-number'),
        skipNumber      : e.hasAttribute('skip-number'),
      };
    }

    /* ─ 建構 ──────────────────────────────── */
    _build() {
      const o = this.o;
      const ratio = parseRatio(o.ratioStr);

      /* wrapper */
      this.$wrap = mk('div','qp-wrapper');
      if (ratio)                     this.$wrap.classList.add('qp-ratio');
      if (o.btnStyle==='text')       this.$wrap.classList.add('qp-bstyle-text');
      else if (o.btnStyle==='both')  this.$wrap.classList.add('qp-bstyle-both');

      /* ── 寬度直接設定（不依賴 CSS var）── */
      /* 百分比寬度（如 100%）改用 display:block，避免 inline-block 的百分比計算問題 */
      const isPercent = /^\d+(\.\d+)?%$/.test(String(o.panelWidth).trim());
      if (isPercent) this.$wrap.style.display = 'block';
      this.$wrap.style.width = o.panelWidth;

      /* ── CSS 自訂屬性 ── */
      const vars = {
        '--qp-bg'    : C.bg,   '--qp-bg1': C.bg1, '--qp-bg2': C.bg2, '--qp-bg3': C.bg3,
        '--qp-shell' : C.shell,'--qp-accent': o.accent,'--qp-divider': o.divider,
        '--qp-q-color': o.qColor,'--qp-expl-color': o.eColor,
        '--qp-safe'  : C.safe, '--qp-warning': C.warning,
        '--qp-special': '#b3de73','--qp-stone': C.stone,
        '--qp-focus' : C.focus,'--qp-vanilla': C.vanilla,
        '--qp-min-h' : o.minHeight,
        '--qp-anim'  : `${o.animDur}ms`, '--qp-btn-size': o.btnSize,
        '--qp-fs-q'  : o.fsQ, '--qp-fs-num': o.fsNum,
        '--qp-fs-inp': o.fsInp,'--qp-fs-res': o.fsRes,'--qp-fs-expl': o.fsExpl,
      };
      if (ratio) {
        vars['--qp-ratio-l'] = String(ratio[0]);
        vars['--qp-ratio-r'] = String(ratio[1]);
      } else {
        vars['--qp-right-w'] = o.rightWidth || '220px';
      }
      if (o.theme) Object.assign(vars, _themeVars(o.theme, o.themeStyle));
      for (const [k,v] of Object.entries(vars)) this.$wrap.style.setProperty(k,v);

      /* ── 面板 ── */
      this.$panel = mk('div','qp-panel',{role:'region','aria-label':'題目面板'});

      /* ── 題目區 ── */
      this.$question = mk('div','qp-question');
      if (o.showNum) {
        this._numEl = mk('span','qp-num',{text: o.showNum+'.'});
        this.$question.appendChild(this._numEl);
      }
      this._qTextEl = mk('span');
      this._qTextEl.innerHTML = md(o.question);
      this.$question.appendChild(this._qTextEl);

      /* ── 右側 ── */
      this.$right = mk('div','qp-right');

      if (!o.readonlyAnswer) {
        this.$input = (o.inputType==='textarea')
          ? mk('textarea','qp-input',{placeholder:o.placeholder,rows:String(o.inputRows),'aria-label':'答案輸入欄位'})
          : mk('input','qp-input',{type:'text',placeholder:o.placeholder,'aria-label':'答案輸入欄位'});
        this.$right.appendChild(this.$input);

        this.$actionRow = mk('div','qp-action-row');
        this.$btnCheck  = this._makeBtn('check');
        this.$btnReset  = this._makeBtn('reset');
        this.$result    = mk('div','qp-result',{role:'status','aria-live':'polite'});
        this.$actionRow.append(this.$btnCheck, this.$btnReset, this.$result);
        this.$right.appendChild(this.$actionRow);
      } else {
        this.$revealBtn = mk('button','qp-reveal-btn',{type:'button',text:'▼ 顯示解說'});
        this.$right.appendChild(this.$revealBtn);
        this.$result = null;
        this.$input  = null;
      }

      if (o.explanation) {
        this.$expl = mk('div','qp-explanation');
        this.$expl.innerHTML = md(o.explanation);
        this.$right.appendChild(this.$expl);
      } else { this.$expl = null; }

      this.$panel.append(this.$question, this.$right);
      this.$wrap.appendChild(this.$panel);
      this.$wrap.__qp = this;
      this._src.replaceWith(this.$wrap);
    }

    _makeBtn(type) {
      const o   = this.o;
      const icon = type==='check' ? o.checkIcon : o.resetIcon;
      const lbl  = type==='check' ? o.checkLabel : o.resetLabel;
      const btn  = mk('button',`qp-btn qp-btn-${type}`,{type:'button',title:lbl,'aria-label':lbl});
      if (o.btnStyle==='text') {
        btn.textContent = lbl;
      } else if (o.btnStyle==='both') {
        const ico=mk('span'); ico.innerHTML=icon;
        btn.append(ico, mk('span','qp-btn-label',{text:lbl}));
      } else {
        btn.innerHTML = icon;
      }
      return btn;
    }

    /* ─ 群組 ──────────────────────────────── */
    _registerGroup() {
      const name = this.o.group;
      if (!_groups[name]) _groups[name]={panels:[],start:null,noNumber:false};
      const g = _groups[name];
      g.panels.push(this);
      if (this.o.groupStart!=null && g.start==null) g.start=this.o.groupStart;
      if (this.o.groupNoNumber) g.noNumber=true;
      clearTimeout(_timers[name]);
      _timers[name] = setTimeout(()=>applyGroupNums(name),0);
    }
    _applyAutoNum(n) {
      this._autoNum = n;
      if (this.o.showNum) return;
      if (!this._numEl) {
        this._numEl = mk('span','qp-num',{text:n+'.'});
        this.$question.insertBefore(this._numEl, this._qTextEl);
      } else { this._numEl.textContent = n+'.'; }
    }

    /* ─ 答案比對 ──────────────────────────── */
    _match(u) {
      const {answer,caseSensitive,matchMode}=this.o;
      if (!answer) return false;
      const n=s=>caseSensitive?s.trim():s.trim().toLowerCase();
      const ua=n(u);
      if (matchMode==='contains')
        return answer.split('|').some(a=>{const c=n(a);return c&&(c.includes(ua)||ua.includes(c));});
      if (matchMode==='regex')
        try{return new RegExp(n(answer),caseSensitive?'':'i').test(ua);}catch{return false;}
      return answer.split('|').map(a=>n(a)).includes(ua);
    }

    /* ─ 事件綁定 ──────────────────────────── */
    _bindEvents() {
      if (!this.o.readonlyAnswer) {
        this.$btnCheck.addEventListener('click',()=>this.check());
        this.$btnReset.addEventListener('click',()=>this.reset());
        if (this.o.inputType!=='textarea')
          this.$input.addEventListener('keydown',e=>{if(e.key==='Enter')this.check();});
      } else if (this.$revealBtn) {
        this.$revealBtn.addEventListener('click',()=>{
          if(!this.$expl) return;
          const show=!this.$expl.classList.contains('qp-show');
          this.$expl.classList.toggle('qp-show',show);
          this.$revealBtn.textContent=show?'▲ 隱藏解說':'▼ 顯示解說';
        });
      }
    }

    /* ─ 公開 API ──────────────────────────── */
    check() {
      if(!this.$input) return;
      const ua=this.$input.value, ok=this._match(ua);
      this.$input.classList.remove('qp-correct','qp-incorrect');
      this.$input.classList.add(ok?'qp-correct':'qp-incorrect');
      if(this.$result){
        this.$result.className=`qp-result qp-show ${ok?'qp-correct':'qp-incorrect'}`;
        this.$result.textContent=ok?this.o.correctMsg:this.o.incorrectMsg;
      }
      if(this.$expl) this.$expl.classList.add('qp-show');
      this._emit('quiz-panel-check',{answer:ua,correct:ok,expected:this.o.answer});
    }
    reset() {
      if(this.$input){this.$input.value='';this.$input.classList.remove('qp-correct','qp-incorrect');this.$input.focus();}
      if(this.$result){this.$result.className='qp-result';this.$result.textContent='';}
      if(this.$expl) this.$expl.classList.remove('qp-show');
      this._emit('quiz-panel-reset',{});
    }
    getGroupNumber() { return this._autoNum; }
    setQuestion(t)   { this.o.question=t; this._qTextEl.innerHTML=md(t); }
    setAnswer(t)     { this.o.answer=t; }
    setExplanation(t){ this.o.explanation=t; if(this.$expl) this.$expl.innerHTML=md(t); }
    _emit(name,detail){ this.$wrap.dispatchEvent(new CustomEvent(name,{bubbles:true,detail})); }

    /* ─ 靜態 API ──────────────────────────── */
    static getGroup(name)        { return (_groups[name]?.panels||[]).slice(); }
    static resetGroup(name)      { QuizPanel.getGroup(name).forEach(p=>p.reset()); }
    static renumberGroup(name,n) { if(_groups[name]){_groups[name].start=n;applyGroupNums(name);} }

    static collectAnswers(options={}) {
      const {onlyAnswered=false, group:fg=null}=options;
      const results=[]; let idx=0;
      document.querySelectorAll('.qp-wrapper').forEach(w=>{
        const p=w.__qp;
        if(!p) return;
        if(fg && p.o.group!==fg) return;
        const ui=p.$input?p.$input.value:'';
        if(onlyAnswered && !ui.trim()) return;
        const num=p._autoNum!=null?String(p._autoNum):(p.o.showNum||null);
        results.push({
          index:idx, number:num, group:p.o.group||null,
          question:p.o.question, userInput:ui,
          expected:p.o.answer,
          correct:p.o.readonlyAnswer?null:p._match(ui),
        });
        idx++;
      });
      return results;
    }
    static collectAnswersJSON(options={}) {
      return JSON.stringify(QuizPanel.collectAnswers(options),null,2);
    }
  }

  /* ══════════════════════════════════════════
     自動初始化
  ══════════════════════════════════════════ */
  function initAll(root) {
    (root||document).querySelectorAll('[data-quiz-panel]').forEach(node=>{
      if(!node._qpInit){node._qpInit=true; new QuizPanel(node);}
    });
  }
  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',()=>initAll())
    : initAll();

  new MutationObserver(ms=>{
    for(const m of ms) for(const n of m.addedNodes){
      if(n.nodeType!==1) continue;
      if(n.matches?.('[data-quiz-panel]')&&!n._qpInit){n._qpInit=true;new QuizPanel(n);}
      n.querySelectorAll?.('[data-quiz-panel]').forEach(x=>{if(!x._qpInit){x._qpInit=true;new QuizPanel(x);}});
    }
  }).observe(document.body,{childList:true,subtree:true});

  window.QuizPanel = QuizPanel;
})();
