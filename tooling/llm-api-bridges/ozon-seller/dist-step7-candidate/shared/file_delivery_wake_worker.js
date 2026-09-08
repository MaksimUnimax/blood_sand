/* global OzonRuntime */
(() => {
  "use strict";

  const KEYS = OzonRuntime.STORAGE_KEYS;
  const ATTACHMENT_MODE = "attachment_watch_v1";
  const pushed = new Map();

  function ownerId(owner, kind) {
    return kind === "manual" ? String(owner?.operation_id || "") : String(owner?.run_id || "");
  }

  async function pushOwner(kind, owner) {
    if (!owner?.tab_id || owner?.delivery?.mode !== ATTACHMENT_MODE) return;
    const id = ownerId(owner, kind);
    const signature = `${id}|${owner.delivery.delivery_id || ""}|${owner.delivery.phase || ""}`;
    const key = `${kind}:${id}`;
    if (pushed.get(key) === signature) return;
    pushed.set(key, signature);
    try {
      await chrome.tabs.sendMessage(Number(owner.tab_id), {
        type: "OZ_ATTACHMENT_DELIVERY_WAKE",
        owner_kind: kind,
        owner_id: id,
        conversation_key: String(owner.conversation_key || ""),
        delivery_id: String(owner.delivery.delivery_id || "")
      });
    } catch (_) {}
  }

  async function pushCurrent() {
    let data;
    try { data = await chrome.storage.local.get([KEYS.AUTO_RUNS, KEYS.MANUAL_OPERATIONS]); }
    catch (_) { return; }
    for (const owner of Object.values(data?.[KEYS.AUTO_RUNS] || {})) await pushOwner("autorun", owner);
    for (const owner of Object.values(data?.[KEYS.MANUAL_OPERATIONS] || {})) await pushOwner("manual", owner);
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (!changes[KEYS.AUTO_RUNS] && !changes[KEYS.MANUAL_OPERATIONS]) return;
    queueMicrotask(() => { void pushCurrent(); });
  });

  setTimeout(() => { void pushCurrent(); }, 0);

  globalThis.OzonFileDeliveryWakeWorker = Object.freeze({ ATTACHMENT_MODE });
})();
