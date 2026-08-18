# Ozon Bridge v0.1.19 — Manual composer-wait repair candidate checkpoint

Date: 2026-08-18
Status: `DETERMINISTIC_CANDIDATE_READY_FOR_FINAL_FULL_CODEX_GATE`

## Candidate authority

The candidate is deterministically defined as:

1. exact published frozen repair artifact:
   `tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`
2. artifact SHA-256:
   `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
3. apply exactly once the byte-pinned repair patch reconstructed from `patch-parts/00.patch.part` + `patch-parts/01.patch.part`;
4. repair patch bytes: `13648`;
5. repair patch SHA-256:
   `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`.

This candidate authority is immutable for the final gate. No manual patch repair/fuzz/context editing is authorized during validation.

## Authorized production delta

Exactly two production files may differ from the starting frozen artifact:

- `content_script.js`;
- `service_worker.js`.

All other production files must be byte-identical to the starting frozen artifact.

Starting frozen hashes:

- `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`;
- `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`.

The exact frozen content script was independently reconstructed in targeted engineering and matched its published hash byte-for-byte. After applying this repair patch, expected `content_script.js` SHA-256 is:

`ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

The final repaired exact-frozen `service_worker.js` SHA-256 must be computed from the exact frozen artifact during final reconstruction and then treated as immutable for the remainder of that consolidated gate. A worker reconstructed from any approximate/proxy source is not acceptable.

## Current canonical targeted test authority

Reconstruct four GitHub targeted test parts exactly as specified in:

`PATCH_AND_TARGETED_TEST_PARTS.md`

Expected harness:

- bytes: `21942`;
- SHA-256: `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`.

Targeted development result: PASS.

Covered changed-path behavior includes:

- old stuck-owner RED reproduction;
- old `COMPOSER_NOT_FOUND` RED reproduction;
- occupied composer -> recoverable Manual wait;
- temporarily missing composer -> recoverable Manual wait;
- exact persistent plate `Очистите поле ввода, чтобы получить отчёт.`;
- existing draft preserved;
- one insert only after clear;
- content wait restart/restore;
- Manual OFF stops waiter and destroys only eligible claimed pending report;
- requesting/quota-wait and post-commit delivery states are not broadly deleted;
- OFF -> ON restores worker Manual readiness;
- late insert commit after OFF is blocked;
- quota/cache objects including `last_provider_request_at` / `next_allowed_at` and 60000/5000/65000 timing remain unchanged;
- other owners remain unchanged;
- provider calls caused by OFF/ON/cancellation: zero.

## Targeted static/change audit

Repair diff changes only two files.

Current repair patch numstat:

- `content_script.js`: `+147 / -3`;
- `service_worker.js`: `+39 / -0`.

Targeted engineering checks passed:

- changed `service_worker.js` syntax;
- changed `content_script.js` syntax;
- repaired exact frozen content-script syntax;
- `git apply --check` against clean development baseline;
- `git diff --check` after application;
- `git apply --check` against exact reconstructed frozen V3 content;
- V3-shaped worker context application without fuzz/manual repair;
- no added `fetch`, provider host, provider execution, quota/cache, retry or credential logic in the repair diff.

## Final-gate requirement

No operator ZIP may be produced or handed off from this checkpoint alone.

The next validation step is exactly one consolidated independent Codex execution of:

`OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

against this deterministic candidate.

The final gate must reconstruct the exact frozen artifact, verify the base ZIP hash, verify repair patch bytes/hash, require clean patch application, compute and pin the final exact worker hash, verify the expected repaired content hash, run every currently applicable full regression block, and publish a report-only result.

Only `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` authorizes packaging.

## Live-status boundary

The complete v0.1.19 logged-in live suite is still pending. This checkpoint and any later synthetic/Codex PASS do not retroactively mark it live-tested.