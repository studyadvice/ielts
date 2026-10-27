# ui-table.js

A dependency-free, semantic-tag table component for the browser. Write your table as `<ui-table>` / `<ui-row>` / `<ui-col>` markup (or feed it JSON) and the script renders a CSS Grid table with collapsible groups, masked cells, carousels, popovers, timed alerts, inter-column arrows and progressive reveal.

- No build step, no framework, no Shadow DOM. One `<script>` tag.
- CSS is injected automatically; theming is driven by a built-in brand palette.
- Auto-initializes on `DOMContentLoaded`, and can be re-run manually for dynamic content.

---

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Tags](#tags)
- [Attributes](#attributes)
  - [`<ui-table>`](#ui-table)
  - [`<ui-group>`](#ui-group)
  - [`<ui-row>` / `<ui-row-enhance>`](#ui-row--ui-row-enhance)
  - [`<ui-col>`](#ui-col)
- [Features](#features)
- [Theme colors](#theme-colors)
- [Icons](#icons)
- [JSON data source](#json-data-source)
- [Global configuration](#global-configuration)
- [JavaScript API](#javascript-api)
- [Mutual exclusions and warnings](#mutual-exclusions-and-warnings)
- [Browser support](#browser-support)
- [License](#license)

---

## Installation

Download `ui-table.js` and include it at the end of `<body>`:

```html
<script src="ui-table.js"></script>
```

Bootstrap Icons is optional but recommended. It is required for `bi-*` icons, for `auto-number` circles 0 to 9, and for the `show-next` chevron:

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
```

The component injects its own `<style id="uit-css">` block on load. Nothing else is required.

---

## Quick start

```html
<ui-table theme="sky" font-size="1rem">
  <ui-group title-left="Unit 1" title-right="6 items">

    <ui-row col-widths="1:2" col-border="1px solid">
      <ui-col icon="i-check">Term</ui-col>
      <ui-col>Definition</ui-col>
    </ui-row>

    <ui-row>
      <ui-col>mitigate</ui-col>
      <ui-col mask-text="Tap to reveal">to make something less severe</ui-col>
    </ui-row>

    <ui-row auto-number="fill">
      <ui-col>First point</ui-col>
      <ui-col>Second point</ui-col>
    </ui-row>

  </ui-group>
</ui-table>

<script src="ui-table.js"></script>
```

The original `<ui-table>` element is hidden after rendering, and the generated markup is inserted immediately before it.

---

## Tags

| Tag | Role |
| --- | --- |
| `<ui-table>` | Root element. One instance per table. |
| `<ui-group>` | Optional collapsible section with a header bar. A table may contain several groups, or none at all. |
| `<ui-row>` | A row. Column count for the whole table is taken from the first non-empty `<ui-row>`. |
| `<ui-row-enhance>` | Same as `<ui-row>`, but the column count is local to this row instead of inherited from the table. Use it for rows that break the global grid. |
| `<ui-col>` | A cell. Accepts arbitrary inline HTML as content. |
| `<cell-item>` | A carousel slide. Only meaningful inside a `<ui-col>` that has `carousel-interval`. |

A `<ui-col>` carrying both `hidden` and `id` is treated as a **source column**: it is never rendered, and its inner HTML can be referenced by `alert-msg`.

---

## Attributes

### `<ui-table>`

| Attribute | Values | Description |
| --- | --- | --- |
| `theme` | palette name or CSS color | Base color for borders, group headers and text. Default `shell`. |
| `font-color` | palette name or CSS color | Overrides the text color only. Borders and group headers keep the theme color. |
| `font-size` | CSS length | Base font size for the table. Default `1rem`. |
| `src` | URL | Loads table data from a JSON file. See [JSON data source](#json-data-source). |
| `data-id` | global variable name | Loads table data from `window[name]`. |
| `cell-alignment` | `left` \| `center` \| `right` | Horizontal alignment inside cells. Default `left`. |
| `vertical-alignment` | `top` \| `middle` \| `bottom` | Vertical alignment inside cells. Default `top`. |
| `cell-min-height` | CSS length | Minimum height for every cell. |
| `hover-bg-color` | palette name or CSS color | Hover background for cells. Hex values are applied at low opacity. |
| `row-border` | CSS border shorthand without color | Default border for every row, for example `1px solid`. The theme color is appended automatically. |
| `auto-reveal-interval` | milliseconds | Rows marked `hidden` are revealed one by one at this interval. |

### `<ui-group>`

| Attribute | Values | Description |
| --- | --- | --- |
| `title-left` | text | Main title in the header bar. |
| `title-right` | text | Secondary text, right aligned, slightly smaller. |
| `ini-collapse` | boolean | Group starts collapsed. |

Clicking the header bar toggles the group open or closed.

### `<ui-row>` / `<ui-row-enhance>`

| Attribute | Values | Description |
| --- | --- | --- |
| `hidden` | boolean | Row is rendered but not displayed. Revealed by `auto-reveal-interval` or `show-next`. |
| `col-widths` | ratio, for example `2:1:1` | Column width ratios. The number of parts must match the column count, otherwise the row is skipped with a console error. Ignored when any cell uses `span`. |
| `cell-padding` | CSS length | Padding for cells in this row. Default `6px`. |
| `border` | CSS border shorthand without color | Border for this row; overrides `row-border`. |
| `col-border` | CSS border shorthand without color | Vertical separator drawn between cells. Ignored when any cell uses `span`. |
| `font-size` | CSS length | Font size for cells in this row. |
| `font-color` | palette name or CSS color | Text color for cells in this row. |
| `line-height` | number or CSS length | Line height for cell text. |
| `text-indent` | CSS length | Text indent for cell text. |
| `auto-number` | `outline` \| `fill` \| `outline-v` \| `fill-v` \| `v` | Numbered circles in front of cell content. See [auto-number](#auto-number). |
| `arrow` | empty \| `right` \| `click` \| `none` | Default arrow mode for every column boundary in this row. See [Arrows](#arrows). |
| `arrow-size` | number (px) or CSS length | Arrow height. Default `1.5rem`. |
| `arrow-color` | palette name or CSS color | Arrow fill. Default `focus`. |
| `arrow-pos` | `top` \| `center` \| `bottom` | Vertical placement of the arrow. Default `center`. |
| `arrow-open` | boolean | For `arrow="click"`, the cell to the right starts visible. |

### `<ui-col>`

**Layout**

| Attribute | Values | Description |
| --- | --- | --- |
| `span` | number \| `all` | Cell spans several grid columns, or the whole row. |
| `width` | CSS length | Fixed width for this cell. |
| `fixed` | `left` \| `right` | Sticky column that stays in place while the table scrolls horizontally. |

**Content and style**

| Attribute | Values | Description |
| --- | --- | --- |
| `icon` | built-in name or `bi-*` | Icon before the cell content. Overrides `auto-number` for this cell. |
| `font-color` | palette name or CSS color | Text color. Highest priority: cell > row > table > theme. |
| `inverse` | boolean | Fills the cell with the text color and prints the text in the background color. |
| `expandable` | boolean | Clamps content to two lines with a toggle to expand and collapse. |
| `extra-info` | element id | Shows a grip icon; clicking it opens a popover containing that element's HTML. The source element is hidden on load, and its content is read at click time so later edits are reflected. |

**Masks**

| Attribute | Values | Description |
| --- | --- | --- |
| `mask-text` | text | Covers the cell with a clickable mask showing this label. |
| `mask-text-2` | text | Two-stage mask: the first click swaps the label, the second reveals the cell. |
| `mask-color` | palette name or CSS color | Mask background, or mask text color when `mask-invert` is set. |
| `mask-invert` | boolean | Dark mask with colored text instead of a colored mask with dark text. |
| `mask-gradient` | `1` to `6`, or a CSS gradient | Preset or custom gradient background for the mask. |
| `mask-order` | integer | Chained unlocking. Masks unlock strictly in ascending order within the group, or within the whole table when there are no groups. Locked masks show a padlock. |

**Carousel**

| Attribute | Values | Description |
| --- | --- | --- |
| `carousel-interval` | milliseconds | Rotates through the cell's `<cell-item>` children. Default `3000`. |
| `progress-bar` | boolean | Thin countdown bar under the carousel. |
| `progress-bar-color` | palette name or CSS color | Progress bar color. |

**Alerts**

| Attribute | Values | Description |
| --- | --- | --- |
| `alert-msg` | text or source column id | Message content. If the value matches the `id` of a hidden source column, that column's HTML is used. |
| `alert-interval` | milliseconds | How often the alert appears. Required. |
| `alert-pos` | `A` \| `B` \| `C` | Required. `A` overlays the cell, `B` floats above it, `C` floats to its right. |
| `alert-color` | palette name or CSS color | Alert background. |

Each alert stays visible for `UiTableConfig.alertDuration` milliseconds (default `5000`).

**Progressive reveal**

| Attribute | Values | Description |
| --- | --- | --- |
| `show-next` | `true` \| `col` \| `row` | Clicking the cell reveals the next row. `row` reveals the entire next row; `col` reveals only the cell directly below. With `true`, a row containing several `show-next` cells behaves as `col`, and a row with a single one behaves as `row`. |

**Arrows**

`arrow`, `arrow-size`, `arrow-color`, `arrow-pos` and `arrow-open` work exactly as on the row, and a value set on the cell overrides the row value. Use `arrow="none"` to opt a single column out of a row-level setting.

---

## Features

### auto-number

Set on a row. Numbered circles are inserted before the content of each cell that has no explicit `icon`.

| Value | Behavior |
| --- | --- |
| `outline` (default) | Horizontal. Numbering restarts from 1 on every row, outlined circles. |
| `fill` | Horizontal, filled circles. |
| `outline-v`, `fill-v`, `v` | Vertical. One number per row, accumulated across rows within the group (or the whole table if there are no groups), shared by every cell in that row. |

Cells with an explicit `icon` keep their icon but still consume a number in horizontal mode, so the sequence may skip values.

Numbers 0 to 9 are rendered with Bootstrap Icons; 10 and above fall back to an inline SVG circle of the same size.

### Masks and chained unlocking

- A plain `mask-text` mask is unlocked by a single click.
- `mask-text-2` makes the mask two-stage.
- `mask-order` turns a set of masks into an ordered chain: only the lowest unopened number is clickable, and the rest stay locked with a padlock until their turn comes.
- Duplicate `mask-order` values log an error and fall back to unordered behavior. Gaps in the sequence log a warning but still work.

### Arrows between columns

`arrow` is set on the **left** column of a boundary, and the arrow is drawn on the border between that column and the one to its right. The two neighbouring cells automatically reserve padding so text is never covered.

- `arrow` or `arrow="right"`: a decorative thick arrow with a tail.
- `arrow="click"`: a solid triangle. Clicking it reveals the cell to the right; clicking again hides it. Chains work, so A reveals B reveals C.
- An arrow hides itself when its left cell is hidden, when the row wraps, or when the row is not visible.

### Popovers

`extra-info` popovers are appended to `<body>`, so they are never clipped by cell overflow. They reposition on scroll and resize, flip above the icon when there is not enough room below, close on outside click or `Esc`, and only one is open at a time.

---

## Theme colors

Any attribute that accepts a color takes either a palette name or a raw CSS color (`#hex`, `rgb(...)`).

| Name | Hex | Name | Hex |
| --- | --- | --- | --- |
| `shell` | `#C6C7BD` | `vanilla` | `#DBEDD8` |
| `lavender` | `#C3A5E5` | `yellow` | `#E3D322` |
| `special` | `#B3DE73` | `info` | `#2351DB` |
| `warning` | `#E6374B` | `indigo` | `#7849C9` |
| `salmon` | `#E5C3B3` | `pink` | `#FF91D7` |
| `sky` | `#82C8E5` | `focus` | `#D4FFFC` |
| `ocean` | `#1CCAE8` | `orange` | `#EDA109` |
| `safe` | `#27AE60` | `teal` | `#0DA591` |

The component assumes a dark page background and uses `#0C0D0C` for inverted text, sticky-column backing and mask contrast.

Mask gradient presets `1` to `6` are indigo, ocean, orange, pink, teal and a blue to indigo blend.

---

## Icons

Built-in SVG icons, usable in `icon`:

`i-arrow-down`, `i-arrow-up`, `i-arrow-right`, `i-arrow-left`, `i-check`, `i-expand`, `i-collapse`, `i-lock`, `i-grip`

Any Bootstrap Icons class also works, for example `icon="bi-star-fill"`.

---

## JSON data source

Instead of markup, a table can be described as JSON and loaded with `src` (fetched URL) or `data-id` (global variable).

```html
<ui-table theme="teal" src="data/unit-1.json"></ui-table>

<ui-table theme="teal" data-id="UNIT_DATA"></ui-table>
<script>
  window.UNIT_DATA = { /* ... */ };
</script>
</script>
```

Shape:

```json
{
  "fontSize": "1rem",
  "fontColor": "vanilla",
  "cellAlignment": "left",
  "verticalAlignment": "top",
  "hoverBgColor": "sky",
  "cellMinHeight": "48px",
  "rowBorder": "1px solid",
  "autoRevealInterval": 0,
  "groups": [
    {
      "titleLeft": "Unit 1",
      "titleRight": "6 items",
      "iniCollapse": false,
      "rows": [
        {
          "enhance": false,
          "hidden": false,
          "colWidths": "1:2",
          "colBorder": "1px solid",
          "cellPadding": "8px",
          "border": "1px solid",
          "fontSize": "1rem",
          "fontColor": "shell",
          "lineHeight": "1.5",
          "textIndent": "0",
          "autoNumber": "fill",
          "arrow": "click",
          "arrowSize": "1.5rem",
          "arrowColor": "focus",
          "arrowPos": "center",
          "arrowOpen": false,
          "cols": [
            { "icon": "bi-star-fill", "content": "Term" },
            {
              "content": "Definition",
              "maskText": "Tap to reveal",
              "maskText2": "Once more",
              "maskColor": "indigo",
              "maskInvert": false,
              "maskOrder": 1,
              "span": 1,
              "width": "200px",
              "fixed": "left",
              "inverse": false,
              "expandable": false,
              "showNext": false,
              "extraInfo": "note-1",
              "carouselInterval": 3000,
              "progressBar": true,
              "progressBarColor": "teal",
              "alertMsg": "Remember this",
              "alertColor": "warning",
              "alertInterval": 8000,
              "alertPos": "C",
              "items": ["slide one", "slide two"]
            }
          ]
        }
      ]
    }
  ]
}
```

Notes:

- `items` takes precedence over `content`. Use it together with `carouselInterval`.
- Boolean flags map to presence-only attributes, so `false` simply omits them.
- `maskGradient` is not part of the JSON mapping; use markup when you need gradient masks.
- Everything must live inside `groups`. A JSON table without groups is not supported.

---

## Global configuration

Define `window.UiTableConfig` **before** loading the script to change defaults:

```html
<script>
  window.UiTableConfig = {
    theme:              'shell',
    cellPadding:        '6px',
    fontSize:           '1rem',
    alertDuration:      5000,
    autoRevealInterval: 0,
    cellAlignment:      'left',
    verticalAlignment:  'top',
    hoverBgColor:       '',
    cellMinHeight:      '',
    rowBorder:          '',
    arrowSize:          '1.5rem',
    arrowColor:         'focus',
    arrowPos:           'center'
  };
</script>
<script src="ui-table.js"></script>
```

Per-element attributes always win over these defaults.

---

## JavaScript API

```js
UiTable.init();     // render any <ui-table> that has not been initialized yet
UiTable.config;     // the live UiTableConfig object
UiTable.colors;     // the brand palette, { shell: '#C6C7BD', ... }
```

Tables are initialized automatically on `DOMContentLoaded`, or immediately if the script is loaded after the document is ready. Call `UiTable.init()` again after injecting new `<ui-table>` markup; already-rendered tables are skipped. An error in one table never prevents the others from rendering.

---

## Mutual exclusions and warnings

The component is defensive and reports problems to the console instead of failing silently.

| Combination | Result |
| --- | --- |
| `mask-text` + `expandable` | `expandable` ignored (warning) |
| `mask-text` + `carousel-interval` | `carousel-interval` ignored (warning) |
| `mask-text` + `extra-info` | `extra-info` ignored (warning) |
| `alert-msg` + `carousel-interval` | `carousel-interval` ignored (warning) |
| `carousel-interval` + `extra-info` | `extra-info` ignored (warning) |
| `arrow` + `mask-text` on either side | arrow ignored (warning) |
| `extra-info` without a value | ignored (error) |
| `arrow` on the last column | ignored (warning) |
| `col-widths` count mismatch | the row is skipped (error) |
| duplicate `mask-order` | treated as unordered (error) |
| non-contiguous `mask-order` | still works (warning) |
| `show-next` with no following row | ignored (warning) |
| `alert-msg` without `alert-interval` or `alert-pos` | ignored (error) |

---

## Browser support

Modern evergreen browsers. CSS Grid, `position: sticky` and `fetch` are required. `ResizeObserver` and `MutationObserver` are used for arrow placement when available and degrade gracefully when not.

---

## License

MIT

<br>

---

<br>

# ui-table.js（繁體中文）

一個零相依、以語意標籤撰寫的瀏覽器表格元件。用 `<ui-table>` / `<ui-row>` / `<ui-col>` 標記（或改用 JSON 餵資料），腳本就會渲染出一張 CSS Grid 表格，內建可摺疊分組、遮罩儲存格、輪播、彈出說明、定時提示、欄間箭頭與逐步揭示。

- 不需打包工具、不依賴框架、不使用 Shadow DOM，只要一個 `<script>`。
- CSS 自動注入，配色由內建色盤驅動。
- 於 `DOMContentLoaded` 自動初始化，動態內容可手動再次執行。

---

## 目錄

- [安裝](#安裝)
- [快速開始](#快速開始)
- [標籤](#標籤)
- [屬性](#屬性)
  - [`<ui-table>`](#ui-table-1)
  - [`<ui-group>`](#ui-group-1)
  - [`<ui-row>` / `<ui-row-enhance>`](#ui-row--ui-row-enhance-1)
  - [`<ui-col>`](#ui-col-1)
- [功能說明](#功能說明)
- [佈景顏色](#佈景顏色)
- [圖示](#圖示)
- [JSON 資料來源](#json-資料來源)
- [全域設定](#全域設定)
- [JavaScript API](#javascript-api-1)
- [互斥規則與警告](#互斥規則與警告)
- [瀏覽器支援](#瀏覽器支援)
- [授權](#授權)

---

## 安裝

下載 `ui-table.js`，放在 `<body>` 結尾：

```html
<script src="ui-table.js"></script>
```

Bootstrap Icons 為選用，但建議載入。使用 `bi-*` 圖示、`auto-number` 的 0 到 9 圓圈數字、以及 `show-next` 的下拉箭頭時必須要有：

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
```

元件載入時會自行插入 `<style id="uit-css">`，不需要額外的樣式檔。

---

## 快速開始

```html
<ui-table theme="sky" font-size="1rem">
  <ui-group title-left="Unit 1" title-right="6 items">

    <ui-row col-widths="1:2" col-border="1px solid">
      <ui-col icon="i-check">Term</ui-col>
      <ui-col>Definition</ui-col>
    </ui-row>

    <ui-row>
      <ui-col>mitigate</ui-col>
      <ui-col mask-text="點擊顯示">to make something less severe</ui-col>
    </ui-row>

    <ui-row auto-number="fill">
      <ui-col>第一點</ui-col>
      <ui-col>第二點</ui-col>
    </ui-row>

  </ui-group>
</ui-table>

<script src="ui-table.js"></script>
```

渲染後原本的 `<ui-table>` 會被隱藏，產生的實際表格會插入在它前面。

---

## 標籤

| 標籤 | 用途 |
| --- | --- |
| `<ui-table>` | 根元素，一張表格一個。 |
| `<ui-group>` | 選用的可摺疊分組，附標題列。一張表可以有多個分組，也可以完全不用。 |
| `<ui-row>` | 列。整張表的欄數取自第一個有內容的 `<ui-row>`。 |
| `<ui-row-enhance>` | 與 `<ui-row>` 相同，但欄數以該列自己的儲存格數為準，不沿用整表欄數。適合需要跳脫整體格線的列。 |
| `<ui-col>` | 儲存格，內容可放任意行內 HTML。 |
| `<cell-item>` | 輪播的單張內容，只在設有 `carousel-interval` 的 `<ui-col>` 中有意義。 |

同時帶有 `hidden` 與 `id` 的 `<ui-col>` 會被視為**來源欄位**：不會被渲染，其內部 HTML 可供 `alert-msg` 引用。

---

## 屬性

### `<ui-table>`

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `theme` | 色盤名稱或 CSS 顏色 | 邊框、分組標題列與文字的基礎色。預設 `shell`。 |
| `font-color` | 色盤名稱或 CSS 顏色 | 只覆寫文字顏色，邊框與分組標題列仍用 theme 色。 |
| `font-size` | CSS 長度 | 表格基礎字級。預設 `1rem`。 |
| `src` | URL | 從 JSON 檔載入表格資料，見 [JSON 資料來源](#json-資料來源)。 |
| `data-id` | 全域變數名稱 | 從 `window[名稱]` 讀取表格資料。 |
| `cell-alignment` | `left` \| `center` \| `right` | 儲存格內的水平對齊。預設 `left`。 |
| `vertical-alignment` | `top` \| `middle` \| `bottom` | 儲存格內的垂直對齊。預設 `top`。 |
| `cell-min-height` | CSS 長度 | 所有儲存格的最小高度。 |
| `hover-bg-color` | 色盤名稱或 CSS 顏色 | 滑鼠移入時的儲存格底色，hex 會自動轉為低透明度。 |
| `row-border` | 不含顏色的 CSS border 簡寫 | 所有列的預設邊框，例如 `1px solid`，顏色會自動接上 theme 色。 |
| `auto-reveal-interval` | 毫秒 | 標記 `hidden` 的列會依此間隔逐列顯示。 |

### `<ui-group>`

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `title-left` | 文字 | 標題列的主標題。 |
| `title-right` | 文字 | 靠右的次要文字，字級略小。 |
| `ini-collapse` | 布林 | 載入時即為摺疊狀態。 |

點擊標題列可切換展開與摺疊。

### `<ui-row>` / `<ui-row-enhance>`

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `hidden` | 布林 | 該列會被渲染但不顯示，可由 `auto-reveal-interval` 或 `show-next` 揭示。 |
| `col-widths` | 比例，例如 `2:1:1` | 欄寬比例。比例數必須與欄數相同，否則該列不渲染並輸出 console 錯誤。任一儲存格使用 `span` 時此設定失效。 |
| `cell-padding` | CSS 長度 | 該列儲存格的內距。預設 `6px`。 |
| `border` | 不含顏色的 CSS border 簡寫 | 該列邊框，優先於 `row-border`。 |
| `col-border` | 不含顏色的 CSS border 簡寫 | 儲存格之間的垂直分隔線。任一儲存格使用 `span` 時失效。 |
| `font-size` | CSS 長度 | 該列的字級。 |
| `font-color` | 色盤名稱或 CSS 顏色 | 該列的文字顏色。 |
| `line-height` | 數值或 CSS 長度 | 儲存格文字的行高。 |
| `text-indent` | CSS 長度 | 儲存格文字的首行縮排。 |
| `auto-number` | `outline` \| `fill` \| `outline-v` \| `fill-v` \| `v` | 在儲存格內容前加上圓圈編號，見 [auto-number](#auto-number-1)。 |
| `arrow` | 空值 \| `right` \| `click` \| `none` | 該列所有欄界的預設箭頭模式，見 [欄間箭頭](#欄間箭頭)。 |
| `arrow-size` | 數字（px）或 CSS 長度 | 箭頭高度。預設 `1.5rem`。 |
| `arrow-color` | 色盤名稱或 CSS 顏色 | 箭頭填色。預設 `focus`。 |
| `arrow-pos` | `top` \| `center` \| `bottom` | 箭頭的垂直位置。預設 `center`。 |
| `arrow-open` | 布林 | 搭配 `arrow="click"`，右側儲存格一開始就是顯示的。 |

### `<ui-col>`

**版面**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `span` | 數字 \| `all` | 跨越多個格線欄位，或佔滿整列。 |
| `width` | CSS 長度 | 該儲存格的固定寬度。 |
| `fixed` | `left` \| `right` | 凍結欄位，水平捲動時固定於左側或右側。 |

**內容與樣式**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `icon` | 內建名稱或 `bi-*` | 內容前方的圖示，會取代該儲存格的 `auto-number`。 |
| `font-color` | 色盤名稱或 CSS 顏色 | 文字顏色，優先順序為儲存格 > 列 > 表格 > theme。 |
| `inverse` | 布林 | 以文字色填滿儲存格底色，文字改用背景色。 |
| `expandable` | 布林 | 內容收合為兩行，附展開與收合切換。 |
| `extra-info` | 元素 id | 顯示握把圖示，點擊後以彈出視窗呈現該元素的 HTML。來源元素載入時即隱藏，內容在點擊當下才讀取，因此之後的修改也會反映。 |

**遮罩**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `mask-text` | 文字 | 以可點擊的遮罩蓋住儲存格，並顯示此文字。 |
| `mask-text-2` | 文字 | 雙層遮罩：第一次點擊換成此文字，第二次才揭露內容。 |
| `mask-color` | 色盤名稱或 CSS 顏色 | 遮罩底色；設定 `mask-invert` 時則為遮罩文字色。 |
| `mask-invert` | 布林 | 改為深色底搭配彩色文字，而非彩色底搭配深色文字。 |
| `mask-gradient` | `1` 到 `6`，或自訂 CSS 漸層 | 遮罩的漸層背景，可用預設值或自行指定。 |
| `mask-order` | 整數 | 連鎖解鎖。同一分組內（無分組時為整張表）依數字由小到大依序解鎖，未輪到的遮罩顯示鎖頭。 |

**輪播**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `carousel-interval` | 毫秒 | 依序輪播該儲存格底下的 `<cell-item>`。預設 `3000`。 |
| `progress-bar` | 布林 | 在輪播下方顯示細的倒數進度條。 |
| `progress-bar-color` | 色盤名稱或 CSS 顏色 | 進度條顏色。 |

**提示訊息**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `alert-msg` | 文字或來源欄位 id | 訊息內容。若值與某個隱藏來源欄位的 `id` 相同，則改用該欄位的 HTML。 |
| `alert-interval` | 毫秒 | 訊息出現的間隔，必填。 |
| `alert-pos` | `A` \| `B` \| `C` | 必填。`A` 覆蓋儲存格，`B` 浮在上方，`C` 浮在右側。 |
| `alert-color` | 色盤名稱或 CSS 顏色 | 訊息底色。 |

每次顯示的時間長度由 `UiTableConfig.alertDuration` 決定，預設 `5000` 毫秒。

**逐步揭示**

| 屬性 | 可用值 | 說明 |
| --- | --- | --- |
| `show-next` | `true` \| `col` \| `row` | 點擊儲存格以揭示下一列。`row` 展開整列，`col` 只展開正下方的那一格。使用 `true` 時，同列有兩個以上 `show-next` 視為 `col`，只有一個則視為 `row`。 |

**箭頭**

`arrow`、`arrow-size`、`arrow-color`、`arrow-pos`、`arrow-open` 的用法與列層級相同，設在儲存格上會覆寫列的設定。若列層級已設定箭頭，可用 `arrow="none"` 讓個別欄位關閉。

---

## 功能說明

### auto-number

設在列上。沒有指定 `icon` 的儲存格，內容前方會插入圓圈編號。

| 值 | 行為 |
| --- | --- |
| `outline`（預設） | 橫向。每列由 1 重新起算，空心圓圈。 |
| `fill` | 橫向，實心圓圈。 |
| `outline-v`、`fill-v`、`v` | 縱向。每列只領一個序號，在同一分組（無分組時為整張表）內跨列累計，同列所有儲存格共用該序號。 |

有自訂 `icon` 的儲存格保留圖示，但在橫向模式下仍佔用該位置的編號，因此序號可能跳號。

0 到 9 使用 Bootstrap Icons 繪製，10 以上改用同尺寸的內嵌 SVG 圓圈。

### 遮罩與連鎖解鎖

- 單純的 `mask-text` 遮罩點一下即可揭露。
- `mask-text-2` 讓遮罩變成兩段式。
- `mask-order` 會把一組遮罩串成鎖鏈：只有目前序號最小且尚未開啟的遮罩可點擊，其餘顯示鎖頭等待輪到。
- `mask-order` 重複會輸出錯誤並退回為無序行為；序號不連續則只輸出警告，功能仍正常。

### 欄間箭頭

`arrow` 設在欄界的**左側**欄位，箭頭會畫在它與右側欄位的交界線上。兩側儲存格會自動預留內距，文字不會被壓到。

- `arrow` 或 `arrow="right"`：有箭尾的粗箭頭，純顯示用。
- `arrow="click"`：實心三角形，點擊後顯示右側儲存格，再點一次收合。可以連鎖，例如甲揭示乙、乙再揭示丙。
- 左側儲存格被隱藏、該列換行、或整列不可見時，箭頭會自動隱藏。

### 彈出說明

`extra-info` 的彈出視窗掛在 `<body>` 上，不會被儲存格的 overflow 裁切。它會隨捲動與視窗縮放重新定位，下方空間不足時改翻到圖示上方，點擊外部或按 `Esc` 即關閉，且全頁同時只會開啟一個。

---

## 佈景顏色

所有接受顏色的屬性都可以填色盤名稱，或直接填 CSS 顏色（`#hex`、`rgb(...)`）。

| 名稱 | 色碼 | 名稱 | 色碼 |
| --- | --- | --- | --- |
| `shell` | `#C6C7BD` | `vanilla` | `#DBEDD8` |
| `lavender` | `#C3A5E5` | `yellow` | `#E3D322` |
| `special` | `#B3DE73` | `info` | `#2351DB` |
| `warning` | `#E6374B` | `indigo` | `#7849C9` |
| `salmon` | `#E5C3B3` | `pink` | `#FF91D7` |
| `sky` | `#82C8E5` | `focus` | `#D4FFFC` |
| `ocean` | `#1CCAE8` | `orange` | `#EDA109` |
| `safe` | `#27AE60` | `teal` | `#0DA591` |

元件預設頁面為深色底，並以 `#0C0D0C` 作為反白文字、凍結欄底色與遮罩對比色。

遮罩漸層預設值 `1` 到 `6` 依序為靛紫、海藍、橘、粉紅、藍綠，以及藍轉靛紫的混合。

---

## 圖示

內建 SVG 圖示，可用於 `icon`：

`i-arrow-down`、`i-arrow-up`、`i-arrow-right`、`i-arrow-left`、`i-check`、`i-expand`、`i-collapse`、`i-lock`、`i-grip`

也可直接使用任何 Bootstrap Icons 類別，例如 `icon="bi-star-fill"`。

---

## JSON 資料來源

除了標記之外，表格也可以用 JSON 描述，透過 `src`（抓取網址）或 `data-id`（全域變數）載入。

```html
<ui-table theme="teal" src="data/unit-1.json"></ui-table>

<ui-table theme="teal" data-id="UNIT_DATA"></ui-table>
<script>
  window.UNIT_DATA = { /* ... */ };
</script>
```

結構：

```json
{
  "fontSize": "1rem",
  "fontColor": "vanilla",
  "cellAlignment": "left",
  "verticalAlignment": "top",
  "hoverBgColor": "sky",
  "cellMinHeight": "48px",
  "rowBorder": "1px solid",
  "autoRevealInterval": 0,
  "groups": [
    {
      "titleLeft": "Unit 1",
      "titleRight": "6 items",
      "iniCollapse": false,
      "rows": [
        {
          "enhance": false,
          "hidden": false,
          "colWidths": "1:2",
          "colBorder": "1px solid",
          "cellPadding": "8px",
          "border": "1px solid",
          "fontSize": "1rem",
          "fontColor": "shell",
          "lineHeight": "1.5",
          "textIndent": "0",
          "autoNumber": "fill",
          "arrow": "click",
          "arrowSize": "1.5rem",
          "arrowColor": "focus",
          "arrowPos": "center",
          "arrowOpen": false,
          "cols": [
            { "icon": "bi-star-fill", "content": "Term" },
            {
              "content": "Definition",
              "maskText": "點擊顯示",
              "maskText2": "再點一次",
              "maskColor": "indigo",
              "maskInvert": false,
              "maskOrder": 1,
              "span": 1,
              "width": "200px",
              "fixed": "left",
              "inverse": false,
              "expandable": false,
              "showNext": false,
              "extraInfo": "note-1",
              "carouselInterval": 3000,
              "progressBar": true,
              "progressBarColor": "teal",
              "alertMsg": "記得複習",
              "alertColor": "warning",
              "alertInterval": 8000,
              "alertPos": "C",
              "items": ["第一張", "第二張"]
            }
          ]
        }
      ]
    }
  ]
}
```

注意事項：

- `items` 優先於 `content`，請與 `carouselInterval` 搭配使用。
- 布林旗標對應到「有設就生效」的屬性，填 `false` 等同於不加該屬性。
- `maskGradient` 不在 JSON 對應範圍內，需要漸層遮罩請改用標記撰寫。
- 所有內容都必須放在 `groups` 之中，JSON 不支援沒有分組的表格。

---

## 全域設定

在載入腳本**之前**定義 `window.UiTableConfig` 即可調整預設值：

```html
<script>
  window.UiTableConfig = {
    theme:              'shell',
    cellPadding:        '6px',
    fontSize:           '1rem',
    alertDuration:      5000,
    autoRevealInterval: 0,
    cellAlignment:      'left',
    verticalAlignment:  'top',
    hoverBgColor:       '',
    cellMinHeight:      '',
    rowBorder:          '',
    arrowSize:          '1.5rem',
    arrowColor:         'focus',
    arrowPos:           'center'
  };
</script>
<script src="ui-table.js"></script>
```

個別元素上的屬性永遠優先於這些預設值。

---

## JavaScript API

```js
UiTable.init();     // 渲染所有尚未初始化的 <ui-table>
UiTable.config;     // 目前生效的 UiTableConfig 物件
UiTable.colors;     // 內建色盤，{ shell: '#C6C7BD', ... }
```

元件會在 `DOMContentLoaded` 自動初始化；若腳本在文件就緒後才載入，則立即執行。動態插入新的 `<ui-table>` 標記後再呼叫一次 `UiTable.init()` 即可，已渲染過的表格會自動略過。單一表格初始化失敗時不會影響其他表格。

---

## 互斥規則與警告

元件採防禦式設計，遇到問題會輸出到 console，而不是默默失敗。

| 組合 | 結果 |
| --- | --- |
| `mask-text` + `expandable` | 忽略 `expandable`（警告） |
| `mask-text` + `carousel-interval` | 忽略 `carousel-interval`（警告） |
| `mask-text` + `extra-info` | 忽略 `extra-info`（警告） |
| `alert-msg` + `carousel-interval` | 忽略 `carousel-interval`（警告） |
| `carousel-interval` + `extra-info` | 忽略 `extra-info`（警告） |
| `arrow` 與任一側的 `mask-text` | 忽略箭頭（警告） |
| `extra-info` 未填值 | 忽略（錯誤） |
| `arrow` 設在最後一欄 | 忽略（警告） |
| `col-widths` 數量不符 | 略過該列渲染（錯誤） |
| `mask-order` 重複 | 視為無序（錯誤） |
| `mask-order` 不連續 | 仍可運作（警告） |
| `show-next` 後面沒有下一列 | 忽略（警告） |
| `alert-msg` 缺少 `alert-interval` 或 `alert-pos` | 忽略（錯誤） |

---

## 瀏覽器支援

支援現代常青瀏覽器，需要 CSS Grid、`position: sticky` 與 `fetch`。箭頭定位會在可用時使用 `ResizeObserver` 與 `MutationObserver`，不支援時會自動降級。

---

## 授權

MIT
