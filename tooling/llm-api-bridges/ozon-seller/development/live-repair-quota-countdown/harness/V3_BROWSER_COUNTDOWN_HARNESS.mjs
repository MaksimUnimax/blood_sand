import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const EXPECTED_WORKER='34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a';
const EXPECTED_CONTENT='d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001';
const candidateDir=path.resolve(process.argv[2]||'');
const chromePath=process.argv[3]||process.env.CFT_CHROME_PATH||process.env.CHROME_PATH||'';
if(!candidateDir||!fs.existsSync(path.join(candidateDir,'manifest.json'))||!chromePath||!fs.existsSync(chromePath)) throw new Error('usage: node V3_BROWSER_COUNTDOWN_HARNESS.mjs <exact-repaired-candidate-dir> <CFT-chrome-executable>');
const sha=(p)=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert=(v,m)=>{if(!v)throw new Error(m)};
assert(sha(path.join(candidateDir,'service_worker.js'))===EXPECTED_WORKER,'worker SHA mismatch');
assert(sha(path.join(candidateDir,'content_script.js'))===EXPECTED_CONTENT,'content SHA mismatch');

let puppeteer;
try{puppeteer=await import('puppeteer');}catch(_){puppeteer=await import('puppeteer-core');}
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ozon-v3b-cft-'));
const args=[
  `--user-data-dir=${profile}`,'--remote-debugging-port=0','--no-first-run','--no-default-browser-check',
  '--disable-background-networking','--disable-component-update','--disable-sync','--metrics-recording-only',
  '--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0',
  'about:blank'
];
const child=spawn(chromePath,args,{stdio:['ignore','pipe','pipe']});
let stderr=''; child.stderr.on('data',d=>stderr+=String(d));
async function waitForFile(p,timeout=10000){const start=Date.now();while(Date.now()-start<timeout){if(fs.existsSync(p)&&fs.readFileSync(p,'utf8').trim())return;await new Promise(r=>setTimeout(r,50));}throw new Error(`DevToolsActivePort timeout: ${stderr.slice(-1200)}`)}
const portFile=path.join(profile,'DevToolsActivePort'); await waitForFile(portFile);
const [port,wsPath]=fs.readFileSync(portFile,'utf8').trim().split(/\r?\n/);
const browser=await puppeteer.connect({browserWSEndpoint:`ws://127.0.0.1:${port}${wsPath}`});
try{
  assert(typeof browser.installExtension==='function','Puppeteer browser.installExtension unavailable');
  const extensionId=await browser.installExtension(candidateDir);
  const swTarget=await browser.waitForTarget(t=>t.type()==='service_worker'&&t.url().startsWith(`chrome-extension://${extensionId}/`),{timeout:10000});
  const sw=await swTarget.createCDPSession();
  await sw.send('Runtime.enable'); await sw.send('Network.enable');
  const providerNetwork=[];
  sw.on('Network.requestWillBeSent',e=>{if(/api-(?:seller|performance)\.ozon\.ru/i.test(e.request.url))providerNetwork.push(e.request.url)});
  async function swEval(expr){const r=await sw.send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text||'SW eval failed');return r.result.value;}
  const ids={a:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',alice:'cccccccc-cccc-4ccc-8ccc-cccccccccccc'};
  const urls={a:`https://chatgpt.com/c/${ids.a}`,b:`https://chatgpt.com/c/${ids.b}`,alice:`https://alice.yandex.ru/chat/${ids.alice}`};
  const chatHtml=(id,label)=>`<!doctype html><html><head><link rel="canonical" href="https://chatgpt.com/c/${id}"></head><body><main><section data-turn="assistant" data-turn-id="${label}-assistant"><div class="code-wrap"><button id="native-copy-${label}" aria-label="Copy" onclick="window.__nativeCopyClicks=(window.__nativeCopyClicks||0)+1">Copy</button><pre><code>OZON_API_V1\n{"operation":"analytics_data","params":{"date_from":"2026-08-17","date_to":"2026-08-17","dimension":["day"],"metrics":["revenue"],"limit":1}}</code></pre></div></section></main></body></html>`;
  const aliceHtml=`<!doctype html><html><body><div class="ChatListItem" id="${ids.alice}"><button data-testid="chatlist-item-active" aria-current="page">active</button></div><main><div data-message-role="alice" id="alice-assistant"><div class="CodeBlock"><div class="CodeBlock-StickyWrapper"><button id="alice-native-copy" data-testid="codeblock-action-copy" onclick="window.__nativeCopyClicks=(window.__nativeCopyClicks||0)+1">Copy</button></div><pre class="CodeBlock-ContentPre"><code>OZON_API_V1\n{"operation":"analytics_data","params":{"date_from":"2026-08-17","date_to":"2026-08-17","dimension":["day"],"metrics":["ordered_units"],"limit":1}}</code></pre></div></div><div data-testid="standalone-input"><textarea data-testid="inputbase-textarea"></textarea><button data-testid="oknyx" aria-label="Отправить">send</button></div></main></body></html>`;
  async function syntheticPage(url,body){const page=await browser.newPage();await page.setRequestInterception(true);page.on('request',req=>{if(req.isNavigationRequest()&&req.frame()===page.mainFrame()&&req.url()===url)req.respond({status:200,contentType:'text/html; charset=utf-8',body});else req.abort();});await page.goto(url,{waitUntil:'domcontentloaded',timeout:10000});await new Promise(r=>setTimeout(r,500));return page;}
  const pageA=await syntheticPage(urls.a,chatHtml(ids.a,'a'));
  const pageB=await syntheticPage(urls.b,chatHtml(ids.b,'b'));
  const pageAlice=await syntheticPage(urls.alice,aliceHtml);
  async function tabs(){return await swEval(`chrome.tabs.query({}).then(xs=>xs.map(x=>({id:x.id,url:x.url})))`)}
  const allTabs=await tabs();
  const tabFor=(url)=>allTabs.find(x=>x.url===url)?.id;
  const tabA=tabFor(urls.a),tabB=tabFor(urls.b),tabAlice=tabFor(urls.alice);
  assert(tabA&&tabB&&tabAlice,'failed to resolve synthetic tab ids');
  const now=Date.now(); const dueA=now+6200, dueB=now+11500;
  const keyA=`https://chatgpt.com|${ids.a}`, keyB=`https://chatgpt.com|${ids.b}`, keyAlice=`https://alice.yandex.ru|${ids.alice}`;
  const bindings={
    [keyA]:{binding_id:'bind-a',revision:1,origin:'https://chatgpt.com',conversation_id:ids.a,conversation_key:keyA,bound_at:new Date().toISOString()},
    [keyB]:{binding_id:'bind-b',revision:1,origin:'https://chatgpt.com',conversation_id:ids.b,conversation_key:keyB,bound_at:new Date().toISOString()},
    [keyAlice]:{binding_id:'bind-alice',revision:1,origin:'https://alice.yandex.ru',conversation_id:ids.alice,conversation_key:keyAlice,bound_at:new Date().toISOString()}
  };
  const makeOp=(id,tab,due)=>({operation_id:`op-${id}`,manual_request_id:`req-${id}`,status:'delivering',tab_id:tab,conversation_id:id,conversation_key:id===ids.a?keyA:keyB,batch:{request_state:'quota_waiting',next_index:0,entries:[],quota_wait:{family:'seller.analytics_data.v1',min_interval_ms:60000,bridge_launch_safety_ms:5000,effective_interval_ms:65000,next_allowed_at:due,queue_index:0,waiting_since:new Date().toISOString(),automatic_retry:false,account_hash:'NOT_PUBLIC'}}});
  const storage={ozmb_conversation_bindings:bindings,ozmb_manual_modes:{[keyA]:true,[keyB]:true,[keyAlice]:true},ozmb_manual_operations:{[keyA]:makeOp(ids.a,tabA,dueA),[keyB]:makeOp(ids.b,tabB,dueB)},ozmb_auto_runs:{},ozmb_diagnostics:[]};
  await swEval(`chrome.storage.local.clear().then(()=>chrome.storage.local.set(${JSON.stringify(storage)}))`);
  async function apply(tab,key){return await swEval(`new Promise(r=>chrome.tabs.sendMessage(${tab},${JSON.stringify({type:'OZ_APPLY_MANUAL_MODE',enabled:true,conversation_key:key})},x=>r(x||null)))`)}
  assert((await apply(tabA,keyA))?.ok===true,'ChatGPT A manual apply failed');
  assert((await apply(tabB,keyB))?.ok===true,'ChatGPT B manual apply failed');
  assert((await apply(tabAlice,keyAlice))?.ok===true,'Alice manual apply failed');
  async function waitFor(fn,timeout=6000,step=100){const start=Date.now();while(Date.now()-start<timeout){const v=await fn();if(v)return v;await new Promise(r=>setTimeout(r,step));}throw new Error('browser waitFor timeout')}
  const toastText=(p)=>p.evaluate(()=>document.querySelector('#ozon-llm-api-bridge-toast-root')?.innerText||'');
  const ownButtons=(p)=>p.evaluate(()=>{const out=[];for(const el of document.querySelectorAll('*')){if(el.shadowRoot)for(const b of el.shadowRoot.querySelectorAll('button'))if((b.textContent||'').trim().startsWith('Ozon'))out.push({text:(b.textContent||'').trim(),disabled:b.disabled,title:b.title});}return out;});
  await waitFor(async()=>/Ожидание лимита Ozon/.test(await toastText(pageA)));
  await waitFor(async()=>/Ожидание лимита Ozon/.test(await toastText(pageB)));
  await waitFor(async()=> (await ownButtons(pageAlice)).length>0);
  const firstA=await toastText(pageA); const firstB=await toastText(pageB);
  assert(/Следующая попытка:\s*\d{2}:\d{2}:\d{2}/.test(firstA),'absolute due clock missing');
  function sec(text){const m=text.match(/Следующий запрос через\s+(\d{2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):null;}
  const samples=[sec(firstA)]; await new Promise(r=>setTimeout(r,1100)); samples.push(sec(await toastText(pageA))); await new Promise(r=>setTimeout(r,1100)); samples.push(sec(await toastText(pageA)));
  assert(samples.every(Number.isFinite)&&samples[0]>samples[1]&&samples[1]>samples[2],`countdown did not decrease: ${samples}`);
  console.log('V3B_VISIBLE_WAIT_PLATE_PASS'); console.log('V3B_THREE_DECREASING_SECONDS_PASS'); console.log('V3B_ABSOLUTE_DUE_CLOCK_PASS');
  const buttonsA=await ownButtons(pageA); assert(buttonsA.length>0&&buttonsA.some(x=>x.disabled),'busy Ozon button not disabled');
  const beforeOps=await swEval(`chrome.storage.local.get('ozmb_manual_operations').then(x=>x.ozmb_manual_operations)`);
  await pageA.click('#native-copy-a'); const nativeClicks=await pageA.evaluate(()=>window.__nativeCopyClicks||0); assert(nativeClicks===1,'native Copy click was not independent');
  const afterOps=await swEval(`chrome.storage.local.get('ozmb_manual_operations').then(x=>x.ozmb_manual_operations)`); assert(JSON.stringify(beforeOps)===JSON.stringify(afterOps),'native Copy mutated bridge operation');
  console.log('V3B_DUPLICATE_CLICK_BLOCKED_PASS'); console.log('V3B_NATIVE_COPY_INDEPENDENT_PASS');
  const bSecs=sec(firstB); assert(Number.isFinite(bSecs)&&bSecs>samples[0]+2,'owner B countdown not independently later than A');
  console.log('V3B_TWO_OWNER_ISOLATION_INITIAL_PASS');
  const beforeReload=sec(await toastText(pageA)); await pageA.reload({waitUntil:'domcontentloaded',timeout:10000}); await waitFor(async()=>/Ожидание лимита Ozon|Лимит Ozon снят/.test(await toastText(pageA)),5000); const afterReload=sec(await toastText(pageA));
  if(Number.isFinite(beforeReload)&&Number.isFinite(afterReload)) assert(afterReload<=beforeReload,'restart restored a later countdown instead of durable due');
  console.log('V3B_RESTART_RESTORE_PASS');
  await waitFor(async()=>/Лимит Ozon снят — отправляем запрос/.test(await toastText(pageA)),Math.max(7000,dueA-Date.now()+3000));
  assert(/Ожидание лимита Ozon/.test(await toastText(pageB)),'owner B wait was overwritten when owner A reached due');
  console.log('V3B_DUE_SENDING_STATE_PASS'); console.log('V3B_TWO_OWNER_ISOLATION_PASS');
  const aButtonsAfter=await ownButtons(pageA); const aliceButtons=await ownButtons(pageAlice);
  assert(aButtonsAfter.length>0,'ChatGPT structural binding missing'); assert(aliceButtons.length>0&&!aliceButtons.every(x=>x.disabled),'Alice structural binding missing/disabled unexpectedly');
  console.log('V3B_CHATGPT_BINDING_PASS'); console.log('V3B_ALICE_BINDING_PASS');
  assert(/Лимит Ozon снят|Ожидание лимита Ozon/.test(await toastText(pageA)) && /Ожидание лимита Ozon/.test(await toastText(pageB)),'cross-owner status regression');
  console.log('V3B_NO_CROSS_OWNER_REGRESSION_PASS');
  await new Promise(r=>setTimeout(r,200));
  assert(providerNetwork.length===0,`provider network observed: ${providerNetwork.join(',')}`);
  console.log('OPERATOR_BROWSER_ACTIONS=0'); console.log('REAL_OZON_REQUESTS=0'); console.log('REAL_PERFORMANCE_REQUESTS=0'); console.log('V3_BROWSER_COUNTDOWN_HARNESS_PASS');
} finally {
  try{await browser.close();}catch(_){}; try{child.kill('SIGTERM');}catch(_){}; try{fs.rmSync(profile,{recursive:true,force:true});}catch(_){}
}
