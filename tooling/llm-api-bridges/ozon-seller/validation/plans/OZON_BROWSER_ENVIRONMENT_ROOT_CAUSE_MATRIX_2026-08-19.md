# Ozon Bridge — consolidated browser environment root-cause matrix

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_DIAGNOSTIC_MATRIX`

# STANDALONE CODEX ROOT-CAUSE MATRIX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This is ONE consolidated browser-environment diagnostic execution. It replaces the prior one-preflight-at-a-time workflow. Run all independent diagnostic arms in one execution and publish one final root-cause report. Do not stop after the first non-catastrophic arm failure; continue with fresh isolated browser/CFT/profile materialization for the remaining arms whenever technically possible.

Do NOT run the production full 01–16 gate in this diagnostic execution.
Do NOT modify production or candidate bytes.
Do NOT install/update dependencies.
Do NOT use operator Chrome/profile/credentials.
Do NOT make real Ozon or Performance requests.
Do NOT perform operator browser actions.

## Immutable authorities

Gate checkpoint:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Candidate hashes:
- service_worker.js: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- content_script.js: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Environment/correction authorities to read completely:
- qualified environment `c8a4d185573e2d96a05f8a1c9fa3da7b10a2dc78`
- canonical inventory correction `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`
- absolute path correction `36bbb81062d12348e87ce6297af2df8566bf6a46`
- RERUN10 report `1162902368486cc5c8618748b5b057400d828427`
- preflight7 report `ce79be984d80b7784cc57dcd45b57301bd1e3329`
- preflight8 report `b92eb20e0d4330b1a813a73b386ba131a1dc7a4c`
- GPU A/B report `1b34539c9869bc93c6a367e65c353a8d79f39a7b`
- Chrome151 target-model forensic correction `ba0f541bea478db22086bbcc15eb5cab713bae15`

Puppeteer 25.4.0 source facts to verify against the exact tag before execution:
- `CdpBrowser._createPageInContext()` sends `Target.createTarget({url:'about:blank'})`, receives `targetId`, then waits for a Puppeteer target with exactly that id.
- `CdpTarget.type()` maps raw `tab` to TAB.
- `CdpTarget._isTargetExposed()` excludes TAB.
- TargetManager separately handles tab targets and child page targets.

## Shared environment contract

Use Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`.

For EACH arm that launches Chrome:
1. verify source CFT canonical inventory using exactly the preflight6 algorithm: 308 regular files, SHA-256 `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`;
2. make a fresh validation-owned byte-identical CFT copy;
3. require source/copy canonical per-file identity;
4. run copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` once, shell:false, no elevation; require exit code `78`;
5. require copied-tree bytes/inventory unchanged after setup;
6. use fresh userDataDir;
7. use `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`;
8. base minimal args exactly:
   - `--user-data-dir=<fresh-profile>`
   - `--remote-debugging-port=0`
   - `--no-first-run`
   - `--no-default-browser-check`
   - `--disable-background-networking`
   - `--disable-component-update`
   - `--disable-sync`
   - `--metrics-recording-only`
   - `--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0`
   - `about:blank`

Only where an arm explicitly says so, append exactly one diagnostic-only switch: `--disable-gpu-sandbox` immediately before `about:blank`. No other switch changes are authorized.

No retries within an arm. Fresh materialization for the next independent arm is allowed and required.

# Diagnostic matrix

## Arm 1 — raw Chrome 151 target topology, baseline, no extension

Do NOT call `browser.newPage()`.

After launch, create a browser-level CDP session and:
- enable target discovery if needed;
- capture raw `Target.targetCreated`, `Target.targetInfoChanged`, `Target.attachedToTarget`, `Target.detachedFromTarget`;
- capture `Target.getTargets` BEFORE create;
- call exactly once `Target.createTarget({url:'about:blank'})`;
- record returned `targetId`;
- capture raw events for a bounded short observation window sufficient for target creation/attachment;
- capture `Target.getTargets` AFTER create;
- capture Puppeteer `browser.targets()` after create.

For the returned id and all directly related targets record:
`targetId,type,url,attached,openerId,subtype,browserContextId` plus parent/child relation inferred from the raw event/session topology.

Determine exact topology A/B/C/D from correction `ba0f541...`.

If Chrome exits, record dumpio and exit code but continue to Arm 2.

## Arm 2 — raw Chrome 151 target topology with diagnostic-only --disable-gpu-sandbox, no extension

Same as Arm 1, but append exactly `--disable-gpu-sandbox` as the only semantic argument difference.

Do NOT call `browser.newPage()`.

This arm answers both:
- whether GPU STATUS_ACCESS_DENIED/fatal disappears;
- whether raw target topology is unchanged.

## Arm 3 — instrumented Puppeteer newPage baseline

Fresh baseline environment, no extension.

Before `browser.newPage()`:
- attach browser-level raw Target event logging;
- monkeypatch/wrap only the temporary validation call boundary as needed to log the raw `Target.createTarget` response id without changing production or Puppeteer package files on disk;
- record browser.targets() before.

Call `browser.newPage()` exactly once using Puppeteer 25.4.0 normal implementation. Do not change its functional semantics or package source.

Whether PASS or timeout, record:
- raw createTarget returned id if observable;
- raw target topology associated with that id;
- whether returned id type is `tab` or `page`;
- any distinct child `page` id;
- whether Puppeteer `browser.targets()` exposes returned id or child page id;
- browser exit code;
- GPU 0xC0000022/fatal presence.

Continue to Arm 4.

## Arm 4 — instrumented Puppeteer newPage with diagnostic-only --disable-gpu-sandbox

Same as Arm 3 with the single additional switch `--disable-gpu-sandbox`.

This arm is decisive for separating:
- GPU process fatal from
- Puppeteer target-id/page-exposure mismatch.

If Arm 4 remains browser-alive but `newPage()` times out while raw topology proves `createTarget` returned TAB id and a distinct PAGE child exists, classify the newPage failure as Puppeteer/Chrome151 target-model incompatibility, not GPU failure.

## Arm 5 — direct raw target to usable PAGE target, baseline, no extension

Fresh baseline environment.

Do NOT call `browser.newPage()`.

Use one raw `Target.createTarget({url:'about:blank'})` and raw target events/getTargets to identify the actual PAGE target corresponding to the created tab/page topology.

If a PAGE target exists and Puppeteer exposes it, obtain that exact existing Puppeteer Target and call `target.createCDPSession()`; do not create another page.

If Puppeteer does not expose the PAGE target but raw CDP shows it, use only public CDP Target attach/session semantics sufficient to test `Runtime.enable` and `Runtime.evaluate({expression:'1+1',returnByValue:true})` against that PAGE target; do not navigate externally.

Record whether direct PAGE-target Runtime evaluation returns `2` and whether browser remains alive for 5 seconds.

If baseline Chrome exits due GPU fatal, record and continue to Arm 6.

## Arm 6 — direct raw target to usable PAGE target with --disable-gpu-sandbox, no extension

Same as Arm 5, with only `--disable-gpu-sandbox` added.

This arm determines whether there exists a stable page-capable validation route even if Puppeteer `newPage()` is incompatible.

Require 5-second post-evaluation browser liveness for PASS.

## Arm 7 — candidate install/enumerate + direct PAGE-target ServiceWorker activation, baseline

Fresh baseline environment.

Verify candidate hashes before install.
Runtime-install exact candidate with `browser.installExtension(candidateDir)`.
Require `browser.extensions()` enumeration of same id, enabled, version `0.1.19`.
Record initial `extension.workers()`.

Do NOT call `browser.newPage()`.
Do NOT call `extension.triggerAction()`.
Do NOT open/click popup/action UI.

Use the raw/direct PAGE-target method proven/observed in Arms 1–6 to obtain a PAGE-target CDP session without creating via Puppeteer `newPage()`.

On the PAGE-target CDP session:
- call `ServiceWorker.enable`;
- capture `ServiceWorker.workerRegistrationUpdated` and `ServiceWorker.workerVersionUpdated` events;
- identify only registration whose scope belongs to `chrome-extension://<extensionId>/`;
- record exact candidate scope;
- call `ServiceWorker.startWorker({scopeURL:<exact candidate scope>})` exactly once;
- bounded-poll only `extension.workers()`;
- require a candidate worker URL starting `chrome-extension://<extensionId>/`;
- use the returned worker for a harmless Runtime evaluation such as `1+1` and require `2`;
- require browser liveness for 5 seconds.

If baseline browser dies due GPU fatal before completion, record and continue to Arm 8.

## Arm 8 — candidate install/enumerate + direct PAGE-target ServiceWorker activation with --disable-gpu-sandbox

Same as Arm 7, with exactly one additional switch `--disable-gpu-sandbox`.

No other workaround is permitted.

This arm determines whether the complete browser-validation substrate (page target + extension + MV3 worker) is viable under the diagnostic GPU sandbox exception.

# Root-cause decision table

The report MUST classify each statement independently as PROVEN / DISPROVEN / UNRESOLVED from observed evidence:

1. `CHROME151_CREATE_TARGET_RETURNS_TAB_WITH_DISTINCT_PAGE_CHILD`
2. `PUPPETEER25_NEW_PAGE_WAITS_ON_UNEXPOSED_TAB_ID`
3. `GPU_SANDBOX_CAUSES_STATUS_ACCESS_DENIED_FATAL`
4. `GPU_SANDBOX_FATAL_IS_SOLE_CAUSE_OF_NEW_PAGE_FAILURE`
5. `DIRECT_RAW_PAGE_TARGET_RUNTIME_WORKS_BASELINE`
6. `DIRECT_RAW_PAGE_TARGET_RUNTIME_WORKS_WITH_DISABLE_GPU_SANDBOX`
7. `DIRECT_PAGE_SESSION_SERVICE_WORKER_DOMAIN_AVAILABLE`
8. `CANDIDATE_REGISTRATION_VISIBLE`
9. `DIRECT_START_WORKER_ACTIVATES_CANDIDATE_BASELINE`
10. `DIRECT_START_WORKER_ACTIVATES_CANDIDATE_WITH_DISABLE_GPU_SANDBOX`
11. `BROWSER_STABLE_5S_AFTER_WORKER_ACTIVATION_BASELINE`
12. `BROWSER_STABLE_5S_AFTER_WORKER_ACTIVATION_WITH_DISABLE_GPU_SANDBOX`

Then emit exactly ONE final root-cause classification from:

- `PUPPETEER_CHROME151_TARGET_MODEL_MISMATCH_ONLY`
- `WINDOWS_GPU_SANDBOX_ONLY`
- `PUPPETEER_TARGET_MODEL_PLUS_WINDOWS_GPU_SANDBOX`
- `DIRECT_WORKER_ACTIVATION_PATH_FAILURE`
- `CHROME151_RENDERER_OR_TARGET_CREATION_FAILURE`
- `ENVIRONMENT_ROOT_CAUSE_OTHER_WITH_EXACT_EVIDENCE`
- `ENVIRONMENT_ROOT_CAUSE_UNRESOLVED`

Do not call something proven unless the corresponding arm directly demonstrates it.

# Required recommended harness architecture

At the end, based solely on proven results, state one exact next full-gate browser architecture, or `NONE` if unresolved.

Possible components may include only those proven in this matrix:
- existing qualified owned-copy CFT setup;
- baseline minimal args OR minimal args + diagnostic `--disable-gpu-sandbox` if and only if required by evidence;
- avoid `browser.newPage()` if target-model mismatch proven;
- direct raw `Target.createTarget` + actual PAGE child target session if proven;
- direct PAGE-session `ServiceWorker.startWorker` if proven;
- never use `extension.triggerAction()` for worker activation.

No production change recommendation is permitted from this matrix.

# Safety totals

Require:
- REAL_OZON_REQUESTS=0
- REAL_PERFORMANCE_REQUESTS=0
- OPERATOR_BROWSER_ACTIONS=0
- production modifications=0
- candidate modifications=0
- source CFT modifications=0

# Report

Create report-only branch:
`validation/ozon-browser-environment-root-cause-matrix-2026-08-19`

Publish exactly one report under:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_BROWSER_ENVIRONMENT_ROOT_CAUSE_MATRIX_2026-08-19.md`

Include exact commands, exact actual args per arm, raw target tables/events relevant to classification, errors/dumpio/exit codes, extension id/scope/worker URL where reached, all 12 decision-table statements, one final classification, and one exact recommended next full-gate architecture or NONE.

After publishing the report, STOP. Do not run the 01–16 gate and do not package.

# Required final response schema

```text
OZON_BROWSER_ENVIRONMENT_ROOT_CAUSE_MATRIX_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

arms:
  arm_1_raw_target_baseline: PASS|FAIL
  arm_2_raw_target_disable_gpu_sandbox: PASS|FAIL
  arm_3_new_page_baseline: PASS|FAIL
  arm_4_new_page_disable_gpu_sandbox: PASS|FAIL
  arm_5_direct_page_runtime_baseline: PASS|FAIL
  arm_6_direct_page_runtime_disable_gpu_sandbox: PASS|FAIL
  arm_7_worker_activation_baseline: PASS|FAIL
  arm_8_worker_activation_disable_gpu_sandbox: PASS|FAIL

decisions:
  chrome151_create_target_returns_tab_with_distinct_page_child: PROVEN|DISPROVEN|UNRESOLVED
  puppeteer25_new_page_waits_on_unexposed_tab_id: PROVEN|DISPROVEN|UNRESOLVED
  gpu_sandbox_causes_status_access_denied_fatal: PROVEN|DISPROVEN|UNRESOLVED
  gpu_sandbox_fatal_is_sole_cause_of_new_page_failure: PROVEN|DISPROVEN|UNRESOLVED
  direct_raw_page_target_runtime_works_baseline: PROVEN|DISPROVEN|UNRESOLVED
  direct_raw_page_target_runtime_works_with_disable_gpu_sandbox: PROVEN|DISPROVEN|UNRESOLVED
  direct_page_session_service_worker_domain_available: PROVEN|DISPROVEN|UNRESOLVED
  candidate_registration_visible: PROVEN|DISPROVEN|UNRESOLVED
  direct_start_worker_activates_candidate_baseline: PROVEN|DISPROVEN|UNRESOLVED
  direct_start_worker_activates_candidate_with_disable_gpu_sandbox: PROVEN|DISPROVEN|UNRESOLVED
  browser_stable_5s_after_worker_activation_baseline: PROVEN|DISPROVEN|UNRESOLVED
  browser_stable_5s_after_worker_activation_with_disable_gpu_sandbox: PROVEN|DISPROVEN|UNRESOLVED

root_cause_classification:
  <one allowed classification>

recommended_next_full_gate_browser_architecture:
  <exact concise architecture|NONE>

network:
  real_ozon_requests: 0
  real_performance_requests: 0
  operator_browser_actions: 0

modifications:
  production: 0
  candidate: 0
  source_cft: 0

report_branch:
  validation/ozon-browser-environment-root-cause-matrix-2026-08-19

report_commit:
  <sha>
```
