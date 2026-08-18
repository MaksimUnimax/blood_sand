# Ozon Bridge v0.1.19 — consolidated pre-operator full-gate rerun 4

Date: 2026-08-18
Status: `READY_TO_DISPATCH_ONE_CONSOLIDATED_RERUN4`

# RERUN4 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This is validation-only. Do not modify production.

## Immutable production candidate

Original full-gate plan commit:
`e47382d0edcaddf674d2704a8aa5f09d8f04e785`

Original full-gate plan path:
`tooling/llm-api-bridges/ozon-seller/validation/plans/OZON_PRE_OPERATOR_FULL_CODEX_GATE_COMPOSER_WAIT_2026-08-18.md`

Production candidate checkpoint remains exactly:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Expected immutable reconstruction outputs:

- frozen artifact SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final worker SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final content SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory: 17
- changed production files: exactly `service_worker.js`, `content_script.js`
- protected other 15 production files: byte-identical to frozen base

Reject any production drift.

## Previous reports to read completely

- `ee33f38a56e860dac7f2605de496b24c230516e9`
- `c0e1afaa3994d602d411f21989ec346f6451b30f`
- `422be20263dc620c7fa134e3159faa4c71eac1c1`
- `99d8ac14383f548048a8a9ffdc92764848d1f238`

None is an authoritative PASS for this rerun. Reconstruct and execute from scratch.

## Authorized validation-only corrections

Apply only to temporary harness materialization, never production:

1. worker fixture correction:
   `d9d62a44a812b555d23490acc042ac744a2e3c45`
2. transient DevToolsActivePort file-lock correction:
   `5e9bd081424903095df854807f309615f27e4450`
3. atomic DevToolsActivePort read correction:
   `5dfe724341d9bd2080cd132eb99599269abc81bc`
4. MV3 service-worker wake bootstrap correction:
   `f363ea1cb31c2ceeb0bc1776a207acd8e40c7ab5`
   file:
   `tooling/llm-api-bridges/ozon-seller/validation/environment/MV3_SERVICE_WORKER_WAKE_BOOTSTRAP_CORRECTION_2026-08-18.md`

Read all four correction authorities completely before preparing the runner.

For correction 4, after `browser.installExtension(candidateDir)`:

- use an already-live extension service-worker target if available;
- otherwise create one temporary intercepted synthetic ChatGPT conversation page;
- fulfill only its exact top-level navigation locally with inert HTML and abort all other bootstrap requests;
- allow the production content script's normal runtime sync to wake the MV3 worker;
- acquire the extension service-worker target within the bounded environment timeout;
- close the temporary bootstrap page immediately;
- emit `MV3_SERVICE_WORKER_WAKE_BOOTSTRAP_PASS`;
- continue all original browser assertions unchanged.

No popup click or operator action is allowed.

## Full gate authority

Read completely from exact production checkpoint:

`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

Every currently applicable mandatory block 01-16 must be executed.

## One consolidated authoritative run

Create one temporary top-level runner. Preparation/integrity checks are allowed before execution, but the authoritative functional execution must invoke that top-level runner exactly once.

The runner must, from scratch:

1. verify exact immutable inputs;
2. fresh-extract frozen artifact;
3. reconstruct exact candidate and verify all final hashes/inventory;
4. verify all production JS syntax and manifest;
5. run targeted composer-wait/Manual-OFF harness;
6. run corrected worker actual-path carry-forward harness;
7. run regression carry-forward harness;
8. run corrected existing browser countdown/binding harness with the MV3 wake bootstrap if needed;
9. run the new composer-wait real-browser harness using the same accepted environment-bootstrap corrections if that harness also requires acquisition of a lazily stopped service worker;
10. run every additional assertion necessary for permanent gate blocks 01-16;
11. assert zero real Ozon requests, zero real Performance requests and zero operator browser actions;
12. only after every functional block passes, package exactly the tested candidate production tree;
13. fresh-extract package and compare all 17 files byte-for-byte with the tested candidate;
14. rerun package syntax/manifest/inventory checks;
15. print package SHA-256;
16. emit `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` only if all mandatory blocks and packaging pass.

Do not resume from block 15. Do not reuse earlier partial PASS state as execution state.

## Browser environment

Preserve the accepted environment and architecture from the original plan:

- Node `v24.12.0`
- Puppeteer `25.4.0`
- Chrome for Testing `151.0.7922.47`
- accepted QA project root
- dynamic `DevToolsActivePort`
- `browser.installExtension()`
- `--enable-unsafe-extension-debugging` where already accepted by the prior harness correction
- no operator Chrome profile

Do not install or update dependencies.

## Safety

Hard totals:

- real Seller credentials: 0
- real Performance credentials: 0
- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- production modifications by validator: 0

All provider behavior must be mocked/intercepted.

## Failure behavior

If any functional block fails:

- preserve complete stdout/stderr;
- classify the failure accurately as production behavior, harness fixture, harness error, or environment error;
- do not rerun a failed functional block;
- do not edit production;
- do not weaken tests;
- do not package;
- publish the authorized report and STOP.

## Report

Create report-only branch:

`validation/ozon-pre-operator-full-gate-composer-wait-rerun4-2026-08-18`

Create exactly one report file:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN4_2026-08-18.md`

The report must include:

- immutable input SHAs;
- final worker/content hashes;
- production inventory and protected-15 result;
- all blocks 01-16 PASS/FAIL;
- all significant worker/regression/browser/new composer-wait markers;
- `MV3_SERVICE_WORKER_WAKE_BOOTSTRAP_PASS` if bootstrap was used or validated;
- real network/operator-action totals;
- production modifications count;
- package SHA and fresh-extract identity if packaging ran;
- failure classification if not PASS;
- umbrella marker status.

## Required final response

Return exactly:

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN4_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b15aaa39d0d70388f1d2029

environment_correction_commit:
  f363ea1cb31c2ceeb0bc1776a207acd8e40c7ab5

candidate:
  frozen_artifact_sha256: <value>
  repair_patch_sha256: <value>
  final_worker_sha256: <value>
  final_content_sha256: <value>
  protected_15_byte_identical: PASS|FAIL

full_gate:
  block_01_integrity: PASS|FAIL
  block_02_command_contract: PASS|FAIL
  block_03_provider_security: PASS|FAIL
  block_04_capability_entitlement: PASS|FAIL
  block_05_planner_projection: PASS|FAIL
  block_06_global_quota: PASS|FAIL
  block_07_response_verifier_errors: PASS|FAIL
  block_08_cache_prefetch: PASS|FAIL
  block_09_common_batch: PASS|FAIL
  block_10_normal_delivery: PASS|FAIL
  block_11_occupied_missing_composer: PASS|FAIL
  block_12_manual_off_on: PASS|FAIL
  block_13_ui_binding_owner_isolation: PASS|FAIL
  block_14_performance_regression: PASS|FAIL
  block_15_browser_runtime: PASS|FAIL
  block_16_packaging: PASS|FAIL
  terminal: PASS|FAIL

network:
  real_ozon_requests: <integer>
  real_performance_requests: <integer>
  operator_browser_actions: <integer>

package:
  sha256: <sha256|NONE>
  fresh_extract_byte_identical: PASS|FAIL|NOT_RUN

production_modifications_by_validator:
  <integer>

failure_classification:
  <NONE|classification>

umbrella_marker:
  PRESENT|ABSENT

report_branch:
  validation/ozon-pre-operator-full-gate-composer-wait-rerun4-2026-08-18

report_commit:
  <sha>
```

Then STOP.