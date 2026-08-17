# Ozon Bridge Step 1 — Codex validation plan

Date: 2026-08-17
Repository: `MaksimUnimax/blood_sand`
Development branch containing this plan: `dev/ozon-v0.1.19-step1-contract-capability-2026-08-17`
**Exact implementation SHA to test: `370e45a1803976f43d27d5a9d4b5613e09a91623`**
Baseline SHA: `06bbed6649b11c6fd4b81b224ef41d8833ea267c`
Status: independent validation gate. Codex must not repair production code during this task.

---

# FULL STANDALONE PROMPT FOR CODEX

You are the independent validator for **Ozon Bridge Step 1 — Contract + Capability layer**.

This is a VALIDATION task, not a development task.

You MUST test the exact implementation commit specified below, generate evidence, publish a report on a separate validation branch, and STOP. If anything fails, record FAIL precisely. **Do not fix production code.**

## 1. Fixed identity

Repository:

`MaksimUnimax/blood_sand`

Local workspace root:

`D:\codex\Test`

Repository checkout expected at:

`D:\codex\Test\blood_sand`

Development branch that contains the plan:

`dev/ozon-v0.1.19-step1-contract-capability-2026-08-17`

EXACT TARGET IMPLEMENTATION SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Exact operator v0.1.19 baseline commit:

`06bbed6649b11c6fd4b81b224ef41d8833ea267c`

Exact operator baseline ZIP SHA-256:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

The target is an intermediate development candidate based on operator v0.1.19. It is NOT a canonical release and intentionally still reports runtime/manifest version `0.1.19`.

Do not test a moving branch HEAD as the authority. Test the exact SHA above.

## 2. Step 1 scope

The intended pipeline is:

`parse complete clicked batch -> strict operation contract validation -> resolve Seller capability at most once when required -> entitlement-plan every logical command -> existing serial provider execution`

Step 1 includes:

- strict reviewed validation for `analytics_data`, `product_queries`, `product_queries_details`;
- internal `POST /v1/seller/info` capability resolver;
- one capability probe maximum per relevant logical batch;
- zero capability probes for batches that do not need Seller entitlement information;
- operation/field-level entitlement planning;
- partial `analytics_data` metric execution when only restricted metrics must be omitted;
- planning errors with zero business request when semantics cannot safely be preserved;
- durable no-retry handling if the worker restarts while a capability probe outcome is unknown;
- logical-command identity preserved while a safe physical command may contain a reduced metric set.

Step 1 explicitly does NOT include:

- analytics request coalescing/merge;
- quota scheduler / one-minute enforcement;
- response positional-metric verifier;
- cache/prefetch;
- arbitrary new Seller operations;
- any AI DOM/composer redesign.

Those belong to later steps.

## 3. Hard safety rules

1. DO NOT modify any production source while validating.
2. DO NOT repair a failing target SHA.
3. DO NOT merge anything.
4. DO NOT force-push.
5. DO NOT call real Ozon APIs.
6. DO NOT use real Seller Client-Id, Api-Key, Performance Client Secret or Bearer tokens.
7. DO NOT log into real Ozon.
8. Provider behavior tests must use mocked/fake transport only.
9. DO NOT expose cookies, tokens, passwords or auth material in the report.
10. DO NOT change immutable `reference-*` directories.
11. Test harness files must live outside the repository, for example:
   `D:\codex\Test\qa-step1-contract-capability\`
12. The validation branch may contain only the final validation report.
13. A static grep alone is not sufficient for execution semantics. Execute actual target JS through Node/VM or the accepted browser harness where required.
14. Do not claim live Ozon/browser-account acceptance. No live account is part of this gate.
15. Fail closed: if a required behavior cannot actually be exercised, mark it INCONCLUSIVE/FAIL rather than assuming PASS.

## 4. Reconstruct exact candidate source

Fetch repository refs, then checkout detached exact target SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Record:

- `git rev-parse HEAD`
- `git status --short`
- `git log -1 --format=fuller`

The operator baseline ZIP is stored at:

`tooling\llm-api-bridges\ozon-seller\development\operator-v0.1.19\ozon-bridge-v0.1.19-extension.zip`

Verify its SHA-256 equals:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

Copy it to the external QA workspace and extract it fresh.

Patch parts are at:

`tooling\llm-api-bridges\ozon-seller\development\step1-contract-capability\patch-parts\00.patch.part`
through
`07.patch.part`

Before concatenation, verify each part SHA-256 against `PATCH_PARTS.md`.

Concatenate byte-for-byte in lexical order. Do not use a text operation that inserts separators or changes encoding/newlines. A binary concatenation method is required.

Expected full patch SHA-256:

`5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`

If that hash does not match: STOP and report `PATCH_RECONSTRUCTION_FAIL`.

Apply the patch to the fresh baseline extraction in an isolated temporary Git repo or another exact patch application method. Do not manually reproduce changes.

Expected changed-file SHA-256 after patch:

- `service_worker.js` = `b594872cff8f7049a441ffe8fe422d761069a14a48a1d32e7e54f568c7f0502a`
- `shared/ozon_contract.js` = `b8f39ded0163f45714eebff7f8c1a35242712918df5568935fbc77a442cc2987`
- `shared/ozon_provider.js` = `5e6d6bdf47e2561b0a015836d5a0f1c5ed28bd2a9625e84aadfdc49ab17deb74`

Exactly 14 other production files must remain byte-identical to baseline. In particular verify the exact SHA-256 values recorded in `STEP1_IMPLEMENTATION_AND_LOCAL_EVIDENCE.md`.

Required result:

`RECONSTRUCTION = PASS`
`PRODUCTION_CHANGED_FILES = exactly 3`
`PROTECTED_14_FILES_BYTE_IDENTICAL = PASS`

## 5. Syntax/package sanity

Run `node --check` against every production `.js` file in the reconstructed candidate.

Verify:

- manifest parses as JSON;
- manifest/runtime version remains `0.1.19` for this intermediate candidate;
- host permissions have not expanded unexpectedly;
- Seller/Performance fixed hosts remain the existing trusted hosts;
- no mutation/write Ozon operation was added;
- direct AI operation `seller_info` does not exist.

Required result:

`PRODUCTION_SYNTAX = PASS`
`MANIFEST_SECURITY_SURFACE = PASS`

## 6. Protected behavior diff audit

The only intended changed production files are:

- `service_worker.js`
- `shared/ozon_contract.js`
- `shared/ozon_provider.js`

All AI adapter / DOM / composer files must be byte-identical to operator v0.1.19.

Additionally, because `service_worker.js` contains both Step 1 logic and proven delivery logic, independently verify that the bodies/behavior of existing delivery-state-machine functions were not rewritten by this patch. At minimum cover the source regions/functions responsible for:

- `attemptAutoDelivery`
- `attemptManualBatchDelivery`
- `commitManualBatchDeliveryInsert`
- `markManualBatchDeliveryInserted`
- `completeManualBatchDelivery`
- `failManualBatchDelivery`
- `completeBatchDelivery`
- `failBatchDelivery`
- `commitBatchDeliveryInsert`
- `markBatchDeliveryInserted`
- `commitAutoDelivery`
- `completeBatchAutoDelivery`
- `completeAutoDelivery`
- `failAutoDelivery`

Use a deterministic function-body extraction or an equivalent structured diff, not visual inspection only. It is acceptable that Step 1 changes the report payload passed into the existing batch-finalization path; it is NOT acceptable to rewrite the existing delivery transition logic.

Also verify Performance credential/token transport helpers outside the three changed files are byte-identical.

Required result:

`AI_DOM_COMPOSER_PROTECTED = PASS`
`DELIVERY_FSM_PROTECTED = PASS`
`PERFORMANCE_DEPENDENCIES_PROTECTED = PASS`

## 7. Strict contract tests — actual target code

Load actual reconstructed `shared/ozon_contract.js` in Node/VM and exercise it.

### analytics_data positive cases

Must accept a valid request containing:

- `date_from` / `date_to` as `YYYY-MM-DD`;
- dimension `sku`;
- metric `revenue`;
- limit 1..1000.

Must accept reviewed RFC3339 date-time form as well.

Must accept universal metrics:

- `revenue`
- `ordered_units`

Must accept reviewed dimensions:

- `unknownDimension`, `sku`, `spu`, `day`, `week`, `month`, `year`, `category1`, `category2`, `brand`, `modelID`, `descriptionType`.

### analytics_data rejection cases

Each must fail before provider transport:

- invented metric `orders_count`;
- invented dimension;
- >14 metrics;
- invalid limit 0 or >1000;
- negative offset;
- invalid sort order;
- invalid sort key not in reviewed metric set;
- invalid filter op;
- invalid filter key;
- `brand` used as a filter key;
- unknown top-level field / transport-like injection.

### product_queries

Must reject date-only `2026-08-10` for `date_from`.
Must accept proper RFC3339 `2026-08-10T00:00:00Z`.
Must reject non-string/non-int64 SKU values.
Must reject out-of-range int64 SKU strings.
Must enforce documented page/page_size/SKU-count boundaries that exist in the target contract.
Must reject invalid `sort_by` / `sort_dir`.

### product_queries_details

Same RFC3339/SKU/sort checks.
Must preserve page_size max 100, SKU max 1000, limit_by_sku max 15.

Do not invent undocumented minimums merely for testing.

Required result:

`STRICT_CONTRACT_VALIDATION = PASS`

## 8. Capability resolver tests — actual provider code with mocked transport

Load actual candidate `shared/ozon_provider.js` with mocked `ProviderTransportCore.executeJsonOnce` and fake credentials.

For a successful mock response containing deliberately sensitive extra data such as:

- `company.inn`
- `company.ogrn`
- `company.legal_name`
- ratings
- subscription `{is_premium, type}`

verify:

1. exactly one request is made;
2. method is POST;
3. path is exactly `/v1/seller/info`;
4. host is fixed Seller API host;
5. assistant input cannot influence URL/method/headers;
6. no request body is required;
7. resolver returns only reviewed capability projection;
8. INN/OGRN/company/rating values do not appear in returned profile, diagnostics payload or report candidates;
9. subscription enum handling includes:
   `UNKNOWN`, `UNSPECIFIED`, `PREMIUM`, `PREMIUM_LITE`, `PREMIUM_PLUS`, `PREMIUM_PRO`;
10. unknown/unrecognized provider subscription becomes safe `UNKNOWN`, not a guessed tier.

Mock HTTP 500/403/transport failure and verify:

- no hidden retry;
- one attempted probe maximum;
- returned capability state is unknown;
- only sanitized error code/status is exposed.

Direct assistant command:

`OZON_API_V1 {"operation":"seller_info","params":{}}`

must remain unsupported and execute zero provider requests.

Required result:

`CAPABILITY_RESOLVER = PASS`
`SELLER_INFO_PRIVACY = PASS`
`SELLER_INFO_NOT_AI_CALLABLE = PASS`

## 9. Pure entitlement planner matrix

Execute actual exported capability planning functions.

Use a fixed `atMs` so history tests are deterministic.

### analytics_data

A. universal `revenue` / `ordered_units`, universal dimension, recent period:
- no capability required;
- action execute;
- physical command unchanged.

B. `revenue + hits_view`, capability `UNSPECIFIED`:
- action execute;
- physical metrics contain only `revenue`;
- planning marks partial;
- `hits_view` is explicitly omitted;
- status `SUPPORTED_BUT_NOT_ENTITLED`.

C. `revenue + hits_view`, capability unknown:
- execute universal subset only;
- partial true;
- status `ENTITLEMENT_UNKNOWN`;
- must NOT claim seller has no subscription.

D. only `hits_view`, `UNSPECIFIED`:
- reject with `SUBSCRIPTION_REQUIRED`;
- business analytics request count later must be zero.

E. only restricted metrics, capability unknown:
- reject `ENTITLEMENT_UNKNOWN`;
- business analytics request zero.

F. restricted dimension such as `brand`, not entitled:
- reject whole logical command;
- do not remove/change dimension and continue.

G. restricted sort/filter not entitled:
- reject whole command;
- do not silently remove sort/filter.

H. history older than 3 months without Plus/Pro:
- reject.

I. `PREMIUM_PLUS` and `PREMIUM_PRO`:
- reviewed restricted analytics scope executes unchanged.

### product_queries / details

J. recent `product_queries`, `UNSPECIFIED`:
- execute but planning marks partial-by-subscription response scope.

K. history older than one month, `UNSPECIFIED`:
- reject `SUBSCRIPTION_REQUIRED`.

L. old history with `PREMIUM`, `PREMIUM_PLUS` or `PREMIUM_PRO`:
- execute.

M. `product_queries_details` restricted sort `BY_VIEWS`/`BY_POSITION`/`BY_CONVERSION`:
- `PREMIUM` and `PREMIUM_PLUS` execute;
- `UNSPECIFIED` rejects subscription-required;
- `PREMIUM_PRO` must be treated conservatively as entitlement unknown for this specific sort because the frozen reviewed contract text names Premium/Premium Plus and does not explicitly establish Pro for these sort keys.

Required result:

`ENTITLEMENT_PLANNER_MATRIX = PASS`

## 10. Batch-level one-probe invariant — actual service_worker logic

This is a load-bearing test. Do not satisfy it with static grep.

Build an external Node VM harness around the actual candidate `service_worker.js`, mocking Chrome storage/runtime and provider functions as needed. Test the actual Step 1 batch-planning path. Test-only instrumentation may be appended to an in-memory/source copy in the external QA directory to expose internal functions, but the candidate files themselves must remain untouched.

Use deterministic fake provider counters.

### Required batch cases

1. Batch of 30 recent `product_queries` commands:
   - capability sensitive;
   - exactly ONE `/v1/seller/info` capability probe for the entire batch;
   - NOT 30 probes;
   - Step 1 does not coalesce business commands, so 30 logical business executions may remain 30 mocked business calls;
   - probe is not represented as a 31st logical `OZON_RESULT` item.

2. Batch of 30 universal recent `analytics_data` commands using only `revenue`/`ordered_units` and universal dimensions:
   - ZERO seller capability probes;
   - existing serial business execution remains.

3. Mixed analytics command `revenue + hits_view`, mocked capability `UNSPECIFIED`:
   - exactly one capability probe for the batch;
   - physical analytics request contains only `revenue`;
   - logical report still identifies original logical command and planning omission;
   - report says partial / omitted `hits_view`;
   - one analytics business call.

4. All-restricted analytics command, `UNSPECIFIED`:
   - one capability probe;
   - ZERO analytics business calls;
   - one logical planning-error result;
   - `external_request_executed:false` for the business result;
   - capability probe metadata may state probe was executed, but the probe must not masquerade as the business request.

5. Capability probe returns unknown/HTTP error, mixed metrics:
   - no retry of capability probe;
   - universal metric subset may execute;
   - restricted facts remain entitlement unknown.

6. Capability probe returns unknown and all requested facts are restricted:
   - zero business request;
   - entitlement unknown result.

7. Simulate persisted batch state with capability resolution `state:"requesting"` owned by a DIFFERENT/previous `WORKER_SESSION_ID`:
   - current worker performs ZERO second capability probes;
   - marks outcome unknown/no-retry;
   - planning remains fail-closed.

8. Performance-only batch, e.g. `performance_campaigns`:
   - ZERO Seller capability probes;
   - existing Performance execution path remains selected.

Required result:

`ONE_CAPABILITY_PROBE_PER_RELEVANT_BATCH = PASS`
`ZERO_PROBE_FOR_UNIVERSAL_OR_PERFORMANCE_BATCH = PASS`
`PROBE_RESTART_NO_RETRY = PASS`

## 11. Logical vs physical request/report test

Using actual provider + contract with mocked transport:

For logical analytics command with metrics `["revenue","hits_view"]` and a Step 1 plan permitting only `revenue`:

- provider HTTP body must contain only `revenue`;
- logical command fingerprint/report identity must correspond to original logical request;
- physical command fingerprint must be distinct when transformed;
- report planning metadata must state omitted metric;
- provider error path must retain planning metadata as well;
- no raw seller-info response fields may appear.

Required result:

`LOGICAL_PHYSICAL_PROVENANCE = PASS`

## 12. Security and regression matrix

Using actual candidate sources, verify:

- arbitrary assistant `url`, `host`, `method`, `headers`, `Authorization`, `Client-Id`, `Api-Key`, `Client Secret` cannot alter provider transport;
- mutation operations remain blocked/not allowlisted;
- `posting_fbs_get` remains blocked;
- no customer PII collection surface was added;
- malformed/pre-execution validation errors execute zero provider business requests;
- no hidden retry was added to capability probe or business requests;
- no hidden pagination/fan-out/report polling was added;
- no arbitrary generic data-size/depth/key limits or silent truncation were reintroduced by Step 1;
- Performance API fixed host/auth lifecycle still works in a mocked regression (`performance_campaigns` minimum);
- Seller universal operation such as `roles` remains unchanged and does not require a capability probe.

Required result:

`SECURITY_REGRESSION = PASS`
`PERFORMANCE_REGRESSION = PASS`
`SELLER_BASELINE_REGRESSION = PASS`

## 13. Browser-extension package sanity using accepted QA harness

Use the already-qualified Windows QA browser route:

- Puppeteer `25.4.0`;
- Chrome for Testing `151.0.7922.47`;
- Node `child_process.spawn()`;
- `--remote-debugging-port=0` + `DevToolsActivePort`;
- runtime `browser.installExtension()`;
- dedicated QA profile, not user's normal Chrome profile.

Load the reconstructed Step 1 candidate extension automatically.

Verify at minimum:

- extension runtime install PASS;
- expected extension inventory exists;
- MV3 service-worker target starts without uncaught startup error;
- manifest permissions/hosts are the expected unchanged set;
- no operator ZIP install/reinstall is required;
- operator browser actions = 0.

Because AI DOM/composer files are byte-identical, this gate does not require login to real ChatGPT/Alice. Do not fabricate a live-account PASS.

If practical, run a synthetic/no-login smoke check that does not contact Ozon. Do not weaken source-hash proof by replacing it with a synthetic DOM claim.

Required result:

`MV3_BROWSER_SANITY = PASS`

## 14. No real provider traffic assertion

Instrument the test environment so any attempted network request to:

- `api-seller.ozon.ru`
- `api-performance.ozon.ru`

would be detected and fail the validation.

The final report must state:

`REAL_OZON_REQUESTS = 0`

## 15. Final acceptance criteria

Step 1 may receive `STEP1_ACCEPTED_FOR_STEP2` only if ALL required items are PASS:

- exact reconstruction and hashes;
- only three intended production files changed;
- protected 14 files byte-identical;
- delivery FSM protected;
- strict contract validation;
- capability resolver/privacy;
- entitlement matrix;
- one-probe-per-batch invariant;
- restart no-retry;
- logical/physical provenance;
- security/Performance/Seller regressions;
- MV3 browser sanity;
- zero real Ozon requests.

Any load-bearing FAIL => `STEP1_REJECTED`.

Do not downgrade a real FAIL into a warning merely because local implementation evidence previously claimed PASS.

## 16. Report

Create exactly:

`tooling\llm-api-bridges\ozon-seller\validation\reports\OZON_STEP1_CONTRACT_CAPABILITY_VALIDATION_2026-08-17.md`

Report must include:

- exact target SHA;
- baseline SHA;
- reconstruction hashes;
- changed-file matrix;
- protected-file hash matrix;
- test environment versions;
- each required test/result above;
- provider call counters for load-bearing cases;
- safe request shapes/paths (no secret values);
- browser sanity evidence;
- any FAIL/INCONCLUSIVE with exact reproduction;
- `REAL_OZON_REQUESTS = 0`;
- final verdict.

Do not include credential values or unrelated account data.

## 17. Publish validation report

Create validation branch FROM EXACT TARGET IMPLEMENTATION SHA:

`validation/ozon-step1-contract-capability-2026-08-17`

The branch must start from:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Commit ONLY the report file.

Before commit verify:

`git diff --cached --name-only`

contains exactly:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_STEP1_CONTRACT_CAPABILITY_VALIDATION_2026-08-17.md`

Commit message:

`test: validate Ozon Step 1 contract capability layer`

Push the validation branch.

DO NOT merge it.
DO NOT modify the development branch.
DO NOT modify production source.

## 18. Final response format

Return exactly this compact structure:

```text
CODEX_OZON_STEP1_VALIDATION_RESULT

tested_sha:
  370e45a1803976f43d27d5a9d4b5613e09a91623

reconstruction:
  patch_sha: PASS|FAIL
  changed_files_exactly_3: PASS|FAIL
  protected_14_byte_identical: PASS|FAIL

contract:
  strict_validation: PASS|FAIL

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

After producing/pushing the report: STOP.

Do not implement Step 2.
Do not fix Step 1.
Wait for review.