# tour 鏡頭漫遊與路線圖：page-tour、route-map

把既有的教材頁面當成畫布，預先排好運鏡與特效，自動播放，直接螢幕錄影。每個元件都是單一 `.js` 檔，載入後自動注入樣式，不使用 Shadow DOM。顏色屬性都可以直接寫色票名稱（例如 `key`、`bg-alternative`），也可以寫任何 CSS 顏色。

| 檔案 | 標籤 | 用途 | 範例頁 |
| --- | --- | --- | --- |
| `page-tour.js` | `<page-tour>` `<tour-world>` `<tour-panel>` `<tour-step>` 與 `<fx-*>` | 鏡頭漫遊：原本的教材 HTML 包進 `<tour-world>`，鏡頭依劇本移動、縮放，並加上光圈、大箭頭、螢光筆、連線、彩帶等特效。 | [`page-tour-demo-11-16-26.html`](page-tour-demo-11-16-26.html) |
| `route-map.js` | `<route-map>` `<route-line>` `<route-stop>` `<route-transfer>` `<route-zone>` `<route-here>` `<route-train>` | 捷運路線圖：路線是類別、車站是項目、轉乘站是共有項目、分區是階段、亮暗是進度；站名可 hover 放大；`show-grid` 顯示座標格線；火車可沿線跑並跨線。 | [`route-map-demo-11-18-26.html`](route-map-demo-11-18-26.html) |

## 目錄

- [page-tour.js](#page-tourjs)
- [route-map.js](#route-mapjs)
- [授權](#授權)

---

## page-tour.js

### 快速開始

```html
<page-tour world-w="1600" countdown="3">
  <tour-world>
    …原本的教材 HTML，不用改…
  </tour-world>

  <tour-step to="overview" hold="2.5" caption="今天的路線"></tour-step>
  <tour-step to="#p-sent" move="1.4" hold="3.6" dim drift>
    <fx-mark target="#chunk" color="key" at="0.4"></fx-mark>
    <fx-arrow target="#chunk" from="right" color="pink" at="1.3">真主詞</fx-arrow>
  </tour-step>
  <tour-step to="#st-noun" zoom="3.2" rotate="-3" hold="4">
    <fx-hover target="#st-noun" at="1.8"></fx-hover>
  </tour-step>
</page-tour>

<script src="page-tour.js"></script>
```

鏡頭目標寫元素的 id，位置與大小在執行時自動測量，不需要任何座標。需要自由擺放的內容，用 `<tour-panel x="1230" y="40" w="330">` 放在 `tour-world` 裡。

### 鍵盤

| 按鍵 | 作用 |
| --- | --- |
| 空白 | 開始、暫停 |
| → ← | 下一步、上一步 |
| R | 從頭重播 |
| 1 2 3 4 | 速度 0.5x、1x、1.5x、2x |
| H | 隱藏控制列 |
| F | 全螢幕 |

### `<page-tour>` 屬性

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `world-w` | `1600` | 畫布寬度，建議和教材頁面實際寬度一致；高度依內容決定。 |
| `aspect` | `16/9` | 播放器比例。 |
| `countdown` | `3` | 按下開始後倒數秒數。 |
| `autoplay` | 關 | 不顯示開始畫面，直接播放；同時寫 `countdown` 才倒數。 |
| `start` | `0` | 從第幾步開始（從 0 算）。 |
| `loop` | 關 | 播完自動重播。 |
| `clean` | 關 | 一開始就隱藏控制列。 |
| `dots` | 關 | 點狀網格背景。 |
| `background`、`caption-color`、`hud-color` | `base`、`key`、`key` | 背景、字幕框、控制列顏色。 |
| `keyboard` | 開 | 寫 `false` 關閉鍵盤控制。 |
| `start-title`、`start-button`、`start-text` | 自動 | 開始畫面文字。 |

### `<tour-step>` 屬性

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `to` | `overview` | 鏡頭目標，`#id`；多個用逗號分隔時一起入鏡；`overview` 是全景。 |
| `zoom` | 自動 | 以全景為 1 倍；沒寫時自動縮放到目標剛好入鏡。 |
| `at` | 無 | 「x,y」：直接對準畫布座標。 |
| `move`、`hold` | `1.4`、`2.5` | 移動秒數、停留秒數。 |
| `via` | 無 | 依序經過的 `#id`，逗號分隔。 |
| `rotate` | `0` | 鏡頭傾斜角度。 |
| `dim` | 關 | 聚光：目標以外壓暗（亮度濾鏡，不用透明度）。 |
| `drift` | 關 | 停留時緩慢推近。 |
| `caption` | 無 | 字幕條。 |

### 特效

所有特效都有 `at`：鏡頭到達後第幾秒觸發，受暫停與速度影響。

| 標籤 | 屬性 | 說明 |
| --- | --- | --- |
| `<fx-ring>` | `target`、`color` | 脈衝光圈。 |
| `<fx-arrow>文字</fx-arrow>` | `target`、`from`、`color`、`length` | 大箭頭從八個方向之一指向目標。 |
| `<fx-mark>` | `target`、`color` | 螢光筆，保留到結尾。 |
| `<fx-line>` | `from`、`to`、`from-side`、`to-side`、`color`、`width`、`duration` | 帶箭頭的曲線連線，保留到結尾；粗細不隨縮放改變。 |
| `<fx-count>` | `target`、`from`、`to`、`decimals`、`duration` | 數字滾動。 |
| `<fx-hover>` | `target` | 模擬懸停：route-map 車站放大站名；其他元素收到 mouseenter 並加上 `tour-hover` class。 |
| `<fx-cursor>` | `target`、`click`、`hover`、`duration` | 模擬游標移到目標，可真的點擊或懸停。 |
| `<fx-note>文字</fx-note>` | `target`、`color` | 便利貼。 |
| `<fx-shake>` | `target` | 搖晃。 |
| `<fx-punch>` | `strength` | 鏡頭瞬間推近再彈回。 |
| `<fx-confetti>` | `target`、`count` | 彩帶；不寫 `target` 就灑滿畫面。 |

### 方法與事件

```js
const t = document.querySelector('page-tour');
t.play(); t.pause(); t.toggle(); t.next(); t.prev(); t.restart(); t.jump(3);
t.index; t.total;
```

事件：`page-tour:ready`、`page-tour:start`、`page-tour:step`（detail：`index`、`total`）、`page-tour:done`，都會冒泡。

跳步時，螢光筆與數字會還原，前面步驟留下的效果會瞬間補上；被模擬點擊改變的頁面內容不會還原，同一個點擊也不會重複觸發。

---

## route-map.js

```html
<route-map grid="36" done="14" legend="10.7,10.9" label-zoom="1.8">
  <route-zone from="0" to="12">第 1 至 4 週</route-zone>
  <route-line name="聽力線" color="blue" path="1,9 31,9">
    <route-stop at="4,9">數字拼寫</route-stop>
  </route-line>
  <route-transfer id="st-para" at="10,9" label="nw" sub="聽力與閱讀共用" zoom="2.4">同義替換</route-transfer>
  <route-here at="14,9">你在這裡</route-here>
</route-map>

<script src="route-map.js"></script>
```

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `grid` | `36` | 一格的大小（px），座標都以格為單位。 |
| `cols`、`rows` | 自動 | 畫布格數；整張圖最後依內容自動裁切。 |
| `pad` | `1.7` | 座標原點內縮的格數。 |
| `done` | 無 | x 小於等於此值的路段與車站用亮色，其餘暗色。 |
| `line-width` | 自動 | 路線粗細。 |
| `label-zoom` | `1` | 站名 hover 放大倍數；`1` 不放大。 |
| `label-zoom-speed` | `180` | 放大時間（毫秒）。 |
| `show-grid` | 關 | 畫出座標格線與數字，設計路線時使用；底色 rgb(36,36,36)、格線為 `#0C0D0C` 細縫。 |
| `legend` | 無 | 「x,y」：圖例位置。 |
| `legend-title`、`legend-transfer`、`legend-future`、`legend-here` | 預設文字 | 圖例文字。 |

| 子標籤 | 屬性 | 說明 |
| --- | --- | --- |
| `<route-zone>` | `from`、`to` | 分區背景，內文是名稱。 |
| `<route-line>` | `name`、`color`、`path`、`badge` | 路線；`path` 是轉彎點（水平、垂直或 45 度）；`badge="false"` 不畫端點路線牌。 |
| `<route-stop>` | `at`、`label`、`sub`、`zoom`、`id` | 寫在 route-line 裡的車站；`label` 是站名方位（n、ne、e、se、s、sw、w、nw）。 |
| `<route-transfer>` | 同上 | 轉乘站。 |
| `<route-here>` | `at` | 目前位置。 |
| `<route-train>` | `from`、`to`、`icon`、`color`、`size`、`icon-size`、`speed`、`duration`、`autoplay`、`id` | 火車。`from`、`to` 寫車站 id 或站名，自動找最短路徑，可在轉乘站換線，中途不停；`size` 是底圓直徑（px），`icon-size`（rem）可單獨調整圖示大小；`icon` 是 Bootstrap Icons 名稱（預設 `bi-train-front-fill`，頁面需引用 bootstrap-icons.css）。 |

方法：`hover(id, on)` 放大或還原站名、`play(id或序號)` 播放火車（回傳 Promise）、`stop()` 中斷、`render()` 重新繪製、`stations` 有 id 的車站清單。火車播放時整張圖不能操作，`hover()` 會被忽略。事件：`route-map:render`、`route-map:hover`（detail：`id`、`on`）、`route-map:train-start`、`route-map:train-end`（detail：`id`、`from`、`to`、`lines`、`completed`）、`route-map:train-error`。車站的 `id` 會移到畫出來的車站上，page-tour 可以直接用 `#id` 指定。

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
