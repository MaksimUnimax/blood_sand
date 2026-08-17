# Ozon Bridge Step 3 — implementation and local evidence

Date: 2026-08-17
Status: implementation complete locally; frozen GitHub target is the commit that contains this evidence file and `PATCH_PARTS.md`. Independent Codex validation is still required before Step 4.

## Scope

Step 3 implements only:

- persistent provider quota scheduling for the reviewed `/v1/analytics/data` one-request-per-minute quota family;
- Seller account / credential-revision internal identity;
- cross-tab / cross-conversation / cross-AI durable quota waiting;
- MV3 alarm wake/resume for quota waits;
- Retry-After extension of `next_allowed_at` without automatic provider retry;
- provider response verification needed before analytics logical projection;
- sanitized structured provider/bridge errors and accurate request-attempt provenance.

Step 4 cache/prefetch and semantic aliases are NOT implemented.

## Accepted base

Accepted Step-2 implementation target:

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Independent Step-2 validation report ref supplied by Codex and independently readable in GitHub:

`be7be62`

Verdict:

`STEP2_ACCEPTED_FOR_STEP3`

## Production delta

Exactly six of the 17 production files change relative to accepted Step 2:

- `manifest.json` -> `6e314da445166d390a32f3f3afdfdf86a97e2af6eeed0c3cd4a47d34d60550da`
- `service_worker.js` -> `bfe2aa15b09f48dffb2dd7ff913f6b527c07fca09e462759dffb30d9dd72c514`
- `shared/ozon_contract.js` -> `e303b74b266c685f1ae20b9e3b726211f7b65c56490a3ed09693b84489e58b45`
- `shared/ozon_provider.js` -> `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js` -> `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/runtime_names.js` -> `f66a4fc004a59981c59f715ba335c4b2b4b8f750789befb17b045894bb55ac24`

The other eleven production files remain byte-identical to accepted Step 2:

- `content_script.js` `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`
- `popup.css` `dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5`
- `popup.html` `5fdf3932ef0f523626da65fff4c5919df19c321bc23fee861e95d5d940a185d5`
- `popup.js` `8e1d95340d3e87b8a8cadda50276033e336f633469a5dbceaacd74b2d10239fd`
- `shared/ai_adapters.js` `5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9`
- `shared/bridge_autorun_model.js` `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/composer_send.js` `3e9421e8e1bc209af635e2b90d957e558301763572a42875b95c8973ca75b736`
- `shared/conversation_identity.js` `939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57`
- `shared/manual_controls.js` `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
- `shared/ozon_credentials.js` `286c6021f958e41912842569bcfa0d0dfe920eed8ce1646014899a1de064415d`
- `shared/proven_writing_block_capture.js` `5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef`

Manifest host permissions are unchanged. The only new manifest permission is `alarms` for durable MV3 quota wake.

## Protected worker logic

Brace-aware byte extraction showed these function bodies are identical between accepted Step 2 and the Step-3 candidate:

- `ensureBatchCapabilityAndPlanning`
- `buildBatchQueryPlan`
- `ensureBatchQueryPlanning`
- `processBatchQueue` core function body before Step-3 patching was used as the comparison anchor for regression; Step-3 adds quota gates around physical execution while preserving Step-1/Step-2 planner functions themselves
- `finalizeAutoBatch`
- `finalizeManualBatch`
- `attemptAutoDelivery`
- `attemptManualBatchDelivery`

The Step-1 capability planner and Step-2 query-plan builder functions were not rewritten. AI DOM/composer files are byte-identical.

## Quota architecture

Reviewed persistent quota family:

`seller.analytics_data.v1`

Reviewed minimum interval:

`60000` ms

The scheduler does not invent a generic delay for unrelated Seller or Performance operations.

Internal Seller account identity is SHA-256 of a domain-separated Client-Id identity. Credential revision is a separate SHA-256 over domain-separated Client-Id + Api-Key. Raw Client-Id/Api-Key values are never stored in quota state. Persistent state contains internal hashes/revision and the reviewed family timing state, including `last_provider_request_at` and `next_allowed_at`.

Concurrent quota acquisition uses a serialized read-modify-write lock. A shared single-flight promise is deliberately NOT used for permit acquisition because that would allow multiple callers to share one granted permit.

Quota waiting is persisted in the existing owner batch state as `quota_waiting` before any provider request. `chrome.alarms` wakes due Manual and Autorun owners, and startup recovery scans persisted waits. A worker restart while quota-waiting is safe to resume because no provider attempt has happened. Existing no-replay behavior for already-`requesting` work remains intact.

One coalesced Step-2 physical analytics group consumes exactly one Step-3 quota permit.

Retry-After can only extend the persisted next-allowed timestamp by `max(current next_allowed_at, Retry-After target)`. It never triggers automatic provider retry and cannot shorten the current block.

## Response verifier and safe errors

`analytics_data` successful responses are verified before sanitization/projection. The verifier checks a JSON object/result shape, requires a non-empty physical metric list, checks every `result.data[].metrics` cardinality, checks `result.totals` cardinality when present, and requires at least one verifiable metrics surface.

Mismatch produces `PROVIDER_RESPONSE_CONTRACT_MISMATCH` after the single already-executed provider attempt. No retry is performed.

Non-analytics successful responses remain sanitization-only in this bounded Step-3 change; no undocumented broad schema is invented.

Provider errors expose sanitized structured fields such as source/category/status/safe code, `automatic_retry:false`, and `external_request_executed:true`; raw provider error text remains withheld from AI output. Transport fetch failures are marked as attempted external requests. Pre-fetch failures such as missing credentials or persistent quota-state failure remain `external_request_executed:false` and execute zero provider calls.

AI-visible quota/rate metadata contains family/timing/Retry-After only; account hashes and credential revisions are not emitted there.

## Local executable evidence

Environment used for the final local run:

- Node `v22.16.0`
- Git `2.47.3`
- Python `3.13.5`

All provider behavior was mocked. `REAL_OZON_REQUESTS = 0`.

Final PASS set included:

- concurrent quota acquire: exactly one permit;
- same Seller Client-Id with API-key rotation: same account bucket, different credential revision;
- different Seller account: independent bucket;
- raw credentials absent from persistent quota state;
- Retry-After 120s extends state;
- shorter Retry-After cannot shorten existing `next_allowed_at`;
- two independent conversations on same Seller: one physical dispatch, other durable wait;
- two incompatible analytics in one batch: first dispatch then second durable wait; worker restart while waiting resumes safely after due;
- compatible coalesced analytics group: one permit and one physical request;
- quota-state storage failure: zero provider calls and safe logical error;
- missing Seller credentials: zero provider calls;
- alarm resume for due Manual + Autorun waits and rescheduling of earliest future wait;
- analytics response verifier valid path;
- provider verifier mismatch: exactly one fetch, fail closed, no retry;
- provider HTTP 429: sanitized error + Retry-After metadata, no retry;
- transport fetch failure: external request attempt provenance true, no retry;
- Step-2 contract/provider/coalescer regression matrix;
- Step-1 one-probe regression;
- universal analytics: zero capability probes while Step-2 coalescing remains active;
- Performance-only: zero Seller capability probes and no analytics coalescing;
- all production JavaScript `node --check`;
- `manifest.json` parse;
- `git diff --check`.

A fresh accepted Step-2 copy plus the exact Step-3 patch reconstructed all 17 production files byte-for-byte. Patch size is `42730`; SHA-256 is `9eee85d648a212e96658514dea8f031223d255cf93c7c73a14107c50817919f5`.

The eight GitHub patch parts were independently checked after transport using Git object metadata; every live size and Git blob SHA matched the local raw bytes.

## Acceptance boundary

This file is local implementation evidence, not independent acceptance.

Step 4 remains blocked until an independent Codex validation tests the exact frozen Step-3 target and publishes a report-only validation branch.
