/* global OzonRuntime, BridgeAutorunModel, ProviderTransportCore, BB2ConversationIdentity, OzonAIDeliveryCapabilities */
(() => {
  "use strict";

  const KEYS = OzonRuntime.STORAGE_KEYS;
  const DB_NAME = "ozon_bridge_delivery_artifacts_v1";
  const DB_VERSION = 1;
  const STORE_NAME = "artifacts";
  const ARTIFACT_TTL_MS = 60 * 60 * 1000;
  const MAX_CHUNK_BYTES = 256 * 1024;
  const ATTACHMENT_MODE = "attachment_watch_v1";
  const PORT_NAME = "ozon-attachment-delivery-v1";
  const PHASES = BridgeAutorunModel.ATTACHMENT_PHASES;
  const ORIGINAL_TRANSPORT = ProviderTransportCore;
  let stateWriteLock = Promise.resolve();

  function nowIso() { return new Date().toISOString(); }
  function nowMs() { return Date.now(); }
  function normalizeKey(value) { return String(value || "").trim().toLowerCase(); }
  function asBytes(value) {
    if (value instanceof Uint8Array) return value;
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    return new Uint8Array(value || []);
  }
  function bufferCopy(bytes) { return asBytes(bytes).slice().buffer; }

  function withStateWrite(fn) {
    const next = stateWriteLock.then(fn, fn);
    stateWriteLock = next.catch(() => null);
    return next;
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      let request;
      try { request = indexedDB.open(DB_NAME, DB_VERSION); }
      catch (error) { reject(error); return; }
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "artifact_key" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB open failed"));
      request.onblocked = () => reject(new Error("IndexedDB open blocked"));
    });
  }

  async function idbRequest(mode, operation) {
    const db = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        let tx;
        let request;
        try {
          tx = db.transaction(STORE_NAME, mode);
          request = operation(tx.objectStore(STORE_NAME));
        } catch (error) { reject(error); return; }
        let requestSucceeded = false;
        let requestResult;
        let settled = false;
        const rejectOnce = (error) => { if (settled) return; settled = true; reject(error); };
        request.onsuccess = () => { requestSucceeded = true; requestResult = request.result; };
        request.onerror = () => rejectOnce(request.error || new Error("IndexedDB request failed"));
        tx.onabort = () => rejectOnce(tx.error || new Error("IndexedDB transaction aborted"));
        tx.oncomplete = () => {
          if (settled) return;
          if (!requestSucceeded) { rejectOnce(new Error("IndexedDB transaction completed before request success.")); return; }
          settled = true;
          resolve(requestResult);
        };
      });
    } finally {
      try { db.close(); } catch (_) {}
    }
  }

  function getArtifact(key) { return idbRequest("readonly", (store) => store.get(String(key))); }
  function putArtifact(record) { return idbRequest("readwrite", (store) => store.put(record)); }
  function deleteArtifact(key) { return idbRequest("readwrite", (store) => store.delete(String(key))); }
  function allArtifacts() { return idbRequest("readonly", (store) => store.getAll()); }

  async function cleanupExpiredArtifacts() {
    let records;
    try { records = await allArtifacts(); } catch (_) { return; }
    const current = nowMs();
    for (const record of records || []) {
      if (Number(record?.expires_at_ms || 0) > current) continue;
      try { await deleteArtifact(record.artifact_key); } catch (_) {}
    }
  }

  function headerValue(headers, name) {
    try { return headers?.get?.(name) || null; } catch (_) { return null; }
  }

  function sanitizeFilename(value, fallback = "ozon-report.bin") {
    const raw = String(value || "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/[\\/]/g, "_").trim();
    const clean = raw.replace(/^\.+/, "").replace(/\.{2,}/g, ".").slice(0, 180);
    return clean && clean !== "." && clean !== ".." ? clean : fallback;
  }

  function dispositionFilename(header) {
    const value = String(header || "");
    const encoded = value.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if (encoded) {
      try { return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, "")); } catch (_) {}
    }
    const plain = value.match(/filename\s*=\s*(?:"([^"]+)"|([^;]+))/i);
    return plain ? String(plain[1] || plain[2] || "").trim() : "";
  }

  function extensionForContentType(contentType) {
    const type = String(contentType || "").split(";", 1)[0].trim().toLowerCase();
    return ({
      "application/pdf": "pdf",
      "text/csv": "csv",
      "text/plain": "txt",
      "application/vnd.ms-excel": "xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
      "application/msword": "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
      "application/vnd.ms-powerpoint": "ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx"
    })[type] || "bin";
  }

  function safeFilenameForResponse(url, headers, contentType, fileRef = "") {
    const fallback = `ozon-report-${fileRef || "file"}.${extensionForContentType(contentType)}`;
    const fromDisposition = dispositionFilename(headerValue(headers, "content-disposition"));
    if (fromDisposition) return sanitizeFilename(fromDisposition, fallback);
    try {
      const base = decodeURIComponent(new URL(String(url || "")).pathname.split("/").filter(Boolean).pop() || "");
      if (base && /\.[A-Za-z0-9]{1,10}$/.test(base)) return sanitizeFilename(base, fallback);
    } catch (_) {}
    return sanitizeFilename(fallback);
  }

  async function sha256Hex(bytes) {
    const digest = await crypto.subtle.digest("SHA-256", asBytes(bytes));
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function bytesToBase64(bytes) {
    const source = asBytes(bytes);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let output = "";
    for (let index = 0; index < source.length; index += 3) {
      const a = source[index];
      const b = index + 1 < source.length ? source[index + 1] : 0;
      const c = index + 2 < source.length ? source[index + 2] : 0;
      const triple = (a << 16) | (b << 8) | c;
      output += alphabet[(triple >> 18) & 63];
      output += alphabet[(triple >> 12) & 63];
      output += index + 1 < source.length ? alphabet[(triple >> 6) & 63] : "=";
      output += index + 2 < source.length ? alphabet[triple & 63] : "=";
    }
    return output;
  }

  async function reportSessionState() {
    const data = await chrome.storage.session.get(KEYS.REPORT_FILE_SESSION_STATE);
    return data?.[KEYS.REPORT_FILE_SESSION_STATE] || null;
  }

  async function reportRefsForTrustedUrl(trustedUrl) {
    const state = await reportSessionState();
    const refs = [];
    for (const [ref, record] of Object.entries(state?.report_file_refs || {})) {
      if (!record || typeof record.url !== "string") continue;
      try {
        if (ORIGINAL_TRANSPORT.normalizeTrustedReportFileUrl(record.url) === trustedUrl) refs.push(ref);
      } catch (_) {}
    }
    return refs;
  }

  async function storeProviderArtifactForRef(fileRef, captured) {
    const bytes = asBytes(captured.bytes);
    const contentType = String(captured.content_type || "application/octet-stream").split(";", 1)[0].trim().toLowerCase() || "application/octet-stream";
    const filename = safeFilenameForResponse(captured.url, captured.headers, contentType, fileRef);
    const extension = OzonAIDeliveryCapabilities.extensionFromFilename(filename) || extensionForContentType(contentType);
    const created = nowMs();
    const record = {
      artifact_key: `provider:${fileRef}`,
      source_kind: "original_provider_file",
      filename,
      mime_type: contentType,
      extension,
      byte_length: bytes.byteLength,
      sha256: await sha256Hex(bytes),
      bytes: bufferCopy(bytes),
      created_at_ms: created,
      expires_at_ms: created + ARTIFACT_TTL_MS
    };
    await putArtifact(record);
    return record;
  }

  async function captureTrustedReportFileOnce(options = {}) {
    const fetchImpl = options.fetchImpl;
    const trustedUrl = ORIGINAL_TRANSPORT.normalizeTrustedReportFileUrl(options.url);
    let capturePromise = null;
    let fetchCalls = 0;
    const capturingFetch = async (...args) => {
      fetchCalls += 1;
      const response = await fetchImpl(...args);
      if (response?.ok && typeof response.clone === "function") {
        try {
          const clone = response.clone();
          const headers = response.headers;
          capturePromise = Promise.resolve(clone.arrayBuffer()).then((buffer) => ({
            url: trustedUrl,
            headers,
            content_type: headerValue(headers, "content-type") || "application/octet-stream",
            bytes: new Uint8Array(buffer)
          }));
        } catch (_) { capturePromise = null; }
      }
      return response;
    };

    const result = await ORIGINAL_TRANSPORT.executeTrustedReportFileOnce({ ...options, url: trustedUrl, fetchImpl: capturingFetch });
    if (fetchCalls !== 1) {
      const error = new Error(`Trusted report file transport performed ${fetchCalls} fetch calls; exactly one is required.`);
      error.code = "REPORT_FILE_FETCH_COUNT_MISMATCH";
      throw error;
    }
    if (result?.ok !== true || !capturePromise) return result;
    try {
      const captured = await capturePromise;
      if (Number(result.byteLength || 0) !== captured.bytes.byteLength) return result;
      const refs = await reportRefsForTrustedUrl(trustedUrl);
      for (const ref of refs) {
        try { await storeProviderArtifactForRef(ref, captured); } catch (_) {}
      }
    } catch (_) {}
    return result;
  }

  globalThis.ProviderTransportCore = Object.freeze({
    ...ORIGINAL_TRANSPORT,
    executeTrustedReportFileOnce: captureTrustedReportFileOnce
  });

  function ownerMapKey(kind) { return kind === "manual" ? KEYS.MANUAL_OPERATIONS : KEYS.AUTO_RUNS; }
  function ownerId(owner, kind) { return kind === "manual" ? String(owner?.operation_id || "") : String(owner?.run_id || ""); }

  async function readOwner(conversationKey, kind, expectedId = "") {
    const key = normalizeKey(conversationKey);
    const storageKey = ownerMapKey(kind);
    const data = await chrome.storage.local.get(storageKey);
    const owner = data?.[storageKey]?.[key] || null;
    if (!owner) return null;
    if (expectedId && ownerId(owner, kind) !== String(expectedId)) return null;
    return owner;
  }

  async function findAttachmentOwner(conversationKey, preferredKind = "", preferredId = "") {
    const key = normalizeKey(conversationKey);
    const kinds = preferredKind ? [preferredKind] : ["manual", "autorun"];
    for (const kind of kinds) {
      const owner = await readOwner(key, kind, preferredId);
      if (owner?.delivery?.mode === ATTACHMENT_MODE) return { kind, owner };
    }
    return null;
  }

  async function mutateOwner(conversationKey, kind, expectedId, mutator) {
    const key = normalizeKey(conversationKey);
    const storageKey = ownerMapKey(kind);
    return withStateWrite(async () => {
      const data = await chrome.storage.local.get(storageKey);
      const map = { ...(data?.[storageKey] || {}) };
      const current = map[key] || null;
      if (!current || ownerId(current, kind) !== String(expectedId || "")) return current;
      const next = await mutator(current);
      if (next) map[key] = { ...next, updated_at: nowIso() };
      else delete map[key];
      await chrome.storage.local.set({ [storageKey]: map });
      return next || null;
    });
  }

  function senderIdentity(sender) {
    const rawUrl = sender?.url || sender?.tab?.url || "";
    try {
      const parsed = new URL(rawUrl);
      return BB2ConversationIdentity.resolve({ origin: parsed.origin, pathname: parsed.pathname, canonicalHref: "" });
    } catch (_) { return null; }
  }

  function assertSenderOwner(sender, owner) {
    const senderTab = Number(sender?.tab?.id || 0);
    if (!Number.isInteger(senderTab) || senderTab <= 0 || senderTab !== Number(owner?.tab_id || 0)) {
      throw Object.assign(new Error("Attachment delivery request came from a non-owner tab."), { code: "ATTACHMENT_NON_OWNER_TAB" });
    }
    const identity = senderIdentity(sender);
    if (!identity || identity.status !== "confirmed" || normalizeKey(identity.origin) !== normalizeKey(owner.origin) || normalizeKey(identity.conversation_id) !== normalizeKey(owner.conversation_id)) {
      throw Object.assign(new Error("Attachment delivery request came from a different AI conversation."), { code: "ATTACHMENT_CONVERSATION_MISMATCH" });
    }
  }

  async function materializeInlineProviderArtifact(fileRef) {
    const state = await reportSessionState();
    const record = state?.report_file_refs?.[fileRef] || null;
    if (!record?.inline_base64) return null;
    const bytes = ORIGINAL_TRANSPORT.reportBase64ToBytes(record.inline_base64);
    const contentType = String(record.content_type || "application/pdf").split(";", 1)[0].trim().toLowerCase() || "application/pdf";
    const extension = extensionForContentType(contentType);
    const created = nowMs();
    const artifact = {
      artifact_key: `provider:${fileRef}`,
      source_kind: "original_provider_file",
      filename: sanitizeFilename(`ozon-report-${fileRef}.${extension}`),
      mime_type: contentType,
      extension,
      byte_length: bytes.byteLength,
      sha256: await sha256Hex(bytes),
      bytes: bufferCopy(bytes),
      created_at_ms: created,
      expires_at_ms: created + ARTIFACT_TTL_MS
    };
    await putArtifact(artifact);
    return artifact;
  }

  async function ensureGeneratedArtifact(delivery) {
    const meta = delivery?.generated_text_document;
    if (!meta) return null;
    const key = `generated:${String(meta.artifact_id || delivery.delivery_id || "")}`;
    const existing = await getArtifact(key);
    if (existing) return existing;
    const text = String(delivery.artifact_text || "");
    const bytes = new TextEncoder().encode(text);
    if (Number(meta.unicode_char_length || 0) !== OzonAIDeliveryCapabilities.unicodeLength(text) || Number(meta.byte_length || 0) !== bytes.byteLength) {
      throw Object.assign(new Error("Generated delivery artifact metadata does not match the complete result text."), { code: "GENERATED_ARTIFACT_INTEGRITY_MISMATCH" });
    }
    const created = nowMs();
    const artifact = {
      artifact_key: key,
      source_kind: "generated_bridge_text",
      filename: sanitizeFilename(meta.filename || `ozon-bridge-result-${delivery.delivery_id}.txt`),
      mime_type: "text/plain;charset=utf-8",
      extension: "txt",
      byte_length: bytes.byteLength,
      unicode_char_length: Number(meta.unicode_char_length || 0),
      sha256: await sha256Hex(bytes),
      bytes: bufferCopy(bytes),
      created_at_ms: created,
      expires_at_ms: created + ARTIFACT_TTL_MS
    };
    await putArtifact(artifact);
    return artifact;
  }

  function descriptorFromRecord(record) {
    return Object.freeze({
      artifact_key: String(record.artifact_key),
      source_kind: String(record.source_kind),
      filename: String(record.filename),
      mime_type: String(record.mime_type || "application/octet-stream"),
      extension: String(record.extension || ""),
      byte_length: Number(record.byte_length || 0),
      unicode_char_length: record.unicode_char_length === undefined ? null : Number(record.unicode_char_length || 0),
      sha256: String(record.sha256 || ""),
      complete: true
    });
  }

  async function ensureArtifactsForDelivery(delivery) {
    const artifacts = [];
    const generated = await ensureGeneratedArtifact(delivery);
    if (generated) artifacts.push(generated);
    for (const ref of Array.isArray(delivery?.provider_file_refs) ? delivery.provider_file_refs : []) {
      const key = `provider:${String(ref)}`;
      let artifact = await getArtifact(key);
      if (!artifact) artifact = await materializeInlineProviderArtifact(String(ref));
      if (!artifact) throw Object.assign(new Error("Original Ozon report bytes are unavailable for attachment; automatic re-download is forbidden."), { code: "REPORT_FILE_ARTIFACT_NOT_CAPTURED" });
      artifacts.push(artifact);
    }
    if (!artifacts.length) throw Object.assign(new Error("Attachment delivery has no file artifacts."), { code: "ATTACHMENT_ARTIFACTS_EMPTY" });
    return artifacts;
  }

  function adapterCanAttach(delivery, records) {
    const profile = OzonAIDeliveryCapabilities.profile(delivery?.adapter_id);
    const strategy = String(profile?.attachment_strategy || "");
    if (!profile || profile.status !== "implemented" || !["file_input_v1", "drag_drop_v1"].includes(strategy)) {
      throw Object.assign(new Error("Target AI attachment adapter is not implemented/live-profiled in this build."), { code: "TARGET_AI_ATTACHMENT_ADAPTER_UNAVAILABLE" });
    }
    if (profile.max_files_per_turn !== null && profile.max_files_per_turn !== undefined && Number.isFinite(Number(profile.max_files_per_turn)) && records.length > Number(profile.max_files_per_turn)) {
      throw Object.assign(new Error("Target AI does not allow this many files in one delivery turn."), { code: "TARGET_AI_FILE_COUNT_UNSUPPORTED" });
    }
    for (const record of records) {
      const support = OzonAIDeliveryCapabilities.supportsFile(delivery.adapter_id, record);
      if (support.supported !== true) throw Object.assign(new Error(`Target AI does not support original attachment type .${record.extension || "unknown"}.`), { code: "TARGET_AI_FILE_TYPE_UNSUPPORTED" });
    }
  }

  function markerForDelivery(delivery, records) {
    const generated = records.some((item) => item.source_kind === "generated_bridge_text");
    const providerCount = records.filter((item) => item.source_kind === "original_provider_file").length;
    const representation = generated && providerCount ? "ATTACHED_DOCUMENT_BUNDLE" : (generated ? "ATTACHED_COMPLETE_TEXT_DOCUMENT" : "ATTACHED_ORIGINAL_PROVIDER_FILE");
    return `OZON_BATCH_RESULT_V1\n${JSON.stringify({
      delivery_representation: representation,
      delivery_id: String(delivery.delivery_id || ""),
      complete: true,
      attachments: records.map((item) => ({ filename: item.filename, mime_type: item.mime_type, byte_length: Number(item.byte_length || 0), sha256: item.sha256, source_kind: item.source_kind }))
    })}`;
  }

  function recoveryPayload(kind, owner) {
    const delivery = owner?.delivery || {};
    return {
      type: "attachment_delivery",
      owner_kind: kind,
      owner_id: ownerId(owner, kind),
      run_id: kind === "autorun" ? String(owner.run_id || "") : "",
      operation_id: kind === "manual" ? String(owner.operation_id || "") : "",
      conversation_key: String(owner.conversation_key || ""),
      origin: String(owner.origin || "").toLowerCase(),
      conversation_id: String(owner.conversation_id || "").toLowerCase(),
      delivery_id: String(delivery.delivery_id || ""),
      delivery_mode: String(delivery.mode || ""),
      delivery_phase: String(delivery.phase || ""),
      adapter_id: String(delivery.adapter_id || ""),
      outgoing_text: String(delivery.outgoing_text || ""),
      artifact_descriptors: Array.isArray(delivery.artifact_descriptors) ? delivery.artifact_descriptors : [],
      attached_filenames: Array.isArray(delivery.attached_filenames) ? delivery.attached_filenames : [],
      baseline_user_turn_ids: Array.isArray(delivery.baseline_user_turn_ids) ? delivery.baseline_user_turn_ids : [],
      baseline_assistant_turn_ids: Array.isArray(delivery.baseline_assistant_turn_ids) ? delivery.baseline_assistant_turn_ids : [],
      attach_commit_actor_id: delivery.commit_actor_id || null,
      send_commit_actor_id: delivery.attachment_send_actor_id || null,
      send_committed_at: delivery.attachment_send_committed_at || null
    };
  }

  async function ownerForMessage(message, sender) {
    const key = normalizeKey(message.conversation_key);
    const preferredKind = String(message.owner_kind || "").toLowerCase();
    const preferredId = String(message.owner_id || message.run_id || message.operation_id || "");
    const found = await findAttachmentOwner(key, preferredKind, preferredId);
    if (!found) throw Object.assign(new Error("Attachment delivery owner not found."), { code: "ATTACHMENT_DELIVERY_NOT_FOUND" });
    assertSenderOwner(sender, found.owner);
    if (message.delivery_id && String(found.owner.delivery?.delivery_id || "") !== String(message.delivery_id)) throw Object.assign(new Error("Attachment delivery ID mismatch."), { code: "ATTACHMENT_DELIVERY_ID_MISMATCH" });
    return { key, ...found };
  }

  async function commitAttachment(message, sender) {
    const found = await ownerForMessage(message, sender);
    const phase = String(found.owner.delivery?.phase || "");
    if (phase === PHASES.ATTACH_COMMITTED) return { ok: true, committed: true, attach_allowed: false, outcome_unknown: true, code: "ATTACH_OUTCOME_UNKNOWN_NO_RETRY", recovery: recoveryPayload(found.kind, found.owner) };
    if ([PHASES.READY, PHASES.SEND_COMMITTED, PHASES.CONFIRMED].includes(phase)) return { ok: true, committed: true, attach_allowed: false, already_attached: true, recovery: recoveryPayload(found.kind, found.owner) };
    if (phase !== PHASES.CLAIMED) throw Object.assign(new Error("Attachment delivery is not claimable."), { code: "ATTACHMENT_DELIVERY_NOT_CLAIMED" });

    const records = await ensureArtifactsForDelivery(found.owner.delivery);
    adapterCanAttach(found.owner.delivery, records);
    const descriptors = records.map(descriptorFromRecord);
    const marker = markerForDelivery(found.owner.delivery, records);
    const actorId = String(message.actor_id || "").slice(0, 240);
    let granted = false;
    const next = await mutateOwner(found.key, found.kind, ownerId(found.owner, found.kind), (current) => {
      if (current?.delivery?.mode !== ATTACHMENT_MODE || current.delivery?.phase !== PHASES.CLAIMED) return current;
      granted = true;
      return {
        ...current,
        delivery: {
          ...current.delivery,
          phase: PHASES.ATTACH_COMMITTED,
          commit_actor_id: actorId || null,
          attachment_committed_at: nowIso(),
          artifact_descriptors: descriptors,
          artifact_text: null,
          outgoing_text: marker
        }
      };
    });
    if (!granted) return { ok: true, committed: true, attach_allowed: false, outcome_unknown: true, code: "ATTACH_OUTCOME_UNKNOWN_NO_RETRY", recovery: next ? recoveryPayload(found.kind, next) : null };
    return { ok: true, committed: true, attach_allowed: true, recovery: recoveryPayload(found.kind, next) };
  }

  async function markAttachmentReady(message, sender) {
    const found = await ownerForMessage(message, sender);
    const actorId = String(message.actor_id || "").slice(0, 240);
    if (found.owner.delivery?.phase === PHASES.READY) return { ok: true, ready: true, already_ready: true, recovery: recoveryPayload(found.kind, found.owner) };
    if (found.owner.delivery?.phase !== PHASES.ATTACH_COMMITTED) throw Object.assign(new Error("Attachment ready acknowledgement is not expected in this phase."), { code: "ATTACHMENT_READY_PHASE_MISMATCH" });
    if (found.owner.delivery?.commit_actor_id && actorId && found.owner.delivery.commit_actor_id !== actorId) throw Object.assign(new Error("Attachment ready acknowledgement came from another content runtime."), { code: "ATTACHMENT_ACTOR_MISMATCH" });
    const names = Array.isArray(message.attached_filenames) ? message.attached_filenames.map((value) => String(value).slice(0, 180)).filter(Boolean) : [];
    let ready = false;
    const next = await mutateOwner(found.key, found.kind, ownerId(found.owner, found.kind), (current) => {
      if (current?.delivery?.phase !== PHASES.ATTACH_COMMITTED) return current;
      ready = true;
      return { ...current, delivery: { ...current.delivery, phase: PHASES.READY, attached_filenames: names, baseline_assistant_turn_ids: Array.isArray(message.baseline_assistant_turn_ids) ? message.baseline_assistant_turn_ids.map(String).slice(0, 5000) : [], attachment_ready_at: nowIso() } };
    });
    if (!ready) throw Object.assign(new Error("Attachment state changed before ready acknowledgement."), { code: "ATTACHMENT_READY_RACE" });
    return { ok: true, ready: true, recovery: recoveryPayload(found.kind, next) };
  }

  async function commitAttachmentSend(message, sender) {
    const found = await ownerForMessage(message, sender);
    const actorId = String(message.actor_id || "").slice(0, 240);
    if (found.owner.delivery?.phase === PHASES.SEND_COMMITTED) return { ok: true, committed: true, click_allowed: false, already_committed: true, recovery: recoveryPayload(found.kind, found.owner) };
    if (found.owner.delivery?.phase !== PHASES.READY) throw Object.assign(new Error("Attachment delivery is not ready for Send commit."), { code: "ATTACHMENT_SEND_NOT_READY" });
    let granted = false;
    const next = await mutateOwner(found.key, found.kind, ownerId(found.owner, found.kind), (current) => {
      if (current?.delivery?.phase !== PHASES.READY) return current;
      granted = true;
      return { ...current, delivery: { ...current.delivery, phase: PHASES.SEND_COMMITTED, attachment_send_actor_id: actorId || null, attachment_send_committed_at: nowIso(), baseline_user_turn_ids: Array.isArray(message.baseline_user_turn_ids) ? message.baseline_user_turn_ids.map(String).slice(0, 5000) : [] } };
    });
    return { ok: true, committed: true, click_allowed: granted, recovery: next ? recoveryPayload(found.kind, next) : null };
  }

  async function rollbackAttachmentSend(message, sender) {
    const found = await ownerForMessage(message, sender);
    const actorId = String(message.actor_id || "").slice(0, 240);
    if (message.click_event_observed !== false) throw Object.assign(new Error("Send outcome may be observable; automatic rollback/retry is forbidden."), { code: "ATTACHMENT_SEND_OUTCOME_UNKNOWN_NO_RETRY" });
    if (found.owner.delivery?.phase !== PHASES.SEND_COMMITTED) return { ok: true, rolled_back: false, recovery: recoveryPayload(found.kind, found.owner) };
    if (found.owner.delivery?.attachment_send_actor_id && actorId && found.owner.delivery.attachment_send_actor_id !== actorId) throw Object.assign(new Error("Send rollback came from another content runtime."), { code: "ATTACHMENT_SEND_ACTOR_MISMATCH" });
    let rolledBack = false;
    const next = await mutateOwner(found.key, found.kind, ownerId(found.owner, found.kind), (current) => {
      if (current?.delivery?.phase !== PHASES.SEND_COMMITTED) return current;
      rolledBack = true;
      return { ...current, delivery: { ...current.delivery, phase: PHASES.READY, attachment_send_actor_id: null, attachment_send_committed_at: null, baseline_user_turn_ids: [] } };
    });
    return { ok: true, rolled_back: rolledBack, recovery: next ? recoveryPayload(found.kind, next) : null };
  }

  async function noteConfirmedPrefix(conversationKey, applied, deliveryId) {
    const key = normalizeKey(conversationKey);
    await withStateWrite(async () => {
      const data = await chrome.storage.local.get(KEYS.REPORT_PREFIXES);
      const map = { ...(data?.[KEYS.REPORT_PREFIXES] || {}) };
      const current = map[key] || null;
      if (!current) return;
      map[key] = BridgeAutorunModel.noteConfirmedPrefix(current, applied === true, deliveryId);
      await chrome.storage.local.set({ [KEYS.REPORT_PREFIXES]: map });
    });
  }

  async function cleanupDeliveryArtifacts(delivery) {
    for (const descriptor of Array.isArray(delivery?.artifact_descriptors) ? delivery.artifact_descriptors : []) {
      try { await deleteArtifact(descriptor.artifact_key); } catch (_) {}
    }
  }

  async function confirmAttachmentDelivery(message, sender) {
    const found = await ownerForMessage(message, sender);
    if (found.owner.delivery?.phase !== PHASES.SEND_COMMITTED) throw Object.assign(new Error("Attachment delivery can be confirmed only after Send commit."), { code: "ATTACHMENT_CONFIRM_PHASE_MISMATCH" });
    const deliveryId = String(found.owner.delivery.delivery_id || "");
    const prefixApplied = found.owner.delivery.report_prefix_applied === true;
    const preservedDelivery = found.owner.delivery;
    await noteConfirmedPrefix(found.key, prefixApplied, deliveryId);
    const confirmedUserTurnId = String(message.confirmed_user_turn_id || "").slice(0, 240) || null;
    const assistantBaselineIds = Array.isArray(message.assistant_baseline_ids) ? message.assistant_baseline_ids.map(String).slice(0, 5000) : [];
    let completed = false;
    const next = await mutateOwner(found.key, found.kind, ownerId(found.owner, found.kind), (current) => {
      if (current?.delivery?.phase !== PHASES.SEND_COMMITTED || current.delivery?.delivery_id !== deliveryId) return current;
      completed = true;
      if (found.kind === "manual") {
        return { ...current, status: "completed", delivery_confirmed: true, last_confirmed_delivery_id: deliveryId, last_confirmed_report_prefix_applied: prefixApplied, last_confirmed_user_turn_id: confirmedUserTurnId, batch: null, delivery: null, outgoing_text: null, request_worker_session_id: null, completed_at: nowIso(), last_error: null };
      }
      const confirmed = { ...current, delivery: { ...current.delivery, phase: PHASES.CONFIRMED, confirmed_at: nowIso(), confirmed_user_turn_id: confirmedUserTurnId } };
      const advanced = BridgeAutorunModel.afterConfirmedDelivery(confirmed);
      advanced.last_confirmed_delivery_id = deliveryId;
      advanced.last_confirmed_report_prefix_applied = prefixApplied;
      advanced.last_confirmed_user_turn_id = confirmedUserTurnId;
      advanced.delivery = null;
      if (advanced.status === BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND) {
        advanced.assistant_baseline_ids = assistantBaselineIds;
        advanced.watch_id = `watch-${crypto.randomUUID()}`;
      }
      return advanced;
    });
    if (!completed) throw Object.assign(new Error("Attachment delivery state changed before confirmation."), { code: "ATTACHMENT_CONFIRM_RACE" });
    await cleanupDeliveryArtifacts(preservedDelivery);
    if (found.kind === "autorun" && next?.status === BridgeAutorunModel.RUN_STATUSES.WAITING_COMMAND) {
      try { await chrome.tabs.sendMessage(Number(next.tab_id), { type: "OZ_AUTO_BEGIN_WATCH", run_id: next.run_id, conversation_key: next.conversation_key, origin: next.origin, conversation_id: next.conversation_id, watch_id: next.watch_id, assistant_baseline_ids: Array.isArray(next.assistant_baseline_ids) ? next.assistant_baseline_ids : [] }); } catch (_) {}
    }
    if (found.kind === "manual") {
      const modes = await chrome.storage.local.get(KEYS.MANUAL_MODES);
      const enabled = modes?.[KEYS.MANUAL_MODES]?.[found.key] === true;
      try { await chrome.tabs.sendMessage(Number(next?.tab_id || found.owner.tab_id), { type: "OZ_APPLY_MANUAL_MODE", enabled, conversation_key: found.key }); } catch (_) {}
    }
    return { ok: true, confirmed: true, owner_kind: found.kind };
  }

  async function failAttachmentDelivery(message, sender) {
    const found = await ownerForMessage(message, sender);
    const preservedDelivery = found.owner.delivery;
    const code = String(message.code || "ATTACHMENT_DELIVERY_FAILED").slice(0, 120);
    const text = String(message.error || "Attachment delivery failed.").slice(0, 800);
    const next = await mutateOwner(found.key, found.kind, ownerId(found.owner, found.kind), (current) => {
      if (!current?.delivery || current.delivery.mode !== ATTACHMENT_MODE) return current;
      if (found.kind === "manual") return { ...current, status: "failed", batch: null, delivery: null, outgoing_text: null, request_worker_session_id: null, completed_at: nowIso(), last_error: { code, message: text, at: nowIso(), recoverable: false } };
      return { ...current, status: BridgeAutorunModel.RUN_STATUSES.ERROR, batch: null, delivery: null, last_error: { code, message: text, at: nowIso(), recoverable: false } };
    });
    await cleanupDeliveryArtifacts(preservedDelivery);
    if (found.kind === "manual") {
      const modes = await chrome.storage.local.get(KEYS.MANUAL_MODES);
      const enabled = modes?.[KEYS.MANUAL_MODES]?.[found.key] === true;
      try { await chrome.tabs.sendMessage(Number(next?.tab_id || found.owner.tab_id), { type: "OZ_APPLY_MANUAL_MODE", enabled, conversation_key: found.key }); } catch (_) {}
    }
    return { ok: true, failed: true, code };
  }

  async function artifactMeta(message, sender) {
    const found = await ownerForMessage(message, sender);
    if (![PHASES.ATTACH_COMMITTED, PHASES.READY, PHASES.SEND_COMMITTED].includes(found.owner.delivery?.phase)) throw Object.assign(new Error("Artifact metadata is unavailable before attachment commit."), { code: "ATTACHMENT_ARTIFACT_META_PHASE_MISMATCH" });
    return { ok: true, descriptors: Array.isArray(found.owner.delivery.artifact_descriptors) ? found.owner.delivery.artifact_descriptors : [] };
  }

  async function artifactChunk(message, sender) {
    const found = await ownerForMessage(message, sender);
    const key = String(message.artifact_key || "");
    const descriptor = (found.owner.delivery?.artifact_descriptors || []).find((item) => item?.artifact_key === key);
    if (!descriptor) throw Object.assign(new Error("Requested artifact does not belong to this delivery."), { code: "ATTACHMENT_ARTIFACT_NOT_OWNED" });
    const record = await getArtifact(key);
    if (!record) throw Object.assign(new Error("Delivery artifact expired or is unavailable."), { code: "ATTACHMENT_ARTIFACT_MISSING" });
    const bytes = asBytes(record.bytes);
    const offset = Math.max(0, Math.trunc(Number(message.offset || 0)));
    const requested = Math.max(1, Math.min(MAX_CHUNK_BYTES, Math.trunc(Number(message.length || MAX_CHUNK_BYTES))));
    if (offset > bytes.byteLength) throw Object.assign(new Error("Artifact chunk offset is outside file bounds."), { code: "ATTACHMENT_CHUNK_RANGE_INVALID" });
    const chunk = bytes.slice(offset, Math.min(bytes.byteLength, offset + requested));
    return { ok: true, artifact_key: key, offset, byte_length: chunk.byteLength, total_byte_length: bytes.byteLength, eof: offset + chunk.byteLength >= bytes.byteLength, chunk_base64: bytesToBase64(chunk) };
  }

  async function cancelManualClaimedIfDisabled(conversationKey, operation) {
    if (!operation || operation.delivery?.mode !== ATTACHMENT_MODE || operation.delivery?.phase !== PHASES.CLAIMED) return false;
    const key = normalizeKey(conversationKey);
    const data = await chrome.storage.local.get(KEYS.MANUAL_MODES);
    if (data?.[KEYS.MANUAL_MODES]?.[key] === true) return false;
    await mutateOwner(key, "manual", operation.operation_id, () => null);
    return true;
  }

  async function handleRequest(message, sender) {
    switch (message.type) {
      case "OZ_ATTACHMENT_RECOVERY_GET": {
        const found = await findAttachmentOwner(message.conversation_key, String(message.owner_kind || ""), String(message.owner_id || ""));
        if (!found) return { ok: true, recovery: null };
        assertSenderOwner(sender, found.owner);
        if (found.kind === "manual" && await cancelManualClaimedIfDisabled(message.conversation_key, found.owner)) return { ok: true, recovery: null, cancelled: true };
        return { ok: true, recovery: recoveryPayload(found.kind, found.owner) };
      }
      case "OZ_ATTACHMENT_COMMIT": return await commitAttachment(message, sender);
      case "OZ_ATTACHMENT_READY": return await markAttachmentReady(message, sender);
      case "OZ_ATTACHMENT_SEND_COMMIT": return await commitAttachmentSend(message, sender);
      case "OZ_ATTACHMENT_SEND_ROLLBACK": return await rollbackAttachmentSend(message, sender);
      case "OZ_ATTACHMENT_CONFIRM": return await confirmAttachmentDelivery(message, sender);
      case "OZ_ATTACHMENT_FAIL": return await failAttachmentDelivery(message, sender);
      case "OZ_ATTACHMENT_ARTIFACT_META": return await artifactMeta(message, sender);
      case "OZ_ATTACHMENT_ARTIFACT_CHUNK": return await artifactChunk(message, sender);
      default: return { ok: false, code: "ATTACHMENT_PORT_MESSAGE_UNSUPPORTED" };
    }
  }

  chrome.runtime.onConnect.addListener((port) => {
    if (port?.name !== PORT_NAME) return;
    const sender = port.sender || null;
    port.onMessage.addListener((message) => {
      const requestId = String(message?.request_id || "");
      if (!requestId) return;
      Promise.resolve()
        .then(() => handleRequest(message || {}, sender))
        .then((response) => {
          try { port.postMessage({ kind: "response", request_id: requestId, response }); } catch (_) {}
        })
        .catch((error) => {
          try { port.postMessage({ kind: "response", request_id: requestId, response: { ok: false, code: error?.code || "ATTACHMENT_PORT_WORKER_ERROR", error: String(error?.message || error) } }); } catch (_) {}
        });
    });
  });

  setTimeout(() => { void cleanupExpiredArtifacts(); }, 0);

  globalThis.OzonFileDeliveryWorker = Object.freeze({
    DB_NAME,
    STORE_NAME,
    ATTACHMENT_MODE,
    PORT_NAME,
    MAX_CHUNK_BYTES,
    cleanupExpiredArtifacts
  });
})();
