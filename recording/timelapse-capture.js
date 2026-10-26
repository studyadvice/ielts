/* =========================================================
 * timelapse-capture.js
 * 頁面區域縮時錄影元件（框選方形區域 → 低頻取樣 → 加速輸出 → 存檔）
 *
 * 自訂標籤：
 *   <ui-timelapse>  浮動控制列＋框選圖層（全頁僅需一個實體）
 *
 * 流程：
 *   1. 框選頁面上的方形區域（或沿用 teach-studio 的錄影框）
 *   2. 開始錄製時向瀏覽器要求畫面分享，請選「這個分頁」
 *   3. 依設定的間隔取樣畫面，只保留框內的範圍
 *   4. 停止後把所有影格以輸出 FPS 快轉重播並錄成 webm，自動下載
 *
 * 對外介面：window.Timelapse
 *   .el()        取得元件實體
 *   .palette     品牌色票
 * ========================================================= */
(function () {
  'use strict';

  var CH = window.ClozeHandwrite || {};
  var PALETTE = CH.palette || {
    bg: '#0C0D0C', shell: '#C6C7BD', sky: '#82C8E5', warning: '#E6374B',
    ocean: '#1CCAE8', safe: '#27AE60', teal: '#0DA591', yellow: '#E3D322',
    focus: '#D4FFFC', special: '#B3DE73', info: '#4171BF', orange: '#EDA109'
  };

  function toast(msg, type) {
    if (CH.showAlert) { CH.showAlert(msg, type); return; }
    var el = document.createElement('div');
    el.className = 'tl-toast' + (type === 'info' ? ' tl-info' : '');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 3200);
  }

  function stamp() {
    var d = new Date();
    function p(n) { return String(n).padStart(2, '0'); }
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  /* ---------- 樣式（僅注入一次） ---------- */
  function injectStyles() {
    if (document.getElementById('timelapse-capture-styles')) return;
    var css = ''
      + 'ui-timelapse{display:block;}'

      /* ---- 控制列 ---- */
      + '.tl-bar{position:fixed;right:24px;bottom:24px;z-index:940;display:flex;align-items:center;gap:10px;'
      + 'flex-wrap:wrap;max-width:min(92vw,980px);padding:12px 18px;border-radius:12px;'
      + 'background:rgba(19,20,18,0.95);border:1px solid rgba(58,59,55,0.9);'
      + 'box-shadow:0 10px 32px rgba(0,0,0,0.84);color:' + PALETTE.shell + ';'
      + 'font-family:-apple-system,"Segoe UI","Noto Sans TC",sans-serif;font-size:0.92rem;line-height:1.4;}'
      + '.tl-bar.tl-hidden{display:none;}'

      /* ---- 錄製中的迷你停止鈕（自動避開框選區域） ---- */
      + '.tl-mini{position:fixed;z-index:945;display:none;align-items:center;gap:8px;'
      + 'padding:6px 12px;border-radius:8px;background:rgba(19,20,18,0.92);'
      + 'border:1px solid rgba(230,55,75,0.82);color:' + PALETTE.shell + ';'
      + 'font-family:-apple-system,"Segoe UI","Noto Sans TC",sans-serif;'
      + 'font-size:0.82rem;line-height:1.4;cursor:pointer;}'
      + '.tl-mini.tl-on{display:flex;}'
      + '.tl-mini:hover{border-color:' + PALETTE.warning + ';color:' + PALETTE.warning + ';}'
      + '.tl-mini b{font-variant-numeric:tabular-nums;color:' + PALETTE.special + ';font-weight:500;}'
      + '.tl-label{font-size:0.8rem;color:#9a9b94;letter-spacing:1px;}'
      + '.tl-btn{font-size:0.92rem;line-height:1.4;padding:7px 14px;border-radius:7px;'
      + 'border:1px solid rgba(58,59,55,0.9);background:rgba(32,33,25,0.92);color:' + PALETTE.shell + ';cursor:pointer;}'
      + '.tl-btn:hover{border-color:' + PALETTE.ocean + ';color:' + PALETTE.ocean + ';}'
      + '.tl-btn:disabled{opacity:0.45;cursor:not-allowed;}'
      + '.tl-btn.tl-primary{background:' + PALETTE.teal + ';border-color:' + PALETTE.teal + ';color:#07211D;font-weight:600;}'
      + '.tl-btn.tl-danger{color:' + PALETTE.warning + ';border-color:rgba(230,55,75,0.82);}'
      + '.tl-bar select{background:rgba(15,16,14,0.95);border:1px solid rgba(58,59,55,0.9);'
      + 'color:' + PALETTE.shell + ';border-radius:6px;padding:6px 8px;font-size:0.9rem;}'
      + '.tl-stat{font-size:0.9rem;color:' + PALETTE.special + ';min-width:150px;'
      + 'font-variant-numeric:tabular-nums;}'
      + '.tl-dot{display:inline-block;width:10px;height:10px;border-radius:50%;'
      + 'background:' + PALETTE.warning + ';margin-right:6px;animation:tl-blink 1.4s infinite;}'
      + '@keyframes tl-blink{0%,100%{opacity:1;}50%{opacity:0.8;}}'

      /* ---- 框選圖層 ---- */
      + '.tl-pick{position:fixed;inset:0;z-index:960;display:none;cursor:crosshair;'
      + 'background:rgba(12,13,12,0.82);touch-action:none;}'
      + '.tl-pick.tl-on{display:block;}'
      + '.tl-pick-hint{position:fixed;top:24px;left:50%;transform:translateX(-50%);'
      + 'padding:10px 20px;border-radius:8px;background:rgba(19,20,18,0.95);'
      + 'border:1px solid rgba(198,199,189,0.82);color:' + PALETTE.focus + ';font-size:0.95rem;line-height:1.4;}'
      + '.tl-rubber{position:fixed;border:2px dashed ' + PALETTE.ocean + ';'
      + 'background:rgba(28,202,232,0.14);pointer-events:none;display:none;}'

      /* ---- 已選區域標示 ---- */
      + '.tl-region{position:fixed;z-index:930;pointer-events:none;display:none;box-sizing:border-box;'
      + 'border:2px solid rgba(28,202,232,0.88);}'
      + '.tl-region.tl-on{display:block;}'
      + '.tl-region.tl-live{border-color:rgba(230,55,75,0.9);}'
      + '.tl-region-tag{position:absolute;top:6px;left:8px;font-size:0.78rem;line-height:1.4;'
      + 'padding:2px 8px;border-radius:4px;background:rgba(12,13,12,0.88);color:' + PALETTE.ocean + ';}'
      + '.tl-region.tl-live .tl-region-tag{color:' + PALETTE.warning + ';}'

      /* ---- 自用提示（沒有 ClozeHandwrite 時） ---- */
      + '.tl-toast{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:1200;'
      + 'padding:10px 20px;border-radius:8px;font-size:0.9rem;line-height:1.4;color:#fff;'
      + 'background:rgba(230,55,75,0.9);box-shadow:0 4px 18px rgba(0,0,0,0.8);}'
      + '.tl-toast.tl-info{background:rgba(65,113,191,0.9);}'
      ;
    var style = document.createElement('style');
    style.id = 'timelapse-capture-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* =========================================================
   * <ui-timelapse>
   * ========================================================= */
  class UiTimelapse extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;

      this._region = null;      // {x, y, w, h}（CSS 像素）
      this._frames = [];        // 取樣後的 Blob 陣列
      this._recording = false;
      this._stream = null;
      this._timer = null;
      this._maxFrames = 6000;
      this._maxBytes = 600 * 1048576;  /* 影格暫存於記憶體，超過就自動收工 */
      this._bytes = 0;
      this._busy = false;

      this.innerHTML =
        '<div class="tl-bar" data-role="bar">' +
        '<span class="tl-label">縮時</span>' +
        '<button type="button" class="tl-btn" data-act="pick">框選區域</button>' +
        '<button type="button" class="tl-btn" data-act="useframe">沿用錄影框</button>' +
        '<span class="tl-label">取樣</span>' +
        '<select data-role="interval">' +
        '<option value="100">0.1 秒</option>' +
        '<option value="200">0.2 秒</option>' +
        '<option value="250">0.25 秒</option>' +
        '<option value="500" selected>0.5 秒</option>' +
        '<option value="1000">1 秒</option>' +
        '<option value="2000">2 秒</option>' +
        '<option value="5000">5 秒</option>' +
        '</select>' +
        '<span class="tl-label">輸出</span>' +
        '<select data-role="fps">' +
        '<option value="12">12 FPS</option>' +
        '<option value="24" selected>24 FPS</option>' +
        '<option value="30">30 FPS</option>' +
        '</select>' +
        '<button type="button" class="tl-btn tl-primary" data-act="start">開始錄製</button>' +
        '<button type="button" class="tl-btn tl-danger" data-act="stop" disabled>停止並存檔</button>' +
        '<button type="button" class="tl-btn" data-act="discard" disabled>丟棄</button>' +
        '<span class="tl-stat" data-role="stat">尚未選取區域</span>' +
        '</div>' +
        '<div class="tl-pick" data-role="pick">' +
        '<div class="tl-pick-hint">用滑鼠或觸控筆拖曳出要錄的方形區域，按 Esc 取消</div>' +
        '<div class="tl-rubber" data-role="rubber"></div>' +
        '</div>' +
        '<div class="tl-region" data-role="regionbox"><span class="tl-region-tag" data-role="regiontag"></span></div>' +
        '<div class="tl-mini" data-role="mini" title="按 Esc 也可停止">' +
        '<span class="tl-dot"></span>停止並存檔　<b data-role="minicount">0</b>' +
        '</div>';

      this._bar = this.querySelector('[data-role="bar"]');
      this._pick = this.querySelector('[data-role="pick"]');
      this._rubber = this.querySelector('[data-role="rubber"]');
      this._regionBox = this.querySelector('[data-role="regionbox"]');
      this._regionTag = this.querySelector('[data-role="regiontag"]');
      this._stat = this.querySelector('[data-role="stat"]');
      this._mini = this.querySelector('[data-role="mini"]');
      this._miniCount = this.querySelector('[data-role="minicount"]');
      this._mini.addEventListener('click', () => this.stop());

      this._wire();
      this._bindKeys();
      this._bindPick();

      var preset = this.getAttribute('data-region');
      if (preset) {
        var p = preset.split(/[,\s]+/).filter(Boolean).map(Number);
        if (p.length === 4) this.setRegion({ x: p[0], y: p[1], w: p[2], h: p[3] });
      }
    }

    /* ---------- 控制列 ---------- */
    _wire() {
      var acts = {
        pick: () => this.startPick(),
        useframe: () => this.useStudioFrame(),
        start: () => this.start(),
        stop: () => this.stop(),
        discard: () => this.discard()
      };
      Object.keys(acts).forEach((k) => {
        var btn = this.querySelector('[data-act="' + k + '"]');
        if (btn) btn.addEventListener('click', acts[k]);
      });
    }

    _btn(name) { return this.querySelector('[data-act="' + name + '"]'); }

    /* 錄製中：Esc 停止存檔，Shift+Esc 丟棄 */
    _bindKeys() {
      document.addEventListener('keydown', (e) => {
        if (!this._recording || e.key !== 'Escape') return;
        e.preventDefault();
        if (e.shiftKey) this.discard(); else this.stop();
      });
    }

    /* 把迷你停止鈕放到離框選區域最遠的角落 */
    _placeMini() {
      var r = this._region || { x: 0, y: 0, w: 0, h: 0 };
      var cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      var top = cy > window.innerHeight / 2;
      var left = cx > window.innerWidth / 2;
      this._mini.style.cssText = '';
      this._mini.style[top ? 'top' : 'bottom'] = '16px';
      this._mini.style[left ? 'left' : 'right'] = '16px';
    }

    _renderStat(text) {
      if (text) { this._stat.innerHTML = text; return; }
      if (!this._region) { this._stat.textContent = '尚未選取區域'; return; }
      var r = this._region;
      this._stat.textContent = '區域 ' + r.w + ' × ' + r.h + '，可開始錄製';
    }

    /* ---------- 區域設定 ---------- */
    setRegion(r) {
      var x = Math.max(0, Math.round(r.x));
      var y = Math.max(0, Math.round(r.y));
      var w = Math.max(40, Math.round(r.w));
      var h = Math.max(40, Math.round(r.h));
      this._region = { x: x, y: y, w: w, h: h };
      this._regionBox.style.left = x + 'px';
      this._regionBox.style.top = y + 'px';
      this._regionBox.style.width = w + 'px';
      this._regionBox.style.height = h + 'px';
      this._regionTag.textContent = w + ' × ' + h + '　@ ' + x + ', ' + y;
      this._regionBox.classList.add('tl-on');
      this._renderStat();
      return this._region;
    }

    /* 沿用 teach-studio 主控列的錄影框 */
    useStudioFrame() {
      var frame = document.querySelector('.ts-frame');
      if (!frame) { toast('這個頁面沒有 teach-studio 的錄影框。', 'info'); return; }
      var rect = frame.getBoundingClientRect();
      if (!rect.width || !rect.height) { toast('錄影框尚未設定尺寸。', 'info'); return; }
      this.setRegion({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
      toast('已沿用錄影框的範圍。', 'info');
    }

    startPick() {
      if (this._recording) { toast('錄製中無法重新框選。', 'info'); return; }
      this._pick.classList.add('tl-on');
      this._regionBox.classList.remove('tl-on');
    }

    _bindPick() {
      var start = null;
      var place = (a, b) => {
        var x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
        var w = Math.abs(a.x - b.x), h = Math.abs(a.y - b.y);
        this._rubber.style.cssText = 'display:block;left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;';
        return { x: x, y: y, w: w, h: h };
      };
      this._pick.addEventListener('pointerdown', (e) => {
        start = { x: e.clientX, y: e.clientY };
        this._pick.setPointerCapture(e.pointerId);
        place(start, start);
      });
      this._pick.addEventListener('pointermove', (e) => {
        if (!start) return;
        place(start, { x: e.clientX, y: e.clientY });
      });
      this._pick.addEventListener('pointerup', (e) => {
        if (!start) return;
        var r = place(start, { x: e.clientX, y: e.clientY });
        start = null;
        this._rubber.style.display = 'none';
        this._pick.classList.remove('tl-on');
        if (r.w < 40 || r.h < 40) { toast('選取範圍太小，請重新框選。', 'info'); return; }
        this.setRegion(r);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || !this._pick.classList.contains('tl-on')) return;
        start = null;
        this._rubber.style.display = 'none';
        this._pick.classList.remove('tl-on');
        if (this._region) this._regionBox.classList.add('tl-on');
      });
    }

    /* ---------- 錄製 ---------- */
    async start() {
      if (this._recording) return;
      if (!this._region) { toast('請先框選要錄的區域。', 'info'); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        toast('這個瀏覽器不支援畫面擷取，請改用新版 Chrome 或 Edge。');
        return;
      }
      try {
        this._stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 30 }, audio: false,
          preferCurrentTab: true
        });
      } catch (err) {
        toast('已取消畫面分享，未開始錄製。', 'info');
        return;
      }

      this._video = document.createElement('video');
      this._video.srcObject = this._stream;
      this._video.muted = true;
      await this._video.play();

      this._stream.getVideoTracks()[0].addEventListener('ended', () => {
        if (this._recording) this.stop();
      });

      this._frames = [];
      this._bytes = 0;
      this._busy = false;
      this._recording = true;
      this._regionBox.classList.add('tl-live');
      this._bar.classList.add('tl-hidden');
      this._placeMini();
      this._mini.classList.add('tl-on');
      this._btn('start').disabled = true;
      this._btn('pick').disabled = true;
      this._btn('useframe').disabled = true;
      this._btn('stop').disabled = false;
      this._btn('discard').disabled = false;

      var interval = Number(this.querySelector('[data-role="interval"]').value);
      this._timer = setInterval(() => this._sample(), interval);
      this._sample();
      /* 錄製期間不在畫面上顯示任何提示，改走 console，避免被錄進去 */
      console.log('[timelapse] 開始錄製，工具列已隱藏。Esc 停止並存檔，Shift+Esc 丟棄。'
        + ' 取樣每 ' + (interval / 1000) + ' 秒，輸出 '
        + this.querySelector('[data-role="fps"]').value + ' FPS。');
    }

    _sample() {
      if (!this._recording || !this._video || !this._video.videoWidth) return;
      /* 上一格還在壓縮就跳過這次，避免密集取樣時排隊卡死 */
      if (this._busy) return;
      if (this._frames.length >= this._maxFrames || this._bytes >= this._maxBytes) {
        console.log('[timelapse] 已達影格或記憶體上限，自動停止錄製並存檔。');
        this.stop();
        return;
      }
      this._busy = true;
      var scale = this._video.videoWidth / window.innerWidth;
      var r = this._region;
      if (!this._work) this._work = document.createElement('canvas');
      var ow = Math.round(r.w * scale), oh = Math.round(r.h * scale);
      if (this._work.width !== ow) { this._work.width = ow; this._work.height = oh; }
      var ctx = this._work.getContext('2d');
      ctx.drawImage(this._video, r.x * scale, r.y * scale, r.w * scale, r.h * scale, 0, 0, ow, oh);
      /* 取樣越密，單格品質壓低一點，換取記憶體與編碼時間 */
      var quality = Number(this.querySelector('[data-role="interval"]').value) <= 200 ? 0.72 : 0.82;
      this._work.toBlob((blob) => {
        if (blob) { this._frames.push(blob); this._bytes += blob.size; }
        this._busy = false;
        this._updateLive();
      }, 'image/jpeg', quality);
    }

    _updateLive() {
      var fps = Number(this.querySelector('[data-role="fps"]').value);
      var secs = (this._frames.length / fps).toFixed(1);
      var mb = (this._bytes / 1048576).toFixed(0);
      this._renderStat('<span class="tl-dot"></span>已取 ' + this._frames.length +
        ' 格，約 ' + secs + ' 秒，暫存 ' + mb + ' MB');
      this._miniCount.textContent = this._frames.length + ' 格 / ' + secs + ' 秒';
    }

    async stop() {
      if (!this._recording) return;
      clearInterval(this._timer);
      this._recording = false;
      this._regionBox.classList.remove('tl-live');
      if (this._stream) this._stream.getTracks().forEach(function (t) { t.stop(); });
      this._stream = null;
      this._mini.classList.remove('tl-on');
      this._bar.classList.remove('tl-hidden');
      this._btn('stop').disabled = true;

      if (this._frames.length < 2) {
        toast('影格太少，沒有產生檔案。', 'info');
        this._resetButtons();
        return;
      }
      await this._render();
      this._resetButtons();
    }

    discard() {
      clearInterval(this._timer);
      this._recording = false;
      this._regionBox.classList.remove('tl-live');
      if (this._stream) this._stream.getTracks().forEach(function (t) { t.stop(); });
      this._stream = null;
      this._frames = [];
      this._bytes = 0;
      this._mini.classList.remove('tl-on');
      this._bar.classList.remove('tl-hidden');
      this._resetButtons();
      this._renderStat();
      toast('已丟棄這次錄製。', 'info');
    }

    _resetButtons() {
      this._btn('start').disabled = false;
      this._btn('pick').disabled = false;
      this._btn('useframe').disabled = false;
      this._btn('stop').disabled = true;
      this._btn('discard').disabled = true;
    }

    /* 把影格以輸出 FPS 快轉重播，邊播邊錄，得到真正被壓縮時間的影片 */
    async _render() {
      var fps = Number(this.querySelector('[data-role="fps"]').value);
      var first = await createImageBitmap(this._frames[0]);
      var canvas = document.createElement('canvas');
      canvas.width = first.width;
      canvas.height = first.height;
      var ctx = canvas.getContext('2d');

      var stream = canvas.captureStream(0);
      var track = stream.getVideoTracks()[0];
      var mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
        .filter(function (m) { return window.MediaRecorder && MediaRecorder.isTypeSupported(m); })[0];
      if (!mime) { toast('這個瀏覽器不支援影片輸出。'); return; }

      var chunks = [];
      var rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6000000 });
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      var done = new Promise(function (resolve) { rec.onstop = resolve; });
      rec.start();

      var step = 1000 / fps;
      var total = this._frames.length;
      for (var i = 0; i < total; i++) {
        var bmp = i === 0 ? first : await createImageBitmap(this._frames[i]);
        ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
        if (track.requestFrame) track.requestFrame();
        bmp.close && bmp.close();
        this._renderStat('輸出中 ' + (i + 1) + ' / ' + total);
        await sleep(step);
      }
      await sleep(step * 2);
      rec.stop();
      await done;

      var blob = new Blob(chunks, { type: mime });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'timelapse-' + stamp() + '.webm';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);

      var secs = (total / fps).toFixed(1);
      var mb = (blob.size / 1048576).toFixed(1);
      this._renderStat('已存檔 ' + secs + ' 秒，' + mb + ' MB');
      toast('縮時影片已存檔：' + secs + ' 秒，' + mb + ' MB。', 'info');
      this._frames = [];
      this._bytes = 0;
    }
  }
  customElements.define('ui-timelapse', UiTimelapse);

  /* ---------- 對外介面 ---------- */
  injectStyles();
  window.Timelapse = {
    el: function () { return document.querySelector('ui-timelapse'); },
    palette: PALETTE
  };
})();
