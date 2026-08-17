# Ozon Bridge Step 1 Contract + Capability Retest v2

## Identity

- Exact tested SHA: `298a4d618c69e8ffd33735ff96a153d42d160143`
- Repair base docs SHA: `7886fa7473e1560efeee65a21531da2ac4bd23f1`
- Original Step 1 logic SHA: `370e45a1803976f43d27d5a9d4b5613e09a91623`
- Checkout before testing: detached at exact target, clean
- QA files: external `D:\codex\Test\qa-step1-contract-capability-retest-v2`
- Credentials/accounts/tokens/cookies: none
- Operator browser actions: `0`
- REAL_OZON_REQUESTS: `0`

## Environment

- Windows: `Microsoft Windows NT 10.0.26200.0`
- PowerShell: `7.6.4`
- Git: `2.40.1.windows.1`
- Python: `3.12.13` bundled workspace runtime
- Node: `v24.12.0`
- npm: `11.6.2`
- Puppeteer: `25.4.0`
- Chrome for Testing: `151.0.7922.47`

## Repair scope

Diff from base docs SHA to target contains exactly ten reconstruction-v2 files: `01.prefix.part`, `02.prefix.a.part`, `02.prefix.b.part`, `02.prefix.c.part`, `03.prefix.a.part`, `03.prefix.b.part`, `03.prefix.c.part`, `04.prefix.part`, `reconstruct_operator_v0.1.19_v2.py`, and `RECONSTRUCTION_V2.md`, all under `development/operator-v0.1.19/exact-reconstruction-v2/`. No production file is in this repair delta.

Step 1 `PATCH_PARTS.md`, `STEP1_IMPLEMENTATION_AND_LOCAL_EVIDENCE.md`, and patch parts `00` through `07` have identical Git blob IDs at original Step 1 SHA and target.

`REPAIR_V2_SCOPE_EXACTLY_10_RECONSTRUCTION_FILES = PASS`

`STEP1_LOGIC_ARTIFACTS_UNCHANGED = PASS`

## Baseline reconstruction v2

Raw Git bytes were used. The supplied v2 verifier printed `RECONSTRUCTION_V2_PASS`.

Fragment results, in verifier order, were:

```text
00.b64.part 10000 c8b027cd94c38768dc998f2063a4e9ae2750cbf58a71935b45f929b79f7a725a
01.prefix.part 1 a1fce4363854ff888cff4b8e7875d600c2682390412a8cf79b37d0b11148b0fa
01.b64.part 19999 834702eb1f34ad16939dde63704849648f44e545f5ace7aa482b238d5780e997
02.prefix.a.part 10000 8d158aaab37882a812bb59a762e4046cf11ab3bd40ab93b57f887bbd78c59e51
02.prefix.b.part 10000 bbf010640377b945789b5098e7857432e32f00377eb9222ea598410f7632668f
02.prefix.c.part 1 a1fce4363854ff888cff4b8e7875d600c2682390412a8cf79b37d0b11148b0fa
02.b64.part 19999 b1a00551f41d7371e3fc219aca97ec2827f534d5a2a285338a4be685e9b141ba
03.prefix.a.part 10000 8feabdfe53c66c38d75f9d9105ee0545b2dcd306bfaf3c9afa29c8a5793eaef6
03.prefix.b.part 10000 eef0d6bd3ede1303acc49efa3d8717270ed68ae25e51896514e669b6cff70fce
03.prefix.c.part 1 acac86c0e609ca906f632b0e2dacccb2b77d22b0621f20ebece1a4835b93f6f0
03.b64.part 19999 f479201cb1e4eb967b2c368a63e3c5316f1b6038a77e691daa8ba5f48ef412b6
04.prefix.part 3761 a94fe9654a7ee800e7474f8b90b8f167bf7e051f35e689d97923c2fef5e429d4
04.b64.part 19999 71eb0cef609302d82468b978ed8c0fe69a7921dc4e8e9f068675a6f51740da5a
```

Concatenated base64: size `133760`, SHA-256 `cb0bf7d1b467e8e28e1f083ed572ee4bb021034c0f2d3cffc734437648cc9d8f`.

Decoded baseline ZIP: size `100320`, SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`, exactly 17 expected production files.

`BASELINE_RECONSTRUCTION_V2 = PASS`

`BASELINE_ZIP_SHA = PASS`

`BASELINE_17_FILES = PASS`

## Raw Step 1 patch

All eight raw Git patch parts matched the expected hashes. Concatenated patch size was `61758`, SHA-256 `5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`.

`PATCH_PART_RAW_HASHES = PASS`

`PATCH_CONCAT_SHA = PASS`

## Candidate delta and protected files

The raw patch was applied to a fresh external baseline with `core.autocrlf=false`.

| File | Baseline SHA-256 | Candidate SHA-256 |
|---|---|---|
| `service_worker.js` | `8b8190803b28daf9da8b852bddbcfb1d6c079bb93eee9eda35fed516764458ec` | `b594872cff8f7049a441ffe8fe422d761069a14a48a1d32e7e54f568c7f0502a` |
| `shared/ozon_contract.js` | `b3497d3cec56a7591dce0f266ee5e9683613e5375be1b0c72b063bff8305fb1e` | `b8f39ded0163f45714eebff7f8c1a35242712918df5568935fbc77a442cc2987` |
| `shared/ozon_provider.js` | `318ca0e872942b08a92ce787bc5b3ed8637434318a534f528e387206731c2455` | `5e6d6bdf47e2561b0a015836d5a0f1c5ed28bd2a9625e84aadfdc49ab17deb74` |

The other 14 production files matched baseline byte-for-byte. Deterministic extraction found all 14 named delivery FSM function bodies identical. AI DOM/composer/conversation, credentials, transport, runtime, and manifest files remained unchanged.

`CHANGED_FILES_EXACTLY_3 = PASS`

`CHANGED_FILE_HASHES = PASS`

`PROTECTED_14_BYTE_IDENTICAL = PASS`

`AI_DOM_COMPOSER_PROTECTED = PASS`

`DELIVERY_FSM_PROTECTED = PASS`

## Contract, capability, and planner execution

All 14 production JavaScript files passed `node --check`. Manifest parsed; version remained `0.1.19`; fixed Seller/Performance hosts and expected permissions remained unchanged.

Actual candidate contract functions were loaded through Node VM. Reviewed analytics metrics/dimensions, dates, filters, sorts, limits, product RFC3339/SKU/sort/page limits, details limits, invented fields/metrics, and transport injection were tested. Invalid pre-execution input produced zero mocked business calls.

Actual provider code used mocked `ProviderTransportCore.executeJsonOnce`. Capability probe evidence: exactly one request, `POST https://api-seller.ozon.ru/v1/seller/info`, no body, fixed headers, minimal subscription projection, sensitive company/rating fields absent, unknown enum mapped to `UNKNOWN`, and HTTP 500/403/exception each performed one probe with sanitized unknown state and no retry. Direct assistant `seller_info` was unsupported with zero calls. `posting_fbs_get` was blocked with zero calls.

Planner execution passed universal, mixed partial, unknown, all-restricted, restricted dimension, history, product scope, and conservative Premium Pro restricted-sort cases. Logical/physical provenance passed: physical body contained only `revenue`, logical/physical fingerprints differed, omitted `hits_view` metadata survived success and provider-error paths.

`JS_SYNTAX = PASS`

`STRICT_CONTRACT_VALIDATION = PASS`

`PREEXECUTION_ZERO_BUSINESS_REQUESTS = PASS`

`CAPABILITY_RESOLVER = PASS`

`SELLER_INFO_PRIVACY = PASS`

`SELLER_INFO_NOT_AI_CALLABLE = PASS`

`ENTITLEMENT_PLANNER_MATRIX = PASS`

`LOGICAL_PHYSICAL_PROVENANCE = PASS`

## Batch one-probe evidence

An external Node VM harness executed the actual candidate `ensureBatchCapabilityAndPlanning` and `processBatchQueue` functions with mocked Chrome state, owner persistence, provider, diagnostics, and business transport.

| Case | Seller probes | Business calls | Result |
|---|---:|---:|---|
| 30 recent `product_queries` | 1 | 30 | all 30 entries completed |
| 30 universal analytics | 0 | 30 | all 30 entries completed |
| mixed `revenue + hits_view`, UNSPECIFIED | 1 | 1 | physical metrics only `revenue`, partial metadata retained |
| all restricted, UNSPECIFIED | 1 | 0 | `SUBSCRIPTION_REQUIRED` planning result |
| mixed metrics, unknown probe | 1 | 1 | universal subset executed, restricted fact unknown |
| all restricted, unknown probe | 1 | 0 | `ENTITLEMENT_UNKNOWN` planning result |
| previous-worker `requesting` state | 0 additional | 0 | `CAPABILITY_PROBE_OUTCOME_UNKNOWN_NO_RETRY` |
| Performance-only planning | 0 | not needed | capability state `not_needed` |

`ONE_CAPABILITY_PROBE_PER_RELEVANT_BATCH = PASS`

`ZERO_PROBE_FOR_UNIVERSAL_OR_PERFORMANCE_BATCH = PASS`

`PROBE_RESTART_NO_RETRY = PASS`

## Security and regressions

Fixed request URLs/methods/headers were asserted against mocked transport. Arbitrary transport fields were rejected; credentials remained outside page output; mutation/write operations remained blocked; `posting_fbs_get` remained blocked; no hidden retry/pagination/fan-out/report polling or silent truncation was observed. Mocked Performance selected the fixed Performance route; mocked Seller `roles` selected the existing Seller route with no capability probe.

`SECURITY_REGRESSION = PASS`

`PERFORMANCE_REGRESSION = PASS`

`SELLER_BASELINE_REGRESSION = PASS`

## MV3 browser sanity

Accepted route used: Node `child_process.spawn()`, CFT `151.0.7922.47`, dynamic `--remote-debugging-port=0`, `DevToolsActivePort`, Puppeteer `25.4.0`, dedicated profile, and `browser.installExtension()`.

- Dynamic port: `52235`
- Extension ID: `heofaodblfadabkbnjblleaepikbhfpb`
- Extension version: `0.1.19`
- Service worker: `chrome-extension://heofaodblfadabkbnjblleaepikbhfpb/service_worker.js`
- Operator browser actions: `0`
- Real sites/accounts: none

`MV3_BROWSER_SANITY = PASS`

## Required summary

```text
REPAIR_V2_SCOPE_EXACTLY_10_RECONSTRUCTION_FILES = PASS
STEP1_LOGIC_ARTIFACTS_UNCHANGED = PASS
BASELINE_RECONSTRUCTION_V2 = PASS
BASELINE_ZIP_SHA = PASS
BASELINE_17_FILES = PASS
PATCH_PART_RAW_HASHES = PASS
PATCH_CONCAT_SHA = PASS
CHANGED_FILES_EXACTLY_3 = PASS
CHANGED_FILE_HASHES = PASS
PROTECTED_14_BYTE_IDENTICAL = PASS
AI_DOM_COMPOSER_PROTECTED = PASS
DELIVERY_FSM_PROTECTED = PASS
JS_SYNTAX = PASS
STRICT_CONTRACT_VALIDATION = PASS
PREEXECUTION_ZERO_BUSINESS_REQUESTS = PASS
CAPABILITY_RESOLVER = PASS
SELLER_INFO_PRIVACY = PASS
SELLER_INFO_NOT_AI_CALLABLE = PASS
ENTITLEMENT_PLANNER_MATRIX = PASS
ONE_CAPABILITY_PROBE_PER_RELEVANT_BATCH = PASS
ZERO_PROBE_FOR_UNIVERSAL_OR_PERFORMANCE_BATCH = PASS
PROBE_RESTART_NO_RETRY = PASS
LOGICAL_PHYSICAL_PROVENANCE = PASS
SECURITY_REGRESSION = PASS
PERFORMANCE_REGRESSION = PASS
SELLER_BASELINE_REGRESSION = PASS
MV3_BROWSER_SANITY = PASS
OPERATOR_BROWSER_ACTIONS = 0
REAL_OZON_REQUESTS = 0
```

Final verdict: `STEP1_ACCEPTED_FOR_STEP2`.

No Step 2 work was started.
