# Ozon Bridge v0.1.19 — consolidated pre-operator full-gate rerun 3

Date: 2026-08-18
Status: `READY_TO_DISPATCH_ONE_CONSOLIDATED_RERUN3`

# RERUN3 STANDALONE CODEX PROMPT

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

Expected immutable candidate outputs after reconstruction:

- frozen artifact SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final worker SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final content SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory: 17
- changed production files: exactly `service_worker.js`, `content_script.js`
- protected other 15 files: byte-identical to frozen base

Reject any production drift.

## Previous validation evidence

Read completely before preparing this rerun:

1. first failed full-gate report commit:
   `ee33f38a56e860dac7f2605de496b24c230516e9`
2. second full-gate report commit:
   `c0e1afaa3994d602d411f21989ec346f6451b30f`
3. third/latest environment-error report commit:
   `422be20263dc620c7fa134e3159faa4c71eac1c1`

None of those partial executions is an authoritative PASS for this rerun. Reconstruct and rerun from scratch.

## Authorized validation-only corrections

Apply only the following test/environment corrections to temporary harness materialization, never to production:

1. worker fixture correction commit:
   `d9d62a44a812b555d23490acc042ac744a2e3c45`
   - preserve accepted VM-realm storage clone correction;
   - preserve accepted guarded-due fixture margin;
   - preserve persisted worker-owned `next_allowed_at` assertion/wake behavior.

2. first DevToolsActivePort transient-lock correction commit:
   `5e9bd081424903095df854807f309615f27e4450`

3. atomic DevToolsActivePort read correction commit:
   `5dfe724341d9bd2080cd132eb99599269abc81bc`
   path:
   `tooling/llm-api-bridges/ozon-seller/validation/environment/DEVTOOLS_ACTIVE_PORT_ATOMIC_READ_CORRECTION_2026-08-18.md`

The atomic correction supersedes any split `waitForFile()` then second `fs.readFileSync()` sequence. The browser fixture must wait within the existing bounded timeout until ONE read produces both a numeric port and a websocket path beginning `/`.

Transient retryable filesystem codes during that bounded wait are only:
`ENOENT`, `EBUSY`, `EPERM`, `EACCES`.

All other filesystem errors remain terminal.

Do not change Chrome/Node/Puppeteer versions, accepted browser architecture, extension installation mechanism or behavior assertions.

## Full gate authority

Read the permanent gate from the exact production checkpoint:
`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

Every currently applicable block 01 through 16 must be executed in ONE consolidated authoritative runner.

Do not resume at block 15.
Do not reuse previous partial PASS state as execution state.
Previous reports may be read only as diagnostic evidence.

## Required consolidated execution

Create one temporary top-level runner and run it exactly once for the authoritative functional execution.

The runner must, in order:

1. verify exact production checkpoint, frozen artifact, patch bytes and test bytes;
2. reconstruct the candidate from scratch;
3. verify exact final worker/content hashes and protected 15 files;
4. syntax-check all production JS and parse manifest;
5. run current targeted composer-wait/manual-OFF harness;
6. run worker/quota actual-path carry-forward harness with only authorized validation-only corrections;
7. run carry-forward regression harness;
8. run existing CFT browser countdown/binding harness with atomic DevToolsActivePort environment correction;
9. run new real-browser composer-wait harness under the same accepted CFT environment discipline;
10. execute any remaining assertions required for all applicable permanent-gate blocks 01-16;
11. assert zero real Seller requests, zero real Performance requests and zero operator browser actions;
12. only after all functional blocks PASS, package exactly the tested 17-file production tree;
13. fresh-extract package;
14. verify every extracted production file byte-for-byte against tested candidate;
15. rerun package syntax/manifest/inventory checks;
16. record package SHA-256;
17. emit `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` only if every applicable mandatory block and packaging step passes.

If any functional assertion fails, do not rerun or weaken it in this authoritative execution. Preserve stdout/stderr and report.

## Environment and safety invariants

Use the already-qualified Windows QA environment required by the original gate.

Do not:

- edit production;
- use operator Chrome/profile;
- make real Seller or Performance requests;
- install/update dependencies;
- replace `browser.installExtension()` with `--load-extension`;
- weaken browser assertions;
- skip blocks;
- package after a failed functional block;
- claim environment failures as production failures without evidence.

Required counters:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- `production_modifications_by_validator=0`

## Reporting

Publish exactly one new report on a report-only branch:

Branch:
`validation/ozon-pre-operator-full-gate-composer-wait-rerun3-2026-08-18`

Report path:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN3_2026-08-18.md`

The report must include:

- immutable candidate hashes;
- authorized validation-only correction commits;
- exact consolidated command;
- complete block 01-16 matrix;
- relevant stdout/stderr and terminal failure classification if any;
- real-network/operator-action counters;
- package SHA-256 and fresh-extraction result if packaging ran;
- production modifications by validator;
- umbrella marker presence/absence.

On success the report must contain exactly the umbrella marker:
`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

After committing the report, STOP.

## Final response schema

Return only:

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN3_RESULT

gate_input_checkpoint:
  <sha>

environment_correction_commit:
  5dfe724341d9bd2080cd132eb99599269abc81bc

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
