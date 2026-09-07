#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";

function loadClassic(file) {
  vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file, displayErrors: true });
}

const repo = path.resolve(process.argv[2] || ".");
const corePath = path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "dist-step7-candidate", "shared", "provider_transport_core.js");
loadClassic(corePath);
const parser = globalThis.ProviderTransportCore.parseAiReadableReportBytes;
assert.equal(typeof parser, "function");

function u16(value) { const out = Buffer.alloc(2); out.writeUInt16LE(value >>> 0); return out; }
function u32(value) { const out = Buffer.alloc(4); out.writeUInt32LE(value >>> 0); return out; }

function makeStoredZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const [name, rawValue] of Object.entries(entries)) {
    const nameBytes = Buffer.from(name, "utf8");
    const data = Buffer.from(String(rawValue), "utf8");
    const local = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(0),
      u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), nameBytes, data
    ]);
    localParts.push(local);
    const central = Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(0),
      u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBytes
    ]);
    centralParts.push(central);
    offset += local.length;
  }
  const central = Buffer.concat(centralParts);
  const eocd = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(centralParts.length), u16(centralParts.length),
    u32(central.length), u32(offset), u16(0)
  ]);
  return new Uint8Array(Buffer.concat([...localParts, central, eocd]));
}

function makeXlsx(sheet, sharedStrings) {
  const workbook = `<?xml version="1.0" encoding="UTF-8"?>\n<x:workbook xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:rel="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><x:sheets><x:sheet name="Placement" sheetId="1" rel:id="rId1"/></x:sheets></x:workbook>`;
  const rels = `<?xml version="1.0" encoding="UTF-8"?>\n<pkg:Relationships xmlns:pkg="http://schemas.openxmlformats.org/package/2006/relationships"><pkg:Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="xl/worksheets/sheet1.xml"/></pkg:Relationships>`;
  const entries = {
    "xl/workbook.xml": workbook,
    "xl/_rels/workbook.xml.rels": rels,
    "xl/worksheets/sheet1.xml": sheet
  };
  if (sharedStrings != null) entries["xl/sharedStrings.xml"] = sharedStrings;
  return makeStoredZip(entries);
}

const shared = `<?xml version="1.0" encoding="UTF-8"?>\n<x:sst xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><x:si><x:t>sku</x:t></x:si><x:si><x:t>placement_cost</x:t></x:si><x:si><x:t>warehouse</x:t></x:si><x:si><x:t>1636048691</x:t></x:si><x:si><x:t>SAMARA</x:t></x:si></x:sst>`;

// Core live-failure reproduction: valid CT_Cell entries omit optional @r.
const implicitSheet = `<?xml version="1.0" encoding="UTF-8"?>\n<x:worksheet xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><x:sheetData><x:row r="1"><x:c t="s"><x:v>0</x:v></x:c><x:c t="s"><x:v>1</x:v></x:c><x:c t="s"><x:v>2</x:v></x:c></x:row><x:row r="2"><x:c t="s"><x:v>3</x:v></x:c><x:c><x:v>123.45</x:v></x:c><x:c t="s"><x:v>4</x:v></x:c></x:row></x:sheetData></x:worksheet>`;
const implicit = await parser(makeXlsx(implicitSheet, shared), { contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", pathname: "/placement.xlsx", offset: 0, limit: 20 });
assert.deepEqual(implicit.available_sheets, ["Placement"]);
assert.deepEqual(implicit.sheet.columns, ["sku", "placement_cost", "warehouse"]);
assert.equal(implicit.sheet.row_count, 1);
assert.deepEqual(implicit.sheet.rows, [["1636048691", 123.45, "SAMARA"]]);
assert.deepEqual(implicit.sheet.row_numbers, [2]);
console.log("OZON_XLSX_OPTIONAL_CELL_REF_MATERIALIZATION_PASS");

// Mixed explicit/implicit references: explicit gaps must be preserved and the next implicit cell follows the last occupied column.
const mixedSheet = `<?xml version="1.0" encoding="UTF-8"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>sku</t></is></c><c t="inlineStr"><is><t>placement_cost</t></is></c><c r="D1" t="inlineStr"><is><t>warehouse</t></is></c><c t="inlineStr"><is><t>note</t></is></c></row><row r="2"><c r="A2"><v>1636048691</v></c><c><v>321.5</v></c><c r="D2" t="inlineStr"><is><t>SAMARA</t></is></c><c t="inlineStr"><is><t>ok</t></is></c></row></sheetData></worksheet>`;
const mixed = await parser(makeXlsx(mixedSheet, null), { contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", pathname: "/placement.xlsx", offset: 0, limit: 20 });
assert.deepEqual(mixed.sheet.columns, ["sku", "placement_cost", "column_3", "warehouse", "note"]);
assert.deepEqual(mixed.sheet.rows, [[1636048691, 321.5, "", "SAMARA", "ok"]]);
console.log("OZON_XLSX_MIXED_EXPLICIT_IMPLICIT_CELL_REF_PASS");

// Row @r is optional too. Row numbers must advance by lexical worksheet order, not by count of previously non-empty rows.
const implicitRowsSheet = `<?xml version="1.0" encoding="UTF-8"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row><c t="inlineStr"><is><t>sku</t></is></c></row><row><c><v>1636048691</v></c></row><row><c/></row><row><c><v>999</v></c></row></sheetData></worksheet>`;
const implicitRows = await parser(makeXlsx(implicitRowsSheet, null), { contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", pathname: "/placement.xlsx", offset: 0, limit: 20 });
assert.deepEqual(implicitRows.sheet.columns, ["sku"]);
assert.equal(implicitRows.sheet.row_count, 2);
assert.deepEqual(implicitRows.sheet.rows, [[1636048691], [999]]);
assert.deepEqual(implicitRows.sheet.row_numbers, [2, 4]);
console.log("OZON_XLSX_OPTIONAL_ROW_REF_INFERENCE_PASS");

// Explicit sparse row references establish the base for following implicit row numbering.
const sparseRowsSheet = `<?xml version="1.0" encoding="UTF-8"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="5"><c t="inlineStr"><is><t>sku</t></is></c></row><row><c><v>1636048691</v></c></row></sheetData></worksheet>`;
const sparseRows = await parser(makeXlsx(sparseRowsSheet, null), { contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", pathname: "/placement.xlsx", offset: 0, limit: 20 });
assert.deepEqual(sparseRows.sheet.row_numbers, [6]);
console.log("OZON_XLSX_SPARSE_EXPLICIT_THEN_IMPLICIT_ROW_REF_PASS");

// A present but malformed explicit cell reference must fail closed instead of silently dropping the cell.
const badCellRefSheet = `<?xml version="1.0" encoding="UTF-8"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="NOT_A_CELL" t="inlineStr"><is><t>sku</t></is></c></row></sheetData></worksheet>`;
await assert.rejects(
  parser(makeXlsx(badCellRefSheet, null), { contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", pathname: "/placement.xlsx" }),
  (error) => error?.code === "REPORT_XLSX_INVALID"
);
console.log("OZON_XLSX_MALFORMED_EXPLICIT_CELL_REF_FAIL_CLOSED_PASS");

const badRowRefSheet = `<?xml version="1.0" encoding="UTF-8"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="0"><c t="inlineStr"><is><t>sku</t></is></c></row></sheetData></worksheet>`;
await assert.rejects(
  parser(makeXlsx(badRowRefSheet, null), { contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", pathname: "/placement.xlsx" }),
  (error) => error?.code === "REPORT_XLSX_INVALID"
);
console.log("OZON_XLSX_MALFORMED_EXPLICIT_ROW_REF_FAIL_CLOSED_PASS");

console.log("OZON_XLSX_IMPLICIT_CELL_REF_ROOT_CAUSE_REGRESSION_PASS");
