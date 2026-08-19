import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const EXPECTED_WORKER='dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac';
const EXPECTED_CONTENT='ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda';
const EXPECTED_CONTRACT='0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5';
const candidateDir=path.resolve(process.argv[2]||'');
if(!candidateDir||!fs.existsSync(path.join(candidateDir,'shared/ozon_contract.js')))throw new Error('usage: node B02_B03_CONTRACT_CURRENT.mjs <exact-current-candidate-dir>');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert=(v,m)=>{if(!v)throw new Error(m)};
assert(sha(path.join(candidateDir,'service_worker.js'))===EXPECTED_WORKER,'worker SHA mismatch');
assert(sha(path.join(candidateDir,'content_script.js'))===EXPECTED_CONTENT,'content SHA mismatch');
assert(sha(path.join(candidateDir,'shared/ozon_contract.js'))===EXPECTED_CONTRACT,'contract SHA mismatch');

const ctx=vm.createContext({console,TextEncoder,TextDecoder,URL,URLSearchParams,structuredClone});
ctx.globalThis=ctx;ctx.self=ctx;
vm.runInContext(fs.readFileSync(path.join(candidateDir,'shared/ozon_contract.js'),'utf8'),ctx,{filename:'shared/ozon_contract.js'});
const C=ctx.OzonContract;
assert(C&&typeof C.parseCommand==='function'&&typeof C.isCommandText==='function','OzonContract parse/isCommandText API missing');

const validAnalytics={operation:'analytics_data',params:{date_from:'2026-08-17',date_to:'2026-08-17',dimension:['day'],metrics:['revenue'],limit:1}};
const commandText=o=>`OZON_API_V1\n${JSON.stringify(o)}`;
const expectReject=(obj,label)=>{let rejected=false;try{C.parseCommand(typeof obj==='string'?obj:commandText(obj));}catch(_){rejected=true;}assert(rejected,`${label} was accepted`)};
const expectAccept=(obj,label)=>{let x;try{x=C.parseCommand(typeof obj==='string'?obj:commandText(obj));}catch(e){throw new Error(`${label} rejected: ${e?.code||''} ${e?.message||e}`)}return x};

const parsed=expectAccept(validAnalytics,'valid analytics');
assert(parsed.operation==='analytics_data','valid analytics operation changed');
assert(C.VERSION==='0.1.19','contract version mismatch');
assert(C.isCommandText(commandText(validAnalytics))===true,'valid command text is not recognized');
assert(C.isCommandText(`Обычный Markdown до команды\n${commandText(validAnalytics)}`)===false,'surrounding prose was treated as one valid command');
console.log('B02_VALID_COMMAND_CONTRACT_PASS');
console.log('B02_SURROUNDING_PROSE_NOT_COMMAND_PASS');

const nbsp=`OZON_API_V1\u00a0${JSON.stringify(validAnalytics)}`;
const nbspParsed=expectAccept(nbsp,'NBSP separator');
assert(nbspParsed.operation==='analytics_data','NBSP separator changed operation');
console.log('B02_UNICODE_SEPARATOR_PASS');

expectReject('OZON_API_V1 {"operation":"analytics_data","params":{"date_from":"2026-08-17",','malformed JSON');
console.log('B02_MALFORMED_JSON_FAIL_CLOSED_PASS');

const analyticsInvalids=[
  [{...validAnalytics,params:{...validAnalytics.params,date_from:'2026-02-30'}},'bad analytics date'],
  [{...validAnalytics,params:{...validAnalytics.params,dimension:['not_a_dimension']}},'bad analytics dimension'],
  [{...validAnalytics,params:{...validAnalytics.params,metrics:['orders_count']}},'invented analytics metric'],
  [{...validAnalytics,params:{...validAnalytics.params,filters:[{key:'brand',op:'EQ',value:'x'}]}},'forbidden brand filter'],
  [{...validAnalytics,params:{...validAnalytics.params,filters:[{key:'revenue',op:'NOPE',value:'1'}]}},'bad filter op'],
  [{...validAnalytics,params:{...validAnalytics.params,sort:[{key:'revenue',order:'SIDEWAYS'}]}},'bad sort order'],
  [{...validAnalytics,params:{...validAnalytics.params,limit:0}},'bad limit'],
  [{...validAnalytics,params:{...validAnalytics.params,offset:-1}},'bad offset'],
  [{...validAnalytics,params:{...validAnalytics.params,url:'https://evil.invalid'}},'assistant URL injection'],
  [{...validAnalytics,params:{...validAnalytics.params,headers:{Authorization:'Bearer evil'}}},'assistant header injection']
];
for(const [obj,label] of analyticsInvalids)expectReject(obj,label);
console.log('B02_ANALYTICS_STRICT_PARAMS_PASS');
console.log('B03_TRANSPORT_FIELD_INJECTION_REJECTED_PASS');

const validPQ={operation:'product_queries',params:{date_from:'2026-08-17T00:00:00Z',page:0,page_size:10,skus:['123456789'],sort_by:'BY_SEARCHES',sort_dir:'DESCENDING'}};
expectAccept(validPQ,'valid product_queries');
const pqInvalids=[
  [{...validPQ,params:{...validPQ.params,date_from:'2026-08-17'}},'product query date-only'],
  [{...validPQ,params:{...validPQ.params,skus:['not-int64']}},'product query bad SKU'],
  [{...validPQ,params:{...validPQ.params,sort_by:'BY_MAGIC'}},'product query bad sort'],
  [{...validPQ,params:{...validPQ.params,sort_dir:'SIDEWAYS'}},'product query bad sort dir'],
  [{...validPQ,params:{...validPQ.params,page:-1}},'product query bad page'],
  [{...validPQ,params:{...validPQ.params,page_size:1001}},'product query page size over max']
];
for(const [obj,label] of pqInvalids)expectReject(obj,label);
const validPQD={operation:'product_queries_details',params:{date_from:'2026-08-17T00:00:00Z',page:0,page_size:10,skus:['123456789'],limit_by_sku:5,sort_by:'BY_SEARCHES',sort_dir:'DESCENDING'}};
expectAccept(validPQD,'valid product_queries_details');
expectReject({...validPQD,params:{...validPQD.params,limit_by_sku:16}},'product_queries_details limit_by_sku over max');
console.log('B02_PRODUCT_QUERY_STRICT_PARAMS_PASS');

for(const operation of ['seller_info','posting_fbs_get','posting_fbs_cancel','order_cancel','arbitrary_http']){
  expectReject({operation,params:{}},`blocked/unsupported operation ${operation}`);
}
console.log('B02_INTERNAL_AND_BLOCKED_OPERATIONS_PASS');
console.log('B03_NO_MUTATION_OPERATION_SURFACE_PASS');

if(typeof C.formatPreExecutionErrorReport==='function'){
  const secret='SUPER_SECRET_API_KEY_0123456789';
  const raw=`OZON_API_V1 {"operation":"analytics_data","params":{"Api-Key":"${secret}"`;
  const err=Object.assign(new Error(`Api-Key: ${secret} Authorization=BearerSecret012345678901234567890123456789 user@example.com +7 999 123-45-67 https://evil.invalid/path`),{code:'INVALID_JSON'});
  const report=C.formatPreExecutionErrorReport({requestId:'b02-preexec',error:err,stage:'command_parse',commandFingerprint:C.textFingerprint(raw)});
  for(const leaked of [secret,'user@example.com','+7 999 123-45-67','https://evil.invalid/path'])assert(!report.includes(leaked),`preexec report leaked ${leaked}`);
  assert(!report.includes(raw),'preexec report leaked malformed command text');
  assert(report.includes('external_request_executed')&&report.includes('false'),'preexec report lacks zero-request provenance');
  console.log('B03_PREEXEC_REDACTION_AND_ZERO_REQUEST_PROVENANCE_PASS');
}

const source=fs.readFileSync(path.join(candidateDir,'shared/ozon_contract.js'),'utf8');
assert(!/params\.(?:url|host|method|headers|auth|authorization|client_secret)/i.test(source),'contract exposes assistant-controlled transport surface');
console.log('B03_CONTRACT_NO_ARBITRARY_TRANSPORT_SURFACE_PASS');
console.log('REAL_OZON_REQUESTS=0');
console.log('REAL_PERFORMANCE_REQUESTS=0');
console.log('B02_B03_CONTRACT_CURRENT_PASS');
