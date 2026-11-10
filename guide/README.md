# ui-guide

`<ui-guide>` 是指引框元件：框住頁面上任何有 `id` 的元素，旁邊放號碼方塊與說明卡，並用水平、垂直的自動折線連到另一個元素。顯示與隱藏由你自己放的按鈕控制。元件不使用 Shadow DOM。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-guide.js` | `<ui-guide>`、`<guide-mark>` | 指引框、號碼方塊、說明卡與自動折線。 |

## 目錄

- [快速開始](#快速開始)
- [屬性](#屬性)
- [控制按鈕](#控制按鈕)
- [說明卡按下才顯示 card-reveal](#說明卡按下才顯示-card-reveal)
- [JavaScript API 與事件](#javascript-api-與事件)
- [注意事項](#注意事項)
- [授權](#授權)

## 快速開始

```html
<button class="btn btn-sm btn-outline-light" guide-for="g1">顯示指引</button>

<div id="intro">...</div>
<div id="note">...</div>

<ui-guide id="g1" color="key">
  <guide-mark target="intro" to="note" exit="right" enter="left">
    第一句直接給畫面，<b>a stone's throw from</b> 一次用上
  </guide-mark>
</ui-guide>

<script src="https://cdn.jsdelivr.net/gh/studyadvice/ielts/guide/ui-guide.js"></script>
```

## 屬性

「兩者皆可」表示可以寫在 `<ui-guide>` 當所有框的預設，也可以寫在個別 `<guide-mark>` 覆蓋。

| 屬性 | 寫在哪裡 | 值 | 說明 |
| --- | --- | --- | --- |
| `mode` | `<ui-guide>` | `all`、`step` | `all`：一次全部顯示或隱藏。`step`：一次多一個。 |
| `open` | `<ui-guide>` | 布林 | 載入時就全部顯示。 |
| `stagger` | `<ui-guide>` | 毫秒 | 全部顯示時，每個框之間的間隔。 |
| `draw-speed` | `<ui-guide>` | 毫秒 | 線畫出來的時間，預設 600。`no-animation` 關閉動畫。 |
| `loop` | `<ui-guide>` | 布林 | 逐步模式到最後一個後，再按「下一個」全部收起。 |
| `num` | `<guide-mark>` | 文字或 HTML | 號碼方塊的內容，預設依序 1、2、3。 |
| `target` | `<guide-mark>` | 元素 id | 要框起來的元素。 |
| `to` | `<guide-mark>` | 元素 id | 線要連到的元素；不寫就只有框。 |
| `exit`、`enter` | `<guide-mark>` | `left`、`right`、`top`、`bottom` | 線從框的哪一邊出去、從目標哪一邊進來。不寫時自動判斷。 |
| `lane` | `<guide-mark>` | 整數 | 錯開距離，每加 1 多 14px。不寫時同方向的線自動錯開。 |
| 內容、`source` | `<guide-mark>` | HTML、元素 id | 說明卡內容，寫在標籤裡或從 template 讀取。 |
| `badge`、`badge-color` | `<guide-mark>` | 文字、色名 | 說明卡右上角的角標。 |
| `footer` | `<guide-mark>` | HTML | 說明卡頁尾。 |
| `divider`、`divider-color` | 兩者皆可 | `solid`、`dashed`、`dotted`、`none`；色名 | 頁尾上方分隔線。 |
| `label-pos` | 兩者皆可 | `bottom`、`top`、`left`、`right` | 說明卡放在框的哪一邊，預設 `bottom`。 |
| `num-pos` | 兩者皆可 | `left`、`right`、`badge`、`none` | 號碼方塊位置；`badge` 是框左上角的小圓號碼，適合段落裡的字。 |
| `color` | 兩者皆可 | 色名或色碼 | 框、號碼、線與圓點的顏色，預設 `shell`。 |
| `line-width`、`line-style` | 兩者皆可 | px；`solid`、`dashed` | 框與線的粗細與樣式。 |
| `pad`、`gap`、`tab-width`、`radius`、`dot-size`、`card-width` | 兩者皆可 | px | 框的間距、線離開框的距離、號碼方塊寬度、圓角、圓點半徑、說明卡寬度。 |
| `card-reveal` | 兩者皆可 | `click`、`button`、`step` | 說明卡按下才顯示，見下節。 |
| `card-button-label` | 兩者皆可 | HTML | `button` 模式小按鈕的文字，預設「看解說」。 |

顏色用 18 色色名：`shell`、`vanilla`、`yellow`、`pink`、`red`、`energetic`、`dreamy`、`green`、`blue`、`indigo`、`violet`、`gray`、`key`、`bg-alternative`、`calm`、`quiet`、`playful`、`urgent`。

## 控制按鈕

任何元素加上 `guide-for="ui-guide 的 id"` 就是控制鈕。

| `guide-action` | 動作 |
| --- | --- |
| `toggle` | 全部顯示或隱藏（`all` 模式的預設）。 |
| `show`、`hide` | 全部顯示、全部隱藏。 |
| `next`、`prev` | 逐步模式下一個、上一個（`step` 模式的預設是 `next`）。 |
| `reset` | 全部收起，回到第 0 步。 |
| `cards-show`、`cards-hide`、`cards-toggle` | 打開、收起、切換所有已顯示框的說明卡。 |

`guide-label-open`、`guide-label-closed` 讓按鈕在有框顯示中與全部隱藏時顯示不同文字。

## 說明卡按下才顯示 card-reveal

| 值 | 打開方式 | 提示 | 收起 |
| --- | --- | --- | --- |
| `click` | 點號碼方塊或框右上角的「?」 | 框右上角閃動的「?」 | 說明卡右上角 × |
| `button` | 說明卡的位置先放一顆小按鈕（依 `label-pos`） | 小按鈕本身 | 說明卡右上角 × |
| `step` | 逐步模式按「下一個」：第一次出現框，第二次出現說明卡 | 框右上角閃動的「?」，也可直接點 | 按「上一個」反向收回 |

```html
<ui-guide id="g-st" mode="step" card-reveal="step" num-pos="badge" color="violet">
  <guide-mark target="st-a">形容經驗的語塊：<c-key>an eye-opener</c-key></guide-mark>
  <guide-mark target="st-b" card-reveal="button" color="blue">說明影響</guide-mark>
</ui-guide>
<button guide-for="g-st" guide-action="cards-toggle">全部說明卡</button>
```

框隱藏或 `reset` 時，說明卡一併收回。沒有內容、角標與頁尾的框沒有說明卡，`card-reveal` 不起作用。

## JavaScript API 與事件

```js
const g = document.getElementById('g1');
g.show(); g.hide(); g.toggle(); g.next(); g.prev(); g.reset();
g.cardsShow(); g.cardsHide(); g.cardsToggle();

document.addEventListener('ui-guide:change', e => e.detail);   // { shown, step, total }
document.addEventListener('ui-guide:card', e => e.detail);     // { num, open }
```

## 授權

MIT License
