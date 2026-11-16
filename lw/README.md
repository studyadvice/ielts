# link-when

`<link-when>` 把兩個元件串起來：A 播完（或發出指定事件）時，對 B 執行動作，例如開始播放、前進一步、顯示出來。中間可以讓 A 淡出、收合或刪除，並把 B 移到 A 的位置，錄影時畫面焦點不會跳走。元素本身不顯示任何畫面，不需要寫 JavaScript。不支援 `ui-table` 與 `info-region`。

互動範例：[`link-when-demo-11-13-26.html`](link-when-demo-11-13-26.html)。

```html
<ui-stream id="s1" autoplay>…</ui-stream>
<ui-play id="p1" hidden step-mode="auto">…</ui-play>

<link-when source="#s1" event="done" target="#p1" do="play"
           delay="800" exit="fade" in-place></link-when>
```

只在特定一則訊息出現時觸發，例如 `ui-stream` 的第 4 則（`ui-stream:item` 的 `detail.index` 從 0 開始）：

```html
<link-when source="#s1" event="ui-stream:item" detail-match="index:3"
           target="#next-btn" do="show" enter="slide-up"></link-when>
```

搭配其他元件的常見寫法：

```html
<!-- ui-blank 答對才顯示下一區塊 -->
<link-when source="#blank1" event="blank-submit" detail-match="valid:true"
           target="#next" do="show" enter="slide-up"></link-when>

<!-- bp-popnote 便條展開時顯示下一區塊 -->
<link-when source="#my-fold" event="bpn-fold" detail-match="open:true"
           target="#next" do="show"></link-when>

<!-- 用 call 呼叫全域函式：A 完成時展開便條 -->
<link-when source="#s1" target="#my-fold" call="BpPopnote.fold" call-arg="true"></link-when>
```

`ui-otp` 不在 `done` 對照表內，請明確寫 `event="otp-complete"`。`ui-blank`、`ui-otp` 都有 `reset()`、`focus()` 可用 `do` 呼叫。

處理順序：A 觸發 → `delay` → A 退場（`exit`）→ `exit-gap` → B 移位（`in-place`）→ B 進場（`enter`）→ 對 B 執行 `do`。

## 屬性

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `source` | 必填 | A 的選擇器。 |
| `event` | `done` | `done` 依元件自動對應到完成事件（見下表）；也可寫任何事件名稱。 |
| `detail-match` | 不設 | 事件的 `detail` 符合條件才觸發，格式為 `欄位:值`，多個條件用逗號分隔，例如 `index:3, role:system`。以字串比對，全部符合才算。 |
| `target` | 必填 | B 的選擇器。B 可以先加 `hidden`，觸發時自動顯示。 |
| `do` | `play` | `play`、`next`、`reset`、`show`、`hide`、`scroll`，或 B 身上任何方法名稱。 |
| `call` | 不設 | 改為呼叫全域函式，例如 `BpPopnote.fold`。B 當第一個參數傳入，並取代 `do`（B 只會先顯示）。 |
| `call-arg` | 不設 | 傳給 `call` 函式的第二個參數，`true`、`false`、數字會轉型，其餘為字串。 |
| `delay` | `0` | A 觸發後等多久才開始（ms）。 |
| `exit` | `none` | A 的退場：`none`、`hide`、`fade`、`collapse`、`remove`。 |
| `exit-speed` | `400` | `fade`、`collapse` 的時間（ms）。 |
| `exit-gap` | `0` | A 消失後，等多久 B 才開始（ms）。 |
| `in-place` | 不設 | B 移到 A 原本的位置，A 被刪除也可以。 |
| `enter` | `fade` | B 原本隱藏時的進場效果：`fade`、`slide-up`、`slide-down`、`zoom`、`pop`、`none`。 |
| `enter-speed` | `500` | 進場時間（ms）。 |
| `once` | `true` | 只觸發一次；`false` 則每次都觸發。 |

## `event="done"` 對照

| 元件 | 事件 |
| --- | --- |
| `ui-play` | `play-end` |
| `ui-stream` | `ui-stream:done` |
| `ui-blank` | `mode="cli"` 為 `cli-end`，其他為 `blank-submit` |
| `ui-detail-ladder` | `ladder-end` |
| `bp-stepper` | `bps:complete` |
| `ui-steps` | `steps:end` |
| `sentence-build` | `sb:complete` |
| `chunk-demo` | `chunk-end` |
| `ui-timeline` | `timeline-end` |
| `arrow-flow` | `flow-complete` |
| `slider-show` | `finished` |
| `ui-layer-diff` | `layerend` |
| `dino-deck` | `dino:done` |
| `ui-drag-ans` | `drag-ans:complete` |
| `ui-post` | `post-end` |
| `ui-screen` | `ui-screen:end` |
| `maze-quiz` | `maze-solved` |
| `ui-check` | `ui-check-done` |
| `ui-icon-anim` | `anim-end` |
| `ui-fillin` | `fillin-submit`（送出即觸發，不分對錯） |
| `ui-mask` | `mask-reveal` |

## 事件與方法

| 名稱 | 說明 |
| --- | --- |
| `link-when:start`、`link-when:done` | 串接開始與結束，`detail` 為 `{ source, target }`，會冒泡。 |
| `el.fire()` | 手動觸發，與事件發生時相同。 |
| `window.LinkWhen.doneEvents` | 上表的對照資料。 |

## 載入

```html
<script src="lw/link-when.js"></script>
```

`<link-when>` 只負責串接，A 與 B 各自的 `.js` 仍要另外載入。

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
