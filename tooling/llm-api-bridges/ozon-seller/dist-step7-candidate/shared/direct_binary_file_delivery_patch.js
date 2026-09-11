/* global OzonProvider, OzonOperationRegistry, ProviderTransportCore */
(() => {
  "use strict";

  const DB_NAME = "ozon_bridge_delivery_artifacts_v1";
  const DB_VERSION = 1;
  const STORE_NAME = "artifacts";
  const ARTIFACT_TTL_MS = 60 * 60 * 1000;
  const MAX_BYTES = 16 * 1024 * 1024;
  const ALLOWED_TYPES = new Set(["application/pdf", "image/png", "text/csv", "application/zip"]);
  const EXTENSION = Object.freeze({ "application/pdf": "pdf", "image/png": "png", "text/csv": "csv", "application/zip": "zip" });

  function fail(code, message) { const error = new Error(message); error.code = code; return error; }
  function contentType(value) { return String(value || "").split(";", 1)[0].trim().toLowerCase(); }
  function bytes(value) { return ProviderTransportCore.reportBase64ToBytes(String(value || "")); }
  function sanitizeToken(value) { return String(value || "").replace(/[^A-Za-z0-9_-]/g, ""); }
  function personal(operation) { return OzonOperationRegistry?.operation?.(operation)?.policy_group === "personal_data_read"; }
  function filename(operation, ref, type) { return `ozon-${String(operation || "direct-binary").replace(/[^A-Za-z0-9_-]/g, "_")}-${ref}.${EXTENSION[type] || "bin"}`.slice(0, 180); }

  function assertMagic(source, type) {
    if (!source.byteLength) throw fail("DIRECT_BINARY_EMPTY", "Ozon вернул пустой direct-binary документ.");
    if (type === "application/pdf") {
      const sig = [0x25, 0x50, 0x44, 0x46, 0x2d];
      if (!sig.every((value, index) => source[index] === value)) throw fail("DIRECT_BINARY_MAGIC_MISMATCH", "Direct-binary PDF не имеет сигнатуру %PDF-.");
      return;
    }
    if (type === "image/png") {
      const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
      if (!sig.every((value, index) => source[index] === value)) throw fail("DIRECT_BINARY_MAGIC_MISMATCH", "Direct-binary PNG не имеет корректную PNG сигнатуру.");
      return;
    }
    if (type === "application/zip") {
      const valid = source.byteLength >= 4 && source[0] === 0x50 && source[1] === 0x4b && ((source[2] === 0x03 && source[3] === 0x04) || (source[2] === 0x05 && source[3] === 0x06) || (source[2] === 0x07 && source[3] === 0x08));
      if (!valid) throw fail("DIRECT_BINARY_MAGIC_MISMATCH", "Direct-binary ZIP не имеет корректную ZIP сигнатуру.");
      return;
    }
    if (type === "text/csv") {
      let text;
      try { text = new TextDecoder("utf-8", { fatal: true }).decode(source); }
      catch (_) { throw fail("DIRECT_BINARY_TEXT_INVALID", "Direct-binary CSV не является корректным UTF-8 текстом."); }
      if (text.includes("\u0000")) throw fail("DIRECT_BINARY_TEXT_INVALID", "Direct-binary CSV содержит NUL bytes.");
      const trimmed = text.replace(/^\uFEFF/, "").trimStart();
      if (/^[\[{]/.test(trimmed)) {
        try { JSON.parse(trimmed); throw fail("DIRECT_BINARY_JSON_MASQUERADE", "Direct-binary CSV фактически содержит JSON payload."); }
        catch (error) { if (error?.code === "DIRECT_BINARY_JSON_MASQUERADE") throw error; }
      }
      return;
    }
    throw fail("DIRECT_BINARY_CONTENT_TYPE_UNSUPPORTED", `Direct-binary content-type ${type || "empty"} не поддерживается attachment lifecycle.`);
  }

  async function sha256Hex(source) {
    const digest = await crypto.subtle.digest("SHA-256", source);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      let request;
      try { request = indexedDB.open(DB_NAME, DB_VERSION); } catch (error) { reject(error); return; }
      request.onupgradeneeded = () => { const db = request.result; if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "artifact_key" }); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB open failed"));
      request.onblocked = () => reject(new Error("IndexedDB open blocked"));
    });
  }

  async function putArtifact(record) {
    const db = await openDb();
    try {
      await new Promise((resolve, reject) => {
        let tx; let request;
        try { tx = db.transaction(STORE_NAME, "readwrite"); request = tx.objectStore(STORE_NAME).put(record); }
        catch (error) { reject(error); return; }
        let requestSucceeded = false;
        let settled = false;
        const rejectOnce = (error) => { if (settled) return; settled = true; reject(error); };
        request.onsuccess = () => { requestSucceeded = true; };
        request.onerror = () => rejectOnce(request.error || new Error("IndexedDB artifact put failed"));
        tx.onabort = () => rejectOnce(tx.error || new Error("IndexedDB artifact transaction aborted"));
        tx.oncomplete = () => {
          if (settled) return;
          if (!requestSucceeded) { rejectOnce(new Error("IndexedDB artifact transaction completed before put request success.")); return; }
          settled = true;
          resolve();
        };
      });
    } finally { try { db.close(); } catch (_) {} }
  }

  function safeResultReport(reportText, safeResult) {
    const text = String(reportText || "");
    const newline = text.indexOf("\n");
    if (newline <= 0 || text.slice(0, newline).trim() !== "OZON_RESULT_V1") throw fail("DIRECT_BINARY_REPORT_ENVELOPE_INVALID", "Direct-binary result report не имеет канонический OZON_RESULT_V1 envelope.");
    let envelope;
    try { envelope = JSON.parse(text.slice(newline + 1)); }
    catch (_) { throw fail("DIRECT_BINARY_REPORT_ENVELOPE_INVALID", "Direct-binary result report JSON повреждён."); }
    envelope.result = safeResult;
    return `OZON_RESULT_V1\n${JSON.stringify(envelope, null, 2)}`;
  }

  function directBinaryMeta(operation) {
    const meta = OzonOperationRegistry?.operation?.(operation) || null;
    if (!meta || meta.response_style !== "binary" || meta.provider === "report_file") return null;
    const expected = Array.isArray(meta.response_content_types) ? meta.response_content_types.map(contentType).filter(Boolean) : [];
    return { expected };
  }

  function wrapProvider(baseProvider, { artifactWriter = putArtifact, uuid = () => crypto.randomUUID(), now = () => Date.now() } = {}) {
    if (!baseProvider || typeof baseProvider.executeCommandObject !== "function") throw fail("DIRECT_BINARY_BASE_PROVIDER_MISSING", "OzonProvider.executeCommandObject is required.");
    async function executeCommandObject(command, sellerCredentials, performanceCredentials = {}, options = {}) {
      const output = await baseProvider.executeCommandObject(command, sellerCredentials, performanceCredentials, options);
      const operation = String(output?.operation || command?.operation || "");
      const meta = directBinaryMeta(operation);
      if (!meta || output?.ok !== true || Number(output?.http_status || 0) < 200 || Number(output?.http_status || 0) >= 300) return output;
      const raw = output?.result && typeof output.result === "object" && !Array.isArray(output.result) ? output.result : null;
      if (!raw || raw.generated_file_ref || !raw.file_content_base64) return output;
      try {
        const type = contentType(raw.content_type);
        if (!ALLOWED_TYPES.has(type)) throw fail("DIRECT_BINARY_CONTENT_TYPE_UNSUPPORTED", `Direct-binary content-type ${type || "empty"} не поддерживается attachment lifecycle.`);
        if (meta.expected.length && !meta.expected.includes(type)) throw fail("DIRECT_BINARY_CONTENT_TYPE_MISMATCH", `Direct-binary content-type ${type} не соответствует operation contract.`);
        const source = bytes(raw.file_content_base64);
        const declared = Number(raw.byte_length);
        if (!Number.isInteger(declared) || declared !== source.byteLength) throw fail("DIRECT_BINARY_BYTE_LENGTH_MISMATCH", "Direct-binary byte_length не совпадает с provider bytes.");
        if (source.byteLength > MAX_BYTES) throw fail("DIRECT_BINARY_TOO_LARGE", `Direct-binary документ превышает hard cap ${MAX_BYTES} bytes.`);
        assertMagic(source, type);
        const ref = `rpf_${personal(operation) ? "p" : "s"}_${sanitizeToken(uuid())}`;
        const created = Number(now());
        const artifact = { artifact_key: `provider:${ref}`, source_kind: "original_provider_file", filename: filename(operation, ref, type), mime_type: type, extension: EXTENSION[type], byte_length: source.byteLength, sha256: await sha256Hex(source), bytes: source.slice().buffer, created_at_ms: created, expires_at_ms: created + ARTIFACT_TTL_MS };
        await artifactWriter(artifact);
        const safe = { ...raw };
        delete safe.file_content_base64; delete safe.encoding;
        safe.generated_file_ref = ref; safe.generated_file_inline = true; safe.generated_file_content_type = type; safe.generated_file_byte_length = source.byteLength; safe.format = EXTENSION[type];
        const result = Object.freeze(safe);
        return Object.freeze({ ...output, result, report_text: safeResultReport(output.report_text, result) });
      } catch (error) {
        error.external_request_executed = true;
        error.http_status = Number(output?.http_status || 0);
        error.response_meta = output?.response_meta || null;
        throw error;
      }
    }
    async function executeCommand(commandText, sellerCredentials, performanceCredentials = {}) {
      const command = globalThis.OzonContract.parseCommand(commandText);
      return executeCommandObject(command, sellerCredentials, performanceCredentials);
    }
    return Object.freeze({ ...baseProvider, executeCommandObject, executeCommand });
  }

  const wrapped = wrapProvider(globalThis.OzonProvider);
  globalThis.OzonProvider = wrapped;
  globalThis.OzonDirectBinaryDeliveryPatch = Object.freeze({ DB_NAME, STORE_NAME, MAX_BYTES, wrapProvider, assertMagic, safeResultReport });
})();
