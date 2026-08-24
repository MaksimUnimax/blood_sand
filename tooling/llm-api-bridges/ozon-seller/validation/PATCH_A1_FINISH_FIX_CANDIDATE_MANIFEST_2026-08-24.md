# Patch A.1 Finish fix candidate manifest

Branch: `fix/ozon-work-session-finish-no-autorun-2026-08-24`

Source rejection commit: `5931c3388e1b1b32b9e121ee315be56f1d58db4a`

## Confirmed defect

R2 browser validation executed the real `OZ_WORK_FINISH` worker route with an active visible work-session and no Autorun. The route returned:

`{ok:false, code:"AUTO_RUN_NOT_FOUND", error:"Autorun не найден."}`

and the work-session remained `finishing` instead of reaching `inactive`.

The lifecycle specification requires Finish to stop current-conversation Autorun **if one exists**. Starting a work-session must not start Autorun automatically, therefore a missing Autorun is a normal Finish input and must not reject Finish.

## Patch scope

Exactly one production file changes from the canonical Patch A R2 candidate:

- `service_worker.js`

No provider, quota, timer, cache, history, credential, composer, content-script, popup, adapter, Manual-operation, or work-session-model code is otherwise changed.

Patch file:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_A1_FINISH_NO_AUTORUN_2026-08-24.patch`

Behavioral change:

- Finish still calls `terminalizeFinishOperation(key)` first;
- it then checks whether an Autorun exists;
- if an Autorun exists, the existing `stopAutoRun(key)` path is preserved;
- if no Autorun exists, Finish continues normally;
- a concurrent disappearance producing `AUTO_RUN_NOT_FOUND` is treated as already stopped;
- any other Autorun-stop error remains fail-closed;
- binding retirement and `finishing -> inactive` transition remain unchanged.

## Canonical base identity

Patch A R2 base ZIP:

- size: `136504`
- SHA-256: `d5e25219c7010495328c8310e0932d468b305921fd1349177fda49ffcb7439b4`
- Git blob SHA: `7292fbbc4133ddad046da050c11d67adf9419183`
- production files: `19`
- base `service_worker.js` SHA-256: `592800ac38c2be37e5b18121025da2593f18cc67f71fa5591d9def01fa3278b9`

Canonical base transport remains:

`tooling/llm-api-bridges/ozon-seller/validation/transport-r2/part-000.b64` through `part-020.b64`.

## Patch A.1 candidate-tree identity

After deterministic materialization:

- production files: `19`
- patched `service_worker.js` SHA-256: `f9cb0720f411b479a22f00cb0ba7a3553de8ae8fba62de5a27a904b6d27a287c`
- sorted tree-manifest SHA-256: `bb3cd062be3b5839c7dc11b029ba3d661caaa78e298669742884b920c1d5df33`

Tree-manifest SHA is computed as SHA-256 over the UTF-8 concatenation, in lexicographic path order, of:

`<relative-path>\0<file-sha256>\n`

for all 19 production files.

Deterministic materializer:

`tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_a1_finish_fix_candidate.py`

The materializer reconstructs the already-accepted R2 base bytes, fresh-extracts them, verifies the original `service_worker.js`, applies one exact non-ambiguous overlay, verifies the patched hash and final tree digest, and does not package a release ZIP. This is candidate transport/materialization, not tester-authored production work.

## Local validation performed before GitHub handoff

- `ALL_JS_SYNTAX_PASS`
- `WORK_SESSION_HIDE_SHOW_LEGAL_TRANSITIONS_PASS`
- `WORK_SESSION_FINISH_RETIRES_SESSION_PASS`
- `WORK_SESSION_STALE_ILLEGAL_TRANSITION_REJECTED_PASS`
- `WORK_SESSION_REFRESH_PHASE_TERMINALIZATION_PASS`
- `WORK_SESSION_REFRESH_SINGLE_FLIGHT_AND_RUNTIME_RENEWAL_PASS`
- `WORK_SESSION_REFRESH_GENERATION_HANDSHAKE_PASS`
- `WORK_SESSION_REFRESH_VISIBLE_HIDDEN_RESTORE_PASS`
- `WORK_SESSION_REFRESH_PROTECTED_SCHEDULER_PRESERVATION_PASS`
- `WORK_SESSION_REFRESH_REGRESSION_PASS`
- `WORK_SESSION_FINISH_NO_AUTORUN_OPTIONAL_PASS`
- `WORK_SESSION_FINISH_EXISTING_AUTORUN_STOP_PRESERVED_PASS`
- fresh extraction file count: `19`
- canonical-vs-patched tree diff: only `service_worker.js`

Dedicated regression:

`tooling/llm-api-bridges/ozon-seller/validation/WORK_SESSION_FINISH_NO_AUTORUN_REGRESSION_2026-08-24.mjs`

## Locally packaged non-release check artifact

For byte-level packaging verification only, a local ZIP was produced after the regression run:

- filename: `OZON_BRIDGE_v0.1.19_WORK_SESSION_LIFECYCLE_PATCH_A1_FINISH_FIX_BROWSER_CANDIDATE_2026-08-24.zip`
- size: `137103`
- SHA-256: `4b2b1a380001fb33c7e5d8f3bcde431c3a6f9a0f4ded4c0ccfde955b21265d5f`
- Git blob SHA: `67c722ab1a12e1e6199f63cc1adae0cac85b9b0f`

That local ZIP is not the GitHub transport authority. The GitHub authority for independent testing is the deterministic 19-file candidate tree described above.

## Decision

`PATCH_A1_FINISH_FIX_READY_FOR_INDEPENDENT_BROWSER_RETEST`
