# Block006 — actual content capture, worker hardening and durable evidence

Date: 2026-09-11. This is an intermediate source checkpoint, not a released/full-parity patch.

The four snapshot parts contain 19 actual UTF-8 files: executable reconstruction recipes, new worker and browser test runners, raw per-assertion test logs (including failures), current diff, and the candidate file hashes. Run `python -X utf8 RESTORE_SNAPSHOT.py NEW_DIRECTORY`. Decoded JSON SHA-256: `5bb293734232f2e49f61bdb3ed2448b38b5e9bdcbfd427fbb6e0086f08e31f5f` (70063 bytes). All four uploaded part blob hashes matched the local files.

Reconstruction order: pinned WB0.1.3 -> block004/wb_command_protocol.js into shared -> block005/wb_batch_runtime.js into shared -> block005/apply_worker.py (with worker_insert.js beside it) -> restored recipe/apply_content.py (with content_capture.js beside it) -> restored recipe/final_hardening.py. Do not apply twice. Version at this checkpoint is still0.1.3; final0.1.4 version freeze/package rerun follows.

Actual work: full completed assistant-source capture for Autorun, selected-block-only capture for Manual, source stability checks, no NBSP mutation, safe default startup prompt migration without altering custom prompts, concurrency guard before dispatch, malformed snapshot terminalization, binding recheck before result delivery.

Evidence: protocol47/47 previously saved in block004; newest worker38/38; Manual synthetic browser5/5; Autorun synthetic browser10/10. Old worker9/9 and old synthetic browser7/7 were run earlier this cycle and must be rerun on the final ZIP. They are not full TA or live certification.

Installed-extension QA attempts did NOT reach a product assertion: no serviceworker appeared in disposable headless Chromium in two bounded attempts (with/without ignoring default disable-extensions). Raw harness records called this HARNESS_OR_PRODUCT_INCOMPLETE/FAIL; correct classification is HARNESS_BLOCKED. Do not count these as product FAIL or as PASS. Real installed/live certification remains pending.

No WB endpoints, auth, operation registry or transport changed. Real WB requests=0. No credentials or business/customer data in this snapshot. Next action: freeze0.1.4, reconstruct exact ZIP, run available suites on its extracted bytes, persist report/cursor/source and exact hashes.
