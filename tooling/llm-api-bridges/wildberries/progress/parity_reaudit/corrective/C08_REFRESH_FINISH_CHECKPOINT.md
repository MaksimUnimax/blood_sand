# C08 — connected Refresh/Finish, durable recovery and fail-closed wake

Date: 2026-09-12. Status: WIP_TARGETED_PASS_NOT_FULL_PARITY_NOT_INSTALLED.
Continue immediately after checkpoint; no owner/provider tests yet.

## Actual source

Base is exact restored P1 + C04 + C06 (not original WB021 alone). Apply C08_RUNTIME.patch.xz.b64 at c784208b435ae9eba03b3afa339bdcb9bcff7e40, then C08_HARDENING.patch.gz.b64 at cc8a842a213e6e43f822e94693238dc0ef26f010.

Remote Git blob readback verified:
- C08_RUNTIME.patch.xz.b64: d215d75da3096e25b5a43d3e34f164dc82d7c5d1.
- C08_HARDENING.patch.gz.b64: 6eda07149eab341f49d66e0d986069ca7719f76c.
- C08_RUNNERS.tar.xz.b64 at a8c843297f0a1922710595c4eda3aa0668d36289: 51b062925b62643926f8324e5df28b9dc3176dad.
- C08_RECEIPTS.tar.xz.b64 at 5873f787e028a68eef4d5a4d58db2f02964f0d31: 6129937ee2aa2e23e8ea17f70f3be7a15116ea2d.

Uncompressed hardening diff SHA-256: 59b32acf3cf2db5d4c7fc8f61d271a3d0f49146dd95d7fd2dc610976a6c0889c.
Runners archive SHA-256: 81c706400d97e807a606c07066befc99eefaf90321c768691d1f624c0add3674.
Receipts archive SHA-256: 64296cf08028d3ecd80c3b156a12f7dbae0c4a89c7a68f468883143298a23877.
Current complete file hashes are in receipts SOURCE.json. Local source commit dcba253d4dba8b257c1e03267fc615a793b512f6, workspace /mnt/data/wb_continuation_live_20260912/candidate.

## Cause and correction

Compared with pinned late Ozon executable source 1b3f0961ff9399430c9e5b3b70a4188f1282429d, WB Refresh lacked durable owner/revision/generation recovery. Finish did not reliably terminate the active logical operation; interrupted visibility commit could leave the API gate active.

New shared/work_recovery_worker.js is connected to actual popup->worker->content consumers, not an isolated model. Refresh persists intent, closes Work gate, records local operation outcome, freezes old runtime, commits renewal before one reinitialization, requires fresh physical runtime and correlated logical generation/baseline/visibility acknowledgements. Worker wake resumes committed recovery without resending prompt, provider request or runtime reinitialization. Single-flight wake prevents duplicate handshakes. Invalid/expired owner/generation records fail closed. Work reads treat an uncompleted recovery record as authoritative even when an intermediate active write survived interruption.

Finish invalidates pending recovery and terminates in-flight logical execution/delivery without starting Autorun. Late manual results cannot overwrite operator cancellation or return a delivery whose durable commit failed. Provider outcome unknown remains unknown_no_retry; saved artifacts/payloads are preserved.

## Actual tests, not claims from older transcripts

RED on restored C06: 4 passed / 16 failed (20 Refresh tests). New adversarial RED: 9 passed / 9 failed; one failing assertion was fixture identity-read bookkeeping, eight exposed missing guards. Both raw runs preserved.

Final selected unique runs (do not add earlier reruns):
- C08-final-refresh_integration: 20 passed.
- C08-final-refresh_races: 18 passed.
- C08-final-start_integration: 12 passed.
- C08-final-start_guards: 30 passed.
- C08-final-refresh-browser: 12 passed (ChatGPT and Alice).
- C08-final-start-browser: 8 passed.
Total: 100 passed, 0 failed; stdout/stderr/exit codes and per-case receipts saved. Final browser stderr is empty.

The repeat-Refresh browser timeout was traced to the fixture asyncio pipe reader exceeding 64KiB (diagnostic preserved), NOT a proven product deadlock. The fixture uses a 4MiB reader and drains transport before browser teardown. This corrects the preliminary suspicion in chat.

All tests use actual production JS with mocked Chrome boundaries and synthetic AI DOM. No native MV3/installed/live PASS. No marketplace calls or business mutations. Full regression and remaining parity remain open.

Runners: C06 tests -> overlay C07_REFRESH_FINISH_RED tests -> overlay C08_RUNNERS tests. Receipts retain exact evidence and source hashes; runtime patches are separate (README runtime.patch reference refers to the separately published hardening delta).

## Next, without restarting P1 or history inventory

P3: examine pinned late Ozon ordered mixed HELP/API implementation and HELP V2/guidance. Earlier re-audit clauses requiring blanket MIXED_HELP_AND_API rejection conflict with later executable Ozon; add explicit source-backed correction and RED/GREEN tests before changing WB. Preserve WB 188/172/16 and exact provider serialization. Continue remaining P2 early/busy/storage/transport errors, P5/P6 transactional delivery and P8/P9/full gate. Also retain adversarial follow-up for cancellation during held handshake/provider completion and baseline eligibility. WIP is not an installable release.
