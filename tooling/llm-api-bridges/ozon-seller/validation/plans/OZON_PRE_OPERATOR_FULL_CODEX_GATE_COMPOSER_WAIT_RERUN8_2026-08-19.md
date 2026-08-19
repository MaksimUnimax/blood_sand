# Ozon Bridge v0.1.19 — consolidated pre-operator full-gate rerun 8

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_CONSOLIDATED_RERUN8`

# RERUN8 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This is the independent final Codex validation run before operator handoff. Codex is validator, not implementation agent. Do not modify production.

## Immutable production candidate

Permanent gate input checkpoint:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Original permanent full-gate plan authority:
`e47382d0edcaddf674d2704a8aa5f09d8f04e785`

Permanent living gate path:
`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

Read that living gate completely from the exact current development authority before preparing the runner. Its functional blocks 1 through 16 are the mandatory block definitions for this run. Do not substitute earlier rerun block naming.

Expected immutable candidate inputs/outputs:

- frozen artifact SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final service_worker.js SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final content_script.js SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory: exactly 17 files
- changed production files: exactly `service_worker.js`, `content_script.js`
- protected other 15 production files: byte-identical to frozen base

Reject any production drift.

## Qualified browser environment — mandatory

Read completely:

Qualified-environment commit:
`c8a4d185573e2d96a05f8a1c9fa3da7b10a2dc78`

Path:
`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_WINDOWS_CFT_QUALIFIED_ENVIRONMENT_2026-08-19.md`

Qualification evidence report:
`6eaa50d9cfaf9d9bc5eb54f8e0ab7a1dde080a71`

Use exactly the qualified environment materialization described there. This supersedes all earlier failed browser environment launch/install attempts.

Mandatory environment facts:

- validation Node: `v24.12.0`
- Puppeteer: `25.4.0`
- Chrome for Testing: `151.0.7922.47`
- source CFT inventory: exactly 308 regular files
- source CFT inventory SHA-256: `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`
- source CFT tree is never modified
- create a fresh validation-owned byte-identical copy of the entire source CFT tree
- require source/copy path+size+SHA inventory identity before setup
- run copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` once, `shell:false`, without elevation
- require exact Chromium setup success exit code `78`
- require copied-tree regular-file inventory/bytes unchanged after setup
- launch copied chrome through Puppeteer with `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`, fresh temporary userDataDir
- exact minimal Chrome args only:
  1. `--user-data-dir=<fresh-temporary-profile>`
  2. `--remote-debugging-port=0`
  3. `--no-first-run`
  4. `--no-default-browser-check`
  5. `--disable-background-networking`
  6. `--disable-component-update`
  7. `--disable-sync`
  8. `--metrics-recording-only`
  9. `--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0`
  10. `about:blank`
- no `--disable-gpu`
- no `--no-sandbox`
- no GPU/sandbox/crash-limit bypass switches
- no operator Chrome profile
- no dependency installation/update
- runtime-install exact reconstructed candidate with `browser.installExtension(candidateDir)`
- require `browser.extensions()` to enumerate the exact returned candidate id, enabled, version `0.1.19`
- require actual spawned args to match the qualified sequence exactly

An initial `extension.workers()` count of zero is allowed before worker activation.

For worker-dependent browser assertions, use the already-authorized candidate `Extension` API worker activation semantics from correction:
`d9c42e2cbffca37fc84cd14f294d455e423da542`

After successful install/enumeration:

1. query only the candidate `Extension` object's active workers;
2. if none is active, create one inert local page with zero external requests;
3. call `extension.triggerAction(page)` exactly once as validator automation;
4. bounded-poll only the same candidate `Extension` object's workers;
5. require the candidate's own MV3 worker before worker-dependent assertions;
6. do not use synthetic ChatGPT wake or popup-only wake as primary discovery;
7. do not increase timeouts to hide failure;
8. `triggerAction` is validator automation and does not increment `OPERATOR_BROWSER_ACTIONS`.

If the qualified environment materialization itself fails before functional assertions, classify truthfully as environment/harness failure and stop without production edits. If the candidate installs/enumerates and a functional browser assertion fails, do not relabel that failure environment merely because historical runs had environment problems.

## Authorized validation harness authorities

Use existing accepted harness logic, adapted only as necessary to point at this exact candidate and qualified browser executable. Do not change functional assertions.

Pinned authorities/evidence include:

- worker actual-path source blob: `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- browser countdown/binding carry-forward source blob: `841429741d5ff9144a8a40506e657dc4392fe37c`
- regression carry-forward source blob: `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`
- targeted composer-wait harness concatenated SHA-256: `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`
- real-browser composer-wait harness concatenated SHA-256: `ce38adbf78a5501c6c130845f5d76d1e832234b5f8d217d7c9980f8958f7a5c1`
- browser harness manifest commit: `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`
- accepted worker due-fixture correction: `d9d62a44a812b555d23490acc042ac744a2e3c45`

Historical DevToolsActivePort, synthetic wake, popup-only wake, native-source-tree launch, `--disable-gpu`, and preflight1-5 failures are evidence only and are not active browser architecture for this run.

Temporary validation harness changes may only:

- inject the exact expected repaired candidate hashes;
- materialize the qualified copied CFT environment;
- route browser launch/install/worker discovery through the qualified APIs above;
- apply already-authorized validation-only fixture corrections.

They must not weaken, delete, skip, reinterpret or replace any mandatory production behavior assertion.

## One authoritative consolidated execution

Prepare one temporary top-level runner. Execute the functional gate top-level command exactly ONCE.

Before that one command, only non-functional preparation integrity work is allowed: reading authorities, reconstructing temporary harness files, `node --check` on temporary validation code, and hash/inventory verification needed to ensure the runner itself is well-formed. Do not exploratory-run individual functional blocks before the authoritative command.

The one top-level runner must, in one terminal PASS/FAIL execution:

1. reconstruct the exact production candidate from immutable authority;
2. verify frozen artifact/patch/parts and final production hashes;
3. verify exact 17-file production inventory, exactly 2 authorized changed files, protected 15 byte-identical;
4. syntax-check production JS and parse manifest;
5. execute every currently applicable permanent living-gate block 1 through 15, with the exact block definitions from `OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`;
6. materialize the qualified owned-copy CFT environment inside the same authoritative run before browser assertions;
7. execute browser quota/countdown/binding carry-forward behavior and all permanent browser/runtime robustness assertions;
8. execute real-browser normal-delivery and occupied/missing-composer/Manual-OFF/OFF->ON behavior;
9. require zero real Ozon and Performance network traffic and zero operator browser actions;
10. require validator production modifications `0` and candidate modifications `0`;
11. only if every applicable functional block 1 through 15 passes, execute permanent block 16 packaging;
12. package exactly the tested 17-file production tree only;
13. exclude tests, reports, credentials, development artifacts, browser files and validation files;
14. compute ZIP SHA-256;
15. fresh-extract the ZIP;
16. byte-compare every extracted production file with the tested candidate;
17. rerun package JS syntax/manifest/inventory integrity checks on the fresh extraction;
18. emit `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` only if every applicable block 1 through 16 passes.

On any functional assertion failure: preserve evidence, do not retry the failed functional assertion, do not weaken it, do not edit production, and do not continue to packaging.

## Mandatory browser behavior markers

The browser execution must preserve and report the existing carry-forward behavior markers where applicable, including the historical countdown/binding assertions, plus these current repair markers:

- `FULL_BROWSER_MANUAL_OCCUPIED_PLATE_PERSIST_PASS`
- `FULL_BROWSER_MANUAL_CLEAR_INSERT_ONCE_PASS`
- `FULL_BROWSER_MANUAL_EXISTING_SEND_MICROPHONE_PASS`
- `FULL_BROWSER_NATIVE_COPY_WHILE_WAITING_PASS`
- `FULL_BROWSER_MANUAL_OFF_CANCEL_PENDING_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_READY_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_QUOTA_CACHE_PRESERVED_PASS`
- `FULL_BROWSER_CANCELLED_REPORT_NEVER_REAPPEARS_PASS`
- `OZON_COMPOSER_WAIT_BROWSER_HARNESS_PASS`

Also require all applicable browser/runtime behavior from permanent blocks 10–15, including:

- empty-composer normal insertion exactly once;
- exactly one recognized staged Send and Microphone completion;
- occupied composer never overwritten;
- exact persistent plate text `Очистите поле ввода, чтобы получить отчёт.`;
- temporarily missing composer enters recoverable pending wait;
- correct empty composer later inserts exactly once;
- restart/rebind does not duplicate insertion/Send/provider execution;
- Manual OFF cancels only current owner pre-insert `delivering + claimed` report;
- no cancellation of quota_waiting/requesting/insert_committed/inserted work;
- OFF -> ON readiness restored;
- cancelled report never reappears;
- same-Seller quota/cache timing remains unchanged;
- native ChatGPT Copy remains independent;
- ChatGPT/Alice and multi-owner isolation remain intact;
- zero real provider requests.

## Step 1–4 and security invariants remain mandatory

The permanent blocks must cover all currently supported functionality, not only the composer repair. Preserve at minimum:

- strict command/analytics/product-query contract and blocked `posting_fbs_get`;
- fixed provider hosts/method/auth boundary, no arbitrary assistant-controlled request surface;
- capability probe internal/non-AI-callable and entitlement fail-closed semantics;
- contiguous-compatible analytics coalescing only and safe projection;
- Seller family `seller.analytics_data.v1`, 60000/5000/65000 timing semantics, shared same-Seller bucket, account isolation, no replay after request start, Retry-After extension only;
- response verifier safe failures and no retry;
- verified cache TTL 60000, cache before quota, safe metric-superset projection, universal-only prefetch;
- Manual/Autorun common batch ordering and recovery invariants;
- Performance boundary regression;
- PII/credentials privacy and zero hidden retry/pagination/fan-out/polling.

## Hard safety totals

Required final totals:

- real Seller credentials: `0`
- real Performance credentials: `0`
- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- production modifications by validator: `0`
- candidate modifications by validator: `0`
- source CFT modifications by validator: `0`

## Report

Create report-only branch:
`validation/ozon-pre-operator-full-gate-composer-wait-rerun8-2026-08-19`

Create exactly one new validation report under:
`tooling/llm-api-bridges/ozon-seller/validation/reports/`

Do not commit production files, candidate tree, temporary harness files, browser profile, copied CFT tree, credentials, or package bytes on the validation report branch.

The report must contain:

- exact candidate authority and hashes;
- exact frozen artifact and repair patch hashes;
- production inventory and changed/protected verification;
- qualified-environment authority commit and preflight6 evidence commit;
- source/copy CFT inventory verification and setup exit code;
- exact actual spawned Chrome args verification;
- extension install/enumeration diagnostics;
- worker activation diagnostics;
- all permanent living-gate blocks 1–16 using their exact names, each `PASS|FAIL|NOT_APPLICABLE` only when genuinely absent/removed;
- all required browser repair markers;
- exact network/operator counters;
- validator modification counters;
- package path in validator workspace if produced;
- package SHA-256 if produced;
- fresh-extraction byte identity result;
- failure classification if terminal FAIL;
- umbrella marker.

If all applicable blocks pass, terminal report must contain:
`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

If any applicable block fails, that umbrella marker must be absent.

After publishing the report, STOP. Do not perform live/operator actions. Do not publish/rebuild a replacement package after the authoritative run.

# Required final response schema

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN8_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

qualified_environment_commit:
  c8a4d185573e2d96a05f8a1c9fa3da7b10a2dc78

candidate:
  frozen_artifact_sha256: <sha256>
  repair_patch_sha256: <sha256>
  final_worker_sha256: <sha256>
  final_content_sha256: <sha256>
  production_inventory: <integer>
  changed_files_exactly_2: PASS|FAIL
  protected_15_byte_identical: PASS|FAIL

environment:
  source_cft_inventory_sha256: <sha256>
  source_copy_byte_identical: PASS|FAIL
  setup_exit_code: <integer|NOT_RUN>
  copied_cft_post_setup_byte_identical: PASS|FAIL|NOT_RUN
  launch: PASS|FAIL|NOT_RUN
  spawn_args_exact_match: PASS|FAIL|NOT_RUN
  install_extension: PASS|FAIL|NOT_RUN
  enumerate_extension: PASS|FAIL|NOT_RUN
  worker_activation: PASS|FAIL|NOT_RUN

full_gate:
  block_01_candidate_integrity_reconstruction: PASS|FAIL|NOT_APPLICABLE
  block_02_command_discovery_strict_contract: PASS|FAIL|NOT_APPLICABLE
  block_03_provider_security_boundary: PASS|FAIL|NOT_APPLICABLE
  block_04_seller_capability_entitlement: PASS|FAIL|NOT_APPLICABLE
  block_05_query_planner_coalescing_projection: PASS|FAIL|NOT_APPLICABLE
  block_06_global_seller_quota_scheduler: PASS|FAIL|NOT_APPLICABLE
  block_07_response_verifier_safe_errors: PASS|FAIL|NOT_APPLICABLE
  block_08_verified_analytics_cache_prefetch: PASS|FAIL|NOT_APPLICABLE
  block_09_manual_autorun_common_batch_engine: PASS|FAIL|NOT_APPLICABLE
  block_10_delivery_fsm_normal_empty_composer: PASS|FAIL|NOT_APPLICABLE
  block_11_manual_delivery_occupied_missing_composer: PASS|FAIL|NOT_APPLICABLE
  block_12_manual_off_cancellation_off_on_readiness: PASS|FAIL|NOT_APPLICABLE
  block_13_ui_bindings_owner_isolation: PASS|FAIL|NOT_APPLICABLE
  block_14_performance_regression_boundary: PASS|FAIL|NOT_APPLICABLE
  block_15_browser_runtime_robustness: PASS|FAIL|NOT_APPLICABLE
  block_16_packaging_gate: PASS|FAIL|NOT_APPLICABLE
  terminal: PASS|FAIL

network:
  real_ozon_requests: <integer>
  real_performance_requests: <integer>
  operator_browser_actions: <integer>

modifications:
  production_by_validator: <integer>
  candidate_by_validator: <integer>
  source_cft_by_validator: <integer>

package:
  workspace_path: <path|NONE>
  sha256: <sha256|NONE>
  fresh_extract_byte_identical: PASS|FAIL|NOT_RUN

failure_classification:
  NONE|PRODUCTION_BEHAVIOR_FAILURE|HARNESS_FIXTURE_FAILURE|HARNESS_ERROR|ENVIRONMENT_ERROR|PRODUCTION_CANDIDATE_RECONSTRUCTION_FAILURE|<exact other>

umbrella_marker:
  OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|ABSENT

report_branch:
  <branch>

report_commit:
  <sha>
```
