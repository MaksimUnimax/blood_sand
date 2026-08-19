# Ozon Bridge v0.1.19 — current ready tests runbook

Date: 2026-08-19
Status: `READY_TESTS_CURRENT`

This document does not change the B01–B15 acceptance requirements in `CODEX_PRE_OPERATOR_TEST_CHECKLIST_2026-08-19.md`.
It only tells Codex which already-prepared validation files to execute against the exact current candidate.

## Hard rules

- Production candidate is immutable.
- Do not create, modify, patch, adapt, or repair any test file during the Codex validation run.
- Do not create validator/runner/harness/fixture/helper/RERUN infrastructure.
- Run the existing files below exactly as committed.
- If one check fails, continue all independent checks.
- Real Ozon, Performance, and ChatGPT network requests remain forbidden for synthetic checks.
- Do not build the final ZIP.

## Exact candidate pins

- `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

All current ready tests live in:

`tooling/llm-api-bridges/ozon-seller/validation/ready-tests/`

## Existing ready-test inventory

1. `B02_B03_CONTRACT_CURRENT.mjs`
   - blob: `b1a79c8eaf115751fa2895e470434c3a06754a7b`
   - covers B02 + B03 contract/security assertions.

2. `B04_CAPABILITY_CURRENT.mjs`
   - blob: `f4cd9ca231a534228a27e913a23fba66f795ed60`
   - covers B04 capability/entitlement assertions.

3. `B05_B07_B08_ANALYTICS_CURRENT.mjs`
   - blob: `76cd3a02123636eb60e5e048767a26d0178b49f1`
   - covers B05 planning/coalescing/projection, B07 verifier/safe errors, B08 verified cache/prefetch.

4. `B06_WORKER_QUOTA_CURRENT.mjs`
   - blob: `07017368b33979169e7b32328280cb8d25e19c3d`
   - covers current Seller quota scheduling, same-Seller bucket sharing, different-Seller independence, key rotation, Retry-After, public-state privacy, and duplicate prevention.

5. `B09_COMMON_BATCH_CURRENT.mjs`
   - blob: `19ed8d8779f72325b7034e746fc8746137592469`
   - covers B09 common Manual/Autorun batch behavior.

6. `B10_B13_B15_BROWSER_CURRENT.mjs`
   - blob: `e3ea01ff6518626aa1fc9c96398b486cbb584b01`
   - covers B10 normal empty-composer delivery, B13 UI/bindings/owner isolation, and B15 browser/runtime matrix.
   - requires exact qualified environment: Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`.

7. `B11_B12_COMPOSER_WAIT_CURRENT.mjs`
   - blob: `77e99abe10b1468cefff6f0f4ae4b471ef47f7a6`
   - covers B11 occupied/missing composer wait and B12 Manual OFF/OFF→ON behavior.

8. `B14_PERFORMANCE_CURRENT.mjs`
   - blob: `e9bd146e0f98000d31912a6b4412e87c44cf6285`
   - covers B14 Performance boundary without real Performance network.

## Execution

Let `<CANDIDATE>` be one exact reconstructed candidate directory that already passed B01.
Let `<CFT_CHROME_EXE>` be the existing qualified CFT `151.0.7922.47` executable from the already-approved Windows QA environment.

Run, without editing any file:

```text
node tooling/llm-api-bridges/ozon-seller/validation/ready-tests/B02_B03_CONTRACT_CURRENT.mjs <CANDIDATE>
node tooling/llm-api-bridges/ozon-seller/validation/ready-tests/B04_CAPABILITY_CURRENT.mjs <CANDIDATE>
node tooling/llm-api-bridges/ozon-seller/validation/ready-tests/B05_B07_B08_ANALYTICS_CURRENT.mjs <CANDIDATE>
node tooling/llm-api-bridges/ozon-seller/validation/ready-tests/B06_WORKER_QUOTA_CURRENT.mjs <CANDIDATE>
node tooling/llm-api-bridges/ozon-seller/validation/ready-tests/B09_COMMON_BATCH_CURRENT.mjs <CANDIDATE>
node tooling/llm-api-bridges/ozon-seller/validation/ready-tests/B10_B13_B15_BROWSER_CURRENT.mjs <CANDIDATE> <CFT_CHROME_EXE>
node tooling/llm-api-bridges/ozon-seller/validation/ready-tests/B11_B12_COMPOSER_WAIT_CURRENT.mjs <CANDIDATE>
node tooling/llm-api-bridges/ozon-seller/validation/ready-tests/B14_PERFORMANCE_CURRENT.mjs <CANDIDATE>
```

## Result mapping

- B02 + B03: use the actual result of `B02_B03_CONTRACT_CURRENT.mjs`.
- B04: use the actual result of `B04_CAPABILITY_CURRENT.mjs`.
- B05 + B07 + B08: use the actual result of `B05_B07_B08_ANALYTICS_CURRENT.mjs`.
- B06: use the actual result of `B06_WORKER_QUOTA_CURRENT.mjs`.
- B09: use the actual result of `B09_COMMON_BATCH_CURRENT.mjs`.
- B10 + B13 + B15: use the actual result of `B10_B13_B15_BROWSER_CURRENT.mjs` together with the required browser-visible observations from the main checklist.
- B11 + B12: use the actual result of `B11_B12_COMPOSER_WAIT_CURRENT.mjs` together with the checklist requirements.
- B14: use the actual result of `B14_PERFORMANCE_CURRENT.mjs`.

A ready-test process exit failure is not automatically a production FAIL. Report the exact assertion/error and classify it according to the main checklist: production behavior failure => FAIL; unusable/missing existing environment => BLOCKED.

## Final report

The final Codex report must still contain B01–B15 individually as `PASS`, `FAIL`, or `BLOCKED`, all safety counters, tested commit/candidate hashes, and the exact ready-test files actually executed.

If and only if B01–B15 are all PASS, use terminal marker:

`OZON_PRE_OPERATOR_TESTS_PASS`

Otherwise do not emit the PASS marker.

After the report: STOP. Do not fix production and do not build ZIP.
