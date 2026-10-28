# 語意標籤 UI 元件集（繁體中文）

一組零相依、以語意標籤撰寫的瀏覽器元件，專為深色底的教學頁面設計。每個元件都是單一 `.js` 檔，載入後自動注入 CSS，不需要打包工具、不依賴框架、也不使用 Shadow DOM。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `bp-stepper.js` | `<bp-stepper>` `<bp-step>` | 步驟流程圖，支援水平、垂直、換行版型與逐步推進模式。 |
| `card-toggle.js` | `<card-toggle>` `<card-toggle-group>` | 可翻面的卡片，支援問答、選項分支、提示與題組導覽。 |
| `numeric-list.js` | `<ui-list>` `<list-item>` `<list-item-ad>` | 大數字編號清單，支援圖示、Grid、滑過效果、廣告列與浮動按鈕。 |
| `ui-plus.js` | `<ui-cluster>` `<read-pulse>` `<chalk-mark>` `<col-pair>` `<chunk-spot>` `<ui-btn>` | 概念聚合圖、閱讀輔助標記與展開按鈕。 |
| `ui-fillin.js` | `<ui-fillin>` `<main-box>` `<ans-box>` | 選擇題與輸入題的挖空練習，附答案總表與批改。 |
| `slider-show.js` | `<slider-show>` | 分段投影片，內建補充說明、防劇透遮罩與填空小測驗。 |
| `ui-table.js` | `<ui-table>` `<ui-group>` `<ui-row>` `<ui-col>` | CSS Grid 表格，內建分組、遮罩、輪播、提示、欄間箭頭與逐步揭示。 |

授權：MIT

---

## 目錄

- [安裝](#安裝)
- [色盤對照](#色盤對照)
- [瀏覽器支援](#瀏覽器支援)
- [bp-stepper.js](#bp-stepperjs)
- [card-toggle.js](#card-togglejs)
- [numeric-list.js](#numeric-listjs)
- [ui-plus.js](#ui-plusjs)
- [ui-fillin.js](#ui-fillinjs)
- [slider-show.js](#slider-showjs)
- [ui-table.js](#ui-tablejs)

---

## 安裝

只載入需要的元件即可，各元件互不相依，可以同頁混用：

```html
<script src="bp-stepper.js"></script>
<script src="card-toggle.js"></script>
<script src="numeric-list.js"></script>
<script src="ui-plus.js"></script>
<script src="ui-fillin.js"></script>
<script src="slider-show.js"></script>
<script src="ui-table.js"></script>
```

Bootstrap Icons 為選用，但強烈建議載入。各元件的圖示功能（`bi-*` 類別、按鈕圖示、`icon` 屬性）都依賴它：

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
```

`card-toggle.js` 的內嵌提示使用 Bootstrap 的 `alert` 類別，若要有完整樣式，請另外載入 Bootstrap CSS：

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
```

所有元件預設頁面為深色底（`#0C0D0C`）。

---

## 色盤對照

除了 `ui-fillin.js` 之外，各元件的顏色屬性都可以直接填色盤名稱，不必記色碼。大部分顏色在各元件中完全相同：

| 名稱 | 色碼 | 名稱 | 色碼 |
| --- | --- | --- | --- |
| `shell` | `#C6C7BD` | `vanilla` | `#DBEDD8` |
| `lavender` | `#C3A5E5` | `yellow` | `#E3D322` |
| `special` | `#B3DE73` | `indigo` | `#7849C9` |
| `warning` | `#E6374B` | `pink` | `#FF91D7` |
| `salmon` | `#E5C3B3` | `orange` | `#EDA109` |
| `ocean` | `#1CCAE8` | `teal` | `#0DA591` |

以下四個顏色在不同元件中的色碼略有差異：

| 名稱 | bp-stepper | card-toggle | numeric-list | ui-plus | slider-show | ui-table |
| --- | --- | --- | --- | --- | --- | --- |
| `sky` | `#95C9DE` | `#82C8E5` | `#82C8E5` | `#82C8E5` | `#82C8E5` | `#82C8E5` |
| `safe` | `#299459` | `#27AE60` | `#27AE60` | `#27AE60` | `#27AE60` | `#27AE60` |
| `focus` | `#3C7BCF` | `#D4FFFC` | `#D4FFFC` | `#D4FFFC` | `#D4FFFC` | `#D4FFFC` |
| `info` | `#2351DB` | `#4171BF` | `#2351DB` | `#2351DB` | `#4171BF` | `#2351DB` |

個別元件的補充：

- **card-toggle.js**：另有 `attention`（等同 yellow）與 `stone`（等同 sky）兩個舊名稱別名。
- **slider-show.js**：另有 `background`（`#0C0D0C`）與 `fill`（`#1A1B1A`）兩個名稱。
- **ui-fillin.js**：不支援色盤名稱，顏色屬性請填色碼。

所有接受顏色的屬性也都可以直接填 CSS 顏色（`#hex`、`rgb(...)` 等）。

---

## 瀏覽器支援

支援現代常青瀏覽器。

- **bp-stepper.js**：需要 Custom Elements。`progress-show` 模式的連接線隱藏需要 CSS `:has()`。
- **card-toggle.js**：需要 Custom Elements 與 CSS `color-mix()`。
- **numeric-list.js**：需要 CSS `color-mix()` 與 `:scope` 選擇器。
- **ui-plus.js**：需要 `IntersectionObserver`（`read-pulse` 的可見觸發、`chalk-mark` 的 `active`）與 SVG。
- **ui-fillin.js**：需要 Custom Elements。
- **slider-show.js**：需要 Custom Elements。遮罩的毛玻璃效果使用 `backdrop-filter`，不支援時只是少了模糊。
- **ui-table.js**：需要 CSS Grid、`position: sticky` 與 `fetch`。箭頭定位會在可用時使用 `ResizeObserver` 與 `MutationObserver`，不支援時自動降級。

---

## bp-stepper.js

步驟流程圖元件。每個 `<bp-step>` 是一張卡片，卡片之間自動畫上連接線與箭頭，並依狀態（一般、進行中、完成、錯誤）切換配色。支援水平、垂直與兩列換行版型，也能做成「按一下才推進下一步」的互動流程。

元件以 Custom Elements 註冊，標籤一進入 DOM 就會自動初始化，CSS 注入在 `<style id="bp-stepper-style">`。

### 快速開始

```html
<bp-stepper data-theme="sky" mode="progress"
            data-ui-title="<strong>Task 2 寫作流程</strong>">
  <bp-step data-state="active">
    <span class="bp-step-icon">🔍</span>
    <bp-step-title>審題</bp-step-title>
    <bp-step-content>找出題目要求的立場與範圍。</bp-step-content>
  </bp-step>
  <bp-step>
    <bp-step-title>列大綱</bp-step-title>
    <bp-step-content>決定兩個主體段的主題句。</bp-step-content>
  </bp-step>
  <bp-step>
    <bp-step-title>寫作與檢查</bp-step-title>
    <bp-step-content>預留五分鐘檢查文法與拼字。</bp-step-content>
  </bp-step>
</bp-stepper>

<script src="bp-stepper.js"></script>
```

### 標籤

| 標籤 | 用途 |
| --- | --- |
| `<bp-stepper>` | 根元素，所有設定都寫在這裡。 |
| `<bp-step>` | 單一步驟卡片。 |
| `<bp-step-title>` | 步驟標題。 |
| `<bp-step-content>` | 步驟內文，可放任意 HTML。 |
| `<span class="bp-step-icon">` | 選用的步驟圖示（emoji 或文字），顯示在標題上方。 |

編號圓圈（badge）由元件自動插入，不需手寫。

### `<bp-stepper>` 屬性：版型與行為

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `data-theme` | 主題名稱 | 一次套用整組配色，見下方「主題」。 |
| `data-layout` | `vertical` | 改為垂直排列。卡片未設 `data-card-width` 時會填滿容器寬度。 |
| `data-wrap` | 數字 N | 水平模式下，前 N 張卡片排第一列，其餘排第二列，中間以 U 形連接線串接。只分兩列。 |
| `data-fill` | 布林 | 水平模式下卡片自動伸展，填滿整個寬度。 |
| `data-connector` | `solid` \| `dashed` \| `dotted` | 連接線樣式。也可寫成 `data-connector-style`。預設 `solid`。 |
| `data-connector-label` | 文字 | 所有連接線上方的說明文字。 |
| `data-clickable` | `true` | 點擊（或按 Enter、空白鍵）任一卡片即設為進行中。 |
| `data-auto-number` | `false` | 關閉自動編號 badge。 |
| `data-compact-header` | 布林 | badge、圖示、標題排成單行，下方加一道淡出的細線。 |
| `data-ui-title` | HTML | 嵌在元件內的總標題，與步驟之間不會有多餘空白。 |
| `data-ui-title-fs` | CSS 長度 | 總標題字級。預設 `1.1rem`。 |
| `data-ui-title-pb` | CSS 長度 | 總標題的下內距。 |
| `data-show-ending` | 元素 id | 初始化時隱藏該元素，按下最後一步的推進按鈕後以動畫顯示。 |
| `mode` 或 `data-mode` | `progress` \| `progress-show` | 推進模式，見下方「推進模式」。 |

### `<bp-stepper>` 屬性：外觀

以下屬性都可填 CSS 值；顏色類屬性也可直接填色盤名稱（例如 `data-color-active="ocean"`）。

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| `data-color` | `lavender` | 一般狀態的邊框、連接線與 badge 色。 |
| `data-color-active` | `special` | 進行中狀態的顏色。 |
| `data-color-done` | `safe` | 完成狀態的顏色。 |
| `data-color-error` | `warning` | 錯誤狀態的顏色。 |
| `data-text-color` | `shell` | 內文顏色。 |
| `data-title-color` | `lavender` | 標題顏色。 |
| `data-badge-bg` | `rgba(195,165,229,0.15)` | badge 底色。 |
| `data-card-bg` | `rgba(12,13,12,0.55)` | 一般卡片底色。 |
| `data-card-bg-active` | 自動推算 | 進行中卡片底色。 |
| `data-card-bg-done` | 自動推算 | 完成卡片底色。 |
| `data-card-bg-error` | 自動推算 | 錯誤卡片底色。 |
| `data-stroke` | `2px` | 邊框與連接線粗細。 |
| `data-radius` | `12px` | 卡片圓角。 |
| `data-card-width` | `220px` | 卡片寬度。 |
| `data-card-padding` | `8px` | 卡片內距。 |
| `data-gap` | `36px` | 卡片間距，也是連接線長度。 |
| `data-arrow-min-len` | `0px` | 連接線最短長度，實際間距取 `gap` 與此值的較大者。 |
| `data-arrow-size` | `6px` | 箭頭大小。 |
| `data-badge-size` | `28px` | badge 直徑。 |
| `data-font-size` | `0.9rem` | 內文字級。 |
| `data-title-size` | `1rem` | 標題字級。 |
| `data-badge-font-size` | `0.82rem` | badge 字級。 |
| `data-pad-top` / `data-pad-bottom` / `data-pad-x` | `8px` | 元件外圍內距。 |
| `data-connector-label-color` | `shell` | 連接線說明文字顏色。 |
| `data-prog-btn-size` | `28px` | 推進按鈕與自訂按鈕的高度。 |
| `data-ui-title-gap` | `8px` | 總標題與步驟之間的距離。 |
| `data-header-pad-y` | `2px` | compact-header 的上下內距。 |
| `data-header-gap` | `6px` | compact-header 內元素的水平間距。 |
| `data-content-opacity` | `0.9` | 內文透明度。 |
| `data-content-opacity-done` | `0.65` | 完成狀態的內文透明度。 |

單獨覆寫 `data-color-active`、`data-color-done` 或 `data-color-error`，而沒有指定對應的 `data-card-bg-*` 時，元件會依該色自動推算一個淡色卡片底色。

### `<bp-step>` 屬性

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `data-state` | `active` \| `done` \| `error` | 初始狀態。`done` 的 badge 顯示 ✓，`error` 顯示 !。 |
| `data-connector-label` | 文字 | 這張卡片後方連接線的說明，覆寫 stepper 層級的設定。 |
| `data-connector-label-color` | CSS 顏色 | 這段說明的文字顏色。 |
| `data-compact-header` | `false` | 個別關閉 compact-header。 |
| `data-no-btn` | 布林 | 推進模式下，這一步不放推進按鈕。 |
| `data-progress-icon` / `data-progress-text` / `data-progress-icon-class` | 見推進模式 | 個別覆寫這一步的推進按鈕。 |
| `btn-js` | JavaScript 運算式 | 在卡片左下角放一顆自訂按鈕，點擊時執行此運算式。 |
| `btn-js-label` | 文字 | 自訂按鈕文字。預設「執行」。 |
| `btn-js-icon` | HTML | 自訂按鈕圖示。 |
| `btn-js-icon-class` | 類別名稱 | 圖示類別，例如 `bi bi-play-fill`，優先於 `btn-js-icon`。 |

`btn-js` 運算式中可直接使用三個變數：`step`（目前的 `<bp-step>`）、`stepper`（所屬的 `<bp-stepper>`）、`BPStepper`（全域 API）。

```html
<bp-step btn-js="BPStepper.setError(stepper, 1)" btn-js-label="標記錯誤">
  ...
</bp-step>
```

### 推進模式

設定 `mode="progress"` 後，每張卡片右下角會出現推進按鈕，按下即把下一步設為進行中，按下最後一步則全部標記完成並觸發 `bps:complete` 事件。

`mode="progress-show"` 行為相同，但尚未輪到的步驟會完全隱藏，按下按鈕後才以動畫逐張出現。

推進模式不會自動設定起點，請在第一個 `<bp-step>` 加上 `data-state="active"`。

推進按鈕可在 stepper 層級設定：

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| `data-progress-icon` | `›` | 一般步驟的按鈕圖示（HTML）。 |
| `data-progress-text` | 空 | 一般步驟的按鈕文字。 |
| `data-progress-icon-class` | 空 | 圖示類別，例如 `bi bi-arrow-right`，優先於 `data-progress-icon`。 |
| `data-progress-done-icon` | 沿用一般圖示 | 最後一步的按鈕圖示。 |
| `data-progress-done-text` | 沿用一般文字 | 最後一步的按鈕文字。 |
| `data-progress-done-icon-class` | 沿用一般類別 | 最後一步的圖示類別。 |
| `data-progress-hide-last` | 布林 | 最後一步不放按鈕。 |

只有圖示時按鈕為正圓形，只有文字或圖文並列時為膠囊形。圖示與文字都為空時不放按鈕。

```html
<bp-stepper mode="progress-show"
            data-progress-icon-class="bi bi-arrow-right"
            data-progress-done-icon-class="bi bi-check-lg"
            data-progress-done-text="完成"
            data-show-ending="finish-box">
  <bp-step data-state="active">...</bp-step>
  <bp-step>...</bp-step>
  <bp-step>...</bp-step>
</bp-stepper>

<div id="finish-box">恭喜完成所有步驟！</div>
```

### 主題

`data-theme` 會一次設定一般色、進行中色、完成色、標題色與 badge 底色。可用名稱：

`lavender`、`sky`、`info`、`indigo`、`ocean`、`teal`、`safe`、`yellow`、`orange`、`focus`、`special`、`pink`、`salmon`、`warning`、`shell`、`vanilla`

主題設定之後，個別的 `data-color-*` 等屬性仍可再覆寫。

### 事件

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `bps:change` | `{ index, prevIndex, el }` | 進行中的步驟改變時。 |
| `bps:complete` | `{ el }` | 所有步驟都標記完成時。 |

兩個事件都會冒泡，可在 `document` 上統一監聽：

```js
document.addEventListener('bps:complete', (e) => {
  console.log('完成：', e.detail.el);
});
```

### JavaScript API

```js
BPStepper.setActive(el, index);         // 將第 index 步（從 0 起算）設為進行中，之前的全部標記完成
BPStepper.setError(el, index);          // 將第 index 步標記為錯誤
BPStepper.resetStates(el);              // 清除所有狀態；progress-show 模式會重新隱藏後續步驟
BPStepper.progressShowNext(el, index);  // progress-show 模式下，從第 index 步推進到下一步
BPStepper.init(root);                   // 重新初始化 root（預設 document）內的所有 <bp-stepper>
BPStepper.defaults;                     // 全域預設值，可在元素初始化前修改
BPStepper.BRAND;                        // 色盤
BPStepper.THEMES;                       // 主題設定
```

`index` 傳入大於等於步驟數的值，等同把全部步驟標記完成。

若要修改全域預設值，請在載入腳本後、元素初始化之前（同一個同步區塊內）設定：

```html
<script src="bp-stepper.js"></script>
<script>
  BPStepper.defaults.cardWidth = '260px';
  BPStepper.defaults.connectorStyle = 'dashed';
</script>
```

`progress-show` 的連接線隱藏功能需要 CSS `:has()` 支援（Chrome 105+、Safari 15.4+、Firefox 121+）。

---

## card-toggle.js

可翻面的卡片。點擊正面後換成背面內容，也可以做成填空問答、選項分支題，或用群組串成一組題目。CSS 注入在 `<style id="card-toggle-styles">`。

### 快速開始

```html
<!-- 一般翻面 -->
<card-toggle color="sky" toggle content="<strong>mitigate</strong>：減輕、緩和">
  mitigate 是什麼意思？
</card-toggle>

<!-- 填空問答 -->
<card-toggle color="lavender"
             question="「使某事不那麼嚴重」的動詞是？"
             answer="mitigate"
             hint="m 開頭，八個字母">
</card-toggle>

<!-- 選項分支 -->
<card-toggle question="哪一個比較正式？"
             branch-options="kids,children"
             correct-option="children"
             branch-correct="學術寫作請用 children。"
             branch-wrong="kids 偏口語，寫作時避免使用。"
             branch-retry>
</card-toggle>

<script src="card-toggle.js"></script>
```

### 標籤

| 標籤 | 用途 |
| --- | --- |
| `<card-toggle>` | 單張卡片，內容即為正面。 |
| `<card-toggle-group>` | 選用的卡片群組，可堆疊、輪播或網格排列。 |

### 一般翻面

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `content` | HTML | 背面內容。 |
| `source` | 元素 id | 以該元素的複本作為背面內容，優先於 `content`。來源元素可先設 `display:none`。 |
| `animation` | `fade` \| `slide` \| `none` | 翻面動畫。預設 `fade`。 |
| `toggle` | 布林 | 背面可再點擊翻回正面，並顯示「點擊翻回」提示。未設定時翻面後即固定。 |
| `auto-flip` | 毫秒 | 翻面後倒數自動翻回，卡片底部顯示倒數條。 |
| `flip-bar-color` | 色盤名稱或 CSS 顏色 | 倒數條顏色。未設定時依序取 `color-after`、`color`、`sky`。 |
| `color-after` | 色盤名稱 | 翻面後改用的卡片色，翻回時恢復原色。 |

正面內容在第一次點擊時才擷取，因此頁面載入後用程式修改正面內容也會被保留。

### 外觀

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `color` | 色盤名稱 | 左側色條與 hover 配色。可用值見下方說明。 |
| `dashed` | 布林 | 外框改為虛線，顏色跟隨 `color`。 |
| `size` | `xsm` \| `sm` \| `lg` \| `xlg` | 卡片內距大小。 |
| `skin` | `grid` \| `ruled` \| `blueprint` \| `split` \| `band` | 背景紋理：方格、橫線、雙密度藍圖格線、上下分色、頂部色帶。`grid` 與 `ruled` 的線條會跟隨 `color`。 |
| `bar-width` | 數字（px）或 CSS 長度 | 左側色條寬度。預設 `3`。 |
| `bar-width-hover` | 數字（px）或 CSS 長度 | hover 時色條寬度。未設定時為 `bar-width` 加 2。 |
| `top-line` | 空值或寬度 | 加上上邊線，空值為 `2px`。 |
| `top-line-color` | 色盤名稱或 CSS 顏色 | 上邊線顏色，預設跟隨 `color`。 |
| `bottom-line` | 空值或寬度 | 加上下邊線，空值為 `2px`。 |
| `bottom-line-color` | 色盤名稱或 CSS 顏色 | 下邊線顏色，預設跟隨 `color`。 |
| `number` | 文字 | 在正面最前方加上「N. 」編號。 |
| `number-size` / `number-weight` / `number-opacity` | CSS 值 | 編號的字級、粗細、透明度。 |

`color` 可用的名稱：`shell`、`lavender`、`sky`、`ocean`、`teal`、`safe`、`special`、`info`、`indigo`、`focus`、`warning`、`salmon`、`pink`、`orange`、`attention`、`stone`。其中 `attention` 等同 yellow，`stone` 等同 sky，是舊名稱的別名。`vanilla` 與 `yellow` 目前沒有對應的色條樣式，請改用 `attention` 代替 yellow。

### 填空問答

設定 `question` 後，卡片一載入就直接顯示題目與輸入框，卡片本身不再因點擊而翻面，只有按鈕會觸發動作。答對後翻到背面，背面可點擊翻回重做。

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `question` | HTML | 題目，必填。 |
| `answer` | 文字 | 正確答案，必填。前後空白會被忽略。 |
| `case-sensitive` | 布林 | 區分大小寫。預設不區分。 |
| `placeholder` | 文字 | 輸入框提示文字。預設「請輸入答案」。 |
| `max-attempts` | 數字 | 嘗試上限，達到後卡片轉為錯誤狀態。 |
| `success-message` | 文字 | 答對時的訊息。預設「答對了！」。 |
| `error-message` | 文字 | 答錯時的訊息。 |
| `success-source` | 元素 id | 答對後的背面內容，優先順序最高。 |
| `source` / `content` | 元素 id / HTML | 在問答模式中作為答對後的解說背面。 |
| `success-color` | 色盤名稱 | 答對後的卡片色。預設 `safe`。 |
| `auto-next` | 布林 | 在群組輪播模式中，答對 1.5 秒後自動前往下一題。 |
| `submit-text` / `hide-submit` | 文字 / 布林 | 提交按鈕文字，或隱藏提交按鈕。 |
| `reset-text` / `hide-reset` | 文字 / 布林 | 重置按鈕文字，或隱藏重置按鈕。 |

**提示**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `hint` | 文字 | 提示內容。有設定才會出現提示按鈕。 |
| `hint-target` | 元素 id | 提示顯示的位置。未設定時以 Bootstrap alert 顯示在卡片內。 |
| `hint-text` | 文字 | 提示按鈕文字。預設「提示」。 |
| `hide-hint` | 布林 | 隱藏提示按鈕。 |

**額外資訊**

點一次展開資訊面板，再點一次收合。

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `info` | HTML | 資訊內容。 |
| `info-source` | 元素 id | 讀取該元素（含 `<template>`）的內容，優先於 `info`。 |
| `info-target` | 元素 id | 面板顯示的位置。未設定時顯示在卡片內。 |
| `info-text` | 文字 | 按鈕文字。預設「額外資訊」。 |
| `hide-info` | 布林 | 隱藏資訊按鈕。 |
| `info-color` | 色盤名稱或 CSS 顏色 | 按鈕與面板左線的顏色。預設 `sky`。 |
| `info-bg` | 色盤名稱或 CSS 顏色 | 面板底色。 |
| `info-fg` | 色盤名稱或 CSS 顏色 | 面板文字色。 |

### 選項分支

在問答卡片上加 `branch-correct` 或 `branch-wrong` 屬性，輸入框就會換成一排選項按鈕。選對與選錯會翻到不同的背面。

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `branch-options` | 逗號分隔文字 | 選項。預設「是,否」。 |
| `correct-option` | 文字 | 正確選項，需與選項文字完全相同（預設不分大小寫）。 |
| `branch-btn-color` | 色盤名稱或 CSS 顏色 | 選項按鈕顏色。預設 `special`。 |
| `branch-correct` | HTML | 選對後的背面內容。 |
| `branch-correct-source` | 元素 id | 讀取該元素的內容作為選對背面，優先於 `branch-correct`。 |
| `branch-wrong` | HTML | 選錯後的背面內容。 |
| `branch-wrong-source` | 元素 id | 讀取該元素的內容作為選錯背面，優先於 `branch-wrong`。 |
| `branch-correct-label` | 文字 | 選對背面的標題。預設「答對了！」。 |
| `branch-wrong-label` | 文字 | 選錯背面的標題。預設會帶出使用者選的選項。 |
| `branch-correct-color` | 色盤名稱 | 選對後的卡片色。預設 `safe`。 |
| `branch-wrong-color` | 色盤名稱 | 選錯後的卡片色。預設 `warning`。 |
| `branch-retry` | 布林 | 選錯時顯示重試按鈕。 |
| `branch-retry-text` | 文字 | 重試按鈕文字。預設「↺ 再試一次」。 |

注意：分支模式是由 `branch-correct` 或 `branch-wrong` 這兩個屬性**是否存在**來啟動的。若只想用 `*-source` 讀取內容，請同時加上一個空的 `branch-correct` 屬性：

```html
<card-toggle question="..." branch-options="A,B" correct-option="A"
             branch-correct branch-correct-source="exp-right"
             branch-wrong-source="exp-wrong">
</card-toggle>
```

### 字級、字型與內距

卡片各部位的字級、字型與內距都可以用 `fs-部位`、`ff-部位`、`pad-部位` 屬性個別設定。`fs-` 填純數字時視為 rem，`pad-` 填純數字時視為 px。

| 前綴 | 可用部位 |
| --- | --- |
| `fs-` / `ff-` | `body`、`number`、`question`、`input`、`submit`、`aux`、`feedback`、`hintbox`、`flipnote`、`info`、`infobox`、`branch-btn`、`branch-label`、`branch-body` |
| `pad-` | `input`、`submit`、`aux`、`info`、`infobox` |

```html
<card-toggle fs-question="1.2" ff-question="Georgia, serif" pad-input="10 14" ...>
```

### `<card-toggle-group>`

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `mode` | `stack` \| `slide` \| `grid` \| `grid:間距` | 堆疊、一次一張輪播、或網格排列。網格預設間距 `12px`，例如 `grid:20px`。預設 `stack`。 |
| `cols` | 數字 | 網格欄數。預設等於卡片數。 |
| `theme` | 色盤名稱 | 導覽按鈕、頁碼、計數器與結果畫面的強調色。預設 `special`。 |
| `hide-counter` | 布林 | 輪播模式下隱藏「1 / N」計數器。 |
| `hide-nav-buttons` | 布林 | 隱藏「上一張」「下一張」按鈕。 |
| `show-pages` | 布林 | 顯示頁碼按鈕，並以顏色標示每題答對或答錯。 |
| `lock-nav` | 布林 | 目前這題作答之前，不能前往下一題。 |
| `show-result` | 布林 | 全部題目作答完畢後顯示成績畫面。`stack`、`slide`、`grid` 三種模式皆適用。 |
| `result-source` | 元素 id | 在成績畫面中額外插入該元素的內容。 |
| `retry-label` | 文字 | 成績畫面「重新作答」按鈕的文字。預設「↺ 重新作答」。按下後所有卡片會恢復成未作答狀態，從第一題重新開始。 |

`show-result` 以「每張卡片都已作答」作為觸發條件，只有填空問答與選項分支卡片會被記錄為已作答。群組中若混有一般翻面卡片，成績畫面不會出現。

群組上也可以使用 `fs-`、`ff-`、`pad-` 屬性，設定會套用到群組內所有卡片。群組另外有以下部位：

| 前綴 | 群組部位 |
| --- | --- |
| `fs-` / `ff-` | `nav`、`page`、`counter`、`result-score`、`result-text`、`retry` |
| `pad-` | `nav`、`page`、`retry` |

`info-color`、`info-bg`、`info-fg` 設在群組上同樣會套用到所有卡片。

```html
<card-toggle-group mode="slide" theme="sky" show-pages lock-nav show-result>
  <card-toggle question="Q1 ..." answer="..." auto-next></card-toggle>
  <card-toggle question="Q2 ..." answer="..." auto-next></card-toggle>
  <card-toggle question="Q3 ..." branch-options="A,B,C" correct-option="B"
               branch-correct="正確！" branch-wrong="再想想。"></card-toggle>
</card-toggle-group>
```

### JavaScript API

```js
document.querySelector('card-toggle').reset();  // 清除作答狀態與提示，恢復正面
```

---

## numeric-list.js

大數字編號清單。每一列左側是醒目的編號（或圖示），右側是內容，適合做重點條列、步驟說明或目錄。也可以切換成 Grid 排列、插入漸層廣告列，或變成固定在畫面側邊的浮動按鈕列。CSS 注入在 `<style id="_nl_css">`。

### 快速開始

```html
<ui-list theme-color="sky" hover-fx="glow">
  <list-item>先讀題，圈出關鍵字。</list-item>
  <list-item>回答要直接，第一句就給出答案。</list-item>
  <list-item-ad href="#course">想系統練習？看看完整課程 →</list-item-ad>
  <list-item accent="pink" source="tip-3" target="tip-panel">點我看第三個技巧</list-item>
</ui-list>

<div id="tip-3">用具體例子支撐你的觀點。</div>
<div id="tip-panel"></div>

<script src="numeric-list.js"></script>
```

### 標籤

| 標籤 | 用途 |
| --- | --- |
| `<ui-list>` | 根元素。 |
| `<list-item>` | 一般列，內容可放任意 HTML。 |
| `<list-item-ad>` | 漸層背景的廣告列，不佔編號，與相鄰列之間不留間距。Grid 模式下不顯示。 |

### `<ui-list>` 屬性

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `mode` | `icon` \| `fab` | `icon` 改用 `list-item` 的 `icon` 取代數字；`fab` 變成浮動按鈕列，見下方「浮動按鈕」。 |
| `theme-color` | 色盤名稱或 CSS 顏色 | 所有列的編號色。未設定時各列依內建色序輪替。 |
| `width` | CSS 長度，或 `寬度/最小寬度` | 清單寬度，例如 `80%/480px`。預設 `100%`。 |
| `cols` | 數字 | 2 以上時改為 Grid 排列。 |
| `last-span` | 布林 | Grid 模式下最後一列橫跨整排。 |
| `gap` | CSS 長度 | 列與列的間距。預設 `4px`。 |
| `hover` | 色盤名稱或 CSS 顏色 | 滑過時的邊框色。預設跟隨 `theme-color`。 |
| `active` | 色盤名稱或 CSS 顏色 | 可點擊列被選取時的邊框色與底色。 |
| `hover-fx` | 效果名稱 | 所有列的滑過效果，見下方「滑過效果」。 |
| `fx-color` | 色盤名稱或 CSS 顏色 | 滑過效果的顏色。預設為各列的編號色。 |

### `<list-item>` 屬性

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `number` | 文字 | 自訂編號。預設依序 1、2、3。 |
| `accent` | 色盤名稱或 CSS 顏色 | 這一列的編號色，優先於 `theme-color`。 |
| `icon` | Bootstrap Icons 名稱 | `mode="icon"` 時取代數字。**不需加 `bi-` 前綴**，例如 `icon="lightbulb"`。 |
| `source` | 元素 id | 與 `target` 搭配，點擊此列時把 `source` 的內容複製到 `target`。`source` 元素會自動隱藏。 |
| `target` | 元素 id | 內容的顯示位置。點擊的列會標記為選取狀態，同清單只會有一列被選取。 |
| `hover-fx` | 效果名稱 | 這一列的滑過效果，優先於 `<ui-list>` 的設定。 |
| `fx-color` | 色盤名稱或 CSS 顏色 | 這一列的效果色。 |

`list-item` 沒有內容但設定了 `source` 與 `target` 時，會顯示「點擊載入內容」佔位文字。

### `<list-item-ad>` 屬性

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `from` | 色盤名稱或 CSS 顏色 | 漸層起始色。預設 `indigo`。 |
| `to` | 色盤名稱或 CSS 顏色 | 漸層結束色。預設 `ocean`。 |
| `dir` | CSS 角度 | 漸層方向。預設 `135deg`。 |
| `href` | URL 或 `#錨點` | 整列變成連結，行為與原生 `<a href>` 相同。 |
| `link-target` | `_blank` 等 | 連結開啟位置。外部連結會自動加上 `rel="noopener"`。 |

### 滑過效果

`hover-fx` 可用的值：

| 效果 | 說明 |
| --- | --- |
| `glow` | 外光暈，邊框同步染色。 |
| `lift` | 整列上浮並加投影。 |
| `fill` | 底色由左至右填滿。 |
| `bar` | 底部色條由左展開。 |
| `slide` | 內文右移並染色。 |
| `zoom` | 編號放大並加襯底。 |
| `invert` | 編號區反白。 |
| `frame` | 外框向外擴張。 |
| `none` | 停用所有滑過變化。 |

優先順序為 `list-item` > `ui-list` > 全域設定 `hoverFX`。

### 浮動按鈕

`mode="fab"` 會把清單固定在畫面側邊，每個 `list-item` 變成一顆方形按鈕。

```html
<ui-list mode="fab" position="right" bottom="120px">
  <list-item icon="arrow-up" label="TOP" href="#top"></list-item>
  <list-item icon="journal-text" label="筆記" href="#notes"></list-item>
  <list-item icon="box-arrow-up-right" label="官網" accent="orange"
             href="https://example.com" link-target="_blank"></list-item>
</ui-list>
```

| 層級 | 屬性 | 說明 |
| --- | --- | --- |
| `<ui-list>` | `position` | `left` 或 `right`。預設 `right`。 |
| `<ui-list>` | `offset` | 與畫面側邊的距離。預設 `16px`。 |
| `<ui-list>` | `bottom` | 與畫面底部的距離。預設 `120px`。 |
| `<ui-list>` | `gap` | 按鈕間距。 |
| `<ui-list>` | `theme-color` | 所有按鈕的顏色。 |
| `<list-item>` | `icon` | Bootstrap Icons 名稱，不加 `bi-` 前綴。 |
| `<list-item>` | `label` | 圖示下方的小字。 |
| `<list-item>` | `href` | `#錨點` 會平滑捲動到該處，`#` 或 `#top` 捲回頂端；其他網址則為一般連結。 |
| `<list-item>` | `link-target` | 外部連結的開啟位置。 |
| `<list-item>` | `accent` | 這顆按鈕的顏色。 |

### 全域設定

用 `NumericList.setup()` 修改預設值。由於清單在載入時就已渲染，設定之後請呼叫 `NumericList.init()` 重新渲染：

```html
<script src="numeric-list.js"></script>
<script>
  NumericList.setup({
    themeColor:     'lavender',
    hoverFX:        'lift',
    fontSize:       '1rem',
    numberFontSize: '2.5rem'
  });
  NumericList.init();
</script>
```

常用設定鍵：

| 鍵 | 預設值 | 說明 |
| --- | --- | --- |
| `themeColor` | `null` | 全域編號色。未設定時依 `accentColors` 輪替。 |
| `accentColors` | 十色陣列 | 輪替用的編號色。 |
| `hoverFX` | `null` | 全域滑過效果。 |
| `borderColor` | `#6a6b68` | 列的邊框色。 |
| `borderHoverColor` | `#82C8E5` | 滑過時的邊框色。 |
| `borderActiveColor` | `#C3A5E5` | 選取時的邊框色。 |
| `backgroundColor` | `#0C0D0C` | 列底色。 |
| `numberBg` | `#0d1b24` | 編號區底色。 |
| `textColor` | `#C6C7BD` | 內文顏色。 |
| `fontSize` | `1.125rem` | 內文字級。 |
| `numberFontSize` | `3rem` | 編號字級。 |
| `iconFontSize` | `2.25rem` | 圖示字級。 |
| `numberMinWidth` | `84px` | 編號區最小寬度。 |
| `gridNumberMinWidth` | `60px` | Grid 模式的編號區最小寬度。 |
| `borderRadius` | `6px` | 列的圓角。 |
| `rowGap` | `4px` | 列間距。 |
| `lineHeight` | `1.5` | 內文行高。 |
| `padV` / `padH` | `8px` / `12px` | 內文上下與左右內距。 |
| `fabSize` | `52px` | 浮動按鈕尺寸。 |
| `fabOffset` / `fabBottom` | `16px` / `120px` | 浮動按鈕的預設位置。 |

修改 `themeColor` 時，若沒有另外指定 `borderHoverColor` 與 `borderActiveColor`，這兩者會一起跟著改變。

### JavaScript API

```js
NumericList.setup(opts);   // 合併全域設定並重新注入 CSS
NumericList.init();        // 渲染（或重新渲染）頁面上所有 <ui-list>
NumericList.render(el);    // 只渲染指定的 <ui-list>
NumericList.defaults;      // 目前的設定（複本）
NumericList.colors;        // 色盤（複本）
NumericList.effects;       // 可用的 hover-fx 名稱
```

元件會在 `DOMContentLoaded` 自動初始化；若腳本在文件就緒後才載入，則立即執行。原始的 `list-item` 資料會被快取，所以重複呼叫 `init()` 或 `render()` 不會遺失內容。

顏色或 `hover-fx` 填了無效值時，會在 console 輸出警告並列出可用的名稱。

---

## ui-plus.js

一個檔案內含三組互相獨立的元件：概念聚合圖 `ui-cluster`、閱讀輔助標記（`read-pulse`、`chalk-mark`、`col-pair`、`chunk-spot`），以及展開按鈕 `ui-btn`。三組共用一份 CSS（`<style id="ui-components-css">`），於 `DOMContentLoaded` 自動初始化；若腳本在文件就緒後才載入，則立即執行。原始標籤渲染後會被隱藏或取代。

顏色屬性可填色盤名稱，或以 `#`、`rgb` 開頭的 CSS 顏色。`ui-cluster` 會把顏色換算成框線色，只能解析六位數 `#hex`，所以在這個元件上請使用色盤名稱或六位數 `#hex`。

### ui-cluster：概念聚合圖

用一個大圓圈顯示「共有幾項」，點擊後爆開成子節點或清單，適合讓學生先猜數量再看內容。

```html
<!-- 單層：點擊圓圈直接展開清單 -->
<ui-cluster theme="sky" label="常見轉折詞">
  <cluster-item>however</cluster-item>
  <cluster-item>nevertheless</cluster-item>
  <cluster-item>on the other hand</cluster-item>
</ui-cluster>

<!-- 雙層：主圓圈展開成節點，每個節點再展開各自的清單 -->
<ui-cluster theme="lavender" label="Task 2 題型" reset>
  <cluster-node label="Opinion" theme="pink">
    <cluster-item>To what extent do you agree or disagree?</cluster-item>
    <cluster-item>Do you agree or disagree?</cluster-item>
  </cluster-node>
  <cluster-node label="Discussion" theme="ocean">
    <cluster-item>Discuss both views and give your own opinion.</cluster-item>
  </cluster-node>
</ui-cluster>
```

圓圈上的數字自動計算：單層為項目數；雙層的主圓圈為節點數，節點圓圈為該節點的項目數。`<ui-cluster>` 底下同時有 `cluster-node` 與直接的 `cluster-item` 時，以雙層為準。`cluster-item` 內可放任意 HTML。

**`<ui-cluster>` 屬性**

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| `theme`（或 `color`） | `shell` | 主圓圈與框線顏色。 |
| `label` | 空 | 主圓圈下方的標籤文字，展開後淡出。 |
| `size` | `72px` | 主圓圈直徑。 |
| `node-size` | `56px` | 節點圓圈直徑。 |
| `gap` | `24px` | 節點之間的間距。 |
| `font-size` | `1rem` | 基礎字級，圓圈數字與標籤依此比例縮放。 |
| `label-gap` | `4px` | 主標籤與圓圈的距離。 |
| `label-width` | `90px` | 主標籤最大寬度。 |
| `node-label-gap` | `6px` | 節點標籤與圓圈的距離。 |
| `node-label-width` | `76px` | 節點標籤最大寬度。 |
| `reset` | 布林 | 右上角顯示「重設」按鈕，可回到未展開狀態。 |

**`<cluster-node>` 屬性**

| 屬性 | 說明 |
| --- | --- |
| `theme`（或 `color`） | 節點顏色，未設定時沿用 `ui-cluster` 的顏色。 |
| `label` | 節點下方的標籤文字。 |
| `label-gap` / `label-width` | 個別覆寫節點標籤的距離與寬度。 |

**全域設定**：在載入腳本之前定義 `window.UiClusterConfig`，可用鍵為 `theme`、`size`、`nodeSize`、`gap`、`fontSize`、`labelGap`、`labelWidth`、`nodeLabelGap`、`nodeLabelWidth`。

### 閱讀輔助標記

四個標記都用在文章段落裡，幫學生看見句子結構或重點。

#### read-pulse：段落進度條

把一段內容包起來，左側會有一條色條由上往下跑過，提示學生「現在讀這段」。

```html
<read-pulse color="teal" style="glow" trigger="visible">
  <p>Over the past decade, the number of students studying abroad has risen sharply.</p>
</read-pulse>
```

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| `color` | `teal` | 色條顏色。 |
| `color2` | 空 | 第二色。`gradient` 樣式的漸層終點色，或 `double` 樣式第二條色條的顏色。 |
| `style` | `solid` | 色條樣式：`solid`、`gradient`（漸層）、`glow`（光暈）、`segmented`（虛線）、`double`（雙色條）。 |
| `speed` | `2800` | 色條跑完全程的毫秒數。 |
| `speed-2` | `speed` 的 1.15 倍 | `double` 樣式第二條色條的毫秒數。 |
| `pulse-width` | `3px` | 色條寬度。 |
| `pulse-width-2` | `2px` | 第二條色條寬度。 |
| `gap` | `14` | 色條與內文的距離（px，填數字）。 |
| `gap-2` | `9` | 兩條色條之間的距離（px，填數字）。 |
| `trigger` | `visible` | 觸發方式：`visible`（捲動到可見時）、`click`、`hover`。 |
| `repeat` | 布林 | 可重複觸發。未設定時只播放一次。 |

`style` 與 HTML 原生的 `style` 屬性同名。原始的 `<read-pulse>` 會被取代，所以不會影響版面，但編輯器可能會把它標示為無效的 CSS。

#### chalk-mark：粉筆圈字

行內標記。點擊後在文字上方畫出一道粉筆弧線並把文字染色，再點一次擦掉。

```html
<p>The government should <chalk-mark theme="yellow">invest</chalk-mark> more in public transport.</p>
```

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| `theme` | `focus` | 弧線與文字顏色。 |
| `thickness` | `2.5` | 弧線粗細（px，填數字）。 |
| `duration` | `420` | 畫線動畫的毫秒數。 |
| `active` | 布林 | 載入時就畫好弧線。元素尚未出現在畫面上時，會等到捲動到可見才畫。 |

#### col-pair：搭配詞連動

行內標記。同一 `group` 的字詞會一起亮起，用來標示搭配詞、代名詞與先行詞等前後呼應的關係。每個字詞上方有一個小圓點，滑鼠移入任一個，同組全部變色。

```html
<p>The <col-pair group="c1">government</col-pair> announced that
   <col-pair group="c1">it</col-pair> would
   <col-pair group="c2" theme="pink">raise</col-pair>
   <col-pair group="c2">taxes</col-pair>.</p>
```

| 屬性 | 說明 |
| --- | --- |
| `group` | 群組代號。同代號的字詞連動。 |
| `theme` | 群組顏色，同組只要有一個設定即可。未設定時依內建色序自動分配。 |
| `label` | 滑鼠停留時顯示的說明文字（瀏覽器原生提示）。 |

#### chunk-spot：意群聚焦

區塊標記。把句子切成數個 `<chunk-item>`，上方自動產生一排彩色圓點；點圓點會聚焦該意群並淡化其他文字，再點一次取消。意群內還可以再用 `<chunk-subitem>` 切出更細的子意群，對應的小圓點顯示在主圓點下方。

```html
<chunk-spot extra-info="點圓點可聚焦單一意群，再點一次取消。">
  <chunk-item theme="sky" label="主詞片語">The number of students</chunk-item>
  <chunk-item theme="yellow" label="#note-verb">has risen sharply</chunk-item>
  <chunk-item label="時間">over the <chunk-subitem label="期間長度">past decade</chunk-subitem></chunk-item>.
</chunk-spot>

<div id="note-verb"><strong>has risen</strong>：主詞是 number，動詞用單數。</div>
```

**`<chunk-spot>` 屬性**

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| `dot-size` | `11` | 主圓點直徑（px，填數字）。子圓點為其七成。 |
| `dot-gap` | `12px` | 圓點之間的間距。 |
| `dim` | `0.25` | 聚焦時其他文字的透明度。 |
| `sub-dim` | `0.45` | 聚焦子意群時，同意群其餘文字的透明度。 |
| `duration` | `300` | 淡入淡出的毫秒數。 |
| `extra-info` | 空 | 顯示在句子下方的補充說明（可含 HTML）。 |
| `extra-info-gap` | `6px` | 補充說明與句子的距離。 |
| `extra-info-size` | `0.82rem` | 補充說明的字級。 |
| `theme` | `shell` | 補充說明的文字顏色。 |

**`<chunk-item>` 屬性**

| 屬性 | 說明 |
| --- | --- |
| `theme` | 意群顏色。未設定時依內建色序自動分配。 |
| `label` | 圓點的說明。一般文字以瀏覽器原生提示顯示；以 `#` 開頭時（例如 `#note-verb`）改為讀取該 id 元素的 HTML，以浮動面板顯示，來源元素會自動隱藏。 |

**`<chunk-subitem>` 屬性**

| 屬性 | 說明 |
| --- | --- |
| `label` | 滑鼠移入子圓點時，以浮動面板顯示的說明，可含 HTML。 |

**全域設定**：在載入腳本之前定義 `window.UiReadingConfig`。

| 鍵 | 預設值 | 對應屬性 |
| --- | --- | --- |
| `pulseColor` / `pulseColor2` | `teal` / 空 | `read-pulse` 的 `color` / `color2` |
| `pulseStyle` | `solid` | `read-pulse` 的 `style` |
| `pulseSpeed` | `2800` | `read-pulse` 的 `speed` |
| `pulseWidth` / `pulseWidth2` | `3px` / `2px` | `read-pulse` 的 `pulse-width` / `pulse-width-2` |
| `pulseGap` / `pulseGap2` | `14` / `9` | `read-pulse` 的 `gap` / `gap-2` |
| `pulseTrigger` | `visible` | `read-pulse` 的 `trigger` |
| `chalkTheme` | `focus` | `chalk-mark` 的 `theme` |
| `chalkThickness` | `2.5` | `chalk-mark` 的 `thickness` |
| `chalkDuration` | `420` | `chalk-mark` 的 `duration` |
| `chunkDotSize` | `11` | `chunk-spot` 的 `dot-size` |
| `chunkDotGap` | `12px` | `chunk-spot` 的 `dot-gap` |
| `chunkDim` / `chunkSubDim` | `0.25` / `0.45` | `chunk-spot` 的 `dim` / `sub-dim` |
| `chunkTransition` | `300` | `chunk-spot` 的 `duration` |
| `chunkTheme` | 空 | `chunk-item` 的預設 `theme` |

### ui-btn：展開按鈕

把 `<ui-btn>` 放在要控制的內容前面，按鈕就能展開或收合它。也可以只用來跳頁、或跳出一則浮動提示。

```html
<ui-btn icon="bi-lightbulb" icon-active="bi-lightbulb-fill" theme="yellow"
        chevron label-open="收起提示">看提示</ui-btn>
<div style="display:none">先找出題目中的關鍵字，再決定立場。</div>
```

**目標元素的判定順序**

1. 有 `target` 屬性：控制該 id 的元素。
2. 只有 `href`、沒有 `target`：純連結按鈕，不控制任何元素。
3. 都沒有：控制緊接在後面的元素（會略過連續排列的其他 `<ui-btn>`，因此可以並排多顆按鈕）。

**初始狀態**：目標元素一開始就是隱藏（`display:none`）時，按鈕為收合狀態；目標可見時視為已展開。要讓內容預設隱藏，請在目標加上 `style="display:none"`；按鈕加上 `open` 則會強制以展開狀態開始。`scroll-gate` 模式例外，見下方「進階」。

**外觀**

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| 標籤內文字 | 空 | 按鈕文字。沒有文字時變成圓形圖示按鈕，展開時右下角亮起小圓點。 |
| `icon` | 空 | Bootstrap Icons 類別，需含 `bi-` 前綴，例如 `bi-eye`。 |
| `icon-active` | 空 | 展開時改用的圖示。 |
| `label-open` | 空 | 展開時改用的按鈕文字。 |
| `theme` | `shell` | 按鈕顏色。 |
| `size` | `md` | `sm`、`md`、`lg`。 |
| `variant` | `fill` | `fill`（實心）、`outline`（框線）、`ghost`（無框）。 |
| `chevron` | 布林 | 在文字後方加上展開箭頭，展開時旋轉。 |
| `tooltip` | 空 | 滑鼠停留時的提示文字。 |
| `disabled` | 布林 | 停用按鈕。 |

**行為**

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| `target` | 空 | 要控制的元素 id。 |
| `open` | 布林 | 載入時即為展開狀態。 |
| `animation` | `slide` | 展開動畫：`slide`、`fade`、`none`。 |
| `anim-duration` | `320` | 動畫毫秒數。 |
| `group` | 空 | 同組按鈕互斥，打開一個時其他自動收合（手風琴效果）。 |
| `href` | 空 | 點擊後前往的網址。與 `target` 同時設定時，會先切換目標再跳頁。 |
| `href-target` | `_self` | 開啟位置，`_blank` 為新分頁。按住 Ctrl 或 Cmd 點擊也會開新分頁。 |

**浮動提示**

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| `alert` | 空 | 點擊時在畫面頂端或底部跳出的訊息。 |
| `alert-theme` | `safe` | 提示底色。 |
| `alert-position` | `top` | `top` 或 `bottom`。 |
| `alert-duration` | `3000` | 顯示毫秒數，`0` 表示不會自動消失。 |
| `alert-width` | 自動 | 固定寬度，只接受 `px` 或 `%`，例如 `400px`。 |
| `alert-icon` | 空 | 訊息前的 Bootstrap Icons 類別，需含 `bi-` 前綴。 |

**進階**

| 屬性 | 說明 |
| --- | --- |
| `scroll-gate` | 捲動閘門。目標內容維持顯示但呈半透明、無法點選，頁面也無法捲動超過這顆按鈕，直到按下按鈕解鎖。按鈕會持續脈動提示。 |
| `unlock-chunk` | 展開時呼叫外部 `chunk-demo` 元件的 `unlockChunk()`，收合時呼叫 `lockChunk()`。格式為 `元件id:區塊編號`，多個以逗號分隔，例如 `demo1:2,demo1:3`。需另外載入 `chunk-demo.js`。 |

**全域設定**：在載入腳本之前定義 `window.UiBtnConfig`，可用鍵為 `theme`、`size`、`variant`、`animation`、`animDuration`、`chevron`。

### JavaScript API

```js
UiCluster.init();   // 渲染新插入的 <ui-cluster>
UiReading.init();   // 處理新插入的 read-pulse、chalk-mark、col-pair、chunk-spot
UiBtn.init();       // 處理新插入的 <ui-btn>

// 直接跳出浮動提示（與 ui-btn 的 alert 屬性相同外觀）
const a = UiBtn.alert('已儲存', {
  theme: 'safe', position: 'top', duration: 3000, width: '360px', icon: 'bi-check-circle'
});
a.dismiss();        // 手動關閉這一則
UiBtn.alert.clear(); // 清除所有提示

UiCluster.config; UiReading.config; UiBtn.config;  // 目前生效的設定
UiCluster.colors;                                 // 色盤
```

已處理過的標籤會被標記，重複呼叫 `init()` 不會重複渲染。

---

## ui-fillin.js

挖空練習元件。把一段文字中用大括號標記的位置換成空格，學生可以從下拉選單選答案（選擇題），或直接輸入（輸入題）。文末附答案總表與「提交」「重做」按鈕，提交後逐格標示對錯。CSS 注入在 `<style id="ui-fillin-style">`。

### 快速開始

題目內容寫在一個獨立的來源區塊，元件載入時把它複製進 `<main-box>`，再把來源清空並隱藏。

```html
<!-- 選擇題（預設） -->
<ui-fillin option-style="alpha" results-id="score-box">
  <main-box source="q1"></main-box>
</ui-fillin>

<div id="q1">
  <ol>
    <li>The figures {*rose|rise|rised} steadily between 2010 and 2020.</li>
    <li>Choose all contrast words: {*however|*whereas|therefore}.</li>
  </ol>
</div>
<div id="score-box"></div>

<!-- 輸入題 -->
<ui-fillin mode="text" normalize-width show-answer-on-wrong>
  <main-box source="q2"></main-box>
</ui-fillin>

<div id="q2">
  <p>She has lived here {for} ten years, {since|ever since} 2015.</p>
</div>

<script src="ui-fillin.js"></script>
```

### 標籤

| 標籤 | 用途 |
| --- | --- |
| `<ui-fillin>` | 根元素，所有設定都寫在這裡。 |
| `<main-box>` | 題目顯示區。用 `source` 屬性指定來源區塊的 id，必填。 |
| `<ans-box>` | 選用。答案總表與按鈕的位置，未放置時自動建立在題目下方。 |

### 挖空語法

| 模式 | 語法 | 說明 |
| --- | --- | --- |
| 選擇題 | `{*正確答案\|選項二\|選項三}` | 以直線分隔選項，正確答案前加 `*`。至少要有兩個選項，否則該處維持原文。 |
| 複選題 | `{*答案一\|*答案二\|干擾項}` | 標記兩個以上的 `*` 即為複選，選單上方會顯示「可複選」。必須選中全部正確選項、且沒有多選，才算答對。 |
| 輸入題 | `{答案一\|答案二}` | `mode="text"` 時使用。以直線分隔所有可接受的答案，符合任一個即算對。不使用 `*`。 |

- 輸入題的比對**區分大小寫**，前後空白會被忽略。
- 需要在答案中使用 `|`、`{`、`}` 或開頭的 `*` 時，前面加反斜線跳脫，例如 `{a\|b}`。
- 題號依出現順序自動編排。

### 屬性：題目與行為

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `mode` | `choice` \| `text` | 選擇題或輸入題。預設 `choice`。 |
| `option-style` | `alpha` \| `digit` \| `cjk` | 選單中的選項代號：A/B/C、1/2/3、甲/乙/丙。預設 `alpha`。選項順序不會打亂。 |
| `random` | 布林 | 來源中每個 `<ul>` 或 `<ol>` 的項目隨機排序，題號依新順序編排。 |
| `reshuffle-on-reset` | 布林 | 搭配 `random`，按「重做」時重新洗牌。 |
| `hide-number` | 布林 | 空格上不顯示題號。 |
| `no-number-dot` | 布林 | 題號後不加句點。 |
| `hide-answer-table` | 布林 | 隱藏答案總表，只保留按鈕。 |
| `normalize-width` | 布林 | 輸入題比對前先把全形英數與全形空白轉為半形。 |
| `show-answer-on-wrong` | 布林 | 輸入題提交後，答錯或未作答的空格旁顯示正確答案。 |
| `results-id` | 元素 id | 提交後把每題的結果寫進該元素，見下方「結果輸出」。 |

### 屬性：文字標籤

所有介面文字都可以覆寫，未設定時使用內建中文。

| 屬性 | 預設文字 |
| --- | --- |
| `label-correct` | 正確 |
| `label-incorrect` | 錯誤 |
| `label-unanswered` | 未作答 |
| `label-multi-hint` | 可複選 |
| `label-submit` | 提交答案 |
| `label-reset` | 重做 |
| `label-submitted` | 已批改，請查看每題的對錯。 |
| `label-correct-answer-prefix` | 正確答案： |
| `label-no-source` | 找不到來源區塊時的錯誤訊息。 |
| `label-no-blanks` | 來源中沒有可用空格時的錯誤訊息。 |

### 屬性：外觀

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| `font-size` | `1.125rem` | 基礎字級。填純數字時視為 rem。 |
| `line-height` | `1.4` | 行高，只接受純數字，超過 1.5 會被限制為 1.5。 |
| `btn-font-size` | 字級的 0.8 倍 | 按鈕字級，純數字視為 rem。 |
| `btn-radius` | `5px` | 按鈕圓角。 |
| `border-width` | `2px` | 外框粗細。 |
| `radius` | `6px` | 空格與選單的圓角。 |
| `blank-max-width` | `20rem` | 空格最大寬度，純數字視為 rem。 |
| `menu-max-width` | `24rem` | 下拉選單最大寬度。 |
| `menu-max-height` | `60vh` | 下拉選單最大高度，純數字視為 vh。 |
| `root-padding` / `main-padding` / `blank-padding` / `menu-padding` / `option-padding` / `ans-padding` / `btn-padding` | 依部位而定 | 各部位內距，只接受 px 或純數字，最多四個值，例如 `blank-padding="2 6"`。 |
| `bg-color` | `#0C0D0C` | 底色。 |
| `text-color` | `#C6C7BD` | 文字色。 |
| `accent-color` | `#C6C7BD` | 空格、選單與按鈕的強調色。 |
| `ok-color` | `#27AE60` | 答對的顏色。 |
| `bad-color` | `#E6374B` | 答錯的顏色。 |
| `line-color` | `198,199,189` | 外框與分隔線的 RGB 值，以逗號分隔。 |
| `line-alpha` | `0.78` | 外框與分隔線的透明度，最低 0.78。 |

`*-color` 屬性接受 `#hex`、`rgb()`、`rgba()`、`hsl()` 與 CSS 顏色關鍵字；`rgba()` 透明度低於 0.78 時會被忽略。**這個元件不支援色盤名稱**，填 `sky` 之類的名稱會被當成 CSS 關鍵字而失效，請改填色碼。

### 互動方式

- 選擇題：點空格開啟選單，點選項即填入。單選題選完自動關閉；複選題可連續勾選，點選單外或按 `Esc` 關閉。
- 輸入題：直接在空格內打字，空格寬度依最長的可接受答案估算。
- 提交後所有空格鎖定，按「重做」清空作答並解除鎖定。

### 結果輸出

設定 `results-id` 後，提交時會在該元素內寫入每題一個 `<div class="uf-result">`，並帶有以下屬性，方便另外寫樣式或程式讀取：

| 屬性 | 值 |
| --- | --- |
| `data-no` | 題號 |
| `data-state` | `correct` 或 `incorrect` |
| `data-answered` | `true` 或 `false` |

寫入位置優先使用該元素內帶 `data-uf-results` 屬性的子元素；沒有的話，在元素末端自動加一個容器。元素內的其他內容不受影響，按「重做」時只清除結果。

### 事件

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `fillin-change` | 選擇題 `{ no, selected }`，輸入題 `{ no, value }` | 作答內容改變時。`selected` 為所選選項文字的陣列。 |
| `fillin-submit` | `{ results }` | 提交時。`results` 為 `{ no, correct, answered }` 的陣列。 |
| `fillin-reset` | 無 | 按下重做時。 |

三個事件都會冒泡。

### JavaScript API

```js
const f = document.querySelector('ui-fillin');
f.submit();     // 提交並批改
f.reset();      // 重做
f.closeMenu();  // 關閉開啟中的選單
```

---

## slider-show.js

分段投影片元件。每張投影片可以歸屬到不同的部分（part），同一部分內用左右箭頭切換，部分之間用分段按鈕切換，並內建補充說明、防劇透遮罩與填空小測驗。CSS 注入在 `<style id="slider-show-style">`。

### 快速開始

```html
<slider-show theme="lavender" height="420px" progress-style="stepper">

  <div slide part="1" role="start">
    <div class="slide-content">
      <div class="slide-subtitle">Part 1</div>
      <div class="slide-main"><p>Describe your hometown.</p></div>
      <div class="slide-footer">按下方箭頭開始</div>
    </div>
  </div>

  <div slide part="1">
    <div class="slide-content">
      <div class="slide-main">
        <p>I grew up in a <extra-note target="note-area" source="tip-1">small coastal town</extra-note>.</p>
        <p><quiz>It is famous {{for}} its seafood.</quiz></p>
      </div>
    </div>
  </div>

  <div slide part="1">
    <div class="slide-content">
      <div class="slide-main"><p>上一張的作答結果會顯示在這張的頂端。</p></div>
    </div>
  </div>

  <div slide part="2" role="end">
    <div class="slide-content">
      <div class="slide-main" spoiler="點擊看參考答案"><p>My hometown is a quiet fishing town in the south.</p></div>
    </div>
  </div>
</slider-show>

<div id="note-area"></div>
<div id="tip-1" style="display:none">用具體形容詞取代 nice，例如 <strong>coastal</strong>。</div>

<script src="slider-show.js"></script>
```

### 投影片結構

| 標記 | 說明 |
| --- | --- |
| `slide` 屬性 | 任何元素加上 `slide` 即為一張投影片。 |
| `part="N"` | 投影片所屬的部分，預設 `1`。同一部分的投影片依 HTML 順序排列。 |
| `role="start"` / `role="end"` | 標記起始畫面與結束畫面，會套用 `start-style` / `end-style` 的裝飾外框。 |
| `.slide-content` | 選用的內容容器，帶底色與內距。 |
| `.slide-subtitle` / `.slide-main` / `.slide-footer` | 選用的三段式版面：小標題、置中的主內容、頁尾說明。 |

投影片以絕對定位疊放在固定高度的區域內，超出 `height` 的內容會被裁切，請依內容量調整高度。

### 屬性：版型與導覽

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| `theme` | `shell` | 主色，影響箭頭、進度列、分段按鈕與遮罩。可加 `-outline` 後綴，效果與不加相同。 |
| `height` | `400px` | 投影片區域高度。 |
| `current-part` | `1` | 用程式改寫此屬性可直接跳到指定部分的第一張。 |
| `loop` | `false` | 設為 `true` 時，在部分內首尾循環。 |
| `show-arrows` | `true` | 設為 `false` 隱藏左右箭頭。 |
| `show-part-indicator` | `true` | 設為 `false` 隱藏右上角的「Part 1 / 2」標示。 |
| `part-transition` | `slide` | 切換部分時的動畫：`slide`、`fade`、`none`。 |
| `progress-style` | `dots` | 進度列樣式：`dots`（圓點）、`stepper`（圓點連線）、`triangle`（三角形）、`numbers`（頁碼）、`none`。 |
| `progress-scope` | `part` | 進度列範圍：`part` 只顯示目前部分；`all` 顯示全部投影片，可直接跨部分跳頁。 |
| `show-dots` | `true` | 舊屬性。設為 `false` 等同 `progress-style="none"`。 |
| `show-page-numbers` | `false` | 舊屬性。設為 `true` 等同 `progress-style="numbers"`。 |
| `arrow-color` / `arrow-bg` | 主色 / 深灰 | 箭頭顏色與底色。 |
| `dot-color` / `active-dot-color` | 淺灰 / 主色 | 進度列一般與目前位置的顏色。 |
| `bg-color` | `background` | `triangle` 樣式的空心三角形中心色，需與頁面背景相同才會無縫。 |

### 屬性：分段按鈕

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| `auto-show-part-buttons` | `true` | 依位置自動顯示分段按鈕：部分最後一張出現「下一部分」，最後一部分的最後一張出現「完成」與「重新開始」，部分第一張出現「上一部分」。設為 `false` 隱藏所有分段按鈕。 |
| `next-part-btn-text` | `下一部分 →` | 按鈕文字。 |
| `prev-part-btn-text` | `← 上一部分` | 按鈕文字。 |
| `finish-btn-text` | `完成` | 按鈕文字。 |
| `restart-btn-text` | `重新開始` | 按鈕文字。 |
| `next-part-btn-position` | `center` | 按鈕列的水平對齊，填 CSS `justify-content` 的值，例如 `flex-end`、`space-between`。 |
| `show-finish` / `show-restart` | `true` | 設為 `false` 隱藏「完成」或「重新開始」。 |
| `part-btn-bg` / `part-btn-color` | 主色 / 自動對比色 | 分段按鈕的底色與文字色。 |
| `finish-btn-bg` / `finish-btn-color` | 主色 / 自動對比色 | 「完成」按鈕的顏色。 |
| `restart-btn-bg` / `restart-btn-color` | 主色 / 自動對比色 | 「重新開始」按鈕的顏色。 |
| `part-btn-font-size` | `0.9rem` | 分段按鈕字級。 |
| `part-btn-padding` | `6px 12px` | 分段按鈕內距。 |
| `part-btn-border-radius` | `6px` | 分段按鈕圓角。 |

`auto-show-part-buttons="false"` 時，只能用 `progress-scope="all"` 的進度列或改寫 `current-part` 屬性在部分之間移動。

### 屬性：文字顏色與起訖畫面

| 屬性 | 預設值 | 說明 |
| --- | --- | --- |
| `fontcolor-subtitle` | `lavender` | `.slide-subtitle` 文字色。 |
| `fontcolor-main` | `shell` | `.slide-main` 文字色。 |
| `fontcolor-footer` | `sky` | `.slide-footer` 文字色。 |
| `fill-color` | `fill`（`#1A1B1A`） | `.slide-content`、補充說明與填空格的底色。 |
| `start-style` / `end-style` | 有對應 `role` 時為 `accent-frame` | 起始與結束畫面的裝飾：`accent-frame`（單色粗框）、`gradient-border`（漸層框）、`gradient-bg`（漸層底）、`top-bottom-bar`（上下色條）、`corner-tag`（左上角三角標）、`none`。 |
| `start-colors` | `lavender,sky` | 起始畫面的兩個裝飾色，以逗號分隔。 |
| `end-colors` | `safe,teal` | 結束畫面的兩個裝飾色。 |

### 投影片內的互動內容

**補充說明 `<extra-note>`**

行內標籤，顯示為帶底線的可點擊文字。點擊後把內容放進指定的區塊，附淡入動畫。

| 屬性 | 說明 |
| --- | --- |
| `target` | 顯示內容的元素 id，必填。 |
| `source` | 內容來源，必填。填元素 id 時讀取該元素的 HTML；找不到該 id 時，直接把屬性值當成內容。來源元素不會自動隱藏，請自行加上 `style="display:none"`。 |
| `prefix` / `postfix` | 加在文字前後的內容。`prefix` 中若含 `bi-` 開頭的類別名稱，會轉成 Bootstrap Icons 圖示，例如 `prefix="bi-info-circle "`。 |

`<slider-show>` 上的 `extra-note-prefix`、`extra-note-postfix` 設定所有補充說明的預設前後綴，`extra-note-hover-color`（預設 `special`）設定滑過時的顏色。

**防劇透遮罩**

| 用法 | 說明 |
| --- | --- |
| 任一元素加 `spoiler="提示文字"` | 以遮罩蓋住該元素，點擊後淡出。屬性值為遮罩上的文字，空值時使用 `spoiler-text`。建議加在投影片內的區塊上，例如 `.slide-main`。 |
| `<slider-show spoiler-mode="true">` | 所有投影片都加上遮罩（也可寫 `full`）。 |
| `spoiler-text` | 遮罩預設文字，預設「點擊查看內容」。 |
| `spoiler-color` | 遮罩顏色，預設為主色，文字色自動取對比色。 |

**填空小測驗 `<quiz>`**

用 `{{答案}}` 標記空格，會變成可直接輸入的欄位：

```html
<quiz>The population {{rose}} by 20% {{between}} 2010 and 2020.</quiz>
```

- `<quiz>` 內只能放純文字，HTML 標籤會被移除。
- 預設必須填完目前投影片的所有空格，「下一張」與「下一部分」按鈕才會啟用。設定 `quiz-require-complete="false"` 可取消這個限制。
- 移到下一張時，作答結果（你的答案與正確答案）會顯示在該張頂端，比對不分大小寫。測驗放在部分的最後一張時，結果會顯示在下一部分的第一張；放在整份投影片的最後一張時，按下「完成」後直接顯示在本張頂端。
- `classname` 屬性可為產生的容器加上自訂類別。
- 按「重新開始」會清空所有作答與結果。

### 頁首與分頁標題同步

| 屬性 | 說明 |
| --- | --- |
| `update-header="true"` | 換頁時改寫頁面上 `header h1` 或 `header .title` 的文字。 |
| `header-template` | 頁首文字範本，預設 `Part {part} - Slide {slide}`。 |
| `update-title="true"` | 換頁時改寫瀏覽器分頁標題。 |
| `title-template` | 分頁標題範本，預設 `Slide {slide} of {total}`。 |

範本可用 `{part}`（部分編號）、`{slide}`（部分內的第幾張）、`{total}`（部分內的總張數），每個代號只會替換第一次出現的位置。

### 事件

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `part-changed` | `{ part, total }` | 切換到另一個部分之後。 |
| `finished` | `{ part, total }` | 按下「完成」時。 |
| `restarted` | `{ part }` | 按下「重新開始」並回到第一張之後。 |

三個事件都會冒泡，可以在元件本身或 `document` 上監聽：

```js
document.addEventListener('finished', (e) => {
  console.log('完成，共', e.detail.total, '個部分');
});
```

### JavaScript API

```js
const s = document.querySelector('slider-show');
s.nextSlide();             // 部分內下一張
s.prevSlide();             // 部分內上一張
s.nextPart();              // 下一部分
s.prevPart();              // 上一部分
s.restart();               // 回到第一部分第一張，並清空測驗
s.jumpToGlobalSlide(5);    // 跳到全部投影片中的第 6 張（從 0 起算）
s.setAttribute('current-part', '2');  // 跳到第二部分
```

除了 `current-part` 之外，載入後再修改任何屬性都會重新建立按鈕與進度列。

---

## ui-table.js

渲染出一張 CSS Grid 表格，內建可摺疊分組、遮罩儲存格、輪播、彈出說明、定時提示、欄間箭頭與逐步揭示。於 `DOMContentLoaded` 自動初始化，動態內容可手動再次執行。

### 快速開始

```html
<ui-table theme="sky" font-size="1rem">
  <ui-group title-left="Unit 1" title-right="6 items">

    <ui-row col-widths="1:2" col-border="1px solid">
      <ui-col icon="i-check">Term</ui-col>
      <ui-col>Definition</ui-col>
    </ui-row>

    <ui-row>
      <ui-col>mitigate</ui-col>
      <ui-col mask-text="點擊顯示">to make something less severe</ui-col>
    </ui-row>

    <ui-row auto-number="fill">
      <ui-col>第一點</ui-col>
      <ui-col>第二點</ui-col>
    </ui-row>

  </ui-group>
</ui-table>

<script src="ui-table.js"></script>
```

渲染後原本的 `<ui-table>` 會被隱藏，產生的實際表格會插入在它前面。元件會自行插入 `<style id="uit-css">`。

### 標籤

| 標籤 | 用途 |
| --- | --- |
| `<ui-table>` | 根元素，一張表格一個。 |
| `<ui-group>` | 選用的可摺疊分組，附標題列。一張表可以有多個分組，也可以完全不用。 |
| `<ui-row>` | 列。整張表的欄數取自第一個有內容的 `<ui-row>`。 |
| `<ui-row-enhance>` | 與 `<ui-row>` 相同，但欄數以該列自己的儲存格數為準，不沿用整表欄數。適合需要跳脫整體格線的列。 |
| `<ui-col>` | 儲存格，內容可放任意行內 HTML。 |
| `<cell-item>` | 輪播的單張內容，只在設有 `carousel-interval` 的 `<ui-col>` 中有意義。 |

同時帶有 `hidden` 與 `id` 的 `<ui-col>` 會被視為**來源欄位**：不會被渲染，其內部 HTML 可供 `alert-msg` 引用。

### `<ui-table>` 屬性

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `theme` | 色盤名稱或 CSS 顏色 | 邊框、分組標題列與文字的基礎色。預設 `shell`。 |
| `font-color` | 色盤名稱或 CSS 顏色 | 只覆寫文字顏色，邊框與分組標題列仍用 theme 色。 |
| `font-size` | CSS 長度 | 表格基礎字級。預設 `1rem`。 |
| `src` | URL | 從 JSON 檔載入表格資料，見下方「JSON 資料來源」。 |
| `data-id` | 全域變數名稱 | 從 `window[名稱]` 讀取表格資料。 |
| `cell-alignment` | `left` \| `center` \| `right` | 儲存格內的水平對齊。預設 `left`。 |
| `vertical-alignment` | `top` \| `middle` \| `bottom` | 儲存格內的垂直對齊。預設 `top`。 |
| `cell-min-height` | CSS 長度 | 所有儲存格的最小高度。 |
| `hover-bg-color` | 色盤名稱或 CSS 顏色 | 滑鼠移入時的儲存格底色，hex 會自動轉為低透明度。 |
| `row-border` | 不含顏色的 CSS border 簡寫 | 所有列的預設邊框，例如 `1px solid`，顏色會自動接上 theme 色。 |
| `auto-reveal-interval` | 毫秒 | 標記 `hidden` 的列會依此間隔逐列顯示。 |

### `<ui-group>` 屬性

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `title-left` | 文字 | 標題列的主標題。 |
| `title-right` | 文字 | 靠右的次要文字，字級略小。 |
| `ini-collapse` | 布林 | 載入時即為摺疊狀態。 |

點擊標題列可切換展開與摺疊。

### `<ui-row>` / `<ui-row-enhance>` 屬性

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `hidden` | 布林 | 該列會被渲染但不顯示，可由 `auto-reveal-interval` 或 `show-next` 揭示。 |
| `col-widths` | 比例，例如 `2:1:1` | 欄寬比例。比例數必須與欄數相同，否則該列不渲染並輸出 console 錯誤。任一儲存格使用 `span` 時此設定失效。 |
| `cell-padding` | CSS 長度 | 該列儲存格的內距。預設 `6px`。 |
| `border` | 不含顏色的 CSS border 簡寫 | 該列邊框，優先於 `row-border`。 |
| `col-border` | 不含顏色的 CSS border 簡寫 | 儲存格之間的垂直分隔線。任一儲存格使用 `span` 時失效。 |
| `font-size` | CSS 長度 | 該列的字級。 |
| `font-color` | 色盤名稱或 CSS 顏色 | 該列的文字顏色。 |
| `line-height` | 數值或 CSS 長度 | 儲存格文字的行高。 |
| `text-indent` | CSS 長度 | 儲存格文字的首行縮排。 |
| `auto-number` | `outline` \| `fill` \| `outline-v` \| `fill-v` \| `v` | 在儲存格內容前加上圓圈編號，見下方「auto-number」。 |
| `arrow` | 空值 \| `right` \| `click` \| `none` | 該列所有欄界的預設箭頭模式，見下方「欄間箭頭」。 |
| `arrow-size` | 數字（px）或 CSS 長度 | 箭頭高度。預設 `1.5rem`。 |
| `arrow-color` | 色盤名稱或 CSS 顏色 | 箭頭填色。預設 `focus`。 |
| `arrow-pos` | `top` \| `center` \| `bottom` | 箭頭的垂直位置。預設 `center`。 |
| `arrow-open` | 布林 | 搭配 `arrow="click"`，右側儲存格一開始就是顯示的。 |

### `<ui-col>` 屬性

**版面**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `span` | 數字 \| `all` | 跨越多個格線欄位，或佔滿整列。 |
| `width` | CSS 長度 | 該儲存格的固定寬度。 |
| `fixed` | `left` \| `right` | 凍結欄位，水平捲動時固定於左側或右側。 |

**內容與樣式**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `icon` | 內建名稱或 `bi-*` | 內容前方的圖示，會取代該儲存格的 `auto-number`。 |
| `font-color` | 色盤名稱或 CSS 顏色 | 文字顏色，優先順序為儲存格 > 列 > 表格 > theme。 |
| `inverse` | 布林 | 以文字色填滿儲存格底色，文字改用背景色。 |
| `expandable` | 布林 | 內容收合為兩行，附展開與收合切換。 |
| `extra-info` | 元素 id | 顯示握把圖示，點擊後以彈出視窗呈現該元素的 HTML。來源元素載入時即隱藏，內容在點擊當下才讀取，因此之後的修改也會反映。 |

**遮罩**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `mask-text` | 文字 | 以可點擊的遮罩蓋住儲存格，並顯示此文字。 |
| `mask-text-2` | 文字 | 雙層遮罩：第一次點擊換成此文字，第二次才揭露內容。 |
| `mask-color` | 色盤名稱或 CSS 顏色 | 遮罩底色；設定 `mask-invert` 時則為遮罩文字色。 |
| `mask-invert` | 布林 | 改為深色底搭配彩色文字，而非彩色底搭配深色文字。 |
| `mask-gradient` | `1` 到 `6`，或自訂 CSS 漸層 | 遮罩的漸層背景，可用預設值或自行指定。 |
| `mask-order` | 整數 | 連鎖解鎖。同一分組內（無分組時為整張表）依數字由小到大依序解鎖，未輪到的遮罩顯示鎖頭。 |

**輪播**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `carousel-interval` | 毫秒 | 依序輪播該儲存格底下的 `<cell-item>`。預設 `3000`。 |
| `progress-bar` | 布林 | 在輪播下方顯示細的倒數進度條。 |
| `progress-bar-color` | 色盤名稱或 CSS 顏色 | 進度條顏色。 |

**提示訊息**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `alert-msg` | 文字或來源欄位 id | 訊息內容。若值與某個隱藏來源欄位的 `id` 相同，則改用該欄位的 HTML。 |
| `alert-interval` | 毫秒 | 訊息出現的間隔，必填。 |
| `alert-pos` | `A` \| `B` \| `C` | 必填。`A` 覆蓋儲存格，`B` 浮在上方，`C` 浮在右側。 |
| `alert-color` | 色盤名稱或 CSS 顏色 | 訊息底色。 |

每次顯示的時間長度由 `UiTableConfig.alertDuration` 決定，預設 `5000` 毫秒。

**逐步揭示**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `show-next` | `true` \| `col` \| `row` | 點擊儲存格以揭示下一列。`row` 展開整列，`col` 只展開正下方的那一格。使用 `true` 時，同列有兩個以上 `show-next` 視為 `col`，只有一個則視為 `row`。 |

**箭頭**

`arrow`、`arrow-size`、`arrow-color`、`arrow-pos`、`arrow-open` 的用法與列層級相同，設在儲存格上會覆寫列的設定。若列層級已設定箭頭，可用 `arrow="none"` 讓個別欄位關閉。

### auto-number

設在列上。沒有指定 `icon` 的儲存格，內容前方會插入圓圈編號。

| 值 | 行為 |
| --- | --- |
| `outline`（預設） | 橫向。每列由 1 重新起算，空心圓圈。 |
| `fill` | 橫向，實心圓圈。 |
| `outline-v`、`fill-v`、`v` | 縱向。每列只領一個序號，在同一分組（無分組時為整張表）內跨列累計，同列所有儲存格共用該序號。 |

有自訂 `icon` 的儲存格保留圖示，但在橫向模式下仍佔用該位置的編號，因此序號可能跳號。

0 到 9 使用 Bootstrap Icons 繪製，10 以上改用同尺寸的內嵌 SVG 圓圈。

### 遮罩與連鎖解鎖

- 單純的 `mask-text` 遮罩點一下即可揭露。
- `mask-text-2` 讓遮罩變成兩段式。
- `mask-order` 會把一組遮罩串成鎖鏈：只有目前序號最小且尚未開啟的遮罩可點擊，其餘顯示鎖頭等待輪到。
- `mask-order` 重複會輸出錯誤並退回為無序行為；序號不連續則只輸出警告，功能仍正常。

### 欄間箭頭

`arrow` 設在欄界的**左側**欄位，箭頭會畫在它與右側欄位的交界線上。兩側儲存格會自動預留內距，文字不會被壓到。

- `arrow` 或 `arrow="right"`：有箭尾的粗箭頭，純顯示用。
- `arrow="click"`：實心三角形，點擊後顯示右側儲存格，再點一次收合。可以連鎖，例如甲揭示乙、乙再揭示丙。
- 左側儲存格被隱藏、該列換行、或整列不可見時，箭頭會自動隱藏。

### 彈出說明

`extra-info` 的彈出視窗掛在 `<body>` 上，不會被儲存格的 overflow 裁切。它會隨捲動與視窗縮放重新定位，下方空間不足時改翻到圖示上方，點擊外部或按 `Esc` 即關閉，且全頁同時只會開啟一個。

### 圖示

內建 SVG 圖示，可用於 `icon`：

`i-arrow-down`、`i-arrow-up`、`i-arrow-right`、`i-arrow-left`、`i-check`、`i-expand`、`i-collapse`、`i-lock`、`i-grip`

也可直接使用任何 Bootstrap Icons 類別，例如 `icon="bi-star-fill"`。

遮罩漸層預設值 `1` 到 `6` 依序為靛紫、海藍、橘、粉紅、藍綠，以及藍轉靛紫的混合。元件以 `#0C0D0C` 作為反白文字、凍結欄底色與遮罩對比色。

### JSON 資料來源

除了標記之外，表格也可以用 JSON 描述，透過 `src`（抓取網址）或 `data-id`（全域變數）載入。

```html
<ui-table theme="teal" src="data/unit-1.json"></ui-table>

<ui-table theme="teal" data-id="UNIT_DATA"></ui-table>
<script>
  window.UNIT_DATA = { /* ... */ };
</script>
```

結構：

```json
{
  "fontSize": "1rem",
  "fontColor": "vanilla",
  "cellAlignment": "left",
  "verticalAlignment": "top",
  "hoverBgColor": "sky",
  "cellMinHeight": "48px",
  "rowBorder": "1px solid",
  "autoRevealInterval": 0,
  "groups": [
    {
      "titleLeft": "Unit 1",
      "titleRight": "6 items",
      "iniCollapse": false,
      "rows": [
        {
          "enhance": false,
          "hidden": false,
          "colWidths": "1:2",
          "colBorder": "1px solid",
          "cellPadding": "8px",
          "border": "1px solid",
          "fontSize": "1rem",
          "fontColor": "shell",
          "lineHeight": "1.5",
          "textIndent": "0",
          "autoNumber": "fill",
          "arrow": "click",
          "arrowSize": "1.5rem",
          "arrowColor": "focus",
          "arrowPos": "center",
          "arrowOpen": false,
          "cols": [
            { "icon": "bi-star-fill", "content": "Term" },
            {
              "content": "Definition",
              "maskText": "點擊顯示",
              "maskText2": "再點一次",
              "maskColor": "indigo",
              "maskInvert": false,
              "maskOrder": 1,
              "span": 1,
              "width": "200px",
              "fixed": "left",
              "inverse": false,
              "expandable": false,
              "showNext": false,
              "extraInfo": "note-1",
              "carouselInterval": 3000,
              "progressBar": true,
              "progressBarColor": "teal",
              "alertMsg": "記得複習",
              "alertColor": "warning",
              "alertInterval": 8000,
              "alertPos": "C",
              "items": ["第一張", "第二張"]
            }
          ]
        }
      ]
    }
  ]
}
```

注意事項：

- `items` 優先於 `content`，請與 `carouselInterval` 搭配使用。
- 布林旗標對應到「有設就生效」的屬性，填 `false` 等同於不加該屬性。
- `maskGradient` 不在 JSON 對應範圍內，需要漸層遮罩請改用標記撰寫。
- 所有內容都必須放在 `groups` 之中，JSON 不支援沒有分組的表格。

### 全域設定

在載入腳本**之前**定義 `window.UiTableConfig` 即可調整預設值：

```html
<script>
  window.UiTableConfig = {
    theme:              'shell',
    cellPadding:        '6px',
    fontSize:           '1rem',
    alertDuration:      5000,
    autoRevealInterval: 0,
    cellAlignment:      'left',
    verticalAlignment:  'top',
    hoverBgColor:       '',
    cellMinHeight:      '',
    rowBorder:          '',
    arrowSize:          '1.5rem',
    arrowColor:         'focus',
    arrowPos:           'center'
  };
</script>
<script src="ui-table.js"></script>
```

個別元素上的屬性永遠優先於這些預設值。

### JavaScript API

```js
UiTable.init();     // 渲染所有尚未初始化的 <ui-table>
UiTable.config;     // 目前生效的 UiTableConfig 物件
UiTable.colors;     // 內建色盤，{ shell: '#C6C7BD', ... }
```

元件會在 `DOMContentLoaded` 自動初始化；若腳本在文件就緒後才載入，則立即執行。動態插入新的 `<ui-table>` 標記後再呼叫一次 `UiTable.init()` 即可，已渲染過的表格會自動略過。單一表格初始化失敗時不會影響其他表格。

### 互斥規則與警告

元件採防禦式設計，遇到問題會輸出到 console，而不是默默失敗。

| 組合 | 結果 |
| --- | --- |
| `mask-text` + `expandable` | 忽略 `expandable`（警告） |
| `mask-text` + `carousel-interval` | 忽略 `carousel-interval`（警告） |
| `mask-text` + `extra-info` | 忽略 `extra-info`（警告） |
| `alert-msg` + `carousel-interval` | 忽略 `carousel-interval`（警告） |
| `carousel-interval` + `extra-info` | 忽略 `extra-info`（警告） |
| `arrow` 與任一側的 `mask-text` | 忽略箭頭（警告） |
| `extra-info` 未填值 | 忽略（錯誤） |
| `arrow` 設在最後一欄 | 忽略（警告） |
| `col-widths` 數量不符 | 略過該列渲染（錯誤） |
| `mask-order` 重複 | 視為無序（錯誤） |
| `mask-order` 不連續 | 仍可運作（警告） |
| `show-next` 後面沒有下一列 | 忽略（警告） |
| `alert-msg` 缺少 `alert-interval` 或 `alert-pos` | 忽略（錯誤） |
