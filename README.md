# 語意標籤 UI 元件集（根目錄）

一組以語意標籤撰寫的瀏覽器元件，專為深色底的教學頁面設計。每個元件都是單一 `.js` 檔，載入後自動注入 CSS，不使用 Shadow DOM。這份文件涵蓋根目錄的所有 `.js`；子資料夾的元件請看各資料夾內的 README。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `arrow-flow.js` | `<arrow-flow>` `<flow-step>` `<flow-branch>` `<branch-option>` | 以箭頭逐步揭示的橫向流程，支援分支與合流。 |
| `bp-stepper.js` | `<bp-stepper>` `<bp-step>` | 步驟流程圖，支援水平、垂直、換行版型與推進模式。 |
| `chunk-demo.js` | `<chunk-demo>` `<cd-chunk>` `<cd-level>` | 意群替換示範，同一句子在不同程度的寫法間切換。 |
| `dual-line.js` | `<dual-hr>` `<dual-vr>` | 雙色分隔線，支援虛線、點線與箭頭。 |
| `numeric-list.js` | `<ui-list>` `<list-item>` `<list-item-ad>` | 大數字編號清單、網格排列與浮動按鈕列。 |
| `phrase-chip.js` | `<phrase-chip>` `<phrase-upgrade>` | 可收藏的片語標籤與片語升級動畫。 |
| `practice-tracker.js` | `<practice-tracker>` `<pt-done-btn>` | 學習進度面板、片語收藏與定時彈出視窗。 |
| `slider-show.js` | `<slider-show>` | 分段投影片，內建補充說明、防劇透遮罩與填空小測驗。 |
| `ui-fillin.js` | `<ui-fillin>` `<main-box>` `<ans-box>` | 選擇題與輸入題的挖空練習。 |
| `ui-inputs.js` | `<ui-otp>` `<ui-blank>` | 驗證碼輸入與產生、單行填充題。 |
| `ui-plus.js` | `<read-pulse>` `<chalk-mark>` `<col-pair>` `<ui-btn>` | 閱讀輔助標記與展開按鈕。 |

## 色票

所有元件（含子資料夾）共用 18 個色名，頁面底色為 `#0C0D0C`。11-06-26 起不再支援舊色名（`lavender`、`sky`、`ocean` 等）與數字色彩標籤（`<c1>`～`<c21>`）。

| 色名 | 色碼 | 用途 |
| --- | --- | --- |
| `shell` | `#C6C7BD` | 主要文字 |
| `vanilla` | `#DBEDD8` | 強調文字 |
| `yellow` | `#E3D322` | 黃 |
| `pink` | `#FF91D7` | 粉紅 |
| `red` | `#EF6661` | 紅，答錯 |
| `energetic` | `#B6FF00` | 螢光綠，活力強調 |
| `green` | `#71CD76` | 綠，答對 |
| `blue` | `#5DBAE8` | 藍 |
| `indigo` | `#778CE1` | 靛 |
| `violet` | `#B484E8` | 紫 |
| `gray` | `#86877F` | 灰 |
| `key` | `#51DBCF` | 深底上的亮色重點文字 |
| `bg-alternative` | `#3B2A20` | 配白字的深色重點底 |
| `calm` | `#A3C4BC` | 平靜，放鬆的提示 |
| `quiet` | `#8EA4DE` | 安靜，備註與次要資訊 |
| `playful` | `#FFA987` | 輕鬆，遊戲與活動 |
| `urgent` | `#FF2E63` | 緊急，截止與限時 |
| `dreamy` | `#DE8EC9` | 夢幻，柔和的裝飾重點 |

`bg-alternative` 底色很深，當底色時請配白字；其餘 17 色當底色時配深色字。

## 色名標籤

任何一個元件載入後，整頁都能用 `<c-色名>文字</c-色名>` 設定文字色，元件內外都有效，可以和 `<b>`、`<u>` 互相包覆。色名就是上表的 17 個名稱。

```html
I've <c-key>managed to stick to</c-key> a routine, <c-playful>rain or shine</c-playful>.
```

- 樣式只注入一次（`<style id="ui-color-tags">`），同時載入多個元件也不會重複。
- `ui-table` 的 `inverse` 格子裡，色名標籤會變成品牌色底的小標籤。
- 色名與色碼可從 `window.UiColorTags.colors` 讀取。
- 範例頁：`color-tags-demo-11-05-26.html`。

## 工具頁

| 檔案 | 用途 |
| --- | --- |
| [`builder/layout-builder-11-05-26.html`](builder/layout-builder-11-05-26.html) | `ui-table` 與 `info-region` 的視覺化編輯器：點格子或區塊調整屬性，即時預覽，複製程式碼，也能匯入既有程式碼繼續編輯。 |
| [`layout/ui-cards-templates-11-05-26.html`](layout/ui-cards-templates-11-05-26.html) | `ui-cards` 十種資料呈現版型，每個版型附可複製的程式碼。 |

## 目錄

- [色票](#色票)
- [色名標籤](#色名標籤)
- [工具頁](#工具頁)
- [arrow-flow.js](#arrow-flowjs)
- [bp-stepper.js](#bp-stepperjs)
- [chunk-demo.js](#chunk-demojs)
- [dual-line.js](#dual-linejs)
- [numeric-list.js](#numeric-listjs)
- [phrase-chip.js](#phrase-chipjs)
- [practice-tracker.js](#practice-trackerjs)
- [slider-show.js](#slider-showjs)
- [ui-fillin.js](#ui-fillinjs)
- [ui-inputs.js](#ui-inputsjs)
- [ui-plus.js](#ui-plusjs)

---

## arrow-flow.js

`<arrow-flow>` 把一連串步驟排成橫向流程，步驟之間以箭頭相連。一開始只顯示第一步，點擊箭頭才揭示下一步；流程中可以放入分支，讓使用者選擇方案後再走各自的步驟，分支走完會合流回主流程。

### 標籤

| 標籤 | 位置 | 用途 |
| --- | --- | --- |
| `<arrow-flow>` | 外層 | 流程容器，所有版型與外觀屬性都設在這裡。 |
| `<flow-step>` | `<arrow-flow>` 或 `<branch-option>` 內 | 一個步驟方塊，內容可寫任意 HTML。 |
| `<flow-branch>` | `<arrow-flow>` 內 | 分支段落，內含兩個以上的 `<branch-option>`。 |
| `<branch-option>` | `<flow-branch>` 內 | 一條分支路線，內含該路線的 `<flow-step>`。 |

### `<arrow-flow>` 屬性：流程行為

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `theme` | 品牌色名稱或色碼 | `shell` | 整體主色，同時作為標題列、邊框與箭頭的顏色。 |
| `reveal` | `cumulative`、`single` | `cumulative` | `cumulative` 保留已看過的步驟；`single` 前進時淡出前面的步驟，只留目前這一步。 |
| `animation` | `fade`、`slide`、`none` | `fade` | 步驟出現時的動畫。 |
| `current` | 整數 | `0` | 一開始顯示到第幾步（從 0 起算）。 |
| `equal-height` | 布林 | 關閉 | 讓所有已顯示的步驟方塊等高。 |
| `step-width` | 長度，純數字視為 px | 自動 | 統一的步驟欄寬。 |
| `gap` | 長度，純數字視為 px | `72px` | 步驟之間的距離，也就是箭頭的長度。 |
| `on-complete` | 元素 id | 無 | 流程走完後才顯示的元素，載入時會先隱藏。 |

### `<arrow-flow>` 屬性：外觀

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `header-color` | 品牌色名稱或色碼 | 跟隨 `theme` | 所有步驟標題列的底色。 |
| `border-color` | 品牌色名稱或色碼 | 跟隨 `theme` | 所有步驟的邊框色。 |
| `arrow-color` | 品牌色名稱或色碼 | 跟隨 `theme` | 箭頭顏色。 |
| `arrow-tip` | `sm`、`md`、`lg`、`xl` | `md` | 箭頭尖端大小。 |
| `arrow-style` | `solid`、`dashed` | `solid` | 箭頭線條為實線或虛線。 |
| `arrow-glow` | 布林 | 關閉 | 箭頭加上發光陰影。 |
| `box-shadow` | CSS `box-shadow` 值 | `none` | 步驟方塊的陰影。 |
| `border-width` | 長度 | `2.5px` | 步驟方塊的邊框粗細。 |
| `border-radius` | 長度 | `5px` | 步驟方塊的圓角。 |
| `header-gradient` | `down`、`up`、`none` | `none` | 標題列漸層方向。 |
| `header-accent-line` | `left`、`top`、`none` | `none` | 標題列的強調線位置。 |
| `header-font-size` | 長度 | `1.125rem` | 標題字級。 |
| `header-letter-spacing` | 長度 | `0` | 標題字距。 |
| `content-font-size` | 長度 | `1.125rem` | 內文字級。 |
| `content-line-height` | 數字 | `1.5` | 內文行高。 |
| `branch-label-theme` | 品牌色名稱或色碼 | `green` | 分支選項按鈕的顏色。 |
| `branch-dim` | `0.78` 到 `1` | `0.80` | 沒被選中的分支變淡後的不透明度。 |

### `<flow-step>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `title` | 文字 | 標題列文字。 |
| `header-color` | 品牌色名稱或色碼 | 只覆寫這一步的標題列底色。 |
| `border-color` | 品牌色名稱或色碼 | 只覆寫這一步的邊框色。 |
| `width` | 長度，純數字視為 px | 只覆寫這一步的欄寬。 |

### `<branch-option>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `label` | 文字 | 分支選擇按鈕上的文字。 |
| `theme` | 品牌色名稱或色碼 | 這條分支的主色。 |

### 屬性解說

- **前進方式**：箭頭就是按鈕。點擊目前亮起的箭頭，下一步才會出現；箭頭在三種狀態間切換：尚未解鎖、可點擊、已通過。
- **分支**：走到 `<flow-branch>` 時會出現各 `<branch-option>` 的按鈕。選了其中一條，該路線的步驟依序展開，其餘路線依 `branch-dim` 變淡。分支走完後，`<flow-branch>` 後面的主流程步驟就是合流點。
- **色彩層級**：`theme` 是總開關；`header-color`、`border-color`、`arrow-color` 寫在 `<arrow-flow>` 上會套用全部步驟，寫在 `<flow-step>` 上只影響該步驟。
- **`on-complete`**：適合放結論或下一步提示。流程走到最後一步時，該元素會以淡入動畫顯示。

### 範例

**基本流程**

```html
<arrow-flow theme="blue" gap="72px">
  <flow-step title="讀題">先圈出題目的關鍵字。</flow-step>
  <flow-step title="定位">回到文章找出對應段落。</flow-step>
  <flow-step title="作答">比對同義改寫後作答。</flow-step>
</arrow-flow>
```

**逐步取代、滑入動畫與完成後顯示結論**

```html
<arrow-flow theme="energetic" reveal="single" animation="slide" gap="64px" on-complete="done-1">
  <flow-step title="Step 1">第一步內容</flow-step>
  <flow-step title="Step 2" header-color="violet" border-color="indigo">第二步內容</flow-step>
  <flow-step title="Step 3">第三步內容</flow-step>
</arrow-flow>
<div id="done-1">流程完成，接著做練習題。</div>
```

**分支與合流**

```html
<arrow-flow theme="green" arrow-tip="lg" branch-label-theme="energetic" branch-dim="0.85">
  <flow-step title="確認題型">判斷是圖表題還是流程題。</flow-step>
  <flow-branch>
    <branch-option label="圖表題" theme="blue">
      <flow-step title="找趨勢">先看最高點與最低點。</flow-step>
      <flow-step title="找比較">挑兩組資料互相比較。</flow-step>
    </branch-option>
    <branch-option label="流程題" theme="energetic">
      <flow-step title="找階段">依順序列出每個階段。</flow-step>
    </branch-option>
  </flow-branch>
  <flow-step title="寫總結">兩種題型都以概述收尾。</flow-step>
</arrow-flow>
```

**卡片外觀**

```html
<arrow-flow theme="indigo" arrow-style="dashed" arrow-glow
            box-shadow="0 4px 24px rgba(0,0,0,.85)"
            border-radius="8px" header-gradient="down" header-accent-line="left"
            content-font-size="1rem" equal-height>
  <flow-step title="A">短內容</flow-step>
  <flow-step title="B" width="260">較長的內容會讓其他方塊一起等高。</flow-step>
</arrow-flow>
```

### 事件

事件都會冒泡。

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `step-change` | `{ index, path, branchId }` | 每次揭示新步驟。 |
| `branch-select` | `{ branchId, label }` | 選擇分支時。 |
| `flow-complete` | `{ totalSteps, path }` | 流程走到最後一步。 |

### JavaScript API

`ArrowFlow.config()` 設定全頁預設值，鍵名用駝峰式，元素上的屬性仍然優先。

```js
ArrowFlow.config({ theme: 'blue', arrowTip: 'lg', gap: '80px', headerGradient: 'down', arrowGlow: true });
```

---

## bp-stepper.js

步驟流程圖。每個 `<bp-step>` 是一張卡片，卡片之間自動畫上連接線與箭頭，並依狀態（一般、進行中、完成、錯誤）切換配色。支援水平、垂直與兩列換行版型，也能做成「按一下才推進下一步」的互動流程。標籤一進入 DOM 就會自動初始化。

### 標籤

| 標籤 | 用途 |
| --- | --- |
| `<bp-stepper>` | 根元素，所有設定都寫在這裡。 |
| `<bp-step>` | 單一步驟卡片。 |
| `<bp-step-title>` | 步驟標題。 |
| `<bp-step-content>` | 步驟內文，可放任意 HTML。 |
| `<span class="bp-step-icon">` | 選用的步驟圖示（emoji 或文字），顯示在標題上方。 |

編號圓圈由元件自動插入，不需手寫。

### `<bp-stepper>` 屬性：版型與行為

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `data-theme` | 主題名稱 | 無 | 一次套用整組配色，見「屬性解說」。 |
| `data-layout` | `vertical` | 水平 | 改為垂直排列。沒設 `data-card-width` 時卡片會填滿容器寬度。 |
| `data-wrap` | 數字 N | 無 | 水平模式下，前 N 張排第一列，其餘排第二列，中間以 U 形連接線串接。只分兩列。 |
| `data-fill` | 布林 | 關閉 | 水平模式下卡片自動伸展，填滿整個寬度。 |
| `data-connector` | `solid`、`dashed`、`dotted` | `solid` | 連接線樣式，也可寫成 `data-connector-style`。 |
| `data-connector-label` | 文字 | 無 | 所有連接線上方的說明文字。 |
| `data-clickable` | `true` | 關閉 | 點擊（或按 Enter、空白鍵）任一卡片即設為進行中。 |
| `data-auto-number` | `false` | 開啟 | 關閉自動編號圓圈。 |
| `data-compact-header` | 布林 | 關閉 | 編號圓圈、圖示、標題排成單行，下方加一道淡出的細線。 |
| `data-ui-title` | HTML | 無 | 嵌在元件內的總標題。 |
| `data-ui-title-fs` | 長度 | `1.1rem` | 總標題字級。 |
| `data-ui-title-pb` | 長度 | `3px` | 總標題的下內距。 |
| `data-show-ending` | 元素 id | 無 | 初始化時隱藏該元素，按下最後一步的推進按鈕後以動畫顯示。 |
| `mode` 或 `data-mode` | `progress`、`progress-show` | 無 | 推進模式，見「屬性解說」。 |

### `<bp-stepper>` 屬性：推進按鈕

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `data-progress-icon` | `›` | 一般步驟的按鈕圖示（HTML）。 |
| `data-progress-text` | 空 | 一般步驟的按鈕文字。 |
| `data-progress-icon-class` | 空 | 圖示類別，例如 `bi bi-arrow-right`，優先於 `data-progress-icon`。 |
| `data-progress-done-icon` | 沿用一般圖示 | 最後一步的按鈕圖示。 |
| `data-progress-done-text` | 沿用一般文字 | 最後一步的按鈕文字。 |
| `data-progress-done-icon-class` | 沿用一般類別 | 最後一步的圖示類別。 |
| `data-progress-hide-last` | 關閉 | 最後一步不放按鈕。 |

### `<bp-stepper>` 屬性：外觀

顏色類屬性可直接填品牌色名稱，例如 `data-color-active="blue"`。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `data-color` | `violet` | 一般狀態的邊框、連接線與編號圓圈色。 |
| `data-color-active` | `blue` | 進行中狀態的顏色。 |
| `data-color-done` | `green` | 完成狀態的顏色。 |
| `data-color-error` | `warning` | 錯誤狀態的顏色。 |
| `data-text-color` | `shell` | 內文顏色。 |
| `data-title-color` | `violet` | 標題顏色。 |
| `data-badge-bg` | `rgba(180,132,232,0.15)` | 編號圓圈底色。 |
| `data-card-bg` | `rgba(12,13,12,0.55)` | 一般卡片底色。 |
| `data-card-bg-active` | 自動推算 | 進行中卡片底色。 |
| `data-card-bg-done` | 自動推算 | 完成卡片底色。 |
| `data-card-bg-error` | 自動推算 | 錯誤卡片底色。 |
| `data-stroke` | `2px` | 邊框與連接線粗細。 |
| `data-radius` | `12px` | 卡片圓角。 |
| `data-card-width` | `220px` | 卡片寬度。 |
| `data-card-padding` | `8px` | 卡片內距。 |
| `data-gap` | `36px` | 卡片間距，也是連接線長度。 |
| `data-arrow-min-len` | `0px` | 連接線最短長度，實際間距取 `gap` 與此值的較大者。 |
| `data-arrow-size` | `6px` | 箭頭大小。 |
| `data-badge-size` | `28px` | 編號圓圈直徑。 |
| `data-font-size` | `0.9rem` | 內文字級。 |
| `data-title-size` | `1rem` | 標題字級。 |
| `data-badge-font-size` | `0.82rem` | 編號圓圈字級。 |
| `data-pad-top`、`data-pad-bottom`、`data-pad-x` | `8px` | 元件外圍內距。 |
| `data-connector-label-color` | `shell` | 連接線說明文字顏色。 |
| `data-prog-btn-size` | `28px` | 推進按鈕與自訂按鈕的高度。 |
| `data-ui-title-gap` | `8px` | 總標題與步驟之間的距離。 |
| `data-header-pad-y` | `2px` | 精簡標題列的上下內距。 |
| `data-header-gap` | `6px` | 精簡標題列內元素的水平間距。 |
| `data-content-opacity` | `0.9` | 內文不透明度。 |
| `data-content-opacity-done` | `0.65` | 完成狀態的內文不透明度。 |

### `<bp-step>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `data-state` | `active`、`done`、`error` | 初始狀態。`done` 的編號圓圈顯示 ✓，`error` 顯示 !。 |
| `data-connector-label` | 文字 | 這張卡片後方連接線的說明，覆寫 `<bp-stepper>` 層級的設定。 |
| `data-connector-label-color` | 顏色 | 這段說明的文字顏色。 |
| `data-compact-header` | `false` | 個別關閉精簡標題列。 |
| `data-no-btn` | 布林 | 推進模式下，這一步不放推進按鈕。 |
| `data-progress-icon`、`data-progress-text`、`data-progress-icon-class` | 同 `<bp-stepper>` | 只覆寫這一步的推進按鈕。 |
| `btn-js` | JavaScript 運算式 | 在卡片左下角放一顆自訂按鈕，點擊時執行此運算式。 |
| `btn-js-label` | 文字 | 自訂按鈕文字，預設「執行」。 |
| `btn-js-icon` | HTML | 自訂按鈕圖示。 |
| `btn-js-icon-class` | 類別名稱 | 圖示類別，例如 `bi bi-play-fill`，優先於 `btn-js-icon`。 |

### 屬性解說

- **主題**：`data-theme` 一次設定一般色、進行中色、完成色、標題色與編號圓圈底色。可用名稱有 `violet`、`blue`、`indigo`、`green`、`yellow`、`energetic`、`dreamy`、`pink`、`shell`、`vanilla`、`red`、`gray`、`key`、`calm`、`quiet`、`playful`、`urgent`。套用主題後，個別的 `data-color-*` 仍可再覆寫。
- **卡片底色自動推算**：只覆寫 `data-color-active`、`data-color-done` 或 `data-color-error`，而沒有指定對應的 `data-card-bg-*` 時，元件會依該色推算淡色卡片底色，讓顏色保持一致。
- **推進模式**：`mode="progress"` 會在每張卡片右下角放推進按鈕，按下即把下一步設為進行中；按下最後一步則全部標記完成並觸發 `bps:complete`。`mode="progress-show"` 行為相同，但尚未輪到的步驟完全隱藏，按下按鈕才以動畫逐張出現。推進模式不會自動設定起點，請在第一個 `<bp-step>` 加上 `data-state="active"`。
- **推進按鈕形狀**：只有圖示時是正圓形，只有文字或圖文並列時是膠囊形，圖示與文字都為空時不放按鈕。
- **`btn-js` 可用變數**：運算式中可直接使用 `step`（目前的 `<bp-step>`）、`stepper`（所屬的 `<bp-stepper>`）與 `BPStepper`（全域 API）。
- **`progress-show` 的連接線**：隱藏尚未出現步驟的連接線需要 CSS `:has()`。

### 範例

**基本流程與總標題**

```html
<bp-stepper data-theme="blue" data-ui-title="<strong>Task 2 寫作流程</strong>">
  <bp-step data-state="done">
    <span class="bp-step-icon">🔍</span>
    <bp-step-title>審題</bp-step-title>
    <bp-step-content>找出題目要求的立場與範圍。</bp-step-content>
  </bp-step>
  <bp-step data-state="active">
    <bp-step-title>列大綱</bp-step-title>
    <bp-step-content>決定兩個主體段的主題句。</bp-step-content>
  </bp-step>
  <bp-step>
    <bp-step-title>寫作與檢查</bp-step-title>
    <bp-step-content>預留五分鐘檢查文法與拼字。</bp-step-content>
  </bp-step>
</bp-stepper>
```

**垂直排列與虛線連接**

```html
<bp-stepper data-theme="energetic" data-layout="vertical" data-connector="dashed" data-card-width="280px">
  <bp-step><bp-step-title>聽題</bp-step-title><bp-step-content>記下關鍵字。</bp-step-content></bp-step>
  <bp-step><bp-step-title>回答</bp-step-title><bp-step-content>先給結論再補理由。</bp-step-content></bp-step>
</bp-stepper>
```

**兩列換行與連接線說明**

```html
<bp-stepper data-theme="green" data-wrap="3" data-connector-label="接著">
  <bp-step><bp-step-title>一</bp-step-title></bp-step>
  <bp-step><bp-step-title>二</bp-step-title></bp-step>
  <bp-step data-connector-label="換行" data-connector-label-color="yellow"><bp-step-title>三</bp-step-title></bp-step>
  <bp-step><bp-step-title>四</bp-step-title></bp-step>
  <bp-step><bp-step-title>五</bp-step-title></bp-step>
</bp-stepper>
```

**逐步出現的推進模式與結尾區塊**

```html
<bp-stepper mode="progress-show"
            data-progress-icon-class="bi bi-arrow-right"
            data-progress-done-icon-class="bi bi-check-lg"
            data-progress-done-text="完成"
            data-show-ending="finish-box">
  <bp-step data-state="active"><bp-step-title>暖身</bp-step-title></bp-step>
  <bp-step><bp-step-title>練習</bp-step-title></bp-step>
  <bp-step><bp-step-title>檢討</bp-step-title></bp-step>
</bp-stepper>

<div id="finish-box">恭喜完成所有步驟！</div>
```

**點擊切換、精簡標題列與自訂按鈕**

```html
<bp-stepper data-theme="violet" data-clickable="true" data-compact-header>
  <bp-step data-state="active"><bp-step-title>草稿</bp-step-title></bp-step>
  <bp-step btn-js="BPStepper.setError(stepper, 1)" btn-js-label="標記錯誤" btn-js-icon-class="bi bi-x-lg">
    <bp-step-title>校對</bp-step-title>
  </bp-step>
  <bp-step data-compact-header="false"><bp-step-title>定稿</bp-step-title></bp-step>
</bp-stepper>
```

### 事件

兩個事件都會冒泡，可在 `document` 上統一監聽。

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `bps:change` | `{ index, prevIndex, el }` | 進行中的步驟改變時。 |
| `bps:complete` | `{ el }` | 所有步驟都標記完成時。 |

### JavaScript API

```js
BPStepper.setActive(el, index);         // 第 index 步（從 0 起算）設為進行中，之前的全部標記完成
BPStepper.setError(el, index);          // 第 index 步標記為錯誤
BPStepper.resetStates(el);              // 清除所有狀態；progress-show 模式會重新隱藏後續步驟
BPStepper.progressShowNext(el, index);  // progress-show 模式下，從第 index 步推進到下一步
BPStepper.init(root);                   // 重新初始化 root（預設 document）內的所有 <bp-stepper>
BPStepper.defaults;                     // 全域預設值，鍵名為駝峰式，例如 cardWidth
BPStepper.THEMES;                       // 主題設定
```

`index` 大於等於步驟數時，等同把全部步驟標記完成。修改 `BPStepper.defaults` 要在載入腳本後、元素初始化前的同一個同步區塊內進行。

---

## chunk-demo.js

`<chunk-demo>` 把一個句子拆成「固定文字」與「可替換的意群」。每個意群是一顆按鈕，點開後可以在不同程度的寫法之間切換（例如 went、hurried、rushed excitedly），用來示範同一句話如何由簡到繁。可以同時顯示整句預覽、中文翻譯與備註，也能先遮住意群讓學生猜。

互動範例：`chunk-demo-demo-11-12-26.html`（合併了先前所有的 chunk-demo 示範檔）。

### 標籤

| 標籤 | 位置 | 用途 |
| --- | --- | --- |
| `<chunk-demo>` | 外層 | 句子容器，所有設定都寫在這裡。 |
| `<cd-chunk>` | `<chunk-demo>` 內 | 一個可替換的意群，對應句子裡的 `{id}`。 |
| `<cd-level>` | `<cd-chunk>` 內 | 意群的一種寫法，內容可放 HTML。 |

`<cd-chunk>` 與 `<cd-level>` 只是資料載體，永遠不會顯示。

### `<chunk-demo>` 屬性：內容

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `sentence` | 文字 | 無 | 句子樣板，用 `{0}`、`{1}` 標出意群的位置。 |
| `chunks` | JSON | 無 | 沒有 `<cd-chunk>` 子元素時，改用 JSON 提供意群資料。 |
| `translation` | 文字 | 無 | 翻譯樣板，同樣用 `{id}` 標出位置，填入各寫法的 `trans`。 |
| `note` | HTML | 無 | 句子下方的備註。 |
| `lock-chunks` | 逗號分隔的 id | 無 | 先鎖住這些意群，不能點開。 |

### `<chunk-demo>` 屬性：顯示與互動

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `mode` | `dropdown`、`dots`、`dots-ext` | `dropdown` | 切換寫法的方式，見「屬性解說」。 |
| `dots-pos` | `bottom`、`top` | `bottom` | `dots-ext` 模式的圓點面板位置。 |
| `show-dots` | `true`、`false` | `true` | 意群按鈕上是否顯示程度圓點。 |
| `show-preview` | `true`、`false` | `false` | 在句子下方顯示目前組合出來的整句。 |
| `show-translation` | `true`、`false` | `false` | 顯示翻譯列，需要 `translation`。 |
| `show-note` | `true`、`false` | `false` | 顯示備註列，需要 `note`。 |
| `mask-mode` | `true`、`false` | `false` | 意群一開始被遮住，點開過才露出文字。 |
| `long-chunk-threshold` | 0 到 1 | `0.52` | 意群按鈕寬度超過句子框寬度的這個比例時，自動獨佔一行。 |

### `<chunk-demo>` 屬性：外觀

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `theme` | 主題名稱 | `green` | 意群按鈕的配色。可用 `shell`、`violet`、`green`、`energetic`、`dreamy`、`blue`、`vanilla`、`yellow`、`indigo`、`pink`、`red`、`gray`、`key`、`calm`、`quiet`、`playful`、`urgent`。 |
| `level-colors` | 逗號分隔的顏色 | 內建八色 | 依序覆寫第 1、2、3 級的圓點顏色。 |
| `border-width` | 長度 | `1.5px` | 意群按鈕的邊框粗細。 |
| `border-style` | CSS 邊框樣式 | `solid` | 意群按鈕的邊框樣式。 |
| `width` | 長度 | 自動 | 元件寬度。 |
| `dropdown-width` | 長度 | 自動 | 下拉選單的最小寬度。 |
| `button-width` | 長度 | 自動 | 意群按鈕的最小寬度。 |
| `preview-indent` | 數字（px） | `0` | 整句預覽列的縮排。 |
| `translation-indent` | 數字（px） | `0` | 翻譯列的縮排。 |
| `note-indent` | 數字（px） | `0` | 備註列的縮排。 |
| `margin`、`margin-top`、`margin-right`、`margin-bottom`、`margin-left` | 長度 | 無 | 元件外距。 |
| `bar-padding` | CSS `padding` 值 | `16px 22px 8px` | 句子框內距。 |
| `bar-line-height` | 數字 | `2.2` | 句子框行高。 |
| `data-config` | JSON | 無 | 一次覆寫多項設定，鍵名同 `ChunkDemoConfig`。 |

### `<cd-chunk>` 屬性

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `id` | 整數 | 依順序 | 對應句子裡的 `{id}`。 |
| `label` | 文字 | 空 | 下拉選單或圓點面板上的標籤，例如「動詞」。 |
| `icon` | 文字或 emoji | 空 | 顯示在標籤前的圖示。 |
| `current-level` | 整數 | `1` | 一開始使用的寫法。 |

### `<cd-level>` 屬性

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `level` | 整數 | 依順序 | 這種寫法的程度編號，決定圓點顏色。 |
| `trans` | 文字 | 空 | 這種寫法的翻譯，填入 `translation` 的 `{id}`。沒填時沿用英文。 |

### 屬性解說

- **三種模式**：`dropdown` 點意群會展開下拉選單；`dots` 點意群會在旁邊彈出一排圓點，點圓點直接換寫法；`dots-ext` 把所有意群的圓點集中到句子上方或下方的面板，點句子中的意群只會提示面板對應的那一列。
- **遮罩**：開啟 `mask-mode` 後意群先顯示為色塊，使用者點開過一次就會露出，適合先讓學生自己想再對答案。
- **鎖定**：`lock-chunks` 鎖住的意群顯示目前寫法，但不能切換；可用 `unlockChunk()` 解鎖，也能搭配 `ui-plus.js` 的 `ui-btn` 的 `unlock-chunk` 屬性。
- **設定優先順序**：元素屬性 > `data-config` > `window.ChunkDemoConfig` > 內建預設。
- **即時更新**：`<chunk-demo>` 的屬性一改變，元件就重新讀取設定與子元素並重新繪製，目前選擇的寫法會保留。

### 範例

**基本用法**

```html
<chunk-demo sentence="She {0} to the market {1}." theme="blue">
  <cd-chunk id="0" label="動詞">
    <cd-level level="1">went</cd-level>
    <cd-level level="2">hurried</cd-level>
    <cd-level level="3">rushed excitedly</cd-level>
  </cd-chunk>
  <cd-chunk id="1" label="時間">
    <cd-level level="1">yesterday</cd-level>
    <cd-level level="2">early in the morning</cd-level>
  </cd-chunk>
</chunk-demo>
```

**整句預覽、翻譯與備註**

```html
<chunk-demo sentence="I {0} my homework {1}."
            translation="我{1}{0}功課。"
            note="程度越高，語氣越正式。"
            show-preview="true" show-translation="true" show-note="true"
            theme="violet" level-colors="#EF6661, #71CD76, #5DBAE8">
  <cd-chunk id="0" label="動詞片語">
    <cd-level level="1" trans="寫">do</cd-level>
    <cd-level level="2" trans="仔細完成">carefully complete</cd-level>
  </cd-chunk>
  <cd-chunk id="1" label="頻率" current-level="2">
    <cd-level level="1" trans="每天">every day</cd-level>
    <cd-level level="2" trans="每天晚上都">every single evening</cd-level>
  </cd-chunk>
</chunk-demo>
```

**圓點面板、遮罩與鎖定**

```html
<chunk-demo id="cd-1" sentence="{0} is a key skill for {1} learners."
            mode="dots-ext" dots-pos="top" mask-mode="true" lock-chunks="1" theme="vanilla">
  <cd-chunk id="0" label="主題">
    <cd-level>Listening</cd-level>
    <cd-level>Active listening with note-taking</cd-level>
  </cd-chunk>
  <cd-chunk id="1" label="學習者">
    <cd-level>adult</cd-level>
    <cd-level>highly motivated adult</cd-level>
  </cd-chunk>
</chunk-demo>
<button onclick="document.getElementById('cd-1').unlockChunk(1)">解鎖第二個意群</button>
```

**以 JSON 提供意群**

```html
<chunk-demo sentence="It was {0}."
            chunks='[{"id":0,"label":"形容詞","levels":[{"level":1,"text":"good"},{"level":2,"text":"remarkably effective"}]}]'>
</chunk-demo>
```

### JavaScript API

```js
const cd = document.querySelector('chunk-demo');
cd.unlockChunk(1);   // 解鎖 id 為 1 的意群
cd.lockChunk(0);     // 鎖定 id 為 0 的意群

// 全頁預設值，要在元素初始化前設定
window.ChunkDemoConfig = { defaultTheme: 'blue', showPreview: true, mode: 'dots' };
```

---

## dual-line.js

雙色分隔線。`<dual-hr>` 是水平線，`<dual-vr>` 是垂直線，兩段顏色可依比例分配，支援實線、虛線、點線與兩端箭頭。屬性改變時會立即重新繪製。

### 標籤

| 標籤 | 用途 |
| --- | --- |
| `<dual-hr>` | 水平雙色線，寬度填滿父元素。 |
| `<dual-vr>` | 垂直雙色線，為行內元素，可放在文字或 `flex` 版面中。 |

### `<dual-hr>` 屬性

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `color-left` | 品牌色名稱、色碼或 `transparent` | `yellow` | 左段顏色。 |
| `color-right` | 品牌色名稱、色碼或 `transparent` | `blue` | 右段顏色。 |
| `ratio` | `左:右` | `5:5` | 兩段長度比例，例如 `3:7`。 |
| `thickness` | 長度 | `1px` | 線條粗細。 |
| `margin` | CSS `margin` 值 | `8px 0` | 外距。 |
| `line-style` | `solid`、`dashed`、`dotted`、`none` | `solid` | 線條樣式。 |
| `dash` | 長度（px） | `8px` | 虛線每段長度；點線時為圓點直徑。 |
| `gap` | 長度（px） | `5px` | 虛線或點線的間隔。 |
| `arrow` | `left`、`right`、`start`、`end`、`both` | 無 | 箭頭位置。`start` 等於 `left`，`end` 等於 `right`。 |
| `arrow-size` | 數字（px） | `8` | 箭頭大小。 |
| `extraclass` | 類別名稱 | 無 | 附加到元素上的類別。 |

### `<dual-vr>` 屬性

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `color-top` | 品牌色名稱、色碼或 `transparent` | `yellow` | 上段顏色，也可寫成 `color-left`。 |
| `color-bottom` | 品牌色名稱、色碼或 `transparent` | `blue` | 下段顏色，也可寫成 `color-right`。 |
| `ratio` | `上:下` | `5:5` | 兩段長度比例。 |
| `thickness` | 長度 | `1px` | 線條粗細。 |
| `height` | 長度 | `80px` | 總高度。 |
| `margin` | CSS `margin` 值 | `0 8px` | 外距。 |
| `line-style` | `solid`、`dashed`、`dotted`、`none` | `solid` | 線條樣式。 |
| `dash` | 長度（px） | `8px` | 虛線每段長度；點線時為圓點直徑。 |
| `gap` | 長度（px） | `5px` | 虛線或點線的間隔。 |
| `arrow` | `top`、`bottom`、`start`、`end`、`both` | 無 | 箭頭位置。`start` 等於 `top`，`end` 等於 `bottom`。 |
| `arrow-size` | 數字（px） | `8` | 箭頭大小。 |
| `extraclass` | 類別名稱 | 無 | 附加到元素上的類別。 |

### 屬性解說

- **比例**：`ratio` 決定兩段的 `flex` 比例，箭頭另外佔固定空間，不會壓縮比例。
- **箭頭顏色**：起點箭頭沿用第一段顏色，終點箭頭沿用第二段顏色。
- **`extraclass` 與外距**：設定 `extraclass` 且沒寫 `margin` 時，元件不寫入行內外距，讓外部 CSS 的類別控制間距。
- **只要一段線**：把其中一段設為 `transparent`，或用 `line-style="none"` 隱藏兩段。

### 範例

**水平線**

```html
<dual-hr></dual-hr>
<dual-hr color-left="pink" color-right="indigo" ratio="2:8" thickness="3px"></dual-hr>
<dual-hr color-left="energetic" color-right="transparent" ratio="3:7" thickness="2px"></dual-hr>
```

**虛線、點線與箭頭**

```html
<dual-hr line-style="dashed" dash="10" gap="6" arrow="right" arrow-size="12"></dual-hr>
<dual-hr line-style="dotted" dash="4" gap="6" arrow="both" color-left="#71CD76" color-right="#5DBAE8"></dual-hr>
```

**垂直線放在文字之間**

```html
<p>
  左欄文字
  <dual-vr height="1.5rem" color-top="yellow" color-bottom="red" thickness="2px"></dual-vr>
  右欄文字
</p>
<dual-vr height="120px" ratio="6:4" arrow="bottom" line-style="dashed"></dual-vr>
```

**交給外部類別控制間距**

```html
<style>.sec-line { margin: 24px 0; }</style>
<dual-hr extraclass="sec-line" color-left="violet" color-right="green"></dual-hr>
```

### JavaScript API

```js
DualLine.addColor('brand', '#71CD76');                   // 新增可用的顏色名稱
DualLine.configureHR({ 'color-left': 'pink', thickness: '2px' });  // 改水平線預設值並重繪
DualLine.configureVR({ height: '60px' });                // 改垂直線預設值並重繪
DualLine.configure({ 'line-style': 'dashed' });         // 兩種線一起改
DualLine.palette;                                        // 目前的色盤
```

---

## numeric-list.js

大數字編號清單。每一列左側是醒目的編號（或圖示），右側是內容，適合做重點條列、步驟說明或目錄。也可以切換成網格排列、插入漸層廣告列，或變成固定在畫面側邊的浮動按鈕列。

### 標籤

| 標籤 | 用途 |
| --- | --- |
| `<ui-list>` | 根元素。 |
| `<list-item>` | 一般列，內容可放任意 HTML。 |
| `<list-item-ad>` | 漸層背景的廣告列，不佔編號，與相鄰列之間不留間距。網格模式下不顯示。 |

### `<ui-list>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `mode` | `icon`、`fab` | `icon` 改用 `list-item` 的 `icon` 取代數字；`fab` 變成浮動按鈕列，見下方「浮動按鈕」。 |
| `theme-color` | 色盤名稱或 CSS 顏色 | 所有列的編號色。未設定時各列依內建色序輪替。 |
| `width` | CSS 長度，或 `寬度/最小寬度` | 清單寬度，例如 `80%/480px`。預設 `100%`。 |
| `cols` | 數字 | 2 以上時改為網格排列。 |
| `last-span` | 布林 | 網格模式下最後一列橫跨整排。 |
| `gap` | CSS 長度 | 列與列的間距。預設 `4px`。 |
| `hover` | 色盤名稱或 CSS 顏色 | 滑過時的邊框色。預設跟隨 `theme-color`。 |
| `active` | 色盤名稱或 CSS 顏色 | 可點擊列被選取時的邊框色與底色。 |
| `hover-fx` | 效果名稱 | 所有列的滑過效果，見下方「滑過效果」。 |
| `fx-color` | 色盤名稱或 CSS 顏色 | 滑過效果的顏色。預設為各列的編號色。 |

### `<list-item>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `number` | 文字 | 自訂編號。預設依序 1、2、3。 |
| `accent` | 色盤名稱或 CSS 顏色 | 這一列的編號色，優先於 `theme-color`。 |
| `icon` | Bootstrap Icons 名稱 | `mode="icon"` 時取代數字。不需加 `bi-` 前綴，例如 `icon="lightbulb"`。 |
| `source` | 元素 id | 與 `target` 搭配，點擊此列時把 `source` 的內容複製到 `target`。`source` 元素會自動隱藏。 |
| `target` | 元素 id | 內容的顯示位置。點擊的列會標記為選取狀態，同清單只會有一列被選取。 |
| `hover-fx` | 效果名稱 | 這一列的滑過效果，優先於 `<ui-list>` 的設定。 |
| `fx-color` | 色盤名稱或 CSS 顏色 | 這一列的效果色。 |

`list-item` 沒有內容但設定了 `source` 與 `target` 時，會顯示「點擊載入內容」佔位文字。

### `<list-item-ad>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `from` | 色盤名稱或 CSS 顏色 | 漸層起始色。預設 `indigo`。 |
| `to` | 色盤名稱或 CSS 顏色 | 漸層結束色。預設 `blue`。 |
| `dir` | CSS 角度 | 漸層方向。預設 `135deg`。 |
| `href` | URL 或 `#錨點` | 整列變成連結，行為與原生 `<a href>` 相同。 |
| `link-target` | `_blank` 等 | 連結開啟位置。外部連結會自動加上 `rel="noopener"`。 |

### 滑過效果

`hover-fx` 可用的值：

| 效果 | 說明 |
| --- | --- |
| `glow` | 外光暈，邊框同步染色。 |
| `lift` | 整列上浮並加投影。 |
| `fill` | 底色由左至右填滿。 |
| `bar` | 底部色條由左展開。 |
| `slide` | 內文右移並染色。 |
| `zoom` | 編號放大並加襯底。 |
| `invert` | 編號區反白。 |
| `frame` | 外框向外擴張。 |
| `none` | 停用所有滑過變化。 |

優先順序為 `list-item` > `ui-list` > 全域設定 `hoverFX`。

### 浮動按鈕

`mode="fab"` 會把清單固定在畫面側邊，每個 `list-item` 變成一顆方形按鈕。

```html
<ui-list mode="fab" position="right" bottom="120px">
  <list-item icon="arrow-up" label="TOP" href="#top"></list-item>
  <list-item icon="journal-text" label="筆記" href="#notes"></list-item>
  <list-item icon="box-arrow-up-right" label="官網" accent="energetic"
             href="https://example.com" link-target="_blank"></list-item>
</ui-list>
```

| 層級 | 屬性 | 說明 |
| --- | --- | --- |
| `<ui-list>` | `position` | `left` 或 `right`。預設 `right`。 |
| `<ui-list>` | `offset` | 與畫面側邊的距離。預設 `16px`。 |
| `<ui-list>` | `bottom` | 與畫面底部的距離。預設 `120px`。 |
| `<ui-list>` | `gap` | 按鈕間距。 |
| `<ui-list>` | `theme-color` | 所有按鈕的顏色。 |
| `<list-item>` | `icon` | Bootstrap Icons 名稱，不加 `bi-` 前綴。 |
| `<list-item>` | `label` | 圖示下方的小字。 |
| `<list-item>` | `href` | `#錨點` 會平滑捲動到該處，`#` 或 `#top` 捲回頂端；其他網址則為一般連結。 |
| `<list-item>` | `link-target` | 外部連結的開啟位置。 |
| `<list-item>` | `accent` | 這顆按鈕的顏色。 |

### 全域設定

用 `NumericList.setup()` 修改預設值。由於清單在載入時就已渲染，設定之後請呼叫 `NumericList.init()` 重新渲染：

```html
<script>
  NumericList.setup({
    themeColor:     'violet',
    hoverFX:        'lift',
    fontSize:       '1rem',
    numberFontSize: '2.5rem'
  });
  NumericList.init();
</script>
```

常用設定鍵：

| 鍵 | 預設值 | 說明 |
| --- | --- | --- |
| `themeColor` | `null` | 全域編號色。未設定時依 `accentColors` 輪替。 |
| `accentColors` | 十色陣列 | 輪替用的編號色。 |
| `hoverFX` | `null` | 全域滑過效果。 |
| `borderColor` | `#6a6b68` | 列的邊框色。 |
| `borderHoverColor` | `#5DBAE8` | 滑過時的邊框色。 |
| `borderActiveColor` | `#B484E8` | 選取時的邊框色。 |
| `backgroundColor` | `#0C0D0C` | 列底色。 |
| `numberBg` | `#0d1b24` | 編號區底色。 |
| `textColor` | `#C6C7BD` | 內文顏色。 |
| `fontSize` | `1.125rem` | 內文字級。 |
| `numberFontSize` | `3rem` | 編號字級。 |
| `iconFontSize` | `2.25rem` | 圖示字級。 |
| `numberMinWidth` | `84px` | 編號區最小寬度。 |
| `gridNumberMinWidth` | `60px` | 網格模式的編號區最小寬度。 |
| `borderRadius` | `6px` | 列的圓角。 |
| `rowGap` | `4px` | 列間距。 |
| `lineHeight` | `1.5` | 內文行高。 |
| `padV` / `padH` | `8px` / `12px` | 內文上下與左右內距。 |
| `fabSize` | `52px` | 浮動按鈕尺寸。 |
| `fabOffset` / `fabBottom` | `16px` / `120px` | 浮動按鈕的預設位置。 |
| `fabIconSize` / `fabLabelSize` | `1.4rem` / `0.6rem` | 浮動按鈕的圖示與小字字級。 |
| `fabBg` / `fabBorderRadius` | `#0d1b24` / `8px` | 浮動按鈕的底色與圓角。 |
| `numberColor` | `#5DBAE8` | 沒有輪替色時的編號色。 |
| `numberDivider` | `#1c2d38` | 編號區與內文之間的分隔線色。 |
| `numberPad` | `12px 16px` | 編號區內距。 |
| `activeBackground` | `#10192a` | 選取列的底色。 |
| `borderWidth` | `1px` | 列與浮動按鈕的邊框粗細。 |
| `lineGap` | `3px` | 內文區塊內元素的間距。 |

修改 `themeColor` 時，若沒有另外指定 `borderHoverColor` 與 `borderActiveColor`，這兩者會一起跟著改變。

### 範例

**基本清單、廣告列與點擊載入內容**

```html
<ui-list theme-color="blue" hover-fx="glow">
  <list-item>先讀題，圈出關鍵字。</list-item>
  <list-item>回答要直接，第一句就給出答案。</list-item>
  <list-item-ad href="#course">想系統練習？看看完整課程 →</list-item-ad>
  <list-item accent="pink" source="tip-3" target="tip-panel">點我看第三個技巧</list-item>
</ui-list>

<div id="tip-3">用具體例子支撐你的觀點。</div>
<div id="tip-panel"></div>
```

**圖示模式與兩欄網格**

```html
<ui-list mode="icon" cols="2" last-span theme-color="energetic" hover-fx="lift" width="80%/480px">
  <list-item icon="lightbulb">先想例子再下筆。</list-item>
  <list-item icon="clock">每段控制在五分鐘內。</list-item>
  <list-item icon="check2-circle" accent="green" hover-fx="zoom">最後一列橫跨整排。</list-item>
</ui-list>
```

**自訂編號與漸層廣告列**

```html
<ui-list theme-color="violet" gap="8px" hover="pink" active="yellow">
  <list-item number="A">第一個重點</list-item>
  <list-item number="B" fx-color="blue" hover-fx="bar">第二個重點</list-item>
  <list-item-ad from="pink" to="indigo" dir="90deg" href="https://example.com" link-target="_blank">外部資源</list-item-ad>
</ui-list>
```

### JavaScript API

```js
NumericList.setup(opts);   // 合併全域設定並重新注入 CSS
NumericList.init();        // 渲染（或重新渲染）頁面上所有 <ui-list>
NumericList.render(el);    // 只渲染指定的 <ui-list>
NumericList.defaults;      // 目前的設定（複本）
NumericList.colors;        // 色盤（複本）
NumericList.effects;       // 可用的 hover-fx 名稱
```

元件會在 `DOMContentLoaded` 自動初始化；若腳本在文件就緒後才載入，則立即執行。原始的 `list-item` 資料會被快取，所以重複呼叫 `init()` 或 `render()` 不會遺失內容。

顏色或 `hover-fx` 填了無效值時，會在主控台輸出警告並列出可用的名稱。

---

## phrase-chip.js

片語標籤與片語升級動畫。`<phrase-chip>` 是一顆可點擊的片語膠囊，點開後浮出例句卡片，可以收藏片語；同一個片語在頁面多處出現時，收藏一次會全部同步。`<phrase-upgrade>` 則把一個說法逐步升級成更道地的說法，每點一下換下一個版本。圖示使用 Bootstrap Icons。

### 標籤

| 標籤 | 位置 | 用途 |
| --- | --- | --- |
| `<phrase-chip>` | 任意位置 | 片語膠囊，必須有 `data-phrase`。 |
| `<phrase-card>` | `<phrase-chip>` 內 | 選用，放例句與翻譯，載入後會移到浮動卡片裡。 |
| `<phrase-example>` | `<phrase-card>` 內 | 例句，可放 HTML。 |
| `<phrase-translation>` | `<phrase-card>` 內 | 例句翻譯。 |
| `<phrase-upgrade>` | 任意位置 | 升級動畫容器。 |
| `<phrase-stage>` | `<phrase-upgrade>` 內 | 一個階段的說法，至少要兩個。 |

### `<phrase-chip>` 屬性

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `data-phrase` | 文字 | 必填 | 片語本身，也是收藏時的識別鍵與卡片標題。 |
| `data-label` | 文字 | 片語本身 | 膠囊上顯示的文字。沒設時取 `<phrase-card>` 以外的文字內容，再沒有才用 `data-phrase`。 |
| `data-theme` | 品牌色名稱 | `blue` | 膠囊顏色。 |
| `data-size` | `sm`、`md`、`lg` | `md` | 膠囊大小。 |
| `data-shape` | `pill`、`rounded`、`underline` | `pill` | 膠囊形狀；`underline` 只留底線。 |
| `data-icon` | Bootstrap Icons 名稱 | 無 | 文字前的圖示，不加 `bi-` 前綴。 |
| `data-card-width` | 長度 | `320px` | 浮動卡片寬度。 |
| `data-card-theme` | 品牌色名稱 | 跟隨 `data-theme` | 浮動卡片的強調色。 |
| `data-position` | `auto`、`top`、`bottom` | `auto` | 卡片出現在膠囊上方或下方；`auto` 依下方空間決定。 |
| `data-hide-translation` | 布林 | 關閉 | 翻譯先收起，改顯示「顯示中文翻譯」切換鈕。 |
| `data-disable-collect` | 布林 | 關閉 | 不顯示收藏按鈕。 |
| `data-collect-label` | 文字 | `✓ 收藏這個片語` | 收藏按鈕文字。 |
| `data-collected-label` | 文字 | `已收藏` | 收藏後的徽章文字。 |
| `data-collected-icon` | Bootstrap Icons 類別 | `bi-check-circle-fill` | 收藏後的圖示，需含 `bi-` 前綴。 |
| `data-close-on-collect` | 布林 | 關閉 | 按下收藏後自動關閉卡片。 |
| `data-event-name` | 事件名稱 | `pt:phrase-collected` | 收藏時在 `document` 上發出的事件名稱。 |

### `<phrase-upgrade>` 屬性

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `data-anim` | `strike-fade`、`crossfade`、`slide-up`、`flip`、`typewriter` | `strike-fade` | 換到下一個說法的動畫。 |
| `data-anim-duration` | 秒或毫秒，例如 `1.2s` | `0.9s` | 動畫長度，`typewriter` 不使用。 |
| `data-typewriter-speed` | 毫秒 | `55` | `typewriter` 每個字元的間隔。 |
| `data-theme` | 品牌色名稱 | `blue` | 強調色。 |
| `data-hide-hint` | 布林 | 關閉 | 隱藏右側的「可點擊」提示圖示。 |
| `data-hint-icon` | Bootstrap Icons 名稱 | `arrow-repeat` | 提示圖示，不加 `bi-` 前綴。 |

### `<phrase-stage>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `text-color` | 品牌色名稱或 CSS 顏色 | 這個階段的文字顏色，沒設時沿用 `data-theme`。 |

### 屬性解說

- **布林屬性**：`data-*` 布林屬性只要存在就視為開啟，寫成 `"false"` 才是關閉。
- **收藏同步**：收藏以 `data-phrase` 為鍵。同一頁有多顆相同片語的膠囊時，任何一顆收藏後全部標示為已收藏。
- **收藏事件**：收藏時在 `document` 上發出事件，`detail` 為 `{ phrase, theme, exampleHTML, translationText }`。`practice-tracker.js` 會監聽預設的 `pt:phrase-collected` 建立收藏清單。
- **升級只能前進**：`<phrase-upgrade>` 每點一下前進一個階段，到最後一個階段就停住，不會循環。
- **全頁預設值**：在載入前設定 `window.PhraseChipConfig`，鍵名同屬性去掉 `data-` 後的駝峰式，例如 `{ theme: 'blue', cardWidth: '360px' }`。

### 範例

**片語膠囊與例句卡片**

```html
<p>
  I need to
  <phrase-chip data-phrase="catch up with" data-theme="blue" data-icon="chat-dots-fill">
    catch up with
    <phrase-card>
      <phrase-example>I need to <b>catch up with</b> my old classmates.</phrase-example>
      <phrase-translation>我需要和老同學敘敘舊。</phrase-translation>
    </phrase-card>
  </phrase-chip>
  my friends.
</p>
```

**外形、大小與翻譯切換**

```html
<phrase-chip data-phrase="recharge my batteries" data-theme="pink" data-shape="rounded" data-size="lg" data-icon="stars"></phrase-chip>
<phrase-chip data-phrase="set aside" data-theme="energetic" data-shape="underline" data-hide-translation="true">
  set aside
  <phrase-card>
    <phrase-example>I <b>set aside</b> an hour every day for reading.</phrase-example>
    <phrase-translation>我每天留一小時閱讀。</phrase-translation>
  </phrase-card>
</phrase-chip>
<phrase-chip data-phrase="pop up out of nowhere" data-theme="green" data-disable-collect="true"></phrase-chip>
```

**片語升級**

```html
<phrase-upgrade data-anim="strike-fade" data-theme="yellow" data-anim-duration="1.2s">
  <phrase-stage text-color="shell">very tired</phrase-stage>
  <phrase-stage text-color="energetic">exhausted</phrase-stage>
  <phrase-stage text-color="green">running on empty</phrase-stage>
</phrase-upgrade>

<phrase-upgrade data-anim="typewriter" data-theme="green" data-typewriter-speed="60">
  <phrase-stage>I think</phrase-stage>
  <phrase-stage>From my perspective</phrase-stage>
</phrase-upgrade>
```

### 事件

| 事件 | 發出位置 | `detail` | 觸發時機 |
| --- | --- | --- | --- |
| `pt:phrase-collected`（可用 `data-event-name` 改名） | `document` | `{ phrase, theme, exampleHTML, translationText }` | 片語第一次被收藏。 |

### JavaScript API

```js
PhraseChip.getCollected();            // 已收藏片語的陣列
PhraseChip.isCollected('set aside');  // 是否已收藏
```

---

## practice-tracker.js

學習進度面板。元件會把頁面上 id 帶有指定前綴的 `<section>` 變成一個個格子，使用者完成一段就點亮一格。另外附帶三個選用功能：自動產生的「標記完成」按鈕、片語收藏區塊（搭配 `phrase-chip.js`），以及閱讀一段時間後彈出的金色彈出視窗。片語收藏清單與 彈出視窗需要 Bootstrap 5 的 JavaScript 套件檔。

### 標籤

| 標籤 | 位置 | 用途 |
| --- | --- | --- |
| `<practice-tracker>` | 任意位置 | 進度面板，設定都寫在這裡。頁面上有多個時只使用第一個；完全沒有時元件會自己建一個附在 `body` 底部。 |
| `<pt-done-btn>` | `<section>` 內 | 選用，指定「標記完成」按鈕的位置，也可單獨覆寫按鈕屬性。 |

### 面板屬性：基本與位置

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `data-prefix` | `ex-` | 要追蹤的 `<section>` 的 id 前綴。 |
| `data-position` | `bottom-right` | 含 `top`、`bottom`、`left`、`right` 的字串，例如 `top-left`。 |
| `data-offset-x` | `24px` | 與左右側的距離。 |
| `data-offset-y` | `24px` | 與上下方的距離。 |
| `data-inline` | 無 | 只要存在，面板就嵌在文件流中，忽略位置與距離。 |
| `data-z-index` | `999` | 面板層級。 |
| `data-panel-width` | `220px` | 面板寬度。 |
| `data-collapsed` | `false` | 一開始就收合，標題列顯示「已完成數 / 總數」。 |
| `data-click-go` | `false` | 格子可點擊，平滑捲動到對應的 `<section>`。 |

### 面板屬性：格子與顏色

顏色只接受 CSS 色碼。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `data-cell-size` | `16px` | 格子邊長，片語格子也沿用。 |
| `data-cell-gap` | `6px` | 格子間距。 |
| `data-cell-radius` | `4px` | 圓角，只對 `square` 有效。 |
| `data-cells-per-row` | `5` | 每列格數。 |
| `data-cell-shape` | `square` | `square`、`circle`、`star`、`diamond`、`hexagon`、`heart`。 |
| `data-color-done` | `#71CD76` | 已完成格子的顏色。 |
| `data-color-pending` | `#2a2b2a` | 未完成格子的顏色。 |
| `data-color-panel` | `#1a1b1a` | 面板背景。 |
| `data-color-text` | `#C6C7BD` | 面板文字顏色。 |
| `data-color-complete` | `#71CD76` | 全部完成提示的文字顏色。 |

### 面板屬性：文字、字級與動畫

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `data-title` | `進度` | 面板標題。 |
| `data-label-done` | `完成` | 計數後綴，顯示成「3 / 8 完成」。 |
| `data-complete-text` | `全部完成` | 全部完成後的文字。 |
| `data-complete-sub` | 空 | 完成提示的副文字。 |
| `data-font-size-panel` | `0.85rem` | 面板基準字級。 |
| `data-font-size-title` | `0.78rem` | 標題字級。 |
| `data-font-size-count` | `0.76rem` | 計數與「查看收藏清單」按鈕字級。 |
| `data-font-size-complete` | `0.80rem` | 完成提示主文字字級。 |
| `data-font-size-complete-sub` | `0.73rem` | 完成提示副文字字級。 |
| `data-animate-cell` | `true` | 格子點亮時是否有縮放動畫。 |
| `data-animate-duration` | `0.3s` | 動畫與顏色轉換時間。 |
| `data-event-name` | `pt:stage-complete` | 從外部通知完成時監聽的事件名稱。 |
| `data-watch-stepper` | `true` | 監聽 `bp-stepper` 的 `bps:complete`，自動標記它所在的 `<section>`。 |

### 「標記完成」按鈕屬性

可寫在 `<pt-done-btn>`、`<section>` 或 `<practice-tracker>` 上，優先順序依序遞減。寫在 `<practice-tracker>` 上只是全頁預設，不會讓 `<section>` 長出按鈕。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `data-btn` | `true` | 寫在 `<section>` 上設為 `false` 跳過該段；寫在面板上設為 `false` 關閉整個功能。 |
| `data-btn-style` | `outline` | `solid`、`outline`、`pill`、`ghost`、`block`、`check`、`split`。 |
| `data-btn-text` | `標記完成` | 未完成時的文字。`check` 樣式只當作滑鼠提示。 |
| `data-btn-done-text` | `✓ 已完成` | 完成後的文字。 |
| `data-btn-size` | `md` | `sm`、`md`、`lg`。 |
| `data-btn-font-size` | 空 | 自訂字級，蓋過 `size`。 |
| `data-btn-padding` | 空 | 自訂內距，蓋過 `size`。 |
| `data-btn-width` | 空 | 自訂寬度；`block` 預設 `100%`。 |
| `data-btn-radius` | 空 | 自訂圓角。 |
| `data-btn-color` | `blue` | 品牌色名稱或色碼。 |
| `data-btn-align` | `start` | `start`、`center`、`end`。 |
| `data-btn-event-name` | `pt:section-done` | 每個 `<section>` 第一次完成時發出的事件名稱；空字串表示不發。 |

### 片語收藏區塊屬性

頁面上有可收藏的 `<phrase-chip>` 時才會出現。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `data-phrase-block` | `true` | 設為 `false` 強制關閉。 |
| `data-phrase-title` | `片語收藏` | 區塊標題。 |
| `data-phrase-label-done` | `已收藏` | 計數後綴。 |
| `data-phrase-color-done` | `#FF91D7` | 已收藏格子的顏色，也是清單的預設主色。 |
| `data-phrase-color-pending` | 沿用 `data-color-pending` | 未收藏格子的顏色。 |
| `data-phrase-color-complete` | `#71CD76` | 全部收藏後提示的顏色。 |
| `data-phrase-cell-shape` | `circle` | 片語格子的形狀。 |
| `data-phrase-complete-text` | `片語獵人認證！` | 全部收藏後的文字。 |
| `data-phrase-complete-sub` | 空 | 副文字。 |
| `data-phrase-event-name` | `pt:phrase-collected` | 監聽的收藏事件，需與 `phrase-chip` 一致。 |
| `data-phrase-list-btn-label` | `查看收藏清單` | 清單按鈕文字，收藏第一個片語後才出現。 |
| `data-phrase-list-title` | 沿用 `data-phrase-title` | 側邊欄標題。 |
| `data-phrase-list-placement` | `end` | 側邊欄位置：`start`、`end`、`top`、`bottom`。 |
| `data-phrase-list-theme` | 沿用 `data-phrase-color-done` | 側邊欄主色，只接受品牌色名稱。 |
| `data-phrase-list-width` | `380px` | 側邊欄寬度，只對 `start`、`end` 有效。 |
| `data-phrase-list-empty-text` | `尚未收藏任何片語` | 沒有收藏時的文字。 |

### 定時彈出視窗屬性

沒設 `data-promo-target` 就不啟動。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `data-promo-target` | 空 | 內容來源區塊 的 id，可寫 `promo-1` 或 `#promo-1`。 |
| `data-promo-minutes` | `5` | 自載入起算的分鐘數，可用小數；`0` 表示不限時間。 |
| `data-promo-min-sections` | `4` | 至少有效瀏覽幾個 `<section>`；`0` 表示只看時間。 |
| `data-promo-title` | 空 | 彈出視窗標題。 |
| `data-promo-button-label` | `我知道了` | 底部按鈕文字。 |
| `data-promo-view-ratio` | `0.4` | section 可見多少比例才算正在瀏覽，範圍 `0.05` 到 `1`。 |
| `data-promo-view-seconds` | `2` | 達到比例後需連續停留的秒數。 |
| `data-promo-idle-seconds` | `1.5` | 條件達成後，等捲動停止多久才彈出。 |
| `data-promo-event-name` | `pt:promo-shown` | 顯示時發出的事件名稱。 |
| `data-promo-closed-event-name` | `pt:promo-closed` | 關閉時發出的事件名稱。 |

### 屬性解說

- **設定來源**：優先順序由低到高為內建預設、`window.PracticeTrackerConfig`（駝峰鍵名，例如 `cellShape`）、`<practice-tracker>` 上的屬性。`PracticeTrackerConfig` 要在載入腳本前定義。
- **布林值**：只有字串 `false` 算關閉，其餘（包含沒有值、`0`）都算開啟。`data-inline` 例外，只看是否存在。
- **標記完成的四種方式**：內建按鈕、呼叫 `PracticeTracker.markDone(id)`、在 `document` 發出 `pt:stage-complete`（`detail: { sectionId }`），或 `bp-stepper` 完成時自動標記。重複標記不會有作用，也不會重複發事件。只有內建按鈕會替 `<section>` 加上 `is-done` 類別。
- **按鈕何時出現**：`<section>` 上有任何 `data-btn` 開頭的屬性，或內含 `<pt-done-btn>`。完成後按鈕固定變綠色並停用。
- **片語總數**：依 `data-phrase` 去重，在初始化當下決定；之後才用程式加入的 `phrase-chip` 不會計入。全部出現處都設了 `data-disable-collect` 的片語也不計入。
- **彈出視窗觸發條件**：時間與有效瀏覽數都達標後，還需分頁可見、捲動已停止、畫面上沒有其他彈出視窗或側邊欄，才會彈出。每次載入只自動彈一次。內容會複製目標區塊 並移除其中所有 id。

### 範例

**最小用法與自動按鈕**

```html
<section id="ex-intro" data-btn-text="標記完成">...</section>
<section id="ex-part1" data-btn-style="pill" data-btn-text="我讀完了" data-btn-color="green" data-btn-size="lg">...</section>
<section id="ex-part2">
  <p>...</p>
  <pt-done-btn data-btn-style="check" data-btn-color="pink" data-btn-width="48px"></pt-done-btn>
  <p>按鈕之後還有其他內容</p>
</section>

<practice-tracker data-prefix="ex-" data-click-go="true" data-cell-shape="star"
                  data-btn-style="solid" data-btn-color="green"></practice-tracker>
```

**嵌在頁面中、每列十格**

```html
<practice-tracker data-prefix="ex-" data-inline data-panel-width="360px"
                  data-cells-per-row="10" data-cell-size="28px"
                  data-title="第一課進度" data-complete-text="本課完成"
                  data-font-size-panel="1.125rem" data-font-size-title="1.125rem"
                  data-font-size-count="1.125rem"></practice-tracker>
```

**搭配片語收藏**

```html
<p>I was <phrase-chip data-phrase="tied up with" data-theme="blue">tied up with</phrase-chip> work.</p>

<practice-tracker data-prefix="ex-" data-phrase-title="本課片語"
                  data-phrase-list-placement="start" data-phrase-list-theme="pink"></practice-tracker>
```

**定時彈出視窗**

```html
<practice-tracker data-prefix="ex-" data-promo-target="promo-1"
                  data-promo-minutes="5" data-promo-min-sections="4"
                  data-promo-title="特別公告"></practice-tracker>

<div id="promo-1" style="display:none">
  <h4>限時公告</h4>
  <p>這裡放任何 HTML。</p>
</div>
```

**用 Bootstrap alert 顯示完成提示**

```js
document.addEventListener('pt:section-done', e => {
  document.getElementById('alerts').insertAdjacentHTML('beforeend',
    '<div class="alert alert-success alert-dismissible fade show">已標記完成：' + e.detail.sectionId +
    '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');
});
```

### 事件

| 事件 | 方向 | `detail` | 說明 |
| --- | --- | --- | --- |
| `bps:complete` | 監聽 | 無 | 來自 `bp-stepper`，標記其所在 `<section>`。 |
| `pt:stage-complete` | 監聽 | `{ sectionId }` | 從外部標記完成，可用 `data-event-name` 改名。 |
| `pt:phrase-collected` | 監聽 | `{ phrase, theme, exampleHTML, translationText }` | 來自 `phrase-chip`，可用 `data-phrase-event-name` 改名。 |
| `pt:section-done` | 發出 | `{ sectionId }` | 每個 `<section>` 第一次完成時。 |
| `pt:promo-shown` | 發出 | `{ targetId, viewedSections, elapsedSeconds }` | 彈出視窗顯示時。 |
| `pt:promo-closed` | 發出 | `{ targetId }` | 彈出視窗關閉後。 |

### JavaScript API

沒有任何符合前綴的 `<section>` 時，`window.PracticeTracker` 不會存在，呼叫前請先檢查。

```js
PracticeTracker.markDone('ex-intro');                 // 標記完成
PracticeTracker.markPhraseCollected('set aside', { theme: 'pink' });  // 手動標記片語已收藏
PracticeTracker.changeShape('heart');                 // 更換章節格子形狀
PracticeTracker.showPromo();                          // 立即顯示 Modal，成功回傳 true
PracticeTracker.promoState;    // { enabled, shown, viewedSections, viewedIds, needSections, elapsedSeconds, needSeconds }
PracticeTracker.total;         // section 總數
PracticeTracker.doneSet;       // 已完成的 section id
PracticeTracker.phraseTotal;   // 片語格子總數
PracticeTracker.phraseDoneSet; // 已收藏的片語
PracticeTracker.phraseCollectedOrder;  // 依收藏順序排列的片語
```

---

## slider-show.js

分段投影片元件。每張投影片可以歸屬到不同的部分（`part`），同一部分內用左右箭頭切換，部分之間用分段按鈕切換，並內建補充說明、防劇透遮罩與填空小測驗。

### 投影片結構

| 標記 | 說明 |
| --- | --- |
| `slide` 屬性 | 任何元素加上 `slide` 即為一張投影片。 |
| `part="N"` | 投影片所屬的部分，預設 `1`。同一部分的投影片依 HTML 順序排列。 |
| `role="start"`、`role="end"` | 標記起始畫面與結束畫面，會套用 `start-style` / `end-style` 的裝飾外框。 |
| `.slide-content` | 選用的內容容器，帶底色與內距。 |
| `.slide-subtitle`、`.slide-main`、`.slide-footer` | 選用的三段式版面：小標題、置中的主內容、頁尾說明。 |

投影片以絕對定位疊放在固定高度的區域內，超出 `height` 的內容會被裁切，請依內容量調整高度。

### 屬性：版型與導覽

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `theme` | `shell` | 主色，影響箭頭、進度列、分段按鈕與遮罩。可加 `-outline` 後綴，效果與不加相同。 |
| `height` | `400px` | 投影片區域高度。 |
| `current-part` | `1` | 用程式改寫此屬性可直接跳到指定部分的第一張。 |
| `loop` | `false` | 設為 `true` 時，在部分內首尾循環。 |
| `show-arrows` | `true` | 設為 `false` 隱藏左右箭頭。 |
| `show-part-indicator` | `true` | 設為 `false` 隱藏右上角的「Part 1 / 2」標示。 |
| `part-transition` | `slide` | 切換部分時的動畫：`slide`、`fade`、`none`。 |
| `progress-style` | `dots` | 進度列樣式：`dots`（圓點）、`stepper`（圓點連線）、`triangle`（三角形）、`numbers`（頁碼）、`none`。 |
| `progress-scope` | `part` | 進度列範圍：`part` 只顯示目前部分；`all` 顯示全部投影片，可直接跨部分跳頁。 |
| `show-dots` | `true` | 舊屬性。設為 `false` 等同 `progress-style="none"`。 |
| `show-page-numbers` | `false` | 舊屬性。設為 `true` 等同 `progress-style="numbers"`。 |
| `arrow-color` / `arrow-bg` | 主色 / 深灰 | 箭頭顏色與底色。 |
| `dot-color` / `active-dot-color` | 淺灰 / 主色 | 進度列一般與目前位置的顏色。 |
| `keyboard-nav` | 關閉 | 開啟 Ctrl+Shift+左右方向鍵換頁。部分最後一張再按右鍵會進入下一部分；輸入框內不攔截。頁面上有多個元件時，只有最後被點擊的那一個回應。 |
| `bg-color` | `background` | `triangle` 樣式的空心三角形中心色，需與頁面背景相同才會無縫。 |

### 屬性：分段按鈕

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `auto-show-part-buttons` | `true` | 依位置自動顯示分段按鈕：部分最後一張出現「下一部分」，最後一部分的最後一張出現「完成」與「重新開始」，部分第一張出現「上一部分」。設為 `false` 隱藏所有分段按鈕。 |
| `next-part-btn-text` | `下一部分 →` | 按鈕文字。 |
| `prev-part-btn-text` | `← 上一部分` | 按鈕文字。 |
| `finish-btn-text` | `完成` | 按鈕文字。 |
| `restart-btn-text` | `重新開始` | 按鈕文字。 |
| `next-part-btn-position` | `center` | 按鈕列的水平對齊，填 CSS `justify-content` 的值，例如 `flex-end`、`space-between`。 |
| `show-finish` / `show-restart` | `true` | 設為 `false` 隱藏「完成」或「重新開始」。 |
| `part-btn-bg` / `part-btn-color` | 主色 / 自動對比色 | 分段按鈕的底色與文字色。 |
| `finish-btn-bg` / `finish-btn-color` | 主色 / 自動對比色 | 「完成」按鈕的顏色。 |
| `restart-btn-bg` / `restart-btn-color` | 主色 / 自動對比色 | 「重新開始」按鈕的顏色。 |
| `part-btn-font-size` | `0.9rem` | 分段按鈕字級。 |
| `part-btn-padding` | `6px 12px` | 分段按鈕內距。 |
| `part-btn-border-radius` | `6px` | 分段按鈕圓角。 |

`auto-show-part-buttons="false"` 時，只能用 `progress-scope="all"` 的進度列或改寫 `current-part` 屬性在部分之間移動。

### 屬性：文字顏色與起訖畫面

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `fontcolor-subtitle` | `violet` | `.slide-subtitle` 文字色。 |
| `fontcolor-main` | `shell` | `.slide-main` 文字色。 |
| `fontcolor-footer` | `blue` | `.slide-footer` 文字色。 |
| `fill-color` | `fill`（`#1A1B1A`） | `.slide-content`、補充說明與填空格的底色。 |
| `start-style` / `end-style` | 有對應 `role` 時為 `accent-frame` | 起始與結束畫面的裝飾：`accent-frame`（單色粗框）、`gradient-border`（漸層框）、`gradient-bg`（漸層底）、`top-bottom-bar`（上下色條）、`corner-tag`（左上角三角標）、`none`。 |
| `start-colors` | `violet,blue` | 起始畫面的兩個裝飾色，以逗號分隔。 |
| `end-colors` | `green,blue` | 結束畫面的兩個裝飾色。 |

### 投影片內的互動內容

**補充說明 `<extra-note>`**

行內標籤，顯示為帶底線的可點擊文字。點擊後把內容放進指定的區塊，附淡入動畫。

| 屬性 | 說明 |
| --- | --- |
| `target` | 顯示內容的元素 id，必填。 |
| `source` | 內容來源，必填。填元素 id 時讀取該元素的 HTML；找不到該 id 時，直接把屬性值當成內容。來源元素不會自動隱藏，請自行加上 `style="display:none"`。 |
| `prefix`、`postfix` | 加在文字前後的內容。`prefix` 中若含 `bi-` 開頭的類別名稱，會轉成 Bootstrap Icons 圖示，例如 `prefix="bi-info-circle "`。 |

`<slider-show>` 上的 `extra-note-prefix`、`extra-note-postfix` 設定所有補充說明的預設前後綴，`extra-note-hover-color`（預設 `green`）設定滑過時的顏色。

**防劇透遮罩**

| 用法 | 說明 |
| --- | --- |
| 任一元素加 `spoiler="提示文字"` | 以遮罩蓋住該元素，點擊後淡出。屬性值為遮罩上的文字，空值時使用 `spoiler-text`。建議加在投影片內的區塊上，例如 `.slide-main`。 |
| `<slider-show spoiler-mode="true">` | 所有投影片都加上遮罩（也可寫 `full`）。 |
| `spoiler-text` | 遮罩預設文字，預設「點擊查看內容」。 |
| `spoiler-color` | 遮罩顏色，預設為主色，文字色自動取對比色。 |

**填空小測驗 `<quiz>`**

用 `{{答案}}` 標記空格，會變成可直接輸入的欄位：

```html
<quiz>The population {{rose}} by 20% {{between}} 2010 and 2020.</quiz>
```

- `<quiz>` 內只能放純文字，HTML 標籤會被移除。
- 預設必須填完目前投影片的所有空格，「下一張」與「下一部分」按鈕才會啟用。設定 `quiz-require-complete="false"` 可取消這個限制。
- 移到下一張時，作答結果（你的答案與正確答案）會顯示在該張頂端，比對不分大小寫。測驗放在部分的最後一張時，結果會顯示在下一部分的第一張；放在整份投影片的最後一張時，按下「完成」後直接顯示在本張頂端。
- `classname` 屬性可為產生的容器加上自訂類別。
- 按「重新開始」會清空所有作答與結果。

### 頁首與分頁標題同步

| 屬性 | 說明 |
| --- | --- |
| `update-header="true"` | 換頁時改寫頁面上 `header h1` 或 `header .title` 的文字。 |
| `header-template` | 頁首文字範本，預設 `Part {part} - Slide {slide}`。 |
| `update-title="true"` | 換頁時改寫瀏覽器分頁標題。 |
| `title-template` | 分頁標題範本，預設 `Slide {slide} of {total}`。 |

範本可用 `{part}`（部分編號）、`{slide}`（部分內的第幾張）、`{total}`（部分內的總張數），每個代號只會替換第一次出現的位置。

### 範例

**基本結構、補充說明、遮罩與填空**

```html
<slider-show theme="violet" height="420px" progress-style="stepper">

  <div slide part="1" role="start">
    <div class="slide-content">
      <div class="slide-subtitle">Part 1</div>
      <div class="slide-main"><p>Describe your hometown.</p></div>
      <div class="slide-footer">按下方箭頭開始</div>
    </div>
  </div>

  <div slide part="1">
    <div class="slide-content">
      <div class="slide-main">
        <p>I grew up in a <extra-note target="note-area" source="tip-1">small coastal town</extra-note>.</p>
        <p><quiz>It is famous {{for}} its seafood.</quiz></p>
      </div>
    </div>
  </div>

  <div slide part="1">
    <div class="slide-content">
      <div class="slide-main"><p>上一張的作答結果會顯示在這張的頂端。</p></div>
    </div>
  </div>

  <div slide part="2" role="end">
    <div class="slide-content">
      <div class="slide-main" spoiler="點擊看參考答案"><p>My hometown is a quiet fishing town in the south.</p></div>
    </div>
  </div>
</slider-show>

<div id="note-area"></div>
<div id="tip-1" style="display:none">用具體形容詞取代 nice，例如 <strong>coastal</strong>。</div>
```

**跨部分進度列與鍵盤換頁**

```html
<slider-show theme="blue" height="360px" progress-style="numbers" progress-scope="all"
             keyboard-nav part-transition="fade" next-part-btn-position="flex-end">
  <div slide part="1"><div class="slide-content"><div class="slide-main">1-1</div></div></div>
  <div slide part="1"><div class="slide-content"><div class="slide-main">1-2</div></div></div>
  <div slide part="2"><div class="slide-content"><div class="slide-main">2-1</div></div></div>
</slider-show>
```

**起訖畫面裝飾、按鈕文字與頁首同步**

```html
<slider-show theme="energetic" start-style="gradient-border" start-colors="pink,indigo"
             end-style="corner-tag" end-colors="green,yellow"
             next-part-btn-text="繼續" finish-btn-text="結束練習" show-restart="false"
             update-title="true" title-template="第 {slide} / {total} 張">
  <div slide part="1" role="start"><div class="slide-content"><div class="slide-main">開始</div></div></div>
  <div slide part="1" role="end"><div class="slide-content"><div class="slide-main">結束</div></div></div>
</slider-show>
```

**全部投影片加遮罩**

```html
<slider-show spoiler-mode="true" spoiler-text="先想一想再點開" spoiler-color="violet">
  <div slide><div class="slide-content"><div class="slide-main">參考答案 A</div></div></div>
  <div slide><div class="slide-content"><div class="slide-main">參考答案 B</div></div></div>
</slider-show>
```

### 事件

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `part-changed` | `{ part, total }` | 切換到另一個部分之後。 |
| `finished` | `{ part, total }` | 按下「完成」時。 |
| `restarted` | `{ part }` | 按下「重新開始」並回到第一張之後。 |

三個事件都會冒泡，可以在元件本身或 `document` 上監聽：

```js
document.addEventListener('finished', (e) => {
  console.log('完成，共', e.detail.total, '個部分');
});
```

### JavaScript API

```js
const s = document.querySelector('slider-show');
s.nextSlide();             // 部分內下一張
s.prevSlide();             // 部分內上一張
s.nextPart();              // 下一部分
s.prevPart();              // 上一部分
s.restart();               // 回到第一部分第一張，並清空測驗
s.jumpToGlobalSlide(5);    // 跳到全部投影片中的第 6 張（從 0 起算）
s.setAttribute('current-part', '2');  // 跳到第二部分
```

除了 `current-part` 之外，載入後再修改任何屬性都會重新建立按鈕與進度列。

---

## ui-fillin.js

挖空練習元件。把一段文字中用大括號標記的位置換成空格，學生可以從下拉選單選答案（選擇題），或直接輸入（輸入題）。文末附答案總表與「提交」「重做」按鈕，提交後逐格標示對錯。

互動範例：`ui-fillin-demo-11-12-26.html`（合併了先前所有的 ui-fillin 示範檔）。

### 標籤

| 標籤 | 用途 |
| --- | --- |
| `<ui-fillin>` | 根元素，所有設定都寫在這裡。 |
| `<main-box>` | 題目顯示區。用 `source` 屬性指定來源區塊的 id，必填。載入時把來源複製進來，再把來源清空並隱藏。 |
| `<ans-box>` | 選用。答案總表與按鈕的位置，未放置時自動建立在題目下方。 |

### 挖空語法

| 模式 | 語法 | 說明 |
| --- | --- | --- |
| 選擇題 | `{*正確答案\|選項二\|選項三}` | 以直線分隔選項，正確答案前加 `*`。至少要有兩個選項，否則該處維持原文。 |
| 複選題 | `{*答案一\|*答案二\|干擾項}` | 標記兩個以上的 `*` 即為複選，選單上方會顯示「可複選」。必須選中全部正確選項、且沒有多選，才算答對。 |
| 輸入題 | `{答案一\|答案二}` | `mode="text"` 時使用。以直線分隔所有可接受的答案，符合任一個即算對。不使用 `*`。 |

- 輸入題的比對區分大小寫，前後空白會被忽略。
- 需要在答案中使用 `|`、`{`、`}` 或開頭的 `*` 時，前面加反斜線跳脫，例如 `{a\|b}`。
- 題號依出現順序自動編排。

### 屬性：題目與行為

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `mode` | `choice`、`text` | 選擇題或輸入題。預設 `choice`。 |
| `option-style` | `alpha`、`digit`、`cjk` | 選單中的選項代號：A/B/C、1/2/3、甲/乙/丙。預設 `alpha`。選項順序不會打亂。 |
| `random` | 布林 | 來源中每個 `<ul>` 或 `<ol>` 的項目隨機排序，題號依新順序編排。 |
| `reshuffle-on-reset` | 布林 | 搭配 `random`，按「重做」時重新洗牌。 |
| `hide-number` | 布林 | 空格上不顯示題號。 |
| `no-number-dot` | 布林 | 題號後不加句點。 |
| `hide-answer-table` | 布林 | 隱藏答案總表，只保留按鈕。 |
| `normalize-width` | 布林 | 輸入題比對前先把全形英數與全形空白轉為半形。 |
| `show-answer-on-wrong` | 布林 | 輸入題提交後，答錯或未作答的空格旁顯示正確答案。 |
| `results-id` | 元素 id | 提交後把每題的結果寫進該元素，見下方「結果輸出」。 |

### 屬性：文字標籤

所有介面文字都可以覆寫，未設定時使用內建中文。

| 屬性 | 預設文字 |
| --- | --- |
| `label-correct` | 正確 |
| `label-incorrect` | 錯誤 |
| `label-unanswered` | 未作答 |
| `label-multi-hint` | 可複選 |
| `label-submit` | 提交答案 |
| `label-reset` | 重做 |
| `label-submitted` | 已批改，請查看每題的對錯。 |
| `label-correct-answer-prefix` | 正確答案： |
| `label-no-source` | 找不到來源區塊時的錯誤訊息。 |
| `label-no-blanks` | 來源中沒有可用空格時的錯誤訊息。 |

### 屬性：外觀

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `font-size` | `1.125rem` | 基礎字級。填純數字時視為 rem。 |
| `line-height` | `1.4` | 行高，只接受純數字，超過 1.5 會被限制為 1.5。 |
| `btn-font-size` | 字級的 0.8 倍 | 按鈕字級，純數字視為 rem。 |
| `btn-radius` | `5px` | 按鈕圓角。 |
| `border-width` | `2px` | 外框粗細。 |
| `radius` | `6px` | 空格與選單的圓角。 |
| `blank-max-width` | `20rem` | 空格最大寬度，純數字視為 rem。 |
| `menu-max-width` | `24rem` | 下拉選單最大寬度。 |
| `menu-max-height` | `60vh` | 下拉選單最大高度，純數字視為 vh。 |
| `root-padding`、`main-padding`、`blank-padding`、`menu-padding`、`option-padding`、`ans-padding`、`btn-padding` | 依部位而定 | 各部位內距，只接受 px 或純數字，最多四個值，例如 `blank-padding="2 6"`。 |
| `line-color` | `198,199,189` | 外框與分隔線顏色，可填 `r,g,b`、品牌色名稱或 `#hex`。 |
| `line-alpha` | `0.78` | 外框與分隔線的不透明度，最低 0.78。 |

### 屬性：顏色

每個部位用 `部位-color` 設定，例如 `accent-color="blue"`。

| 屬性 | 預設 | 作用範圍 |
| --- | --- | --- |
| `bg-color` | `base`（`#0C0D0C`） | 元件底色。 |
| `text-color` | `shell` | 文字色。 |
| `accent-color` | `shell` | 強調色，也是下列多數部位的預設值。 |
| `ok-color` | `green` | 答對的顏色。 |
| `bad-color` | `warning` | 答錯的顏色。 |
| `blank-color` | 跟隨 `accent-color` | 空格外框與文字。 |
| `picked-color` | 跟隨 `blank-color` | 已選答案的空格底色。 |
| `menu-color` | 跟隨 `bg-color` | 下拉選單底色。 |
| `hover-color` | 跟隨 `accent-color` | 選項滑過時的底色。 |
| `head-color` | 跟隨 `accent-color` | 答案總表的表頭文字。 |
| `btn-color` | 跟隨 `accent-color` | 按鈕外框，主要按鈕的底色。 |
| `alert-color` | 跟隨 `accent-color` | 批改完成提示框的顏色。 |

顏色值可以是品牌色名稱（不分大小寫，`bg` 與 `background` 都等於 `base`）、`名稱/不透明度`（例如 `blue/0.9`）、`#hex`、`rgb()`、`rgba()`、`hsl()` 或 CSS 顏色關鍵字。不透明度低於 0.78 的 `rgba()` 會被忽略，`名稱/不透明度` 會被提高到 0.78。無法辨識的值會在主控台警告並改用預設色。可用的品牌色名稱有 `base`、`shell`、`violet`、`blue`、`energetic`、`dreamy`、`green`、`vanilla`、`yellow`、`indigo`、`pink`、`red`、`gray`、`key`、`bg-alternative`、`calm`、`quiet`、`playful`、`urgent`。

### 互動方式

- 選擇題：點空格開啟選單，點選項即填入。單選題選完自動關閉；複選題可連續勾選，點選單外或按 `Esc` 關閉。
- 輸入題：直接在空格內打字，空格寬度依最長的可接受答案估算。
- 提交後所有空格鎖定，按「重做」清空作答並解除鎖定。

### 結果輸出

設定 `results-id` 後，提交時會在該元素內寫入每題一個 `<div class="uf-result">`，並帶有以下屬性，方便另外寫樣式或程式讀取：

| 屬性 | 值 |
| --- | --- |
| `data-no` | 題號 |
| `data-state` | `correct` 或 `incorrect` |
| `data-answered` | `true` 或 `false` |

寫入位置優先使用該元素內帶 `data-uf-results` 屬性的子元素；沒有的話，在元素末端自動加一個容器。元素內的其他內容不受影響，按「重做」時只清除結果。

### 範例

題目內容寫在一個獨立的來源區塊，元件載入時把它複製進 `<main-box>`，再把來源清空並隱藏。

```html
<!-- 選擇題（預設） -->
<ui-fillin option-style="alpha" results-id="score-box">
  <main-box source="q1"></main-box>
</ui-fillin>

<div id="q1">
  <ol>
    <li>The figures {*rose|rise|rised} steadily between 2010 and 2020.</li>
    <li>Choose all contrast words: {*however|*whereas|therefore}.</li>
  </ol>
</div>
<div id="score-box"></div>

<!-- 輸入題 -->
<ui-fillin mode="text" normalize-width show-answer-on-wrong>
  <main-box source="q2"></main-box>
</ui-fillin>

<div id="q2">
  <p>She has lived here {for} ten years, {since|ever since} 2015.</p>
</div>
```

**自訂配色**

```html
<ui-fillin accent-color="blue" ok-color="green" bad-color="pink" line-color="violet" head-color="yellow">
  <main-box source="q3"></main-box>
</ui-fillin>
```

**隨機排序、數字代號與指定答案表位置**

```html
<ui-fillin random reshuffle-on-reset option-style="digit" no-number-dot
           label-submit="交卷" label-reset="再來一次" font-size="1.2" blank-padding="2 8">
  <main-box source="q4"></main-box>
  <p>答案總表：</p>
  <ans-box></ans-box>
</ui-fillin>
```

### 事件

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `fillin-change` | 選擇題 `{ no, selected }`，輸入題 `{ no, value }` | 作答內容改變時。`selected` 為所選選項文字的陣列。 |
| `fillin-submit` | `{ results }` | 提交時。`results` 為 `{ no, correct, answered }` 的陣列。 |
| `fillin-reset` | 無 | 按下重做時。 |

三個事件都會冒泡。

### JavaScript API

```js
const f = document.querySelector('ui-fillin');
f.submit();     // 提交並批改
f.reset();      // 重做
f.closeMenu();  // 關閉開啟中的選單

const UF = customElements.get('ui-fillin');
UF.brand;               // 品牌色票副本
UF.colorParts;          // 可設定顏色的部位
UF.resolveColor('blue/0.9');  // 把顏色值轉成 CSS 色值，無法辨識時回傳 null
```

---

## ui-inputs.js

輸入與驗證類元件。`<ui-otp>` 是驗證碼輸入格，也能切換成「產生模式」隨機產生一組碼讓使用者複製，並可呼叫後端 API 查重；`<ui-blank>` 是附送出按鈕的單行填充題。兩者都提供前端比對與外部驗證兩種方式。圖示使用 Bootstrap Icons，顏色屬性可填品牌色名稱或任何 CSS 顏色。

### 標籤

| 標籤 | 用途 |
| --- | --- |
| `<ui-otp>` | 驗證碼輸入（`mode="input"`）或產生（`mode="generate"`）。 |
| `<ui-blank>` | 單行填充題，內含輸入框與送出按鈕。 |

### `<ui-otp>` 屬性：格式與驗證

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `mode` | `input`、`generate` | `input` | 輸入驗證碼，或產生一組唯讀的碼。 |
| `length` | 整數 | input `6`、generate `16` | 總字元數。 |
| `groups` | 逗號分隔整數 | 一組 | 分組方式，例如 `3,3`。總和需等於 `length`，否則視為一組。 |
| `separator` | 文字 | `-` | 各組之間的分隔符號。 |
| `format` | 版型字串 | 無 | 用 `O` 代表一個字元，其他字元原樣顯示，例如 `OOOO-OOOOO`。設定後忽略 `length` 與 `groups`。 |
| `type` | `numeric`、`alpha`、`alnum`、`any` | `numeric` | 允許的字元，同時決定手機鍵盤類型。 |
| `case` | `upper`、`lower` | 不轉換 | 英文字母自動轉大寫或小寫；`generate` 模式則只產生該大小寫。 |
| `mask` | 布林 | 關閉 | 以圓點遮住輸入內容。 |
| `disabled` | 布林 | 關閉 | 停用。 |
| `expected-value` | 文字 | 無 | 前端比對的正確值，填滿後自動比對，區分大小寫。 |
| `clear-on-invalid` | 布林 | 關閉 | 驗證失敗後自動清空。 |
| `clear-delay` | 毫秒 | `700` | 清空前的延遲。 |
| `show-message` | `true`、`false` | `true` | 是否顯示驗證訊息。 |
| `label-invalid` | 文字 | `驗證碼錯誤，請重新輸入。` | 失敗訊息。 |
| `label-valid` | 文字 | 無 | 成功訊息，沒設時不顯示。 |

### `<ui-otp>` 屬性：產生模式與後端查重

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `auto-generate` | `true`、`false` | `true` | 連到畫面時自動產生一組碼。 |
| `exclude-ambiguous` | `true`、`false` | `true` | 排除容易看錯的 `0`、`O`、`1`、`I`、`l`。 |
| `copy-icon` | Bootstrap Icons 類別 | `bi-clipboard` | 複製按鈕圖示，需含 `bi-` 前綴。 |
| `copy-icon-success` | Bootstrap Icons 類別 | `bi-clipboard-check` | 複製成功後的圖示。 |
| `copy-text` | 文字 | 無 | 複製按鈕上的文字。 |
| `copy-position` | `left`、`right` | `right` | 複製按鈕在格子的哪一側。 |
| `copy-feedback-duration` | 毫秒 | `1500` | 成功圖示停留的時間。 |
| `check-url` | 網址 | 無 | 後端查重端點。`input` 模式填滿後送出查詢；`generate` 模式產生後查詢，重複就重新產生。 |
| `check-method` | `GET`、`POST` | `POST` | 查詢方法。 |
| `check-param` | 文字 | `code` | 送出驗證碼的參數名稱。 |
| `check-field` | 文字 | `exists` | 回傳 JSON 中表示「已存在」的布林欄位。 |
| `check-max-retries` | 整數 | `5` | `generate` 模式遇到重複時最多重骰幾次。 |

### `<ui-otp>` 屬性：外觀

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `cell-size` | `48px` | 每格邊長。 |
| `gap` | `10px` | 格子間距。 |
| `font-size` | `1.25rem` | 字級。 |
| `radius` | `8px` | 格子圓角。 |
| `border-width` | `1px` | 格子邊框粗細。 |
| `border-color` | `rgba(198,199,189,0.78)` | 格子邊框色。 |
| `bg-color` | 透明 | 格子底色。 |
| `text-color` | `#C6C7BD` | 文字色。 |
| `accent-color` | `#5DBAE8` | 強調色，也是焦點框與複製按鈕的預設色。 |
| `focus-ring-width` | `3px` | 焦點框粗細。 |
| `focus-ring-color` | 跟隨 `accent-color` | 焦點框顏色。 |
| `error-color` | `#EF6661` | 驗證失敗顏色。 |
| `valid-color` | `#71CD76` | 驗證成功顏色。 |

### `<ui-blank>` 屬性：輸入與驗證

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `expected-value` | 以 `\|` 分隔的文字 | 無 | 可接受的答案，區分大小寫。沒設時改由外部驗證。 |
| `placeholder` | 文字 | 空 | 輸入框提示文字。 |
| `trim-whitespace` | `true`、`false` | `true` | 比對前去掉前後空白。 |
| `normalize-width` | 布林 | 關閉 | 比對前把全形英數轉為半形。 |
| `disable-enter-submit` | 布林 | 關閉 | 按 Enter 不送出。 |
| `disabled` | 布林 | 關閉 | 停用。 |
| `clear-on-invalid` | 布林 | 關閉 | 答錯後自動清空。 |
| `clear-delay` | 毫秒 | `700` | 清空前的延遲。 |
| `button-icon` | Bootstrap Icons 類別 | 無 | 送出按鈕圖示，需含 `bi-` 前綴。圖示與文字都沒設時顯示「送出」。 |
| `button-text` | 文字 | 無 | 送出按鈕文字。 |
| `button-position` | `icon-right`、`icon-left` | `icon-right` | 圖示在文字的右側或左側。 |

### `<ui-blank>` 屬性：訊息

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `show-message` | `true`、`false` | `true` | 是否顯示訊息。 |
| `label-invalid` | 文字 | `答案不正確，請重新輸入。` | 答錯訊息。 |
| `label-valid` | 文字 | 無 | 答對訊息。 |
| `message-style` | `plain`、`bordered`、`filled`、`accent-bar`、`icon-banner` | `plain` | 內建訊息區的樣式。 |
| `message-target` | 元素 id | 無 | 改把純文字訊息寫進該元素，不套用任何樣式。 |
| `message-icon-valid` | Bootstrap Icons 類別 | `bi-check-circle` | `icon-banner` 的成功圖示。 |
| `message-icon-invalid` | Bootstrap Icons 類別 | `bi-x-circle` | `icon-banner` 的失敗圖示。 |
| `message-font-size` | 長度 | `0.85rem` | 訊息字級。 |
| `message-padding` | CSS `padding` 值 | `8px 12px` | 訊息內距（`plain` 為 `0px`）。 |
| `message-radius` | 長度 | `6px` | 訊息圓角。 |

### `<ui-blank>` 屬性：外觀

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `width` | `220px` | 輸入框寬度。 |
| `font-size` | `0.95rem` | 輸入框字級。 |
| `padding` | `5px 10px` | 輸入框內距。 |
| `radius` | `6px` | 圓角。 |
| `border-width` | `1px` | 邊框粗細。 |
| `border-color` | `rgba(198,199,189,0.78)` | 邊框色。 |
| `bg-color` | 透明 | 輸入框底色。 |
| `text-color` | `#C6C7BD` | 文字色。 |
| `btn-padding` | `5px 12px` | 按鈕內距。 |
| `btn-font-size` | `0.95rem` | 按鈕字級。 |
| `btn-bg` | 跟隨 `accent-color` | 按鈕底色。 |
| `btn-color` | `#0C0D0C` | 按鈕文字色。 |
| `accent-color` | `#5DBAE8` | 強調色。 |
| `focus-ring-width` | `3px` | 焦點框粗細。 |
| `focus-ring-color` | 跟隨 `accent-color` | 焦點框顏色。 |
| `error-color` | `#EF6661` | 答錯顏色。 |
| `valid-color` | `#71CD76` | 答對顏色。 |

### 屬性解說

- **`<ui-otp>` 的驗證順序**：有 `check-url` 時以後端回傳的 `exists` 決定對錯；沒有但有 `expected-value` 時前端比對；兩者都沒有時，由你監聽 `otp-complete` 自行驗證，再呼叫 `setState()`。
- **只有一個真正的輸入框**：`<ui-otp>` 內部用一個透明的 `<input>` 接收輸入，畫面上的格子只負責顯示，所以貼上整串驗證碼、倒退刪除都能正常運作。
- **`<ui-blank>` 多個答案**：`expected-value="台北|臺北"` 表示兩種寫法都算對，各寫法需完整列出。
- **布林屬性的兩種寫法**：`clear-on-invalid`、`mask`、`disabled`、`normalize-width`、`disable-enter-submit` 只看是否存在；`show-message`、`auto-generate`、`exclude-ambiguous`、`trim-whitespace` 預設開啟，寫成 `"false"` 才關閉。

### 範例

**驗證碼輸入與前端比對**

```html
<ui-otp length="6" groups="3,3" expected-value="123456"
        label-valid="驗證成功" clear-on-invalid accent-color="violet"></ui-otp>
```

**英數驗證碼、遮罩與外部驗證**

```html
<ui-otp id="otp-1" length="8" type="alnum" case="upper" mask></ui-otp>
<script>
  document.getElementById('otp-1').addEventListener('otp-complete', async e => {
    const ok = await fetch('verify.php?code=' + e.detail.value).then(r => r.ok);
    e.target.setState(ok ? 'valid' : 'invalid');
  });
</script>
```

**產生一組不重複的序號**

```html
<ui-otp mode="generate" format="OOOO-OOOOO-OOOOOO" type="alnum" case="upper"
        check-url="check_code.php" check-param="serial" copy-text="複製" copy-position="left"></ui-otp>
```

**填充題**

```html
<p>The capital of Taiwan is
  <ui-blank expected-value="Taipei|Taipei City" button-icon="bi-send" width="180px"
            message-style="icon-banner" label-valid="答對了！" normalize-width></ui-blank>
</p>

<ui-blank expected-value="however" button-text="檢查" button-icon="bi-check2" button-position="icon-left"
          message-target="msg-1" clear-on-invalid clear-delay="1200"></ui-blank>
<div id="msg-1"></div>
```

### 事件

事件都會冒泡。

| 事件 | 元件 | `detail` | 觸發時機 |
| --- | --- | --- | --- |
| `otp-input` | `<ui-otp>` | `{ value, complete }` | 每次內容變動。 |
| `otp-complete` | `<ui-otp>` | `{ value, valid }` | 填滿所有格子；外部驗證模式下 `valid` 為 `null`。 |
| `otp-check-start` | `<ui-otp>` | `{ value }` | 開始呼叫 `check-url`。 |
| `otp-check-result` | `<ui-otp>` | `{ value, exists }` | 每次查詢結果。 |
| `otp-generated` | `<ui-otp>` | `{ value, attempts }` | 產生出確定可用的碼。 |
| `otp-check-exhausted` | `<ui-otp>` | `{ value, attempts }` | 超過重試上限仍重複。 |
| `otp-check-error` | `<ui-otp>` | `{ error }` | API 出錯。 |
| `otp-copied` | `<ui-otp>` | `{ value }` | 複製成功。 |
| `blank-submit` | `<ui-blank>` | `{ value, raw, valid }` | 按下送出或 Enter；外部驗證模式下 `valid` 為 `null`。 |

### JavaScript API

```js
const otp = document.querySelector('ui-otp');
otp.value;                 // 讀取或設定目前的值
otp.reset();               // input 模式清空；generate 模式重新產生
otp.generate();            // generate 模式手動重新產生，會重新查重
otp.setState('valid');     // 'valid'、'invalid'、'idle'
otp.focus();

const blank = document.querySelector('ui-blank');
blank.value; blank.reset(); blank.setState('invalid'); blank.focus();
```

---

## ui-plus.js

一個檔案內含兩組互相獨立的元件：閱讀輔助標記（`read-pulse`、`chalk-mark`、`col-pair`），以及展開按鈕 `ui-btn`。兩組共用一份樣式，於 `DOMContentLoaded` 自動初始化；腳本在文件就緒後才載入時立即執行。原始標籤渲染後會被隱藏或取代。

顏色屬性可填色盤名稱，或以 `#`、`rgb` 開頭的 CSS 顏色。

### 標籤

| 標籤 | 位置 | 用途 |
| --- | --- | --- |
| `<read-pulse>` | 區塊 | 段落進度條。 |
| `<chalk-mark>` | 行內 | 粉筆圈字。 |
| `<col-pair>` | 行內 | 搭配詞連動。 |
| `<ui-btn>` | 任意位置 | 展開按鈕。 |

### 閱讀輔助標記

四個標記都用在文章段落裡，幫學生看見句子結構或重點。

#### read-pulse：段落進度條

把一段內容包起來，左側會有一條色條由上往下跑過，提示學生「現在讀這段」。

```html
<read-pulse color="green" style="glow" trigger="visible">
  <p>Over the past decade, the number of students studying abroad has risen sharply.</p>
</read-pulse>
```

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `color` | `green` | 色條顏色。 |
| `color2` | 空 | 第二色。`gradient` 樣式的漸層終點色，或 `double` 樣式第二條色條的顏色。 |
| `style` | `solid` | 色條樣式：`solid`、`gradient`（漸層）、`glow`（光暈）、`segmented`（虛線）、`double`（雙色條）、`fuse`（燃燒引信：條身由暗轉亮，底端有閃爍的火花與火星）。 |
| `speed` | `2800` | 色條跑完全程的毫秒數。 |
| `speed-2` | `speed` 的 1.15 倍 | `double` 樣式第二條色條的毫秒數。 |
| `pulse-width` | `3px` | 色條寬度。 |
| `pulse-width-2` | `2px` | 第二條色條寬度。 |
| `gap` | `14` | 色條與內文的距離（px，填數字）。 |
| `gap-2` | `9` | 兩條色條之間的距離（px，填數字）。 |
| `trigger` | `visible` | 觸發方式：`visible`（捲動到可見時）、`click`、`hover`。 |
| `repeat` | 布林 | 可重複觸發。未設定時只播放一次。 |
| `spark-size` | `8` | `fuse` 樣式的火花直徑（px，填數字），最小 4。 |

`style` 與 HTML 原生的 `style` 屬性同名。原始的 `<read-pulse>` 會被取代，所以不會影響版面，但編輯器可能會把它標示為無效的 CSS。

#### chalk-mark：粉筆圈字

行內標記。點擊後在文字上方畫出一道粉筆弧線並把文字染色，再點一次擦掉。

```html
<p>The government should <chalk-mark theme="yellow">invest</chalk-mark> more in public transport.</p>
```

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `theme` | `focus` | 弧線與文字顏色。 |
| `thickness` | `2.5` | 弧線粗細（px，填數字）。 |
| `duration` | `420` | 畫線動畫的毫秒數。 |
| `active` | 布林 | 載入時就畫好弧線。元素尚未出現在畫面上時，會等到捲動到可見才畫。 |
| `direction` | `ltr` | 畫線方向：`ltr` 由左往右，`rtl` 由右往左。 |
| `arrow` | 無 | 在弧線終點加箭頭，線畫完才出現。只寫屬性為 `8px`；可填尺寸，例如 `12`、`10px`、`0.6rem`、`0.5em`（純數字視為 px）。 |

搭配 `direction="rtl"` 與 `arrow` 可以標示後位修飾：把修飾語（或連同被修飾的名詞）包起來，箭頭從右往左指回前面。

```html
<p>The man <chalk-mark theme="key" direction="rtl" arrow="12">standing by the door</chalk-mark> is my teacher.</p>
```

#### col-pair：搭配詞連動

行內標記。同一 `group` 的字詞會一起亮起，用來標示搭配詞、代名詞與先行詞等前後呼應的關係。每個字詞上方有一個小圓點，滑鼠移入任一個，同組全部變色。

```html
<p>The <col-pair group="c1">government</col-pair> announced that
   <col-pair group="c1">it</col-pair> would
   <col-pair group="c2" theme="pink">raise</col-pair>
   <col-pair group="c2">taxes</col-pair>.</p>
```

| 屬性 | 說明 |
| --- | --- |
| `group` | 群組代號。同代號的字詞連動。 |
| `theme` | 群組顏色，同組只要有一個設定即可。未設定時依內建色序自動分配。 |
| `label` | 滑鼠停留時顯示的說明文字（瀏覽器原生提示）。 |

**全域設定**：在載入腳本之前定義 `window.UiReadingConfig`。

| 鍵 | 預設 | 對應屬性 |
| --- | --- | --- |
| `pulseColor`、`pulseColor2` | `green`、空 | `read-pulse` 的 `color`、`color2` |
| `pulseStyle` | `solid` | `read-pulse` 的 `style` |
| `pulseSpeed` | `2800` | `read-pulse` 的 `speed` |
| `pulseWidth`、`pulseWidth2` | `3px`、`2px` | `read-pulse` 的 `pulse-width`、`pulse-width-2` |
| `pulseGap`、`pulseGap2` | `14`、`9` | `read-pulse` 的 `gap`、`gap-2` |
| `pulseTrigger` | `visible` | `read-pulse` 的 `trigger` |
| `pulseSparkSize` | `8` | `read-pulse` 的 `spark-size` |
| `chalkTheme` | `focus` | `chalk-mark` 的 `theme` |
| `chalkThickness` | `2.5` | `chalk-mark` 的 `thickness` |
| `chalkDuration` | `420` | `chalk-mark` 的 `duration` |
| `chalkDirection` | `ltr` | `chalk-mark` 的 `direction` |
| `chalkArrowSize` | `8px` | `chalk-mark` 的 `arrow` 沒有填值時的尺寸 |

### ui-btn：展開按鈕

把 `<ui-btn>` 放在要控制的內容前面，按鈕就能展開或收合它。也可以只用來跳頁、或跳出一則浮動提示。

```html
<ui-btn icon="bi-lightbulb" icon-active="bi-lightbulb-fill" theme="yellow"
        chevron label-open="收起提示">看提示</ui-btn>
<div style="display:none">先找出題目中的關鍵字，再決定立場。</div>
```

**目標元素的判定順序**

1. 有 `target` 或 `targets` 屬性：控制這些 id 的元素，可以是一個或多個，也可以是 `<template>`。
2. 有 `mini-table-id`：操作該表格的儲存格，見下方「揭曉 mini-table 的儲存格」。
3. 只有 `href`、沒有 `target`：純連結按鈕，不控制任何元素。
4. 都沒有：控制緊接在後面的元素（會略過連續排列的其他 `<ui-btn>`，因此可以並排多顆按鈕）。

**初始狀態**：目標元素一開始就是隱藏（`display:none` 或 `bp-hidden` 這類 class）時，按鈕為收合狀態；全部目標都可見時視為已展開。要讓內容預設隱藏，請在目標加上 `style="display:none"`；按鈕加上 `open` 則會強制以展開狀態開始。`scroll-gate` 模式例外，見下方「進階」。

**外觀**

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| 標籤內文字 | 空 | 按鈕文字。沒有文字時變成圓形圖示按鈕，展開時右下角亮起小圓點。 |
| `icon` | 空 | Bootstrap Icons 類別，需含 `bi-` 前綴，例如 `bi-eye`。 |
| `icon-active` | 空 | 展開時改用的圖示。 |
| `label-open` | 空 | 展開時改用的按鈕文字。 |
| `theme` | `shell` | 按鈕顏色。 |
| `size` | `md` | `sm`、`md`、`lg`，或字級長度，例如 `2rem`、`1.2em`、`24px`；純數字視為 rem。見下方「自訂尺寸」。 |
| `variant` | `fill` | `fill`（實心）、`outline`（框線）、`ghost`（無框）。 |
| `chevron` | 布林 | 在文字後方加上展開箭頭，展開時旋轉。 |
| `tooltip` | 空 | 滑鼠停留時的提示文字。 |
| `disabled` | 布林 | 停用按鈕。 |

**自訂尺寸**：`size` 填長度時代表按鈕字級，其餘尺寸以 `md`（1rem）為基準等比例換算，內距、圓角、間距一律輸出為 px。

```html
<ui-btn size="2rem" icon="bi-lightning-fill" theme="key" alert="已送出">送出</ui-btn>
<ui-btn size="3rem" icon="bi-eye" icon-active="bi-eye-slash" theme="blue" target="tip"></ui-btn>
<ui-btn size="24px" chevron theme="green" target="tip">看提示</ui-btn>
<div id="tip" style="display:none">先找出題目中的關鍵字，再決定立場。</div>
```

| 項目 | md（1 倍） | `size="2rem"`（2 倍） |
| --- | --- | --- |
| 文字字級 | `1rem` | `2rem` |
| 文字按鈕內距 | `8px 16px` | `16px 32px` |
| 文字按鈕圓角 | `24px` | `48px` |
| 圖示與文字間距 | `6px` | `12px` |
| 圓形圖示按鈕直徑 | `40px` | `80px` |
| 圓形圖示按鈕的圖示字級 | `1.15rem` | `2.3rem` |
| 展開箭頭 | `11px` | `22px` |
| 展開小圓點 | `5px` | `10px` |

`em` 以按鈕所在容器的字級為基準。無法辨識的值（例如 `huge`、`2vw`）會改用 `md`，並在主控台警告。

**行為**

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `target` | 空 | 要控制的元素 id；也接受多個 id。 |
| `targets` | 空 | 一次控制多個元素，id 用逗號或空白分隔，`#` 可省略。與 `target` 同時寫時合併。 |
| `stagger` | `0` | 多個目標展開時，每個間隔的毫秒數；收合一律同時進行。 |
| `open` | 布林 | 載入時即為展開狀態。 |
| `animation` | `slide` | 展開動畫：`slide`、`fade`、`none`。 |
| `anim-duration` | `320` | 每個目標動畫的毫秒數，可設超過 600。 |
| `group` | 空 | 同組按鈕互斥，打開一個時其他自動收合（手風琴效果）。 |
| `href` | 空 | 點擊後前往的網址。與 `target` 同時設定時，會先切換目標再跳頁。 |
| `href-target` | `_self` | 開啟位置，`_blank` 為新分頁。按住 Ctrl 或 Cmd 點擊也會開新分頁。 |
| `remove-target` | 空 | 點擊後把這些 id 的元素從網頁移除，重新整理前不會復原；id 用逗號或空白分隔，`#` 可省略。見下方「移除元素」。 |

**浮動提示**

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `alert` | 空 | 點擊時在畫面頂端或底部跳出的訊息。 |
| `alert-theme` | `green` | 提示底色。 |
| `alert-position` | `top` | `top` 或 `bottom`。 |
| `alert-duration` | `3000` | 顯示毫秒數，`0` 表示不會自動消失。 |
| `alert-width` | 自動 | 固定寬度，只接受 `px` 或 `%`，例如 `400px`。 |
| `alert-icon` | 空 | 訊息前的 Bootstrap Icons 類別，需含 `bi-` 前綴。 |

**進階**

| 屬性 | 說明 |
| --- | --- |
| `scroll-gate` | 捲動閘門。目標內容維持顯示但呈半透明、無法點選，頁面也無法捲動超過這顆按鈕，直到按下按鈕解鎖。按鈕會持續脈動提示。 |
| `unlock-chunk` | 展開時呼叫外部 `chunk-demo` 元件的 `unlockChunk()`，收合時呼叫 `lockChunk()`。格式為 `元件id:區塊編號`，多個以逗號分隔，例如 `demo1:2,demo1:3`。需另外載入 `chunk-demo.js`。 |

**多個目標與 template**

```html
<ui-btn targets="hint-a, hint-b tpl-model" stagger="400" animation="fade"
        anim-duration="800" label-open="收起">看提示與範文</ui-btn>
<div id="hint-a" style="display:none">…</div>
<div id="hint-b" class="bp-hidden">…</div>
<template id="tpl-model">…</template>
```

- 目標不必相鄰，依 `targets` 的順序展開；部分已顯示時，按下只補開其餘目標，已顯示的不重播動畫。
- `<template>` 在第一次展開時才渲染到緊接其後的 `<div class="ubtn-tpl-out" data-ubtn-from="模板id">`，之後的開合都作用在這個 div，輸入過的內容會保留。template 的 `class` 與 `style` 會帶到這個 div，內容裡的 ui-plus 元件會自動初始化。
- 多顆按鈕指向同一個 template 時共用同一份輸出。
- 渲染後在 template 上觸發會冒泡的 `ubtn-template-rendered` 事件，`e.detail` 含 `template`、`output`、`button`。

**移除元素**

```html
<div id="tip-intro">作答說明……</div>
<ui-btn icon="bi-x-circle" theme="red" remove-target="tip-intro">我讀完了，關掉說明</ui-btn>
```

- 元素先依 `animation` 與 `anim-duration` 收合，再從網頁刪除；`animation="none"` 時立即刪除。重新整理網頁前不會復原。
- 可以和 `target`、`href`、`alert` 等一起使用，同一次點擊會先開合目標，再移除元素。
- 只寫 `remove-target` 時，按鈕不會去開合緊接在後面的元素，目標全部移除後按鈕自動停用。
- 移除後在 `<ui-btn>` 上觸發會冒泡的 `ubtn-removed` 事件，`e.detail` 含 `ids`（這次移除的 id）與 `button`。
- 範例：`ui-plus-demo-11-11-26.html`。

**揭曉 mini-table 的儲存格**

需另外載入 `mini/mini-table.js`，兩支檔案的載入順序不拘。

```html
<mini-table id="mytbl" head="Clue | Answer | Chunk">
  A place for coffee | ？ | ？
</mini-table>
<ui-btn mini-table-id="mytbl" target-cell="B2" target-cell-content="<b>Cafe</b>">顯示答案</ui-btn>
```

| 屬性 | 說明 |
| --- | --- |
| `mini-table-id` | 要操作的 `<mini-table>` 的 id。也接受 `min-table-id`。 |
| `target-cell` | 儲存格座標，和 Excel 相同：欄用字母、列用數字，**表頭算第 1 列**。可寫多格（逗號或空白分隔）與範圍，例如 `B2 C3`、`C2:C4`；`$B$2` 的 `$` 會略過。 |
| `target-cell-content` | 要顯示的內容，可寫 HTML。多格時用 `\|` 分隔，一格一段；只寫一段就每格都用同一段。內容要放 `\|` 時寫成 `\\|`。 |
| `target-cell-source` | 改從 `<template>` 或元素讀取內容，優先於 `target-cell-content`，多格時同樣用 `\|` 分隔。 |

- 按一下揭曉，內容淡入，格子內框短暫亮起按鈕的 `theme` 顏色；再按一次淡出並恢復原本的內容。
- `stagger`、`anim-duration`、`animation="none"`、`label-open`、`open`、`group` 都適用；與 `targets` 同時使用時，先開元素、再開儲存格，共用同一個 `stagger` 順序。
- 不存在的格子會在主控台警告並略過。

**全域設定**：在載入腳本之前定義 `window.UiBtnConfig`，可用鍵為 `theme`、`size`、`variant`、`animation`、`animDuration`、`chevron`。`size` 同樣可以填長度值，例如 `'1.25rem'`。

### JavaScript API

```js
UiReading.init();   // 處理新插入的 read-pulse、chalk-mark、col-pair
UiBtn.init();       // 處理新插入的 <ui-btn>

// 直接跳出浮動提示（與 ui-btn 的 alert 屬性相同外觀）
const a = UiBtn.alert('已儲存', {
  theme: 'green', position: 'top', duration: 3000, width: '360px', icon: 'bi-check-circle'
});
a.dismiss();        // 手動關閉這一則
UiBtn.alert.clear(); // 清除所有提示

UiReading.config; UiBtn.config;  // 目前生效的設定
UiReading.colors;                // 色盤
```

已處理過的標籤會被標記，重複呼叫 `init()` 不會重複渲染。

頁面載入後才出現的 `read-pulse`、`chalk-mark`、`col-pair`（例如由 `ui-btn`、`ui-cards` 展開的 template，或用程式插入的內容）會自動初始化，不必手動呼叫 `UiReading.init()`。其他元件用 innerHTML 複製已初始化的 `read-pulse` 時（例如 `ui-table` 的儲存格），副本也會自動恢復動畫，與腳本載入順序無關。

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
