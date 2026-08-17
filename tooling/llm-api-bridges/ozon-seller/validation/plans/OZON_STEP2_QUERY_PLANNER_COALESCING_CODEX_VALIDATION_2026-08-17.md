# Ozon Bridge Step 2 — independent Codex validation plan

Date: 2026-08-17
Status: standalone validation prompt. Step 3 remains blocked.

# FULL STANDALONE CODEX PROMPT

You are independently validating Ozon Bridge Step 2: **Query planner + safe coalescing**.

Live GitHub is the source of truth.

Repository:

`MaksimUnimax/blood_sand`

Project directory:

`tooling/llm-api-bridges/ozon-seller/`

Exact Step-2 target SHA to test:

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Do NOT test a moving branch HEAD.

Step-2 branch base / accepted Step-1 decision:

`c8d6a10b63b7c02095a6cc6626f5aa508e16a8bd`

Accepted Step-1 production-logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Accepted Step-1 reconstruction-v2 target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Accepted Step-1 report commit:

`249669986d61c5df708dd5b635fe30662120336f`

Exact operator ZIP SHA-256:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

Canonical release/evidence lineage still reaches v0.1.11. The operator v0.1.19 input is a development baseline, not a canonical release.

## 1. Hard scope and stop rules

Validate Step 2 only.

Do NOT:

- implement or repair production code during validation;
- implement Step 3 global quota scheduling, one-per-minute coordination, response-verifier redesign or Retry-After scheduling;
- implement Step 4 cache/prefetch or semantic aliases;
- modify the development branch;
- modify Step-1 validation reports;
- contact real Ozon Seller or Performance endpoints;
- require operator browser actions or manual extension installation;
- merge the validation branch.

Test the exact target, create a report-only validation branch from that exact target, push the report, and STOP.

Any load-bearing FAIL => `STEP2_REJECTED`.

`STEP2_ACCEPTED_FOR_STEP3` is allowed only if every required gate below passes.

## 2. Preserve accepted Step 0 and Step 1

Do not reopen Step 0.

Accepted browser route:

`fixed unpacked source -> Node child_process.spawn() -> Chrome for Testing 151.0.7922.47 -> --remote-debugging-port=0 -> DevToolsActivePort -> Puppeteer 25.4.0 connect -> browser.installExtension() -> assertions -> report`

Dedicated QA profile only. Operator browser actions = 0.

Do not weaken accepted Step-1 behavior:

- strict contract validation before provider execution;
- 0 or 1 internal `/v1/seller/info` probe per clicked batch;
- zero Seller capability probes for universal/performance-only work;
- seller-info raw response never AI-visible;
- UNKNOWN capability is not equivalent to no subscription;
- entitlement planning happens before Step-2 coalescing;
- no blind probe retry after worker restart;
- logical and physical command fingerprints remain distinct when transformed.

## 3. Clean exact checkout

Start clean and detach exactly at:

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Record exact HEAD, clean status, Git/Python/Node/Puppeteer/CFT/Windows versions.

Required:

`TARGET_SHA_EXACT = PASS`
`TARGET_TREE_CLEAN_BEFORE_TEST = PASS`

All generated/reconstructed/test files stay outside the repository tree until final report commit.

## 4. Reconstruct accepted Step-1 candidate exactly

Use the reconstruction-v2 artifacts already present at the exact target. Do not use the old invalid GitHub ZIP or reconstruction-v1 expectations.

Run the v2 reconstruction verifier using raw committed bytes. Required baseline:

- concatenated base64 size `133760`;
- concatenated base64 SHA-256 `cb0bf7d1b467e8e28e1f083ed572ee4bb021034c0f2d3cffc734437648cc9d8f`;
- decoded ZIP size `100320`;
- decoded ZIP SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`;
- exactly 17 production files.

Extract the accepted Step-1 patch parts as raw Git bytes using `git show TARGET:path` or equivalent byte-preserving Git plumbing. Do not use Windows text redirection as hash authority.

Expected Step-1 patch-part SHA-256 values remain those in the accepted Step-1 manifest; concatenated Step-1 patch must be:

`5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`

Apply the Step-1 patch to a fresh external copy of the exact operator baseline.

Before Step 2, accepted Step-1 changed hashes must be:

- `service_worker.js` — `b594872cff8f7049a441ffe8fe422d761069a14a48a1d32e7e54f568c7f0502a`
- `shared/ozon_contract.js` — `b8f39ded0163f45714eebff7f8c1a35242712918df5568935fbc77a442cc2987`
- `shared/ozon_provider.js` — `5e6d6bdf47e2561b0a015836d5a0f1c5ed28bd2a9625e84aadfdc49ab17deb74`

Required:

`STEP1_BASELINE_RECONSTRUCTION = PASS`

## 5. Verify and apply Step-2 patch as raw Git bytes

Read:

`development/step2-query-planner-coalescing/PATCH_PARTS.md`

Extract all six Step-2 patch parts from the exact target as raw Git bytes.

Required exact expectations:

- `00.patch.part`: size `5941`, SHA-256 `a1e762cfe09df399a170aa78fa00c90c3044c64280ba3bc0e7d8feeb6e8f2115`
- `01.patch.part`: size `5915`, SHA-256 `7682ef88f23cbbe1cb17e14aa1899e822cc2ef30fd80adc48d321e00a056c0d2`
- `02.patch.part`: size `5979`, SHA-256 `8d9a5ccbd5a9107257f8644057f6e0760a72668566330f55bed0337dd4772286`
- `03.patch.part`: size `5988`, SHA-256 `1a7402df6eb393a045fc3a9c2cc4c0d03650f28d698a377e1574de70d80de541`
- `04.patch.part`: size `5941`, SHA-256 `2bbe65a60294187de816a2a8dfd36725ddbf016e0bedaac268119ed86c29648f`
- `05.patch.part`: size `5880`, SHA-256 `82594c1e33aca9f03f2b95f98064016e0dd6925709b039697a3254759d21276a`

Concatenate byte-for-byte in lexical order.

Expected Step-2 patch:

- size `35644`;
- SHA-256 `93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`.

Apply it without manual production edits.

Required:

`STEP2_PATCH_RAW_HASHES = PASS`
`STEP2_PATCH_CONCAT_SHA = PASS`
`STEP2_PATCH_APPLY = PASS`

## 6. Exact production delta and protected surfaces

Relative to accepted Step 1, exactly THREE production files must change:

1. `service_worker.js` => SHA-256 `6e50b48a9e908a055f815cc5d683ae565043317fffe050a57eeedc791961996f`
2. `shared/ozon_contract.js` => SHA-256 `f75c45e29035c82115eb22da36cad5e4fba53ec04f6bfdd7080557587da06bac`
3. `shared/ozon_provider.js` => SHA-256 `983b54fbe78e34c02555b28532792b6c786f200da9e85b67e310e023054e5f8d`

The other 14 production files must remain byte-identical to accepted Step 1/operator baseline.

Additionally prove the Step-1 `ensureBatchCapabilityAndPlanning` function body is byte-identical before/after Step 2. Its expected body SHA-256 in both candidates is:

`9aaf433de7baddd52c19e75aef237e3e852aa35519116e09a8fa288177417a9c`

Prove the existing delivery/finalization functions outside query execution were not rewritten, especially auto/manual finalize, delivery claim/insert/confirmation/failure and recovery functions.

Required:

`CHANGED_FILES_EXACTLY_3 = PASS`
`PROTECTED_14_BYTE_IDENTICAL = PASS`
`STEP1_CAPABILITY_FUNCTION_UNCHANGED = PASS`
`DELIVERY_FSM_PROTECTED = PASS`
`AI_DOM_COMPOSER_PROTECTED = PASS`

## 7. Syntax and actual code loading

Run `node --check` over all production JavaScript and execute actual candidate functions via VM/module harnesses. Static grep alone is insufficient for behavior that can be invoked.

Required:

`JS_SYNTAX = PASS`

## 8. Pure coalescing compatibility matrix

Use actual candidate `OzonContract` functions.

For `analytics_data`, verify:

A. Same date range, ordered dimensions, filters, sort, limit, offset; different compatible metrics => same compatibility key and eligible.

B. Object key order changes inside equivalent filter/sort objects => still compatible.

C. Array order changes => not silently normalized into equivalence.

D. Any different `date_from`, `date_to`, dimensions, filters, sort, offset or limit => NOT compatible.

E. Missing optional field versus explicit value (for example no offset versus offset 0) remains conservative and does not merge unless candidate normalization makes them exactly identical.

F. Duplicate metrics in one logical executable command => ineligible rather than guessing duplicate-position semantics.

G. Non-analytics operations => ineligible.

H. Metric union preserves deterministic first-seen order and never exceeds 14.

I. A 15th unique metric must not be inserted into an existing 14-metric physical group.

Required:

`COALESCING_COMPATIBILITY_MATRIX = PASS`
`METRIC_UNION_LIMIT = PASS`

## 9. Contiguous-order safety

Use actual worker query planner.

Verify only contiguous compatible logical analytics commands are coalesced.

Example:

`analytics A, analytics B, roles, analytics C, analytics D`

must execute in physical order:

`coalesced(A+B), roles, coalesced(C+D)`

Do not pull C/D ahead of `roles` and do not merge A/B with C/D across it.

Pre-execution errors, Step-1 planning errors and incompatible commands break groups.

Required:

`CONTIGUOUS_ORDER_PRESERVED = PASS`

## 10. Step-1 entitlement interaction

Coalescing must use Step-1 `execution_command`, while each logical result retains original logical identity and planning metadata.

Test at minimum:

- logical A requests `revenue + hits_view`, mocked `UNSPECIFIED`; Step 1 permits only `revenue` and records omitted `hits_view`;
- logical B requests `ordered_units + hits_view`, same physical query semantics, mocked `UNSPECIFIED`; Step 1 permits only `ordered_units` and records omitted `hits_view`;
- Step 2 may issue ONE physical analytics request with metrics `revenue, ordered_units`;
- produce two logical results;
- logical A exposes only `revenue` data plus its original omitted `hits_view` planning metadata;
- logical B exposes only `ordered_units` data plus its own omitted `hits_view` planning metadata;
- only one capability probe for the whole relevant batch.

Restricted dimensions/sort/filters rejected by Step 1 must never be silently removed merely to make a group mergeable.

Required:

`STEP1_ENTITLEMENT_METADATA_PRESERVED = PASS`
`STEP1_ONE_PROBE_WITH_STEP2 = PASS`

## 11. Main worker coalescing matrix and counters

Use actual candidate `service_worker.js` functions with mocked durable Chrome state/provider transport.

Report exact Seller capability probe count, logical result count and physical business request count for every case.

Required cases:

1. 30 identical universal recent analytics commands, same shape and metric `revenue`:
   - Seller capability probes = 0;
   - logical results = 30;
   - physical analytics requests = 1.

2. 30 compatible universal analytics commands split across `revenue` and `ordered_units`, same shape:
   - probes = 0;
   - logical results = 30;
   - physical analytics requests = 1;
   - physical union contains each metric once.

3. 30 recent capability-sensitive `product_queries`:
   - exactly 1 Seller capability probe;
   - 30 business calls;
   - no Step-2 semantic coalescing.

4. Performance-only batch:
   - 0 Seller probes;
   - no analytics coalescing;
   - existing Performance route remains selected.

5. Incompatible analytics by date/dimension/filter/sort/offset/limit:
   - no unsafe merge;
   - physical counts reflect separate requests/groups.

6. 15 individually requested unique reviewed analytics metrics with otherwise identical shape:
   - first safe group union <=14;
   - 15th metric not inserted into that group;
   - no provider request exceeds 14 metrics.

Required:

`WORKER_COALESCING_COUNTERS = PASS`
`SELLER_PERFORMANCE_REGRESSION = PASS`

## 12. Durable request ownership and no-retry recovery

For a coalesced group, prove all member entries are durably marked `requesting` under one current `WORKER_SESSION_ID` before the physical provider call.

If persisted batch state later shows the leader/group requesting under a DIFFERENT previous worker session:

- perform ZERO second provider requests;
- return/fail with the accepted unknown-outcome no-retry behavior;
- do not replay individual members either.

Also test a batch with Step-1 planning complete but business execution already started and Step-2 query plan absent: fail closed as migration-unsafe rather than retroactively regrouping already-started work.

Required:

`COALESCED_DURABLE_OWNERSHIP = PASS`
`COALESCED_RESTART_NO_RETRY = PASS`
`QUERY_PLAN_MIGRATION_FAIL_CLOSED = PASS`

## 13. Projection correctness and fail-closed behavior

Use actual `projectAnalyticsDataResult` and actual worker logical result builder.

For physical metrics `[revenue, ordered_units, hits_view]`:

- logical `[hits_view, revenue]` must receive values in exactly that logical order;
- dimensions/other safe row fields remain preserved;
- totals, when present, project in the same logical metric order.

Test response forms with `data` only, `totals` only and both.

Hard-fail projection when:

- any `data[].metrics` length differs from physical metric count;
- `totals` length differs;
- logical metric is absent from physical metric set;
- physical/logical metric list is ambiguous/duplicated;
- no verifiable `data` or `totals` metric surface exists.

For a successful HTTP request whose response is unprojectable:

- exactly ONE physical request was executed;
- ZERO automatic retry;
- every logical group member receives sanitized `ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE`;
- `external_request_executed:true`;
- all logical results share the same physical provenance.

Required:

`LOGICAL_METRIC_PROJECTION = PASS`
`PROJECTION_FAIL_CLOSED_NO_RETRY = PASS`

## 14. Provider-error and thrown-execution fanout

A mocked provider HTTP error for one coalesced physical request must yield one safe logical error result per group member with:

- one shared physical request ID;
- one shared physical command fingerprint/group ID;
- original logical IDs/fingerprints retained;
- safe Retry-After metadata may be copied if present;
- no retry/scheduling introduced.

A thrown execution error must create one shared bridge physical-attempt ID for the group and one logical safe error per member; do not count it as N physical attempts and do not retry.

Required:

`PROVIDER_ERROR_LOGICAL_FANOUT = PASS`
`THROWN_EXECUTION_SINGLE_PHYSICAL_ATTEMPT = PASS`

## 15. Logical/physical provenance and batch summary

For a successful coalesced group verify:

- every original logical command gets a distinct logical `request_id`;
- original logical command fingerprint remains attached;
- all group members share physical request ID;
- all group members share physical command fingerprint;
- `coalescing_group_id` is explicit;
- `coalesced_logical_count` is correct;
- physical metric set/order and projected logical metric set/order are explicit in planning metadata;
- Step-1 omitted/restricted metadata is preserved;
- no extra AI-visible result item exists for the physical request itself.

Batch header must distinguish logical business result count from unique physical business request count.

Required:

`LOGICAL_PHYSICAL_PROVENANCE = PASS`
`BATCH_LOGICAL_PHYSICAL_COUNTS = PASS`

## 16. Security and Step-3 boundary regression

Verify no Step-2 change enables:

- arbitrary assistant-supplied URL/host/method/headers/auth/credentials;
- mutation/write operations;
- `posting_fbs_get` PII surface;
- raw seller-info output;
- raw provider body output;
- hidden retry, pagination, fan-out beyond the explicitly planned safe logical projection, or report polling;
- arbitrary generic byte/depth/item/time caps or silent truncation.

Verify Step 2 did NOT implement persistent quota scheduler fields such as `last_provider_request_at`, `next_allowed_at`, `min_interval_ms`, sleeps/waits, or automatic retry. Retry-After may be safely reported but must not cause scheduling/retry in Step 2.

Required:

`SECURITY_REGRESSION = PASS`
`NO_STEP3_SCHEDULER_IMPLEMENTED = PASS`

## 17. MV3 browser sanity

Load the reconstructed Step-2 candidate with the accepted Windows/Puppeteer/CFT harness.

Verify runtime extension install, expected 17-file inventory, MV3 service worker startup, unchanged manifest permissions/host permissions, stable extension ID for the fixed source, no uncaught startup errors, operator browser actions 0.

Because AI DOM/composer files remain byte-identical, no real ChatGPT/Alice login is required for this bounded Step-2 gate. Do not fabricate live-account evidence.

Required:

`MV3_BROWSER_SANITY = PASS`
`OPERATOR_BROWSER_ACTIONS = 0`

## 18. Absolute no-real-Ozon guard

Block/count any attempted request to:

- `api-seller.ozon.ru`
- `api-performance.ozon.ru`

All provider behavior must be mocked.

Final report must state exactly:

`REAL_OZON_REQUESTS = 0`

Any attempted real Ozon request is a hard FAIL.

## 19. Acceptance criteria

`STEP2_ACCEPTED_FOR_STEP3` only if ALL required gates above pass.

Any load-bearing FAIL => `STEP2_REJECTED`.

Do not downgrade a FAIL because local implementation evidence claimed PASS.

## 20. Report publication discipline

Create validation branch exactly FROM target SHA:

`validation/ozon-step2-query-planner-coalescing-2026-08-17`

Create exactly this report:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_STEP2_QUERY_PLANNER_COALESCING_VALIDATION_2026-08-17.md`

The validation branch must contain ONLY that report file. No production fixes, reconstructed ZIP, candidate tree, harness source or other evidence files.

Commit message:

`test: validate Ozon Step 2 query planner coalescing`

Push the validation branch. Do not merge it. Do not modify development branch.

The report must include exact tested SHA, reconstruction hashes, Step-2 raw patch hashes, production hash matrix, protected-function/file evidence, every executable test/counter, logical/physical request counts and provenance, browser evidence, `OPERATOR_BROWSER_ACTIONS = 0`, `REAL_OZON_REQUESTS = 0`, and final verdict.

## 21. Final response format

Return exactly:

```text
CODEX_OZON_STEP2_VALIDATION_RESULT

tested_sha:
  93c1eae13f518d92d53bbf1af4793b35d26bc5d3

reconstruction:
  step1_baseline: PASS|FAIL
  step2_patch_raw_hashes: PASS|FAIL
  step2_patch_concat_sha: PASS|FAIL
  changed_files_exactly_3: PASS|FAIL
  protected_14_byte_identical: PASS|FAIL

planner:
  compatibility_matrix: PASS|FAIL
  metric_union_limit: PASS|FAIL
  contiguous_order_preserved: PASS|FAIL
  step1_entitlement_metadata_preserved: PASS|FAIL

worker:
  coalescing_counters: PASS|FAIL
  durable_ownership: PASS|FAIL
  restart_no_retry: PASS|FAIL
  migration_fail_closed: PASS|FAIL

projection:
  logical_metric_projection: PASS|FAIL
  fail_closed_no_retry: PASS|FAIL
  provider_error_fanout: PASS|FAIL
  thrown_execution_single_attempt: PASS|FAIL

provenance:
  logical_physical: PASS|FAIL
  batch_counts: PASS|FAIL

regression:
  step1_capability_unchanged: PASS|FAIL
  delivery_fsm_protected: PASS|FAIL
  ai_dom_composer_protected: PASS|FAIL
  seller_performance: PASS|FAIL
  security: PASS|FAIL
  no_step3_scheduler: PASS|FAIL

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
  STEP2_ACCEPTED_FOR_STEP3|STEP2_REJECTED
```

After pushing the report: STOP.

Do not implement Step 3. Wait for independent review of the full GitHub report.
