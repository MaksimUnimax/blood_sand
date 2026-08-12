# Ozon Bridge v0.1.5 — complete manual error-to-chat path

Date: 2026-08-12
Base: immutable v0.1.4 release
Release SHA-256: `130d88f3225087aaecbf12819d39949ff68b9ab6d422ff8d3cd7b55953cd4651`

## Live defect reproduced

A deliberately malformed `OZON_API_V1` command was clicked with Manual mode enabled. v0.1.4 still parsed the command in `content_script.js`; its `catch` showed `Ozon: команда не выполнена — ...` and returned before the service worker owned any result. No `OZON_RESULT_V1` reached ChatGPT and no provider request occurred.

## Architecture correction

This release removes the local Manual parser gate instead of adding a second ad-hoc Manual protocol.

- Manual command clicks now always use the existing `OZ_EXECUTE_COMMAND` worker path after only checking the `OZON_API_V1` prefix.
- `commandKey()` uses `textFingerprint()` directly, so malformed commands have deterministic busy/dedup keys without requiring a successful parse.
- The worker owns Manual parsing/validation. Controlled parse/validation failures are converted into canonical `OZON_RESULT_V1` pre-execution reports with `external_request_executed:false` and a durable Manual delivery operation.
- Manual mode race-off and active-autorun gate failures after a trusted tab/conversation/binding check are also converted to chat-visible pre-execution reports with zero provider requests.
- Security identity failures (missing sender tab, conversation mismatch/unbound identity) remain fail-closed and are not injected into an untrusted/wrong chat.
- `buildPreExecutionErrorResult()` is a single generic result builder shared by Manual and Autorun.
- `buildExecutionErrorResult()` is a single generic execution-error result builder shared by Manual and Autorun.
- Manual provider transport exceptions are no longer terminal worker-only failures: after exactly one provider attempt they become `OZON_RESULT_V1 result.error`, `automatic_retry:false`, and enter the normal Manual delivery lifecycle.
- No `OZ_MANUAL_PREEXEC_ERROR` side-channel/message type was added.
- Existing exactly-once Manual request token/active-operation fences and delivery completion/failure lifecycle remain in force.

## Test matrix

Final source-tree suite: **67/67 PASS**; 0 fail; 0 skipped; 0 cancelled.

The same **67/67** suite was run again against a fresh extraction of the final production ZIP.

Coverage/audit includes:

- actual production `handleCopy()` VM-executed across malformed, valid, non-command, disabled Manual, conversation resync, BUSY duplicate, missing-report, delivery-failure and `auto_send=false` branches;
- actual production `commandKey()` VM-executed for valid and malformed command text;
- exact raw-newline/control-character malformed JSON class from the live incident;
- unsupported operation and unknown top-level-field validation errors;
- Manual mode race-off and active-Autorun gate errors;
- valid Manual request → exactly one provider fetch;
- HTTP 400 Manual request → exactly one provider fetch and provider error report;
- provider transport exception → exactly one provider fetch, bridge error report, no automatic retry;
- pre-execution delivery completion and delivery-failure transitions;
- duplicate request-id and active-operation fences;
- report prefix and `auto_send=false` behavior;
- conversation mismatch/wrong tab fail-closed security boundaries;
- full retained v0.1.4 Autorun pre-execution regression/recovery suite;
- static architecture invariants proving Manual has no local `parseCommand()` gate, Manual/Autorun share the generic builders, and no Manual-specific preexec message side-channel exists;
- all production JavaScript syntax via `node --check`;
- manifest permissions remain ChatGPT + fixed `api-seller.ozon.ru` only.

Node whole-tree coverage is retained as supporting evidence, not misrepresented as 100% legacy-extension coverage: 51.29% lines, 58.77% branches, 73.98% functions. The behavior-changing Manual harness/tests themselves are 100% line-executed where extractable, and all changed paths are exercised by source/runtime integration tests plus static invariant checks. Large unrelated legacy UI/runtime surfaces are not claimed as rewritten or fully covered.

## Packaging

- 16/16 production files byte-exact after fresh ZIP extraction;
- fresh extracted ZIP passes the complete 67-test suite;
- Chromium `--pack-extension` exit code 0 on fresh extracted extension;
- deterministic rebuild SHA is exactly `130d88f3225087aaecbf12819d39949ff68b9ab6d422ff8d3cd7b55953cd4651`;
- production ZIP contains no tests/evidence.

Evidence:

- `evidence/OZON_BRIDGE_V0.1.5_PATCH.diff`
- `evidence/production-file-SHA256SUMS.txt`
- `evidence/node-tests-and-coverage-summary.txt`
- `evidence/node-tests-and-coverage.txt`
- `evidence/release-extracted-tests.txt`
- `evidence/zip-byte-compare.txt`
- `evidence/chromium-pack-status.txt`
- `evidence/release-SHA256.txt`
