# Ozon Bridge v0.1.19 — integrated full-gate RERUN17

Date: 2026-08-19
Status: `READY_TO_DISPATCH_ONE_INTEGRATED_RERUN17`

# RERUN17 STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.
Repository: `MaksimUnimax/blood_sand`.
Codex is independent validator. Production/candidate are immutable.
This is ONE top-level execution: no separate preflight and no intermediate report/result.

Read completely before building the runner:
- permanent gate `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`;
- gate checkpoint `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`;
- canonical CFT correction `36b20ff0c84b791f3418b1f51c23e52e571c8ef3`;
- validator environment supersession `2c51de4f3ffb5f979b17bc5597be06d5d085e46a`;
- worker direct-CDP correction `376886cd29d971a354dc18f313fbeb9ba1153922`;
- full-run control-flow correction `57efec456b5416094fca0917a2310a5946106a1b`;
- worker activation/order correction `a7d2e1ca92c711089ff556c9e14a1870eb474eea`;
- mutable-state correction `5d64c763454801963d0554b375716fb86498711b`;
- RERUN16 CFT evidence correction `afcffc0442bbc9f0546843a587f9a1806e3616d0`;
- RERUN13 report `9e275d784b46c46dc86f1f0ca02eb5e12094ec37`;
- RERUN16 report `ec7dbd70642a43cb958534bcf4ee855faf59f4bb`;
- current browser harness manifest and every live harness blob referenced by the permanent gate.

Exact candidate remains unchanged:
- frozen ZIP SHA-256 `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`;
- repair patch SHA-256 `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`;
- worker `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`;
- content `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`;
- production inventory 17; changed exactly worker/content; protected 15 byte-identical.
Reconstruct from frozen artifact + exact patch from scratch in this run.

Create and execute exactly `RERUN17_INTEGRATED_FULL_GATE_RUNNER.mjs`. Do not execute any earlier top-level runner.
Before execution require `node --check`, static A->B->C->D->E control-flow checks, no `browser.newPage()`, no `worker.evaluate()`, spawn-arg verification before install, and the mutable discovery-state self-test from RERUN16. All async phases must be awaited.

## Phase A
Run exact candidate integrity. Print `RERUN17_PHASE_A_CANDIDATE_DONE` only after PASS.

## Phase B0 — CFT authority reconciliation inside this same full run

Implement the canonical inventory algorithm literally from `36b20ff...`:
1. recursive `fs.readdirSync(dir).sort()`;
2. `lstatSync`, regular files only;
3. POSIX relative path;
4. exact record `{path,size,sha256}`;
5. final `a.path.localeCompare(b.path)` sort;
6. per-record `JSON.stringify`;
7. LF join plus one final LF;
8. SHA-256 UTF-8.

Expected: 308 files and `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`.
Record canonical count/digest and the SHA-256 of the canonical serialized manifest text.

If current canonical source matches, select it and continue immediately.

If it mismatches, DO NOT stop on aggregate hash. In the same process:
- retain the full current canonical `{path,size,sha256}` record set;
- also run the historical RERUN8 inventory algorithm from report `60acc40aa484087f4c408d03611597625f2dab33` only as diagnostic evidence;
- read-only scan the supplied QA root recursively for other directories corresponding to CFT `151.0.7922.47` / `chrome-win64` trees;
- canonical-hash each plausible tree using the exact algorithm above;
- accept a replacement source only if it independently has exactly 308 files and canonical digest `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`;
- never modify/delete/repair the mismatching original source;
- record selected absolute source path and why it qualifies.

If no exact pristine tree exists, stop only after publishing: current canonical digest, RERUN8-control digest, scanned candidate roots/digests, and truthful classification `ENVIRONMENT_CFT_AUTHORITY_DRIFT_UNRESOLVED`. Do not invent per-file differences without a known-good per-file baseline.

If a pristine exact tree is selected, create a fresh validation-owned byte-identical copy, run copied setup once with exit 78, prove post-setup byte identity, and continue the SAME full execution.

## Phase B1-B5 — accepted browser substrate
Use the exact proven disposable validator contract from prior corrections: Node v24.12.0, Puppeteer 25.4.0, CFT 151.0.7922.47, fresh profile, `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`, exact normalized args ending with `--no-sandbox`, no other Chrome switches.

Verify exact spawn args before `browser.installExtension`.
Install/enumerate exact candidate version 0.1.19.
Use raw PAGE only and require Runtime/Page/Fetch/local fixture PASS.
Execute deterministic worker activation exactly from `a7d2e1ca...`: inspect Puppeteer workers + raw targets; if none, `ServiceWorker.enable`, observe exact candidate registration scope, one `ServiceWorker.startWorker(scope)`, bounded-poll both routes. Raw exact service-worker target counts as activation even if Puppeteer exposure lags.
Use direct `worker.client` Runtime/Network first and raw same-worker CDP fallback if needed; never `worker.evaluate()`.
Run raw PAGE adapter self-check and browser liveness. Require zero real Ozon, Performance and ChatGPT requests and zero operator actions.
Print `RERUN17_PHASE_B_SUBSTRATE_DONE` only after all PASS and continue immediately.

## Phase C
Print `RERUN17_PHASE_C_BLOCKS_01_14_STARTED`; execute every applicable permanent block 01-14 fresh from live authorities. Require all current targeted composer-wait markers and all historical/current command/security/capability/planner/quota/verifier/cache/common-batch/delivery/UI/Performance assertions. Preserve 60000/5000/65000 semantics. If all PASS print `RERUN17_PHASE_C_BLOCKS_01_14_DONE`; otherwise later blocks NOT_RUN and no package.

## Phase D
Print `RERUN17_PHASE_D_BLOCK_15_STARTED`; execute complete permanent block 15 using qualified raw PAGE + selected worker direct-CDP transport. Require every current composer-wait browser marker plus all other applicable browser/runtime assertions. If PASS print `RERUN17_PHASE_D_BLOCK_15_DONE`; else block16 NOT_RUN.

## Phase E
Only after blocks 01-15 PASS print `RERUN17_PHASE_E_BLOCK_16_STARTED`; ZIP exactly the tested 17-file production tree; exclude validation/dev/tests/reports/credentials; record ZIP SHA-256; fresh-extract; require exact 17-file inventory and byte identity to tested tree; rerun syntax/manifest checks. If PASS print `RERUN17_PHASE_E_BLOCK_16_DONE`, then and only then print `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`. Do not rebuild after PASS.

Hard counters: REAL_OZON_REQUESTS=0; REAL_PERFORMANCE_REQUESTS=0; REAL_CHATGPT_REQUESTS=0; OPERATOR_BROWSER_ACTIONS=0; production modifications=0; candidate modifications=0 after reconstruction; source CFT modifications=0.

Create exactly one report branch `validation/ozon-pre-operator-full-gate-composer-wait-rerun17-2026-08-19` and one report `tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_PRE_OPERATOR_FULL_GATE_COMPOSER_WAIT_RERUN17_2026-08-19.md`. Include runner SHA, selected CFT authority path/digests, all phase markers, blocks 01-16, required targeted/browser markers, counters, package path/hash/fresh-extract identity, and exact terminal marker. After publication STOP.

Return exactly `OZON_PRE_OPERATOR_FULL_GATE_RERUN17_RESULT` with the same full candidate/environment/phase/block/network/modification/package accounting used by RERUN16, plus `cft_selected_source_path`, `cft_canonical_digest`, `cft_rerun8_control_digest`, and `cft_reconciliation`.