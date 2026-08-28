import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL as U } from 'node:url';

const root=path.resolve(process.argv[2]);
const swaggerPath=process.argv[3]?path.resolve(process.argv[3]):null;
const load=n=>import(U(path.join(root,'shared',n)).href+`?b47=${Date.now()}${n}`);
for(const n of ['runtime_names.js','ozon_operation_registry.js','ozon_entitlements.js','ozon_contract.js','ozon_guidance.js']) await load(n);
const R=globalThis.OzonOperationRegistry,E=globalThis.OzonEntitlements,C=globalThis.OzonContract,G=globalThis.OzonGuidance;
assert(R&&E&&C&&G);

const operation='posting_unpaid_legal_product_list';
const apiPath='/v1/posting/unpaid-legal/product/list';
const meta=R.OPERATIONS[operation];
assert(meta);
for(const[k,v]of Object.entries({provider:'seller_api',method:'POST',path:apiPath,effect:'READ',request_style:'json_body',execution_enabled:true,currentness:'current',safety_class:'READ_SAFE',privacy_policy:'safe_projection',cluster:'orders_postings',section:'fbs_postings',guidance_visibility:'user',entitlement_key:`POST ${apiPath}`,workflow_role:'single_read'})) assert.deepEqual(meta[k],v,`${operation}.${k}`);
assert.equal(R.catalogValidation(C.OPERATIONS).ok,true);
console.log('B47_UNPAID_LEGAL_PRODUCTS_REGISTRY_PASS');

let r=C.buildRequest(C.normalizeCommand({operation,params:{cursor:'NEXT',limit:1000}}),{});
assert.equal(r.url,'https://api-seller.ozon.ru/v1/posting/unpaid-legal/product/list');
assert.equal(r.method,'POST');
assert.deepEqual(JSON.parse(r.body),{cursor:'NEXT',limit:1000});
r=C.buildRequest(C.normalizeCommand({operation,params:{cursor:'',limit:1}}),{});
assert.deepEqual(JSON.parse(r.body),{cursor:'',limit:1});
const bad=(p,c='INVALID_OPERATION_PARAMS')=>assert.throws(()=>C.normalizeCommand({operation,params:p}),e=>e?.code===c);
bad({}); bad({cursor:'x'}); bad({limit:0},'OZON_LIMIT_VIOLATION'); bad({limit:1001},'OZON_LIMIT_VIOLATION'); bad({limit:1.5}); bad({limit:1,cursor:1}); bad({limit:1,url:'https://evil.example'},'TRANSPORT_INJECTION_REJECTED'); bad({limit:1,headers:{x:'y'}},'TRANSPORT_INJECTION_REJECTED');
console.log('B47_UNPAID_LEGAL_PRODUCTS_EXACT_REQUEST_CONTRACT_PASS');

const q=E.requirementFor(C.normalizeCommand(meta.template));
const pl=C.planCommandForSellerCapability(C.normalizeCommand(meta.template),null);
assert.equal(q.known,true); assert.equal(q.required,false); assert.equal(q.default_access,'ALL_ACCOUNTS'); assert.equal(pl.action,'execute');
console.log('B47_UNPAID_LEGAL_PRODUCTS_ENTITLEMENT_PASS');

const gd=G.result({status:'guidance',cluster:'orders_postings',section:'fbs_postings',version:2});
assert(gd.choices.some(x=>x.operation===operation)); assert.equal(gd.physical_business_request_count,0); assert.equal(gd.external_request_executed,false);
console.log('B47_GUIDANCE_ZERO_REQUEST_PASS');

const clean=C.sanitizeResult(meta.template,{products:[{product_id:1,offer_id:'SKU-A',quantity:2,name:'A',image_url:'https://cdn.example.test/a.jpg'}],cursor:'NEXT',phone:'+79990000000',email:'x@example.test',address:'private',customer_name:'Secret'});
assert.equal(clean.products[0].offer_id,'SKU-A'); assert.equal(clean.products[0].image_url,'https://cdn.example.test/a.jpg'); assert.equal(clean.phone,'[REDACTED]'); assert.equal(clean.email,'[REDACTED]'); assert.equal(clean.address,'[REDACTED]'); assert.equal(clean.customer_name,'[REDACTED]');
console.log('B47_SAFE_PROJECTION_PASS');

for(const[o,p]of Object.entries({posting_fbs_cancel_reason:'/v1/posting/fbs/cancel-reason',seller_action_candidates:'/v1/seller-actions/products/candidates',posting_fbo_get:'/v2/posting/fbo/get',fbp_posting_get:'/v1/posting/fbp/get'})) assert.equal(R.OPERATIONS[o]?.path,p,o);
console.log('B47_B46_AND_EARLIER_SEMANTICS_CARRY_FORWARD_PASS');

const H={'content_script.js':'a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd','service_worker.js':'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87','shared/bridge_autorun_model.js':'c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5','shared/work_session_model.js':'11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855','shared/ozon_provider.js':'16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b','shared/provider_transport_core.js':'7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8','shared/manual_controls.js':'81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e','shared/ozon_guidance.js':'8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508'};
for(const[f,h]of Object.entries(H)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),h,f);
console.log('B47_PROTECTED_RUNTIME_IDENTITIES_PASS');

for(const f of ['shared/ozon_operation_registry.js','shared/ozon_contract.js']){const t=fs.readFileSync(path.join(root,f),'utf8'),i=t.indexOf(operation);assert(i>=0);assert(!/auto.?paginate|automatic pagination|retry|polling|provider chaining|secondary detail call|fanout/i.test(t.slice(Math.max(0,i-500),i+1800)));}
console.log('B47_NO_HIDDEN_PAGINATION_RETRY_POLLING_FANOUT_CHAINING_PASS');

if(swaggerPath){
  const raw=fs.readFileSync(swaggerPath); assert.equal(raw.length,3933043); assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
  const sw=JSON.parse(raw); assert.equal(sw.openapi,'3.0.0'); assert.equal(Object.keys(sw.paths).length,463);
  const x=sw.paths[apiPath]?.post; assert(x); assert.equal(x.operationId,'PostingAPI_UnpaidLegalProductList'); assert.deepEqual(x.tags,['FBS']); assert.notEqual(x.deprecated,true); assert(!/устаревает|будет отключ/i.test(`${x.summary||''} ${x.description||''}`));
  const reqRef=x.requestBody?.content?.['application/json']?.schema?.$ref; assert(reqRef); let req=sw; for(const q of reqRef.slice(2).split('/')) req=req[q]; assert.deepEqual(req.required,['limit']); assert.equal(req.properties.limit.minimum,1); assert.equal(req.properties.limit.maximum,1000); assert.equal(req.properties.cursor.type,'string'); assert.equal(req.properties.cursor.minLength,undefined);
  const snap=E.compileSnapshot(sw,{source_hash:'b47-exact-swagger'}); const ent=snap.operations[`POST ${apiPath}`]; assert(ent); assert.equal(ent.default_access,'ALL_ACCOUNTS'); assert.equal(ent.endpoint_allowed_subscription_types,null);
  const walk=(schema,prefix='',seen=new Set(),out=[])=>{if(!schema||typeof schema!=='object')return out;if(schema.$ref){if(seen.has(schema.$ref))return out;let y=sw;for(const q of schema.$ref.slice(2).split('/'))y=y[q];return walk(y,prefix,new Set([...seen,schema.$ref]),out)}for(const[k,v]of Object.entries(schema.properties||{})){const q=prefix?`${prefix}.${k}`:k;out.push(q);walk(v,q,seen,out)}if(schema.items)walk(schema.items,prefix+'[]',seen,out);for(const z of schema.allOf||[])walk(z,prefix,seen,out);return out};
  const props=walk(x.responses?.['200']?.content?.['application/json']?.schema); for(const expected of ['products','products[].product_id','products[].offer_id','products[].quantity','products[].name','products[].image_url','cursor']) assert(props.includes(expected),expected); assert(!props.some(z=>/(^|\.)(phone|email|address|customer_name|client_name|first_name|last_name|middle_name|driver_name|passport|token|file_url|webhook_url)(\.|$)/i.test(z)),props.join(','));
  const notif=sw.paths['/v1/notification/push-type/list']?.post; assert(notif); const notifProps=walk(notif.responses?.['200']?.content?.['application/json']?.schema); assert(notifProps.includes('types[].seller_endpoint.url')); assert(!Object.values(R.OPERATIONS).some(m=>m.path==='/v1/notification/push-type/list'));
  console.log('B47_EXACT_SWAGGER_CURRENTNESS_ENTITLEMENTS_PRIVACY_GAP_PASS');
}
console.log('B47_AUTHOR_CI_GATE_PASS');
