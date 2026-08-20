import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const candidateDir=path.resolve(process.argv[2]||'');
const chromePath=path.resolve(process.argv[3]||'');
const expectedWorker=String(process.argv[4]||'').toLowerCase();
const EXPECTED_CONTENT='ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda';
if(!candidateDir||!fs.existsSync(path.join(candidateDir,'manifest.json'))||!chromePath||!fs.existsSync(chromePath)||!/^[0-9a-f]{64}$/.test(expectedWorker)) throw new Error('usage: node OZON_COMPOSER_WAIT_BROWSER_HARNESS.mjs <candidate-dir> <CFT-exe> <expected-worker-sha256>');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert=(v,m)=>{if(!v)throw new Error(m)};
assert(sha(path.join(candidateDir,'service_worker.js'))===expectedWorker,'candidate worker SHA mismatch');
assert(sha(path.join(candidateDir,'content_script.js'))===EXPECTED_CONTENT,'candidate content SHA mismatch');

let puppeteer;
try{puppeteer=await import('puppeteer');}catch(_){puppeteer=await import('puppeteer-core');}
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ozon-composer-wait-cft-'));
const args=[
  `--user-data-dir=${profile}`,'--remote-debugging-port=0','--enable-unsafe-extension-debugging','--no-first-run','--no-default-browser-check',
  '--disable-background-networking','--disable-component-update','--disable-sync','--metrics-recording-only',
  '--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0',
  'about:blank'
];
const child=spawn(chromePath,args,{stdio:['ignore','pipe','pipe']});
let stderr='';child.stderr.on('data',d=>stderr+=String(d));
async function waitForFile(p,timeout=10000){const start=Date.now();while(Date.now()-start<timeout){if(fs.existsSync(p)&&fs.readFileSync(p,'utf8').trim())return;await new Promise(r=>setTimeout(r,50));}throw new Error(`DevToolsActivePort timeout: ${stderr.slice(-1200)}`)}
const portFile=path.join(profile,'DevToolsActivePort');await waitForFile(portFile);
const [port,wsPath]=fs.readFileSync(portFile,'utf8').trim().split(/\r?\n/);
const browser=await puppeteer.connect({browserWSEndpoint:`ws://127.0.0.1:${port}${wsPath}`});
try{
  assert(typeof browser.installExtension==='function','Puppeteer browser.installExtension unavailable');
  const extensionId=await browser.installExtension(candidateDir);
  const swTarget=await browser.waitForTarget(t=>t.type()==='service_worker'&&t.url().startsWith(`chrome-extension://${extensionId}/`),{timeout:10000});
  const sw=await swTarget.createCDPSession();await sw.send('Runtime.enable');await sw.send('Network.enable');
  const providerNetwork=[];sw.on('Network.requestWillBeSent',e=>{if(/api-(?:seller|performance)\.ozon\.ru/i.test(e.request.url))providerNetwork.push(e.request.url)});
  async function swEval(expr){const r=await sw.send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text||'SW eval failed');return r.result.value;}
  async function waitFor(fn,timeout=7000,step=80){const start=Date.now();while(Date.now()-start<timeout){const v=await fn();if(v)return v;await new Promise(r=>setTimeout(r,step));}throw new Error('browser waitFor timeout')}

  const id='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
  const url=`https://chatgpt.com/c/${id}`;const key=`https://chatgpt.com|${id}`;
  const html=`<!doctype html><html><head><link rel="canonical" href="${url}"><style>body{margin:20px;font-family:sans-serif}form{display:block;width:700px;height:100px}textarea{display:block;width:600px;height:60px}button{display:inline-block;width:100px;height:32px}</style></head><body>
  <main><section data-turn="assistant" data-turn-id="assistant-1"><div class="code-wrap"><button id="native-copy" aria-label="Copy" onclick="window.__nativeCopyClicks=(window.__nativeCopyClicks||0)+1">Copy</button><pre><code>OZON_API_V1\n{"operation":"analytics_data","params":{"date_from":"2026-08-17","date_to":"2026-08-17","dimension":["day"],"metrics":["revenue"],"limit":1}}</code></pre></div></section></main>
  <form id="composer-form" data-testid="composer-root"><textarea id="prompt-textarea">operator draft</textarea><button id="send" type="button" data-testid="send-button" aria-label="Send" onclick="window.__sendClicks=(window.__sendClicks||0)+1;window.__sentText=document.querySelector('#prompt-textarea').value;this.dataset.testid='composer-speech-button';this.setAttribute('aria-label','Microphone');this.textContent='Mic'">Send</button></form>
  <script>window.__sendClicks=0;window.__sentText=null;window.__nativeCopyClicks=0;</script></body></html>`;
  const page=await browser.newPage();await page.setRequestInterception(true);page.on('request',req=>{if(req.isNavigationRequest()&&req.frame()===page.mainFrame()&&req.url()===url)req.respond({status:200,contentType:'text/html; charset=utf-8',body:html});else req.abort();});
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:10000});await new Promise(r=>setTimeout(r,500));
  const tabs=await swEval(`chrome.tabs.query({}).then(xs=>xs.map(x=>({id:x.id,url:x.url})))`);const tab=tabs.find(x=>x.url===url)?.id;assert(tab,'synthetic ChatGPT tab not found');
  const now=Date.now();
  const binding={binding_id:'bind-composer',revision:1,origin:'https://chatgpt.com',ai_id:'chatgpt',conversation_id:id,conversation_key:key,bound_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  const makeOp=(suffix,text)=>({operation_id:`op-${suffix}`,manual_request_id:`req-${suffix}`,status:'delivering',tab_id:tab,conversation_id:id,conversation_key:key,origin:'https://chatgpt.com',binding_snapshot:{binding_id:binding.binding_id,binding_revision:1,origin:'https://chatgpt.com',ai_id:'chatgpt',conversation_id:id,conversation_key:key},delivery_id:`delivery-${suffix}`,outgoing_text:text,delivery:{delivery_id:`delivery-${suffix}`,mode:'batch_watch_v1',phase:'claimed',outgoing_text:text,report_prefix_applied:false,baseline_assistant_turn_ids:[]},batch:{phase:'collected',request_state:'idle',next_index:0,entries:[]}});
  const quota={schema_version:1,accounts:{acct:{credential_revision:'rev',families:{'seller.analytics_data.v1':{min_interval_ms:60000,bridge_launch_safety_ms:5000,effective_interval_ms:65000,last_provider_request_at:now-1000,next_allowed_at:now+64000,credential_revision:'rev',updated_at:new Date().toISOString()}}}}};
  const cache={schema_version:1,accounts:{acct:{entries:{x:{stored_at:now-1000,expires_at:now+59000,payload:{ok:true}}}}}};
  const seed=async(op)=>swEval(`chrome.storage.local.set(${JSON.stringify({ozmb_conversation_bindings:{[key]:binding},ozmb_manual_modes:{[key]:true},ozmb_manual_operations:{[key]:op},ozmb_auto_runs:{},ozmb_provider_quota_state_v1:quota,ozmb_provider_result_cache_v1:cache})})`);
  const toastText=()=>page.evaluate(()=>document.querySelector('#ozon-llm-api-bridge-toast-root')?.innerText||'');
  const ownButtons=()=>page.evaluate(()=>{const out=[];for(const el of document.querySelectorAll('*'))if(el.shadowRoot)for(const b of el.shadowRoot.querySelectorAll('button'))if((b.textContent||'').trim().startsWith('Ozon'))out.push({text:(b.textContent||'').trim(),disabled:b.disabled,title:b.title});return out;});
  const setText=async text=>page.evaluate(value=>{const el=document.querySelector('#prompt-textarea');const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;setter.call(el,value);el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:value}));el.dispatchEvent(new Event('change',{bubbles:true}));},text);

  // A. Claimed report + occupied composer -> persistent wait -> one insertion/send -> completion.
  await seed(makeOp('wait','REPORT_FROM_PENDING_DELIVERY'));
  await page.reload({waitUntil:'domcontentloaded',timeout:10000});
  await waitFor(async()=>/Очистите поле ввода, чтобы получить отчёт\./.test(await toastText()));
  assert(await page.$eval('#prompt-textarea',el=>el.value)==='operator draft','occupied composer text was mutated');
  await new Promise(r=>setTimeout(r,2300));
  assert(/Очистите поле ввода, чтобы получить отчёт\./.test(await toastText()),'composer-wait plate auto-expired');
  const busyButtons=await ownButtons();assert(busyButtons.length>0&&busyButtons.some(x=>x.disabled),'Ozon button not busy during pending report');
  await page.click('#native-copy');assert(await page.evaluate(()=>window.__nativeCopyClicks)===1,'native Copy lost independence while waiting');
  await setText('');
  await waitFor(async()=>await page.evaluate(()=>window.__sendClicks)===1,6000);
  assert(await page.evaluate(()=>window.__sentText)==='REPORT_FROM_PENDING_DELIVERY','wrong report text inserted/sent');
  await new Promise(r=>setTimeout(r,500));
  assert(await page.evaluate(()=>window.__sendClicks)===1,'staged delivery clicked Send more than once');
  await waitFor(async()=>!(await swEval(`chrome.storage.local.get('ozmb_manual_operations').then(x=>Boolean(x.ozmb_manual_operations?.[${JSON.stringify(key)}]))`)),5000);
  assert(!/Очистите поле ввода, чтобы получить отчёт\./.test(await toastText()),'wait plate remained after insertion/completion');
  console.log('FULL_BROWSER_MANUAL_OCCUPIED_PLATE_PERSIST_PASS');
  console.log('FULL_BROWSER_MANUAL_CLEAR_INSERT_ONCE_PASS');
  console.log('FULL_BROWSER_MANUAL_EXISTING_SEND_MICROPHONE_PASS');
  console.log('FULL_BROWSER_NATIVE_COPY_WHILE_WAITING_PASS');

  // B. New claimed report -> Manual OFF cancels only pending report; quota/cache survive; OFF->ON restores readiness.
  await setText('operator draft 2');
  await page.evaluate(()=>{window.__sendClicks=0;window.__sentText=null;const b=document.querySelector('#send');b.dataset.testid='send-button';b.setAttribute('aria-label','Send');b.textContent='Send';});
  await seed(makeOp('cancel','REPORT_MUST_BE_CANCELLED'));
  await page.reload({waitUntil:'domcontentloaded',timeout:10000});
  await waitFor(async()=>/Очистите поле ввода, чтобы получить отчёт\./.test(await toastText()));
  const beforeQuota=await swEval(`chrome.storage.local.get('ozmb_provider_quota_state_v1').then(x=>JSON.stringify(x.ozmb_provider_quota_state_v1))`);
  const beforeCache=await swEval(`chrome.storage.local.get('ozmb_provider_result_cache_v1').then(x=>JSON.stringify(x.ozmb_provider_result_cache_v1))`);
  const off=await swEval(`chrome.runtime.sendMessage(${JSON.stringify({type:'OZ_SET_MANUAL_MODE',enabled:false,conversation_key:key,tab_id:tab})})`);assert(off?.ok===true&&off.enabled===false,'Manual OFF rejected');
  await swEval(`new Promise(r=>chrome.tabs.sendMessage(${tab},${JSON.stringify({type:'OZ_APPLY_MANUAL_MODE',enabled:false,conversation_key:key})},x=>r(x||null)))`);
  await waitFor(async()=>!(await swEval(`chrome.storage.local.get('ozmb_manual_operations').then(x=>Boolean(x.ozmb_manual_operations?.[${JSON.stringify(key)}]))`)));
  await waitFor(async()=>!/Очистите поле ввода, чтобы получить отчёт\./.test(await toastText()));
  assert(await swEval(`chrome.storage.local.get('ozmb_provider_quota_state_v1').then(x=>JSON.stringify(x.ozmb_provider_quota_state_v1))`)===beforeQuota,'Manual OFF mutated quota state');
  assert(await swEval(`chrome.storage.local.get('ozmb_provider_result_cache_v1').then(x=>JSON.stringify(x.ozmb_provider_result_cache_v1))`)===beforeCache,'Manual OFF mutated cache state');
  assert(await page.$eval('#prompt-textarea',el=>el.value)==='operator draft 2','Manual OFF mutated operator draft');
  const on=await swEval(`chrome.runtime.sendMessage(${JSON.stringify({type:'OZ_SET_MANUAL_MODE',enabled:true,conversation_key:key,tab_id:tab})})`);assert(on?.ok===true&&on.enabled===true,'Manual ON rejected');
  await swEval(`new Promise(r=>chrome.tabs.sendMessage(${tab},${JSON.stringify({type:'OZ_APPLY_MANUAL_MODE',enabled:true,conversation_key:key})},x=>r(x||null)))`);
  await waitFor(async()=>{const bs=await ownButtons();return bs.length>0&&bs.some(x=>!x.disabled);});
  assert(await swEval(`chrome.storage.local.get('ozmb_provider_quota_state_v1').then(x=>JSON.stringify(x.ozmb_provider_quota_state_v1))`)===beforeQuota,'OFF->ON changed quota state');
  await setText('');await new Promise(r=>setTimeout(r,2300));
  assert(await page.evaluate(()=>window.__sendClicks)===0,'cancelled old report inserted after OFF->ON');
  assert((await page.$eval('#prompt-textarea',el=>el.value))==='','cancelled old report reappeared after composer clear');
  console.log('FULL_BROWSER_MANUAL_OFF_CANCEL_PENDING_PASS');
  console.log('FULL_BROWSER_MANUAL_OFF_ON_READY_PASS');
  console.log('FULL_BROWSER_MANUAL_OFF_ON_QUOTA_CACHE_PRESERVED_PASS');
  console.log('FULL_BROWSER_CANCELLED_REPORT_NEVER_REAPPEARS_PASS');

  assert(providerNetwork.length===0,`provider network observed: ${providerNetwork.join(',')}`);
  console.log('REAL_OZON_REQUESTS=0');
  console.log('REAL_PERFORMANCE_REQUESTS=0');
  console.log('OZON_COMPOSER_WAIT_BROWSER_HARNESS_PASS');
} finally {
  try{await browser.close();}catch(_){};try{child.kill('SIGTERM');}catch(_){};try{fs.rmSync(profile,{recursive:true,force:true});}catch(_){}
}
