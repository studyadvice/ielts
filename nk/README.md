# ui-network

以語意標籤宣告 Bootstrap Icons 圖示與圓圈尺寸，自動隨機排列並繪製三角網格連線的網路圖元件。

- 純 JavaScript 自訂元素，單一檔案，CSS 內建於 JS 中，不使用 Shadow DOM
- 以種子亂數排列圓圈，相同種子得到相同版面
- 以 Delaunay 三角剖分產生連線，線條自然延伸出畫布邊緣
- 支援書籤跳轉與外部連結
- 滑鼠移入時相連線條亮起，載入時播放線條描繪動畫，可選漂浮動畫
- 錯誤以 Bootstrap alert 顯示在元件上方，不使用瀏覽器彈窗

## 目錄

- [安裝](#安裝)
- [快速開始](#快速開始)
- [範例](#範例)
- [屬性](#屬性)
- [方法與事件](#方法與事件)
- [色票](#色票)
- [錯誤提示](#錯誤提示)
- [運作原理](#運作原理)
- [瀏覽器支援](#瀏覽器支援)
- [授權](#授權)

## 安裝

元件依賴 Bootstrap 5 的樣式表（提示訊息外觀）與 Bootstrap Icons 1.x。將 `ui-network.js` 放到專案中，於頁面載入：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<script src="ui-network.js"></script>
```

腳本放在 `<head>` 或 `<body>` 結尾皆可，元件會等待 DOM 就緒後才開始排列。

## 快速開始

```html
<ui-network seed="2026">
  <ui-node icon="map-fill" size="xl" color="green"></ui-node>
  <ui-node icon="controller" size="lg" color="gray"></ui-node>
  <ui-node icon="palette-fill" size="lg" color="indigo"></ui-node>
  <ui-node icon="book-half" size="md" color="orange"></ui-node>
  <ui-node icon="heart-pulse-fill" size="md" color="red"></ui-node>
  <ui-node icon="tv-fill" size="sm" color="violet"></ui-node>
</ui-network>
```

元件寬度為 100%，高度預設依 16:9 比例計算。

## 範例

### 一、仿原圖網路圖：書籤與外部連結

`href` 以 `#` 開頭時會平滑捲動到同頁對應 id 的元素，其他網址則正常跳頁。

```html
<ui-network seed="2026" padding="40" density="normal">
  <ui-node icon="map-fill" size="xl" color="green" href="#sec-travel" title="旅行"></ui-node>
  <ui-node icon="controller" size="lg" color="gray" href="#sec-game" title="遊戲"></ui-node>
  <ui-node icon="palette-fill" size="lg" color="indigo" href="#sec-art" title="藝術"></ui-node>
  <ui-node icon="book-half" size="md" color="orange"
           href="https://icons.getbootstrap.com/" target="_blank" title="Bootstrap Icons 官網"></ui-node>
  <ui-node icon="flower1" size="md" color="pink"></ui-node>
  <ui-node icon="heart-pulse-fill" size="md" color="red"></ui-node>
  <ui-node icon="briefcase-fill" size="md" color="playful"></ui-node>
  <ui-node icon="pencil-square" size="sm" color="gray"></ui-node>
  <ui-node icon="tv-fill" size="sm" color="violet"></ui-node>
  <ui-node icon="cup-hot-fill" size="sm" color="key-deep"></ui-node>
  <ui-node icon="music-note-beamed" size="sm" color="blue"></ui-node>
  <ui-node icon="camera-fill" size="sm" color="urgent"></ui-node>
  <ui-node icon="airplane-fill" size="sm" color="indigo"></ui-node>
  <ui-node icon="bicycle" size="xs" color="green"></ui-node>
  <ui-node icon="tree-fill" size="xs" color="green"></ui-node>
  <ui-node icon="trophy-fill" size="xs" color="orange"></ui-node>
</ui-network>

<section id="sec-travel">旅行</section>
<section id="sec-game">遊戲</section>
<section id="sec-art">藝術</section>
```

### 二、padding 與連線密度

`padding` 只限制圓圈的擺放範圍，線條仍鋪滿整個畫布。`density` 決定連線的多寡。

```html
<!-- 圓圈貼近邊緣，連線密集 -->
<ui-network seed="pair" padding="16" density="dense" ratio="4:3">
  <ui-node icon="house-fill" size="lg"></ui-node>
  <ui-node icon="gear-fill" size="md"></ui-node>
  <ui-node icon="chat-dots-fill" size="md"></ui-node>
  <ui-node icon="cloud-fill" size="sm"></ui-node>
  <ui-node icon="lightning-fill" size="sm"></ui-node>
  <ui-node icon="star-fill" size="sm"></ui-node>
  <ui-node icon="bell-fill" size="xs"></ui-node>
  <ui-node icon="envelope-fill" size="xs"></ui-node>
</ui-network>

<!-- 上下 48px、左右 120px 內距，連線稀疏 -->
<ui-network seed="pair" padding="48 120" density="sparse" ratio="4:3">
  <ui-node icon="house-fill" size="lg"></ui-node>
  <ui-node icon="gear-fill" size="md"></ui-node>
  <ui-node icon="chat-dots-fill" size="md"></ui-node>
  <ui-node icon="cloud-fill" size="sm"></ui-node>
  <ui-node icon="lightning-fill" size="sm"></ui-node>
  <ui-node icon="star-fill" size="sm"></ui-node>
  <ui-node icon="bell-fill" size="xs"></ui-node>
  <ui-node icon="envelope-fill" size="xs"></ui-node>
</ui-network>
```

### 三、漂浮動畫與自訂配色

所有顏色都以色票名稱指定。節點省略 `color` 時會自動輪替顏色。

```html
<ui-network float height="460" padding="48 80" seed="drift"
            bg-from="indigo" bg-to="background"
            line-color="quiet" line-active="yellow" line-width="1.2"
            node-fill="shell">
  <ui-node icon="rocket-takeoff-fill" size="xl"></ui-node>
  <ui-node icon="moon-stars-fill" size="lg"></ui-node>
  <ui-node icon="sun-fill" size="md"></ui-node>
  <ui-node icon="globe2" size="md"></ui-node>
  <ui-node icon="stars" size="sm"></ui-node>
  <ui-node icon="cloud-moon-fill" size="sm"></ui-node>
  <ui-node icon="compass-fill" size="sm"></ui-node>
  <ui-node icon="radar" size="xs"></ui-node>
</ui-network>
```

### 四、自訂直徑與單一圓圈底色

`size` 可直接寫直徑數字（px）。加上 `fixed-size` 後，尺寸不會隨容器寬度縮放。

```html
<ui-network fixed-size height="400" seed="exact">
  <ui-node icon="trophy-fill" size="180" color="orange" fill="yellow"></ui-node>
  <ui-node icon="award-fill" size="110" color="key-deep"></ui-node>
  <ui-node icon="star-fill" size="80" color="urgent" fill="calm"></ui-node>
  <ui-node icon="gem" size="64" color="violet"></ui-node>
</ui-network>
```

### 五、重新隨機與控制項

```html
<ui-network id="net" seed="2026">
  <ui-node icon="map-fill" size="xl" color="green"></ui-node>
  <ui-node icon="controller" size="lg" color="gray"></ui-node>
  <ui-node icon="palette-fill" size="md" color="indigo"></ui-node>
  <ui-node icon="book-half" size="md" color="orange"></ui-node>
</ui-network>

<button type="button" id="btn-shuffle">重新隨機</button>
<span id="seed-now"></span>
<select id="sel-density">
  <option value="sparse">sparse</option>
  <option value="normal" selected>normal</option>
  <option value="dense">dense</option>
</select>
<input type="range" id="rng-pad" min="0" max="160" step="4" value="40">
<label><input type="checkbox" id="chk-float"> 漂浮動畫</label>

<script>
  const net = document.getElementById('net');
  const seedNow = document.getElementById('seed-now');

  net.addEventListener('network-render', e => { seedNow.textContent = e.detail.seed; });
  document.getElementById('btn-shuffle').addEventListener('click', () => net.shuffle());
  document.getElementById('sel-density').addEventListener('change', e => net.setAttribute('density', e.target.value));
  document.getElementById('rng-pad').addEventListener('input', e => net.setAttribute('padding', e.target.value));
  document.getElementById('chk-float').addEventListener('change', e => net.toggleAttribute('float', e.target.checked));
</script>
```

### 六、攔截點擊事件

每次點擊圓圈都會觸發 `node-click`。呼叫 `preventDefault()` 後，原本的跳轉不會執行。

```html
<ui-network id="net-event" seed="evt" height="380">
  <ui-node icon="lock-fill" size="lg" color="urgent" href="#sec-art" data-lock></ui-node>
  <ui-node icon="hand-index-thumb-fill" size="md" color="key-deep"></ui-node>
  <ui-node icon="bookmark-star-fill" size="md" color="orange"></ui-node>
</ui-network>
<div id="evt-log"></div>

<script>
  const log = document.getElementById('evt-log');
  document.getElementById('net-event').addEventListener('node-click', e => {
    const { index, icon, href, node } = e.detail;
    if (node.dataset.lock !== undefined) {
      e.preventDefault();
      log.textContent = `已攔截 #${index} ${icon}，原連結 ${href} 不會執行。`;
      return;
    }
    log.textContent = `點擊 #${index} ${icon}`;
  });
</script>
```

### 七、動態新增與修改節點

新增或移除 `<ui-node>` 會自動重新排列；修改節點屬性只更新外觀，不會打亂版面。

```js
const net = document.getElementById('net');

// 新增節點
const node = document.createElement('ui-node');
node.setAttribute('icon', 'camera-fill');
node.setAttribute('size', 'sm');
node.setAttribute('color', 'urgent');
net.append(node);

// 修改圖示與顏色
node.setAttribute('icon', 'film');
node.setAttribute('color', 'violet');

// 移除節點
node.remove();
```

## 屬性

### `<ui-network>`

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `padding` | `40` | 圓圈可擺放區域的內距，單位 px，寫法比照 CSS 的 1 到 4 個數值。 |
| `seed` | 每次載入隨機 | 亂數種子，可為數字或文字。相同種子與相同節點會得到相同版面。 |
| `density` | `normal` | 連線密度：`sparse`、`normal`、`dense`。 |
| `height` | 無 | 固定高度，單位 px。設定後忽略 `ratio`。 |
| `ratio` | `16:9` | 未設定 `height` 時，依寬度維持此比例。 |
| `fixed-size` | 未啟用 | 布林屬性。圓圈尺寸不隨容器寬度縮放，也不自動縮小以避免重疊。 |
| `bg-from` | `blue` | 背景放射漸層的中心色。 |
| `bg-to` | `key-deep` | 背景放射漸層的外圍色。 |
| `line-color` | `shell` | 線條顏色，透明度固定為 0.8。 |
| `line-active` | `key` | 滑鼠移入圓圈時，相連線條與圓圈外框的顏色。 |
| `line-width` | `1.5` | 線條粗細，單位 px。 |
| `node-fill` | `vanilla` | 所有圓圈的底色。 |
| `float` | 未啟用 | 布林屬性，啟用圓圈漂浮動畫，線條同步跟隨。 |
| `animate` | `on` | 設為 `off` 時，不播放線條描繪與圓圈彈出動畫。 |

### `<ui-node>`

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `icon` | `circle` | Bootstrap Icons 名稱，可省略 `bi-` 前綴。 |
| `size` | `md` | 預設級距或直徑數字，見下表。 |
| `color` | 自動輪替 | 圖示顏色，使用色票名稱。 |
| `fill` | 繼承 `node-fill` | 單一圓圈的底色。 |
| `href` | 無 | 以 `#` 開頭時捲動到同頁書籤，其他網址正常跳頁。 |
| `target` | 無 | 搭配 `href` 使用，`_blank` 會自動加上 `rel="noopener noreferrer"`。 |
| `title` | 無 | 滑鼠停留時的提示文字。 |

### 尺寸級距

| 值 | 直徑 |
|---|---|
| `xs` | 72px |
| `sm` | 96px |
| `md` | 120px |
| `lg` | 150px |
| `xl` | 210px |

以上直徑以容器寬 1280px 為基準，實際尺寸依容器寬度在 0.5 到 1.3 倍之間縮放。若圓圈總面積超過可用區域的 40%，會再等比例縮小以避免重疊；啟用 `fixed-size` 時兩者皆不套用。

## 方法與事件

| 名稱 | 類型 | 說明 |
|---|---|---|
| `shuffle(seed?)` | 方法 | 重新隨機排列並播放動畫。可傳入種子，回傳實際使用的種子。 |
| `refresh()` | 方法 | 以目前種子重新建構。 |
| `currentSeed` | 唯讀屬性 | 目前使用中的種子。 |
| `node-click` | 事件 | `detail` 含 `index`、`node`、`icon`、`href`。可取消，呼叫 `preventDefault()` 會阻止跳轉。 |
| `network-render` | 事件 | 每次排列或重繪後觸發，`detail` 含 `seed`、`nodes`、`edges`。 |

靜態屬性 `customElements.get('ui-network').palette` 可取得完整色票物件。

```js
const palette = customElements.get('ui-network').palette;
console.log(palette.key);   // "#51DBCF"
```

## 色票

所有顏色屬性只接受以下名稱，不接受色碼。

| 名稱 | 色碼 | 名稱 | 色碼 |
|---|---|---|---|
| `background` | `#0C0D0C` | `gray` | `#86877F` |
| `shell` | `#C6C7BD` | `key` | `#51DBCF` |
| `vanilla` | `#DBEDD8` | `key-deep` | `#176878` |
| `yellow` | `#E3D322` | `calm` | `#A3C4BC` |
| `pink` | `#FF91D7` | `quiet` | `#A9B8E0` |
| `red` | `#EF6661` | `playful` | `#FFA987` |
| `orange` | `#FF5530` | `urgent` | `#FF2E63` |
| `green` | `#71CD76` | `indigo` | `#778CE1` |
| `blue` | `#5DBAE8` | `violet` | `#B484E8` |

未指定 `color` 時，圖示依序使用 green、indigo、red、gray、violet、pink、orange、blue、key-deep、urgent、playful 輪替，已排除與預設圓圈底色對比過低的顏色。

## 錯誤提示

以下情況會在元件正上方顯示可關閉的 Bootstrap alert，同一則訊息不會重複出現：

| 情況 | 處理方式 |
|---|---|
| 未載入 Bootstrap Icons 樣式表 | 紅色提示，圖示無法顯示 |
| 圖示名稱不存在 | 黃色提示，列出所有無效名稱 |
| 顏色不在色票中 | 黃色提示，改用預設色 |
| 尺寸無法辨識 | 黃色提示，改用 `md` |
| 書籤 id 不存在 | 點擊時黃色提示，不捲動 |
| 空間不足導致重疊 | 黃色提示，建議減少節點或調整尺寸 |

```html
<!-- 這段會產生四則提示 -->
<ui-network seed="oops" height="360" animate="off">
  <ui-node icon="elephant" size="lg" color="red"></ui-node>
  <ui-node icon="heart-fill" size="md" color="brown"></ui-node>
  <ui-node icon="flag-fill" size="huge" color="blue" href="#no-such-bookmark"></ui-node>
</ui-network>
```

## 運作原理

1. **排列**：依直徑由大到小，每顆圓圈產生多個隨機候選位置，選擇與既有圓圈間距最大者，大圓因此自然分散，小圓填補空隙。
2. **鬆弛**：反覆推開過近的圓圈，大圓移動較少，確保彼此保持間距。
3. **連線**：將圓心與畫布外的虛擬錨點一起做 Delaunay 三角剖分，刪除過長的邊與穿過其他圓圈的邊，孤立的圓圈會補上最短的一條連線。
4. **繪製**：底層 SVG 畫線，上層絕對定位的元素畫圓圈與圖示。座標以比例儲存，視窗縮放時只重新鬆弛，不會重新隨機。

## 瀏覽器支援

需要支援 Custom Elements v1、ResizeObserver 與 CSS 變數的現代瀏覽器，包含最新版 Chrome、Edge、Firefox、Safari。

## 授權

MIT License

Copyright (c) 2026 ui-network contributors

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
