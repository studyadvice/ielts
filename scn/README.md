# scn 對照與敘事元件：ui-screen、ui-scroll-scene

兩個以語意標籤撰寫的視覺互動元件。每個元件都是單一 `.js` 檔，載入後自動注入樣式，不使用 Shadow DOM。圖示使用 Bootstrap Icons 類別，圖示字型由專案自行載入。顏色屬性都可以直接寫色票名稱，兩者共用同一套漸層外框預設集。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-screen.js` | `<ui-screen>` `<ui-screen-before>` `<ui-screen-after>` | 分隔線對照：拖曳分隔線，左右或上下對照兩組內容。 |
| `ui-scroll-scene.js` | `<ui-scroll-scene>` `<scene-stage>` `<scene-layer>` `<scene-step>` | 捲動敘事：一欄固定舞台，一欄捲動步驟，捲到哪一步舞台就切換狀態。 |
| `ui-screen-demo-11-07-26.html` | | ui-screen 的互動範例、程式碼對照與屬性表。 |
| `ui-scroll-scene-demo-11-07-26.html` | | ui-scroll-scene 的四個情境範例與屬性表。 |

## 目錄

- [ui-screen.js](#ui-screenjs)
- [ui-scroll-scene.js](#ui-scroll-scenejs)
- [一起使用](#一起使用)
- [版本紀錄](#版本紀錄)
- [授權](#授權)

---

## ui-screen.js

`<ui-screen>` 是分隔線對照元件。兩組內容事先用語意標籤定義好，拖曳中間的分隔線就能對照「之前」與「之後」，可以左右分隔，也可以上下分隔。外框、分隔線與把手都支援靜態漸層，用屬性預先配置。

### 結構

```html
<ui-screen>
  <ui-screen-before label="BEFORE">…任意 HTML…</ui-screen-before>
  <ui-screen-after label="AFTER">…任意 HTML…</ui-screen-after>
  <ui-screen-handle>（選用，自訂把手內容）</ui-screen-handle>
</ui-screen>
```

### 屬性：版面與互動

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `orientation` | `horizontal`、`vertical` | `horizontal` | 分隔方向，`vertical` 為上下分隔。 |
| `position` | `0` 到 `100` | `50` | 初始位置（百分比）。之後修改屬性會以動畫移動。 |
| `min`、`max` | `0` 到 `100` | `0`、`100` | 可移動範圍。 |
| `step` | 數字 | `1` | 方向鍵每次移動量，按住 Shift 為十倍。 |
| `snap` | 逗號分隔數字 | 無 | 放開後吸附的刻度，例如 `0,50,100`。 |
| `snap-threshold` | 數字 | `8` | 距離刻度在此百分比內才吸附。 |
| `mode` | `drag`、`handle`、`click`、`hover` | `drag` | `drag`：整個畫面可拖曳；`handle`：只有把手可拖曳，內容可正常操作；`click`：點擊畫面跳位，把手仍可拖曳；`hover`：跟隨滑鼠。 |
| `effect` | `clip`、`squeeze` | `clip` | `clip`：兩層重疊裁切；`squeeze`：兩塊各自縮放，內容重新排版。 |
| `transition` | 毫秒 | `300` | 程式移動、點擊跳位、吸附的動畫時間。 |
| `intro` | 布林 | 無 | 進入畫面時自動擺動一次。 |
| `intro-range`、`intro-duration`、`intro-delay` | 數字 | `18`、`700`、`300` | 擺動幅度（百分比）、每段時間（毫秒）、延遲（毫秒）。 |
| `reset-on-leave` | 布林 | 無 | `hover` 模式下滑鼠離開時回到初始位置。 |
| `disabled` | 布林 | 無 | 鎖定所有互動。 |

### 屬性：尺寸與外框

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `height` | 長度 | 無 | 純數字視為 px。未設定高度與比例時，以 before 內容的自然高度為準。 |
| `aspect-ratio` | 例如 `16/9` | 無 | 長寬比。`squeeze` 模式未設尺寸時預設 `16/9`。 |
| `stage-bg` | 顏色 | `background` | 內容區底色。 |
| `border-width` | 長度 | `0` | 外框粗細。 |
| `border-color` | 顏色 | 無 | 單色外框。 |
| `border-gradient` | 預設名稱、逗號色票、CSS 漸層 | 無 | 靜態漸層外框，優先於 `border-color`。 |
| `border-gradient-angle` | 角度 | `135` | 漸層角度，`conic` 時為起始角度。 |
| `border-gradient-type` | `linear`、`radial`、`conic` | `linear` | 漸層類型。 |
| `radius` | 長度 | `0` | 圓角，內容區會自動扣掉外框粗細。 |
| `shadow` | 布林或 box-shadow 值 | 無 | 只寫屬性使用內建陰影，也可填完整的 box-shadow。 |

### 屬性：分隔線與把手

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `line-width` | 長度 | `3` | 分隔線粗細，`0` 為隱藏。 |
| `line-color` | 顏色 | `yellow` | 分隔線顏色。 |
| `line-gradient`、`line-gradient-angle` | 同 `border-gradient` | 無 | 分隔線漸層，優先於 `line-color`。 |
| `handle-shape` | `circle`、`pill`、`square`、`none` | `circle` | 把手形狀，`pill` 會沿著分隔線方向拉長。 |
| `handle-size` | 長度 | `48` | 把手尺寸。 |
| `handle-bg` | 顏色 | `yellow` | 把手底色。 |
| `handle-gradient`、`handle-gradient-angle` | 同 `border-gradient` | 無 | 把手漸層，優先於 `handle-bg`。 |
| `handle-color` | 顏色 | `background` | 圖示顏色。 |
| `handle-border-width`、`handle-border-color` | 長度、顏色 | `3`、`background` | 把手外框。 |
| `handle-offset` | `0` 到 `100` | `50` | 把手在分隔線上的位置。 |
| `handle-icon` | Bootstrap Icons 名稱，逗號可放兩個 | `caret-left-fill,caret-right-fill` | 左右分隔時的圖示，可省略 `bi-` 前綴，`none` 為不顯示。 |
| `handle-icon-vertical` | 同上 | `caret-up-fill,caret-down-fill` | 上下分隔時的圖示。 |
| `handle-icon-size` | rem | `1.1` | 圖示大小。 |

### 屬性：標籤

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `label-position` | `start`、`center`、`end` | `start` | 標籤在交叉軸的位置：左右分隔時為上、中、下；上下分隔時為左、中、右。 |
| `label-inset` | px | `16` | 標籤離邊緣的距離。 |
| `label-size` | rem | `1` | 標籤字級。 |
| `label-radius` | 長度 | `999` | 標籤圓角。 |
| `label-autohide` | 數字 | 無（只寫屬性為 `15`） | 分隔線接近該側邊緣在此百分比內時，該側標籤淡出。 |

### 圖層與子標籤

| 標籤 | 屬性 | 說明 |
| --- | --- | --- |
| `<ui-screen-before>`、`<ui-screen-after>` | `label` | 標籤文字。 |
| | `label-icon` | 標籤前方的 Bootstrap Icons 圖示。 |
| | `bg` | 圖層底色，未設定時沿用 `stage-bg`。可用顏色、色票名稱，逗號分隔或預設名稱視為由上而下的漸層。 |
| | `label-bg`、`label-color` | 各自的標籤配色。before 預設深底淺字，after 預設 `yellow` 底深字。 |
| `<ui-screen-handle>` | | 自訂把手內容，取代 `handle-icon`。 |
| `<ui-screen-label>` | `free` | 放在 before 或 after 內，可放複雜 HTML 的標籤；加上 `free` 則不自動定位。 |

### 屬性解說

- **漸層預設集**：`warm`、`cool`、`fresh`、`deep`、`candy`、`fire`、`mist`、`sunset`，全部由色票組合而成。也可以寫逗號分隔的色票並帶位置，例如 `key,yellow 60%,urgent`，或直接填完整的 CSS 漸層字串。
- **顏色屬性**：都可直接寫色票名稱（例如 `bg-alternative`），也接受任何 CSS 顏色值。
- **圖片與影片**：直接放在圖層內的 `img`、`video` 會自動填滿並以 `object-fit: cover` 裁切。
- **即時更新**：所有屬性改變時立即重畫；圖層的標籤屬性改變時也會自動更新。
- **鍵盤操作**：把手取得焦點後可用方向鍵、Home、End 移動。
- **樣式範圍**：樣式以單一 `<style id="ui-screen-style">` 注入，內部 class 以 `uis-` 開頭，不會影響其他元件。

### 範例

**左右對照，漸層外框**

```html
<ui-screen height="560" radius="22" border-width="4" border-gradient="warm"
           shadow intro label-autohide>
  <ui-screen-before label="BEFORE｜AI 味"><img src="before.png" alt=""></ui-screen-before>
  <ui-screen-after label="AFTER｜設計過"><img src="after.png" alt=""></ui-screen-after>
</ui-screen>
```

**上下分隔，膠囊把手**

```html
<ui-screen orientation="vertical" height="480" line-gradient="cool"
           handle-shape="pill" handle-bg="background" handle-color="blue" handle-border-color="blue">
  <ui-screen-before label="白天" label-icon="sun-fill">…</ui-screen-before>
  <ui-screen-after label="夜間" label-icon="moon-stars-fill">…</ui-screen-after>
</ui-screen>
```

**擠壓模式**

```html
<ui-screen effect="squeeze" height="420" handle-icon="chevron-left,chevron-right">
  <ui-screen-before label="中文">…</ui-screen-before>
  <ui-screen-after label="English">…</ui-screen-after>
</ui-screen>
```

**只有把手可拖曳，放開吸附**

```html
<ui-screen mode="handle" snap="0,25,50,75,100" border-gradient="fresh" border-gradient-type="conic">
  <ui-screen-before>…</ui-screen-before>
  <ui-screen-after>…</ui-screen-after>
  <ui-screen-handle><i class="bi bi-arrows-move"></i></ui-screen-handle>
</ui-screen>
```

完整的互動範例與程式碼對照，見 `ui-screen-demo-11-07-26.html`。

### 事件

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `ui-screen:change` | `{ position, orientation }` | 位置改變時持續觸發，會冒泡。 |
| `ui-screen:end` | `{ position, orientation }` | 放開、點擊、鍵盤操作或呼叫 `setPosition` 後觸發，已含吸附結果。 |

```js
document.querySelector('ui-screen').addEventListener('ui-screen:end', e => console.log(e.detail.position));
```

### 方法

| 名稱 | 說明 |
| --- | --- |
| `position` | 讀寫目前位置，寫入時以動畫移動。 |
| `orientation` | 讀寫 `horizontal` 或 `vertical`。 |
| `setPosition(n, { animate, silent })` | 移動到指定位置，`animate` 預設 `true`。 |
| `reset(animate)` | 回到 `position` 屬性設定的初始位置。 |
| `toggleOrientation()` | 左右與上下切換。 |
| `replay()` | 重播載入示範動畫。 |
| `refresh()` | 重新套用所有屬性。 |
| `UIScreen.presets`、`UIScreen.palette`、`UIScreen.gradient()` | 取得漸層預設集、色票，或用同一套規則產生漸層字串。 |

---

## ui-scroll-scene.js

`<ui-scroll-scene>` 是捲動敘事元件。畫面分成固定不動的舞台與往下捲的步驟，讀者捲到哪一步，舞台就切換到那一步宣告的狀態：換圖層、聚光、放大、平移，或設定舞台內其他元件的屬性。往回捲時，舞台會依序還原。

### 結構

```html
<ui-scroll-scene>
  <scene-stage>
    <scene-layer id="a">…</scene-layer>   <!-- 有圖層：切換顯示 -->
    <scene-layer id="b">…</scene-layer>
    <!-- 不放 scene-layer 時，舞台內容是一整塊，可聚光、放大與平移 -->
  </scene-stage>
  <scene-step show="a">…步驟文字…</scene-step>
  <scene-step show="b" focus="#x">…</scene-step>
</ui-scroll-scene>
```

### 屬性：版面

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `stage-side` | `left`、`right` | `left` | 舞台在左或右。 |
| `stage-width` | `20` 到 `80` | `55` | 舞台寬度百分比。 |
| `stage-top` | 長度、`auto` | `auto` | 舞台吸頂距離。`auto` 為 24px，頁面上有 `sticky-head` 時再加上它的高度。 |
| `stage-height` | 長度 | 可視高度減上下距離 | 舞台高度。 |
| `gap` | px | `48` | 舞台與步驟欄的距離。 |
| `scroll` | `page`、`self` | `page` | `page` 跟著整頁捲動；`self` 在元件自己的高度內捲動。 |
| `height` | 長度 | `600` | `scroll="self"` 時的元件高度。 |
| `trigger` | `0` 到 `100` | `55` | 觸發線在可視高度的百分比，步驟頂端越過這條線就啟動。 |

### 屬性：步驟欄

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `step-style` | `card`、`line`、`plain` | `card` | 步驟外觀。未啟動的步驟自動變暗。 |
| `step-min-height` | 長度 | 可視高度的 60% | 每一步的最小高度，決定每步需要捲動多久。 |
| `step-gap` | px | `24` | 步驟之間的距離。 |
| `lead`、`tail` | 長度 | 可視高度的 30%、45% | 步驟欄上下的留白，讓第一步和最後一步能捲到觸發線。 |
| `numbered` | 布林 | 無 | 步驟前顯示 01、02 編號。 |
| `accent` | 顏色 | `key` | 目前步驟、導覽與聚光框的顏色。 |
| `nav` | `dots`、`bar`、`none` | `dots` | 舞台邊緣的導覽：可點擊的圓點、進度條或不顯示。 |

### 屬性：舞台

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `layer-transition` | `fade`、`slide`、`zoom`、`none` | `fade` | 圖層切換的預設轉場。 |
| `layer-padding` | px | `32` | 圖層內距。 |
| `transition` | 毫秒 | `600` | 圖層、放大與平移的動畫時間。 |
| `dim` | 顏色 | `rgba(12, 13, 12, 0.82)` | 聚光時其餘部分的遮罩色。 |
| `focus-style` | `both`、`spotlight`、`ring` | `both` | `spotlight` 只變暗；`ring` 只加外框；`both` 兩者都有。 |
| `focus-padding` | px | `8` | 聚光範圍向外擴張的距離。 |
| `zoom-max`、`zoom-padding` | 數字、px | `3`、`24` | 放大倍率上限，以及放大到元素時保留的邊距。 |
| `stage-bg` | 顏色 | `background` | 舞台底色。 |
| `border-width`、`border-color` | 長度、顏色 | `0`、無 | 舞台外框。 |
| `border-gradient` | 預設名稱、逗號色票、CSS 漸層 | 無 | 靜態漸層外框，預設集與 `ui-screen` 相同。 |
| `border-gradient-angle`、`border-gradient-type` | 角度、`linear`、`radial`、`conic` | `135`、`linear` | 漸層角度與類型。 |
| `radius`、`shadow` | 長度、布林或 box-shadow | `16`、無 | 圓角與陰影。 |

### 步驟屬性

| 屬性 | 值 | 延續到後面的步驟 | 說明 |
| --- | --- | --- | --- |
| `show` | 圖層 id | 是 | 切換到指定圖層，預設第一層。 |
| `transition` | `fade`、`slide`、`zoom`、`none` | | 這一步切換圖層時的轉場。 |
| `focus` | CSS 選擇器，逗號可多個 | 否 | 聚光舞台裡的元素，內嵌 SVG 的線條、圓點也可以。 |
| `zoom` | 選擇器、倍率、`x%,y%,倍率` | 否 | 放大到元素、以中心放大，或放大到指定座標。 |
| `pan` | 選擇器 | 否 | 不縮放，只把元素平移到舞台中央，適合長文。 |
| `set` | `選擇器 屬性=值`，分號分隔 | 是 | 設定舞台內元素的屬性，舞台內找不到時改找整頁；`!屬性` 為移除。 |
| `scrub` | `選擇器 屬性 起 迄 單位` | 是（停在終點） | 這一步捲動的過程中，數值從起點連續變到終點。 |
| `source` | template 或元素 id | | 從 `<template>` 複製步驟內容。 |
| `nav-label` | 文字 | | 滑鼠停在導覽圓點上的提示。 |

`<scene-layer>` 預設內容置中，加上 `align="start"` 改為從左上排起。

### 屬性解說

- **狀態累積與還原**：`show`、`set`、`scrub` 的效果從第一步累積計算到目前這一步。元件載入時會記下所有被設定屬性的原始值，往回捲時依序還原，舞台不會停在錯誤的畫面。
- **驅動其他元件**：`set` 與 `scrub` 只是設定屬性，任何用屬性控制的元件都能被捲動驅動，例如 `ui-screen` 的 `position`、`orientation`，或 `ui-steps` 的 `active`。元件本身不需要任何修改。
- **聚光遮罩**：以 SVG 遮罩挖出聚光範圍，可以同時聚光多個元素；遮罩跟著放大與平移一起移動。
- **捲動來源**：同時支援整頁捲動與元件自身捲動，也會偵測頁面上的 `sticky-head`，避免舞台被標題列蓋住。
- **樣式範圍**：樣式以單一 `<style id="ui-scroll-scene-style">` 注入，內部 class 以 `scs-` 開頭。

### 範例

**圖表解析：圖層、聚光、放大**

```html
<ui-scroll-scene stage-width="58" border-width="3" border-gradient="deep" numbered>
  <scene-stage>
    <scene-layer id="chart"><svg>…<circle id="cross" …/></svg></scene-layer>
    <scene-layer id="model"><p><span id="s1">…</span><span id="s2">…</span></p></scene-layer>
  </scene-stage>
  <scene-step show="chart">先看整體趨勢。</scene-step>
  <scene-step zoom="#cross" focus="#cross">關鍵交叉點。</scene-step>
  <scene-step show="model" transition="slide" focus="#s1,#s2">範文的開頭與概述。</scene-step>
</ui-scroll-scene>
```

**閱讀定位：長文平移**

```html
<ui-scroll-scene stage-side="right" stage-bg="vanilla" step-style="line" stage-height="520">
  <scene-stage><article>…<p id="pC">… <span id="k1">the price of a hotel room</span> …</p>…</article></scene-stage>
  <scene-step pan="#pC" focus="#k1">Which paragraph mentions saving money on accommodation?</scene-step>
</ui-scroll-scene>
```

**固定高度區塊內捲動**

```html
<ui-scroll-scene scroll="self" height="560" nav="bar" layer-transition="zoom">…</ui-scroll-scene>
```

完整的互動範例與程式碼，見 `ui-scroll-scene-demo-11-07-26.html`。

### 事件

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `scene:enter` | `{ index, id, step }` | 進入某一步時觸發，會冒泡。 |
| `scene:progress` | `{ index, progress }` | 有 `scrub` 的步驟捲動時持續觸發，`progress` 為 0 到 1。 |

```js
document.querySelector('ui-scroll-scene').addEventListener('scene:enter', e => console.log(e.detail.index));
```

### 方法

| 名稱 | 說明 |
| --- | --- |
| `index` | 目前步驟，從 0 起算；尚未進入第一步時為 -1。 |
| `steps` | 所有 `<scene-step>` 元素。 |
| `goTo(n, { smooth })` | 捲到第 n 步，`smooth` 預設 `true`。 |
| `next()`、`prev()` | 下一步、上一步。 |
| `refresh()` | 重新套用屬性與版面。 |
| `UIScrollScene.presets`、`UIScrollScene.palette` | 取得漸層預設集與色票。 |

---

## 一起使用

舞台裡放 `ui-screen`，用 `scrub` 讓分隔線隨捲動滑開，再用 `set` 在指定步驟改變它的方向。往回捲時，`ui-screen` 的屬性會還原。

```html
<script src="ui-screen.js"></script>
<script src="ui-scroll-scene.js"></script>

<ui-scroll-scene nav="bar">
  <scene-stage>
    <scene-layer>
      <ui-screen id="upg" position="100" mode="handle" style="width:100%;height:100%">
        <ui-screen-before label="普通回答">…</ui-screen-before>
        <ui-screen-after label="高分回答">…</ui-screen-after>
      </ui-screen>
    </scene-layer>
  </scene-stage>
  <scene-step>先讀普通回答。</scene-step>
  <scene-step scrub="#upg position 100 0">往下捲，換成高分版本。</scene-step>
  <scene-step set="#upg orientation=vertical; #upg position=50">改成上下對照。</scene-step>
</ui-scroll-scene>
```

`ui-screen` 的 `position` 改變時預設會播放動畫，捲動時看起來會稍微落後；需要完全跟手時，給它 `transition="0"`。

---

## 版本紀錄

| 元件 | 版本 | 說明 |
| --- | --- | --- |
| ui-scroll-scene | 1.0.0 | 初版。 |
| ui-screen | 1.0.2 | 外框跟著元件高度撐開，`height="100%"` 可以填滿父元素，例如放進 `scene-layer`。 |
| ui-screen | 1.0.1 | 修正：圖層沒有底色，內容透明時兩層文字互相透出。圖層預設套用 `stage-bg`，並新增圖層屬性 `bg`。 |
| ui-screen | 1.0.0 | 初版。 |

## 授權

MIT License

Copyright (c) 2026 ui-screen contributors

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
