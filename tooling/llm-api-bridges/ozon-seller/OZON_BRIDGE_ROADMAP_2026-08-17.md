# Ozon Bridge — current engineering roadmap

Date: 2026-08-17
Status: active roadmap/specification; Step 3 frozen for independent validation.

## Target architecture

`marketplace adapters -> common bridge protocol -> AI adapters`

Current AI adapters are ChatGPT and Alice. Tabs/conversations/models are independent; there is no global “current conversation”.

Provider pipeline:

`clicked code-block batch -> parse whole batch -> strict operation validation -> resolve Seller capability once if needed -> entitlement-plan logical commands -> query planner/optimizer -> safe coalescer -> cache/prefetch -> provider quota scheduler -> Ozon -> response verifier -> safe error normalizer -> logical result projector -> existing batch/delivery engine`

Logical commands are data requirements. Physical provider requests are transport actions. Optimization/scheduling must preserve query semantics, logical identity, provenance and delivery ownership.

## Accepted Step 1 — Contract + Capability

Accepted production logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Accepted reconstruction-v2 validation target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Accepted report commit:

`249669986d61c5df708dd5b635fe30662120336f`

Verdict:

`STEP1_ACCEPTED_FOR_STEP2`

Retained invariants:

- strict contract validation before provider execution;
- at most one internal `POST /v1/seller/info` capability probe per relevant clicked batch;
- zero Seller capability probes for universal/performance-only work;
- seller-info is infrastructure, not AI-callable, and raw seller identity/company/rating fields never reach AI;
- `UNKNOWN` capability is never treated as no subscription;
- partial entitlement can remove unavailable analytics metrics only when query semantics remain valid;
- restricted dimension/sort/filter semantics are never silently removed;
- previous-worker unknown in-flight capability outcome is not blindly re-probed.

## Accepted Step 2 — Query planner + safe coalescing

Frozen implementation target:

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Step-2 patch SHA-256:

`93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`

Independent validation branch:

`validation/ozon-step2-query-planner-coalescing-2026-08-17`

Independent report ref supplied by Codex and independently readable in GitHub:

`be7be62`

Verdict:

`STEP2_ACCEPTED_FOR_STEP3`

Accepted Step-2 behavior:

- only contiguous compatible `analytics_data` commands coalesce;
- compatibility preserves all normalized executable physical parameters except metrics, including dates, ordered dimensions, filters, sort, offset and limit/window semantics;
- different limits are not coalesced;
- metric union is deterministic and maximum 14;
- no cross-dimension/filter/window/date derivation or unsafe local aggregation;
- one physical result is projected into separate logical results with original identities and shared physical provenance;
- ambiguous metric cardinality fails closed rather than guessing;
- all coalesced members are durably `requesting` before physical execution;
- a previous-worker `requesting` group is never replayed blindly.

## Step 3 — Global analytics quota scheduler + response verifier + safe errors

Development branch:

`dev/ozon-v0.1.19-step3-quota-verifier-errors-2026-08-17`

Branch base / Step-2 acceptance decision:

`51a0b16c51a60b2dc8e656b7fd41eb6d60c446ad`

**Frozen implementation target:**

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

Step-3 patch:

- size `42730` bytes
- SHA-256 `9eee85d648a212e96658514dea8f031223d255cf93c7c73a14107c50817919f5`

Exactly six production files differ from accepted Step 2:

- `manifest.json` `6e314da445166d390a32f3f3afdfdf86a97e2af6eeed0c3cd4a47d34d60550da`
- `service_worker.js` `bfe2aa15b09f48dffb2dd7ff913f6b527c07fca09e462759dffb30d9dd72c514`
- `shared/ozon_contract.js` `e303b74b266c685f1ae20b9e3b726211f7b65c56490a3ed09693b84489e58b45`
- `shared/ozon_provider.js` `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js` `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/runtime_names.js` `f66a4fc004a59981c59f715ba335c4b2b4b8f750789befb17b045894bb55ac24`

The other eleven production files are byte-identical to accepted Step 2. AI DOM/composer files remain protected. Manifest host permissions are unchanged; only the `alarms` permission is added for MV3 quota wake.

### Step-3 quota contract

The new explicit temporal quota family is deliberately narrow:

`seller.analytics_data.v1`

Reviewed interval:

`60000 ms`

Rules:

- the bucket is global inside the extension for the same Seller account across ChatGPT, Alice, tabs and conversations;
- Seller account identity and credential revision are internal SHA-256 values; raw Client-Id/Api-Key are not persisted in quota state or exposed to AI;
- same Seller Client-Id after API-key rotation keeps the same account bucket while credential revision changes;
- different Seller accounts have independent buckets;
- one Step-2 coalesced physical analytics request consumes one quota slot;
- unrelated Seller operations, Performance operations and internal `/v1/seller/info` capability probes do not receive an invented analytics 60-second delay;
- persistent state carries `last_provider_request_at` / `next_allowed_at` and credential revision;
- blocked work is durably `quota_waiting` before provider execution;
- `chrome.alarms` plus startup recovery resumes due Manual/Autorun waits after MV3 suspension/restart;
- concurrent acquisition uses serialized persistent read-modify-write so one quota window cannot grant multiple permits.

### Retry-After

A provider Retry-After may extend the effective next-allowed timestamp but cannot shorten it. Retry-After never triggers automatic provider retry.

### Response verification / safe errors

For successful `analytics_data`, Step 3 verifies physical metric cardinality before logical projection. Invalid body/result or incompatible `data[].metrics` / `totals` cardinality fails `PROVIDER_RESPONSE_CONTRACT_MISMATCH` after the one already-attempted provider request, with no retry.

Non-analytics successful operations remain sanitization-only in this bounded step; no undocumented broad schema is invented.

Provider/bridge errors expose sanitized source/category/status/safe code/message/provenance only. Raw provider bodies, credentials and secret-bearing headers are not AI output. Fetch/network failure is correctly marked as an attempted external request; missing credentials, pre-execution validation and quota-state failure remain external=false/zero-provider.

### Step-3 local evidence

All provider behavior was mocked. `REAL_OZON_REQUESTS = 0`.

Local PASS includes global concurrent quota acquisition, key rotation/account independence, durable wait/restart/alarm resume, one coalesced permit, Retry-After extension-only behavior, quota-state fail-closed, missing-credential zero-provider, response-verifier valid/fail-closed paths, sanitized 429, transport attempt provenance, Step-1 capability regression, Step-2 coalescing regression, Performance regression, JS syntax/manifest/diff checks, and fresh 17/17 patch reconstruction.

Local evidence is not independent acceptance.

Standalone validation plan:

`validation/plans/OZON_STEP3_QUOTA_VERIFIER_ERRORS_CODEX_VALIDATION_2026-08-17.md`

Plan commit:

`2adf85e78cf21fbe8828be7c3dfdc4f000635450`

Expected validation branch:

`validation/ozon-step3-quota-verifier-errors-2026-08-17`

Step 4 remains blocked until the full Step-3 GitHub report is independently reviewed and accepted.

## Step 4 — Cache/prefetch + semantic acquisition + integrated acceptance — BLOCKED

Only after Step 3 acceptance:

- verified reusable cache/prefetch;
- safe provider supersets and freshness/provenance;
- reviewed deterministic semantic acquisition profiles;
- integrated multi-tab/multi-AI regression;
- controlled final live acceptance.

## Delivery / security protection

Standing invariants remain:

- native Copy structurally anchors the exact code block;
- Ozon button exists independent of command contents; parser alone decides API validity;
- no content fingerprint is block identity;
- one extension-owned top-level Shadow DOM overlay;
- no global current conversation;
- proven ChatGPT delivery FSM is not rewritten;
- persistent “Начало диктовки” is not delivery completion;
- Alice lifecycle remains separate;
- AI cannot inject arbitrary provider URL/host/method/headers/auth/credentials;
- mutations remain blocked and `posting_fbs_get` remains blocked for customer PII;
- no hidden provider retry/pagination/report polling;
- no arbitrary generic bridge caps or silent result truncation.

## Current gate

`STEP0 = ACCEPTED`

`STEP1 = ACCEPTED`

`STEP2 = ACCEPTED_FOR_STEP3`

`STEP3 = FROZEN_WAITING_FOR_CODEX_VALIDATION`

`STEP4 = BLOCKED`
