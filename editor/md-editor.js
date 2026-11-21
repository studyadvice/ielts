/* =========================================================================
 * <md-editor> Markdown 輸入框（Write / Preview 分頁 + 工具列）
 *
 * <md-editor id="ed" name="我" placeholder="Use Markdown to format your comment"></md-editor>
 *
 * - 沒有 Shadow DOM，CSS 由本檔注入，不需要其他函式庫。
 * - 送出（按鈕或 Ctrl/Cmd + Enter）發出 md-submit，detail 為 { markdown, value, html, text, name }。
 * - 搭配 <link-when do="feed"> 可把送出的內容送進 ui-post、ui-stream，或填進 ui-play 的 template。
 * - 預覽的 HTML 由本檔自己轉換，原始輸入一律先跳脫，不會把使用者輸入的標籤執行出來。
 * - 標記為 chart 的程式碼區塊會轉成 <ui-chart>（需載入 ui-charts.js）；解析好的資料放在 detail.charts。
 * ========================================================================= */
(function () {
  'use strict';
  if (customElements.get('md-editor')) return;

  const PALETTE = {
    background: '#0C0D0C', base: '#0C0D0C', 'bg-alternative': '#2D2D2D', shell: '#C6C7BD', vanilla: '#DBEDD8',
    yellow: '#E3D322', pink: '#FF91D7', red: '#EF6661', green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1',
    violet: '#B484E8', gray: '#86877F', key: '#51DBCF', calm: '#A3C4BC', quiet: '#8EA4DE', playful: '#FFA987',
    urgent: '#FF2E63', energetic: '#B6FF00', dreamy: '#C394CD', salmon: '#FFC88A'
  };
  const color = (v, d) => { const t = (v || '').trim(); return t ? (PALETTE[t.toLowerCase()] || t) : d; };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const bool = (v, d) => (v === null || v === undefined ? d : String(v).trim().toLowerCase() !== 'false');
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* ---------- Markdown → HTML ---------- */
  const safeUrl = (u) => (/^(https?:\/\/|mailto:|#|\/|\.\.?\/)/i.test(u) ? u : '');
  const LI = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
  const FENCE = /^\s{0,3}(`{3,}|~{3,})\s*([\w+#.-]*)\s*$/;
  const HEAD = /^\s{0,3}(#{1,6})\s+(.*\S)\s*$/;
  const HR = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
  const QUOTE = /^\s{0,3}>/;

  function inline(src) {
    const stash = [];
    const hold = (h) => '\u0000' + (stash.push(h) - 1) + '\u0000';
    const restore = (t) => { for (let i = 0; i < 4 && t.indexOf('\u0000') !== -1; i++) t = t.replace(/\u0000(\d+)\u0000/g, (m, k) => stash[k]); return t; };
    const emph = (t) => t
      .replace(/\*\*([^\s*](?:[^*]*[^\s*])?)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^\s_](?:[^_]*[^\s_])?)__/g, '<strong>$1</strong>')
      .replace(/~~([^\s~](?:[^~]*[^\s~])?)~~/g, '<del>$1</del>')
      .replace(/(^|[^\w*])\*([^\s*](?:[^*]*[^\s*])?)\*(?![\w*])/g, '$1<em>$2</em>')
      .replace(/(^|[^\w])_([^\s_](?:[^_]*[^\s_])?)_(?!\w)/g, '$1<em>$2</em>')
      .replace(/(^|[^\w@])@([A-Za-z0-9][A-Za-z0-9_-]{0,38})/g, '$1<span class="mde-mention">@$2</span>')
      .replace(/(^|[^\w&])#(\d+)(?!\w)/g, '$1<span class="mde-ref">#$2</span>');

    let s = String(src);
    s = s.replace(/`([^`\n]+)`/g, (m, c) => hold('<code>' + esc(c) + '</code>'));
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
      const u = safeUrl(url);
      return u ? hold('<img src="' + esc(u) + '" alt="' + esc(alt) + '">') : m;
    });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
      const u = safeUrl(url);
      return u ? hold('<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + emph(esc(label)) + '</a>') : m;
    });
    s = s.replace(/\bhttps?:\/\/[^\s<]*[^\s<.,;:!?)\]'"]/g, (u) => hold('<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(u) + '</a>'));
    return restore(emph(esc(s)));
  }

  /* ```chart 區塊：key: value 設定列加上「標籤: 數值, 數值」資料列，轉成 <ui-chart>。
     設定列只認下面這些鍵，其餘都當資料列。 */
  const CHART_KEYS = ['type', 'title', 'series', 'unit', 'prefix', 'decimals', 'legend', 'y-min', 'y-max', 'y-step', 'grid', 'show-values',
    'show-percent', 'x-title', 'y-title', 'hole', 'start-angle', 'center', 'height', 'vary', 'markers', 'sort', 'theme', 'ramp', 'normalize', 'bar-gap'];
  function parseChart(lines) {
    const opts = {};
    const rows = [];
    lines.forEach((ln) => {
      const m = ln.match(/^\s*([^:：]+?)\s*[:：]\s*(.*?)\s*$/);
      if (!m) return;
      const k = m[1].toLowerCase();
      if (CHART_KEYS.indexOf(k) !== -1) { opts[k] = m[2]; return; }
      rows.push({ label: m[1], values: m[2].split(/[,，]/).map((x) => { const n = parseFloat(x.replace(/%/g, '')); return Number.isFinite(n) ? n : null; }) });
    });
    if (!rows.length) return null;
    return { opts, rows };
  }
  function chartHtml(c) {
    const attrs = Object.keys(c.opts).map((k) => ' ' + k + '="' + esc(c.opts[k]) + '"').join('');
    const rows = c.rows.map((r) => '<chart-row label="' + esc(r.label) + '" values="' + r.values.map((v) => (v == null ? '' : v)).join(',') + '"></chart-row>').join('');
    return '<ui-chart' + attrs + '>' + rows + '</ui-chart>';
  }

  const isBlockStart = (l) => FENCE.test(l) || HEAD.test(l) || HR.test(l) || QUOTE.test(l) || LI.test(l);

  function listHtml(buf, charts) {
    const indentOf = (l) => l.match(/^(\s*)/)[1].length;
    const base = indentOf(buf[0]);
    const ordered = /^\s*\d/.test(buf[0]);
    const items = [];
    buf.forEach((l) => {
      const m = l.match(LI);
      if (m && indentOf(l) <= base + 1) items.push({ first: m[3], kids: [] });
      else if (items.length) items[items.length - 1].kids.push(l);
    });
    const start = ordered ? parseInt(buf[0].match(/\d+/)[0], 10) : 1;
    const li = items.map((it) => {
      const t = it.first.match(/^\[([ xX])\]\s+(.*)$/);
      const head = t
        ? '<input type="checkbox" disabled' + (t[1] === ' ' ? '' : ' checked') + '> ' + inline(t[2])
        : inline(it.first);
      const kids = it.kids.length ? blocksHtml(it.kids, charts) : '';
      return '<li' + (t ? ' class="mde-task"' : '') + '>' + head + kids + '</li>';
    }).join('');
    return ordered
      ? '<ol' + (start !== 1 ? ' start="' + start + '"' : '') + '>' + li + '</ol>'
      : '<ul>' + li + '</ul>';
  }

  function blocksHtml(lines, charts) {
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const ln = lines[i];
      if (!ln.trim()) { i++; continue; }
      let m = ln.match(FENCE);
      if (m) {
        const fence = m[1];
        const close = new RegExp('^\\s{0,3}' + (fence[0] === '`' ? '`' : '~') + '{' + fence.length + ',}\\s*$');
        const buf = [];
        i++;
        while (i < lines.length && !close.test(lines[i])) buf.push(lines[i++]);
        i++;
        if (m[2].toLowerCase() === 'chart') {
          const c = parseChart(buf);
          if (c) {
            out.push(chartHtml(c));
            if (charts) charts.push(Object.assign({}, c.opts, { rows: c.rows.map((r) => ({ label: r.label, values: r.values.slice() })) }));
            continue;
          }
        }
        out.push('<pre><code' + (m[2] ? ' class="lang-' + esc(m[2]) + '"' : '') + '>' + esc(buf.join('\n')) + '</code></pre>');
        continue;
      }
      m = ln.match(HEAD);
      if (m) { out.push('<h' + m[1].length + '>' + inline(m[2]) + '</h' + m[1].length + '>'); i++; continue; }
      if (HR.test(ln)) { out.push('<hr>'); i++; continue; }
      if (QUOTE.test(ln)) {
        const buf = [];
        while (i < lines.length && QUOTE.test(lines[i])) buf.push(lines[i++].replace(/^\s{0,3}>\s?/, ''));
        out.push('<blockquote>' + blocksHtml(buf, charts) + '</blockquote>');
        continue;
      }
      if (LI.test(ln)) {
        const buf = [];
        while (i < lines.length && (LI.test(lines[i]) || /^\s+\S/.test(lines[i]))) buf.push(lines[i++]);
        out.push(listHtml(buf, charts));
        continue;
      }
      const buf = [ln];
      i++;
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++]);
      out.push('<p>' + inline(buf.join('\n')).replace(/\n/g, '<br>') + '</p>');
    }
    return out.join('');
  }

  const render = (md, charts) => blocksHtml(String(md == null ? '' : md).replace(/\r\n?/g, '\n').split('\n'), charts);

  function toText(html) {
    const t = html.replace(/<\/(p|li|h[1-6]|blockquote|pre)>|<br\s*\/?>/gi, '\n');
    const doc = new DOMParser().parseFromString(t, 'text/html');
    return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
  }

  /* ---------- 樣式 ---------- */
  const STYLE_ID = 'md-editor-style';
  const CSS = `
md-editor{display:block;max-width:var(--mde-w,100%);color:var(--mde-text);font-size:var(--mde-fs,1rem);line-height:1.5;font-family:"Segoe UI","Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif;}
md-editor[hidden]{display:none !important;}
md-editor *{box-sizing:border-box;}
md-editor .mde-box{background:var(--mde-panel);border:1px solid var(--mde-border);border-radius:8px;overflow:hidden;}
md-editor .mde-head{display:flex;flex-wrap:wrap;align-items:flex-end;column-gap:12px;padding:8px 8px 0 8px;border-bottom:1px solid var(--mde-border);}
md-editor .mde-tabs{display:flex;align-items:flex-end;}
md-editor .mde-tab{appearance:none;background:transparent;border:1px solid transparent;border-bottom:0;border-radius:6px 6px 0 0;color:var(--mde-muted);cursor:pointer;font:inherit;font-size:0.95rem;margin:0 0 -1px 0;padding:8px 16px 9px 16px;}
md-editor .mde-tab:hover{color:var(--mde-text);}
md-editor .mde-tab.on{background:var(--mde-panel);border-color:var(--mde-border);border-bottom:1px solid var(--mde-panel);color:var(--mde-active);cursor:default;}
md-editor .mde-tools{display:flex;flex-wrap:wrap;align-items:center;gap:2px;padding:0 0 6px 0;}
md-editor.mde-previewing .mde-tools{visibility:hidden;}
md-editor .mde-tool{appearance:none;align-items:center;background:transparent;border:0;border-radius:6px;color:var(--mde-tool);cursor:pointer;display:inline-flex;font:inherit;height:32px;justify-content:center;padding:0;width:34px;}
md-editor .mde-tool:hover:not(:disabled){background:var(--mde-border);color:var(--mde-active);}
md-editor .mde-tool:disabled,md-editor .mde-tool.mde-off{color:var(--mde-border);cursor:default;}
md-editor .mde-tool .mde-glyph{font-size:1.05rem;font-weight:700;line-height:1;}
md-editor .mde-tool .mde-serif{font-family:Georgia,"Times New Roman",serif;font-weight:400;}
md-editor .mde-sep{background:var(--mde-border);flex:0 0 1px;height:20px;margin:0 8px;}
md-editor .mde-body{padding:16px;}
md-editor .mde-ta{background:var(--mde-bg);border:1px solid var(--mde-border);border-radius:6px;color:var(--mde-text);display:block;font:inherit;line-height:1.6;margin:0;min-height:var(--mde-minh,160px);outline:0;padding:10px 12px;resize:vertical;width:100%;}
md-editor .mde-ta[hidden]{display:none;}
md-editor .mde-ta::placeholder{color:var(--mde-muted);}
md-editor .mde-ta:focus{border-color:var(--mde-accent);box-shadow:0 0 0 1px var(--mde-accent);}
md-editor.mde-err .mde-ta{border-color:var(--mde-err);box-shadow:0 0 0 1px var(--mde-err);}
md-editor .mde-prev{background:var(--mde-bg);border:1px solid var(--mde-border);border-radius:6px;min-height:var(--mde-minh,160px);overflow:auto;padding:10px 12px;}
md-editor .mde-prev[hidden]{display:none;}
md-editor .mde-empty{color:var(--mde-muted);}
md-editor .mde-prev > :first-child{margin-top:0;}
md-editor .mde-prev > :last-child{margin-bottom:0;}
md-editor .mde-prev h1,md-editor .mde-prev h2,md-editor .mde-prev h3,md-editor .mde-prev h4,md-editor .mde-prev h5,md-editor .mde-prev h6{color:var(--mde-active);font-weight:700;line-height:1.3;margin:16px 0 8px 0;}
md-editor .mde-prev h1{font-size:1.6rem;}
md-editor .mde-prev h2{font-size:1.4rem;}
md-editor .mde-prev h3{font-size:1.2rem;}
md-editor .mde-prev h4{font-size:1.1rem;}
md-editor .mde-prev h5,md-editor .mde-prev h6{font-size:1rem;}
md-editor .mde-prev p{margin:0 0 12px 0;}
md-editor .mde-prev a{color:var(--mde-link);}
md-editor .mde-prev code{background:var(--mde-panel);border-radius:4px;color:var(--mde-code);font-family:Consolas,"SFMono-Regular",Menlo,monospace;font-size:0.9em;padding:2px 6px;}
md-editor .mde-prev pre{background:var(--mde-panel);border-radius:6px;margin:0 0 12px 0;overflow:auto;padding:12px;}
md-editor .mde-prev pre code{background:none;color:var(--mde-text);padding:0;}
md-editor .mde-prev blockquote{border-left:4px solid var(--mde-muted);color:var(--mde-muted);margin:0 0 12px 0;padding:0 0 0 12px;}
md-editor .mde-prev blockquote > :last-child{margin-bottom:0;}
md-editor .mde-prev ul,md-editor .mde-prev ol{margin:0 0 12px 0;padding:0 0 0 24px;}
md-editor .mde-prev li > ul,md-editor .mde-prev li > ol{margin:4px 0 0 0;}
md-editor .mde-prev li.mde-task{list-style:none;margin-left:-20px;}
md-editor .mde-prev li.mde-task input{accent-color:var(--mde-accent);margin:0 6px 0 0;vertical-align:-1px;}
md-editor .mde-prev hr{border:0;border-top:1px solid var(--mde-border);margin:16px 0;}
md-editor .mde-prev img{max-width:100%;}
md-editor .mde-prev ui-chart{margin:0 0 12px 0;}
md-editor .mde-prev .mde-mention{color:var(--mde-accent);font-weight:600;}
md-editor .mde-prev .mde-ref{color:var(--mde-link);}
md-editor .mde-foot{align-items:center;display:flex;gap:12px;justify-content:flex-end;padding:0 16px 16px 16px;}
md-editor .mde-hint{color:var(--mde-muted);font-size:0.8rem;margin-right:auto;}
md-editor .mde-send{appearance:none;background:var(--mde-send);border:0;border-radius:6px;color:var(--mde-bg);cursor:pointer;font:inherit;font-size:0.95rem;font-weight:700;padding:7px 18px;}
md-editor .mde-send:hover:not(:disabled){background:var(--mde-accent);}
md-editor .mde-send:disabled{background:var(--mde-border);color:var(--mde-muted);cursor:not-allowed;}
md-editor[disabled] .mde-ta{color:var(--mde-muted);}
`;
  function injectStyle() {
    if (document.getElementById(STYLE_ID) || !document.head) return;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- 工具列 ---------- */
  const svg = (d) => '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const TOOLS = {
    heading: { tip: 'Heading', icon: '<b class="mde-glyph">H</b>' },
    bold: { tip: 'Bold (Ctrl+B)', icon: '<b class="mde-glyph">B</b>' },
    italic: { tip: 'Italic (Ctrl+I)', icon: '<i class="mde-glyph mde-serif">I</i>' },
    quote: { tip: 'Quote', icon: svg('<path d="M2.5 3v10M6 4h8M6 8h8M6 12h5"/>') },
    code: { tip: 'Code', icon: svg('<path d="M5 4L1.5 8 5 12M11 4l3.5 4L11 12"/>') },
    link: { tip: 'Link (Ctrl+K)', icon: svg('<path d="M6.8 9.2a2.6 2.6 0 0 0 3.7 0l2.2-2.2a2.6 2.6 0 0 0-3.7-3.7l-.8.8M9.2 6.8a2.6 2.6 0 0 0-3.7 0L3.3 9a2.6 2.6 0 0 0 3.7 3.7l.8-.8"/>') },
    ul: { tip: 'Bulleted list', icon: svg('<circle cx="2.5" cy="4" r=".9" fill="currentColor" stroke="none"/><circle cx="2.5" cy="8" r=".9" fill="currentColor" stroke="none"/><circle cx="2.5" cy="12" r=".9" fill="currentColor" stroke="none"/><path d="M6 4h8M6 8h8M6 12h8"/>') },
    ol: { tip: 'Numbered list', icon: svg('<text x="1" y="5.4" font-size="5" fill="currentColor" stroke="none" font-family="Arial,sans-serif">1</text><text x="1" y="9.4" font-size="5" fill="currentColor" stroke="none" font-family="Arial,sans-serif">2</text><text x="1" y="13.4" font-size="5" fill="currentColor" stroke="none" font-family="Arial,sans-serif">3</text><path d="M6 4h8M6 8h8M6 12h8"/>') },
    task: { tip: 'Task list', icon: svg('<rect x="1.5" y="2" width="4" height="4" rx=".8"/><path d="M2.4 4l.8.8 1.4-1.6M8 4h6"/><rect x="1.5" y="9" width="4" height="4" rx=".8"/><path d="M8 11h6"/>') },
    mention: { tip: 'Mention (@)', icon: '<b class="mde-glyph">@</b>' },
    ref: { tip: 'Reference (#)', icon: svg('<path d="M6.5 2.5h-3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3M9 2.5h4.5V7M13.5 2.5L7 9"/>') },
    slash: { tip: 'Slash (/)', icon: svg('<rect x="1.5" y="1.5" width="13" height="13" rx="2"/><path d="M10 5L6 11"/>') },
    undo: { tip: 'Undo (Ctrl+Z)', icon: svg('<path d="M5.5 3L2.5 6l3 3M2.5 6H9a4 4 0 0 1 0 8H6"/>') },
    redo: { tip: 'Redo (Ctrl+Y)', icon: svg('<path d="M10.5 3l3 3-3 3M13.5 6H7a4 4 0 0 0 0 8h3"/>') }
  };
  const DEFAULT_TOOLS = 'heading,bold,italic,quote,code,link,|,ul,ol,task,|,mention,ref,slash,undo';

  /* ---------- 編輯動作：輸入 (value, s, e)，回傳 { value, s, e } ---------- */
  const wrap = (marker) => (v, s, e) => {
    const m = marker.length;
    const sel = v.slice(s, e);
    if (s >= m && v.slice(s - m, s) === marker && v.slice(e, e + m) === marker) {
      return { value: v.slice(0, s - m) + sel + v.slice(e + m), s: s - m, e: e - m };
    }
    if (sel.length >= 2 * m && sel.startsWith(marker) && sel.endsWith(marker)) {
      const inner = sel.slice(m, sel.length - m);
      return { value: v.slice(0, s) + inner + v.slice(e), s, e: s + inner.length };
    }
    return { value: v.slice(0, s) + marker + sel + marker + v.slice(e), s: s + m, e: e + m };
  };

  const LIST_STRIP = /^(\s*)([-*+]|\d+[.)])\s+(\[[ xX]\]\s+)?/;
  const PREFIX = {
    heading: { has: (l) => /^#{1,6}\s+/.test(l), strip: (l) => l.replace(/^#{1,6}\s+/, ''), add: () => '### ' },
    quote: { has: (l) => /^>\s?/.test(l), strip: (l) => l.replace(/^>\s?/, ''), add: () => '> ' },
    ul: { has: (l) => /^\s*[-*+]\s+(?!\[[ xX]\])/.test(l), strip: (l) => l.replace(LIST_STRIP, '$1'), add: () => '- ' },
    ol: { has: (l) => /^\s*\d+[.)]\s+/.test(l), strip: (l) => l.replace(LIST_STRIP, '$1'), add: (n) => n + '. ' },
    task: { has: (l) => /^\s*[-*+]\s+\[[ xX]\]\s+/.test(l), strip: (l) => l.replace(LIST_STRIP, '$1'), add: () => '- [ ] ' }
  };
  const linePrefix = (kind) => (v, s, e) => {
    const P = PREFIX[kind];
    const ls = v.lastIndexOf('\n', s - 1) + 1;
    let le = e > s && v[e - 1] === '\n' ? e - 1 : v.indexOf('\n', e);
    if (le < 0) le = v.length;
    const lines = v.slice(ls, le).split('\n');
    const filled = lines.filter((l) => l.trim());
    const target = filled.length ? filled : lines;
    const removing = target.every((l) => P.has(l));
    let n = 0;
    const out = lines.map((l) => {
      if (filled.length && !l.trim()) return l;
      if (removing) return P.strip(l);
      n++;
      const ind = kind === 'heading' || kind === 'quote' ? '' : l.match(/^(\s*)/)[1];
      const body = kind === 'heading' || kind === 'quote' ? P.strip(l) : P.strip(l).replace(/^\s*/, '');
      return ind + P.add(n) + body;
    });
    const block = out.join('\n');
    const value = v.slice(0, ls) + block + v.slice(le);
    if (s === e) {
      const delta = block.length - (le - ls);
      return { value, s: Math.max(ls, s + delta), e: Math.max(ls, e + delta) };
    }
    return { value, s: ls, e: ls + block.length };
  };

  const codeEdit = (v, s, e) => {
    const sel = v.slice(s, e);
    if (sel.indexOf('\n') === -1) return wrap('`')(v, s, e);
    const pre = s > 0 && v[s - 1] !== '\n' ? '\n' : '';
    const ins = pre + '```\n' + sel + '\n```';
    return { value: v.slice(0, s) + ins + v.slice(e), s: s + pre.length + 4, e: s + pre.length + 4 + sel.length };
  };

  const linkEdit = (v, s, e) => {
    const sel = v.slice(s, e);
    if (/^https?:\/\/\S+$/.test(sel)) {
      return { value: v.slice(0, s) + '[](' + sel + ')' + v.slice(e), s: s + 1, e: s + 1 };
    }
    const ins = '[' + sel + '](url)';
    const us = s + sel.length + 3;
    return sel
      ? { value: v.slice(0, s) + ins + v.slice(e), s: us, e: us + 3 }
      : { value: v.slice(0, s) + ins + v.slice(e), s: s + 1, e: s + 1 };
  };

  const insertChar = (ch) => (v, s, e) => {
    const lead = s > 0 && !/\s/.test(v[s - 1]) ? ' ' : '';
    const ins = lead + ch;
    return { value: v.slice(0, s) + ins + v.slice(s), s: s + ins.length + (e - s), e: s + ins.length + (e - s) };
  };

  const ACTIONS = {
    heading: linePrefix('heading'),
    bold: wrap('**'),
    italic: wrap('_'),
    quote: linePrefix('quote'),
    code: codeEdit,
    link: linkEdit,
    ul: linePrefix('ul'),
    ol: linePrefix('ol'),
    task: linePrefix('task'),
    mention: insertChar('@'),
    ref: insertChar('#'),
    slash: insertChar('/')
  };

  /* ---------- 元件 ---------- */
  class MdEditor extends HTMLElement {
    static get observedAttributes() { return ['disabled', 'placeholder']; }

    attributeChangedCallback(name) {
      if (!this._ta) return;
      if (name === 'disabled') this._applyDisabled();
      if (name === 'placeholder') this._ta.placeholder = this.getAttribute('placeholder') || '';
    }

    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      injectStyle();
      this._build();
    }

    _attr(n, d) { const v = this.getAttribute(n); return v === null ? d : v; }

    _build() {
      const initial = this.hasAttribute('value') ? this.getAttribute('value') : this.textContent.replace(/^\n+|\s+$/g, '');
      this.textContent = '';
      this.style.setProperty('--mde-bg', color(this._attr('bg', 'background')));
      this.style.setProperty('--mde-panel', color(this._attr('panel', 'rgb(36,36,36)')));
      this.style.setProperty('--mde-border', color(this._attr('border-color', 'bg-alternative')));
      this.style.setProperty('--mde-text', color(this._attr('text-color', 'shell')));
      this.style.setProperty('--mde-active', color(this._attr('active-color', 'vanilla')));
      this.style.setProperty('--mde-muted', color(this._attr('muted-color', 'gray')));
      this.style.setProperty('--mde-tool', color(this._attr('tool-color', 'gray')));
      this.style.setProperty('--mde-accent', color(this._attr('accent', 'key')));
      this.style.setProperty('--mde-link', color(this._attr('link-color', 'blue')));
      this.style.setProperty('--mde-code', color(this._attr('code-color', 'pink')));
      this.style.setProperty('--mde-err', color(this._attr('error-color', 'red')));
      this.style.setProperty('--mde-send', color(this._attr('submit-color', 'green')));
      const w = this._attr('width', '');
      if (w) this.style.setProperty('--mde-w', /^\d+(\.\d+)?$/.test(w) ? w + 'px' : w);
      const fs = this._attr('font-size', '');
      if (fs) this.style.setProperty('--mde-fs', /^\d*\.?\d+$/.test(fs) ? fs + 'rem' : fs);
      const rows = num(this._attr('rows', '7'), 7);
      this.style.setProperty('--mde-minh', Math.round(rows * 1.6 * 16 + 22) + 'px');

      this._labels = {
        write: this._attr('label-write', 'Write'),
        preview: this._attr('label-preview', 'Preview'),
        empty: this._attr('label-empty', 'Nothing to preview'),
        submit: this._attr('label-submit', 'Comment')
      };
      this._required = bool(this.getAttribute('required'), true);
      this._clear = bool(this.getAttribute('clear'), true);
      const tips = bool(this.getAttribute('tips'), true);

      const box = document.createElement('div');
      box.className = 'mde-box';

      const head = document.createElement('div');
      head.className = 'mde-head';
      const tabs = document.createElement('div');
      tabs.className = 'mde-tabs';
      this._tabs = {};
      [['write', this._labels.write], ['preview', this._labels.preview]].forEach(([k, label]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'mde-tab';
        b.textContent = label;
        b.addEventListener('click', () => this.setTab(k));
        tabs.appendChild(b);
        this._tabs[k] = b;
      });
      head.appendChild(tabs);

      const tools = document.createElement('div');
      tools.className = 'mde-tools';
      this._toolBtns = {};
      this._attr('tools', DEFAULT_TOOLS).split(',').map((x) => x.trim()).filter(Boolean).forEach((key) => {
        if (key === '|') { const sp = document.createElement('span'); sp.className = 'mde-sep'; tools.appendChild(sp); return; }
        const def = TOOLS[key];
        if (!def) { console.warn('[md-editor] 沒有工具「' + key + '」。'); return; }
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'mde-tool';
        b.dataset.tool = key;
        if (tips) b.title = def.tip;
        b.innerHTML = def.icon;
        b.addEventListener('mousedown', (ev) => ev.preventDefault());
        b.addEventListener('click', () => this._tool(key));
        tools.appendChild(b);
        this._toolBtns[key] = b;
      });
      head.appendChild(tools);
      box.appendChild(head);

      const body = document.createElement('div');
      body.className = 'mde-body';
      const ta = document.createElement('textarea');
      ta.className = 'mde-ta';
      ta.placeholder = this._attr('placeholder', 'Use Markdown to format your comment');
      ta.spellcheck = bool(this.getAttribute('spellcheck'), true);
      ta.value = initial;
      const prev = document.createElement('div');
      prev.className = 'mde-prev';
      prev.hidden = true;
      body.append(ta, prev);
      box.appendChild(body);
      this._ta = ta;
      this._prevEl = prev;

      this._sendBtn = null;
      const hint = this._attr('hint', 'Ctrl + Enter');
      if (bool(this.getAttribute('submit'), true)) {
        const foot = document.createElement('div');
        foot.className = 'mde-foot';
        if (hint) { const h = document.createElement('span'); h.className = 'mde-hint'; h.textContent = hint; foot.appendChild(h); }
        const send = document.createElement('button');
        send.type = 'button';
        send.className = 'mde-send';
        send.textContent = this._labels.submit;
        send.addEventListener('click', () => this.submit());
        foot.appendChild(send);
        box.appendChild(foot);
        this._sendBtn = send;
      }
      this.appendChild(box);

      /* 復原紀錄：連續輸入 700ms 內合併成一筆 */
      this._undo = [];
      this._redo = [];
      this._cur = this._state();
      this._lastT = 0;
      ta.addEventListener('input', (ev) => this._onInput(ev));
      ta.addEventListener('keydown', (ev) => this._onKey(ev));

      this._tab = 'write';
      this._tabs.write.classList.add('on');
      this._applyDisabled();
      this._sync();
      if (this._attr('tab', 'write') === 'preview') this.setTab('preview');
      if (this.hasAttribute('autofocus')) ta.focus();
    }

    /* ---------- 狀態與復原 ---------- */
    _state() { const t = this._ta; return { v: t.value, s: t.selectionStart, e: t.selectionEnd }; }

    _pushUndo(st) {
      const top = this._undo[this._undo.length - 1];
      if (top && top.v === st.v) return;
      this._undo.push(st);
      if (this._undo.length > 200) this._undo.shift();
    }

    _apply(st) {
      this._ta.value = st.v;
      this._ta.setSelectionRange(st.s, st.e);
      this._cur = this._state();
      this._lastT = 0;
      this._sync();
      this._emitChange();
    }

    _onInput(ev) {
      const now = Date.now();
      const typing = /^(insertText|insertCompositionText|deleteContentBackward|deleteContentForward)$/.test(ev.inputType || '');
      if (!typing || now - this._lastT > 700) this._pushUndo(this._cur);
      this._redo.length = 0;
      this._cur = this._state();
      this._lastT = now;
      this._sync();
      this._emitChange();
    }

    _edit(fn) {
      const t = this._ta;
      if (t.disabled) return;
      const r = fn(t.value, t.selectionStart, t.selectionEnd);
      if (!r) return;
      this._pushUndo(this._cur);
      this._redo.length = 0;
      t.value = r.value;
      t.setSelectionRange(r.s, r.e);
      t.focus();
      this._cur = this._state();
      this._lastT = 0;
      this._sync();
      this._emitChange();
    }

    _sync() {
      const empty = !this._ta.value.trim();
      if (this._sendBtn) this._sendBtn.disabled = this._ta.disabled || (this._required && empty);
      if (this._toolBtns.undo) this._toolBtns.undo.classList.toggle('mde-off', !this._undo.length);
      if (this._toolBtns.redo) this._toolBtns.redo.classList.toggle('mde-off', !this._redo.length);
      this.classList.remove('mde-err');
    }

    _emitChange() {
      this.dispatchEvent(new CustomEvent('md-change', { bubbles: true, detail: { markdown: this._ta.value, value: this._ta.value } }));
    }

    _applyDisabled() {
      const off = this.hasAttribute('disabled');
      this._ta.disabled = off;
      Object.keys(this._toolBtns).forEach((k) => { this._toolBtns[k].disabled = off; });
      Object.keys(this._tabs).forEach((k) => { this._tabs[k].disabled = off; });
      this._sync();
    }

    _tool(key) {
      if (this._tab !== 'write') this.setTab('write');
      if (key === 'undo') return this.undo();
      if (key === 'redo') return this.redo();
      if (ACTIONS[key]) this._edit(ACTIONS[key]);
    }

    _onKey(ev) {
      if (ev.isComposing) return;
      const mod = ev.ctrlKey || ev.metaKey;
      const k = ev.key.toLowerCase();
      if (mod && k === 'enter') { ev.preventDefault(); this.submit(); return; }
      if (mod && !ev.shiftKey && k === 'z') { ev.preventDefault(); this.undo(); return; }
      if (mod && (k === 'y' || (ev.shiftKey && k === 'z'))) { ev.preventDefault(); this.redo(); return; }
      if (mod && !ev.shiftKey && !ev.altKey && (k === 'b' || k === 'i' || k === 'k')) {
        if (this._toolBtns[{ b: 'bold', i: 'italic', k: 'link' }[k]]) {
          ev.preventDefault();
          this._tool({ b: 'bold', i: 'italic', k: 'link' }[k]);
        }
        return;
      }
      if (ev.key === 'Enter' && !mod && !ev.shiftKey && !ev.altKey) this._enterList(ev);
    }

    /* 在清單項目按 Enter：接續下一項；空項目再按一次就結束清單 */
    _enterList(ev) {
      const t = this._ta;
      if (t.selectionStart !== t.selectionEnd) return;
      const v = t.value;
      const pos = t.selectionStart;
      const ls = v.lastIndexOf('\n', pos - 1) + 1;
      const line = v.slice(ls, pos);
      const m = line.match(/^(\s*)([-*+]|(\d+)([.)]))\s+(\[[ xX]\]\s+)?(.*)$/);
      if (!m) return;
      ev.preventDefault();
      if (!m[6].trim() && pos === (v.indexOf('\n', pos) < 0 ? v.length : v.indexOf('\n', pos)) ) {
        this._edit((val, s) => ({ value: val.slice(0, ls) + val.slice(s), s: ls, e: ls }));
        return;
      }
      const marker = m[3] ? (parseInt(m[3], 10) + 1) + m[4] : m[2];
      const ins = '\n' + m[1] + marker + ' ' + (m[5] ? '[ ] ' : '');
      this._edit((val, s, e) => ({ value: val.slice(0, s) + ins + val.slice(e), s: s + ins.length, e: s + ins.length }));
    }

    /* ---------- 分頁 ---------- */
    setTab(tab) {
      tab = tab === 'preview' ? 'preview' : 'write';
      if (this._ta.disabled && this.hasAttribute('disabled')) return;
      if (tab === 'preview') {
        const h = this._ta.offsetHeight;
        const html = render(this._ta.value);
        this._prevEl.style.minHeight = h ? h + 'px' : '';
        this._prevEl.innerHTML = html || '<span class="mde-empty">' + esc(this._labels.empty) + '</span>';
        this._ta.hidden = true;
        this._prevEl.hidden = false;
      } else {
        this._prevEl.hidden = true;
        this._ta.hidden = false;
        this._ta.focus();
      }
      this._tab = tab;
      this.classList.toggle('mde-previewing', tab === 'preview');
      this._tabs.write.classList.toggle('on', tab === 'write');
      this._tabs.preview.classList.toggle('on', tab === 'preview');
      this.dispatchEvent(new CustomEvent('md-tab', { bubbles: true, detail: { tab } }));
    }

    get tab() { return this._tab; }

    /* ---------- 公開 API ---------- */
    get value() { return this._ta ? this._ta.value : ''; }
    set value(v) {
      if (!this._ta) { this.setAttribute('value', v == null ? '' : v); return; }
      this._pushUndo(this._cur);
      this._redo.length = 0;
      this._ta.value = v == null ? '' : String(v);
      this._cur = this._state();
      this._lastT = 0;
      this._sync();
      if (this._tab === 'preview') this.setTab('preview');
      this._emitChange();
    }
    get html() { return render(this.value); }
    get text() { return toText(this.html); }

    focus() { if (this._ta) { if (this._tab !== 'write') this.setTab('write'); this._ta.focus(); } }
    insert(text) { this._edit((v, s, e) => ({ value: v.slice(0, s) + text + v.slice(e), s: s + text.length, e: s + text.length })); }

    undo() {
      if (!this._undo.length) return;
      this._redo.push(this._cur);
      this._apply(this._undo.pop());
    }
    redo() {
      if (!this._redo.length) return;
      this._undo.push(this._cur);
      this._apply(this._redo.pop());
    }

    clear() {
      if (!this._ta.value) return;
      this._pushUndo(this._cur);
      this._redo.length = 0;
      this._ta.value = '';
      this._cur = this._state();
      this._lastT = 0;
      if (this._tab !== 'write') this.setTab('write');
      this._sync();
      this._emitChange();
    }

    submit() {
      const md = this._ta.value;
      if (this._required && !md.trim()) {
        this.classList.add('mde-err');
        if (this._tab !== 'write') this.setTab('write');
        this._ta.focus();
        return false;
      }
      const charts = [];
      const html = render(md, charts);
      this.dispatchEvent(new CustomEvent('md-submit', {
        bubbles: true,
        detail: { markdown: md, value: md, html, text: toText(html), name: this.getAttribute('name') || '', charts }
      }));
      if (this._clear) this.clear();
      return true;
    }
  }

  customElements.define('md-editor', MdEditor);
  window.MdEditor = { render, toText, version: '1.1.0' };
})();
