# Patch A browser candidate — R2 ready for independent rerun

Branch: `test/ozon-work-session-lifecycle-patch-a-browser-candidate-2026-08-24`

Status: `PATCH_A_BROWSER_CANDIDATE_R2_READY_FOR_CODEX_RERUN`

## Why this marker exists

The current `PATCH_A_BROWSER_CANDIDATE_CODEX_RESULT_2026-08-24.md` is the old first-run result. That run stopped at the known-bad 10818-byte binary handoff before extraction and before all browser sections A–I. It is not a functional rejection of Patch A.

The transport defect has now been isolated from production code and replaced by byte-exact R2 text transport.

## R2 completed checks

- GitHub transport directory contains exactly `part-000.b64` through `part-020.b64`.
- Part count: `21`.
- `part-000` through `part-019`: `9000` bytes each.
- `part-020`: `2008` bytes.
- Every GitHub part Git blob SHA-1 matches the independently regenerated local manifest.
- Concatenated base64 length: `182008` characters.
- Base64 decode succeeds.
- Reconstructed ZIP size: `136504` bytes.
- Reconstructed SHA-256: `d5e25219c7010495328c8310e0932d468b305921fd1349177fda49ffcb7439b4`.
- Reconstructed Git blob SHA-1: `7292fbbc4133ddad046da050c11d67adf9419183`.
- Reconstructed ZIP is byte-for-byte identical to the canonical candidate retained in the work session.
- ZIP integrity check: PASS.
- Fresh extraction inventory: `19` production files.
- JavaScript syntax check on extracted `.js` files: PASS.
- Production code was not modified by R2 transport work.
- No real Ozon business request was executed during R2 transport work.

## Independent rerun entry point

Use:

`tooling/llm-api-bridges/ozon-seller/validation/CODEX_PATCH_A_BROWSER_CANDIDATE_R2_HANDOFF_2026-08-24.txt`

The independent tester must reconstruct the candidate from R2 chunks, repeat the integrity preflight independently, then execute the complete existing browser test task.

The old truncated binary artifact MUST NOT be used for the R2 rerun.

`TRANSPORT_R2_PREFLIGHT_PASS`
`PATCH_A_BROWSER_CANDIDATE_R2_READY_FOR_CODEX_RERUN`
