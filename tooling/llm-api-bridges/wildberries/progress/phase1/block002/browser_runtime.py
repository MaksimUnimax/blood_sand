#!/usr/bin/env python3
"""Real Chromium / synthetic ChatGPT DOM / mocked chrome.runtime. No WB or AI calls.
Usage: python browser_runtime.py CANDIDATE_DIRECTORY NEW_EVIDENCE_DIRECTORY
"""
import hashlib,json,os,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=False)
rows=[];logs=[]
HTML='''<!doctype html><html><body><main>
<section data-turn="assistant" data-turn-id="a1"><div data-writing-block="true" data-testid="writing-block-container" data-writing-block-id="block1"><button aria-label="Copy">Copy</button><div data-writing-block-fullscreen-editor-region>WB_API_V1
{"operation":"seller_info","params":{}}</div></div></section>
</main><form><textarea id="prompt-textarea" style="width:500px;height:100px"></textarea><button type="button" data-testid="send-button" aria-label="Send">Send</button></form></body></html>'''
STUB='''() => {
 window.fixtureOrigin='https://chatgpt.com';window.fixtureId='11111111-1111-1111-1111-111111111111';if(!crypto.randomUUID)Object.defineProperty(crypto,'randomUUID',{value:()=>String(Math.random())});window.messages=[];window.profileReplies=[];window.execReplies=[];window.allListeners=[];window.liveListeners=new Set();window.holdProfiles=false;window.holdExecute=false;window.manual=true;
 window.chrome={runtime:{lastError:null,onMessage:{addListener:f=>{allListeners.push(f);liveListeners.add(f)},removeListener:f=>liveListeners.delete(f)},sendMessage:(m,cb)=>{
  messages.push(m);
  if(holdProfiles && /WB_GET_(SEND_BUTTON_PROFILE|COPY_BUTTON_PROFILES)/.test(m.type)){profileReplies.push(cb);return;}
  if(m.type==='WB_EXECUTE_COMMAND' && holdExecute){execReplies.push(cb);return;}
  queueMicrotask(()=>cb(m.type==='WB_CONTENT_READY'?{ok:true,manual_mode:manual,conversation_key:fixtureOrigin+'|'+fixtureId}:{ok:true,enabled:manual}));
 }}};
 window.docHandlers={pointerdown:new Set(),click:new Set(),keydown:new Set()};
 const add=document.addEventListener.bind(document),remove=document.removeEventListener.bind(document);
 document.addEventListener=(t,f,o)=>{docHandlers[t]?.add(f);return add(t,f,o)};
 document.removeEventListener=(t,f,o)=>{docHandlers[t]?.delete(f);return remove(t,f,o)};
}'''
def record(name,ok,details):
 r={'test':name,'status':'PASS' if ok else 'FAIL','details':details,'real_provider_calls':0};rows.append(r)
 with (out/'results.jsonl').open('a') as f:f.write(json.dumps(r)+'\n');f.flush();os.fsync(f.fileno())
 print(r['status'],name,flush=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-background-networking'])
 def setup():
  ctx=browser.new_context();ctx.route('**/*',lambda r:r.fulfill(status=200,content_type='text/html',body=HTML))
  page=ctx.new_page();page.on('pageerror',lambda e:logs.append(str(e)));page.set_content(HTML);page.evaluate(STUB)
  for f in json.loads((root/'manifest.json').read_text())['content_scripts'][0]['js']:
   if f!='content_script.js':page.add_script_tag(content=(root/f).read_text())
  page.evaluate("BB2ConversationIdentity={resolve:()=>({origin:fixtureOrigin,conversation_id:fixtureId,status:'confirmed',source:'fixture'})}")
  return ctx,page
 def load(page):page.add_script_tag(content=(root/'content_script.js').read_text());page.wait_for_timeout(100)
 ctx,page=setup();page.evaluate('holdProfiles=true');load(page);page.evaluate('holdProfiles=false');load(page)
 n=page.evaluate("messages.filter(m=>m.type==='WB_CONTENT_READY').length")
 page.evaluate('profileReplies.splice(0).forEach(f=>f({ok:true}))');page.wait_for_timeout(150)
 after=page.evaluate("messages.filter(m=>m.type==='WB_CONTENT_READY').length")
 record('TA-021-LATE-BOOTSTRAP',after==n,{'before_release':n,'after_release':after})
 handlers=page.evaluate('Object.fromEntries(Object.entries(docHandlers).map(([k,v])=>[k,v.size]))')
 record('TA-021-DOCUMENT-HANDLERS-REMOVED',all(v==1 for v in handlers.values()),handlers)
 page.evaluate("document.querySelector('#prompt-textarea').value='KEEP_CURRENT_DRAFT';allListeners[0]({type:'WB_START_SEND_BUTTON_PICKER'},{},()=>{})")
 text=page.locator('#prompt-textarea').input_value();record('TA-021-STALE-LISTENER',text=='KEEP_CURRENT_DRAFT',{'composer':text})
 record('TA-021-ONE-RUNTIME-LISTENER',page.evaluate('liveListeners.size')==1,{'count':page.evaluate('liveListeners.size')})
 ctx.close()
 # Delay an actual Manual provider response until after reinitialization.
 for mode in ['same_runtime','reinit','route_change']:
  ctx,page=setup();page.evaluate('holdExecute=true');load(page)
  page.locator('button[aria-label="Copy"]').click();page.wait_for_function('execReplies.length===1',timeout=3000)
  if mode=='reinit':load(page)
  if mode=='route_change':page.evaluate("fixtureId='22222222-2222-2222-2222-222222222222'")
  page.evaluate("execReplies.splice(0).forEach(f=>f({ok:true,request_id:'fixture-request',report_text:'WB_RESULT_V1\\n{\"ok\":true}',auto_send:false}))")
  page.wait_for_timeout(200);text=page.locator('#prompt-textarea').input_value()
  expected='WB_RESULT_V1\n{"ok":true}' if mode=='same_runtime' else ''
  record({'same_runtime':'LIVE-DOM-POSITIVE-MANUAL-DELIVERY','reinit':'TA-021-LATE-PROVIDER-RESULT','route_change':'TA-019-ROUTE-CHANGED'}[mode],text==expected,{'composer':text,'expected':expected,'execute_messages':page.evaluate("messages.filter(m=>m.type==='WB_EXECUTE_COMMAND').length")})
  ctx.close()
 browser.close()
summary={'checks':len(rows),'passed':sum(r['status']=='PASS' for r in rows),'failed':sum(r['status']=='FAIL' for r in rows),'scope':'real Chromium; about:blank synthetic DOM; mocked identity and extension messages, NOT installed live acceptance','page_errors':logs,'content_sha256':hashlib.sha256((root/'content_script.js').read_bytes()).hexdigest(),'real_wb_requests':0}
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2));sys.exit(bool(summary['failed']))
