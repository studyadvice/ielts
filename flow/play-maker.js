/* =========================================================================
 * <play-maker> ui-play 與 ui-fillin 劇本製作器
 *
 * <play-maker storage-key="play-maker"></play-maker>
 *
 * 用法：貼上句子，用滑鼠選取文字，按浮動工具列上的按鈕（色彩、底線、圈起來、
 *       改寫、印章、註解、挖空）。右側自動產生步驟清單、即時預覽與兩份程式碼：
 *       ui-play 錄影版、ui-fillin 練習版。
 * 依賴：同頁需載入 ui-play.js 與 ui-fillin.js（只用於預覽）、Bootstrap Icons。
 * 草稿自動存在瀏覽器（localStorage），以 storage-key 區分。
 * ========================================================================= */
(function () {
  'use strict';
  if (window.customElements.get('play-maker')) return;

  const PALETTE = {
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7', red: '#EF6661',
    green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1', violet: '#B484E8', gray: '#86877F',
    key: '#51DBCF', calm: '#A3C4BC', quiet: '#8EA4DE', playful: '#FFA987', urgent: '#FF2E63',
    energetic: '#B6FF00', dreamy: '#DE8EC9'
  };
  const MARKS = {
    underline: ['底線', 'bi-type-underline', 'key'],
    circle: ['圈起來', 'bi-circle', 'yellow'],
    highlight: ['螢光筆', 'bi-highlighter', 'yellow'],
    box: ['方框', 'bi-square', 'key'],
    strike: ['刪除線', 'bi-type-strikethrough', 'red'],
    bracket: ['括號', 'bi-braces', 'indigo']
  };
  const SWAP_MODES = { strike: '刪改', replace: '替換', retype: '重打' };
  const FRAMES = ['plain', 'none', 'win', 'mac', 'win-classic', 'browser', 'phone', 'paper', 'sheet', 'notebook', 'draw'];
  const STARTS = { click: '等按鍵', with: '同時', after: '接續' };

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const escFill = (s) => String(s).replace(/([\\{}|])/g, '\\$1').replace(/^\*/, '\\*');

  const CSS = `
play-maker{display:block;position:relative;color:#C6C7BD;font-size:1rem;font-family:system-ui,"Microsoft JhengHei","Noto Sans TC",sans-serif;}
play-maker *{box-sizing:border-box;}
play-maker .pm-alerts{position:fixed;right:24px;bottom:24px;z-index:60;width:380px;}
play-maker .pm-alerts .alert{margin:0 0 8px 0;}
play-maker .pm-set{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px;margin:0 0 16px 0;padding:12px 16px;background:#3B2A20;border-radius:10px;}
play-maker .pm-set label{display:flex;flex-direction:column;gap:4px;font-size:.8125rem;color:#A3C4BC;}
play-maker .pm-in,play-maker select.pm-in{font:inherit;font-size:.9375rem;background:#0C0D0C;color:#DBEDD8;border:1px solid #86877F;border-radius:6px;padding:5px 8px;}
play-maker .pm-in:focus{outline:none;border-color:#51DBCF;}
play-maker .pm-btn{font:inherit;font-size:.875rem;line-height:1.4;background:#0C0D0C;color:#C6C7BD;border:1px solid #86877F;border-radius:6px;padding:5px 12px;cursor:pointer;white-space:nowrap;}
play-maker .pm-btn:hover{border-color:#51DBCF;color:#51DBCF;}
play-maker .pm-btn.is-main{background:#51DBCF;border-color:#51DBCF;color:#0C0D0C;font-weight:600;}
play-maker .pm-btn.is-main:hover{background:#DBEDD8;border-color:#DBEDD8;}
play-maker .pm-btn.is-danger:hover{border-color:#EF6661;color:#EF6661;}
play-maker .pm-grid{display:grid;grid-template-columns:minmax(0,1.1fr) 380px minmax(0,1fr);gap:20px;align-items:start;}
play-maker .pm-col{display:flex;flex-direction:column;gap:16px;min-width:0;}
play-maker .pm-card{border:1px solid #3B2A20;border-radius:10px;padding:16px;}
play-maker .pm-card > h3{display:flex;align-items:center;gap:8px;margin:0 0 12px 0;font-size:1rem;color:#51DBCF;}
play-maker .pm-card > h3 small{margin-left:auto;font-size:.8125rem;color:#86877F;font-weight:400;}
play-maker textarea.pm-in{width:100%;min-height:96px;resize:vertical;line-height:1.6;}
play-maker .pm-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0 0 0;}
play-maker .pm-edit{min-height:160px;font-size:1.25rem;line-height:2;color:#C6C7BD;}
play-maker .pm-empty{color:#86877F;font-size:.9375rem;line-height:1.6;padding:16px 0;}
play-maker .pm-line{display:flex;align-items:flex-start;gap:8px;padding:2px 0;border-bottom:1px dashed #3B2A20;}
play-maker .pm-line.is-hidden .pm-text{color:#86877F;}
play-maker .pm-text{flex:1;min-width:0;cursor:text;user-select:text;}
play-maker .pm-ln{flex:0 0 28px;padding:8px 0 0 0;font-size:.75rem;color:#86877F;text-align:right;user-select:none;}
play-maker .pm-ic{flex:0 0 auto;margin:8px 0 0 0;padding:2px 6px;background:none;border:0;color:#86877F;font-size:1rem;line-height:1;cursor:pointer;}
play-maker .pm-ic:hover{color:#51DBCF;}
play-maker .pm-ic.is-on{color:#E3D322;}
play-maker .pm-edit [data-pm]{border-bottom:2px dotted #8EA4DE;}
play-maker .pm-edit [data-pm].is-flash{background:#3B2A20;}
play-maker .pm-edit [data-blank]{border-bottom:2px solid #FFA987;}
play-maker .pm-tb{position:absolute;z-index:50;display:none;flex-direction:column;gap:8px;padding:8px;background:#3B2A20;border:1px solid #86877F;border-radius:10px;width:max-content;max-width:640px;}
play-maker .pm-tb.is-open{display:flex;}
play-maker .pm-tbr{display:flex;flex-wrap:wrap;align-items:center;gap:4px;}
play-maker .pm-tbr b{display:block;width:1px;height:24px;margin:0 4px;background:#86877F;}
play-maker .pm-tbb{display:flex;align-items:center;gap:4px;font:inherit;font-size:.8125rem;background:#0C0D0C;color:#C6C7BD;border:1px solid #0C0D0C;border-radius:6px;padding:4px 8px;cursor:pointer;}
play-maker .pm-tbb:hover{border-color:#51DBCF;}
play-maker .pm-tbb i{font-size:1rem;}
play-maker .pm-tbb.is-key{color:#51DBCF;font-weight:700;}
play-maker .pm-sw{display:none;flex-wrap:wrap;gap:6px;max-width:420px;}
play-maker .pm-sw.is-open{display:flex;}
play-maker .pm-sw button{display:flex;align-items:center;gap:4px;font:inherit;font-size:.75rem;background:#0C0D0C;color:#C6C7BD;border:1px solid #0C0D0C;border-radius:12px;padding:2px 8px 2px 4px;cursor:pointer;}
play-maker .pm-sw button:hover{border-color:#DBEDD8;}
play-maker .pm-sw i{display:block;width:14px;height:14px;border-radius:50%;}
play-maker .pm-form{display:none;flex-wrap:wrap;align-items:center;gap:8px;font-size:.8125rem;}
play-maker .pm-form.is-open{display:flex;}
play-maker .pm-form .pm-in{min-width:160px;}
play-maker .pm-steps{display:flex;flex-direction:column;gap:6px;}
play-maker .pm-step{display:grid;grid-template-columns:24px minmax(0,1fr);gap:6px 8px;align-items:center;padding:8px;background:#0C0D0C;border:1px solid #3B2A20;border-radius:8px;cursor:pointer;}
play-maker .pm-step:hover{border-color:#86877F;}
play-maker .pm-step > span:first-child{font-size:.8125rem;color:#86877F;text-align:right;}
play-maker .pm-step .pm-sl{font-size:.875rem;color:#DBEDD8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
play-maker .pm-step .pm-sl i{margin-right:6px;color:#51DBCF;}
play-maker .pm-step .pm-sl em{font-style:normal;color:#86877F;}
play-maker .pm-step .pm-sa{grid-column:2;display:flex;gap:4px;align-items:center;}
play-maker .pm-step .pm-sa span{flex:1;}
play-maker .pm-step select.pm-in{font-size:.75rem;padding:2px 4px;}
play-maker .pm-step .pm-ic{margin:0;font-size:.875rem;}
play-maker .pm-step.is-with{margin-left:24px;}
play-maker .pm-blanks{margin:16px 0 0 0;font-size:.875rem;color:#C6C7BD;}
play-maker .pm-blanks h4{margin:0 0 6px 0;font-size:.875rem;color:#FFA987;font-weight:600;}
play-maker .pm-blank{display:flex;align-items:center;gap:8px;padding:4px 8px;border-left:3px solid #FFA987;margin:0 0 4px 0;}
play-maker .pm-blank span{flex:1;}
play-maker .pm-blank em{font-style:normal;color:#86877F;}
play-maker .pm-blank .pm-ic{margin:0;}
play-maker .pm-tabs{display:flex;gap:4px;margin:0 0 12px 0;}
play-maker .pm-tab{font:inherit;font-size:.875rem;background:none;color:#86877F;border:0;border-bottom:2px solid transparent;padding:4px 12px;cursor:pointer;}
play-maker .pm-tab.is-on{color:#DBEDD8;border-bottom-color:#51DBCF;}
play-maker .pm-prev{min-height:200px;}
play-maker pre.pm-code{margin:0;max-height:420px;overflow:auto;padding:12px;background:#151615;border:1px solid #3B2A20;border-radius:8px;color:#C6C7BD;font-size:.8125rem;line-height:1.55;white-space:pre;}
play-maker table.pm-tbl{width:100%;border-collapse:collapse;font-size:.875rem;}
play-maker table.pm-tbl th{padding:4px 6px;color:#A3C4BC;font-weight:400;text-align:left;}
play-maker table.pm-tbl td{padding:3px;}
play-maker table.pm-tbl .pm-in{width:100%;}
play-maker details > summary{cursor:pointer;color:#A3C4BC;font-size:.9375rem;}
`;

  class PlayMaker extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      if (!document.getElementById('play-maker-style')) {
        const s = document.createElement('style');
        s.id = 'play-maker-style';
        s.textContent = CSS;
        document.head.appendChild(s);
      }
      this._seq = 0;
      this._steps = [];
      this._blanks = {};
      this._tab = 'play';
      this._key = 'play-maker:' + (this.getAttribute('storage-key') || 'default');
      this._render();
      this._load();
      this._refresh();
    }

    /* ---------------- 畫面 ---------------- */
    _render() {
      const frameOpts = FRAMES.map((f) => `<option value="${f}">${f}</option>`).join('');
      const swatches = Object.keys(PALETTE).map((k) => `<button type="button" data-color="${k}"><i style="background:${PALETTE[k]}"></i>${k}</button>`).join('');
      const markBtns = Object.keys(MARKS).map((k) => `<button type="button" class="pm-tbb" data-act="mark" data-kind="${k}"><i class="bi ${MARKS[k][1]}"></i>${MARKS[k][0]}</button>`).join('');
      this.innerHTML = `
<div class="pm-alerts"></div>
<div class="pm-set">
  <label>外框<select class="pm-in" data-set="frame">${frameOpts}</select></label>
  <label>標題列文字<input class="pm-in" data-set="title" placeholder="可空白"></label>
  <label>推進方式<select class="pm-in" data-set="nextBy"><option value="key">鍵盤</option><option value="click">滑鼠點擊</option><option value="both">兩者皆可</option></select></label>
  <label>字級<input class="pm-in" data-set="fontSize" style="width:96px"></label>
  <label>id 前綴<input class="pm-in" data-set="prefix" style="width:96px"></label>
  <label>練習版題型<select class="pm-in" data-set="fillMode"><option value="choice">選擇題</option><option value="text">輸入題</option></select></label>
  <span style="flex:1"></span>
  <button type="button" class="pm-btn is-danger" data-cmd="clear"><i class="bi bi-trash3"></i> 全部清空</button>
</div>
<div class="pm-grid">
  <div class="pm-col">
    <div class="pm-card">
      <h3><i class="bi bi-clipboard"></i> 1. 貼上內容<small>一行一句</small></h3>
      <textarea class="pm-in" data-ref="paste" placeholder="把句子貼在這裡，每一行會變成畫面上的一行。"></textarea>
      <div class="pm-row"><button type="button" class="pm-btn is-main" data-cmd="paste"><i class="bi bi-arrow-down"></i> 放進編輯區</button></div>
      <details style="margin-top:16px">
        <summary>或用表格快速建立文法修正</summary>
        <table class="pm-tbl"><thead><tr><th>原句</th><th style="width:16%">錯的字</th><th style="width:16%">改成</th><th style="width:18%">印章（可空白）</th></tr></thead><tbody data-ref="tbody"></tbody></table>
        <div class="pm-row"><button type="button" class="pm-btn" data-cmd="row"><i class="bi bi-plus"></i> 加一列</button><button type="button" class="pm-btn is-main" data-cmd="table"><i class="bi bi-arrow-down"></i> 加入編輯區</button></div>
      </details>
    </div>
    <div class="pm-card">
      <h3><i class="bi bi-cursor-text"></i> 2. 選取文字，按按鈕<small><i class="bi bi-eye"></i> 先隱藏這一行，播到才出現</small></h3>
      <div class="pm-edit" data-ref="edit"></div>
    </div>
  </div>
  <div class="pm-col">
    <div class="pm-card">
      <h3><i class="bi bi-list-ol"></i> 3. 步驟<small>點一下看對應文字</small></h3>
      <div class="pm-steps" data-ref="steps"></div>
      <div class="pm-blanks" data-ref="blanks"></div>
    </div>
  </div>
  <div class="pm-col">
    <div class="pm-card">
      <div class="pm-tabs">
        <button type="button" class="pm-tab is-on" data-tab="play"><i class="bi bi-play-btn"></i> 錄影版 ui-play</button>
        <button type="button" class="pm-tab" data-tab="fill"><i class="bi bi-pencil-square"></i> 練習版 ui-fillin</button>
      </div>
      <div class="pm-prev" data-ref="prev"></div>
      <div class="pm-row"><button type="button" class="pm-btn" data-cmd="replay"><i class="bi bi-arrow-repeat"></i> 重新預覽</button></div>
    </div>
    <div class="pm-card">
      <h3><i class="bi bi-code-slash"></i> 程式碼</h3>
      <div class="pm-row" style="margin:0 0 8px 0">
        <button type="button" class="pm-btn is-main" data-cmd="copy-play"><i class="bi bi-copy"></i> 複製 ui-play</button>
        <button type="button" class="pm-btn is-main" data-cmd="copy-fill"><i class="bi bi-copy"></i> 複製 ui-fillin</button>
      </div>
      <pre class="pm-code" data-ref="code"></pre>
    </div>
  </div>
</div>
<div class="pm-tb" data-ref="tb">
  <div class="pm-tbr">
    <button type="button" class="pm-tbb is-key" data-act="color" data-color="key"><i class="bi bi-fonts"></i>c-key</button>
    <button type="button" class="pm-tbb" data-act="palette"><i class="bi bi-palette"></i>其他色</button>
    <button type="button" class="pm-tbb" data-act="uncolor"><i class="bi bi-eraser"></i>清除色彩</button>
  </div>
  <div class="pm-tbr">${markBtns}</div>
  <div class="pm-tbr">
    <button type="button" class="pm-tbb" data-act="form" data-form="swap"><i class="bi bi-arrow-left-right"></i>改寫</button>
    <button type="button" class="pm-tbb" data-act="form" data-form="stamp"><i class="bi bi-patch-check"></i>印章</button>
    <button type="button" class="pm-tbb" data-act="form" data-form="note"><i class="bi bi-chat-square-text"></i>註解</button>
    <b></b>
    <button type="button" class="pm-tbb" data-act="form" data-form="blank"><i class="bi bi-input-cursor-text"></i>挖空（只用於練習版）</button>
  </div>
  <div class="pm-sw" data-ref="sw">${swatches}</div>
  <div class="pm-form" data-form="swap">改成 <input class="pm-in" data-f="to">
    <select class="pm-in" data-f="mode" style="min-width:0">${Object.keys(SWAP_MODES).map((k) => `<option value="${k}">${SWAP_MODES[k]}</option>`).join('')}</select>
    <label><input type="checkbox" data-f="blank" checked> 練習版挖空</label>
    <button type="button" class="pm-btn is-main" data-act="ok">確定</button></div>
  <div class="pm-form" data-form="stamp">印章文字 <input class="pm-in" data-f="text" placeholder="例如：大錯特錯">
    <select class="pm-in" data-f="color" style="min-width:0">${Object.keys(PALETTE).map((k) => `<option${k === 'red' ? ' selected' : ''}>${k}</option>`).join('')}</select>
    <button type="button" class="pm-btn is-main" data-act="ok">確定</button></div>
  <div class="pm-form" data-form="note">註解 <input class="pm-in" data-f="text" style="min-width:280px" placeholder="例如：太籠統，考官看不出詞彙量">
    <button type="button" class="pm-btn is-main" data-act="ok">確定</button></div>
  <div class="pm-form" data-form="blank">干擾選項 <input class="pm-in" data-f="wrong" style="min-width:240px" placeholder="用逗號分隔，選擇題至少一個">
    <button type="button" class="pm-btn is-main" data-act="ok">確定</button></div>
</div>`;
      this._ref = {};
      this.querySelectorAll('[data-ref]').forEach((el) => { this._ref[el.dataset.ref] = el; });
      this._edit = this._ref.edit;
      this._tb = this._ref.tb;
      for (let i = 0; i < 3; i++) this._addRow();

      this.addEventListener('click', (e) => this._onClick(e));
      this.addEventListener('change', (e) => this._onChange(e));
      this.addEventListener('input', (e) => { if (e.target.dataset.set) this._readSettings(); });
      this._edit.addEventListener('mouseup', () => setTimeout(() => this._onSelect(), 0));
      this._edit.addEventListener('keyup', (e) => { if (e.shiftKey) this._onSelect(); });
      document.addEventListener('mousedown', (e) => {
        if (!this._tb.contains(e.target) && !this._edit.contains(e.target)) this._closeTb();
      });
      this._tb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.matches('input.pm-in')) { e.preventDefault(); this._submitForm(); }
        if (e.key === 'Escape') this._closeTb();
      });
    }

    _addRow() {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td><input class="pm-in" data-c="0"></td><td><input class="pm-in" data-c="1"></td><td><input class="pm-in" data-c="2"></td><td><input class="pm-in" data-c="3"></td>';
      this._ref.tbody.appendChild(tr);
    }

    _alert(msg, type) {
      const d = document.createElement('div');
      d.className = 'alert alert-' + (type || 'warning') + ' alert-dismissible fade show';
      d.setAttribute('role', 'alert');
      d.innerHTML = '<span></span><button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
      d.querySelector('span').textContent = msg;
      d.querySelector('.btn-close').addEventListener('click', () => d.remove());
      this._ref ? this.querySelector('.pm-alerts').appendChild(d) : null;
      setTimeout(() => d.remove(), 3500);
    }

    /* ---------------- 設定 ---------------- */
    _readSettings() {
      const get = (k) => this.querySelector(`[data-set="${k}"]`).value.trim();
      this._set = {
        frame: get('frame') || 'plain', title: get('title'), nextBy: get('nextBy') || 'key',
        fontSize: get('fontSize') || '1.375rem', prefix: (get('prefix') || 'pm').replace(/[^\w-]/g, '') || 'pm',
        fillMode: get('fillMode') || 'choice'
      };
      this._refresh();
    }

    _writeSettings() {
      const s = this._set;
      Object.keys(s).forEach((k) => { const el = this.querySelector(`[data-set="${k}"]`); if (el) el.value = s[k]; });
    }

    /* ---------------- 編輯區 ---------------- */
    _newLine(html) {
      const id = 'l' + (++this._seq);
      const line = document.createElement('div');
      line.className = 'pm-line';
      line.dataset.line = id;
      line.innerHTML = '<span class="pm-ln"></span><div class="pm-text"></div>' +
        '<button type="button" class="pm-ic" data-cmd="hide" title="先隱藏，播到才出現"><i class="bi bi-eye"></i></button>' +
        '<button type="button" class="pm-ic" data-cmd="del-line" title="刪除這一行"><i class="bi bi-x-lg"></i></button>';
      line.querySelector('.pm-text').innerHTML = html;
      this._edit.appendChild(line);
      return line;
    }

    _lines() { return Array.from(this._edit.querySelectorAll('.pm-line')); }

    _onSelect() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) { this._closeTb(); return; }
      const r = sel.getRangeAt(0).cloneRange();
      const box = (n) => (n.nodeType === 3 ? n.parentNode : n).closest('.pm-text');
      const a = box(r.startContainer), b = box(r.endContainer);
      if (!a || a !== b || !this._edit.contains(a)) {
        if (a || b) this._alert('一次只能選取同一行裡的文字。');
        this._closeTb();
        return;
      }
      this._trim(r);
      if (!r.toString()) { this._closeTb(); return; }
      this._range = r;
      this._openTb(r);
    }

    _trim(r) {
      const s = r.toString();
      const lead = s.length - s.replace(/^\s+/, '').length;
      const trail = s.length - s.replace(/\s+$/, '').length;
      if (lead && r.startContainer.nodeType === 3 && r.startOffset + lead <= r.startContainer.length) r.setStart(r.startContainer, r.startOffset + lead);
      if (trail && r.endContainer.nodeType === 3 && r.endOffset - trail >= 0) r.setEnd(r.endContainer, r.endOffset - trail);
    }

    _openTb(r) {
      const rect = r.getBoundingClientRect();
      const host = this.getBoundingClientRect();
      this._tb.querySelectorAll('.pm-form,.pm-sw').forEach((f) => f.classList.remove('is-open'));
      this._tb.classList.add('is-open');
      const w = this._tb.offsetWidth;
      let left = rect.left - host.left;
      left = Math.max(0, Math.min(left, host.width - w));
      this._tb.style.left = left + 'px';
      this._tb.style.top = (rect.bottom - host.top + 8) + 'px';
    }

    _closeTb() {
      this._tb.classList.remove('is-open');
      this._form = null;
    }

    /* 把選取範圍包成可定位的 span；範圍剛好等於既有 span 時沿用 */
    _target(r) {
      let a = r.commonAncestorContainer;
      if (a.nodeType === 3) a = a.parentNode;
      const txt = r.toString();
      const hit = a.closest('[data-pm]');
      if (hit && this._edit.contains(hit) && hit.textContent.trim() === txt) return hit;
      const span = document.createElement('span');
      span.dataset.pm = 't' + (++this._seq);
      try { r.surroundContents(span); } catch (e) {
        this._alert('選取範圍跨過了已標記的文字，請把範圍縮小，或剛好對齊已標記的文字。');
        return null;
      }
      return span;
    }

    _color(name) {
      const r = this._range;
      let a = r.commonAncestorContainer;
      if (a.nodeType === 3) a = a.parentNode;
      const hit = a.closest('[data-c]');
      if (hit && this._edit.contains(hit) && hit.textContent.trim() === r.toString()) {
        const n = document.createElement('c-' + name);
        n.dataset.c = name;
        while (hit.firstChild) n.appendChild(hit.firstChild);
        hit.replaceWith(n);
      } else {
        const n = document.createElement('c-' + name);
        n.dataset.c = name;
        try { r.surroundContents(n); } catch (e) { this._alert('選取範圍跨過了已標記的文字，請把範圍縮小。'); return; }
      }
      this._done();
    }

    _uncolor() {
      let a = this._range.commonAncestorContainer;
      if (a.nodeType === 3) a = a.parentNode;
      const hit = a.closest('[data-c]');
      if (!hit || !this._edit.contains(hit)) { this._alert('選取的文字沒有設定色彩。'); return; }
      hit.replaceWith(...hit.childNodes);
      this._done();
    }

    _addStep(st) {
      st.start = st.start || 'click';
      this._steps.push(st);
    }

    _onAct(btn) {
      const act = btn.dataset.act;
      if (act === 'color') { this._color(btn.dataset.color); return; }
      if (act === 'uncolor') { this._uncolor(); return; }
      if (act === 'palette') { this._ref.sw.classList.toggle('is-open'); return; }
      if (act === 'mark') {
        const t = this._target(this._range);
        if (!t) return;
        this._addStep({ type: 'mark', target: t.dataset.pm, kind: btn.dataset.kind, color: MARKS[btn.dataset.kind][2] });
        this._done();
        return;
      }
      if (act === 'form') {
        const name = btn.dataset.form;
        this._tb.querySelectorAll('.pm-form').forEach((f) => f.classList.toggle('is-open', f.dataset.form === name));
        this._form = name;
        const f = this._tb.querySelector(`.pm-form[data-form="${name}"]`);
        f.querySelectorAll('input.pm-in').forEach((i) => { i.value = ''; });
        const first = f.querySelector('input.pm-in');
        if (first) first.focus();
        return;
      }
      if (act === 'ok') this._submitForm();
    }

    _submitForm() {
      const name = this._form;
      if (!name) return;
      const f = this._tb.querySelector(`.pm-form[data-form="${name}"]`);
      const v = (k) => { const el = f.querySelector(`[data-f="${k}"]`); return el.type === 'checkbox' ? el.checked : el.value.trim(); };
      if (name === 'swap' && !v('to')) { this._alert('請輸入要改成的文字。'); return; }
      if ((name === 'stamp' || name === 'note') && !v('text')) { this._alert('請輸入文字。'); return; }
      const t = this._target(this._range);
      if (!t) return;
      const id = t.dataset.pm;
      if (name === 'swap') {
        this._addStep({ type: 'swap', target: id, to: v('to'), mode: v('mode') });
        if (v('blank')) this._blanks[id] = { answer: v('to'), wrong: [t.textContent.trim()] };
      } else if (name === 'stamp') {
        this._addStep({ type: 'stamp', target: id, text: v('text'), color: v('color') });
      } else if (name === 'note') {
        this._addStep({ type: 'note', target: id, text: v('text') });
      } else if (name === 'blank') {
        this._blanks[id] = { answer: t.textContent.trim(), wrong: v('wrong').split(/[,，、]/).map((x) => x.trim()).filter(Boolean) };
        t.dataset.blank = '';
      }
      this._done();
    }

    _done() {
      window.getSelection().removeAllRanges();
      this._closeTb();
      this._refresh();
    }

    /* 沒有任何步驟或挖空在用的 span 就拆掉 */
    _cleanup() {
      this._edit.querySelectorAll('[data-pm]').forEach((sp) => {
        const id = sp.dataset.pm;
        if (this._blanks[id]) sp.dataset.blank = ''; else delete sp.dataset.blank;
        if (!this._steps.some((s) => s.target === id) && !this._blanks[id]) sp.replaceWith(...sp.childNodes);
      });
      this._edit.normalize();
    }

    /* ---------------- 點擊與變更 ---------------- */
    _onClick(e) {
      const act = e.target.closest('[data-act]');
      if (act && this._tb.contains(act)) { this._onAct(act); return; }
      const sw = e.target.closest('.pm-sw button');
      if (sw) { this._color(sw.dataset.color); return; }
      const tab = e.target.closest('[data-tab]');
      if (tab) {
        this._tab = tab.dataset.tab;
        this.querySelectorAll('.pm-tab').forEach((t) => t.classList.toggle('is-on', t === tab));
        this._preview();
        this._showCode();
        return;
      }
      const c = e.target.closest('[data-cmd]');
      if (c) { this._cmd(c.dataset.cmd, c); return; }
      const row = e.target.closest('.pm-step');
      if (row && !e.target.closest('select')) this._flash(this._steps[+row.dataset.i].target);
    }

    _onChange(e) {
      const el = e.target;
      if (el.dataset.set) { this._readSettings(); return; }
      const row = el.closest('.pm-step');
      if (row && el.dataset.k) {
        this._steps[+row.dataset.i][el.dataset.k] = el.value;
        this._refresh();
      }
    }

    _cmd(cmd, btn) {
      if (cmd === 'paste') {
        const lines = this._ref.paste.value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
        if (!lines.length) { this._alert('請先貼上內容。'); return; }
        lines.forEach((t) => this._newLine(esc(t)));
        this._ref.paste.value = '';
        this._refresh();
      } else if (cmd === 'row') {
        this._addRow();
      } else if (cmd === 'table') {
        this._fromTable();
      } else if (cmd === 'hide') {
        const id = btn.closest('.pm-line').dataset.line;
        const i = this._steps.findIndex((s) => s.type === 'show' && s.target === id);
        if (i >= 0) this._steps.splice(i, 1); else this._addStep({ type: 'show', target: id, effect: 'fade' });
        this._refresh();
      } else if (cmd === 'del-line') {
        const line = btn.closest('.pm-line');
        const ids = [line.dataset.line].concat(Array.from(line.querySelectorAll('[data-pm]')).map((s) => s.dataset.pm));
        this._steps = this._steps.filter((s) => ids.indexOf(s.target) === -1);
        ids.forEach((id) => delete this._blanks[id]);
        line.remove();
        this._refresh();
      } else if (cmd === 'up' || cmd === 'down') {
        const i = +btn.closest('.pm-step').dataset.i, j = cmd === 'up' ? i - 1 : i + 1;
        if (j < 0 || j >= this._steps.length) return;
        const t = this._steps[i]; this._steps[i] = this._steps[j]; this._steps[j] = t;
        this._refresh();
      } else if (cmd === 'del-step') {
        this._steps.splice(+btn.closest('.pm-step').dataset.i, 1);
        this._refresh();
      } else if (cmd === 'del-blank') {
        delete this._blanks[btn.dataset.id];
        this._refresh();
      } else if (cmd === 'replay') {
        this._preview();
      } else if (cmd === 'copy-play' || cmd === 'copy-fill') {
        const code = cmd === 'copy-play' ? this._playCode() : this._fillCode();
        if (!code) { this._alert('還沒有內容可以複製。'); return; }
        this._copy(code, cmd === 'copy-play' ? 'ui-play' : 'ui-fillin');
      } else if (cmd === 'clear') {
        if (!this._lines().length) return;
        if (!this._confirmClear) {
          this._confirmClear = true;
          this._alert('再按一次「全部清空」就會刪除所有內容與步驟。', 'danger');
          setTimeout(() => { this._confirmClear = false; }, 3500);
          return;
        }
        this._confirmClear = false;
        this._edit.innerHTML = '';
        this._steps = [];
        this._blanks = {};
        this._refresh();
      }
    }

    _fromTable() {
      const rows = Array.from(this._ref.tbody.querySelectorAll('tr'));
      let added = 0, missed = [];
      rows.forEach((tr) => {
        const c = Array.from(tr.querySelectorAll('input')).map((i) => i.value.trim());
        if (!c[0]) return;
        const line = this._newLine(esc(c[0]));
        added++;
        if (!c[1] || !c[2]) return;
        const txt = line.querySelector('.pm-text');
        const node = txt.firstChild;
        const re = new RegExp('(^|[^A-Za-z])(' + c[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![A-Za-z])');
        const m = re.exec(node.data);
        if (!m) { missed.push(c[1]); return; }
        const r = document.createRange();
        const at = m.index + m[1].length;
        r.setStart(node, at);
        r.setEnd(node, at + c[1].length);
        const t = this._target(r);
        if (!t) return;
        this._addStep({ type: 'swap', target: t.dataset.pm, to: c[2], mode: 'strike' });
        this._blanks[t.dataset.pm] = { answer: c[2], wrong: [c[1]] };
        if (c[3]) this._addStep({ type: 'stamp', target: t.dataset.pm, text: c[3], color: 'red', start: 'after' });
      });
      if (!added) { this._alert('表格是空的。'); return; }
      this._ref.tbody.querySelectorAll('input').forEach((i) => { i.value = ''; });
      if (missed.length) this._alert('句子裡找不到：' + missed.join('、') + '。這幾句只加入文字，請手動選取標記。');
      this._refresh();
    }

    _flash(id) {
      const el = this._edit.querySelector(`[data-pm="${id}"]`) || this._edit.querySelector(`[data-line="${id}"] .pm-text`);
      if (!el) return;
      el.classList.add('is-flash');
      el.scrollIntoView({ block: 'nearest' });
      setTimeout(() => el.classList.remove('is-flash'), 900);
    }

    _copy(text, label) {
      const ok = () => this._alert('已複製 ' + label + ' 程式碼。', 'success');
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(ok, () => this._copyOld(text) && ok());
      } else if (this._copyOld(text)) ok();
      else this._alert('瀏覽器不允許自動複製，請直接選取下方程式碼。');
    }

    _copyOld(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      return ok;
    }

    /* ---------------- 步驟清單 ---------------- */
    _label(st) {
      const tgt = this._edit.querySelector(`[data-pm="${st.target}"]`);
      const word = tgt ? tgt.textContent.trim() : '';
      if (st.type === 'mark') return `<i class="bi ${MARKS[st.kind][1]}"></i>${MARKS[st.kind][0]} <em>${esc(word)}</em>`;
      if (st.type === 'swap') return `<i class="bi bi-arrow-left-right"></i>${SWAP_MODES[st.mode]} <em>${esc(word)}</em> → ${esc(st.to)}`;
      if (st.type === 'stamp') return `<i class="bi bi-patch-check"></i>印章「${esc(st.text)}」 <em>${esc(word)}</em>`;
      if (st.type === 'note') return `<i class="bi bi-chat-square-text"></i>註解「${esc(st.text)}」`;
      const n = this._lines().findIndex((l) => l.dataset.line === st.target) + 1;
      return `<i class="bi bi-eye"></i>顯示第 ${n} 行`;
    }

    _renderSteps() {
      const box = this._ref.steps;
      if (!this._steps.length) {
        box.innerHTML = '<div class="pm-empty">選取左邊的文字並按按鈕，步驟會依序出現在這裡。</div>';
      } else {
        box.innerHTML = this._steps.map((st, i) => {
          const starts = Object.keys(STARTS).map((k) => `<option value="${k}"${st.start === k ? ' selected' : ''}>${STARTS[k]}</option>`).join('');
          const colorSel = (st.type === 'mark' || st.type === 'stamp')
            ? `<select class="pm-in" data-k="color">${Object.keys(PALETTE).map((k) => `<option${st.color === k ? ' selected' : ''}>${k}</option>`).join('')}</select>` : '';
          return `<div class="pm-step${st.start === 'with' ? ' is-with' : ''}" data-i="${i}"><span>${i + 1}</span><div class="pm-sl">${this._label(st)}</div>` +
            `<div class="pm-sa"><select class="pm-in" data-k="start">${starts}</select>${colorSel}<span></span>` +
            `<button type="button" class="pm-ic" data-cmd="up" title="上移"><i class="bi bi-chevron-up"></i></button>` +
            `<button type="button" class="pm-ic" data-cmd="down" title="下移"><i class="bi bi-chevron-down"></i></button>` +
            `<button type="button" class="pm-ic" data-cmd="del-step" title="刪除"><i class="bi bi-x-lg"></i></button></div></div>`;
        }).join('');
      }
      const ids = Object.keys(this._blanks);
      this._ref.blanks.innerHTML = ids.length ? '<h4><i class="bi bi-input-cursor-text"></i> 練習版挖空</h4>' + ids.map((id) => {
        const b = this._blanks[id];
        return `<div class="pm-blank"><span>${esc(b.answer)}${b.wrong.length ? ' <em>干擾：' + esc(b.wrong.join('、')) + '</em>' : ''}</span>` +
          `<button type="button" class="pm-ic" data-cmd="del-blank" data-id="${id}" title="取消挖空"><i class="bi bi-x-lg"></i></button></div>`;
      }).join('') : '';
      this._lines().forEach((l, i) => {
        l.querySelector('.pm-ln').textContent = i + 1;
        const on = this._steps.some((s) => s.type === 'show' && s.target === l.dataset.line);
        l.classList.toggle('is-hidden', on);
        l.querySelector('[data-cmd="hide"]').classList.toggle('is-on', on);
        l.querySelector('[data-cmd="hide"] i').className = 'bi ' + (on ? 'bi-eye-slash' : 'bi-eye');
      });
      if (!this._lines().length) this._edit.innerHTML = '<div class="pm-empty">還沒有內容。先在上方貼上句子，或用表格建立。</div>';
      else { const em = this._edit.querySelector(':scope > .pm-empty'); if (em) em.remove(); }
    }

    /* ---------------- 產生程式碼 ---------------- */
    _stage(forFill) {
      const p = this._set.prefix;
      return this._lines().map((line) => {
        const c = line.querySelector('.pm-text').cloneNode(true);
        c.querySelectorAll('[data-c]').forEach((n) => n.removeAttribute('data-c'));
        if (forFill) {
          const walk = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
          const texts = [];
          while (walk.nextNode()) texts.push(walk.currentNode);
          texts.forEach((t) => { t.data = t.data.replace(/([{}])/g, '\\$1'); });
          c.querySelectorAll('[data-pm]').forEach((sp) => {
            if (!sp.isConnected && !c.contains(sp)) return;
            const b = this._blanks[sp.dataset.pm];
            if (!b) { sp.replaceWith(...sp.childNodes); return; }
            let syn = '';
            if (this._set.fillMode === 'text') syn = '{' + escFill(b.answer) + '}';
            else {
              const opts = Array.from(new Set([b.answer].concat(b.wrong))).sort((x, y) => x.localeCompare(y));
              syn = opts.length < 2 ? sp.textContent : '{' + opts.map((o) => (o === b.answer ? '*' : '') + escFill(o)).join('|') + '}';
            }
            sp.replaceWith(document.createTextNode(syn));
          });
          return '    <p>' + c.innerHTML + '</p>';
        }
        c.querySelectorAll('[data-pm]').forEach((sp) => {
          const id = sp.dataset.pm;
          const used = this._steps.some((s) => s.target === id);
          if (!used) { sp.replaceWith(...sp.childNodes); return; }
          const n = document.createElement('span');
          n.id = p + '-' + id;
          while (sp.firstChild) n.appendChild(sp.firstChild);
          sp.replaceWith(n);
        });
        return '    <p id="' + p + '-' + line.dataset.line + '">' + c.innerHTML + '</p>';
      });
    }

    _playCode() {
      if (!this._lines().length) return '';
      const s = this._set, p = s.prefix;
      const attrs = [`frame="${esc(s.frame)}"`];
      if (s.title) attrs.push(`frame-title="${esc(s.title)}"`);
      attrs.push('step-mode="manual"');
      if (s.nextBy !== 'key') attrs.push(`next-by="${s.nextBy}"`);
      attrs.push(`font-size="${esc(s.fontSize)}"`);
      const fx = this._steps.map((st) => {
        const t = `target="#${p}-${st.target}"`;
        const start = st.start && st.start !== 'click' ? ` start="${st.start}"` : '';
        if (st.type === 'mark') return `<mark-fx ${t} kind="${st.kind}" color="${st.color}"${start}></mark-fx>`;
        if (st.type === 'swap') return `<swap-fx ${t} to="${esc(st.to)}"${st.mode !== 'strike' ? ` mode="${st.mode}"` : ''}${start}></swap-fx>`;
        if (st.type === 'stamp') return `<stamp-fx ${t} anchor="right" offset-x="100" color="${st.color}"${start}>${esc(st.text)}</stamp-fx>`;
        if (st.type === 'note') return `<note-fx ${t} position="bottom"${start}>${esc(st.text)}</note-fx>`;
        return `<show-fx ${t} effect="${st.effect || 'fade'}"${start}></show-fx>`;
      });
      return `<ui-play ${attrs.join(' ')}>\n  <stage-item>\n${this._stage(false).join('\n')}\n  </stage-item>\n` +
        `  <script-item>\n${fx.map((x) => '    ' + x).join('\n')}\n  </script-item>\n</ui-play>`;
    }

    _fillCode() {
      if (!this._lines().length) return '';
      const s = this._set, q = s.prefix + '-q';
      const mode = s.fillMode === 'text' ? ' mode="text" show-answer-on-wrong' : '';
      return `<ui-fillin${mode}>\n  <main-box source="${q}"></main-box>\n</ui-fillin>\n<div id="${q}">\n${this._stage(true).join('\n')}\n</div>`;
    }

    _showCode() {
      const code = this._tab === 'play' ? this._playCode() : this._fillCode();
      this._ref.code.textContent = code || '（還沒有內容）';
    }

    _preview() {
      const box = this._ref.prev;
      const code = this._tab === 'play' ? this._playCode() : this._fillCode();
      if (!code) { box.innerHTML = '<div class="pm-empty">加入內容後，這裡會即時預覽。</div>'; return; }
      const ready = this._tab === 'play' ? customElements.get('ui-play') : customElements.get('ui-fillin');
      box.innerHTML = code;
      if (!ready) box.insertAdjacentHTML('afterbegin', `<div class="pm-empty">頁面沒有載入 ${this._tab === 'play' ? 'ui-play.js' : 'ui-fillin.js'}，無法預覽，程式碼仍可複製。</div>`);
    }

    /* ---------------- 更新與草稿 ---------------- */
    _refresh() {
      if (!this._set) { this._set = { frame: 'plain', title: '', nextBy: 'key', fontSize: '1.375rem', prefix: 'pm', fillMode: 'choice' }; this._writeSettings(); }
      this._cleanup();
      this._renderSteps();
      this._showCode();
      clearTimeout(this._pt);
      this._pt = setTimeout(() => this._preview(), 250);
      this._save();
    }

    _save() {
      try {
        const lines = this._lines().map((l) => ({ id: l.dataset.line, html: l.querySelector('.pm-text').innerHTML }));
        localStorage.setItem(this._key, JSON.stringify({ seq: this._seq, lines, steps: this._steps, blanks: this._blanks, set: this._set }));
      } catch (e) { /* 無法儲存時略過 */ }
    }

    _load() {
      let d = null;
      try { d = JSON.parse(localStorage.getItem(this._key) || 'null'); } catch (e) { d = null; }
      if (!d) return;
      this._set = Object.assign({ frame: 'plain', title: '', nextBy: 'key', fontSize: '1.375rem', prefix: 'pm', fillMode: 'choice' }, d.set || {});
      this._writeSettings();
      (d.lines || []).forEach((l) => { const line = this._newLine(l.html); line.dataset.line = l.id; });
      this._seq = d.seq || 0;
      this._steps = d.steps || [];
      this._blanks = d.blanks || {};
    }
  }

  customElements.define('play-maker', PlayMaker);
})();
