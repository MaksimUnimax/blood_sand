# Ozon Bridge v0.1.19 — consolidated pre-operator full-gate rerun 2

Date: 2026-08-18
Status: `READY_TO_DISPATCH_ONE_CONSOLIDATED_RERUN_2`

# RERUN2 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This is validation-only. Do not modify production.

## Immutable production authority

Original full-gate plan commit:
`e47382d0edcaddf674d2704a8aa5f09d8f04e785`

Original plan path:
`tooling/llm-api-bridges/ozon-seller/validation/plans/OZON_PRE_OPERATOR_FULL_CODEX_GATE_COMPOSER_WAIT_2026-08-18.md`

Read that file completely from exactly that commit and preserve every candidate reconstruction, safety, coverage, browser, packaging and reporting requirement unless explicitly superseded below.

Production gate input checkpoint remains exactly:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Expected immutable candidate after reconstruction:
- frozen artifact SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final worker SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final content SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory: `17`
- changed production files exactly: `service_worker.js`, `content_script.js`
- other 15 production files byte-identical to frozen base.

Reject any production drift.

## Previous authoritative evidence to read, not reuse as final PASS

First full-gate failure report commit:
`ee33f38a56e860dac7f2605de496b24c230516e9`

First validation-only worker fixture correction:
`d9d62a44a812b555d23490acc042ac744a2e3c45`

Second full-gate report commit:
`c0e1afaa3994d602d411f21989ec346f6451b30f`

The second report established blocks 1-14 PASS and failed before browser assertions because Windows returned `EBUSY` while reading temporary `DevToolsActivePort`. Its classification is `ENVIRONMENT_ERROR`, not production failure.

Read the full reports before execution. Do not resume from their internal state and do not treat their partial PASS as the new final umbrella result.

## Authorized validation-only corrections

### A. Worker fixture correction

Preserve exactly the validation-only correction authorized by commit:
`d9d62a44a812b555d23490acc042ac744a2e3c45`

No production changes.

### B. DevToolsActivePort transient-lock correction

Read completely from exact commit:
`5e9bd081424903095df854807f309615f27e4450`

Path:
`tooling/llm-api-bridges/ozon-seller/validation/plans/BROWSER_DEVTOOLS_ACTIVE_PORT_ENVIRONMENT_CORRECTION_2026-08-18.md`

Apply exactly that correction only to temporary validation materialization of the pinned accepted browser carry-forward source blob:
`841429741d5ff9144a8a40506e657dc4392fe37c`

In particular, transient `EBUSY`, `EPERM`, `EACCES`, and `ENOENT` while reading `DevToolsActivePort` may be retried only inside the existing bounded wait. Any other error remains terminal. Do not weaken assertions or change browser architecture.

## One consolidated authoritative run

Prepare as needed, including source/blob integrity checks and syntax checks, then execute the top-level full-gate runner exactly once for authoritative functional execution.

That one execution must from scratch:

1. verify exact authority inputs;
2. fresh-extract exact frozen artifact;
3. verify frozen inventory/hashes;
4. apply exact repair patch once with clean `git apply --check` and no fuzz/manual repair;
5. verify exact final worker/content hashes and protected 15 files;
6. syntax-check all production JS and parse manifest;
7. run targeted composer-wait/Manual-OFF harness;
8. run accepted worker/quota actual-path harness with only authorized validation corrections;
9. run accepted regression carry-forward harness;
10. run accepted browser countdown/binding harness with only the authorized DevToolsActivePort environment correction and previously accepted launch correction;
11. run the new real-browser composer-wait harness;
12. execute any other required assertions needed to cover every applicable bullet in permanent blocks 1-16;
13. assert zero real Ozon requests, zero real Performance requests, zero operator browser actions, zero production edits by validator;
14. after all functional blocks PASS, package exactly the tested 17-file candidate;
15. fresh-extract package and byte-compare all 17 files against tested candidate;
16. rerun package syntax/manifest/inventory checks;
17. record package SHA-256;
18. emit `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` only if every applicable block 1-16 passes.

Do not split the authoritative functional execution. Do not continue from block 15. Do not rerun a failed functional block before reporting.

## Browser environment

Use the same accepted Windows QA environment from the original full-gate plan:
- Node `v24.12.0`
- Puppeteer `25.4.0`
- Chrome for Testing `151.0.7922.47`
- `browser.installExtension()` route
- temporary isolated browser profile
- no operator Chrome profile
- no dependency installation/update.

The DevToolsActivePort correction handles a transient Windows file-lock only. It does not authorize a different browser route.

## Safety hard totals

Required:
- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- `production_modifications_by_validator=0`

No real credentials.
No production edits.
No hidden retry/pagination/fan-out/report polling.

## Report-only output

Create report branch:
`validation/ozon-pre-operator-full-gate-composer-wait-rerun2-2026-08-18`

Create exactly one new report file:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN2_2026-08-18.md`

The report must include:
- exact authority commits;
- reconstructed hashes/inventory;
- all block 01-16 PASS/FAIL states;
- stdout/stderr marker evidence for internal harnesses;
- browser environment details;
- network/operator/production-edit hard totals;
- package SHA-256 and fresh-extract identity if packaging runs;
- terminal failure classification if any;
- umbrella marker status.

If any mandatory block fails, umbrella marker must be absent and operator handoff is forbidden.

After committing the report, STOP.

# FINAL RESPONSE SCHEMA

Return only:

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN2_RESULT

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
  real_ozon_requests: <integer>
  real_performance_requests: <integer>
  operator_browser_actions: <integer>

package:
  sha256: <sha256|NONE>
  fresh_extract_byte_identical: PASS|FAIL|NOT_RUN

production_modifications_by_validator:
  <integer>

failure_classification:
  NONE|PRODUCTION_BEHAVIOR_FAILURE|HARNESS_FIXTURE_FAILURE|ENVIRONMENT_ERROR|PRODUCTION_CANDIDATE_RECONSTRUCTION_FAILURE

umbrella_marker:
  PRESENT|ABSENT

report_branch:
  <branch>

report_commit:
  <sha>
```
