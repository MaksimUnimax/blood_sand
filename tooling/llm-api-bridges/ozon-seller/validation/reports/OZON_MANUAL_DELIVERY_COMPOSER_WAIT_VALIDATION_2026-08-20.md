# Ozon v0.1.19 Manual delivery composer-wait — independent milestone validation

- tested_target = `14829f418068e40d76c5d992ff9158c4faebbbd0`
- development branch = `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`
- report branch = `validation/ozon-manual-delivery-composer-wait-2026-08-20`

## Candidate integrity

- Frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c` — PASS.
- Patch bytes: `13648`; patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d` — PASS.
- Repaired `service_worker.js` SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac` — PASS.
- Repaired `content_script.js` SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda` — PASS.
- Only the temporary extracted candidate was LF-normalized after Windows `git apply --no-index` materialized CRLF bytes. ZIP, patch parts, committed worktree, and production were not modified.

## Existing targeted regression

`RUN_TARGETED_COMPOSER_WAIT_REGRESSION.mjs` completed PASS against the exact reconstructed candidate. It emitted all required `TARGETED_*_PASS` markers, including:

- `TARGETED_MANUAL_OFF_PENDING_ONLY_RESET_PASS`
- `TARGETED_QUOTA_CACHE_PRESERVED_PASS`
- `TARGETED_OTHER_OWNER_PRESERVED_PASS`
- `TARGETED_ZERO_PROVIDER_CALLS_ON_TOGGLE_PASS`
- `TARGETED_MANUAL_OFF_LATE_INSERT_COMMIT_BLOCKED_PASS`
- `TARGETED_OCCUPIED_COMPOSER_ENTERS_WAIT_PASS`
- `TARGETED_COMPOSER_WAIT_CLEAR_INSERT_ONCE_PASS`
- `TARGETED_COMPOSER_WAIT_RESTART_RESTORE_PASS`
- `TARGETED_MANUAL_OFF_STOPS_COMPOSER_WAIT_PASS`
- `TARGETED_MISSING_COMPOSER_ENTERS_WAIT_PASS`
- final `TARGETED_COMPOSER_WAIT_REGRESSION_PASS`.

## Worker/state validation

The committed actual-worker harness independently executed and passed the public worker state/privacy paths:

- `V3B_ACTUAL_MANUAL_PUBLIC_STATE_PASS`
- `V3B_ACTUAL_AUTORUN_PUBLIC_STATE_PASS`
- `V3B_ACTUAL_PUBLIC_STATE_PRIVACY_PASS`.

It then timed out in its guarded-due fixture before its provider-call section. A temporary fixture-only correction widened the pre-deadline observation window (`last=now-60000` to `last=now-57000`), but the same `waitFor timeout` remained. No production code or committed harness was changed. The canonical targeted regression above remains PASS for cancellation scope, quota/cache preservation, other-owner isolation, stale insert-commit rejection, and OFF/ON zero-provider behavior.

Worker/state result: PARTIAL — no production assertion failed; full independent worker fixture completion was not obtained.

## Browser composer-wait validation

Environment: Node v24.12.0, Puppeteer 25.4.0, CFT 151.0.7922.47; no operator browser/profile was used.

An exact copied committed browser harness was first placed in a validation-only temporary directory with a junction to the existing QA `node_modules`; source and copy SHA-256 were identical. This corrected the frozen-worktree ESM dependency-resolution problem without changing the QA project or committed harness.

Browser execution could not reach a browser/product assertion:

1. Original manual-spawn/connect harness timed out waiting for an MV3 service-worker target.
2. Temporary extension-origin popup activation was added only to the temporary harness. It exposed a substrate defect: after `browser.installExtension()`, `browser.newPage()` timed out after 30 seconds before opening the popup.
3. Reusing an initial page was not possible because `browser.pages()` returned no page; the harness recorded `initial Chromium page unavailable`.
4. A temporary native Puppeteer launch correction using `enableExtensions:true` also timed out after 30 seconds before the first browser checkpoint.

Therefore no synthetic ChatGPT DOM assertion (plate text, occupied composer preservation, insert-once, restart/recovery, OFF cancellation, wrong-owner exclusion, native Copy independence, or provider-network observation) could start. This is an environment/browser-substrate blocker, not evidence of a production behavior failure.

## Direct dependency regression boundary

Covered by the passing canonical targeted regression: Manual ownership/state, claim/insert-commit authority, quota/cache preservation, owner isolation, post-insert watch/recovery behavior, and ChatGPT composer-wait behavior in the canonical synthetic harness.

Browser runtime coverage remains blocked by the CFT/Puppeteer page/worker substrate described above.

## Temporary local harness/fixture corrections

- Reconstruction fixture: raw byte-stream patch concatenation; then LF normalization of the temporary candidate only after Windows no-index apply.
- Worker harness copy: guarded-due timing fixture widened; it remained timed out and was not treated as a product failure.
- Browser harness copy: temporary `node_modules` junction, extension-origin activation attempt, existing-page reuse attempt, and native Puppeteer launch attempt. None were committed.

## Counters and modifications

- `REAL_OZON_REQUESTS = 0`
- `REAL_PERFORMANCE_REQUESTS = 0`
- `OPERATOR_BROWSER_ACTIONS = 0`
- `production_modifications = 0`
- ZIP: NOT_BUILT

## Final verdict

`COMPOSER_WAIT_STAGE_BLOCKED`

The production candidate integrity and canonical targeted composer-wait regression passed. The milestone cannot be accepted because independent browser composer validation was physically blocked before first product/browser assertion by the existing CFT/Puppeteer substrate.