# ui-drag-ans

`<ui-drag-ans>` 是拖曳填空元件。題目中的空格用 `{答案}` 標記，元件自動產生對應的小卡。把小卡拖到正確的空格，或先點小卡再點空格，空格就換成格式化的答案，用掉的小卡消失；放錯會彈回原位。比對區分大小寫。滑鼠、觸控、觸控筆都能操作。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

- 版本：1.1.0（放對時小卡逐漸縮小）
- 建立日期：11-12-26

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-drag-ans.js` | `<ui-drag-ans>`、`<drop-slot>`、`<drag-card>` | 拖曳填空。 |
| `ui-drag-ans-demo-11-12-26.html` | | 互動範例：三種小卡位置、主題覆蓋、與 ui-cards 協作。 |

## 目錄

- [快速開始](#快速開始)
- [作答方式](#作答方式)
- [標記空格](#標記空格)
- [屬性](#屬性)
- [主題](#主題)
- [事件與方法](#事件與方法)
- [與 ui-cards 協作](#與-ui-cards-協作)
- [授權](#授權)

## 快速開始

```html
<ui-drag-ans>
  <p>The bus shelter right outside my house is {equipped with} a real-time display.</p>
  <p>The bus stop {in view of} my house has a modern shelter.</p>
  <drag-card>popular with</drag-card>
</ui-drag-ans>

<script src="https://cdn.jsdelivr.net/gh/studyadvice/ielts@main/drag/ui-drag-ans.js"></script>
```

## 作答方式

- 拖曳小卡到空格，經過的空格會亮起。放對時小卡移到空格中央逐漸縮小，接著空格換成答案；放錯時小卡彈回原位，空格搖一下。
- 也可以先點一下小卡（出現外框），再點空格。適合觸控筆與錄影。
- 比對區分大小寫，前後空白與連續空白會被忽略。
- 全部空格完成後，剩下的干擾卡淡出，出現完成提示與「重做」按鈕。

## 標記空格

| 寫法 | 說明 |
| --- | --- |
| `{答案}` | 寫在題目文字中，產生空格與一張小卡，答對後以主題設定的格式顯示答案。 |
| `<drop-slot answer="答案">HTML</drop-slot>` | 標籤裡的 HTML 就是答對後顯示的內容，例如 `<drop-slot answer="go jogging">go <b>jogging</b></drop-slot>`。 |
| `<drag-card>文字</drag-card>` | 干擾卡，不屬於任何空格。內文可含 HTML，比對值為文字內容，也可用 `value` 指定。 |
| `\{`、`\}` | 一般大括號。`code`、`pre` 內的大括號不處理。 |

同一個答案出現兩次，就會有兩張小卡，任一張都能填入任一個對應的空格。所有空格同寬（依最長的答案計算），不會透露答案長度。

## 屬性

顏色可寫色票名稱（`background`、`bg-alternative`、`shell`、`vanilla`、`yellow`、`pink`、`red`、`green`、`blue`、`indigo`、`violet`、`gray`、`key`、`calm`、`quiet`、`playful`、`urgent`、`energetic`、`dreamy`）或任何 CSS 顏色。邊框寫成「粗細 樣式 顏色」，例如 `2 solid key`，純數字視為 px，`none` 為無邊框。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `bank` | `bottom` | 小卡位置：`bottom`、`left`、`right`。 |
| `shuffle` | 開啟 | 小卡隨機排列；`false` 依出現順序。 |
| `reset-button` | `done` | 「重做」按鈕：`done` 完成後出現、`always` 一直顯示、`none` 不顯示。 |
| `label-done`、`label-reset` | `全部完成！`、`重做` | 完成提示與按鈕文字。 |
| `drop-anim` | `shrink` | 放對時的動畫：`shrink` 逐漸縮小，`none` 不播放。 |
| `shrink-duration` | `450` | 縮小動畫的時間，單位毫秒。 |
| `theme` | `key` | 見[主題](#主題)。以下屬性都能覆蓋主題。 |
| `accent` | 依主題 | 強調色：選取中的小卡外框、拖曳經過空格的底色、完成提示。 |
| `frame-border`、`frame-radius`、`frame-bg`、`frame-color`、`frame-padding` | 依主題、`0`、依主題、依主題、`24 40` | 題目框。 |
| `slot-border` | 依主題 | 空格的線條。 |
| `slot-shape` | `line` | `line` 只有底線，`box` 為方框。 |
| `slot-width` | 自動 | 空格寬度；自動時依最長的答案計算。 |
| `slot-hover-color` | 依 accent | 拖曳經過空格時的底色。 |
| `card-border`、`card-radius`、`card-bg`、`card-color`、`card-padding` | 依主題、`0`、依主題、依主題、`8 20` | 小卡。 |
| `bank-border`、`bank-bg`、`bank-gap`、`bank-padding` | `none`、透明、`10`、`0` | 小卡區。 |
| `bank-width` | `220` | 小卡區寬度，用於 `left`、`right`。 |
| `filled-color` | 依主題 | 填入答案的顏色。 |
| `filled-style` | `bold` | 填入答案的樣式，可組合 `bold`、`underline`、`highlight`、`italic`，空白分隔。 |
| `font-size`、`card-font-size` | `1.25`、`1` | 題目與小卡字級，純數字視為 rem。 |

`bank`、`shuffle`、`label-done`、`label-reset` 改變時會重建題目；其他屬性改變時立即套用，作答狀態保留。

## 主題

| 主題 | 題目框 | 空格與小卡 | 填入答案 |
| --- | --- | --- | --- |
| `key` | `#0C0D0C` 底、`#86877F` 框 | `#51DBCF` | `#51DBCF` |
| `violet` | `#0C0D0C` 底、`#B484E8` 框 | `#B484E8`，空格為虛線 | `#E3D322` |
| `pink` | `#3B2A20` 底 | `#FF91D7` | `#FF91D7` |
| `shell` | `#C6C7BD` 淺色底、`#0C0D0C` 框 | `#0C0D0C`，小卡 `#DBEDD8` 底 | `#3B2A20` |

## 事件與方法

| 事件 | `detail` | 時機 |
| --- | --- | --- |
| `drag-ans:correct` | `{ answer, slot }` | 放對時。 |
| `drag-ans:wrong` | `{ answer, expected, slot }` | 放錯時。 |
| `drag-ans:complete` | `{ wrong, total }` | 全部空格完成時，`wrong` 為放錯次數。 |
| `drag-ans:reset` | `{}` | 重做時。 |

```js
const q = document.querySelector('ui-drag-ans');
q.reset();        // 重做
q.revealAll();    // 直接填入全部答案
q.progress;       // { filled, total, wrong }
```

## 與 ui-cards 協作

元件第一次建立時，會把原始題目存進自己內部的 `<template class="uda-src">`。

- 放在 `<card-item>` 裡：卡片內容被搬移時保留作答狀態。
- 放在 `detail` 指向的 `<template>` 或隱藏 `<div>` 裡：內容區複製題目時，會從原始題目重新建立成可作答的狀態。
- 作答時點小卡、空格、重做按鈕，點擊不會往上傳，不會觸發卡片本身的點擊功能。

```html
<ui-cards cols="3" panel="below">
  <card-item label="卡片內直接作答">
    <ui-drag-ans><p>It's only {a stone's throw from} my place.</p></ui-drag-ans>
  </card-item>
  <card-item label="從 template 開啟" detail="tpl-q1"></card-item>
</ui-cards>

<template id="tpl-q1">
  <ui-drag-ans theme="pink"><p>The café is {packed to the rafters} on weekends.</p></ui-drag-ans>
</template>
```

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
