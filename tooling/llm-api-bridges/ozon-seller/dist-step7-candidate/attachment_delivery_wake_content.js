(() => {
  "use strict";

  const RUNTIME_KEY = "__OZON_ATTACHMENT_DELIVERY_PORT_RUNTIME__";

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== "OZ_ATTACHMENT_DELIVERY_WAKE") return false;
    const runtime = globalThis[RUNTIME_KEY];
    if (!runtime || runtime.disposed || typeof runtime.recoverCurrent !== "function") return false;
    queueMicrotask(() => {
      try { void runtime.recoverCurrent(); } catch (_) {}
    });
    return false;
  });
})();
