# ui-post

`<ui-post>` 是社群貼文留言動畫元件。貼文先出現，留言一則一則冒出（前面有「正在輸入」動畫），接著愛心數開始跳動：最佳回答的愛心爆棚、蓋上徽章並置頂，差的答案變灰或摺疊，最後接考官留言與講評標籤。適合螢幕錄影教學。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

- 版本：1.0.0
- 建立日期：11-13-26

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-post.js` | `<ui-post>`、`<post-item>` | 社群貼文與留言動畫。 |
| `ui-post-demo-11-13-26.html` | | 互動範例三則與屬性速查。 |

## 目錄

- [快速開始](#快速開始)
- [播放流程](#播放流程)
- [ui-post 屬性](#ui-post-屬性)
- [post-item 屬性](#post-item-屬性)
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
| `autoplay` | 自動 | `false` 時按 ▶ 才開始。 |
| `rate` | `1` | 初始播放倍率。 |
| `start-delay`、`item-delay`、`typing` | `600`、`700`、`1100` | 開始前停頓、留言間隔、「正在輸入」動畫長度（毫秒）。 |
| `surge-delay`、`surge`、`end-delay` | `700`、`3500`、`900` | 爆發前停頓、愛心爆發時間、爆發後到考官留言的停頓。 |
| `burst` | `big` | 愛心噴發：`big`、`small`、`none`。 |
| `sort` | `true` | 最佳回答置頂。 |
| `low-style` | `dim` | 低分留言：`dim` 變灰、`fold` 摺疊（點一下展開）、`keep` 不變。 |
| `count-format` | `short` | `short` 顯示 1.3K，`full` 顯示 1,280。 |
| `width`、`min-height`、`font-size` | `640px`、`80px`、`1rem` | 最大寬度、留言區最小高度、字級；純數字視為 px。 |
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
| `best` | 最佳回答：爆發、徽章、置頂。可以有多則。 |
| `low` | 低分留言；可填 `dim`、`fold`、`keep` 覆蓋 `low-style`。 |
| `examiner` | 考官留言，換色並加徽章，預設在爆發後出現。 |
| `after` | 爆發後才出現；`after="false"` 讓考官留言提早出現。 |
| `tags` | 講評標籤，逗點分隔，可寫「文字:色名」，在爆發後出現。 |
| `liked` | 愛心一開始就是實心。 |
| `delay`、`typing` | 這一則的間隔與「正在輸入」毫秒數；`typing="0"` 不顯示輸入中。 |

行內可用 `<b>`、`<i>`、`<c-key>` 等色名標籤。

## 事件與方法

| 名稱 | 說明 |
| --- | --- |
| `post-item-show` | 每則留言出現時觸發，`detail = { index, author, after }`。 |
| `post-surge-end` | 愛心爆發、置頂與標籤完成時觸發。 |
| `post-end` | 全部播完時觸發。 |
| `play()`、`pause()`、`restart()` | 播放或繼續、暫停、從頭播放。 |
| `rate` | 播放倍率，可讀寫，例如 `el.rate = 2`。 |

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
