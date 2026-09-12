# Corrective parity — block 03: causal source comparison
Date: 2026-09-12
Status: CAUSES CONFIRMED / RED TESTS NEXT / NOT A RELEASE
Previous checkpoint block 02 remotely read back at 9774bc6e2db8f5337a2302b3aef2a70390451cb4, blob 814acedede28904312b8268c6f333efdf9e71d08.

## F-02 — early throw loses the chat result
WB021 `service_worker.js` lines 949–1037 were inspected. Lines 959–965 throw for manual-off/competing Autorun before the durable operation is created. Lines 966–967 parse and then throw `Operation blocked locally` for a single local-code entry. Durable manual operation creation starts at 971. The catch at 1029–1035 marks failures and rethrows rather than preparing a report. Therefore zero provider calls alone cannot be PASS: the AI does not receive the failure result.
Ozon reference `service_worker.js` lines 1956–2070 were inspected. `buildPreExecutionErrorResult` produces safe `ok=false`, `bridge_error=true`, `pre_execution_error=true`, `http_status=0`, `external_request_executed=false`, report and fingerprint. `executeManualCommand` converts Work/manual/competing-channel/discovery failures into `batchErrorEntry` before durable creation; the accepted batch persists entries. Port this causal path, not just toast wording. Binding/identity failures still must fail closed; no cross-chat delivery to report an error.

## Popup — contradictory controllers
Ozon reference popup HTML has Work controls at lines 13–17, per-tab AI at 18–27, binding, policy, metadata, credentials and diagnostics. Line 34 explicitly makes Work sole page-button owner.
WB021 popup HTML read fully (62 lines): Work toggle at 16 plus competing `manualMode` at 33; primary Autorun controls at 29–34; unrelated custom global AI/bootstrap controls at 14–25. Lines 53–55 still describe Copy as execution and contain Ozon-derived `posting_fbs_get` wording. Two scripts independently render state: popup.js and popup_runtime.js.
WB popup_runtime.js read fully (17 lines): successful Work action updates only `workState` and `runtimeStatus`, not the old main `status` plaque. This explains `active_visible` plus stale `WORK_NOT_ACTIVE`. The production fix must unify rendering and authority, not merely hide the warning with CSS.
Ozon popup.js source 90–238 requested; relevant renderState 116–207 inspected. Large combined output truncated near 216, so handler tail 210–238 must be reread separately before use. Earlier combined HTML output also truncated; WB HTML was reread fully. No full-file audit claim for either popup.js.

## Exact local evidence
Source digest/read ranges are recorded by `read_local.py` into local `READ_LOG.jsonl`, flushed/fsynced after each read request. A recorded requested range is not proof of full delivered output when truncation occurs; truncations and rereads are explicitly noted above.
WB021 worker SHA256: ef4a...? Use INPUT archive identity and per-file generated READ_LOG, not this placeholder: no worker hash is asserted here. Ozon worker SHA256: d8166091c20d2ee36b4613146316282a0c73c9203b75109bc6b28c15d2a1f810.

## Proven local test route recovered
Previous `START_HERE_021.md` read fully. Existing no-provider runners are available: contract.mjs, policy_artifacts.mjs, work_delivery_worker.mjs, protocol.mjs, batch_worker.mjs, worker_error.mjs, runtime_extra.mjs, browser_final.py. Archived 466+58 assertions are WB self-tests, not differential parity acceptance. Browser suites are synthetic and do not establish logged-in-site behavior.

## Next bounded action
Read shared/runtime_worker.js, wb_batch_runtime.js, wb_command_protocol.js and focused existing worker harness. Build RED cases against exact Ozon-derived semantics for popup one-owner, structured local error delivery and mixed HELP/API. Persist runner/results before modifying production; then implement those direct paths. Do not replace entire worker or alter WB registry/provider serialization. Continue P4–P9 after the connected initial correction, not implicitly mark them accepted.

New runtime changes: 0. New tests: 0. Marketplace provider calls: 0. Business mutations: 0.
