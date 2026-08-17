# Ozon Bridge Step 3 — independent Codex validation plan

Date: 2026-08-17
Status: standalone validation prompt. Step 4 remains blocked.

# FULL STANDALONE CODEX PROMPT

You are independently validating Ozon Bridge Step 3: **global analytics quota scheduler + response verifier + safe errors**.

Live GitHub is the source of truth.

Repository:

`MaksimUnimax/blood_sand`

Project directory:

`tooling/llm-api-bridges/ozon-seller/`

Exact Step-3 target SHA to test:

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

Do NOT test a moving branch HEAD.

Step-3 branch base / Step-2 acceptance decision:

`51a0b16c51a60b2dc8e656b7fd41eb6d60c446ad`

Accepted Step-2 implementation target:

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Accepted Step-1 production-logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Exact operator ZIP SHA-256:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

Canonical release/evidence lineage remains v0.1.11. The operator v0.1.19 candidate is development input, not a canonical release.

## 1. Hard scope and stop rules

Validate Step 3 only.

Do NOT:

- repair production code during validation;
- implement Step 4 cache/prefetch, cross-turn reusable supersets, semantic aliases or integrated live acceptance;
- modify the development branch;
- modify older validation reports;
- contact real Ozon Seller or Performance endpoints;
- require operator browser actions/manual extension installation;
- merge the validation branch.

Test exact target, create a report-only validation branch from that target, push the report, and STOP.

Any load-bearing FAIL => `STEP3_REJECTED`.

`STEP3_ACCEPTED_FOR_STEP4` is allowed only if every required gate below passes.

## 2. Preserve accepted Step 0/1/2

Do not reopen Step 0. Use the accepted Windows route:

`fixed unpacked source -> Node child_process.spawn() -> Chrome for Testing 151.0.7922.47 -> --remote-debugging-port=0 -> DevToolsActivePort -> Puppeteer 25.4.0 connect -> browser.installExtension() -> assertions -> report`

Dedicated QA profile. Operator browser actions = 0.

Preserve Step-1 capability/entitlement invariants and Step-2 contiguous safe coalescing/provenance. In particular:

- at most one internal `/v1/seller/info` probe per relevant clicked batch;
- zero Seller capability probes for universal/performance-only batches;
- capability probe is NOT an `analytics_data` quota request;
- Step-2 coalescing happens before Step-3 physical-request scheduling;
- one coalesced physical analytics group consumes one quota slot;
- no replay after an already-requesting previous worker session;
- no changes to proven AI DOM/composer/delivery ownership semantics.

## 3. Clean exact checkout

Detach exactly at:

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

Record exact HEAD, clean status, Git/Python/Node/Puppeteer/CFT/Windows versions.

Required:

`TARGET_SHA_EXACT = PASS`
`TARGET_TREE_CLEAN_BEFORE_TEST = PASS`

Generated candidates/tests stay outside repository tree until the final report commit.

## 4. Reconstruct accepted Step-2 candidate

Independently reconstruct the pinned operator baseline using the accepted reconstruction-v2 artifacts, then apply the accepted raw Step-1 patch and accepted raw Step-2 patch.

Required checkpoints:

- operator ZIP size `100320`, SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`;
- Step-1 concat patch SHA-256 `5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`;
- Step-2 concat patch SHA-256 `93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`;
- accepted Step-2 hashes before Step 3:
  - `service_worker.js` `6e50b48a9e908a055f815cc5d683ae565043317fffe050a57eeedc791961996f`
  - `shared/ozon_contract.js` `f75c45e29035c82115eb22da36cad5e4fba53ec04f6bfdd7080557587da06bac`
  - `shared/ozon_provider.js` `983b54fbe78e34c02555b28532792b6c786f200da9e85b67e310e023054e5f8d`.

Required:

`STEP2_BASELINE_RECONSTRUCTION = PASS`

## 5. Verify/apply Step-3 patch as raw Git bytes

Read:

`development/step3-quota-verifier-errors/PATCH_PARTS.md`

Extract all eight patch parts using raw Git object bytes, not Windows text redirection.

Expected parts:

- `00`: 5767 / `b53384b63b105a9146b535c89dbb202c8da2425dfe518046c8081953e827bcad`
- `01`: 5767 / `8e571f418220327f0c04a82d646ef56fd6e39a7f3dffe8d0b454f878d0d0cbdb`
- `02`: 5743 / `6ea75bcfd88ab9f6cfae064bd742a583668ec502b5bb9cf80994e14a8e8412ee`
- `03`: 5795 / `3c257a41104f74401b00ef1a5d6e2444d8b938d98372c959fd39e08ae388c266`
- `04`: 5760 / `e71abd19c2f2b38ee904de1d6abf1ad9026aa64f4daee1ad6dd3a243c5dcce05`
- `05`: 5798 / `4c42e88ca3a34c36a17993847d049f7555de2438e9e8c312e5b738be775378dc`
- `06`: 5799 / `2ce324ea439b9091026caa9e9f5e349e27b3590abe8c601a645fe538f49aa839`
- `07`: 2301 / `f4d6d55ed35b6576863fc724919b6c5779cf1f7f6061d22506987fcbc9ca00f8`

Expected concatenated Step-3 patch:

- size `42730`;
- SHA-256 `9eee85d648a212e96658514dea8f031223d255cf93c7c73a14107c50817919f5`.

Apply with no manual production edits.

Required:

`STEP3_PATCH_RAW_HASHES = PASS`
`STEP3_PATCH_CONCAT_SHA = PASS`
`STEP3_PATCH_APPLY = PASS`

## 6. Exact production delta/protected surfaces

Exactly six production files differ from accepted Step 2:

- `manifest.json` => `6e314da445166d390a32f3f3afdfdf86a97e2af6eeed0c3cd4a47d34d60550da`
- `service_worker.js` => `bfe2aa15b09f48dffb2dd7ff913f6b527c07fca09e462759dffb30d9dd72c514`
- `shared/ozon_contract.js` => `e303b74b266c685f1ae20b9e3b726211f7b65c56490a3ed09693b84489e58b45`
- `shared/ozon_provider.js` => `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js` => `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/runtime_names.js` => `f66a4fc004a59981c59f715ba335c4b2b4b8f750789befb17b045894bb55ac24`.

The other eleven production files must be byte-identical to accepted Step 2.

Manifest host permissions must be unchanged; only `alarms` may be added to extension permissions.

Prove by raw function-body comparison that Step-1 `ensureBatchCapabilityAndPlanning`, Step-2 `buildBatchQueryPlan` and `ensureBatchQueryPlanning`, and existing finalize/delivery functions are unchanged. `processBatchQueue` is intentionally changed as the Step-3 quota integration point and is not expected byte-identical.

Required:

`CHANGED_FILES_EXACTLY_6 = PASS`
`PROTECTED_11_BYTE_IDENTICAL = PASS`
`STEP1_STEP2_PLANNERS_PROTECTED = PASS`
`DELIVERY_FSM_PROTECTED = PASS`
`AI_DOM_COMPOSER_PROTECTED = PASS`
`MANIFEST_SCOPE_EXACT = PASS`
`JS_SYNTAX = PASS`

## 7. Persistent identity/privacy

Use actual candidate scheduler code and deterministic crypto/time/storage mocks.

Verify:

- same Seller Client-Id with different Api-Key values => same internal account hash/bucket;
- credential revision changes on Api-Key rotation;
- different Seller Client-Id => independent account bucket;
- persistent state never contains raw Client-Id or Api-Key;
- AI-facing reports/rate metadata never contain account hash or credential revision;
- quota state schema/family is internal and fixed, not assistant-controllable.

Required:

`QUOTA_IDENTITY_PRIVACY = PASS`
`ACCOUNT_BUCKET_ROTATION = PASS`

## 8. Reviewed quota-family boundary

The only new explicit temporal bucket in Step 3 is:

`seller.analytics_data.v1`

with minimum interval `60000 ms` for physical `analytics_data` provider requests.

Verify:

- unrelated Seller operations are not given an invented 60-second delay;
- Performance operations are not given this Seller analytics delay;
- internal `/v1/seller/info` capability probe does not consume the analytics-data bucket;
- a Step-2 coalesced analytics group consumes one permit, not one permit per logical member.

Required:

`ANALYTICS_QUOTA_FAMILY_SCOPE = PASS`
`COALESCED_ONE_QUOTA_SLOT = PASS`

## 9. Global concurrency across owners/AIs/tabs

Use actual scheduler + durable owner state with mocked provider transport.

At the same deterministic time, two independent owners/conversations/tabs representing ChatGPT/Alice and the SAME Seller account both become eligible for incompatible physical analytics calls.

Required:

- exactly ONE provider analytics call is dispatched;
- the other owner becomes durable `quota_waiting`;
- persistent `next_allowed_at` is exactly first dispatch + 60000 ms absent longer Retry-After;
- no raw credential data enters owner state/diagnostics;
- different Seller account may dispatch independently at that same time.

Also test multiple simultaneous acquire attempts; exactly one permit may be granted for the same account/family window.

Required:

`GLOBAL_QUOTA_CONCURRENCY = PASS`
`DIFFERENT_ACCOUNT_INDEPENDENCE = PASS`

## 10. Durable wait + MV3 restart/alarm resume

Test an owner with two incompatible analytics commands:

1. first physical analytics request executes;
2. second remains pending and batch state becomes `quota_waiting`;
3. before due time, repeated processing executes ZERO additional provider calls;
4. change `WORKER_SESSION_ID` / simulate MV3 worker restart while still waiting;
5. startup/alarm scan preserves no-request state;
6. at due time, alarm/resume permits exactly one second request.

Waiting is different from an already-`requesting` unknown outcome. Existing Step-1/2 no-replay behavior for a previous-worker `requesting` provider attempt must remain intact.

Verify earliest future wait is re-scheduled when several owners are waiting.

Required:

`QUOTA_WAIT_DURABLE = PASS`
`QUOTA_WAIT_RESTART_RESUME = PASS`
`REQUESTING_RESTART_NO_REPLAY = PASS`
`MV3_ALARM_RESUME = PASS`

## 11. Retry-After semantics — extension only, never retry

For a dispatched analytics call whose local next-allowed is +60s:

- `Retry-After: 120` extends persistent next-allowed to +120s;
- a shorter Retry-After cannot reduce an already later next-allowed;
- valid HTTP-date Retry-After is honored when later;
- invalid Retry-After does not invent a wait;
- no automatic provider retry occurs for 429 or any other response;
- a later logical request remains waiting until effective next-allowed.

Required:

`RETRY_AFTER_EXTENDS_ONLY = PASS`
`ZERO_AUTOMATIC_PROVIDER_RETRY = PASS`

## 12. Scheduler failure paths

Simulate persistent quota storage read/write failure before dispatch.

Required:

- analytics provider calls = 0;
- safe logical error uses `PROVIDER_QUOTA_STATE_UNAVAILABLE` or equivalent frozen code;
- `external_request_executed:false`;
- scheduler is not bypassed.

Missing Seller credentials must likewise execute zero provider calls and preserve the existing credential error path.

Required:

`QUOTA_STORAGE_FAIL_CLOSED = PASS`
`MISSING_CREDENTIALS_ZERO_PROVIDER = PASS`

## 13. Analytics response verifier

Use actual candidate `verifyProviderResponse` and provider execution.

For physical metrics `[revenue, ordered_units, hits_view]`, verify success for valid reviewed forms including `result.data[].metrics`, `result.totals`, data-only, totals-only, and both where cardinality equals 3.

Hard fail `PROVIDER_RESPONSE_CONTRACT_MISMATCH` when:

- body/result has unsupported shape;
- any data-row metrics cardinality differs;
- totals cardinality differs;
- no verifiable analytics metric surface exists.

For HTTP-success but verifier failure:

- exactly ONE provider fetch/attempt happened;
- `external_request_executed:true`;
- zero retry;
- no guessed logical projection.

Non-analytics successful operations must not suddenly require an invented undocumented broad response schema.

Required:

`ANALYTICS_RESPONSE_VERIFIER = PASS`
`VERIFIER_FAIL_CLOSED_ONE_ATTEMPT = PASS`
`NON_ANALYTICS_VERIFIER_SCOPE = PASS`

## 14. Coalesced verifier/error fanout

For one Step-2 coalesced physical analytics group with multiple logical members, return a malformed cardinality response.

Required:

- exactly one physical request;
- every logical member gets a sanitized contract-mismatch error;
- shared physical provenance remains explicit;
- original logical identities/planning metadata remain separate;
- zero retry.

Also verify one provider HTTP error fans out safely to group members without N physical attempts.

Required:

`COALESCED_VERIFIER_FANOUT = PASS`
`COALESCED_PROVIDER_ERROR_ONE_ATTEMPT = PASS`

## 15. Safe structured errors/provenance

Mock provider 429, 401/403, generic 4xx and 5xx responses plus a thrown fetch/network failure.

AI-visible errors must be sanitized structured data containing reviewed fields such as source/category/http status/safe provider code/message, `automatic_retry:false`, and accurate `external_request_executed`.

Raw provider body, e-mail/phone/secret-bearing text, auth headers and credentials must not reach AI output.

Transport fetch throw occurs after an attempted external request and must be marked `external_request_executed:true` / attempted, with no retry.

Pre-fetch validation/credentials/quota-state failures remain external=false.

Retry-After may appear as safe rate metadata; credential/account hashes must not.

Required:

`SAFE_ERROR_NORMALIZATION = PASS`
`REQUEST_ATTEMPT_PROVENANCE = PASS`
`SECRET_PRIVACY = PASS`

## 16. Step-1/Step-2/security regressions

Re-run actual-code regression proving:

- one capability probe for 30 relevant `product_queries` commands;
- zero capability probes for universal analytics and Performance-only work;
- 30 compatible universal analytics still coalesce to one physical analytics call and therefore one quota slot;
- incompatible Step-2 shapes are not merged;
- contiguous physical ordering remains preserved around unrelated commands;
- arbitrary assistant URL/host/method/header/auth injection remains blocked;
- mutations and `posting_fbs_get` remain blocked;
- no hidden pagination/report polling;
- no Step-4 cache/prefetch/semantic alias was added.

Required:

`STEP1_CAPABILITY_REGRESSION = PASS`
`STEP2_COALESCING_REGRESSION = PASS`
`SELLER_PERFORMANCE_SECURITY_REGRESSION = PASS`
`NO_STEP4_IMPLEMENTED = PASS`

## 17. MV3 browser sanity

Load reconstructed candidate with the accepted Puppeteer/CFT harness.

Verify:

- 17 production files;
- runtime extension install;
- MV3 service worker starts without uncaught startup error;
- `alarms` permission is present;
- host permissions unchanged;
- quota alarm listener can be registered;
- fixed-source extension ID stable during run;
- operator browser actions = 0.

No real ChatGPT/Alice login is required because AI DOM/composer files are byte-identical. Do not fabricate live-account evidence.

Required:

`MV3_BROWSER_SANITY = PASS`
`OPERATOR_BROWSER_ACTIONS = 0`

## 18. Absolute no-real-Ozon guard

Block/count any attempted request to:

- `api-seller.ozon.ru`
- `api-performance.ozon.ru`

All provider behavior in validation must be mocked.

Final report must state:

`REAL_OZON_REQUESTS = 0`

Any real Ozon request attempt is a hard FAIL.

## 19. Acceptance criteria

`STEP3_ACCEPTED_FOR_STEP4` only if every required gate above passes.

Any load-bearing FAIL => `STEP3_REJECTED`.

Do not downgrade a FAIL because local implementation evidence claimed PASS.

## 20. Report publication discipline

Create validation branch exactly FROM target SHA:

`validation/ozon-step3-quota-verifier-errors-2026-08-17`

Create exactly this report:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_STEP3_QUOTA_VERIFIER_ERRORS_VALIDATION_2026-08-17.md`

Validation branch must contain ONLY that report file. No production fixes, candidate tree, reconstructed ZIP, test harness source or other evidence files.

Commit message:

`test: validate Ozon Step 3 quota verifier errors`

Push branch. Do not merge. Do not modify development branch.

Report exact tested SHA, reconstruction/patch hashes, production hash matrix, all counters/timing states, privacy evidence, response-verifier/error results, regression/browser evidence, `OPERATOR_BROWSER_ACTIONS = 0`, `REAL_OZON_REQUESTS = 0`, and final verdict.

## 21. Final response format

Return exactly:

```text
CODEX_OZON_STEP3_VALIDATION_RESULT

tested_sha:
  eae8988f5baf8c7ead5a82371c9b1057295c906d

reconstruction:
  step2_baseline: PASS|FAIL
  step3_patch_raw_hashes: PASS|FAIL
  step3_patch_concat_sha: PASS|FAIL
  changed_files_exactly_6: PASS|FAIL
  protected_11_byte_identical: PASS|FAIL

quota:
  identity_privacy: PASS|FAIL
  family_scope: PASS|FAIL
  global_concurrency: PASS|FAIL
  different_account_independence: PASS|FAIL
  coalesced_one_slot: PASS|FAIL
  durable_wait: PASS|FAIL
  restart_resume: PASS|FAIL
  requesting_no_replay: PASS|FAIL
  retry_after_extends_only: PASS|FAIL
  zero_automatic_retry: PASS|FAIL
  storage_fail_closed: PASS|FAIL

verifier:
  analytics_response: PASS|FAIL
  fail_closed_one_attempt: PASS|FAIL
  coalesced_fanout: PASS|FAIL
  safe_errors: PASS|FAIL
  request_attempt_provenance: PASS|FAIL

regression:
  step1_capability: PASS|FAIL
  step2_coalescing: PASS|FAIL
  delivery_fsm_protected: PASS|FAIL
  ai_dom_composer_protected: PASS|FAIL
  seller_performance_security: PASS|FAIL
  no_step4: PASS|FAIL

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
  STEP3_ACCEPTED_FOR_STEP4|STEP3_REJECTED
```

After pushing the report: STOP.

Do not implement Step 4. Wait for independent review of the full GitHub report.
