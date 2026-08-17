# Ozon Bridge Step 1 — bounded Codex retest after reconstruction repair

Date: 2026-08-17
Repository: `MaksimUnimax/blood_sand`
Status: standalone independent validation prompt; Step 2 remains blocked.

## Review context

The first independent validation report on `validation/ozon-step1-contract-capability-2026-08-17` correctly returned `STEP1_REJECTED`, but it stopped at the reconstruction gate before any Step 1 functional test. The concrete blocker was reconstruction evidence, not a demonstrated production-logic failure:

- the GitHub baseline ZIP stored at the old frozen target was only 15,009 bytes and did not match the pinned operator ZIP;
- the exact operator-supplied baseline was recovered from the operator's ChatGPT Library, size 100,320 bytes, SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`;
- the old Windows validation hashed working-tree copies of textual patch parts, while the expected hashes are raw committed bytes. No root `.gitattributes` pinned EOL behavior at the old target.

A bounded reconstruction-only repair was committed without changing Step 1 production logic.

Exact repaired validation target:

`f1a23c5c20c1cdc6b3bcbb91f5d9773413960b93`

Original Step 1 logic implementation commit:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Exact operator baseline pin commit:

`06bbed6649b11c6fd4b81b224ef41d8833ea267c`

The repaired target is the ONLY target for this retest. Do not substitute the moving development branch HEAD.

---

# FULL STANDALONE CODEX PROMPT

You are independently validating Ozon Bridge Step 1 (Contract + Capability layer) after one bounded reconstruction-artifact repair.

Live GitHub repository is the source of truth:

`MaksimUnimax/blood_sand`

Project directory:

`tooling/llm-api-bridges/ozon-seller/`

Exact target SHA to test:

`f1a23c5c20c1cdc6b3bcbb91f5d9773413960b93`

Do not test a moving branch HEAD.

Original Step 1 production-logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Baseline pin commit:

`06bbed6649b11c6fd4b81b224ef41d8833ea267c`

Exact operator ZIP SHA-256:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

This is an operator/user-supplied development baseline. It is NOT a canonical GitHub v0.1.19 release. Canonical release/evidence lineage remains v0.1.11.

## 1. Hard scope and stop rules

Validate Step 1 only.

Do NOT:

- implement or begin Step 2 query planner/coalescing;
- implement Step 3 quota scheduler/verifier/errors;
- implement Step 4 cache/prefetch;
- repair production code during validation;
- modify the development branch;
- modify the old rejected validation branch/report;
- contact real Ozon Seller or Performance API endpoints;
- require operator browser actions or manual extension installation.

Test the exact target, create a report-only validation branch from that exact target, push the report, and STOP.

Any load-bearing FAIL means `STEP1_REJECTED`.

`STEP1_ACCEPTED_FOR_STEP2` is allowed only if every required gate below passes.

## 2. Preserve Step 0

The Windows/Puppeteer QA harness is already accepted. Do not reopen or re-qualify Step 0.

Use the accepted route:

`fixed unpacked source -> Node child_process.spawn() -> Chrome for Testing 151.0.7922.47 -> --remote-debugging-port=0 -> DevToolsActivePort -> Puppeteer 25.4.0 connect -> browser.installExtension() -> assertions -> report`

Use a dedicated QA profile, not the operator's normal Chrome profile.

Operator browser actions must be zero.

## 3. Clean exact checkout

Start from a clean repository and detach at exactly:

`f1a23c5c20c1cdc6b3bcbb91f5d9773413960b93`

Record:

- `git rev-parse HEAD`;
- `git status --short` before testing;
- Git version;
- Python version;
- Node version;
- Puppeteer version;
- Chrome for Testing version;
- Windows version.

Required:

`TARGET_SHA_EXACT = PASS`
`TARGET_TREE_CLEAN_BEFORE_TEST = PASS`

All test-generated files/copies must live outside the candidate repository tree until the final report commit.

## 4. Prove the bounded repair did not alter Step 1 logic

Compare parent `390e3db45f76e3795f2624f4b8a02679b108bf9f` to target `f1a23c5c20c1cdc6b3bcbb91f5d9773413960b93`.

The target commit must add exactly these seven reconstruction files and nothing else:

- `development/operator-v0.1.19/exact-reconstruction/00.b64.part`
- `development/operator-v0.1.19/exact-reconstruction/01.b64.part`
- `development/operator-v0.1.19/exact-reconstruction/02.b64.part`
- `development/operator-v0.1.19/exact-reconstruction/03.b64.part`
- `development/operator-v0.1.19/exact-reconstruction/04.b64.part`
- `development/operator-v0.1.19/exact-reconstruction/RECONSTRUCTION.md`
- `development/operator-v0.1.19/exact-reconstruction/reconstruct_operator_v0.1.19.py`

Additionally compare Git blob IDs at original Step 1 SHA `370e45a1803976f43d27d5a9d4b5613e09a91623` versus repaired target for:

- `development/step1-contract-capability/PATCH_PARTS.md`;
- `development/step1-contract-capability/STEP1_IMPLEMENTATION_AND_LOCAL_EVIDENCE.md`;
- every `development/step1-contract-capability/patch-parts/00.patch.part` through `07.patch.part`.

All those Step 1 implementation/evidence blobs must be identical.

Required:

`REPAIR_SCOPE_EXACTLY_7_RECONSTRUCTION_FILES = PASS`
`STEP1_LOGIC_ARTIFACTS_UNCHANGED = PASS`

## 5. Reconstruct exact operator baseline from the repaired bundle

Do NOT use the old file:

`development/operator-v0.1.19/ozon-bridge-v0.1.19-extension.zip`

It was the concrete blocker in the first validation and is not the pinned binary.

Use only:

`development/operator-v0.1.19/exact-reconstruction/`

The five no-newline base64 part expectations are:

- `00.b64.part`: size 10000; SHA-256 `c8b027cd94c38768dc998f2063a4e9ae2750cbf58a71935b45f929b79f7a725a`
- `01.b64.part`: size 20000; SHA-256 `e1046ece6c5034546ddca1cda846b6a798fbcb649da89664a2d644cb18581270`
- `02.b64.part`: size 40000; SHA-256 `ac55015397c0eaebd49729bc3ae868262719ae598e8cc7a3b50af7f7f1caf541`
- `03.b64.part`: size 40000; SHA-256 `a84658702b3377f4f5a43692bff8177edd5da32fd273975369697b33c0ec43cc`
- `04.b64.part`: size 23760; SHA-256 `97bdcf5e49da729eaf17d09ec1f658866d8a13c79363d2d210ae171250be70a6`

Expected concatenated base64:

- size 133760 bytes;
- SHA-256 `2e0e44d85389c9deeab4650efe6a310b3be2204cfc3cd0df1d8c61c8f88c733c`.

Run the supplied script from the exact target:

`reconstruct_operator_v0.1.19.py`

Write the decoded ZIP into a dedicated external QA directory.

It must print `RECONSTRUCTION_PASS` and the decoded ZIP must be:

- size 100320 bytes;
- SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`.

Inspect the ZIP. It must contain exactly the expected 17 production files and no hidden extra production payload.

Required:

`BASELINE_RECONSTRUCTION = PASS`
`BASELINE_ZIP_SHA = PASS`
`BASELINE_17_FILES = PASS`

## 6. Extract raw Step 1 patch bytes correctly

Do not use Windows working-tree text bytes as hash authority for the eight patch parts.

For each part, extract raw committed bytes from the exact target using Python subprocess or an equivalent byte-preserving Git plumbing route, for example conceptually:

`subprocess.run(["git", "show", f"{TARGET_SHA}:{repo_path}"], stdout=<binary file>, check=True)`

Do not use PowerShell text redirection to manufacture the raw part files.

Expected raw SHA-256:

1. `00.patch.part` — `8146303b3ac046f07d841873257d0207117490a3b3977fac523b5dc572c5292b`
2. `01.patch.part` — `4d20c05d750adb43863a6d5d386eb6647539e78b5f495e5c8b9eed3af02e6f28`
3. `02.patch.part` — `23dc7cc98b0877f97c67358263097e66f44f17fe5b55c88d8a3a09f283dddf61`
4. `03.patch.part` — `49e248a74638e51bb39e5d6f33929b1faf71b80b5db9ceedb00e767c95fa654d`
5. `04.patch.part` — `508c42a05f872a24bc7d8d279cd7777b95158b1a3fe76cbe58731663865f35f1`
6. `05.patch.part` — `5906016f7c72b660ba0debd99c7c758ef4f7b60c609dbce11bb08e1fc03504c0`
7. `06.patch.part` — `5dfd53ac85b8d28b637010dc5a61910d25e5e539a52687deeef796411fe8570d`
8. `07.patch.part` — `f752e2176c5a58b690dbf287d44d06fec92ede2ad89ce149baf484bc38bcd1d5`

Concatenate byte-for-byte in lexical order.

Expected full patch SHA-256:

`5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`

Required:

`PATCH_PART_RAW_HASHES = PASS`
`PATCH_CONCAT_SHA = PASS`

If either fails, report exact observed values and stop; do not improvise or edit patch bytes.

## 7. Reconstruct candidate and verify exact production delta

Extract the exact reconstructed baseline ZIP fresh into an external candidate directory.

Apply the exact concatenated Step 1 patch without manual production edits.

The resulting candidate must contain the same 17 production-file inventory.

Exactly THREE production files must differ from the operator baseline:

1. `service_worker.js`
   - baseline `8b8190803b28daf9da8b852bddbcfb1d6c079bb93eee9eda35fed516764458ec`
   - candidate `b594872cff8f7049a441ffe8fe422d761069a14a48a1d32e7e54f568c7f0502a`
2. `shared/ozon_contract.js`
   - baseline `b3497d3cec56a7591dce0f266ee5e9683613e5375be1b0c72b063bff8305fb1e`
   - candidate `b8f39ded0163f45714eebff7f8c1a35242712918df5568935fbc77a442cc2987`
3. `shared/ozon_provider.js`
   - baseline `318ca0e872942b08a92ce787bc5b3ed8637434318a534f528e387206731c2455`
   - candidate `5e6d6bdf47e2561b0a015836d5a0f1c5ed28bd2a9625e84aadfdc49ab17deb74`

The other FOURTEEN production files must be byte-identical to baseline:

- `content_script.js` — `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`
- `manifest.json` — `6ed5ecc768cc980d256b5bfb69f00c9a4006ec2eb2bd6c96f9d261d7a018e0fb`
- `popup.css` — `dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5`
- `popup.html` — `5fdf3932ef0f523626da65fff4c5919df19c321bc23fee861e95d5d940a185d5`
- `popup.js` — `8e1d95340d3e87b8a8cadda50276033e336f633469a5dbceaacd74b2d10239fd`
- `shared/ai_adapters.js` — `5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9`
- `shared/bridge_autorun_model.js` — `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/composer_send.js` — `3e9421e8e1bc209af635e2b90d957e558301763572a42875b95c8973ca75b736`
- `shared/conversation_identity.js` — `939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57`
- `shared/manual_controls.js` — `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
- `shared/ozon_credentials.js` — `286c6021f958e41912842569bcfa0d0dfe920eed8ce1646014899a1de064415d`
- `shared/proven_writing_block_capture.js` — `5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef`
- `shared/provider_transport_core.js` — `9c33c7c2448959f75eb5d0c2b36137bba68085c4b93a90a8c67d1ee86de4aa39`
- `shared/runtime_names.js` — `2abc73a8c6f5ba29e71c352c452fcc4da1cbf278de988fdc070dc5414d908292`

Required:

`CHANGED_FILES_EXACTLY_3 = PASS`
`CHANGED_FILE_HASHES = PASS`
`PROTECTED_14_BYTE_IDENTICAL = PASS`
`AI_DOM_COMPOSER_PROTECTED = PASS`
`DELIVERY_FSM_PROTECTED = PASS`

Because `content_script.js`, `shared/ai_adapters.js`, `shared/composer_send.js`, `shared/conversation_identity.js`, `shared/manual_controls.js`, `shared/proven_writing_block_capture.js`, and related protected files are byte-identical, do not redesign or reinterpret ChatGPT delivery behavior during this validation.

## 8. Syntax/load sanity

Run syntax checks over all production JavaScript files and load the actual candidate modules/functions in isolated Node/VM harnesses as needed.

No test is satisfied by static grep alone when actual behavior can be invoked.

Required:

`JS_SYNTAX = PASS`

## 9. Strict contract validation — actual candidate code

Use actual exported candidate contract functions with mocked provider transport/counters.

### analytics_data

Validate at minimum:

- required `date_from`, `date_to`, `dimension`, `metrics`, `limit`;
- documented analytics date shape `YYYY-MM-DD` or RFC3339 date-time;
- reviewed dimensions;
- universal dimensions include `unknownDimension`, `sku`, `spu`, `day`, `week`, `month`;
- reviewed restricted dimensions include `year`, `category1`, `category2`, `brand`, `modelID`, `descriptionType`;
- universal metrics include `revenue` and `ordered_units`;
- invented/unknown metric such as `orders_count` fails locally;
- maximum 14 metrics;
- limit `1..1000`;
- offset `>=0`;
- reviewed filter structure/comparison/key rules, including the frozen reviewed restriction that `brand` is not accepted as that filter key;
- reviewed sort metric and `ASC`/`DESC` validation.

Every malformed/unsupported pre-execution case must cause ZERO business provider requests.

### product_queries

Validate:

- `date_from` and optional `date_to` are RFC3339 date-time, not date-only;
- SKU values are string int64;
- invalid sort enum fails locally;
- `page_size <= 1000`;
- maximum 1000 SKUs;
- do not invent undocumented minimums.

### product_queries_details

Validate:

- RFC3339 date-time;
- SKU string int64;
- invalid sort enum fails locally;
- `page_size <= 100`;
- maximum 1000 SKUs;
- `limit_by_sku <= 15`;
- do not invent undocumented minimums.

Required:

`STRICT_CONTRACT_VALIDATION = PASS`
`PREEXECUTION_ZERO_BUSINESS_REQUESTS = PASS`

## 10. Capability resolver and seller-info privacy

Use actual candidate provider/capability code with mocked transport.

The internal capability probe is fixed:

`POST /v1/seller/info`

Verify:

- assistant input cannot choose the URL, host, method, headers, Client-Id, Api-Key, Authorization or secret;
- raw seller-info fields such as company identity, INN, OGRN, ratings or unrelated account data never reach AI-facing results/logical result items;
- only the reviewed minimal capability/subscription projection is used;
- recognized subscription enum is exactly the reviewed set: `UNKNOWN`, `UNSPECIFIED`, `PREMIUM`, `PREMIUM_LITE`, `PREMIUM_PLUS`, `PREMIUM_PRO`;
- probe failure is safe/sanitized;
- no retry is hidden inside the resolver;
- direct assistant command `OZON_API_V1 {"operation":"seller_info","params":{}}` remains unsupported and executes zero provider requests.

Required:

`CAPABILITY_RESOLVER = PASS`
`SELLER_INFO_PRIVACY = PASS`
`SELLER_INFO_NOT_AI_CALLABLE = PASS`

## 11. Pure entitlement planner matrix

Execute actual exported planning functions with deterministic time.

### analytics_data

A. Universal `revenue`/`ordered_units`, universal dimension, recent period:
- no capability required;
- execute unchanged.

B. `revenue + hits_view`, capability `UNSPECIFIED`:
- execute universal subset only;
- physical metrics contain `revenue`, not `hits_view`;
- logical planning says partial;
- omitted `hits_view` explicitly marked `SUPPORTED_BUT_NOT_ENTITLED`.

C. `revenue + hits_view`, capability unknown:
- execute universal subset only;
- partial true;
- restricted metric status `ENTITLEMENT_UNKNOWN`;
- never equate UNKNOWN with no subscription.

D. only `hits_view`, `UNSPECIFIED`:
- reject `SUBSCRIPTION_REQUIRED`;
- zero analytics business requests.

E. only restricted metrics, capability unknown:
- reject `ENTITLEMENT_UNKNOWN`;
- zero analytics business requests.

F. restricted dimension such as `brand`, not entitled:
- reject whole logical command;
- do not remove/change dimension and continue.

G. restricted sort/filter not entitled:
- reject whole command;
- do not silently remove semantic constraints.

H. history older than three months without Plus/Pro:
- reject.

I. `PREMIUM_PLUS` and `PREMIUM_PRO`:
- reviewed restricted analytics scope executes unchanged.

### product_queries / product_queries_details

J. recent `product_queries`, `UNSPECIFIED`:
- execute with explicit partial-by-subscription response scope.

K. history older than one month, `UNSPECIFIED`:
- reject `SUBSCRIPTION_REQUIRED`.

L. old history with `PREMIUM`, `PREMIUM_PLUS` or `PREMIUM_PRO`:
- execute.

M. `product_queries_details` restricted sort `BY_VIEWS`, `BY_POSITION`, or `BY_CONVERSION`:
- `PREMIUM` and `PREMIUM_PLUS` execute;
- `UNSPECIFIED` rejects subscription-required;
- `PREMIUM_PRO` remains conservatively `ENTITLEMENT_UNKNOWN` for this specific sort because the frozen reviewed contract did not explicitly establish Pro for these sort keys.

Required:

`ENTITLEMENT_PLANNER_MATRIX = PASS`

## 12. Batch-level one-probe invariant — actual service_worker logic

This is load-bearing. Use an external Node VM harness around the actual reconstructed candidate `service_worker.js`, with mocked Chrome storage/runtime and provider functions. Test-only instrumentation may be appended only to an external in-memory/test copy; candidate source bytes must not be modified.

Use deterministic provider counters.

Required cases:

1. 30 recent capability-sensitive `product_queries` commands in ONE clicked logical batch:
- exactly ONE `/v1/seller/info` probe total;
- not 30;
- Step 1 may still execute 30 mocked business requests because coalescing is Step 2;
- probe is not an extra logical result item.

2. 30 universal recent `analytics_data` commands using only `revenue`/`ordered_units` and universal dimensions:
- ZERO Seller capability probes.

3. mixed `revenue + hits_view`, mocked `UNSPECIFIED`:
- exactly one probe for the batch;
- physical analytics body contains only `revenue`;
- logical result preserves original request/planning omission;
- partial true;
- one analytics business call.

4. all-restricted analytics, mocked `UNSPECIFIED`:
- one capability probe;
- ZERO analytics business requests;
- one logical planning-error result;
- business `external_request_executed:false`;
- probe metadata must not masquerade as the business request.

5. capability probe returns unknown/HTTP error, mixed metrics:
- no probe retry;
- universal subset may execute;
- restricted facts remain entitlement unknown.

6. capability unknown and all requested facts restricted:
- zero business request;
- entitlement unknown result.

7. persisted batch state says capability resolution `state:"requesting"` owned by a DIFFERENT/previous `WORKER_SESSION_ID`:
- current worker performs ZERO second capability probes;
- outcome becomes unknown/no-retry;
- planning remains fail-closed.

8. Performance-only batch such as `performance_campaigns`:
- ZERO Seller capability probes;
- existing Performance path remains selected.

Required:

`ONE_CAPABILITY_PROBE_PER_RELEVANT_BATCH = PASS`
`ZERO_PROBE_FOR_UNIVERSAL_OR_PERFORMANCE_BATCH = PASS`
`PROBE_RESTART_NO_RETRY = PASS`

Report exact probe and business-call counters for every case.

## 13. Logical vs physical provenance

Using actual candidate provider + contract with mocked transport, for logical analytics request `metrics:["revenue","hits_view"]` and plan permitting only `revenue`, verify:

- physical HTTP body contains only `revenue`;
- logical command fingerprint/identity corresponds to original logical request;
- physical command fingerprint is distinct when transformed;
- planning metadata explicitly names omitted `hits_view` and reason;
- provider-error path retains planning metadata;
- no raw seller-info fields appear;
- `external_request_executed` describes the business request, while capability-probe provenance remains separate infrastructure metadata.

Required:

`LOGICAL_PHYSICAL_PROVENANCE = PASS`

## 14. Security and regressions

Using actual candidate sources, verify:

- assistant cannot inject arbitrary `url`, `host`, `method`, `headers`, `Authorization`, `Client-Id`, `Api-Key`, `Client Secret` into provider transport;
- provider hosts remain fixed;
- credentials remain isolated from page/content output;
- mutation/write operations remain blocked/not allowlisted;
- `posting_fbs_get` remains blocked because of customer PII;
- malformed/pre-execution failures cause zero business provider requests;
- no hidden retry was added to probe or business requests;
- no hidden pagination/fan-out/report polling was added;
- no arbitrary generic bridge byte/depth/item/time caps or silent truncation were reintroduced;
- existing Performance host/auth lifecycle still works in a mocked `performance_campaigns` regression;
- universal Seller operation such as `roles` remains unchanged and requires zero capability probes;
- one extension-owned overlay / exact code-block binding / ChatGPT/Alice ownership surfaces are protected by byte identity and must not be rewritten by this test.

Required:

`SECURITY_REGRESSION = PASS`
`PERFORMANCE_REGRESSION = PASS`
`SELLER_BASELINE_REGRESSION = PASS`

## 15. MV3 browser sanity with accepted harness

Load the reconstructed candidate unpacked source using the already accepted Windows/Puppeteer harness:

- Puppeteer `25.4.0`;
- Chrome for Testing `151.0.7922.47`;
- Node `child_process.spawn()`;
- `--remote-debugging-port=0`;
- read `DevToolsActivePort`;
- Puppeteer connect;
- `browser.installExtension()`;
- dedicated QA profile.

Verify at minimum:

- runtime extension install PASS;
- expected 17-file extension inventory;
- MV3 service worker target starts without uncaught startup failure;
- manifest permissions and host permissions are unchanged from baseline;
- extension ID is stable for the fixed unpacked source during the run as expected by the accepted harness;
- operator browser actions = 0;
- no manual ZIP install/reinstall is required.

Because AI DOM/composer files are protected by byte identity, no real ChatGPT/Alice login is required for this bounded gate. Do not fabricate live-account evidence.

Required:

`MV3_BROWSER_SANITY = PASS`
`OPERATOR_BROWSER_ACTIONS = 0`

## 16. Absolute no-real-Ozon guard

Instrument the test environment so any attempted request to either host fails validation and is counted:

- `api-seller.ozon.ru`
- `api-performance.ozon.ru`

All provider behavior in this validation must be mocked.

Final report must state exactly:

`REAL_OZON_REQUESTS = 0`

Any real request attempt is a hard FAIL.

## 17. Final acceptance criteria

`STEP1_ACCEPTED_FOR_STEP2` only if ALL are PASS:

- exact target SHA and clean test start;
- bounded repair scope exactly seven reconstruction files;
- original Step 1 logic artifacts unchanged;
- exact baseline reconstruction and ZIP hash;
- exact raw patch-part hashes and concatenated patch hash;
- reconstructed candidate exactly 17 files;
- exactly three intended production files changed with exact candidate hashes;
- protected fourteen files byte-identical;
- AI DOM/composer and delivery FSM protected;
- strict contract validation;
- zero business requests on pre-execution failures;
- capability resolver/privacy/non-AI-callable seller_info;
- entitlement matrix;
- one-probe-per-relevant-batch invariant;
- zero probes for universal/performance-only batches;
- restart no-retry behavior;
- logical/physical provenance;
- security regression;
- Performance regression;
- Seller baseline regression;
- MV3 browser sanity;
- zero operator browser actions;
- `REAL_OZON_REQUESTS = 0`.

Any load-bearing FAIL => `STEP1_REJECTED`.

Do not downgrade a FAIL to warning because local evidence claimed PASS.

## 18. Report publication discipline

Create exactly this report:

`tooling\llm-api-bridges\ozon-seller\validation\reports\OZON_STEP1_CONTRACT_CAPABILITY_RETEST_2026-08-17.md`

Create validation branch exactly FROM target SHA:

`validation/ozon-step1-contract-capability-retest-2026-08-17`

The branch base must be exactly:

`f1a23c5c20c1cdc6b3bcbb91f5d9773413960b93`

The validation branch must contain ONLY the report file. No production fixes, no harness source committed, no reconstructed ZIP, no candidate unpacked tree, no other evidence files.

Before commit verify staged paths contain exactly the report path above.

Commit message:

`test: retest Ozon Step 1 after reconstruction repair`

Push the validation branch. Do not merge it. Do not modify the development branch.

The report must include:

- exact tested SHA;
- parent/repair-scope proof;
- original Step 1 logic blob-identity proof;
- baseline reconstruction part sizes/hashes;
- concatenated base64 hash;
- decoded baseline ZIP size/hash;
- raw patch-part hashes;
- concatenated patch hash;
- changed-file matrix;
- protected-file hash matrix;
- environment versions;
- every required behavioral test and result;
- exact provider counters for one-probe cases;
- sanitized request shapes/paths only, no secrets;
- browser-sanity evidence;
- `OPERATOR_BROWSER_ACTIONS = 0`;
- `REAL_OZON_REQUESTS = 0`;
- final verdict.

## 19. Final response format

Return exactly:

```text
CODEX_OZON_STEP1_RETEST_RESULT

tested_sha:
  f1a23c5c20c1cdc6b3bcbb91f5d9773413960b93

repair_scope:
  reconstruction_files_exactly_7: PASS|FAIL
  step1_logic_artifacts_unchanged: PASS|FAIL

reconstruction:
  baseline_bundle: PASS|FAIL
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

After pushing the report: STOP.

Do not implement Step 2. Wait for independent review of the full GitHub report.
