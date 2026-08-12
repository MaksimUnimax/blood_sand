const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const ROOT = path.resolve(__dirname, '../ozon-bridge-v0.1.5-extension');
const source = fs.readFileSync(path.join(ROOT, 'content_script.js'), 'utf8');
function extract(startMarker, endMarker) {
  const start = source.indexOf(startMarker); const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0 && end > start); return { code: source.slice(start, end), lineOffset: source.slice(0,start).split('\n').length - 1 };
}
function harness({ text, response, manualEnabled=true, sameKey=true, deliveryConfirmed=true, autoSend=true }) {
  const calls={runtime:[],delivery:[],toast:[],sync:0};
  const h=extract('  async function handleCopy', '  function decorateBinding');
  const ctx={
    manualEnabled, manualConversationKey:'https://chatgpt.com|cid', BUSY:new Set(), crypto:webcrypto,
    conversationKeyFromLocation(){return sameKey?'https://chatgpt.com|cid':'https://chatgpt.com|other';},
    async syncManualState(){calls.sync+=1; if(!sameKey) ctx.manualEnabled=false;},
    commandText(){return text;}, commandKey(){return 'key-1';},
    OzonContract:{isCommandText(v){return String(v).trim().startsWith('OZON_API_V1');}},
    toast(...a){calls.toast.push(a);},
    async sendRuntime(type,payload){calls.runtime.push({type,payload:structuredClone(payload)}); if(type==='OZ_EXECUTE_COMMAND') return structuredClone(response); if(type==='OZ_MANUAL_DELIVERY_COMPLETE') return {ok:true}; if(type==='OZ_REPORT_DELIVERY_CONFIRMED') return {ok:true}; if(type==='OZ_MANUAL_DELIVERY_FAILED') return {ok:true}; throw new Error('unexpected '+type);},
    async deliverReport(t,a,o){calls.delivery.push({t,a,o}); return {delivery_confirmed:deliveryConfirmed,confirmed_user_turn_id:deliveryConfirmed?'u1':null,composer_empty:true,click_attempts:1};}, structuredClone
  };
  vm.createContext(ctx); vm.runInContext(`${h.code}\nthis.handleCopy=handleCopy;`,ctx,{filename:path.join(ROOT,'content_script.js'),lineOffset:h.lineOffset});
  return {ctx,calls};
}

test('actual handleCopy sends malformed command unchanged to worker and delivers returned pre-execution report', async()=>{
  const bad='OZON_API_V1 {"operation":"posting_fbo_\nlist","params":{}}';
  const r={ok:false,pre_execution_error:true,external_request_executed:false,report_text:'OZON_RESULT_V1\n{}',outgoing_text:'OZON_RESULT_V1\n{}',manual_operation_id:'op',delivery_id:'d',request_id:'r',auto_send:true};
  const h=harness({text:bad,response:r}); await h.ctx.handleCopy({},{});
  assert.equal(h.calls.runtime[0].type,'OZ_EXECUTE_COMMAND');
  assert.equal(h.calls.runtime[0].payload.command_text,bad);
  assert.equal(h.calls.delivery.length,1);
  assert.equal(h.calls.runtime.some(x=>x.type==='OZ_MANUAL_DELIVERY_COMPLETE'),true);
  assert.equal(h.calls.runtime.some(x=>x.type==='OZ_REPORT_DELIVERY_CONFIRMED'),true);
  assert.equal(h.ctx.BUSY.size,0);
  assert.equal(h.calls.toast.some(x=>String(x[0]).includes('внешний Ozon API request не выполнялся')),true);
});

test('actual handleCopy valid/provider response uses same single delivery pipeline', async()=>{
  const r={ok:true,report_text:'OZON_RESULT_V1\n{}',outgoing_text:'OZON_RESULT_V1\n{}',manual_operation_id:'op',delivery_id:'d',request_id:'r',auto_send:true};
  const h=harness({text:'OZON_API_V1 {"operation":"roles","params":{}}',response:r}); await h.ctx.handleCopy({},{});
  assert.equal(h.calls.runtime.filter(x=>x.type==='OZ_EXECUTE_COMMAND').length,1); assert.equal(h.calls.delivery.length,1); assert.equal(h.ctx.BUSY.size,0);
});

test('actual handleCopy non-command never calls bridge runtime', async()=>{
  const h=harness({text:'hello',response:{}}); await h.ctx.handleCopy({},{}); assert.equal(h.calls.runtime.length,0); assert.equal(h.calls.delivery.length,0);
});

test('actual handleCopy disabled manual mode returns before any runtime call', async()=>{
  const h=harness({text:'OZON_API_V1 {}',response:{},manualEnabled:false}); await h.ctx.handleCopy({},{}); assert.equal(h.calls.runtime.length,0);
});

test('actual handleCopy conversation change resyncs and fails closed when manual no longer enabled', async()=>{
  const h=harness({text:'OZON_API_V1 {}',response:{},sameKey:false}); await h.ctx.handleCopy({},{}); assert.equal(h.calls.sync,1); assert.equal(h.calls.runtime.length,0);
});

test('actual handleCopy duplicate BUSY key blocks second runtime call', async()=>{
  const h=harness({text:'OZON_API_V1 {}',response:{}}); h.ctx.BUSY.add('key-1'); await h.ctx.handleCopy({},{}); assert.equal(h.calls.runtime.length,0); assert.equal(h.ctx.BUSY.has('key-1'),true);
});

test('actual handleCopy report missing triggers visible error and releases BUSY', async()=>{
  const h=harness({text:'OZON_API_V1 {}',response:{ok:false,error:'no report',code:'NOPE'}}); await h.ctx.handleCopy({},{}); assert.equal(h.calls.delivery.length,0); assert.equal(h.calls.toast.some(x=>String(x[0]).includes('no report')),true); assert.equal(h.ctx.BUSY.size,0);
});

test('actual handleCopy delivery failure notifies worker operation failure and releases BUSY', async()=>{
  const r={ok:false,pre_execution_error:true,report_text:'OZON_RESULT_V1\n{}',manual_operation_id:'op',delivery_id:'d',request_id:'r',auto_send:true};
  const h=harness({text:'OZON_API_V1 {}',response:r}); h.ctx.deliverReport=async()=>{throw Object.assign(new Error('delivery exploded'),{code:'DELIVERY_X'});}; await h.ctx.handleCopy({},{});
  assert.equal(h.calls.runtime.some(x=>x.type==='OZ_MANUAL_DELIVERY_FAILED'),true); assert.equal(h.ctx.BUSY.size,0);
});

test('actual handleCopy auto_send=false does not require confirmed user turn but still completes operation', async()=>{
  const r={ok:false,pre_execution_error:true,report_text:'OZON_RESULT_V1\n{}',manual_operation_id:'op',delivery_id:'d',request_id:'r',auto_send:false};
  const h=harness({text:'OZON_API_V1 {}',response:r,deliveryConfirmed:false}); await h.ctx.handleCopy({},{});
  assert.equal(h.calls.delivery[0].a,false); assert.equal(h.calls.delivery[0].o.confirmUserTurn,false); assert.equal(h.calls.runtime.some(x=>x.type==='OZ_MANUAL_DELIVERY_COMPLETE'),true); assert.equal(h.calls.runtime.some(x=>x.type==='OZ_REPORT_DELIVERY_CONFIRMED'),false);
});
