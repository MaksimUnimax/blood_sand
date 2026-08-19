# Ozon Bridge v0.1.19 — integrated full-gate RERUN14

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_INTEGRATED_RERUN14`

# RERUN14 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

Codex is the independent validator. Production is immutable.

This is ONE top-level execution. Do not ask for or return intermediate results. Do not publish intermediate reports. Do not run a separate preflight.

## Authorities — read completely before building the runner

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

9. RERUN13 report:
`9e275d784b46c46dc86f1f0ca02eb5e12094ec37`

10. RERUN13 control-flow orchestration correction — authoritative for this run:
`57efec456b5416094fca0917a2310a5946106a1b`

11. Previous RERUN13 plan for unchanged browser substrate and permanent-gate mechanics:
`53f451835ccb8ab3461cae74c6fbd93aa06a94a9`

12. Current browser harness manifest:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/COMPOSER_WAIT_BROWSER_HARNESS_MANIFEST.md`

Read all live harness blobs/authorities referenced by the permanent gate. Prior PASS reports are architecture/evidence only and MUST NOT substitute for execution of applicable permanent blocks in this run.

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
Expected changed files: exactly `service_worker.js`, `content_script.js`.
Expected protected unchanged files: 15, byte-identical to frozen base.

Reconstruct from frozen artifact + exact repair patch from scratch in this execution. Do not reuse a mutable previous candidate directory as acceptance evidence.

## Environment pins

- Node `v24.12.0`
- Puppeteer `25.4.0`
- CFT `151.0.7922.47`
- canonical source CFT: 308 regular files
- canonical inventory SHA-256, preflight6 algorithm: `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`

Use exactly the accepted disposable validator environment already proven by RERUN13:
- fresh validation-owned byte-identical CFT copy;
- copied setup.exe once, `shell:false`, no elevation, require exit code 78;
- copied tree byte-identical after setup;
- fresh validation-only profile;
- `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`;
- normalized Chrome arguments exactly:
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
- no `--disable-gpu-sandbox`;
- no other Chrome switches;
- no dependency/browser update;
- no operator browser/profile/credentials.

The validation-only `--no-sandbox` exception MUST NOT enter production, package, manifest, operator instructions or live acceptance instructions.

## CRITICAL Phase 0 — build and statically validate the ACTUAL RERUN14 top-level executable

Create a NEW top-level executable named exactly:

`RERUN14_INTEGRATED_FULL_GATE_RUNNER.mjs`

Reusing `RERUN11_INTEGRATED_RUNNER.mjs`, `RERUN12_INTEGRATED_RUNNER.mjs`, or any previous partial top-level runner is FORBIDDEN.

Before executing it:

1. run `node --check RERUN14_INTEGRATED_FULL_GATE_RUNNER.mjs`;
2. statically inspect the exact file that will be executed;
3. require an explicit phase manifest containing A, B, C, D, E and permanent blocks 01-16;
4. require top-level code to invoke/await Phase A, then B, then — if and only if B PASS — invoke/await C, then D, then E;
5. require no `return`, `process.exit`, final-report publication, cleanup-finalization, or terminal success path immediately after the substrate PASS marker;
6. require Phase C call site is reachable from substrate PASS;
7. require Phase D call site is reachable only after blocks 01-14 PASS;
8. require Phase E call site is reachable only after blocks 01-15 PASS;
9. require terminal `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` can be emitted only after block 16 PASS;
10. require every invoked async phase is awaited and no detached child/unawaited promise can make the top-level process exit early;
11. require exact runner basename captured for the final report is `RERUN14_INTEGRATED_FULL_GATE_RUNNER.mjs`;
12. if any of these static checks fail, repair ONLY the validation runner before execution; do not execute a known-partial runner.

The final report MUST record the SHA-256 of the exact RERUN14 executable and the exact command used.

## Mandatory phase boundary markers

The exact top-level runner must print these markers in order as the phases are actually crossed:

- `RERUN14_PHASE_A_CANDIDATE_DONE`
- `RERUN14_PHASE_B_SUBSTRATE_DONE`
- `RERUN14_PHASE_C_BLOCKS_01_14_STARTED`
- `RERUN14_PHASE_C_BLOCKS_01_14_DONE`
- `RERUN14_PHASE_D_BLOCK_15_STARTED`
- `RERUN14_PHASE_D_BLOCK_15_DONE`
- `RERUN14_PHASE_E_BLOCK_16_STARTED`
- `RERUN14_PHASE_E_BLOCK_16_DONE`

For a successful run all eight markers must exist and be ordered exactly. A substrate PASS marker is NEVER terminal.

## Phase A — candidate reconstruction/integrity

Execute the full current permanent block-01 integrity requirements on the reconstructed exact candidate, including artifact/patch hashes, no-fuzz patch, final hashes, 17-file inventory, exactly two changed files, protected 15 byte-identical, JS syntax, manifest parse, permissions/host permissions, and exclusion of dev/test/report/credential artifacts.

Print `RERUN14_PHASE_A_CANDIDATE_DONE` only after these prerequisite integrity checks succeed.

## Phase B — accepted browser substrate

Re-execute the accepted RERUN13 substrate fresh in this run. Do not carry RERUN13 PASS as acceptance.

Require:
- exact environment/materialization/launch args;
- browser alive;
- `browser.installExtension(candidateDir)` once;
- `browser.extensions()` enumeration and exact enabled version `0.1.19`;
- raw PAGE adapter only, never `browser.newPage()`;
- raw PAGE `Runtime.enable`, `Page.enable`, `Fetch.enable`, `Runtime.evaluate('1+1') === 2`;
- local inert fixture and zero external network;
- candidate worker activation without action/popup;
- do not use `worker.evaluate()`/`worker.evaluateHandle()`;
- first qualify worker via `worker.client.send('Runtime.enable')`, direct `Runtime.evaluate('1+1')`, `Network.enable`;
- if that direct client fails, automatically attempt raw CDP against the SAME already-active candidate worker target exactly as authorized in RERUN13;
- at least one direct worker transport must PASS;
- post-worker browser liveness PASS;
- raw-CDP synthetic page adapter self-check PASS, including local fulfillment, DOM read/write, input/change event dispatch, button click, reload/re-navigation, content-script initialization;
- `REAL_OZON_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`, `REAL_CHATGPT_REQUESTS=0`, `OPERATOR_BROWSER_ACTIONS=0`.

After all substrate assertions PASS print:
`RERUN14_PHASE_B_SUBSTRATE_DONE`

Then IMMEDIATELY continue to Phase C in the same executable/process. No report, return, cleanup or exit is allowed here.

## Phase C — Permanent Gate blocks 01-14

Immediately print:
`RERUN14_PHASE_C_BLOCKS_01_14_STARTED`

Execute every currently applicable requirement in permanent blocks 01-14 from the live gate, fresh in this run. All 01-14 are applicable.

Use the canonical current targeted/worker/regression harnesses and live blobs. Do not weaken assertions or substitute historical PASS.

Required current composer-wait targeted markers include all of:
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

Also require every command/security/capability/planner/quota/verifier/cache/common-batch/delivery/UI/Performance invariant in the permanent gate, including exact 60000/5000/65000 timing semantics and zero real provider network.

Assign blocks 01-14 individually PASS/FAIL from THIS execution.

If any block 01-14 fails, mark later blocks NOT_RUN, publish one final failure report after cleanup, and STOP.

If all blocks 01-14 PASS print:
`RERUN14_PHASE_C_BLOCKS_01_14_DONE`

Then continue directly to Phase D.

## Phase D — Permanent Gate block 15

Print:
`RERUN14_PHASE_D_BLOCK_15_STARTED`

Run the full browser/runtime matrix on the exact candidate using the qualified raw PAGE adapter and selected direct worker CDP transport from Phase B.

Required composer-wait browser markers:
- `FULL_BROWSER_MANUAL_OCCUPIED_PLATE_PERSIST_PASS`
- `FULL_BROWSER_MANUAL_CLEAR_INSERT_ONCE_PASS`
- `FULL_BROWSER_MANUAL_EXISTING_SEND_MICROPHONE_PASS`
- `FULL_BROWSER_NATIVE_COPY_WHILE_WAITING_PASS`
- `FULL_BROWSER_MANUAL_OFF_CANCEL_PENDING_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_READY_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_QUOTA_CACHE_PRESERVED_PASS`
- `FULL_BROWSER_CANCELLED_REPORT_NEVER_REAPPEARS_PASS`
- `OZON_COMPOSER_WAIT_BROWSER_HARNESS_PASS`.

Execute every other currently applicable block-15 assertion: MV3 worker loaded, supported ChatGPT/Alice content initialization, native Copy independence, owner/multi-owner isolation, lifecycle restart without duplicate provider/insertion/Send, no provider replay, wrong owner/conversation fail closed, one-Send/Microphone semantics, zero real Seller/Performance/ChatGPT network, no unexpected runtime/console failure.

No assertion may be skipped because transport is raw CDP.

If block 15 fails, block 16 NOT_RUN; publish one final failure report and STOP.

If block 15 PASS print:
`RERUN14_PHASE_D_BLOCK_15_DONE`

Then continue directly to Phase E.

## Phase E — Permanent Gate block 16 / package exact tested tree

Print:
`RERUN14_PHASE_E_BLOCK_16_STARTED`

Only now:
1. ZIP exactly the tested 17-file production tree used by blocks 01-15;
2. exclude validation/tests/reports/development/credentials;
3. record workspace path and ZIP SHA-256;
4. fresh-extract to a new directory;
5. require exactly 17 production files;
6. compare every extracted file byte-for-byte with tested tree;
7. require exact final worker/content hashes;
8. rerun JS syntax and manifest parse on fresh extraction;
9. require package drift = 0.

If block 16 PASS print:
`RERUN14_PHASE_E_BLOCK_16_DONE`

Only after all applicable blocks 01-16 PASS print terminal marker exactly:
`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

Do not rebuild or alter package after PASS.

## Hard safety/mutation rules

Throughout the run:
- production modifications by validator = 0;
- candidate modifications by validator = 0 after deterministic reconstruction;
- source CFT modifications by validator = 0;
- real Ozon requests = 0;
- real Performance requests = 0;
- real ChatGPT requests = 0;
- operator browser actions = 0;
- no real credentials;
- no operator Chrome/profile;
- no dependency/browser update;
- no production/test assertion weakening.

Any applicable behavior not executed is NOT_RUN, never NOT_APPLICABLE merely due harness failure.

## Final report

Create exactly one report-only branch:
`validation/ozon-pre-operator-full-gate-composer-wait-rerun14-2026-08-19`

Publish exactly one report:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN14_2026-08-19.md`

Report MUST include:
- exact `RERUN14_INTEGRATED_FULL_GATE_RUNNER.mjs` SHA-256;
- exact command proving that exact runner was executed;
- all eight phase markers with observed order/status;
- all candidate/environment pins;
- selected worker transport and any fallback error;
- every permanent block 01-16 PASS/FAIL/NOT_RUN;
- every required current targeted/browser marker;
- network/action/modification counters;
- package path/SHA/fresh-extract byte identity when produced;
- exact terminal marker;
- truthful failure classification if not PASS.

After publishing the report, STOP.

# Required final response schema

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN14_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

control_flow_correction_commit:
  57efec456b5416094fca0917a2310a5946106a1b

runner:
  filename: RERUN14_INTEGRATED_FULL_GATE_RUNNER.mjs
  sha256: <sha256>
  static_control_flow_check: PASS|FAIL

candidate:
  frozen_artifact_sha256: d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c
  repair_patch_sha256: bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d
  final_worker_sha256: dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac
  final_content_sha256: ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda
  production_inventory: <n>
  changed_files_exactly_2: PASS|FAIL
  protected_15_byte_identical: PASS|FAIL

environment:
  canonical_source_cft_file_count: <n>
  canonical_source_cft_inventory_sha256: <sha256>
  source_copy_byte_identical: PASS|FAIL
  setup_exit_code: <code>
  copied_cft_post_setup_byte_identical: PASS|FAIL
  launch: PASS|FAIL
  spawn_args_exact_match: PASS|FAIL
  no_sandbox_validator_exception_exact: PASS|FAIL
  install_extension: PASS|FAIL
  enumerate_extension: PASS|FAIL
  raw_page_runtime: PASS|FAIL
  raw_local_fixture: PASS|FAIL
  worker_activation: PASS|FAIL
  selected_worker_transport: PUPPETEER_DIRECT_CDP_CLIENT|RAW_SERVICE_WORKER_CDP|NONE
  worker_runtime: PASS|FAIL
  raw_page_adapter_self_check: PASS|FAIL
  post_worker_browser_liveness: PASS|FAIL
  accepting_substrate: PASS|FAIL

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
  workspace_path: <path|NONE>
  sha256: <sha256|NONE>
  fresh_extract_byte_identical: PASS|FAIL|NOT_RUN

failure_classification:
  <NONE|PRODUCTION_BEHAVIOR_FAILURE|HARNESS_FIXTURE_FAILURE|HARNESS_ERROR|ENVIRONMENT_ERROR>

umbrella_marker:
  OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|ABSENT

report_branch:
  validation/ozon-pre-operator-full-gate-composer-wait-rerun14-2026-08-19

report_commit:
  <sha>
```
