(function () {
  'use strict';
  const BRAND = {
    bg:       '#0C0D0C',
    shell:    '#C6C7BD',
    lavender: '#C3A5E5',
    sky:      '#95C9DE',
    warning:  '#E6374B',
    salmon:   '#E5C3B3',
    ocean:    '#1CCAE8',
    safe:     '#299459',
    teal:     '#0DA591',
    vanilla:  '#DBEDD8',
    yellow:   '#E3D322',
    focus:    '#3C7BCF',
    info:     '#2351DB',
    indigo:   '#7849C9',
    pink:     '#FF91D7',
    orange:   '#EDA109',
    special:  '#B3DE73',
  };

  const THEMES = {
    // 冷色系 → done 用 safe（清晰綠，與藍/紫拉開距離）
    lavender: { color: BRAND.lavender, colorActive: BRAND.special,  colorDone: BRAND.safe,   titleColor: BRAND.lavender, badgeBg: 'rgba(195,165,229,0.15)'  },
    sky:      { color: BRAND.sky,      colorActive: BRAND.info,     colorDone: BRAND.safe,   titleColor: BRAND.sky,      badgeBg: 'rgba(149,201,222,0.12)'  },
    info:     { color: BRAND.info,     colorActive: BRAND.indigo,   colorDone: BRAND.safe,   titleColor: BRAND.info,     badgeBg: 'rgba(35,81,219,0.12)'    },
    indigo:   { color: BRAND.indigo,   colorActive: BRAND.lavender, colorDone: BRAND.teal,   titleColor: BRAND.indigo,   badgeBg: 'rgba(120,73,201,0.12)'   },
    // 青/綠系 → done 互補（safe↔teal 交叉，兩者都是綠系但色調不同）
    ocean:    { color: BRAND.ocean,    colorActive: BRAND.info,     colorDone: BRAND.safe,   titleColor: BRAND.ocean,    badgeBg: 'rgba(28,202,232,0.12)'   },
    teal:     { color: BRAND.teal,     colorActive: BRAND.ocean,    colorDone: BRAND.safe,   titleColor: BRAND.teal,     badgeBg: 'rgba(13,165,145,0.12)'   },
    safe:     { color: BRAND.safe,     colorActive: BRAND.yellow,   colorDone: BRAND.teal,   titleColor: BRAND.safe,     badgeBg: 'rgba(41,148,89,0.12)'    },
    // 暖色系 → done 用 teal（藍綠，跳脫暖色氛圍，明確標示完成）
    yellow:   { color: BRAND.yellow,   colorActive: BRAND.orange,   colorDone: BRAND.teal,   titleColor: BRAND.yellow,   badgeBg: 'rgba(227,211,34,0.12)'   },
    orange:   { color: BRAND.orange,   colorActive: BRAND.yellow,   colorDone: BRAND.teal,   titleColor: BRAND.orange,   badgeBg: 'rgba(237,161,9,0.12)'    },
    focus:    { color: BRAND.focus,    colorActive: BRAND.special,  colorDone: BRAND.teal,   titleColor: BRAND.focus,    badgeBg: 'rgba(60,123,207,0.12)'   },
    special:  { color: BRAND.special,  colorActive: BRAND.yellow,   colorDone: BRAND.teal,   titleColor: BRAND.special,  badgeBg: 'rgba(179,222,115,0.12)'  },
    // 粉/暖中性 → done 用 teal
    pink:     { color: BRAND.pink,     colorActive: BRAND.lavender, colorDone: BRAND.teal,   titleColor: BRAND.pink,     badgeBg: 'rgba(255,145,215,0.12)'  },
    salmon:   { color: BRAND.salmon,   colorActive: BRAND.pink,     colorDone: BRAND.teal,   titleColor: BRAND.salmon,   badgeBg: 'rgba(229,195,179,0.12)'  },
    warning:  { color: BRAND.warning,  colorActive: BRAND.orange,   colorDone: BRAND.salmon, titleColor: BRAND.warning,  badgeBg: 'rgba(230,55,75,0.12)'    },
    // 中性 → done 用 safe（清晰對比）
    shell:    { color: BRAND.shell,    colorActive: BRAND.info,     colorDone: BRAND.safe,   titleColor: BRAND.shell,    badgeBg: 'rgba(198,199,189,0.13)'  },
    vanilla:  { color: BRAND.vanilla,  colorActive: BRAND.focus,    colorDone: BRAND.teal,   titleColor: BRAND.vanilla,  badgeBg: 'rgba(219,237,216,0.12)'  },
  };

  const defaults = {
    color:               BRAND.lavender,
    colorActive:         BRAND.special,
    colorDone:           BRAND.safe,
    colorError:          BRAND.warning,
    textColor:           BRAND.shell,
    titleColor:          BRAND.lavender,
    badgeBg:             'rgba(195,165,229,0.15)',
    cardBg:              'rgba(12,13,12,0.55)',
    cardBgActive:        'rgba(179,222,115,0.07)',
    cardBgDone:          'rgba(41,148,89,0.07)',
    cardBgError:         'rgba(230,55,75,0.07)',
    stroke:              '2px',
    radius:              '12px',
    cardWidth:           '220px',
    cardPadding:         '8px',
    gap:                 '36px',
    badgeSize:           '28px',
    fontSize:            '0.9rem',
    titleSize:           '1rem',
    badgeFontSize:       '0.82rem',
    connectorStyle:      'solid',
    arrowSize:           '6px',
    arrowMinLen:         '0px',
    padTop:              '8px',
    padBottom:           '8px',
    padX:                '8px',
    connectorLabelColor: BRAND.shell,
    theme:               null,
    autoNumber:          true,
    // ── progress 模式推進按鈕 ──────────────────────────────────────────────────
    //   progressIcon     : 圖示內容（HTML 字串 / emoji）；空字串 = 不顯示圖示
    //   progressText     : 文字標籤；空字串 = 不顯示文字
    //   progressDoneIcon : 最後一步的圖示覆寫；空字串 = 沿用 progressIcon
    //   progressDoneText : 最後一步的文字覆寫；空字串 = 沿用 progressText
    //   progBtnSize      : 按鈕高度（圖示模式同時為寬度）
    progressIcon:     '&#8250;',  // ›
    progressText:     '',
    progressDoneIcon: '',
    progressDoneText: '',
    progressIconClass:     '',   // e.g. "bi bi-arrow-right"（優先於 progressIcon）
    progressDoneIconClass: '',   // e.g. "bi bi-check-circle-fill"
    //   progressHideLast : true = 最後一步不注入完成按鈕（當流程結尾不需按鈕觸發時使用）
    //                      個別步驟可在 bp-step 加 data-no-btn 達到同樣效果
    progressHideLast: false,
    progBtnSize:      '28px',
    uiTitleGap:       '8px',    // ui-title 與元件之間的間距（獨立於 data-gap）
    // ── compact-header 模式：badge + icon + title 排成一行 ────────────────────
    //   compactHeader : true = 啟用；可在 bp-step 層級以 data-compact-header="false" 個別關閉
    //   headerPadY    : header 行的上下 padding（預設 2px；比 card padding 小，視覺更緊湊）
    //   headerGap     : badge / icon / title 三者之間的水平間距
    compactHeader: false,
    headerPadY:    '2px',
    headerGap:     '6px',
    // ── bp-step-content 透明度控制 ────────────────────────────────────────────
    //   contentOpacity     : 一般 / active 狀態的透明度（預設 0.9）
    //   contentOpacityDone : done 狀態的透明度（預設 0.65）；未設定時沿用 contentOpacity
    contentOpacity:     '0.9',
    contentOpacityDone: '0.65',
  };
function buildCSS() {
    return `
/* ── ui-title：標題嵌入元件內部，緊貼步驟上方 ─────────────────── */
.bps-ui-title {
  display:        block;
  width:          100%;
  font-size:      var(--bps-ui-title-fs, 1.1rem);
  font-weight:    700;
  color:          var(--bps-color);
  line-height:    1.3;
  padding-bottom: var(--bps-ui-title-pb, 3px);
  margin-bottom:  var(--bps-ui-title-gap, 8px);  /* 獨立控制標題到步驟的距離 */
  flex:           0 0 100%;   /* 水平 flex-wrap 模式：獨佔第一行 */
  order:          -1;
  align-self:     flex-start;
  box-sizing:     border-box;
}

/* 水平模式：允許換行讓標題佔第一行，步驟在第二行
   row-gap 設為 0，標題到步驟的間距完全由 .bps-ui-title 的 margin-bottom 決定
   與 data-gap（column-gap）完全脫鉤                                         */
bp-stepper[data-has-title]:not([data-layout="vertical"]) {
  flex-wrap:     wrap;
  align-content: flex-start;
  row-gap:       0;
}
/* 確保步驟不因為 flex-wrap 意外換行（每個步驟各自維持定寬） */
bp-stepper[data-has-title]:not([data-layout="vertical"]) > bp-step {
  flex-shrink: 0;
}

/* 垂直模式：flex gap 無法分行設定，用補償 margin 抵銷 --bps-effective-gap
   最終間距 = --bps-effective-gap + (--bps-ui-title-gap - --bps-effective-gap)
            = --bps-ui-title-gap（獨立生效，與 data-gap 脫鉤）               */
bp-stepper[data-layout="vertical"][data-has-title] .bps-ui-title {
  margin-bottom: calc(var(--bps-ui-title-gap, 8px) - var(--bps-effective-gap));
}

bp-stepper {
  display: flex;
  overflow-x: auto;
  align-items: stretch;
  gap: var(--bps-effective-gap);
  padding-top:    var(--bps-pad-top);
  padding-bottom: var(--bps-pad-bottom);
  padding-left:   var(--bps-pad-x);
  padding-right:  var(--bps-pad-x);
  scrollbar-width: thin;
  scrollbar-color: var(--bps-color) rgba(255,255,255,0.05);
  box-sizing: border-box;
  --bps-pad-top:               8px;
  --bps-pad-bottom:            8px;
  --bps-pad-x:                 10px;
  --bps-color:                 ${BRAND.lavender};
  --bps-color-active:          ${BRAND.special};
  --bps-color-done:            ${BRAND.safe};
  --bps-color-error:           ${BRAND.warning};
  --bps-text:                  ${BRAND.shell};
  --bps-title:                 ${BRAND.lavender};
  --bps-badge-bg:              rgba(195,165,229,0.15);
  --bps-card-bg:               rgba(12,13,12,0.55);
  --bps-card-bg-act:           rgba(179,222,115,0.07);
  --bps-card-bg-done:          rgba(41,148,89,0.07);
  --bps-card-bg-err:           rgba(230,55,75,0.07);
  --bps-stroke:                2px;
  --bps-radius:                8px;
  --bps-width:                 300px;
  --bps-padding:               8px;
  --bps-gap:                   36px;
  --bps-arrow-min-len:         0px;
  --bps-effective-gap:         max(var(--bps-gap), var(--bps-arrow-min-len));
  --bps-badge-sz:              28px;
  --bps-fs:                    0.9rem;
  --bps-title-fs:              1rem;
  --bps-badge-fs:              0.82rem;
  --bps-arrow:                 9px;
  --bps-connector-label-color: ${BRAND.sky};
  --bps-prog-btn-sz:           28px;
  --bps-ui-title-gap:          8px;
  --bps-content-opacity:       0.9;
  --bps-content-opacity-done:  0.65;
}

bp-stepper[data-wrapped] {
  display: block;
  overflow-x: visible;
  overflow-y: visible;
  width: 100%;
}

/* ── data-fill：水平模式卡片允許伸展，填滿 stepper 剩餘空間 ── */
bp-stepper[data-fill] > bp-step,
bp-stepper[data-fill] .bps-row > bp-step {
  flex: 1 0 var(--bps-width);
}

.bps-row {
  display: flex;
  align-items: stretch;
  gap: var(--bps-effective-gap);
}

.bps-row + .bps-row {
  margin-top: 0;
}

.bps-u-turn {
  height: var(--bps-effective-gap);
  border-right:  var(--bps-stroke) solid var(--bps-connector-color, var(--bps-color));
  border-bottom: var(--bps-stroke) solid var(--bps-connector-color, var(--bps-color));
  box-sizing: border-box;
  transition: border-color .28s;
}

.bps-last-in-row::after {
  content: '';
  position: absolute;
  right:    calc(-1 * var(--bps-stroke) / 2);
  top:      50%;
  width:    var(--bps-stroke);
  height:   calc(50% + 1px);
  background: var(--bps-connector-color, var(--bps-color));
  transform: none;
  z-index:  2;
  transition: background .28s;
}

.bps-entry-line {
  position:   absolute;
  left:       calc(-1 * var(--bps-stroke) / 2);
  top:        0;
  width:      var(--bps-stroke);
  height:     50%;
  background: var(--bps-connector-color, var(--bps-color));
  pointer-events: none;
  z-index:    2;
  transition: background .28s;
}

bp-step {
  flex: 0 0 var(--bps-width);
  border: var(--bps-stroke) solid var(--bps-color);
  border-radius: var(--bps-radius);
  padding: var(--bps-padding);
  position: relative;
  background: var(--bps-card-bg);
  color: var(--bps-text);
  font-size: var(--bps-fs);
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color .28s, background .28s, box-shadow .28s, transform .18s;
  box-sizing: border-box;
}

bp-step[data-state="active"] {
  border-color: var(--bps-color-active);
  background:   var(--bps-card-bg-act);
  box-shadow:   0 0 16px -5px var(--bps-color-active);
}
bp-step[data-state="active"] .bp-step-badge {
  background:   var(--bps-color-active);
  border-color: var(--bps-color-active);
  color:        #0C0D0C;
}
bp-step[data-state="active"] bp-step-title { color: var(--bps-color-active); }

bp-step[data-state="done"] {
  border-color: var(--bps-color-done);
  background:   var(--bps-card-bg-done);
}
bp-step[data-state="done"] .bp-step-badge {
  background:   var(--bps-color-done);
  border-color: var(--bps-color-done);
  color:        #0C0D0C;
}
bp-step[data-state="done"] bp-step-title   { color: var(--bps-color-done); }
bp-step[data-state="done"] bp-step-content { opacity: var(--bps-content-opacity-done, var(--bps-content-opacity, 0.65)); }

bp-step[data-state="error"] {
  border-color: var(--bps-color-error);
  background:   var(--bps-card-bg-err);
  box-shadow:   0 0 14px -5px var(--bps-color-error);
}
bp-step[data-state="error"] .bp-step-badge {
  background:   var(--bps-color-error);
  border-color: var(--bps-color-error);
  color:        #0C0D0C;
}
bp-step[data-state="error"] bp-step-title { color: var(--bps-color-error); }

.bp-step-badge {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  width:           var(--bps-badge-sz);
  height:          var(--bps-badge-sz);
  border-radius:   50%;
  border:          var(--bps-stroke) solid var(--bps-color);
  background:      var(--bps-badge-bg);
  font-size:       var(--bps-badge-fs);
  font-weight:     700;
  color:           var(--bps-color);
  flex-shrink:     0;
  margin-bottom:   3px;
  transition:      background .28s, color .28s, border-color .28s;
}

bp-step-title {
  display:     block;
  font-size:   var(--bps-title-fs);
  font-weight: 600;
  color:       var(--bps-title);
  transition:  color .28s;
}

bp-step-content {
  display:     block;
  font-size:   var(--bps-fs);
  color:       var(--bps-text);
  opacity:     var(--bps-content-opacity, 0.9);
  line-height: 1.3;
  transition:  opacity .28s;
}

.bp-step-icon {
  font-size:     1.4rem;
  line-height:   1.1;
  margin-bottom: 3px;
  user-select:   none;
}

bp-step:not(:last-child)::after {
  content:          '';
  position:         absolute;
  /* right 補上 stroke：top/bottom 定位基準是 padding-box，
     比 border-box 少一個 stroke；補上後線段剛好接到下一張卡的邊框 */
  right:            calc(-1 * (var(--bps-effective-gap) + var(--bps-stroke)));
  top:              50%;
  width:            var(--bps-effective-gap);
  height:           var(--bps-stroke);
  background-color: var(--bps-color);
  transform:        translateY(-50%);
  z-index:          2;
  transition:       background-color .28s;
}
bp-step:not(:last-child)::before {
  content:       '';
  position:      absolute;
  right:         calc(-1 * (var(--bps-effective-gap) + var(--bps-stroke)));
  top:           50%;
  transform:     translateY(-50%);
  border-left:   calc(var(--bps-arrow) * 1.5) solid var(--bps-color);
  border-top:    var(--bps-arrow) solid transparent;
  border-bottom: var(--bps-arrow) solid transparent;
  z-index:       3;
  transition:    border-left-color .28s;
}

bp-step[data-state="done"]:not(:last-child)::after    { background-color:  var(--bps-color-done);   }
bp-step[data-state="done"]:not(:last-child)::before   { border-left-color: var(--bps-color-done);   }
bp-step[data-state="active"]:not(:last-child)::after  { background-color:  var(--bps-color-active); }
bp-step[data-state="active"]:not(:last-child)::before { border-left-color: var(--bps-color-active); }
bp-step[data-state="error"]:not(:last-child)::after   { background-color:  var(--bps-color-error);  }
bp-step[data-state="error"]:not(:last-child)::before  { border-left-color: var(--bps-color-error);  }

/* ── solid（明確宣告，確保直線可見）────────────────────────────── */
bp-stepper[data-connector="solid"] > bp-step:not(:last-child)::after,
bp-stepper[data-connector="solid"] .bps-row > bp-step:not(:last-child)::after {
  background: var(--bps-color);
}
bp-stepper[data-connector="solid"] > bp-step[data-state="done"]:not(:last-child)::after,
bp-stepper[data-connector="solid"] .bps-row > bp-step[data-state="done"]:not(:last-child)::after {
  background: var(--bps-color-done);
}
bp-stepper[data-connector="solid"] > bp-step[data-state="active"]:not(:last-child)::after,
bp-stepper[data-connector="solid"] .bps-row > bp-step[data-state="active"]:not(:last-child)::after {
  background: var(--bps-color-active);
}
bp-stepper[data-connector="solid"] > bp-step[data-state="error"]:not(:last-child)::after,
bp-stepper[data-connector="solid"] .bps-row > bp-step[data-state="error"]:not(:last-child)::after {
  background: var(--bps-color-error);
}
bp-stepper[data-connector="solid"] .bps-u-turn {
  border-right-style:  solid;
  border-bottom-style: solid;
}

/* ── dashed ────────────────────────────────────────────────────── */
bp-stepper[data-connector="dashed"] > bp-step:not(:last-child)::after,
bp-stepper[data-connector="dashed"] .bps-row > bp-step:not(:last-child)::after {
  background: repeating-linear-gradient(to right, var(--bps-color) 0, var(--bps-color) 6px, transparent 6px, transparent 13px);
}
bp-stepper[data-connector="dashed"] > bp-step[data-state="done"]:not(:last-child)::after,
bp-stepper[data-connector="dashed"] .bps-row > bp-step[data-state="done"]:not(:last-child)::after {
  background: repeating-linear-gradient(to right, var(--bps-color-done) 0, var(--bps-color-done) 6px, transparent 6px, transparent 13px);
}
bp-stepper[data-connector="dashed"] > bp-step[data-state="active"]:not(:last-child)::after,
bp-stepper[data-connector="dashed"] .bps-row > bp-step[data-state="active"]:not(:last-child)::after {
  background: repeating-linear-gradient(to right, var(--bps-color-active) 0, var(--bps-color-active) 6px, transparent 6px, transparent 13px);
}
bp-stepper[data-connector="dashed"] > bp-step[data-state="error"]:not(:last-child)::after,
bp-stepper[data-connector="dashed"] .bps-row > bp-step[data-state="error"]:not(:last-child)::after {
  background: repeating-linear-gradient(to right, var(--bps-color-error) 0, var(--bps-color-error) 6px, transparent 6px, transparent 13px);
}
bp-stepper[data-connector="dashed"] .bps-u-turn {
  border-right-style:  dashed;
  border-bottom-style: dashed;
  border-left-style:   dashed;
}

bp-stepper[data-connector="dotted"] > bp-step:not(:last-child)::after,
bp-stepper[data-connector="dotted"] .bps-row > bp-step:not(:last-child)::after {
  background: repeating-linear-gradient(to right, var(--bps-color) 0, var(--bps-color) 3px, transparent 3px, transparent 8px);
}
bp-stepper[data-connector="dotted"] > bp-step[data-state="done"]:not(:last-child)::after,
bp-stepper[data-connector="dotted"] .bps-row > bp-step[data-state="done"]:not(:last-child)::after {
  background: repeating-linear-gradient(to right, var(--bps-color-done) 0, var(--bps-color-done) 3px, transparent 3px, transparent 8px);
}
bp-stepper[data-connector="dotted"] > bp-step[data-state="active"]:not(:last-child)::after,
bp-stepper[data-connector="dotted"] .bps-row > bp-step[data-state="active"]:not(:last-child)::after {
  background: repeating-linear-gradient(to right, var(--bps-color-active) 0, var(--bps-color-active) 3px, transparent 3px, transparent 8px);
}
bp-stepper[data-connector="dotted"] > bp-step[data-state="error"]:not(:last-child)::after,
bp-stepper[data-connector="dotted"] .bps-row > bp-step[data-state="error"]:not(:last-child)::after {
  background: repeating-linear-gradient(to right, var(--bps-color-error) 0, var(--bps-color-error) 3px, transparent 3px, transparent 8px);
}
bp-stepper[data-connector="dotted"] .bps-u-turn {
  border-right-style:  dotted;
  border-bottom-style: dotted;
  border-left-style:   dotted;
}

bp-stepper[data-layout="vertical"] {
  flex-direction: column;
  overflow-x:     visible;
  overflow-y:     auto;
  align-items:    flex-start;
  width:          100%;
}
bp-stepper[data-layout="vertical"] > bp-step {
  flex:      0 0 auto;
  width:     var(--bps-vert-width, 100%);
  min-width: 180px;
}

bp-stepper[data-layout="vertical"] > bp-step:not(:last-child)::after {
  right:            auto;
  left:             calc(var(--bps-badge-sz) / 2 - var(--bps-stroke) / 2);
  top:              100%;
  width:            var(--bps-stroke);
  height:           var(--bps-effective-gap);
  transform:        none;
  background-color: var(--bps-color);
}
bp-stepper[data-layout="vertical"] > bp-step[data-state="done"]:not(:last-child)::after   { background-color: var(--bps-color-done);   }
bp-stepper[data-layout="vertical"] > bp-step[data-state="active"]:not(:last-child)::after { background-color: var(--bps-color-active); }
bp-stepper[data-layout="vertical"] > bp-step[data-state="error"]:not(:last-child)::after  { background-color: var(--bps-color-error);  }

bp-stepper[data-layout="vertical"] > bp-step:not(:last-child)::before {
  right:         auto;
  left:          calc(var(--bps-badge-sz) / 2 - var(--bps-arrow));
  top:           auto;
  bottom:        calc(-1 * var(--bps-effective-gap));
  transform:     none;
  border-left:   var(--bps-arrow) solid transparent;
  border-right:  var(--bps-arrow) solid transparent;
  border-top:    calc(var(--bps-arrow) * 1.5) solid var(--bps-color);
  border-bottom: none;
}
bp-stepper[data-layout="vertical"] > bp-step[data-state="done"]:not(:last-child)::before   { border-top-color: var(--bps-color-done);   }
bp-stepper[data-layout="vertical"] > bp-step[data-state="active"]:not(:last-child)::before { border-top-color: var(--bps-color-active); }
bp-stepper[data-layout="vertical"] > bp-step[data-state="error"]:not(:last-child)::before  { border-top-color: var(--bps-color-error);  }

/* ── 垂直 solid ──────────────────────────────────────────────── */
bp-stepper[data-layout="vertical"][data-connector="solid"] > bp-step:not(:last-child)::after {
  background: var(--bps-color);
}
bp-stepper[data-layout="vertical"][data-connector="solid"] > bp-step[data-state="done"]:not(:last-child)::after {
  background: var(--bps-color-done);
}
bp-stepper[data-layout="vertical"][data-connector="solid"] > bp-step[data-state="active"]:not(:last-child)::after {
  background: var(--bps-color-active);
}
bp-stepper[data-layout="vertical"][data-connector="solid"] > bp-step[data-state="error"]:not(:last-child)::after {
  background: var(--bps-color-error);
}

bp-stepper[data-layout="vertical"][data-connector="dashed"] > bp-step:not(:last-child)::after {
  background: repeating-linear-gradient(to bottom, var(--bps-color) 0, var(--bps-color) 6px, transparent 6px, transparent 13px);
}
bp-stepper[data-layout="vertical"][data-connector="dashed"] > bp-step[data-state="done"]:not(:last-child)::after {
  background: repeating-linear-gradient(to bottom, var(--bps-color-done) 0, var(--bps-color-done) 6px, transparent 6px, transparent 13px);
}
bp-stepper[data-layout="vertical"][data-connector="dashed"] > bp-step[data-state="active"]:not(:last-child)::after {
  background: repeating-linear-gradient(to bottom, var(--bps-color-active) 0, var(--bps-color-active) 6px, transparent 6px, transparent 13px);
}
bp-stepper[data-layout="vertical"][data-connector="dashed"] > bp-step[data-state="error"]:not(:last-child)::after {
  background: repeating-linear-gradient(to bottom, var(--bps-color-error) 0, var(--bps-color-error) 6px, transparent 6px, transparent 13px);
}

bp-stepper[data-layout="vertical"][data-connector="dotted"] > bp-step:not(:last-child)::after {
  background: repeating-linear-gradient(to bottom, var(--bps-color) 0, var(--bps-color) 3px, transparent 3px, transparent 8px);
}
bp-stepper[data-layout="vertical"][data-connector="dotted"] > bp-step[data-state="done"]:not(:last-child)::after {
  background: repeating-linear-gradient(to bottom, var(--bps-color-done) 0, var(--bps-color-done) 3px, transparent 3px, transparent 8px);
}
bp-stepper[data-layout="vertical"][data-connector="dotted"] > bp-step[data-state="active"]:not(:last-child)::after {
  background: repeating-linear-gradient(to bottom, var(--bps-color-active) 0, var(--bps-color-active) 3px, transparent 3px, transparent 8px);
}
bp-stepper[data-layout="vertical"][data-connector="dotted"] > bp-step[data-state="error"]:not(:last-child)::after {
  background: repeating-linear-gradient(to bottom, var(--bps-color-error) 0, var(--bps-color-error) 3px, transparent 3px, transparent 8px);
}

bp-stepper[data-clickable="true"] > bp-step,
bp-stepper[data-clickable="true"] .bps-row > bp-step {
  cursor: pointer;
  user-select: none;
}
bp-stepper[data-clickable="true"] > bp-step:not([data-state="active"]):hover,
bp-stepper[data-clickable="true"] .bps-row > bp-step:not([data-state="active"]):hover {
  border-color: var(--bps-color);
  box-shadow:   0 0 12px -4px var(--bps-color);
  transform:    translateY(-2px);
}
bp-stepper[data-layout="vertical"][data-clickable="true"] > bp-step:not([data-state="active"]):hover {
  transform: translateX(3px);
}
bp-stepper[data-clickable="true"] > bp-step:focus-visible,
bp-stepper[data-clickable="true"] .bps-row > bp-step:focus-visible {
  outline:        2px solid var(--bps-color);
  outline-offset: 3px;
}

/* ── 連接器說明標籤 ───────────────────────────────────────────────────────── */
.bps-connector-label {
  display:        none;
  position:       absolute;
  font-size:      var(--bps-fs);
  color:          var(--bps-connector-label-color, var(--bps-text));
  white-space:    nowrap;
  pointer-events: none;
  z-index:        2;
  line-height:    1.3;
  transition:     color .28s, opacity .28s;
}

bp-stepper[data-layout="vertical"] > bp-step:not(:last-child) .bps-connector-label {
  display:   block;
  left:      calc(var(--bps-badge-sz) / 2 + 12px);
  top:       calc(100% + var(--bps-effective-gap) / 2);
  transform: translateY(-50%);
}

bp-stepper:not([data-layout="vertical"]) > bp-step:not(:last-child) .bps-connector-label {
  display:    block;
  left:       calc(100% + var(--bps-effective-gap) / 2);
  top:        50%;
  transform:  translate(-50%, calc(-100% - 5px));
  text-align: center;
}

/* ── progress 模式推進按鈕 ────────────────────────────────────────────────── */
/*   mode="progress" 或 data-mode="progress" 兩種寫法均支援                  */

bp-stepper[data-mode="progress"]      bp-step,
bp-stepper[mode="progress"]           bp-step,
bp-stepper[data-mode="progress-show"] bp-step,
bp-stepper[mode="progress-show"]      bp-step {
  padding-bottom: calc(var(--bps-prog-btn-sz, 28px) + 18px);
}

/* ── 按鈕基礎樣式（三種變體共用） ────────────────────────────────────────── */
.bps-prog-btn {
  position:         absolute;
  bottom:           10px;
  right:            10px;
  height:           var(--bps-prog-btn-sz, 28px);
  min-width:        var(--bps-prog-btn-sz, 28px);
  padding:          0 10px;
  border:           var(--bps-stroke) solid var(--bps-color);
  border-radius:    calc(var(--bps-prog-btn-sz, 28px) / 2);
  background:       var(--bps-badge-bg);
  color:            var(--bps-color);
  cursor:           pointer;
  display:          inline-flex;
  align-items:      center;
  justify-content:  center;
  gap:              5px;
  font-size:        var(--bps-badge-fs);
  font-weight:      700;
  white-space:      nowrap;
  box-sizing:       border-box;
  transition:       background .22s, color .22s, border-color .22s,
                    box-shadow .22s, transform .15s;
  z-index:          2;
  line-height:      1;
  user-select:      none;
}

/* 圖示模式：正圓形，無內距 */
.bps-prog-btn[data-variant="icon"] {
  width:         var(--bps-prog-btn-sz, 28px);
  min-width:     var(--bps-prog-btn-sz, 28px);
  padding:       0;
  border-radius: 50%;
  font-size:     calc(var(--bps-prog-btn-sz, 28px) * 0.55);
}

/* 文字模式：膠囊形，水平留白稍大 */
.bps-prog-btn[data-variant="text"] {
  padding: 0 14px;
}

/* 圖示＋文字模式：左右較小內距 */
.bps-prog-btn[data-variant="both"] {
  padding: 0 10px 0 8px;
}

.bps-prog-icon { line-height: 1; flex-shrink: 0; font-style: normal; }
.bps-prog-text { line-height: 1; }

/* icon font（Bootstrap Icons / Font Awesome 等）在按鈕內的尺寸修正 */
.bps-prog-btn i,
.bps-prog-btn [class^="bi"],
.bps-prog-btn [class*=" bi"] {
  font-size:      inherit;
  line-height:    1;
  vertical-align: middle;
  display:        inline-block;
}

/* ── progress-show 模式：未來步驟完全隱藏 ────────────────────────────────── */
bp-step[data-prog-hidden] {
  display: none;
}

/* 最後一個可見步驟不顯示指向隱藏步驟的連接線
   需要 :has() 支援（Chrome 105+, Safari 15.4+, Firefox 121+）*/
bp-step:not([data-prog-hidden]):has(+ bp-step[data-prog-hidden])::after,
bp-step:not([data-prog-hidden]):has(+ bp-step[data-prog-hidden])::before {
  display: none;
}

/* ── 揭示動畫 ────────────────────────────────────────────────────────────── */
@keyframes bps-reveal-h {
  from { opacity: 0; transform: translateX(30px) scale(0.94); }
  to   { opacity: 1; transform: translateX(0)    scale(1);    }
}
@keyframes bps-reveal-v {
  from { opacity: 0; transform: translateY(24px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}

/* 水平版型（預設）*/
bp-stepper:not([data-layout="vertical"]) bp-step.bps-revealing {
  animation: bps-reveal-h 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
}
/* 垂直版型 */
bp-stepper[data-layout="vertical"] bp-step.bps-revealing {
  animation: bps-reveal-v 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* hover / active 互動 */
.bps-prog-btn:hover {
  background: var(--bps-color);
  color:      #0C0D0C;
  box-shadow: 0 0 10px -2px var(--bps-color);
}
.bps-prog-btn:active { transform: scale(0.91); }

/* 狀態覆寫：active 步驟 */
bp-step[data-state="active"] .bps-prog-btn {
  border-color: var(--bps-color-active);
  color:        var(--bps-color-active);
}
bp-step[data-state="active"] .bps-prog-btn:hover {
  background:  var(--bps-color-active);
  color:       #0C0D0C;
  box-shadow:  0 0 10px -2px var(--bps-color-active);
}

/* 狀態覆寫：done 步驟（淡化，仍可點擊）*/
bp-step[data-state="done"] .bps-prog-btn {
  border-color: var(--bps-color-done);
  color:        var(--bps-color-done);
  opacity:      0.55;
}
bp-step[data-state="done"] .bps-prog-btn:hover {
  background:  var(--bps-color-done);
  color:       #0C0D0C;
  opacity:     1;
  box-shadow:  0 0 10px -2px var(--bps-color-done);
}

/* 狀態覆寫：error 步驟 */
bp-step[data-state="error"] .bps-prog-btn {
  border-color: var(--bps-color-error);
  color:        var(--bps-color-error);
}
bp-step[data-state="error"] .bps-prog-btn:hover {
  background:  var(--bps-color-error);
  color:       #0C0D0C;
  box-shadow:  0 0 10px -2px var(--bps-color-error);
}

/* ── compact-header 模式：badge + icon + title 單行排列 ─────────────────────
   觸發方式：
     bp-stepper 層級 → data-compact-header（套用全部步驟）
     bp-step    層級 → data-compact-header="false" 可個別關閉              */
.bps-step-header {
  display:        flex;
  flex-direction: row;
  align-items:    center;
  gap:            var(--bps-header-gap, 6px);
  padding-top:    var(--bps-header-pad-y, 2px);
  /* 為底部橫線預留空間：pad-y + 8px（線高 1px + 上下餘白） */
  padding-bottom: calc(var(--bps-header-pad-y, 2px) + 8px);
  position:       relative;
}

/* badge / icon 移入 header 後不需要原本的 margin-bottom */
.bps-step-header .bp-step-badge { margin-bottom: 0; }
.bps-step-header .bp-step-icon  { margin-bottom: 0; }

/* ── 若隱若現的橫線（漸層淡入淡出，兩端透明） ── */
.bps-step-header::after {
  content:        '';
  position:       absolute;
  bottom:         2px;          /* 在 padding-bottom 範圍內，懸浮於內容之上 */
  left:           0;
  right:          0;
  height:         1px;
  background:     linear-gradient(
    to right,
    transparent  0%,
    var(--bps-color) 20%,
    var(--bps-color) 80%,
    transparent 100%
  );
  opacity:        0.28;         /* 若隱若現 */
  pointer-events: none;
  transition:     opacity .28s, background .28s;
}

/* 各狀態顏色同步 */
bp-step[data-state="active"] .bps-step-header::after {
  background: linear-gradient(
    to right,
    transparent 0%, var(--bps-color-active) 20%,
    var(--bps-color-active) 80%, transparent 100%
  );
  opacity: 0.48;
}
bp-step[data-state="done"] .bps-step-header::after {
  background: linear-gradient(
    to right,
    transparent 0%, var(--bps-color-done) 20%,
    var(--bps-color-done) 80%, transparent 100%
  );
  opacity: 0.30;
}
bp-step[data-state="error"] .bps-step-header::after {
  background: linear-gradient(
    to right,
    transparent 0%, var(--bps-color-error) 20%,
    var(--bps-color-error) 80%, transparent 100%
  );
  opacity: 0.50;
}

/* ── show-ending 結尾區塊 ────────────────────────────────────────────────────
   初始化時由 initEl 加上 bps-ending-hidden 將目標 div 隱藏；
   最後一步按鈕點擊後移除隱藏並加上 bps-ending-reveal 播放進場動畫。
   resetStates() 呼叫後恢復隱藏狀態。                                        */
.bps-ending-hidden {
  display: none !important;
}
@keyframes bps-ending-in {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)     scale(1);    }
}
.bps-ending-reveal {
  animation: bps-ending-in 0.46s cubic-bezier(0.22, 1, 0.36, 1) both;
}
`;
  }

  // ─── 十六進位色碼 → {r,g,b} 整數（用於自動推算卡片背景）────────────────────────
  function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return null;
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
  }

  // ─── JS 屬性名稱 → CSS 變數名稱對照表 ──────────────────────────────────────────
  const DATA_MAP = {
    color:               '--bps-color',
    colorActive:         '--bps-color-active',
    colorDone:           '--bps-color-done',
    colorError:          '--bps-color-error',
    textColor:           '--bps-text',
    titleColor:          '--bps-title',
    badgeBg:             '--bps-badge-bg',
    cardBg:              '--bps-card-bg',
    cardBgActive:        '--bps-card-bg-act',
    cardBgDone:          '--bps-card-bg-done',
    cardBgError:         '--bps-card-bg-err',
    stroke:              '--bps-stroke',
    radius:              '--bps-radius',
    cardWidth:           '--bps-width',
    cardPadding:         '--bps-padding',
    gap:                 '--bps-gap',
    badgeSize:           '--bps-badge-sz',
    fontSize:            '--bps-fs',
    titleSize:           '--bps-title-fs',
    badgeFontSize:       '--bps-badge-fs',
    arrowSize:           '--bps-arrow',
    arrowMinLen:         '--bps-arrow-min-len',
    padTop:              '--bps-pad-top',
    padBottom:           '--bps-pad-bottom',
    padX:                '--bps-pad-x',
    connectorLabelColor: '--bps-connector-label-color',
    progBtnSize:         '--bps-prog-btn-sz',           // progress 按鈕尺寸
    uiTitleGap:          '--bps-ui-title-gap',          // ui-title 與元件的獨立間距
    headerPadY:          '--bps-header-pad-y',          // compact-header 行的上下 padding
    headerGap:           '--bps-header-gap',            // compact-header 行內的水平間距
    contentOpacity:      '--bps-content-opacity',       // bp-step-content 一般透明度
    contentOpacityDone:  '--bps-content-opacity-done',  // bp-step-content done 狀態透明度
  };

  // ─── 注入全域 CSS（僅執行一次）────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('bp-stepper-style')) return;
    const s = document.createElement('style');
    s.id = 'bp-stepper-style';
    s.textContent = buildCSS();
    document.head.appendChild(s);
  }

  // ─── 讀取 mode（data-mode="…" 與 mode="…" 兩種寫法均相容）───────────────────
  function getMode(el) {
    return el.dataset.mode || el.getAttribute('mode') || '';
  }

  // ─── 取得 stepper 內所有 bp-step 元素 ─────────────────────────────────────────
  function getSteps(el) {
    if (el.hasAttribute('data-wrapped')) {
      return el.querySelectorAll('.bps-row > bp-step');
    }
    return el.querySelectorAll(':scope > bp-step');
  }

  // ─── 同步換行連接器顏色（wrap 模式）──────────────────────────────────────────
  function syncWrapConnector(el) {
    if (!el.hasAttribute('data-wrapped')) return;
    const wrapN = parseInt(el.dataset.wrap, 10);
    const steps = getSteps(el);
    const pivot = steps[wrapN - 1];
    if (!pivot) return;
    const state = pivot.dataset.state;
    const colorVal = state === 'done'   ? 'var(--bps-color-done)'
                   : state === 'active' ? 'var(--bps-color-active)'
                   : state === 'error'  ? 'var(--bps-color-error)'
                   : null;
    if (colorVal) {
      el.style.setProperty('--bps-connector-color', colorVal);
    } else {
      el.style.removeProperty('--bps-connector-color');
    }
  }

  // ─── 處理 data-wrap 換行布局 ──────────────────────────────────────────────────
  function applyWrap(el) {
    const wrapN = parseInt(el.dataset.wrap, 10);
    if (!wrapN || wrapN < 1) return;
    const allSteps = [...el.querySelectorAll(':scope > bp-step')];
    if (allSteps.length <= wrapN) return;

    const row1Steps = allSteps.slice(0, wrapN);
    const row2Steps = allSteps.slice(wrapN);

    row1Steps[row1Steps.length - 1].classList.add('bps-last-in-row');

    const entryLine = document.createElement('span');
    entryLine.className = 'bps-entry-line';
    row2Steps[0].insertBefore(entryLine, row2Steps[0].firstChild);

    const row1 = document.createElement('div');
    row1.className = 'bps-row';
    row1Steps.forEach(s => row1.appendChild(s));

    const uTurn = document.createElement('div');
    uTurn.className = 'bps-u-turn';

    const row2 = document.createElement('div');
    row2.className = 'bps-row';
    row2Steps.forEach(s => row2.appendChild(s));

    el.appendChild(row1);
    el.appendChild(uTurn);
    el.appendChild(row2);
    el.setAttribute('data-wrapped', '');
    syncWrapConnector(el);
  }

  // ─── 注入 progress 推進按鈕 ───────────────────────────────────────────────────
  //  按鈕支援三種顯示模式，由 icon / text 是否有內容自動判斷：
  //    icon-only  → data-variant="icon"  → 正圓形，無文字
  //    text-only  → data-variant="text"  → 膠囊形，無圖示
  //    icon+text  → data-variant="both"  → 膠囊形，左圖示右文字
  //
  //  stepper 層級配置（data-* 屬性）：
  //    data-progress-icon      預設圖示（預設 ›）
  //    data-progress-text      文字標籤（預設空 = icon-only）
  //    data-progress-done-icon 最後一步圖示覆寫（預設空 = 沿用圖示）
  //    data-progress-done-text 最後一步文字覆寫（預設空 = 沿用文字）
  //    data-prog-btn-size      CSS 變數 --bps-prog-btn-sz（透過 DATA_MAP）
  //    data-progress-hide-last 存在即隱藏最後一步的完成按鈕（值為 "false" 時視為未設定）
  //                            適用於「最後一步已自帶操作」或「不需按鈕觸發完成」的情境
  //    data-show-ending="id"   最後一步按鈕點擊後顯示指定 id 的 div（淡入動畫）
  //                            initEl 初始化時會自動隱藏目標 div；resetStates 呼叫後恢復隱藏
  //
  //  bp-step 層級（逐步覆寫）：
  //    data-progress-icon, data-progress-text
  //    data-no-btn             存在即跳過該步驟的按鈕注入（可用於任意步驟，不限最後一步）
  // ────────────────────────────────────────────────────────────────────────────
  function injectProgressBtns(el, cfg) {
    const isShow = getMode(el) === 'progress-show';

    const pIcon = el.dataset.progressIcon !== undefined
      ? el.dataset.progressIcon : cfg.progressIcon;
    const pText = el.dataset.progressText !== undefined
      ? el.dataset.progressText : cfg.progressText;

    const pDoneIcon = el.dataset.progressDoneIcon !== undefined
      ? el.dataset.progressDoneIcon
      : (cfg.progressDoneIcon || pIcon);
    const pDoneText = el.dataset.progressDoneText !== undefined
      ? el.dataset.progressDoneText
      : (cfg.progressDoneText || pText);
    const pIconClass = el.dataset.progressIconClass !== undefined
      ? el.dataset.progressIconClass : cfg.progressIconClass;
    const pDoneIconClass = el.dataset.progressDoneIconClass !== undefined
      ? el.dataset.progressDoneIconClass
      : (cfg.progressDoneIconClass || pIconClass);

    function toIconHTML(icon, iconClass) {
      if (iconClass) return '<i class="' + iconClass + '" aria-hidden="true"></i>';
      return icon;
    }

    // ── 最後一步按鈕隱藏旗標 ─────────────────────────────────────────────────────
    //   data-progress-hide-last（屬性存在且值不為 "false"）→ hideLast = true
    //   未設定時回落至 cfg.progressHideLast（預設 false）
    const hideLast = el.dataset.progressHideLast !== undefined
      ? el.dataset.progressHideLast !== 'false'
      : Boolean(cfg.progressHideLast);

    const steps = getSteps(el);

    steps.forEach((step, i) => {
      if (step.querySelector('.bps-prog-btn')) return;
      const isLast = i === steps.length - 1;

      // ── 跳過條件 ────────────────────────────────────────────────────────────
      //   hideLast       → 最後一步整體隱藏
      //   data-no-btn    → 個別步驟隱藏（任意位置均可使用）
      if (isLast && hideLast) return;
      if (step.hasAttribute('data-no-btn')) return;

      const icon = step.dataset.progressIcon !== undefined
        ? step.dataset.progressIcon
        : (isLast ? pDoneIcon : pIcon);
      const text = step.dataset.progressText !== undefined
        ? step.dataset.progressText
        : (isLast ? pDoneText : pText);
      const iconClass = step.dataset.progressIconClass !== undefined
        ? step.dataset.progressIconClass
        : (isLast ? pDoneIconClass : pIconClass);

      const hasIcon = iconClass.length > 0 || icon.length > 0;
      const hasText  = text.length > 0;
      if (!hasIcon && !hasText) return; // 兩者皆空 → 不注入

      const iconHTML = toIconHTML(icon, iconClass);

      const btn = document.createElement('button');
      btn.className = 'bps-prog-btn';
      btn.type      = 'button';

      if (hasIcon && !hasText) {
        btn.dataset.variant = 'icon';
        btn.setAttribute('aria-label', isLast ? '完成' : '下一步');
        btn.innerHTML = iconHTML;

      } else if (!hasIcon && hasText) {
        btn.dataset.variant = 'text';
        btn.textContent = text;

      } else {
        btn.dataset.variant = 'both';
        btn.innerHTML =
          '<span class="bps-prog-icon">' + iconHTML + '</span>' +
          '<span class="bps-prog-text">' + text + '</span>';
      }

      btn.addEventListener('click', function (e) {
        e.stopPropagation(); // 避免與 data-clickable 模式衝突
        if (isShow) {
          progressShowNext(el, i); // 先揭示再推進
        } else {
          setActive(el, i + 1);
        }
        // ── 最後一步：顯示結尾區塊 ────────────────────────────────────────────
        //   data-show-ending="someId" → 找到 #someId 並播放淡入動畫
        if (isLast && el.dataset.showEnding) {
          const endingEl = document.getElementById(el.dataset.showEnding);
          if (endingEl) {
            endingEl.classList.remove('bps-ending-hidden');
            void endingEl.offsetWidth;  // 強制 reflow，確保 animation 從頭播放
            endingEl.classList.add('bps-ending-reveal');
          }
        }
      });

      step.appendChild(btn);
    });

    if (isShow) {
      const allSteps = [...getSteps(el)];
      const curIdx = allSteps.findIndex(s => s.dataset.state !== 'done');
      const hideFrom = curIdx >= 0 ? curIdx + 1 : allSteps.length;
      allSteps.forEach((step, i) => {
        if (i >= hideFrom) step.setAttribute('data-prog-hidden', '');
      });
    }
  }

  function progressShowNext(el, fromIndex) {
    const steps = getSteps(el);
    const nextIdx = fromIndex + 1;

    if (nextIdx >= steps.length) {
      // 最後一步按下：全部標記完成，觸發 bps:complete
      setActive(el, nextIdx);
      return;
    }

    const nextStep = steps[nextIdx];

    // 1. 解除隱藏（必須在加動畫類別前完成，元素需先渲染才能 animate）
    nextStep.removeAttribute('data-prog-hidden');

    // 2. 強制 reflow 後再加動畫類，確保瀏覽器正確觸發 animation
    void nextStep.offsetWidth;
    nextStep.classList.add('bps-revealing');
    nextStep.addEventListener('animationend', function handler() {
      nextStep.classList.remove('bps-revealing');
      nextStep.removeEventListener('animationend', handler);
    });

    // 3. 推進狀態
    setActive(el, nextIdx);
  }

  // ─── compact-header：將 badge、icon、title 包進單行 wrapper ──────────────────
  //  stepper 層級：data-compact-header（無值 / 非 "false" → 啟用）
  //  step   層級：data-compact-header="false" → 個別關閉
  //              data-compact-header（有值且非 "false"）→ 個別啟用（覆寫 stepper 關閉）
  function applyCompactHeader(el, cfg) {
    const stepperOn = el.dataset.compactHeader !== undefined
      ? el.dataset.compactHeader !== 'false'
      : Boolean(cfg.compactHeader);

    el.querySelectorAll(':scope > bp-step').forEach(function (step) {
      // 已處理過則跳過
      if (step.querySelector('.bps-step-header')) return;

      // 個別 bp-step 可覆寫 stepper 層級設定
      const stepAttr = step.dataset.compactHeader;
      const isOn = stepAttr !== undefined
        ? stepAttr !== 'false'
        : stepperOn;

      if (!isOn) return;

      const header = document.createElement('div');
      header.className = 'bps-step-header';

      // 依序蒐集：badge → icon → title（缺席者略過）
      const badge = step.querySelector(':scope > .bp-step-badge');
      const icon  = step.querySelector(':scope > .bp-step-icon');
      const title = step.querySelector(':scope > bp-step-title');
      [badge, icon, title].forEach(function (node) {
        if (node) header.appendChild(node);
      });

      // 插入為 bp-step 的第一個子元素
      step.insertBefore(header, step.firstChild);
    });
  }

  function initEl(el) {
    // 1. 套用主題預設與 data-* 屬性覆寫
    const cfg = Object.assign({}, defaults);
    const theme = el.dataset.theme || cfg.theme;
    if (theme && THEMES[theme]) Object.assign(cfg, THEMES[theme]);

    Object.entries(DATA_MAP).forEach(([key, cssVar]) => {
      let val = el.dataset[key] !== undefined ? el.dataset[key] : cfg[key];
      // ★ 解析 BRAND 色名別名（e.g. 'salmon' → '#E5C3B3'，'ocean' → '#1CCAE8'）
      //   data-color-active / data-color-done 等直接填色名時，原本會以字串形式寫入
      //   CSS 變數，導致：
      //     • 碰巧是 CSS 原生色名（如 salmon）→ 顯示錯誤顏色
      //     • 非 CSS 色名（如 ocean）         → 無效值，所有用該變數的規則全失效
      //       （連接線 ::after、箭頭 ::before 一起消失）
      if (typeof val === 'string' && BRAND[val]) val = BRAND[val];
      if (val) el.style.setProperty(cssVar, val);
    });

    // 1a. 若使用者以 data-color-active / data-color-done / data-color-error 個別覆寫，
    //     且未明確指定對應的 data-card-bg-* 時，自動從色值推算卡片背景色。
    //     如此一來自訂色和卡片背景始終一致，不會停留在 defaults/theme 的預設色。
    ;(function syncCardBgs() {
      const pairs = [
        ['colorActive', 'cardBgActive', '--bps-card-bg-act', 0.09],
        ['colorDone',   'cardBgDone',   '--bps-card-bg-done', 0.08],
        ['colorError',  'cardBgError',  '--bps-card-bg-err', 0.08],
      ];
      pairs.forEach(([colorKey, bgKey, cssVar, opacity]) => {
        if (el.dataset[colorKey] === undefined) return;   // 未覆寫 → 沿用 theme/defaults
        if (el.dataset[bgKey]    !== undefined) return;   // 使用者自訂背景 → 不覆寫
        const raw = el.dataset[colorKey];
        const hex = BRAND[raw] || raw;                    // 解析別名或直接使用十六進位
        const rgb = hexToRgb(hex);
        if (rgb) el.style.setProperty(cssVar, `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`);
      });
    })();

    // 1b. 垂直模式寬度
    //  --bps-vert-width 只在使用者明確設定 data-card-width 時注入
    //  未設定 → CSS fallback var(--bps-vert-width, 100%) → 卡片填滿容器
    //  有設定 → 該值作為固定寬度（可窄於容器）
    if (el.dataset.layout === 'vertical') {
      if (el.dataset.cardWidth) {
        el.style.setProperty('--bps-vert-width', el.dataset.cardWidth);
      } else {
        el.style.removeProperty('--bps-vert-width');
      }
    }

    // 1c. ui-title：把標題嵌入元件內，消除外部空白造成的視覺斷層
    //   用法：data-ui-title="<strong>標題文字</strong>"（支援 HTML）
    //   可選：data-ui-title-fs="1.2rem"  data-ui-title-pb="14px"
    if (el.dataset.uiTitle !== undefined && !el.querySelector('.bps-ui-title')) {
      const uiTitleEl = document.createElement('div');
      uiTitleEl.className = 'bps-ui-title';
      uiTitleEl.innerHTML = el.dataset.uiTitle;
      if (el.dataset.uiTitleFs) uiTitleEl.style.fontSize   = el.dataset.uiTitleFs;
      if (el.dataset.uiTitlePb) uiTitleEl.style.paddingBottom = el.dataset.uiTitlePb;
      el.insertBefore(uiTitleEl, el.firstChild);
      el.setAttribute('data-has-title', '');
    }

    // 1d. show-ending：初始化時自動隱藏目標 div，等待最後一步按鈕觸發顯示
    //   用法：data-show-ending="(div id)"
    //   配合 resetStates() 呼叫可重置為隱藏（見 resetStates）
    if (el.dataset.showEnding) {
      const endingEl = document.getElementById(el.dataset.showEnding);
      if (endingEl) {
        endingEl.classList.remove('bps-ending-reveal');
        endingEl.classList.add('bps-ending-hidden');
      }
    }

    // 2. connector 樣式（solid 也顯式寫入，避免被後繼卡片的 stacking context 蓋掉連接線）
    if (!el.dataset.connector) {
      const cs = el.dataset.connectorStyle || cfg.connectorStyle;
      if (cs) el.dataset.connector = cs;   // solid / dashed / dotted 全部寫入
    }

    // 3. 自動編號 badge
    const autoNum = el.dataset.autoNumber !== undefined
      ? el.dataset.autoNumber !== 'false'
      : cfg.autoNumber;

    if (autoNum) {
      el.querySelectorAll(':scope > bp-step').forEach((step, i) => {
        if (step.querySelector('.bp-step-badge')) return;
        const badge = document.createElement('span');
        badge.className = 'bp-step-badge';
        badge.setAttribute('aria-hidden', 'true');
        const state = step.dataset.state;
        badge.textContent = state === 'done'  ? '✓'
                          : state === 'error' ? '!'
                          : String(i + 1);
        step.insertBefore(badge, step.firstChild);
      });
    }

    // 3b. compact-header：badge + icon + title 合排成單行
    applyCompactHeader(el, cfg);

    // 4. 連接器說明標籤
    el.querySelectorAll(':scope > bp-step').forEach((step) => {
      if (step.querySelector('.bps-connector-label')) return;
      const labelText = step.dataset.connectorLabel !== undefined
        ? step.dataset.connectorLabel
        : el.dataset.connectorLabel;
      if (!labelText) return;
      const lbl = document.createElement('span');
      lbl.className = 'bps-connector-label';
      lbl.textContent = labelText;
      const lblColor = step.dataset.connectorLabelColor;
      if (lblColor) lbl.style.color = lblColor;
      step.appendChild(lbl);
    });

    // 5. 可點擊模式
    if (el.dataset.clickable === 'true') {
      el.querySelectorAll(':scope > bp-step').forEach((step, i) => {
        step.setAttribute('tabindex', '0');
        step.addEventListener('click', () => setActive(el, i));
        step.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActive(el, i);
          }
        });
      });
    }

    // 6. 換行布局
    if (el.dataset.wrap) applyWrap(el);

    // 7. progress / progress-show 推進按鈕
    //    需在 applyWrap 之後執行，使 getSteps() 能正確取得 wrap 後的步驟順序
    const mode = getMode(el);
    if (mode === 'progress' || mode === 'progress-show') injectProgressBtns(el, cfg);
  }

  function init(root) {
    (root || document).querySelectorAll('bp-stepper').forEach(initEl);
  }

  function setActive(el, index) {
    const steps = getSteps(el);
    const prevIndex = [...steps].findIndex(s => s.dataset.state === 'active');

    if (index >= steps.length) {
      steps.forEach(step => {
        step.dataset.state = 'done';
        const badge = step.querySelector('.bp-step-badge');
        if (badge) badge.textContent = '✓';
      });
      syncWrapConnector(el);
      el.dispatchEvent(new CustomEvent('bps:complete', { bubbles: true, detail: { el } }));
      return;
    }

    steps.forEach((step, i) => {
      const badge = step.querySelector('.bp-step-badge');
      if (i < index) {
        step.dataset.state = 'done';
        if (badge) badge.textContent = '✓';
      } else if (i === index) {
        step.dataset.state = 'active';
        if (badge) badge.textContent = String(i + 1);
      } else {
        delete step.dataset.state;
        if (badge) badge.textContent = String(i + 1);
      }
    });

    syncWrapConnector(el);
    el.dispatchEvent(new CustomEvent('bps:change', {
      bubbles: true,
      detail: { index, prevIndex, el },
    }));
  }

  function setError(el, index) {
    const steps = getSteps(el);
    if (!steps[index]) return;
    steps[index].dataset.state = 'error';
    const badge = steps[index].querySelector('.bp-step-badge');
    if (badge) badge.textContent = '!';
    syncWrapConnector(el);
  }

  function resetStates(el) {
    const isShow = getMode(el) === 'progress-show';
    getSteps(el).forEach((step, i) => {
      delete step.dataset.state;
      const badge = step.querySelector('.bp-step-badge');
      if (badge) badge.textContent = String(i + 1);
      if (isShow && i > 0) {
        step.setAttribute('data-prog-hidden', '');
      } else {
        step.removeAttribute('data-prog-hidden');
      }
    });
    syncWrapConnector(el);
    // 重置時將結尾區塊恢復隱藏
    if (el.dataset.showEnding) {
      const endingEl = document.getElementById(el.dataset.showEnding);
      if (endingEl) {
        endingEl.classList.remove('bps-ending-reveal');
        endingEl.classList.add('bps-ending-hidden');
      }
    }
  }

  customElements.define('bp-stepper', class extends HTMLElement {
    connectedCallback() { setTimeout(() => initEl(this), 0); }
  });
  customElements.define('bp-step',         class extends HTMLElement {});
  customElements.define('bp-step-title',   class extends HTMLElement {});
  customElements.define('bp-step-content', class extends HTMLElement {});

  window.BPStepper = { defaults, BRAND, THEMES, init, setActive, setError, resetStates, progressShowNext };

  injectCSS();

})();
