#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";

const root=path.resolve(process.argv[2]||".");
const decisionPath=path.resolve(process.argv[3]||"tooling/llm-api-bridges/ozon-seller/validation/OZON_STEP5_EXACT_DECISION_MATRIX_2026-08-29.json");
const baseRoot=process.argv[4]?path.resolve(process.argv[4]):null;
const TREE="3c0412d640343e00b5a08f3419a3e6fdb7b1c327d694c8ad3351729af5c4d7ce";
const CHANGED={
  "shared/ozon_operation_registry.js":"2b3143632d964e4c10ad29b5a85b36c69698d9bf59521ade92279f88de6ec91f",
  "shared/ozon_contract.js":"4e6f488b707cd1e66f78ccbdb50688d18d430c47b796b1684c1f96e245235920",
  "shared/ozon_entitlements.js":"5f31664e1a0fbb7cada89c0d7673a7720c72ee2ce60fa27a7294ddec9ad30ad3",
  "shared/provider_transport_core.js":"5b8d085a6be3a26a4278aa6ea718656fd66293a72b7957c5e377284c9f6188a7"
};
const PROTECTED={
  "content_script.js":"a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd",
  "popup.js":"9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070",
  "service_worker.js":"a85b0d47b14065266221d9b3fcf3194cbaa78d96ead792fbe20834f8ee7a54a3",
  "shared/ozon_provider.js":"16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b",
  "shared/ozon_guidance.js":"8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508",
  "shared/work_session_model.js":"11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855",
  "shared/bridge_autorun_model.js":"c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5",
  "shared/manual_controls.js":"81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e",
  "shared/ai_adapters.js":"5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9"
};
function assert(x,m){if(!x)throw new Error(m)}
function sha(b){return crypto.createHash("sha256").update(b).digest("hex")}
function fileSha(dir,rel){return sha(fs.readFileSync(path.join(dir,rel)))}
function treeDigest(dir){const files=[];const walk=d=>{for(const n of fs.readdirSync(d).sort()){const p=path.join(d,n),s=fs.statSync(p);s.isDirectory()?walk(p):files.push(p)}};walk(dir);return sha(Buffer.from(files.map(p=>`${path.relative(dir,p).split(path.sep).join("/")}\0${sha(fs.readFileSync(p))}\n`).join("")))}
function load(dir){const c={console,TextDecoder,TextEncoder,Uint8Array,ArrayBuffer,crypto:{randomUUID:()=>"00000000-0000-4000-8000-000000000000"}};vm.createContext(c);for(const rel of ["shared/ozon_operation_registry.js","shared/ozon_entitlements.js","shared/ozon_contract.js","shared/provider_transport_core.js"])vm.runInContext(fs.readFileSync(path.join(dir,rel),"utf8"),c,{filename:rel});return c}
function toVm(c,v){return vm.runInContext("JSON.parse("+JSON.stringify(JSON.stringify(v))+")",c)}

assert(treeDigest(root)===TREE,"Step5 production tree mismatch");
for(const [r,h] of Object.entries(CHANGED))assert(fileSha(root,r)===h,`${r} hash mismatch`);
for(const [r,h] of Object.entries(PROTECTED))assert(fileSha(root,r)===h,`${r} protected hash mismatch`);
console.log("STEP5_EXACT_STEP3_PROTECTED_RUNTIME_IDENTITIES_PASS");

const d=JSON.parse(fs.readFileSync(decisionPath,"utf8"));
assert(d.authority?.seller_swagger_sha256==="39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40","decision Swagger authority mismatch");
assert(d.counts?.rows===118&&(d.counts?.IMPLEMENT_READ??d.counts?.implement_reads)===28&&d.counts?.REJECT_SERVER_SIDE_GENERATION_OR_CREATION===60&&d.counts?.REJECT_MUTATION_SIDE_EFFECT===25&&d.counts?.REJECT_SUNSET_REPLACED===3&&d.counts?.REJECT_DEPRECATED_REPLACED===2,"frozen decision counts mismatch");
const reads=d.rows.filter(r=>r.terminal_decision==="IMPLEMENT_READ"), rejected=d.rows.filter(r=>r.terminal_decision!=="IMPLEMENT_READ");
assert(reads.length===28&&rejected.length===90,"frozen 118 split mismatch");
console.log("STEP5_FROZEN_118_DECISION_AUTHORITY_PASS");

const c=load(root),R=c.OzonOperationRegistry,C=c.OzonContract,E=c.OzonEntitlements,T=c.ProviderTransportCore;
const entries=Object.entries(R.OPERATIONS), seller=entries.filter(([,m])=>m.provider==="seller_api");
assert(seller.length===219,`Seller aliases ${seller.length} != 219`);assert(entries.length===229,`registry ${entries.length} != 229`);
assert(R.catalogValidation(C.OPERATIONS).ok,JSON.stringify(R.catalogValidation(C.OPERATIONS).errors));
const byKey=new Map(seller.map(([a,m])=>[`${m.method} ${m.path}`,a]));
for(const r of reads){const alias=byKey.get(r.operation_key);assert(alias===r.alias,`${r.operation_key} alias ${alias} != ${r.alias}`);const m=R.operation(alias);assert(m.effect==="READ"&&m.execution_enabled===true,`${alias} not READ enabled`);assert(m.privacy_policy===r.privacy_policy,`${alias} privacy`);assert(m.cluster===r.cluster&&m.section===r.section,`${alias} taxonomy`);assert(m.entitlement_key===r.operation_key,`${alias} entitlement key`);if(r.response_kind==="WORKFLOW_STATUS_URL")assert(m.workflow_role==="explicit_workflow_read_step",`${alias} workflow role`);const cmd=C.normalizeCommand(m.template),req=C.buildRequest(cmd,{});assert(`${req.method} ${req.path}`===r.operation_key,`${alias} request`);assert(req.url===`https://api-seller.ozon.ru${m.path}`,`${alias} url`);const ent=E.requirementFor(cmd);assert(ent.known===true&&ent.required===false,`${alias} entitlement`)}
console.log("STEP5_28_NEW_SELLER_READS_EXACT_BINDING_PASS");

if(baseRoot){const b=load(baseRoot),baseEntries=Object.entries(b.OzonOperationRegistry.OPERATIONS);assert(baseEntries.length===201,"Step3 registry count != 201");for(const [alias,bm] of baseEntries){const cm=R.OPERATIONS[alias];assert(cm&&JSON.stringify(cm)===JSON.stringify(bm),`Step3 registry metadata changed ${alias}`);const bc=b.OzonContract.normalizeCommand(bm.template),cc=C.normalizeCommand(cm.template);assert(JSON.stringify(cc)===JSON.stringify(bc),`Step3 template changed ${alias}`);const br=bm.provider==="performance_api"?b.OzonContract.buildPerformanceRequest(bc,{}):b.OzonContract.buildRequest(bc,{}),cr=bm.provider==="performance_api"?C.buildPerformanceRequest(cc,{}):C.buildRequest(cc,{});for(const f of ["url","method","body","path","host_alias"])assert(cr[f]===br[f],`Step3 wire changed ${alias}.${f}`);if(bm.provider!=="performance_api"){const at=Date.parse("2026-08-29T00:00:00Z");assert(JSON.stringify(E.requirementFor(cc,null,at))===JSON.stringify(b.OzonEntitlements.requirementFor(bc,null,at)),`Step3 entitlement changed ${alias}`)}}console.log("STEP5_ALL_201_STEP3_OPERATION_SEMANTICS_PRESERVED_PASS")}

const gated=reads.filter(r=>r.privacy_policy==="operator_personal_data_gate");assert(gated.length===9,"Step5 gated != 9");assert(seller.filter(([,m])=>m.policy_group==="personal_data_read").length===19,"total Personal Data gates != 19");for(const r of gated){const m=R.operation(r.alias);assert(m.safety_class==="PERSONAL_DATA_READ_GATED"&&m.policy_group==="personal_data_read"&&m.default_allowed===false,`${r.alias} gate metadata`)}console.log("STEP5_PERSONAL_DATA_EXISTING_GATE_ATTACHMENT_9_PASS");

const binary=reads.filter(r=>r.response_kind==="DIRECT_BINARY");assert(binary.length===4,"direct binary != 4");for(const r of binary){const m=R.operation(r.alias);assert(m.response_style==="binary",`${r.alias} response style`);const expect=(r.operation_key.includes("get-png")||r.operation_key.endsWith("get-barcode"))?"image/png":"application/pdf";assert(JSON.stringify(m.response_content_types)===JSON.stringify([expect]),`${r.alias} content type`);const req=C.buildRequest(C.normalizeCommand(m.template),{});assert(req.response_style==="binary"&&req.response_content_types?.[0]===expect,`${r.alias} trusted response metadata`)}console.log("STEP5_DIRECT_BINARY_METADATA_4_PASS");

let bad=false;try{C.normalizeCommand(toVm(c,{operation:"cargoes_label_transport_status",params:{}}))}catch(e){bad=e.code==="INVALID_OPERATION_PARAMS"}assert(bad,"operation_id must be required despite Swagger operation_idd typo");C.normalizeCommand(toVm(c,{operation:"cargoes_label_transport_status",params:{operation_id:"op-1"}}));console.log("STEP5_SWAGGER_OPERATION_IDD_TYPO_FAIL_CLOSED_RESOLUTION_PASS");
for(const params of [{},{sku:["1"],offer_id:["1"]}]){let x=false;try{C.normalizeCommand(toVm(c,{operation:"fbs_stock_by_warehouse_v1",params}))}catch(e){x=e.code==="INVALID_OPERATION_PARAMS"}assert(x,"stocks oneOf must reject none/both")};C.normalizeCommand(toVm(c,{operation:"fbs_stock_by_warehouse_v1",params:{sku:["1"]}}));C.normalizeCommand(toVm(c,{operation:"product_certification_params_v2",params:{params:{certificate_country:"RU",skus:["1"],files:[{file_content:"AA==",name:"cert.pdf"}]}}}));let unknown=false;try{C.normalizeCommand(toVm(c,{operation:"product_certification_params_v2",params:{params:{unexpected:true}}}))}catch(e){unknown=e.code==="UNKNOWN_OPERATION_PARAM"}assert(unknown,"nested certification unknown field must reject");console.log("STEP5_EXACT_REQUEST_NORMALIZERS_PASS");

const safe=C.sanitizeResult(toVm(c,{operation:"cargoes_label_get",params:{operation_id:"op-1"}}),toVm(c,{status:"ready",file_url:"https://files.example.invalid/report.pdf"}));assert(safe.file_url==="https://files.example.invalid/report.pdf","workflow URL must remain data only");console.log("STEP5_WORKFLOW_URL_DATA_ONLY_SANITIZATION_PASS");
function headers(v){return{get(n){return v[String(n).toLowerCase()]??null}}}let count=0;const bytes=Uint8Array.from([0x89,0x50,0x4e,0x47,0,255,1,2]);const okFetch=async()=>{count++;return{ok:true,status:200,headers:headers({"content-type":"image/png"}),body:{getReader(){let done=false;return{async read(){if(done)return{done:true};done=true;return{done:false,value:bytes}}}}}}};const result=await T.executeJsonOnce({fetchImpl:okFetch,request:{url:"https://api-seller.ozon.ru/x",method:"POST",headers:{},body:"{}",response_style:"binary",response_content_types:["image/png"]},now:(()=>{let n=0;return()=>++n})()});assert(count===1&&result.parsed?.file_content_base64==="iVBORwD/AQI="&&result.parsed?.byte_length===8&&result.parsed?.content_type==="image/png","binary bytes projection");console.log("STEP5_BINARY_BYTE_PRESERVING_SINGLE_REQUEST_PASS");
count=0;const er=await T.executeJsonOnce({fetchImpl:async()=>{count++;return{ok:false,status:400,headers:headers({"content-type":"application/json"}),text:async()=>'{"code":"bad_request"}'}},request:{url:"https://api-seller.ozon.ru/x",method:"POST",headers:{},body:"{}",response_style:"binary",response_content_types:["application/pdf"]},now:()=>1});assert(count===1&&er.parsed?.code==="bad_request","binary JSON error handling");console.log("STEP5_BINARY_ERROR_JSON_SINGLE_REQUEST_PASS");
count=0;let mismatch=false;try{await T.executeJsonOnce({fetchImpl:async()=>{count++;return{ok:true,status:200,headers:headers({"content-type":"text/html"}),text:async()=>"<html/>"}},request:{url:"https://api-seller.ozon.ru/x",method:"POST",headers:{},body:"{}",response_style:"binary",response_content_types:["application/pdf"]},now:()=>1})}catch(e){mismatch=e.code==="PROVIDER_BINARY_CONTENT_TYPE_MISMATCH"&&e.external_request_executed===true}assert(mismatch&&count===1,"binary content type mismatch must fail after one request");console.log("STEP5_BINARY_CONTENT_TYPE_FAIL_CLOSED_PASS");
for(const r of rejected)assert(!byKey.has(r.operation_key),`rejected endpoint enabled ${r.operation_key}`);console.log("STEP5_90_NON_READ_OR_REPLACED_ENDPOINTS_NOT_ENABLED_PASS");
const sw=fs.readFileSync(path.join(root,"service_worker.js"),"utf8");assert(sw.indexOf("ensureBatchLocalPolicy")<sw.indexOf("ensureBatchCapabilityAndPlanning"),"Personal Data ordering changed");assert(!gated.some(r=>sw.includes(r.alias)),"service worker hard-coded new gated alias");const provider=fs.readFileSync(path.join(root,"shared/ozon_provider.js"),"utf8");assert(!/file_url[^\n]{0,120}fetch|fetch[^\n]{0,120}file_url/i.test(provider),"provider auto-fetches document URL");console.log("STEP5_NO_HIDDEN_POLLING_FANOUT_CHAINING_OR_URL_FETCH_PASS");
console.log(JSON.stringify({seller_aliases:seller.length,step5_new_reads:reads.length,step5_new_gated:gated.length,direct_binary:binary.length,tree:TREE}));
console.log("OZON_STEP5_WORKFLOW_REPORT_DOCUMENT_REGRESSION_PASS");
