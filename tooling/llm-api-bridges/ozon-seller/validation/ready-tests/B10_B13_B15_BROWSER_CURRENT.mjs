import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const EXPECTED_WORKER='dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac';
const EXPECTED_CONTENT='ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda';
const candidateDir=path.resolve(process.argv[2]||'');
const chromePath=path.resolve(process.argv[3]||process.env.CFT_CHROME_PATH||process.env.CHROME_PATH||'');
if(!candidateDir||!fs.existsSync(path.join(candidateDir,'manifest.json'))||!chromePath||!fs.existsSync(chromePath)){
  throw new Error('usage: node B10_B13_B15_BROWSER_CURRENT.mjs <exact-current-candidate-dir> <CFT-151.0.7922.47-chrome.exe>');
}
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert=(v,m)=>{if(!v)throw new Error(m)};
assert(sha(path.join(candidateDir,'service_worker.js'))===EXPECTED_WORKER,'candidate worker SHA mismatch');
assert(sha(path.join(candidateDir,'content_script.js'))===EXPECTED_CONTENT,'candidate content SHA mismatch');
assert(process.version==='v24.12.0',`unexpected Node version: ${process.version}`);

let puppeteer;
try{puppeteer=await import('puppeteer');}catch(_){puppeteer=await import('puppeteer-core');}
try{
  const require=createRequire(import.meta.url);
  const pkg=JSON.parse(fs.readFileSync(require.resolve('puppeteer/package.json'),'utf8'));
  assert(pkg.version==='25.4.0',`unexpected Puppeteer version: ${pkg.version}`);
}catch(e){
  if(!String(e?.message||e).includes('Cannot find module')) throw e;
}

const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ozon-current-raw-cdp-'));
const launchArgs=[
  `--user-data-dir=${profile}`,
  '--remote-debugging-port=0',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-networking',
  '--disable-component-update',
  '--disable-sync',
  '--metrics-recording-only',
  '--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0',
  '--no-sandbox',
  'about:blank'
];
assert(!launchArgs.includes('--disable-gpu-sandbox'),'forbidden --disable-gpu-sandbox present');
const browser=await puppeteer.launch({
  executablePath:chromePath,
  headless:false,
  ignoreDefaultArgs:true,
  enableExtensions:true,
  waitForInitialPage:false,
  dumpio:true,
  args:launchArgs
});
let browserCdp;
const pages=[];
try{
  browserCdp=await browser.target().createCDPSession();
  const version=await browserCdp.send('Browser.getVersion');
  assert(String(version.product||'').includes('151.0.7922.47'),`unexpected CFT version: ${version.product}`);
  assert(typeof browser.installExtension==='function','Puppeteer browser.installExtension unavailable');
  const extensionId=await browser.installExtension(candidateDir);
  assert(/^[a-p]{32}$/.test(extensionId),`invalid dynamic extension id: ${extensionId}`);

  const swTarget=await browser.waitForTarget(t=>t.type()==='service_worker'&&t.url().startsWith(`chrome-extension://${extensionId}/`),{timeout:10000});
  const sw=await swTarget.createCDPSession();
  await sw.send('Runtime.enable');
  await sw.send('Network.enable');
  const providerNetwork=[];
  sw.on('Network.requestWillBeSent',e=>{if(/api-(?:seller|performance)\.ozon\.ru/i.test(e.request.url))providerNetwork.push(e.request.url)});
  async function swEval(expr){
    const r=await sw.send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});
    if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text||'SW eval failed');
    return r.result.value;
  }
  assert(await swEval('1+1')===2,'direct worker CDP Runtime.evaluate failed');

  async function targetById(targetId){
    return await browser.waitForTarget(t=>t._targetId===targetId,{timeout:10000});
  }
  async function createSynthetic(url,html){
    const {targetId}=await browserCdp.send('Target.createTarget',{url:'about:blank'});
    const target=await targetById(targetId);
    const cdp=await target.createCDPSession();
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    await cdp.send('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
    cdp.on('Fetch.requestPaused',async e=>{
      try{
        if(e.request.url===url && e.resourceType==='Document'){
          await cdp.send('Fetch.fulfillRequest',{requestId:e.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html; charset=utf-8'}],body:Buffer.from(html,'utf8').toString('base64')});
        }else{
          await cdp.send('Fetch.failRequest',{requestId:e.requestId,errorReason:'BlockedByClient'});
        }
      }catch(_){}
    });
    const loaded=new Promise(resolve=>cdp.once('Page.loadEventFired',resolve));
    await cdp.send('Page.navigate',{url});
    await Promise.race([loaded,new Promise((_,reject)=>setTimeout(()=>reject(new Error(`navigation timeout: ${url}`)),10000))]);
    await new Promise(r=>setTimeout(r,500));
    const page={targetId,cdp,url}; pages.push(page); return page;
  }
  async function evalPage(p,expression){
    const r=await p.cdp.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text||`PAGE eval failed: ${p.url}`);
    return r.result.value;
  }
  async function reloadPage(p){
    const loaded=new Promise(resolve=>p.cdp.once('Page.loadEventFired',resolve));
    await p.cdp.send('Page.reload',{ignoreCache:true});
    await Promise.race([loaded,new Promise((_,reject)=>setTimeout(()=>reject(new Error(`reload timeout: ${p.url}`)),10000))]);
    await new Promise(r=>setTimeout(r,450));
  }
  async function waitFor(fn,timeout=7000,step=80){const start=Date.now();while(Date.now()-start<timeout){const v=await fn();if(v)return v;await new Promise(r=>setTimeout(r,step));}throw new Error('browser waitFor timeout')}
  const toastText=p=>evalPage(p,`document.querySelector('#ozon-llm-api-bridge-toast-root')?.innerText||''`);
  const ownButtons=p=>evalPage(p,`(()=>{const out=[];for(const el of document.querySelectorAll('*'))if(el.shadowRoot)for(const b of el.shadowRoot.querySelectorAll('button'))if((b.textContent||'').trim().startsWith('Ozon'))out.push({text:(b.textContent||'').trim(),disabled:b.disabled,title:b.title});return out})()`);
  const setText=(p,text)=>evalPage(p,`(()=>{const el=document.querySelector('#prompt-textarea');if(!el)return false;const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;setter.call(el,${JSON.stringify(text)});el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:${JSON.stringify(text)}}));el.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
  const resetSend=p=>evalPage(p,`(()=>{window.__sendClicks=0;window.__sentText=null;const b=document.querySelector('#send');if(!b)return false;b.dataset.testid='send-button';b.setAttribute('aria-label','Send');b.textContent='Send';return true})()`);

  const ids={a:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',alice:'cccccccc-cccc-4ccc-8ccc-cccccccccccc'};
  const urls={a:`https://chatgpt.com/c/${ids.a}`,b:`https://chatgpt.com/c/${ids.b}`,alice:`https://alice.yandex.ru/chat/${ids.alice}`};
  const chatHtml=(id,label)=>`<!doctype html><html><head><link rel="canonical" href="https://chatgpt.com/c/${id}"><style>body{margin:20px;font-family:sans-serif}form{display:block;width:700px;height:100px}textarea{display:block;width:600px;height:60px}button{display:inline-block;width:100px;height:32px}</style></head><body><main><section data-turn="assistant" data-turn-id="${label}-assistant"><div class="code-wrap"><button id="native-copy-${label}" aria-label="Copy" onclick="window.__nativeCopyClicks=(window.__nativeCopyClicks||0)+1">Copy</button><pre><code>OZON_API_V1\n{"operation":"analytics_data","params":{"date_from":"2026-08-17","date_to":"2026-08-17","dimension":["day"],"metrics":["revenue"],"limit":1}}</code></pre></div></section></main><form id="composer-form" data-testid="composer-root"><textarea id="prompt-textarea"></textarea><button id="send" type="button" data-testid="send-button" aria-label="Send" onclick="window.__sendClicks=(window.__sendClicks||0)+1;window.__sentText=document.querySelector('#prompt-textarea').value;this.dataset.testid='composer-speech-button';this.setAttribute('aria-label','Microphone');this.textContent='Mic'">Send</button></form><script>window.__sendClicks=0;window.__sentText=null;window.__nativeCopyClicks=0;</script></body></html>`;
  const aliceHtml=`<!doctype html><html><body><div class="ChatListItem" id="${ids.alice}"><button data-testid="chatlist-item-active" aria-current="page">active</button></div><main><div data-message-role="alice" id="alice-assistant"><div class="CodeBlock"><div class="CodeBlock-StickyWrapper"><button id="alice-native-copy" data-testid="codeblock-action-copy" onclick="window.__nativeCopyClicks=(window.__nativeCopyClicks||0)+1">Copy</button></div><pre class="CodeBlock-ContentPre"><code>OZON_API_V1\n{"operation":"analytics_data","params":{"date_from":"2026-08-17","date_to":"2026-08-17","dimension":["day"],"metrics":["ordered_units"],"limit":1}}</code></pre></div></div><div data-testid="standalone-input"><textarea id="prompt-textarea" data-testid="inputbase-textarea"></textarea><button id="send" data-testid="oknyx" aria-label="Отправить" onclick="window.__sendClicks=(window.__sendClicks||0)+1;window.__sentText=document.querySelector('#prompt-textarea').value">send</button></div></main><script>window.__sendClicks=0;window.__sentText=null;window.__nativeCopyClicks=0;</script></body></html>`;

  const pageA=await createSynthetic(urls.a,chatHtml(ids.a,'a'));
  const pageB=await createSynthetic(urls.b,chatHtml(ids.b,'b'));
  const pageAlice=await createSynthetic(urls.alice,aliceHtml);
  const allTabs=await swEval(`chrome.tabs.query({}).then(xs=>xs.map(x=>({id:x.id,url:x.url})))`);
  const tabFor=url=>allTabs.find(x=>x.url===url)?.id;
  const tabA=tabFor(urls.a),tabB=tabFor(urls.b),tabAlice=tabFor(urls.alice);
  assert(tabA&&tabB&&tabAlice,'failed to resolve synthetic tab ids');
  const keys={a:`https://chatgpt.com|${ids.a}`,b:`https://chatgpt.com|${ids.b}`,alice:`https://alice.yandex.ru|${ids.alice}`};
  const bindings={
    [keys.a]:{binding_id:'bind-a',revision:1,origin:'https://chatgpt.com',ai_id:'chatgpt',conversation_id:ids.a,conversation_key:keys.a,bound_at:new Date().toISOString(),updated_at:new Date().toISOString()},
    [keys.b]:{binding_id:'bind-b',revision:1,origin:'https://chatgpt.com',ai_id:'chatgpt',conversation_id:ids.b,conversation_key:keys.b,bound_at:new Date().toISOString(),updated_at:new Date().toISOString()},
    [keys.alice]:{binding_id:'bind-alice',revision:1,origin:'https://alice.yandex.ru',ai_id:'alice',conversation_id:ids.alice,conversation_key:keys.alice,bound_at:new Date().toISOString(),updated_at:new Date().toISOString()}
  };
  const waitOp=(id,key,tab,due)=>({operation_id:`wait-${id}`,manual_request_id:`wait-req-${id}`,status:'delivering',tab_id:tab,conversation_id:id,conversation_key:key,binding_snapshot:{binding_id:bindings[key].binding_id,binding_revision:1,origin:bindings[key].origin,ai_id:bindings[key].ai_id,conversation_id:id,conversation_key:key},batch:{request_state:'quota_waiting',next_index:0,entries:[],quota_wait:{family:'seller.analytics_data.v1',min_interval_ms:60000,bridge_launch_safety_ms:5000,effective_interval_ms:65000,next_allowed_at:due,queue_index:0,waiting_since:new Date().toISOString(),automatic_retry:false,account_hash:'NOT_PUBLIC'}}});
  const apply=(tab,key,enabled=true)=>swEval(`new Promise(r=>chrome.tabs.sendMessage(${tab},${JSON.stringify({type:'OZ_APPLY_MANUAL_MODE'})}&&{type:'OZ_APPLY_MANUAL_MODE',enabled:${enabled},conversation_key:${JSON.stringify(key)}},x=>r(x||null)))`);

  // Countdown, binding and owner isolation on actual content runtime.
  const now=Date.now(),dueA=now+6200,dueB=now+11500,dueAlice=now+15000;
  await swEval(`chrome.storage.local.clear().then(()=>chrome.storage.local.set(${JSON.stringify({ozmb_conversation_bindings:bindings,ozmb_manual_modes:{[keys.a]:true,[keys.b]:true,[keys.alice]:true},ozmb_manual_operations:{[keys.a]:waitOp(ids.a,keys.a,tabA,dueA),[keys.b]:waitOp(ids.b,keys.b,tabB,dueB),[keys.alice]:waitOp(ids.alice,keys.alice,tabAlice,dueAlice)},ozmb_auto_runs:{},ozmb_diagnostics:[]})}))`);
  assert((await apply(tabA,keys.a))?.ok===true,'ChatGPT A manual apply failed');
  assert((await apply(tabB,keys.b))?.ok===true,'ChatGPT B manual apply failed');
  assert((await apply(tabAlice,keys.alice))?.ok===true,'Alice manual apply failed');
  await waitFor(async()=>/Ожидание лимита Ozon/.test(await toastText(pageA)));
  await waitFor(async()=>/Ожидание лимита Ozon/.test(await toastText(pageB)));
  await waitFor(async()=>/Ожидание лимита Ozon/.test(await toastText(pageAlice)));
  const firstA=await toastText(pageA),firstB=await toastText(pageB),firstAlice=await toastText(pageAlice);
  assert(/Ограничение частоты запросов Ozon\./.test(firstA),'quota explanation missing');
  assert(/Запрос сохранён и выполнится автоматически\. Повторно нажимать не нужно\./.test(firstA),'automatic wait explanation missing');
  assert(/Следующая попытка:\s*\d{2}:\d{2}:\d{2}/.test(firstA),'absolute due clock missing');
  const sec=text=>{const m=text.match(/Следующий запрос через\s+(\d{2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):null};
  const samples=[sec(firstA)];await new Promise(r=>setTimeout(r,1100));samples.push(sec(await toastText(pageA)));await new Promise(r=>setTimeout(r,1100));samples.push(sec(await toastText(pageA)));
  assert(samples.every(Number.isFinite)&&samples[0]>samples[1]&&samples[1]>samples[2],`countdown did not decrease: ${samples}`);
  assert(sec(firstB)>samples[0]+2,'owner B countdown not independently later');
  assert(sec(firstAlice)>sec(firstB)+1,'Alice countdown not independently later');
  const busyA=await ownButtons(pageA);assert(busyA.length>0&&busyA.some(x=>x.disabled),'busy Ozon button not disabled');
  const beforeOps=await swEval(`chrome.storage.local.get('ozmb_manual_operations').then(x=>x.ozmb_manual_operations)`);
  await evalPage(pageA,`document.querySelector('#native-copy-a').click();window.__nativeCopyClicks`);
  assert(await evalPage(pageA,'window.__nativeCopyClicks')===1,'native ChatGPT Copy failed');
  await evalPage(pageAlice,`document.querySelector('#alice-native-copy').click();window.__nativeCopyClicks`);
  assert(await evalPage(pageAlice,'window.__nativeCopyClicks')===1,'native Alice Copy failed');
  const afterOps=await swEval(`chrome.storage.local.get('ozmb_manual_operations').then(x=>x.ozmb_manual_operations)`);
  assert(JSON.stringify(beforeOps)===JSON.stringify(afterOps),'native Copy mutated bridge state');
  const beforeReload=sec(await toastText(pageA));await reloadPage(pageA);await waitFor(async()=>/Ожидание лимита Ozon|Лимит Ozon снят/.test(await toastText(pageA)),5000);const afterReload=sec(await toastText(pageA));
  if(Number.isFinite(beforeReload)&&Number.isFinite(afterReload))assert(afterReload<=beforeReload,'restart reset countdown instead of using durable due');
  await waitFor(async()=>/Лимит Ozon снят — отправляем запрос/.test(await toastText(pageA)),Math.max(7000,dueA-Date.now()+3000));
  assert(/Ожидание лимита Ozon/.test(await toastText(pageB)),'owner B wait overwritten by owner A due');
  assert(/Ожидание лимита Ozon/.test(await toastText(pageAlice)),'Alice wait overwritten by ChatGPT owner');
  assert((await ownButtons(pageA)).length>0,'ChatGPT command discovery/binding missing');
  assert((await ownButtons(pageAlice)).length>0,'Alice command discovery/binding missing');
  console.log('B15_COUNTDOWN_THREE_DECREASING_SECONDS_PASS');
  console.log('B13_NATIVE_COPY_INDEPENDENT_PASS');
  console.log('B13_TWO_CHATGPT_OWNER_ISOLATION_PASS');
  console.log('B13_CHATGPT_ALICE_ISOLATION_PASS');
  console.log('B15_RESTART_RESTORES_DURABLE_WAIT_PASS');
  console.log('B02_CHATGPT_ALICE_COMMAND_DISCOVERY_PASS');

  const makeClaimed=(id,key,tab,suffix,text)=>({operation_id:`op-${suffix}`,manual_request_id:`req-${suffix}`,status:'delivering',tab_id:tab,conversation_id:id,conversation_key:key,origin:bindings[key].origin,binding_snapshot:{binding_id:bindings[key].binding_id,binding_revision:1,origin:bindings[key].origin,ai_id:bindings[key].ai_id,conversation_id:id,conversation_key:key},delivery_id:`delivery-${suffix}`,outgoing_text:text,delivery:{delivery_id:`delivery-${suffix}`,mode:'batch_watch_v1',phase:'claimed',outgoing_text:text,report_prefix_applied:false,baseline_assistant_turn_ids:[]},batch:{phase:'collected',request_state:'idle',next_index:0,entries:[]}});
  const quota={schema_version:1,accounts:{acct:{credential_revision:'rev',families:{'seller.analytics_data.v1':{min_interval_ms:60000,bridge_launch_safety_ms:5000,effective_interval_ms:65000,last_provider_request_at:Date.now()-1000,next_allowed_at:Date.now()+64000,credential_revision:'rev',updated_at:new Date().toISOString()}}}}};
  const cache={schema_version:1,accounts:{acct:{entries:{x:{stored_at:Date.now()-1000,expires_at:Date.now()+59000,payload:{ok:true}}}}}};
  async function seedClaimed(key,op){await swEval(`chrome.storage.local.set(${JSON.stringify({ozmb_conversation_bindings:bindings,ozmb_manual_modes:{[keys.a]:true,[keys.b]:true,[keys.alice]:true},ozmb_manual_operations:{[key]:op},ozmb_auto_runs:{},ozmb_provider_quota_state_v1:quota,ozmb_provider_result_cache_v1:cache})})`)}

  // B10 normal empty composer.
  await setText(pageA,'');await resetSend(pageA);await seedClaimed(keys.a,makeClaimed(ids.a,keys.a,tabA,'empty','REPORT_EMPTY_COMPOSER'));
  await reloadPage(pageA);
  await waitFor(async()=>await evalPage(pageA,'window.__sendClicks')===1,6000);
  assert(await evalPage(pageA,'window.__sentText')==='REPORT_EMPTY_COMPOSER','normal empty composer inserted wrong report');
  await new Promise(r=>setTimeout(r,500));assert(await evalPage(pageA,'window.__sendClicks')===1,'normal delivery clicked Send more than once');
  await waitFor(async()=>!(await swEval(`chrome.storage.local.get('ozmb_manual_operations').then(x=>Boolean(x.ozmb_manual_operations?.[${JSON.stringify(keys.a)}]))`)),5000);
  console.log('B10_EMPTY_COMPOSER_INSERT_ONCE_PASS');
  console.log('B10_SEND_TO_MICROPHONE_COMPLETION_PASS');

  // Occupied composer: preserve draft, persistent plate, clear -> exactly one insertion.
  await setText(pageA,'operator draft');await resetSend(pageA);await seedClaimed(keys.a,makeClaimed(ids.a,keys.a,tabA,'occupied','REPORT_OCCUPIED'));
  await reloadPage(pageA);
  await waitFor(async()=>/Очистите поле ввода, чтобы получить отчёт\./.test(await toastText(pageA)));
  assert(await evalPage(pageA,`document.querySelector('#prompt-textarea').value`)==='operator draft','occupied composer text mutated');
  await new Promise(r=>setTimeout(r,2300));assert(/Очистите поле ввода, чтобы получить отчёт\./.test(await toastText(pageA)),'occupied-composer plate expired');
  assert(await evalPage(pageB,'window.__sendClicks')===0,'wrong owner received pending report');
  await setText(pageA,'');await waitFor(async()=>await evalPage(pageA,'window.__sendClicks')===1,6000);
  assert(await evalPage(pageA,'window.__sentText')==='REPORT_OCCUPIED','occupied-composer report wrong');
  await new Promise(r=>setTimeout(r,500));assert(await evalPage(pageA,'window.__sendClicks')===1,'occupied-composer delivery duplicated Send');
  console.log('B11_BROWSER_OCCUPIED_DRAFT_PRESERVED_PASS');
  console.log('B11_BROWSER_CLEAR_INSERT_ONCE_PASS');
  console.log('B13_WRONG_OWNER_NOT_USED_PASS');

  // Missing composer recovery: claimed report remains owned until composer returns.
  await reloadPage(pageA);await resetSend(pageA);await evalPage(pageA,`document.querySelector('#composer-form')?.remove();true`);
  await seedClaimed(keys.a,makeClaimed(ids.a,keys.a,tabA,'missing','REPORT_MISSING_COMPOSER'));
  assert((await apply(tabA,keys.a))?.ok===true,'manual apply for missing composer failed');
  await new Promise(r=>setTimeout(r,2300));
  assert(await swEval(`chrome.storage.local.get('ozmb_manual_operations').then(x=>Boolean(x.ozmb_manual_operations?.[${JSON.stringify(keys.a)}]))`),'missing composer incorrectly terminated pending report');
  await evalPage(pageA,`(()=>{const f=document.createElement('form');f.id='composer-form';f.dataset.testid='composer-root';const t=document.createElement('textarea');t.id='prompt-textarea';const b=document.createElement('button');b.id='send';b.type='button';b.dataset.testid='send-button';b.setAttribute('aria-label','Send');b.textContent='Send';b.onclick=()=>{window.__sendClicks=(window.__sendClicks||0)+1;window.__sentText=t.value;b.dataset.testid='composer-speech-button';b.setAttribute('aria-label','Microphone');b.textContent='Mic'};f.append(t,b);document.body.appendChild(f);return true})()`);
  await waitFor(async()=>await evalPage(pageA,'window.__sendClicks')===1,6000);
  assert(await evalPage(pageA,'window.__sentText')==='REPORT_MISSING_COMPOSER','missing-composer recovery inserted wrong report');
  console.log('B11_BROWSER_MISSING_COMPOSER_RECOVERY_PASS');

  // Manual OFF cancels only claimed pre-insert report; cache/quota remain exact; OFF->ON does not resurrect.
  await reloadPage(pageA);await setText(pageA,'operator draft 2');await resetSend(pageA);await seedClaimed(keys.a,makeClaimed(ids.a,keys.a,tabA,'cancel','REPORT_MUST_NOT_RETURN'));
  await reloadPage(pageA);await waitFor(async()=>/Очистите поле ввода, чтобы получить отчёт\./.test(await toastText(pageA)));
  const beforeQuota=await swEval(`chrome.storage.local.get('ozmb_provider_quota_state_v1').then(x=>JSON.stringify(x.ozmb_provider_quota_state_v1))`);
  const beforeCache=await swEval(`chrome.storage.local.get('ozmb_provider_result_cache_v1').then(x=>JSON.stringify(x.ozmb_provider_result_cache_v1))`);
  const off=await swEval(`chrome.runtime.sendMessage({type:'OZ_SET_MANUAL_MODE',enabled:false,conversation_key:${JSON.stringify(keys.a)},tab_id:${tabA}})`);assert(off?.ok===true&&off.enabled===false,'Manual OFF rejected');
  assert((await apply(tabA,keys.a,false))?.ok===true,'content Manual OFF apply rejected');
  await waitFor(async()=>!(await swEval(`chrome.storage.local.get('ozmb_manual_operations').then(x=>Boolean(x.ozmb_manual_operations?.[${JSON.stringify(keys.a)}]))`)));
  assert(await swEval(`chrome.storage.local.get('ozmb_provider_quota_state_v1').then(x=>JSON.stringify(x.ozmb_provider_quota_state_v1))`)===beforeQuota,'Manual OFF mutated quota');
  assert(await swEval(`chrome.storage.local.get('ozmb_provider_result_cache_v1').then(x=>JSON.stringify(x.ozmb_provider_result_cache_v1))`)===beforeCache,'Manual OFF mutated cache');
  assert(await evalPage(pageA,`document.querySelector('#prompt-textarea').value`)==='operator draft 2','Manual OFF mutated draft');
  const on=await swEval(`chrome.runtime.sendMessage({type:'OZ_SET_MANUAL_MODE',enabled:true,conversation_key:${JSON.stringify(keys.a)},tab_id:${tabA}})`);assert(on?.ok===true&&on.enabled===true,'Manual ON rejected');
  assert((await apply(tabA,keys.a,true))?.ok===true,'content Manual ON apply rejected');
  await waitFor(async()=>{const b=await ownButtons(pageA);return b.length>0&&b.some(x=>!x.disabled)});
  await setText(pageA,'');await new Promise(r=>setTimeout(r,2300));
  assert(await evalPage(pageA,'window.__sendClicks')===0,'cancelled report resurrected after OFF->ON');
  assert(await evalPage(pageA,`document.querySelector('#prompt-textarea').value`)==='','cancelled report text resurrected');
  console.log('B12_BROWSER_OFF_CANCEL_PENDING_PASS');
  console.log('B12_BROWSER_OFF_ON_READY_PASS');
  console.log('B12_BROWSER_QUOTA_CACHE_PRESERVED_PASS');
  console.log('B12_BROWSER_CANCELLED_REPORT_NEVER_RETURNS_PASS');

  assert(providerNetwork.length===0,`real provider network observed: ${providerNetwork.join(',')}`);
  console.log(`B15_EXTENSION_ID=${extensionId}`);
  console.log('REAL_OZON_REQUESTS=0');
  console.log('REAL_PERFORMANCE_REQUESTS=0');
  console.log('REAL_CHATGPT_REQUESTS=0');
  console.log('OPERATOR_BROWSER_ACTIONS=0');
  console.log('B10_B13_B15_BROWSER_CURRENT_PASS');
}finally{
  for(const p of pages){try{await browserCdp?.send('Target.closeTarget',{targetId:p.targetId});}catch(_){}}
  try{await browser.close();}catch(_){}
  try{fs.rmSync(profile,{recursive:true,force:true});}catch(_){}
}
