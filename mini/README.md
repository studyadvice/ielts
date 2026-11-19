# mini-table

`<mini-table>` 是輕量表格：一行一列，用 `|` 分欄，專心輸入內容就能排出整齊的表。適合放進 `ui-cards` 的卡片當資料卡片，也可以單獨使用。本身只做列與欄；搭配 `ui-plus.js` 的 `<ui-btn>`，可以用 Excel 座標揭曉指定儲存格。在儲存格裡放 `<mt-badge>` 可點擊徽章，點下去就能用 `charts/ui-charts.js` 在目標區域畫圖。需要遮罩、輪播等完整互動請用 `tbl/ui-table.js`。元件不使用 Shadow DOM。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `mini-table.js` | `<mini-table>`、`<mt-badge>` | 用 `\|` 分欄的輕量表格，內建十種預排外觀，儲存格可放可點擊徽章產生圖表。 |
| `mini-table-demo-11-20-26.html` | | 合併範例（越新越上面）：徽章與圖表四則、儲存格揭曉、基本用法與預排外觀。 |

## 目錄

- [快速開始](#快速開始)
- [屬性](#屬性)
- [預排外觀 pre-theme](#預排外觀-pre-theme)
- [屬性解說](#屬性解說)
- [範例](#範例)
- [揭曉儲存格（搭配 ui-btn）](#揭曉儲存格搭配-ui-btn)
- [可點擊徽章與圖表](#可點擊徽章與圖表)
- [JavaScript API](#javascript-api)
- [授權](#授權)

## 快速開始

```html
<mini-table head="Account | Region | Seats" align="l, l, r">
  Northwind | EMEA | 1,200
  Globex    | EMEA | 860
</mini-table>
```

## 屬性

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `head` | `\|` 分欄文字 | 無 | 表頭。省略就沒有表頭。 |
| `head-source` | 元素 id | 無 | 表頭改從 `<template>` 或元素讀取，內容是一行 `\|` 分欄文字。優先於 `head`。 |
| `source` | 元素 id | 無 | 內容改從 `<template>` 或元素讀取，一行一列。優先於標籤內的文字。 |
| `align` | 逗號分隔的 `l`、`c`、`r` | 自動 | 逐欄對齊，例如 `l, l, r`。也接受 `left`、`center`、`right`。沒寫到的欄位：整欄都是數字就靠右，其他靠左。 |
| `col-widths` | 比例 | 自動 | 欄寬比例，例如 `2:1:1`。數字個數要等於欄數。 |
| `pre-theme` | 見下表 | `clean` | 預排外觀。 |
| `head-style` | `filled` | 無 | 表頭改成強調色的實心色帶，可以和任何 `pre-theme` 搭配，例如 `compact` 加實心表頭。 |
| `row-style` | `lines`、`dashed`、`striped`、`none` | 依外觀 | 列與列之間改成細線、虛線、交錯底色或無線，蓋過外觀本身的設定。 |
| `first-col` | `filled`、`accent`、`bold` | 無 | 第一欄改成實心色帶、強調色粗體或白色粗體，讓第一欄變成項目欄。 |
| `mark-color` | 色名或色碼 | 同 `color` | 強調列（列首寫 `!`）的顏色。 |
| `color` | 色名或色碼 | 依外觀 | 強調色，用 18 色的色名。 |
| `font-size` | CSS 長度 | `1rem` | 字級。 |
| `chart-target` | 選擇器或 id | 無 | 徽章產生的圖表要放的目標區域。沒寫就不會自己放圖，只發出事件。 |
| `chart-mode` | `replace`、`append` | `replace` | 後點的徽章取代先前的圖，或疊加在後面。 |

## 預排外觀 pre-theme

| 名稱 | 樣子 | 預設強調色 | 適合 |
| --- | --- | --- | --- |
| `clean` | 灰色表頭，列與列之間一條細線，左右不留白 | `gray` | 資料卡片，就像 Top accounts 那種卡片 |
| `ledger` | 表頭粗體加強調色底線，內容列交錯底色 | `blue` | 列數多、需要對行的清單 |
| `grid` | 每一格都有框線，框線是強調色調暗 | `shell` | 對照表、需要清楚分格的內容 |
| `banner` | 表頭是實心色帶 | `bg-alternative` | 一張卡片裡要凸顯欄位名稱 |
| `compact` | 小字、緊湊、虛線分隔 | `gray` | 塞進小卡片的補充資料 |
| `bare` | 沒有任何線，表頭用強調色 | `key` | 簡短的兩三列資料 |
| `score` | 第一欄強調色粗體，數字欄放大 | `key` | 排名、分數、KPI |
| `tiles` | 每一列是一塊圓角色塊，列與列之間留空隙 | `gray` | 待辦、作業、狀態清單 |
| `frame` | 強調色圓角外框，表頭下方一條強調色線 | `key` | 想讓整張表自成一塊的重點資料 |
| `side` | 第一欄是實心色帶 | `indigo` | 「項目｜說明」的對照表，可以不寫表頭 |

`banner`、`side` 與 `head-style="filled"` 用 `bg-alternative` 當色帶時自動配白字，其他顏色配深色字。

## 屬性解說

- **分欄：** 每一行用 `|` 分欄，前後空白會自動去掉。行首行尾多寫的 `|`（Markdown 表格寫法）也可以。空行會略過。
- **格子裡要放 `|`：** 寫成 `\|`。
- **強調某一列：** 列首寫 `!`，例如 `! Globex | EMEA | 860`。這一列會變成強調色淡底，左側一條強調色線，顏色用 `mark-color` 換。內容本身要以驚嘆號開頭時寫成 `\!`。
- **自由組合：** `pre-theme` 決定基本外觀，`head-style`、`row-style`、`first-col` 分別調整表頭、列分隔與第一欄，可以任意搭配。
- **欄數不一致：** 以最多欄的那一列為準，不足的補空白格，主控台會提醒。
- **格子內容：** 可以寫 HTML，例如 `<b>`、`<c-key>` 等色名標籤。
- **數字判斷：** 整欄（忽略空白格）都是數字時視為數字欄，自動靠右並使用等寬數字。可以有千分位逗號、小數點、百分比，以及 `k`、`M`、`萬` 這類單位。
- **放進 ui-cards：** 寫在 `<card-item>` 裡即可，兩支檔案的載入順序不拘。搭配 `ui-cards` 的 `media-position="inline"` 與 `meta`，就是一張資料卡片。
- **讀取時機：** 屬性與內容只在第一次載入時讀取；之後修改屬性，呼叫 `render()` 重畫。

## 範例

**資料卡片**

```html
<ui-cards cols="3">
  <card-item icon="snow" label="Top accounts" meta="Snowflake" media-position="inline" badge="新">
    <mini-table head="Account | Region | Seats" align="l, l, r">
      Northwind | EMEA | 1,200
      Globex    | EMEA | 860
    </mini-table>
  </card-item>
</ui-cards>
```

**表頭與內容放在 template**

```html
<mini-table pre-theme="score" head-source="mock-head" source="mock-rows"></mini-table>

<template id="mock-head">Name | Fluency | Lexical</template>
<template id="mock-rows">
  Amy | 7 | 6.5
  Ben | 6 | 6
</template>
```

**任何外觀加實心表頭**

```html
<mini-table pre-theme="compact" head-style="filled" color="indigo" head="語塊 | 次數">
  a stone's throw from | 12
  rain or shine | 7
</mini-table>
```

**列分隔、第一欄與強調列**

```html
<mini-table pre-theme="clean" row-style="striped" first-col="accent" color="key" mark-color="urgent"
            head="Name | Fluency | Lexical">
  Amy  | 7 | 6.5
  ! Ben | 5.5 | 5
  Cleo | 6.5 | 7
</mini-table>
```

**實心表頭、欄寬與色名標籤**

```html
<mini-table pre-theme="banner" color="indigo" head="語塊 | 次數" col-widths="3:1">
  <c-key>a stone's throw from</c-key> | 12
  rain or shine | 7
</mini-table>
```

## 揭曉儲存格（搭配 ui-btn）

載入 `ui-plus.js` 後，`<ui-btn>` 可以用 Excel 座標指定某一格，點擊後顯示內容，再按一次恢復原狀。兩支檔案的載入順序不拘。

```html
<mini-table id="mytbl" head="Clue | Answer | Chunk">
  A place for coffee | ？ | ？
  A place for books  | ？ | ？
</mini-table>

<ui-btn mini-table-id="mytbl" target-cell="B2" target-cell-content="<b>Cafe</b>">顯示答案</ui-btn>
<ui-btn mini-table-id="mytbl" target-cell="C2" target-cell-source="chunk-c2">顯示語塊</ui-btn>
<ui-btn mini-table-id="mytbl" target-cell="B3 C3" stagger="400"
        target-cell-content="<b>Library</b> | a quiet corner to lose myself in">第 3 列</ui-btn>

<template id="chunk-c2">grab a <c-yellow>quick flat white</c-yellow></template>
```

**座標規則**

- 欄用字母（A、B…Z、AA）、列用數字，都從 1 起算，和 Excel 相同，大小寫皆可。
- **有表頭時，表頭就是第 1 列**，所以上例的 B2 是第一筆資料的第二欄。沒有表頭時，第一筆資料就是第 1 列。
- 多格用逗號或空白分隔，範圍寫成 `C2:C4`；從 Excel 複製的 `$B$2` 也可以。
- 不存在的格子會在主控台警告，並說明表格的欄數與列數。

ui-btn 各屬性的完整說明見根目錄 README 的 ui-plus.js 章節。

## 可點擊徽章與圖表

在儲存格裡寫 `<mt-badge>`，點擊後在目標區域顯示 `<ui-chart>`。需要另外載入 `charts/ui-charts.js`，載入順序不拘；不需要 `link-when.js`。徽章樣式沿用 `ui-stream` 的圓角膠囊，點下去的那一顆會加一圈外框。

```html
<mini-table chart-target="#slot" head="Name | Fluency | Lexical | 圖表" align="l, r, r, c">
  Amy | 7 | 6.5 | <mt-badge chart="#tpl-amy">Amy 的圖</mt-badge>
  Ben | 5.5 | 5 | <mt-badge chart-from="row" chart-type="bar" chart-y-max="9">這一列</mt-badge>
</mini-table>
<div id="slot">點徽章，圖表會出現在這裡</div>

<template id="tpl-amy">
  <ui-chart type="donut" title="Amy" show-values>
    <chart-row label="Fluency" value="7"></chart-row>
    <chart-row label="Lexical" value="6.5"></chart-row>
  </ui-chart>
</template>
```

**徽章屬性**

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `chart` | 選擇器或 id | 無 | 指向 `<template>` 或元素，點擊時複製進目標區域。優先於 `chart-from`。 |
| `chart-from` | `row`、`col`、`table` | 無 | 由表格的數字自動組出圖表。`row` 畫徽章所在的列，欄名當標籤，該列第一個文字格當標題；`col` 畫 `chart-col` 指定的整欄，第一欄文字當標籤；`table` 畫整張表所有數字欄，每欄一個系列。 |
| `chart-col` | 欄字母 | 無 | `chart-from="col"` 時指定欄，例如 `B`。 |
| `chart-*` | 同 `<ui-chart>` 屬性 | `chart-type` 預設 `column` | 其餘 `chart-` 開頭的屬性去掉 `chart-` 後原樣給 `<ui-chart>`，例如 `chart-type`、`chart-title`、`chart-unit`、`chart-theme`、`chart-y-max`、`chart-show-values`、`chart-height`。只對 `chart-from` 有效。 |
| `target` | 選擇器或 id | 同表格的 `chart-target` | 只給這顆徽章用的目標區域。 |
| `color` | 色名或色碼 | `key` | 徽章顏色。 |

**行為**

- **取代或疊加：** 預設後點的取代先前的圖；表格加 `chart-mode="append"` 則一張一張疊加。
- **再點同一顆徽章：** 收起它產生的那張圖；目標區域沒有圖時，恢復原本的內容（例如「點徽章看圖表」）。
- **目標被隱藏：** 目標有 `hidden` 或 `display:none` 時會先顯示。
- **數字判斷：** 與表格的數字欄相同，可有千分位、小數點、百分比與貨幣符號；`k`、`M`、`萬` 這類單位會被忽略，需要時用 `chart-unit` 另外標示。沒有數字的格子略過，一個數字都找不到時在主控台警告。
- **徽章與數字欄：** 徽章所在的欄不是數字欄，不會自動靠右，也不會被 `chart-from="table"` 納入；建議徽章獨立一欄。表頭格也能放徽章，常用來放 `col` 和 `table` 的徽章。
- **重畫：** `render()` 重畫後徽章的選中外框會消失，目標區域的圖不受影響。

**事件：不寫 chart-target，交給 link-when**

每次點擊都發出會冒泡的 `mini-table:badge`：

```js
e.detail = { ref, row, col, badge, cell, data, html, target, active }
// ref：徽章所在儲存格座標，例如 'D2'；row、col 從 1 起算，表頭算第 1 列
// data：徽章 chart 屬性的選擇器，沒有就是 ''
// html：要顯示的圖表內容；target：放進的目標元素，沒有 chart-target 則為 null
// active：這次點擊是否顯示了圖（再點收起時為 false）
```

沒寫 `chart-target` 時 mini-table 不會自己放圖，可用 `link-when` 接起來，需要動畫或排隊時很方便：

```html
<!-- chart="…" 的徽章：detail.data 是選擇器，和 ui-stream 的徽章相同 -->
<link-when source="#tbl" event="mini-table:badge" target="#slot" do="feed"></link-when>

<!-- chart-from 的徽章：detail.html 是組好的圖表，用 template 的 {html} 放進去 -->
<link-when source="#tbl" event="mini-table:badge" target="#slot" do="feed" template="#tpl-html"></link-when>
<template id="tpl-html">{html}</template>
```

同時寫了 `chart-target` 又接 `link-when` 時，兩邊各放一次，請擇一。

## JavaScript API

```js
const t = document.querySelector('mini-table');
t.setAttribute('pre-theme', 'ledger');
t.render();              // 依目前屬性重畫，內容沿用第一次載入時的文字
MiniTable.themes;        // ['clean', 'ledger', 'grid', 'banner', 'compact', 'bare', 'score', 'tiles', 'frame', 'side']

// 儲存格（座標同 Excel，表頭算第 1 列）
t.cellAt('B2');               // 取得儲存格元素（th 或 td），超出範圍回傳 null
t.resolveCells('A2:B3');      // ['A2', 'B2', 'A3', 'B3']
t.setCell('B3', '<b>7.5</b>'); // 寫入並記住，render() 重畫後仍保留
t.resetCell('B3');            // 恢復原始內容
t.size();                     // { cols, rows }，表頭也算一列
MiniTable.parseRef('$AA$12'); // { col: 27, row: 12 }
MiniTable.refName(27, 12);    // 'AA12'
```

## 授權

本專案以 MIT 授權釋出。

```
MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
