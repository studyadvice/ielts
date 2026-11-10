# cell 格子元件：cell-drawer

以格子為單位的教學元件，單一 `.js` 檔，載入後自動注入樣式，不使用 Shadow DOM，圖示使用 Bootstrap Icons。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `cell-drawer.js` | `<cell-drawer>` `<cell-level>` `<cell-start>` | 點色條切換層級的單行格子，支援輪播與動態數字樣板。 |

## 目錄

- [cell-drawer.js](#cell-drawerjs)

---

## cell-drawer.js

`<cell-drawer>` 是一條帶彩色側邊色條的單行格子，裡面疊著好幾個層級（`<cell-level>`）。點擊色條就換到下一個層級，適合把同一個概念由淺到深分層呈現，或做成自動輪播的跑馬燈。內容裡可以用 `{{= 函式(參數) }}` 樣板，從頁面其他元素即時計算數字。

### 標籤

| 標籤 | 位置 | 用途 |
| --- | --- | --- |
| `<cell-drawer>` | 任意位置 | 外層容器。 |
| `<cell-level>` | `<cell-drawer>` 內 | 一個層級的內容，可放 HTML，本身不顯示。 |
| `<cell-start>` | `<cell-drawer>` 內 | 選用，固定在色條旁的標頭區塊，可放圖示與文字。 |

### `<cell-drawer>` 屬性：版型與行為

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `theme` | 品牌色名稱或色碼 | `violet` | 主色，用於色條與外框。 |
| `mode` | `single`、`auto`、`fixed`、`carousel` | `single` | `single` 單行，超出以省略號表示；`auto` 自動換行；`fixed` 固定高度，超出可捲動；`carousel` 自動輪播。 |
| `level` | 整數 | `0` | 一開始顯示的層級（0 起算）。 |
| `height` | 長度 | `auto` | `fixed` 模式的高度，例如 `80px`。 |
| `strip-width` | 數字（px） | `8` | 色條寬度。 |
| `strip-position` | `left`、`right` | `left` | 色條與 `<cell-start>` 的位置。 |
| `show-dots` | 布林 | 關閉 | 色條上顯示層級圓點。 |
| `show-badge` | 布林 | 關閉 | 右下角顯示「目前 / 總數」。 |
| `no-loop` | 布林 | 關閉 | 到最後一層就停住，不回到第一層。 |

### `<cell-drawer>` 屬性：輪播

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `carousel-interval` | 毫秒 | `3000` | 輪播間隔，最小 400。 |
| `carousel-pause` | `false` | 開啟 | 滑鼠移入時暫停，設為 `false` 停用。 |
| `btn-start` | 布林 | 關閉 | `carousel` 模式下先顯示「開始」按鈕，按下才開始輪播。 |
| `progress-height` | 數字（px） | `2` | 進度條高度。 |
| `progress-style` | `bar`、`fuse` | `bar` | 進度條樣式；`fuse` 為燃燒引信效果。 |
| `progress-dir` | `ltr`、`rtl` | `ltr` | 進度條填充方向。 |
| `show-countdown` | 布林 | 關閉 | 右下角顯示倒數秒數。 |

### `<cell-drawer>` 屬性：文字與顏色

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `slide-color` | `#C6C7BD` | 內容文字色。 |
| `slide-padding` | `6px 8px` | 內容內距。 |
| `slide-line-height` | `1.5` | 內容行高。 |
| `slide-font-size` | `.85rem` | 內容字級。 |
| `slide-font-family` | 繼承 | 內容字體。 |
| `surface-bg` | 自動推算 | 內容區底色。 |
| `dot-color` | `rgba(12,13,12,.78)` | 一般圓點顏色。 |
| `dot-active-color` | `#DBEDD8` | 目前圓點顏色。 |
| `badge-color` | `rgba(198,199,189,.78)` | 頁碼文字色。 |
| `badge-font-size` | `.6rem` | 頁碼字級。 |
| `badge-font-family` | `monospace` | 頁碼字體。 |
| `start-bg` | 跟隨 `theme` | `<cell-start>` 與開始按鈕的底色。 |
| `start-color` | 依底色亮度自動 | `<cell-start>` 與開始按鈕的文字色。 |
| `start-font-size` | 依部位 | `<cell-start>` 圖示、文字與開始按鈕的字級（同時套用）。 |
| `start-font-family` | 繼承 | `<cell-start>` 字體。 |
| `countdown-color` | 跟隨 `theme` | 倒數秒數顏色。 |
| `countdown-font-size` | `.52rem` | 倒數秒數字級。 |
| `countdown-font-family` | `monospace` | 倒數秒數字體。 |

### `<cell-level>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `src` | 元素 id | 改用該元素的內容，而不是標籤內的 HTML。找不到時顯示紅字提示。 |
| `mode` | `single`、`auto`、`fixed` | 只覆寫這一層的顯示方式。 |
| `hint-page` | 布林 | 提示頁。搭配 `btn-start`，按下開始時會直接跳過這一層。 |

### `<cell-start>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `icon` | Bootstrap Icons 類別 | 圖示，需含 `bi-` 前綴。標籤內的文字為標頭文字。 |

### 屬性解說

- **切換層級**：點擊色條（或聚焦後按 Enter、空白鍵）前進一層，按上方向鍵回上一層。到最後一層再前進會回到第一層，除非設了 `no-loop`。
- **動態樣板**：內容裡寫 `{{= sum(a, b) }}` 這類樣板，參數是頁面上元素的 id，元件會讀取這些元素的數字（自動去掉 `$`、`,` 等符號）計算結果。來源元素內容改變時，結果會自動更新並閃一下。可用函式：`sum`、`avg`、`max`、`min`、`mul`、`sub`、`div`、`val`、`count`、`fmt`（數字、小數位數）、`pct`（部分、總數、小數位數）、`concat`。
- **即時更新**：所有屬性改變都會立即套用，不必重新整理。

### 範例

**基本分層**

```html
<cell-drawer theme="blue" show-dots>
  <cell-level>mitigate</cell-level>
  <cell-level>mitigate：減輕、緩和</cell-level>
  <cell-level>mitigate the impact of climate change</cell-level>
</cell-drawer>
```

**標頭、頁碼與自動換行**

```html
<cell-drawer theme="indigo" mode="auto" show-badge level="1" strip-position="right">
  <cell-start icon="bi-journal-text">Part 2</cell-start>
  <cell-level>Describe a skill you learned.</cell-level>
  <cell-level>You should say: what the skill is, when you learned it, and why it was useful.</cell-level>
</cell-drawer>
```

**固定高度與外部內容**

```html
<cell-drawer theme="indigo" mode="fixed" height="120px">
  <cell-level src="tip-long"></cell-level>
  <cell-level mode="single">一行摘要</cell-level>
</cell-drawer>
<div id="tip-long" hidden><p>這段內容比較長，超過高度時可以捲動。</p></div>
```

**輪播、開始按鈕與燃燒進度條**

```html
<cell-drawer theme="energetic" mode="carousel" carousel-interval="2500" btn-start
             progress-style="fuse" progress-height="3" show-countdown>
  <cell-level hint-page>按下開始播放</cell-level>
  <cell-level>Fluency</cell-level>
  <cell-level>Lexical Resource</cell-level>
  <cell-level>Grammatical Range</cell-level>
</cell-drawer>
```

**動態計算**

```html
<span id="q1">120</span> <span id="q2">80</span>
<cell-drawer theme="green" mode="auto">
  <cell-level>合計：{{= sum(q1, q2) }}，第一季佔 {{= pct(q1, total-q, 1) }}</cell-level>
</cell-drawer>
<span id="total-q" hidden>200</span>
```

### 事件

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `cd-change` | `{ level, total }` | 切換到另一個層級。 |
| `cd-ready` | `{ level, total }` | 建立完成。 |

### JavaScript API

```js
const d = document.querySelector('cell-drawer');
d.goTo(2);            // 跳到第 3 層
d.next(); d.prev();
d.currentLevel;       // 目前層級
d.startCarousel(); d.stopCarousel();

CellDrawer.configure({ theme: 'blue', stripWidth: 6, slideFontSize: '1rem' });  // 改全頁預設值
CellDrawer.colors;    // 品牌色
CellDrawerTPL.eval('sum', 'q1, q2');   // 直接計算樣板函式
```

---
