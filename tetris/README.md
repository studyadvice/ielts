# tetris-quiz

`<tetris-quiz>` 是俄羅斯方塊填空動畫元件。每次載入都會生成一份保證能完全消除的劇本：方塊在出生區旋轉、平移，落下鎖定，滿行時閃白並逐格縮小，上方的列整體下移，最後一塊落下後棋盤完全清空，答案從棋盤中央跳出，飛進題目的空格。棋盤寬度固定 8 欄，列數用 `rows` 設定。題目區可以用 `<tetris-quiz-panel>` 拆到同一網頁的任何位置。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

- 版本：1.0.0
- 建立日期：11-19-26
- 更新日期：11-19-26

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `tetris-quiz.js` | `<tetris-quiz>`、`<tetris-quiz-panel>` | 方塊消除動畫與外部題目面板。 |
| `tetris-quiz-demo-11-19-26.html` | | 互動範例六則。範例四引用 repo 根目錄的 `bp-styles.css`，範例五引用 `lw/link-when.js`。 |

## 目錄

- [快速開始](#快速開始)
- [運作方式](#運作方式)
- [屬性](#屬性)
- [外部題目面板](#外部題目面板)
- [題目區額外類別 extra-class、panel-class](#題目區額外類別-extra-classpanel-class)
- [播放完畢後顯示 template](#播放完畢後顯示-template)
- [搭配 link-when](#搭配-link-when)
- [題庫](#題庫)
- [快捷鍵](#快捷鍵)
- [事件與方法](#事件與方法)
- [版本紀錄](#版本紀錄)
- [授權](#授權)

## 快速開始

```html
<tetris-quiz question="I go _____ every day." answer="jogging"></tetris-quiz>

<script src="https://cdn.jsdelivr.net/gh/studyadvice/ielts@main/tetris/tetris-quiz.js"></script>
```

## 運作方式

- 劇本先把 8 欄 × `rows` 列的整個棋盤隨機切成多個四格方塊（I、O、T、S、Z、J、L），再排出放置順序：任何方塊正上方的方塊都比它晚放，所以每塊都能從上方垂直落下，沿途不會被擋住。切出互相卡住的形狀時會自動重切。
- 每塊方塊先在棋盤上方的出生區旋轉、平移到目標姿勢，再越落越快。落地後有滿行就消除：白色閃兩次，由左到右逐格縮小，上方的列整體下移。同時補滿多行時會一次消多行。
- 因為整份劇本事先模擬過，最後一塊落下並消行後，棋盤必定完全清空。方塊總數是 `rows` 的兩倍。
- 題目用兩個以上的底線標示空格，例如 `I go _____ every day.`。沒有底線時，空格接在句尾。
- 題目可用 `<br>` 換行（也接受 `<br/>`、`<BR>`）；其他標籤一律當作文字顯示，不會執行。題庫的 `q` 也適用。
- 預設在元件幾乎完全進入畫面時自動播放，確保看得到整個棋盤。
- 彩帶與消行動畫都不使用透明度，改以顏色切換、縮小或落出畫面呈現。
- 答案標籤與彩帶依棋盤實際顯示大小等比縮放（基準寬度 380px，範圍 0.4 到 1.25 倍）。
- 答案飛入時若空格不在畫面內，會先平滑捲動過去。

## 屬性

顏色可寫色票名稱（`background`、`bg-alternative`、`shell`、`vanilla`、`yellow`、`pink`、`red`、`green`、`blue`、`indigo`、`violet`、`gray`、`key`、`calm`、`quiet`、`playful`、`urgent`、`energetic`、`dreamy`、`salmon`）或色碼。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `question` | `I go _____ every day.` | 題目，可用 `<br>` 換行。 |
| `answer` | `jogging` | 答案。 |
| `rows` | `8` | 棋盤列數，範圍 4 到 16；寬度固定 8 欄。 |
| `seed` | 無 | 亂數種子，固定劇本。 |
| `drop-speed` | `24` | 方塊每落一列的毫秒數，範圍 6 到 200；旋轉與平移的節奏跟著調整。 |
| `clear-speed` | `22` | 消行時每格縮小的間隔毫秒數，範圍 6 到 120。 |
| `autoplay` | 自動 | `false` 時需按開始按鈕或快捷鍵。 |
| `board-width` | `380px` | 棋盤區總寬度；純數字視為 px，也接受 `40%`、`24rem` 等寫法。 |
| `cell-size` | 無 | 每格大小（px），棋盤寬度依此計算；與 `board-width` 同時設定時以 `board-width` 為準。 |
| `piece-colors` | 見說明 | 依序指定 I、O、T、S、Z、J、L 七種方塊的顏色，用逗號分隔（半形或全形逗號、頓號、分號、空白都可以）；不足的沿用預設色 `key`、`yellow`、`violet`、`green`、`red`、`blue`、`playful`。含透明度的寫法會忽略透明度。 |
| `controls` | `panel` | 按鈕位置：`panel` 跟著題目面板、`board` 放在棋盤下方、`none` 不顯示。 |
| `label-play` | `開始消除` | 開始按鈕文字。 |
| `label-replay` | `重播` | 播完後，開始按鈕改顯示的文字。 |
| `label-new` | `換一局` | 換新劇本按鈕文字。 |
| `play-size` | `md` | 開始按鈕尺寸：`sm`、`md`、`lg`、`xl`（0.875、1、1.25、1.5rem），或純數字視為 rem（範圍 0.6 到 3），內距等比放大。 |
| `confetti` | 開啟 | `false` 時跳過噴彩帶動畫，答案仍會跳出並飛入空格。 |
| `hide-until-play` | 不隱藏 | 只寫屬性名稱或設為 `true` 時，按下開始以前用遮罩隱藏棋盤，版面大小保留；按下後從中央展開。 |
| `label-cover` | `按下開始，方塊就會落下` | 隱藏時遮罩上的提示文字。 |
| `hotkey` | 回應 | `false` 時不回應快捷鍵。 |
| `label-title` | `填空題` | 題目面板上方的標題；設為空字串（`label-title=""`）時不顯示。 |
| `label-reveal` | `答案揭曉：{answer}` | 答案填入後的狀態文字，`{answer}` 會換成答案。 |
| `show-reveal` | 顯示 | `false` 時，答案填入後不顯示狀態文字。 |
| `reveal-color` | `#C6C7BD` | 揭曉文字的文字色。 |
| `reveal-bg` | 無背景 | 揭曉文字的背景色；設定後以圓角色塊呈現（內距 6px 16px）。 |
| `chip-shape` | `pill` | 答案標籤的形狀：`pill` 膠囊、`rounded` 圓角、`square` 直角，或純數字（圓角 px，隨棋盤大小等比縮放）。 |
| `chip-bg` | `#E3D322` | 答案標籤底色。 |
| `chip-color` | `#0C0D0C` | 答案標籤文字色。 |
| `panel-class` | 無 | 內建題目區的額外 class，例如 `p-3 bp-lnh-5`。 |
| `show-template` | 無 | 全部播放完畢後，顯示指定 id 的 `<template>` 內容。 |

`question`、`answer`、`rows` 改變時會重建劇本；`piece-colors` 改變時重畫棋盤；其他屬性改變時立即套用。

## 外部題目面板

```html
<tetris-quiz id="t1" board-width="320" controls="board"
             question="I usually _____ my homework after dinner." answer="do"></tetris-quiz>

<!-- 放在同一網頁任何位置 -->
<tetris-quiz-panel for="t1"></tetris-quiz-panel>
```

`for` 填棋盤的 `id`。有對應面板時，棋盤不顯示內建題目區；移除面板後自動恢復內建版面。

## 題目區額外類別 extra-class、panel-class

與 `maze-quiz` 相同。外部面板用 `<tetris-quiz-panel>` 的 `extra-class`，內建題目區用 `<tetris-quiz>` 的 `panel-class`。類別以空白分隔，加在棕色題目框 `.tq-panel` 上，Bootstrap 與 `bp-styles.css` 的類別都能用，不需要 `!important`。

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/studyadvice/ielts@main/bp-styles.css">

<tetris-quiz-panel for="t1" extra-class="p-3 bp-lnh-5"></tetris-quiz-panel>
<tetris-quiz panel-class="p-3 bp-lnh-5" question="I go _____ every day." answer="jogging"></tetris-quiz>
```

## 播放完畢後顯示 template

```html
<tetris-quiz show-template="tpl-1" question="If I _____ more time, I would learn to play the piano." answer="had"></tetris-quiz>

<template id="tpl-1">
  <div class="explain-card">If 子句用過去式，主要子句用 would + 原形動詞。</div>
</template>
```

- 答案填入空格的動畫結束後，元件複製 `<template>` 的內容，插在 `<template>` 的正後方，所以 `<template>` 放在哪裡，內容就顯示在哪裡。
- 不包額外的容器；按「重播」、「換一局」或改寫 `show-template` 時，先移除這次插入的內容，播完再顯示。
- 可寫 `tpl-1` 或 `#tpl-1`。找不到 id，或該元素不是 `<template>` 時，在主控台提示。
- 內容顯示後觸發 `template-shown` 事件。

## 搭配 link-when

`lw/link-when.js` 的 `event="done"` 已對應 `tetris-quiz`：沒有 `show-template` 時是 `tetris-cleared`（棋盤完全消除），有 `show-template` 時是 `template-shown`（解說顯示後）。

```html
<tetris-quiz id="t5" show-template="tpl5" question="…" answer="had"></tetris-quiz>
<div id="next5" hidden>…</div>

<link-when source="#t5" event="done" target="#next5" do="show" enter="slide-up"></link-when>
```

要只在某一次消行時觸發，可搭配 `detail-match`，例如 `event="lines-cleared" detail-match="remaining:0"`。

## 題庫

```html
<tetris-quiz rows="10">
  <script type="application/json">
    [{"q": "I go _____ every day.", "a": "jogging"},
     {"q": "She has lived here _____ ten years.", "a": "for"}]
  </script>
</tetris-quiz>
```

每次載入與按「換一局」都會隨機換題，不會連續出現同一題。有題庫時忽略 `question` 與 `answer`。

## 快捷鍵

<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>數字鍵盤 5</kbd>：啟動目前畫面中露出最多的棋盤，播放中則忽略。以實體按鍵位置判斷，NumLock 開關都能觸發；NumLock 關閉時只按 <kbd>Ctrl</kbd> + <kbd>數字鍵盤 5</kbd> 也會觸發。

## 事件與方法

| 名稱 | 說明 |
| --- | --- |
| `tetris-start` | 開始播放時觸發。 |
| `piece-landed` | 每塊方塊鎖定時觸發，`detail` 另有 `index`、`pieces`、`shape`。 |
| `lines-cleared` | 每次消行動畫結束時觸發，`detail` 另有 `lines`（這次消幾行）、`cleared`（累計）、`remaining`（剩餘列數）。 |
| `tetris-cleared` | 棋盤完全消除時觸發，也是 link-when 的 `done` 事件。 |
| `answer-revealed` | 答案填入空格時觸發。 |
| `template-shown` | `show-template` 的內容顯示後觸發。 |
| `event.detail` | `question`、`answer`、`cols`（固定 8）、`rows`、`pieces`（方塊總數）。 |
| `play()` | 播放或重播目前的劇本。 |
| `regenerate(autoPlay)` | 生成新劇本，題庫模式下同時換題；`autoPlay` 預設 `true`。 |

```js
document.addEventListener('tetris-cleared', e => console.log(e.detail.answer));
```

## 版本紀錄

| 版本 | 內容 |
| --- | --- |
| 1.0.0 | 初版：保證完全消除的劇本生成、方塊旋轉與落下動畫、滿行消除、外部題目面板、`piece-colors`、`show-template`、`link-when` 串接。 |

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
