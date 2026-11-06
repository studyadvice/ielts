/* ── 色名標籤 <c-blue>、<c-key> 等：所有元件共用同一份，頁面上只注入一次 ── */
(function () {
  'use strict';
  if (typeof document === 'undefined' || document.getElementById('ui-color-tags')) return;
  var COLORS = { shell:'#C6C7BD', vanilla:'#DBEDD8', yellow:'#E3D322', pink:'#FF91D7', red:'#EF6661', orange:'#FF5530', green:'#71CD76', blue:'#5DBAE8', indigo:'#778CE1', violet:'#B484E8', gray:'#86877F', key:'#51DBCF', 'key-deep':'#176878', calm:'#A3C4BC', quiet:'#A9B8E0', playful:'#FFA987', urgent:'#FF2E63' };
  var css = [];
  Object.keys(COLORS).forEach(function (k) { css.push('c-' + k + '{color:' + COLORS[k] + '}'); });
  var s = document.createElement('style'); s.id = 'ui-color-tags'; s.textContent = css.join('\n');
  (document.head || document.documentElement).appendChild(s);
  if (typeof window !== 'undefined' && !window.UiColorTags) { window.UiColorTags = { colors: COLORS }; }
})();

/**
 * mini-table.js：輕量表格，一行一列，用 | 分欄，專心輸入內容。
 *
 *   <mini-table head="Account | Region | Seats" align="l, l, r" pre-theme="clean">
 *     Northwind | EMEA | 1,200
 *     Globex    | EMEA | 860
 *   </mini-table>
 *
 * 屬性
 *   head          表頭，用 | 分欄；省略就沒有表頭
 *   head-source   表頭改從 template 或元素讀取（內容是一行 | 分欄文字），優先於 head
 *   source        內容改從 template 或元素讀取（一行一列），優先於標籤內的文字
 *   align         逐欄對齊，逗號分隔：l、c、r（或 left、center、right）；沒寫的欄位數字靠右、其他靠左
 *   col-widths    欄寬比例，例如 2:1:1
 *   pre-theme     預排外觀：clean（預設）、ledger、grid、banner、compact、bare、score、tiles、frame、side
 *   color         強調色，17 色色名或色碼，預設依外觀
 *   font-size     字級，例如 0.95rem
 *
 * 格子內可以寫 HTML（<b>、<c-key> 等）。格子裡要放 | 時寫成 \|。
 * 不使用 Shadow DOM；屬性只在載入時讀取一次，之後要重畫呼叫 el.render()。
 */
(() => {
  'use strict';
  if (customElements.get('mini-table')) return;

  const PALETTE = {
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7', red: '#EF6661',
    orange: '#FF5530', green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1', violet: '#B484E8',
    gray: '#86877F', key: '#51DBCF', 'key-deep': '#176878', calm: '#A3C4BC', quiet: '#A9B8E0',
    playful: '#FFA987', urgent: '#FF2E63'
  };
  const BG = '#0C0D0C';
  const LINE = '#2C2D2B';
  const THEMES = ['clean', 'ledger', 'grid', 'banner', 'compact', 'bare', 'score', 'tiles', 'frame', 'side'];
  /* 各外觀的預設強調色 */
  const THEME_COLOR = { clean: 'gray', ledger: 'blue', grid: 'shell', banner: 'key-deep', compact: 'gray', bare: 'key', score: 'key', tiles: 'gray', frame: 'key', side: 'indigo' };

  const color = v => (v ? (PALETTE[v.trim()] || v.trim()) : '');
  const onColor = v => (v && v.trim() === 'key-deep' ? '#FFFFFF' : BG);

  const STYLE_ID = 'mini-table-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
mini-table{display:block;--mt-c:${PALETTE.gray};--mt-on:${BG};--mt-line:${LINE};--mt-fs:1rem;color:${PALETTE.shell};}
mini-table table{width:100%;border-collapse:collapse;font-size:var(--mt-fs);line-height:1.5;}
mini-table th,mini-table td{padding:10px 12px;vertical-align:middle;text-align:left;}
mini-table th{font-weight:400;white-space:nowrap;}
mini-table .mt-l{text-align:left;}
mini-table .mt-c{text-align:center;}
mini-table .mt-r{text-align:right;font-variant-numeric:tabular-nums;}
mini-table .mt-empty{color:${PALETTE.gray};text-align:center;padding:16px 12px;}

/* clean：像資料卡片，灰色表頭，列與列之間一條細線 */
mini-table[data-theme="clean"] th{color:var(--mt-c);padding-top:4px;}
mini-table[data-theme="clean"] tr{border-bottom:1px solid var(--mt-line);}
mini-table[data-theme="clean"] tbody tr:last-child{border-bottom:0;}
mini-table[data-theme="clean"] th:first-child,mini-table[data-theme="clean"] td:first-child{padding-left:0;}
mini-table[data-theme="clean"] th:last-child,mini-table[data-theme="clean"] td:last-child{padding-right:0;}

/* ledger：帳本，表頭粗體加強調色底線，內容列交錯底色 */
mini-table[data-theme="ledger"] th{color:${PALETTE.vanilla};font-weight:700;border-bottom:2px solid var(--mt-c);}
mini-table[data-theme="ledger"] tbody tr:nth-child(odd){background:#161716;}
mini-table[data-theme="ledger"] tbody tr:nth-child(even){background:#1D1E1C;}

/* grid：每一格都有框線；框線用強調色調暗，深色底上也看得清楚 */
mini-table[data-theme="grid"]{--mt-gl:color-mix(in srgb, var(--mt-c) 55%, ${BG});}
mini-table[data-theme="grid"] th,mini-table[data-theme="grid"] td{border:1px solid var(--mt-gl, #6E6F68);}
mini-table[data-theme="grid"] th{color:${PALETTE.vanilla};font-weight:700;background:#1F201E;}

/* banner：表頭是實心色帶 */
mini-table[data-theme="banner"] th{background:var(--mt-c);color:var(--mt-on);font-weight:700;}
mini-table[data-theme="banner"] tbody tr{border-bottom:1px solid var(--mt-line);}

/* compact：緊湊，小字，虛線分隔 */
mini-table[data-theme="compact"] table{font-size:calc(var(--mt-fs) * 0.88);}
mini-table[data-theme="compact"] th,mini-table[data-theme="compact"] td{padding:5px 8px;}
mini-table[data-theme="compact"] th{color:var(--mt-c);}
mini-table[data-theme="compact"] tr{border-bottom:1px dashed var(--mt-line);}
mini-table[data-theme="compact"] tbody tr:last-child{border-bottom:0;}

/* bare：沒有線，表頭用強調色 */
mini-table[data-theme="bare"] th{color:var(--mt-c);font-weight:700;}
mini-table[data-theme="bare"] td{padding-top:6px;padding-bottom:6px;}

/* score：第一欄強調色粗體，數字欄放大，適合排名與分數 */
mini-table[data-theme="score"] th{color:${PALETTE.gray};}
mini-table[data-theme="score"] tr{border-bottom:1px solid var(--mt-line);}
mini-table[data-theme="score"] tbody tr:last-child{border-bottom:0;}
mini-table[data-theme="score"] td:first-child{color:var(--mt-c);font-weight:700;}
mini-table[data-theme="score"] td.mt-num{font-size:1.25em;font-weight:700;color:${PALETTE.vanilla};}

/* tiles：每一列是一塊圓角色塊，列與列之間留空隙 */
mini-table[data-theme="tiles"] table{border-collapse:separate;border-spacing:0 6px;margin:-6px 0;}
mini-table[data-theme="tiles"] th{color:var(--mt-c);padding-bottom:2px;}
mini-table[data-theme="tiles"] td{background:#1A1B19;}
mini-table[data-theme="tiles"] td:first-child{border-radius:8px 0 0 8px;}
mini-table[data-theme="tiles"] td:last-child{border-radius:0 8px 8px 0;}
mini-table[data-theme="tiles"] td:only-child{border-radius:8px;}

/* frame：圓角外框用強調色，表頭下方一條強調色線，內容列細線分隔 */
mini-table[data-theme="frame"] table{border-collapse:separate;border-spacing:0;border:1px solid var(--mt-c);border-radius:10px;overflow:hidden;}
mini-table[data-theme="frame"] th{color:var(--mt-c);font-weight:700;background:#161716;border-bottom:1px solid var(--mt-c);}
mini-table[data-theme="frame"] tbody tr + tr td{border-top:1px solid var(--mt-line);}

/* side：第一欄是實心色帶，適合「項目 | 說明」的對照表 */
mini-table[data-theme="side"] th{color:${PALETTE.gray};}
mini-table[data-theme="side"] tr{border-bottom:1px solid var(--mt-line);}
mini-table[data-theme="side"] tbody tr:last-child{border-bottom:0;}
mini-table[data-theme="side"] td:first-child{background:var(--mt-c);color:var(--mt-on);font-weight:700;}
mini-table[data-theme="side"] tbody tr + tr td:first-child{border-top:1px solid ${BG};}
`;
    (document.head || document.documentElement).appendChild(s);
  }

  /* 依 | 切欄；\| 視為文字；容許 markdown 式的頭尾 | */
  function splitRow(line) {
    const MARK = '\u0000';
    let t = line.replace(/\\\|/g, MARK).trim();
    if (t.startsWith('|')) t = t.slice(1);
    if (t.endsWith('|')) t = t.slice(0, -1);
    return t.split('|').map(c => c.replace(new RegExp(MARK, 'g'), '|').trim());
  }
  function textOf(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || '').trim();
  }
  const isNum = html => /^[-+]?[$€£¥NT]*\s?[\d,.]+\s?(%|k|K|M|萬|億)?$/.test(textOf(html)) && /\d/.test(textOf(html));
  function readSource(id, who) {
    const src = id && document.getElementById(id);
    if (!src) { console.error('[mini-table] ' + who + ' 找不到 id="' + id + '" 的元素。'); return null; }
    return src.tagName === 'TEMPLATE' ? src.innerHTML : src.innerHTML;
  }
  function parseAlign(v) {
    if (!v) return [];
    return v.split(/[,\s]+/).filter(Boolean).map(a => {
      a = a.toLowerCase();
      if (a === 'l' || a === 'left') return 'l';
      if (a === 'c' || a === 'center') return 'c';
      if (a === 'r' || a === 'right') return 'r';
      console.warn('[mini-table] align 的值「' + a + '」看不懂，請用 l、c、r，已改用自動判斷。');
      return '';
    });
  }

  class MiniTable extends HTMLElement {
    connectedCallback() {
      if (this._raw == null) {
        this._raw = this.innerHTML;   /* 第一次接上時保存原始文字；之後被搬移也不會重複解析 */
        injectStyle();
        this.render();
      }
    }

    render() {
      const g = n => this.getAttribute(n);
      const theme = (g('pre-theme') || 'clean').trim();
      if (!THEMES.includes(theme)) console.warn('[mini-table] pre-theme="' + theme + '" 不存在，可用：' + THEMES.join('、') + '，已改用 clean。');
      const th = THEMES.includes(theme) ? theme : 'clean';
      this.setAttribute('data-theme', th);
      const cName = g('color') || THEME_COLOR[th];
      this.style.setProperty('--mt-c', color(cName));
      this.style.setProperty('--mt-on', onColor(cName));
      if (g('font-size')) this.style.setProperty('--mt-fs', g('font-size'));

      /* 表頭與內容 */
      let headLine = g('head') || '';
      if (g('head-source')) {
        const h = readSource(g('head-source'), 'head-source');
        if (h != null) headLine = h.split('\n').map(s => s.trim()).filter(Boolean)[0] || '';
      }
      let bodyText = this._raw;
      if (g('source')) {
        const b = readSource(g('source'), 'source');
        if (b != null) bodyText = b;
      }
      const head = headLine ? splitRow(headLine) : null;
      const rows = bodyText.split('\n').map(s => s.trim()).filter(Boolean).map(splitRow);
      const n = Math.max(head ? head.length : 0, ...rows.map(r => r.length), 1);
      rows.forEach((r, i) => {
        if (r.length !== n) console.warn('[mini-table] 第 ' + (i + 1) + ' 列有 ' + r.length + ' 欄，其他列有 ' + n + ' 欄，已用空白補齊。');
        while (r.length < n) r.push('');
      });
      if (head) while (head.length < n) head.push('');

      /* 對齊：有寫的照寫，沒寫的欄位看內容，全部是數字就靠右 */
      const al = parseAlign(g('align'));
      const align = [];
      const numCol = [];
      for (let i = 0; i < n; i++) {
        const cells = rows.map(r => r[i]).filter(x => textOf(x) !== '');
        numCol[i] = cells.length > 0 && cells.every(isNum);
        align[i] = al[i] || (numCol[i] ? 'r' : 'l');
      }

      /* 欄寬 */
      let colgroup = '';
      const cw = (g('col-widths') || '').split(':').map(x => parseFloat(x)).filter(x => x > 0);
      if (cw.length) {
        if (cw.length !== n) console.warn('[mini-table] col-widths 有 ' + cw.length + ' 個數字，但表格有 ' + n + ' 欄，已忽略欄寬。');
        else {
          const sum = cw.reduce((a, b) => a + b, 0);
          colgroup = '<colgroup>' + cw.map(x => '<col style="width:' + (x / sum * 100).toFixed(3) + '%">').join('') + '</colgroup>';
        }
      }

      const cls = i => 'mt-' + align[i] + (numCol[i] ? ' mt-num' : '');
      let html = '<table>' + colgroup;
      if (head) html += '<thead><tr>' + head.map((h, i) => '<th class="' + cls(i) + '">' + h + '</th>').join('') + '</tr></thead>';
      html += '<tbody>';
      if (!rows.length) html += '<tr><td class="mt-empty" colspan="' + n + '">（沒有資料）</td></tr>';
      rows.forEach(r => { html += '<tr>' + r.map((c, i) => '<td class="' + cls(i) + '">' + c + '</td>').join('') + '</tr>'; });
      html += '</tbody></table>';
      this.innerHTML = html;
    }
  }

  customElements.define('mini-table', MiniTable);
  window.MiniTable = { themes: THEMES.slice() };
})();
