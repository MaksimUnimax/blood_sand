#!/usr/bin/env python3
from pathlib import Path
import sys

repo = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
path = repo / "tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared/provider_transport_core.js"
text = path.read_text(encoding="utf-8")

marker = "let nextImplicitColumn = 0;"
if marker in text:
    print("OZON_XLSX_IMPLICIT_CELL_REF_PATCH_ALREADY_APPLIED")
    raise SystemExit(0)

start = text.index("  function reportParseSheet(xml, sharedStrings, name,")
end = text.index("\n  async function parseXlsxReportBytes(", start)
replacement = r'''  function reportParseSheet(xml, sharedStrings, name, { offset = 0, limit = 200 } = {}) {
    const physicalRows = [];
    let nextImplicitRow = 1;
    for (const rowMatch of String(xml || "").matchAll(reportXmlQualifiedElementPattern("row", "gi"))) {
      const rawRowRef = reportXmlAttr(rowMatch[2], "r");
      let rowNumber = nextImplicitRow;
      if (rawRowRef !== null && String(rawRowRef).trim() !== "") {
        const normalizedRowRef = String(rawRowRef).trim();
        if (!/^[1-9][0-9]*$/.test(normalizedRowRef)) fail("REPORT_XLSX_INVALID", `XLSX row reference некорректен: ${normalizedRowRef.slice(0, 40)}`);
        rowNumber = Number(normalizedRowRef);
        if (!Number.isSafeInteger(rowNumber) || rowNumber < 1 || rowNumber > 1048576) fail("REPORT_XLSX_INVALID", `XLSX row reference вне допустимого диапазона: ${normalizedRowRef.slice(0, 40)}`);
      }
      nextImplicitRow = Math.max(nextImplicitRow, rowNumber + 1);

      const values = [];
      const rowBody = rowMatch[3] || "";
      let nextImplicitColumn = 0;
      for (const cellMatch of rowBody.matchAll(reportXmlQualifiedElementPattern("c", "gi"))) {
        const attrs = cellMatch[2], body = cellMatch[3] || "";
        const rawCellRef = reportXmlAttr(attrs, "r");
        let index = nextImplicitColumn;
        if (rawCellRef !== null && String(rawCellRef).trim() !== "") {
          const normalizedCellRef = String(rawCellRef).trim();
          const cellRefMatch = normalizedCellRef.match(/^([A-Za-z]{1,3})([1-9][0-9]*)$/);
          if (!cellRefMatch) fail("REPORT_XLSX_INVALID", `XLSX cell reference некорректен: ${normalizedCellRef.slice(0, 40)}`);
          index = reportColumnIndex(normalizedCellRef);
          const cellRow = Number(cellRefMatch[2]);
          if (index === null || index < 0 || index >= 16384 || !Number.isSafeInteger(cellRow) || cellRow < 1 || cellRow > 1048576) {
            fail("REPORT_XLSX_INVALID", `XLSX cell reference вне допустимого диапазона: ${normalizedCellRef.slice(0, 40)}`);
          }
        }
        nextImplicitColumn = Math.max(nextImplicitColumn, index + 1);

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
text = text[:start] + replacement + text[end:]
path.write_text(text, encoding="utf-8")
print("OZON_XLSX_IMPLICIT_CELL_REF_PATCH_APPLIED")
