/* global BB2ConversationIdentity, OzonAIAdapters, OzonAIDeliveryCapabilities, OzonWebFileAttachment, BB2ComposerSend */
(() => {
  "use strict";

  const RUNTIME_KEY = "__OZON_ATTACHMENT_DELIVERY_PORT_RUNTIME__";
  const PORT_NAME = "ozon-attachment-delivery-v1";
  const ARTIFACT_CHUNK_BYTES = 256 * 1024;
  const ATTACH_READY_TIMEOUT_MS = 60_000;
  const ATTACH_RECONCILE_TIMEOUT_MS = 30_000;
  const SEND_TARGET_TIMEOUT_MS = 30_000;
  const SEND_RECONCILE_TIMEOUT_MS = 120_000;
  const PORT_REQUEST_TIMEOUT_MS = 20_000;
  const RECOVERY_POLL_MS = 60_000;

  const prior = globalThis[RUNTIME_KEY];
  if (prior?.dispose) { try { prior.dispose(); } catch (_) {} }
  const runtime = {
    id: `attachment-port:${Date.now()}:${Math.random().toString(36).slice(2)}`,
    disposed: false,
    in_flight: new Set(),
    port: null,
    port_generation: 0,
    request_seq: 0,
    pending: new Map(),
    poll_timer: null,
    reconnect_timer: null,
    dispose: null
  };
  globalThis[RUNTIME_KEY] = runtime;

  function current() { return !runtime.disposed && globalThis[RUNTIME_KEY] === runtime; }
  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
  function normalizeText(value) { return String(value || "").replace(/\u00a0/g, " ").replace(/\r\n/g, "\n").trim().replace(/\s+/g, " "); }
  function adapter() { return OzonAIAdapters.adapterForLocation("auto"); }

  function aliceActiveHistoryConversationId() {
    const active = document.querySelector('button[data-testid="chatlist-item-active"][aria-current="page"]');
    const item = active?.closest?.('.ChatListItem[id]');
    return item instanceof Element ? String(item.id || "").trim().toLowerCase() || null : null;
  }

  function identity() {
    const active = adapter();
    if (!active) return { status: "unsupported", conversation_id: null, origin: location.origin.toLowerCase(), ai_id: null };
    const canonicalHref = document.querySelector('link[rel="canonical"][href]')?.href || "";
    const activeConversationId = active.id === "alice" ? aliceActiveHistoryConversationId() : null;
    const resolved = typeof BB2ConversationIdentity.resolveWithEvidence === "function"
      ? BB2ConversationIdentity.resolveWithEvidence({ origin: location.origin, pathname: location.pathname, canonicalHref, activeConversationId })
      : BB2ConversationIdentity.resolve({ origin: location.origin, pathname: location.pathname, canonicalHref });
    if (resolved.ai_id !== active.id) return { ...resolved, status: "adapter_mismatch", conversation_id: null };
    return resolved;
  }

  function conversationKey() {
    const here = identity();
    if (here.status !== "confirmed" || !here.conversation_id) return null;
    return `${String(here.origin || "").toLowerCase()}|${String(here.conversation_id).toLowerCase()}`;
  }

  function sameConversation(recovery) {
    const here = identity();
    return Boolean(here.status === "confirmed" && here.conversation_id &&
      String(here.origin || "").toLowerCase() === String(recovery?.origin || "").toLowerCase() &&
      String(here.conversation_id).toLowerCase() === String(recovery?.conversation_id || "").toLowerCase() &&
      conversationKey() === String(recovery?.conversation_key || "").toLowerCase());
  }

  function status(message, tone = "info", timeout = 7000) {
    let root = document.getElementById("ozon-attachment-delivery-status");
    if (!(root instanceof HTMLElement)) {
      root = document.createElement("div");
      root.id = "ozon-attachment-delivery-status";
      Object.assign(root.style, { position: "fixed", right: "18px", top: "82px", zIndex: "2147483646", maxWidth: "460px", whiteSpace: "pre-wrap", padding: "10px 12px", borderRadius: "10px", font: "13px/1.4 system-ui, sans-serif", boxShadow: "0 8px 24px rgba(15,23,42,.18)", pointerEvents: "none" });
      document.documentElement.appendChild(root);
    }
    root.textContent = String(message || "");
    root.style.background = tone === "error" ? "#fee2e2" : tone === "success" ? "#dcfce7" : "#e0f2fe";
    root.style.color = tone === "error" ? "#7f1d1d" : "#0f172a";
    if (timeout > 0) setTimeout(() => { if (root?.isConnected && root.textContent === String(message || "")) root.remove(); }, timeout);
  }

  function failPending(code, error) {
    for (const [requestId, record] of runtime.pending.entries()) {
      runtime.pending.delete(requestId);
      clearTimeout(record.timer);
      record.resolve({ ok: false, code, error });
    }
  }

  function scheduleReconnect() {
    if (!current() || runtime.reconnect_timer) return;
    runtime.reconnect_timer = setTimeout(() => {
      runtime.reconnect_timer = null;
      if (!current()) return;
      runtime.recoverCurrent = recoverCurrent;
  ensurePort();
      void recoverCurrent();
    }, 250);
  }

  function ensurePort() {
    if (!current()) return null;
    if (runtime.port) return runtime.port;
    let port;
    try { port = chrome.runtime.connect({ name: PORT_NAME }); }
    catch (error) {
      scheduleReconnect();
      return null;
    }
    const generation = ++runtime.port_generation;
    runtime.port = port;
    port.onMessage.addListener((message) => {
      if (!current() || generation !== runtime.port_generation || message?.kind !== "response") return;
      const requestId = String(message.request_id || "");
      const pending = runtime.pending.get(requestId);
      if (!pending) return;
      runtime.pending.delete(requestId);
      clearTimeout(pending.timer);
      pending.resolve(message.response || { ok: false, code: "ATTACHMENT_PORT_EMPTY_RESPONSE" });
    });
    port.onDisconnect.addListener(() => {
      if (generation !== runtime.port_generation) return;
      runtime.port = null;
      failPending("ATTACHMENT_PORT_DISCONNECTED", chrome.runtime.lastError?.message || "Attachment delivery port disconnected.");
      scheduleReconnect();
    });
    return port;
  }

  function request(type, payload = {}, timeoutMs = PORT_REQUEST_TIMEOUT_MS) {
    return new Promise((resolve) => {
      const port = ensurePort();
      if (!port) { resolve({ ok: false, code: "ATTACHMENT_PORT_UNAVAILABLE", error: "Attachment delivery port is unavailable." }); return; }
      const requestId = `${runtime.id}:${++runtime.request_seq}`;
      const timer = setTimeout(() => {
        if (!runtime.pending.has(requestId)) return;
        runtime.pending.delete(requestId);
        resolve({ ok: false, code: "ATTACHMENT_PORT_TIMEOUT", error: `Attachment port request timed out: ${type}` });
      }, timeoutMs);
      runtime.pending.set(requestId, { resolve, timer });
      try { port.postMessage({ request_id: requestId, type, ...payload }); }
      catch (error) {
        runtime.pending.delete(requestId);
        clearTimeout(timer);
        resolve({ ok: false, code: "ATTACHMENT_PORT_POST_FAILED", error: String(error?.message || error) });
      }
    });
  }

  function ownerPayload(recovery) {
    return { owner_kind: recovery.owner_kind, owner_id: recovery.owner_id, run_id: recovery.run_id || "", operation_id: recovery.operation_id || "", conversation_key: recovery.conversation_key, delivery_id: recovery.delivery_id };
  }

  function composerContext() { return adapter()?.composerContext?.() || null; }
  function composerText(context = composerContext()) {
    const active = adapter();
    return context?.composer && active?.readComposerText ? String(active.readComposerText(context.composer) || "") : "";
  }
  function setComposerText(context, value) {
    const active = adapter();
    if (!context?.composer || typeof active?.setComposerText !== "function") throw Object.assign(new Error("Target AI composer cannot be written by its adapter."), { code: "TARGET_AI_COMPOSER_UNAVAILABLE" });
    active.setComposerText(context.composer, String(value || ""));
  }

  function userTurnIds() {
    const active = adapter();
    return active ? active.userMessages().map((node) => active.messageId(node)).filter(Boolean) : [];
  }
  function assistantTurnIds() {
    const active = adapter();
    return active ? active.assistantMessages().map((node) => active.messageId(node)).filter(Boolean) : [];
  }

  async function waitForComposerAvailable(recovery) {
    while (current() && sameConversation(recovery)) {
      const context = composerContext();
      if (context && !normalizeText(composerText(context))) return context;
      const check = await request("OZ_ATTACHMENT_RECOVERY_GET", { conversation_key: recovery.conversation_key, ...ownerPayload(recovery) });
      if (!check?.recovery || check.recovery.delivery_id !== recovery.delivery_id) return null;
      status("Ozon: ожидаю свободное поле ввода перед безопасным прикреплением файла.", "info", 0);
      await sleep(500);
    }
    return null;
  }

  async function sha256Hex(bytes) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const digest = await crypto.subtle.digest("SHA-256", source);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function fetchArtifactBytes(recovery, descriptor) {
    const total = Number(descriptor.byte_length || 0);
    if (!Number.isFinite(total) || total < 0) throw Object.assign(new Error("Invalid attachment byte length."), { code: "ATTACHMENT_BYTE_LENGTH_INVALID" });
    const bytes = new Uint8Array(total);
    let offset = 0;
    while (offset < total) {
      const response = await request("OZ_ATTACHMENT_ARTIFACT_CHUNK", { ...ownerPayload(recovery), artifact_key: descriptor.artifact_key, offset, length: Math.min(ARTIFACT_CHUNK_BYTES, total - offset) });
      if (!response?.ok) throw Object.assign(new Error(response?.error || "Artifact chunk transfer failed."), { code: response?.code || "ATTACHMENT_CHUNK_FAILED" });
      if (Number(response.offset) !== offset || Number(response.total_byte_length) !== total) throw Object.assign(new Error("Artifact chunk metadata mismatch."), { code: "ATTACHMENT_CHUNK_METADATA_MISMATCH" });
      const chunk = OzonWebFileAttachment.base64ToBytes(response.chunk_base64 || "");
      if (!chunk.byteLength || chunk.byteLength !== Number(response.byte_length || 0) || offset + chunk.byteLength > total) throw Object.assign(new Error("Artifact chunk integrity mismatch."), { code: "ATTACHMENT_CHUNK_INTEGRITY_MISMATCH" });
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    if (await sha256Hex(bytes) !== String(descriptor.sha256 || "").toLowerCase()) throw Object.assign(new Error("Complete attachment SHA-256 mismatch."), { code: "ATTACHMENT_SHA256_MISMATCH" });
    return bytes;
  }

  async function buildFiles(recovery) {
    const metadata = await request("OZ_ATTACHMENT_ARTIFACT_META", ownerPayload(recovery));
    if (!metadata?.ok) throw Object.assign(new Error(metadata?.error || "Attachment metadata unavailable."), { code: metadata?.code || "ATTACHMENT_META_FAILED" });
    const descriptors = Array.isArray(metadata.descriptors) ? metadata.descriptors : [];
    if (!descriptors.length) throw Object.assign(new Error("Attachment delivery has no artifact descriptors."), { code: "ATTACHMENT_DESCRIPTORS_EMPTY" });
    const active = adapter();
    const profile = active?.deliveryCapabilities?.() || null;
    if (!profile || profile.attachment_strategy !== "file_input_v1") throw Object.assign(new Error("Target AI has no verified file-input attachment strategy in this build."), { code: "TARGET_AI_ATTACHMENT_ADAPTER_UNAVAILABLE" });
    const files = [];
    for (const descriptor of descriptors) {
      const support = OzonAIDeliveryCapabilities.supportsFile(active.id, descriptor);
      if (support.supported !== true) throw Object.assign(new Error(`Target AI cannot attach ${descriptor.filename}.`), { code: "TARGET_AI_FILE_TYPE_UNSUPPORTED" });
      const bytes = await fetchArtifactBytes(recovery, descriptor);
      if (bytes.byteLength !== Number(descriptor.byte_length || 0)) throw Object.assign(new Error("Complete attachment length mismatch."), { code: "ATTACHMENT_LENGTH_MISMATCH" });
      files.push(OzonWebFileAttachment.createFile(bytes, descriptor));
    }
    return { descriptors, files };
  }

  async function waitAttachmentReady(active, descriptors, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    while (current() && Date.now() < deadline) {
      if (active?.attachmentReady?.(descriptors)) return true;
      await sleep(250);
    }
    return false;
  }

  function stageMarker(recovery) {
    const context = composerContext();
    if (!context) throw Object.assign(new Error("Target AI composer disappeared before marker staging."), { code: "COMPOSER_NOT_FOUND" });
    const existing = normalizeText(composerText(context));
    const expected = normalizeText(recovery.outgoing_text || "");
    if (existing && existing !== expected) throw Object.assign(new Error("Composer contains unrelated user text; Bridge will not overwrite it."), { code: "COMPOSER_CONTAINS_OTHER_TEXT" });
    if (!existing) setComposerText(context, recovery.outgoing_text || "");
    return context;
  }

  function composerSendDeps(active) {
    return {
      resolveContext: () => active.composerContext?.() || null,
      resolveButton: (context) => active.sendButton?.(context) || null,
      candidateButtons: (context) => active.sendButtonCandidates?.(context) || [],
      visible: OzonAIAdapters.visible,
      readComposerText: (composer) => active.readComposerText?.(composer) || "",
      fingerprint: (button) => active.sendButtonFingerprint?.(button) || "",
      sleep
    };
  }

  function matchingNewUserTurn(baselineIds, recovery) {
    const active = adapter();
    if (!active) return null;
    const baseline = baselineIds instanceof Set ? baselineIds : new Set(baselineIds || []);
    const expected = normalizeText(recovery.outgoing_text || "");
    const token = String(recovery.delivery_id || "");
    for (const node of active.userMessages()) {
      const id = active.messageId(node);
      if (!id || baseline.has(id)) continue;
      const actual = normalizeText(active.messageText(node));
      if (expected && actual === expected) return id;
      if (token && actual.includes("OZON_BATCH_RESULT_V1") && actual.includes(token)) return id;
    }
    return null;
  }

  async function waitMatchingUserTurn(recovery, baselineIds, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    while (current() && sameConversation(recovery) && Date.now() < deadline) {
      const found = matchingNewUserTurn(baselineIds, recovery);
      if (found) return found;
      await sleep(250);
    }
    return null;
  }

  async function failDelivery(recovery, error) {
    const response = await request("OZ_ATTACHMENT_FAIL", { ...ownerPayload(recovery), code: String(error?.code || "ATTACHMENT_DELIVERY_FAILED"), error: String(error?.message || error || "Attachment delivery failed.") });
    status(`Ozon: доставка файла остановлена безопасно — ${error?.message || error}`, "error", 0);
    return response;
  }

  async function reconcileCommittedAttachment(recovery) {
    const active = adapter();
    const descriptors = Array.isArray(recovery.artifact_descriptors) ? recovery.artifact_descriptors : [];
    if (!active || !descriptors.length) throw Object.assign(new Error("Committed attachment has no adapter/descriptors for reconciliation."), { code: "ATTACHMENT_RECONCILIATION_DATA_MISSING" });
    const ready = await waitAttachmentReady(active, descriptors, ATTACH_RECONCILE_TIMEOUT_MS);
    if (!ready) throw Object.assign(new Error("Attachment commit survived but the existing attachment cannot be proven; automatic re-attach is forbidden."), { code: "ATTACH_OUTCOME_UNKNOWN_NO_RETRY" });
    stageMarker(recovery);
    const ack = await request("OZ_ATTACHMENT_READY", { ...ownerPayload(recovery), actor_id: recovery.attach_commit_actor_id || runtime.id, attached_filenames: descriptors.map((item) => item.filename), baseline_assistant_turn_ids: assistantTurnIds() });
    if (!ack?.ok) throw Object.assign(new Error(ack?.error || "Attachment reconciliation acknowledgement failed."), { code: ack?.code || "ATTACHMENT_READY_ACK_FAILED" });
    return ack.recovery;
  }

  async function attachClaimed(recovery) {
    const active = adapter();
    if (!active || active.id !== recovery.adapter_id) throw Object.assign(new Error("Target AI adapter changed before attachment delivery."), { code: "ATTACHMENT_ADAPTER_MISMATCH" });
    const context = await waitForComposerAvailable(recovery);
    if (!context) return null;
    const surfaceBeforeCommit = active.attachmentSurface?.();
    if (!surfaceBeforeCommit?.input) throw Object.assign(new Error("Target AI file-input attachment surface is unavailable."), { code: "TARGET_AI_ATTACHMENT_SURFACE_UNAVAILABLE" });
    const commit = await request("OZ_ATTACHMENT_COMMIT", { ...ownerPayload(recovery), actor_id: runtime.id });
    if (!commit?.ok) throw Object.assign(new Error(commit?.error || "Attachment commit failed."), { code: commit?.code || "ATTACHMENT_COMMIT_FAILED" });
    if (commit.attach_allowed !== true) {
      if (commit.already_attached && commit.recovery) return commit.recovery;
      throw Object.assign(new Error("Attachment outcome is already committed/unknown; automatic re-attach is forbidden."), { code: commit?.code || "ATTACH_OUTCOME_UNKNOWN_NO_RETRY" });
    }
    const committed = commit.recovery;
    const { descriptors, files } = await buildFiles(committed);
    if (!surfaceBeforeCommit.input.isConnected) throw Object.assign(new Error("Target AI attachment input detached after commit; automatic re-attach is forbidden."), { code: "ATTACH_OUTCOME_UNKNOWN_NO_RETRY" });
    OzonWebFileAttachment.setInputFiles(surfaceBeforeCommit.input, files);
    const ready = await waitAttachmentReady(active, descriptors, ATTACH_READY_TIMEOUT_MS);
    if (!ready) throw Object.assign(new Error("Target AI did not confirm attachment-ready state within the bounded wait."), { code: "ATTACH_OUTCOME_UNKNOWN_NO_RETRY" });
    stageMarker(committed);
    const acknowledged = await request("OZ_ATTACHMENT_READY", { ...ownerPayload(committed), actor_id: runtime.id, attached_filenames: descriptors.map((item) => item.filename), baseline_assistant_turn_ids: assistantTurnIds() });
    if (!acknowledged?.ok || acknowledged.ready !== true) throw Object.assign(new Error(acknowledged?.error || "Worker did not accept attachment-ready state."), { code: acknowledged?.code || "ATTACHMENT_READY_ACK_FAILED" });
    return acknowledged.recovery;
  }

  async function reconcileSendCommitted(recovery) {
    const baseline = new Set(recovery.baseline_user_turn_ids || []);
    const userTurnId = await waitMatchingUserTurn(recovery, baseline, SEND_RECONCILE_TIMEOUT_MS);
    if (!userTurnId) throw Object.assign(new Error("Send was committed but no matching user-turn could be proven; automatic resend is forbidden."), { code: "ATTACHMENT_SEND_OUTCOME_UNKNOWN_NO_RETRY" });
    const confirmation = await request("OZ_ATTACHMENT_CONFIRM", { ...ownerPayload(recovery), confirmed_user_turn_id: userTurnId, assistant_baseline_ids: assistantTurnIds() });
    if (!confirmation?.ok || confirmation.confirmed !== true) throw Object.assign(new Error(confirmation?.error || "Attachment delivery confirmation failed."), { code: confirmation?.code || "ATTACHMENT_CONFIRM_FAILED" });
    status("Ozon: полный файл доставлен автоматически и подтверждён.", "success", 7000);
    return { ok: true, confirmed: true, user_turn_id: userTurnId };
  }

  async function sendReadyAttachment(recovery) {
    const active = adapter();
    if (!active || active.id !== recovery.adapter_id) throw Object.assign(new Error("Target AI adapter changed before attachment Send."), { code: "ATTACHMENT_ADAPTER_MISMATCH" });
    stageMarker(recovery);
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const target = await BB2ComposerSend.waitForValidatedTarget({ expectedText: recovery.outgoing_text || "", timeoutMs: SEND_TARGET_TIMEOUT_MS, sampleIntervalMs: 200, requiredStableSamples: 3, deps: composerSendDeps(active) });
      if (!target) { lastError = Object.assign(new Error("Target AI Send control did not become stable for the attached delivery."), { code: "ATTACHMENT_SEND_TARGET_UNAVAILABLE" }); continue; }
      const baseline = userTurnIds();
      const commit = await request("OZ_ATTACHMENT_SEND_COMMIT", { ...ownerPayload(recovery), actor_id: runtime.id, baseline_user_turn_ids: baseline });
      if (!commit?.ok) throw Object.assign(new Error(commit?.error || "Attachment Send commit failed."), { code: commit?.code || "ATTACHMENT_SEND_COMMIT_FAILED" });
      const committedRecovery = commit.recovery || recovery;
      if (commit.click_allowed !== true) return await reconcileSendCommitted(committedRecovery);
      try {
        BB2ComposerSend.clickSynchronously({ target, expectedText: recovery.outgoing_text || "", deps: composerSendDeps(active) });
        return await reconcileSendCommitted(committedRecovery);
      } catch (error) {
        lastError = error;
        if (error?.click_event_observed === false) {
          const rollback = await request("OZ_ATTACHMENT_SEND_ROLLBACK", { ...ownerPayload(committedRecovery), actor_id: runtime.id, click_event_observed: false });
          if (rollback?.ok && rollback.rolled_back === true) { recovery = rollback.recovery || recovery; await sleep(250 * (attempt + 1)); continue; }
        }
        return await reconcileSendCommitted(committedRecovery);
      }
    }
    throw lastError || Object.assign(new Error("Attachment Send control remained unavailable."), { code: "ATTACHMENT_SEND_TARGET_UNAVAILABLE" });
  }

  async function processRecovery(initial) {
    if (!initial || initial.delivery_mode !== "attachment_watch_v1" || !sameConversation(initial)) return { ok: false, code: "ATTACHMENT_RECOVERY_CONTEXT_MISMATCH" };
    const key = `${initial.owner_kind}:${initial.owner_id}:${initial.delivery_id}`;
    if (runtime.in_flight.has(key)) return { ok: true, deduplicated: true };
    runtime.in_flight.add(key);
    let recovery = initial;
    try {
      for (;;) {
        if (!current() || !sameConversation(recovery)) return { ok: false, code: "ATTACHMENT_RUNTIME_CONTEXT_CHANGED" };
        switch (String(recovery.delivery_phase || "")) {
          case "attachment_claimed":
            status("Ozon: готовлю полный документ для автоматической доставки…", "info", 0);
            recovery = await attachClaimed(recovery);
            if (!recovery) return { ok: true, cancelled: true };
            continue;
          case "attachment_committed":
            status("Ozon: проверяю уже committed прикрепление без повторной загрузки…", "info", 0);
            recovery = await reconcileCommittedAttachment(recovery);
            continue;
          case "attachment_ready":
            status("Ozon: документ прикреплён; готовлю ровно один Send…", "info", 0);
            return await sendReadyAttachment(recovery);
          case "attachment_send_committed":
            status("Ozon: Send уже committed; только подтверждаю существующий user-turn, без повторной отправки…", "info", 0);
            return await reconcileSendCommitted(recovery);
          default:
            return { ok: false, code: "ATTACHMENT_PHASE_UNSUPPORTED" };
        }
      }
    } catch (error) {
      await failDelivery(recovery, error);
      return { ok: false, code: error?.code || "ATTACHMENT_DELIVERY_FAILED" };
    } finally {
      runtime.in_flight.delete(key);
    }
  }

  async function queryRecovery() {
    const key = conversationKey();
    if (!key) return null;
    const response = await request("OZ_ATTACHMENT_RECOVERY_GET", { conversation_key: key });
    return response?.ok ? response.recovery || null : null;
  }

  async function recoverCurrent() {
    if (!current()) return { ok: false, code: "ATTACHMENT_RUNTIME_DISPOSED" };
    const recovery = await queryRecovery();
    if (recovery) return await processRecovery(recovery);
    return { ok: true, recovery: null };
  }

  ensurePort();
  runtime.poll_timer = setInterval(() => { if (current()) void recoverCurrent(); }, RECOVERY_POLL_MS);
  setTimeout(() => { void recoverCurrent(); }, 250);

  runtime.dispose = () => {
    if (runtime.disposed) return;
    runtime.disposed = true;
    if (runtime.poll_timer) clearInterval(runtime.poll_timer);
    if (runtime.reconnect_timer) clearTimeout(runtime.reconnect_timer);
    runtime.poll_timer = null;
    runtime.reconnect_timer = null;
    failPending("ATTACHMENT_RUNTIME_DISPOSED", "Attachment content runtime disposed.");
    try { runtime.port?.disconnect?.(); } catch (_) {}
    runtime.port = null;
    const plate = document.getElementById("ozon-attachment-delivery-status");
    if (plate) plate.remove();
    try { if (globalThis[RUNTIME_KEY] === runtime) delete globalThis[RUNTIME_KEY]; } catch (_) {}
  };
})();
