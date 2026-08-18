# Ozon Bridge — current handoff / continuation state

Date: 2026-08-18
Status: Step 4 implementation frozen; waiting for independent Codex validation.

## Repository / authority

Repository:

`MaksimUnimax/blood_sand`

Canonical working branch:

`work/ozon-data-collection-2026-08-11`

Current development branch:

`dev/ozon-v0.1.19-step4-cache-prefetch-semantic-acceptance-2026-08-18`

Live GitHub is the source of truth. Always fetch live refs first. Frozen implementation SHAs, not moving branch HEADs, are validation authority.

Canonical release/evidence lineage remains `reference-0.1.11/`.

## Operator baseline

Baseline pin:

`06bbed6649b11c6fd4b81b224ef41d8833ea267c`

Exact operator ZIP:

- size `100320`
- SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

Reconstruction-v2 base64 SHA:

`cb0bf7d1b467e8e28e1f083ed572ee4bb021034c0f2d3cffc734437648cc9d8f`

## Step 0 — CLOSED / ACCEPTED

Accepted Windows/Puppeteer/CFT harness remains authoritative. Do not reopen without a concrete harness regression.

## Step 1 — CLOSED / ACCEPTED

Original production logic:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Accepted reconstruction target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Accepted report:

`249669986d61c5df708dd5b635fe30662120336f`

Preserve strict contract validation, one capability probe max per relevant batch, zero probe universal/performance-only, seller-info privacy/non-AI-callability and entitlement semantics.

## Step 2 — CLOSED / ACCEPTED

Frozen target:

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Accepted validation branch:

`validation/ozon-step2-query-planner-coalescing-2026-08-17`

Accepted report ref:

`be7be62`

Preserve contiguous compatible analytics coalescing, exact non-metric semantics, union <=14, safe projection/provenance and previous-worker no-replay.

## Step 3 — CLOSED / ACCEPTED

Frozen target:

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

Validation branch:

`validation/ozon-step3-quota-verifier-errors-2026-08-17`

Report ref:

`21b004b`

Acceptance decision:

`6a644e57ee36ac4aa48c0a93464438c6595adc0e`

Verdict:

`STEP3_ACCEPTED_FOR_STEP4`

Preserve Step-3 quota family `seller.analytics_data.v1`, 60000ms same-Seller global coordination, durable `quota_waiting`, alarms/startup resume, Retry-After extension-only/no retry, response verifier and sanitized error/request-attempt provenance.

## Step 4 — IMPLEMENTED / FROZEN / VALIDATION PENDING

Scope: verified analytics cache/prefetch + fixed semantic acquisition profile + integrated synthetic regression.

Development branch:

`dev/ozon-v0.1.19-step4-cache-prefetch-semantic-acceptance-2026-08-18`

Exact accepted base:

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

**Frozen Step-4 target:**

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Do not test later documentation HEAD.

Implementation evidence:

`development/step4-cache-prefetch-semantic-acceptance/STEP4_IMPLEMENTATION_AND_LOCAL_EVIDENCE.md`

Patch manifest:

`development/step4-cache-prefetch-semantic-acceptance/PATCH_PARTS.md`

Patch:

- size `29136`
- SHA-256 `b05bf7f1d147172fbbb9de91a8388ee0cd400f27d9c4a2aaa0d5550535defed6`

Changed production hashes relative to accepted Step 3:

- `service_worker.js` `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `shared/ozon_contract.js` `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js` `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

Exactly those three files change. The other fourteen production files remain byte-identical to accepted Step 3, including manifest, AI/content/composer files, provider and provider transport.

### Cache behavior

Internal key:

`ozmb_provider_result_cache_v1`

Fixed TTL:

`60000 ms`

Only successful verified `analytics_data` results are admitted. Cache keying is Seller-account scoped and requires exact accepted Step-2 non-metric compatibility semantics. Cached metrics may satisfy only exact/subset logical executable metric requirements through the accepted projector.

Cache hit runs before quota because it makes zero external request. It records `external_request_executed=false`, freshness and cache-source provenance. A miss always continues through accepted Step-3 quota behavior.

Same Seller Client-Id may reuse cache after Api-Key rotation; different Seller accounts cannot. Raw credentials/account hash do not reach AI-visible cache metadata.

Errors, malformed responses and unverifiable cache entries are never returned as hits.

### Fixed semantic acquisition profile

Profile:

`analytics_basic_metrics_v1`

For a normal already-entitled `analytics_data` executable command requesting a non-empty subset of universal `revenue` / `ordered_units`, the physical provider request may safely acquire exactly both metrics while keeping every other normalized query parameter unchanged. Provider result is Step-3 verified, cached, then projected back to only the logical executable metrics.

Restricted metrics never activate this profile. No new AI-callable operation or arbitrary transport/cache control is added.

### Protected accepted functions

Raw function-body hashes are unchanged for Step-1 capability, Step-2 planner/coalescer/projector, Step-3 quota/retry-after/wait/verifier, and auto/manual delivery finalization functions. `processBatchQueue` is the intentional Step-4 integration point.

### Local evidence

All provider behavior mocked; `REAL_OZON_REQUESTS = 0`.

PASS includes exact/superset reuse, metric-order projection, TTL, cross-account isolation, same-account key rotation, malformed/error rejection, cache privacy/provenance, worker miss->prefetch->hit with one quota/provider call total, coalesced cache hit with zero new provider call, incompatible cache miss through quota, protected-function audit, JS syntax and fresh 17/17 reconstruction.

Six GitHub patch parts match local raw bytes by exact size and Git blob SHA.

Local evidence is not independent acceptance.

## Step-4 Codex validation gate

Standalone plan:

`validation/plans/OZON_STEP4_CACHE_PREFETCH_SEMANTIC_CODEX_VALIDATION_2026-08-18.md`

Plan commit:

`7455328f26edaac5a380f482660c8bb50093d4cd`

Expected validation branch:

`validation/ozon-step4-cache-prefetch-semantic-2026-08-18`

Expected report:

`validation/reports/OZON_STEP4_CACHE_PREFETCH_SEMANTIC_VALIDATION_2026-08-18.md`

Immediate next action:

1. send the full standalone Step-4 prompt to Codex;
2. Codex tests exact target `4ce190c8bbdc438dcdf407abbe4dbecd846736df` with mocked provider transport and accepted Windows harness;
3. Codex publishes a report-only validation branch and STOPs;
4. ChatGPT reviews the full live GitHub report;
5. only `STEP4_ACCEPTED_FOR_FINAL_LIVE_ACCEPTANCE` unlocks a separate controlled final real-profile/live gate.

## Final controlled live acceptance — BLOCKED

Do not claim or perform final live acceptance until Step 4 synthetic validation is independently accepted.

The later controlled live gate must cover facts that synthetic QA cannot establish: real logged-in ChatGPT/Alice binding/delivery and carefully controlled real Ozon provider/rate behavior. Canonical release promotion remains blocked until that final gate.

## Standing invariants

- Native Copy structural exact-code-block binding; no command-text/fingerprint binding.
- One extension-owned top-level Shadow DOM overlay.
- Independent tabs/conversations; no global current conversation.
- Fixed read-only provider hosts/operation registries; no assistant-supplied URL/host/method/headers/auth/credentials.
- Mutations and `posting_fbs_get` PII surface remain blocked.
- No hidden retry/pagination/report polling or arbitrary generic caps/silent truncation.
- Proven ChatGPT delivery FSM remains protected; persistent “Начало диктовки” is not completion.
- Alice lifecycle remains separate.

## Working method

`OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`

## Current gate

`STEP0 = ACCEPTED`

`STEP1 = ACCEPTED`

`STEP2 = ACCEPTED`

`STEP3 = ACCEPTED_FOR_STEP4`

`STEP4 = FROZEN_WAITING_FOR_CODEX_VALIDATION`

`FINAL_LIVE_ACCEPTANCE = BLOCKED`
