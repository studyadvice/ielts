(() => {
  'use strict';
  if (customElements.get('ui-contacts')) return;

  const PALETTE = { base:'#0C0D0C', shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', calm:'#A3C4BC', quiet:'#8EA4DE', playful:'#FFA987', urgent:'#FF2E63', energetic:'#B6FF00', dreamy:'#C394CD', salmon:'#FFC88A', 'bg-alternative':'#2D2D2D' };
  const color = v => { if (!v) return ''; const t = String(v).trim(); return PALETTE[t.toLowerCase()] || t; };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const fs = v => /^\d*\.?\d+$/.test(String(v)) ? v + 'rem' : v;
  const kebab = k => k.replace(/[A-Z]/g, c => '-' + c.toLowerCase());

  /* ── 卡片樣式組合：card-theme 一次套用底色、框線、文字、頭像、hover 色。個別屬性仍可覆寫 ── */
  const THEMES = {
    night:  { cardBg:'base',           cardBorderColor:'bg-alternative', cardBorderWidth:1, cardBorderStyle:'solid',  cardBar:0, nameColor:'vanilla', metaColor:'gray',  iconColor:'shell',          avatarBg:'gray',           avatarTextColor:'base',    hoverColor:'key' },
    cocoa:  { cardBg:'bg-alternative', cardBorderColor:'bg-alternative', cardBorderWidth:0, cardBorderStyle:'solid',  cardBar:0, nameColor:'vanilla', metaColor:'calm',  iconColor:'shell',          avatarBg:'playful',        avatarTextColor:'base',    hoverColor:'playful' },
    paper:  { cardBg:'vanilla',        cardBorderColor:'shell',          cardBorderWidth:1, cardBorderStyle:'solid',  cardBar:0, nameColor:'base',    metaColor:'gray',  iconColor:'bg-alternative', avatarBg:'bg-alternative', avatarTextColor:'vanilla', hoverColor:'bg-alternative' },
    key:    { cardBg:'base',           cardBorderColor:'key',            cardBorderWidth:1, cardBorderStyle:'solid',  cardBar:0, nameColor:'key',     metaColor:'calm',  iconColor:'key',            avatarBg:'key',            avatarTextColor:'base',    hoverColor:'energetic' },
    neon:   { cardBg:'base',           cardBorderColor:'energetic',      cardBorderWidth:1, cardBorderStyle:'solid',  cardBar:0, nameColor:'energetic', metaColor:'calm', iconColor:'energetic',     avatarBg:'energetic',      avatarTextColor:'base',    hoverColor:'yellow' },
    indigo: { cardBg:'base',           cardBorderColor:'indigo',         cardBorderWidth:2, cardBorderStyle:'solid',  cardBar:0, nameColor:'vanilla', metaColor:'quiet', iconColor:'quiet',          avatarBg:'indigo',         avatarTextColor:'base',    hoverColor:'violet' },
    dreamy: { cardBg:'base',           cardBorderColor:'dreamy',         cardBorderWidth:1, cardBorderStyle:'dashed', cardBar:0, nameColor:'pink',    metaColor:'dreamy', iconColor:'dreamy',        avatarBg:'dreamy',         avatarTextColor:'base',    hoverColor:'pink' },
    double: { cardBg:'base',           cardBorderColor:'shell',          cardBorderWidth:4, cardBorderStyle:'double', cardBar:0, nameColor:'vanilla', metaColor:'gray',  iconColor:'shell',          avatarBg:'shell',          avatarTextColor:'base',    hoverColor:'yellow' },
    /* 以下兩組會用到每張卡片自己的 color */
    tint:   { cardBg:'base',           cardBorderColor:'@',              cardBorderWidth:1, cardBorderStyle:'solid',  cardBar:0, nameColor:'@',       metaColor:'gray',  iconColor:'@',              avatarBg:'@',              avatarTextColor:'base',    hoverColor:'vanilla' },
    bar:    { cardBg:'bg-alternative', cardBorderColor:'bg-alternative', cardBorderWidth:0, cardBorderStyle:'solid',  cardBar:5, nameColor:'vanilla', metaColor:'calm',  iconColor:'shell',          avatarBg:'@',              avatarTextColor:'base',    hoverColor:'@' }
  };
  const LOOK_KEYS = Object.keys(THEMES.night);

  const DEFAULTS = {
    /* 連結 */ for: '', typeAll: false, side: 'left', dataStyle: 'outline',
    /* 標題 */ title: '', titleSize: '1.2rem', titleWeight: 700, titleColor: 'violet',
    /* 版面 */ columns: 2, gap: 12, cardPadding: '12px 14px', cardRadius: 10, cardMinHeight: 0, avatarSize: 44, avatarShape: 'circle',
               nameSize: '1rem', metaSize: '0.85rem', nameWeight: 600,
    /* 樣式 */ cardTheme: 'night', cardBg: '', cardBorderColor: '', cardBorderWidth: -1, cardBorderStyle: '', cardBar: -1,
               nameColor: '', metaColor: '', iconColor: '', avatarBg: '', avatarTextColor: '', hoverColor: '', dropColor: 'key',
    /* 開關 */ showStatus: false, statusDot: 'avatar', showExt: true, showMenu: true, showCall: true, showCount: true
  };
  const CFG = Object.assign({}, DEFAULTS, window.UiContactsConfig || {});
  /* 可以寫在 p-card 上覆寫的設定 */
  const CARD_KEYS = ['cardTheme', 'cardBg', 'cardBorderColor', 'cardBorderWidth', 'cardBorderStyle', 'cardBar', 'nameColor', 'metaColor', 'iconColor', 'avatarBg', 'avatarTextColor', 'hoverColor', 'showStatus', 'statusDot', 'showExt', 'showMenu', 'showCall', 'showCount', 'typeAll', 'side', 'dataStyle'];
  /* 沒指定 color 的卡片，依序輪流配色 */
  const AUTO_COLORS = ['blue', 'pink', 'green', 'playful', 'violet', 'key', 'yellow', 'dreamy', 'indigo', 'calm'];
  const STATUS_GUESS = [[/avail|online|線上|有空/i, 'green'], [/meet|busy|call|會議|忙/i, 'violet'], [/away|idle|離開/i, 'yellow'], [/dnd|disturb|勿擾/i, 'red']];

  const CSS = `
ui-contacts{display:block;color:${PALETTE.shell};}
ui-contacts:not([data-ready]){visibility:hidden;}
ui-contacts .uc-title{font-size:var(--uc-tfs);font-weight:var(--uc-tfw);color:var(--uc-tc);margin:0 0 12px 0;}
ui-contacts .uc-grid{display:grid;grid-template-columns:repeat(var(--uc-cols),minmax(0,1fr));gap:var(--uc-gap);}
ui-contacts .uc-err{color:${PALETTE.red};border:1px solid ${PALETTE.red};border-radius:8px;padding:8px 12px;font-size:0.9rem;margin:0 0 12px 0;}
p-card{display:block;position:relative;}
p-msg{display:none;}
p-card .uc-card{display:flex;align-items:center;gap:12px;padding:var(--uc-pad);min-height:var(--uc-mh);border-radius:var(--uc-r);
  background:var(--pc-bg);border:var(--pc-bw) var(--pc-bs) var(--pc-bd);box-shadow:inset var(--pc-bar) 0 0 0 var(--pc-c);
  cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none;transition:border-color .2s;}
p-card .uc-card:hover{outline:2px solid var(--pc-hover);outline-offset:1px;}
p-card .uc-av{position:relative;flex:0 0 var(--uc-av);width:var(--uc-av);height:var(--uc-av);}
p-card .uc-av-in{width:100%;height:100%;border-radius:var(--uc-avr);overflow:hidden;background:var(--pc-avbg);color:var(--pc-avtx);
  display:flex;align-items:center;justify-content:center;font-weight:700;font-size:calc(var(--uc-av) * 0.36);line-height:1;}
p-card .uc-av-in i{font-size:calc(var(--uc-av) * 0.5);}
p-card .uc-av-in img{width:100%;height:100%;object-fit:cover;display:block;}
p-card .uc-dot{position:absolute;right:-2px;bottom:-2px;width:calc(var(--uc-av) * 0.3);height:calc(var(--uc-av) * 0.3);border-radius:50%;background:var(--pc-sc);border:2px solid var(--pc-bg);}
p-card .uc-info{flex:1 1 auto;min-width:0;}
p-card .uc-name{font-size:var(--uc-ns);font-weight:var(--uc-nw);color:var(--pc-name);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.35;}
p-card .uc-ext{color:var(--pc-meta);font-weight:400;margin:0 0 0 6px;}
p-card .uc-meta{font-size:var(--uc-ms);color:var(--pc-meta);margin:2px 0 0 0;display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden;}
p-card .uc-meta .uc-tdot{flex:0 0 8px;width:8px;height:8px;border-radius:50%;background:var(--pc-sc);}
p-card .uc-side{display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;align-self:stretch;gap:6px;}
p-card .uc-row{display:flex;align-items:center;gap:8px;}
p-card .uc-btn{background:transparent;border:0;color:var(--pc-icon);padding:0 2px;margin:0;cursor:pointer;font-size:1rem;line-height:1;}
p-card .uc-btn:hover{color:var(--pc-hover);}
p-card .uc-count{font-size:0.7rem;font-weight:700;border-radius:999px;padding:0 7px;border:1px solid var(--pc-c);color:var(--pc-c);line-height:1.5;font-variant-numeric:tabular-nums;}
p-card .uc-pop{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:30;background:${PALETTE.base};border:1px solid var(--pc-c);border-radius:8px;
  padding:10px 12px;font-size:0.85rem;line-height:1.5;color:${PALETTE.shell};max-height:240px;overflow:auto;cursor:default;}
p-card .uc-pop ol{margin:0;padding:0 0 0 20px;}
p-card .uc-pop li{margin:0 0 4px 0;}
p-card .uc-pop li.uc-next{color:var(--pc-c);}
p-card .uc-pop li.uc-done{color:${PALETTE.gray};text-decoration:line-through;}
p-card .uc-pop .uc-pop-h{color:${PALETTE.gray};font-size:0.75rem;margin:0 0 6px 0;}
/* 訊息用完：不用透明度，改灰階、虛線框、不能拖 */
p-card.uc-used .uc-card{--pc-name:${PALETTE.gray};--pc-avbg:${PALETTE.gray};--pc-c:${PALETTE.gray};--pc-bd:${PALETTE.gray};border-style:dashed;cursor:not-allowed;}
p-card.uc-used .uc-card:hover{outline:0;}
p-card.uc-used .uc-av-in img{filter:grayscale(1);}
p-card.uc-dragging .uc-card{border-style:dashed;outline:2px dashed var(--uc-drop);outline-offset:1px;}
p-card.uc-ghost{position:fixed;z-index:9999;pointer-events:none;margin:0;transform:rotate(-2deg);}
p-card.uc-ghost .uc-card{outline:2px solid var(--uc-drop);outline-offset:1px;box-shadow:inset var(--pc-bar) 0 0 0 var(--pc-c),0 10px 24px #000;cursor:grabbing;}
p-card.uc-sent .uc-card{animation:uc-sent .5s ease;}
@keyframes uc-sent{0%{transform:scale(1);}40%{transform:scale(0.96);}100%{transform:scale(1);}}
/* 拖曳中，目標 ui-stream、ui-post 的提示框線 */
ui-stream[data-uc-ready] .us-wrap,ui-post[data-uc-ready] .upo{outline:2px dashed var(--uc-drop);outline-offset:3px;}
ui-stream[data-uc-over] .us-wrap,ui-post[data-uc-over] .upo{outline:3px solid var(--uc-drop);outline-offset:3px;}
`;
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

  const initialsOf = name => String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => [...w][0]).join('').toUpperCase();
  const slug = s => String(s || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w一-鿿-]/g, '') || 'contact';

  class UiContacts extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this._opt = this._read(this, Object.keys(DEFAULTS), CFG);
      /* 等 p-card 子元素都解析完再建構 */
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => this._build(), { once: true });
      else this._build();
    }

    _read(node, keys, base) {
      const o = {};
      keys.forEach(k => {
        const attr = kebab(k);
        if (!node.hasAttribute(attr)) { if (base) o[k] = base[k]; return; }
        const v = node.getAttribute(attr), d = DEFAULTS[k];
        o[k] = typeof d === 'boolean' ? v !== 'false' : typeof d === 'number' ? num(v, base ? base[k] : d) : v;
      });
      return o;
    }

    _build() {
      const o = this._opt;
      const sv = (k, v) => this.style.setProperty(k, v);
      sv('--uc-tfs', fs(o.titleSize)); sv('--uc-tfw', o.titleWeight); sv('--uc-tc', color(o.titleColor));
      sv('--uc-cols', Math.max(1, Math.round(o.columns))); sv('--uc-gap', o.gap + 'px');
      sv('--uc-pad', o.cardPadding); sv('--uc-r', o.cardRadius + 'px'); sv('--uc-mh', o.cardMinHeight > 0 ? o.cardMinHeight + 'px' : 'auto');
      sv('--uc-av', o.avatarSize + 'px');
      sv('--uc-avr', o.avatarShape === 'square' ? '0px' : o.avatarShape === 'rounded' ? Math.round(o.avatarSize * 0.22) + 'px' : '50%');
      sv('--uc-ns', fs(o.nameSize)); sv('--uc-ms', fs(o.metaSize)); sv('--uc-nw', o.nameWeight);
      sv('--uc-drop', color(o.dropColor));

      this._cards = [...this.querySelectorAll(':scope > p-card')].map((node, i) => this._readCard(node, i));
      const title = o.title || this.getAttribute('title'); this.removeAttribute('title');
      const grid = el('div', 'uc-grid');
      this._cards.forEach(c => { this._render(c); grid.append(c.node); });
      this.innerHTML = '';
      if (title) this.append(el('div', 'uc-title', title));
      this._errBox = el('div', 'uc-err'); this._errBox.hidden = true; this.append(this._errBox);
      this.append(grid);
      this.setAttribute('data-ready', '');
      this._onDocDown = e => { if (!e.target.closest || !e.target.closest('.uc-pop, .uc-menu')) this._closePops(); };
      document.addEventListener('pointerdown', this._onDocDown);
    }
    disconnectedCallback() { if (this._onDocDown) document.removeEventListener('pointerdown', this._onDocDown); }

    _readCard(node, i) {
      const a = n => node.getAttribute(n);
      const own = this._read(node, CARD_KEYS, null);
      const name = a('name') || '';
      const msgs = [...node.querySelectorAll(':scope > p-msg')].map(m => {
        const g = n => m.getAttribute(n);
        return { html: m.innerHTML.trim(), typed: m.hasAttribute('typed') ? g('typed') !== 'false' : null, time: g('time'), badge: g('badge'), badgeColor: g('badge-color'),
          speed: g('speed'), delay: g('delay'), gap: g('gap'), highlight: m.hasAttribute('highlight'), color: g('color'), side: g('side'), dataStyle: g('data-style'),
          textAlign: g('text-align'), pause: g('pause'), reveal: g('reveal'), revealTarget: g('reveal-target'), stage: g('stage'),
          attrs: Object.fromEntries([...m.attributes].map(x => [x.name, x.value])) };
      });
      return {
        node, own, msgs, sent: 0, index: i, name,
        role: slug(a('role') || name || 'contact-' + (i + 1)),
        ext: a('ext') || '', status: a('status') || '', statusColor: a('status-color') || '',
        image: a('image') || '', icon: a('icon') || '', initials: a('initials') || '',
        color: color(a('color') || AUTO_COLORS[i % AUTO_COLORS.length]), textColor: a('text-color') || '', textAlign: a('text-align') || '',
        /* 送到 ui-post 時，p-card 上這幾個屬性會套到他的每一則留言 */
        postAttrs: Object.fromEntries(['examiner', 'role-label', 'liked'].filter(k => node.hasAttribute(k)).map(k => [k, a(k)]))
      };
    }

    /* 卡片設定的優先順序：p-card 個別屬性 > p-card 的 card-theme > ui-contacts 個別屬性 > ui-contacts 的 card-theme */
    _look(c) {
      const o = this._opt, own = c.own;
      const ownTheme = own.cardTheme && THEMES[own.cardTheme], baseTheme = THEMES[o.cardTheme] || THEMES.night;
      const pick = k => {
        if (own[k] != null && own[k] !== '' && !(typeof DEFAULTS[k] === 'number' && own[k] < 0)) return own[k];
        if (ownTheme) return ownTheme[k];
        const v = this.hasAttribute(kebab(k)) || (window.UiContactsConfig && k in window.UiContactsConfig) ? o[k] : null;
        if (v != null && v !== '' && !(typeof DEFAULTS[k] === 'number' && v < 0)) return v;
        return baseTheme[k];
      };
      const L = {}; LOOK_KEYS.forEach(k => { const v = pick(k); L[k] = v === '@' ? c.color : v; });
      const flag = k => own[k] != null ? own[k] : o[k];
      ['showStatus', 'statusDot', 'showExt', 'showMenu', 'showCall', 'showCount', 'typeAll', 'side', 'dataStyle'].forEach(k => { L[k] = flag(k); });
      return L;
    }

    _render(c) {
      const L = this._look(c), n = c.node;
      c.look = L;
      const sv = (k, v) => n.style.setProperty(k, v);
      sv('--pc-c', c.color); sv('--pc-bg', color(L.cardBg)); sv('--pc-bd', color(L.cardBorderColor)); sv('--pc-bw', num(L.cardBorderWidth, 1) + 'px');
      sv('--pc-bs', L.cardBorderStyle || 'solid'); sv('--pc-bar', num(L.cardBar, 0) + 'px');
      sv('--pc-name', color(L.nameColor)); sv('--pc-meta', color(L.metaColor)); sv('--pc-icon', color(L.iconColor));
      sv('--pc-avbg', color(L.avatarBg)); sv('--pc-avtx', color(L.avatarTextColor)); sv('--pc-hover', color(L.hoverColor));
      let sc = c.statusColor; if (!sc) { const g = STATUS_GUESS.find(([re]) => re.test(c.status)); sc = g ? g[1] : 'gray'; }
      sv('--pc-sc', color(sc));

      [...n.childNodes].forEach(ch => { if (!(ch.nodeType === 1 && ch.tagName === 'P-MSG')) ch.remove(); });
      const card = el('div', 'uc-card');
      const av = el('div', 'uc-av'), inner = el('div', 'uc-av-in');
      if (c.image) { const im = el('img'); im.src = c.image; im.alt = c.name; im.draggable = false; inner.append(im); }
      else if (c.icon) inner.innerHTML = `<i class="bi bi-${c.icon}"></i>`;
      else inner.textContent = c.initials || initialsOf(c.name);
      av.append(inner);
      const showStatus = L.showStatus && c.status;
      if (L.showStatus && L.statusDot !== 'text') av.append(el('span', 'uc-dot'));
      card.append(av);

      const info = el('div', 'uc-info'), nm = el('div', 'uc-name', c.name);
      if (L.showExt && c.ext) nm.append(el('span', 'uc-ext', c.ext));
      info.append(nm);
      if (showStatus) {
        const meta = el('div', 'uc-meta');
        if (L.statusDot === 'text') meta.append(el('span', 'uc-tdot'));
        meta.append(el('span', null, c.status)); info.append(meta);
      }
      card.append(info);

      const side = el('div', 'uc-side');
      const top = el('div', 'uc-row'), bottom = el('div', 'uc-row');
      if (L.showMenu) { const b = el('button', 'uc-btn uc-menu'); b.type = 'button'; b.title = '查看訊息'; b.innerHTML = '<i class="bi bi-three-dots"></i>'; b.onclick = e => { e.stopPropagation(); this._togglePop(c); }; top.append(b); }
      if (L.showCount) { c.countEl = el('span', 'uc-count'); bottom.append(c.countEl); }
      if (L.showCall) { const b = el('button', 'uc-btn uc-call'); b.type = 'button'; b.title = '送出下一則'; b.innerHTML = '<i class="bi bi-telephone"></i>'; b.onclick = e => { e.stopPropagation(); this._send(c, null); }; bottom.append(b); }
      if (top.childNodes.length || bottom.childNodes.length) { side.append(top, bottom); card.append(side); }
      n.append(card);
      c.card = card;
      card.addEventListener('pointerdown', e => this._down(e, c));
      this._refresh(c);
    }

    _refresh(c) {
      const left = c.msgs.length - c.sent;
      if (c.countEl) c.countEl.textContent = left;
      c.node.classList.toggle('uc-used', left <= 0);
      if (c.pop) this._fillPop(c);
    }

    /* ── ⋯ 選單：預覽這個人的訊息 ── */
    _closePops(except) { (this._cards || []).forEach(c => { if (c !== except && c.pop) { c.pop.remove(); c.pop = null; } }); }
    _togglePop(c) {
      if (c.pop) { c.pop.remove(); c.pop = null; return; }
      this._closePops(c);
      c.pop = el('div', 'uc-pop'); c.pop.addEventListener('pointerdown', e => e.stopPropagation());
      this._fillPop(c); c.node.append(c.pop);
    }
    _fillPop(c) {
      const p = c.pop; p.innerHTML = '';
      p.append(el('div', 'uc-pop-h', `${c.name}：${c.msgs.length - c.sent} / ${c.msgs.length} 則未送出`));
      if (!c.msgs.length) { p.append(el('div', null, '沒有訊息')); return; }
      const ol = el('ol');
      c.msgs.forEach((m, i) => { const tmp = el('div'); tmp.innerHTML = m.html; const li = el('li', i < c.sent ? 'uc-done' : i === c.sent ? 'uc-next' : '', tmp.textContent.trim()); ol.append(li); });
      p.append(ol);
    }

    /* ── 找目標 ui-stream 或 ui-post：for 可寫多個 id（空白分隔）；沒寫時，頁面上只有一個目標就用它 ── */
    _targets() {
      const ok = n => n && (n.tagName === 'UI-STREAM' || n.tagName === 'UI-POST');
      const ids = String(this._opt.for || '').split(/\s+/).filter(Boolean);
      if (ids.length) return ids.map(id => document.getElementById(id)).filter(ok);
      const all = document.querySelectorAll('ui-stream, ui-post'); return all.length === 1 ? [all[0]] : [];
    }
    _error(msg) { this._errBox.textContent = '[ui-contacts] ' + msg; this._errBox.hidden = false; clearTimeout(this._errT); this._errT = setTimeout(() => { this._errBox.hidden = true; }, 5000); }

    /* ── 拖放：用 pointer events，滑鼠與觸控都能用 ── */
    _down(e, c) {
      if (e.button !== 0 || e.target.closest('.uc-btn, .uc-pop')) return;
      if (c.sent >= c.msgs.length) return;
      e.preventDefault();
      const card = c.card, rect = c.node.getBoundingClientRect();
      const st = { x: e.clientX, y: e.clientY, dx: e.clientX - rect.left, dy: e.clientY - rect.top, w: rect.width, ghost: null, over: null, targets: null };
      card.setPointerCapture(e.pointerId);
      const move = ev => {
        if (!st.ghost) {
          if (Math.hypot(ev.clientX - st.x, ev.clientY - st.y) < 6) return;
          this._closePops();
          st.targets = this._targets();
          st.targets.forEach(t => { t.style.setProperty('--uc-drop', color(this._opt.dropColor)); t.setAttribute('data-uc-ready', ''); });
          const g = c.node.cloneNode(true); g.classList.add('uc-ghost'); g.classList.remove('uc-dragging');
          g.style.cssText = this.style.cssText + ';' + c.node.style.cssText; g.style.width = st.w + 'px';
          g.querySelectorAll('.uc-pop').forEach(x => x.remove());
          document.body.append(g); st.ghost = g; c.node.classList.add('uc-dragging');
        }
        st.ghost.style.left = (ev.clientX - st.dx) + 'px'; st.ghost.style.top = (ev.clientY - st.dy) + 'px';
        const hit = document.elementFromPoint(ev.clientX, ev.clientY);
        const s = hit && hit.closest('ui-stream, ui-post');
        const over = s && st.targets.includes(s) ? s : null;
        if (over !== st.over) { if (st.over) st.over.removeAttribute('data-uc-over'); if (over) over.setAttribute('data-uc-over', ''); st.over = over; }
      };
      const end = ev => {
        card.removeEventListener('pointermove', move); card.removeEventListener('pointerup', end); card.removeEventListener('pointercancel', end);
        if (!st.ghost) return;
        st.ghost.remove(); c.node.classList.remove('uc-dragging');
        (st.targets || []).forEach(t => { t.removeAttribute('data-uc-ready'); t.removeAttribute('data-uc-over'); });
        if (ev.type === 'pointerup' && st.over) this._send(c, st.over);
        else if (ev.type === 'pointerup' && !(st.targets || []).length) this._error(this._opt.for ? `找不到 for="${this._opt.for}" 指定的 ui-stream 或 ui-post` : '請用 for 屬性指定 ui-stream 或 ui-post 的 id');
      };
      card.addEventListener('pointermove', move); card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
    }

    _send(c, target) {
      if (c.sent >= c.msgs.length) return false;
      const t = target || this._targets()[0];
      if (!t) { this._error(this._opt.for ? `找不到 for="${this._opt.for}" 指定的 ui-stream 或 ui-post` : '請用 for 屬性指定 ui-stream 或 ui-post 的 id'); return false; }
      const L = c.look, m = c.msgs[c.sent], idx = c.sent;
      if (t.tagName === 'UI-POST') {
        if (typeof t.add !== 'function') { this._error('ui-post.js 尚未載入，或版本太舊（需要 add）'); return false; }
        /* p-msg 的屬性原樣變成 post-item 屬性（likes、best、low、tags、reply、examiner…），stream 專用的屬性 ui-post 會忽略 */
        const post = Object.assign({}, c.postAttrs, m.attrs, {
          author: c.name, avatar: c.image || c.initials || initialsOf(c.name), 'avatar-color': c.color, html: m.html });
        t.add(post);
        return this._afterSend(c, idx, t);
      }
      if (typeof t.add !== 'function' || typeof t.addRole !== 'function') { this._error('ui-stream.js 尚未載入，或版本太舊（需要 addRole）'); return false; }
      t.addRole(c.role, { label: c.name, color: c.color, image: c.image, icon: c.icon, initials: c.image || c.icon ? '' : (c.initials || initialsOf(c.name)),
        side: L.side, dataStyle: L.dataStyle, textColor: c.textColor, textAlign: c.textAlign });
      const item = { from: c.role, name: c.name, html: m.html, typed: m.typed != null ? m.typed : !!L.typeAll };
      ['time', 'badge', 'badgeColor', 'speed', 'delay', 'gap', 'color', 'side', 'dataStyle', 'textAlign', 'pause', 'reveal', 'revealTarget', 'stage'].forEach(k => { if (m[k] != null && m[k] !== '') item[k] = m[k]; });
      if (m.highlight) item.highlight = true;
      t.add(item);
      return this._afterSend(c, idx, t);
    }

    _afterSend(c, idx, t) {
      c.sent++;
      this._refresh(c);
      c.node.classList.remove('uc-sent'); void c.node.offsetWidth; c.node.classList.add('uc-sent');
      const left = c.msgs.length - c.sent;
      this.dispatchEvent(new CustomEvent('ui-contacts:send', { bubbles: true, detail: { name: c.name, role: c.role, index: idx, remaining: left, card: c.node, target: t } }));
      if (!left) this.dispatchEvent(new CustomEvent('ui-contacts:empty', { bubbles: true, detail: { name: c.name, role: c.role, card: c.node } }));
      return true;
    }

    /* ── 公開方法 ── */
    _find(who) {
      if (who == null || !this._cards) return null;
      if (typeof who === 'number') return this._cards[who] || null;
      if (who.nodeType) return this._cards.find(c => c.node === who) || null;
      const s = String(who).toLowerCase(); return this._cards.find(c => c.role === s || c.name.toLowerCase() === s) || null;
    }
    send(who, targetId) { const c = this._find(who); if (!c) return false; return this._send(c, targetId ? document.getElementById(targetId) : null); }
    reset(who) { (who != null ? [this._find(who)].filter(Boolean) : this._cards || []).forEach(c => { c.sent = 0; this._refresh(c); }); }
    remaining(who) { const c = this._find(who); return c ? c.msgs.length - c.sent : 0; }
    get cards() { return (this._cards || []).map(c => ({ name: c.name, role: c.role, total: c.msgs.length, sent: c.sent })); }
  }

  customElements.define('p-card', class extends HTMLElement {});
  customElements.define('p-msg', class extends HTMLElement {});
  customElements.define('ui-contacts', UiContacts);
  window.UiContacts = { defaults: DEFAULTS, config: CFG, themes: THEMES, colors: PALETTE };
})();
