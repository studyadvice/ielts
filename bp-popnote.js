(function (G) {
  'use strict';

  var PALETTE = {
    lavender : '#C3A5E5',
    sky      : '#82C8E5',
    ocean    : '#1CCAE8',
    safe     : '#27AE60',
    special  : '#B3DE73',
    yellow   : '#E3D322',
    salmon   : '#E5C3B3',
    pink     : '#FF91D7',
    orange   : '#EDA109',
    vanilla  : '#DBEDD8',
    teal     : '#0DA591',
    focus    : '#D4FFFC',
    indigo   : '#7849C9',
    info     : '#2351DB',
    wrong    : '#E6374B',
    shell    : '#C6C7BD',
  };

  var NOTICE_COLOR_MAP = {
    lavender : PALETTE.lavender,
    sky      : PALETTE.sky,
    ocean    : PALETTE.ocean,
    safe     : PALETTE.safe,
    special  : PALETTE.special,
    yellow   : PALETTE.yellow,
    salmon   : PALETTE.salmon,
    pink     : PALETTE.pink,
    orange   : PALETTE.orange,
    vanilla  : PALETTE.vanilla,
    teal     : PALETTE.teal,
    focus    : PALETTE.focus,
    indigo   : PALETTE.indigo,
    info     : PALETTE.info,
    wrong    : PALETTE.wrong,   // 紅色（v1 wrong）
    warning  : PALETTE.yellow,  // 黃色（v1 warning，向下相容）
    // v1 別名（保留向下相容）
    accent   : PALETTE.lavender,
    correct  : PALETTE.safe,
    note     : PALETTE.yellow,
    success  : PALETTE.safe,
    highlight: PALETTE.special,
  };

  var _noticeCssEl = null;

  var BpNoticeConfig = {
    autoInit     : true,
    stickyOffset : '0px',
    theme: {
      text       : 'var(--shell,#C6C7BD)',
      bg         : 'var(--area,#1a1b1a)',
      border     : 'var(--card-border,#2e2f2e)',
      accent     : PALETTE.sky,   // 預設邊框強調色
      ctaBg      : PALETTE.yellow,
      ctaText    : '#0C0D0C',
      closeColor : 'rgba(198,199,189,0.78)',
    },
  };

  var DEFAULT_NOTICE_ICONS = {
    announcement : 'bi-megaphone-fill',
    promo        : 'bi-tag-fill',
    sticky       : 'bi-info-circle-fill',
  };

  // ── CSS 注入 ─────────────────────────────────────────────────
  function injectNoticeCSS() {
    if (!_noticeCssEl) {
      _noticeCssEl = document.createElement('style');
      _noticeCssEl.id = 'bp-notice-styles';
      document.head.appendChild(_noticeCssEl);
    }
    var t  = BpNoticeConfig.theme;
    var so = BpNoticeConfig.stickyOffset;

    var rules = [
      '.bpn-box{' +
        'display:flex;align-items:center;gap:10px;' +
        'padding:11px 16px;' +
        'background:' + t.bg + ';' +
        'border:1px solid ' + t.border + ';' +
        'border-left:3px solid ' + t.accent + ';' +
        'border-radius:7px;' +
        'font-size:.88rem;color:' + t.text + ';' +
        'line-height:1.5;' +
        'position:relative;' +
        'transition:opacity .25s,transform .25s;}',

      /* ── 動畫 ── */
      '@keyframes bpn-slidein{' +
        'from{opacity:0;transform:translateY(-8px)}' +
        'to{opacity:1;transform:translateY(0)}}',
      '.bpn-box.anim{animation:bpn-slidein .25s ease forwards;}',

      '@keyframes bpn-slideup{' +
        'from{opacity:0;transform:translateY(16px)}' +
        'to{opacity:1;transform:translateY(0)}}',
      '.bpn-box.anim-up{animation:bpn-slideup .28s ease forwards;}',

      '.bpn-box.closing{opacity:0;transform:translateY(-6px);pointer-events:none;}',
      '.bpn-box.closing-down{opacity:0;transform:translateY(10px);pointer-events:none;}',

      '.bpn-icon{flex-shrink:0;font-size:1rem;}',
      '.bpn-content{flex:1;min-width:0;}',

      '.bpn-cta{' +
        'flex-shrink:0;background:' + t.ctaBg + ';color:' + t.ctaText + ';' +
        'border:none;border-radius:5px;padding:5px 14px;' +
        'font-size:.8rem;font-weight:700;cursor:pointer;' +
        'white-space:nowrap;text-decoration:none;display:inline-block;' +
        'transition:opacity .15s;}',
      '.bpn-cta:hover{opacity:.85;color:' + t.ctaText + ';}',

      '.bpn-close{' +
        'flex-shrink:0;background:none;border:none;' +
        'color:' + t.closeColor + ';cursor:pointer;font-size:1rem;' +
        'padding:2px 4px;border-radius:4px;line-height:1;' +
        'transition:color .15s;}',
      '.bpn-close:hover{color:' + t.text + ';}',

      'bp-notice[type="sticky"]{' +
        'display:block;position:fixed;left:0;right:0;z-index:1040;padding:0 28px;}',
      'bp-notice[type="sticky"][position="top"]{top:' + so + ';}',
      'bp-notice[type="sticky"]:not([position="top"]){bottom:' + so + ';}',
      'bp-notice[type="sticky"] .bpn-box{' +
        'border-radius:0;border-left-width:1px;' +
        'border-top:3px solid ' + t.accent + ';' +
        'max-width:95%;justify-content:center;}',
    ];

    Object.keys(NOTICE_COLOR_MAP).forEach(function (token) {
      var color = NOTICE_COLOR_MAP[token];
      rules.push(
        '.bpn-box[data-color="' + token + '"]{border-left-color:' + color + ';}',
        '.bpn-box[data-color="' + token + '"] .bpn-icon{color:' + color + ';}',
        'bp-notice[type="sticky"] .bpn-box[data-color="' + token + '"]{border-top-color:' + color + ';}'
      );
    });

    rules.push(
      '.bpn-box[data-color="gold"]{' +
        'background:linear-gradient(150deg,#1A1200 0%,#2A1E00 40%,#1F1600 100%);' +
        'border-color:rgba(185,140,55,0.82);border-left-color:#C9973F;' +
        'color:#EFD9A2;overflow:hidden;}',
      '.bpn-box[data-color="gold"]::before{' +
        'content:"";position:absolute;inset:0;pointer-events:none;' +
        'background:linear-gradient(102deg,transparent 25%,rgba(255,210,80,.13) 50%,transparent 855%);' +
        'background-size:200% 100%;' +
        'animation:bpn-gold-shimmer 4s ease-in-out infinite;}',
      '@keyframes bpn-gold-shimmer{' +
        '0%{background-position:-60% center}' +
        '100%{background-position:160% center}}',
      '.bpn-box[data-color="gold"]>.bpn-icon{color:#C9973F;position:relative;z-index:1;}',
      '.bpn-box[data-color="gold"]>.bpn-content{position:relative;z-index:1;}',
      '.bpn-box[data-color="gold"]>.bpn-cta{background:#C9973F;color:#0C0D0C;position:relative;z-index:1;}',
      '.bpn-box[data-color="gold"]>.bpn-close{color:rgba(239,217,162,.82);position:relative;z-index:1;}',
      '.bpn-box[data-color="gold"]>.bpn-close:hover{color:#EFD9A2;}',
      'bp-notice[type="sticky"] .bpn-box[data-color="gold"]{border-top-color:#C9973F;}'
    );

    _noticeCssEl.textContent = rules.join('\n');
  }

  function applyNoticeColor(box, colorAttr, isSticky) {
    if (!colorAttr) return;
    if (colorAttr === 'gold') {
      box.setAttribute('data-color', 'gold');
      return;
    }
    if (Object.prototype.hasOwnProperty.call(NOTICE_COLOR_MAP, colorAttr)) {
      box.setAttribute('data-color', colorAttr);
    } else {
      box.style.borderLeftColor = colorAttr;
      var icon = box.querySelector('.bpn-icon');
      if (icon) icon.style.color = colorAttr;
      if (isSticky) box.style.borderTopColor = colorAttr;
    }
  }

  function BpNoticeWidget(el) {
    this.el      = el;
    this._closed = false;
    this._parse();
    this._render();
  }

  BpNoticeWidget.prototype._parse = function () {
    var el = this.el;
    this._type        = el.getAttribute('type')         || 'announcement';
    this._position    = el.getAttribute('position')     || 'bottom';
    this._noticeId    = el.getAttribute('notice-id')    || '';
    this._dismissible = el.hasAttribute('dismissible');
    this._icon        = el.getAttribute('icon')         || DEFAULT_NOTICE_ICONS[this._type] || 'bi-info-circle-fill';
    this._ctaText     = el.getAttribute('cta-text')     || '';
    this._ctaHref     = el.getAttribute('cta-href')     || '#';
    this._ctaTarget   = el.getAttribute('cta-target')   || '_self';
    this._autoDismiss = parseInt(el.getAttribute('auto-dismiss') || '0', 10);
    this._color       = el.getAttribute('color')        || '';
    this._noAnim      = el.hasAttribute('no-anim');
    this._contentHtml = el.getAttribute('data-content') || el.innerHTML.trim();
  };

  BpNoticeWidget.prototype._render = function () {
    injectNoticeCSS();
    var el   = this.el;
    var self = this;

    if (this._noticeId && this._wasClosedBefore()) {
      el.style.display = 'none';
      return;
    }

    el.innerHTML = '';
    var isSticky = this._type === 'sticky';

      var box = document.createElement('div');
    box.className = 'bpn-box';
    if (!this._noAnim) {
      box.classList.add(isSticky && this._position !== 'top' ? 'anim-up' : 'anim');
    }
    applyNoticeColor(box, this._color, isSticky);
    this._box = box;

      var icon = document.createElement('i');
    icon.className = 'bi ' + this._icon + ' bpn-icon';
    box.appendChild(icon);

      var content = document.createElement('div');
    content.className = 'bpn-content';
    content.innerHTML = this._contentHtml;
    box.appendChild(content);

      if (this._ctaText) {
      var cta = document.createElement('a');
      cta.className   = 'bpn-cta';
      cta.href        = this._ctaHref;
      cta.target      = this._ctaTarget;
      cta.textContent = this._ctaText;
      if (this._ctaTarget === '_blank') cta.rel = 'noopener';
      cta.addEventListener('click', function () {
        el.dispatchEvent(new CustomEvent('bp:notice-cta', {
          bubbles: true,
          detail : { noticeId: self._noticeId, href: self._ctaHref },
        }));
      });
      box.appendChild(cta);
    }

      if (this._dismissible) {
      var closeBtn       = document.createElement('button');
      closeBtn.type      = 'button';
      closeBtn.className = 'bpn-close';
      closeBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
      closeBtn.setAttribute('aria-label', '關閉');
      closeBtn.addEventListener('click', function () { self.close(); });
      box.appendChild(closeBtn);
    }

    el.appendChild(box);

      if (this._autoDismiss > 0) {
      setTimeout(function () { self.close(); }, this._autoDismiss * 1000);
    }
  };

  BpNoticeWidget.prototype.close = function () {
    if (this._closed) return;
    this._closed = true;
    var el      = this.el;
    var box     = this._box;
    var self    = this;
    var isDown  = this._type === 'sticky' && this._position !== 'top';

    if (!this._noAnim && box) {
      box.classList.add(isDown ? 'closing-down' : 'closing');
      setTimeout(function () { el.style.display = 'none'; }, 280);
    } else {
      el.style.display = 'none';
    }

    if (this._noticeId) {
      try { localStorage.setItem('bpn-closed-' + this._noticeId, '1'); } catch (e) {}
    }

    el.dispatchEvent(new CustomEvent('bp:notice-close', {
      bubbles: true,
      detail : { noticeId: this._noticeId },
    }));
  };

  BpNoticeWidget.prototype.show = function () {
    this._closed = false;
    if (this._noticeId) {
      try { localStorage.removeItem('bpn-closed-' + this._noticeId); } catch (e) {}
    }
    this.el.style.display = '';
    this._render();
  };

  BpNoticeWidget.prototype.setContent = function (html) {
    this._contentHtml = html;
    var content = this._box && this._box.querySelector('.bpn-content');
    if (content) content.innerHTML = html;
  };

  BpNoticeWidget.prototype._wasClosedBefore = function () {
    try { return !!localStorage.getItem('bpn-closed-' + this._noticeId); } catch (e) { return false; }
  };

    function initAllNotices() {
    document.querySelectorAll('bp-notice:not([data-bp-init])').forEach(function (el) {
      el.setAttribute('data-bp-init', '1');
      el._bpNotice = new BpNoticeWidget(el);
    });
  }

    G.BpNotice = {
    config     : BpNoticeConfig,
    palette    : PALETTE,
    colorMap   : NOTICE_COLOR_MAP,
    init       : initAllNotices,
    _reCSS     : function () { if (_noticeCssEl) injectNoticeCSS(); },

    close: function (el) {
      if (typeof el === 'string') el = document.getElementById(el);
      if (el && el._bpNotice) el._bpNotice.close();
    },
    show: function (el) {
      if (typeof el === 'string') el = document.getElementById(el);
      if (el && el._bpNotice) el._bpNotice.show();
    },
    setContent: function (el, html) {
      if (typeof el === 'string') el = document.getElementById(el);
      if (el && el._bpNotice) el._bpNotice.setContent(html);
    },
    getInstance: function (el) {
      if (typeof el === 'string') el = document.getElementById(el);
      return (el && el._bpNotice) ? el._bpNotice : null;
    },
  };

  if (BpNoticeConfig.autoInit) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAllNotices);
    } else {
      initAllNotices();
    }
  }

  const POPNOTE_CSS = `
    /* ── 觸發器基礎（dashed 預設） ── */
    [data-popover-title],
    [data-popover-content],
    [data-popover-target] {
      cursor: pointer;
      border-bottom-width: 1px;
      border-bottom-style: dashed;
      border-bottom-color: var(--xpop-hint-color, #C3A5E5);
      transition: border-color 0.2s, color 0.2s, background 0.2s, padding 0.15s;
    }
    [data-popover-hint="false"] {
      border-bottom: none !important;
    }

    /* ── hint-style: solid ── */
    [data-popover-hint-style="solid"] {
      border-bottom-style: solid !important;
    }

    /* ── hint-style: pill ── */
    [data-popover-hint-style="pill"] {
      border-bottom: none !important;
      background: rgba(var(--xpop-hint-rgb, 195,165,229), 0.18) !important;
      color: var(--xpop-hint-color, #C3A5E5) !important;
      border-radius: 999px !important;
      padding: 1px 8px !important;
      display: inline-block;
    }
    [data-popover-hint-style="pill"]:hover {
      background: rgba(var(--xpop-hint-rgb, 195,165,229), 0.32) !important;
    }

    /* ── hint-style: pill-full ── */
    [data-popover-hint-style="pill-full"] {
      border-bottom: none !important;
      background: rgba(var(--xpop-hint-rgb, 195,165,229), 0.22) !important;
      color: var(--xpop-hint-color, #C3A5E5) !important;
      border-radius: 6px !important;
      padding: 3px 12px !important;
      display: inline-block;
      width: 100%;
      box-sizing: border-box;
      text-align: left;
    }
    [data-popover-hint-style="pill-full"]:hover {
      background: rgba(var(--xpop-hint-rgb, 195,165,229), 0.36) !important;
    }

    /* panel-active 在 pill / pill-full 上加亮框 */
    [data-popover-hint-style="pill"].xpop-panel-active,
    [data-popover-hint-style="pill-full"].xpop-panel-active {
      outline: 1px solid var(--xpop-hint-color, #C3A5E5);
    }

    .xpop-container {
      position: fixed;
      z-index: 99999;
      max-width: var(--xpop-max-width, 560px);
      min-width: 220px;
      border-radius: 8px;
      border-width: 1px;
      border-style: var(--xpop-border-style, solid);
      border-color: var(--xpop-border-color, #C3A5E5);
      background: var(--xpop-bg, #130e1e);
      font-size: var(--xpop-font-size, 1rem);
      color: #c6c7bd;
      box-shadow: 0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35);
      pointer-events: auto;
      font-family: 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
      line-height: 1.5;
      opacity: 0;
      transform: scale(0.88);
      transform-origin: var(--xpop-origin, center bottom);
      transition: opacity 0.22s cubic-bezier(.4,0,.2,1),
                  transform 0.22s cubic-bezier(.4,0,.2,1);
    }
    .xpop-container.xpop-visible {
      opacity: 1;
      transform: scale(1);
    }
    .xpop-arrow {
      position: absolute;
      width: 0;
      height: 0;
      border: 8px solid transparent;
    }
    .xpop-container[data-placement="top"] .xpop-arrow {
      bottom: -16px; left: 50%;
      transform: translateX(-50%);
      border-top-color: var(--xpop-border-color, #C3A5E5);
    }
    .xpop-container[data-placement="bottom"] .xpop-arrow {
      top: -16px; left: 50%;
      transform: translateX(-50%);
      border-bottom-color: var(--xpop-border-color, #C3A5E5);
    }
    .xpop-container[data-placement="left"] .xpop-arrow {
      right: -16px; top: 50%;
      transform: translateY(-50%);
      border-left-color: var(--xpop-border-color, #C3A5E5);
    }
    .xpop-container[data-placement="right"] .xpop-arrow {
      left: -16px; top: 50%;
      transform: translateY(-50%);
      border-right-color: var(--xpop-border-color, #C3A5E5);
    }
    .xpop-arrow::after {
      content: '';
      position: absolute;
      width: 0; height: 0;
      border: 7px solid transparent;
    }
    .xpop-container[data-placement="top"] .xpop-arrow::after {
      bottom: 1px; left: -7px;
      border-top-color: var(--xpop-bg, #130e1e);
    }
    .xpop-container[data-placement="bottom"] .xpop-arrow::after {
      top: 1px; left: -7px;
      border-bottom-color: var(--xpop-bg, #130e1e);
    }
    .xpop-container[data-placement="left"] .xpop-arrow::after {
      right: 1px; top: -7px;
      border-left-color: var(--xpop-bg, #130e1e);
    }
    .xpop-container[data-placement="right"] .xpop-arrow::after {
      left: 1px; top: -7px;
      border-right-color: var(--xpop-bg, #130e1e);
    }

    .xpop-header {
      padding: 10px 16px 8px;
      font-size: calc(var(--xpop-font-size, 1rem) * 1.05);
      font-weight: 700;
      color: var(--xpop-title-color, #C3A5E5);
      border-bottom: 1px solid var(--xpop-border-color, #C3A5E5);
      letter-spacing: 0.03em;
    }
    .xpop-header:empty { display: none; }
    .xpop-body { padding: 12px 16px 14px; }
    .xpop-carousel-track { width: 100%; }
    /* 只選直接子 section（carousel 頁面），避免頁面內容包含 <section> 時被誤選 */
    .xpop-carousel-track > section {
      display: none;
      width: 100%;
      box-sizing: border-box;
      padding: 2px 0;
    }
    .xpop-carousel-track > section.xpop-active { display: block; }
    .xpop-carousel-track > section.xpop-anim-forward {
      animation: xpop-slide-forward 0.28s cubic-bezier(.4,0,.2,1) both;
    }
    .xpop-carousel-track > section.xpop-anim-back {
      animation: xpop-slide-back 0.28s cubic-bezier(.4,0,.2,1) both;
    }
    @keyframes xpop-slide-forward {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes xpop-slide-back {
      from { opacity: 0; transform: translateY(-14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .xpop-carousel-track.xpop-crossfade > section.xpop-anim-forward,
    .xpop-carousel-track.xpop-crossfade > section.xpop-anim-back {
      animation: xpop-fadein 0.28s ease both;
    }
    @keyframes xpop-fadein {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .xpop-carousel-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .xpop-dots { display: flex; gap: 6px; align-items: center; }
    .xpop-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
      border: none; padding: 0;
    }
    .xpop-dot.xpop-dot-active {
      background: var(--xpop-title-color, #C3A5E5);
      transform: scale(1.3);
    }
    .xpop-nav { display: flex; align-items: center; gap: 8px; color: #c6c7bd; font-size: 0.88rem; }
    .xpop-nav-btn {
      background: none;
      border: 1px solid rgba(255,255,255,0.18);
      color: var(--xpop-title-color, #C3A5E5);
      border-radius: 4px;
      width: 26px; height: 26px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
      transition: background 0.18s, border-color 0.18s;
      padding: 0; line-height: 1;
    }
    .xpop-nav-btn:hover {
      background: rgba(255,255,255,0.08);
      border-color: var(--xpop-title-color, #C3A5E5);
    }
    .xpop-nav-btn:disabled { opacity: 0.3; cursor: default; }
    .xpop-counter {
      min-width: 40px; text-align: center;
      opacity: 0.8; font-variant-numeric: tabular-nums;
    }
    .xpop-progress {
      height: 2px; background: rgba(255,255,255,0.08);
      position: relative; overflow: hidden;
    }
    .xpop-progress-bar {
      position: absolute; left: 0; top: 0;
      height: 100%; width: 0%;
      background: var(--xpop-title-color, #C3A5E5);
      transition: width linear;
    }

    .xpop-panel-wrap {
      border-radius: 8px;
      border-width: 1px;
      border-style: solid;
      border-color: var(--xpop-border-color, #C3A5E5);
      background: var(--xpop-bg, #130e1e);
      font-size: var(--xpop-font-size, 1rem);
      color: #c6c7bd;
      font-family: 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
      line-height: 1.5;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      animation: xpop-panel-in 0.28s cubic-bezier(.4,0,.2,1) both;
    }
    @keyframes xpop-panel-in {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .xpop-panel-source {
      padding: 9px 16px 4px;
      font-size: 0.76rem;
      color: var(--xpop-title-color, #C3A5E5);
      opacity: 0.78;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .xpop-panel-source::before {
      content: '';
      display: inline-block;
      width: 5px; height: 5px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
      opacity: 0.9;
    }

    /* Active trigger highlight in panel mode */
    [data-popover-title].xpop-panel-active,
    [data-popover-content].xpop-panel-active,
    [data-popover-target].xpop-panel-active {
      border-bottom-style: solid !important;
      color: var(--xpop-hint-color, #C3A5E5);
    }

    mark.bpn-annotated {
      background: none;
      color: inherit;
    }

    #xpop-bs-modal .modal-content {
      border-width: 1px;
      border-style: solid;
    }
    #xpop-bs-modal .modal-header {
      border-bottom-width: 1px;
      border-bottom-style: solid;
      align-items: center;
    }
    #xpop-bs-modal .modal-body {
      color: #C6C7BD;
      font-family: 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
      line-height: 1.5;
      overflow-y: auto;
    }

    #xpop-bs-offcanvas .offcanvas-header {
      border-bottom-width: 1px;
      border-bottom-style: solid;
      align-items: center;
    }
    #xpop-bs-offcanvas .offcanvas-body {
      color: #C6C7BD;
      font-family: 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
      line-height: 1.5;
      overflow-y: auto;
    }

    #xpop-bs-modal .btn-close,
    #xpop-bs-offcanvas .btn-close {
      opacity: 0.65;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }
    #xpop-bs-modal .btn-close:hover,
    #xpop-bs-offcanvas .btn-close:hover {
      opacity: 1;
    }

    .xpop-show-btn-wrap {
      padding: 4px 16px 14px;
      display: flex;
      justify-content: flex-end;
    }
    .xpop-panel-wrap .xpop-show-btn-wrap {
      padding: 6px 16px 16px;
    }
    .xpop-show-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 14px;
      border: 1px solid var(--xpop-border-color, #C3A5E5);
      border-radius: 5px;
      background: transparent;
      color: var(--xpop-title-color, #C3A5E5);
      font-size: calc(var(--xpop-font-size, 1rem) * 0.85);
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      letter-spacing: 0.03em;
      transition: background 0.18s, color 0.18s, opacity 0.18s;
      white-space: nowrap;
    }
    .xpop-show-btn:hover {
      background: var(--xpop-border-color, #C3A5E5);
      color: #0C0D0C;
    }
    /* Modal / Offcanvas 內的 show-btn 繼承 theme 色 */
    .xpop-modal-show-btn-wrap {
      display: flex;
      justify-content: flex-end;
      padding: 4px 0 2px;
    }

    /* ── data-popover-url 自動產生的 pill 連結按鈕 ── */
    .xpop-url-pill {
      border-radius: 999px;
      padding: 4px 14px 4px 15px;
      gap: 6px;
      max-width: 100%;
      min-width: 0;
      overflow: hidden;
    }
    .xpop-url-pill > span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    .xpop-url-pill > i {
      font-size: 0.95em;
      flex-shrink: 0;
    }
    /* 對齊方式：data-popover-url-align="start|center|end"（預設 end） */
    .xpop-show-btn-wrap[data-align="start"],
    .xpop-modal-show-btn-wrap[data-align="start"] { justify-content: flex-start; }
    .xpop-show-btn-wrap[data-align="center"],
    .xpop-modal-show-btn-wrap[data-align="center"] { justify-content: center; }
    .xpop-show-btn-wrap[data-align="full"],
    .xpop-modal-show-btn-wrap[data-align="full"] { justify-content: stretch; }
    .xpop-show-btn-wrap[data-align="full"] > .xpop-show-btn,
    .xpop-modal-show-btn-wrap[data-align="full"] > .xpop-show-btn {
      width: 100%;
      justify-content: center;
    }
  `;

  const THEMES = {
    dark      : { bg: '#130e1e', titleColor: PALETTE.lavender, borderColor: PALETTE.lavender },
    lavender  : { bg: '#130e1e', titleColor: PALETTE.lavender, borderColor: PALETTE.lavender },
    sky       : { bg: '#071318', titleColor: PALETTE.sky,      borderColor: PALETTE.sky      },
    ocean     : { bg: '#041418', titleColor: PALETTE.ocean,    borderColor: PALETTE.ocean    },
    warning   : { bg: '#190d0d', titleColor: PALETTE.wrong,    borderColor: PALETTE.wrong    }, // 紅色
    success   : { bg: '#091508', titleColor: PALETTE.safe,     borderColor: PALETTE.safe     },
    safe      : { bg: '#091508', titleColor: PALETTE.safe,     borderColor: PALETTE.safe     },
    special   : { bg: '#111605', titleColor: PALETTE.special,  borderColor: PALETTE.special  },
    highlight : { bg: '#111605', titleColor: PALETTE.special,  borderColor: PALETTE.special  },
    note      : { bg: '#141200', titleColor: PALETTE.yellow,   borderColor: PALETTE.yellow   },
    yellow    : { bg: '#141200', titleColor: PALETTE.yellow,   borderColor: PALETTE.yellow   },
    salmon    : { bg: '#180e0a', titleColor: PALETTE.salmon,   borderColor: PALETTE.salmon   },
    pink      : { bg: '#180a12', titleColor: PALETTE.pink,     borderColor: PALETTE.pink     },
    orange    : { bg: '#181005', titleColor: PALETTE.orange,   borderColor: PALETTE.orange   },
    vanilla   : { bg: '#171815', titleColor: PALETTE.vanilla,  borderColor: PALETTE.vanilla  },
    teal      : { bg: '#061412', titleColor: PALETTE.teal,     borderColor: PALETTE.teal     },
    focus     : { bg: '#070d16', titleColor: PALETTE.focus,    borderColor: PALETTE.focus    },
    indigo    : { bg: '#0e0a18', titleColor: PALETTE.indigo,   borderColor: PALETTE.indigo   },
    info      : { bg: '#060c1c', titleColor: PALETTE.info,     borderColor: PALETTE.info     },
    wrong     : { bg: '#190d0d', titleColor: PALETTE.wrong,    borderColor: PALETTE.wrong    }, // alias for warning
    correct   : { bg: '#091508', titleColor: PALETTE.safe,     borderColor: PALETTE.safe     }, // alias for safe
    accent    : { bg: '#130e1e', titleColor: PALETTE.lavender, borderColor: PALETTE.lavender }, // alias for lavender
  };

  let config = {
    theme       : 'dark',
    maxWidth    : '560px',
    offset      : 8,
    fontSize    : '1rem',
    borderStyle : 'solid',
    placement   : 'top',
    carousel    : { animation: 'slide', interval: 3000 },
    panelTarget : null,
    _customThemes: {},
    modal       : false,
    modalSize   : '',
    modalStatic : false,
  };

  G.BpPopnote = {
    annotate(rules) {
      (Array.isArray(rules) ? rules : [rules]).forEach(_annotateRule);
    },
    clearAnnotations: _clearAnnotations,
  };

  G.PopoverConfig = {
    set(opts) {
      if (opts.carousel) { Object.assign(config.carousel, opts.carousel); delete opts.carousel; }
      Object.assign(config, opts);
    },
    addTheme(name, def) { config._customThemes[name] = def; },
  };

  let currentPop = null, currentTrigger = null, carouselState = null;
  let panelActiveTrigger = null, panelCarouselState = null;

  function getTheme(n)   { return config._customThemes[n] || THEMES[n] || THEMES.dark; }
  function ra(el, k, fb) { return el.dataset[k] !== undefined ? el.dataset[k] : fb; }

  /* hex (#RRGGBB 或 #RGB) → "R,G,B" 字串，供 rgba() 的 CSS 變數使用 */
  function hexToRgb(hex) {
    if (!hex || hex.charAt(0) !== '#') return null;
    let h = hex.slice(1);
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0,2),16);
    const g = parseInt(h.slice(2,4),16);
    const b = parseInt(h.slice(4,6),16);
    if (isNaN(r)||isNaN(g)||isNaN(b)) return null;
    return r+','+g+','+b;
  }

  /*
   * 將觸發器的 hint 顏色設到 CSS 變數。
   * 優先序：data-popover-color（自訂色）> theme.borderColor
   * 支援調色盤 token（例如 "sky"）或任意 hex
   */
  function applyHintColor(trigger, theme) {
    const raw = trigger.dataset.popoverColor;
    let color;
    if (raw) {
      color = (PALETTE[raw] || raw);          // 先查 token，再當 hex/keyword 用
    } else {
      color = theme.borderColor;
    }
    trigger.style.setProperty('--xpop-hint-color', color);
    const rgb = hexToRgb(color);
    if (rgb) trigger.style.setProperty('--xpop-hint-rgb', rgb);
  }

  function _contextMatches(textNode, targetText, ctx) {
    const block = textNode.parentNode.closest(
      'p,li,td,th,div,section,article,blockquote,h1,h2,h3,h4,h5,h6'
    ) || textNode.parentNode;
    const text = block.textContent;
    const pos  = text.indexOf(targetText);
    if (pos === -1) return false;
    if (ctx.before && !text.slice(0, pos).includes(ctx.before))               return false;
    if (ctx.after  && !text.slice(pos + targetText.length).includes(ctx.after)) return false;
    return true;
  }

  function _wrapNode(textNode, start, length, rule) {
    const mid = textNode.splitText(start);
    mid.splitText(length);

    const mark = document.createElement('mark');
    mark.className = 'bpn-annotated';

    if (rule.title)              mark.dataset.popoverTitle        = rule.title;
    if (rule.content)            mark.dataset.popoverContent      = rule.content;
    if (rule.target)             mark.dataset.popoverTarget       = rule.target;
    if (rule.theme)              mark.dataset.popoverTheme        = rule.theme;
    if (rule.placement)         mark.dataset.popoverPlacement    = rule.placement;
    if (rule.panel)              mark.dataset.popoverPanel        = rule.panel;
    if (rule.label)              mark.dataset.popoverLabel        = rule.label;
    if (rule.maxwidth)           mark.dataset.popoverMaxwidth     = rule.maxwidth;
    if (rule.fontsize)           mark.dataset.popoverFontsize     = rule.fontsize;
    if (rule.carouselAnim)       mark.dataset.popoverCarouselAnim = rule.carouselAnim;
    if (rule.modal  !== undefined) mark.dataset.popoverModal      = String(rule.modal);
    if (rule.arrow  !== undefined) mark.dataset.popoverArrow      = String(rule.arrow);
    if (rule.hint   === false)     mark.dataset.popoverHint       = 'false';
    if (rule.hintStyle !== undefined) mark.dataset.popoverHintStyle = rule.hintStyle;
    if (rule.color  !== undefined)    mark.dataset.popoverColor     = rule.color;
    if (rule.interval !== undefined) mark.dataset.popoverInterval = String(rule.interval);
    if (rule.offset !== undefined)   mark.dataset.popoverOffset   = String(rule.offset);
    if (rule.showBtn !== undefined)  mark.dataset.popoverShowBtn  = rule.showBtn;
    if (rule.btnHref !== undefined)  mark.dataset.popoverBtnHref  = rule.btnHref;
    if (rule.url      !== undefined) mark.dataset.popoverUrl      = rule.url;
    if (rule.urlText  !== undefined) mark.dataset.popoverUrlText  = rule.urlText;
    if (rule.urlAlign !== undefined) mark.dataset.popoverUrlAlign = rule.urlAlign;

    mid.parentNode.insertBefore(mark, mid);
    mark.appendChild(mid);
    return mark;
  }

  function _annotateRule(rule) {
    if (!rule || !rule.text) {
      console.warn('[BpPopnote.annotate] text 為必填'); return;
    }
    const scopeEl = rule.within
      ? (typeof rule.within === 'string' ? document.querySelector(rule.within) : rule.within)
      : document.body;
    if (!scopeEl) {
      console.warn('[BpPopnote.annotate] within selector "' + rule.within + '" 找不到'); return;
    }

    const target  = rule.text;
    const wantNth = rule.occurrence || 1;
    let nthCount  = 0;
    let found     = false;
    const walker  = document.createTreeWalker(scopeEl, NodeFilter.SHOW_TEXT);
    let node;

    outer:
    while ((node = walker.nextNode())) {
      const pTag = node.parentNode.tagName;
      if (pTag === 'SCRIPT' || pTag === 'STYLE' || pTag === 'NOSCRIPT') continue;
      if (node.parentNode.classList.contains('bpn-annotated')) continue;

      const val = node.nodeValue;
      let searchFrom = 0, idx;

      while ((idx = val.indexOf(target, searchFrom)) !== -1) {
        if (rule.context && !_contextMatches(node, target, rule.context)) {
          searchFrom = idx + 1; continue;
        }
        nthCount++;
        if (nthCount === wantNth) {
          _wrapNode(node, idx, target.length, rule);
          found = true;
          break outer;
        }
        searchFrom = idx + target.length;
      }
    }
    if (!found) {
      console.warn(
        '[BpPopnote.annotate] "' + target + '" 第 ' + wantNth + ' 個未找到' +
        (rule.within ? '（within: "' + rule.within + '"）' : '')
      );
    }
  }

  function _clearAnnotations(scopeSelector) {
    const scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    if (!scope) return;
    scope.querySelectorAll('mark.bpn-annotated').forEach(function (mark) {
      const parent = mark.parentNode;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
      parent.normalize();
    });
  }

  function injectPopnoteCSS() {
    if (document.getElementById('bp-popnote-style')) return;
    const s = document.createElement('style');
    s.id = 'bp-popnote-style';
    s.textContent = POPNOTE_CSS;
    document.head.appendChild(s);
  }

  function calcPosition(trigger, pop, placement, offset) {
    const tr = trigger.getBoundingClientRect();
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;
    const pos = {
      top:    { top: tr.top    - ph - offset,        left: tr.left + tr.width / 2 - pw / 2 },
      bottom: { top: tr.bottom + offset,             left: tr.left + tr.width / 2 - pw / 2 },
      left:   { top: tr.top    + tr.height / 2 - ph / 2, left: tr.left - pw - offset       },
      right:  { top: tr.top    + tr.height / 2 - ph / 2, left: tr.right + offset           },
    };
    let p = placement;
    if (p === 'top'    && pos.top.top    < 8)         p = 'bottom';
    if (p === 'bottom' && pos.bottom.top + ph > vh-8) p = 'top';
    if (p === 'left'   && pos.left.left  < 8)         p = 'right';
    if (p === 'right'  && pos.right.left + pw > vw-8) p = 'left';
    let { top, left } = pos[p];
    left = Math.max(8, Math.min(left, vw - pw - 8));
    top  = Math.max(8, Math.min(top,  vh - ph - 8));
    return { top, left, finalPlacement: p };
  }

  function originOf(p) {
    return ({ top: 'center bottom', bottom: 'center top', left: 'right center', right: 'left center' })[p] || 'center bottom';
  }

  function extractContent(trigger) {
    const targetId = trigger.dataset.popoverTarget || '';
    if (targetId) {
      const tpl = document.querySelector(targetId);
      if (tpl && tpl.content) {
        const d = document.createElement('div');
        d.appendChild(tpl.content.cloneNode(true));
        return d.innerHTML;
      }
      if (tpl) return tpl.innerHTML;
    }
    return trigger.dataset.popoverContent || '';
  }

  function isExternalHref(href) {
    return /^(https?:)?\/\//.test(href);
  }

  /* 未指定文字時，外部連結取網域名當標籤，內部連結用「前往」 */
  function defaultUrlLabel(href) {
    if (!isExternalHref(href)) return '前往';
    try {
      const abs  = href.indexOf('//') === 0 ? 'https:' + href : href;
      const host = new URL(abs).hostname.replace(/^www\./, '');
      return host || '開啟連結';
    } catch (e) {
      return '開啟連結';
    }
  }

  /*
   * 說明方框底部的連結按鈕，兩種寫法：
   *   1. data-popover-url="https://…"     → 自動顯示 pill 按鈕（推薦）
   *      data-popover-url-text="原文連結"  → 自訂文字（省略時取網域名）
   *      data-popover-url-align="start|center|end|full"（預設 end）
   *   2. data-popover-show-btn / data-popover-btn-href → 舊寫法，方角按鈕，維持相容
   * 兩者並存時以 data-popover-url 為準。
   */
  function buildShowBtnEl(trigger, theme, forModal) {
    const url    = trigger.dataset.popoverUrl;
    const legacy = trigger.dataset.popoverShowBtn;
    let href, btnLabel, isPill;

    if (url) {
      href     = url;
      btnLabel = trigger.dataset.popoverUrlText || legacy || defaultUrlLabel(url);
      isPill   = true;
    } else {
      if (!legacy && legacy !== '') return null;       // 兩個屬性都不存在 → 不顯示
      href     = trigger.dataset.popoverBtnHref || '#';
      btnLabel = legacy || '詳情';
      isPill   = false;
    }

    const isExternal = isExternalHref(href);
    const align      = trigger.dataset.popoverUrlAlign || 'end';

    const wrap = document.createElement('div');
    wrap.className = forModal ? 'xpop-modal-show-btn-wrap' : 'xpop-show-btn-wrap';
    if (align !== 'end') wrap.dataset.align = align;

    const btn = document.createElement('a');
    btn.className = isPill ? 'xpop-show-btn xpop-url-pill' : 'xpop-show-btn';
    btn.href      = href;
    btn.innerHTML =
      '<span></span><i class="bi ' +
      (isExternal ? 'bi-box-arrow-up-right' : 'bi-arrow-right-short') + '"></i>';
    btn.querySelector('span').textContent = btnLabel;
    if (isExternal) {
      btn.target = '_blank';
      btn.rel    = 'noopener noreferrer';
      btn.title  = href;
    }
    wrap.appendChild(btn);
    return wrap;
  }

  function buildContentDOM(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const secs = Array.from(tmp.querySelectorAll(':scope > section'));
    const isCarousel = secs.length > 1;

    const body = document.createElement('div');
    body.className = 'xpop-body';

    let progressEl = null, barEl = null;

    if (isCarousel) {
      const track = document.createElement('div');
      track.className = 'xpop-carousel-track';
      secs.forEach(sec => {
        const s = document.createElement('section');
        s.innerHTML = sec.innerHTML;
        track.appendChild(s);
      });
      body.appendChild(track);

      progressEl = document.createElement('div');
      progressEl.className = 'xpop-progress';
      const pb = document.createElement('div');
      pb.className = 'xpop-progress-bar';
      progressEl.appendChild(pb);

      const bar  = document.createElement('div');
      bar.className = 'xpop-carousel-bar';
      const dots = document.createElement('div');
      dots.className = 'xpop-dots';
      const nav  = document.createElement('div');
      nav.className = 'xpop-nav';
      const bp = document.createElement('button');
      bp.className = 'xpop-nav-btn'; bp.dataset.dir = '-1'; bp.innerHTML = '&#8593;';
      const bn = document.createElement('button');
      bn.className = 'xpop-nav-btn'; bn.dataset.dir = '1';  bn.innerHTML = '&#8595;';
      const ctr = document.createElement('span');
      ctr.className = 'xpop-counter';
      nav.appendChild(bp); nav.appendChild(ctr); nav.appendChild(bn);
      bar.appendChild(dots); bar.appendChild(nav);
      barEl = bar;
    } else {
      body.innerHTML = html;
    }

    return { isCarousel, body, progressEl, barEl };
  }

  function buildCarousel(sections, wrap, interval, animType) {
    const track    = wrap.querySelector('.xpop-carousel-track');
    const dotsWrap = wrap.querySelector('.xpop-dots');
    const btnPrev  = wrap.querySelector('.xpop-nav-btn[data-dir="-1"]');
    const btnNext  = wrap.querySelector('.xpop-nav-btn[data-dir="1"]');
    const counter  = wrap.querySelector('.xpop-counter');
    const pBar     = wrap.querySelector('.xpop-progress-bar');
    const total    = sections.length;
    let cur = 0, timer = null;

    if (animType === 'crossfade') track.classList.add('xpop-crossfade');

    sections.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'xpop-dot' + (i === 0 ? ' xpop-dot-active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    });

    function syncUI() {
      dotsWrap.querySelectorAll('.xpop-dot').forEach((d, i) =>
        d.classList.toggle('xpop-dot-active', i === cur));
      if (counter) counter.textContent = `${cur + 1} / ${total}`;
      if (btnPrev) btnPrev.disabled = cur === 0;
      if (btnNext) btnNext.disabled = cur === total - 1;
    }

    function goTo(idx) {
      if (idx < 0 || idx >= total) return;
      const dir  = idx > cur ? 'forward' : 'back';
      const prev = cur;
      cur = idx;
      sections[prev].classList.remove('xpop-active', 'xpop-anim-forward', 'xpop-anim-back');
      const nxt = sections[cur];
      nxt.classList.remove('xpop-anim-forward', 'xpop-anim-back');
      void nxt.offsetWidth;
      nxt.classList.add('xpop-active', dir === 'forward' ? 'xpop-anim-forward' : 'xpop-anim-back');
      syncUI();
      startProgress();
    }

    function startProgress() {
      clearTimeout(timer);
      if (pBar) { pBar.style.transition = 'none'; pBar.style.width = '0%'; void pBar.offsetWidth; }
      if (interval > 0) {
        if (pBar) { pBar.style.transition = `width ${interval}ms linear`; pBar.style.width = '100%'; }
        timer = setTimeout(() => goTo(cur < total - 1 ? cur + 1 : 0), interval);
      }
    }

    btnPrev && btnPrev.addEventListener('click', () => goTo(cur - 1));
    btnNext && btnNext.addEventListener('click', () => goTo(cur + 1));
    sections[0].classList.add('xpop-active');
    syncUI();
    startProgress();

    return { stop: () => clearTimeout(timer) };
  }

  const OC_PLACEMENTS = ['start', 'end', 'top', 'bottom'];

  function getModalMode(trigger) {
    const attr = trigger.dataset.popoverModal;
    let val;
    if (attr !== undefined) {
      val = (attr === '') ? 'dialog' : attr;
    } else if (config.modal) {
      val = config.modal;
    } else {
      return null;
    }
    if (val === 'false' || val === false)                            return null;
    if (val === true || val === 'true' || val === 'dialog')          return 'dialog';
    if (OC_PLACEMENTS.includes(val))                                 return val;
    return 'dialog';
  }

  function ensureModal() {
    let el = document.getElementById('xpop-bs-modal');
    if (el) return el;
    el = document.createElement('div');
    el.className = 'modal fade';
    el.id = 'xpop-bs-modal';
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="modal-dialog modal-dialog-scrollable">' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<span class="modal-title fw-bold fs-5"></span>' +
            '<button type="button" class="btn-close btn-close-white ms-auto"' +
              ' data-bs-dismiss="modal" aria-label="Close"></button>' +
          '</div>' +
          '<div class="modal-body"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function ensureOffcanvas() {
    let el = document.getElementById('xpop-bs-offcanvas');
    if (el) return el;
    el = document.createElement('div');
    el.className = 'offcanvas';
    el.id = 'xpop-bs-offcanvas';
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="offcanvas-header">' +
        '<span class="offcanvas-title fw-bold fs-5"></span>' +
        '<button type="button" class="btn-close btn-close-white ms-auto"' +
          ' data-bs-dismiss="offcanvas" aria-label="Close"></button>' +
      '</div>' +
      '<div class="offcanvas-body"></div>';
    document.body.appendChild(el);
    return el;
  }

  function applyThemeStyles(rootEl, headerEl, titleEl, theme) {
    rootEl.style.background   = theme.bg;
    rootEl.style.borderColor  = theme.borderColor;
    headerEl.style.background       = theme.bg;
    headerEl.style.borderBottomColor = theme.borderColor;
    titleEl.style.color = theme.titleColor;
  }

  const NAMED_SIZES = { sm: 'modal-sm', lg: 'modal-lg', xl: 'modal-xl' };

  function showModal(trigger) {
    const modalEl  = ensureModal();
    const theme    = getTheme(ra(trigger, 'popoverTheme', config.theme));
    const title    = trigger.dataset.popoverTitle || '';
    const html     = extractContent(trigger);
    const rawSize  = ra(trigger, 'popoverModalSize',   config.modalSize);
    const isStatic = ra(trigger, 'popoverModalStatic', String(config.modalStatic)) === 'true';

    const ocEl = document.getElementById('xpop-bs-offcanvas');
    if (ocEl) { const ocInst = bootstrap.Offcanvas.getInstance(ocEl); if (ocInst) ocInst.hide(); }

    const content = modalEl.querySelector('.modal-content');
    const header  = modalEl.querySelector('.modal-header');
    const titleEl = modalEl.querySelector('.modal-title');
    const body    = modalEl.querySelector('.modal-body');

    applyThemeStyles(content, header, titleEl, theme);
    titleEl.innerHTML = title;
    body.innerHTML    = html;

    const modalShowBtnEl = buildShowBtnEl(trigger, theme, true);
    if (modalShowBtnEl) {
      modalShowBtnEl.style.setProperty('--xpop-border-color', theme.borderColor);
      modalShowBtnEl.style.setProperty('--xpop-title-color',  theme.titleColor);
      body.appendChild(modalShowBtnEl);
    }

    const dialog = modalEl.querySelector('.modal-dialog');
    dialog.className = 'modal-dialog modal-dialog-scrollable';
    dialog.style.maxWidth = '';
    if (NAMED_SIZES[rawSize]) {
      dialog.classList.add(NAMED_SIZES[rawSize]);
    } else if (rawSize) {
      dialog.style.maxWidth = rawSize;
    }

    const prev = bootstrap.Modal.getInstance(modalEl);
    if (prev) prev.dispose();

    new bootstrap.Modal(modalEl, {
      backdrop: isStatic ? 'static' : true,
      keyboard: !isStatic,
    }).show();
  }

  function showOffcanvas(trigger, placement) {
    const ocEl    = ensureOffcanvas();
    const theme   = getTheme(ra(trigger, 'popoverTheme', config.theme));
    const title   = trigger.dataset.popoverTitle || '';
    const html    = extractContent(trigger);
    const rawSize = ra(trigger, 'popoverModalSize',   config.modalSize);
    const isStatic = ra(trigger, 'popoverModalStatic', String(config.modalStatic)) === 'true';

    const mEl = document.getElementById('xpop-bs-modal');
    if (mEl) { const mInst = bootstrap.Modal.getInstance(mEl); if (mInst) mInst.hide(); }

    ocEl.className = 'offcanvas offcanvas-' + placement;
    ocEl.style.width  = '';
    ocEl.style.height = '';
    if (rawSize) {
      if (placement === 'start' || placement === 'end') {
        ocEl.style.width  = rawSize;
      } else {
        ocEl.style.height = rawSize;
      }
    }

    const header  = ocEl.querySelector('.offcanvas-header');
    const titleEl = ocEl.querySelector('.offcanvas-title');
    const body    = ocEl.querySelector('.offcanvas-body');

    applyThemeStyles(ocEl, header, titleEl, theme);
    titleEl.innerHTML = title;
    body.innerHTML    = html;

    const ocShowBtnEl = buildShowBtnEl(trigger, theme, true);
    if (ocShowBtnEl) {
      ocShowBtnEl.style.setProperty('--xpop-border-color', theme.borderColor);
      ocShowBtnEl.style.setProperty('--xpop-title-color',  theme.titleColor);
      body.appendChild(ocShowBtnEl);
    }

    const prev = bootstrap.Offcanvas.getInstance(ocEl);
    if (prev) prev.dispose();

    new bootstrap.Offcanvas(ocEl, {
      backdrop: true,
      keyboard: !isStatic,
      scroll:   false,
    }).show();
  }

  function getPanelTargetEl(trigger) {
    const attr = trigger.dataset.popoverPanel;
    if (attr === 'false') return null;
    const selector = (attr !== undefined && attr !== '') ? attr : config.panelTarget;
    if (!selector) return null;
    try { return document.querySelector(selector) || null; } catch { return null; }
  }

  function clearPanel() {
    if (panelActiveTrigger) {
      panelActiveTrigger.classList.remove('xpop-panel-active');
      panelActiveTrigger = null;
    }
    if (panelCarouselState) { panelCarouselState.stop(); panelCarouselState = null; }
  }

  function renderToPanel(trigger, panelEl) {
    const same = panelActiveTrigger === trigger;
    clearPanel();
    if (same) { panelEl.innerHTML = ''; return; }

    const themeName = ra(trigger, 'popoverTheme',        config.theme);
    const fontSize  = ra(trigger, 'popoverFontsize',     config.fontSize);
    const bStyle    = ra(trigger, 'popoverBorder',       config.borderStyle);
    const title     = trigger.dataset.popoverTitle       || '';
    const cInterval = parseInt(ra(trigger, 'popoverInterval', config.carousel.interval), 10);
    const cAnim     = ra(trigger, 'popoverCarouselAnim', config.carousel.animation);
    const label     = trigger.dataset.popoverLabel       || trigger.textContent.trim().slice(0, 60);
    const theme     = getTheme(themeName);
    const html      = extractContent(trigger);

    applyHintColor(trigger, theme);

    const { isCarousel, body, progressEl, barEl } = buildContentDOM(html);

    const wrap = document.createElement('div');
    wrap.className = 'xpop-panel-wrap';
    wrap.style.setProperty('--xpop-bg',           theme.bg);
    wrap.style.setProperty('--xpop-title-color',  theme.titleColor);
    wrap.style.setProperty('--xpop-border-color', theme.borderColor);
    wrap.style.setProperty('--xpop-font-size',    fontSize);
    wrap.style.borderStyle = bStyle;

    if (label) {
      const src = document.createElement('div');
      src.className = 'xpop-panel-source';
      src.textContent = label;
      wrap.appendChild(src);
    }

    const hdr = document.createElement('div');
    hdr.className = 'xpop-header';
    hdr.innerHTML = title;
    wrap.appendChild(hdr);
    wrap.appendChild(body);

    if (isCarousel) {
      wrap.appendChild(progressEl);
      wrap.appendChild(barEl);
    }

    const panelShowBtnEl = buildShowBtnEl(trigger, theme, false);
    if (panelShowBtnEl) {
      panelShowBtnEl.style.setProperty('--xpop-border-color', theme.borderColor);
      panelShowBtnEl.style.setProperty('--xpop-title-color',  theme.titleColor);
      wrap.appendChild(panelShowBtnEl);
    }

    panelEl.innerHTML = '';
    panelEl.appendChild(wrap);

    if (isCarousel) {
      panelCarouselState = buildCarousel(
        Array.from(wrap.querySelectorAll('.xpop-carousel-track > section')),
        wrap, cInterval, cAnim
      );
    }

    trigger.classList.add('xpop-panel-active');
    panelActiveTrigger = trigger;
  }

  function createPopover(trigger) {
    const themeName = ra(trigger, 'popoverTheme',      config.theme);
    const placement = ra(trigger, 'popoverPlacement',  config.placement);
    const bStyle    = ra(trigger, 'popoverBorder',     config.borderStyle);
    const fontSize  = ra(trigger, 'popoverFontsize',   config.fontSize);
    const maxWidth  = ra(trigger, 'popoverMaxwidth',   config.maxWidth);
    const showArrow = ra(trigger, 'popoverArrow', 'true') !== 'false';
    const title     = trigger.dataset.popoverTitle     || '';
    const cInterval = parseInt(ra(trigger, 'popoverInterval', config.carousel.interval), 10);
    const cAnim     = ra(trigger, 'popoverCarouselAnim', config.carousel.animation);
    const theme     = getTheme(themeName);
    const html      = extractContent(trigger);
    const { isCarousel, body, progressEl, barEl } = buildContentDOM(html);
    const pop = document.createElement('div');
    pop.className = 'xpop-container';
    pop.dataset.placement = placement;
    pop.style.setProperty('--xpop-bg',           theme.bg);
    pop.style.setProperty('--xpop-title-color',  theme.titleColor);
    pop.style.setProperty('--xpop-border-color', theme.borderColor);
    pop.style.setProperty('--xpop-font-size',    fontSize);
    pop.style.setProperty('--xpop-max-width',    maxWidth);
    pop.style.borderStyle = bStyle;
    applyHintColor(trigger, theme);

    if (showArrow) {
      const a = document.createElement('div');
      a.className = 'xpop-arrow';
      pop.appendChild(a);
    }

    const hdr = document.createElement('div');
    hdr.className = 'xpop-header';
    hdr.innerHTML = title;
    pop.appendChild(hdr);
    pop.appendChild(body);
    if (isCarousel) {
      pop.appendChild(progressEl);
      pop.appendChild(barEl);
    }

    const showBtnEl = buildShowBtnEl(trigger, theme, false);
    if (showBtnEl) {
      showBtnEl.style.setProperty('--xpop-border-color', theme.borderColor);
      showBtnEl.style.setProperty('--xpop-title-color',  theme.titleColor);
      pop.appendChild(showBtnEl);
    }

    document.body.appendChild(pop);

    const offset = parseInt(ra(trigger, 'popoverOffset', config.offset), 10);
    const { top, left, finalPlacement } = calcPosition(trigger, pop, placement, offset);
    pop.dataset.placement = finalPlacement;
    pop.style.setProperty('--xpop-origin', originOf(finalPlacement));
    pop.style.top  = top  + 'px';
    pop.style.left = left + 'px';

    if (isCarousel) {
      carouselState = buildCarousel(
        Array.from(pop.querySelectorAll('.xpop-carousel-track > section')),
        pop, cInterval, cAnim
      );
    }
    requestAnimationFrame(() => requestAnimationFrame(() => pop.classList.add('xpop-visible')));
    return pop;
  }

  function closePop() {
    if (!currentPop) return;
    if (carouselState) { carouselState.stop(); carouselState = null; }
    const pop = currentPop;
    pop.classList.remove('xpop-visible');
    setTimeout(() => pop.parentNode && pop.parentNode.removeChild(pop), 230);
    currentPop = currentTrigger = null;
  }

  document.addEventListener('click', function (e) {
    const trigger = e.target.closest(
      '[data-popover-title],[data-popover-content],[data-popover-target]'
    );

    if (trigger) {
      e.stopPropagation();

      const modalMode = getModalMode(trigger);
      if (modalMode) {
        closePop();
        clearPanel();
        if (modalMode === 'dialog') { showModal(trigger); }
        else                        { showOffcanvas(trigger, modalMode); }
        return;
      }

      const panelEl = getPanelTargetEl(trigger);
      if (panelEl) {
        closePop();
        renderToPanel(trigger, panelEl);
        return;
      }

      if (currentTrigger === trigger) { closePop(); return; }
      closePop();
      currentTrigger = trigger;
      currentPop = createPopover(trigger);
      return;
    }

    if (currentPop && currentPop.contains(e.target)) return;
    closePop();
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(); });

  window.addEventListener('resize', function () {
    if (!currentPop || !currentTrigger) return;
    const p = currentTrigger.dataset.popoverPlacement || config.placement;
    const o = parseInt(ra(currentTrigger, 'popoverOffset', config.offset), 10);
    const { top, left, finalPlacement } = calcPosition(currentTrigger, currentPop, p, o);
    currentPop.dataset.placement = finalPlacement;
    currentPop.style.setProperty('--xpop-origin', originOf(finalPlacement));
    currentPop.style.top  = top  + 'px';
    currentPop.style.left = left + 'px';
  });

  injectPopnoteCSS();

  /*
   * 掃描所有帶 data-popover-color 或 data-popover-hint-style 的觸發器，
   * 預先套用 --xpop-hint-color / --xpop-hint-rgb，
   * 讓 pill / pill-full 在頁面載入時就能正確顯色（不需等到第一次點擊）。
   */
  function initTriggerHints() {
    const sel = '[data-popover-title],[data-popover-content],[data-popover-target]';
    document.querySelectorAll(sel).forEach(function (el) {
      const raw = el.dataset.popoverColor;
      if (!raw) return;
      const color = PALETTE[raw] || raw;
      el.style.setProperty('--xpop-hint-color', color);
      const rgb = hexToRgb(color);
      if (rgb) el.style.setProperty('--xpop-hint-rgb', rgb);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTriggerHints);
  } else {
    initTriggerHints();
  }

})(window);