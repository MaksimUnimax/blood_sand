# Autorun HELP_V2 patch — exact pre-handoff record

PRE-HANDOFF PASS. LIVE CERTIFICATION: PENDING POST-INSTALL. CI `34679992710`.

Baseline `ee80e80443ac10f733cdd58884cfd2dbf12bbefb` → executable `0cc968ee4b76d41e9c0361a905812fe49f313585`, tree `f9aa7ea1b1d00d6d3abdb22f1bb6adba78a84a90`.

Archive `OZON_BRIDGE_v0.1.19_AUTORUN_HELP_V2_20260912.zip`; 259715 bytes; SHA-256 `4dd7139232317b1e55c432d47bcb2a7ced89e8c425ffcdfab679694541d1a225`; 32 production files.

## Production change
Only `dist-step7-candidate/content_script.js`: a pure shared predicate recognizes the three established API/V1/V2 markers at both ingress guards. No generic OZON prefix, no parser/transport/ownership bypass. Mixed API+HELP already passed the old marker filter because of its API marker; this is a compatibility control, not an invented third defect.

## Actual checks
39 new behavioral cases on Linux and Windows; 20 browser adapter cases; 31 existing regression scripts on each platform; five browser fixtures; attachment primitive; actual MV3 worker smoke; complete exact-package parity. API calls inside deterministic tests are fixture transport calls, not requests to Ozon. Real provider calls: 0.

## First-failure ledger
Original structural RED `34675943200` is preserved. Added behavioral RED reproduces both pure-V2 failures, including a first-guard-only intermediate control.
Local VM storage prototype mismatch was corrected in test deserialization only.
Run `34678961428`: six base64 transcription differences caused integrity failure before production materialization. Original local encoded and decoded SHA-256 were retained, exact bytes restored.
Run `34679020382`: browser fixture normal-flow text collapsed newlines; fixture corrected to rendered pre/code while exact text assertion retained.
Run `34679147676`: Alice fixture omitted active history corroboration; actual ChatListItem/button prerequisite added, ownership guard not weakened.
Targeted v3 then passed and materialized only tested bytes. Production frozen after that commit.
The old unrelated malformed `ozon-alice-large-result-delivery-v1-2026-09-10.yml` workflow can emit jobless failures on pushes. It is not silently relabeled green or used as this repair authority; its executable regressions are included in the authoritative chain.

## Post-install acceptance
Install only the exact archive above. In active Autorun, exercise one HELP_V2, three HELP_V2 and HELP/API; verify PROMPT_ACCEPTED, ordered output and no manual-click workaround. HELP-only has zero provider requests. Verify recreation/duplicate guard and a wrong-conversation negative. Validate actual result metadata before any LIVE PASS.

## Behavioral cases
| Test | Result |
|---|---|
| POSTFIX_HELP_V2_SINGLE | PASS |
| POSTFIX_HELP_V2_TRIPLE | PASS |
| POSTFIX_HELP_V2_API_MIXED | PASS |
| POSTFIX_API_V1 | PASS |
| POSTFIX_HELP_V1 | PASS |
| PLAIN_TEXT_NO_ADMISSION | PASS |
| RESULT_ONLY_NO_ADMISSION | PASS |
| PARTIAL_HELP_TOKEN_NO_ADMISSION | PASS |
| NO_MESSAGE_NO_ADMISSION | PASS |
| STREAMING_AND_2000MS_STABILITY_GUARD | PASS |
| BASELINE_ASSISTANT_NOT_REPLAYED | PASS |
| ONLY_LATEST_NEW_ASSISTANT_IS_CANDIDATE | PASS |
| WRONG_CONVERSATION_BLOCKED | PASS |
| WRONG_ORIGIN_BLOCKED | PASS |
| UNCONFIRMED_ROOT_BLOCKED | PASS |
| WRONG_WATCH_KEY_BLOCKED | PASS |
| SPA_CHANGE_DURING_STABILITY_STOPS_WATCH | PASS |
| CHANGED_FINGERPRINT_RESTARTS_STABILITY | PASS |
| FINAL_RECHECK_REMOVED_MARKER_BLOCKED | PASS |
| FINAL_RECHECK_CHANGED_TEXT_BLOCKED | PASS |
| FINAL_RECHECK_COMPLETENESS_BLOCKED | PASS |
| AUTORUN_DISABLES_MANUAL_MODE | PASS |
| DISPOSED_CONTENT_CANNOT_ADMIT | PASS |
| CONCURRENT_TICKS_SINGLE_HANDOFF | PASS |
| FULL_CONTENT_WORKER_QUEUE_OUTPUT_SINGLE | PASS |
| WORKER_RECREATION_NO_DUPLICATE_SINGLE | PASS |
| FULL_CONTENT_WORKER_QUEUE_OUTPUT_TRIPLE | PASS |
| WORKER_RECREATION_NO_DUPLICATE_TRIPLE | PASS |
| FULL_CONTENT_WORKER_QUEUE_OUTPUT_MIXED | PASS |
| WORKER_RECREATION_NO_DUPLICATE_MIXED | PASS |
| FULL_CONTENT_WORKER_QUEUE_OUTPUT_API_THEN_HELP | PASS |
| WORKER_RECREATION_NO_DUPLICATE_API_THEN_HELP | PASS |
| FULL_CONTENT_WORKER_QUEUE_OUTPUT_MALFORMED_HELP_THEN_VALID | PASS |
| WORKER_RECREATION_NO_DUPLICATE_MALFORMED_HELP_THEN_VALID | PASS |
| WORKER_WRONG_TAB_FAIL_CLOSED | PASS |
| WORKER_WRONG_LIVE_CONVERSATION_FAIL_CLOSED | PASS |
| WORKER_MISSING_BINDING_FAIL_CLOSED | PASS |
| WORKER_MISSING_RUN_FAIL_CLOSED | PASS |
| WORKER_MANUAL_MODE_FAIL_CLOSED | PASS |
