# ui-layer-diff

一個極簡的 Web Component，把「從籠統到具體」的逐層改寫做成可切換、可自動播放的方框。每一層會自動和上一層比對，新增的部分用增加色標示，被取代的部分用減去色加刪除線。

適合用在語言教學、文章修改歷程、文案前後對照等需要「一步一步看出差異」的場合。

- 版本：1.0.0
- 建立日期：10-29-26
- 單一檔案、零依賴：`ui-layer-diff.js`
- 不使用 Shadow DOM，CSS 由 JS 自動注入，頁面不需另外引入樣式表

## 快速開始

```html
<script src="ui-layer-diff.js"></script>

<ui-layer-diff>
  <ui-layer label="籠統">I enjoy cooking.</ui-layer>
  <ui-layer label="加上做什麼與為誰">I enjoy making some quick pasta for my family after work.</ui-layer>
  <ui-layer label="加上情境細節">I enjoy making some quick pasta for my family, even after a hectic day with back-to-back meetings.</ui-layer>
</ui-layer-diff>
```

第二層會顯示「cooking」被刪除、「making some quick pasta for my family after work」被新增，第三層以此類推。

腳本可放在 `<head>` 或 `<body>` 任何位置。元件會等到 DOM 解析完成後再讀取 `<ui-layer>` 子元素。

## 功能

- 自動比對相鄰兩層的差異，不需要手動標記。英文以單字為單位，中文以單字（字元）為單位。
- 手動模式：上一層、下一層、圓點跳轉。
- 自動播放模式：可設定間隔、是否循環，並有暫停與播放按鈕。
- 顯示當前完整句子，增刪多處時一眼就能看到結果。
- 橫向漸層進度條，顯示整體步驟，點擊可跳層。
- 外觀全部用屬性控制：寬度、主題、內距、字級、邊框、增減顏色。
- 內建 10 種主題，顏色可直接寫色票名稱。

## 屬性

### `<ui-layer-diff>`

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `width` | `100%` | 元件寬度。純數字視為 px，也可寫 `50%`、`40rem`。 |
| `theme` | `dark` | `dark`、`light`、`ocean`、`lavender`、`teal`、`pink`、`orange`、`salmon`、`sky`、`yellow`。 |
| `padding` | `16` | 內距。純數字視為 px，可寫兩個值，例如 `8 24`。 |
| `font-size` | `1.125` | 內文字級。純數字視為 rem，標題與按鈕依比例縮放。 |
| `border` | `1px solid`（主題色） | 寬度、樣式、顏色可任意省略，順序不限。顏色可用色票名稱或 hex。`none` 取消邊框。 |
| `add-color` | `dark` 系為 `special`，`light` 為 `info` | 增加部分的文字色。 |
| `del-color` | `warning` | 減去部分的文字色，並加刪除線。 |
| `mode` | `manual` | `manual` 為手動切換，`auto` 為自動播放。 |
| `interval` | `2500` | 自動播放間隔，單位毫秒，最小 300。 |
| `loop` | 無 | 布林屬性。有寫時，最後一層之後回到第一層，上一層與下一層也會循環。 |
| `start` | `1` | 起始層，從 1 起算。 |
| `controls` | `true` | 設為 `false` 隱藏控制列。 |
| `legend` | `true` | 設為 `false` 隱藏圖例。 |
| `show-del` | `true` | 設為 `false` 不顯示減去的部分。 |
| `add-label`、`del-label` | `增加`、`減去` | 圖例文字。 |
| `show-result` | `false` | 顯示該層乾淨的完整句子。寫成 `show-result` 或 `show-result="true"` 開啟，`show-result="false"` 關閉。第一層的內容和當前句子完全相同，所以不顯示。 |
| `result-label` | `完整句子` | 完整句子區塊的標題文字。 |
| `result-gap` | `10` | 完整句子上方的空白，也就是虛線上方的距離。純數字視為 px，`0` 代表緊貼。 |
| `progress` | `false` | 顯示橫向漸層進度條，寫法同 `show-result`。點進度條可跳到對應的層。 |
| `progress-from`、`progress-to` | 主題色、增加色 | 漸層的起點與終點顏色，可寫色票名稱或 hex。 |
| `progress-height` | `10` | 進度條高度，純數字視為 px。 |
| `progress-position` | `bottom` | `bottom` 在文字下方、控制列上方，`top` 在標題與文字之間。 |
| `progress-ticks` | `true` | 設為 `false` 隱藏各層之間的分隔刻度。 |

屬性在執行期間修改會立即生效，不需要重新建立元素。

### `<ui-layer>`

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `label` | `第 N 層` | 該層左上角的標題。 |
| `note` | 無 | 該層文字下方的補充說明，用強調色顯示。 |

## 色票

顏色屬性（`add-color`、`del-color`、`border`、`progress-from`、`progress-to`）可直接寫以下名稱，也可以寫 hex。

| 名稱 | 色碼 | 名稱 | 色碼 |
| --- | --- | --- | --- |
| `bg` | `#0C0D0C` | `shell` | `#C6C7BD` |
| `lavender` | `#C3A5E5` | `sky` | `#82C8E5` |
| `warning` | `#E6374B` | `salmon` | `#E5C3B3` |
| `ocean` | `#1CCAE8` | `safe` | `#27AE60` |
| `teal` | `#0DA591` | `vanilla` | `#DBEDD8` |
| `yellow` | `#E3D322` | `focus` | `#D4FFFC` |
| `special` | `#B3DE73` | `info` | `#4171BF` |
| `indigo` | `#7849C9` | `pink` | `#FF91D7` |
| `orange` | `#EDA109` | | |

## JavaScript API

```js
const el = document.querySelector('ui-layer-diff');

el.next();            // 下一層
el.prev();            // 上一層
el.play();            // 開始自動播放
el.pause();           // 暫停
el.layer = 3;         // 跳到第 3 層，從 1 起算
console.log(el.layer);

// 以程式重設內容，項目可為字串或物件
el.layers = [
  'I use my phone a lot.',
  { text: 'I check my phone about fifty times a day.', label: '加上頻率', note: '用數字取代 a lot' }
];
```

| 成員 | 說明 |
| --- | --- |
| `next()`、`prev()` | 切換到下一層、上一層。有 `loop` 時會循環。 |
| `play()`、`pause()` | 開始、暫停自動播放。已在最後一層且沒有 `loop` 時，`play()` 會從第一層重新開始。 |
| `layer` | 目前層數，從 1 起算，可讀可寫。 |
| `layers` | 以陣列重設內容，項目可為字串，或 `{ text, label, note }`。重設後回到第一層。 |
| `UiLayerDiff.diff(a, b, showDel)` | 靜態方法，回傳兩段文字比對後的 HTML 字串，可單獨使用。 |

## 事件

事件皆會冒泡，可直接在 `document` 上監聽。

```js
document.addEventListener('layerchange', (e) => {
  console.log(e.detail); // { layer, total, label, source }
});

document.addEventListener('layerend', () => {
  console.log('自動播放已到最後一層');
});
```

| 事件 | detail | 說明 |
| --- | --- | --- |
| `layerchange` | `layer`、`total`、`label`、`source` | 切換層時觸發。`source` 為 `user`（使用者操作）、`auto`（自動播放）、`api`（程式呼叫）。初次渲染不會觸發。 |
| `layerend` | `total` | 自動播放到最後一層且沒有 `loop` 時觸發。 |

## 範例

### 自動播放，附完整句子與進度條

```html
<ui-layer-diff theme="dark" mode="auto" interval="2600" loop
               show-result result-label="完整句子" result-gap="24"
               progress progress-from="indigo" progress-to="pink" progress-height="14">
  <ui-layer>My job is busy.</ui-layer>
  <ui-layer>My job is busy because of meetings.</ui-layer>
  <ui-layer>My job is busy because I have back-to-back meetings on Tuesdays.</ui-layer>
</ui-layer-diff>
```

### 淺色主題與自訂外觀

```html
<ui-layer-diff theme="light" width="560" padding="24" font-size="1.25"
               border="2px dashed teal" add-color="indigo" del-color="orange">
  <ui-layer>I use my phone a lot.</ui-layer>
  <ui-layer>I check my phone about fifty times a day.</ui-layer>
</ui-layer-diff>
```

### 中文內容，只留下新增色

```html
<ui-layer-diff theme="lavender" show-del="false" legend="false" width="80%">
  <ui-layer>我喜歡看電影。</ui-layer>
  <ui-layer>我每個週末都會去電影院看一場電影。</ui-layer>
</ui-layer-diff>
```

完整的互動範例、各屬性的即時 playground 與程式碼對照，請開啟 `ui-layer-diff-demo-10-29-26.html`。

## 運作細節

- **比對方式**：先把兩層文字切成詞元（英文單字、標點、中文單字），再用最長共同子序列找出相同的部分。相同的保持原樣，只出現在新一層的標為增加，只出現在上一層的標為減去。
- **第一層**：沒有上一層可比，整句以一般文字顯示。
- **版面高度**：所有層疊放在同一個格子裡，方框高度取最高的那一層，切換時不會跳動。
- **渲染方式**：元件會用自己產生的內容取代 `<ui-layer>` 子元素。要修改內容請改 `layers` 屬性或重新建立元素。
- **CSS 注入**：樣式以 `<style id="ui-layer-diff-style">` 注入 `<head>`，選擇器都限定在 `ui-layer-diff` 之下，不會影響頁面其他元素。
- **顏色透明度**：元件內部沒有使用任何 rgba 半透明顏色。

## 瀏覽器支援

需要支援 Custom Elements v1、CSS 自訂屬性與 `clip-path` 的現代瀏覽器（Chrome、Edge、Firefox、Safari 近年版本）。

## 檔案

| 檔案 | 說明 |
| --- | --- |
| `ui-layer-diff.js` | 元件本體，單一檔案，內含 CSS。 |
| `ui-layer-diff-demo-10-29-26.html` | 範例與程式碼對照、playground、屬性與 API 一覽。 |
