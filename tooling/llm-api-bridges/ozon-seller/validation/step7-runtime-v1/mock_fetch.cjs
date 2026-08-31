'use strict';
const fs = require('node:fs');
const calls = [];
const logPath = process.env.STEP7_MOCK_FETCH_LOG;
function write(rec) {
  if (logPath) fs.appendFileSync(logPath, JSON.stringify(rec) + '\n', 'utf8');
  process.stderr.write(`STEP7_MOCK_FETCH ${JSON.stringify(rec)}\n`);
}
function payloadFor(pathname, body, ordinal) {
  const common = {
    mock: {
      request_ordinal: ordinal,
      path: pathname,
      body,
    },
    result: [],
    items: [],
    postings: [],
    returns: [],
    warehouses: [],
    delivery_methods: [],
    total: 0,
    count: 0,
    has_next: false,
    cursor: '',
    next_page_token: '',
  };
  // Keep representative shapes for adapters that inspect common envelopes.
  if (pathname === '/v1/report/info') return {result: {status: 'success', file: 'mock://report.csv'}, ...common};
  if (pathname === '/v1/report/warehouse/stock') return {result: {status: 'success', file: 'mock://warehouse-stock.csv'}, ...common};
  if (pathname === '/v1/warehouse/list') return {result: [{warehouse_id: 101, name: 'Mock warehouse'}], ...common};
  if (pathname === '/v1/delivery-method/list') return {result: [{id: 201, name: 'Mock delivery method'}], ...common};
  if (pathname === '/v1/product/info/stocks-by-warehouse/fbs') return {result: [{product_id: 1082848375, warehouse_id: 1020000220243000, present: 1, reserved: 0}], ...common};
  return common;
}
globalThis.fetch = async function step7MockFetch(url, init = {}) {
  const u = new URL(String(url));
  const bodyText = typeof init.body === 'string' ? init.body : '';
  let body = null;
  try { body = bodyText ? JSON.parse(bodyText) : null; } catch { body = bodyText; }
  const headers = Object.fromEntries(new Headers(init.headers || {}).entries());
  const rec = {
    ordinal: calls.length + 1,
    url: u.toString(),
    origin: u.origin,
    path: u.pathname,
    method: String(init.method || 'GET').toUpperCase(),
    headers,
    body,
  };
  calls.push(rec);
  write(rec);
  return new Response(JSON.stringify(payloadFor(u.pathname, body, rec.ordinal)), {
    status: 200,
    headers: {'content-type': 'application/json; charset=utf-8'},
  });
};
process.on('exit', () => {
  process.stderr.write(`STEP7_MOCK_FETCH_TOTAL ${calls.length}\n`);
});
