# ui-check

`<ui-check>` 是閱讀檢核點按鈕。放在課文段落裡，學生讀懂後按一下，按鈕就變成「已確認」。頁面有伺服器設定時，點擊會把紀錄送到後端；沒有設定時只在畫面上切換狀態，方便做範例頁。元件不使用 Shadow DOM，圖示使用 Bootstrap Icons。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-check.js` | `<ui-check>` | 閱讀檢核點按鈕，支援七種外觀與雙色漸層，可把點擊紀錄送到伺服器。 |

## 目錄

- [屬性：外觀](#屬性外觀)
- [屬性：紀錄](#屬性紀錄)
- [伺服器設定](#伺服器設定)
- [屬性解說](#屬性解說)
- [範例](#範例)
- [事件](#事件)

## 屬性：外觀

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `variant` | `outline`、`solid`、`soft`、`ghost`、`link`、`gradient`、`gradient-outline` | `outline` | 按鈕外觀。寫錯時退回 `outline`。 |
| `color` | 品牌色名 | `blue` | 主色。可用 `shell`、`vanilla`、`yellow`、`pink`、`red`、`orange`、`green`、`blue`、`indigo`、`violet`、`gray`。寫錯時退回預設色。 |
| `color2` | 品牌色名 | `violet` | 漸層的第二色，只在 `gradient`、`gradient-outline` 使用。 |
| `angle` | `90deg`、`135deg`、`to right` 等 | `135deg` | 漸層方向。 |
| `shape` | `rounded`、`pill`、`square` | `rounded` | 按鈕外形。 |
| `size` | `xs`、`sm`、`md`、`lg` | `xs` | 按鈕大小。 |
| `icon` | Bootstrap Icons 類別 | 無 | 文字前的圖示，需含 `bi-` 前綴，例如 `bi-question-circle`。 |

## 屬性：紀錄

| 屬性 | 值 | 說明 |
| --- | --- | --- |
| `key` | `a-z0-9_-` | 紀錄用的識別字，通常由伺服器寫入，不得以 `auto-` 開頭。有伺服器設定卻沒有 `key` 時，點擊會顯示錯誤。 |
| `state` | `done` | 由伺服器寫入，代表這位學員已經點過，直接顯示已確認。 |

## 伺服器設定

設定寫在任一祖先元素上，元件會往上尋找。

| 屬性 | 說明 |
| --- | --- |
| `data-cp-url` | 接收紀錄的網址。點擊時以 POST 送出 `key` 與 `_csrf`。 |
| `data-cp-token` | 一次性的 CSRF 憑證。伺服器回應中的 `token` 會自動換上，下一顆按鈕才能繼續送出。 |
| `data-cp-done-text` | 已確認時的文字，預設 `已確認`；設成空字串則只顯示勾。 |

伺服器應回傳 JSON：成功為 `{ "ok": true, "token": "新憑證" }`，失敗為 `{ "ok": false, "error": "錯誤訊息", "token": "新憑證" }`。

## 屬性解說

- **文字色自動選擇**：`solid`、`gradient` 與 `outline` 滑過時的文字色依底色亮度自動選擇；目前的品牌色都偏亮，因此一律使用深色字。
- **滑過效果**：`outline` 滑過時變成實心；`solid`、`gradient` 滑過時稍微變亮；`soft`、`ghost`、`gradient-outline` 滑過時加深底色；`link` 加粗底線。
- **已確認**：一律以綠色勾顯示，與原本的 `variant`、`color` 無關。滑鼠停在上面可以看到原本的按鈕文字。
- **舊色名**：`sky`、`ocean`、`info`、`lavender`、`warning`、`salmon`、`safe`、`teal`、`special`、`focus` 仍可使用，會對應到最接近的新品牌色，例如 `sky` 對應 `blue`、`safe` 對應 `green`。
- **即時更新**：外觀屬性與 `state` 改變時會立即重畫。
- **錯誤提示**：送出失敗時，在按鈕下方以 Bootstrap alert 顯示訊息，六秒後自動消失。
- **樣式範圍**：所有樣式都限定在 `ui-check` 內，class 以 `uck-` 開頭，不會影響其他元件。

## 範例

**基本用法**

```html
<p>
  Everything I need on a weekday sits within a ten-minute walk.
  <ui-check size="sm" icon="bi-question-circle">sits 的用法有把握嗎？</ui-check>
</p>
```

**各種外觀**

```html
<ui-check variant="solid" color="pink" size="sm">懂了嗎？</ui-check>
<ui-check variant="soft" color="yellow" size="sm" icon="bi-exclamation-triangle">這裡的時態有把握嗎？</ui-check>
<ui-check variant="ghost" color="green" size="sm">懂了嗎？</ui-check>
<ui-check variant="link" color="violet" size="sm">懂了嗎？</ui-check>
```

**雙色漸層**

```html
<ui-check variant="gradient" color="orange" color2="pink" shape="pill" size="md">這段我讀懂了</ui-check>
<ui-check variant="gradient" color="green" color2="yellow" angle="90deg" size="md">這段我讀懂了</ui-check>
<ui-check variant="gradient-outline" color="blue" color2="violet" shape="pill" size="md">這段我讀懂了</ui-check>
```

**接上伺服器**

```html
<article data-cp-url="/checkpoint/save.php" data-cp-token="（伺服器產生）" data-cp-done-text="讀懂了">
  <p>
    I've managed to stick to a daily workout routine for years, rain or shine.
    <ui-check key="lesson1-workout" variant="gradient" size="sm">這句的亮點都找到了嗎？</ui-check>
  </p>
  <p>
    The lack of space has never really bothered me.
    <ui-check key="lesson1-space" size="sm" state="done">這句懂了嗎？</ui-check>
  </p>
</article>
```

完整的互動範例、色票對照與組合產生器，見 `ui-check-demo-11-05-26.html`。

## 事件

| 事件 | `detail` | 觸發時機 |
| --- | --- | --- |
| `ui-check-done` | `{ key, local }` | 按鈕變成已確認時，會冒泡。`local` 為 `true` 表示沒有送到伺服器。 |

```js
document.addEventListener('ui-check-done', e => console.log(e.detail.key));
```
