# ink-pen.js

螢幕錄影教學用的極簡畫筆層。零依賴，單一 JavaScript 檔即可運作，提供觸控筆、雷射筆、行內手寫填空與跳轉圓點。

適合用觸控筆在網頁教材上邊講解邊標註，錄成教學影片。元件不會在畫面上跳出任何提示訊息，設定錯誤只寫入 console，避免錄影時出現干擾畫面的東西。

## 功能

- **全頁繪圖層**：觸控筆支援壓感，雷射筆帶殘影；筆跡可固定在視窗或跟著內容捲動。
- **迷你工具列**：平時收合成一顆小圓鈕，可切換模式、筆色與粗細。
- **行內手寫空格**：點一下開啟手寫視窗，寫完的筆跡自動裁切後填回空格，可附解答。
- **跳轉圓點**：開著觸控筆也點得到，可跳到同頁標籤或其他網頁，支援 SVG 圖形與 Bootstrap Icons。
- **快捷鍵**：錄影時不必伸手找按鈕。

## 安裝

把 `ink-pen.js` 放進專案，在頁面中引入即可。放在 `<head>` 或 `<body>` 結尾都可以。

```html
<script src="ink-pen.js"></script>
```

## 快速開始

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <script src="ink-pen.js"></script>
</head>
<body>
  <ui-ink-layer></ui-ink-layer>
  <ui-ink-bar></ui-ink-bar>

  <h2 id="part2">Part 2</h2>
  <p>Describe a time when you <ink-handwrite answer="helped">________</ink-handwrite> someone.</p>

  <dot-go href="#part2" theme="pink" dot-style="star-fill">Part 2</dot-go>
</body>
</html>
```

按 `1` 開啟觸控筆，按 `0` 回到一般點選。

## 元件

### `<ui-ink-layer>` 全頁繪圖層

覆蓋整個視窗的畫布，關閉時不攔截任何點擊。

| 屬性 | 值 | 說明 |
|---|---|---|
| `data-anchor` | `viewport`（預設）、`document` | `viewport` 讓筆跡貼著視窗；`document` 讓筆跡貼著內容，捲動時跟著段落走 |

兩種模式可隨時切換，既有筆跡會依當下捲動量自動換算座標，切換瞬間畫面不會跳動。

| 方法 | 說明 |
|---|---|
| `setMode(mode)` / `getMode()` | `pen`、`laser`、`off` |
| `setColor(key)` / `getColor()` | 配色表名稱或色碼 |
| `setWidth(px)` / `getWidth()` | 筆跡粗細，範圍 3 至 12，預設 3 |
| `setAnchor(mode)` / `getAnchor()` | 切換座標模式 |
| `clear()` | 清除全部筆跡 |
| `isEmpty()` | 是否沒有任何筆跡 |

觸控筆有壓感時線寬會隨壓力變化，滑鼠則維持固定寬度。

### `<ui-ink-bar>` 迷你工具列

| 屬性 | 值 | 說明 |
|---|---|---|
| `data-pos` | `br`（預設）、`bl`、`tr`、`tl` | 擺放位置 |
| `data-open` | `true` | 載入時直接展開，預設收合 |
| `extra-color` | `#RGB`、`#RRGGBB` | 追加一個自訂筆色，載入時自動選用 |
| `extra-label` | 文字 | 自訂筆色的顯示名稱，省略時顯示色碼 |

| 方法 | 說明 |
|---|---|
| `setMode(mode)` | 切換模式並同步按鈕狀態 |
| `toggleBar(force)` | 收合或展開，不帶參數時切換 |
| `setExtraColor(hex, label)` | 程式端追加或更換自訂色，傳空值則移除 |
| `setAnchor(mode)` / `getAnchor()` | 繪圖層座標模式的便捷入口 |
| `clear()` | 清除繪圖層筆跡 |

### `<ink-handwrite>` 行內手寫空格

```html
<ink-handwrite>__________</ink-handwrite>
<ink-handwrite answer="particularly">____________</ink-handwrite>
<ink-handwrite data-slots="16"></ink-handwrite>
```

| 屬性 | 說明 |
|---|---|
| 標籤內底線 | 底線數量決定空格寬度，半形 `_` 與全形 `＿` 皆可 |
| `data-slots` | 直接指定格數，優先於底線 |
| `answer` | 解答文字。設定後空格右側會出現小圓點，點擊可顯示或收起解答 |

格數範圍 8 至 255，超出會自動收斂。沒寫底線也沒設 `data-slots` 時，以答案長度推算，再沒有則用 10 格。

解答比空格長時會等比縮小，下限 0.6 倍，縮到下限仍放不下會在 console 提醒加長底線。顯示解答會覆蓋該空格的手寫筆跡。

| 方法 | 說明 |
|---|---|
| `setInk(dataUrl)` / `getInk()` / `hasInk()` / `clearInk()` | 存取手寫筆跡圖片 |
| `showAnswer()` / `hideAnswer()` / `toggleAnswer()` | 控制解答顯示 |
| `hasAnswer()` / `answerShown()` | 查詢解答狀態 |
| `slots` / `answer` | 唯讀屬性 |

### `<ui-ink-modal>` 手寫視窗

第一次需要時自動建立，不必手動放置。畫布比例會貼近目標空格，寫完按「確認填入」後，筆跡裁切成最小外框再以圖片填回空格。確認時沒有書寫，等同清空該空格。

筆跡粗細範圍 4 至 24，預設 10。色彩選單會跟著工具列，包含 `extra-color` 自訂色。

### `<dot-go>` 跳轉圓點

```html
<dot-go href="#part2" theme="sky" dot-style="star-fill">Part 2</dot-go>
<dot-go href="lesson-02.html" theme="pink" dot-style="square">下一課</dot-go>
<dot-go href="#part3" theme="ocean" dot-style="icon" icon="bi-translate">翻譯練習</dot-go>
<dot-go href="https://www.ielts.org/" dot-style="icon" icon="bi-box-arrow-up-right" target="_blank"></dot-go>
```

圓點的層級高於繪圖層，所以在觸控筆或雷射筆模式下，筆尖點到圓點一樣會跳轉，不會被畫成一筆。

| 屬性 | 值 | 預設 | 說明 |
|---|---|---|---|
| `href` | `#id` 或網址 | 無 | `#id` 為同頁平滑捲動，並讓目標閃一下外框；其餘當網址跳轉。未設定時圓點停用 |
| `theme` | 配色表名稱、`#RGB`、`#RRGGBB` | `sky` | 圖示與標籤顏色 |
| `dot-style` | `circle`、`circle-fill`、`star`、`star-fill`、`square`、`square-fill`、`icon` | `circle-fill` | 圖示樣式 |
| `icon` | Bootstrap Icons 名稱 | 無 | `dot-style="icon"` 時使用，寫 `bi-translate`、`translate` 或 `bi bi-translate` 皆可 |
| `size` | 10 至 48 | 18 | 圖示大小（px） |
| `target` | `_blank` | 同分頁 | 另開分頁 |
| `offset` | 數字 | 16 | 同頁跳轉時保留的上方距離（px），給固定頁首用 |
| `clear-ink` | 布林屬性 | 不清除 | 跳轉前先清除繪圖層筆跡 |

標籤內的文字會顯示在圖示右側當標籤，留空則只顯示圖示。

使用 `dot-style="icon"` 時，若頁面還沒引入 Bootstrap Icons，元件會自動從 jsDelivr 載入一次；已引入則不重複載入。缺少 `icon` 屬性時退回 `circle-fill`。

| 方法 | 說明 |
|---|---|
| `go()` | 以程式觸發跳轉 |
| `href` / `internal` / `dotStyle` / `size` / `color` | 唯讀屬性 |

## 事件

所有事件都會冒泡，可在 `document` 統一監聽。

| 事件 | 觸發時機 | `detail` |
|---|---|---|
| `ink-written` | 手寫視窗確認填入 | `{ el, dataUrl, empty, slots }` |
| `ink-answer` | 解答顯示或收起 | `{ el, shown, answer, slots }` |
| `dot-go` | 跳轉前，可 `preventDefault()` 取消 | `{ el, href, internal, target }` |

```js
document.addEventListener('dot-go', function (e) {
  if (e.detail.href === '#draft') e.preventDefault();
});
```

## 全域介面 `window.InkPen`

| 成員 | 說明 |
|---|---|
| `layer()` / `bar()` / `modal()` | 取得各元件實體 |
| `blanks()` | 頁面上所有 `<ink-handwrite>` |
| `answerBlanks()` | 有設定 `answer` 的空格 |
| `clearBlanks()` | 清除所有空格的手寫筆跡 |
| `showAnswers(on)` | 顯示或收起所有解答 |
| `toggleAnswers()` | 只要還有沒顯示的就全部顯示，否則全部收起 |
| `dots()` | 頁面上所有 `<dot-go>` |
| `dotStyles` | 支援的圖示樣式清單 |
| `palette` / `penColorOptions` | 配色表與筆色選單 |
| `widthRange` / `handwriteRange` / `slotRange` | 各項數值範圍 |

## 快捷鍵

手寫視窗開啟時，或游標停在輸入框內時，快捷鍵不會作用。

| 按鍵 | 功能 |
|---|---|
| `1` | 觸控筆 |
| `3` | 雷射筆 |
| `0` | 關閉繪圖，回到一般點選 |
| `C` | 清除全部筆跡 |
| `H` | 收合或展開工具列 |
| `A` | 顯示或收起全部解答 |
| `Esc` | 關閉手寫視窗 |

## 配色表

`theme` 與筆色可使用以下名稱：

| 名稱 | 色碼 | 名稱 | 色碼 |
|---|---|---|---|
| `bg` | `#0C0D0C` | `teal` | `#0DA591` |
| `shell` | `#C6C7BD` | `vanilla` | `#DBEDD8` |
| `lavender` | `#C3A5E5` | `yellow` | `#E3D322` |
| `sky` | `#82C8E5` | `focus` | `#D4FFFC` |
| `warning` | `#E6374B` | `special` | `#B3DE73` |
| `salmon` | `#E5C3B3` | `info` | `#4171BF` |
| `ocean` | `#1CCAE8` | `indigo` | `#7849C9` |
| `safe` | `#27AE60` | `pink` | `#FF91D7` |
| `orange` | `#EDA109` | | |

## 注意事項

- **堆疊環境**：`<dot-go>` 與解答圓點靠 z-index 浮在繪圖層之上。若它們的祖先元素設了 `transform`、`filter`、小於 1 的 `opacity`，或 `position` 搭配 `z-index`，會建立新的堆疊環境，圓點可能被繪圖層蓋住。
- **離線錄影**：`dot-style="icon"` 自動載入 Bootstrap Icons 需要網路。離線使用時，請把 Bootstrap Icons 的 CSS 與字型下載到本機，再用 `<link>` 引入，元件偵測到後就不會再連 CDN。
- **圖示名稱**：Bootstrap Icons 名稱拼錯時會顯示空白，請到 [icons.getbootstrap.com](https://icons.getbootstrap.com/) 核對。
- **Shadow DOM**：元件不使用 Shadow DOM，樣式以 `<style>` 注入 `<head>`，可直接用 CSS 覆寫。

## 示範

`ink-pen-demo-10-31-26.html` 與 `ink-pen.js` 放在同一資料夾，用瀏覽器開啟即可。

## 瀏覽器支援

需要支援 Custom Elements v1 與 Pointer Events 的現代瀏覽器，例如 Chrome、Edge、Firefox、Safari 的近期版本。

## 授權

本專案採用 MIT 授權。

```
MIT License

Copyright (c) 2026 [Your Name]

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
