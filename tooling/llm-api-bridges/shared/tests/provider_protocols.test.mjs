import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

function load(path, globalName) {
  const filename = path instanceof URL ? fileURLToPath(path) : String(path);
  const context = { console, URL, URLSearchParams, TextEncoder, structuredClone };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
  return context[globalName];
}
const ozon = load(new URL('../../ozon-seller/provider/ozon_protocol.js', import.meta.url), 'OzonProtocol');
const wb = load(new URL('../../wildberries/provider/wb_protocol.js', import.meta.url), 'WBProtocol');

function throwsCode(fn, code) { assert.throws(fn, (e) => e?.code === code); }

test('Ozon: command is symbolic allowlist only', () => {
  const cmd = ozon.parseCommand('OZON_API_V1\n{"operation":"product_stocks","params":{"filter":{"offer_id":["A"]}}}');
  const req = ozon.buildRequest(cmd);
  assert.equal(req.url, 'https://api-seller.ozon.ru/v4/product/info/stocks');
  assert.equal(req.method, 'POST');
  assert.equal(req.effect, 'READ');
});

test('Ozon: arbitrary operation and transport injection are rejected before credentials/request', () => {
  throwsCode(() => ozon.parseCommand('OZON_API_V1\n{"operation":"delete_product","params":{}}'), 'UNSUPPORTED_OPERATION');
  throwsCode(() => ozon.parseCommand('OZON_API_V1\n{"operation":"analytics_data","params":{"url":"https://evil.test"}}'), 'FORBIDDEN_TRANSPORT_FIELD');
  throwsCode(() => ozon.parseCommand('OZON_API_V1\n{"operation":"analytics_data","params":{"headers":{"Api-Key":"x"}}}'), 'FORBIDDEN_TRANSPORT_FIELD');
});

test('Ozon: credentials are worker-side and evidence redaction contains no secrets', () => {
  const req = ozon.buildRequest(ozon.normalizeCommand({ operation: 'analytics_data', params: { date_from: '2026-08-01' } }));
  const authed = ozon.attachCredentials(req, { clientId: '123', apiKey: 'secret-ASCII' });
  assert.equal(authed.headers['Client-Id'], '123');
  assert.equal(authed.headers['Api-Key'], 'secret-ASCII');
  assert.doesNotMatch(JSON.stringify(ozon.redactRequestForEvidence(authed)), /secret|123/);
  throwsCode(() => ozon.attachCredentials(req, { clientId: '123', apiKey: 'секрет' }), 'INVALID_CREDENTIAL_ENCODING');
});

test('Ozon: every operation is hardcoded READ on official seller host', () => {
  for (const [name, meta] of Object.entries(ozon.OPERATIONS)) {
    assert.equal(meta.effect, 'READ', name);
    assert.match(meta.path, /^\//, name);
    assert.ok(['GET','POST'].includes(meta.method), name);
  }
});

test('WB: cards list uses fixed content host and body', () => {
  const cmd = wb.parseCommand('WB_API_V1\n{"operation":"cards_list","params":{"settings":{"cursor":{"limit":100}}}}');
  const req = wb.buildRequest(cmd);
  assert.equal(req.url, 'https://content-api.wildberries.ru/content/v2/get/cards/list');
  assert.equal(req.method, 'POST');
  assert.equal(req.credential, 'content');
});

test('WB: GET query serialization cannot become arbitrary nested transport', () => {
  const req = wb.buildRequest(wb.normalizeCommand({ operation: 'prices_all', params: { limit: 1000, offset: 0 } }));
  assert.equal(req.url, 'https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter?limit=1000&offset=0');
  throwsCode(() => wb.buildRequest(wb.normalizeCommand({ operation: 'prices_all', params: { filter: { x: 1 } } })), 'INVALID_QUERY_PARAM');
});

test('WB: path parameters are typed and cannot inject a path/URL', () => {
  const req = wb.buildRequest(wb.normalizeCommand({ operation: 'fbs_stocks', path: { warehouseId: 12345 }, params: { skus: [1] } }));
  assert.equal(req.url, 'https://marketplace-api.wildberries.ru/api/v3/stocks/12345');
  throwsCode(() => wb.normalizeCommand({ operation: 'fbs_stocks', path: { warehouseId: '../finance' }, params: {} }), 'INVALID_PATH_PARAM');
  throwsCode(() => wb.normalizeCommand({ operation: 'analytics_download_file', path: { downloadId: '../evil' }, params: {} }), 'INVALID_PATH_PARAM');
});

test('WB: unsupported/mutation aliases and secret injection rejected', () => {
  throwsCode(() => wb.normalizeCommand({ operation: 'price_update', params: {} }), 'UNSUPPORTED_OPERATION');
  throwsCode(() => wb.normalizeCommand({ operation: 'campaigns_list', params: { token: 'x' } }), 'FORBIDDEN_TRANSPORT_FIELD');
  throwsCode(() => wb.normalizeCommand({ operation: 'campaigns_list', params: { url: 'https://evil.test' } }), 'FORBIDDEN_TRANSPORT_FIELD');
});

test('WB: credential category is selected by operation, token is not evidence', () => {
  const req = wb.buildRequest(wb.normalizeCommand({ operation: 'campaign_stats', params: { ids: '1', beginDate: '2026-08-01', endDate: '2026-08-07' } }));
  assert.equal(req.host, 'advert-api.wildberries.ru');
  assert.equal(req.credential, 'promotion');
  const authed = wb.attachCredentials(req, { promotion: 'secret-token' });
  assert.equal(authed.headers.Authorization, 'secret-token');
  assert.doesNotMatch(JSON.stringify(wb.redactRequestForEvidence(authed)), /secret-token/);
});

test('WB: all provider hosts are fixed official Wildberries API domains and all operations READ', () => {
  for (const host of Object.values(wb.HOSTS)) assert.match(host, /\.wildberries\.ru$/);
  for (const [name, meta] of Object.entries(wb.OPERATIONS)) {
    assert.equal(meta.effect, 'READ', name);
    assert.ok(wb.HOSTS[meta.host], name);
  }
});

test('Both: result reports do not invent credentials and fingerprints are stable', () => {
  const oc = ozon.normalizeCommand({ operation:'product_stocks', params:{a:'кириллица'} });
  assert.equal(ozon.commandFingerprint(oc), ozon.commandFingerprint(oc));
  const report = ozon.formatResultReport({requestId:'r', command:oc, httpStatus:200, elapsedMs:1, result:{ok:true}});
  assert.match(report, /^OZON_RESULT_V1\n/);
  assert.doesNotMatch(report, /Api-Key|Client-Id/);
  const wc = wb.normalizeCommand({ operation:'cards_list', params:{locale:'ru'} });
  const wreport = wb.formatResultReport({requestId:'r', command:wc, httpStatus:200, elapsedMs:1, result:{ok:true}});
  assert.match(wreport, /^WB_RESULT_V1\n/);
});
