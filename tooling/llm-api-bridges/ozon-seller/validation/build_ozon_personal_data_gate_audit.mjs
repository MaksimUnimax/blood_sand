import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const candidateRoot = path.resolve(process.argv[2]);
const masterPath = path.resolve(process.argv[3]);
const outDir = path.resolve(process.argv[4]);

const EXPECTED_STEP3_TREE = 'ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e';
const EXPECTED_SELLER_ALIASES = 191;
const EXPECTED_GATE_ALIASES = new Set([
  'posting_fbs_list',
  'posting_fbs_get',
  'posting_fbs_get_v2',
  'return_rfbs_list',
  'review_list',
  'review_info',
  'question_list',
  'review_list_v2',
  'review_info_v2',
  'question_info',
]);
const EXPECTED_SAFE_PROJECTION_ALIASES = 181;
const B0_ACCEPTED_HEAD = 'a48e06b331bb959856808aff0b8697cb9834807c';
const B0_INDEPENDENT_RESULT = 'cc6413d25dd794a12fd61b71728aaac9702bc6de';
const B0_ACCEPTANCE_PATH = 'tooling/llm-api-bridges/ozon-seller/validation/PATCH_B0_FULL_READ_CORE_ACCEPTED_2026-08-25.md';

function sha(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
function listFiles(root) {
  const out=[];
  function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(ent.isFile())out.push(p);}}
  walk(root); return out.sort((a,b)=>path.relative(root,a).localeCompare(path.relative(root,b)));
}
function treeDigest(root){
  const lines=listFiles(root).map(file=>`${path.relative(root,file).replaceAll('\\','/')}\0${sha(fs.readFileSync(file))}\n`);
  return sha(Buffer.from(lines.join('')));
}
function extractFunction(text, name) {
  const re = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`, 'm');
  const match = re.exec(text);
  assert(match, `function ${name} not found`);
  let i=text.indexOf('{', match.index + match[0].length);
  assert(i>=0, `${name} body not found`);
  const start=match.index;
  let depth=0, quote=null, escaped=false, lineComment=false, blockComment=false;
  for(;i<text.length;i++){
    const c=text[i], n=text[i+1]||'';
    if(lineComment){if(c==='\n')lineComment=false;continue;}
    if(blockComment){if(c==='*'&&n==='/'){blockComment=false;i++;}continue;}
    if(quote){if(escaped){escaped=false;continue;}if(c==='\\'){escaped=true;continue;}if(c===quote){quote=null;}continue;}
    if(c==='/'&&n==='/'){lineComment=true;i++;continue;}
    if(c==='/'&&n==='*'){blockComment=true;i++;continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='{')depth++;
    if(c==='}' && --depth===0)return text.slice(start,i+1);
  }
  throw new Error(`unbalanced function ${name}`);
}
function extractCase(text, label) {
  const token=`case "${label}":`;
  const start=text.indexOf(token); assert(start>=0, `${label} case not found`);
  const next=text.indexOf('\n      case "', start+token.length);
  return text.slice(start, next>=0?next:text.length);
}
function csvEscape(v){const s=Array.isArray(v)?v.join('|'):String(v??'');return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;}

assert(fs.existsSync(candidateRoot), 'candidate root missing');
assert(fs.existsSync(masterPath), 'master checklist missing');
const files=listFiles(candidateRoot);
assert.equal(files.length,21,'accepted Step3 candidate file count changed');
assert.equal(files.filter(f=>f.endsWith('.js')).length,18,'accepted Step3 candidate JS count changed');
assert.equal(treeDigest(candidateRoot),EXPECTED_STEP3_TREE,'accepted Step3 tree identity changed');
console.log('PERSONAL_DATA_AUDIT_STEP3_EXACT_TREE_IDENTITY_PASS');

for(const key of ['OzonRuntimeNames','OzonOperationRegistry']){try{delete globalThis[key];}catch{}}
await import(pathToFileURL(path.join(candidateRoot,'shared/runtime_names.js')).href+`?audit=${Date.now()}`);
await import(pathToFileURL(path.join(candidateRoot,'shared/ozon_operation_registry.js')).href+`?audit=${Date.now()}`);
const R=globalThis.OzonOperationRegistry; assert(R);
const sellerOps=Object.entries(R.OPERATIONS).filter(([,m])=>m?.provider==='seller_api');
assert.equal(sellerOps.length,EXPECTED_SELLER_ALIASES,'accepted Seller alias count changed');
const sellerKeys=new Set(sellerOps.map(([,m])=>`${m.method} ${m.path}`));
assert.equal(sellerKeys.size,EXPECTED_SELLER_ALIASES,'accepted Seller aliases must map one-to-one to operation keys');

const gated=[]; const safe=[]; const unexpected=[];
for(const [alias,m] of sellerOps){
  const key=`${m.method} ${m.path}`;
  if(m.privacy_policy==='operator_personal_data_gate'){
    assert.equal(m.policy_group,'personal_data_read',`${alias}.policy_group`);
    assert.equal(m.default_allowed,false,`${alias}.default_allowed`);
    assert.equal(m.safety_class,'personal_data',`${alias}.safety_class`);
    gated.push({alias,operation_key:key,method:m.method,path:m.path,cluster:m.cluster,section:m.section,privacy_policy:m.privacy_policy,policy_group:m.policy_group,default_allowed:m.default_allowed,safety_class:m.safety_class});
  } else if(m.privacy_policy==='safe_projection') {
    assert.notEqual(m.policy_group,'personal_data_read',`${alias}: safe projection must not carry personal-data policy group`);
    safe.push({alias,operation_key:key,method:m.method,path:m.path,cluster:m.cluster,section:m.section,privacy_policy:m.privacy_policy,policy_group:m.policy_group??null,default_allowed:m.default_allowed??null,safety_class:m.safety_class});
  } else unexpected.push({alias,privacy_policy:m.privacy_policy??null,policy_group:m.policy_group??null});
}
assert.deepEqual(new Set(gated.map(x=>x.alias)),EXPECTED_GATE_ALIASES,'accepted Personal Data gate alias set changed');
assert.equal(gated.length,10);
assert.equal(safe.length,EXPECTED_SAFE_PROJECTION_ALIASES);
assert.deepEqual(unexpected,[],'unexpected privacy-policy state in accepted Seller aliases');
console.log('PERSONAL_DATA_AUDIT_ACCEPTED_METADATA_10_GATE_181_SAFE_PASS');

const master=JSON.parse(fs.readFileSync(masterPath,'utf8'));
assert.equal(master?.schema,'OZON_FULL_API_MASTER_CHECKLIST_V2');
assert.equal(master?.sources?.seller_exact_contract_authority?.operations,463);
assert.equal(master?.sources?.seller_exact_contract_authority?.sha256,'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40');
const sellerRows=(master.rows||[]).filter(r=>r.provider==='seller_api');
assert.equal(sellerRows.length,463,'master Seller row count changed');
const rowByKey=new Map();
for(const row of sellerRows){assert(!rowByKey.has(row.operation_key),`duplicate master Seller operation key ${row.operation_key}`);rowByKey.set(row.operation_key,row);}
const missingAccepted=[...sellerKeys].filter(key=>!rowByKey.has(key));
assert.deepEqual(missingAccepted,[],'accepted Seller alias outside current 463 inventory');
console.log('PERSONAL_DATA_AUDIT_ACCEPTED_191_MAP_TO_CURRENT_463_PASS');

const aliasesByKey=new Map();
for(const [alias,m] of sellerOps){const key=`${m.method} ${m.path}`;aliasesByKey.set(key,{alias,meta:m});}
const auditedRows=sellerRows.map(row=>{
  const accepted=aliasesByKey.get(row.operation_key);
  if(!accepted){return {
    provider:'seller_api',operation_key:row.operation_key,http_method:row.http_method,fixed_path:row.fixed_path,
    source_category_tag:row.source_category_tag,source_category_title:row.source_category_title,purpose:row.purpose,
    accepted_step3_alias:null,accepted_step3_privacy_policy:null,accepted_step3_policy_group:null,
    step4_attachment_status:'NO_ACCEPTED_STEP3_ALIAS_PRIVACY_NOT_YET_CLASSIFIED',
    step4_gate_attached:null,
    final_privacy_decision:'PENDING_LATER_EXACT_SCHEMA_CLASSIFICATION'
  };}
  const m=accepted.meta; const gate=m.privacy_policy==='operator_personal_data_gate';
  return {
    provider:'seller_api',operation_key:row.operation_key,http_method:row.http_method,fixed_path:row.fixed_path,
    source_category_tag:row.source_category_tag,source_category_title:row.source_category_title,purpose:row.purpose,
    accepted_step3_alias:accepted.alias,accepted_step3_privacy_policy:m.privacy_policy,accepted_step3_policy_group:m.policy_group??null,
    step4_attachment_status:gate?'ACCEPTED_PERSONAL_DATA_GATE_ATTACHED':'ACCEPTED_SAFE_PROJECTION_WITHOUT_PERSONAL_DATA_GATE',
    step4_gate_attached:gate,
    final_privacy_decision:'ACCEPTED_FOR_CURRENT_IMPLEMENTED_READ_SURFACE'
  };
});
assert.equal(auditedRows.filter(r=>r.step4_gate_attached===true).length,10);
assert.equal(auditedRows.filter(r=>r.step4_gate_attached===false).length,181);
assert.equal(auditedRows.filter(r=>r.step4_gate_attached===null).length,272);
console.log('PERSONAL_DATA_AUDIT_463_ROW_ATTACHMENT_MATRIX_PASS');

const worker=fs.readFileSync(path.join(candidateRoot,'service_worker.js'),'utf8');
const localPolicy=extractFunction(worker,'ensureBatchLocalPolicy');
assert(localPolicy.includes('const personalDataEnabled = settings.personalDataEnabled === true;'));
assert(localPolicy.includes('OzonOperationRegistry.operation(entry.command.operation)'));
assert(localPolicy.includes('meta?.policy_group !== "personal_data_read" || personalDataEnabled'));
assert(localPolicy.includes('kind: "policy_error"'));
assert(localPolicy.includes('execution_command: null'));
assert(localPolicy.includes('planning: null'));
assert(localPolicy.includes('external_request_executed: false'));
for(const alias of EXPECTED_GATE_ALIASES)assert(!localPolicy.includes(alias),`runtime gate hardcodes alias ${alias}`);
console.log('PERSONAL_DATA_AUDIT_DYNAMIC_REGISTRY_DRIVEN_GATE_PASS');

const queue=extractFunction(worker,'processBatchQueue');
const policyIndex=queue.indexOf('await ensureBatchLocalPolicy');
const capabilityIndex=queue.indexOf('await ensureBatchCapabilityAndPlanning');
const queryIndex=queue.indexOf('await ensureBatchQueryPlanning');
const firstProviderIndex=queue.indexOf('await executeOzonCore');
assert(policyIndex>=0 && capabilityIndex>policyIndex && queryIndex>capabilityIndex && firstProviderIndex>queryIndex,'local policy must precede capability/query/provider execution');
assert(queue.includes('if (entry.kind === "policy_error")'));
const policyErrorIndex=queue.indexOf('if (entry.kind === "policy_error")');
const policyContinueIndex=queue.indexOf('continue;',policyErrorIndex);
assert(policyErrorIndex>=0 && policyContinueIndex>policyErrorIndex && policyContinueIndex<firstProviderIndex,'policy error must complete locally before provider execution');
const policyBranch=queue.slice(policyErrorIndex,policyContinueIndex+9);
assert(policyBranch.includes('external_request_executed: false'));
console.log('PERSONAL_DATA_AUDIT_POLICY_BEFORE_PROVIDER_AND_LOCAL_RESULT_PASS');

for(const caseName of ['OZ_SAVE_GLOBAL_SETTINGS','OZ_SAVE_SETTINGS']){
  const block=extractCase(worker,caseName);
  assert(block.includes('[KEYS.PERSONAL_DATA_ENABLED]: message.personal_data_enabled === true'));
  assert(block.includes('await storageSet(values)'));
  for(const forbidden of ['processBatchQueue(', 'executeOzonCore(', 'ensureBatchLocalPolicy(', 'requestProvider', 'OzonProvider.request']){
    assert(!block.includes(forbidden),`${caseName} must not replay or execute provider work: ${forbidden}`);
  }
}
console.log('PERSONAL_DATA_AUDIT_SETTING_ENABLE_NO_REPLAY_SOURCE_PASS');

const gatedKeys=new Set(gated.map(x=>x.operation_key));
for(const row of auditedRows.filter(r=>r.step4_gate_attached===true))assert(gatedKeys.has(row.operation_key));
const b9b17Aliases=['review_list','review_info','question_list','review_list_v2','review_info_v2','question_info'];
for(const alias of b9b17Aliases)assert(EXPECTED_GATE_ALIASES.has(alias) && gated.some(x=>x.alias===alias),`${alias} gate lost`);
console.log('PERSONAL_DATA_AUDIT_B9_B17_REVIEW_QUESTION_GATE_CARRY_FORWARD_PASS');

fs.mkdirSync(outDir,{recursive:true});
const audit={
  schema:'OZON_PERSONAL_DATA_GATE_AUDIT_V1',as_of:'2026-08-29',roadmap_step:4,
  status:'CURRENT_ACCEPTED_SELLER_READ_SURFACE_GATE_ATTACHMENT_AUDITED',
  authorities:{
    step3_exact_production_tree_sha256:EXPECTED_STEP3_TREE,
    seller_master_operation_count:463,
    seller_exact_swagger_sha256:'39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40',
    b0_personal_data_gate:{accepted_head:B0_ACCEPTED_HEAD,independent_result_commit:B0_INDEPENDENT_RESULT,acceptance_path:B0_ACCEPTANCE_PATH,
      preserved_semantics:['OFF_BLOCKS_BEFORE_PROVIDER','ZERO_PHYSICAL_BUSINESS_REQUESTS_WHEN_BLOCKED','ENABLE_DOES_NOT_REPLAY','EXPLICIT_RESUBMIT_REQUIRED']}
  },
  counts:{seller_master_rows:463,accepted_step3_seller_aliases:191,accepted_personal_data_gate_aliases:10,accepted_safe_projection_aliases:181,master_rows_without_accepted_step3_alias:272},
  runtime:{registry_driven:true,policy_before_capability_planning:true,policy_before_query_planning:true,policy_before_provider_execution:true,policy_error_local_result:true,blocked_external_request_executed:false,settings_enable_replay:false},
  gated_aliases:gated.sort((a,b)=>a.alias.localeCompare(b.alias)),
  accepted_safe_projection_aliases:safe.sort((a,b)=>a.alias.localeCompare(b.alias)),
  rows:auditedRows,
  caveat:'Rows without an accepted Step3 alias are not declared privacy-safe. Their Personal Data requirement remains pending later exact-schema classification. safe_projection is distinct from the operator Personal Data gate and must not be conflated with it.',
  final_action:'USE_THIS_ATTACHMENT_MATRIX_AS_STEP4_AUTHORITY; DO_NOT INVENT A SECOND PRIVACY MECHANISM'
};
fs.writeFileSync(path.join(outDir,'OZON_PERSONAL_DATA_GATE_AUDIT_2026-08-29.json'),JSON.stringify(audit,null,2)+'\n');

const headers=['operation_key','http_method','fixed_path','source_category_tag','purpose','accepted_step3_alias','accepted_step3_privacy_policy','accepted_step3_policy_group','step4_attachment_status','step4_gate_attached','final_privacy_decision'];
const csv=[headers.join(',')];
for(const row of auditedRows)csv.push(headers.map(h=>csvEscape(row[h])).join(','));
fs.writeFileSync(path.join(outDir,'OZON_PERSONAL_DATA_GATE_AUDIT_2026-08-29.csv'),csv.join('\n')+'\n');

const md=`# Ozon Personal Data gate audit — 2026-08-29\n\nStatus: \`CURRENT_ACCEPTED_SELLER_READ_SURFACE_GATE_ATTACHMENT_AUDITED\`\n\n## Scope\n\nRoadmap Step 4 audits attachment of the already accepted B0 operator Personal Data gate. It does not redesign the gate and does not claim privacy classification for unimplemented/unclassified Seller operations.\n\n## Counts\n\n- Seller master rows: **463**.\n- Accepted Step 3 Seller aliases: **191**.\n- Accepted aliases behind \`operator_personal_data_gate\`: **10**.\n- Accepted aliases using \`safe_projection\` without the operator gate: **181**.\n- Master rows without an accepted Step 3 alias: **272**; privacy requirement remains pending later exact-schema classification.\n\n## Preserved runtime semantics\n\n- OFF is evaluated from the registry-driven \`personal_data_read\` policy before capability planning and before provider execution.\n- Blocked entries become local \`policy_error\` results with \`external_request_executed:false\`.\n- Gate code does not hard-code the 10 operation aliases.\n- Enabling Personal Data through either settings save handler only persists the setting and returns state; it does not replay or execute a blocked command.\n- Explicit resubmit remains required, consistent with accepted B0 browser evidence.\n\n## Currently gated accepted aliases\n\n${gated.sort((a,b)=>a.alias.localeCompare(b.alias)).map(x=>`- \`${x.alias}\` — \`${x.operation_key}\` — \`${x.cluster} / ${x.section}\``).join('\n')}\n\n## Boundary\n\n\`safe_projection\` and the operator Personal Data gate are separate controls. A safe-projection alias is not automatically evidence that every possible response schema is permanently non-personal. Likewise, the 272 master rows without accepted Step 3 aliases are **not** classified safe by this audit. Their final requirement belongs to later exact-schema classification.\n\nNo fresh Seller or Performance business API request is used by this audit.\n`;
fs.writeFileSync(path.join(outDir,'OZON_PERSONAL_DATA_GATE_AUDIT_SUMMARY_2026-08-29.md'),md);

console.log(JSON.stringify(audit.counts));
console.log('OZON_PERSONAL_DATA_GATE_AUDIT_AUTHOR_GATE_PASS');
