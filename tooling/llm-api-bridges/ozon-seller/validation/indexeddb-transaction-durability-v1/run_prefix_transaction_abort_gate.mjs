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

function fakeIndexedDbAbortAfterRequestSuccess() {
  const state = { request_success_fired: false, transaction_abort_fired: false, durable_record_committed: false };
  const indexedDB = {
    open() {
      const openRequest = {};
      setTimeout(() => {
        const db = {
          objectStoreNames: { contains: () => true },
          transaction() {
            const tx = {
              error: null,
              onabort: null,
              oncomplete: null,
              onerror: null,
              objectStore() {
                return {
                  put() {
                    const request = { result: 'synthetic-key', error: null, onsuccess: null, onerror: null };
                    setTimeout(() => {
                      state.request_success_fired = true;
                      request.onsuccess?.({ target: request });
                      setTimeout(() => {
                        state.transaction_abort_fired = true;
                        tx.error = new Error('synthetic transaction abort after request success');
                        tx.onabort?.({ target: tx });
                      }, 20);
                    }, 0);
                    return request;
                  }
                };
              }
            };
            return tx;
          },
          close() {}
        };
        openRequest.result = db;
        openRequest.onsuccess?.({ target: openRequest });
      }, 0);
      return openRequest;
    }
  };
  return { indexedDB, state };
}

const bytes = new TextEncoder().encode('\uFEFFdate;campaign;expense\n2026-09-11;123;10.50\n');
let providerCalls = 0;
const baseProvider = Object.freeze({
  async executeCommandObject(command) {
    providerCalls += 1;
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

const fake = fakeIndexedDbAbortAfterRequestSuccess();
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
  indexedDB: fake.indexedDB,
  ProviderTransportCore: Object.freeze({ reportBase64ToBytes: (value) => new Uint8Array(Buffer.from(String(value || ''), 'base64')) }),
  OzonOperationRegistry: Object.freeze({ operation: () => ({ provider: 'performance_api', response_style: 'binary', response_content_types: ['text/csv'] }) }),
  OzonProvider: baseProvider,
  OzonContract: Object.freeze({ parseCommand() { throw new Error('unused'); } })
});
context.globalThis = context;
vm.runInContext(read('shared/direct_binary_file_delivery_patch.js'), context, { filename: 'direct_binary_file_delivery_patch.js' });

let settled = false;
let settledValue = null;
let settledError = null;
const promise = context.OzonProvider.executeCommandObject({ operation: 'performance_daily_csv', params: {} }, {}, {});
promise.then((value) => { settled = true; settledValue = value; }, (error) => { settled = true; settledError = error; });

for (let i = 0; i < 50 && !fake.state.request_success_fired; i += 1) await delay(2);
assert.equal(fake.state.request_success_fired, true, 'synthetic IDB request success did not fire');
await delay(5);
const directPrematurelySettled = settled;
const directPrematureRef = settledValue?.result?.generated_file_ref || null;
const directRawBytesDiscarded = settledValue ? !('file_content_base64' in settledValue.result) : false;

for (let i = 0; i < 50 && !fake.state.transaction_abort_fired; i += 1) await delay(2);
assert.equal(fake.state.transaction_abort_fired, true, 'synthetic transaction abort did not fire');
await delay(5);
const directRejectedAfterAbort = Boolean(settledError);

const workerSource = read('shared/file_delivery_port_worker.js');
const genericPrematurePattern = workerSource.includes('request.onsuccess = () => resolve(request.result);');
const genericCommitBoundaryPresent = /tx\.oncomplete\s*=/.test(workerSource.slice(workerSource.indexOf('async function idbRequest'), workerSource.indexOf('function getArtifact')));

console.log(JSON.stringify({
  provider_calls: providerCalls,
  direct_request_success_fired: fake.state.request_success_fired,
  direct_transaction_abort_fired: fake.state.transaction_abort_fired,
  direct_promise_settled_before_abort: directPrematurelySettled,
  direct_generated_file_ref_published_before_abort: directPrematureRef,
  direct_raw_bytes_discarded_before_abort: directRawBytesDiscarded,
  direct_rejected_after_abort: directRejectedAfterAbort,
  generic_idb_request_success_resolves_promise: genericPrematurePattern,
  generic_idb_transaction_complete_boundary_present: genericCommitBoundaryPresent
}, null, 2));

assert.equal(directPrematurelySettled, false, 'DEFECT REPRODUCED: direct-binary writer resolves after request success before transaction commit');
assert.equal(directPrematureRef, null, 'generated file ref must not be published before transaction commit');
assert.equal(directRawBytesDiscarded, false, 'raw provider bytes must not be discarded before transaction commit');
assert.equal(directRejectedAfterAbort, true, 'transaction abort after request success must reject the write');
assert.equal(genericPrematurePattern, false, 'DEFECT REPRODUCED: generic artifact idbRequest resolves on request success');
assert.equal(genericCommitBoundaryPresent, true, 'generic artifact write must have transaction oncomplete commit boundary');
assert.equal(providerCalls, 1, 'reproduction must use exactly one synthetic provider call');

console.log('OZON_INDEXEDDB_TRANSACTION_DURABILITY_PREFIX_GATE_PASS');
