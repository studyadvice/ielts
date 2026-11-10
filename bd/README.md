# card-badge

`<card-badge>` 是多功能徽章元件。最基本的用法是一顆帶主題色的小標籤，也能顯示格式化的日期與截止日、未讀計數或小圓點，並支援點擊後過濾清單、複製文字、折疊區塊、調整字級、輪播內容與跳出提示訊息。元件不使用 Shadow DOM，圖示使用 Bootstrap Icons。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `card-badge.js` | `<card-badge>` `<badge-item>` | 主題徽章、日期與計數徽章、可點擊的互動徽章。 |

## 目錄

- [標籤](#標籤)
- [屬性：外觀](#屬性外觀)
- [屬性：格式化日期](#屬性格式化日期)
- [屬性：計數](#屬性計數)
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

## 屬性：格式化日期

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `type` | `date`、`time`、`datetime`、`deadline` | 無 | 格式化模式，需搭配 `value`。 |
| `value` | 文字 | 無 | 來源值。`date` 為 `YYYY-MM-DD`；`time` 為 `HH:mm:ss`；`deadline` 為日期字串。 |
| `format` | `YYYY-MM-DD`、`MM/DD`、`MM-DD` | 依類型 | `date` 的輸出格式；`datetime` 目前固定為 `MM/DD HH:mm`。 |
| `warning-days` | 整數 | `3` | `deadline` 距截止日幾天內顯示黃色警告，逾期自動變紅色。 |

## 屬性：計數

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `count` | 整數 | 無 | 設定後進入計數模式。 |
| `max-count` | 整數 | `99` | 超過時顯示「N+」，例如 `99+`。 |
| `show-zero` | `true` | `false` | `count="0"` 時仍顯示；否則整個徽章隱藏。 |
| `dot-mode` | `true` | `false` | 只顯示有色小圓點，不顯示數字。 |
| `count-animate` | `false` | `true` | `count` 改變時的彈跳動畫。 |

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
| `alert-type` | `info`、`success`、`warning`、`danger` | `info` | 提示樣式。 |
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
- **計數隱藏**：`count="0"` 且沒有 `show-zero` 時整個徽章會隱藏，`count` 變回正數就重新出現。
- **截止日顏色**：`type="deadline"` 依剩餘天數自動切換一般、警告（`warning-days` 內）與逾期三種顏色。
- **樣式隔離**：每個實例有自己的 `data-badge-id`，樣式只作用在自己身上，外部 CSS 仍可直接覆寫。

## 範例

**主題、外框與圖示**

```html
<card-badge theme="violet" text="標籤"></card-badge>
<card-badge theme="blue" icon="bi-bell" text="通知"></card-badge>
<card-badge theme="green-outline" text="完成"></card-badge>
<card-badge theme="energetic" size="lg" font-size="1.2rem" padding="4px 16px" text="大尺寸"></card-badge>
```

**日期、截止日與計數**

```html
<card-badge theme="blue" type="date" value="2026-11-20" format="MM/DD"></card-badge>
<card-badge type="deadline" value="2026-11-08" warning-days="5"></card-badge>
<card-badge theme="pink" icon="bi-bell" count="120" max-count="99"></card-badge>
<card-badge theme="red" dot-mode="true" count="1"></card-badge>
```

**折疊、過濾與複製**

```html
<card-badge theme="blue" icon="bi-chevron-down" text="展開說明" toggle-target="more-1"></card-badge>
<div id="more-1">可折疊的內容。</div>

<card-badge clickable="true" action="filter" data-filter="all" text="全部"></card-badge>
<card-badge clickable="true" action="filter" data-filter="design" text="設計" theme="pink"></card-badge>
<div data-filter-group="design">UI 設計</div>
<div data-filter-group="dev,design">前端開發</div>

<card-badge clickable="true" action="copy" source="src-1" target="out-1" text="複製"
            alert-message="已複製" alert-type="success" alert-position="bottom-right"></card-badge>
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
| `badge-click` | `{ action, filter, source, target, toggleTarget, fontControl, isCollapsed, type, value, text, count, href, alertMessage }` | 點擊徽章。 |
| `badge-rotate` | `{ mode, currentIndex, totalItems, isAuto, targetId }` | 輪播切換，`mode` 為 `self` 或 `content`。 |
| `badge-expand` | `{ currentIndex, totalItems, targetId }` | 自動輪播時點擊展開目前項目。 |
