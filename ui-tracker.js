/**
 * ui-tracker.js
 * AOP 行為追蹤元件 — 自動攔截語意標籤 <ui-*> 的點擊事件與頁面離開事件
 * 並將紀錄批次送往後端 API
 *
 * 使用方式：
 *   <ui-tracker
 *     api="/api/behavior-log"
 *     flush-interval="5000"
 *     batch-size="20"
 *     session-key="tracker_sid">
 *   </ui-tracker>
 *
 * 屬性說明：
 *   api            後端接收端點（預設 /api/behavior-log）
 *   flush-interval 自動批次送出間隔 ms（預設 5000）
 *   batch-size     累積幾筆就立即送出（預設 20）
 *   session-key    sessionStorage 的 key（預設 tracker_sid）
 *   debug          加上此屬性會在 console 輸出每筆紀錄
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────
     工具函式
  ───────────────────────────────────────── */

  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function nowISO() {
    return new Date().toISOString();
  }

  /** 取得元素最具意義的識別字串 */
  function describeTarget(el) {
    if (!el) return "unknown";
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : "";
    const label =
      el.getAttribute("label") ||
      el.getAttribute("aria-label") ||
      el.textContent.trim().slice(0, 40) ||
      "";
    const name = el.getAttribute("name") ? `[name=${el.getAttribute("name")}]` : "";
    return `${tag}${id}${name}${label ? ` "${label}"` : ""}`;
  }

  /** 爬 DOM 往上找最近的 <ui-*> 祖先（含自身） */
  function nearestUiComponent(el) {
    let node = el;
    while (node && node !== document.body) {
      if (node.tagName && node.tagName.toLowerCase().startsWith("ui-")) return node;
      node = node.parentElement;
    }
    return null;
  }

  /* ─────────────────────────────────────────
     Custom Element 定義
  ───────────────────────────────────────── */

  class UiTracker extends HTMLElement {
    constructor() {
      super();
      this._queue = [];
      this._flushTimer = null;
      this._session = null;
      this._pageStart = Date.now();
      this._boundClick = this._onDocClick.bind(this);
      this._boundBeforeUnload = this._onBeforeUnload.bind(this);
      this._boundVisibility = this._onVisibilityChange.bind(this);
    }

    connectedCallback() {
      this._initSession();
      this._attachListeners();
      this._startFlushTimer();
      if (this._debug) console.info("[ui-tracker] 已啟動，session:", this._session);
    }

    disconnectedCallback() {
      this._flushNow("component_removed");
      clearInterval(this._flushTimer);
      document.removeEventListener("click", this._boundClick, true);
      window.removeEventListener("beforeunload", this._boundBeforeUnload);
      document.removeEventListener("visibilitychange", this._boundVisibility);
    }

    /* ── 屬性 ── */
    get _api() { return this.getAttribute("api") || "/api/behavior-log"; }
    get _interval() { return parseInt(this.getAttribute("flush-interval") || "5000", 10); }
    get _batchSize() { return parseInt(this.getAttribute("batch-size") || "20", 10); }
    get _sessionKey() { return this.getAttribute("session-key") || "tracker_sid"; }
    get _debug() { return this.hasAttribute("debug"); }

    /* ── Session ── */
    _initSession() {
      let sid = sessionStorage.getItem(this._sessionKey);
      if (!sid) {
        sid = uuid();
        sessionStorage.setItem(this._sessionKey, sid);
      }
      this._session = sid;
    }

    /* ── 事件綁定 ── */
    _attachListeners() {
      // 點擊：capture 階段，確保在元件自身 handler 之前攔截
      document.addEventListener("click", this._boundClick, true);
      // 頁面離開
      window.addEventListener("beforeunload", this._boundBeforeUnload);
      // 切換至背景 (手機 / 換 Tab)
      document.addEventListener("visibilitychange", this._boundVisibility);
    }

    /* ── 點擊攔截 ── */
    _onDocClick(e) {
      const uiComp = nearestUiComponent(e.target);
      if (!uiComp) return; // 只追蹤 <ui-*> 內部的點擊

      const record = this._buildRecord("click", {
        component: uiComp.tagName.toLowerCase(),
        target: describeTarget(e.target),
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
        component_id: uiComp.id || null,
      });
      this._push(record);
    }

    /* ── 離開頁面 ── */
    _onBeforeUnload() {
      const record = this._buildRecord("page_leave", {
        duration_ms: Date.now() - this._pageStart,
        url: location.href,
      });
      this._push(record);
      this._flushSync(); // 同步送出，避免頁面已關閉
    }

    /* ── 切換至背景（行動裝置常見離開方式） ── */
    _onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        const record = this._buildRecord("page_hidden", {
          duration_ms: Date.now() - this._pageStart,
          url: location.href,
        });
        this._push(record);
        this._flushSync();
      }
    }

    /* ── 建立紀錄物件 ── */
    _buildRecord(action, payload = {}) {
      const record = {
        id: uuid(),
        session: this._session,
        action,
        page: location.pathname,
        ts: nowISO(),
        ua: navigator.userAgent,
        ...payload,
      };
      if (this._debug) console.log("[ui-tracker]", record);
      return record;
    }

    /* ── 加入佇列 ── */
    _push(record) {
      this._queue.push(record);
      if (this._queue.length >= this._batchSize) {
        this._flushNow("batch_full");
      }
    }

    /* ── 定時送出 ── */
    _startFlushTimer() {
      this._flushTimer = setInterval(() => {
        if (this._queue.length > 0) this._flushNow("interval");
      }, this._interval);
    }

    /* ── 非同步送出（fetch） ── */
    _flushNow(reason) {
      if (this._queue.length === 0) return;
      const batch = this._queue.splice(0);
      const body = JSON.stringify({ reason, events: batch });
      fetch(this._api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true, // 允許在頁面關閉後仍繼續送出
      }).catch((err) => {
        if (this._debug) console.warn("[ui-tracker] 送出失敗，重新排隊", err);
        // 送出失敗則放回佇列頭部
        this._queue.unshift(...batch);
      });
    }

    /* ── 同步送出（頁面離開用 sendBeacon） ── */
    _flushSync() {
      if (this._queue.length === 0) return;
      const batch = this._queue.splice(0);
      const body = JSON.stringify({ reason: "page_leave", events: batch });
      const ok = navigator.sendBeacon
        ? navigator.sendBeacon(this._api, new Blob([body], { type: "application/json" }))
        : false;

      if (!ok) {
        // sendBeacon 失敗時 fallback：同步 XHR（已棄用但仍有支援）
        try {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", this._api, false); // false = 同步
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.send(body);
        } catch (_) {/* 最後手段，靜默失敗 */}
      }
    }

    /* ── 公開方法：手動記錄自訂事件 ── */
    track(action, payload = {}) {
      const record = this._buildRecord(action, payload);
      this._push(record);
    }

    /* ── 公開方法：立即清空佇列 ── */
    flush() {
      this._flushNow("manual");
    }
  }

  customElements.define("ui-tracker", UiTracker);

  /* ─────────────────────────────────────────
     全域輔助：讓其他地方可以取得 tracker 實例
     用法：window.uiTracker.track("custom_action", { key: val })
  ───────────────────────────────────────── */
  Object.defineProperty(window, "uiTracker", {
    get() {
      return document.querySelector("ui-tracker") || null;
    },
  });
})();
