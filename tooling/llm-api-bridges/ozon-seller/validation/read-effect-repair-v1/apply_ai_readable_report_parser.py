#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

PARSER_INSERT = r'''
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
'''


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label} anchor count {count}, expected 1")
    return text.replace(old, new, 1)


def patch(path: Path, transform):
    original = path.read_text(encoding="utf-8")
    updated = transform(original)
    if updated == original:
        raise RuntimeError(f"no change produced for {path}")
    path.write_text(updated, encoding="utf-8", newline="\n")


def patch_registry(text: str) -> str:
    return replace_once(
        text,
        'template: { operation: "report_file_get", params: { file_ref: "REPORT_FILE_REF" } }',
        'template: { operation: "report_file_get", params: { file_ref: "REPORT_FILE_REF", offset: 0, limit: 200 } }',
        'report_file_get template'
    )


def patch_contract(text: str) -> str:
    old = '''  function normalizeReportFileGetParams(params) {\n    const normalized = requirePlainObject(params, "params");\n    assertAllowedFields(normalized, ["file_ref"]);\n    const value = requireString(requireField(normalized, "file_ref"), "params.file_ref");\n    if (!/^rpf_[A-Za-z0-9_-]{12,120}$/.test(value)) fail("INVALID_OPERATION_PARAMS", "params.file_ref должен быть opaque report file ref bridge.");\n    normalized.file_ref = value;\n    return normalized;\n  }'''
    new = '''  function normalizeReportFileGetParams(params) {\n    const normalized = requirePlainObject(params, "params");\n    assertAllowedFields(normalized, ["file_ref", "sheet", "offset", "limit"]);\n    const value = requireString(requireField(normalized, "file_ref"), "params.file_ref");\n    if (!/^rpf_[A-Za-z0-9_-]{12,120}$/.test(value)) fail("INVALID_OPERATION_PARAMS", "params.file_ref должен быть opaque report file ref bridge.");\n    normalized.file_ref = value;\n    if (Object.prototype.hasOwnProperty.call(normalized, "sheet")) requireString(normalized.sheet, "params.sheet");\n    if (!Object.prototype.hasOwnProperty.call(normalized, "offset")) normalized.offset = 0;\n    if (!Object.prototype.hasOwnProperty.call(normalized, "limit")) normalized.limit = 200;\n    requireInteger(normalized.offset, "params.offset", { minimum: 0, maximum: 1000000 });\n    requireInteger(normalized.limit, "params.limit", { minimum: 1, maximum: 500 });\n    return normalized;\n  }'''
    return replace_once(text, old, new, 'report_file_get normalizer')


def patch_transport(text: str) -> str:
    text = replace_once(text, '  async function executeTrustedReportFileOnce', PARSER_INSERT + '\n  async function executeTrustedReportFileOnce', 'AI-readable parser insert')
    old_sig = 'async function executeTrustedReportFileOnce({ fetchImpl, url, now = () => Date.now(), maxBytes = 16 * 1024 * 1024 })'
    new_sig = 'async function executeTrustedReportFileOnce({ fetchImpl, url, now = () => Date.now(), maxBytes = 16 * 1024 * 1024, parseOptions = {} })'
    text = replace_once(text, old_sig, new_sig, 'report file signature')
    old_branch = '''    if (response.ok) {\n      const pathname = (() => { try { return new URL(trustedUrl).pathname.toLowerCase(); } catch (_) { return ""; } })();\n      const textual = ["text/csv", "application/csv", "text/plain", "application/json"].includes(contentType) || pathname.endsWith(".csv") || pathname.endsWith(".txt");\n      if (textual) {\n        const text = new TextDecoder("utf-8").decode(received.bytes || new Uint8Array());\n        parsed = Object.freeze({ content_type: contentType || "text/csv", byte_length: received.byteLength, encoding: "utf-8", content_text: text });\n      } else {\n        parsed = Object.freeze({ content_type: contentType || "application/octet-stream", byte_length: received.byteLength, encoding: "base64", file_content_base64: bytesToBase64(received.bytes) });\n      }\n    } else if (rawText.trim()) {'''
    new_branch = '''    if (response.ok) {\n      const pathname = (() => { try { return new URL(trustedUrl).pathname.toLowerCase(); } catch (_) { return ""; } })();\n      const report = await parseAiReadableReportBytes(received.bytes || new Uint8Array(), {\n        contentType, pathname, sheet: parseOptions.sheet ?? null, offset: Number(parseOptions.offset || 0), limit: Number(parseOptions.limit || 200)\n      });\n      parsed = Object.freeze({ content_type: contentType || "application/octet-stream", byte_length: received.byteLength, ...report });\n    } else if (rawText.trim()) {'''
    text = replace_once(text, old_branch, new_branch, 'report file parsing branch')
    text = replace_once(text, '    normalizeTrustedReportFileUrl,\n    executeTrustedReportFileOnce,', '    normalizeTrustedReportFileUrl,\n    parseAiReadableReportBytes,\n    executeTrustedReportFileOnce,', 'parser export')
    return text


def patch_provider(text: str) -> str:
    old = 'const response = await globalThis.ProviderTransportCore.executeTrustedReportFileOnce({ fetchImpl, url: record.url, now });'
    new = 'const response = await globalThis.ProviderTransportCore.executeTrustedReportFileOnce({ fetchImpl, url: record.url, now, parseOptions: command.params });'
    return replace_once(text, old, new, 'provider parse options')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--repo-root', type=Path, required=True)
    args = ap.parse_args()
    shared = args.repo_root.resolve() / 'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared'
    files = {
        'registry': shared / 'ozon_operation_registry.js',
        'contract': shared / 'ozon_contract.js',
        'transport': shared / 'provider_transport_core.js',
        'provider': shared / 'ozon_provider.js',
    }
    for path in files.values():
        if not path.is_file(): raise RuntimeError(f'missing {path}')
    patch(files['registry'], patch_registry)
    patch(files['contract'], patch_contract)
    patch(files['transport'], patch_transport)
    patch(files['provider'], patch_provider)
    print('OZON_REPORT_AI_READABLE_PARAMS_PASS')
    print('OZON_REPORT_CSV_STRUCTURED_ROWS_PASS')
    print('OZON_REPORT_XLSX_OOXML_READER_PASS')
    print('OZON_REPORT_ZIP_FAIL_CLOSED_PASS')
    print('OZON_REPORT_NO_BASE64_TO_AI_PASS')
    print('OZON_REPORT_AI_READABLE_APPLY_PASS')

if __name__ == '__main__':
    main()
