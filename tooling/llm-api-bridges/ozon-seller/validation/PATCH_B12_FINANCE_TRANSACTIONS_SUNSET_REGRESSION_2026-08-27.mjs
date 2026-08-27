import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=process.argv[2]||'/tmp/ozon-b12-exact';
for(const name of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await import(pathToFileURL(path.join(root,'shared',name)).href+`?b12=${Date.now()}-${name}`);
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);
const legacyPaths=['/v3/finance/transaction/list','/v3/finance/transaction/totals'];
for(const p of legacyPaths) assert(!Object.values(R.OPERATIONS).some(x=>x?.execution_enabled===true&&x?.path===p),`legacy route enabled: ${p}`);
console.log('B12_FINANCE_LEGACY_TRANSACTION_ROUTES_NOT_ENABLED_PASS');
const replacements={
 finance_accrual_postings:['POST','/v1/finance/accrual/postings','json_body'],
 finance_accrual_types:['POST','/v1/finance/accrual/types','no_body'],
 finance_accrual_by_day:['POST','/v1/finance/accrual/by-day','json_body']
};
for(const [alias,[method,p,style]] of Object.entries(replacements)){
 const m=R.OPERATIONS[alias]; assert(m,alias); assert.equal(m.provider,'seller_api'); assert.equal(m.method,method); assert.equal(m.path,p); assert.equal(m.effect,'READ'); assert.equal(m.request_style,style); assert.equal(m.execution_enabled,true); assert.equal(m.currentness,'current'); assert.equal(m.safety_class,'READ_SAFE'); assert.equal(m.privacy_policy,'safe_projection'); assert.equal(m.workflow_role,'single_read');
 const cmd=C.normalizeCommand(m.template); const req=C.buildRequest(cmd,{}); assert.equal(req.url,`https://api-seller.ozon.ru${p}`); assert.equal(req.method,'POST'); assert(!Array.isArray(req));
}
console.log('B12_FINANCE_REPLACEMENT_READS_ALREADY_COVERED_PASS');
let cmd=C.normalizeCommand(R.OPERATIONS.finance_accrual_by_day.template); let req=C.buildRequest(cmd,{}); assert(!Array.isArray(req)); assert.equal(R.OPERATIONS.finance_accrual_by_day.workflow_role,'single_read');
const guidance=G.result({status:'guidance',cluster:'finance',section:'accruals_balance',version:2});
for(const alias of Object.keys(replacements)) assert(guidance.choices.some(x=>x.operation===alias),alias);
assert.equal(guidance.external_request_executed,false); assert.equal(guidance.physical_business_request_count,0);
console.log('B12_FINANCE_ONE_COMMAND_ONE_REQUEST_AND_GUIDANCE_ZERO_REQUEST_PASS');
const swaggerPath=process.argv[3]||'';
if(swaggerPath&&fs.existsSync(swaggerPath)){
 const bytes=fs.readFileSync(swaggerPath); assert.equal(bytes.length,3933043); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
 const sw=JSON.parse(bytes); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,463);
 for(const [p,id] of [['/v3/finance/transaction/list','FinanceAPI_FinanceTransactionListV3'],['/v3/finance/transaction/totals','FinanceAPI_FinanceTransactionTotalV3']]){
  const op=sw.paths?.[p]?.post; assert(op,p); assert.equal(op.operationId,id); const d=op.description||''; assert.match(d,/8 сентября 2026 года/); assert.match(d,/\/v1\/finance\/accrual\/postings/); assert.match(d,/\/v1\/finance\/accrual\/types/); assert.match(d,/\/v1\/finance\/accrual\/by-day/);
 }
 for(const [p,id] of [['/v1/finance/accrual/postings','GetFinanceAccrualPostings'],['/v1/finance/accrual/types','GetFinanceAccrualTypes'],['/v1/finance/accrual/by-day','GetFinanceAccrualByDay']]){
  const op=sw.paths?.[p]?.post; assert(op,p); assert.notEqual(op.deprecated,true,p); assert.equal(op.operationId,id,p);
 }
 console.log('B12_FINANCE_EXACT_SWAGGER_SUNSET_AND_REPLACEMENT_PASS');
}
const protectedHashes={
 'shared/ozon_operation_registry.js':'15423c269337254e9d1e8941fe12a7be944fcef282a2bea45d0911bebdbed85f',
 'shared/ozon_contract.js':'12e95fe5154c42bdd163fcf31683c7cb532f8f3baaf05e1c1a415d640a91295d',
 'shared/ozon_entitlements.js':'3bd2cd3b81202fcf16b3b344e68edcd97251f4dd8373a1e03f9ac20fa420879c',
 'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd',
 'service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
 'shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5',
 'shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855',
 'shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b',
 'shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8',
 'shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e',
 'shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'
};
for(const [rel,exp] of Object.entries(protectedHashes)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex'),exp,rel);
console.log('B12_FINANCE_ZERO_PRODUCTION_DELTA_IDENTITIES_PASS');
