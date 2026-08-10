(() => {
  "use strict";

  const DEFAULT_TIMEOUT_MS = 30_000;
  const DEFAULT_MAX_RESPONSE_BYTES = 4 * 1024 * 1024;

  function fail(code, message, extra = {}) {
    const error = new Error(message || code);
    error.code = code;
    Object.assign(error, extra);
    throw error;
  }

  function asciiHeaderSafe(value, name, { max = 8192 } = {}) {
    const text = String(value ?? "");
    if (text.length > max) fail("HEADER_TOO_LONG", `${name} слишком длинный.`);
    for (let i = 0; i < text.length; i += 1) {
      const c = text.charCodeAt(i);
      if (c < 0x20 || c > 0x7e) fail("INVALID_HEADER_VALUE", `${name} содержит недопустимый символ.`);
    }
    return text;
  }

  function sanitizeHeaders(headers) {
    const out = {};
    for (const [rawName, rawValue] of Object.entries(headers || {})) {
      const name = String(rawName || "").trim();
      if (!/^[A-Za-z0-9-]{1,80}$/.test(name)) fail("INVALID_HEADER_NAME", "Некорректное имя HTTP header.");
      out[name] = asciiHeaderSafe(rawValue, name);
    }
    return Object.freeze(out);
  }

  function responseHeader(response, name) {
    try { return response?.headers?.get?.(name) ?? null; } catch { return null; }
  }

  function parseRateLimitMetadata(response) {
    const names = [
      "retry-after", "x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-reset",
      "x-rate-limit-limit", "x-rate-limit-remaining", "x-rate-limit-reset"
    ];
    const out = {};
    for (const name of names) {
      const value = responseHeader(response, name);
      if (value !== null && value !== "") out[name] = String(value).slice(0, 500);
    }
    return Object.keys(out).length ? Object.freeze(out) : undefined;
  }

  async function readResponseBytes(response, maxBytes) {
    const declared = Number(responseHeader(response, "content-length") || 0);
    if (Number.isFinite(declared) && declared > maxBytes) fail("RESPONSE_TOO_LARGE", `Ответ ${declared} bytes превышает лимит ${maxBytes}.`, { httpStatus: Number(response?.status || 0) });

    if (response?.body?.getReader) {
      const reader = response.body.getReader();
      const chunks = [];
      let total = 0;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!value) continue;
          total += value.byteLength;
          if (total > maxBytes) {
            try { await reader.cancel(); } catch {}
            fail("RESPONSE_TOO_LARGE", `Ответ превышает лимит ${maxBytes} bytes.`, { httpStatus: Number(response?.status || 0) });
          }
          chunks.push(value);
        }
      } finally {
        try { reader.releaseLock?.(); } catch {}
      }
      const out = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.byteLength; }
      return out;
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > maxBytes) fail("RESPONSE_TOO_LARGE", `Ответ превышает лимит ${maxBytes} bytes.`, { httpStatus: Number(response?.status || 0) });
    return new Uint8Array(buffer);
  }

  function decodeUtf8(bytes) {
    try { return new TextDecoder("utf-8", { fatal: false }).decode(bytes); }
    catch { fail("RESPONSE_DECODE_FAILED", "Не удалось декодировать UTF-8 response."); }
  }

  function parseBody(bytes, expectedResponse, contentType) {
    if (expectedResponse === "BINARY") {
      return Object.freeze({ kind: "BINARY", bytes, byteLength: bytes.byteLength, contentType: String(contentType || "application/octet-stream") });
    }
    const rawText = decodeUtf8(bytes);
    let parsed = null;
    if (rawText.trim()) {
      try { parsed = JSON.parse(rawText); }
      catch { parsed = null; }
    }
    return Object.freeze({ kind: "JSON_OR_TEXT", rawText, parsed, byteLength: bytes.byteLength, contentType: String(contentType || "") });
  }

  async function executeOne(request, {
    fetchImpl = globalThis.fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxResponseBytes = DEFAULT_MAX_RESPONSE_BYTES,
    now = () => Date.now()
  } = {}) {
    if (typeof fetchImpl !== "function") fail("FETCH_UNAVAILABLE", "fetch недоступен.");
    if (!request || typeof request !== "object") fail("INVALID_REQUEST", "Request descriptor отсутствует.");
    const url = String(request.url || "");
    let parsedUrl;
    try { parsedUrl = new URL(url); } catch { fail("INVALID_URL", "Provider adapter сформировал некорректный URL."); }
    if (parsedUrl.protocol !== "https:") fail("HTTPS_REQUIRED", "Разрешён только HTTPS.");
    if (parsedUrl.username || parsedUrl.password) fail("URL_CREDENTIALS_FORBIDDEN", "Credentials в URL запрещены.");
    if (request.host && parsedUrl.host !== request.host) fail("HOST_MISMATCH", "Request host не совпадает с provider descriptor.");
    const method = String(request.method || "").toUpperCase();
    if (!['GET','POST'].includes(method)) fail("HTTP_METHOD_FORBIDDEN", `HTTP method ${method} не разрешён transport v1.`);
    const headers = sanitizeHeaders(request.headers);
    const timeout = Number(timeoutMs);
    if (!Number.isFinite(timeout) || timeout < 1 || timeout > 120_000) fail("INVALID_TIMEOUT", "Некорректный timeout.");
    const maxBytes = Number(maxResponseBytes);
    if (!Number.isInteger(maxBytes) || maxBytes < 1024 || maxBytes > 64 * 1024 * 1024) fail("INVALID_RESPONSE_LIMIT", "Некорректный response size limit.");

    const controller = new AbortController();
    const startedAt = now();
    const timer = setTimeout(() => controller.abort("timeout"), timeout);
    let response;
    try {
      const options = { method, headers, signal: controller.signal, redirect: "error", cache: "no-store", credentials: "omit" };
      if (method === "POST") options.body = JSON.stringify(request.body ?? {});
      // CRITICAL INVARIANT: exactly one invocation of fetchImpl. No retry loop here.
      response = await fetchImpl(url, options);
    } catch (error) {
      if (controller.signal.aborted) fail("REQUEST_TIMEOUT", `Provider request превысил timeout ${timeout} ms.`);
      fail("NETWORK_ERROR", String(error?.message || "Provider network error").slice(0, 1000));
    } finally {
      clearTimeout(timer);
    }

    const bytes = await readResponseBytes(response, maxBytes);
    const body = parseBody(bytes, request.response || "JSON", responseHeader(response, "content-type"));
    const elapsedMs = Math.max(0, Number(now()) - Number(startedAt));
    return Object.freeze({
      status: Number(response?.status || 0),
      ok: response?.ok === true,
      elapsedMs,
      rateLimit: parseRateLimitMetadata(response),
      body
    });
  }

  globalThis.LLMProviderTransport = Object.freeze({
    DEFAULT_TIMEOUT_MS,
    DEFAULT_MAX_RESPONSE_BYTES,
    executeOne,
    sanitizeHeaders,
    parseRateLimitMetadata
  });
})();
