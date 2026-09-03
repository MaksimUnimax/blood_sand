#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";

function loadClassic(file) { vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file, displayErrors: true }); }
const repo = path.resolve(process.argv[2] || ".");
const shared = path.join(repo, "tooling", "llm-api-bridges", "ozon-seller", "dist-step7-candidate", "shared");
for (const file of ["ozon_operation_registry.js","ozon_contract.js","ozon_credentials.js","provider_transport_core.js","ozon_provider.js"]) loadClassic(path.join(shared, file));
const operations = globalThis.OzonOperationRegistry.OPERATIONS;

const REPORTS = [
  "report_products_create","report_returns_create_v2","report_postings_create","report_discounted_create","report_warehouse_stock",
  "report_placement_by_products_create","report_placement_by_supplies_create","report_marked_products_sales_create","report_realization_posting_create",
  "finance_document_b2b_sales","finance_mutual_settlement_report","finance_compensation_report","finance_decompensation_report"
];
const TOP_LEVEL_CODE = new Set(["report_discounted_create","report_placement_by_products_create","report_placement_by_supplies_create","report_realization_posting_create"]);
const VALIDATIONS = ["fbp_draft_direct_product_validate","fbp_draft_dropoff_product_validate","fbp_draft_pickup_product_validate"];
const DIRECT_PDFS = ["posting_fbs_act_container_labels","posting_fbs_package_label"];
const ASYNC_DOCS = [
  ["cargoes_label_create","operation_id","cargoes_label_get",(first)=>({operation_id:first.operation_id})],
  ["posting_fbs_package_label_create","result.tasks.0.task_id","posting_fbs_package_label_get_v1",(first)=>({task_id:first.result.tasks[0].task_id})],
  ["cargoes_transport_label_by_order_create","operation_id","cargoes_label_transport_by_order_status",(first)=>({operation_id:first.operation_id})],
  ["cargoes_transport_label_create","operation_id","cargoes_label_transport_status",(first)=>({operation_id:first.operation_id})],
  ["fbp_act_from_create","file_uuid","fbp_act_from_get",(first)=>({file_uuid:first.file_uuid})],
  ["fbp_act_to_create","code","fbp_act_to_get",(first)=>({code:first.code,supply_id:"1"})],
  ["fbp_label_create","code","fbp_label_get",(first)=>({code:first.code,supply_id:"1"})]
];
const ALL_26 = [...REPORTS, ...DIRECT_PDFS, ...ASYNC_DOCS.map((row)=>row[0]), ...VALIDATIONS, "chat_history_v3"];
assert.equal(ALL_26.length, 26);
assert.equal(new Set(ALL_26).size, 26);

const pathToAlias = new Map(ALL_26.map((alias)=>[operations[alias].path, alias]));
const retrievalPaths = new Map([
  [operations.cargoes_label_get.path,"cargoes_label_get"],
  [operations.posting_fbs_package_label_get_v1.path,"posting_fbs_package_label_get_v1"],
  [operations.cargoes_label_transport_by_order_status.path,"cargoes_label_transport_by_order_status"],
  [operations.cargoes_label_transport_status.path,"cargoes_label_transport_status"],
  [operations.fbp_act_from_get.path,"fbp_act_from_get"],
  [operations.fbp_act_to_get.path,"fbp_act_to_get"],
  [operations.fbp_label_get.path,"fbp_label_get"]
]);

const pdfText = "%PDF-1.4\n1 0 obj\n<< /Length 51 >>\nstream\nBT /F1 12 Tf 10 10 Td (OZON DOC OK) Tj ET\nendstream\nendobj\n%%EOF\n";
const pdfBytes = new TextEncoder().encode(pdfText);
const calls = [];
let reportCounter = 0;
const fetchImpl = async (url, options={}) => {
  const raw = String(url); calls.push({url:raw,options});
  const parsed = new URL(raw);
  const p = parsed.pathname;
  if (raw.startsWith("https://cdn1.ozone.ru/e2e/report-")) {
    const code = parsed.pathname.split("/").pop().replace(/\.csv$/,"");
    return new Response(`code;value\n${code};OK\n`, {status:200,headers:{"content-type":"text/csv"}});
  }
  if (raw.startsWith("https://cdn1.ozone.ru/e2e/doc-")) return new Response(pdfBytes,{status:200,headers:{"content-type":"application/pdf"}});
  if (p === "/v1/report/info") {
    const body = JSON.parse(String(options.body || "{}"));
    return new Response(JSON.stringify({result:{code:body.code,status:"success",error:"",file:`https://cdn1.ozone.ru/e2e/report-${body.code}.csv`,report_type:"e2e"}}),{status:200,headers:{"content-type":"application/json"}});
  }
  const alias = pathToAlias.get(p);
  if (alias && REPORTS.includes(alias)) {
    const code = `REPORT_R${++reportCounter}_${alias}`;
    const payload = TOP_LEVEL_CODE.has(alias) ? {code} : {result:{code}};
    return new Response(JSON.stringify(payload),{status:200,headers:{"content-type":"application/json"}});
  }
  if (alias === "cargoes_label_create") return new Response(JSON.stringify({operation_id:"OP_CARGO",errors:{error_reasons:[]}}),{status:200,headers:{"content-type":"application/json"}});
  if (alias === "posting_fbs_package_label_create") return new Response(JSON.stringify({result:{tasks:[{task_id:12345,task_type:"big_label"}]}}),{status:200,headers:{"content-type":"application/json"}});
  if (alias === "cargoes_transport_label_by_order_create") return new Response(JSON.stringify({operation_id:"OP_BY_ORDER",error_reasons:[]}),{status:200,headers:{"content-type":"application/json"}});
  if (alias === "cargoes_transport_label_create") return new Response(JSON.stringify({operation_id:"OP_TRANSPORT",error_reasons:[]}),{status:200,headers:{"content-type":"application/json"}});
  if (alias === "fbp_act_from_create") return new Response(JSON.stringify({errors:[],file_uuid:"FILE_UUID",is_success:true}),{status:200,headers:{"content-type":"application/json"}});
  if (alias === "fbp_act_to_create") return new Response(JSON.stringify({code:"ACT_TO_CODE"}),{status:200,headers:{"content-type":"application/json"}});
  if (alias === "fbp_label_create") return new Response(JSON.stringify({code:"LABEL_CODE"}),{status:200,headers:{"content-type":"application/json"}});
  if (alias && DIRECT_PDFS.includes(alias)) return new Response(pdfBytes,{status:200,headers:{"content-type":"application/pdf"}});
  if (alias && VALIDATIONS.includes(alias)) return new Response(JSON.stringify({approved_items:[],bundle_generated:false,bundle_id:"",rejected_items:[]}),{status:200,headers:{"content-type":"application/json"}});
  if (alias === "chat_history_v3") return new Response(JSON.stringify({has_next:false,messages:[]}),{status:200,headers:{"content-type":"application/json"}});
  const retrieval = retrievalPaths.get(p);
  if (retrieval === "cargoes_label_get") return new Response(JSON.stringify({result:{file_guid:"GUID",file_url:"https://cdn1.ozone.ru/e2e/doc-cargo.pdf"},status:"SUCCESS",errors:{error_reasons:[]}}),{status:200,headers:{"content-type":"application/json"}});
  if (retrieval === "posting_fbs_package_label_get_v1") return new Response(JSON.stringify({result:{error:"",status:"completed",file_url:"https://cdn1.ozone.ru/e2e/doc-package.pdf",printed_postings_count:1,unprinted_postings_count:0,unprinted_postings:[]}}),{status:200,headers:{"content-type":"application/json"}});
  if (retrieval === "cargoes_label_transport_by_order_status") return new Response(JSON.stringify({error_reasons:[],result:{file_url:"https://cdn1.ozone.ru/e2e/doc-transport-order.pdf",skipped_supplies_ids:[]},status:"SUCCESS"}),{status:200,headers:{"content-type":"application/json"}});
  if (retrieval === "cargoes_label_transport_status") return new Response(JSON.stringify({error_reasons:[],result:{file_url:"https://cdn1.ozone.ru/e2e/doc-transport.pdf"},status:"SUCCESS"}),{status:200,headers:{"content-type":"application/json"}});
  if (retrieval === "fbp_act_from_get") return new Response(JSON.stringify({cdn_url:"https://cdn1.ozone.ru/e2e/doc-act-from.pdf",error:"ERROR_REASON_UNSPECIFIED",status:"EXIST"}),{status:200,headers:{"content-type":"application/json"}});
  if (retrieval === "fbp_act_to_get") return new Response(JSON.stringify({error_message:"",label_url:"https://cdn1.ozone.ru/e2e/doc-act-to.pdf",state:"FINISHED"}),{status:200,headers:{"content-type":"application/json"}});
  if (retrieval === "fbp_label_get") return new Response(JSON.stringify({label_url:"https://cdn1.ozone.ru/e2e/doc-fbp-label.pdf",state:"FINISHED"}),{status:200,headers:{"content-type":"application/json"}});
  throw new Error(`unexpected URL ${raw}`);
};

let uuidCounter=0;
const provider = globalThis.OzonProviderFactory.createOzonProvider({fetchImpl,uuid:()=>`99999999-9999-4999-8999-${String(++uuidCounter).padStart(12,"0")}`,now:()=>1_800_000_000_000+uuidCounter});
const creds={clientId:"client",apiKey:"key"};

for (const alias of REPORTS) {
  const first = await provider.executeCommandObject(JSON.parse(JSON.stringify(operations[alias].template)),creds,{});
  assert.equal(first.ok,true,`${alias} create`);
  const code = first.result?.result?.code ?? first.result?.code;
  assert.ok(code,`${alias} code`);
  const info = await provider.executeCommandObject({operation:"report_info",params:{code}},creds,{});
  assert.equal(info.ok,true,`${alias} report_info`);
  assert.match(info.result?.report_file_ref || "",/^rpf_/);
  assert.ok(!JSON.stringify(info.result).includes("cdn1.ozone.ru"),`${alias} signed URL hidden`);
  assert.deepEqual(provider.reportFileRefPolicy(info.result.report_file_ref),{known:true,personal_data_required:false},`${alias} safe provenance`);
  const file = await provider.executeCommandObject({operation:"report_file_get",params:{file_ref:info.result.report_file_ref,offset:0,limit:50}}, {}, {});
  assert.equal(file.ok,true,`${alias} file`);
  assert.equal(file.result?.format,"csv",`${alias} structured format`);
  assert.deepEqual(file.result?.sheet?.columns,["code","value"]);
  assert.equal(file.result?.sheet?.rows?.[0]?.[1],"OK");
  assert.ok(!JSON.stringify(file.result).includes("file_content_base64"));
}
console.log("OZON_ALL_13_REPORT_WORKFLOWS_E2E_PASS");

for (const alias of DIRECT_PDFS) {
  const first = await provider.executeCommandObject(JSON.parse(JSON.stringify(operations[alias].template)),creds,{});
  assert.equal(first.ok,true,alias);
  assert.match(first.result?.generated_file_ref || "",/^rpf_/);
  assert.ok(!JSON.stringify(first.result).includes("file_content_base64"));
  const before=calls.length;
  const file=await provider.executeCommandObject({operation:"report_file_get",params:{file_ref:first.result.generated_file_ref}}, {}, {});
  assert.equal(calls.length,before,`${alias} inline ref zero extra network`);
  assert.equal(file.result?.format,"pdf");
  assert.match(file.result?.text_extract || file.result?.text || "",/OZON DOC OK/);
}
console.log("OZON_ALL_2_DIRECT_PDF_WORKFLOWS_E2E_PASS");

for (const [createAlias, idPath, getAlias, buildParams] of ASYNC_DOCS) {
  assert.ok(operations[getAlias],`${getAlias} retrieval descriptor`);
  const first=await provider.executeCommandObject(JSON.parse(JSON.stringify(operations[createAlias].template)),creds,{});
  assert.equal(first.ok,true,`${createAlias} create`);
  const get=await provider.executeCommandObject({operation:getAlias,params:buildParams(first.result)},creds,{});
  assert.equal(get.ok,true,`${getAlias} status/get`);
  assert.match(get.result?.generated_file_ref || "",/^rpf_/,`${getAlias} opaque ref`);
  assert.ok(!JSON.stringify(get.result).includes("cdn1.ozone.ru"),`${getAlias} URL hidden`);
  const before=calls.length;
  const file=await provider.executeCommandObject({operation:"report_file_get",params:{file_ref:get.result.generated_file_ref}}, {}, {});
  assert.equal(calls.length,before+1,`${getAlias} exactly one explicit file GET`);
  assert.equal(file.result?.format,"pdf");
  assert.match(file.result?.text_extract || file.result?.text || "",/OZON DOC OK/);
}
console.log("OZON_ALL_7_ASYNC_DOCUMENT_WORKFLOWS_E2E_PASS");

for (const alias of VALIDATIONS) {
  const first=await provider.executeCommandObject(JSON.parse(JSON.stringify(operations[alias].template)),creds,{});
  assert.equal(first.ok,true,alias);
  assert.equal(first.result?.bundle_generated,false);
}
console.log("OZON_ALL_3_VALIDATION_READS_E2E_PASS");

const chat=await provider.executeCommandObject(JSON.parse(JSON.stringify(operations.chat_history_v3.template)),creds,{});
assert.equal(chat.ok,true);
assert.equal(chat.result?.has_next,false);
assert.equal(operations.chat_history_v3.privacy_policy,"operator_personal_data_gate");
console.log("OZON_CHAT_HISTORY_GATED_READ_E2E_PASS");

assert.equal(REPORTS.length+DIRECT_PDFS.length+ASYNC_DOCS.length+VALIDATIONS.length+1,26);
console.log("OZON_ALL_26_REPAIRED_READS_E2E_GATE_PASS");
