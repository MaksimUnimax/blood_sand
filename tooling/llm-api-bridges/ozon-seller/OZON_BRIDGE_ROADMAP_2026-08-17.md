# Ozon Bridge — current engineering roadmap

Date: 2026-08-18
Status: Steps 0–4 accepted; final controlled live acceptance prepared and awaiting operator-assisted execution.

## Target architecture

`clicked code-block batch -> strict validation -> Seller capability/entitlement -> query planner/coalescer -> verified cache/prefetch -> global provider quota scheduler -> Ozon -> response verifier/safe errors -> logical projector -> existing delivery engine`

AI adapters remain ChatGPT and Alice. Tabs/conversations/models are independently owned; there is no global current conversation.

Canonical release/evidence lineage remains `reference-0.1.11/`. Development/synthetic acceptance does not itself promote a release.

## Step 0 — QA harness — ACCEPTED

Accepted Windows route remains closed and authoritative:

`fixed unpacked source -> Node child_process.spawn() -> Chrome for Testing 151.0.7922.47 -> --remote-debugging-port=0 -> DevToolsActivePort -> Puppeteer 25.4.0 -> browser.installExtension() -> assertions/report`

## Step 1 — Contract + Capability — ACCEPTED

Production logic SHA: `370e45a1803976f43d27d5a9d4b5613e09a91623`

Accepted reconstruction-v2 target: `298a4d618c69e8ffd33735ff96a153d42d160143`

Accepted report: `249669986d61c5df708dd5b635fe30662120336f`

Preserve strict validation, one Seller capability probe max per relevant batch, zero probe for universal/performance-only work, seller-info privacy/non-AI-callability, entitlement semantics and no blind re-probe after unknown previous-worker outcome.

## Step 2 — Query planner + safe coalescing — ACCEPTED

Frozen target: `93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Accepted validation branch: `validation/ozon-step2-query-planner-coalescing-2026-08-17`

Accepted report ref: `be7be62`

Preserve contiguous-only compatible `analytics_data` coalescing, exact non-metric semantics, deterministic metric union <=14, no different-limit merge, logical/physical provenance, fail-closed projection and previous-worker no-replay.

## Step 3 — Global analytics quota + verifier + safe errors — ACCEPTED

Frozen target: `eae8988f5baf8c7ead5a82371c9b1057295c906d`

Validation branch: `validation/ozon-step3-quota-verifier-errors-2026-08-17`

Report ref: `21b004b`

Acceptance decision: `6a644e57ee36ac4aa48c0a93464438c6595adc0e`

Accepted invariants include quota family `seller.analytics_data.v1` at reviewed `60000 ms`, same-Seller global coordination, different-account independence, durable `quota_waiting`, alarms/startup resume, Retry-After extension-only/no retry, no replay of unknown previous-worker `requesting`, analytics response verification and sanitized error/request-attempt provenance.

## Step 4 — Verified cache/prefetch + semantic acquisition — ACCEPTED

Frozen target: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Step-4 patch:

- size `29136` bytes
- SHA-256 `b05bf7f1d147172fbbb9de91a8388ee0cd400f27d9c4a2aaa0d5550535defed6`

Exactly three production files differ from accepted Step 3:

- `service_worker.js` -> `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `shared/ozon_contract.js` -> `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js` -> `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

Other fourteen production files are byte-identical to accepted Step 3.

Independent validation branch:

`validation/ozon-step4-cache-prefetch-semantic-2026-08-18`

Independent report ref:

`4c41f92`

Independent branch lineage was checked: exactly one report-only commit ahead of the frozen Step-4 target.

Acceptance decision commit:

`f9199e863cb7bd51ac95c7f2c3c5c839ce30236e`

Verdict:

`STEP4_ACCEPTED_FOR_FINAL_LIVE_ACCEPTANCE`

Accepted Step-4 invariants:

- persistent internal cache key `ozmb_provider_result_cache_v1`;
- fixed cache TTL `60000 ms`;
- only successful verified `analytics_data` results admitted;
- same Seller account + exact accepted Step-2 non-metric semantics required for reuse;
- safe metric-superset projection only, no cross-date/filter/dimension/sort/offset/limit derivation;
- cache hit runs before quota with `external_request_executed=false`;
- cache miss preserves Step-3 scheduler;
- different Seller accounts never share cache; API-key rotation for the same Client-Id keeps account scope;
- errors/malformed/corrupt entries never become hits;
- fixed acquisition profile `analytics_basic_metrics_v1` may prefetch exactly `revenue` + `ordered_units` for already-entitled universal logical subsets only;
- no arbitrary assistant-controlled cache/transport behavior.

## Final controlled live acceptance — READY / OPERATOR ACTION REQUIRED

This is the only remaining acceptance gate before release-promotion review.

Development/coordination branch:

`dev/ozon-v0.1.19-final-live-acceptance-2026-08-18`

Exact production candidate remains frozen at:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Standalone operator-assisted plan:

`validation/plans/OZON_FINAL_CONTROLLED_LIVE_ACCEPTANCE_2026-08-18.md`

Plan commit:

`4af4ec43e261acfba9a8939bbfd97f81650bd00e`

Expected report branch:

`validation/ozon-final-live-acceptance-2026-08-18`

Expected report:

`validation/reports/OZON_FINAL_CONTROLLED_LIVE_ACCEPTANCE_2026-08-18.md`

The final live scenario is deliberately bounded to at most **2 real Ozon business requests**, both universal `analytics_data`, with expected `0` Seller capability probes and `0` Performance requests.

The operator uses the normal logged-in Chrome profile. Codex reconstructs/verifies the exact candidate and coordinates evidence, but does not automate the normal profile or handle credentials.

The live gate verifies facts synthetic QA cannot establish:

- real ChatGPT structural code-block binding and delivery;
- real Alice structural binding and delivery;
- native Copy independence;
- multi-conversation ownership;
- one real analytics call -> reviewed prefetch/cache admission;
- live cross-AI Alice cache hit with zero new provider call;
- another cold ChatGPT owner durably waits on the real same-Seller quota and resumes after the accepted interval without manual retry;
- exactly two real business requests total, no duplicate/retry/capability/Performance traffic;
- diagnostics remain sanitized and credentials stay local.

Only a reviewed report verdict `FINAL_LIVE_ACCEPTED_FOR_RELEASE_PROMOTION` can unlock release-promotion work. Codex/operator do not promote a release themselves.

## Standing protected invariants

- Native Copy structurally anchors exact code block; no text fingerprint binding.
- One extension-owned top-level Shadow DOM overlay.
- No global current conversation.
- Proven ChatGPT delivery FSM remains protected; persistent `Начало диктовки` is not completion.
- Alice lifecycle remains separate.
- Fixed provider hosts/operations; no assistant-supplied URL/host/method/headers/auth/credentials.
- Read-only surface; mutations and `posting_fbs_get` remain blocked.
- No hidden provider retry/pagination/report polling.
- No arbitrary generic caps or silent truncation.

## Current gate

`STEP0 = ACCEPTED`

`STEP1 = ACCEPTED`

`STEP2 = ACCEPTED`

`STEP3 = ACCEPTED`

`STEP4 = ACCEPTED_FOR_FINAL_LIVE_ACCEPTANCE`

`FINAL_LIVE_ACCEPTANCE = READY_OPERATOR_ACTION_REQUIRED`

`CANONICAL_RELEASE_PROMOTION = BLOCKED`