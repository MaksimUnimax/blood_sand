# Ozon Bridge v0.1.19 — consolidated pre-operator full-gate rerun 5

Date: 2026-08-18
Status: `READY_TO_DISPATCH_ONE_CONSOLIDATED_RERUN5`

# RERUN5 STANDALONE CODEX PROMPT

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

Expected reconstructed candidate:
- frozen artifact SHA-256 `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256 `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final worker SHA-256 `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final content SHA-256 `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory `17`
- changed production files exactly `service_worker.js`, `content_script.js`
- protected other 15 files byte-identical to frozen base

Reject any production drift.

## Previous reports

Read completely before execution:
- `ee33f38a56e860dac7f2605de496b24c230516e9`
- `c0e1afaa3994d602d411f21989ec346f6451b30f`
- `422be20263dc620c7fa134e3159faa4c71eac1c1`
- `99d8ac14383f548048a8a9ffdc92764848d1f238`
- `c24470526dfafb932d5259c5a178a0f010b32648`

None is an authoritative PASS. Do not resume from their partial state. Reconstruct and run from scratch.

## Authorized validation-only corrections

Preserve the previously accepted validation-only corrections:

1. worker fixture correction commit:
   `d9d62a44a812b555d23490acc042ac744a2e3c45`
   - VM-realm storage clone;
   - guarded-due fixture margin;
   - persisted worker-owned `next_allowed_at` wake/assertion.

2. DevToolsActivePort transient-lock correction:
   `5e9bd081424903095df854807f309615f27e4450`

3. atomic DevToolsActivePort read correction:
   `5dfe724341d9bd2080cd132eb99599269abc81bc`

4. NEW popup bootstrap correction:
   `100811a5607edc57902f9458ef08ccda5e760715`
   path:
   `tooling/llm-api-bridges/ozon-seller/validation/environment/MV3_POPUP_BOOTSTRAP_CORRECTION_2026-08-18.md`

Read the popup bootstrap correction completely and follow it exactly.

The earlier synthetic ChatGPT MV3 wake correction `f363ea1cb31c2ceeb0bc1776a207acd8e40c7ab5` is superseded for worker bootstrap in this rerun. Do NOT use a synthetic web-page wake retry before the service-worker target. If the worker target does not already exist after `browser.installExtension()`, use only the extension-origin `popup.html` bootstrap authorized by `100811a5607edc57902f9458ef08ccda5e760715`.

Do not change Node, Puppeteer, CFT, `browser.installExtension()`, production code, assertions, provider mocks, security boundaries, or packaging rules.

## Permanent full-gate authority

Read the permanent gate from exact production checkpoint `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`:

`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

Every applicable block 01 through 16 must execute in ONE consolidated authoritative run.

## Browser environment bootstrap requirements

After `browser.installExtension(candidateDir)`:

- if the matching service-worker target already exists, continue normally;
- otherwise open exactly `chrome-extension://<installed-extension-id>/popup.html` in one temporary page;
- perform zero clicks and zero typing;
- wait for normal popup initialization to wake the matching MV3 worker;
- require target type `service_worker` and URL prefix `chrome-extension://<installed-extension-id>/`;
- emit `MV3_SERVICE_WORKER_POPUP_BOOTSTRAP_PASS` only after target acquisition;
- close only the temporary popup bootstrap page;
- then execute the original browser carry-forward assertions unchanged;
- then execute the composer-wait browser harness unchanged.

Opening the popup without interaction is validation bootstrap, not an operator browser action.

If the matching worker still does not appear inside the bounded timeout, classify `ENVIRONMENT_ERROR`, preserve stdout/stderr/target diagnostics, stop, and do not alter production.

## One consolidated authoritative run

Prepare test-only wrappers/materialization first. Syntax/integrity preparation is allowed before the authoritative functional execution.

Then run exactly ONE top-level consolidated functional command that, in sequence:

1. reconstructs the exact candidate from the immutable frozen artifact + exact repair patch;
2. verifies all 17 files and the expected final worker/content hashes;
3. runs blocks 01-14 including targeted, worker and carry-forward regression assertions;
4. runs the accepted CFT browser carry-forward harness using the popup bootstrap only if worker wake is required;
5. runs the new composer-wait real-browser harness;
6. executes any remaining mandatory current gate assertions;
7. asserts real Ozon requests `0`, real Performance requests `0`, operator browser actions `0`, production modifications `0`;
8. only after all functional blocks 01-15 PASS, packages exactly the tested 17-file production tree;
9. fresh-extracts the package;
10. verifies all extracted production files byte-for-byte against the tested candidate and reruns package syntax/manifest/inventory checks;
11. records package SHA-256;
12. emits `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` only if every applicable mandatory assertion and packaging check PASS.

Do not continue from block 15. Do not reuse a previous partial PASS as the authoritative run.

Do not rerun a failed functional block before reporting. A failure is evidence.

## Safety totals

Required:
- real Seller credentials `0`
- real Performance credentials `0`
- real Ozon requests `0`
- real Performance requests `0`
- operator browser actions `0`
- production modifications by validator `0`

## Report

Create a report-only validation branch:
`validation/ozon-pre-operator-full-gate-composer-wait-rerun5-2026-08-18`

Publish exactly one new report:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN5_2026-08-18.md`

Do not modify production or development authority files while validating.

The report must include:
- immutable candidate hashes;
- all block 01-16 PASS/FAIL states;
- full terminal failure classification if any;
- browser bootstrap marker/status;
- network/operator-action counters;
- package SHA-256 if packaging ran;
- fresh-extraction byte identity result;
- production modifications by validator;
- umbrella marker presence/absence.

After publishing the report, STOP.

Return exactly:

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN5_RESULT

gate_input_checkpoint:
  <sha>

environment_correction_commit:
  <sha>

candidate:
  frozen_artifact_sha256: <sha256>
  repair_patch_sha256: <sha256>
  final_worker_sha256: <sha256>
  final_content_sha256: <sha256>
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
  real_ozon_requests: <n>
  real_performance_requests: <n>
  operator_browser_actions: <n>

package:
  sha256: <sha256|NONE>
  fresh_extract_byte_identical: PASS|FAIL|NOT_RUN

production_modifications_by_validator:
  <n>

failure_classification:
  <NONE|PRODUCTION_BEHAVIOR_FAILURE|HARNESS_FIXTURE_FAILURE|ENVIRONMENT_ERROR|...>

umbrella_marker:
  PRESENT|ABSENT

report_branch:
  <branch>

report_commit:
  <sha>
```