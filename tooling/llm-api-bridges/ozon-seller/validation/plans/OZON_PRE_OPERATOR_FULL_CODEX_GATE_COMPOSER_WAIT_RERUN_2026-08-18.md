# Ozon Bridge v0.1.19 — consolidated pre-operator full-gate rerun after worker-fixture failure

Date: 2026-08-18
Status: `READY_TO_DISPATCH_ONE_CONSOLIDATED_RERUN`

# RERUN STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This is a validation-only rerun. Do not modify production.

## Exact immutable inputs

Original full-gate plan commit:
`e47382d0edcaddf674d2704a8aa5f09d8f04e785`

Original full-gate plan path:
`tooling/llm-api-bridges/ozon-seller/validation/plans/OZON_PRE_OPERATOR_FULL_CODEX_GATE_COMPOSER_WAIT_2026-08-18.md`

Read that file completely from exactly that commit and preserve every production, reconstruction, safety, coverage, browser, packaging, reporting and one-consolidated-run requirement unless explicitly superseded below.

Production candidate checkpoint remains exactly:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Do not move the production candidate to a later branch HEAD.

First failed full-gate report commit:
`ee33f38a56e860dac7f2605de496b24c230516e9`

Report path:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_2026-08-18.md`

Read that report completely before preparing the rerun. Its terminal classification is `HARNESS_FIXTURE_FAILURE`; it is not a production PASS and none of its partial state may be reused as authoritative execution state.

Validation-only worker fixture correction commit:
`d9d62a44a812b555d23490acc042ac744a2e3c45`

Correction path:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/WORKER_DUE_FIXTURE_CORRECTION_2026-08-18.md`

Read that correction completely and apply exactly that test-only correction in addition to the already authorized temporary carry-forward harness transformations from the original full-gate plan.

No other harness weakening, timeout broadening, source rewrite, assertion deletion, test skip, production edit or environment substitution is authorized.

## Candidate must reconstruct identically

The rerun must independently reconstruct the production candidate again from the immutable frozen artifact plus exact repair patch.

Required values remain:

- frozen artifact SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final worker SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final content SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production files: `17`
- changed production files exactly: `service_worker.js`, `content_script.js`
- protected other 15 production files: byte-identical

If any value differs, classify production candidate reconstruction failure and STOP. Do not repair production.

## Exact worker fixture correction required

For the pinned carry-forward worker source blob:

`0da73bdd1bb1608074781bb0c594c7875a4fe3ce`

retain all previously authorized test-only transformations from the original plan, and additionally make the guarded-due scenario use the durable worker-owned deadline after quota wait has actually been persisted.

After obtaining `waiting`, require:

```js
const persistedDue = Number(waiting.batch.quota_wait.next_allowed_at || 0);
assert(persistedDue > 0, 'durable guarded due missing');
assert(persistedDue >= due, 'guarded due was shortened');
```

Then wait beyond that exact persisted deadline:

```js
await new Promise(r=>setTimeout(r,Math.max(0,persistedDue-Date.now()+250)));
for(const fn of alarmListeners) await fn({name:'ozon-provider-quota-wake-v1',scheduledTime:Date.now()});
await waitFor(()=>providerCalls.length===1,10000);
assert(providerCalls[0].at>=persistedDue-5,'provider dispatched before persisted guarded due');
```

Keep the mandatory duplicate-call assertion immediately afterward:

```js
await new Promise(r=>setTimeout(r,250));
assert(providerCalls.length===1,'guarded resume created duplicate provider call');
```

This is the only newly authorized fixture correction.

## One authoritative rerun from scratch

Prepare temporary harness bytes and integrity checks as allowed by the original full-gate plan.

Then execute the top-level consolidated full-gate runner exactly once for the new authoritative rerun.

Do not resume from block 6. Do not reuse a temp candidate, storage state, browser profile, test result or package from the failed run. Reconstruct and execute all applicable permanent gate blocks 1 through 16 from scratch in the one consolidated runner.

The runner must retain all requirements from the original plan, including:

- exact candidate reconstruction and hashes;
- all targeted composer-wait markers;
- full worker/quota carry-forward behavior;
- regression carry-forward behavior;
- existing browser countdown/binding behavior;
- real-browser composer-wait harness;
- complete living-gate coverage matrix;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `OPERATOR_BROWSER_ACTIONS=0`;
- production modifications by validator = 0;
- packaging only after all functional blocks PASS;
- fresh-extract byte identity across all 17 production files;
- fresh package syntax/manifest/inventory checks.

A failure in any block remains a terminal full-gate failure. Do not edit production or rerun an internal functional block after failure.

## Reporting

Publish a new report only; do not overwrite the first failed report.

Required report branch:
`validation/ozon-pre-operator-full-gate-composer-wait-rerun-2026-08-18`

Required report path:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN_2026-08-18.md`

The report must include:

- exact immutable input commits;
- reconstructed artifact/patch/final worker/final content hashes;
- proof that only the authorized validation-only fixture correction was added;
- authoritative consolidated command and exit code;
- complete stdout/stderr for any failing internal block;
- all permanent gate blocks 1-16 as PASS/FAIL;
- real Seller/Performance request counts;
- operator browser action count;
- production modifications by validator;
- package SHA-256 if and only if packaging ran;
- fresh-extract byte-identity result if and only if packaging ran;
- failure classification when applicable.

Only if every mandatory applicable block passes may the report emit:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

After committing the report, STOP.

## Final response schema

Return exactly:

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

fixture_correction_commit:
  d9d62a44a812b555d23490acc042ac744a2e3c45

candidate:
  frozen_artifact_sha256: <value>
  repair_patch_sha256: <value>
  final_worker_sha256: <value>
  final_content_sha256: <value>
  production_files: <value>
  changed_files_exactly_2: PASS|FAIL
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
  OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|ABSENT

report_branch:
  validation/ozon-pre-operator-full-gate-composer-wait-rerun-2026-08-18

report_commit:
  <full SHA>
```
