# Ozon Bridge v0.1.19 — integrated environment-resolution + full-gate RERUN11

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_INTEGRATED_RERUN11`

# RERUN11 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

Codex is the independent validator. Production is immutable.

This is ONE top-level execution. It replaces the prior sequence of one-preflight-at-a-time browser diagnostics.

Do not ask the operator for intermediate actions or return intermediate results.
Do not publish an intermediate report.
Do not stop after a non-catastrophic environment-substrate failure until the explicitly authorized diagnostics in this prompt have been completed.

The command has two possible paths:

- `accepting substrate PASS -> immediately execute permanent blocks 01-16 -> package if all 01-15 PASS -> one final report`;
- `accepting substrate FAIL -> execute all authorized failure diagnostics in this same command -> one final report -> STOP, no full gate/package`.

## Authorities to read completely before preparing the runner

1. Permanent living gate:
   `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

2. Deterministic candidate checkpoint:
   `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

3. Frozen tested base artifact authority:
   `5245551cb4ff01e388146397b1a0075c0e0f013b`

4. Current repair checkpoint:
   `1de4cea770fc8ae09280e65d13e60525fd22e4e7`

5. Canonical CFT inventory/status correction:
   `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`

6. Absolute-path correction:
   `36bbb81062d12348e87ce6297af2df8566bf6a46`

7. Previously qualified owned-copy CFT evidence:
   `6eaa50d9cfaf9d9bc5eb54f8e0ab7a1dde080a71`

8. RERUN10 report — functional/environment evidence only, not acceptance carry-forward:
   `1162902368486cc5c8618748b5b057400d828427`

9. Consolidated root-cause matrix report:
   `70097f932d9848415c05a95ec223ea388f2bfef0`

10. Raw-CDP page adapter correction — mandatory current browser authority:
    `4ceedab6598a92de8cfc885f79e09b5e08b17950`

11. Browser composer-wait harness authority:
    `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`
    and concatenated harness SHA-256
    `ce38adbf78a5501c6c130845f5d76d1e832234b5f8d217d7c9980f8958f7a5c1`

12. Targeted composer-wait harness SHA-256:
    `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`

13. Historical browser/countdown/binding source blob:
    `841429741d5ff9144a8a40506e657dc4392fe37c`

14. Worker actual-path source blob:
    `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`

15. Regression carry-forward source blob:
    `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

16. Worker due-fixture correction:
    `d9d62a44a812b555d23490acc042ac744a2e3c45`

Historical preflight/RERUN failures are evidence only. Do not reuse any old functional PASS as acceptance instead of executing the currently applicable permanent block in this run.

## Immutable candidate

Require exactly:

- frozen artifact:
  `tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`
- frozen artifact SHA-256:
  `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256:
  `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final `service_worker.js` SHA-256:
  `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final `content_script.js` SHA-256:
  `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory exactly `17` files;
- changed production files exactly:
  - `service_worker.js`
  - `content_script.js`
- protected other `15` production files byte-identical to frozen base.

Use absolute repository/QA paths throughout child execution. Reject drift.

## Supported browser version contract

Use exactly:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- Chrome for Testing `151.0.7922.47`.

Do not install or update dependencies. Puppeteer 25.4.0 is the supported Puppeteer release for this exact CFT build; do not treat version mismatch as a root cause.

## Canonical CFT materialization

For every accepting or diagnostic Chrome arm:

1. use ONLY the canonical preflight6 inventory algorithm from correction `36b20ff...`;
2. require source CFT `308` regular files;
3. require canonical source inventory SHA-256:
   `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`;
4. make a fresh validation-owned byte-identical copy of the complete CFT tree;
5. require source/copy per-file path+size+SHA identity;
6. run copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` exactly once, `shell:false`, no elevation;
7. require exact setup exit code `78`;
8. require copied-tree regular-file bytes/inventory unchanged after setup;
9. source CFT must remain unmodified.

## Accepting Chrome launch contract

For the isolated validator Chrome only, launch copied CFT with:

- `ignoreDefaultArgs:true`;
- `headless:false`;
- `enableExtensions:true`;
- `waitForInitialPage:false`;
- `dumpio:true`;
- fresh temporary userDataDir;
- exact argument sequence after executable path:

1. `--user-data-dir=<fresh-temporary-profile>`
2. `--remote-debugging-port=0`
3. `--no-first-run`
4. `--no-default-browser-check`
5. `--disable-background-networking`
6. `--disable-component-update`
7. `--disable-sync`
8. `--metrics-recording-only`
9. `--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0`
10. `--disable-gpu-sandbox`
11. `about:blank`

No other accepting Chrome switch is allowed.

In particular, accepting path forbids:

- `--no-sandbox`;
- `--disable-gpu`;
- `--disable-features=RendererAppContainer`;
- other GPU/sandbox/crash bypasses;
- operator Chrome/profile.

Require actual spawn args exact match after normalizing only the generated profile path.

## Mandatory raw-CDP page adapter

`browser.newPage()` is forbidden in RERUN11 browser assertions because the root-cause matrix proved it does not produce a usable Puppeteer Page in this environment even when Chrome remains alive.

Do not patch Puppeteer package files on disk.

Build one temporary validation-only reusable raw-CDP adapter according to correction `4ceedab...`.

### Raw browser/page transport

Use the launched Chrome's local DevTools endpoint only.

A raw-CDP client may use Node v24 built-in `WebSocket`; do not install a WebSocket package.

Required operations:

1. use Puppeteer only for accepted browser lifecycle and extension installation/enumeration;
2. obtain the local browser debugging port/endpoint from the exact launched profile/browser;
3. create synthetic tabs/pages with raw `Target.createTarget({url:'about:blank'})`, not `browser.newPage()`;
4. require returned raw `targetId` to appear in raw `Target.getTargets` as type `page`;
5. obtain that same target's `webSocketDebuggerUrl` through the same browser's loopback `/json/list` endpoint;
6. connect directly to that exact PAGE target with the raw-CDP adapter;
7. maintain proper command-id -> response correlation and surface CDP errors exactly;
8. support bounded event waits without increasing timeouts to hide failure.

### Adapter behavioral primitives

The adapter must implement all primitives needed by the existing browser harness without weakening semantics:

- `Runtime.enable`;
- `Page.enable`;
- `DOM.enable` when required;
- `Runtime.evaluate` with exception detection and return-by-value;
- `Page.navigate`;
- `Page.reload`;
- bounded `Page.domContentEventFired`/lifecycle waiting;
- `Fetch.enable` / `Fetch.requestPaused`;
- exact main-document local fulfillment;
- abort/fail every non-fixture external request;
- DOM query/evaluation including shadow roots;
- textarea native value setter + InputEvent/change dispatch exactly as in the current composer harness;
- actual DOM `.click()` for the synthetic native Copy/Send controls;
- page reload and state restoration assertions.

Do not replace behavioral checks with source-text inspection.

## Candidate extension install/enumeration

On the accepting browser:

1. runtime-install exact reconstructed candidate using `browser.installExtension(candidateDir)`;
2. require `browser.extensions()` to enumerate the returned extension id;
3. require candidate enabled and version `0.1.19`;
4. record exact extension id;
5. no popup/action UI interaction.

## Direct MV3 worker activation

`extension.triggerAction()` is forbidden.

After a raw PAGE CDP connection exists:

1. query candidate `extension.workers()` once;
2. if candidate worker already active, use it;
3. otherwise call PAGE-target `ServiceWorker.enable`;
4. collect registration/version events for evidence;
5. select only a registration whose scope begins `chrome-extension://<extensionId>/` if emitted;
6. if the registration event supplies the candidate scope, call `ServiceWorker.startWorker` exactly once using that exact scope;
7. if no candidate registration is emitted, one direct `ServiceWorker.startWorker` call using exactly `chrome-extension://<extensionId>/` is allowed; success is accepted only if the candidate worker subsequently appears, proving the scope was accepted;
8. bounded-poll only candidate `extension.workers()`;
9. require exactly candidate-origin worker URL and background service-worker identity;
10. require harmless worker Runtime evaluation `1+1 === 2`;
11. no retry, no popup, no action trigger, no synthetic ChatGPT wake.

## Accepting substrate qualification — execute first inside the one command

Before executing permanent block 01 acceptance, prove in one fresh accepting browser materialization:

1. canonical CFT source/copy/setup PASS;
2. setup exit `78`;
3. exact accepting launch args PASS;
4. Chrome main process alive;
5. candidate install/enumeration PASS;
6. raw `Target.createTarget` PAGE PASS;
7. raw PAGE target websocket/CDP connection PASS;
8. PAGE `Runtime.evaluate('1+1')` returns `2`;
9. PAGE can locally render a tiny inert HTML fixture and query its DOM through Runtime;
10. direct candidate MV3 worker activation/access PASS;
11. worker Runtime `1+1` returns `2`;
12. browser remains alive at least 5 seconds after worker activation;
13. zero real Ozon/Performance/ChatGPT requests.

Required marker:

`RERUN11_RAW_CDP_ACCEPTING_SUBSTRATE_PASS`

### If accepting substrate FAILS

Do NOT execute permanent blocks 01-16 and do NOT package.

Instead, in the SAME top-level command, execute all technically possible failure diagnostics below, then publish ONE final report.

No operator interaction.

#### Failure diagnostic D1 — process/job context

Read-only:

- validator identity;
- Windows version/build;
- `IsProcessInJob` for the validator Node process;
- if possible, query relevant enclosing-job basic/extended limits without modifying them;
- `IsProcessInJob` for launched Chrome browser process;
- capture Chrome child process tree with PID, PPID, process type from command line (`renderer`, `gpu-process`, `utility`, etc.) during target creation;
- record child disappearances and main browser exit code.

Do not change Job objects.

#### Failure diagnostic D2 — policy/security state

Read-only inspect relevant existing values only:

- HKCU/HKLM Chrome/Chromium policy roots available to the validation identity;
- Renderer AppContainer policy value if present;
- AppLocker policy visibility if accessible;
- bounded Windows CodeIntegrity Operational events generated during the failing arm;
- bounded AppLocker EXE/DLL events generated during the failing arm;
- bounded Defender/Operational events generated during the failing arm;
- bounded Application Error events generated during the failing arm.

Do not change registry/policy/security configuration.

#### Failure diagnostic D3 — no-sandbox causal control

Use a fresh owned CFT copy/profile.

Launch with the same minimal argument sequence, but for this diagnostic control ONLY replace `--disable-gpu-sandbox` with the single browser-level switch:

`--no-sandbox`

Do not install candidate extension.

Use raw `Target.createTarget` + raw PAGE websocket/CDP adapter and test only:

- PAGE Runtime `1+1`;
- local inert document render/query;
- 5-second browser liveness.

This arm can prove/disprove whether the remaining renderer/PAGE failure is caused by Chromium sandboxing.

It can NEVER qualify an accepting environment and can NEVER proceed to permanent blocks or packaging.

#### Failure classification

Choose one exact evidence-based class:

- `ENVIRONMENT_GPU_SANDBOX_AND_PUPPETEER_PAGE_EXPOSURE_BYPASSED_BUT_RAW_CDP_FAILED`
- `ENVIRONMENT_RENDERER_SANDBOX_FAILURE`
- `ENVIRONMENT_WINDOWS_POLICY_OR_JOB_BLOCKER`
- `ENVIRONMENT_RAW_CDP_TRANSPORT_FAILURE`
- `HARNESS_ERROR`
- `ENVIRONMENT_OTHER_WITH_EXACT_EVIDENCE`

Do not call production behavior failed when permanent functional assertions were never executed.

## If accepting substrate PASSES — execute the full permanent gate immediately

Do not stop, report, or ask the operator anything.

Execute every currently applicable permanent living-gate block 01 through 16 in this same top-level run using the exact current definitions in `OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`.

No functionality in the current candidate is absent, so blocks must not be marked NOT_APPLICABLE merely because a harness path failed.

### Blocks 01-14

Reconstruct candidate from immutable authority and execute all mandatory tests in this run.

Require at minimum all current Step1-4/security/manual/autorun/quota/cache/projection/response/privacy/Performance invariants from the permanent gate.

Do not reuse RERUN10 PASS as acceptance instead of executing each block now.

### Block 15 browser/runtime robustness

Adapt all browser harnesses that relied on `browser.newPage()` to the SAME validated raw-CDP adapter.

This includes current composer-wait real-browser assertions and applicable historical browser/countdown/binding behavior.

The adapter is only a transport replacement. Preserve assertions and production semantics exactly.

#### Synthetic ChatGPT fixture

For each synthetic ChatGPT page:

1. raw-create about:blank PAGE;
2. attach raw PAGE CDP;
3. enable Fetch interception BEFORE navigation;
4. navigate with `Page.navigate` to the existing synthetic URL pattern `https://chatgpt.com/c/<uuid>`;
5. fulfill the exact top-level document locally with the existing harness HTML fixture;
6. abort every other network request;
7. require page URL/origin/conversation identity to remain correct;
8. require installed candidate content-script behavior to initialize;
9. use raw Runtime/DOM primitives for the same assertions previously performed via Puppeteer Page.

No real ChatGPT request is permitted.

#### Mandatory current repair markers

Require all:

- `FULL_BROWSER_MANUAL_OCCUPIED_PLATE_PERSIST_PASS`
- `FULL_BROWSER_MANUAL_CLEAR_INSERT_ONCE_PASS`
- `FULL_BROWSER_MANUAL_EXISTING_SEND_MICROPHONE_PASS`
- `FULL_BROWSER_NATIVE_COPY_WHILE_WAITING_PASS`
- `FULL_BROWSER_MANUAL_OFF_CANCEL_PENDING_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_READY_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_QUOTA_CACHE_PRESERVED_PASS`
- `FULL_BROWSER_CANCELLED_REPORT_NEVER_REAPPEARS_PASS`
- `OZON_COMPOSER_WAIT_BROWSER_HARNESS_PASS`

Also require all applicable historical browser/runtime/countdown/binding markers and permanent block 10-15 behavior, including:

- normal empty-composer insertion exactly once;
- one recognized staged Send and Microphone completion;
- occupied composer never overwritten;
- exact plate `Очистите поле ввода, чтобы получить отчёт.`;
- missing composer recoverable pending state;
- correct later empty composer inserts exactly once;
- page/content lifecycle restart no duplicate insert/send/provider;
- Manual OFF narrow cancellation only claimed pre-insert current owner report;
- requesting/quota_waiting/insert_committed/inserted not cancelled;
- OFF->ON readiness restored;
- cancelled report never returns;
- quota/cache bytes/timing preserved;
- native Copy independent;
- multi-owner and ChatGPT/Alice isolation;
- zero real provider network.

Any missing mandatory browser marker makes block 15 FAIL.

### Hard network/operator counters

Across accepting substrate + full gate require:

- real Seller credentials `0`;
- real Performance credentials `0`;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `REAL_CHATGPT_REQUESTS=0` for synthetic browser fixtures;
- `OPERATOR_BROWSER_ACTIONS=0`;
- production modifications by validator `0`;
- candidate modifications by validator `0`;
- source CFT modifications by validator `0`.

## Block 16 packaging

Only if every applicable block 01-15 PASS:

1. package exactly the tested 17-file production candidate tree;
2. exclude all tests/reports/development/browser/CFT/profile/credential artifacts;
3. compute ZIP SHA-256;
4. fresh-extract;
5. compare every extracted production file byte-for-byte with tested candidate;
6. rerun JS syntax, manifest parse, inventory, exact final worker/content hashes on fresh extraction;
7. require protected 15 still byte-identical;
8. emit permanent umbrella marker only if all 01-16 PASS:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

Do not rebuild a second package after the authoritative run.

## One report only

Create report-only branch:

`validation/ozon-pre-operator-full-gate-composer-wait-rerun11-2026-08-19`

Create exactly one report:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN11_2026-08-19.md`

Do not commit production, candidate tree, temporary harness/adapter, copied CFT, profiles, credentials, or package bytes.

The report must include:

- all exact authorities;
- candidate hashes/inventory/protected verification if reached;
- canonical CFT inventory/setup evidence;
- exact actual accepting spawn args;
- raw PAGE target id/type and target websocket evidence;
- raw PAGE Runtime/local fixture evidence;
- extension install/id/version evidence;
- worker activation method/scope/url/Runtime evidence;
- substrate PASS/FAIL marker;
- if substrate FAIL: D1/D2/D3 diagnostics and one exact environment classification;
- if substrate PASS: every permanent block 01-16 state;
- all browser mandatory markers;
- network/operator/modification counters;
- package workspace path/SHA/fresh-extract result if produced;
- umbrella marker.

After publishing this one report, STOP. No live/operator actions.

# Required final response schema

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN11_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

raw_cdp_adapter_correction_commit:
  4ceedab6598a92de8cfc885f79e09b5e08b17950

candidate:
  frozen_artifact_sha256: <sha256>
  repair_patch_sha256: <sha256>
  final_worker_sha256: <sha256>
  final_content_sha256: <sha256>
  production_inventory: <integer|NOT_RUN>
  changed_files_exactly_2: PASS|FAIL|NOT_RUN
  protected_15_byte_identical: PASS|FAIL|NOT_RUN

environment:
  canonical_source_cft_file_count: <integer>
  canonical_source_cft_inventory_sha256: <sha256>
  source_copy_byte_identical: PASS|FAIL
  setup_exit_code: <integer>
  copied_cft_post_setup_byte_identical: PASS|FAIL
  launch: PASS|FAIL
  spawn_args_exact_match: PASS|FAIL
  disable_gpu_sandbox_only_exception: PASS|FAIL
  install_extension: PASS|FAIL|NOT_RUN
  enumerate_extension: PASS|FAIL|NOT_RUN
  raw_page_create: PASS|FAIL|NOT_RUN
  raw_page_target_websocket: PASS|FAIL|NOT_RUN
  raw_page_runtime: PASS|FAIL|NOT_RUN
  raw_local_fixture: PASS|FAIL|NOT_RUN
  worker_activation: PASS|FAIL|NOT_RUN
  worker_runtime: PASS|FAIL|NOT_RUN
  post_worker_browser_liveness: PASS|FAIL|NOT_RUN
  accepting_substrate: PASS|FAIL

diagnostics_if_substrate_failed:
  validator_in_job: true|false|NOT_RUN
  chrome_in_job: true|false|NOT_RUN
  renderer_process_observed: true|false|NOT_RUN
  relevant_policy_or_security_event: <concise exact evidence|NONE|NOT_RUN>
  no_sandbox_control_raw_page_runtime: PASS|FAIL|NOT_RUN
  no_sandbox_control_liveness: PASS|FAIL|NOT_RUN

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
  sha256: <sha256|NONE>
  fresh_extract_byte_identical: PASS|FAIL|NOT_RUN

failure_classification:
  NONE|PRODUCTION_BEHAVIOR_FAILURE|ENVIRONMENT_GPU_SANDBOX_AND_PUPPETEER_PAGE_EXPOSURE_BYPASSED_BUT_RAW_CDP_FAILED|ENVIRONMENT_RENDERER_SANDBOX_FAILURE|ENVIRONMENT_WINDOWS_POLICY_OR_JOB_BLOCKER|ENVIRONMENT_RAW_CDP_TRANSPORT_FAILURE|HARNESS_ERROR|ENVIRONMENT_OTHER_WITH_EXACT_EVIDENCE

umbrella_marker:
  OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|ABSENT

report_branch:
  validation/ozon-pre-operator-full-gate-composer-wait-rerun11-2026-08-19

report_commit:
  <sha>
```
