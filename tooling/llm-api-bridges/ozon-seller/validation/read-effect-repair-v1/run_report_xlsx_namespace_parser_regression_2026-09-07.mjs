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

function makeNamespacedXlsx(prefix = "x", relPrefix = "rel", packagePrefix = "pr") {
  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<${prefix}:workbook xmlns:${prefix}="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:${relPrefix}="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <${prefix}:sheets><${prefix}:sheet name="Placement" sheetId="1" ${relPrefix}:id="rId1"/></${prefix}:sheets>
</${prefix}:workbook>`;
  const rels = `<?xml version="1.0" encoding="UTF-8"?>
<${packagePrefix}:Relationships xmlns:${packagePrefix}="http://schemas.openxmlformats.org/package/2006/relationships">
  <${packagePrefix}:Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="xl/worksheets/sheet1.xml"/>
</${packagePrefix}:Relationships>`;
  const shared = `<?xml version="1.0" encoding="UTF-8"?>
<${prefix}:sst xmlns:${prefix}="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="3" uniqueCount="3">
  <${prefix}:si><${prefix}:t>sku</${prefix}:t></${prefix}:si>
  <${prefix}:si><${prefix}:t>placement_cost</${prefix}:t></${prefix}:si>
  <${prefix}:si><${prefix}:t>1636048691</${prefix}:t></${prefix}:si>
</${prefix}:sst>`;
  const sheet = `<?xml version="1.0" encoding="UTF-8"?>
<${prefix}:worksheet xmlns:${prefix}="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <${prefix}:sheetData>
    <${prefix}:row r="1"><${prefix}:c r="A1" t="s"><${prefix}:v>0</${prefix}:v></${prefix}:c><${prefix}:c r="B1" t="s"><${prefix}:v>1</${prefix}:v></${prefix}:c></${prefix}:row>
    <${prefix}:row r="2"><${prefix}:c r="A2" t="s"><${prefix}:v>2</${prefix}:v></${prefix}:c><${prefix}:c r="B2"><${prefix}:v>123.45</${prefix}:v></${prefix}:c><${prefix}:c r="C2"/></${prefix}:row>
    <${prefix}:row r="3"><${prefix}:c r="A3" t="inlineStr"><${prefix}:is><${prefix}:t>SKU-2</${prefix}:t></${prefix}:is></${prefix}:c><${prefix}:c r="B3" t="b"><${prefix}:v>1</${prefix}:v></${prefix}:c></${prefix}:row>
  </${prefix}:sheetData>
</${prefix}:worksheet>`;
  return makeStoredZip({
    "xl/workbook.xml": workbook,
    "xl/_rels/workbook.xml.rels": rels,
    "xl/sharedStrings.xml": shared,
    "xl/worksheets/sheet1.xml": sheet
  });
}

for (const [prefix, relPrefix, packagePrefix] of [["x", "rel", "pr"], ["s", "r2", "pkg"], ["main", "officeRel", "packageRel"]]) {
  const result = await parser(makeNamespacedXlsx(prefix, relPrefix, packagePrefix), {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pathname: "/placement.xlsx",
    offset: 0,
    limit: 10
  });
  assert.equal(result.format, "xlsx");
  assert.deepEqual(result.available_sheets, ["Placement"]);
  assert.deepEqual(result.sheet.columns, ["sku", "placement_cost"]);
  assert.equal(result.sheet.row_count, 2);
  assert.deepEqual(result.sheet.row_numbers, [2, 3]);
  assert.deepEqual(result.sheet.rows[0], ["1636048691", 123.45]);
  assert.deepEqual(result.sheet.rows[1], ["SKU-2", true]);
}

console.log("OZON_REPORT_XLSX_NAMESPACE_PREFIX_X_PASS");
console.log("OZON_REPORT_XLSX_NAMESPACE_PREFIX_ARBITRARY_PASS");
console.log("OZON_REPORT_XLSX_WORKBOOK_RELATIONSHIP_PREFIX_ARBITRARY_PASS");
console.log("OZON_REPORT_XLSX_SHARED_STRINGS_NAMESPACED_PASS");
console.log("OZON_REPORT_XLSX_INLINE_STRING_NAMESPACED_PASS");
console.log("OZON_REPORT_XLSX_NUMERIC_VALUE_NAMESPACED_PASS");
console.log("OZON_REPORT_XLSX_BOOLEAN_VALUE_NAMESPACED_PASS");
console.log("OZON_REPORT_XLSX_SELF_CLOSING_CELL_PASS");
console.log("OZON_REPORT_XLSX_NAMESPACE_PARSER_REGRESSION_PASS");
