# ui-table

用語意標籤寫表格的純 JavaScript 元件。把 `<ui-table>`、`<ui-row>`、`<ui-col>` 寫進 HTML，載入一支 `ui-table.js`，就能得到以 CSS Grid 排版、帶有遮罩、輪播、逐步揭示、欄間箭頭、樹狀展開等互動效果的表格。

- 單一檔案，不需要建置工具，也不依賴任何框架
- JavaScript 與 CSS 寫在同一支檔案裡，載入時自動注入樣式
- 不使用 Shadow DOM，頁面上的 CSS 可以直接覆寫
- 支援 HTML 標記與 JSON 資料兩種寫法
- 原本的 `<ui-table>` 元素會保留在頁面上（隱藏），可以掛事件、用 API 操作

完整範例請開啟 [`ui-table-demo-10-29-26.html`](ui-table-demo-10-29-26.html)，每個範例都附有對照的程式碼。

---

## 目錄

- [快速開始](#快速開始)
- [標籤結構](#標籤結構)
- [ui-table 屬性](#ui-table-屬性)
- [ui-group 屬性](#ui-group-屬性)
- [ui-row 與 ui-row-enhance 屬性](#ui-row-與-ui-row-enhance-屬性)
- [ui-col 屬性](#ui-col-屬性)
- [功能說明](#功能說明)
  - [欄寬、跨欄與框線](#欄寬跨欄與框線)
  - [文字色彩與 `inverse`](#文字色彩與-inverse)
  - [圖示與自動編號](#圖示與自動編號)
  - [群組](#群組)
  - [逐列揭示：show-next 與 auto-reveal](#逐列揭示show-next-與-auto-reveal)
  - [展開長文字：expandable](#展開長文字expandable)
  - [遮罩](#遮罩)
  - [補充資訊：extra-info](#補充資訊extra-info)
  - [展開附屬內容：toggle](#展開附屬內容toggle)
  - [滑過顯示：hover-source 與 hover-target](#滑過顯示hover-source-與-hover-target)
  - [輪播](#輪播)
  - [欄間箭頭](#欄間箭頭)
  - [固定欄](#固定欄)
  - [整列隱藏：can-hide](#整列隱藏can-hide)
  - [文字色彩標籤](#文字色彩標籤)
  - [注意力動畫：ui-flash](#注意力動畫ui-flash)
  - [行內翻譯：ui-trans](#行內翻譯ui-trans)
  - [樹狀巢狀（僅 ui-row-enhance）](#樹狀巢狀僅-ui-row-enhance)
  - [icons-list 滑入動畫（僅 ui-row-enhance）](#icons-list-滑入動畫僅-ui-row-enhance)
- [JSON 資料模式](#json-資料模式)
- [JavaScript API 與事件](#javascript-api-與事件)
- [全域設定 UiTableConfig](#全域設定-uitableconfig)
- [互斥規則](#互斥規則)
- [主控台訊息](#主控台訊息)

---

## 快速開始

```html
<ui-table theme="blue">
  <ui-row col-widths="1:3" border="1px solid" col-border="1px solid" cell-padding="12px 16px">
    <ui-col>題目</ui-col>
    <ui-col>Describe a skill you learned as an adult.</ui-col>
  </ui-row>
  <ui-row col-widths="1:3" border="1px solid" col-border="1px solid" cell-padding="12px 16px">
    <ui-col>提示</ui-col>
    <ui-col mask-text="點我看提示">先說是什麼技能，再說學習的契機。</ui-col>
  </ui-row>
</ui-table>
```

渲染後，元件會在 `<ui-table>` 前面插入一個 `div.uit-wrap`，原本的 `<ui-table>` 則被隱藏起來。

---

## 標籤結構

| 標籤 | 用途 |
|---|---|
| `<ui-table>` | 表格本體。所有設定的起點，也是 API 與事件的目標。 |
| `<ui-group>` | 可摺疊的群組，有標題列。可省略。 |
| `<ui-row>` | 一般列。欄數以整張表第一個有欄位的 `<ui-row>` 為準。 |
| `<ui-row-enhance>` | 進階列。欄數以這一列自己的欄位數為準，並支援樹狀巢狀與 icons-list。 |
| `<ui-col>` | 儲存格。 |
| `<cell-item>` | 輪播項目，寫在設了 `carousel-interval` 的 `<ui-col>` 裡。 |
| `<ui-flash>` | 閃電按鈕，可放在頁面任何地方，按下後讓指定格子播放注意力動畫。 |
| `<ui-trans>` | 行內翻譯，滑鼠移入時以 浮動框 顯示來源區塊的內容。可放在格子內或一般段落。 |
| `<c-blue>` 等 17 個色名標籤 | 文字色彩標籤，見[文字色彩標籤](#文字色彩標籤)。 |

```
ui-table
├── ui-group（可省略）
│   ├── ui-row
│   │   └── ui-col
│   └── ui-row-enhance
│       ├── ui-col
│       └── ui-row-enhance   ← 巢狀子列
└── ui-row / ui-row-enhance（沒有 ui-group 時直接寫在 ui-table 下）
```

同時有 `hidden` 與 `id` 的 `<ui-col>` 不會被當成欄位渲染，可以拿來存放 extra-info 的內容。

---

## ui-table 屬性

| 屬性 | 值 | 說明 |
|---|---|---|
| `theme` | 色票名稱、`#hex`、`rgb()` | 主題色：框線、群組標題列、預設文字色。預設 `shell`。 |
| `src` | URL | 從網址讀取 JSON 資料。 |
| `data-id` | 全域變數名稱 | 從 `window[data-id]` 讀取 JSON 資料。 |
| `font-size` | CSS 長度 | 整張表的字體大小，預設 `1rem`。 |
| `font-color` | 色彩 | 整張表的文字色，優先於主題色。框線與標題列仍用主題色。 |
| `cell-alignment` | `left`、`center`、`right` | 儲存格水平對齊。 |
| `vertical-alignment` | `top`、`middle`、`bottom` | 儲存格垂直對齊。 |
| `hover-bg-color` | 色彩 | 滑鼠移到儲存格上的底色。 |
| `cell-min-height` | CSS 長度 | 儲存格最小高度。 |
| `row-border` | 例如 `1px solid` | 每一列的預設外框，色彩自動使用主題色。 |
| `auto-reveal-interval` | 毫秒 | 有 `hidden` 的列依序每隔指定時間自動顯示。 |
| `extra-info-size` | 數字或 `px`、`rem`、`em` | extra-info 握把圖示的預設高度。 |
| `extra-info-color` | 色彩 | extra-info 握把圖示的預設色彩。 |
| `toggle-icon` | Bootstrap Icons 名稱 | toggle 按鈕收合時的預設圖示，預設 `bi-chevron-down`。 |
| `toggle-icon-open` | Bootstrap Icons 名稱 | toggle 按鈕展開時的預設圖示，預設 `bi-chevron-up`。 |
| `toggle-color` | 色彩 | toggle 按鈕與展開區虛線的預設色彩，預設為主題色。 |
| `hover-target` | 元素 `id` | `hover-source` 內容的預設放置位置。 |
| `tree-col` | 正整數 | 樹狀展開鈕與縮排放在第幾欄，預設 `1`。 |
| `tree-indent` | 數字或 `px`、`rem`、`em` | 每一層的縮排寬度，預設 `20px`。 |
| `tree-icon` | `chevron`、`caret`、`plus` | 展開鈕圖示，預設 `chevron`。 |
| `tree-line` | 布林 | 顯示樹狀導引線。 |
| `tree-line-color` | 色彩 | 導引線色彩，預設 `#3A3B38`。 |
| `tree-accordion` | 布林 | 手風琴模式：同一層只能展開一個節點。 |
| `tree-open` | 布林 | 所有樹狀節點載入時就展開。 |

---

## ui-group 屬性

| 屬性 | 說明 |
|---|---|
| `title-left` | 標題列左側文字。 |
| `title-right` | 標題列右側文字。 |
| `ini-collapse` | 載入時就是收合的。 |

點擊標題列可以摺疊或展開整個群組。

---

## ui-row 與 ui-row-enhance 屬性

| 屬性 | 值 | 說明 |
|---|---|---|
| `col-widths` | 例如 `1:2:1` | 欄寬比例，數量必須等於欄數，否則這一列不會渲染。同一列有 `span` 時忽略。 |
| `cell-padding` | CSS `padding` 值 | 這一列儲存格的內距，預設 `6px`。 |
| `border` | 例如 `1px solid` | 這一列的外框，色彩自動使用主題色。 |
| `col-border` | 例如 `1px solid` | 欄與欄之間的分隔線。同一列有 `span` 時忽略。 |
| `font-size` | CSS 長度 | 這一列內容的字體大小。 |
| `font-color` | 色彩 | 這一列的文字色。 |
| `line-height` | CSS 行高 | 這一列內容的行高。 |
| `text-indent` | CSS 長度 | 這一列內容的首行縮排。 |
| `auto-number` | `outline`、`fill`、`outline-v`、`fill-v`、`v` | 自動圓圈編號，見[圖示與自動編號](#圖示與自動編號)。 |
| `hidden` | 布林 | 隱藏這一列，交給 show-next 或 auto-reveal 顯示。 |
| `arrow` 系列 | | 整列的欄間箭頭預設值，見[欄間箭頭](#欄間箭頭)。 |
| `extra-info-size`、`extra-info-color` | | 這一列的握把預設值。 |
| `tree-open` | 布林 | 僅 ui-row-enhance：這個節點載入時就展開。 |
| `min-height` | 數字或 `px`、`rem`、`em`、`vh` | 這一列格子的最小高度，優先於 `cell-min-height`。純數字視為 px，巢狀子列不會沿用。 |
| `can-hide` | 空值、`true`、欄位編號、`false` | 僅 ui-row-enhance：在格子右側放眼睛圖示，點擊後整列隱藏，見[整列隱藏](#整列隱藏can-hide)。 |
| `can-hide-size` | 數字或 `px`、`rem`、`em` | 眼睛圖示大小，純數字視為 px。 |
| `can-hide-color` | 色彩 | 眼睛圖示色彩。 |

---

## ui-col 屬性

| 屬性 | 說明 |
|---|---|
| `icon` | 內容前的圖示：`bi-` 開頭的 Bootstrap Icons，或內建的 `i-arrow-down`、`i-arrow-up`、`i-arrow-right`、`i-arrow-left`、`i-check`、`i-expand`、`i-collapse`、`i-lock`、`i-grip`。 |
| `font-color` | 這一格的文字色。 |
| `inverse` | 反白：底色等於文字色，文字改為 `#0C0D0C`。 |
| `span` | 跨欄數，或 `all` 跨滿整列。 |
| `width` | 儲存格寬度。 |
| `fixed` | `left` 或 `right`：水平捲動時固定在左側或右側。 |
| `show-next` | 點擊後顯示下一列，值可為 `true`、`row`、`col`。 |
| `expandable` | 內容先顯示兩行，點擊展開全文。 |
| `mask-text` | 遮罩文字，點擊揭曉。 |
| `mask-text-2` | 雙層遮罩的第二層文字。 |
| `mask-color` | 遮罩底色。 |
| `mask-invert` | 深色遮罩、彩色文字。 |
| `mask-gradient` | 漸層遮罩：`1` 到 `6` 的預設漸層，或任何 CSS 漸層。 |
| `mask-order` | 依序解鎖的順序編號。 |
| `extra-info` | 補充資訊來源元素的 `id`。 |
| `extra-info-size` | 握把圖示高度，純數字視為 `px`。 |
| `extra-info-color` | 握把圖示色彩。 |
| `toggle` | 展開內容來源的 `id`（建議用 `<template>`）。這一格右側出現 toggle 按鈕。 |
| `toggle-icon`、`toggle-icon-open`、`toggle-color` | 只覆寫這一格的 toggle 圖示與色彩。 |
| `hover-source` | 滑鼠移入時要顯示的內容來源 `id`。 |
| `hover-target` | 只覆寫這一格的放置位置。 |
| `carousel-interval` | 輪播間隔毫秒數；`0` 為手動輪播。 |
| `progress-bar` | 顯示輪播進度條。 |
| `progress-bar-color` | 進度條單色。 |
| `progress-bar-color1`、`progress-bar-color2` | 進度條漸層的開始色與結束色。 |
| `arrow`、`arrow-size`、`arrow-color`、`arrow-pos`、`arrow-open` | 欄間箭頭，見[欄間箭頭](#欄間箭頭)。 |
| `icons-list`、`icons-list-interval` | 僅 ui-row-enhance：滑鼠移入時的圖示動畫。 |
| `item-number` | 搭配 `carousel-interval`：每個 `<cell-item>` 左側自動編號，`outline`（預設）、`fill` 或 `count`。 |
| `id` | 格子的唯一 id，`<ui-flash>` 與 `UiTable.flash()` 靠它找到格子。 |
| `flash-width`、`flash-speed`、`flash-loops`、`flash-length` | 這一格注意力動畫的預設值，見[注意力動畫](#注意力動畫ui-flash)。 |

---

## 功能說明

### 欄寬、跨欄與框線

```html
<ui-table theme="vanilla" row-border="1px solid">
  <ui-row col-widths="2:1:1" col-border="1px solid" cell-padding="10px 14px">
    <ui-col>科目</ui-col><ui-col>上學期</ui-col><ui-col>下學期</ui-col>
  </ui-row>
  <ui-row cell-padding="10px 14px">
    <ui-col span="all">跨滿整列的說明文字</ui-col>
  </ui-row>
</ui-table>
```

- `border`、`col-border`、`row-border` 只寫粗細與樣式，色彩自動使用主題色。
- 相鄰兩列的框線會重疊成一條。
- 一般 `<ui-row>` 的欄數以第一個 `<ui-row>` 為準；`<ui-row-enhance>` 各自計算，適合欄數不同的列。

### 文字色彩與 `inverse`

文字色彩的優先順序：`ui-col` 的 `font-color` > `ui-row` 的 `font-color` > `ui-table` 的 `font-color` > `theme`。

`inverse` 會把這一格的文字色當成底色，文字改用深色，適合做表頭或強調格。

```html
<ui-row-enhance>
  <ui-col inverse>任務</ui-col>
  <ui-col inverse font-color="orange">狀態</ui-col>
</ui-row-enhance>
```

### 圖示與自動編號

```html
<ui-row auto-number="fill">
  <ui-col>第一步</ui-col>
  <ui-col>第二步</ui-col>
  <ui-col icon="bi-star-fill">有 icon 的格子用自己的圖示</ui-col>
</ui-row>
```

| `auto-number` 值 | 方向 | 說明 |
|---|---|---|
| `outline`（預設）、`fill` | 橫向 | 同一列由左到右從 1 開始，每列重新起算。有 `icon` 的格子保留位置，所以會跳號。 |
| `outline-v`、`fill-v`、`v` | 縱向 | 同一個群組（或整張表）跨列累計，同一列沒有 `icon` 的格子共用這一列的號碼。 |

`fill` 是實心圓圈，`outline` 是空心圓圈。1 到 9 使用 Bootstrap Icons，10 以上改用同尺寸的 SVG。

### 群組

```html
<ui-table theme="violet">
  <ui-group title-left="Part 1" title-right="4 題" ini-collapse>
    <ui-row>...</ui-row>
  </ui-group>
</ui-table>
```

### 逐列揭示：show-next 與 auto-reveal

`show-next` 寫在儲存格上，點擊後顯示或收起下一列，格子右側會出現箭頭。

| 值 | 行為 |
|---|---|
| `row` | 整列顯示或收起。 |
| `col` | 只顯示下一列同一位置的格子，其他格子保持空白。 |
| `true` 或空值 | 同一列只有一格設 show-next 時用 `row`，兩格以上時用 `col`。 |

```html
<ui-row>
  <ui-col show-next>問題（點我看答案）</ui-col>
</ui-row>
<ui-row hidden>
  <ui-col>答案</ui-col>
</ui-row>
```

在 `<ui-table>` 設 `auto-reveal-interval="1500"`，所有 `hidden` 的列會每隔 1.5 秒依序出現。

### 展開長文字：expandable

內容先顯示兩行，點擊文字或右側的箭頭展開全文，再點一次收合。

```html
<ui-col expandable>很長的範例答案……</ui-col>
```

### 遮罩

```html
<ui-col mask-text="點我揭曉">答案</ui-col>
<ui-col mask-text="先想一想" mask-text-2="再點一次">答案</ui-col>
<ui-col mask-text="漸層遮罩" mask-gradient="3">答案</ui-col>
<ui-col mask-text="反色遮罩" mask-invert mask-color="pink">答案</ui-col>
```

- 樣式優先順序：`mask-invert` > `mask-gradient` > `mask-color` > 主題色。
- `mask-gradient` 可填 `1` 到 `6`（紫、青、橘、粉、綠、藍紫），或任何 CSS 漸層字串。
- `mask-text-2`：第一次點擊換成第二層文字，第二次點擊才揭曉。

**依序解鎖**：設了 `mask-order` 的遮罩要依編號順序點開，還沒輪到的會顯示鎖頭。範圍是同一個群組（或沒有群組時的整張表）。編號重複時視為無序並發出錯誤，不連續時發出警告。

```html
<ui-row>
  <ui-col mask-text="第 1 步" mask-order="1">……</ui-col>
  <ui-col mask-text="第 2 步" mask-order="2">……</ui-col>
  <ui-col mask-text="第 3 步" mask-order="3">……</ui-col>
</ui-row>
```

### 補充資訊：extra-info

在內容後面加一個握把圖示，點擊後跳出 浮動框，內容取自指定 `id` 的元素。

```html
<ui-col extra-info="note-1" extra-info-size="1.25rem" extra-info-color="pink">make a decision</ui-col>

<div id="note-1" hidden>
  <p>make 偏向「產生、做出結果」。</p>
</div>
```

- 來源元素會自動隱藏；內容在點擊當下才讀取，之後修改來源也會顯示最新內容。
- 浮動框 掛在 `<body>`，不會被儲存格裁切，會自動選擇上方或下方的空間。
- 點擊 浮動框 以外的地方或按 Esc 關閉。
- 握把的尺寸與色彩優先順序：`ui-col` > `ui-row` > `ui-table` > `UiTableConfig`。尺寸是圖示高度，寬度自動為 0.65 倍。

### 展開附屬內容：toggle

在格子上寫 `toggle="來源 id"`，格子右側會出現一顆按鈕。按下後在這一列下方展開一條橫跨整列的內容區，再按一次收起。

```html
<ui-table theme="blue" toggle-icon="bi-plus-circle" toggle-icon-open="bi-dash-circle">
  <ui-row col-widths="1:2">
    <ui-col>a double-edged sword</ui-col>
    <ui-col toggle="ex-sword">一把雙面刃</ui-col>
  </ui-row>
</ui-table>

<template id="ex-sword"><p>Social media is a double-edged sword.</p></template>
```

- 來源建議用 `<template>`；一般元素也可以，載入時會自動隱藏。內容在按下當下才讀取。
- 圖示寫 Bootstrap Icons 名稱，`bi-` 前綴可以省略。圖示與色彩的優先順序：`ui-col` > `ui-table` > 預設。
- 同一列有多個 toggle 格子時共用一個展開區，按另一格會直接換內容，前一格的按鈕自動恢復收合圖示。展開中的格子底部會出現一條色線。
- 按鈕會阻止點擊往外傳，所以和 `show-next` 放在同一格也不會同時觸發。
- 可以和遮罩、輪播、補充資訊、欄間箭頭並用；有遮罩時，揭曉前按鈕被遮住。
- 每次展開或收起，`<ui-table>` 會發出 `uit-toggle` 事件（會冒泡，也可以在 `document` 上監聽）。

### 滑過顯示：hover-source 與 hover-target

滑鼠移到格子上時，把 `hover-source` 的內容放進 `hover-target`；移開後內容保留，直到滑到下一個有 `hover-source` 的格子。

```html
<ui-table theme="green" hover-target="preview">
  <ui-row>
    <ui-col hover-source="pv-mitigate">mitigate</ui-col>
    <ui-col hover-source="pv-exacerbate">exacerbate</ui-col>
  </ui-row>
</ui-table>

<div id="preview"></div>
<template id="pv-mitigate"><p>mitigate the impact of</p></template>
<template id="pv-exacerbate"><p>exacerbate the problem</p></template>
```

- `hover-target` 寫在 `<ui-table>` 當整張表的預設，單一格也可以自己指定。
- 來源一樣建議用 `<template>`；一般元素會自動隱藏。
- 格子的遮罩還沒揭曉時不會觸發。
- 每次放入內容，`<ui-table>` 會發出 `uit-hover` 事件（會冒泡）。

### 輪播

在儲存格裡放多個 `<cell-item>`，搭配 `carousel-interval`。

**自動輪播**

```html
<ui-col carousel-interval="2500" progress-bar progress-bar-color1="orange" progress-bar-color2="pink">
  <cell-item>Fluency：先求說得順。</cell-item>
  <cell-item>Lexical Resource：用得穩的字才算數。</cell-item>
</ui-col>
```

項目由下往上滑入。`progress-bar` 會在下方顯示 3px 的倒數條。

**手動輪播**

`carousel-interval="0"` 搭配 `progress-bar` 就是手動輪播：

```html
<ui-col carousel-interval="0" progress-bar progress-bar-color="blue">
  <cell-item>開場</cell-item>
  <cell-item>契機</cell-item>
  <cell-item>困難</cell-item>
  <cell-item>收尾</cell-item>
</ui-col>
```

- 進度條變成分段樣式：段數等於項目數，高度 7px，貼齊儲存格下緣，上方留較大的空白。
- 點擊進度條切換到下一個項目，最後一個再點會回到第一個。
- 沒有 `progress-bar` 時沒有切換入口，只會顯示第一個項目並發出警告。

**輪播項目自動編號**

```html
<ui-col carousel-interval="3000" item-number="count">
  <cell-item>thrive</cell-item>
  <cell-item>flourish</cell-item>
  <cell-item>prosper</cell-item>
</ui-col>
```

`item-number` 空值或 `outline` 為空心圓圈編號，`fill` 為實心圓圈編號，`count` 為「2 / 5」計數框。10 以上的編號改用同尺寸的圓圈圖形。編號顏色跟隨格子文字色。寫在沒有輪播的格子會被忽略並出現警告。

**進度條色彩**

優先順序：`progress-bar-color1` 加 `progress-bar-color2` 的漸層 > `progress-bar-color` > 主題色（`inverse` 格子為深色）。只設 `progress-bar-color1` 或 `progress-bar-color2` 其中一個時當單色使用並發出警告。漸層橫跨整條進度條計算，不會因為倒數或分段而被壓縮或打斷。

### 欄間箭頭

箭頭畫在這一格與右邊下一格的交界線上。寫在 `ui-col` 上只影響那一格；寫在 `ui-row` 上是整列的預設值。

| 屬性 | 值 | 說明 |
|---|---|---|
| `arrow` | 空值或 `right` | 純顯示的粗箭頭。 |
| | `click` | 實心三角形，點擊後顯示右邊的格子，再點一次收起。 |
| | `none` | 整列設定箭頭時，個別格子關閉。 |
| `arrow-open` | 布林 | 搭配 `click`，右邊的格子一開始就顯示。 |
| `arrow-size` | 數字或 `px`、`rem`、`em` | 箭頭高度，預設 `1.5rem`。 |
| `arrow-color` | 色彩 | 預設 `focus`。 |
| `arrow-pos` | `top`、`center`、`bottom` | 箭頭的垂直位置，預設 `center`。 |

```html
<ui-row arrow="click" col-border="1px solid">
  <ui-col>原句</ui-col>
  <ui-col>換詞</ui-col>
  <ui-col>換句型</ui-col>
</ui-row>
```

`click` 可以連鎖：左邊的格子還沒出現時，右邊一律隱藏，所以能做出一步一步揭示的效果。兩側的格子會自動預留空間，箭頭不會壓到文字。最後一格沒有右邊的格子，設了會被忽略。

### 固定欄

表格寬於容器時可以水平捲動，`fixed="left"` 或 `fixed="right"` 的格子會固定在該側。

### 整列隱藏：can-hide

替 `<ui-row-enhance>` 加上 `can-hide`，格子右側出現眼睛圖示，滑鼠移上去變成劃掉的眼睛，點擊後整列收合隱藏，適合螢幕錄影時逐列帶過。

```html
<ui-table theme="blue">
  <ui-row><ui-col>Word</ui-col><ui-col>Meaning</ui-col><ui-col>Collocation</ui-col></ui-row>
  <ui-row-enhance can-hide col-widths="1:2:2">
    <ui-col>mitigate</ui-col><ui-col>減輕、緩和</ui-col><ui-col>mitigate the impact of</ui-col>
  </ui-row-enhance>
  <ui-row-enhance can-hide="1" can-hide-color="pink" can-hide-size="18" col-widths="1:2:2">
    <ui-col>exacerbate</ui-col><ui-col>使惡化</ui-col><ui-col extra-info="tip-1">exacerbate the problem</ui-col>
  </ui-row-enhance>
</ui-table>
```

- 空值或 `true`：眼睛放在最後一欄。數字（1 起算）：放在指定欄，超過欄數時改放最後一欄。`false`：關閉。寫在 `<ui-row>` 上會被忽略並出現警告。
- 眼睛所在的格子不能同時有 `extra-info`，該格的 `extra-info` 會被忽略；同一列其他格子不受影響。
- 父列隱藏時子列一起隱藏；子列也可以各自加 `can-hide`。
- 遮罩格子裡的眼睛浮在遮罩上方；`inverse` 格子的眼睛自動改成深色。
- 隱藏只影響畫面，重新整理就會恢復。被眼睛隱藏的列不會因為上一列的 `show-next` 而重新出現。用 `UiTable.showHidden()` 可全部顯示回來。

### 文字色彩標籤

在 `<ui-col>`、`<cell-item>` 與 extra-info 來源區塊的內容裡，用 `<c-色名>文字</c-色名>` 套用品牌色，可以和 `<b>`、`<u>` 互相包覆。`inverse` 格子裡會變成品牌色底的小標籤（`key-deep` 用白字，其他用深色字）。`mask-text` 是屬性文字，不支援標籤。色名清單見根目錄 README 的「色名標籤」。

```html
<ui-col>The government should <c-pink>invest in</c-pink> public transport.</ui-col>
<ui-col inverse><c-violet>rain or shine</c-violet></ui-col>
```

### 注意力動畫：ui-flash

一段彩虹光帶從格子左上角出發，沿著內緣順時針繞圈。格子要有 `id`，`<ui-flash target="格子id">` 會變成閃電按鈕，標籤裡的文字當按鈕文字。

```html
<ui-table theme="green">
  <ui-row><ui-col id="w-mitigate" flash-speed="1200">mitigate</ui-col><ui-col>減輕、緩和</ui-col></ui-row>
</ui-table>

<p>先看這個字：<ui-flash target="w-mitigate" flash-width="4" flash-loops="3" color="pink">看這裡</ui-flash></p>
```

| 屬性 | 寫在哪裡 | 說明 |
|---|---|---|
| `target` | `ui-flash` | 必填，格子的 id。找不到格子時按鈕會變紅並抖動。 |
| `flash-width` | `ui-flash`、`ui-col` | 光帶粗細，純數字或 px，範圍 1～20，預設 3。 |
| `flash-speed` | `ui-flash`、`ui-col` | 繞一圈的時間，純數字為毫秒，也接受 `1.6s`，範圍 200～20000，預設 1600。 |
| `flash-loops` | `ui-flash`、`ui-col` | 繞幾圈，範圍 1～20，預設 2。 |
| `flash-length` | `ui-col` | 光帶長度佔周長的比例，0.05～0.9，預設 0.22。 |
| `color` | `ui-flash` | 按鈕顏色，預設 `yellow`。 |
| `size` | `ui-flash` | 按鈕字級，純數字視為 px，也接受 `rem`、`em`。 |

設定優先順序為 `ui-flash` 的屬性 > `ui-col` 的屬性 > `UiTableConfig`。光帶疊在遮罩上方；格子不在畫面內時會先捲過去；按鈕放在格子裡時不會觸發該格的 `show-next`。同時有 `hidden` 與 `id` 的 `ui-col` 是 extra-info 來源區塊，不能當成目標。

### 行內翻譯：ui-trans

滑鼠移到標示的字上，讀取 `source` 區塊的內容，以 浮動框 顯示在字的下方（空間不夠時改到上方）。觸控裝置點一下顯示。來源區塊載入時自動隱藏。

```html
<p>I rented <ui-trans source="t-flat" theme="blue">a tiny flat</ui-trans> near the station,
   and it was <ui-trans source="t-godsend" hint-style="icon" hint-width="240">a real godsend</ui-trans>.</p>

<div id="t-flat">一間小公寓</div>
<div id="t-godsend"><b>天賜的好事</b><p>Band 7 以上常見的 idiomatic language。</p></div>
```

| 屬性 | 說明 |
|---|---|
| `source` | 必填，來源區塊的 id。移入當下才讀取內容，之後修改來源也會顯示最新內容。 |
| `theme` | 標示與 浮動框 的色彩，預設 `blue`。 |
| `hint-style` | `dashed`（預設，虛底線）、`pill-fill`、`pill-outline`、`square-fill`、`icon`（文字正上方顯示翻譯圖示）。 |
| `hint-width` | 浮動框 寬度，純數字視為 px，也接受 `rem`、`em`、`vw`。沒寫時依內容自動，最寬 420px。 |
| `hint-font-size` | 浮動框 字級，純數字視為 px，也接受 `rem`、`em`。沒寫時跟隨標示文字。 |

`ui-trans` 寫在格子、輪播項目、extra-info 來源或 JSON 的 `content` 字串裡都有效，點擊時不會觸發格子的 `show-next`。

### 樹狀巢狀（僅 ui-row-enhance）

把子列直接寫在父列裡面，父列就會出現展開鈕，點擊後子列由上往下滑順展開，層數不限。只有展開鈕會切換，不會觸發儲存格的其他點擊。

```html
<ui-table id="tree-pm" theme="blue" tree-line>
  <ui-row-enhance col-widths="3:1:1" border="1px solid" col-border="1px solid" cell-padding="10px 14px" tree-open>
    <ui-col>雅思口說課程改版</ui-col><ui-col>講師</ui-col><ui-col>進行中</ui-col>
    <ui-row-enhance>
      <ui-col>Part 1 題庫整理</ui-col><ui-col>講師</ui-col><ui-col>完成</ui-col>
    </ui-row-enhance>
    <ui-row-enhance>
      <ui-col>Part 2 範例錄音</ui-col><ui-col>助教</ui-col><ui-col>進行中</ui-col>
      <ui-row-enhance>
        <ui-col>人物類 12 題</ui-col><ui-col>助教</ui-col><ui-col>完成</ui-col>
      </ui-row-enhance>
    </ui-row-enhance>
  </ui-row-enhance>
</ui-table>
```

- 只認 `ui-row-enhance` 裡直屬的 `ui-row-enhance`。寫在 `ui-row` 裡的子列，或 `ui-row-enhance` 裡的 `ui-row`，都會被忽略並發出警告。
- 子列沒寫的 `col-widths`（欄數相同時）、`cell-padding`、`border`、`col-border` 會沿用父列。最上層的列彼此之間不會沿用，各自要寫。
- 最上層只要有一列有子列，沒有子列的列也會留出展開鈕的寬度，文字才會對齊。
- 樹狀欄的內容固定靠左。
- 收合父列時，子層各自的展開狀態會保留。

樹狀設定全部寫在 `<ui-table>` 上（見 [ui-table 屬性](#ui-table-屬性)），子列只需要 `tree-open`。

### icons-list 滑入動畫（僅 ui-row-enhance）

滑鼠每次移入格子，就清空內容，從左到右依序顯示圖示，最後一個圖示出現後再過一個間隔，才恢復原本的內容。

```html
<ui-row-enhance>
  <ui-col icons-list="bi-arrow-right-square, bi-arrow-right-square, bi-arrow-right-square-fill" icons-list-interval="500">
    滑過我
  </ui-col>
  <ui-col icons-list="3, 2, 1, bi-play-fill" icons-list-interval="700">
    Part 2 準備時間倒數
  </ui-col>
</ui-row-enhance>
```

- 時序（n 個圖示、間隔 `interval`）：移入當下顯示第 1 個，之後每隔 `interval` 顯示下一個，最後一個出現後再隔 `interval` 恢復內容，總長 n × `interval`。
- 播放途中再次移入會從頭開始。播放時格子高度不變。
- `bi-` 開頭用 Bootstrap Icons；內建名稱（如 `i-check`）用內建 SVG；其他文字直接顯示。
- 圖示色彩跟隨格子文字色，大小為文字的 1.25 倍。
- 樹狀欄的格子播放時，展開鈕保持顯示，也可以照常點擊。
- 第一次播放時會檢查 Bootstrap Icons 名稱，找不到的會列在警告裡。
- `icons-list-interval` 預設 500 毫秒。

---

## JSON 資料模式

用 `data-id` 指定全域變數，或用 `src` 指定網址：

```html
<script>
  window.demoData = {
    treeLine: true,
    rows: [{
      enhance: true,
      treeOpen: true,
      colWidths: '2:1',
      border: '1px solid',
      cellPadding: '10px 14px',
      cols: [{ content: '口說評分項目' }, { content: '權重' }],
      children: [
        { cols: [{ content: 'Fluency and Coherence' }, { content: '25%' }] },
        { cols: [{ content: 'Lexical Resource', iconsList: ['bi-book', 'bi-book-fill'] }, { content: '25%' }] }
      ]
    }]
  };
</script>
<ui-table theme="green" data-id="demoData"></ui-table>

<ui-table theme="blue" src="data/table.json"></ui-table>
```

`theme` 寫在 `<ui-table>` 元素上，不在 JSON 裡。

**表格層級**

`fontSize`、`fontColor`、`autoRevealInterval`、`cellAlignment`、`verticalAlignment`、`hoverBgColor`、`cellMinHeight`、`rowBorder`、`extraInfoSize`、`extraInfoColor`、`treeCol`、`treeIndent`、`treeIcon`、`treeLine`、`treeLineColor`、`treeAccordion`、`treeOpen`、`toggleIcon`、`toggleIconOpen`、`toggleColor`、`hoverTarget`，以及：

- `groups`：`[{ titleLeft, titleRight, iniCollapse, rows: [...] }]`
- `rows`：沒有 `groups` 時，可以直接寫列的陣列

**列層級**

`enhance`（`true` 時建成 ui-row-enhance）、`hidden`、`cellPadding`、`border`、`colWidths`、`colBorder`、`fontSize`、`fontColor`、`autoNumber`、`lineHeight`、`textIndent`、`arrow`、`arrowSize`、`arrowColor`、`arrowPos`、`arrowOpen`、`extraInfoSize`、`extraInfoColor`、`treeOpen`，以及：

- `cols`：儲存格陣列
- `children`：巢狀子列陣列，子列一律建成 ui-row-enhance。所在的列必須是 `enhance: true`。

**儲存格層級**

`content`（HTML 字串）或 `items`（輪播項目的 HTML 字串陣列），以及 `icon`、`fontColor`、`span`、`width`、`fixed`、`showNext`、`expandable`、`maskText`、`maskText2`、`maskInvert`、`maskColor`、`maskOrder`、`inverse`、`extraInfo`、`extraInfoSize`、`extraInfoColor`、`carouselInterval`（可為 `0`）、`progressBar`、`progressBarColor`、`progressBarColor1`、`progressBarColor2`、`arrow`、`arrowSize`、`arrowColor`、`arrowPos`、`arrowOpen`、`iconsList`（陣列或逗號分隔字串）、`iconsListInterval`、`toggle`、`toggleIcon`、`toggleIconOpen`、`toggleColor`、`hoverSource`、`hoverTarget`。

後來新增的對應鍵：列物件的 `canHide`（`true` 或欄位編號，需 `enhance: true`）、`canHideSize`、`canHideColor`、`minHeight`；儲存格物件的 `id`、`flashWidth`、`flashSpeed`、`flashLoops`、`itemNumber`（`true`、`'outline'`、`'fill'`、`'count'`）。

目前的限制：JSON 還不支援 `mask-gradient`；`showNext` 只會設成 `true`，無法指定 `row` 或 `col`。

---

## JavaScript API 與事件

```js
UiTable.init();                         // 重新掃描頁面，渲染後來才加入的 <ui-table>（已渲染的會略過）
UiTable.expandAll('#tree-pm');          // 全部展開
UiTable.expandAll('#tree-fin', 1);      // 只展開最上層；2 = 展開到第二層，以此類推
UiTable.collapseAll('#tree-pm');        // 全部收合
UiTable.expandAll();                    // 省略目標 = 頁面上所有表格
UiTable.showHidden('#tbl-1');           // 把 can-hide 隱藏的列全部顯示回來，回傳恢復的列數；省略目標 = 全部表格
UiTable.flash('w-mitigate', { flashWidth: 4, flashSpeed: 1200, flashLoops: 3 });  // 播放注意力動畫，回傳是否成功
UiTable.stopFlash('w-mitigate');        // 立即停止動畫
UiTable.config;                         // 目前的全域設定
UiTable.colors;                         // 色票對照表
```

`expandAll` 與 `collapseAll` 的目標可以是 CSS 選擇器字串、`<ui-table>` 元素，或省略。

**uit-tree-toggle 事件**

每次樹狀節點展開或收合，原本的 `<ui-table>` 元素會發出 `uit-tree-toggle`：

```js
document.getElementById('tree-menu').addEventListener('uit-tree-toggle', function (e) {
  var d = e.detail;
  // d.open    true 為展開，false 為收合
  // d.depth   層級，0 起算
  // d.source  'click'、'api' 或 'accordion'
  // d.row     原始的 <ui-row-enhance> 元素
  // d.rowEl   畫面上的列元素
});
```

載入時的初始展開（`tree-open`）不會發出事件。

**uit-toggle 與 uit-hover 事件**

```js
var t = document.querySelector('ui-table');
t.addEventListener('uit-toggle', function (e) {
  // e.detail.source  來源 id
  // e.detail.open    true 為展開，false 為收起
  // e.detail.cell    按下按鈕的格子
});
t.addEventListener('uit-hover', function (e) {
  // e.detail.source、e.detail.target、e.detail.cell
});
```

**uit-row-hide 事件**

`can-hide` 的整列隱藏動畫結束後，原本的 `<ui-table>` 元素會發出 `uit-row-hide`，`e.detail.rowEl` 是被隱藏的列，`e.detail.hasChildren` 表示是否連同子列一起隱藏。

後來才用 JavaScript 加入的 `<ui-table>`、`<ui-flash>`、`<ui-trans>`，呼叫一次 `UiTable.init()` 即可啟動。

---

## 全域設定 UiTableConfig

在載入 `ui-table.js` 之前定義，只需要寫要改的項目：

```html
<script>
  window.UiTableConfig = {
    theme: 'violet',
    cellPadding: '10px 14px',
    treeIndent: '24px'
  };
</script>
```

| 項目 | 預設值 | 說明 |
|---|---|---|
| `theme` | `'shell'` | 預設主題色。 |
| `cellPadding` | `'6px'` | 預設儲存格內距。 |
| `fontSize` | `'1rem'` | 預設字體大小。 |
| `autoRevealInterval` | `0` | 預設自動揭示間隔，0 為關閉。 |
| `cellAlignment` | `'left'` | 預設水平對齊。 |
| `verticalAlignment` | `'top'` | 預設垂直對齊。 |
| `hoverBgColor` | `''` | 預設滑過底色。 |
| `cellMinHeight` | `''` | 預設儲存格最小高度。 |
| `rowBorder` | `''` | 預設列外框。 |
| `arrowSize` | `'1.5rem'` | 欄間箭頭高度。 |
| `arrowColor` | `'focus'` | 欄間箭頭色彩。 |
| `arrowPos` | `'center'` | 欄間箭頭垂直位置。 |
| `extraInfoSize` | `''` | 握把高度，空字串為跟隨文字。 |
| `extraInfoColor` | `''` | 握把色彩，空字串為跟隨主題色。 |
| `treeCol` | `1` | 樹狀欄位置。 |
| `treeIndent` | `'20px'` | 每層縮排寬度。 |
| `treeIcon` | `'chevron'` | 展開鈕圖示。 |
| `treeLineColor` | `'#3A3B38'` | 導引線色彩。 |
| `iconsListInterval` | `500` | icons-list 的間隔毫秒數。 |
| `flashWidth` | `3` | 注意力動畫光帶粗細（px）。 |
| `flashSpeed` | `1600` | 注意力動畫繞一圈的毫秒數。 |
| `flashLoops` | `2` | 注意力動畫繞幾圈。 |
| `flashLength` | `0.22` | 光帶長度佔周長的比例。 |
| `transTheme` | `'blue'` | ui-trans 預設色彩。 |
| `transHintStyle` | `'dashed'` | ui-trans 預設標示樣式。 |
| `transDelay` | `60` | ui-trans 移入後多久顯示（毫秒）。 |
| `transWidth` | `''` | ui-trans 浮動框 寬度，空字串為自動。 |
| `transFontSize` | `''` | ui-trans 浮動框 字級，空字串為跟隨文字。 |

---

## 互斥規則

同一格同時設定下列組合時，後者會被忽略，並在主控台發出警告。

| 組合 | 被忽略的一方 |
|---|---|
| `mask-text` + `expandable` | `expandable` |
| `mask-text` + `carousel-interval` | `carousel-interval` |
| `mask-text` + `extra-info` | `extra-info` |
| `carousel-interval` + `extra-info` | `extra-info` |
| `mask-text`（任一側）+ `arrow` | `arrow` |
| `mask-text` + `icons-list` | `icons-list` |
| `carousel-interval` + `icons-list` | `icons-list` |
| `span` + `col-widths`、`col-border`（同一列） | `col-widths`、`col-border` |

---

## 主控台訊息

元件的警告與錯誤都以 `[ui-table]` 開頭，方便過濾。常見的有：

- `col-widths` 的比例數與欄數不符：這一列不會渲染。
- `mask-order` 重複或不連續。
- `extra-info` 找不到指定的 `id`。
- `carousel-interval="0"` 沒有搭配 `progress-bar`。
- 只設了 `progress-bar-color1` 或 `progress-bar-color2` 其中一個。
- 巢狀子列寫在不支援的位置。
- `icons-list` 寫在 `ui-row` 裡，或有找不到的 Bootstrap Icons 名稱。

單一表格初始化失敗時，只會影響那一張表，不影響頁面上的其他表格。
