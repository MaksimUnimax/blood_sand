# Patch B0 Full Read Core — independent retest with Node identity fallback

Date: 2026-08-25

Status: `READY_FOR_INDEPENDENT_RETEST`

Repository: `MaksimUnimax/blood_sand`
Branch: `feature/ozon-full-read-core-b0-2026-08-25`

## Why this retest exists

The previous independent run at tested HEAD `c853876e0bc38251d8732531c172ca5d2370435c` executed no B0 test because that Windows environment had neither `python` nor an installed interpreter behind `py -3`.

That is an environment blocker only. It is not a B0 production failure.

An earlier independent run had already materialized and byte-verified the exact 21-file B0 production candidate with tree SHA-256:

`d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`

No production candidate file, B0 patch byte, transport chunk, or production SHA authority has changed since that proof. Subsequent commits are validation/handoff-only.

## Node identity verifier

A Python-independent exact-tree verifier is now authoritative for re-verifying an already materialized candidate directory:

`tooling/llm-api-bridges/ozon-seller/validation/verify_patch_b0_full_read_core_candidate_identity.mjs`

Run:

```text
node tooling/llm-api-bridges/ozon-seller/validation/verify_patch_b0_full_read_core_candidate_identity.mjs <candidate-dir>
```

Require exactly these identity markers:

```text
B0_NODE_PRODUCTION_FILE_COUNT_21_PASS
B0_NODE_CHANGED_FILE_IDENTITIES_PASS
B0_NODE_TREE_MANIFEST_SHA256_PASS
```

and exact tree:

`d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`

The verifier uses the same path + NUL + per-file SHA-256 + LF tree-manifest algorithm as the Python materializer, checks all 21 files by final tree identity, and separately checks the changed/high-authority B0 files.

## Candidate acquisition order

1. If Python is available, a fresh materialization remains preferred and the original six B0 materializer markers remain authoritative.
2. If Python is unavailable, do **not** reject B0 merely for that reason.
3. Locate a previously materialized B0 candidate from the earlier successful materialization. The earlier tester reported the candidate path:

`D:\codex\Test\ozon-b0-retest2-candidate-20260825`

4. If that exact directory is unavailable, search only prior B0 candidate directories under the tester workspace. Do not use a directory unless the Node identity verifier passes all three markers and produces the exact B0 tree SHA above.
5. Once an existing directory independently passes the Node verifier, it is an exact immutable candidate input and may be used for deterministic and browser testing in this retest.
6. Never treat historical tree identity alone as current evidence; re-run the Node verifier in the current test process.

If neither Python materialization nor a Node-verified exact candidate directory is available, report `PATCH_B0_BROWSER_CANDIDATE_NOT_EXECUTED_ENVIRONMENT_ONLY`. Do not label that condition as a product rejection.

## Mandatory validation after identity

Before deterministic execution:

```text
node --check tooling/llm-api-bridges/ozon-seller/validation/PATCH_B0_FULL_READ_CORE_REGRESSION_2026-08-25.mjs
```

Then run:

```text
node tooling/llm-api-bridges/ozon-seller/validation/PATCH_B0_FULL_READ_CORE_REGRESSION_2026-08-25.mjs <verified-candidate-dir>
```

Require all seven:

```text
B0_REGISTRY_GUIDANCE_PASS
B0_PERSONAL_DATA_CONTRACT_PASS
B0_ENTITLEMENT_EXACT_REQUEST_PASS
B0_DYNAMIC_SWAGGER_COMPILER_PASS
B0_COMPATIBILITY_CLUSTER_ALIASES_PASS
B0_PROTECTED_A5_RUNTIME_IDENTITIES_PASS
B0_POLICY_BEFORE_CAPABILITY_PASS
```

Run `node --check` for every production `.js` file.

Only after the deterministic gate passes may browser acceptance proceed.

## Browser isolation rule

Do not reuse a synthetic fixture left in `delivering` or with an active manual operation.

Each major scenario must start from a fresh isolated fixture/session or from a state explicitly proven `READY` with no unfinished manual operation.

Temporary Puppeteer/CDP/synthetic ChatGPT harness corrections are allowed outside the production candidate tree. Production code modifications remain forbidden.

The complete browser matrix and acceptance assertions remain those in:

`PATCH_B0_FULL_READ_CORE_CODEX_TEST_INSTRUCTION_2026-08-25.md`

## Result

Update only:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B0_FULL_READ_CORE_CODEX_RESULT_2026-08-25.md`

Record:

- exact tested HEAD;
- whether identity came from fresh Python materialization or current-run Node re-verification;
- exact candidate path;
- exact tree SHA;
- Python/A.5/B0 markers if Python was used, otherwise all three Node identity markers;
- regression syntax result;
- all seven deterministic markers;
- production JS syntax result;
- every browser case with clean-fixture evidence;
- exact provider request counts;
- automatic replay evidence;
- metadata refresh evidence;
- final decision.

Allowed final decisions for this retest:

- `PATCH_B0_BROWSER_CANDIDATE_ACCEPTED`
- `PATCH_B0_BROWSER_CANDIDATE_REJECTED` — only for an executed B0 assertion/product failure or mandatory deterministic failure
- `PATCH_B0_BROWSER_CANDIDATE_NOT_EXECUTED_ENVIRONMENT_ONLY` — only when no exact candidate can be acquired/verified in the environment

No B1-B8 work starts until B0 is accepted.
