# info-region

單一 JavaScript 檔案的「逐步顯示」元件組。把說明、步驟、測驗題寫成一個個 `<info-region>`，用屬性串接成序列，不需要寫任何 JavaScript 就能做出：

- 依序淡入的步驟說明
- 倒數條自動換步、按鈕手動換步
- 橫向卡片依序登場
- 選擇題測驗，含解說、重試、計分板、進度條
- 金色開場與結尾，**金色區塊現在有電流動畫**

不使用 shadow DOM，CSS 由腳本注入一次，沒有任何外部相依。

## 目錄

- [特色](#特色)
- [安裝](#安裝)
- [快速開始](#快速開始)
- [info-region 屬性](#info-region-屬性)
- [info-region-group 屬性](#info-region-group-屬性)
- [測驗模式](#測驗模式)
- [金色電流](#金色電流)
- [透明度政策](#透明度政策)
- [全域設定 InfoRegionConfig](#全域設定-inforegionconfig)
- [JavaScript API](#javascript-api)
- [活用範例](#活用範例)
- [常見問題](#常見問題)
- [專案檔案](#專案檔案)

## 特色

- 四個語意標籤：`<info-region>`、`<info-region-group>`、`<ir-choices>`、`<ir-choice>`。
- 用 `next` 屬性串接區塊，支援倒數、手動按鈕、一次全部依序登場三種節奏。
- 測驗模式可以分支：答對與答錯可以進入不同的區塊。
- 18 種內建顏色，用 `color` 屬性切換，左側色條與按鈕顏色自動跟著變。
- 金色電流：電流環、光暈明滅、閃電，可單點關閉、全域關閉，也能讓任何顏色擁有電流。
- 所有顏色都是不透明色，沒有低於 0.78 的透明度。

## 安裝

```html
<script src="info-region.js"></script>
```

放在 `</body>` 之前即可。元件使用 `DM Sans` 與 `Space Mono` 字型並附有備用字型，需要時請自行載入。

若要覆寫預設值，請在載入 `info-region.js` 之前先設定：

```html
<script>
  window.InfoRegionConfig = { defaultColor: 'teal', borderWidth: 3 };
</script>
<script src="info-region.js"></script>
```

## 快速開始

三步驟，第一步用倒數條自動進入第二步，第二步等使用者按下按鈕，第三步用金色收尾：

```html
<info-region-group>
  <info-region id="s1" color="sky" next="s2" countdown="2500">
    <h3>第一步</h3>
    <p>讀完這段，倒數條跑完後會自動進入下一步。</p>
  </info-region>

  <info-region id="s2" color="teal" next="s3" manual manual-label="▶ 下一步">
    <h3>第二步</h3>
    <p>按下按鈕才會繼續。</p>
  </info-region>

  <info-region id="s3" class="ir-gold" color="gold">
    <h3>完成</h3>
    <p>金色區塊有電流繞行。</p>
  </info-region>
</info-region-group>
```

群組會自動產生「開始」與「重設」兩個按鈕。想一進頁面就開始，請在群組加上 `auto-start`。

## info-region 屬性

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `id` | 無 | 被 `next` 串接的區塊需要有 id |
| `active` | 無 | 設為 `true` 時顯示。通常由群組或上一個區塊自動設定 |
| `color` | `sky` | 左側色條與按鈕顏色，可用名稱見[顏色清單](#顏色清單) |
| `class="ir-gold"` | 無 | 金箔外觀，並預設開啟電流 |
| `next` | 無 | 下一個區塊的 id |
| `next-interval` | `500` | 顯示後幾毫秒才進入下一個區塊 |
| `countdown` | 無 | 毫秒數。顯示倒數條，跑完後進入下一個區塊，數值無效時用 `2000` |
| `countdown-position` | `bottom` | 倒數條位置，`top` 或 `bottom` |
| `countdown-height` | `3` | 倒數條高度，單位 px |
| `countdown-color` | 同 `color` | 倒數條顏色 |
| `manual` | 無 | 搭配 `next` 使用，顯示按鈕，按下才進入下一個區塊 |
| `manual-label` | `▶ 下一步` | 按鈕文字 |
| `manual-color` | 同 `color` | 按鈕顏色 |
| `manual-align` | `right` | 按鈕對齊，`left`、`center`、`right` |
| `border-width` | `4`（只有左邊） | 四邊的邊框寬度，單位 px |
| `border-top-width` 等 | 無 | 單獨指定上、右、下、左的邊框寬度 |
| `border-style` | `solid` | 四邊的邊框樣式 |
| `border-top-style` 等 | 無 | 單獨指定上、右、下、左的邊框樣式 |
| `fx` | 依 class | `electric` 開啟電流，`off` 關閉，見[金色電流](#金色電流) |
| `fx-core` | `#D4FFFC` | 電流亮點色 |
| `fx-dim` | 自動計算 | 電流環暗部色 |

測驗相關屬性請見[測驗模式](#測驗模式)。

### 顏色清單

`lavender`、`sky`、`warning`、`salmon`、`ocean`、`safe`、`teal`、`vanilla`、`yellow`、`focus`、`info`、`indigo`、`pink`、`orange`、`special`、`stone`、`gold`、`shell`。

按鈕也有對應的顏色類別 `ir-btn--顏色`。要新增顏色，修改檔案開頭的 `BrandColors` 物件即可，相關樣式會自動產生。

## info-region-group 屬性

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `auto-start` | 無 | 載入後自動開始 |
| `show-controls` | 顯示 | 設為 `false` 隱藏開始與重設按鈕 |
| `start-label` | `▶ 開始` | 開始按鈕文字 |
| `start-color` | `sky` | 開始按鈕顏色 |
| `reset-label` | `↺ 重設` | 重設按鈕文字 |
| `reset-color` | `warning` | 重設按鈕顏色 |
| `start-width`、`start-height`、`start-font-size`、`start-padding` | 無 | 開始按鈕尺寸，字體單位預設為 rem |
| `reset-width`、`reset-height`、`reset-font-size`、`reset-padding` | 無 | 重設按鈕尺寸 |
| `btn-width`、`btn-height`、`btn-font-size`、`btn-padding` | 無 | 兩個按鈕共用的尺寸 |
| `layout` | 垂直 | 設為 `horizontal` 時橫向排列成卡片 |
| `cols-per-row` | `4` | 橫向排列時每列幾欄 |
| `gutter-size` | `16px` | 橫向排列時的間距 |
| `row-gap` | 同 `gutter-size` | 橫向排列時的列距 |
| `cascade-interval` | `0` | 大於 0 時，所有區塊依序每隔這麼多毫秒同時登場 |
| `global-progress` | 無 | 顯示整體進度條 |
| `progress-position` | `bottom` | `top` 或 `bottom` |
| `progress-height` | `4` | 進度條高度，單位 px |
| `progress-color` | 同 `defaultColor` | 進度條顏色 |
| `show-percent` | 無 | 在進度條旁顯示百分比 |
| `show-score` | 無 | 顯示計分板，用於測驗 |

> 群組設有 `global-progress` 或 `cascade-interval` 時，一般區塊的 `next` 與 `countdown` 不會自動觸發。這種群組請用 `manual` 按鈕、測驗模式，或用 `cascade-interval` 讓所有區塊一次登場。

## 測驗模式

在 `<info-region>` 加上 `quiz`，裡面放 `<ir-choices>` 與 `<ir-choice>`：

```html
<info-region id="q1" quiz quiz-item color="sky" quiz-label="第 1 題"
             answer="b" correct-next="q2" wrong-next="q2"
             explain="主詞是第三人稱單數，動詞要加 <b>s</b>。">
  <p>哪一句是正確的？</p>
  <ir-choices layout="column">
    <ir-choice value="a">She go to school every day.</ir-choice>
    <ir-choice value="b">She goes to school every day.</ir-choice>
    <ir-choice value="c">She going to school every day.</ir-choice>
  </ir-choices>
</info-region>
```

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `quiz` | 無 | 啟用測驗模式 |
| `quiz-item` | 無 | 標記這是一道題目。群組有任何 `quiz-item` 時，進度條只計算這些題目 |
| `quiz-label` | 無 | 題號標籤，顯示在題目上方 |
| `answer` | 無 | 正確選項的 `value`，不分大小寫 |
| `correct-next` | 無 | 答對後進入的區塊 id，沒有填表示本題是終點 |
| `wrong-next` | 無 | 答錯後進入的區塊 id |
| `explain` | 無 | 解說文字，支援 `<b>`、`<i>`、`<u>`、`<br>`、`<span>`、`<code>`、`<small>` |
| `correct-msg` | `✓ 答對了！` | 答對時的開頭訊息 |
| `wrong-msg` | `✗ 答錯了。` | 答錯時的開頭訊息 |
| `quiz-next-delay` | `1200` | 自動跳題前的等待毫秒數 |
| `manual-next` | 無 | 加上後不自動跳題，改顯示繼續按鈕 |
| `quiz-next-label` | `繼續 ▶` | 繼續按鈕文字 |
| `show-retry` | 無 | 顯示重試按鈕，答對也會顯示 |
| `retry-label` | `↺ 重試` | 重試按鈕文字 |
| `retry-color` | `warning` | 重試按鈕顏色 |
| `choice-font-size` | `0.95rem` | 選項字體大小，字母圓圈會依比例縮放 |
| `choice-padding` | `10px 14px` | 選項內距 |

`<ir-choices>` 預設兩欄，加上 `layout="column"` 變成單欄。`<ir-choice>` 的 `value` 是選項的值，字母 A、B、C 會自動加上。選項支援鍵盤，按 Enter 或空白鍵即可選取。

計分規則：

- 同一題答對只計一次。
- 答錯會累加答錯次數，重試後再次答錯也會再加一次，答對後不再累加答錯。
- 進度條只計算答對的題數，不會因為重試而倒退。

## 金色電流

`class="ir-gold"` 原本就是金箔外觀（深金漸層、金色邊框、緩慢掃過的閃光）。現在它預設多了電流：

1. **電流環**：一段亮光沿區塊內緣繞行，亮點是淺青色。
2. **光暈**：區塊外圍的金色光暈忽強忽弱。
3. **閃電**：右上角的閃電圖示不規則閃爍。

### 開關與自訂

| 寫法 | 效果 |
|---|---|
| `class="ir-gold"` | 金箔加電流 |
| `class="ir-gold" fx="off"` | 只要金箔與掃光，不要電流 |
| `color="teal" fx="electric"` | 任何顏色都可以加電流，暗部色由該顏色混黑自動算出 |
| `fx-core="#FFFFFF" fx-dim="#5A1F47"` | 自訂亮點色與暗部色 |
| `InfoRegionConfig.fx = false` | 全域關閉，下一次區塊啟動時生效 |

```html
<info-region class="ir-gold" color="gold">預設有電流</info-region>
<info-region class="ir-gold" color="gold" fx="off">沒有電流</info-region>
<info-region color="pink" fx="electric" fx-core="#FFFFFF" fx-dim="#5A1F47">自訂粉紅電流</info-region>
```

### 運作與支援

- 電流環使用 CSS `@property` 做平滑旋轉，需要 Chrome 與 Edge 85、Safari 16.4、Firefox 128 以上。較舊的瀏覽器不會平滑旋轉，其餘效果照常。
- 電流只在區塊顯示期間執行，區塊隱藏或重設後即停止。
- 電流環畫在區塊內緣，而不是邊框上，因為區塊本身需要 `overflow: hidden` 來做展開動畫。
- 所有電流顏色都是不透明色，請用不透明色碼設定 `fx-core` 與 `fx-dim`。

## 透明度政策

元件裡沒有任何低於 0.78 的透明度。

原本的半透明顏色（選項底色、答對答錯底色、解說區塊、計分板、按鈕 hover、題號等）全部改成「前景色以相同百分比疊在底色上」的不透明色碼，畫面效果相同，但沒有透明。計算由內部的 `solid()` 完成，結果是十六進位色碼。

| 項目 | 混色底色 |
|---|---|
| 測驗選項、答對答錯、解說、題號、行內程式碼 | `InfoRegionConfig.bgColor`（預設 `#333333`） |
| 計分板與分隔線 | 頁面底色 `#0C0D0C` |
| 按鈕 hover | `#333333` |

其他處理：

- 金色掃光改用 `mix-blend-mode: screen` 搭配不透明的黑到暗金漸層，黑色部分不改變底色。
- 移除所有 `transparent` 關鍵字。
- 計分板標籤原本用 `opacity: 0.6`，改為不透明的灰色。

仍保留的項目：

- `ir-gold` 的邊框使用 `rgba(185,140,55,0.82)`，透明度高於 0.78。
- `opacity` 只有 `0` 與 `1` 兩個值，用於淡入淡出的狀態切換，不是半透明的外觀。
- `.ir-quiz-explain small` 的 `opacity: 0.82`，高於 0.78。

如果你把 `bgColor` 設成很不同的顏色，混色結果會跟著調整。計分板固定以 `#0C0D0C` 為底，頁面底色差異很大時，計分板的色調會略有不同。

## 全域設定 InfoRegionConfig

```js
window.InfoRegionConfig = {
  defaultColor: 'sky',
  animDuration: 500,
  /* ...其餘見下表 */
};
```

必須在載入 `info-region.js` 之前設定。樣式只在第一個元素加入頁面時注入一次，之後再改這些值不會影響已注入的 CSS。唯一的例外是 `fx`，它在每次區塊啟動時才讀取，可以隨時修改。

| 設定 | 預設值 | 說明 |
|---|---|---|
| `defaultColor` | `sky` | 預設顏色 |
| `animDuration` | `500` | 垂直展開的動畫毫秒數 |
| `horizontalAnimDur` | `380` | 橫向排列的動畫毫秒數 |
| `defaultInterval` | `500` | `next-interval` 的預設值 |
| `borderWidth` | `4` | 左邊框寬度，單位 px |
| `borderAllWidth` | `null` | 四邊共用的邊框寬度 |
| `borderTopWidth`、`borderRightWidth`、`borderBottomWidth`、`borderLeftWidth` | `null` | 單邊邊框寬度 |
| `borderStyle` | `solid` | 邊框樣式 |
| `borderTopStyle` 等 | `null` | 單邊邊框樣式 |
| `borderRadius` | `0 6px 6px 0` | 圓角 |
| `bgColor` | `#333333` | 區塊底色，同時是測驗選項混色的基準 |
| `textColor` | `#C6C7BD` | 文字顏色 |
| `fontSize` | `1rem` | 字體大小 |
| `padding` | `14px 18px 20px 20px` | 區塊內距 |
| `marginBottom` | `10px` | 區塊下方外距 |
| `countdownHeight` | `3` | 倒數條高度，單位 px |
| `countdownPosition` | `bottom` | 倒數條位置 |
| `progressHeight` | `4` | 進度條高度，單位 px |
| `progressPosition` | `bottom` | 進度條位置 |
| `progressTransition` | `400` | 進度條動畫毫秒數 |
| `manualLabel` | `▶ 下一步` | 手動按鈕預設文字 |
| `manualAlign` | `right` | 手動按鈕預設對齊 |
| `cascadeInterval` | `0` | 預設依序登場間隔 |
| `colsPerRow` | `4` | 橫向排列預設欄數 |
| `btnWidth`、`btnHeight`、`btnFontSize`、`btnPadding` | `null` | 群組按鈕共用尺寸 |
| `startBtnWidth` 等、`resetBtnWidth` 等 | `null` | 開始、重設按鈕個別尺寸 |
| `choiceFontSize` | `null` | 選項字體大小，`null` 表示 `0.95rem` |
| `choicePadding` | `null` | 選項內距，`null` 表示 `10px 14px` |
| `fx` | `true` | 設為 `false` 時全域關閉電流 |

## JavaScript API

```js
InfoRegion.activate('s1');            // 啟動指定 id 的區塊
InfoRegion.resetAll();                // 重設頁面上所有區塊
InfoRegion.resetAll('#unit1 info-region');   // 只重設指定範圍
InfoRegion.colors;                    // BrandColors 的所有名稱，其中 bg 與 region 不能用在 color 屬性
InfoRegion.config;                    // 目前設定的複本

document.getElementById('s1').activate();   // 啟動單一區塊
document.getElementById('s1').reset();      // 重設單一區塊

const g = document.querySelector('info-region-group');
g.start();                            // 重新開始整個群組
g.reset();                            // 重設整個群組
```

元件本身不發出自訂事件。需要知道區塊何時顯示時，可以監聽 `active` 屬性的變化（例如用 `MutationObserver`）。

## 活用範例

### 1. 教學步驟自動依序顯示

```html
<info-region-group auto-start show-controls="false">
  <info-region id="a1" color="sky" next="a2" next-interval="1200">第一步：準備材料。</info-region>
  <info-region id="a2" color="sky" next="a3" next-interval="1200">第二步：混合均勻。</info-region>
  <info-region id="a3" color="safe">第三步：完成。</info-region>
</info-region-group>
```

每個區塊顯示 1.2 秒後自動進入下一步，不需要任何按鈕。

### 2. 倒數條自動換步

```html
<info-region id="b1" color="orange" next="b2" countdown="4000" countdown-position="top">
  這段話會停留四秒，頂端的倒數條跑完後自動換下一步。
</info-region>
```

### 3. 讀者自己控制節奏

```html
<info-region id="c1" color="teal" next="c2" manual manual-label="我看懂了，下一步 ▶" manual-align="center">
  先讀完這段再按按鈕。
</info-region>
```

### 4. 金色開場與結尾

```html
<info-region-group>
  <info-region id="d1" class="ir-gold" color="gold" next="d2" countdown="3000">
    <h3>歡迎來到第一單元</h3>
  </info-region>
  <info-region id="d2" color="sky" next="d3" manual>中間是普通內容。</info-region>
  <info-region id="d3" class="ir-gold" color="gold">
    <h3>單元完成</h3>
  </info-region>
</info-region-group>
```

首尾用金色電流，中間保持安靜，讀者一眼就能分辨開始與結束。

### 5. 橫向卡片依序登場

```html
<info-region-group layout="horizontal" cols-per-row="3" cascade-interval="250"
                   show-controls="false" auto-start>
  <info-region color="sky"><h4>聽力</h4><p>四個段落，三十分鐘。</p></info-region>
  <info-region color="teal"><h4>閱讀</h4><p>三篇文章，六十分鐘。</p></info-region>
  <info-region color="orange"><h4>寫作</h4><p>兩個任務，六十分鐘。</p></info-region>
</info-region-group>
```

### 6. 整體進度條加手動步驟

```html
<info-region-group global-progress show-percent progress-color="teal" progress-position="top">
  <info-region id="e1" color="sky" next="e2" manual>第 1 步</info-region>
  <info-region id="e2" color="sky" next="e3" manual>第 2 步</info-region>
  <info-region id="e3" color="sky">第 3 步</info-region>
</info-region-group>
```

進度條依已顯示的區塊數計算，顯示到第 2 步時是 67%。

### 7. 基本選擇題，答對與答錯都進下一題

見[測驗模式](#測驗模式)的範例。`correct-next` 與 `wrong-next` 填同一個 id 即可。

### 8. 答錯時進入補充說明，再回到下一題

```html
<info-region-group show-score global-progress show-percent>
  <info-region id="q1" quiz quiz-item color="sky" answer="b"
               correct-next="q2" wrong-next="q1-help"
               explain="注意第三人稱單數。">
    <p>She ___ to school every day.</p>
    <ir-choices>
      <ir-choice value="a">go</ir-choice>
      <ir-choice value="b">goes</ir-choice>
    </ir-choices>
  </info-region>

  <!-- 只有答錯才會看到的補充說明 -->
  <info-region id="q1-help" color="orange" next="q2" manual manual-label="我懂了 ▶">
    <h4>補充：第三人稱單數</h4>
    <p>主詞是 he、she、it 時，動詞要加 s 或 es。</p>
  </info-region>

  <info-region id="q2" quiz quiz-item color="sky" answer="a">
    <p>They ___ football on Sundays.</p>
    <ir-choices>
      <ir-choice value="a">play</ir-choice>
      <ir-choice value="b">plays</ir-choice>
    </ir-choices>
  </info-region>
</info-region-group>
```

補充說明區塊沒有 `quiz-item`，不會被算進進度條的題數。

### 9. 手動繼續與重試

```html
<info-region id="q3" quiz quiz-item color="indigo" answer="c"
             manual-next quiz-next-label="下一題 ▶" show-retry retry-label="再試一次"
             correct-next="q4" wrong-next="q4">
  ...
</info-region>
```

加上 `manual-next` 後，答題完不會自動跳題，讀者讀完解說再按按鈕。

### 10. 測驗結尾用金色電流，並顯示計分板

```html
<info-region-group show-score global-progress show-percent progress-color="gold">
  <!-- ...題目... -->
  <info-region id="done" class="ir-gold" color="gold">
    <h3>測驗完成</h3>
    <p>上方的計分板會顯示答對與答錯的題數。</p>
  </info-region>
</info-region-group>
```

### 11. 自訂邊框

```html
<info-region color="special" border-width="2" border-top-width="6" border-style="dashed">
  上邊框較粗的虛線區塊。
</info-region>
```

`border-width` 設定四邊，`border-top-width` 等可以單獨覆蓋。寬度為 0 的邊不會顯示。

### 12. 全站預設值

```html
<script>
  window.InfoRegionConfig = {
    defaultColor: 'teal',
    animDuration: 700,
    padding: '12px 16px',
    choiceFontSize: 1.05,
    manualLabel: '繼續 ▶'
  };
</script>
<script src="info-region.js"></script>
```

### 13. 用按鈕或程式控制區塊

```html
<button onclick="InfoRegion.activate('hint-1')">顯示提示</button>
<button onclick="InfoRegion.resetAll('#unit-1 info-region')">重設這一單元</button>

<info-region id="hint-1" color="yellow">這是提示。</info-region>
```

### 14. 只在最重要的地方使用電流

```html
<info-region class="ir-gold" color="gold" fx="off">一般金色提示</info-region>
<info-region class="ir-gold" color="gold">重要金色提示（有電流）</info-region>
```

頁面上電流太多會互相搶焦點，用 `fx="off"` 區分輕重。

### 15. 讓其他顏色也有電流

```html
<info-region color="safe" fx="electric">通關成功，綠色電流。</info-region>
<info-region color="warning" fx="electric" fx-dim="#4A0F18">警告，紅色電流。</info-region>
```

### 16. 依使用者偏好關閉全部動畫

```js
if (localStorage.getItem('reduce-fx') === '1') {
  window.InfoRegionConfig.fx = false;
}
```

`fx` 在區塊每次啟動時才讀取，所以放在載入後的任何時間點設定都有效。

### 17. 用 PHP 動態輸出測驗

```php
<?php
$h = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
$n = count($questions);
?>
<info-region-group show-score global-progress show-percent>
<?php foreach ($questions as $i => $q):
  $id   = 'q' . ($i + 1);
  $next = $i + 1 < $n ? 'q' . ($i + 2) : 'done';
?>
  <info-region id="<?= $id ?>" quiz quiz-item color="sky"
               quiz-label="第 <?= $i + 1 ?> 題"
               answer="<?= $h($q['answer']) ?>"
               correct-next="<?= $next ?>" wrong-next="<?= $next ?>"
               explain="<?= $h($q['explain']) ?>">
    <p><?= $h($q['text']) ?></p>
    <ir-choices layout="column">
      <?php foreach ($q['choices'] as $value => $label): ?>
        <ir-choice value="<?= $h($value) ?>"><?= $h($label) ?></ir-choice>
      <?php endforeach; ?>
    </ir-choices>
  </info-region>
<?php endforeach; ?>
  <info-region id="done" class="ir-gold" color="gold"><h3>測驗完成</h3></info-region>
</info-region-group>
```

屬性值一定要用 `htmlspecialchars` 處理。`explain` 的內容會被當成 HTML 顯示，若來自使用者輸入，請先過濾。

### 18. 與其他元件搭配

區塊內容是一般 HTML，可以放入任何元件，例如搭配 bp-popnote 的提示框：

```html
<info-region color="lavender">
  <p>This word is
    <span data-popover-theme="gold" data-popover-color="gold"
          data-popover-title="ubiquitous" data-popover-content="adj. 無所不在的">ubiquitous</span>.
  </p>
</info-region>
```

## 常見問題

**區塊沒有出現？**
區塊要有 `active="true"` 才會顯示。通常由群組的「開始」按鈕、`auto-start`、上一個區塊的 `next`，或 `InfoRegion.activate()` 啟動。

**`next` 沒有自動觸發？**
群組設有 `global-progress` 或 `cascade-interval` 時，一般區塊不會自動串接。請改用 `manual` 按鈕、測驗模式，或拿掉這兩個屬性。

**修改 `InfoRegionConfig` 沒有效果？**
樣式只在第一個元素加入頁面時注入一次。請在載入 `info-region.js` 之前設定，唯一可以隨時修改的是 `fx`。

**金色電流沒有出現？**
依序檢查：區塊是否已經啟動、`InfoRegionConfig.fx` 是否被設成 `false`、區塊是否有 `fx="off"`、瀏覽器是否支援 `@property`。

**重設後選項還是鎖住？**
請用群組的「重設」按鈕或 `group.reset()`，它會清除選項狀態、解說、繼續按鈕與計分。

**想新增顏色？**
修改檔案開頭的 `BrandColors` 物件，新增一組名稱與色碼，色條、按鈕與電流都會自動支援。

## 專案檔案

| 檔案 | 說明 |
|---|---|
| `info-region.js` | 元件本體 |
| `info-region-demo-10-28-26.html` | 示範頁，含電流範例、測驗、即時透明度檢查與修改前後對照，與 `info-region.js` 放在同一個資料夾即可開啟 |
| `README.md` | 本文件 |

## 授權

尚未指定授權。公開到 GitHub 之前，請加入 `LICENSE` 檔案並在此註明。
