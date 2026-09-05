#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(process.argv[2] || '.');
const shared = path.join(root, 'tooling', 'llm-api-bridges', 'ozon-seller', 'dist-step7-candidate', 'shared');

for (const file of [
  'ozon_operation_registry.js',
  'ozon_contract.js',
  'ozon_credentials.js',
  'provider_transport_core.js',
  'ozon_provider.js'
]) {
  vm.runInThisContext(fs.readFileSync(path.join(shared, file), 'utf8'), { filename: file });
}

const calls = [];
const fetchImpl = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  return new Response(JSON.stringify({ balance: 0, currency_code: 'RUB' }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
};

const provider = globalThis.OzonProviderFactory.createOzonProvider({
  fetchImpl,
  uuid: () => '11111111-1111-4111-8111-111111111111',
  now: () => 1800000000000
});

const command = {
  operation: 'finance_balance',
  params: { date_from: '2026-08-28', date_to: '2026-09-03' }
};

const result = await provider.executeCommandObject(command, { clientId: 'client', apiKey: 'key' }, {});
assert.equal(calls.length, 1, 'one logical command must issue exactly one transport request');
const call = calls[0];
const url = new URL(call.url);
assert.equal(url.pathname, '/v1/finance/balance');
assert.equal(String(call.options.method || '').toUpperCase(), 'POST');
assert.deepEqual(JSON.parse(String(call.options.body)), {
  date_from: '2026-08-28',
  date_to: '2026-09-03'
});
assert.equal(result.ok, true);

console.log('DEFECT_015_AUTONOMOUS_FINANCE_BALANCE_ONE_REQUEST_PASS');
console.log('DEFECT_015_AUTONOMOUS_FINANCE_BALANCE_EXACT_YMD_BODY_PASS');
console.log('DEFECT_015_AUTONOMOUS_FINANCE_BALANCE_TRANSPORT_GATE_PASS');
