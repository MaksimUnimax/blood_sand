import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';

const input=path.resolve(process.argv[2]||'.');
const dist=fs.existsSync(path.join(input,'shared/ozon_provider.js'))?input:path.join(input,'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const START=Date.parse('2026-09-12T09:06:08.452Z');
const URL_FILE='https://cdn1.ozone.ru/test-only/report.csv?signature=FIXTURE_ONLY_SECRET';
const CREDS={clientId:'123456',apiKey:'fixture-only-not-a-real-key'};
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
function world({start=START,info={},fetchStatus=200,fileFormat="csv"}={}){
 let registry=null;const payloads={};const fileUrl=fileFormat==="pdf"?URL_FILE.replace(".csv",".pdf"):URL_FILE;
 let now=start,id=0;const session={},requests=[];
 let readHook=null,writeHook=null;
 const infoValue={code:'REPORT_FIXTURE',status:'success',error:'',file:fileUrl,report_type:'seller_products',...info};
 const area={async get(key){if(readHook)await readHook();return {[key]:clone(session[key])};},async set(obj){if(writeHook)await writeHook();Object.assign(session,clone(obj));}};
 const pdf='%PDF-1.4\n1 0 obj\n<< /Length 35 >>\nstream\nBT (FIXTURE DOCUMENT) Tj ET\nendstream\nendobj\n%%EOF\n';
 const fetchImpl=async(url,options={})=>{
  const u=String(url);requests.push({url:u,options:clone(options),at:now});
  if(u==='https://api-seller.ozon.ru/v1/report/info')return new Response(JSON.stringify({result:{...infoValue,code:JSON.parse(options.body).code}}),{status:200,headers:{'content-type':'application/json'}});
  const alias=Object.keys(registry||{}).find(n=>u==='https://api-seller.ozon.ru'+registry[n].path);
  if(alias && Object.hasOwn(payloads,alias))return new Response(JSON.stringify(payloads[alias]),{status:200,headers:{'content-type':'application/json'}});
  if(alias && (alias==='posting_fbs_package_label'||alias==='posting_fbs_act_container_labels'))return new Response(pdf,{status:200,headers:{'content-type':'application/pdf'}});
  if(alias && /^report_.*_create(?:_v\d+)?$/.test(alias))return new Response(JSON.stringify({result:{code:'REPORT_FIXTURE'}}),{status:200,headers:{'content-type':'application/json'}});
  if(u===fileUrl){assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');assert(!Object.keys(options.headers||{}).some(k=>/authorization|client-id|api-key/i.test(k)));return new Response(fetchStatus===200?(fileFormat==='pdf'?pdf:'sku;qty\n123;4\n'):'forbidden',{status:fetchStatus,headers:{'content-type':fileFormat==='pdf'?'application/pdf':'text/csv'}});}
  throw new Error('Unexpected fixture endpoint '+new URL(u).pathname);
 };
 function runtime(){
  class Clock extends Date{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}}
  const c=vm.createContext({console,Date:Clock,URL,Response,Request,Headers,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,DataView,atob,btoa,structuredClone,crypto:webcrypto,fetch:fetchImpl,chrome:{storage:{session:area}}});c.globalThis=c;
  for(const f of ['runtime_names','conversation_identity','ozon_operation_registry','ozon_contract','ozon_credentials','provider_transport_core','ozon_provider','ai_delivery_capabilities','bridge_autorun_model','ozon_guidance','llm_output_report_workflow_patch'])vm.runInContext(fs.readFileSync(path.join(dist,'shared',f+'.js'),'utf8'),c,{filename:f+'.js'});
  registry=c.OzonOperationRegistry.OPERATIONS;
  const p=c.OzonProviderFactory.createOzonProvider({fetchImpl,now:()=>now,uuid:()=>`00000000-0000-4000-8000-${String(++id).padStart(12,"0")}`});
  const realm=v=>vm.runInContext('JSON.parse',c)(JSON.stringify(v));
  const call=(operation,params)=>p.executeCommandObject(realm({operation,params}),realm(CREDS),realm({}));
  return {c,p,call,async info(code='REPORT_FIXTURE'){return call('report_info',{code});},async get(ref){return call('report_file_get',{file_ref:ref});},async create(){return call('report_products_create',{});},continuation(output){return clone(c.OzonLlmOutputReportWorkflowPatch.instructionPayload(output.report_text).workflow_continuations);}};
 }
 return {runtime,requests,session,payloads,url:fileUrl,info:infoValue,setNow(v){now=v;},advance(v){now+=v;},get now(){return now;},setReadHook(fn){readHook=fn;},setWriteHook(fn){writeHook=fn;},get state(){return session.ozmb_report_file_session_state_v1;}};
}

export {world, START, URL_FILE, CREDS, clone, dist};
