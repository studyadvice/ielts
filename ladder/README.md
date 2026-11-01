# 教學頁互動元件：ui-detail-ladder 與 ui-insight

兩個以語意標籤撰寫的原生 Web Components，專為語言教學頁面設計，讓內容不再是一片文字牆。

| 元件 | 用途 | 版本 |
|---|---|---|
| `<ui-detail-ladder>` | 細節階梯：把籠統說法逐階升級成具體說法 | v1.1 |
| `<ui-insight>` | 亮點字詞解說：左側句子卡片，右側顯示亮點字詞的解說 | v1.0 |

## 特色

- 原生 Custom Elements，不依賴任何框架。
- 不使用 shadow DOM，CSS 由 JS 檔自動注入，一個 `.js` 檔即可使用。
- 所有部位的配色、字體大小、間距、外框都可用屬性自訂。
- 支援預設收合、鍵盤切換、`<c1>` 到 `<c16>` 快速色彩標籤。
- 寬螢幕排版，適合教學頁與錄影講解。



```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
```

## 安裝

把 `.js` 檔放進專案，在頁面底部引入即可。也可以放在 `<head>`，元件會等頁面解析完成後再初始化。

```html
<script src="ui-detail-ladder.js"></script>
<script src="ui-insight.js"></script>
```

---

## ui-detail-ladder

左側為垂直階梯軌道，右側依序為 pill、次標題、本文、註腳、進度條與按鈕。每往上一階，本文中新增的部分會以亮色標出。

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
| `<ladder-step>` | `label` | 左側階梯文字，同時顯示在 pill 冒號後方。 |
| `<ladder-step>` | `pill` | pill 前段文字。未設定時第一階為「起點」，其後為「第1階」、「第2階」依序遞增。 |
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
| `ini-title-color` | `#82C8E5` | 標題列文字色。 |
| `ini-title-bg` | `#161816` | 標題列底色。 |
| `keyboard` | `true` | 是否啟用鍵盤切換。 |

**左側階梯**

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `direction` | `up` | `up` 由下往上，`down` 由上往下。 |
| `step-gap` | `14px` | 每階間距。 |
| `step-font-size` | `0.8125rem` | 階梯文字大小。 |
| `dot-size` | `22px` | 數字圓點直徑。 |
| `dot-font-size` | `0.6875rem` | 圓點內數字大小。 |
| `label-color` | `#C6C7BD` | 未到達的階梯顏色。 |
| `active-color` | `#82C8E5` | 已經過的階梯顏色，也是前進按鈕底色。 |
| `current-color` | `#1CCAE8` | 目前階梯顏色。 |
| `line-style` | `solid` | 垂直線類型：`solid`、`dashed`、`dotted`、`double`。 |
| `line-width` | `2px` | 垂直線粗細，`double` 建議 3px 以上。 |
| `line-color` | `#C6C7BD` | 垂直線未到達段顏色。 |
| `line-active-color` | `#82C8E5` | 垂直線已到達段顏色。 |

**Pill、次標題、本文、註腳**

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `show-pill` | `true` | 是否顯示 pill。 |
| `pill-font-size` | `0.85rem` | pill 字體大小。 |
| `pill-bg` | `#C3A5E5` | pill 底色。 |
| `pill-color` | `#0C0D0C` | pill 文字色。 |
| `title-font-size` | `1.0625rem` | 次標題大小。 |
| `title-color` | `#82C8E5` | 次標題顏色。 |
| `title-icon-color` | `#E3D322` | 次標題圖示統一顏色。 |
| `body-font-size` | `1rem` | 本文大小。 |
| `body-color` | `#C6C7BD` | 本文顏色。 |
| `note-font-size` | `0.85rem` | 註腳大小。 |
| `note-color` | `#C6C7BD` | 註腳顏色。 |
| `show-divider` | `false` | 本文上下是否顯示分隔線。 |
| `divider-style` | `solid` | 分隔線類型。 |
| `divider-width` | `1px` | 分隔線粗細。 |
| `divider-color` | `#C6C7BD` | 分隔線顏色。 |
| `hl-bg` | `#B3DE73` | `<mark>` 底色。 |
| `hl-color` | `#0C0D0C` | `<mark>` 文字色。 |

**進度條與按鈕**

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `show-progress` | `true` | 是否顯示進度條與下方文字。 |
| `progress-height` | `6px` | 進度條粗細。 |
| `progress-color` | `#B3DE73` | 進度條顏色，搭配 `progress-color-end` 時為漸層起點。 |
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
| `open()` / `close()` / `toggle()` | 方法 | 展開、收合、切換（僅在 `ini-collapse` 時有效）。 |
| `current` / `total` / `isOpen` | 唯讀屬性 | 目前階數、總階數、是否展開。 |
| `ladder-change` | 事件 | `detail` 內含 `index`、`total`、`label`。 |
| `ladder-toggle` | 事件 | `detail` 內含 `open`。 |

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
| `<hl>` | `why` | 亮點解說，支援 `<c1>` 到 `<c16>`。 |
| `<hl>` | `tag` | 選用標籤。`lr`、`gra`、`fc`、`p` 顯示為詞彙、文法、連貫、發音；其他文字照原文顯示。 |
| `<hl>` | `tag-color` | 單一標籤底色。 |
| `<hl>` | `word` | 右側顯示的字詞，未設定時取亮點文字並去掉結尾標點。 |

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
| `split` | `55%` | 左側卡片欄寬度。 |
| `column-gap` | `20px` | 左右兩欄間距。 |
| `start` | `1` | 初始選取第幾句。 |
| `ini-collapse` | （無） | 出現即預設收合。 |
| `ini-title` | `點擊展開` | 收合標題列文字。 |
| `ini-title-size` | `1rem` | 標題列字體大小。 |
| `ini-title-color` | `#82C8E5` | 標題列文字色。 |
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
| `card-active-border` | `#1CCAE8` | 選取中框線。 |
| `card-radius` | `8px` | 卡片圓角。 |
| `heading-font-size` | `0.75rem` | 卡片小標題大小。 |
| `heading-color` | `#C3A5E5` | 卡片小標題顏色。 |
| `sentence-font-size` | `1rem` | 句子大小。 |
| `sentence-color` | `#C6C7BD` | 句子顏色。 |
| `sentence-line-height` | `2.1` | 句子行高。 |
| `show-num` | `true` | 是否顯示句子編號。 |
| `num-bg` | `#2A2B29` | 編號底色。 |
| `num-color` | `#C6C7BD` | 編號文字色。 |
| `num-active-bg` | `#1CCAE8` | 選取中編號底色。 |
| `num-active-color` | `#0C0D0C` | 選取中編號文字色。 |

**亮點字詞**

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `hl-line-color` | `#B3DE73` | 亮點底線顏色。 |
| `hl-line-style` | `solid` | 底線類型。 |
| `hl-line-width` | `2px` | 底線粗細。 |
| `hl-hot-bg` | `#B3DE73` | 對照中亮點底色。 |
| `hl-hot-color` | `#0C0D0C` | 對照中亮點文字色。 |
| `show-sup` | `true` | 是否顯示亮點小編號。 |
| `sup-font-size` | `0.625rem` | 小編號大小。 |
| `sup-color` | `#B3DE73` | 小編號顏色。 |

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
| `note-num-bg` | `#B3DE73` | 解說編號底色。 |
| `note-num-color` | `#0C0D0C` | 解說編號文字色。 |
| `note-word-size` | `0.95rem` | 解說字詞大小。 |
| `note-word-color` | `#B3DE73` | 解說字詞顏色。 |
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

### JavaScript 介面

| 名稱 | 類型 | 說明 |
|---|---|---|
| `go(n)` | 方法 | 選取第 n 句。 |
| `next()` / `prev()` | 方法 | 下一句或上一句。 |
| `open()` / `close()` / `toggle()` | 方法 | 展開、收合、切換（僅在 `ini-collapse` 時有效）。 |
| `current` / `total` / `isOpen` | 唯讀屬性 | 目前句數、總句數、是否展開。 |
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

- 作用於最近一次被游標指到、點擊或用 Tab 取得焦點的元件。
- 在其他 `input`、`textarea` 打字時不攔截。
- 收合狀態下不作用。
- 設定 `keyboard="false"` 可關閉。

### 快速色彩標籤

本文、註腳與 `why` 解說都可以使用 `<c1>` 到 `<c16>` 設定文字色。

```html
<step-body>I'm <c4>fond of cooking</c4>.</step-body>
```

| 標籤 | 顏色 | 標籤 | 顏色 |
|---|---|---|---|
| `<c1>` | shell `#C6C7BD` | `<c9>` | vanilla `#DBEDD8` |
| `<c2>` | lavender `#C3A5E5` | `<c10>` | yellow `#E3D322` |
| `<c3>` | sky `#82C8E5` | `<c11>` | focus `#D4FFFC` |
| `<c4>` | warning `#E6374B` | `<c12>` | special `#B3DE73` |
| `<c5>` | salmon `#E5C3B3` | `<c13>` | info `#4171BF` |
| `<c6>` | ocean `#1CCAE8` | `<c14>` | indigo `#7849C9` |
| `<c7>` | safe `#27AE60` | `<c15>` | pink `#FF91D7` |
| `<c8>` | teal `#0DA591` | `<c16>` | orange `#EDA109` |

### 單位慣例

- 字體大小一律用 `rem`。
- `margin`、`padding` 與各種間距一律用 `px`。

## 授權

採用 MIT 授權。
