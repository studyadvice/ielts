(function (global) {
  'use strict';
  var BRAND = {
    shell:    '#C6C7BD',
    lavender: '#C3A5E5',
    special:  '#B3DE73',
    warning:  '#E6374B',
    salmon:   '#E5C3B3',
    sky:      '#82C8E5',
    ocean:    '#1CCAE8',
    safe:     '#27AE60',
    teal:     '#0DA591',
    vanilla:  '#DBEDD8',
    yellow:   '#E3D322',
    focus:    '#D4FFFC',
    info:     '#2351DB',
    indigo:   '#7849C9',
    pink:     '#FF91D7',
    orange:   '#EDA109'
  };

  var BG     = '#0C0D0C';
  var BG_RGB = [12, 13, 12];

  function resolveColor(v) {
    if (!v) return null;
    v = String(v).trim();
    return BRAND[v] || (/^#|^rgb/.test(v) ? v : null);
  }

  function clr(v) {
    if (!v) return BRAND.shell;
    v = String(v).trim();
    return BRAND[v] || (/^#|^rgb/.test(v) ? v : BRAND.shell);
  }

  function hexRgba(hex, a) {
    a = Math.max(+a || 0, 0.78);
    var h = hex.replace('#', '');
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function hexToRgb(hex) {
    var h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function blendColor(hex, alpha) {
    var c = hexToRgb(hex);
    return 'rgb(' +
      Math.round(BG_RGB[0] + alpha * (c[0] - BG_RGB[0])) + ',' +
      Math.round(BG_RGB[1] + alpha * (c[1] - BG_RGB[1])) + ',' +
      Math.round(BG_RGB[2] + alpha * (c[2] - BG_RGB[2])) + ')';
  }

  function mk(tag, cls) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }

  function qsa(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  function rAF2(fn) {
    requestAnimationFrame(function () { requestAnimationFrame(fn); });
  }

  function onTransEnd(el, prop, fn) {
    var done = false;
    function h(e) {
      if (e.propertyName === prop && !done) {
        done = true;
        el.removeEventListener('transitionend', h);
        fn();
      }
    }
    el.addEventListener('transitionend', h);
    setTimeout(function () {
      if (!done) { done = true; el.removeEventListener('transitionend', h); fn(); }
    }, 600);
  }

  function clearAnim(el) {
    el.style.transition = el.style.maxHeight = el.style.overflow =
      el.style.opacity = '';
  }

  function animOpen(el, mode, dur) {
    clearAnim(el);
    if (mode === 'none') { el.style.display = ''; return; }
    el.style.display = '';
    if (mode === 'fade') {
      el.style.opacity    = '0';
      el.style.transition = 'opacity ' + dur + 'ms ease';
      rAF2(function () { el.style.opacity = '1'; });
      onTransEnd(el, 'opacity', function () {
        el.style.transition = el.style.opacity = '';
      });
    } else {
      var h = el.scrollHeight || 200;
      el.style.overflow   = 'hidden';
      el.style.maxHeight  = '0';
      el.style.opacity    = '0';
      el.style.transition = 'max-height ' + dur + 'ms ease, opacity ' +
        Math.round(dur * 0.7) + 'ms ease';
      rAF2(function () {
        el.style.maxHeight = h + 'px';
        el.style.opacity   = '1';
      });
      onTransEnd(el, 'max-height', function () {
        el.style.maxHeight = el.style.overflow =
          el.style.transition = el.style.opacity = '';
      });
    }
  }

  function animClose(el, mode, dur) {
    clearAnim(el);
    if (mode === 'none') { el.style.display = 'none'; return; }
    if (mode === 'fade') {
      el.style.transition = 'opacity ' + dur + 'ms ease';
      el.style.opacity    = '0';
      onTransEnd(el, 'opacity', function () {
        el.style.display    = 'none';
        el.style.transition = el.style.opacity = '';
      });
    } else {
      var h = el.scrollHeight || 1;
      el.style.overflow   = 'hidden';
      el.style.maxHeight  = h + 'px';
      el.style.transition = 'max-height ' + dur + 'ms ease, opacity ' +
        Math.round(dur * 0.7) + 'ms ease';
      rAF2(function () {
        el.style.maxHeight = '0';
        el.style.opacity   = '0';
      });
      onTransEnd(el, 'max-height', function () {
        el.style.display    = 'none';
        el.style.maxHeight  = el.style.overflow =
          el.style.transition = el.style.opacity = '';
      });
    }
  }

  var CSS_CLUSTER = [
    'ui-cluster,cluster-node,cluster-item{display:none}',

    '.uc-root{position:relative;display:inline-flex;flex-direction:column;align-items:center;' +
      'font-size:var(--uc-fs,1rem);line-height:1.4;font-family:inherit}',
    '.uc-stage{display:flex;flex-direction:column;align-items:center;width:100%}',
    '.uc-nodes{display:flex;flex-direction:row;align-items:flex-start;' +
      'gap:var(--uc-gap,24px);flex-wrap:wrap;justify-content:center}',

    '.uc-circle{' +
      'border-radius:50%;display:inline-flex;align-items:center;justify-content:center;' +
      'cursor:pointer;position:relative;flex-shrink:0;' +
      'transition:transform .18s ease,filter .18s ease,box-shadow .18s ease;' +
      'filter:brightness(.82);box-shadow:0 0 0 2px var(--uc-clr)}',
    '.uc-circle:hover{transform:scale(1.08);filter:brightness(1.02);' +
      'box-shadow:0 0 0 3px var(--uc-clr),0 4px 18px rgba(0,0,0,0.78)}',
    '.uc-circle.done{cursor:default;filter:brightness(.68);box-shadow:0 0 0 2px var(--uc-clr)}',
    '.uc-circle.done:hover{transform:none;filter:brightness(.68);' +
      'box-shadow:0 0 0 2px var(--uc-clr)}',

    '.uc-main-circle{width:var(--uc-sz,72px);height:var(--uc-sz,72px);' +
      'background:var(--uc-clr);color:' + BG + '}',
    '.uc-main-circle.burst{animation:uc-burst .32s ease-out forwards}',
    '@keyframes uc-burst{' +
      '0%{transform:scale(1);opacity:1}' +
      '60%{transform:scale(1.22);opacity:0.6}' +
      '100%{transform:scale(0);opacity:0}}',

    '.uc-node-wrap{display:flex;flex-direction:column;align-items:center}',
    '.uc-node-circle{' +
      'width:var(--uc-nsz,56px);height:var(--uc-nsz,56px);' +
      'background:var(--uc-nclr,var(--uc-clr));color:' + BG + ';' +
      'opacity:0;transform:scale(0) translateY(-8px)}',
    '.uc-node-circle.appear{animation:uc-appear .35s ease-out forwards}',
    '@keyframes uc-appear{' +
      '0%{opacity:0;transform:scale(0) translateY(-8px)}' +
      '70%{opacity:1;transform:scale(1.08) translateY(0)}' +
      '100%{opacity:1;transform:scale(1) translateY(0)}}',

    '.uc-num{font-size:calc(var(--uc-fs,1rem)*1.1);font-weight:700;line-height:1;letter-spacing:-0.02em}',
    '.uc-num-sm{font-size:calc(var(--uc-fs,1rem)*0.95);font-weight:700;line-height:1;letter-spacing:-0.02em}',

    '.uc-label{font-size:calc(var(--uc-fs,1rem)*0.78);color:var(--uc-clr);' +
      'font-weight:600;text-align:center;' +
      'max-width:var(--uc-lw,90px);word-break:break-word;opacity:0.9;' +
      'margin-top:var(--uc-lg,4px)}',
    '.uc-label-sm{font-size:calc(var(--uc-fs,1rem)*0.72);color:var(--uc-nclr,var(--uc-clr));' +
      'font-weight:600;text-align:center;' +
      'max-width:var(--uc-nlw,76px);word-break:break-word;opacity:0.88;' +
      'margin-top:var(--uc-nlg,6px)}',

    '.uc-content{width:100%;max-height:0;overflow:hidden;opacity:0;' +
      'transition:max-height .32s ease,opacity .28s ease;margin-top:0}',
    '.uc-content.open{max-height:1200px;opacity:1;margin-top:12px}',
    '.uc-content-inner{border:1px solid var(--uc-nclr,var(--uc-clr));border-radius:8px;overflow:hidden}',
    '.uc-item{padding:10px 14px;border-bottom:1px solid #1B1C1B;' +
      'color:#C6C7BD;font-size:var(--uc-fs,1rem);line-height:1.5}',
    '.uc-item:last-child{border-bottom:none}',
    '.uc-item:hover{background:#161716}',

    '.uc-reset{position:absolute;top:0;right:0;' +
      'background:#1F201E;border:1px solid #353633;' +
      'border-radius:5px;padding:3px 8px;' +
      'color:#8E8F88;cursor:pointer;' +
      'font-size:0.72rem;font-weight:600;letter-spacing:0.04em;' +
      'display:inline-flex;align-items:center;gap:5px;' +
      'transition:background .15s,color .15s,border-color .15s}',
    '.uc-reset:hover{background:#2D2E2C;color:#C6C7BD;border-color:#565753}',

    '.uc-connector{width:2px;height:16px;background:var(--uc-clr);' +
      'opacity:0;margin:0 auto;' +
      'transition:opacity .25s ease .2s,height .3s ease .2s}',
    '.uc-connector.show{opacity:0.78}',

    '.uc-node-connector{width:2px;height:0;background:var(--uc-nclr,var(--uc-clr));' +
      'opacity:0;margin:6px auto 0;' +
      'transition:height .28s ease,opacity .25s ease}',
    '.uc-node-connector.show{height:12px;opacity:0.78}'
  ].join('\n');

  var CSS_READING = [
    'text-morph,morph-from,morph-to{display:none}',
    'margin-pin,read-pulse,chalk-mark,col-pair{display:none}',
    'chunk-spot,chunk{display:none}',

    '.urm-morph{display:block}',
    '.urm-morph-body{transition:opacity var(--urm-md,.38s) ease,transform var(--urm-md,.38s) ease}',
    '.urm-morph-body.urm-mo{opacity:0;transform:translateY(6px)}',
    '.urm-morph-ctrl{display:flex;align-items:center;margin-top:10px;gap:8px}',
    '.urm-morph-badge{display:inline-flex;align-items:center;gap:6px;' +
      'padding:4px 14px;border-radius:20px;font-size:.8rem;' +
      'font-weight:700;border:1.5px solid;cursor:pointer;' +
      'user-select:none;background:transparent;' +
      'transition:filter .2s ease,transform .12s ease}',
    '.urm-morph-badge:hover{filter:brightness(1.25)}',
    '.urm-morph-badge:active{transform:scale(.93)}',
    '.urm-morph-dot{width:7px;height:7px;border-radius:50%;' +
      'background:currentColor;flex-shrink:0;transition:background .3s ease}',

    '.urm-pin{border-bottom:1.5px dashed;cursor:help;display:inline;transition:opacity .15s ease}',
    '.urm-pin:hover{opacity:.8}',
    '.urm-pannot{position:fixed;z-index:9100;' +
      'padding:8px 14px;border-radius:9px;' +
      'font-size:.82rem;line-height:1.48;font-weight:500;' +
      'pointer-events:none;opacity:0;transition:opacity .2s ease;' +
      'box-shadow:0 4px 16px rgba(0,0,0,0.78)}',
    '.urm-pannot.urm-pv{opacity:1}',
    '.urm-pline{position:fixed;z-index:9099;height:0;border-top:1px dashed;' +
      'pointer-events:none;opacity:0;transition:opacity .2s ease}',
    '.urm-pline.urm-pv{opacity:.5}',

    '.urm-pulse{position:relative;display:block;padding-left:var(--urm-pg,14px)}',
    '.urm-pbar{position:absolute;left:0;top:0;' +
      'width:var(--urm-pw,3px);height:0;' +
      'border-radius:3px;pointer-events:none;opacity:0;transition:opacity .3s ease}',
    '.urm-pbar.urm-pa{opacity:1;height:100%;' +
      'transition:height var(--urm-ps,2.8s) linear,opacity .3s ease}',
    '.urm-pbar.urm-pd{opacity:0;transition:opacity .9s ease .4s}',

    '.urm-chalk{display:inline-block;position:relative;' +
      'vertical-align:baseline;cursor:crosshair;transition:color .25s ease}',
    '.urm-chalk-svg{position:absolute;overflow:visible;pointer-events:none}',
    '.urm-chalk-path{fill:none;stroke-linecap:round}',

    '.urm-cp{display:inline;position:relative;cursor:default;transition:color .2s ease}',
    '.urm-cp-dot{position:absolute;top:-8px;left:50%;' +
      'transform:translateX(-50%) scale(1);' +
      'width:5px;height:5px;border-radius:50%;' +
      'background:var(--urm-cp-c,#E3D322);' +
      'opacity:.65;pointer-events:none;' +
      'transition:transform .22s ease,opacity .22s ease}',
    '.urm-cp.urm-cp-lit{color:var(--urm-cp-c)}',
    '.urm-cp.urm-cp-lit .urm-cp-dot{transform:translateX(-50%) scale(2.2);opacity:1}',

    '.urm-cs{display:block}',
    '.urm-cs-nav{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}',
    '.urm-cs-dot{display:inline-block;border-radius:50%;flex-shrink:0;' +
      'background:var(--urm-cs-c,#E3D322);cursor:pointer;opacity:.48;' +
      'outline:2px solid transparent;outline-offset:3px;' +
      'transition:transform .22s ease,opacity .22s ease,outline-color .22s ease}',
    '.urm-cs-dot:hover{opacity:.88;transform:scale(1.32)}',
    '.urm-cs-dot.urm-cs-active{opacity:1;transform:scale(1.55);outline-color:var(--urm-cs-c)}',
    '.urm-cs-text,.urm-cs-chunk{transition:opacity var(--urm-cs-dur,.3s) ease,color var(--urm-cs-dur,.3s) ease}',
    '.urm-cs-body.urm-cs-dimmed .urm-cs-text,' +
    '.urm-cs-body.urm-cs-dimmed .urm-cs-chunk:not(.urm-cs-lit){opacity:var(--urm-cs-dim,.22)}',
    '.urm-cs-body.urm-cs-dimmed .urm-cs-chunk.urm-cs-lit{opacity:1;color:var(--urm-cs-c)}',
    '[data-urm-cs-src]{display:none!important}',

    '.urm-cs-annot{position:fixed;z-index:9200;max-width:380px;min-width:120px;' +
      'padding:14px 18px;border-radius:11px;background:#141514;' +
      'border:1px solid #2D2E2C;' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.88);' +
      'font-size:.86rem;line-height:1.58;' +
      'pointer-events:none;opacity:0;transform:translateY(6px);' +
      'transition:opacity .2s ease,transform .2s ease}',
    '.urm-cs-annot.urm-cs-av{opacity:1;transform:translateY(0)}',
    '.urm-cs-annot p{margin-bottom:8px}',
    '.urm-cs-annot p:last-child{margin-bottom:0}',
    '.urm-cs-annot ul,.urm-cs-annot ol{padding-left:18px;margin-bottom:8px}',
    '.urm-cs-annot li{margin-bottom:3px}',
    '.urm-cs-annot strong,.urm-cs-annot b{color:#E3D322;font-weight:700}',
    '.urm-cs-annot em,.urm-cs-annot i{color:#82C8E5;font-style:italic}',
    '.urm-cs-annot code{font-family:monospace;font-size:.88em;' +
      'background:#222321;padding:1px 5px;border-radius:4px}',
    '.urm-cs-annot pre{font-family:monospace;font-size:.82em;' +
      'background:#1B1C1A;' +
      'padding:10px 12px;border-radius:7px;' +
      'overflow-x:auto;margin-bottom:8px;white-space:pre}',
    '.urm-cs-annot table{border-collapse:collapse;width:100%;margin-bottom:8px}',
    '.urm-cs-annot th,.urm-cs-annot td{padding:5px 10px;font-size:.83em;' +
      'border:1px solid #2D2E2C}',
    '.urm-cs-annot th{color:#E3D322;background:#191A18;font-weight:700}',
    '.urm-cs-annot hr{border:none;border-top:1px solid #2A2B28;margin:8px 0}'
  ].join('\n');

  var CSS_BTN = [
    'ui-btn{display:none}',

    '.ubtn-wrap{display:inline-block;vertical-align:middle}',

    '.ubtn{display:inline-flex;align-items:center;justify-content:center;' +
      'border:none;cursor:pointer;font-family:inherit;font-weight:600;' +
      'line-height:1;white-space:nowrap;user-select:none;outline:none;' +
      'box-sizing:border-box;position:relative;' +
      'transition:filter .2s ease,transform .12s ease,background .2s ease}',
    '.ubtn:not([disabled]):hover{filter:brightness(1.1)}',
    '.ubtn:not([disabled]):active{transform:scale(0.93)}',
    '.ubtn[disabled]{opacity:.48;cursor:not-allowed;pointer-events:none}',

    '.ubtn-fill{color:' + BG + ';background:var(--ubtn-c)}',
    '.ubtn-fill.is-open{filter:brightness(0.88)}',
    '.ubtn-fill.is-open:hover{filter:brightness(0.92)}',

    '.ubtn-outline{background:transparent;color:var(--ubtn-c);border:1.5px solid var(--ubtn-c)}',
    '.ubtn-outline:hover{background:var(--ubtn-ch);filter:none}',
    '.ubtn-outline.is-open{background:var(--ubtn-ch)}',

    '.ubtn-ghost{background:transparent;color:var(--ubtn-c)}',
    '.ubtn-ghost:hover{background:var(--ubtn-ch);filter:none}',
    '.ubtn-ghost.is-open{background:var(--ubtn-ch)}',

    '.ubtn-chev{display:inline-flex;align-items:center;flex-shrink:0;margin-left:2px;' +
      'transition:transform .28s ease}',
    '.ubtn.is-open .ubtn-chev{transform:rotate(180deg)}',

    '.ubtn-ico{display:inline-flex;align-items:center;flex-shrink:0;line-height:1}',
    '.ubtn-lbl{flex-shrink:0}',

    '.ubtn-dot{position:absolute;bottom:3px;right:3px;width:5px;height:5px;' +
      'border-radius:50%;opacity:0;transition:opacity .2s ease}',
    '.ubtn-fill .ubtn-dot{background:' + BG + '}',
    '.ubtn-outline .ubtn-dot,.ubtn-ghost .ubtn-dot{background:var(--ubtn-c)}',
    '.ubtn.is-open .ubtn-dot{opacity:1}',

    '.ubtn-gate-target{transition:opacity .4s ease}',
    '.ubtn-gate-locked{opacity:.5;pointer-events:none;user-select:none}',
    '@keyframes ubtn-gpulse{0%,100%{box-shadow:0 0 0 0 var(--ubtn-c,' +
      '#C6C7BD)}60%{box-shadow:0 0 0 11px #0C0D0C}}',
    '.ubtn-gate-cue{animation:ubtn-gpulse 2.2s ease-in-out infinite}',

    '.ubtn-astack{position:fixed;left:50%;transform:translateX(-50%);z-index:9999;' +
      'display:flex;flex-direction:column;align-items:center;gap:8px;' +
      'pointer-events:none;max-width:calc(100vw - 32px)}',
    '.ubtn-astack-top{top:16px}',
    '.ubtn-astack-bottom{bottom:16px;flex-direction:column-reverse}',

    '.ubtn-alert{display:flex;align-items:center;gap:8px;' +
      'padding:10px 14px 10px 18px;border-radius:24px;' +
      'font-weight:600;font-size:1rem;line-height:1.4;' +
      'pointer-events:all;white-space:nowrap;max-width:88vw;' +
      'opacity:0;transition:opacity .25s ease,transform .25s ease}',
    '.ubtn-astack-top .ubtn-alert{transform:translateY(-14px)}',
    '.ubtn-astack-bottom .ubtn-alert{transform:translateY(14px)}',
    '.ubtn-alert.ubtn-alert-in{opacity:1;transform:translateY(0)}',

    '.ubtn-alert-x{background:none;border:none;cursor:pointer;' +
      'font-size:1.15rem;line-height:1;padding:0;margin-left:6px;' +
      'opacity:.65;font-weight:700;flex-shrink:0;transition:opacity .15s ease}',
    '.ubtn-alert-x:hover{opacity:1}'
  ].join('\n');

  (function () {
    if (document.getElementById('ui-components-css')) return;
    var s = document.createElement('style');
    s.id = 'ui-components-css';
    s.textContent = CSS_CLUSTER + '\n' + CSS_READING + '\n' + CSS_BTN;
    (document.head || document.documentElement).appendChild(s);
  })();

  var UC_CFG = global.UiClusterConfig = Object.assign({
    theme:          'shell',
    size:           '72px',
    nodeSize:       '56px',
    gap:            '24px',
    fontSize:       '1rem',
    labelGap:       '4px',
    labelWidth:     '90px',
    nodeLabelGap:   '6px',
    nodeLabelWidth: '76px'
  }, global.UiClusterConfig || {});

  var ICO_RESET = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"' +
    ' stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>' +
    '<path d="M3 3v5h5"/></svg>';

  function UiCluster(el) {
    this.el             = el;
    this.color          = resolveColor(el.getAttribute('theme') || el.getAttribute('color') || UC_CFG.theme) || BRAND.shell;
    this.size           = el.getAttribute('size')             || UC_CFG.size;
    this.nodeSize       = el.getAttribute('node-size')        || UC_CFG.nodeSize;
    this.gap            = el.getAttribute('gap')              || UC_CFG.gap;
    this.fs             = el.getAttribute('font-size')        || UC_CFG.fontSize;
    this.label          = el.getAttribute('label')            || '';
    this.labelGap       = el.getAttribute('label-gap')        || UC_CFG.labelGap;
    this.labelWidth     = el.getAttribute('label-width')      || UC_CFG.labelWidth;
    this.nodeLabelGap   = el.getAttribute('node-label-gap')   || UC_CFG.nodeLabelGap;
    this.nodeLabelWidth = el.getAttribute('node-label-width') || UC_CFG.nodeLabelWidth;
    this.hasReset       = el.hasAttribute('reset');
    this.root           = null;
  }

  UiCluster.prototype.init = function () { this._render(); };

  UiCluster.prototype.render = UiCluster.prototype._render = function () {
    var nodeEls = qsa(':scope > cluster-node', this.el);
    var itemEls = qsa(':scope > cluster-item', this.el);
    if (!nodeEls.length && !itemEls.length) return;
    if (!nodeEls.length && itemEls.length) { this._renderSingle(itemEls); return; }
    this._renderDouble(nodeEls);
  };

  UiCluster.prototype._renderSingle = function (itemEls) {
    var self = this;
    var root = mk('div', 'uc-root');
    root.style.cssText = [
      '--uc-clr:' + this.color,
      '--uc-sz:'  + this.size,
      '--uc-fs:'  + this.fs,
      '--uc-lg:'  + this.labelGap,
      '--uc-lw:'  + this.labelWidth
    ].join(';');
    this.root = root;

    if (this.hasReset) {
      var resetBtn = mk('button', 'uc-reset');
      resetBtn.innerHTML = ICO_RESET + '重設';
      resetBtn.addEventListener('click', function () { self._reset(); });
      root.appendChild(resetBtn);
    }

    var mainCircle = mk('div', 'uc-circle uc-main-circle');
    mainCircle.style.background = this.color;
    var mainNum = mk('span', 'uc-num');
    mainNum.textContent = itemEls.length;
    mainCircle.appendChild(mainNum);
    root.appendChild(mainCircle);

    if (this.label) {
      var mainLabel = mk('div', 'uc-label');
      mainLabel.textContent = this.label;
      root.appendChild(mainLabel);
    }

    var connector = mk('div', 'uc-connector');
    root.appendChild(connector);

    var content = mk('div', 'uc-content');
    var inner   = mk('div', 'uc-content-inner');
    inner.style.borderColor = hexRgba(this.color, 0.78);
    itemEls.forEach(function (itemEl) {
      var row = mk('div', 'uc-item');
      row.innerHTML = itemEl.innerHTML;
      inner.appendChild(row);
    });
    content.appendChild(inner);
    root.appendChild(content);

    mainCircle.addEventListener('click', function () {
      if (mainCircle.classList.contains('burst')) return;
      mainCircle.classList.add('burst');
      if (self.label) {
        var lbl = root.querySelector('.uc-label');
        if (lbl) { lbl.style.transition = 'opacity .2s'; lbl.style.opacity = '0'; }
      }
      setTimeout(function () {
        mainCircle.style.display = 'none';
        connector.classList.add('show');
        content.classList.add('open');
      }, 280);
    });

    this.el.before(root);
    this.el.style.display = 'none';
  };

  UiCluster.prototype._renderDouble = function (nodeEls) {
    var self = this;
    var root = mk('div', 'uc-root');
    root.style.cssText = [
      '--uc-clr:' + this.color,
      '--uc-sz:'  + this.size,
      '--uc-nsz:' + this.nodeSize,
      '--uc-gap:' + this.gap,
      '--uc-fs:'  + this.fs,
      '--uc-lg:'  + this.labelGap,
      '--uc-lw:'  + this.labelWidth
    ].join(';');
    this.root = root;

    if (this.hasReset) {
      var resetBtn = mk('button', 'uc-reset');
      resetBtn.innerHTML = ICO_RESET + '重設';
      resetBtn.addEventListener('click', function () { self._reset(); });
      root.appendChild(resetBtn);
    }

    var mainCircle = mk('div', 'uc-circle uc-main-circle');
    var mainNum    = mk('span', 'uc-num');
    mainNum.textContent = nodeEls.length;
    mainCircle.appendChild(mainNum);
    mainCircle.style.background = this.color;
    root.appendChild(mainCircle);

    if (this.label) {
      var mainLabel = mk('div', 'uc-label');
      mainLabel.textContent = this.label;
      root.appendChild(mainLabel);
    }

    var connector = mk('div', 'uc-connector');
    root.appendChild(connector);

    var stage    = mk('div', 'uc-stage');
    stage.style.display = 'none';
    var nodesRow = mk('div', 'uc-nodes');
    stage.appendChild(nodesRow);
    root.appendChild(stage);

    mainCircle.addEventListener('click', function () {
      if (mainCircle.classList.contains('burst')) return;
      mainCircle.classList.add('burst');
      if (self.label) {
        var lbl = root.querySelector('.uc-label');
        if (lbl) { lbl.style.transition = 'opacity .2s'; lbl.style.opacity = '0'; }
      }
      setTimeout(function () {
        mainCircle.style.display = 'none';
        stage.style.display = 'flex';
        connector.classList.add('show');
        nodesRow.querySelectorAll('.uc-node-circle').forEach(function (nc, i) {
          setTimeout(function () { nc.classList.add('appear'); }, i * 80);
        });
      }, 280);
    });

    nodeEls.forEach(function (nodeEl) {
      var nodeColor = resolveColor(
        nodeEl.getAttribute('theme') || nodeEl.getAttribute('color')
      ) || self.color;
      var nodeLabel = nodeEl.getAttribute('label') || '';
      var items     = qsa(':scope > cluster-item', nodeEl);

      var wrap = mk('div', 'uc-node-wrap');
      wrap.style.setProperty('--uc-nclr', nodeColor);

      var nLabelGap   = nodeEl.getAttribute('label-gap')  || self.nodeLabelGap;
      var nLabelWidth = nodeEl.getAttribute('label-width') || self.nodeLabelWidth;
      wrap.style.setProperty('--uc-nlg', nLabelGap);
      wrap.style.setProperty('--uc-nlw', nLabelWidth);

      var circle = mk('div', 'uc-circle uc-node-circle');
      circle.style.background = nodeColor;
      var num = mk('span', 'uc-num-sm');
      num.textContent = items.length;
      circle.appendChild(num);
      wrap.appendChild(circle);

      if (nodeLabel) {
        var nlabel = mk('div', 'uc-label-sm');
        nlabel.textContent = nodeLabel;
        wrap.appendChild(nlabel);
      }

      var nodeConn = mk('div', 'uc-node-connector');
      wrap.appendChild(nodeConn);

      var content = mk('div', 'uc-content');
      var inner   = mk('div', 'uc-content-inner');
      inner.style.borderColor = hexRgba(nodeColor, 0.78);
      items.forEach(function (itemEl) {
        var row = mk('div', 'uc-item');
        row.innerHTML = itemEl.innerHTML;
        inner.appendChild(row);
      });
      content.appendChild(inner);
      wrap.appendChild(content);
      nodesRow.appendChild(wrap);

      circle.addEventListener('click', function () {
        if (circle.classList.contains('done')) return;
        if (!circle.classList.contains('appear')) return;
        circle.classList.add('done');
        nodeConn.classList.add('show');
        content.classList.add('open');
      });
    });

    this.el.before(root);
    this.el.style.display = 'none';
  };

  UiCluster.prototype._reset = function () {
    if (this.root) { this.root.remove(); this.root = null; }
    this.el.style.display = '';
    this._render();
  };

  function bootCluster() {
    document.querySelectorAll('ui-cluster').forEach(function (el) {
      if (!el._uc) { el._uc = true; new UiCluster(el).init(); }
    });
  }

  var UR_CFG = global.UiReadingConfig = Object.assign({
    morphTheme:      'sky',
    morphDuration:   380,
    morphLabelFrom:  '← 還原',
    morphLabelTo:    '看升級版 →',
    pinTheme:        'yellow',
    pinMargin:       20,
    pinWidth:        210,
    pulseColor:      'teal',
    pulseSpeed:      2800,
    pulseWidth:      '3px',
    pulseGap:        14,
    pulseTrigger:    'visible',
    chalkTheme:      'focus',
    chalkThickness:  2.5,
    chalkDuration:   420,
    chunkDotSize:    11,
    chunkDim:        0.22,
    chunkTransition: 300,
    chunkTheme:      ''
  }, global.UiReadingConfig || {});

  function initMorph(el) {
    if (el.dataset.urm) return;
    el.dataset.urm = '1';

    var fromEl = el.querySelector('morph-from');
    var toEl   = el.querySelector('morph-to');
    if (!fromEl || !toEl) {
      console.warn('[ui-reading] <text-morph> 缺少 <morph-from> 或 <morph-to>，已略過。');
      return;
    }

    var fromHTML = fromEl.innerHTML;
    var toHTML   = toEl.innerHTML;
    var theme    = el.getAttribute('theme')      || UR_CFG.morphTheme;
    var dur      = +(el.getAttribute('duration') || UR_CFG.morphDuration);
    var lblFrom  = el.getAttribute('label-from') || UR_CFG.morphLabelFrom;
    var lblTo    = el.getAttribute('label-to')   || UR_CFG.morphLabelTo;
    var c        = clr(theme);
    var cSafe    = clr('safe');
    var shown    = false;

    var wrap = document.createElement('div');
    wrap.className = 'urm-morph';
    wrap.style.setProperty('--urm-md', dur + 'ms');

    var body = document.createElement('div');
    body.className = 'urm-morph-body';
    body.innerHTML = fromHTML;

    var ctrl  = document.createElement('div');
    ctrl.className = 'urm-morph-ctrl';
    var badge = document.createElement('span');
    badge.className = 'urm-morph-badge';
    var dot = document.createElement('span');
    dot.className = 'urm-morph-dot';
    var lbl = document.createElement('span');
    badge.appendChild(dot);
    badge.appendChild(lbl);
    ctrl.appendChild(badge);
    wrap.appendChild(body);
    wrap.appendChild(ctrl);
    el.replaceWith(wrap);

    function syncBadge() {
      var c2 = shown ? cSafe : c;
      badge.style.color       = c2;
      badge.style.borderColor = c2;
      dot.style.background    = c2;
      lbl.textContent = shown ? lblFrom : lblTo;
    }
    syncBadge();

    function reinitNested() {
      body.querySelectorAll('chalk-mark:not([data-urm])').forEach(initChalk);
      body.querySelectorAll('margin-pin:not([data-urm])').forEach(initPin);
      body.querySelectorAll('read-pulse:not([data-urm])').forEach(initPulse);
    }

    var busy = false;
    badge.addEventListener('click', function () {
      if (busy) return;
      busy = true;
      body.classList.add('urm-mo');
      setTimeout(function () {
        shown = !shown;
        body.innerHTML = shown ? toHTML : fromHTML;
        reinitNested();
        syncBadge();
        body.classList.remove('urm-mo');
        setTimeout(function () { busy = false; }, dur + 50);
      }, dur);
    });
  }

  var _pa = null, _pl = null, _pt = null;

  function ensurePinDom() {
    if (_pa) return;
    _pa = document.createElement('div');
    _pa.className = 'urm-pannot';
    _pl = document.createElement('div');
    _pl.className = 'urm-pline';
    document.body.appendChild(_pa);
    document.body.appendChild(_pl);
  }

  function initPin(el) {
    if (el.dataset.urm) return;
    el.dataset.urm = '1';

    var note     = el.getAttribute('note') || '';
    var themeRaw = el.getAttribute('theme') || UR_CFG.pinTheme;
    var isOutline = themeRaw.slice(-8) === '-outline';
    var themeName = isOutline ? themeRaw.slice(0, -8) : themeRaw;
    var c = clr(themeName);

    var mark = document.createElement('span');
    mark.className = 'urm-pin';
    mark.style.borderBottomColor = c;
    mark.style.color = c;
    mark.innerHTML = el.innerHTML;
    el.replaceWith(mark);
    ensurePinDom();

    mark.addEventListener('mouseenter', function () {
      clearTimeout(_pt);
      var mr = mark.getBoundingClientRect();
      if (isOutline) {
        _pa.style.background = BG;
        _pa.style.color      = c;
        _pa.style.border     = '1.5px solid ' + c;
        _pa.style.boxShadow  = '0 4px 16px rgba(0,0,0,0.78)';
      } else {
        _pa.style.background = c;
        _pa.style.color      = BG;
        _pa.style.border     = 'none';
        _pa.style.boxShadow  = '0 4px 16px rgba(0,0,0,0.78)';
      }
      _pa.style.right    = UR_CFG.pinMargin + 'px';
      _pa.style.left     = '';
      _pa.style.maxWidth = UR_CFG.pinWidth + 'px';
      _pa.style.top      = Math.max(8, mr.top + mr.height / 2 - 20) + 'px';
      _pa.innerHTML      = note;
      _pa.classList.add('urm-pv');
      requestAnimationFrame(function () {
        var ar  = _pa.getBoundingClientRect();
        var ly  = mr.top + mr.height / 2;
        var lx1 = mr.right + 5;
        var lx2 = ar.left  - 5;
        _pl.style.top         = ly + 'px';
        _pl.style.left        = lx1 + 'px';
        _pl.style.width       = Math.max(0, lx2 - lx1) + 'px';
        _pl.style.borderColor = c;
        if (lx2 > lx1) _pl.classList.add('urm-pv');
      });
    });

    mark.addEventListener('mouseleave', function () {
      _pt = setTimeout(function () {
        _pa.classList.remove('urm-pv');
        _pl.classList.remove('urm-pv');
      }, 90);
    });
  }

  function initPulse(el) {
    if (el.dataset.urm) return;
    el.dataset.urm = '1';

    var c       = clr(el.getAttribute('color')      || UR_CFG.pulseColor);
    var speed   = +(el.getAttribute('speed')         || UR_CFG.pulseSpeed);
    var pw      = el.getAttribute('pulse-width')     || UR_CFG.pulseWidth;
    var gap     = +(el.getAttribute('gap')           || UR_CFG.pulseGap);
    var trigger = el.getAttribute('trigger')         || UR_CFG.pulseTrigger;
    var repeat  = el.hasAttribute('repeat');

    var wrap = document.createElement('div');
    wrap.className = 'urm-pulse';
    wrap.style.setProperty('--urm-ps', speed + 'ms');
    wrap.style.setProperty('--urm-pw', pw);
    wrap.style.setProperty('--urm-pg', gap + 'px');

    var bar = document.createElement('div');
    bar.className = 'urm-pbar';
    bar.style.background = c;
    wrap.appendChild(bar);
    Array.from(el.childNodes).forEach(function (n) { wrap.appendChild(n); });
    el.replaceWith(wrap);

    var played = false, running = false;

    function pulse() {
      if (running) return;
      if (played && !repeat) return;
      played = running = true;
      bar.classList.remove('urm-pa', 'urm-pd');
      void bar.offsetHeight;
      bar.classList.add('urm-pa');
      setTimeout(function () {
        bar.classList.add('urm-pd');
        setTimeout(function () {
          bar.classList.remove('urm-pa', 'urm-pd');
          running = false;
        }, 1400);
      }, speed + 300);
    }

    if (trigger === 'visible') {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          setTimeout(pulse, 180);
          if (!repeat) io.disconnect();
        });
      }, { threshold: 0.25 });
      io.observe(wrap);
    } else if (trigger === 'click') {
      wrap.style.cursor = 'pointer';
      wrap.addEventListener('click', pulse);
    } else if (trigger === 'hover') {
      wrap.addEventListener('mouseenter', pulse);
    }
  }

  function initChalk(el) {
    if (el.dataset.urm) return;
    el.dataset.urm = '1';

    var c         = clr(el.getAttribute('theme')     || UR_CFG.chalkTheme);
    var thick     = +(el.getAttribute('thickness')   || UR_CFG.chalkThickness);
    var dur       = +(el.getAttribute('duration')    || UR_CFG.chalkDuration);
    var preActive = el.hasAttribute('active');

    var wrap = document.createElement('span');
    wrap.className = 'urm-chalk';
    wrap.innerHTML = el.innerHTML;
    el.replaceWith(wrap);

    var svgEl = null, chalkPath = null, isActive = false;
    var _animId = null;

    function animateDash(path, fromOffset, toOffset, onDone) {
      if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var t    = Math.min((ts - start) / dur, 1);
        var ease = 1 - Math.pow(1 - t, 3);
        var val  = fromOffset + (toOffset - fromOffset) * ease;
        if (path.isConnected) path.setAttribute('stroke-dashoffset', val);
        if (t < 1 && path.isConnected) {
          _animId = requestAnimationFrame(step);
        } else {
          _animId = null;
          if (onDone) onDone();
        }
      }
      _animId = requestAnimationFrame(step);
    }

    function buildArc() {
      if (svgEl) { svgEl.remove(); svgEl = null; chalkPath = null; }
      if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
      var rect = wrap.getBoundingClientRect();
      var w    = rect.width;
      var h    = rect.height;
      var lift = Math.round(h * 0.6);
      var pad  = 3;
      var svgW = w + pad * 2;
      var svgH = lift + 6;

      svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('class', 'urm-chalk-svg');
      svgEl.style.cssText =
        'position:absolute;overflow:visible;pointer-events:none;' +
        'left:' + (-pad) + 'px;top:' + (-svgH) + 'px;' +
        'width:' + svgW + 'px;height:' + svgH + 'px';

      var x1 = pad, y1 = svgH - 2, cx = svgW / 2, cy = 3, x2 = svgW - pad, y2 = svgH - 2;
      var d = 'M ' + x1 + ' ' + y1 + ' Q ' + cx + ' ' + cy + ' ' + x2 + ' ' + y2;

      chalkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      chalkPath.setAttribute('fill',           'none');
      chalkPath.setAttribute('stroke',         c);
      chalkPath.setAttribute('stroke-width',   thick);
      chalkPath.setAttribute('stroke-linecap', 'round');
      chalkPath.setAttribute('d',              d);
      svgEl.appendChild(chalkPath);
      wrap.appendChild(svgEl);

      var len = chalkPath.getTotalLength();
      chalkPath.setAttribute('stroke-dasharray',  len);
      chalkPath.setAttribute('stroke-dashoffset', len);
      return len;
    }

    function activate() {
      isActive = true;
      wrap.style.color = c;
      var len = buildArc();
      if (len < 1) return;
      animateDash(chalkPath, len, 0, null);
    }

    function deactivate() {
      isActive = false;
      wrap.style.color = '';
      if (!chalkPath) return;
      var len     = parseFloat(chalkPath.getAttribute('stroke-dasharray'))  || 0;
      var current = parseFloat(chalkPath.getAttribute('stroke-dashoffset')) || 0;
      var _path = chalkPath, _svg = svgEl;
      svgEl = null; chalkPath = null;
      animateDash(_path, current, len, function () {
        if (_svg && _svg.parentNode) _svg.remove();
      });
    }

    wrap.addEventListener('click', function () {
      if (isActive) {
        var arcLen = chalkPath ? parseFloat(chalkPath.getAttribute('stroke-dasharray')) || 0 : 0;
        if (arcLen < 1) {
          if (svgEl) { svgEl.remove(); svgEl = null; chalkPath = null; }
          isActive = false;
          activate();
          return;
        }
        deactivate();
      } else {
        activate();
      }
    });

    if (preActive) {
      setTimeout(function () {
        var r = wrap.getBoundingClientRect();
        if (r.width > 0) {
          activate();
        } else {
          var io = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) { io.disconnect(); activate(); }
          }, { threshold: 0.01 });
          io.observe(wrap);
        }
      }, 80);
    }
  }

  var _cpPalette = [
    BRAND.yellow, BRAND.sky,    BRAND.lavender, BRAND.ocean,
    BRAND.salmon, BRAND.teal,   BRAND.focus,    BRAND.info,
    BRAND.pink,   BRAND.orange, BRAND.indigo,   BRAND.vanilla
  ];
  var _cpPaletteIdx = 0;
  var _cpGroups = {};

  function initColPairs() {
    var els = Array.from(document.querySelectorAll('col-pair:not([data-urm])'));
    if (!els.length) return;

    els.forEach(function (el) {
      var gid   = el.getAttribute('group') || '_nogroup';
      var theme = el.getAttribute('theme');
      var label = el.getAttribute('label') || '';
      if (!_cpGroups[gid]) {
        var c = theme ? clr(theme) : _cpPalette[_cpPaletteIdx++ % _cpPalette.length];
        _cpGroups[gid] = { color: c, members: [], label: label, _hasTheme: !!theme };
      }
      if (theme && !_cpGroups[gid]._hasTheme) {
        _cpGroups[gid].color = clr(theme);
        _cpGroups[gid]._hasTheme = true;
      }
      if (label && !_cpGroups[gid].label) _cpGroups[gid].label = label;
    });

    var registry = [];
    els.forEach(function (el) {
      el.dataset.urm = '1';
      var gid = el.getAttribute('group') || '_nogroup';
      var grp = _cpGroups[gid];
      var c   = grp.color;

      var wrap = document.createElement('span');
      wrap.className   = 'urm-cp';
      wrap.dataset.cpg = gid;
      wrap.style.setProperty('--urm-cp-c', c);
      if (grp.label) wrap.title = grp.label;
      wrap.innerHTML = el.innerHTML;

      var dot = document.createElement('span');
      dot.className = 'urm-cp-dot';
      wrap.insertBefore(dot, wrap.firstChild);

      el.replaceWith(wrap);
      grp.members.push(wrap);
      registry.push({ wrap: wrap, gid: gid });
    });

    registry.forEach(function (item) {
      var grp = _cpGroups[item.gid];
      item.wrap.addEventListener('mouseenter', function () {
        grp.members.forEach(function (m) { m.classList.add('urm-cp-lit'); });
      });
      item.wrap.addEventListener('mouseleave', function () {
        grp.members.forEach(function (m) { m.classList.remove('urm-cp-lit'); });
      });
    });
  }

  var _csAnnotEl = null, _csAnnotTm = null;

  function ensureCsAnnot() {
    if (_csAnnotEl) return;
    _csAnnotEl = document.createElement('div');
    _csAnnotEl.className = 'urm-cs-annot';
    document.body.appendChild(_csAnnotEl);
  }

  var _csPalette = [
    BRAND.sky,    BRAND.yellow, BRAND.lavender, BRAND.salmon,
    BRAND.teal,   BRAND.focus,  BRAND.pink,     BRAND.ocean,
    BRAND.info,   BRAND.indigo, BRAND.orange,   BRAND.vanilla
  ];

  function initChunkSpot(el) {
    if (el.dataset.urm) return;
    el.dataset.urm = '1';

    var dotSize = +(el.getAttribute('dot-size') || UR_CFG.chunkDotSize);
    var dimVal  =  +(el.getAttribute('dim')     || UR_CFG.chunkDim);
    var dur     = +(el.getAttribute('duration') || UR_CFG.chunkTransition);

    var segments = [], chunkMetas = [], palIdx = 0;
    Array.from(el.childNodes).forEach(function (node) {
      if (node.nodeType === 1 && node.tagName.toLowerCase() === 'chunk') {
        var rawTheme = node.getAttribute('theme') || UR_CFG.chunkTheme;
        var color    = rawTheme ? clr(rawTheme) : _csPalette[palIdx++ % _csPalette.length];
        segments.push({ type: 'chunk', idx: chunkMetas.length });
        chunkMetas.push({ html: node.innerHTML, color: color, label: node.getAttribute('label') || '' });
      } else if (node.nodeType === 3) {
        if (node.textContent !== '') segments.push({ type: 'text', text: node.textContent });
      } else if (node.nodeType === 1) {
        segments.push({ type: 'elem', outer: node.outerHTML });
      }
    });

    if (!chunkMetas.length) {
      console.warn('[ui-reading] <chunk-spot> 內找不到 <chunk>，已略過。');
      return;
    }

    var wrap = document.createElement('div');
    wrap.className = 'urm-cs';
    wrap.style.setProperty('--urm-cs-dim', dimVal);
    wrap.style.setProperty('--urm-cs-dur', dur + 'ms');

    var nav  = document.createElement('div');
    nav.className = 'urm-cs-nav';
    var dots = [];

    chunkMetas.forEach(function (meta) {
      var dot = document.createElement('span');
      dot.className = 'urm-cs-dot';
      dot.style.setProperty('--urm-cs-c', meta.color);
      dot.style.width  = dotSize + 'px';
      dot.style.height = dotSize + 'px';

      if (meta.label) {
        if (meta.label.charAt(0) === '#') {
          var targetId = meta.label.slice(1);
          var srcEl    = document.getElementById(targetId);
          if (srcEl) srcEl.dataset.urmCsSrc = '1';

          dot.addEventListener('mouseenter', function () {
            var tEl = document.getElementById(targetId);
            if (!tEl) return;
            ensureCsAnnot();
            clearTimeout(_csAnnotTm);
            _csAnnotEl.innerHTML = tEl.innerHTML;
            var r    = dot.getBoundingClientRect();
            var left = Math.min(r.left, window.innerWidth - 396);
            var top  = r.bottom + 9;
            _csAnnotEl.style.visibility = 'hidden';
            _csAnnotEl.style.top  = top + 'px';
            _csAnnotEl.style.left = Math.max(8, left) + 'px';
            _csAnnotEl.classList.add('urm-cs-av');
            requestAnimationFrame(function () {
              var ar = _csAnnotEl.getBoundingClientRect();
              if (ar.bottom > window.innerHeight - 8) {
                _csAnnotEl.style.top = Math.max(8, r.top - ar.height - 9) + 'px';
              }
              _csAnnotEl.style.visibility = '';
            });
          });

          dot.addEventListener('mouseleave', function () {
            _csAnnotTm = setTimeout(function () {
              if (_csAnnotEl) _csAnnotEl.classList.remove('urm-cs-av');
            }, 120);
          });
        } else {
          dot.title = meta.label;
        }
      }
      dots.push(dot);
      nav.appendChild(dot);
    });

    var body = document.createElement('div');
    body.className = 'urm-cs-body';
    var chunkSpans = [];

    segments.forEach(function (seg) {
      var s = document.createElement('span');
      if (seg.type === 'chunk') {
        var meta = chunkMetas[seg.idx];
        s.className = 'urm-cs-chunk';
        s.style.setProperty('--urm-cs-c', meta.color);
        s.dataset.idx = seg.idx;
        s.innerHTML   = meta.html;
        chunkSpans.push(s);
      } else if (seg.type === 'text') {
        s.className   = 'urm-cs-text';
        s.textContent = seg.text;
      } else {
        s.className = 'urm-cs-text';
        s.innerHTML = seg.outer;
      }
      body.appendChild(s);
    });

    wrap.appendChild(nav);
    wrap.appendChild(body);
    el.replaceWith(wrap);

    var activeIdx = -1;
    function activate(idx) {
      if (activeIdx === idx) {
        activeIdx = -1;
        body.classList.remove('urm-cs-dimmed');
        dots.forEach(function (d) { d.classList.remove('urm-cs-active'); });
        chunkSpans.forEach(function (s) { s.classList.remove('urm-cs-lit'); });
      } else {
        activeIdx = idx;
        body.classList.add('urm-cs-dimmed');
        dots.forEach(function (d, i) { d.classList.toggle('urm-cs-active', i === idx); });
        chunkSpans.forEach(function (s, i) { s.classList.toggle('urm-cs-lit', i === idx); });
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { activate(i); });
    });
  }

  function bootReading() {
    document.querySelectorAll('text-morph:not([data-urm])').forEach(initMorph);
    document.querySelectorAll('margin-pin:not([data-urm])').forEach(initPin);
    document.querySelectorAll('read-pulse:not([data-urm])').forEach(initPulse);
    document.querySelectorAll('chalk-mark:not([data-urm])').forEach(initChalk);
    document.querySelectorAll('chunk-spot:not([data-urm])').forEach(initChunkSpot);
    initColPairs();
  }

  var UB_CFG = global.UiBtnConfig = Object.assign({
    theme:        'shell',
    size:         'md',
    variant:      'fill',
    animation:    'slide',
    animDuration: 320,
    chevron:      false
  }, global.UiBtnConfig || {});

  var SIZES = {
    sm: { fs: '0.85rem', pad: '5px 12px',  r: '20px', dim: '32px', gap: '5px', icoFs: '1rem'    },
    md: { fs: '1rem',    pad: '8px 16px',  r: '24px', dim: '40px', gap: '6px', icoFs: '1.15rem' },
    lg: { fs: '1.1rem',  pad: '10px 20px', r: '28px', dim: '48px', gap: '8px', icoFs: '1.3rem'  }
  };

  function parseUnlockChunk(val) {
    if (!val) return [];
    return val.split(',').reduce(function (acc, seg) {
      seg = seg.trim();
      var parts = seg.split(':');
      if (parts.length !== 2) {
        console.warn('[ui-btn] unlock-chunk 格式錯誤（應為 "demoId:chunkId"）：', seg);
        return acc;
      }
      var demoId  = parts[0].trim();
      var chunkId = parseInt(parts[1].trim(), 10);
      if (!demoId || isNaN(chunkId)) {
        console.warn('[ui-btn] unlock-chunk 解析失敗：', seg);
        return acc;
      }
      acc.push({ demoId: demoId, chunkId: chunkId });
      return acc;
    }, []);
  }

  function mkIco(name) {
    if (!name) return '';
    if (/^bi-/.test(name)) {
      return '<span class="ubtn-ico"><i class="bi ' + name + '" aria-hidden="true"></i></span>';
    }
    return '';
  }

  var CHEV_SVG = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none"' +
    ' stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M6 9 12 15 18 9"/></svg>';

  var _groups        = {};
  var _gateInstances = [];
  var _gateInited    = false;
  var _gateLimit     = null;

  function _calcGateLimit() {
    var limit = null;
    for (var i = 0; i < _gateInstances.length; i++) {
      var g = _gateInstances[i];
      if (!g.isOpen && g._wrap) {
        var rect   = g._wrap.getBoundingClientRect();
        var absTop = rect.top + window.pageYOffset;
        if (limit === null || absTop < limit) limit = absTop;
      }
    }
    return limit;
  }

  function _syncGateLimit() {
    _gateLimit = _calcGateLimit();
    if (_gateLimit !== null && window.pageYOffset > _gateLimit) {
      window.scrollTo({ top: _gateLimit, behavior: 'smooth' });
    }
  }

  function _initGate() {
    if (_gateInited) return;
    _gateInited = true;
    var MARGIN = 2;

    function blocked(dy) {
      return dy > 0 && _gateLimit !== null &&
        window.pageYOffset >= _gateLimit - MARGIN;
    }

    window.addEventListener('wheel', function (e) {
      if (blocked(e.deltaY)) e.preventDefault();
    }, { passive: false });

    var _ty = 0;
    window.addEventListener('touchstart', function (e) {
      _ty = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (blocked(_ty - e.touches[0].clientY)) e.preventDefault();
    }, { passive: false });

    var _downKeys = ['ArrowDown', 'PageDown', 'End'];
    window.addEventListener('keydown', function (e) {
      var isDown = _downKeys.indexOf(e.key) >= 0 || (e.key === ' ' && !e.shiftKey);
      if (isDown && blocked(1)) e.preventDefault();
    });

    var _snapping = false;
    window.addEventListener('scroll', function () {
      if (_gateLimit === null || _snapping) return;
      if (window.pageYOffset > _gateLimit) {
        _snapping = true;
        window.scrollTo(0, _gateLimit);
        setTimeout(function () { _snapping = false; }, 60);
      }
    }, { passive: true });
  }

  function UiBtn(el) {
    this.el          = el;
    this.icon        = el.getAttribute('icon')         || '';
    this.iconActive  = el.getAttribute('icon-active')  || '';
    this.theme       = el.getAttribute('theme')        || UB_CFG.theme;
    this.size        = el.getAttribute('size')         || UB_CFG.size;
    this.variant     = el.getAttribute('variant')      || UB_CFG.variant;
    this.animation   = el.getAttribute('animation')    || UB_CFG.animation;
    this.animDur     = parseInt(el.getAttribute('anim-duration')) || UB_CFG.animDuration;
    this.hasChevron  = el.hasAttribute('chevron')      || !!UB_CFG.chevron;
    this.startOpen   = el.hasAttribute('open');
    this.disabled    = el.hasAttribute('disabled');
    this.targetId    = el.getAttribute('target')       || '';
    this.href        = (el.getAttribute('href') || '').trim();
    this.hrefTarget  = el.getAttribute('href-target')  || '_self';
    this.hrefDelay   = parseInt(el.getAttribute('href-delay')) || 0;
    this.labelClosed = el.textContent.trim();
    this.labelOpen   = el.getAttribute('label-open')   || '';
    this.group       = el.getAttribute('group')        || '';
    this.tooltip     = el.getAttribute('tooltip')      || '';

    this.alertMsg  = el.getAttribute('alert') || '';
    this.alertOpts = {
      theme:    el.getAttribute('alert-theme')    || '',
      position: el.getAttribute('alert-position') || 'top',
      duration: el.hasAttribute('alert-duration') ? el.getAttribute('alert-duration') : null,
      width:    el.getAttribute('alert-width')    || '',
      icon:     el.getAttribute('alert-icon')     || ''
    };

    this.unlockChunkTargets = parseUnlockChunk(el.getAttribute('unlock-chunk') || '');
    this.scrollGate         = el.hasAttribute('scroll-gate');

    this.color   = resolveColor(this.theme) || BRAND.shell;
    this.isOpen  = false;
    this._target = null;
    this._btn    = null;
    this._lbl    = null;
    this._icoEl  = null;
    this._wrap   = null;
  }

  UiBtn.prototype.init = function () {
    this._render();

    if (this.targetId) {
      this._target = document.getElementById(this.targetId);
      if (!this._target) console.warn('[ui-btn] 找不到 target: #' + this.targetId);
    } else if (!this.href && !this.alertMsg && !this.unlockChunkTargets.length) {
      console.warn('[ui-btn] 未設定 target、href、alert 或 unlock-chunk，按鈕不會有任何作用。', this.el);
    }

    if (this.scrollGate) {
      this.isOpen = this.startOpen;
      if (this._target) {
        this._target.style.display = '';
        this._target.classList.add('ubtn-gate-target');
        if (!this.isOpen) {
          this._target.classList.add('ubtn-gate-locked');
          this._btn.classList.add('ubtn-gate-cue');
        }
        _gateInstances.push(this);
        _initGate();
        setTimeout(_syncGateLimit, 0);
      }
    } else if (this._target) {
      var hidden = this._target.style.display === 'none' ||
        (this._target.style.display === '' &&
          getComputedStyle(this._target).display === 'none');
      this.isOpen = this.startOpen || !hidden;
      if (this.startOpen && hidden) this._target.style.display = '';
    } else {
      this.isOpen = this.startOpen;
    }

    this._syncBtn();

    if (this.isOpen && this.unlockChunkTargets.length) {
      var self = this;
      setTimeout(function () { self._applyChunkLock(false); }, 0);
    }
  };

  UiBtn.prototype._render = function () {
    var self     = this;
    var sz       = SIZES[this.size] || SIZES.md;
    var hasText  = !!this.labelClosed;
    var iconOnly = !hasText;
    var hoverBg  = blendColor(this.color, 0.22);

    var wrap = document.createElement('span');
    wrap.className = 'ubtn-wrap';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ubtn ubtn-' + this.variant;
    if (this.disabled) btn.setAttribute('disabled', '');
    if (this.tooltip)  btn.title = this.tooltip;
    btn.style.cssText = '--ubtn-c:' + this.color + ';--ubtn-ch:' + hoverBg;

    if (iconOnly) {
      btn.style.width        = sz.dim;
      btn.style.height       = sz.dim;
      btn.style.borderRadius = '50%';
      btn.style.fontSize     = sz.icoFs;
    } else {
      btn.style.padding      = sz.pad;
      btn.style.borderRadius = sz.r;
      btn.style.gap          = sz.gap;
      btn.style.fontSize     = sz.fs;
    }

    if (this.icon) {
      btn.insertAdjacentHTML('beforeend', mkIco(this.icon));
      this._icoEl = btn.querySelector('.ubtn-ico i');
    }

    if (hasText) {
      var lbl = document.createElement('span');
      lbl.className   = 'ubtn-lbl';
      lbl.textContent = this.labelClosed;
      btn.appendChild(lbl);
      this._lbl = lbl;
    }

    if (this.hasChevron) {
      var chev = document.createElement('span');
      chev.className = 'ubtn-chev';
      chev.innerHTML = CHEV_SVG;
      btn.appendChild(chev);
    }

    if (iconOnly) {
      var dot = document.createElement('span');
      dot.className = 'ubtn-dot';
      btn.appendChild(dot);
    }

    btn.addEventListener('click', function () {
      if (self.targetId || self.unlockChunkTargets.length || !self.href) self._toggle();
      if (self.alertMsg) showAlert(self.alertMsg, self.alertOpts);
      if (self.href) self._go();
    });
    wrap.appendChild(btn);
    this.el.before(wrap);
    this.el.style.display = 'none';
    this._btn  = btn;
    this._wrap = wrap;
  };

  UiBtn.prototype._go = function () {
    var url = this.href;
    if (/^\s*(javascript|data|vbscript):/i.test(url)) {
      console.warn('[ui-btn] href 不允許使用的協定，已忽略：', url);
      return;
    }
    var tgt = this.hrefTarget;
    var run = function () {
      if (tgt === '_self') {
        location.href = url;
      } else if (tgt === '_blank') {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.open(url, tgt);
      }
    };
    if (this.hrefDelay > 0) setTimeout(run, this.hrefDelay);
    else run();
  };

  UiBtn.prototype._toggle = function () {
    var self = this;
    if (this.isOpen) {
      this._close();
    } else {
      if (this.group && _groups[this.group]) {
        _groups[this.group].forEach(function (b) {
          if (b !== self && b.isOpen) b._close();
        });
      }
      this._open();
    }
  };

  UiBtn.prototype._open = function () {
    this.isOpen = true;
    this._syncBtn();
    if (this._target) {
      if (this.scrollGate) {
        this._target.classList.remove('ubtn-gate-locked');
        this._btn.classList.remove('ubtn-gate-cue');
        _syncGateLimit();
      } else {
        animOpen(this._target, this.animation, this.animDur);
      }
    }
    this._applyChunkLock(false);
  };

  UiBtn.prototype._close = function () {
    this.isOpen = false;
    this._syncBtn();
    if (this._target) {
      if (this.scrollGate) {
        this._target.classList.add('ubtn-gate-locked');
        this._btn.classList.add('ubtn-gate-cue');
        _syncGateLimit();
      } else {
        animClose(this._target, this.animation, this.animDur);
      }
    }
    this._applyChunkLock(true);
  };

  UiBtn.prototype._applyChunkLock = function (lock) {
    if (!this.unlockChunkTargets.length) return;
    this.unlockChunkTargets.forEach(function (t) {
      var el = document.getElementById(t.demoId);
      if (!el) {
        console.warn('[ui-btn] unlock-chunk：找不到 chunk-demo #' + t.demoId);
        return;
      }
      var method = lock ? 'lockChunk' : 'unlockChunk';
      if (typeof el[method] === 'function') {
        el[method](t.chunkId);
      } else {
        console.warn('[ui-btn] unlock-chunk：#' + t.demoId + ' 不支援 ' + method + '()，請確認已載入 chunk-demo.js');
      }
    });
  };

  UiBtn.prototype._syncBtn = function () {
    if (!this._btn) return;
    this._btn.classList.toggle('is-open', this.isOpen);
    if (this._icoEl) {
      this._icoEl.className = (this.isOpen && this.iconActive)
        ? 'bi ' + this.iconActive
        : 'bi ' + this.icon;
    }
    if (this._lbl) {
      this._lbl.textContent = (this.isOpen && this.labelOpen)
        ? this.labelOpen : this.labelClosed;
    }
  };

  var _alertStacks = {};

  function ensureAlertStack(pos) {
    if (!_alertStacks[pos]) {
      var c = document.createElement('div');
      c.className = 'ubtn-astack ubtn-astack-' + pos;
      document.body.appendChild(c);
      _alertStacks[pos] = c;
    }
    return _alertStacks[pos];
  }

  function showAlert(message, opts) {
    opts = opts || {};
    var pos   = opts.position === 'bottom' ? 'bottom' : 'top';
    var color = resolveColor(opts.theme) || BRAND.safe;
    var dur   = (opts.duration != null) ? +opts.duration : 3000;
    var icon  = opts.icon || '';

    var width = opts.width ? String(opts.width).trim() : '';
    if (width && !/^\d+(\.\d+)?(px|%)$/.test(width)) {
      console.warn('[ui-btn] alert width 格式無效（應為 px 或 %，例如 "400px"、"80%"），已忽略。');
      width = '';
    }

    var stack = ensureAlertStack(pos);
    var item  = document.createElement('div');
    item.className = 'ubtn-alert';
    item.style.background = color;
    item.style.color      = BG;

    if (width) {
      item.style.width      = width;
      item.style.maxWidth   = 'none';
      item.style.whiteSpace = 'normal';
    }

    if (icon && /^bi-/.test(icon)) {
      var iEl = document.createElement('i');
      iEl.className = 'bi ' + icon;
      iEl.setAttribute('aria-hidden', 'true');
      iEl.style.flexShrink = '0';
      item.appendChild(iEl);
    }

    var txt = document.createElement('span');
    txt.textContent = message;
    item.appendChild(txt);

    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'ubtn-alert-x';
    x.innerHTML = '&times;';
    x.style.color = BG;
    item.appendChild(x);

    function dismiss() {
      item.classList.remove('ubtn-alert-in');
      onTransEnd(item, 'opacity', function () { item.remove(); });
    }

    x.addEventListener('click', dismiss);
    var timer = (dur > 0) ? setTimeout(dismiss, dur) : null;
    item.addEventListener('click', function (e) {
      if (e.target !== x) { clearTimeout(timer); dismiss(); }
    });

    stack.appendChild(item);
    rAF2(function () { item.classList.add('ubtn-alert-in'); });

    return { dismiss: dismiss };
  }

  showAlert.clear = function () {
    ['top', 'bottom'].forEach(function (pos) {
      if (_alertStacks[pos]) {
        Array.from(_alertStacks[pos].children).forEach(function (c) { c.remove(); });
      }
    });
  };

  function bootBtn() {
    var instances = [];
    document.querySelectorAll('ui-btn:not([data-ubtn])').forEach(function (el) {
      el.setAttribute('data-ubtn', '');
      instances.push(new UiBtn(el));
    });
    instances.forEach(function (b) {
      b.init();
      if (b.group) {
        if (!_groups[b.group]) _groups[b.group] = [];
        _groups[b.group].push(b);
      }
    });
  }

  function boot() {
    bootCluster();
    bootReading();
    bootBtn();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.UiCluster = { init: bootCluster, config: UC_CFG, colors: BRAND };
  global.UiReading = { init: bootReading, config: UR_CFG, colors: BRAND };
  global.UiBtn     = { init: bootBtn,     alert: showAlert, config: UB_CFG, colors: BRAND };

})(window);