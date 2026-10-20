/**
 * <step-flow> — 逐步流程顯示元件 v1.4
 *
 * ─── <step-flow> 屬性完整列表 ───────────────────────────────────────
 *
 *  【主題與佈局】
 *   theme            整體配色主題（token 名稱）：
 *                    shell | lavender | sky | salmon | ocean | safe |
 *                    teal | vanilla | yellow | focus | special |
 *                    info | indigo（預設）| pink | orange | warning
 *   default-width    所有步驟卡片寬度，預設 min(700px,100%)
 *   default-border   所有卡片邊框；省略顏色自動補主題色
 *   default-padding  所有卡片內距，預設 14px 16px
 *   default-radius   所有卡片圓角，預設 0
 *
 *  【步驟標籤顯示控制】
 *   show-step-label  「步驟 N」序號標籤是否顯示，預設 false（隱藏）
 *                    值：true | false
 *
 *  【終點按鈕顯示控制】
 *   show-finish      終點完成按鈕是否顯示，預設 true
 *   show-reset       重設按鈕是否顯示，預設 false
 *   reset-label      重設按鈕文字，預設「重新開始」
 *
 *  【分支按鈕色彩】
 *   btn-a-color      第一按鈕色彩（token 名稱或 #hex），預設主題色
 *   btn-b-color      第二按鈕色彩（token 名稱或 #hex），預設 teal
 *
 *  【字體大小】
 *   font-label       步驟標籤，預設 0.72rem
 *   font-body        卡片內文，預設 1.125rem
 *   font-btn         分支按鈕，預設 1rem
 *   font-pill        pill / 重設按鈕，預設 1rem
 *
 * ─── <flow-step> 屬性 ───────────────────────────────────────────────
 *   id             步驟識別碼（非首個步驟必填）
 *   btn-a          第一個分支按鈕文字
 *   btn-b          第二個分支按鈕文字
 *   single-btn     只有一個按鈕時使用，搭配 target-a
 *   target-a       btn-a / single-btn 點擊後顯示的 flow-step[id]
 *   target-b       btn-b 點擊後顯示的 flow-step[id]
 *   finish-btn     終點完成按鈕文字（設定後視為終點步驟）
 *   finish-target  完成按鈕點擊後捲動並顯示的 div#id
 *
 * ─── <flow-item> 屬性（flow-step 直接子容器） ───────────────────────
 *   width              覆蓋此步驟卡片寬度
 *   border             覆蓋此步驟卡片邊框（省略顏色自動補主題色）
 *   extra-info         右側垂直色帶 hover 時顯示的 popover 內容（支援 HTML）
 *   extra-info-title   可選；popover 頂端標題文字（純文字）
 *   extra-tab-width    右側色帶寬度，預設 16px（例如 24px、2rem）
 *
 * ─── 用法範例 ────────────────────────────────────────────────────────
 *
 * <step-flow theme="lavender" default-width="520px" default-radius="8px"
 *            show-step-label="true" show-reset="true">
 *
 *   <flow-step btn-a="路線 A" btn-b="路線 B" target-a="s2a" target-b="s2b">
 *     <flow-item extra-info-title="說明"
 *                extra-info="這是額外資訊<br>滑鼠移動到側邊條時候顯示"
 *                extra-tab-width="24px">
 *       <p>步驟說明，支援任意子 HTML。</p>
 *     </flow-item>
 *   </flow-step>
 *
 *   <flow-step id="s2a" single-btn="繼續" target-a="s3">
 *     <p>路線 A 說明。</p>
 *   </flow-step>
 *
 *   <flow-step id="s3" finish-btn="完成申請" finish-target="result-area">
 *     <p>終點說明。</p>
 *   </flow-step>
 * </step-flow>
 *
 * <div id="result-area" style="display:none;">結果內容</div>
 */

(function () {
  'use strict';

  /* ── 色彩 token ── */
  const C = {
    bg:       '#0C0D0C',
    shell:    '#C6C7BD',
    lavender: '#C3A5E5',
    sky:      '#82C8E5',
    warning:  '#E6374B',
    salmon:   '#E5C3B3',
    ocean:    '#1CCAE8',
    safe:     '#27AE60',
    teal:     '#0DA591',
    vanilla:  '#DBEDD8',
    yellow:   '#E3D322',
    focus:    '#D4FFFC',
    special:  '#B3DE73',
    info:     '#4171BF',
    indigo:   '#7849C9',
    pink:     '#FF91D7',
    orange:   '#EDA109',
  };

  function rgb(hex) {
    const h = (hex || '#888888').replace('#', '');
    return [
      parseInt(h.slice(0,2), 16),
      parseInt(h.slice(2,4), 16),
      parseInt(h.slice(4,6), 16),
    ].join(',');
  }

  function resolveColor(val) {
    if (!val) return null;
    if (val.startsWith('#')) return val;
    return C[val] || val;
  }

  function themeColor(name) { return C[name] || C.indigo; }

  function completeBorder(val, color) {
    if (!val) return null;
    if (val.includes('#') || val.includes('rgb')) return val;
    return `${val.trim()} ${color}`;
  }

  function arrowSVG(color) {
    return `<svg width="24" height="36" viewBox="0 0 24 36"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="0" x2="12" y2="24"
        stroke="${color}" stroke-width="2.5"/>
      <polygon points="12,36 2,20 22,20" fill="${color}"/>
    </svg>`;
  }

  /* ── 靜態基礎樣式（只注入一次） ── */
  if (!document.getElementById('__sf-base__')) {
    const s = document.createElement('style');
    s.id = '__sf-base__';
    s.textContent = `
step-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font-family: 'Noto Sans TC', 'Segoe UI', system-ui, sans-serif;
  line-height: 1.5;
}
flow-step { display: none; }
flow-step.sf-on { display: block; }

@keyframes sf-in {
  from { opacity:0; transform:translateY(14px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes sf-pop {
  from { opacity:0; transform:translateX(6px) scale(.97); }
  to   { opacity:1; transform:translateX(0)   scale(1); }
}

flow-step.sf-on .sf-card { animation: sf-in .28s ease both; }

.sf-label {
  display: none;          /* 預設隱藏；show-step-label="true" 時改為 inline-block */
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.sf-label.sf-label-on {
  display: inline-block;
}

/* ── 卡片外層：支援 extra-tab ── */
.sf-card {
  min-height: 90px;
  display: flex;       /* 橫排：內容區 + 側邊色帶 */
  align-items: stretch;
  overflow: visible;
  position: relative;
}
/* 無 extra-tab 時 main 填滿 */
.sf-card-main {
  flex: 1 1 auto;
  min-width: 0;
}

/* ── 右側垂直色帶 ── */
.sf-extra-tab {
  flex: 0 0 16px;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  border-left: 1px solid rgba(255,255,255,0.08);
  user-select: none;
  -webkit-user-select: none;
  transition: opacity .15s;
  border-radius: 0 inherit inherit 0;
}
.sf-extra-tab:hover { opacity: 0.85; }

/* 旋轉的「i」圖示文字 */
.sf-extra-tab-icon {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: .12em;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  pointer-events: none;
  line-height: 1;
  opacity: 0.88;
}

/* ── Popover 浮層 ── */
.sf-popover {
  display: none;
  position: absolute;
  top: 0;
  left: calc(100% + 10px);  /* 預設出現在右側 */
  min-width: 220px;
  max-width: 320px;
  z-index: 9999;
  border-radius: 8px;
  padding: 14px 16px 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.55);
  pointer-events: none;
  line-height: 1.5;
}
.sf-popover.sf-pop-visible {
  display: block;
  pointer-events: auto;
  animation: sf-pop .18s ease both;
}

/* 向左箭頭（popover 連接線） */
.sf-popover::before {
  content: '';
  position: absolute;
  top: 18px;
  left: -7px;
  width: 0; height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
}

/* Popover 標題 */
.sf-pop-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}

/* Popover 內文 */
.sf-pop-body {
  font-size: 0.88rem;
  line-height: 1.55;
}

/* ── 一般佈局元件（無 extra-tab 時卡片不變） ── */
.sf-body { line-height: 1.5; }
.sf-body p:first-child { margin-top: 0; }
.sf-body p:last-child  { margin-bottom: 0; }

.sf-choices {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.sf-btn {
  flex: 1 1 120px;
  max-width: 260px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background .16s, transform .12s, opacity .16s;
  line-height: 1.4;
  min-height: 36px;
}
.sf-btn:disabled { cursor: default; }
.sf-btn.sf-selected { outline-offset: 2px; }
.sf-btn:not(.sf-selected):disabled { opacity: .42; }

.sf-arrow {
  display: none;
  justify-content: center;
  align-items: center;
  height: 44px;
  opacity: 0.84;
}
.sf-arrow.sf-show {
  display: flex;
  animation: sf-in .28s .06s ease both;
}

.sf-finish {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.sf-pill {
  padding: 6px 20px;
  background: transparent;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: .03em;
  transition: background .16s, transform .12s;
  min-height: 32px;
}
.sf-pill:hover  { transform: translateY(-2px); }
.sf-pill:active { transform: translateY(0); }

.sf-reset {
  padding: 6px 14px;
  background: transparent;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: .02em;
  transition: background .16s, transform .12s, opacity .16s;
  min-height: 32px;
  opacity: 0.78;
}
.sf-reset:hover  { opacity: 1; transform: translateY(-2px); }
.sf-reset:active { transform: translateY(0); }

/* 螢幕較窄時 popover 改為向上出現 */
@media (max-width: 600px) {
  .sf-popover {
    left: auto;
    right: 0;
    top: auto;
    bottom: calc(100% + 10px);
    max-width: 90vw;
  }
  .sf-popover::before {
    top: auto;
    bottom: -7px;
    left: auto;
    right: 16px;
    border-top: 7px solid transparent;
    border-bottom: none;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
  }
}
    `;
    document.head.appendChild(s);
  }

  /* ── Custom Elements ── */
  if (!customElements.get('flow-item')) {
    customElements.define('flow-item', class extends HTMLElement {});
  }
  if (!customElements.get('flow-step')) {
    customElements.define('flow-step', class extends HTMLElement {});
  }

  /* ── <step-flow> ── */
  class StepFlow extends HTMLElement {
    connectedCallback() {
      setTimeout(() => this._build(), 0);
    }

    _opts() {
      const get = k => this.getAttribute(k);

      const themeName    = get('theme') || 'indigo';
      const themeHex     = themeColor(themeName);
      const lightTokens  = new Set(['shell','vanilla','focus','yellow','salmon','sky','special','lavender']);
      const textColor    = lightTokens.has(themeName) ? C.bg : C.shell;

      const defaultWidth   = get('default-width')   || 'min(700px,100%)';
      const rawBorder      = get('default-border');
      const defaultBorder  = rawBorder
        ? completeBorder(rawBorder, themeHex)
        : `1.5px solid rgba(${rgb(themeHex)},0.82)`;
      const defaultPadding = get('default-padding') || '14px 16px';
      const defaultRadius  = get('default-radius')  || '0';

      const showStepLabel = get('show-step-label') === 'true';   // 預設 false（隱藏）

      const showFinish = get('show-finish') !== 'false';
      const showReset  = get('show-reset')  === 'true';
      const resetLabel = get('reset-label') || '重新開始';

      const btnAHex = resolveColor(get('btn-a-color')) || themeHex;
      const btnBHex = resolveColor(get('btn-b-color')) || C.teal;

      const fontLabel = get('font-label') || '0.72rem';
      const fontBody  = get('font-body')  || '1.125rem';
      const fontBtn   = get('font-btn')   || '1rem';
      const fontPill  = get('font-pill')  || '1rem';

      return {
        themeHex, themeName, textColor,
        defaultWidth, defaultBorder, defaultPadding, defaultRadius,
        showStepLabel,
        showFinish, showReset, resetLabel,
        btnAHex, btnBHex,
        fontLabel, fontBody, fontBtn, fontPill,
      };
    }

    _build() {
      const steps = Array.from(this.querySelectorAll(':scope > flow-step'));
      if (!steps.length) return;

      this._uid = this._uid || `sf-${Math.random().toString(36).slice(2,8)}`;
      this.setAttribute('data-sfid', this._uid);

      const opts = this._opts();

      const sid = `__sf-d-${this._uid}__`;
      if (!document.getElementById(sid)) {
        const s = document.createElement('style');
        s.id = sid;
        s.textContent = this._dynCSS(opts);
        document.head.appendChild(s);
      }

      steps.forEach((step, i) => this._wrap(step, i + 1, opts));
      steps[0].classList.add('sf-on');
    }

    _dynCSS(o) {
      const id   = this._uid;
      const tc   = o.themeHex;
      const aHex = o.btnAHex;
      const bHex = o.btnBHex;
      const cardBg = `rgba(26,28,26,0.92)`;
      /* popover 背景比卡片略亮，帶主題色調 */
      const popBg = `rgba(38,40,42,0.97)`;
      const tabBg = `rgba(${rgb(tc)},0.22)`;
      const tabBgHover = `rgba(${rgb(tc)},0.36)`;

      return `
/* ── step-flow[data-sfid="${id}"] ── */
step-flow[data-sfid="${id}"] {
  color: ${o.textColor};
  font-size: ${o.fontBody};
}
step-flow[data-sfid="${id}"] flow-step {
  width: ${o.defaultWidth};
}
step-flow[data-sfid="${id}"] .sf-card {
  background: ${cardBg};
  border: ${o.defaultBorder};
  padding: 0;
  border-radius: ${o.defaultRadius};
  color: ${o.textColor};
}
step-flow[data-sfid="${id}"] .sf-card-main {
  padding: ${o.defaultPadding};
}
step-flow[data-sfid="${id}"] .sf-label {
  font-size: ${o.fontLabel};
  color: rgba(${rgb(tc)},0.9);
}
step-flow[data-sfid="${id}"] .sf-body {
  font-size: ${o.fontBody};
  color: ${o.textColor};
}

/* 右側色帶 */
step-flow[data-sfid="${id}"] .sf-extra-tab {
  background: ${tabBg};
  color: rgba(${rgb(tc)},0.9);
}
step-flow[data-sfid="${id}"] .sf-extra-tab:hover {
  background: ${tabBgHover};
}

/* Popover */
step-flow[data-sfid="${id}"] .sf-popover {
  background: ${popBg};
  border: 1px solid rgba(${rgb(tc)},0.52);
  color: ${o.textColor};
}
step-flow[data-sfid="${id}"] .sf-popover::before {
  border-right: 8px solid rgba(${rgb(tc)},0.52);
}
step-flow[data-sfid="${id}"] .sf-pop-title {
  color: rgba(${rgb(tc)},0.95);
  border-bottom-color: rgba(${rgb(tc)},0.2);
  font-size: ${o.fontLabel};
}
step-flow[data-sfid="${id}"] .sf-pop-body {
  font-size: calc(${o.fontBody} * 0.82);
  color: ${o.textColor};
}

/* 分支按鈕 A */
step-flow[data-sfid="${id}"] .sf-btn-a {
  background: rgba(${rgb(aHex)},0.84);
  color: #fff;
  font-size: ${o.fontBtn};
}
step-flow[data-sfid="${id}"] .sf-btn-a:not(:disabled):hover {
  background: rgba(${rgb(aHex)},0.97);
  color: ${C.bg};
  transform: translateY(-2px);
}
/* 分支按鈕 B */
step-flow[data-sfid="${id}"] .sf-btn-b {
  background: rgba(${rgb(bHex)},0.84);
  color: #fff;
  font-size: ${o.fontBtn};
}
step-flow[data-sfid="${id}"] .sf-btn-b:not(:disabled):hover {
  background: rgba(${rgb(bHex)},0.97);
  color: ${C.bg};
  transform: translateY(-2px);
}
step-flow[data-sfid="${id}"] .sf-btn.sf-selected {
  outline: 2.5px solid ${tc};
}
/* Pill 完成按鈕 */
step-flow[data-sfid="${id}"] .sf-pill {
  color: ${tc};
  border: 2px solid rgba(${rgb(tc)},0.84);
  font-size: ${o.fontPill};
}
step-flow[data-sfid="${id}"] .sf-pill:hover {
  background: rgba(${rgb(tc)},0.13);
}
/* 重設按鈕 */
step-flow[data-sfid="${id}"] .sf-reset {
  color: rgba(${rgb(o.textColor)},0.78);
  border: 1.5px solid rgba(${rgb(o.textColor)},0.38);
  font-size: ${o.fontPill};
}
step-flow[data-sfid="${id}"] .sf-reset:hover {
  background: rgba(${rgb(o.textColor)},0.08);
  color: ${o.textColor};
  border-color: rgba(${rgb(o.textColor)},0.65);
}
      `;
    }

    _wrap(step, num, opts) {
      const flowItem = step.querySelector(':scope > flow-item');
      let innerHTML, itemWidth, itemBorder, extraInfo, extraTitle;

      let extraTabWidth;
      if (flowItem) {
        innerHTML     = flowItem.innerHTML.trim();
        itemWidth     = flowItem.getAttribute('width')              || null;
        extraInfo     = flowItem.getAttribute('extra-info')         || null;
        extraTitle    = flowItem.getAttribute('extra-info-title')   || null;
        extraTabWidth = flowItem.getAttribute('extra-tab-width')    || '16px';
        const rawB    = flowItem.getAttribute('border')             || null;
        itemBorder    = rawB ? completeBorder(rawB, opts.themeHex) : null;
      } else {
        innerHTML     = step.innerHTML.trim();
        itemWidth     = itemBorder = extraInfo = extraTitle = null;
        extraTabWidth = '16px';
      }

      /* flow-step 屬性 */
      const btnA      = step.getAttribute('btn-a');
      const btnB      = step.getAttribute('btn-b');
      const single    = step.getAttribute('single-btn');
      const targetA   = step.getAttribute('target-a') || '';
      const targetB   = step.getAttribute('target-b') || '';
      const finBtn    = step.getAttribute('finish-btn');
      const finTarget = step.getAttribute('finish-target') || '';
      const isFinish  = !!finBtn;

      /* 選擇按鈕 */
      let choicesHTML = '';
      if (!isFinish) {
        const btns = [];
        const labelA = btnA || single;
        if (labelA) btns.push(`<button class="sf-btn sf-btn-a" data-t="${targetA}">${labelA}</button>`);
        if (btnB)   btns.push(`<button class="sf-btn sf-btn-b" data-t="${targetB}">${btnB}</button>`);
        if (btns.length) choicesHTML = `<div class="sf-choices">${btns.join('')}</div>`;
      }

      /* 終點按鈕 */
      let finishHTML = '';
      if (isFinish) {
        const finishBtn = opts.showFinish
          ? `<button class="sf-pill" data-ft="${finTarget}">${finBtn}</button>` : '';
        const resetBtn = opts.showReset
          ? `<button class="sf-reset">${opts.resetLabel}</button>` : '';
        if (finishBtn || resetBtn) {
          finishHTML = `<div class="sf-finish">${resetBtn}${finishBtn}</div>`;
        }
      }

      /* 卡片 inline style（flow-item width 覆蓋） */
      const cardStyles = [];
      if (itemWidth)  cardStyles.push(`max-width:${itemWidth};width:${itemWidth}`);
      if (itemBorder) cardStyles.push(`border:${itemBorder}`);
      const cardStyleAttr = cardStyles.length ? ` style="${cardStyles.join(';')}"` : '';

      /* ── 右側色帶 + popover HTML ── */
      let extraTabHTML = '';
      if (extraInfo) {
        const titleHTML = extraTitle
          ? `<div class="sf-pop-title">${extraTitle}</div>` : '';
        const tabStyle = `flex:0 0 ${extraTabWidth};width:${extraTabWidth}`;
        extraTabHTML = `
          <div class="sf-extra-tab" role="button" tabindex="0"
               style="${tabStyle}"
               aria-label="${extraTitle || '額外資訊'}" aria-expanded="false">
            <span class="sf-extra-tab-icon">INFO</span>
            <div class="sf-popover" role="tooltip">
              ${titleHTML}
              <div class="sf-pop-body">${extraInfo}</div>
            </div>
          </div>`;
      }

      /* 步驟標籤 class */
      const labelClass = `sf-label${opts.showStepLabel ? ' sf-label-on' : ''}`;

      /* ── 寫入 DOM ── */
      step.innerHTML = `
        <div class="sf-card"${cardStyleAttr}>
          <div class="sf-card-main">
            <span class="${labelClass}">步驟 ${num}</span>
            <div class="sf-body">${innerHTML}</div>
            ${choicesHTML}
            ${finishHTML}
          </div>
          ${extraTabHTML}
        </div>
        <div class="sf-arrow">${arrowSVG(opts.themeHex)}</div>
      `;

      /* ── 事件：extra-tab popover ── */
      if (extraInfo) {
        const tab     = step.querySelector('.sf-extra-tab');
        const popover = step.querySelector('.sf-popover');

        /* 顯示 / 隱藏輔助 */
        const show = () => {
          popover.classList.add('sf-pop-visible');
          tab.setAttribute('aria-expanded', 'true');
          /* 邊界偵測：若右側空間不夠，改到左側 */
          const rect = popover.getBoundingClientRect();
          if (rect.right > window.innerWidth - 16) {
            popover.style.left   = 'auto';
            popover.style.right  = 'calc(100% + 10px)';
            popover.style.setProperty('--sf-pop-arrow-side', 'right');
          } else {
            popover.style.left  = 'calc(100% + 10px)';
            popover.style.right = 'auto';
          }
        };
        const hide = () => {
          popover.classList.remove('sf-pop-visible');
          tab.setAttribute('aria-expanded', 'false');
        };
        const toggle = () => popover.classList.contains('sf-pop-visible') ? hide() : show();

        /* 桌面：hover */
        tab.addEventListener('mouseenter', show);
        tab.addEventListener('mouseleave', e => {
          /* 若移到 popover 上則不隱藏 */
          if (!popover.contains(e.relatedTarget)) hide();
        });
        popover.addEventListener('mouseleave', e => {
          if (!tab.contains(e.relatedTarget)) hide();
        });

        /* 行動裝置 / 鍵盤：click / Enter */
        tab.addEventListener('click', toggle);
        tab.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
          if (e.key === 'Escape') hide();
        });

        /* 點擊 popover 外部關閉 */
        document.addEventListener('click', e => {
          if (!tab.contains(e.target) && !popover.contains(e.target)) hide();
        }, true);
      }

      /* ── 事件：分支按鈕 ── */
      step.querySelectorAll('.sf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tid = btn.dataset.t;
          step.querySelectorAll('.sf-btn').forEach(b => { b.disabled = true; });
          btn.classList.add('sf-selected');

          const arrow = step.querySelector('.sf-arrow');
          if (arrow) arrow.classList.add('sf-show');

          if (tid) {
            const target = this.querySelector(`#${tid}`);
            if (target) {
              setTimeout(() => {
                target.classList.add('sf-on');
                target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }, 160);
            }
          }
        });
      });

      /* ── 事件：完成 pill ── */
      const pill = step.querySelector('.sf-pill');
      if (pill) {
        pill.addEventListener('click', () => {
          const ft = pill.dataset.ft;
          if (!ft) return;
          const dest = document.getElementById(ft);
          if (!dest) return;
          if (getComputedStyle(dest).display === 'none') dest.style.display = 'block';
          dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
          dest.style.outline = `2.5px solid ${opts.themeHex}`;
          setTimeout(() => { dest.style.outline = ''; }, 2400);
        });
      }

      /* ── 事件：重設 ── */
      const resetBtn = step.querySelector('.sf-reset');
      if (resetBtn) resetBtn.addEventListener('click', () => this._reset());
    }

    _reset() {
      const steps = Array.from(this.querySelectorAll(':scope > flow-step'));
      steps.forEach(step => {
        step.classList.remove('sf-on');
        step.querySelectorAll('.sf-btn').forEach(b => {
          b.disabled = false;
          b.classList.remove('sf-selected');
        });
        const arrow = step.querySelector('.sf-arrow');
        if (arrow) arrow.classList.remove('sf-show');
        /* 關閉任何開啟中的 popover */
        step.querySelectorAll('.sf-popover').forEach(p => p.classList.remove('sf-pop-visible'));
      });
      if (steps[0]) {
        steps[0].classList.add('sf-on');
        steps[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  if (!customElements.get('step-flow')) {
    customElements.define('step-flow', StepFlow);
  }

})();
