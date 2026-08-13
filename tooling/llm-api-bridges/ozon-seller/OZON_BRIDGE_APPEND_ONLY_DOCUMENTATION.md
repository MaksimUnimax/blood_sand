# Ozon Bridge — append-only documentation log

Status: canonical append-only operational history for the Ozon LLM ↔ API Bridge track.

## Append-only rule

This file is append-only.

Existing historical entries MUST NOT be rewritten, reordered, compacted, silently corrected, or deleted. If an older entry contains an error, append a new correction entry that explicitly references the affected entry. Future bridge releases, defect fixes, test-hardening passes, packaging evidence, security changes, operational incidents, and acceptance/rejection decisions MUST be recorded by appending a new dated section to the end of this file.

The version-specific reference directories remain immutable evidence snapshots. This log is the chronological human-readable history that links those snapshots together.

---

## 2026-08-12 — baseline carried forward: Ozon Bridge v0.1.3

Reference snapshot:

`tooling/llm-api-bridges/ozon-seller/reference-0.1.3/`

Role of v0.1.3 in the lineage:

- accepted exact production archive used as the build base for v0.1.4;
- one accepted `OZON_API_V1` command executes at most one provider HTTP request;
- no hidden retry, pagination loop, fan-out, or mutation;
- fixed Ozon Seller API host/operation allowlist; assistant text cannot inject arbitrary URL, method, headers, Client-Id, Api-Key, Authorization, or Client Secret;
- credentials remain isolated from ChatGPT/content-script output;
- manual and autorun lifecycle use worker-owned request/delivery state;
- exact archive remains preserved and is not modified by later releases.

Known defect discovered after v0.1.3 acceptance:

- malformed/invalid autorun command text could fail in `content_script.js` during `OzonContract.parseCommand()` before the worker owned a delivery;
- the content script showed a local toast, stopped its watcher, and returned;
- ChatGPT therefore received no `OZON_RESULT_V1` error even though the autorun sequence had failed;
- this was a pre-execution failure: no Ozon request should be considered executed for that condition.

---

## 2026-08-12 — Ozon Bridge v0.1.4

Primary implementation commit:

`1d5c5dad1733d984f37fab9cf274a6816af12d9d`

Final test-hardening commit:

`f8dbe45a098a3536ab9e027ed8f4d5fe5103046d`

Reference snapshot:

`tooling/llm-api-bridges/ozon-seller/reference-0.1.4/`

Release ZIP SHA-256:

`df344f34f3ed5d0a16648d5ba7aa274f16512efc87223c5e81fac5ffb23da98a`

### Defect fixed

v0.1.4 closes the v0.1.3 autorun pre-execution observability gap. A malformed command, parser failure, validation-stage failure in the changed path, or unexpected autorun watcher failure can now enter the normal worker-owned result-delivery lifecycle and be delivered to ChatGPT as `OZON_RESULT_V1` without executing an Ozon provider request.

### Production code changes

`content_script.js`:

- added `reportAutoPreExecutionError()`;
- parser failures no longer end only in a local toast + `stopAutoWatch("invalid_command")`;
- malformed command failures are reported to the worker with message type `OZ_AUTO_PREEXEC_ERROR`;
- unexpected watcher runtime exceptions use the same reporting path;
- raw invalid command text is not sent in the error payload; a deterministic one-way fingerprint is used instead;
- local watch termination now follows worker ownership/acceptance state so duplicate error delivery is not created.

`service_worker.js`:

- added worker-owned `handleAutoPreExecutionError()`;
- validates active run, owner tab, current conversation binding, and manual/autorun mutual exclusion;
- claims pre-execution failures directly into the existing delivery lifecycle;
- does not call `executeOzonCore()` for the pre-execution error path;
- records `external_request_executed:false`;
- deduplicates the same assistant-turn/fingerprint error;
- worker-side parse failure on the normal `OZ_AUTO_COMMAND_READY` path falls back to the same ChatGPT error delivery mechanism;
- existing claim → commit → confirmation → recovery semantics remain the transport authority.

`shared/ozon_contract.js`:

- added deterministic `textFingerprint()` for unparseable command text;
- added `formatPreExecutionErrorReport()`;
- canonical error result has `operation:null`, `command.accepted:false`, `http_status:0`, `request_meta.external_request_executed:false`, `result.error.automatic_retry:false`, and `result.error.external_request_executed:false`;
- existing redaction remains in force for URLs, credential labels, e-mail, phone, and secret-like strings.

Version surfaces:

- manifest, worker, content script, popup, contract/runtime version markers updated from `0.1.3` to `0.1.4`;
- default autorun instructions document that pre-execution failures are returned as `OZON_RESULT_V1` and that `external_request_executed=false` means no provider request occurred.

### Test evidence

Final automated suite: **32/32 PASS**, 0 fail, 0 skipped, 0 cancelled.

The changed path was tested with actual production contract/worker code and VM execution of the actual `reportAutoPreExecutionError()` function extracted from the production content script.

Covered behavior includes:

- malformed JSON/control-character failure class that triggered the original defect;
- content-script pre-execution helper branches: accepted, ignored/already-owned, paused, rejected, inactive watch, watcher-runtime error;
- safe payload assertions: malformed command text not echoed to worker error payload;
- malformed command → ChatGPT error delivery claim with provider `fetch` count = 0;
- worker parser fallback → ChatGPT error delivery with provider `fetch` count = 0;
- duplicate pre-execution error → no duplicate delivery and provider `fetch` count = 0;
- wrong owner tab → fail closed, no provider request;
- conversation mismatch → fail closed, no provider request;
- manual mode blocks autorun path safely;
- invalid supplied fingerprint is replaced safely/deterministically;
- result-prefix integration;
- delivery claim → commit → confirmation → return to `WAITING_COMMAND`;
- persisted claimed error delivery recovery resumes delivery without replaying the provider request;
- finish-request while delivering completes only after confirmed chat delivery;
- valid command regression executes exactly one provider `fetch`;
- all production JavaScript passes `node --check`;
- manifest host permissions remain restricted to ChatGPT + fixed `api-seller.ozon.ru`;
- runtime version surfaces resolve to `0.1.4`.

Coverage evidence for the final run:

- whole reconstructed suite lines: 42.87%;
- branches: 48.19%;
- functions: 64.73%;
- `shared/ozon_contract.js` lines: 92.71%;
- `shared/runtime_names.js` lines: 100%;
- actual changed content-script pre-execution helper is VM-executed by the test harness.

These percentages are not presented as full legacy-extension coverage. Acceptance is based on targeted execution of every behavior-changing path and the dependencies traversed by this fix.

### Packaging/build evidence

- v0.1.4 is deterministically reconstructed from the canonical v0.1.3 exact archive plus the reviewed patch;
- 16/16 production-file hashes verified after reconstruction;
- production ZIP contains production extension files only, not tests/evidence;
- ZIP extracted into a fresh directory and 16/16 production files compared byte-exact with build source;
- fresh extracted extension passed Chromium packaging with exit code 0;
- deterministic rebuild is byte-identical to the release ZIP;
- release SHA-256 is `df344f34f3ed5d0a16648d5ba7aa274f16512efc87223c5e81fac5ffb23da98a`.

Detailed v0.1.4 evidence remains in:

- `reference-0.1.4/OZON_BRIDGE_V0.1.4_CHANGELOG_AND_TEST_EVIDENCE.md`;
- `reference-0.1.4/evidence/OZON_BRIDGE_V0.1.4_PATCH.diff`;
- `reference-0.1.4/evidence/node-tests-and-coverage-summary.txt`;
- `reference-0.1.4/evidence/zip-byte-compare.txt`;
- `reference-0.1.4/evidence/chromium-pack-status.txt`;
- `reference-0.1.4/evidence/SHA256SUMS.txt`;
- executable regression tests under `reference-0.1.4/tests/`.

### Acceptance state

v0.1.4 is the first release in this lineage that explicitly transports autorun pre-execution failures back into ChatGPT using the same worker-owned observable delivery lifecycle while proving `external_request_executed:false` and provider fetch count = 0 for malformed-command failures.

No existing v0.1.3 reference evidence was rewritten to create v0.1.4.

---

## 2026-08-12 — append-only authority activated in directory README

Governance/documentation commit:

`6ad600a21c062024f3d7537891a5e173205c90d4`

The directory-level `README.md` now names this file as the mandatory canonical operational history for the implemented bridge lineage and explicitly supersedes stale research-era wording that claimed the extension did not exist.

From this point forward:

- every production bridge change, defect fix, security change, test-hardening pass, package/build evidence change, release, operational incident, acceptance/rejection decision, or correction MUST append a new dated section to this file before the work is considered fully documented;
- existing entries in this file are historical records and MUST NOT be rewritten, reordered, deleted, compacted, or silently corrected;
- corrections are append-only and must explicitly identify the older entry being corrected;
- `reference-*` directories remain immutable version-specific evidence snapshots;
- research-era lifecycle/status files remain provenance artifacts but do not override the implemented bridge/version authority recorded here and in the immutable reference snapshots.

---

## 2026-08-12 — Ozon Bridge v0.1.5: Manual error-to-chat lifecycle completed

Primary implementation/evidence commit:

`6eafe32df1111fd6133a9546c30e2260e1941139`

README authority update commit:

`4643a95ab282213d47577ac455fc7a1fe8dc3570`

Reference snapshot:

`tooling/llm-api-bridges/ozon-seller/reference-0.1.5/`

Release ZIP SHA-256:

`130d88f3225087aaecbf12819d39949ff68b9ab6d422ff8d3cd7b55953cd4651`

### Live failure that forced the correction

After v0.1.4 was installed, a deliberately malformed Manual `OZON_API_V1` writing block containing a raw newline/control character inside a JSON string produced only the local message `Ozon: команда не выполнена — Некорректный JSON: Bad control character...`. No `OZON_RESULT_V1` appeared in ChatGPT. Diagnostics showed no Manual operation/request/delivery ownership because execution stopped in the content script before the worker was called. No provider request occurred.

The root cause was a scope error in v0.1.4: the observed Autorun parser failure was fixed as an Autorun-specific path, while the project invariant was broader — controlled errors for both Manual and Autorun must become observable bridge results once the trusted target conversation/binding is established.

### Architecture correction

v0.1.5 removes the Manual content-script parser gate instead of adding another mode-specific side channel.

`content_script.js`:

- `handleCopy()` no longer calls `OzonContract.parseCommand()` before the worker;
- after the existing `OZON_API_V1` prefix recognition, Manual Copy sends the command through the existing `OZ_EXECUTE_COMMAND` message path;
- `commandKey()` fingerprints raw command text using `textFingerprint()`, so malformed commands still receive deterministic busy/dedup identity without requiring a successful parse;
- the existing Manual delivery path remains authoritative: `deliverReport()` → `OZ_MANUAL_DELIVERY_COMPLETE` / `OZ_REPORT_DELIVERY_CONFIRMED`, with `OZ_MANUAL_DELIVERY_FAILED` on delivery failure.

`service_worker.js`:

- Manual parsing/validation is worker-owned;
- controlled parser/contract errors become canonical `OZON_RESULT_V1` pre-execution reports and durable Manual delivery operations with `operation:null`, `http_status:0`, `automatic_retry:false`, and `external_request_executed:false`;
- Manual-mode race-off and active-Autorun gate failures, after trusted tab/conversation/binding verification, also become chat-visible pre-execution results with zero provider requests;
- a single generic `buildPreExecutionErrorResult()` is shared by Manual and Autorun;
- a single generic `buildExecutionErrorResult()` is shared by Manual and Autorun;
- Manual provider transport exceptions after exactly one attempted provider request become `OZON_RESULT_V1 result.error` and enter the normal Manual delivery lifecycle instead of becoming worker-only terminal failures;
- no `OZ_MANUAL_PREEXEC_ERROR` runtime message/parallel protocol was introduced.

Security boundaries remain fail-closed: missing sender tab, missing/invalid trusted conversation identity, conversation mismatch and unbound/wrong conversation conditions are not injected into an untrusted chat and perform zero provider requests.

### Test and dependency evidence

Final source-tree suite: **67/67 PASS**, 0 fail, 0 skipped, 0 cancelled.

The same **67/67 PASS** suite was run again against a fresh extraction of the final deterministic production ZIP.

The test matrix exercises the behavior-changing code and its dependent lifecycle rather than only scanning patched text:

- actual production `handleCopy()` is VM-executed for malformed, valid, non-command, Manual-disabled, conversation-resync, BUSY duplicate, missing-report, delivery-failure and `auto_send=false` branches;
- actual production `commandKey()` is VM-executed for valid and malformed command text;
- exact raw-newline/control-character malformed JSON incident class → Manual chat result, provider fetch count = 0;
- unsupported operation → chat result, fetch count = 0;
- unknown top-level field → chat result, fetch count = 0 and unsafe URL text not echoed;
- Manual mode race-off and active-Autorun gate failures → chat results, fetch count = 0;
- valid Manual request → exactly one provider fetch;
- provider HTTP 400 → exactly one provider fetch and provider error result;
- provider transport exception → exactly one provider fetch, bridge error result, `automatic_retry:false`;
- Manual pre-execution delivery completion/failure transitions;
- duplicate Manual request-id fence and active-operation fence;
- report-prefix and `auto_send=false` behavior;
- conversation mismatch, wrong tab, missing tab/request-id security failure paths → fail closed with fetch count = 0;
- retained v0.1.4 Autorun pre-execution, duplicate, delivery, recovery, finish and valid-one-fetch regression suite;
- static architecture invariants prove the Manual content path has no local `parseCommand()` gate, Manual and Autorun share generic pre-execution/execution error builders, and no Manual-specific pre-execution side-channel message exists;
- every production JavaScript file passes `node --check`;
- manifest host permissions remain ChatGPT plus the fixed `api-seller.ozon.ru` host only.

Coverage evidence is intentionally not misrepresented as 100% of unrelated legacy code. Whole reconstructed production/test execution: 51.29% lines, 58.77% branches, 73.98% functions. `shared/ozon_contract.js`: 95.63% lines. `shared/runtime_names.js`: 100% lines. The changed Manual runtime harness and command-key harness execute 100% of their extracted behavior-changing functions, while the worker Manual pipeline test reaches 98.81% lines, 91.23% branches and 91.49% functions in that test surface.

### Packaging/build evidence

- v0.1.5 reconstructs deterministically from the immutable v0.1.4 reference plus the reviewed v0.1.4→v0.1.5 patch;
- 16/16 production file SHA-256 hashes are verified by the reconstruction harness;
- clean production ZIP contains no tests/evidence;
- fresh ZIP extraction matches 16/16 production files byte-for-byte;
- the complete 67-test suite passes against the fresh extracted production package;
- fresh extracted extension passes Chromium `--pack-extension` with exit code 0;
- deterministic release SHA-256 is `130d88f3225087aaecbf12819d39949ff68b9ab6d422ff8d3cd7b55953cd4651`.

Detailed evidence:

- `reference-0.1.5/OZON_BRIDGE_V0.1.5_CHANGELOG_AND_TEST_EVIDENCE.md`;
- `reference-0.1.5/evidence/OZON_BRIDGE_V0.1.5_PATCH.diff`;
- `reference-0.1.5/evidence/node-tests-and-coverage-summary.txt`;
- `reference-0.1.5/evidence/node-tests-and-coverage.txt`;
- `reference-0.1.5/evidence/release-extracted-tests.txt`;
- `reference-0.1.5/evidence/production-file-SHA256SUMS.txt`;
- `reference-0.1.5/evidence/zip-byte-compare.txt`;
- `reference-0.1.5/evidence/chromium-pack-status.txt`;
- `reference-0.1.5/evidence/release-SHA256.txt`;
- executable regression tests under `reference-0.1.5/tests/`.

### Acceptance state

v0.1.5 is accepted as the current Seller bridge reference for the controlled-error invariant: once trusted conversation/binding ownership is established, Manual and Autorun controlled pre-execution errors are observable as `OZON_RESULT_V1`; malformed/validation failures prove zero provider requests, while provider transport failures prove one attempted request and no automatic retry. Identity/binding failures that cannot safely establish the target chat remain fail-closed.


---

## 2026-08-12 — post-release changed-line verification for Ozon Bridge v0.1.5

Verification commit:

`391d78e024df5072eb65b92b58ced88de7848ba3`

Verification directory:

`tooling/llm-api-bridges/ozon-seller/verification-0.1.5-line-coverage-2026-08-12/`

This verification was added after the initial v0.1.5 acceptance because the required test standard is stricter than a passing scenario suite: every behavior-changing production line must be exercised or explicitly source-asserted.

The initial 67/67 suite was re-examined with V8 line coverage against the actual v0.1.4→v0.1.5 production diff. Eight newly-added `service_worker.js` lines were not executed by that first suite: the Manual error-report-construction failure cleanup branch and the Autorun call into the new shared execution-error builder.

Two targeted tests were added in a separate verification overlay without changing the immutable `reference-0.1.5/` snapshot or the production ZIP:

- Manual execution error + forced error-report-builder failure now proves the claimed Manual operation transitions to `FAILED` rather than remaining active;
- Autorun provider transport exception now proves the shared `buildExecutionErrorResult()` path executes with exactly one provider attempt and `automatic_retry:false`.

Final verification result: **69/69 PASS**, 0 fail, 0 skipped, 0 cancelled.

Changed-line audit result:

- `service_worker.js`: **186/186** newly-added/replaced v0.1.5 lines V8-executed;
- `shared/ozon_contract.js`: **1/1** changed line V8-executed;
- `shared/runtime_names.js`: **3/3** changed lines V8-executed;
- `content_script.js`: **6/6** changed lines runtime/source asserted through the actual-source `commandKey()` / `handleCopy()` VM harnesses plus exact version assertion;
- deleted Manual local `parseCommand()` gate: explicit architecture-absence assertion remains active;
- `manifest.json`: **1/1** changed metadata line exact-source asserted;
- `popup.html`: **1/1** changed metadata line exact-source asserted;
- `popup.js`: **2/2** changed metadata lines exact-source asserted.

The audit is intentionally scoped to the v0.1.4→v0.1.5 changed production lines. It does not claim 100% runtime coverage of unrelated legacy extension code.

Production artifact was not changed by this verification. Release SHA-256 remains:

`130d88f3225087aaecbf12819d39949ff68b9ab6d422ff8d3cd7b55953cd4651`

Reproducible verification artifacts:

- `verification-0.1.5-line-coverage-2026-08-12/run_verification.sh`;
- `verification-0.1.5-line-coverage-2026-08-12/changed_line_execution_audit.py`;
- `verification-0.1.5-line-coverage-2026-08-12/extra-line-coverage-tests.diff`;
- `verification-0.1.5-line-coverage-2026-08-12/evidence/changed-line-execution-audit.txt`;
- `verification-0.1.5-line-coverage-2026-08-12/evidence/lineverify-summary.txt`.

---

## 2026-08-12 — documentation integrity correction

Commit `921e7f3518265f4475dc4b68214122b3b376b013` unintentionally replaced the preceding v0.1.5 entry while attempting to append the changed-line verification. Commit `b6117f56b097a7403eb6425b45f2659818281df6` restored the prior append-only content byte-for-byte from Git blob `5a13a1b48483b8c882890b8255fbe7ed7f29310f`.

This correction records the incident transparently and appends the verification section after the restored v0.1.5 entry. No production bridge code, immutable `reference-0.1.5/` snapshot, or release ZIP changed as part of the documentation repair.

---

## 2026-08-12 — Seller/Performance boundary audit checkpoint

Research artifact:

`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_BOUNDARY_AUDIT_2026-08-12.md`

This checkpoint records the provider-boundary audit that was in progress before the v0.1.4/v0.1.5 malformed-command defect work interrupted the main Ozon data-collection track.

The audit compares the exact Ozon Bridge v0.1.5 production data path against the two official Ozon OpenAPI contracts supplied for this work:

- Ozon Seller API OpenAPI 3.0.0, version 2.1, 458 paths;
- Ozon Performance API OpenAPI 3.0.0, version 2.0, 47 paths.

### Provider-owned limits established for currently enabled Seller aliases

The audit records the following provider constraints as authoritative:

- Seller API global limit: 50 requests/second per Client ID, with additional method-specific limits;
- `/v4/product/info/stocks`: page `limit` 1..1000; FBO stock belongs to `/v1/analytics/stocks`, not this endpoint;
- `/v1/analytics/data`: without Premium Plus, last 3 months; at most one request/minute; page `limit` 1..1000; up to 14 metrics;
- `/v1/analytics/product-queries`: page >= 0, `page_size <= 1000`, up to 1000 SKUs, with subscription/history rules documented by Ozon;
- `/v1/analytics/product-queries/details`: page >= 0, `page_size <= 100`, up to 1000 SKUs, `limit_by_sku <= 15`;
- `/v3/posting/fbo/list`: period <= 1 year, `limit` 1..100, up to 1000 order numbers and 1000 posting numbers in the relevant filters;
- `/v3/supply-order/get`: up to 50 `order_ids`;
- `/v1/supply-order/details`: one required `order_id`.

Performance API global/statistics limits recorded from the supplied official contract:

- 100,000 requests/day;
- statistics report period <= 62 days;
- <= 10 campaigns/report;
- 1 concurrent export/account and 5 concurrent exports/organization;
- <= 2000 exports/24h per account and per organization.

### Bridge-owned limits identified

The following v0.1.5 values are bridge-owned and are not documented as global Ozon limits in the supplied contracts:

- request JSON `maxDepth=10`;
- request array `maxItems=5000`;
- request aggregate `maxKeys=2000`;
- serialized `params <= 200000` UTF-8 bytes;
- result-redaction depth 14;
- silent result array truncation at 10000 elements;
- silent result key truncation at 20000 aggregate keys;
- post-redaction result validation `maxDepth=16`, `maxItems=10000`, `maxKeys=25000`;
- provider response limit 1.5 MB;
- client timeout 30 seconds;
- Seller credential local lengths 256/2048 and visible-ASCII-only validation.

The audit does not interpret the absence of a global body-size/timeout rule in the supplied OpenAPI as proof that Ozon accepts infinite payloads. It establishes only that these specific bridge numbers are not provider-authoritative documented limits.

### Data-integrity defect established

`redactSensitiveResult()` is currently not only a privacy filter. It can silently discard non-sensitive Ozon data through array slicing and aggregate-key truncation, or replace a deep subtree with `[REDACTED_DEPTH]`.

That behavior is incompatible with the full factual seller-dataset goal. Silent truncation is therefore rejected as an acceptable result policy for the next revision.

### Next implementation gate

Production v0.1.5 is unchanged by this research checkpoint.

The next bridge revision must:

- separate Ozon semantic limits from bridge security/privacy and runtime-resource safety;
- encode provider limits per supported operation;
- preserve fixed host, credential isolation, READ-only allowlist, no transport/auth injection, PII safeguards, one-command/one-request, no hidden retry, no hidden pagination/fan-out/polling, and durable exactly-once delivery;
- make PII redaction non-lossy for non-sensitive data;
- never present a silently truncated provider result as complete;
- make any runtime resource-safety failure explicit in `OZON_RESULT_V1`;
- test every behavior-changing line and dependent path under the v0.1.5 changed-line standard before release acceptance.

No production bridge code, immutable `reference-0.1.5/` snapshot, or v0.1.5 release ZIP is changed by this documentation commit.

---

## 2026-08-12 — Ozon Bridge v0.1.6: provider-boundary correction

Release reference:

`tooling/llm-api-bridges/ozon-seller/reference-0.1.6/`

Release ZIP SHA-256:

`6ff4a7daab51f05b0beb5942e5f7f6ef155b3ffa29a3a78e69eca9b7b8229242`

### Mandate implemented

v0.1.6 applies the provider-boundary rule established by the preceding Seller/Performance audit: when the supplied official Ozon OpenAPI contracts establish an operation-specific limit, that Ozon limit remains authoritative; when no Ozon-side limit was established, the extension no longer imposes an arbitrary smaller generic data/request/response limit.

This does not assert that Ozon has infinite capacity. It prevents the bridge from inventing undocumented provider semantics or silently losing otherwise valid Ozon data.

### Bridge-owned limits removed

The v0.1.5 generic request caps `maxDepth=10`, `maxItems=5000`, `maxKeys=2000` and serialized `params <= 200000` UTF-8 bytes were removed from the accepted data path.

The v0.1.5 result limits and silent truncation behavior were removed: no `[REDACTED_DEPTH]` substitution based on the former depth threshold, no `slice(0, 10000)`, no 20000-key `__truncated__` cutoff, and no second generic result `maxDepth=16` / `maxItems=10000` / `maxKeys=25000` budget.

The bridge-owned provider response ceiling of 1.5 MB and synchronous provider timeout of 30 seconds were removed because those values were not established as global Ozon limits in the supplied Seller/Performance contracts.

The former Seller credential length ceilings 256/2048 and visible-ASCII-only restriction were removed because they were not established as Ozon provider limits. Header-safety validation remains: CR/LF/control-character injection is rejected and credentials remain isolated.

### Provider-owned limits retained

Operation-specific Ozon constraints remain enforced for the currently enabled aliases, including Seller analytics pagination/metrics/rate/history rules, FBO period/page/filter limits, supply-order batch size, query page/SKU/detail limits and stock page limits as documented in the boundary audit.

### Privacy/security/lifecycle retained

The release keeps the fixed trusted Seller host, read-only operation registry, no arbitrary transport/auth injection, credential isolation, PII safeguards, one command <= one provider request, no hidden retry/pagination/fan-out/polling, durable delivery/recovery and v0.1.5 Manual/Autorun controlled-error observability.

Privacy redaction is separated from generic data-size truncation. Current allowed Seller paths explicitly redact FBO legal/digital-code data and supply driver/phone/vehicle-number fields while preserving documented seller operational warehouse-address fields required for factual logistics analysis.

### Verification

Final source-tree suite: **89/89 PASS**, 0 fail, 0 skipped, 0 cancelled.

A second full suite was run against a fresh extraction of the final ZIP: **89/89 PASS**.

Changed-line audit: every v0.1.5 -> v0.1.6 changed production line is V8-covered or exact-source asserted; removed-cap behavior has explicit regressions.

Fresh release package checks:

- 16/16 production files byte-identical to source;
- all production JavaScript parses with `node --check`;
- Chromium extension pack check exit 0;
- no tests/evidence inside production ZIP;
- release SHA-256 `6ff4a7daab51f05b0beb5942e5f7f6ef155b3ffa29a3a78e69eca9b7b8229242`.

Boundary regressions include deep JSON, >2500 keys, >6000 generic array items, >220000-byte request data, `stocks_current` filter >6000 IDs where the supplied Ozon schema defines no maxItems, >10000 provider-result array elements, >20000 result keys/items, deep provider results, >1.5 MB provider responses, long credentials with CR/LF rejection, all documented operation-specific Ozon limits, transport/auth injection rejection, exactly-one-fetch and retained Manual/Autorun error/delivery behavior.

No live Ozon brute-force probing of undocumented limits was performed.

### Acceptance state

v0.1.6 supersedes v0.1.5 as the current Seller bridge implementation authority for provider-boundary handling. The immutable v0.1.5 snapshot remains historical evidence. The Performance API is still a separate, not-yet-implemented bridge/auth surface.

---

## 2026-08-12 — Ozon Bridge v0.1.7: bounded exactly-once-safe Send retry

Release reference:

`tooling/llm-api-bridges/ozon-seller/reference-0.1.7/`

Release ZIP SHA-256:

`9b4ee937d186f3a39d318c0e3d43f02d5a405799259225e00192aff0db68ea1c`

### Incident and rejected workaround

During live FBO pagination, Ozon returned HTTP 200 and the bridge had already prepared/staged the result, but ChatGPT delivery stopped before commit because the Send target did not become ready under the single-wait policy (`DELIVERY_SEND_TARGET_NOT_READY_BEFORE_COMMIT`).

JSON compaction/truncation/reformatting is explicitly rejected as a fix for this incident: the observed failure was in browser composer/send readiness, not provider-result serialization. v0.1.7 preserves the v0.1.6 provider-boundary/result policy.

### Delivery correction

`content_script.js` now uses bounded validated Send-target reacquisition before commit instead of one fixed target wait. Each retry re-resolves and validates the current composer/form/button against the exact staged text. Text mutation and runtime supersession fail closed. Exhaustion is explicit rather than silently looping.

The post-commit send path is now exactly-once-safe. Retry of `button.click()` is permitted only while the bridge has evidence that no click event was observed. Once a click event is observed, no second Send click is allowed; the bridge waits for composer settlement and continues through confirmation/reconciliation/recovery instead.

`shared/composer_send.js` now guarantees click-trace cleanup even if `button.click()` throws and reports whether a click event had already been observed. This lets the caller distinguish a safe pre-event retry from an unsafe post-event retry.

Worker commit remains the irreversible boundary and still precedes the browser click. A rejected or already-used commit permission produces zero new clicks. Browser delivery retry never replays the Ozon provider request.

### Verification

Final source-tree suite: **119/119 PASS**, 0 fail, 0 skipped, 0 cancelled.

Fresh final ZIP extraction: **119/119 PASS**, 0 fail, 0 skipped, 0 cancelled.

Changed-line audit:

- `content_script.js`: 104/104 changed lines mapped to exact-source runtime/integration/version tests;
- `shared/composer_send.js`: 15/15 changed lines mapped to full-module production-source tests;
- all other changed production lines are version-only and exact-equivalence tested;
- every other production file remains byte-identical to v0.1.6.

Package/build checks:

- exactly 16 production files in the ZIP;
- 16/16 fresh-extracted files byte-identical to tested source;
- all production JavaScript passes `node --check`;
- Chromium headless extension pack exits 0;
- no tests/evidence inside the production ZIP;
- deterministic rebuild is byte-identical;
- ZIP SHA-256 `9b4ee937d186f3a39d318c0e3d43f02d5a405799259225e00192aff0db68ea1c`.

### Acceptance state

v0.1.7 supersedes v0.1.6 for ChatGPT browser Send-delivery behavior. v0.1.6 provider-boundary semantics, read-only operation constraints, privacy/security controls, credential isolation, one-command/one-provider-request rule and no hidden provider retry/pagination/fan-out remain unchanged.

Automated/package acceptance is complete. Logged-in live ChatGPT field acceptance of the original Send-readiness incident remains pending installation and a live continuation run with v0.1.7.

---

## 2026-08-13 — Ozon Bridge v0.1.8: multi-command sequential collection + single final delivery

Release reference:

`tooling/llm-api-bridges/ozon-seller/reference-0.1.8/`

Release ZIP SHA-256:

`79b750b2d16b0f765af674181ea41894681aa778db27e11fb87760960912a5fa`

Base accepted release: v0.1.7 (`9b4ee937d186f3a39d318c0e3d43f02d5a405799259225e00192aff0db68ea1c`).

### Architecture decision

Three materially different queue/recovery architectures were emulated before production implementation. The selected design keeps the ordered command queue, per-entry durable result state, current position and final pending delivery inside the existing worker-owned `auto_run` record. A content-script-owned queue was rejected because restart/acknowledgement loss can replay an already executed provider request. A separate batch store/ID hierarchy was rejected as unnecessary persistence and complexity.

### Behavior implemented

One completed assistant message may now contain multiple literal `OZON_API_V1` markers anywhere in ordinary text/Markdown. Discovery uses balanced-brace structural JSON extraction with string/escape awareness, passes valid objects through the existing strict contract, records malformed/validation entries locally, and continues safely to later markers.

Valid provider requests execute strictly serially with observed maximum concurrency = 1. Each valid command still causes at most one external Ozon request; there is no hidden retry, pagination loop or fan-out. No intermediate result is delivered to ChatGPT. Results are persisted only as transient recovery state while the current batch is active.

Recovery skips already stored completed entries. A provider request left in `requesting` by an older worker session fails closed as `REQUEST_OUTCOME_UNKNOWN_NO_RETRY` and is not blindly replayed.

After all entries are complete, one ordered `OZON_BATCH_RESULT_V1` report is constructed and inserted into the ChatGPT composer once. From insertion onward, the batch path does not read, compare, hash, sample, length-check or otherwise verify composer/report contents and does not inspect ChatGPT attachments.

Final delivery uses the governed size-independent UI FSM: blind initial 2-second wait, then event-scoped 2-second checks that reacquire current controls. Only a fresh active recognized Send may be clicked; disabled Send, Stop, Unknown and Microphone are never clicked. A later active Send may be clicked again after fresh classification. Microphone after the initial wait is the sole success marker and is never clicked. Confirmed success destroys the watcher and clears transient batch/results/delivery state.

Built-in Microphone recognition is present, with independent manual bind/rebind/clear fallback. Manual/legacy and Start contours remain separate.

### Security/provider invariants retained

The Ozon operation registry, HTTP methods, paths, effects and enabled READ-only operation set are unchanged from v0.1.7. Host permissions and extension permissions do not expand. No new Blob/File/ObjectURL/download mechanism is used by batch delivery, no historical batch store is introduced, credentials remain isolated, and delivery recovery cannot cause provider replay.

### Verification and packaging

Source acceptance: **174/174 PASS**, 0 fail, 0 skipped, 0 cancelled.

Fresh extraction of the final deterministic ZIP: **174/174 PASS**, 0 fail, 0 skipped, 0 cancelled.

The acceptance includes retained regression, exhaustive production content-runtime tests, full-message parser/model tests, worker batch integration/recovery tests, DOM delivery/Microphone FSM tests, and static/package/security invariants. Specific evidence includes 1200-command discovery, valid/malformed/valid recovery, 25-request batch with max provider concurrency = 1, zero replay for old-worker in-flight state, no intermediate delivery, watcher dedupe, repeated freshly classified Send attempts, Microphone-only completion, and one-time 2 MB report insertion with no post-insertion composer-content verification.

The production package contains exactly 16 files; every production JavaScript file passes `node --check`; `manifest.json` parses; Chromium 144 `--pack-extension` exits 0; a deterministic second ZIP build is byte-identical.

The v0.1.7→v0.1.8 patch reconstructs the accepted 16-file production tree byte-for-byte. Patch evidence is stored in four ordered base64 parts under `reference-0.1.8/`; concatenated base64 SHA-256 is `628d49bceabdb658f607f3cef1243a5044205e8d42d29643146bf551c1de250c`, decoded patch SHA-256 is `5bfce3cd0d6ecf440f218ce5b90b23b610a7d5541260bb33f321e4003983d3b2`.

### Acceptance state and limitation

v0.1.8 is accepted as the current automated/source/package implementation authority for multi-command sequential collection and single final batch delivery. It supersedes v0.1.7 for Autorun batch/final-delivery behavior while retaining the v0.1.7/v0.1.6 provider, privacy, credential and READ-only safety boundaries.

The Chrome Extension Lab connector was unavailable in this session and local headless Chromium did not expose an MV3 service-worker target. Therefore no logged-in live ChatGPT continuation run with v0.1.8 is claimed. Installation/live field acceptance remains pending.

---

## 2026-08-13 — Ozon Bridge v0.1.9: Manual/Copy unified into common batch engine

Release reference:

`tooling/llm-api-bridges/ozon-seller/reference-0.1.9/`

Release ZIP SHA-256:

`22665f5e9bb6250eed88fa53a1c4372c9653877d553a23ab36429490e19a9f70`

### Live defect fixed

The first logged-in v0.1.8 Manual/Copy field probe accepted one command, but a two-command message failed before any Ozon request with `request_id=manual-preexec-*`, `INVALID_JSON`, and `external_request_executed:false`. Root cause: v0.1.8 retained the legacy Manual/Copy single-command `parseCommand()` execution/delivery contour while Autorun alone used the new multi-command batch engine.

### Architecture correction

v0.1.9 removes that execution split. Manual/Copy and Autorun both use command discovery → the common `processBatchQueue()` → strict serial provider execution → one combined batch delivery FSM. One command is simply a batch of size 1; no separate single-command provider execution engine remains.

Completed provider work is not replayed during recovery. Old-worker in-flight ambiguity fails closed without blind retry. A common pre-insert composer occupancy check preserves an existing user draft; if the composer is occupied, insertion does not begin and delivery remains recoverable. After programmatic insertion, the batch path still does not read, compare, hash, length-check, or otherwise verify composer contents.

### Verification

Final v0.1.9 acceptance: **201/201 PASS**, 0 fail, 0 skipped, 0 cancelled, on all three tested surfaces:

- development working tree;
- clean 16-file production tree;
- fresh extraction directly from the final ZIP.

The explicit Manual/Copy scale matrix **1 / 2 / 5 / 15 / 30 / 60 PASS** proves exact provider request count, strict maximum provider concurrency = 1, ordered results, and one final batch delivery.

Raw V8 production execution inventory: **379/379 named production functions executed, 0 missing**, excluding only test-harness functions injected beyond the original production-source length. The suite also covers every enabled Ozon operation contract, malformed/validation/gate failures with zero provider requests, provider/credential failures, PII redaction and blocked PII operation, recovery/no-replay paths, delivery FSM, user-draft safety, static security/package invariants, and deterministic packaging.

Every production JavaScript file passes `node --check`; Chromium 144 extension pack exits 0; the production ZIP contains exactly 16 files; deterministic rebuild is byte-identical.

No claim of 100% source-line runtime coverage is made: Node's experimental coverage does not correctly attribute the VM-loaded production scripts. Acceptance instead records the full named-production-function execution inventory plus explicit input/output/branch, static-source and fresh-package tests.

### Artifact/evidence

Immutable v0.1.9 evidence and ordered reproducible patch parts are stored under `reference-0.1.9/`.

Reproducible patch checksums:

- raw v0.1.8→v0.1.9 patch SHA-256: `a6450e32a3f9ce2df184e9799c65c6b70bfff8209bb4f23e8d95bc641c4888be`;
- gzip patch SHA-256: `d238777a2c7f8c21c6ebf16726019bae25a759483c5fad616ad549d83696c893`.

### Acceptance boundary

Automated/source/package/emulator acceptance is complete. Logged-in live v0.1.9 field acceptance is still pending. The intended live scale sequence remains **1 → 2 → 5 → 15 → 30 → 60**. No live PASS is claimed before actual extension results.
