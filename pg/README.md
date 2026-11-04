# ui-progrid

`<ui-progrid>` 是屬性面板元件，左欄是欄位名稱、右欄是可直接編輯的值，類似開發工具裡的設定面板。支援分類摺疊、文字、數字、下拉、日期、開關、評分、唯讀與隱碼欄位，內建驗證、說明區、詳情視窗，並可匯出 JSON。元件不使用 Shadow DOM，圖示使用 Bootstrap Icons。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-progrid.js` | `<ui-progrid>` `<pg-cat>` `<pg-row>` `<pg-opt>` `<pg-desc>` `<pg-more>` `<pg-note>` | 可編輯的屬性面板，含驗證與 JSON 匯出。 |

## 目錄

- [標籤](#標籤)
- [`<ui-progrid>` 屬性](#ui-progrid-屬性)
- [`<pg-cat>` 屬性](#pg-cat-屬性)
- [`<pg-row>` 屬性](#pg-row-屬性)
- [欄位類型](#欄位類型)
- [屬性解說](#屬性解說)
- [範例](#範例)
- [事件](#事件)
- [JavaScript API](#javascript-api)

## 標籤

| 標籤 | 位置 | 用途 |
| --- | --- | --- |
| `<ui-progrid>` | 任意位置 | 面板本體。 |
| `<pg-cat>` | `<ui-progrid>` 內 | 分類，有標題列，可摺疊。可以省略，直接放 `<pg-row>`。 |
| `<pg-row>` | `<pg-cat>` 或 `<ui-progrid>` 內 | 一個欄位。 |
| `<pg-opt>` | `<pg-row>` 內 | 下拉選項，文字為顯示名稱，`value` 為實際值。 |
| `<pg-desc>` | `<pg-row>` 內 | 選取這一列時，在說明區顯示的 HTML 說明。 |
| `<pg-more>` | `<pg-row>` 內 | 詳細內容。這一列會多一顆「查看詳情」按鈕，按下以視窗顯示。 |
| `<pg-note>` | `<pg-row>` 內 | 永遠顯示在這一列下方的附註。 |

## `<ui-progrid>` 屬性

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `heading` | 文字 | 無 | 面板標題。 |
| `density` | `compact`、`loose` | 一般 | 列高與間距。 |
| `field-style` | `boxed` | 無框 | 輸入框加上底色與外框。 |
| `accent` | 品牌色名稱或 `#hex` | `ocean` | 強調色。 |
| `label-ratio` | `左:右` | `4:6` | 名稱欄與值欄的寬度比例，名稱欄限制在 20% 到 80%。 |
| `max-height` | 數字（px） | 不限 | 內容區最大高度，超過時捲動。 |
| `readonly` | 布林 | 關閉 | 整個面板唯讀。 |
| `no-desc` | 布林 | 關閉 | 不顯示底部說明區。 |
| `show-actions` | 布林 | 關閉 | 標題列顯示「驗證所有欄位」「匯出完整 JSON」「匯出數值 JSON」按鈕。 |
| `silent` | 布林 | 關閉 | 不在畫面上跳出提示，改寫到主控台。 |

## `<pg-cat>` 屬性

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `name` | 文字 | 空 | 分類名稱。 |
| `collapsed` | 布林 | 關閉 | 預設摺疊。 |
| `color` | 品牌色名稱或 `#hex` | 無 | 分類標題色。 |
| `numbering` | 布林 | 關閉 | 這個分類的欄位自動編號。 |
| `number-start` | 整數 | `1` | 編號起始值。 |
| `number-prefix` | 文字 | 空 | 編號前綴，例如 `B`。 |
| `number-suffix` | 文字 | `.` | 編號後綴。 |
| `number-color` | 品牌色名稱或 `#hex` | `sky` | 編號顏色。 |

## `<pg-row>` 屬性

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `key` | 文字 | 欄位代號，取值與設值都靠它，應該唯一。沒寫時自動命名並在主控台警告。 |
| `label` | 文字 | 欄位名稱，預設為 `key`。 |
| `type` | 見「欄位類型」 | 預設 `text`。 |
| `value` | 文字 | 初始值。 |
| `icon` | Bootstrap Icons 名稱 | 名稱前的圖示。 |
| `desc` | 文字 | 純文字說明，沒有 `<pg-desc>` 時使用。 |
| `placeholder` | 文字 | 提示文字；下拉欄位有設定時，初始值可以是空的。 |
| `unit` | 文字 | 值後方的單位，例如 `分鐘`。 |
| `wrap` | 布林 | 名稱與值允許換行。 |
| `readonly` | 布林 | 這一列唯讀。 |
| `options` | 以 `\|` 分隔的文字 | 下拉選項，沒有 `<pg-opt>` 時使用。 |
| `on-text`、`off-text` | 文字 | 開關欄位兩種狀態的文字。 |
| `rating-count` | 1 到 10 | 評分圖示數量，預設 5。 |
| `rating-style` | `star`、`circle`、`square`、`heart` | 評分圖示，預設 `star`。 |
| `rating-mode` | `pick`、`scale` | `scale` 為給 N 分；`pick` 為多選（值是選中編號的陣列），預設 `pick`。 |
| `rating-min`、`rating-max` | 整數 | `scale` 的分數範圍，或 `pick` 可選的數量範圍。 |
| `required` | 布林 | 必填。 |
| `min`、`max` | 數字 | 數字欄位的範圍。 |
| `minlength`、`maxlength` | 整數 | 文字長度範圍。 |
| `pattern` | 正規表示式 | 文字格式。 |
| `exact` | 文字 | 必須完全等於這個值。 |
| `min-date`、`max-date` | `YYYY/MM/DD` | 日期範圍；`date-roc` 用民國年。 |

## 欄位類型

| `type` | 別名 | 說明 |
| --- | --- | --- |
| `text` | | 一般文字。 |
| `number` | | 數字。 |
| `select` | `dropdown` | 下拉選單。 |
| `date` | | 西元日期，格式 `YYYY/MM/DD`。 |
| `date-roc` | | 民國日期，格式 `YYY/MM/DD`。 |
| `bool` | `boolean` | 開關。 |
| `rating` | `rating-selector` | 評分圖示。 |
| `readonly` | `view` | 唯讀文字。 |
| `secret` | `hidden` | 隱碼顯示，旁邊有眼睛按鈕切換，一律唯讀。 |

## 屬性解說

- **布林屬性**：只要存在就算開啟，但寫成 `false`、`0`、`no`、`off` 視為關閉。
- **說明區**：點選任一列時，底部說明區顯示該列的 `<pg-desc>` 或 `desc`。
- **驗證**：修改後即時驗證，錯誤時該列出現驚嘆號圖示並觸發 `pg-invalid`。`validate()` 會檢查全部欄位並跳到第一個錯誤。
- **即時更新**：`accent`、`label-ratio`、`max-height` 改變時只更新樣式；`density`、`field-style` 由 CSS 切換；其他屬性改變會重新繪製。
- **建立時機**：元件等到文件解析完才讀取子標籤。之後用程式改了子標籤，呼叫 `rebuild()` 重新解析。

## 範例

**基本面板與驗證**

```html
<ui-progrid id="pg-course" heading="課程設定" show-actions accent="lavender">
  <pg-cat name="課程" numbering number-color="sky">
    <pg-row key="c-title" label="課程名稱" required minlength="4" placeholder="至少 4 個字">
      <pg-desc>顯示在課程列表上的名稱。</pg-desc>
    </pg-row>
    <pg-row key="c-type" label="分類" type="select" placeholder="請選擇" required>
      <pg-opt value="speaking">口說</pg-opt>
      <pg-opt value="writing">寫作</pg-opt>
    </pg-row>
    <pg-row key="c-price" label="價格" type="number" unit="元" min="0" max="9999" value="0"></pg-row>
    <pg-row key="c-date" label="上架日期" type="date" required min-date="2026/01/01"></pg-row>
    <pg-row key="c-public" label="公開" type="bool" on-text="公開" off-text="不公開"></pg-row>
  </pg-cat>
</ui-progrid>
```

**評分、隱碼、詳情與附註**

```html
<ui-progrid heading="錄影偏好" density="loose" field-style="boxed" label-ratio="3:7">
  <pg-cat name="影片">
    <pg-row key="res" label="解析度" type="select" options="1080p|1440p|4K" value="1440p"></pg-row>
    <pg-row key="q" label="畫質" type="rating" rating-mode="scale" rating-style="heart" value="4"></pg-row>
    <pg-row key="tags" label="適合程度" type="rating" rating-count="6" rating-max="3" value="1,3"></pg-row>
    <pg-row key="token" label="API 金鑰" type="secret" value="sk-demo-91f3c2a8"></pg-row>
    <pg-row key="path" label="儲存位置" type="readonly" value="D:\Videos\Lessons">
      <pg-more><p>完整路徑與權限說明。</p></pg-more>
      <pg-note>這個位置由系統設定，無法在這裡修改。</pg-note>
    </pg-row>
  </pg-cat>
  <pg-cat name="系統" collapsed>
    <pg-row key="uid" label="使用者代號" type="view" value="U-20261102-07"></pg-row>
  </pg-cat>
</ui-progrid>
```

**唯讀的資訊卡**

```html
<ui-progrid heading="Unit 2 資訊" readonly density="compact" no-desc accent="lavender" label-ratio="3:7">
  <pg-row key="topic" label="主題" value="Describing a change"></pg-row>
  <pg-row key="time" label="長度" type="number" value="32" unit="分鐘"></pg-row>
  <pg-row key="level" label="難度" type="rating" rating-mode="scale" value="4"></pg-row>
</ui-progrid>
```

## 事件

事件都會冒泡。

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `pg-change` | `{ key, value, old, source }` | 值改變；`source` 為 `user` 或 `api`。 |
| `pg-invalid` | `{ key, label, message }` | 欄位驗證失敗。 |
| `pg-select` | `{ key, label }` | 選取另一列。 |

## JavaScript API

```js
const pg = document.getElementById('pg-course');
pg.getValue('c-title');          // 讀取單一欄位
pg.setValue('c-price', 1200);    // 設定單一欄位，會觸發 pg-change
pg.getValues();                  // { key: value, ... }
pg.getFocused();                 // 目前選取的欄位資訊，沒有時為 null
pg.select('c-date');             // 選取某一列
pg.validate();                   // 驗證全部欄位，回傳錯誤資訊
pg.toJSON();                     // 等同 getValues()
pg.toJSON(true);                 // 含標題、分類與欄位定義的完整資料
pg.download(true);               // 下載 JSON 檔，true 為完整資料
pg.collapse(0, true);            // 摺疊第 1 個分類
pg.collapseAll(false);           // 全部展開
pg.rebuild();                    // 子標籤改變後重新解析，也可傳入新的 HTML 字串
```
