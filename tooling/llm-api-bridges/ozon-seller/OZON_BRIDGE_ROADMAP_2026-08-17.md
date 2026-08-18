# Ozon Bridge — current engineering roadmap

Date: 2026-08-18
Status: active roadmap/specification; Step 4 frozen for independent validation.

## Target architecture

`clicked code-block batch -> strict validation -> Seller capability/entitlement -> query planner/coalescer -> verified cache/prefetch -> global provider quota scheduler -> Ozon -> response verifier/safe errors -> logical projector -> existing delivery engine`

AI adapters remain ChatGPT and Alice. Tabs/conversations/models are independently owned; there is no global current conversation.

Canonical release/evidence lineage remains `reference-0.1.11/`. Development acceptance does not itself promote a release.

## Step 0 — QA harness — ACCEPTED

Accepted Windows route remains closed and authoritative:

`fixed unpacked source -> Node child_process.spawn() -> Chrome for Testing 151.0.7922.47 -> --remote-debugging-port=0 -> DevToolsActivePort -> Puppeteer 25.4.0 -> browser.installExtension() -> assertions/report`

## Step 1 — Contract + Capability — ACCEPTED

Original production logic:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Accepted reconstruction-v2 target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Accepted report:

`249669986d61c5df708dd5b635fe30662120336f`

Preserve strict validation, one Seller capability probe max per relevant batch, zero probe for universal/performance-only work, seller-info privacy/non-AI-callability, entitlement semantics and no blind re-probe after unknown previous-worker outcome.

## Step 2 — Query planner + safe coalescing — ACCEPTED

Frozen target:

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Accepted validation branch:

`validation/ozon-step2-query-planner-coalescing-2026-08-17`

Accepted report ref:

`be7be62`

Preserve contiguous-only compatible `analytics_data` coalescing, exact non-metric semantics, deterministic metric union <=14, no different-limit merge, logical/physical provenance, fail-closed metric projection and previous-worker no-replay.

## Step 3 — Global analytics quota + verifier + safe errors — ACCEPTED

Frozen target:

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

Independent validation branch:

`validation/ozon-step3-quota-verifier-errors-2026-08-17`

Independent report ref:

`21b004b`

Acceptance decision commit:

`6a644e57ee36ac4aa48c0a93464438c6595adc0e`

Verdict:

`STEP3_ACCEPTED_FOR_STEP4`

Accepted Step-3 invariants include:

- quota family `seller.analytics_data.v1` at reviewed `60000 ms`;
- global same-Seller coordination across ChatGPT/Alice/tabs/conversations;
- different Seller accounts independent;
- persistent durable `quota_waiting` plus `chrome.alarms` resume;
- Retry-After extends only and never causes automatic retry;
- no replay of unknown previous-worker `requesting` outcome;
- analytics provider response verification before projection/cache admission;
- sanitized provider/transport errors and accurate external-attempt provenance.

## Step 4 — Verified cache/prefetch + semantic acquisition — IMPLEMENTED / FROZEN / VALIDATION PENDING

Development branch:

`dev/ozon-v0.1.19-step4-cache-prefetch-semantic-acceptance-2026-08-18`

Accepted base:

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

**Frozen Step-4 implementation target:**

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Step-4 patch:

- size `29136` bytes
- SHA-256 `b05bf7f1d147172fbbb9de91a8388ee0cd400f27d9c4a2aaa0d5550535defed6`

Exactly three production files change from accepted Step 3:

- `service_worker.js` -> `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `shared/ozon_contract.js` -> `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js` -> `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

Other fourteen production files are byte-identical to Step 3, including manifest, AI DOM/composer, provider and provider transport.

### Step-4 cache contract

Persistent internal storage key:

`ozmb_provider_result_cache_v1`

Fixed cache TTL:

`60000 ms`

Only successful verified `analytics_data` results are admitted.

Reuse requires the same internal Seller account and exact Step-2 non-metric compatibility semantics. Cached metrics may be a safe superset only; projection uses the already accepted Step-2 projector. No cross-date/filter/dimension/sort/offset/limit reuse is allowed.

Cache hit occurs before quota acquisition because no external request is executed. It records `external_request_executed=false`, freshness and source provenance. A cache miss still passes through the accepted Step-3 quota scheduler unchanged.

Different Seller accounts never share cache. Same Seller Client-Id may reuse cache after API-key rotation. Raw credentials/account hash are not AI output.

Provider/bridge errors and malformed/unverifiable responses are not cached. Corrupt entries are ignored as misses.

### Fixed semantic acquisition/prefetch profile

Profile id:

`analytics_basic_metrics_v1`

Only universal `analytics_data` executable metrics are eligible. A logical subset of `revenue` / `ordered_units` may physically fetch exactly both metrics while preserving every other normalized query parameter. The provider result is verified, cached, then projected back to only the logical executable metrics.

No new AI-callable provider operation or assistant-controlled URL/host/method/header/auth/cache policy is added.

### Local evidence

All provider behavior mocked. `REAL_OZON_REQUESTS = 0`.

PASS includes exact/superset projection, account isolation/key rotation, TTL expiry, malformed/error rejection, raw credential privacy, cache-hit provenance, worker miss->prefetch->hit with one quota/provider call total, coalesced cache fanout with zero new provider call, miss-through-Step3 quota, protected function hashes, all JS syntax, diff check and fresh 17/17 reconstruction.

Six raw GitHub patch parts were verified after transport by exact size and Git blob SHA.

Local evidence is not independent acceptance.

Standalone validation plan:

`validation/plans/OZON_STEP4_CACHE_PREFETCH_SEMANTIC_CODEX_VALIDATION_2026-08-18.md`

Plan commit:

`7455328f26edaac5a380f482660c8bb50093d4cd`

Expected validation branch:

`validation/ozon-step4-cache-prefetch-semantic-2026-08-18`

## Final controlled live acceptance — BLOCKED

Even a successful Step-4 Codex synthetic validation does not constitute real logged-in/live acceptance or canonical release promotion.

Only after `STEP4_ACCEPTED_FOR_FINAL_LIVE_ACCEPTANCE`, create a separate controlled operator plan covering real logged-in ChatGPT and Alice binding/delivery plus carefully controlled real Ozon behavior/rate facts. Do not fabricate those facts from synthetic QA.

## Standing protected invariants

- Native Copy structurally anchors exact code block; no text fingerprint binding.
- One extension-owned top-level Shadow DOM overlay.
- No global current conversation.
- Proven ChatGPT delivery FSM remains protected; persistent “Начало диктовки” is not completion.
- Alice lifecycle remains separate.
- Fixed provider hosts/operations; no assistant-supplied URL/host/method/headers/auth/credentials.
- Read-only surface; mutations and `posting_fbs_get` remain blocked.
- No hidden provider retry/pagination/report polling.
- No arbitrary generic caps or silent truncation.

## Current gate

`STEP0 = ACCEPTED`

`STEP1 = ACCEPTED`

`STEP2 = ACCEPTED`

`STEP3 = ACCEPTED_FOR_STEP4`

`STEP4 = FROZEN_WAITING_FOR_CODEX_VALIDATION`

`FINAL_LIVE_ACCEPTANCE = BLOCKED`
