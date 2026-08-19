# Ozon Bridge — integrated gate control-flow orchestration correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_CONTROL_FLOW_CORRECTION`

Production candidate is immutable. This correction changes validation orchestration only.

## Evidence

RERUN13 report commit:
`9e275d784b46c46dc86f1f0ca02eb5e12094ec37`

The report proves the browser substrate passed completely, including:

- exact candidate reconstruction inputs;
- qualified disposable CFT environment;
- extension install/enumeration;
- raw PAGE Runtime/local fixture;
- MV3 worker activation;
- `worker.client.send('Runtime.enable')` PASS;
- direct worker `Runtime.evaluate('1+1')` PASS with value `2`;
- worker Network enable PASS;
- post-worker browser liveness PASS;
- marker `RERUN13_ACCEPTING_WORKER_DIRECT_CDP_SUBSTRATE_PASS` present.

The same report records the exact executed command as:

`node RERUN11_INTEGRATED_RUNNER.mjs ...`

and explicitly states that the runner terminated after the accepting substrate marker and never entered Phase C permanent-block execution. Blocks 01-16 and packaging were therefore NOT_RUN.

Classification: `HARNESS_ERROR`.

## Root cause

The executable used for RERUN13 did not implement/execute the required continuation from accepted substrate into permanent Phase C, Phase D and Phase E. The presence of the substrate PASS marker was incorrectly treated as a terminal condition by the actual runner.

This is not a production failure, browser-environment failure, worker failure or candidate failure.

## Mandatory correction

The next integrated runner MUST be a new RERUN14-specific executable. Reusing `RERUN11_INTEGRATED_RUNNER.mjs`, `RERUN12_INTEGRATED_RUNNER.mjs`, or any prior partial runner as the top-level executable is forbidden.

Before execution, Codex must statically inspect the generated RERUN14 executable and prove all of the following:

1. it has one top-level control flow covering candidate reconstruction, substrate qualification, permanent blocks 01-14, browser block 15, packaging block 16, final report;
2. after accepted substrate PASS there is an unconditional program path into permanent block execution; substrate PASS is not a return/exit/final-report point;
3. Phase C execution is invoked by the top-level function and cannot be skipped when substrate PASS is true;
4. Phase D is invoked only after blocks 01-14 have executed and passed;
5. Phase E/package is invoked only after blocks 01-15 PASS;
6. terminal `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` can be emitted only after block 16 PASS;
7. failure paths explicitly mark later blocks `NOT_RUN` rather than silently falling off the runner;
8. the top-level runner waits/awaits every invoked phase; no detached child or unawaited promise can make the process exit after substrate qualification;
9. the exact runner filename printed in the report must be the RERUN14 executable actually executed;
10. the runner must reject startup if its own static phase manifest does not enumerate phases A-E and permanent blocks 01-16.

The RERUN14 runner must emit progress markers to stdout at phase boundaries for auditability:

- `RERUN14_PHASE_A_CANDIDATE_DONE`
- `RERUN14_PHASE_B_SUBSTRATE_DONE`
- `RERUN14_PHASE_C_BLOCKS_01_14_STARTED`
- `RERUN14_PHASE_C_BLOCKS_01_14_DONE`
- `RERUN14_PHASE_D_BLOCK_15_STARTED`
- `RERUN14_PHASE_D_BLOCK_15_DONE`
- `RERUN14_PHASE_E_BLOCK_16_STARTED`
- `RERUN14_PHASE_E_BLOCK_16_DONE`

For a successful run all eight markers must appear in order. The substrate PASS marker alone is never terminal.

## Unchanged accepted browser architecture

RERUN14 retains the validated RERUN13 browser architecture:

- Node v24.12.0;
- Puppeteer 25.4.0;
- CFT 151.0.7922.47;
- fresh validation-owned CFT copy;
- setup.exe exactly once, success exit code 78;
- fresh validation-only profile;
- validation-only `--no-sandbox` exception under the existing supersession authority;
- no `--disable-gpu-sandbox`;
- raw PAGE adapter, no `browser.newPage()`;
- worker activation without toolbar action/popup;
- selected worker transport may be `PUPPETEER_DIRECT_CDP_CLIENT` if direct `worker.client.send()` qualifies; fallback raw service-worker CDP remains allowed exactly as in RERUN13;
- no `worker.evaluate()` or `worker.evaluateHandle()`;
- zero real Ozon, Performance and ChatGPT network;
- zero operator browser actions;
- no production/candidate/source-CFT modification.

No production behavior, test assertion, security boundary, quota/cache timing, delivery semantics or package rule is weakened by this correction.
