/**
 * term-glossary 詞彙表元件
 *
 * 掃描頁面中標有 data-term 的元素，彙整成詞彙表，以 Bootstrap offcanvas 顯示。
 * 需要頁面已載入 Bootstrap 5（含 JavaScript bundle）與 Bootstrap Icons。
 * 不使用 shadow DOM，JavaScript 與 CSS 都在本檔案內。
 *
 * ── 基本用法 ─────────────────────────────────────────────
 * 1. 頁面放一個 <term-glossary></term-glossary>
 * 2. 在頁面內容標記詞彙：<span data-term="vi">Vi</span>
 * 3. 解釋固定放在 id 為「{data-term 的值}_info」的區塊：
 *      <div id="vi_info" hidden data-title="不及物動詞 Vi" data-group="文法">沒有受詞的動詞。</div>
 *    同一個 data-term 不論出現幾次，只收錄一筆詞條。
 *
 * ── 詞條資訊（寫在 _info 區塊上）──────────────────────────
 * data-title   詞條顯示名稱，未設定時使用第一個標記處的文字
 * data-group   分組名稱
 * data-theme   詞條專屬色票或色彩
 *
 * ── 標記處可用的屬性 ─────────────────────────────────────
 * data-term-example   手動例句（HTML），排在自動擷取的例句之前
 * data-term-title / data-term-group / data-term-theme   _info 區塊未設定時的備用
 * data-term-click     off 為點擊不開啟詞彙表；open 為即使有 data-popover-* 仍開啟
 *
 * ── <term-glossary> 屬性 ─────────────────────────────────
 * heading        offcanvas 標題，預設「詞彙表」
 * theme          色票名稱，或 auto（依分組輪流配色），預設 sky
 * theme-accent   覆蓋主題色（任何 CSS 色彩）
 * theme-bg / theme-fg   覆蓋底色與文字色
 * group-themes   各分組配色，例如 "文法:sky,詞彙:salmon"
 * mark-style     頁面標記樣式：dotted（預設）、solid、band、none
 * fs / lh / ff   整體字體大小（純數字為 rem）、行高（預設 1.4）、字型
 * fs-{部位} / ff-{部位}   部位：fab title search tag name def example count empty
 * pad-{部位}     部位：fab search tag entry（純數字為 px，可寫 "6 12"）
 * offcanvas-width  offcanvas 寬度（純數字為 rem，也可寫 480px、40vw），預設 32
 * width          offcanvas-width 的舊名稱，仍可使用，兩者同時存在時以 offcanvas-width 為準
 * position       end（預設）或 start
 * modal          加上後使用遮罩，頁面不可捲動
 * sort           order（出現順序，預設）或 alpha
 * example-max    每個詞條預設顯示的例句數，預設 3
 * scope          只掃描符合此選擇器的範圍，預設整個 body
 * trigger        選擇器，點擊符合的元素即開啟詞彙表
 * no-fab         不顯示浮動按鈕
 * fab-text / fab-icon / fab-pos   浮動按鈕文字、圖示、位置（bottom-end 等）
 *
 * ── 方法與事件 ───────────────────────────────────────────
 * open(key?)  close()  toggle()  refresh()  terms（唯讀陣列）
 * 事件：glossary-updated（detail.count）、glossary-open、glossary-close
 */
(() => {
    'use strict';
    if (customElements.get('term-glossary')) return;

    const PALETTE = {
        background: '#0C0D0C', shell: '#C6C7BD', lavender: '#C3A5E5', sky: '#82C8E5',
        warning: '#E6374B', salmon: '#E5C3B3', ocean: '#1CCAE8', safe: '#27AE60',
        teal: '#0DA591', vanilla: '#DBEDD8', yellow: '#E3D322', focus: '#D4FFFC',
        special: '#B3DE73', info: '#4171BF', indigo: '#7849C9', pink: '#FF91D7', orange: '#EDA109'
    };
    const AUTO_ORDER = ['sky', 'salmon', 'lavender', 'special', 'ocean', 'pink', 'orange', 'teal', 'yellow', 'vanilla'];
    const BLOCK_SEL = 'li,p,td,th,dd,dt,h1,h2,h3,h4,h5,h6,blockquote,figcaption,summary,pre,div';
    const BREAKERS = new Set(['LI', 'P', 'DIV', 'TR', 'TD', 'TH', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DT',
        'BLOCKQUOTE', 'UL', 'OL', 'TABLE', 'SECTION', 'ARTICLE', 'DETAILS', 'SUMMARY', 'FIGCAPTION', 'PRE']);
    const FS_PARTS = ['fab', 'title', 'search', 'tag', 'name', 'def', 'example', 'count', 'empty'];
    const PAD_PARTS = ['fab', 'search', 'tag', 'entry'];
    const NUM = /^\d+(\.\d+)?$/;
    const DARK = '#0C0D0C';
    const LIGHT = '#F5F5F0';

    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const resolveColor = v => { const k = String(v || '').trim(); return PALETTE[k.toLowerCase()] || k; };
    const onColor = c => {
        const m = /^#([0-9a-f]{6})$/i.exec(c);
        if (!m) return DARK;
        const n = parseInt(m[1], 16);
        const lum = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
        return lum > 0.45 ? DARK : LIGHT;
    };
    const stripTags = h => String(h).replace(/<[^>]*>/g, '');

    const CSS = `
    term-glossary { display: contents; --tg-bg: #0C0D0C; --tg-fg: #C6C7BD; --tg-accent: #82C8E5; --tg-on-accent: #0C0D0C; }

    /* 頁面上的標記詞 */
    [data-term][data-tg-mark] { cursor: pointer; }
    [data-term][data-tg-mark="dotted"] { text-decoration: underline dotted var(--tg-mark-color, #82C8E5) 2px; text-underline-offset: 4px; }
    [data-term][data-tg-mark="solid"]  { text-decoration: underline solid var(--tg-mark-color, #82C8E5) 2px; text-underline-offset: 4px; }
    [data-term][data-tg-mark="band"] {
        background-image: linear-gradient(var(--tg-mark-color, #82C8E5), var(--tg-mark-color, #82C8E5));
        background-repeat: no-repeat; background-size: 100% 0.3em; background-position: 0 92%;
    }
    [data-term][data-tg-noclick] { cursor: inherit; }
    .tg-term-flash { animation: tg-term-flash 1.8s ease-out; }
    @keyframes tg-term-flash {
        0%, 65% { outline: 3px solid var(--tg-mark-color, #D4FFFC); outline-offset: 3px; }
        100%    { outline: 0 solid var(--tg-mark-color, #D4FFFC); outline-offset: 3px; }
    }

    /* 浮動按鈕 */
    term-glossary .tg-fab {
        position: fixed; z-index: 1030; display: inline-flex; align-items: center; gap: 8px;
        padding: var(--tg-pad-fab, 8px 16px); border: 0; border-radius: 999px;
        background: var(--tg-accent); color: var(--tg-on-accent);
        font-size: var(--tg-fs-fab, var(--tg-fs, 1.125rem));
        font-family: var(--tg-ff-fab, var(--tg-ff, inherit));
        line-height: var(--tg-lh, 1.4); font-weight: 600; cursor: pointer;
        box-shadow: 0 4px 14px #000000; transition: background-color 0.18s ease, transform 0.18s ease;
    }
    term-glossary .tg-fab:hover { background: color-mix(in srgb, var(--tg-accent) 80%, #FFFFFF); transform: translateY(-2px); }
    term-glossary .tg-fab[hidden] { display: none; }
    term-glossary.tg-open .tg-fab { display: none; }
    term-glossary .tg-pos-bottom-end   { right: 24px; bottom: 24px; }
    term-glossary .tg-pos-bottom-start { left: 24px;  bottom: 24px; }
    term-glossary .tg-pos-top-end      { right: 24px; top: 24px; }
    term-glossary .tg-pos-top-start    { left: 24px;  top: 24px; }
    term-glossary .tg-fab-count {
        padding: 0 8px; border-radius: 999px; background: var(--tg-on-accent); color: var(--tg-accent);
        font-size: var(--tg-fs-count, var(--tg-fs, 1.125rem)); font-weight: 700;
    }

    /* offcanvas 本體 */
    term-glossary .tg-offcanvas {
        --bs-offcanvas-bg: var(--tg-bg);
        --bs-offcanvas-color: var(--tg-fg);
        --bs-offcanvas-border-color: color-mix(in srgb, var(--tg-fg) 25%, var(--tg-bg));
        --bs-offcanvas-width: min(var(--tg-width, 32rem), 100vw);
        --bs-offcanvas-padding-x: 16px;
        --bs-offcanvas-padding-y: 12px;
        background: var(--tg-bg); color: var(--tg-fg);
        font-size: var(--tg-fs, 1.125rem); font-family: var(--tg-ff, inherit); line-height: var(--tg-lh, 1.4);
    }
    term-glossary .tg-offcanvas .offcanvas-header { border-bottom: 1px solid var(--bs-offcanvas-border-color); }
    term-glossary .tg-offcanvas .offcanvas-body { padding: 12px 16px; }
    term-glossary .tg-title {
        margin: 0; color: var(--tg-accent); font-weight: 700;
        font-size: var(--tg-fs-title, calc(var(--tg-fs, 1.125rem) * 1.2));
        font-family: var(--tg-ff-title, var(--tg-ff, inherit)); line-height: var(--tg-lh, 1.4);
    }
    term-glossary .tg-total {
        margin-left: 8px; color: var(--tg-fg); font-weight: 400;
        font-size: var(--tg-fs-count, var(--tg-fs, 1.125rem));
    }
    term-glossary .tg-close {
        padding: 2px 8px; border: 1px solid color-mix(in srgb, var(--tg-fg) 35%, var(--tg-bg)); border-radius: 5px;
        background: transparent; color: var(--tg-fg); font-size: var(--tg-fs-tag, var(--tg-fs, 1.125rem)); line-height: var(--tg-lh, 1.4);
        cursor: pointer; transition: border-color 0.18s ease, color 0.18s ease;
    }
    term-glossary .tg-close:hover { border-color: var(--tg-accent); color: var(--tg-accent); }

    /* 工具列 */
    term-glossary .tg-toolbar { display: flex; gap: 8px; align-items: stretch; margin-bottom: 8px; }
    term-glossary .tg-search {
        flex: 1 1 auto; display: flex; align-items: center; gap: 8px; padding: var(--tg-pad-search, 6px 12px);
        border: 1px solid color-mix(in srgb, var(--tg-fg) 35%, var(--tg-bg)); border-radius: 5px;
        background: color-mix(in srgb, var(--tg-fg) 8%, var(--tg-bg));
        transition: border-color 0.18s ease;
    }
    term-glossary .tg-search:focus-within { border-color: var(--tg-accent); }
    term-glossary .tg-search i { color: var(--tg-accent); }
    term-glossary .tg-search-input {
        flex: 1 1 auto; min-width: 0; padding: 0; border: 0; outline: none; background: transparent; color: var(--tg-fg);
        font-size: var(--tg-fs-search, var(--tg-fs, 1.125rem)); font-family: var(--tg-ff-search, var(--tg-ff, inherit));
        line-height: var(--tg-lh, 1.4);
    }
    term-glossary .tg-search-input::placeholder { color: color-mix(in srgb, var(--tg-fg) 70%, var(--tg-bg)); }
    term-glossary .tg-sort, term-glossary .tg-chip, term-glossary .tg-more {
        padding: var(--tg-pad-tag, 3px 12px); border: 1px solid color-mix(in srgb, var(--tg-fg) 35%, var(--tg-bg)); border-radius: 5px;
        background: transparent; color: var(--tg-fg); cursor: pointer; white-space: nowrap;
        font-size: var(--tg-fs-tag, var(--tg-fs, 1.125rem)); font-family: var(--tg-ff-tag, var(--tg-ff, inherit));
        line-height: var(--tg-lh, 1.4); transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
    }
    term-glossary .tg-sort:hover, term-glossary .tg-chip:hover, term-glossary .tg-more:hover {
        border-color: var(--tg-accent); color: var(--tg-accent);
    }
    term-glossary .tg-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
    term-glossary .tg-chips[hidden] { display: none; }
    term-glossary .tg-chip.active { background: var(--tg-accent); border-color: var(--tg-accent); color: var(--tg-on-accent); font-weight: 600; }
    term-glossary .tg-chip { --tg-accent: #82C8E5; }

    /* 詞條 */
    term-glossary .tg-entry {
        margin-bottom: 12px; padding: var(--tg-pad-entry, 12px 14px);
        border-left: 4px solid var(--tg-accent); border-radius: 0 6px 6px 0;
        background: color-mix(in srgb, var(--tg-fg) 7%, var(--tg-bg));
    }
    term-glossary .tg-entry-flash { animation: tg-entry-flash 1.8s ease-out; }
    @keyframes tg-entry-flash {
        0%, 65% { outline: 2px solid var(--tg-accent); outline-offset: 2px; }
        100%    { outline: 0 solid var(--tg-accent); outline-offset: 2px; }
    }
    term-glossary .tg-entry-head { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; }
    term-glossary .tg-name {
        color: var(--tg-accent); font-weight: 700;
        font-size: var(--tg-fs-name, var(--tg-fs, 1.125rem)); font-family: var(--tg-ff-name, var(--tg-ff, inherit));
    }
    term-glossary .tg-group-badge {
        padding: 0 8px; border: 1px solid color-mix(in srgb, var(--tg-fg) 35%, var(--tg-bg)); border-radius: 999px;
        font-size: var(--tg-fs-tag, var(--tg-fs, 1.125rem)); color: var(--tg-fg);
    }
    term-glossary .tg-count {
        margin-left: auto; padding: 0 8px; border: 1px solid var(--tg-accent); border-radius: 5px;
        background: transparent; color: var(--tg-accent); cursor: pointer;
        font-size: var(--tg-fs-count, var(--tg-fs, 1.125rem)); font-family: var(--tg-ff-count, var(--tg-ff, inherit));
        line-height: var(--tg-lh, 1.4); transition: background-color 0.18s ease;
    }
    term-glossary .tg-count:hover { background: color-mix(in srgb, var(--tg-accent) 18%, var(--tg-bg)); }
    term-glossary .tg-def {
        margin-top: 6px; font-size: var(--tg-fs-def, var(--tg-fs, 1.125rem));
        font-family: var(--tg-ff-def, var(--tg-ff, inherit));
    }
    term-glossary .tg-def > :last-child { margin-bottom: 0; }
    term-glossary .tg-def p { margin: 0 0 6px; }
    term-glossary .tg-def a { color: var(--tg-accent); }
    term-glossary .tg-missing { color: #E6374B; }
    term-glossary .tg-ex-label { margin-top: 10px; color: var(--tg-accent); font-size: var(--tg-fs-example, var(--tg-fs, 1.125rem)); }
    term-glossary .tg-examples { margin: 4px 0 0; padding: 0; list-style: none; }
    term-glossary .tg-examples li {
        margin-top: 4px; padding: 2px 0 2px 10px;
        border-left: 2px solid color-mix(in srgb, var(--tg-fg) 35%, var(--tg-bg));
        font-size: var(--tg-fs-example, var(--tg-fs, 1.125rem)); font-family: var(--tg-ff-example, var(--tg-ff, inherit));
    }
    term-glossary .tg-examples li[data-idx] { cursor: pointer; }
    term-glossary .tg-examples li[data-idx]:hover { border-left-color: var(--tg-accent); }
    term-glossary mark.tg-hl { padding: 0; background: none; color: var(--tg-accent); font-weight: 700; }
    term-glossary .tg-more { margin-top: 6px; }
    term-glossary .tg-alert, term-glossary .tg-list > .alert {
        margin: 8px 0 0; padding: 6px 12px;
        font-size: var(--tg-fs-empty, var(--tg-fs, 1.125rem)); font-family: var(--tg-ff-empty, var(--tg-ff, inherit));
        line-height: var(--tg-lh, 1.4);
    }
    `;

    let uid = 0;

    class TermGlossary extends HTMLElement {
        static get observedAttributes() {
            const base = ['heading', 'theme', 'theme-accent', 'theme-bg', 'theme-fg', 'group-themes', 'mark-style',
                'fs', 'lh', 'ff', 'width', 'offcanvas-width', 'sort', 'example-max', 'scope', 'trigger', 'no-fab',
                'fab-text', 'fab-icon', 'fab-pos'];
            FS_PARTS.forEach(p => { base.push('fs-' + p, 'ff-' + p); });
            PAD_PARTS.forEach(p => base.push('pad-' + p));
            return base;
        }

        constructor() {
            super();
            this._ready = false;
            this._open = false;
            this._terms = new Map();
            this._groups = [];
            this._markerKey = new Map();
            this._marked = new Set();
            this._state = { q: '', group: '', sort: 'order' };
            this._expanded = new Set();
            this._pending = null;
            this._timer = null;
        }

        /* ───────── 生命週期 ───────── */
        connectedCallback() {
            if (this._ready) return;
            this._ready = true;
            if (!document.getElementById('term-glossary-style')) {
                const st = document.createElement('style');
                st.id = 'term-glossary-style';
                st.textContent = CSS;
                document.head.appendChild(st);
            }
            this._state.sort = this.getAttribute('sort') === 'alpha' ? 'alpha' : 'order';
            this._build();
            this._applyStyle();
            this._applyStatic();
            this._bind();

            const start = () => { this._scan(); this._observe(); };
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
            else start();
            window.addEventListener('load', this._onLoad = () => this._schedule(), { once: true });
        }

        disconnectedCallback() {
            this._ready = false;
            if (this._mo) { this._mo.disconnect(); this._mo = null; }
            if (this._onDocClick) document.removeEventListener('click', this._onDocClick);
            clearTimeout(this._timer);
        }

        attributeChangedCallback(name, oldV, newV) {
            if (!this._ready || oldV === newV) return;
            this._applyStyle();
            this._applyStatic();
            if (name === 'sort') this._state.sort = newV === 'alpha' ? 'alpha' : 'order';
            this._scan();
            if (name === 'scope') this._observe();
        }

        /* ───────── 介面骨架 ───────── */
        _build() {
            const id = 'tg-oc-' + (++uid);
            this.innerHTML = `
                <button type="button" class="tg-fab tg-pos-bottom-end">
                    <i class="bi bi-journal-text"></i><span class="tg-fab-text"></span><span class="tg-fab-count">0</span>
                </button>
                <div class="offcanvas offcanvas-end tg-offcanvas" tabindex="-1" id="${id}" data-bs-theme="dark">
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title tg-title"><i class="bi bi-journal-text"></i> <span class="tg-title-text"></span><span class="tg-total"></span></h5>
                        <button type="button" class="tg-close" data-bs-dismiss="offcanvas"><i class="bi bi-x-lg"></i></button>
                    </div>
                    <div class="offcanvas-body">
                        <div class="tg-toolbar">
                            <label class="tg-search"><i class="bi bi-search"></i>
                                <input type="search" class="tg-search-input" placeholder="搜尋詞彙、解釋或例句">
                            </label>
                            <button type="button" class="tg-sort"></button>
                        </div>
                        <div class="tg-chips" hidden></div>
                        <div class="tg-list"></div>
                    </div>
                </div>`;
            this._fab = this.querySelector('.tg-fab');
            this._oc = this.querySelector('.tg-offcanvas');
            this._input = this.querySelector('.tg-search-input');
            this._sortBtn = this.querySelector('.tg-sort');
            this._chips = this.querySelector('.tg-chips');
            this._list = this.querySelector('.tg-list');
            this._oc.classList.toggle('offcanvas-start', this.getAttribute('position') === 'start');
            this._oc.classList.toggle('offcanvas-end', this.getAttribute('position') !== 'start');
        }

        _applyStatic() {
            this.querySelector('.tg-title-text').textContent = this.getAttribute('heading') || '詞彙表';
            const icon = (this.getAttribute('fab-icon') || 'bi-journal-text').trim();
            this._fab.querySelector('i').className = 'bi ' + (icon.startsWith('bi-') ? icon : 'bi-' + icon);
            const ft = this.getAttribute('fab-text') || '';
            const fe = this._fab.querySelector('.tg-fab-text');
            fe.textContent = ft;
            fe.hidden = !ft;
            const pos = this.getAttribute('fab-pos') || 'bottom-end';
            this._fab.className = 'tg-fab tg-pos-' + (['bottom-end', 'bottom-start', 'top-end', 'top-start'].includes(pos) ? pos : 'bottom-end');
            this._fab.hidden = this.hasAttribute('no-fab');
            this._sortBtn.innerHTML = this._state.sort === 'alpha'
                ? '<i class="bi bi-sort-alpha-down"></i> 字母順序'
                : '<i class="bi bi-list-ol"></i> 出現順序';
        }

        _applyStyle() {
            const set = (n, v) => (v == null || v === '') ? this.style.removeProperty(n) : this.style.setProperty(n, v);
            const attr = n => { const v = this.getAttribute(n); return v === null ? null : v.trim(); };
            const rem = v => (v != null && NUM.test(v)) ? v + 'rem' : v;
            const px = v => v == null ? v : v.split(/\s+/).map(t => NUM.test(t) ? t + 'px' : t).join(' ');
            const rc = v => v ? resolveColor(v) : null;

            set('--tg-fs', rem(attr('fs')));
            set('--tg-lh', attr('lh'));
            set('--tg-ff', attr('ff'));
            FS_PARTS.forEach(p => { set('--tg-fs-' + p, rem(attr('fs-' + p))); set('--tg-ff-' + p, attr('ff-' + p)); });
            PAD_PARTS.forEach(p => set('--tg-pad-' + p, px(attr('pad-' + p))));
            const w = attr('offcanvas-width') || attr('width');
            set('--tg-width', w == null ? null : (NUM.test(w) ? w + 'rem' : w));

            const th = this._theme();
            const accent = resolveColor(attr('theme-accent') || (th === 'auto' ? 'sky' : th));
            set('--tg-accent', accent);
            set('--tg-on-accent', onColor(accent));
            set('--tg-bg', rc(attr('theme-bg')));
            set('--tg-fg', rc(attr('theme-fg')));
        }

        /* ───────── 事件 ───────── */
        _bind() {
            this._fab.addEventListener('click', () => this.toggle());
            this._input.addEventListener('input', () => { this._state.q = this._input.value.trim().toLowerCase(); this._renderList(); });
            this._sortBtn.addEventListener('click', () => {
                this._state.sort = this._state.sort === 'alpha' ? 'order' : 'alpha';
                this._applyStatic();
                this._renderList();
            });
            this._chips.addEventListener('click', e => {
                const b = e.target.closest('.tg-chip');
                if (!b) return;
                this._state.group = b.dataset.group || '';
                this._renderChips();
                this._renderList();
            });
            this._list.addEventListener('click', e => {
                const entry = e.target.closest('.tg-entry');
                if (!entry) return;
                const key = entry.dataset.key;
                if (e.target.closest('[data-act="jump"]')) { this._jump(key); return; }
                if (e.target.closest('.tg-more')) {
                    if (this._expanded.has(key)) this._expanded.delete(key); else this._expanded.add(key);
                    this._renderList();
                    return;
                }
                const li = e.target.closest('li[data-idx]');
                if (li) this._jump(key, Number(li.dataset.idx));
            });
            this._oc.addEventListener('shown.bs.offcanvas', () => {
                this._open = true;
                this.classList.add('tg-open');
                if (this._pending) { this._focusEntry(this._pending); this._pending = null; }
                this.dispatchEvent(new CustomEvent('glossary-open'));
            });
            this._oc.addEventListener('hidden.bs.offcanvas', () => {
                this._open = false;
                this.classList.remove('tg-open');
                this.dispatchEvent(new CustomEvent('glossary-close'));
            });

            this._onDocClick = e => {
                const t = e.target;
                if (!(t instanceof Element)) return;
                const sel = this.getAttribute('trigger');
                if (sel) {
                    try { if (t.closest(sel)) { e.preventDefault(); this.open(); return; } } catch (_) { /* 選擇器無效則略過 */ }
                }
                const m = t.closest('[data-term]');
                if (!m || this.contains(m)) return;
                const key = this._markerKey.get(m);
                if (!key) return;
                const click = m.getAttribute('data-term-click');
                if (click === 'off') return;
                const hasPopover = Array.from(m.attributes).some(a => a.name.startsWith('data-popover'));
                if (hasPopover && click !== 'open') return;
                const inter = t.closest('a[href],button,summary,input,textarea,select,label');
                if (inter && inter !== m && !m.contains(inter)) return;
                const term = this._terms.get(key);
                if (term) {
                    const i = term.occ.findIndex(o => o.els.includes(m));
                    if (i >= 0) term.cursor = (i + 1) % term.occ.length;
                }
                this.open(key);
            };
            document.addEventListener('click', this._onDocClick);
        }

        /* ───────── 掃描 ───────── */
        _root() {
            const sc = this.getAttribute('scope');
            if (sc) {
                try { const r = document.querySelector(sc); if (r) return r; } catch (_) { /* 略過 */ }
                console.warn('term-glossary：找不到 scope 指定的範圍，改為掃描整個 body');
            }
            return document.body;
        }

        _observe() {
            if (this._mo) this._mo.disconnect();
            const relevant = n => n.nodeType === 1 && !this.contains(n) && (
                n.hasAttribute('data-term') || n.querySelector('[data-term]') ||
                (n.id || '').endsWith('_info') || n.querySelector('[id$="_info"]'));
            this._mo = new MutationObserver(records => {
                const hit = records.some(r => {
                    if (this.contains(r.target)) return false;
                    if (r.type === 'attributes') return true;
                    if (r.target.closest && r.target.closest('[id$="_info"]')) return true;
                    return Array.from(r.addedNodes).some(relevant) || Array.from(r.removedNodes).some(n => n.nodeType === 1 && (n.hasAttribute('data-term') || n.querySelector('[data-term]') || (n.id || '').endsWith('_info')));
                });
                if (hit) this._schedule();
            });
            this._mo.observe(this._root(), { childList: true, subtree: true, attributes: true, attributeFilter: ['data-term'] });
        }

        _schedule() {
            clearTimeout(this._timer);
            this._timer = setTimeout(() => this._scan(), 250);
        }

        refresh() { this._scan(); }

        _scan() {
            if (!this._ready) return;
            const root = this._root();

            this._marked.forEach(el => { el.removeAttribute('data-tg-mark'); el.removeAttribute('data-tg-noclick'); el.style.removeProperty('--tg-mark-color'); });

            const els = Array.from(root.querySelectorAll('[data-term]')).filter(el => !this.contains(el));
            const infoSet = new Set();
            els.forEach(el => {
                const k = (el.getAttribute('data-term') || '').trim();
                const info = k ? document.getElementById(k + '_info') : null;
                if (info) infoSet.add(info);
            });
            const inInfo = el => { for (let n = el.parentElement; n; n = n.parentElement) if (infoSet.has(n)) return true; return false; };

            const terms = new Map();
            const markerKey = new Map();
            els.forEach(el => {
                const key = (el.getAttribute('data-term') || '').trim();
                if (!key || inInfo(el)) return;
                markerKey.set(el, key);
                let t = terms.get(key);
                if (!t) {
                    t = { key, info: document.getElementById(key + '_info'), occ: [], occMap: new Map(), manual: [], cursor: 0, order: terms.size, first: el };
                    terms.set(key, t);
                }
                const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
                const sent = this._sentence(el, text);
                const sKey = sent ? sent.plain + '|' + text : 'M|' + text;
                let o = t.occMap.get(sKey);
                if (!o) { o = { html: sent ? sent.html : null, plain: sent ? sent.plain : '', els: [] }; t.occMap.set(sKey, o); t.occ.push(o); }
                o.els.push(el);
                const ex = el.getAttribute('data-term-example');
                if (ex && !t.manual.includes(ex)) t.manual.push(ex);
                if (t.markers === undefined) t.markers = [];
                t.markers.push(el);
            });

            const groups = [];
            terms.forEach(t => {
                const info = t.info;
                const fromMarker = n => { const m = t.markers.find(e => e.hasAttribute(n)); return m ? m.getAttribute(n).trim() : ''; };
                const firstText = (t.first.textContent || '').replace(/\s+/g, ' ').trim();
                t.title = (info && info.getAttribute('data-title')) || fromMarker('data-term-title') || firstText || t.key;
                t.group = ((info && info.getAttribute('data-group')) || fromMarker('data-term-group') || '').trim();
                t.theme = ((info && info.getAttribute('data-theme')) || fromMarker('data-term-theme') || '').trim();
                if (t.group && !groups.includes(t.group)) groups.push(t.group);

                t.defHtml = '';
                t.defText = '';
                if (info) {
                    const tmp = info.cloneNode(true);
                    tmp.removeAttribute('id');
                    tmp.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
                    t.defText = (tmp.textContent || '').replace(/\s+/g, ' ').trim();
                    t.defHtml = t.defText || tmp.querySelector('img,table,svg,video') ? tmp.innerHTML.trim() : '';
                }
                t.hasDef = !!t.defHtml;
                t.plain = [t.title, t.group, t.defText, ...t.manual.map(stripTags), ...t.occ.map(o => o.plain)].join(' ').toLowerCase();
            });

            this._terms = terms;
            this._markerKey = markerKey;
            this._groups = groups;
            if (this._state.group && !groups.includes(this._state.group)) this._state.group = '';

            const style = ['dotted', 'solid', 'band', 'none'].includes(this.getAttribute('mark-style')) ? this.getAttribute('mark-style') : 'dotted';
            this._marked = new Set();
            markerKey.forEach((key, el) => {
                const t = terms.get(key);
                el.setAttribute('data-tg-mark', style);
                el.style.setProperty('--tg-mark-color', this._colorFor(t));
                if (el.getAttribute('data-term-click') === 'off' ||
                    (Array.from(el.attributes).some(a => a.name.startsWith('data-popover')) && el.getAttribute('data-term-click') !== 'open')) {
                    el.setAttribute('data-tg-noclick', '');
                }
                this._marked.add(el);
            });

            this._fab.querySelector('.tg-fab-count').textContent = terms.size;
            this._renderChips();
            this._renderList();
            this.dispatchEvent(new CustomEvent('glossary-updated', { detail: { count: terms.size } }));
        }

        /* 擷取標記所在的句子，標記處以 mark 反白 */
        _sentence(el, text) {
            let block = (el.parentElement || el).closest(BLOCK_SEL) || el.parentElement;
            if (!block) return null;
            if ((block.textContent || '').length > 3000 && el.parentElement) block = el.parentElement;

            const out = [];
            const walk = n => {
                if (n.nodeType === 3) { out.push(n.nodeValue); return; }
                if (n.nodeType !== 1) return;
                const tag = n.tagName;
                if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEMPLATE') return;
                if (n !== block && n !== el && n.hasAttribute('hidden')) return;
                if (tag === 'BR') { out.push('\n'); return; }
                const brk = n !== block && (BREAKERS.has(tag) || tag.includes('-'));
                if (brk) out.push('\n');
                if (n === el) out.push('\uE000');
                for (let c = n.firstChild; c; c = c.nextSibling) walk(c);
                if (n === el) out.push('\uE001');
                if (brk) out.push('\n');
            };
            walk(block);

            const line = out.join('').split('\n').find(l => l.includes('\uE000'));
            if (!line) return null;
            let s = line.replace(/\s+/g, ' ').trim();
            const parts = s.split(/(?<=[。！？!?；])\s*|(?<=\.)\s+(?=[A-Z“"(（\u4e00-\u9fff])/).filter(p => p.trim());
            const a = parts.findIndex(p => p.includes('\uE000'));
            let b = parts.findIndex(p => p.includes('\uE001'));
            if (a >= 0) {
                if (b < a) b = a;
                s = parts.slice(a, b + 1).join(' ').trim();
            }
            s = s.replace(/^\d+(?:[-–]\d+)+\s+/, '');

            let plain = s.replace(/[\uE000\uE001]/g, '').trim();
            if (!plain || plain === text) return null;
            if (plain.length > 240) {
                const i0 = s.indexOf('\uE000');
                const i1 = s.indexOf('\uE001');
                const st = Math.max(0, i0 - 100);
                const en = Math.min(s.length, i1 + 140);
                s = (st > 0 ? '…' : '') + s.slice(st, en) + (en < s.length ? '…' : '');
                plain = s.replace(/[\uE000\uE001]/g, '').trim();
            }
            const html = esc(s).replace(/\uE000/g, '<mark class="tg-hl">').replace(/\uE001/g, '</mark>');
            return { plain, html };
        }

        /* ───────── 主題色 ───────── */
        _theme() { return (this.getAttribute('theme') || 'sky').trim(); }

        _groupThemes() {
            const map = {};
            (this.getAttribute('group-themes') || '').split(/[,，]/).forEach(pair => {
                const i = pair.search(/[:：]/);
                if (i > 0) map[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
            });
            return map;
        }

        _groupColor(g) {
            let c = this._groupThemes()[g];
            if (!c) {
                const th = this._theme();
                const ta = this.getAttribute('theme-accent');
                c = th === 'auto'
                    ? AUTO_ORDER[Math.max(0, this._groups.indexOf(g)) % AUTO_ORDER.length]
                    : (ta || th);
            }
            return resolveColor(c);
        }

        _colorFor(t) {
            if (t.theme) return resolveColor(t.theme);
            if (t.group) return this._groupColor(t.group);
            const ta = this.getAttribute('theme-accent');
            if (ta) return resolveColor(ta);
            const th = this._theme();
            if (th === 'auto') return resolveColor(AUTO_ORDER[(this._groups.length ? 0 : t.order) % AUTO_ORDER.length]);
            return resolveColor(th);
        }

        /* ───────── 繪製 ───────── */
        _renderChips() {
            if (!this._groups.length) { this._chips.hidden = true; this._chips.innerHTML = ''; return; }
            this._chips.hidden = false;
            const chip = (g, label, color) => {
                const c = color || resolveColor(this._theme() === 'auto' ? 'sky' : (this.getAttribute('theme-accent') || this._theme()));
                return `<button type="button" class="tg-chip${this._state.group === g ? ' active' : ''}" data-group="${esc(g)}" style="--tg-accent:${esc(c)};--tg-on-accent:${onColor(c)}">${esc(label)}</button>`;
            };
            this._chips.innerHTML = chip('', '全部') + this._groups.map(g => chip(g, g, this._groupColor(g))).join('');
        }

        _renderList() {
            const q = this._state.q;
            let arr = Array.from(this._terms.values());
            const total = arr.length;
            if (this._state.group) arr = arr.filter(t => t.group === this._state.group);
            if (q) arr = arr.filter(t => t.plain.includes(q));
            if (this._state.sort === 'alpha') arr.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hant'));

            this.querySelector('.tg-total').textContent = arr.length === total ? `（${total}）` : `（${arr.length} / ${total}）`;

            if (!total) {
                this._list.innerHTML = '<div class="alert alert-info" role="alert"><i class="bi bi-info-circle"></i> 頁面中沒有標記 data-term 的詞彙。</div>';
                return;
            }
            if (!arr.length) {
                this._list.innerHTML = '<div class="alert alert-warning" role="alert"><i class="bi bi-search"></i> 沒有符合的詞條。</div>';
                return;
            }
            this._list.innerHTML = arr.map(t => this._entryHtml(t)).join('');
        }

        _entryHtml(t) {
            const color = this._colorFor(t);
            const maxAttr = parseInt(this.getAttribute('example-max'), 10);
            const exMax = Number.isFinite(maxAttr) && maxAttr >= 0 ? maxAttr : 3;
            const exs = t.manual.map(h => ({ html: h }));
            t.occ.forEach((o, i) => { if (o.html) exs.push({ html: o.html, idx: i }); });
            const expanded = this._expanded.has(t.key);
            const shown = expanded ? exs : exs.slice(0, exMax);
            const rest = exs.length - shown.length;

            let html = `<article class="tg-entry" data-key="${esc(t.key)}" style="--tg-accent:${esc(color)};--tg-on-accent:${onColor(color)}">
                <div class="tg-entry-head">
                    <span class="tg-name">${esc(t.title)}</span>
                    ${t.group ? `<span class="tg-group-badge">${esc(t.group)}</span>` : ''}
                    <button type="button" class="tg-count" data-act="jump"><i class="bi bi-geo-alt"></i> ${t.occ.length}</button>
                </div>
                <div class="tg-def">${t.hasDef ? t.defHtml : '<span class="tg-missing"><i class="bi bi-exclamation-circle"></i> 尚無解釋</span>'}</div>`;
            if (exs.length) {
                html += '<div class="tg-ex-label"><i class="bi bi-chat-quote"></i> 例句</div><ul class="tg-examples">';
                shown.forEach(e => { html += `<li${e.idx != null ? ` data-idx="${e.idx}"` : ''}>${e.html}</li>`; });
                html += '</ul>';
                if (rest > 0) html += `<button type="button" class="tg-more">顯示其餘 ${rest} 則例句</button>`;
                else if (expanded && exs.length > exMax) html += '<button type="button" class="tg-more">收合例句</button>';
            }
            return html + '</article>';
        }

        /* ───────── 定位與開關 ───────── */
        _visible(e) {
            if (!e.isConnected) return false;
            try { return e.checkVisibility ? e.checkVisibility({ checkVisibilityCSS: true, contentVisibilityAuto: true }) : e.getClientRects().length > 0; }
            catch (_) { return e.getClientRects().length > 0; }
        }

        _jump(key, idx) {
            const t = this._terms.get(key);
            if (!t) return;
            const n = t.occ.length;
            const pick = i => t.occ[i].els.find(e => this._visible(e));
            let found = null;
            if (idx != null && idx < n) {
                found = pick(idx);
                if (found) t.cursor = (idx + 1) % n;
            } else {
                for (let k = 0; k < n; k++) {
                    const i = (t.cursor + k) % n;
                    const e = pick(i);
                    if (e) { found = e; t.cursor = (i + 1) % n; break; }
                }
            }
            if (!found) { this._notice(key, '目前沒有可見的出現位置'); return; }
            found.scrollIntoView({ behavior: 'smooth', block: 'center' });
            found.classList.remove('tg-term-flash');
            void found.offsetWidth;
            found.classList.add('tg-term-flash');
            setTimeout(() => found.classList.remove('tg-term-flash'), 1900);
        }

        _notice(key, msg) {
            const entry = Array.from(this._list.children).find(n => n.dataset && n.dataset.key === key);
            if (!entry) return;
            const old = entry.querySelector('.tg-alert');
            if (old) old.remove();
            const el = document.createElement('div');
            el.className = 'alert alert-warning tg-alert';
            el.setAttribute('role', 'alert');
            el.innerHTML = `<i class="bi bi-exclamation-triangle"></i> ${esc(msg)}`;
            entry.querySelector('.tg-entry-head').after(el);
            setTimeout(() => el.remove(), 3000);
        }

        _focusEntry(key) {
            const find = () => Array.from(this._list.children).find(n => n.dataset && n.dataset.key === key);
            let entry = find();
            if (!entry && (this._state.q || this._state.group)) {
                this._state.q = '';
                this._state.group = '';
                this._input.value = '';
                this._renderChips();
                this._renderList();
                entry = find();
            }
            if (!entry) return;
            entry.scrollIntoView({ behavior: 'smooth', block: 'start' });
            entry.classList.remove('tg-entry-flash');
            void entry.offsetWidth;
            entry.classList.add('tg-entry-flash');
            setTimeout(() => entry.classList.remove('tg-entry-flash'), 1900);
        }

        open(key) {
            const Off = window.bootstrap && window.bootstrap.Offcanvas;
            if (!Off) {
                console.error('term-glossary 需要載入 Bootstrap 5 的 JavaScript（bootstrap.bundle）');
                return;
            }
            const modal = this.hasAttribute('modal');
            const inst = Off.getOrCreateInstance(this._oc, { backdrop: modal, scroll: !modal, keyboard: true });
            if (this._open) { if (key) this._focusEntry(key); return; }
            if (key) this._pending = key;
            inst.show();
        }

        close() {
            const Off = window.bootstrap && window.bootstrap.Offcanvas;
            if (Off) Off.getOrCreateInstance(this._oc).hide();
        }

        toggle() { if (this._open) this.close(); else this.open(); }

        get terms() {
            return Array.from(this._terms.values()).map(t => ({
                key: t.key, title: t.title, group: t.group, hasInfo: t.hasDef, count: t.occ.length
            }));
        }
    }

    customElements.define('term-glossary', TermGlossary);
})();
