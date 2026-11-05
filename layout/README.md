# layout 版面元件：ui-drill、ui-cards、ui-steps

三個以語意標籤撰寫的版面元件，共用同一套「內容來源、外觀、互動」約定。每個元件都是單一 `.js` 檔，載入後自動注入樣式，不使用 Shadow DOM。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-drill.js` | `<ui-drill>` `<drill-tile>` `<rightup-item>` | 左側方塊、中欄清單、右欄細節的逐層鑽取介面，支援三欄、頁籤與收件匣版面。 |
| `ui-cards.js` | `<ui-cards>` `<card-item>` | 卡片網格與細節內容區，支援顯示按鈕與內容區角標。 |
| `ui-steps.js` | `<ui-steps>` `<step-item>` | 橫向或直向的流程與時間軸，點步驟顯示內容。 |

## 目錄

- [共同約定](#共同約定)
- [ui-drill.js](#ui-drilljs)
- [ui-cards.js](#ui-cardsjs)
- [ui-steps.js](#ui-stepsjs)

---

## 共同約定

`ui-drill`、`ui-cards`、`ui-steps` 共用同一套屬性命名，學會一個就能套用到其他兩個。完整說明見 `ui-conventions.html`。

| 屬性 | 說明 |
| --- | --- |
| `source` | 指向 `div` 或 `<template>` 的 id，填入主要內容區。 |
| `detail` | 指向 id，填入細節區。項目本身或已顯示內容裡的任何元素都可以帶這個屬性。 |
| `detail-title` | 寫在觸發元素上，覆寫細節區標題。 |
| `title` | 容器標題，讀取後會從元素移除，避免出現瀏覽器原生提示。 |
| `label`、`note`、`tooltip`、`icon`、`badge` | 項目名稱、次要說明、滑鼠提示、Bootstrap 圖示（`star-fill` 或 `bi-star-fill` 皆可）、角標。 |
| `gap`、`padding`、`size`、`height`、`*-width` | 數字，單位一律是 px。 |
| `icon-size` | 數字，單位是 rem。 |
| `color`、`accent`、`*-color` | 品牌色名稱或色碼。`accent` 一律表示選中或目前狀態的顏色。 |
| `trigger`、`detail-trigger` | `click` 或 `hover`。 |
| `toggle` | 寫在容器上，再點一次已選項目時取消；寫在觸發元素上，再點一次收起細節。 |
| `active`、`active-detail` | 初始選中的項目與初始開啟的細節。 |
| `disabled` | 停用項目或按鈕。 |
| `href`、`target` | 項目改為連結。 |
| `placeholder` | 尚未選擇時的提示，設空字串則不顯示。 |

- 內容一律複製，同一份來源可被多個元件、多個項目共用。找不到 id 時在該處顯示紅框警告，不中斷其他功能。
- 帶 `detail` 的元素自動套用按鈕樣式；已有 Bootstrap `btn` 類別時不覆蓋。
- 屬性只在載入時讀取一次，之後修改屬性不會更新畫面。沒有切換動畫。
- 元件可以放在其他元件的內容來源裡，複製出來時會自動建立，可以一層一層嵌套。

---

## ui-drill.js

`<ui-drill>` 是一個零相依、單一檔案的網頁元件，用來製作「左側方塊 → 中欄清單或按鈕 → 右欄細節」的逐層鑽取介面。常見用途包括產品分類瀏覽、設定面板、知識庫目錄、收件匣，以及教學單元導覽。

- 單一 `ui-drill.js`，CSS 與 JavaScript 合併在同一檔案，載入後自動注入樣式。
- 不使用 Shadow DOM，可以直接用外部 CSS 覆寫。
- 以語意標籤撰寫：`<ui-drill>`、`<drill-tile>`、`<rightup-item>`。
- 支援三欄、頁籤、上下堆疊（收件匣）三種版面。
- 所有色彩屬性都可直接寫品牌色名稱，例如 `accent="sky"`。

### 快速開始

```html
<ui-drill title="產品目錄" mid-title="{label}" right-title="{label}">
  <drill-tile icon="laptop" label="筆電" source="cat-laptop"></drill-tile>
  <drill-tile icon="phone" label="手機" source="cat-phone"></drill-tile>
</ui-drill>

<template id="cat-laptop">
  <button detail="laptop-pro" label="Pro 14">Pro 14</button>
  <button detail="laptop-air" label="Air 13">Air 13</button>
</template>
<template id="cat-phone">
  <button detail="phone-x">X 系列</button>
</template>

<template id="laptop-pro"><p>14 吋、32GB 記憶體、1TB SSD。</p></template>
<template id="laptop-air"><p>13 吋、16GB 記憶體、512GB SSD。</p></template>
<template id="phone-x"><p>6.1 吋螢幕，雙鏡頭。</p></template>
```

### 運作方式

```
┌──────────┐   source   ┌──────────────┐   detail   ┌──────────────┐
│ 左欄方塊  │ ─────────▶ │ 中欄（內容）  │ ─────────▶ │ 右欄（細節）  │
│drill-tile│            │ [detail] 按鈕 │            │              │
└──────────┘            └──────────────┘            └──────────────┘
```

1. 點擊左欄的 `<drill-tile>`，元件會找出 id 等於該方塊 `source` 的元素，複製其內容放進中欄。
2. 中欄內任何帶 `detail` 屬性的元素（通常是 `<button>`）都會變成細節按鈕。點擊後，id 等於 `detail` 的元素內容會放進右欄。
3. 右欄的內容同樣可以再放 `detail` 按鈕，點擊後會替換右欄。

內容來源可以是 `<template>`（建議）或任何帶 id 的元素。若來源是一般元素，元件會複製它、移除 id，並解除 `hidden` 與 `display:none`，原始元素保持不動，所以可以把它設成 `hidden` 藏在頁面上。

### 範例

#### 1. 基本三欄

方塊下方顯示文字、四欄方塊、自訂提示文字。

```html
<ui-drill title="課程地圖" columns="3,4,5" tile-cols="4" tile-label="below"
          mid-title="{label} 單元" right-title="{label}"
          mid-placeholder="請先選擇一個科目。" right-placeholder="選擇單元後，這裡會顯示學習重點。">
  <drill-tile icon="calculator" label="數學" source="s-math"></drill-tile>
  <drill-tile icon="globe2" label="地理" source="s-geo"></drill-tile>
  <drill-tile icon="flask" label="化學" source="s-chem"></drill-tile>
  <drill-tile icon="book" label="國文" source="s-lit"></drill-tile>
</ui-drill>

<template id="s-math">
  <button detail="m-1" label="一次函數">一次函數</button>
  <button detail="m-2" label="畢氏定理">畢氏定理</button>
</template>
<template id="s-geo"><button detail="g-1" label="氣候分區">氣候分區</button></template>
<template id="s-chem"><button detail="c-1" label="酸鹼中和">酸鹼中和</button></template>
<template id="s-lit"><p>本學期國文單元尚未開放。</p></template>

<template id="m-1"><p>斜率代表變化率，截距代表起始值。</p></template>
<template id="m-2"><p>直角三角形中，兩股平方和等於斜邊平方。</p></template>
<template id="g-1"><p>依柯本分類法分為五大氣候帶。</p></template>
<template id="c-1"><p>酸與鹼反應生成鹽和水。</p></template>
```

`tile-label` 可設為 `tooltip`（預設，滑過顯示）、`below`（顯示在方塊下方）或其他任何值（完全不顯示）。

#### 2. 方塊分組、徽章、停用與外部連結

```html
<ui-drill title="系統設定" tile-shape="rounded" tile-cols="3" accent="lavender"
          tile-color="vanilla" icon-color="base" mid-title="{label}">
  <drill-tile group="帳號" icon="person" label="個人資料" source="set-profile"></drill-tile>
  <drill-tile group="帳號" icon="shield-lock" label="安全性" source="set-security" badge="2"></drill-tile>
  <drill-tile group="帳號" icon="credit-card" label="付款" disabled></drill-tile>

  <drill-tile group="其他" icon="palette" label="外觀" source="set-theme" color="salmon" active-color="pink"></drill-tile>
  <drill-tile group="其他" icon="question-circle" label="說明中心" href="https://example.com/help" target="_blank"></drill-tile>
</ui-drill>

<template id="set-profile"><button detail="p-name">顯示名稱</button></template>
<template id="set-security">
  <button detail="sec-2fa">兩步驟驗證</button>
  <button detail="sec-device">已登入裝置</button>
</template>
<template id="set-theme"><button detail="theme-dark">深色模式</button></template>
<template id="p-name"><p>名稱會顯示在留言與報表上。</p></template>
<template id="sec-2fa"><p>建議開啟兩步驟驗證。</p></template>
<template id="sec-device"><p>目前有 2 台裝置登入。</p></template>
<template id="theme-dark"><p>深色模式已預設啟用。</p></template>
```

- `group`：連續同名的方塊會歸成一組，組名顯示在上方。
- `badge`：右上角紅色徽章。
- `disabled`：無法點擊，以虛線外框顯示。
- `href`／`target`：點擊後直接開啟網址，不會切換中欄。
- `color`／`active-color`／`icon-color`：單一方塊的底色、選取色與圖示色。

#### 3. 細節按鈕的顏色與 Bootstrap 按鈕

中欄的細節按鈕預設使用 `ocean` 底色。可在元件上用 `button-color` 統一設定，也可在個別按鈕上用 `color` 覆寫。按鈕若已經帶有 Bootstrap 的 `btn` 或 `btn-*` 類別，元件就不會套用自己的樣式。

```html
<ui-drill title="專案狀態" button-color="sky" mid-title="{label}" right-title="{label}">
  <drill-tile icon="kanban" label="進行中" source="proj-doing"></drill-tile>
</ui-drill>

<template id="proj-doing">
  <button detail="pj-a" label="官網改版">官網改版</button>
  <button detail="pj-b" color="orange" label="App 2.0">App 2.0</button>
  <button detail="pj-c" color="warning" label="延遲專案">延遲專案</button>
  <button detail="pj-d" color="#B3DE73" detail-title="自訂右欄標題">自訂色</button>
  <button detail="pj-e" class="btn btn-outline-info">Bootstrap 按鈕</button>
  <a href="#" detail="pj-f" toggle>可收合（再點一次清空右欄）</a>
  <button detail="pj-a" disabled>停用按鈕</button>
</template>

<template id="pj-a"><p>完成度 80%。</p></template>
<template id="pj-b"><p>完成度 45%。</p></template>
<template id="pj-c"><p>落後兩週，需要重新排程。</p></template>
<template id="pj-d"><p>右欄標題可以用 detail-title 單獨指定。</p></template>
<template id="pj-e"><p>保留 Bootstrap 原生樣式，選取時加上 active。</p></template>
<template id="pj-f"><p>帶 toggle 的按鈕，再點一次會清空右欄。</p></template>
```

`warning`、`indigo`、`teal`、`safe` 這四種深色底會自動改用淺色文字。`label` 屬性決定右欄標題中 `{label}` 的值，沒有設定時會使用按鈕文字。

#### 4. 欄間箭頭

```html
<!-- 預設箭頭 -->
<ui-drill arrows mid-title="{label}">
  <drill-tile icon="folder" label="文件" source="docs-list"></drill-tile>
</ui-drill>

<!-- 只顯示第一個箭頭、V 形、置中 -->
<ui-drill arrows="first" arrow-shape="chevron" arrow-position="middle"
          arrow-color="info" arrow-active-color="yellow" arrow-size="28">
  <drill-tile icon="folder" label="文件" source="docs-list"></drill-tile>
</ui-drill>

<!-- 圓形外框、使用 Bootstrap Icons -->
<ui-drill arrows arrow-style="circle" arrow-icon="arrow-right-short" arrow-size="32" arrow-offset="24" accent="special">
  <drill-tile icon="folder" label="文件" source="docs-list"></drill-tile>
</ui-drill>

<template id="docs-list">
  <button detail="doc-1">年度報告</button>
  <button detail="doc-2">會議紀錄</button>
</template>
<template id="doc-1"><p>2026 年度報告。</p></template>
<template id="doc-2"><p>11 月份會議紀錄。</p></template>
```

| 屬性 | 可用值 | 預設 |
| --- | --- | --- |
| `arrows` | `both`、`first`、`second` | `both` |
| `arrow-shape` | `arrow`、`chevron`、`triangle` | `arrow` |
| `arrow-icon` | Bootstrap Icons 名稱，設定後取代 `arrow-shape` | 無 |
| `arrow-style` | `circle` | 無 |
| `arrow-position` | `top`、`middle`、`bottom` | `top` |
| `arrow-size` | 像素 | `24` |
| `arrow-offset` | 距離頂端或底端的像素 | `16` |
| `arrow-color` | 色名或 CSS 色值 | `shell` |
| `arrow-active-color` | 下一欄有內容時的顏色 | 沿用 `accent` |

#### 5. 外框、高度與欄寬比例

```html
<ui-drill bordered columns="1,2,3" gap="0" height="360" tile-cols="2" tile-size="56" tile-gap="12" icon-size="1.8"
          tile-shape="circle" accent="teal" mid-title="{label}" right-title="細節">
  <drill-tile icon="cup-hot" label="飲品" source="menu-drink"></drill-tile>
  <drill-tile icon="egg-fried" label="早餐" source="menu-breakfast"></drill-tile>
</ui-drill>

<template id="menu-drink">
  <button detail="d-latte">拿鐵</button>
  <button detail="d-tea">烏龍茶</button>
</template>
<template id="menu-breakfast"><button detail="b-toast">厚片吐司</button></template>
<template id="d-latte"><p>中杯 75 元，可換燕麥奶。</p></template>
<template id="d-tea"><p>冷熱皆可，無糖。</p></template>
<template id="b-toast"><p>花生、奶酥、巧克力三種口味。</p></template>
```

- `columns`：三欄的比例，例如 `2,5,5`（預設）。
- `height`／`min-height`：整體高度（px），內容超出時欄位會自動捲動。
- `bordered`：加上外框與欄間分隔線，欄間距會變成 0。
- `tile-shape`：預設方形，可設 `rounded` 或 `circle`。

#### 6. 頁籤模式

`tile-shape` 設成 `tab-` 開頭的值時，方塊會變成橫向頁籤列，下方只剩中欄與右欄（比例取 `columns` 的第二、三個值）。頁籤底色預設使用各自的 `color`，選取後下方色條也會跟著變色。

```html
<ui-drill tile-shape="tab-trapezoid" columns="0,5,7" tab-align="start" bordered
          mid-title="{label}" right-title="{label}">
  <drill-tile icon="house" label="首頁" source="tab-home" color="sky"></drill-tile>
  <drill-tile icon="bar-chart" label="報表" source="tab-report" color="special" badge="3"></drill-tile>
  <drill-tile icon="gear" label="設定" source="tab-set" color="lavender"></drill-tile>
  <drill-tile icon="lock" label="管理" color="salmon" disabled></drill-tile>
</ui-drill>

<template id="tab-home"><button detail="h-news">最新公告</button></template>
<template id="tab-report">
  <button detail="r-month">月報</button>
  <button detail="r-year">年報</button>
</template>
<template id="tab-set"><button detail="s-lang">語言</button></template>
<template id="h-news"><p>系統將於週六凌晨維護。</p></template>
<template id="r-month"><p>10 月營收成長 12%。</p></template>
<template id="r-year"><p>年度目標達成 87%。</p></template>
<template id="s-lang"><p>目前語言：繁體中文。</p></template>
```

可用的頁籤造型：

| `tile-shape` | 外觀 |
| --- | --- |
| `tab-trapezoid` | 梯形 |
| `tab-rounded` | 上方圓角 |
| `tab-folder` | 資料夾標籤 |
| `tab-pill` | 膠囊形，預設沒有底部色條 |
| `tab-underline` | 透明底，選取時顯示底線 |

頁籤專用屬性：

```html
<ui-drill tile-shape="tab-pill" tab-align="stretch" tab-font-size="1.05" tab-padding="24"
          tab-dim="0.6" tab-bar="0" tile-size="44">
  <drill-tile label="全部" source="tab-home" color="ocean"></drill-tile>
  <drill-tile label="報表" source="tab-report" color="yellow"></drill-tile>
</ui-drill>

<ui-drill tile-shape="tab-underline" tab-width="140" accent="orange">
  <drill-tile icon="house" label="首頁" source="tab-home"></drill-tile>
  <drill-tile icon="gear" label="設定" source="tab-set"></drill-tile>
</ui-drill>
```

| 屬性 | 說明 | 預設 |
| --- | --- | --- |
| `tab-align` | `start`、`center`、`end`、`stretch` | `start` |
| `tab-width` | 固定頁籤寬度（px） | 自動 |
| `tab-padding` | 頁籤左右內距（px） | `18` |
| `tab-font-size` | 頁籤字體大小（rem） | `1` |
| `tab-dim` | 未選取頁籤的亮度，0 到 1 | `0.75` |
| `tab-bar` | 底部色條粗細（px） | `4`，`tab-pill` 為 `0` |

#### 7. 堆疊模式（收件匣）

`layout="stack"` 會把右側改成上下兩區：上方是 `<rightup-item>` 清單，下方是細節。適合做收件匣、通知中心、工單清單。

```html
<ui-drill layout="stack" title="收件匣" bordered height="520" stack-ratio="2,3" columns="2,5,5"
          tile-cols="1" tile-shape="rounded" tile-count="unread" mark-read auto-open
          rightup-label="top" rightup-lines="2" rightup-divider="dashed" rightup-divider-color="info"
          mid-title="{label}" right-title="{label}" list-empty="這個資料夾目前是空的。">

  <drill-tile icon="inbox" label="收件匣" source="folder-inbox">
    <rightup-item label="王小明" meta="09:12" badge="重要" unread detail="mail-1">
      下週一的簡報請再確認一次數字，特別是第三季的部分。
    </rightup-item>
    <rightup-item label="財務部" meta="昨天" unread detail="mail-2">
      十月份報帳截止日為本週五。
    </rightup-item>
  </drill-tile>

  <drill-tile icon="star" label="已加星號" source="folder-star">
    <rightup-item label="李主任" meta="11/01" icon="star-fill" detail="mail-3">
      年度計畫書初稿已上傳。
    </rightup-item>
  </drill-tile>

  <drill-tile icon="trash" label="垃圾桶"></drill-tile>

  <!-- 沒有 tile 屬性、也不在 drill-tile 內的項目，所有資料夾都會顯示 -->
  <rightup-item label="系統公告" meta="置頂" color="yellow" divider="solid" detail="mail-sys">
    維護時間：週六 02:00 到 04:00。
  </rightup-item>

  <!-- 用 tile 屬性指定所屬資料夾，可以用逗號列出多個 -->
  <rightup-item label="人資部" meta="10/28" tile="folder-inbox,folder-star" detail="mail-4">
    年終健康檢查開放預約。
  </rightup-item>
</ui-drill>

<template id="folder-inbox"><p>點選上方郵件即可閱讀全文。</p></template>
<template id="folder-star"><p>這裡是你標記為重要的郵件。</p></template>
<template id="mail-1"><p>小明你好，下週一的簡報……</p></template>
<template id="mail-2"><p>請於本週五前完成十月份報帳。</p></template>
<template id="mail-3"><p>年度計畫書初稿已上傳到共用資料夾。</p></template>
<template id="mail-4"><p>健康檢查預約連結如下。</p></template>
<template id="mail-sys"><p>週六凌晨將進行系統維護。</p></template>
```

堆疊模式的重點：

- `<rightup-item>` 可以直接寫在 `<drill-tile>` 內，會自動歸屬於該方塊。也可以寫在外層並用 `tile` 屬性指定，值為方塊的 `source`。
- 尚未點選清單時，下方細節區會顯示目前方塊 `source` 的內容，適合放資料夾說明。
- `tile-count`：在方塊上顯示數量徽章，值為 `unread`（預設，只算未讀）或 `all`。方塊若已設定 `badge` 則以 `badge` 為準。
- `mark-read`：開啟項目後移除 `unread` 狀態並更新數量。
- `auto-open`：切換資料夾時自動開啟第一筆可用項目。
- `stack-ratio`：上下兩區的高度比例，需搭配 `height` 才有作用。
- `rightup-label="top"`：標題與時間放在同一行，內文放下一行並依 `rightup-lines` 截斷行數。

`<rightup-item>` 預設版面（標籤在左）：

```html
<ui-drill layout="stack" rightup-label-width="120" rightup-padding="10" rightup-divider rightup-max-height="240">
  <drill-tile icon="list-task" label="工單" source="ticket-help">
    <rightup-item label="#1024" note="印表機無法列印" meta="處理中" detail="t-1024"></rightup-item>
    <rightup-item label="#1025" note="VPN 連線逾時" meta="待指派" align="right" detail="t-1025"></rightup-item>
    <rightup-item label="#1026" note="已結案" disabled></rightup-item>
  </drill-tile>
</ui-drill>

<template id="ticket-help"><p>選擇一張工單查看處理紀錄。</p></template>
<template id="t-1024"><p>已派工程師到場。</p></template>
<template id="t-1025"><p>等待網管人員回覆。</p></template>
```

#### 8. 預先選取與滑過觸發

```html
<!-- 載入時直接選取「手機」，並開啟右欄的 phone-x -->
<ui-drill active="cat-phone" active-detail="phone-x" mid-title="{label}" right-title="{label}">
  <drill-tile icon="laptop" label="筆電" source="cat-laptop"></drill-tile>
  <drill-tile icon="phone" label="手機" source="cat-phone"></drill-tile>
</ui-drill>

<!-- 滑鼠滑過方塊與按鈕就切換，不必點擊 -->
<ui-drill trigger="hover" detail-trigger="hover" mid-title="{label}">
  <drill-tile icon="laptop" label="筆電" source="cat-laptop"></drill-tile>
  <drill-tile icon="phone" label="手機" source="cat-phone" detail="phone-x"></drill-tile>
</ui-drill>
```

- `active`：值為某個方塊的 `source`。
- `active-detail`：值為細節內容的 id。
- 方塊本身也可以設 `detail`，選取該方塊時會同時開啟右欄。

#### 9. 鍵盤操作與點擊收合

```html
<ui-drill keyboard toggle tile-cols="3" mid-title="{label}">
  <drill-tile icon="1-circle" label="第一章" source="ch-1"></drill-tile>
  <drill-tile icon="2-circle" label="第二章" source="ch-2"></drill-tile>
  <drill-tile icon="3-circle" label="第三章" source="ch-3" disabled></drill-tile>
</ui-drill>

<template id="ch-1"><button detail="ch-1-1">1-1 導論</button></template>
<template id="ch-2"><button detail="ch-2-1">2-1 方法</button></template>
<template id="ch-1-1"><p>本章介紹研究背景。</p></template>
<template id="ch-2-1"><p>本章說明研究方法。</p></template>
```

`keyboard` 開啟後的按鍵：

| 按鍵 | 動作 |
| --- | --- |
| 方向鍵 | 在方塊間移動，自動跳過停用方塊 |
| `Home`／`End` | 移到第一個或最後一個可用方塊 |
| `Enter`／`Space` | 選取目前方塊 |
| `Esc` | 清空右欄 |

`toggle`：再點一次已選取的方塊會取消選取並清空中欄與右欄。

#### 10. 隱藏空白的右欄

```html
<ui-drill hide-empty-right columns="2,10,0" mid-title="{label}" right-title="{label}">
  <drill-tile icon="images" label="相簿" source="album"></drill-tile>
</ui-drill>

<template id="album">
  <p>右欄在開啟細節之前會隱藏，中欄會佔滿剩餘空間。</p>
  <button detail="photo-1">查看照片</button>
</template>
<template id="photo-1"><p>2026 年員工旅遊合照。</p></template>
```

### 屬性參考

#### `<ui-drill>`

| 屬性 | 說明 | 預設 |
| --- | --- | --- |
| `title` | 元件標題（建構後會從元素上移除，避免出現原生提示） | 無 |
| `layout` | `stack` 為堆疊模式，其他值為三欄 | 三欄 |
| `columns` | 三欄比例，以逗號分隔 | `2,5,5` |
| `gap` | 欄間距（px） | `16` |
| `height`／`min-height` | 高度、最小高度（px） | 自動 |
| `bordered` | 顯示外框與分隔線 | 關 |
| `accent` | 選取狀態的主色 | `ocean` |
| `tile-shape` | `rounded`、`circle`，或 `tab-*` 頁籤造型 | 方形 |
| `tile-cols` | 方塊每列數量 | `3` |
| `tile-size` | 方塊尺寸（px） | `48`，頁籤為 `40` |
| `tile-gap` | 方塊間距（px） | `8`，頁籤為 `4` |
| `tile-color` | 方塊底色 | `shell` |
| `icon-color` | 方塊圖示色 | `base` |
| `icon-size` | 圖示大小（rem） | `1.5`，頁籤為 `1.1` |
| `tile-label` | `tooltip`、`below`，其他值不顯示 | `tooltip` |
| `trigger` | 方塊觸發方式：`click`、`hover` | `click` |
| `detail-trigger` | 細節按鈕觸發方式：`click`、`hover` | `click` |
| `mid-title` | 中欄標題，`{label}` 會換成方塊名稱 | 無 |
| `right-title` | 右欄標題，`{label}` 會換成按鈕名稱 | 無 |
| `mid-placeholder` | 中欄提示文字，設為空字串可隱藏 | `請點選左側方塊。` |
| `right-placeholder` | 右欄提示文字 | `請點選中欄按鈕。`，堆疊模式為 `請點選上方清單。` |
| `hide-empty-right` | 右欄沒有內容時隱藏 | 關 |
| `button-color` | 細節按鈕預設色（別名 `button-variant`） | `ocean` |
| `toggle` | 再點一次已選方塊時取消選取 | 關 |
| `keyboard` | 啟用鍵盤操作 | 關 |
| `active` | 預先選取的方塊 `source` | 無 |
| `active-detail` | 預先開啟的細節 id | 無 |
| `arrows` 系列 | 見[欄間箭頭](#4-欄間箭頭) | 無 |
| `tab-*` 系列 | 見[頁籤模式](#6-頁籤模式) | 無 |

#### 堆疊模式專用

| 屬性 | 說明 | 預設 |
| --- | --- | --- |
| `rightup-title` | 清單區標題（`mid-title` 優先） | 無 |
| `list-empty` | 資料夾沒有項目時的提示 | `此分類沒有項目。` |
| `auto-open` | 切換資料夾時自動開啟第一筆 | 關 |
| `mark-read` | 開啟後移除 `unread` | 關 |
| `tile-count` | `unread` 或 `all` | `unread` |
| `stack-ratio` | 上下兩區高度比例，需搭配 `height` | `1,1` |
| `rightup-label` | `top` 為標題在上的版面 | 標籤在左 |
| `rightup-label-width` | 左側標籤寬度（px） | `96` |
| `rightup-lines` | `top` 版面的內文截斷行數 | `2` |
| `rightup-padding` | 每列上下內距（px） | `8` |
| `rightup-divider` | 分隔線：`solid`、`dashed`、`dotted`、`none` | 無 |
| `rightup-divider-color` | 分隔線顏色 | `shell` |
| `rightup-max-height` | 清單區最大高度（px） | 無 |

#### `<drill-tile>`

| 屬性 | 說明 |
| --- | --- |
| `source` | 中欄內容的來源 id，堆疊模式為下方預設內容 |
| `label` | 名稱，用於提示文字、標題 `{label}` 與頁籤文字 |
| `icon` | Bootstrap Icons 名稱，可省略 `bi-` 前綴 |
| `tooltip` | 自訂提示文字 |
| `badge` | 右上角徽章 |
| `group` | 分組名稱（頁籤模式不顯示） |
| `color`／`active-color`／`icon-color` | 單一方塊的色彩 |
| `size` | 單一方塊尺寸（px） |
| `detail` | 選取此方塊時同時開啟的細節 id |
| `href`／`target` | 改為連結，點擊後開啟網址 |
| `disabled` | 停用 |

#### 細節按鈕（任何帶 `detail` 的元素）

| 屬性 | 說明 |
| --- | --- |
| `detail` | 右欄內容的來源 id |
| `label` | 右欄標題 `{label}` 的值，預設為按鈕文字 |
| `detail-title` | 直接指定右欄標題 |
| `color` | 按鈕顏色（別名 `variant`） |
| `toggle` | 再點一次時清空右欄 |
| `disabled` | 停用 |

#### `<rightup-item>`

| 屬性 | 說明 |
| --- | --- |
| `label` | 標題 |
| `note` | 單行副標 |
| `meta` | 右側小字，例如時間 |
| `badge` | 右側徽章 |
| `icon` | 左側圖示 |
| `tile` | 所屬方塊的 `source`，可用逗號列出多個 |
| `detail` | 點擊後開啟的細節 id |
| `unread` | 未讀狀態 |
| `divider` | 單列分隔線樣式 |
| `color` | 文字顏色 |
| `align` | 內文對齊方式 |
| `detail-title`／`toggle`／`disabled` | 與細節按鈕相同 |

### CSS 覆寫

元件不使用 Shadow DOM，所有類別都以 `uid-` 開頭，可以直接覆寫：

```css
/* 中欄內文改用較小字體 */
ui-drill .uid-mid .uid-body { font-size: 0.95rem; }

/* 提示框改成實線 */
ui-drill .uid-ph { border-style: solid; }

/* 方塊選取時加上陰影 */
ui-drill drill-tile[data-active] .uid-box { box-shadow: 0 0 0 4px rgba(28, 202, 232, 0.8); }
```

常用的 CSS 變數：

| 變數 | 用途 |
| --- | --- |
| `--uid-tile` | 方塊底色 |
| `--uid-tile-on` | 選取色 |
| `--uid-icon` | 圖示色 |
| `--uid-size` | 方塊尺寸 |
| `--uid-gap` | 欄間距 |

---

## ui-cards.js

`<ui-cards>` 把多張 `<card-item>` 排成卡片網格。卡片可以只是展示，也可以點擊後在下方或右側的內容區顯示細節；卡片內與內容區裡任何帶 `detail` 的按鈕也能開啟細節。另外支援 `reveal` 按鈕，按下後顯示頁面上另一個隱藏區塊。遵守 ui 元件共同約定：屬性只在載入時讀取一次，內容一律複製，數字單位為 px（字級為 rem），顏色可填品牌色名稱或色碼。

### 標籤

| 標籤 | 用途 |
| --- | --- |
| `<ui-cards>` | 外層容器，網格、內容區與互動設定都寫在這裡。 |
| `<card-item>` | 一張卡片，子內容會放進卡片的內文區。 |
| 任何帶 `detail` 的元素 | 細節按鈕，可放在卡片內或內容區裡。 |
| 任何帶 `reveal` 的元素 | 顯示按鈕，按下後顯示指定 id 的區塊。 |

### `<ui-cards>` 屬性：網格與卡片外觀

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `title` | 文字 | 無 | 元件大標題。 |
| `title-size` | 數字（rem）或長度 | `1.2rem` | 大標題字級。 |
| `title-color` | 顏色 | `lavender` | 大標題顏色。 |
| `cols` | 整數 | `3` | 每列卡片數。 |
| `gap` | 數字（px） | `16` | 卡片間距，也是網格與內容區的距離。 |
| `align` | `center` | 靠左 | 卡片內容置中。 |
| `bordered` | 布林 | 關閉 | 整個元件加外框。 |
| `card-style` | `filled`、`plain` | 外框卡片 | 整組卡片的外觀。`filled` 以 `color` 填滿卡片；`plain` 拿掉外框與底色。個別卡片可用自己的 `card-style` 覆寫。 |
| `color` | 顏色 | `shell` | 卡片外框色，`filled` 時為底色。 |
| `accent` | 顏色 | `ocean` | 選中卡片的外框與光暈色。 |
| `active-style` | `filled` | 無 | 目前選中的卡片以 `accent` 色實心顯示，其他卡片維持原本外觀。 |
| `card-padding` | 數字（px） | `16` | 卡片內距。 |
| `card-radius` | 數字（px） | `8` | 卡片圓角。 |
| `card-height` | 數字（px） | 自動 | 卡片最小高度。 |
| `media-position` | `left` | 上方 | 圖示或圖片放在卡片左側。 |
| `media-height` | 數字（px） | `140` | 圖片高度（圖片在上方時）。 |
| `media-width` | 數字（px） | `120` | 圖示或圖片寬度（在左側時）。 |
| `icon-size` | 數字（rem）或長度 | `2rem` | 圖示大小。 |
| `icon-color` | 顏色 | 跟隨文字 | 圖示顏色。 |
| `divider` | `solid`、`dashed`、`dotted`、`none` | 無 | 卡片頁尾上方的分隔線。只寫屬性不給值時為 `solid`。 |
| `divider-color` | 顏色 | 跟隨 `color` | 分隔線顏色。 |
| `badge-color` | 顏色 | 內建 | 所有卡片角標的底色，文字色自動取對比。 |
| `label-size`、`note-size`、`tag-size`、`body-size`、`footer-size`、`badge-size` | 數字（rem）或長度 | 內建 | 卡片各部位字級。 |

### `<ui-cards>` 屬性：內容區與互動

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `panel` | `below`、`right`、`none` | `below` | 內容區位置。只有網格裡有 `detail` 時才會建立內容區。 |
| `panel-columns` | `網格,內容區` | `8,4` | `panel="right"` 時的寬度比例。 |
| `panel-height` | 數字（px） | 自動 | 內容區最大高度，超過時捲動。 |
| `panel-title` | 文字 | 空 | 內容區標題，可用 `{label}` 代入卡片的 `label`。 |
| `panel-title-size` | 數字（rem）或長度 | `1.1rem` | 內容區標題字級。 |
| `panel-title-color` | 顏色 | `lavender` | 內容區標題顏色。 |
| `panel-title-line` | 顏色或 `none` | 跟隨標題色 | 標題底線顏色；`none` 移除底線。 |
| `placeholder` | 文字 | `請點選卡片。` | 尚未選擇時的提示；設空字串則不顯示。 |
| `hide-empty-panel` | 布林 | 關閉 | 尚未選擇時隱藏內容區。 |
| `panel-badge` | 文字 | 無 | 內容區右上角的角標文字。 |
| `panel-badge-icon` | Bootstrap Icons 名稱 | 無 | 內容區角標圖示。 |
| `panel-badge-color` | 顏色 | 內建 | 內容區角標底色。 |
| `trigger` | `click`、`hover` | `click` | 卡片開啟細節的方式。 |
| `detail-trigger` | `click`、`hover` | `click` | 細節按鈕開啟細節的方式。 |
| `toggle` | 布林 | 關閉 | 再點一次已選的卡片或按鈕時收起細節。 |
| `active-detail` | 元素 id | 無 | 載入時就開啟的細節。 |
| `button-color` | 顏色 | `ocean` | 細節按鈕的預設底色。 |

### `<card-item>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `label` | 文字 | 卡片標題。 |
| `note` | 文字 | 標題下方的次要說明。 |
| `card-style` | `filled`、`plain`、`outline` | 只設定這張卡片的外觀，優先於 `<ui-cards>` 的 `card-style`。整組實心時，可用 `outline` 讓這張恢復外框。 |
| `tags` | 逗號分隔文字 | 一排小標籤。 |
| `icon` | Bootstrap Icons 名稱 | 卡片圖示，`star` 或 `bi-star` 皆可。 |
| `image` | 圖片網址 | 卡片圖片，優先於 `icon`。 |
| `source` | 元素 id | 把該元素（或 `<template>`）的內容複製到卡片內文。 |
| `footer` | 文字 | 卡片頁尾。 |
| `badge` | 文字 | 右上角角標。 |
| `badge-icon` | Bootstrap Icons 名稱 | 角標圖示。 |
| `badge-color` | 顏色 | 這張卡片的角標底色。 |
| `color`、`icon-color`、`icon-size` | 同 `<ui-cards>` | 只覆寫這張卡片。 |
| `label-size` 等字級屬性 | 同 `<ui-cards>` | 只覆寫這張卡片。 |
| `span` | 整數 | 卡片橫跨的欄數。 |
| `tooltip` | 文字 | 滑鼠提示。 |
| `detail` | 元素 id | 點擊卡片時在內容區顯示的內容。 |
| `detail-title` | 文字 | 覆寫內容區標題。 |
| `href`、`target` | 網址、視窗名稱 | 卡片改為連結。 |
| `disabled` | 布林 | 停用，外框改虛線並轉灰。 |
| `toggle` | 布林 | 再點一次這張卡片時收起細節。 |

### 細節按鈕屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `detail` | 元素 id | 要顯示的內容。 |
| `detail-title` | 文字 | 覆寫內容區標題。 |
| `color` | 顏色 | 按鈕底色，預設為 `button-color`。 |
| `toggle` | 布林 | 再點一次收起細節。 |
| `disabled` | 布林 | 停用。 |
| `detail-badge`、`detail-badge-icon`、`detail-badge-color` | 同 `panel-badge` | 開啟這個細節時使用的內容區角標，優先於 `<ui-cards>` 的設定；寫空值可隱藏角標。 |

### 顯示按鈕屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `reveal` | 元素 id | 按下後顯示這個區塊（移除 `hidden`、`d-none` 或 `display:none`）。 |
| `remove-cards` | 布林 | 顯示後把整個 `<ui-cards>` 從頁面移除。 |
| `reveal-scroll` | 布林 | 顯示後平滑捲動到該區塊。 |
| `color` | 顏色 | 按鈕底色。 |
| `disabled` | 布林 | 停用。 |

### 屬性解說

- **內容來源**：`source`、`detail`、`reveal` 都指向頁面上的 id，建議用 `<template>` 或加上 `hidden` 的 `div`。內容一律複製，同一份來源可以被多張卡片共用。找不到 id 時會在該處顯示紅框警告。
- **按鈕樣式**：帶 `detail` 或 `reveal` 的元素會自動套用按鈕樣式；已有 Bootstrap `btn` 類別時不覆蓋，並在選中時加上 `active`。
- **點擊優先順序**：`reveal` 按鈕最優先，其次是帶 `detail` 的元素，最後才是帶 `href` 的卡片。卡片內一般的連結與按鈕不會被卡片攔截。
- **實心的文字色**：卡片實心時（`card-style="filled"` 或 `active-style="filled"` 的選中卡片），文字、圖示與標籤依底色亮度自動選擇深色或淺色。
- **巢狀**：內容區裡可以再放 `<ui-cards>` 或其他 ui 元件，複製出來時會自動建立。

### 範例

**展示用卡片**

```html
<ui-cards title="本課重點" cols="3" color="sky" divider="dashed">
  <card-item icon="chat-quote" label="開場句" note="第一句不照搬題目" tags="Part 2,Part 3" footer="約 1 分鐘"></card-item>
  <card-item icon="arrow-left-right" label="橫向練習" note="同一語塊跨題使用" badge="新"></card-item>
  <card-item icon="signpost-split" label="銜接敘事" note="從開場句自然展開"></card-item>
</ui-cards>
```

**點卡片在右側顯示細節**

```html
<ui-cards cols="2" panel="right" panel-columns="7,5" panel-title="{label}" accent="pink" toggle>
  <card-item label="湖畔營地" icon="tree-fill" detail="camp-a"></card-item>
  <card-item label="山頂小屋" icon="house" detail="camp-b">
    <button detail="camp-b-rule" color="orange" detail-title="入住須知">須知</button>
  </card-item>
  <card-item label="溪谷營地" note="整修中" icon="tree" disabled detail="camp-a"></card-item>
</ui-cards>

<template id="camp-a"><p>可容納 20 頂帳篷。</p></template>
<template id="camp-b"><p>需提前一週預約。</p></template>
<template id="camp-b-rule"><p>晚上十點後保持安靜。</p></template>
```

**實心卡片、圖示在左與預設開啟**

```html
<ui-cards cols="4" card-style="filled" media-position="left" media-width="64" icon-size="1.6"
          active-detail="sum-a" hide-empty-panel>
  <card-item label="今日訂單" icon="cart-check-fill" color="ocean" detail="sum-a"></card-item>
  <card-item label="新會員" icon="person-plus-fill" color="special" detail="sum-b"></card-item>
  <card-item label="退貨申請" icon="arrow-return-left" color="salmon" badge="3" badge-color="warning"></card-item>
  <card-item label="說明" icon="info-circle" color="lavender" href="#help"></card-item>
</ui-cards>
```

**單張實心與選中實心**

```html
<ui-cards cols="3" color="shell" accent="sky" active-style="filled" active-detail="d-open" toggle panel-title="{label}">
  <card-item icon="chat-quote" label="開場句" detail="d-open"></card-item>
  <card-item icon="arrow-left-right" label="橫向練習" detail="d-cross" card-style="filled" color="pink"></card-item>
  <card-item icon="signpost-split" label="銜接敘事" detail="d-link"></card-item>
</ui-cards>
```

**顯示按鈕與內容區角標**

```html
<ui-cards cols="1" panel-badge="範例" panel-badge-icon="stars">
  <card-item icon="door-open" label="準備好了嗎？" note="按下按鈕開始練習">
    <button reveal="practice-1" remove-cards reveal-scroll color="lavender">開始練習</button>
    <button detail="intro" detail-badge="說明" detail-badge-color="sky">先看說明</button>
  </card-item>
</ui-cards>

<section id="practice-1" hidden>練習內容</section>
<template id="intro"><p>每題限時兩分鐘。</p></template>
```

### 事件

| 事件 | 發出位置 | `detail` | 觸發時機 |
| --- | --- | --- | --- |
| `ui-cards:reveal` | 被顯示的區塊（會冒泡） | `{ id, removed, button }` | `reveal` 按鈕顯示區塊時。 |

---

## ui-steps.js

`<ui-steps>` 是流程與時間軸元件。`<step-item>` 依序排成橫向或直向的節點，節點之間有連接線與箭頭，並依狀態（完成、目前、未開始）上色。點擊帶 `source` 的步驟會在內容區顯示對應內容；內容裡帶 `detail` 的元素再在下方細節區顯示更多內容。遵守 ui 元件共同約定：屬性只在載入時讀取一次，內容一律複製。

### 標籤

| 標籤 | 用途 |
| --- | --- |
| `<ui-steps>` | 外層容器。 |
| `<step-item>` | 一個步驟節點。 |
| 任何帶 `detail` 的元素 | 內容區裡的細節按鈕。 |

### `<ui-steps>` 屬性：排列與狀態

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `title` | 文字 | 無 | 元件標題。 |
| `direction` | `vertical` | 橫向 | 改為直向排列，內容區放在右側。 |
| `columns` | `步驟,內容區` | `4,8` | 直向時兩欄的寬度比例。 |
| `current` | 整數（1 起算） | 無 | 目前進行到第幾步；之前的為完成，之後的為未開始。 |
| `numbered` | 布林 | 關閉 | 沒有圖示的節點顯示編號。 |
| `done-icon` | Bootstrap Icons 名稱 | 無 | 完成狀態的節點改用這個圖示。 |
| `node-size` | 數字（px） | `48` | 節點直徑。 |
| `icon-size` | 數字（rem） | `1.3` | 節點圖示大小。 |
| `label-width` | 數字（px） | 自動 | 步驟文字的寬度。 |
| `gap` | 數字（px） | `24` | 軌道與內容區的距離。 |
| `padding` | 數字（px） | `16` | 內容區內距。 |
| `connector-length` | 數字（px） | `48` | 節點之間的連接長度。 |

### `<ui-steps>` 屬性：顏色

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `color` | `shell` | 未開始節點的顏色。 |
| `accent` | `ocean` | 目前節點與選中節點的顏色，也是亮起的連接線與箭頭的預設色。 |
| `done-color` | `safe` | 完成節點的顏色。 |
| `icon-color` | `base` | 節點內圖示與編號的顏色。 |

### `<ui-steps>` 屬性：連接線與箭頭

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `line` | `solid`、`dashed`、`dotted`、`none` | 無 | 顯示連接線，只寫屬性時為 `solid`。 |
| `line-width` | 數字（px） | `2` | 連接線粗細。 |
| `line-color` | 顏色 | `shell` | 連接線顏色。 |
| `line-active-color` | 顏色 | 跟隨 `accent` | 兩端都已完成或進行中時的連接線顏色。 |
| `arrows` | 布林 | 關閉 | 在連接處放箭頭。 |
| `arrow-shape` | `arrow`、`chevron`、`triangle` | `arrow` | 箭頭形狀。 |
| `arrow-icon` | Bootstrap Icons 名稱 | 無 | 改用圖示當箭頭，優先於 `arrow-shape`。 |
| `arrow-size` | 數字（px） | `20` | 箭頭大小。 |
| `arrow-color` | 顏色 | `shell` | 箭頭顏色。 |
| `arrow-active-color` | 顏色 | 跟隨 `accent` | 亮起的箭頭顏色。 |

### `<ui-steps>` 屬性：內容區與互動

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `panel-title` | 文字 | 空 | 內容區標題，可用 `{label}` 代入步驟名稱。 |
| `detail-title` | 文字 | 空 | 細節區標題。 |
| `panel-height` | 數字（px） | 自動 | 內容區最大高度，超過時捲動。 |
| `placeholder` | 文字 | `請點選步驟。` | 尚未選擇時的提示；設空字串則不顯示。 |
| `trigger` | `click`、`hover` | `click` | 步驟開啟內容的方式。 |
| `detail-trigger` | `click`、`hover` | `click` | 細節按鈕開啟細節的方式。 |
| `toggle` | 布林 | 關閉 | 再點一次已選步驟時收起內容。 |
| `active` | 步驟的 `source` | 無 | 載入時就選取的步驟。 |
| `active-detail` | 元素 id | 無 | 載入時就開啟的細節。 |
| `button-color` | 顏色 | `ocean` | 細節按鈕的預設底色。 |

### `<step-item>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `label` | 文字 | 步驟名稱。 |
| `note` | 文字 | 名稱下方的次要說明，例如日期。 |
| `icon` | Bootstrap Icons 名稱 | 節點圖示。 |
| `badge` | 文字 | 節點角標。 |
| `status` | `done`、`current`、`todo` | 指定狀態，優先於 `current`。 |
| `color` | 顏色 | 只覆寫這個節點的顏色（三種狀態都用此色）。 |
| `icon-color` | 顏色 | 這個節點的圖示顏色。 |
| `source` | 元素 id | 選取時在內容區顯示的內容。 |
| `detail` | 元素 id | 選取時同時在細節區顯示的內容。 |
| `href`、`target` | 網址、視窗名稱 | 步驟改為連結。 |
| `tooltip` | 文字 | 滑鼠提示。 |
| `disabled` | 布林 | 停用。 |

### 細節按鈕屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `detail` | 元素 id | 要在細節區顯示的內容。 |
| `detail-title` | 文字 | 覆寫細節區標題。 |
| `color` | 顏色 | 按鈕底色，預設為 `button-color`。 |
| `toggle` | 布林 | 再點一次收起細節。 |
| `disabled` | 布林 | 停用。 |

### 屬性解說

- **狀態**：每個步驟的狀態先看自己的 `status`，沒有時依 `<ui-steps>` 的 `current` 推算。兩者都沒有時全部為未開始。
- **可點擊的步驟**：只有帶 `source`、`detail` 或 `href` 且未停用的步驟可以點擊；其餘只是展示用的節點。
- **內容區**：只要有任何步驟帶 `source` 或 `detail` 才會建立。橫向時內容區在軌道下方，直向時在右側。
- **內容來源**：建議用 `<template>` 或加上 `hidden` 的 `div`。找不到 id 時會在該處顯示紅框警告。

### 範例

**橫向進度**

```html
<ui-steps current="3" numbered line arrows arrow-shape="chevron" done-icon="check-lg" accent="lavender">
  <step-item label="報名" note="9 月"></step-item>
  <step-item label="分級測驗" note="10 月"></step-item>
  <step-item label="上課" note="11 月"></step-item>
  <step-item label="模擬考" note="12 月"></step-item>
</ui-steps>
```

**直向時間軸與內容區**

```html
<ui-steps direction="vertical" columns="4,8" line="dashed" panel-title="{label}" active="s-1" toggle>
  <step-item label="審題" icon="search" source="s-1"></step-item>
  <step-item label="列大綱" icon="list-ol" source="s-2"></step-item>
  <step-item label="寫作" icon="pencil" source="s-3" badge="40'"></step-item>
</ui-steps>

<template id="s-1"><p>找出題目要求的立場。</p><button detail="s-1-more">看範例</button></template>
<template id="s-1-more"><p>To what extent do you agree or disagree?</p></template>
<template id="s-2"><p>決定兩個主體段的主題句。</p></template>
<template id="s-3"><p>預留五分鐘檢查。</p></template>
```

**指定狀態與連結步驟**

```html
<ui-steps line arrows arrow-icon="arrow-right-circle" color="info" done-color="safe">
  <step-item label="第一課" status="done" href="lesson-1.html"></step-item>
  <step-item label="第二課" status="current" color="orange"></step-item>
  <step-item label="第三課" status="todo" disabled tooltip="尚未開放"></step-item>
</ui-steps>
```
