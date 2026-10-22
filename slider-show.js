class SliderShow extends HTMLElement {
  constructor() {
    super();
    this.currentPart = 1;
    this.currentSlideInPart = 0;
    this.partsData = {};
    this.isTransitioning = false;
    this.container = null;
  }

  static get observedAttributes() {
    return [
      'theme', 'height', 'current-part',
      'next-part-btn-text', 'prev-part-btn-text',
      'finish-btn-text', 'restart-btn-text',
      'next-part-btn-position', 'show-part-indicator',
      'part-transition', 'auto-hide-nav', 'auto-show-part-buttons',
      'arrow-color', 'arrow-bg', 'dot-color', 'active-dot-color',
      'show-dots', 'show-arrows', 'loop', 'show-page-numbers',
      'progress-style', 'progress-scope',
      'update-header', 'update-title', 'header-template', 'title-template',
      'part-btn-color', 'part-btn-bg', 'part-btn-font-size',
      'part-btn-padding', 'part-btn-border-radius',
      'show-finish', 'show-restart',
      'finish-btn-bg', 'finish-btn-color',
      'restart-btn-bg', 'restart-btn-color',
      'fontcolor-subtitle', 'fontcolor-main', 'fontcolor-footer',
      'fill-color',
      'extra-note-hover-color', 'extra-note-prefix', 'extra-note-postfix',
      'spoiler-mode', 'spoiler-text', 'spoiler-color',
      'quiz-require-complete',
      'start-style', 'end-style', 'start-colors', 'end-colors'
    ];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.analyzeParts();
    this.setupExtraNotes();
    this.setupSpoilerMasks();
    this.setupQuizzes();

    setTimeout(() => {
      this.updateDisplay();
    }, 0);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.isConnected && oldValue !== newValue) {
      if (name === 'current-part') {
        this.currentPart = parseInt(newValue) || 1;
        this.currentSlideInPart = 0;
        this.updateDisplay();
      } else {
        this.render();
        this.setupEventListeners();
        this.updateDisplay();
      }
    }
  }

  parseColor(colorValue) {
    if (!colorValue) return null;

    const brandColors = {
      'background': '#0C0D0C',
      'fill': '#1A1B1A',
      'shell': '#C6C7BD',
      'lavender': '#C3A5E5',
      'sky': '#82C8E5',
      'warning': '#E6374B',
      'salmon': '#E5C3B3',
      'ocean': '#1CCAE8',
      'safe': '#27AE60',
      'teal': '#0DA591',
      'vanilla': '#DBEDD8',
      'yellow': '#E3D322',
      'focus': '#D4FFFC',
      'special': '#B3DE73',
      'info': '#4171BF',
      'indigo': '#7849C9',
      'pink': '#FF91D7',
      'orange': '#EDA109'
    };

    if (brandColors[colorValue.toLowerCase()]) {
      return brandColors[colorValue.toLowerCase()];
    }

    return colorValue;
  }

  // 解析「色票A,色票B」這種成對顏色屬性，缺值時用 fallbackNames 補上
  parseColorPair(attrValue, fallbackNames) {
    const parts = attrValue ? attrValue.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const a = this.parseColor(parts[0]) || this.parseColor(fallbackNames[0]);
    const b = this.parseColor(parts[1]) || this.parseColor(fallbackNames[1]);
    return [a, b];
  }

  getThemeColor() {
    let theme = this.getAttribute('theme') || 'shell';
    const isOutlineTheme = theme.endsWith('-outline');
    const baseTheme = isOutlineTheme ? theme.replace('-outline', '') : theme;

    return this.parseColor(baseTheme) || this.parseColor('shell');
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

  analyzeParts() {
    const allSlides = Array.from(this.querySelectorAll('[slide]'));

    this.partsData = {};

    allSlides.forEach(slide => {
      const part = parseInt(slide.getAttribute('part')) || 1;
      if (!this.partsData[part]) {
        this.partsData[part] = [];
      }
      this.partsData[part].push(slide);
    });

    allSlides.forEach(slide => {
      slide.classList.remove('active-slide');
      slide.style.display = 'none';
    });
  }

  // 新增：設置 extra-note 功能
  setupExtraNotes() {
    // 獲取全局的 prefix 和 postfix 設置
    const globalPrefix = this.getAttribute('extra-note-prefix') || '';
    const globalPostfix = this.getAttribute('extra-note-postfix') || '';

    // 找到所有的 extra-note 元素
    const extraNotes = this.querySelectorAll('extra-note');

    extraNotes.forEach(note => {
      // 獲取屬性，如果沒有設置則使用全局設置
      const targetId = note.getAttribute('target');
      const source = note.getAttribute('source');
      const prefix = note.getAttribute('prefix') !== null ? note.getAttribute('prefix') : globalPrefix;
      const postfix = note.getAttribute('postfix') !== null ? note.getAttribute('postfix') : globalPostfix;

      if (!targetId || !source) {
        console.warn('extra-note 需要 target 和 source 屬性');
        return;
      }

      // 將 extra-note 轉換為 span，並添加底線樣式
      const span = document.createElement('span');
      span.className = 'extra-note-trigger';

      // 處理 prefix（支援 Bootstrap Icons）
      let prefixHTML = '';
      if (prefix) {
        // 檢查 prefix 是否包含 bootstrap icon 類別名稱
        const iconMatch = prefix.match(/bi-[\w-]+/);
        if (iconMatch) {
          const iconClass = iconMatch[0];
          const textBefore = prefix.substring(0, prefix.indexOf(iconClass));
          const textAfter = prefix.substring(prefix.indexOf(iconClass) + iconClass.length);
          prefixHTML = `${textBefore}<i class="bi ${iconClass}"></i>${textAfter}`;
        } else {
          prefixHTML = prefix;
        }
      }

      // 組合內容
      span.innerHTML = prefixHTML + note.innerHTML + postfix;

      // 添加點擊事件
      span.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const targetElement = document.getElementById(targetId);
        if (!targetElement) {
          console.warn(`找不到 id 為 ${targetId} 的元素`);
          return;
        }

        // 判斷 source 是 ID 還是純文字內容
        const sourceElement = document.getElementById(source);
        let content;

        if (sourceElement) {
          // 從指定的 div 複製 HTML 內容
          content = sourceElement.innerHTML;
        } else {
          // 使用 source 作為純文字內容
          content = source;
        }

        // 創建內容容器
        const contentDiv = document.createElement('div');
        contentDiv.className = 'extra-note-content';
        contentDiv.innerHTML = content;

        // 清空目標區域並添加新內容
        targetElement.innerHTML = '';
        targetElement.appendChild(contentDiv);

        // 添加淡入動畫
        setTimeout(() => {
          contentDiv.classList.add('show');
        }, 10);
      });

      // 替換原始的 extra-note 標籤
      note.parentNode.replaceChild(span, note);
    });
  }

  // 新增：設置防劇透遮罩功能
  setupSpoilerMasks() {
    const spoilerMode = this.getAttribute('spoiler-mode');
    const globalSpoilerText = this.getAttribute('spoiler-text') || '點擊查看內容';
    const spoilerColor = this.parseColor(this.getAttribute('spoiler-color')) || this.getThemeColor();

    // 處理整頁防劇透模式
    if (spoilerMode === 'true' || spoilerMode === 'full') {
      const allSlides = Array.from(this.querySelectorAll('[slide]'));
      allSlides.forEach(slide => {
        this.applySpoilerMask(slide, globalSpoilerText, spoilerColor);
      });
    }

    // 處理帶有 spoiler 屬性的 div
    const spoilerDivs = this.querySelectorAll('[spoiler]');
    spoilerDivs.forEach(div => {
      const customText = div.getAttribute('spoiler') || globalSpoilerText;
      this.applySpoilerMask(div, customText, spoilerColor);
    });
  }

  // 應用防劇透遮罩
  applySpoilerMask(element, text, color) {
    // 如果元素已經有遮罩，不重複添加
    if (element.classList.contains('spoiler-masked')) {
      return;
    }

    // 標記元素
    element.classList.add('spoiler-masked');
    element.style.position = 'relative';

    // 創建遮罩
    const mask = document.createElement('div');
    mask.className = 'spoiler-mask';
    mask.style.position = 'absolute';
    mask.style.top = '0';
    mask.style.left = '0';
    mask.style.width = '100%';
    mask.style.height = '100%';
    mask.style.backgroundColor = color;
    mask.style.display = 'flex';
    mask.style.alignItems = 'center';
    mask.style.justifyContent = 'center';
    mask.style.cursor = 'pointer';
    mask.style.zIndex = '100';
    mask.style.transition = 'opacity 0.3s ease';
    mask.style.borderRadius = '8px';

    // 創建文字容器
    const textContainer = document.createElement('div');
    textContainer.style.textAlign = 'center';
    textContainer.style.padding = '12px';
    textContainer.style.color = this.getContrastColor(color);
    textContainer.style.fontSize = '1.2rem';
    textContainer.style.fontWeight = '500';
    textContainer.style.lineHeight = '1.6';
    textContainer.style.display = 'flex';
    textContainer.style.alignItems = 'center';
    textContainer.style.justifyContent = 'center';
    textContainer.style.height = '100%';
    textContainer.innerHTML = text;

    mask.appendChild(textContainer);

    // 添加點擊事件
    mask.addEventListener('click', (e) => {
      e.stopPropagation();
      mask.style.opacity = '0';
      setTimeout(() => {
        mask.remove();
        element.classList.remove('spoiler-masked');
      }, 300);
    });

    element.appendChild(mask);
  }

  // 設置填空題功能
  setupQuizzes() {
    const quizElements = this.querySelectorAll('quiz');

    quizElements.forEach((quiz, quizIndex) => {
      const originalText = quiz.textContent;
      const quizId = `quiz-${Date.now()}-${quizIndex}`;

      // 解析 {{word}} 模式
      const pattern = /\{\{([^}]+)\}\}/g;
      const answers = [];
      let match;

      while ((match = pattern.exec(originalText)) !== null) {
        answers.push(match[1].trim());
      }

      if (answers.length === 0) {
        return; // 沒有填空，跳過
      }

      // 創建填空容器
      const container = document.createElement('span');
      container.className = 'quiz-container';

      // 添加自訂 class（如果有的話）
      const customClass = quiz.getAttribute('classname');
      if (customClass) {
        container.className += ' ' + customClass;
      }

      container.dataset.quizId = quizId;
      container.dataset.answers = JSON.stringify(answers);

      // 替換文字為填空框
      let html = originalText;
      let blankIndex = 0;
      html = html.replace(/\{\{([^}]+)\}\}/g, () => {
        const blank = `<span class="quiz-blank" contenteditable="true" data-blank-index="${blankIndex}" spellcheck="false"></span>`;
        blankIndex++;
        return blank;
      });

      container.innerHTML = html;

      // 添加輸入事件監聽
      const blanks = container.querySelectorAll('.quiz-blank');
      blanks.forEach(blank => {
        blank.addEventListener('input', () => {
          this.checkQuizCompletion();
        });
      });

      // 替換原始的 quiz 標籤
      quiz.parentNode.replaceChild(container, quiz);
    });

    // 初始檢查
    this.checkQuizCompletion();
  }

  // 清空所有填空題的作答內容與已顯示的結果（供 restart 使用）
  clearAllQuizzes() {
    this.querySelectorAll('.quiz-blank').forEach((blank) => {
      blank.textContent = '';
    });
    this.querySelectorAll('.quiz-results-auto').forEach((box) => {
      box.remove();
    });
  }

  // 檢查填空題是否全部完成
  checkQuizCompletion() {
    // 檢查是否要求填完才能換頁（預設為 true）
    const requireComplete = this.getAttribute('quiz-require-complete') !== 'false';

    // 如果不要求填完，直接啟用導航
    if (!requireComplete) {
      this.enableNavigation();
      return true;
    }

    const currentSlides = this.getCurrentPartSlides();
    if (currentSlides.length === 0) return true;

    const currentSlide = currentSlides[this.currentSlideInPart];
    if (!currentSlide) return true;

    const quizContainers = currentSlide.querySelectorAll('.quiz-container');
    if (quizContainers.length === 0) {
      this.enableNavigation();
      return true;
    }

    let allFilled = true;
    quizContainers.forEach(container => {
      const blanks = container.querySelectorAll('.quiz-blank');
      blanks.forEach(blank => {
        if (blank.textContent.trim() === '') {
          allFilled = false;
        }
      });
    });

    if (allFilled) {
      this.enableNavigation();
    } else {
      this.disableNavigation();
    }

    return allFilled;
  }

  // 禁用導航
  disableNavigation() {
    const nextBtn = this.container?.querySelector('.next-btn');
    const nextPartBtn = this.container?.querySelector('.next-part-btn');
    if (nextBtn) nextBtn.disabled = true;
    if (nextPartBtn) nextPartBtn.disabled = true;
  }

  // 啟用導航
  enableNavigation() {
    const nextBtn = this.container?.querySelector('.next-btn');
    const nextPartBtn = this.container?.querySelector('.next-part-btn');
    if (nextBtn) nextBtn.disabled = false;
    if (nextPartBtn) nextPartBtn.disabled = false;
  }

  // 顯示填空題結果
  showQuizResults(previousSlide) {
    const quizContainers = previousSlide.querySelectorAll('.quiz-container');
    if (quizContainers.length === 0) return null;

    const results = [];
    quizContainers.forEach(container => {
      const answers = JSON.parse(container.dataset.answers);
      const blanks = container.querySelectorAll('.quiz-blank');
      const userAnswers = Array.from(blanks).map(blank => blank.textContent.trim());

      const comparison = answers.map((correctAnswer, index) => {
        const userAnswer = userAnswers[index] || '';
        const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        return { correctAnswer, userAnswer, isCorrect };
      });

      results.push(comparison);
    });

    return results;
  }

  getTotalParts() {
    return Object.keys(this.partsData).length;
  }

  // 獲取當前投影片在全局中的索引
  getGlobalSlideIndex() {
    let globalIndex = 0;
    const allParts = Object.keys(this.partsData).sort((a, b) => parseInt(a) - parseInt(b));

    for (const part of allParts) {
      const partNum = parseInt(part);
      if (partNum < this.currentPart) {
        globalIndex += this.partsData[part].length;
      } else if (partNum === this.currentPart) {
        globalIndex += this.currentSlideInPart;
        break;
      }
    }

    return globalIndex;
  }

  // 跳轉到全局索引的投影片
  jumpToGlobalSlide(globalIndex) {
    let currentIndex = 0;
    const allParts = Object.keys(this.partsData).sort((a, b) => parseInt(a) - parseInt(b));

    for (const part of allParts) {
      const partNum = parseInt(part);
      const slidesInPart = this.partsData[part].length;

      if (globalIndex < currentIndex + slidesInPart) {
        this.currentPart = partNum;
        this.currentSlideInPart = globalIndex - currentIndex;
        this.updateDisplay();
        return;
      }

      currentIndex += slidesInPart;
    }
  }

  getCurrentPartSlides() {
    return this.partsData[this.currentPart] || [];
  }

  isLastSlideInPart() {
    const slides = this.getCurrentPartSlides();
    return this.currentSlideInPart >= slides.length - 1;
  }

  isFirstSlideInPart() {
    return this.currentSlideInPart === 0;
  }

  isLastPart() {
    return this.currentPart >= this.getTotalParts();
  }

  isFirstPart() {
    return this.currentPart === 1;
  }

  prevSlide() {
    if (this.isTransitioning) return;

    const slides = this.getCurrentPartSlides();
    const loop = this.getAttribute('loop') === 'true';

    if (this.currentSlideInPart > 0) {
      this.currentSlideInPart--;
      this.updateDisplay();
    } else if (loop) {
      this.currentSlideInPart = slides.length - 1;
      this.updateDisplay();
    }
  }

  nextSlide() {
    if (this.isTransitioning) return;

    const slides = this.getCurrentPartSlides();
    const loop = this.getAttribute('loop') === 'true';

    if (this.currentSlideInPart < slides.length - 1) {
      this.currentSlideInPart++;
      this.updateDisplay();
    } else if (loop) {
      this.currentSlideInPart = 0;
      this.updateDisplay();
    }
  }

  nextPart() {
    if (this.isTransitioning) return;

    if (this.currentPart < this.getTotalParts()) {
      this.isTransitioning = true;
      const transition = this.getAttribute('part-transition') || 'slide';

      this.applyTransition(transition, 'out', () => {
        this.currentPart++;
        this.currentSlideInPart = 0;
        this.updateDisplay();

        this.applyTransition(transition, 'in', () => {
          this.isTransitioning = false;
        }, false);

        this.dispatchEvent(new CustomEvent('part-changed', {
          detail: { part: this.currentPart, total: this.getTotalParts() }
        }));
      }, false);
    }
  }

  prevPart() {
    if (this.isTransitioning) return;

    if (this.currentPart > 1) {
      this.isTransitioning = true;
      const transition = this.getAttribute('part-transition') || 'slide';

      this.applyTransition(transition, 'out', () => {
        this.currentPart--;
        this.currentSlideInPart = 0;
        this.updateDisplay();

        this.applyTransition(transition, 'in', () => {
          this.isTransitioning = false;
        }, true);

        this.dispatchEvent(new CustomEvent('part-changed', {
          detail: { part: this.currentPart, total: this.getTotalParts() }
        }));
      }, true);
    }
  }

  restart() {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    const transition = this.getAttribute('part-transition') || 'slide';

    this.applyTransition(transition, 'out', () => {
      this.currentPart = 1;
      this.currentSlideInPart = 0;
      this.clearAllQuizzes();
      this.updateDisplay();

      this.applyTransition(transition, 'in', () => {
        this.isTransitioning = false;
      }, true);

      this.dispatchEvent(new CustomEvent('restarted', {
        detail: { part: this.currentPart }
      }));
    }, true);
  }

  // type：轉場類型（fade/slide/none）。direction：'out' 或 'in'。
  // reverse：是否為「回到上一部分／回到開頭」的反向動畫，決定滑動方向
  applyTransition(type, direction, callback, reverse) {
    const container = this.container?.querySelector('.slides-container');
    if (!container) {
      callback();
      return;
    }

    container.style.transition = 'none';

    if (type === 'fade') {
      if (direction === 'out') {
        container.style.opacity = '1';
        setTimeout(() => {
          container.style.transition = 'opacity 0.5s ease-out';
          container.style.opacity = '0';
          setTimeout(callback, 500);
        }, 10);
      } else {
        container.style.opacity = '0';
        setTimeout(() => {
          container.style.transition = 'opacity 0.5s ease-in';
          container.style.opacity = '1';
          setTimeout(callback, 500);
        }, 10);
      }
    } else if (type === 'slide') {
      if (direction === 'out') {
        const cls = reverse ? 'slide-out-rev' : 'slide-out';
        container.classList.add(cls);
        setTimeout(() => {
          container.classList.remove(cls);
          callback();
        }, 500);
      } else {
        const cls = reverse ? 'slide-in-rev' : 'slide-in';
        container.classList.add(cls);
        setTimeout(() => {
          container.classList.remove(cls);
          callback();
        }, 500);
      }
    } else {
      callback();
    }
  }

  // 依 progress-style / show-dots / show-page-numbers 決定進度顯示樣式（dots｜stepper｜numbers｜none）
  getProgressStyle() {
    const explicit = this.getAttribute('progress-style');
    if (explicit) return explicit;
    if (this.getAttribute('show-page-numbers') === 'true') return 'numbers';
    if (this.getAttribute('show-dots') === 'false') return 'none';
    return 'dots';
  }

  // 進度顯示的範圍：part（目前部分內）或 all（全部投影片）
  getProgressScope() {
    return this.getAttribute('progress-scope') === 'all' ? 'all' : 'part';
  }

  // 統一繪製進度列（dots / stepper / numbers 共用同一個容器，依屬性切換樣式）
  renderProgressTrack() {
    const track = this.container?.querySelector('.progress-track');
    if (!track) return;

    const style = this.getProgressStyle();
    track.innerHTML = '';

    if (style === 'none') {
      track.style.display = 'none';
      return;
    }
    track.style.display = 'flex';

    const scope = this.getProgressScope();
    let items;
    let currentIdx;
    let jump;

    if (scope === 'all') {
      items = Array.from(this.querySelectorAll('[slide]'));
      currentIdx = this.getGlobalSlideIndex();
      jump = (i) => this.jumpToGlobalSlide(i);
    } else {
      items = this.getCurrentPartSlides();
      currentIdx = this.currentSlideInPart;
      jump = (i) => {
        this.currentSlideInPart = i;
        this.updateDisplay();
      };
    }

    items.forEach((_, i) => {
      let node;
      if (style === 'numbers') {
        node = document.createElement('button');
        node.className = 'page-number' + (i === currentIdx ? ' active' : '');
        node.textContent = i + 1;
      } else if (style === 'stepper') {
        node = document.createElement('div');
        node.className = 'step-dot' + (i === currentIdx ? ' active' : '');
      } else {
        node = document.createElement('div');
        node.className = 'dot' + (i === currentIdx ? ' active' : '');
      }
      node.addEventListener('click', () => jump(i));
      track.appendChild(node);

      if (style === 'stepper' && i < items.length - 1) {
        const line = document.createElement('div');
        line.className = 'step-line';
        track.appendChild(line);
      }
    });
  }

  updateDisplay() {
    const slides = this.getCurrentPartSlides();

    // 檢查並顯示測驗結果
    if (this.currentSlideInPart > 0) {
      const previousSlide = slides[this.currentSlideInPart - 1];
      const currentSlide = slides[this.currentSlideInPart];

      if (previousSlide && currentSlide) {
        const quizResults = this.showQuizResults(previousSlide);
        if (quizResults && quizResults.length > 0) {
          // 在當前投影片中查找或創建結果顯示區域
          let resultsContainer = currentSlide.querySelector('.quiz-results-auto');
          if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.className = 'quiz-results-auto';
            currentSlide.insertBefore(resultsContainer, currentSlide.firstChild);
          }

          // 生成結果 HTML
          let resultsHTML = '';
          quizResults.forEach((quizResult, quizIndex) => {
            resultsHTML += '<div class="quiz-result-group">';
            quizResult.forEach((item, index) => {
              const statusIcon = item.isCorrect ? '✓' : '✗';
              const statusClass = item.isCorrect ? 'correct' : 'incorrect';
              resultsHTML += `
                <div class="quiz-result-item ${statusClass}">
                  <span class="quiz-result-icon">${statusIcon}</span>
                  <span class="quiz-result-label">第 ${index + 1} 空：</span>
                  <span class="quiz-result-user">你的答案：<strong>${item.userAnswer || '(未填)'}</strong></span>
                  <span class="quiz-result-correct">正確答案：<strong>${item.correctAnswer}</strong></span>
                </div>
              `;
            });
            resultsHTML += '</div>';
          });

          resultsContainer.innerHTML = resultsHTML;
        }
      }
    }

    slides.forEach((slide, index) => {
      if (index === this.currentSlideInPart) {
        slide.style.display = '';
        slide.classList.add('active-slide');
      } else {
        slide.classList.remove('active-slide');
        slide.style.display = 'none';
      }
    });

    this.renderProgressTrack();

    const partIndicator = this.container?.querySelector('.part-indicator');
    const showPartIndicator = this.getAttribute('show-part-indicator') !== 'false';
    if (partIndicator && showPartIndicator) {
      partIndicator.textContent = `Part ${this.currentPart} / ${this.getTotalParts()}`;
      partIndicator.style.display = 'block';
    } else if (partIndicator) {
      partIndicator.style.display = 'none';
    }

    const autoShowPartButtons = this.getAttribute('auto-show-part-buttons') === 'true';
    const showFinish = this.getAttribute('show-finish') !== 'false';
    const showRestart = this.getAttribute('show-restart') !== 'false';

    const nextPartBtn = this.container?.querySelector('.next-part-btn');
    const prevPartBtn = this.container?.querySelector('.prev-part-btn');
    const finishBtn = this.container?.querySelector('.finish-btn');
    const restartBtn = this.container?.querySelector('.restart-btn');

    if (nextPartBtn && prevPartBtn && finishBtn && restartBtn) {
      if (autoShowPartButtons) {
        if (this.isLastSlideInPart()) {
          if (this.isLastPart()) {
            nextPartBtn.style.display = 'none';
            if (showFinish) {
              finishBtn.style.display = 'flex';
            }
          } else {
            nextPartBtn.style.display = 'flex';
            finishBtn.style.display = 'none';
          }
        } else {
          nextPartBtn.style.display = 'none';
          finishBtn.style.display = 'none';
        }

        if (this.isFirstSlideInPart() && !this.isFirstPart()) {
          prevPartBtn.style.display = 'flex';
        } else {
          prevPartBtn.style.display = 'none';
        }

        if (this.isLastPart() && this.isLastSlideInPart() && showRestart) {
          restartBtn.style.display = 'flex';
        } else {
          restartBtn.style.display = 'none';
        }
      } else {
        nextPartBtn.style.display = 'none';
        prevPartBtn.style.display = 'none';
        finishBtn.style.display = 'none';
        restartBtn.style.display = 'none';
      }
    }

    const prevBtn = this.container?.querySelector('.prev-btn');
    const nextBtn = this.container?.querySelector('.next-btn');
    if (prevBtn && nextBtn) {
      const loop = this.getAttribute('loop') === 'true';
      prevBtn.disabled = !loop && this.currentSlideInPart === 0;
      nextBtn.disabled = !loop && this.isLastSlideInPart();
    }

    const updateHeader = this.getAttribute('update-header') === 'true';
    const updateTitle = this.getAttribute('update-title') === 'true';

    if (updateHeader || updateTitle) {
      const currentSlide = slides[this.currentSlideInPart];
      if (currentSlide) {
        const headerTemplate = this.getAttribute('header-template') || 'Part {part} - Slide {slide}';
        const titleTemplate = this.getAttribute('title-template') || 'Slide {slide} of {total}';

        const headerText = headerTemplate
          .replace('{part}', this.currentPart)
          .replace('{slide}', this.currentSlideInPart + 1)
          .replace('{total}', slides.length);

        const titleText = titleTemplate
          .replace('{part}', this.currentPart)
          .replace('{slide}', this.currentSlideInPart + 1)
          .replace('{total}', slides.length);

        if (updateHeader) {
          const headerElement = document.querySelector('header h1, header .title');
          if (headerElement) {
            headerElement.textContent = headerText;
          }
        }

        if (updateTitle) {
          document.title = titleText;
        }
      }
    }

    // 檢查當前投影片的測驗完成狀態
    this.checkQuizCompletion();
  }

  setupEventListeners() {
    const prevBtn = this.container?.querySelector('.prev-btn');
    const nextBtn = this.container?.querySelector('.next-btn');
    const nextPartBtn = this.container?.querySelector('.next-part-btn');
    const prevPartBtn = this.container?.querySelector('.prev-part-btn');
    const finishBtn = this.container?.querySelector('.finish-btn');
    const restartBtn = this.container?.querySelector('.restart-btn');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
    if (nextPartBtn) nextPartBtn.addEventListener('click', () => this.nextPart());
    if (prevPartBtn) prevPartBtn.addEventListener('click', () => this.prevPart());
    if (restartBtn) restartBtn.addEventListener('click', () => this.restart());

    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('finished', {
          detail: { part: this.currentPart, total: this.getTotalParts() }
        }));
      });
    }
  }

  render() {
    const height = this.getAttribute('height') || '400px';
    const nextPartBtnText = this.getAttribute('next-part-btn-text') || '下一部分 →';
    const prevPartBtnText = this.getAttribute('prev-part-btn-text') || '← 上一部分';
    const finishBtnText = this.getAttribute('finish-btn-text') || '完成';
    const restartBtnText = this.getAttribute('restart-btn-text') || '重新開始';
    const nextPartBtnPosition = this.getAttribute('next-part-btn-position') || 'center';

    const showArrows = this.getAttribute('show-arrows') !== 'false';

    const themeColor = this.getThemeColor();
    const arrowColor = this.parseColor(this.getAttribute('arrow-color')) || themeColor;
    const arrowBg = this.parseColor(this.getAttribute('arrow-bg')) || 'rgba(26, 27, 26, 0.88)';
    const dotColor = this.parseColor(this.getAttribute('dot-color')) || 'rgba(198, 199, 189, 0.82)';
    const activeDotColor = this.parseColor(this.getAttribute('active-dot-color')) || themeColor;

    const partBtnBg = this.parseColor(this.getAttribute('part-btn-bg')) || themeColor;
    const partBtnColor = this.parseColor(this.getAttribute('part-btn-color')) || this.getContrastColor(themeColor);
    const partBtnFontSize = this.getAttribute('part-btn-font-size') || '0.9rem';
    const partBtnPadding = this.getAttribute('part-btn-padding') || '6px 12px';
    const partBtnBorderRadius = this.getAttribute('part-btn-border-radius') || '6px';

    const finishBtnBg = this.parseColor(this.getAttribute('finish-btn-bg')) || themeColor;
    const finishBtnColor = this.parseColor(this.getAttribute('finish-btn-color')) || this.getContrastColor(themeColor);
    const restartBtnBg = this.parseColor(this.getAttribute('restart-btn-bg')) || themeColor;
    const restartBtnColor = this.parseColor(this.getAttribute('restart-btn-color')) || this.getContrastColor(themeColor);

    const fontColorSubtitle = this.parseColor(this.getAttribute('fontcolor-subtitle')) || this.parseColor('lavender');
    const fontColorMain = this.parseColor(this.getAttribute('fontcolor-main')) || this.parseColor('shell');
    const fontColorFooter = this.parseColor(this.getAttribute('fontcolor-footer')) || this.parseColor('sky');
    const fillColor = this.parseColor(this.getAttribute('fill-color')) || this.parseColor('fill');

    const extraNoteHoverColor = this.parseColor(this.getAttribute('extra-note-hover-color')) || this.parseColor('special');

    // 起始／結束畫面：純粹由作者在投影片上標記 role="start" / role="end" 決定，不做位置自動偵測
    const hasStartRole = !!this.querySelector('[slide][role="start"]');
    const hasEndRole = !!this.querySelector('[slide][role="end"]');
    const startStyle = this.getAttribute('start-style') || (hasStartRole ? 'accent-frame' : 'none');
    const endStyle = this.getAttribute('end-style') || (hasEndRole ? 'accent-frame' : 'none');
    if (startStyle !== 'none') this.dataset.startStyle = startStyle; else delete this.dataset.startStyle;
    if (endStyle !== 'none') this.dataset.endStyle = endStyle; else delete this.dataset.endStyle;

    const [startColorA, startColorB] = this.parseColorPair(this.getAttribute('start-colors'), ['lavender', 'sky']);
    const [endColorA, endColorB] = this.parseColorPair(this.getAttribute('end-colors'), ['safe', 'teal']);

    // 使用 CSS 變數設定此元件的顏色
    this.style.setProperty('--theme-color', themeColor);
    this.style.setProperty('--arrow-color', arrowColor);
    this.style.setProperty('--arrow-bg', arrowBg);
    this.style.setProperty('--dot-color', dotColor);
    this.style.setProperty('--active-dot-color', activeDotColor);
    this.style.setProperty('--part-btn-bg', partBtnBg);
    this.style.setProperty('--part-btn-color', partBtnColor);
    this.style.setProperty('--part-btn-font-size', partBtnFontSize);
    this.style.setProperty('--part-btn-padding', partBtnPadding);
    this.style.setProperty('--part-btn-border-radius', partBtnBorderRadius);
    this.style.setProperty('--finish-btn-bg', finishBtnBg);
    this.style.setProperty('--finish-btn-color', finishBtnColor);
    this.style.setProperty('--restart-btn-bg', restartBtnBg);
    this.style.setProperty('--restart-btn-color', restartBtnColor);
    this.style.setProperty('--fontcolor-subtitle', fontColorSubtitle);
    this.style.setProperty('--fontcolor-main', fontColorMain);
    this.style.setProperty('--fontcolor-footer', fontColorFooter);
    this.style.setProperty('--fill-color', fillColor);
    this.style.setProperty('--extra-note-hover-color', extraNoteHoverColor);
    this.style.setProperty('--show-arrows', showArrows ? 'flex' : 'none');
    this.style.setProperty('--part-btn-position', nextPartBtnPosition);
    this.style.setProperty('--start-color-a', startColorA);
    this.style.setProperty('--start-color-b', startColorB);
    this.style.setProperty('--end-color-a', endColorA);
    this.style.setProperty('--end-color-b', endColorB);

    const styleId = 'slider-show-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        slider-show {
          display: block;
          position: relative;
        }
        slider-show .slider-wrapper {
          position: relative;
          overflow: hidden;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        slider-show .slides-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        slider-show [slide] {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
          white-space: normal;
          overflow: hidden;
          box-sizing: border-box;
          display: none;
        }
        slider-show [slide].active-slide {
          display: block;
        }

        slider-show [slide] * {
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        /* 新增的內容區塊樣式 */
        slider-show .slide-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: var(--fill-color, #1A1B1A);
          border-radius: 8px;
          height: 100%;
          box-sizing: border-box;
        }

        slider-show .slide-subtitle {
          font-size: 1.2rem;
          color: var(--fontcolor-subtitle, #C3A5E5);
          font-weight: 500;
          padding-bottom: 6px;
          border-bottom: 2px solid rgba(198, 199, 189, 0.82);
        }

        slider-show .slide-main {
          font-size: 1.5rem;
          color: var(--fontcolor-main, #c6c7bd);
          line-height: 1.5;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        slider-show .slide-main p {
          margin-bottom: 8px;
        }

        slider-show .slide-main p:last-child {
          margin-bottom: 0;
        }

        slider-show .slide-footer {
          font-size: 0.9rem;
          color: var(--fontcolor-footer, #82C8E5);
          padding-top: 6px;
          border-top: 1px solid rgba(198, 199, 189, 0.82);
        }

        /* 起始／結束畫面：五種可選裝飾風格，只動外框/底色，不影響投影片原本內容 */
        slider-show[data-start-style="gradient-border"] [slide][role="start"],
        slider-show[data-end-style="gradient-border"] [slide][role="end"] {
          box-sizing: border-box;
          border-style: solid;
          border-width: 6px;
        }
        slider-show[data-start-style="gradient-border"] [slide][role="start"] {
          border-image: linear-gradient(135deg, var(--start-color-a), var(--start-color-b)) 1;
        }
        slider-show[data-end-style="gradient-border"] [slide][role="end"] {
          border-image: linear-gradient(135deg, var(--end-color-a), var(--end-color-b)) 1;
        }

        slider-show[data-start-style="gradient-bg"] [slide][role="start"] {
          background: linear-gradient(135deg, var(--start-color-a), var(--start-color-b)) !important;
        }
        slider-show[data-end-style="gradient-bg"] [slide][role="end"] {
          background: linear-gradient(135deg, var(--end-color-a), var(--end-color-b)) !important;
        }

        slider-show[data-start-style="accent-frame"] [slide][role="start"] {
          box-sizing: border-box;
          border: 6px solid var(--start-color-a);
        }
        slider-show[data-end-style="accent-frame"] [slide][role="end"] {
          box-sizing: border-box;
          border: 6px solid var(--end-color-a);
        }

        slider-show[data-start-style="top-bottom-bar"] [slide][role="start"] {
          box-sizing: border-box;
          border-top: 8px solid var(--start-color-a);
          border-bottom: 8px solid var(--start-color-b);
        }
        slider-show[data-end-style="top-bottom-bar"] [slide][role="end"] {
          box-sizing: border-box;
          border-top: 8px solid var(--end-color-a);
          border-bottom: 8px solid var(--end-color-b);
        }

        slider-show[data-start-style="corner-tag"] [slide][role="start"],
        slider-show[data-end-style="corner-tag"] [slide][role="end"] {
          position: relative;
        }
        slider-show[data-start-style="corner-tag"] [slide][role="start"]::before {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 0; height: 0;
          border-style: solid;
          border-width: 46px 46px 0 0;
          border-color: var(--start-color-a) transparent transparent transparent;
          z-index: 5;
          pointer-events: none;
        }
        slider-show[data-end-style="corner-tag"] [slide][role="end"]::before {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 0; height: 0;
          border-style: solid;
          border-width: 46px 46px 0 0;
          border-color: var(--end-color-a) transparent transparent transparent;
          z-index: 5;
          pointer-events: none;
        }

        /* Extra Note 樣式 */
        .extra-note-trigger {
          text-decoration: underline;
          text-decoration-color: var(--theme-color, #c6c7bd);
          text-decoration-thickness: 2px;
          text-underline-offset: 3px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: inherit;
        }

        .extra-note-trigger:hover {
          text-decoration-color: var(--extra-note-hover-color, #B3DE73);
          text-decoration-thickness: 3px;
          color: var(--extra-note-hover-color, #B3DE73);
        }

        .extra-note-content {
          background: var(--fill-color, #1A1B1A);
          padding: 14px;
          border-radius: 8px;
          border-left: 3px solid var(--theme-color, #c6c7bd);
          color: #C6C7BD;
          line-height: 1.5;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.4s ease;
        }

        .extra-note-content.show {
          opacity: 1;
          transform: translateY(0);
        }

        .extra-note-content strong {
          color: #B3DE73;
          font-weight: 600;
        }

        /* 防劇透遮罩樣式 */
        .spoiler-mask {
          backdrop-filter: blur(10px);
          user-select: none;
        }

        .spoiler-mask:hover {
          opacity: 0.95 !important;
        }

        .spoiler-mask:active {
          transform: scale(0.98);
        }

        .spoiler-masked {
          overflow: hidden;
        }

        /* 填空題樣式 */
        .quiz-container {
          display: inline;
          font-size: inherit;
          line-height: inherit;
        }

        .quiz-blank {
          display: inline-block;
          min-width: 3em;
          padding: 2px 8px;
          margin: 0 2px;
          background: var(--fill-color, #1A1B1A);
          border: none;
          border-bottom: 2px solid var(--theme-color, #c6c7bd);
          color: #C6C7BD;
          font-size: inherit;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          cursor: text;
        }

        .quiz-blank:focus {
          background: var(--fill-color, #1A1B1A);
          filter: brightness(1.2);
          border-bottom-color: var(--theme-color, #c6c7bd);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .quiz-blank:empty::before {
          content: attr(placeholder);
          color: rgba(198, 199, 189, 0.82);
        }

        /* 測驗結果樣式 */
        .quiz-results-auto {
          background: transparent;
          padding: 0;
          margin-bottom: 10px;
          max-height: 350px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .quiz-results-auto::-webkit-scrollbar {
          width: 8px;
        }

        .quiz-results-auto::-webkit-scrollbar-track {
          background: var(--fill-color, #1A1B1A);
          border-radius: 4px;
        }

        .quiz-results-auto::-webkit-scrollbar-thumb {
          background: rgba(198, 199, 189, 0.82);
          border-radius: 4px;
        }

        .quiz-results-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(198, 199, 189, 0.88);
        }

        .quiz-results-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--theme-color, #c6c7bd);
          margin-bottom: 8px;
          display: none;
        }

        .quiz-result-group {
          margin-bottom: 8px;
        }

        .quiz-result-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px;
          margin: 3px 0;
          border-radius: 4px;
          font-size: 0.95rem;
          flex-wrap: wrap;
          background: transparent;
        }

        .quiz-result-item.correct {
          border-left: 3px solid #27AE60;
        }

        .quiz-result-item.incorrect {
          border-left: 3px solid #E6374B;
        }

        .quiz-result-icon {
          font-size: 1.2rem;
          font-weight: 600;
          min-width: 20px;
        }

        .quiz-result-item.correct .quiz-result-icon {
          color: #27AE60;
        }

        .quiz-result-item.incorrect .quiz-result-icon {
          color: #E6374B;
        }

        .quiz-result-label {
          color: rgba(198, 199, 189, 0.82);
          font-weight: 500;
        }

        .quiz-result-user,
        .quiz-result-correct {
          color: #C6C7BD;
        }

        .quiz-result-user strong,
        .quiz-result-correct strong {
          color: #B3DE73;
          font-weight: 600;
        }

        /* 統一進度列：dots／stepper／numbers 共用同一個容器 */
        slider-show .progress-track {
          display: none;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 5px;
          margin-top: 4px;
          margin-bottom: 2px;
          padding: 0 6px;
        }

        slider-show .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--dot-color, rgba(198, 199, 189, 0.82));
          cursor: pointer;
          transition: all 0.3s;
          flex: none;
        }
        slider-show .dot.active {
          background: var(--active-dot-color, #c6c7bd);
          width: 24px;
          border-radius: 4px;
        }

        slider-show .step-dot {
          width: 10px;
          height: 10px;
          box-sizing: border-box;
          border-radius: 50%;
          border: 2px solid var(--dot-color, rgba(198, 199, 189, 0.82));
          background: transparent;
          cursor: pointer;
          transition: all 0.25s;
          flex: none;
        }
        slider-show .step-dot.active {
          width: 14px;
          height: 14px;
          background: var(--active-dot-color, #c6c7bd);
          border-color: var(--active-dot-color, #c6c7bd);
        }
        slider-show .step-line {
          width: 18px;
          height: 2px;
          background: var(--dot-color, rgba(198, 199, 189, 0.82));
          flex: none;
        }

        slider-show .page-number {
          width: 18px;
          height: 18px;
          border: none;
          background: var(--fill-color, #1A1B1A);
          color: rgba(198, 199, 189, 0.82);
          border-radius: 3px;
          font-size: 0.65rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          user-select: none;
          flex: none;
        }

        slider-show .page-number:hover {
          background: #1A1B1A;
          color: #C6C7BD;
          transform: scale(1.15);
        }

        slider-show .page-number.active {
          background: var(--theme-color, #c6c7bd);
          color: #0c0d0c;
          font-weight: 600;
          transform: scale(1.1);
        }

        slider-show .controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 14px;
          margin-top: 2px;
        }
        slider-show .prev-btn, slider-show .next-btn {
          background: var(--arrow-bg, rgba(26, 27, 26, 0.88));
          border: none;
          color: var(--arrow-color, #c6c7bd);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: var(--show-arrows, flex);
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: all 0.2s;
          user-select: none;
        }
        slider-show .prev-btn:hover:not(:disabled), slider-show .next-btn:hover:not(:disabled) {
          background: #1A1B1A;
          transform: scale(1.1);
        }
        slider-show .part-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(26, 27, 26, 0.88);
          color: var(--theme-color, #c6c7bd);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          z-index: 10;
          backdrop-filter: blur(4px);
        }
        slider-show .part-buttons {
          display: flex;
          justify-content: var(--part-btn-position, center);
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        slider-show .next-part-btn, slider-show .prev-part-btn, slider-show .finish-btn, slider-show .restart-btn {
          background: var(--part-btn-bg, #c6c7bd);
          color: var(--part-btn-color, #0C0D0C);
          border: none;
          padding: var(--part-btn-padding, 6px 12px);
          border-radius: var(--part-btn-border-radius, 6px);
          font-size: var(--part-btn-font-size, 0.9rem);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          display: none;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        slider-show .next-part-btn:hover, slider-show .prev-part-btn:hover, slider-show .finish-btn:hover, slider-show .restart-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        slider-show .finish-btn {
          background: var(--finish-btn-bg, #27AE60);
          color: var(--finish-btn-color, #0C0D0C);
        }
        slider-show .restart-btn {
          background: var(--restart-btn-bg, #4171BF);
          color: var(--restart-btn-color, #C6C7BD);
        }

        @keyframes fadeInBtn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        slider-show .slide-out {
          animation: slideOutLeft 0.5s ease-out forwards;
        }
        slider-show .slide-in {
          animation: slideInRight 0.5s ease-out forwards;
        }
        slider-show .slide-out-rev {
          animation: slideOutRight 0.5s ease-out forwards;
        }
        slider-show .slide-in-rev {
          animation: slideInLeft 0.5s ease-out forwards;
        }
      `;
      document.head.appendChild(style);
    }

    // 保存原始的投影片內容
    const slides = Array.from(this.querySelectorAll('[slide]'));

    // 清空元件內容
    this.innerHTML = '';

    // 創建包裝結構
    const wrapper = document.createElement('div');
    wrapper.className = 'slider-wrapper';
    wrapper.style.height = height;

    const partIndicator = document.createElement('div');
    partIndicator.className = 'part-indicator';
    wrapper.appendChild(partIndicator);

    const slidesContainer = document.createElement('div');
    slidesContainer.className = 'slides-container';

    // 將原始投影片加回去
    slides.forEach(slide => {
      slidesContainer.appendChild(slide);
    });

    wrapper.appendChild(slidesContainer);
    this.appendChild(wrapper);

    // 創建統一進度列（dots／stepper／numbers）
    const progressTrack = document.createElement('div');
    progressTrack.className = 'progress-track';
    this.appendChild(progressTrack);

    // 創建控制按鈕（僅左右箭頭，進度顯示已獨立成上面的 progress-track）
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
      <button class="prev-btn">◀</button>
      <button class="next-btn">▶</button>
    `;
    this.appendChild(controls);

    // 創建分組按鈕
    const partButtons = document.createElement('div');
    partButtons.className = 'part-buttons';
    partButtons.innerHTML = `
      <button class="prev-part-btn">${prevPartBtnText}</button>
      <button class="next-part-btn">${nextPartBtnText}</button>
      <button class="finish-btn">${finishBtnText}</button>
      <button class="restart-btn">${restartBtnText}</button>
    `;
    this.appendChild(partButtons);

    this.container = this;
  }
}

customElements.define('slider-show', SliderShow);
