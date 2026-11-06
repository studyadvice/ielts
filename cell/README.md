# cell 格子元件：cell-drawer、dual-cell

兩個以格子為單位的教學元件。每個元件都是單一 `.js` 檔，載入後自動注入樣式，不使用 Shadow DOM，圖示使用 Bootstrap Icons。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `cell-drawer.js` | `<cell-drawer>` `<cell-level>` `<cell-start>` | 點色條切換層級的單行格子，支援輪播與動態數字樣板。 |
| `dual-cellex.js` | `<dual-cell>` `<dual-group>` `<dual-row>` `<dual-col>` `<dual-item>` `<dual-slot>` | 帶功能按鈕的多欄格子表，可推送、拉取、複製、交換、遮罩與逐列揭示。 |

## 目錄

- [cell-drawer.js](#cell-drawerjs)
- [dual-cellex.js](#dual-cellexjs)

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
<cell-drawer theme="orange" mode="carousel" carousel-interval="2500" btn-start
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

## dual-cellex.js

`<dual-cell>` 把一組 `<dual-col>` 排成兩欄（或多欄）的格子表，每格右側有一顆功能按鈕，可以把內容推送到外部區塊、從外部拉回、複製、與相鄰格交換、清空、展開附屬內容，或顯示下一列。格子也能加上一或兩層遮罩、輪播多個項目，並以群組分段。也可以直接用 `new DualCell(id, options)` 建立。

### 標籤

| 標籤 | 位置 | 用途 |
| --- | --- | --- |
| `<dual-cell>` | 任意位置，必須有 `id` | 外層容器。 |
| `<dual-group>` | `<dual-cell>` 內 | 可摺疊的群組，有標題列。 |
| `<dual-row>` | `<dual-cell>` 或 `<dual-group>` 內 | 明確指定一列。 |
| `<dual-col>` | `<dual-row>` 內，或直接放在容器內 | 一個格子。直接放在容器內時，依 `cols` 自動分列。 |
| `<dual-item>` | `<dual-col>` 內 | 輪播項目，兩個以上才會輪播。 |
| `<dual-slot>` | `<dual-row>` 內 | 這一列的附屬內容，由 `toggle` 按鈕展開。內含兩個以上 `<dual-col>` 時以多欄顯示。 |

不想用自訂標籤時，可改用帶 `data-dual-cell`、`data-group`、`data-dual-row`、`data-col`、`data-item`、`data-slot` 屬性的一般元素，設定改寫成 `data-*`。

### `<dual-cell>` 屬性：版面與格子

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `theme` | `violet`、`green`、`blue`、`orange`、`pink`、`yellow`、`vanilla`、`indigo`、`shell`、`red`、`gray`、`key`、`key-deep`、`calm`、`quiet`、`playful`、`urgent` | 中性灰 | 一次套用外框、格子底色、文字、按鈕與群組標題的配色。 |
| `cols` | 整數 | `2` | 未用 `<dual-row>` 時，每列幾格。 |
| `col-widths` | 例如 `1:2` | 平均 | 欄寬比例。 |
| `cell-min-height` | 長度 | `40px` | 格子最小高度。 |
| `cell-padding` | CSS `padding` 值 | `8px 12px` | 格子內距。 |
| `cell-bg-color` | 顏色 | `#333333` | 格子底色。 |
| `hover-bg-color` | 顏色 | `#404040` | 滑過時底色。 |
| `text-color` | 顏色 | `#c6c7bd` | 文字色。 |
| `font-size` | 長度 | `1rem` | 字級。 |
| `cell-alignment` | `left`、`center`、`right` | `left` | 水平對齊。 |
| `vertical-alignment` | `top`、`middle`、`bottom` | `middle` | 垂直對齊。 |
| `border-width` | 長度 | `1px` | 外框粗細。 |
| `border-style` | CSS 邊框樣式 | `solid` | 外框樣式。 |
| `border-color` | 顏色 | `#c6c7bd` | 外框顏色。 |
| `border-follow-theme` | 布林 | 關閉 | 群組外框改用群組標題色。 |
| `auto-reveal-interval` | 毫秒 | `0` | 大於 0 時，帶 `hidden` 的列依序每隔這段時間自動出現。 |
| `target-id` | 元素 id | 無 | `push`、`pull` 預設的外部目標。 |

### `<dual-cell>` 屬性：功能按鈕

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `show-menu-button` | `false` | 顯示 | 隱藏所有功能按鈕。 |
| `menu-button-position` | `left`、`right` | `right` | 按鈕位置。 |
| `menu-button-color` | 顏色 | `#71CD76` | 按鈕顏色。 |
| `menu-button-size` | 長度 | `1.25rem` | 按鈕大小。 |
| `menu-button-icon-push`、`-pull`、`-copy`、`-swap`、`-clear`、`-toggle`、`-toggle-expanded`、`-put`、`-show-next` | Bootstrap Icons 類別 | 無 | 各動作的按鈕圖示，例如 `menu-button-icon-copy="bi-clipboard"`。 |

### `<dual-cell>` 屬性：遮罩、輪播與群組

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `overlay-1-text`、`overlay-2-text` | 無 | 所有格子的第一層、第二層遮罩文字。 |
| `overlay-1-color`、`overlay-2-color` | 跟隨主題 | 遮罩顏色。 |
| `overlay-invert` | 關閉 | 深色遮罩、彩色文字。 |
| `carousel-interval` | `4000` | 輪播間隔毫秒數。 |
| `carousel-indicator` | 顯示 | 設為 `false` 隱藏輪播進度條。 |
| `carousel-indicator-color` | 跟隨主題 | 進度條顏色。 |
| `carousel-indicator-height` | `3px` | 進度條高度。 |
| `group-title-font-size` | `1.125rem` | 群組標題字級。 |
| `group-title-color` | `#1C1C1E` | 群組標題文字色。 |
| `group-title-bg-color` | 跟隨主題 | 群組標題底色。 |
| `group-title-padding` | `10px 12px` | 群組標題內距。 |
| `group-icon-size` | `1rem` | 群組展開圖示大小。 |
| `group-collapsed-icon`、`group-expanded-icon` | 無 | 收合與展開時的 Bootstrap Icons 類別。 |

### `<dual-group>` 屬性

| 屬性 | 說明 |
| --- | --- |
| `title` | 標題文字。 |
| `title-icon` | 標題前的圖示。 |
| `title-right`、`title-right-icon` | 標題列右側的文字與圖示。 |
| `collapsed` | 設為 `true` 時預設收合。 |
| `title-font-size`、`title-color`、`title-bg-color`、`title-padding` | 只覆寫這個群組的標題外觀。 |
| `collapsed-icon`、`expanded-icon` | 只覆寫這個群組的展開圖示。 |

### `<dual-row>` 屬性

| 屬性 | 說明 |
| --- | --- |
| `col-widths` | 只覆寫這一列的欄寬比例。 |
| `hidden` | 先隱藏這一列，交給 `show-next` 或 `auto-reveal-interval` 顯示。 |
| `auto-reveal-delay` | 這一列被顯示後，隔多少毫秒自動顯示下一個隱藏列，可一路串下去。 |

### `<dual-col>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `id` | 文字 | 讓其他格子的 `put` 動作指向這裡。 |
| `menu-action` | `push`、`pull`、`copy`、`swap`、`clear`、`toggle`、`put`、`show-next` | 功能按鈕的動作，預設 `push`。 |
| `target` | 元素 id | 動作的目標：`push`、`pull` 的外部元素，`toggle` 的內容來源，`put` 的目標格子。 |
| `show-menu` | `false` | 這一格不放功能按鈕。 |
| `width` | 長度 | 固定寬度。 |
| `span` | `all` | 橫跨整列。 |
| `padding` | CSS `padding` 值 | 這一格的內距。 |
| `overlay-1-text`、`overlay-1-color`、`overlay-2-text`、`overlay-2-color`、`overlay-invert` | 同容器 | 只覆寫這一格的遮罩。 |
| `hover-source`、`hover-target` | 元素 id | 滑鼠移入時，把 `hover-source` 的內容放進 `hover-target`，移出後保留。 |
| `carousel-interval`、`carousel-indicator`、`carousel-indicator-color`、`carousel-indicator-height` | 同容器 | 只覆寫這一格的輪播設定。 |

### 屬性解說

- **八種動作**：`push` 把格子內容放進外部目標；`pull` 把外部目標的內容拉進格子；`copy` 複製格子文字；`swap` 與右側（最後一格則左側）格子交換內容；`clear` 確認後清空；`toggle` 在列下方展開或收起附屬內容（優先使用 `<dual-slot>`，沒有時讀取 `target`）；`put` 把內容放進 id 為 `target` 的另一格；`show-next` 顯示下一個隱藏列。
- **雙層遮罩**：設了 `overlay-1-text` 的格子先被遮住，點一下移除第一層；有第二層時再點一下才完全揭曉。
- **兩種逐列揭示**：`auto-reveal-interval` 從載入開始，依固定間隔逐列顯示；`auto-reveal-delay` 則是某一列被顯示（例如按了 `show-next`）之後，接著自動顯示下一列。
- **顏色名稱**：顏色屬性可填 `shell`、`violet`、`green`、`orange`、`blue`、`vanilla`、`yellow`、`indigo`、`pink`、`bg`、`area`、`red`、`gray`、`key`、`key-deep`、`calm`、`quiet`、`playful`、`urgent` 或任意色碼。
- **建立時機**：屬性只在連到畫面時讀取一次。

### 範例

**推送到外部區塊**

```html
<dual-cell id="dc-1" theme="blue" target-id="preview" menu-button-icon-push="bi-box-arrow-right">
  <dual-col>mitigate</dual-col>
  <dual-col>減輕、緩和</dual-col>
  <dual-col>exacerbate</dual-col>
  <dual-col>使惡化</dual-col>
</dual-cell>
<div id="preview"></div>
```

**各種動作、附屬內容與遮罩**

```html
<dual-cell id="dc-2" theme="violet" col-widths="1:2"
           menu-button-icon-copy="bi-clipboard" menu-button-icon-swap="bi-arrow-left-right"
           menu-button-icon-toggle="bi-chevron-down" menu-button-icon-toggle-expanded="bi-chevron-up">
  <dual-row>
    <dual-col menu-action="copy">a double-edged sword</dual-col>
    <dual-col menu-action="toggle" overlay-1-text="先猜意思" overlay-2-text="再看例句">一把雙面刃</dual-col>
    <dual-slot>Social media is a double-edged sword.</dual-slot>
  </dual-row>
  <dual-row>
    <dual-col menu-action="swap">Topic sentence</dual-col>
    <dual-col menu-action="put" target="note-cell">Supporting idea</dual-col>
  </dual-row>
  <dual-row>
    <dual-col id="note-cell" show-menu="false">（放置區）</dual-col>
    <dual-col menu-action="clear">可以清空的格子</dual-col>
  </dual-row>
</dual-cell>
```

**群組、輪播與逐列揭示**

```html
<dual-cell id="dc-3" theme="orange" menu-button-icon-show-next="bi-arrow-down-circle"
           group-collapsed-icon="bi-chevron-right" group-expanded-icon="bi-chevron-down">
  <dual-group title="Part 1" title-right="5 題">
    <dual-row>
      <dual-col menu-action="show-next">Do you work or study?</dual-col>
      <dual-col carousel-interval="2500">
        <dual-item>I'm currently ...</dual-item>
        <dual-item>At the moment, I ...</dual-item>
      </dual-col>
    </dual-row>
    <dual-row hidden auto-reveal-delay="1500">
      <dual-col>What do you like about it?</dual-col>
      <dual-col>The best part is ...</dual-col>
    </dual-row>
    <dual-row hidden>
      <dual-col>Would you change it?</dual-col>
      <dual-col>Probably not, because ...</dual-col>
    </dual-row>
  </dual-group>
</dual-cell>
```

**用 JavaScript 建立**

```js
const dc = new DualCell('my-box', {
  theme: 'green', cols: 2, targetId: 'preview',
  onCellClick: (row, col) => console.log(row, col),
  onMenuClick: (action, row, col) => console.log(action),
  onContentPush: (row, col, html) => {},
  onContentPull: (row, col, html) => {}
});
```

### JavaScript API

| 名稱 | 說明 |
| --- | --- |
| `new DualCell(id, options)` | 以容器 id 建立，`options` 的鍵名為屬性名稱的駝峰式。 |
| `el.dualCellInstance` | `<dual-cell>` 元素上的 `DualCell` 實例。 |
| `onCellClick(row, col)` | 點擊格子時呼叫。 |
| `onMenuClick(action, row, col)` | 按下功能按鈕時呼叫。 |
| `onContentPush(row, col, html)`、`onContentPull(row, col, html)` | 推送或拉取完成時呼叫。 |
| `DualCell.resolveColor(name)` | 把顏色名稱轉成色碼。 |
| `DualCell.getThemeConfig(name)` | 取得主題的配色設定。 |
