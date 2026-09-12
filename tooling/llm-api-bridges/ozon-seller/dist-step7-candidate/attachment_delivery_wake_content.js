(() => {
  "use strict";

  const RUNTIME_KEY = "__OZON_ATTACHMENT_DELIVERY_PORT_RUNTIME__";

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== "OZ_ATTACHMENT_DELIVERY_WAKE") return false;
    const runtime = globalThis[RUNTIME_KEY];
    if (!runtime || runtime.disposed || typeof runtime.recoverCurrent !== "function") return false;
    queueMicrotask(() => {
      try {
        void runtime.recoverCurrent({
          owner_kind: String(message.owner_kind || ""),
          owner_id: String(message.owner_id || ""),
          conversation_key: String(message.conversation_key || "").toLowerCase(),
          delivery_id: String(message.delivery_id || "")
        });
      } catch (_) {}
    });
    return false;
  });
})();
