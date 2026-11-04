# ui-icon-anim

把多個 [Bootstrap Icons](https://icons.getbootstrap.com/) 組成播放動畫的 Web Component。只要一個語意標籤 `<ui-icon-anim>`，不需要額外的 CSS 檔，也不使用 Shadow DOM。

![version](https://img.shields.io/badge/version-1.2.0-7849C9) ![dependency](https://img.shields.io/badge/requires-Bootstrap%20Icons-82C8E5)

## 特色

- 兩種播放模式：`replace` 原地取代、`sequence` 由左至右排出
- 四種轉場效果：`fade`、`scale`、`flip`、`none`
- 色彩支援內建調色盤名稱與 HEX，可逐一指定，不足時循環使用
- 尺寸支援 `sm` / `md` / `lg` / `xl`、數字（rem）或含單位的值，可逐一指定
- 按鈕模式：點擊前顯示按鈕文字，點擊後才開始播放
- 圖示清單可從其他元素擷取，預設讀取 `#global_icon_list`
- 播放完畢可自動移除或隱藏元件，並顯示指定 id 的區塊
- 播放完畢可跳轉到指定網址
- 提供 `play()`、`pause()`、`reset()`、`goTo()` 方法與完整事件
- 元件離開可視範圍時自動暫停，節省效能

## 快速開始

```html
<!-- 原地取代 -->
<ui-icon-anim icons="bi-sun,bi-cloud-sun,bi-cloud,bi-cloud-rain"
  interval="800" effect="fade" size="lg"
  colors="yellow,orange,shell,sky"></ui-icon-anim>

<!-- 由左至右排出 -->
<ui-icon-anim mode="sequence" icons="bi-star-fill,bi-star-fill,bi-star-fill"
  interval="300" hold="1500" gap="6" colors="yellow"></ui-icon-anim>
```

`icons` 可省略 `bi-` 前綴，例如 `icons="heart,star"`。

## 按鈕模式

設定 `button-text` 或 `button-icon` 就會進入按鈕模式，此時 `autoplay` 會被忽略。

```html
<ui-icon-anim button-text="開始" button-icon="bi-play-fill"
  icons="bi-hourglass-top,bi-hourglass-split,bi-hourglass-bottom,bi-check-circle-fill"
  interval="600" effect="flip" size="lg"
  loop="false" button-restore></ui-icon-anim>
```

加上 `button-keep` 會保留按鈕外框，動畫在按鈕內播放，適合「送出中」這類情境：

```html
<ui-icon-anim button-text="送出表單" button-color="safe" button-keep
  icons="bi-arrow-clockwise,bi-arrow-repeat,bi-check-lg"
  interval="450" size="1.25" colors="safe"
  loop="false" button-restore></ui-icon-anim>
```

## 擷取圖示清單

圖示很多時，可以把清單放在獨立元素中，用逗點、空白或換行分隔。來源元素建議加上 `hidden`。

```html
<div id="global_icon_list" hidden>bi-star, bi-square, bi-circle</div>

<!-- 未設定 icons 與 icons-from，自動讀取 #global_icon_list -->
<ui-icon-anim size="lg" colors="yellow,sky,pink"></ui-icon-anim>
```

指定其他來源：

```html
<div id="weatherIcons" hidden>
  bi-sun
  bi-cloud-sun
  bi-cloud-rain-heavy
</div>
<div id="weatherColors" hidden>yellow, orange, sky</div>

<ui-icon-anim icons-from="weatherIcons" colors-from="#weatherColors"></ui-icon-anim>
```

讀取順序為 `icons` → `icons-from` → `#global_icon_list`。來源元素的內容變動時，元件會自動重新開始。

## 播放完畢移除與顯示區塊

```html
<ui-icon-anim icons="bi-arrow-clockwise,bi-arrow-repeat,bi-cloud-check-fill"
  interval="500" size="xl" colors="ocean,ocean,safe"
  loop="false" remove-on-end remove-delay="500"
  reveal-on-end="result" reveal-effect="slide"></ui-icon-anim>

<div id="result" hidden>資料載入完成。</div>
```

- 目標元素可用 `hidden` 屬性、Bootstrap 的 `d-none` 或 `display:none` 隱藏
- 同時設定 `remove-on-end` 時，元件移除完成後才顯示目標
- 移除被 `before-remove` 的 `preventDefault()` 取消時，目標仍會照常顯示

## 播放結束跳頁

```html
<ui-icon-anim button-text="前往" button-icon="bi-box-arrow-right"
  icons="bi-1-circle-fill,bi-2-circle-fill,bi-3-circle-fill"
  interval="500" loop="false"
  href="next.html" href-delay="300"></ui-icon-anim>
```

- 只在 `loop="false"` 時生效
- 結束流程依序為：`anim-end`、移除或隱藏（`remove-on-end`）、顯示目標（`reveal-on-end`）、跳轉（`href`）
- 跳轉前觸發可取消的 `before-navigate` 事件
- `href-target="_blank"` 是在動畫結束後才開啟新視窗，不屬於使用者直接操作，可能被瀏覽器的彈出視窗封鎖攔下；一般建議使用預設的 `_self`

```js
document.addEventListener('before-navigate', e => {
  if (!confirmed) e.preventDefault();
});
```

## 屬性

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `icons` | 無 | 圖示類別名稱，逗點或空白分隔，可省略 `bi-` |
| `icons-from` | `global_icon_list` | 從指定 id 元素的文字擷取圖示，可帶 `#` |
| `colors-from` | 無 | 從指定 id 元素的文字擷取色彩 |
| `interval` | `1000` | 切換間隔（毫秒），最小 100 |
| `mode` | `replace` | `replace` 原地取代、`sequence` 由左至右排出 |
| `effect` | `fade` | `fade`、`scale`、`flip`、`none` |
| `colors` | 繼承文字色 | 調色盤名稱或 HEX，逗點分隔一一對應。可用名稱：`base`、`shell`、`lavender`、`sky`、`warning`、`salmon`、`ocean`、`safe`、`teal`、`vanilla`、`yellow`、`bluebell`、`special`、`info`、`indigo`、`pink`、`orange` |
| `size` | `md` | `sm`、`md`、`lg`、`xl`、數字（rem）或含單位值 |
| `gap` | `8` | sequence 模式間距（px） |
| `hold` | 同 `interval` | sequence 模式排滿後停留時間（毫秒） |
| `loop` | `true` | 設為 `false` 只播一輪 |
| `autoplay` | `true` | 設為 `false` 需呼叫 `play()` |
| `remove-on-end` | 關閉 | 播完移除或隱藏元件，需 `loop="false"` |
| `remove-delay` | `0` | 播完後等待多久才移除（毫秒） |
| `remove-effect` | `fade` | `fade`、`shrink`、`none` |
| `remove-mode` | `remove` | `remove` 從 DOM 刪除、`hide` 隱藏 |
| `reveal-on-end` | 無 | 播完要顯示的元素 id，逗點分隔，需 `loop="false"` |
| `reveal-effect` | `fade` | `fade`、`slide`、`none` |
| `reveal-delay` | `0` | 顯示前延遲（毫秒） |
| `href` | 無 | 播放結束後跳轉的網址，需 `loop="false"` |
| `href-target` | `_self` | `_self`、`_blank` 或視窗名稱 |
| `href-delay` | `0` | 跳轉前延遲（毫秒） |
| `button-text` | 無 | 按鈕文字，設定後進入按鈕模式 |
| `button-icon` | 無 | 按鈕文字前的圖示 |
| `button-color` | `sky` | 按鈕色彩 |
| `button-keep` | 關閉 | 保留按鈕外框，動畫在按鈕內播放 |
| `button-restore` | 關閉 | 播完回到按鈕狀態，需 `loop="false"` 且未設定 `remove-on-end` |

一輪的結束時間點：最後一個圖示停留一個 `interval`（sequence 模式為 `hold`）之後。

## 方法與屬性

| 名稱 | 說明 |
| --- | --- |
| `play()` | 播放；已結束或已隱藏時從頭重播；按鈕模式下可略過按鈕直接播放 |
| `pause()` | 暫停，保留剩餘時間 |
| `reset()` | 回到起點，維持原本播放狀態；按鈕模式下回到按鈕 |
| `goTo(i)` | 跳至第 i 個圖示（從 0 起算） |
| `index` | 目前圖示索引（唯讀） |
| `playing` | 是否播放中（唯讀） |
| `armed` | 是否停在按鈕狀態（唯讀） |

```js
const el = document.querySelector('ui-icon-anim');
el.pause();
el.goTo(2);
el.setAttribute('mode', 'sequence'); // 屬性變更會自動重新開始
```

## 事件

所有事件都會冒泡，可以在 `document` 統一監聽。

| 事件 | detail | 說明 |
| --- | --- | --- |
| `trigger-click` | 無 | 按鈕被點擊，可 `preventDefault()` 阻止播放 |
| `icon-change` | `index`、`icon`、`mode`、`cycle` | 顯示新圖示 |
| `cycle-end` | `cycle`、`mode` | 完成一輪 |
| `anim-end` | `cycle`、`removeOnEnd`、`revealTargets` | 播放結束（`loop="false"`） |
| `before-remove` | `mode` | 移除前，可 `preventDefault()` 阻止 |
| `removed` | `element` | 刪除後於原父元素觸發 |
| `hidden` | 無 | `remove-mode="hide"` 隱藏後觸發 |
| `revealed` | `ids`、`elements`、`source` | `reveal-on-end` 目標顯示後觸發 |
| `before-navigate` | `href`、`target`、`source` | 跳轉前，可 `preventDefault()` 阻止 |

元件已從 DOM 移除時，`revealed` 與 `before-navigate` 改在 `document` 上觸發，可用 `e.detail.source` 判斷來源元件。

```js
document.addEventListener('before-remove', e => {
  if (e.target.id === 'keepMe') e.preventDefault();
});
```
