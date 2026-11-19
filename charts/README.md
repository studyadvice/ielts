# ui-chart

`<ui-chart>` 是靜態圖表：直式長條（`column`）、橫條（`bar`）、折線（`line`）、圓餅（`pie`、`donut`）、百分比堆疊橫條（`stack`）。純 SVG，只負責呈現資料，沒有提示、點擊與縮放。放進 [`ui-dashboard`](../dash/README.md) 的單一格子會自動撐滿，並依格子大小重畫，字級用 rem，不會被縮放變形。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

- 版本：1.1.0
- 建立日期：11-20-26
- 更新日期：11-20-26

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-charts.js` | `<ui-chart>`、`<chart-row>` | 靜態圖表：長條、橫條、折線、圓餅、堆疊橫條。 |
| `ui-charts-demo-11-20-26.html` | | 互動範例四則（百分比堆疊橫條與 `theme`、點 `ui-stream` 徽章產生圖表、在 `md-editor` 寫資料、四種圖放進儀表板）與屬性總表。 |

## 目錄

- [快速開始](#快速開始)
- [資料來源](#資料來源)
- [屬性](#屬性)
- [事件與方法](#事件與方法)
- [堆疊橫條](#堆疊橫條)
- [放進儀表板格子](#放進儀表板格子)
- [由其他元件產生圖表](#由其他元件產生圖表)
- [授權](#授權)

## 快速開始

```html
<ui-chart type="column" title="Visitors (thousands)" series="Local,Overseas" show-values>
  <chart-row label="2020" values="48,21"></chart-row>
  <chart-row label="2021" values="51,44"></chart-row>
  <chart-row label="2022" values="53,61"></chart-row>
</ui-chart>

<script src="charts/ui-charts.js"></script>
```

## 資料來源

| 寫法 | 說明 |
| --- | --- |
| `<chart-row label values>` | 每列一個標籤與數值；`values="30,45"` 對應多個系列（逗號或直線分隔），單一系列可寫 `value`。空白或非數字視為缺值，折線會斷開。圓餅只取第一個數值，每列可用 `color` 指定顏色。改動子標籤會自動重畫。 |
| `series` 屬性 | 系列名稱，逗號分隔。 |
| `src`、`data-id` | JSON 網址、`window` 上的物件名稱。 |
| `el.setData(obj)` | 用程式設定資料；設定後不再讀子標籤。 |

JSON 格式：`{ "type": "line", "series": ["A","B"], "rows": [{ "label": "2010", "values": [1,2] }] }`，或直接是 `rows` 陣列。物件裡的 `type`、`title`、`unit` 等選項（駝峰寫法）只在屬性沒寫時採用。

## 屬性

顏色可寫色票名稱或任何 CSS 顏色。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `type` | `column` | `column`、`bar`、`line`、`pie`、`donut`、`stack`。 |
| `title`、`title-align` | 無、`center` | 標題與對齊（`center`、`left`）。 |
| `series` | 無 | 系列名稱。 |
| `unit`、`prefix`、`decimals` | 無、無、自動 | 數值後綴、前綴、小數位數。 |
| `y-min`、`y-max`、`y-step`、`ticks` | 自動、自動、自動、`5` | 數值軸範圍與刻度間距；長條與折線預設包含 0。橫條圖的數值軸在下方，仍用這幾個屬性。 |
| `grid` | `true` | 是否畫格線。 |
| `show-values` | `false` | 在長條、折線的點上、圓餅的標籤中顯示數值。 |
| `show-percent`、`hole`、`start-angle`、`center`、`sort` | `true`、`0`（`donut` 為 `0.55`）、`0`、無、`false` | 圓餅專用：標籤顯示百分比、中空比例（0 到 0.9）、起始角度（0 在正上方，順時針）、中空處文字、依大小排序。空間不夠放外側標籤時，自動改用圖例。 |
| `legend` | 多系列 `bottom`，否則 `none` | `top`、`bottom`、`right`、`none`；`stack` 預設 `header`，系列名稱放在第一條上方，第一條有一段太窄時自動改用下方圖例。 |
| `vary`、`bar-gap` | `false`、`0.3` | 單一系列的長條每根用不同顏色（並顯示圖例）；長條組之間的空隙比例。 |
| `markers`、`line-width` | `true`、`2.5` | 折線的資料點與線寬。 |
| `x-title`、`y-title`、`label-rotate` | 無、無、`auto` | 水平軸與垂直軸標題（橫條圖的 `x-title` 在下方的數值軸）；類別標籤太擠時自動斜放，也可寫角度。 |
| `theme`、`ramp` | 無、`auto` | 主色（色票名稱或 CSS 顏色），其餘系列色由元件以同色相漸層算出，任意系列數都適用；第一個系列是主色，後面漸淡。主色太淺會自動改為漸深，`ramp` 可選 `light`、`dark` 強制。`colors` 有寫時優先。也適用 column、bar、line、pie。 |
| `normalize` | `true` | 只用於 `stack`：每列換算成 100%；`false` 時依各列總和相對最大列。 |
| `colors` | 內建依序色 | 系列或扇形的顏色，逗號分隔；預設依序為 key、playful、violet、green、yellow、pink、blue、red、indigo、salmon、calm、dreamy。 |
| `text-color`、`title-color`、`grid-color`、`axis-color` | `shell`、`vanilla`、`bg-alternative`、`gray` | 文字、標題、格線、軸線。 |
| `bg` | 自動 | 只用在扇形之間的分隔線，預設往上找第一個不透明的背景色。 |
| `font-size`、`height` | `1`（rem 倍率）、`320px` | 基礎字級倍率；單獨使用時的高度（放進撐滿的格子會依格子縮放）。 |
| `label-empty` | `No data` | 沒有資料時顯示的文字。 |

線與格線都用實色，沒有使用透明度。

## 事件與方法

| 名稱 | 說明 |
| --- | --- |
| `ui-chart:render` | 每次畫完觸發（會冒泡），`detail = { type, width, height }`。 |
| `el.setData(obj)`、`el.getData()` | 設定或讀取資料。 |
| `el.render()` | 手動重畫。 |

## 堆疊橫條

```html
<ui-chart type="stack" theme="#2F6F66" series="Committed,Casual,Either">
  <chart-row label="Men" values="24,27,49"></chart-row>
  <chart-row label="Women" values="45,18,37"></chart-row>
</ui-chart>
```

數字放在段內，文字顏色依底色自動選深或淺。二個、三個、四個以上系列都由 `theme` 算出漸層色。

## 放進儀表板格子

格子裡只有一個 `<ui-chart>` 時，`ui-dashboard` 會讓它撐滿格子，改變視窗大小時圖會跟著重畫：

```html
<ui-dashboard areas="a b" col-widths="1fr 1fr" row-height="340">
  <dash-cell area="a" card><ui-chart type="column" …>…</ui-chart></dash-cell>
  <dash-cell area="b" card><ui-chart type="donut" …>…</ui-chart></dash-cell>
</ui-dashboard>
```

## 由其他元件產生圖表

**點 `ui-stream` 訊息的徽章。** `stream-item` 加 `badge-click` 與 `data-chart`（指向 template 或元素的選擇器），點徽章發出 `ui-stream:badge`，用 `link-when` 的 `do="feed"` 把它指向的內容複製進目標容器。後點的取代先前的；`feed-mode="append"` 則疊加。

```html
<stream-item from="teacher" badge="看圖 1" badge-click data-chart="#tpl-a">先看海外遊客。</stream-item>
<template id="tpl-a"><ui-chart type="column" …>…</ui-chart></template>
<div id="slot"></div>

<link-when source="#st" event="ui-stream:badge" target="#slot" do="feed"></link-when>
```

**點 `mini-table` 儲存格裡的徽章。** 在儲存格寫 `<mt-badge chart="#tpl">` 指向 template，或 `<mt-badge chart-from="row">` 由表格數字自動組圖；表格加 `chart-target="#slot"`，點徽章就在目標區域畫圖，不需要 `link-when`。細節見 [`mini-table` 的徽章章節](../mini/README.md#可點擊徽章與圖表)。

**在 `md-editor` 寫資料。** 標記為 `chart` 的程式碼區塊，設定列加資料列，預覽與送出都變成 `<ui-chart>`；`md-submit` 的 `detail.charts` 帶解析好的資料。用 `link-when` 搭配 `template`（內容寫 `{html}`）就能把圖表放進指定格子。

````
```chart
type: bar
title: Weekly study hours
unit: h
Korea: 14
Japan: 11
```
````

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
