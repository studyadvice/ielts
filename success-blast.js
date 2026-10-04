/*!
 * 範例：
 *   <success-blast auto text="大成功" sub-text="上傳成功"></success-blast>
 *   <success-blast id="sb" sub-text="繳交完成"></success-blast>
 *   <button onclick="document.getElementById('sb').play()">觸發</button>
 */
(function () {
  'use strict';

  /* ── 品牌色系 ── */
  var COLORS = [
    '#b3de73', '#C3A5E5', '#0DA591', '#0ABDC6',
    '#EDA109', '#E5C3B3', '#FFB3D9', '#95c9de', '#C6C7BD'
  ];

  function rand(a, b)    { return a + Math.random() * (b - a); }
  function randInt(a, b) { return Math.floor(rand(a, b)); }
  function pick(arr)     { return arr[randInt(0, arr.length)]; }

  /* ── 注入 CSS（只注入一次） ── */
  function ensureStyles() {
    if (document.getElementById('sb-global-css')) return;
    var s = document.createElement('style');
    s.id = 'sb-global-css';
    s.textContent = [
      '@keyframes sb-draw { to { stroke-dashoffset:0; } }',
      '@keyframes sb-pop  {',
      '  from { transform:scale(0.25); opacity:0; }',
      '  to   { transform:scale(1);    opacity:1; } }',
      '@keyframes sb-up   {',
      '  from { transform:translateY(16px); opacity:0; }',
      '  to   { transform:translateY(0);    opacity:1; } }',
      '@keyframes sb-cin  {',
      '  from { opacity:0; transform:translate(-50%,-52%) scale(.55); }',
      '  to   { opacity:1; transform:translate(-50%,-50%) scale(1); } }',
      '@keyframes sb-ring {',
      '  from { stroke-width:2; opacity:.65; }',
      '  to   { stroke-width:0; opacity:0;   } }',

      /* ── 中央 UI ── */
      '.sb-center {',
      '  position:absolute; top:50%; left:50%;',
      '  transform:translate(-50%,-50%);',
      '  display:flex; flex-direction:column; align-items:center; gap:16px;',
      '  pointer-events:none;',
      '  animation:sb-cin .4s cubic-bezier(.34,1.56,.64,1) both; }',

      '.sb-svg { filter:drop-shadow(0 0 18px rgba(179,222,115,.55)); }',

      '.sb-check {',
      '  stroke-dasharray:84; stroke-dashoffset:84;',
      '  animation:sb-draw .52s cubic-bezier(.4,0,.2,1) .16s forwards; }',

      '.sb-text {',
      '  font-size:clamp(1.9rem,5vw,2.7rem); font-weight:900;',
      '  letter-spacing:.1em; font-family:system-ui,sans-serif;',
      '  color:#b3de73; white-space:nowrap;',
      '  text-shadow:0 0 28px rgba(179,222,115,.45), 0 2px 8px rgba(0,0,0,.6);',
      '  animation:sb-pop .48s cubic-bezier(.34,1.56,.64,1) .32s both; }',

      '.sb-sub {',
      '  font-size:clamp(.8rem,2.5vw,.95rem); font-family:system-ui,sans-serif;',
      '  color:#c6c7bd; opacity:.6; white-space:nowrap;',
      '  animation:sb-up .38s ease .52s both; }',

      '.sb-hint {',
      '  position:absolute; bottom:24px; left:50%; transform:translateX(-50%);',
      '  font-size:.72rem; font-family:system-ui,sans-serif;',
      '  color:#c6c7bd; opacity:.2; white-space:nowrap;',
      '  pointer-events:none; letter-spacing:.06em; }',
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ── 粒子群 ── */
  function makeParticles(cx, cy, scale) {
    var list = [];
    var n    = 280;
    for (var i = 0; i < n; i++) {
      var angle = (Math.PI * 2 / n) * i + rand(-0.22, 0.22);
      var speed = rand(1.1, 4.2);
      list.push({
        x: cx, y: cy,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed - rand(0.5, 3),
        color: pick(COLORS),
        size:  rand(3, 8),
        type:  randInt(0, 3),     /* 0=圓 1=矩形 2=星 */
        rot:   rand(0, Math.PI * 2),
        rotV:  rand(-0.18, 0.18),
        life:  1,
        decay: rand(0.009, 0.017) * scale,  /* duration 越長，decay 越小，壽命越長 */
        delay: randInt(0, 10),
      });
    }
    return list;
  }

  /* ── 環繞閃爍星形 ── */
  function makeSparkles(cx, cy) {
    var list = [];
    var n    = 14;
    for (var i = 0; i < n; i++) {
      var angle = (Math.PI * 2 / n) * i;
      var r     = 54 + rand(-8, 8);
      list.push({
        x:     cx + Math.cos(angle) * r,
        y:     cy + Math.sin(angle) * r,
        size:  rand(2, 5),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.06, 0.14),
        delay: randInt(4, 22),
      });
    }
    return list;
  }

  /* ── 畫 N 角星 ── */
  function drawStar(ctx, spikes, outerR, innerR) {
    var rot  = (Math.PI / 2) * 3;
    var step = Math.PI / spikes;
    ctx.beginPath();
    for (var i = 0; i < spikes; i++) {
      ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.closePath();
  }

  /* ══════════════════════════════════════════
     <success-blast> 自訂元素
  ══════════════════════════════════════════ */
  class SuccessBlast extends HTMLElement {

    connectedCallback() {
      if (this.getAttribute('auto') !== null) {
        var self = this;
        setTimeout(function () { self.play(); }, 80);
      }
    }

    play() {
      this._stop();
      ensureStyles();
      this._launch();
    }

    /* ── 清除所有動畫資源 ── */
    _stop() {
      if (this._raf)     { cancelAnimationFrame(this._raf); this._raf = null; }
      if (this._overlay) { this._overlay.remove(); this._overlay = null; }
    }

    _launch() {
      var self     = this;
      var text     = this.getAttribute('text')     || '大成功';
      var subText  = this.getAttribute('sub-text') || '';
      var duration = parseInt(this.getAttribute('duration') || '3200', 10);
      var isFS     = (this.getAttribute('mode') || 'fullscreen') !== 'contained';

      /* ── Overlay ── */
      var ov = document.createElement('div');
      ov.style.cssText = (isFS
        ? 'position:fixed;top:0;left:0;width:100vw;height:100vh;'
        : 'position:absolute;top:0;left:0;width:100%;height:100%;'
      ) + 'z-index:9990;background:rgba(12,13,12,0);cursor:pointer;overflow:hidden;' +
          'transition:background .28s ease;';

      var cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';

      /* ── 中央 SVG + 文字 ── */
      var center = document.createElement('div');
      center.className = 'sb-center';
      center.innerHTML = [
        '<svg class="sb-svg" viewBox="0 0 100 100" width="100" height="100">',
        /* 兩圈脈衝環 */
        '<circle cx="50" cy="50" r="47" fill="none" stroke="#b3de73" stroke-width="2"',
        '  style="animation:sb-ring 1.1s ease-out .04s forwards"/>',
        '<circle cx="50" cy="50" r="38" fill="none" stroke="#b3de73" stroke-width="1.5"',
        '  style="animation:sb-ring 1.4s ease-out .22s forwards"/>',
        /* 背景圓 */
        '<circle cx="50" cy="50" r="42" fill="rgba(179,222,115,.07)"/>',
        /* Checkmark */
        '<polyline class="sb-check" points="26,52 41,68 74,34"',
        '  fill="none" stroke="#b3de73" stroke-width="5.5"',
        '  stroke-linecap="round" stroke-linejoin="round"/>',
        '</svg>',
        '<div class="sb-text">' + text + '</div>',
        subText ? '<div class="sb-sub">' + subText + '</div>' : '',
      ].join('');

      /* ── 提示文字 ── */
      var hint = document.createElement('div');
      hint.className = 'sb-hint';
      hint.textContent = '點擊任意處關閉';

      ov.appendChild(cv);
      ov.appendChild(center);
      if (isFS) ov.appendChild(hint);

      /* ── 掛載到 DOM ── */
      if (isFS) {
        document.body.appendChild(ov);
      } else {
        var host = this.parentElement || document.body;
        host.style.position = 'relative';
        host.style.overflow  = 'hidden';
        host.appendChild(ov);
      }
      this._overlay = ov;

      /* overlay 背景淡入 */
      requestAnimationFrame(function () {
        ov.style.background = 'rgba(12,13,12,' + (isFS ? '.78' : '.82') + ')';
      });

      /* ── 初始化 Canvas ── */
      var rect  = ov.getBoundingClientRect();
      cv.width  = rect.width  || window.innerWidth;
      cv.height = rect.height || window.innerHeight;
      var ctx = cv.getContext('2d');
      var cx  = cv.width  / 2;
      var cy  = cv.height / 2;

      /* scale：讓粒子壽命、擴散環速度隨 duration 等比例拉伸
         基準是 3200ms；duration=12000 時 scale≈0.267，粒子活得約 3.75 倍久 */
      var BASE_DUR = 3200;
      var scale    = BASE_DUR / duration;

      var particles = makeParticles(cx, cy, scale);
      var sparkles  = makeSparkles(cx, cy);

      /* 三道擴散環（spd 同樣依 scale 縮放，duration 長則慢慢展開） */
      var rings = [
        { r:0, spd:5.5*scale, max:cx*.7,  color:'#b3de73', lw:2,   life:1, delay:0  },
        { r:0, spd:4.5*scale, max:cx*.95, color:'#C3A5E5', lw:1.5, life:1, delay:7  },
        { r:0, spd:3.5*scale, max:cx*1.2, color:'#0DA591', lw:1,   life:1, delay:16 },
      ];

      var frame = 0;
      var start = performance.now();

      function tick(now) {
        var elapsed = now - start;
        ctx.clearRect(0, 0, cv.width, cv.height);

        /* 擴散環 */
        rings.forEach(function (rg) {
          if (frame < rg.delay) return;
          rg.r += rg.spd;
          rg.life = Math.max(0, 1 - rg.r / rg.max);
          if (rg.life > 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, rg.r, 0, Math.PI * 2);
            ctx.strokeStyle = rg.color;
            ctx.lineWidth   = rg.lw;
            ctx.globalAlpha = rg.life * 0.55;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });

        /* 粒子 */
        particles.forEach(function (p) {
          if (p.delay > 0) { p.delay--; return; }
          p.x  += p.vx;
          p.y  += p.vy;
          p.vy += 0.13;
          p.vx *= 0.996;
          p.rot += p.rotV;
          p.life -= p.decay;
          if (p.life <= 0) return;

          ctx.globalAlpha = p.life;
          ctx.fillStyle   = p.color;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          if (p.type === 0) {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * .5, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 1) {
            ctx.fillRect(-p.size * .5, -p.size * .28, p.size, p.size * .55);
          } else {
            drawStar(ctx, 5, p.size * .5, p.size * .22);
            ctx.fill();
          }
          ctx.restore();
          ctx.globalAlpha = 1;
        });

        /* 環繞閃爍星形（動畫前 2/3 顯示） */
        if (elapsed < duration * 0.68) {
          sparkles.forEach(function (sp) {
            if (sp.delay > 0) { sp.delay--; return; }
            var pulse = (Math.sin(frame * sp.speed + sp.phase) + 1) * 0.5;
            ctx.globalAlpha = pulse * 0.75;
            ctx.fillStyle   = '#b3de73';
            ctx.save();
            ctx.translate(sp.x, sp.y);
            drawStar(ctx, 4, sp.size, sp.size * .38);
            ctx.fill();
            ctx.restore();
            ctx.globalAlpha = 1;
          });
        }

        frame++;

        /* 淡出（最後 900ms 開始） */
        var fadeAt = duration - 900;
        if (elapsed > fadeAt) {
          var pct = Math.min(1, (elapsed - fadeAt) / 800);
          ctx.fillStyle = 'rgba(12,13,12,' + (pct * 0.88) + ')';
          ctx.fillRect(0, 0, cv.width, cv.height);
          center.style.opacity = String(Math.max(0, 1 - pct * 1.5));
          hint.style.opacity   = String(Math.max(0, (1 - pct) * 0.2));
        }

        if (elapsed < duration) {
          self._raf = requestAnimationFrame(tick);
        } else {
          self._done();
        }
      }

      self._raf = requestAnimationFrame(tick);

      /* 點擊提前關閉 */
      ov.addEventListener('click', function () { self._done(); });
    }

    _done() {
      this._stop();
      this.dispatchEvent(new CustomEvent('sb-done', { bubbles: true }));
    }
  }

  customElements.define('success-blast', SuccessBlast);

})();
