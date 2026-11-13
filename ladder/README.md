# 教學頁互動元件：ui-detail-ladder 與 ui-insight

兩個以語意標籤撰寫的原生 Web Components，專為語言教學頁面設計，讓內容不再是一片文字牆。

| 元件 | 用途 | 版本 |
|---|---|---|
| `<ui-detail-ladder>` | 細節階梯：把籠統說法逐階升級成具體說法 | v1.3 |
| `<ui-insight>` | 亮點字詞解說：左側句子卡片，右側顯示亮點字詞的解說 | v1.5 |

## 特色

- 原生 Custom Elements，不依賴任何框架。
- 不使用 shadow DOM，CSS 由 JS 檔自動注入，一個 `.js` 檔即可使用。
- 所有部位的配色、字體大小、間距、外框都可用屬性自訂。
- 支援預設收合、鍵盤切換、`<c-blue>` 等色名標籤（舊的 `<c-shell>` 到 `<c-energetic>` 仍可用）。
- 寬螢幕排版，適合教學頁與錄影講解。

```html
```

## ui-detail-ladder

左側為垂直階梯軌道，右側依序為 膠囊標籤、次標題、本文、註腳、進度條與按鈕。每往上一階，本文中新增的部分會以亮色標出。

### 基本寫法

```html
<ui-detail-ladder>
  <ladder-step label="籠統說法">
    <step-title icon="bi-chat-square-quote">原本的說法</step-title>
    <step-body>I live <mark>near</mark> my school.</step-body>
    <step-note>我住在學校附近。</step-note>
  </ladder-step>
  <ladder-step label="加上數字">
    <step-title icon="bi-123">換成可衡量的數字</step-title>
    <step-body>It's <mark>about a ten-minute walk</mark> from my place to school.</step-body>
    <step-note>從我家走到學校大約十分鐘。</step-note>
  </ladder-step>
</ui-detail-ladder>
```

### 內容結構

| 標籤 | 屬性 | 說明 |
|---|---|---|
| `<ladder-step>` | `label` | 左側階梯文字，同時顯示在 膠囊標籤 冒號後方。 |
| `<ladder-step>` | `pill` | 膠囊標籤 前段文字。未設定時第一階為「起點」，其後為「第1階」、「第2階」依序遞增。 |
| `<step-title>` | `icon` | 次標題，可省略。`icon` 接受 `bi-star-fill`、`star-fill`、`bi bi-star-fill`。 |
| `<step-title>` | `icon-color` | 單一圖示顏色。 |
| `<step-body>` | | 本文。用 `<mark>` 標出這一階新增的部分。 |
| `<step-note>` | | 註腳，可省略。 |

### 屬性

**整體外觀**

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `margin` | `6px 12px` | 元件對外間距。 |
| `padding` | `6px 12px` | 元件對內間距。 |
| `bg` | `#0C0D0C` | 元件背景色。 |
| `border` | `false` | 是否顯示外框。 |
| `border-color` | `#C6C7BD` | 外框顏色。 |
| `border-width` | `1px` | 外框粗細。 |
| `border-radius` | `12px` | 外框圓角。 |
| `rail-width` | `200px` | 左側階梯欄寬度。 |
| `column-gap` | `24px` | 左右兩欄間距。 |
| `start` | `1` | 初始停在第幾階。 |
| `ini-collapse` | （無） | 出現即預設收合。 |
| `ini-title` | `點擊展開` | 收合標題列文字。 |
| `ini-title-size` | `1rem` | 標題列字體大小。 |
| `ini-title-color` | `#5DBAE8` | 標題列文字色。 |
| `ini-title-bg` | `#161816` | 標題列底色。 |
| `keyboard` | `true` | 是否啟用鍵盤切換。 |
| `theme` | `default` | v1.2 新增。一次套用整組強調色，可用 `default` 與 17 個品牌色名稱，名稱不存在時退回 `default`。 |

**主題與顏色（v1.2）**

- `theme` 會改變外框、階梯（已經過與目前）、垂直線、膠囊標籤、次標題、分隔線、`<mark>`、進度條、前進按鈕與收合標題列的顏色。優先順序為：寫在標籤上的個別屬性 > `theme` > 內建預設。
- 所有顏色屬性（含 `<step-title>` 的 `icon-color`）都可以直接填品牌色名稱，例如 `title-color="key"`、`bg="base"`，不分大小寫，也可以填 `#hex` 或 `rgb()`。v1.1 填名稱會失效，v1.2 已修正。
- `customElements.get('ui-detail-ladder').themes` 可取得所有主題名稱。

```html
<ui-detail-ladder theme="key" pill-bg="playful" hl-bg="yellow">...</ui-detail-ladder>
```

**左側階梯**

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `direction` | `up` | `up` 由下往上，`down` 由上往下。 |
| `step-gap` | `14px` | 每階間距。 |
| `step-font-size` | `0.8125rem` | 階梯文字大小。 |
| `dot-size` | `22px` | 數字圓點直徑。 |
| `dot-font-size` | `0.6875rem` | 圓點內數字大小。 |
| `label-color` | `#C6C7BD` | 未到達的階梯顏色。 |
| `active-color` | `#5DBAE8` | 已經過的階梯顏色，也是前進按鈕底色。 |
| `current-color` | `#5DBAE8` | 目前階梯顏色。 |
| `line-style` | `solid` | 垂直線類型：`solid`、`dashed`、`dotted`、`double`。 |
| `line-width` | `2px` | 垂直線粗細，`double` 建議 3px 以上。 |
| `line-color` | `#C6C7BD` | 垂直線未到達段顏色。 |
| `line-active-color` | `#5DBAE8` | 垂直線已到達段顏色。 |

**Pill、次標題、本文、註腳**

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `show-pill` | `true` | 是否顯示 膠囊標籤。 |
| `pill-font-size` | `0.85rem` | 膠囊標籤 字體大小。 |
| `pill-bg` | `#B484E8` | 膠囊標籤 底色。 |
| `pill-color` | `#0C0D0C` | 膠囊標籤 文字色。 |
| `title-font-size` | `1.0625rem` | 次標題大小。 |
| `title-color` | `#5DBAE8` | 次標題顏色。 |
| `title-icon-color` | `#E3D322` | 次標題圖示統一顏色。 |
| `body-font-size` | `1rem` | 本文大小。 |
| `body-color` | `#C6C7BD` | 本文顏色。 |
| `note-font-size` | `0.85rem` | 註腳大小。 |
| `note-color` | `#C6C7BD` | 註腳顏色。 |
| `show-divider` | `false` | 本文上下是否顯示分隔線。 |
| `divider-style` | `solid` | 分隔線類型。 |
| `divider-width` | `1px` | 分隔線粗細。 |
| `divider-color` | `#C6C7BD` | 分隔線顏色。 |
| `hl-bg` | `#71CD76` | `<mark>` 底色。 |
| `hl-color` | `#0C0D0C` | `<mark>` 文字色。 |

**進度條與按鈕**

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `show-progress` | `true` | 是否顯示進度條與下方文字。 |
| `progress-height` | `6px` | 進度條粗細。 |
| `progress-color` | `#71CD76` | 進度條顏色，搭配 `progress-color-end` 時為漸層起點。 |
| `progress-color-end` | （空） | 設定後成為由左到右的雙色漸層。 |
| `progress-track` | `#262826` | 底軌顏色，也是重來按鈕底色。 |
| `progress-text` | `具體程度 {p}%` | 文字範本，`{p}` 百分比、`{n}` 目前階數、`{total}` 總階數。 |
| `progress-text-size` | `0.75rem` | 下方文字大小。 |
| `progress-text-color` | `#C6C7BD` | 下方文字顏色。 |
| `show-buttons` | `true` | 是否顯示按鈕。 |
| `next-text` | `往上一階` | 前進按鈕文字。 |
| `reset-text` | `重來` | 重來按鈕文字。 |
| `button-font-size` | `0.875rem` | 按鈕字體大小。 |

### JavaScript 介面

| 名稱 | 類型 | 說明 |
|---|---|---|
| `go(n)` | 方法 | 跳到第 n 階。 |
| `next()` / `prev()` / `reset()` | 方法 | 前進、後退、回到第 1 階。 |
| `open()`、`close()`、`toggle()` | 方法 | 展開、收合、切換（僅在 `ini-collapse` 時有效）。 |
| `current`、`total`、`isOpen` | 唯讀屬性 | 目前階數、總階數、是否展開。 |
| `ladder-change` | 事件 | `detail` 內含 `index`、`total`、`label`。 |
| `ladder-toggle` | 事件 | `detail` 內含 `open`。 |
| `play()`、`pause()` | 方法 | 開始、暫停自動播放（v1.3）。stop 模式下在最後一階呼叫 `play()` 會從第 1 階重新開始。 |
| `isPlaying` | 唯讀屬性 | 是否正在自動播放（v1.3）。 |
| `ladder-play`、`ladder-pause`、`ladder-end` | 事件 | 開始、暫停、播完（v1.3）。`ladder-pause` 的 `detail.reason` 為 `user` 或 `end`。 |

### 自動播放（v1.3）

```html
<ui-detail-ladder autoplay theme="blue">
  <ladder-step label="籠統說法">...</ladder-step>
  <ladder-step label="換成結果" dwell="12">...</ladder-step>
  <ladder-step label="加上數字">...</ladder-step>
</ui-detail-ladder>
```

| 屬性 | 預設 | 說明 |
|---|---|---|
| `autoplay` | 關閉 | 開啟自動播放。只寫屬性為每階 8 秒，寫數字改秒數，例如 `autoplay="5"`。 |
| `<ladder-step dwell>` | 跟著 `autoplay` | 單獨設定這一階停留的秒數。 |
| `autoplay-start` | `click` | `click` 按播放鍵或 Ctrl+Shift+空白鍵 才開始、`view` 捲進畫面就開始、`load` 載入就開始。 |
| `autoplay-end` | `stop` | `stop` 停在最後一階、`loop` 回到第 1 階繼續。 |
| `pause-on-hover` | `false` | `true` 時游標停在元件上暫停計時。 |
| `show-timer` | `true` | 內容下方的倒數線，暫停時變灰。 |
| `play-text`、`pause-text` | `播放`、`暫停` | 播放鍵文字。播放鍵出現在按鈕列，由 `show-buttons` 控制。 |

- 點階梯、按「往上一階」或「重來」、用鍵盤切換時自動暫停。
- 元件離開畫面、切到別的分頁、收合時暫時停止計時，條件解除後從原本的倒數位置繼續。

---

## ui-insight

左側為一句一句的卡片，右側顯示所選句子中亮點字詞的解說。滑過句中亮點或右側解說，兩邊會互相對照。

### 基本寫法

```html
<ui-insight>
  <ins-line heading="Do you like mornings?">
    <hl why="自然的開場語氣">Honestly,</hl> I'm
    <hl why="慣用說法，比 I don't like getting up early 更道地" tag="lr">not much of a morning person</hl>,
    so I usually run after work instead.
  </ins-line>
  <ins-line>
    The buses were so packed that <hl why="用具體結果取代 very crowded">I let three go by</hl>.
  </ins-line>
</ui-insight>
```

### 內容結構

| 標籤 | 屬性 | 說明 |
|---|---|---|
| `<ins-line>` | | 一張句子卡片。 |
| `<ins-line>` | `heading` | 卡片上方小標題，可省略，適合放考官提問。 |
| `<hl>` | `why` | 亮點解說，支援 `<c-色名>` 色彩標籤。 |
| `<hl>` | `tag` | 選用標籤。`lr`、`gra`、`fc`、`p` 顯示為詞彙、文法、連貫、發音；其他文字照原文顯示。 |
| `<hl>` | `tag-color` | 單一標籤底色。 |
| `<hl>` | `word` | 右側顯示的字詞，未設定時取亮點文字並去掉結尾標點。 |

### 屬性

**整體外觀**

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `theme` | `default` | 一次套用整組強調色，可用 `default`、`violet`、`blue`、`green`、`yellow`、`energetic`、`dreamy`、`pink`、`indigo`、`shell`、`vanilla`、`red`、`gray`、`key`、`calm`、`quiet`、`playful`、`urgent`。名稱不存在時退回 `default`。 |
| `margin` | `6px 12px` | 元件對外間距。 |
| `padding` | `6px 12px` | 元件對內間距。 |
| `bg` | `#0C0D0C` | 元件背景色。 |
| `border` | `false` | 是否顯示外框。 |
| `border-color` | `#C6C7BD` | 外框顏色。 |
| `border-width` | `1px` | 外框粗細。 |
| `border-radius` | `12px` | 外框圓角。 |
| `split` | `55%` | 左側卡片欄寬度。 |
| `column-gap` | `20px` | 左右兩欄間距。 |
| `start` | `1` | 初始選取第幾句。 |
| `ini-collapse` | （無） | 出現即預設收合。 |
| `ini-title` | `點擊展開` | 收合標題列文字。 |
| `ini-title-size` | `1rem` | 標題列字體大小。 |
| `ini-title-color` | `#5DBAE8` | 標題列文字色。 |
| `ini-title-bg` | `#161816` | 標題列底色。 |
| `keyboard` | `true` | 是否啟用鍵盤切換。 |

**左側句子卡片**

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `card-gap` | `10px` | 卡片間距。 |
| `card-padding` | `12px 14px` | 卡片內距。 |
| `card-bg` | `#161816` | 卡片底色。 |
| `card-border` | `#2A2B29` | 卡片框線。 |
| `card-hover-border` | `#5A5B56` | 滑過時框線。 |
| `card-active-border` | `#5DBAE8` | 選取中框線。 |
| `card-radius` | `8px` | 卡片圓角。 |
| `heading-font-size` | `0.75rem` | 卡片小標題大小。 |
| `heading-color` | `#B484E8` | 卡片小標題顏色。 |
| `sentence-font-size` | `1rem` | 句子大小。 |
| `sentence-color` | `#C6C7BD` | 句子顏色。 |
| `sentence-line-height` | `2.1` | 句子行高。 |
| `show-num` | `true` | 是否顯示句子編號。 |
| `num-bg` | `#2A2B29` | 編號底色。 |
| `num-color` | `#C6C7BD` | 編號文字色。 |
| `num-active-bg` | `#5DBAE8` | 選取中編號底色。 |
| `num-active-color` | `#0C0D0C` | 選取中編號文字色。 |

**亮點字詞**

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `hl-line-color` | `#71CD76` | 亮點底線顏色。 |
| `hl-line-style` | `solid` | 底線類型。 |
| `hl-line-width` | `2px` | 底線粗細。 |
| `hl-hot-bg` | `#71CD76` | 對照中亮點底色。 |
| `hl-hot-color` | `#0C0D0C` | 對照中亮點文字色。 |
| `show-sup` | `true` | 是否顯示亮點小編號。 |
| `sup-font-size` | `0.625rem` | 小編號大小。 |
| `sup-color` | `#71CD76` | 小編號顏色。 |

**右側解說面板**

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `panel-bg` | `#161816` | 面板底色。 |
| `panel-padding` | `14px 16px` | 面板內距。 |
| `panel-radius` | `8px` | 面板圓角。 |
| `panel-sticky` | `true` | 捲動時面板是否停留在畫面上。 |
| `panel-top` | `12px` | 停留時與視窗頂端的距離。 |
| `show-summary` | `true` | 是否顯示頂端摘要。 |
| `summary-text` | `第 {n} 句，共 {count} 個亮點` | 摘要範本，`{n}` 目前句數、`{total}` 總句數、`{count}` 亮點數。 |
| `summary-font-size` | `0.75rem` | 摘要大小。 |
| `summary-color` | `#C6C7BD` | 摘要顏色。 |
| `note-num-bg` | `#71CD76` | 解說編號底色。 |
| `note-num-color` | `#0C0D0C` | 解說編號文字色。 |
| `note-word-size` | `0.95rem` | 解說字詞大小。 |
| `note-word-color` | `#71CD76` | 解說字詞顏色。 |
| `note-text-size` | `0.82rem` | 解說內文大小。 |
| `note-text-color` | `#C6C7BD` | 解說內文顏色。 |
| `note-divider-style` | `dashed` | 解說分隔線類型。 |
| `note-divider-width` | `1px` | 分隔線粗細。 |
| `note-divider-color` | `#2A2B29` | 分隔線顏色。 |
| `note-hot-bg` | `#222522` | 對照中解說底色。 |
| `tag-font-size` | `0.6875rem` | 標籤大小。 |
| `tag-text-color` | `#0C0D0C` | 標籤文字色。 |
| `tag-default-bg` | `#FF91D7` | 非內建標籤底色。 |
| `empty-text` | `這一句沒有標記亮點。` | 無亮點時的文字。 |
| `empty-color` | `#C6C7BD` | 上述文字顏色。 |

**主題與顏色**

- `theme` 會改變外框、選取框線、小標題、編號、亮點、解說編號、標籤與收合標題列的顏色。優先順序為：寫在標籤上的個別屬性 > `theme` > 內建預設。
- 所有顏色屬性都可以直接填品牌色名稱，例如 `hl-hot-bg="blue"`、`hl-hot-color="base"`，不分大小寫，也可以填 `#hex` 或 `rgb()`。

```html
<ui-insight theme="violet" hl-hot-color="base">...</ui-insight>
```

### 附加內容（extra-info）

在 `<ins-line>` 加上 `extra-info`，填 `<template>` 的 id。選到這一句時，template 的內容會顯示在右側面板最下方，位於亮點解說之後。沒有寫 `extra-info` 或找不到 id 時不顯示；id 指向的若不是 `<template>`，改用該元素的 innerHTML。

```html
<ui-insight extra-info-style="label" extra-info-label="中文翻譯">
  <ins-line heading="..." extra-info="tpl-1">...</ins-line>
  <ins-line extra-info="tpl-2" extra-info-style="dashed">...</ins-line>
</ui-insight>

<template id="tpl-1">要不是幾年前偶然看到……</template>
```

| 屬性 | 放在 | 預設值 | 說明 |
|---|---|---|---|
| `extra-info` | `<ins-line>` | （無） | `<template>` 的 id。 |
| `extra-info-style` | `<ui-insight>` 或 `<ins-line>` | `outline` | `outline` 1px 實線外框、`dashed` 1px 虛線外框無底色、`divider` 只有上方分隔線、`label` 外框左上角嵌入標籤。寫在 `<ins-line>` 會覆蓋整體設定。 |
| `extra-info-label` | `<ui-insight>` 或 `<ins-line>` | `補充` | `label` 樣式的標籤文字。 |
| `extra-bg` | `<ui-insight>` | `#1E201E` | 背景色（`dashed`、`divider` 不使用）。 |
| `extra-color` | `<ui-insight>` | `#C6C7BD` | 文字色。 |
| `extra-border-color` | `<ui-insight>` | `#5DBAE8` | 線條與標籤顏色，會跟著 `theme`。 |
| `extra-font-size` | `<ui-insight>` | `0.85rem` | 字體大小。 |
| `extra-padding` | `<ui-insight>` | `10px 12px` | 內距。 |
| `extra-radius` | `<ui-insight>` | `6px` | 圓角。 |
| `extra-top` | `<ui-insight>` | `12px` | 與上方亮點解說的距離。 |

#### 快速分欄（v1.5）

template 內一行寫上 `|` 就會自動分欄。一行指的是 template 裡的一個換行，或一個 `<p>`、`<div>` 區塊。連續含 `|` 的行共用同一組欄位、上下對齊；欄數不同時，較短那行的最後一欄延伸到底。沒有 `|` 的行照一般文字顯示，清單、表格等區塊照原樣保留。要顯示直線本身請寫 `\|`。沒有 `|` 的 template 完全不受影響。

```html
<template id="tpl-2" cols="auto 1fr" col-divider="solid">
  tucked away | 藏在不起眼的地方
  in an alley | 在一條小巷裡
</template>
```

| 屬性 | 放在 | 預設值 | 說明 |
|---|---|---|---|
| `extra-info-split` | `<ui-insight>`；template 上用 `split` | `true` | 設為 `false` 關閉分欄。 |
| `extra-info-cols` | `<ui-insight>`；template 上用 `cols` | （等寬） | 欄寬，寫法同 CSS `grid-template-columns`，例如 `auto 1fr`。 |
| `extra-info-col-divider` | `<ui-insight>`；template 上用 `col-divider` | `none` | 欄間直線：`none`、`solid`、`dashed`、`dotted`，顏色沿用 `extra-border-color`。 |
| `extra-col-gap` | `<ui-insight>` | `16px` | 欄距。 |
| `extra-row-gap` | `<ui-insight>` | `6px` | 列距。 |

### JavaScript 介面

| 名稱 | 類型 | 說明 |
|---|---|---|
| `go(n)` | 方法 | 選取第 n 句。 |
| `next()`、`prev()` | 方法 | 下一句或上一句。 |
| `open()`、`close()`、`toggle()` | 方法 | 展開、收合、切換（僅在 `ini-collapse` 時有效）。 |
| `current`、`total`、`isOpen` | 唯讀屬性 | 目前句數、總句數、是否展開。 |
| `insight-change` | 事件 | `detail` 內含 `index`、`total`、`count`。 |
| `insight-toggle` | 事件 | `detail` 內含 `open`。 |

---

## 共通功能

### 預設收合

```html
<ui-detail-ladder ini-collapse ini-title="預設收合，點擊展開">...</ui-detail-ladder>
<ui-insight ini-collapse ini-title="Part 3 範例">...</ui-insight>
```

寫成 `ini-collapse="false"` 等同不收合。

### 鍵盤切換

| 按鍵 | ui-detail-ladder | ui-insight |
|---|---|---|
| Ctrl+Shift+↑ | 往畫面上方的階梯移動 | 上一句 |
| Ctrl+Shift+↓ | 往畫面下方的階梯移動 | 下一句 |
| Ctrl+Shift+空白鍵 | 切換自動播放（需有 `autoplay`） | 無 |

- 作用於最近一次被游標指到、點擊或用 Tab 取得焦點的元件。
- 在其他 `input`、`textarea` 打字時不攔截。
- 收合狀態下不作用。
- 設定 `keyboard="false"` 可關閉。

### 快速色彩標籤

本文、註腳與 `why` 解說都可以用色名標籤設定文字色，色名清單見根目錄 README 的「色名標籤」。

```html
<step-body>I'm <c-red>fond of cooking</c-red>.</step-body>
<hl why="比 <c-gray>I like</c-gray> 更道地">fond of</hl>
```

### 單位慣例

- 字體大小一律用 `rem`。
- `margin`、`padding` 與各種間距一律用 `px`。

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
