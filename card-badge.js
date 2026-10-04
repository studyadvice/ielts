class CardBadge extends HTMLElement {
  constructor() {
    super();
    this.isCollapsed  = false;
    this.currentCount = 0;
    this.rotateIndex  = 0;
    this.autoRotateTimer = null;
    this._uid  = 'cb-' + Math.random().toString(36).slice(2, 9);
    this._root = null;
  }

  static get observedAttributes() {
    return [
      'type', 'value', 'text', 'icon',
      'theme', 'outline', 'size', 'font-size', 'padding',
      'clickable', 'action', 'data-filter',
      'source', 'target', 'toggle-target', 'removeself',
      'format', 'warning-days',
      'alert-message', 'alert-type', 'alert-duration', 'alert-position', 'alert-source',
      'hover-effect', 'focus-color', 'disabled',
      'font-control', 'font-step',
      'count', 'max-count', 'show-zero', 'dot-mode', 'count-animate',
      'href', 'href-target',
      'copy-html'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._root) return;

    if (name === 'count' && oldValue !== newValue) {
      const oldCount = parseInt(oldValue) || 0;
      const newCount = parseInt(newValue) || 0;
      this.currentCount = newCount;

      if (this.getAttribute('count-animate') !== 'false') {
        this.animateCountChange(oldCount, newCount);
      } else {
        this.render();
      }
    } else {
      this.render();
    }
  }

  getBrandColors() {
    return {
      'background': '#0C0D0C',
      'fill'      : '#1a1b1a',       // 元件內部深背景
      'shell'     : '#C6C7BD',       // main text
      'lavender'  : '#C3A5E5',
      'special'   : '#b3de73',
      'warning'   : '#F08080',
      'salmon'    : '#E5C3B3',
      'sky'       : '#95c9de',
      'ocean'     : '#0ABDC6',
      'safe'      : '#299459',
      'vanilla'   : '#DBEDD8',
      'yellow'    : '#DECA4B',
      'focus'     : '#E0BE79',
      'info'      : '#1E65C7',
      'stone'     : '#95c9de',
      'teal'      : '#0DA591',
      'indigo'    : '#9B72CF',
      'pink'      : '#FFB3D9',
      'orange'    : '#EDA109'
    };
  }

  parseColor(colorValue) {
    if (!colorValue) return null;
    const brandColors = this.getBrandColors();
    return brandColors[colorValue.toLowerCase()] || colorValue;
  }

  getContrastColor(bgColor) {
    if (!bgColor) return '#C6C7BD';

    let color = this.parseColor(bgColor);
    color = color.replace('#', '');

    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#0C0D0C' : '#C6C7BD';
  }

  hexToRgba(hex, alpha = 1) {
    if (!hex) return null;

    hex = this.parseColor(hex);
    hex = hex.replace('#', '');

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 透明度規範：非黑色陰影一律 >= 0.76
    const clampedAlpha = Math.max(alpha, 0.76);
    return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
  }

  /* 提供一個允許低透明度的內部 rgba 方法，專用於陰影、outline 底色等視覺輔助元素 */
  _hexToRgbaRaw(hex, alpha = 1) {
    if (!hex) return null;
    hex = this.parseColor(hex);
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  getInheritedTheme() {
    let parent = this.parentElement;
    while (parent) {
      if (parent.tagName === 'CARD-V3') {
        return parent.getAttribute('theme') || 'shell';
      }
      parent = parent.parentElement;
    }
    return 'shell';
  }

  parseTheme() {
    const themeAttr = this.getAttribute('theme') || this.getInheritedTheme();

    if (themeAttr.endsWith('-outline')) {
      const colorName = themeAttr.replace('-outline', '');
      return { color: this.parseColor(colorName), isOutline: true };
    }

    return { color: this.parseColor(themeAttr), isOutline: false };
  }

  getThemeColor() {
    const theme = this.getAttribute('theme') || this.getInheritedTheme();
    return this.parseColor(theme.replace('-outline', ''));
  }

  formatCount(count) {
    const maxCount = parseInt(this.getAttribute('max-count')) || 99;
    return count > maxCount ? `${maxCount}+` : count.toString();
  }

  isCountBadge() { return this.hasAttribute('count'); }
  isDotMode()    { return this.getAttribute('dot-mode') === 'true'; }

  animateCountChange(oldCount, newCount) {
    const badge = this.querySelector('.badge');
    if (!badge) { this.render(); return; }

    badge.classList.add('count-change');
    this.render();

    setTimeout(() => {
      const nb = this.querySelector('.badge');
      if (nb) nb.classList.remove('count-change');
    }, 300);
  }

  /* ─────────────────────────────────────────────
     日期 / 時間格式化
  ───────────────────────────────────────────── */
  formatDate(dateString, format = 'YYYY-MM-DD') {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day   = String(date.getDate()).padStart(2, '0');

    if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
    if (format === 'MM/DD')      return `${month}/${day}`;
    if (format === 'MM-DD')      return `${month}-${day}`;
    return `${year}-${month}-${day}`;
  }

  formatTime(timeString) {
    const date = new Date(`2000-01-01T${timeString}`);
    if (isNaN(date.getTime())) return timeString;

    const hours   = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDateTime(datetimeString, format = 'MM/DD HH:mm') {
    const date = new Date(datetimeString);
    if (isNaN(date.getTime())) return datetimeString;

    const month   = String(date.getMonth() + 1).padStart(2, '0');
    const day     = String(date.getDate()).padStart(2, '0');
    const hours   = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${month}/${day} ${hours}:${minutes}`;
  }

  formatDeadline(dateString) {
    const deadline = new Date(dateString);
    const now      = new Date();

    if (isNaN(deadline.getTime())) return dateString;

    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const warningDays = parseInt(this.getAttribute('warning-days')) || 3;

    if (diffDays < 0)            return { text: `已逾期 ${Math.abs(diffDays)} 天`, isWarning: true,  isOverdue: true  };
    if (diffDays === 0)          return { text: '今天到期',                         isWarning: true,  isOverdue: false };
    if (diffDays === 1)          return { text: '明天到期',                         isWarning: true,  isOverdue: false };
    if (diffDays <= warningDays) return { text: `還剩 ${diffDays} 天`,             isWarning: true,  isOverdue: false };
    return                              { text: `還剩 ${diffDays} 天`,             isWarning: false, isOverdue: false };
  }

  /* ─────────────────────────────────────────────
     顯示內容解析
  ───────────────────────────────────────────── */
  getDisplayContent() {
    const action = this.getAttribute('action');

    // rotate-self / rotate-self-auto 模式
    if (action === 'rotate-self' || action === 'rotate-self-auto') {
      const items = this.getBadgeItems();
      if (items.length > 0) {
        const currentItem = items[this.rotateIndex];
        const itemText    = currentItem.getAttribute('text') || currentItem.textContent || '';
        const itemIcon    = currentItem.getAttribute('icon') || '';
        const itemTheme   = currentItem.getAttribute('theme');
        const finalTheme  = itemTheme ? this.parseColor(itemTheme) : this.getThemeColor();

        return { icon: itemIcon, text: itemText.trim(), theme: finalTheme };
      }
    }

    const type   = this.getAttribute('type');
    const value  = this.getAttribute('value');
    const text   = this.getAttribute('text');
    const icon   = this.getAttribute('icon');
    const format = this.getAttribute('format');

    // 數量型 badge
    if (this.isCountBadge()) {
      const count    = parseInt(this.getAttribute('count')) || 0;
      const showZero = this.getAttribute('show-zero') === 'true';
      const dotMode  = this.isDotMode();

      if (count === 0 && !showZero) return null;

      if (dotMode) {
        return { icon: '', text: '', theme: this.getThemeColor(), isCountBadge: true, isDot: true,  count };
      }
      return   { icon: icon || '', text: this.formatCount(count), theme: this.getThemeColor(), isCountBadge: true, isDot: false, count };
    }

    // 格式化類型
    if (type && value) {
      switch (type) {
        case 'date':
          return { icon: icon || '', text: this.formatDate(value, format),     theme: this.getThemeColor() };
        case 'time':
          return { icon: icon || '', text: this.formatTime(value),             theme: this.getThemeColor() };
        case 'datetime':
          return { icon: icon || '', text: this.formatDateTime(value, format), theme: this.getThemeColor() };
        case 'deadline': {
          const di = this.formatDeadline(value);
          const deadlineTheme = di.isOverdue
            ? this.parseColor('warning')
            : (di.isWarning ? this.parseColor('yellow') : this.getThemeColor());
          return { icon: icon || (di.isOverdue ? '⚠️' : '📅'), text: di.text, theme: deadlineTheme };
        }
      }
    }

    // 一般顯示
    return { icon: icon || '', text: text || '', theme: this.getThemeColor() };
  }

  getSizeStyles() {
    const size           = this.getAttribute('size') || 'md';
    const customFontSize = this.getAttribute('font-size');
    const customPadding  = this.getAttribute('padding');

    const sizePresets = {
      'xs': { fontSize: '0.558rem', padding: '1px 6px',   width: '8px',  height: '8px'  },
      'sm': { fontSize: '0.713rem', padding: '2px 8px',   width: '10px', height: '10px' },
      'md': { fontSize: '0.838rem', padding: '3px 10px',  width: '10px', height: '10px' },
      're': { fontSize: '1.01rem',  padding: '4px 10px',  width: '12px', height: '12px' },
      'lg': { fontSize: '1.363rem', padding: '6px 12px',  width: '14px', height: '14px' },
      'xl': { fontSize: '1.758rem', padding: '8px 14px',  width: '16px', height: '16px' }
    };

    const preset = sizePresets[size] || sizePresets['re'];

    return {
      fontSize: customFontSize || preset.fontSize,
      padding:  customPadding  || preset.padding,
      width:    preset.width,
      height:   preset.height
    };
  }

  showPageAlert(message, type = 'info', duration = 4000, position = 'top') {
    const existingAlert = document.querySelector('.card-badge-page-alert');
    if (existingAlert) existingAlert.remove();

    const brandColors = this.getBrandColors();
    const alertAliases = {
      'info'   : brandColors.info,
      'success': brandColors.safe,
      'warning': brandColors.yellow,
      'danger' : brandColors.warning
    };

    const bgColor   = alertAliases[type] || brandColors[type] || brandColors.info;
    const textColor = this.getContrastColor(bgColor);

    const positionStyles = {
      'top'         : 'top: 20px; left: 50%; transform: translateX(-50%);',
      'top-left'    : 'top: 20px; left: 20px;',
      'top-right'   : 'top: 20px; right: 20px;',
      'bottom'      : 'bottom: 20px; left: 50%; transform: translateX(-50%);',
      'bottom-left' : 'bottom: 20px; left: 20px;',
      'bottom-right': 'bottom: 20px; right: 20px;'
    };

    const alertDiv = document.createElement('div');
    alertDiv.className = `card-badge-page-alert alert-${type}`;
    alertDiv.style.cssText = `
      position: fixed;
      ${positionStyles[position] || positionStyles['top']}
      z-index: 10000;
      background: ${bgColor};
      color: ${textColor};
      padding: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      font-size: 1rem;
      font-weight: 500;
      animation: cbAlertIn 0.3s ease-out;
      max-width: 90%;
      word-wrap: break-word;
      letter-spacing: 0.01em;
    `;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes cbAlertIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      alertDiv.style.opacity = '0';
      alertDiv.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => { alertDiv.remove(); style.remove(); }, 300);
    }, duration);
  }

  updateCollapseIndicator() {
    const iconElement = this.querySelector('.badge i, .badge .icon');
    if (iconElement) {
      iconElement.style.transform = this.isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  }

  connectedCallback() {
    // 設置作用域 ID
    this.setAttribute('data-badge-id', this._uid);

    // 建立渲染容器（display:contents 讓它對布局透明）
    this._root = document.createElement('div');
    this._root.className = 'cb-render-root';
    this._root.style.cssText = 'display: contents;';
    // 插在最前面，badge-item 子元素仍保留在後方
    this.insertBefore(this._root, this.firstChild);

    this.render();
    this.setupEventHandlers();

    if (this.getAttribute('action') === 'rotate-self-auto') {
      this.startAutoRotate();
    }
  }

  disconnectedCallback() {
    this.stopAutoRotate();
  }

  getBadgeItems() {
    return Array.from(this.querySelectorAll('badge-item'));
  }

  parseInterval(intervalStr) {
    if (!intervalStr) return 3000;
    const match = intervalStr.match(/^(\d+(?:\.\d+)?)(s|m)?$/i);
    if (!match) return 3000;
    const value = parseFloat(match[1]);
    const unit  = (match[2] || 's').toLowerCase();
    return unit === 'm' ? value * 60 * 1000 : value * 1000;
  }

  startAutoRotate() {
    if (this.getAttribute('action') !== 'rotate-self-auto') return;
    const interval = this.parseInterval(this.getAttribute('interval'));
    this.stopAutoRotate();
    this.autoRotateTimer = setInterval(() => {
      this.performRotateSelf(true);
    }, interval);
  }

  stopAutoRotate() {
    if (this.autoRotateTimer) {
      clearInterval(this.autoRotateTimer);
      this.autoRotateTimer = null;
    }
  }

  performRotateContent() {
    const target = this.getAttribute('target');
    if (!target) { console.warn('Card-Badge: rotate-content 模式需要指定 target 屬性'); return; }

    const targetEl = document.getElementById(target);
    if (!targetEl) { console.warn(`Card-Badge: 找不到目標元素 #${target}`); return; }

    const items = this.getBadgeItems();
    if (items.length === 0) { console.warn('Card-Badge: 沒有找到 badge-item 子元素'); return; }

    targetEl.innerHTML = items[this.rotateIndex].innerHTML;
    this.rotateIndex = (this.rotateIndex + 1) % items.length;

    this.dispatchEvent(new CustomEvent('badge-rotate', {
      bubbles: true,
      detail: { mode: 'content', currentIndex: this.rotateIndex, totalItems: items.length, targetId: target }
    }));
  }

  performRotateSelf(isAuto = false) {
    const items = this.getBadgeItems();
    if (items.length === 0) { console.warn('Card-Badge: 沒有找到 badge-item 子元素'); return; }

    this.rotateIndex = (this.rotateIndex + 1) % items.length;
    this.render();

    if (!isAuto) this.expandCurrentItem();

    this.dispatchEvent(new CustomEvent('badge-rotate', {
      bubbles: true,
      detail: { mode: 'self', isAuto, currentIndex: this.rotateIndex, totalItems: items.length }
    }));
  }

  expandCurrentItem() {
    const target = this.getAttribute('target');
    if (!target) return;

    const targetEl = document.getElementById(target);
    if (!targetEl) { console.warn(`Card-Badge: 找不到目標元素 #${target}`); return; }

    const items = this.getBadgeItems();
    if (items.length === 0) return;

    targetEl.innerHTML = items[this.rotateIndex].innerHTML;

    this.dispatchEvent(new CustomEvent('badge-expand', {
      bubbles: true,
      detail: { currentIndex: this.rotateIndex, totalItems: items.length, targetId: target }
    }));
  }

  setupEventHandlers() {
    const clickable    = this.getAttribute('clickable') === 'true';
    const action       = this.getAttribute('action');
    const filterValue  = this.getAttribute('data-filter');
    const source       = this.getAttribute('source');
    const target       = this.getAttribute('target');
    const toggleTarget = this.getAttribute('toggle-target');
    const removeSelf   = this.getAttribute('removeself') === 'true';
    const fontControl  = this.getAttribute('font-control');
    const disabled     = this.getAttribute('disabled') === 'true';
    const href         = this.getAttribute('href');

    if (disabled) return;

    if (clickable || action || filterValue || toggleTarget || fontControl || href) {
      this.setAttribute('tabindex', '0');
      this.style.cursor = 'pointer';

      const handleClick = () => {
        if (this.getAttribute('disabled') === 'true') return;

        // 連結
        const currentHref = this.getAttribute('href');
        if (currentHref) {
          window.open(currentHref, this.getAttribute('href-target') || '_self');
        }

        // 輪播
        const currentAction = this.getAttribute('action');
        if (currentAction === 'rotate-content')  { this.performRotateContent(); return; }
        if (currentAction === 'rotate-self')      { this.performRotateSelf();    return; }
        if (currentAction === 'rotate-self-auto') { this.expandCurrentItem();    return; }

        // Toggle 折疊
        const toggleId = this.getAttribute('toggle-target');
        if (toggleId) {
          const targetElement = document.getElementById(toggleId);
          if (targetElement) {
            this.isCollapsed = !this.isCollapsed;
            targetElement.dataset.cardBadgeCollapsed = this.isCollapsed;

            if (this.isCollapsed) {
              targetElement.style.transition = 'all 0.3s ease';
              targetElement.style.height     = targetElement.scrollHeight + 'px';
              requestAnimationFrame(() => {
                targetElement.style.height  = '0';
                targetElement.style.opacity = '0';
              });
              setTimeout(() => { targetElement.style.display = 'none'; }, 300);
            } else {
              targetElement.style.display  = '';
              targetElement.style.height   = '0';
              targetElement.style.opacity  = '0';
              requestAnimationFrame(() => {
                targetElement.style.height  = targetElement.scrollHeight + 'px';
                targetElement.style.opacity = '1';
              });
              setTimeout(() => { targetElement.style.height = ''; }, 300);
            }

            this.updateCollapseIndicator();
          }
        }

        // 過濾
        const currentFilter = this.getAttribute('data-filter');
        if (this.getAttribute('action') === 'filter' && currentFilter) {
          document.querySelectorAll('[data-filter-group]').forEach(item => {
            const groups = item.getAttribute('data-filter-group').split(',').map(f => f.trim());
            item.style.display = (currentFilter === 'all' || groups.includes(currentFilter)) ? '' : 'none';
          });
        }

        // 複製
        if (this.getAttribute('action') === 'copy') {
          const copyHtml    = this.getAttribute('copy-html') === 'true';
          const currentSrc  = this.getAttribute('source');
          let contentToCopy = this.getAttribute('text') || '';

          if (currentSrc) {
            const sourceEl = document.getElementById(currentSrc);
            if (sourceEl) {
              contentToCopy = (sourceEl.tagName === 'INPUT' || sourceEl.tagName === 'TEXTAREA')
                ? sourceEl.value
                : (copyHtml ? sourceEl.innerHTML : (sourceEl.textContent || sourceEl.innerText));
            }
          }

          const currentTarget = this.getAttribute('target');
          if (currentTarget) {
            const targetEl = document.getElementById(currentTarget);
            if (targetEl) {
              if (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA') {
                targetEl.value = contentToCopy;
              } else {
                copyHtml ? (targetEl.innerHTML = contentToCopy) : (targetEl.textContent = contentToCopy);
              }
            }
          }

          if (contentToCopy) {
            const textForClipboard = copyHtml
              ? (new DOMParser().parseFromString(contentToCopy, 'text/html')).body.textContent || ''
              : contentToCopy;
            navigator.clipboard.writeText(textForClipboard).catch(err => {
              console.error('複製失敗：', err);
            });
          }
        }

        // 移除自身
        if (this.getAttribute('removeself') === 'true') {
          this.style.transition = 'all 0.3s ease';
          this.style.opacity    = '0';
          this.style.transform  = 'scale(0.8)';
          setTimeout(() => { this.remove(); }, 300);
        }

        // 字體控制
        const currentFontControl = this.getAttribute('font-control');
        if (currentFontControl) {
          const targetEl = document.getElementById(currentFontControl);
          if (targetEl) {
            const currentSize = parseFloat(window.getComputedStyle(targetEl).fontSize);
            const step        = parseFloat(this.getAttribute('font-step')) || 2;
            const actionType  = this.getAttribute('action');

            if (actionType === 'font-increase') {
              targetEl.style.fontSize = Math.min(currentSize + step, 32) + 'px';
            } else if (actionType === 'font-decrease') {
              targetEl.style.fontSize = Math.max(currentSize - step, 12) + 'px';
            } else if (actionType === 'font-reset') {
              targetEl.style.fontSize = '';
            }
          }
        }

        // 提示訊息
        let finalAlertMessage = this.getAttribute('alert-message');
        const alertSource     = this.getAttribute('alert-source');

        if (alertSource && !finalAlertMessage) {
          const sourceEl = document.getElementById(alertSource);
          if (sourceEl) {
            finalAlertMessage = sourceEl.textContent || sourceEl.innerText || sourceEl.value || '';
          } else {
            console.warn(`Card-Badge: 找不到 alert-source 元素 #${alertSource}`);
          }
        }

        if (finalAlertMessage) {
          const alertType     = this.getAttribute('alert-type')     || 'info';
          const alertDuration = this.hasAttribute('alert-duration')
            ? parseInt(this.getAttribute('alert-duration'))
            : 4000;
          const alertPosition = this.getAttribute('alert-position') || 'top';
          this.showPageAlert(finalAlertMessage, alertType, alertDuration, alertPosition);
        }

        // 自訂事件
        this.dispatchEvent(new CustomEvent('badge-click', {
          bubbles: true,
          detail: {
            action       : this.getAttribute('action'),
            filter       : this.getAttribute('data-filter'),
            source       : this.getAttribute('source'),
            target       : this.getAttribute('target'),
            toggleTarget : this.getAttribute('toggle-target'),
            fontControl  : this.getAttribute('font-control'),
            isCollapsed  : this.isCollapsed,
            type         : this.getAttribute('type'),
            value        : this.getAttribute('value'),
            text         : this.getAttribute('text'),
            count        : this.currentCount,
            href         : this.getAttribute('href'),
            alertMessage : finalAlertMessage
          }
        }));
      };

      this.addEventListener('click', handleClick);

      this.addEventListener('keydown', (e) => {
        if (this.getAttribute('disabled') === 'true') return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      });
    }
  }

  renderIcon(iconValue) {
    if (!iconValue) return '';
    return iconValue.startsWith('bi-')
      ? `<i class="bi ${iconValue}"></i>`
      : `<span class="icon">${iconValue}</span>`;
  }

  getHoverEffect(scope = 'card-badge') {
    const hoverEffect  = this.getAttribute('hover-effect') || 'lift';
    const clickable    = this.getAttribute('clickable') === 'true';
    const toggleTarget = this.getAttribute('toggle-target');

    if (!clickable && !toggleTarget) return '';

    const uid = this._uid;

    const effects = {
      'lift': `
        ${scope}:hover .badge {
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
        }
        ${scope}:active .badge {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `,
      'scale': `
        ${scope}:hover .badge {
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        }
        ${scope}:active .badge {
          transform: scale(1.02);
        }
      `,
      'glow': `
        ${scope}:hover .badge {
          box-shadow: 0 0 20px var(--glow-color);
          filter: brightness(1.15);
        }
        ${scope}:active .badge {
          filter: brightness(1.05);
        }
      `,
      'pulse': `
        @keyframes badge-pulse-${uid} {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.05); }
        }
        ${scope}:hover .badge {
          animation: badge-pulse-${uid} 0.6s ease-in-out;
        }
      `,
      'rotate': `
        ${scope}:hover .badge {
          transform: rotate(2deg) translateY(-2px);
          box-shadow: 0 5px 14px rgba(0, 0, 0, 0.35);
        }
        ${scope}:active .badge {
          transform: rotate(0deg);
        }
      `,
      'none': ''
    };

    return effects[hoverEffect] || effects.lift;
  }

  /* ─────────────────────────────────────────────
     渲染（Light DOM + 作用域 CSS）
  ───────────────────────────────────────────── */
  render() {
    const content = this.getDisplayContent();

    if (content === null) {
      this.style.display = 'none';
      return;
    } else {
      this.style.display = '';
    }

    const themeInfo     = this.parseTheme();
    const manualOutline = this.getAttribute('outline') === 'true';
    const sizeStyles    = this.getSizeStyles();
    const clickable     = this.getAttribute('clickable') === 'true';
    const toggleTarget  = this.getAttribute('toggle-target');
    const fontControl   = this.getAttribute('font-control');
    const disabled      = this.getAttribute('disabled') === 'true';
    const focusColor    = this.parseColor(this.getAttribute('focus-color')) || content.theme;
    const isOutline     = themeInfo.isOutline || manualOutline;

    let bgColor, textColor, borderStyle;

    if (disabled) {
      // ★ disabled 狀態：rgba 透明度 >= 0.72
      bgColor     = 'rgba(100, 100, 100, 0.76)';
      textColor   = 'rgba(198, 199, 189, 0.76)';
      borderStyle = '1px solid rgba(150, 150, 150, 0.76)';
    } else if (isOutline) {
      // outline 底色使用低透明輔助方法（視覺設計用途），前景色不透明
      bgColor     = this._hexToRgbaRaw(content.theme, 0.12);
      textColor   = content.theme;
      borderStyle = `1px solid ${content.theme}`;
    } else {
      bgColor     = content.theme;
      textColor   = this.getContrastColor(content.theme);
      borderStyle = 'none';
    }

    const scope       = `[data-badge-id="${this._uid}"]`;
    const uid         = this._uid;
    const hoverStyles = disabled ? '' : this.getHoverEffect(scope);
    const useBootstrapIcons = content.icon && content.icon.startsWith('bi-');
    const isDotMode   = content.isDot;

    const dotStyles = isDotMode ? `
      width: ${sizeStyles.width};
      height: ${sizeStyles.height};
      padding: 0;
      border-radius: 50%;
      min-width: ${sizeStyles.width};
      min-height: ${sizeStyles.height};
    ` : '';

    const glowColor = this._hexToRgbaRaw(content.theme, 0.55);
    const focusRingColor = this.hexToRgba(focusColor, 0.72);
    this._root.innerHTML = `
      <style>
        ${useBootstrapIcons ? '@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");' : ''}

        ${scope} {
          display: inline-block;
          vertical-align: middle;
          --glow-color: ${glowColor};
        }

        ${scope} .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: ${sizeStyles.padding};
          background: ${bgColor};
          color: ${textColor};
          border: ${borderStyle};
          border-radius: 12px;
          font-size: ${sizeStyles.fontSize};
          font-weight: 500;
          white-space: nowrap;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 4px;
          user-select: none;
          letter-spacing: 0.01em;
          ${dotStyles}
          ${disabled ? 'opacity: 0.6; cursor: not-allowed;' : ''}
        }

        ${scope} .badge.count-change {
          animation: count-pop-${uid} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes count-pop-${uid} {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        ${hoverStyles}

        ${(clickable || toggleTarget || fontControl) && !disabled ? `
          ${scope}:focus {
            outline: none;
          }
          ${scope}:focus .badge {
            box-shadow: 0 0 0 3px ${focusRingColor};
            transform: translateY(-1px);
          }
          ${scope}:focus:not(:focus-visible) .badge {
            box-shadow: none;
            transform: none;
          }
        ` : ''}

        ${disabled ? `
          ${scope} .badge * { pointer-events: none; }
        ` : ''}

        ${scope} .icon {
          display: inline-block;
          line-height: 1;
          transition: transform 0.3s ease;
        }

        ${scope} .badge i {
          display: inline-block;
          line-height: 1;
          transition: transform 0.3s ease;
        }

        ${scope} .text {
          display: inline-block;
          line-height: 1;
        }
      </style>

      <div class="badge">
        ${!isDotMode ? this.renderIcon(content.icon) : ''}
        ${!isDotMode && content.text ? `<span class="text">${content.text}</span>` : ''}
      </div>
    `;

    if (toggleTarget && !disabled) {
      const targetElement = document.getElementById(toggleTarget);
      if (targetElement) {
        this.isCollapsed = targetElement.dataset.cardBadgeCollapsed === 'true';

        if (this.isCollapsed) {
          targetElement.style.display  = 'none';
          targetElement.style.height   = '0';
          targetElement.style.opacity  = '0';
        }

        this.updateCollapseIndicator();
      }
    }
  }
}

class BadgeItem extends HTMLElement {
  connectedCallback() {
    this.style.display = 'none';
  }
}

customElements.define('card-badge', CardBadge);
customElements.define('badge-item', BadgeItem);
