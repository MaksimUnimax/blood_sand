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
const executeTrustedReportFileOnce = globalThis.ProviderTransportCore.executeTrustedReportFileOnce;
assert.equal(typeof parser, "function");
assert.equal(typeof executeTrustedReportFileOnce, "function");

function u16(value) {
  const out = Buffer.alloc(2);
  out.writeUInt16LE(value >>> 0);
  return out;
}
function u32(value) {
  const out = Buffer.alloc(4);
  out.writeUInt32LE(value >>> 0);
  return out;
}

function makeStoredZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const [name, rawValue] of Object.entries(entries)) {
    const nameBytes = Buffer.from(name, "utf8");
    const data = Buffer.isBuffer(rawValue) ? rawValue : Buffer.from(String(rawValue), "utf8");
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

const WORKBOOK_XML = `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Placement" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

const SHEET_XML = `<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1"><c r="A1" t="inlineStr"><is><t>sku</t></is></c><c r="B1" t="inlineStr"><is><t>placement_cost</t></is></c></row>
    <row r="2"><c r="A2" t="inlineStr"><is><t>1636048691</t></is></c><c r="B2"><v>123.45</v></c></row>
  </sheetData>
</worksheet>`;

function makeXlsx(target, { targetMode = null, includeSheet = true } = {}) {
  const mode = targetMode ? ` TargetMode="${targetMode}"` : "";
  const rels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="${target}"${mode}/>
</Relationships>`;
  const entries = {
    "xl/workbook.xml": WORKBOOK_XML,
    "xl/_rels/workbook.xml.rels": rels
  };
  if (includeSheet) entries["xl/worksheets/sheet1.xml"] = SHEET_XML;
  return makeStoredZip(entries);
}

async function assertParsesTarget(target) {
  const result = await parser(makeXlsx(target), {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pathname: "/report.xlsx",
    offset: 0,
    limit: 10
  });
  assert.equal(result.format, "xlsx", target);
  assert.deepEqual(result.available_sheets, ["Placement"], target);
  assert.deepEqual(result.sheet.columns, ["sku", "placement_cost"], target);
  assert.deepEqual(result.sheet.rows, [["1636048691", 123.45]], target);
}

await assertParsesTarget("worksheets/sheet1.xml");
await assertParsesTarget("./worksheets/sheet1.xml");
await assertParsesTarget("xl/worksheets/sheet1.xml");
await assertParsesTarget("/xl/worksheets/sheet1.xml");
await assertParsesTarget("../xl/worksheets/sheet1.xml");

await assert.rejects(
  parser(makeXlsx("xl/worksheets/missing.xml", { includeSheet: false }), {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pathname: "/report.xlsx"
  }),
  (error) => error?.code === "REPORT_XLSX_INVALID" && /xl\/worksheets\/missing\.xml/.test(String(error?.message || "")) && !/xl\/xl\//.test(String(error?.message || ""))
);

await assert.rejects(
  parser(makeXlsx("../../evil.xml", { includeSheet: false }), {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pathname: "/report.xlsx"
  }),
  (error) => error?.code === "REPORT_XLSX_INVALID" && /package root/.test(String(error?.message || ""))
);

await assert.rejects(
  parser(makeXlsx("https://evil.example/sheet1.xml", { includeSheet: false }), {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pathname: "/report.xlsx"
  }),
  (error) => error?.code === "REPORT_XLSX_INVALID" && /external relationship target/.test(String(error?.message || ""))
);

await assert.rejects(
  parser(makeXlsx("worksheets/sheet1.xml", { targetMode: "External" }), {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pathname: "/report.xlsx"
  }),
  (error) => error?.code === "REPORT_XLSX_INVALID" && /external relationship target/.test(String(error?.message || ""))
);

let fetchCount = 0;
const brokenDownloadedXlsx = makeXlsx("xl/worksheets/missing.xml", { includeSheet: false });
await assert.rejects(
  executeTrustedReportFileOnce({
    fetchImpl: async (url, options = {}) => {
      fetchCount += 1;
      assert.equal(String(url), "https://cdn1.ozone.ru/reports/placement.xlsx");
      assert.equal(options.method, "GET");
      assert.equal(options.redirect, "error");
      assert.equal(options.credentials, "omit");
      assert.ok(!Object.keys(options.headers || {}).some((key) => /client-id|api-key|authorization/i.test(key)));
      return new Response(brokenDownloadedXlsx, {
        status: 200,
        headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
      });
    },
    url: "https://cdn1.ozone.ru/reports/placement.xlsx"
  }),
  (error) => {
    assert.equal(error?.code, "REPORT_XLSX_INVALID");
    assert.equal(error?.external_request_executed, true);
    assert.equal(error?.request_attempted, true);
    assert.equal(error?.http_status, 200);
    return true;
  }
);
assert.equal(fetchCount, 1, "post-fetch parse failure must not retry report file GET");

console.log("OZON_REPORT_XLSX_RELATIVE_TARGET_PASS");
console.log("OZON_REPORT_XLSX_DOT_RELATIVE_TARGET_PASS");
console.log("OZON_REPORT_XLSX_ROOTED_XL_TARGET_PASS");
console.log("OZON_REPORT_XLSX_ABSOLUTE_XL_TARGET_PASS");
console.log("OZON_REPORT_XLSX_LEGAL_PARENT_NORMALIZATION_PASS");
console.log("OZON_REPORT_XLSX_MISSING_ENTRY_FAIL_CLOSED_PASS");
console.log("OZON_REPORT_XLSX_TRAVERSAL_FAIL_CLOSED_PASS");
console.log("OZON_REPORT_XLSX_EXTERNAL_URI_FAIL_CLOSED_PASS");
console.log("OZON_REPORT_XLSX_TARGET_MODE_EXTERNAL_FAIL_CLOSED_PASS");
console.log("OZON_REPORT_FILE_POST_FETCH_PARSE_TELEMETRY_PASS");
console.log("OZON_REPORT_FILE_POST_FETCH_PARSE_NO_RETRY_PASS");
console.log("OZON_REPORT_XLSX_RELATIONSHIP_TARGET_REGRESSION_PASS");
