# Patch B0 Full Read Core — ready for independent test

Date: 2026-08-25
Status: `READY_FOR_INDEPENDENT_TEST`

Repository: `MaksimUnimax/blood_sand`
Branch: `feature/ozon-full-read-core-b0-2026-08-25`
Accepted production baseline: A.5 at `9ebc673c2e0dd9dc24f6cbab90455396328f0aad`
Transport repair anchor: `e806f0eb947844678a21f59f00e6ec416f1a8545`
Tester-instruction hardening commit: `f830ff65fca1f0ba74b9d5c1004126e1c55e315c`

## What is ready

The B0 production candidate identity remains unchanged from the candidate manifest:

- production file count: `21`
- production tree SHA-256: `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`
- candidate ZIP SHA-256: `4233bd16941828489f5cdbefcef16d16a8e947020ee865daf0b21f3ee883ddcd`

The GitHub handoff now contains:

- the B0 candidate manifest;
- deterministic regression suite;
- fail-closed B0 materializer;
- all eight transport chunks;
- repaired byte-stable `part-005.b64` at repair anchor `e806f0eb947844678a21f59f00e6ec416f1a8545`;
- hardened TESTER ONLY instruction requiring the materializer transport-identity marker before any deterministic/browser test.

## Lineage/static repository check

A compare from exact A.5 baseline `9ebc673c2e0dd9dc24f6cbab90455396328f0aad` through tester-instruction commit `f830ff65fca1f0ba74b9d5c1004126e1c55e315c` is ahead-only and contains only files under:

`tooling/llm-api-bridges/ozon-seller/validation/`

No production extension path is changed by the GitHub handoff commits. The production candidate is still materialized from the exact A.5 baseline plus the identity-checked B0 patch transport.

## Mandatory independent gate

`READY_FOR_INDEPENDENT_TEST` does **not** mean accepted.

The independent tester must first run:

```text
python tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_b0_full_read_core_candidate.py <repo-root> <fresh-output-dir>
```

and must receive all six markers:

```text
PATCH_B0_A5_BASE_IDENTITY_PASS
PATCH_B0_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B0_PATCH_APPLY_PASS
PATCH_B0_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B0_CHANGED_FILE_IDENTITIES_PASS
PATCH_B0_TREE_MANIFEST_SHA256_PASS
```

If any marker is absent, stop. Do not run browser tests and do not change production code.

Only after successful materialization may the tester run the deterministic regression and browser acceptance matrix from:

`PATCH_B0_FULL_READ_CORE_CODEX_TEST_INSTRUCTION_2026-08-25.md`

Expected result file:

`PATCH_B0_FULL_READ_CORE_CODEX_RESULT_2026-08-25.md`

No B1–B8 work starts until B0 receives an independent `PATCH_B0_BROWSER_CANDIDATE_ACCEPTED` result.
