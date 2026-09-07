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

const SECRET_SENTINEL = "PRIVATE_PAYLOAD_SENTINEL_MUST_NOT_ENTER_DIAGNOSTICS";

function makeXlsx({ cellRefs }) {
  const workbook = `<?xml version="1.0"?><x:workbook xmlns:x="urn:sheet" xmlns:q="urn:rels"><x:sheets><x:sheet name="Placement" sheetId="1" q:id="rId1"/></x:sheets></x:workbook>`;
  const rels = `<?xml version="1.0"?><pkg:Relationships xmlns:pkg="urn:pkg"><pkg:Relationship Id="rId1" Target="xl/worksheets/sheet1.xml"/></pkg:Relationships>`;
  const shared = `<?xml version="1.0"?><x:sst xmlns:x="urn:sheet"><x:si><x:t>sku</x:t></x:si><x:si><x:t>placement_cost</x:t></x:si><x:si><x:t>${SECRET_SENTINEL}</x:t></x:si><x:si><x:t>123.45</x:t></x:si></x:sst>`;
  const ref = (value) => cellRefs ? ` r="${value}"` : "";
  const sheet = `<?xml version="1.0"?><x:worksheet xmlns:x="urn:sheet"><x:sheetData>` +
    `<x:row r="1"><x:c${ref("A1")} t="s"><x:v>0</x:v></x:c><x:c${ref("B1")} t="s"><x:v>1</x:v></x:c></x:row>` +
    `<x:row r="2"><x:c${ref("A2")} t="s"><x:v>2</x:v></x:c><x:c${ref("B2")} t="s"><x:v>3</x:v></x:c></x:row>` +
    `</x:sheetData></x:worksheet>`;
  return makeStoredZip({
    "xl/workbook.xml": workbook,
    "xl/_rels/workbook.xml.rels": rels,
    "xl/sharedStrings.xml": shared,
    "xl/worksheets/sheet1.xml": sheet
  });
}

const empty = await parser(makeXlsx({ cellRefs: false }), {
  contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pathname: "/placement.xlsx",
  offset: 0,
  limit: 20
});
assert.equal(empty.format, "xlsx");
assert.deepEqual(empty.available_sheets, ["Placement"]);
assert.deepEqual(empty.sheet.columns, []);
assert.equal(empty.sheet.row_count, 0);
assert.deepEqual(empty.sheet.rows, []);
const d = empty.xlsx_structure_diagnostics;
assert.ok(d && typeof d === "object");
assert.equal(d.diagnostic_kind, "xlsx_zero_row_structure_v1");
assert.equal(d.payload_values_included, false);
assert.equal(d.sheet_data_start_tags, 1);
assert.equal(d.lexical_row_start_tags, 2);
assert.equal(d.parser_row_elements, 2);
assert.equal(d.rows_with_r, 2);
assert.equal(d.rows_without_r, 0);
assert.equal(d.lexical_cell_start_tags, 4);
assert.equal(d.parser_cell_elements, 4);
assert.equal(d.cells_with_r, 0);
assert.equal(d.cells_without_r, 4);
assert.equal(d.value_start_tags, 4);
assert.equal(d.shared_strings_present, true);
assert.equal(d.shared_string_item_start_tags, 4);
assert.equal(d.cell_type_counts.shared_string, 4);
assert.equal(JSON.stringify(d).includes(SECRET_SENTINEL), false);
assert.equal(JSON.stringify(d).includes("sku"), false);
assert.equal(JSON.stringify(d).includes("placement_cost"), false);

const normal = await parser(makeXlsx({ cellRefs: true }), {
  contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pathname: "/placement.xlsx",
  offset: 0,
  limit: 20
});
assert.deepEqual(normal.sheet.columns, ["sku", "placement_cost"]);
assert.equal(normal.sheet.row_count, 1);
assert.equal(Object.prototype.hasOwnProperty.call(normal, "xlsx_structure_diagnostics"), false);

console.log("OZON_XLSX_ZERO_ROW_DIAGNOSTIC_TRIGGER_PASS");
console.log("OZON_XLSX_ZERO_ROW_DIAGNOSTIC_MISSING_CELL_REF_SIGNAL_PASS");
console.log("OZON_XLSX_ZERO_ROW_DIAGNOSTIC_PREFIX_INDEPENDENT_COUNTS_PASS");
console.log("OZON_XLSX_ZERO_ROW_DIAGNOSTIC_PAYLOAD_FREE_PASS");
console.log("OZON_XLSX_ZERO_ROW_DIAGNOSTIC_NONEMPTY_RESULT_NO_TELEMETRY_PASS");
console.log("OZON_XLSX_LIVE_STRUCTURE_DIAGNOSTICS_REGRESSION_PASS");
