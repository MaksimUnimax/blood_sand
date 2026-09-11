import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { Buffer } from 'node:buffer';

const repo = process.argv[2] || '.';
const root = path.join(repo, 'tooling/llm-api-bridges/ozon-seller');
const dist = path.join(root, 'dist-step7-candidate');
const read = (rel) => fs.readFileSync(path.join(dist, rel), 'utf8');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const STORE_NAME = 'artifacts';

function transactionLifecycle({ outcome = 'abort', result = 'synthetic-key' } = {}) {
  const state = {
    request_success_fired: false,
    transaction_abort_fired: false,
    transaction_complete_fired: false,
    durable_record_committed: false
  };
  const tx = {
    error: null,
    onabort: null,
    oncomplete: null,
    onerror: null,
    objectStore() {
      return {
        put() {
          const request = { result, error: null, onsuccess: null, onerror: null };
          setTimeout(() => {
            state.request_success_fired = true;
            request.onsuccess?.({ target: request });
            setTimeout(() => {
              if (outcome === 'complete') {
                state.durable_record_committed = true;
                state.transaction_complete_fired = true;
                tx.oncomplete?.({ target: tx });
              } else {
                state.transaction_abort_fired = true;
                tx.error = new Error('synthetic transaction abort after request success');
                tx.onabort?.({ target: tx });
              }
            }, 20);
          }, 0);
          return request;
        },
        delete() { return this.put(); },
        get() { return this.put(); },
        getAll() { return this.put(); }
      };
    }
  };
  const db = { transaction() { return tx; }, close() {} };
  return { db, state };
}

function fakeIndexedDb(lifecycle) {
  return {
    open() {
      const openRequest = {};
      setTimeout(() => {
        openRequest.result = {
          objectStoreNames: { contains: () => true },
          transaction: lifecycle.db.transaction,
          close() {}
        };
        openRequest.onsuccess?.({ target: openRequest });
      }, 0);
      return openRequest;
    }
  };
}

function baseProvider(counter) {
  const bytes = new TextEncoder().encode('\uFEFFdate;campaign;expense\n2026-09-11;123;10.50\n');
  return Object.freeze({
    async executeCommandObject(command) {
      counter.count += 1;
      const result = {
        content_type: 'text/csv',
        byte_length: bytes.byteLength,
        encoding: 'base64',
        file_content_base64: Buffer.from(bytes).toString('base64')
      };
      return Object.freeze({
        ok: true,
        operation: command.operation,
        http_status: 200,
        result,
        report_text: `OZON_RESULT_V1\n${JSON.stringify({ operation: command.operation, http_status: 200, result }, null, 2)}`,
        response_meta: { content_type: 'text/csv' }
      });
    }
  });
}

function directBinaryContext(lifecycle, counter) {
  const provider = baseProvider(counter);
  const context = vm.createContext({
    console,
    URL,
    TextEncoder,
    TextDecoder,
    Uint8Array,
    ArrayBuffer,
    Promise,
    setTimeout,
    clearTimeout,
    crypto: webcrypto,
    indexedDB: fakeIndexedDb(lifecycle),
    ProviderTransportCore: Object.freeze({ reportBase64ToBytes: (value) => new Uint8Array(Buffer.from(String(value || ''), 'base64')) }),
    OzonOperationRegistry: Object.freeze({ operation: () => ({ provider: 'performance_api', response_style: 'binary', response_content_types: ['text/csv'] }) }),
    OzonProvider: provider,
    OzonContract: Object.freeze({ parseCommand() { throw new Error('unused'); } })
  });
  context.globalThis = context;
  vm.runInContext(read('shared/direct_binary_file_delivery_patch.js'), context, { filename: 'direct_binary_file_delivery_patch.js' });
  return context;
}

async function waitFor(state, field, message) {
  for (let i = 0; i < 100 && state[field] !== true; i += 1) await delay(2);
  assert.equal(state[field], true, message);
}

async function directAbortCase() {
  const lifecycle = transactionLifecycle({ outcome: 'abort' });
  const counter = { count: 0 };
  const context = directBinaryContext(lifecycle, counter);
  let settled = false;
  let value = null;
  let error = null;
  const promise = context.OzonProvider.executeCommandObject({ operation: 'performance_daily_csv', params: {} }, {}, {});
  promise.then((next) => { settled = true; value = next; }, (next) => { settled = true; error = next; });
  await waitFor(lifecycle.state, 'request_success_fired', 'direct request success did not fire');
  await delay(5);
  assert.equal(settled, false, 'direct writer must remain pending after request success until transaction outcome');
  assert.equal(value?.result?.generated_file_ref || null, null, 'direct writer must not publish a ref before transaction commit');
  await waitFor(lifecycle.state, 'transaction_abort_fired', 'direct transaction abort did not fire');
  await delay(5);
  assert.equal(Boolean(error), true, 'direct transaction abort must reject the write');
  assert.equal(lifecycle.state.durable_record_committed, false);
  assert.equal(counter.count, 1, 'direct abort path must not retry provider request');
  return { ref_published_before_abort: value?.result?.generated_file_ref || null, raw_bytes_discarded_before_abort: value ? !('file_content_base64' in value.result) : false };
}

async function directCommitCase() {
  const lifecycle = transactionLifecycle({ outcome: 'complete' });
  const counter = { count: 0 };
  const context = directBinaryContext(lifecycle, counter);
  let settled = false;
  let value = null;
  let error = null;
  const promise = context.OzonProvider.executeCommandObject({ operation: 'performance_daily_csv', params: {} }, {}, {});
  promise.then((next) => { settled = true; value = next; }, (next) => { settled = true; error = next; });
  await waitFor(lifecycle.state, 'request_success_fired', 'direct positive request success did not fire');
  await delay(5);
  assert.equal(settled, false, 'direct writer must not resolve on request success alone');
  await waitFor(lifecycle.state, 'transaction_complete_fired', 'direct transaction complete did not fire');
  await delay(5);
  assert.equal(Boolean(error), false);
  assert.equal(settled, true, 'direct writer must resolve after transaction complete');
  assert.match(String(value?.result?.generated_file_ref || ''), /^rpf_s_/);
  assert.equal('file_content_base64' in value.result, false, 'raw bytes may be discarded only after durable commit');
  assert.equal(lifecycle.state.durable_record_committed, true);
  assert.equal(counter.count, 1);
}

function extractGenericIdbRequest(source) {
  const start = source.indexOf('async function idbRequest');
  const end = source.indexOf('\n\n  function getArtifact', start);
  assert.ok(start >= 0 && end > start, 'generic idbRequest source boundary missing');
  return source.slice(start, end);
}

async function genericCase(outcome) {
  const lifecycle = transactionLifecycle({ outcome, result: 'generic-result' });
  const workerSource = read('shared/file_delivery_port_worker.js');
  const helperSource = extractGenericIdbRequest(workerSource);
  const context = vm.createContext({
    Promise,
    STORE_NAME,
    openDb: async () => lifecycle.db
  });
  context.globalThis = context;
  vm.runInContext(`${helperSource}\nglobalThis.__idbRequest = idbRequest;`, context, { filename: 'generic-idb-request-extracted.js' });

  let settled = false;
  let value = null;
  let error = null;
  const promise = context.__idbRequest('readwrite', (store) => store.put({ artifact_key: 'generic' }));
  promise.then((next) => { settled = true; value = next; }, (next) => { settled = true; error = next; });
  await waitFor(lifecycle.state, 'request_success_fired', 'generic request success did not fire');
  await delay(5);
  assert.equal(settled, false, 'generic idbRequest must remain pending after request success');

  if (outcome === 'abort') {
    await waitFor(lifecycle.state, 'transaction_abort_fired', 'generic transaction abort did not fire');
    await delay(5);
    assert.equal(Boolean(error), true, 'generic transaction abort must reject');
    assert.equal(value, null);
    assert.equal(lifecycle.state.durable_record_committed, false);
  } else {
    await waitFor(lifecycle.state, 'transaction_complete_fired', 'generic transaction complete did not fire');
    await delay(5);
    assert.equal(Boolean(error), false);
    assert.equal(settled, true, 'generic idbRequest must resolve after transaction complete');
    assert.equal(value, 'generic-result');
    assert.equal(lifecycle.state.durable_record_committed, true);
  }
}

const directAbort = await directAbortCase();
await directCommitCase();
await genericCase('abort');
await genericCase('complete');

const workerSource = read('shared/file_delivery_port_worker.js');
const directSource = read('shared/direct_binary_file_delivery_patch.js');
const genericPrematurePattern = workerSource.includes('request.onsuccess = () => resolve(request.result);');
const directPrematurePattern = directSource.includes('request.onsuccess = () => resolve(); request.onerror');
const genericCommitBoundaryPresent = /tx\.oncomplete\s*=/.test(extractGenericIdbRequest(workerSource));
const directPutSource = directSource.slice(directSource.indexOf('async function putArtifact'), directSource.indexOf('\n\n  function safeResultReport'));
const directCommitBoundaryPresent = /tx\.oncomplete\s*=/.test(directPutSource);

console.log(JSON.stringify({
  direct_ref_published_before_abort: directAbort.ref_published_before_abort,
  direct_raw_bytes_discarded_before_abort: directAbort.raw_bytes_discarded_before_abort,
  direct_request_success_resolves_promise: directPrematurePattern,
  direct_transaction_complete_boundary_present: directCommitBoundaryPresent,
  generic_request_success_resolves_promise: genericPrematurePattern,
  generic_transaction_complete_boundary_present: genericCommitBoundaryPresent
}, null, 2));

assert.equal(directPrematurePattern, false, 'direct writer must not resolve on IDBRequest success');
assert.equal(directCommitBoundaryPresent, true, 'direct writer must resolve only on transaction complete');
assert.equal(genericPrematurePattern, false, 'generic artifact idbRequest must not resolve on IDBRequest success');
assert.equal(genericCommitBoundaryPresent, true, 'generic artifact idbRequest must resolve only on transaction complete');

console.log('OZON_INDEXEDDB_TRANSACTION_DURABILITY_GATE_PASS');
