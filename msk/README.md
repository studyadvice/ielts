# ui-mask

`<ui-mask>` 是行內文字遮罩元件。包住句子裡的任何一段文字，就會產生遮罩，點擊後揭曉原文。支援六種遮罩樣式、任意顏色與透明度，也能遮住整段文字並顯示提示語。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

可以放在一般段落，也能正常運作於 `<ui-table>` 的格子（含樹狀巢狀、輪播、extra-info）與 `<ui-cards>` 的卡片、template 面板。

- 版本：1.1.0
- 建立日期：11-09-26
- 更新日期：11-11-26

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-mask.js` | `<ui-mask>` | 行內或區塊文字遮罩，點擊或滑過揭曉。 |
| `ui-mask-demo-11-09-26.html` | | 互動範例，含 ui-table 與 ui-cards 內的用法（v1.0.0）。 |
| `ui-mask-demo-11-11-26.html` | | v1.1.0 互動範例，含提示文字修改前後對照。 |

## 目錄

- [快速開始](#快速開始)
- [屬性](#屬性)
- [遮罩樣式](#遮罩樣式)
- [透明度](#透明度)
- [區塊模式與提示文字](#區塊模式與提示文字)
- [在 ui-table 與 ui-cards 裡使用](#在-ui-table-與-ui-cards-裡使用)
- [JavaScript API](#javascript-api)
- [事件](#事件)
- [運作細節](#運作細節)
- [授權](#授權)

## 快速開始

```html
<p>I wake up early <ui-mask color="pink">to avoid the traffic</ui-mask>.</p>

<script src="https://cdn.jsdelivr.net/gh/studyadvice/ielts@main/msk/ui-mask.js"></script>
```

## 屬性

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `color` | 色票名稱或任何 CSS 顏色 | `shell` | 遮罩顏色。18 個色票名稱都能直接寫，例如 `pink`、`dreamy`。 |
| `opacity` | `0` 到 `1` | `1` | 遮罩透明度，數字越小原文透出越多。 |
| `mask-style` | `solid`、`stripe`、`dots`、`blur`、`underline`、`gradient` | `solid` | 遮罩樣式，見[遮罩樣式](#遮罩樣式)。無效值改用 `solid` 並在主控台提示。 |
| `gradient` | `1` 到 `6`，或 CSS 漸層 | `1` | 搭配 `mask-style="gradient"`。預設漸層與 ui-table 的 `mask-gradient` 相同。 |
| `blur` | 數字或 CSS 長度 | `5` | 搭配 `mask-style="blur"`，模糊程度。純數字視為 px。 |
| `line-width` | 數字或 CSS 長度 | `2` | 搭配 `mask-style="underline"`，底線粗細。 |
| `display` | `inline`、`inline-block`、`block` | `inline` | 行內遮罩或區塊遮罩。 |
| `label` | 文字 | 無 | 提示語。區塊與 inline-block 模式顯示在遮罩正中央；行內模式預設改為滑鼠提示，揭曉後移除。 |
| `label-mode` | `show` | 無 | 行內遮罩也把提示語顯示在遮罩上，遮罩期間暫時變成 inline-block。 |
| `label-color` | 色票名稱或 CSS 顏色 | 依遮罩色自動選深色或淺色 | 提示語顏色。 |
| `radius` | 數字或 CSS 長度 | `4` | 圓角，純數字視為 px。 |
| `padding` | 一到四個數字或 CSS 長度 | `0 2` | 內距，純數字視為 px。 |
| `trigger` | `click`、`hover` | `click` | `hover`：滑鼠停留時暫時揭曉，移開就遮回。 |
| `toggle` | 布林 | 關閉 | 揭曉後再點一次可以重新遮住。 |
| `revealed` | 布林 | 關閉 | 揭曉狀態。可以直接寫在標籤上，讓遮罩一開始就揭曉。 |

屬性在執行期間修改會立即生效。

## 遮罩樣式

| `mask-style` | 外觀 | 適合 |
| --- | --- | --- |
| `solid` | 實心色塊 | 一般遮罩 |
| `stripe` | 斜線紋，兩種深淺交錯 | 想要醒目一點的遮罩 |
| `dots` | 圓點紋 | 輕鬆一點的視覺 |
| `blur` | 文字變成遮罩色的模糊光暈，看得到長度與形狀但讀不出來 | 給一點線索 |
| `underline` | 文字隱藏，只留一條底線 | 填空題 |
| `gradient` | 漸層色塊 | 和 ui-table 的漸層遮罩風格一致 |

```html
<ui-mask mask-style="stripe" color="yellow">to unwind after work</ui-mask>
<ui-mask mask-style="blur" color="quiet" blur="6">likely to become less common</ui-mask>
<ui-mask mask-style="underline" color="green">I visit most often</ui-mask>
<ui-mask mask-style="gradient" gradient="4">anxious to know my exam results</ui-mask>
```

行內遮罩的長度等於原文長度，句子換行時每一行都會遮得剛好。

## 透明度

```html
<ui-mask color="violet" opacity="1">just a short bike ride from my place</ui-mask>
<ui-mask color="violet" opacity="0.6">just a short bike ride from my place</ui-mask>
<ui-mask color="violet" opacity="0.3">just a short bike ride from my place</ui-mask>
```

- `solid`、`stripe`、`dots`：遮罩色與文字同時依透明度變化，`1` 完全看不到原文。
- `gradient`：漸層本身不透明，`opacity` 只控制文字被遮住的程度。
- `blur`：控制模糊光暈的濃淡。
- `underline`：文字一律隱藏，`opacity` 不影響。

## 區塊模式與提示文字

```html
<ui-mask display="block" color="bg-alternative" label="先自己想想，再點我看答案" padding="14 18" radius="10">
  Unlike those who tend to have the same thing for lunch every day, ...
</ui-mask>
```

提示語只在遮罩期間顯示，揭曉後消失。

v1.1.0 起：

- 提示語不換行。內容比提示語短時，遮罩自動撐到提示語的寬度；放在窄格裡空間仍不夠時，以 `...` 截斷。
- 有提示語時，原文完全隱藏，不會和提示語重疊（`blur` 樣式保留淡淡的光暈）。
- 行內遮罩加上 `label-mode="show"` 也能直接顯示提示語：

```html
I usually <ui-mask label="點我看答案" label-mode="show" color="pink">take the bus</ui-mask> to work.
```

## 在 ui-table 與 ui-cards 裡使用

直接寫在 `<ui-col>`、`<cell-item>`、extra-info 來源區塊、`<card-item>` 或 `<template>` 面板的內容裡即可，不需要任何額外設定。

```html
<ui-table theme="quiet">
  <ui-row>
    <ui-col expandable>After a long week, I was so glad <ui-mask color="key">to find an excuse to skip the gym</ui-mask>.</ui-col>
  </ui-row>
</ui-table>

<ui-cards cols="1" toggle>
  <card-item detail="panel-1" label="打分數句型">
    <p>It's hard <ui-mask color="playful">to find a quiet café on weekends</ui-mask>.</p>
  </card-item>
</ui-cards>
<template id="panel-1">
  <p>My boss is <ui-mask color="urgent">hard to please</ui-mask>.</p>
</template>
```

- **點擊不會誤觸宿主功能**：遮罩未揭曉時，點擊只用來揭曉，不會觸發格子的 `expandable`、`toggle`、`arrow="click"`，也不會展開 ui-cards 的面板。揭曉後點擊照常傳遞，例如點文字可以展開 expandable 格子。
- **不建議**和 ui-table 的 `mask-text` 用在同一格，會變成兩層遮罩。
- 腳本放在 `ui-table.js`、`ui-cards.js` 之前或之後都可以。

## JavaScript API

```js
UiMask.revealAll();              // 揭曉整頁的遮罩
UiMask.revealAll('#lesson-1');   // 只揭曉某個範圍內的遮罩（選擇器或元素）
UiMask.hideAll();                // 全部遮回

const m = document.querySelector('ui-mask');
m.reveal();                      // 揭曉
m.hide();                        // 遮回
m.revealed;                      // 目前是否已揭曉，可讀可寫
```

## 事件

| 事件 | `detail` | 說明 |
| --- | --- | --- |
| `mask-reveal` | `revealed`、`source` | 揭曉或遮回時觸發，會往上冒泡。`revealed` 為 `true` 表示揭曉；`source` 為 `click`（使用者點擊）或 `api`（程式呼叫）。 |

```js
document.addEventListener('mask-reveal', function (e) {
  console.log(e.target.textContent, e.detail.revealed);
});
```

## 運作細節

- **不修改子元素**：遮罩全部用 CSS 畫出。ui-table 會把格子內容序列化後重新解析，ui-cards 會複製 template，元件因此被重建時不會重複疊加結構。
- **狀態寫在屬性上**：揭曉後加上 `revealed` 屬性，元件被複製時狀態跟著走。
- **子元素一起淡出**：遮罩期間，`<c-key>` 等色名標籤、粗體、圖示都會跟著遮住，不會透出自己的顏色。
- **CSS 注入**：樣式以 `<style id="ui-mask-style">` 注入 `<head>`，選擇器都限定在 `ui-mask` 之下。
- **瀏覽器需求**：透明度使用 CSS `color-mix()`，需要 2023 年以後的主流瀏覽器。

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
