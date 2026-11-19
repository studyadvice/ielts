# ui-post

`<ui-post>` 是社群貼文留言動畫元件。貼文先出現，留言一則一則冒出（前面有「正在輸入」動畫），接著愛心數開始跳動：最佳回答的愛心爆棚、蓋上徽章並置頂，差的答案變灰或摺疊，最後接考官留言與講評標籤。適合螢幕錄影教學。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

- 版本：1.1.0
- 建立日期：11-13-26（1.1.0：11-15-26 新增 `mode="live"` 與 `add()`）
- 11-17-26：`post-item` 新增 `bg-color`、`border-color`、`border-width`、`border-style`；新增 `<mark-fx>` 文字標記、`tag-icons` 標籤圖示、`drop-cap` 首字放大、`post-item` 的可點擊自訂徽章（`badge`，需搭配 `bp-popnote.js`）
- 11-18-26：新增 `head-style="linkedin"`、`headline`、`follow` 系列屬性與 `post-follow` 事件；`compact` 再縮小一輪（頭像 30px 改 24px，內距與字級縮小，會改變既有 compact 頁面的外觀）。
- 11-19-26：`post-item` 新增 `electric` 金色電流框特殊訊息（含 `electric-color`、`electric-hot-color`、`electric-speed`）與 `pause`（停住等按「繼續」）；新增 `<remove-fx>` 移除先前的效果；`ui-post` 新增 `btn-color`（控制列按鈕反色）與 `continue-label`；新增 `post-pause`、`post-continue` 事件。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-post.js` | `<ui-post>`、`<post-item>` | 社群貼文與留言動畫。 |
| `ui-post-demo-11-19-26.html` | | 整合範例 32 則（新增 `remove-fx`、`pause`、`btn-color`、`electric` 金色電流框，另含 LinkedIn 作者區塊與更緊湊的 compact、基本播放、外框與版面、live 模式、特效與握把、文字標記、標籤圖示、首字放大、可點徽章）、完整屬性速查與版本紀錄；取代 11-18-26 的整合範例。 |

## 目錄

- [快速開始](#快速開始)
- [播放流程](#播放流程)
- [ui-post 屬性](#ui-post-屬性)
- [post-item 屬性](#post-item-屬性)
- [live 模式](#live-模式)
- [mark-fx 文字標記](#mark-fx-文字標記)
- [electric 金色電流框](#electric-金色電流框)
- [pause 播到一半等按繼續](#pause-播到一半等按繼續)
- [remove-fx 移除先前的效果](#remove-fx-移除先前的效果)
- [可點擊的自訂徽章](#可點擊的自訂徽章)
- [事件與方法](#事件與方法)
- [授權](#授權)

## 快速開始

```html
<ui-post author="IELTS Examiner" badge="Part 1" time="2h">
  How often do you exercise?
  <post-item author="Amy" likes="3" low tags="照抄題目:red">I exercise almost every day.</post-item>
  <post-item author="Ben" likes="1280" best tags="具體運動:green,慣用語:yellow">
    I go <c-key>jogging</c-key> every day, <c-yellow>rain or shine</c-yellow>.
  </post-item>
  <post-item author="Examiner" examiner>Name the sport instead of repeating "exercise".</post-item>
</ui-post>

<script src="https://cdn.jsdelivr.net/gh/studyadvice/ielts@main/post/ui-post.js"></script>
```

## 播放流程

1. 元件完整進入畫面時開始（`autoplay="false"` 時按 ▶）。
2. 一般留言依序出現，每則前面有「正在輸入」動畫，愛心數停在 `start-likes`。
3. 愛心爆發：`best` 的數字加速飆升、愛心從按鈕噴出；其他留言慢慢增加到 `likes`。
4. 評判：最佳回答變成實心愛心、蓋上徽章並置頂；`low` 的留言變灰或摺疊；`tags` 講評標籤出現。
5. `examiner` 與 `after` 的留言最後出現。
6. 留言有 `pause` 時，出現後停住，按「繼續」才往下播。

愛心不使用透明度，以縮小的方式消失。愛心數為 0 時只顯示空心愛心。

## ui-post 屬性

顏色可寫色票名稱（`background`、`bg-alternative`、`shell`、`vanilla`、`yellow`、`pink`、`red`、`green`、`blue`、`indigo`、`violet`、`gray`、`key`、`calm`、`quiet`、`playful`、`urgent`、`energetic`、`dreamy`）或色碼。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `author`、`time` | `IELTS Examiner`、`1h` | 貼文作者與時間。 |
| `avatar`、`avatar-color` | 作者首字、依名字配色 | 頭像可填文字、emoji 或圖片網址。 |
| `badge`、`brand` | 無 | 作者旁的徽章；時間後方的平台名稱。 |
| `likes` | `0` | 貼文本身的愛心數。 |
| `shares` | `0` | 貼文轉寄數，0 時只顯示圖示。 |
| `share`、`share-label`、`share-color` | 顯示、`分享`、`blue` | `share="false"` 隱藏轉寄圖示；轉寄文字；留言轉寄數爆發時的顏色。 |
| `autoplay` | 自動 | `false` 時按 ▶ 才開始。 |
| `auto-scroll` | `false` | 內容超出螢幕時，新出現的留言、輸入中動畫與講評標籤會自動捲動到可見範圍；`false` 時不捲動頁面。 |
| `rate` | `1` | 初始播放倍率。 |
| `start-delay`、`item-delay`、`typing` | `600`、`700`、`1100` | 開始前停頓、留言間隔、「正在輸入」動畫長度（毫秒）。 |
| `surge-delay`、`surge`、`end-delay` | `700`、`3500`、`900` | 爆發前停頓、愛心爆發時間、爆發後到考官留言的停頓。 |
| `burst` | `big` | 愛心噴發：`big`、`small`、`none`。 |
| `sort` | `true` | 最佳回答置頂。 |
| `low-style` | `dim` | 低分留言：`dim` 變灰、`fold` 摺疊（點一下展開）、`keep` 不變。 |
| `count-format` | `short` | `short` 顯示 1.3K，`full` 顯示 1,280。 |
| `width`、`min-height`、`font-size` | `640px`、`80px`、`1rem` | 最大寬度、留言區最小高度、字級；純數字視為 px。 |
| `theme` | 無 | 統一外框與分隔線的顏色，可寫色票名稱或色碼；個別屬性會覆蓋它。 |
| `border-color`、`border-width` | `gray`、`2px` | 外框顏色與粗細；純數字視為 px。 |
| `divider-color` | 同外框色 | 貼文卡片、控制列與按鈕之間的分隔線顏色。 |
| `compact` | 無 | 發文作者區塊緊湊排版：頭像 24px，名字與時間同一行，內距、行距、內文字級、互動列間距都縮到最小；`compact="false"` 等於沒寫。留言區不受影響。與 `head-style="linkedin"` 並用時 compact 優先。 |
| `head-style` | 無 | 發文作者區塊排版：`linkedin` 為 LinkedIn 風格（頭像 56px、姓名加職稱、時間加地球圖示、右上追蹤按鈕）；不寫為原本排版。只影響貼文本身，不影響留言區；仍沿用色票與深色底。 |
| `headline` | 無 | LinkedIn 排版的職稱，顯示在姓名下方；不寫就不顯示。 |
| `follow`、`follow-label`、`following-label`、`follow-color` | 顯示、`追蹤`、`追蹤中`、`blue` | LinkedIn 排版的追蹤按鈕；`follow="false"` 隱藏。點擊切換狀態並觸發 `post-follow`。 |
| `grip` | 無 | 每則留言右側顯示握把，點一下收合並隱藏該則留言（含章與評語）；留言數不變，重播後會再出現。寫在 `post-item` 上可個別開啟，`grip="false"` 個別關閉。 |
| `grip-label` | `隱藏這則留言` | 滑鼠移到握把上的提示文字。 |
| `grip-color`、`grip-hover-color` | `gray`、`pink` | 握把顏色、滑鼠移上去的顏色。 |
| `profile-target` | 無 | 板主（貼文作者）頭像的點擊目標，填頁面上 `<template>` 或隱藏元素的 id（可寫可不寫 `#`）。有設定時，頭像會變成可點擊，點了在頭像旁跳出小視窗顯示該內容。 |
| `profile-width` | `320px` | 板主小視窗的寬度；純數字視為 px。 |
| `bg-color`、`bubble-color`、`text-color` | `#0C0D0C`、`bg-alternative`、`vanilla` | 底色、留言泡泡色、文字色。 |
| `heart-color`、`best-color`、`examiner-color` | `urgent`、`yellow`、`key` | 愛心、最佳回答、考官的顏色。 |
| `controls` | 顯示 | 控制列：播放／暫停、重播、0.5×、1×、2×；`false` 隱藏。 |
| `btn-color` | `pink` | 控制列按鈕滑鼠移上去的外框與文字色、目前倍速的底色，以及 `pause` 的「繼續」按鈕顏色；色名或色碼。 |
| `continue-label` | `繼續` | `post-item` 的 `pause` 所出現按鈕的文字；單則 `post-item` 也能設，單則優先。 |
| `best-label`、`examiner-label`、`fold-label` | `最佳回答`、`考官`、摺疊說明 | 徽章與摺疊文字。 |
| `typing-label`、`comment-label`、`like-label` | `正在輸入`、`則留言`、`讚` | 介面文字。 |
| `drop-cap`、`drop-cap-color` | 無、同文字色 | 首字放大：留言整則是英文、開頭是字母，而且排版後有兩行以上時，第一個字母放大成兩行高；不符合條件的留言不變，寬度改變時會重新判斷。`drop-cap-color` 指定首字顏色。 |
| `tag-icons` | `true` | 講評標籤依顏色自動加圖示：green 打勾、red 打叉、yellow 燈泡，其他顏色不加；`false` 關閉。 |

## post-item 屬性

| 屬性 | 說明 |
| --- | --- |
| `author`、`avatar`、`avatar-color`、`time` | 留言者、頭像、時間（預設「剛剛」）。 |
| `likes`、`start-likes` | 最後的愛心數；爆發前的愛心數（預設：最佳回答 2，其他為最後的 35%）。 |
| `shares`、`start-shares` | 轉寄數；設定後留言下方出現轉寄圖示，爆發時跟著愛心從 `start-shares`（預設 0）一起增加。 |
| `best` | 最佳回答：爆發、徽章、置頂。可以有多則。 |
| `low` | 低分留言；可填 `dim`、`fold`、`keep` 覆蓋 `low-style`。 |
| `examiner` | 考官留言，換色並加徽章，預設在爆發後出現。 |
| `role-label` | 這則留言名字旁的角色徽章文字（例如「家教」），只對 `examiner` 留言有效；沒填時使用 `ui-post` 的 `examiner-label`，再沒有則為「考官」。 |
| `after` | 爆發後才出現；`after="false"` 讓考官留言提早出現。 |
| `reply` | 顯示成前面最近一則 `best` 留言的回覆：縮排並加上連線，跟著對象一起置頂。對象必須先出現；找不到對象時照一般留言顯示。`reply="false"` 關閉。 |
| `tags` | 講評標籤，逗點分隔，可寫「文字:色名」，在爆發後出現。 |
| `width`、`max-width` | 這一則留言泡泡的寬度。`width` 固定寬度，超過貼文寬度會縮回去；`max-width` 只限制上限，短留言維持原本大小。純數字視為 px，也可以寫 `50%`（以留言區為基準）。 |
| `bg-color`、`border-color`、`border-width`、`border-style` | 這一則留言泡泡的底色、外框顏色、粗細（純數字視為 px）、樣式（`solid`、`dashed`、`dotted`、`double`、`groove`、`ridge`、`none`）。優先於 `bubble-color`，也優先於最佳回答、考官的外框色。`ui-post` 的 `theme` 只管整個貼文的外框與分隔線，不影響留言。 |
| `badge`、`badge-color` | 在名字旁加自訂徽章（不可點）。`mode="live"` 不支援，連文字都不顯示。考官與最佳回答徽章不受影響。 |
| `badge-target`、`badge-content`、`badge-title` | 寫了其中任一個，徽章就是可點的按鈕，詳見[可點擊的自訂徽章](#可點擊的自訂徽章)。 |
| `drop-cap`、`drop-cap-color` | 只讓這一則判斷首字放大；`drop-cap="false"` 讓這一則不放大；`drop-cap-color` 指定這一則的首字顏色。 |
| `tag-icons` | `false` 讓這一則的標籤不加圖示，覆蓋 `ui-post` 的設定；用 `add()` 時請寫字串 `'false'`。 |
| `liked` | 愛心一開始就是實心。 |
| `grip` | `grip="false"` 讓這一則不顯示握把；寫 `grip` 則讓這一則單獨顯示握把。 |
| `delay`、`typing` | 這一則的間隔與「正在輸入」毫秒數；`typing="0"` 不顯示輸入中。 |
| `electric`、`electric-color`、`electric-hot-color`、`electric-speed` | 特殊訊息：金色電流框，詳見 [electric 金色電流框](#electric-金色電流框)。 |
| `pause`、`continue-label` | 這則出現後停住，等按「繼續」才往下播，詳見 [pause 播到一半等按繼續](#pause-播到一半等按繼續)。 |

行內可用 `<b>`、`<i>`、`<c-key>` 等色名標籤。

## live 模式

`mode="live"` 時不照劇本播放，改由外部一則一則送進留言，可以搭配 [`ui-contacts`](../flow/README.md#ui-contactsjs) 把人物卡片直接拖進貼文。

- 不顯示控制列，`autoplay`、`play()`、`pause()`、`restart()` 失效。
- 預先寫好的 `post-item` 一載入就是最終狀態：愛心數、最佳回答置頂、低分處理與講評標籤，不播動畫。
- `add(item)` 送進的留言依序排隊播放：正在輸入、出現、愛心跳動，接著判定。`best` 爆愛心、蓋徽章，所有最佳回答依出現順序置頂；`low` 變灰或摺疊；`tags` 出現；`examiner` 與 `after` 不跳動愛心。
- `reply` 接在前面最近一則最佳回答之下。

```js
const p = document.querySelector('ui-post[mode="live"]');
p.add({ author: 'Ben', likes: 1280, best: true, tags: ['具體運動:green', '慣用語:yellow'],
        html: 'I go <c-key>jogging</c-key> every day, <c-yellow>rain or shine</c-yellow>.' });
p.add({ author: 'IELTS Examiner', examiner: true, roleLabel: '考官', text: 'Name the sport.' });
```

`item` 的鍵名同 `post-item` 屬性，駝峰或連字號都可以；`true` 代表只寫屬性名，陣列會用逗點接起來，內容用 `html` 或 `text`。非 live 模式呼叫 `add()` 只會加進清單，下次重播才出現。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `mode` | 無 | `live`：接收模式。 |
| `live-surge` | `1200` | live 模式中一般留言的愛心跳動時間（毫秒）；`best` 仍用 `surge`。 |

## mark-fx 文字標記

`<mark-fx>` 寫在 `post-item` 裡，留言出現後在指定文字上畫標記。可以和 `stamp-fx`、`note-fx` 混用，依書寫順序執行；暫停、倍速、重播都會影響它。`stamp-fx`、`note-fx` 的屬性見範例檔的屬性速查。

```html
<post-item author="Mia" likes="6">Yes, I very like reading novels.
  <mark-fx kind="strike" text="very"></mark-fx>
  <mark-fx text="novels"></mark-fx>
  <note-fx text="very">very 不能修飾動詞，改成 really</note-fx>
</post-item>

<post-item author="Leo" likes="420" best>People who read every day say that it helps them unwind.
  <mark-fx kind="arrow" text="them" to="People" color="yellow"></mark-fx>
  <mark-fx kind="color" text="unwind"></mark-fx>
</post-item>
```

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `kind` | `box` | `box` 把文字框起來（每一行各畫一個圓角框）、`strike` 刪除線、`wavy` 波浪底線、`cross` 打叉、`arrow` 箭頭、`color` 文字變色。 |
| `text`、`nth` | 無、`1` | 要標記的文字與第幾次出現。`text` 是比對字串，例如 `it` 也會對到 city 裡的 it，這時用 `nth` 指定。省略 `text` 時標記整則留言。 |
| `target` | 這則內容 | CSS 選擇器，改為標記指定的元素。 |
| `color` | `key`（`strike`、`wavy`、`cross` 為 `red`） | 線條顏色；`kind="color"` 時是文字要換成的顏色。 |
| `thickness` | `3`（`box`、`wavy` 為 `2`） | 線條粗細（px）。 |
| `rough`、`seed` | `0.5`、依文字 | 手繪感 0 到 1，0 是工整的線；亂數種子。 |
| `padding` | `4`（`cross` 為 `2`） | 線條超出文字的範圍（px）；`box` 的框左右各留 `padding`，上下留一半。 |
| `radius` | `4` | 只用於 `box`：圓角半徑（px），0 是直角。 |
| `to`、`to-nth`、`to-target` | 無、`1`、無 | 只用於 `arrow`：終點文字、第幾次出現、或用選擇器指定終點。沒有終點時不畫。 |
| `side`、`bend`、`head` | 自動、自動、`9` | 只用於 `arrow`。起點和終點同一行時，弧線走文字上方（`top`）或下方（`bottom`）；沒寫時最後一行走下方，其他行走上方。`bend` 是弧線高度，`head` 是箭頭尖端長度（px）。不同行時從靠近對方的那一側出發。 |
| `start`、`delay`、`speed` | `after`、`0`、`600`（`color` 為 `300`） | `start="with"` 與前一個特效同時開始；開始前等待與動畫時間（毫秒）。 |
| `stay`、`fade-out` | `forever`、`300` | 停留幾毫秒後淡出移除；`kind="color"` 則是換回原色。 |

## electric 金色電流框

`post-item` 加上 `electric`，這則留言變成特殊訊息：沒有頭像、時間與愛心列，外框是金色，電流繞著框跑，外圈有劈啪抖動的細電弧，出現時閃一下。適合放老師的重點提示。

```html
<post-item electric>
  把題目用字和句型複製貼上當成開場，在詞彙資源、語法多樣毫無加分機會
</post-item>

<post-item electric author="Nelson" max-width="420px" electric-color="pink" electric-hot-color="vanilla" electric-speed="1.2">
  限制寬度、換顏色、轉快一點
</post-item>
```

- `author` 可以省略；有寫時以金色顯示在框內上方，仍然沒有頭像。
- 沒設 `width` 或 `max-width` 時，框的寬度等於留言區內容寬度（橫跨左右）；設了就限制寬度並靠左。
- `electric-color`（預設 `yellow`）是外框與電流色，`electric-hot-color`（預設 `salmon`）是電流亮點色，`electric-speed` 是繞一圈的秒數（0.4 到 20，預設 2.4）。
- 預設不顯示「正在輸入」；明確寫 `typing` 才會顯示。`electric="false"` 關閉。
- 不參與愛心與最佳回答；`stamp-fx`、`note-fx`、`mark-fx`、`tags`、`low` 照常可用。
- live 模式的 `add()` 寫 `electric: true`。

## pause 播到一半等按繼續

`post-item` 加上 `pause`，這則出現（含效果播完）後播放停住，貼文下方出現提示文字與「繼續」按鈕，按了才往下播。

```html
<post-item author="Nelson" pause="先想想，這句答案放掉了什麼機會？">
  為什麼第一句這樣答，等同於白白放掉展現實力的機會？
</post-item>
<post-item author="Nelson" pause continue-label="看解方">想好了嗎？</post-item>
```

- `pause` 的值是提示文字，可省略；`pause="false"` 關閉。
- 按鈕文字用 `continue-label`（`ui-post` 或單則 `post-item`），顏色跟著 `btn-color`。
- 控制列的狀態列會顯示「等待按『繼續』」；按重播會取消等待。
- 只對劇本播放有效，`mode="live"` 忽略。事件：`post-pause`、`post-continue`。

## remove-fx 移除先前的效果

`<remove-fx>` 寫在 `post-item` 裡，放在要移除的效果後面，把先前的 `stamp-fx`、`note-fx`、`mark-fx` 淡出移除。標籤不需要內文。

```html
<post-item author="Nelson">
  I reached at the hotel on time and entered into the lobby.
  <mark-fx kind="strike" text="at"></mark-fx>
  <mark-fx kind="strike" text="into"></mark-fx>
  <stamp-fx color="salmon" icon="check2" anchor="right" offset-x="40">受中文影響</stamp-fx>
  <remove-fx effect="stamp" delay="1200" fade-out="500"></remove-fx>
  <remove-fx text="at" effect="mark" delay="600"></remove-fx>
</post-item>
```

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `target`、`text`、`nth` | 這則內容、無、`1` | 指到先前效果作用的位置，寫法同其他效果標籤；沒寫 `target` 就是這則留言文字。可以跨留言：`target` 指到頁面上唯一的元素（例如 id）即可。 |
| `effect` | 全部 | `stamp`、`note`、`mark`，只移除該類。 |
| `fade-out` | `300` | 淡出毫秒數；`kind="color"` 的 `mark-fx` 被移除時，文字還原原色。 |
| `start`、`delay` | `after`、`0` | 用法同其他效果標籤。 |

按重播會清空效果的登記，從頭再跑。

## 可點擊的自訂徽章

`post-item` 的 `badge` 在名字旁加一個徽章。再寫 `badge-target`、`badge-content`、`badge-title` 任一個，徽章就會變成按鈕，點擊後由 [bp-popnote.js](../note/README.md) 跳出窗格。ui-post 不自己做窗格，頁面必須另外載入 `bp-popnote.js`。

```html
<script src="../note/bp-popnote.js"></script>
<script src="ui-post.js"></script>

<ui-post>
  Describe your daily routine.
  <post-item author="Ben" likes="1280" best badge="語塊" badge-color="pink" badge-target="tip-jog"
             badge-popover-placement="bottom">I go jogging every day.</post-item>
</ui-post>
<template id="tip-jog"><b>go jogging</b>：go + 動名詞，表示從事某項活動。</template>
```

| 屬性 | 說明 |
| --- | --- |
| `badge`、`badge-color` | 徽章文字與底色，可用色票名稱。`badge-color` 同時是窗格的外框顏色（需要 bp-popnote 的 `data-popover-border-color`）。 |
| `badge-target` | 窗格內容來源，填 template 的 id。純 id 會自動補上 `#`，也可以直接寫選擇器。 |
| `badge-content`、`badge-title` | 簡短內容與標題，不用另外寫 template。 |
| `badge-popover-xxx` | 原樣轉成 `data-popover-xxx` 交給 bp-popnote，例如 `badge-popover-placement="bottom"`、`badge-popover-theme`、`badge-popover-maxwidth`。 |

- **播放中不能點，暫停也不能點。** 播完（`post-end`）才可以點，重播時再鎖上，窗格若開著會一併關閉。
- **可點的線索：** 游標變手形、懸停時反白、徽章尾端有 ▾。鎖住時沒有這些提示。
- **沒載入 `bp-popnote.js`：** 徽章維持不可點，console 會警告一次。載入順序不影響，頁面載入完成後會再檢查。
- **`mode="live"` 不支援。** 徽章整個忽略，`add()` 也不需要 `badge` 系列鍵名。
- 只寫 `badge` 沒有 target、content、title 時，是不可點的一般徽章。

## 事件與方法

| 名稱 | 說明 |
| --- | --- |
| `post-item-show` | 每則留言出現時觸發，`detail = { index, author, after }`。 |
| `post-item-hide` | 留言被握把隱藏時觸發，`detail = { index, author }`，會冒泡。 |
| `post-follow` | LinkedIn 排版的追蹤按鈕被點擊時觸發，`detail = { author, following }`，會冒泡。 |
| `post-surge-end` | 愛心爆發、置頂與標籤完成時觸發。 |
| `post-end` | 全部播完時觸發。 |
| `post-pause` | `pause` 的留言停住、出現「繼續」按鈕時觸發，`detail = { index, author }`，會冒泡。 |
| `post-continue` | 使用者按下「繼續」時觸發，`detail = { index, author }`，會冒泡。 |
| `post-add-end` | live 模式中，`add()` 送進的一則留言播完時觸發，`detail = { index, author, best }`。 |
| `add(item)` | 加一則留言，回傳留言總數。 |
| `live`、`total` | 唯讀：是否為 live 模式、留言總數。 |
| `play()`、`pause()`、`restart()` | 播放或繼續、暫停、從頭播放。 |
| `rate` | 播放倍率，可讀寫，例如 `el.rate = 2`。 |

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
