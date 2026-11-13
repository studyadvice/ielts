# maze-quiz

`<maze-quiz>` 是迷宮填空動畫元件。每次載入都會隨機生成一座只有一條路的迷宮，從左下入口描繪路徑到右上出口，抵達後在出口噴出彩帶，答案從出口跳出並飛進題目的空格。題目區可以用 `<maze-quiz-panel>` 拆到同一網頁的任何位置。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

- 版本：1.6.0
- 建立日期：11-12-26
- 更新日期：11-13-26

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `maze-quiz.js` | `<maze-quiz>`、`<maze-quiz-panel>` | 迷宮填空動畫與外部題目面板。 |
| `maze-quiz-demo-11-13-26.html` | | 互動範例二十三則，附修改一到修改十的程式碼對照。範例十七到十九引用 repo 根目錄的 `bp-styles.css`。 |

## 目錄

- [快速開始](#快速開始)
- [運作方式](#運作方式)
- [屬性](#屬性)
- [外部題目面板](#外部題目面板)
- [題目區額外類別 extra-class、panel-class](#題目區額外類別-extra-classpanel-class)
- [播放完畢後顯示 template](#播放完畢後顯示-template)
- [題庫](#題庫)
- [快捷鍵](#快捷鍵)
- [事件與方法](#事件與方法)
- [版本紀錄](#版本紀錄)
- [授權](#授權)

## 快速開始

```html
<maze-quiz question="I go _____ every day." answer="jogging"></maze-quiz>

<script src="https://cdn.jsdelivr.net/gh/studyadvice/ielts@main/maze/maze-quiz.js"></script>
```

## 運作方式

- 迷宮以遞迴回溯法生成，屬於完美迷宮：任兩格之間只有一條路，所以入口到出口的路徑必定唯一。
- 題目用兩個以上的底線標示空格，例如 `I go _____ every day.`。沒有底線時，空格接在句尾。
- 題目可用 `<br>` 換行（也接受 `<br/>`、`<BR>`），例如 `A: Why are you so tired?<br>B: I _____ up all night.`；其他標籤一律當作文字顯示，不會執行。題庫的 `q` 也適用。
- 預設在元件幾乎完全進入畫面時自動播放，確保看得到左下入口。
- 彩帶不使用透明度，以縮小或落出畫面的方式退場。
- 答案標籤與彩帶依迷宮實際顯示大小等比縮放（基準 560px，範圍 0.4 到 1.25 倍）；迷宮很小時，牆壁與路徑仍保有最細下限。
- 答案飛入時若空格不在畫面內，會先平滑捲動過去。

## 屬性

顏色可寫色票名稱（`background`、`bg-alternative`、`shell`、`vanilla`、`yellow`、`pink`、`red`、`green`、`blue`、`indigo`、`violet`、`gray`、`key`、`calm`、`quiet`、`playful`、`urgent`、`energetic`、`dreamy`）或色碼。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `question` | `I go _____ every day.` | 題目，可用 `<br>` 換行。 |
| `answer` | `jogging` | 答案。 |
| `cols`、`rows` | `10`、`12` | 欄數與列數，範圍 2 到 40。 |
| `speed` | `70` | 每一格的描繪毫秒數，總長限制在 1.2 到 15 秒之間。 |
| `autoplay` | 自動 | `false` 時需按開始按鈕或快捷鍵。 |
| `seed` | 無 | 亂數種子，固定迷宮樣式。 |
| `maze-width` | 自動 | 迷宮區總寬度；純數字視為 px，也接受 `40%`、`24rem` 等寫法。與 `cell-size` 同時設定時以此為準。 |
| `cell-size` | 無 | 每格大小（px），迷宮寬度依格數自動計算。 |
| `route-colors` | `key` 單色 | 路徑漸層，一到三個顏色，例如 `key,yellow,pink`，沿路徑長度從入口過渡到出口（三色時中段經過第二色）。接受色碼、色票名稱、CSS 色名、`rgb()`、`hsl()`；半形或全形逗號、頓號、分號、空白都能分隔。含透明度的寫法會忽略透明度，無法辨識的顏色會在主控台提示。 |
| `controls` | `panel` | 按鈕位置：`panel` 跟著題目面板、`maze` 放在迷宮下方、`none` 不顯示。 |
| `label-play` | `開始解謎` | 開始按鈕文字。 |
| `label-replay` | `重播` | 答案揭曉後，開始按鈕改顯示的文字。 |
| `label-new` | `換一個迷宮` | 換迷宮按鈕文字。 |
| `play-size` | `md` | 開始按鈕尺寸：`sm`、`md`、`lg`、`xl`（0.875、1、1.25、1.5rem），或純數字視為 rem（範圍 0.6 到 3），內距等比放大。 |
| `confetti` | 開啟 | `false` 時跳過噴彩帶動畫，答案仍會跳出並飛入空格。 |
| `hide-until-play` | 不隱藏 | 只寫屬性名稱或設為 `true` 時，按下開始以前用遮罩隱藏整個迷宮，版面大小保留；按下後從入口展開。 |
| `label-cover` | `按下開始，迷宮就會出現` | 隱藏時遮罩上的提示文字。 |
| `hotkey` | 回應 | `false` 時不回應快捷鍵。 |
| `label-title` | `填空題` | 題目面板上方的標題；設為空字串（`label-title=""`）時不顯示。 |
| `label-reveal` | `答案揭曉：{answer}` | 答案填入後的狀態文字，`{answer}` 會換成答案。 |
| `show-reveal` | 顯示 | `false` 時，答案填入後不顯示狀態文字。 |
| `reveal-color` | `#C6C7BD` | 揭曉文字的文字色。 |
| `reveal-bg` | 無背景 | 揭曉文字的背景色；設定後以圓角色塊呈現（內距 6px 16px）。 |
| `entry-icon` | 綠色圓點 | 入口改用 Bootstrap Icons，填圖示名稱，例如 `geo-alt-fill`（也接受 `bi-geo-alt-fill`）。 |
| `exit-icon` | 粉紅圓點 | 出口改用 Bootstrap Icons，例如 `flag-fill`，抵達時一樣會脈動。 |
| `exit-pulse` | `1.9` | 抵達出口時的放大倍率，範圍 1 到 4；`1` 等於不放大。圓點與 `exit-icon` 圖示都適用，圖示範圍會跟著倍率加大，不會被裁切。 |
| `show-template` | 無 | 全部播放完畢（答案填入空格的動畫結束）後，顯示指定 id 的 `<template>` 內容，詳見[播放完畢後顯示 template](#播放完畢後顯示-template)。 |
| `chip-shape` | `pill` | 出口答案標籤的形狀：`pill` 膠囊、`rounded` 圓角、`square` 直角，或純數字（圓角 px，隨迷宮大小等比縮放）。 |
| `chip-bg` | `#E3D322` | 答案標籤底色。 |
| `chip-color` | `#0C0D0C` | 答案標籤文字色。 |
| `panel-class` | 無 | 內建題目區的額外 class，例如 `p-3 bp-lnh-5`，詳見[題目區額外類別](#題目區額外類別-extra-classpanel-class)。 |

`reveal-color`、`reveal-bg`、`chip-bg`、`chip-color` 接受色碼、色票名稱或 CSS 色名。元件只輸出 `<i class="bi bi-名稱">`，不載入圖示檔，使用 `entry-icon`、`exit-icon` 的網頁需自行引用 bootstrap-icons 的 CSS：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
```

未設定 `maze-width` 與 `cell-size` 時，迷宮與內建題目區按 3 比 2 分配寬度，迷宮高度不超過視窗的 72%；設定任一個後取消高度上限。

`question`、`answer`、`cols`、`rows` 改變時會重建迷宮；其他屬性改變時立即套用。

## 外部題目面板

```html
<maze-quiz id="m1" maze-width="420" controls="maze"
           question="I usually _____ my homework after dinner." answer="do"></maze-quiz>

<!-- 放在同一網頁任何位置 -->
<maze-quiz-panel for="m1"></maze-quiz-panel>
```

`for` 填迷宮的 `id`。有對應面板時，迷宮不顯示內建題目區；移除面板後自動恢復內建版面。

## 題目區額外類別 extra-class、panel-class

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/studyadvice/ielts@main/bp-styles.css">

<!-- 外部面板 -->
<maze-quiz-panel for="m1" extra-class="p-3 bp-lnh-5"></maze-quiz-panel>

<!-- 內建題目區 -->
<maze-quiz panel-class="p-3 bp-lnh-5" question="I go _____ every day." answer="jogging"></maze-quiz>
```

外部面板用 `<maze-quiz-panel>` 的 `extra-class`，內建題目區用 `<maze-quiz>` 的 `panel-class`。類別以空白分隔，加在棕色題目框 `.mq-panel` 上，不是外殼或整個元件。Bootstrap 與 `bp-styles.css` 的類別都能用。有外部面板時內建題目區不顯示，`panel-class` 不作用。以下規則兩者相同。

- 不需要 `!important`：題目框的內距、字級、行距、字重、文字色、底色、圓角與間距，預設樣式的權重都只有一個 class，元件的樣式表又插在 `<head>` 最前面，所以頁面上同權重的類別會勝出。
- 題目框的字級就是題目字級（預設 2.25rem）。`fs-*` 設定的是題目字級，`bp-lnh-*` 這類 em 單位的行距也以題目字級計算，例如 `bp-lnh-5`（2.5em）在 36px 的題目上是 90px。
- 標題與揭曉文字以 em 等比縮放，最小分別是 0.75rem 與 1rem；面板裡的按鈕不受影響，大小由 `play-size` 控制。
- Bootstrap 的 `p-*` 帶 `!important`，會蓋過 `bp-ind-*` 的左內距，兩者不要同時使用。
- 可以用 JS 改寫屬性，元件會移除上一次加入的類別再套用新的：

```js
document.querySelector('maze-quiz-panel[for="m1"]').setAttribute('extra-class', 'fs-large text-center');
document.querySelector('#m2').setAttribute('panel-class', 'fs-large text-center');
```

## 播放完畢後顯示 template

```html
<maze-quiz show-template="tpl-1" question="If I _____ more time, I would learn to play the piano." answer="had"></maze-quiz>

<template id="tpl-1">
  <div class="explain-card">If 子句用過去式，主要子句用 would + 原形動詞。</div>
</template>
```

- 答案填入空格的動畫結束後，元件複製 `<template>` 的內容，插在 `<template>` 的正後方，所以 `<template>` 放在哪裡，內容就顯示在哪裡。
- 不包額外的容器；按「重播」、「換一個迷宮」或改寫 `show-template` 時，先移除這次插入的內容，播完再顯示。
- 可寫 `tpl-1` 或 `#tpl-1`。找不到 id，或該元素不是 `<template>` 時，在主控台提示。
- 內容顯示後觸發 `template-shown` 事件。

## 題庫

```html
<maze-quiz cols="18" rows="11">
  <script type="application/json">
    [{"q": "I go _____ every day.", "a": "jogging"},
     {"q": "She has lived here _____ ten years.", "a": "for"}]
  </script>
</maze-quiz>
```

每次載入與按「換一個迷宮」都會隨機換題，不會連續出現同一題。有題庫時忽略 `question` 與 `answer`。

## 快捷鍵

<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>數字鍵盤 5</kbd>：啟動目前畫面中露出最多的迷宮，播放中則忽略。以實體按鍵位置判斷，NumLock 開關都能觸發；NumLock 關閉時只按 <kbd>Ctrl</kbd> + <kbd>數字鍵盤 5</kbd> 也會觸發。

## 事件與方法

| 名稱 | 說明 |
| --- | --- |
| `maze-solved` | 路徑抵達出口時觸發。 |
| `answer-revealed` | 答案填入空格時觸發。 |
| `template-shown` | `show-template` 的內容顯示後觸發。 |
| `event.detail` | `question`、`answer`、`cols`、`rows`、`steps`（路徑格數）。 |
| `play()` | 播放或重播目前的迷宮。 |
| `regenerate(autoPlay)` | 生成新迷宮，題庫模式下同時換題；`autoPlay` 預設 `true`。 |

```js
document.addEventListener('answer-revealed', e => console.log(e.detail.answer));
```

## 版本紀錄

| 版本 | 內容 |
| --- | --- |
| 1.6.0 | 新增 `show-template` 與 `template-shown` 事件，播放完畢後顯示 `<template>` 內容。 |
| 1.5.0 | 新增 `exit-pulse`，可調整抵達出口時的放大倍率。 |
| 1.4.0 | `question` 與題庫的 `q` 支援 `<br>` 換行。 |
| 1.3.0 | `<maze-quiz>` 新增 `panel-class`，內建題目區也能直接加類別。 |
| 1.2.0 | `<maze-quiz-panel>` 新增 `extra-class`；題目框的預設樣式降低權重，字級改以題目框為基準。 |
| 1.1.0 | `route-colors` 支援三色與多種分隔符號；新增 `label-title`、`label-reveal`、`show-reveal`、`reveal-color`、`reveal-bg`、`entry-icon`、`exit-icon`、`chip-shape`、`chip-bg`、`chip-color`；題目面板不再顯示迷宮尺寸文字。 |
| 1.0.0 | 初版：迷宮生成與動畫、外部題目面板、`maze-width`、`cell-size`、`controls`、快捷鍵、按鈕文字與尺寸、`confetti`、`hide-until-play`。 |

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
