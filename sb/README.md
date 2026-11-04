# sentence-build

`<sentence-build>` 是語塊組句練習。元件把一組語塊（`<chunk-item>`）打亂放在語塊庫，學生依正確順序點選或拖曳到組句區，再按「確認」檢查。可以混入干擾語塊、固定位置的語塊、倒數計時，也能從題庫隨機或依序出題。元件不使用 Shadow DOM，不需要其他函式庫。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `sentence-build.js` | `<sentence-build>` `<chunk-item>` | 語塊組句練習，支援拖曳、即時批改、計時與題庫。 |

## 目錄

- [標籤](#標籤)
- [屬性：資料與題庫](#屬性資料與題庫)
- [屬性：互動與批改](#屬性互動與批改)
- [屬性：文字與按鈕](#屬性文字與按鈕)
- [屬性：外觀](#屬性外觀)
- [屬性：計時](#屬性計時)
- [`<chunk-item>` 屬性](#chunk-item-屬性)
- [屬性解說](#屬性解說)
- [範例](#範例)

## 標籤

| 標籤 | 位置 | 用途 |
| --- | --- | --- |
| `<sentence-build>` | 任意位置 | 練習本體。 |
| `<chunk-item>` | `<sentence-build>` 內，或外部來源區塊內 | 一個語塊，依正確順序撰寫。 |

## 屬性：資料與題庫

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `src` | CSS 選擇器 | 無 | 從外部區塊讀取 `<chunk-item>`，例如 `#q1`。 |
| `pool-src` | CSS 選擇器 | 無 | 題庫容器，裡面每個帶 `data-item` 的子元素是一題。 |
| `pool-select` | `random`、`sequence` | `random` | 題庫的出題方式。全部出完會重新洗牌，新一輪的第一題不會和上一題重複。 |
| `show-progress` | 布林 | 關閉 | 題庫模式顯示進度列。 |

## 屬性：互動與批改

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `mode` | `click`、`drag`、`both` | `click` | 點選、拖曳，或兩者皆可。 |
| `shuffle` | `true`、`false` | `true` | 打亂語塊庫的順序。 |
| `allow-repeat` | 布林 | 關閉 | 同一個語塊可以重複放入組句區。 |
| `check-mode` | `submit`、`immediate` | `submit` | `immediate` 每放一個語塊就即時標示對錯。 |
| `auto-check` | 布林 | 關閉 | 放滿應有的語塊數時自動檢查。 |
| `max-attempts` | 整數 | `3` | 答錯幾次後出現「看答案」按鈕。 |
| `show-labels` | `true`、`false` | `true` | 答對後在組句區的語塊下方顯示 `label`。 |

## 屬性：文字與按鈕

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `msg-correct` | `正確！` | 答對訊息。 |
| `msg-wrong` | `再試一次` | 答錯訊息。 |
| `msg-answered` | 空 | 按「看答案」後的訊息。 |
| `btn-check` | `確認` | 檢查按鈕文字。 |
| `btn-reset` | `重置` | 重置按鈕文字。 |
| `btn-answer` | `看答案` | 看答案按鈕文字。 |
| `btn-hint` | 空 | 提示按鈕文字，需同時設定 `hint-text` 才會出現。 |
| `hint-text` | 空 | 提示內容。題庫模式中，每題的 `data-hint` 優先。 |
| `btn-next` | 題庫模式為 `下一題` | 下一題按鈕文字。 |
| `next-on` | `done` | `done` 答對後才出現下一題按鈕；`always` 一直顯示。 |
| `label-pool` | 空 | 語塊庫上方的標籤。 |
| `label-zone` | 空 | 組句區上方的標籤。 |
| `show-count` | 關閉 | 組句區顯示「已放 / 應放」數量。 |
| `show-reset` | 開啟 | 組句區右上角顯示清空小按鈕。 |
| `reset-icon` | `↺` | 清空小按鈕的圖示。 |
| `reset-icon-size` | `0.8rem` | 清空小按鈕的大小。 |

## 屬性：外觀

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `theme` | 品牌色名稱或色碼 | `sky` | 語塊與按鈕的主色，文字色依底色亮度自動決定。 |
| `chunk-style` | `pill`、`box`、`tag` | `pill` | 語塊外形：膠囊、方塊、左側加深色條的標籤。 |
| `chunk-font-size` | 長度 | `1rem` | 語塊字級。 |
| `chunk-padding` | CSS `padding` 值 | `2px 8px` | 語塊內距。 |
| `label-font-size` | 長度 | `0.75rem` | 語塊下方標籤字級。 |
| `gap` | 長度 | `8px` | 語塊間距。 |
| `margin` | 長度 | `1px` | 語塊外距。 |
| `padding` | CSS `padding` 值 | `3px 6px` | 元件內距。 |
| `pool-direction` | `row`、`column` | `row` | 語塊庫的排列方向。 |
| `zone-direction` | `row`、`column` | `row` | 組句區的排列方向。 |
| `zone-min-height` | 長度 | `32px` | 組句區最小高度。 |
| `zone-border` | CSS `border` 值 | `1px dashed` | 組句區外框。 |
| `divider` | `true`、`false` | `true` | 語塊庫與組句區之間的分隔線。 |
| `anim-duration` | 毫秒 | `150` | 語塊移動動畫長度。 |

## 屬性：計時

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `timer` | 秒 | 無 | 設定後在下方顯示倒數條。 |
| `timer-warn` | 秒 | `10` | 剩下幾秒時改成警告色。 |
| `timer-action` | `lock`、`submit`、`answer` | `lock` | 時間到時鎖定作答、自動檢查，或直接顯示答案。 |
| `timer-label` | 文字 | 空 | 倒數條左側的文字。 |

## `<chunk-item>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `label` | 文字 | 答對後顯示在語塊下方的說明，例如詞性。 |
| `theme` | 品牌色名稱或色碼 | 只覆寫這個語塊的顏色。 |
| `font-size` | 長度 | 只覆寫這個語塊的字級。 |
| `decoy` | 布林 | 干擾語塊，不在正確答案中。 |
| `fixed` | 布林 | 固定語塊：不參與洗牌、永遠留在語塊庫，而且可以重複使用，適合標點符號。 |

## 屬性解說

- **正確答案**：依 `<chunk-item>` 的撰寫順序，去掉 `decoy` 後就是正確順序。
- **布林屬性**：只寫屬性或寫 `true` 為開啟，寫 `false` 為關閉。
- **移回語塊**：`click` 與 `both` 模式下，點組句區裡的語塊會放回語塊庫；`drag` 與 `both` 模式下可以在兩區之間拖曳，也能在組句區內調整順序。
- **題庫格式**：`pool-src` 指向的容器裡，每個 `data-item` 子元素放一題的 `<chunk-item>`，可用 `data-hint` 給該題專屬提示。
- **答錯回饋**：答錯時組句區會抖動並以紅框標示；答對時以綠框標示並鎖定。

## 範例

**基本點選組句**

```html
<sentence-build theme="sky" label-pool="語塊庫" label-zone="組合你的句子" show-count>
  <chunk-item label="主詞">The number of students</chunk-item>
  <chunk-item label="動詞">has risen</chunk-item>
  <chunk-item label="副詞">sharply</chunk-item>
  <chunk-item decoy>have risen</chunk-item>
</sentence-build>
```

**拖曳、方塊外形與標點**

```html
<sentence-build theme="ocean" mode="drag" chunk-style="box" chunk-padding="3px 12px">
  <chunk-item>However</chunk-item>
  <chunk-item fixed theme="shell">,</chunk-item>
  <chunk-item>the plan failed</chunk-item>
  <chunk-item fixed theme="shell">.</chunk-item>
</sentence-build>
```

**即時批改、自動檢查與提示**

```html
<sentence-build theme="teal" mode="both" check-mode="immediate" auto-check chunk-style="tag"
                btn-hint="提示" hint-text="先找主詞" max-attempts="2" msg-answered="這是參考答案">
  <chunk-item>Not only</chunk-item>
  <chunk-item>did he</chunk-item>
  <chunk-item>apologise</chunk-item>
</sentence-build>
```

**倒數計時**

```html
<sentence-build theme="salmon" timer="30" timer-warn="8" timer-action="answer" timer-label="剩餘時間">
  <chunk-item>I'd say</chunk-item>
  <chunk-item>it depends on</chunk-item>
  <chunk-item>the situation</chunk-item>
</sentence-build>
```

**題庫隨機出題**

```html
<sentence-build theme="indigo" pool-src="#bank-1" pool-select="random" show-progress next-on="done"></sentence-build>

<div id="bank-1" hidden>
  <div data-item data-hint="主詞是 traffic">
    <chunk-item>Traffic</chunk-item><chunk-item>has become</chunk-item><chunk-item>a major issue</chunk-item>
  </div>
  <div data-item>
    <chunk-item>Many people</chunk-item><chunk-item>prefer</chunk-item><chunk-item>working from home</chunk-item>
  </div>
</div>
```
