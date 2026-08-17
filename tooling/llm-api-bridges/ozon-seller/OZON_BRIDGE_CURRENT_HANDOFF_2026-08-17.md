# Ozon Bridge — current handoff / continuation state

Date: 2026-08-17
Status: Step 3 implementation frozen; waiting for independent Codex validation.

## Repository identity

Repository:

`MaksimUnimax/blood_sand`

Canonical working branch:

`work/ozon-data-collection-2026-08-11`

Current development branch:

`dev/ozon-v0.1.19-step3-quota-verifier-errors-2026-08-17`

Always fetch live refs before continuing. Do not substitute moving branch HEADs for frozen validation targets.

Canonical release/evidence lineage remains `reference-0.1.11/`. Operator/local v0.1.12+ candidates are development inputs, not canonical releases automatically.

## Operator baseline

Baseline pin commit:

`06bbed6649b11c6fd4b81b224ef41d8833ea267c`

Exact operator ZIP:

- size `100320`
- SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

Exact reconstruction-v2 base64 SHA-256:

`cb0bf7d1b467e8e28e1f083ed572ee4bb021034c0f2d3cffc734437648cc9d8f`

## Step 0 — CLOSED / ACCEPTED

Accepted Windows QA route:

`fixed unpacked source -> Node child_process.spawn() -> Chrome for Testing 151.0.7922.47 -> --remote-debugging-port=0 -> DevToolsActivePort -> Puppeteer 25.4.0 connect -> browser.installExtension() -> assertions/report`

Accepted validation commit:

`a5539c8663bb6b48dce197f59e0abfe2d388af93`

Do not reopen Step 0 without a concrete later harness failure.

## Step 1 — CLOSED / ACCEPTED

Original production-logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Accepted reconstruction-v2 validation target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Accepted report commit:

`249669986d61c5df708dd5b635fe30662120336f`

Verdict:

`STEP1_ACCEPTED_FOR_STEP2`

Preserve strict contract validation, one Seller capability probe max per relevant batch, zero probe universal/performance, seller-info privacy/non-AI-callability, entitlement semantics and previous-worker no-reprobe behavior.

## Step 2 — CLOSED / ACCEPTED

Frozen implementation target:

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Patch SHA-256:

`93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`

Accepted validation branch:

`validation/ozon-step2-query-planner-coalescing-2026-08-17`

Accepted report ref supplied by Codex and independently readable via GitHub:

`be7be62`

Verdict:

`STEP2_ACCEPTED_FOR_STEP3`

Step-2 acceptance decision commit:

`51a0b16c51a60b2dc8e656b7fd41eb6d60c446ad`

Preserve contiguous-only compatible `analytics_data` coalescing, deterministic metric union <=14, no different-limit merge, one physical request -> separate logical results/provenance, durable requesting ownership and previous-worker no-replay.

## Step 3 — IMPLEMENTED / FROZEN / VALIDATION PENDING

Step: global analytics quota scheduler + response verifier + safe errors.

Development branch:

`dev/ozon-v0.1.19-step3-quota-verifier-errors-2026-08-17`

Branch base:

`51a0b16c51a60b2dc8e656b7fd41eb6d60c446ad`

**Frozen Step-3 implementation target:**

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

Do not test the later moving dev HEAD.

Evidence:

`development/step3-quota-verifier-errors/STEP3_IMPLEMENTATION_AND_LOCAL_EVIDENCE.md`

Patch manifest:

`development/step3-quota-verifier-errors/PATCH_PARTS.md`

Patch:

- size `42730`
- SHA-256 `9eee85d648a212e96658514dea8f031223d255cf93c7c73a14107c50817919f5`

Exactly six production files differ from accepted Step 2:

- `manifest.json` `6e314da445166d390a32f3f3afdfdf86a97e2af6eeed0c3cd4a47d34d60550da`
- `service_worker.js` `bfe2aa15b09f48dffb2dd7ff913f6b527c07fca09e462759dffb30d9dd72c514`
- `shared/ozon_contract.js` `e303b74b266c685f1ae20b9e3b726211f7b65c56490a3ed09693b84489e58b45`
- `shared/ozon_provider.js` `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js` `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/runtime_names.js` `f66a4fc004a59981c59f715ba335c4b2b4b8f750789befb17b045894bb55ac24`

Other eleven production files are byte-identical. AI DOM/composer surfaces are unchanged. The only manifest permission addition is `alarms`; host permissions are unchanged.

### Step-3 scheduler behavior

Explicit persistent quota family:

`seller.analytics_data.v1`

Minimum interval:

`60000 ms`

The bucket is Seller-account scoped and global across ChatGPT, Alice, tabs and conversations. Same Seller Client-Id survives API-key rotation as one account bucket; credential revision changes. Different Seller accounts remain independent. Raw Client-Id/Api-Key are not stored in quota state or emitted to AI.

No generic 60-second interval is invented for other Seller/Performance operations. Internal `/v1/seller/info` capability probes do not consume the analytics-data quota bucket.

Concurrent acquisition uses serialized persistent read-modify-write; only one permit can be granted for a same-account window. One Step-2 coalesced physical analytics group consumes one permit.

Blocked owner state is durably `quota_waiting` before provider execution. `chrome.alarms` and startup recovery resume due waits after MV3 suspension/restart. Existing no-replay behavior for already-`requesting` provider attempts remains intact.

Retry-After only extends effective `next_allowed_at` and cannot shorten it. There is no automatic provider retry.

### Step-3 verifier/errors

Successful `analytics_data` verifies provider result/data/totals metric cardinality before logical projection. Mismatch fails `PROVIDER_RESPONSE_CONTRACT_MISMATCH` after one physical attempt, with no retry or guessed mapping.

Provider errors are sanitized structured data; raw bodies/secrets are withheld. Fetch/network throws are recorded as attempted external requests. Pre-fetch credential/quota-state failures execute zero provider calls and report external=false.

### Local evidence

All provider behavior mocked; `REAL_OZON_REQUESTS = 0`.

PASS covered concurrent quota, cross-conversation same-account wait, different-account independence, key rotation, raw credential privacy, durable wait/restart/alarm, one coalesced permit, Retry-After extension-only, quota-storage fail-closed, missing credentials zero-provider, analytics verifier, 429 sanitization, transport provenance, Step-1/Step-2/Performance regressions, syntax/manifest/diff, and fresh 17/17 patch reconstruction.

Eight GitHub patch parts were verified after transport by exact size and Git blob SHA.

Local evidence is not independent acceptance.

## Step-3 Codex validation gate

Standalone plan:

`validation/plans/OZON_STEP3_QUOTA_VERIFIER_ERRORS_CODEX_VALIDATION_2026-08-17.md`

Plan commit:

`2adf85e78cf21fbe8828be7c3dfdc4f000635450`

Expected validation branch:

`validation/ozon-step3-quota-verifier-errors-2026-08-17`

Expected report:

`validation/reports/OZON_STEP3_QUOTA_VERIFIER_ERRORS_VALIDATION_2026-08-17.md`

Immediate next action:

1. send the full standalone Step-3 prompt to Codex;
2. Codex tests exact target `eae8988f5baf8c7ead5a82371c9b1057295c906d` with mocked providers and accepted Windows harness;
3. Codex publishes report-only validation branch and STOPs;
4. ChatGPT reviews the full live GitHub report;
5. only `STEP3_ACCEPTED_FOR_STEP4` unlocks Step 4; any load-bearing fail triggers one bounded Step-3 repair only.

## Step 4 — BLOCKED

Do not implement cache/prefetch, semantic acquisition profiles, integrated multi-AI final acceptance or live provider acceptance until Step 3 is independently accepted.

## Standing protected invariants

- Native Copy structurally anchors the exact code block.
- Ozon button exists for every code block; parser alone decides API validity.
- No block identity from command text/fingerprint.
- One extension-owned top-level Shadow DOM overlay.
- Multi-tab/conversation ownership independent; no global current conversation.
- AI cannot inject arbitrary provider URL/host/method/headers/auth/credentials.
- Credentials stay isolated; read-only surface and PII block remain.
- No hidden provider retry/pagination/report polling.
- No arbitrary generic bridge caps or silent result truncation.
- Proven ChatGPT delivery FSM is not rewritten by provider work; persistent “Начало диктовки” is not completion.
- Alice lifecycle remains separately protected.

## Working-method authority

`OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`

## Current gate

`STEP0 = ACCEPTED`

`STEP1 = ACCEPTED`

`STEP2 = ACCEPTED_FOR_STEP3`

`STEP3 = FROZEN_WAITING_FOR_CODEX_VALIDATION`

`STEP4 = BLOCKED`
