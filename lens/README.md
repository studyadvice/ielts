# lens-read

`<lens-read>` 是點擊式放大鏡。主文保持乾淨，要標註的字只留一條提示底線；點一下，放大鏡出現在點擊處，鏡內放大文字，並在字的上方與下方顯示標註，鏡片旁另有說明框。為觸控筆與螢幕錄影設計，不需要滑鼠滑過。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

- 版本：0.3.0
- 建立日期：11-12-26

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `lens-read.js` | `<lens-read>`、`<lens-word>` | 放大鏡與標註字。 |
| `lens-read-demo-11-12-26.html` | | 互動範例，含三次修訂的範例與修改前後對照。 |

## 目錄

- [快速開始](#快速開始)
- [操作方式](#操作方式)
- [lens-word 屬性](#lens-word-屬性)
- [lens-read 屬性](#lens-read-屬性)
- [JavaScript API](#javascript-api)
- [事件](#事件)
- [版本紀錄](#版本紀錄)
- [授權](#授權)

## 快速開始

```html
<lens-read radius="110" zoom="1.5">
  <p>Many people believe that working from home
  <lens-word above="提高" below="<b>V</b> ＋ productivity"
             extra-info="<b>boost</b> 比 increase 更口語。">boosts</lens-word> productivity.</p>
</lens-read>

<script src="https://cdn.jsdelivr.net/gh/studyadvice/ielts@main/lens/lens-read.js"></script>
```

## 操作方式

| 動作 | 一般模式 | 固定模式（`pin`） |
| --- | --- | --- |
| 點擊文字 | 在點擊處開鏡；已開鏡時滑到新位置 | 未開鏡時開鏡；已開鏡時不動 |
| 拖曳鏡面 | 移動放大鏡 | 不動 |
| 點一下鏡面 | 關閉（`close-on-tap="off"` 時不關閉） | 不動 |
| Esc | 關閉 | 不動 |
| 右上角 × | 關閉 | 關閉 |

`trigger="hover"` 時，滑鼠移入開鏡、移出關閉；觸控筆仍是點擊操作。設定 `pin` 時 hover 不作用。

## lens-word 屬性

| 屬性 | 說明 |
| --- | --- |
| 內文 | 要標註的字詞，可含 HTML。 |
| `above` | 字上方的標註，支援 HTML。舊屬性 `zh` 等同此屬性。 |
| `below` | 字下方的標註，支援 HTML。舊屬性 `note` 等同此屬性。 |
| `extra-info` | 鏡片旁說明框的內容，支援 HTML。鏡心最靠近哪個字，就顯示哪個字的說明。 |
| `above-template`、`below-template`、`extra-template` | 讀取對應 id 的 `<template>`，優先於同名屬性；找不到時在主控台提示並改用屬性。 |

三種標註都可以只寫其中幾個。

## lens-read 屬性

顏色可以寫色票名稱（`background`、`bg-alternative`、`shell`、`vanilla`、`yellow`、`pink`、`red`、`green`、`blue`、`indigo`、`violet`、`gray`、`key`、`calm`、`quiet`、`playful`、`urgent`、`energetic`、`dreamy`）或任何 CSS 顏色。純數字視為 px。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `pin` | 無 | 開鏡後固定位置，只有 × 能關閉，此時 × 一律顯示。`pin="off"` 等同未設定。 |
| `trigger` | `click` | `click` 或 `hover`。 |
| `radius` | `100` | 鏡片半徑，最小 30。 |
| `zoom` | `1.4` | 鏡內放大倍率，1 到 4。 |
| `show` | 全部 | 要顯示的標註，空白分隔：`above`、`below`、`extra`。舊值 `zh`、`note`、`both` 仍可用。 |
| `lens-bg` | `bg-alternative` | 鏡片底色。 |
| `lens-text` | `vanilla` | 鏡內一般文字顏色。 |
| `lens-border` | `3 solid key` | 鏡框，例如 `3 dashed pink`；`none` 為無鏡框。關閉鈕跟著鏡框顏色。 |
| `word-color` | `yellow` | 鏡內標註字的顏色。 |
| `above-color` | `pink` | 字上方標註的顏色（舊名 `zh-color`）。 |
| `below-color` | `key` | 字下方標註的顏色（舊名 `note-color`）。 |
| `extra-position` | `below` | 說明框在鏡片下方或上方：`below`、`above`。 |
| `extra-bg`、`extra-text` | `background`、`vanilla` | 說明框底色與文字色。 |
| `extra-border` | 同鏡框顏色 | 說明框邊框；`none` 為無邊框。 |
| `extra-width` | `320` | 說明框最大寬度，最小 160。 |
| `text-color` | `shell` | 主文顏色。 |
| `page-bg` | `background` | 關閉鈕底色，配合網頁底色。 |
| `line-gap` | `2.6` | 行高倍數，為上下兩行標註留空間；只顯示一種標註時可降到 2.2。 |
| `cue` | `dotted` | 主文中標註字的提示底線：`dotted`、`dashed`、`solid`、`wavy`、`none`。 |
| `cue-color` | `gray` | 提示底線顏色。 |
| `close-on-tap` | `on` | 一般模式下，點一下鏡面是否關閉。 |
| `close-button` | `on` | `off` 隱藏 ×（固定模式下仍會顯示）。 |

## JavaScript API

```js
const lens = document.querySelector('lens-read');
lens.open(200, 40);   // 在元件左上角往右 200px、往下 40px 處開鏡
lens.close();
```

## 事件

| 事件 | `detail` | 時機 |
| --- | --- | --- |
| `lens-read:open` | `{ x, y }` | 開鏡。 |
| `lens-read:move` | `{ x, y }` | 放大鏡移到新位置或拖曳結束。 |
| `lens-read:close` | `{ x, y }` | 關閉。 |

## 版本紀錄

- 0.3.0（11-12-26）：新增 `pin`，開鏡後固定位置，只有 × 能關閉。
- 0.2.0（11-12-26）：標註改為 `above`、`below`、`extra-info`，支援 HTML 與 template；新增說明框。
- 0.1.0（11-12-26）：點擊放大鏡初版。

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
