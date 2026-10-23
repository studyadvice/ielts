(function (win, doc) {
  'use strict';

  const CSS_ID = '__phrase-chip-v1__';

  const BRAND = {
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

  const SIZE_MAP = {
    sm: { font: '0.85rem', padY: '4px', padX: '10px' },
    md: { font: '1rem',    padY: '6px', padX: '14px' },
    lg: { font: '1.15rem', padY: '8px', padX: '18px' },
  };

  const DEFAULTS = {
    theme:            'ocean',
    label:            '',
    size:             'md',
    shape:            'pill',        // pill | rounded | underline
    icon:             '',
    cardWidth:        '320px',
    cardTheme:        '',
    collectLabel:     '✓ 收藏這個片語',
    collectedLabel:   '已收藏',
    collectedIcon:    'bi-check-circle-fill',
    disableCollect:   false,
    eventName:        'pt:phrase-collected',
    hideTranslation:  false,
    closeOnCollect:   false,
    position:         'auto',        // auto | top | bottom
  };

  const ATTR_MAP = {
    'data-theme':            { key: 'theme',           type: 'string' },
    'data-label':            { key: 'label',           type: 'string' },
    'data-size':             { key: 'size',            type: 'string' },
    'data-shape':            { key: 'shape',           type: 'string' },
    'data-icon':             { key: 'icon',            type: 'string' },
    'data-card-width':       { key: 'cardWidth',       type: 'string' },
    'data-card-theme':       { key: 'cardTheme',       type: 'string' },
    'data-collect-label':    { key: 'collectLabel',    type: 'string' },
    'data-collected-label':  { key: 'collectedLabel',  type: 'string' },
    'data-collected-icon':   { key: 'collectedIcon',   type: 'string' },
    'data-disable-collect':  { key: 'disableCollect',  type: 'bool'   },
    'data-event-name':       { key: 'eventName',       type: 'string' },
    'data-hide-translation': { key: 'hideTranslation', type: 'bool'   },
    'data-close-on-collect': { key: 'closeOnCollect',  type: 'bool'   },
    'data-position':         { key: 'position',        type: 'string' },
  };

  /* 通用屬性讀取：phrase-chip、phrase-upgrade 共用同一套小工具 */
  function readAttrsWith(el, cfg, map) {
    for (const [attr, meta] of Object.entries(map)) {
      if (!el.hasAttribute(attr)) continue;
      const raw = el.getAttribute(attr);
      if (meta.type === 'bool') cfg[meta.key] = (raw !== 'false');
      else if (meta.type === 'int') cfg[meta.key] = parseInt(raw, 10);
      else cfg[meta.key] = raw;
    }
  }
  function readElementAttrs(el, cfg) { readAttrsWith(el, cfg, ATTR_MAP); }

  /* ══════════════════════════════════════════════════════════════
     phrase-upgrade：漸進升級動畫元件（多階段、單向前進、不附解釋彈窗）
     ══════════════════════════════════════════════════════════════ */
  const DEFAULTS_UPGRADE = {
    anim:            'strike-fade',  // crossfade | slide-up | flip | strike-fade | typewriter
    animDuration:    '0.9s',         // crossfade / slide-up / flip / strike-fade 都吃這個；可用 data-anim-duration 覆蓋
    theme:           'ocean',
    typewriterSpeed: 55,             // 每個字元的間隔（毫秒），僅 typewriter 用；可用 data-typewriter-speed 覆蓋
    hideHint:        false,
    hintIcon:        'arrow-repeat',
  };

  const ATTR_MAP_UPGRADE = {
    'data-anim':             { key: 'anim',            type: 'string' },
    'data-anim-duration':    { key: 'animDuration',    type: 'string' },
    'data-theme':            { key: 'theme',           type: 'string' },
    'data-typewriter-speed': { key: 'typewriterSpeed', type: 'int'    },
    'data-hide-hint':        { key: 'hideHint',        type: 'bool'   },
    'data-hint-icon':        { key: 'hintIcon',        type: 'string' },
  };

  function parseMs(duration) {
    const n = parseFloat(duration);
    if (isNaN(n)) return 450;
    return String(duration).indexOf('ms') !== -1 ? n : n * 1000;
  }

  /* 有 text-color 就覆蓋成該顏色（支援 BRAND 色票名稱或任意 CSS 色票字串），
     沒有就清掉 inline 覆蓋，讓文字色退回 phrase-upgrade 整體的 --pu-accent */
  function applyStageColor(wordEl, colorKey) {
    if (colorKey) wordEl.style.color = BRAND[colorKey] || colorKey;
    else wordEl.style.removeProperty('color');
  }

  function crossfadeSwap(wordEl, newText, durationMs, cb, newColor) {
    const half = durationMs / 2;
    wordEl.style.transition = `opacity ${half}ms ease`;
    wordEl.style.opacity = '0';
    setTimeout(() => {
      wordEl.textContent = newText;
      applyStageColor(wordEl, newColor);
      void wordEl.offsetWidth;
      wordEl.style.opacity = '1';
      setTimeout(cb, half);
    }, half);
  }

  function slideSwap(wordEl, newText, durationMs, cb, newColor) {
    const half = durationMs / 2;
    wordEl.style.transition = `transform ${half}ms ease, opacity ${half}ms ease`;
    wordEl.style.transform = 'translateY(-10px)';
    wordEl.style.opacity = '0';
    setTimeout(() => {
      wordEl.textContent = newText;
      applyStageColor(wordEl, newColor);
      wordEl.style.transition = 'none';
      wordEl.style.transform = 'translateY(10px)';
      wordEl.style.opacity = '0';
      void wordEl.offsetWidth;
      wordEl.style.transition = `transform ${half}ms ease, opacity ${half}ms ease`;
      wordEl.style.transform = 'translateY(0)';
      wordEl.style.opacity = '1';
      setTimeout(cb, half);
    }, half);
  }

  function flipSwap(wordEl, newText, durationMs, cb, newColor) {
    const half = durationMs / 2;
    wordEl.style.transition = `transform ${half}ms ease`;
    wordEl.style.transform = 'rotateX(90deg)';
    setTimeout(() => {
      wordEl.textContent = newText;
      applyStageColor(wordEl, newColor);
      wordEl.style.transition = 'none';
      wordEl.style.transform = 'rotateX(-90deg)';
      void wordEl.offsetWidth;
      wordEl.style.transition = `transform ${half}ms ease`;
      wordEl.style.transform = 'rotateX(0deg)';
      setTimeout(cb, half);
    }, half);
  }

  function strikeFadeSwap(wordEl, newText, durationMs, cb, newColor) {
    const strikeDur = Math.round(durationMs * 0.5);
    const pauseDur  = Math.round(durationMs * 0.25);
    const fadeDur   = Math.round(durationMs * 0.5);

    wordEl.style.setProperty('--pu-strike', `${strikeDur}ms`);
    wordEl.classList.add('is-struck');

    setTimeout(() => {
      wordEl.style.transition = `opacity ${fadeDur}ms ease`;
      wordEl.style.opacity = '0';
      setTimeout(() => {
        wordEl.textContent = newText;
        applyStageColor(wordEl, newColor);
        wordEl.classList.remove('is-struck');
        void wordEl.offsetWidth;
        wordEl.style.opacity = '1';
        setTimeout(cb, fadeDur);
      }, fadeDur);
    }, strikeDur + pauseDur);
  }

  function typewriterSwap(wordEl, newText, speedMs, cb, newColor) {
    const oldText = wordEl.textContent;
    let i = oldText.length;
    const deleteTimer = setInterval(() => {
      i--;
      wordEl.textContent = oldText.slice(0, Math.max(i, 0));
      if (i <= 0) {
        clearInterval(deleteTimer);
        applyStageColor(wordEl, newColor);
        let j = 0;
        const typeTimer = setInterval(() => {
          j++;
          wordEl.textContent = newText.slice(0, j);
          if (j >= newText.length) {
            clearInterval(typeTimer);
            cb();
          }
        }, speedMs);
      }
    }, speedMs);
  }

  function initUpgrade(el) {
    if (el.__puInit) return;
    el.__puInit = true;

    const cfg = Object.assign({}, DEFAULTS_UPGRADE, win.PhraseChipConfig || {});
    readAttrsWith(el, cfg, ATTR_MAP_UPGRADE);

    /* 取出所有 <phrase-stage>，至少要兩階段才有「升級」的意義。
       每個 stage 可以用 text-color 覆蓋自己的文字顏色（接受 BRAND 色票名稱，
       例如 shell、salmon，或任意 CSS 色票字串），不覆蓋就沿用 data-theme */
    const stages = Array.from(el.querySelectorAll('phrase-stage'))
      .map(s => ({
        text:  s.textContent.trim(),
        color: s.getAttribute('text-color') || '',
      }))
      .filter(s => s.text);
    if (stages.length < 2) return;

    el.innerHTML = '';
    el.classList.add('pu-ready');

    const accentHex = BRAND[cfg.theme] || BRAND.ocean;
    el.style.setProperty('--pu-accent', accentHex);

    const textWrap = doc.createElement('pu-text');
    const wordEl   = doc.createElement('pu-word');
    wordEl.textContent = stages[0].text;
    applyStageColor(wordEl, stages[0].color);
    textWrap.appendChild(wordEl);
    el.appendChild(textWrap);

    const hint = doc.createElement('pu-hint');
    hint.innerHTML = `<i class="bi bi-${cfg.hintIcon}"></i>`;
    if (cfg.hideHint) hint.style.display = 'none';
    el.appendChild(hint);

    let index = 0;
    const durationMs = parseMs(cfg.animDuration);

    function advance() {
      if (index >= stages.length - 1) return;
      el.classList.add('is-animating');
      const next = stages[index + 1];

      const done = () => {
        index++;
        el.classList.remove('is-animating');
        if (index >= stages.length - 1) el.classList.add('is-final');
      };

      switch (cfg.anim) {
        case 'crossfade':  crossfadeSwap(wordEl, next.text, durationMs, done, next.color); break;
        case 'slide-up':   slideSwap(wordEl, next.text, durationMs, done, next.color); break;
        case 'flip':        flipSwap(wordEl, next.text, durationMs, done, next.color); break;
        case 'typewriter':  typewriterSwap(wordEl, next.text, cfg.typewriterSpeed, done, next.color); break;
        case 'strike-fade':
        default:             strikeFadeSwap(wordEl, next.text, durationMs, done, next.color); break;
      }
    }

    el.addEventListener('click', () => {
      if (el.classList.contains('is-animating') || el.classList.contains('is-final')) return;
      advance();
    });
  }

  /* ── 樣式注入（全元件共用一份，顏色走 CSS variable 個別覆寫）──────── */
  if (!doc.getElementById(CSS_ID)) {
    const s = doc.createElement('style');
    s.id = CSS_ID;
    s.textContent = `
phrase-chip, pc-label, pc-icon, pc-panel, pc-panel-head, pc-panel-body,
pc-example, pc-translation, pc-translation-toggle, pc-actions, pc-collect-btn,
pc-collected-badge, pc-close {
  box-sizing: border-box;
}

phrase-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  line-height: 1.5;
  color: var(--pc-accent, #1CCAE8);
  background: #17181A;
  border: 1px solid var(--pc-accent, #1CCAE8);
  font-size: var(--pc-font, 1rem);
  padding: var(--pc-pad-y, 6px) var(--pc-pad-x, 14px);
  border-radius: 999px;
  transition: background 0.2s ease, transform 0.15s ease, filter 0.2s ease;
}
phrase-chip[data-shape="rounded"] { border-radius: 8px; }
phrase-chip[data-shape="underline"] {
  border: none;
  border-bottom: 2px solid var(--pc-accent, #1CCAE8);
  border-radius: 0;
  background: transparent;
  padding-left: 2px;
  padding-right: 2px;
}
phrase-chip:hover { filter: brightness(1.25); transform: translateY(-1px); }
phrase-chip.is-open { background: var(--pc-accent, #1CCAE8); color: #0C0D0C; }
phrase-chip.is-collected { opacity: 0.88; }
pc-icon { display: inline-flex; align-items: center; font-size: 0.9em; }
pc-icon.pc-collected-mark { display: none; }
phrase-chip.is-collected pc-icon.pc-collected-mark { display: inline-flex; }

/* ── 彈出卡片（light DOM，附掛在 body，避免被 overflow 裁切）──────── */
pc-panel {
  position: fixed;
  display: none;
  flex-direction: column;
  width: var(--pc-card-width, 320px);
  max-width: calc(100vw - 32px);
  background: #141514;
  border: 1px solid var(--pc-card-accent, #1CCAE8);
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.85);
  z-index: 1200;
  overflow: hidden;
}
pc-panel.is-visible { display: flex; }
pc-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--pc-card-accent, #1CCAE8);
  color: #0C0D0C;
  font-weight: 700;
  font-size: 1rem;
}
pc-close {
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 4px;
}
pc-close:hover { background: rgba(12,13,12,0.85); }
pc-panel-body {
  padding: 14px;
  color: #C6C7BD;
  font-size: 1rem;
  line-height: 1.5;
}
pc-example { display: block; margin-bottom: 10px; }
pc-example mark {
  background: var(--pc-card-accent, #1CCAE8);
  color: #0C0D0C;
  padding: 0 3px;
  border-radius: 3px;
}
pc-translation { display: block; opacity: 0.85; }
pc-translation[hidden] { display: none; }
pc-translation-toggle {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  text-decoration: underline;
  cursor: pointer;
  color: var(--pc-card-accent, #1CCAE8);
}
pc-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 14px 14px;
  min-height: 1px;
}
pc-collect-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 7px 14px;
  border-radius: 999px;
  background: var(--pc-card-accent, #1CCAE8);
  color: #0C0D0C;
  border: none;
  transition: filter 0.2s ease;
}
pc-collect-btn:hover { filter: brightness(1.15); }
pc-collected-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #27AE60;
  padding: 7px 0;
}

/* ── phrase-upgrade：漸進升級動畫 ───────────────────────────────── */
phrase-upgrade {
  display: inline-block;
  cursor: pointer;
  user-select: none;
  perspective: 500px;
}
phrase-upgrade.is-final { cursor: default; }
pu-text { display: inline-block; }
pu-word {
  display: inline-block;
  position: relative;
  font-weight: 600;
  color: var(--pu-accent, #1CCAE8);
  border-bottom: 2px dashed var(--pu-accent, #1CCAE8);
}
phrase-upgrade.is-final pu-word { border-bottom-style: solid; }
pu-word::after {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 50%;
  height: 2px;
  background: var(--pu-accent, #1CCAE8);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform var(--pu-strike, 300ms) ease;
}
pu-word.is-struck::after { transform: scaleX(1); }
pu-hint {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  font-size: 0.8em;
  color: var(--pu-accent, #1CCAE8);
  opacity: 0.6;
  transform: scale(1);
  transition: transform 0.2s ease;
  animation: pu-hint-pulse 1.6s ease-in-out infinite;
}
/* hover 時放大圖示：脈動動畫只動 opacity，transform 留給 hover 專用，
   避免兩者互搶同一個屬性而互相蓋掉 */
pu-hint:hover {
  transform: scale(1.5);
}
phrase-upgrade.is-final pu-hint { display: none; }
@keyframes pu-hint-pulse {
  0%, 100% { opacity: 0.45; }
  50%      { opacity: 1; }
}
    `;
    doc.head.appendChild(s);
  }

  /* ── 已收藏片語集合：僅存於記憶體，重新整理即歸零，不做跨頁累積 ──── */
  const collectedPhrases = new Set();
  let openPanel = null;

  /* meta 隨事件一起廣播出去，讓監聽端（例如 practice-tracker 的收藏清單）
     不需要回頭查 DOM，就能拿到完整內容：主題色、例句 HTML、翻譯文字 */
  function broadcastCollect(phrase, eventName, meta) {
    doc.dispatchEvent(new CustomEvent(eventName, {
      detail: {
        phrase,
        theme:           (meta && meta.theme) || '',
        exampleHTML:     (meta && meta.exampleHTML) || '',
        translationText: (meta && meta.translationText) || '',
      },
    }));
  }

  /* 同一個 data-phrase 可能在頁面多處出現，收藏一次、全部同步變色 */
  function markAllChipsCollected(phrase) {
    doc.querySelectorAll('phrase-chip[data-phrase]').forEach(chip => {
      if ((chip.getAttribute('data-phrase') || '').trim() !== phrase) return;
      chip.classList.add('is-collected');
      if (chip.__pcPanel) renderPanelActions(chip.__pcPanel, chip, chip.__pcCfg);
    });
  }

  function collectPhrase(phrase, eventName, meta) {
    const key = (phrase || '').trim();
    if (!key || collectedPhrases.has(key)) return;
    collectedPhrases.add(key);
    markAllChipsCollected(key);
    broadcastCollect(key, eventName || DEFAULTS.eventName, meta);
  }

  function renderPanelActions(panel, chip, cfg) {
    const actions = panel.querySelector('pc-actions');
    if (!actions) return;
    actions.innerHTML = '';
    if (cfg.disableCollect) return;

    const phrase = (chip.getAttribute('data-phrase') || '').trim();

    if (collectedPhrases.has(phrase)) {
      const badge = doc.createElement('pc-collected-badge');
      badge.innerHTML = `<i class="bi ${cfg.collectedIcon}"></i> ${cfg.collectedLabel}`;
      actions.appendChild(badge);
    } else {
      const btn = doc.createElement('pc-collect-btn');
      btn.innerHTML = `<i class="bi bi-bookmark-star-fill"></i> ${cfg.collectLabel}`;
      btn.addEventListener('click', () => {
        const data = chip.__pcData || {};
        collectPhrase(phrase, cfg.eventName, {
          theme:           cfg.theme,
          exampleHTML:     data.exampleHTML,
          translationText: data.translationText,
        });
        if (cfg.closeOnCollect) closePanel(panel);
      });
      actions.appendChild(btn);
    }
  }

  function positionPanel(panel, chip, cfg) {
    const rect = chip.getBoundingClientRect();
    const panelWidth = panel.offsetWidth || parseFloat(cfg.cardWidth) || 320;
    let left = rect.left;
    if (left + panelWidth > win.innerWidth - 16) left = win.innerWidth - panelWidth - 16;
    if (left < 16) left = 16;

    const panelHeight = panel.offsetHeight || 160;
    let placeBelow = cfg.position !== 'top';
    if (cfg.position === 'auto' && rect.bottom + panelHeight + 12 > win.innerHeight) {
      placeBelow = false;
    }

    panel.style.left = `${left}px`;
    panel.style.top = placeBelow
      ? `${rect.bottom + 8}px`
      : `${Math.max(16, rect.top - panelHeight - 8)}px`;
  }

  function closePanel(panel) {
    if (!panel) return;
    panel.classList.remove('is-visible');
    if (panel.__pcChip) panel.__pcChip.classList.remove('is-open');
    if (openPanel === panel) openPanel = null;
  }

  function openPanelFor(chip, panel, cfg) {
    if (openPanel && openPanel !== panel) closePanel(openPanel);
    renderPanelActions(panel, chip, cfg);
    panel.classList.add('is-visible');
    chip.classList.add('is-open');
    positionPanel(panel, chip, cfg);
    openPanel = panel;
    panel.__pcChip = chip;
  }

  doc.addEventListener('click', e => {
    if (!openPanel) return;
    if (e.target.closest('pc-panel') || e.target.closest('phrase-chip')) return;
    closePanel(openPanel);
  });
  doc.addEventListener('keydown', e => {
    if (e.key === 'Escape' && openPanel) closePanel(openPanel);
  });
  win.addEventListener('scroll', () => {
    if (openPanel && openPanel.__pcChip) positionPanel(openPanel, openPanel.__pcChip, openPanel.__pcChip.__pcCfg);
  }, true);
  win.addEventListener('resize', () => {
    if (openPanel && openPanel.__pcChip) positionPanel(openPanel, openPanel.__pcChip, openPanel.__pcChip.__pcCfg);
  });

  function buildPanel(chip, cfg, exampleHTML, translationText) {
    const panel = doc.createElement('pc-panel');
    panel.style.setProperty('--pc-card-width', cfg.cardWidth);
    const accentHex = BRAND[cfg.cardTheme] || BRAND[cfg.theme] || BRAND.ocean;
    panel.style.setProperty('--pc-card-accent', accentHex);

    const head = doc.createElement('pc-panel-head');
    const headTitle = doc.createElement('span');
    headTitle.textContent = chip.getAttribute('data-phrase');
    const close = doc.createElement('pc-close');
    close.innerHTML = '&times;';
    close.addEventListener('click', () => closePanel(panel));
    head.appendChild(headTitle);
    head.appendChild(close);

    const body = doc.createElement('pc-panel-body');

    if (exampleHTML) {
      const ex = doc.createElement('pc-example');
      ex.innerHTML = exampleHTML;
      body.appendChild(ex);
    }

    if (translationText) {
      if (cfg.hideTranslation) {
        const toggle = doc.createElement('pc-translation-toggle');
        toggle.textContent = '顯示中文翻譯';
        const tr = doc.createElement('pc-translation');
        tr.textContent = translationText;
        tr.hidden = true;
        toggle.addEventListener('click', () => {
          tr.hidden = !tr.hidden;
          toggle.textContent = tr.hidden ? '顯示中文翻譯' : '隱藏中文翻譯';
          positionPanel(panel, chip, cfg);
        });
        body.appendChild(toggle);
        body.appendChild(tr);
      } else {
        const tr = doc.createElement('pc-translation');
        tr.textContent = translationText;
        body.appendChild(tr);
      }
    }

    const actions = doc.createElement('pc-actions');

    panel.appendChild(head);
    panel.appendChild(body);
    panel.appendChild(actions);
    doc.body.appendChild(panel);
    return panel;
  }

  function initChip(chip) {
    if (chip.__pcInit) return;
    chip.__pcInit = true;

    const cfg = Object.assign({}, DEFAULTS, win.PhraseChipConfig || {});
    readElementAttrs(chip, cfg);

    const phrase = (chip.getAttribute('data-phrase') || '').trim();
    if (!phrase) return;

    /* 取出內嵌的 <phrase-card> 內容（例句、翻譯），再清空重建觸發按鈕 */
    const card = chip.querySelector('phrase-card');
    let exampleHTML = '';
    let translationText = '';
    if (card) {
      const ex = card.querySelector('phrase-example');
      const tr = card.querySelector('phrase-translation');
      if (ex) exampleHTML = ex.innerHTML.trim();
      if (tr) translationText = tr.textContent.trim();
    }

    const labelText = cfg.label
      || (card ? chip.textContent.replace(card.textContent, '').trim() : chip.textContent.trim())
      || phrase;

    /* 存起來供收藏時打包進事件 payload，讓 practice-tracker 的收藏清單
       不必回頭查 DOM 就能拿到例句與翻譯 */
    chip.__pcData = { exampleHTML, translationText };

    chip.textContent = '';
    chip.setAttribute('data-shape', cfg.shape);

    const sizeCfg = SIZE_MAP[cfg.size] || SIZE_MAP.md;
    const accentHex = BRAND[cfg.theme] || BRAND.ocean;
    chip.style.setProperty('--pc-accent', accentHex);
    chip.style.setProperty('--pc-font', sizeCfg.font);
    chip.style.setProperty('--pc-pad-y', sizeCfg.padY);
    chip.style.setProperty('--pc-pad-x', sizeCfg.padX);

    if (cfg.icon) {
      const icon = doc.createElement('pc-icon');
      icon.innerHTML = `<i class="bi bi-${cfg.icon}"></i>`;
      chip.appendChild(icon);
    }

    const label = doc.createElement('pc-label');
    label.textContent = labelText;
    chip.appendChild(label);

    const doneMark = doc.createElement('pc-icon');
    doneMark.className = 'pc-collected-mark';
    doneMark.innerHTML = `<i class="bi ${cfg.collectedIcon}"></i>`;
    chip.appendChild(doneMark);

    const panel = buildPanel(chip, cfg, exampleHTML, translationText);
    chip.__pcPanel = panel;
    chip.__pcCfg = cfg;

    if (collectedPhrases.has(phrase)) chip.classList.add('is-collected');

    chip.addEventListener('click', e => {
      e.stopPropagation();
      if (panel.classList.contains('is-visible')) {
        closePanel(panel);
      } else {
        openPanelFor(chip, panel, cfg);
      }
    });
  }

  function init() {
    doc.querySelectorAll('phrase-chip[data-phrase]').forEach(initChip);
    doc.querySelectorAll('phrase-upgrade').forEach(initUpgrade);
  }

  /* 對外 API：供其他元件（例如 practice-tracker）查詢，非必要、純輔助 */
  win.PhraseChip = {
    getCollected: () => Array.from(collectedPhrases),
    isCollected: phrase => collectedPhrases.has((phrase || '').trim()),
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
