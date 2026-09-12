from pathlib import Path
import sys,json
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve()
dist=root if (root/'content_script.js').is_file() else root/'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate'
modules=['shared/conversation_identity.js','shared/runtime_names.js','shared/ai_adapters.js','shared/ozon_operation_registry.js','shared/ozon_contract.js']
source=(dist/'content_script.js').read_text().replace('\r\n','\n')
anchor='  document.addEventListener("pointerdown",'
assert source.count(anchor)==1
source=source.replace(anchor,'  globalThis.__browserAutorun={beginAutoWatch,autoTick,stopAutoWatch};\n  return;\n'+anchor,1)
pre='<!doctype html><html><head><meta charset="utf-8"><title>AUTORUN_BROWSER_PENDING</title></head><body><main id="messages"></main>'
for m in modules:pre+='<script src="'+(dist/m).as_uri()+'"></script>'
pre+='<script>const exactContent='+json.dumps(source,ensure_ascii=True).replace('<','\\u003c')+';</script>'
test=r'''
<script>
(async()=>{
 const realAdapters=OzonAIAdapters;
 const check=(v,m)=>{if(!v)throw new Error(m);};
 const cases=[];
 for(const ai of ['chatgpt','alice']){
  const origin=ai==='chatgpt'?'https://chatgpt.com':'https://alice.yandex.ru';
  const conv='12345678-1234-4234-8234-123456789abc',key=origin+'|'+conv;
  document.querySelectorAll('.ChatListItem').forEach(e=>e.remove());
  if(ai==='alice'){const item=document.createElement('div'),button=document.createElement('button');item.className='ChatListItem';item.id=conv;button.setAttribute('data-testid','chatlist-item-active');button.setAttribute('aria-current','page');item.appendChild(button);document.body.appendChild(item);}
  const loc={origin,pathname:(ai==='chatgpt'?'/c/':'/chat/')+conv};
  globalThis.OzonAIAdapters=Object.freeze({...realAdapters,adapterForLocation:()=>realAdapters.ADAPTERS[ai]});
  for(const kind of ['single','triple','mixed','api','v1','plain','partial','result','streaming','wrong-conversation']){
   document.getElementById('messages').replaceChildren();
   document.querySelectorAll('[data-testid="stop-button"],[data-testid="oknyx"]').forEach(e=>e.remove());
   let now=10000;const calls=[],events=[];
   class Clock extends Date{static now(){return now;}}
   const chromeMock={runtime:{lastError:null,sendMessage(m,cb){if(m.type==='OZ_RECORD_DIAGNOSTIC')events.push(m);else calls.push(m);cb({ok:true,accepted:true,item_count:1});}}};
   const ownLoc={...loc};
   new Function('location','chrome','Date','setTimeout','clearTimeout',exactContent)(ownLoc,chromeMock,Clock,()=>1,()=>{});
   const t=globalThis.__browserAutorun;
   const h='OZON_HELP_V2\n{"cluster":"stocks_inventory"}',api='OZON_API_V1\n{"operation":"seller_product_list","params":{"filter":{},"limit":1}}';
   const texts={single:h,triple:[h,h,h].join('\n\n'),mixed:h+'\n\n'+api,api,v1:'OZON_HELP_V1\n{"cluster":"stocks_inventory"}',plain:'Обычный ответ',partial:'OZON_HELP_V',result:'OZON_GUIDANCE_RESULT_V2\n{}',streaming:h,'wrong-conversation':h};
   const node=document.createElement('section');
   if(ai==='chatgpt'){node.setAttribute('data-turn','assistant');node.setAttribute('data-turn-id','new-'+kind);}else{node.setAttribute('data-message-role','alice');node.id='new-'+kind;}
   const pre=document.createElement('pre'),code=document.createElement('code');code.textContent=texts[kind];pre.appendChild(code);node.appendChild(pre);document.getElementById('messages').appendChild(node);
   let generating=null;
   if(kind==='streaming'){generating=document.createElement('button');generating.setAttribute('data-testid',ai==='chatgpt'?'stop-button':'oknyx');generating.setAttribute('aria-label','Алиса, стоп');document.body.appendChild(generating);}
   check(t.beginAutoWatch({run_id:'fixture-run',watch_id:'fixture-watch',origin,conversation_id:conv,conversation_key:key,assistant_baseline_ids:[]}),ai+' watcher start');
   await t.autoTick();now+=2001;
   if(kind==='wrong-conversation')ownLoc.pathname='/'+(ai==='chatgpt'?'c':'chat')+'/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
   await t.autoTick();
   const ready=()=>calls.filter(m=>m.type==='OZ_AUTO_MESSAGE_READY');
   if(['plain','partial','result','streaming','wrong-conversation'].includes(kind))check(ready().length===0,ai+' '+kind+' admitted unexpectedly');
   else {check(ready().length===1,ai+' '+kind+' missing/duplicate admission');check(ready()[0].assistant_text===texts[kind],ai+' text changed');}
   if(kind==='streaming'){generating.remove();await t.autoTick();now+=2001;await t.autoTick();check(ready().length===1,ai+' streaming completion not captured');}
   t.stopAutoWatch('test_complete');cases.push(ai+':'+kind);
  }
 }
 document.title='AUTORUN_HELP_V2_REAL_DOM_BROWSER_PASS';document.body.dataset.test='PASS';
 const pre=document.createElement('pre');pre.id='result';pre.textContent=JSON.stringify({status:'PASS',cases,case_count:cases.length,provider_calls:0,scope:'real browser DOM and production adapters/content; fixture identity and runtime transport; not live AI'});document.body.appendChild(pre);
})().catch(e=>{document.title='FAIL: '+e.message;document.body.dataset.test='FAIL';document.body.append(String(e.stack||e));});
</script></body></html>
'''
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(pre+test,encoding='utf-8');print(out)
