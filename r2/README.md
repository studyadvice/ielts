# ui-reading2

閱讀輔助用的語意標籤元件組，只寫 HTML 標籤與屬性就能完成互動，不需要撰寫 JavaScript。

| 標籤 | 用途 |
|---|---|
| `<layer-switch>` | 分層標記：用按鈕切換文字中不同類別的標記，並顯示對應說明 |
| `<ui-spotlight>` | 聚光：點擊後其餘內容變暗，聚焦單一段落 |
| `<collocation-map>` | 搭配詞圖：錨點詞與多個搭配詞，滑過或點擊顯示例句 |
| `<cm-group>` | 搭配詞圖的排版容器，可提供共用內容區 |

與 `ui-drill`、`ui-steps`、`ui-cards` 遵守同一套屬性約定，可以互相嵌套，組出完整的課程頁面。

## 特色

- 純標籤操作，屬性只在載入時讀取一次，不提供事件與方法。
- 以自訂元素實作，放進其他元件的內容來源（`<template>` 或隱藏的 `div`）時會自動建立。
- 內容一律複製，同一份來源可被多個元件共用；找不到 id 時顯示警告框。
- 沒有指定 `target` 時，自動建立內建內容區。
- 沒有切換動畫；所有底色都是實色，不使用低透明度的 `rgba`。
- CSS 內含在 JavaScript 中，不使用 Shadow DOM。

## 快速開始

```html
<layer-switch title="句子結構" active="c1" panel-title="{label}" bordered>
  <ls-text>
    <ls-mark layer="c1" detail="note-c1">Like their peers,</ls-mark>
    <ls-mark layer="c2">adults</ls-mark> often report high levels of stress.
  </ls-text>
  <ls-layer name="c1" label="介系詞片語" source="tip-c1" color="blue"></ls-layer>
  <ls-layer name="c2" label="主詞" source="tip-c2" color="yellow"></ls-layer>
</layer-switch>

<template id="tip-c1"><p>介系詞片語當副詞，修飾整個主句。</p></template>
<template id="tip-c2"><p>主詞是 adults。</p></template>
<template id="note-c1"><p>Like 在這裡是介系詞，意思是「如同」。</p></template>
```

## 元件與屬性

數字型的尺寸屬性單位為 px，字體大小屬性單位為 rem；也可以直接填任何 CSS 值。顏色屬性可填配色名稱或色碼。

配色名稱：`shell`、`violet`、`blue`、`orange`、`green`、`vanilla`、`yellow`、`indigo`、`pink`、`red`、`gray`、`key`、`key-deep`、`calm`、`quiet`、`playful`、`urgent`。

### `<layer-switch>`

| 屬性 | 預設 | 說明 |
|---|---|---|
| `title` | 無 | 元件標題 |
| `active` | 無 | 初始啟動的層，並顯示其說明 |
| `multi` | 否 | 允許多層同時啟動 |
| `target` | 無 | 外部說明區塊的 id；不設時自動建立內建內容區 |
| `panel` | 自動 | 設 `none` 時不建立內建內容區 |
| `panel-title` | 無 | 內建內容區標題，可用 `{label}` |
| `placeholder` | 請點選按鈕。 | 內建內容區的提示 |
| `palette` | 預設色盤 | 逗號分隔，未設 `color` 的層依序取色 |
| `toggle-style` | `pill` | `pill`、`dot` |
| `toggle-position` | `top` | `top`、`bottom` |
| `mark-style` | `highlight` | `highlight`、`underline`、`box` |
| `dim` | `0.3` | 未啟動標記的透明度 |
| `body-dim` | 不使用 | 有層啟動時整段文字的透明度，例如 `0.85` |
| `detail-trigger` | `hover` | 標記 `detail` 的觸發方式：`hover`、`click` |
| `gap` | `8` | 按鈕間距 |
| `bordered` | 否 | 外框 |

`<ls-layer>`

| 屬性 | 說明 |
|---|---|
| `name` | 層的識別名稱，必填 |
| `label`、`icon`、`tooltip` | 按鈕文字、Bootstrap 圖示、滑鼠提示 |
| `color` | 層的顏色 |
| `source` | 啟動時顯示的說明內容 |
| `target` | 覆蓋容器的 `target` |
| `disabled` | 停用 |

`<ls-mark>`

| 屬性 | 說明 |
|---|---|
| `layer` | 所屬層，可用空白分隔多個，必填 |
| `detail` | 滑過或點擊時顯示的補充內容 |
| `tooltip` | 滑鼠提示 |
| `weight` | `normal`、`bold` |
| `size` | 字體大小 |

### `<ui-spotlight>`

| 屬性 | 預設 | 說明 |
|---|---|---|
| `color` | `focus` | 聚光框與提示圖示顏色 |
| `trigger` | `click` | `click`、`hover` |
| `active` | 否 | 載入後直接聚光 |
| `ring` | 是 | 寫 `ring="false"` 隱藏聚光框 |
| `ring-width`、`ring-style`、`ring-radius`、`ring-inset` | `2`、`solid`、`10`、`6` | 聚光框外觀 |
| `dim` | `0.15` | 其他聚光段落的透明度 |
| `dim-bg` | `0.82` | 遮罩透明度，最低 0.78 |
| `escape` | 是 | 按 Esc 關閉 |
| `hint` | 是 | 寫 `hint="false"` 隱藏提示圖示 |
| `hint-icon`、`hint-size` | `fullscreen`、`18` | 提示圖示與尺寸 |
| `padding` | 無 | 內距 |

### `<cm-group>`

| 屬性 | 預設 | 說明 |
|---|---|---|
| `title` | 無 | 群組標題 |
| `layout` | `row` | `row`、`column` |
| `gap` | `48`／`32` | 搭配詞圖間距 |
| `align`、`justify` | `center`、`flex-start` | 對齊 |
| `wrap` | 是 | 橫排時是否換行 |
| `target` | 無 | 群組內所有搭配詞圖共用的外部區塊 |
| `panel` | 自動 | 沒有 `target` 時自動建立共用內容區；設 `none` 關閉 |
| `panel-title`、`placeholder` | 無、請將滑鼠移到搭配詞上。 | 共用內容區標題與提示 |

### `<collocation-map>`

| 屬性 | 預設 | 說明 |
|---|---|---|
| `title` | 無 | 標題 |
| `anchor-side` | `left` | 錨點在左或右 |
| `anchor-align` | `center` | `center`、`start`、`end` |
| `palette` | 預設色盤 | 未設 `color` 的搭配詞依序取色 |
| `trigger` | `hover` | `hover`、`click`、`both` |
| `active-detail` | 無 | 初始鎖定的搭配詞 `detail` |
| `target` | 無 | 外部區塊；不設時使用群組或自己的內容區 |
| `panel-title`、`placeholder` | 無 | 自己的內容區標題與提示 |
| `dim` | `0.35` | 非目前搭配詞的透明度 |
| `dot-size`、`dot-gap` | `12`、`8` | 圓點 |
| `line-color`、`line-style`、`line-width`、`line-gap`、`line-overhang` | `shell`、`solid`、`2`、`18`、`16` | 分隔線 |
| `point-size`、`item-size` | `1.4`、`1` | 錨點、搭配詞字體大小 |
| `gap` | `16` | 搭配詞垂直間距 |

`<cm-point>`：`color`、`weight`、`size`。

`<cm-item>`：`color`、`detail`、`target`、`tooltip`、`disabled`。

內容去向的優先順序：搭配詞的 `target`，搭配詞圖的 `target`，群組的 `target`，群組的共用內容區，搭配詞圖自己的內容區。

## 組合範例

以下範例需要同時載入對應的元件檔案。

### 1. OneNote 式頁籤＋閱讀元件

每個頁籤的內容來源都是一個 `<template>`，裡面放閱讀元件，切換頁籤時自動建立。

```html
<ui-drill tile-shape="tab-trapezoid" icon-color="vanilla" bordered min-height="300"
  hide-empty-right active="k-read">
  <drill-tile source="k-read" label="課文分析" color="green" icon="book-half"></drill-tile>
  <drill-tile source="k-words" label="搭配詞" color="indigo" icon="diagram-3-fill"></drill-tile>
  <drill-tile source="k-focus" label="重點段落" color="orange" icon="bullseye"></drill-tile>
</ui-drill>

<template id="k-read">
  <layer-switch active="s" panel-title="{label}">
    <ls-text>
      <ls-mark layer="s">Many cities</ls-mark> <ls-mark layer="v">are investing</ls-mark>
      in <ls-mark layer="o">public transport</ls-mark>.
    </ls-text>
    <ls-layer name="s" label="主詞" source="k-s" color="yellow"></ls-layer>
    <ls-layer name="v" label="動詞" source="k-v" color="blue"></ls-layer>
    <ls-layer name="o" label="受詞" source="k-o" color="pink"></ls-layer>
  </layer-switch>
</template>

<template id="k-words">
  <cm-group panel-title="{label}">
    <collocation-map>
      <cm-point>invest</cm-point>
      <cm-item detail="ex-in">in</cm-item>
      <cm-item detail="ex-heavily">heavily</cm-item>
    </collocation-map>
  </cm-group>
</template>

<template id="k-focus">
  <ui-spotlight padding="12"><p>重點：invest in 後面接投資的對象。</p></ui-spotlight>
  <ui-spotlight padding="12" color="yellow"><p>延伸：investment 為名詞形式。</p></ui-spotlight>
</template>

<template id="k-s"><p>主詞是複數名詞 Many cities。</p></template>
<template id="k-v"><p>現在進行式，表示正在發生的趨勢。</p></template>
<template id="k-o"><p>public transport 是 invest in 的受詞。</p></template>
<template id="ex-in"><p>Cities are <b>investing in</b> cleaner buses.</p></template>
<template id="ex-heavily"><p>The company <b>invested heavily</b> in research.</p></template>
```

### 2. Outlook 式文章清單＋分層標記

左側選單元，上方是該單元的文章清單，點文章後下方顯示可切換文法層的課文。

```html
<ui-drill layout="stack" tile-cols="1" tile-size="44" tile-label="below" bordered
  height="520" stack-ratio="2,3" rightup-label="top" rightup-divider
  mid-title="{label}" right-title="{label}" tile-count="all" active="u1">
  <drill-tile source="u1" label="第一單元" icon="1-circle-fill">
    <rightup-item label="City Transport" meta="A2" detail="p1">公共運輸的投資趨勢</rightup-item>
    <rightup-item label="Online Learning" meta="B1" detail="p2">線上學習的成長</rightup-item>
  </drill-tile>
  <drill-tile source="u2" label="第二單元" icon="2-circle-fill">
    <rightup-item label="Caring Families" meta="B2" detail="p3">照顧家人的壓力</rightup-item>
  </drill-tile>
</ui-drill>

<template id="p1">
  <layer-switch mark-style="underline">
    <ls-text><ls-mark layer="n">Cities</ls-mark> <ls-mark layer="v">invest</ls-mark> in <ls-mark layer="n">buses</ls-mark>.</ls-text>
    <ls-layer name="n" label="名詞" color="blue"></ls-layer>
    <ls-layer name="v" label="動詞" color="orange"></ls-layer>
  </layer-switch>
</template>
<!-- p2、p3、u1、u2 寫法相同 -->
```

### 3. 課程步驟＋單字卡＋搭配詞圖

`ui-steps` 呈現上課流程，第二步是 `ui-cards` 單字卡，點卡片時在卡片下方的內容區出現搭配詞圖。

```html
<ui-steps current="2" numbered done-icon="check-lg" line arrows active="st-words"
  panel-title="{label}" bordered>
  <step-item label="暖身" source="st-warm"></step-item>
  <step-item label="單字" source="st-words"></step-item>
  <step-item label="閱讀" source="st-read"></step-item>
</ui-steps>

<template id="st-warm"><p>先說說你最近一次做決定的經驗。</p></template>
<template id="st-words">
  <ui-cards cols="3" panel-title="{label}" toggle>
    <card-item label="make" note="動詞" icon="hammer" color="yellow" detail="wc-make"></card-item>
    <card-item label="undermine" note="動詞" icon="arrow-down-circle" color="violet" detail="wc-under"></card-item>
  </ui-cards>
</template>
<template id="st-read">
  <ui-spotlight padding="12"><p>閱讀時，先找主詞和動詞。</p></ui-spotlight>
</template>

<template id="wc-make">
  <collocation-map>
    <cm-point>make</cm-point>
    <cm-item detail="ex-decision">a decision</cm-item>
    <cm-item detail="ex-effort">an effort</cm-item>
  </collocation-map>
</template>
<template id="wc-under">
  <collocation-map>
    <cm-point>undermine</cm-point>
    <cm-item detail="ex-trust">trust</cm-item>
  </collocation-map>
</template>
<template id="ex-decision"><p>We need to <b>make a decision</b> by Friday.</p></template>
<template id="ex-effort"><p>She <b>made an effort</b> to speak more slowly.</p></template>
<template id="ex-trust"><p>Repeated delays <b>undermined trust</b>.</p></template>
```

### 4. 三欄鑽取：課文在中欄，搭配詞在右欄

左側方塊選課文，中欄是分層標記；課文下方的按鈕帶 `detail`，在右欄打開搭配詞圖。

```html
<ui-drill columns="2,6,4" tile-cols="2" tile-size="44" tile-shape="rounded"
  bordered min-height="320" mid-title="{label}" right-title="搭配詞" arrows>
  <drill-tile source="lesson-a" label="Lesson A" icon="a-circle-fill"></drill-tile>
  <drill-tile source="lesson-b" label="Lesson B" icon="b-circle-fill"></drill-tile>
</ui-drill>

<template id="lesson-a">
  <layer-switch active="v" panel="none">
    <ls-text>The scandal <ls-mark layer="v">undermined</ls-mark> public <ls-mark layer="n">confidence</ls-mark>.</ls-text>
    <ls-layer name="v" label="動詞" color="blue"></ls-layer>
    <ls-layer name="n" label="名詞" color="pink"></ls-layer>
  </layer-switch>
  <button detail="map-undermine" color="violet">看 undermine 的搭配詞</button>
</template>

<template id="map-undermine">
  <collocation-map trigger="both" panel-title="{label}">
    <cm-point color="violet">undermine</cm-point>
    <cm-item detail="ex-trust">trust</cm-item>
    <cm-item detail="ex-confidence">confidence</cm-item>
  </collocation-map>
</template>
<template id="ex-confidence"><p>The scandal <b>undermined public confidence</b>.</p></template>
```

### 5. 單字卡牆，內容區在右側

卡片牆搭配右側固定的內容區，每張卡片打開一張搭配詞圖。

```html
<ui-cards title="本週單字" cols="3" card-style="filled" align="center" icon-size="2"
  panel="right" panel-columns="7,5" panel-title="{label}" placeholder="點選單字卡。">
  <card-item label="make" icon="hammer" color="yellow" detail="wc-make"></card-item>
  <card-item label="undermine" icon="arrow-down-circle" color="violet" detail="wc-under"></card-item>
  <card-item label="invest" icon="graph-up-arrow" color="green" detail="wc-invest"></card-item>
</ui-cards>
<!-- wc-make、wc-under 同範例 3 -->
```

### 6. 多個分層標記共用同一個外部區塊

用自己設計的區塊當說明面板，多段文字共用。

```html
<layer-switch target="shared-panel" toggle-style="dot" mark-style="box">
  <ls-text><ls-mark layer="a">First</ls-mark> sentence.</ls-text>
  <ls-layer name="a" label="重點" source="tip-a" color="orange"></ls-layer>
</layer-switch>

<layer-switch target="shared-panel" toggle-style="dot" mark-style="box">
  <ls-text><ls-mark layer="b">Second</ls-mark> sentence.</ls-text>
  <ls-layer name="b" label="重點" source="tip-b" color="green"></ls-layer>
</layer-switch>

<div id="shared-panel" class="my-panel"></div>
<template id="tip-a"><p>第一句的重點。</p></template>
<template id="tip-b"><p>第二句的重點。</p></template>
```

## 從 v1 升級

舊的寫法都還能使用，以下是建議改用的新名稱。

| v1 | v2 | 說明 |
|---|---|---|
| `theme` | `color` | 所有標籤 |
| `ls-layer info` | `tooltip` | |
| `ls-mark note="文字"` | `tooltip` | |
| `ls-mark note="#id"` | `detail` | |
| `cm-item note` | `detail` | |
| `hover-dim` | `dim` | `collocation-map` |
| `body-dim="true"`＋`body-dim-val` | `body-dim="0.55"` | |
| `default` | `active` | `default` 只套標記樣式，`active` 會同時顯示說明 |
| `<spotlight>` | `<ui-spotlight>` | 舊標籤會自動轉換 |
| `multi="true"` | `multi` | 布林屬性直接寫名稱即可 |
| `animate`、`transition` | 移除 | 不再有過渡動畫 |
| `UiReading2Config`、`CollocationMapConfig` | 移除 | 預設值改用屬性設定 |
| `UiReading2.init()` | 不需要 | 元件會自動建立；保留為相容用的空操作 |
