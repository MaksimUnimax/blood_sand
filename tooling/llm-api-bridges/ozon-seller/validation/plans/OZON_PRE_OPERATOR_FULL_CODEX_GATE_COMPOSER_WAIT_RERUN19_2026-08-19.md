# Ozon Bridge v0.1.19 — evidence-ledger integrated full gate RERUN19

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_INTEGRATED_RERUN19`

# RERUN19 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.
Repository: `MaksimUnimax/blood_sand`.
Codex is the independent validator. Production/candidate are immutable.

This is ONE consolidated top-level validation execution. No separate preflight, forensic, reduced smoke run, intermediate report, or intermediate operator result is authorized.

## Authorities — read completely before building the runner

1. Permanent living gate:
`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`
exact blob SHA `28c82b263e6cbd01c744cbfc046241837f1d253e`.

2. Mandatory executable-evidence manifest — authoritative validation coverage contract for this run:
`tooling/llm-api-bridges/ozon-seller/validation/full-gate/FULL_GATE_EXECUTABLE_EVIDENCE_MANIFEST_2026-08-19.md`
commit `2164077863f4dc7d3ee8ec18620ace25e5053c40`.

3. Gate input checkpoint:
`013aeec19fe44f6b6c15aaa39d0d70388f1d2029`.

4. Exact candidate authorities:
- frozen publication `5245551cb4ff01e388146397b1a0075c0e0f013b`;
- repair checkpoint `1de4cea770fc8ae09280e65d13e60525fd22e4e7`;
- frozen artifact SHA-256 `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`;
- repair patch SHA-256 `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`;
- final worker SHA-256 `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`;
- final content SHA-256 `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`;
- production inventory 17; changed exactly worker/content; protected 15 byte-identical.

5. Accepted validator environment/corrections:
- canonical CFT algorithm `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`;
- absolute paths `36bbb81062d12348e87ce6297af2df8566bf6a46`;
- validator-only no-sandbox environment supersession `2c51de4f3ffb5f979b17bc5597be06d5d085e46a`;
- worker direct-CDP correction `376886cd29d971a354dc18f313fbeb9ba1153922`;
- worker activation/order correction `a7d2e1ca92c711089ff556c9e14a1870eb474eea`;
- mutable-state correction `5d64c763454801963d0554b375716fb86498711b`;
- CFT reconciliation correction `afcffc0442bbc9f0546843a587f9a1806e3616d0`;
- partial-runner correction `3afc5f00a0c2f52e51f9d7918ec4c0ee86d22e5c`.

6. Current/past execution evidence used only as harness architecture/coverage authorities, never as PASS carry-forward:
- independent acceptance report `662efb3737e5f7d702751a2407d9d154a2d83ea9`;
- RERUN13 report `9e275d784b46c46dc86f1f0ca02eb5e12094ec37` proving direct worker CDP substrate;
- RERUN18 report `9188b934e1c648acecfa390cc5c49074195a3e4b` proving current browser substrate but also proving reduced Phase C/D were insufficient.

Read the browser harness manifest and every exact blob/marker authority named by the executable-evidence manifest.

## Critical RERUN18 disposition

RERUN18 is NOT an accepted full gate:
- browser substrate PASS is useful architecture evidence only;
- blocks 01-14 were NOT_PROVEN because only a reduced targeted subset ran;
- block 15 was NOT_PROVEN because only reduced browser checks ran;
- its block16/package execution violated the permanent packaging prerequisite;
- ZIP SHA-256 `565e07256348778e9389883834bfed72cd2c5fcfc3a519f41723e1936749c2339` is `INVALID_FOR_OPERATOR_HANDOFF` and MUST NOT be reused.

## Exact top-level executable

Create and execute exactly:
`RERUN19_EVIDENCE_LEDGER_FULL_GATE_RUNNER.mjs`

Do not execute or import any prior RERUN top-level runner.

The exact process invocation of this runner is the single consolidated full-gate execution. Validation-only helper harnesses may be reconstructed/generated/loaded by this process, but all helper source hashes and exact child commands must be recorded and all child processes must be awaited.

## Phase 0 — static, completeness and ledger-coverage gate

Before launching Chrome or executing functional assertions, the runner MUST:

1. pass `node --check` and record its SHA-256;
2. verify explicit awaited A -> B -> C -> D -> E flow;
3. forbid `browser.newPage()`, `worker.evaluate()`, `worker.evaluateHandle()` in accepted browser paths;
4. reject `TODO`, `placeholder`, `stub`, `not implemented`, `unavailable`, phase-replacing unconditional throw/return/exit;
5. preserve the mutable-discovery self-test and require it PASS;
6. verify exact spawn-argument checking occurs before extension install;
7. verify real implementations exist for raw PAGE Runtime/Page/Fetch, deterministic ServiceWorker activation, direct worker CDP + raw same-worker fallback, synthetic raw-PAGE adapter, Phase-C harness execution, complete Phase-D browser behavior and Phase-E packaging;
8. read the LIVE permanent gate text and mechanically enumerate every bullet requirement under blocks 01 through 15;
9. build a seeded assertion ledger entry for EVERY enumerated bullet, with stable `B<block>.<ordinal>` id and exact/normalized requirement text; all entries begin `executed:false, pass:false`;
10. compare the seeded ledger to the permanent gate and fail BEFORE the consolidated execution if any applicable bullet lacks exactly one ledger entry;
11. load the executable-evidence manifest `216407...` and verify the runner has executable evidence providers E1-E8 plus the packaging interlock;
12. verify no block-status function can return literal `PASS` from phase markers or historical report text; block status must be mechanically derived only from its ledger entries;
13. verify no package function is reachable until all blocks 01-15 are literal PASS.

Print `RERUN19_PHASE0_LEDGER_AND_IMPLEMENTATION_COMPLETENESS_PASS` only after all checks above PASS.

If Phase 0 fails, this is HARNESS_ERROR; do not launch Chrome, do not package, publish only the one final report.

## Phase A — deterministic candidate

Reconstruct exact candidate from frozen artifact + exact patch from scratch. Execute every block-01 integrity requirement including patch no-fuzz, inventory, changed/protected files, all JS syntax, manifest parse, permissions/host permissions, exclusion of validation/dev/credentials.

Execute/adapt E4 carry-forward evidence as specified by manifest and record exact source/diff/hash.

Update each block-01 ledger item from concrete execution evidence. Block 01 may become PASS only by ledger aggregation.

Print `RERUN19_PHASE_A_CANDIDATE_DONE` only after block-01 ledger PASS.

## Phase B — accepted browser substrate, fresh in this run

### B0 CFT authority

Use literal canonical inventory algorithm from `36b20ff...`; expected 308 files and `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`.
If the supplied source mismatches, perform the in-run reconciliation from `afcffc...` and select only an independent CFT 151.0.7922.47 tree yielding exact `308 + d7b8...`.
Never modify source CFT.
Fresh-copy selected tree, copied setup exactly once, `shell:false`, no elevation, require exit 78 and post-setup byte identity.

### B1-B5 browser/worker substrate

Use Node v24.12.0, Puppeteer 25.4.0, CFT 151.0.7922.47, fresh profile, `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`.

Exact normalized args:
1. `--user-data-dir=<fresh-profile>`
2. `--remote-debugging-port=0`
3. `--no-first-run`
4. `--no-default-browser-check`
5. `--disable-background-networking`
6. `--disable-component-update`
7. `--disable-sync`
8. `--metrics-recording-only`
9. `--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0`
10. `--no-sandbox`
11. `about:blank`
No other Chrome switch.

Verify actual args BEFORE install.
Install/enumerate exact enabled v0.1.19 candidate.
Create raw PAGE with `Target.createTarget`, require PAGE Runtime/Page/Fetch + local fixture + liveness, zero real page network.

Worker activation exact sequence:
- inspect `extension.workers()` AND raw `Target.getTargets`;
- if exact candidate worker exists by either, use it without reactivation;
- otherwise register ServiceWorker registration/version listeners on qualified PAGE, `ServiceWorker.enable`, observe exact candidate registration scope, call `ServiceWorker.startWorker({scopeURL:<exact observed scope>})` exactly once, bounded-poll both routes;
- raw exact candidate service-worker target counts even if Puppeteer exposure lags;
- no popup/action/wake, no second startWorker.

Worker Runtime:
- direct `worker.client.send(Runtime.enable/Runtime.evaluate/Network.enable)` first when available;
- raw CDP to SAME active worker target as fallback;
- never `worker.evaluate()`.

Run the complete substrate self-check: local supported fixture, DOM read/write, input/change, click, reload/re-navigation, real content-script initialization, browser liveness, zero real Ozon/Performance/ChatGPT network and zero operator actions.

Print `RERUN19_PHASE_B_SUBSTRATE_DONE` only after PASS and continue immediately.

## Phase C — FULL permanent blocks 02-14 from executable evidence manifest

Print `RERUN19_PHASE_C_BLOCKS_02_14_STARTED`.

This is NOT a targeted-only phase. Execute E1, E3, E4, E5, E6, E7 and E8 as required by `216407...` against the exact current candidate.

### Validation helper handling

For exact Git blobs (E1/E3/E4), reconstruct exact source, verify blob/content SHA and adapt only the explicitly authorized deterministic current hash/path/fixture inputs. Record the exact diff and adapted SHA. Semantic assertion removal/weakening is forbidden.

For historical temporary Step2/Step3/verifier/cache/queue/realUI harnesses that are not Git-pinned:
- historical PASS text is NOT evidence;
- if retained validation-only files exist locally, the runner may copy them read-only into its workspace, hash them, inspect them, and use them only if their assertions cover the manifest/permanent ledger requirements;
- if absent/incomplete, the runner itself must construct validation-only replacement helper source before executing that helper;
- the Phase-0 implementation-completeness logic MUST inspect every replacement helper and map its executable assertions to permanent ledger ids before functional execution;
- a helper containing only marker prints/source scans without the required state/provider/browser assertions does not satisfy coverage.

### Required execution families

At minimum execute current-candidate behavior covering:
- block 02 strict command discovery/JSON/date/dimension/metric/filter/sort/product constraints/blocked operations/zero-provider malformed behavior;
- block 03 fixed-host/security/credential/privacy/no mutation/no hidden retries/fanout/pagination/wrong binding fail-closed;
- block 04 complete Seller capability/entitlement matrix including universal zero-probe, relevant at-most-one probe, raw seller-info privacy, mixed/restricted semantics, Performance-only zero Seller probe;
- block 05 complete Step2 coalescing/projection/recovery markers in E5;
- block 06 complete quota/queue/public-state behavior in E3/E6, exact 60000/5000/65000, same/different Seller, credential rotation, concurrency, restart, Retry-After extension only;
- block 07 complete verifier/safe-error matrix in E6;
- block 08 complete cache/prefetch matrix in E7;
- block 09 common Manual/Autorun batch semantics in E8;
- block 10 normal empty-composer delivery FSM behavior in E8 plus browser-backed assertions;
- block 11 occupied/missing composer E1 plus later E2 browser evidence;
- block 12 Manual OFF/OFF->ON narrow cancellation E1/E3 plus later E2 browser evidence;
- block 13 native Copy/bindings/multi-owner/ChatGPT-Alice isolation E8 plus later E2 browser evidence;
- block 14 Performance boundary behavior E8 and network instrumentation.

Observe every mandatory E1/E3-E8 marker or explicit one-to-one equivalent ledger evidence required by manifest `216407...`.

For blocks whose ledger requires browser-backed E2 evidence, do NOT prematurely mark PASS in Phase C; leave them `NOT_PROVEN` until Phase D supplies those ledger entries.

Print `RERUN19_PHASE_C_NONBROWSER_EVIDENCE_DONE` only after all non-browser evidence providers finish and all currently executable ledger entries are recorded.

## Phase D — FULL block 15 + browser-backed ledger completion

Print `RERUN19_PHASE_D_BLOCK15_AND_BROWSER_LEDGER_STARTED`.

Port ONLY the transport of pinned E2 composer-wait browser harness to the already-qualified raw-PAGE/direct-worker-CDP substrate. Preserve all pinned behavioral assertions. Record the port source SHA-256 and an assertion mapping against the original E2 harness.

Execute and require every exact E2 marker from manifest, including:
- occupied plate persistence and exact text;
- draft untouched;
- clear -> exactly one insert;
- one existing Send/Microphone completion;
- native Copy while waiting;
- Manual OFF pending-only cancellation;
- OFF->ON ready;
- quota/cache unchanged;
- cancelled report never reappears;
- zero provider network;
- `OZON_COMPOSER_WAIT_BROWSER_HARNESS_PASS`.

Then execute every remaining applicable block-15 browser/runtime assertion and browser-backed ledger item for blocks 09-14, including current equivalents of the historical realUI behavior catalog in E8: ChatGPT/Alice binding, native Copy, two-owner isolation, reload/lifecycle recovery, Manual/Autorun batch/delivery, provider-wait owner isolation/restart/no-late-call, wrong owner fail-closed, no duplicate insertion/Send/provider work.

A reduced `Runtime.evaluate` smoke test is explicitly insufficient.

After all browser assertions, mechanically aggregate ledger statuses for blocks 01-15.
For each block report `required/executed/passed/failed/missing`.

If ANY block 01-15 is not literal `PASS`, print `RERUN19_PACKAGING_FORBIDDEN_NOT_ALL_BLOCKS_PASS`, keep block16 `NOT_RUN`, do not create a ZIP, classify truthfully, publish the one final report and STOP.

Only if all blocks 01-15 are literal PASS print:
`RERUN19_PHASE_D_ALL_BLOCKS_01_15_PASS`
and continue immediately.

## Phase E — packaging with hard runtime interlock

Before ANY ZIP/file-package operation execute the exact semantic interlock required by manifest `216407...`:

```js
for (let i = 1; i <= 15; i++) {
  const k = String(i).padStart(2,'0');
  if (blocks[k] !== 'PASS') throw new Error(`PACKAGING_FORBIDDEN_BLOCK_${k}_NOT_PASS`);
}
```

Only after that interlock PASS:
- print `RERUN19_PHASE_E_BLOCK16_STARTED`;
- ZIP exactly the same tested 17-file production tree;
- do NOT reuse/copy RERUN18 ZIP;
- exclude validation/tests/reports/development/credentials;
- record new ZIP SHA-256;
- fresh-extract to a new directory;
- require exact 17-file inventory;
- compare every extracted file byte-for-byte with the tested tree;
- require exact final worker/content hashes;
- rerun production JS syntax and manifest parse;
- require package drift 0.

Set block16 PASS only after all of the above.
Print `RERUN19_PHASE_E_BLOCK16_DONE`.
Only if all blocks 01-16 are literal PASS print exactly:
`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`.
Do not rebuild/alter package after PASS.

## Hard safety/mutation counters

Throughout:
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `REAL_CHATGPT_REQUESTS=0`;
- `OPERATOR_BROWSER_ACTIONS=0`;
- production modifications by validator = 0;
- candidate modifications after deterministic reconstruction = 0;
- source CFT modifications = 0;
- no real credentials;
- no operator Chrome/profile;
- no dependency/browser update;
- no production assertion weakening.

## Failure classification

- missing/reduced/incomplete evidence provider, ledger gap, incorrect runner orchestration => `HARNESS_ERROR`;
- accepted executable assertion reaches production behavior and actual behavior fails => `PRODUCTION_BEHAVIOR_FAILURE` (identify block/assertion id);
- independently proven CFT/browser/runtime environment failure => `ENVIRONMENT_ERROR`;
- do not infer production failure from harness/environment errors.

## One final report only

Create exactly one report-only branch:
`validation/ozon-pre-operator-full-gate-composer-wait-rerun19-2026-08-19`.

Publish exactly one report:
`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN19_2026-08-19.md`.

The report MUST contain:
- runner SHA and exact command;
- Phase-0 implementation/ledger completeness result;
- exact candidate/CFT/browser substrate evidence;
- every helper harness original/adapted/generated SHA and exact command/transport;
- full assertion ledger B01..B15 or an attached machine-readable ledger with complete counts and report summary;
- block 01-16 statuses derived mechanically;
- all required E1-E8 markers/equivalent mappings observed in THIS run;
- network/action/mutation counters;
- packaging-interlock result;
- package path/SHA/fresh-extract identity only when actually authorized;
- terminal umbrella marker only if all 01-16 PASS.

After publication STOP. Do not hand off a package in the Codex response.

# Required final response schema

Return exactly:

```text
OZON_PRE_OPERATOR_FULL_GATE_RERUN19_RESULT

verdict: RERUN19_PASS|RERUN19_FAILED
classification: NONE|HARNESS_ERROR|PRODUCTION_BEHAVIOR_FAILURE|ENVIRONMENT_ERROR
runner_sha256: <sha256>
phase0_ledger_and_implementation_completeness: PASS|FAIL
phase_a: PASS|FAIL|NOT_RUN
phase_b: PASS|FAIL|NOT_RUN
block_01: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_02: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_03: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_04: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_05: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_06: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_07: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_08: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_09: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_10: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_11: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_12: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_13: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_14: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_15: PASS|FAIL|NOT_PROVEN|NOT_RUN
block_16: PASS|FAIL|NOT_RUN
packaging_interlock: PASS|FAIL|NOT_RUN
assertion_ledger_missing_count: <integer>
real_ozon_requests: <integer>
real_performance_requests: <integer>
real_chatgpt_requests: <integer>
operator_browser_actions: <integer>
package_path: <path|NONE>
package_sha256: <sha256|NONE>
fresh_extract_byte_identical: PASS|FAIL|NOT_RUN
umbrella_marker: OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS|ABSENT
report_branch: validation/ozon-pre-operator-full-gate-composer-wait-rerun19-2026-08-19
report_commit: <sha>
```
