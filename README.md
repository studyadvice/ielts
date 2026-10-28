# 語意標籤 UI 元件集（繁體中文）

一組零相依、以語意標籤撰寫的瀏覽器元件，專為深色底的教學頁面設計。每個元件都是單一 `.js` 檔，載入後自動注入 CSS，不需要打包工具、不依賴框架、也不使用 Shadow DOM。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-table.js` | `<ui-table>` `<ui-group>` `<ui-row>` `<ui-col>` | CSS Grid 表格，內建分組、遮罩、輪播、提示、欄間箭頭與逐步揭示。 |
| `bp-stepper.js` | `<bp-stepper>` `<bp-step>` | 步驟流程圖，支援水平、垂直、換行版型與逐步推進模式。 |
| `card-toggle.js` | `<card-toggle>` `<card-toggle-group>` | 可翻面的卡片，支援問答、選項分支、提示與題組導覽。 |
| `numeric-list.js` | `<ui-list>` `<list-item>` `<list-item-ad>` | 大數字編號清單，支援圖示、Grid、滑過效果、廣告列與浮動按鈕。 |

---

## 目錄

- [安裝](#安裝)
- [ui-table.js](#ui-tablejs)
- [bp-stepper.js](#bp-stepperjs)
- [card-toggle.js](#card-togglejs)
- [numeric-list.js](#numeric-listjs)
- [色盤對照](#色盤對照)
- [瀏覽器支援](#瀏覽器支援)
- [授權](#授權)

---

## 安裝

只載入需要的元件即可，各元件互不相依，可以同頁混用：

```html
<script src="ui-table.js"></script>
<script src="bp-stepper.js"></script>
<script src="card-toggle.js"></script>
<script src="numeric-list.js"></script>
```

Bootstrap Icons 為選用，但強烈建議載入。四個元件的圖示功能（`bi-*` 類別、按鈕圖示、`icon` 屬性）都依賴它：

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

## 色盤對照

四個元件共用同一組色名，填色盤名稱即可，不必記色碼。大部分顏色在各元件中完全相同：

| 名稱 | 色碼 | 名稱 | 色碼 |
| --- | --- | --- | --- |
| `shell` | `#C6C7BD` | `vanilla` | `#DBEDD8` |
| `lavender` | `#C3A5E5` | `yellow` | `#E3D322` |
| `special` | `#B3DE73` | `indigo` | `#7849C9` |
| `warning` | `#E6374B` | `pink` | `#FF91D7` |
| `salmon` | `#E5C3B3` | `orange` | `#EDA109` |
| `ocean` | `#1CCAE8` | `teal` | `#0DA591` |

以下四個顏色在不同元件中的色碼略有差異：

| 名稱 | ui-table | bp-stepper | card-toggle | numeric-list |
| --- | --- | --- | --- | --- |
| `sky` | `#82C8E5` | `#95C9DE` | `#82C8E5` | `#82C8E5` |
| `safe` | `#27AE60` | `#299459` | `#27AE60` | `#27AE60` |
| `focus` | `#D4FFFC` | `#3C7BCF` | `#D4FFFC` | `#D4FFFC` |
| `info` | `#2351DB` | `#2351DB` | `#4171BF` | `#2351DB` |

所有接受顏色的屬性也都可以直接填 CSS 顏色（`#hex`、`rgb(...)` 等）。

---

## 瀏覽器支援

支援現代常青瀏覽器。

- **ui-table.js**：需要 CSS Grid、`position: sticky` 與 `fetch`。箭頭定位會在可用時使用 `ResizeObserver` 與 `MutationObserver`，不支援時自動降級。
- **bp-stepper.js**：需要 Custom Elements。`progress-show` 模式的連接線隱藏需要 CSS `:has()`。
- **card-toggle.js**：需要 Custom Elements 與 CSS `color-mix()`。
- **numeric-list.js**：需要 CSS `color-mix()` 與 `:scope` 選擇器。

---

## 授權

MIT
