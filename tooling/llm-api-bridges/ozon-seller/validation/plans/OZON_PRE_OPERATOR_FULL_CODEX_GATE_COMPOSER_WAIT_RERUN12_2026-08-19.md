# Ozon Bridge v0.1.19 — integrated no-sandbox validator full-gate RERUN12

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_INTEGRATED_RERUN12`

# RERUN12 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

Codex is the independent validator. Production is immutable.

This is ONE top-level execution. Do not ask the operator for intermediate actions or return intermediate results. Do not publish intermediate reports.

The command has exactly two terminal paths:

1. `accepting substrate PASS -> immediately execute every applicable permanent block 01-16 in the same top-level execution -> package exact tested tree -> fresh-extract/hash verify -> publish one final report`;
2. `accepting substrate FAIL -> finish the failure diagnostics embedded in this same execution -> publish one final report -> STOP without full gate/package`.

No separate preflight is authorized.

## Required authorities — read completely before building the validation runner

1. Permanent gate:
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

7. Root-cause matrix report:
`70097f932d9848415c05a95ec223ea388f2bfef0`

8. RERUN11 report:
`799528efd77e46808415f050230c400a3c38f252`

9. Windows validator sandbox supersession — this is the accepting environment authority for this run:
`2c51de4f3ffb5f979b17bc5597be06d5d085e46a`

10. Current browser harness manifest:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/COMPOSER_WAIT_BROWSER_HARNESS_MANIFEST.md`

Read all referenced targeted/worker/regression/browser harness blobs and historical accepted markers required by the permanent gate. Do not substitute summaries for live files.

## Immutable candidate pins

Frozen artifact:
`tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`

Frozen artifact SHA-256:
`d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`

Repair patch concatenated SHA-256:
`bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Final production SHA-256:
- `service_worker.js` = `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- `content_script.js` = `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Expected production inventory: 17 files.
Expected changed production files: exactly 2: `service_worker.js`, `content_script.js`.
Expected protected unchanged production files: 15, byte-identical to frozen base.

Reconstruct candidate from frozen artifact + exact repair patch from scratch in this execution. Do not reuse a mutable prior candidate directory as acceptance evidence.

## Environment pins

- Node `v24.12.0`
- Puppeteer `25.4.0`
- Chrome for Testing `151.0.7922.47`
- canonical source CFT regular files: `308`
- canonical source CFT inventory SHA-256 using exactly the preflight6 algorithm: `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`

For the accepting browser environment:

1. resolve repository root and QA root to absolute paths before child spawn;
2. verify canonical source CFT inventory;
3. create a fresh validation-owned byte-identical CFT copy;
4. require source/copy per-file byte identity;
5. run copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` exactly once, `shell:false`, no elevation;
6. require setup exit code `78`;
7. require copied CFT bytes/inventory still identical after setup;
8. use a fresh validation-only profile;
9. use `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`;
10. accepting launch args after profile normalization must be exactly:
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
11. do NOT also pass `--disable-gpu-sandbox`;
12. do NOT add any other sandbox/security/renderer/GPU switch;
13. do NOT update dependencies or browser version;
14. do NOT use operator Chrome/profile/credentials.

The `--no-sandbox` switch is validation-only and MUST NOT enter production code, manifest, package, operator instructions, or live acceptance instructions.

## Strengthened isolation requirements for the no-sandbox validator browser

These are mandatory and failure of any one is terminal:

- synthetic pages only;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `REAL_CHATGPT_REQUESTS=0`;
- `OPERATOR_BROWSER_ACTIONS=0`;
- no real credentials;
- page-target `Fetch` interception must be enabled before any supported-origin synthetic navigation and must fulfill the intended synthetic ChatGPT/Alice fixture locally;
- every unexpected page request must be failed locally, never continued to the network;
- worker-level Network instrumentation must record and fail on any Seller/Performance provider request;
- existing fixed-host resolver blocks remain active;
- background-network reduction switches remain active;
- any unexpected external browser request is terminal environment/harness FAIL.

## Phase A — deterministic candidate reconstruction and integrity

Before browser work, reconstruct exact candidate and assert all Permanent Gate block-01 requirements, including:

- frozen artifact hash exact;
- repair patch parts and concatenated patch hash exact;
- patch no fuzz/manual repair;
- final worker/content hashes exact;
- production inventory 17;
- exactly two changed production files;
- protected 15 byte-identical;
- all production JS `node --check`;
- manifest parse;
- no permission/host-permission expansion;
- no dev/test/report/credential artifacts in production tree.

Do not yet mark Permanent Gate block 01 PASS until the consolidated run reaches the permanent-block accounting phase; but the candidate used by all subsequent phases must be this exact reconstructed tree.

## Phase B — accepting browser substrate, in this same execution

This phase is not a separate report or operator-visible preflight. It is an internal prerequisite of this one RERUN12 execution.

### B1. Runtime install/enumeration

- launch accepting validator Chrome with exact contract above;
- require browser process remains alive;
- require exact spawn args match;
- `browser.installExtension(candidateDir)` exactly once;
- `browser.extensions()` exactly once after install;
- identify exact returned extension id;
- require candidate enabled and version `0.1.19`;
- no `extension.triggerAction()`.

### B2. Raw PAGE adapter qualification

Do NOT use `browser.newPage()` anywhere in the acceptance browser harness.

Create a raw PAGE through browser-level CDP `Target.createTarget({url:'about:blank'})`.
Resolve exactly the returned raw `page` target and its debugger websocket through the local DevTools endpoint (`/json/list`) or equivalent raw target metadata. Connect directly to that PAGE target websocket.

Require:

- raw target type is `page`;
- `Runtime.enable` succeeds;
- `Page.enable` succeeds;
- harmless `Runtime.evaluate('1+1')` returns `2`;
- `Fetch.enable` can be enabled for request-stage interception;
- local inert synthetic document can be loaded and evaluated without external network;
- browser remains alive after qualification.

If this fails, do not run permanent blocks. Continue directly to Phase F failure diagnostics in the same execution.

### B3. Candidate MV3 worker qualification

First call `extension.workers()`.

If an exact candidate worker is already active, use it.

If zero candidate workers are active:

1. on the qualified raw PAGE CDP session call `ServiceWorker.enable`;
2. collect `ServiceWorker.workerRegistrationUpdated` and `ServiceWorker.workerVersionUpdated` long enough to identify only the registration whose scope belongs to `chrome-extension://<extensionId>/`;
3. require exact candidate registration scope;
4. call `ServiceWorker.startWorker({scopeURL:<exact candidate scope>})` exactly once;
5. bounded-poll candidate worker discovery; do not retry `startWorker`;
6. require exactly a candidate extension service-worker URL starting `chrome-extension://<extensionId>/`.

Then require harmless worker Runtime evaluation `1+1 === 2` and bounded post-worker browser liveness.

No toolbar action, popup click, synthetic ChatGPT wake, or provider request may be used to activate the worker.

If worker qualification fails, do not run permanent blocks. Continue to Phase F in the same execution.

### B4. Raw-CDP synthetic page adapter for browser behavior

Port the existing browser behavioral assertions to a validation-only raw-CDP adapter. Production files are immutable.

The adapter must support only what the existing browser tests require, using raw CDP:

- local synthetic navigation at the exact supported fixture URL via `Page.navigate` with `Fetch` request interception/fulfillment before external dispatch;
- `Runtime.evaluate` for DOM reads/writes/event dispatch/storage-independent page assertions;
- `Page.reload` or equivalent local re-navigation for lifecycle restart;
- `DOM`/`Runtime` or `Input` for button click semantics;
- no semantic weakening compared with the existing Puppeteer Page assertions.

Before continuing to permanent blocks, execute a minimal adapter self-check against the same synthetic fixture model used by the browser harness and require:

- supported URL is local-fulfilled with `REAL_CHATGPT_REQUESTS=0`;
- DOM query/evaluation works;
- input/change event dispatch works;
- button click handler works;
- reload/re-navigation works;
- content script can initialize on the supported synthetic origin after extension install;
- browser remains alive.

If Phase B1-B4 all PASS, print exactly:

`RERUN12_ACCEPTING_NO_SANDBOX_RAW_CDP_SUBSTRATE_PASS`

and immediately continue to Phase C in the SAME top-level execution. Do not stop or publish anything.

## Phase C — one consolidated Permanent Gate blocks 01-14

Execute every currently applicable requirement of permanent blocks 01-14 from the live permanent gate. Do not replace them with previous PASS reports. All are applicable to this candidate.

Use the existing canonical targeted/worker/regression harnesses and their live authority files, reconstructed from GitHub blobs where necessary. Do not edit production. Do not weaken assertions.

Require the current composer-wait targeted regression terminal marker and all required current markers, including at minimum:

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
- `TARGETED_COMPOSER_WAIT_REGRESSION_PASS`

Require historical/current worker regression carry-forward markers from the permanent gate authorities, including quota/restart/Retry-After/security/planner/cache/delivery/common-batch/public-state/privacy assertions. Preserve exact 60000/5000/65000 timing semantics.

At end of Phase C, assign permanent blocks 01-14 individually PASS or FAIL from this execution only.

Any applicable block failure terminates functional acceptance, but still publish the one final RERUN12 report after cleanup. Do not package.

## Phase D — Permanent Gate block 15 browser/runtime robustness

Run the full current browser behavior matrix on the exact reconstructed candidate using ONLY the accepting no-sandbox raw-CDP adapter qualified in Phase B.

All existing browser assertions remain mandatory. Required current composer-wait browser markers include:

- `FULL_BROWSER_MANUAL_OCCUPIED_PLATE_PERSIST_PASS`
- `FULL_BROWSER_MANUAL_CLEAR_INSERT_ONCE_PASS`
- `FULL_BROWSER_MANUAL_EXISTING_SEND_MICROPHONE_PASS`
- `FULL_BROWSER_NATIVE_COPY_WHILE_WAITING_PASS`
- `FULL_BROWSER_MANUAL_OFF_CANCEL_PENDING_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_READY_PASS`
- `FULL_BROWSER_MANUAL_OFF_ON_QUOTA_CACHE_PRESERVED_PASS`
- `FULL_BROWSER_CANCELLED_REPORT_NEVER_REAPPEARS_PASS`
- `OZON_COMPOSER_WAIT_BROWSER_HARNESS_PASS`

Also execute all other currently applicable browser/runtime robustness assertions required by the permanent gate/historical accepted harness authorities, including:

- MV3 worker loaded;
- content script initializes on supported synthetic ChatGPT/Alice fixtures;
- native Copy independence;
- owner isolation/multi-owner behavior required by the gate;
- page/content lifecycle restart without duplicate provider/insertion/Send;
- no provider replay;
- wrong owner/conversation fail-closed behavior;
- one-Send/Microphone semantics;
- zero real Seller/Performance/ChatGPT network;
- no unexpected runtime/console failure.

No browser assertion may be skipped because the adapter is raw CDP rather than Puppeteer Page.

Require block 15 PASS before packaging.

## Phase E — Permanent Gate block 16 packaging

ONLY if blocks 01-15 are all PASS in this same execution:

1. package exactly the tested 17-file production tree; do not rebuild candidate from another source;
2. exclude validation/tests/reports/development/credentials;
3. produce one ZIP workspace artifact;
4. record SHA-256;
5. fresh-extract to a new directory;
6. require exactly the same production inventory;
7. compare all 17 extracted production files byte-for-byte with the tested tree;
8. require final worker/content hashes exact;
9. rerun production JS syntax checks and manifest parse on fresh extract;
10. require no package drift.

If block 16 PASS and every applicable block 01-15 PASS, print terminal umbrella marker exactly:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

The package generated in this run is the only package eligible for operator handoff. Do not rebuild after PASS.

## Phase F — failure diagnostics, only if accepting substrate Phase B fails

These diagnostics occur in this same top-level command and produce no intermediate report.

Do NOT modify system security policy, ACLs, registry, services, production, candidate, or CFT source.

Record exact failed raw command and target metadata.
Record accepting Chrome PID/exit code/dumpio while still available.
Record child Chrome process command lines/types and exit codes if readable from the current validation identity.
Attempt read-only `IsProcessInJob`/job membership for validator and accepting browser process if a reliable local method exists; otherwise record NOT_AVAILABLE rather than guessing.
Attempt read-only relevant Windows event/policy evidence if accessible without elevation; otherwise record NONE/NOT_AVAILABLE.

Do not add a new browser flag matrix. `--no-sandbox` is already the accepting contract for RERUN12. If it fails, no further weaker sandbox mode is authorized in this run.

Classify the substrate failure precisely from observed evidence. Do not call it a production failure unless a production assertion actually failed after a qualified substrate.

## Hard safety and mutation rules

Throughout the entire top-level execution:

- production modifications by validator = 0;
- candidate modifications by validator = 0 after reconstruction;
- source CFT modifications by validator = 0;
- real Ozon requests = 0;
- real Performance requests = 0;
- real ChatGPT requests = 0;
- operator browser actions = 0;
- no real credentials;
- no dependency/browser update;
- no production test weakening;
- no package if any block 01-15 fails or is not reached;
- no previous PASS substituted for a required current execution;
- report-only validation branch;
- STOP immediately after the single final report is published.

## Final report

Create report-only branch:
`validation/ozon-pre-operator-full-gate-composer-wait-rerun12-2026-08-19`

Publish exactly one report:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN12_2026-08-19.md`

The report must include:

- all exact authorities/hashes;
- candidate reconstruction evidence;
- CFT/setup evidence;
- exact actual accepting Chrome args;
- Phase B substrate markers/results;
- extension id/worker URL/scope where reached;
- page/worker Runtime results;
- network counters;
- every permanent block 01-16 as `PASS|FAIL|NOT_RUN`; `NOT_APPLICABLE` is forbidden because all current blocks are applicable;
- browser required markers;
- package path/hash/fresh-extract identity if produced;
- production/candidate/source-CFT modification counters;
- exact failure classification if not PASS;
- umbrella marker presence/absence.

## Required final response schema

Return exactly:

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN12_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

validator_sandbox_supersession_commit:
  2c51de4f3ffb5f979b17bc5597be06d5d085e46a

candidate:
  frozen_artifact_sha256: d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c
  repair_patch_sha256: bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d
  final_worker_sha256: dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac
  final_content_sha256: ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda
  production_inventory: <number|NOT_RUN>
  changed_files_exactly_2: PASS|FAIL|NOT_RUN
  protected_15_byte_identical: PASS|FAIL|NOT_RUN

environment:
  canonical_source_cft_file_count: <number|NOT_RUN>
  canonical_source_cft_inventory_sha256: <sha|NOT_RUN>
  source_copy_byte_identical: PASS|FAIL|NOT_RUN
  setup_exit_code: <integer|NOT_RUN>
  copied_cft_post_setup_byte_identical: PASS|FAIL|NOT_RUN
  launch: PASS|FAIL|NOT_RUN
  spawn_args_exact_match: PASS|FAIL|NOT_RUN
  no_sandbox_validator_exception_exact: PASS|FAIL|NOT_RUN
  install_extension: PASS|FAIL|NOT_RUN
  enumerate_extension: PASS|FAIL|NOT_RUN
  raw_page_runtime: PASS|FAIL|NOT_RUN
  raw_local_fixture: PASS|FAIL|NOT_RUN
  worker_activation: PASS|FAIL|NOT_RUN
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
  workspace_path: <absolute-path|NONE>
  sha256: <sha|NONE>
  fresh_extract_byte_identical: PASS|FAIL|NOT_RUN

failure_classification:
  <NONE|exact classification>

umbrella_marker:
  PRESENT|ABSENT

report_branch:
  validation/ozon-pre-operator-full-gate-composer-wait-rerun12-2026-08-19

report_commit:
  <sha>
```

After publishing that single report: STOP.