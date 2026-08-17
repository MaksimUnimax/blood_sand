# Ozon Bridge — current handoff / continuation state

Date: 2026-08-17
Status: Step 2 implementation frozen; waiting for independent Codex validation.

## Repository identity

Repository:

`MaksimUnimax/blood_sand`

Canonical working branch:

`work/ozon-data-collection-2026-08-11`

Current Step-2 development branch:

`dev/ozon-v0.1.19-step2-query-planner-coalescing-2026-08-17`

Always fetch live refs before continuing. Do not rely on remembered moving branch HEADs.

Canonical release/evidence lineage remains:

`reference-0.1.11/`

Operator/local v0.1.12+ candidates are development inputs and are not canonical releases automatically.

## Operator development baseline

Baseline pin commit:

`06bbed6649b11c6fd4b81b224ef41d8833ea267c`

Exact operator ZIP:

- size `100320` bytes
- SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

Exact reconstruction-v2 artifacts:

`development/operator-v0.1.19/exact-reconstruction-v2/`

Correct concatenated base64 SHA-256:

`cb0bf7d1b467e8e28e1f083ed572ee4bb021034c0f2d3cffc734437648cc9d8f`

## Step 0 — CLOSED / ACCEPTED

Accepted Windows QA route:

`fixed unpacked source -> Node child_process.spawn() -> Chrome for Testing 151.0.7922.47 -> --remote-debugging-port=0 -> DevToolsActivePort -> Puppeteer 25.4.0 connect -> browser.installExtension() -> assertions/report`

Accepted validation commit:

`a5539c8663bb6b48dce197f59e0abfe2d388af93`

Do not reopen Step 0 without a concrete later harness failure.

## Step 1 — CLOSED / ACCEPTED

Step: Contract + Capability layer.

Original production-logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Exact reconstruction-v2 validation target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Accepted validation branch:

`validation/ozon-step1-contract-capability-retest-v2-2026-08-17`

Accepted report commit:

`249669986d61c5df708dd5b635fe30662120336f`

Verdict:

`STEP1_ACCEPTED_FOR_STEP2`

Preserve Step-1 invariants:

- strict validation before business execution;
- at most one internal `/v1/seller/info` capability probe per relevant clicked batch;
- zero Seller probes for universal/performance-only batches;
- seller-info raw identity/rating data never reaches AI output;
- UNKNOWN capability never means “no subscription”;
- entitlement plan precedes business execution;
- partial analytics strips only unavailable metrics when semantics remain valid;
- restricted dimension/sort/filter constraints are never silently removed;
- no blind capability re-probe after unknown in-flight worker restart;
- logical/physical fingerprints are distinct when Step-1 planning transforms a command.

Accepted Step-1 changed production hashes:

- `service_worker.js` — `b594872cff8f7049a441ffe8fe422d761069a14a48a1d32e7e54f568c7f0502a`
- `shared/ozon_contract.js` — `b8f39ded0163f45714eebff7f8c1a35242712918df5568935fbc77a442cc2987`
- `shared/ozon_provider.js` — `5e6d6bdf47e2561b0a015836d5a0f1c5ed28bd2a9625e84aadfdc49ab17deb74`

## Step 2 — IMPLEMENTED / FROZEN / VALIDATION PENDING

Step: Query planner + safe coalescing.

Branch base / Step-1 acceptance decision:

`c8d6a10b63b7c02095a6cc6626f5aa508e16a8bd`

**Frozen Step-2 implementation target:**

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Do not substitute moving branch HEAD when testing.

Step-2 evidence:

`development/step2-query-planner-coalescing/STEP2_IMPLEMENTATION_AND_LOCAL_EVIDENCE.md`

Patch manifest:

`development/step2-query-planner-coalescing/PATCH_PARTS.md`

Concatenated Step-2 patch:

- size `35644`
- SHA-256 `93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`

Step-2 candidate changed production hashes relative to accepted Step 1:

- `service_worker.js` — `6e50b48a9e908a055f815cc5d683ae565043317fffe050a57eeedc791961996f`
- `shared/ozon_contract.js` — `f75c45e29035c82115eb22da36cad5e4fba53ec04f6bfdd7080557587da06bac`
- `shared/ozon_provider.js` — `983b54fbe78e34c02555b28532792b6c786f200da9e85b67e310e023054e5f8d`

Exactly those three production files differ from accepted Step 1. The other fourteen production files remain byte-identical.

The Step-1 `ensureBatchCapabilityAndPlanning` body remains byte-identical, expected SHA-256:

`9aaf433de7baddd52c19e75aef237e3e852aa35519116e09a8fa288177417a9c`

Existing delivery/finalization functions were checked byte-identical where Step 2 does not need to change them.

### Step-2 behavior

Coalescing happens only after Step-1 capability/entitlement planning.

Only contiguous compatible `analytics_data` logical commands are coalesced. Contiguous-only behavior preserves physical execution order around unrelated operations.

Compatibility preserves all executable physical params except metrics. Therefore different date range, dimensions, filters, sort, offset, limit/window or other normalized physical semantics are not merged.

Different limits are intentionally not coalesced.

Metric union preserves deterministic first-seen order and cannot exceed 14.

Duplicate metric positions inside one logical executable command make that command ineligible for coalescing rather than guessing duplicate semantics.

For one coalesced group:

- all members are durably marked requesting under one worker session before provider execution;
- exactly one physical provider attempt is made;
- each original logical command receives its own distinct result/request ID;
- all logical results record shared physical request/fingerprint/group provenance;
- each logical result exposes only its own executable metrics in original logical metric order;
- Step-1 omitted/restricted metadata remains attached to that logical command;
- no extra AI-visible result is created for the physical request;
- all group logical results are stored atomically before advancing queue index.

Projection validates metric cardinality. An ambiguous/inconsistent response fails closed with `ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE`, records the already executed physical request, creates logical safe errors, and performs no retry.

Provider HTTP error fans out one safe logical error per group member with shared physical provenance; no retry/scheduler is introduced.

Worker restart while a coalesced group is durably requesting under an older worker session performs zero replay and uses accepted unknown-outcome no-retry behavior.

### Local evidence

Local executable tests used mocked provider transport only. `REAL_OZON_REQUESTS = 0`.

PASS included:

- compatibility/incompatibility matrix;
- metric projection/order and cardinality fail-closed cases;
- provider safe internal sanitized result;
- 3 compatible logical analytics => 1 physical call + 3 logical results;
- different limit => no merge;
- contiguous-only grouping;
- 15th unique metric stays outside a 14-metric group;
- Step-1 partial entitlement metadata preserved through coalescing;
- restart no-retry;
- provider HTTP error fanout;
- thrown execution one physical attempt identity;
- 30 recent `product_queries` => 1 capability probe + 30 business calls;
- 30 universal analytics => 0 probes + 1 physical analytics call;
- Performance-only => 0 Seller probes and no analytics coalescing;
- all production JS syntax;
- fresh reconstruction from accepted Step 1 + Step-2 patch was byte-identical to tested candidate.

Local evidence is not independent acceptance.

## Step-2 Codex validation gate

Standalone plan path:

`validation/plans/OZON_STEP2_QUERY_PLANNER_COALESCING_CODEX_VALIDATION_2026-08-17.md`

Plan documentation commit:

`f628f5c6bd85e925ddf96bea672f6aa080ff5377`

Expected validation branch:

`validation/ozon-step2-query-planner-coalescing-2026-08-17`

Expected report:

`validation/reports/OZON_STEP2_QUERY_PLANNER_COALESCING_VALIDATION_2026-08-17.md`

At the time of this handoff update the validation branch does not exist yet.

Immediate next action:

1. operator sends the full standalone Step-2 prompt to Codex;
2. Codex tests exact target `93c1eae13f518d92d53bbf1af4793b35d26bc5d3` using mocked provider transport and accepted Windows harness;
3. Codex creates report-only validation branch and STOPs;
4. ChatGPT reads the full GitHub report and either accepts Step 2 for Step 3 or performs one bounded Step-2 repair;
5. do not start Step 3 before this gate is resolved.

## Step 3 — BLOCKED

Future scope only after Step-2 acceptance:

- global Seller account / quota-family scheduler;
- persistent `last_provider_request_at` / `next_allowed_at` state;
- `/v1/analytics/data` one-per-minute coordination across tabs/AIs;
- Retry-After scheduling without hidden retry;
- broader response verifier and sanitized error normalization.

Step 2 intentionally does not implement these scheduler behaviors.

## Step 4 — BLOCKED

Future scope after Step 3:

- verified cache/prefetch;
- safe reusable provider supersets;
- deterministic semantic acquisition profiles where reviewed;
- integrated multi-tab/multi-AI and final controlled live acceptance.

## Standing protected invariants

- Native Copy structurally anchors the exact code block.
- Ozon button exists for every code block; parser alone decides whether Ozon commands exist.
- No block identity from command text/fingerprint.
- One extension-owned top-level Shadow DOM overlay.
- Multi-tab/conversation ownership independent; no global current conversation.
- AI cannot inject arbitrary provider URL/host/method/headers/auth/credentials.
- Credentials stay isolated.
- Read-only provider surface; mutations blocked.
- `posting_fbs_get` remains blocked for customer PII.
- No hidden provider retry/pagination/report polling.
- No arbitrary generic bridge caps or silent result truncation.
- Proven ChatGPT delivery FSM must not be rewritten by provider/planner work.
- Alice lifecycle remains separately protected.

## Working-method authority

`OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`

## Current gate

`STEP0 = ACCEPTED`

`STEP1 = ACCEPTED_FOR_STEP2`

`STEP2 = FROZEN_WAITING_FOR_CODEX_VALIDATION`

`STEP3 = BLOCKED`

`STEP4 = BLOCKED`
