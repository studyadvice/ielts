# ui-theme-switcher

`<ui-theme-switcher>` 是外觀切換按鈕。按下後展開選單，可以切換淺色、深色、跟隨系統三種模式，以及多組配色主題。選擇會存在 `localStorage`，下次開啟頁面時在繪製前就套用，避免閃爍。元件把主題輸出成一組語意化的 CSS 變數（例如 `--bg-base`、`--text-main`、`--accent`），頁面只要使用這些變數就能跟著切換。元件不使用 Shadow DOM。

| 檔案 | 標籤 | 用途 |
| --- | --- | --- |
| `ui-theme-switcher.js` | `<ui-theme-switcher>` | 亮暗模式與配色主題切換，輸出語意化 CSS 變數。 |

## 目錄

- [屬性](#屬性)
- [CSS 變數](#css-變數)
- [內建主題](#內建主題)
- [屬性解說](#屬性解說)
- [範例](#範例)
- [事件](#事件)
- [JavaScript API](#javascript-api)

## 屬性

| 屬性 | 值 | 預設 | 說明 |
| --- | --- | --- | --- |
| `label` | 文字 | `外觀` | 觸發按鈕文字。 |
| `placement` | `top`、`bottom` | `top` | 選單往上或往下展開。 |
| `align` | `start`、`end` | `start` | 選單靠左或靠右對齊按鈕。 |
| `storage-key` | 文字 | `ui-theme` | 儲存鍵名前綴，實際存成 `前綴-mode` 與 `前綴-color`。也可以在載入前設定 `window.UI_THEME_KEY`。 |

## CSS 變數

套用主題時，`<html>` 會帶上 `data-jstheme`（`light` 或 `dark`）、`data-color`（主題 id）與 Bootstrap 的 `data-bs-theme`，並提供下列變數：

| 變數 | 用途 |
| --- | --- |
| `--bg-base` | 整頁底色。 |
| `--bg-panel` | 卡片、側邊欄、浮層。 |
| `--bg-hover` | 懸停與選取底色。 |
| `--text-main` | 主要文字。 |
| `--text-muted` | 次要文字。 |
| `--border` | 邊框與分隔線。 |
| `--accent` | 主要強調色。 |
| `--accent-2` | 次要強調色。 |
| `--warning` | 警告與危險。 |
| `--safe` | 成功與安全。 |
| `--info` | 資訊。 |
| `--caution` | 注意。 |
| `--focus` | 焦點與高亮。 |
| `--on-color` | 實色底上的文字。 |

另外還有不隨主題改變的品牌色，以 `--brand-名稱` 輸出，例如 `--brand-lavender`、`--brand-sky`。

## 內建主題

| id | 名稱 |
| --- | --- |
| `shell` | Shell（預設） |
| `evernight` | Evernight |
| `everforest` | Everforest |
| `catppuccin` | Catppuccin |
| `gruvbox` | Gruvbox |
| `oled` | OLED |

每個主題都有深色與淺色兩組色值。

## 屬性解說

- **載入位置**：建議放在 `<head>` 最前面載入，頁面在繪製前就會套用已儲存的主題。
- **預設值**：第一次開啟時為深色模式、`shell` 主題。
- **跟隨系統**：模式為 `system` 時依作業系統的亮暗設定決定，系統切換時會即時跟著改變。
- **局部固定亮暗**：在某個容器上加 `data-jstheme="light"` 或 `dark`，這個容器內的變數會固定為該模式，不受整頁切換影響。
- **多個按鈕**：頁面上可以放多個 `<ui-theme-switcher>`，任一個切換時其他會同步更新。

## 範例

**放在頁首右側**

```html
<header style="display:flex;justify-content:space-between;align-items:center">
  <h1>IELTS 口說</h1>
  <ui-theme-switcher placement="bottom" align="end" label="外觀"></ui-theme-switcher>
</header>
```

**頁面使用主題變數**

```html
<style>
  body  { background: var(--bg-base); color: var(--text-main); }
  .card { background: var(--bg-panel); border: 1px solid var(--border); }
  .card:hover { background: var(--bg-hover); }
  .tag  { background: var(--accent); color: var(--on-color); }
  .hint { color: var(--brand-lavender); }
</style>
```

**局部固定為淺色**

```html
<div data-jstheme="light" style="background:var(--bg-panel);color:var(--text-main)">
  這個區塊永遠以淺色顯示。
</div>
```

**不同頁面分開記憶**

```html
<ui-theme-switcher storage-key="ielts-writing"></ui-theme-switcher>
```

## 事件

| 事件 | 發出位置 | `detail` | 觸發時機 |
| --- | --- | --- | --- |
| `ui-theme-change` | `document` | `{ mode, color, colorName, resolved }` | 模式或主題改變時；`resolved` 為實際套用的 `light` 或 `dark`。 |

```js
document.addEventListener('ui-theme-change', e => console.log(e.detail.resolved));
```

## JavaScript API

```js
UIThemeSwitcher.get();                              // { mode, color, colorName, resolved }
UIThemeSwitcher.set({ mode: 'light', color: 'gruvbox' });   // 切換並儲存
UIThemeSwitcher.register({                          // 註冊自訂主題
  id: 'ielts', name: 'IELTS',
  dark:  ['#0C0D0C', '#161816', '#232623', '#C6C7BD', '#86877F', '#3A3D3A', '#5DBAE8', '#B484E8', '#EF6661', '#71CD76', '#778CE1', '#F79C40', '#DBEDD8', '#0C0D0C'],
  light: ['#F3F4EE', '#FFFFFF', '#E4E6DC', '#1B1D1A', '#5C5F58', '#B9BCB0', '#1A7FA8', '#778CE1', '#C4182C', '#1E8449', '#2F5AA6', '#B87800', '#71CD76', '#FFFFFF']
});
UIThemeSwitcher.addBrand('mint', '#71CD76', '薄荷綠');  // 新增品牌色，輸出為 --brand-mint
UIThemeSwitcher.roles;    // 變數清單與用途，色碼陣列的順序以此為準
UIThemeSwitcher.themes;   // 所有主題
UIThemeSwitcher.brand;    // 品牌色
```
