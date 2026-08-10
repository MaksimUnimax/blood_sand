import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(new URL('../provider_transport.js', import.meta.url));
const ctx = { console, URL, TextEncoder, TextDecoder, Uint8Array, AbortController, setTimeout, clearTimeout, structuredClone };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(filename, 'utf8'), ctx, { filename });
const transport = ctx.LLMProviderTransport;

function headers(values={}) { return { get(name) { const key=Object.keys(values).find(k=>k.toLowerCase()===String(name).toLowerCase()); return key ? values[key] : null; } }; }
function response(body, {status=200, contentType='application/json', extraHeaders={}}={}) {
  const bytes = new TextEncoder().encode(typeof body === 'string' ? body : JSON.stringify(body));
  return { status, ok: status>=200&&status<300, headers: headers({'content-type':contentType,'content-length':String(bytes.length),...extraHeaders}), async arrayBuffer(){return bytes.buffer;} };
}
function code(promise, expected) { return assert.rejects(promise, e => e?.code === expected); }

test('exactly one fetch is executed for one request', async () => {
  let calls=0;
  const result=await transport.executeOne({url:'https://api-seller.ozon.ru/v1/analytics/data',host:'api-seller.ozon.ru',method:'POST',headers:{'Api-Key':'secret','Client-Id':'1'},body:{a:'я'}},{fetchImpl:async()=>{calls++;return response({ok:true});}});
  assert.equal(calls,1); assert.equal(result.status,200); assert.equal(result.body.parsed?.ok, true);
});

test('HTTP 429 is returned once and never retried', async () => {
  let calls=0;
  const result=await transport.executeOne({url:'https://advert-api.wildberries.ru/adv/v3/fullstats',host:'advert-api.wildberries.ru',method:'GET',headers:{Authorization:'secret'}},{fetchImpl:async()=>{calls++;return response({error:'rate'},{status:429,extraHeaders:{'Retry-After':'12'}});}});
  assert.equal(calls,1); assert.equal(result.status,429); assert.equal(result.rateLimit['retry-after'],'12');
});

test('non-ASCII header is rejected before fetch', async () => {
  let calls=0;
  await code(transport.executeOne({url:'https://api-seller.ozon.ru/x',host:'api-seller.ozon.ru',method:'POST',headers:{'Api-Key':'секрет'},body:{}},{fetchImpl:async()=>{calls++;return response({});}}),'INVALID_HEADER_VALUE');
  assert.equal(calls,0);
});

test('host mismatch / http / credential URL / forbidden method fail before fetch', async () => {
  const fake=async()=>{throw new Error('must not call');};
  await code(transport.executeOne({url:'https://evil.test/x',host:'api-seller.ozon.ru',method:'GET',headers:{}},{fetchImpl:fake}),'HOST_MISMATCH');
  await code(transport.executeOne({url:'http://api-seller.ozon.ru/x',host:'api-seller.ozon.ru',method:'GET',headers:{}},{fetchImpl:fake}),'HTTPS_REQUIRED');
  await code(transport.executeOne({url:'https://u:p@api-seller.ozon.ru/x',host:'api-seller.ozon.ru',method:'GET',headers:{}},{fetchImpl:fake}),'URL_CREDENTIALS_FORBIDDEN');
  await code(transport.executeOne({url:'https://api-seller.ozon.ru/x',host:'api-seller.ozon.ru',method:'DELETE',headers:{}},{fetchImpl:fake}),'HTTP_METHOD_FORBIDDEN');
});

test('response content-length above limit fails', async () => {
  const huge={status:200,ok:true,headers:headers({'content-length':'999999','content-type':'application/json'}),async arrayBuffer(){throw new Error('must not read');}};
  await code(transport.executeOne({url:'https://api-seller.ozon.ru/x',host:'api-seller.ozon.ru',method:'GET',headers:{}},{fetchImpl:async()=>huge,maxResponseBytes:1024}),'RESPONSE_TOO_LARGE');
});

test('invalid JSON remains raw provider evidence instead of being invented', async () => {
  const result=await transport.executeOne({url:'https://api-seller.ozon.ru/x',host:'api-seller.ozon.ru',method:'GET',headers:{}},{fetchImpl:async()=>response('not-json')});
  assert.equal(result.body.parsed,null); assert.equal(result.body.rawText,'not-json');
});

test('binary response remains bytes and is not coerced to text/json', async () => {
  const result=await transport.executeOne({url:'https://seller-analytics-api.wildberries.ru/file',host:'seller-analytics-api.wildberries.ru',method:'GET',headers:{},response:'BINARY'},{fetchImpl:async()=>response('ZIPDATA',{contentType:'application/zip'})});
  assert.equal(result.body.kind,'BINARY'); assert.equal(result.body.contentType,'application/zip'); assert.equal(result.body.byteLength,7);
});

test('timeout abort produces REQUEST_TIMEOUT and no retry', async () => {
  let calls=0;
  const fetchImpl=(url,opts)=>new Promise((resolve,reject)=>{calls++;opts.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true});});
  await code(transport.executeOne({url:'https://api-seller.ozon.ru/x',host:'api-seller.ozon.ru',method:'GET',headers:{}},{fetchImpl,timeoutMs:5}),'REQUEST_TIMEOUT');
  assert.equal(calls,1);
});
