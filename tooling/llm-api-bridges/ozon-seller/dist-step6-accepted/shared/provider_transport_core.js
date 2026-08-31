(() => {
  "use strict";
  function fail(code, message) {
    const error = new Error(message);
    error.code = code;
    throw error;
  }

  function headerValue(headers, name) {
    if (!headers) return null;
    if (typeof headers.get === "function") return headers.get(name);
    const target = String(name).toLowerCase();
    for (const [key, value] of Object.entries(headers)) {
      if (String(key).toLowerCase() === target) return String(value);
    }
    return null;
  }

  function safeResponseMeta(response) {
    return Object.freeze({
      content_type: headerValue(response?.headers, "content-type"),
      content_length: headerValue(response?.headers, "content-length"),
      request_id: headerValue(response?.headers, "x-request-id") || headerValue(response?.headers, "request-id"),
      retry_after: headerValue(response?.headers, "retry-after")
    });
  }

  function normalizedContentType(value) {
    return String(value || "").split(";", 1)[0].trim().toLowerCase();
  }

  function bytesToBase64(bytes) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let out = "";
    for (let index = 0; index < source.length; index += 3) {
      const a = source[index];
      const b = index + 1 < source.length ? source[index + 1] : 0;
      const c = index + 2 < source.length ? source[index + 2] : 0;
      const triple = (a << 16) | (b << 8) | c;
      out += alphabet[(triple >> 18) & 63];
      out += alphabet[(triple >> 12) & 63];
      out += index + 1 < source.length ? alphabet[(triple >> 6) & 63] : "=";
      out += index + 2 < source.length ? alphabet[triple & 63] : "=";
    }
    return out;
  }

  async function readResponse(response, { preserveBytes = false } = {}) {
    if (!response) fail("EMPTY_RESPONSE", "Provider response отсутствует.");
    const decoder = new TextDecoder();
    if (response.body && typeof response.body.getReader === "function") {
      const reader = response.body.getReader();
      const chunks = [];
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const bytes = value instanceof Uint8Array ? value : new Uint8Array(value || []);
        total += bytes.byteLength;
        chunks.push(bytes);
      }
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return preserveBytes
        ? Object.freeze({ rawText: "", bytes: merged, byteLength: total })
        : Object.freeze({ rawText: decoder.decode(merged), byteLength: total });
    }
    if (preserveBytes && typeof response.arrayBuffer === "function") {
      const merged = new Uint8Array(await response.arrayBuffer());
      return Object.freeze({ rawText: "", bytes: merged, byteLength: merged.byteLength });
    }
    const rawText = typeof response.text === "function" ? await response.text() : String(response.body ?? "");
    const encoded = new TextEncoder().encode(rawText);
    return preserveBytes
      ? Object.freeze({ rawText: "", bytes: encoded, byteLength: encoded.byteLength })
      : Object.freeze({ rawText, byteLength: encoded.byteLength });
  }

  async function executeJsonOnce({ fetchImpl, request, now = () => Date.now() }) {
    if (typeof fetchImpl !== "function") fail("FETCH_IMPL_MISSING", "fetchImpl обязателен.");
    if (!request || typeof request !== "object") fail("INVALID_REQUEST", "Trusted request object обязателен.");
    if (!/^https:\/\/api-seller\.ozon\.ru\//.test(String(request.url || ""))) fail("UNTRUSTED_REQUEST_HOST", "Разрешён только fixed Ozon Seller API host.");
    if (!/^(GET|POST)$/.test(String(request.method || ""))) fail("UNTRUSTED_REQUEST_METHOD", "Разрешены только заранее зафиксированные GET/POST read methods.");

    const started = now();
    let response;
    try {
      response = await fetchImpl(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.method === "GET" ? undefined : request.body
      });
    } catch (error) {
      const wrapped = new Error(String(error?.message || error || "Provider fetch failed"));
      wrapped.code = "PROVIDER_FETCH_FAILED";
      wrapped.external_request_executed = true;
      wrapped.request_attempted = true;
      throw wrapped;
    }

    const binarySuccess = Boolean(response.ok) && String(request.response_style || "json") === "binary";
    const received = await readResponse(response, { preserveBytes: binarySuccess });
    let parsed = null;
    let rawText = received.rawText || "";
    if (binarySuccess) {
      const expected = Array.isArray(request.response_content_types)
        ? request.response_content_types.map(normalizedContentType).filter(Boolean)
        : [];
      const actual = normalizedContentType(headerValue(response?.headers, "content-type"));
      if (expected.length && actual && !expected.includes(actual)) {
        const error = new Error(`Ozon Seller API вернул неожиданный binary content-type: ${actual}.`);
        error.code = "PROVIDER_BINARY_CONTENT_TYPE_MISMATCH";
        error.http_status = Number(response.status || 0);
        error.external_request_executed = true;
        throw error;
      }
      parsed = Object.freeze({
        content_type: actual || expected[0] || "application/octet-stream",
        byte_length: received.byteLength,
        encoding: "base64",
        file_content_base64: bytesToBase64(received.bytes)
      });
    } else if (rawText.trim()) {
      try { parsed = JSON.parse(rawText); }
      catch (_) { parsed = null; }
    }
    return Object.freeze({
      httpStatus: Number(response.status || 0),
      ok: Boolean(response.ok),
      rawText,
      parsed,
      byteLength: received.byteLength,
      elapsedMs: Math.max(0, Number(now() - started) || 0),
      responseMeta: safeResponseMeta(response)
    });
  }

  async function executePerformanceJsonOnce({ fetchImpl, request, now = () => Date.now() }) {
    if (typeof fetchImpl !== "function") fail("FETCH_IMPL_MISSING", "fetchImpl обязателен.");
    if (!request || typeof request !== "object") fail("INVALID_REQUEST", "Trusted request object обязателен.");
    if (!/^https:\/\/api-performance\.ozon\.ru\//.test(String(request.url || ""))) fail("UNTRUSTED_REQUEST_HOST", "Разрешён только fixed Ozon Performance API host.");
    if (!/^(GET|POST)$/.test(String(request.method || ""))) fail("UNTRUSTED_REQUEST_METHOD", "Performance bridge допускает только заранее зафиксированные GET/POST read/auth methods.");

    const started = now();
    let response;
    try {
      response = await fetchImpl(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.method === "GET" ? undefined : request.body
      });
    } catch (error) {
      const wrapped = new Error(String(error?.message || error || "Provider fetch failed"));
      wrapped.code = "PROVIDER_FETCH_FAILED";
      wrapped.external_request_executed = true;
      wrapped.request_attempted = true;
      throw wrapped;
    }

    const binarySuccess = Boolean(response.ok) && String(request.response_style || "json") === "binary";
    const received = await readResponse(response, { preserveBytes: binarySuccess });
    let parsed = null;
    let rawText = received.rawText || "";
    if (binarySuccess) {
      const expected = Array.isArray(request.response_content_types)
        ? request.response_content_types.map(normalizedContentType).filter(Boolean)
        : [];
      const actual = normalizedContentType(headerValue(response?.headers, "content-type"));
      if (expected.length && actual && !expected.includes(actual)) {
        const error = new Error(`Ozon Performance API вернул неожиданный binary content-type: ${actual}.`);
        error.code = "PROVIDER_BINARY_CONTENT_TYPE_MISMATCH";
        error.http_status = Number(response.status || 0);
        error.external_request_executed = true;
        throw error;
      }
      parsed = Object.freeze({
        content_type: actual || expected[0] || "application/octet-stream",
        byte_length: received.byteLength,
        encoding: "base64",
        file_content_base64: bytesToBase64(received.bytes)
      });
    } else if (rawText.trim()) {
      try { parsed = JSON.parse(rawText); }
      catch (_) { parsed = null; }
    }
    return Object.freeze({
      httpStatus: Number(response.status || 0),
      ok: Boolean(response.ok),
      rawText,
      parsed,
      byteLength: received.byteLength,
      elapsedMs: Math.max(0, Number(now() - started) || 0),
      responseMeta: safeResponseMeta(response)
    });
  }

  globalThis.ProviderTransportCore = Object.freeze({
    readResponse,
    executeJsonOnce,
    executePerformanceJsonOnce
  });
})();
