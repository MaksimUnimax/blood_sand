import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const DIST = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'dist-step7-candidate');
const source = (p) => readFileSync(join(DIST, p), 'utf8');

class FakeElement {
  constructor(tag='div') { this.tagName=tag.toUpperCase(); this.children=[]; this.parentElement=null; this.attrs=new Map(); this.isConnected=true; this.style={display:'block',visibility:'visible'}; this.disabled=false; this.textContent=''; this.value=''; this.listeners=new Map(); }
  appendChild(c){ c.parentElement=this; this.children.push(c); return c; }
  contains(n){ for(let x=n;x;x=x.parentElement) if(x===this) return true; return false; }
  closest(selector){ for(let x=this;x;x=x.parentElement){ if(match(x,selector)) return x; } return null; }
  querySelector(selector){ return walk(this).find((n)=>n!==this&&match(n,selector))||null; }
  querySelectorAll(selector){ return walk(this).filter((n)=>n!==this&&match(n,selector)); }
  getAttribute(k){ return this.attrs.has(k)?this.attrs.get(k):null; }
  setAttribute(k,v){ this.attrs.set(k,String(v)); }
  removeAttribute(k){ this.attrs.delete(k); }
  getBoundingClientRect(){ return {width:100,height:30}; }
  focus(){}
  dispatchEvent(e){ e.target ||= this; for(const fn of this.listeners.get(e.type)||[]) fn(e); return true; }
  addEventListener(t,fn){ if(!this.listeners.has(t)) this.listeners.set(t,[]); this.listeners.get(t).push(fn); }
  removeEventListener(t,fn){ this.listeners.set(t,(this.listeners.get(t)||[]).filter((x)=>x!==fn)); }
  matches(selector){ return match(this,selector); }
  click(){ this.clickCount=(this.clickCount||0)+1; this.dispatchEvent({type:'click',target:this,isTrusted:false,defaultPrevented:false}); }
}
class FakeHTMLElement extends FakeElement {}
class FakeHTMLButtonElement extends FakeHTMLElement {}
class FakeHTMLTextAreaElement extends FakeHTMLElement {}
class FakeHTMLInputElement extends FakeHTMLElement {}

function attr(node,name){ return node.getAttribute(name); }
function match(node, selector){
  for(const raw of String(selector).split(',').map((x)=>x.trim())){
    if(raw==='.Standalone-Input' && attr(node,'class')?.split(/\s+/).includes('Standalone-Input')) return true;
    if(raw==='.StandaloneInput-Container' && attr(node,'class')?.split(/\s+/).includes('StandaloneInput-Container')) return true;
    if(raw==='form' && node.tagName==='FORM') return true;
    if(raw==='[data-testid="inputbase-textarea"]' && attr(node,'data-testid')==='inputbase-textarea') return true;
    if(raw==='[data-highlight-id="alice-input"] textarea' && node.tagName==='TEXTAREA' && node.closest('[data-highlight-id="alice-input"]')) return true;
    if(raw==='[data-testid="standalone-input"]' && attr(node,'data-testid')==='standalone-input') return true;
    if(raw==='[data-testid="standalone-input-field"]' && attr(node,'data-testid')==='standalone-input-field') return true;
    if(raw==='[data-highlight-id="alice-input"]' && attr(node,'data-highlight-id')==='alice-input') return true;
    if(raw==='[data-testid="input-controls-root"]' && attr(node,'data-testid')==='input-controls-root') return true;
    if(raw==='[data-testid="oknyx"]' && attr(node,'data-testid')==='oknyx') return true;
    if(raw==='button[data-testid="InputControls-Plus-Button"][aria-label="Добавить файл"][aria-haspopup="dialog"]' && node.tagName==='BUTTON' && attr(node,'data-testid')==='InputControls-Plus-Button' && attr(node,'aria-label')==='Добавить файл' && attr(node,'aria-haspopup')==='dialog') return true;
  }
  return false;
}
function walk(root){ const out=[]; const q=[root]; while(q.length){ const n=q.shift(); out.push(n); q.unshift(...n.children); } return out; }

function build({sendAria='Отправить', disabled=false, duplicate=false, unrelated=false}={}){
  const body=new FakeHTMLElement('body'); body.setAttribute('class','b-page');
  const shell=body.appendChild(new FakeHTMLElement('section')); shell.setAttribute('class','Standalone-Input');
  const container=shell.appendChild(new FakeHTMLElement('div')); container.setAttribute('class','StandaloneInput-Container');
  const field=container.appendChild(new FakeHTMLElement('div')); field.setAttribute('data-testid','standalone-input-field');
  const aliceInput=field.appendChild(new FakeHTMLElement('div')); aliceInput.setAttribute('data-highlight-id','alice-input');
  const textarea=aliceInput.appendChild(new FakeHTMLTextAreaElement('textarea')); textarea.setAttribute('data-testid','inputbase-textarea'); textarea.value='OZON_BATCH_RESULT_V1\n{"delivery_id":"live-unsent"}';
  const controlsWrap=container.appendChild(new FakeHTMLElement('div')); controlsWrap.setAttribute('class','StandaloneRichInput-Controls');
  const controls=controlsWrap.appendChild(new FakeHTMLElement('div')); controls.setAttribute('data-testid','input-controls-root');
  const plus=controls.appendChild(new FakeHTMLButtonElement('button')); plus.setAttribute('data-testid','InputControls-Plus-Button'); plus.setAttribute('aria-label','Добавить файл'); plus.setAttribute('aria-haspopup','dialog');
  const send=controls.appendChild(new FakeHTMLButtonElement('button')); send.setAttribute('id','oknyx-button'); send.setAttribute('data-highlight-id','alice-oknyx-button'); send.setAttribute('data-testid','oknyx'); send.setAttribute('aria-label',sendAria); send.disabled=disabled;
  if(duplicate){ const other=controls.appendChild(new FakeHTMLButtonElement('button')); other.setAttribute('data-testid','oknyx'); other.setAttribute('aria-label','Отправить'); }
  if(unrelated){ const out=body.appendChild(new FakeHTMLButtonElement('button')); out.setAttribute('data-testid','oknyx'); out.setAttribute('aria-label','Отправить'); }
  return {body,shell,container,field,aliceInput,textarea,controls,send};
}

function contextFor(dom){
  const document={body:dom.body,documentElement:dom.body,
    querySelector(sel){ return walk(dom.body).find((n)=>match(n,sel))||null; },
    querySelectorAll(sel){ return walk(dom.body).filter((n)=>match(n,sel)); },
    addEventListener(){},removeEventListener(){}}
  const sandbox={console,globalThis:null,location:{hostname:'alice.yandex.ru'},document,
    Element:FakeElement,HTMLElement:FakeHTMLElement,HTMLButtonElement:FakeHTMLButtonElement,HTMLTextAreaElement:FakeHTMLTextAreaElement,HTMLInputElement:FakeHTMLInputElement,
    getComputedStyle:(n)=>n.style,InputEvent:class{constructor(type,init={}){this.type=type;Object.assign(this,init)}},Event:class{constructor(type,init={}){this.type=type;Object.assign(this,init)}},
    WeakMap,Map,Set,Date,Math,Promise,setTimeout,clearTimeout,TextEncoder};
  sandbox.globalThis=sandbox; vm.createContext(sandbox);
  vm.runInContext(source('shared/ai_adapters.js'),sandbox,{filename:'ai_adapters.js'});
  vm.runInContext(source('shared/composer_send.js'),sandbox,{filename:'composer_send.js'});
  return sandbox;
}

const positiveDom=build();
const ctx=contextFor(positiveDom);
const alice=ctx.OzonAIAdapters.ADAPTERS.alice;
const composerContext=alice.composerContext();
assert.ok(composerContext,'Alice composer context missing');
assert.ok(positiveDom.container.contains(positiveDom.textarea) && positiveDom.container.contains(positiveDom.send),'fixture topology invalid');
assert.notEqual(composerContext.root, positiveDom.container, 'PRE_FIX_EXPECTATION: current Alice context must reproduce too-narrow root');
const sendButton=alice.sendButton(composerContext);
assert.equal(sendButton, positiveDom.send, 'ALICE_SEND_BUTTON_MUST_RESOLVE_IN_REALISTIC_SIBLING_TOPOLOGY');
const deps={
  visible:ctx.OzonAIAdapters.visible,
  readComposerText:(c)=>alice.readComposerText(c),
  candidateButtons:(c)=>alice.sendButtonCandidates(c),
  fingerprint:(b)=>alice.sendButtonFingerprint(b)
};
const expected=positiveDom.textarea.value;
assert.equal(ctx.BB2ComposerSend.validateTarget({context:composerContext,button:sendButton},expected,deps).ok,true,'ALICE_SEND_TARGET_MUST_VALIDATE_IN_REALISTIC_TOPOLOGY');

const stable=await ctx.BB2ComposerSend.waitForValidatedTarget({expectedText:expected,timeoutMs:50,sampleIntervalMs:0,requiredStableSamples:3,deps:{...deps,resolveContext:()=>alice.composerContext(),resolveButton:(c)=>alice.sendButton(c),sleep:async()=>{}}});
assert.ok(stable,'ALICE_SEND_TARGET_MUST_STABILIZE');
const receipt=ctx.BB2ComposerSend.clickSynchronously({target:stable,expectedText:expected,deps});
assert.equal(receipt.method,'button.click');
assert.equal(positiveDom.send.clickCount,1,'ALICE_SEND_MUST_CLICK_EXACTLY_ONCE');
console.log('ALICE_SEND_REALISTIC_TOPOLOGY_POSITIVE_PASS');

for(const [name,aria] of [['ready','Алиса, начни слушать'],['stop','Алиса, стоп'],['unknown','Что-то новое']]){
  const d=build({sendAria:aria}); const c=contextFor(d); const a=c.OzonAIAdapters.ADAPTERS.alice; const cc=a.composerContext();
  assert.equal(a.sendButton(cc),null,`${name} state must fail closed`);
  console.log(`ALICE_SEND_NEGATIVE_${name.toUpperCase()}_PASS`);
}
{
  const d=build({disabled:true}); const c=contextFor(d); const a=c.OzonAIAdapters.ADAPTERS.alice; assert.equal(a.sendButton(a.composerContext()),null); console.log('ALICE_SEND_NEGATIVE_DISABLED_PASS');
}
{
  const d=build({duplicate:true}); const c=contextFor(d); const a=c.OzonAIAdapters.ADAPTERS.alice; assert.equal(a.sendButton(a.composerContext()),null,'duplicate oknyx must fail closed'); console.log('ALICE_SEND_NEGATIVE_DUPLICATE_PASS');
}
{
  const d=build({unrelated:true}); const c=contextFor(d); const a=c.OzonAIAdapters.ADAPTERS.alice; assert.equal(a.sendButton(a.composerContext()),d.send,'unrelated outside-shell oknyx must be ignored'); console.log('ALICE_SEND_NEGATIVE_UNRELATED_OUTSIDE_SHELL_PASS');
}
{
  const d=build(); const c=contextFor(d); const a=c.OzonAIAdapters.ADAPTERS.alice; const cc=a.composerContext(); const b=a.sendButton(cc); const bad={...deps,visible:c.OzonAIAdapters.visible,readComposerText:(x)=>a.readComposerText(x),candidateButtons:(x)=>a.sendButtonCandidates(x),fingerprint:(x)=>a.sendButtonFingerprint(x)};
  assert.equal(c.BB2ComposerSend.validateTarget({context:cc,button:b},'OTHER USER TEXT',bad).code,'COMPOSER_TEXT_CHANGED'); console.log('ALICE_SEND_NEGATIVE_MARKER_MISMATCH_PASS');
}
console.log('ALICE_AUTO_SEND_PREFX_GATE_PASS');
