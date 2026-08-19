# Ozon Bridge — page-session direct worker preflight8

Date: 2026-08-19
Status: `READY_TO_DISPATCH_WORKER_PREFLIGHT8`

# STANDALONE CODEX WORKER PREFLIGHT8 PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This is worker-activation environment preflight ONLY. Do not run the full 01-16 gate. Do not modify production or candidate.

## Read exact authorities first

Read completely:

1. Gate input checkpoint:
   `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`
2. Qualified environment authority:
   `c8a4d185573e2d96a05f8a1c9fa3da7b10a2dc78`
3. Qualified environment PASS evidence:
   `6eaa50d9cfaf9d9bc5eb54f8e0ab7a1dde080a71`
4. Canonical inventory correction:
   `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`
5. Absolute-path correction:
   `36bbb81062d12348e87ce6297af2df8566bf6a46`
6. RERUN10 report:
   `1162902368486cc5c8618748b5b057400d828427`
7. Failed direct-CDP preflight7 report:
   `ce79be984d80b7784cc57dcd45b57301bd1e3329`
8. Page-session ServiceWorker correction:
   `c4dc05f099620a354732c629a23ccfbc75f1208a`

## Immutable candidate

Require exactly:

- service_worker.js SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- content_script.js SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Do not change candidate bytes.

## Qualified environment

Use the exact already-qualified environment materialization:

- Node `v24.12.0`
- Puppeteer `25.4.0`
- CFT `151.0.7922.47`
- canonical source CFT: 308 regular files
- canonical inventory SHA-256: `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`
- fresh validation-owned full CFT copy
- source/copy canonical per-file identity before setup
- copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` exactly once, `shell:false`, no elevation
- require exit code `78`
- require copied regular-file bytes/inventory unchanged after setup
- source CFT unchanged

Launch copied Chrome with Puppeteer exactly as qualified:

- `ignoreDefaultArgs:true`
- `headless:false`
- `enableExtensions:true`
- `waitForInitialPage:false`
- `dumpio:true`
- fresh temporary `userDataDir`
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

No other Chrome flags. No dependency update/install.

## Exact activation preflight

Execute exactly one activation attempt:

1. Runtime-install exact candidate using `browser.installExtension(candidateDir)`.
2. Require `browser.extensions()` to enumerate the same returned candidate id, enabled, version `0.1.19`.
3. Query `await extension.workers()` and report exact initial count/URLs. Initial zero is allowed.
4. If initial worker count is nonzero, select only the candidate worker and continue to runtime/liveness verification without any activation call.
5. If initial worker count is zero:
   - create exactly one inert `about:blank` page;
   - create CDP session from the PAGE target only: `await page.target().createCDPSession()`;
   - emit marker immediately before `ServiceWorker.enable`;
   - call `ServiceWorker.enable` exactly once and require success;
   - candidate scope is exactly `chrome-extension://${extensionId}/`;
   - collect `ServiceWorker.workerRegistrationUpdated` and `ServiceWorker.workerVersionUpdated` events for diagnostics only;
   - emit marker immediately before activation;
   - call `ServiceWorker.startWorker` exactly once with `{scopeURL: candidateScope}`;
   - emit marker immediately after successful command return;
   - bounded-poll only `await extension.workers()` for up to 10 seconds, without changing timeout after failure;
   - require candidate worker URL prefix `chrome-extension://${extensionId}/`.
6. Through the returned Puppeteer worker, perform one harmless Runtime evaluation equivalent to `1+1` and require value `2`.
7. Wait a fixed 3 seconds and require the main browser process still alive and `browser.version()` still callable.
8. Then cleanly close browser and remove temporary copy/profile.

## Required stage markers

Emit at minimum:

- `ENV8_CANDIDATE_HASHES_PASS`
- `ENV8_SOURCE_CFT_INVENTORY_PASS`
- `ENV8_COPY_PRE_SETUP_BYTE_IDENTICAL_PASS`
- `ENV8_SETUP_EXIT_CODE=78`
- `ENV8_COPY_POST_SETUP_BYTE_IDENTICAL_PASS`
- `ENV8_01_BEFORE_LAUNCH`
- `ENV8_02_AFTER_LAUNCH`
- `ENV8_03_SPAWN_ARGS_EXACT_PASS`
- `ENV8_04_AFTER_INSTALL_EXTENSION id=<id>`
- `ENV8_05_EXTENSION_ENUMERATION_PASS id=<id>`
- `ENV8_06_INITIAL_WORKERS count=<n> urls=<json>`
- if activation needed: `ENV8_07_BEFORE_SERVICE_WORKER_ENABLE`
- if activation needed: `ENV8_08_SERVICE_WORKER_ENABLE_PASS`
- if activation needed: `ENV8_09_BEFORE_START_WORKER scope=<scope>`
- if activation needed: `ENV8_10_AFTER_START_WORKER`
- `ENV8_11_CANDIDATE_WORKER_ACTIVE url=<url>`
- `ENV8_12_WORKER_RUNTIME_PASS`
- `ENV8_13_POST_ACTIVATION_BROWSER_LIVENESS_PASS`
- terminal `ENV8_PREFLIGHT_PASS`

On failure report the deepest completed marker, exact operation/error, whether `startWorker` was actually called, main browser exit code if any, and Chrome dumpio tail.

## Forbidden

Do NOT:

- run full gate 01-16;
- use `browser.target().createCDPSession()` for ServiceWorker commands;
- call `extension.triggerAction()`;
- open/click extension popup/action UI;
- use synthetic ChatGPT/Alice wake;
- change production/candidate;
- modify source CFT;
- alter ACLs manually;
- add/change Chrome flags;
- retry a failed stage;
- package anything.

## Hard safety counters

Require:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- production modifications `0`
- candidate modifications `0`
- source CFT modifications `0`

## Report

Create report-only branch:
`validation/ozon-puppeteer-page-session-worker-preflight8-2026-08-19`

Create exactly one report under:
`tooling/llm-api-bridges/ozon-seller/validation/reports/`

Do not commit temporary runner/candidate/browser files.

After report publication, STOP.

# Required final response schema

```text
OZON_PUPPETEER_PAGE_SESSION_WORKER_PREFLIGHT8_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

page_session_worker_correction_commit:
  c4dc05f099620a354732c629a23ccfbc75f1208a

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
  service_worker_enable: PASS|FAIL|NOT_RUN
  registration_event_candidate_seen: PASS|FAIL|NOT_RUN
  candidate_scope: <scope|NOT_RUN>
  start_worker_called: true|false
  start_worker: PASS|FAIL|NOT_RUN
  candidate_worker_active: PASS|FAIL|NOT_RUN
  worker_url: <url|NOT_RUN>
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
  NONE|ENVIRONMENT_ERROR|HARNESS_ERROR

report_branch:
  <branch>

report_commit:
  <sha>
```