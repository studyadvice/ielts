# ui-timeline

`<ui-timeline>` 是圓點時間軸：每一項左側一個圓點，以直線相連，上方小字是 `sub-heading`，元件最上方是 `heading`。內建九套主題，可以逐一出現或逐一點亮，最後的連結可展開頁面上隱藏的 `<div>` 或 `<template>`。元件不使用 Shadow DOM。

| 檔案 | 標籤 | 用途 | 範例頁 |
| --- | --- | --- | --- |
| `ui-timeline.js` | `<ui-timeline>` `<tl-item>` | 圓點時間軸。 | [`ui-timeline-demo-11-14-26.html`](ui-timeline-demo-11-14-26.html) |

## 快速開始

```html
<script src="tl/ui-timeline.js"></script>

<ui-timeline heading="最新更新紀錄" theme="arc" play-mode="reveal" autoplay="visible"
             more-text="查看全部紀錄" more-target="#all-log">
  <tl-item sub-heading="2 小時前">ui-play 新增<c-key>小畫家外框</c-key></tl-item>
  <tl-item sub-heading="5 小時前">稿紙外框改為深色</tl-item>
  <tl-item sub-heading="Step 3" color="pink">內容可寫任何 HTML</tl-item>
</ui-timeline>

<template id="all-log"> ……點擊後才出現的內容，可放其他元件…… </template>
```

元件標題用 `heading` 而不是 `title`，因為 `title` 是 HTML 全域屬性，滑鼠移上去會跳出瀏覽器提示框。

## 主題

| 主題 | 來源 | 圓點配色 |
| --- | --- | --- |
| `arc`（預設） | 你的色票 | key、blue、quiet、indigo、violet、dreamy、pink、playful，冷到暖，循環使用 |
| `cool` | 你的色票 | energetic、green、key、calm、blue、quiet、indigo、violet，循環使用 |
| `warm` | 你的色票 | yellow、playful、red、urgent、pink、dreamy、violet、indigo，循環使用 |
| `ember` | 另配 | 琥珀到深紫紅，越上面越亮 |
| `ocean` | 另配 | 淺青到深海藍，越上面越亮 |
| `forest` | 另配 | 嫩黃綠到墨綠，越上面越亮 |
| `dusk` | 另配 | 蜜桃到暮紫，越上面越亮 |
| `aurora` | 另配 | 綠、藍、紫、粉的色相漸變 |
| `mono` | 另配 | 米白到深灰，越上面越亮 |

另配的六套會依實際項目數重新計算漸層，項目多或少都從頭均勻變到尾。每套主題也一併決定底色、連接線與文字色，都可以用屬性覆寫。

## 形狀

`dot-shape` 設定整個元件的圓點形狀，單一項目可用 `shape` 覆寫。所有形狀都支援主題配色、`reveal` 與 `highlight`。

| 形狀 | 樣子 | 備註 |
| --- | --- | --- |
| `circle`（預設） | 實心圓 | |
| `square`、`rounded` | 方形、圓角方形 | |
| `diamond` | 菱形 | |
| `ring`、`ring-square` | 空心圓、空心方形 | 框線粗細用 `ring-width` |
| `triangle`、`hexagon`、`star` | 三角形、六角形、星形 | |
| `number` | 圓形內加數字 | 預設 1、2、3，單項用 `dot-text` 改成任何字；數字顏色用 `number-color` |
| `icon` | Bootstrap Icons 圖示 | 全部用 `dot-icon`，單項用 `icon`；頁面需載入 Bootstrap Icons |

`number` 與 `icon` 未設 `dot-size`、`dot-top` 時，自動改為 `22` 與 `1`。

```html
<ui-timeline theme="dusk" dot-shape="number">
  <tl-item sub-heading="5 分鐘">讀題</tl-item>
  <tl-item sub-heading="5 分鐘" dot-text="✓">檢查</tl-item>
  <tl-item sub-heading="完成" shape="star" color="yellow">交卷</tl-item>
</ui-timeline>
```

## 屬性

### `<ui-timeline>`：內容與外觀

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `heading` | 無 | 元件最上方的標題。 |
| `theme` | `arc` | 見上表。 |
| `dot-colors` | 無 | 自訂圓點色，以 `\|` 分隔，色名或色碼，不夠時循環。 |
| `bg-color` | 依主題 | 底色，`none` 為透明。 |
| `line-color`、`heading-color`、`sub-color`、`text-color`、`more-color` | 依主題 | 連接線、標題、sub-heading、內容、連結文字的顏色。 |
| `dot-shape` | `circle` | 圓點形狀，見「形狀」。 |
| `dot-icon`、`ring-width`、`number-color` | `bi-circle-fill`、`3`、同底色 | icon 的預設圖示、ring 的框線粗細、number 的數字顏色。 |
| `dot-size`、`dot-top`、`gap` | `12`、`6`、`16` | 圓點直徑、圓點距項目頂端、項目間距（px）。 |
| `width`、`padding`、`radius` | `100%`、`20 24`、`12` | 寬度、內距（px，最多四個值）、圓角。 |
| `font-size`、`heading-size` | `1`、`1.25` | 內容與標題字級，純數字視為 rem。 |

### `<ui-timeline>`：播放

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `play-mode` | 無 | `reveal` 逐一出現、`highlight` 逐一點亮；不寫為靜態。 |
| `autoplay` | `false` | `true` 載入即播、`visible` 捲到畫面中才播、`false` 點時間軸才播。 |
| `interval` | `800` | 每一項之間的間隔（ms）。 |
| `speed` | `400` | 單一項目的動畫時間（ms）。 |
| `effect` | `fade` | `fade`、`slide-up`、`slide-left`、`none`；也用於展開內容。 |
| `loop` | 關閉 | 只對 `highlight` 有效。 |

`reveal` 播完才出現連結；`highlight` 變暗的項目用不透明混色，不使用透明度。

### `<ui-timeline>`：查看全部

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `more-target` | 無 | 要展開的 `<div>` 或 `<template>`，寫不寫 `#` 都可以。沒設定就不顯示連結。 |
| `more-text`、`less-text` | `查看全部紀錄`、`收合` | 展開前、展開後的連結文字。 |
| `more-arrow` | `true` | `false` 不顯示 → 與 ↑。 |
| `more-mode` | `toggle` | `toggle` 可收合；`once` 展開後連結消失。 |

- `<div>`：載入時自動隱藏，展開時在原位置出現。
- `<template>`：第一次展開才把內容放到元件正下方，裡面的元件此時才初始化；之後只切換顯示，保留狀態。
- 展開後會觸發一次 `resize`，讓原本隱藏時量不到尺寸的元件重新排版。需要量尺寸的元件建議放在 `<template>` 裡。

### `<tl-item>`

| 屬性 | 說明 |
| --- | --- |
| `sub-heading` | 項目上方小字，時間、步驟名稱或任何文字。 |
| `color` | 單獨指定這一項的圓點色。 |
| `shape` | 單獨指定這一項的形狀。 |
| `dot-text` | `number` 形狀裡顯示的文字。 |
| `icon` | `icon` 形狀的圖示。 |

內容可寫任何 HTML，支援 `<c-key>` 等色名標籤。

## 事件與方法

| 名稱 | 說明 |
| --- | --- |
| `timeline-end` | 播完時發出（`loop` 時不發出）。link-when 的 `event="done"` 會自動對應。 |
| `timeline-more` | 展開或收合時發出，`detail.open` 為 `true` 或 `false`。 |
| `el.play()`、`el.stop()`、`el.toggleMore(open)` | 開始播放、停止並顯示全部、展開或收合。link-when 的 `do="play"` 可直接使用。 |

## 授權

MIT License
