# maze-quiz

`<maze-quiz>` 是迷宮填空動畫元件。每次載入都會隨機生成一座只有一條路的迷宮，從左下入口描繪路徑到右上出口，抵達後在出口噴出彩帶，答案從出口跳出並飛進題目的空格。題目區可以用 `<maze-quiz-panel>` 拆到同一網頁的任何位置。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

- 版本：1.0.0
- 建立日期：11-12-26

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `maze-quiz.js` | `<maze-quiz>`、`<maze-quiz-panel>` | 迷宮填空動畫與外部題目面板。 |
| `maze-quiz-demo-11-12-26.html` | | 互動範例八則，附開發過程的程式碼對照。 |

## 目錄

- [快速開始](#快速開始)
- [運作方式](#運作方式)
- [屬性](#屬性)
- [外部題目面板](#外部題目面板)
- [題庫](#題庫)
- [快捷鍵](#快捷鍵)
- [事件與方法](#事件與方法)
- [授權](#授權)

## 快速開始

```html
<maze-quiz question="I go _____ every day." answer="jogging"></maze-quiz>

<script src="https://cdn.jsdelivr.net/gh/studyadvice/ielts@main/maze/maze-quiz.js"></script>
```

## 運作方式

- 迷宮以遞迴回溯法生成，屬於完美迷宮：任兩格之間只有一條路，所以入口到出口的路徑必定唯一。
- 題目用兩個以上的底線標示空格，例如 `I go _____ every day.`。沒有底線時，空格接在句尾。
- 預設在元件幾乎完全進入畫面時自動播放，確保看得到左下入口。
- 彩帶不使用透明度，以縮小或落出畫面的方式退場。
- 答案標籤與彩帶依迷宮實際顯示大小等比縮放（基準 560px，範圍 0.4 到 1.25 倍）；迷宮很小時，牆壁與路徑仍保有最細下限。
- 答案飛入時若空格不在畫面內，會先平滑捲動過去。

## 屬性

顏色可寫色票名稱（`background`、`bg-alternative`、`shell`、`vanilla`、`yellow`、`pink`、`red`、`green`、`blue`、`indigo`、`violet`、`gray`、`key`、`calm`、`quiet`、`playful`、`urgent`、`energetic`、`dreamy`）或色碼。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `question` | `I go _____ every day.` | 題目。 |
| `answer` | `jogging` | 答案。 |
| `cols`、`rows` | `10`、`12` | 欄數與列數，範圍 2 到 40。 |
| `speed` | `70` | 每一格的描繪毫秒數，總長限制在 1.2 到 15 秒之間。 |
| `autoplay` | 自動 | `false` 時需按開始按鈕或快捷鍵。 |
| `seed` | 無 | 亂數種子，固定迷宮樣式。 |
| `maze-width` | 自動 | 迷宮區總寬度；純數字視為 px，也接受 `40%`、`24rem` 等寫法。與 `cell-size` 同時設定時以此為準。 |
| `cell-size` | 無 | 每格大小（px），迷宮寬度依格數自動計算。 |
| `route-colors` | `key` 單色 | 路徑雙色漸層，例如 `key,pink`，沿路徑長度從入口過渡到出口。 |
| `controls` | `panel` | 按鈕位置：`panel` 跟著題目面板、`maze` 放在迷宮下方、`none` 不顯示。 |
| `label-play` | `開始解謎` | 開始按鈕文字。 |
| `label-replay` | `重播` | 答案揭曉後，開始按鈕改顯示的文字。 |
| `label-new` | `換一個迷宮` | 換迷宮按鈕文字。 |
| `play-size` | `md` | 開始按鈕尺寸：`sm`、`md`、`lg`、`xl`（0.875、1、1.25、1.5rem），或純數字視為 rem（範圍 0.6 到 3），內距等比放大。 |
| `confetti` | 開啟 | `false` 時跳過噴彩帶動畫，答案仍會跳出並飛入空格。 |
| `hide-until-play` | 不隱藏 | 只寫屬性名稱或設為 `true` 時，按下開始以前用遮罩隱藏整個迷宮，版面大小保留；按下後從入口展開。 |
| `label-cover` | `按下開始，迷宮就會出現` | 隱藏時遮罩上的提示文字。 |
| `hotkey` | 回應 | `false` 時不回應快捷鍵。 |

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
| `event.detail` | `question`、`answer`、`cols`、`rows`、`steps`（路徑格數）。 |
| `play()` | 播放或重播目前的迷宮。 |
| `regenerate(autoPlay)` | 生成新迷宮，題庫模式下同時換題；`autoPlay` 預設 `true`。 |

```js
document.addEventListener('answer-revealed', e => console.log(e.detail.answer));
```

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
