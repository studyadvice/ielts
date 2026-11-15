# ui-post

`<ui-post>` 是社群貼文留言動畫元件。貼文先出現，留言一則一則冒出（前面有「正在輸入」動畫），接著愛心數開始跳動：最佳回答的愛心爆棚、蓋上徽章並置頂，差的答案變灰或摺疊，最後接考官留言與講評標籤。適合螢幕錄影教學。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

- 版本：1.1.0
- 建立日期：11-13-26（1.1.0：11-15-26 新增 `mode="live"` 與 `add()`）

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-post.js` | `<ui-post>`、`<post-item>` | 社群貼文與留言動畫。 |
| `ui-post-demo-11-13-26.html` | | 互動範例三則與屬性速查。 |
| `ui-post-demo-11-15-26.html` | | `mode="live"` 與 `add()` 範例、v1.0 到 v1.1 對照。 |

## 目錄

- [快速開始](#快速開始)
- [播放流程](#播放流程)
- [ui-post 屬性](#ui-post-屬性)
- [post-item 屬性](#post-item-屬性)
- [live 模式](#live-模式)
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
| `profile-target` | 無 | 板主（貼文作者）頭像的點擊目標，填頁面上 `<template>` 或隱藏元素的 id（可寫可不寫 `#`）。有設定時，頭像會變成可點擊，點了在頭像旁跳出小視窗顯示該內容。 |
| `profile-width` | `320px` | 板主小視窗的寬度；純數字視為 px。 |
| `bg-color`、`bubble-color`、`text-color` | `#0C0D0C`、`bg-alternative`、`vanilla` | 底色、留言泡泡色、文字色。 |
| `heart-color`、`best-color`、`examiner-color` | `urgent`、`yellow`、`key` | 愛心、最佳回答、考官的顏色。 |
| `controls` | 顯示 | 控制列：播放／暫停、重播、0.5×、1×、2×；`false` 隱藏。 |
| `best-label`、`examiner-label`、`fold-label` | `最佳回答`、`考官`、摺疊說明 | 徽章與摺疊文字。 |
| `typing-label`、`comment-label`、`like-label` | `正在輸入`、`則留言`、`讚` | 介面文字。 |

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
| `liked` | 愛心一開始就是實心。 |
| `delay`、`typing` | 這一則的間隔與「正在輸入」毫秒數；`typing="0"` 不顯示輸入中。 |

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

## 事件與方法

| 名稱 | 說明 |
| --- | --- |
| `post-item-show` | 每則留言出現時觸發，`detail = { index, author, after }`。 |
| `post-surge-end` | 愛心爆發、置頂與標籤完成時觸發。 |
| `post-end` | 全部播完時觸發。 |
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
