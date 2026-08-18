# Ozon Bridge Step 4 — independent Codex validation plan

Date: 2026-08-18
Status: standalone validation prompt. Final controlled live acceptance remains a separate later gate.

# FULL STANDALONE CODEX PROMPT

You are independently validating Ozon Bridge Step 4: **verified analytics cache/prefetch + fixed semantic acquisition profile + integrated synthetic regression**.

Live GitHub is the source of truth.

Repository:

`MaksimUnimax/blood_sand`

Project directory:

`tooling/llm-api-bridges/ozon-seller/`

Exact Step-4 target SHA to test:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Do NOT test moving branch HEAD.

Accepted Step-3 target:

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

Accepted Step-3 validation report ref:

`21b004b`

Exact operator baseline ZIP SHA-256:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

Canonical release/evidence lineage still remains v0.1.11. Step 4 is a development candidate, not a canonical release.

## 1. Hard scope and stop rules

Validate Step 4 only.

Do NOT:

- repair production code during validation;
- perform real Ozon Seller/Performance requests;
- use real logged-in ChatGPT/Alice accounts as evidence for this synthetic gate;
- promote a canonical release;
- modify development branch or older validation reports;
- merge the validation branch;
- invent new cache semantics, aliases or transport behavior while testing.

Create a report-only validation branch from the exact target, publish the report and STOP.

Any load-bearing FAIL => `STEP4_REJECTED`.

Only all required PASS => `STEP4_ACCEPTED_FOR_FINAL_LIVE_ACCEPTANCE`.

This verdict does NOT itself mean final real-profile/live acceptance or canonical release acceptance.

## 2. Preserve accepted Step 0/1/2/3

Do not reopen accepted gates without a concrete regression.

Accepted browser route remains:

`fixed unpacked source -> Node child_process.spawn() -> Chrome for Testing 151.0.7922.47 -> --remote-debugging-port=0 -> DevToolsActivePort -> Puppeteer 25.4.0 connect -> browser.installExtension() -> assertions -> report`

Dedicated QA profile; operator browser actions = 0.

Preserve:

- Step-1 strict validation/capability/entitlement and at-most-one Seller capability probe per relevant batch;
- Step-2 contiguous compatible analytics coalescing, metric projection and logical/physical provenance;
- Step-3 global same-Seller analytics quota scheduler, durable wait/restart, Retry-After extension-only, no automatic retry and response verifier/safe errors;
- native Copy structural binding, existing AI adapters and delivery FSM.

## 3. Clean exact checkout

Detach exactly at:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Record exact HEAD, clean status and environment versions.

Required:

`TARGET_SHA_EXACT = PASS`
`TARGET_TREE_CLEAN_BEFORE_TEST = PASS`

Generated/reconstructed/test files remain outside repository tree until final report commit.

## 4. Reconstruct exact accepted Step-3 base

Reconstruct the exact operator baseline with accepted reconstruction-v2 raw bytes, then apply accepted Step-1, Step-2 and Step-3 patches.

Required checkpoints:

- operator ZIP size `100320`, SHA `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`;
- Step-1 concat patch SHA `5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`;
- Step-2 concat patch SHA `93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`;
- Step-3 concat patch SHA `9eee85d648a212e96658514dea8f031223d255cf93c7c73a14107c50817919f5`;
- exact 17 production files and accepted Step-3 hashes.

Required:

`STEP3_BASELINE_RECONSTRUCTION = PASS`

## 5. Verify/apply Step-4 raw patch

Read:

`development/step4-cache-prefetch-semantic-acceptance/PATCH_PARTS.md`

Extract the six parts using raw Git bytes.

Expected:

- `00`: size `5163`, SHA `b047ace2c1c74d0da39ec52343ce2107355ab32d52c6356d3f02d56cac9cdfa7`
- `01`: size `5099`, SHA `c3d3b3017097fd0d036049a594c4a366df5b8b81a0dde02b5ff863824890f9c4`
- `02`: size `5199`, SHA `6e0c783e988192b4221ad444e0f38cd0170b60b4b9d30236317f141250eaad0f`
- `03`: size `5195`, SHA `77b6a40ff13316c1e307270aaea2b7597956563f8051c50cef51b627c6ac0830`
- `04`: size `5188`, SHA `51350ae1756b1d198884dbcb566d1585b9d64ad7d09d61bfbe278ee250b4dcb8`
- `05`: size `3292`, SHA `30521308e1c264669ca618548182c29e91b74b98aed6132abee0011ce4db5eb1`

Concat expectation:

- size `29136`
- SHA `b05bf7f1d147172fbbb9de91a8388ee0cd400f27d9c4a2aaa0d5550535defed6`

Apply without manual production edits.

Required:

`STEP4_PATCH_RAW_HASHES = PASS`
`STEP4_PATCH_CONCAT_SHA = PASS`
`STEP4_PATCH_APPLY = PASS`

## 6. Exact production delta and protected surfaces

Exactly three production files change from accepted Step 3:

- `service_worker.js` => `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `shared/ozon_contract.js` => `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js` => `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

The other fourteen production files must be byte-identical to Step 3, including manifest, content script, AI adapters, composer, provider and provider transport.

Manifest permissions/host permissions must be byte-identical to Step 3.

By raw function-body comparison prove unchanged:

- `ensureBatchCapabilityAndPlanning`
- `planCommandForSellerCapability`
- `buildBatchQueryPlan`
- `ensureBatchQueryPlanning`
- `analyticsCoalescingDescriptor`
- `buildAnalyticsCoalescedCommand`
- `projectAnalyticsDataResult`
- `acquireAnalyticsProviderQuota`
- `extendAnalyticsQuotaFromRetryAfter`
- `prepareProviderQuotaForCommand`
- `persistBatchQuotaWait`
- `verifyProviderResponse`
- `finalizeAutoBatch`, `finalizeManualBatch`, `attemptAutoDelivery`, `attemptManualBatchDelivery`.

`processBatchQueue` is intentionally the Step-4 integration point and is expected to change.

Required:

`CHANGED_FILES_EXACTLY_3 = PASS`
`PROTECTED_14_BYTE_IDENTICAL = PASS`
`STEP1_STEP2_STEP3_FUNCTIONS_PROTECTED = PASS`
`DELIVERY_FSM_PROTECTED = PASS`
`AI_DOM_COMPOSER_PROTECTED = PASS`
`MANIFEST_UNCHANGED = PASS`
`JS_SYNTAX = PASS`

## 7. Cache identity, privacy and fixed policy

Use actual candidate code with deterministic time/storage/crypto mocks.

Verify:

- storage key is fixed internal `ozmb_provider_result_cache_v1`;
- cache TTL is fixed at `60000` ms;
- AI cannot supply cache key, TTL, Seller account identity or policy;
- same Seller Client-Id with rotated Api-Key shares cache;
- different Seller Client-Id cannot reuse cache;
- raw Client-Id/Api-Key are absent from persisted cache and AI-visible metadata;
- account hash itself is not AI-visible.

Required:

`CACHE_IDENTITY_PRIVACY = PASS`
`CACHE_POLICY_FIXED = PASS`

## 8. Exact/superset semantic reuse matrix

Use actual `analyticsCoalescingDescriptor`, cache reader and `projectAnalyticsDataResult`.

A verified cache entry may hit only when all non-metric normalized semantics are identical and cached metrics contain requested executable metrics.

Required PASS cases:

- exact metric-set hit;
- safe metric-superset hit;
- requested metric order preserved in projection;
- object key normalization behaves consistently with accepted Step 2.

Required MISS cases for any difference in:

- date_from/date_to;
- dimension list or dimension order;
- filters/array order/value;
- sort/order;
- offset;
- limit/window;
- Seller account;
- expired TTL;
- missing requested metric.

No cross-date/filter/dimension/window derivation, local aggregation or top-N enlargement.

Required:

`CACHE_SEMANTIC_REUSE_MATRIX = PASS`
`CACHE_METRIC_PROJECTION = PASS`

## 9. Cache admission / corruption fail-closed

Verify only `ok=true` already-verifiable `analytics_data` results are stored.

Do NOT cache:

- provider HTTP errors;
- bridge/transport errors;
- malformed cardinality/unsupported shapes;
- non-analytics operations.

Inject corrupt/malformed persisted cache entries. They must be ignored as misses, never guessed/projected. A miss continues through normal Step-3 flow rather than returning corrupt data.

Required:

`CACHE_ADMISSION_VERIFIED_ONLY = PASS`
`CORRUPT_CACHE_FAILS_TO_MISS = PASS`

## 10. Cache hit before quota/provider

With a fresh valid compatible entry, run actual worker queue.

Required:

- quota acquire count = 0 for that logical requirement;
- provider business request count = 0;
- `external_request_executed=false`;
- current physical request id is not fabricated;
- cache source request/fingerprint and freshness are explicit;
- logical command identity and Step-1 entitlement metadata remain intact.

Test both one logical command and a Step-2 coalesced logical group satisfied from cache.

Required:

`CACHE_HIT_ZERO_QUOTA_ZERO_PROVIDER = PASS`
`COALESCED_CACHE_LOGICAL_FANOUT = PASS`
`CACHE_PROVENANCE = PASS`

## 11. Cache miss preserves Step-3 scheduler

For cold/incompatible/expired cache:

- Step-3 quota scheduler is still invoked;
- same-Seller concurrent cold misses still grant only one analytics permit per window;
- another owner becomes durable `quota_waiting` as before;
- different Seller remains independent;
- no automatic retry is introduced.

If a waiting owner later resumes after another owner populated a compatible fresh cache, it may complete from cache with zero new provider request rather than consuming a new permit.

Required:

`CACHE_MISS_USES_STEP3_QUOTA = PASS`
`COLD_CONCURRENCY_QUOTA_PRESERVED = PASS`
`WAITING_OWNER_CAN_REUSE_FRESH_CACHE = PASS`
`ZERO_AUTOMATIC_RETRY = PASS`

## 12. Fixed semantic acquisition / prefetch profile

Use actual `reviewedAnalyticsAcquisitionProfile`.

Profile id must be exactly:

`analytics_basic_metrics_v1`

It may apply only to `analytics_data` executable commands whose metrics are a non-empty subset of universal `revenue` and `ordered_units`.

It may physically request only:

`["revenue", "ordered_units"]`

Every other query parameter must remain exactly semantically identical.

Verify:

- logical `revenue` may physically fetch `revenue+ordered_units`;
- logical `ordered_units` likewise;
- response is verified before cache admission;
- delivered logical result contains only the requested executable metrics in logical order;
- the extra universal metric may support a later cache hit;
- restricted metrics do not activate/widen this profile;
- profile cannot define URL/host/method/header/auth/TTL or arbitrary metrics.

Required:

`FIXED_ACQUISITION_PROFILE = PASS`
`PREFETCH_LOGICAL_PROJECTION = PASS`
`PROFILE_ENTITLEMENT_BOUNDARY = PASS`

## 13. Entitlement interactions

Test Step-1 partial entitlement before Step 4.

Example: logical request contains `revenue + hits_view` under a non-entitled profile; Step 1 executable command contains only `revenue` and records omitted `hits_view`. Step 4 may prefetch universal `ordered_units`, but must not re-add `hits_view` or erase Step-1 omission metadata.

Restricted dimension/sort/filter rejection remains rejection and must not be made cacheable by stripping semantics.

Required:

`STEP1_ENTITLEMENT_PRESERVED_THROUGH_CACHE = PASS`

## 14. Persistence/restart and multi-owner synthetic integration

Persist a verified cache entry, recreate/restart worker context using the same storage, and prove it remains usable until expiry without provider request.

Exercise independent owner/conversation identities representing multiple tabs and both ChatGPT/Alice adapter modes using mocked provider transport. Cache is global only by Seller account/query semantics, while delivery ownership remains conversation-specific.

No global “current conversation” may appear.

Required:

`CACHE_PERSISTS_WORKER_RESTART = PASS`
`MULTI_TAB_MULTI_AI_SYNTHETIC = PASS`
`DELIVERY_OWNERSHIP_ISOLATED = PASS`

## 15. Step-1/2/3/security regression

Re-run actual-code regressions proving:

- capability one-probe/zero-probe rules;
- Step-2 contiguous coalescing and <=14 metrics;
- Step-3 same-Seller one-per-minute cold-miss quota and Retry-After extension-only;
- verifier still rejects malformed live provider responses before cache admission;
- missing credentials/quota-state failure remain zero-provider fail-closed where applicable;
- arbitrary assistant URL/host/method/headers/auth/credentials remain blocked;
- mutations and `posting_fbs_get` remain blocked;
- no hidden retry/pagination/report polling;
- no arbitrary generic caps/silent truncation.

Required:

`STEP1_CAPABILITY_REGRESSION = PASS`
`STEP2_COALESCING_REGRESSION = PASS`
`STEP3_QUOTA_VERIFIER_REGRESSION = PASS`
`SECURITY_REGRESSION = PASS`

## 16. MV3 browser sanity

Load reconstructed Step-4 candidate with accepted Puppeteer/CFT harness.

Verify 17-file inventory, install, service worker startup, unchanged permissions/host permissions, alarms still available, no uncaught startup errors and operator browser actions 0.

Because AI DOM/composer files are byte-identical, do not claim real logged-in ChatGPT/Alice acceptance. Use synthetic/mocked adapter ownership checks only.

Required:

`MV3_BROWSER_SANITY = PASS`
`OPERATOR_BROWSER_ACTIONS = 0`

## 17. Absolute no-real-Ozon guard

Block/count attempts to `api-seller.ozon.ru` and `api-performance.ozon.ru`.

All provider behavior is mocked.

Required final value:

`REAL_OZON_REQUESTS = 0`

Any real attempt is hard FAIL.

## 18. Final-live boundary check

Confirm the candidate and documentation do not claim final real-profile/live acceptance. Step-4 synthetic acceptance may only unlock creation/execution of a separate controlled final live acceptance plan covering real logged-in ChatGPT/Alice binding/delivery and controlled real Ozon behavior.

Required:

`FINAL_LIVE_GATE_REMAINS_SEPARATE = PASS`

## 19. Acceptance/report publication

`STEP4_ACCEPTED_FOR_FINAL_LIVE_ACCEPTANCE` only if every required gate passes.

Create validation branch exactly from target SHA:

`validation/ozon-step4-cache-prefetch-semantic-2026-08-18`

Create exactly one report file:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_STEP4_CACHE_PREFETCH_SEMANTIC_VALIDATION_2026-08-18.md`

No production fixes/candidate files/harness files on validation branch.

Commit message:

`test: validate Ozon Step 4 cache prefetch semantic`

Push branch, do not merge, do not modify development branch, and STOP.

## 20. Final response format

Return exactly:

```text
CODEX_OZON_STEP4_VALIDATION_RESULT

tested_sha:
  4ce190c8bbdc438dcdf407abbe4dbecd846736df

reconstruction:
  step3_baseline: PASS|FAIL
  step4_patch_raw_hashes: PASS|FAIL
  step4_patch_concat_sha: PASS|FAIL
  changed_files_exactly_3: PASS|FAIL
  protected_14_byte_identical: PASS|FAIL

cache:
  identity_privacy: PASS|FAIL
  fixed_policy: PASS|FAIL
  semantic_reuse_matrix: PASS|FAIL
  metric_projection: PASS|FAIL
  verified_admission_only: PASS|FAIL
  corrupt_cache_miss: PASS|FAIL
  hit_zero_quota_zero_provider: PASS|FAIL
  provenance: PASS|FAIL
  restart_persistence: PASS|FAIL

prefetch:
  fixed_profile: PASS|FAIL
  logical_projection: PASS|FAIL
  entitlement_boundary: PASS|FAIL

integration:
  coalesced_cache_fanout: PASS|FAIL
  cold_miss_quota_preserved: PASS|FAIL
  waiting_owner_cache_reuse: PASS|FAIL
  multi_tab_multi_ai_synthetic: PASS|FAIL

regression:
  step1_capability: PASS|FAIL
  step2_coalescing: PASS|FAIL
  step3_quota_verifier: PASS|FAIL
  delivery_fsm_protected: PASS|FAIL
  ai_dom_composer_protected: PASS|FAIL
  security: PASS|FAIL

browser:
  mv3_sanity: PASS|FAIL
  operator_browser_actions: <number>

real_ozon_requests:
  <number>

final_live_gate_separate:
  PASS|FAIL

report_branch:
  <branch or NONE>

report_commit:
  <sha or NONE>

report_url:
  <url or NONE>

verdict:
  STEP4_ACCEPTED_FOR_FINAL_LIVE_ACCEPTANCE|STEP4_REJECTED
```

After pushing the report: STOP.

Do not perform final live acceptance and do not promote a release. Wait for independent ChatGPT review of the full GitHub report.
