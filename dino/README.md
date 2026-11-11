# dino-deck

`<dino-deck>` 是恐龍噴火字卡元件。點擊左側字卡，卡片沿弧線飛入文字區變成一隻描邊恐龍，恐龍噴火時例句從火焰處飛出，最後恐龍退場，例句往左補位。例句與額外資訊都支援 HTML，可以寫在屬性裡，也可以讀取 `<template>`。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

- 版本：1.0.0
- 建立日期：11-11-26

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `dino-deck.js` | `<dino-deck>`、`<dino-card>`、`<dino-stage>` | 字卡、顯示區與動畫流程。 |
| `dino-deck-demo-11-11-26.html` | | 互動範例，含四組主題、自訂邊框與錯誤提示。 |

## 目錄

- [快速開始](#快速開始)
- [動畫流程](#動畫流程)
- [dino-deck 屬性](#dino-deck-屬性)
- [dino-card 屬性](#dino-card-屬性)
- [主題](#主題)
- [JavaScript API](#javascript-api)
- [事件](#事件)
- [授權](#授權)

## 快速開始

```html
<dino-deck>
  <dino-card example-template="ex-across" extra-template="xi-across">across from my place</dino-card>
  <dino-card example="It's only <mark>a five-minute walk from</mark> the station.">a five-minute walk from ...</dino-card>
</dino-deck>

<template id="ex-across">The cafe <mark>across from my place</mark> is where I work remotely most often.</template>
<template id="xi-across"><b>across from</b>：在正對面，英式也常說 <b>opposite</b>。</template>

<script src="https://cdn.jsdelivr.net/gh/studyadvice/ielts@main/dino/dino-deck.js"></script>
```

寫在屬性裡的 HTML 要把 `<`、`>`、`"` 寫成 `&lt;`、`&gt;`、`&quot;`；內容較長時建議改用 `<template>`。

## 動畫流程

1. 字卡複製一份，沿弧線飛到顯示區左上方。
2. 卡片淡出，原地換成描邊恐龍。
3. 恐龍噴火，例句從火焰中段放大飛出，停在恐龍右側。
4. 恐龍淡出，空位收合，例句往左補位。

規則：

- 新的例句會取代上一句。
- 動畫進行中點擊其他字卡，目前的動畫立即中斷，改播新的字卡。
- 同一張字卡可以重複點擊重播。
- 有額外資訊時，例句後面會出現 ▾，點例句展開或收合。

## dino-deck 屬性

顏色可以寫色票名稱（`background`、`bg-alternative`、`shell`、`vanilla`、`yellow`、`pink`、`red`、`green`、`blue`、`indigo`、`violet`、`gray`、`key`、`calm`、`quiet`、`playful`、`urgent`、`energetic`、`dreamy`）或任何 CSS 顏色。純數字視為 px。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `theme` | `ember` | `ember`、`night`、`candy`、`shell`，見[主題](#主題)。 |
| `stage-bg`、`stage-color` | 依主題 | 顯示區底色與文字色。 |
| `stage-border` | 依主題 | 顯示區邊框，例如 `2 solid key`、`4 double gray`，`none` 為無邊框。 |
| `stage-radius` | `6` | 顯示區圓角。 |
| `stage-min-height` | `320` | 顯示區最小高度。 |
| `stage-padding` | `24` | 顯示區內距。 |
| `stage-font-size` | `1.6rem` | 例句字級。 |
| `card-bg` | 依主題 | 字卡底色。可以用逗號列出多色，依序輪替，例如 `vanilla,quiet`。 |
| `card-color` | 依主題 | 字卡文字色。 |
| `card-border` | 依主題 | 字卡邊框，寫法同 `stage-border`。 |
| `card-radius` | `0` | 字卡圓角。 |
| `card-width` | `220` | 字卡欄寬。 |
| `card-gap` | `0` | 字卡間距。 |
| `card-padding` | `10 12` | 字卡內距。 |
| `card-font-size` | `1.1rem` | 字卡字級。 |
| `card-lines` | `2` | 字卡最多顯示行數，超過以 `...` 截斷，滑鼠停留可看全文。 |
| `mark-color` | 依主題 | 例句中 `<mark>` 的文字色。 |
| `extra-color` | 依主題 | 額外資訊的文字色與分隔線色。 |
| `active-color` | 依主題 | 目前字卡的外框色。 |
| `dino-bg`、`dino-line` | 依主題 | 恐龍底框色與描邊色。 |
| `dino-height` | `72` | 恐龍高度。 |

屬性在執行期間修改會立即生效。

## dino-card 屬性

| 屬性 | 說明 |
| --- | --- |
| 內文 | 卡面文字，支援 HTML。 |
| `example` | 例句全文，支援 HTML。 |
| `example-template` | 例句的 `<template>` id，優先於 `example`。 |
| `extra-info` | 額外資訊，支援 HTML；沒有內容就不顯示。 |
| `extra-template` | 額外資訊的 `<template>` id，優先於 `extra-info`。 |
| `bg`、`color`、`border` | 覆蓋這張字卡的底色、文字色與邊框。 |

找不到 template 或沒有例句時，顯示區會出現提示框說明原因；頁面載入 Bootstrap JS 時提示框可以關閉。

## 主題

| 主題 | 顯示區 | 字卡 | 重點色 |
| --- | --- | --- | --- |
| `ember` | `#3B2A20` 底、`#DBEDD8` 字 | `#DBEDD8`、`#8EA4DE` 輪替 | mark `#E3D322` |
| `night` | `#0C0D0C` 底、`#51DBCF` 邊框 | `#51DBCF`、`#A3C4BC` 輪替 | mark `#B6FF00` |
| `candy` | `#0C0D0C` 底、`#FF91D7` 虛線邊框 | `#FF91D7`、`#DE8EC9`、`#B484E8` 輪替 | mark `#FFA987` |
| `shell` | `#C6C7BD` 底、`#0C0D0C` 字 | `#DBEDD8`、`#5DBAE8` 輪替 | 外框 `#FF2E63` |

任何一項都可以用屬性個別覆蓋：

```html
<dino-deck theme="night" stage-bg="bg-alternative" mark-color="pink" card-bg="yellow,green">...</dino-deck>
```

## JavaScript API

```js
const deck = document.querySelector('dino-deck');
deck.play(0);            // 播放第一張字卡，也可以傳入 <dino-card> 元素
deck.clear();            // 中斷動畫並清空顯示區
```

## 事件

| 事件 | `detail` | 時機 |
| --- | --- | --- |
| `dino:play` | `{ card }` | 開始播放一張字卡。 |
| `dino:sentence` | `{ card, sentence }` | 例句飛到定位。 |
| `dino:done` | `{ card, sentence }` | 恐龍退場，動畫結束。 |
| `dino:extra` | `{ open, card }` | 額外資訊展開或收合。 |

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
