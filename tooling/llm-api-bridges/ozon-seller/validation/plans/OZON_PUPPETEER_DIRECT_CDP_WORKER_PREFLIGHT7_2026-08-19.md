# Ozon Puppeteer direct-CDP MV3 worker preflight7

Date: 2026-08-19
Status: `READY_TO_DISPATCH_WORKER_PREFLIGHT7`

# STANDALONE CODEX WORKER PREFLIGHT7 PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This is a browser-environment worker-activation preflight ONLY. Do not run permanent functional blocks 01-16. Do not package. Do not modify production or candidate bytes.

## Read exact authorities

Read completely:

1. Direct worker activation correction:
   commit `d5328dcee006214eb809e55b86dfe9279e58ee15`
   path `tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_DIRECT_CDP_MV3_WORKER_ACTIVATION_CORRECTION_2026-08-19.md`
2. Qualified browser environment:
   commit `c8a4d185573e2d96a05f8a1c9fa3da7b10a2dc78`
3. Canonical CFT inventory correction:
   commit `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`
4. Absolute-path correction:
   commit `36bbb81062d12348e87ce6297af2df8566bf6a46`
5. RERUN10 failure report:
   commit `1162902368486cc5c8618748b5b057400d828427`

RERUN10 functional PASS blocks are evidence only. Do not run them and do not claim them as preflight7 acceptance.

## Immutable candidate

Use the exact reconstructed candidate only and require before browser launch:

- gate checkpoint `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`;
- service_worker.js SHA-256 `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`;
- content_script.js SHA-256 `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`.

Production/candidate modification count must remain zero.

## Qualified browser materialization

Use exactly the already-qualified materialization:

- resolve repo and QA roots to absolute paths;
- canonical preflight6 source CFT inventory: 308 files, SHA-256 `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`;
- create fresh validation-owned byte-identical CFT copy;
- run copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` exactly once, `shell:false`, no elevation;
- require setup exit code `78`;
- require copied regular-file bytes/inventory unchanged after setup;
- source CFT tree unmodified;
- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- copied CFT `151.0.7922.47`;
- `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`;
- fresh temporary userDataDir;
- exact already-qualified minimal Chrome args only;
- no `--disable-gpu`, no `--no-sandbox`, no GPU/sandbox/crash-limit bypass;
- no dependency install/update and no operator profile.

## Execute exactly once

Create one temporary preflight runner, syntax-check it, then execute it exactly once.

Required stages and markers:

1. `ENV7_01_BEFORE_LAUNCH`
2. `ENV7_02_AFTER_LAUNCH pid=<pid> version=<version> ws=<endpoint>`
3. `ENV7_03_SPAWN_ARGS_EXACT_PASS`
4. `ENV7_04_BEFORE_INSTALL_EXTENSION`
5. `ENV7_05_AFTER_INSTALL_EXTENSION id=<id>`
6. `ENV7_06_EXTENSION_ENUMERATION_PASS id=<id> enabled=true version=0.1.19`
7. Query `extension.workers()` once and emit `ENV7_07_INITIAL_WORKERS count=<n> urls=<...>`.
8. Do NOT call `extension.triggerAction(page)` and do not open/click popup/action UI.
9. Obtain a browser-level CDP session using public Puppeteer target/session API.
10. Enable the CDP `ServiceWorker` domain and capture registration/version diagnostics.
11. Identify exactly one active/non-deleted registration whose `scopeURL` begins `chrome-extension://<candidateId>/`. Emit `ENV7_08_CANDIDATE_REGISTRATION scope=<scopeURL>`.
12. If `extension.workers()` already returned the candidate worker, do not call startWorker; otherwise emit `ENV7_09_BEFORE_START_WORKER scope=<scopeURL>` and call `ServiceWorker.startWorker({scopeURL})` exactly once.
13. Emit `ENV7_10_AFTER_START_WORKER` only if that CDP command resolves successfully.
14. Bounded-poll only the candidate `extension.workers()` and require at least one worker URL beginning `chrome-extension://<candidateId>/`.
15. Emit `ENV7_11_CANDIDATE_WORKER_ACTIVE url=<workerURL>`.
16. After Extension API proves the candidate worker exists, resolve its matching Puppeteer service-worker target, create a CDP session, enable `Runtime`, and evaluate only a harmless constant expression such as `1+1`. Require result `2`. Emit `ENV7_12_WORKER_CDP_RUNTIME_PASS`.
17. Keep the browser alive for a bounded 3-second post-activation observation while the worker CDP session remains attached. No page/UI behavior assertions. Require the main browser connection to remain open and no process exit. Emit `ENV7_13_POST_ACTIVATION_BROWSER_LIVENESS_PASS`.
18. Emit `ENV7_DIRECT_CDP_WORKER_PREFLIGHT_PASS` only if all required stages pass.

Capture and report exact Chrome dumpio tail, browser process exit status if any, all candidate service-worker registration/version diagnostics, whether `ServiceWorker.startWorker` was called, and exact failure operation on any failure.

A GPU child-process diagnostic line alone is not a pass/fail criterion. A main-browser fatal/exit, CDP connection closure, inability to identify the candidate registration, failure of `ServiceWorker.startWorker`, or inability to obtain the candidate worker is FAIL.

Do not retry any failed stage or alter flags/timeouts after failure.

## Hard safety counters

Require:

`REAL_OZON_REQUESTS=0`
`REAL_PERFORMANCE_REQUESTS=0`
`OPERATOR_BROWSER_ACTIONS=0`
`production_modifications_by_validator=0`
`candidate_modifications_by_validator=0`
`source_cft_modifications_by_validator=0`

## Report only

Create report-only branch:
`validation/ozon-puppeteer-direct-cdp-worker-preflight7-2026-08-19`

Create exactly one report under:
`tooling/llm-api-bridges/ozon-seller/validation/reports/`

Do not commit production, candidate tree, temporary harness, copied CFT, browser profile, credentials, or package bytes.

After publishing the report, STOP.

# Required final response schema

```text
OZON_PUPPETEER_DIRECT_CDP_WORKER_PREFLIGHT7_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

worker_activation_correction_commit:
  d5328dcee006214eb809e55b86dfe9279e58ee15

candidate:
  final_worker_sha256: <sha256>
  final_content_sha256: <sha256>

environment:
  canonical_source_cft_file_count: <integer>
  canonical_source_cft_inventory_sha256: <sha256>
  source_copy_byte_identical: PASS|FAIL
  setup_exit_code: <integer|NOT_RUN>
  copied_cft_post_setup_byte_identical: PASS|FAIL|NOT_RUN
  launch: PASS|FAIL|NOT_RUN
  spawn_args_exact_match: PASS|FAIL|NOT_RUN
  install_extension: PASS|FAIL|NOT_RUN
  enumerate_extension: PASS|FAIL|NOT_RUN

worker_activation:
  initial_worker_count: <integer|NOT_RUN>
  candidate_registration: PASS|FAIL|NOT_RUN
  registration_scope: <scope|NONE|NOT_RUN>
  start_worker_called: true|false|NOT_RUN
  start_worker: PASS|FAIL|NOT_RUN
  candidate_worker_active: PASS|FAIL|NOT_RUN
  worker_cdp_runtime: PASS|FAIL|NOT_RUN
  post_activation_browser_liveness: PASS|FAIL|NOT_RUN
  terminal: PASS|FAIL

network:
  real_ozon_requests: <integer>
  real_performance_requests: <integer>
  operator_browser_actions: <integer>

modifications:
  production: <integer>
  candidate: <integer>
  source_cft: <integer>

classification:
  NONE|ENVIRONMENT_ERROR|HARNESS_ERROR|<exact other>

report_branch:
  <branch>

report_commit:
  <sha>
```
