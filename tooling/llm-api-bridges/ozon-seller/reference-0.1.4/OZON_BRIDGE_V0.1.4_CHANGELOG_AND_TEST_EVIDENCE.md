# Ozon Bridge v0.1.4 — pre-execution errors to ChatGPT

Date: 2026-08-12
Base production artifact: v0.1.3 exact archive
Release artifact SHA-256: `df344f34f3ed5d0a16648d5ba7aa274f16512efc87223c5e81fac5ffb23da98a`

## Defect fixed

v0.1.3 parsed an autorun writing block in `content_script.js`. If `OzonContract.parseCommand()` threw (for example malformed JSON with a raw newline/control character inside a JSON string), the content script displayed a local toast, stopped the watcher, and returned. No worker-owned delivery was claimed, so ChatGPT never received an `OZON_RESULT_V1` error.

## Code changes

1. `content_script.js`
   - added `reportAutoPreExecutionError()`;
   - malformed/invalid `OZON_API_V1` commands now send `OZ_AUTO_PREEXEC_ERROR` to the service worker;
   - raw invalid command text is **not** sent in the error payload; only safe code/message/stage plus a one-way fingerprint are sent;
   - unexpected autorun watcher exceptions use the same error-delivery path;
   - watcher stops only after the worker has accepted/owned the error delivery, or after an explicit safe rejection/failure path.

2. `service_worker.js`
   - added worker-owned `handleAutoPreExecutionError()`;
   - validates active run, owner tab, current conversation binding and manual/autorun mutual exclusion before claiming delivery;
   - transitions directly `WAITING_COMMAND -> DELIVERING` and **never calls `executeOzonCore()`** for pre-execution errors;
   - reuses existing claim/commit/confirm/recovery single-flight delivery lifecycle;
   - persists safe `last_error` with `external_request_executed:false`;
   - deduplicates the same assistant-turn/fingerprint;
   - worker-side parser failure in `OZ_AUTO_COMMAND_READY` also falls back to the same chat error delivery path.

3. `shared/ozon_contract.js`
   - added `textFingerprint()` for deterministic fingerprinting of invalid/unparseable command text without echoing it;
   - added `formatPreExecutionErrorReport()` producing canonical `OZON_RESULT_V1` with:
     - `operation:null`;
     - `command.accepted:false`;
     - `request_meta.stage`;
     - `request_meta.external_request_executed:false`;
     - `http_status:0`;
     - `result.error.automatic_retry:false`;
     - `result.error.external_request_executed:false`;
   - reuses existing bridge-error redaction for URLs, credential labels, e-mail, phone and long secret-like strings.

4. Version surfaces updated from `0.1.3` to `0.1.4` in manifest, worker, content script, popup, contract and runtime names.

5. Default autorun prompt now explicitly documents that parse/validation/watcher failures are delivered as `OZON_RESULT_V1` and that `external_request_executed=false` means no Ozon request occurred.

## Automated tests

Final suite: **26/26 PASS**.

The worker integration harness emulates Chrome MV3 runtime pieces used by the changed path: `chrome.runtime.onMessage`, `chrome.storage.local`, `chrome.tabs.get/query/sendMessage`, live ChatGPT conversation identity, binding state, autorun run state, delivery push, WebCrypto, and a counted provider `fetch`.

Covered cases include:

- exact malformed JSON/control-character class that caused the observed failure;
- content control-flow regression: invalid parse no longer takes toast-only `stopAutoWatch("invalid_command")` path;
- pre-execution report envelope and safe redaction;
- malformed command -> chat delivery claim -> **provider fetch count = 0**;
- worker parser fallback -> chat delivery -> **provider fetch count = 0**;
- duplicate error -> no second delivery and **provider fetch count = 0**;
- wrong tab -> fail closed, no delivery/request;
- conversation mismatch -> fail closed, no delivery/request;
- manual mode -> blocks autorun path safely;
- invalid supplied fingerprint -> safe deterministic replacement;
- report-prefix integration;
- claim -> commit -> confirmation -> new `WAITING_COMMAND` watcher;
- persisted claimed error delivery recovery -> delivery resumed with **no provider replay**;
- finish requested while delivering -> stops only after confirmed chat delivery;
- valid command regression -> **exactly one provider fetch**;
- all production JavaScript syntax checked with `node --check`;
- manifest host permissions remain ChatGPT + fixed `api-seller.ozon.ru` only;
- all runtime version surfaces are `0.1.4`.

A compact TAP/coverage summary is stored in `evidence/node-tests-and-coverage-summary.txt`; the complete local raw run is retained with the build evidence. Whole-file percentages include large unchanged legacy surfaces; tests are targeted at every behavior-changing path and the dependencies traversed by the fix rather than claiming that all legacy extension lines were rewritten or re-covered.

## Packaging tests

- deterministic ZIP created from the production directory only;
- ZIP extracted into a fresh directory;
- **16/16 production files byte-exact** against build source after extraction;
- fresh extracted extension passed Chromium packaging: `chromium --pack-extension=...` exit code **0**;
- tests/evidence are not included in the production ZIP;
- deterministic rebuild from the reconstructed tree was byte-identical to the release ZIP;
- production ZIP SHA-256: `df344f34f3ed5d0a16648d5ba7aa274f16512efc87223c5e81fac5ffb23da98a`.

Evidence files:
- `evidence/node-tests-and-coverage-summary.txt`
- `evidence/zip-byte-compare.txt`
- `evidence/chromium-pack-status.txt`
- `evidence/SHA256SUMS.txt`
- `evidence/OZON_BRIDGE_V0.1.4_PATCH.diff`

Executable regression tests are committed under `tests/`; `run_tests.sh` runs the full 26-test suite with Node coverage enabled.
`run_tests.sh` reconstructs v0.1.4 from the canonical sibling v0.1.3 exact archive plus the committed patch, verifies all 16 production file hashes, and then runs the regression suite. The separately packaged release ZIP is identified by the SHA-256 above.
