# Ozon Bridge Step 1 Contract + Capability Retest

## Identity and safety

- Exact tested SHA: `f1a23c5c20c1cdc6b3bcbb91f5d9773413960b93`
- Parent repair SHA: `390e3db45f76e3795f2624f4b8a02679b108bf9f`
- Original Step 1 logic SHA: `370e45a1803976f43d27d5a9d4b5613e09a91623`
- Checkout before testing: detached at exact target, clean
- Operator browser actions: `0`
- Real Ozon requests: `0`
- Credentials, accounts, tokens, cookies, and auth material: none
- Production source changed during validation: none

## Environment

- Windows: `Microsoft Windows NT 10.0.26200.0`
- PowerShell: `7.6.4`
- Git: `2.40.1.windows.1`
- Python runtime: `3.12.13` (bundled workspace runtime)
- Node: `v24.12.0`
- npm: `11.6.2`
- Puppeteer: `25.4.0`
- Chrome for Testing route available from accepted Step 0: `151.0.7922.47`

## Repair scope

The target-parent diff contains exactly seven added reconstruction files and no other paths:

```text
development/operator-v0.1.19/exact-reconstruction/00.b64.part
development/operator-v0.1.19/exact-reconstruction/01.b64.part
development/operator-v0.1.19/exact-reconstruction/02.b64.part
development/operator-v0.1.19/exact-reconstruction/03.b64.part
development/operator-v0.1.19/exact-reconstruction/04.b64.part
development/operator-v0.1.19/exact-reconstruction/RECONSTRUCTION.md
development/operator-v0.1.19/exact-reconstruction/reconstruct_operator_v0.1.19.py
```

`REPAIR_SCOPE_EXACTLY_7_RECONSTRUCTION_FILES = PASS`.

Git blob IDs for `PATCH_PARTS.md`, `STEP1_IMPLEMENTATION_AND_LOCAL_EVIDENCE.md`, and patch parts `00` through `07` were identical between original Step 1 SHA and target SHA.

`STEP1_LOGIC_ARTIFACTS_UNCHANGED = PASS`.

## Reconstruction gate

The repaired bundle was extracted from raw Git objects into an external QA workspace. The observed bundle bytes do not satisfy the bundle's declared expectations:

| Part | Expected size | Observed size | Expected SHA-256 | Observed SHA-256 |
|---|---:|---:|---|---|
| 00.b64.part | 10000 | 10000 | `c8b027cd94c38768dc998f2063a4e9ae2750cbf58a71935b45f929b79f7a725a` | `c8b027cd94c38768dc998f2063a4e9ae2750cbf58a71935b45f929b79f7a725a` |
| 01.b64.part | 20000 | 19999 | `e1046ece6c5034546ddca1cda846b6a798fbcb649da89664a2d644cb18581270` | `834702eb1f34ad16939dde63704849648f44e545f5ace7aa482b238d5780e997` |
| 02.b64.part | 40000 | 19999 | `ac55015397c0eaebd49729bc3ae868262719ae598e8cc7a3b50af7f7f1caf541` | `b1a00551f41d7371e3fc219aca97ec2827f534d5a2a285338a4be685e9b141ba` |
| 03.b64.part | 40000 | 19999 | `a84658702b3377f4f5a43692bff8177edd5da32fd273975369697b33c0ec43cc` | `f479201cb1e4eb967b2c368a63e3c5316f1b6038a77e691daa8ba5f48ef412b6` |
| 04.b64.part | 23760 | 19999 | `97bdcf5e49da729eaf17d09ec1f658866d8a13c79363d2d210ae171250be70a6` | `71eb0cef609302d82468b978ed8c0fe69a7921dc4e8e9f068675a6f51740da5a` |

The expected concatenated base64 size/hash were `133760` / `2e0e44d85389c9deeab4650efe6a310b3be2204cfc3cd0df1d8c61c8f88c733c`. Observed concatenation was size `89996`, SHA-256 `d68d4353fdac73d2b3fb389d23eba9b9432347134b7d9ed974bc5bacdfa0bd40`.

The supplied reconstruction script was not run against invalid bundle input, and no ZIP was decoded or extracted. Expected ZIP size/hash (`100320` / `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`) could not be established.

`BASELINE_RECONSTRUCTION = FAIL`

`BASELINE_ZIP_SHA = FAIL`

`BASELINE_17_FILES = FAIL`

## Raw Step 1 patch gate

Raw Git extraction was used without working-tree text conversion. All eight raw patch parts matched their expected SHA-256 values. Their byte-for-byte concatenation was size `61758`, SHA-256 `5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`.

`PATCH_PART_RAW_HASHES = PASS`

`PATCH_CONCAT_SHA = PASS`

Because the baseline reconstruction gate failed first, the patch was not applied and no candidate production tree was created.

## Candidate and behavior gates

The following were not executed because the exact baseline candidate could not be reconstructed. Per the hard stop rule, they are recorded as FAIL for acceptance and are not claims about the untested implementation:

```text
CHANGED_FILES_EXACTLY_3 = FAIL
CHANGED_FILE_HASHES = FAIL
PROTECTED_14_BYTE_IDENTICAL = FAIL
AI_DOM_COMPOSER_PROTECTED = FAIL
DELIVERY_FSM_PROTECTED = FAIL
JS_SYNTAX = FAIL
STRICT_CONTRACT_VALIDATION = FAIL
PREEXECUTION_ZERO_BUSINESS_REQUESTS = FAIL
CAPABILITY_RESOLVER = FAIL
SELLER_INFO_PRIVACY = FAIL
SELLER_INFO_NOT_AI_CALLABLE = FAIL
ENTITLEMENT_PLANNER_MATRIX = FAIL
ONE_CAPABILITY_PROBE_PER_RELEVANT_BATCH = FAIL
ZERO_PROBE_FOR_UNIVERSAL_OR_PERFORMANCE_BATCH = FAIL
PROBE_RESTART_NO_RETRY = FAIL
LOGICAL_PHYSICAL_PROVENANCE = FAIL
SECURITY_REGRESSION = FAIL
PERFORMANCE_REGRESSION = FAIL
SELLER_BASELINE_REGRESSION = FAIL
MV3_BROWSER_SANITY = FAIL
```

No provider transport was invoked, no browser was opened for this retest, and `REAL_OZON_REQUESTS = 0`.

## Final verdict

`STEP1_REJECTED`

The rejection is caused by the invalid repaired baseline reconstruction bundle. No production repair was attempted.
