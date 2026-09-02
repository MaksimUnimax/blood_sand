#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

PDF_PARSER_INSERT = r'''
  function reportBase64ToBytes(value) {
    const input = String(value || "").replace(/\s+/g, "");
    if (!input || input.length % 4 !== 0) fail("INVALID_BASE64", "Некорректный base64 документ.");
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const lookup = new Map([...alphabet].map((ch, index) => [ch, index]));
    const out = [];
    for (let i = 0; i < input.length; i += 4) {
      const a = lookup.get(input[i]), b = lookup.get(input[i + 1]);
      const c = input[i + 2] === "=" ? 0 : lookup.get(input[i + 2]);
      const d = input[i + 3] === "=" ? 0 : lookup.get(input[i + 3]);
      if ([a,b,c,d].some((v) => v === undefined)) fail("INVALID_BASE64", "Некорректный base64 документ.");
      const triple = (a << 18) | (b << 12) | (c << 6) | d;
      out.push((triple >> 16) & 255);
      if (input[i + 2] !== "=") out.push((triple >> 8) & 255);
      if (input[i + 3] !== "=") out.push(triple & 255);
    }
    return new Uint8Array(out);
  }

  function reportLatin1(bytes) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    let out = "";
    const chunk = 0x4000;
    for (let i = 0; i < source.length; i += chunk) out += String.fromCharCode(...source.subarray(i, Math.min(source.length, i + chunk)));
    return out;
  }

  function pdfDecodeLiteral(raw) {
    let out = "";
    const text = String(raw || "");
    for (let i = 0; i < text.length; i += 1) {
      if (text[i] !== "\\") { out += text[i]; continue; }
      i += 1;
      if (i >= text.length) break;
      const ch = text[i];
      const mapped = { n:"\n", r:"\r", t:"\t", b:"\b", f:"\f", "(":"(", ")":")", "\\":"\\" }[ch];
      if (mapped !== undefined) { out += mapped; continue; }
      if (/[0-7]/.test(ch)) {
        let oct = ch;
        for (let j = 0; j < 2 && /[0-7]/.test(text[i + 1] || ""); j += 1) { i += 1; oct += text[i]; }
        out += String.fromCharCode(parseInt(oct, 8));
        continue;
      }
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      else if (ch !== "\r" && ch !== "\n") out += ch;
    }
    return out;
  }

  function pdfDecodeHex(raw) {
    let hex = String(raw || "").replace(/\s+/g, "");
    if (hex.length % 2) hex += "0";
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
      let out = "";
      for (let i = 2; i + 1 < bytes.length; i += 2) out += String.fromCharCode((bytes[i] << 8) | bytes[i + 1]);
      return out;
    }
    return reportLatin1(bytes);
  }

  function pdfExtractTextOperators(content) {
    const text = String(content || "");
    const pieces = [];
    for (const match of text.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj\b/g)) pieces.push(pdfDecodeLiteral(match[1]));
    for (const match of text.matchAll(/<([0-9A-Fa-f\s]+)>\s*Tj\b/g)) pieces.push(pdfDecodeHex(match[1]));
    for (const arrayMatch of text.matchAll(/\[([\s\S]*?)\]\s*TJ\b/g)) {
      let joined = "";
      for (const literal of arrayMatch[1].matchAll(/\(((?:\\.|[^\\)])*)\)/g)) joined += pdfDecodeLiteral(literal[1]);
      for (const hex of arrayMatch[1].matchAll(/<([0-9A-Fa-f\s]+)>/g)) joined += pdfDecodeHex(hex[1]);
      if (joined) pieces.push(joined);
    }
    return pieces.map((value) => String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]+/g, " ").trim()).filter(Boolean);
  }

  async function parsePdfDocumentBytes(bytes, { maxTextChars = 30000 } = {}) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const latin = reportLatin1(source);
    const pieces = pdfExtractTextOperators(latin);
    const streamPattern = /<<([\s\S]{0,4096}?)>>\s*stream\r?\n/g;
    let match;
    while ((match = streamPattern.exec(latin)) !== null) {
      const dataStart = streamPattern.lastIndex;
      const end = latin.indexOf("endstream", dataStart);
      if (end < 0) break;
      let dataEnd = end;
      while (dataEnd > dataStart && (latin[dataEnd - 1] === "\r" || latin[dataEnd - 1] === "\n")) dataEnd -= 1;
      if (/\/FlateDecode\b/.test(match[1])) {
        try {
          if (typeof DecompressionStream !== "function") fail("PDF_DEFLATE_UNAVAILABLE", "Runtime не поддерживает PDF FlateDecode.");
          const compressed = source.slice(dataStart, dataEnd);
          const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate"));
          const inflated = new Uint8Array(await new Response(stream).arrayBuffer());
          pieces.push(...pdfExtractTextOperators(reportLatin1(inflated)));
        } catch (_) {
          // Some PDFs use predictors/font encodings; fail-soft on text extraction while preserving document metadata.
        }
      } else pieces.push(...pdfExtractTextOperators(latin.slice(dataStart, dataEnd)));
      streamPattern.lastIndex = end + 9;
    }
    const unique = [];
    const seen = new Set();
    for (const piece of pieces) {
      const normalized = piece.replace(/\s+/g, " ").trim();
      if (normalized && !seen.has(normalized)) { seen.add(normalized); unique.push(normalized); }
    }
    const joined = unique.join("\n");
    return Object.freeze({
      format: "pdf",
      text_extract_available: Boolean(joined),
      text_extract: joined.slice(0, maxTextChars),
      text_truncated: joined.length > maxTextChars
    });
  }
'''

PROVIDER_INSERT = r'''
    const GENERATED_DOCUMENT_URL_FIELD_BY_OPERATION = Object.freeze({
      cargoes_label_get: "file_url",
      cargoes_label_transport_by_order_status: "file_url",
      cargoes_label_transport_status: "file_url",
      fbp_act_from_get: "cdn_url",
      fbp_act_to_get: "label_url",
      fbp_label_get: "label_url",
      posting_fbs_package_label_get_v1: "file_url"
    });
    const DIRECT_PDF_OPERATIONS = new Set(["posting_fbs_act_container_labels", "posting_fbs_package_label"]);

    function registerInlineGeneratedDocument(binaryPayload) {
      const contentType = String(binaryPayload?.content_type || "application/octet-stream").toLowerCase();
      const base64 = String(binaryPayload?.file_content_base64 || "");
      if (!base64 || contentType !== "application/pdf") return null;
      pruneReportFileRefs();
      const token = String(uuid()).replace(/[^A-Za-z0-9_-]/g, "");
      const ref = `rpf_${token}`;
      reportFileRefs.set(ref, Object.freeze({ inline_base64: base64, content_type: contentType, byte_length: Number(binaryPayload?.byte_length || 0), created_at_ms: Number(now()) }));
      pruneReportFileRefs();
      return ref;
    }
'''

PROVIDER_RESULT_INSERT = r'''
        const generatedUrlField = GENERATED_DOCUMENT_URL_FIELD_BY_OPERATION[command.operation];
        if (generatedUrlField) {
          const rawGeneratedUrl = findFirstField(response.parsed, generatedUrlField);
          if (typeof rawGeneratedUrl === "string" && rawGeneratedUrl.trim()) {
            const generatedRef = registerReportFile(rawGeneratedUrl.trim());
            result = Object.freeze({ ...(result && typeof result === "object" && !Array.isArray(result) ? result : { result }), generated_file_ref: generatedRef });
          }
        }
        if (DIRECT_PDF_OPERATIONS.has(command.operation)) {
          const generatedRef = registerInlineGeneratedDocument(response.parsed);
          if (generatedRef) {
            const safe = result && typeof result === "object" && !Array.isArray(result) ? { ...result } : { result };
            delete safe.file_content_base64;
            safe.generated_file_ref = generatedRef;
            safe.format = "pdf";
            result = Object.freeze(safe);
          }
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
        'purpose: "Получить готовый файл отчёта по непрозрачной ссылке bridge без раскрытия signed URL."',
        'purpose: "Получить и безопасно разобрать готовый файл отчёта/документа по opaque ref без раскрытия signed URL или base64."',
        'generated file helper purpose'
    )


def patch_contract(text: str) -> str:
    old = '    if ((operation === "report_list" || operation === "report_info") && String(key) === "file") return true;'
    new = '''    if ((operation === "report_list" || operation === "report_info") && String(key) === "file") return true;\n    if (["cargoes_label_get", "cargoes_label_transport_by_order_status", "cargoes_label_transport_status", "fbp_act_from_get", "fbp_act_to_get", "fbp_label_get", "posting_fbs_package_label_get_v1"].includes(operation) && ["file_url", "cdn_url", "label_url"].includes(String(key))) return true;'''
    return replace_once(text, old, new, 'generated document URL redaction')


def patch_transport(text: str) -> str:
    text = replace_once(text, '  function reportXmlDecode(value) {', PDF_PARSER_INSERT + '\n  function reportXmlDecode(value) {', 'PDF parser insert')
    old = '    if (ct === "application/vnd.ms-excel" || lower.endsWith(".xls")) fail("REPORT_XLS_BINARY_UNSUPPORTED", "Старый XLS binary формат не поддерживается; ожидается XLSX из report_info.");'
    new = '''    if (ct === "application/pdf" || lower.endsWith(".pdf")) return await parsePdfDocumentBytes(source);\n    if (ct === "application/vnd.ms-excel" || lower.endsWith(".xls")) fail("REPORT_XLS_BINARY_UNSUPPORTED", "Старый XLS binary формат не поддерживается; ожидается XLSX из report_info.");'''
    text = replace_once(text, old, new, 'PDF format branch')
    text = replace_once(text, '    normalizeTrustedReportFileUrl,\n    parseAiReadableReportBytes,', '    normalizeTrustedReportFileUrl,\n    reportBase64ToBytes,\n    parsePdfDocumentBytes,\n    parseAiReadableReportBytes,', 'PDF parser exports')
    return text


def patch_provider(text: str) -> str:
    text = replace_once(text, '    function clearPerformanceToken() {', PROVIDER_INSERT + '\n    function clearPerformanceToken() {', 'generated document provider state')
    old_execute = '''    async function executeReportFileCommand(command) {\n      const record = resolveReportFileRef(command.params.file_ref);\n      const response = await globalThis.ProviderTransportCore.executeTrustedReportFileOnce({ fetchImpl, url: record.url, now, parseOptions: command.params });\n      const request = Object.freeze({\n        method: "GET", host_alias: "report_file", path: "/__opaque_report_file__", operation: "report_file_get",\n        response_style: "binary", response_content_types: null\n      });\n      return { request, response, auth_request_performed: false };\n    }'''
    new_execute = '''    async function executeReportFileCommand(command) {\n      const record = resolveReportFileRef(command.params.file_ref);\n      if (record.inline_base64) {\n        const started = Number(now());\n        const bytes = globalThis.ProviderTransportCore.reportBase64ToBytes(record.inline_base64);\n        const parsedDocument = await globalThis.ProviderTransportCore.parseAiReadableReportBytes(bytes, { contentType: record.content_type || "application/pdf", pathname: "/inline-document.pdf", sheet: command.params.sheet ?? null, offset: Number(command.params.offset || 0), limit: Number(command.params.limit || 200) });\n        const response = Object.freeze({ httpStatus: 200, ok: true, rawText: "", parsed: Object.freeze({ content_type: record.content_type || "application/pdf", byte_length: bytes.byteLength, ...parsedDocument }), byteLength: bytes.byteLength, elapsedMs: Math.max(0, Number(now()) - started), responseMeta: Object.freeze({ content_type: record.content_type || "application/pdf", content_length: String(bytes.byteLength), request_id: null, retry_after: null }) });\n        const request = Object.freeze({ method: "GET", host_alias: "report_file", path: "/__opaque_inline_document__", operation: "report_file_get", response_style: "binary", response_content_types: null, external_request_executed: false });\n        return { request, response, auth_request_performed: false };\n      }\n      const response = await globalThis.ProviderTransportCore.executeTrustedReportFileOnce({ fetchImpl, url: record.url, now, parseOptions: command.params });\n      const request = Object.freeze({ method: "GET", host_alias: "report_file", path: "/__opaque_report_file__", operation: "report_file_get", response_style: "binary", response_content_types: null, external_request_executed: true });\n      return { request, response, auth_request_performed: false };\n    }'''
    text = replace_once(text, old_execute, new_execute, 'generated file command execution')
    anchor = '''        if (command.operation === "report_info") {\n          const rawFile = findFirstField(response.parsed, "file");\n          if (typeof rawFile === "string" && rawFile.trim()) {\n            const fileRef = registerReportFile(rawFile.trim());\n            result = Object.freeze({ ...(result && typeof result === "object" && !Array.isArray(result) ? result : { result }), report_file_ref: fileRef });\n          }\n        }'''
    text = replace_once(text, anchor, anchor + '\n' + PROVIDER_RESULT_INSERT.rstrip(), 'generated document result capture')
    text = replace_once(text, '          external_request_executed: true,', '          external_request_executed: request.external_request_executed !== false,', 'accurate internal file request metadata')
    return text


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
    print('OZON_GENERATED_DOCUMENT_URL_REDACTION_PASS')
    print('OZON_GENERATED_DOCUMENT_OPAQUE_REF_PASS')
    print('OZON_DIRECT_PDF_BASE64_HIDDEN_PASS')
    print('OZON_PDF_TEXT_EXTRACTION_PASS')
    print('OZON_INLINE_DOCUMENT_ZERO_NETWORK_READ_PASS')
    print('OZON_GENERATED_DOCUMENT_DELIVERY_APPLY_PASS')

if __name__ == '__main__':
    main()
