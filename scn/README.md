# ui-screen

`<ui-screen>` 是分隔線對照元件。兩組內容事先用語意標籤定義好，拖曳中間的分隔線就能對照「之前」與「之後」，可以左右分隔，也可以上下分隔。外框、分隔線與把手都支援靜態漸層，用屬性預先配置。元件不使用 Shadow DOM，把手與標籤圖示使用 Bootstrap Icons 類別，圖示字型由專案自行載入。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-screen.js` | `<ui-screen>` | 分隔線對照元件。 |
| `ui-screen-demo-11-07-26.html` | | 六個互動範例、程式碼對照與完整屬性表。 |

## 目錄

- [結構](#結構)
- [屬性：版面與互動](#屬性版面與互動)
- [屬性：尺寸與外框](#屬性尺寸與外框)
- [屬性：分隔線與把手](#屬性分隔線與把手)
- [屬性：標籤](#屬性標籤)
- [圖層與子標籤](#圖層與子標籤)
- [屬性解說](#屬性解說)
- [範例](#範例)
- [事件](#事件)
- [方法](#方法)
- [授權](#授權)

## 結構

```html
<ui-screen>
  <ui-screen-before label="BEFORE">…任意 HTML…</ui-screen-before>
  <ui-screen-after label="AFTER">…任意 HTML…</ui-screen-after>
  <ui-screen-handle>（選用，自訂把手內容）</ui-screen-handle>
</ui-screen>
```

## 屬性：版面與互動

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

## 屬性：尺寸與外框

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

## 屬性：分隔線與把手

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

## 屬性：標籤

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `label-position` | `start`、`center`、`end` | `start` | 標籤在交叉軸的位置：左右分隔時為上、中、下；上下分隔時為左、中、右。 |
| `label-inset` | px | `16` | 標籤離邊緣的距離。 |
| `label-size` | rem | `1` | 標籤字級。 |
| `label-radius` | 長度 | `999` | 標籤圓角。 |
| `label-autohide` | 數字 | 無（只寫屬性為 `15`） | 分隔線接近該側邊緣在此百分比內時，該側標籤淡出。 |

## 圖層與子標籤

| 標籤 | 屬性 | 說明 |
| --- | --- | --- |
| `<ui-screen-before>`、`<ui-screen-after>` | `label` | 標籤文字。 |
| | `label-icon` | 標籤前方的 Bootstrap Icons 圖示。 |
| | `label-bg`、`label-color` | 各自的標籤配色。before 預設深底淺字，after 預設 `yellow` 底深字。 |
| `<ui-screen-handle>` | | 自訂把手內容，取代 `handle-icon`。 |
| `<ui-screen-label>` | `free` | 放在 before 或 after 內，可放複雜 HTML 的標籤；加上 `free` 則不自動定位。 |

## 屬性解說

- **漸層預設集**：`warm`、`cool`、`fresh`、`deep`、`candy`、`fire`、`mist`、`sunset`，全部由色票組合而成。也可以寫逗號分隔的色票並帶位置，例如 `key,yellow 60%,urgent`，或直接填完整的 CSS 漸層字串。
- **顏色屬性**：都可直接寫色票名稱（例如 `key-deep`），也接受任何 CSS 顏色值。
- **圖片與影片**：直接放在圖層內的 `img`、`video` 會自動填滿並以 `object-fit: cover` 裁切。
- **即時更新**：所有屬性改變時立即重畫；圖層的標籤屬性改變時也會自動更新。
- **鍵盤操作**：把手取得焦點後可用方向鍵、Home、End 移動。
- **樣式範圍**：樣式以單一 `<style id="ui-screen-style">` 注入，內部 class 以 `uis-` 開頭，不會影響其他元件。

## 範例

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

## 事件

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `ui-screen:change` | `{ position, orientation }` | 位置改變時持續觸發，會冒泡。 |
| `ui-screen:end` | `{ position, orientation }` | 放開、點擊、鍵盤操作或呼叫 `setPosition` 後觸發，已含吸附結果。 |

```js
document.querySelector('ui-screen').addEventListener('ui-screen:end', e => console.log(e.detail.position));
```

## 方法

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
