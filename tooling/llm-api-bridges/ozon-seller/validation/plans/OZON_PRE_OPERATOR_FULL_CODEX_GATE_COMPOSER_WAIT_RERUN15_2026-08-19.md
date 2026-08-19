# Ozon Bridge v0.1.19 — integrated full-gate RERUN15

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_INTEGRATED_RERUN15`

# RERUN15 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

Codex is the independent validator. Production is immutable.

This is ONE top-level execution. Do not ask for or return intermediate results. Do not run a separate preflight. Do not publish intermediate reports.

## Authorities — read completely

1. Permanent living gate:
`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

2. Gate input checkpoint:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

3. Frozen tested base publication:
`5245551cb4ff01e388146397b1a0075c0e0f013b`

4. Current repair checkpoint:
`1de4cea770fc8ae09280e65d13e60525fd22e4e7`

5. Canonical CFT inventory correction:
`36b20ff0c84b791f3418b1f51c23e52e571c8ef3`

6. Absolute-path correction:
`36bbb81062d12348e87ce6297af2df8566bf6a46`

7. Validator sandbox supersession:
`2c51de4f3ffb5f979b17bc5597be06d5d085e46a`

8. Worker Runtime direct-client correction:
`376886cd29d971a354dc18f313fbeb9ba1153922`

9. Control-flow correction:
`57efec456b5416094fca0917a2310a5946106a1b`

10. RERUN13 report proving accepted worker substrate:
`9e275d784b46c46dc86f1f0ca02eb5e12094ec37`

11. RERUN14 report:
`b9f2c7674595e3a976ea7903901b4aeadf65f0ab`

12. RERUN14 Phase-B worker activation/order correction — authoritative for this run:
`a7d2e1ca92c711089ff556c9e14a1870eb474eea`

13. Current browser harness manifest:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/COMPOSER_WAIT_BROWSER_HARNESS_MANIFEST.md`

Read all referenced live harness blobs/authorities required by the permanent gate. Prior PASS reports are evidence/architecture only and do not substitute for fresh applicable execution.

## Immutable candidate pins

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
Expected changed production files: exactly `service_worker.js`, `content_script.js`.
Expected protected unchanged production files: 15, byte-identical to frozen base.

Reconstruct the candidate from frozen artifact + exact repair patch from scratch in this run. Do not reuse any mutable prior candidate directory as acceptance evidence.

## Accepted disposable validator environment

Pins:
- Node `v24.12.0`
- Puppeteer `25.4.0`
- CFT `151.0.7922.47`
- canonical source CFT files: `308`
- canonical inventory SHA-256 using exactly the preflight6 algorithm:
  `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`

Use:
- fresh validation-owned byte-identical CFT copy;
- copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` once, `shell:false`, no elevation, require exit 78;
- post-setup copied-tree byte identity;
- fresh validation-only profile;
- `ignoreDefaultArgs:true`;
- `headless:false`;
- `enableExtensions:true`;
- `waitForInitialPage:false`;
- `dumpio:true`.

Normalized Chrome args must be exactly:
1. `--user-data-dir=<fresh-profile>`
2. `--remote-debugging-port=0`
3. `--no-first-run`
4. `--no-default-browser-check`
5. `--disable-background-networking`
6. `--disable-component-update`
7. `--disable-sync`
8. `--metrics-recording-only`
9. `--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0`
10. `--no-sandbox`
11. `about:blank`

No `--disable-gpu-sandbox`. No other Chrome switch. No dependency/browser update. No operator browser/profile/credentials.

The validation-only `--no-sandbox` exception MUST NOT enter production, package, manifest, operator instructions, or live acceptance instructions.

## Phase 0 — exact RERUN15 executable and static control-flow gate

Create a NEW top-level executable named exactly:
`RERUN15_INTEGRATED_FULL_GATE_RUNNER.mjs`

Do not execute any RERUN11/RERUN12/RERUN13/RERUN14 top-level runner.

Before execution:
1. `node --check RERUN15_INTEGRATED_FULL_GATE_RUNNER.mjs`;
2. compute and record SHA-256;
3. statically require explicit awaited Phase A -> B -> C -> D -> E control flow;
4. require Phase B PASS reaches Phase C with no return/process.exit/report/cleanup terminal path;
5. require Phase C reaches D only after blocks 01-14 PASS;
6. require D reaches E only after block 15 PASS;
7. require umbrella marker is reachable only after block 16 PASS;
8. require Phase-B code contains all ordered worker-activation evidence steps from correction `a7d2e1ca...`;
9. require exact spawn-argument assertion occurs before `browser.installExtension`;
10. require no generic terminal `throw new Error('worker missing')` or equivalent without mandatory activation evidence capture;
11. require no `browser.newPage()`;
12. require no `worker.evaluate()` / `worker.evaluateHandle()`;
13. require all async phases and child harness executions are awaited.

If the static gate fails, repair ONLY validation runner code before execution. Do not modify candidate/production.

## Mandatory phase markers

Print only as each boundary is actually crossed:
- `RERUN15_PHASE_A_CANDIDATE_DONE`
- `RERUN15_PHASE_B_SUBSTRATE_DONE`
- `RERUN15_PHASE_C_BLOCKS_01_14_STARTED`
- `RERUN15_PHASE_C_BLOCKS_01_14_DONE`
- `RERUN15_PHASE_D_BLOCK_15_STARTED`
- `RERUN15_PHASE_D_BLOCK_15_DONE`
- `RERUN15_PHASE_E_BLOCK_16_STARTED`
- `RERUN15_PHASE_E_BLOCK_16_DONE`

## Phase A — deterministic candidate integrity

Execute all current permanent block-01 integrity requirements on the exact reconstructed candidate:
- artifact/patch hashes exact;
- patch applies without fuzz/manual repair;
- final worker/content hashes exact;
- inventory 17;
- changed files exactly 2;
- protected 15 byte-identical;
- all production JS syntax PASS;
- manifest parse PASS;
- no permissions/host-permission expansion;
- no test/report/dev/credential artifacts in production tree.

Print `RERUN15_PHASE_A_CANDIDATE_DONE` after these prerequisites succeed.

## Phase B — accepted browser substrate, exact ordered implementation

Execute in this exact order.

### B1 environment + launch args

- verify CFT source/copy/setup/post-setup identity;
- launch exact disposable no-sandbox contract;
- immediately after launch normalize actual Chrome args and require exact match;
- set `spawn_args_exact_match=PASS` BEFORE extension install;
- if mismatch: substrate FAIL with exact expected/actual diff.

### B2 install/enumerate + raw PAGE

Only after B1 PASS:
- `browser.installExtension(candidateDir)` exactly once;
- `browser.extensions()` and exact candidate id/enabled/version `0.1.19`;
- never use `extension.triggerAction()`;
- create one raw `page` target; never `browser.newPage()`;
- require raw PAGE `Runtime.enable`, `Page.enable`, `Fetch.enable`, `Runtime.evaluate('1+1') === 2`;
- require local inert fixture PASS;
- block/fail unexpected external page requests;
- require browser alive.

### B3 deterministic candidate worker activation/discovery

Follow correction `a7d2e1ca...` exactly.

1. Call `extension.workers()` and record exact candidate worker list.
2. Independently call raw `Target.getTargets` and record exact candidate service-worker targets under `chrome-extension://<extensionId>/`.
3. If a unique exact candidate worker exists by either route, do not reactivate it; proceed to B4.
4. If neither exists:
   - register listeners for `ServiceWorker.workerRegistrationUpdated` and `ServiceWorker.workerVersionUpdated` on the already-qualified PAGE CDP session;
   - call `ServiceWorker.enable`;
   - bounded-wait for unique registration scope belonging to `chrome-extension://<extensionId>/`;
   - record exact registration id/scope/version evidence;
   - call `ServiceWorker.startWorker({scopeURL:<exact observed scope>})` exactly ONCE;
   - no second startWorker, no action/popup/wake;
   - bounded-poll BOTH `extension.workers()` and raw `Target.getTargets` until a unique exact candidate service-worker target appears or timeout occurs.
5. Worker activation/discovery PASS if exact candidate target is observed by either route. A Puppeteer exposure miss with exact raw target present is not activation failure.

If activation/discovery fails, report all required activation evidence from `a7d2e1ca...`; a bare `worker missing` is forbidden.

### B4 direct worker Runtime

Never use `worker.evaluate()`.

If Puppeteer exposes exact worker:
- `worker.client.send('Runtime.enable')`;
- `worker.client.send('Runtime.evaluate',{expression:'1+1',returnByValue:true,awaitPromise:true})` -> 2, no exception;
- `worker.client.send('Network.enable')`.

If this direct client is unavailable/fails, without restarting/reactivating attach raw CDP to the SAME exact active worker target and run the same Runtime/Network assertions.

At least one transport must PASS. Record selected transport and exact fallback error if any.

### B5 raw PAGE adapter self-check + safety

Require:
- supported synthetic fixture fulfilled locally;
- DOM read/write PASS;
- input/change event dispatch PASS;
- button click handler PASS;
- reload/re-navigation PASS;
- candidate content script initialization PASS;
- post-worker browser liveness PASS;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `REAL_CHATGPT_REQUESTS=0`;
- `OPERATOR_BROWSER_ACTIONS=0`.

After B1-B5 all PASS print:
`RERUN15_PHASE_B_SUBSTRATE_DONE`

Then immediately continue to Phase C in the SAME top-level executable. No report, cleanup, return or exit.

## Phase C — permanent blocks 01-14

Print `RERUN15_PHASE_C_BLOCKS_01_14_STARTED`.

Execute every currently applicable requirement of permanent blocks 01-14 fresh in this run. All 01-14 are applicable.

Use exact current live harness authorities/blobs. Do not weaken assertions or substitute historical PASS reports.

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

Require all command/security/capability/planner/quota/verifier/cache/common-batch/delivery/UI/Performance invariants from the permanent gate, including exact 60000/5000/65000 semantics and zero real provider network.

Assign blocks 01-14 individually from THIS run only.

If any fails: later blocks NOT_RUN; publish one final report after cleanup; no package.

If all PASS print:
`RERUN15_PHASE_C_BLOCKS_01_14_DONE`

Continue immediately to D.

## Phase D — permanent block 15 browser/runtime

Print `RERUN15_PHASE_D_BLOCK_15_STARTED`.

Run the complete applicable browser/runtime matrix on the exact candidate using the qualified raw PAGE adapter and selected direct worker transport from B4.

Required current composer-wait browser markers:
- `FULL_BROWSER_MANUAL_OCCUPIED_PLATE_PERSIST_PASS`
- `FULL_BROWSER_MANUAL_CLEAR_INSERT_ONCE_PASS`
- `FULL_BROWSER_MANUAL_EXISTING_SEND_MICROPHONE_PASS`
- `FULL_BROWSER_NATIVE_COPY_WHILE_WAITING_PASS`
- `FULL_BROWSER_MANUAL_OFF_CANCEL_PENDING_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_READY_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_QUOTA_CACHE_PRESERVED_PASS`
- `FULL_BROWSER_CANCELLED_REPORT_NEVER_REAPPEARS_PASS`
- `OZON_COMPOSER_WAIT_BROWSER_HARNESS_PASS`.

Also execute every other applicable permanent block-15 assertion: MV3 worker loaded, supported ChatGPT/Alice content initialization, native Copy independence, owner/multi-owner isolation, lifecycle restart without duplicate state/provider/insertion/Send, no provider replay, wrong owner/conversation fail closed, one-Send/Microphone semantics, zero real Seller/Performance/ChatGPT network, no unexpected runtime/console failure.

If block 15 PASS print:
`RERUN15_PHASE_D_BLOCK_15_DONE`

Continue immediately to E.

## Phase E — block 16 packaging

Print `RERUN15_PHASE_E_BLOCK_16_STARTED` only after blocks 01-15 all PASS.

Package exactly the tested 17-file tree from this run:
1. exclude validation/tests/reports/development/credentials;
2. record ZIP workspace path and SHA-256;
3. fresh-extract into new directory;
4. require exact 17-file inventory;
5. compare every extracted file byte-for-byte with tested tree;
6. require final worker/content hashes exact;
7. rerun production JS syntax and manifest parse;
8. require package drift 0.

If block 16 PASS print:
`RERUN15_PHASE_E_BLOCK_16_DONE`

Only after every block 01-16 PASS print:
`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

Do not rebuild/alter the package after PASS.

## Hard safety and report rules

Require throughout:
- real Ozon requests 0;
- real Performance requests 0;
- real ChatGPT requests 0;
- operator browser actions 0;
- production modifications by validator 0;
- candidate modifications by validator 0 after deterministic reconstruction;
- source CFT modifications by validator 0.

`NOT_RUN` means not reached. `NOT_APPLICABLE` is only for genuinely absent/removed functionality, never for harness failure.

Failure classification must follow evidence:
- missing/misordered harness step, missing reporting, exposure race, orchestration failure -> `HARNESS_ERROR`;
- environment error only when direct evidence supports environment failure;
- production behavior failure only after accepted substrate and an actual production assertion fails.

Create exactly one report-only branch:
`validation/ozon-pre-operator-full-gate-composer-wait-rerun15-2026-08-19`

Publish exactly one final report:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN15_2026-08-19.md`

Report exact runner filename/SHA/command, static gate, all phase markers, all Phase-B ordered evidence, all blocks 01-16, all required targeted/browser markers, safety counters, package path/SHA/fresh-extract identity, terminal marker and truthful failure classification.

After final report publication STOP.

# Required final response schema

Return exactly:

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN15_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

phase_b_correction_commit:
  a7d2e1ca92c711089ff556c9e14a1870eb474eea

runner:
  filename: RERUN15_INTEGRATED_FULL_GATE_RUNNER.mjs
  sha256: <sha256>
  static_control_flow_check: PASS|FAIL

candidate:
  frozen_artifact_sha256: d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c
  repair_patch_sha256: bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d
  final_worker_sha256: dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac
  final_content_sha256: ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda
  production_inventory: <n>
  changed_files_exactly_2: PASS|FAIL|NOT_RUN
  protected_15_byte_identical: PASS|FAIL|NOT_RUN

environment:
  canonical_source_cft_file_count: <n|NOT_RUN>
  canonical_source_cft_inventory_sha256: <sha|NOT_RUN>
  source_copy_byte_identical: PASS|FAIL|NOT_RUN
  setup_exit_code: <code|NOT_RUN>
  copied_cft_post_setup_byte_identical: PASS|FAIL|NOT_RUN
  launch: PASS|FAIL|NOT_RUN
  spawn_args_exact_match: PASS|FAIL|NOT_RUN
  no_sandbox_validator_exception_exact: PASS|FAIL|NOT_RUN
  install_extension: PASS|FAIL|NOT_RUN
  enumerate_extension: PASS|FAIL|NOT_RUN
  raw_page_runtime: PASS|FAIL|NOT_RUN
  raw_local_fixture: PASS|FAIL|NOT_RUN
  initial_candidate_worker_seen_puppeteer: PASS|FAIL|NOT_RUN
  initial_candidate_worker_seen_raw: PASS|FAIL|NOT_RUN
  service_worker_enable: PASS|FAIL|NOT_RUN
  candidate_registration_scope: <scope|NONE|NOT_RUN>
  start_worker_called: true|false|NOT_RUN
  start_worker: PASS|FAIL|NOT_RUN
  final_candidate_worker_seen_puppeteer: PASS|FAIL|NOT_RUN
  final_candidate_worker_seen_raw: PASS|FAIL|NOT_RUN
  selected_worker_transport: PUPPETEER_DIRECT_CDP_CLIENT|RAW_SERVICE_WORKER_CDP|NONE|NOT_RUN
  worker_runtime: PASS|FAIL|NOT_RUN
  raw_page_adapter_self_check: PASS|FAIL|NOT_RUN
  post_worker_browser_liveness: PASS|FAIL|NOT_RUN
  accepting_substrate: PASS|FAIL|NOT_RUN

phase_markers:
  phase_a_candidate_done: PASS|NOT_RUN
  phase_b_substrate_done: PASS|NOT_RUN
  phase_c_blocks_01_14_started: PASS|NOT_RUN
  phase_c_blocks_01_14_done: PASS|NOT_RUN
  phase_d_block_15_started: PASS|NOT_RUN
  phase_d_block_15_done: PASS|NOT_RUN
  phase_e_block_16_started: PASS|NOT_RUN
  phase_e_block_16_done: PASS|NOT_RUN

full_gate:
  block_01_candidate_integrity_reconstruction: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_02_command_discovery_strict_contract: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_03_provider_security_boundary: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_04_seller_capability_entitlement: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_05_query_planner_coalescing_projection: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_06_global_seller_quota_scheduler: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_07_response_verifier_safe_errors: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_08_verified_analytics_cache_prefetch: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_09_manual_autorun_common_batch_engine: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_10_delivery_fsm_normal_empty_composer: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_11_manual_delivery_occupied_missing_composer: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_12_manual_off_cancellation_off_on_readiness: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_13_ui_bindings_owner_isolation: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_14_performance_regression_boundary: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_15_browser_runtime_robustness: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
  block_16_packaging_gate: PASS|FAIL|NOT_RUN|NOT_APPLICABLE
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
  workspace_path: <path|NONE>
  sha256: <sha|NONE>
  fresh_extract_byte_identical: PASS|FAIL|NOT_RUN

failure_classification:
  NONE|PRODUCTION_BEHAVIOR_FAILURE|HARNESS_FIXTURE_FAILURE|HARNESS_ERROR|ENVIRONMENT_ERROR

umbrella_marker:
  OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|ABSENT

report_branch:
  validation/ozon-pre-operator-full-gate-composer-wait-rerun15-2026-08-19

report_commit:
  <sha>
```
