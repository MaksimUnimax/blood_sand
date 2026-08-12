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
