#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path

REGISTRY_INSERT = r'''    report_file_get: {
      provider: "report_file", method: "GET", path: "/__opaque_report_file__", effect: "READ", request_style: "opaque_file_ref", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false,
      cluster: "finance", section: "documents_reports", guidance_visibility: "conditional", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить готовый файл отчёта по непрозрачной ссылке bridge без раскрытия signed URL.", template: { operation: "report_file_get", params: { file_ref: "REPORT_FILE_REF" } }
    },
'''

CONTRACT_NORMALIZER = r'''
  function normalizeReportFileGetParams(params) {
    const normalized = requirePlainObject(params, "params");
    assertAllowedFields(normalized, ["file_ref"]);
    const value = requireString(requireField(normalized, "file_ref"), "params.file_ref");
    if (!/^rpf_[A-Za-z0-9_-]{12,120}$/.test(value)) fail("INVALID_OPERATION_PARAMS", "params.file_ref должен быть opaque report file ref bridge.");
    normalized.file_ref = value;
    return normalized;
  }
'''

CONTRACT_MAP_INSERT = '    report_file_get: { normalizeParams: normalizeReportFileGetParams, sanitizeResult: authorizedPersonalDataReadResult, contract_state: "opaque_report_file_ref_v1" },\n'

TRANSPORT_INSERT = r'''
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

  async function executeTrustedReportFileOnce({ fetchImpl, url, now = () => Date.now(), maxBytes = 16 * 1024 * 1024 }) {
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
      const textual = ["text/csv", "application/csv", "text/plain", "application/json"].includes(contentType) || pathname.endsWith(".csv") || pathname.endsWith(".txt");
      if (textual) {
        const text = new TextDecoder("utf-8").decode(received.bytes || new Uint8Array());
        parsed = Object.freeze({ content_type: contentType || "text/csv", byte_length: received.byteLength, encoding: "utf-8", content_text: text });
      } else {
        parsed = Object.freeze({ content_type: contentType || "application/octet-stream", byte_length: received.byteLength, encoding: "base64", file_content_base64: bytesToBase64(received.bytes) });
      }
    } else if (rawText.trim()) {
      try { parsed = JSON.parse(rawText); } catch (_) { parsed = null; }
    }
    return Object.freeze({
      httpStatus: Number(response.status || 0), ok: Boolean(response.ok), rawText, parsed,
      byteLength: received.byteLength, elapsedMs: Math.max(0, Number(now() - started) || 0), responseMeta: safeResponseMeta(response)
    });
  }
'''

PROVIDER_STATE_INSERT = r'''
    const reportFileRefs = new Map();
    const REPORT_FILE_REF_TTL_MS = 30 * 60 * 1000;
    const REPORT_FILE_REF_MAX = 128;

    function pruneReportFileRefs() {
      const current = Number(now());
      for (const [ref, record] of reportFileRefs.entries()) {
        if (!record || current - Number(record.created_at_ms || 0) > REPORT_FILE_REF_TTL_MS) reportFileRefs.delete(ref);
      }
      while (reportFileRefs.size > REPORT_FILE_REF_MAX) reportFileRefs.delete(reportFileRefs.keys().next().value);
    }

    function registerReportFile(rawUrl) {
      const trustedUrl = globalThis.ProviderTransportCore.normalizeTrustedReportFileUrl(rawUrl);
      pruneReportFileRefs();
      const token = String(uuid()).replace(/[^A-Za-z0-9_-]/g, "");
      const ref = `rpf_${token}`;
      reportFileRefs.set(ref, Object.freeze({ url: trustedUrl, created_at_ms: Number(now()) }));
      pruneReportFileRefs();
      return ref;
    }

    function resolveReportFileRef(ref) {
      pruneReportFileRefs();
      const record = reportFileRefs.get(String(ref || ""));
      if (!record) {
        const error = new Error("Report file ref неизвестен или истёк. Повторите report_info отдельной командой.");
        error.code = "REPORT_FILE_REF_NOT_FOUND";
        error.external_request_executed = false;
        throw error;
      }
      return record;
    }

    async function executeReportFileCommand(command) {
      const record = resolveReportFileRef(command.params.file_ref);
      const response = await globalThis.ProviderTransportCore.executeTrustedReportFileOnce({ fetchImpl, url: record.url, now });
      const request = Object.freeze({
        method: "GET", host_alias: "report_file", path: "/__opaque_report_file__", operation: "report_file_get",
        response_style: "binary", response_content_types: null
      });
      return { request, response, auth_request_performed: false };
    }
'''

PROVIDER_RESULT_INSERT = r'''
        result = contract.sanitizeResult(command, response.parsed ?? response.rawText);
        if (command.operation === "report_info") {
          const rawFile = findFirstField(response.parsed, "file");
          if (typeof rawFile === "string" && rawFile.trim()) {
            const fileRef = registerReportFile(rawFile.trim());
            result = Object.freeze({ ...(result && typeof result === "object" && !Array.isArray(result) ? result : { result }), report_file_ref: fileRef });
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
    text = replace_once(text, '    report_products_create: {', REGISTRY_INSERT + '    report_products_create: {', 'registry helper insert')
    text = re.sub(r'(total_aliases\s*:\s*)296\b', r'\g<1>297', text)
    text = re.sub(r'(current_read_aliases\s*:\s*)296\b', r'\g<1>297', text)
    text = re.sub(r'(execution_enabled_aliases\s*:\s*)296\b', r'\g<1>297', text)
    return text


def patch_contract(text: str) -> str:
    text = replace_once(text, '["seller_api", "performance_api"].includes(provider)', '["seller_api", "performance_api", "report_file"].includes(provider)', 'provider allowlist')
    text = replace_once(text, '  function normalizeSupplyOrderListParams(params) {', CONTRACT_NORMALIZER + '\n  function normalizeSupplyOrderListParams(params) {', 'contract helper normalizer')
    text = replace_once(text, '    report_products_create: { normalizeParams:', CONTRACT_MAP_INSERT + '    report_products_create: { normalizeParams:', 'contract helper map')
    text = replace_once(
        text,
        '      if (meta.method === "GET" && meta.request_style !== "query") fail("REQUEST_STYLE_NOT_READY", `${name}: GET требует query builder.`);',
        '      if (meta.method === "GET" && meta.request_style !== "query" && !(provider === "report_file" && meta.request_style === "opaque_file_ref")) fail("REQUEST_STYLE_NOT_READY", `${name}: GET требует query builder.`);\n      if (provider === "report_file" && meta.request_style !== "opaque_file_ref") fail("REQUEST_STYLE_NOT_READY", `${name}: report_file требует opaque_file_ref builder.`);',
        'internal report file GET request-style exemption'
    )
    return text


def patch_transport(text: str) -> str:
    text = replace_once(text, '  async function executePerformanceJsonOnce', TRANSPORT_INSERT + '\n  async function executePerformanceJsonOnce', 'trusted file transport insert')
    text = replace_once(text, '    readResponse,\n    executeJsonOnce,', '    readResponse,\n    normalizeTrustedReportFileUrl,\n    executeTrustedReportFileOnce,\n    executeJsonOnce,', 'transport exports')
    return text


def patch_provider(text: str) -> str:
    text = replace_once(text, '    let performanceToken = null;', '    let performanceToken = null;\n' + PROVIDER_STATE_INSERT, 'provider report file state')
    old_dispatch = '''      const execution = provider === "performance_api"\n        ? await executePerformanceCommand(command, rawPerformanceCredentials)\n        : await executeSellerCommand(command, rawCredentials);'''
    new_dispatch = '''      const execution = provider === "report_file"\n        ? await executeReportFileCommand(command)\n        : (provider === "performance_api"\n          ? await executePerformanceCommand(command, rawPerformanceCredentials)\n          : await executeSellerCommand(command, rawCredentials));'''
    text = replace_once(text, old_dispatch, new_dispatch, 'provider dispatch')
    text = replace_once(text, '        result = contract.sanitizeResult(command, response.parsed ?? response.rawText);', PROVIDER_RESULT_INSERT.rstrip(), 'provider report_info capture')
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
    print('OZON_REPORT_FILE_OPAQUE_REF_REGISTRY_PASS')
    print('OZON_REPORT_FILE_OPAQUE_REF_CONTRACT_PASS')
    print('OZON_REPORT_FILE_GET_STYLE_EXEMPTION_PASS')
    print('OZON_REPORT_FILE_TRUSTED_TRANSPORT_PASS')
    print('OZON_REPORT_FILE_PROVIDER_SESSION_REF_PASS')
    print('OZON_REPORT_FILE_WORKFLOW_APPLY_PASS')

if __name__ == '__main__':
    main()
