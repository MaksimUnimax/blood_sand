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

  async function readResponse(response) {
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
      return Object.freeze({ rawText: decoder.decode(merged), byteLength: total });
    }
    const rawText = typeof response.text === "function" ? await response.text() : String(response.body ?? "");
    const byteLength = new TextEncoder().encode(rawText).byteLength;
    return Object.freeze({ rawText, byteLength });
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

    const received = await readResponse(response);
    let parsed = null;
    if (received.rawText.trim()) {
      try { parsed = JSON.parse(received.rawText); }
      catch (_) { parsed = null; }
    }
    return Object.freeze({
      httpStatus: Number(response.status || 0),
      ok: Boolean(response.ok),
      rawText: received.rawText,
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

    const received = await readResponse(response);
    let parsed = null;
    if (received.rawText.trim()) {
      try { parsed = JSON.parse(received.rawText); }
      catch (_) { parsed = null; }
    }
    return Object.freeze({
      httpStatus: Number(response.status || 0),
      ok: Boolean(response.ok),
      rawText: received.rawText,
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
