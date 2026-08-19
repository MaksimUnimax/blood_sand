# Ozon Bridge v0.1.19 — integrated worker-CDP correction + full-gate RERUN13

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_INTEGRATED_RERUN13`

# RERUN13 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

Codex is the independent validator. Production is immutable.

This is ONE top-level execution. Do not ask for or return intermediate results. Do not publish intermediate reports. Do not run a separate preflight.

There are exactly two terminal paths:

1. accepted browser substrate PASS -> continue immediately, in this same process/top-level run, through every applicable permanent block 01-16 -> package exact tested tree after blocks 01-15 PASS -> fresh-extract/byte-verify -> publish one final report;
2. accepted browser substrate FAIL after exhausting the worker transports explicitly authorized below -> publish one final failure report -> STOP without package.

## Authorities — read completely

Permanent living gate:
`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

Gate input checkpoint:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Frozen tested base publication:
`5245551cb4ff01e388146397b1a0075c0e0f013b`

Current repair checkpoint:
`1de4cea770fc8ae09280e65d13e60525fd22e4e7`

Canonical CFT inventory correction:
`36b20ff0c84b791f3418b1f51c23e52e571c8ef3`

Absolute-path correction:
`36bbb81062d12348e87ce6297af2df8566bf6a46`

Validator sandbox supersession:
`2c51de4f3ffb5f979b17bc5597be06d5d085e46a`

RERUN12 report:
`b062a39da8d0d97840db71d7499a5b9c70085b15`

Worker Runtime direct-client correction — authoritative for this run:
`376886cd29d971a354dc18f313fbeb9ba1153922`

Previous integrated RERUN12 plan may be read for unchanged raw-PAGE adapter mechanics:
`3ccce98af12cf1b2e461f4368ae7f1c407b66268`

Current browser harness manifest:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/COMPOSER_WAIT_BROWSER_HARNESS_MANIFEST.md`

Read all referenced targeted/worker/regression/browser harness blobs and historical/current markers required by the permanent gate from live GitHub. Do not substitute old PASS reports for execution in this run.

## Immutable candidate

Frozen artifact:
`tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`

Frozen artifact SHA-256:
`d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`

Repair patch concatenated SHA-256:
`bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Final production hashes:
- `service_worker.js` = `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- `content_script.js` = `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Expected production inventory: 17 files.
Expected changed files: exactly `service_worker.js`, `content_script.js`.
Expected protected unchanged files: 15, byte-identical to frozen base.

Reconstruct from frozen artifact + exact repair patch from scratch in this execution. Do not reuse a prior mutable candidate directory as acceptance evidence.

## Accepted disposable validator environment

Pins:
- Node `v24.12.0`
- Puppeteer `25.4.0`
- CFT `151.0.7922.47`
- canonical source CFT: 308 regular files
- canonical inventory SHA-256 using exactly preflight6 algorithm: `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`

Materialization:
1. absolute repo root and QA root before spawn;
2. verify canonical source CFT inventory;
3. fresh validation-owned byte-identical CFT copy;
4. require source/copy per-file identity;
5. copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` exactly once, `shell:false`, no elevation;
6. require setup exit code `78`;
7. require copied CFT bytes still identical after setup;
8. fresh validation-only profile.

Launch API/options:
- `ignoreDefaultArgs:true`
- `headless:false`
- `enableExtensions:true`
- `waitForInitialPage:false`
- `dumpio:true`

Exact normalized launch args:
- `--user-data-dir=<fresh-profile>`
- `--remote-debugging-port=0`
- `--no-first-run`
- `--no-default-browser-check`
- `--disable-background-networking`
- `--disable-component-update`
- `--disable-sync`
- `--metrics-recording-only`
- `--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0`
- `--no-sandbox`
- `about:blank`

No `--disable-gpu-sandbox`. No other Chrome switch. No dependency/browser update.

`--no-sandbox` is validation-only: it MUST NOT enter production, package, manifest, operator instructions, or live acceptance instructions.

## Mandatory network/isolation contract

- synthetic pages only;
- no operator browser/profile;
- no real credentials;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `REAL_CHATGPT_REQUESTS=0`;
- `OPERATOR_BROWSER_ACTIONS=0`;
- raw PAGE `Fetch` interception enabled before supported-origin synthetic navigation;
- supported ChatGPT/Alice fixtures fulfilled locally;
- unexpected page request failed locally, never continued;
- worker-level provider request instrumentation active before worker-side functional execution;
- any real Seller/Performance/ChatGPT request is terminal FAIL.

## Phase A — exact candidate reconstruction

Execute all permanent block-01 integrity checks before browser behavior:
- artifact and patch hashes exact;
- patch applies without fuzz/manual repair;
- final worker/content hashes exact;
- production inventory 17;
- exactly two changed files;
- protected 15 byte-identical;
- all production JS `node --check`;
- manifest parse;
- no unintended permission/host-permission expansion;
- no tests/reports/credentials/dev artifacts in production tree.

Use this exact tree for all subsequent phases.

## Phase B — browser substrate inside this same run

### B1 install/enumerate

Launch exact environment above.
Require browser alive and exact args.
Call `browser.installExtension(candidateDir)` once.
Call `browser.extensions()` after install.
Require same returned id, enabled candidate, version `0.1.19`.
Never call `extension.triggerAction()`.

### B2 raw PAGE qualification

Never call `browser.newPage()`.

Use browser-level CDP `Target.createTarget({url:'about:blank'})` exactly once for the test page.
Resolve the exact raw PAGE and debugger transport through local DevTools metadata.
Require:
- type `page`;
- raw target CDP/WebSocket usable;
- `Runtime.enable` PASS;
- `Page.enable` PASS;
- `Fetch.enable` PASS;
- `Runtime.evaluate('1+1')` returns 2;
- local inert fixture PASS;
- browser alive.

### B3 worker activation/discovery

Call `extension.workers()`.
If candidate worker already active, use it without reactivation.
If no candidate worker active:
- on qualified raw PAGE call `ServiceWorker.enable`;
- capture registration/version updates;
- identify exact registration scope under `chrome-extension://<extensionId>/`;
- call `ServiceWorker.startWorker({scopeURL:<exact candidate scope>})` exactly once;
- bounded-poll `extension.workers()`;
- no retry/restart/action/popup/wake.

Require candidate worker URL exactly under `chrome-extension://<extensionId>/` and service-worker target still present.

### B4 worker Runtime qualification — two direct CDP transports inside this same phase

Do NOT use `worker.evaluate()` or `worker.evaluateHandle()` anywhere.

#### Transport A — Puppeteer-exposed direct CDP client

For the exact candidate `WebWorker` returned by `extension.workers()`:

`const workerClient = worker.client`

Attempt, recording exact command/error/result:
1. `workerClient.send('Runtime.enable')`;
2. `workerClient.send('Runtime.evaluate', {expression:'1+1', returnByValue:true, awaitPromise:true})`;
3. require no `exceptionDetails` and returned value `2`.

Also enable worker `Network` instrumentation on this direct client if Transport A passes.

If Transport A PASS: select `WORKER_TRANSPORT=PUPPETEER_DIRECT_CDP_CLIENT` and continue to B5.

If Transport A FAIL: do not reactivate/restart the worker. Record exact exception, worker URL, worker target existence, browser liveness. Immediately attempt Transport B on the SAME active worker.

#### Transport B — raw active service-worker target CDP

This is a validation transport fallback, not a production change and not a weakened assertion.

Locate the exact same active candidate `service_worker` target by extension id and URL using raw local DevTools target metadata and/or browser-level `Target.getTargets`.
Require unique target id and exact candidate URL.

Attach directly to that target using either:
- its local `webSocketDebuggerUrl` when exposed; OR
- browser-level CDP `Target.attachToTarget({targetId:<candidateWorkerTargetId>, flatten:true})` and multiplex commands to that returned session id.

Do not create/restart another worker.

On the raw worker target/session require:
1. `Runtime.enable` PASS;
2. `Runtime.evaluate({expression:'1+1', returnByValue:true, awaitPromise:true})` returns 2 without exception;
3. `Network.enable` PASS for provider request accounting;
4. candidate worker URL/target id remain exact;
5. browser liveness PASS.

If Transport B PASS: select `WORKER_TRANSPORT=RAW_SERVICE_WORKER_CDP` and continue. Record Transport A as a harness/API transport failure, not production failure.

If both A and B FAIL: accepting substrate FAIL. Record exact errors for both, raw target table, browser PID/exit/liveness/dumpio, and STOP after the one final RERUN13 report. Do not run permanent blocks/package.

### B5 raw-CDP synthetic page adapter self-check

Use the raw PAGE adapter only; no Puppeteer Page object.
Require on supported synthetic local fixture:
- local fulfillment with real ChatGPT requests 0;
- DOM query/evaluation;
- input/change event dispatch;
- button click handler;
- reload/re-navigation;
- content script initialization on supported synthetic origin;
- browser alive.

All worker-side test expressions in later phases must use the selected direct CDP worker transport from B4, not `worker.evaluate()`.

If B1-B5 PASS print exactly:
`RERUN13_ACCEPTING_WORKER_DIRECT_CDP_SUBSTRATE_PASS`

Then continue immediately to Phase C. Do not stop or publish.

## Phase C — permanent blocks 01-14

Execute every currently applicable requirement of permanent blocks 01-14 from the live permanent gate in this run. All are applicable.

Do not reuse prior PASS results as acceptance. Reconstruct/run canonical targeted/worker/regression harnesses from their live authorities/blobs. No production edits or weakened assertions.

Require all current composer-wait targeted markers, including:
- `TARGETED_MANUAL_OFF_ON_READY_WITH_QUOTA_PRESERVED_PASS`
- `TARGETED_MANUAL_OFF_PENDING_ONLY_RESET_PASS`
- `TARGETED_QUOTA_CACHE_PRESERVED_PASS`
- `TARGETED_OTHER_OWNER_PRESERVED_PASS`
- `TARGETED_ZERO_PROVIDER_CALLS_ON_TOGGLE_PASS`
- `TARGETED_MANUAL_OFF_NARROW_SCOPE_PASS`
- `TARGETED_MANUAL_OFF_LATE_INSERT_COMMIT_BLOCKED_PASS`
- `TARGETED_OCCUPIED_COMPOSER_ENTERS_WAIT_PASS`
- `TARGETED_MISSING_COMPOSER_ENTERS_WAIT_PASS`
- `TARGETED_COMPOSER_WAIT_CLEAR_INSERT_ONCE_PASS`
- `TARGETED_COMPOSER_WAIT_RESTART_RESTORE_PASS`
- `TARGETED_MANUAL_OFF_STOPS_COMPOSER_WAIT_PASS`
- `TARGETED_MANUAL_COMPOSER_WAIT_HELPER_PRESENT_PASS`
- `TARGETED_COMPOSER_WAIT_REGRESSION_PASS`.

Require all historical/current command/security/capability/planner/quota/verifier/cache/common-batch/delivery/UI/Performance regression assertions mandated by the live permanent gate, including exact 60000/5000/65000 timing semantics and zero real provider network.

Assign blocks 01-14 individually from this execution only.

## Phase D — permanent block 15 browser/runtime robustness

Run the complete applicable browser/runtime behavior using the exact reconstructed candidate, qualified raw PAGE adapter, and selected worker direct-CDP transport from B4.

Required current composer-wait markers:
- `FULL_BROWSER_MANUAL_OCCUPIED_PLATE_PERSIST_PASS`
- `FULL_BROWSER_MANUAL_CLEAR_INSERT_ONCE_PASS`
- `FULL_BROWSER_MANUAL_EXISTING_SEND_MICROPHONE_PASS`
- `FULL_BROWSER_NATIVE_COPY_WHILE_WAITING_PASS`
- `FULL_BROWSER_MANUAL_OFF_CANCEL_PENDING_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_READY_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_QUOTA_CACHE_PRESERVED_PASS`
- `FULL_BROWSER_CANCELLED_REPORT_NEVER_REAPPEARS_PASS`
- `OZON_COMPOSER_WAIT_BROWSER_HARNESS_PASS`.

Also execute every other applicable browser/runtime assertion in permanent block 15/historical accepted authorities:
- MV3 candidate worker loaded;
- supported synthetic ChatGPT/Alice content initialization;
- native Copy independence;
- owner/multi-owner isolation;
- lifecycle restart without duplicate state/provider/insertion/Send;
- no provider replay;
- wrong owner/conversation fail closed;
- one-Send/Microphone semantics;
- zero real Seller/Performance/ChatGPT network;
- no unexpected runtime/console failure.

No browser assertion may be skipped because the adapter is raw CDP.

## Phase E — permanent block 16 packaging

Only if blocks 01-15 all PASS in this same run:
1. ZIP exactly the tested 17-file production tree;
2. exclude validation/tests/reports/development/credentials;
3. record ZIP workspace path and SHA-256;
4. fresh-extract to a new directory;
5. require exact 17-file production inventory;
6. compare all 17 files byte-for-byte with tested tree;
7. require final worker/content hashes exact;
8. rerun production JS syntax checks and manifest parse;
9. require package drift = 0.

If block 16 PASS and blocks 01-15 PASS, print exactly:
`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

Do not rebuild package after PASS.

## Failure/report rules

If any functional assertion after accepted substrate fails, classify truthfully as production behavior failure or harness fixture/error based on exact evidence.
If substrate fails, blocks 01-16 are `NOT_RUN`, not `NOT_APPLICABLE`.
No applicable behavior may be marked NOT_APPLICABLE merely because harness failed.
Always record exact worker-runtime method/error if worker qualification fails.

Safety totals required:
- REAL_OZON_REQUESTS=0
- REAL_PERFORMANCE_REQUESTS=0
- REAL_CHATGPT_REQUESTS=0
- OPERATOR_BROWSER_ACTIONS=0
- production modifications by validator=0
- candidate modifications by validator=0
- source CFT modifications by validator=0.

Create exactly one report-only branch:
`validation/ozon-pre-operator-full-gate-composer-wait-rerun13-2026-08-19`

Publish exactly one final report:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN13_2026-08-19.md`

After publication STOP. Do not hand off/rebuild a package inside Codex response beyond reporting the exact generated package path/hash if PASS.

# Required final response schema

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN13_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

worker_runtime_correction_commit:
  376886cd29d971a354dc18f313fbeb9ba1153922

candidate:
  frozen_artifact_sha256: d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c
  repair_patch_sha256: bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d
  final_worker_sha256: dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac
  final_content_sha256: ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda
  production_inventory: 17|NOT_RUN
  changed_files_exactly_2: PASS|FAIL|NOT_RUN
  protected_15_byte_identical: PASS|FAIL|NOT_RUN

environment:
  canonical_source_cft_file_count: 308
  canonical_source_cft_inventory_sha256: d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c
  source_copy_byte_identical: PASS|FAIL
  setup_exit_code: 78|<other>|NOT_RUN
  copied_cft_post_setup_byte_identical: PASS|FAIL|NOT_RUN
  launch: PASS|FAIL|NOT_RUN
  spawn_args_exact_match: PASS|FAIL|NOT_RUN
  no_sandbox_validator_exception_exact: PASS|FAIL|NOT_RUN
  install_extension: PASS|FAIL|NOT_RUN
  enumerate_extension: PASS|FAIL|NOT_RUN
  raw_page_runtime: PASS|FAIL|NOT_RUN
  raw_local_fixture: PASS|FAIL|NOT_RUN
  worker_activation: PASS|FAIL|NOT_RUN
  worker_transport_a_puppeteer_direct_cdp: PASS|FAIL|NOT_RUN
  worker_transport_a_error: <exact|NONE|NOT_RUN>
  worker_transport_b_raw_service_worker_cdp: PASS|FAIL|NOT_RUN
  worker_transport_b_error: <exact|NONE|NOT_RUN>
  selected_worker_transport: PUPPETEER_DIRECT_CDP_CLIENT|RAW_SERVICE_WORKER_CDP|NONE
  worker_runtime: PASS|FAIL|NOT_RUN
  post_worker_browser_liveness: PASS|FAIL|NOT_RUN
  accepting_substrate: PASS|FAIL

full_gate:
  block_01_candidate_integrity_reconstruction: PASS|FAIL|NOT_RUN
  block_02_command_discovery_strict_contract: PASS|FAIL|NOT_RUN
  block_03_provider_security_boundary: PASS|FAIL|NOT_RUN
  block_04_seller_capability_entitlement: PASS|FAIL|NOT_RUN
  block_05_query_planner_coalescing_projection: PASS|FAIL|NOT_RUN
  block_06_global_seller_quota_scheduler: PASS|FAIL|NOT_RUN
  block_07_response_verifier_safe_errors: PASS|FAIL|NOT_RUN
  block_08_verified_analytics_cache_prefetch: PASS|FAIL|NOT_RUN
  block_09_manual_autorun_common_batch_engine: PASS|FAIL|NOT_RUN
  block_10_delivery_fsm_normal_empty_composer: PASS|FAIL|NOT_RUN
  block_11_manual_delivery_occupied_missing_composer: PASS|FAIL|NOT_RUN
  block_12_manual_off_cancellation_off_on_readiness: PASS|FAIL|NOT_RUN
  block_13_ui_bindings_owner_isolation: PASS|FAIL|NOT_RUN
  block_14_performance_regression_boundary: PASS|FAIL|NOT_RUN
  block_15_browser_runtime_robustness: PASS|FAIL|NOT_RUN
  block_16_packaging_gate: PASS|FAIL|NOT_RUN
  terminal: PASS|FAIL|NOT_RUN

network:
  real_ozon_requests: 0
  real_performance_requests: 0
  real_chatgpt_requests: 0
  operator_browser_actions: 0

modifications:
  production_by_validator: 0
  candidate_by_validator: 0
  source_cft_by_validator: 0

package:
  workspace_path: <absolute path|NONE>
  sha256: <sha256|NONE>
  fresh_extract_byte_identical: PASS|FAIL|NOT_RUN

failure_classification:
  NONE|PRODUCTION_BEHAVIOR_FAILURE|HARNESS_FIXTURE_FAILURE|HARNESS_ERROR|ENVIRONMENT_ERROR

umbrella_marker:
  OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|ABSENT

report_branch:
  validation/ozon-pre-operator-full-gate-composer-wait-rerun13-2026-08-19

report_commit:
  <sha>
```
