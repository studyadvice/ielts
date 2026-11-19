# ui-dashboard

`<ui-dashboard>` 用屬性快速排出儀表板的欄與列，`<dash-cell>` 是格子，格子裡可以放純 HTML 或任何自製元件。只負責版面（CSS Grid），列高固定，整頁往下捲。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

- 版本：1.0.0
- 建立日期：11-19-26
- 更新日期：11-19-26

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-dashboard.js` | `<ui-dashboard>`、`<dash-cell>` | 儀表板版面與格子。 |
| `ui-dashboard-demo-11-19-26.html` | | 互動範例四則，含搭配 `tetris-quiz` 與 `link-when`。 |

## 目錄

- [快速開始](#快速開始)
- [版面字串式](#版面字串式)
- [欄列式](#欄列式)
- [屬性](#屬性)
- [格子內容與撐滿規則](#格子內容與撐滿規則)
- [搭配 link-when](#搭配-link-when)
- [窄螢幕堆疊](#窄螢幕堆疊)
- [版本紀錄](#版本紀錄)
- [授權](#授權)

## 快速開始

```html
<ui-dashboard areas="head head | nav main" col-widths="200 1fr" row-height="80 300">
  <dash-cell area="head" card>…</dash-cell>
  <dash-cell area="nav" card heading="選單">…</dash-cell>
  <dash-cell area="main" card><ui-table>…</ui-table></dash-cell>
</ui-dashboard>

<script src="https://cdn.jsdelivr.net/gh/studyadvice/ielts@main/dash/ui-dashboard.js"></script>
```

## 版面字串式

`areas` 像畫草圖：`|` 或換行分列，格內以空白分隔區域名稱，同名相鄰的格子合併成一個區域，`.` 代表空格。欄數與列數由字串決定，每一列的欄數必須相同。`dash-cell` 用 `area` 指定自己屬於哪個區域。

## 欄列式

沒有 `areas` 時用 `cols` 指定欄數（預設 12），格子依序自動排入。`span="3"` 占 3 欄，`span="3x2"` 占 3 欄 2 列；`col="2-4"` 是第 2 到第 4 欄（含），`row` 同理；`col="3"` 只指定起點。

## 屬性

| 元素 | 屬性 | 預設 | 說明 |
| --- | --- | --- | --- |
| `ui-dashboard` | `areas` | 無 | 版面字串。 |
| | `cols` | `12` | 欄數（欄列式）；有 `areas` 時忽略。 |
| | `col-widths` | 各欄等寬 | 欄寬清單，如 `200 1fr 280`；純數字視為 px，也可寫 `fr`、`rem`、`minmax(…)`。 |
| | `row-height` | `120` | 固定列高；多個值依序對應每一列，不足的沿用最後一個。想讓內容撐高可寫 `minmax(120px,auto)`（括號內不要有空白）。 |
| | `gap` | `16` | 格子間距，純數字視為 px。 |
| | `stack-below` | 不堆疊 | 視窗寬度（px）小於此值時改為單欄堆疊。 |
| `dash-cell` | `area` | 無 | 對應 `areas` 裡的區域名稱；找不到時在主控台提示。 |
| | `col`、`row` | 自動排入 | `3` 是起點，`2-4` 是第 2 到第 4 個（含）。 |
| | `span` | `1x1` | `3`（3 欄）或 `3x2`（3 欄 2 列）。 |
| | `card` | 無 | 卡片外框與 `rgb(36, 36, 36)` 底色，內距 16px。 |
| | `heading` | 無 | 格子上方的小標題。 |
| | `pad` | `card` 為 16 | 內距，如 `8 24`（上下 8px，左右 24px）；純數字視為 px。 |
| | `scroll` | 內容超出時捲動 | `none` 時裁切超出的內容。 |
| | `hidden` | 無 | 隱藏格子。 |
| | `reserve` | 無 | 搭配 `hidden`，隱藏時保留空位。 |

標題用 `heading` 而不是 `title`，避免瀏覽器在格子上顯示原生提示框。屬性改變時立即套用。

## 格子內容與撐滿規則

- 格子預設透明，沒有外框，內容怎麼寫就怎麼顯示。
- 格子內只有一個容器型子元素（`div`、`section`、`table`、`ul`、`pre`、`iframe`、`canvas`、`svg`、`video`，或任何標籤名含連字號的自製元件）時，該元素自動撐滿格子。`span`、`a` 等行內元素不會被撐開。
- 格子內有多個子元素時，依序由上往下排列，不做伸縮。
- 內容超出格子時，格子內出現捲軸。

## 搭配 link-when

`hidden` 的格子可以由 `<link-when>` 顯示。沒有 `reserve` 時，隱藏的格子不占位置；有 `areas` 時，其他格子位置固定，不會移動，只有自動排入的格子會遞補。

```html
<dash-cell area="tip" id="tip" card hidden reserve>…</dash-cell>
<link-when source="#quiz" event="done" target="#tip" do="show" enter="slide-up"></link-when>
```

## 窄螢幕堆疊

加上 `stack-below="768"`，視窗寬度小於 768px 時，所有格子改為單欄由上而下，每格最低高度為 `row-height` 的第一個值。沒有這個屬性就不堆疊。

## 版本紀錄

| 版本 | 內容 |
| --- | --- |
| 1.0.0 | 初版：版面字串式與欄列式、固定列高、`card`、`heading`、`hidden`/`reserve`、`stack-below`。 |

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
