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


  function normalizeTrustedReportFileUrl(rawUrl) {
    let parsed;
    try { parsed = new URL(String(rawUrl || "")); }
    catch (_) { fail("UNTRUSTED_REPORT_FILE_URL", "Report file URL от Ozon некорректен."); }
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) fail("UNTRUSTED_REPORT_FILE_URL", "Report file URL должен быть HTTPS без credentials/нестандартного порта.");
    const host = String(parsed.hostname || "").toLowerCase();
    const allowed = host === "ozone.ru" || host.endsWith(".ozone.ru") || host === "ozon.ru" || host.endsWith(".ozon.ru");
    if (!allowed) fail("UNTRUSTED_REPORT_FILE_HOST", `Неподдерживаемый Ozon report file host: ${host || "empty"}.`);
    return parsed.toString();
  }


  function reportXmlDecode(value) {
    return String(value || "")
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
      .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  }

  function reportXmlAttr(tag, name) {
    const escaped = String(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = String(tag || "").match(new RegExp(`(?:\\s|^)${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
    return match ? reportXmlDecode(match[1] ?? match[2] ?? "") : null;
  }

  function reportColumnIndex(cellRef) {
    const letters = String(cellRef || "").match(/^[A-Za-z]+/);
    if (!letters) return null;
    let value = 0;
    for (const ch of letters[0].toUpperCase()) value = value * 26 + (ch.charCodeAt(0) - 64);
    return value - 1;
  }

  function reportHeaders(values) {
    const seen = new Map();
    return values.map((value, index) => {
      let base = String(value ?? "").trim();
      if (!base) base = `column_${index + 1}`;
      const count = (seen.get(base) || 0) + 1;
      seen.set(base, count);
      return count === 1 ? base : `${base}_${count}`;
    });
  }

  function parseDelimitedReportText(rawText, { offset = 0, limit = 200, name = "Report" } = {}) {
    const text = String(rawText || "").replace(/^\uFEFF/, "");
    const firstLine = text.split(/\r?\n/, 1)[0] || "";
    const candidates = [";", ",", "\t"];
    let delimiter = ";";
    let best = -1;
    for (const candidate of candidates) {
      let count = 0, quoted = false;
      for (let i = 0; i < firstLine.length; i += 1) {
        const ch = firstLine[i];
        if (ch === '"') {
          if (quoted && firstLine[i + 1] === '"') i += 1;
          else quoted = !quoted;
        } else if (!quoted && ch === candidate) count += 1;
      }
      if (count > best) { best = count; delimiter = candidate; }
    }
    const parsedRows = [];
    let row = [], field = "", quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
        else if (ch === '"') quoted = false;
        else field += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === delimiter) { row.push(field); field = ""; }
      else if (ch === "\n") { row.push(field.replace(/\r$/, "")); parsedRows.push(row); row = []; field = ""; }
      else field += ch;
    }
    if (field.length || row.length) { row.push(field.replace(/\r$/, "")); parsedRows.push(row); }
    while (parsedRows.length && parsedRows[parsedRows.length - 1].every((v) => String(v).trim() === "")) parsedRows.pop();
    const headerIndex = parsedRows.findIndex((r) => r.some((v) => String(v).trim() !== ""));
    if (headerIndex < 0) return Object.freeze({ name, columns: [], row_count: 0, offset, limit, rows: [], has_more: false, next_offset: null });
    const columns = reportHeaders(parsedRows[headerIndex]);
    const data = parsedRows.slice(headerIndex + 1).filter((r) => r.some((v) => String(v).trim() !== ""));
    const boundedOffset = Math.min(offset, data.length);
    const selected = data.slice(boundedOffset, boundedOffset + limit).map((r) => {
      const out = Array(columns.length).fill("");
      for (let i = 0; i < Math.min(columns.length, r.length); i += 1) out[i] = r[i];
      return out;
    });
    const next = boundedOffset + selected.length;
    return Object.freeze({ name, columns, row_count: data.length, offset: boundedOffset, limit, rows: selected, has_more: next < data.length, next_offset: next < data.length ? next : null });
  }

  function zipView(bytes) { return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); }
  function zipU16(view, offset) { return view.getUint16(offset, true); }
  function zipU32(view, offset) { return view.getUint32(offset, true); }

  function createReportZipReader(bytes) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const view = zipView(source);
    let eocd = -1;
    const minimum = Math.max(0, source.length - 65557);
    for (let pos = source.length - 22; pos >= minimum; pos -= 1) {
      if (zipU32(view, pos) === 0x06054b50) { eocd = pos; break; }
    }
    if (eocd < 0) fail("REPORT_ZIP_INVALID", "ZIP/XLSX: EOCD не найден.");
    const total = zipU16(view, eocd + 10);
    const centralOffset = zipU32(view, eocd + 16);
    if (total === 0xffff || centralOffset === 0xffffffff) fail("REPORT_ZIP64_UNSUPPORTED", "ZIP64 отчёты пока не поддерживаются.");
    const entries = new Map();
    let pos = centralOffset;
    const decoder = new TextDecoder("utf-8");
    for (let index = 0; index < total; index += 1) {
      if (pos + 46 > source.length || zipU32(view, pos) !== 0x02014b50) fail("REPORT_ZIP_INVALID", "ZIP central directory повреждён.");
      const flags = zipU16(view, pos + 8);
      const method = zipU16(view, pos + 10);
      const compressedSize = zipU32(view, pos + 20);
      const uncompressedSize = zipU32(view, pos + 24);
      const nameLength = zipU16(view, pos + 28);
      const extraLength = zipU16(view, pos + 30);
      const commentLength = zipU16(view, pos + 32);
      const localOffset = zipU32(view, pos + 42);
      if ((flags & 1) !== 0) fail("REPORT_ZIP_ENCRYPTED_UNSUPPORTED", "Зашифрованный ZIP не поддерживается.");
      if ([compressedSize, uncompressedSize, localOffset].some((v) => v === 0xffffffff)) fail("REPORT_ZIP64_UNSUPPORTED", "ZIP64 отчёты пока не поддерживаются.");
      const nameStart = pos + 46;
      const name = decoder.decode(source.slice(nameStart, nameStart + nameLength));
      entries.set(name.replace(/\\/g, "/"), Object.freeze({ method, compressedSize, uncompressedSize, localOffset }));
      pos = nameStart + nameLength + extraLength + commentLength;
    }
    async function get(name) {
      const meta = entries.get(String(name || "").replace(/^\//, ""));
      if (!meta) return null;
      const local = meta.localOffset;
      if (local + 30 > source.length || zipU32(view, local) !== 0x04034b50) fail("REPORT_ZIP_INVALID", `ZIP local header повреждён: ${name}`);
      const nameLength = zipU16(view, local + 26);
      const extraLength = zipU16(view, local + 28);
      const dataStart = local + 30 + nameLength + extraLength;
      const compressed = source.slice(dataStart, dataStart + meta.compressedSize);
      if (meta.method === 0) return compressed;
      if (meta.method !== 8) fail("REPORT_ZIP_METHOD_UNSUPPORTED", `ZIP compression method ${meta.method} не поддерживается.`);
      if (typeof DecompressionStream !== "function") fail("REPORT_DEFLATE_UNAVAILABLE", "Runtime не поддерживает DecompressionStream(deflate-raw).");
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      const output = new Uint8Array(await new Response(stream).arrayBuffer());
      if (meta.uncompressedSize && output.byteLength !== meta.uncompressedSize) fail("REPORT_ZIP_SIZE_MISMATCH", `ZIP entry size mismatch: ${name}`);
      return output;
    }
    return Object.freeze({ names: Object.freeze([...entries.keys()]), get });
  }

  function reportJoinZipPath(base, target) {
    const parts = String(base || "").split("/").filter(Boolean);
    for (const piece of String(target || "").replace(/^\//, "").split("/")) {
      if (!piece || piece === ".") continue;
      if (piece === "..") parts.pop(); else parts.push(piece);
    }
    return parts.join("/");
  }

  function reportParseSharedStrings(xml) {
    const values = [];
    for (const match of String(xml || "").matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/gi)) {
      let value = "";
      for (const text of match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)) value += reportXmlDecode(text[1]);
      values.push(value);
    }
    return values;
  }

  function reportParseSheet(xml, sharedStrings, name, { offset = 0, limit = 200 } = {}) {
    const physicalRows = [];
    for (const rowMatch of String(xml || "").matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/gi)) {
      const rowNumber = Number(reportXmlAttr(rowMatch[1], "r")) || physicalRows.length + 1;
      const values = [];
      for (const cellMatch of rowMatch[2].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/gi)) {
        const attrs = cellMatch[1], body = cellMatch[2];
        const index = reportColumnIndex(reportXmlAttr(attrs, "r"));
        if (index === null) continue;
        const type = reportXmlAttr(attrs, "t") || "n";
        let raw = "";
        if (type === "inlineStr") {
          for (const text of body.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)) raw += reportXmlDecode(text[1]);
        } else {
          const valueMatch = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/i);
          raw = valueMatch ? reportXmlDecode(valueMatch[1]) : "";
        }
        let value = raw;
        if (type === "s") value = sharedStrings[Number(raw)] ?? raw;
        else if (type === "b") value = raw === "1";
        else if ((type === "n" || !type) && raw !== "" && Number.isFinite(Number(raw))) value = Number(raw);
        values[index] = value;
      }
      while (values.length && values[values.length - 1] === undefined) values.pop();
      for (let i = 0; i < values.length; i += 1) if (values[i] === undefined) values[i] = "";
      if (values.some((value) => String(value ?? "").trim() !== "")) physicalRows.push({ row_number: rowNumber, values });
    }
    if (!physicalRows.length) return Object.freeze({ name, columns: [], row_count: 0, offset, limit, rows: [], row_numbers: [], has_more: false, next_offset: null });
    const columns = reportHeaders(physicalRows[0].values);
    const data = physicalRows.slice(1);
    const boundedOffset = Math.min(offset, data.length);
    const page = data.slice(boundedOffset, boundedOffset + limit);
    const rows = page.map(({ values }) => {
      const out = Array(columns.length).fill("");
      for (let i = 0; i < Math.min(columns.length, values.length); i += 1) out[i] = values[i];
      return out;
    });
    const next = boundedOffset + rows.length;
    return Object.freeze({ name, columns, row_count: data.length, offset: boundedOffset, limit, rows, row_numbers: page.map((r) => r.row_number), has_more: next < data.length, next_offset: next < data.length ? next : null });
  }

  async function parseXlsxReportBytes(bytes, options = {}) {
    const reader = createReportZipReader(bytes);
    const workbookBytes = await reader.get("xl/workbook.xml");
    const relsBytes = await reader.get("xl/_rels/workbook.xml.rels");
    if (!workbookBytes || !relsBytes) fail("REPORT_XLSX_INVALID", "XLSX workbook metadata отсутствует.");
    const decoder = new TextDecoder("utf-8");
    const workbookXml = decoder.decode(workbookBytes);
    const relsXml = decoder.decode(relsBytes);
    const relationships = new Map();
    for (const match of relsXml.matchAll(/<Relationship\b([^>]*)\/?\s*>/gi)) {
      const id = reportXmlAttr(match[1], "Id"), target = reportXmlAttr(match[1], "Target");
      if (id && target) relationships.set(id, reportJoinZipPath("xl", target));
    }
    const sheets = [];
    for (const match of workbookXml.matchAll(/<sheet\b([^>]*)\/?\s*>/gi)) {
      const name = reportXmlAttr(match[1], "name") || `Sheet${sheets.length + 1}`;
      const rid = reportXmlAttr(match[1], "r:id");
      const target = rid ? relationships.get(rid) : null;
      if (target) sheets.push({ name, target });
    }
    if (!sheets.length) fail("REPORT_XLSX_INVALID", "XLSX worksheets отсутствуют.");
    const requested = options.sheet == null ? sheets[0] : sheets.find((item) => item.name === String(options.sheet));
    if (!requested) fail("REPORT_SHEET_NOT_FOUND", `XLSX sheet не найден: ${options.sheet}`);
    const sharedBytes = await reader.get("xl/sharedStrings.xml");
    const shared = sharedBytes ? reportParseSharedStrings(decoder.decode(sharedBytes)) : [];
    const sheetBytes = await reader.get(requested.target);
    if (!sheetBytes) fail("REPORT_XLSX_INVALID", `XLSX sheet entry отсутствует: ${requested.target}`);
    const sheet = reportParseSheet(decoder.decode(sheetBytes), shared, requested.name, options);
    return Object.freeze({ format: "xlsx", available_sheets: Object.freeze(sheets.map((item) => item.name)), sheet });
  }

  async function parseAiReadableReportBytes(bytes, { contentType = "", pathname = "", sheet = null, offset = 0, limit = 200 } = {}) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const ct = normalizedContentType(contentType);
    const lower = String(pathname || "").toLowerCase();
    const zipMagic = source.length >= 4 && source[0] === 0x50 && source[1] === 0x4b && source[2] === 0x03 && source[3] === 0x04;
    if (ct === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || lower.endsWith(".xlsx")) {
      return await parseXlsxReportBytes(source, { sheet, offset, limit });
    }
    if (["text/csv", "application/csv", "text/plain", "application/json"].includes(ct) || lower.endsWith(".csv") || lower.endsWith(".txt")) {
      const text = new TextDecoder("utf-8").decode(source);
      return Object.freeze({ format: "csv", available_sheets: Object.freeze(["Report"]), sheet: parseDelimitedReportText(text, { offset, limit, name: "Report" }) });
    }
    if (zipMagic || ct === "application/zip" || lower.endsWith(".zip")) {
      const reader = createReportZipReader(source);
      if (reader.names.includes("xl/workbook.xml")) return await parseXlsxReportBytes(source, { sheet, offset, limit });
      const csvName = reader.names.find((name) => /\.(csv|txt)$/i.test(name));
      if (csvName) {
        const csv = await reader.get(csvName);
        return Object.freeze({ format: "zip_csv", archive_entry: csvName, available_sheets: Object.freeze([csvName]), sheet: parseDelimitedReportText(new TextDecoder("utf-8").decode(csv), { offset, limit, name: csvName }) });
      }
      fail("REPORT_ZIP_CONTENT_UNSUPPORTED", "ZIP отчёт не содержит поддерживаемый XLSX/CSV файл.");
    }
    if (ct === "application/vnd.ms-excel" || lower.endsWith(".xls")) fail("REPORT_XLS_BINARY_UNSUPPORTED", "Старый XLS binary формат не поддерживается; ожидается XLSX из report_info.");
    fail("REPORT_FILE_FORMAT_UNSUPPORTED", `Неподдерживаемый формат отчёта: ${ct || lower || "unknown"}.`);
  }

  async function executeTrustedReportFileOnce({ fetchImpl, url, now = () => Date.now(), maxBytes = 16 * 1024 * 1024, parseOptions = {} }) {
    if (typeof fetchImpl !== "function") fail("FETCH_IMPL_MISSING", "fetchImpl обязателен.");
    const trustedUrl = normalizeTrustedReportFileUrl(url);
    const started = now();
    let response;
    try {
      response = await fetchImpl(trustedUrl, {
        method: "GET",
        headers: { Accept: "text/csv,text/plain,application/csv,application/octet-stream,application/zip,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        redirect: "error",
        credentials: "omit"
      });
    } catch (error) {
      const wrapped = new Error(String(error?.message || error || "Report file fetch failed"));
      wrapped.code = "REPORT_FILE_FETCH_FAILED";
      wrapped.external_request_executed = true;
      wrapped.request_attempted = true;
      throw wrapped;
    }
    const received = await readResponse(response, { preserveBytes: Boolean(response.ok) });
    if (received.byteLength > maxBytes) {
      const error = new Error(`Report file превышает лимит bridge ${maxBytes} bytes.`);
      error.code = "REPORT_FILE_TOO_LARGE";
      error.http_status = Number(response.status || 0);
      error.external_request_executed = true;
      throw error;
    }
    const contentType = normalizedContentType(headerValue(response?.headers, "content-type"));
    let parsed = null;
    let rawText = received.rawText || "";
    if (response.ok) {
      const pathname = (() => { try { return new URL(trustedUrl).pathname.toLowerCase(); } catch (_) { return ""; } })();
      const report = await parseAiReadableReportBytes(received.bytes || new Uint8Array(), {
        contentType, pathname, sheet: parseOptions.sheet ?? null, offset: Number(parseOptions.offset || 0), limit: Number(parseOptions.limit || 200)
      });
      parsed = Object.freeze({ content_type: contentType || "application/octet-stream", byte_length: received.byteLength, ...report });
    } else if (rawText.trim()) {
      try { parsed = JSON.parse(rawText); } catch (_) { parsed = null; }
    }
    return Object.freeze({
      httpStatus: Number(response.status || 0), ok: Boolean(response.ok), rawText, parsed,
      byteLength: received.byteLength, elapsedMs: Math.max(0, Number(now() - started) || 0), responseMeta: safeResponseMeta(response)
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
    normalizeTrustedReportFileUrl,
    parseAiReadableReportBytes,
    executeTrustedReportFileOnce,
    executeJsonOnce,
    executePerformanceJsonOnce
  });
})();
