# Ozon Bridge v0.1.19 — consolidated pre-operator full-gate rerun 6

Date: 2026-08-18
Status: `READY_TO_DISPATCH_ONE_CONSOLIDATED_RERUN6`

# RERUN6 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:
`MaksimUnimax/blood_sand`

This is validation-only. Do not modify production.

## Immutable production candidate

Original full-gate plan commit:
`e47382d0edcaddf674d2704a8aa5f09d8f04e785`

Production candidate checkpoint:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`

Expected exact reconstructed candidate:

- frozen artifact SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final worker SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final content SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory: `17`
- changed production files: exactly `service_worker.js`, `content_script.js`
- protected other 15 files: byte-identical to frozen base

Reject production drift.

## Previous validation history

Read the latest full report completely:

`20c901dda279b048013ce2095cad0943736091ca`

Also treat the previous failed reports as historical environment/harness evidence only:

- `ee33f38a56e860dac7f2605de496b24c230516e9`
- `c0e1afaa3994d602d411f21989ec346f6451b30f`
- `422be20263dc620c7fa134e3159faa4c71eac1c1`
- `99d8ac14383f548048a8a9ffdc92764848d1f238`
- `c24470526dfafb932d5259c5a178a0f010b32648`
- `20c901dda279b048013ce2095cad0943736091ca`

Do not reuse partial execution state. Reconstruct and execute the gate from scratch.

## Authorized validation-only corrections

Preserve the already accepted validation-only worker fixture correction:

`d9d62a44a812b555d23490acc042ac744a2e3c45`

Preserve the DevToolsActivePort transient-lock + atomic-read corrections:

- `5e9bd081424903095df854807f309615f27e4450`
- `5dfe724341d9bd2080cd132eb99599269abc81bc`

For installed-extension MV3 runtime discovery, use the NEW correction as authority:

`d9c42e2cbffca37fc84cd14f294d455e423da542`

Path:
`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_EXTENSION_API_MV3_CONTEXT_CORRECTION_2026-08-18.md`

Read it completely before materializing browser harnesses.

The old synthetic ChatGPT wake and popup-only wake bootstraps are historical evidence and are superseded as the authoritative worker-discovery path.

## Puppeteer Extension API browser architecture

Use the already-qualified environment:

- Node `v24.12.0`
- Puppeteer `25.4.0`
- Chrome for Testing `151.0.7922.47`
- existing Windows QA project and dependencies
- dynamic `DevToolsActivePort`
- `browser.installExtension(candidateDir)`

After install:

1. capture returned `extensionId`;
2. call `await browser.extensions()`;
3. resolve `extension = extensions.get(extensionId)`;
4. require `extension`, `extension.enabled === true`, and `extension.id === extensionId`;
5. create one inert local/synthetic page without external network;
6. query `await extension.workers()`;
7. if empty, call `await extension.triggerAction(page)` exactly once as validation automation;
8. bounded-poll `await extension.workers()` until the candidate extension has an active worker;
9. emit `PUPPETEER_EXTENSION_API_WORKER_DISCOVERY_PASS` only after that succeeds;
10. if the old network-CDP assertion needs a `CDPSession`, only AFTER the Extension API confirms the worker exists, resolve the matching `browser.targets()` service-worker target by exact `chrome-extension://${extensionId}/` URL and create its CDP session;
11. do not use generic `browser.waitForTarget(service_worker)` as the primary wake/discovery mechanism;
12. do not add another arbitrary timeout increase or another synthetic bootstrap.

`extension.triggerAction(page)` is validation automation, not an operator action. It must not mutate production bytes, credentials, Manual/Autorun persisted settings, or call providers.

Hard counters remain:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`

If Extension API cannot enumerate the installed candidate or cannot expose its worker after the one bounded action wake, classify `ENVIRONMENT_ERROR`, preserve diagnostics (`extensionId`, installed extension IDs/names/enabled flags, extension worker URLs, browser target types/URLs with secrets absent), and STOP. Do not modify production.

## Permanent full gate

Read from the immutable candidate checkpoint:

`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

Every applicable block 01-16 remains mandatory.

The successful block 01-14 results from earlier attempts are evidence only; they do not waive this authoritative rerun. Run them again.

Do not weaken any browser behavioral assertion:

- quota/countdown visibility and decreasing seconds;
- absolute due clock;
- duplicate Ozon click protection;
- native Copy independence;
- two-owner isolation;
- restart restore;
- due/sending state;
- ChatGPT/Alice structural bindings;
- occupied composer persistent plate;
- missing composer wait;
- clear -> exactly one insert;
- existing one-Send/Microphone delivery completion;
- Manual OFF cancellation only for the pending pre-insert Manual delivery;
- OFF -> ON readiness;
- persisted quota/cache untouched;
- cancelled report never reappears;
- zero real provider network.

## One consolidated authoritative run

Prepare one temporary top-level runner that includes all exact integrity/reconstruction/harness transformations before functional execution.

Run that top-level functional runner exactly ONCE.

It must, in one sequence:

1. reconstruct exact candidate from frozen artifact + exact patch;
2. verify all hashes/inventory/protected files;
3. syntax-check production JS and parse manifest;
4. run targeted composer-wait harness;
5. run corrected worker actual-path harness;
6. run carry-forward regression harness;
7. run carry-forward browser quota/binding harness using the Puppeteer Extension API correction;
8. run new composer-wait real-browser harness using the same corrected Extension API architecture;
9. execute any remaining mandatory full-gate assertions;
10. assert zero real Seller/Performance network and zero operator actions;
11. if and only if blocks 01-15 all PASS, package exactly the tested 17-file candidate;
12. fresh-extract it;
13. compare all 17 files byte-for-byte with tested candidate;
14. rerun package syntax/manifest/inventory checks;
15. record package SHA-256;
16. emit only on complete success:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

No failed functional block may be rerun inside the authoritative execution. Failure is evidence.

## Reporting

Create only a report on branch:

`validation/ozon-pre-operator-full-gate-composer-wait-rerun6-2026-08-18`

Report path:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN6_2026-08-18.md`

No production edits.

Report exact candidate hashes, all block results 01-16, all required browser markers, network counters, environment diagnostics if relevant, package SHA/fresh-extract result, classification, umbrella marker, branch and report commit.

After publishing the report, STOP.

Return exactly:

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN6_RESULT

gate_input_checkpoint:
  <sha>

environment_correction_commit:
  d9c42e2cbffca37fc84cd14f294d455e423da542

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
  NONE|PRODUCTION_BEHAVIOR_FAILURE|HARNESS_FIXTURE_FAILURE|ENVIRONMENT_ERROR|PRODUCTION_CANDIDATE_RECONSTRUCTION_FAILURE

umbrella_marker:
  OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|ABSENT

report_branch:
  <branch>

report_commit:
  <sha>
```
