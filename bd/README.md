# card-badge

`<card-badge>` 是多功能徽章元件。最基本的用法是一顆帶主題色的小標籤，並支援點擊後過濾清單、複製文字、折疊或顯示區塊、調整字級、輪播內容與跳出提示訊息。元件不使用 Shadow DOM，圖示使用 Bootstrap Icons。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `card-badge.js` | `<card-badge>` `<badge-item>` | 主題徽章與可點擊的互動徽章。 |

## 目錄

- [標籤](#標籤)
- [屬性：外觀](#屬性外觀)
- [屬性：互動](#屬性互動)
- [屬性：提示訊息](#屬性提示訊息)
- [屬性：輪播](#屬性輪播)
- [屬性解說](#屬性解說)
- [範例](#範例)
- [事件](#事件)

## 標籤

| 標籤 | 位置 | 用途 |
| --- | --- | --- |
| `<card-badge>` | 任意位置，通常是行內 | 徽章本體。 |
| `<badge-item>` | `<card-badge>` 內 | 輪播用的項目，本身不顯示。 |

## 屬性：外觀

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `theme` | 品牌色名稱或色碼，可加 `-outline` 後綴 | `shell` | 主題色，例如 `blue`、`blue-outline`。可用名稱：`shell`、`violet`、`green`、`energetic`、`dreamy`、`blue`、`vanilla`、`yellow`、`indigo`、`pink`、`red`、`gray`、`key`、`bg-alternative`、`calm`、`quiet`、`playful`、`urgent`。 |
| `outline` | `true` | `false` | 外框樣式，與 `theme="xxx-outline"` 效果相同。 |
| `size` | `xs`、`sm`、`md`、`re`、`lg`、`xl` | `re` | 尺寸。`re` 為 1.01rem，`lg` 為 1.363rem，`xl` 為 1.758rem，`md` 保留給舊頁面。 |
| `font-size` | 長度 | 無 | 自訂字級，覆蓋 `size` 的字級。 |
| `padding` | CSS `padding` 值 | 無 | 自訂內距，覆蓋 `size` 的內距。 |
| `text` | 文字 | 無 | 顯示的文字。 |
| `icon` | `bi-` 類別或任意文字 | 無 | `bi-` 開頭顯示 Bootstrap Icons，其他字串（含 emoji）原樣顯示。 |
| `disabled` | 布林 | 關閉 | 停用：不能點擊，顯示半透明灰色。 |

## 屬性：互動

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `clickable` | `true` | `false` | 啟用點擊，滑過效果與焦點光暈才會生效。 |
| `action` | `filter`、`copy`、`rotate-content`、`rotate-self`、`rotate-self-auto`、`font-increase`、`font-decrease`、`font-reset` | 無 | 點擊時的動作。 |
| `hover-effect` | `lift`、`scale`、`glow`、`pulse`、`rotate`、`none` | `lift` | 滑過動畫，需 `clickable="true"` 或 `toggle-target`。 |
| `focus-color` | 品牌色名稱或色碼 | 跟隨 `theme` | 鍵盤焦點的光暈色。 |
| `href` | 網址 | 無 | 點擊後前往。 |
| `href-target` | `_self`、`_blank` 等 | `_self` | 連結開啟位置。 |
| `toggle-target` | 元素 id | 無 | 點擊折疊或展開該元素，圖示自動旋轉 180 度。 |
| `reveal-target` | 元素 id，可多個 | 無 | 點擊後顯示這些元素，例如 `reveal-target="id1,id2,id3"`。id 以逗號或空白分隔，`#` 可省略。 |
| `data-filter` | 文字或 `all` | 無 | 搭配 `action="filter"`，只顯示 `data-filter-group` 含有此值的元素。 |
| `removeself` | `true` | `false` | 點擊後淡出並移除自己。 |
| `source` | 元素 id | 無 | `copy` 的來源；輸入框取其值，其他元素取文字。沒設時複製 `text`。 |
| `target` | 元素 id | 無 | `copy` 與 `rotate-content` 的目標。 |
| `copy-html` | `true` | `false` | `copy` 時複製 HTML 而非純文字。 |
| `font-control` | 元素 id | 無 | 字級調整的目標，搭配 `font-increase`、`font-decrease`、`font-reset`。 |
| `font-step` | 數字（px） | `2` | 每次調整的字級步長，範圍 12px 到 32px。 |

## 屬性：提示訊息

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `alert-message` | 文字 | 無 | 點擊後在頁面上顯示的浮動提示。 |
| `alert-source` | 元素 id | 無 | 從該元素讀取提示文字，優先順序低於 `alert-message`。 |
| `alert-theme` | 品牌色名稱、`#` 色碼或 `rgb()` | `indigo` | 提示的主題色。無法辨識的值改用 `indigo`。 |
| `alert-variant` | `fill`、`outline`、`double` | `fill` | 提示樣式：填滿（文字色依底色自動調整）、單線、雙線。 |
| `alert-duration` | 毫秒 | `4000` | 顯示時間。 |
| `alert-position` | `top`、`top-left`、`top-right`、`bottom`、`bottom-left`、`bottom-right` | `top` | 顯示位置。 |

## 屬性：輪播

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `action="rotate-self"` | | | 點擊時依序換成下一個 `<badge-item>` 的 `text`、`icon`、`theme`。 |
| `action="rotate-content"` | | | 點擊時把目前 `<badge-item>` 的內容放進 `target`。 |
| `action="rotate-self-auto"` | | | 自動輪播自己；點擊時把目前項目展開到 `target`。 |
| `interval` | `3s`、`1.5s`、`0.5m` | `3s` | 自動輪播間隔。 |

`<badge-item>` 可用 `text`、`icon`、`theme` 屬性，`theme` 會覆蓋父元件的主題。

## 屬性解說

- **主題繼承**：沒寫 `theme` 時，若徽章在 `<card-v3>` 裡，會沿用該卡片的 `theme`。
- **顯示多個區塊**：`reveal-target` 的目標請先用 `hidden` 屬性、行內 `display:none` 或樣式表的 `display:none` 隱藏。點擊後顯示並淡入，不會再收起；找不到的 id 會在主控台警告，並列在 `badge-reveal` 事件的 `missing`。
- **提示樣式**：`outline` 與 `double` 的底色為 `#2D2D2D`，文字與線條使用 `alert-theme`；`fill` 的文字色依底色亮度自動選深或淺。
- **已移除的功能**：格式化日期（`type`、`value`、`format`、`warning-days`）、計數（`count`、`max-count`、`show-zero`、`dot-mode`、`count-animate`）與 `alert-type` 已整組移除。
- **樣式隔離**：每個實例有自己的 `data-badge-id`，樣式只作用在自己身上，外部 CSS 仍可直接覆寫。

## 範例

**主題、外框與圖示**

```html
<card-badge theme="violet" text="標籤"></card-badge>
<card-badge theme="blue" icon="bi-bell" text="通知"></card-badge>
<card-badge theme="green-outline" text="完成"></card-badge>
<card-badge theme="energetic" size="lg" font-size="1.2rem" padding="4px 16px" text="大尺寸"></card-badge>
```

**提示訊息的主題與樣式**

```html
<card-badge clickable="true" text="填滿" alert-message="已儲存" alert-theme="green"></card-badge>
<card-badge clickable="true" text="單線" alert-message="單線外框" alert-theme="#FF91D7" alert-variant="outline"></card-badge>
<card-badge clickable="true" text="雙線" alert-message="雙線外框" alert-theme="rgb(180,132,232)" alert-variant="double" alert-position="bottom-right"></card-badge>
```

**折疊、過濾與複製**

```html
<card-badge theme="blue" icon="bi-chevron-down" text="展開說明" toggle-target="more-1"></card-badge>
<div id="more-1">可折疊的內容。</div>

<card-badge theme="energetic" text="顯示三個區塊" reveal-target="rv-1, rv-2, rv-3"></card-badge>
<div id="rv-1" hidden>區塊 1</div>
<div id="rv-2" hidden>區塊 2</div>
<div id="rv-3" hidden>區塊 3</div>

<card-badge clickable="true" action="filter" data-filter="all" text="全部"></card-badge>
<card-badge clickable="true" action="filter" data-filter="design" text="設計" theme="pink"></card-badge>
<div data-filter-group="design">UI 設計</div>
<div data-filter-group="dev,design">前端開發</div>

<card-badge clickable="true" action="copy" source="src-1" target="out-1" text="複製"
            alert-message="已複製" alert-theme="green" alert-position="bottom-right"></card-badge>
<p id="src-1">這段文字可以被複製</p>
<p id="out-1"></p>
```

**字級控制與輪播**

```html
<card-badge clickable="true" action="font-increase" font-control="article-1" icon="bi-plus" text="放大"></card-badge>
<card-badge clickable="true" action="font-decrease" font-control="article-1" icon="bi-dash" text="縮小" font-step="4"></card-badge>
<article id="article-1">這段文字的大小可以被調整。</article>

<card-badge clickable="true" action="rotate-self">
  <badge-item text="Part 1" theme="blue"></badge-item>
  <badge-item text="Part 2" theme="violet"></badge-item>
  <badge-item text="Part 3" theme="pink"></badge-item>
</card-badge>

<card-badge action="rotate-self-auto" interval="1.8s" target="tip-box">
  <badge-item text="技巧一">先讀題再聽。</badge-item>
  <badge-item text="技巧二">注意轉折詞。</badge-item>
</card-badge>
<div id="tip-box"></div>
```

## 事件

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `badge-click` | `{ action, filter, source, target, toggleTarget, revealTarget, fontControl, isCollapsed, text, href, alertMessage }` | 點擊徽章。 |
| `badge-reveal` | `{ ids, revealed, missing }` | `reveal-target` 顯示區塊後觸發；`missing` 是找不到的 id。 |
| `badge-rotate` | `{ mode, currentIndex, totalItems, isAuto, targetId }` | 輪播切換，`mode` 為 `self` 或 `content`。 |
| `badge-expand` | `{ currentIndex, totalItems, targetId }` | 自動輪播時點擊展開目前項目。 |

互動範例：[`card-badge-demo-11-21-26.html`](card-badge-demo-11-21-26.html)（合併了先前的示範、說明書與視覺編輯器）。
