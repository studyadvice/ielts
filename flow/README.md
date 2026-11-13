# flow 流程與播放元件：ui-play、ui-stream、ui-orbit

三個以語意標籤撰寫的播放型元件，適合教學頁面與螢幕錄影。每個元件都是單一 `.js` 檔，載入後自動注入樣式，不使用 Shadow DOM。圖示使用 Bootstrap Icons，請在頁面上自行載入圖示字型。顏色屬性都可以直接寫色票名稱（例如 `key`、`bg-alternative`），也可以寫任何 CSS 顏色。

| 檔案 | 標籤 | 用途 | 範例頁 |
| --- | --- | --- | --- |
| `ui-play.js` | `<ui-play>` `<stage-item>` `<script-item>` 與各種 `-fx` | 教學錄影用的模擬畫面播放器：在既有內容上依劇本標記、註解、蓋印章、改寫，鍵盤控制節奏。 | [`ui-play-demo-11-13-26.html`](ui-play-demo-11-13-26.html) |
| `ui-stream.js` | `<ui-stream>` `<stream-role>` `<stream-item>` | 聊天室回放式的內容流，逐則出現、逐字打出、暫停後揭露答案。 | [`ui-stream-demo-11-13-26.html`](ui-stream-demo-11-13-26.html)、[`ui-stream-demo-11-11-26.html`](ui-stream-demo-11-11-26.html) |
| `ui-orbit.js` | `<ui-orbit>` `<orbit-core>` `<orbit-item>` | 核心概念居中，相關想法沿軌道環繞；點一個想法，它會停進右側插槽並顯示說明。 | [`ui-orbit-demo-11-11-26.html`](ui-orbit-demo-11-11-26.html) |

三個元件同時使用的範例：[`flow-trio-demo-11-11-26.html`](flow-trio-demo-11-11-26.html)。

## 目錄

- [ui-play.js](#ui-playjs)
- [ui-stream.js](#ui-streamjs)
- [ui-orbit.js](#ui-orbitjs)
- [授權](#授權)

---

## ui-play.js

`<ui-play>` 是給老師錄影用的模擬畫面。畫面內容寫在 `<stage-item>` 裡，可以是任何 HTML；播放的步驟寫在 `<script-item>` 裡，每個步驟是一個 `-fx` 標籤，直接作用在舞台上的既有內容：標記、註解、蓋印章、改寫文字、淡入淡出。錄影時用鍵盤推進，要重錄就重新整理頁面。

### 快速開始

```html
<script src="ui-play.js"></script>

<ui-play frame="win" frame-title="Task 2 修改示範">
  <stage-item>
    <p id="s1">Technology is very good for society.</p>
  </stage-item>
  <script-item>
    <mark-fx target="#s1" text="very good" kind="underline" color="red"></mark-fx>
    <stamp-fx target="#s1" text="very good" start="with">大錯特錯</stamp-fx>
    <pause-fx></pause-fx>
    <swap-fx target="#s1" text="very good" to="indispensable"></swap-fx>
  </script-item>
</ui-play>
```

點一下元件選定它，再按空白鍵或右方向鍵推進。頁面上有多個 `<ui-play>` 時，鍵盤只控制最後點選的那一個。

### 播放節奏

每個 `-fx` 都有 `start` 屬性，觀念同 PowerPoint 動畫：

| `start` | 意思 |
| --- | --- |
| `click` | 等按鍵才開始（按一下時） |
| `with` | 和上一個效果同時開始（與前動畫同時） |
| `after` | 上一個效果結束後自動開始（接續前動畫） |

沒寫 `start` 時依 `step-mode` 決定：`manual` 預設 `click`，`mixed`、`auto` 預設 `after`。`<pause-fx>` 會讓下一個效果改為等按鍵。`step-mode="auto"` 忽略所有等按鍵的地方，從頭自動播完。

### `<ui-play>` 屬性：尺寸與版面

長度屬性只寫數字時視為 px。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `width` | `100%` | 元件寬度。`phone` 外框預設 `390px`。 |
| `height` | 自動 | 固定高度。 |
| `min-height` | `240px` | 最小高度。 |
| `aspect` | 無 | 固定比例，例如 `16/9`，設了就忽略 `height`。 |
| `padding` | `32px` | 內容區內距。 |
| `content-align` | `left` | `left`、`center`、`right`。 |
| `content-valign` | `top` | `top`、`middle`、`bottom`。 |

### `<ui-play>` 屬性：外框

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `frame` | `plain` | `none`、`plain`、`mac`、`win`（Windows 11）、`win-classic`（Windows 98）、`browser`、`phone`、`paper`（稿紙）、`sheet`（試算表）、`notebook`（筆記本分頁）。 |
| `frame-title` | 無 | 標題列文字；`phone` 外框顯示在時間位置。 |
| `frame-icon` | 無 | 標題列圖示，Bootstrap Icons 類別，例如 `bi-file-earmark-text`。 |
| `frame-url` | 無 | `browser` 外框網址列文字。 |
| `border-width` | `1px` | 外框粗細；`win`、`mac` 為 `2px`。 |
| `border-style` | `solid` | `solid`、`dashed`、`dotted`、`double`。 |
| `border-color` | `bg-alternative` | 外框顏色。 |
| `radius` | `10px` | 圓角。 |
| `bg-color` | `background` | 內容區背景。 |
| `bar-color` | `bg-alternative` | 標題列背景；`sheet` 為欄列標頭背景，`notebook` 為分頁列背景。 |
| `bar-text-color` | `shell` | 標題列文字。 |

**稿紙 `paper`**

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `rule-color` | `calm` | 橫線顏色。 |
| `margin-line-width` | `3px` | 左側紅線粗細。 |
| `margin-line-color` | `red` | 左側紅線顏色。 |

稿紙內的段落、清單、標題間距會歸零，讓每行文字坐在橫線上。

**試算表 `sheet`**

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `cell-width`、`cell-height` | `96px`、`34px` | 儲存格寬高。未設 `line-height` 時，行高等於 `cell-height`。 |
| `grid-color` | `bg-alternative` | 格線顏色。 |
| `row-header-width` | `48px` | 列號寬度。 |
| `column-header-height` | `30px` | 欄名高度。 |
| `header-line-color` | `background` | 標頭分隔線顏色。 |
| `corner-color` | `gray` | 左上角三角形顏色。 |

舞台元素加上 `cell="B3"` 或 `cell="A1:D1"` 就會對齊到儲存格。

```html
<ui-play frame="sheet" cell-width="104">
  <stage-item>
    <div cell="A1:D1">Coffee sales (tons)</div>
    <div cell="B3" id="peak" style="text-align:right">260</div>
  </stage-item>
  <script-item>
    <mark-fx target="#peak" kind="circle"></mark-fx>
  </script-item>
</ui-play>
```

**筆記本 `notebook`**

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `tabs` | `快速筆記` | 分頁名稱，以 `\|` 分隔。 |
| `tab-colors` | `green\|blue\|playful\|violet\|pink\|key` | 分頁顏色，以 `\|` 分隔，不夠時循環使用。 |
| `tab-active` | `1` | 目前分頁（從 1 起算），底線顏色跟著它。 |
| `tab-add` | `true` | 是否顯示「+」分頁。 |
| `search` | `搜尋筆記本` | 搜尋框提示文字，`false` 不顯示搜尋框。 |
| `search-width` | `280px` | 搜尋框寬度。 |

### `<ui-play>` 屬性：文字

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `font-family` | 系統字體 | 內容字體。 |
| `font-size` | `1.25rem` | 內容字級。 |
| `line-height` | `1.7` | 行高。 |
| `text-color` | `shell` | 文字顏色；`paper` 為 `background`。 |
| `accent-color` | `key` | 註解外框與按鈕的主色。 |

### `<ui-play>` 屬性：播放

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `autoplay` | `false` | `true` 載入即播、`visible` 進入畫面才播、`false` 等第一次按鍵。 |
| `step-mode` | `mixed` | `manual`、`mixed`、`auto`，見「播放節奏」。 |
| `step-delay` | `600` | `after` 步驟之間的間隔（ms）。 |
| `rate` | `1` | 播放倍率。 |
| `keyboard` | `true` | 是否啟用鍵盤。 |
| `key-next` | `Space,ArrowRight` | 下一步按鍵，逗號分隔，可寫 `KeyN` 或 `n`。 |
| `controls` | `none` | 播放／暫停按鈕：`none`、`hover`（滑鼠移入才出現）、`always`。 |
| `controls-position` | `bottom` | `bottom`、`top`、`outside`（框外）。 |
| `sound` | `on` | 全域音效開關。 |
| `volume` | `0.6` | 音量 0 到 1。 |
| `end-target` | 無 | 播完後顯示的元素 id（寫不寫 `#` 都可以），通常先設 `hidden`。 |
| `end-effect` | `fade` | 顯示效果，選項同 `show-fx`。 |
| `end-speed` | `400`（`fade` 650、`pop` 550） | 動畫時間（ms）。 |
| `end-delay` | `0` | 播完後等多久才顯示（ms）。 |

### 效果標籤共用屬性

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `start` | 依 `step-mode` | `click`、`with`、`after`。 |
| `delay` | `0` | 開始前等待（ms）。 |
| `name` | 無 | 效果名稱，供 `remove-fx` 移除。 |
| `target` | 必填 | 目標元素的 CSS 選擇器，先找舞台內，找不到再找整頁。 |
| `text` | 無 | 目標內的子字串，只作用在這段文字上，不必另外包 `<span>`。 |
| `nth` | `1` | 子字串出現多次時，指定第幾個。 |

標記、印章、註解都以「文字實際所在的範圍」對齊，不是整個區塊的寬度；文字改變造成重新排版時，已畫好的效果會自動跟著移動。

### 效果標籤

**`<show-fx>`、`<hide-fx>`：出現與消失**

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `effect` | `fade` | `fade`（由模糊轉清晰並微微上浮）、`slide-up`、`slide-down`、`slide-left`、`slide-right`、`zoom`、`pop`（放大回彈）、`wipe`。 |
| `speed` | `400`（`fade` 650、`pop` 550） | 動畫時間（ms）。 |
| `distance` | `24px` | 滑入距離。 |
| `collapse` | 布林 | 隱藏時不保留空間。 |

被 `show-fx` 指定的元素在播放前會自動先隱藏。

**`<mark-fx>`：標記**

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `kind` | `highlight` | `highlight`、`underline`、`circle`、`box`、`strike`、`bracket`。 |
| `color` | `yellow` | 顏色。 |
| `text-color` | `background` | `highlight` 時目標文字改成的顏色。 |
| `thickness` | `3` | 線條粗細。 |
| `rough` | `0.5` | 手繪感 0 到 1，0 是工整直線。 |
| `seed` | 自動 | 手繪亂數種子，同一個值每次畫出一樣的線。 |
| `padding` | `4` | 標記超出文字的範圍。 |
| `speed` | `600` | 畫出所需時間（ms）。 |

**`<note-fx>`：註解泡泡**

註解內容寫在標籤內，可含行內 HTML。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `position` | `auto` | `top`、`bottom`、`left`、`right`、`auto`。 |
| `offset-x`、`offset-y` | `0` | 位置微調。 |
| `color`、`bg-color`、`border-color` | `vanilla`、`bg-alternative`、`accent-color` | 文字、背景、外框顏色。 |
| `font-size` | `1rem` | 字級。 |
| `max-width` | `320px` | 最大寬度。 |
| `pointer` | `true` | 是否顯示指向目標的小尖角。 |
| `speed` | `300` | 出現動畫時間（ms）。 |
| `stay` | `forever` | 停留多久後消失（ms）。 |
| `fade-out` | `300` | 消失時的淡出時間（ms）。 |

**`<stamp-fx>`：印章**

印章文字寫在標籤內，用 `|` 分行；直書時每行成為一欄，由右往左排。標籤內容留空並設定 `icon`，就是純圖示印章。墨跡斑駁以挖空方式產生，不使用半透明。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `anchor` | `center` | 對齊目標的位置：`center`、`top-left`、`top-right`、`bottom-left`、`bottom-right`、`left`、`right`、`top`、`bottom`。 |
| `offset-x`、`offset-y` | `0` | 從對齊點再偏移。 |
| `color` | `red` | 印泥顏色。 |
| `size` | `1.4rem` | 印章字級，整個印章依此縮放。 |
| `font-family` | 系統字體 | 印章字體。 |
| `letter-spacing` | `6px` | 字距。 |
| `direction` | `horizontal` | `horizontal`、`vertical`。 |
| `shape` | `round` | `rect`、`round`、`circle`、`ellipse`。 |
| `padding` | `6px 16px` | 文字到外框的距離。 |
| `border-width` | `3` | 外框粗細。 |
| `inner-border` | `single` | 內圈細框：`none`、`single`、`double`。 |
| `rotate` | `-8` | 角度（deg），或 `random`。 |
| `rotate-range` | `12` | `random` 時的隨機範圍（正負）。 |
| `icon` | 無 | Bootstrap Icons 名稱，例如 `bi-hand-thumbs-up`。 |
| `icon-position` | 橫書 `left`、直書 `top` | `left`、`right`、`top`、`bottom`。 |
| `icon-size` | `1.1` | 圖示相對文字的倍數。 |
| `icon-gap` | `6px` | 圖示與文字距離。 |
| `ink` | `0.5` | 斑駁程度 0 到 1。 |
| `edge` | `0.4` | 邊緣破損程度 0 到 1。 |
| `bleed` | `0.2` | 墨水暈開程度 0 到 1。 |
| `pressure` | `random` | 用力不均：`even`、`left`、`right`、`top`、`bottom`（該側較淡）。 |
| `seed` | 依文字產生 | 墨跡亂數種子，同一個值每次產生一樣的斑駁，重錄時畫面一致。 |
| `speed` | `380` | 落下所需時間（ms）。 |
| `drop-scale` | `2.6` | 起始放大倍數，越大越像從高處砸下。 |
| `bounce` | `0.3` | 落地回彈程度 0 到 1。 |
| `shake` | `2` | 落地時畫面震動幅度（px），`0` 不震。 |
| `stay` | `forever` | 停留多久後消失（ms）。 |
| `fade-out` | `400` | 消失時的淡出時間（ms）。 |
| `sound` | `on` | `on`（內建蓋章聲）、`off`，或音檔網址。 |

```html
<stamp-fx target="#s2" icon="bi-hand-thumbs-up" color="green">增分利器</stamp-fx>
<stamp-fx target="#s1" icon="bi-x-lg" shape="circle" size="2rem"></stamp-fx>
<stamp-fx target="#s3" shape="rect" direction="vertical">考官|最愛</stamp-fx>
```

**`<swap-fx>`：改寫**

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `to` | 必填 | 替換後的文字。 |
| `mode` | `strike` | `strike` 劃掉舊字、新字接在後面；`replace` 舊字淡出新字淡入；`retype` 逐字刪除再逐字打出。 |
| `del-color`、`ins-color` | `red`、`green` | 舊字、新字顏色。 |
| `speed` | `500`（`retype` 為每字 60） | 動畫時間（ms）。 |

**流程**

| 標籤 | 屬性 | 說明 |
| --- | --- | --- |
| `<wait-fx>` | `ms`（預設 `800`） | 停頓。 |
| `<pause-fx>` | 無 | 下一個效果改為等按鍵。 |
| `<remove-fx>` | `name`（逗號分隔多個）、`speed`（預設 `300`） | 移除指定名稱的 `mark-fx`、`note-fx`、`stamp-fx`。 |

### 事件與方法

| 名稱 | 說明 |
| --- | --- |
| `play-end` 事件 | 播放完畢時觸發，會冒泡；`detail.endTarget` 為 `end-target` 指向的元素。 |
| `el.play()`、`el.pause()` | 開始或繼續、暫停。 |
| `el.next()` | 等同按一次下一步按鍵。 |
| `el.rate` | 讀寫播放倍率（0.1 到 8）。 |

---

## ui-stream.js

`<ui-stream>` 把一段對話做成聊天室回放：訊息逐則出現，可以逐字打出，播到指定的地方停下來，按了才繼續，並可在暫停後揭露參考答案。適合批改過程重播、口說問答示範。

### 快速開始

```html
<script src="ui-stream.js"></script>

<ui-stream title="Speaking Part 2：Describe a river" controls progress autoplay>
  <stream-item from="student" name="Amy">I think the river is very beautiful.</stream-item>
  <stream-item from="teacher" name="老師" typed pause="先想想：老師會先改哪個字？" reveal="ans-1">
    beautiful 太籠統了。
  </stream-item>
  <stream-item from="system">字彙資源 6.0 → 6.5</stream-item>
</ui-stream>

<template id="ans-1">The river <mark>winds through</mark> the valley.</template>
```

內建三個角色：`teacher`（靠右、實心）、`student`（靠左、外框）、`system`（置中、虛線）。訊息內可用 `<mark>` 與 `<c-key>`、`<c-urgent>` 等色名標籤，逐字打出時格式同步出現；`ui-stream.js` 已內建色名標籤樣式。

### `<ui-stream>` 屬性：播放

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `autoplay` | 關 | 載入後自動播放。 |
| `speed` | `30` | 逐字打出時每個字的間隔（ms）。 |
| `delay` | `600` | 一則結束到下一則出現的間隔（ms）。 |
| `start` | `0` | 載入時直接顯示到第幾則。 |
| `loop` | 關 | 播完清空重來。 |
| `type-all` | 關 | 每一則都逐字打出。 |
| `auto-scroll` | 開 | 新內容出現時自動捲到底。 |
| `step` | 關 | 逐則模式：每則播完就停，按「下一則」才繼續。 |

### `<ui-stream>` 屬性：控制列

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `controls` | 關 | 顯示控制列：播放／暫停、下一則、重播。 |
| `controls-position` | `top` | `top`、`bottom`。 |
| `counter` | 開 | 控制列右側的「目前／總數」。 |
| `progress` | 關 | 控制列下方的進度條。 |
| `labels` | `播放,暫停,下一則,重播` | 按鈕文字，`",,,"` 只顯示圖示。 |
| `speed-control` | 關 | 速度選單（0.5x、1x、1.5x、2x）。 |

### `<ui-stream>` 屬性：版面

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `title` | 無 | 元件上方標題。 |
| `title-size` | `1.2rem` | 標題字級，只寫數字視為 rem。 |
| `title-weight` | `700` | 標題粗細。 |
| `title-color` | `violet` | 標題顏色。 |
| `height` | 自動 | 固定高度（px），超出時內部捲動。 |
| `gap` | `14` | 訊息間隔（px）。 |
| `gap-same` | 同 `gap` | 同一角色連續發言的間隔。 |
| `gap-system` | 同 `gap` | system 訊息前後的間隔。 |
| `padding` | `16` | 內容流內距（px）。 |
| `bubble-width` | `78` | 氣泡最大寬度（百分比）。 |
| `bubble-radius` | `12` | 氣泡圓角（px）；`notch` 樣式為切角大小。 |
| `bubble-padding` | `10px 14px` | 氣泡內距。 |
| `bubble-border-width` | `0` | 所有氣泡的邊框粗細（px）。`0` 依樣式預設：`double` 4、`notch` 1.5、`callout` 3、其他 1。 |
| `border-width` | `1` | 整個元件外框粗細（px）。 |
| `bordered` | 開 | 外框與圓角。 |
| `line-height` | `1.6` | 氣泡行高。 |
| `font-size` | `1rem` | 整體字級。 |
| `meta-size` | `0.75rem` | 名稱、時間那一行的字級。 |
| `text-align` | 無 | 訊息內容對齊：`left`、`center`、`right`、`justify`。也可寫在 `stream-role` 或 `stream-item`，越細的優先。 |
| `avatar` | 開 | 顯示頭像。 |
| `avatar-size` | `36` | 頭像直徑（px）。圖片頭像會自動裁切縮放成圓形。 |
| `avatar-position` | `top` | `top` 和名稱列對齊、`bottom` 和氣泡底對齊。 |
| `avatar-repeat` | `all` | 同一人連續發言：`all` 每則顯示頭像；`first` 只在第一則；`last` 只在最後一則。設為 `first` 或 `last` 時，名字只在連續發言的第一則顯示。 |

### `<ui-stream>` 屬性：色彩與動畫

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `accent` | `key` | 控制列按鈕、進度條、揭露區塊框線。 |
| `border-color` | `bg-alternative` | 外框與控制列分隔線。 |
| `text-color` | `vanilla` | 外框式氣泡的文字色。 |
| `background` | `base` | 內容流與外框式氣泡的底色。 |
| `mark-color` | 無 | 氣泡內 `<mark>` 的底色。 |
| `teacher-color`、`student-color`、`system-color` | `key`、`violet`、`gray` | 內建角色顏色。 |
| `pause-color` | `yellow` | 暫停按鈕顏色。 |
| `animation` | `slide` | `slide`、`pop`、`fade`。 |
| `cursor` | 開 | 逐字打出時的閃爍游標。 |
| `typing-indicator` | 關 | 逐字前先出現「正在輸入」的三個點。 |
| `pause-icon` | `hand-index-thumb` | 暫停按鈕圖示。 |
| `pause-text` | `點一下繼續` | 暫停按鈕預設文字。 |
| `pause-style` | `button` | `button` 在內容流放一顆按鈕；`overlay` 用遮罩蓋住整個內容流。 |

### `<stream-role>`：自訂角色

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `name` | 必填 | 角色代號，`stream-item` 的 `from` 用這個。 |
| `label` | 無 | 預設顯示名稱。 |
| `color` | `shell` | 頭像、名稱、氣泡色。 |
| `icon` | `person-fill` | 頭像圖示。 |
| `image` | 無 | 頭像圖片。 |
| `side` | `left` | `left`、`right`、`center`（不顯示頭像）。 |
| `style` | `outline` | 氣泡樣式，見下表。 |
| `text-color` | 自動 | 氣泡文字色。 |
| `text-align` | 無 | 這個角色的訊息對齊。 |

| `style` | 樣式 |
| --- | --- |
| `filled` | 實心。 |
| `outline` | 外框。 |
| `dashed` | 虛線框，文字置中。 |
| `double` | 雙線框。 |
| `notch` | 切角框：靠左切右上角、靠右切左上角，底色是角色色與背景調和的實色。 |
| `callout` | 引線框：粗框外側一條分離的直線，再拉出折線引線指向頭像；頭像在下時引線往下。 |

### `<stream-item>`：訊息

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `from` | `student` | 角色代號。 |
| `name` | 角色 `label` | 顯示名稱。 |
| `time` | 無 | 名稱旁的時間文字。 |
| `badge`、`badge-color` | 無、角色色 | 名稱列的小角標。 |
| `icon`、`image`、`color` | 角色設定 | 只覆寫這一則。 |
| `source` | 無 | 內容改從該 id 的 template 或元素複製。 |
| `typed` | 關 | 逐字打出。 |
| `speed`、`delay`、`gap` | 沿用容器 | 只覆寫這一則。 |
| `pause` | 無 | 這一則之後停下來，值為按鈕文字，空值用 `pause-text`。 |
| `reveal` | 無 | 這一則之後插入該 id 的內容（有 `pause` 時在按下繼續後）。 |
| `reveal-target` | 無 | 搭配 `reveal`，改放進這個元素並顯示它。 |
| `highlight` | 關 | 出現時氣泡閃三下。 |
| `text-align` | 無 | 這一則的對齊。 |

### 資料來源

| 屬性 | 說明 |
| --- | --- |
| `src` | 從網址讀取 JSON。 |
| `data-id` | 從 `window[data-id]` 讀取 JSON。 |

JSON 為陣列，或 `{ roles, items }`。item 的 `text` 為純文字、`html` 為 HTML，其他欄位同屬性的駝峰寫法，例如 `revealTarget`、`textAlign`。全頁預設值可寫在 `window.UiStreamConfig`，鍵名同樣為駝峰式。

### 事件與方法

事件都會冒泡。

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `ui-stream:item` | `{ index, item, role }` | 每一則出現時。 |
| `ui-stream:typed` | `{ index }` | 逐字打完時。 |
| `ui-stream:pause` | `{ index, text }` | 停在暫停點時。 |
| `ui-stream:resume` | `{ index }` | 按下繼續時。 |
| `ui-stream:done` | `{ total }` | 全部播完時。 |

```js
const s = document.querySelector('ui-stream');
s.play(); s.pause(); s.toggle();
s.next();          // 下一則（不逐字）
s.replay();        // 從頭重播
s.finish();        // 立刻顯示全部
s.goto(3);         // 直接顯示到第 3 則
s.add({ from: 'teacher', text: '新訊息' });
s.export('text');  // 匯出文字；'html' 匯出 HTML
s.index; s.total;
```

---

## ui-orbit.js

`<ui-orbit>` 把一個核心概念放在中央，相關想法沿圓形軌道緩慢環繞。點一個想法的圖示或標籤，它會飛進右側插槽，軌道暫停，下方顯示該想法的說明；再點一次插槽裡的圖示，它會回到軌道並繼續轉動。適合腦力激盪、口說 Part 2 的發想示範。

### 快速開始

```html
<script src="ui-orbit.js"></script>

<ui-orbit radius="150" period="40" pause-on-hover>
  <orbit-core icon="lightbulb" label="Describe a hobby" color="yellow"></orbit-core>
  <orbit-item icon="camera" label="Photography" detail="d-photo"></orbit-item>
  <orbit-item icon="bicycle" label="Cycling" detail="d-cycle" color="blue"></orbit-item>
  <orbit-item icon="book" label="Reading" detail="d-read" ring="2"></orbit-item>
</ui-orbit>

<template id="d-photo"><p>可以談器材、拍攝地點、印象最深的一張照片。</p></template>
```

### `<ui-orbit>` 屬性

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `radius` | `150` | 第一圈軌道半徑（px）。 |
| `ring-gap` | 依項目大小 | 圈與圈之間的距離（px）。 |
| `item-size` | `56` | 想法圓圈直徑（px）。 |
| `core-size` | `item-size` 的 2.3 倍 | 核心圓圈直徑（px）。 |
| `label-width` | `170` | 標籤最大寬度（px）。 |
| `label-gap` | `8` | 標籤與圓圈的距離（px）。 |
| `label-lines` | `2` | 標籤最多幾行。 |
| `label-size` | `0.95rem` | 標籤字級。 |
| `size` | 自動 | 軌道區最小寬度（px）。 |
| `period` | `40` | 轉一圈的秒數。 |
| `direction` | `cw` | `cw` 順時針、`ccw` 逆時針。 |
| `pause-on-hover` | 布林 | 滑鼠移到軌道區時暫停。 |
| `accent` | `pink` | 插槽與說明區的強調色。 |
| `ring-color` | `gray` | 軌道虛線顏色。 |
| `slot-title` | `{label}` | 插槽標題，`{label}` 會換成想法名稱。 |
| `placeholder` | `點軌道上的一個想法，它會停進這裡。` | 插槽空著時的提示。 |

### `<orbit-core>`、`<orbit-item>` 屬性

| 屬性 | 適用 | 預設 | 說明 |
| --- | --- | --- | --- |
| `icon` | 兩者 | `star-fill`、`circle` | Bootstrap Icons 名稱（不含 `bi-`）。 |
| `label` | 兩者 | 無 | 名稱。 |
| `color` | 兩者 | `yellow`、`key` | 圓圈顏色。 |
| `ring` | `orbit-item` | `1` | 放在第幾圈軌道；同一圈的項目平均分布。 |
| `detail` | `orbit-item` | 無 | 說明內容的 template 或元素 id。 |

### 事件

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `ui-orbit:dock` | `{ label }` | 想法停進插槽時。 |
| `ui-orbit:release` | `{ label }` | 想法離開插槽時。 |

---

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
