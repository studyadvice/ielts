# sticky-head

`<sticky-head>` 是章節吸頂標題列。放在 `<section>` 的第一層，捲動到這一節時標題列會吸在畫面頂端並縮小，右側出現章節標籤與「回本節」按鈕，底部有本節閱讀進度條；捲出這一節後自動讓給下一節的標題。元件不使用 Shadow DOM，也不依賴其他函式庫。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `sticky-head.js` | `<sticky-head>` | 章節吸頂標題列，附閱讀進度與回到本節。 |

## 目錄

- [屬性：行為](#屬性行為)
- [屬性：外觀](#屬性外觀)
- [屬性解說](#屬性解說)
- [範例](#範例)
- [JavaScript API](#javascript-api)

## 屬性：行為

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `top` | 長度 | `0px` | 吸頂時距離畫面頂端的位置，例如頁面有固定導覽列時設為其高度。 |
| `scope` | CSS 選擇器 | 最近的 `<section>`，沒有時為父元素 | 吸頂與進度條計算的範圍。 |
| `label` | 文字 | 無 | 吸頂後右側顯示的章節標籤。 |
| `top-btn` | 文字 | 無 | 吸頂後右側的按鈕文字，按下平滑捲回本節開頭。 |
| `progress` | `true`、`false` | `true` | 底部本節閱讀進度條。 |
| `auto-hide` | 布林 | 關閉 | 往下捲時收起，往上捲時再出現。 |
| `z` | 整數 | `60` | 圖層順序。 |

## 屬性：外觀

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `accent` | 品牌色名稱或色碼 | `blue` | 進度條、標籤與按鈕的顏色。 |
| `color` | 品牌色名稱或色碼 | `shell` | 標題文字色。 |
| `bg` | 品牌色名稱或色碼 | `background` | 標題列底色。 |
| `opacity` | `0.78` 到 `1` | `0.88` | 標題列底色的不透明度，低於 0.78 時以 0.78 計算。 |
| `blur` | 數字（px） | `6` | 吸頂時背景模糊程度，`0` 關閉。 |
| `shadow` | `true`、`false` | `true` | 吸頂時的陰影。 |
| `size` | 長度 | `1.75rem` | 未吸頂時的標題字級。 |
| `size-stuck` | 長度 | `1.125rem` | 吸頂時的標題字級。 |
| `padding` | CSS `padding` 值 | `16px 20px` | 未吸頂時的內距。 |
| `padding-stuck` | CSS `padding` 值 | `8px 20px` | 吸頂時的內距。 |
| `bar-height` | 數字（px） | `3` | 進度條高度。 |

## 屬性解說

- **放置位置**：必須是 `<section>` 的直接子元素，吸頂範圍才會被這一節限制住；捲出這一節時標題列會跟著離開。
- **祖先的 `overflow`**：任何祖先元素的 `overflow` 不是 `visible` 時，`position: sticky` 會失效，元件會在主控台警告並指出是哪個元素。
- **不閃爍**：外框高度固定，縮放只發生在內層，文件總高度不會隨動畫改變；捲動方向用累積位移判斷，不會被瀏覽器的捲動補償誤判。
- **狀態屬性**：吸頂時元件帶 `data-stuck="true"`，被 `auto-hide` 收起時帶 `data-hidden="true"`，可用來另外寫樣式。

## 範例

**基本用法**

```html
<section id="lesson-1">
  <sticky-head label="Lesson 1" top-btn="回本節">
    <h2>主幹保證加附加資訊</h2>
  </sticky-head>
  <p>……本節內容……</p>
</section>
```

**配色與進度條高度**

```html
<section>
  <sticky-head accent="yellow" color="vanilla" label="Lesson 2" top-btn="回本節" bar-height="5px">
    <h2>連接詞的位置</h2>
  </sticky-head>
  <p>……</p>
</section>
```

**有固定導覽列的頁面**

```html
<nav style="position:fixed;top:0;height:56px">……</nav>
<section>
  <sticky-head accent="green" top="56px" label="Part 2" top-btn="回本節" opacity="0.95" blur="0">
    <h2>描述題的結構</h2>
  </sticky-head>
  <p>……</p>
</section>
```

**往下捲時自動收起**

```html
<section>
  <sticky-head accent="energetic" auto-hide label="Part 3" top-btn="回本節" shadow="false"
               size="2rem" size-stuck="1rem" padding-stuck="6px 16px">
    <h2>延伸討論</h2>
  </sticky-head>
  <p>……</p>
</section>
```

## JavaScript API

```js
document.querySelector('sticky-head').scrollToSection();  // 捲回本節開頭
document.querySelector('sticky-head').refresh();          // 改了屬性後重新套用與量測

StickyHead.refresh();     // 重新整理頁面上所有標題列
StickyHead.remeasure();   // 內容高度改變後重新量測
StickyHead.all();         // 頁面上所有 <sticky-head>
StickyHead.palette;       // 品牌色
StickyHead.version;       // 版本
```
