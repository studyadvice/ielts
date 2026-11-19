# md-editor

`<md-editor>` 是 GitHub 留言框樣式的 Markdown 輸入框：Write 與 Preview 分頁，工具列有標題、粗體、斜體、引用、程式碼、連結、項目清單、編號清單、核取清單、提及、參照、斜線與復原。送出的內容可以搭配 [`link-when`](../lw/README.md) 的 `do="feed"`，直接送進 `ui-post`、`ui-stream`，或代入 template 填進 `ui-play`，不需要寫 JavaScript。元件不使用 Shadow DOM，CSS 由 JS 自動注入，不需要其他函式庫。

- 版本：1.1.0
- 建立日期：11-20-26
- 更新日期：11-20-26（1.1.0：新增 `chart` 程式碼區塊與 `detail.charts`）

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `md-editor.js` | `<md-editor>` | Markdown 輸入框。 |
| `md-editor-demo-11-20-26.html` | | 互動範例四則（`chart` 區塊、同時送進三個元件、事件內容、`item` 與 `feed-as`）、屬性與事件總表。 |

## 目錄

- [快速開始](#快速開始)
- [送進其他元件](#送進其他元件)
- [屬性](#屬性)
- [事件與方法](#事件與方法)
- [支援的 Markdown](#支援的-markdown)
- [快捷鍵與編輯行為](#快捷鍵與編輯行為)
- [授權](#授權)

## 快速開始

```html
<md-editor id="ed" name="Amy" rows="6"></md-editor>

<script src="editor/md-editor.js"></script>
<script>
  document.getElementById('ed').addEventListener('md-submit', (e) => {
    console.log(e.detail.markdown, e.detail.html, e.detail.text);
  });
</script>
```

## 送進其他元件

一個輸入框可以接多條 `link-when`，同時送進多個元件。`md-editor` 的 `event="done"` 就是 `md-submit`。

```html
<md-editor id="ed1" name="Amy"></md-editor>

<ui-post id="po1" mode="live" author="IELTS Examiner">How often do you exercise?</ui-post>
<ui-stream id="st1" mode="live" height="340"></ui-stream>
<div id="pl1" hidden></div>

<template id="tpl1">
  <ui-play frame="win" frame-title="{name} 的回答" step-mode="auto" autoplay="true">
    <stage-item><div id="ans1">{html}</div></stage-item>
    <script-item>
      <mark-fx target="#ans1" kind="underline" color="red"></mark-fx>
    </script-item>
  </ui-play>
</template>

<link-when source="#ed1" event="done" target="#po1" do="feed"></link-when>
<link-when source="#ed1" event="done" target="#st1" do="feed"></link-when>
<link-when source="#ed1" event="done" target="#pl1" do="feed" template="#tpl1"></link-when>
```

- `ui-post`（需 `mode="live"`）與 `ui-stream`：呼叫 `add()`。作者用 `name` 屬性，`ui-post` 沒寫時是「我」，`ui-stream` 預設角色是 `student`。
- `ui-play` 只在建立時讀劇本，沒有執行期新增的方法，所以用 `template` 代入後填進容器，裡面的 `ui-play` 自己初始化。
- 輸入內容預設用轉好的 HTML；`feed-as="text"` 改成純文字，`item` 的 JSON 可補充 `likes`、`tags`、`from` 等欄位。屬性總表見 [`link-when` 的 README](../lw/README.md)。

## 屬性

顏色可寫色票名稱或任何 CSS 顏色。

| 屬性 | 預設 | 說明 |
| --- | --- | --- |
| `name` | 無 | 送出時放進 `detail.name`，`feed` 用它當作者名稱。 |
| `value` | 無 | 初始內容；沒寫時使用標籤內的文字。 |
| `placeholder` | `Use Markdown to format your comment` | 輸入框提示文字。 |
| `rows` | `7` | 輸入區與預覽區的最小高度（行數）。輸入區右下角可拖曳調整。 |
| `tools` | `heading,bold,italic,quote,code,link,\|,ul,ol,task,\|,mention,ref,slash,undo` | 工具列順序，`\|` 是分隔線；另有 `redo` 可加入。 |
| `tips` | `true` | `false` 時工具按鈕不顯示提示文字。 |
| `submit` | `true` | `false` 隱藏送出按鈕；Ctrl / Cmd + Enter 仍可送出。 |
| `label-write`、`label-preview` | `Write`、`Preview` | 分頁文字。 |
| `label-submit`、`label-empty` | `Comment`、`Nothing to preview` | 送出按鈕文字、預覽空白時的提示。 |
| `hint` | `Ctrl + Enter` | 按鈕左邊的小字；寫成空字串可隱藏。 |
| `required` | `true` | 內容空白時送出按鈕不可按，Ctrl + Enter 會讓輸入框外框變紅。 |
| `clear` | `true` | 送出後清空；清空可用復原找回。 |
| `tab` | `write` | 初始分頁。 |
| `disabled` | 無 | 停用輸入與全部按鈕。 |
| `autofocus`、`spellcheck` | 無、`true` | 載入後聚焦；拼字檢查。 |
| `width`、`font-size` | 填滿、`1rem` | 最大寬度（純數字視為 px）；字級（純數字視為 rem）。 |
| `accent`、`bg`、`panel`、`border-color` | `key`、`background`、`rgb(36,36,36)`、`bg-alternative` | 聚焦與提及的顏色、輸入區底色、外層底色、框線顏色。 |
| `text-color`、`active-color`、`muted-color`、`tool-color` | `shell`、`vanilla`、`gray`、`gray` | 一般文字、使用中分頁與標題、提示文字、工具圖示。 |
| `link-color`、`code-color`、`error-color`、`submit-color` | `blue`、`pink`、`red`、`green` | 預覽中的連結、行內程式碼、錯誤外框、送出按鈕。 |

## 事件與方法

事件都會冒泡。

| 名稱 | 說明 |
| --- | --- |
| `md-submit` | 送出時觸發。`detail = { markdown, value, html, text, name, charts }`：`value` 與 `markdown` 相同；`html` 是轉好的 HTML；`text` 是去掉格式的純文字；`charts` 是 `chart` 區塊解析出的資料陣列。 |
| `md-change` | 內容改變時觸發，`detail = { markdown, value }`。 |
| `md-tab` | 切換分頁時觸發，`detail = { tab }`。 |
| `el.value`、`el.html`、`el.text` | 讀取目前內容（`value` 可寫入）。 |
| `el.submit()`、`el.clear()`、`el.focus()` | 送出、清空、聚焦。 |
| `el.setTab('preview')`、`el.tab` | 切換或讀取分頁。 |
| `el.insert(text)`、`el.undo()`、`el.redo()` | 在游標處插入文字、復原、重做。 |
| `MdEditor.render(markdown)` | 全域函式，把 Markdown 轉成安全的 HTML。 |

## 支援的 Markdown

標題（`#` 到 `######`）、粗體、斜體、刪除線、行內程式碼、程式碼區塊（三個反引號，可標語言）、引用、巢狀的項目與編號清單、核取清單（`- [ ]`、`- [x]`）、連結、圖片、分隔線、自動連結，以及 `@名稱`、`#編號` 的標色。換行會直接變成換行。不支援表格。

**圖表區塊。** 標記為 `chart` 的程式碼區塊會轉成 `<ui-chart>`（需另外載入 [`ui-charts.js`](../charts/README.md)）。設定列用 `鍵: 值`，其餘每行是「標籤: 數值, 數值」的資料列；沒有任何資料列時，原樣當一般程式碼區塊。設定列可用的鍵：`type`、`title`、`series`、`unit`、`prefix`、`decimals`、`legend`、`y-min`、`y-max`、`y-step`、`grid`、`show-values`、`show-percent`、`x-title`、`y-title`、`hole`、`start-angle`、`center`、`height`、`vary`、`markers`、`sort`、`theme`、`ramp`、`normalize`、`bar-gap`。

````
```chart
type: column
title: Visitors (thousands)
series: Local, Overseas
2020: 48, 21
2021: 51, 44
```
````

安全：原始輸入先全部跳脫，使用者輸入的 HTML 標籤只會顯示成文字；連結與圖片只接受 `http`、`https`、`mailto`、`#`、相對路徑，`javascript:` 等網址不會變成連結。

## 快捷鍵與編輯行為

- Ctrl / Cmd + B 粗體、I 斜體、K 連結、Z 復原、Y（或 Shift + Z）重做、Enter 送出。
- 工具按鈕作用在選取範圍：粗體、斜體、行內程式碼再按一次會取消；標題、引用與三種清單依行加上或移除前綴，切換不同清單會自動換掉前綴。
- 選取多行再按程式碼，會包成程式碼區塊；連結會把選取文字放進 `[]`，並選取 `url` 讓你直接取代。
- 在清單項目按 Enter 會接續下一項，編號自動加一；空項目再按一次就結束清單。
- 連續輸入 700 毫秒內合併成一次復原，工具列的動作各算一次。

## 授權

MIT License

Copyright (c) 2026 studyadvice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
