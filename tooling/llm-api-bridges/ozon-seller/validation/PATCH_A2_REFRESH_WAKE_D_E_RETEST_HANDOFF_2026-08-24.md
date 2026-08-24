# Patch A.2 Refresh wake — independent D/E retest handoff

Branch: `fix/ozon-work-session-refresh-wake-2026-08-24`

Production candidate identity is unchanged by this handoff marker.

## Candidate

- production files: `19`
- `service_worker.js` SHA-256: `1c9bca51298ee215e8b8c29af8be44763eabd76ad1b357b709a996e87f2b0ce6`
- tree-manifest SHA-256: `ce4ab71244a4ffe7bad680cb99f10360ceec5f55e76410eb8b83d8b686234b3f`

Materializer:
`tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_a2_refresh_wake_candidate.py`

Manifest:
`tooling/llm-api-bridges/ozon-seller/validation/PATCH_A2_REFRESH_WAKE_CANDIDATE_MANIFEST_2026-08-24.md`

Independent test instruction:
`tooling/llm-api-bridges/ozon-seller/validation/CODEX_PATCH_A2_REFRESH_WAKE_D_E_RETEST_2026-08-24.txt`

## Carried-forward accepted evidence

From Patch A.1 validation:

- A PASS
- B PASS
- C PASS
- F PASS
- G-control PASS
- G3 PASS — three consecutive local `OZON_HELP_V1` deliveries
- H PASS
- provider requests = 0
- Alice = environment-only NOT_EXECUTED

Only D and E require execution for Patch A.2 acceptance.

## Required result

Write only:
`tooling/llm-api-bridges/ozon-seller/validation/PATCH_A2_REFRESH_WAKE_CODEX_RESULT_2026-08-24.md`

No production code changes are allowed in the independent retest.

If both D and E pass with the exact candidate identity above, final decision is:
`PATCH_A2_BROWSER_CANDIDATE_ACCEPTED`

If either D or E executes and fails, final decision is:
`PATCH_A2_BROWSER_CANDIDATE_REJECTED`

`PATCH_A2_D_E_RETEST_READY`
