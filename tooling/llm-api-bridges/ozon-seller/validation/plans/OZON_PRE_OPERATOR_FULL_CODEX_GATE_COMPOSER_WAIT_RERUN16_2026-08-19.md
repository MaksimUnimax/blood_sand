# Ozon Bridge v0.1.19 — integrated full-gate RERUN16

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_INTEGRATED_RERUN16`

# RERUN16 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.
Repository: `MaksimUnimax/blood_sand`.
Codex is independent validator. Production/candidate are immutable.
This is ONE top-level execution: no separate preflight, no intermediate report/result.

## Read completely before building runner

- permanent gate: `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`
- gate checkpoint: `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`
- frozen publication: `5245551cb4ff01e388146397b1a0075c0e0f013b`
- repair checkpoint: `1de4cea770fc8ae09280e65d13e60525fd22e4e7`
- canonical CFT correction: `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`
- absolute-path correction: `36bbb81062d12348e87ce6297af2df8566bf6a46`
- validator environment supersession: `2c51de4f3ffb5f979b17bc5597be06d5d085e46a`
- worker direct-CDP correction: `376886cd29d971a354dc18f313fbeb9ba1153922`
- full-run control-flow correction: `57efec456b5416094fca0917a2310a5946106a1b`
- worker activation/order correction: `a7d2e1ca92c711089ff556c9e14a1870eb474eea`
- RERUN15 mutable-state correction, authoritative delta for this run: `5d64c763454801963d0554b375716fb86498711b`
- RERUN13 report: `9e275d784b46c46dc86f1f0ca02eb5e12094ec37`
- RERUN15 report: `10b555429141be410fc34466f793cc976fb0c2da`
- browser harness manifest: `tooling/llm-api-bridges/ozon-seller/validation/full-gate/COMPOSER_WAIT_BROWSER_HARNESS_MANIFEST.md`

Read all live harness blobs referenced by the permanent gate. Historical PASS may guide architecture but may not replace execution.

## Exact candidate

Frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`.
Repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`.
Final worker SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`.
Final content SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`.
Inventory 17; changed exactly worker/content; protected 15 byte-identical.
Reconstruct from frozen artifact + exact patch from scratch in this execution.

## Exact validator environment

Node v24.12.0; Puppeteer 25.4.0; CFT 151.0.7922.47.
Canonical source CFT: 308 files, SHA-256 `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c` using preflight6 algorithm.
Use the accepted disposable validator contract from `2c51de4f...`: fresh owned CFT copy, setup once exit 78, fresh profile, exact already-authorized launch arguments, no operator profile/credentials, no dependency/browser change.

## Phase 0 — new runner + self-test

Create and execute only `RERUN16_INTEGRATED_FULL_GATE_RUNNER.mjs`. Do not execute any prior RERUN top-level runner.

Before Chrome launch:
1. `node --check` exact runner and record SHA-256;
2. statically prove awaited A -> B -> C -> D -> E flow and umbrella only after block16;
3. exact spawn-arg assertion must precede extension install;
4. forbid `browser.newPage()`, `worker.evaluate()`, `worker.evaluateHandle()`, bare `worker missing`, early return/report after substrate PASS;
5. mutable worker/target/registration snapshots that are rebound during polling MUST be `let` or updated without rebinding;
6. run the ACTUAL Phase-B discovery-state helper on pure mock data inside this same process: empty->Puppeteer worker, empty->raw worker target, empty->registration, repeated empty refreshes, selected target absent->present, multiple refresh cycles. Any const-reassignment/stale-state TypeError fails as HARNESS_ERROR.

Require marker: `RERUN16_MUTABLE_DISCOVERY_STATE_SELFTEST_PASS`.

## Phase A

Execute permanent block-01 integrity prerequisites on exact candidate. Then print `RERUN16_PHASE_A_CANDIDATE_DONE`.

## Phase B — strict accepted substrate

B1: materialize/verify CFT, launch accepted disposable validator; normalize and verify exact Chrome args BEFORE `browser.installExtension`; record `spawn_args_exact_match=PASS`.

B2: install/enumerate exact v0.1.19; raw PAGE only; require Runtime/Page/Fetch, `1+1===2`, local inert fixture, browser alive, zero external page network.

B3 worker activation, using the exact mutable helper self-tested in Phase0:
- snapshot both `extension.workers()` and raw `Target.getTargets` exact candidate service-worker targets;
- if exact target exists by either route, do not reactivate;
- otherwise install registration/version listeners, call `ServiceWorker.enable`, observe unique candidate registration scope, call `ServiceWorker.startWorker(scopeURL)` exactly once, then bounded-poll BOTH mutable snapshots;
- raw exact candidate service-worker target counts as activation even if Puppeteer exposure lags;
- if timeout, report registration/scope/startWorker and last snapshots; no bare `worker missing`.

B4 worker Runtime: first `worker.client.send(Runtime.enable/Runtime.evaluate/Network.enable)`; if unavailable/fails, raw CDP to SAME active worker target, without restart/reactivation. At least one transport must PASS.

B5 raw-PAGE adapter self-check: local supported fixture, DOM read/write, input/change, click, reload/re-navigation, content-script init, liveness; counters remain `REAL_OZON_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`, `REAL_CHATGPT_REQUESTS=0`, `OPERATOR_BROWSER_ACTIONS=0`.

After B PASS print `RERUN16_PHASE_B_SUBSTRATE_DONE` and continue immediately to C in same process.

## Phase C — blocks 01-14

Print `RERUN16_PHASE_C_BLOCKS_01_14_STARTED`.
Execute EVERY applicable requirement of live permanent blocks 01-14 fresh, using current live harness blobs. All are applicable. Require every current composer-wait targeted marker and all command/security/capability/planner/quota/verifier/cache/common-batch/delivery/UI/Performance invariants, including 60000/5000/65000 timing and zero real provider network.
Assign each block from this execution only.
If all PASS print `RERUN16_PHASE_C_BLOCKS_01_14_DONE`; otherwise later blocks NOT_RUN and no package.

## Phase D — block 15

Print `RERUN16_PHASE_D_BLOCK_15_STARTED`.
Run complete live browser/runtime matrix with qualified raw PAGE adapter + selected direct worker transport. Require all current composer-wait browser markers plus all other applicable block-15 assertions. No assertion may be skipped because transport is raw CDP.
If PASS print `RERUN16_PHASE_D_BLOCK_15_DONE`; otherwise block16 NOT_RUN.

## Phase E — block 16

Only after blocks01-15 PASS print `RERUN16_PHASE_E_BLOCK_16_STARTED`.
ZIP exactly the tested 17-file production tree; exclude validation/dev/tests/reports/credentials; record SHA-256; fresh-extract; require exact 17 files byte-identical to tested tree; final hashes exact; rerun JS syntax + manifest parse; package drift 0.
If PASS print `RERUN16_PHASE_E_BLOCK_16_DONE`, then and only then `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`.
Do not rebuild package after PASS.

## Reporting/accounting

`NOT_RUN` means not reached; `NOT_APPLICABLE` only genuinely absent/removed behavior.
HARNESS_ERROR for runner/state/orchestration defects; ENVIRONMENT_ERROR only with direct environment evidence; PRODUCTION_BEHAVIOR_FAILURE only after accepted substrate and an actual production assertion failure.
Production modifications=0, candidate modifications=0 after reconstruction, source CFT modifications=0.

Publish exactly one report-only branch `validation/ozon-pre-operator-full-gate-composer-wait-rerun16-2026-08-19` and one report `tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN16_2026-08-19.md`.
Report exact runner SHA/command, self-test, phase markers, Phase-B activation evidence, selected worker transport, every block01-16, required targeted/browser markers, counters, package path/SHA/fresh-extract identity, terminal marker/classification.
After publication STOP.

Return exactly `OZON_PRE_OPERATOR_FULL_GATE_RERUN16_RESULT` with the same RERUN15 fields plus: `mutable_discovery_state_correction_commit`, `mutable_discovery_state_selftest`, `worker_registration_scope`, `start_worker_called`, full block01-16 statuses, package path/SHA/fresh-extract status, umbrella marker, report branch/commit.
