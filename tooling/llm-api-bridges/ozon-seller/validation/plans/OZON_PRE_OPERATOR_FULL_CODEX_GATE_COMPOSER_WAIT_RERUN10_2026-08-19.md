# Ozon Bridge v0.1.19 — consolidated pre-operator full-gate rerun 10

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_CONSOLIDATED_RERUN10`

# RERUN10 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository: `MaksimUnimax/blood_sand`

Codex is the independent validator. Do not modify production.

## Read exact authorities completely

1. Permanent living gate:
   `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`
2. Deterministic candidate checkpoint:
   `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`
3. Qualified environment authority:
   `c8a4d185573e2d96a05f8a1c9fa3da7b10a2dc78`
4. Qualified environment PASS evidence:
   `6eaa50d9cfaf9d9bc5eb54f8e0ab7a1dde080a71`
5. Inventory forensic report:
   `60acc40aa484087f4c408d03611597625f2dab33`
6. Canonical inventory/status correction:
   `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`
7. Absolute-path correction:
   `36bbb81062d12348e87ce6297af2df8566bf6a46`
8. RERUN9 report, failure provenance only:
   `88a48bb6e826c7347a1f0da95cb2a5d735910773`

RERUN9 provides no functional acceptance. Its canonical CFT copy/setup PASS evidence may be used only as provenance for the validation-harness failure; every applicable permanent functional block 01-16 must still execute in this run.

## Immutable candidate

Require exactly:

- frozen artifact SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final `service_worker.js` SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final `content_script.js` SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory: exactly 17 files
- changed production files: exactly `service_worker.js`, `content_script.js`
- protected other 15 production files: byte-identical to frozen base

Reject any production drift.

## Mandatory absolute-path correction

Before spawning any child runner, the outer wrapper MUST:

1. Resolve the repository root to an absolute normalized path.
2. Resolve the QA project root to an absolute normalized path.
3. Reject either if not absolute.
4. Verify, using absolute paths only:
   - repository root exists;
   - QA root exists;
   - frozen artifact exists at:
     `<absoluteRepoRoot>/tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`;
   - permanent living-gate file exists under the same absolute repository root;
   - Puppeteer project exists under the exact absolute QA root;
   - source CFT root exists under the exact absolute QA root.
5. Emit before candidate reconstruction:
   - `RERUN10_ABSOLUTE_REPO_ROOT=<path>`
   - `RERUN10_ABSOLUTE_QA_ROOT=<path>`
   - `RERUN10_ABSOLUTE_FROZEN_ARTIFACT=<path>`
   - `RERUN10_ABSOLUTE_PATH_PREFLIGHT_PASS`
6. Spawn the inner consolidated runner with absolute repository and QA roots only.
7. Child `cwd` must never be used to resolve repository, artifact, harness, candidate, or QA authority paths.

This is validation path plumbing only. Do not change functional assertions.

## Canonical CFT inventory and qualified materialization

Use ONLY the exact preflight6 canonical inventory algorithm from correction `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`:

- `fs.readdirSync(dir).sort()` recursion;
- regular files only via `lstatSync`;
- POSIX-normalized relative paths;
- records exactly `{path,size,sha256}`;
- final path sort;
- one JSON record per line;
- final trailing LF;
- SHA-256 of that UTF-8 text.

Require source CFT `151.0.7922.47`:

- regular files: `308`;
- canonical inventory SHA-256: `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`.

Create a fresh validation-owned full copy; require canonical source/copy per-file identity before setup.

Run copied:
`setup.exe --configure-browser-in-directory=<copiedBrowserDir>`
exactly once, `shell:false`, no elevation; require exact exit `78`.

Require copied-tree regular-file bytes/inventory unchanged after setup. Source CFT remains unmodified.

## Browser environment

Use exactly:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- copied CFT `151.0.7922.47`;
- `ignoreDefaultArgs:true`;
- `headless:false`;
- `enableExtensions:true`;
- `waitForInitialPage:false`;
- `dumpio:true`;
- fresh temporary `userDataDir`;
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

No other Chrome switch. No `--disable-gpu`. No `--no-sandbox`. No GPU/sandbox/crash-limit bypass. No dependency install/update. No operator Chrome profile.

Runtime-install exact reconstructed candidate with `browser.installExtension(candidateDir)`. Require `browser.extensions()` to enumerate the returned candidate id, enabled, version `0.1.19`.

Initial candidate `extension.workers()` count zero is allowed. For worker-dependent assertions use only authorized Extension API activation correction `d9c42e2cbffca37fc84cd14f294d455e423da542`: query candidate workers; if zero, create one inert local page, call `extension.triggerAction(page)` exactly once, bounded-poll only candidate workers, require candidate MV3 worker. No synthetic ChatGPT wake or popup-only primary wake. No timeout increase to hide failure. Validator triggerAction is not an operator action.

## Existing harness authorities

Preserve all accepted functional assertions. Authorities include:

- worker actual-path blob `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- browser countdown/binding blob `841429741d5ff9144a8a40506e657dc4392fe37c`
- regression carry-forward blob `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`
- targeted composer-wait harness SHA-256 `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`
- real-browser composer-wait harness SHA-256 `ce38adbf78a5501c6c130845f5d76d1e832234b5f8d217d7c9980f8958f7a5c1`
- worker due-fixture correction `d9d62a44a812b555d23490acc042ac744a2e3c45`

Temporary validator changes may only adapt absolute paths, expected repaired hashes, qualified copied-CFT materialization, and already-authorized validation-only fixture corrections. Do not weaken, remove, reinterpret, skip, or replace production behavior assertions.

## One authoritative consolidated execution

Prepare one temporary top-level wrapper/runner, syntax-check temporary validation code, then execute the full gate top-level command exactly ONCE.

The single run must:

1. perform absolute-path preflight above;
2. reconstruct exact candidate from immutable authority;
3. verify artifact/patch/parts/final hashes;
4. verify exact 17-file production inventory, exactly two authorized changed files, protected 15 byte-identical;
5. syntax-check production JS and parse manifest;
6. execute every applicable permanent living-gate block 01-14 using exact permanent definitions;
7. materialize qualified owned-copy CFT with canonical inventory algorithm;
8. require setup `78`, post-setup byte identity, exact launch args, candidate install/enumeration, worker activation;
9. execute all block 15 browser/runtime behavior including historical carry-forward and current composer-wait behavior;
10. require zero real Ozon/Performance requests and zero operator browser actions;
11. only if every applicable block 01-15 PASS, execute block 16 packaging;
12. package exactly the tested 17-file production tree;
13. compute ZIP SHA-256;
14. fresh-extract and byte-compare all production files;
15. rerun package syntax/manifest/inventory checks;
16. emit `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` only if every applicable block 01-16 PASS.

Do not reuse prior PASS evidence instead of executing the applicable functional block in this run.

On functional failure: no retry, no assertion weakening, no production edits, no packaging after block 01-15 failure.

## Block status semantics

Each block 01-16 is one of:
`PASS|FAIL|NOT_RUN|NOT_APPLICABLE`.

`NOT_RUN` means execution terminated before reaching existing functionality.
`NOT_APPLICABLE` is allowed only when that functionality is genuinely absent/removed.
Any applicable `FAIL` or `NOT_RUN` makes terminal FAIL and forbids the umbrella marker.

## Mandatory current browser markers

Require where applicable:

- `FULL_BROWSER_MANUAL_OCCUPIED_PLATE_PERSIST_PASS`
- `FULL_BROWSER_MANUAL_CLEAR_INSERT_ONCE_PASS`
- `FULL_BROWSER_MANUAL_EXISTING_SEND_MICROPHONE_PASS`
- `FULL_BROWSER_NATIVE_COPY_WHILE_WAITING_PASS`
- `FULL_BROWSER_MANUAL_OFF_CANCEL_PENDING_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_READY_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_QUOTA_CACHE_PRESERVED_PASS`
- `FULL_BROWSER_CANCELLED_REPORT_NEVER_REAPPEARS_PASS`
- `OZON_COMPOSER_WAIT_BROWSER_HARNESS_PASS`

Also execute all applicable historical countdown/binding, normal delivery, multi-owner, Alice, Copy, quota/cache, Performance, Step1-4, privacy and security assertions required by the permanent living gate.

## Hard counters

Require final:

- real Seller credentials `0`
- real Performance credentials `0`
- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- production modifications by validator `0`
- candidate modifications by validator `0`
- source CFT modifications by validator `0`

## Report and STOP

Create report-only branch:
`validation/ozon-pre-operator-full-gate-composer-wait-rerun10-2026-08-19`

Create exactly one new validation report under:
`tooling/llm-api-bridges/ozon-seller/validation/reports/`

Do not commit production, candidate tree, temporary harness, copied CFT, browser profile, credentials, or package bytes on the validation branch.

Report exact authorities/hashes, absolute-path diagnostics, candidate inventory/changed/protected verification, canonical CFT materialization, setup exit, actual spawn args, install/enumeration/worker diagnostics, all block 01-16 statuses, browser markers, safety counters, package workspace path/SHA if produced, fresh-extract result, failure classification, and umbrella marker.

After report publication STOP. No live/operator actions and no package rebuild after the authoritative run.

# Required final response schema

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN10_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

validation_correction_commit:
  36b20ff0c84b791f3418b1f51c23e52e571c8ef3

absolute_path_correction_commit:
  36bbb81062d12348e87ce6297af2df8566bf6a46

qualified_environment_commit:
  c8a4d185573e2d96a05f8a1c9fa3da7b10a2dc78

candidate:
  frozen_artifact_sha256: <sha256>
  repair_patch_sha256: <sha256>
  final_worker_sha256: <sha256>
  final_content_sha256: <sha256>
  production_inventory: <integer|NOT_RUN>
  changed_files_exactly_2: PASS|FAIL|NOT_RUN
  protected_15_byte_identical: PASS|FAIL|NOT_RUN

environment:
  canonical_source_cft_file_count: <integer|NOT_RUN>
  canonical_source_cft_inventory_sha256: <sha256|NOT_RUN>
  source_copy_byte_identical: PASS|FAIL|NOT_RUN
  setup_exit_code: <integer|NOT_RUN>
  copied_cft_post_setup_byte_identical: PASS|FAIL|NOT_RUN
  launch: PASS|FAIL|NOT_RUN
  spawn_args_exact_match: PASS|FAIL|NOT_RUN
  install_extension: PASS|FAIL|NOT_RUN
  enumerate_extension: PASS|FAIL|NOT_RUN
  worker_activation: PASS|FAIL|NOT_RUN

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
  NONE|PRODUCTION_BEHAVIOR_FAILURE|HARNESS_FIXTURE_FAILURE|HARNESS_ERROR|ENVIRONMENT_ERROR|<exact other>

umbrella_marker:
  PRESENT|ABSENT

report_branch:
  <branch>

report_commit:
  <sha>
```
