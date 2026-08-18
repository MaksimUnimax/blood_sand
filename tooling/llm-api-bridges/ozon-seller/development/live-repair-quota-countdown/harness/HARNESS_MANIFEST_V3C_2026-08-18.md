# Ozon live repair V3C — executable harness manifest

Date: 2026-08-18
Status: `TEST_ONLY_HARNESS_FROZEN_FOR_V3C_EXECUTION`

This manifest freezes test-only harness inputs. It does NOT change, freeze, accept, or promote production.

Production candidate remains exactly:

`88a20984c55da1f813ca1184bd90089823f51883`

Exact repaired production hashes remain:

- `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

The prior V3B report commit `213a9f3597973111cd71409908388d635c5741ef` proved that generic smoke/VM work was insufficient because mandatory actual paths were never executed. These harnesses make those paths executable and deterministic.

## Live GitHub harness authorities

All harness files are under:

`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/harness/`

Use the exact Git blobs below from live GitHub. Do not substitute local drafts.

| harness | Git blob SHA | purpose |
|---|---|---|
| `V3_WORKER_ACTUAL_PATH_HARNESS.mjs` | `0da73bdd1bb1608074781bb0c594c7875a4fe3ce` | executes the actual repaired service-worker runtime listener with mocked Chrome storage/tabs/alarms/network; proves manual/autorun public quota state and privacy, incompatible cache miss to guarded wait/due, mocked 429 one-call/no replay and Retry-After extension-only |
| `V3_BROWSER_COUNTDOWN_HARNESS.mjs` | `841429741d5ff9144a8a40506e657dc4392fe37c` | accepted child_process.spawn -> CFT -> DevToolsActivePort -> Puppeteer -> browser.installExtension route; synthetic intercepted ChatGPT/Alice pages; real content-script countdown, reload restore, busy/duplicate block, two-owner isolation, structural binding and native Copy |
| `V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs` | `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5` | exact Step-4 vs V3 byte/function comparisons for protected files/functions and bounded carry-forward closure |

Before any execution, fetch these exact blobs and run `node --check` on each materialized `.mjs` file. A syntax/transport failure is `HARNESS_ERROR`; do not edit a harness or production file in the validation run.

## Required execution inputs

1. exact frozen Step-4 reconstructed directory, with worker SHA:
   `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
2. exact V3 repaired directory, with worker/content SHA values above;
3. CFT `151.0.7922.47` and Puppeteer `25.4.0` already used by the accepted validation route.

## Expected worker harness terminal marker

`V3_WORKER_ACTUAL_PATH_HARNESS_PASS`

Required intermediate markers include:

- `V3B_ACTUAL_MANUAL_PUBLIC_STATE_PASS`
- `V3B_ACTUAL_AUTORUN_PUBLIC_STATE_PASS`
- `V3B_ACTUAL_PUBLIC_STATE_PRIVACY_PASS`
- `V3B_INCOMPATIBLE_CACHE_MISS_GUARDED_WAIT_PASS`
- `V3B_GUARDED_DUE_ONE_PROVIDER_CALL_PASS`
- `V3B_ONE_429_ONE_PROVIDER_CALL_PASS`
- `V3B_ZERO_IMMEDIATE_RETRY_PASS`
- `V3B_ZERO_ALARM_REPLAY_PASS`
- `V3B_ZERO_STARTUP_REPLAY_PASS`
- `V3B_RETRY_AFTER_EXTENSION_ONLY_PASS`

Provider calls inside this harness are intercepted in-process mocked fetch calls only. No external network is permitted.

## Expected browser harness terminal marker

`V3_BROWSER_COUNTDOWN_HARNESS_PASS`

Required intermediate markers include:

- `V3B_VISIBLE_WAIT_PLATE_PASS`
- `V3B_THREE_DECREASING_SECONDS_PASS`
- `V3B_ABSOLUTE_DUE_CLOCK_PASS`
- `V3B_DUPLICATE_CLICK_BLOCKED_PASS`
- `V3B_NATIVE_COPY_INDEPENDENT_PASS`
- `V3B_RESTART_RESTORE_PASS`
- `V3B_DUE_SENDING_STATE_PASS`
- `V3B_TWO_OWNER_ISOLATION_PASS`
- `V3B_CHATGPT_BINDING_PASS`
- `V3B_ALICE_BINDING_PASS`
- `V3B_NO_CROSS_OWNER_REGRESSION_PASS`
- `OPERATOR_BROWSER_ACTIONS=0`
- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`

The browser harness maps Ozon hosts away at Chrome launch and also observes the extension service-worker Network domain. Any observed Seller/Performance network request fails the harness.

## Expected regression harness terminal marker

`V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS`

It must additionally emit the protected-file/function carry-forward PASS markers.

## No production modification rule

If a harness fails, capture exact command, stdout, stderr, Node/CFT/Puppeteer versions and classify whether the failure is:

- `HARNESS_ERROR`
- `ENVIRONMENT_ERROR`
- `PRODUCTION_BEHAVIOR_FAILURE`

Do not fix anything during that run.

`REAL_OZON_REQUESTS = 0`

`REAL_PERFORMANCE_REQUESTS = 0`
