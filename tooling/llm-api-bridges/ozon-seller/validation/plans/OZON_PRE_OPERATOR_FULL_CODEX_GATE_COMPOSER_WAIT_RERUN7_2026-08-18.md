# Ozon Bridge v0.1.19 — consolidated pre-operator full-gate rerun 7

Date: 2026-08-18
Status: `READY_TO_DISPATCH_ONE_CONSOLIDATED_RERUN7`

# RERUN7 STANDALONE CODEX PROMPT

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

Expected immutable reconstructed outputs:

- frozen artifact SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final worker SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final content SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory: 17
- changed production files: exactly `service_worker.js`, `content_script.js`
- protected other 15 files: byte-identical to frozen base

Reject any production drift.

## Previous validation evidence

Read the latest failed report completely before preparing this rerun:

`10af2e6938e60430c1feab30e1ecb4dd9ce6f687`

Previous failures remain evidence only. None is an authoritative PASS for this rerun. Reconstruct and execute from scratch.

## Authorized validation-only corrections

1. Worker fixture correction:
`d9d62a44a812b555d23490acc042ac744a2e3c45`

Preserve only its already accepted test-fixture semantics:
- VM-realm storage cloning;
- guarded-due test margin;
- worker-owned persisted `next_allowed_at` wake/assertion.

2. Puppeteer Extension API worker-discovery correction:
`d9c42e2cbffca37fc84cd14f294d455e423da542`

Use `browser.extensions()` / candidate `Extension` object / `extension.workers()` after runtime installation. One bounded `extension.triggerAction(page)` validation wake is allowed only if the candidate worker is initially inactive.

3. Native Puppeteer extension launch correction:
`74add69e65707bc0757ac36205be16ab85d6d56b`

Read completely:
`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_NATIVE_EXTENSION_LAUNCH_CORRECTION_2026-08-18.md`

This correction supersedes the manual Chrome `spawn()` + DevToolsActivePort + `puppeteer.connect()` architecture for the authoritative browser blocks.

Launch the exact qualified CFT through the existing Puppeteer 25.4.0 project with:

- exact CFT executable `151.0.7922.47`;
- `headless:false`;
- `enableExtensions:true`;
- fresh temporary `userDataDir`;
- existing background-network blocking arguments from the correction;
- no operator Chrome profile;
- no dependency installation/update.

Then runtime-install the exact reconstructed candidate with `browser.installExtension(candidateDir)`.

Immediately after install, before waiting on background workers, print deterministic diagnostics:

- returned extension id;
- `browser.extensions()` candidate id/name/version/enabled/path;
- initial `extension.workers()` count and URLs if available.

If candidate enumeration fails, classify `ENVIRONMENT_ERROR` with diagnostics and stop; do not modify production.

If initial worker list is empty, create one inert local page with zero external requests, call `extension.triggerAction(page)` once, then bounded-poll `extension.workers()`.

The failed historical synthetic ChatGPT wake and popup-only wake are superseded and must not be used as primary worker discovery.

The historical DevToolsActivePort corrections are not part of this launch path.

## Full gate authority

Read completely from exact production checkpoint:

`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`

Every currently applicable block 01 through 16 remains mandatory.

Do not treat previous PASS blocks as carry-over acceptance. Their exact accepted harness logic may be reused, but the authoritative rerun must execute all applicable blocks again against the newly reconstructed exact candidate.

## One authoritative consolidated execution

Prepare one temporary top-level runner that:

1. verifies exact Git checkpoint/input artifact/patch/test bytes;
2. reconstructs exact candidate fresh;
3. verifies final worker/content hashes and 15 protected files;
4. syntax-checks production JS and parses manifest;
5. executes targeted composer-wait/Manual-OFF harness;
6. executes worker/quota actual-path carry-forward harness with authorized worker-fixture corrections;
7. executes security/planner/cache/delivery carry-forward regression assertions;
8. launches the browser only via the authorized native Puppeteer extension launch architecture;
9. runtime-installs the candidate and emits the required extension diagnostics;
10. executes existing browser quota/countdown/binding assertions;
11. executes the real-browser composer-wait/Manual-OFF delivery assertions;
12. executes any remaining behavior assertions required by permanent blocks 01-15;
13. requires `REAL_OZON_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`, `OPERATOR_BROWSER_ACTIONS=0`, production modifications by validator `0`;
14. only after all functional blocks 01-15 pass, packages exactly the tested production tree;
15. fresh-extracts the package and byte-compares all 17 files to the tested candidate;
16. reruns package syntax/manifest/inventory integrity checks;
17. prints package SHA-256;
18. emits `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` only if every applicable block 01-16 passes.

Execute the top-level functional runner exactly ONCE for the authoritative rerun.

Preparation integrity checks and `node --check` of temporary validation files may happen before the authoritative command. Do not run individual functional blocks as exploratory tests before the one authoritative consolidated execution.

On a functional assertion failure, preserve evidence and stop. Do not retry the failed block, weaken assertions, or edit production.

## Browser behavior must remain unchanged

The launch correction must not alter any behavior assertion. Preserve at minimum:

- quota wait visible plate;
- decreasing countdown;
- absolute due clock;
- duplicate Ozon click blocked;
- native ChatGPT Copy independent;
- two-owner isolation;
- restart restore;
- due/sending state;
- ChatGPT binding;
- Alice binding;
- zero cross-owner regression;
- normal delivery insertion + exactly one Send + Microphone completion;
- occupied composer never overwritten;
- persistent plate text `Очистите поле ввода, чтобы получить отчёт.`;
- missing composer enters pending wait rather than failure;
- composer clear produces exactly one insertion;
- waiter survives/rebinds correctly where current architecture requires;
- Manual OFF cancels only the current pre-insert pending Manual owner operation;
- other owners remain unchanged;
- Manual OFF does not reset verified cache or Seller quota timing;
- OFF -> ON returns Manual readiness;
- cancelled old report never reappears;
- existing persisted `next_allowed_at`/60000/5000/65000 timing semantics survive OFF -> ON.

## Network and safety

Hard totals:

- real Seller credentials: 0;
- real Performance credentials: 0;
- real Ozon requests: 0;
- real Performance requests: 0;
- operator browser actions: 0;
- production files modified by validator: 0.

No hidden retry, pagination, fan-out or report polling may be added.

## Packaging

Packaging block runs only if blocks 01-15 PASS.

Required:

- package exact tested 17-file production tree only;
- exclude tests/reports/dev files/credentials;
- record ZIP SHA-256;
- fresh-extract;
- byte-compare all 17 files to tested candidate;
- rerun syntax/manifest/inventory checks;
- only then PASS block 16.

## Report

Create report-only branch:

`validation/ozon-pre-operator-full-gate-composer-wait-rerun7-2026-08-18`

Create exactly one new validation report under:

`tooling/llm-api-bridges/ozon-seller/validation/reports/`

Do not commit production, temporary runner, extracted candidate, package, browser profile, or credentials on the validation branch.

Report every block 01-16 as PASS/FAIL, exact candidate hashes, network counters, browser launch/environment diagnostics, package SHA if produced, fresh-extract result, failure classification if any, and umbrella marker.

If all blocks pass, terminal result must include:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

If not all pass, umbrella marker must be absent.

After publishing the report, STOP.

# Required final response schema

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN7_RESULT

gate_input_checkpoint:
  013aeec19fe44f6b6c15aaa39d0d70388f1d2029

environment_correction_commit:
  74add69e65707bc0757ac36205be16ab85d6d56b

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
  NONE|PRODUCTION_BEHAVIOR_FAILURE|HARNESS_FIXTURE_FAILURE|ENVIRONMENT_ERROR|PRODUCTION_CANDIDATE_RECONSTRUCTION_FAILURE|<other exact classification>

umbrella_marker:
  OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|ABSENT

report_branch:
  <branch>

report_commit:
  <sha>
```