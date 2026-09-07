#!/usr/bin/env python3
from pathlib import Path
import sys

repo = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
path = repo / "tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/provider_transport_core.js"
text = path.read_text(encoding="utf-8")

if "function reportXmlQualifiedElementPattern" in text:
    print("OZON_XLSX_NAMESPACE_PATCH_ALREADY_APPLIED")
    raise SystemExit(0)

anchor = "\n  function reportColumnIndex(cellRef) {"
if text.count(anchor) != 1:
    raise SystemExit("PATCH_ANCHOR_REPORT_COLUMN_INDEX_NOT_UNIQUE")
helpers = r'''

  function reportXmlQualifiedElementPattern(localName, flags = "gi") {
    const escaped = String(localName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const qname = `(?:[A-Za-z_][A-Za-z0-9_.-]*:)?${escaped}`;
    return new RegExp(`<(${qname})\\b([^>]*?)(?:\\/\\s*>|>([\\s\\S]*?)<\\/\\1\\s*>)`, flags);
  }

  function reportXmlAttrLocalName(tag, localName) {
    const escaped = String(localName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = String(tag || "").match(new RegExp(`(?:\\s|^)(?:[A-Za-z_][A-Za-z0-9_.-]*:)?${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
    return match ? reportXmlDecode(match[1] ?? match[2] ?? "") : null;
  }
'''
text = text.replace(anchor, helpers + anchor, 1)

start = text.index("  function reportParseSharedStrings(xml) {")
end = text.index("\n  function reportParseSheet(", start)
shared = r'''  function reportParseSharedStrings(xml) {
    const values = [];
    for (const match of String(xml || "").matchAll(reportXmlQualifiedElementPattern("si", "gi"))) {
      let value = "";
      const body = match[3] || "";
      for (const text of body.matchAll(reportXmlQualifiedElementPattern("t", "gi"))) value += reportXmlDecode(text[3] || "");
      values.push(value);
    }
    return values;
  }
'''
text = text[:start] + shared + text[end:]

start = text.index("  function reportParseSheet(xml, sharedStrings, name,")
end = text.index("\n  async function parseXlsxReportBytes(", start)
sheet = r'''  function reportParseSheet(xml, sharedStrings, name, { offset = 0, limit = 200 } = {}) {
    const physicalRows = [];
    for (const rowMatch of String(xml || "").matchAll(reportXmlQualifiedElementPattern("row", "gi"))) {
      const rowNumber = Number(reportXmlAttr(rowMatch[2], "r")) || physicalRows.length + 1;
      const values = [];
      const rowBody = rowMatch[3] || "";
      for (const cellMatch of rowBody.matchAll(reportXmlQualifiedElementPattern("c", "gi"))) {
        const attrs = cellMatch[2], body = cellMatch[3] || "";
        const index = reportColumnIndex(reportXmlAttr(attrs, "r"));
        if (index === null) continue;
        const type = reportXmlAttr(attrs, "t") || "n";
        let raw = "";
        if (type === "inlineStr") {
          for (const text of body.matchAll(reportXmlQualifiedElementPattern("t", "gi"))) raw += reportXmlDecode(text[3] || "");
        } else {
          const valueMatch = body.match(reportXmlQualifiedElementPattern("v", "i"));
          raw = valueMatch ? reportXmlDecode(valueMatch[3] || "") : "";
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
'''
text = text[:start] + sheet + text[end:]

old_rels = '''    const relationships = new Map();
    for (const match of relsXml.matchAll(/<Relationship\\b([^>]*)\\/?\\s*>/gi)) {
      const id = reportXmlAttr(match[1], "Id"), target = reportXmlAttr(match[1], "Target"), targetMode = reportXmlAttr(match[1], "TargetMode");
      if (id && target) relationships.set(id, reportResolveWorkbookRelationshipTarget(target, targetMode));
    }
    const sheets = [];
    for (const match of workbookXml.matchAll(/<sheet\\b([^>]*)\\/?\\s*>/gi)) {
      const name = reportXmlAttr(match[1], "name") || `Sheet${sheets.length + 1}`;
      const rid = reportXmlAttr(match[1], "r:id");
      const target = rid ? relationships.get(rid) : null;
      if (target) sheets.push({ name, target });
    }
'''
new_rels = '''    const relationships = new Map();
    for (const match of relsXml.matchAll(reportXmlQualifiedElementPattern("Relationship", "gi"))) {
      const attrs = match[2];
      const id = reportXmlAttr(attrs, "Id"), target = reportXmlAttr(attrs, "Target"), targetMode = reportXmlAttr(attrs, "TargetMode");
      if (id && target) relationships.set(id, reportResolveWorkbookRelationshipTarget(target, targetMode));
    }
    const sheets = [];
    for (const match of workbookXml.matchAll(reportXmlQualifiedElementPattern("sheet", "gi"))) {
      const attrs = match[2];
      const name = reportXmlAttr(attrs, "name") || `Sheet${sheets.length + 1}`;
      const rid = reportXmlAttrLocalName(attrs, "id");
      const target = rid ? relationships.get(rid) : null;
      if (target) sheets.push({ name, target });
    }
'''
if text.count(old_rels) != 1:
    raise SystemExit("PATCH_ANCHOR_WORKBOOK_RELATIONSHIPS_NOT_UNIQUE")
text = text.replace(old_rels, new_rels, 1)

path.write_text(text, encoding="utf-8")
print("OZON_XLSX_NAMESPACE_PATCH_APPLIED")
