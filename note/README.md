# bp-popnote

單一 JavaScript 檔案的頁面提示工具包，包含兩個元件：

- **Popnote**：用 `data-popover-*` 屬性把任何文字變成提示框，支援浮動提示、輪播、固定面板、Modal 與 Offcanvas。
- **Notice**：語意標籤 `<bp-notice>`，用來做公告列、促銷列與黏底提示。

另有 `BpPopnote.annotate()`，可以不改 HTML，直接依文字內容替既有文章加上提示。最新加入 **金色電流主題**：金色配色加上沿邊框繞行的電流動畫。

不需要建置工具，不使用 shadow DOM，CSS 由腳本自動注入，主題可自訂。

## 目錄

- [特色](#特色)
- [需求與安裝](#需求與安裝)
- [快速開始](#快速開始)
- [Popnote 提示框](#popnote-提示框)
- [金色電流主題](#金色電流主題)
- [Notice 公告列](#notice-公告列)
- [活用範例](#活用範例)
- [安全性提醒](#安全性提醒)
- [常見問題](#常見問題)
- [專案檔案](#專案檔案)

## 特色

- 一行屬性就能加提示，不用寫 JavaScript。
- 同一份內容可以選四種呈現方式，只改一個屬性。
- 多頁輪播，支援自動播放、進度條與手動切換。
- `annotate` 可依文字精準指定要加註的位置，適合後台編輯器輸出的文章。
- 23 個內建主題名稱（含別名），可自訂主題。
- 金色電流主題：電流環、電光線、閃電、光暈，且可單點、全域或依主題開關。
- 內建 17 色配色（16 色加上 `gold`），以 `BpNotice.palette` 公開，方便與其他元件共用。

## 需求與安裝

| 項目 | 是否必要 | 說明 |
|---|---|---|
| Bootstrap 5 CSS | 使用 Modal 或 Offcanvas 時必要 | 對話框與側欄的外觀來自 Bootstrap |
| Bootstrap 5 JavaScript | 使用 Modal 或 Offcanvas 時必要 | 使用 `bootstrap.Modal` 與 `bootstrap.Offcanvas` |
| Bootstrap Icons | 建議 | 公告列圖示、連結按鈕箭頭使用 `bi-*` 類別 |

只用浮動提示、輪播與固定面板時，不需要 Bootstrap JavaScript。

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">

<!-- 放在 body 結尾之前 -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="bp-popnote.js"></script>
```

腳本載入後會自動初始化。頁面載入完成後才新增的內容，請參考[常見問題](#常見問題)。

## 快速開始

提示框：

```html
<span data-popover-title="resilient"
      data-popover-content="adj. 有復原力的">resilient</span>
```

金色電流提示框：

```html
<span data-popover-theme="gold" data-popover-color="gold"
      data-popover-title="重點"
      data-popover-content="這個提示框的邊框有電流繞行。">重點單字</span>
```

公告列：

```html
<bp-notice type="announcement" color="gold" icon="bi-stars" dismissible
           notice-id="oct-sale" cta-text="了解更多" cta-href="/sale">
  <b>十月限定</b>　全站課程八折。
</bp-notice>
```

## Popnote 提示框

### 觸發器屬性

在任何元素上加屬性即可。只要有 `data-popover-title`、`data-popover-content`、`data-popover-target` 其中之一，就會成為觸發器。

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `data-popover-title` | 無 | 標題，可含 HTML |
| `data-popover-content` | 無 | 內容，可含 HTML |
| `data-popover-target` | 無 | 內容來源的選擇器，例如 `#tpl`，支援 `<template>` 或一般元素，優先於 content |
| `data-popover-theme` | `dark` | 主題名稱，見[內建主題](#內建主題) |
| `data-popover-color` | 主題邊框色 | 觸發文字底線與膠囊的顏色，可填 `PALETTE` 名稱或色碼 |
| `data-popover-placement` | `top` | `top`、`bottom`、`left`、`right`，空間不足時自動翻轉 |
| `data-popover-offset` | `8` | 與觸發器的距離，單位 px |
| `data-popover-maxwidth` | `560px` | 最大寬度 |
| `data-popover-fontsize` | `1rem` | 內文字體大小 |
| `data-popover-border` | `solid` | 邊框樣式，例如 `dashed` |
| `data-popover-arrow` | 顯示 | 設為 `false` 隱藏箭頭 |
| `data-popover-hint` | 顯示 | 設為 `false` 隱藏觸發文字的底線 |
| `data-popover-hint-style` | 虛線底線 | `solid`（實線）、`pill`（膠囊）、`pill-full`（滿版膠囊） |
| `data-popover-interval` | `3000` | 輪播自動切換間隔（毫秒），`0` 表示不自動切換 |
| `data-popover-carousel-anim` | `slide` | `slide` 或 `crossfade` |
| `data-popover-panel` | 無 | 固定面板的選擇器，設為 `false` 可在全域啟用時停用 |
| `data-popover-label` | 觸發文字 | 面板左上角的來源標籤 |
| `data-popover-modal` | 無 | 空值或 `dialog` 為 Modal，`start`、`end`、`top`、`bottom` 為 Offcanvas，`false` 停用 |
| `data-popover-modal-size` | 無 | Modal 可填 `sm`、`lg`、`xl` 或任意寬度，Offcanvas 為寬度或高度 |
| `data-popover-modal-static` | `false` | 設為 `true` 時點背景或按 Esc 不會關閉 |
| `data-popover-url` | 無 | 在內容底部加上連結按鈕，外部網址會以新分頁開啟 |
| `data-popover-url-text` | 外部網址為網域名稱，站內連結為「前往」 | 連結按鈕的文字 |
| `data-popover-url-align` | `end` | `start`、`center`、`end`、`full` |
| `data-popover-fx` | 依主題 | `off` 關閉動畫，`electric` 強制開啟電流，見[金色電流主題](#金色電流主題) |
| `data-popover-show-btn` | 無 | 舊版連結按鈕的文字，搭配 `data-popover-btn-href`，新專案請用 `data-popover-url` |

呈現方式的優先順序是 Modal 或 Offcanvas，其次是固定面板，最後才是浮動提示。按 Esc 或點選提示框以外的地方會關閉浮動提示。

### 內容與輪播

內容中直接放多個 `<section>`，就會自動變成輪播。

```html
<span data-popover-title="三步驟" data-popover-target="#tpl-steps">看步驟</span>

<template id="tpl-steps">
  <section>第一步：先直接回答。</section>
  <section>第二步：補一個理由。</section>
  <section>第三步：用例子收尾。</section>
</template>
```

只有一個 `<section>` 或沒有 `<section>` 時，內容原樣顯示。

### 內建主題

| 主題名稱 | 邊框色 | 備註 |
|---|---|---|
| `dark`、`lavender`、`accent` | `#C3A5E5` | 預設主題 |
| `sky` | `#82C8E5` | |
| `ocean` | `#1CCAE8` | |
| `warning`、`wrong` | `#E6374B` | |
| `success`、`safe`、`correct` | `#27AE60` | |
| `special`、`highlight` | `#B3DE73` | |
| `note`、`yellow` | `#E3D322` | |
| `salmon` | `#E5C3B3` | |
| `pink` | `#FF91D7` | |
| `orange` | `#EDA109` | |
| `vanilla` | `#DBEDD8` | |
| `teal` | `#0DA591` | |
| `focus` | `#D4FFFC` | |
| `indigo` | `#7849C9` | |
| `info` | `#4171BF` | |
| `gold` | `#C9973F` | 內建電流動畫 |

### 全域設定

```js
PopoverConfig.set({
  theme: 'dark',          // 預設主題
  maxWidth: '560px',
  offset: 8,
  fontSize: '1rem',
  borderStyle: 'solid',
  placement: 'top',
  carousel: { animation: 'slide', interval: 3000 },
  panelTarget: null,      // 填選擇器後，所有提示都改顯示在該面板
  modal: false,           // true 或 'dialog' 或 'end' 等，所有提示都改用 Modal 或 Offcanvas
  modalSize: '',
  modalStatic: false,
  fx: true                // false 時所有電流動畫停用
});
```

### 自訂主題

```js
PopoverConfig.addTheme('brand', {
  bg: '#0e0a18',          // 背景色
  titleColor: '#C3A5E5',  // 標題文字與輪播按鈕色
  borderColor: '#7849C9'  // 邊框、箭頭與分隔線色
});
```

要有電流動畫，再加上 `fx`、`fxCore`、`fxDim`，見[自訂電流主題](#自訂電流主題)。

### annotate：依文字自動加註

```js
BpPopnote.annotate([
  {
    text: 'ubiquitous',        // 必填，要加註的文字
    within: '#article',        // 限定範圍的選擇器或元素，預設整個 body
    occurrence: 1,             // 第幾次出現，預設 1
    context: { before: '', after: '' },  // 同一段落中，目標前後必須出現的文字
    theme: 'gold', color: 'gold',
    title: 'ubiquitous', content: 'adj. 無所不在的'
  }
]);

BpPopnote.clearAnnotations('#article');  // 清除指定範圍內的加註，不傳參數則清除全部
```

規則除了 `text`、`within`、`occurrence`、`context` 之外，其餘欄位會對應到同名的 `data-popover-*` 屬性：`title`、`content`、`target`、`theme`、`placement`、`panel`、`label`、`maxwidth`、`fontsize`、`carouselAnim`、`modal`、`arrow`、`hint`（只有 `false` 有效）、`hintStyle`、`color`、`interval`、`offset`、`showBtn`、`btnHref`、`url`、`urlText`、`urlAlign`、`fx`。

## 金色電流主題

`gold` 主題有四層效果，全部以實色繪製：

1. **電流環**：一段亮光沿著邊框繞行，亮點是淺青色 `#D4FFFC`，拖尾由金色漸變到暗金色。
2. **電光線**：標題下方有一道光點由左向右流動，Modal 與 Offcanvas 的標題列同樣有。
3. **閃電**：標題旁的閃電圖示會不規則閃爍。
4. **光暈**：邊框外的金色光暈忽強忽弱。

Popover、輪播、固定面板、Modal、Offcanvas 五種呈現都支援。

### 使用

```html
<span data-popover-theme="gold" data-popover-color="gold"
      data-popover-title="金色電流" data-popover-content="內容">文字</span>
```

`data-popover-color="gold"` 讓觸發文字的底線也是金色。底線顏色需要另外指定，這是 Popnote 原本的行為。

### 三個層級的開關

| 層級 | 寫法 | 效果 |
|---|---|---|
| 單一觸發器 | `data-popover-fx="off"` | 只保留金色，不要電流 |
| 單一觸發器 | `data-popover-fx="electric"` | 讓任何主題都有電流 |
| 整個頁面 | `PopoverConfig.set({ fx: false })` | 所有主題都不再有動畫 |
| annotate 規則 | `{ fx: 'off' }` | 該條規則不要電流 |

全域開關在「下一次開啟」時才生效，已經開著的提示框不會變。

### 自訂電流主題

```js
PopoverConfig.addTheme('emerald-volt', {
  bg: '#06140E',
  titleColor: '#B3DE73',
  borderColor: '#27AE60',
  fx: 'electric',      // 動畫種類，目前只有 electric
  fxCore: '#D4FFFC',   // 電流亮點色，不填時為 #D4FFFC
  fxDim: '#0E4A29'     // 電流環暗部色，不填時由 borderColor 混黑計算
});
```

建議 `fxDim` 比 `borderColor` 暗很多，亮暗對比越大，繞行的電流越明顯。`fxCore` 建議選亮色。所有顏色請使用不透明色碼。

### 瀏覽器支援

- 電流環的平滑旋轉使用 CSS `@property`，需要 Chrome 與 Edge 85、Safari 16.4、Firefox 128 以上。較舊的瀏覽器不會平滑旋轉，其餘效果照常。
- 沒有填 `fxDim` 時會用 `color-mix()` 計算，需要 Chrome 111、Safari 16.2、Firefox 113 以上。
- 動畫只在提示框開啟期間執行，不會在背景持續耗用資源。

## Notice 公告列

```html
<bp-notice type="announcement" color="gold" dismissible notice-id="oct-sale">內容</bp-notice>
```

### 屬性

| 屬性 | 預設值 | 說明 |
|---|---|---|
| `type` | `announcement` | `announcement`、`promo`、`sticky` |
| `position` | `bottom` | 只對 `sticky` 有效，`top` 或 `bottom` |
| `color` | 無 | 色彩名稱、`gold` 或任意 CSS 色碼 |
| `icon` | 依 type | Bootstrap Icons 類別，例如 `bi-stars` |
| `dismissible` | 無 | 加上這個屬性才會有關閉按鈕 |
| `notice-id` | 無 | 有值時，關閉後會記錄在 localStorage，下次不再顯示 |
| `auto-dismiss` | `0` | 幾秒後自動關閉，`0` 表示不自動關閉 |
| `cta-text` | 無 | 有值時才會出現行動按鈕 |
| `cta-href` | `#` | 按鈕連結 |
| `cta-target` | `_self` | 設為 `_blank` 時會自動加上 `rel="noopener"` |
| `no-anim` | 無 | 加上後不播放進出場動畫 |
| `data-content` | 無 | 內容的 HTML，沒填時使用標籤內的內容 |

預設圖示：`announcement` 為 `bi-megaphone-fill`，`promo` 為 `bi-tag-fill`，`sticky` 為 `bi-info-circle-fill`。

`color` 可以填的名稱有 `lavender`、`sky`、`ocean`、`safe`、`special`、`yellow`、`salmon`、`pink`、`orange`、`vanilla`、`teal`、`focus`、`indigo`、`info`、`wrong`、`warning`（等同 `yellow`）以及 `gold`。`gold` 有深金底色與緩慢掃過的閃光。

### 事件

兩個事件都從 `<bp-notice>` 元素冒泡，可以直接在 `document` 上監聽。

```js
document.addEventListener('bp:notice-cta', e => console.log(e.detail));    // { noticeId, href }
document.addEventListener('bp:notice-close', e => console.log(e.detail));  // { noticeId }
```

### JavaScript API

```js
BpNotice.init();                         // 初始化頁面上尚未初始化的公告列
BpNotice.close('my-notice');             // 參數是元素，或元素的 id 屬性（不是 notice-id）
BpNotice.show('my-notice');              // 同時清除「已關閉」的記錄
BpNotice.setContent('my-notice', '<b>新內容</b>');
BpNotice.getInstance('my-notice');
BpNotice.palette;                        // 配色表
BpNotice.colorMap;                       // color 屬性可用的名稱對照
```

### 樣式設定

公告列的底色、文字色與邊框色讀取 CSS 變數 `--area`、`--shell`、`--card-border`，沒有定義時使用內建預設值。也可以直接改設定後重新注入樣式：

```js
BpNotice.config.theme.accent = '#82C8E5';
BpNotice.config.stickyOffset = '56px';   // 黏頂或黏底公告與視窗邊緣的距離
BpNotice._reCSS();
```

## 活用範例

### 1. 單字註解，重點字用金色

```html
<p>Smartphones have become
  <span data-popover-theme="gold" data-popover-color="gold"
        data-popover-title="ubiquitous"
        data-popover-content="adj. 無所不在的<br>常見搭配：become ubiquitous">ubiquitous</span>
  in daily life.</p>
```

一般單字用 `sky`，需要特別強調的用 `gold`，讀者一眼就能分出層次。

### 2. 文法規則輪播

```html
<span data-popover-theme="info" data-popover-color="info"
      data-popover-title="現在完成式" data-popover-target="#tpl-pp"
      data-popover-interval="0">現在完成式</span>

<template id="tpl-pp">
  <section><b>結構</b><br>have / has + 過去分詞</section>
  <section><b>用法一</b><br>到現在為止的經驗：I have been to Kyoto twice.</section>
  <section><b>用法二</b><br>剛完成且仍有影響：She has just left.</section>
</template>
```

`data-popover-interval="0"` 關閉自動播放，讀者用上下箭頭或圓點自己翻頁。

### 3. 練習題的解析，點開顯示在題目下方

```html
<p>1. She ___ here since 2020.
  <span data-popover-theme="success" data-popover-color="safe"
        data-popover-title="解析" data-popover-label="第 1 題"
        data-popover-panel="#ans-1"
        data-popover-content="答案是 has lived。since 搭配現在完成式。">看解析</span>
</p>
<div id="ans-1"></div>
```

固定面板不會遮住題目，再點一次觸發文字即可收起。

### 4. 長內容放進 Modal，並附上連結按鈕

```html
<span data-popover-theme="gold" data-popover-color="gold"
      data-popover-title="課程大綱" data-popover-modal data-popover-modal-size="lg"
      data-popover-target="#syllabus"
      data-popover-url="https://example.com/course" data-popover-url-text="前往課程頁">查看大綱</span>
```

### 5. 全站改用側邊 Offcanvas

```js
PopoverConfig.set({ modal: 'end', modalSize: '420px' });
```

設定一次，頁面上所有提示都從右側滑出。個別觸發器想例外時，加上 `data-popover-modal="false"` 就會回到浮動提示。

### 6. 圖示按鈕與表格欄位說明

```html
<th>配分
  <i class="bi bi-question-circle" data-popover-hint="false"
     data-popover-title="配分" data-popover-content="每題 2 分，共 20 題。"></i>
</th>
```

`data-popover-hint="false"` 會移除觸發器的底線，適合圖示。

### 7. 用 annotate 替既有文章批次加註

```js
BpPopnote.annotate([
  { text: 'ubiquitous', within: '#article', theme: 'gold', color: 'gold',
    title: 'ubiquitous', content: 'adj. 無所不在的' },
  { text: 'smartphones', within: '#article', theme: 'sky', color: 'sky',
    title: 'smartphone', content: 'n. 智慧型手機' }
]);
```

文章由後台編輯器輸出，不需要逐字改 HTML。

### 8. 同一個字出現多次，指定第幾個

```js
BpPopnote.annotate({
  text: 'impact', within: '#article', occurrence: 2,
  theme: 'gold', color: 'gold',
  title: 'impact（名詞）', content: '這裡指影響。'
});
```

### 9. 用 context 區分語境

```js
BpPopnote.annotate({
  text: 'light', within: '#article',
  context: { before: 'turn on the', after: '' },
  title: 'light', content: '這裡是名詞，指燈。'
});
```

`context.before` 與 `context.after` 是在同一個段落（或區塊元素）內，目標文字前後必須出現的字串，用來避開同樣的字出現在別處。

### 10. 切換單元時重新加註

```js
function loadUnit(id) {
  BpPopnote.clearAnnotations('#article');
  document.querySelector('#article').innerHTML = unitHtml[id];
  BpPopnote.annotate(rules[id]);
}
```

### 11. 以主題色分類不同種類的提示

| 種類 | 主題 | 用途 |
|---|---|---|
| 詞彙 | `sky` | 單字與搭配詞 |
| 文法 | `info` | 句型與規則 |
| 常見錯誤 | `warning` | 容易寫錯的地方 |
| 加分重點 | `gold` | 想特別強調的內容，帶電流 |

讀者看到顏色就知道這是哪一類提示。

### 12. 註冊品牌專屬的電流主題

```js
PopoverConfig.addTheme('member', {
  bg: '#0e0a18', titleColor: '#C3A5E5', borderColor: '#7849C9',
  fx: 'electric', fxCore: '#FF91D7', fxDim: '#2A1850'
});
```

```html
<span data-popover-theme="member" data-popover-color="#7849C9"
      data-popover-title="會員專屬" data-popover-content="登入後即可使用。">會員功能</span>
```

### 13. 只在重要的地方用電流，其餘保持安靜

```html
<span data-popover-theme="gold" data-popover-fx="off" ...>一般金色提示</span>
<span data-popover-theme="gold" ...>重要金色提示（有電流）</span>
```

同一個金色主題，用 `data-popover-fx="off"` 區分輕重。頁面上電流太多會互相搶焦點。

### 14. 公告：置頂、促銷、黏底

```html
<!-- 置頂公告，關閉後不再出現 -->
<bp-notice type="announcement" color="sky" dismissible notice-id="maintenance"
           icon="bi-tools">本週六凌晨 2 點到 4 點系統維護。</bp-notice>

<!-- 促銷列，附行動按鈕 -->
<bp-notice type="promo" color="gold" icon="bi-stars"
           cta-text="立即查看" cta-href="/sale" cta-target="_blank" dismissible>
  <b>限時優惠</b>　全站課程八折。
</bp-notice>

<!-- 黏在視窗底部，十秒後自動消失 -->
<bp-notice type="sticky" position="bottom" color="safe" auto-dismiss="10"
           icon="bi-check-circle-fill">設定已儲存。</bp-notice>
```

### 15. 追蹤公告的點擊與關閉

```js
document.addEventListener('bp:notice-cta', e => {
  gtag('event', 'notice_cta', { notice_id: e.detail.noticeId, href: e.detail.href });
});
document.addEventListener('bp:notice-close', e => {
  gtag('event', 'notice_close', { notice_id: e.detail.noticeId });
});
```

### 16. 倒數計時，動態更新公告內容

```js
const end = new Date('2026-11-01T00:00:00+08:00');
setInterval(() => {
  const h = Math.max(0, Math.floor((end - Date.now()) / 3600000));
  BpNotice.setContent('countdown', '<b>優惠倒數</b>　還剩 ' + h + ' 小時。');
}, 60000);
```

```html
<bp-notice id="countdown" type="promo" color="gold">載入中</bp-notice>
```

### 17. PHP 動態輸出

```php
<?php
$h = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
// $word['note_html'] 是後台編輯器輸出，寫入資料庫前已用白名單過濾
?>
<?php foreach ($words as $word): ?>
  <span data-popover-theme="<?= $word['is_key'] ? 'gold' : 'sky' ?>"
        data-popover-color="<?= $word['is_key'] ? 'gold' : 'sky' ?>"
        data-popover-title="<?= $h($word['text']) ?>"
        data-popover-content="<?= $h($word['note_html']) ?>"><?= $h($word['text']) ?></span>
<?php endforeach; ?>
```

屬性值一定要用 `htmlspecialchars` 處理，否則內容中的雙引號會截斷屬性。內容本身會被當成 HTML 顯示，請見[安全性提醒](#安全性提醒)。

### 18. 動態插入的公告列

```js
const el = document.createElement('bp-notice');
el.setAttribute('type', 'sticky');
el.setAttribute('color', 'gold');
el.setAttribute('dismissible', '');
el.innerHTML = '新版本已發布，請重新整理頁面。';
document.body.appendChild(el);
BpNotice.init();   // 初始化新加入的公告列
```

## 安全性提醒

`data-popover-title`、`data-popover-content`、`data-popover-target` 的內容，以及 `<bp-notice>` 的內容，都會以 HTML 的方式插入頁面。

- 內容若包含使用者輸入或外部資料，必須先在伺服器端或輸入端過濾 HTML，避免 XSS。
- 只想顯示純文字時，請先把 `<`、`>`、`&`、`"` 轉成實體字元。
- 連結按鈕的網址同樣來自屬性，請不要放入未經檢查的 `javascript:` 網址。

## 常見問題

**底線顏色沒有跟著主題變？**
觸發文字的底線顏色是另外的屬性，請加上 `data-popover-color`。沒有指定時，底線在第一次開啟提示框之前是預設的淡紫色。

**Modal 或 Offcanvas 點了沒反應？**
需要載入 Bootstrap 的 JavaScript（`bootstrap.bundle.min.js`），且在點擊之前已經載入完成。

**動態新增的觸發器可以用嗎？**
可以，點擊使用事件委派，不需要重新初始化。但 `data-popover-color` 的底線顏色只在載入時套用一次，動態新增的觸發器底線可能維持預設色，需要時請直接用 style 設定 `--xpop-hint-color`。`<bp-notice>` 則需要呼叫 `BpNotice.init()`。

**金色電流沒有出現？**
依序檢查：是否設定了 `PopoverConfig.set({ fx: false })`、觸發器是否有 `data-popover-fx="off"`、主題名稱是否拼成 `gold`、瀏覽器是否支援 `@property`。

**公告關閉後想再顯示？**
呼叫 `BpNotice.show('元素 id')`，字串參數是 `<bp-notice>` 的 `id` 屬性，會同時清除 localStorage 的記錄。

**可以同時開多個浮動提示框嗎？**
不行，同一時間只會有一個浮動提示框，開啟另一個會自動關閉前一個。

## 專案檔案

| 檔案 | 說明 |
|---|---|
| `bp-popnote.js` | 元件本體，包含 Popnote 與 Notice |
| `bp-popnote-demo-10-28-26.html` | 金色電流示範頁，與 `bp-popnote.js` 放在同一個資料夾即可開啟 |
| `README.md` | 本文件 |

## 授權

MIT License。公開到 GitHub 時，請在專案根目錄放一份 `LICENSE` 檔案，內容如下。

```text
MIT License

Copyright (c) 2026 Nelson

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

版權人名稱與年份請改成你自己的。
