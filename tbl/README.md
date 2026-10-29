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

- [安裝](#安裝)
- [快速開始](#快速開始)
- [標籤結構](#標籤結構)
- [ui-table 屬性](#ui-table-屬性)
- [ui-group 屬性](#ui-group-屬性)
- [ui-row 與 ui-row-enhance 屬性](#ui-row-與-ui-row-enhance-屬性)
- [ui-col 屬性](#ui-col-屬性)
- [功能說明](#功能說明)
  - [欄寬、跨欄與框線](#欄寬跨欄與框線)
  - [文字色彩與 inverse](#文字色彩與-inverse)
  - [圖示與自動編號](#圖示與自動編號)
  - [群組](#群組)
  - [逐列揭示：show-next 與 auto-reveal](#逐列揭示show-next-與-auto-reveal)
  - [展開長文字：expandable](#展開長文字expandable)
  - [遮罩](#遮罩)
  - [補充資訊：extra-info](#補充資訊extra-info)
  - [輪播](#輪播)
  - [欄間箭頭](#欄間箭頭)
  - [固定欄](#固定欄)
  - [樹狀巢狀（僅 ui-row-enhance）](#樹狀巢狀僅-ui-row-enhance)
  - [icons-list 滑入動畫（僅 ui-row-enhance）](#icons-list-滑入動畫僅-ui-row-enhance)
- [JSON 資料模式](#json-資料模式)
- [JavaScript API 與事件](#javascript-api-與事件)
- [全域設定 UiTableConfig](#全域設定-uitableconfig)
- [色票](#色票)
- [互斥規則](#互斥規則)
- [主控台訊息](#主控台訊息)
- [瀏覽器支援](#瀏覽器支援)
- [更新紀錄](#更新紀錄)
- [授權](#授權)

---

## 安裝

把 `ui-table.js` 放進專案，並載入 Bootstrap Icons（`bi-` 開頭的圖示、圓圈編號、show-next 的箭頭會用到）。Bootstrap 本身不是必要的。

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<!-- 頁面內容 ... -->

<script src="ui-table.js"></script>
```

`ui-table.js` 放在 `<head>` 或 `</body>` 前都可以，它會等到 `DOMContentLoaded` 後才開始渲染。若要調整全域預設值，請在載入 `ui-table.js` 之前定義 `window.UiTableConfig`（見[全域設定](#全域設定-uitableconfig)）。

---

## 快速開始

```html
<ui-table theme="sky">
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
| `font-color` | 色彩 | 整張表的文字色，優先於 theme。框線與標題列仍用 theme。 |
| `cell-alignment` | `left`、`center`、`right` | 儲存格水平對齊。 |
| `vertical-alignment` | `top`、`middle`、`bottom` | 儲存格垂直對齊。 |
| `hover-bg-color` | 色彩 | 滑鼠移到儲存格上的底色。 |
| `cell-min-height` | CSS 長度 | 儲存格最小高度。 |
| `row-border` | 例如 `1px solid` | 每一列的預設外框，色彩自動使用 theme。 |
| `auto-reveal-interval` | 毫秒 | 有 `hidden` 的列依序每隔指定時間自動顯示。 |
| `extra-info-size` | 數字或 `px`、`rem`、`em` | extra-info 握把圖示的預設高度。 |
| `extra-info-color` | 色彩 | extra-info 握把圖示的預設色彩。 |
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
| `cell-padding` | CSS padding | 這一列儲存格的內距，預設 `6px`。 |
| `border` | 例如 `1px solid` | 這一列的外框，色彩自動使用 theme。 |
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
| `carousel-interval` | 輪播間隔毫秒數；`0` 為手動輪播。 |
| `progress-bar` | 顯示輪播進度條。 |
| `progress-bar-color` | 進度條單色。 |
| `progress-bar-color1`、`progress-bar-color2` | 進度條漸層的開始色與結束色。 |
| `arrow`、`arrow-size`、`arrow-color`、`arrow-pos`、`arrow-open` | 欄間箭頭，見[欄間箭頭](#欄間箭頭)。 |
| `icons-list`、`icons-list-interval` | 僅 ui-row-enhance：滑鼠移入時的圖示動畫。 |

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

- `border`、`col-border`、`row-border` 只寫粗細與樣式，色彩自動使用 theme。
- 相鄰兩列的框線會重疊成一條。
- 一般 `<ui-row>` 的欄數以第一個 `<ui-row>` 為準；`<ui-row-enhance>` 各自計算，適合欄數不同的列。

### 文字色彩與 inverse

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
<ui-table theme="lavender">
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

- 樣式優先順序：`mask-invert` > `mask-gradient` > `mask-color` > theme。
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

在內容後面加一個握把圖示，點擊後跳出 popover，內容取自指定 `id` 的元素。

```html
<ui-col extra-info="note-1" extra-info-size="1.25rem" extra-info-color="pink">make a decision</ui-col>

<div id="note-1" hidden>
  <p>make 偏向「產生、做出結果」。</p>
</div>
```

- 來源元素會自動隱藏；內容在點擊當下才讀取，之後修改來源也會顯示最新內容。
- popover 掛在 `<body>`，不會被儲存格裁切，會自動選擇上方或下方的空間。
- 點擊 popover 以外的地方或按 Esc 關閉。
- 握把的尺寸與色彩優先順序：`ui-col` > `ui-row` > `ui-table` > `UiTableConfig`。尺寸是圖示高度，寬度自動為 0.65 倍。

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
<ui-col carousel-interval="0" progress-bar progress-bar-color="sky">
  <cell-item>開場</cell-item>
  <cell-item>契機</cell-item>
  <cell-item>困難</cell-item>
  <cell-item>收尾</cell-item>
</ui-col>
```

- 進度條變成分段樣式：段數等於項目數，高度 7px，貼齊儲存格下緣，上方留較大的空白。
- 點擊進度條切換到下一個項目，最後一個再點會回到第一個。
- 沒有 `progress-bar` 時沒有切換入口，只會顯示第一個項目並發出警告。

**進度條色彩**

優先順序：`progress-bar-color1` 加 `progress-bar-color2` 的漸層 > `progress-bar-color` > theme（inverse 格子為深色）。只設 color1 或 color2 其中一個時當單色使用並發出警告。漸層橫跨整條進度條計算，不會因為倒數或分段而被壓縮或打斷。

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

### 樹狀巢狀（僅 ui-row-enhance）

把子列直接寫在父列裡面，父列就會出現展開鈕，點擊後子列由上往下滑順展開，層數不限。只有展開鈕會切換，不會觸發儲存格的其他點擊。

```html
<ui-table id="tree-pm" theme="sky" tree-line>
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

- 時序（n 個圖示、間隔 interval）：移入當下顯示第 1 個，之後每隔 interval 顯示下一個，最後一個出現後再隔 interval 恢復內容，總長 n × interval。
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
<ui-table theme="teal" data-id="demoData"></ui-table>

<ui-table theme="sky" src="data/table.json"></ui-table>
```

`theme` 寫在 `<ui-table>` 元素上，不在 JSON 裡。

**表格層級**

`fontSize`、`fontColor`、`autoRevealInterval`、`cellAlignment`、`verticalAlignment`、`hoverBgColor`、`cellMinHeight`、`rowBorder`、`extraInfoSize`、`extraInfoColor`、`treeCol`、`treeIndent`、`treeIcon`、`treeLine`、`treeLineColor`、`treeAccordion`、`treeOpen`，以及：

- `groups`：`[{ titleLeft, titleRight, iniCollapse, rows: [...] }]`
- `rows`：沒有 `groups` 時，可以直接寫列的陣列

**列層級**

`enhance`（`true` 時建成 ui-row-enhance）、`hidden`、`cellPadding`、`border`、`colWidths`、`colBorder`、`fontSize`、`fontColor`、`autoNumber`、`lineHeight`、`textIndent`、`arrow`、`arrowSize`、`arrowColor`、`arrowPos`、`arrowOpen`、`extraInfoSize`、`extraInfoColor`、`treeOpen`，以及：

- `cols`：儲存格陣列
- `children`：巢狀子列陣列，子列一律建成 ui-row-enhance。所在的列必須是 `enhance: true`。

**儲存格層級**

`content`（HTML 字串）或 `items`（輪播項目的 HTML 字串陣列），以及 `icon`、`fontColor`、`span`、`width`、`fixed`、`showNext`、`expandable`、`maskText`、`maskText2`、`maskInvert`、`maskColor`、`maskOrder`、`inverse`、`extraInfo`、`extraInfoSize`、`extraInfoColor`、`carouselInterval`（可為 `0`）、`progressBar`、`progressBarColor`、`progressBarColor1`、`progressBarColor2`、`arrow`、`arrowSize`、`arrowColor`、`arrowPos`、`arrowOpen`、`iconsList`（陣列或逗號分隔字串）、`iconsListInterval`。

目前的限制：JSON 還不支援 `mask-gradient`；`showNext` 只會設成 `true`，無法指定 `row` 或 `col`。

---

## JavaScript API 與事件

```js
UiTable.init();                         // 重新掃描頁面，渲染後來才加入的 <ui-table>（已渲染的會略過）
UiTable.expandAll('#tree-pm');          // 全部展開
UiTable.expandAll('#tree-fin', 1);      // 只展開最上層；2 = 展開到第二層，以此類推
UiTable.collapseAll('#tree-pm');        // 全部收合
UiTable.expandAll();                    // 省略目標 = 頁面上所有表格
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

---

## 全域設定 UiTableConfig

在載入 `ui-table.js` 之前定義，只需要寫要改的項目：

```html
<script>
  window.UiTableConfig = {
    theme: 'lavender',
    cellPadding: '10px 14px',
    treeIndent: '24px'
  };
</script>
<script src="ui-table.js"></script>
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
| `extraInfoColor` | `''` | 握把色彩，空字串為跟隨 theme。 |
| `treeCol` | `1` | 樹狀欄位置。 |
| `treeIndent` | `'20px'` | 每層縮排寬度。 |
| `treeIcon` | `'chevron'` | 展開鈕圖示。 |
| `treeLineColor` | `'#3A3B38'` | 導引線色彩。 |
| `iconsListInterval` | `500` | icons-list 的間隔毫秒數。 |

---

## 色票

所有色彩屬性都可以填下列名稱，也可以直接填 `#hex` 或 `rgb()`。元件的底色預設為 `#0C0D0C`。

| 名稱 | 色碼 | 名稱 | 色碼 |
|---|---|---|---|
| `shell` | `#C6C7BD` | `vanilla` | `#DBEDD8` |
| `lavender` | `#C3A5E5` | `yellow` | `#E3D322` |
| `special` | `#B3DE73` | `info` | `#2351DB` |
| `warning` | `#E6374B` | `indigo` | `#7849C9` |
| `salmon` | `#E5C3B3` | `pink` | `#FF91D7` |
| `sky` | `#82C8E5` | `focus` | `#D4FFFC` |
| `ocean` | `#1CCAE8` | `orange` | `#EDA109` |
| `safe` | `#27AE60` | `teal` | `#0DA591` |

元件產生的半透明色彩，不透明度一律不低於 0.78。

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

---

## 瀏覽器支援

需要支援 CSS Grid、`clip-path`、`mask-image` 與 `:scope` 選擇器的現代瀏覽器。樹狀展開的高度動畫使用 `grid-template-rows` 過渡，需要 Chrome／Edge 107 以上、Firefox 66 以上、Safari 16 以上；較舊的瀏覽器仍可正常展開，只是沒有動畫。不支援 Internet Explorer。

---

## 更新紀錄

### 10-29-26

**第 3 次增修：icons-list 滑入動畫**
- 新增 `icons-list`、`icons-list-interval`（僅 ui-row-enhance）。
- 新增 `UiTableConfig.iconsListInterval`。
- JSON 新增 `iconsList`、`iconsListInterval`。

**第 2 次增修：多層級巢狀結構**
- `ui-row-enhance` 可以巢狀，父列自動出現展開鈕，子列滑順展開。
- 新增 `tree-col`、`tree-indent`、`tree-icon`、`tree-line`、`tree-line-color`、`tree-accordion`、`tree-open`。
- 新增 `UiTable.expandAll()`、`UiTable.collapseAll()` 與 `uit-tree-toggle` 事件。
- JSON 新增 `children`，最外層可以直接寫 `rows`。

**第 1 次增修**
- `carousel-interval="0"` 搭配 `progress-bar` 為手動輪播，進度條改為可點擊的分段樣式。
- 新增 `progress-bar-color1`、`progress-bar-color2` 漸層進度條。
- 新增 `extra-info-size`、`extra-info-color`。
- 移除 `alert-msg`、`alert-color`、`alert-interval`、`alert-pos` 與 `UiTableConfig.alertDuration`。
- 修正 JSON 的 `carouselInterval: 0` 被當成未設定。

---

## 授權

尚未指定。發佈前請補上授權條款（例如 MIT）。
