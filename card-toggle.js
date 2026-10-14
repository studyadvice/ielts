const CT_CARD_FS  = ['body','number','question','input','submit','aux','feedback','hintbox','flipnote','info','infobox'];
const CT_CARD_PAD = ['input','submit','aux','info','infobox'];
const CT_GROUP_FS  = ['nav','page','counter','result-score','result-text','retry'];
const CT_GROUP_PAD = ['nav','page','retry'];

function ctApplyInfoColors(el) {
    [['info-color', '--ct-info-color'], ['info-bg', '--ct-info-bg'], ['info-fg', '--ct-info-fg']].forEach(([attr, v]) => {
        const val = el.getAttribute(attr);
        if (val !== null && val.trim() !== '') {
            el.style.setProperty(v, CardToggle.prototype._resolveColor.call(el, val.trim()));
        }
    });
}

function ctApplyTypography(el, fsParts, padParts) {
    const num = /^\d+(\.\d+)?$/;
    fsParts.forEach(part => {
        const fs = el.getAttribute('fs-' + part);
        if (fs !== null && fs.trim() !== '') {
            el.style.setProperty('--ct-fs-' + part, num.test(fs.trim()) ? fs.trim() + 'rem' : fs.trim());
        }
        const ff = el.getAttribute('ff-' + part);
        if (ff !== null && ff.trim() !== '') {
            el.style.setProperty('--ct-ff-' + part, ff.trim());
        }
    });
    padParts.forEach(part => {
        const pad = el.getAttribute('pad-' + part);
        if (pad !== null && pad.trim() !== '') {
            const v = pad.trim().split(/\s+/).map(t => num.test(t) ? t + 'px' : t).join(' ');
            el.style.setProperty('--ct-pad-' + part, v);
        }
    });
}

class CardToggle extends HTMLElement {
    constructor() {
        super();
        this._originalContent = '';
        this._originalColor   = null;
        this._attempts        = 0;
        this._inputId         = '';
        this._autoFlipTimer   = null;
        this._isFlipped       = false;
        this._clickBound      = false;
        this._snapshotTaken   = false;
    }

    connectedCallback() {
        if (this._ctConnected) return;
        this._ctConnected = true;
        this._originalColor = this.getAttribute('color') || null;

        if (!document.getElementById('card-toggle-styles')) {
            this._injectStyles();
        }

        this._initialize();
    }

    /* 取得正面快照（第一次點擊前呼叫，此時 DOM 一定已完整解析） */
    _takeSnapshot() {
        if (!this._snapshotTaken) {
            this._originalContent = this.innerHTML;
            this._snapshotTaken   = true;
        }
    }

    _injectStyles() {
        const style = document.createElement('style');
        style.id = 'card-toggle-styles';
        style.textContent = `
            :root {
                --ct-bg-primary:      #0C0D0C;
                --ct-bg-secondary:    color-mix(in srgb, var(--ct-bg-primary) 94%, var(--ct-color-shell));
                --ct-color-shell:     #C6C7BD;
                --ct-color-lavender:  #C3A5E5;
                --ct-color-sky:       #82C8E5;
                --ct-color-warning:   #E6374B;
                --ct-color-salmon:    #E5C3B3;
                --ct-color-ocean:     #1CCAE8;
                --ct-color-safe:      #27AE60;
                --ct-color-teal:      #0DA591;
                --ct-color-vanilla:   #DBEDD8;
                --ct-color-yellow:    #E3D322;
                --ct-color-focus:     #D4FFFC;
                --ct-color-special:   #B3DE73;
                --ct-color-info:      #4171BF;
                --ct-color-indigo:    #7849C9;
                --ct-color-pink:      #FF91D7;
                --ct-color-orange:    #EDA109;
                /* 舊名稱別名，既有頁面不必修改屬性 */
                --ct-color-attention: var(--ct-color-yellow);
                --ct-color-stone:     var(--ct-color-sky);
                /* 左側 bar 寬度 */
                --ct-bar-width:       3px;
                --ct-bar-width-hover: 5px;
                /* 預設動態顏色變數 */
                --ct-active-color: var(--ct-color-special);
                /* 各部位字體大小（最小 1.125rem） */
                --ct-fs-body:         1.125rem;
                --ct-fs-number:       1.125rem;
                --ct-fs-input:        1.125rem;
                --ct-fs-submit:       1.125rem;
                --ct-fs-aux:          1.125rem;
                --ct-fs-feedback:     1.125rem;
                --ct-fs-hintbox:      1.125rem;
                --ct-fs-flipnote:     1.125rem;
                --ct-fs-info:         1.125rem;
                --ct-fs-infobox:      1.125rem;
                --ct-fs-nav:          1.125rem;
                --ct-fs-page:         1.125rem;
                --ct-fs-counter:      1.125rem;
                --ct-fs-result-score: 2.4rem;
                --ct-fs-result-text:  1.125rem;
                --ct-fs-retry:        1.125rem;
                /* 各部位 padding（縮小版） */
                --ct-pad-input:  6px 10px;
                --ct-pad-submit: 4px 14px;
                --ct-pad-aux:    3px 12px;
                --ct-pad-info:    3px 12px;
                --ct-pad-infobox: 8px 14px;
                --ct-pad-nav:    4px 14px;
                --ct-pad-page:   2px 6px;
                --ct-pad-retry:  4px 14px;
            }

            card-toggle {
                display: block;
                position: relative;
                background-color: var(--ct-bg-secondary);
                border-radius: 6px;
                padding: 10px 16px 10px 14px;
                cursor: pointer;
                transition: background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
                overflow: hidden;
                border: 1px solid color-mix(in srgb, var(--ct-color-shell) 20%, var(--ct-bg-primary));
                color: var(--ct-color-shell);
                line-height: 1.5;
                font-size: var(--ct-fs-body);
                font-family: var(--ct-ff-body, inherit);
            }

            card-toggle::before {
                content: '';
                position: absolute;
                left: 0;
                top: 8%;
                bottom: 8%;
                width: var(--ct-bar-width, 3px);
                background-color: var(--ct-bg-primary);
                transition: width 0.2s ease, background-color 0.2s ease;
            }

            card-toggle:hover::before {
                width: var(--ct-bar-width-hover, 6px);
            }

            card-toggle:hover {
                background-color: color-mix(in srgb, var(--ct-color-shell) 4%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-shell) 12%, var(--ct-bg-primary));
            }

            card-toggle[replaced] {
                cursor: default;
            }

            card-toggle[replaced]:not([toggle]):hover {
                background-color: var(--ct-bg-secondary);
                box-shadow: none;
            }

            card-toggle[replaced]:not([toggle])::before {
                width: var(--ct-bar-width, 3px);
            }

            card-toggle[dashed] {
                border-style: dashed;
                border-color: color-mix(in srgb, var(--ct-color-shell) 50%, var(--ct-bg-primary));
                border-width: 1px;
            }

            card-toggle[dashed][color="safe"]      { border-color: color-mix(in srgb, var(--ct-color-safe) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="warning"]   { border-color: color-mix(in srgb, var(--ct-color-warning) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="info"]      { border-color: color-mix(in srgb, var(--ct-color-info) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="special"]   { border-color: color-mix(in srgb, var(--ct-color-special) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="sky"]       { border-color: color-mix(in srgb, var(--ct-color-sky) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="lavender"]  { border-color: color-mix(in srgb, var(--ct-color-lavender) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="attention"] { border-color: color-mix(in srgb, var(--ct-color-yellow) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="salmon"]    { border-color: color-mix(in srgb, var(--ct-color-salmon) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="pink"]      { border-color: color-mix(in srgb, var(--ct-color-pink) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="orange"]    { border-color: color-mix(in srgb, var(--ct-color-orange) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="stone"]     { border-color: color-mix(in srgb, var(--ct-color-sky) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="ocean"]    { border-color: color-mix(in srgb, var(--ct-color-ocean) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="teal"]     { border-color: color-mix(in srgb, var(--ct-color-teal) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="focus"]    { border-color: color-mix(in srgb, var(--ct-color-focus) 55%, var(--ct-bg-primary)); }
            card-toggle[dashed][color="indigo"]   { border-color: color-mix(in srgb, var(--ct-color-indigo) 55%, var(--ct-bg-primary)); }

            card-toggle[size="xsm"] { padding: 3px 8px 3px 7px; }
            card-toggle[size="sm"]  { padding: 6px 14px 6px 12px; }
            card-toggle[size="lg"]  { padding: 13px 20px 13px 18px; }
            card-toggle[size="xlg"] { padding: 16px 24px 16px 22px; }

            card-toggle[color="safe"]::before { background-color: var(--ct-color-safe); }
            card-toggle[color="safe"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-safe) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-safe) 20%, var(--ct-bg-primary));
            }

            card-toggle[color="warning"]::before { background-color: var(--ct-color-warning); }
            card-toggle[color="warning"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-warning) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-warning) 20%, var(--ct-bg-primary));
            }

            card-toggle[color="info"]::before { background-color: var(--ct-color-info); }
            card-toggle[color="info"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-info) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-info) 20%, var(--ct-bg-primary));
            }

            card-toggle[color="special"]::before { background-color: var(--ct-color-special); }
            card-toggle[color="special"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-special) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-special) 20%, var(--ct-bg-primary));
            }

            card-toggle[color="sky"]::before { background-color: var(--ct-color-sky); }
            card-toggle[color="sky"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-sky) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-sky) 20%, var(--ct-bg-primary));
            }

            card-toggle[color="lavender"]::before { background-color: var(--ct-color-lavender); }
            card-toggle[color="lavender"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-lavender) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-lavender) 20%, var(--ct-bg-primary));
            }

            card-toggle[color="attention"]::before { background-color: var(--ct-color-attention); }
            card-toggle[color="attention"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-yellow) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-yellow) 20%, var(--ct-bg-primary));
            }

            card-toggle[color="salmon"]::before { background-color: var(--ct-color-salmon); }
            card-toggle[color="salmon"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-salmon) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-salmon) 20%, var(--ct-bg-primary));
            }

            card-toggle[color="shell"]::before { background-color: var(--ct-color-shell); }
            card-toggle[color="shell"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-shell) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-shell) 20%, var(--ct-bg-primary));
            }

            card-toggle[color="pink"]::before { background-color: var(--ct-color-pink); }
            card-toggle[color="pink"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-pink) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-pink) 20%, var(--ct-bg-primary));
            }

            card-toggle[color="orange"]::before { background-color: var(--ct-color-orange); }
            card-toggle[color="orange"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-orange) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-orange) 20%, var(--ct-bg-primary));
            }

            card-toggle[color="stone"]::before { background-color: var(--ct-color-stone); }
            card-toggle[color="stone"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-sky) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-sky) 20%, var(--ct-bg-primary));
            }
            card-toggle[color="ocean"]::before { background-color: var(--ct-color-ocean); }
            card-toggle[color="ocean"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-ocean) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-ocean) 20%, var(--ct-bg-primary));
            }
            card-toggle[color="teal"]::before { background-color: var(--ct-color-teal); }
            card-toggle[color="teal"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-teal) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-teal) 20%, var(--ct-bg-primary));
            }
            card-toggle[color="focus"]::before { background-color: var(--ct-color-focus); }
            card-toggle[color="focus"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-focus) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-focus) 20%, var(--ct-bg-primary));
            }
            card-toggle[color="indigo"]::before { background-color: var(--ct-color-indigo); }
            card-toggle[color="indigo"]:hover {
                background-color: color-mix(in srgb, var(--ct-color-indigo) 5%, var(--ct-bg-primary));
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--ct-color-indigo) 20%, var(--ct-bg-primary));
            }

            @keyframes ct-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes ct-slide-in {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes ct-shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }

            .ct-fade-in {
                animation: ct-fade-in 0.3s ease forwards;
            }

            .ct-slide-in {
                animation: ct-slide-in 0.3s ease forwards;
            }

            .ct-shake {
                animation: ct-shake 0.5s ease;
            }

            .ct-question {
                font-size: var(--ct-fs-question, 1em);
                font-family: var(--ct-ff-question, inherit);
            }

            .ct-quiz-input {
                width: 100%;
                padding: var(--ct-pad-input);
                border: 2px solid color-mix(in srgb, var(--ct-color-shell) 20%, var(--ct-bg-primary));
                border-radius: 5px;
                background-color: var(--ct-bg-primary);
                color: var(--ct-color-shell);
                font-size: var(--ct-fs-input);
                font-family: var(--ct-ff-input, inherit);
                line-height: 1.4;
                margin-top: 8px;
                transition: border-color 0.3s ease;
                box-sizing: border-box;
            }

            .ct-quiz-input:focus {
                outline: none;
                border-color: var(--ct-color-special);
            }

            /* 提交按鈕 */
            .ct-quiz-button {
                padding: var(--ct-pad-submit);
                border: none;
                border-radius: 5px;
                background-color: var(--ct-color-special);
                color: var(--ct-bg-primary);
                font-size: var(--ct-fs-submit);
                font-family: var(--ct-ff-submit, inherit);
                font-weight: 600;
                line-height: 1.3;
                cursor: pointer;
                margin-top: 8px;
                transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
            }

            .ct-quiz-button:hover {
                background-color: var(--ct-color-sky);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px color-mix(in srgb, var(--ct-color-sky) 30%, var(--ct-bg-primary));
            }

            .ct-quiz-button:active {
                transform: translateY(0);
            }

            /* 提示 / 重置按鈕 */
            .ct-reset-button {
                padding: var(--ct-pad-aux);
                border: 1px solid var(--ct-color-lavender);
                border-radius: 5px;
                background-color: transparent;
                color: var(--ct-color-lavender);
                font-size: var(--ct-fs-aux);
                font-family: var(--ct-ff-aux, inherit);
                line-height: 1.3;
                cursor: pointer;
                margin-top: 8px;
                margin-left: 8px;
                transition: background-color 0.18s ease, border-color 0.18s ease;
            }

            .ct-reset-button:hover {
                background-color: color-mix(in srgb, var(--ct-color-lavender) 10%, var(--ct-bg-primary));
            }

            /* 額外資訊按鈕與面板 */
            .ct-info-button {
                padding: var(--ct-pad-info);
                border: 1px solid var(--ct-info-color, var(--ct-color-sky));
                border-radius: 5px;
                background-color: transparent;
                color: var(--ct-info-color, var(--ct-color-sky));
                font-size: var(--ct-fs-info);
                font-family: var(--ct-ff-info, inherit);
                line-height: 1.3;
                cursor: pointer;
                margin-top: 8px;
                margin-left: 8px;
                transition: background-color 0.18s ease;
            }

            .ct-info-button:hover,
            .ct-info-button.ct-open {
                background-color: color-mix(in srgb, var(--ct-info-color, var(--ct-color-sky)) 14%, var(--ct-bg-primary));
            }

            .ct-info-panel {
                margin-top: 8px;
                padding: var(--ct-pad-infobox);
                border-left: 3px solid var(--ct-info-color, var(--ct-color-sky));
                border-radius: 0 5px 5px 0;
                background-color: var(--ct-info-bg, color-mix(in srgb, var(--ct-info-color, var(--ct-color-sky)) 10%, var(--ct-bg-primary)));
                color: var(--ct-info-fg, var(--ct-color-shell));
                font-size: var(--ct-fs-infobox);
                font-family: var(--ct-ff-infobox, inherit);
                line-height: 1.5;
                cursor: default;
                animation: ct-fade-in 0.3s ease;
            }

            .ct-info-panel > :last-child { margin-bottom: 0; }

            /* 內嵌提示（Bootstrap alert） */
            .ct-hint-alert {
                margin: 8px 0 0;
                padding: 6px 12px;
                font-size: var(--ct-fs-hintbox);
                font-family: var(--ct-ff-hintbox, inherit);
                line-height: 1.4;
            }

            .ct-error {
                color: var(--ct-color-warning);
                margin-top: 8px;
                font-size: var(--ct-fs-feedback);
                font-family: var(--ct-ff-feedback, inherit);
            }

            .ct-success {
                color: var(--ct-color-safe);
                font-size: var(--ct-fs-feedback);
                font-family: var(--ct-ff-feedback, inherit);
            }

            /* 群組容器樣式 */
            card-toggle-group {
                display: block;
                position: relative;
            }

            card-toggle-group[mode="slide"] {
                overflow: hidden;
            }

            card-toggle-group[mode="slide"] .ct-group-cards {
                display: flex;
                transition: transform 0.4s ease;
            }

            card-toggle-group[mode="slide"] card-toggle {
                flex-shrink: 0;
                width: 100%;
            }

            card-toggle-group[mode="stack"] card-toggle {
                display: block;
                margin-bottom: 10px;
            }

            /* ── grid mode ── */
            card-toggle-group[mode^="grid"] {
                display: grid;
            }
            card-toggle-group[mode^="grid"] card-toggle {
                display: block;
            }

            /* 導航按鈕樣式 */
            .ct-nav-buttons {
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-top: 12px;
            }

            .ct-nav-btn {
                padding: var(--ct-pad-nav);
                border: 1px solid var(--ct-color-shell);
                border-radius: 5px;
                background-color: transparent;
                color: var(--ct-color-shell);
                cursor: pointer;
                transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
                font-size: var(--ct-fs-nav);
                font-family: var(--ct-ff-nav, inherit);
                line-height: 1.3;
            }

            .ct-nav-btn:hover:not(:disabled) {
                background-color: color-mix(in srgb, var(--ct-color-shell) 10%, var(--ct-bg-primary));
                border-color: var(--ct-active-color);
                color: var(--ct-active-color);
            }

            .ct-nav-btn:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }

            /* 頁碼按鈕樣式 */
            .ct-page-buttons {
                display: flex;
                justify-content: center;
                gap: 6px;
                margin-top: 10px;
                flex-wrap: wrap;
            }

            .ct-page-btn {
                min-width: 32px;
                padding: var(--ct-pad-page);
                border: 1px solid color-mix(in srgb, var(--ct-color-shell) 30%, var(--ct-bg-primary));
                border-radius: 4px;
                background-color: transparent;
                color: var(--ct-color-shell);
                cursor: pointer;
                transition: background-color 0.18s ease, border-color 0.18s ease;
                font-size: var(--ct-fs-page);
                font-family: var(--ct-ff-page, inherit);
                line-height: 1.3;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ct-page-btn:hover {
                background-color: color-mix(in srgb, var(--ct-color-shell) 10%, var(--ct-bg-primary));
                border-color: var(--ct-active-color);
            }

            .ct-page-btn.active {
                background-color: var(--ct-active-color);
                color: var(--ct-bg-primary);
                border-color: var(--ct-active-color);
                font-weight: 600;
            }

            /* 答題狀態頁碼 */
            .ct-page-btn.answered-correct {
                border-color: color-mix(in srgb, var(--ct-color-safe) 60%, var(--ct-bg-primary));
                color: var(--ct-color-safe);
                background-color: color-mix(in srgb, var(--ct-color-safe) 8%, var(--ct-bg-primary));
            }
            .ct-page-btn.answered-correct.active {
                background-color: var(--ct-color-safe);
                color: var(--ct-bg-primary);
                border-color: var(--ct-color-safe);
            }
            .ct-page-btn.answered-wrong {
                border-color: color-mix(in srgb, var(--ct-color-orange) 60%, var(--ct-bg-primary));
                color: var(--ct-color-orange);
                background-color: color-mix(in srgb, var(--ct-color-orange) 8%, var(--ct-bg-primary));
            }
            .ct-page-btn.answered-wrong.active {
                background-color: var(--ct-color-orange);
                color: var(--ct-bg-primary);
                border-color: var(--ct-color-orange);
            }

            /* 題目計數器 */
            .ct-counter {
                text-align: center;
                font-size: var(--ct-fs-counter);
                font-family: var(--ct-ff-counter, inherit);
                line-height: 1.4;
                color: color-mix(in srgb, var(--ct-color-shell) 78%, var(--ct-bg-primary));
                margin-bottom: 8px;
                letter-spacing: 0.04em;
                user-select: none;
            }
            .ct-counter-current {
                color: var(--ct-active-color);
                font-weight: 700;
            }

            /* 完成畫面 */
            .ct-result-screen {
                padding: 20px 24px;
                border-radius: 6px;
                background-color: var(--ct-bg-secondary);
                border: 1px solid color-mix(in srgb, var(--ct-color-shell) 15%, var(--ct-bg-primary));
                text-align: center;
                animation: ct-fade-in 0.35s ease;
            }
            .ct-result-score {
                font-size: var(--ct-fs-result-score);
                font-family: var(--ct-ff-result-score, inherit);
                font-weight: 700;
                color: var(--ct-active-color);
                line-height: 1.2;
                margin-bottom: 6px;
            }
            .ct-result-label {
                font-size: var(--ct-fs-result-text);
                font-family: var(--ct-ff-result-text, inherit);
                line-height: 1.4;
                color: color-mix(in srgb, var(--ct-color-shell) 78%, var(--ct-bg-primary));
                margin-bottom: 14px;
            }
            .ct-result-breakdown {
                display: flex;
                justify-content: center;
                gap: 24px;
                margin-bottom: 14px;
                font-size: var(--ct-fs-result-text);
                font-family: var(--ct-ff-result-text, inherit);
                line-height: 1.4;
            }
            .ct-result-correct { color: var(--ct-color-safe); }
            .ct-result-wrong   { color: var(--ct-color-orange); }
            .ct-result-skipped { color: color-mix(in srgb, var(--ct-color-shell) 78%, var(--ct-bg-primary)); }
            .ct-result-retry {
                padding: var(--ct-pad-retry);
                border: 1px solid var(--ct-active-color);
                border-radius: 5px;
                background: transparent;
                color: var(--ct-active-color);
                cursor: pointer;
                font-size: var(--ct-fs-retry);
                font-family: var(--ct-ff-retry, inherit);
                line-height: 1.3;
                transition: background-color 0.18s ease;
            }
            .ct-result-retry:hover {
                background-color: color-mix(in srgb, var(--ct-color-shell) 8%, var(--ct-bg-primary));
            }

            /* 提示區域樣式 */
            .ct-hint-display {
                padding: 9px 14px;
                background-color: color-mix(in srgb, var(--ct-color-lavender) 10%, var(--ct-bg-primary));
                border-left: 2px solid var(--ct-color-lavender);
                border-radius: 0 4px 4px 0;
                margin-top: 10px;
                color: var(--ct-color-lavender);
                font-size: var(--ct-fs-hintbox);
                font-family: var(--ct-ff-hintbox, inherit);
                line-height: 1.4;
                animation: ct-fade-in 0.3s ease;
            }

            /* auto-flip 倒數進度條 */
            .ct-countdown-bar {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background-color: color-mix(in srgb, var(--ct-color-shell) 10%, var(--ct-bg-primary));
                border-radius: 0 0 6px 6px;
                overflow: hidden;
            }

            .ct-countdown-inner {
                height: 100%;
                width: 100%;
                background-color: var(--ct-color-sky);
                transform-origin: left center;
                animation: ct-countdown linear forwards;
            }

            @keyframes ct-countdown {
                from { transform: scaleX(1); }
                to   { transform: scaleX(0); }
            }

            /* toggle 模式：背面的「點擊翻回」提示標籤 */
            .ct-toggle-hint {
                display: inline-block;
                margin-top: 10px;
                font-size: var(--ct-fs-flipnote);
                font-family: var(--ct-ff-flipnote, inherit);
                line-height: 1.4;
                color: var(--ct-color-stone);
                opacity: 0.78;
                user-select: none;
            }

            .ct-toggle-hint i {
                margin-right: 4px;
            }

            /* toggle 模式背面 hover 效果 */
            card-toggle[replaced][toggle]:hover {
                background-color: color-mix(in srgb, var(--ct-color-shell) 6%, var(--ct-bg-primary));
                cursor: pointer;
            }

            /* ── quiz 正面模式：卡片本身不觸發點擊 ─────────────────────── */
            card-toggle[question]:not([replaced]) {
                cursor: default;
            }
            card-toggle[question]:not([replaced]):hover {
                background-color: var(--ct-bg-secondary);
                box-shadow: none;
            }
            card-toggle[question]:not([replaced])::before {
                width: var(--ct-bar-width, 3px);
            }
            card-toggle[question][replaced] {
                cursor: pointer;
            }

            /* ── skin：幾何結構 / 色塊疊加裝飾 ──────────────────────────── */

            /* grid：正方格線 */
            card-toggle[skin="grid"] {
                --ct-skin-line: color-mix(in srgb, var(--ct-color-shell) 8%, var(--ct-bg-primary));
                background-image:
                    linear-gradient(var(--ct-skin-line) 1px, transparent 1px),
                    linear-gradient(90deg, var(--ct-skin-line) 1px, transparent 1px);
                background-size: 24px 24px;
            }

            /* ruled：橫線 */
            card-toggle[skin="ruled"] {
                --ct-skin-line: color-mix(in srgb, var(--ct-color-shell) 10%, var(--ct-bg-primary));
                background-image:
                    linear-gradient(transparent calc(100% - 1px), var(--ct-skin-line) 1px);
                background-size: 100% 28px;
                background-position: 0 0;
            }

            /* blueprint：雙密度格線（天藍調） */
            card-toggle[skin="blueprint"] {
                background-image:
                    linear-gradient(color-mix(in srgb, var(--ct-color-sky) 10%, var(--ct-bg-primary))  1px, transparent 1px),
                    linear-gradient(90deg, color-mix(in srgb, var(--ct-color-sky) 10%, var(--ct-bg-primary))  1px, transparent 1px),
                    linear-gradient(color-mix(in srgb, var(--ct-color-sky) 4%, var(--ct-bg-primary)) 1px, transparent 1px),
                    linear-gradient(90deg, color-mix(in srgb, var(--ct-color-sky) 4%, var(--ct-bg-primary)) 1px, transparent 1px);
                background-size: 60px 60px, 60px 60px, 12px 12px, 12px 12px;
            }

            /* split：上半稍亮 / 下半稍暗 */
            card-toggle[skin="split"] {
                background-image: linear-gradient(
                    to bottom,
                    color-mix(in srgb, var(--ct-color-shell) 4%, var(--ct-bg-primary)) 0%,
                    color-mix(in srgb, var(--ct-color-shell) 4%, var(--ct-bg-primary)) 50%,
                    color-mix(in srgb, #000 10%, var(--ct-bg-primary)) 50%,
                    color-mix(in srgb, #000 10%, var(--ct-bg-primary)) 100%
                );
            }

            /* band：頂部色帶 */
            card-toggle[skin="band"] {
                background-image: linear-gradient(
                    to bottom,
                    color-mix(in srgb, var(--ct-color-shell) 7%, var(--ct-bg-primary)) 0px,
                    color-mix(in srgb, var(--ct-color-shell) 7%, var(--ct-bg-primary)) 36px,
                    transparent 36px
                );
            }

            /* skin × color：grid / ruled 線條跟隨色票 */
            card-toggle[skin="grid"][color="sky"],
            card-toggle[skin="ruled"][color="sky"]      { --ct-skin-line: color-mix(in srgb, var(--ct-color-sky) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="lavender"],
            card-toggle[skin="ruled"][color="lavender"]  { --ct-skin-line: color-mix(in srgb, var(--ct-color-lavender) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="safe"],
            card-toggle[skin="ruled"][color="safe"]      { --ct-skin-line: color-mix(in srgb, var(--ct-color-safe) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="warning"],
            card-toggle[skin="ruled"][color="warning"]   { --ct-skin-line: color-mix(in srgb, var(--ct-color-warning) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="info"],
            card-toggle[skin="ruled"][color="info"]      { --ct-skin-line: color-mix(in srgb, var(--ct-color-info) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="orange"],
            card-toggle[skin="ruled"][color="orange"]    { --ct-skin-line: color-mix(in srgb, var(--ct-color-orange) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="focus"],
            card-toggle[skin="ruled"][color="focus"]     { --ct-skin-line: color-mix(in srgb, var(--ct-color-focus) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="teal"],
            card-toggle[skin="ruled"][color="teal"]      { --ct-skin-line: color-mix(in srgb, var(--ct-color-teal) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="ocean"],
            card-toggle[skin="ruled"][color="ocean"]     { --ct-skin-line: color-mix(in srgb, var(--ct-color-ocean) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="indigo"],
            card-toggle[skin="ruled"][color="indigo"]    { --ct-skin-line: color-mix(in srgb, var(--ct-color-indigo) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="pink"],
            card-toggle[skin="ruled"][color="pink"]      { --ct-skin-line: color-mix(in srgb, var(--ct-color-pink) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="salmon"],
            card-toggle[skin="ruled"][color="salmon"]    { --ct-skin-line: color-mix(in srgb, var(--ct-color-salmon) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="special"],
            card-toggle[skin="ruled"][color="special"]   { --ct-skin-line: color-mix(in srgb, var(--ct-color-special) 10%, var(--ct-bg-primary)); }
            card-toggle[skin="grid"][color="shell"],
            card-toggle[skin="ruled"][color="shell"]     { --ct-skin-line: color-mix(in srgb, var(--ct-color-shell) 13%, var(--ct-bg-primary)); }

            /* ── shape="envelope"：信封形狀 ──────────────────────────────── */
            /*
             * clip-path: polygon(0 36px, 50% 0, 100% 36px, 100% 100%, 0 100%)
             * 固定 36px 折痕深度，不受卡片高度百分比影響。
             * ::after 繪製兩條對角折痕線（X → V 形），顏色跟隨 color 屬性。
             * ::before 左側 bar 從折痕線起始（top: 36px），視覺整齊。
             */
            card-toggle[shape="envelope"] {
                --ct-envelope-fold: color-mix(in srgb, var(--ct-color-shell) 18%, var(--ct-bg-primary));
                clip-path: polygon(0 36px, 50% 0, 100% 36px, 100% 100%, 0 100%);
                padding-top: 50px;
                min-height: 90px;
            }
            card-toggle[shape="envelope"]::before {
                top: 38px;
            }
            card-toggle[shape="envelope"]::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 36px;
                pointer-events: none;
                background:
                    linear-gradient(
                        to bottom right,
                        transparent 49.8%, var(--ct-envelope-fold) 49.8%,
                        var(--ct-envelope-fold) 50.2%, transparent 50.2%
                    ),
                    linear-gradient(
                        to bottom left,
                        transparent 49.8%, var(--ct-envelope-fold) 49.8%,
                        var(--ct-envelope-fold) 50.2%, transparent 50.2%
                    );
            }

            /* envelope × color：折痕線跟隨色票 */
            card-toggle[shape="envelope"][color="sky"]      { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-sky) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="lavender"] { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-lavender) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="safe"]     { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-safe) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="warning"]  { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-warning) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="info"]     { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-info) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="orange"]   { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-orange) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="focus"]    { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-focus) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="teal"]     { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-teal) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="ocean"]    { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-ocean) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="indigo"]   { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-indigo) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="pink"]     { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-pink) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="salmon"]   { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-salmon) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="special"]  { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-special) 30%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="shell"]    { --ct-envelope-fold: color-mix(in srgb, var(--ct-color-shell) 28%, var(--ct-bg-primary)); }
            card-toggle[shape="envelope"][color="attention"]{ --ct-envelope-fold: color-mix(in srgb, var(--ct-color-yellow) 30%, var(--ct-bg-primary)); }
        `;
        document.head.appendChild(style);
    }

    _initialize() {
        // 統一綁定一個 click handler（toggle 模式需要在 replaced 狀態也能點擊）
        if (!this._clickBound) {
            this.addEventListener('click', (event) => this._handleClick(event));
            this._clickBound = true;
        }

        if (this.hasAttribute('number')) {
            this._addNumber();
        }

        // Quiz 正面模式：卡片載入即直接呈現輸入表單
        if (this.hasAttribute('question') && !this._snapshotTaken) {
            this._renderQuizFront();
        }

        this._applyLineStyles();
        ctApplyTypography(this, CT_CARD_FS, CT_CARD_PAD);
        ctApplyInfoColors(this);
    }

    _addNumber() {
        const number = this.getAttribute('number');
        const numberSize = this.getAttribute('number-size') || 'var(--ct-fs-number)';
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'ct-number';
        numberSpan.textContent = number + '. ';
        numberSpan.style.opacity = '0.78';
        numberSpan.style.fontSize = numberSize;
        numberSpan.style.fontWeight = '600';
        numberSpan.style.marginRight = '4px';
        
        this.insertBefore(numberSpan, this.firstChild);
    }

    /**
     * Quiz 正面模式：直接在卡片正面渲染輸入表單，
     * 不需要使用者點擊觸發。快照在此立即完成，
     * 答對翻面後可點擊翻回重試。
     */
    _renderQuizFront() {
        this.innerHTML     = this._generateQuizContent();
        this._originalContent = this.innerHTML;   // 快照 = 表單本身
        this._snapshotTaken   = true;
        this.style.cursor     = 'default';
    }

    /**
     * 套用線條與形狀樣式
     *
     * bar-width="N"            左側 bar 寬度（純數字視為 px，預設 3）
     * bar-width-hover="N"      Hover 時寬度（未設定 = bar-width + 2）
     * top-line="N"             上邊線條寬度（空值預設 2px）
     * top-line-color="NAME"    上邊線條顏色（預設同 color 屬性）
     * bottom-line="N"          下邊線條寬度（空值預設 2px）
     * bottom-line-color="NAME" 下邊線條顏色（預設同 color 屬性）
     */
    _applyLineStyles() {
        // ── 左側 bar 粗細 ────────────────────────────────────────────────
        const barWidth      = this.getAttribute('bar-width');
        const barWidthHover = this.getAttribute('bar-width-hover');

        if (barWidth !== null && barWidth !== '') {
            const w = /^\d+(\.\d+)?$/.test(barWidth) ? barWidth + 'px' : barWidth;
            this.style.setProperty('--ct-bar-width', w);
            if (barWidthHover !== null && barWidthHover !== '') {
                const hw = /^\d+(\.\d+)?$/.test(barWidthHover) ? barWidthHover + 'px' : barWidthHover;
                this.style.setProperty('--ct-bar-width-hover', hw);
            } else {
                this.style.setProperty('--ct-bar-width-hover', (parseFloat(barWidth) + 2) + 'px');
            }
        } else if (barWidthHover !== null && barWidthHover !== '') {
            const hw = /^\d+(\.\d+)?$/.test(barWidthHover) ? barWidthHover + 'px' : barWidthHover;
            this.style.setProperty('--ct-bar-width-hover', hw);
        }

        // ── 上 / 下邊線條 ───────────────────────────────────────────────
        const colorName    = this.getAttribute('color') || 'shell';
        const defaultColor = this._resolveColor(colorName);

        const _parseLineW = (val) =>
            (val === null)      ? null :
            (val === '')        ? '2px' :
            /^\d+(\.\d+)?$/.test(val.trim()) ? val.trim() + 'px' : val.trim();

        const topW = _parseLineW(this.getAttribute('top-line'));
        if (topW !== null) {
            const c = this._resolveColor(this.getAttribute('top-line-color')) || defaultColor;
            this.style.borderTopWidth = topW;
            this.style.borderTopStyle = 'solid';
            this.style.borderTopColor = c;
        }

        const botW = _parseLineW(this.getAttribute('bottom-line'));
        if (botW !== null) {
            const c = this._resolveColor(this.getAttribute('bottom-line-color')) || defaultColor;
            this.style.borderBottomWidth = botW;
            this.style.borderBottomStyle = 'solid';
            this.style.borderBottomColor = c;
        }
    }

    _handleClick(event) {
        // 第一次點擊時才取快照，此時子節點一定已完整解析
        this._takeSnapshot();

        // quiz 正面模式：卡片本身不可點擊（只有按鈕觸發），但背面仍可翻回
        const isQuizMode   = this.hasAttribute('question');
        const isToggleMode = this.hasAttribute('toggle') || isQuizMode;

        // toggle / quiz 背面：點擊翻回正面
        if (this.hasAttribute('replaced') && isToggleMode) {
            const target = event.target;
            const interactiveElements = ['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'A'];
            if (interactiveElements.includes(target.tagName)) return;
            if (target.closest('input, button, textarea, select, a')) return;
            this._flipBack();
            return;
        }

        if (this.hasAttribute('replaced')) {
            return;
        }

        // quiz 正面不可點擊卡片觸發翻面
        if (isQuizMode) return;

        const target = event.target;
        const interactiveElements = ['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'A'];
        if (interactiveElements.includes(target.tagName)) {
            return;
        }

        if (target.closest('input, button, textarea, select, a')) {
            return;
        }

        const sourceId = this.getAttribute('source');
        const content = this.getAttribute('content');
        const question = this.getAttribute('question');
        const animation = this.getAttribute('animation') || 'fade';

        let finalContent = '';

        if (question) {
            finalContent = this._generateQuizContent();
        } else if (sourceId) {
            const sourceElement = document.getElementById(sourceId);
            if (sourceElement) {
                const clonedElement = sourceElement.cloneNode(true);
                clonedElement.style.display = 'block';
                clonedElement.removeAttribute('id');
                finalContent = clonedElement.outerHTML;
            } else {
                finalContent = '<p style="color: var(--ct-color-warning);"><i class="bi bi-exclamation-triangle"></i> 找不到內容來源</p>';
            }
        } else if (content) {
            finalContent = content;
        } else {
            finalContent = '<p style="color: var(--ct-color-warning);"><i class="bi bi-exclamation-triangle"></i> 未設定內容</p>';
        }

        this._replace(finalContent, animation);
    }

    _generateQuizContent() {
        const question = this.getAttribute('question');
        const placeholder = this.getAttribute('placeholder') || '請輸入答案';
        const hint = this.getAttribute('hint');
        const hintTarget = this.getAttribute('hint-target');
        
        const hideSubmit = this.hasAttribute('hide-submit');
        const hideHint = this.hasAttribute('hide-hint');
        const hideReset = this.hasAttribute('hide-reset');
        const hideInfo = this.hasAttribute('hide-info');
        const hasInfo = this.hasAttribute('info') || this.hasAttribute('info-source');
        const infoText = this.getAttribute('info-text') || '額外資訊';
        
        const submitText = this.getAttribute('submit-text') || '提交答案';
        const hintText = this.getAttribute('hint-text') || '提示';
        const resetText = this.getAttribute('reset-text') || '重置';
        
        this._inputId = 'ct-input-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

        let html = `<div class="ct-quiz-content">`;
        html += `<p class="ct-question">${question}</p>`;
        html += `<input type="text" id="${this._inputId}" class="ct-quiz-input" placeholder="${placeholder}">`;
        
        if (!hideSubmit) {
            html += `<button class="ct-quiz-button" onclick="this.closest('card-toggle')._verifyAnswer()">
                <i class="bi bi-check-circle"></i> ${submitText}
            </button>`;
        }
        
        if (hint && !hideHint) {
            if (hintTarget) {
                html += `<button class="ct-reset-button" onclick="this.closest('card-toggle')._showHint()">
                    <i class="bi bi-lightbulb"></i> ${hintText}
                </button>`;
            } else {
                html += `<button class="ct-reset-button" onclick="this.closest('card-toggle')._showInlineHint()">
                    <i class="bi bi-lightbulb"></i> ${hintText}
                </button>`;
            }
        }
        
        if (hasInfo && !hideInfo) {
            html += `<button class="ct-info-button" onclick="this.closest('card-toggle')._toggleInfo(this)">
                <i class="bi bi-info-circle"></i> ${infoText}
            </button>`;
        }

        if (!hideReset) {
            html += `<button class="ct-reset-button" onclick="this.closest('card-toggle').reset()">
                <i class="bi bi-arrow-counterclockwise"></i> ${resetText}
            </button>`;
        }
        
        html += `</div>`;
        
        return html;
    }

    /**
     * 額外資訊：點一次顯示，再點一次收合。
     * info="..."              直接寫 HTML 內容
     * info-source="id"        讀取該區塊（含 <template>）的 innerHTML；優先於 info
     *                         （source 已用於答對後的背面內容，故另用 info-source）
     * info-target="id"        顯示在指定元素，未設定則顯示在卡片內
     */
    _toggleInfo(btn) {
        const targetId = this.getAttribute('info-target');
        const host = targetId
            ? document.getElementById(targetId)
            : this.querySelector('.ct-quiz-content');
        if (!host) {
            console.error(`找不到額外資訊目標元素 #${targetId}`);
            return;
        }

        const existing = host.querySelector(':scope > .ct-info-panel');
        if (existing) {
            existing.remove();
            if (btn) btn.classList.remove('ct-open');
            return;
        }

        let html = '';
        const sourceId = this.getAttribute('info-source');
        if (sourceId) {
            const src = document.getElementById(sourceId);
            html = src
                ? src.innerHTML
                : `<span style="color: var(--ct-color-warning);"><i class="bi bi-exclamation-triangle"></i> 找不到額外資訊來源 #${sourceId}</span>`;
        } else {
            html = this.getAttribute('info') || '';
        }

        const panel = document.createElement('div');
        panel.className = 'ct-info-panel';
        panel.innerHTML = html;
        host.appendChild(panel);
        if (btn) btn.classList.add('ct-open');
        if (targetId) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /* 沒有指定 hint-target 時，以 Bootstrap alert 顯示在卡片內，取代原生 alert() */
    _showInlineHint() {
        const hint = this.getAttribute('hint');
        const box  = this.querySelector('.ct-quiz-content');
        if (!hint || !box) return;
        const old = box.querySelector('.ct-hint-alert');
        if (old) old.remove();
        const el = document.createElement('div');
        el.className = 'alert alert-info ct-hint-alert';
        el.setAttribute('role', 'alert');
        el.innerHTML = `<i class="bi bi-lightbulb-fill"></i> 提示：${hint}`;
        box.appendChild(el);
    }

    _showHint() {
        const hint = this.getAttribute('hint');
        const hintTarget = this.getAttribute('hint-target');
        
        if (!hintTarget) return;
        
        const targetElement = document.getElementById(hintTarget);
        if (!targetElement) {
            console.error(`找不到提示目標元素 #${hintTarget}`);
            return;
        }

        targetElement.innerHTML = '';
        
        const hintDiv = document.createElement('div');
        hintDiv.className = 'ct-hint-display';
        hintDiv.innerHTML = `<strong><i class="bi bi-lightbulb-fill"></i> 提示：</strong>${hint}`;
        
        targetElement.appendChild(hintDiv);
        
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    _replace(content, animation) {
        const colorAfter = this.getAttribute('color-after');
        const autoFlip  = this.getAttribute('auto-flip');   // ms，例如 "3000"
        const isToggle  = this.hasAttribute('toggle') || this.hasAttribute('question');

        const afterReplace = () => {
            this._isFlipped = true;
            if (colorAfter) this.setAttribute('color', colorAfter);

            // toggle 模式：背面仍可點擊，改為 pointer 並顯示提示
            if (isToggle) {
                this.style.cursor = 'pointer';
                this._injectToggleHint();
            }

            // auto-flip：倒數後翻回
            if (autoFlip) {
                const ms = parseInt(autoFlip);
                if (!isNaN(ms) && ms > 0) {
                    this._startAutoFlip(ms);
                }
            }
        };

        if (animation === 'fade') {
            this.style.opacity = '0';
            setTimeout(() => {
                this.innerHTML = content;
                this.setAttribute('replaced', '');
                this.style.opacity = '1';
                afterReplace();
            }, 300);
        } else if (animation === 'slide') {
            this.style.transform = 'translateX(-20px)';
            this.style.opacity = '0';
            setTimeout(() => {
                this.innerHTML = content;
                this.setAttribute('replaced', '');
                this.style.transform = 'translateX(0)';
                this.style.opacity = '1';
                afterReplace();
            }, 300);
        } else {
            this.innerHTML = content;
            this.setAttribute('replaced', '');
            afterReplace();
        }
    }

    /* 注入「點擊翻回」提示標籤 */
    _injectToggleHint() {
        const existing = this.querySelector('.ct-toggle-hint');
        if (existing) return;
        const hint = document.createElement('div');
        hint.className = 'ct-toggle-hint';
        hint.innerHTML = '<i class="bi bi-arrow-repeat"></i> 點擊翻回';
        this.appendChild(hint);
    }

    /* 啟動 auto-flip 倒數，並注入倒數條 */
    /* 將 color 名稱解析為對應的 CSS 顏色值 */
    _resolveColor(name) {
        const map = {
            shell:     'var(--ct-color-shell)',
            lavender:  'var(--ct-color-lavender)',
            special:   'var(--ct-color-special)',
            warning:   'var(--ct-color-warning)',
            salmon:    'var(--ct-color-salmon)',
            attention: 'var(--ct-color-attention)',
            sky:       'var(--ct-color-sky)',
            safe:      'var(--ct-color-safe)',
            vanilla:   'var(--ct-color-vanilla)',
            yellow:    'var(--ct-color-yellow)',
            info:      'var(--ct-color-info)',
            stone:     'var(--ct-color-stone)',
            pink:      'var(--ct-color-pink)',
            orange:    'var(--ct-color-orange)',
            ocean:     'var(--ct-color-ocean)',
            teal:      'var(--ct-color-teal)',
            focus:     'var(--ct-color-focus)',
            indigo:    'var(--ct-color-indigo)',
        };
        if (!name) return null;
        // 若是已知名稱就取 CSS var；否則當作直接色彩值（hex / rgb 等）
        return map[name] || name;
    }

    _startAutoFlip(ms) {
        // 清除舊計時器
        if (this._autoFlipTimer) clearTimeout(this._autoFlipTimer);

        // 插入倒數進度條
        const existing = this.querySelector('.ct-countdown-bar');
        if (existing) existing.remove();

        const bar = document.createElement('div');
        bar.className = 'ct-countdown-bar';
        const inner = document.createElement('div');
        inner.className = 'ct-countdown-inner';
        inner.style.animationDuration = ms + 'ms';

        // 倒數條顏色優先順序：
        //   1. flip-bar-color 屬性（明確指定）
        //   2. color-after 屬性（翻面後顏色）
        //   3. color 屬性（正面顏色）
        //   4. 預設 sky
        const barColorName =
            this.getAttribute('flip-bar-color') ||
            this.getAttribute('color-after')    ||
            this.getAttribute('color')          ||
            'sky';
        const barColor = this._resolveColor(barColorName);
        if (barColor) inner.style.backgroundColor = barColor;

        bar.appendChild(inner);
        this.appendChild(bar);

        this._autoFlipTimer = setTimeout(() => {
            this._flipBack();
        }, ms);
    }

    /* 翻回正面 */
    _flipBack() {
        if (this._autoFlipTimer) {
            clearTimeout(this._autoFlipTimer);
            this._autoFlipTimer = null;
        }

        const animation = this.getAttribute('animation') || 'fade';
        const originalColor = this._originalColor || null;

        if (animation === 'fade') {
            this.style.opacity = '0';
            setTimeout(() => {
                this._restoreFront(originalColor);
                this.style.opacity = '1';
            }, 300);
        } else if (animation === 'slide') {
            this.style.transform = 'translateX(20px)';
            this.style.opacity = '0';
            setTimeout(() => {
                this._restoreFront(originalColor);
                this.style.transform = 'translateX(0)';
                this.style.opacity = '1';
            }, 300);
        } else {
            this._restoreFront(originalColor);
        }
    }

    _restoreFront(originalColor) {
        this.innerHTML = this._originalContent;
        this.removeAttribute('replaced');
        this._isFlipped = false;
        this._attempts = 0;
        // quiz 模式翻回後維持 default；一般卡片清空讓 CSS 決定
        this.style.cursor = this.hasAttribute('question') ? 'default' : '';

        // 恢復原始 color
        if (originalColor) {
            this.setAttribute('color', originalColor);
        } else {
            this.removeAttribute('color');
        }

        // 重設快照旗標，讓下次翻面前重新記錄正確內容
        this._originalContent = this.innerHTML;
    }

    _verifyAnswer() {
        const correctAnswer = this.getAttribute('answer');
        const caseSensitive = this.hasAttribute('case-sensitive');
        const maxAttempts = parseInt(this.getAttribute('max-attempts')) || 999;
        const successMessage = this.getAttribute('success-message') || '答對了！';
        const errorMessage = this.getAttribute('error-message') || '答錯了，請再試一次';
        const successSource = this.getAttribute('success-source');
        const successColor = this.getAttribute('success-color') || 'safe';
        const autoNext = this.hasAttribute('auto-next');

        if (!correctAnswer) {
            console.error('需要設定 answer 屬性');
            return;
        }

        const inputElement = document.getElementById(this._inputId);
        if (!inputElement) {
            console.error('找不到輸入框');
            return;
        }

        let userAnswer = inputElement.value.trim();
        let isCorrect = false;

        if (caseSensitive) {
            isCorrect = userAnswer === correctAnswer;
        } else {
            isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        }

        this._attempts++;

        if (isCorrect) {
            this._handleCorrectAnswer(successSource, successMessage, successColor, autoNext);
        } else {
            if (this._attempts >= maxAttempts) {
                this._handleMaxAttempts(errorMessage);
            } else {
                this._handleWrongAnswer(errorMessage);
            }
        }
    }

    /**
     * 解析正確答案後要顯示的背面內容。
     * 優先順序：success-source → (quiz 模式) source / content → 預設訊息
     */
    _resolveCorrectContent(successSource, successMessage) {
        const cloneEl = (id) => {
            const el = document.getElementById(id);
            if (!el) return null;
            const c = el.cloneNode(true);
            c.style.display = 'block';
            c.removeAttribute('id');
            return c.outerHTML;
        };

        if (successSource) {
            const html = cloneEl(successSource);
            if (html) return html;
        }

        // quiz 模式：source / content 作為解說背面
        if (this.hasAttribute('question')) {
            const sourceId    = this.getAttribute('source');
            const contentAttr = this.getAttribute('content');
            if (sourceId) {
                const html = cloneEl(sourceId);
                if (html) return html;
            }
            if (contentAttr) return contentAttr;
        }

        return `<p class="ct-success"><i class="bi bi-check-circle-fill"></i> ${successMessage || '答對了！'}</p>`;
    }

    _handleCorrectAnswer(successSource, successMessage, successColor, autoNext) {
        const animation      = this.getAttribute('animation') || 'fade';
        const finalContent   = this._resolveCorrectContent(successSource, successMessage);
        const animDelay      = (animation === 'fade' || animation === 'slide') ? 320 : 0;

        // 使用 _replace() 執行翻面動畫（含 toggle hint 注入）
        this._replace(finalContent, animation);

        // 動畫結束後套用成功色
        if (successColor) {
            setTimeout(() => this.setAttribute('color', successColor), animDelay);
        }

        // ★ 通知所屬 group 此題答對
        const group = this.closest('card-toggle-group');
        if (group && group._markAnswered) {
            group._markAnswered(this, 'correct');
        }

        if (autoNext) {
            setTimeout(() => {
                if (group && group._goNext) group._goNext();
            }, 1500);
        }
    }

    _handleWrongAnswer(errorMessage) {
        const existingError = this.querySelector('.ct-error');
        
        if (existingError) {
            existingError.innerHTML = `<i class="bi bi-x-circle"></i> ${errorMessage} (${this._attempts} 次嘗試)`;
        } else {
            const errorElement = document.createElement('p');
            errorElement.className = 'ct-error';
            errorElement.innerHTML = `<i class="bi bi-x-circle"></i> ${errorMessage} (${this._attempts} 次嘗試)`;
            this.querySelector('.ct-quiz-content').appendChild(errorElement);
        }

        this.classList.add('ct-shake');
        setTimeout(() => {
            this.classList.remove('ct-shake');
        }, 500);

        const inputElement = document.getElementById(this._inputId);
        if (inputElement) {
            inputElement.value = '';
            inputElement.focus();
        }
    }

    _handleMaxAttempts(errorMessage) {
        const finalContent = `
            <p style="color: var(--ct-color-warning); font-size: var(--ct-fs-feedback);">
                <i class="bi bi-x-circle-fill"></i> 已達嘗試上限
            </p>
            <p style="margin-top: 8px;">${errorMessage}</p>
        `;
        
        this.innerHTML = finalContent;
        this.setAttribute('replaced', '');
        this.setAttribute('color', 'warning');

        // ★ 通知所屬 group 此題達到上限（答錯）
        const group = this.closest('card-toggle-group');
        if (group && group._markAnswered) {
            group._markAnswered(this, 'wrong');
        }
    }

    reset() {
        const hintTarget = this.getAttribute('hint-target');
        if (hintTarget) {
            const targetElement = document.getElementById(hintTarget);
            if (targetElement) {
                targetElement.innerHTML = '';
            }
        }

        const infoTarget = this.getAttribute('info-target');
        if (infoTarget) {
            const infoEl = document.getElementById(infoTarget);
            if (infoEl) {
                const p = infoEl.querySelector(':scope > .ct-info-panel');
                if (p) p.remove();
            }
        }

        if (this._autoFlipTimer) {
            clearTimeout(this._autoFlipTimer);
            this._autoFlipTimer = null;
        }
        
        this.innerHTML = this._originalContent;
        this.removeAttribute('replaced');
        this._isFlipped = false;
        this._attempts = 0;
        this.style.cursor = '';

        // 快照與 color 同步
        this._originalContent = this.innerHTML;
        if (this._originalColor) {
            this.setAttribute('color', this._originalColor);
        } else {
            this.removeAttribute('color');
        }

        this._initialize();
    }
}

// 群組元件
class CardToggleGroup extends HTMLElement {
    constructor() {
        super();
        this._currentIndex = 0;
        this._cards        = [];
        this._answerState  = [];   // 'unanswered' | 'correct' | 'wrong'
        this._counterEl    = null;
        this._pageButtons  = null;
        this._prevBtn      = null;
        this._nextBtn      = null;
    }

    connectedCallback() {
        if (this._ctGrpConnected) return;
        this._ctGrpConnected = true;
        this._initialize();
    }

    _initialize() {
        const mode = this.getAttribute('mode') || 'stack';
        const theme = this.getAttribute('theme');
        
        // 處理 Theme 變數
        if (theme) {
            this.style.setProperty('--ct-active-color', `var(--ct-color-${theme})`);
        } else {
            // 回退到預設的 special 色彩
            this.style.setProperty('--ct-active-color', `var(--ct-color-special)`);
        }

        ctApplyTypography(this, CT_GROUP_FS.concat(CT_CARD_FS), CT_GROUP_PAD.concat(CT_CARD_PAD));
        ctApplyInfoColors(this);

        this._cards       = Array.from(this.querySelectorAll('card-toggle'));
        this._answerState = this._cards.map(() => 'unanswered');

        if (mode === 'slide') {
            this._setupSlideMode();
        } else if (mode.startsWith('grid')) {
            this._setupGridMode(mode);
        }
    }

    _setupGridMode(modeAttr) {
        /* 解析 mode="grid" 或 mode="grid:12px" */
        const parts = modeAttr.split(':');
        const gap   = parts[1] ? parts[1].trim() : '12px';

        /* cols：優先讀屬性，否則用卡片數量 */
        const cols  = parseInt(this.getAttribute('cols')) || this._cards.length;

        this.style.display              = 'grid';
        this.style.gridTemplateColumns  = `repeat(${cols}, 1fr)`;
        this.style.gap                  = gap;
    }

    _setupSlideMode() {
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'ct-group-cards';

        this._cards.forEach(card => {
            cardsContainer.appendChild(card);
        });

        this.innerHTML = '';

        // ① 計數器（放在卡片上方）
        if (!this.hasAttribute('hide-counter')) {
            const counter = document.createElement('div');
            counter.className = 'ct-counter';
            counter.innerHTML = `<span class="ct-counter-current">1</span> / ${this._cards.length}`;
            this.appendChild(counter);
            this._counterEl = counter;
        }

        this.appendChild(cardsContainer);
        this._createNavigation();
        this._updateSlide();
    }

    _createNavigation() {
        const showPageButtons = this.hasAttribute('show-pages');
        const hideNavButtons = this.hasAttribute('hide-nav-buttons');
        
        if (!hideNavButtons) {
            const navDiv = document.createElement('div');
            navDiv.className = 'ct-nav-buttons';
            
            const prevBtn = document.createElement('button');
            prevBtn.className = 'ct-nav-btn';
            prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i> 上一張';
            prevBtn.onclick = () => this._goPrev();
            
            const nextBtn = document.createElement('button');
            nextBtn.className = 'ct-nav-btn';
            nextBtn.innerHTML = '下一張 <i class="bi bi-chevron-right"></i>';
            nextBtn.onclick = () => this._goNext();
            
            navDiv.appendChild(prevBtn);
            navDiv.appendChild(nextBtn);
            this.appendChild(navDiv);
            
            this._prevBtn = prevBtn;
            this._nextBtn = nextBtn;
        }
        
        if (showPageButtons) {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'ct-page-buttons';
            
            this._cards.forEach((card, index) => {
                const pageBtn = document.createElement('button');
                pageBtn.className = 'ct-page-btn';
                pageBtn.textContent = index + 1;
                pageBtn.onclick = () => this._goToPage(index);
                pageDiv.appendChild(pageBtn);
            });
            
            this.appendChild(pageDiv);
            this._pageButtons = Array.from(pageDiv.querySelectorAll('.ct-page-btn'));
        }
    }

    _updateSlide() {
        const cardsContainer = this.querySelector('.ct-group-cards');
        if (!cardsContainer) return;

        const offset = -this._currentIndex * 100;
        cardsContainer.style.transform = `translateX(${offset}%)`;

        // ① 計數器
        if (this._counterEl) {
            this._counterEl.innerHTML =
                `<span class="ct-counter-current">${this._currentIndex + 1}</span> / ${this._cards.length}`;
        }

        // ② 上一頁按鈕
        if (this._prevBtn) {
            this._prevBtn.disabled = this._currentIndex === 0;
        }

        // ③ 下一頁按鈕：鎖頁模式下，當前題未答不能前進
        if (this._nextBtn) {
            const isLast    = this._currentIndex === this._cards.length - 1;
            const lockNav   = this.hasAttribute('lock-nav');
            const curState  = this._answerState[this._currentIndex];
            const locked    = lockNav && curState === 'unanswered';
            this._nextBtn.disabled = isLast || locked;
            this._nextBtn.title    = locked ? '請先作答才能繼續' : '';
        }

        // ④ 頁碼按鈕狀態
        if (this._pageButtons) {
            this._pageButtons.forEach((btn, index) => {
                btn.classList.toggle('active', index === this._currentIndex);
                // 狀態色（不蓋掉 active 的底色，由 CSS 疊加）
                btn.classList.remove('answered-correct', 'answered-wrong');
                const st = this._answerState[index];
                if (st === 'correct') btn.classList.add('answered-correct');
                if (st === 'wrong')   btn.classList.add('answered-wrong');
            });
        }

        // ⑤ 檢查是否全部完成
        this._checkAllAnswered();
    }

    _goPrev() {
        if (this._currentIndex > 0) {
            this._currentIndex--;
            this._updateSlide();
        }
    }

    _goNext() {
        const lockNav  = this.hasAttribute('lock-nav');
        const curState = this._answerState[this._currentIndex];
        if (lockNav && curState === 'unanswered') return;
        if (this._currentIndex < this._cards.length - 1) {
            this._currentIndex++;
            this._updateSlide();
        }
    }

    _goToPage(index) {
        if (index >= 0 && index < this._cards.length) {
            // lock-nav 模式：只能跳到已答或當前題
            if (this.hasAttribute('lock-nav')) {
                const targetState = this._answerState[index];
                const isAnswered  = targetState !== 'unanswered';
                const isCurrent   = index === this._currentIndex;
                const isNext      = index === this._currentIndex + 1 &&
                                    this._answerState[this._currentIndex] !== 'unanswered';
                if (!isAnswered && !isCurrent && !isNext) return;
            }
            this._currentIndex = index;
            this._updateSlide();
        }
    }

    /* ── ② 答題狀態追蹤 ───────────────────────────────────────── */
    _markAnswered(cardEl, state /* 'correct' | 'wrong' */) {
        const index = this._cards.indexOf(cardEl);
        if (index === -1) return;
        this._answerState[index] = state;
        this._updateSlide();
    }

    /* ── ④ 檢查是否全部完成，觸發結果畫面 ───────────────────── */
    _checkAllAnswered() {
        if (!this.hasAttribute('show-result')) return;
        const allDone = this._answerState.every(s => s !== 'unanswered');
        if (!allDone) return;

        // 避免重複顯示
        if (this._resultShown) return;
        this._resultShown = true;

        setTimeout(() => this._showResult(), 600);
    }

    _showResult() {
        const correct  = this._answerState.filter(s => s === 'correct').length;
        const wrong    = this._answerState.filter(s => s === 'wrong').length;
        const total    = this._cards.length;
        const skipped  = total - correct - wrong;
        const pct      = Math.round((correct / total) * 100);

        const resultSource = this.getAttribute('result-source');
        const retryLabel   = this.getAttribute('retry-label') || '↺ 重新作答';

        let customHTML = '';
        if (resultSource) {
            const el = document.getElementById(resultSource);
            if (el) {
                const clone = el.cloneNode(true);
                clone.style.display = 'block';
                clone.removeAttribute('id');
                customHTML = clone.outerHTML;
            }
        }

        const resultEl = document.createElement('div');
        resultEl.className = 'ct-result-screen';
        resultEl.innerHTML = `
            <div class="ct-result-score">${pct}%</div>
            <div class="ct-result-label">共 ${total} 題答題完成</div>
            <div class="ct-result-breakdown">
                <span class="ct-result-correct">✓ 答對 ${correct} 題</span>
                ${wrong   > 0 ? `<span class="ct-result-wrong">✗ 答錯 ${wrong} 題</span>`   : ''}
                ${skipped > 0 ? `<span class="ct-result-skipped">略過 ${skipped} 題</span>` : ''}
            </div>
            ${customHTML}
            <button class="ct-result-retry" onclick="this.closest('card-toggle-group')._retryAll()">
                ${retryLabel}
            </button>
        `;

        // 取代整個 group 內容
        this.innerHTML = '';
        this.appendChild(resultEl);
    }

    _retryAll() {
        // 重設所有狀態重新初始化
        this._currentIndex = 0;
        this._answerState  = [];
        this._resultShown  = false;
        this._counterEl    = null;
        this._pageButtons  = null;
        this._prevBtn      = null;
        this._nextBtn      = null;
        this._ctGrpConnected = false;
        this.connectedCallback();
    }
}

customElements.define('card-toggle', CardToggle);
customElements.define('card-toggle-group', CardToggleGroup);
