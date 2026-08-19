# Ozon Bridge — Windows GPU sandbox A/B forensic plan

Date: 2026-08-19
Status: `READY_TO_DISPATCH_GPU_SANDBOX_AB_FORENSIC`

# STANDALONE CODEX GPU SANDBOX A/B FORENSIC PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This is environment root-cause forensic ONLY. Do not run the permanent full 01–16 gate. Do not modify production or candidate.

Read completely before execution:

1. gate input checkpoint `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`
2. qualified environment authority `c8a4d185573e2d96a05f8a1c9fa3da7b10a2dc78`
3. canonical CFT inventory correction `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`
4. page-session preflight8 report `b92eb20e0d4330b1a813a73b386ba131a1dc7a4c`
5. GPU sandbox A/B forensic authority `cbe06c62ba28377bb833338358e00c59d769e6ac`

Execute exactly the two-arm experiment defined by `cbe06c62ba28377bb833338358e00c59d769e6ac`.

## Shared immutable environment

Use:

- Node `v24.12.0`
- Puppeteer `25.4.0`
- source CFT `151.0.7922.47`
- canonical source CFT regular-file count `308`
- canonical source inventory SHA-256 `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`

For EACH arm independently:

1. create a fresh validation-owned byte-identical copy of the complete source CFT tree;
2. require source/copy canonical `{path,size,sha256}` identity;
3. run copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` once, `shell:false`, no elevation;
4. require exact setup exit code `78`;
5. require copied regular-file inventory/bytes unchanged after setup;
6. use a fresh temporary browser profile;
7. use Puppeteer launch with `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`;
8. use the exact currently qualified minimal Chrome args and `about:blank` final argument, except for the single Arm-B change specified below;
9. do NOT install the Ozon extension;
10. do NOT call any provider or external URL.

Qualified common Chrome args, in order:

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

## Arm A — baseline

Use exactly the common args above, no additional switches.

After launch, exactly once:

1. record browser PID/version and actual spawned args;
2. record initial `browser.targets()` `{type,url}` inventory;
3. call `browser.newPage()` exactly once;
4. if it returns, navigate only to `data:text/html,<html><body>gpu-sandbox-baseline</body></html>`;
5. evaluate `document.body.textContent` and require exact `gpu-sandbox-baseline` if execution reaches it;
6. perform a bounded 5-second browser liveness check;
7. record complete relevant dumpio tail and main-process exit code or `NONE`;
8. stop Arm A; no retry.

Explicitly normalize every GPU child exit code seen into unsigned hex form. In particular record whether `-1073741790 == 0xC0000022` is observed.

## Arm B — one variable only

Use a new CFT copy/setup/profile.

Use the exact same common args in the exact same order, but insert one and only one additional switch immediately before final `about:blank`:

`--disable-gpu-sandbox`

No other argument difference is allowed.

Run the exact same sequence once:

1. browser PID/version + actual spawned args;
2. target inventory;
3. one `browser.newPage()`;
4. navigate only to `data:text/html,<html><body>gpu-sandbox-experiment</body></html>`;
5. evaluate body text and require exact `gpu-sandbox-experiment`;
6. bounded 5-second browser liveness;
7. dumpio tail + browser exit code/`NONE`;
8. stop Arm B; no retry.

## Required differential verification

Before classification, programmatically compare actual spawned args from Arm A and Arm B after replacing the unique profile path. Require the only semantic difference to be presence of `--disable-gpu-sandbox` in Arm B.

Do not accept PASS if any other launch setting differs.

## Classification

Return `GPU_SANDBOX_INCOMPATIBILITY_CONFIRMED` only if:

- both copied-CFT setup/inventory paths PASS;
- Arm A reproduces GPU child `0xC0000022` and fails page/liveness due browser GPU fatal/exit;
- Arm B completes newPage + data navigation + evaluation + 5-second liveness;
- Arm B does not show the same GPU `0xC0000022` fatal sequence during bounded observation;
- exact argument diff is only `--disable-gpu-sandbox`.

Otherwise return `GPU_SANDBOX_INCOMPATIBILITY_NOT_PROVEN` and publish the exact facts without inventing another cause.

## Forbidden

Do NOT:

- run full 01–16 gate;
- install extension;
- package;
- change candidate/production/source CFT;
- modify ACLs manually;
- add `--disable-gpu`, `--no-sandbox`, `--disable-gpu-appcontainer`, `--disable-gpu-lpac`, SwiftShader/ANGLE flags, or any other switch;
- access real Ozon/Performance;
- perform operator browser actions;
- retry either arm.

## Safety totals

Require:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- production modifications `0`
- candidate modifications `0`
- source CFT modifications `0`

## Report

Create report-only branch:
`validation/ozon-windows-gpu-sandbox-ab-forensic-2026-08-19`

Create exactly one report:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_WINDOWS_GPU_SANDBOX_AB_FORENSIC_2026-08-19.md`

After publishing the report, STOP.

# Required final response schema

```text
OZON_WINDOWS_GPU_SANDBOX_AB_FORENSIC_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

gpu_sandbox_forensic_authority_commit:
  cbe06c62ba28377bb833338358e00c59d769e6ac

environment:
  node: <version>
  puppeteer: <version>
  cft: <version>
  canonical_source_cft_file_count: <integer>
  canonical_source_cft_inventory_sha256: <sha256>

arm_a_baseline:
  source_copy_byte_identical: PASS|FAIL
  setup_exit_code: <integer|NOT_RUN>
  post_setup_byte_identical: PASS|FAIL|NOT_RUN
  launch: PASS|FAIL|NOT_RUN
  new_page: PASS|FAIL|NOT_RUN
  data_navigation: PASS|FAIL|NOT_RUN
  evaluation: PASS|FAIL|NOT_RUN
  liveness_5s: PASS|FAIL|NOT_RUN
  gpu_status_access_denied_seen: true|false
  browser_exit_code: <integer|NONE|NOT_RUN>
  gpu_fatal_seen: true|false

arm_b_disable_gpu_sandbox:
  source_copy_byte_identical: PASS|FAIL
  setup_exit_code: <integer|NOT_RUN>
  post_setup_byte_identical: PASS|FAIL|NOT_RUN
  launch: PASS|FAIL|NOT_RUN
  new_page: PASS|FAIL|NOT_RUN
  data_navigation: PASS|FAIL|NOT_RUN
  evaluation: PASS|FAIL|NOT_RUN
  liveness_5s: PASS|FAIL|NOT_RUN
  gpu_status_access_denied_seen: true|false
  browser_exit_code: <integer|NONE|NOT_RUN>
  gpu_fatal_seen: true|false

argument_diff:
  only_disable_gpu_sandbox: PASS|FAIL

network:
  real_ozon_requests: 0
  real_performance_requests: 0
  operator_browser_actions: 0

modifications:
  production: 0
  candidate: 0
  source_cft: 0

classification:
  GPU_SANDBOX_INCOMPATIBILITY_CONFIRMED|GPU_SANDBOX_INCOMPATIBILITY_NOT_PROVEN|HARNESS_ERROR

report_branch:
  <branch>

report_commit:
  <sha>
```
