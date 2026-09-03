import fs from 'fs';
import vm from 'vm';
import assert from 'assert/strict';
import path from 'path';
import process from 'process';
const repo=path.resolve(process.argv[2]||'.');
const R=path.join(repo,'tooling','llm-api-bridges','ozon-seller','dist-step7-candidate');
const load=(p)=>vm.runInThisContext(fs.readFileSync(`${R}/${p}`,'utf8'),{filename:p});

globalThis.OzonRuntime={RUNTIME:{commandPrefix:'OZON_API_V1',resultPrefix:'OZON_RESULT_V1',version:'0.1.19',helpPrefix:'OZON_HELP_V1',helpPrefixV2:'OZON_HELP_V2',guidanceResultPrefix:'OZON_GUIDANCE_RESULT_V1',guidanceResultPrefixV2:'OZON_GUIDANCE_RESULT_V2'}};
load('shared/ozon_operation_registry.js');
load('shared/ozon_entitlements.js');
load('shared/ozon_contract.js');
load('shared/ozon_guidance.js');

const C=globalThis.OzonContract, Reg=globalThis.OzonOperationRegistry, E=globalThis.OzonEntitlements, G=globalThis.OzonGuidance;
function mustReject(label, fn, re){ let ok=false; try{fn();}catch(e){ok=true; if(re) assert.match(String(e.message),re,label);} assert.equal(ok,true,`${label}: expected reject`); }
function mustAccept(label, fn){ try{return fn();}catch(e){throw new Error(`${label}: ${e.code||''} ${e.message}`);} }

// DEFECT-003
mustReject('D003 uppercase FBO rejected',()=>C.normalizeCommand({operation:'report_postings_create',params:{filter:{processed_at_from:'2026-01-01T00:00:00Z',processed_at_to:'2026-01-02T00:00:00Z',delivery_schema:['FBO']}}}),/fbo, fbs|одним из/i);
mustReject('D003 more than one schema rejected',()=>C.normalizeCommand({operation:'report_postings_create',params:{filter:{processed_at_from:'2026-01-01T00:00:00Z',processed_at_to:'2026-01-02T00:00:00Z',delivery_schema:['fbo','fbs']}}}),/слишком много|много элементов/i);
mustAccept('D003 lowercase fbo accepted',()=>C.normalizeCommand({operation:'report_postings_create',params:{filter:{processed_at_from:'2026-01-01T00:00:00Z',processed_at_to:'2026-01-02T00:00:00Z',delivery_schema:['fbo']}}}));
assert.deepEqual(Reg.operation('report_postings_create').template.params.filter.delivery_schema,['fbo']);

// DEFECT-005/008
mustReject('D005 empty supply states rejected',()=>C.normalizeCommand({operation:'supply_order_list',params:{filter:{states:[]},limit:100,sort_by:'ORDER_CREATION',sort_dir:'DESC'}}),/хотя бы одно состояние/i);
mustAccept('D005 nonempty supply state accepted',()=>C.normalizeCommand({operation:'supply_order_list',params:{filter:{states:['COMPLETED']},limit:100,sort_by:'ORDER_CREATION',sort_dir:'DESC'}}));
assert.equal(Reg.operation('supply_order_list').template_runnable,false);
assert.equal(Reg.operation('supply_order_list').template,null);

// DEFECT-006
mustReject('D006 filterless fbs act rejected',()=>C.normalizeCommand({operation:'fbs_act_list',params:{limit:50}}),/filter.*обязателен/i);
mustReject('D006 ISO datetime fbs act rejected',()=>C.normalizeCommand({operation:'fbs_act_list',params:{limit:50,filter:{date_from:'2026-09-01T00:00:00Z',date_to:'2026-09-02T00:00:00Z'}}}),/YYYY-MM-DD|ГГГГ-ММ-ДД/i);
mustAccept('D006 provider-proven date-only form accepted',()=>C.normalizeCommand({operation:'fbs_act_list',params:{limit:50,filter:{date_from:'2026-09-01',date_to:'2026-09-02',integration_type:'ozon',status:['formed']}}}));
assert.equal(Reg.operation('fbs_act_list').template_runnable,false);

// DEFECT-007
mustReject('D007 filter required',()=>C.normalizeCommand({operation:'fbs_unfulfilled_list',params:{limit:10,sort_dir:'ASC'}}),/filter.*обязателен/i);
mustReject('D007 statuses-only rejected',()=>C.normalizeCommand({operation:'fbs_unfulfilled_list',params:{filter:{statuses:['awaiting_deliver']},limit:10,sort_dir:'ASC'}}),/ровно одну полную пару/i);
mustReject('D007 both time families rejected',()=>C.normalizeCommand({operation:'fbs_unfulfilled_list',params:{filter:{cutoff_from:'2026-09-03T00:00:00Z',cutoff_to:'2026-09-04T00:00:00Z',delivering_date_from:'2026-09-03T00:00:00Z',delivering_date_to:'2026-09-04T00:00:00Z'},limit:10}}),/ровно одну полную пару/i);
mustAccept('D007 cutoff pair accepted',()=>C.normalizeCommand({operation:'fbs_unfulfilled_list',params:{filter:{cutoff_from:'2026-09-03T00:00:00Z',cutoff_to:'2026-09-04T00:00:00Z',statuses:['awaiting_deliver']},limit:10,sort_dir:'ASC'}}));
mustAccept('D007 delivering pair accepted',()=>C.normalizeCommand({operation:'fbs_unfulfilled_list',params:{filter:{delivering_date_from:'2026-09-03T00:00:00Z',delivering_date_to:'2026-09-04T00:00:00Z'},limit:10}}));
assert.equal(Reg.operation('fbs_unfulfilled_list').template_runnable,false);

// DEFECT-004 semantic key/value privacy redaction
const d004=C.sanitizeResult({operation:'report_info',params:{code:'REPORT_X'}},{result:{file:'https://secret.example/x.csv',additional_data:[{key:'ReceiverName',value:'SECRET-NAME'},{key:'ReceiverInn',value:'SECRET-INN'},{key:'ReceiverKpp',value:'SECRET-KPP'},{key:'Amount',value:'123.45'}]}});
assert.equal(d004.result.file,'[REDACTED]');
for(const item of d004.result.additional_data.slice(0,3)) assert.equal(item.value,'[REDACTED]');
assert.equal(d004.result.additional_data[3].value,'123.45');
assert.equal(d004.result.additional_data[0].key,'ReceiverName');

// DEFECT-001 registry/guidance no static helper-wide personal gate.
const rf=Reg.operation('report_file_get');
assert.equal(rf.safety_class,'READ_SAFE');
assert.equal(rf.privacy_policy,'opaque_ref_provenance_gate');
assert.equal(rf.policy_group,undefined);

// DEFECT-009/010 guidance never emits provider-rejected default as runnable.
for(const op of ['fbp_archive_list','fbp_order_list']){
 const m=Reg.operation(op); assert.equal(m.template_runnable,false); assert.equal(m.template,null);
}
const cards=G.result({status:'ok',cluster:'supplies_fbo',version:1}).choices;
for(const op of ['supply_order_list','fbp_archive_list','fbp_order_list']){
 const card=cards.find(x=>x.operation===op); assert(card,`card ${op}`); assert.equal(card.template_runnable,false); assert.equal(card.template,null);
}

// DEFECT-011 entitlement no longer overstates FBP warehouse as all_accounts.
const req=E.requirementFor({operation:'fbp_warehouse_list',params:{}});
assert.equal(req.known,false); assert.equal(req.entitlement_key,'POST /v1/fbp/warehouse/list'); assert.deepEqual(req.reasons,['provider_account_permission_unknown']);
const planned=C.planCommandForSellerCapability({operation:'fbp_warehouse_list',params:{}},{status:'unknown',subscription_type:'UNKNOWN'});
assert.equal(planned.planning.entitlement.status,'ENTITLEMENT_UNKNOWN');
assert.equal(planned.planning.entitlement.reason,'provider_account_permission_unknown');

// Provider-level tests for DEFECT-001 provenance and DEFECT-002 metadata.
load('shared/ozon_credentials.js');
let queue=[];
globalThis.ProviderTransportCore={
 normalizeTrustedReportFileUrl:(u)=>{ const s=String(u); if(!/^https:\/\//.test(s)) throw new Error('bad url'); return s; },
 executeJsonOnce: async()=>queue.shift(),
 executeTrustedReportFileOnce: async()=>queue.shift(),
 executePerformanceJsonOnce: async()=>queue.shift(),
 reportBase64ToBytes:(b)=>Uint8Array.from(Buffer.from(b,'base64')),
 parseAiReadableReportBytes:async(bytes)=>({format:'pdf',text:'ok',byte_length:bytes.length})
};
load('shared/ozon_provider.js');
const P=globalThis.OzonProviderFactory.createOzonProvider({contract:C,fetchImpl:async()=>{throw new Error('fetch must be stubbed by PTC')},uuid:(()=>{let n=0;return()=>`u${++n}`;})(),now:(()=>{let n=1000;return()=>++n;})()});
const creds={clientId:'1',apiKey:'x'};
const okJson=(parsed)=>({httpStatus:200,ok:true,rawText:JSON.stringify(parsed),parsed,byteLength:0,elapsedMs:1,responseMeta:{content_type:'application/json',content_length:null,request_id:null,retry_after:null}});
// Safe report create remembers safe provenance.
queue.push(okJson({result:{code:'REPORT_SAFE_1'}}));
await P.executeCommandObject({operation:'report_products_create',params:{}},creds,{},{});
queue.push(okJson({result:{status:'success',file:'https://files.example/safe.csv'}}));
const info=await P.executeCommandObject({operation:'report_info',params:{code:'REPORT_SAFE_1'}},creds,{},{});
assert(info.result.report_file_ref); assert.deepEqual(P.reportFileRefPolicy(info.result.report_file_ref),{known:true,personal_data_required:false});
// Unknown historical report fails closed at ref provenance.
queue.push(okJson({result:{status:'success',file:'https://files.example/unknown.csv'}}));
const unknown=await P.executeCommandObject({operation:'report_info',params:{code:'REPORT_HISTORICAL'}} ,creds,{},{});
assert.deepEqual(P.reportFileRefPolicy(unknown.result.report_file_ref),{known:true,personal_data_required:true});
// Invalid ref is unknown, so provider can return local ref-not-found rather than falsely classify content.
assert.deepEqual(P.reportFileRefPolicy('rpf_missing'),{known:false,personal_data_required:false});
// D002 transformed request must report exact=false.
queue.push(okJson({result:{code:'REPORT_TRANSFORM'}}));
const transformed=await P.executeCommandObject(
 {operation:'report_products_create',params:{}},creds,{},
 {reportCommand:{operation:'report_products_create',params:{language:'DEFAULT'}},planning:{entitlement:{status:'SUPPORTED_AND_ENTITLED',exact_request_preserved:true}}}
);
const payload=JSON.parse(transformed.report_text.replace(/^OZON_RESULT_V1\s*/,''));
assert.equal(payload.planning.execution.command_transformed,true);
assert.equal(payload.planning.entitlement.exact_request_preserved,false);
queue.push(okJson({result:{code:'REPORT_EXACT'}}));
const exact=await P.executeCommandObject(
 {operation:'report_products_create',params:{}},creds,{},
 {reportCommand:{operation:'report_products_create',params:{}},planning:{entitlement:{status:'SUPPORTED_AND_ENTITLED',exact_request_preserved:true}}}
);
const exactPayload=JSON.parse(exact.report_text.replace(/^OZON_RESULT_V1\s*/,''));
assert.equal(exactPayload.planning.execution.command_transformed,false);
assert.equal(exactPayload.planning.entitlement.exact_request_preserved,true);

// Service worker wiring regression: dynamic policy helper is actually used by batch preflight.
const sw=fs.readFileSync(`${R}/service_worker.js`,'utf8');
assert.match(sw,/function commandRequiresPersonalDataPolicy\(command\)/);
assert.match(sw,/OzonProvider\.reportFileRefPolicy/);
assert.match(sw,/if \(!commandRequiresPersonalDataPolicy\(entry\.command\) \|\| personalDataEnabled\) return entry;/);

console.log('OZON_LIVE_GATE_CORRECTIVE_PATCH_TARGETED_REGRESSION_PASS');
console.log(JSON.stringify({defects_covered:['001','002','003','004','005','006','007','008','009','010','011'],provider_requests_real:0},null,2));
