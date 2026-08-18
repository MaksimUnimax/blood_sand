# Ozon Bridge — current handoff / continuation state

Date: 2026-08-18
Status: Steps 0–4 accepted; final controlled live acceptance is the only open gate.

## Repository / authority

Repository:

`MaksimUnimax/blood_sand`

Canonical working branch:

`work/ozon-data-collection-2026-08-11`

Current coordination branch:

`dev/ozon-v0.1.19-final-live-acceptance-2026-08-18`

Live GitHub is the source of truth. Frozen implementation SHAs, not moving branch HEADs, are production/validation authority.

Canonical release/evidence lineage remains `reference-0.1.11/` until final live acceptance is reviewed and release promotion is separately performed.

## Operator baseline

Baseline pin: `06bbed6649b11c6fd4b81b224ef41d8833ea267c`

Exact operator ZIP:

- size `100320`
- SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

Reconstruction-v2 base64 SHA:

`cb0bf7d1b467e8e28e1f083ed572ee4bb021034c0f2d3cffc734437648cc9d8f`

## Step 0 — CLOSED / ACCEPTED

Accepted Windows/Puppeteer/CFT harness remains authoritative for synthetic QA. Do not reopen without a concrete regression.

## Step 1 — CLOSED / ACCEPTED

Production logic: `370e45a1803976f43d27d5a9d4b5613e09a91623`

Accepted reconstruction target: `298a4d618c69e8ffd33735ff96a153d42d160143`

Accepted report: `249669986d61c5df708dd5b635fe30662120336f`

Preserve strict contract validation, one capability probe max per relevant batch, zero probe universal/performance-only, seller-info privacy/non-AI-callability and entitlement semantics.

## Step 2 — CLOSED / ACCEPTED

Frozen target: `93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Validation branch: `validation/ozon-step2-query-planner-coalescing-2026-08-17`

Report ref: `be7be62`

Preserve contiguous compatible analytics coalescing, exact non-metric semantics, union <=14, safe projection/provenance and previous-worker no-replay.

## Step 3 — CLOSED / ACCEPTED

Frozen target: `eae8988f5baf8c7ead5a82371c9b1057295c906d`

Validation branch: `validation/ozon-step3-quota-verifier-errors-2026-08-17`

Report ref: `21b004b`

Acceptance decision: `6a644e57ee36ac4aa48c0a93464438c6595adc0e`

Preserve quota family `seller.analytics_data.v1`, 60000 ms same-Seller global coordination, durable `quota_waiting`, alarm/startup resume, Retry-After extension-only/no retry, response verifier and sanitized request-attempt provenance.

## Step 4 — CLOSED / ACCEPTED FOR FINAL LIVE

Frozen production target:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Patch:

- size `29136`
- SHA-256 `b05bf7f1d147172fbbb9de91a8388ee0cd400f27d9c4a2aaa0d5550535defed6`

Changed production hashes:

- `service_worker.js` `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `shared/ozon_contract.js` `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js` `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

Other fourteen production files remain byte-identical to accepted Step 3.

Independent validation branch:

`validation/ozon-step4-cache-prefetch-semantic-2026-08-18`

Independent report ref:

`4c41f92`

Lineage check: validation branch is exactly one report-only commit ahead of the frozen Step-4 target.

Acceptance decision commit:

`f9199e863cb7bd51ac95c7f2c3c5c839ce30236e`

Verdict:

`STEP4_ACCEPTED_FOR_FINAL_LIVE_ACCEPTANCE`

Preserve fixed 60 s verified analytics cache, same-account exact-semantics reuse, safe metric-superset projection, fixed `analytics_basic_metrics_v1`, cache-hit-before-quota, cold-miss Step-3 scheduler, account isolation/privacy and verified-only admission.

## Final controlled live acceptance — READY / OPERATOR ACTION REQUIRED

Coordination branch:

`dev/ozon-v0.1.19-final-live-acceptance-2026-08-18`

Production candidate remains exactly:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

No production change is authorized for final live acceptance.

Standalone plan:

`validation/plans/OZON_FINAL_CONTROLLED_LIVE_ACCEPTANCE_2026-08-18.md`

Plan commit:

`4af4ec43e261acfba9a8939bbfd97f81650bd00e`

Expected report branch:

`validation/ozon-final-live-acceptance-2026-08-18`

Expected report:

`validation/reports/OZON_FINAL_CONTROLLED_LIVE_ACCEPTANCE_2026-08-18.md`

### Live gate model

This gate must use the operator's normal Chrome profile with real logged-in ChatGPT and Alice. Codex prepares/verifies the exact unpacked candidate and reads sanitized exported diagnostics, but MUST NOT automate/remote-debug the normal profile or handle credentials.

Hard primary-run budget:

`REAL_OZON_BUSINESS_REQUESTS_MAX = 2`

Allowed real business operation only:

`analytics_data`

Expected:

- Seller capability probes = `0`;
- Performance requests = `0`;
- automatic/manual provider retries = `0`.

The planned sequence uses three pre-bound live conversations:

- ChatGPT-A: universal `revenue` query for 2026-08-17;
- ChatGPT-C: incompatible cold `revenue` query for 2026-08-16, clicked immediately after A so it must durably quota-wait;
- Alice-B: semantically identical `ordered_units` query for 2026-08-17, clicked after A succeeds so it must be served from A's fresh reviewed prefetch cache with zero new provider request.

After the accepted 60000 ms interval, ChatGPT-C must resume from its durable wait by the real MV3 alarm path and execute exactly the second business request without a second operator click.

Final required live facts:

- real structural Ozon-button binding in ChatGPT and Alice, native Copy independent;
- ChatGPT-A result delivered only to A;
- Alice-B cache result delivered only to Alice with `external_request_executed=false` and no current physical request id;
- ChatGPT-C waits, then resumes only after `next_allowed_at`, and delivers only to C;
- exactly two real analytics business requests total;
- zero capability probes, zero Performance requests, zero retries/duplicates;
- no cross-conversation/global-current-conversation leakage;
- credentials remain local and diagnostics/report sanitized.

If the operator misses the fixed cache TTL solely by timing, the result is `FINAL_LIVE_INCONCLUSIVE`; do not mutate TTL/state or silently spend another provider request.

Only a final report verdict:

`FINAL_LIVE_ACCEPTED_FOR_RELEASE_PROMOTION`

can unlock release-promotion review. Codex/operator must STOP after publishing the report; they do not promote the release.

## Standing invariants

- Native Copy structurally anchors exact code block; no text/fingerprint binding.
- One extension-owned top-level Shadow DOM overlay.
- Independent tabs/conversations; no global current conversation.
- Fixed read-only provider hosts/operation registries; no assistant-supplied URL/host/method/headers/auth/credentials.
- Mutations and `posting_fbs_get` remain blocked.
- No hidden retry/pagination/report polling or arbitrary generic caps/silent truncation.
- Proven ChatGPT delivery FSM remains protected; persistent `Начало диктовки` is not completion.
- Alice lifecycle remains separate.

## Current gate

`STEP0 = ACCEPTED`

`STEP1 = ACCEPTED`

`STEP2 = ACCEPTED`

`STEP3 = ACCEPTED`

`STEP4 = ACCEPTED_FOR_FINAL_LIVE_ACCEPTANCE`

`FINAL_LIVE_ACCEPTANCE = READY_OPERATOR_ACTION_REQUIRED`

`CANONICAL_RELEASE_PROMOTION = BLOCKED`

## Immediate next action

Send the full standalone final-live plan to Codex. Codex reconstructs the exact candidate and then coordinates the operator checkpoints. The operator performs the normal-profile installation, binding and exactly the planned live Ozon clicks. Codex publishes one sanitized report-only GitHub commit and STOPs.