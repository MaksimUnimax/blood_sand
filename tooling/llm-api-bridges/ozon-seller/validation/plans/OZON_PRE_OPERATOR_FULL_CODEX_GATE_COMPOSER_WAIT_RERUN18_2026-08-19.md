# Ozon Bridge v0.1.19 — integrated full-gate RERUN18

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_INTEGRATED_RERUN18`

# RERUN18 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.
Repository: `MaksimUnimax/blood_sand`.
Codex is the independent validator. Production/candidate are immutable.
This is ONE top-level execution. No separate preflight, no intermediate report/result.

Read completely before building the runner:
- permanent gate `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`;
- gate checkpoint `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`;
- canonical CFT correction `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`;
- validator environment supersession `2c51de4f3ffb5f979b17bc5597be06d5d085e46a`;
- worker direct-CDP correction `376886cd29d971a354dc18f313fbeb9ba1153922`;
- control-flow correction `57efec456b5416094fca0917a2310a5946106a1b`;
- worker activation/order correction `a7d2e1ca92c711089ff556c9e14a1870eb474eea`;
- mutable-state correction `5d64c763454801963d0554b375716fb86498711b`;
- CFT reconciliation correction `afcffc0442bbc9f0546843a587f9a1806e3616d0`;
- partial-runner stub correction, authoritative delta for this run: `3afc5f00a0c2f52e51f9d7918ec4c0ee86d22e5c`;
- RERUN13 report `9e275d784b46c46dc86f1f0ca02eb5e12094ec37`;
- RERUN17 report `97cfa16c5cddcfa6b09bf3aa3dac7026cd063e60`;
- current browser harness manifest and every live harness blob required by the permanent gate.

Exact candidate remains unchanged:
- frozen ZIP SHA-256 `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`;
- repair patch SHA-256 `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`;
- service worker SHA-256 `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`;
- content script SHA-256 `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`;
- production inventory 17; changed exactly worker/content; protected 15 byte-identical.
Reconstruct from frozen artifact + exact patch from scratch in this execution.

Create and execute exactly `RERUN18_INTEGRATED_FULL_GATE_RUNNER.mjs`. Do not execute/reuse any prior top-level runner.

## Phase 0 — static + implementation-completeness gate

Before execution:
1. `node --check` PASS;
2. compute runner SHA-256;
3. require awaited A -> B -> C -> D -> E flow;
4. require mutable discovery-state self-test PASS;
5. require spawn-arg verification before extension install;
6. forbid `browser.newPage()`, `worker.evaluate()`, `worker.evaluateHandle()`;
7. reject executable phase code containing `unavailable`, `not implemented`, `NotImplemented`, `TODO`, `placeholder`, `stub`, or any unconditional throw/return/exit that replaces a required phase;
8. statically require actual executable calls/equivalents for all of: `browser.installExtension`, `browser.extensions`, `Target.createTarget`, PAGE `Runtime.enable`, `Page.enable`, `Fetch.enable`, `Target.getTargets`, `ServiceWorker.enable`, conditional single `ServiceWorker.startWorker`, bounded dual-route worker polling, direct worker `Runtime/Network`, raw same-worker CDP fallback, raw PAGE adapter self-check;
9. statically require actual executable Phase-C harness invocations for applicable blocks 01-14, actual Phase-D browser-harness execution, and actual Phase-E ZIP/fresh-extract/byte-verification implementation;
10. phase marker declarations alone do not satisfy implementation completeness.

Do not execute until all ten checks PASS.

## Phase A — candidate integrity

Run exact permanent block-01 integrity requirements. Print `RERUN18_PHASE_A_CANDIDATE_DONE` only after PASS.

## Phase B0 — CFT reconciliation

Use the literal canonical algorithm from `36b20ff...`: exact `{path,size,sha256}` records, final `localeCompare`, per-record JSON LF serialization + final LF. Expected `308` and `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`.

If current source matches, use it. If aggregate mismatches, do not stop on aggregate alone: perform the in-run reconciliation from `afcffc...` and select only a read-only CFT 151.0.7922.47 tree independently yielding exact `308 + d7b8...`. Never modify source CFT. Fresh-copy selected tree, copied setup once `shell:false`, require exit 78 and post-setup byte identity.

## Phase B1-B5 — full accepted browser substrate

Use Node v24.12.0, Puppeteer 25.4.0, CFT 151.0.7922.47, fresh profile, `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`, and exact normalized launch args:
1 `--user-data-dir=<fresh-profile>`
2 `--remote-debugging-port=0`
3 `--no-first-run`
4 `--no-default-browser-check`
5 `--disable-background-networking`
6 `--disable-component-update`
7 `--disable-sync`
8 `--metrics-recording-only`
9 `--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0`
10 `--no-sandbox`
11 `about:blank`.
No other Chrome switch.

Verify exact actual args BEFORE install.
Install candidate once and enumerate exact enabled v0.1.19 extension.
Create raw PAGE via `Target.createTarget`, never Puppeteer Page. Require raw PAGE Runtime/Page/Fetch enable, `1+1===2`, local inert fixture, browser alive, zero external page network.

Worker activation must execute exactly:
- inspect both `extension.workers()` and raw `Target.getTargets`;
- if unique exact candidate service worker exists by either route, use it without reactivation;
- if neither exists, register ServiceWorker registration/version listeners on qualified PAGE, call `ServiceWorker.enable`, observe exact candidate registration scope, call `ServiceWorker.startWorker({scopeURL:<observed exact scope>})` exactly once, then bounded-poll BOTH Puppeteer workers and raw targets;
- exact raw candidate target counts as activation even if Puppeteer exposure lags;
- no action/popup/wake, no second startWorker.

Worker Runtime:
- first use `worker.client.send('Runtime.enable')`, direct `Runtime.evaluate('1+1')`, `Network.enable` when Puppeteer exposes worker;
- on failure/unavailability attach raw CDP to the SAME active worker target via target websocket or `Target.attachToTarget(..., flatten:true)` and run equivalent Runtime/Network assertions;
- no `worker.evaluate()`.

Then run raw PAGE adapter self-check: local supported fixture fulfillment, DOM read/write, input/change dispatch, button click, reload/re-navigation, content-script initialization, post-worker liveness. Require REAL_OZON_REQUESTS=0, REAL_PERFORMANCE_REQUESTS=0, REAL_CHATGPT_REQUESTS=0, OPERATOR_BROWSER_ACTIONS=0.

Only after B0-B5 PASS print `RERUN18_PHASE_B_SUBSTRATE_DONE` and immediately continue. No report/cleanup/return/exit here.

## Phase C — permanent blocks 01-14

Print `RERUN18_PHASE_C_BLOCKS_01_14_STARTED` and execute every applicable requirement of live blocks 01-14 fresh in this run using the exact live canonical harness blobs. Historical PASS does not substitute for execution.
Require all current composer-wait targeted markers plus all command/security/capability/planner/quota/verifier/cache/common-batch/delivery/UI/Performance assertions, including exact 60000/5000/65000 semantics and zero real provider network.
If all PASS print `RERUN18_PHASE_C_BLOCKS_01_14_DONE`; otherwise later blocks NOT_RUN and no package.

## Phase D — block 15

Print `RERUN18_PHASE_D_BLOCK_15_STARTED` and execute complete live browser/runtime matrix with the qualified raw PAGE adapter + selected worker direct-CDP transport. Require all current composer-wait browser markers and every other applicable block-15 assertion. No browser assertion may be skipped because raw CDP is used.
If PASS print `RERUN18_PHASE_D_BLOCK_15_DONE`; otherwise block16 NOT_RUN.

## Phase E — block 16

Only after blocks 01-15 PASS print `RERUN18_PHASE_E_BLOCK_16_STARTED`.
ZIP exactly the tested 17-file production tree. Exclude validation/tests/reports/development/credentials. Record SHA-256. Fresh-extract to new directory. Require exact 17-file inventory, all 17 files byte-identical to tested tree, exact worker/content hashes, JS syntax PASS, manifest parse PASS, package drift 0.
If PASS print `RERUN18_PHASE_E_BLOCK_16_DONE` and then exactly `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`. Do not rebuild after PASS.

Hard counters throughout: real Ozon=0; real Performance=0; real ChatGPT=0; operator actions=0; production modifications=0; candidate modifications=0 after deterministic reconstruction; source CFT modifications=0.

Create exactly one report branch `validation/ozon-pre-operator-full-gate-composer-wait-rerun18-2026-08-19` and one report `tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN18_2026-08-19.md`. Report runner SHA, implementation-completeness PASS, CFT reconciliation, all phase markers, blocks 01-16, required targeted/browser markers, counters, package path/hash/fresh-extract identity, terminal marker and truthful failure classification. After publication STOP.

Return exactly `OZON_PRE_OPERATOR_FULL_GATE_RERUN18_RESULT` with full candidate/environment/phase/block/network/modification/package accounting.