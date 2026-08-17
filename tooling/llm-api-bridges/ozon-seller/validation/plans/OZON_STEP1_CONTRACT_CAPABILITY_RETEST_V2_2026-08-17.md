# Ozon Bridge Step 1 — bounded Codex retest v2

Date: 2026-08-17
Repository: `MaksimUnimax/blood_sand`
Status: standalone independent validation prompt. Step 2 remains blocked.

## Review context

The first retest report at commit `11e85e093649de06da07190251ddcda7386fd3e7` correctly returned `STEP1_REJECTED` because reconstruction v1 was invalid. It proved the repair scope and raw Step 1 patch hashes, then stopped before candidate construction and before every production behavior/browser gate.

The concrete v1 defect was reconstruction transport only:

- `00.b64.part` was exact;
- the larger `01`-`04` files were committed as their LAST 19,999 bytes;
- the previous prompt also carried a wrong expected SHA for the concatenated base64.

No production-logic defect was demonstrated by that retest.

A second bounded reconstruction-only repair was added. It preserves the truncated v1 files as evidence and adds only their exact missing prefixes plus a new verifier.

Exact repaired validation target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Original Step 1 production-logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Baseline pin commit:

`06bbed6649b11c6fd4b81b224ef41d8833ea267c`

Exact operator ZIP SHA-256:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

The repaired target above is the ONLY target for this retest. Do not substitute the moving development branch HEAD.

---

# FULL STANDALONE CODEX PROMPT

You are independently validating Ozon Bridge Step 1 (Contract + Capability layer) after a bounded reconstruction-v2 repair.

Live GitHub repository is the source of truth:

`MaksimUnimax/blood_sand`

Project directory:

`tooling/llm-api-bridges/ozon-seller/`

Exact target SHA to test:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Do NOT test a moving branch HEAD.

Original Step 1 production-logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Baseline pin commit:

`06bbed6649b11c6fd4b81b224ef41d8833ea267c`

Exact operator ZIP SHA-256:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

This operator/user-supplied v0.1.19 baseline is development evidence, NOT a canonical GitHub release. Canonical release/evidence lineage remains v0.1.11.

## 1. Hard scope and stop rules

Validate Step 1 only. Do NOT implement Step 2/3/4, repair production code, modify the development branch, modify old validation reports, contact real Ozon endpoints, or require operator browser actions/manual extension installation.

Test the exact target, create a report-only validation branch from that target, push the report, then STOP.

Any load-bearing FAIL => `STEP1_REJECTED`.

`STEP1_ACCEPTED_FOR_STEP2` is allowed only if every required gate passes.

## 2. Preserve accepted Step 0

Do not reopen/re-qualify Step 0. Use the accepted Windows route:

`fixed unpacked source -> Node child_process.spawn() -> Chrome for Testing 151.0.7922.47 -> --remote-debugging-port=0 -> DevToolsActivePort -> Puppeteer 25.4.0 connect -> browser.installExtension() -> assertions -> report`

Dedicated QA profile only. Operator browser actions = 0.

## 3. Clean exact checkout

Detach exactly at `298a4d618c69e8ffd33735ff96a153d42d160143` and record HEAD, clean status, Git/Python/Node/Puppeteer/Chrome/Windows versions.

Required:

`TARGET_SHA_EXACT = PASS`
`TARGET_TREE_CLEAN_BEFORE_TEST = PASS`

All generated QA files stay outside the candidate repo tree until the final report commit.

## 4. Prove bounded reconstruction-v2 repair only

Compare base docs SHA `7886fa7473e1560efeee65a21531da2ac4bd23f1` to target `298a4d618c69e8ffd33735ff96a153d42d160143`.

The delta must contain only these TEN new reconstruction-v2 files:

- `development/operator-v0.1.19/exact-reconstruction-v2/01.prefix.part`
- `development/operator-v0.1.19/exact-reconstruction-v2/02.prefix.a.part`
- `development/operator-v0.1.19/exact-reconstruction-v2/02.prefix.b.part`
- `development/operator-v0.1.19/exact-reconstruction-v2/02.prefix.c.part`
- `development/operator-v0.1.19/exact-reconstruction-v2/03.prefix.a.part`
- `development/operator-v0.1.19/exact-reconstruction-v2/03.prefix.b.part`
- `development/operator-v0.1.19/exact-reconstruction-v2/03.prefix.c.part`
- `development/operator-v0.1.19/exact-reconstruction-v2/04.prefix.part`
- `development/operator-v0.1.19/exact-reconstruction-v2/reconstruct_operator_v0.1.19_v2.py`
- `development/operator-v0.1.19/exact-reconstruction-v2/RECONSTRUCTION_V2.md`

No production file may differ because of this repair.

Also compare Git blob IDs at original Step 1 SHA `370e45a1803976f43d27d5a9d4b5613e09a91623` versus target for `development/step1-contract-capability/PATCH_PARTS.md`, `STEP1_IMPLEMENTATION_AND_LOCAL_EVIDENCE.md`, and patch parts `00.patch.part` through `07.patch.part`. They must remain identical.

Required:

`REPAIR_V2_SCOPE_EXACTLY_10_RECONSTRUCTION_FILES = PASS`
`STEP1_LOGIC_ARTIFACTS_UNCHANGED = PASS`

## 5. Reconstruct the exact operator baseline using v2

Do NOT use the old GitHub ZIP and do NOT use the v1 reconstruction script/hash declaration.

Use:

`development/operator-v0.1.19/exact-reconstruction-v2/reconstruct_operator_v0.1.19_v2.py`

Extract/read raw committed bytes, not Windows text-transformed copies.

The preserved v1 suffix fragments used by v2 must be:

- old `00.b64.part`: 10000 / `c8b027cd94c38768dc998f2063a4e9ae2750cbf58a71935b45f929b79f7a725a`
- old `01.b64.part`: 19999 / `834702eb1f34ad16939dde63704849648f44e545f5ace7aa482b238d5780e997`
- old `02.b64.part`: 19999 / `b1a00551f41d7371e3fc219aca97ec2827f534d5a2a285338a4be685e9b141ba`
- old `03.b64.part`: 19999 / `f479201cb1e4eb967b2c368a63e3c5316f1b6038a77e691daa8ba5f48ef412b6`
- old `04.b64.part`: 19999 / `71eb0cef609302d82468b978ed8c0fe69a7921dc4e8e9f068675a6f51740da5a`

New prefix fragments must be:

- `01.prefix.part`: 1 / `a1fce4363854ff888cff4b8e7875d600c2682390412a8cf79b37d0b11148b0fa`
- `02.prefix.a.part`: 10000 / `8d158aaab37882a812bb59a762e4046cf11ab3bd40ab93b57f887bbd78c59e51`
- `02.prefix.b.part`: 10000 / `bbf010640377b945789b5098e7857432e32f00377eb9222ea598410f7632668f`
- `02.prefix.c.part`: 1 / `a1fce4363854ff888cff4b8e7875d600c2682390412a8cf79b37d0b11148b0fa`
- `03.prefix.a.part`: 10000 / `8feabdfe53c66c38d75f9d9105ee0545b2dcd306bfaf3c9afa29c8a5793eaef6`
- `03.prefix.b.part`: 10000 / `eef0d6bd3ede1303acc49efa3d8717270ed68ae25e51896514e669b6cff70fce`
- `03.prefix.c.part`: 1 / `acac86c0e609ca906f632b0e2dacccb2b77d22b0621f20ebece1a4835b93f6f0`
- `04.prefix.part`: 3761 / `a94fe9654a7ee800e7474f8b90b8f167bf7e051f35e689d97923c2fef5e429d4`

The exact concatenation order is defined by the v2 script/README.

Expected concatenated base64:

- size `133760`
- SHA-256 `cb0bf7d1b467e8e28e1f083ed572ee4bb021034c0f2d3cffc734437648cc9d8f`

Run the v2 script with an output ZIP path in an external QA directory. It must print `RECONSTRUCTION_V2_PASS`.

Decoded ZIP must be:

- size `100320`
- SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`
- exactly the expected 17 production files.

Required:

`BASELINE_RECONSTRUCTION_V2 = PASS`
`BASELINE_ZIP_SHA = PASS`
`BASELINE_17_FILES = PASS`

If this gate fails, report exact observed fragment/base64/ZIP values and stop. Do not improvise bytes.

## 6. Raw Step 1 patch gate

Extract each patch part as raw Git object bytes, not Windows working-tree text. Expected SHA-256:

- 00 `8146303b3ac046f07d841873257d0207117490a3b3977fac523b5dc572c5292b`
- 01 `4d20c05d750adb43863a6d5d386eb6647539e78b5f495e5c8b9eed3af02e6f28`
- 02 `23dc7cc98b0877f97c67358263097e66f44f17fe5b55c88d8a3a09f283dddf61`
- 03 `49e248a74638e51bb39e5d6f33929b1faf71b80b5db9ceedb00e767c95fa654d`
- 04 `508c42a05f872a24bc7d8d279cd7777b95158b1a3fe76cbe58731663865f35f1`
- 05 `5906016f7c72b660ba0debd99c7c758ef4f7b60c609dbce11bb08e1fc03504c0`
- 06 `5dfd53ac85b8d28b637010dc5a61910d25e5e539a52687deeef796411fe8570d`
- 07 `f752e2176c5a58b690dbf287d44d06fec92ede2ad89ce149baf484bc38bcd1d5`

Concatenated patch SHA-256:

`5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`

Required:

`PATCH_PART_RAW_HASHES = PASS`
`PATCH_CONCAT_SHA = PASS`

## 7. Candidate exact production delta

Apply the exact patch to a fresh copy of the reconstructed baseline outside the repo.

Exactly THREE production files may differ:

- `service_worker.js` => `b594872cff8f7049a441ffe8fe422d761069a14a48a1d32e7e54f568c7f0502a`
- `shared/ozon_contract.js` => `b8f39ded0163f45714eebff7f8c1a35242712918df5568935fbc77a442cc2987`
- `shared/ozon_provider.js` => `5e6d6bdf47e2561b0a015836d5a0f1c5ed28bd2a9625e84aadfdc49ab17deb74`

The other fourteen production files must be byte-identical to baseline. In particular AI DOM/composer/conversation/delivery files remain protected and must not be redesigned.

Required:

`CHANGED_FILES_EXACTLY_3 = PASS`
`CHANGED_FILE_HASHES = PASS`
`PROTECTED_14_BYTE_IDENTICAL = PASS`
`AI_DOM_COMPOSER_PROTECTED = PASS`
`DELIVERY_FSM_PROTECTED = PASS`
`JS_SYNTAX = PASS`

## 8. Contract tests against actual candidate code

Use executable Node/VM tests and mocked provider counters, not static grep alone.

For `analytics_data`, validate reviewed dates, required fields, dimensions, `revenue`/`ordered_units`, restricted dimensions, max 14 metrics, limit 1..1000, offset >=0, filter/sort rules, and local rejection of invented `orders_count` with zero business requests.

For `product_queries`, validate RFC3339 datetimes, SKU string-int64, sort enums, page_size <=1000, max 1000 SKUs, no invented minimums.

For `product_queries_details`, validate RFC3339 datetimes, SKU string-int64, sort enums, page_size <=100, max 1000 SKUs, limit_by_sku <=15, no invented minimums.

Required:

`STRICT_CONTRACT_VALIDATION = PASS`
`PREEXECUTION_ZERO_BUSINESS_REQUESTS = PASS`

## 9. Capability/privacy/entitlement

Use actual candidate provider/capability code with mocked transport.

Internal probe is fixed `POST /v1/seller/info`. Assistant must not control host/url/method/headers/credentials. Raw seller identity/account fields must never reach AI-facing results. Recognized subscription enum is exactly `UNKNOWN`, `UNSPECIFIED`, `PREMIUM`, `PREMIUM_LITE`, `PREMIUM_PLUS`, `PREMIUM_PRO`. No hidden retry. Direct AI operation `seller_info` remains unsupported with zero provider requests.

Exercise the frozen entitlement matrix, including:

- universal recent analytics: no probe, execute unchanged;
- mixed universal+restricted metric: preserve universal subset with explicit partial metadata;
- UNKNOWN != no subscription;
- all-restricted unavailable/unknown: zero business request and safe logical error;
- never silently strip restricted dimension/sort/filter;
- analytics history/restricted subscription rules;
- product_queries recent/old-history rules;
- product_queries_details restricted sort rules including conservative `PREMIUM_PRO => ENTITLEMENT_UNKNOWN` where frozen contract did not establish entitlement.

Required:

`CAPABILITY_RESOLVER = PASS`
`SELLER_INFO_PRIVACY = PASS`
`SELLER_INFO_NOT_AI_CALLABLE = PASS`
`ENTITLEMENT_PLANNER_MATRIX = PASS`

## 10. Batch-level one-probe invariant

Use actual `service_worker.js` in an external Node VM harness with mocked Chrome/runtime/storage/provider functions. Candidate source bytes must remain unchanged.

Test at minimum:

1. 30 capability-sensitive recent `product_queries` in one clicked batch => exactly ONE seller-info probe; Step 1 may execute 30 mocked business calls.
2. 30 universal recent analytics commands => ZERO probes.
3. mixed `revenue + hits_view`, `UNSPECIFIED` => one probe, one analytics call with only revenue, logical partial metadata preserved.
4. all-restricted analytics, `UNSPECIFIED` => one probe, ZERO analytics business calls.
5. probe HTTP/unknown => no retry; universal subset may execute, restricted remains unknown.
6. all restricted + unknown => zero business call.
7. persisted `state:"requesting"` owned by previous `WORKER_SESSION_ID` => ZERO second probes after restart; fail closed/unknown.
8. Performance-only batch => ZERO Seller probes and existing Performance path.

Report exact counters.

Required:

`ONE_CAPABILITY_PROBE_PER_RELEVANT_BATCH = PASS`
`ZERO_PROBE_FOR_UNIVERSAL_OR_PERFORMANCE_BATCH = PASS`
`PROBE_RESTART_NO_RETRY = PASS`

## 11. Logical/physical provenance

For logical analytics `metrics:["revenue","hits_view"]` where only revenue is executable, verify physical body contains only revenue, logical identity remains original request, physical fingerprint differs when transformed, omitted metric/reason is explicit, provider errors retain planning metadata, seller-info raw fields never leak, and business `external_request_executed` remains separate from capability-probe provenance.

Required:

`LOGICAL_PHYSICAL_PROVENANCE = PASS`

## 12. Security/regressions

Verify actual candidate code blocks arbitrary host/url/method/header/auth/credential injection; provider hosts stay fixed; credentials stay isolated; mutations remain blocked; `posting_fbs_get` remains blocked for PII; pre-execution failures make zero business calls; no hidden retry/pagination/fan-out/report polling; no generic arbitrary truncation/caps reintroduced; mocked `performance_campaigns` regression still works; universal Seller `roles` remains unchanged and zero-probe.

Required:

`SECURITY_REGRESSION = PASS`
`PERFORMANCE_REGRESSION = PASS`
`SELLER_BASELINE_REGRESSION = PASS`

## 13. MV3 browser sanity

Use the already accepted Windows/Puppeteer harness on the reconstructed candidate. Verify runtime install, 17-file inventory, MV3 worker startup, unchanged manifest/host permissions, stable extension ID for fixed unpacked source, operator actions 0, no manual ZIP install. No real ChatGPT/Alice login is required because protected AI DOM/composer files are byte-identical; do not fabricate live-account evidence.

Required:

`MV3_BROWSER_SANITY = PASS`
`OPERATOR_BROWSER_ACTIONS = 0`

## 14. Absolute no-real-Ozon guard

Block/count any request to `api-seller.ozon.ru` or `api-performance.ozon.ru`. All provider behavior must be mocked.

Final report must state:

`REAL_OZON_REQUESTS = 0`

Any attempted real request is a hard FAIL.

## 15. Acceptance and publication

`STEP1_ACCEPTED_FOR_STEP2` only if every required gate above passes. Otherwise `STEP1_REJECTED`.

Create validation branch exactly FROM target SHA:

`validation/ozon-step1-contract-capability-retest-v2-2026-08-17`

Create exactly this report:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_STEP1_CONTRACT_CAPABILITY_RETEST_V2_2026-08-17.md`

The validation branch must contain ONLY that report file. No fixes, harness source, reconstructed ZIP, candidate tree, or other evidence files.

Commit message:

`test: retest Ozon Step 1 after reconstruction v2 repair`

Push the branch, do not merge, do not modify development branch, then STOP.

The report must include exact target, repair-v2 scope proof, reconstruction fragment sizes/hashes, correct concatenated base64 size/hash, decoded ZIP size/hash/inventory, raw patch hashes, candidate/protected file hashes, environment, executable behavior results/counters, browser sanity, `OPERATOR_BROWSER_ACTIONS = 0`, `REAL_OZON_REQUESTS = 0`, and final verdict.

## 16. Final response format

Return exactly:

```text
CODEX_OZON_STEP1_RETEST_V2_RESULT

tested_sha:
  298a4d618c69e8ffd33735ff96a153d42d160143

repair_scope:
  reconstruction_v2_files_exactly_10: PASS|FAIL
  step1_logic_artifacts_unchanged: PASS|FAIL

reconstruction:
  baseline_bundle_v2: PASS|FAIL
  baseline_zip_sha: PASS|FAIL
  raw_patch_parts: PASS|FAIL
  patch_concat_sha: PASS|FAIL
  changed_files_exactly_3: PASS|FAIL
  protected_14_byte_identical: PASS|FAIL

contract:
  strict_validation: PASS|FAIL
  preexecution_zero_business_requests: PASS|FAIL

capability:
  resolver: PASS|FAIL
  seller_info_privacy: PASS|FAIL
  seller_info_not_ai_callable: PASS|FAIL
  entitlement_matrix: PASS|FAIL
  one_probe_per_relevant_batch: PASS|FAIL
  zero_probe_universal_performance: PASS|FAIL
  restart_no_retry: PASS|FAIL

provenance:
  logical_physical: PASS|FAIL

regression:
  ai_dom_composer_protected: PASS|FAIL
  delivery_fsm_protected: PASS|FAIL
  security: PASS|FAIL
  performance: PASS|FAIL
  seller_baseline: PASS|FAIL

browser:
  mv3_sanity: PASS|FAIL
  operator_browser_actions: <number>

real_ozon_requests:
  <number>

report_branch:
  <branch or NONE>

report_commit:
  <sha or NONE>

report_url:
  <url or NONE>

verdict:
  STEP1_ACCEPTED_FOR_STEP2|STEP1_REJECTED
```

After pushing the report: STOP. Do not implement Step 2. Wait for independent review.
