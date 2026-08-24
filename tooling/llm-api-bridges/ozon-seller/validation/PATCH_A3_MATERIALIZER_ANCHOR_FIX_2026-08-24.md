# Patch A.3 materializer anchor correction

Branch: `fix/ozon-work-session-refresh-response-boundary-2026-08-24`

Historical validation-blocked result:
`tooling/llm-api-bridges/ozon-seller/validation/PATCH_A3_REFRESH_RESPONSE_BOUNDARY_CODEX_RESULT_2026-08-24.md`

Historical result commit:
`898dcb24c75ca980ea7fc7e6059b8af18e1777eb`

## Classification

The first Patch A.3 retest did not execute browser gates D or E. It stopped during mandatory candidate materialization with:

`RuntimeError: Patch A.3 anchor refresh_route_response_boundary count 0 != 1`

This is a validation/materializer defect, not a production candidate failure.

## Exact cause

The exact Patch A.2 candidate is already protected by:

- `service_worker.js` SHA-256: `1c9bca51298ee215e8b8c29af8be44763eabd76ad1b357b709a996e87f2b0ce6`
- 19-file tree-manifest SHA-256: `ce4ab71244a4ffe7bad680cb99f10360ceec5f55e76410eb8b83d8b686234b3f`

In that exact candidate, the `OZ_WORK_REFRESH` case ends immediately before `OZ_WORK_START` with one newline:

`      }\n      case "OZ_WORK_START": {`

The published A.3 materializer incorrectly required an anchor whose old-route string ended with two newlines before the next case.

The route body itself was correct; only the validation anchor's trailing whitespace was wrong.

Independent anchor inspection against the exact A.2 worker showed:

- post-runtime reload helper insertion anchor: count `1`
- pre-identity insertion anchor: count `1`
- runtime-message completion handler anchor: count `1`
- `OZ_WORK_REFRESH` route start: count `1`
- required A.2 route block with one trailing newline: count `1`

## Correction

Commit `fc7d747374838d1953effaac668ebac6d4b2e832` changes only:

`tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_a3_refresh_response_boundary_candidate.py`

The old-route anchor now matches the exact A.2 candidate's single trailing newline.

The A.3 replacement text itself is unchanged and intentionally inserts the blank line that is part of the already-published A.3 candidate identity.

## Production identity is unchanged

No production file changed as part of this materializer correction.

The intended and required Patch A.3 candidate remains exactly:

- production files: `19`
- `service_worker.js` SHA-256: `d882e393bf3d1e6b89b8a3bec47f858cdf3e523cdf11a2819e30c1e5b3efe770`
- tree-manifest SHA-256: `ddb3cc38586191dd4d015e189847472157ff4ed00c54856f4a11ea4c1b249a21`

Any different candidate identity must be rejected before browser testing.

## Historical result preservation

The first A.3 result remains immutable evidence that the published materializer was blocked. It must not be overwritten.

The next independent run must write a new R2 result file and execute D/E only after the corrected materializer emits every required A.3 PASS marker and the exact hashes above.

`PATCH_A3_MATERIALIZER_ANCHOR_FIX_READY_FOR_R2_RETEST`
