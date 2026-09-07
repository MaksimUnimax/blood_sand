#!/usr/bin/env python3
from pathlib import Path
import sys

repo = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
core = repo / "tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/provider_transport_core.js"
text = core.read_text(encoding="utf-8")

helper_marker = "\n  async function parseXlsxReportBytes(bytes, options = {}) {"
helper = r'''

  // Diagnostic-only, payload-free structural telemetry for a real XLSX that the
  // parser materializes as an empty sheet. It records counts/booleans only:
  // never XML snippets, cell values, shared-string values, URLs or credentials.
  function reportXlsxLocalStartTags(xml, localName) {
    const escaped = String(localName || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`<\\s*(?:[A-Za-z_][A-Za-z0-9_.-]*:)?${escaped}\\b([^>]*)>`, "gi");
    return [...String(xml || "").matchAll(pattern)];
  }

  function reportXlsxStructureDiagnostics(sheetXml, sharedXml = "") {
    const source = String(sheetXml || "");
    const sharedSource = String(sharedXml || "");
    const rows = reportXlsxLocalStartTags(source, "row");
    const cells = reportXlsxLocalStartTags(source, "c");
    const parserRows = [...source.matchAll(reportXmlQualifiedElementPattern("row", "gi"))];
    const parserCells = [];
    for (const row of parserRows) {
      const body = row[3] || "";
      parserCells.push(...body.matchAll(reportXmlQualifiedElementPattern("c", "gi")));
    }
    const rowWithRef = rows.filter((match) => String(reportXmlAttrLocalName(match[1] || "", "r") || "").trim() !== "").length;
    const cellWithRef = cells.filter((match) => String(reportXmlAttrLocalName(match[1] || "", "r") || "").trim() !== "").length;
    const typeCounts = {
      shared_string: 0,
      inline_string: 0,
      boolean: 0,
      string: 0,
      error: 0,
      date: 0,
      numeric_or_default: 0,
      other: 0
    };
    for (const match of cells) {
      const type = String(reportXmlAttrLocalName(match[1] || "", "t") || "").trim();
      if (type === "s") typeCounts.shared_string += 1;
      else if (type === "inlineStr") typeCounts.inline_string += 1;
      else if (type === "b") typeCounts.boolean += 1;
      else if (type === "str") typeCounts.string += 1;
      else if (type === "e") typeCounts.error += 1;
      else if (type === "d") typeCounts.date += 1;
      else if (!type || type === "n") typeCounts.numeric_or_default += 1;
      else typeCounts.other += 1;
    }
    return Object.freeze({
      diagnostic_kind: "xlsx_zero_row_structure_v1",
      payload_values_included: false,
      worksheet_char_length: source.length,
      sheet_data_start_tags: reportXlsxLocalStartTags(source, "sheetData").length,
      lexical_row_start_tags: rows.length,
      parser_row_elements: parserRows.length,
      rows_with_r: rowWithRef,
      rows_without_r: Math.max(0, rows.length - rowWithRef),
      lexical_cell_start_tags: cells.length,
      parser_cell_elements: parserCells.length,
      cells_with_r: cellWithRef,
      cells_without_r: Math.max(0, cells.length - cellWithRef),
      value_start_tags: reportXlsxLocalStartTags(source, "v").length,
      text_start_tags: reportXlsxLocalStartTags(source, "t").length,
      inline_string_start_tags: reportXlsxLocalStartTags(source, "is").length,
      formula_start_tags: reportXlsxLocalStartTags(source, "f").length,
      shared_strings_present: sharedSource.length > 0,
      shared_string_item_start_tags: reportXlsxLocalStartTags(sharedSource, "si").length,
      cell_type_counts: Object.freeze(typeCounts)
    });
  }
'''

if "function reportXlsxStructureDiagnostics(" not in text:
    if helper_marker not in text:
        raise SystemExit("PATCH_MARKER_PARSE_XLSX_NOT_FOUND")
    text = text.replace(helper_marker, helper + helper_marker, 1)

old = '''    const sharedBytes = await reader.get("xl/sharedStrings.xml");
    const shared = sharedBytes ? reportParseSharedStrings(decoder.decode(sharedBytes)) : [];
    const sheetBytes = await reader.get(requested.target);
    if (!sheetBytes) fail("REPORT_XLSX_INVALID", `XLSX sheet entry отсутствует: ${requested.target}`);
    const sheet = reportParseSheet(decoder.decode(sheetBytes), shared, requested.name, options);
    return Object.freeze({ format: "xlsx", available_sheets: Object.freeze(sheets.map((item) => item.name)), sheet });'''
new = '''    const sharedBytes = await reader.get("xl/sharedStrings.xml");
    const sharedXml = sharedBytes ? decoder.decode(sharedBytes) : "";
    const shared = sharedBytes ? reportParseSharedStrings(sharedXml) : [];
    const sheetBytes = await reader.get(requested.target);
    if (!sheetBytes) fail("REPORT_XLSX_INVALID", `XLSX sheet entry отсутствует: ${requested.target}`);
    const sheetXml = decoder.decode(sheetBytes);
    const sheet = reportParseSheet(sheetXml, shared, requested.name, options);
    const zeroRowDiagnostics = sheet.row_count === 0 && Array.isArray(sheet.columns) && sheet.columns.length === 0
      ? reportXlsxStructureDiagnostics(sheetXml, sharedXml)
      : null;
    return Object.freeze({
      format: "xlsx",
      available_sheets: Object.freeze(sheets.map((item) => item.name)),
      sheet,
      ...(zeroRowDiagnostics ? { xlsx_structure_diagnostics: zeroRowDiagnostics } : {})
    });'''

if old in text:
    text = text.replace(old, new, 1)
elif "xlsx_structure_diagnostics: zeroRowDiagnostics" not in text:
    raise SystemExit("PATCH_MARKER_XLSX_RETURN_NOT_FOUND")

core.write_text(text, encoding="utf-8")
print("OZON_XLSX_LIVE_STRUCTURE_DIAGNOSTIC_PATCH_APPLIED")
