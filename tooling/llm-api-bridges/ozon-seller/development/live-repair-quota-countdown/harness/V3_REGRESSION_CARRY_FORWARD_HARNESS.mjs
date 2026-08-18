import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const base=path.resolve(process.argv[2]||''), candidate=path.resolve(process.argv[3]||'');
if(!fs.existsSync(path.join(base,'service_worker.js'))||!fs.existsSync(path.join(candidate,'service_worker.js'))) throw new Error('usage: node V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs <exact-step4-base-dir> <exact-v3-candidate-dir>');
const assert=(v,m)=>{if(!v)throw new Error(m)}; const sha=(p)=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert(sha(path.join(base,'service_worker.js'))==='7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd','Step4 worker SHA mismatch');
assert(sha(path.join(candidate,'service_worker.js'))==='34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a','V3 worker SHA mismatch');
assert(sha(path.join(candidate,'content_script.js'))==='d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001','V3 content SHA mismatch');
const inventory=['manifest.json','popup.css','popup.html','popup.js','shared/ai_adapters.js','shared/bridge_autorun_model.js','shared/composer_send.js','shared/conversation_identity.js','shared/manual_controls.js','shared/ozon_contract.js','shared/ozon_credentials.js','shared/ozon_provider.js','shared/proven_writing_block_capture.js','shared/provider_transport_core.js','shared/runtime_names.js'];
for(const rel of inventory) assert(sha(path.join(base,rel))===sha(path.join(candidate,rel)),`protected file drift: ${rel}`);
console.log('V3B_PROTECTED_15_BYTE_IDENTICAL_PASS');
function extractFunction(src,name){
  const patterns=[`async function ${name}(`,`function ${name}(`]; let at=-1;
  for(const p of patterns){at=src.indexOf(p);if(at>=0)break;} if(at<0)throw new Error(`function missing: ${name}`);
  const open=src.indexOf('{',at); if(open<0)throw new Error(`function brace missing: ${name}`);
  let depth=0,quote=null,escape=false,line=false,block=false;
  for(let i=open;i<src.length;i++){
    const c=src[i],n=src[i+1];
    if(line){if(c==='\n')line=false;continue;} if(block){if(c==='*'&&n==='/'){block=false;i++;}continue;}
    if(quote){if(escape){escape=false;continue;}if(c==='\\'){escape=true;continue;}if(c===quote){quote=null;continue;}continue;}
    if(c==='/'&&n==='/'){line=true;i++;continue;} if(c==='/'&&n==='*'){block=true;i++;continue;} if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='{')depth++; else if(c==='}'){depth--;if(depth===0)return src.slice(at,i+1);}
  }
  throw new Error(`unterminated function: ${name}`);
}
const bsw=fs.readFileSync(path.join(base,'service_worker.js'),'utf8'), csw=fs.readFileSync(path.join(candidate,'service_worker.js'),'utf8');
const exactFns=[
  'ensureBatchCapabilityAndPlanning','buildBatchQueryPlan','ensureBatchQueryPlanning',
  'prepareProviderQuotaForCommand','persistBatchQuotaWait','processBatchQueue',
  'normalizedProviderResultCacheState','readAnalyticsResultCache','readAnalyticsResultCacheForCurrentSettings','storeAnalyticsResultCache','storeAnalyticsResultCacheForCurrentSettings','acquisitionPlanning','cachePlanning','buildCachedSingleResult',
  'finalizeAutoBatch','finalizeManualBatch','attemptAutoDelivery','attemptManualBatchDelivery'
];
for(const fn of exactFns) assert(extractFunction(bsw,fn)===extractFunction(csw,fn),`protected worker function drift: ${fn}`);
console.log('V3B_STEP1_SECURITY_CARRY_FORWARD_PASS');
console.log('V3B_STEP2_PLANNER_PROJECTION_CARRY_FORWARD_PASS');
console.log('V3B_STEP4_CACHE_PREFETCH_CARRY_FORWARD_PASS');
console.log('V3B_DELIVERY_FSM_CARRY_FORWARD_PASS');
console.log('V3B_STEP3_INTEGRATION_SURFACE_CARRY_FORWARD_PASS');
const contract=fs.readFileSync(path.join(candidate,'shared/ozon_contract.js'),'utf8');
for(const fn of ['analyticsCoalescingDescriptor','buildAnalyticsCoalescedCommand','projectAnalyticsDataResult','verifyProviderResponse','planCommandForSellerCapability']) assert(contract.includes(`function ${fn}(`)||contract.includes(`async function ${fn}(`),`contract function missing: ${fn}`);
console.log('V3B_CONTRACT_PROTECTED_FUNCTIONS_PRESENT_PASS');
console.log('V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS');
