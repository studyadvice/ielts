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
                --ct-bg-primary:      #0c0d0c;
                --ct-bg-secondary:    #140d14;
                --ct-color-shell:     #c6c7bd;
                --ct-color-lavender:  #C3A5E5;
                --ct-color-special:   #b3de73;
                --ct-color-warning:   #F08080;
                --ct-color-salmon:    #E5C3B3;
                --ct-color-attention: #DECA4B;
                --ct-color-sky:       #95c9de;
                --ct-color-safe:      #299459;
                --ct-color-vanilla:   #DBEDD8;
                --ct-color-yellow:    #DECA4B;
                --ct-color-info:      #1E65C7;
                --ct-color-stone:     #95c9de;
                --ct-color-ocean:     #0ABDC6;
                --ct-color-teal:      #0DA591;
                --ct-color-focus:     #e0be79;
                --ct-color-indigo:    #9B72CF;
                --ct-color-pink:      #FFB3D9;
                --ct-color-orange:    #eda109;
                /* 左側 bar 寬度 */
                --ct-bar-width:       3px;
                --ct-bar-width-hover: 5px;
                /* 預設動態顏色變數 */
                --ct-active-color: var(--ct-color-special);
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
                border: 1px solid rgba(198, 199, 189, 0.2);
                color: var(--ct-color-shell);
                line-height: 1.5;
                font-size: 1rem;
            }

            card-toggle::before {
                content: '';
                position: absolute;
                left: 0;
                top: 20%;
                bottom: 20%;
                width: var(--ct-bar-width, 3px);
                border-radius: 0 2px 2px 0;
                background-color: var(--ct-bg-primary);
                transition: width 0.2s ease, background-color 0.2s ease;
            }

            card-toggle:hover::before {
                width: var(--ct-bar-width-hover, 5px);
            }

            card-toggle:hover {
                background-color: rgba(198, 199, 189, 0.04);
                box-shadow: 0 0 0 1px rgba(198, 199, 189, 0.12);
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
                border-color: rgba(198, 199, 189, 0.5);
                border-width: 1px;
            }

            card-toggle[dashed][color="safe"]      { border-color: rgba(41,148,89,0.55); }
            card-toggle[dashed][color="warning"]   { border-color: rgba(240,128,128,0.55); }
            card-toggle[dashed][color="info"]      { border-color: rgba(30,101,199,0.55); }
            card-toggle[dashed][color="special"]   { border-color: rgba(179,222,115,0.55); }
            card-toggle[dashed][color="sky"]       { border-color: rgba(149,201,222,0.55); }
            card-toggle[dashed][color="lavender"]  { border-color: rgba(195,165,229,0.55); }
            card-toggle[dashed][color="attention"] { border-color: rgba(222,202,75,0.55); }
            card-toggle[dashed][color="salmon"]    { border-color: rgba(229,195,179,0.55); }
            card-toggle[dashed][color="pink"]      { border-color: rgba(255,179,217,0.55); }
            card-toggle[dashed][color="orange"]    { border-color: rgba(237,161,9,0.55); }
            card-toggle[dashed][color="stone"]     { border-color: rgba(149,201,222,0.55); }
            card-toggle[dashed][color="ocean"]    { border-color: rgba(10,189,198,0.55); }
            card-toggle[dashed][color="teal"]     { border-color: rgba(13,165,145,0.55); }
            card-toggle[dashed][color="focus"]    { border-color: rgba(224,190,121,0.55); }
            card-toggle[dashed][color="indigo"]   { border-color: rgba(155,114,207,0.55); }

            card-toggle[size="xsm"] {
                padding: 3px 8px 3px 7px;
                font-size: 0.9rem;
            }

            card-toggle[size="sm"] {
                padding: 6px 14px 6px 12px;
                font-size: 0.95rem;
            }

            card-toggle[size="lg"] {
                padding: 13px 20px 13px 18px;
                font-size: 1.1rem;
            }

            card-toggle[size="xlg"] {
                padding: 16px 24px 16px 22px;
                font-size: 1.2rem;
            }

            card-toggle[color="safe"]::before { background-color: var(--ct-color-safe); }
            card-toggle[color="safe"]:hover {
                background-color: rgba(41,148,89, 0.05);
                box-shadow: 0 0 0 1px rgba(41,148,89, 0.2);
            }

            card-toggle[color="warning"]::before { background-color: var(--ct-color-warning); }
            card-toggle[color="warning"]:hover {
                background-color: rgba(240, 128, 128, 0.05);
                box-shadow: 0 0 0 1px rgba(240, 128, 128, 0.2);
            }

            card-toggle[color="info"]::before { background-color: var(--ct-color-info); }
            card-toggle[color="info"]:hover {
                background-color: rgba(30,101,199, 0.05);
                box-shadow: 0 0 0 1px rgba(30,101,199, 0.2);
            }

            card-toggle[color="special"]::before { background-color: var(--ct-color-special); }
            card-toggle[color="special"]:hover {
                background-color: rgba(179,222,115, 0.05);
                box-shadow: 0 0 0 1px rgba(179,222,115, 0.2);
            }

            card-toggle[color="sky"]::before { background-color: var(--ct-color-sky); }
            card-toggle[color="sky"]:hover {
                background-color: rgba(149, 201, 222, 0.05);
                box-shadow: 0 0 0 1px rgba(149, 201, 222, 0.2);
            }

            card-toggle[color="lavender"]::before { background-color: var(--ct-color-lavender); }
            card-toggle[color="lavender"]:hover {
                background-color: rgba(195, 165, 229, 0.05);
                box-shadow: 0 0 0 1px rgba(195, 165, 229, 0.2);
            }

            card-toggle[color="attention"]::before { background-color: var(--ct-color-attention); }
            card-toggle[color="attention"]:hover {
                background-color: rgba(222, 202, 75, 0.05);
                box-shadow: 0 0 0 1px rgba(222, 202, 75, 0.2);
            }

            card-toggle[color="salmon"]::before { background-color: var(--ct-color-salmon); }
            card-toggle[color="salmon"]:hover {
                background-color: rgba(229, 195, 179, 0.05);
                box-shadow: 0 0 0 1px rgba(229, 195, 179, 0.2);
            }

            card-toggle[color="shell"]::before { background-color: var(--ct-color-shell); }
            card-toggle[color="shell"]:hover {
                background-color: rgba(198, 199, 189, 0.05);
                box-shadow: 0 0 0 1px rgba(198, 199, 189, 0.2);
            }

            card-toggle[color="pink"]::before { background-color: var(--ct-color-pink); }
            card-toggle[color="pink"]:hover {
                background-color: rgba(255, 179, 217, 0.05);
                box-shadow: 0 0 0 1px rgba(255, 179, 217, 0.2);
            }

            card-toggle[color="orange"]::before { background-color: var(--ct-color-orange); }
            card-toggle[color="orange"]:hover {
                background-color: rgba(237, 161, 9, 0.05);
                box-shadow: 0 0 0 1px rgba(237, 161, 9, 0.2);
            }

            card-toggle[color="stone"]::before { background-color: var(--ct-color-stone); }
            card-toggle[color="stone"]:hover {
                background-color: rgba(149,201,222, 0.05);
                box-shadow: 0 0 0 1px rgba(149,201,222, 0.2);
            }
            card-toggle[color="ocean"]::before { background-color: var(--ct-color-ocean); }
            card-toggle[color="ocean"]:hover {
                background-color: rgba(10, 189, 198, 0.05);
                box-shadow: 0 0 0 1px rgba(10, 189, 198, 0.2);
            }
            card-toggle[color="teal"]::before { background-color: var(--ct-color-teal); }
            card-toggle[color="teal"]:hover {
                background-color: rgba(13, 165, 145, 0.05);
                box-shadow: 0 0 0 1px rgba(13, 165, 145, 0.2);
            }
            card-toggle[color="focus"]::before { background-color: var(--ct-color-focus); }
            card-toggle[color="focus"]:hover {
                background-color: rgba(224, 190, 121, 0.05);
                box-shadow: 0 0 0 1px rgba(224, 190, 121, 0.2);
            }
            card-toggle[color="indigo"]::before { background-color: var(--ct-color-indigo); }
            card-toggle[color="indigo"]:hover {
                background-color: rgba(155, 114, 207, 0.05);
                box-shadow: 0 0 0 1px rgba(155, 114, 207, 0.2);
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

            .ct-quiz-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid rgba(198, 199, 189, 0.2);
                border-radius: 5px;
                background-color: var(--ct-bg-primary);
                color: var(--ct-color-shell);
                font-size: 1rem;
                margin-top: 12px;
                transition: border-color 0.3s ease;
                box-sizing: border-box;
            }

            .ct-quiz-input:focus {
                outline: none;
                border-color: var(--ct-color-special);
            }

            /* 按鈕基礎樣式 */
            .ct-quiz-button {
                padding: 10px 24px;
                border: none;
                border-radius: 5px;
                background-color: var(--ct-color-special);
                color: var(--ct-bg-primary);
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                margin-top: 12px;
                transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
            }

            .ct-quiz-button:hover {
                background-color: var(--ct-color-sky);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(149, 201, 222, 0.3);
            }

            .ct-quiz-button:active {
                transform: translateY(0);
            }

            .ct-reset-button {
                padding: 8px 16px;
                border: 1px solid var(--ct-color-lavender);
                border-radius: 5px;
                background-color: transparent;
                color: var(--ct-color-lavender);
                font-size: 0.9rem;
                cursor: pointer;
                margin-top: 12px;
                margin-left: 8px;
                transition: background-color 0.18s ease, border-color 0.18s ease;
            }

            .ct-reset-button:hover {
                background-color: rgba(195, 165, 229, 0.1);
            }

            /* 尺寸相關的按鈕樣式 */
            card-toggle[size="xsm"] .ct-quiz-button {
                padding: 6px 12px;
                font-size: 0.85rem;
            }

            card-toggle[size="xsm"] .ct-reset-button {
                padding: 5px 10px;
                font-size: 0.8rem;
            }

            card-toggle[size="xsm"] .ct-quiz-input {
                padding: 8px 12px;
                font-size: 0.85rem;
            }

            card-toggle[size="sm"] .ct-quiz-button {
                padding: 8px 16px;
                font-size: 0.9rem;
            }

            card-toggle[size="sm"] .ct-reset-button {
                padding: 6px 12px;
                font-size: 0.85rem;
            }

            card-toggle[size="sm"] .ct-quiz-input {
                padding: 10px 14px;
                font-size: 0.9rem;
            }

            card-toggle[size="lg"] .ct-quiz-button {
                padding: 12px 28px;
                font-size: 1.05rem;
            }

            card-toggle[size="lg"] .ct-reset-button {
                padding: 9px 18px;
                font-size: 0.95rem;
            }

            card-toggle[size="lg"] .ct-quiz-input {
                padding: 14px 18px;
                font-size: 1.05rem;
            }

            card-toggle[size="xlg"] .ct-quiz-button {
                padding: 14px 32px;
                font-size: 1.1rem;
            }

            card-toggle[size="xlg"] .ct-reset-button {
                padding: 10px 20px;
                font-size: 1rem;
            }

            card-toggle[size="xlg"] .ct-quiz-input {
                padding: 13px 20px 13px 18px;
                font-size: 1.1rem;
            }

            .ct-error {
                color: var(--ct-color-warning);
                margin-top: 8px;
                font-size: 0.9rem;
            }

            .ct-success {
                color: var(--ct-color-safe);
                font-size: 1.1rem;
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
                margin-top: 16px;
            }

            .ct-nav-btn {
                padding: 8px 20px;
                border: 1px solid var(--ct-color-shell);
                border-radius: 5px;
                background-color: transparent;
                color: var(--ct-color-shell);
                cursor: pointer;
                transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
                font-size: 0.95rem;
            }

            .ct-nav-btn:hover:not(:disabled) {
                background-color: rgba(198, 199, 189, 0.1);
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
                margin-top: 12px;
                flex-wrap: wrap;
            }

            .ct-page-btn {
                width: 32px;
                height: 32px;
                border: 1px solid rgba(198, 199, 189, 0.3);
                border-radius: 4px;
                background-color: transparent;
                color: var(--ct-color-shell);
                cursor: pointer;
                transition: background-color 0.18s ease, border-color 0.18s ease;
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ct-page-btn:hover {
                background-color: rgba(198, 199, 189, 0.1);
                border-color: var(--ct-active-color);
            }

            .ct-page-btn.active {
                background-color: var(--ct-active-color);
                color: var(--ct-bg-primary);
                border-color: var(--ct-active-color);
                font-weight: 600;
            }

            /* ── 答題狀態頁碼 ── */
            .ct-page-btn.answered-correct {
                border-color: rgba(41,148,89, 0.6);
                color: var(--ct-color-safe);
                background-color: rgba(41,148,89, 0.08);
            }
            .ct-page-btn.answered-correct.active {
                background-color: var(--ct-color-safe);
                color: var(--ct-bg-primary);
                border-color: var(--ct-color-safe);
            }
            .ct-page-btn.answered-wrong {
                border-color: rgba(237, 161, 9, 0.6);
                color: var(--ct-color-orange);
                background-color: rgba(237, 161, 9, 0.08);
            }
            .ct-page-btn.answered-wrong.active {
                background-color: var(--ct-color-orange);
                color: var(--ct-bg-primary);
                border-color: var(--ct-color-orange);
            }

            /* ── 題目計數器 ── */
            .ct-counter {
                text-align: center;
                font-size: 0.8rem;
                color: rgba(198, 199, 189, 0.55);
                margin-bottom: 10px;
                letter-spacing: 0.04em;
                user-select: none;
            }
            .ct-counter-current {
                color: var(--ct-active-color);
                font-weight: 700;
                font-size: 0.9rem;
            }

            /* ── 完成畫面 ── */
            .ct-result-screen {
                padding: 28px 24px;
                border-radius: 6px;
                background-color: var(--ct-bg-secondary);
                border: 1px solid rgba(198, 199, 189, 0.15);
                text-align: center;
                animation: ct-fade-in 0.35s ease;
            }
            .ct-result-score {
                font-size: 2.4rem;
                font-weight: 700;
                color: var(--ct-active-color);
                line-height: 1.2;
                margin-bottom: 6px;
            }
            .ct-result-label {
                font-size: 0.88rem;
                color: rgba(198, 199, 189, 0.6);
                margin-bottom: 20px;
            }
            .ct-result-breakdown {
                display: flex;
                justify-content: center;
                gap: 24px;
                margin-bottom: 20px;
                font-size: 0.88rem;
            }
            .ct-result-correct { color: var(--ct-color-safe); }
            .ct-result-wrong   { color: var(--ct-color-orange); }
            .ct-result-skipped { color: rgba(198, 199, 189, 0.5); }
            .ct-result-retry {
                padding: 8px 22px;
                border: 1px solid var(--ct-active-color);
                border-radius: 5px;
                background: transparent;
                color: var(--ct-active-color);
                cursor: pointer;
                font-size: 0.9rem;
                transition: background-color 0.18s ease;
            }
            .ct-result-retry:hover {
                background-color: rgba(198, 199, 189, 0.08);
            }

            /* 提示區域樣式 */
            .ct-hint-display {
                padding: 9px 14px;
                background-color: rgba(195, 165, 229, 0.1);
                border-left: 2px solid var(--ct-color-lavender);
                border-radius: 0 4px 4px 0;
                margin-top: 10px;
                color: var(--ct-color-lavender);
                animation: ct-fade-in 0.3s ease;
            }

            /* auto-flip 倒數進度條 */
            .ct-countdown-bar {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background-color: rgba(198, 199, 189, 0.1);
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
                font-size: 0.8rem;
                color: var(--ct-color-stone);
                opacity: 0.75;
                user-select: none;
            }

            .ct-toggle-hint i {
                margin-right: 4px;
            }

            /* toggle 模式背面 hover 效果 */
            card-toggle[replaced][toggle]:hover {
                background-color: rgba(198, 199, 189, 0.06);
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
                --ct-skin-line: rgba(198,199,189,0.08);
                background-image:
                    linear-gradient(var(--ct-skin-line) 1px, transparent 1px),
                    linear-gradient(90deg, var(--ct-skin-line) 1px, transparent 1px);
                background-size: 24px 24px;
            }

            /* ruled：橫線 */
            card-toggle[skin="ruled"] {
                --ct-skin-line: rgba(198,199,189,0.1);
                background-image:
                    linear-gradient(transparent calc(100% - 1px), var(--ct-skin-line) 1px);
                background-size: 100% 28px;
                background-position: 0 0;
            }

            /* blueprint：雙密度格線（天藍調） */
            card-toggle[skin="blueprint"] {
                background-image:
                    linear-gradient(rgba(149,201,222,0.1)  1px, transparent 1px),
                    linear-gradient(90deg, rgba(149,201,222,0.1)  1px, transparent 1px),
                    linear-gradient(rgba(149,201,222,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(149,201,222,0.04) 1px, transparent 1px);
                background-size: 60px 60px, 60px 60px, 12px 12px, 12px 12px;
            }

            /* split：上半稍亮 / 下半稍暗 */
            card-toggle[skin="split"] {
                background-image: linear-gradient(
                    to bottom,
                    rgba(255,255,255,0.04) 0%,
                    rgba(255,255,255,0.04) 50%,
                    rgba(0,0,0,0.1) 50%,
                    rgba(0,0,0,0.1) 100%
                );
            }

            /* band：頂部色帶 */
            card-toggle[skin="band"] {
                background-image: linear-gradient(
                    to bottom,
                    rgba(255,255,255,0.07) 0px,
                    rgba(255,255,255,0.07) 36px,
                    transparent 36px
                );
            }

            /* skin × color：grid / ruled 線條跟隨色票 */
            card-toggle[skin="grid"][color="sky"],
            card-toggle[skin="ruled"][color="sky"]      { --ct-skin-line: rgba(149,201,222,0.1); }
            card-toggle[skin="grid"][color="lavender"],
            card-toggle[skin="ruled"][color="lavender"]  { --ct-skin-line: rgba(195,165,229,0.1); }
            card-toggle[skin="grid"][color="safe"],
            card-toggle[skin="ruled"][color="safe"]      { --ct-skin-line: rgba(41,148,89,0.1); }
            card-toggle[skin="grid"][color="warning"],
            card-toggle[skin="ruled"][color="warning"]   { --ct-skin-line: rgba(240,128,128,0.1); }
            card-toggle[skin="grid"][color="info"],
            card-toggle[skin="ruled"][color="info"]      { --ct-skin-line: rgba(30,101,199,0.1); }
            card-toggle[skin="grid"][color="orange"],
            card-toggle[skin="ruled"][color="orange"]    { --ct-skin-line: rgba(237,161,9,0.1); }
            card-toggle[skin="grid"][color="focus"],
            card-toggle[skin="ruled"][color="focus"]     { --ct-skin-line: rgba(224,190,121,0.1); }
            card-toggle[skin="grid"][color="teal"],
            card-toggle[skin="ruled"][color="teal"]      { --ct-skin-line: rgba(13,165,145,0.1); }
            card-toggle[skin="grid"][color="ocean"],
            card-toggle[skin="ruled"][color="ocean"]     { --ct-skin-line: rgba(10,189,198,0.1); }
            card-toggle[skin="grid"][color="indigo"],
            card-toggle[skin="ruled"][color="indigo"]    { --ct-skin-line: rgba(155,114,207,0.1); }
            card-toggle[skin="grid"][color="pink"],
            card-toggle[skin="ruled"][color="pink"]      { --ct-skin-line: rgba(255,179,217,0.1); }
            card-toggle[skin="grid"][color="salmon"],
            card-toggle[skin="ruled"][color="salmon"]    { --ct-skin-line: rgba(229,195,179,0.1); }
            card-toggle[skin="grid"][color="special"],
            card-toggle[skin="ruled"][color="special"]   { --ct-skin-line: rgba(179,222,115,0.1); }
            card-toggle[skin="grid"][color="shell"],
            card-toggle[skin="ruled"][color="shell"]     { --ct-skin-line: rgba(198,199,189,0.13); }

            /* ── shape="envelope"：信封形狀 ──────────────────────────────── */
            /*
             * clip-path: polygon(0 36px, 50% 0, 100% 36px, 100% 100%, 0 100%)
             * 固定 36px 折痕深度，不受卡片高度百分比影響。
             * ::after 繪製兩條對角折痕線（X → V 形），顏色跟隨 color 屬性。
             * ::before 左側 bar 從折痕線起始（top: 36px），視覺整齊。
             */
            card-toggle[shape="envelope"] {
                --ct-envelope-fold: rgba(198,199,189,0.18);
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
            card-toggle[shape="envelope"][color="sky"]      { --ct-envelope-fold: rgba(149,201,222,0.3); }
            card-toggle[shape="envelope"][color="lavender"] { --ct-envelope-fold: rgba(195,165,229,0.3); }
            card-toggle[shape="envelope"][color="safe"]     { --ct-envelope-fold: rgba(41,148,89,0.3); }
            card-toggle[shape="envelope"][color="warning"]  { --ct-envelope-fold: rgba(240,128,128,0.3); }
            card-toggle[shape="envelope"][color="info"]     { --ct-envelope-fold: rgba(30,101,199,0.3); }
            card-toggle[shape="envelope"][color="orange"]   { --ct-envelope-fold: rgba(237,161,9,0.3); }
            card-toggle[shape="envelope"][color="focus"]    { --ct-envelope-fold: rgba(224,190,121,0.3); }
            card-toggle[shape="envelope"][color="teal"]     { --ct-envelope-fold: rgba(13,165,145,0.3); }
            card-toggle[shape="envelope"][color="ocean"]    { --ct-envelope-fold: rgba(10,189,198,0.3); }
            card-toggle[shape="envelope"][color="indigo"]   { --ct-envelope-fold: rgba(155,114,207,0.3); }
            card-toggle[shape="envelope"][color="pink"]     { --ct-envelope-fold: rgba(255,179,217,0.3); }
            card-toggle[shape="envelope"][color="salmon"]   { --ct-envelope-fold: rgba(229,195,179,0.3); }
            card-toggle[shape="envelope"][color="special"]  { --ct-envelope-fold: rgba(179,222,115,0.3); }
            card-toggle[shape="envelope"][color="shell"]    { --ct-envelope-fold: rgba(198,199,189,0.28); }
            card-toggle[shape="envelope"][color="attention"]{ --ct-envelope-fold: rgba(222,202,75,0.3); }
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
    }

    _addNumber() {
        const number = this.getAttribute('number');
        const numberSize = this.getAttribute('number-size') || '0.8rem';
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'ct-number';
        numberSpan.textContent = number + '. ';
        numberSpan.style.opacity = '0.6';
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
        
        const submitText = this.getAttribute('submit-text') || '提交答案';
        const hintText = this.getAttribute('hint-text') || '提示';
        const resetText = this.getAttribute('reset-text') || '重置';
        
        this._inputId = 'ct-input-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

        let html = `<div class="ct-quiz-content">`;
        html += `<p>${question}</p>`;
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
                html += `<button class="ct-reset-button" onclick="alert('提示：${hint}')">
                    <i class="bi bi-lightbulb"></i> ${hintText}
                </button>`;
            }
        }
        
        if (!hideReset) {
            html += `<button class="ct-reset-button" onclick="this.closest('card-toggle').reset()">
                <i class="bi bi-arrow-counterclockwise"></i> ${resetText}
            </button>`;
        }
        
        html += `</div>`;
        
        return html;
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
            <p style="color: var(--ct-color-warning); font-size: 1rem;">
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
                ${skipped > 0 ? `<span class="ct-result-skipped">— 略過 ${skipped} 題</span>` : ''}
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