/* =========================================================================
 * ui-post-beyond.js  <ui-post> 的相依增強，不修改 ui-post.js
 *
 * 屬性：
 *   <post-item avatar-glow>          這一則留言的頭像加光暈（先閃三下，之後維持）
 *   <post-item avatar-glow="yellow"> 值可寫色票名稱或任何 CSS 顏色
 *   <ui-post avatar-glow>            貼文作者（板主）頭像加光暈
 *
 * 只寫屬性名稱時，光暈使用頭像本身的底色。
 * 載入順序：放在 ui-post.js 之前或之後都可以。
 * ========================================================================= */
(function () {
  'use strict';
  if (window.UiPostBeyond) return;

  const COLORS = {
    shell: '#C6C7BD', vanilla: '#DBEDD8', yellow: '#E3D322', pink: '#FF91D7',
    red: '#EF6661', green: '#71CD76', blue: '#5DBAE8', indigo: '#778CE1',
    violet: '#B484E8', gray: '#86877F', key: '#51DBCF', calm: '#A3C4BC',
    quiet: '#8EA4DE', playful: '#FFA987', urgent: '#FF2E63',
    energetic: '#B6FF00', dreamy: '#C394CD', salmon: '#FFC88A'
  };

  const css = `
ui-post .upo-av.upb-glow{box-shadow:0 0 0 3px var(--upb-g),0 0 16px 6px var(--upb-g);animation:upb-glow-in .7s ease 3;}
@keyframes upb-glow-in{0%,100%{box-shadow:0 0 0 3px var(--upb-g),0 0 16px 6px var(--upb-g);}50%{box-shadow:0 0 0 5px var(--upb-g),0 0 26px 12px var(--upb-g);}}
`;
  function injectStyle() {
    if (document.getElementById('upb-style')) return;
    const s = document.createElement('style');
    s.id = 'upb-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function glowColor(v, av) {
    const k = (v || '').trim();
    if (!k) return getComputedStyle(av).backgroundColor;
    return COLORS[k.toLowerCase()] || k;
  }
  function apply(av, v) {
    if (!av) return;
    injectStyle();
    av.style.setProperty('--upb-g', glowColor(v, av));
    av.classList.add('upb-glow');
  }

  const seen = new WeakSet();

  function onShow(e) {
    const host = e.target;
    if (!host || host.tagName !== 'UI-POST') return;
    const i = e.detail && e.detail.index;
    const src = (host._items && host._items[i]) || host.querySelectorAll(':scope > post-item')[i];
    const fresh = [];
    host.querySelectorAll('.upo-item').forEach((el) => { if (!seen.has(el)) { seen.add(el); fresh.push(el); } });
    if (!src || !src.hasAttribute('avatar-glow')) return;
    fresh.forEach((el) => apply(el.querySelector(':scope > .upo-av'), src.getAttribute('avatar-glow')));
  }

  function watchHead(host) {
    if (host.__upbHead || !host.hasAttribute('avatar-glow')) return;
    host.__upbHead = true;
    const tryApply = () => {
      const av = host.querySelector('.upo-head > .upo-av');
      if (!av) return false;
      apply(av, host.getAttribute('avatar-glow'));
      return true;
    };
    if (tryApply()) return;
    const mo = new MutationObserver(() => { if (tryApply()) mo.disconnect(); });
    mo.observe(host, { childList: true, subtree: true });
  }

  function scan(root) {
    (root || document).querySelectorAll('ui-post').forEach(watchHead);
  }

  document.addEventListener('post-item-show', onShow);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan());
  else scan();

  window.UiPostBeyond = { scan };
})();
